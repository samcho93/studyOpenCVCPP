#!/usr/bin/env node
/* C++ 파일 하나 실행해 보기:  node tools/try.mjs 파일.cpp */
import fs from 'node:fs';
import { ensureFlags, runCpp, shutdown } from './node-host.mjs';
ensureFlags(import.meta.url);

const code = fs.readFileSync(process.argv[2] || 0, 'utf8');
const r = await runCpp(code, { stdin: process.env.STDIN || '' });
if (r.compileError) { console.log('컴파일 오류:\n' + r.compileError); process.exit(1); }
if (r.warnings && r.warnings.trim()) console.log('[경고]\n' + r.warnings);
process.stdout.write(r.out);
if (r.err) process.stdout.write('[stderr] ' + r.err);
for (const n of r.notes || []) console.log('[note] ' + n);
for (const i of r.images || []) console.log(`[imshow] ${i.name} ${i.w}x${i.h}x${i.ch} (${i.frames}프레임)`);
for (const f of r.written || []) console.log(`[file] ${f.name} ${f.size}B`);
console.log(`[exit ${r.exit}${r.trap ? ' ' + r.trap : ''}] compile ${r.compileMs}ms run ${r.ms}ms`);
shutdown();
