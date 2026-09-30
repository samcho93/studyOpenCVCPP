/* 16차시 이미지 처리 도구 만들기 (클래스 설계) */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;
  const HOLLOW = (id) => `<defs><marker id="${id}" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" orient="auto"><path d="M0,0 L12,6 L0,12 z" class="card-bg s1"/></marker></defs>`;
  const DIAMOND = (id) => `<defs><marker id="${id}" viewBox="0 0 16 10" refX="1" refY="5" markerWidth="14" markerHeight="9" orient="auto"><path d="M0,5 L8,0 L16,5 L8,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: Image Studio 전체 구조
  const FIG_ARCH = `<svg viewBox="0 0 760 330" role="img" aria-label="Image Studio 의 구조: 명령 해석기가 팩토리로 필터를 만들고, 필터를 적용한 결과를 History 에 쌓고, Pipeline 에 레시피로 기록한다">
  ${ARROW('c16a1')}
  <rect x="20" y="20" width="150" height="60" rx="10" class="p5s"/><text x="95" y="46" text-anchor="middle" class="tx-b">명령 입력</text><text x="95" y="66" text-anchor="middle" class="tx-m">cin · 키보드(waitKey)</text>
  <rect x="220" y="20" width="200" height="60" rx="10" class="p1s"/><text x="320" y="46" text-anchor="middle" class="tx-b">Studio::execute(line)</text><text x="320" y="66" text-anchor="middle" class="tx-m">명령 해석기 (istringstream)</text>
  <line x1="172" y1="50" x2="216" y2="50" class="ln" stroke-width="2" marker-end="url(#c16a1)"/>
  <rect x="470" y="20" width="270" height="60" rx="10" class="p2s"/><text x="605" y="46" text-anchor="middle" class="tx-b">팩토리 map&lt;string, 함수&gt;</text><text x="605" y="66" text-anchor="middle" class="tx-m">"blur 5" → make_unique&lt;BlurFilter&gt;(5)</text>
  <line x1="422" y1="50" x2="466" y2="50" class="ln" stroke-width="2" marker-end="url(#c16a1)"/>
  <rect x="470" y="110" width="270" height="70" rx="10" class="p3s"/><text x="605" y="136" text-anchor="middle" class="tx-b">Filter (추상 클래스)</text><text x="605" y="156" text-anchor="middle" class="tx-m">apply(const Mat&amp;) → 새 Mat · name()</text><text x="605" y="172" text-anchor="middle" class="tx-m">Gray · Blur · Thresh · Canny · Sharpen …</text>
  <line x1="605" y1="82" x2="605" y2="106" class="ln" stroke-width="2" marker-end="url(#c16a1)"/>
  <rect x="220" y="110" width="200" height="70" rx="10" class="p4s"/><text x="320" y="136" text-anchor="middle" class="tx-b">History</text><text x="320" y="156" text-anchor="middle" class="tx-m">Mat 스냅숏 스택</text><text x="320" y="172" text-anchor="middle" class="tx-m">undo · redo · 깊이 제한</text>
  <line x1="468" y1="145" x2="424" y2="145" class="ln" stroke-width="2" marker-end="url(#c16a1)"/>
  <text x="446" y="137" text-anchor="middle" class="tx-m">결과</text>
  <rect x="220" y="210" width="200" height="60" rx="10" class="p1s"/><text x="320" y="236" text-anchor="middle" class="tx-b">Pipeline (레시피)</text><text x="320" y="256" text-anchor="middle" class="tx-m">vector&lt;unique_ptr&lt;Filter&gt;&gt;</text>
  <line x1="530" y1="182" x2="424" y2="228" class="ln" stroke-width="2" marker-end="url(#c16a1)"/>
  <text x="500" y="222" class="tx-m">필터 객체(소유권 이동)</text>
  <rect x="20" y="110" width="150" height="160" rx="10" class="card-bg"/>
  <text x="95" y="134" text-anchor="middle" class="tx-b">입출력</text>
  <text x="95" y="160" text-anchor="middle" class="tx-m">open → imread</text>
  <text x="95" y="184" text-anchor="middle" class="tx-m">show → hconcat</text>
  <text x="95" y="202" text-anchor="middle" class="tx-m">+ putText + imshow</text>
  <text x="95" y="226" text-anchor="middle" class="tx-m">save → imwrite</text>
  <text x="95" y="250" text-anchor="middle" class="tx-m">replay → 레시피 재사용</text>
  <line x1="218" y1="145" x2="174" y2="160" class="ln" stroke-width="2" marker-end="url(#c16a1)"/>
  <line x1="218" y1="240" x2="174" y2="240" class="ln" stroke-width="2" marker-end="url(#c16a1)"/>
  <text x="380" y="310" text-anchor="middle" class="tx-m">각 클래스는 한 가지 일만 한다 — 필터는 계산만, History 는 기록만, 해석기는 명령만 (단일 책임 원칙)</text>
