#!/usr/bin/env node
/* 차시 파일 검증:  node tools/validate.mjs [cv07 ...] [--print] [--quiet] [--no-cache]
 *  - lessons/*.js 를 불러 스키마를 확인하고,
 *  - 모든 C++ 코드를 브라우저와 같은 컴파일러(Clang WebAssembly) + OpenCV C++ API + OpenCV.js 로 컴파일 · 실행해 expect 와 비교한다.
 *  - 결과는 tools/.cache/ 에 저장해 바뀌지 않은 코드는 다시 실행하지 않는다 (--no-cache 로 끔).
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { ensureFlags, runCpp, getCompiler, shutdown, ROOT } from './node-host.mjs';
ensureFlags(import.meta.url);

const args = process.argv.slice(2);
const print = args.includes('--print');
const quiet = args.includes('--quiet');
const noCache = args.includes('--no-cache');
const ids = args.filter((a) => !a.startsWith('--'));

const { SHIM_VERSION } = await import('../js/cpp-common.mjs');
const shimStamp = SHIM_VERSION + ':' + fs.statSync(path.join(ROOT, 'runtime/cvshim.o')).mtimeMs + ':' + fs.statSync(path.join(ROOT, 'js/cv-bridge.js')).mtimeMs;
const CACHE_DIR = path.join(ROOT, 'tools/.cache');
fs.mkdirSync(CACHE_DIR, { recursive: true });
const cacheKey = (c) => crypto.createHash('sha1').update(shimStamp + '\0' + (c.compileOnly ? 'C' : 'R') + '\0' + c.code + '\0' + (c.stdin || '')).digest('hex');

// course.js + lessons 로드 (브라우저 전역 흉내)
const sandbox = { console };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'course.js'), 'utf8'), sandbox, { filename: 'course.js' });
const C = sandbox.window.CV_COURSE;
const targets = ids.length ? ids : C.order.map((o) => o.id).filter((id) => fs.existsSync(path.join(ROOT, 'lessons', id + '.js')));

let errors = 0, warnings = 0, ran = 0, cached = 0;
const err = (m) => { errors++; console.log('  ✗ ' + m); };
const warn = (m) => { warnings++; if (!quiet) console.log('  ⚠ ' + m); };
const norm = (s) => String(s == null ? '' : s).replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').replace(/\s+$/, '');

const KNOWN_BLOCKS = new Set(['h', 'p', 'list', 'table', 'figure', 'image', 'code', 'callout', 'wpf', 'project', 'demo', 'html']);
const KNOWN_LAYOUTS = new Set(['title', 'goals', 'bullets', 'code', 'two', 'table', 'diagram', 'image', 'demo', 'quiz', 'practice', 'summary']);
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'manifest.json'), 'utf8'));
const vsExists = (p) => fs.existsSync(path.join(ROOT, 'vs', p));
const textOf = (v) => (v == null ? null : typeof v === 'string' ? v : v.cpp != null ? v.cpp : v.code);

await getCompiler();
for (const id of targets) {
  const file = path.join(ROOT, 'lessons', id + '.js');
  console.log(`\n=== ${id} ===`);
  if (!fs.existsSync(file)) { err(`lessons/${id}.js 가 없습니다`); continue; }
  try { vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: id + '.js' }); }
  catch (e) { err(`스크립트 오류: ${e.message}`); continue; }
  const ch = C.chapters[id];
  if (!ch) { err('CV_COURSE.addChapter 가 호출되지 않았습니다'); continue; }
  const order = C.order.find((o) => o.id === id);
  if (!order) err(`course.js 의 order 에 ${id} 가 없습니다`);
  else if (ch.sections.length !== order.hours) err(`교시 수 ${ch.sections.length} ≠ course.js hours ${order.hours}`);
  if (!ch.summary) warn('summary 없음');
  if (ch.vs && !vsExists(ch.vs)) err(`차시 vs: '${ch.vs}' 프로젝트가 vs/ 에 없습니다`);
  ch.sections.forEach((sec) => (sec.content || []).forEach((b) => { if ((b.type === 'wpf' || b.type === 'project') && b.project && !vsExists(b.project)) err(`${sec.id}: 프로젝트 블록 '${b.project}' 가 vs/ 에 없습니다`); }));
  if (!ch.goals || !ch.goals.length) warn('goals 없음');

  const codes = [];
  const add = (o) => { if (o.code != null) codes.push(o); };
  ch.sections.forEach((sec, si) => {
    if (sec.id !== `${id}-${si + 1}`) err(`섹션 id '${sec.id}' 는 '${id}-${si + 1}' 이어야 합니다`);
    if (!sec.title) err(`섹션 ${si + 1} 제목 없음`);
    if (sec.flow) { const sum = sec.flow.reduce((a, f) => a + f[1], 0); if (sum !== (sec.minutes || 50)) warn(`${sec.id}: flow 합계 ${sum} ≠ minutes ${sec.minutes || 50}`); }
    if (!sec.slides || sec.slides.length < 6) warn(`${sec.id}: 슬라이드 ${(sec.slides || []).length}장 (8장 이상 권장)`);
    if (!sec.quiz || sec.quiz.length < 3) warn(`${sec.id}: 퀴즈 ${(sec.quiz || []).length}문항 (3개 이상 권장)`);
    if (!sec.practice || !sec.practice.length) warn(`${sec.id}: 실습 없음`);
    (sec.content || []).forEach((b, bi) => {
      if (!KNOWN_BLOCKS.has(b.type)) err(`${sec.id} content[${bi}]: 알 수 없는 type '${b.type}'`);
      if (b.type === 'image' && !manifest.includes(b.src)) err(`${sec.id} content[${bi}]: 이미지 '${b.src}' 가 assets 에 없습니다`);
      if (b.type === 'code') {
        const code = b.code != null ? b.code : b.cpp;
        if (code == null) err(`${sec.id} content[${bi}]: code 없음`);
        else add({ label: `${sec.id} 본문 "${b.title || bi}"`, code, expect: b.expect, stdin: b.stdin, run: b.run, local: b.local, lang: b.lang || 'cpp', nondeterministic: b.nondeterministic });
      }
    });
    (sec.practice || []).forEach((p, pi) => {
      if (!p.title) err(`${sec.id} practice[${pi}] 제목 없음`);
      if (p.starter == null) err(`${sec.id} practice[${pi}] starter 없음`);
      else add({ label: `${sec.id} 실습 "${p.title}" starter`, code: textOf(p.starter), run: p.run, local: p.local, lang: 'cpp', starter: true, stdin: p.stdin });
      if (p.solution == null) warn(`${sec.id} practice[${pi}] solution 없음`);
      else add({ label: `${sec.id} 실습 "${p.title}" solution`, code: textOf(p.solution), expect: p.expect, stdin: p.stdin, run: p.run, local: p.local, lang: 'cpp', nondeterministic: p.nondeterministic });
    });
    (sec.quiz || []).forEach((q, qi) => {
      if (!q.q || !Array.isArray(q.options) || q.options.length < 2) err(`${sec.id} quiz[${qi}] 형식 오류`);
      else if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= q.options.length) err(`${sec.id} quiz[${qi}] answer 범위 오류`);
      if (!q.explain) warn(`${sec.id} quiz[${qi}] explain 없음`);
    });
    (sec.slides || []).forEach((s, k) => {
      if (!KNOWN_LAYOUTS.has(s.layout)) err(`${sec.id} slide[${k}]: 알 수 없는 layout '${s.layout}'`);
      if (!s.notes) warn(`${sec.id} slide[${k}] (${s.layout}): notes 없음`);
      if (s.layout === 'image' && !manifest.includes(s.src)) err(`${sec.id} slide[${k}]: 이미지 '${s.src}' 가 assets 에 없습니다`);
      if (s.layout === 'code') {
        const code = s.code != null ? s.code : s.cpp;
        if (code == null) err(`${sec.id} slide[${k}]: code 없음`);
        else {
          const lines = code.split('\n').length;
          if (lines > 24 && (s.lang || 'cpp') === 'cpp') warn(`${sec.id} slide[${k}] "${s.title}": 코드 ${lines}줄 (22줄 이내 권장)`);
          add({ label: `${sec.id} 슬라이드 "${s.title}"`, code, run: s.run, local: s.local, lang: s.lang || 'cpp', stdin: s.stdin, slide: true });
        }
      }
      if (s.layout === 'practice') {
        if (s.starter == null) err(`${sec.id} slide[${k}] practice starter 없음`);
        else add({ label: `${sec.id} 슬라이드 실습 "${s.title}" starter`, code: textOf(s.starter), lang: 'cpp', starter: true });
        if (s.solution != null) add({ label: `${sec.id} 슬라이드 실습 "${s.title}" solution`, code: textOf(s.solution), lang: 'cpp', slide: true });
      }
      if (s.layout === 'two') for (const side of ['left', 'right']) { const c = s[side]; if (c && c.code && (c.lang || 'cpp') === 'cpp' && c.run !== false) add({ label: `${sec.id} 슬라이드 "${s.title}" ${side}`, code: c.code, lang: 'cpp', compileOnly: !/int\s+main\s*\(/.test(c.code), slide: true }); }
      if (s.layout === 'quiz' && (typeof s.answer !== 'number' || !Array.isArray(s.options))) err(`${sec.id} slide[${k}] quiz 형식 오류`);
    });
  });

  // 코드 컴파일 · 실행
  for (const c of codes) {
    if (c.lang !== 'cpp') continue;
    if (/\$\{/.test(c.code)) err(`${c.label}: 코드에 '\${' 가 있습니다 (JS 템플릿 문자열 오류 가능)`);
    const fragment = !/int\s+main\s*\(/.test(c.code);
    if (c.local || c.run === false || fragment) {
      // 로컬 전용 · 코드 조각은 실행하지 않는다 (main 이 있는 로컬 코드는 컴파일만 시도해 경고)
      if (fragment || !c.local) continue;
      c.compileOnly = true;
    }
    const key = cacheKey(c);
    const cfile = path.join(CACHE_DIR, key + '.json');
    let r = null;
    if (!noCache && fs.existsSync(cfile)) { r = JSON.parse(fs.readFileSync(cfile, 'utf8')); cached++; }
    else {
      if (c.compileOnly) {
        const compile = await getCompiler();
        const cr = await compile(c.code);
        r = cr.ok ? { out: '', compiledOnly: true } : { compileError: cr.message };
      } else {
        ran++;
        r = await runCpp(c.code, { stdin: c.stdin || '', timeoutMs: 30000 });
        delete r.warnings;
      }
      if (!r.timeout) fs.writeFileSync(cfile, JSON.stringify(r));
    }
    if (r.compileError) {
      const first = r.compileError.split('\n').filter((l) => /error:/.test(l)).slice(0, 3).join('\n      ');
      if (c.compileOnly) warn(`${c.label}: (로컬 코드) 브라우저 헤더로 컴파일되지 않음\n      ${first}`);
      else err(`${c.label}: 컴파일 오류\n      ${first || r.compileError.slice(0, 400)}`);
      continue;
    }
    if (c.compileOnly) continue;
    if (r.timeout) { err(`${c.label}: 시간 초과 (무한 반복?)`); continue; }
    if (r.exit !== 0) { err(`${c.label}: 종료 코드 ${r.exit}${r.trap ? ' ' + r.trap : ''}\n      ${String(r.err || '').trim().split('\n').slice(0, 3).join('\n      ')}`); if (print) console.log(indent(r.out)); continue; }
    if (r.ms > 4000) warn(`${c.label}: 실행 ${(r.ms / 1000).toFixed(1)}초 (3초 이내 권장)`);
    const notes = (r.notes || []).filter((n) => !/^(📷|🎞)|시뮬레이션/.test(n));
    if (notes.length) warn(`${c.label}: 실행 노트 — ${notes.join(' | ')}`);
    if (r.err && r.err.trim() && !/\[ WARN/.test(r.err)) warn(`${c.label}: 표준 오류 출력 — ${r.err.trim().slice(0, 200)}`);
    if (c.expect != null && !c.nondeterministic) {
      if (norm(r.out) !== norm(c.expect)) err(`${c.label}: 출력이 expect 와 다릅니다\n    기대: ${JSON.stringify(norm(c.expect))}\n    실제: ${JSON.stringify(norm(r.out))}`);
    } else if (!c.starter && !c.slide && r.out.trim() && !c.nondeterministic && c.expect == null) warn(`${c.label}: expect 없음 (출력 ${r.out.trim().split('\n').length}줄)`);
    if (print) console.log(`  --- ${c.label} (${r.ms}ms, 이미지 ${(r.images || []).length}) ---\n${indent(r.out)}`);
  }
}
function indent(s) { return String(s).replace(/\s+$/, '').split('\n').map((l) => '      ' + l).join('\n'); }
console.log(`\n실행 ${ran}개 (캐시 ${cached}) · 오류 ${errors} · 경고 ${warnings}`);
shutdown();
process.exit(errors ? 1 : 0);
