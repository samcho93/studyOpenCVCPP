/* C++ 프로그램 실행 워커 (OpenCV.js 5.0 을 한 번 불러 두고 계속 사용)
 *  메인 → 워커: {type:'init'}, {type:'run', wasm, files, userFiles, stdin, sab}, {type:'listFiles'|'readFile'|'clearFiles'}
 *  워커 → 메인: status, ready, initError, out, image, closeWindow, waitInput, note, file, done
 *  - 표준 입출력 · 파일은 WASI(js/wasi.js), OpenCV 함수는 js/cv-bridge.js → OpenCV.js
 *  - 실행 중 입력(cin) · 키(waitKey) · 중지는 SharedArrayBuffer 로 주고받는다
 */
'use strict';
const base = self.location.href.replace(/\/js\/[^/]*$/, '/');
importScripts(base + 'js/wasi.js', base + 'js/cv-host.js', base + 'js/cv-bridge.js');
let cv = null, ready = false;
const vfs = new self.CsHost.VirtualFs();

async function init() {
  postMessage({ type: 'status', text: 'OpenCV.js 5.0 내려받는 중… (약 16MB, 처음 한 번)' });
  const t0 = performance.now();
  self.Module = { onRuntimeInitialized() {} };
  importScripts(base + 'runtime/opencv.js');
  await new Promise((resolve) => {
    const poll = () => { if (self.cv && self.cv.Mat) resolve(); else setTimeout(poll, 30); };
    poll();
  });
  cv = self.cv;
  try { delete cv.then; } catch (e) { /* 무시 */ }
  ready = true;
  postMessage({ type: 'ready', ms: Math.round(performance.now() - t0) });
}

// ---------------------------------------------------------------- 입력 · 키 · 중지 (SharedArrayBuffer)
let ctrl = null, data = null, keyBuf = null;
function setupSab(buf) {
  if (!buf) { ctrl = null; return; }
  ctrl = new Int32Array(buf, 0, 4);        // [0]=입력 상태(0 대기, 1 준비), [1]=길이(-1=EOF), [2]=키 개수, [3]=중지 요청
  data = new Uint8Array(buf, 16, 65536);
  keyBuf = new Int32Array(buf, 16 + 65536, 64);
}
const stopped = () => ctrl && Atomics.load(ctrl, 3);
function checkStop() { if (stopped()) throw new self.WasiRuntime.ExitError(130); }
function sleepMs(ms) {
  if (ms <= 0) return;
  if (ctrl) {
    const end = performance.now() + ms;
    while (performance.now() < end) { Atomics.wait(ctrl, 0, Atomics.load(ctrl, 0), Math.max(1, Math.min(50, end - performance.now()))); checkStop(); }
  } else { const end = performance.now() + Math.min(ms, 2000); while (performance.now() < end) { /* 바쁜 대기 */ } }
}
function popKey() {
  if (!ctrl) return -1;
  const n = Atomics.load(ctrl, 2);
  if (n <= 0) return -1;
  const k = Atomics.load(keyBuf, 0);
  for (let i = 1; i < n; i++) Atomics.store(keyBuf, i - 1, Atomics.load(keyBuf, i));
  Atomics.store(ctrl, 2, n - 1);
  return k;
}