</svg>`;

  // 그림 2: UML 클래스 다이어그램
  const UBOX = (x, y, w, name, fields, methods, cls) => {
    const h = 30 + (fields.length ? fields.length * 16 + 8 : 0) + methods.length * 16 + 8;
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" class="${cls}"/>`;
    s += `<text x="${x + w / 2}" y="${y + 20}" text-anchor="middle" class="tx-b">${name}</text>`;
    let yy = y + 30;
    s += `<line x1="${x}" y1="${yy}" x2="${x + w}" y2="${yy}" class="ln"/>`;
    fields.forEach((f, i) => { s += `<text x="${x + 8}" y="${yy + 16 + i * 16}" class="tx-m">${f}</text>`; });
    if (fields.length) { yy += fields.length * 16 + 8; s += `<line x1="${x}" y1="${yy}" x2="${x + w}" y2="${yy}" class="ln"/>`; }
    methods.forEach((m, i) => { s += `<text x="${x + 8}" y="${yy + 16 + i * 16}" class="tx-m">${m}</text>`; });
    return s;
  };
  const FIG_UML = `<svg viewBox="0 0 760 400" role="img" aria-label="UML 클래스 다이어그램: 추상 클래스 Filter 와 이를 상속하는 필터들, Filter 를 unique_ptr 로 소유하는 Pipeline">
  ${HOLLOW('c16a2')}${DIAMOND('c16a3')}
  ${UBOX(200, 16, 270, '«abstract» Filter', [], ['+ ~Filter() : virtual', '+ apply(src : const Mat&amp;) : Mat  {= 0}', '+ name() : string  {= 0}'], 'p1s')}
  ${UBOX(10, 200, 140, 'GrayFilter', [], ['+ apply() override', '+ name() override'], 'p3s')}
  ${UBOX(160, 200, 140, 'BlurFilter', ['− k_ : int'], ['+ BlurFilter(k)', '+ apply() override'], 'p3s')}
  ${UBOX(310, 200, 150, 'ThresholdFilter', ['− t_ : int (−1=otsu)'], ['+ ThresholdFilter(t)', '+ apply() override'], 'p3s')}
  ${UBOX(470, 200, 140, 'CannyFilter', ['− lo_, hi_ : int'], ['+ CannyFilter(lo, hi)', '+ apply() override'], 'p3s')}
  <rect x="620" y="200" width="130" height="96" rx="4" class="p3s" stroke-dasharray="5 4"/>
  <text x="685" y="222" text-anchor="middle" class="tx-b">… 그 밖에</text>
  <text x="685" y="244" text-anchor="middle" class="tx-m">Median · Sharpen</text><text x="685" y="262" text-anchor="middle" class="tx-m">BrightnessContrast</text><text x="685" y="280" text-anchor="middle" class="tx-m">Morph · Invert</text>
  <line x1="80" y1="198" x2="80" y2="160" class="ln"/><line x1="230" y1="198" x2="230" y2="160" class="ln"/><line x1="385" y1="198" x2="385" y2="160" class="ln"/><line x1="540" y1="198" x2="540" y2="160" class="ln"/><line x1="685" y1="198" x2="685" y2="160" class="ln"/>
  <line x1="80" y1="160" x2="685" y2="160" class="ln"/>
  <line x1="385" y1="160" x2="385" y2="112" class="ln" stroke-width="1.5" marker-end="url(#c16a2)"/>
  <text x="395" y="140" class="tx-m">상속 (is-a)</text>
  ${UBOX(500, 16, 250, 'Pipeline', ['− filters_ : vector&lt;unique_ptr&lt;Filter&gt;&gt;'], ['+ add(unique_ptr&lt;Filter&gt;)', '+ run(const Mat&amp;) : Mat', '+ describe() : string'], 'p2s')}
  <line x1="498" y1="60" x2="474" y2="60" class="ln" stroke-width="1.5" marker-start="url(#c16a3)"/>
  <text x="486" y="52" text-anchor="middle" class="tx-m">0..*</text>
  <text x="380" y="330" text-anchor="middle" class="tx">빈 삼각형 화살표 = 상속 · 검은 마름모 = 구성(composition): Pipeline 이 필터 객체의 수명을 책임진다</text>
  <text x="380" y="352" text-anchor="middle" class="tx-m">+ public · − private · {= 0} 순수 가상 함수 (추상 클래스는 객체를 만들 수 없다: Filter f; → 컴파일 오류)</text>
  <text x="380" y="378" text-anchor="middle" class="tx-m">새 필터 추가 = 클래스 하나 추가. Pipeline · History · 명령 해석기 코드는 고치지 않는다 (개방-폐쇄 원칙)</text>
</svg>`;

  // 그림 3: 가상 함수 호출 (vtable)
  const FIG_VTABLE = `<svg viewBox="0 0 760 290" role="img" aria-label="vector 의 unique_ptr 가 각 필터 객체를 가리키고, 객체의 vptr 이 클래스별 가상 함수 표를 가리켜 알맞은 apply 가 호출된다">
  ${ARROW('c16a4')}
  <text x="20" y="24" class="tx-b">vector&lt;unique_ptr&lt;Filter&gt;&gt; filters</text>
  ${[0, 1, 2].map((i) => `<rect x="${20 + i * 90}" y="36" width="86" height="40" rx="4" class="p1s"/><text x="${63 + i * 90}" y="61" text-anchor="middle" class="tx-m">[${i}] ptr</text>`).join('')}
  ${[['GrayFilter', 'vptr', ''], ['BlurFilter', 'vptr', 'k_ = 5'], ['ThresholdFilter', 'vptr', 't_ = −1']].map((o, i) => `<rect x="${20 + i * 170}" y="130" width="150" height="70" rx="8" class="p3s"/><text x="${95 + i * 170}" y="152" text-anchor="middle" class="tx-b">${o[0]} 객체</text><text x="${95 + i * 170}" y="172" text-anchor="middle" class="tx-m">${o[1]} →</text><text x="${95 + i * 170}" y="190" text-anchor="middle" class="tx-m">${o[2]}</text>`).join('')}
  <line x1="63" y1="78" x2="90" y2="126" class="ln" stroke-width="2" marker-end="url(#c16a4)"/>
  <line x1="153" y1="78" x2="250" y2="126" class="ln" stroke-width="2" marker-end="url(#c16a4)"/>
  <line x1="243" y1="78" x2="420" y2="126" class="ln" stroke-width="2" marker-end="url(#c16a4)"/>
  ${['Gray', 'Blur', 'Threshold'].map((n, i) => `<rect x="${20 + i * 170}" y="225" width="150" height="50" rx="4" class="p2s"/><text x="${95 + i * 170}" y="245" text-anchor="middle" class="tx-m">${n}Filter::apply</text><text x="${95 + i * 170}" y="263" text-anchor="middle" class="tx-m">${n}Filter::name</text>`).join('')}
  ${[0, 1, 2].map((i) => `<line x1="${95 + i * 170}" y1="202" x2="${95 + i * 170}" y2="221" class="ln" stroke-width="2" marker-end="url(#c16a4)"/>`).join('')}
  <text x="95" y="220" class="tx-m" text-anchor="end"> </text>
  <rect x="540" y="36" width="200" height="164" rx="10" class="card-bg"/>
  <text x="640" y="60" text-anchor="middle" class="tx-b">f-&gt;apply(cur)</text>
  <text x="640" y="86" text-anchor="middle" class="tx-m">① f 가 가리키는 객체의</text>
  <text x="640" y="104" text-anchor="middle" class="tx-m">② vptr 을 따라가</text>
  <text x="640" y="122" text-anchor="middle" class="tx-m">③ 가상 함수 표(vtable)의</text>
  <text x="640" y="140" text-anchor="middle" class="tx-m">④ apply 칸을 호출</text>
  <text x="640" y="170" text-anchor="middle" class="tx-b">= 실행 중에 결정</text>
  <text x="640" y="188" text-anchor="middle" class="tx-m">(동적 바인딩 · 다형성)</text>
  <text x="640" y="250" text-anchor="middle" class="tx-m">클래스마다 가상 함수 표 1개</text>
  <text x="640" y="268" text-anchor="middle" class="tx-m">객체마다 vptr 1개 (8바이트)</text>
</svg>`;

  // 그림 4: 파일 분리와 빌드
  const FIG_FILES = `<svg viewBox="0 0 760 300" role="img" aria-label="Filter.h 와 Pipeline.h 를 Filters.cpp 와 main.cpp 가 include 하고, 각 cpp 가 따로 컴파일된 뒤 링크되어 exe 가 된다">
  ${ARROW('c16a5')}
  <rect x="30" y="30" width="180" height="70" rx="8" class="p1s"/><text x="120" y="56" text-anchor="middle" class="tx-b">Filter.h</text><text x="120" y="76" text-anchor="middle" class="tx-m">선언: 클래스 · 함수 원형</text><text x="120" y="92" text-anchor="middle" class="tx-m">#pragma once</text>
  <rect x="30" y="130" width="180" height="60" rx="8" class="p1s"/><text x="120" y="156" text-anchor="middle" class="tx-b">Pipeline.h · History.h</text><text x="120" y="176" text-anchor="middle" class="tx-m">짧은 클래스 (헤더 전용)</text>
  <line x1="120" y1="128" x2="120" y2="104" class="ln" stroke-dasharray="4 3" marker-end="url(#c16a5)"/>
  <text x="128" y="120" class="tx-m">#include</text>
  <rect x="280" y="30" width="180" height="70" rx="8" class="p3s"/><text x="370" y="56" text-anchor="middle" class="tx-b">Filters.cpp</text><text x="370" y="76" text-anchor="middle" class="tx-m">정의: apply() 본문</text><text x="370" y="92" text-anchor="middle" class="tx-m">팩토리 makeFactory()</text>
  <rect x="280" y="130" width="180" height="60" rx="8" class="p3s"/><text x="370" y="156" text-anchor="middle" class="tx-b">main.cpp</text><text x="370" y="176" text-anchor="middle" class="tx-m">Studio · main()</text>
  <line x1="278" y1="65" x2="214" y2="65" class="ln" stroke-dasharray="4 3" marker-end="url(#c16a5)"/>
  <line x1="278" y1="160" x2="214" y2="160" class="ln" stroke-dasharray="4 3" marker-end="url(#c16a5)"/>
  <line x1="278" y1="150" x2="214" y2="80" class="ln" stroke-dasharray="4 3" marker-end="url(#c16a5)"/>
  <rect x="520" y="30" width="100" height="70" rx="8" class="p4s"/><text x="570" y="62" text-anchor="middle" class="tx-b">Filters.obj</text><text x="570" y="82" text-anchor="middle" class="tx-m">컴파일</text>
  <rect x="520" y="130" width="100" height="60" rx="8" class="p4s"/><text x="570" y="158" text-anchor="middle" class="tx-b">main.obj</text><text x="570" y="176" text-anchor="middle" class="tx-m">컴파일</text>
  <line x1="462" y1="65" x2="516" y2="65" class="ln" stroke-width="2" marker-end="url(#c16a5)"/>
  <line x1="462" y1="160" x2="516" y2="160" class="ln" stroke-width="2" marker-end="url(#c16a5)"/>
  <rect x="660" y="80" width="90" height="60" rx="8" class="p2"/><text x="705" y="106" text-anchor="middle" class="tx-w">링크</text><text x="705" y="126" text-anchor="middle" class="tx-w">.exe</text>
  <line x1="622" y1="65" x2="656" y2="95" class="ln" stroke-width="2" marker-end="url(#c16a5)"/>
  <line x1="622" y1="160" x2="656" y2="128" class="ln" stroke-width="2" marker-end="url(#c16a5)"/>
  <text x="705" y="160" text-anchor="middle" class="tx-m">+ opencv_world</text>
  <rect x="30" y="220" width="720" height="64" rx="10" class="card-bg"/>
  <text x="390" y="244" text-anchor="middle" class="tx">.h = "무엇이 있다" (여러 번 include 됨) · .cpp = "어떻게 한다" (한 번만 컴파일)</text>
  <text x="390" y="266" text-anchor="middle" class="tx-m">Filters.cpp 만 고치면 그 파일만 다시 컴파일 · 헤더를 고치면 include 한 cpp 모두 다시 컴파일</text>
</svg>`;

  // 그림 5: 팩토리 동작
  const FIG_FACTORY = `<svg viewBox="0 0 760 250" role="img" aria-label="명령 문자열 blur 5 를 istringstream 으로 나누고 map 에서 blur 를 찾아 람다를 호출해 BlurFilter 객체를 만든다">
  ${ARROW('c16a6')}
  <rect x="20" y="30" width="130" height="50" rx="8" class="p5s"/><text x="85" y="61" text-anchor="middle" class="tx-b">"blur 5"</text>
  <line x1="152" y1="55" x2="196" y2="55" class="ln" stroke-width="2" marker-end="url(#c16a6)"/>
  <rect x="200" y="20" width="160" height="70" rx="8" class="p1s"/><text x="280" y="44" text-anchor="middle" class="tx-b">istringstream in</text><text x="280" y="64" text-anchor="middle" class="tx-m">in &gt;&gt; cmd → "blur"</text><text x="280" y="80" text-anchor="middle" class="tx-m">남은 것: " 5"</text>
  <line x1="362" y1="55" x2="406" y2="55" class="ln" stroke-width="2" marker-end="url(#c16a6)"/>
  <rect x="410" y="10" width="330" height="140" rx="8" class="card-bg"/>
  <text x="575" y="32" text-anchor="middle" class="tx-b">map&lt;string, FilterMaker&gt; factory</text>
  ${[['"blur"', '[](in){ k ← in; BlurFilter(k) }', 'p2s'], ['"canny"', '[](in){ lo, hi ← in; … }', 'p1s'], ['"gray"', '[](in){ GrayFilter() }', 'p1s'], ['"thresh"', '[](in){ "otsu" 또는 숫자 … }', 'p1s']].map((r, i) => `<rect x="420" y="${42 + i * 26}" width="80" height="22" class="${r[2]}"/><text x="460" y="${58 + i * 26}" text-anchor="middle" class="tx-m">${r[0]}</text><rect x="504" y="${42 + i * 26}" width="226" height="22" class="${r[2]}"/><text x="510" y="${58 + i * 26}" class="tx-m">${r[1]}</text>`).join('')}
  <line x1="617" y1="152" x2="617" y2="176" class="ln" stroke-width="2" marker-end="url(#c16a6)"/>
  <text x="627" y="170" class="tx-m">it-&gt;second(in)</text>
  <rect x="490" y="180" width="250" height="50" rx="8" class="p3s"/><text x="615" y="202" text-anchor="middle" class="tx-b">unique_ptr&lt;Filter&gt;</text><text x="615" y="220" text-anchor="middle" class="tx-m">→ BlurFilter(5) 객체</text>
  <rect x="20" y="120" width="360" height="110" rx="10" class="p4s"/>
  <text x="200" y="146" text-anchor="middle" class="tx-b">if/else 사슬 대신 표(map)로</text>
  <text x="200" y="170" text-anchor="middle" class="tx-m">새 필터 = factory["sepia"] = … 한 줄 등록</text>
  <text x="200" y="190" text-anchor="middle" class="tx-m">help 는 map 을 돌며 이름 출력 (자동으로 알파벳 순)</text>
  <text x="200" y="210" text-anchor="middle" class="tx-m">없는 명령: find() == end() → 친절한 오류</text>
</svg>`;

  // 그림 6: History 스택
  const FIG_HISTORY = `<svg viewBox="0 0 760 300" role="img" aria-label="undo 스택, 현재 이미지, redo 스택 사이에서 적용 · 되돌리기 · 다시 실행이 스냅숏을 옮기는 방법">
  ${ARROW('c16a7')}
  <text x="110" y="24" text-anchor="middle" class="tx-b">undo 스택 (과거)</text>
  ${['open', 'Gray', 'Blur(5)'].map((n, i) => `<rect x="40" y="${200 - i * 44}" width="140" height="38" rx="4" class="p1s"/><text x="110" y="${224 - i * 44}" text-anchor="middle" class="tx">${n}</text>`).join('')}
  <text x="110" y="262" text-anchor="middle" class="tx-m">deque — 오래된 것은 앞에서 버림</text>
  <rect x="300" y="100" width="160" height="80" rx="8" class="p2"/><text x="380" y="132" text-anchor="middle" class="tx-w">현재 (current)</text><text x="380" y="156" text-anchor="middle" class="tx-w">Thresh(otsu)</text>
  <text x="650" y="24" text-anchor="middle" class="tx-b">redo 스택 (되돌린 미래)</text>
  <rect x="580" y="200" width="140" height="38" rx="4" class="p3s" stroke-dasharray="5 4"/><text x="650" y="224" text-anchor="middle" class="tx-m">(비어 있음)</text>
  <path d="M 298 120 C 250 90, 220 90, 184 116" class="ln" stroke-width="2" fill="none" marker-end="url(#c16a7)"/>
  <text x="240" y="80" text-anchor="middle" class="tx-m">적용: current → undo</text>
  <path d="M 184 140 C 230 160, 260 160, 298 150" class="ln" stroke-width="2" fill="none" marker-end="url(#c16a7)"/>
  <text x="240" y="186" text-anchor="middle" class="tx-m">undo: 꺼내서 current</text>
  <path d="M 462 130 C 520 110, 560 150, 576 200" class="ln" stroke-width="2" fill="none" marker-end="url(#c16a7)"/>
  <text x="530" y="112" text-anchor="middle" class="tx-m">undo: current → redo</text>
  <path d="M 590 242 C 520 270, 440 230, 420 184" class="ln" stroke-width="2" fill="none" marker-end="url(#c16a7)"/>
  <text x="530" y="280" text-anchor="middle" class="tx-m">redo: 꺼내서 current</text>
  <rect x="300" y="210" width="160" height="56" rx="8" class="card-bg"/>
  <text x="380" y="234" text-anchor="middle" class="tx-b">새 필터 적용 시</text>
  <text x="380" y="254" text-anchor="middle" class="tx-m">redo 스택은 비운다</text>
</svg>`;

  // 그림 7: 스냅숏은 clone 으로
  const FIG_SNAP = `<svg viewBox="0 0 760 250" role="img" aria-label="얕은 복사로 보관한 스냅숏은 제자리 처리에 함께 바뀌고, clone 으로 보관한 스냅숏은 독립이다">
  ${ARROW('c16a8')}
  <text x="185" y="24" text-anchor="middle" class="tx-b">❌ snapshots.push_back(work)</text>
  ${[0, 1, 2].map((i) => `<rect x="${30 + i * 110}" y="44" width="90" height="36" rx="4" class="p1s"/><text x="${75 + i * 110}" y="67" text-anchor="middle" class="tx-m">스냅숏 ${i}</text><line x1="${75 + i * 110}" y1="82" x2="${185 + (i - 1) * 20}" y2="128" class="ln" stroke-width="2" marker-end="url(#c16a8)"/>`).join('')}
  <rect x="110" y="132" width="150" height="50" rx="6" class="p2"/><text x="185" y="162" text-anchor="middle" class="tx-w">데이터 1개 (work)</text>
  <text x="185" y="208" text-anchor="middle" class="tx-m">GaussianBlur(work, work, …) 제자리 처리</text>
  <text x="185" y="228" text-anchor="middle" class="tx-m">→ 세 스냅숏이 모두 마지막 결과!</text>
  <text x="575" y="24" text-anchor="middle" class="tx-b">✅ snapshots.push_back(work.clone())</text>
  ${[0, 1, 2].map((i) => `<rect x="${420 + i * 110}" y="44" width="90" height="36" rx="4" class="p3s"/><text x="${465 + i * 110}" y="67" text-anchor="middle" class="tx-m">스냅숏 ${i}</text><line x1="${465 + i * 110}" y1="82" x2="${465 + i * 110}" y2="128" class="ln" stroke-width="2" marker-end="url(#c16a8)"/><rect x="${425 + i * 110}" y="132" width="80" height="50" rx="6" class="p3"/><text x="${465 + i * 110}" y="162" text-anchor="middle" class="tx-w">데이터 ${i}</text>`).join('')}
  <text x="575" y="208" text-anchor="middle" class="tx-m">스냅숏마다 자기 데이터 (refcount 1)</text>
  <text x="575" y="228" text-anchor="middle" class="tx-m">640×480 컬러 한 장 = 900 KB → 깊이 제한 필요</text>
</svg>`;

  // 그림 8: 키보드 이벤트 루프
  const FIG_LOOP = `<svg viewBox="0 0 760 240" role="img" aria-label="Visual Studio 판의 이벤트 루프: imshow 로 그리고 waitKey 로 키를 받아 명령 문자열로 바꾼 뒤 execute 를 호출한다">
  ${ARROW('c16a9')}
  <rect x="20" y="80" width="150" height="60" rx="10" class="p1s"/><text x="95" y="106" text-anchor="middle" class="tx-b">imshow</text><text x="95" y="126" text-anchor="middle" class="tx-m">studio.view()</text>
  <rect x="220" y="80" width="150" height="60" rx="10" class="p2s"/><text x="295" y="106" text-anchor="middle" class="tx-b">waitKey(50)</text><text x="295" y="126" text-anchor="middle" class="tx-m">키 코드 (없으면 −1)</text>
  <rect x="420" y="80" width="150" height="60" rx="10" class="p5s"/><text x="495" y="106" text-anchor="middle" class="tx-b">키 → 명령 문자열</text><text x="495" y="126" text-anchor="middle" class="tx-m">'2' → "blur " + k</text>
  <rect x="620" y="80" width="120" height="60" rx="10" class="p3s"/><text x="680" y="106" text-anchor="middle" class="tx-b">execute()</text><text x="680" y="126" text-anchor="middle" class="tx-m">콘솔판과 같은 함수</text>
  <line x1="172" y1="110" x2="216" y2="110" class="ln" stroke-width="2" marker-end="url(#c16a9)"/>
  <line x1="372" y1="110" x2="416" y2="110" class="ln" stroke-width="2" marker-end="url(#c16a9)"/>
  <line x1="572" y1="110" x2="616" y2="110" class="ln" stroke-width="2" marker-end="url(#c16a9)"/>
  <path d="M 680 142 C 680 200, 95 200, 95 144" class="ln" stroke-width="2" fill="none" marker-end="url(#c16a9)"/>
  <text x="390" y="196" text-anchor="middle" class="tx-m">다시 그리기 (ESC 또는 창 닫기까지 반복)</text>
  <text x="295" y="40" text-anchor="middle" class="tx-m">트랙바: kernel · thresh 값은 키를 누를 때 읽는다</text>
  <line x1="295" y1="46" x2="295" y2="76" class="ln" stroke-dasharray="4 3" marker-end="url(#c16a9)"/>
  <text x="390" y="228" text-anchor="middle" class="tx">키보드 UI 는 "명령 문자열을 만드는 또 하나의 입력 장치" 일 뿐 — 처리 로직은 한 곳</text>
</svg>`;

  // ================================================================== 공통 코드 조각
  // ---- 2교시용 (필터 4개) ----
  const S2_FILTER_H = `// ===== File: Filter.h =====
#pragma once
#include <opencv2/opencv.hpp>
#include <functional>
#include <map>
#include <memory>
#include <sstream>
#include <string>

// 모든 필터의 약속: ① src 는 바꾸지 않는다 ② 항상 새 Mat 을 돌려준다 ③ 1 · 3채널 모두 받는다
class Filter
{
public:
    virtual ~Filter() = default;
    virtual cv::Mat apply(const cv::Mat& src) const = 0;
    virtual std::string name() const = 0;
};

cv::Mat toGray(const cv::Mat& src);      // 3채널 → 1채널 (1채널이면 복사본)
int oddKernel(int k);                    // 커널 크기를 3 이상 홀수로

class GrayFilter : public Filter
{
public:
    cv::Mat apply(const cv::Mat& src) const override;
    std::string name() const override { return "Gray"; }
};

class BlurFilter : public Filter
{
public:
    explicit BlurFilter(int k) : k_(oddKernel(k)) {}
    cv::Mat apply(const cv::Mat& src) const override;
    std::string name() const override { return "Blur(" + std::to_string(k_) + ")"; }
private:
    int k_;
};

class ThresholdFilter : public Filter
{
public:
    explicit ThresholdFilter(int t) : t_(t) {}          // t < 0 이면 Otsu 자동
    cv::Mat apply(const cv::Mat& src) const override;
    std::string name() const override { return t_ < 0 ? "Thresh(otsu)" : "Thresh(" + std::to_string(t_) + ")"; }
private:
    int t_;
};

class CannyFilter : public Filter
{
public:
    CannyFilter(int lo, int hi) : lo_(lo), hi_(hi) {}
    cv::Mat apply(const cv::Mat& src) const override;
    std::string name() const override { return "Canny(" + std::to_string(lo_) + "," + std::to_string(hi_) + ")"; }
private:
    int lo_, hi_;
};
`;

  const S2_FILTERS_CPP = `// ===== File: Filters.cpp =====
#include "Filter.h"
using namespace cv;

Mat toGray(const Mat& src)
{
    if (src.channels() == 1) return src.clone();
    Mat g;
    cvtColor(src, g, COLOR_BGR2GRAY);
    return g;
}

int oddKernel(int k)
{
    if (k < 3) k = 3;
    return (k % 2 == 1) ? k : k + 1;
}

Mat GrayFilter::apply(const Mat& src) const { return toGray(src); }

Mat BlurFilter::apply(const Mat& src) const
{
    Mat dst;
    GaussianBlur(src, dst, Size(k_, k_), 0);
    return dst;
}

Mat ThresholdFilter::apply(const Mat& src) const
{
    Mat dst;
    if (t_ < 0) threshold(toGray(src), dst, 0, 255, THRESH_BINARY | THRESH_OTSU);
    else        threshold(toGray(src), dst, t_, 255, THRESH_BINARY);
    return dst;
}

Mat CannyFilter::apply(const Mat& src) const
{
    Mat dst;
    Canny(toGray(src), dst, lo_, hi_);
    return dst;
}
`;

  const S2_FACTORY_DECL = `
// 팩토리: 명령 단어 → "인수를 읽어 필터를 만드는 함수"
using FilterMaker = std::function<std::unique_ptr<Filter>(std::istringstream&)>;
std::map<std::string, FilterMaker> makeFactory();
`;

  const S2_FACTORY_IMPL = `
// ---- 팩토리 ----
// 인수 읽기: 없으면 기본값, 숫자가 아니면 예외
static int readInt(std::istringstream& in, int def, const std::string& cmd)
{
    int v;
    if (in >> v) return v;
    if (in.eof()) return def;                      // 더 읽을 것이 없음 → 기본값
    throw std::invalid_argument(cmd + ": 숫자가 필요합니다");
}

std::map<std::string, FilterMaker> makeFactory()
{
    std::map<std::string, FilterMaker> f;
    f["gray"] = [](std::istringstream&) { return std::make_unique<GrayFilter>(); };
    f["blur"] = [](std::istringstream& in) { return std::make_unique<BlurFilter>(readInt(in, 5, "blur")); };
    f["thresh"] = [](std::istringstream& in) -> std::unique_ptr<Filter> {
        std::string arg = "otsu";
        in >> arg;
        if (arg == "otsu") return std::make_unique<ThresholdFilter>(-1);
        std::istringstream num(arg);
        int t = readInt(num, -1, "thresh");
        if (t < 0 || t > 255) throw std::out_of_range("thresh: 0~255 또는 otsu");
        return std::make_unique<ThresholdFilter>(t);
    };
    f["canny"] = [](std::istringstream& in) {
        int lo = readInt(in, 50, "canny");
        int hi = readInt(in, 150, "canny");
        if (lo >= hi) throw std::invalid_argument("canny: 낮은 값 < 높은 값 이어야 합니다");
        return std::make_unique<CannyFilter>(lo, hi);
    };
    return f;
}
`;

  // ---- 완성판 (3교시 · vs/Ch16_ImageStudio 와 같은 코드) ----
  const FULL_FILTER_H = `// ===== File: Filter.h =====
#pragma once
#include <opencv2/opencv.hpp>
#include <functional>
#include <map>
#include <memory>
#include <sstream>
#include <string>

// 모든 필터의 약속: ① src 는 바꾸지 않는다 ② 항상 새 Mat 을 돌려준다 ③ 1 · 3채널 모두 받는다
class Filter
{
public:
    virtual ~Filter() = default;
    virtual cv::Mat apply(const cv::Mat& src) const = 0;
    virtual std::string name() const = 0;
};

cv::Mat toGray(const cv::Mat& src);      // 3채널 → 1채널 (1채널이면 복사본)
int oddKernel(int k);                    // 커널 크기를 3 이상 홀수로

class GrayFilter : public Filter
{
public:
    cv::Mat apply(const cv::Mat& src) const override;
    std::string name() const override { return "Gray"; }
};

class BlurFilter : public Filter
{
public:
    explicit BlurFilter(int k) : k_(oddKernel(k)) {}
    cv::Mat apply(const cv::Mat& src) const override;
    std::string name() const override { return "Blur(" + std::to_string(k_) + ")"; }
private:
    int k_;
};

class MedianFilter : public Filter
{
public:
    explicit MedianFilter(int k) : k_(oddKernel(k)) {}
    cv::Mat apply(const cv::Mat& src) const override;
    std::string name() const override { return "Median(" + std::to_string(k_) + ")"; }
private:
    int k_;
};

class ThresholdFilter : public Filter
{
public:
    explicit ThresholdFilter(int t) : t_(t) {}          // t < 0 이면 Otsu 자동
    cv::Mat apply(const cv::Mat& src) const override;
    std::string name() const override { return t_ < 0 ? "Thresh(otsu)" : "Thresh(" + std::to_string(t_) + ")"; }
private:
    int t_;
};

class CannyFilter : public Filter
{
public:
    CannyFilter(int lo, int hi) : lo_(lo), hi_(hi) {}
    cv::Mat apply(const cv::Mat& src) const override;
    std::string name() const override { return "Canny(" + std::to_string(lo_) + "," + std::to_string(hi_) + ")"; }
private:
    int lo_, hi_;
};

class SharpenFilter : public Filter                    // 언샵 마스크
{
public:
    explicit SharpenFilter(double amount) : amount_(amount) {}
    cv::Mat apply(const cv::Mat& src) const override;
    std::string name() const override { return cv::format("Sharpen(%.1f)", amount_); }
private:
    double amount_;
};

class BrightnessContrastFilter : public Filter        // dst = alpha * src + beta
{
public:
    BrightnessContrastFilter(double alpha, int beta) : alpha_(alpha), beta_(beta) {}
    cv::Mat apply(const cv::Mat& src) const override;
    std::string name() const override { return cv::format("BC(%.1f,%d)", alpha_, beta_); }
private:
    double alpha_;
    int beta_;
};

class MorphFilter : public Filter
{
public:
    MorphFilter(const std::string& op, int k);          // op: erode · dilate · open · close
    cv::Mat apply(const cv::Mat& src) const override;
    std::string name() const override { return opName_ + "(" + std::to_string(k_) + ")"; }
private:
    std::string opName_;
    int op_;
    int k_;
};

class InvertFilter : public Filter
{
public:
    cv::Mat apply(const cv::Mat& src) const override;
    std::string name() const override { return "Invert"; }
};

// 팩토리: 명령 단어 → "인수를 읽어 필터를 만드는 함수"
using FilterMaker = std::function<std::unique_ptr<Filter>(std::istringstream&)>;
std::map<std::string, FilterMaker> makeFactory();
`;

  const FULL_FILTERS_CPP = `// ===== File: Filters.cpp =====
#include "Filter.h"
#include <stdexcept>
using namespace cv;

Mat toGray(const Mat& src)
{
    if (src.channels() == 1) return src.clone();
    Mat g;
    cvtColor(src, g, COLOR_BGR2GRAY);
    return g;
}

int oddKernel(int k)
{
    if (k < 3) k = 3;
    return (k % 2 == 1) ? k : k + 1;
}

Mat GrayFilter::apply(const Mat& src) const { return toGray(src); }

Mat BlurFilter::apply(const Mat& src) const
{
    Mat dst;
    GaussianBlur(src, dst, Size(k_, k_), 0);
    return dst;
}

Mat MedianFilter::apply(const Mat& src) const
{
    Mat dst;
    medianBlur(src, dst, k_);
    return dst;
}

Mat ThresholdFilter::apply(const Mat& src) const
{
    Mat dst;
    if (t_ < 0) threshold(toGray(src), dst, 0, 255, THRESH_BINARY | THRESH_OTSU);
    else        threshold(toGray(src), dst, t_, 255, THRESH_BINARY);
    return dst;
}

Mat CannyFilter::apply(const Mat& src) const
{
    Mat dst;
    Canny(toGray(src), dst, lo_, hi_);
    return dst;
}

Mat SharpenFilter::apply(const Mat& src) const     // 원본 + amount × (원본 − 흐린 것)
{
    Mat blurred, dst;
    GaussianBlur(src, blurred, Size(0, 0), 3);
    addWeighted(src, 1.0 + amount_, blurred, -amount_, 0, dst);
    return dst;
}

Mat BrightnessContrastFilter::apply(const Mat& src) const
{
    Mat dst;
    src.convertTo(dst, -1, alpha_, beta_);        // 포화 연산 (0~255 로 잘림)
    return dst;
}

MorphFilter::MorphFilter(const std::string& op, int k) : opName_(op), k_(oddKernel(k))
{
    if (op == "erode") op_ = MORPH_ERODE;
    else if (op == "dilate") op_ = MORPH_DILATE;
    else if (op == "open") op_ = MORPH_OPEN;
    else if (op == "close") op_ = MORPH_CLOSE;
    else throw std::invalid_argument("morph: erode · dilate · open · close 중 하나");
}

Mat MorphFilter::apply(const Mat& src) const
{
    Mat dst;
    morphologyEx(src, dst, op_, getStructuringElement(MORPH_ELLIPSE, Size(k_, k_)));
    return dst;
}

Mat InvertFilter::apply(const Mat& src) const
{
    Mat dst;
    bitwise_not(src, dst);
    return dst;
}

// ---- 팩토리 ----
// 인수 읽기: 없으면 기본값, 숫자가 아니면 예외
static int readInt(std::istringstream& in, int def, const std::string& cmd)
{
    int v;
    if (in >> v) return v;
    if (in.eof()) return def;
    throw std::invalid_argument(cmd + ": 숫자가 필요합니다");
}

static double readDouble(std::istringstream& in, double def, const std::string& cmd)
{
    double v;
    if (in >> v) return v;
    if (in.eof()) return def;
    throw std::invalid_argument(cmd + ": 숫자가 필요합니다");
}

std::map<std::string, FilterMaker> makeFactory()
{
    std::map<std::string, FilterMaker> f;
    f["gray"]   = [](std::istringstream&) { return std::make_unique<GrayFilter>(); };
    f["blur"]   = [](std::istringstream& in) { return std::make_unique<BlurFilter>(readInt(in, 5, "blur")); };
    f["median"] = [](std::istringstream& in) { return std::make_unique<MedianFilter>(readInt(in, 5, "median")); };
    f["thresh"] = [](std::istringstream& in) -> std::unique_ptr<Filter> {
        std::string arg = "otsu";
        in >> arg;
        if (arg == "otsu") return std::make_unique<ThresholdFilter>(-1);
        std::istringstream num(arg);
        int t = readInt(num, -1, "thresh");
        if (t < 0 || t > 255) throw std::out_of_range("thresh: 0~255 또는 otsu");
        return std::make_unique<ThresholdFilter>(t);
    };
    f["canny"] = [](std::istringstream& in) {
        int lo = readInt(in, 50, "canny");
        int hi = readInt(in, 150, "canny");
        if (lo >= hi) throw std::invalid_argument("canny: 낮은 값 < 높은 값 이어야 합니다");
        return std::make_unique<CannyFilter>(lo, hi);
    };
    f["sharpen"] = [](std::istringstream& in) { return std::make_unique<SharpenFilter>(readDouble(in, 1.0, "sharpen")); };
    f["bc"] = [](std::istringstream& in) {
        double alpha = readDouble(in, 1.2, "bc");
        int beta = readInt(in, 10, "bc");
        return std::make_unique<BrightnessContrastFilter>(alpha, beta);
    };
    f["morph"] = [](std::istringstream& in) {
        std::string op = "open";
        in >> op;
        return std::make_unique<MorphFilter>(op, readInt(in, 5, "morph"));
    };
    f["invert"] = [](std::istringstream&) { return std::make_unique<InvertFilter>(); };
    return f;
}
`;

  const PIPELINE_H = `// ===== File: Pipeline.h =====
#pragma once
#include "Filter.h"
#include <vector>

// 필터를 순서대로 담아 한 번에 실행한다. 필터 객체의 주인(owner) = Pipeline
class Pipeline
{
public:
    void add(std::unique_ptr<Filter> f) { filters_.push_back(std::move(f)); }

    std::unique_ptr<Filter> popBack()          // 마지막 필터를 꺼내 소유권을 돌려준다
    {
        if (filters_.empty()) return nullptr;
        std::unique_ptr<Filter> f = std::move(filters_.back());
        filters_.pop_back();
        return f;
    }

    void clear() { filters_.clear(); }
    size_t size() const { return filters_.size(); }

    cv::Mat run(const cv::Mat& src) const
    {
        if (filters_.empty()) return src.clone();   // 필터가 없어도 "새 Mat" 약속을 지킨다
        cv::Mat cur = src;
        for (const auto& f : filters_)
            cur = f->apply(cur);
        return cur;
    }

    std::string describe() const
    {
        if (filters_.empty()) return "(none)";
        std::string s;
        for (size_t i = 0; i < filters_.size(); i++)
            s += (i ? " -> " : "") + filters_[i]->name();
        return s;
    }

private:
    std::vector<std::unique_ptr<Filter>> filters_;
};
`;

  const HISTORY_H = `// ===== File: History.h =====
#pragma once
#include <opencv2/opencv.hpp>
#include <deque>
#include <string>
#include <vector>

// 되돌리기 · 다시 실행: 이미지 스냅숏(+ 이름)을 스택 두 개로 관리한다
class History
{
public:
    explicit History(size_t maxDepth = 20) : maxDepth_(maxDepth) {}

    void reset(const cv::Mat& img, const std::string& label)
    {
        undo_.clear();
        redo_.clear();
        current_ = { img.clone(), label };             // clone: History 가 자기 데이터를 가진다
    }

    void push(const cv::Mat& img, const std::string& label)
    {
        undo_.push_back(current_);
        if (undo_.size() > maxDepth_) undo_.pop_front(); // 가장 오래된 기록을 버린다 (메모리 제한)
        current_ = { img.clone(), label };
        redo_.clear();                                   // 새 작업을 하면 "미래" 는 사라진다
    }

    bool undo()
    {
        if (undo_.empty()) return false;
        redo_.push_back(current_);
        current_ = undo_.back();
        undo_.pop_back();
        return true;
    }

    bool redo()
    {
        if (redo_.empty()) return false;
        undo_.push_back(current_);
        current_ = redo_.back();
        redo_.pop_back();
        return true;
    }

    const cv::Mat& current() const { return current_.image; }
    const std::string& label() const { return current_.label; }
    size_t undoCount() const { return undo_.size(); }
    size_t redoCount() const { return redo_.size(); }

    std::vector<std::string> labels() const              // 오래된 것부터 현재까지
    {
        std::vector<std::string> v;
        for (const auto& s : undo_) v.push_back(s.label);
        v.push_back(current_.label);
        return v;
    }

private:
    struct Snapshot { cv::Mat image; std::string label; };
    std::deque<Snapshot> undo_;
    std::vector<Snapshot> redo_;
    Snapshot current_;
    size_t maxDepth_;
};
`;

  const STUDIO_CLASS = `// ===== File: main.cpp =====
#include "Filter.h"
#include "Pipeline.h"
#include "History.h"
#include <iostream>
using namespace cv;
using namespace std;

// 원본 | 결과를 나란히 + 위쪽 글자 띠 + 아래쪽 상태 줄
Mat sideBySide(const Mat& before, const Mat& after, const string& a, const string& b, const string& status)
{
    Mat l = before, r = after, out;                 // 헤더만 복사 — hconcat 이 새 Mat 을 만든다
    if (l.channels() == 1) cvtColor(before, l, COLOR_GRAY2BGR);
    if (r.channels() == 1) cvtColor(after, r, COLOR_GRAY2BGR);
    hconcat(l, r, out);
    for (int i = 0; i < 2; i++)
    {
        rectangle(out, Rect(i * l.cols, 0, l.cols, 32), Scalar(0, 0, 0), FILLED);
        putText(out, i == 0 ? a : b, Point(i * l.cols + 10, 23), FONT_HERSHEY_SIMPLEX, 0.7, Scalar(255, 255, 255), 2);
    }
    copyMakeBorder(out, out, 0, 30, 0, 0, BORDER_CONSTANT, Scalar(50, 50, 50));
    putText(out, status, Point(10, out.rows - 9), FONT_HERSHEY_SIMPLEX, 0.55, Scalar(0, 255, 255), 1);
    return out;
}

class Studio
{
public:
    Studio() : factory_(makeFactory()) {}
    bool execute(const string& line);               // false = 끝내기
    Mat view() const
    {
        return sideBySide(original_, history_.current(), "BEFORE", "AFTER: " + history_.label(),
                          format("undo %d | redo %d | ", (int)history_.undoCount(), (int)history_.redoCount()) + recipe_.describe());
    }
    bool hasImage() const { return !original_.empty(); }

private:
    void open(const string& path);
    void applyFilter(unique_ptr<Filter> f);
    void info() const;
    void help() const;

    map<string, FilterMaker> factory_;
    History history_{ 20 };
    Pipeline recipe_;                               // 원본 → 현재 이미지를 만든 필터들
    vector<unique_ptr<Filter>> redoFilters_;        // undo 로 꺼낸 필터 (redo 때 되돌려 놓음)
    Mat original_;
    string path_;
};

void Studio::open(const string& path)
{
    Mat img = imread(path);
    if (img.empty()) { cout << "  열 수 없음: " << path << endl; return; }
    original_ = img;
    path_ = path;
    history_.reset(img, "open");
    recipe_.clear();
    redoFilters_.clear();
    cout << "  열기: " << path << " (" << img.cols << "x" << img.rows << ")" << endl;
}

void Studio::applyFilter(unique_ptr<Filter> f)
{
    Mat result = f->apply(history_.current());
    history_.push(result, f->name());
    recipe_.add(std::move(f));                      // 필터 객체의 소유권을 레시피로 옮긴다
    redoFilters_.clear();
    cout << "  적용: " << history_.label() << " -> " << typeToString(result.type())
         << format(", 평균 %.1f", mean(result)[0]) << endl;
}

void Studio::info() const
{
    const Mat& cur = history_.current();
    cout << "  파일: " << path_ << ", 원본 " << original_.cols << "x" << original_.rows
         << " " << typeToString(original_.type()) << endl;
    cout << "  현재: " << history_.label() << " (" << typeToString(cur.type())
         << format(", 평균 %.1f)", mean(cur)[0]) << endl;
    cout << "  레시피: " << recipe_.describe() << endl;
    cout << "  undo " << history_.undoCount() << " / redo " << history_.redoCount() << endl;
}

void Studio::help() const
{
    cout << "  필터:";
    for (const auto& kv : factory_) cout << " " << kv.first;
    cout << endl << "  기타: open info history undo redo reset show save replay quit" << endl;
}

bool Studio::execute(const string& line)
{
    istringstream in(line);
    string cmd;
    if (!(in >> cmd) || cmd[0] == '#') return true;       // 빈 줄 · 주석
    if (cmd == "quit" || cmd == "exit") return false;
    if (cmd == "help") { help(); return true; }
    if (cmd == "open") { string p; in >> p; open(p); return true; }
    if (!hasImage()) { cout << "  먼저 open 으로 이미지를 여세요" << endl; return true; }

    if (cmd == "info") info();
    else if (cmd == "undo")
    {
        if (!history_.undo()) { cout << "  되돌릴 것이 없습니다" << endl; return true; }
        redoFilters_.push_back(recipe_.popBack());
        cout << "  되돌리기 -> " << history_.label() << endl;
    }
    else if (cmd == "redo")
    {
        if (!history_.redo()) { cout << "  다시 실행할 것이 없습니다" << endl; return true; }
        recipe_.add(std::move(redoFilters_.back()));
        redoFilters_.pop_back();
        cout << "  다시 실행 -> " << history_.label() << endl;
    }
    else if (cmd == "reset")
    {
        history_.reset(original_, "open");
        recipe_.clear();
        redoFilters_.clear();
        cout << "  원본으로 초기화" << endl;
    }
    else if (cmd == "history")
    {
        vector<string> v = history_.labels();
        for (size_t i = 0; i < v.size(); i++)
            cout << "  " << i << ": " << v[i] << (i + 1 == v.size() ? "  <- 현재" : "") << endl;
    }
    else if (cmd == "show") imshow("Image Studio", view());
    else if (cmd == "save")
    {
        string p = "result.png";
        in >> p;
        cout << (imwrite(p, history_.current()) ? "  저장: " : "  저장 실패: ") << p << endl;
    }
    else if (cmd == "replay")                              // 레시피를 다른 이미지에 그대로 적용
    {
        string src, dst = "replay.png";
        in >> src >> dst;
        Mat img = imread(src);
        if (img.empty()) { cout << "  열 수 없음: " << src << endl; return true; }
        Mat out = recipe_.run(img);
        imwrite(dst, out);
        cout << "  " << src << " -> [" << recipe_.describe() << "] -> " << dst
             << format(" (평균 %.1f)", mean(out)[0]) << endl;
    }
    else
    {
        auto it = factory_.find(cmd);
        if (it == factory_.end()) { cout << "  알 수 없는 명령: " << cmd << " (help 로 목록 보기)" << endl; return true; }
        applyFilter(it->second(in));                       // 인수가 틀리면 여기서 예외
    }
    return true;
}
`;

  const STUDIO_MAIN_BROWSER = `
int main()
{
    Studio studio;
    string line;
    cout << "Image Studio - 명령을 한 줄씩 입력 (help)" << endl;
    while (getline(cin, line))
    {
        cout << "> " << line << endl;               // 브라우저 stdin 은 화면에 안 보이므로 되풀이
        try
        {
            if (!studio.execute(line)) break;
        }
        catch (const cv::Exception& e) { cout << "  OpenCV 오류: " << e.err << endl; }
        catch (const exception& e)     { cout << "  오류: " << e.what() << endl; }
    }
    if (studio.hasImage()) imshow("Image Studio", studio.view());
    waitKey(0);
    return 0;
}`;

  const EX3_STUDIO = FULL_FILTER_H + '\n' + FULL_FILTERS_CPP + '\n' + PIPELINE_H + '\n' + HISTORY_H + '\n' + STUDIO_CLASS + STUDIO_MAIN_BROWSER;
  const EX3_STUDIO_STDIN = 'open images/sample_color.png\ngray\nblur 5\nthresh otsu\nhistory\nundo\nundo\nredo\ncanny 50 150\nredo\ninfo\nsepia\nblur abc\nsave result.png\nreplay images/nuts_bolts_color.png replay.png\nshow\nquit\n';

  // ================================================================== 1교시 예제
  const EX1_FIRST = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <iomanip>
