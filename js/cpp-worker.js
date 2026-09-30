/* C++ 컴파일 워커 (모듈 워커)
 *  - runtime/clang/ 의 Clang/LLD(WebAssembly)로 C++ 소스를 WebAssembly 프로그램으로 컴파일한다.
 *  - 처음 한 번 컴파일러(약 110MB)를 내려받으며, 이후에는 브라우저 캐시를 사용한다.
 */
import { runClang } from '../runtime/clang/bundle.js';
import { makeCompiler } from './cpp-common.mjs';

let lastPct = -1;
const progress = ({ totalLength, doneLength }) => {
  const pct = Math.min(100, Math.floor(doneLength / totalLength * 100));
  if (pct !== lastPct) {
    lastPct = pct;
    postMessage({ type: 'status', message: `C++ 컴파일러 내려받는 중… ${pct}% (${(doneLength / 1048576).toFixed(0)} / ${(totalLength / 1048576).toFixed(0)}MB)`, pct });
    if (pct === 100) postMessage({ type: 'status', message: 'C++ 컴파일러 시작 중…', pct });
  }
};
const compile = makeCompiler(runClang, progress);

self.onmessage = async (e) => {
  const m = e.data;
  if (m.type === 'init') {
    try {
      postMessage({ type: 'status', message: 'C++ 컴파일러 준비 중…' });
      const r = await compile('#include <iostream>\nint main() { std::cout << "ok"; }\n');
      if (!r.ok) throw new Error(r.message || '준비 실패');
      postMessage({ type: 'ready' });
    } catch (err) {
      postMessage({ type: 'error', message: String(err && err.message || err) });
    }
  } else if (m.type === 'compile') {
    let r;
    try { r = await compile(m.code, m.opts); } catch (err) { r = { ok: false, phase: 'server', message: String(err && err.message || err), diagnostics: [] }; }
    postMessage({ type: 'compiled', rid: m.rid, result: r }, r.wasm ? [r.wasm.buffer] : []);
  }
};
