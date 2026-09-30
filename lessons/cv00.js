/* 00차시 시작하기: 강좌 안내와 실습 환경 */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 강좌 구성 — 내 C++ 프로그램 / OpenCV 라이브러리 / 이 사이트의 실행 환경
  const FIG_STACK = `<svg viewBox="0 0 760 300" role="img" aria-label="C++ 프로그램이 OpenCV 라이브러리를 호출하는 구조와, 같은 코드를 브라우저에서 실행하는 구조">
  ${ARROW('c00a1')}
  <rect x="20" y="30" width="330" height="240" rx="14" class="card-bg"/>
  <text x="185" y="58" text-anchor="middle" class="tx-b">🖥 Visual Studio (로컬 PC)</text>
  <rect x="40" y="76" width="290" height="56" rx="10" class="p1s"/><text x="185" y="100" text-anchor="middle" class="tx">main.cpp — 내 C++ 코드</text><text x="185" y="120" text-anchor="middle" class="tx-m">#include &lt;opencv2/opencv.hpp&gt;</text>
  <rect x="40" y="150" width="290" height="50" rx="10" class="p2s"/><text x="185" y="172" text-anchor="middle" class="tx-b">OpenCV 5.0 헤더 + 라이브러리</text><text x="185" y="190" text-anchor="middle" class="tx-m">opencv_world500.lib (링크) · .dll (실행)</text>
  <rect x="40" y="212" width="290" height="44" rx="10" class="p3s"/><text x="185" y="240" text-anchor="middle" class="tx">MSVC 컴파일러 → main.exe (실제 창 · 웹캠)</text>
  <rect x="410" y="30" width="330" height="240" rx="14" class="card-bg"/>
  <text x="575" y="58" text-anchor="middle" class="tx-b">🌐 이 강좌 사이트 (브라우저)</text>
  <rect x="430" y="76" width="290" height="56" rx="10" class="p1s"/><text x="575" y="100" text-anchor="middle" class="tx">같은 main.cpp</text><text x="575" y="120" text-anchor="middle" class="tx-m">코드 편집기 + 결과 창 (cout · imshow)</text>
  <rect x="430" y="150" width="290" height="50" rx="10" class="p2s"/><text x="575" y="172" text-anchor="middle" class="tx-b">Clang C++ 컴파일러 (WebAssembly)</text><text x="575" y="190" text-anchor="middle" class="tx-m">cv::Mat · Point · Rect … 진짜 C++ 클래스</text>
  <rect x="430" y="212" width="290" height="44" rx="10" class="p3s"/><text x="575" y="240" text-anchor="middle" class="tx">OpenCV.js 5.0 (알고리즘 계산)</text>
  <line x1="352" y1="175" x2="406" y2="175" class="ln" stroke-width="2" marker-end="url(#c00a1)"/>
  <line x1="406" y1="185" x2="352" y2="185" class="ln" stroke-width="2" marker-end="url(#c00a1)"/>
  <text x="380" y="165" text-anchor="middle" class="tx-m">같은 코드</text>
  <text x="380" y="290" text-anchor="middle" class="tx-m">브라우저에서 익힌 C++ 코드를 그대로 Visual Studio 프로젝트의 main.cpp 에 붙여 넣습니다</text>
</svg>`;

  // 그림 2: 화면 구성
  const FIG_UI = `<svg viewBox="0 0 760 260" role="img" aria-label="강좌 화면 구성: 왼쪽 목차, 가운데 문서와 편집기, 오른쪽 결과 창">
  <rect x="10" y="10" width="740" height="240" rx="12" class="card-bg"/>
  <rect x="20" y="20" width="150" height="220" rx="8" class="p1s"/><text x="95" y="48" text-anchor="middle" class="tx-b">목차</text>
  <text x="95" y="76" text-anchor="middle" class="tx-m">Part → 차시 → 교시</text><text x="95" y="100" text-anchor="middle" class="tx-m">🎓 학생용 / 🧑‍🏫 교사용</text><text x="95" y="124" text-anchor="middle" class="tx-m">진도 · 검색</text><text x="95" y="148" text-anchor="middle" class="tx-m">📁 작업 폴더</text>
  <rect x="180" y="20" width="330" height="130" rx="8" class="p2s"/><text x="345" y="48" text-anchor="middle" class="tx-b">강좌 내용 (문서 / 슬라이드)</text>
  <text x="345" y="76" text-anchor="middle" class="tx-m">개념 · 그림 → 예제 ▶ 실행 → 실습 → 퀴즈</text><text x="345" y="100" text-anchor="middle" class="tx-m">교사용: 16:9 슬라이드 + 노트 + 판서</text>
  <rect x="180" y="160" width="330" height="80" rx="8" class="p3s"/><text x="345" y="188" text-anchor="middle" class="tx-b">⚙ C++ 코드 편집기</text><text x="345" y="212" text-anchor="middle" class="tx-m">▶ 컴파일 · 실행 (Ctrl+Enter) · ⬇ .cpp 내려받기</text>
  <rect x="520" y="20" width="220" height="220" rx="8" class="p4s"/><text x="630" y="48" text-anchor="middle" class="tx-b">결과 창</text>
  <text x="630" y="76" text-anchor="middle" class="tx-m">컴파일 오류 · cout 출력</text><text x="630" y="100" text-anchor="middle" class="tx-m">imshow 이미지 창</text><text x="630" y="124" text-anchor="middle" class="tx-m">마우스 → (x, y) · B G R 값</text><text x="630" y="148" text-anchor="middle" class="tx-m">클릭 → 확대 보기</text><text x="630" y="172" text-anchor="middle" class="tx-m">⌨ cin 입력 · waitKey 키</text>
</svg>`;

  const EX_FIRST = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    // 예제 이미지를 흑백(1채널)으로 읽습니다
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    if (img.empty()) { cout << "이미지를 읽지 못했습니다" << endl; return -1; }
    cout << "크기: " << img.cols << " x " << img.rows << endl;          // 너비 x 높이
    cout << "채널: " << img.channels() << ", 형식: " << typeToString(img.type()) << endl;

    double minVal, maxVal;
    minMaxLoc(img, &minVal, &maxVal);
    cout << "밝기 최소/최대: " << minVal << " / " << maxVal << endl;
    cout << format("평균 밝기: %.1f", mean(img)[0]) << endl;

    // 이진화 → 물체 개수 세기 (자세한 내용은 07 · 12차시)
    Mat binary, labels;
    threshold(img, binary, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    int n = connectedComponents(binary, labels);
    cout << "찾은 물체 수: " << n - 1 << endl;

    imshow("input", img);
    imshow("binary", binary);
    waitKey(0);
    return 0;
}`;

  const EX_DRAW = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    // 검은 캔버스(480 x 640, 3채널 컬러)를 만들고 도형 · 글자를 그립니다
    Mat canvas(480, 640, CV_8UC3, Scalar(0, 0, 0));
    rectangle(canvas, Rect(60, 60, 240, 160), Scalar(0, 255, 0), 3);     // BGR 순서: 초록
    circle(canvas, Point(450, 150), 80, Scalar(0, 0, 255), FILLED);      // FILLED(-1) = 채우기, 빨강
    line(canvas, Point(60, 300), Point(580, 420), Scalar(255, 200, 0), 2);
    putText(canvas, "OpenCV + C++", Point(60, 280), FONT_HERSHEY_SIMPLEX, 1.2, Scalar(255, 255, 255), 2);

    Vec3b px = canvas.at<Vec3b>(150, 450);        // (행 y, 열 x) 순서!
    cout << "픽셀 (y=150, x=450) = B:" << (int)px[0] << " G:" << (int)px[1] << " R:" << (int)px[2] << endl;
    imshow("canvas", canvas);
    waitKey(0);
    return 0;
}`;

  const EX_VS = `// Visual Studio 의 C++ 콘솔 프로젝트에 OpenCV 5.0 을 설정한 뒤 main.cpp 에 붙여 넣으세요 (01차시).
// 실행 폴더(프로젝트 폴더)에 images/washers.png 가 있어야 합니다 (강좌 저장소의 assets/images 를 복사).
#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    if (img.empty())
    {
        cout << "이미지를 찾을 수 없습니다. 작업 폴더에 images/ 를 복사했는지 확인하세요." << endl;
        return -1;
    }
    imshow("input", img);   // 로컬 PC 에서는 별도의 창이 열립니다
    waitKey(0);             // 아무 키를 누를 때까지 기다립니다
    destroyAllWindows();
    return 0;
}`;

  const QUIZ = [
    { q: 'OpenCV 를 C++ 에서 쓸 때 거의 모든 기능을 한 번에 포함하는 헤더는?', options: ['<code>#include &lt;opencv.h&gt;</code>', '<code>#include &lt;opencv2/opencv.hpp&gt;</code>', '<code>#include &lt;cv2&gt;</code>', '<code>#include "OpenCvSharp.h"</code>'], answer: 1,
      explain: '<code>&lt;opencv2/opencv.hpp&gt;</code> 는 core · imgproc · highgui · imgcodecs 등 주요 모듈 헤더를 모두 포함합니다. 모든 이름은 <code>cv</code> 네임스페이스 안에 있으므로 <code>cv::Mat</code> 으로 쓰거나 <code>using namespace cv;</code> 를 씁니다.' },
    { q: 'OpenCV 에서 컬러 이미지를 읽었을 때 채널 순서는?', options: ['RGB', 'BGR', 'HSV', 'RGBA'], answer: 1,
      explain: 'OpenCV 는 역사적인 이유로 <b>BGR</b> 순서를 씁니다. <code>Scalar(0, 0, 255)</code> 는 빨강입니다.' },
    { q: '<code>img.at&lt;uchar&gt;(150, 450)</code> 은 어느 픽셀의 값인가?', options: ['x=150, y=450', 'y=150(행), x=450(열)', '150번째 채널', '450행 150열'], answer: 1,
      explain: 'Mat 의 <code>at&lt;T&gt;(row, col)</code> 은 <b>(행 y, 열 x)</b> 순서입니다. 반면 <code>Point(x, y)</code> · <code>Rect(x, y, w, h)</code> 는 <b>(x, y)</b> 순서입니다 — 가장 흔한 실수입니다!' },
    { q: '브라우저 실습 환경에서 실행할 수 <u>없는</u> 코드는?', options: ['<code>GaussianBlur</code> 로 흐리게 만들기', '<code>findContours</code> 로 윤곽선 찾기', '<code>setMouseCallback</code> 으로 마우스 클릭 처리하기', '<code>cin</code> 으로 값 입력받기'], answer: 2,
      explain: '마우스 콜백 · 트랙바 · 실제 웹캠 · dnn 같은 기능은 브라우저에서 동작하지 않습니다. 그런 코드는 <b>🖥 Visual Studio 에서 실행</b> 표시가 있고, <code>vs/</code> 폴더의 솔루션으로 제공됩니다.' }
  ];

  CV_COURSE.addChapter({
    id: 'cv00', no: '00', title: '시작하기: 강좌 안내와 실습 환경', subtitle: 'OpenCV · C++ · Visual Studio 의 관계와 이 사이트 사용법',
    summary: 'OpenCV 를 원래 언어인 <b>C++</b> 로 다루는 이 강좌의 전체 지도를 살펴보고, 브라우저 안에서 C++ OpenCV 코드를 <b>컴파일 · 실행 · 수정</b>하는 방법과 결과 창 · 작업 폴더 사용법을 익힙니다.',
    goals: ['OpenCV · C++ · Visual Studio 의 관계를 설명할 수 있다', '브라우저에서 C++ OpenCV 예제를 컴파일 · 실행하고 수정할 수 있다', '이미지 창에서 좌표 · 픽셀 값을 확인하고, 코드를 Visual Studio 로 옮기는 방법을 안다'],
    sections: [
      {
        id: 'cv00-1', title: '강좌 안내와 실습 환경 둘러보기', minutes: 50,
        goals: ['이 강좌의 4개 Part 와 학습 순서를 말할 수 있다', 'C++ 로 첫 OpenCV 예제를 실행하고 결과 창을 읽을 수 있다', 'BGR 순서와 (행, 열) 좌표 규칙을 안다'],
        flow: [['도입: OpenCV 와 C++', 10], ['강좌 · 환경 안내', 10], ['첫 실행 · 그리기', 20], ['정리 · 퀴즈', 10]],
        content: [
          { type: 'h', text: 'OpenCV 를 C++ 로 배우면 무엇을 만들 수 있나?' },
          { type: 'p', html: '<b>OpenCV</b>(Open Source Computer Vision)는 이미지와 영상을 처리하는 가장 널리 쓰이는 오픈소스 라이브러리입니다. OpenCV 는 <b>C++ 로 만들어졌고</b>, Python · C# · Java 버전은 모두 이 C++ 라이브러리를 감싼 것입니다. 그래서 산업 현장의 <b>검사 장비 · 로봇 비전 · 임베디드 카메라 · 실시간 영상 처리</b>처럼 속도가 중요한 곳에서는 C++ 로 직접 OpenCV 를 씁니다. 이 강좌는 2026년 6월에 나온 <b>OpenCV 5.0</b> 을 사용합니다.' },
          { type: 'figure', html: FIG_STACK, caption: '그림 1. 내 C++ 코드 → OpenCV 라이브러리. 이 사이트는 같은 C++ 코드를 브라우저에서 컴파일해 실행해 준다' },
          { type: 'table', head: ['Python (cv2)', 'C++ (OpenCV)', '뜻'], rows: [
            ['<code>img = cv2.imread("a.png")</code>', '<code>Mat img = imread("a.png");</code>', '이미지 읽기 (Mat)'],
            ['<code>gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)</code>', '<code>cvtColor(img, gray, COLOR_BGR2GRAY);</code>', '색 변환 — 출력 Mat 을 인수로 넘김'],
            ['<code>img.shape</code> → (h, w, ch)', '<code>img.rows, img.cols, img.channels()</code>', '크기 · 채널'],
            ['<code>img[y, x]</code>', '<code>img.at&lt;Vec3b&gt;(y, x)</code> / <code>img.at&lt;uchar&gt;(y, x)</code>', '픽셀 접근 (행, 열)'],
            ['<code>cv2.imshow("w", img)</code>', '<code>imshow("w", img);</code>', '창에 표시'],
            ['<code>np.zeros((480,640,3), np.uint8)</code>', '<code>Mat::zeros(480, 640, CV_8UC3)</code>', '빈 이미지 만들기']
          ], caption: '표 1. Python 과 C++ 의 OpenCV 이름 대응 — 함수 이름은 거의 같고(camelCase), 결과는 출력 인수로 받는다' },
          { type: 'callout', kind: 'info', title: '강좌 구성 (18차시 · 4 Part)', html: '<ul><li><b>Part 1 준비</b> (00~02): Visual Studio 에 OpenCV 5.0 설치 · 프로젝트 설정 · 첫 프로그램(읽기 · 보기 · 저장 · 창과 키)</li><li><b>Part 2 OpenCV 기초</b> (03~11): Mat 과 픽셀 · 그리기 · 색 공간 · 밝기와 히스토그램 · 이진화 · 필터 · 모폴로지 · 에지 · 기하 변환</li><li><b>Part 3 분석과 검출</b> (12~15): 윤곽선과 도형 · 허프 변환 · 템플릿 매칭과 특징점 · 동영상과 카메라</li><li><b>Part 4 응용 프로젝트</b> (16~17): 클래스로 설계하는 이미지 처리 도구 · 실전 검사 프로젝트</li></ul>' },
          { type: 'h', text: '실습 환경: 설치 없이 브라우저에서 C++ 컴파일' },
          { type: 'figure', html: FIG_UI, caption: '그림 2. 화면 구성 — 왼쪽 목차 · 가운데 강좌 내용과 C++ 편집기 · 오른쪽 결과 창' },
          { type: 'list', items: [
            '<b>⚙ C++ 코드</b>: 예제의 <b>▶ 실행</b>을 누르면 아래 편집기로 코드가 들어가고 <b>컴파일 → 실행</b>됩니다. 편집기에서 값을 바꾸고 <kbd>Ctrl</kbd>+<kbd>Enter</kbd> 로 다시 실행하세요.',
            '<b>결과 창</b>: 컴파일 오류(누르면 그 줄로 이동)와 <code>cout</code> 출력, <code>imshow</code> 이미지 창이 오른쪽에 나타납니다. 이미지 위에 마우스를 올리면 <b>(x, y) 좌표와 픽셀 값(B, G, R)</b>이, 누르면 <b>확대 보기</b>(픽셀 격자 · 값)가 열립니다.',
            '<b>📁 작업 폴더</b>: <code>images/</code> 폴더의 예제 이미지 목록을 보고, 내 PC 의 이미지를 올려 <code>imread("내파일.png")</code> 로 쓸 수 있습니다. <code>imwrite</code> 로 저장한 파일도 여기서 내려받습니다.',
            '<b>Visual Studio 로 옮기기</b>: 편집기의 <b>⬇ .cpp</b> 로 코드를 내려받아 OpenCV 를 설정한 콘솔 프로젝트의 <code>main.cpp</code> 에 붙이면 로컬 PC 의 OpenCV 5.0 에서 그대로 동작합니다 (01차시).'
          ] },
          { type: 'callout', kind: 'warn', title: '브라우저 실습 환경의 한계', html: '이 사이트는 브라우저 안의 <b>Clang 컴파일러</b>가 코드를 진짜 C++ 프로그램으로 컴파일합니다. <code>cv::Mat</code> 의 픽셀 접근 · ROI · 복사 같은 동작은 C++ 그대로이고, 알고리즘(<code>cvtColor</code> · <code>threshold</code> …)은 OpenCV.js 5.0 이 계산합니다. 다만 <b>마우스 콜백 · 트랙바 · 스레드 · 실제 웹캠 · dnn/ml 모듈</b>은 지원하지 않습니다. 그런 코드는 <span class="chip local-chip" style="font-size:11px">🖥 Visual Studio 에서 실행</span> 표시가 있고 <code>vs/</code> 폴더의 솔루션으로 제공합니다. 컴파일에 몇 초가 걸리는 점도 기억하세요.' },
          { type: 'h', text: '첫 실행: 이미지 불러오고 물체 개수 세기' },
          { type: 'p', html: '아래 예제의 <b>▶ 실행</b>을 누르세요. 처음 한 번은 C++ 컴파일러(약 110MB)와 OpenCV.js(약 16MB)를 내려받느라 30초~2분 걸립니다(이후에는 캐시 사용). 결과 창의 이미지 위에 마우스를 올려 배경(밝음)과 부품(어두움)의 픽셀 값을 비교해 보세요.' },
          { type: 'code', title: '예제 1: 이미지 정보 · 물체 개수', code: EX_FIRST,
            desc: '<code>images/washers.png</code> 는 백라이트로 찍은 와셔 · 너트 · 볼트 실루엣 합성 이미지입니다. <code>Mat</code> 은 참조 계수로 메모리를 관리하므로 <code>delete</code> 가 필요 없습니다. <code>format()</code> 은 <code>printf</code> 형식으로 문자열을 만드는 OpenCV 함수입니다. <b>부품은 13개인데 결과는 11개</b>로 나옵니다 — 서로 <b>닿아 있는 부품 2쌍</b>이 하나의 덩어리로 세어졌기 때문입니다. 이 문제를 푸는 방법은 12차시(윤곽선 · 거리 변환)에서 다룹니다.',
            expect: '크기: 640 x 480\n채널: 1, 형식: CV_8UC1\n밝기 최소/최대: 18 / 241\n평균 밝기: 191.8\n찾은 물체 수: 11' },
          { type: 'callout', kind: 'tip', title: '좌표 규칙 두 가지', html: '이미지의 원점 (0, 0) 은 <b>왼쪽 위</b>, x 는 오른쪽, y 는 아래쪽으로 커집니다. Mat 의 픽셀 접근 <code>img.at&lt;uchar&gt;(y, x)</code> 는 <b>(행, 열)</b> 순서이지만, OpenCV 함수의 점 <code>Point(x, y)</code> 와 <code>Rect(x, y, w, h)</code> 는 <b>(x, y)</b> 순서입니다 — 가장 흔한 실수이니 꼭 기억하세요!' },
          { type: 'code', title: '예제 2: 캔버스에 그리기 (BGR 색 순서)', code: EX_DRAW, desc: 'OpenCV 의 색은 <b>(B, G, R)</b> 순서입니다. <code>Scalar(0, 0, 255)</code> 가 빨강입니다. 두께에 <code>FILLED</code>(= -1)을 주면 안을 채웁니다. <code>Vec3b</code> 의 원소는 <code>uchar</code> 라서 <code>cout</code> 으로 숫자를 보려면 <code>(int)</code> 로 바꿔야 합니다 — 안 바꾸면 글자로 출력됩니다.',
            expect: '픽셀 (y=150, x=450) = B:0 G:0 R:255' },
          { type: 'h', text: '로컬 PC 에서 실행하려면' },
          { type: 'code', title: '추가: Visual Studio 콘솔 프로젝트에서 같은 코드 실행하기', code: EX_VS, run: false, local: true, file: 'main.cpp',
            desc: '로컬 PC 에서는 <code>imshow</code> 가 <b>실제 창</b>을 열고 <code>waitKey(0)</code> 이 키를 누를 때까지 기다립니다. 브라우저에서는 결과 창에 이미지가 나오고 <code>waitKey</code> 는 바로 돌아옵니다 — 코드는 같습니다. 설치와 프로젝트 설정은 01차시에서 단계별로 합니다.' },
          { type: 'callout', kind: 'vs', title: '준비물', html: '<ul><li><b>Visual Studio 2022</b>(또는 2026) Community (무료) + <b>C++를 사용한 데스크톱 개발</b> 워크로드</li><li><b>OpenCV 5.0.0</b> Windows 패키지 <code>opencv-5.0.0-windows.exe</code> (github.com/opencv/opencv/releases)</li><li>이 저장소의 <code>assets/images</code> 폴더 (예제 이미지) 와 <code>vs/</code> 폴더 (완성 솔루션)</li></ul>' },
          { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 체크리스트', html: '<ul><li>수업 전 교사 PC 에서 예제를 한 번 실행해 컴파일러(110MB) · OpenCV.js(16MB) 를 브라우저 캐시에 채워 둡니다.</li><li>교실 네트워크가 느리면 <code>start-lan.bat</code> 으로 교사 PC 를 서버로 쓰세요 (학생은 교사 PC 주소로 접속).</li><li>학생 PC 에 Visual Studio 「C++를 사용한 데스크톱 개발」이 설치되어 있는지, OpenCV 설치 파일(약 190MB)을 미리 내려받아 두었는지 확인합니다 (01차시).</li><li>💬 발문: “공장에서 카메라로 하는 일에는 무엇이 있을까?” — 불량 검사, 바코드 읽기, 로봇 위치 맞추기, 치수 측정.</li></ul>' }
        ],
        practice: [
          {
            title: '다른 이미지로 평균 밝기와 물체 개수 구하기', level: 1,
            desc: '<code>images/washers.png</code> 대신 <code>images/coins_parts.png</code> 를 불러와 크기 · 평균 밝기 · 물체 개수를 출력하세요. 부품이 배경보다 밝은지 어두운지 결과 창에서 확인하고, 필요하면 <code>THRESH_BINARY_INV</code> 를 <code>THRESH_BINARY</code> 로 바꾸세요.',
            hint: '결과 창에서 이미지 위에 마우스를 올리면 픽셀 값이 보입니다. 물체가 배경보다 <b>밝으면</b> THRESH_BINARY, <b>어두우면</b> THRESH_BINARY_INV 입니다. coins_parts 는 어두운 배경 위의 밝은 부품 12개입니다.',
            expect: '크기: 640 x 480, 평균 밝기: 45.3\nOtsu 임계값: 105, 물체 수: 12',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    // TODO: 크기와 평균 밝기를 출력하세요 (평균은 소수 첫째 자리까지: format("%.1f", ...))

    // TODO: Otsu 이진화 후 connectedComponents 로 물체 개수를 출력하세요
    Mat binary, labels;

    imshow("input", img);   // 이진화 결과를 만들었으면 binary 로 바꿔 보세요
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    cout << "크기: " << img.cols << " x " << img.rows << format(", 평균 밝기: %.1f", mean(img)[0]) << endl;

    Mat binary, labels;
    double t = threshold(img, binary, 0, 255, THRESH_BINARY | THRESH_OTSU);
    int n = connectedComponents(binary, labels);
    cout << "Otsu 임계값: " << t << ", 물체 수: " << n - 1 << endl;

    imshow("binary", binary);
    waitKey(0);
    return 0;
}`
          }
        ],
        quiz: QUIZ,
        slides: [
          { layout: 'title', title: 'C++ 로 배우는 OpenCV 5', subtitle: '시작하기: 강좌 안내와 실습 환경', notes: '<p>강좌를 소개합니다. 💬 “공장이나 병원에서 카메라로 자동으로 하는 일에는 무엇이 있을까요?” — 예상 답: 불량 검사, 바코드 · QR 읽기, 얼굴 인식, 로봇 위치 맞추기. 이런 프로그램의 영상 처리 부분은 속도 때문에 C++ 로 만드는 경우가 많다는 점을 강조합니다.</p>' },
          { layout: 'bullets', title: 'OpenCV 를 C++ 로?', lead: 'OpenCV 의 원래 언어', bullets: [
            '<b>OpenCV</b>: 이미지 · 영상 처리 라이브러리 (C++ · 무료 · 사실상 표준) — 2026년 <b>5.0</b> 출시',
            'Python · C# 버전은 모두 <b>C++ 라이브러리를 감싼 것</b> — C++ 은 가장 빠르고 모든 기능을 쓸 수 있다',
            '<b>Visual Studio</b>: Windows 의 대표 C++ 개발 도구 — 설치와 프로젝트 설정을 직접 해 본다',
            ['이 강좌의 목표', ['OpenCV 핵심 기능을 C++ 로 익힌다', '검사 프로그램을 클래스로 설계해 완성한다']]
          ], notes: '<p>Python 으로 OpenCV 를 배운 학생이 있으면 “함수 이름이 거의 같다”고 안심시킵니다. 💬 “왜 현장 장비는 C++ 이 많을까?” — 속도(실시간), 메모리 제어, 임베디드 · 장비 PC. (5분)</p>' },
          { layout: 'diagram', title: '내 C++ 코드 → OpenCV', html: FIG_STACK, caption: '왼쪽: 로컬 PC 의 Visual Studio 프로젝트 · 오른쪽: 이 사이트의 브라우저 실행 환경 — 같은 코드가 양쪽에서 동작', notes: '<p>세 층을 짚어 줍니다: 내 코드(main.cpp) → OpenCV 헤더 · 라이브러리(.lib/.dll) → 컴파일러가 만든 실행 파일. 브라우저 환경은 같은 C++ 코드를 Clang 으로 컴파일하므로 <b>코드가 같다</b>는 점이 핵심입니다. 마우스 콜백 · 실제 카메라만 브라우저에서 못 돌립니다.</p>' },
          { layout: 'table', title: 'Python cv2 ↔ C++ OpenCV', head: ['Python', 'C++', '뜻'], rows: [
            ['<code>cv2.imread(p)</code>', '<code>imread(p)</code>', '읽기'],
            ['<code>g = cv2.cvtColor(a, code)</code>', '<code>cvtColor(a, g, code)</code>', '색 변환 (출력 Mat 을 넘김)'],
            ['<code>img.shape</code>', '<code>img.rows / cols / channels()</code>', '크기'],
            ['<code>img[y, x]</code>', '<code>img.at&lt;Vec3b&gt;(y, x)</code>', '픽셀 (행, 열)'],
            ['<code>cv2.imshow</code>', '<code>imshow</code>', '표시']
          ], notes: '<p>규칙 3개: ① 모든 이름은 <code>cv::</code> 네임스페이스(<code>using namespace cv;</code>) ② 상수는 대문자(<code>COLOR_BGR2GRAY</code>) ③ 결과를 돌려주는 대신 <b>출력 Mat 을 인수로</b> 넘기는 함수가 많다. (5분)</p>' },
          { layout: 'diagram', title: '이 사이트의 화면 구성', html: FIG_UI, caption: '왼쪽 목차 · 가운데 문서와 C++ 편집기 · 오른쪽 결과 창', notes: '<p>실제 화면을 함께 보며 위치를 짚어 줍니다. 결과 창의 이미지 위에서 마우스를 움직여 좌표 · 픽셀 값이 바뀌는 것을 보여 주고, 클릭해서 확대 보기를 시연합니다. 컴파일 오류가 나면 오류 줄을 눌러 편집기로 이동하는 것도 보여 줍니다. (5분)</p>' },
          { layout: 'code', title: '첫 실행: 이미지 읽고 정보 출력', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    cout << "크기: " << img.cols << " x " << img.rows << endl;
    cout << "채널: " << img.channels() << ", 형식: " << typeToString(img.type()) << endl;
    cout << format("평균 밝기: %.1f", mean(img)[0]) << endl;

    Mat binary, labels;
    threshold(img, binary, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    int n = connectedComponents(binary, labels);
    cout << "찾은 물체 수: " << n - 1 << endl;

    imshow("input", img);
    imshow("binary", binary);
    waitKey(0);
    return 0;
}`, points: ['<code>Mat</code>: 이미지 한 장 — 메모리는 자동 관리(참조 계수)', '<code>IMREAD_GRAYSCALE</code> → 1채널 <code>CV_8UC1</code>', '이진화 → 연결 요소 = 물체 개수 (13개 중 <b>11개</b>: 닿은 부품이 합쳐짐)'], notes: '<p>▶ 실행을 누르고 처음 로딩(컴파일러 내려받기)을 기다리는 동안 코드를 한 줄씩 읽습니다. 결과가 나오면 “왜 13개가 아니고 11개일까?” 💬 — 서로 닿은 부품 2쌍. 이 문제는 12차시에서 해결한다고 예고. 학생들에게 <code>IMREAD_GRAYSCALE</code> 을 <code>IMREAD_COLOR</code> 로 바꿔 실행해 보게 합니다(채널 3 · CV_8UC3, 이진화는 오류 → 채널 수 규칙 예고). (10분)</p>' },
          { layout: 'code', title: '캔버스에 그리기: BGR 순서', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat canvas(480, 640, CV_8UC3, Scalar(0, 0, 0));
    rectangle(canvas, Rect(60, 60, 240, 160), Scalar(0, 255, 0), 3);
    circle(canvas, Point(450, 150), 80, Scalar(0, 0, 255), FILLED);
    line(canvas, Point(60, 300), Point(580, 420), Scalar(255, 200, 0), 2);
    putText(canvas, "OpenCV + C++", Point(60, 280),
            FONT_HERSHEY_SIMPLEX, 1.2, Scalar(255, 255, 255), 2);

    Vec3b px = canvas.at<Vec3b>(150, 450);   // (행 y, 열 x)
    cout << "B:" << (int)px[0] << " G:" << (int)px[1] << " R:" << (int)px[2] << endl;
    imshow("canvas", canvas);
    waitKey(0);
    return 0;
}`, points: ['<code>Scalar(B, G, R)</code> — 파랑 · 초록 · 빨강 순서', '<code>Mat(행 수, 열 수, 형식, 초기값)</code>', '두께 <code>FILLED</code>(-1) = 채우기', '<code>at&lt;Vec3b&gt;(y, x)</code> 는 (행, 열)! 출력은 <code>(int)</code> 로'], notes: '<p>색 값을 바꿔 보게 합니다: <code>Scalar(255, 0, 0)</code> 은 무엇일까? 💬 — 파랑(BGR). 원의 중심 (450, 150) 과 <code>at(150, 450)</code> 의 순서가 다른 점을 강조합니다. <code>(int)</code> 를 지우고 실행하면 이상한 글자가 나오는 것도 보여 줍니다(uchar = 문자). (10분)</p>' },
          { layout: 'two', title: '브라우저 vs Visual Studio', left: { title: '🌐 브라우저 (이 사이트)', bullets: ['설치 없이 바로 컴파일 · 실행', '<code>imshow</code> → 결과 창의 이미지 창', '<code>waitKey(0)</code> 은 바로 돌아옴', '픽셀 값 · 확대 보기로 결과 분석', '❌ 마우스 콜백 · 트랙바 · 웹캠'] }, right: { title: '🖥 Visual Studio (로컬 PC)', bullets: ['OpenCV 5.0 설치 + 프로젝트 속성 설정', '<code>imshow</code> → 실제 창, <code>waitKey</code> 는 키 대기', '⬇ .cpp 로 내려받아 main.cpp 에 붙이기', '완성 솔루션(<code>vs/</code> 폴더)', '실제 카메라 · 최고 속도'] }, notes: '<p>두 환경의 역할을 나눕니다: 브라우저에서 알고리즘을 익히고 → Visual Studio 에서 프로그램을 완성. 01차시에서 설치 · 첫 프로젝트를 만들 것이라고 예고합니다.</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>img.at&lt;uchar&gt;(150, 450)</code> 은 어느 픽셀의 값인가?', options: ['x=150, y=450', 'y=150(행), x=450(열)', '150번째 채널', '450행 150열'], answer: 1, explain: '<code>at&lt;T&gt;(row, col)</code> 은 (행 y, 열 x). 함수의 점 <code>Point(x, y)</code> 는 (x, y) 순서!', notes: '<p>정답 2번. 손을 들어 답하게 하고, 틀린 학생에게 예제 2 의 원 중심 좌표와 비교해 설명합니다.</p>' },
          { layout: 'practice', title: '실습: coins_parts.png 로 바꿔 보기', desc: '<p><code>images/coins_parts.png</code> 를 불러와 크기 · 평균 밝기 · 물체 개수를 출력하세요.</p><ul><li>부품이 배경보다 <b>밝으면</b> <code>THRESH_BINARY</code></li><li>결과 창에서 픽셀 값을 확인해 판단</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    // TODO: 크기 · 평균 밝기 출력

    // TODO: Otsu 이진화 → connectedComponents 로 개수 출력
    Mat binary, labels;

    imshow("input", img);
    waitKey(0);
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    cout << "크기: " << img.cols << " x " << img.rows << format(", 평균 밝기: %.1f", mean(img)[0]) << endl;
    Mat binary, labels;
    double t = threshold(img, binary, 0, 255, THRESH_BINARY | THRESH_OTSU);
    int n = connectedComponents(binary, labels);
    cout << "Otsu 임계값: " << t << ", 물체 수: " << n - 1 << endl;
    imshow("binary", binary);
    waitKey(0);
    return 0;
}`, notes: '<p>정답: 물체 12개, Otsu 임계값 105. THRESH_BINARY_INV 를 그대로 두면 배경이 하나의 큰 물체로 잡혀 개수가 1~2 로 나옵니다 — 그 결과를 보여 주며 “배경/물체 밝기에 따라 반전 여부를 정한다”를 정리합니다. (8분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['OpenCV 는 <b>C++ 라이브러리</b> — <code>#include &lt;opencv2/opencv.hpp&gt;</code>, 이름은 <code>cv::</code>', '함수는 camelCase · 상수는 대문자 · 출력 Mat 을 인수로 넘긴다', '색은 <b>BGR</b>, 픽셀 접근은 <b>(행 y, 열 x)</b>, 함수의 점은 <b>(x, y)</b>', '브라우저에서 익히고 → Visual Studio 에서 완성 (⬇ .cpp)', '다음 시간: Visual Studio 에 OpenCV 5.0 설치 · 설정하기'], notes: '<p>세 가지 규칙(cv 네임스페이스 · BGR · 좌표 순서)을 다시 읽게 합니다. 다음 차시 준비물: Visual Studio 설치 여부, OpenCV 5.0 설치 파일 내려받기. (2분)</p>' }
        ]
      }
    ]
  });
})();