#include <memory>
#include <vector>
using namespace cv;
using namespace std;

// 추상 기반 클래스: "필터라면 이 두 가지를 할 수 있다" 는 약속(인터페이스)
class Filter
{
public:
    virtual ~Filter() = default;                     // 기반 클래스의 소멸자는 virtual!
    virtual Mat apply(const Mat& src) const = 0;     // = 0 : 순수 가상 함수 (자식이 반드시 구현)
    virtual string name() const = 0;
};

class GrayFilter : public Filter
{
public:
    Mat apply(const Mat& src) const override
    {
        if (src.channels() == 1) return src.clone();
        Mat dst;
        cvtColor(src, dst, COLOR_BGR2GRAY);
        return dst;
    }
    string name() const override { return "Gray"; }
};

class BlurFilter : public Filter
{
public:
    explicit BlurFilter(int k) : k_(k % 2 == 1 ? k : k + 1) {}   // 커널은 홀수로 보정
    Mat apply(const Mat& src) const override
    {
        Mat dst;
        GaussianBlur(src, dst, Size(k_, k_), 0);
        return dst;
    }
    string name() const override { return "Blur(" + to_string(k_) + ")"; }
private:
    int k_;                                          // 필터마다 자기 파라미터를 멤버로 가진다
};

class OtsuFilter : public Filter
{
public:
    Mat apply(const Mat& src) const override
    {
        Mat gray = GrayFilter().apply(src), dst;     // 컬러가 와도 동작하게
        threshold(gray, dst, 0, 255, THRESH_BINARY | THRESH_OTSU);
        return dst;
    }
    string name() const override { return "Thresh(otsu)"; }
};

int main()
{
    Mat img = imread("images/sample_color.png");
    vector<unique_ptr<Filter>> filters;              // 기반 클래스 포인터의 목록
    filters.push_back(make_unique<GrayFilter>());
    filters.push_back(make_unique<BlurFilter>(4));   // 4 → 5 로 보정
    filters.push_back(make_unique<OtsuFilter>());

    Mat cur = img;
    for (const auto& f : filters)                    // 어떤 필터인지 몰라도 같은 코드로 호출
    {
        cur = f->apply(cur);                         // 가상 함수 → 실제 객체의 apply 가 불린다
        cout << left << setw(14) << f->name() << typeToString(cur.type())
             << format("  평균 %.1f", mean(cur)[0]) << endl;
    }
    cout << "원본은 그대로: " << typeToString(img.type()) << format(", 평균 %.1f", mean(img)[0]) << endl;
    imshow("input", img);
    imshow("result", cur);
    waitKey(0);
    return 0;
}`;

  const EX1_LIFE = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <memory>
#include <vector>
using namespace cv;
using namespace std;

class Filter
{
public:
    virtual ~Filter() { cout << "  ~Filter" << endl; }
    virtual string name() const = 0;
};

class BlurFilter : public Filter
{
public:
    explicit BlurFilter(int k) : k_(k) { cout << "  BlurFilter(" << k_ << ") 생성" << endl; }
    ~BlurFilter() override { cout << "  ~BlurFilter(" << k_ << ") 소멸" << endl; }
    string name() const override { return "Blur(" + to_string(k_) + ")"; }
private:
    int k_;
};

int main()
{
    cout << "1) make_unique 로 만들기" << endl;
    unique_ptr<Filter> p = make_unique<BlurFilter>(3);   // 자식 객체를 기반 클래스 포인터로

    cout << "2) vector 로 옮기기 (move)" << endl;
    vector<unique_ptr<Filter>> filters;
    // filters.push_back(p);                            // 컴파일 오류: unique_ptr 은 복사 불가
    filters.push_back(move(p));                          // 소유권 이동
    cout << "  p 는 이제 " << (p ? "살아 있음" : "nullptr") << ", filters.size() = " << filters.size() << endl;
    filters.push_back(make_unique<BlurFilter>(7));       // 임시 객체는 바로 이동된다

    cout << "3) 참조로 빌려 쓰기 (소유권 그대로)" << endl;
    for (const auto& f : filters) cout << "  " << f->name() << endl;

    cout << "4) 하나 지우기: erase" << endl;
    filters.erase(filters.begin());                      // unique_ptr 소멸 → 객체 delete

    cout << "5) main 끝 → vector 소멸 → 남은 객체 delete" << endl;
    return 0;
}`;

  const EX1_CONTRACT = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <iomanip>
#include <memory>
#include <vector>
using namespace cv;
using namespace std;

class Filter
{
public:
    virtual ~Filter() = default;
    virtual Mat apply(const Mat& src) const = 0;
    virtual string name() const = 0;
};

Mat toGray(const Mat& src)
{
    if (src.channels() == 1) return src.clone();
    Mat g;
    cvtColor(src, g, COLOR_BGR2GRAY);
    return g;
}

struct CannyFilter : Filter
{
    Mat apply(const Mat& src) const override { Mat d; Canny(toGray(src), d, 50, 150); return d; }
    string name() const override { return "Canny(50,150)"; }
};
struct SharpenFilter : Filter                          // 언샵 마스크: 원본 + 1.0 × (원본 − 흐린 것)
{
    Mat apply(const Mat& src) const override
    {
        Mat b, d;
        GaussianBlur(src, b, Size(0, 0), 3);
        addWeighted(src, 2.0, b, -1.0, 0, d);
        return d;
    }
    string name() const override { return "Sharpen(1.0)"; }
};
struct MorphOpenFilter : Filter
{
    Mat apply(const Mat& src) const override
    {
        Mat d;
        morphologyEx(src, d, MORPH_OPEN, getStructuringElement(MORPH_ELLIPSE, Size(5, 5)));
        return d;
    }
    string name() const override { return "open(5)"; }
};
struct InvertFilter : Filter
{
    Mat apply(const Mat& src) const override { Mat d; bitwise_not(src, d); return d; }
    string name() const override { return "Invert"; }
};
struct BadFilter : Filter                              // ❌ 약속 위반: 입력을 직접 고친다
{
    Mat apply(const Mat& src) const override
    {
        Mat m = src;                                   // 헤더만 복사 → src 와 같은 데이터
        bitwise_not(m, m);                             // 제자리 처리 → src 가 바뀐다!
        return m;
    }
    string name() const override { return "Bad"; }
};

// 필터 약속 검사: ① 입력이 그대로인가 ② 결과가 새 데이터인가
void checkContract(const Filter& f, const Mat& src)
{
    Mat backup = src.clone();
    Mat dst = f.apply(src);
    bool same = norm(src, backup, NORM_INF) == 0;
    bool fresh = dst.data != src.data;
    cout << left << setw(15) << f.name() << setw(9) << typeToString(src.type()) << "-> "
         << setw(9) << typeToString(dst.type()) << "입력보존 " << (same ? "OK " : "NG ")
         << "새데이터 " << (fresh ? "OK" : "NG") << endl;
}

int main()
{
    Mat color = imread("images/sample_color.png");
    Mat gray = imread("images/sample_gray.png", IMREAD_GRAYSCALE);
    vector<unique_ptr<Filter>> filters;
    filters.push_back(make_unique<CannyFilter>());
    filters.push_back(make_unique<SharpenFilter>());
    filters.push_back(make_unique<MorphOpenFilter>());
    filters.push_back(make_unique<InvertFilter>());
    filters.push_back(make_unique<BadFilter>());

    for (const auto& f : filters)
    {
        checkContract(*f, color);                     // 3채널 입력
        checkContract(*f, gray);                      // 1채널 입력
    }
    return 0;
}`;

  const EX1_PIPE = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <memory>
#include <vector>
using namespace cv;
using namespace std;

class Filter
{
public:
    virtual ~Filter() = default;
    virtual Mat apply(const Mat& src) const = 0;
    virtual string name() const = 0;
};
struct GrayFilter : Filter
{
    Mat apply(const Mat& src) const override
    {
        if (src.channels() == 1) return src.clone();
        Mat d; cvtColor(src, d, COLOR_BGR2GRAY); return d;
    }
    string name() const override { return "Gray"; }
};
struct MedianFilter : Filter
{
    int k;
    explicit MedianFilter(int k) : k(k) {}
    Mat apply(const Mat& src) const override { Mat d; medianBlur(src, d, k); return d; }
    string name() const override { return "Median(" + to_string(k) + ")"; }
};
struct OtsuInvFilter : Filter
{
    Mat apply(const Mat& src) const override
    {
        Mat d; threshold(src, d, 0, 255, THRESH_BINARY_INV | THRESH_OTSU); return d;
    }
    string name() const override { return "ThreshInv(otsu)"; }
};

// 필터 목록을 소유하고 순서대로 실행하는 클래스
class Pipeline
{
public:
    Pipeline& add(unique_ptr<Filter> f) { filters_.push_back(move(f)); return *this; }  // 연쇄 호출용
    Mat run(const Mat& src) const
    {
        Mat cur = src.clone();
        for (const auto& f : filters_) cur = f->apply(cur);
        return cur;
    }
    string describe() const
    {
        string s;
        for (size_t i = 0; i < filters_.size(); i++) s += (i ? " -> " : "") + filters_[i]->name();
        return s;
    }
private:
    vector<unique_ptr<Filter>> filters_;
};

// 전 · 후를 나란히: 채널 수를 맞춘 뒤 hconcat, 위에 글자 띠
Mat sideBySide(const Mat& before, const Mat& after)
{
    Mat l = before, r = after, out;
    if (l.channels() == 1) cvtColor(before, l, COLOR_GRAY2BGR);
    if (r.channels() == 1) cvtColor(after, r, COLOR_GRAY2BGR);
    hconcat(l, r, out);
    rectangle(out, Rect(0, 0, out.cols, 32), Scalar(0, 0, 0), FILLED);
    putText(out, "BEFORE", Point(10, 23), FONT_HERSHEY_SIMPLEX, 0.7, Scalar(255, 255, 255), 2);
    putText(out, "AFTER", Point(l.cols + 10, 23), FONT_HERSHEY_SIMPLEX, 0.7, Scalar(0, 255, 255), 2);
    return out;
}

int main()
{
    Mat img = imread("images/salt_pepper.png");     // 소금-후추 잡음 플랜지 (구멍 7개)
    Pipeline pipe;
    pipe.add(make_unique<GrayFilter>())
        .add(make_unique<MedianFilter>(5))
        .add(make_unique<OtsuInvFilter>());         // 구멍(어두운 곳) = 흰색

    Mat bin = pipe.run(img);
    Mat labels;
    int regions = connectedComponents(bin, labels) - 1;   // 라벨 0(검은 부분) 제외
    cout << "파이프라인: " << pipe.describe() << endl;
    cout << "결과: " << typeToString(bin.type()) << ", 흰 영역 " << regions
         << "개 (바깥 배경 1 + 구멍 " << regions - 1 << ")" << endl;

    Mat view = sideBySide(img, bin);
    cout << "비교 화면: " << view.cols << "x" << view.rows << endl;
    imshow("before | after", view);
    waitKey(0);
    return 0;
}`;

  // ================================================================== 2교시 예제
  const EX2_SPLIT = S2_FILTER_H + '\n' + S2_FILTERS_CPP + '\n' + PIPELINE_H + `
// ===== File: main.cpp =====
#include "Filter.h"
#include "Pipeline.h"
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png");
    Pipeline pipe;
    pipe.add(make_unique<GrayFilter>());
    pipe.add(make_unique<BlurFilter>(5));
    pipe.add(make_unique<ThresholdFilter>(-1));
    cout << "파이프라인: " << pipe.describe() << " (" << pipe.size() << "단계)" << endl;

    Mat out = pipe.run(img);
    cout << "결과: " << typeToString(out.type()) << ", 흰 픽셀 " << countNonZero(out) << endl;

    Mat edges = CannyFilter(50, 150).apply(img);     // 필터 하나만 바로 써도 된다
    cout << "Canny 에지 픽셀: " << countNonZero(edges) << endl;
    imshow("threshold", out);
    imshow("canny", edges);
    waitKey(0);
    return 0;
}`;

  const EX2_FACTORY = S2_FILTER_H + S2_FACTORY_DECL + '\n' + S2_FILTERS_CPP + S2_FACTORY_IMPL + '\n' + PIPELINE_H + `
// ===== File: main.cpp =====
#include "Filter.h"
#include "Pipeline.h"
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    auto factory = makeFactory();                    // map<string, FilterMaker>
    cout << "등록된 명령:";
    for (const auto& [key, maker] : factory) cout << " " << key;   // map 은 이름 순으로 돈다
    cout << endl;

    Pipeline pipe;
    string line;
    while (getline(cin, line))                       // stdin 한 줄 = 명령 하나
    {
        istringstream in(line);
        string cmd;
        in >> cmd;                                   // 첫 단어 = 명령, 나머지 = 인수
        auto it = factory.find(cmd);
        if (it == factory.end()) { cout << "알 수 없는 명령: " << cmd << endl; continue; }
        pipe.add(it->second(in));                    // 람다가 in 에서 인수를 읽어 필터를 만든다
        cout << "추가 " << pipe.size() << ": " << line << endl;
    }

    Mat img = imread("images/sample_color.png");
    Mat out = pipe.run(img);
    cout << "파이프라인: " << pipe.describe() << endl;
    cout << "결과: " << typeToString(out.type()) << ", 흰 픽셀 " << countNonZero(out) << endl;
    imshow("result", out);
    waitKey(0);
    return 0;
}`;
  const EX2_FACTORY_STDIN = 'gray\nblur 7\nsepia\nthresh otsu\n';

  const EX2_ERRORS = S2_FILTER_H + S2_FACTORY_DECL + '\n' + S2_FILTERS_CPP + S2_FACTORY_IMPL + `
// ===== File: main.cpp =====
#include "Filter.h"
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    auto factory = makeFactory();
    Mat img = imread("images/washers.png");
    string line;
    while (getline(cin, line))
    {
        cout << "> " << line << endl;
        istringstream in(line);
        string cmd;
        in >> cmd;
        auto it = factory.find(cmd);
        if (it == factory.end()) { cout << "  알 수 없는 명령" << endl; continue; }
        try
        {
            unique_ptr<Filter> f = it->second(in);   // 인수가 틀리면 여기서 throw
            Mat out = f->apply(img);
            cout << "  " << f->name() << " OK, 평균 " << format("%.1f", mean(out)[0]) << endl;
        }
        catch (const exception& e)                   // invalid_argument · out_of_range 모두
        {
            cout << "  오류: " << e.what() << endl;
        }
    }

    // OpenCV 함수의 오류는 cv::Exception (std::exception 의 자식)
    try
    {
        Mat dst;
        GaussianBlur(img, dst, Size(4, 4), 0);       // 짝수 커널 → 조건 검사 실패
    }
    catch (const cv::Exception& e)
    {
        cout << "cv::Exception code=" << e.code << " (조건 검사 실패)" << endl;   // e.err · e.what() 에 자세한 내용
    }
    return 0;
}`;
  const EX2_ERRORS_STDIN = 'blur 4\nblur abc\nthresh 300\nthresh otsu\ncanny 150 50\ncanny 80\n';

  // ================================================================== 3교시 예제
  const EX3_BUG = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
using namespace cv;
using namespace std;

void printSnapshots(const string& title, const vector<Mat>& snaps)
{
    cout << title << ":";
    for (const Mat& s : snaps) cout << format(" %.1f", mean(s)[0]);
    cout << endl;
}

