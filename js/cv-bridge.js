/* OpenCV C++ API ↔ OpenCV.js 5.0 브리지 (WebAssembly 가져오기 모듈 "cv")
 *  C++ 쪽(runtime/include/cvshim_impl.cpp)의 detail::Call 이 인수를 32비트 단어 배열로 넘기면
 *  여기서 cv.Mat 등으로 바꿔 OpenCV.js 함수를 부르고, 결과를 C++ 이 가져가도록 보관한다.
 *
 *  const bridge = CvBridge.create({ cv, host });
 *  WebAssembly.instantiate(mod, { cv: bridge.imports, ... });  bridge.setMemory(instance.exports.memory)
 *  host = { write(stream, text), note(text), imshow(name,w,h,ch,bytes), waitKey(ms), destroyWindow(name),
 *           fs: VirtualFs, encodePng, decodePng, videoOpen(src), videoRead(h) }
 */
(function (root) {
  'use strict';
  const T = { INT: 1, DBL: 2, STR: 3, MAT: 4, OUT: 5, NONE: 6, LIST: 7, SCALAR: 8, DBLS: 9, INTS: 10, KP: 11, DM: 12 };
  const O = { NONE: 0, MAT: 1, VEC: 2, VECVEC: 3, MATVEC: 4, FIXED: 5, KP: 6, DM: 7, DMVV: 8 };
  const DEPTH_SIZE = [1, 1, 2, 2, 4, 4, 8, 2];
  const CN_SHIFT = 5;
  const depthOf = (t) => t & 31;
  const cnOf = (t) => ((t >> CN_SHIFT) & 127) + 1;
  const makeType = (d, cn) => d + ((cn - 1) << CN_SHIFT);
  const TYPE_NAMES = ['CV_8U', 'CV_8S', 'CV_16U', 'CV_16S', 'CV_32S', 'CV_32F', 'CV_64F', 'CV_16F'];
  const typeName = (t) => TYPE_NAMES[depthOf(t) & 7] + 'C' + cnOf(t);
  const KP_SIZE = 28, DM_SIZE = 16;

  class CvError extends Error {
    constructor(code, text, func, file) {
      const names = { '-215': 'Assertion failed', '-5': 'Bad argument', '-211': 'One of the arguments\' values is out of range', '-213': 'The function/feature is not implemented', '-2': 'Unspecified error', '-201': 'Incorrect size of input array', '-210': 'Unsupported format or combination of formats' };
      super(`OpenCV(5.0.0) ${file || 'bridge'}: error: (${code}:${names[String(code)] || 'Unspecified error'}) ${text}${func ? ` in function '${func}'` : ''}\n`);
    }
  }

  function create({ cv, host }) {
    let memory = null;
    let outs = [];
    let rets = [];
    let retStr = '';
    let errText = '';
    let temps = [];
    const objs = new Map();
    let nextHandle = 1;
    const noted = new Set();
    const u8 = () => new Uint8Array(memory.buffer);
    const dv = () => new DataView(memory.buffer);
    const track = (m) => { temps.push(m); return m; };
    const dec = new TextDecoder();
    const enc = new TextEncoder();

    // ---------------------------------------------------------------- 인수
    class MatArg {
      constructor(type, rows, cols, step, ptr) { this.type = type; this.rows = rows; this.cols = cols; this.step = step; this.ptr = ptr; this._m = null; }
      get empty() { return !this.rows || !this.cols || !this.ptr; }
      /** C++ 메모리의 픽셀을 복사한 cv.Mat (호출이 끝나면 삭제) */
      mat() {
        if (this._m) return this._m;
        if (this.empty) return (this._m = track(new cv.Mat()));
        const m = track(new cv.Mat(this.rows, this.cols, this.type));
        const rowBytes = this.cols * cnOf(this.type) * DEPTH_SIZE[depthOf(this.type)];
        const src = u8();
        if (this.step === rowBytes) m.data.set(src.subarray(this.ptr, this.ptr + rowBytes * this.rows));
        else for (let r = 0; r < this.rows; r++) m.data.set(src.subarray(this.ptr + r * this.step, this.ptr + r * this.step + rowBytes), r * rowBytes);
        return (this._m = m);
      }
    }
    class ScalarArg { constructor(v) { this.v = v; } }
    class ListArg { constructor(items) { this.items = items; } }
    class KPArg { constructor(n, ptr) { this.n = n; this.ptr = ptr; } }
    class DMArg { constructor(n, ptr) { this.n = n; this.ptr = ptr; } }
    class OutArg {
      constructor(slot, okind, want, cur) { this.slot = slot; this.okind = okind; this.want = want; this.cur = cur; }
      /** 결과 cv.Mat 을 C++ 출력으로 (브리지가 소유 → 가져간 뒤 삭제) */
      set(m) {
        if (!m) return;
        let res = m;
        if (this.want >= 0 && !m.empty() && depthOf(this.want) !== m.depth() && (this.okind === O.VEC || this.okind === O.FIXED)) {
          res = new cv.Mat();
          m.convertTo(res, depthOf(this.want));
          temps.push(m);
        }
        outs[this.slot] = { kind: 1, mat: res };
      }
      setList(list) {
        const want = this.want;
        const mats = list.map((m) => {
          if (want >= 0 && !m.empty() && depthOf(want) !== m.depth() && this.okind === O.VECVEC) { const r = new cv.Mat(); m.convertTo(r, depthOf(want)); temps.push(m); return r; }
          return m;
        });
        outs[this.slot] = { kind: 2, mats };
      }
      setRaw(bytes, count, size) { outs[this.slot] = { kind: 1, raw: bytes, count, size }; }
      setRawList(list, size) { outs[this.slot] = { kind: 2, raws: list, size }; }
    }

    function decodeArgs(ptr, n) {
      const view = dv();
      const w = (k) => view.getInt32(ptr + 4 * k, true);
      const d = (k) => view.getFloat64(ptr + 4 * k, true);
      const args = [];
      let k = 0;
      while (k < n) {
        const tag = w(k++);
        switch (tag) {
          case T.INT: args.push(w(k)); k += 1; break;
          case T.DBL: args.push(d(k)); k += 2; break;
          case T.STR: { const p = w(k), len = w(k + 1); k += 2; args.push(dec.decode(u8().slice(p, p + len))); break; }
          case T.MAT: args.push(new MatArg(w(k), w(k + 1), w(k + 2), w(k + 3), w(k + 4) >>> 0)); k += 5; break;
          case T.OUT: { const slot = w(k), ok = w(k + 1), want = w(k + 2); const cur = new MatArg(w(k + 3), w(k + 4), w(k + 5), w(k + 6), w(k + 7) >>> 0); k += 8; args.push(new OutArg(slot, ok, want, cur)); break; }
          case T.NONE: args.push(null); break;
          case T.LIST: { const cnt = w(k++); const items = []; for (let i = 0; i < cnt; i++) { items.push(new MatArg(w(k), w(k + 1), w(k + 2), w(k + 3), w(k + 4) >>> 0)); k += 5; } args.push(new ListArg(items)); break; }
          case T.SCALAR: args.push(new ScalarArg([d(k), d(k + 2), d(k + 4), d(k + 6)])); k += 8; break;
          case T.DBLS: { const cnt = w(k++); const a = []; for (let i = 0; i < cnt; i++) { a.push(d(k)); k += 2; } args.push(a); break; }
          case T.INTS: { const cnt = w(k++); const a = []; for (let i = 0; i < cnt; i++) a.push(w(k++)); args.push(a); break; }
          case T.KP: args.push(new KPArg(w(k), w(k + 1) >>> 0)); k += 2; break;
          case T.DM: args.push(new DMArg(w(k), w(k + 1) >>> 0)); k += 2; break;
          default: throw new Error('브리지: 알 수 없는 인수 태그 ' + tag);
        }
      }
      return args;
    }

    // ---------------------------------------------------------------- 변환 도우미
    const sc = (a) => (Array.isArray(a) ? new cv.Scalar(a[0] || 0, a[1] || 0, a[2] || 0, a[3] || 0) : a instanceof ScalarArg ? new cv.Scalar(...a.v) : new cv.Scalar(0, 0, 0, 0));
    const P = (a) => new cv.Point(a[0], a[1]);
    const S = (a) => new cv.Size(a[0], a[1]);
    const R = (a) => new cv.Rect(a[0], a[1], a[2], a[3]);
    const TC = (a) => new cv.TermCriteria(a[0], a[1], a[2]);
    const RR = (a) => new cv.RotatedRect(new cv.Point(a[0], a[1]), new cv.Size(a[2], a[3]), a[4]);
    /** 입력 → cv.Mat (Scalar/숫자는 like 와 같은 크기·형식의 Mat 으로 펼친다) */
    function M(a, like) {
      if (a instanceof MatArg) return a.mat();
      if (a == null) return track(new cv.Mat());
      if (a instanceof ListArg) return a.items.length ? a.items[0].mat() : track(new cv.Mat());
      const v = a instanceof ScalarArg ? a.v : typeof a === 'number' ? [a, 0, 0, 0] : a;
      if (like && !like.empty()) return track(new cv.Mat(like.rows, like.cols, like.type(), new cv.Scalar(v[0], v[1], v[2], v[3])));
      return track(cv.matFromArray(4, 1, cv.CV_64F, v));
    }
    const isScalarLike = (a) => a instanceof ScalarArg || typeof a === 'number';
    /** 이항 연산 인수 두 개 (한쪽이 Scalar 면 다른 쪽에 맞춘다) */
    function pair(a, b) {
      if (isScalarLike(a) && !isScalarLike(b)) { const mb = M(b); return [M(a, mb), mb]; }
      const ma = M(a);
      return [ma, M(b, ma)];
    }
    const V = (list) => { const mv = track(new cv.MatVector()); if (list instanceof ListArg) list.items.forEach((it) => mv.push_back(it.mat())); else if (list instanceof MatArg && !list.empty) mv.push_back(list.mat()); return mv; };
    const mvToArray = (mv) => { const a = []; for (let i = 0; i < mv.size(); i++) a.push(mv.get(i)); return a; };
    const newMat = () => new cv.Mat();
    const outMat = (o) => (o ? newMat() : track(new cv.Mat()));
    const put = (o, m) => { if (o) o.set(m); else if (m) temps.push(m); };
    const borderVal = (a) => (a && a[0] > 1e300 ? cv.morphologyDefaultBorderValue() : sc(a));
    function readKP(arg) {
      const kv = track(new cv.KeyPointVector());
      if (!arg || !arg.n) return kv;
      const view = dv();
      for (let i = 0; i < arg.n; i++) {
        const p = arg.ptr + i * KP_SIZE;
        kv.push_back({ pt: { x: view.getFloat32(p, true), y: view.getFloat32(p + 4, true) }, size: view.getFloat32(p + 8, true), angle: view.getFloat32(p + 12, true),
          response: view.getFloat32(p + 16, true), octave: view.getInt32(p + 20, true), class_id: view.getInt32(p + 24, true) });
      }
      return kv;
    }
    function packKP(kv) {
      const n = kv.size();
      const buf = new ArrayBuffer(n * KP_SIZE);
      const view = new DataView(buf);
      for (let i = 0; i < n; i++) {
        const k = kv.get(i), p = i * KP_SIZE;
        view.setFloat32(p, k.pt.x, true); view.setFloat32(p + 4, k.pt.y, true); view.setFloat32(p + 8, k.size, true); view.setFloat32(p + 12, k.angle, true);
        view.setFloat32(p + 16, k.response, true); view.setInt32(p + 20, k.octave, true); view.setInt32(p + 24, k.class_id, true);
      }
      return new Uint8Array(buf);
    }
    function readDM(arg) {
      const v = track(new cv.DMatchVector());
      if (!arg || !arg.n) return v;
      const view = dv();
      for (let i = 0; i < arg.n; i++) { const p = arg.ptr + i * DM_SIZE; v.push_back({ queryIdx: view.getInt32(p, true), trainIdx: view.getInt32(p + 4, true), imgIdx: view.getInt32(p + 8, true), distance: view.getFloat32(p + 12, true) }); }
      return v;
    }
    function packDM(dv_) {
      const n = dv_.size();
      const buf = new ArrayBuffer(n * DM_SIZE);
      const view = new DataView(buf);
      for (let i = 0; i < n; i++) { const m = dv_.get(i), p = i * DM_SIZE; view.setInt32(p, m.queryIdx, true); view.setInt32(p + 4, m.trainIdx, true); view.setInt32(p + 8, m.imgIdx, true); view.setFloat32(p + 12, m.distance, true); }
      return new Uint8Array(buf);
    }
    function obj(h, what) { const o = objs.get(h); if (!o) throw new CvError(-215, `${what || 'object'} is empty (release 된 객체이거나 만들지 않았습니다)`, what, 'bridge'); return o; }
    function addObj(o) { const h = nextHandle++; objs.set(h, o); return h; }
    function noteOnce(key, text) { if (noted.has(key)) return; noted.add(key); if (host.note) host.note(text); }
    /** imshow · imwrite 용 8비트 변환 (실제 imshow 규칙: 32F/64F 는 ×255, 16U 는 ÷256) */
    function to8u(m, forWrite) {
      if (m.depth() === cv.CV_8U) return m;
      const t = track(new cv.Mat());
      if (forWrite) m.convertTo(t, cv.CV_8U);
      else if (m.depth() === cv.CV_32F || m.depth() === cv.CV_64F) m.convertTo(t, cv.CV_8U, 255, 0);
      else if (m.depth() === cv.CV_16U) m.convertTo(t, cv.CV_8U, 1 / 256, 0);
      else if (m.depth() === cv.CV_8S) m.convertTo(t, cv.CV_8U, 1, 128);
      else m.convertTo(t, cv.CV_8U);
      return t;
    }
    function rawOf(m) {
      const c = m.isContinuous() ? m : track(m.clone());
      return { w: m.cols, h: m.rows, ch: m.channels(), bytes: new Uint8Array(c.data) };
    }
    function rawToMat(raw) {
      const type = raw.ch === 1 ? cv.CV_8UC1 : raw.ch === 3 ? cv.CV_8UC3 : cv.CV_8UC4;
      const m = new cv.Mat(raw.h, raw.w, type);
      m.data.set(raw.bytes.subarray(0, raw.w * raw.h * raw.ch));
      return m;
    }
    function applyReadFlags(m, flags) {
      let out = m;
      const conv = (code) => { const t = new cv.Mat(); cv.cvtColor(out, t, code); if (out !== m) out.delete(); else temps.push(m); out = t; };
      if (flags === -1) return out;
      const gray = flags === 0 || flags === 16 || flags === 32 || flags === 64 || ((flags & 1) === 0 && (flags & 4) === 0 && flags !== 256 && flags !== 2);
      if (gray || flags === 2) { if (out.channels() === 3) conv(cv.COLOR_BGR2GRAY); else if (out.channels() === 4) conv(cv.COLOR_BGRA2GRAY); }
      else if ((flags & 4) && !(flags & 1)) { if (out.channels() === 4) conv(cv.COLOR_BGRA2BGR); }
      else { if (out.channels() === 1) conv(cv.COLOR_GRAY2BGR); else if (out.channels() === 4) conv(cv.COLOR_BGRA2BGR); if (flags & 256) conv(cv.COLOR_BGR2RGB); }
      const red = flags >= 16 && flags < 128 ? (flags & 64 ? 8 : flags & 32 ? 4 : 2) : 1;
      if (red > 1) { const t = new cv.Mat(); cv.resize(out, t, new cv.Size(Math.ceil(out.cols / red), Math.ceil(out.rows / red)), 0, 0, cv.INTER_AREA); temps.push(out); out = t; }
      return out;
    }
    /** getTextSize: 실제 Hershey 글꼴과 같은 방식(글자 전진 폭 합 + 두께)을 그려서 측정 */
    function inkRight(text, ff, fs, th) {
      const h = Math.ceil(60 * fs + 20 + th * 2), w = Math.ceil(text.length * 50 * fs + 40 + th * 2);
      const m = new cv.Mat(h, w, cv.CV_8UC1, new cv.Scalar(0));
      cv.putText(m, text, new cv.Point(10, Math.round(h * 0.7)), ff, fs, new cv.Scalar(255), th, cv.LINE_8, false);
      let right = -1;
      const d = m.data;
      for (let y = 0; y < h; y++) for (let x = w - 1; x > right; x--) if (d[y * w + x]) { right = x; break; }
      m.delete();
      return right;
    }
    const HERSHEY_LINES = { 0: [9, 12], 1: [5, 7], 2: [9, 12], 3: [9, 12], 4: [9, 12], 5: [5, 8], 6: [9, 12], 7: [9, 12] };

    // ---------------------------------------------------------------- 함수 표
    const F = {
      // ------------------------------------------------ 기타
      note: (a) => { if (host.note) host.note(a[0]); },
      notSupported: (a) => noteOnce('ns:' + a[0], `${a[0]} 은(는) 브라우저 실습 환경에서 지원하지 않아 건너뜁니다. Visual Studio 의 실제 OpenCV 에서는 동작합니다.`),
      getBuildInformation: () => { retStr = 'OpenCV.js ' + String(cv.getBuildInformation()).replace(/5\.0\.0-pre/g, '5.0.0').split('\n').filter((l) => !/Version control/.test(l)).slice(0, 3).join('\n'); },
      release: (a) => { const o = objs.get(a[0]); if (o) { objs.delete(a[0]); if (o.delete && !o.isDeleted?.()) try { o.delete(); } catch (e) { /* 무시 */ } } },

      // ------------------------------------------------ core
      add: (a) => { const [x, y] = pair(a[0], a[1]); const d = newMat(); cv.add(x, y, d, M(a[3]), a[4]); a[2].set(d); },
      subtract: (a) => { const [x, y] = pair(a[0], a[1]); const d = newMat(); cv.subtract(x, y, d, M(a[3]), a[4]); a[2].set(d); },
      multiply: (a) => { const [x, y] = pair(a[0], a[1]); const d = newMat(); cv.multiply(x, y, d, a[3], a[4]); a[2].set(d); },
      divide: (a) => { const [x, y] = pair(a[0], a[1]); const d = newMat(); cv.divide(x, y, d, a[3], a[4]); a[2].set(d); },
      divideScale: (a) => { const d = newMat(); cv.divide1(a[0], M(a[1]), d, a[3]); a[2].set(d); },
      addWeighted: (a) => { const x = M(a[0]); const y = M(a[2], x); const d = newMat(); cv.addWeighted(x, a[1], y, a[3], a[4], d, a[6]); a[5].set(d); },
      convertScaleAbs: (a) => { const d = newMat(); cv.convertScaleAbs(M(a[0]), d, a[2], a[3]); a[1].set(d); },
      absdiff: (a) => { const [x, y] = pair(a[0], a[1]); const d = newMat(); cv.absdiff(x, y, d); a[2].set(d); },
      bitwise_and: (a) => { const [x, y] = pair(a[0], a[1]); const d = newMat(); cv.bitwise_and(x, y, d, M(a[3])); a[2].set(d); },
      bitwise_or: (a) => { const [x, y] = pair(a[0], a[1]); const d = newMat(); cv.bitwise_or(x, y, d, M(a[3])); a[2].set(d); },
      bitwise_xor: (a) => { const [x, y] = pair(a[0], a[1]); const d = newMat(); cv.bitwise_xor(x, y, d, M(a[3])); a[2].set(d); },
      bitwise_not: (a) => { const d = newMat(); cv.bitwise_not(M(a[0]), d, M(a[2])); a[1].set(d); },
      compare: (a) => { const [x, y] = pair(a[0], a[1]); const d = newMat(); cv.compare(x, y, d, a[3]); a[2].set(d); },
      inRange: (a) => { const s = M(a[0]); const d = newMat(); cv.inRange(s, rangeMat(a[1], s), rangeMat(a[2], s), d); a[3].set(d); },
      min: (a) => { const [x, y] = pair(a[0], a[1]); const d = newMat(); cv.min(x, y, d); a[2].set(d); },
      max: (a) => { const [x, y] = pair(a[0], a[1]); const d = newMat(); cv.max(x, y, d); a[2].set(d); },
      sqrt: (a) => { const d = newMat(); cv.sqrt(M(a[0]), d); a[1].set(d); },
      pow: (a) => { const d = newMat(); cv.pow(M(a[0]), a[1], d); a[2].set(d); },
      exp: (a) => { const d = newMat(); cv.exp(M(a[0]), d); a[1].set(d); },
      log: (a) => { const d = newMat(); cv.log(M(a[0]), d); a[1].set(d); },
      magnitude: (a) => { const d = newMat(); cv.magnitude(M(a[0]), M(a[1]), d); a[2].set(d); },
      phase: (a) => { const m = track(new cv.Mat()); const d = newMat(); cv.cartToPolar(M(a[0]), M(a[1]), m, d, !!a[3]); a[2].set(d); },
      cartToPolar: (a) => { const m = outMat(a[2]), d = outMat(a[3]); cv.cartToPolar(M(a[0]), M(a[1]), m, d, !!a[4]); put(a[2], m); put(a[3], d); },
      polarToCart: (a) => { const x = outMat(a[2]), y = outMat(a[3]); cv.polarToCart(M(a[0]), M(a[1]), x, y, !!a[4]); put(a[2], x); put(a[3], y); },
      mean: (a) => { const r = cv.mean(M(a[0]), M(a[1])); rets = [r[0], r[1], r[2], r[3]]; },
      meanStdDev: (a) => { const m = outMat(a[1]), s = outMat(a[2]); cv.meanStdDev(M(a[0]), m, s, M(a[3])); put(a[1], m); put(a[2], s); },
      countNonZero: (a) => { rets = [cv.countNonZero(M(a[0]))]; },
      minMaxLoc: (a) => { const r = cv.minMaxLoc(M(a[0]), M(a[1])); rets = [r.minVal, r.maxVal, r.minLoc.x, r.minLoc.y, r.maxLoc.x, r.maxLoc.y]; },
      norm1: (a) => { rets = [cv.norm(M(a[0]), a[1], M(a[2]))]; },
      norm2: (a) => { const [x, y] = pair(a[0], a[1]); rets = [cv.norm1(x, y, a[2], M(a[3]))]; },
      normalize: (a) => { const d = newMat(); const s = M(a[0]); cv.normalize(s, d, a[2], a[3], a[4], a[5], M(a[6])); a[1].set(d); },
      split: (a) => { const mv = new cv.MatVector(); cv.split(M(a[0]), mv); a[1].setList(mvToArray(mv)); temps.push(mv); },
      merge: (a) => { const d = newMat(); cv.merge(V(a[0]), d); a[1].set(d); },
      flip: (a) => { const d = newMat(); cv.flip(M(a[0]), d, a[2]); a[1].set(d); },
      rotate: (a) => { const d = newMat(); cv.rotate(M(a[0]), d, a[2]); a[1].set(d); },
      transpose: (a) => { const d = newMat(); cv.transpose(M(a[0]), d); a[1].set(d); },
      repeat: (a) => { const d = newMat(); cv.repeat(M(a[0]), a[1], a[2], d); a[3].set(d); },
      hconcat: (a) => { const d = newMat(); cv.hconcat(V(a[0]), d); a[1].set(d); },
      vconcat: (a) => { const d = newMat(); cv.vconcat(V(a[0]), d); a[1].set(d); },
      copyMakeBorder: (a) => { const d = newMat(); cv.copyMakeBorder(M(a[0]), d, a[2], a[3], a[4], a[5], a[6], sc(a[7])); a[1].set(d); },
      LUT: (a) => { const d = newMat(); cv.LUT(M(a[0]), M(a[1]), d); a[2].set(d); },
      gemm: (a) => { const d = newMat(); cv.gemm(M(a[0]), M(a[1]), a[2], M(a[3]), a[4], d, a[6]); a[5].set(d); },
      invert: (a) => { const d = newMat(); rets = [cv.invert(M(a[0]), d, a[2])]; a[1].set(d); },
      determinant: (a) => { rets = [cv.determinant(M(a[0]))]; },
      solve: (a) => { const d = newMat(); rets = [cv.solve(M(a[0]), M(a[1]), d, a[3]) ? 1 : 0]; a[2].set(d); },
      eigen: (a) => { const v = outMat(a[1]), e = outMat(a[2]); rets = [cv.eigen(M(a[0]), v, e) ? 1 : 0]; put(a[1], v); put(a[2], e); },
      reduce: (a) => { const d = newMat(); cv.reduce(M(a[0]), d, a[2], a[3], a[4]); a[1].set(d); },
      dft: (a) => { const d = newMat(); cv.dft(M(a[0]), d, a[2], a[3]); a[1].set(d); },
      getOptimalDFTSize: (a) => { rets = [cv.getOptimalDFTSize(a[0])]; },
      kmeans: (a) => {
        const labels = a[3] && !a[3].empty && (a[6] & 1) ? a[3].mat().clone() : new cv.Mat();
        const centers = outMat(a[7]);
        rets = [cv.kmeans(M(a[0]), a[1], labels, TC(a[4]), a[5], a[6], centers)];
        a[2].set(labels); put(a[7], centers);
      },
      sort: (a) => { throw new CvError(-213, 'cv::sort 는 브라우저 실습 환경에서 지원하지 않습니다 (std::sort 를 쓰세요)', 'sort'); },
      sortIdx: (a) => { throw new CvError(-213, 'cv::sortIdx 는 브라우저 실습 환경에서 지원하지 않습니다', 'sortIdx'); },

      // ------------------------------------------------ imgproc
      cvtColor: (a) => { const d = newMat(); cv.cvtColor(M(a[0]), d, a[2], a[3]); a[1].set(d); },
      threshold: (a) => { const d = newMat(); rets = [cv.threshold(M(a[0]), d, a[2], a[3], a[4])]; a[1].set(d); },
      adaptiveThreshold: (a) => { const d = newMat(); cv.adaptiveThreshold(M(a[0]), d, a[2], a[3], a[4], a[5], a[6]); a[1].set(d); },
      blur: (a) => { const d = newMat(); cv.blur(M(a[0]), d, S(a[2]), P(a[3]), a[4]); a[1].set(d); },
      boxFilter: (a) => { const d = newMat(); cv.boxFilter(M(a[0]), d, a[2], S(a[3]), P(a[4]), !!a[5], a[6]); a[1].set(d); },
      GaussianBlur: (a) => { const d = newMat(); cv.GaussianBlur(M(a[0]), d, S(a[2]), a[3], a[4], a[5]); a[1].set(d); },
      medianBlur: (a) => { const d = newMat(); cv.medianBlur(M(a[0]), d, a[2]); a[1].set(d); },
      bilateralFilter: (a) => { const d = newMat(); cv.bilateralFilter(M(a[0]), d, a[2], a[3], a[4], a[5]); a[1].set(d); },
      filter2D: (a) => { const d = newMat(); cv.filter2D(M(a[0]), d, a[2], M(a[3]), P(a[4]), a[5], a[6]); a[1].set(d); },
      sepFilter2D: (a) => { const d = newMat(); cv.sepFilter2D(M(a[0]), d, a[2], M(a[3]), M(a[4]), P(a[5]), a[6], a[7]); a[1].set(d); },
      Sobel: (a) => { const d = newMat(); cv.Sobel(M(a[0]), d, a[2], a[3], a[4], a[5], a[6], a[7], a[8]); a[1].set(d); },
      Scharr: (a) => { const d = newMat(); cv.Scharr(M(a[0]), d, a[2], a[3], a[4], a[5], a[6], a[7]); a[1].set(d); },
      Laplacian: (a) => { const d = newMat(); cv.Laplacian(M(a[0]), d, a[2], a[3], a[4], a[5], a[6]); a[1].set(d); },
      Canny: (a) => { const d = newMat(); cv.Canny(M(a[0]), d, a[2], a[3], a[4], !!a[5]); a[1].set(d); },
      cornerHarris: (a) => { const d = newMat(); cv.cornerHarris(M(a[0]), d, a[2], a[3], a[4], a[5]); a[1].set(d); },
      cornerMinEigenVal: (a) => { const d = newMat(); cv.cornerMinEigenVal(M(a[0]), d, a[2], a[3], a[4]); a[1].set(d); },
      goodFeaturesToTrack: (a) => { a[1].set(gftt(M(a[0]), a[2], a[3], a[4], a[5] ? M(a[5]) : null, a[6], !!a[7], a[8])); },
      cornerSubPix: (a) => { noteOnce('cornerSubPix', 'cornerSubPix 는 브라우저 실습 환경에서 지원하지 않아 코너 좌표를 그대로 둡니다 (Visual Studio 에서는 정밀화됩니다).'); a[2].set(a[1] instanceof MatArg ? a[1].mat().clone() : new cv.Mat()); },
      getStructuringElement: (a) => { const k = cv.getStructuringElement(a[0], S(a[1]), P(a[2])); a[3].set(k); },
      erode: (a) => { const d = newMat(); cv.erode(M(a[0]), d, M(a[2]), P(a[3]), a[4], a[5], borderVal(a[6])); a[1].set(d); },
      dilate: (a) => { const d = newMat(); cv.dilate(M(a[0]), d, M(a[2]), P(a[3]), a[4], a[5], borderVal(a[6])); a[1].set(d); },
      morphologyEx: (a) => { const d = newMat(); cv.morphologyEx(M(a[0]), d, a[2], M(a[3]), P(a[4]), a[5], a[6], borderVal(a[7])); a[1].set(d); },
      resize: (a) => { const d = newMat(); cv.resize(M(a[0]), d, S(a[2]), a[3], a[4], a[5]); a[1].set(d); },
      warpAffine: (a) => { const d = newMat(); cv.warpAffine(M(a[0]), d, M(a[2]), S(a[3]), a[4], a[5], sc(a[6])); a[1].set(d); },
      warpPerspective: (a) => { const d = newMat(); cv.warpPerspective(M(a[0]), d, M(a[2]), S(a[3]), a[4], a[5], sc(a[6])); a[1].set(d); },
      remap: (a) => { const d = newMat(); cv.remap(M(a[0]), d, M(a[2]), M(a[3]), a[4], a[5], sc(a[6])); a[1].set(d); },
      getAffineTransform: (a) => { a[2].set(cv.getAffineTransform(pts32f(a[0]), pts32f(a[1]))); },
      getPerspectiveTransform: (a) => { a[2].set(cv.getPerspectiveTransform(pts32f(a[0]), pts32f(a[1]), a[3])); },
      invertAffineTransform: (a) => { const d = newMat(); cv.invertAffineTransform(M(a[0]), d); a[1].set(d); },
      getRectSubPix: (a) => { const d = newMat(); cv.getRectSubPix(M(a[0]), S(a[1]), P(a[2]), d, a[4]); a[3].set(d); },
      warpPolar: (a) => { const d = newMat(); cv.warpPolar(M(a[0]), d, S(a[2]), P(a[3]), a[4], a[5]); a[1].set(d); },
      pyrDown: (a) => { const d = newMat(); cv.pyrDown(M(a[0]), d, S(a[2]), a[3]); a[1].set(d); },
      pyrUp: (a) => { const d = newMat(); cv.pyrUp(M(a[0]), d, S(a[2]), a[3]); a[1].set(d); },
      equalizeHist: (a) => { const d = newMat(); cv.equalizeHist(M(a[0]), d); a[1].set(d); },
      calcHist: (a) => {
        const hist = a[7] && (a[6] ? true : false) && !a[7].empty ? a[7].mat().clone() : new cv.Mat();
        cv.calcHist(V(a[0]), a[1], M(a[2]), hist, a[4], a[5], !!a[6]);
        a[3].set(hist);
      },
      calcBackProject: (a) => { const d = newMat(); cv.calcBackProject(V(a[0]), a[1], M(a[2]), d, a[4], a[5]); a[3].set(d); },
      compareHist: (a) => { rets = [cv.compareHist(M(a[0]), M(a[1]), a[2])]; },
      integral: (a) => { const d = newMat(); cv.integral(M(a[0]), d, a[2]); a[1].set(d); },
      integral2: (a) => { const s = outMat(a[1]), q = outMat(a[2]); cv.integral2(M(a[0]), s, q, a[3], a[4]); put(a[1], s); put(a[2], q); },
      distanceTransform: (a) => { const d = newMat(); cv.distanceTransform(M(a[0]), d, a[2], a[3], a[4]); a[1].set(d); },
      distanceTransformWithLabels: (a) => { const d = outMat(a[1]), l = outMat(a[2]); cv.distanceTransformWithLabels(M(a[0]), d, l, a[3], a[4], a[5]); put(a[1], d); put(a[2], l); },
      connectedComponents: (a) => { const l = outMat(a[1]); rets = [cv.connectedComponents(M(a[0]), l, a[2], a[3])]; put(a[1], l); },
      connectedComponentsWithStats: (a) => {
        const l = outMat(a[1]), s = outMat(a[2]), c = outMat(a[3]);
        rets = [cv.connectedComponentsWithStats(M(a[0]), l, s, c, a[4], a[5])];
        put(a[1], l); put(a[2], s); put(a[3], c);
      },
      findContours: (a) => {
        const cs = new cv.MatVector(), h = new cv.Mat();
        cv.findContours(M(a[0]), cs, h, a[3], a[4], P(a[5]));
        a[1].setList(mvToArray(cs)); temps.push(cs);
        if (a[2]) a[2].set(h); else temps.push(h);
      },
      drawContours: (a) => {
        const img = M(a[0]);
        const list = a[1] instanceof ListArg ? V(a[1]) : (() => { const mv = track(new cv.MatVector()); if (a[1] instanceof MatArg && !a[1].empty) mv.push_back(a[1].mat()); return mv; })();
        cv.drawContours(img, list, a[2], sc(a[3]), a[4], a[5], M(a[6]), a[7], P(a[8]));
        a[9].set(img.clone());
      },
      contourArea: (a) => { rets = [cv.contourArea(M(a[0]), !!a[1])]; },
      arcLength: (a) => { rets = [cv.arcLength(M(a[0]), !!a[1])]; },
      approxPolyDP: (a) => { const d = newMat(); cv.approxPolyDP(M(a[0]), d, a[2], !!a[3]); a[1].set(d); },
      boundingRect: (a) => { const r = cv.boundingRect(M(a[0])); rets = [r.x, r.y, r.width, r.height]; },
      minAreaRect: (a) => { const r = cv.minAreaRect(M(a[0])); rets = [r.center.x, r.center.y, r.size.width, r.size.height, r.angle]; },
      minEnclosingCircle: (a) => { const c = cv.minEnclosingCircle(M(a[0])); rets = [c.center.x, c.center.y, c.radius]; },
      minEnclosingTriangle: (a) => { const d = newMat(); rets = [cv.minEnclosingTriangle(M(a[0]), d)]; a[1].set(d); },
      fitEllipse: (a) => { const r = cv.fitEllipse(M(a[0])); rets = [r.center.x, r.center.y, r.size.width, r.size.height, r.angle]; },
      fitLine: (a) => { const d = newMat(); cv.fitLine(M(a[0]), d, a[2], a[3], a[4], a[5]); a[1].set(d); },
      convexHull: (a) => { const d = newMat(); cv.convexHull(M(a[0]), d, !!a[2], !!a[3]); a[1].set(d); },
      convexityDefects: (a) => { const d = newMat(); cv.convexityDefects(M(a[0]), M(a[1]), d); a[2].set(d); },
      isContourConvex: (a) => { rets = [cv.isContourConvex(M(a[0])) ? 1 : 0]; },
      moments: (a) => {
        const m = cv.moments(M(a[0]), !!a[1]);
        rets = ['m00', 'm10', 'm01', 'm20', 'm11', 'm02', 'm30', 'm21', 'm12', 'm03', 'mu20', 'mu11', 'mu02', 'mu30', 'mu21', 'mu12', 'mu03', 'nu20', 'nu11', 'nu02', 'nu30', 'nu21', 'nu12', 'nu03'].map((k) => m[k]);
      },
      matchShapes: (a) => { rets = [cv.matchShapes(M(a[0]), M(a[1]), a[2], a[3])]; },
      pointPolygonTest: (a) => { rets = [cv.pointPolygonTest(M(a[0]), P(a[1]), !!a[2])]; },
      rotatedRectangleIntersection: (a) => { const d = newMat(); rets = [cv.rotatedRectangleIntersection(RR(a[0]), RR(a[1]), d)]; if (a[2]) a[2].set(d); else temps.push(d); },
      HoughLines: (a) => { const d = newMat(); cv.HoughLines(M(a[0]), d, a[2], a[3], a[4], a[5], a[6], a[7], a[8]); a[1].set(d); },
      HoughLinesP: (a) => { const d = newMat(); cv.HoughLinesP(M(a[0]), d, a[2], a[3], a[4], a[5], a[6]); a[1].set(d); },
      HoughCircles: (a) => { const d = newMat(); cv.HoughCircles(M(a[0]), d, a[2], a[3], a[4], a[5], a[6], a[7], a[8]); a[1].set(d); },
      matchTemplate: (a) => { const d = newMat(); cv.matchTemplate(M(a[0]), M(a[1]), d, a[3], M(a[4])); a[2].set(d); },
      floodFill: (a) => {
        const img = M(a[0]);
        let mask = a[2] instanceof MatArg && !a[2].empty ? a[2].mat() : null;
        const hadMask = !!mask;
        if (!mask) { mask = track(new cv.Mat(img.rows + 2, img.cols + 2, cv.CV_8UC1, new cv.Scalar(0))); }
        const rect = new cv.Rect();
        const r = cv.floodFill(img, mask, P(a[4]), sc(a[5]), rect, sc(a[6]), sc(a[7]), a[8]);
        const area = typeof r === 'number' ? r : (r && r.area != null ? r.area : 0);
        const rc = r && r.rect ? r.rect : rect;
        rets = [area, rc.x, rc.y, rc.width, rc.height];
        a[1].set(img.clone());
        if (a[3] && hadMask) a[3].set(mask.clone());
      },
      watershed: (a) => { const mk = a[1].mat(); cv.watershed(M(a[0]), mk); a[2].set(mk.clone()); },
      grabCut: (a) => {
        const mask = a[1].empty ? track(new cv.Mat()) : a[1].mat(), bgd = a[4].empty ? track(new cv.Mat()) : a[4].mat(), fgd = a[6].empty ? track(new cv.Mat()) : a[6].mat();
        cv.grabCut(M(a[0]), mask, R(a[3]), bgd, fgd, a[8], a[9]);
        a[2].set(mask.clone()); a[5].set(bgd.clone()); a[7].set(fgd.clone());
      },
      applyColorMap: (a) => { const d = newMat(); cv.applyColorMap(M(a[0]), d, a[2]); a[1].set(d); },
      phaseCorrelate: () => { throw new CvError(-213, 'phaseCorrelate 는 브라우저 실습 환경에서 지원하지 않습니다', 'phaseCorrelate'); },
      CLAHE_create: (a) => { rets = [addObj(new cv.CLAHE(a[0], S(a[1])))]; },
      CLAHE_apply: (a) => { const d = newMat(); obj(a[0], 'CLAHE').apply(M(a[1]), d); a[2].set(d); },
      CLAHE_set: (a) => { const o = obj(a[0], 'CLAHE'); o.setClipLimit(a[1]); o.setTilesGridSize(S(a[2])); },

      // ------------------------------------------------ 그리기 (입력 이미지에 그린 뒤 C++ Mat 에 되돌려 쓴다)
      line: (a) => { const m = M(a[0]); cv.line(m, P(a[1]), P(a[2]), sc(a[3]), a[4], a[5], a[6]); a[7].set(m.clone()); },
      arrowedLine: (a) => { const m = M(a[0]); cv.arrowedLine(m, P(a[1]), P(a[2]), sc(a[3]), a[4], a[5], a[6], a[7]); a[8].set(m.clone()); },
      rectangle: (a) => { const m = M(a[0]); cv.rectangle(m, P(a[1]), P(a[2]), sc(a[3]), a[4], a[5], a[6]); a[7].set(m.clone()); },
      circle: (a) => { const m = M(a[0]); cv.circle(m, P(a[1]), a[2], sc(a[3]), a[4], a[5], a[6]); a[7].set(m.clone()); },
      ellipse: (a) => { const m = M(a[0]); cv.ellipse(m, P(a[1]), S(a[2]), a[3], a[4], a[5], sc(a[6]), a[7], a[8], a[9]); a[10].set(m.clone()); },
      ellipseBox: (a) => { const m = M(a[0]); cv.ellipse1(m, RR(a[1]), sc(a[2]), a[3], a[4]); a[5].set(m.clone()); },
      drawMarker: (a) => { const m = M(a[0]); cv.drawMarker(m, P(a[1]), sc(a[2]), a[3], a[4], a[5], a[6]); a[7].set(m.clone()); },
      fillConvexPoly: (a) => { const m = M(a[0]); cv.fillConvexPoly(m, M(a[1]), sc(a[2]), a[3], a[4]); a[5].set(m.clone()); },
      fillPoly: (a) => { const m = M(a[0]); cv.fillPoly(m, polyList(a[1]), sc(a[2]), a[3], a[4], P(a[5])); a[6].set(m.clone()); },
      polylines: (a) => { const m = M(a[0]); cv.polylines(m, polyList(a[1]), !!a[2], sc(a[3]), a[4], a[5], a[6]); a[7].set(m.clone()); },
      putText: (a) => {
        const m = M(a[0]);
        if (/[^\x00-\x7f]/.test(a[1])) noteOnce('putTextKo', 'putText 는 영문·숫자만 그릴 수 있습니다 (Hershey 글꼴). 한글은 ? 로 나옵니다 — 실제 OpenCV 도 같습니다.');
        cv.putText(m, a[1], P(a[2]), a[3], a[4], sc(a[5]), a[6], a[7], !!a[8]);
        a[9].set(m.clone());
      },
      getTextSize: (a) => {
        const [text, ff, fs, th] = a;
        const lines = HERSHEY_LINES[ff & 7] || [9, 12];
        const h = Math.round((lines[0] + lines[1]) * fs + (th + 1) / 2);
        const base = Math.round(lines[0] * fs + th * 0.5);
        let width = 0;
        if (text.length) { const adv = inkRight(text + 'l', ff, fs, 1) - inkRight('l', ff, fs, 1); width = Math.round(adv + th); }
        rets = [width, h, base];
      },
      getFontScaleFromHeight: (a) => { rets = [cv.getFontScaleFromHeight(a[0], a[1], a[2])]; },
      clipLine: (a) => {
        const [w, h] = a[0];
        let [x1, y1] = a[1], [x2, y2] = a[2];
        let t0 = 0, t1 = 1;
        const dx = x2 - x1, dy = y2 - y1;
        const clip = (p, q) => { if (p === 0) return q >= 0; const r = q / p; if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; } return true; };
        const ok = clip(-dx, x1) && clip(dx, w - 1 - x1) && clip(-dy, y1) && clip(dy, h - 1 - y1);
        if (!ok) { rets = [0, x1, y1, x2, y2]; return; }
        rets = [1, Math.round(x1 + t0 * dx), Math.round(y1 + t0 * dy), Math.round(x1 + t1 * dx), Math.round(y1 + t1 * dy)];
      },

      // ------------------------------------------------ imgcodecs · highgui
      imread: (a) => {
        const [fn, flags] = a;
        const raw = host.fs && host.fs.readImage ? host.fs.readImage(fn) : null;
        if (!raw) {
          if (host.write) host.write('e', `[ WARN:0@0.001] global loadsave.cpp:275 findDecoder imread_('${fn}'): can't open/read file: check file path/integrity\n`);
          noteOnce('imread:' + fn, `imread: '${fn}' 파일이 없어 빈 Mat 을 돌려줍니다. 📁 작업 폴더에서 파일 이름을 확인하세요 (예: images/sample_color.png).`);
          return;
        }
        a[2].set(applyReadFlags(rawToMat(raw), flags));
      },
      imwrite: (a) => {
        const [fn, img] = a;
        const m = M(img);
        if (m.empty()) throw new CvError(-215, '!_img.empty()', 'imwrite');
        const m8 = to8u(m, true);
        if (m8.channels() === 2) throw new CvError(-215, 'image.channels() == 1 || image.channels() == 3 || image.channels() == 4', 'imwrite_');
        const raw = rawOf(m8);
        const bytes = host.encodePng(raw);
        host.fs.write(fn, bytes, raw);
        rets = [1];
      },
      haveImageReader: (a) => { rets = [host.fs && host.fs.exists(a[0]) ? 1 : 0]; },
      imencode: (a) => {
        const m = to8u(M(a[1]), true);
        const bytes = host.encodePng(rawOf(m));
        const out = new cv.Mat(1, bytes.length, cv.CV_8UC1);
        out.data.set(bytes);
        a[2].set(out);
        rets = [1];
        if (!/png/i.test(a[0])) noteOnce('imencode', 'imencode: 브라우저 실습 환경에서는 PNG 형식으로 인코딩합니다.');
      },
      imdecode: (a) => {
        const m = M(a[0]);
        const bytes = new Uint8Array(m.isContinuous() ? m.data : m.clone().data);
        let raw = null;
        try { raw = host.decodePng(bytes); } catch (e) { raw = null; }
        if (!raw) return;
        a[2].set(applyReadFlags(rawToMat(raw), a[1]));
      },
      imshow: (a) => {
        const [name, img] = a;
        const m = M(img);
        if (m.empty()) throw new CvError(-215, 'size.width>0 && size.height>0', 'imshow', 'window.cpp:973');
        if (m.channels() === 2 || m.channels() > 4) throw new CvError(-215, 'cn == 1 || cn == 3 || cn == 4', 'imshow');
        const raw = rawOf(to8u(m, false));
        host.imshow(name, raw.w, raw.h, raw.ch, raw.bytes);
      },
      waitKey: (a) => { rets = [host.waitKey ? host.waitKey(a[0]) : -1]; },
      namedWindow: () => {},
      destroyWindow: (a) => { if (host.destroyWindow) host.destroyWindow(a[0]); },
      destroyAllWindows: () => { if (host.destroyWindow) host.destroyWindow('*'); },

      // ------------------------------------------------ videoio (카메라 = 컨베이어 시뮬레이션 영상)
      vc_open: (a) => {
        const [isCam, index, fn] = a;
        if (isCam && index !== 0) { noteOnce('cam' + index, `카메라 ${index} 번을 열 수 없습니다. 브라우저 실습 환경에는 카메라 0 번(시뮬레이션)만 있습니다.`); rets = [0]; return; }
        const h = host.videoOpen ? host.videoOpen(isCam ? index : fn) : null;
        if (!h) {
          if (!isCam) noteOnce('vid:' + fn, `동영상 '${fn}' 을(를) 열 수 없습니다. 브라우저 실습 환경에서는 'conveyor.mp4' 같은 이름이 컨베이어 시뮬레이션 영상으로 열립니다.`);
          rets = [0]; return;
        }
        if (isCam) noteOnce('camsim', '📷 카메라 0 번은 브라우저 실습 환경에서 컨베이어 시뮬레이션 영상으로 동작합니다 (실제 웹캠은 Visual Studio 에서 같은 코드로 씁니다).');
        rets = [addObj({ video: h })];
      },
      vc_read: (a) => {
        const v = obj(a[0], 'VideoCapture').video;
        const f = host.videoRead(v);
        if (!f) { if (v.endNote) noteOnce('end' + a[0], v.endNote); rets = [0]; return; }
        const m = rawToMat(f);
        if (m.channels() === 1) { const t = new cv.Mat(); cv.cvtColor(m, t, cv.COLOR_GRAY2BGR); m.delete(); a[1].set(t); } else a[1].set(m);
        rets = [1];
      },
      vc_get: (a) => {
        const v = obj(a[0], 'VideoCapture').video;
        const p = a[1];
        rets = [p === 3 ? v.w : p === 4 ? v.h : p === 5 ? v.fps : p === 7 ? (v.isCam ? -1 : v.count) : p === 1 ? v.pos : p === 0 ? v.pos * 1000 / v.fps : p === 16 ? 1 : -1];
      },
      vc_set: (a) => {
        const v = obj(a[0], 'VideoCapture').video;
        if (a[1] === 1 && !v.isCam) { v.pos = Math.max(0, Math.min(v.count, Math.round(a[2]))); rets = [1]; return; }
        if (a[1] === 3 || a[1] === 4) noteOnce('camset', '카메라 해상도 설정(CAP_PROP_FRAME_WIDTH/HEIGHT)은 시뮬레이션 카메라에서 바뀌지 않습니다.');
        rets = [0];
      },
      vw_open: (a) => { noteOnce('vw:' + a[0], `🎞 VideoWriter('${a[0]}'): 브라우저 실습 환경에서는 동영상 파일을 만들지 않고 프레임 수만 셉니다.`); },
      vw_write: () => {},
      vw_release: (a) => { if (host.note && a[1]) host.note(`🎞 VideoWriter('${a[0]}'): ${a[1]} 프레임을 기록했습니다 (브라우저에서는 파일을 만들지 않음).`); },

      // ------------------------------------------------ features
      ORB_create: (a) => { const o = new cv.ORB(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]); rets = [addObj(o)]; },
      ORB_setMaxFeatures: (a) => { obj(a[0], 'ORB').setMaxFeatures(a[1]); },
      // OpenCV.js 5.0 의 FAST 비최대 억제가 결과를 비우므로, 억제 없이 검출한 뒤 여기서 3×3 비최대 억제를 한다
      FAST_create: (a) => { const o = new cv.FastFeatureDetector(a[0], false, a[2]); o._nms = !!a[1]; rets = [addObj(o)]; },
      GFTT_create: (a) => { const o = new cv.GFTTDetector(a[0], a[1], a[2], a[3], !!a[4], a[5]); rets = [addObj(o)]; },
      Blob_create: (a) => {
        const v = a[0];
        const det = new cv.SimpleBlobDetector();
        const p = det.getParams();
        const keys = ['thresholdStep', 'minThreshold', 'maxThreshold', 'minRepeatability', 'minDistBetweenBlobs', 'filterByColor', 'blobColor', 'filterByArea', 'minArea', 'maxArea',
          'filterByCircularity', 'minCircularity', 'maxCircularity', 'filterByInertia', 'minInertiaRatio', 'maxInertiaRatio', 'filterByConvexity', 'minConvexity', 'maxConvexity'];
        keys.forEach((k, i) => { try { p[k] = /^filterBy/.test(k) ? !!v[i] : v[i] > 1e29 ? 3.4e38 : v[i]; } catch (e) { /* 무시 */ } });
        det.setParams(p);
        rets = [addObj(det)];
      },
      f2d_detect: (a) => {
        const o = obj(a[0], 'Feature2D');
        const kv = new cv.KeyPointVector();
        o.detect(M(a[1]), kv, M(a[3]));
        if (o._nms) { const k2 = fastNms(kv); kv.delete(); a[2].setRaw(packKP(k2), k2.size(), KP_SIZE); k2.delete(); return; }
        a[2].setRaw(packKP(kv), kv.size(), KP_SIZE); kv.delete();
      },
      f2d_compute: (a) => { const kv = readKP(a[2]); const d = newMat(); obj(a[0], 'Feature2D').compute(M(a[1]), kv, d); a[3].setRaw(packKP(kv), kv.size(), KP_SIZE); a[4].set(d); },
      f2d_detectAndCompute: (a) => {
        const kv = new cv.KeyPointVector(); const d = newMat();
        obj(a[0], 'Feature2D').detectAndCompute(M(a[1]), M(a[2]), kv, d, false);
        a[3].setRaw(packKP(kv), kv.size(), KP_SIZE); kv.delete();
        if (a[4]) a[4].set(d); else d.delete();
      },
      BFMatcher_create: (a) => { rets = [addObj(new cv.BFMatcher(a[0], !!a[1]))]; },
      dm_match: (a) => { const v = new cv.DMatchVector(); obj(a[0], 'DescriptorMatcher').match(M(a[1]), M(a[2]), v, M(a[4])); a[3].setRaw(packDM(v), v.size(), DM_SIZE); v.delete(); },
      dm_knnMatch: (a) => {
        const vv = new cv.DMatchVectorVector();
        obj(a[0], 'DescriptorMatcher').knnMatch(M(a[1]), M(a[2]), vv, a[4], M(a[5]), !!a[6]);
        const list = [];
        for (let i = 0; i < vv.size(); i++) { const v = vv.get(i); list.push({ bytes: packDM(v), count: v.size() }); v.delete(); }
        a[3].setRawList(list, DM_SIZE); vv.delete();
      },
      dm_radiusMatch: (a) => {
        const vv = new cv.DMatchVectorVector();
        obj(a[0], 'DescriptorMatcher').radiusMatch(M(a[1]), M(a[2]), vv, a[4], M(a[5]), !!a[6]);
        const list = [];
        for (let i = 0; i < vv.size(); i++) { const v = vv.get(i); list.push({ bytes: packDM(v), count: v.size() }); v.delete(); }
        a[3].setRawList(list, DM_SIZE); vv.delete();
      },
      drawKeypoints: (a) => {
        const d = (a[5] & 1) && a[3] && !a[3].empty ? a[3].mat().clone() : new cv.Mat();
        cv.drawKeypoints(M(a[0]), readKP(a[1]), d, sc(a[4]), a[5]);
        a[2].set(d);
      },
      drawMatches: (a) => {
        const d = (a[10] & 1) && a[6] && !a[6].empty ? a[6].mat().clone() : new cv.Mat();
        const mask = [];
        if (a[9] instanceof MatArg && !a[9].empty) { const mm = a[9].mat(); for (let i = 0; i < mm.rows; i++) mask.push(mm.data8S ? mm.data8S[i] : mm.data[i]); }
        cv.drawMatches(M(a[0]), readKP(a[1]), M(a[2]), readKP(a[3]), readDM(a[4]), d, sc(a[7]), sc(a[8]), mask, a[10]);
        a[5].set(d);
      },

      // ------------------------------------------------ geometry
      findHomography: (a) => {
        const mask = outMat(a[4]);
        const H = cv.findHomography(pts32f(a[0]), pts32f(a[1]), a[2], a[3], mask, a[5], a[6]);
        put(a[4], mask);
        a[7].set(H);
      },
      perspectiveTransform: (a) => { const d = newMat(); cv.perspectiveTransform(M(a[0]), d, M(a[2])); a[1].set(d); },
      transform: (a) => { const d = newMat(); cv.transform(M(a[0]), d, M(a[2])); a[1].set(d); },
      estimateAffine2D: (a) => { const inl = outMat(a[2]); const Mx = cv.estimateAffine2D(pts32f(a[0]), pts32f(a[1]), inl, a[3], a[4], a[5], a[6], a[7]); put(a[2], inl); a[8].set(Mx); },
      estimateAffinePartial2D: () => { throw new CvError(-213, 'estimateAffinePartial2D 는 브라우저 실습 환경에서 지원하지 않습니다 (estimateAffine2D 를 쓰세요)', 'estimateAffinePartial2D'); },
      Rodrigues: (a) => { const d = newMat(), j = outMat(a[2]); cv.Rodrigues(M(a[0]), d, j); a[1].set(d); put(a[2], j); },

      // ------------------------------------------------ video
      MOG2_create: (a) => { rets = [addObj(new cv.BackgroundSubtractorMOG2(a[0], a[1], !!a[2]))]; },
      bs_apply: (a) => { const d = newMat(); obj(a[0], 'BackgroundSubtractor').apply(M(a[1]), d, a[3]); a[2].set(d); },
      bs_getBackgroundImage: (a) => {
        const o = obj(a[0], 'BackgroundSubtractor');
        if (!o.getBackgroundImage) { noteOnce('bgimg', 'getBackgroundImage 는 브라우저 실습 환경에서 지원하지 않습니다.'); return; }
        const d = newMat(); o.getBackgroundImage(d); a[1].set(d);
      },
      calcOpticalFlowPyrLK: (a) => {
        const next = a[3] instanceof MatArg && !a[3].empty && (a[10] & 4) ? a[3].mat().clone() : new cv.Mat();
        const st = outMat(a[5]), er = outMat(a[6]);
        cv.calcOpticalFlowPyrLK(M(a[0]), M(a[1]), pts32f(a[2]), next, st, er, S(a[7]), a[8], TC(a[9]), a[10], a[11]);
        a[4].set(next); put(a[5], st); put(a[6], er);
      },
      calcOpticalFlowFarneback: (a) => { const d = newMat(); cv.calcOpticalFlowFarneback(M(a[0]), M(a[1]), d, a[3], a[4], a[5], a[6], a[7], a[8], a[9]); a[2].set(d); },
      meanShift: (a) => {
        const win = R(a[1]);
        const r = cv.meanShift(M(a[0]), win, TC(a[2]));
        const it = Array.isArray(r) ? r[0] : r, w = Array.isArray(r) ? r[1] : win;
        rets = [it, w.x, w.y, w.width, w.height];
      },
      CamShift: (a) => {
        const win = R(a[1]);
        const r = cv.CamShift(M(a[0]), win, TC(a[2]));
        const box = Array.isArray(r) ? r[0] : r, w = Array.isArray(r) ? r[1] : win;
        rets = [box.center.x, box.center.y, box.size.width, box.size.height, box.angle, w.x, w.y, w.width, w.height];
      },

      // ------------------------------------------------ objdetect · photo
      QR_create: () => { rets = [addObj(new cv.QRCodeDetector())]; },
      QR_detect: (a) => { const p = newMat(); rets = [obj(a[0], 'QRCodeDetector').detect(M(a[1]), p) ? 1 : 0]; if (a[2]) a[2].set(p); else p.delete(); },
      QR_decode: (a) => { const s = newMat(); retStr = obj(a[0], 'QRCodeDetector').decode(M(a[1]), M(a[2]), s) || ''; if (a[3]) a[3].set(s); else s.delete(); },
      QR_detectAndDecode: (a) => {
        const p = newMat(), s = newMat();
        retStr = obj(a[0], 'QRCodeDetector').detectAndDecode(M(a[1]), p, s) || '';
        if (a[2]) a[2].set(p); else p.delete();
        if (a[3]) a[3].set(s); else s.delete();
      },
      inpaint: (a) => { const d = newMat(); cv.inpaint(M(a[0]), M(a[1]), d, a[3], a[4]); a[2].set(d); }
    };

    /** FAST 비최대 억제: 3×3 이웃 안에서 점수(response)가 가장 큰 점만 남긴다 */
    function fastNms(kv) {
      const map = new Map();
      const n = kv.size();
      const list = [];
      for (let i = 0; i < n; i++) { const k = kv.get(i); list.push(k); map.set(Math.round(k.pt.y) * 100000 + Math.round(k.pt.x), k.response); }
      const out = new cv.KeyPointVector();
      for (const k of list) {
        const x = Math.round(k.pt.x), y = Math.round(k.pt.y);
        let keep = true;
        for (let dy = -1; dy <= 1 && keep; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const r = map.get((y + dy) * 100000 + x + dx);
          if (r !== undefined && (r > k.response || (r === k.response && (dy < 0 || (dy === 0 && dx < 0))))) { keep = false; break; }
        }
        if (keep) out.push_back(k);
      }
      return out;
    }
    /** Nx1 CV_32FC2 점 목록 (정수 점이면 변환) */
    function pts32f(a) {
      const m = M(a);
      if (m.empty() || m.type() === cv.CV_32FC2) return m;
      const t = track(new cv.Mat());
      if (m.channels() === 2) m.convertTo(t, cv.CV_32F);
      else { const r = m.reshape(2, m.rows * m.cols / 2); r.convertTo(t, cv.CV_32F); r.delete(); }
      return t;
    }
    /** inRange 경계: Scalar 는 입력과 같은 크기·형식 Mat 으로 (음수 · 범위 초과는 잘라 낸다) */
    function rangeMat(a, like) { return isScalarLike(a) ? M(a, like) : M(a); }
    function polyList(a) {
      if (a instanceof ListArg) return V(a);
      const mv = track(new cv.MatVector());
      if (a instanceof MatArg && !a.empty) mv.push_back(a.mat());
      return mv;
    }
    /** goodFeaturesToTrack (OpenCV.js 에 함수가 없어 OpenCV 와 같은 알고리즘으로 구현) */
    function gftt(img, maxCorners, quality, minDist, mask, blockSize, harris, k) {
      const eig = track(new cv.Mat());
      if (harris) cv.cornerHarris(img, eig, blockSize, 3, k); else cv.cornerMinEigenVal(img, eig, blockSize, 3);
      const mm = cv.minMaxLoc(eig);
      const thr = mm.maxVal * quality;
      const tmp = track(new cv.Mat());
      cv.dilate(eig, tmp, track(new cv.Mat()));
      const W = eig.cols, H = eig.rows;
      const e = eig.data32F, t = tmp.data32F;
      const md = mask && !mask.empty() ? mask.data : null;
      const cand = [];
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
        const i = y * W + x, v = e[i];
        if (v > thr && v === t[i] && (!md || md[i])) cand.push([v, x, y]);
      }
      cand.sort((p, q) => q[0] - p[0] || p[2] - q[2] || p[1] - q[1]);
      const out = [];
      if (minDist >= 1) {
        const cell = Math.round(minDist), gw = Math.floor((W + cell - 1) / cell), gh = Math.floor((H + cell - 1) / cell);
        const grid = Array.from({ length: gw * gh }, () => []);
        const md2 = minDist * minDist;
        for (const [, x, y] of cand) {
          const xc = Math.floor(x / cell), yc = Math.floor(y / cell);
          let good = true;
          for (let yy = Math.max(yc - 1, 0); yy <= Math.min(yc + 1, gh - 1) && good; yy++) for (let xx = Math.max(xc - 1, 0); xx <= Math.min(xc + 1, gw - 1) && good; xx++) {
            for (const [px, py] of grid[yy * gw + xx]) { const dx = x - px, dy = y - py; if (dx * dx + dy * dy < md2) { good = false; break; } }
          }
          if (good) { grid[yc * gw + xc].push([x, y]); out.push([x, y]); if (maxCorners > 0 && out.length === maxCorners) break; }
        }
      } else for (const [, x, y] of cand) { out.push([x, y]); if (maxCorners > 0 && out.length === maxCorners) break; }
      const m = new cv.Mat(out.length, 1, cv.CV_32FC2);
      out.forEach(([x, y], i) => { m.data32F[2 * i] = x; m.data32F[2 * i + 1] = y; });
      return m;
    }

    function errorText(e) {
      if (typeof e === 'number') {
        try { const ex = cv.exceptionFromPtr(e); return String(ex.msg || ex.message || e); } catch (e2) { return 'OpenCV 오류 (' + e + ')'; }
      }
      if (e && e.message) return String(e.message);
      return String(e);
    }
    function cleanup() {
      for (const o of outs) if (o) { if (o.mat) try { o.mat.delete(); } catch (e) { /* 무시 */ } if (o.mats) o.mats.forEach((m) => { try { m.delete(); } catch (e) { /* 무시 */ } }); }
      outs = [];
      for (const m of temps) try { if (!m.isDeleted || !m.isDeleted()) m.delete(); } catch (e) { /* 무시 */ }
      temps = [];
    }

    const imports = {
      call(namePtr, nameLen, argsPtr, nwords) {
        cleanup();
        rets = []; retStr = ''; errText = '';
        const name = dec.decode(u8().slice(namePtr, namePtr + nameLen));
        const fn = F[name];
        try {
          if (!fn) throw new CvError(-213, `${name} 는 브라우저 실습 환경에서 아직 지원하지 않습니다`, name);
          const args = decodeArgs(argsPtr, nwords);
          const r = fn(args);
          if (typeof r === 'number') rets = [r];
          return 0;
        } catch (e) {
          if (e && e.isExit) throw e;
          if (e && e.name === 'StopSignal') throw e;
          errText = errorText(e).replace(/OpenCV\(5\.0\.0-pre\)/g, 'OpenCV(5.0.0)').replace(/\/home\/\S*?\/opencv\/modules\//g, 'opencv/modules/');
          if (!/OpenCV\(/.test(errText)) errText = `OpenCV(5.0.0) ${name}: error: (-2:Unspecified error) ${errText} in function '${name}'\n`;
          return -1;
        }
      },
      outinfo(slot, sub, infoPtr) {
        const o = outs[slot];
        const view = dv();
        const wr = (k, v) => view.setInt32(infoPtr + 4 * k, v, true);
        if (!o) return 0;
        if (sub < 0) {
          if (o.kind === 1) {
            if (o.raw) { wr(0, 0); wr(1, o.count); wr(2, 1); return 1; }
            const m = o.mat;
            wr(0, m.type()); wr(1, m.empty() ? 0 : m.rows); wr(2, m.empty() ? 0 : m.cols);
            return 1;
          }
          wr(0, o.mats ? o.mats.length : o.raws.length);
          return 2;
        }
        if (o.raws) { const r = o.raws[sub]; wr(0, 0); wr(1, r.count); wr(2, 1); return 1; }
        const m = o.mats[sub];
        wr(0, m.type()); wr(1, m.empty() ? 0 : m.rows); wr(2, m.empty() ? 0 : m.cols);
        return 1;
      },
      outcopy(slot, sub, dst, step) {
        const o = outs[slot];
        if (!o) return;
        const mem = u8();
        if (o.raw) { mem.set(o.raw, dst); return; }
        if (o.raws) { mem.set(o.raws[sub].bytes, dst); return; }
        const m = sub < 0 ? o.mat : o.mats[sub];
        if (m.empty()) return;
        const src = m.isContinuous() ? m : track(m.clone());
        const rowBytes = m.cols * m.channels() * DEPTH_SIZE[m.depth()];
        const data = src.data;
        if (step === rowBytes) mem.set(data.subarray(0, rowBytes * m.rows), dst);
        else for (let r = 0; r < m.rows; r++) mem.set(data.subarray(r * rowBytes, (r + 1) * rowBytes), dst + r * step);
      },
      ret(i) { const v = rets[i]; return typeof v === 'number' ? v : v ? 1 : 0; },
      nret() { return rets.length; },
      retstr(buf, cap) { const b = enc.encode(retStr); const n = Math.min(b.length, cap); u8().set(b.subarray(0, n), buf); return n; },
      errmsg(buf, cap) { const b = enc.encode(errText); const n = Math.min(b.length, cap); u8().set(b.subarray(0, n), buf); return n; }
    };

    return {
      imports,
      setMemory(m) { memory = m; },
      /** 실행이 끝나면 호출: OpenCV.js 객체 정리 */
      dispose() {
        cleanup();
        for (const o of objs.values()) if (o && o.delete) try { o.delete(); } catch (e) { /* 무시 */ }
        objs.clear();
      },
      reset() { try { cv.setRNGSeed(0x12345678); } catch (e) { /* 무시 */ } },
      functions: F
    };
  }

  const api = { create, typeName, makeType };
  root.CvBridge = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
