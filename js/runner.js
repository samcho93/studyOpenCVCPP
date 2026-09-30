/* 결과 창(콘솔) + 코드 실행 — C++ (브라우저 Clang + OpenCV 5.0 C++ API + OpenCV.js)
 *  - 컴파일 오류 · 경고(줄 이동), 표준 출력 · 오류, 실행 중 입력(cin), imshow 이미지 창(라이브), waitKey 키 입력
 *  - clang · OpenCV 오류 메시지 → 한국어 도움말
 */
(function () {
  const { esc } = window.JU;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* 저장 불가 환경 */ } }
  };
  const E = window.CvEngine;

  // ------------------------------------------------------------------ 오류 도움말
  const COMPILE_HINTS = [
    [/'opencv2\/.*' file not found/, 'OpenCV 헤더 이름을 확인하세요. 보통 <code>#include &lt;opencv2/opencv.hpp&gt;</code> 하나면 모든 기능을 쓸 수 있습니다.'],
    [/expected ';'/, '문장 끝에 <b>세미콜론(;)</b>이 빠졌습니다. 표시된 줄이나 바로 윗줄 끝을 확인하세요.'],
    [/use of undeclared identifier '(Mat|imread|imshow|waitKey|cvtColor|Point|Size|Rect|Scalar|Vec3b|COLOR_\w+|THRESH_\w+|IMREAD_\w+|CV_\w+)'/, 'OpenCV 이름입니다. <code>cv::</code> 를 붙이거나 <code>using namespace cv;</code> 를 쓰세요. <code>#include &lt;opencv2/opencv.hpp&gt;</code> 가 있는지도 확인하세요.'],
    [/use of undeclared identifier '(cout|cin|endl|string|vector|cerr)'/, '<code>std::</code> 를 붙이거나 <code>using namespace std;</code> 를 쓰세요. <code>#include &lt;iostream&gt;</code> 도 확인하세요.'],
    [/no member named '(\w+)' in namespace 'cv'/, 'OpenCV 함수 · 상수 이름의 <b>철자와 대소문자</b>를 확인하세요. C++ OpenCV 는 함수는 <b>camelCase</b>(<code>cvtColor</code>, <code>GaussianBlur</code>), 상수는 <b>대문자</b>(<code>COLOR_BGR2GRAY</code>, <code>THRESH_BINARY</code>)를 씁니다.'],
    [/no member named '(Rows|Cols|Width|Height|Channels|Type|Empty|Clone)'/, 'C++ OpenCV 의 멤버는 <b>소문자</b>입니다: <code>img.rows</code>, <code>img.cols</code>, <code>img.channels()</code>, <code>img.type()</code>, <code>img.empty()</code>, <code>img.clone()</code>, <code>rect.width</code>.'],
    [/reference to non-static member function must be called|called object type .* is not a function/, '멤버 함수는 <b>괄호()</b>를 붙여 부르고(<code>img.channels()</code>), 멤버 변수는 괄호 없이 씁니다(<code>img.rows</code>, <code>img.cols</code>).'],
    [/use of undeclared identifier|unknown type name/, '선언하지 않은 <b>이름</b>입니다. 철자 · 대소문자, 필요한 <code>#include</code>, <code>using namespace cv;</code>, 변수를 선언한 범위(블록 { })를 확인하세요.'],
    [/file not found/, '<code>#include</code> 한 헤더를 찾을 수 없습니다. 표준 헤더는 <code>&lt; &gt;</code>, OpenCV 는 <code>&lt;opencv2/opencv.hpp&gt;</code> 입니다.'],
    [/expected '\}'|expected '\)'|expected '\]'|extraneous closing brace/, '<b>괄호 짝</b>이 맞지 않습니다. 여는 괄호와 닫는 괄호의 개수를 세어 보세요.'],
    [/missing terminating/, '문자열의 <b>큰따옴표(")</b>가 닫히지 않았습니다.'],
    [/no matching function for call to '(\w+)'/, 'OpenCV 함수의 <b>인수 개수 · 자료형</b>이 맞지 않습니다. 예: <code>threshold(src, dst, 128, 255, THRESH_BINARY)</code> 처럼 <b>출력 Mat 을 인수로</b> 넘기고, <code>Size(5, 5)</code> · <code>Point(x, y)</code> · <code>Scalar(b, g, r)</code> 형식을 확인하세요. 아래 <code>note:</code> 에 후보 함수가 있습니다.'],
    [/no matching constructor|too (many|few) arguments/, '함수 · 생성자의 <b>인수 개수나 자료형</b>이 선언과 다릅니다. 아래 <code>note:</code> 에 후보가 표시됩니다.'],
    [/no viable conversion|cannot initialize|cannot convert|incompatible/, '<b>자료형이 맞지 않습니다.</b> 예: <code>Mat</code> 과 <code>vector&lt;Point&gt;</code>, <code>Point</code> 와 <code>Point2f</code>, <code>int</code> 와 <code>Scalar</code> 를 구분하세요.'],
    [/invalid operands to binary expression/, '이 연산자를 쓸 수 없는 <b>자료형 조합</b>입니다. <code>Vec3b</code> 원소는 <code>(int)p[0]</code> 처럼 숫자로 바꿔 계산하세요.'],
    [/non-void function does not return a value/, '반환형이 있는 함수는 모든 경우에 <code>return 값;</code> 이 있어야 합니다.'],
    [/redefinition of/, '같은 범위에 <b>같은 이름</b>이 이미 정의되어 있습니다.'],
    [/undefined symbol: main/, '<code>int main()</code> 함수가 있어야 실행할 수 있습니다.'],
    [/undefined symbol/, '선언만 하고 <b>정의(몸체)가 없는 함수</b>를 호출했습니다.'],
    [/expected expression/, '문법 오류입니다. 연산자 · 괄호 · 쉼표의 위치를 확인하세요.'],
    [/template/, '템플릿 관련 오류입니다. <code>at&lt;Vec3b&gt;</code> 처럼 <b>&lt;자료형&gt;</b> 을 빠뜨리지 않았는지 확인하고, 첫 번째 <code>error</code> 줄부터 읽으세요.']
  ];
  const RUNTIME_HINTS = [
    [/!_src\.empty\(\)|!_img\.empty\(\)|size\.width>0 && size\.height>0|!src\.empty\(\)|!ssize\.empty\(\)|!image\.empty\(\)/, '<b>이미지가 비어 있습니다.</b> <code>imread</code> 의 파일 이름을 확인하세요. 예제 이미지는 <code>images/…png</code> 이며 📁 작업 폴더에서 목록을 볼 수 있습니다. 읽은 뒤 <code>if (img.empty())</code> 로 검사하는 습관을 들이세요.'],
    [/VScn::contains\(scn\)|Invalid number of channels|scn == 3 \|\| scn == 4/, '<b>채널 수</b>가 맞지 않습니다. 이미 흑백(1채널)인 이미지에 <code>COLOR_BGR2GRAY</code> 를 쓰지 않았는지 <code>img.channels()</code> 로 확인하세요.'],
    [/in function 'at'|\(unsigned\)i0 < \(unsigned\)size\.p\[0\]/, '<code>at&lt;T&gt;(y, x)</code> 의 <b>좌표가 범위를 벗어났거나 자료형 T 가 Mat 과 다릅니다.</b> 순서는 <b>(행 y, 열 x)</b>, 0 ≤ y &lt; rows, 0 ≤ x &lt; cols 입니다. 8비트 컬러는 <code>at&lt;Vec3b&gt;</code>, 흑백은 <code>at&lt;uchar&gt;</code>, 실수 Mat 은 <code>at&lt;float&gt;</code> 입니다.'],
    [/roi\.x \+ roi\.width <= m\.cols|0 <= roi\.x/, '<b>ROI(Rect)가 이미지 밖으로</b> 나갔습니다. <code>Rect(x, y, w, h)</code> 가 <code>x + w ≤ cols</code>, <code>y + h ≤ rows</code> 인지 확인하세요. <code>rect &amp; Rect(0, 0, img.cols, img.rows)</code> 로 잘라 낼 수 있습니다.'],
    [/ksize\.width > 0 && ksize\.width % 2 == 1|ksize % 2 == 1|must be odd|ksize > 1 && ksize % 2 == 1/, '커널 크기(<b>ksize</b>)는 <b>양의 홀수</b>(3, 5, 7 …)여야 합니다.'],
    [/src\.type\(\) == CV_8UC1|_src\.type\(\) == CV_8UC1|depth == CV_8U|CV_8UC1|type\(\) == CV_8U/, '이 함수는 <b>8비트 1채널(CV_8UC1)</b> 이미지가 필요합니다. <code>cvtColor(img, gray, COLOR_BGR2GRAY)</code> 로 흑백으로 바꾸거나, <code>convertTo(dst, CV_8U)</code> 로 자료형을 바꾸세요.'],
    [/sizes of input arguments do not match|size\(\) == .*size\(\)|The operation is neither 'array op array'/, '두 이미지의 <b>크기 · 채널 · 자료형</b>이 같아야 하는 연산입니다. <code>img.size()</code>, <code>img.type()</code> 을 출력해 비교하고 <code>resize</code> · <code>cvtColor</code> 로 맞추세요.'],
    [/Assertion failed/, 'OpenCV 함수가 <b>조건 검사(Assertion)</b>에 실패했습니다. 메시지의 조건식과 함수 이름을 보면 원인을 알 수 있습니다. 입력의 <b>크기 · 채널 · 자료형</b>을 <code>cout &lt;&lt; img.size() &lt;&lt; img.type()</code> 로 확인하세요.'],
    [/std::out_of_range|vector/, '<code>vector</code> 의 <b>인덱스 범위</b>를 벗어났습니다. <code>contours.size()</code> 등을 먼저 확인하세요.'],
    [/cv::Exception/, 'OpenCV 예외(<code>cv::Exception</code>)가 처리되지 않았습니다. <code>try { … } catch (const cv::Exception&amp; e) { cout &lt;&lt; e.what(); }</code> 로 잡을 수 있습니다.'],
    [/memory access out of bounds/i, '잘못된 <b>메모리 주소</b>에 접근했습니다. <code>ptr&lt;T&gt;(y)[x]</code> · 배열 인덱스 범위, 빈 Mat 의 <code>data</code> 를 확인하세요.'],
    [/stack overflow|call stack/i, '재귀가 끝나지 않았거나 지역 배열이 너무 큽니다.'],
    [/integer divide by zero/i, '<b>정수를 0으로 나누었습니다.</b> 면적 · 개수가 0 인 경우를 먼저 검사하세요.'],
    [/terminate called|uncaught/, '<b>처리하지 않은 예외</b>로 프로그램이 종료되었습니다. <code>try-catch</code> 로 잡아 보세요.']
  ];
  const TRAP_KO = [
    [/integer divide by zero/i, '정수를 0으로 나눔 (integer divide by zero)'],
    [/memory access out of bounds/i, '잘못된 메모리 접근 (memory access out of bounds)'],
    [/stack overflow|call stack/i, '스택 넘침 (stack overflow)'],
    [/unreachable/i, '비정상 종료 (abort)'],
    [/compile: /, '프로그램을 불러오지 못함 (브라우저가 WebAssembly 예외 처리를 지원하지 않을 수 있습니다)']
  ];
  const hintFor = (list, text) => { for (const [re, h] of list) if (re.test(text)) return h; return null; };
  const trapText = (t) => { for (const [re, k] of TRAP_KO) if (re.test(t)) return k; return t; };
  const usesInput = (code) => /\bcin\b|getline\s*\(|scanf|getchar/.test(code);

  // ------------------------------------------------------------------ 콘솔
  class Console {
    constructor(el) {
      this.el = el;
      this.out = el.querySelector('#jcConsole');
      this.form = el.querySelector('#stdinForm');
      this.input = el.querySelector('#stdinInput');
      this.eofBtn = el.querySelector('#eofBtn');
      this.stopBtn = el.querySelector('#stopBtn');
      this.state = el.querySelector('#runState');
      this.left = el.querySelector('#statusLeft');
      this.right = el.querySelector('#statusRight');
      this.main = el.querySelector('#consoleMain');
      this.run = null;
      this.onJump = null;
      this.history = [];
      this.hIndex = 0;
      this.fontSize = +store.get('jc.consoleFont', 14);
      this.applyFont();

      this.form.addEventListener('submit', (e) => { e.preventDefault(); this.sendLine(); });
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'd' && e.ctrlKey) { e.preventDefault(); this.sendEof(); }
        if (e.key === 'c' && e.ctrlKey && !this.input.selectionEnd) { e.preventDefault(); this.stop(); }
        if (e.key === 'ArrowUp' && this.history.length) { e.preventDefault(); this.hIndex = Math.max(0, this.hIndex - 1); this.input.value = this.history[this.hIndex] || ''; }
        if (e.key === 'ArrowDown' && this.history.length) { e.preventDefault(); this.hIndex = Math.min(this.history.length, this.hIndex + 1); this.input.value = this.history[this.hIndex] || ''; }
        e.stopPropagation();
      });
      this.eofBtn.addEventListener('click', () => this.sendEof());
      this.stopBtn.addEventListener('click', () => this.stop());
      el.querySelector('#clearBtn').addEventListener('click', () => this.clear());
      el.querySelector('#cFontUp').addEventListener('click', () => { this.fontSize = Math.min(28, this.fontSize + 1); this.applyFont(); });
      el.querySelector('#cFontDown').addEventListener('click', () => { this.fontSize = Math.max(10, this.fontSize - 1); this.applyFont(); });
      this.out.addEventListener('click', (e) => {
        const loc = e.target.closest('[data-jump]');
        if (loc && this.onJump && +loc.dataset.jump > 0) this.onJump(+loc.dataset.jump);
      });
      // waitKey: 실행 중 결과 창(또는 페이지)에서 누른 키를 프로그램으로 보낸다
      document.addEventListener('keydown', (e) => {
        const r = this.run;
        if (!r || r.done || !r.running) return;
        const t = e.target;
        if (t && t.closest && (t.closest('.CodeMirror') || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        let code = -1;
        if (e.key.length === 1) code = e.key.charCodeAt(0);
        else code = { Escape: 27, Enter: 13, ' ': 32, Backspace: 8, Tab: 9, ArrowLeft: 81, ArrowRight: 83, ArrowUp: 82, ArrowDown: 84 }[e.key] || -1;
        if (code < 0) return;
        E.key(code);
        if (code === 27 || e.key.length === 1) e.preventDefault();
      });
    }

    applyFont() { this.el.style.setProperty('--c-font', this.fontSize + 'px'); store.set('jc.consoleFont', this.fontSize); }
    clear() { this.out.innerHTML = ''; this.last = null; }
    atBottom() { return this.out.scrollHeight - this.out.scrollTop - this.out.clientHeight < 40; }

    write(cls, text) {
      if (!text) return;
      const stick = this.atBottom();
      const welcome = this.out.querySelector('.console-welcome');
      if (welcome) welcome.remove();
      if (this.last && this.last.className === cls && this.last.parentNode === this.out && this.last.textContent.length < 20000) this.last.textContent += text;
      else { const span = document.createElement('span'); span.className = cls; span.textContent = text; this.out.appendChild(span); this.last = span; }
      if (this.out.textContent.length > 300000) { while (this.out.firstChild && this.out.textContent.length > 200000) this.out.firstChild.remove(); }
      if (stick) this.out.scrollTop = this.out.scrollHeight;
    }
    html(html) {
      const stick = this.atBottom();
      const welcome = this.out.querySelector('.console-welcome');
      if (welcome) welcome.remove();
      const div = document.createElement('span');
      div.innerHTML = html;
      while (div.firstChild) this.out.appendChild(div.firstChild);
      this.last = null;
      if (stick) this.out.scrollTop = this.out.scrollHeight;
    }
    /** imshow: 같은 실행에서 같은 이름이면 같은 창을 새로 그린다 */
    showImage(run, name, w, h, ch, bytes) {
      if (!run.images) run.images = new Map();
      let win = run.images.get(name);
      if (!win) {
        const stick = this.atBottom();
        const welcome = this.out.querySelector('.console-welcome');
        if (welcome) welcome.remove();
        win = new window.MVImage.Window(name);
        run.images.set(name, win);
        this.out.appendChild(win.el);
        this.last = null;
        win.update(w, h, ch, bytes);
        if (stick) requestAnimationFrame(() => { this.out.scrollTop = this.out.scrollHeight; });
      } else win.update(w, h, ch, bytes);
    }
    closeWindow(run, name) {
      if (!run.images) return;
      if (name == null) { run.images.forEach((w) => w.el.remove()); run.images.clear(); return; }
      const w = run.images.get(name);
      if (w) { w.el.remove(); run.images.delete(name); }
    }
    setState(kind, text) { this.state.className = 'run-state ' + kind; this.state.textContent = text; }
    setRunning(on) { this.input.disabled = !on; this.eofBtn.disabled = !on; this.stopBtn.disabled = !on; if (!on) this.form.classList.remove('waiting'); }

    sendLine() {
      if (!this.run || this.run.done) return;
      const text = this.input.value;
      this.input.value = '';
      if (text) { this.history.push(text); this.hIndex = this.history.length; }
      this.write('i', text + '\n');
      this.form.classList.remove('waiting');
      E.input(text);
    }
    sendEof() { if (!this.run || this.run.done) return; this.write('m', '^D\n'); E.eof(); }
    stop() { const r = this.run; if (!r || r.done) return; r.stopped = true; E.stop(); }

    /**
     * 코드 컴파일 + 실행
     * @param {string} code
     * @param {{label?:string, stdin?:string, onDiagnostics?:Function, clear?:boolean, focusInput?:boolean}} opts
     */
    async execute(code, opts = {}) {
      if (this.run && !this.run.done) { this.run.superseded = true; E.stop(); await new Promise((r) => setTimeout(r, 450)); }
      const run = { code, done: false, label: opts.label || '', images: new Map() };
      this.run = run;
      if (opts.clear !== false && store.get('jc.keepConsole', '0') !== '1') this.clear();
      else if (this.out.textContent.trim()) this.html('<span class="run-sep"></span>');
      this.main.textContent = '⚙ C++' + (opts.label ? ' · ' + opts.label : '');
      if (opts.onDiagnostics) opts.onDiagnostics([]);

      if (!E.supported()) {
        this.setState('error', '실행 불가');
        this.html('<span class="hint"><b>⚠ 이 브라우저에서는 C++ 을 실행할 수 없습니다.</b><br>최신 Chrome · Edge · Firefox · Safari 를 사용하세요.</span>');
        run.done = true;
        return { ok: false };
      }
      if (E.state !== 'ready') {
        this.setState('compiling', '준비 중…');
        this.html(`<span class="hint"><b>⚙ 브라우저에서 C++ 컴파일러(Clang)와 OpenCV ${E.opencv} 을 준비하고 있습니다…</b><br>
          처음 한 번은 컴파일러(약 110MB)와 OpenCV.js(약 16MB)를 내려받느라 <b>30초 ~ 2분</b> 걸립니다. 이후에는 브라우저 캐시를 사용해 빨라집니다.</span>`);
        E.onChange((b) => { if (!run.done && b.state === 'loading') this.left.textContent = b.message || '준비 중…'; });
      }
      try { await E.load(); }
      catch (e) {
        this.setState('error', '준비 실패');
        this.write('e', 'C++ 실행 환경을 준비하지 못했습니다: ' + (e && e.message || e) + '\n');
        this.html('<span class="hint">인터넷 연결을 확인하고 페이지를 새로고침하세요. 파일을 직접 연 경우(<code>file://</code>)에는 동작하지 않습니다 — <code>start.bat</code> 으로 로컬 서버를 켜거나 GitHub Pages 주소로 접속하세요.</span>');
        run.done = true;
        return { ok: false };
      }
      if (run.superseded) return { ok: false };
      if (this.out.querySelector('.hint') && !this.out.textContent.includes('──')) this.clear();

      // ---- 컴파일
      this.setState('compiling', '컴파일 중…');
      this.left.textContent = '컴파일 중… (clang++ -std=c++17 · OpenCV 5.0)';
      this.right.textContent = '';
      const tc = performance.now();
      const tick0 = setInterval(() => { this.right.textContent = ((performance.now() - tc) / 1000).toFixed(1) + '초'; }, 100);
      let c;
      try { c = await E.compile(code); } finally { clearInterval(tick0); }
      if (run.superseded) return { ok: false };
      const diags = c.diagnostics || [];
      if (!c.ok) {
        run.done = true;
        this.setState('error', c.phase === 'compile' ? '컴파일 오류' : '오류');
        this.left.textContent = c.phase === 'compile' ? `✗ 컴파일 실패 (${diags.filter((d) => d.kind === 'error').length}개 오류)` : '✗ 실행 실패';
        this.showDiagnostics(c, true);
        if (opts.onDiagnostics) opts.onDiagnostics(diags);
        return { ok: false };
      }
      if (diags.length && store.get('jc.showWarnings', '1') === '1') this.showDiagnostics(c, false);
      if (opts.onDiagnostics) opts.onDiagnostics(diags);

      // ---- 실행
      let stdin = opts.stdin || '';
      if (E.mode === 'none' && usesInput(code) && !stdin) {
        const v = window.prompt('이 브라우저 환경에서는 실행 중에 입력을 받을 수 없습니다.\n프로그램에 넣을 입력값을 미리 적어 주세요. (여러 줄은 | 로 구분)', '');
        if (v == null) { run.done = true; this.setState('idle', '대기'); return { ok: false }; }
        stdin = v.split('|').join('\n') + '\n';
      }
      if (stdin) this.write('m', `[예시 입력을 자동으로 보냈습니다: ${stdin.replace(/\n$/, '').replace(/\n/g, ' ⏎ ')}]\n`);
      this.setRunning(true);
      run.running = true;
      this.setState('running', '실행 중');
      this.left.textContent = `▶ 실행 중 · 컴파일 ${(c.compileMs / 1000).toFixed(1)}초`;
      if (usesInput(code) && !stdin && opts.focusInput !== false) setTimeout(() => { if (!run.done) this.input.focus({ preventScroll: true }); }, 50);
      const started = performance.now();
      const tick = setInterval(() => { this.right.textContent = ((performance.now() - started) / 1000).toFixed(1) + '초'; }, 100);
      let stderr = '', endsWithNewline = true;
      let r;
      try {
        r = await E.run({
          wasm: c.wasm, data: c.data, code, stdin,
          onOutput: (s, text) => {
            if (run.superseded) return;
            if (s === 'e') stderr += text;
            this.write(s === 'e' ? 'e' : 'o', text);
            endsWithNewline = /\n$/.test(text);
          },
          onNote: (t) => { if (!run.superseded) { this.write('m', '💬 ' + t + '\n'); endsWithNewline = true; } },
          onImage: (name, w, h, ch, bytes) => { if (!run.superseded) { this.showImage(run, name, w, h, ch, bytes); endsWithNewline = true; } },
          onCloseWindow: (name) => this.closeWindow(run, name),
          onWaitInput: (on) => { if (run.superseded) return; this.form.classList.toggle('waiting', on); if (on && opts.focusInput !== false) this.input.focus({ preventScroll: true }); },
          onFile: (path, bytes, raw) => { if (!run.superseded) this.html(`<span class="m">💾 파일 저장: <b>${esc(path)}</b> (${(bytes.length / 1024).toFixed(1)} KB${raw ? `, ${raw.w}×${raw.h}` : ''}) — 📁 작업 폴더에서 확인</span>\n`); }
        });
      } catch (e) {
        r = { exit: 134, trap: String(e && e.message || e) };
      } finally {
        clearInterval(tick);
        run.done = true;
        run.running = false;
        if (this.run === run) this.setRunning(false);
      }
      if (run.superseded) return { ok: false };
      if (!endsWithNewline) this.write('o', '\n');
      if (r.killed || run.stopped) this.write('e', '■ 실행을 중지했습니다.\n');
      if (r.trap) { this.write('e', `\n✗ 실행 오류: ${trapText(r.trap)}\n`); stderr += r.trap; }
      const sec = ((r.ms || (performance.now() - started)) / 1000).toFixed(2);
      this.write('m', `\n── 프로그램 종료 (종료 코드 ${r.exit}, ${sec}초) ──\n`);
      if (r.exit !== 0 && !r.killed && !run.stopped) {
        const h = hintFor(RUNTIME_HINTS, stderr);
        if (h) this.html(`<span class="hint"><b>💡 도움말</b> ${h}</span>`);
        if (r.trap && /compile: /.test(r.trap) && !E.exnSupported) this.html('<span class="hint"><b>💡 도움말</b> 이 브라우저는 WebAssembly 예외 처리(exnref)를 지원하지 않습니다. 최신 Chrome · Edge(137+), Firefox(131+), Safari(18.4+)로 업데이트하세요.</span>');
      }
      const stopped = r.killed || run.stopped;
      this.setState(r.exit === 0 ? 'done' : 'error', r.exit === 0 ? '완료' : stopped ? '중지됨' : `종료 코드 ${r.exit}`);
      this.left.textContent = r.exit === 0 ? `✓ 실행 완료 · 컴파일 ${(c.compileMs / 1000).toFixed(1)}초` : stopped ? '■ 실행을 중지했습니다' : '✗ 오류로 종료';
      this.right.textContent = sec + '초';
      return { ok: true, exit: r.exit };
    }

    showDiagnostics(r, isError) {
      const diags = (r.diagnostics || []);
      if (!diags.length) {
        this.write('e', (r.message || '컴파일하지 못했습니다.') + '\n');
        const h = hintFor(COMPILE_HINTS, r.message || '');
        if (h) this.html(`<span class="hint"><b>💡 도움말</b> ${h}</span>`);
        return;
      }
      const errors = diags.filter((d) => d.kind === 'error');
      const warns = diags.filter((d) => d.kind === 'warning');
      if (isError) this.write('e', `✗ 컴파일 오류 ${errors.length}개\n`);
      else this.write('m', `⚠ 컴파일 경고 ${warns.length}개 (실행은 계속합니다)\n`);
      const shown = new Set();
      diags.slice(0, 30).forEach((d) => {
        const label = d.kind === 'error' ? '오류' : d.kind === 'warning' ? '경고' : '참고';
        const cls = d.kind === 'error' ? 'e' : d.kind === 'warning' ? 's' : 'm';
        const lines = String(d.message).split('\n');
        const file = d.system ? d.file.split('/').slice(-2).join('/') : d.file;
        this.html(`<span class="diag"><span class="loc" data-jump="${d.editorLine || 0}" title="편집기에서 이 줄로 이동">${esc(file)}:${d.line}행</span> <span class="${cls}">${label}: ${esc(lines[0])}</span>${lines.length > 1 ? '\n<span class="m">' + esc(lines.slice(1).join('\n')) + '</span>' : ''}\n</span>`);
        if (d.kind !== 'note') {
          const h = hintFor(COMPILE_HINTS, d.message);
          if (h && !shown.has(h)) { shown.add(h); this.html(`<span class="hint"><b>💡 도움말</b> ${h}</span>`); }
        }
      });
      if (diags.length > 30) this.write('m', `… 외 ${diags.length - 30}개\n`);
    }
  }

  window.Runner = { Console, store, engine: E, hintFor: (t) => hintFor(RUNTIME_HINTS, t) || hintFor(COMPILE_HINTS, t) };
})();