// ---------------------------------------------------------------- 실행
async function run(m) {
  const t0 = performance.now();
  for (const f of m.files || []) vfs.add(f.path, f.raw ? { raw: f.raw, png: f.png || null } : { bytes: f.bytes });
  setupSab(m.sab || null);
  const enc = new TextEncoder();
  const decs = { 1: new TextDecoder(), 2: new TextDecoder() };
  // 출력 버퍼 (너무 잦은 postMessage 방지)
  let buf = [], bufLen = 0, total = 0, last = performance.now();
  const flush = () => { if (buf.length) { buf.forEach(([s, t]) => postMessage({ type: 'out', stream: s, text: t })); buf = []; bufLen = 0; last = performance.now(); } };
  const push = (s, text) => {
    if (!text) return;
    if (buf.length && buf[buf.length - 1][0] === s) buf[buf.length - 1][1] += text; else buf.push([s, text]);
    bufLen += text.length; total += text.length;
    if (total > 1000000) { flush(); postMessage({ type: 'note', text: '출력이 너무 많아(100만 자 초과) 실행을 멈췄습니다. 무한 반복이 아닌지 확인하세요.' }); throw new self.WasiRuntime.ExitError(137); }
    if (bufLen > 8192 || performance.now() - last > 50) flush();
  };
  const video = self.CsHost.makeVideoHost(vfs);
  const host = {
    write: (s, t) => push(s === 'e' ? 'e' : 'o', t),
    note: (t) => { flush(); postMessage({ type: 'note', text: t }); },
    imshow: (name, w, h, ch, bytes) => { flush(); checkStop(); const copy = new Uint8Array(bytes); postMessage({ type: 'image', name, w, h, ch, bytes: copy.buffer }, [copy.buffer]); },
    waitKey: (ms) => { flush(); checkStop(); if (ms > 0) sleepMs(ms); else sleepMs(1); return popKey(); },
    destroyWindow: (name) => postMessage({ type: 'closeWindow', name: name === '*' ? null : name }),
    fs: vfs, encodePng: self.CsHost.encodePng, decodePng: self.CsHost.decodePng,
    videoOpen: video.videoOpen, videoRead: video.videoRead
  };
  vfs.onWrite = (p, bytes, raw) => { flush(); const copy = new Uint8Array(bytes); postMessage({ type: 'file', path: p, bytes: copy.buffer, raw: raw ? { w: raw.w, h: raw.h, ch: raw.ch } : null }, [copy.buffer]); };
  const bridge = self.CvBridge.create({ cv, host });
  bridge.reset();

  // 표준 입력
  let pre = m.stdin ? enc.encode(m.stdin) : null;
  let warned = false;
  const readStdin = () => {
    if (pre) { const p = pre; pre = null; return p; }
    flush();
    if (!ctrl) { if (!warned) { warned = true; postMessage({ type: 'note', text: '입력이 더 없습니다(EOF). 실행 중 입력은 교차 출처 격리가 켜진 페이지에서만 됩니다.' }); } return null; }
    postMessage({ type: 'waitInput', on: true });
    Atomics.store(ctrl, 0, 0);
    while (Atomics.load(ctrl, 0) === 0) { Atomics.wait(ctrl, 0, 0, 200); checkStop(); }
    const len = Atomics.load(ctrl, 1);
    postMessage({ type: 'waitInput', on: false });
    Atomics.store(ctrl, 0, 0);
    if (len < 0) return null;
    const line = data.slice(0, len);
    const out = new Uint8Array(line.length + 1); out.set(line); out[line.length] = 10;
    return out;
  };
  // 작업 폴더의 파일(업로드 · 이전 실행 결과)을 C++ 파일(ifstream)로도 읽을 수 있게
  const files = {};
  for (const [k, v] of vfs.files) if (!/^images\//.test(k)) { const b = v.bytes || v.png; if (b) files[k] = b; }
  for (const [k, v] of Object.entries(m.data || {})) files[k] = enc.encode(v.replace(/\n?$/, '\n'));
  const onFileClose = (name, bytes) => { if (bytes && bytes.length != null) vfs.write(name, bytes); };
  const wasi = new self.WasiRuntime({
    args: ['main'], files,
    write: (fd, b) => push(fd === 2 ? 'e' : 'o', decs[fd === 2 ? 2 : 1].decode(b, { stream: true })),
    readStdin, sleep: sleepMs, onFileClose
  });
  let exit = 0, trap = null;
  try {
    const mod = await WebAssembly.compile(m.wasm);
    const inst = await WebAssembly.instantiate(mod, { wasi_snapshot_preview1: wasi.imports, cv: bridge.imports });
    bridge.setMemory(inst.exports.memory);
    exit = wasi.start(inst);
  } catch (err) {
    if (err && err.isExit) exit = err.code;
    else {
      exit = 134;
      trap = String(err && err.message || err);
      if (err instanceof RangeError || /call stack/i.test(trap)) trap = 'stack overflow: ' + trap;
      if (err instanceof WebAssembly.CompileError || err instanceof WebAssembly.LinkError) trap = 'compile: ' + trap;
    }
  }
  try { bridge.dispose(); } catch (e) { /* 무시 */ }
  for (const fd of [1, 2]) { const t = decs[fd].decode(); if (t) push(fd === 2 ? 'e' : 'o', t); }
  flush();
  postMessage({ type: 'done', exit, trap, stopped: exit === 130 && !!stopped(), ms: Math.round(performance.now() - t0) });
}

self.onmessage = (ev) => {
  const m = ev.data;
  if (m.type === 'init') { init().catch((e) => postMessage({ type: 'initError', message: String(e && e.message || e) })); return; }
  if (m.type === 'files') { for (const f of m.files || []) vfs.add(f.path, f.raw ? { raw: f.raw, png: f.png || null } : { bytes: f.bytes }); return; }
  if (m.type === 'removeFile') { vfs.delete(m.path); return; }
  if (m.type === 'clearFiles') { for (const k of [...vfs.files.keys()]) if (!/^images\//.test(k)) vfs.files.delete(k); return; }
  if (m.type === 'run') {
    if (!ready) { postMessage({ type: 'done', exit: 1, trap: '실행 환경이 아직 준비되지 않았습니다', ms: 0 }); return; }
    run(m).catch((e) => postMessage({ type: 'done', exit: 134, trap: String(e && e.message || e), ms: 0 }));
  }
};
