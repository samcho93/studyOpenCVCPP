/* 브라우저 C++ · OpenCV 실행 엔진 (메인 화면 쪽)
 *  window.CvEngine = { state, message, onChange, load(), compile(code), run({wasm, data, stdin, onOutput, onImage, onCloseWindow, onWaitInput, onFile, onNote}),
 *                      input(text), eof(), key(code), stop(), files, opencv }
 *  - 컴파일 워커(js/cpp-worker.js): Clang/LLD(WebAssembly) — 한 번 준비해 두고 계속 사용
 *  - 실행 워커(js/cv-run-worker.js): OpenCV.js 5.0 + WASI — 한 번 준비해 두고 계속 사용 (강제 중지하면 다시 만든다)
 */
(function () {
  const VERSION = '20260930a';
  const base = location.href.replace(/[?#].*$/, '').replace(/[^/]*$/, '');
  const E = {
    state: 'idle', message: '', pct: 0, loadMs: 0, listeners: [], opencv: '5.0',
    onChange(fn) { this.listeners.push(fn); fn(this); },
    set(state, message, pct) {
      this.state = state; this.message = message || ''; if (pct != null) this.pct = pct;
      this.listeners.forEach((f) => { try { f(this); } catch (e) { /* 무시 */ } });
    },
    supported() { return typeof Worker !== 'undefined' && typeof WebAssembly === 'object'; },
    interactive() { return typeof SharedArrayBuffer === 'function' && !!self.crossOriginIsolated; },
    version: VERSION
  };
  E.mode = E.interactive() ? 'sab' : 'none';

  /** WebAssembly 예외 처리(exnref) 지원 여부 — Chrome/Edge 137+, Firefox 131+, Safari 18.4+ */
  E.exnSupported = (function () {
    try { return WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 105])); } catch (e) { return false; }
  })();

  // ------------------------------------------------------------------ 컴파일 워커
  let cw = null, cwReady = null, rid = 0;
  const pending = {};
  function loadCompiler() {
    if (cwReady) return cwReady;
    cwReady = new Promise((resolve, reject) => {
      cw = new Worker(`${base}js/cpp-worker.js?v=${VERSION}`, { type: 'module' });
      cw.onmessage = (e) => {
        const m = e.data;
        if (m.type === 'status') { E.cMsg = m.message; E.cPct = m.pct; report(); }
        else if (m.type === 'ready') { E.cOk = true; report(); resolve(); }
        else if (m.type === 'error') reject(new Error(m.message));
        else if (m.type === 'compiled') { const p = pending[m.rid]; if (p) { delete pending[m.rid]; p(m.result); } }
      };
      cw.onerror = (e) => reject(new Error(e.message || '컴파일 워커를 시작하지 못했습니다 (모듈 워커 미지원 브라우저?)'));
      cw.postMessage({ type: 'init' });
    }).catch((err) => { cwReady = null; if (cw) { cw.terminate(); cw = null; } throw err; });
    return cwReady;
  }

  // ------------------------------------------------------------------ 실행 워커
  let rw = null, rwReady = null, current = null;
  let sab = null, ctrl = null, data = null, keyBuf = null;
  function loadRunner() {
    if (rwReady) return rwReady;
    rwReady = new Promise((resolve, reject) => {
      rw = new Worker(`${base}js/cv-run-worker.js?v=${VERSION}`);
      rw.onmessage = (e) => handle(e.data, resolve, reject);
      rw.onerror = (e) => { reject(new Error(e.message || '실행 워커 오류')); if (current) { const c = current; current = null; c.done({ exit: 134, trap: e.message || '실행 워커 오류', ms: 0 }); } };
      if (E.mode === 'sab') {
        sab = new SharedArrayBuffer(16 + 65536 + 256);
        ctrl = new Int32Array(sab, 0, 4); data = new Uint8Array(sab, 16, 65536); keyBuf = new Int32Array(sab, 16 + 65536, 64);
      }
      rw.postMessage({ type: 'init' });
    }).catch((err) => { rwReady = null; if (rw) { rw.terminate(); rw = null; } throw err; });
    return rwReady;
  }
  function handle(m, resolve, reject) {
    const c = current;
    switch (m.type) {
      case 'status': E.rMsg = m.text; report(); break;
      case 'ready': E.rOk = true; report(); resolve(); if (userFiles.size) syncFiles(); break;
      case 'initError': reject(new Error(m.message)); break;
      case 'out': if (c) c.onOutput(m.stream, m.text); break;
      case 'note': if (c && c.onNote) c.onNote(m.text); break;
      case 'image': if (c && c.onImage) c.onImage(m.name, m.w, m.h, m.ch, new Uint8Array(m.bytes)); break;
      case 'closeWindow': if (c && c.onCloseWindow) c.onCloseWindow(m.name); break;
      case 'waitInput': if (c && c.onWaitInput) c.onWaitInput(m.on); break;
      case 'file': {
        const bytes = new Uint8Array(m.bytes);
        userFiles.set(m.path, { bytes, raw: m.raw });
        if (c && c.onFile) c.onFile(m.path, bytes, m.raw);
        document.dispatchEvent(new CustomEvent('csfiles'));
        break;
      }
      case 'done': if (c) { current = null; c.done({ exit: m.exit, trap: m.trap, ms: m.ms, killed: m.stopped }); } break;
      default: break;
    }
  }
  function report() {
    if (E.cOk && E.rOk) { E.loadMs = Math.round(performance.now() - E._t0); E.set('ready', '준비 완료', 100); return; }
    E.set('loading', E.cOk ? (E.rMsg || 'OpenCV 준비 중…') : (E.cMsg || 'C++ 컴파일러 준비 중…'), E.cPct);
  }

  let loadP = null;
  E.load = function () {
    if (loadP) return loadP;
    E._t0 = performance.now();
    E.set('loading', 'C++ 컴파일러 · OpenCV 준비 중…', 0);
    loadP = Promise.all([loadCompiler(), loadRunner()]).then(() => report()).catch((err) => {
      loadP = null;
      E.set('error', String(err && err.message || err));
      throw err;
    });
    return loadP;
  };

  /** @returns {Promise<{ok, wasm?, data, diagnostics, message, compileMs, phase?}>} */
  E.compile = async function (code, opts) {
    await loadCompiler();
    return new Promise((resolve) => {
      const id = 'c' + (++rid);
      pending[id] = resolve;
      cw.postMessage({ type: 'compile', rid: id, code, opts: opts || {} });
    });
  };

  // ------------------------------------------------------------------ 예제 이미지 (PNG → 픽셀, 메인 화면에서 디코딩)
  let manifest = null;
  const rawCache = new Map();
  async function loadManifest() {
    if (manifest) return manifest;
    try { const r = await fetch(base + 'assets/manifest.json', { cache: 'no-cache' }); manifest = r.ok ? await r.json() : []; } catch (e) { manifest = []; }
    return manifest;
  }
  E.loadManifest = loadManifest;
  /** RGBA → 회색이면 1채널, 아니면 BGR 3채널 (알파가 있으면 BGRA) */
  function rgbaToRaw(w, h, d) {
    const n = w * h;
    let gray = true, alpha = false;
    for (let i = 0, j = 0; i < n; i++, j += 4) { if (d[j] !== d[j + 1] || d[j] !== d[j + 2]) gray = false; if (d[j + 3] !== 255) alpha = true; if (!gray && alpha) break; }
    if (alpha) { const b = new Uint8Array(n * 4); for (let i = 0, j = 0; i < n; i++, j += 4) { b[j] = d[j + 2]; b[j + 1] = d[j + 1]; b[j + 2] = d[j]; b[j + 3] = d[j + 3]; } return { w, h, ch: 4, bytes: b }; }
    if (gray) { const b = new Uint8Array(n); for (let i = 0, j = 0; i < n; i++, j += 4) b[i] = d[j]; return { w, h, ch: 1, bytes: b }; }
    const b = new Uint8Array(n * 3); for (let i = 0, j = 0, k = 0; i < n; i++, j += 4, k += 3) { b[k] = d[j + 2]; b[k + 1] = d[j + 1]; b[k + 2] = d[j]; } return { w, h, ch: 3, bytes: b };
  }
  E.rgbaToRaw = rgbaToRaw;
  async function decodeBlob(blob) {
    const bmp = await createImageBitmap(blob, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
    const canvas = document.createElement('canvas'); canvas.width = bmp.width; canvas.height = bmp.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(bmp, 0, 0);
    return rgbaToRaw(bmp.width, bmp.height, ctx.getImageData(0, 0, bmp.width, bmp.height).data);
  }
  async function decodeAsset(path) {
    if (rawCache.has(path)) return rawCache.get(path);
    const r = await fetch(base + 'assets/' + path);
    if (!r.ok) return null;
    const blob = await r.blob();
    const entry = { raw: await decodeBlob(blob), png: new Uint8Array(await blob.arrayBuffer()) };
    rawCache.set(path, entry);
    return entry;
  }
  /** 코드에 나오는 images/… 파일 (문자열 · 반복 패턴 포함) */
  async function assetsFor(code) {
    const list = await loadManifest();
    const want = new Set();
    const re = /["']((?:images|data)\/[^"'\n%{]+)["']/g;
    let m;
    while ((m = re.exec(code))) { const p = m[1]; if (list.includes(p)) want.add(p); else if (p.endsWith('/') || p.endsWith('_')) list.filter((f) => f.startsWith(p)).forEach((f) => want.add(f)); }
    if (/conveyor|VideoCapture|camera/i.test(code)) list.filter((f) => /conveyor_/.test(f)).forEach((f) => want.add(f));
    if (/"images\/"\s*\+|format\(\s*"images\/[^"]*%|"images\/[^"]*"\s*\+|glob\(|to_string\([^)]*\)\s*\+\s*"\.png"/.test(code)) list.filter((f) => f.startsWith('images/')).forEach((f) => want.add(f));
    const files = [];
    await Promise.all([...want].map(async (p) => { const e = await decodeAsset(p); if (e) files.push({ path: p, raw: e.raw, png: e.png }); }));
    return files;
  }
  E.assetsFor = assetsFor;

  // ------------------------------------------------------------------ 실행
  /**
   * 컴파일된 프로그램 실행
   * @returns {Promise<{exit, ms, trap?, killed?}>}
   */
  E.run = async function (h) {
    await loadRunner();
    if (current) { E.stop(); await new Promise((r) => setTimeout(r, 50)); await loadRunner(); }
    const files = await assetsFor(h.code || '');
    if (ctrl) { Atomics.store(ctrl, 0, 0); Atomics.store(ctrl, 1, 0); Atomics.store(ctrl, 2, 0); Atomics.store(ctrl, 3, 0); }
    return new Promise((resolve) => {
      current = Object.assign({ onOutput: () => {} }, h, { done: resolve });
      const wasm = h.wasm.buffer.byteLength === h.wasm.byteLength ? h.wasm.buffer.slice(0) : h.wasm.slice().buffer;
      rw.postMessage({ type: 'run', wasm, files, data: h.data || {}, stdin: h.stdin || '', sab }, [wasm]);
    });
  };
  E.running = () => !!current;
  E.input = function (text) {
    if (!ctrl || !current) return;
    const bytes = new TextEncoder().encode(String(text).replace(/\n$/, ''));
    data.set(bytes.subarray(0, 65536), 0);
    Atomics.store(ctrl, 1, Math.min(bytes.length, 65536));
    Atomics.store(ctrl, 0, 1); Atomics.notify(ctrl, 0);
  };
  E.eof = function () { if (!ctrl) return; Atomics.store(ctrl, 1, -1); Atomics.store(ctrl, 0, 1); Atomics.notify(ctrl, 0); };
  E.key = function (code) { if (!ctrl) return; const n = Atomics.load(ctrl, 2); if (n >= 64) return; Atomics.store(keyBuf, n, code); Atomics.store(ctrl, 2, n + 1); };
  /** 중지: 중지 요청 → waitKey · imshow · 입력 대기에서 멈추면 워커 유지, 계산 중이면 워커를 끝내고 다시 준비 */
  E.stop = function () {
    if (!current) return;
    const cur = current;
    if (ctrl) { Atomics.store(ctrl, 3, 1); Atomics.notify(ctrl, 0); }
    setTimeout(() => {
      if (current !== cur) return;
      current = null;
      try { rw.terminate(); } catch (e) { /* 무시 */ }
      rw = null; rwReady = null; E.rOk = false;
      cur.done({ exit: 143, ms: 0, killed: true });
      loadRunner().catch(() => {});
    }, ctrl ? 400 : 0);
  };

  // ------------------------------------------------------------------ 작업 폴더 (예제 이미지 + 업로드 · 프로그램이 저장한 파일)
  const userFiles = new Map();   // path → {bytes, raw?}
  function syncFiles() {
    if (!rw) return;
    rw.postMessage({ type: 'files', files: [...userFiles.entries()].map(([p, f]) => ({ path: p, raw: f.raw && f.raw.bytes ? f.raw : null, bytes: f.bytes })) });
  }
  E.files = {
    async list() { const assets = await loadManifest(); const out = assets.map((n) => ({ name: n, asset: true })); for (const [p, f] of userFiles) out.push({ name: p, size: f.bytes.length, raw: f.raw }); return out; },
    async read(name) { if (userFiles.has(name)) return userFiles.get(name).bytes; const r = await fetch(base + 'assets/' + name); return r.ok ? new Uint8Array(await r.arrayBuffer()) : null; },
    async upload(file) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      let raw = null;
      if (/\.(png|jpe?g|bmp|gif|webp)$/i.test(file.name)) { try { raw = await decodeBlob(new Blob([bytes])); } catch (e) { raw = null; } }
      userFiles.set(file.name, raw ? { bytes, raw } : { bytes });
      if (rw) rw.postMessage({ type: 'files', files: [{ path: file.name, raw, bytes }] });
      document.dispatchEvent(new CustomEvent('csfiles'));
      return file.name;
    },
    remove(name) { userFiles.delete(name); if (rw) rw.postMessage({ type: 'removeFile', path: name }); document.dispatchEvent(new CustomEvent('csfiles')); },
    clear() { userFiles.clear(); if (rw) rw.postMessage({ type: 'clearFiles' }); document.dispatchEvent(new CustomEvent('csfiles')); },
    has(name) { return userFiles.has(name); },
    userEntries() { return [...userFiles.entries()]; }
  };

  window.CvEngine = E;
})();
