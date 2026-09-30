/* C++ 컴파일 공용 설정 — 브라우저 컴파일 워커(js/cpp-worker.js)와 검증 도구(tools/validate.mjs)가 함께 사용
 *  - Clang/LLD(WebAssembly) 로 사용자 코드를 컴파일하고,
 *  - 미리 컴파일한 OpenCV C++ API 구현(runtime/cvshim.o)과 링크한다.
 */

/** 헤더·구현을 바꾸면 올린다 (브라우저 캐시 무효화) */
export const SHIM_VERSION = '20260930a';

/** 파일 구분 주석:  // ===== File: shape.h ===== */
export const FILE_MARK = /^\s*\/\/\s*=+\s*(?:file|파일)\s*:\s*([\w./-]+?\.(?:cpp|cc|cxx|h|hpp|hh|txt|dat|csv))\s*=*\s*$/i;

/** OpenCV 헤더: 실제 OpenCV 의 헤더 이름을 모두 cvshim.hpp 로 연결한다 */
const STUBS = [
  'opencv.hpp', 'core.hpp', 'imgproc.hpp', 'imgcodecs.hpp', 'highgui.hpp', 'videoio.hpp', 'video.hpp',
  'features.hpp', 'features2d.hpp', 'calib3d.hpp', 'geometry.hpp', 'objdetect.hpp', 'photo.hpp', 'flann.hpp', 'ml.hpp', 'dnn.hpp', 'stitching.hpp',
  'core/core.hpp', 'core/mat.hpp', 'core/types.hpp', 'core/utility.hpp', 'core/cvdef.h', 'core/version.hpp', 'imgproc/imgproc.hpp', 'highgui/highgui.hpp',
  'imgcodecs/imgcodecs.hpp', 'videoio/videoio.hpp', 'video/tracking.hpp', 'video/background_segm.hpp', 'objdetect/objdetect.hpp', 'features2d/features2d.hpp'
];
export const INCLUDE_FILES = ['opencv2/cvshim.hpp'];

/** include 트리(runClang 파일 객체) 만들기 — readInc(상대경로) 는 runtime/include/ 아래 파일 내용을 돌려준다 */
export function includeTree(readInc) {
  const opencv2 = { 'cvshim.hpp': readInc('opencv2/cvshim.hpp') };
  for (const s of STUBS) {
    const parts = s.split('/');
    const rel = parts.length > 1 ? '../cvshim.hpp' : 'cvshim.hpp';
    let dir = opencv2;
    for (let k = 0; k < parts.length - 1; k++) dir = dir[parts[k]] = dir[parts[k]] || {};
    dir[parts[parts.length - 1]] = `#pragma once\n#include "${rel}"\n`;
  }
  return { include: { opencv2 } };
}

const EH = ['-fwasm-exceptions', '-mllvm', '-wasm-use-legacy-eh=false'];
/** OpenCV 구현(cvshim.o) 컴파일 옵션 */
export const SHIM_FLAGS = ['-std=c++17', '-O2', '-fno-color-diagnostics', ...EH, '-Iinclude', '-c'];

/** 처리되지 않은 예외 보고용 도우미 (미리 컴파일해 모든 프로그램에 링크) */
export const RT_NAME = '__study_rt.o';
export const RT_SOURCE = `#include <cstdio>
#include <exception>
#include <typeinfo>
#include <cxxabi.h>
#include <cstdlib>
extern "C" void* __cxa_begin_catch(void*) noexcept;
static const char* demangle(const char* n) {
  int st = 0; char* d = abi::__cxa_demangle(n, nullptr, nullptr, &st);
  return st == 0 && d ? d : n;
}
extern "C" __attribute__((export_name("__study_uncaught"))) void study_uncaught(void* ue) {
  std::fflush(stdout);
  __cxa_begin_catch(ue);
  try { throw; }
  catch (const std::exception& e) {
    std::fprintf(stderr, "terminate called after throwing an instance of '%s'\\n  what():  %s\\n", demangle(typeid(e).name()), e.what());
  } catch (...) {
    std::type_info* t = abi::__cxa_current_exception_type();
    std::fprintf(stderr, "terminate called after throwing an instance of '%s'\\n", t ? demangle(t->name()) : "?");
  }
  std::fflush(stderr);
}
`;
export const RT_FLAGS = ['-std=c++17', '-O1', '-fno-color-diagnostics', ...EH, '-c'];

/** 사용자 코드 컴파일 옵션 (C++17 = OpenCV 5 요구 사항, WebAssembly 예외 처리, 8MB 스택, 최대 1GB 메모리) */
export function CXXFLAGS(opts = {}) {
  return [
    '-std=' + (opts.std || 'c++17'),
    '-O1',
    '-fno-color-diagnostics',
    ...EH,
    '-Iinclude',
    '-lunwind',
    '-Wl,-z,stack-size=8388608',
    '-Wl,--stack-first',
    '-Wl,--max-memory=1073741824',
    '-Wl,--export=__cpp_exception',
    ...(opts.flags || [])
  ];
}

/**
 * 편집기 코드 → 컴파일용 파일 목록
 * 파일 구분 주석이 없으면 main.cpp 하나. 있으면 각 파일로 나눈다. (.txt 등은 데이터 파일 → 실행 때 작업 폴더에 넣음)
 */