int main()
{
    Mat work = imread("images/washers.png", IMREAD_GRAYSCALE);

    // ❌ 얕은 복사로 기록 + 제자리(in-place) 처리
    vector<Mat> bad;
    bad.push_back(work);                                   // 원본
    GaussianBlur(work, work, Size(9, 9), 0);               // 결과를 같은 데이터에 덮어씀
    bad.push_back(work);
    threshold(work, work, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    bad.push_back(work);
    printSnapshots("얕은 복사 기록 평균", bad);             // 세 기록이 모두 같다!

    // ✅ clone 으로 기록
    work = imread("images/washers.png", IMREAD_GRAYSCALE);
    vector<Mat> good;
    good.push_back(work.clone());
    GaussianBlur(work, work, Size(9, 9), 0);
    good.push_back(work.clone());
    threshold(work, work, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    good.push_back(work.clone());
    printSnapshots("clone 기록 평균   ", good);

    // ❌ 두 번째 함정: const Mat& 도 픽셀은 못 지킨다
    const Mat& current = good.back();
    Mat view = current;                                    // 헤더 복사 (const 가 풀린다)
    rectangle(view, Rect(0, 0, 200, 200), Scalar(128), FILLED);   // 화면용 표시를 그렸을 뿐인데
    printSnapshots("표시를 그린 뒤    ", good);             // 기록이 바뀌었다
    cout << "해결: 화면용 그림은 current.clone() 위에 그린다" << endl;
    return 0;
}`;

  const EX3_HISTORY = HISTORY_H + `
// ===== File: main.cpp =====
#include "History.h"
#include <iostream>
using namespace cv;
using namespace std;

void show(const string& action, const History& h)
{
    cout << action << " -> 현재 " << h.label() << format(" (값 %d)", (int)h.current().at<uchar>(0, 0))
         << ", undo " << h.undoCount() << " / redo " << h.redoCount() << endl;
}

int main()
{
    History h(3);                                           // 깊이 3 으로 작게
    h.reset(Mat(1, 1, CV_8UC1, Scalar(0)), "open");        // 1x1 Mat 으로 흉내
    show("open", h);
    const char* names[] = { "A", "B", "C", "D" };
    for (int i = 0; i < 4; i++)
    {
        h.push(Mat(1, 1, CV_8UC1, Scalar((i + 1) * 10)), names[i]);
        show(string("적용 ") + names[i], h);
    }
    for (int i = 0; i < 4; i++)
        show(h.undo() ? "undo" : "undo (불가)", h);        // 깊이 3 → 3번까지만
    show(h.redo() ? "redo" : "redo (불가)", h);
    h.push(Mat(1, 1, CV_8UC1, Scalar(99)), "E");            // 새 작업 → redo 비움
    show("적용 E", h);
    show(h.redo() ? "redo" : "redo (불가)", h);

    cout << "기록:";
    for (const string& s : h.labels()) cout << " " << s;
    cout << endl;
    return 0;
}`;

  const EX3_KEYLOOP = `// Visual Studio 판 (vs/Ch16_ImageStudio/main.cpp 중 키보드 부분)
// Studio 클래스 · execute() 는 브라우저 판과 같습니다. 키를 "명령 문자열" 로 바꿀 뿐입니다.
void runKeyboardUI(Studio& studio, const vector<string>& images)
{
    const string WIN = "Image Studio";
    namedWindow(WIN, WINDOW_AUTOSIZE);
    int k = 5, t = 0;                                  // 트랙바 값 (t = 0 이면 Otsu)
    createTrackbar("kernel", WIN, &k, 31);
    createTrackbar("thresh 0=otsu", WIN, &t, 255);
    size_t imgIndex = 0;
    int saveNo = 1;

    while (true)
    {
        imshow(WIN, studio.view());
        int key = waitKey(50);
        if (key < 0)                                   // 키 없음: 창이 닫혔는지만 확인
        {
            if (getWindowProperty(WIN, WND_PROP_VISIBLE) < 1) break;
            continue;
        }
        key &= 0xFF;
        if (key == 27) break;                          // ESC

        string cmd;
        switch (key)
        {
        case '1': cmd = "gray"; break;
        case '2': cmd = "blur " + to_string(k); break;
        case '3': cmd = "median " + to_string(k); break;
        case '4': cmd = (t == 0) ? "thresh otsu" : "thresh " + to_string(t); break;
        case '5': cmd = "canny 50 150"; break;
        case '6': cmd = "sharpen 1.0"; break;
        case '7': cmd = "bc 1.2 10"; break;
        case '8': cmd = "morph open " + to_string(k); break;
        case '9': cmd = "invert"; break;
        case 'z': cmd = "undo"; break;
        case 'y': cmd = "redo"; break;
        case 'r': cmd = "reset"; break;
        case 'i': cmd = "info"; break;
        case 's': cmd = format("save studio_%03d.png", saveNo++); break;
        case 'o':
            imgIndex = (imgIndex + 1) % images.size();
            cmd = "open " + images[imgIndex];
            break;
        case 'c': cout << "명령> "; getline(cin, cmd); break;   // 콘솔에서 명령 직접 입력
        default: continue;
        }
        cout << "> " << cmd << endl;
        try
        {
            if (!studio.execute(cmd)) break;
        }
        catch (const cv::Exception& e) { cout << "  OpenCV 오류: " << e.err << endl; }
        catch (const exception& e)     { cout << "  오류: " << e.what() << endl; }
    }
    destroyAllWindows();
}`;

  const EX3_TRACKBAR_LIVE = `// (선택) 트랙바를 움직이는 즉시 미리보기: 콜백에서 "적용하지 않고" 결과만 보여 준다
struct PreviewState { Studio* studio; int k; };

void onKernel(int pos, void* userdata)
{
    auto* s = static_cast<PreviewState*>(userdata);
    Mat preview = BlurFilter(pos).apply(s->studio->currentImage());   // History 에 넣지 않음
    imshow("preview", preview);
}

// main 에서:
//   PreviewState ps{ &studio, 5 };
//   createTrackbar("kernel", "Image Studio", &ps.k, 31, onKernel, &ps);
// 키 '2' 를 누를 때 비로소 execute("blur " + to_string(ps.k)) 로 "확정" 한다`;

  // ================================================================== 퀴즈
  const QUIZ1 = [
    { q: '<code>class Filter { public: virtual Mat apply(const Mat&amp;) const = 0; };</code> 에 대한 설명으로 옳은 것은?', options: ['<code>Filter f;</code> 로 객체를 만들 수 있다', '<code>= 0</code> 은 기본 반환값이 0 이라는 뜻이다', '순수 가상 함수가 있으므로 추상 클래스이고, 자식 클래스가 apply 를 구현해야 객체를 만들 수 있다', '<code>virtual</code> 을 빼도 동작은 같다'], answer: 2, explain: '<code>= 0</code> 은 <b>순수 가상 함수</b> 표시입니다. 순수 가상 함수가 하나라도 있으면 추상 클래스 → 객체를 만들 수 없고, 포인터 · 참조로만 씁니다. <code>virtual</code> 이 없으면 기반 클래스 포인터로 호출할 때 자식의 함수가 불리지 않습니다.' },
    { q: '기반 클래스 <code>Filter</code> 의 소멸자를 <code>virtual</code> 로 만들어야 하는 이유는?', options: ['속도가 빨라진다', '<code>unique_ptr&lt;Filter&gt;</code> 가 자식 객체를 지울 때 자식 소멸자까지 불리게 하려고', 'override 를 쓰기 위해', 'Mat 을 멤버로 가질 수 없어서'], answer: 1, explain: '기반 클래스 포인터로 <code>delete</code> 할 때 소멸자가 가상이 아니면 <b>기반 클래스 소멸자만</b> 불려 자식의 멤버(Mat · 문자열 …)가 정리되지 않습니다(정의되지 않은 동작). 다형성 기반 클래스에는 항상 <code>virtual ~Filter() = default;</code>.' },
    { q: '<code>vector&lt;unique_ptr&lt;Filter&gt;&gt; v; auto p = make_unique&lt;GrayFilter&gt;();</code> 다음 중 컴파일되는 것은?', options: ['<code>v.push_back(p);</code>', '<code>v.push_back(move(p));</code>', '<code>v.push_back(*p);</code>', '<code>v.push_back(&amp;p);</code>'], answer: 1, explain: 'unique_ptr 은 <b>복사할 수 없고 이동만</b> 됩니다(소유자는 한 명). <code>move(p)</code> 후 p 는 nullptr 이 됩니다. <code>v.push_back(make_unique&lt;GrayFilter&gt;())</code> 처럼 임시 객체를 넘기면 자동으로 이동됩니다.' },
    { q: '필터 약속 "입력을 바꾸지 않고 새 Mat 을 돌려준다" 를 <b>어기는</b> apply 는?', options: ['<code>Mat d; GaussianBlur(src, d, Size(5,5), 0); return d;</code>', '<code>return src.clone();</code>', '<code>Mat m = src; bitwise_not(m, m); return m;</code>', '<code>Mat d; bitwise_not(src, d); return d;</code>'], answer: 2, explain: '<code>Mat m = src;</code> 는 헤더만 복사 → m 과 src 가 같은 데이터. 제자리 처리 <code>bitwise_not(m, m)</code> 가 <b>호출한 쪽의 원본</b>을 바꿉니다. <code>const Mat&amp;</code> 는 헤더를 지킬 뿐 픽셀은 못 지킵니다.' }
  ];
  const QUIZ2 = [
    { q: '헤더 파일(<code>Filter.h</code>)에 <code>#pragma once</code> 를 쓰는 이유는?', options: ['컴파일 속도를 2배로', '한 cpp 안에서 같은 헤더가 여러 번 include 되어도 한 번만 읽게 해 “클래스 재정의” 오류를 막으려고', '헤더를 cpp 로 바꾸려고', '링크 오류를 막으려고'], answer: 1, explain: 'main.cpp 가 <code>Filter.h</code> 와 <code>Pipeline.h</code>(안에서 다시 Filter.h 를 include)를 모두 include 하면 Filter 클래스가 두 번 정의됩니다. <code>#pragma once</code>(또는 <code>#ifndef</code> 가드)가 이를 막습니다.' },
    { q: '<code>Filters.cpp</code> 에 있는 <code>Mat BlurFilter::apply(...)</code> 정의를 실수로 <code>Filter.h</code> 로 옮기고 (inline 없이) 두 cpp 에서 include 하면?', options: ['아무 문제 없다', '컴파일 오류: 선언이 없음', '링크 오류: 같은 함수가 두 번 정의됨 (LNK2005)', '실행 중 예외'], answer: 2, explain: '헤더의 <b>클래스 밖</b> 함수 정의는 include 한 cpp 마다 하나씩 생겨 링크 때 충돌합니다(ODR 위반). 클래스 <b>안</b>에 쓴 멤버 함수(<code>name()</code> 처럼)는 자동으로 inline 이라 괜찮습니다.' },
    { q: '<code>istringstream in("blur abc"); string cmd; int k = 5; in &gt;&gt; cmd; bool ok = (bool)(in &gt;&gt; k);</code> 의 결과는?', options: ['cmd = "blur", ok = true, k = 5', 'cmd = "blur", ok = false (숫자가 아님)', 'cmd = "blur abc"', '예외가 발생한다'], answer: 1, explain: '<code>&gt;&gt;</code> 는 공백으로 나눠 읽습니다. "abc" 는 int 로 읽을 수 없어 <b>실패 상태</b>(failbit)가 되고 예외는 나지 않습니다. 그래서 <code>readInt</code> 가 실패를 확인해 직접 <code>throw</code> 합니다. (C++11 부터 실패 시 k 는 0 이 됩니다.)' },
    { q: '팩토리를 <code>map&lt;string, function&lt;unique_ptr&lt;Filter&gt;(istringstream&amp;)&gt;&gt;</code> 로 만든 장점이 <b>아닌</b> 것은?', options: ['새 필터를 등록 한 줄로 추가할 수 있다', 'help 명령이 map 을 돌며 목록을 자동으로 만든다', '명령 이름을 찾는 코드가 find 한 번으로 끝난다', '필터 처리 속도가 빨라진다'], answer: 3, explain: '팩토리는 <b>객체를 만드는 방법</b>을 정리할 뿐, 처리 속도와는 관계가 없습니다. 긴 if/else 사슬을 표(데이터)로 바꿔 확장 · 목록 출력이 쉬워지는 것이 장점입니다.' }
  ];
  const QUIZ3 = [
    { q: '<code>History::push</code> 에서 <code>img.clone()</code> 으로 보관하는 가장 큰 이유는?', options: ['clone 이 더 빠르다', '호출한 쪽이 나중에 그 Mat 을 제자리 처리하거나 그 위에 그려도 기록이 바뀌지 않게 하려고', 'Mat 은 clone 해야 vector 에 넣을 수 있다', '메모리를 아끼려고'], answer: 1, explain: '얕은 복사로 보관하면 스냅숏이 호출한 쪽과 데이터를 공유합니다. <code>GaussianBlur(work, work, …)</code> 같은 제자리 처리 한 번에 <b>모든 기록이 같은 이미지</b>가 됩니다. 기록은 자기 데이터를 가져야 합니다.' },
    { q: 'A → B → C 를 적용한 뒤 undo 를 2번 하고, 새 필터 D 를 적용했다. redo 를 누르면?', options: ['B 가 다시 적용된다', 'C 가 다시 적용된다', '아무 일도 없다 — D 를 적용할 때 redo 스택을 비웠다', 'D 가 취소된다'], answer: 2, explain: '새 작업을 하면 되돌렸던 "미래"(B, C)는 더 이상 의미가 없으므로 redo 스택을 비웁니다. 워드 · 포토샵의 되돌리기도 같은 규칙입니다.' },
    { q: '640×480 컬러 이미지로 되돌리기 기록 20단계를 보관하면 대략 몇 MB 가 필요할까?', options: ['약 0.9 MB', '약 18 MB', '약 180 MB', '약 1.8 GB'], answer: 1, explain: '한 장 = 640 × 480 × 3 = 921,600 바이트 ≈ 0.9 MB, × 20 ≈ <b>18 MB</b>. 1920×1080 이면 한 장 6 MB → 20단계 120 MB. 그래서 <code>maxDepth</code> 로 깊이를 제한합니다.' },
    { q: 'Visual Studio 판에서 키 <code>\'2\'</code> 를 누르면 <code>execute("blur " + to_string(k))</code> 를 호출하도록 만든 설계의 장점은?', options: ['키보드 판과 콘솔(cin) 판이 같은 처리 코드를 공유해 한 곳만 고치면 된다', 'waitKey 가 필요 없어진다', 'Mat 복사가 없어진다', '트랙바가 필요 없어진다'], answer: 0, explain: '입력 장치(키보드 · cin · 나중에는 GUI 버튼)는 <b>명령 문자열을 만드는 역할</b>만 하고, 처리는 <code>Studio::execute</code> 한 곳에서 합니다. 브라우저에서 stdin 으로 시험한 로직이 VS 창 프로그램에서도 그대로 동작하는 이유입니다.' }
  ];

  CV_COURSE.addChapter({
    id: 'cv16', no: '16', title: '이미지 처리 도구 만들기 (클래스 설계)', subtitle: 'Filter 추상 클래스 · Pipeline · History(undo/redo) · 팩토리 · 명령 해석기로 만드는 Image Studio',
    summary: '지금까지 배운 필터(그레이 · 블러 · 이진화 · 에지 · 샤픈 · 모폴로지)를 <b>하나의 도구</b>로 묶습니다. 추상 클래스 <code>Filter</code> 와 가상 함수로 필터를 같은 모양으로 다루고(<b>다형성</b>), <code>vector&lt;unique_ptr&lt;Filter&gt;&gt;</code> 를 가진 <code>Pipeline</code> 이 필터 객체를 소유합니다. 헤더/소스로 파일을 나누고, <code>map&lt;string, function&gt;</code> <b>팩토리</b>와 <code>istringstream</code> 으로 <code>"blur 5"</code> 같은 명령을 해석합니다. <code>History</code> 는 Mat 스냅숏을 <b>clone</b> 으로 보관해 되돌리기 · 다시 실행을 만들고, <code>hconcat</code> + <code>putText</code> 로 전후 비교 화면을, <code>imwrite</code> 로 결과를 저장합니다. 완성판은 Visual Studio 프로젝트 <code>Ch16_ImageStudio</code>(키보드 단축키 · 트랙바)입니다.',
    goals: ['추상 클래스 · 순수 가상 함수 · override · 가상 소멸자로 필터 인터페이스를 설계할 수 있다', 'unique_ptr 로 필터 객체의 소유권을 표현하고 move 로 옮길 수 있다', '.h / .cpp 로 파일을 나누고 팩토리(map + 람다)와 istringstream 으로 명령 해석기를 만들 수 있다', 'Mat 스냅숏을 clone 으로 보관하는 undo/redo 기록 클래스를 만들고 전후 비교 · 저장 기능을 완성할 수 있다'],
    vs: 'Ch16_ImageStudio',
    sections: [
      // ================================================================ 1교시
      {
        id: 'cv16-1', title: '설계: Filter 추상 클래스 · 다형성 · Pipeline', minutes: 50,
        goals: ['Image Studio 의 요구 사항을 클래스(필터 · 파이프라인 · 기록 · 해석기)로 나눌 수 있다', '순수 가상 함수 · override · 가상 소멸자로 Filter 인터페이스를 만들 수 있다', 'vector&lt;unique_ptr&lt;Filter&gt;&gt; 로 여러 필터를 소유하고 같은 코드로 호출할 수 있다', '"입력을 바꾸지 않고 새 Mat 을 돌려준다" 는 필터 약속을 검사하고 hconcat 으로 전후를 비교할 수 있다'],
        flow: [['도입: 만들 도구 · 요구 사항', 5], ['추상 클래스 · 다형성', 15], ['unique_ptr · 필터 약속 · Pipeline', 20], ['정리 · 퀴즈', 10]],
        content: [
          { type: 'h', text: '무엇을 만드나: 콘솔 Image Studio' },
          { type: 'p', html: 'Part 4 의 첫 응용 프로젝트입니다. 지금까지 차시마다 따로 써 본 함수들 — <code>cvtColor</code> · <code>GaussianBlur</code> · <code>threshold</code> · <code>Canny</code> · <code>morphologyEx</code> — 을 <b>하나의 작은 이미지 편집 도구</b>로 묶습니다. 사용자는 <code>gray</code>, <code>blur 5</code>, <code>thresh otsu</code> 같은 <b>명령</b>을 입력하고, 도구는 필터를 차례로 적용하며 <b>되돌리기(undo) · 다시 실행(redo)</b>, 전후 비교 화면, 파일 저장을 지원합니다. 브라우저에서는 명령을 <code>cin</code>(예시 입력)으로 주고, Visual Studio 판(<code>vs/Ch16_ImageStudio</code>)에서는 <b>키보드 단축키와 트랙바</b>로 조작합니다.' },
          { type: 'table', head: ['요구 사항', '담당 클래스 · 함수', '배울 C++'], rows: [
            ['여러 종류의 필터를 같은 방법으로 적용', '<code>Filter</code>(추상) + 자식 클래스들', '상속 · 가상 함수 · 다형성'],
            ['필터 목록을 순서대로 실행 · 기록', '<code>Pipeline</code>', '<code>vector&lt;unique_ptr&lt;T&gt;&gt;</code> · move'],
            ['명령 <code>"blur 5"</code> → 필터 객체', '팩토리 <code>makeFactory()</code>', '<code>map</code> · <code>function</code> · 람다 · <code>istringstream</code>'],
            ['되돌리기 · 다시 실행', '<code>History</code>', '스택(<code>deque</code>/<code>vector</code>) · <b>clone</b>'],
            ['전후 비교 · 저장', '<code>sideBySide()</code> · save', '<code>hconcat</code> · <code>putText</code> · <code>imwrite</code>'],
            ['잘못된 입력에도 죽지 않기', '명령 해석기 <code>Studio::execute</code>', '예외(<code>try/catch</code>, <code>cv::Exception</code>)']
          ], caption: '표 1. 요구 사항을 클래스로 나누기 — 한 클래스는 한 가지 일만 (C# 판의 WPF 스튜디오와 같은 구조를 콘솔 · highgui 로)' },
          { type: 'figure', html: FIG_ARCH, caption: '그림 1. Image Studio 의 구조 — 명령 해석기가 팩토리로 필터를 만들고, 결과는 History 에, 필터 객체는 Pipeline(레시피)에 들어간다' },
          { type: 'h', text: '추상 클래스 Filter: "필터라면 할 수 있는 것" 의 약속' },
          { type: 'p', html: '그레이 변환 · 블러 · 이진화는 하는 일이 다르지만 <b>모양은 같습니다</b>: 이미지 하나를 받아 이미지 하나를 돌려주고, 이름이 있습니다. 이 공통 모양을 <b>추상 기반 클래스</b>로 적어 둡니다. <code>virtual … = 0</code> 은 <b>순수 가상 함수</b>로 "몸체는 자식이 채운다" 는 뜻이며, 순수 가상 함수가 있는 클래스는 객체를 만들 수 없고(<code>Filter f;</code> → 컴파일 오류) <b>포인터 · 참조</b>로만 씁니다. 자식은 <code>override</code> 를 붙여 구현합니다 — 이름이나 <code>const</code> 를 틀리면 컴파일러가 잡아 줍니다.' },
          { type: 'figure', html: FIG_UML, caption: '그림 2. UML 클래스 다이어그램 — 필터들은 Filter 를 상속(is-a)하고, Pipeline 은 필터 객체들을 소유(구성, composition)한다' },
          { type: 'code', title: '예제 1: 첫 Filter 클래스와 필터 3개', code: EX1_FIRST,
            desc: '<code>vector&lt;unique_ptr&lt;Filter&gt;&gt;</code> 에 서로 다른 필터를 넣고 <b>똑같은 반복문</b>으로 호출합니다. <code>f-&gt;apply(cur)</code> 는 컴파일 때가 아니라 <b>실행 중에</b> 실제 객체(Gray · Blur · Otsu)의 apply 를 찾아 부릅니다 — 이것이 <b>다형성</b>입니다. 필터마다 필요한 파라미터(<code>k_</code>)는 생성자로 받아 멤버에 둡니다. <code>apply</code> 가 <code>const</code> 인 것은 "적용해도 필터 자신은 바뀌지 않는다" 는 약속입니다. 마지막 줄에서 원본 <code>img</code> 가 그대로인 것을 확인하세요.',
            expect: 'Gray          CV_8UC1  평균 119.2\nBlur(5)       CV_8UC1  평균 119.2\nThresh(otsu)  CV_8UC1  평균 182.0\n원본은 그대로: CV_8UC3, 평균 115.5' },
          { type: 'figure', html: FIG_VTABLE, caption: '그림 3. 가상 함수 호출의 원리 — 객체마다 vptr 이 클래스별 가상 함수 표(vtable)를 가리키고, f->apply() 는 그 표를 따라가 알맞은 함수를 부른다' },
          { type: 'callout', kind: 'warn', title: '다형성 기반 클래스의 3가지 규칙', html: '<ol><li><b>소멸자는 virtual</b>: <code>virtual ~Filter() = default;</code> — 없으면 <code>unique_ptr&lt;Filter&gt;</code> 가 자식 객체를 지울 때 자식 소멸자가 불리지 않습니다(정의되지 않은 동작).</li><li><b>자식에는 override</b>: <code>Mat apply(const Mat&amp; src) override</code> 처럼 <code>const</code> 를 빠뜨리면 "다른 함수" 가 되어 버리는데, override 가 있으면 컴파일 오류로 알려 줍니다.</li><li><b>값으로 담지 말 것</b>: <code>vector&lt;Filter&gt;</code> 는 추상 클래스라 불가능하고, 추상이 아니더라도 자식 부분이 잘려 나갑니다(객체 잘림, slicing). 항상 <b>포인터(unique_ptr)</b>로 담습니다.</li></ol>' },
          { type: 'h', text: 'unique_ptr: 필터 객체의 주인은 한 명' },
          { type: 'p', html: '필터 객체는 <code>make_unique&lt;BlurFilter&gt;(5)</code> 로 힙에 만들고 <code>unique_ptr&lt;Filter&gt;</code> 로 가리킵니다. unique_ptr 은 <b>소유자가 한 명</b>이라는 뜻의 스마트 포인터로, 복사는 금지되고 <code>std::move</code> 로 <b>소유권을 옮길</b> 수만 있습니다. 소유자(unique_ptr)가 사라질 때 객체가 자동으로 <code>delete</code> 되므로 <code>new/delete</code> 를 직접 쓰지 않습니다 — Mat 의 참조 계수(03차시)와 같은 RAII 원리입니다. 빌려 쓰기만 할 때는 <code>const Filter&amp;</code> 나 <code>for (const auto&amp; f : filters)</code> 처럼 <b>참조</b>를 씁니다.' },
          { type: 'code', title: '예제 2: 생성 · 이동 · 소멸 순서 들여다보기', code: EX1_LIFE,
            desc: '생성자 · 소멸자에 출력을 넣어 객체의 일생을 봅니다. <code>move(p)</code> 후 p 는 <b>nullptr</b> 이 되고, <code>erase</code> 나 vector 소멸 때 객체가 자동으로 지워집니다. 가상 소멸자 덕분에 <code>~BlurFilter</code> → <code>~Filter</code> 순서(자식 먼저)로 모두 불립니다. 주석 처리한 <code>push_back(p)</code> 를 풀면 "삭제된 함수(복사 생성자)를 참조" 컴파일 오류가 납니다 — 직접 확인해 보세요.',
            expect: '1) make_unique 로 만들기\n  BlurFilter(3) 생성\n2) vector 로 옮기기 (move)\n  p 는 이제 nullptr, filters.size() = 1\n  BlurFilter(7) 생성\n3) 참조로 빌려 쓰기 (소유권 그대로)\n  Blur(3)\n  Blur(7)\n4) 하나 지우기: erase\n  ~BlurFilter(3) 소멸\n  ~Filter\n5) main 끝 → vector 소멸 → 남은 객체 delete\n  ~BlurFilter(7) 소멸\n  ~Filter' },
          { type: 'callout', kind: 'more', title: '📘 shared_ptr 이 아니라 unique_ptr 인 이유', html: '필터 객체는 Pipeline 한 곳이 소유하면 충분합니다. <code>shared_ptr</code> 은 여러 소유자를 위해 참조 계수를 관리하므로 조금 더 무겁고, "누가 지우는가" 가 흐려집니다. <b>기본은 unique_ptr, 정말 공유가 필요할 때만 shared_ptr</b> 이 현대 C++ 의 규칙입니다. OpenCV 의 <code>cv::Ptr&lt;T&gt;</code>(예: <code>Ptr&lt;CLAHE&gt;</code>, <code>Ptr&lt;ORB&gt;</code>)는 <code>std::shared_ptr</code> 의 별명입니다.' },
          { type: 'h', text: '필터 약속(계약)을 코드로 검사하기' },
          { type: 'p', html: '필터를 여러 사람이 만들어도 도구가 안전하려면 모든 필터가 같은 약속을 지켜야 합니다. <b>① 입력(src)을 바꾸지 않는다 ② 항상 새 데이터의 Mat 을 돌려준다 ③ 1채널 · 3채널 입력을 모두 받는다.</b> 예를 들어 Canny · 이진화는 1채널이 필요하므로 컬러가 오면 안에서 그레이로 바꿉니다. 아래 예제는 약속을 검사하는 함수를 만들어 필터마다 자동으로 확인합니다 — 작은 <b>단위 테스트</b>입니다.' },
          { type: 'code', title: '예제 3: 필터 약속 검사 — Canny · Sharpen · Open · Invert · Bad', code: EX1_CONTRACT,
            desc: '<code>norm(src, backup, NORM_INF) == 0</code> 이면 입력의 모든 픽셀이 그대로이고, <code>dst.data != src.data</code> 이면 결과가 새 데이터입니다. <code>BadFilter</code> 는 <code>Mat m = src;</code>(헤더 복사) 뒤 제자리 처리를 해서 두 검사에 모두 걸립니다. <code>const Mat&amp; src</code> 는 <b>헤더를 지킬 뿐 픽셀은 지키지 못한다</b>는 C++ + OpenCV 의 대표 함정입니다. <code>struct</code> 는 기본 접근이 public 인 class 입니다.',
            expect: 'Canny(50,150)  CV_8UC3  -> CV_8UC1  입력보존 OK 새데이터 OK\nCanny(50,150)  CV_8UC1  -> CV_8UC1  입력보존 OK 새데이터 OK\nSharpen(1.0)   CV_8UC3  -> CV_8UC3  입력보존 OK 새데이터 OK\nSharpen(1.0)   CV_8UC1  -> CV_8UC1  입력보존 OK 새데이터 OK\nopen(5)        CV_8UC3  -> CV_8UC3  입력보존 OK 새데이터 OK\nopen(5)        CV_8UC1  -> CV_8UC1  입력보존 OK 새데이터 OK\nInvert         CV_8UC3  -> CV_8UC3  입력보존 OK 새데이터 OK\nInvert         CV_8UC1  -> CV_8UC1  입력보존 OK 새데이터 OK\nBad            CV_8UC3  -> CV_8UC3  입력보존 NG 새데이터 NG\nBad            CV_8UC1  -> CV_8UC1  입력보존 NG 새데이터 NG' },
          { type: 'table', head: ['필터', 'OpenCV 함수', '입력 → 출력', '배운 차시'], rows: [
            ['Gray', '<code>cvtColor(BGR2GRAY)</code>', '3 → 1채널', '05'],
            ['Blur(k) · Median(k)', '<code>GaussianBlur</code> · <code>medianBlur</code>', '같은 형식', '08'],
            ['Thresh(t / otsu)', '<code>threshold</code>', '→ 1채널 0/255', '07'],
            ['Canny(lo, hi)', '<code>Canny</code>', '→ 1채널 0/255', '10'],
            ['Sharpen(a)', '<code>GaussianBlur</code> + <code>addWeighted</code>', '같은 형식', '08'],
            ['BC(α, β)', '<code>convertTo(dst, -1, α, β)</code>', '같은 형식 (포화)', '03 · 06'],
            ['erode · dilate · open · close(k)', '<code>morphologyEx</code>', '같은 형식', '09'],
            ['Invert', '<code>bitwise_not</code>', '같은 형식', '06']
          ], caption: '표 2. 완성판 Image Studio 의 필터 9종 — 모두 같은 Filter 인터페이스를 따른다' },
          { type: 'h', text: 'Pipeline 과 전후 비교 화면' },
          { type: 'p', html: '<code>Pipeline</code> 은 <code>vector&lt;unique_ptr&lt;Filter&gt;&gt;</code> 를 멤버로 가진 클래스입니다. <code>add</code> 는 unique_ptr 을 <b>값으로 받아 move</b> 합니다 — 호출하는 쪽이 소유권을 넘긴다는 것이 함수 모양에 드러납니다. <code>run</code> 은 필터를 차례로 적용하고, <code>describe</code> 는 "Gray -> Median(5) -> …" 처럼 레시피를 글로 돌려줍니다. 전후 비교는 두 이미지를 <code>hconcat</code> 으로 이어 붙이는데, <b>크기(높이)와 형식이 같아야</b> 하므로 1채널 결과를 <code>COLOR_GRAY2BGR</code> 로 3채널로 바꾼 뒤 붙이고, 위에 <code>rectangle(FILLED)</code> 띠 + <code>putText</code> 로 이름을 씁니다.' },
          { type: 'code', title: '예제 4: Pipeline 클래스 + hconcat 전후 비교', code: EX1_PIPE,
            desc: '소금-후추 잡음이 있는 플랜지(<code>salt_pepper.png</code>)에 Gray → Median(5) → 반전 Otsu 를 적용하면 어두운 부분이 흰색이 되어 <b>바깥 배경 1개 + 구멍 7개</b>(중앙 보어 1 + 볼트 구멍 6, IMAGES.md 정답)가 남습니다 — 잡음 점은 하나도 남지 않습니다. <code>add</code> 가 <code>*this</code> 참조를 돌려주므로 <code>pipe.add(…).add(…)</code> 처럼 <b>연쇄 호출</b>할 수 있습니다. 결과 창의 비교 화면(1280×480)에서 BEFORE · AFTER 글자 띠를 확인하세요. Median 대신 Blur 를 넣으면 흰 점이 남는지도 실험해 보세요.',
            expect: '파이프라인: Gray -> Median(5) -> ThreshInv(otsu)\n결과: CV_8UC1, 흰 영역 8개 (바깥 배경 1 + 구멍 7)\n비교 화면: 1280x480' },
          { type: 'callout', kind: 'tip', title: 'hconcat 오류를 피하는 법', html: '<code>hconcat</code> 은 <b>행 수(높이)와 형식(type)</b>이 같아야 합니다. 컬러(CV_8UC3)와 이진 결과(CV_8UC1)를 그대로 붙이면 <code>(-215:Assertion failed) src[i].type() == src[0].type()</code> 오류가 납니다. ① 채널 맞추기: <code>cvtColor(x, x3, COLOR_GRAY2BGR)</code> ② 높이 맞추기: <code>resize</code> ③ 세로로 붙이려면 <code>vconcat</code>(열 수가 같아야 함). <code>putText</code> 는 영문 · 숫자만 그릴 수 있으므로(Hershey 글꼴) 라벨은 영어로 씁니다.' },
          { type: 'callout', kind: 'vs', title: 'Visual Studio 에서는: 클래스 뷰와 클래스 다이어그램', html: '<b>보기 → 클래스 뷰</b>(Ctrl+Shift+C)에서 <code>Filter</code> 를 펼치면 파생 형식(자식 클래스) 목록이 보입니다. 가상 함수 이름에서 <b>Ctrl+F12</b>(구현으로 이동)를 누르면 모든 override 목록이 나옵니다. "클래스 디자이너" 구성 요소를 설치하면 <b>프로젝트 → 클래스 다이어그램 추가</b>로 그림 2 같은 UML 을 자동으로 그려 줍니다.' }
        ],
        practice: [
          {
            title: 'MedianFilter 추가하고 잡음 픽셀 세기', level: 1,
            desc: '<code>Filter</code> 를 상속하는 <code>MedianFilter</code> 를 완성하세요. 생성자에서 커널 크기 k 를 받아 <b>3 이상 홀수</b>로 보정하고(<code>k &lt; 3</code> → 3, 짝수 → +1), <code>apply</code> 는 <code>medianBlur</code>, <code>name()</code> 은 <code>"Median(5)"</code> 형식입니다. <code>salt_pepper.png</code>(잡음 약 8%) 에서 값이 0 또는 255 인 픽셀 수를 필터 전후로 비교하세요. <code>MedianFilter(4)</code> 로 만들어도 5 가 되어야 합니다.',
            hint: '보정: <code>k_ = k &lt; 3 ? 3 : (k % 2 ? k : k + 1);</code> · 픽셀 수: <code>countNonZero(img == 0) + countNonZero(img == 255)</code> — 비교 연산의 결과는 0/255 마스크입니다.',
            expect: 'Median(5)\n0 또는 255 픽셀: 24331 -> 0',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <memory>
using namespace cv;
using namespace std;

class Filter
{
public:
    virtual ~Filter() = default;
    virtual Mat apply(const Mat& src) const = 0;
    virtual string name() const = 0;
};

// TODO: MedianFilter 클래스 (생성자에서 k 보정, apply = medianBlur, name = "Median(k)")

int countExtreme(const Mat& img)
{
    return countNonZero(img == 0) + countNonZero(img == 255);
}

int main()
{
    Mat img = imread("images/salt_pepper.png", IMREAD_GRAYSCALE);
    // TODO: unique_ptr<Filter> f = make_unique<MedianFilter>(4);
    //       이름 출력, 적용 전후 countExtreme 출력
    cout << "0 또는 255 픽셀: " << countExtreme(img) << endl;
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <memory>
using namespace cv;
using namespace std;

class Filter
{
public:
    virtual ~Filter() = default;
    virtual Mat apply(const Mat& src) const = 0;
    virtual string name() const = 0;
};

class MedianFilter : public Filter
{
public:
    explicit MedianFilter(int k) : k_(k < 3 ? 3 : (k % 2 ? k : k + 1)) {}
    Mat apply(const Mat& src) const override
    {
        Mat dst;
        medianBlur(src, dst, k_);
        return dst;
    }
    string name() const override { return "Median(" + to_string(k_) + ")"; }
private:
    int k_;
};

int countExtreme(const Mat& img)
{
    return countNonZero(img == 0) + countNonZero(img == 255);
}

int main()
{
    Mat img = imread("images/salt_pepper.png", IMREAD_GRAYSCALE);
    unique_ptr<Filter> f = make_unique<MedianFilter>(4);
    Mat out = f->apply(img);
    cout << f->name() << endl;
    cout << "0 또는 255 픽셀: " << countExtreme(img) << " -> " << countExtreme(out) << endl;
    imshow("before", img);
    imshow("after", out);
    waitKey(0);
    return 0;
}`
          },
          {
            title: '밝기 · 대비 필터(BC)로 저대비 영상 늘이기', level: 2,
            desc: '<code>BrightnessContrastFilter(double alpha, int beta)</code> 를 만드세요. <code>apply</code> 는 <code>src.convertTo(dst, -1, alpha, beta)</code>(= 포화(α×src + β)), <code>name()</code> 은 <code>format("BC(%.1f,%d)", alpha, beta)</code> 입니다. <code>low_contrast.png</code>(밝기 102~134) 를 0~255 로 늘이려면 α = 255 / (134 − 102) ≈ 8, β = −102 × 8 = −816 입니다. 원본 · 결과의 최소/최대/평균을 출력하고, <code>Pipeline</code> 없이 <code>vector&lt;unique_ptr&lt;Filter&gt;&gt;</code> 에 <b>BC 와 Invert</b> 를 넣어 차례로 적용한 결과의 평균도 출력하세요.',
            hint: '<code>minMaxLoc(img, &amp;mn, &amp;mx)</code> · <code>format("%.1f", mean(img)[0])</code>. Invert 는 <code>bitwise_not</code> — 평균이 255 − 원래 평균이 됩니다.',
            expect: '원본: 102 ~ 134, 평균 118.2\nBC(8.0,-816): 0 ~ 255, 평균 129.5\nBC(8.0,-816) -> Invert: 평균 125.5',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <memory>
#include <vector>
using namespace cv;
using namespace std;

class Filter
{
public:
    virtual ~Filter() = default;
    virtual Mat apply(const Mat& src) const = 0;
    virtual string name() const = 0;
};

class InvertFilter : public Filter
{
public:
    Mat apply(const Mat& src) const override { Mat d; bitwise_not(src, d); return d; }
    string name() const override { return "Invert"; }
};

// TODO: BrightnessContrastFilter (alpha_, beta_, convertTo)

void printRange(const string& title, const Mat& img)
{
    double mn, mx;
    minMaxLoc(img, &mn, &mx);
    cout << title << ": " << mn << " ~ " << mx << format(", 평균 %.1f", mean(img)[0]) << endl;
}

int main()
{
    Mat img = imread("images/low_contrast.png", IMREAD_GRAYSCALE);
    printRange("원본", img);
    // TODO: BC(8.0, -816) 적용 → printRange(f.name(), 결과)
    // TODO: vector<unique_ptr<Filter>> 에 BC, Invert 를 넣고 차례로 적용 → 평균 출력
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <memory>
#include <vector>
using namespace cv;
using namespace std;

class Filter
{
public:
    virtual ~Filter() = default;
    virtual Mat apply(const Mat& src) const = 0;
    virtual string name() const = 0;
};

class InvertFilter : public Filter
{
public:
    Mat apply(const Mat& src) const override { Mat d; bitwise_not(src, d); return d; }
    string name() const override { return "Invert"; }
};

class BrightnessContrastFilter : public Filter
{
public:
    BrightnessContrastFilter(double alpha, int beta) : alpha_(alpha), beta_(beta) {}
    Mat apply(const Mat& src) const override
    {
        Mat dst;
        src.convertTo(dst, -1, alpha_, beta_);
        return dst;
    }
    string name() const override { return format("BC(%.1f,%d)", alpha_, beta_); }
private:
    double alpha_;
    int beta_;
};

void printRange(const string& title, const Mat& img)
{
    double mn, mx;
    minMaxLoc(img, &mn, &mx);
    cout << title << ": " << mn << " ~ " << mx << format(", 평균 %.1f", mean(img)[0]) << endl;
}

int main()
{
    Mat img = imread("images/low_contrast.png", IMREAD_GRAYSCALE);
    printRange("원본", img);
    BrightnessContrastFilter bc(8.0, -816);
    Mat stretched = bc.apply(img);
    printRange(bc.name(), stretched);

    vector<unique_ptr<Filter>> filters;
    filters.push_back(make_unique<BrightnessContrastFilter>(8.0, -816));
    filters.push_back(make_unique<InvertFilter>());
    Mat cur = img;
    string names;
    for (const auto& f : filters)
    {
        cur = f->apply(cur);
        names += (names.empty() ? "" : " -> ") + f->name();
    }
    cout << names << format(": 평균 %.1f", mean(cur)[0]) << endl;
    imshow("stretched", stretched);
    imshow("inverted", cur);
    waitKey(0);
    return 0;
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: '이미지 처리 도구 만들기', subtitle: '1교시 — 설계: Filter 추상 클래스 · 다형성 · Pipeline', notes: '<p>💬 "지금까지 배운 필터를 한 프로그램에서 골라 쓰고, 되돌리고, 저장하려면 무엇이 필요할까?" — 예상 답: 메뉴, 되돌리기, 파일 저장. 오늘부터 3교시 동안 C++ 클래스 설계로 그 도구를 만듭니다. C# 판에서는 WPF 화면을 만들었지만 C++ 판은 <b>설계(클래스)</b>에 집중하고, 화면은 콘솔 명령 + highgui 키보드로 만듭니다. (3분)</p>' },
          { layout: 'bullets', title: '만들 도구: 콘솔 Image Studio', lead: '명령을 입력하면 필터를 적용하고, 되돌리고, 저장한다', bullets: [
            '<code>open images/sample_color.png</code> → <code>gray</code> → <code>blur 5</code> → <code>thresh otsu</code>',
            '<code>undo</code> · <code>redo</code> · <code>history</code> · <code>info</code>',
            '<code>show</code> (전후 비교 화면) · <code>save result.png</code>',
            '브라우저: 명령을 <b>stdin</b> 으로 · Visual Studio: <b>키보드 1~9 · z · y · s · o</b> + 트랙바',
            ['필요한 C++', ['상속 · 가상 함수 · <b>unique_ptr</b>', '<b>map + 람다</b> 팩토리 · istringstream', '스택 · <b>clone</b> · 예외']]
          ], notes: '<p>완성판(3교시 예제)을 먼저 실행해 결과 창의 출력과 비교 화면을 보여 주며 목표를 공유합니다. VS 판을 미리 빌드해 두었다면 키보드로 필터를 누르고 z 로 되돌리는 시연을 30초 보여 주세요. (4분)</p>' },
          { layout: 'diagram', title: '구조: 한 클래스는 한 가지 일', html: FIG_ARCH, caption: '해석기 → 팩토리 → Filter → History · Pipeline · 입출력', notes: '<p>💬 "필터 코드 안에서 cout 이나 imshow 를 하면 안 될까?" — 필터는 계산만 해야 테스트 · 재사용(키보드판, 배치 처리)이 쉽다. 단일 책임 원칙을 예로 설명합니다. 이 그림을 판서해 두고 3교시 동안 "지금 어느 상자를 만드는 중" 인지 짚어 줍니다. (4분)</p>' },
          { layout: 'diagram', title: 'UML: 상속과 구성', html: FIG_UML, caption: '빈 삼각형 = 상속(is-a) · 검은 마름모 = 구성(소유) · {= 0} = 순수 가상 함수', notes: '<p>UML 기호 세 가지만 알려 줍니다: 상속 화살표, 구성 마름모, +/− 접근 지정자. 💬 "Sepia 필터를 추가하려면 어느 상자를 고쳐야 할까?" — 새 상자 하나만 추가, 나머지는 그대로(개방-폐쇄 원칙). (4분)</p>' },
          { layout: 'code', title: '추상 클래스와 자식 클래스', code: `#include <opencv2/opencv.hpp>
using namespace cv;
using namespace std;

class Filter
{
public:
    virtual ~Filter() = default;                  // ① 가상 소멸자
    virtual Mat apply(const Mat& src) const = 0;  // ② 순수 가상 함수
    virtual string name() const = 0;
};

class BlurFilter : public Filter
{
public:
    explicit BlurFilter(int k) : k_(k % 2 ? k : k + 1) {}
    Mat apply(const Mat& src) const override     // ③ override
    { Mat d; GaussianBlur(src, d, Size(k_, k_), 0); return d; }
    string name() const override { return "Blur(" + to_string(k_) + ")"; }
private:
    int k_;                                        // 파라미터는 멤버로
};

int main() { BlurFilter b(4); return b.name() == "Blur(5)" ? 0 : 1; }`, points: ['<code>= 0</code> 순수 가상 → 추상 클래스 (객체 생성 불가)', '<code>override</code>: 서명이 틀리면 컴파일 오류로 알려 줌', '<code>const</code> apply: 필터 자신은 바뀌지 않는다', '<code>explicit</code>: <code>BlurFilter b = 5;</code> 같은 암시적 변환 금지'], notes: '<p>세 가지 규칙(가상 소멸자 · 순수 가상 · override)을 코드에서 가리키며 설명합니다. 시연: 자식의 apply 에서 <code>const</code> 를 지워 보면 override 때문에 컴파일 오류가 나는 것을 보여 주세요 — "override 는 안전벨트". (5분)</p>' },
          { layout: 'code', title: '예제 1: 다형성 — 같은 반복문, 다른 필터', code: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <memory>
using namespace cv;
using namespace std;
struct Filter { virtual ~Filter() = default; virtual Mat apply(const Mat&) const = 0; virtual string name() const = 0; };
struct GrayF : Filter { Mat apply(const Mat& s) const override { Mat d; cvtColor(s, d, COLOR_BGR2GRAY); return d; } string name() const override { return "Gray"; } };
struct BlurF : Filter { Mat apply(const Mat& s) const override { Mat d; GaussianBlur(s, d, Size(5, 5), 0); return d; } string name() const override { return "Blur(5)"; } };
struct OtsuF : Filter { Mat apply(const Mat& s) const override { Mat d; threshold(s, d, 0, 255, THRESH_BINARY | THRESH_OTSU); return d; } string name() const override { return "Thresh(otsu)"; } };
int main()
{
    Mat cur = imread("images/sample_color.png");
    vector<unique_ptr<Filter>> filters;
    filters.push_back(make_unique<GrayF>());
    filters.push_back(make_unique<BlurF>());
    filters.push_back(make_unique<OtsuF>());
    for (const auto& f : filters)
    {
        cur = f->apply(cur);                              // 실행 중에 결정 (동적 바인딩)
        cout << f->name() << format(": 평균 %.1f", mean(cur)[0]) << endl;
    }
    imshow("result", cur);
    waitKey(0);
}`, points: ['<code>vector&lt;unique_ptr&lt;Filter&gt;&gt;</code>: 종류가 다른 필터를 한 목록에', '<code>f-&gt;apply</code> 는 실제 객체의 함수를 부른다', '반복문은 필터 종류를 모른다 → 필터를 추가해도 그대로'], notes: '<p>실행해 평균이 119.2 → 119.2 → 182.0 으로 바뀌는 것을 봅니다. 💬 "필터 순서를 바꾸면(Otsu 를 먼저)?" — 컬러에 threshold 를 하면 채널별로 이진화 된다(OtsuF 는 1채널 필요 → 오류). 그래서 본문의 필터들은 안에서 toGray 를 한다는 약속으로 연결. (5분)</p>' },
          { layout: 'diagram', title: '가상 함수는 어떻게 불리나 (vtable)', html: FIG_VTABLE, caption: '객체의 vptr → 클래스의 가상 함수 표 → 실제 함수', notes: '<p>깊이 들어가지 말고 "객체가 자기 클래스의 함수 표를 가리키는 포인터를 하나 더 갖고 있다" 정도로 설명합니다. 비용은 호출당 포인터 두 번 따라가기 — 이미지 처리 시간에 비하면 0 에 가깝다. (3분)</p>' },
          { layout: 'code', title: '예제 2: unique_ptr — 소유권 이동', code: `#include <iostream>
#include <memory>
#include <vector>
using namespace std;
struct Filter { virtual ~Filter() { cout << "  ~Filter" << endl; } };
struct Blur : Filter
{
    int k;
    explicit Blur(int k) : k(k) { cout << "  Blur(" << k << ")" << endl; }
    ~Blur() override { cout << "  ~Blur(" << k << ")" << endl; }
};
int main()
{
    unique_ptr<Filter> p = make_unique<Blur>(3);
    vector<unique_ptr<Filter>> v;
    // v.push_back(p);            // 오류: 복사 불가
    v.push_back(move(p));          // 소유권 이동 → p == nullptr
    cout << "p " << (p ? "있음" : "nullptr") << endl;
    v.push_back(make_unique<Blur>(7));
    v.erase(v.begin());            // 자동 delete (자식 → 부모 순)
    cout << "main 끝" << endl;
    return 0;                      // v 소멸 → Blur(7) delete
}`, points: ['복사 금지 · <b>move</b> 로만 이동', 'move 후 원래 포인터는 nullptr', '소유자가 사라지면 자동 delete (RAII)', '가상 소멸자 → 자식 소멸자부터'], notes: '<p>주석을 풀어 컴파일 오류 메시지("삭제된 함수를 참조")를 함께 읽습니다. 💬 "Mat 도 이렇게 소멸 때 메모리를 푼다 — 무엇이 다른가?" — Mat 은 공유(참조 계수, shared_ptr 과 비슷), unique_ptr 은 독점. (5분)</p>' },
          { layout: 'bullets', title: '필터 약속(계약) 3가지', bullets: [
            '① 입력 <code>src</code> 를 <b>바꾸지 않는다</b>',
            '② 항상 <b>새 데이터</b>의 Mat 을 돌려준다',
            '③ <b>1채널 · 3채널</b> 입력을 모두 받는다 (필요하면 안에서 toGray)',
            '⚠️ <code>const Mat&amp;</code> 는 헤더만 지킨다: <code>Mat m = src; bitwise_not(m, m);</code> → 원본 파괴',
            '예제 3: <code>norm(src, backup, NORM_INF) == 0</code> · <code>dst.data != src.data</code> 로 자동 검사'
          ], notes: '<p>예제 3 을 실행해 BadFilter 만 NG 가 나오는 것을 봅니다. 💬 "왜 const 인데 바뀌지?" — const 는 Mat 헤더 객체에 대한 것이고, 픽셀 데이터는 포인터가 가리키는 별도 메모리. 03차시의 헤더/데이터 그림을 다시 떠올리게 합니다. 이 약속이 3교시 History 의 안전성과 이어집니다. (5분)</p>' },
          { layout: 'code', title: '예제 4: Pipeline + 전후 비교', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;
Mat sideBySide(const Mat& before, const Mat& after)
{
    Mat l = before, r = after, out;
    if (l.channels() == 1) cvtColor(before, l, COLOR_GRAY2BGR);
    if (r.channels() == 1) cvtColor(after, r, COLOR_GRAY2BGR);
    hconcat(l, r, out);                                 // 높이 · 형식이 같아야 한다
    rectangle(out, Rect(0, 0, out.cols, 32), Scalar(0, 0, 0), FILLED);
    putText(out, "BEFORE", Point(10, 23), FONT_HERSHEY_SIMPLEX, 0.7, Scalar(255, 255, 255), 2);
    putText(out, "AFTER", Point(l.cols + 10, 23), FONT_HERSHEY_SIMPLEX, 0.7, Scalar(0, 255, 255), 2);
    return out;
}
int main()
{
    Mat img = imread("images/salt_pepper.png"), g, m, bin;
    cvtColor(img, g, COLOR_BGR2GRAY);
    medianBlur(g, m, 5);
    threshold(m, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    imshow("before | after", sideBySide(img, bin));       // 1280 x 480
    waitKey(0);
}`, points: ['Pipeline: <code>add(unique_ptr)</code> · <code>run</code> · <code>describe</code>', 'hconcat 전에 <b>GRAY2BGR</b> 로 채널 맞추기', '<code>putText</code> 는 영문만 → 라벨은 영어', '본문 예제 4 는 Pipeline 클래스로 같은 일을 한다'], notes: '<p>슬라이드 코드는 함수 버전(짧게), 본문 예제 4 는 Pipeline 클래스 버전입니다. 결과 창에서 비교 화면을 확대해 잡음이 사라진 것과 구멍 7개(+ 바깥 배경)를 확인합니다. 💬 "cvtColor 를 빼면?" — hconcat 형식 불일치 오류. 일부러 빼고 실행해 오류 메시지를 읽는 것도 좋습니다. (5분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>vector&lt;unique_ptr&lt;Filter&gt;&gt; v;</code> 에 <code>auto p = make_unique&lt;GrayFilter&gt;();</code> 를 넣는 올바른 코드는?', options: ['<code>v.push_back(p);</code>', '<code>v.push_back(move(p));</code>', '<code>v.push_back(*p);</code>', '<code>v.push_back(&amp;p);</code>'], answer: 1, explain: 'unique_ptr 은 복사 불가 · 이동만 가능. move 후 p 는 nullptr.', notes: '<p>정답 2번. 3번(*p)은 추상 클래스 객체를 값으로 복사하려는 것이라 불가능하다는 점도 짚습니다. (2분)</p>' },
          { layout: 'practice', title: '실습: MedianFilter 추가', desc: '<p><code>Filter</code> 를 상속하는 <code>MedianFilter</code> 를 만드세요.</p><ul><li>생성자: k 를 3 이상 홀수로 보정 (4 → 5)</li><li>apply = <code>medianBlur</code>, name = <code>"Median(5)"</code></li><li><code>salt_pepper.png</code> 에서 0/255 픽셀 수 전후 비교 (24331 → 0)</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <memory>
using namespace cv;
using namespace std;

class Filter
{
public:
    virtual ~Filter() = default;
    virtual Mat apply(const Mat& src) const = 0;
    virtual string name() const = 0;
};

// TODO: MedianFilter

int main()
{
    Mat img = imread("images/salt_pepper.png", IMREAD_GRAYSCALE);
    cout << countNonZero(img == 0) + countNonZero(img == 255) << endl;
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <memory>
using namespace cv;
using namespace std;

class Filter
{
public:
    virtual ~Filter() = default;
    virtual Mat apply(const Mat& src) const = 0;
    virtual string name() const = 0;
};

class MedianFilter : public Filter
{
public:
    explicit MedianFilter(int k) : k_(k < 3 ? 3 : (k % 2 ? k : k + 1)) {}
    Mat apply(const Mat& src) const override { Mat d; medianBlur(src, d, k_); return d; }
    string name() const override { return "Median(" + to_string(k_) + ")"; }
private:
    int k_;
};

int main()
{
    Mat img = imread("images/salt_pepper.png", IMREAD_GRAYSCALE);
    unique_ptr<Filter> f = make_unique<MedianFilter>(4);
    Mat out = f->apply(img);
    cout << f->name() << ": " << countNonZero(img == 0) + countNonZero(img == 255)
         << " -> " << countNonZero(out == 0) + countNonZero(out == 255) << endl;
    return 0;
}`, notes: '<p>빨리 끝난 학생은 실습 2(BC 필터)로. 흔한 실수: 생성자 초기화 목록 대신 본문에서 <code>k_</code> 를 보정하다 짝수 처리를 빠뜨림, <code>override</code> 누락. (7분)</p>' },
          { layout: 'summary', title: '정리 — 1교시', bullets: ['요구 사항 → 클래스: Filter · Pipeline · History · 해석기 (한 클래스 한 가지 일)', '추상 클래스: <b>가상 소멸자 · 순수 가상 함수(= 0) · override</b>', '<code>vector&lt;unique_ptr&lt;Filter&gt;&gt;</code> + <code>f-&gt;apply()</code> = 다형성', 'unique_ptr: 주인 한 명 · <b>move</b> 로만 이동 · 자동 delete', '필터 약속: 입력 보존 · 새 Mat · 1/3채널 — <code>const Mat&amp;</code> 는 픽셀을 못 지킨다', '다음 교시: 파일 나누기(.h/.cpp) · 팩토리 · 명령 해석기'], notes: '<p>과제: 실습 2(BC 필터)를 완성해 오기. 다음 시간에는 오늘 만든 클래스들을 <code>Filter.h</code> · <code>Filters.cpp</code> 로 나누고 명령 문자열로 필터를 만들게 됩니다. (3분)</p>' }
        ]
      },
      // ================================================================ 2교시
      {
        id: 'cv16-2', title: '파일 나누기 · 팩토리 · 명령 해석기', minutes: 50,
        goals: ['선언(.h)과 정의(.cpp)를 나누고 #pragma once · include 관계를 설명할 수 있다', 'map&lt;string, function&gt; 과 람다로 "명령 이름 → 필터 객체" 팩토리를 만들 수 있다', 'getline + istringstream 으로 명령과 인수를 나누어 읽고 기본값을 줄 수 있다', '잘못된 명령 · 인수를 예외로 알리고 try/catch 로 처리해 프로그램이 죽지 않게 할 수 있다'],
        flow: [['복습 · 문제 제기', 5], ['헤더/소스 분리', 12], ['팩토리 · istringstream', 18], ['예외 처리 · 실습', 10], ['정리 · 퀴즈', 5]],
        content: [
          { type: 'h', text: '파일이 길어졌다: 헤더(.h)와 소스(.cpp) 나누기' },
          { type: 'p', html: '필터가 9개가 되면 한 파일이 수백 줄이 됩니다. C++ 는 보통 <b>선언</b>(무엇이 있는가: 클래스 모양 · 함수 원형)을 <b>헤더 파일(.h)</b>에, <b>정의</b>(어떻게 하는가: 함수 몸체)를 <b>소스 파일(.cpp)</b>에 둡니다. 다른 파일은 헤더만 <code>#include</code> 해서 "이런 클래스가 있다" 는 것을 알고, 실제 코드는 링커가 이어 줍니다. 이 사이트의 편집기는 <code>// ===== File: Filter.h =====</code> 구분 주석으로 <b>한 편집기 안에 여러 파일</b>을 넣을 수 있고, 모든 .cpp 를 따로 컴파일한 뒤 링크합니다 — Visual Studio 프로젝트와 같은 방식입니다.' },
          { type: 'figure', html: FIG_FILES, caption: '그림 4. 파일 나누기 — 헤더는 여러 cpp 가 include 하고, cpp 는 각각 컴파일(.obj)된 뒤 링크되어 exe 가 된다' },
          { type: 'table', head: ['파일', '넣는 것', '넣지 않는 것'], rows: [
            ['<code>Filter.h</code>', '<code>class Filter</code> · 자식 클래스 선언 · 짧은 멤버 함수(<code>name()</code>) · 함수 원형 · <code>using FilterMaker</code>', '<code>using namespace std;</code> (include 한 모든 파일에 퍼짐) · 긴 함수 몸체'],
            ['<code>Filters.cpp</code>', '<code>Mat BlurFilter::apply(...) { … }</code> 정의 · 팩토리 · <code>static</code> 도우미', '<code>main</code>'],
            ['<code>Pipeline.h</code> · <code>History.h</code>', '짧은 클래스는 헤더 안에 몸체까지 (클래스 안 함수 = 자동 inline)', '—'],
            ['<code>main.cpp</code>', '<code>main()</code> · 명령 해석기', '다른 파일에서 쓸 클래스']
          ], caption: '표 3. 무엇을 어디에 — 헤더에서는 std:: · cv:: 를 붙여 쓰고, cpp 에서만 using namespace 를 쓴다' },
          { type: 'code', title: '예제 1: 네 파일로 나눈 필터 프로그램', code: EX2_SPLIT,
            desc: '편집기 하나에 <code>Filter.h</code> · <code>Filters.cpp</code> · <code>Pipeline.h</code> · <code>main.cpp</code> 네 파일이 들어 있습니다. 헤더에서는 <code>cv::Mat</code> · <code>std::string</code> 처럼 이름공간을 붙여 쓰고, cpp 에서는 <code>using namespace cv;</code> 를 씁니다. 클래스 밖에서 멤버 함수를 정의할 때는 <code>Mat BlurFilter::apply(const Mat&amp; src) const</code> 처럼 <b>클래스 이름::</b> 을 붙이고 <code>const</code> 까지 똑같이 적습니다(<code>override</code> 는 쓰지 않음). 마지막의 <code>CannyFilter(50, 150).apply(img)</code> 처럼 필터 하나를 임시 객체로 바로 써도 됩니다.',
            expect: '파이프라인: Gray -> Blur(5) -> Thresh(otsu) (3단계)\n결과: CV_8UC1, 흰 픽셀 260277\nCanny 에지 픽셀: 5589' },
          { type: 'callout', kind: 'warn', title: '파일을 나눌 때 흔한 오류 3가지', html: '<ul><li><b>재정의 오류</b>(C2011 “class 형식 재정의”): 헤더에 <code>#pragma once</code> 를 빠뜨림 — Pipeline.h 가 Filter.h 를 include 하고 main.cpp 도 Filter.h 를 include 하면 두 번 읽힙니다.</li><li><b>링크 오류 LNK2019</b>(확인할 수 없는 외부 기호): 헤더에 선언만 하고 cpp 에 정의를 안 썼거나, 정의의 서명(<code>const</code> 빠짐 등)이 달라 다른 함수가 됨. 또는 Filters.cpp 가 프로젝트에 추가되지 않음.</li><li><b>링크 오류 LNK2005</b>(이미 정의됨): 클래스 밖 함수의 몸체를 헤더에 쓰고 여러 cpp 에서 include. 몸체는 cpp 로 옮기거나 <code>inline</code> 을 붙입니다.</li></ul>' },
          { type: 'callout', kind: 'vs', title: 'Visual Studio 에서 파일 추가하기', html: '솔루션 탐색기에서 프로젝트 오른쪽 클릭 → <b>추가 → 새 항목</b> → “헤더 파일(.h)” 또는 “C++ 파일(.cpp)”. 새 헤더에는 <code>#pragma once</code> 가 자동으로 들어갑니다. <b>추가 → 클래스</b>를 쓰면 .h/.cpp 한 쌍을 한 번에 만들어 줍니다. 헤더에서 함수 이름에 커서를 두고 <b>Ctrl+.</b> → “정의 만들기” 를 고르면 cpp 에 빈 몸체를 만들어 줍니다. <b>F12</b> 정의로 이동 · <b>Ctrl+K, Ctrl+O</b> 헤더 ↔ 소스 전환.' },
          { type: 'h', text: '팩토리: 명령 이름으로 필터 객체 만들기' },
          { type: 'p', html: '사용자는 <code>"blur 5"</code> 라는 <b>문자열</b>을 입력하는데, 프로그램에 필요한 것은 <code>BlurFilter(5)</code> <b>객체</b>입니다. 가장 쉬운 방법은 <code>if (cmd == "gray") … else if (cmd == "blur") …</code> 사슬이지만, 필터가 늘 때마다 길어지고 "사용 가능한 명령 목록" 을 따로 관리해야 합니다. 대신 <b>“이름 → 만드는 함수” 표</b>를 만듭니다: <code>map&lt;string, FilterMaker&gt;</code>. <code>FilterMaker</code> 는 <code>std::function&lt;unique_ptr&lt;Filter&gt;(istringstream&amp;)&gt;</code> — “남은 인수를 읽어 필터를 만들어 돌려주는 함수” 이고, 각 칸에는 <b>람다</b>를 넣습니다. 이런 “객체를 만들어 주는 함수 · 객체” 를 <b>팩토리(Factory)</b> 패턴이라 부릅니다.' },
          { type: 'figure', html: FIG_FACTORY, caption: '그림 5. 팩토리 — istringstream 으로 첫 단어(명령)를 떼어 map 에서 찾고, 람다가 나머지 인수를 읽어 필터 객체를 만든다' },
          { type: 'code', title: '예제 2: 팩토리 + stdin 명령으로 파이프라인 만들기', code: EX2_FACTORY, stdin: EX2_FACTORY_STDIN,
            desc: '예시 입력(stdin) 네 줄 <code>gray</code> · <code>blur 7</code> · <code>sepia</code> · <code>thresh otsu</code> 를 한 줄씩 <code>getline</code> 으로 읽습니다. <code>istringstream in(line)</code> 에서 <code>in &gt;&gt; cmd</code> 로 첫 단어를 떼면 in 에는 인수만 남고, 이것을 람다에 넘깁니다. 없는 명령(sepia)은 <code>find() == end()</code> 로 걸러집니다. <code>for (const auto&amp; [key, maker] : factory)</code> 는 C++17 <b>구조적 바인딩</b>으로 map 의 (키, 값) 쌍을 풀어 받습니다 — map 은 키 순서로 정렬되어 있어 목록이 알파벳 순으로 나옵니다. 편집기 아래 입력 칸의 명령을 바꿔(예: <code>canny 30 90</code>) 다시 실행해 보세요.',
            expect: '등록된 명령: blur canny gray thresh\n추가 1: gray\n추가 2: blur 7\n알 수 없는 명령: sepia\n추가 3: thresh otsu\n파이프라인: Gray -> Blur(7) -> Thresh(otsu)\n결과: CV_8UC1, 흰 픽셀 219340' },
          { type: 'callout', kind: 'tip', title: '람다의 반환형이 다를 때', html: '<code>f["gray"] = [](istringstream&amp;) { return make_unique&lt;GrayFilter&gt;(); };</code> 의 람다는 <code>unique_ptr&lt;GrayFilter&gt;</code> 를 돌려주지만, <code>std::function</code> 이 <code>unique_ptr&lt;Filter&gt;</code> 로 자동 변환해 줍니다. 그러나 <code>thresh</code> 처럼 <b>한 람다 안에서 return 이 두 번</b> 나오면 반환형을 하나로 정해야 하므로 <code>-&gt; std::unique_ptr&lt;Filter&gt;</code> 를 명시합니다. 빼면 “반환 형식이 일치하지 않음” 컴파일 오류가 납니다.' },
          { type: 'h', text: '인수 읽기와 예외 처리: 틀린 입력에도 죽지 않기' },
          { type: 'p', html: '<code>in &gt;&gt; k</code> 는 숫자를 읽지 못하면 예외 대신 <b>실패 상태</b>가 됩니다. 두 경우를 구분해야 합니다. ① 읽을 것이 <b>없다</b>(<code>"blur"</code>) → <code>in.eof()</code> 가 참 → 기본값 5 를 쓴다. ② 읽을 것이 있는데 <b>숫자가 아니다</b>(<code>"blur abc"</code>) → 사용자의 실수 → <code>throw std::invalid_argument(...)</code>. 범위를 벗어난 값(<code>thresh 300</code>)은 <code>std::out_of_range</code> 를 던집니다. 명령 해석기는 한 곳에서 <code>try { … } catch (const std::exception&amp; e)</code> 로 받아 메시지만 출력하고 <b>다음 명령을 계속</b> 받습니다. OpenCV 함수 안의 오류는 <code>cv::Exception</code>(std::exception 의 자식)으로 날아오며 <code>e.code</code> · <code>e.err</code>(실패한 조건) · <code>e.func</code> 로 자세한 내용을 볼 수 있습니다.' },
          { type: 'code', title: '예제 3: 잘못된 명령 · 인수 · OpenCV 오류 처리', code: EX2_ERRORS, stdin: EX2_ERRORS_STDIN,
            desc: '<code>blur 4</code> 는 오류가 아니라 5 로 <b>보정</b>하고(사용자 편의), <code>blur abc</code> · <code>thresh 300</code> · <code>canny 150 50</code> 은 예외로 알립니다. <code>canny 80</code> 처럼 두 번째 인수가 없으면 기본값 150 을 씁니다. 마지막에는 필터를 거치지 않고 <code>GaussianBlur</code> 에 짝수 커널을 직접 주어 <code>cv::Exception</code> 을 받아 봅니다 — <code>code=-215</code> 는 “조건 검사 실패(Assertion failed)” 입니다. 잡는 순서가 중요합니다: 한 try 에 두 catch 를 둘 때는 <b>자식(cv::Exception)을 먼저</b>, 부모(std::exception)를 나중에 씁니다.',
            expect: '> blur 4\n  Blur(5) OK, 평균 191.8\n> blur abc\n  오류: blur: 숫자가 필요합니다\n> thresh 300\n  오류: thresh: 0~255 또는 otsu\n> thresh otsu\n  Thresh(otsu) OK, 평균 216.4\n> canny 150 50\n  오류: canny: 낮은 값 < 높은 값 이어야 합니다\n> canny 80\n  Canny(80,150) OK, 평균 4.6\ncv::Exception code=-215 (조건 검사 실패)' },
          { type: 'callout', kind: 'more', title: '📘 보정할까, 거부할까?', html: '커널 4 → 5 처럼 <b>의도가 분명한 작은 실수</b>는 조용히 보정하고(이름에 <code>Blur(5)</code> 로 드러나게), <code>thresh 300</code> 처럼 <b>의도를 알 수 없는 값</b>은 거부하는 것이 보통입니다. 검사 장비 소프트웨어에서는 파라미터 파일을 읽을 때 같은 규칙을 적용하고, 보정한 경우 로그를 남깁니다. <code>std::stoi</code> 도 숫자가 아니면 <code>invalid_argument</code> 를 던지지만 <code>"5abc"</code> 를 5 로 읽어 버리므로, 여기서는 스트림으로 직접 검사했습니다.' }
        ],
        practice: [
          {
            title: '팩토리에 median · invert 등록하기', level: 1,
            desc: '아래 코드에는 <code>MedianFilter</code> · <code>InvertFilter</code> 클래스가 이미 있습니다. <code>makeFactory()</code> 에 <code>"median"</code>(인수 k, 기본값 5) 과 <code>"invert"</code>(인수 없음) 두 줄을 등록하세요. 예시 입력 <code>median 3</code> · <code>invert</code> · <code>median</code> 을 실행하면 아래처럼 나와야 합니다. <b>main 은 고치지 않습니다</b> — 팩토리의 장점입니다.',
            hint: '<code>f["median"] = [](istringstream&amp; in) { int k = 5; in &gt;&gt; k; return make_unique&lt;MedianFilter&gt;(k); };</code> — 읽기에 실패하면 k 가 0 이 될 수 있으니 기본값을 쓰려면 <code>if (!(in &gt;&gt; k)) k = 5;</code>',
            stdin: 'median 3\ninvert\nmedian\n',
            expect: '등록: blur gray invert median\nmedian 3 -> Median(3), 평균 119.2\ninvert -> Invert, 평균 135.8\nmedian -> Median(5), 평균 119.2',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <functional>
#include <map>
#include <memory>
#include <sstream>
using namespace cv;
using namespace std;

class Filter
{
public:
    virtual ~Filter() = default;
    virtual Mat apply(const Mat& src) const = 0;
    virtual string name() const = 0;
};
struct GrayFilter : Filter
{
    Mat apply(const Mat& s) const override { Mat d; cvtColor(s, d, COLOR_BGR2GRAY); return d; }
    string name() const override { return "Gray"; }
};
struct BlurFilter : Filter
{
    int k;
    explicit BlurFilter(int k) : k(k % 2 ? k : k + 1) {}
    Mat apply(const Mat& s) const override { Mat d; GaussianBlur(s, d, Size(k, k), 0); return d; }
    string name() const override { return "Blur(" + to_string(k) + ")"; }
};
struct MedianFilter : Filter
{
    int k;
    explicit MedianFilter(int k) : k(k % 2 ? k : k + 1) {}
    Mat apply(const Mat& s) const override { Mat d; medianBlur(s, d, k); return d; }
    string name() const override { return "Median(" + to_string(k) + ")"; }
};
struct InvertFilter : Filter
{
    Mat apply(const Mat& s) const override { Mat d; bitwise_not(s, d); return d; }
    string name() const override { return "Invert"; }
};

using FilterMaker = function<unique_ptr<Filter>(istringstream&)>;

map<string, FilterMaker> makeFactory()
{
    map<string, FilterMaker> f;
    f["gray"] = [](istringstream&) { return make_unique<GrayFilter>(); };
    f["blur"] = [](istringstream& in) { int k; if (!(in >> k)) k = 5; return make_unique<BlurFilter>(k); };
    // TODO: "median" (k, 기본값 5), "invert" 등록
    return f;
}

int main()
{
    auto factory = makeFactory();
    cout << "등록:";
    for (const auto& kv : factory) cout << " " << kv.first;
    cout << endl;
    Mat img = imread("images/sample_gray.png", IMREAD_GRAYSCALE);
    string line;
    while (getline(cin, line))
    {
        istringstream in(line);
        string cmd;
        in >> cmd;
        auto it = factory.find(cmd);
        if (it == factory.end()) { cout << line << " -> 알 수 없는 명령" << endl; continue; }
        auto flt = it->second(in);
        cout << line << " -> " << flt->name() << format(", 평균 %.1f", mean(flt->apply(img))[0]) << endl;
    }
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <functional>
#include <map>
#include <memory>
#include <sstream>
using namespace cv;
using namespace std;

class Filter
{
public:
    virtual ~Filter() = default;
    virtual Mat apply(const Mat& src) const = 0;
    virtual string name() const = 0;
};
struct GrayFilter : Filter
{
    Mat apply(const Mat& s) const override { Mat d; cvtColor(s, d, COLOR_BGR2GRAY); return d; }
    string name() const override { return "Gray"; }
};
struct BlurFilter : Filter
{
    int k;
    explicit BlurFilter(int k) : k(k % 2 ? k : k + 1) {}
    Mat apply(const Mat& s) const override { Mat d; GaussianBlur(s, d, Size(k, k), 0); return d; }
    string name() const override { return "Blur(" + to_string(k) + ")"; }
};
struct MedianFilter : Filter
{
    int k;
    explicit MedianFilter(int k) : k(k % 2 ? k : k + 1) {}
    Mat apply(const Mat& s) const override { Mat d; medianBlur(s, d, k); return d; }
    string name() const override { return "Median(" + to_string(k) + ")"; }
};
struct InvertFilter : Filter
{
    Mat apply(const Mat& s) const override { Mat d; bitwise_not(s, d); return d; }
    string name() const override { return "Invert"; }
};

using FilterMaker = function<unique_ptr<Filter>(istringstream&)>;

map<string, FilterMaker> makeFactory()
{
    map<string, FilterMaker> f;
    f["gray"] = [](istringstream&) { return make_unique<GrayFilter>(); };
    f["blur"] = [](istringstream& in) { int k; if (!(in >> k)) k = 5; return make_unique<BlurFilter>(k); };
    f["median"] = [](istringstream& in) { int k; if (!(in >> k)) k = 5; return make_unique<MedianFilter>(k); };
    f["invert"] = [](istringstream&) { return make_unique<InvertFilter>(); };
    return f;
}

int main()
{
    auto factory = makeFactory();
    cout << "등록:";
    for (const auto& kv : factory) cout << " " << kv.first;
    cout << endl;
    Mat img = imread("images/sample_gray.png", IMREAD_GRAYSCALE);
    string line;
    while (getline(cin, line))
    {
        istringstream in(line);
        string cmd;
        in >> cmd;
        auto it = factory.find(cmd);
        if (it == factory.end()) { cout << line << " -> 알 수 없는 명령" << endl; continue; }
        auto flt = it->second(in);
        cout << line << " -> " << flt->name() << format(", 평균 %.1f", mean(flt->apply(img))[0]) << endl;
    }
    return 0;
}`
          },
          {
            title: 'help 와 “혹시 이 명령?” 추천 만들기', level: 2,
            desc: '명령 해석기에 두 기능을 더하세요. ① <code>help</code>: 팩토리의 모든 명령 이름을 한 줄로 출력 ② 없는 명령이면 <b>첫 글자가 같은</b> 등록 명령을 추천(<code>"blr"</code> → <code>혹시: blur</code>), 없으면 <code>help 를 입력하세요</code>. 예시 입력: <code>help</code> · <code>blr 5</code> · <code>cany</code> · <code>xyz</code> · <code>blur 3</code>.',
            hint: '추천: <code>for (const auto&amp; kv : factory) if (kv.first[0] == cmd[0]) …</code>. 여러 개면 공백으로 이어 붙입니다. 추천 목록이 비었는지는 <code>string::empty()</code>.',
            stdin: 'help\nblr 5\ncany\nxyz\nblur 3\n',
            expect: '> help\n  명령: blur canny gray thresh\n> blr 5\n  알 수 없는 명령 blr. 혹시: blur\n> cany\n  알 수 없는 명령 cany. 혹시: canny\n> xyz\n  알 수 없는 명령 xyz. help 를 입력하세요\n> blur 3\n  Blur(3) 생성',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <functional>
#include <map>
#include <memory>
#include <sstream>
using namespace cv;
using namespace std;

struct Filter { virtual ~Filter() = default; virtual string name() const = 0; };
struct Named : Filter
{
    string n;
    explicit Named(string n) : n(move(n)) {}
    string name() const override { return n; }
};
using FilterMaker = function<unique_ptr<Filter>(istringstream&)>;

int main()
{
    map<string, FilterMaker> factory;
    factory["gray"] = [](istringstream&) { return make_unique<Named>("Gray"); };
    factory["blur"] = [](istringstream& in) { int k = 5; in >> k; return make_unique<Named>("Blur(" + to_string(k) + ")"); };
    factory["thresh"] = [](istringstream&) { return make_unique<Named>("Thresh(otsu)"); };
    factory["canny"] = [](istringstream&) { return make_unique<Named>("Canny(50,150)"); };

    string line;
    while (getline(cin, line))
    {
        cout << "> " << line << endl;
        istringstream in(line);
        string cmd;
        in >> cmd;
        // TODO: help 처리
        auto it = factory.find(cmd);
        if (it == factory.end())
        {
            // TODO: 첫 글자가 같은 명령 추천
            cout << "  알 수 없는 명령 " << cmd << endl;
            continue;
        }
        cout << "  " << it->second(in)->name() << " 생성" << endl;
    }
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <functional>
#include <map>
#include <memory>
#include <sstream>
using namespace cv;
using namespace std;

struct Filter { virtual ~Filter() = default; virtual string name() const = 0; };
struct Named : Filter
{
    string n;
    explicit Named(string n) : n(move(n)) {}
    string name() const override { return n; }
};
using FilterMaker = function<unique_ptr<Filter>(istringstream&)>;

int main()
{
    map<string, FilterMaker> factory;
    factory["gray"] = [](istringstream&) { return make_unique<Named>("Gray"); };
    factory["blur"] = [](istringstream& in) { int k = 5; in >> k; return make_unique<Named>("Blur(" + to_string(k) + ")"); };
    factory["thresh"] = [](istringstream&) { return make_unique<Named>("Thresh(otsu)"); };
    factory["canny"] = [](istringstream&) { return make_unique<Named>("Canny(50,150)"); };

    string line;
    while (getline(cin, line))
    {
        cout << "> " << line << endl;
        istringstream in(line);
        string cmd;
        in >> cmd;
        if (cmd == "help")
        {
            cout << "  명령:";
            for (const auto& kv : factory) cout << " " << kv.first;
            cout << endl;
            continue;
        }
        auto it = factory.find(cmd);
        if (it == factory.end())
        {
            string guess;
            for (const auto& kv : factory)
                if (!cmd.empty() && kv.first[0] == cmd[0]) guess += (guess.empty() ? "" : " ") + kv.first;
            cout << "  알 수 없는 명령 " << cmd << (guess.empty() ? ". help 를 입력하세요" : ". 혹시: " + guess) << endl;
            continue;
        }
        cout << "  " << it->second(in)->name() << " 생성" << endl;
    }
    return 0;
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: '파일 나누기 · 팩토리 · 명령 해석기', subtitle: '2교시 — "blur 5" 라는 글자를 필터 객체로', notes: '<p>1교시 복습: 💬 "Filter 의 세 가지 규칙은?" — 가상 소멸자, 순수 가상 함수, override. 오늘은 ① 파일을 나누고 ② 문자열 명령으로 필터를 만들고 ③ 틀린 입력을 처리합니다. (3분)</p>' },
          { layout: 'diagram', title: '헤더와 소스, 컴파일과 링크', html: FIG_FILES, caption: '.h = 선언(무엇이 있다) · .cpp = 정의(어떻게) · cpp 마다 따로 컴파일 → 링크', notes: '<p>01차시의 빌드 과정(컴파일 → 링크)을 떠올리게 합니다. 💬 "Filters.cpp 만 고쳤다면 main.cpp 도 다시 컴파일해야 할까?" — 아니오. 큰 프로젝트에서 파일을 나누는 이유 중 하나가 빌드 시간. (4분)</p>' },
          { layout: 'two', title: '선언과 정의 나누기', left: { title: 'Filter.h (선언)', code: `#pragma once
#include <opencv2/opencv.hpp>
#include <string>

class BlurFilter : public Filter
{
public:
    explicit BlurFilter(int k) : k_(oddKernel(k)) {}
    cv::Mat apply(const cv::Mat& src) const override;
    std::string name() const override
    { return "Blur(" + std::to_string(k_) + ")"; }
private:
    int k_;
};`, run: false }, right: { title: 'Filters.cpp (정의)', code: `#include "Filter.h"
using namespace cv;

Mat BlurFilter::apply(const Mat& src) const
{
    Mat dst;
    GaussianBlur(src, dst, Size(k_, k_), 0);
    return dst;
}`, run: false }, notes: '<p>짚을 점: ① 헤더는 <code>cv::</code> · <code>std::</code> 를 붙인다(using namespace 금지) ② 정의에는 <code>BlurFilter::</code> 와 <code>const</code> 를 붙이고 <code>override</code> 는 뺀다 ③ 짧은 <code>name()</code> 은 헤더 클래스 안에 두어도 된다(자동 inline). (5분)</p>' },
          { layout: 'bullets', title: '이 사이트에서 여러 파일 쓰기', bullets: [
            '구분 주석: <code>// ===== File: Filter.h =====</code>',
            '각 .cpp 를 따로 컴파일 → 링크 (Visual Studio 와 같다)',
            '<code>#include "Filter.h"</code> — 따옴표 = 내 파일, 꺾쇠 = 라이브러리',
            '오류 메시지에 <b>파일 이름:줄</b> 이 나온다 → 클릭하면 이동',
            'Visual Studio: 추가 → 새 항목 / 추가 → 클래스(.h + .cpp 한 쌍)'
          ], notes: '<p>예제 1 을 실행하고, 일부러 Filters.cpp 의 <code>GrayFilter::apply</code> 정의를 지워 링크 오류(정의되지 않은 기호)를 보여 줍니다. 그 다음 <code>#pragma once</code> 를 지워 재정의 오류도 보여 주면 좋습니다. (5분)</p>' },
          { layout: 'diagram', title: '팩토리: 이름 → 만드는 함수', html: FIG_FACTORY, caption: 'map<string, function<unique_ptr<Filter>(istringstream&)>>', notes: '<p>💬 "명령이 30개면 if/else 가 몇 줄?" — 매우 길어지고, help 목록도 따로 관리해야 한다. 표로 바꾸면 등록 한 줄 + 목록 자동. std::function 은 “함수처럼 부를 수 있는 것은 무엇이든 담는 상자” 라고 설명합니다. (4분)</p>' },
          { layout: 'code', title: '예제 2: 팩토리 (핵심만)', code: `#include <functional>
#include <iostream>
#include <map>
#include <memory>
#include <sstream>
using namespace std;
struct Filter { virtual ~Filter() = default; virtual string name() const = 0; };
struct Blur : Filter { int k; explicit Blur(int k) : k(k) {} string name() const override { return "Blur(" + to_string(k) + ")"; } };
struct Gray : Filter { string name() const override { return "Gray"; } };
using FilterMaker = function<unique_ptr<Filter>(istringstream&)>;
int main()
{
    map<string, FilterMaker> factory;
    factory["gray"] = [](istringstream&) { return make_unique<Gray>(); };
    factory["blur"] = [](istringstream& in) { int k = 5; in >> k; return make_unique<Blur>(k); };
    string line;
    while (getline(cin, line))
    {
        istringstream in(line); string cmd; in >> cmd;    // 첫 단어 = 명령
        auto it = factory.find(cmd);
        if (it != factory.end()) cout << it->second(in)->name() << endl;   // 나머지 = 인수
        else cout << "? " << cmd << endl;
    }
}`, stdin: 'gray\nblur 7\nsepia\n', points: ['<code>getline</code> 한 줄 → <code>istringstream</code> 으로 단어 나누기', '<code>factory.find(cmd)</code> → 없으면 <code>end()</code>', '<code>it-&gt;second(in)</code>: 람다가 인수를 읽어 객체 생성', '새 명령 = 등록 한 줄'], notes: '<p>stdin 입력 칸을 보여 주고 명령을 바꿔 실행합니다. 💬 "blur 뒤에 숫자를 안 쓰면 k 는?" — 5 (읽기 실패, 초기값 유지 — 단 C++11 부터 실패 시 0 을 쓰는 경우도 있어 본문 readInt 처럼 명시적으로 처리). (6분)</p>' },
          { layout: 'table', title: '인수 처리 규칙', head: ['입력', '상태', '처리'], rows: [
            ['<code>blur</code>', 'eof (읽을 것 없음)', '기본값 5'],
            ['<code>blur 4</code>', '짝수', '5 로 보정 (Blur(5))'],
            ['<code>blur abc</code>', 'fail (숫자 아님)', '<code>invalid_argument</code>'],
            ['<code>thresh 300</code>', '범위 밖', '<code>out_of_range</code>'],
            ['<code>canny 150 50</code>', 'lo ≥ hi', '<code>invalid_argument</code>'],
            ['<code>sepia</code>', '없는 명령', '안내 메시지']
          ], lead: 'readInt: if (in >> v) 성공 · else if (in.eof()) 기본값 · else throw', notes: '<p>표를 보며 각 줄의 결과를 예측하게 한 뒤 예제 3 을 실행해 확인합니다. “보정 vs 거부” 의 판단 기준(의도가 분명한가)을 토론해 봅니다. (4분)</p>' },
          { layout: 'code', title: '예제 3: try/catch 로 계속 실행', code: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <stdexcept>
using namespace cv;
using namespace std;
int parseKernel(const string& s)
{
    istringstream in(s);
    int k;
    if (!(in >> k)) throw invalid_argument("숫자가 필요합니다: " + s);
    if (k < 1 || k > 99) throw out_of_range("1~99: " + s);
    return k % 2 ? k : k + 1;
}
int main()
{
    for (string s : { "5", "abc", "300", "4" })
    {
        try { cout << s << " -> " << parseKernel(s) << endl; }
        catch (const exception& e) { cout << s << " -> 오류: " << e.what() << endl; }
    }
    try { Mat d; GaussianBlur(Mat(10, 10, CV_8UC1), d, Size(4, 4), 0); }
    catch (const cv::Exception& e) { cout << "cv::Exception " << e.code << endl; }
    return 0;
}`, points: ['<code>throw</code> 는 어디서든, <code>catch</code> 는 해석기 한 곳에서', '<code>e.what()</code> 메시지 출력 후 다음 명령 계속', 'OpenCV 오류 = <code>cv::Exception</code> (<code>e.code</code> · <code>e.err</code>)', '여러 catch: <b>자식 먼저</b>'], notes: '<p>본문 예제 3 은 팩토리와 함께, 슬라이드는 핵심만. 💬 "catch 가 없으면 어떻게 될까?" — 프로그램이 terminate 로 끝난다(검사 장비라면 라인 정지!). 예외를 삼키기만 하지 말고 반드시 사용자에게 알린다는 원칙도 함께. (6분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>istringstream in("blur abc"); string cmd; int k; in &gt;&gt; cmd; bool ok = (bool)(in &gt;&gt; k);</code> 에서 ok 는?', options: ['true', 'false — 예외 없이 실패 상태가 된다', '예외가 발생한다', 'cmd 가 "blur abc" 가 된다'], answer: 1, explain: '스트림 읽기 실패는 예외가 아니라 failbit. 그래서 readInt 가 확인 후 직접 throw 한다.', notes: '<p>정답 2번. 이어서 "읽을 것이 없을 때와 어떻게 구분하나?" — eof(). (2분)</p>' },
          { layout: 'practice', title: '실습: median · invert 등록', desc: '<p>팩토리에 두 줄만 추가하세요 (main 은 그대로).</p><ul><li><code>"median"</code>: k 읽기, 기본값 5</li><li><code>"invert"</code>: 인수 없음</li><li>예시 입력: <code>median 3</code> · <code>invert</code> · <code>median</code></li></ul>', starter: `#include <functional>
#include <iostream>
#include <map>
#include <memory>
#include <sstream>
using namespace std;

struct Filter { virtual ~Filter() = default; virtual string name() const = 0; };
struct Median : Filter { int k; explicit Median(int k) : k(k) {} string name() const override { return "Median(" + to_string(k) + ")"; } };
struct Invert : Filter { string name() const override { return "Invert"; } };
using FilterMaker = function<unique_ptr<Filter>(istringstream&)>;

int main()
{
    map<string, FilterMaker> factory;
    // TODO: "median", "invert" 등록
    for (string line : { "median 3", "invert", "median" })
    {
        istringstream in(line);
        string cmd; in >> cmd;
        auto it = factory.find(cmd);
        cout << line << " -> " << (it == factory.end() ? "?" : it->second(in)->name()) << endl;
    }
    return 0;
}`, solution: `#include <functional>
#include <iostream>
#include <map>
#include <memory>
#include <sstream>
using namespace std;

struct Filter { virtual ~Filter() = default; virtual string name() const = 0; };
struct Median : Filter { int k; explicit Median(int k) : k(k) {} string name() const override { return "Median(" + to_string(k) + ")"; } };
struct Invert : Filter { string name() const override { return "Invert"; } };
using FilterMaker = function<unique_ptr<Filter>(istringstream&)>;

int main()
{
    map<string, FilterMaker> factory;
    factory["median"] = [](istringstream& in) { int k; if (!(in >> k)) k = 5; return make_unique<Median>(k); };
    factory["invert"] = [](istringstream&) { return make_unique<Invert>(); };
    for (string line : { "median 3", "invert", "median" })
    {
        istringstream in(line);
        string cmd; in >> cmd;
        auto it = factory.find(cmd);
        cout << line << " -> " << (it == factory.end() ? "?" : it->second(in)->name()) << endl;
    }
    return 0;
}`, notes: '<p>슬라이드 실습은 OpenCV 없이 이름만 확인하는 축약판입니다. 본문 실습 1 은 실제 이미지 평균까지 출력합니다. 빨리 끝난 학생은 실습 2(help · 추천). (7분)</p>' },
          { layout: 'summary', title: '정리 — 2교시', bullets: ['.h = 선언 (<code>#pragma once</code>, std::/cv:: 붙이기) · .cpp = 정의 (<code>Class::func</code>)', '오류: 재정의(pragma once 누락) · LNK2019(정의 없음) · LNK2005(헤더에 몸체)', '팩토리: <code>map&lt;string, function&lt;unique_ptr&lt;Filter&gt;(istringstream&amp;)&gt;&gt;</code> + 람다', '<code>getline</code> → <code>istringstream</code> → 첫 단어 = 명령, 나머지 = 인수', '인수: 없으면 기본값 · 작은 실수는 보정 · 나머지는 <b>throw</b> → 해석기에서 catch', '다음 교시: History(undo/redo) · clone · 완성판 Image Studio'], notes: '<p>과제: 실습 2(help · 추천) 완성. 다음 시간에는 되돌리기를 만들며 "왜 clone 이 꼭 필요한가" 를 직접 버그로 확인합니다. (3분)</p>' }
        ]
      },
      // ================================================================ 3교시
      {
        id: 'cv16-3', title: 'History(되돌리기 · 다시 실행) · 저장 · Image Studio 완성', minutes: 50,
        goals: ['undo · redo 스택으로 History 클래스를 만들고 새 작업 시 redo 를 비우는 이유를 설명할 수 있다', '스냅숏을 clone 으로 보관해야 하는 이유를 제자리 처리 버그로 설명할 수 있다', '해석기 · 팩토리 · Pipeline · History 를 조립해 명령형 Image Studio 를 완성하고 imwrite 로 저장할 수 있다', 'Visual Studio 판에서 waitKey 키 입력 · 트랙바를 같은 execute() 로 연결할 수 있다'],
        flow: [['도입: 되돌리기는 어떻게?', 5], ['clone 버그 · History 클래스', 15], ['완성판 조립 · 저장', 15], ['VS 키보드 판 · 실습', 10], ['정리 · 퀴즈', 5]],
        content: [
          { type: 'h', text: '되돌리기 = 스냅숏 스택 두 개' },
          { type: 'p', html: '되돌리기(undo)를 만드는 가장 단순하고 확실한 방법은 <b>필터를 적용하기 전 이미지를 통째로 보관</b>(스냅숏)하는 것입니다. 스택 두 개를 씁니다. <b>undo 스택</b>에는 과거 이미지들이, <b>redo 스택</b>에는 되돌린 “미래” 이미지들이 쌓입니다. 필터 적용 → 현재를 undo 에 넣고 결과가 새 현재. undo → 현재를 redo 로, undo 의 맨 위가 현재. redo → 그 반대. 그리고 <b>새 필터를 적용하면 redo 스택을 비웁니다</b> — 되돌린 뒤 다른 길로 갔으니 그 미래는 더 이상 이어지지 않기 때문입니다.' },
          { type: 'figure', html: FIG_HISTORY, caption: '그림 6. History — 적용 · undo · redo 가 스냅숏을 옮기는 방향. 새 필터를 적용하면 redo 스택은 비운다' },
          { type: 'h', text: '스냅숏은 반드시 clone: 제자리 처리 버그' },
          { type: 'p', html: 'Mat 을 <code>vector&lt;Mat&gt;</code> 에 <code>push_back</code> 하면 <b>헤더만 복사</b>됩니다(03차시). 그 뒤에 호출한 쪽이 <code>GaussianBlur(work, work, …)</code> 처럼 <b>제자리(in-place)</b> 처리를 하면 결과가 같은 데이터에 덮어써져 <b>보관한 기록까지 모두 바뀝니다</b>. 우리 필터는 “새 Mat 을 돌려준다” 는 약속을 지키지만, 기록 클래스는 호출한 쪽을 믿지 말고 <b>자기 데이터를 스스로 가져야</b> 합니다 — 그래서 <code>History::push</code> 는 <code>img.clone()</code> 을 보관합니다. 두 번째 함정은 화면 표시입니다: <code>const Mat&amp; cur = history.current();</code> 를 <code>Mat view = cur;</code> 로 받아 위에 글자를 그리면 기록이 바뀝니다.' },
          { type: 'figure', html: FIG_SNAP, caption: '그림 7. 얕은 복사 스냅숏은 모두 같은 데이터를 가리켜 제자리 처리에 함께 바뀐다. clone 스냅숏은 각자 데이터를 가진다' },
          { type: 'code', title: '예제 1: 기록이 모두 같아지는 버그와 해결', code: EX3_BUG,
            desc: '얕은 복사로 기록한 세 스냅숏의 평균이 <b>모두 마지막 결과(이진화)와 같습니다</b>. clone 으로 기록하면 원본(191.8) · 블러 · 이진화 값이 각각 남습니다. 마지막 부분에서는 <code>const Mat&amp;</code> 로 받은 기록을 <code>Mat view</code> 로 옮겨 사각형을 그렸더니 기록의 평균이 바뀌었습니다 — <code>const</code> 는 헤더만 지킵니다. Studio 의 <code>view()</code> 가 <code>sideBySide</code> 안에서 <code>hconcat</code>(새 Mat)을 만든 뒤에야 그리는 이유입니다.',
            expect: '얕은 복사 기록 평균: 39.4 39.4 39.4\nclone 기록 평균   : 191.8 191.8 39.4\n표시를 그린 뒤    : 191.8 191.8 49.0\n해결: 화면용 그림은 current.clone() 위에 그린다' },
          { type: 'callout', kind: 'info', title: '블러 전후 평균이 같은 이유', html: '가우시안 블러는 주변 픽셀과 <b>가중 평균</b>을 할 뿐 전체 밝기의 합은 (가장자리를 빼면) 거의 그대로입니다. 그래서 원본과 블러의 평균이 191.8 로 같습니다. 스냅숏이 서로 다른지 확인하려면 평균 대신 <code>norm(a, b, NORM_L1)</code> 처럼 <b>두 이미지의 차이</b>를 재는 편이 정확합니다.' },
          { type: 'h', text: 'History 클래스' },
          { type: 'code', title: '예제 2: History — 깊이 제한 3 으로 시험', code: EX3_HISTORY,
            desc: '스냅숏 = <code>{ Mat image; string label; }</code> 구조체입니다. undo 쪽은 <code>std::deque</code> 라서 <b>앞(가장 오래된 기록)을 <code>pop_front</code></b> 로 버릴 수 있습니다 — 깊이 제한(<code>maxDepth</code>)으로 메모리를 묶어 둡니다. 여기서는 1×1 Mat 과 깊이 3 으로 동작만 확인합니다: A~D 를 적용하면 open 과 A 는 밀려나고, undo 는 3번까지만 됩니다. 되돌린 뒤 E 를 적용하면 redo 가 0 이 됩니다. <code>const</code> 멤버 함수(<code>current() const</code>)는 기록을 바꾸지 않는 함수라는 표시이고, <code>const History&amp;</code> 로 받은 <code>show</code> 에서는 이런 함수만 부를 수 있습니다.',
            expect: 'open -> 현재 open (값 0), undo 0 / redo 0\n적용 A -> 현재 A (값 10), undo 1 / redo 0\n적용 B -> 현재 B (값 20), undo 2 / redo 0\n적용 C -> 현재 C (값 30), undo 3 / redo 0\n적용 D -> 현재 D (값 40), undo 3 / redo 0\nundo -> 현재 C (값 30), undo 2 / redo 1\nundo -> 현재 B (값 20), undo 1 / redo 2\nundo -> 현재 A (값 10), undo 0 / redo 3\nundo (불가) -> 현재 A (값 10), undo 0 / redo 3\nredo -> 현재 B (값 20), undo 1 / redo 2\n적용 E -> 현재 E (값 99), undo 2 / redo 0\nredo (불가) -> 현재 E (값 99), undo 2 / redo 0\n기록: A B E' },
          { type: 'table', head: ['방식', '메모리', 'undo 속도', '쓰는 곳'], rows: [
            ['<b>스냅숏</b> (이미지 통째로 보관) — 이 차시', '많음 (한 장 × 깊이)', '즉시', '이미지 편집기 · 작은 이미지'],
            ['<b>레시피 다시 실행</b> (원본 + 필터 목록, undo = 마지막 필터 빼고 처음부터)', '적음 (원본 1장)', '필터 수만큼 계산', '비파괴 편집(Lightroom 류) · 검사 레시피'],
            ['<b>섞기</b> (몇 단계마다 스냅숏 + 레시피)', '중간', '중간', '큰 이미지 · 긴 작업']
          ], caption: '표 4. 되돌리기 구현 방식 비교 — 완성판은 스냅숏(History)과 레시피(Pipeline)를 함께 가진다' },
          { type: 'h', text: '완성판 Image Studio 조립' },
          { type: 'p', html: '이제 부품을 조립합니다. <code>Studio</code> 클래스가 팩토리 · <code>History</code> · <code>Pipeline recipe_</code>(원본 → 현재를 만든 필터들) · 원본 이미지를 멤버로 가지고, <code>execute(line)</code> 한 함수가 모든 명령을 처리합니다. 필터를 적용하면 결과는 History 에, <b>필터 객체는 <code>std::move</code> 로 레시피에</b> 들어갑니다. undo 하면 레시피의 마지막 필터를 <code>popBack()</code> 으로 꺼내 <code>redoFilters_</code> 에 보관했다가 redo 때 되돌려 놓습니다 — unique_ptr 의 소유권이 컨테이너 사이를 오가는 모습을 볼 수 있습니다. 레시피는 <code>replay</code> 명령으로 <b>다른 이미지에 같은 처리</b>를 할 때 씁니다(검사 장비의 “레시피” 와 같은 개념).' },
          { type: 'table', head: ['명령', '동작', '예'], rows: [
            ['<code>open 경로</code>', 'imread, 기록 · 레시피 초기화', '<code>open images/washers.png</code>'],
            ['필터 명령', '팩토리로 만들어 적용 → History.push · 레시피.add', '<code>gray</code> · <code>blur 5</code> · <code>thresh otsu</code> · <code>canny 50 150</code> · <code>median 5</code> · <code>sharpen 1.5</code> · <code>bc 1.2 10</code> · <code>morph open 5</code> · <code>invert</code>'],
            ['<code>undo</code> · <code>redo</code> · <code>reset</code>', '되돌리기 · 다시 실행 · 원본으로', ''],
            ['<code>info</code> · <code>history</code> · <code>help</code>', '상태 · 기록 목록 · 명령 목록', ''],
            ['<code>show</code>', '원본 | 현재 비교 화면 (imshow)', ''],
            ['<code>save [파일]</code>', 'imwrite (기본 result.png)', '<code>save out.png</code>'],
            ['<code>replay 입력 [출력]</code>', '레시피를 다른 이미지에 적용해 저장', '<code>replay images/x.png y.png</code>'],
            ['<code>quit</code>', '끝내기', '']
          ], caption: '표 5. Image Studio 명령 — 브라우저에서는 편집기 아래 입력 칸(stdin)에 한 줄에 하나씩' },
          { type: 'code', title: '예제 3: 완성판 Image Studio (5개 파일 · vs/Ch16_ImageStudio 와 같은 처리 코드)', code: EX3_STUDIO, stdin: EX3_STUDIO_STDIN,
            desc: '예시 입력은 컬러 트레이 이미지를 열어 Gray → Blur(5) → Otsu 를 적용하고, 기록을 본 뒤 두 번 되돌리고 다시 실행하고, Canny 를 적용해 redo 가 사라지는 것을 확인한 다음, 틀린 명령 두 개(<code>sepia</code>, <code>blur abc</code>)에도 계속 동작하는지 봅니다. 마지막에 <code>save</code> 로 결과를 📁 작업 폴더에 저장하고, <code>replay</code> 로 <b>같은 레시피를 다른 이미지</b>(nuts_bolts_color)에 적용해 저장합니다. <code>show</code> 가 띄운 비교 화면에서 BEFORE/AFTER 띠와 아래 상태 줄(undo · redo · 레시피)을 확인하세요. 입력 칸의 명령을 바꿔 자유롭게 실험해 보세요.',
            expect: 'Image Studio - 명령을 한 줄씩 입력 (help)\n> open images/sample_color.png\n  열기: images/sample_color.png (640x480)\n> gray\n  적용: Gray -> CV_8UC1, 평균 119.2\n> blur 5\n  적용: Blur(5) -> CV_8UC1, 평균 119.2\n> thresh otsu\n  적용: Thresh(otsu) -> CV_8UC1, 평균 182.0\n> history\n  0: open\n  1: Gray\n  2: Blur(5)\n  3: Thresh(otsu)  <- 현재\n> undo\n  되돌리기 -> Blur(5)\n> undo\n  되돌리기 -> Gray\n> redo\n  다시 실행 -> Blur(5)\n> canny 50 150\n  적용: Canny(50,150) -> CV_8UC1, 평균 3.5\n> redo\n  다시 실행할 것이 없습니다\n> info\n  파일: images/sample_color.png, 원본 640x480 CV_8UC3\n  현재: Canny(50,150) (CV_8UC1, 평균 3.5)\n  레시피: Gray -> Blur(5) -> Canny(50,150)\n  undo 3 / redo 0\n> sepia\n  알 수 없는 명령: sepia (help 로 목록 보기)\n> blur abc\n  오류: blur: 숫자가 필요합니다\n> save result.png\n  저장: result.png\n> replay images/nuts_bolts_color.png replay.png\n  images/nuts_bolts_color.png -> [Gray -> Blur(5) -> Canny(50,150)] -> replay.png (평균 4.4)\n> show\n> quit' },
          { type: 'callout', kind: 'tip', title: '코드 읽기 순서', html: '<ol><li><code>main</code>: 한 줄 읽기 → <code>execute</code> → 예외는 여기서 한 번에 catch</li><li><code>Studio::execute</code>: 첫 단어로 분기 — 기본 명령(open · undo …)이 아니면 팩토리에서 찾는다</li><li><code>applyFilter</code>: <code>apply</code> → <code>history_.push</code> → <code>recipe_.add(std::move(f))</code> — move 뒤에는 f 를 쓰면 안 되므로 이름은 <code>history_.label()</code> 에서 읽는다</li><li><code>undo</code>: History 가 성공했을 때만 레시피에서 <code>popBack</code> (두 기록이 어긋나지 않게)</li></ol>' },
          { type: 'callout', kind: 'warn', title: 'move 한 뒤의 객체는 쓰지 않는다', html: '<code>recipe_.add(std::move(f));</code> 다음 줄에서 <code>f-&gt;name()</code> 을 부르면 f 가 <b>nullptr</b> 이라 프로그램이 죽습니다(Visual Studio: “읽기 액세스 위반”). 필요한 값은 move <b>전에</b> 꺼내 두세요. 컴파일러가 잡아 주지 않는 실수라 코드 리뷰 때 꼭 확인할 부분입니다.' },
          { type: 'h', text: 'Visual Studio 판: 키보드 단축키와 트랙바' },
          { type: 'p', html: 'VS 판(<code>vs/Ch16_ImageStudio</code>)은 같은 <code>Filter.h</code> · <code>Filters.cpp</code> · <code>Pipeline.h</code> · <code>History.h</code> 와 같은 <code>Studio</code> 클래스를 쓰고, 입력 장치만 다릅니다. <code>imshow</code> 로 비교 화면을 그리고 <code>waitKey(50)</code> 로 키를 받아 <b>명령 문자열로 바꾼 뒤 <code>execute()</code></b> 를 부릅니다. 커널 크기와 임계값은 트랙바에서 읽습니다. 처리 로직이 한 곳에 있으므로 브라우저에서 stdin 으로 시험한 것이 창 프로그램에서도 똑같이 동작합니다.' },
          { type: 'figure', html: FIG_LOOP, caption: '그림 8. 키보드 이벤트 루프 — 키는 명령 문자열을 만드는 또 하나의 입력 장치일 뿐, 처리는 execute() 한 곳' },
          { type: 'code', title: 'VS 판 키보드 루프 (main.cpp 중에서)', code: EX3_KEYLOOP, run: false, local: true, file: 'main.cpp',
            desc: '<code>waitKey(50)</code> 은 50ms 동안 키를 기다리고, 없으면 −1 을 돌려줍니다. 이때 <code>getWindowProperty(WIN, WND_PROP_VISIBLE)</code> 로 사용자가 창의 X 를 눌러 닫았는지 확인합니다(<code>waitKey(0)</code> 만 쓰면 창을 닫은 뒤 프로그램이 멈춘 채 남습니다). <code>key &amp;= 0xFF</code> 는 플랫폼에 따라 붙는 상위 비트를 지웁니다. <code>c</code> 키는 콘솔에서 명령을 직접 입력받아 — 트랙바로 표현하기 어려운 <code>replay</code> 같은 명령도 쓸 수 있게 합니다.' },
          { type: 'table', head: ['키', '명령', '키', '명령'], rows: [
            ['<b>1</b>', 'gray', '<b>z</b>', 'undo'],
            ['<b>2</b>', 'blur (트랙바 kernel)', '<b>y</b>', 'redo'],
            ['<b>3</b>', 'median (트랙바 kernel)', '<b>r</b>', 'reset (원본으로)'],
            ['<b>4</b>', 'thresh (트랙바 thresh, 0 = Otsu)', '<b>i</b>', 'info'],
            ['<b>5</b>', 'canny 50 150', '<b>s</b>', 'save studio_001.png …'],
            ['<b>6</b>', 'sharpen 1.0', '<b>o</b>', '다음 이미지 열기'],
            ['<b>7</b>', 'bc 1.2 10', '<b>c</b>', '콘솔에서 명령 입력'],
            ['<b>8</b>', 'morph open (트랙바 kernel)', '<b>ESC</b>', '끝내기'],
            ['<b>9</b>', 'invert', '', '']
          ], caption: '표 6. VS 판 단축키 (vs/Ch16_ImageStudio/README.md 와 같음)' },
          { type: 'code', title: '(선택) 트랙바로 즉시 미리보기 — 확정은 키로', code: EX3_TRACKBAR_LIVE, run: false, local: true, file: 'main.cpp',
            desc: '트랙바 콜백은 <code>void 함수(int pos, void* userdata)</code> 모양이라 멤버 함수를 바로 넘길 수 없습니다. 필요한 객체를 담은 구조체의 주소를 <code>userdata</code> 로 넘기고 콜백 안에서 <code>static_cast</code> 로 되돌립니다. 미리보기는 History 에 넣지 않고, 사용자가 키를 눌렀을 때만 <code>execute</code> 로 “확정” 합니다 — C# 판 스튜디오의 [미리보기] / [적용] 구분과 같습니다. (Studio 에 <code>currentImage()</code> 접근자를 추가해야 합니다.)' },
          { type: 'project', title: '🧰 완성 프로젝트: vs/Ch16_ImageStudio', project: 'Ch16_ImageStudio', html: '<ul><li><code>Filter.h</code> · <code>Filters.cpp</code>: 필터 9종 + 팩토리 (예제 3 과 같음)</li><li><code>Pipeline.h</code> · <code>History.h</code>: 레시피 · 되돌리기 기록 (헤더 전용)</li><li><code>main.cpp</code>: <code>Studio</code> 클래스(명령 해석기) + 키보드 · 트랙바 UI. 실행 인수로 이미지 경로를 줄 수 있음</li><li>솔루션 폴더(<code>vs/</code>)에 <code>images</code> 폴더를 복사한 뒤 <b>시작 프로젝트로 설정 → F5</b>. 저장한 파일은 솔루션 폴더에 생깁니다.</li></ul>' },
          { type: 'callout', kind: 'field', title: '🏭 현장 노트: 검사 레시피', html: '실제 검사 장비 소프트웨어도 이 구조와 비슷합니다. 엔지니어가 화면에서 전처리 · 이진화 · 측정 단계를 골라 파라미터를 맞추면, 그 단계 목록이 <b>레시피(recipe) 파일</b>(텍스트 · JSON · XML)로 저장되고, 생산 중에는 레시피를 읽어 같은 파이프라인을 매 이미지에 실행합니다. 이 차시의 명령 문자열(<code>blur 5</code>)을 한 줄씩 파일에 쓰면 그대로 레시피 파일이 되고, 팩토리가 그것을 다시 필터 객체로 만듭니다. 17차시 검사 프로젝트에서 이 설계를 이어 씁니다.' },
          { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 · 평가', html: '<ul><li>교사 PC 에 <code>vs/Ch16_ImageStudio</code> 를 미리 빌드하고 <code>vs/images</code> 를 복사해 둡니다. 1교시 도입과 3교시 VS 판 설명 때 키보드로 필터 → z → y → s 를 시연합니다.</li><li>3교시 예제 1(clone 버그)은 실행 전에 "세 기록의 평균이 어떻게 나올까?" 를 먼저 예측시키면 효과가 큽니다.</li><li>평가 루브릭(과제: 새 필터 + 명령 추가, 10점): ① Filter 를 상속하고 override · const 가 맞음 (2점) ② 필터 약속(입력 보존 · 새 Mat · 1/3채널) 지킴 (2점) ③ 팩토리 등록과 인수 기본값 · 오류 처리 (2점) ④ undo/redo 후에도 레시피와 이미지가 일치 (2점) ⑤ .h/.cpp 에 알맞게 나눔 (2점).</li><li>💬 발문: "Photoshop 의 되돌리기 횟수 설정은 왜 있을까?" — 스냅숏 메모리.</li></ul>' }
        ],
        practice: [
          {
            title: 'History 의 undo · redo 완성하기', level: 2,
            desc: '<code>History</code> 에서 <code>push</code> 만 구현되어 있습니다. <code>undo()</code> · <code>redo()</code> 를 완성하세요. 되돌릴 것이 없으면 <code>false</code> 를 돌려주고 아무것도 바꾸지 않습니다. 시험 순서: A, B, C 적용 → undo 2번 → redo → D 적용 → redo(불가) → undo 3번.',
            hint: 'undo: <code>redo_.push_back(current_); current_ = undo_.back(); undo_.pop_back();</code> — redo 는 방향만 반대. 스택이 비었는지 먼저 확인!',
            expect: '적용 A: 현재 A, undo 1, redo 0\n적용 B: 현재 B, undo 2, redo 0\n적용 C: 현재 C, undo 3, redo 0\nundo: 현재 B, undo 2, redo 1\nundo: 현재 A, undo 1, redo 2\nredo: 현재 B, undo 2, redo 1\n적용 D: 현재 D, undo 3, redo 0\nredo 불가: 현재 D, undo 3, redo 0\nundo: 현재 B, undo 2, redo 1\nundo: 현재 A, undo 1, redo 2\nundo: 현재 open, undo 0, redo 3',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
using namespace cv;
using namespace std;

class History
{
public:
    void reset(const Mat& img, const string& label) { undo_.clear(); redo_.clear(); current_ = { img.clone(), label }; }
    void push(const Mat& img, const string& label)
    {
        undo_.push_back(current_);
        current_ = { img.clone(), label };
        redo_.clear();
    }
    bool undo()
    {
        // TODO
        return false;
    }
    bool redo()
    {
        // TODO
        return false;
    }
    const string& label() const { return current_.label; }
    size_t undoCount() const { return undo_.size(); }
    size_t redoCount() const { return redo_.size(); }
private:
    struct Snapshot { Mat image; string label; };
    vector<Snapshot> undo_, redo_;
    Snapshot current_;
};

void show(const string& action, const History& h)
{
    cout << action << ": 현재 " << h.label() << ", undo " << h.undoCount() << ", redo " << h.redoCount() << endl;
}

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    History h;
    h.reset(img, "open");
    for (string n : { "A", "B", "C" }) { h.push(img, n); show("적용 " + n, h); }
    h.undo(); show("undo", h);
    h.undo(); show("undo", h);
    h.redo(); show("redo", h);
    h.push(img, "D"); show("적용 D", h);
    show(h.redo() ? "redo" : "redo 불가", h);
    for (int i = 0; i < 3; i++) { h.undo(); show("undo", h); }
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
using namespace cv;
using namespace std;

class History
{
public:
    void reset(const Mat& img, const string& label) { undo_.clear(); redo_.clear(); current_ = { img.clone(), label }; }
    void push(const Mat& img, const string& label)
    {
        undo_.push_back(current_);
        current_ = { img.clone(), label };
        redo_.clear();
    }
    bool undo()
    {
        if (undo_.empty()) return false;
        redo_.push_back(current_);
        current_ = undo_.back();
        undo_.pop_back();
        return true;
    }
    bool redo()
    {
        if (redo_.empty()) return false;
        undo_.push_back(current_);
        current_ = redo_.back();
        redo_.pop_back();
        return true;
    }
    const string& label() const { return current_.label; }
    size_t undoCount() const { return undo_.size(); }
    size_t redoCount() const { return redo_.size(); }
private:
    struct Snapshot { Mat image; string label; };
    vector<Snapshot> undo_, redo_;
    Snapshot current_;
};

void show(const string& action, const History& h)
{
    cout << action << ": 현재 " << h.label() << ", undo " << h.undoCount() << ", redo " << h.redoCount() << endl;
}

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    History h;
    h.reset(img, "open");
    for (string n : { "A", "B", "C" }) { h.push(img, n); show("적용 " + n, h); }
    h.undo(); show("undo", h);
    h.undo(); show("undo", h);
    h.redo(); show("redo", h);
    h.push(img, "D"); show("적용 D", h);
    show(h.redo() ? "redo" : "redo 불가", h);
    for (int i = 0; i < 3; i++) { h.undo(); show("undo", h); }
    return 0;
}`
          },
          {
            title: '레시피로 여러 이미지 일괄 처리 (batch)', level: 3,
            desc: '검사 현장에서는 한 번 맞춘 처리 순서(레시피)를 <b>여러 이미지에 똑같이</b> 적용합니다. 레시피 문자열 3줄(<code>gray</code> · <code>median 5</code> · <code>thresh otsu</code>)을 팩토리로 <code>Pipeline</code> 에 넣고, 이미지 3장(<code>washers</code> · <code>salt_pepper</code> · <code>coins_parts</code>)에 차례로 적용해 <code>batch_0.png</code> ~ <code>batch_2.png</code> 로 저장하세요. 각 이미지마다 파일 이름 · 흰 픽셀 비율(%)을 출력하고, 마지막에 레시피를 <code>describe()</code> 로 출력합니다.',
            hint: '<code>for (const string&amp; line : recipeLines) { istringstream in(line); string cmd; in &gt;&gt; cmd; pipe.add(factory.at(cmd)(in)); }</code> · 비율: <code>100.0 * countNonZero(out) / out.total()</code> · 저장 이름: <code>format("batch_%d.png", i)</code>.',
            expect: '레시피: Gray -> Median(5) -> Thresh(otsu)\nimages/washers.png -> batch_0.png, 흰 픽셀 84.9%\nimages/salt_pepper.png -> batch_1.png, 흰 픽셀 25.9%\nimages/coins_parts.png -> batch_2.png, 흰 픽셀 8.5%',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <functional>
#include <map>
#include <memory>
#include <sstream>
#include <vector>
using namespace cv;
using namespace std;

class Filter
{
public:
    virtual ~Filter() = default;
    virtual Mat apply(const Mat& src) const = 0;
    virtual string name() const = 0;
};
struct GrayFilter : Filter
{
    Mat apply(const Mat& s) const override { if (s.channels() == 1) return s.clone(); Mat d; cvtColor(s, d, COLOR_BGR2GRAY); return d; }
    string name() const override { return "Gray"; }
};
struct MedianFilter : Filter
{
    int k;
    explicit MedianFilter(int k) : k(k % 2 ? k : k + 1) {}
    Mat apply(const Mat& s) const override { Mat d; medianBlur(s, d, k); return d; }
    string name() const override { return "Median(" + to_string(k) + ")"; }
};
struct OtsuFilter : Filter
{
    Mat apply(const Mat& s) const override { Mat d; threshold(s, d, 0, 255, THRESH_BINARY | THRESH_OTSU); return d; }
    string name() const override { return "Thresh(otsu)"; }
};

class Pipeline
{
public:
    void add(unique_ptr<Filter> f) { filters_.push_back(move(f)); }
    Mat run(const Mat& src) const { Mat cur = src.clone(); for (const auto& f : filters_) cur = f->apply(cur); return cur; }
    string describe() const { string s; for (size_t i = 0; i < filters_.size(); i++) s += (i ? " -> " : "") + filters_[i]->name(); return s; }
private:
    vector<unique_ptr<Filter>> filters_;
};

using FilterMaker = function<unique_ptr<Filter>(istringstream&)>;

int main()
{
    map<string, FilterMaker> factory;
    factory["gray"] = [](istringstream&) { return make_unique<GrayFilter>(); };
    factory["median"] = [](istringstream& in) { int k; if (!(in >> k)) k = 5; return make_unique<MedianFilter>(k); };
    factory["thresh"] = [](istringstream&) { return make_unique<OtsuFilter>(); };

    vector<string> recipeLines = { "gray", "median 5", "thresh otsu" };
    vector<string> images = { "images/washers.png", "images/salt_pepper.png", "images/coins_parts.png" };
    Pipeline pipe;
    // TODO: recipeLines 를 팩토리로 pipe 에 추가
    cout << "레시피: " << pipe.describe() << endl;
    // TODO: 각 이미지에 pipe.run → imwrite("batch_i.png") → 흰 픽셀 비율 출력
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <functional>
#include <map>
#include <memory>
#include <sstream>
#include <vector>
using namespace cv;
using namespace std;

class Filter
{
public:
    virtual ~Filter() = default;
    virtual Mat apply(const Mat& src) const = 0;
    virtual string name() const = 0;
};
struct GrayFilter : Filter
{
    Mat apply(const Mat& s) const override { if (s.channels() == 1) return s.clone(); Mat d; cvtColor(s, d, COLOR_BGR2GRAY); return d; }
    string name() const override { return "Gray"; }
};
struct MedianFilter : Filter
{
    int k;
    explicit MedianFilter(int k) : k(k % 2 ? k : k + 1) {}
    Mat apply(const Mat& s) const override { Mat d; medianBlur(s, d, k); return d; }
    string name() const override { return "Median(" + to_string(k) + ")"; }
};
struct OtsuFilter : Filter
{
    Mat apply(const Mat& s) const override { Mat d; threshold(s, d, 0, 255, THRESH_BINARY | THRESH_OTSU); return d; }
    string name() const override { return "Thresh(otsu)"; }
};

class Pipeline
{
public:
    void add(unique_ptr<Filter> f) { filters_.push_back(move(f)); }
    Mat run(const Mat& src) const { Mat cur = src.clone(); for (const auto& f : filters_) cur = f->apply(cur); return cur; }
    string describe() const { string s; for (size_t i = 0; i < filters_.size(); i++) s += (i ? " -> " : "") + filters_[i]->name(); return s; }
private:
    vector<unique_ptr<Filter>> filters_;
};

using FilterMaker = function<unique_ptr<Filter>(istringstream&)>;

int main()
{
    map<string, FilterMaker> factory;
    factory["gray"] = [](istringstream&) { return make_unique<GrayFilter>(); };
    factory["median"] = [](istringstream& in) { int k; if (!(in >> k)) k = 5; return make_unique<MedianFilter>(k); };
    factory["thresh"] = [](istringstream&) { return make_unique<OtsuFilter>(); };

    vector<string> recipeLines = { "gray", "median 5", "thresh otsu" };
    vector<string> images = { "images/washers.png", "images/salt_pepper.png", "images/coins_parts.png" };
    Pipeline pipe;
    for (const string& line : recipeLines)
    {
        istringstream in(line);
        string cmd;
        in >> cmd;
        pipe.add(factory.at(cmd)(in));             // at: 없으면 out_of_range 예외
    }
    cout << "레시피: " << pipe.describe() << endl;
    for (size_t i = 0; i < images.size(); i++)
    {
        Mat img = imread(images[i]);
        if (img.empty()) { cout << images[i] << " 읽기 실패" << endl; continue; }
        Mat out = pipe.run(img);
        string name = format("batch_%d.png", (int)i);
        imwrite(name, out);
        cout << images[i] << " -> " << name << format(", 흰 픽셀 %.1f%%", 100.0 * countNonZero(out) / out.total()) << endl;
        imshow(name, out);
    }
    waitKey(0);
    return 0;
}`
          }
        ],
        quiz: QUIZ3,
        slides: [
          { layout: 'title', title: 'History · 저장 · Image Studio 완성', subtitle: '3교시 — 되돌리기 스택 · clone · 조립 · Visual Studio 키보드 판', notes: '<p>💬 "Ctrl+Z 는 어떻게 만들까?" — 예상 답: 이전 상태를 저장해 둔다. 맞습니다, 오늘은 그 "저장해 둔다" 에 숨은 C++ 함정(얕은 복사)을 먼저 겪어 보고 History 를 만든 뒤, 지금까지의 부품을 조립합니다. (3분)</p>' },
          { layout: 'diagram', title: '되돌리기 = 스택 두 개', html: FIG_HISTORY, caption: '적용: current → undo · undo: current → redo · 새 적용 시 redo 비우기', notes: '<p>칠판에 스택 두 개를 그리고 A → B → C 적용, undo 2번, D 적용을 학생과 함께 손으로 따라가 봅니다. 💬 "D 를 적용한 뒤 redo 하면 C 가 나와야 할까?" — 아니오, 다른 길로 갔으니 미래가 사라진다. (5분)</p>' },
          { layout: 'code', title: '예제 1: 기록이 모두 같아지는 버그', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat work = imread("images/washers.png", IMREAD_GRAYSCALE);
    vector<Mat> bad, good;
    bad.push_back(work);                  good.push_back(work.clone());
    GaussianBlur(work, work, Size(9, 9), 0);          // 제자리 처리
    bad.push_back(work);                  good.push_back(work.clone());
    threshold(work, work, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    bad.push_back(work);                  good.push_back(work.clone());

    for (const Mat& s : bad)  cout << format("%.1f ", mean(s)[0]);
    cout << " <- 얕은 복사" << endl;
    for (const Mat& s : good) cout << format("%.1f ", mean(s)[0]);
    cout << " <- clone" << endl;
    return 0;
}`, points: ['<code>push_back(work)</code> = 헤더만 복사 → 데이터 공유', '제자리 처리 한 번에 <b>모든 기록</b>이 바뀐다', 'History 는 <b>clone</b> 으로 자기 데이터를 가진다', '화면용 그림도 <b>clone 위에</b> 그리기'], notes: '<p>실행 전에 결과를 예측시키세요. 대부분 "191.8, 191.8, 39.4" 라고 답합니다. 실제로는 39.4 세 개 — 03차시의 헤더/데이터 그림을 다시 띄워 설명합니다. (6분)</p>' },
          { layout: 'diagram', title: '스냅숏은 clone 으로', html: FIG_SNAP, caption: '얕은 복사 = 데이터 1개를 공유 · clone = 스냅숏마다 자기 데이터', notes: '<p>메모리 계산을 함께: 640×480×3 = 0.9 MB, 깊이 20 → 18 MB. 1920×1080 이면? — 6 MB × 20 = 120 MB. 그래서 깊이 제한(deque 의 pop_front). (3분)</p>' },
          { layout: 'code', title: 'History 클래스 (핵심)', code: `#include <opencv2/opencv.hpp>
#include <deque>
class History
{
public:
    void push(const cv::Mat& img, const std::string& label)
    {
        undo_.push_back(current_);
        if (undo_.size() > maxDepth_) undo_.pop_front();    // 깊이 제한
        current_ = { img.clone(), label };                  // 자기 데이터
        redo_.clear();                                       // 미래는 사라진다
    }
    bool undo()
    {
        if (undo_.empty()) return false;
        redo_.push_back(current_); current_ = undo_.back(); undo_.pop_back();
        return true;
    }                                                        // redo() 는 방향만 반대
private:
    struct Snapshot { cv::Mat image; std::string label; };
    std::deque<Snapshot> undo_, redo_;
    Snapshot current_;
    size_t maxDepth_ = 20;
};`, run: false, points: ['스냅숏 = <code>{ Mat, 이름 }</code> 구조체', 'undo 쪽은 <b>deque</b> → 오래된 것 <code>pop_front</code>', '스택 안에서 옮길 때는 복사해도 OK (이미 독립 데이터)', '실패하면 false, 아무것도 바꾸지 않기'], notes: '<p>💬 "undo 할 때는 왜 clone 을 안 할까?" — 스택 사이에서 옮기는 스냅숏은 이미 History 만 가진 데이터라 헤더 복사로 충분(참조 계수만 바뀜). 본문 예제 2 로 깊이 제한 동작을 확인합니다. (5분)</p>' },
          { layout: 'bullets', title: '조립: Studio 클래스', bullets: [
            '멤버: 팩토리 · <code>History</code> · <code>Pipeline recipe_</code> · 원본 · <code>redoFilters_</code>',
            '<code>execute(line)</code> 한 곳에서 모든 명령 처리 → <code>false</code> 면 끝',
            '필터 적용: <code>apply</code> → <code>history_.push</code> → <code>recipe_.add(std::move(f))</code>',
            'undo 성공 시 <code>recipe_.popBack()</code> → <code>redoFilters_</code> (소유권 왕복)',
            '<code>save</code> = imwrite · <code>show</code> = sideBySide + imshow · <code>replay</code> = 레시피 재사용',
            '예외는 main 의 try/catch 한 곳에서'
          ], notes: '<p>그림 1(구조)을 다시 띄우고 각 상자가 어떤 멤버가 되었는지 짝지어 봅니다. move 뒤에 f 를 쓰면 안 되는 이유를 강조하세요. (4분)</p>' },
          { layout: 'code', title: '예제 3: 완성판 실행 (stdin 명령)', code: `open images/sample_color.png
gray
blur 5
thresh otsu
history
undo
undo
redo
canny 50 150
redo
info
sepia
blur abc
save result.png
replay images/nuts_bolts_color.png replay.png
show
quit`, lang: 'txt', points: ['본문 예제 3 의 예시 입력(stdin)', 'canny 적용 → redo 스택이 비워진다', '틀린 명령 · 인수에도 계속 동작', 'save · replay → 📁 작업 폴더에 PNG'], notes: '<p>본문 예제 3(5개 파일)을 실행하고 출력과 이 명령을 한 줄씩 대응시켜 읽습니다. 그 다음 학생들이 입력 칸을 고쳐 자기만의 순서(예: <code>open images/washers.png</code> → <code>median 5</code> → <code>thresh otsu</code> → <code>morph open 5</code>)로 실행해 보게 합니다. (8분)</p>' },
          { layout: 'diagram', title: 'Visual Studio 판: 키 → 명령 문자열', html: FIG_LOOP, caption: 'imshow → waitKey → 키를 명령으로 → execute() → 다시 그리기', notes: '<p>미리 빌드한 VS 판을 시연합니다: 1(gray) → 트랙바 kernel 9 → 2(blur) → 4(otsu) → z · y → s(저장) → o(다음 이미지). 💬 "브라우저판과 무엇이 같고 무엇이 다른가?" — 처리(execute)는 같고 입력 장치만 다르다. (5분)</p>' },
          { layout: 'code', title: 'VS 판 키보드 루프 (요약)', code: `while (true)
{
    imshow(WIN, studio.view());
    int key = waitKey(50);
    if (key < 0)
    {
        if (getWindowProperty(WIN, WND_PROP_VISIBLE) < 1) break;   // 창 닫힘
        continue;
    }
    key &= 0xFF;
    if (key == 27) break;                                          // ESC
    string cmd;
    switch (key)
    {
    case '1': cmd = "gray"; break;
    case '2': cmd = "blur " + to_string(getTrackbarPos("kernel", WIN)); break;
    case 'z': cmd = "undo"; break;
    case 'y': cmd = "redo"; break;
    case 's': cmd = format("save studio_%03d.png", saveNo++); break;
    default: continue;
    }
    try { if (!studio.execute(cmd)) break; }
    catch (const exception& e) { cout << "오류: " << e.what() << endl; }
}`, run: false, local: true, file: 'main.cpp', points: ['<code>waitKey(50)</code>: 키가 없으면 −1', '<code>getWindowProperty</code> 로 창 닫힘 확인', '트랙바 값은 키를 누를 때 읽기', '처리는 콘솔판과 같은 <code>execute</code>'], notes: '<p>트랙바를 콜백 없이 <code>getTrackbarPos</code> 로 필요할 때 읽는 방법이 가장 단순합니다. 즉시 미리보기(콜백)는 본문의 선택 예제를 참고. 브라우저에서는 트랙바 · 키 입력이 없으므로 이 코드는 VS 에서만 실행합니다. (4분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: 'A → B → C 적용 후 undo 2번, 그리고 D 적용. 이제 redo 를 누르면?', options: ['B 가 다시 적용된다', 'C 가 다시 적용된다', '아무 일도 없다 (redo 스택을 비웠다)', 'D 가 취소된다'], answer: 2, explain: '새 작업을 하면 되돌렸던 미래는 버린다 — redo 스택 clear.', notes: '<p>정답 3번. 워드 · 그림판에서 직접 해 보게 해도 좋습니다. (2분)</p>' },
          { layout: 'practice', title: '실습: undo · redo 완성', desc: '<p><code>History</code> 의 <code>undo()</code> · <code>redo()</code> 를 완성하세요.</p><ul><li>비었으면 <code>false</code>, 아무것도 바꾸지 않기</li><li>A, B, C → undo 2 → redo → D → redo(불가) → undo 3</li><li>마지막 현재 = open, undo 0, redo 3</li></ul>', starter: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

struct History
{
    vector<string> undo_, redo_;
    string current = "open";
    void push(const string& s) { undo_.push_back(current); current = s; redo_.clear(); }
    bool undo() { /* TODO */ return false; }
    bool redo() { /* TODO */ return false; }
};

int main()
{
    History h;
    for (string s : { "A", "B", "C" }) h.push(s);
    h.undo(); h.undo(); h.redo(); h.push("D");
    cout << "redo " << (h.redo() ? "됨" : "불가") << endl;
    h.undo(); h.undo(); h.undo();
    cout << h.current << ", undo " << h.undo_.size() << ", redo " << h.redo_.size() << endl;
    return 0;
}`, solution: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

struct History
{
    vector<string> undo_, redo_;
    string current = "open";
    void push(const string& s) { undo_.push_back(current); current = s; redo_.clear(); }
    bool undo()
    {
        if (undo_.empty()) return false;
        redo_.push_back(current); current = undo_.back(); undo_.pop_back();
        return true;
    }
    bool redo()
    {
        if (redo_.empty()) return false;
        undo_.push_back(current); current = redo_.back(); redo_.pop_back();
        return true;
    }
};

int main()
{
    History h;
    for (string s : { "A", "B", "C" }) h.push(s);
    h.undo(); h.undo(); h.redo(); h.push("D");
    cout << "redo " << (h.redo() ? "됨" : "불가") << endl;
    h.undo(); h.undo(); h.undo();
    cout << h.current << ", undo " << h.undo_.size() << ", redo " << h.redo_.size() << endl;
    return 0;
}`, notes: '<p>슬라이드 실습은 Mat 대신 문자열로 원리만 확인하는 축약판입니다. 본문 실습 1 은 Mat 스냅숏 버전. 빨리 끝난 학생은 실습 2(레시피 일괄 처리) — 17차시 검사 프로젝트의 예고편입니다. (7분)</p>' },
          { layout: 'summary', title: '정리 — 16차시 전체', bullets: ['<b>Filter</b> 추상 클래스 + 가상 함수 → 필터를 같은 모양으로 (다형성)', '<b>unique_ptr</b> 로 소유권 표현 · <code>move</code> 로 Pipeline ↔ redo 목록 이동', '<b>.h / .cpp</b> 분리 · <b>팩토리</b>(map + 람다) · <b>istringstream</b> 명령 해석 · 예외', '<b>History</b>: undo/redo 스택 · 새 작업 시 redo 비우기 · 스냅숏은 <b>clone</b> · 깊이 제한', '<code>hconcat</code> + <code>putText</code> 전후 비교 · <code>imwrite</code> 저장 · 레시피 <code>replay</code>', '다음 차시: 실전 검사 프로젝트 — 개수 세기 · 색 분류 · 결함 검사'], notes: '<p>세 교시를 되짚고 VS 프로젝트 <code>Ch16_ImageStudio</code> 를 과제로 안내합니다: "새 필터 하나(예: Sepia · Emboss · CLAHE)를 추가하고 키 0 에 연결하기". 루브릭은 본문 교사용 상자 참고. (3분)</p>' }
        ]
      }
    ]
  });
})();
