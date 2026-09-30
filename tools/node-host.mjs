/* Node 에서 C++(OpenCV) 코드를 컴파일 · 실행하는 호스트 (검증 도구 · 테스트 공용)
 *  WebAssembly 예외 처리가 필요하므로 node --experimental-wasm-exnref 로 실행해야 한다 (ensureFlags).
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { Worker } from 'node:worker_threads';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/** 필요한 node 플래그가 없으면 붙여서 스크립트를 다시 실행 */
export function ensureFlags(scriptUrl) {
  if (process.execArgv.includes('--experimental-wasm-exnref') || process.env.CPP_CHILD) return;
  const r = spawnSync(process.execPath, ['--experimental-wasm-exnref', '--no-warnings', fileURLToPath(scriptUrl), ...process.argv.slice(2)], { stdio: 'inherit', env: { ...process.env, CPP_CHILD: '1' } });
  process.exit(r.status == null ? 1 : r.status);
}

let compiler = null;
export async function getCompiler() {
  if (compiler) return compiler;
  const { runClang } = await import(pathToFileURL(path.join(ROOT, 'runtime/clang/bundle.js')).href);
  const { makeCompiler } = await import(pathToFileURL(path.join(ROOT, 'js/cpp-common.mjs')).href);
  const shimPath = path.join(ROOT, 'runtime/cvshim.o');
  compiler = makeCompiler(runClang, {
    readInclude: (rel) => fs.readFileSync(path.join(ROOT, 'runtime/include', rel), 'utf8'),
    readShim: () => (fs.existsSync(shimPath) ? new Uint8Array(fs.readFileSync(shimPath)) : null)
  });
  return compiler;
}

let worker = null, busy = null;
function startWorker() {
  worker = new Worker(path.join(ROOT, 'tools/run-worker.cjs'));
  worker.on('message', (m) => { const b = busy; busy = null; if (b) { clearTimeout(b.timer); b.resolve(m); } });
  worker.on('error', (e) => {
    const b = busy; busy = null;
    if (b) { clearTimeout(b.timer); b.resolve({ out: '', err: '', exit: 134, trap: String(e && e.message || e), images: [], notes: [] }); }
    worker = null;
  });
  worker.unref();
}
/** 컴파일된 wasm 실행 */
export function runWasm(wasm, opts = {}) {
  if (!worker) startWorker();
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      const b = busy; busy = null;
      try { worker.terminate(); } catch (e) { /* 무시 */ }
      worker = null;
      if (b) b.resolve({ out: '', err: '', exit: 124, trap: 'timeout', images: [], notes: [], timeout: true });
    }, opts.timeoutMs || 30000);
    busy = { resolve, timer };
    worker.postMessage({ wasm, stdin: opts.stdin || '', files: opts.files || {}, keepImages: !!opts.keepImages });
  });
}
/** C++ 코드 컴파일 + 실행 */
export async function runCpp(code, opts = {}) {
  const compile = await getCompiler();
  const c = await compile(code, opts);
  if (!c.ok) return { compileError: c.message, diagnostics: c.diagnostics, phase: c.phase };
  const enc = new TextEncoder();
  const files = {};
  for (const [k, v] of Object.entries(c.data || {})) files[k] = enc.encode(v.replace(/\n?$/, '\n'));
  const r = await runWasm(c.wasm, { ...opts, files });
  r.compileMs = c.compileMs;
  r.warnings = c.message;
  return r;
}
export function shutdown() { if (worker) { worker.terminate(); worker = null; } }
