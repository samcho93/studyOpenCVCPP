#!/usr/bin/env node
/* runtime/cvshim.o 만들기 — OpenCV C++ API 구현(runtime/include/cvshim_impl.cpp)을 미리 컴파일한다.
 *   node tools/build-shim.mjs
 * 헤더(runtime/include/opencv2/*.hpp)나 구현을 바꾸면 다시 실행하고, js/cpp-common.mjs 의 SHIM_VERSION 을 올린다.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

if (!process.execArgv.includes('--experimental-wasm-exnref') && !process.env.CPP_CHILD) {
  const r = spawnSync(process.execPath, ['--experimental-wasm-exnref', '--no-warnings', fileURLToPath(import.meta.url), ...process.argv.slice(2)], { stdio: 'inherit', env: { ...process.env, CPP_CHILD: '1' } });
  process.exit(r.status == null ? 1 : r.status);
}
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { runClang } = await import(pathToFileURL(path.join(ROOT, 'runtime/clang/bundle.js')).href);
const { SHIM_FLAGS, includeTree } = await import(pathToFileURL(path.join(ROOT, 'js/cpp-common.mjs')).href);

const readInc = (rel) => fs.readFileSync(path.join(ROOT, 'runtime/include', rel), 'utf8');
const files = includeTree(readInc);
files['cvshim_impl.cpp'] = readInc('cvshim_impl.cpp');
const chunks = [];
const t0 = Date.now();
let out;
try {
  out = await runClang(['clang++', ...SHIM_FLAGS, 'cvshim_impl.cpp', '-o', 'cvshim.o'], files, { stdout: (b) => b && chunks.push(Buffer.from(b)), stderr: (b) => b && chunks.push(Buffer.from(b)) });
} catch (e) {
  console.error(Buffer.concat(chunks).toString() || e);
  process.exit(1);
}
const msg = Buffer.concat(chunks).toString();
if (msg.trim()) console.log(msg);
fs.writeFileSync(path.join(ROOT, 'runtime/cvshim.o'), out['cvshim.o']);
console.log('runtime/cvshim.o', out['cvshim.o'].length, 'bytes,', Date.now() - t0, 'ms');
