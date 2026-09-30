/* Node 실행 워커 (검증 도구 · 테스트 공용): OpenCV.js 를 한 번 불러 두고 컴파일된 프로그램을 차례로 실행한다 */
const { parentPort } = require('node:worker_threads');
const path = require('node:path');
const fs = require('node:fs');
const zlib = require('node:zlib');
const ROOT = path.join(__dirname, '..');
globalThis.CsHostZlib = { deflate: (d) => new Uint8Array(zlib.deflateSync(d)), inflate: (d) => new Uint8Array(zlib.inflateSync(d)) };
const Host = require(path.join(ROOT, 'js/cv-host.js'));
const CvBridge = require(path.join(ROOT, 'js/cv-bridge.js'));
const WasiRuntime = require(path.join(ROOT, 'js/wasi.js'));
const cv = require(path.join(ROOT, 'runtime/opencv.js'));

const assets = new Map();
for (const f of fs.readdirSync(path.join(ROOT, 'assets/images'))) if (/\.png$/i.test(f)) assets.set('images/' + f, { png: new Uint8Array(fs.readFileSync(path.join(ROOT, 'assets/images', f))) });

const ready = (async () => {
  const t0 = Date.now();
  while (!cv.Mat && Date.now() - t0 < 60000) await new Promise((r) => setTimeout(r, 20));
  try { delete cv.then; } catch (e) { /* 무시 */ }
})();

parentPort.on('message', async (m) => {
  await ready;
  const vfs = new Host.VirtualFs();
  for (const [k, v] of assets) vfs.files.set(k, v);
  let out = '', err = '';
  const images = new Map(), notes = [], written = [];
  const dec = { 1: new TextDecoder(), 2: new TextDecoder() };
  vfs.onWrite = (p, bytes) => written.push({ name: p, size: bytes.length });
  const video = Host.makeVideoHost(vfs);
  const host = {
    write: (s, t) => { if (s === 'e') err += t; else out += t; },
    note: (t) => notes.push(t),
    imshow: (name, w, h, ch, bytes) => {
      const e = images.get(name) || { name, frames: 0 };
      Object.assign(e, { w, h, ch });
      if (m.keepImages) e.bytes = Buffer.from(bytes).toString('base64');
      e.frames++;
      images.set(name, e);
    },
    waitKey: () => -1,
    destroyWindow: () => {},
    fs: vfs, encodePng: Host.encodePng, decodePng: Host.decodePng,
    videoOpen: video.videoOpen, videoRead: video.videoRead
  };
  const bridge = CvBridge.create({ cv, host });
  bridge.reset();
  const enc = new TextEncoder();
  let pre = m.stdin ? enc.encode(m.stdin) : null;
  const wfiles = Object.assign({}, m.files || {});
  for (const [k, v] of vfs.files) { const b = v.bytes || v.png; if (b && !wfiles[k]) wfiles[k] = b; }
  const wasi = new WasiRuntime({
    args: ['main'], files: wfiles,
    write: (fd, b) => {
      const t = dec[fd === 2 ? 2 : 1].decode(b, { stream: true });
      if (fd === 2) err += t; else out += t;
      if (out.length > 400000) throw new WasiRuntime.ExitError(137);
    },
    readStdin: () => { const p = pre; pre = null; return p; },
    sleep: () => {}
  });
  const t0 = Date.now();
  let exit = 0, trap = null;
  try {
    const mod = await WebAssembly.compile(m.wasm);
    const inst = await WebAssembly.instantiate(mod, { wasi_snapshot_preview1: wasi.imports, cv: bridge.imports });
    bridge.setMemory(inst.exports.memory);
    exit = wasi.start(inst);
  } catch (e) {
    if (e && e.isExit) exit = e.code;
    else { exit = 134; trap = String(e && e.message || e); }
  }
  bridge.dispose();
  for (const fd of [1, 2]) { const t = dec[fd].decode(); if (fd === 2) err += t; else out += t; }
  parentPort.postMessage({ out, err, exit, trap, ms: Date.now() - t0, images: [...images.values()], notes, written });
});