export function splitFiles(code) {
  const lines = String(code || '').replace(/\r\n/g, '\n').split('\n');
  const files = {};
  const data = {};
  const map = [];
  let cur = null;
  let buf = [];
  const flush = () => {
    if (cur == null) {
      if (buf.join('').trim()) { files['main.cpp'] = buf.join('\n'); map.push({ name: 'main.cpp', start: 1 }); }
    } else if (/\.(txt|dat|csv)$/i.test(cur)) data[cur] = buf.join('\n');
    else files[cur] = buf.join('\n');
  };
  lines.forEach((l, i) => {
    const m = FILE_MARK.exec(l);
    if (m) {
      flush();
      cur = m[1].replace(/^\.?\/+/, '');
      buf = [];
      map.push({ name: cur, start: i + 2 });
    } else buf.push(l);
  });
  flush();
  if (!Object.keys(files).length) files['main.cpp'] = '';
  const sources = Object.keys(files).filter((f) => /\.(cpp|cc|cxx)$/i.test(f));
  if (!sources.length) sources.push(Object.keys(files)[0]);
  return { files, sources, data, map };
}

/** clang 진단 메시지 → [{file, line, col, kind, message, editorLine, system}] */
export function parseDiagnostics(text, code) {
  const { map } = splitFiles(code);
  const out = [];
  let cur = null;
  const RE = /^(.+?):(\d+):(\d+): (error|warning|fatal error|note): (.*)$/;
  for (const line of String(text || '').split('\n')) {
    const m = RE.exec(line);
    if (m) {
      const file = m[1].replace(/^\.\//, '');
      const kind = m[4] === 'fatal error' ? 'error' : m[4];
      const f = map.find((x) => x.name === file);
      const system = file.startsWith('/') || file.startsWith('include/');
      cur = { file, line: +m[2], col: +m[3], kind, message: m[5], editorLine: f ? f.start + (+m[2]) - 1 : (system ? 0 : +m[2]), system };
      out.push(cur);
    } else if (cur && line && !/^\d+ (errors?|warnings?)( and \d+ (errors?|warnings?))? generated\.$/.test(line) && !/^In file included from/.test(line)) {
      cur.message += '\n' + line;
    }
  }
  return out;
}

/**
 * runClang 으로 컴파일 함수 만들기 (브라우저 워커와 검증 도구가 공유)
 * @param env {{ readInclude: (rel)=>Promise<string>|string, readShim: ()=>Promise<Uint8Array|null>|Uint8Array|null, fetchProgress? }}
 * @returns {(code:string, opts?:object) => Promise<{ok, wasm?, data, message, diagnostics, compileMs}>}
 */
export function makeCompiler(runClang, env) {
  let rt = null, shim = null, inc = null;
  const run = async (args, files) => {
    const chunks = [];
    const collect = (b) => { if (b) chunks.push(new Uint8Array(b)); };
    const text = () => new TextDecoder().decode(concat(chunks));
    try {
      const out = await runClang(args, files, { stdout: collect, stderr: collect, decodeASCII: false });
      return { ok: true, out, message: text() };
    } catch (e) {
      const t = text();
      return { ok: false, message: t || String(e && e.message || e), crashed: !t };
    }
  };
  async function prepare() {
    if (!inc) {
      const texts = {};
      for (const f of INCLUDE_FILES) texts[f] = await env.readInclude(f);
      inc = includeTree((rel) => texts[rel]);
    }
    if (!rt) {
      if (env.fetchProgress) await runClang(null, {}, { fetchProgress: env.fetchProgress });
      const r = await run(['clang++', ...RT_FLAGS, '__study_rt.cpp', '-o', RT_NAME], { '__study_rt.cpp': RT_SOURCE });
      if (!r.ok) throw new Error('도우미 컴파일 실패: ' + r.message);
      rt = r.out[RT_NAME];
    }
    if (!shim) {
      shim = env.readShim ? await env.readShim() : null;
      if (!shim) {
        // 미리 만든 cvshim.o 가 없으면 직접 컴파일 (수십 초 걸림)
        const files = Object.assign({}, inc, { 'cvshim_impl.cpp': await env.readInclude('cvshim_impl.cpp') });
        const r = await run(['clang++', ...SHIM_FLAGS, 'cvshim_impl.cpp', '-o', 'cvshim.o'], files);
        if (!r.ok) throw new Error('OpenCV 구현 컴파일 실패: ' + r.message);
        shim = r.out['cvshim.o'];
      }
    }
  }
  return async function compile(code, opts = {}) {
    const t0 = Date.now();
    try { await prepare(); } catch (e) { return { ok: false, phase: 'server', message: String(e && e.message || e), diagnostics: [] }; }
    const { files, sources, data } = splitFiles(code);
    Object.assign(files, inc);
    files[RT_NAME] = rt;
    files['cvshim.o'] = shim;
    const r = await run(['clang++', ...CXXFLAGS(opts), ...sources, RT_NAME, 'cvshim.o', '-o', 'main.wasm'], files);
    const diagnostics = parseDiagnostics(r.message, code);
    const compileMs = Date.now() - t0;
    if (!r.ok) return { ok: false, phase: r.crashed ? 'server' : 'compile', message: r.message, diagnostics, compileMs };
    return { ok: true, wasm: r.out['main.wasm'], data, message: r.message, diagnostics, compileMs };
  };
}

function concat(list) {
  const n = list.reduce((a, b) => a + b.length, 0);
  const out = new Uint8Array(n);
  let o = 0;
  for (const b of list) { out.set(b, o); o += b.length; }
  return out;
}
