/* 12차시 윤곽선과 도형 분석 */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 윤곽선 = 이진 이미지에서 경계 픽셀을 따라 모은 점 목록
  const FIG_CONTOUR = `<svg viewBox="0 0 740 320" role="img" aria-label="이진 이미지의 흰 영역 경계를 따라가며 점 목록 vector&lt;vector&lt;Point&gt;&gt; 를 만드는 과정">
  ${ARROW('c12a1')}
  <text x="370" y="20" text-anchor="middle" class="tx-b">윤곽선(Contour) = 이진 이미지에서 흰 영역의 <tspan class="tx">경계 픽셀을 순서대로</tspan> 모은 점 목록</text>
  <text x="130" y="48" text-anchor="middle" class="tx-m">이진 이미지 (0 / 255)</text>
  <rect x="40" y="58" width="180" height="180" class="card-bg"/>
  <rect x="70" y="88" width="120" height="120" class="p1s"/>
  <rect x="100" y="118" width="60" height="60" class="card-bg"/>
  <text x="130" y="152" text-anchor="middle" class="tx-m">구멍</text>
  <text x="130" y="82" text-anchor="middle" class="tx-m">물체(흰색)</text>
  <line x1="228" y1="148" x2="266" y2="148" class="ln" stroke-width="2" marker-end="url(#c12a1)"/>
  <text x="247" y="140" text-anchor="middle" class="tx-m">추적</text>
  <text x="370" y="48" text-anchor="middle" class="tx-m">경계를 따라가며 점을 기록</text>
  <rect x="280" y="58" width="180" height="180" class="card-bg"/>
  <polyline points="310,88 430,88 430,208 310,208 310,88" class="s1" fill="none" stroke-width="2.5" marker-end="url(#c12a1)"/>
  <circle cx="310" cy="88" r="4" class="p1"/><circle cx="350" cy="88" r="4" class="p1"/><circle cx="390" cy="88" r="4" class="p1"/><circle cx="430" cy="88" r="4" class="p1"/>
  <circle cx="430" cy="128" r="4" class="p1"/><circle cx="430" cy="168" r="4" class="p1"/><circle cx="430" cy="208" r="4" class="p1"/>
  <circle cx="390" cy="208" r="4" class="p1"/><circle cx="350" cy="208" r="4" class="p1"/><circle cx="310" cy="208" r="4" class="p1"/>
  <circle cx="310" cy="168" r="4" class="p1"/><circle cx="310" cy="128" r="4" class="p1"/>
  <polyline points="340,118 400,118 400,178 340,178 340,118" class="s3" fill="none" stroke-width="2" stroke-dasharray="4 3"/>
  <text x="370" y="258" text-anchor="middle" class="tx-m">바깥 윤곽 1개 + 구멍(내부) 윤곽 1개</text>
  <rect x="490" y="58" width="230" height="180" rx="8" class="p2s"/>
  <text x="605" y="82" text-anchor="middle" class="tx-b">vector&lt;vector&lt;Point&gt;&gt;</text>
  <text x="605" y="108" text-anchor="middle" class="tx-m">contours[0] = 바깥 윤곽</text>
  <text x="605" y="130" text-anchor="middle" class="tx-m">= { (30,30), (34,30), … }</text>
  <text x="605" y="156" text-anchor="middle" class="tx-m">contours[1] = 구멍 윤곽</text>
  <text x="605" y="182" text-anchor="middle" class="tx-m">→ 윤곽 하나 = <tspan class="tx">vector&lt;Point&gt; 하나</tspan></text>
  <text x="605" y="210" text-anchor="middle" class="tx-m">면적 · 둘레 · 중심 · 모양을 계산</text>
  <text x="370" y="288" text-anchor="middle" class="tx-m">CHAIN_APPROX_SIMPLE: 직선 구간은 <tspan class="tx">양 끝 점만</tspan> 남긴다 (점 수가 절반 이하로)</text>
  <text x="370" y="310" text-anchor="middle" class="tx-m">CHAIN_APPROX_NONE: 경계의 모든 픽셀을 그대로 저장</text>
</svg>`;

  // 그림 2: 윤곽 계층 구조 (Vec4i)
  const FIG_HIER = `<svg viewBox="0 0 740 310" role="img" aria-label="윤곽선 계층 구조: hierarchy[i] 는 next, prev, child, parent 네 정수이고 구멍은 parent 가 0 이상이다">
  ${ARROW('c12a2')}
  <text x="370" y="20" text-anchor="middle" class="tx-b">계층(Hierarchy): hierarchy[i] = Vec4i { [0] next, [1] prev, [2] child, [3] parent }</text>
  <rect x="30" y="40" width="300" height="230" rx="8" class="card-bg"/>
  <text x="180" y="62" text-anchor="middle" class="tx-m">플랜지 (바깥 1 + 구멍 7)</text>
  <circle cx="180" cy="165" r="90" class="p1s"/>
  <circle cx="180" cy="165" r="26" class="card-bg"/>
  <circle cx="180" cy="95" r="12" class="card-bg"/><circle cx="240" cy="130" r="12" class="card-bg"/><circle cx="240" cy="200" r="12" class="card-bg"/>
  <circle cx="180" cy="235" r="12" class="card-bg"/><circle cx="120" cy="200" r="12" class="card-bg"/><circle cx="120" cy="130" r="12" class="card-bg"/>
  <text x="180" y="169" text-anchor="middle" class="tx-m">보어</text>
  <rect x="360" y="40" width="360" height="230" rx="8" class="p2s"/>
  <text x="540" y="62" text-anchor="middle" class="tx-b">RetrievalModes (mode 인수)</text>
  <rect x="378" y="74" width="324" height="30" rx="6" class="card-bg"/><text x="390" y="94" class="tx-m"><tspan class="tx">RETR_EXTERNAL</tspan> — 가장 바깥 윤곽만 → 1개</text>
  <rect x="378" y="110" width="324" height="30" rx="6" class="card-bg"/><text x="390" y="130" class="tx-m"><tspan class="tx">RETR_LIST</tspan> — 전부, 포함 관계 없음 → 8개</text>
  <rect x="378" y="146" width="324" height="30" rx="6" class="card-bg"/><text x="390" y="166" class="tx-m"><tspan class="tx">RETR_CCOMP</tspan> — 2단(바깥 / 구멍) → 8개</text>
  <rect x="378" y="182" width="324" height="30" rx="6" class="card-bg"/><text x="390" y="202" class="tx-m"><tspan class="tx">RETR_TREE</tspan> — 완전한 트리 (구멍 안 물체까지)</text>
  <text x="540" y="236" text-anchor="middle" class="tx-m">구멍 = hierarchy[i][3] (parent) &gt;= 0 인 윤곽</text>
  <text x="540" y="258" text-anchor="middle" class="tx-m">→ 플랜지 7개 · 와셔 영상 10개</text>
  <text x="370" y="292" text-anchor="middle" class="tx-m">child = 첫 자식 윤곽 번호, next/prev = 같은 단계의 형제, parent = 감싸는 윤곽 — 없으면 모두 −1</text>
</svg>`;

  // ================================================================= 교시 1 예제
  const EX_FIND = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    // 윤곽선은 1채널 "이진" 이미지에서 흰 영역(0 이 아닌 픽셀)의 경계를 찾는다
    Mat img = imread("images/flange.png", IMREAD_GRAYSCALE);
    Mat bin;
    double t = threshold(img, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    cout << "Otsu 임계값 " << t << endl;

    vector<vector<Point>> contours;   // 윤곽 하나 = vector<Point> 하나
    vector<Vec4i> hierarchy;          // 윤곽마다 [next, prev, child, parent]
    findContours(bin, contours, hierarchy, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    cout << "윤곽 " << contours.size() << "개" << endl;

    const vector<Point>& c = contours[0];          // 복사하지 않고 참조로
    cout << format("점 %d개, 면적 %.0f, 둘레 %.1f", (int)c.size(), contourArea(c), arcLength(c, true)) << endl;
    Rect box = boundingRect(c);
    cout << "boundingRect " << box << endl;

    // 결과를 컬러 화면에 그려 보기
    Mat view;
    cvtColor(img, view, COLOR_GRAY2BGR);
    drawContours(view, contours, -1, Scalar(0, 255, 0), 2);    // -1 = 전부
    rectangle(view, box, Scalar(0, 0, 255), 2);
    imshow("contour", view);
    waitKey(0);
    return 0;
}`;

  const EX_MODES = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/flange.png", IMREAD_GRAYSCALE);
    Mat bin;
    threshold(img, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);

    // ① 어디까지 찾을까 — RetrievalModes
    const int modes[] = { RETR_EXTERNAL, RETR_LIST, RETR_CCOMP, RETR_TREE };
    const char* names[] = { "RETR_EXTERNAL", "RETR_LIST", "RETR_CCOMP", "RETR_TREE" };
    for (int i = 0; i < 4; i++)
    {
        vector<vector<Point>> cs;
        vector<Vec4i> hi;
        findContours(bin, cs, hi, modes[i], CHAIN_APPROX_SIMPLE);
        long holes = count_if(hi.begin(), hi.end(), [](const Vec4i& h) { return h[3] >= 0; });
        cout << format("%-13s: 윤곽 %d개, parent 가 있는 윤곽 %ld개", names[i], (int)cs.size(), holes) << endl;
    }

    // ② 점을 얼마나 남길까 — ContourApproximationModes (계층이 필요 없으면 hierarchy 생략)
    vector<vector<Point>> simple, none;
    findContours(bin, simple, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    findContours(bin, none, RETR_EXTERNAL, CHAIN_APPROX_NONE);
    cout << "SIMPLE 점 " << simple[0].size() << "개 / NONE 점 " << none[0].size() << "개" << endl;
    cout << format("면적은 그대로: %.0f vs %.0f", contourArea(simple[0]), contourArea(none[0])) << endl;
    return 0;
}`;

  const EX_HIER = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/flange.png", IMREAD_GRAYSCALE);
    Mat bin;
    threshold(img, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);

    // RETR_CCOMP: 바깥 윤곽(parent = -1) 과 구멍 윤곽(parent >= 0) 2단으로 정리해 준다
    vector<vector<Point>> cs;
    vector<Vec4i> hi;
    findContours(bin, cs, hi, RETR_CCOMP, CHAIN_APPROX_SIMPLE);
    long holes = count_if(hi.begin(), hi.end(), [](const Vec4i& h) { return h[3] >= 0; });
    cout << "전체 윤곽 " << cs.size() << "개, 구멍 " << holes << "개" << endl;
    for (size_t k = 0; k < cs.size(); k++)
        cout << format("  [%d] 점 %3d개 면적 %6.0f parent %d child %d",
                       (int)k, (int)cs[k].size(), contourArea(cs[k]), hi[k][3], hi[k][2]) << endl;

    // 바깥은 초록, 구멍은 빨강으로 그려 구분
    Mat view;
    cvtColor(img, view, COLOR_GRAY2BGR);
    for (size_t k = 0; k < cs.size(); k++)
        drawContours(view, cs, (int)k, hi[k][3] < 0 ? Scalar(0, 255, 0) : Scalar(0, 0, 255), 2);
    imshow("hierarchy", view);
    waitKey(0);
    return 0;
}`;

  const EX_SORT = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

struct Outer            // 바깥 윤곽 하나의 요약
{
    int idx;            // contours 안의 번호
    double area;
    double peri;
};

int main()
{
    // 백라이트 영상 — 부품이 어둡다 → THRESH_BINARY_INV
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat bin;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    vector<vector<Point>> cs;
    vector<Vec4i> hi;
    findContours(bin, cs, hi, RETR_CCOMP, CHAIN_APPROX_SIMPLE);
    cout << "전체 윤곽 " << cs.size() << "개" << endl;

    // 바깥 윤곽만 모은다 (parent < 0)
    vector<Outer> outer;
    for (size_t k = 0; k < cs.size(); k++)
        if (hi[k][3] < 0) outer.push_back({ (int)k, contourArea(cs[k]), arcLength(cs[k], true) });
    cout << "바깥 " << outer.size() << "개, 구멍 " << cs.size() - outer.size() << "개" << endl;

    // 면적 큰 순서로 정렬 — 람다로 비교 기준을 준다
    sort(outer.begin(), outer.end(), [](const Outer& a, const Outer& b) { return a.area > b.area; });

    Mat view;
    cvtColor(img, view, COLOR_GRAY2BGR);
    for (size_t i = 0; i < 5 && i < outer.size(); i++)
    {
        const Outer& o = outer[i];
        cout << format("  [%2d] 면적 %7.0f 둘레 %6.1f", o.idx, o.area, o.peri) << endl;
        rectangle(view, boundingRect(cs[o.idx]), Scalar(0, 255, 0), 2);
    }
    imshow("top5", view);
    waitKey(0);
    return 0;
}`;

  const QUIZ1 = [
    { q: '<code>findContours</code> 에 넣어야 하는 이미지는?', options: ['컬러(3채널) 원본', '1채널 <b>이진</b> 이미지 (CV_8UC1)', '그레이스케일이면 아무거나', 'CV_32F 실수 이미지'], answer: 1,
      explain: '윤곽선은 <b>흰 영역(0 이 아닌 값)의 경계</b>를 찾습니다. 1채널 이진 이미지가 필요하므로 먼저 <code>cvtColor</code> → <code>threshold</code>(또는 <code>Canny</code>)를 거칩니다. 컬러를 넣으면 <code>cv::Exception</code> 이 납니다.' },
    { q: '구멍(내부 윤곽)의 개수를 세려면 어떤 모드와 조건이 알맞은가?', options: ['<code>RETR_EXTERNAL</code> + 전체 개수', '<code>RETR_LIST</code> + <code>hi[k][2] &gt;= 0</code>', '<code>RETR_CCOMP</code> + <code>hi[k][3] &gt;= 0</code> 인 윤곽 수', '<code>RETR_TREE</code> + 첫 윤곽의 점 개수'], answer: 2,
      explain: '<code>RETR_CCOMP</code>(또는 <code>RETR_TREE</code>)는 계층을 채워 주므로 <b><code>hi[k][3]</code>(parent) ≥ 0 = 무언가에 감싸인 윤곽 = 구멍</b>입니다. <code>RETR_EXTERNAL</code> 은 구멍을 아예 무시하고, <code>RETR_LIST</code> 는 포함 관계를 채우지 않습니다(parent 가 모두 −1).' },
    { q: '<code>CHAIN_APPROX_SIMPLE</code> 과 <code>CHAIN_APPROX_NONE</code> 의 차이는?', options: ['면적 계산 정확도가 달라진다', '직선 구간의 중간 점을 버리느냐 마느냐', '구멍을 찾느냐 마느냐', '정렬 순서가 달라진다'], answer: 1,
      explain: '<code>CHAIN_APPROX_SIMPLE</code> 은 가로 · 세로 · 대각선 직선 구간의 <b>양 끝 점만</b> 남겨 메모리를 크게 줄입니다. 면적 · 둘레 결과는 사실상 같으므로 <b>기본으로 SIMPLE</b> 을 쓰고, 경계 픽셀을 하나씩 분석할 때만 <code>NONE</code> 을 씁니다.' },
    { q: '<code>drawContours(view, cs, -1, Scalar(0, 255, 0), 2)</code> 에서 <code>-1</code> 과 <code>2</code> 의 뜻은?', options: ['-1 = 첫 윤곽, 2 = 두 번째', '-1 = 모든 윤곽, 2 = 선 두께', '-1 = 채우기, 2 = 계층 깊이', '-1 = 마지막 윤곽, 2 = 선 종류'], answer: 1,
      explain: '세 번째 인수는 그릴 윤곽 번호이고 <b>−1 이면 전부</b>입니다. 다섯 번째는 선 두께인데 <b><code>FILLED</code>(−1)을 주면 안을 채웁니다</b> — 3교시의 구멍 메우기에 씁니다.' },
    { q: '<code>contourArea</code> 가 돌려주는 값은?', options: ['윤곽 안쪽 흰 픽셀의 개수', '윤곽 점들이 만드는 다각형의 면적', '외접 사각형의 면적', '둘레의 제곱'], answer: 1,
      explain: '점들을 이은 <b>다각형의 면적</b>(그린 정리)입니다. 그래서 <code>connectedComponentsWithStats</code> 의 픽셀 개수와 조금 다르고, <b>구멍은 빠지지 않습니다</b>. 실제 재료 면적이 필요하면 바깥 면적 − 구멍 면적을 직접 계산합니다.' }
  ];

  // 그림 3: 같은 윤곽에 맞춘 네 가지 외접 도형
  const FIG_FIT = `<svg viewBox="0 0 720 300" role="img" aria-label="같은 윤곽선에 boundingRect, minAreaRect, minEnclosingCircle, fitEllipse 를 맞춘 비교">
  <text x="360" y="20" text-anchor="middle" class="tx-b">같은 윤곽선 · 네 가지 "맞춤 도형" — 목적에 따라 고른다</text>
  <rect x="30" y="40" width="200" height="200" rx="8" class="card-bg"/>
  <rect x="58" y="86" width="144" height="110" class="p1s" transform="rotate(-24 130 141)"/>
  <rect x="52" y="74" width="156" height="134" class="s2" fill="none" stroke-width="2" stroke-dasharray="5 4"/>
  <text x="130" y="60" text-anchor="middle" class="tx-b">boundingRect</text>
  <text x="130" y="228" text-anchor="middle" class="tx-m">Rect · 축에 평행 · ROI</text>
  <rect x="250" y="40" width="200" height="200" rx="8" class="card-bg"/>
  <rect x="278" y="86" width="144" height="110" class="p1s" transform="rotate(-24 350 141)"/>
  <rect x="278" y="86" width="144" height="110" class="s3" fill="none" stroke-width="2.5" transform="rotate(-24 350 141)"/>
  <text x="350" y="60" text-anchor="middle" class="tx-b">minAreaRect</text>
  <text x="350" y="228" text-anchor="middle" class="tx-m">RotatedRect: center · size · <tspan class="tx">angle</tspan></text>
  <rect x="470" y="40" width="220" height="200" rx="8" class="card-bg"/>
  <rect x="508" y="86" width="144" height="110" class="p1s" transform="rotate(-24 580 141)"/>
  <circle cx="580" cy="141" r="90" class="s4" fill="none" stroke-width="2.5"/>
  <ellipse cx="580" cy="141" rx="82" ry="62" class="s5" fill="none" stroke-width="2" stroke-dasharray="5 4" transform="rotate(-24 580 141)"/>
  <text x="580" y="60" text-anchor="middle" class="tx-b">minEnclosingCircle / fitEllipse</text>
  <text x="580" y="228" text-anchor="middle" class="tx-m">최대 외경 / 평균 윤곽 (점 5개 이상)</text>
  <text x="360" y="266" text-anchor="middle" class="tx-m">모멘트 중심 = (m10/m00, m01/m00) — 무게 중심이므로 비대칭 부품에서는 외접 도형 중심과 다르다</text>
  <text x="360" y="288" text-anchor="middle" class="tx-m">기울어진 칩: boundingRect 면적 33066 vs minAreaRect 면적 약 18800 (예제 1)</text>
</svg>`;

  // 그림 4: approxPolyDP 와 원형도
  const FIG_CIRC = `<svg viewBox="0 0 740 300" role="img" aria-label="approxPolyDP 로 꼭짓점을 줄이는 원리와 도형별 원형도 값">
  <text x="370" y="20" text-anchor="middle" class="tx-b">approxPolyDP: 허용 오차 ε 안에 들어오면 중간 점을 버린다</text>
  <rect x="20" y="36" width="330" height="150" rx="8" class="card-bg"/>
  <polyline points="50,150 80,138 110,128 140,122 170,120 200,124 230,132 260,144 290,158" class="s1" fill="none" stroke-width="2"/>
  <circle cx="50" cy="150" r="3.5" class="p1"/><circle cx="80" cy="138" r="3" class="p3"/><circle cx="110" cy="128" r="3" class="p3"/><circle cx="140" cy="122" r="3" class="p3"/>
  <circle cx="170" cy="120" r="3.5" class="p1"/><circle cx="200" cy="124" r="3" class="p3"/><circle cx="230" cy="132" r="3" class="p3"/><circle cx="260" cy="144" r="3" class="p3"/><circle cx="290" cy="158" r="3.5" class="p1"/>
  <polyline points="50,150 170,120 290,158" class="s3" fill="none" stroke-width="2.5" stroke-dasharray="6 4"/>
  <line x1="110" y1="128" x2="110" y2="140" class="ln" stroke-width="1.5"/><text x="116" y="140" class="tx-m">ε</text>
  <text x="185" y="62" text-anchor="middle" class="tx-m">큰 점 = 남는 꼭짓점 · 작은 점 = 버리는 점</text>
  <text x="185" y="176" text-anchor="middle" class="tx-m">ε = 둘레 × 0.02~0.04 (크기에 비례!)</text>
  <rect x="370" y="36" width="350" height="150" rx="8" class="p2s"/>
  <text x="545" y="62" text-anchor="middle" class="tx-b">원형도(circularity) = 4π·면적 / 둘레²</text>
  <circle cx="416" cy="106" r="24" class="p1s"/><text x="416" y="150" text-anchor="middle" class="tx-m">원 1.00</text>
  <polygon points="490,82 510,94 510,118 490,130 470,118 470,94" class="p1s"/><text x="490" y="150" text-anchor="middle" class="tx-m">육각 0.91</text>
  <rect x="546" y="84" width="44" height="44" class="p1s"/><text x="568" y="150" text-anchor="middle" class="tx-m">사각 0.79</text>
  <polygon points="650,82 674,128 626,128" class="p1s"/><text x="650" y="150" text-anchor="middle" class="tx-m">삼각 0.60</text>
  <text x="545" y="176" text-anchor="middle" class="tx-m">길쭉한 볼트 ≈ 0.2 — 크기와 무관한 <tspan class="tx">모양 지표</tspan></text>
  <rect x="20" y="198" width="700" height="86" rx="8" class="card-bg"/>
  <text x="370" y="224" text-anchor="middle" class="tx-m">분류 규칙 예: 꼭짓점 3 → 삼각형 · 4 → 사각형 · 6 → 육각형(너트) · 7 이상 → 원(와셔)</text>
  <text x="370" y="250" text-anchor="middle" class="tx-m">원형도 ≥ 0.85 → 와셔 · 0.7~0.85 → 너트 · &lt; 0.45 이고 작으면 → 볼트 · 나머지 → <tspan class="tx">의심(붙어 있음?)</tspan></text>
  <text x="370" y="274" text-anchor="middle" class="tx-m">볼록성(solidity) = 윤곽 면적 / 볼록 껍질 면적 → 볼트 약 0.7, 와셔 · 너트 0.98 이상</text>
</svg>`;

  // ================================================================= 교시 2 예제
  const EX_SHAPE1 = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/chip_rotated.png", IMREAD_GRAYSCALE);
    Mat bin;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);    // 검은 몸체 → 흰색
    vector<vector<Point>> cs;
    findContours(bin, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    // 가장 큰 윤곽 = 칩 몸체 (max_element + 람다)
    auto it = max_element(cs.begin(), cs.end(), [](const vector<Point>& a, const vector<Point>& b) {
        return contourArea(a) < contourArea(b);
    });
    const vector<Point>& body = *it;

    // ① 모멘트: 면적과 무게 중심
    Moments m = moments(body);
    Point2d c(m.m10 / m.m00, m.m01 / m.m00);
    cout << format("m00 %.0f", m.m00) << endl;
    cout << format("모멘트 중심 (%.2f, %.2f)", c.x, c.y) << endl;

    // ② 축에 평행한 사각형 vs ③ 최소 면적 회전 사각형
    Rect br = boundingRect(body);
    cout << "boundingRect " << br << " 면적 " << br.area() << endl;
    RotatedRect rr = minAreaRect(body);
    cout << format("minAreaRect 중심 (%.1f, %.1f) 크기 %.1f x %.1f 각도 %.2f 면적 %.0f",
                   rr.center.x, rr.center.y, rr.size.width, rr.size.height, rr.angle, rr.size.area()) << endl;

    Point2f pts[4];
    rr.points(pts);                       // 회전 사각형의 네 꼭짓점
    for (int k = 0; k < 4; k++)
        cout << format("  꼭짓점 %d: (%.1f, %.1f)", k, pts[k].x, pts[k].y) << endl;

    Mat view;
    cvtColor(img, view, COLOR_GRAY2BGR);
    rectangle(view, br, Scalar(0, 255, 255), 2);
    for (int k = 0; k < 4; k++)
        line(view, pts[k], pts[(k + 1) % 4], Scalar(0, 255, 0), 2);
    drawMarker(view, Point(cvRound(c.x), cvRound(c.y)), Scalar(0, 0, 255), MARKER_CROSS, 24, 2);
    imshow("shape", view);
    waitKey(0);
    return 0;
}`;

  const EX_SHAPE2 = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
#include <cmath>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washer_ring.png", IMREAD_GRAYSCALE);
    Mat bin;
    threshold(img, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    vector<vector<Point>> cs;
    findContours(bin, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    sort(cs.begin(), cs.end(), [](const vector<Point>& a, const vector<Point>& b) {
        return contourArea(a) > contourArea(b);            // 면적 내림차순
    });
    const vector<Point>& ring = cs[0];

    Moments m = moments(ring);
    cout << format("면적 %.0f 중심 (%.2f, %.2f)", m.m00, m.m10 / m.m00, m.m01 / m.m00) << endl;

    RotatedRect rr = minAreaRect(ring);
    cout << format("minAreaRect %.1f x %.1f", rr.size.width, rr.size.height) << endl;

    Point2f center;
    float radius;
    minEnclosingCircle(ring, center, radius);              // 결과를 참조 인수로 받는다
    cout << format("minEnclosingCircle 중심 (%.2f, %.2f) 반지름 %.2f", center.x, center.y, radius) << endl;

    RotatedRect el = fitEllipse(ring);                     // 점이 5개 이상이어야 한다
    cout << format("fitEllipse 중심 (%.2f, %.2f) 축 %.2f x %.2f", el.center.x, el.center.y, el.size.width, el.size.height) << endl;

    double req = sqrt(contourArea(ring) / CV_PI);
    cout << format("등가 반지름 %.2f (정답 150.60)", req) << endl;

    Mat view;
    cvtColor(img, view, COLOR_GRAY2BGR);
    circle(view, center, cvRound(radius), Scalar(0, 255, 0), 2);
    ellipse(view, el, Scalar(0, 0, 255), 2);
    imshow("fit", view);
    waitKey(0);
    return 0;
}`;

  const EX_SHAPE3 = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
#include <cmath>
using namespace cv;
using namespace std;

struct ShapeInfo        // 도형 하나의 분석 결과
{
    int x;              // 왼쪽 x (정렬용)
    int vertices;       // 꼭짓점 수
    double area, circ;  // 면적, 원형도
};

string shapeName(int v)
{
    switch (v)
    {
    case 3: return "삼각형";
    case 4: return "사각형";
    case 5: return "오각형";
    case 6: return "육각형";
    default: return "원";
    }
}

int main()
{
    // 원 · 삼각형 · 사각형 · 육각형을 직접 그려서 분류해 본다
    Mat canvas = Mat::zeros(320, 640, CV_8UC1);
    circle(canvas, Point(80, 160), 55, Scalar(255), FILLED);
    vector<Point> tri = { Point(200, 105), Point(270, 215), Point(130, 215) };
    vector<Point> hex;
    for (int i = 0; i < 6; i++)
        hex.push_back(Point(530 + (int)(55 * cos(i * CV_PI / 3)), 160 - (int)(55 * sin(i * CV_PI / 3))));
    fillPoly(canvas, vector<vector<Point>>{ tri, hex }, Scalar(255));
    rectangle(canvas, Rect(300, 105, 110, 110), Scalar(255), FILLED);

    vector<vector<Point>> cs;
    findContours(canvas, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    cout << "도형 " << cs.size() << "개" << endl;

    vector<ShapeInfo> shapes;
    Mat view;
    cvtColor(canvas, view, COLOR_GRAY2BGR);
    for (const auto& c : cs)
    {
        double p = arcLength(c, true), a = contourArea(c);
        vector<Point> ap;
        approxPolyDP(c, ap, 0.03 * p, true);              // ε = 둘레의 3%
        shapes.push_back({ boundingRect(c).x, (int)ap.size(), a, 4 * CV_PI * a / (p * p) });
        polylines(view, ap, true, Scalar(0, 255, 0), 2);
    }
    sort(shapes.begin(), shapes.end(), [](const ShapeInfo& a, const ShapeInfo& b) { return a.x < b.x; });
    for (const auto& s : shapes)
        cout << format("  꼭짓점 %d개 면적 %5.0f 원형도 %.3f → ", s.vertices, s.area, s.circ) << shapeName(s.vertices) << endl;
    imshow("shapes", view);
    waitKey(0);
    return 0;
}`;

  const EX_SHAPE4 = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <map>
using namespace cv;
using namespace std;

// 원형도 · 면적으로 부품 종류를 정한다 (경계값은 실제 출력을 보고 정함)
string classify(double circ, double area)
{
    if (circ >= 0.85) return "washer";
    if (circ >= 0.70) return "nut";
    if (circ < 0.45 && area < 5000) return "bolt";
    return "stuck?";                                   // 애매하면 버리지 말고 표시
}

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat bin;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    vector<vector<Point>> cs;
    vector<Vec4i> hi;
    findContours(bin, cs, hi, RETR_CCOMP, CHAIN_APPROX_SIMPLE);

    map<string, int> count;                            // 종류별 개수
    map<string, Scalar> color = { {"washer", Scalar(0, 255, 0)}, {"nut", Scalar(0, 255, 255)},
                                  {"bolt", Scalar(255, 255, 0)}, {"stuck?", Scalar(0, 0, 255)} };
    Mat view;
    cvtColor(img, view, COLOR_GRAY2BGR);
    for (size_t k = 0; k < cs.size(); k++)
    {
        if (hi[k][3] >= 0) continue;                   // 구멍은 건너뛴다
        double a = contourArea(cs[k]);
        if (a < 500) continue;                         // 잡음 제거
        double p = arcLength(cs[k], true);
        double circ = 4 * CV_PI * a / (p * p);         // 원형도
        bool hole = hi[k][2] >= 0;                     // 자식(구멍)이 있나
        string kind = classify(circ, a);
        count[kind]++;
        cout << format("  면적 %6.0f 원형도 %.3f 구멍 %s → %s", a, circ, hole ? "O" : "X", kind.c_str()) << endl;
        drawContours(view, cs, (int)k, color[kind], 2);
    }
    cout << "washer " << count["washer"] << " nut " << count["nut"] << " bolt " << count["bolt"]
         << " stuck? " << count["stuck?"] << " (정답: 와셔 6 너트 4 볼트 3)" << endl;
    imshow("classify", view);
    waitKey(0);
    return 0;
}`;

  const EX_SHAPE5 = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

struct Convexity
{
    double area, hullArea, solidity, maxDepth;
    int nPts, nHull;
};

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat bin;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    vector<vector<Point>> cs;
    findContours(bin, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);

    vector<Convexity> rows;
    Mat view;
    cvtColor(img, view, COLOR_GRAY2BGR);
    for (const auto& c : cs)
    {
        double a = contourArea(c);
        if (a < 500) continue;
        vector<Point> hull;
        convexHull(c, hull);                             // 고무줄로 감싼 모양 (점)
        vector<int> hullIdx;
        convexHull(c, hullIdx, false, false);            // 같은 껍질을 "윤곽 점 번호" 로
        vector<Vec4i> defects;                           // [시작, 끝, 가장 깊은 점, 깊이×256]
        convexityDefects(c, hullIdx, defects);
        double maxDepth = 0;
        for (const Vec4i& d : defects) maxDepth = max(maxDepth, d[3] / 256.0);

        double ha = contourArea(hull);
        rows.push_back({ a, ha, a / ha, maxDepth, (int)c.size(), (int)hull.size() });
        polylines(view, hull, true, Scalar(0, 0, 255), 2);
    }

    // 볼록성이 낮은 것부터 4개
    sort(rows.begin(), rows.end(), [](const Convexity& a, const Convexity& b) { return a.solidity < b.solidity; });
    for (int i = 0; i < 4; i++)
        cout << format("  면적 %6.0f 껍질 %6.0f 볼록성 %.3f 최대 오목 깊이 %4.1f px 점 %3d→%2d",
                       rows[i].area, rows[i].hullArea, rows[i].solidity, rows[i].maxDepth, rows[i].nPts, rows[i].nHull) << endl;

    // 점이 영역 안에 있나 (true = 부호 있는 거리, false = +1 / 0 / -1)
    auto big = *max_element(cs.begin(), cs.end(), [](const vector<Point>& a, const vector<Point>& b) {
        return contourArea(a) < contourArea(b);
    });
    double d = pointPolygonTest(big, Point2f(131, 91), true);
    double outside = pointPolygonTest(big, Point2f(0, 0), false);
    cout << format("pointPolygonTest: (131,91) → %.1f / (0,0) → %.0f", d, outside) << endl;

    imshow("hull", view);
    waitKey(0);
    return 0;
}`;

  const EX_MATCH = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

// 이미지에서 가장 큰 바깥 윤곽 하나를 돌려준다
vector<Point> largestContour(const Mat& gray, int threshType)
{
    Mat bin;
    threshold(gray, bin, 0, 255, threshType | THRESH_OTSU);
    vector<vector<Point>> cs;
    findContours(bin, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    return *max_element(cs.begin(), cs.end(), [](const vector<Point>& a, const vector<Point>& b) {
        return contourArea(a) < contourArea(b);
    });
}

int main()
{
    // 기준 모양: 0° 로 놓인 L 브래킷 템플릿
    Mat tmpl = imread("images/part_template.png", IMREAD_GRAYSCALE);
    vector<Point> ref = largestContour(tmpl, THRESH_BINARY);

    // 장면: 같은 브래킷 6개가 서로 다른 위치 · 각도로 놓여 있다
    Mat scene = imread("images/parts_scene.png", IMREAD_GRAYSCALE);
    Mat bin;
    threshold(scene, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    vector<vector<Point>> cs;
    findContours(bin, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    sort(cs.begin(), cs.end(), [](const vector<Point>& a, const vector<Point>& b) {
        Rect ra = boundingRect(a), rb = boundingRect(b);
        return ra.y / 150 != rb.y / 150 ? ra.y < rb.y : ra.x < rb.x;   // 위 줄 → 아래 줄, 왼쪽 → 오른쪽
    });
    for (const auto& c : cs)
    {
        Rect r = boundingRect(c);
        double s = matchShapes(ref, c, CONTOURS_MATCH_I1, 0);         // 0 에 가까울수록 같은 모양
        cout << format("  브래킷 (%3d, %3d) 면적 %.0f 점수 %.4f", r.x, r.y, contourArea(c), s) << endl;
    }

    // 비교: 다른 모양 (washers.png 의 볼트 · 와셔)
    Mat w = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat wb;
    threshold(w, wb, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    vector<vector<Point>> wc;
    findContours(wb, wc, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    for (const auto& c : wc)
    {
        Rect r = boundingRect(c);
        if (r.contains(Point(160, 245)) || r.contains(Point(300, 85)))      // B1 볼트, W3 와셔
            cout << format("  다른 부품 (%3d, %3d) 점수 %.4f", r.x, r.y, matchShapes(ref, c, CONTOURS_MATCH_I1, 0)) << endl;
    }
    imshow("scene", bin);
    waitKey(0);
    return 0;
}`;

  const QUIZ2 = [
    { q: '윤곽선의 <b>무게 중심</b>을 구하는 식은? (<code>Moments m = moments(c);</code>)', options: ['<code>(m.m10, m.m01)</code>', '<code>(m.m10 / m.m00, m.m01 / m.m00)</code>', '<code>(m.m00 / m.m10, m.m00 / m.m01)</code>', '<code>boundingRect(c)</code> 의 중심'], answer: 1,
      explain: '<code>m00</code> 이 면적이고 <code>m10</code> · <code>m01</code> 은 x · y 의 합(1차 모멘트)이므로 <b>중심 = (m10/m00, m01/m00)</b> 입니다. <code>boundingRect</code> 의 중심은 외접 사각형의 중심이라 비대칭 물체에서는 무게 중심과 다릅니다. <code>m00 == 0</code> 인 윤곽(선 하나)은 나눗셈 전에 걸러야 합니다.' },
    { q: '기울어진 직사각형 부품의 <b>실제 크기와 각도</b>를 얻는 함수는?', options: ['<code>boundingRect</code>', '<code>minAreaRect</code>', '<code>minEnclosingCircle</code>', '<code>approxPolyDP</code>'], answer: 1,
      explain: '<code>minAreaRect</code> 는 <code>RotatedRect</code>(<code>center</code> · <code>size</code> · <b><code>angle</code></b>)를 돌려줍니다. 네 꼭짓점은 <code>rr.points(pts)</code> 로 얻습니다. <code>boundingRect</code> 는 축에 평행해서 기울어지면 빈 공간까지 포함해 커집니다.' },
    { q: '<code>approxPolyDP</code> 의 <code>epsilon</code> 을 <b>둘레의 비율</b>로 주는 이유는?', options: ['실행 속도가 빨라진다', '물체 크기가 달라도 같은 정도로 단순화되기 때문', '반드시 정수여야 하기 때문', '닫힌 곡선만 처리되기 때문'], answer: 1,
      explain: 'epsilon 은 px 단위 허용 오차입니다. 고정값을 쓰면 큰 물체는 거의 단순화되지 않고 작은 물체는 뭉개집니다. <code>0.02~0.04 × arcLength(c, true)</code> 처럼 <b>크기에 비례</b>하게 주면 크기와 무관하게 꼭짓점 수가 안정적으로 나옵니다.' },
    { q: '원형도 <b>4πA/P²</b> 값이 가장 큰 도형은?', options: ['정삼각형 (≈0.60)', '정사각형 (≈0.79)', '정육각형 (≈0.91)', '원 (=1)'], answer: 3,
      explain: '같은 둘레로 가장 넓은 면적을 갖는 도형이 원이므로 원형도는 <b>1 이 최대</b>입니다. 각이 많아질수록 1 에 가까워지고(삼각 0.60 → 사각 0.79 → 육각 0.91 → 원 1), 길쭉한 볼트는 0.2 근처로 작습니다. 픽셀 격자 때문에 실제 원도 0.89 정도로 나옵니다.' },
    { q: '<code>convexityDefects(c, hull, defects)</code> 를 쓸 때 <code>hull</code> 은 어떻게 만들어야 하나?', options: ['<code>vector&lt;Point&gt;</code> 로 받은 껍질 점', '<code>convexHull(c, hullIdx, false, false)</code> 로 받은 <code>vector&lt;int&gt;</code> 점 번호', '<code>approxPolyDP</code> 결과', '<code>boundingRect</code> 의 네 꼭짓점'], answer: 1,
      explain: '<code>convexityDefects</code> 는 껍질을 <b>윤곽 점의 번호(인덱스)</b>로 받습니다. <code>convexHull</code> 의 네 번째 인수 <code>returnPoints = false</code> 로 <code>vector&lt;int&gt;</code> 를 받아 넘기세요. 결과 <code>Vec4i</code> 의 네 번째 값은 깊이 × 256 이므로 <code>/ 256.0</code> 해야 px 입니다.' }
  ];

  // 그림 5: 연결 요소 라벨링
  const FIG_LABEL = `<svg viewBox="0 0 740 280" role="img" aria-label="연결 요소 라벨링은 붙어 있는 흰 픽셀에 같은 번호를 붙이고 4연결과 8연결이 결과를 바꾼다">
  ${ARROW('c12b1')}
  <text x="370" y="20" text-anchor="middle" class="tx-b">연결 요소 라벨링(Connected Components) = 붙어 있는 흰 픽셀에 <tspan class="tx">같은 번호</tspan> 붙이기</text>
  <rect x="20" y="36" width="210" height="170" rx="8" class="card-bg"/>
  <text x="125" y="58" text-anchor="middle" class="tx-m">이진 이미지</text>
  <rect x="50" y="72" width="70" height="50" class="p1s"/><rect x="146" y="72" width="54" height="50" class="p1s"/>
  <rect x="50" y="140" width="150" height="46" class="p1s"/>
  <text x="125" y="200" text-anchor="middle" class="tx-m">흰 덩어리 3개</text>
  <line x1="238" y1="120" x2="272" y2="120" class="ln" stroke-width="2" marker-end="url(#c12b1)"/>
  <rect x="284" y="36" width="210" height="170" rx="8" class="card-bg"/>
  <text x="389" y="58" text-anchor="middle" class="tx-m">labels Mat (CV_32S)</text>
  <rect x="314" y="72" width="70" height="50" class="p2s"/><text x="349" y="103" text-anchor="middle" class="tx-b">1</text>
  <rect x="410" y="72" width="54" height="50" class="p3s"/><text x="437" y="103" text-anchor="middle" class="tx-b">2</text>
  <rect x="314" y="140" width="150" height="46" class="p4s"/><text x="389" y="170" text-anchor="middle" class="tx-b">3</text>
  <text x="389" y="200" text-anchor="middle" class="tx-m">배경 = <tspan class="tx">0</tspan> → 물체 수 = 반환값 − 1</text>
  <rect x="510" y="36" width="210" height="170" rx="8" class="p2s"/>
  <text x="615" y="58" text-anchor="middle" class="tx-b">4연결 vs 8연결</text>
  <rect x="540" y="72" width="26" height="26" class="p1"/><rect x="566" y="98" width="26" height="26" class="p1"/>
  <text x="620" y="92" class="tx-m">대각선으로만</text><text x="620" y="112" class="tx-m">닿아 있으면?</text>
  <text x="615" y="146" text-anchor="middle" class="tx-m">4연결 → <tspan class="tx">2개</tspan> (상하좌우만)</text>
  <text x="615" y="170" text-anchor="middle" class="tx-m">8연결 → <tspan class="tx">1개</tspan> (기본값)</text>
  <text x="615" y="194" text-anchor="middle" class="tx-m">connectivity 인수 = 4 / 8</text>
  <text x="370" y="234" text-anchor="middle" class="tx-m">stats 한 행 = [CC_STAT_LEFT, TOP, WIDTH, HEIGHT, <tspan class="tx">AREA</tspan>] (int) · centroids 한 행 = [x, y] (double)</text>
  <text x="370" y="258" text-anchor="middle" class="tx-m">stats.at&lt;int&gt;(i, CC_STAT_AREA) · centroids.at&lt;double&gt;(i, 0) 로 꺼내 struct 에 담아 쓴다</text>
</svg>`;

  // 그림 6: 거리 변환 + watershed 파이프라인
  const FIG_WS = `<svg viewBox="0 0 740 300" role="img" aria-label="거리 변환으로 씨앗을 만들고 watershed 로 붙어 있는 물체를 분리하는 5단계 파이프라인">
  ${ARROW('c12b2')}
  <text x="370" y="20" text-anchor="middle" class="tx-b">붙어 있는 두 물체를 분리하는 5단계</text>
  <rect x="18" y="36" width="130" height="120" rx="8" class="card-bg"/>
  <text x="83" y="56" text-anchor="middle" class="tx-m">① 이진화</text>
  <circle cx="62" cy="106" r="30" class="p1s"/><circle cx="104" cy="106" r="30" class="p1s"/>
  <text x="83" y="148" text-anchor="middle" class="tx-m">덩어리 1개</text>
  <line x1="152" y1="96" x2="176" y2="96" class="ln" stroke-width="2" marker-end="url(#c12b2)"/>
  <rect x="180" y="36" width="130" height="120" rx="8" class="card-bg"/>
  <text x="245" y="56" text-anchor="middle" class="tx-m">② 거리 변환</text>
  <circle cx="224" cy="106" r="30" class="p1s"/><circle cx="266" cy="106" r="30" class="p1s"/>
  <circle cx="224" cy="106" r="20" class="p2s"/><circle cx="266" cy="106" r="20" class="p2s"/>
  <circle cx="224" cy="106" r="9" class="p3"/><circle cx="266" cy="106" r="9" class="p3"/>
  <text x="245" y="148" text-anchor="middle" class="tx-m">중심이 가장 밝다</text>
  <line x1="314" y1="96" x2="338" y2="96" class="ln" stroke-width="2" marker-end="url(#c12b2)"/>
  <rect x="342" y="36" width="130" height="120" rx="8" class="card-bg"/>
  <text x="407" y="56" text-anchor="middle" class="tx-m">③ 봉우리 잘라내기</text>
  <circle cx="386" cy="106" r="11" class="p3"/><circle cx="428" cy="106" r="11" class="p3"/>
  <text x="407" y="148" text-anchor="middle" class="tx-m">씨앗 2개 (라벨링)</text>
  <line x1="476" y1="96" x2="500" y2="96" class="ln" stroke-width="2" marker-end="url(#c12b2)"/>
  <rect x="504" y="36" width="216" height="120" rx="8" class="card-bg"/>
  <text x="612" y="56" text-anchor="middle" class="tx-m">④ 마커 (CV_32SC1) → ⑤ watershed</text>
  <circle cx="570" cy="106" r="30" class="p2s"/><circle cx="612" cy="106" r="30" class="p4s"/>
  <line x1="591" y1="78" x2="591" y2="134" class="s1" stroke-width="3"/>
  <text x="680" y="100" class="tx-m">경계</text><text x="680" y="118" class="tx-m">= −1</text>
  <text x="612" y="148" text-anchor="middle" class="tx-m">물체 2개로 분리</text>
  <rect x="18" y="172" width="702" height="112" rx="8" class="p2s"/>
  <text x="370" y="196" text-anchor="middle" class="tx-m">씨앗 라벨 + 1 → 배경 = 1, 씨앗 = 2, 3, … · <tspan class="tx">미지 영역(배경인지 물체인지 모르는 곳) = 0</tspan></text>
  <text x="370" y="220" text-anchor="middle" class="tx-m">watershed 는 0 인 곳을 채워 나가며 서로 다른 라벨이 만나는 선을 −1 로 표시한다</text>
  <text x="370" y="246" text-anchor="middle" class="tx-m">봉우리 임계값이 낮으면 한 물체가 <tspan class="tx">여러 개</tspan>로 쪼개지고, 높으면 작은 물체의 씨앗이 <tspan class="tx">사라진다</tspan></text>
  <text x="370" y="272" text-anchor="middle" class="tx-m">→ 반드시 임계값을 바꿔 보며 씨앗 개수를 확인할 것 (와셔 영상은 0.30~0.40 에서 13개)</text>
</svg>`;

  // ================================================================= 교시 3 예제
  const EX_CC1 = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat bin;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);

    Mat labels;      // CV_32S — 픽셀마다 라벨 번호
    Mat stats;       // n x 5 : LEFT, TOP, WIDTH, HEIGHT, AREA (int)
    Mat centroids;   // n x 2 : 중심 x, y (double)
    int n = connectedComponentsWithStats(bin, labels, stats, centroids);
    cout << "라벨 " << n << "개 (배경 포함) → 물체 " << n - 1 << "개" << endl;
    cout << "stats " << stats.rows << "x" << stats.cols << " " << typeToString(stats.type())
         << " / centroids " << centroids.rows << "x" << centroids.cols << " " << typeToString(centroids.type()) << endl;

    for (int i = 0; i < 4; i++)
    {
        int left = stats.at<int>(i, CC_STAT_LEFT);
        int top = stats.at<int>(i, CC_STAT_TOP);
        int w = stats.at<int>(i, CC_STAT_WIDTH);
        int h = stats.at<int>(i, CC_STAT_HEIGHT);
        int area = stats.at<int>(i, CC_STAT_AREA);
        cout << format("  [%d] L%d T%d W%d H%d 면적 %d 중심 (%.1f, %.1f)", i, left, top, w, h, area,
                       centroids.at<double>(i, 0), centroids.at<double>(i, 1)) << endl;
    }

    // 라벨 Mat 을 보이게: 라벨 번호 × 20 을 밝기로
    Mat view;
    labels.convertTo(view, CV_8U, 20);
    imshow("labels x20", view);
    waitKey(0);
    return 0;
}`;

  const EX_CC2 = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

struct Blob                 // 라벨 하나의 정보 (OpenCvSharp 의 Blob 같은 것을 직접 만든다)
{
    int label;
    int area;
    Rect rect;
    Point2d centroid;
};

// stats · centroids Mat → vector<Blob> (배경 0 은 뺀다)
vector<Blob> toBlobs(const Mat& stats, const Mat& centroids)
{
    vector<Blob> blobs;
    for (int i = 1; i < stats.rows; i++)
        blobs.push_back({ i, stats.at<int>(i, CC_STAT_AREA),
                          Rect(stats.at<int>(i, CC_STAT_LEFT), stats.at<int>(i, CC_STAT_TOP),
                               stats.at<int>(i, CC_STAT_WIDTH), stats.at<int>(i, CC_STAT_HEIGHT)),
                          Point2d(centroids.at<double>(i, 0), centroids.at<double>(i, 1)) });
    return blobs;
}

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat bin, labels, stats, centroids;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    int n = connectedComponentsWithStats(bin, labels, stats, centroids);

    vector<Blob> blobs = toBlobs(stats, centroids);
    cout << "blob " << blobs.size() << "개" << endl;
    sort(blobs.begin(), blobs.end(), [](const Blob& a, const Blob& b) { return a.area > b.area; });
    for (int i = 0; i < 3; i++)
        cout << format("  라벨 %2d: 면적 %d 폭 %d 높이 %d 중심 (%.1f, %.1f)", blobs[i].label, blobs[i].area,
                       blobs[i].rect.width, blobs[i].rect.height, blobs[i].centroid.x, blobs[i].centroid.y) << endl;

    // 라벨마다 다른 색으로 칠하기 (색표 + 픽셀 반복)
    RNG rng(12345);
    vector<Vec3b> palette(n);
    for (int i = 1; i < n; i++)
        palette[i] = Vec3b((uchar)rng.uniform(60, 256), (uchar)rng.uniform(60, 256), (uchar)rng.uniform(60, 256));
    Mat color(labels.size(), CV_8UC3);
    for (int y = 0; y < labels.rows; y++)
        for (int x = 0; x < labels.cols; x++)
            color.at<Vec3b>(y, x) = palette[labels.at<int>(y, x)];
    cout << "color " << color.cols << "x" << color.rows << " " << typeToString(color.type()) << endl;
    imshow("blobs", color);
    waitKey(0);
    return 0;
}`;

  const EX_CC3 = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

struct Blob { int area; Rect rect; Point2d c; };

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat bin, labels, stats, centroids;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    int n = connectedComponentsWithStats(bin, labels, stats, centroids);

    // ① 면적 필터: 1000 이상만 남긴다
    vector<Blob> parts;
    for (int i = 1; i < n; i++)
    {
        int area = stats.at<int>(i, CC_STAT_AREA);
        if (area < 1000) continue;
        parts.push_back({ area, Rect(stats.at<int>(i, CC_STAT_LEFT), stats.at<int>(i, CC_STAT_TOP),
                                     stats.at<int>(i, CC_STAT_WIDTH), stats.at<int>(i, CC_STAT_HEIGHT)),
                          Point2d(centroids.at<double>(i, 0), centroids.at<double>(i, 1)) });
    }
    // ② 화면 순서로 번호: 위 줄(y 를 150 px 단위로 묶음) → 왼쪽부터
    sort(parts.begin(), parts.end(), [](const Blob& a, const Blob& b) {
        int ra = (int)(a.c.y / 150), rb = (int)(b.c.y / 150);
        return ra != rb ? ra < rb : a.c.x < b.c.x;
    });

    Mat view;
    cvtColor(img, view, COLOR_GRAY2BGR);
    for (size_t i = 0; i < parts.size(); i++)
    {
        string no = to_string(i + 1);
        rectangle(view, parts[i].rect, Scalar(0, 255, 0), 2);
        putText(view, no, Point(parts[i].rect.x, parts[i].rect.y - 6), FONT_HERSHEY_SIMPLEX, 0.6, Scalar(0, 0, 255), 2);
        cout << format("  %2s: 중심 (%5.1f, %5.1f) 면적 %d", no.c_str(), parts[i].c.x, parts[i].c.y, parts[i].area) << endl;
    }
    cout << "번호를 붙인 물체 " << parts.size() << "개, 걸러낸 블롭 " << n - 1 - (int)parts.size() << "개" << endl;

    int baseLine = 0;
    Size ts = getTextSize("12", FONT_HERSHEY_SIMPLEX, 0.6, 2, &baseLine);
    cout << "글자 '12' 크기 " << ts.width << "x" << ts.height << endl;     // baseLine = 글자 아래로 내려가는 길이
    imshow("numbered", view);
    waitKey(0);
    return 0;
}`;

  const EX_WS = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat bin, l0;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    cout << "그냥 세면 " << connectedComponents(bin, l0) - 1 << "개 (실제 13개)" << endl;

    // ① 구멍을 메운다 — 링 모양 그대로면 거리 변환의 봉우리가 고리처럼 생겨 쪼개진다
    vector<vector<Point>> outer;
    findContours(bin, outer, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    Mat solid = Mat::zeros(bin.size(), CV_8UC1);
    drawContours(solid, outer, -1, Scalar(255), FILLED);

    // ② 거리 변환: 각 흰 픽셀에서 가장 가까운 검은 픽셀까지의 거리 (CV_32F)
    Mat dist;
    distanceTransform(solid, dist, DIST_L2, DIST_MASK_5);
    double dmax;
    minMaxLoc(dist, nullptr, &dmax);
    cout << format("거리 최대 %.1f px", dmax) << endl;

    // ③ 0~1 로 정규화하고 봉우리만 남긴다 (임계값은 반드시 실험으로!)
    Mat distN;
    normalize(dist, distN, 0, 1, NORM_MINMAX);
    for (double th : { 0.20, 0.30, 0.40, 0.50 })
    {
        Mat pk, pk8, tmp;
        threshold(distN, pk, th, 1.0, THRESH_BINARY);
        pk.convertTo(pk8, CV_8U, 255);
        cout << format("  임계값 %.2f → 씨앗 %d개", th, connectedComponents(pk8, tmp) - 1) << endl;
    }
    Mat peak, fg, seeds;
    threshold(distN, peak, 0.35, 1.0, THRESH_BINARY);
    peak.convertTo(fg, CV_8U, 255);
    int n = connectedComponents(fg, seeds);
    cout << "씨앗 " << n - 1 << "개" << endl;

    // ④ 마커: 씨앗 라벨 + 1 (배경 1, 씨앗 2~), 미지 영역은 0
    Mat bg, unknown, markers;
    dilate(solid, bg, getStructuringElement(MORPH_RECT, Size(5, 5)), Point(-1, -1), 2);
    subtract(bg, fg, unknown);
    seeds.convertTo(markers, CV_32S, 1, 1);
    markers.setTo(Scalar(0), unknown);

    // ⑤ watershed — 입력 이미지는 3채널(CV_8UC3)이어야 한다
    Mat bgr;
    cvtColor(img, bgr, COLOR_GRAY2BGR);
    watershed(bgr, markers);
    double mn, mx;
    minMaxLoc(markers, &mn, &mx);
    cout << "watershed 후 라벨 " << mn << " ~ " << mx << " → 물체 " << (int)mx - 1 << "개" << endl;

    Mat edge = (markers == -1);            // 경계선 마스크 (CV_8U, 0/255)
    cout << "경계(-1) 픽셀 " << countNonZero(edge) << "개" << endl;
    bgr.setTo(Scalar(0, 0, 255), edge);
    imshow("watershed", bgr);
    waitKey(0);
    return 0;
}`;

  const EX_PIPE = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

// 개수 세기 파이프라인: 읽기 → 이진화 → 라벨링 → 면적 필터
int countParts(const string& path, bool darkObject, int minArea)
{
    Mat img = imread(path, IMREAD_GRAYSCALE);
    if (img.empty()) { cout << "[경고] " << path << " 를 읽을 수 없습니다" << endl; return 0; }

    Mat bin, labels, stats, centroids;
    int mode = darkObject ? THRESH_BINARY_INV : THRESH_BINARY;
    threshold(img, bin, 0, 255, mode | THRESH_OTSU);
    int n = connectedComponentsWithStats(bin, labels, stats, centroids);

    int count = 0;
    for (int i = 1; i < n; i++)                 // 0 = 배경
        if (stats.at<int>(i, CC_STAT_AREA) >= minArea) count++;
    return count;
}

int main()
{
    int a = countParts("images/washers.png", true, 500);
    int b = countParts("images/coins_parts.png", false, 500);
    int c = countParts("images/flange.png", false, 500);
    cout << "washers.png     → " << a << "개 (실제 13 — 닿은 쌍 2개 때문에 부족)" << endl;
    cout << "coins_parts.png → " << b << "개 (실제 12)" << endl;
    cout << "flange.png      → " << c << "개 (실제 1)" << endl;

    int d = countParts("images/none.png", false, 500);     // 없는 파일 → 경고 후 0
    cout << "none.png        → " << d << "개" << endl;
    return 0;
}`;

  const EX_LOCAL = `// 🖥 로컬 전용: 트랙바로 최소 면적을 조절하며 개수 보기 (브라우저에서는 트랙바가 동작하지 않음)
#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

Mat g_img, g_stats;
int g_n = 0;
int g_minArea = 500;

void redraw(int, void*)
{
    Mat view;
    cvtColor(g_img, view, COLOR_GRAY2BGR);
    int count = 0;
    for (int i = 1; i < g_n; i++)
    {
        if (g_stats.at<int>(i, CC_STAT_AREA) < g_minArea) continue;
        Rect r(g_stats.at<int>(i, CC_STAT_LEFT), g_stats.at<int>(i, CC_STAT_TOP),
               g_stats.at<int>(i, CC_STAT_WIDTH), g_stats.at<int>(i, CC_STAT_HEIGHT));
        rectangle(view, r, Scalar(0, 255, 0), 2);
        count++;
    }
    putText(view, format("count = %d (minArea %d)", count, g_minArea), Point(10, 30),
            FONT_HERSHEY_SIMPLEX, 0.8, Scalar(0, 0, 255), 2);
    imshow("count", view);
}

int main()
{
    g_img = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat bin, labels, centroids;
    threshold(g_img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    g_n = connectedComponentsWithStats(bin, labels, g_stats, centroids);

    namedWindow("count");
    createTrackbar("minArea", "count", &g_minArea, 10000, redraw);
    redraw(0, nullptr);
    while (waitKey(30) != 27) {}        // Esc 로 종료
    return 0;
}`;

  const QUIZ3 = [
    { q: '<code>connectedComponents</code> 가 돌려주는 값이 <b>12</b> 일 때 물체 개수는?', options: ['12개', '11개', '13개', '알 수 없다'], answer: 1,
      explain: '<b>라벨 0 은 배경</b>이므로 물체는 <code>n - 1</code> = 11개입니다. <code>stats</code> 도 0행이 배경이라 반복을 <code>i = 1</code> 부터 시작합니다.' },
    { q: '<code>stats</code> Mat 의 한 행에 들어 있는 값의 순서는?', options: ['AREA, LEFT, TOP, WIDTH, HEIGHT', 'LEFT, TOP, WIDTH, HEIGHT, AREA', 'x, y, w, h, 중심', 'WIDTH, HEIGHT, AREA, x, y'], answer: 1,
      explain: '<code>CC_STAT_LEFT(0) · CC_STAT_TOP(1) · CC_STAT_WIDTH(2) · CC_STAT_HEIGHT(3) · CC_STAT_AREA(4)</code> 순서이고 형식은 <b>CV_32S</b> 라서 <code>stats.at&lt;int&gt;(i, CC_STAT_AREA)</code> 로 읽습니다. 중심 좌표는 따로 <code>centroids</code>(CV_64F) 에 있어 <code>at&lt;double&gt;</code> 입니다.' },
    { q: '대각선으로만 닿아 있는 두 픽셀을 <b>한 덩어리</b>로 보려면?', options: ['connectivity = 4', 'connectivity = 8', '거리 변환을 먼저 한다', '모폴로지 열기를 한다'], answer: 1,
      explain: '<b>8연결</b>은 대각선 이웃까지 연결로 보므로 하나가 되고, 4연결은 상하좌우만 보므로 둘이 됩니다. OpenCV 의 기본값은 <b>8</b> 입니다 — 얇은 대각선 결함을 셀 때 결과가 달라지니 주의하세요.' },
    { q: '닿아 있는 두 원을 분리하려고 <b>거리 변환</b>을 쓰는 이유는?', options: ['잡음을 없애 준다', '각 물체의 중심이 가장 큰 값이 되어 봉우리가 물체마다 하나씩 생긴다', '경계선이 진해진다', '면적을 정확히 계산해 준다'], answer: 1,
      explain: '거리 변환은 각 흰 픽셀에서 <b>가장 가까운 검은 픽셀까지의 거리</b>입니다. 물체 중심이 가장 멀리 있으므로 값이 최대가 되고, 두 물체가 닿은 <b>이음목은 값이 작습니다</b>. 그래서 봉우리만 남기면 물체마다 씨앗 하나를 얻습니다.' },
    { q: '<code>watershed</code> 의 <b>markers</b> Mat 에 대한 설명으로 옳은 것은?', options: ['CV_8UC1 이고 배경은 255', 'CV_32SC1 이고 미지 영역은 0, 결과에서 경계는 −1', 'CV_32FC1 이고 씨앗은 1.0', '입력 이미지와 같은 3채널'], answer: 1,
      explain: '마커는 <b>CV_32SC1</b>(int) 입니다. 확실한 배경 · 각 씨앗에 1 이상의 서로 다른 번호를 주고 <b>모르는 영역은 0</b> 으로 둡니다. watershed 가 0 인 곳을 채우고 라벨이 만나는 선을 <b>−1</b> 로 표시합니다. 입력 이미지는 <b>CV_8UC3</b> 이어야 합니다.' }
  ];

  CV_COURSE.addChapter({
    id: 'cv12', no: '12', title: '윤곽선과 도형 분석', subtitle: 'findContours · 계층 · 모멘트 · approxPolyDP · 볼록 껍질 · 연결 요소 · watershed',
    summary: '이진화한 영상에서 <b>물체의 경계(윤곽선)</b>를 <code>vector&lt;vector&lt;Point&gt;&gt;</code> 로 받아 개수를 세고, 면적 · 둘레 · 중심 · 꼭짓점 수 · 원형도 · 볼록성 같은 <b>도형 특성</b>을 <code>struct</code> 에 담아 <code>std::sort</code> 로 정렬하며 부품을 분류합니다. 마지막으로 <b>연결 요소 라벨링</b>과 <b>거리 변환 + watershed</b> 로 서로 닿아 있는 물체까지 분리해 정확한 개수를 세는 파이프라인을 함수로 완성합니다.',
    goals: ['findContours 의 검색 모드(RETR_*) · 근사 방법(CHAIN_APPROX_*)을 구분해 쓰고 hierarchy(Vec4i)로 구멍 개수를 셀 수 있다',
      'contourArea · arcLength · boundingRect · moments · minAreaRect · minEnclosingCircle · fitEllipse 로 도형을 측정할 수 있다',
      'approxPolyDP 꼭짓점 수 · 원형도 · 볼록성(convexHull · convexityDefects) · matchShapes 로 부품을 분류할 수 있다',
      'connectedComponentsWithStats 로 라벨링하고, distanceTransform + watershed 로 닿아 있는 물체를 분리할 수 있다'],
    sections: [
      // ============================================================ 교시 1
      {
        id: 'cv12-1', title: '윤곽선 찾기와 계층 구조', minutes: 50,
        goals: ['윤곽선이 무엇이고 어떤 입력이 필요한지 안다', 'RETR_* 4가지와 CHAIN_APPROX_SIMPLE/NONE 의 차이를 설명할 수 있다', 'hierarchy(Vec4i)로 구멍 개수를 세고 struct + std::sort 로 면적 순으로 정렬할 수 있다'],
        flow: [['도입: 개수를 세려면', 5], ['findContours 와 모드', 15], ['계층 · 측정 · 정렬', 20], ['정리 · 퀴즈', 10]],
        content: [
          { type: 'h', text: '물체를 "세려면" 경계를 알아야 한다' },
          { type: 'p', html: '07차시에서 이진화를 배웠습니다. 흰색 덩어리가 물체라는 것은 알지만, <b>몇 개인지 · 각각 얼마나 큰지 · 어떤 모양인지</b>는 아직 모릅니다. <b>윤곽선(Contour)</b>은 흰 영역의 <b>경계 픽셀을 순서대로 모은 점 목록</b>입니다. C++ 에서는 윤곽 하나가 <code>vector&lt;Point&gt;</code>, 여러 개가 <code>vector&lt;vector&lt;Point&gt;&gt;</code> 입니다. 점 목록이 손에 들어오면 면적 · 둘레 · 중심 · 꼭짓점 수 같은 값을 모두 계산할 수 있습니다. (Python: <code>contours, hierarchy = cv2.findContours(bin, mode, method)</code>)' },
          { type: 'figure', html: FIG_CONTOUR, caption: '그림 1. 윤곽선 = 경계를 따라 모은 점 목록. 윤곽 하나 = vector&lt;Point&gt; 하나이므로 결과는 vector&lt;vector&lt;Point&gt;&gt; 이다' },
          { type: 'code', title: '예제 1: findContours 기본 — 찾고, 재고, 그리기', code: EX_FIND,
            desc: '<code>findContours(bin, contours, hierarchy, mode, method)</code> 가 기본형입니다. 결과를 담을 <code>vector</code> 를 먼저 만들어 <b>참조로 넘기면 함수가 채워 줍니다</b>. 플랜지는 밝은 부품이므로 <code>THRESH_BINARY | THRESH_OTSU</code> 로 이진화했고, <code>RETR_EXTERNAL</code> 이라 <b>바깥 윤곽 1개</b>만 나옵니다. 점 484개로 면적 90318 px², 둘레 1124.0 px 을 얻었습니다(반지름 170 px 원의 면적 π·170² ≈ 90792 와 거의 같습니다). <code>const vector&lt;Point&gt;&amp; c = contours[0];</code> 처럼 <b>const 참조</b>로 받으면 점 배열을 복사하지 않습니다.',
            expect: 'Otsu 임계값 104\n윤곽 1개\n점 484개, 면적 90318, 둘레 1124.0\nboundingRect [340 x 340 from (152, 68)]' },
          { type: 'callout', kind: 'warn', title: '입력은 반드시 1채널 이진 이미지', html: '<code>findContours</code> 는 <b>CV_8UC1</b> 이미지의 <b>0 이 아닌 픽셀</b>을 물체로 봅니다. 컬러를 그대로 넣으면 <code>cv::Exception</code> 이 납니다. 또한 <b>물체가 흰색</b>이어야 하므로 백라이트 영상(부품이 어두움)은 <code>THRESH_BINARY_INV</code> 로 반전해야 합니다 — 반대로 하면 배경 전체가 하나의 거대한 윤곽으로 잡힙니다. (OpenCV 3.2 이후로는 입력 이미지를 망가뜨리지 않으므로 <code>clone()</code> 을 넘길 필요가 없습니다.)' },
          { type: 'h', text: '어디까지 찾을까 · 점을 얼마나 남길까' },
          { type: 'figure', html: FIG_HIER, caption: '그림 2. 검색 모드와 계층 구조 — hierarchy[i][3](parent) ≥ 0 인 윤곽이 구멍이다' },
          { type: 'table', head: ['mode', '찾는 범위', '계층', '쓰는 곳'], rows: [
            ['<code>RETR_EXTERNAL</code>', '가장 바깥 윤곽만', '형제 관계만', '물체 개수 세기 (구멍 무시)'],
            ['<code>RETR_LIST</code>', '전부', '포함 관계 없음 (parent = −1)', '모든 경계가 필요하고 포함 관계는 무관할 때'],
            ['<code>RETR_CCOMP</code>', '전부', '2단 (바깥 / 구멍)', '<b>구멍 개수 검사</b> — 가장 실용적'],
            ['<code>RETR_TREE</code>', '전부', '완전한 트리', '구멍 안에 또 물체가 있는 복잡한 구조']
          ], caption: '표 1. 네 가지 검색 모드 — 결과 hierarchy 는 윤곽마다 Vec4i [next, prev, child, parent]' },
          { type: 'code', title: '예제 2: 모드에 따라 결과가 달라진다', code: EX_MODES,
            desc: '플랜지는 바깥 1개 + 구멍 7개 = 윤곽 8개입니다. <code>RETR_EXTERNAL</code> 만 1개이고 나머지는 모두 8개인데, <b>parent 가 채워지는지</b>가 다릅니다 — <code>RETR_LIST</code> 는 8개 모두 parent = −1 입니다. <code>count_if</code> + 람다로 조건에 맞는 원소 수를 한 줄에 셉니다. 뒤쪽은 점 개수 비교 — <code>SIMPLE</code> 484점 vs <code>NONE</code> 960점인데 <b>면적은 똑같습니다</b>. hierarchy 가 필요 없으면 인수 4개짜리 <code>findContours(bin, cs, mode, method)</code> 를 씁니다.',
            expect: 'RETR_EXTERNAL: 윤곽 1개, parent 가 있는 윤곽 0개\nRETR_LIST    : 윤곽 8개, parent 가 있는 윤곽 0개\nRETR_CCOMP   : 윤곽 8개, parent 가 있는 윤곽 7개\nRETR_TREE    : 윤곽 8개, parent 가 있는 윤곽 7개\nSIMPLE 점 484개 / NONE 점 960개\n면적은 그대로: 90318 vs 90318' },
          { type: 'image', src: 'images/flange.png', caption: '플랜지 — 중앙 보어 1개 + 볼트 구멍 6개 = 구멍 7개 (정답)', width: 400 },
          { type: 'code', title: '예제 3: 계층으로 구멍 7개 세기', code: EX_HIER,
            desc: '<code>hi[k]</code> 는 <code>Vec4i</code> 이므로 <code>hi[k][0]</code>~<code>hi[k][3]</code> 이 차례로 <b>next · prev · child · parent</b> 입니다. <code>hi[k][3] == -1</code> 이면 가장 바깥, 0 이상이면 그 번호의 윤곽에 감싸인 <b>구멍</b>입니다. 결과를 보면 [0] 이 바깥(면적 90318, child 1), 나머지 7개가 구멍(parent 0)입니다. 면적 약 7286 인 것이 중앙 보어(r = 48 → π·48² ≈ 7238)이고 나머지 6개는 볼트 구멍(r ≈ 15)입니다. 구멍이 6개나 8개로 나오면 불량 판정에 쓸 수 있습니다.',
            expect: '전체 윤곽 8개, 구멍 7개\n  [0] 점 484개 면적  90318 parent -1 child 1\n  [1] 점  44개 면적    758 parent 0 child -1\n  [2] 점  48개 면적    751 parent 0 child -1\n  [3] 점  40개 면적    757 parent 0 child -1\n  [4] 점  40개 면적    739 parent 0 child -1\n  [5] 점 136개 면적   7286 parent 0 child -1\n  [6] 점  48개 면적    750 parent 0 child -1\n  [7] 점  40개 면적    740 parent 0 child -1' },
          { type: 'callout', kind: 'tip', title: '[3] 대신 이름을 쓰자', html: '<code>hi[k][3]</code> 은 읽는 사람이 외워야 합니다. 파일 위에 <code>enum { NEXT = 0, PREV = 1, CHILD = 2, PARENT = 3 };</code> 을 두고 <code>hi[k][PARENT] &gt;= 0</code> 으로 쓰면 코드가 스스로 설명합니다. 이런 “마법 숫자 없애기”가 C++ 코드 리뷰의 단골 지적입니다.' },
          { type: 'code', title: '예제 4: 면적으로 정렬하기 (struct + std::sort) — 와셔 영상', code: EX_SORT,
            desc: '<code>images/washers.png</code> 는 와셔 6 · 너트 4 · 볼트 3 = <b>13개</b> 부품인데, 바깥 윤곽은 <b>11개</b>만 나옵니다 — <b>서로 닿아 있는 2쌍</b>(왼쪽 위 와셔 W1+W2, 오른쪽 아래 볼트 B3+너트 N4)이 하나로 합쳐졌기 때문입니다(면적 10861 과 7203 이 그 둘). 구멍은 와셔 6 + 너트 4 = 10개로 정답과 맞습니다. 윤곽 요약을 <code>struct Outer</code> 에 담고 <code>std::sort</code> 에 <b>람다</b> <code>[](const Outer&amp; a, const Outer&amp; b) { return a.area &gt; b.area; }</code> 를 주면 면적 내림차순이 됩니다. 원래 번호 <code>idx</code> 를 함께 넣어 두었기 때문에 정렬 뒤에도 <code>cs[o.idx]</code> 로 윤곽을 찾아갈 수 있습니다.',
            expect: '전체 윤곽 21개\n바깥 11개, 구멍 10개\n  [18] 면적   10861 둘레  516.0\n  [ 0] 면적    7203 둘레  650.5\n  [14] 면적    5462 둘레  277.4\n  [10] 면적    4004 둘레  238.8\n  [16] 면적    3964 둘레  238.2' },
          { type: 'callout', kind: 'tip', title: 'contourArea 는 픽셀 개수가 아니다', html: '<code>contourArea</code> 는 점들이 만드는 <b>다각형 면적</b>이므로 ① 내부 구멍이 빠지지 않고 ② 픽셀 개수(<code>connectedComponentsWithStats</code> 의 AREA)와 조금 다를 수 있습니다. 실제 재료 면적을 원하면 <b>바깥 면적 − 구멍 면적</b>을 직접 계산하세요. <code>contourArea(c, true)</code> 처럼 두 번째 인수를 true 로 주면 <b>부호 있는 면적</b>(점의 방향에 따라 ±)이 나옵니다.' },
          { type: 'callout', kind: 'field', title: '현장 이야기: 개수 세기의 3단 방어', html: '실제 검사기는 ① <b>면적 필터</b>로 잡음 · 먼지 제거 ② <b>구멍 개수 · 모양</b>으로 종류 확인 ③ <b>닿은 물체 분리</b>(watershed)의 3단으로 만듭니다. "윤곽 개수 = 부품 개수" 라고 믿고 만든 프로그램은 부품이 한 번 겹치는 날 오답을 냅니다 — 예제 4 의 11 vs 13 이 바로 그 상황입니다.' },
          { type: 'callout', kind: 'vs', title: 'Visual Studio 에서 vector&lt;vector&lt;Point&gt;&gt; 들여다보기', html: '중단점에서 조사식(Watch) 창에 <code>contours</code> 를 넣으면 <code>[size]</code> 와 각 원소가 펼쳐집니다. 윤곽 하나의 점이 수백 개라 펼치기 불편하면 <code>contours[0].size()</code> · <code>contours[0][0]</code> 처럼 식을 직접 적으세요. <b>Release 빌드</b>에서는 <code>contours[20]</code> 처럼 범위를 넘어도 검사하지 않으므로, 개발 중에는 <code>contours.at(k)</code> 로 쓰면 범위를 넘을 때 <code>std::out_of_range</code> 예외로 바로 알려 줍니다.' }
        ],
        practice: [
          {
            title: '부품 12개의 윤곽선 찾기', level: 1,
            desc: '<code>images/coins_parts.png</code>(어두운 배경 위 밝은 원형 부품 12개)에서 윤곽선을 찾아 <b>개수 · 가장 큰 면적 · 가장 작은 면적</b>을 출력하고, 모든 윤곽을 초록으로 그려 보세요.',
            hint: '부품이 <b>밝으므로</b> <code>THRESH_BINARY | THRESH_OTSU</code> 입니다. 최대 · 최소는 <code>&lt;algorithm&gt;</code> 의 <code>minmax_element</code> 에 “면적으로 비교하는” 람다를 주면 한 번에 얻습니다: <code>auto mm = minmax_element(cs.begin(), cs.end(), byArea);</code> → <code>*mm.first</code> 가 최소, <code>*mm.second</code> 가 최대 윤곽.',
            expect: '윤곽 12개\n가장 큰 면적 3524\n가장 작은 면적 1188',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    Mat bin;
    // TODO: 부품이 밝은지 어두운지 보고 이진화 종류를 확인하세요
    threshold(img, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);

    vector<vector<Point>> cs;
    // TODO: findContours 로 바깥 윤곽을 찾고 개수 · 최대 · 최소 면적을 출력하세요

    imshow("bin", bin);
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    Mat bin;
    threshold(img, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);

    vector<vector<Point>> cs;
    findContours(bin, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    cout << "윤곽 " << cs.size() << "개" << endl;

    auto byArea = [](const vector<Point>& a, const vector<Point>& b) { return contourArea(a) < contourArea(b); };
    auto mm = minmax_element(cs.begin(), cs.end(), byArea);
    cout << format("가장 큰 면적 %.0f", contourArea(*mm.second)) << endl;
    cout << format("가장 작은 면적 %.0f", contourArea(*mm.first)) << endl;

    Mat view;
    cvtColor(img, view, COLOR_GRAY2BGR);
    drawContours(view, cs, -1, Scalar(0, 255, 0), 2);
    imshow("contours", view);
    waitKey(0);
    return 0;
}`
          },
          {
            title: '볼트 구멍 6개만 골라내기', level: 2,
            desc: '<code>images/flange.png</code> 에서 <b>볼트 구멍 6개</b>(면적 약 750)만 골라 중심 좌표를 출력하세요. 중앙 보어(면적 약 7286)와 바깥 윤곽은 제외합니다. 중심은 <code>moments</code> 의 <code>m10/m00</code>, <code>m01/m00</code> 으로 구해 <code>vector&lt;Point2d&gt;</code> 에 모으고, <b>y → x 순서로 정렬</b>해 출력한 뒤 <code>circle</code> 로 표시하세요.',
            hint: '<code>RETR_CCOMP</code> 로 찾은 뒤 조건 두 개를 겁니다: <code>hi[k][3] &gt;= 0</code>(구멍) 이고 <code>면적 &lt; 2000</code>(볼트 구멍). 정렬 람다: <code>[](const Point2d&amp; a, const Point2d&amp; b) { return a.y != b.y ? a.y &lt; b.y : a.x &lt; b.x; }</code>',
            expect: '볼트 구멍 6개\n  중심 (291.5, 124.0)\n  중심 (405.4, 154.6)\n  중심 (208.0, 207.5)\n  중심 (436.0, 268.5)\n  중심 (238.6, 321.4)\n  중심 (352.5, 351.9)',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/flange.png", IMREAD_GRAYSCALE);
    Mat bin;
    threshold(img, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    vector<vector<Point>> cs;
    vector<Vec4i> hi;
    findContours(bin, cs, hi, RETR_CCOMP, CHAIN_APPROX_SIMPLE);
    cout << "전체 윤곽 " << cs.size() << "개" << endl;

    vector<Point2d> holes;
    // TODO: parent >= 0 이고 면적이 2000 보다 작은 윤곽의 중심을 holes 에 넣으세요
    // TODO: y → x 순서로 정렬해 출력하세요

    imshow("bin", bin);
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/flange.png", IMREAD_GRAYSCALE);
    Mat bin;
    threshold(img, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    vector<vector<Point>> cs;
    vector<Vec4i> hi;
    findContours(bin, cs, hi, RETR_CCOMP, CHAIN_APPROX_SIMPLE);

    vector<Point2d> holes;
    for (size_t k = 0; k < cs.size(); k++)
    {
        if (hi[k][3] < 0) continue;                 // 바깥 윤곽 제외
        if (contourArea(cs[k]) >= 2000) continue;   // 중앙 보어 제외
        Moments m = moments(cs[k]);
        holes.push_back(Point2d(m.m10 / m.m00, m.m01 / m.m00));
    }
    sort(holes.begin(), holes.end(), [](const Point2d& a, const Point2d& b) {
        return a.y != b.y ? a.y < b.y : a.x < b.x;
    });
    cout << "볼트 구멍 " << holes.size() << "개" << endl;

    Mat view;
    cvtColor(img, view, COLOR_GRAY2BGR);
    for (const Point2d& h : holes)
    {
        cout << format("  중심 (%.1f, %.1f)", h.x, h.y) << endl;
        circle(view, Point(cvRound(h.x), cvRound(h.y)), 20, Scalar(0, 0, 255), 2);
    }
    imshow("holes", view);
    waitKey(0);
    return 0;
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: '윤곽선과 도형 분석 ①', subtitle: '윤곽선 찾기와 계층 구조', notes: '<p>💬 “이진화한 영상에서 부품이 몇 개인지 어떻게 알까요?” — 흰 덩어리를 세면 된다. 그런데 “덩어리”를 프로그램이 알려면 경계를 따라가야 한다는 흐름으로 윤곽선을 도입합니다. (3분)</p>' },
          { layout: 'diagram', title: '윤곽선 = 경계 점 목록', html: FIG_CONTOUR, caption: '윤곽 하나 = vector<Point> 하나 → 결과는 vector<vector<Point>>', notes: '<p>격자 그림에서 경계를 손으로 따라가 보게 합니다. 💬 “윤곽선이 점 목록이라면 무엇을 계산할 수 있을까요?” — 면적 · 둘레 · 중심 · 꼭짓점 수. <code>vector&lt;vector&lt;Point&gt;&gt;</code> 라는 2중 vector 형태를 칠판에 쓰고, <code>contours[i][j]</code> 가 “i 번째 윤곽의 j 번째 점”임을 확인합니다. (5분)</p>' },
          { layout: 'code', title: 'findContours 기본형', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;
int main()
{
    Mat img = imread("images/flange.png", IMREAD_GRAYSCALE), bin;
    threshold(img, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);

    vector<vector<Point>> cs;
    vector<Vec4i> hi;
    findContours(bin, cs, hi, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    cout << "윤곽 " << cs.size() << "개, 점 " << cs[0].size() << "개" << endl;
    cout << format("면적 %.0f 둘레 %.1f", contourArea(cs[0]), arcLength(cs[0], true)) << endl;

    Mat view;
    cvtColor(img, view, COLOR_GRAY2BGR);
    drawContours(view, cs, -1, Scalar(0, 255, 0), 2);
    imshow("contour", view);
    waitKey(0);
    return 0;
}`, points: ['입력은 <b>1채널 이진</b> 이미지 (물체 = 흰색)', '결과 vector 를 만들어 <b>참조로 넘기면</b> 채워 준다', '<code>drawContours(..., -1, ...)</code> = 전부 그리기', '<code>arcLength(c, true)</code> 의 true = 닫힌 곡선'], notes: '<p>실행해 초록 윤곽을 확인합니다. 💬 “면적 90318 이 맞는 값일까?” — 반지름 170 원의 면적 π·170²≈90792 와 비교하게 하면 검산 습관이 생깁니다. <code>vector</code> 를 미리 만들어 넘기는 C++ 스타일(출력 인수)을 Python 의 반환값 방식과 비교합니다. (6분)</p>' },
          { layout: 'diagram', title: '계층: 누가 누구 안에 있나', html: FIG_HIER, caption: 'hierarchy[i] = [next, prev, child, parent] — parent ≥ 0 이면 구멍', notes: '<p>네 모드를 한 줄씩 읽고, 실무에서는 <b>RETR_EXTERNAL(개수)</b> 과 <b>RETR_CCOMP(구멍)</b> 두 개를 주로 쓴다고 정리합니다. Vec4i 의 네 칸을 칠판에 그리고 [3] = parent 를 강조. 💬 “구멍이 7개가 아니라 6개면?” — 가공 누락 불량. (5분)</p>' },
          { layout: 'code', title: '구멍 개수 세기', code: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;
int main()
{
    Mat img = imread("images/flange.png", IMREAD_GRAYSCALE), bin;
    threshold(img, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    vector<vector<Point>> cs;
    vector<Vec4i> hi;
    findContours(bin, cs, hi, RETR_CCOMP, CHAIN_APPROX_SIMPLE);

    long holes = count_if(hi.begin(), hi.end(),
                          [](const Vec4i& h) { return h[3] >= 0; });
    cout << "전체 " << cs.size() << "개, 구멍 " << holes << "개" << endl;
    for (size_t k = 0; k < cs.size(); k++)
        cout << format("[%d] 면적 %6.0f parent %d", (int)k, contourArea(cs[k]), hi[k][3]) << endl;
    return 0;
}`, points: ['<code>hi[k][3] == -1</code> → 가장 바깥', '<code>hi[k][3] &gt;= 0</code> → <b>구멍</b>', '<code>count_if</code> + 람다로 한 줄에 세기', '구멍 7개 = 보어 1(≈7286) + 볼트 6(≈750)'], notes: '<p>출력의 parent 열을 손으로 짚으며 읽습니다. 면적으로 보어와 볼트 구멍을 구분할 수 있다는 점(7286 vs 750)이 실습의 힌트입니다. 람다가 낯선 학생에게는 “이름 없는 작은 함수”라고 설명하세요. (6분)</p>' },
          { layout: 'table', title: 'SIMPLE vs NONE · 모드별 결과 (플랜지)', head: ['', '윤곽 수', 'parent ≥ 0', '비고'], rows: [
            ['<code>RETR_EXTERNAL</code>', '1', '0', '바깥만'],
            ['<code>RETR_LIST</code>', '8', '0', '포함 관계 없음'],
            ['<code>RETR_CCOMP</code>', '8', '7', '구멍 검사'],
            ['<code>RETR_TREE</code>', '8', '7', '완전한 트리'],
            ['<code>SIMPLE</code> / <code>NONE</code>', '484점 / 960점', '—', '면적은 같다']
          ], notes: '<p>예제 2 를 실행해 이 표를 학생이 직접 채우게 합니다. 💬 “LIST 와 CCOMP 의 윤곽 수가 같은데 무엇이 다른가?” — parent 가 채워지는지. SIMPLE 이 기본인 이유(메모리)도 짚습니다. (5분)</p>' },
          { layout: 'image', title: '문제: 닿아 있는 부품', src: 'images/washers.png', caption: '와셔 6 + 너트 4 + 볼트 3 = 13개인데 바깥 윤곽은 11개만 나온다', notes: '<p>💬 “부품이 13개인데 프로그램은 11개라고 합니다. 왜?” — 두 쌍이 닿아 있어 하나로 이어짐(왼쪽 위 와셔 2개, 오른쪽 아래 볼트+너트). 3교시에서 해결한다고 예고합니다. (3분)</p>' },
          { layout: 'code', title: '면적으로 정렬 (struct + sort + 람다)', code: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;
struct Outer { int idx; double area; };
int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE), bin;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    vector<vector<Point>> cs;
    vector<Vec4i> hi;
    findContours(bin, cs, hi, RETR_CCOMP, CHAIN_APPROX_SIMPLE);

    vector<Outer> outer;
    for (size_t k = 0; k < cs.size(); k++)
        if (hi[k][3] < 0) outer.push_back({ (int)k, contourArea(cs[k]) });
    sort(outer.begin(), outer.end(),
         [](const Outer& a, const Outer& b) { return a.area > b.area; });
    cout << "바깥 " << outer.size() << "개" << endl;
    for (int i = 0; i < 3; i++)
        cout << format("[%d] 면적 %.0f", outer[i].idx, outer[i].area) << endl;
    return 0;
}`, points: ['백라이트 영상 → <b>THRESH_BINARY_INV</b>', '바깥 11개 · 구멍 10개(와셔 6 + 너트 4)', '<code>idx</code> 를 함께 저장 → 정렬 뒤에도 <code>cs[idx]</code>'], notes: '<p>THRESH_BINARY_INV 를 THRESH_BINARY 로 바꿔 실행해 보게 합니다 — 배경이 하나의 거대한 윤곽으로 잡히는 실패를 직접 보면 잊지 않습니다. 람다의 <code>&gt;</code> 를 <code>&lt;</code> 로 바꾸면 오름차순. (7분)</p>' },
          { layout: 'two', title: '자주 하는 실수', left: { title: '입력', bullets: ['컬러를 그대로 넣음 → 예외', '물체가 검은데 <code>THRESH_BINARY</code> → 배경이 윤곽', '<code>Canny</code> 결과를 넣으면 경계가 <b>이중</b>으로 잡힘'] }, right: { title: '해석', bullets: ['<code>contourArea</code> ≠ 픽셀 개수 (다각형 면적)', '구멍은 면적에서 <b>빠지지 않는다</b>', '<code>RETR_LIST</code> 는 parent 가 전부 −1', '정렬 후 원래 번호를 잃어버림 → <code>idx</code> 저장'] }, notes: '<p>세 번째 항목(Canny 결과의 이중 윤곽)은 10차시와 연결됩니다. 윤곽선은 <b>이진 영역</b>에서, 에지는 <b>경계선 그림</b>이라는 차이를 정리합니다. (4분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '구멍(내부 윤곽)의 개수를 세는 조건은?', options: ['<code>RETR_EXTERNAL</code> + 전체 개수', '<code>RETR_LIST</code> + <code>hi[k][2] &gt;= 0</code>', '<code>RETR_CCOMP</code> + <code>hi[k][3] &gt;= 0</code>', '<code>RETR_TREE</code> + 점 개수'], answer: 2, explain: '<code>hi[k][3]</code> 이 parent 입니다. 감싸는 윤곽이 있으면 구멍입니다. RETR_LIST 는 포함 관계를 채우지 않습니다.', notes: '<p>정답 3번. Vec4i 의 순서 [next, prev, child, parent] 를 다시 외우게 합니다.</p>' },
          { layout: 'practice', title: '실습: 볼트 구멍 6개만', desc: '<p><code>images/flange.png</code> 에서 <b>볼트 구멍 6개</b>의 중심 좌표를 출력하세요.</p><ul><li><code>RETR_CCOMP</code> → <code>hi[k][3] &gt;= 0</code> (구멍)</li><li>면적 &lt; 2000 (중앙 보어 ≈7286 제외)</li><li>중심 = <code>m10/m00</code>, <code>m01/m00</code> → <code>vector&lt;Point2d&gt;</code></li><li>y → x 순서로 <code>sort</code></li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;
int main()
{
    Mat img = imread("images/flange.png", IMREAD_GRAYSCALE), bin;
    threshold(img, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    vector<vector<Point>> cs;
    vector<Vec4i> hi;
    findContours(bin, cs, hi, RETR_CCOMP, CHAIN_APPROX_SIMPLE);
    vector<Point2d> holes;
    // TODO: 구멍이면서 면적 2000 미만 → 중심을 holes 에
    // TODO: 정렬 후 출력
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;
int main()
{
    Mat img = imread("images/flange.png", IMREAD_GRAYSCALE), bin;
    threshold(img, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    vector<vector<Point>> cs;
    vector<Vec4i> hi;
    findContours(bin, cs, hi, RETR_CCOMP, CHAIN_APPROX_SIMPLE);
    vector<Point2d> holes;
    for (size_t k = 0; k < cs.size(); k++)
    {
        if (hi[k][3] < 0 || contourArea(cs[k]) >= 2000) continue;
        Moments m = moments(cs[k]);
        holes.push_back(Point2d(m.m10 / m.m00, m.m01 / m.m00));
    }
    sort(holes.begin(), holes.end(), [](const Point2d& a, const Point2d& b) { return a.y != b.y ? a.y < b.y : a.x < b.x; });
    for (const Point2d& h : holes) cout << format("(%.1f, %.1f)", h.x, h.y) << endl;
    return 0;
}`, notes: '<p>정답은 구멍 6개, 플랜지 중심 주위 원 위에 60° 간격으로 놓여 있습니다. 면적 조건을 빼면 7개가 나오는 것을 먼저 보여 주세요. 정렬 람다에서 <code>a.y != b.y</code> 비교를 빼면 어떻게 되는지도 물어봅니다. (8분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['윤곽선 = 이진 이미지 흰 영역의 <b>경계 점 목록</b> (<code>vector&lt;vector&lt;Point&gt;&gt;</code>)', '입력은 <b>1채널 이진</b>, 물체는 <b>흰색</b> (어두우면 <code>THRESH_BINARY_INV</code>)', '<code>RETR_EXTERNAL</code>(개수) · <code>RETR_CCOMP</code>(구멍, <code>hi[k][3] &gt;= 0</code>)', '<code>CHAIN_APPROX_SIMPLE</code> 로 점을 줄여도 면적 · 둘레는 그대로', '<code>struct</code> 에 담고 <code>sort</code> + 람다로 정렬 (원래 번호 <code>idx</code> 보관)', '다음 교시: 중심 · 회전 사각형 · 꼭짓점 수 · 원형도로 <b>도형 분류</b>'], notes: '<p>핵심 한 줄: “이진화 → 윤곽선 → 숫자”. 다음 교시에는 그 숫자로 부품 종류를 구분한다고 예고합니다. (2분)</p>' }
        ]
      },
      // ============================================================ 교시 2
      {
        id: 'cv12-2', title: '도형 특성으로 부품 분류하기', minutes: 50,
        goals: ['moments 로 면적과 중심을 구할 수 있다', 'boundingRect · minAreaRect · minEnclosingCircle · fitEllipse 를 구분해 쓸 수 있다', 'approxPolyDP 꼭짓점 수 · 원형도 · 볼록성 · matchShapes 로 부품을 분류하고 결과를 struct 로 정리할 수 있다'],
        flow: [['도입: 무엇으로 구분하나', 5], ['중심 · 외접 도형', 15], ['꼭짓점 · 원형도 · 볼록성 · 분류', 20], ['정리 · 퀴즈', 10]],
        content: [
          { type: 'h', text: '같은 개수, 다른 종류' },
          { type: 'p', html: '1교시에서 윤곽선을 찾고 면적 · 둘레를 얻었습니다. 그런데 현장에서 필요한 것은 보통 <b>"이게 볼트냐 너트냐 와셔냐"</b>, <b>"중심이 정확히 어디냐"</b>, <b>"몇 도 기울어졌냐"</b> 입니다. 윤곽선 하나에서 뽑을 수 있는 <b>도형 특성(shape feature)</b>을 정리해 봅시다.' },
          { type: 'figure', html: FIG_FIT, caption: '그림 3. 같은 윤곽선에 네 가지 도형을 맞춘 모습 — 목적에 따라 골라 쓴다' },
          { type: 'table', head: ['함수 (C++)', '돌려주는 것', '쓰는 곳'], rows: [
            ['<code>Moments m = moments(c)</code>', '<code>m.m00, m.m10, m.m01, m.mu11</code> …', '면적(m00) · <b>중심</b>(m10/m00, m01/m00) · 방향'],
            ['<code>Rect r = boundingRect(c)</code>', '<code>Rect</code> (축에 평행)', 'ROI 자르기 · 화면 표시 — 가장 빠름'],
            ['<code>RotatedRect rr = minAreaRect(c)</code>', '<code>center · size · angle</code>, <code>rr.points(pts)</code>', '<b>기울어진 물체</b>의 크기 · 각도 (칩 · 판)'],
            ['<code>minEnclosingCircle(c, center, radius)</code>', '<code>Point2f&amp;</code> · <code>float&amp;</code> 에 결과', '<b>원형 부품</b>의 지름 측정 · 최대 외경'],
            ['<code>RotatedRect el = fitEllipse(c)</code>', '타원 (<code>RotatedRect</code>)', '타원 맞춤 — 점이 <b>5개 이상</b> 필요'],
            ['<code>approxPolyDP(c, out, eps, true)</code>', '단순화된 <code>vector&lt;Point&gt;</code>', '<b>꼭짓점 수</b> → 도형 분류'],
            ['<code>convexHull(c, hull)</code>', '볼록 껍질 (점 또는 번호)', '볼록성(solidity) · <code>convexityDefects</code> 로 오목 결함'],
            ['<code>pointPolygonTest(c, p, true)</code>', '거리(안 +, 밖 −)', '점이 영역 안에 있나 · 경계까지 거리'],
            ['<code>matchShapes(c1, c2, CONTOURS_MATCH_I1, 0)</code>', '차이 점수 (0 = 같은 모양)', '회전 · 크기와 무관한 <b>모양 비교</b>']
          ], caption: '표 2. 윤곽선 하나에서 뽑는 도형 특성 (Python 도 이름이 같다: cv2.minAreaRect …)' },
          { type: 'callout', kind: 'more', title: '📘 OpenCV 5: 새 geometry 모듈', html: 'OpenCV 5 에서는 <code>convexHull</code> · <code>minAreaRect</code> · <code>fitEllipse</code> 같은 <b>계산 기하(computational geometry)</b> 함수들이 imgproc 에서 새 <b><code>geometry</code> 모듈</b>(헤더 <code>&lt;opencv2/geometry.hpp&gt;</code>)로 옮겨졌습니다. 4.x 의 calib3d 에 있던 <code>findHomography</code> 등도 이쪽으로 모였습니다. 하지만 <code>&lt;opencv2/opencv.hpp&gt;</code> 가 geometry 헤더를 포함하고 함수 이름도 그대로 <code>cv::</code> 안에 있으므로 <b>우리 코드는 한 글자도 바뀌지 않습니다</b>. 모듈별 헤더만 골라 include 하는 프로젝트라면 <code>#include &lt;opencv2/geometry.hpp&gt;</code> 를 추가하고, 링커 설정에 <code>opencv_geometry500.lib</code> 가 필요할 수 있다는 점(<code>opencv_world</code> 를 쓰면 무관)만 기억하세요.' },
          { type: 'code', title: '예제 1: 모멘트 중심과 외접 도형 (기울어진 칩)', code: EX_SHAPE1,
            desc: '<code>m00</code> 이 면적, <code>m10/m00</code> · <code>m01/m00</code> 이 <b>무게 중심</b>입니다(정답 (330.4, 245.2) 와 0.2 px 이내). <code>boundingRect</code> 는 축에 평행해서 면적이 33066 로 크게 잡히지만, <code>minAreaRect</code> 는 실제 몸체(170×110 = 18700)에 딱 맞고 <b>각도</b>까지 알려 줍니다 — 11차시의 회전 보정에 바로 쓸 수 있는 값입니다. <code>Point2f pts[4]; rr.points(pts);</code> 로 네 꼭짓점을 얻어 <code>line</code> 으로 이어 그립니다. <code>max_element</code> 에 면적 비교 람다를 주면 가장 큰 윤곽을 한 줄에 찾습니다.',
            expect: 'm00 18456\n모멘트 중심 (330.57, 245.25)\nboundingRect [198 x 167 from (232, 162)] 면적 33066\nminAreaRect 중심 (330.6, 245.3) 크기 170.3 x 110.4 각도 -23.50 면적 18795\n  꼭짓점 0: (274.5, 329.9)\n  꼭짓점 1: (230.5, 228.7)\n  꼭짓점 2: (386.7, 160.8)\n  꼭짓점 3: (430.7, 262.0)' },
          { type: 'callout', kind: 'warn', title: 'minAreaRect 의 angle 은 “부품 각도”가 아니다', html: '<code>RotatedRect::angle</code> 은 OpenCV 버전에 따라 범위 규칙이 바뀌어 왔고(예제의 −23.50° 처럼 음수로 나오는 규칙과 (0°, 90°] 규칙), <b>width 와 height 중 어느 쪽이 긴 변인지</b>에 따라 같은 물체가 다른 각도로 보고됩니다. 부품의 방향이 필요하면 ① <code>size.width &lt; size.height</code> 이면 두 값을 바꾸고 각도에 90° 를 더하는 식으로 <b>긴 변 기준으로 정규화</b>하거나 ② 모멘트의 <code>0.5 * atan2(2*mu11, mu20 - mu02)</code> 로 주축 각도를 구하세요. 0° 와 180° 구분은 1번 핀 점 같은 <b>비대칭 표시</b>로만 가능합니다.' },
          { type: 'code', title: '예제 2: 원형 부품 정밀 측정 (와셔 1개)', code: EX_SHAPE2,
            desc: '<code>images/washer_ring.png</code> 의 정답은 중심 (321.37, 238.82), 외경 반지름 150.6 px 입니다. <code>minEnclosingCircle(ring, center, radius)</code> 는 결과를 <b>참조 인수</b>(<code>Point2f&amp;</code>, <code>float&amp;</code>)로 돌려주는 C++ 스타일 함수입니다. <code>fitEllipse</code> 의 두 축 · <code>minAreaRect</code> 의 크기 · 등가 반지름 √(면적/π) 를 함께 비교해 보세요. <b>가장 바깥 점 기준</b>이 필요하면 minEnclosingCircle, <b>평균적인 윤곽</b>이 필요하면 fitEllipse 를 씁니다. <code>sort</code> 로 면적 내림차순 정렬해 <code>cs[0]</code> 을 쓰는 방식도 보여 줍니다.',
            expect: '면적 70846 중심 (321.25, 238.74)\nminAreaRect 300.0 x 300.0\nminEnclosingCircle 중심 (321.28, 238.70) 반지름 150.67\nfitEllipse 중심 (321.28, 238.72) 축 300.34 x 300.36\n등가 반지름 150.17 (정답 150.60)' },
          { type: 'h', text: '꼭짓점 몇 개? — approxPolyDP' },
          { type: 'figure', html: FIG_CIRC, caption: '그림 4. approxPolyDP 의 epsilon 과 원형도(circularity) 4πA/P² — 원은 1, 각진 도형은 작아진다' },
          { type: 'p', html: '<code>approxPolyDP(contour, approx, epsilon, closed)</code> 는 윤곽선을 <b>꼭짓점이 적은 다각형</b>으로 단순화합니다(Douglas-Peucker 알고리즘). <code>epsilon</code> 은 "원래 곡선에서 이만큼 벗어나도 된다" 는 허용 오차(px)인데, 물체 크기에 따라 달라야 하므로 보통 <b>둘레의 2~4%</b> 로 잡습니다: <code>approxPolyDP(c, approx, 0.03 * arcLength(c, true), true);</code>' },
          { type: 'code', title: '예제 3: 꼭짓점 수로 도형 분류하기', code: EX_SHAPE3,
            desc: '직접 그린 도형 4개(원 · 삼각형 · 사각형 · 육각형)에 <code>epsilon = 둘레 × 0.03</code> 을 적용합니다. 분석 결과를 <code>struct ShapeInfo</code> 에 모으고 <code>x</code> 로 정렬해 화면 왼쪽부터 출력합니다. <b>3 = 삼각형, 4 = 사각형, 5 = 오각형, 6 = 육각형, 7 이상 = 원</b> 이 기본 규칙이고, <code>switch</code> 를 쓰는 <code>shapeName</code> 함수로 분리했습니다. 원형도 <b>4πA/P²</b> 도 함께 보면 확실합니다 (이상적인 값은 1 · 0.605 · 0.785 · 0.907 — 픽셀 격자 때문에 조금 작게 나옵니다).',
            expect: '도형 4개\n  꼭짓점 8개 면적  9322 원형도 0.891 → 원\n  꼭짓점 3개 면적  7700 원형도 0.554 → 삼각형\n  꼭짓점 4개 면적 11881 원형도 0.785 → 사각형\n  꼭짓점 6개 면적  7708 원형도 0.826 → 육각형' },
          { type: 'callout', kind: 'warn', title: 'epsilon 을 고정 숫자로 쓰지 말 것', html: '<code>approxPolyDP(c, ap, 5, true)</code> 처럼 고정값을 쓰면 <b>큰 물체는 덜 단순화</b>되고(원이 20각형) <b>작은 물체는 뭉개집니다</b>(육각형이 삼각형). 반드시 <b>둘레 비율</b>로 주세요. 값이 너무 크면(&gt;0.05) 사각형이 삼각형으로, 너무 작으면(&lt;0.01) 육각형이 12각형으로 나옵니다 — 예제에서 0.01 · 0.03 · 0.08 로 바꿔 확인해 보세요.' },
          { type: 'code', title: '예제 4: 볼트 · 너트 · 와셔 자동 분류', code: EX_SHAPE4,
            desc: '<code>images/washers.png</code> 의 11개 덩어리를 <b>원형도 + 면적</b>으로 분류합니다. 분류 규칙을 <code>classify</code> 함수로 떼어 두면 규칙을 바꿀 때 한 곳만 고치면 됩니다. <code>map&lt;string, int&gt;</code> 는 처음 보는 키에 0 을 넣어 주므로 <code>count[kind]++</code> 한 줄로 종류별 개수를 셉니다. 결과: 와셔(원) 0.88~0.90, 육각 너트 0.82~0.83, 볼트(길쭉) 0.23~0.24 로 뚜렷하게 갈리고, <b>원형도 0.513 인 와셔 쌍</b>과 <b>원형도 0.214 이지만 면적이 볼트의 두 배(7203)인 볼트+너트 쌍</b>은 <code>stuck?</code> 으로 걸러졌습니다. 면적 조건이 없으면 볼트+너트 쌍이 “볼트”로 잘못 세어집니다 — <b>특성 하나로 판단하지 말 것</b>의 좋은 예입니다.',
            expect: '  면적   7203 원형도 0.214 구멍 O → stuck?\n  면적   3950 원형도 0.900 구멍 O → washer\n  면적   3646 원형도 0.825 구멍 O → nut\n  면적   3542 원형도 0.234 구멍 X → bolt\n  면적   3619 원형도 0.832 구멍 O → nut\n  면적   3584 원형도 0.239 구멍 X → bolt\n  면적   4004 원형도 0.882 구멍 O → washer\n  면적   3666 원형도 0.820 구멍 O → nut\n  면적   5462 원형도 0.892 구멍 O → washer\n  면적   3964 원형도 0.878 구멍 O → washer\n  면적  10861 원형도 0.513 구멍 O → stuck?\nwasher 4 nut 3 bolt 2 stuck? 2 (정답: 와셔 6 너트 4 볼트 3)' },
          { type: 'code', title: '예제 5: 볼록성(solidity) · 오목 결함 · 점 포함 검사', code: EX_SHAPE5,
            desc: '<b>볼록 껍질(convexHull)</b>은 윤곽을 고무줄로 감싼 모양이고, <b>볼록성 = 윤곽 면적 / 껍질 면적</b> 은 오목한 정도입니다. <code>convexHull</code> 을 두 번 부르는 이유: 점(<code>vector&lt;Point&gt;</code>)으로 받으면 면적 계산 · 그리기에 쓰고, <b>번호(<code>vector&lt;int&gt;</code>, returnPoints = false)</b>로 받아야 <code>convexityDefects</code> 에 넘길 수 있습니다. 결함 <code>Vec4i</code> 의 네 번째 값은 <b>깊이 × 256</b> 입니다. 낮은 순서 4개는 <b>볼트+너트 쌍 · 볼트 2개 · 와셔 쌍</b>이고, 이들은 최대 오목 깊이도 15~33 px 로 큽니다 — 나머지 와셔 · 너트는 볼록성 0.98 이상, 깊이 1 px 미만입니다. <code>pointPolygonTest</code> 는 점이 영역 안이면 <b>+거리</b>, 밖이면 <b>−거리</b>를 돌려줍니다(세 번째 인수 false 면 +1/0/−1). (131, 91) 은 붙어 있는 두 와셔의 이음목 안쪽이라 경계까지 거리가 짧습니다.',
            expect: '  면적   7203 껍질  11998 볼록성 0.600 최대 오목 깊이 27.3 px 점 334→19\n  면적   3542 껍질   5009 볼록성 0.707 최대 오목 깊이 16.4 px 점 243→16\n  면적   3584 껍질   5054 볼록성 0.709 최대 오목 깊이 15.8 px 점 224→23\n  면적  10861 껍질  12468 볼록성 0.871 최대 오목 깊이 32.5 px 점 256→42\npointPolygonTest: (131,91) → 9.1 / (0,0) → -1' },
          { type: 'code', title: '예제 6: matchShapes — 회전해도 같은 모양 찾기', code: EX_MATCH,
            desc: '<code>matchShapes</code> 는 두 윤곽의 <b>Hu 모멘트</b>(이동 · 크기 · 회전에 변하지 않는 7개 값)를 비교해 차이 점수를 돌려줍니다 — <b>0 에 가까울수록 같은 모양</b>입니다. <code>images/parts_scene.png</code> 의 L 브래킷 6개는 0°, 30°, −45°, 90°, 160°, −120° 로 돌아가 있는데도 템플릿과의 점수가 모두 작게 나오고, 볼트 · 와셔는 훨씬 큽니다. 가장 큰 윤곽을 돌려주는 <code>largestContour</code> 함수와, 두 기준(줄 → x)으로 정렬하는 람다도 눈여겨보세요. 단, Hu 모멘트는 <b>좌우 반전</b>도 같은 모양으로 보므로 뒤집힌 부품 검사에는 구멍 위치 같은 추가 조건이 필요합니다.',
            expect: '  브래킷 ( 76,  75) 면적 3354 점수 0.0658\n  브래킷 (275,  48) 면적 3467 점수 0.0502\n  브래킷 (465,  64) 면적 3467 점수 0.0616\n  브래킷 (115, 295) 면적 3382 점수 0.0337\n  브래킷 (306, 303) 면적 3460 점수 0.0677\n  브래킷 (518, 305) 면적 3452 점수 0.0646\n  다른 부품 ( 85, 223) 점수 4.7064\n  다른 부품 (264,  49) 점수 0.6677' },
          { type: 'callout', kind: 'tip', title: '특성 하나로 판단하지 말 것', html: '실무의 분류기는 <b>특성 2~3개를 조합</b>합니다. 예: ① 면적으로 크기 등급 → ② 원형도로 원/각 구분 → ③ 구멍 유무(<code>hi[k][2] &gt;= 0</code>)로 볼트 구분 → ④ 볼록성 · 오목 깊이로 결함(버 · 깨짐) 검출. 특성을 <code>struct</code> 로 뽑아 두면 CSV 로 저장해 그대로 <b>머신러닝 특징(feature)</b>이 됩니다 — <code>data/parts_features.csv</code> 가 그 예입니다.' },
          { type: 'callout', kind: 'field', title: '현장 이야기: 중심을 무엇으로 정할까', html: '같은 부품이라도 ① <b>모멘트 중심</b>(무게 중심) ② <b>minAreaRect 중심</b> ③ <b>minEnclosingCircle 중심</b>이 조금씩 다릅니다. 대칭 부품은 거의 같지만 <b>L 브래킷처럼 비대칭</b>이면 크게 차이 납니다. 로봇 픽킹에서는 "그리퍼가 잡을 점" 을 정의해야 하므로, 보통 <b>모멘트 중심</b>을 쓰고 방향(<code>minAreaRect</code> 각도 또는 모멘트 <code>mu11</code>)으로 회전을 정합니다.' }
        ],
        practice: [
          {
            title: '원형 부품 크기별로 세기', level: 2,
            desc: '<code>images/coins_parts.png</code> 의 부품 12개를 <b>등가 반지름</b> √(면적/π) 으로 L(&gt;30) · M(23~30) · S(≤23) 세 등급으로 나누어 개수를 출력하세요. 정답은 L 3개 · M 4개 · S 5개(지름 6.8 · 5.4 · 4.0 mm, 0.1 mm/px)입니다. 결과를 <code>struct Coin { double area, r, circ; char grade; };</code> 에 담아 <b>면적 내림차순</b>으로 출력하고, 원형도도 함께 출력해 모두 원(0.88 이상)인지 확인하세요.',
            hint: '<code>double r = sqrt(a / CV_PI);</code> 로 등가 반지름, 원형도는 <code>4 * CV_PI * a / (p * p)</code>. 등급은 삼항 연산자 <code>char g = r &gt; 30 ? \'L\' : r &gt; 23 ? \'M\' : \'S\';</code> 로, 개수는 <code>map&lt;char, int&gt;</code> 로 세면 편합니다.',
            expect: '윤곽 12개\n  면적   3524 r 33.5 원형도 0.896 → L\n  면적   3520 r 33.5 원형도 0.890 → L\n  면적   3517 r 33.5 원형도 0.894 → L\n  면적   2213 r 26.5 원형도 0.901 → M\n  면적   2212 r 26.5 원형도 0.895 → M\n  면적   2197 r 26.4 원형도 0.895 → M\n  면적   2197 r 26.4 원형도 0.903 → M\n  면적   1200 r 19.5 원형도 0.898 → S\n  면적   1198 r 19.5 원형도 0.895 → S\n  면적   1196 r 19.5 원형도 0.894 → S\n  면적   1193 r 19.5 원형도 0.884 → S\n  면적   1188 r 19.4 원형도 0.908 → S\nL 3 M 4 S 5',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
#include <map>
#include <cmath>
using namespace cv;
using namespace std;

struct Coin { double area, r, circ; char grade; };

int main()
{
    Mat img = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    Mat bin;
    threshold(img, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    vector<vector<Point>> cs;
    findContours(bin, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    cout << "윤곽 " << cs.size() << "개" << endl;

    vector<Coin> coins;
    for (const auto& c : cs)
    {
        double a = contourArea(c), p = arcLength(c, true);
        // TODO: 등가 반지름 r, 원형도, 등급을 구해 coins 에 넣으세요
    }
    // TODO: 면적 내림차순으로 정렬해 출력하고, 등급별 개수를 출력하세요

    imshow("bin", bin);
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
#include <map>
#include <cmath>
using namespace cv;
using namespace std;

struct Coin { double area, r, circ; char grade; };

int main()
{
    Mat img = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    Mat bin;
    threshold(img, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    vector<vector<Point>> cs;
    findContours(bin, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    cout << "윤곽 " << cs.size() << "개" << endl;

    vector<Coin> coins;
    for (const auto& c : cs)
    {
        double a = contourArea(c), p = arcLength(c, true);
        double r = sqrt(a / CV_PI);
        char g = r > 30 ? 'L' : r > 23 ? 'M' : 'S';
        coins.push_back({ a, r, 4 * CV_PI * a / (p * p), g });
    }
    sort(coins.begin(), coins.end(), [](const Coin& a, const Coin& b) { return a.area > b.area; });

    map<char, int> count;
    for (const Coin& k : coins)
    {
        count[k.grade]++;
        cout << format("  면적 %6.0f r %.1f 원형도 %.3f → %c", k.area, k.r, k.circ, k.grade) << endl;
    }
    cout << "L " << count['L'] << " M " << count['M'] << " S " << count['S'] << endl;
    return 0;
}`
          },
          {
            title: '구멍 지름 측정과 공차 판정', level: 3,
            desc: '<code>images/plate_holes.png</code>(0.05 mm/px)의 구멍 <b>6개</b>의 지름을 <code>minEnclosingCircle</code> 로 재고, 지름 4 mm 급은 <b>4.0 ± 0.1 mm</b>, 6 mm 급은 <b>6.0 ± 0.1 mm</b> 공차로 OK/NG 를 판정하세요. 결과는 <code>struct Hole { Point2f c; float r; };</code> 에 담아 위 → 아래, 왼쪽 → 오른쪽 순서로 출력합니다. 정답: 오른쪽 아래 구멍만 4.40 mm 로 <b>NG</b> 입니다(윤곽이 경계 픽셀 중심을 지나므로 측정값은 모두 정답보다 약 0.05 mm 작게 나옵니다).',
            hint: '판이 밝고 구멍이 어두우므로 <code>THRESH_BINARY_INV | THRESH_OTSU</code> 입니다. 그러면 판 밖의 배경도 흰색이 되어 아주 큰 윤곽이 생기므로 <b>반지름 20~100 px 만</b> 남기세요(<code>RETR_LIST</code> 로 찾음). 줄 정렬은 <code>cvRound(c.y / 140)</code> 이 같으면 x 순서로. 공칭 지름은 <code>d &lt; 5 ? 4.0 : 6.0</code>.',
            expect: '구멍 6개\n  H1 중심 (160.3, 159.8) 지름 3.95 mm (기준 4.0) OK\n  H2 중심 (640.1, 160.4) 지름 3.95 mm (기준 4.0) OK\n  H3 중심 (320.2, 300.3) 지름 5.95 mm (기준 6.0) OK\n  H4 중심 (479.8, 299.9) 지름 5.95 mm (기준 6.0) OK\n  H5 중심 (159.7, 440.2) 지름 3.95 mm (기준 4.0) OK\n  H6 중심 (640.4, 439.6) 지름 4.35 mm (기준 4.0) NG',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
#include <cmath>
using namespace cv;
using namespace std;

struct Hole { Point2f c; float r; };

int main()
{
    Mat img = imread("images/plate_holes.png", IMREAD_GRAYSCALE);
    Mat bin;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    vector<vector<Point>> cs;
    findContours(bin, cs, RETR_LIST, CHAIN_APPROX_SIMPLE);
    cout << "윤곽 " << cs.size() << "개" << endl;

    vector<Hole> holes;
    for (const auto& c : cs)
    {
        if (c.size() < 5) continue;
        Hole h;
        minEnclosingCircle(c, h.c, h.r);
        // TODO: 반지름 20 ~ 100 px 인 것만 holes 에 넣으세요
    }
    // TODO: 줄 → x 순서로 정렬해 지름(mm)과 공차 판정을 출력하세요

    imshow("bin", bin);
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
#include <cmath>
using namespace cv;
using namespace std;

struct Hole { Point2f c; float r; };

int main()
{
    Mat img = imread("images/plate_holes.png", IMREAD_GRAYSCALE);
    Mat bin;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    vector<vector<Point>> cs;
    findContours(bin, cs, RETR_LIST, CHAIN_APPROX_SIMPLE);

    vector<Hole> holes;
    for (const auto& c : cs)
    {
        if (c.size() < 5) continue;
        Hole h;
        minEnclosingCircle(c, h.c, h.r);
        if (h.r < 20 || h.r > 100) continue;
        holes.push_back(h);
    }
    sort(holes.begin(), holes.end(), [](const Hole& a, const Hole& b) {
        int ra = cvRound(a.c.y / 140), rb = cvRound(b.c.y / 140);
        return ra != rb ? ra < rb : a.c.x < b.c.x;
    });
    cout << "구멍 " << holes.size() << "개" << endl;

    Mat view;
    cvtColor(img, view, COLOR_GRAY2BGR);
    for (size_t i = 0; i < holes.size(); i++)
    {
        const Hole& h = holes[i];
        double d = 2 * h.r * 0.05;                 // px → mm
        double nominal = d < 5 ? 4.0 : 6.0;
        bool ok = fabs(d - nominal) <= 0.1;
        cout << format("  H%d 중심 (%.1f, %.1f) 지름 %.2f mm (기준 %.1f) %s",
                       (int)i + 1, h.c.x, h.c.y, d, nominal, ok ? "OK" : "NG") << endl;
        circle(view, h.c, cvRound(h.r), ok ? Scalar(0, 255, 0) : Scalar(0, 0, 255), 2);
    }
    imshow("holes", view);
    waitKey(0);
    return 0;
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: '윤곽선과 도형 분석 ②', subtitle: '도형 특성으로 부품 분류하기', notes: '<p>1교시 복습: 윤곽선 → 면적 · 둘레. 💬 “면적만으로 볼트와 와셔를 구분할 수 있을까요?” — 비슷한 면적이면 불가능. 그래서 모양을 나타내는 값이 필요하다는 흐름으로 시작합니다. (3분)</p>' },
          { layout: 'diagram', title: '같은 윤곽, 네 가지 외접 도형', html: FIG_FIT, caption: 'boundingRect · minAreaRect · minEnclosingCircle · fitEllipse', notes: '<p>네 도형의 용도를 하나씩 짚습니다: ROI 자르기(boundingRect), 기울어진 물체(minAreaRect), 원 지름(minEnclosingCircle), 평균 윤곽(fitEllipse). 💬 “기울어진 칩의 크기를 재려면?” — minAreaRect. 모멘트 중심은 “무게 중심”이라 외접 도형 중심과 다를 수 있다는 점도. (5분)</p>' },
          { layout: 'code', title: '모멘트 중심과 minAreaRect', code: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;
int main()
{
    Mat img = imread("images/chip_rotated.png", IMREAD_GRAYSCALE), bin;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    vector<vector<Point>> cs;
    findContours(bin, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    auto body = *max_element(cs.begin(), cs.end(), [](const vector<Point>& a, const vector<Point>& b) {
        return contourArea(a) < contourArea(b); });

    Moments m = moments(body);
    cout << format("중심 (%.2f, %.2f)", m.m10 / m.m00, m.m01 / m.m00) << endl;
    RotatedRect rr = minAreaRect(body);
    cout << format("크기 %.1f x %.1f 각도 %.2f", rr.size.width, rr.size.height, rr.angle) << endl;
    cout << "boundingRect " << boundingRect(body) << endl;
    Point2f pts[4];
    rr.points(pts);                        // 네 꼭짓점
    return 0;
}`, points: ['중심 = <code>m.m10/m.m00</code>, <code>m.m01/m.m00</code> (정답 330.4, 245.2)', '<code>RotatedRect</code>: <code>center · size · angle</code>', 'boundingRect 면적 33066 vs minAreaRect ≈18800', '📘 OpenCV 5: <code>geometry</code> 모듈로 이동 — 코드는 그대로'], notes: '<p>두 사각형의 면적 차이를 강조합니다 — 기울어진 물체에 boundingRect 를 쓰면 빈 공간까지 세는 셈입니다. angle 값의 범위 규칙은 버전에 따라 다르므로 “긴 변 기준으로 정규화”해서 쓰라는 주의를 덧붙입니다. OpenCV 5 의 geometry 모듈 이야기는 짧게: include 는 그대로. (6분)</p>' },
          { layout: 'two', title: '원형 부품 정밀 측정', left: { title: 'minEnclosingCircle', bullets: ['가장 바깥 점을 모두 감싸는 최소 원', '결과를 <code>Point2f&amp;</code> · <code>float&amp;</code> 로 받는다', '최대 외경 · 버(burr) 검사에 적합', '튀어나온 점 1개에 민감'] }, right: { title: 'fitEllipse', bullets: ['모든 점에 최소제곱으로 타원 맞춤', '<code>RotatedRect</code> 로 돌려준다', '<b>점 5개 이상</b> 필요 (아니면 예외)', '잡음에 강함 · 평균적인 크기'] }, notes: '<p>예제 2 를 실행해 washer_ring 의 정답(r = 150.6)과 비교합니다. 💬 “와셔에 버(돌기)가 하나 났다면 두 값 중 어느 것이 커질까?” — minEnclosingCircle. 그래서 버 검사는 두 값의 차이로 잡는다고 알려 줍니다. (5분)</p>' },
          { layout: 'diagram', title: 'approxPolyDP 와 원형도', html: FIG_CIRC, caption: 'epsilon = 둘레 × 0.02~0.04, 원형도 = 4πA/P²', notes: '<p>원형도 공식을 칠판에 씁니다. 완전한 원 = 1, 정육각형 0.907, 정사각형 0.785, 정삼각형 0.605. 💬 “길쭉한 볼트는?” — 0.2 근처. epsilon 을 둘레 비율로 주는 이유(크기 무관)를 강조합니다. (5분)</p>' },
          { layout: 'code', title: '꼭짓점 수로 도형 분류', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;
int main()
{
    Mat canvas = Mat::zeros(320, 640, CV_8UC1);
    circle(canvas, Point(80, 160), 55, Scalar(255), FILLED);
    vector<Point> tri = { Point(200, 105), Point(270, 215), Point(130, 215) };
    fillPoly(canvas, vector<vector<Point>>{ tri }, Scalar(255));
    rectangle(canvas, Rect(300, 105, 110, 110), Scalar(255), FILLED);

    vector<vector<Point>> cs;
    findContours(canvas, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    for (const auto& c : cs)
    {
        double p = arcLength(c, true), a = contourArea(c);
        vector<Point> ap;
        approxPolyDP(c, ap, 0.03 * p, true);
        cout << format("x=%d 꼭짓점 %d개 원형도 %.3f", boundingRect(c).x, (int)ap.size(), 4 * CV_PI * a / (p * p)) << endl;
    }
    return 0;
}`, points: ['3 = 삼각형, 4 = 사각형, 6 = 육각형, 7+ = 원', 'epsilon 은 <b>둘레 비율</b>로', '원형도로 한 번 더 확인', 'findContours 의 순서는 화면 순서가 아니다 → 정렬'], notes: '<p>실행 후 0.03 을 0.01 · 0.08 로 바꿔 꼭짓점 수가 어떻게 흔들리는지 보여 줍니다. 출력 순서가 왼쪽부터가 아닌 것을 보여 주고, 예제 3 처럼 struct 에 담아 x 로 정렬하는 이유를 설명합니다. (6분)</p>' },
          { layout: 'code', title: '실전: 볼트 · 너트 · 와셔 분류', code: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <map>
using namespace cv;
using namespace std;
string classify(double circ, double area)
{
    return circ >= 0.85 ? "washer" : circ >= 0.70 ? "nut" : (circ < 0.45 && area < 5000) ? "bolt" : "stuck?";
}
int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE), bin;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    vector<vector<Point>> cs;
    findContours(bin, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    map<string, int> count;
    for (const auto& c : cs) {
        double a = contourArea(c), p = arcLength(c, true);
        if (a >= 500) count[classify(4 * CV_PI * a / (p * p), a)]++;
    }
    for (const auto& kv : count) cout << kv.first << " " << kv.second << endl;
    return 0;
}`, points: ['와셔 0.88~0.90 / 너트 0.82~0.83 / 볼트 0.23~0.24', '<code>map&lt;string, int&gt;</code> 로 종류별 개수', '와셔 쌍(0.513) · 볼트+너트 쌍(면적 7203) → <b>stuck?</b>'], notes: '<p>출력은 bolt 2 · nut 3 · stuck? 2 · washer 4 입니다(정답 6/4/3). 💬 “왜 부족할까?” — 닿아 있는 2쌍. 면적 조건 <code>area &lt; 5000</code> 을 지우면 볼트+너트 쌍이 볼트로 세어지는 것을 보여 주세요. 3교시에서 watershed 로 해결한다고 예고합니다. map 은 키 순서(알파벳)로 출력된다는 점도 짚습니다. (7분)</p>' },
          { layout: 'bullets', title: '볼록성 · 오목 결함 · 모양 비교', lead: '볼록 껍질 = 윤곽을 고무줄로 감싼 모양', bullets: [
            '볼록성 = 윤곽 면적 / 껍질 면적 — 와셔 · 너트 <b>0.98 이상</b>, 볼트 약 0.7',
            '<code>convexHull(c, idx, false, false)</code> → <code>vector&lt;int&gt;</code> → <code>convexityDefects</code>',
            '결함 <code>Vec4i</code> [시작, 끝, 가장 깊은 점, <b>깊이×256</b>]',
            '<code>matchShapes</code>: Hu 모멘트 비교 — 회전 · 크기와 무관, 0 = 같은 모양',
            '깨짐 · 버 · 뒤집힘 검사에도 같은 지표를 쓴다'
          ], notes: '<p>예제 5 · 6 을 실행해 숫자를 확인합니다. convexityDefects 에 점 vector 를 넘기면 오류가 난다는 점(번호 vector 여야 함)을 반드시 강조하세요. matchShapes 로 회전된 L 브래킷 6개가 모두 작은 점수로 나오는 것을 보여 주면 반응이 좋습니다. (5분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '기울어진 칩의 <b>크기와 각도</b>를 한 번에 얻는 함수는?', options: ['<code>boundingRect</code>', '<code>minAreaRect</code>', '<code>minEnclosingCircle</code>', '<code>moments</code>'], answer: 1, explain: '<code>minAreaRect</code> 는 <code>RotatedRect</code>(center · size · angle)를 돌려주므로 크기와 각도를 함께 얻습니다. <code>boundingRect</code> 는 축에 평행해서 기울어지면 커집니다.', notes: '<p>정답 2번. 11차시 회전 보정과 연결해 한 번 더 확인합니다.</p>' },
          { layout: 'practice', title: '실습: 크기별로 세기', desc: '<p><code>images/coins_parts.png</code> 부품 12개를 등가 반지름으로 L · M · S 로 분류하세요.</p><ul><li>등가 반지름 = √(면적/π)</li><li>기준: L &gt; 30, M 23~30, S ≤ 23</li><li><code>struct Coin</code> + <code>sort</code> + <code>map&lt;char, int&gt;</code></li><li>정답 L 3 · M 4 · S 5</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <map>
#include <cmath>
using namespace cv;
using namespace std;
int main()
{
    Mat img = imread("images/coins_parts.png", IMREAD_GRAYSCALE), bin;
    threshold(img, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    vector<vector<Point>> cs;
    findContours(bin, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    cout << "윤곽 " << cs.size() << "개" << endl;
    map<char, int> count;
    // TODO: 등가 반지름으로 L / M / S 분류
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <map>
#include <cmath>
using namespace cv;
using namespace std;
int main()
{
    Mat img = imread("images/coins_parts.png", IMREAD_GRAYSCALE), bin;
    threshold(img, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    vector<vector<Point>> cs;
    findContours(bin, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    map<char, int> count;
    for (const auto& c : cs)
    {
        double r = sqrt(contourArea(c) / CV_PI);
        count[r > 30 ? 'L' : r > 23 ? 'M' : 'S']++;
    }
    cout << "L " << count['L'] << " M " << count['M'] << " S " << count['S'] << endl;
    return 0;
}`, notes: '<p>정답 L 3 · M 4 · S 5 (지름 6.8 · 5.4 · 4.0 mm). 경계를 25 로 바꾸면 어떻게 되는지 물어 크기 등급 경계 설정 감각을 길러 줍니다. 등가 반지름이 정답(34 · 27 · 20)보다 약 0.5 px 작게 나오는 이유(윤곽이 경계 픽셀 중심을 지남)도 짚어 주세요. (8분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['<code>moments</code>: 면적 m00, 중심 <b>m10/m00 · m01/m00</b>', '외접 도형 4종 — ROI는 <code>boundingRect</code>, 기울기는 <code>minAreaRect</code>, 원은 <code>minEnclosingCircle</code> · <code>fitEllipse</code>', '<code>approxPolyDP(c, ap, 둘레×0.02~0.04, true)</code> → <b>꼭짓점 수</b>', '원형도 <b>4πA/P²</b> · 볼록성 · 오목 깊이 · <code>matchShapes</code>', '결과는 <code>struct</code> 에, 규칙은 함수(<code>classify</code>)로 — 특성은 <b>2~3개 조합</b>', '다음 교시: 닿아 있는 물체를 분리해 13개를 정확히 세기'], notes: '<p>표 2 를 다시 보며 각 함수의 용도를 한 번 더 확인합니다. 다음 교시에 “11개 → 13개” 문제를 끝낸다고 예고하며 마칩니다. (2분)</p>' }
        ]
      },
      // ============================================================ 교시 3
      {
        id: 'cv12-3', title: '연결 요소 라벨링과 닿아 있는 물체 분리', minutes: 50,
        goals: ['connectedComponentsWithStats 로 라벨링하고 stats · centroids 를 struct 로 정리할 수 있다', '면적 필터와 화면 순서 번호 매기기로 결과를 표시할 수 있다', 'distanceTransform + watershed 로 닿아 있는 물체를 분리하고 개수 세기 파이프라인을 함수로 정리할 수 있다'],
        flow: [['도입: 라벨링이란', 5], ['connectedComponentsWithStats 와 면적 필터', 15], ['거리 변환 + watershed', 20], ['파이프라인 정리 · 퀴즈', 10]],
        content: [
          { type: 'h', text: '윤곽선 대신 라벨: 픽셀마다 번호를 붙인다' },
          { type: 'p', html: '윤곽선은 <b>경계</b>를 주지만, "이 픽셀이 몇 번 물체에 속하는가" 는 알려 주지 않습니다. <b>연결 요소 라벨링(Connected Components Labeling)</b>은 붙어 있는 흰 픽셀에 <b>같은 번호</b>를 붙여 라벨 Mat 을 만듭니다. <code>connectedComponentsWithStats</code> 를 쓰면 면적 · 외접 사각형 · 중심을 한 번에 받을 수 있고, <code>labels == k</code> 로 물체별 마스크를 바로 만들 수 있습니다. (Python: <code>n, labels, stats, cents = cv2.connectedComponentsWithStats(bin)</code>)' },
          { type: 'figure', html: FIG_LABEL, caption: '그림 5. 라벨링 — 배경은 0, 물체는 1부터. stats 와 centroids 가 함께 나온다' },
          { type: 'table', head: ['', '윤곽선 (findContours)', '라벨링 (connectedComponentsWithStats)'], rows: [
            ['결과', '경계 점 <code>vector&lt;vector&lt;Point&gt;&gt;</code>', '픽셀마다 라벨 번호가 든 Mat (CV_32S)'],
            ['면적', '다각형 면적 (구멍 포함)', '<b>실제 픽셀 개수</b> (구멍 제외)'],
            ['구멍', '계층(<code>hi[k][3]</code>)으로 알 수 있다', '구멍은 배경이라 그냥 빠진다'],
            ['모양 분석', '꼭짓점 · 둘레 · 원형도 등 <b>풍부</b>', '외접 사각형 · 면적 · 중심만'],
            ['물체별 마스크', '<code>drawContours(..., FILLED)</code> 로 직접', '<code>Mat mask = (labels == k);</code>'],
            ['쓰는 곳', '모양 분류 · 치수 측정', '<b>개수 세기 · 면적 필터 · 잡음 제거</b>']
          ], caption: '표 3. 둘은 경쟁이 아니라 역할 분담 — 보통 라벨링으로 걸러 내고 윤곽선으로 분석한다' },
          { type: 'code', title: '예제 1: connectedComponentsWithStats — 면적 · 사각형 · 중심을 한 번에', code: EX_CC1,
            desc: '반환값 <b>12 는 배경을 포함</b>한 라벨 수이므로 물체는 11개입니다. <code>stats</code> 는 12행 5열 <b>CV_32SC1</b> 이라 <code>at&lt;int&gt;</code>, <code>centroids</code> 는 12행 2열 <b>CV_64FC1</b> 이라 <code>at&lt;double&gt;</code> 로 읽습니다 — 형식과 다른 타입으로 읽으면 쓰레기값이 나옵니다. 열 번호는 숫자 대신 <code>CC_STAT_AREA</code> 같은 상수를 쓰세요. 라벨 0(배경)의 면적이 가장 큰 점, 라벨 1 이 폭 168 · 높이 88 로 <b>붙어 있는 와셔 2개</b>인 점을 확인하세요. 라벨 Mat 은 CV_32S 라 그대로 보이지 않으므로 <code>convertTo(view, CV_8U, 20)</code> 로 밝기를 키워 표시합니다.',
            expect: '라벨 12개 (배경 포함) → 물체 11개\nstats 12x5 CV_32SC1 / centroids 12x2 CV_64FC1\n  [0] L0 T0 W640 H480 면적 260722 중심 (318.1, 243.4)\n  [1] L48 T48 W168 H88 면적 9069 중심 (131.5, 91.5)\n  [2] L264 T49 W73 H73 면적 3372 중심 (300.0, 84.9)\n  [3] L518 T58 W85 H85 면적 4585 중심 (560.0, 100.0)' },
          { type: 'callout', kind: 'tip', title: '면적이 윤곽선과 다른 이유', html: '와셔 하나의 라벨 면적은 <b>약 3370</b> 인데 1교시에서 같은 와셔의 윤곽 면적은 <b>약 3965</b> 였습니다. 라벨 면적은 <b>실제 흰 픽셀 수</b>라 가운데 구멍이 빠지고, <code>contourArea</code> 는 <b>바깥 다각형 면적</b>이라 구멍이 포함되기 때문입니다. 링 면적을 원하면 라벨링 쪽이 편합니다.' },
          { type: 'code', title: '예제 2: 나만의 Blob 구조체 · 라벨마다 색칠하기', code: EX_CC2,
            desc: 'OpenCvSharp 의 <code>ConnectedComponentsEx</code> / Python 의 여러 라이브러리가 주는 “Blob 객체”를 C++ 에서는 <b>직접 <code>struct</code> 로</b> 만듭니다. <code>toBlobs</code> 함수가 <code>stats</code> · <code>centroids</code> 를 <code>vector&lt;Blob&gt;</code> 로 바꿔 주면, 그다음부터는 <code>sort</code> · 람다로 마음대로 정렬 · 필터할 수 있습니다. 색칠은 라벨 수만큼 <b>색표(palette)</b>를 만들고 모든 픽셀에서 <code>palette[labels.at&lt;int&gt;(y, x)]</code> 를 칠합니다 — C++ 이중 반복이라 640×480 도 순식간입니다. 색은 난수라 실행 환경마다 다를 수 있습니다.',
            expect: 'blob 11개\n  라벨  1: 면적 9069 폭 168 높이 88 중심 (131.5, 91.5)\n  라벨 11: 면적 6602 폭 223 높이 66 중심 (439.9, 400.0)\n  라벨  3: 면적 4585 폭 85 높이 85 중심 (560.0, 100.0)\ncolor 640x480 CV_8UC3' },
          { type: 'code', title: '예제 3: 면적 필터 + 화면 순서로 번호 그리기', code: EX_CC3,
            desc: '현장 코드의 기본형입니다. ① <b>면적 필터</b>로 먼지 · 잡음을 버리고 ② 화면 순서(위 줄 → 아래 줄, 왼쪽 → 오른쪽)로 <b>번호를 다시 붙여</b> 사람이 읽을 수 있게 만듭니다. 라벨 번호는 OpenCV 가 만든 내부 순서(위에서부터 처음 만난 순서)라 오퍼레이터에게 보여 줄 번호로는 부적합합니다. y 를 150 px 단위로 묶어 “줄”을 만드는 이유는, 같은 줄에 있어도 중심 y 가 몇 px 씩 달라서 y 만으로 정렬하면 순서가 뒤섞이기 때문입니다. <code>getTextSize</code> 로 글자 크기를 미리 알면 상자 안에 글자를 정확히 배치할 수 있습니다.',
            expect: '   1: 중심 (131.5,  91.5) 면적 9069\n   2: 중심 (300.0,  84.9) 면적 3372\n   3: 중심 (425.0,  95.0) 면적 2883\n   4: 중심 (560.0, 100.0) 면적 4585\n   5: 중심 (146.7, 244.9) 면적 3732\n   6: 중심 (340.0, 240.0) 면적 2835\n   7: 중심 (494.3, 242.5) 면적 3765\n   8: 중심 (600.0, 195.0) 면적 3423\n   9: 중심 ( 80.0, 400.0) 면적 3354\n  10: 중심 (215.0, 390.0) 면적 2858\n  11: 중심 (439.9, 400.0) 면적 6602\n번호를 붙인 물체 11개, 걸러낸 블롭 0개\n글자 \'12\' 크기 22x14' },
          { type: 'h', text: '닿아 있는 물체를 떼어 내기: 거리 변환 + watershed' },
          { type: 'p', html: '이제 이 차시의 마지막 문제입니다. <code>washers.png</code> 는 부품이 <b>13개</b>인데 라벨링은 계속 <b>11개</b>라고 합니다. 이진화만으로는 <b>닿아 있는 물체 사이에 경계선이 없기</b> 때문입니다. 답은 <b>거리 변환(Distance Transform)</b>으로 물체마다 "씨앗" 을 만들고, <b>watershed</b>(분수령) 알고리즘으로 씨앗을 키워 경계를 긋는 것입니다.' },
          { type: 'figure', html: FIG_WS, caption: '그림 6. 이진화 → 거리 변환 → 봉우리(씨앗) → 마커 → watershed. 경계는 −1 로 표시된다' },
          { type: 'code', title: '예제 4: distanceTransform + watershed 로 13개 만들기', code: EX_WS,
            desc: '<b>순서가 중요합니다.</b> ① 와셔는 링 모양이라 그대로 거리 변환하면 봉우리가 고리처럼 생겨 하나가 여러 개로 쪼개집니다 → <code>RETR_EXTERNAL</code> 윤곽을 <b><code>FILLED</code> 로 채워</b> 구멍을 메웁니다. ② 거리 변환 최대값은 가장 큰 와셔 반지름(42)과 비슷합니다. ③ 임계값을 0.20 · 0.30 · 0.40 · 0.50 으로 바꿔 보면 씨앗 개수가 달라집니다 — <b>실험 없이 숫자를 고르면 안 됩니다</b>. 0.35 로 씨앗 13개를 얻고 ④ 마커(CV_32S)를 만들어 ⑤ <code>watershed</code> 를 돌리면 라벨이 14(= 배경 1 + 물체 13)까지 나옵니다. <code>for (double th : { 0.20, 0.30, ... })</code> 는 초기화 목록을 도는 범위 for 문, <code>Mat edge = (markers == -1);</code> 은 비교 연산자로 마스크를 만드는 OpenCV C++ 의 편리한 문법입니다. 결과 창의 빨간 선이 새로 생긴 경계입니다.',
            expect: '그냥 세면 11개 (실제 13개)\n거리 최대 41.7 px\n  임계값 0.20 → 씨앗 15개\n  임계값 0.30 → 씨앗 13개\n  임계값 0.40 → 씨앗 13개\n  임계값 0.50 → 씨앗 10개\n씨앗 13개\nwatershed 후 라벨 -1 ~ 14 → 물체 13개\n경계(-1) 픽셀 5471개' },
          { type: 'callout', kind: 'warn', title: '임계값에 따라 개수가 바뀐다 — 반드시 확인할 것', html: '예제 4 에서 보듯 봉우리 임계값이 <b>낮으면 과분할</b>(한 물체에 씨앗 여러 개), <b>높으면 씨앗 소실</b>(작은 물체의 봉우리가 사라짐)입니다. 크기가 크게 다른 물체가 섞여 있으면 하나의 비율로는 해결되지 않으므로 ① <b>절대 거리</b>(예: 8 px)를 쓰거나 ② 크기 그룹을 나눠 두 번 돌리거나 ③ 봉우리 검출을 <code>dilate</code> 기반 지역 최대값으로 바꿉니다. <b>어떤 경우든 실제 개수를 출력해 확인하고 숫자를 정하세요.</b>' },
          { type: 'callout', kind: 'tip', title: 'watershed 를 쓰기 전에 생각해 볼 것', html: 'watershed 는 느리고 매개변수에 민감합니다. 실무에서는 먼저 ① <b>모폴로지 열기</b>(<code>MORPH_OPEN</code>)로 얇은 이음목을 끊어 보고 ② 그래도 안 되면 <code>erode</code> 를 몇 번 반복해 씨앗을 만들고 ③ 정말 필요할 때만 거리 변환 + watershed 를 씁니다. 가장 좋은 해결책은 <b>조명과 설비</b>입니다 — 부품이 겹치지 않게 진동 피더로 떼어 놓는 것이 소프트웨어보다 확실합니다.' },
          { type: 'h', text: '개수 세기 파이프라인을 함수로' },
          { type: 'code', title: '예제 5: 재사용 가능한 countParts 함수', code: EX_PIPE,
            desc: '같은 흐름(읽기 → 이진화 → 라벨링 → 면적 필터)을 <b>함수 하나</b>로 묶었습니다. 경로는 <code>const string&amp;</code> 로 받아 복사를 피하고, <code>darkObject</code> 로 백라이트/정면 조명을 고르고, <code>minArea</code> 로 잡음 기준을 바꿉니다. 이렇게 만들어 두면 ① 다른 이미지에 바로 쓸 수 있고 ② 15차시의 <b>카메라 반복문</b> 안에 그대로 넣을 수 있고 ③ 16 · 17차시에서 <b>클래스의 멤버 함수</b>로 옮기기 쉽습니다. <code>img.empty()</code> 검사처럼 <b>실패를 다루는 코드</b>를 함수 안에 넣는 습관도 중요합니다 — 마지막 줄의 없는 파일이 그 경우입니다.',
            expect: 'washers.png     → 11개 (실제 13 — 닿은 쌍 2개 때문에 부족)\ncoins_parts.png → 12개 (실제 12)\nflange.png      → 1개 (실제 1)\n[경고] images/none.png 를 읽을 수 없습니다\nnone.png        → 0개' },
          { type: 'code', title: '추가: 트랙바로 최소 면적 조절하기 (Visual Studio 에서 실행)', code: EX_LOCAL, run: false, local: true, file: 'main.cpp',
            desc: '로컬 PC 에서는 <code>createTrackbar</code> 로 창에 슬라이더를 붙여, 최소 면적을 끌어 가며 개수가 바뀌는 것을 바로 볼 수 있습니다. 콜백 함수는 <code>void f(int pos, void* userdata)</code> 형태이고, 여기서는 간단히 <b>전역 변수</b>로 이미지와 stats 를 공유했습니다(16차시에서는 클래스 멤버 + <code>userdata</code> 로 바꿉니다). 계산 부분은 예제 3 · 5 와 같으므로, 브라우저에서는 예제 5 의 <code>minArea</code> 인수를 바꿔 같은 실험을 하면 됩니다.' },
          { type: 'callout', kind: 'field', title: '현장 이야기: 개수 세기 검사기 체크리스트', html: '<ul><li><b>조명 고정</b>: 백라이트가 가장 쉽다(실루엣 → Otsu 한 번으로 끝).</li><li><b>면적 하한 · 상한</b> 둘 다 둔다: 하한은 먼지, 상한은 "둘이 붙은 것" 을 잡아낸다.</li><li><b>경계에 걸친 물체</b>: 화면 밖으로 반쯤 나간 것은 세지 않도록 <code>Rect</code> 가 이미지 가장자리에 닿는지 확인한다.</li><li><b>결과를 항상 그림으로 남긴다</b>: 번호 · 사각형을 그려 <code>imwrite</code> 로 저장하면 오작동 분석이 쉽다.</li><li><b>기대 개수를 알면 검증</b>: "트레이 1판 = 24개" 처럼 정답을 알면 개수 불일치 자체가 불량 신호다.</li></ul>' },
          { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 · 오개념 지도 · 평가', html: '<ul><li><b>오개념 1</b>: “라벨 수 = 물체 수” → 배경(0)을 빼야 합니다. 실습에서 12 vs 11 로 반드시 한 번 틀립니다.</li><li><b>오개념 2</b>: “contourArea = 픽셀 수” → 다각형 면적입니다(구멍 포함). 라벨 면적 ≈3370 vs 윤곽 면적 ≈3965 로 설명하세요.</li><li><b>오개념 3</b>: “watershed 면 무조건 분리된다” → 씨앗 임계값이 전부입니다. 0.20 / 0.50 을 직접 넣어 개수가 달라지는 것을 보여 주세요.</li><li><b>C++ 포인트</b>: <code>stats.at&lt;int&gt;</code> vs <code>centroids.at&lt;double&gt;</code> 타입 실수, 람다 캡처 없이 쓰기, struct 초기화 <code>{ ... }</code> 순서.</li><li><b>준비물</b>: 3교시 예제는 컴파일 · 실행이 조금 깁니다. 미리 한 번 돌려 캐시를 채워 두세요.</li><li><b>평가 루브릭(10점)</b>: ① 라벨링으로 개수 세고 배경을 제외했다(2) ② 면적 필터를 근거와 함께 정했다(2) ③ 도형 특성 2개 이상으로 분류했다(3) ④ 닿은 물체를 분리해 13개를 얻었다(3).</li><li>💬 마무리 발문: “개수가 하루에 한 번 틀립니다. 어디를 먼저 볼까요?” — 조명 변화 → 임계값 → 면적 기준 → 물체 겹침.</li></ul>' }
        ],
        practice: [
          {
            title: '임계값을 바꿔 씨앗 개수 찾기', level: 2,
            desc: '구멍을 메운 와셔 영상에 거리 변환을 적용하고, 정규화한 값의 임계값을 <b>0.20부터 0.50까지 0.05 간격</b>으로 바꿔 가며 씨앗(연결 요소) 개수를 출력하세요. 13개가 나오는 구간을 찾아 보고, 왜 임계값이 너무 낮거나 높으면 안 되는지 결과로 설명하세요.',
            hint: '실수로 반복하면 오차가 쌓이므로 <b>정수로 반복</b>하는 것이 안전합니다: <code>for (int i = 0; i &lt;= 6; i++) { double th = 0.20 + 0.05 * i; ... }</code>. 임계값 적용 후 <code>pk.convertTo(pk8, CV_8U, 255)</code> 로 8비트로 바꿔야 <code>connectedComponents</code> 에 넣을 수 있습니다.',
            expect: '거리 최대 41.7\n  0.20 → 씨앗 15개\n  0.25 → 씨앗 14개\n  0.30 → 씨앗 13개\n  0.35 → 씨앗 13개\n  0.40 → 씨앗 13개\n  0.45 → 씨앗 10개\n  0.50 → 씨앗 10개',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat bin;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);

    // 구멍 메우기
    vector<vector<Point>> outer;
    findContours(bin, outer, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    Mat solid = Mat::zeros(bin.size(), CV_8UC1);
    drawContours(solid, outer, -1, Scalar(255), FILLED);

    Mat dist, distN;
    distanceTransform(solid, dist, DIST_L2, DIST_MASK_5);
    double dmax;
    minMaxLoc(dist, nullptr, &dmax);
    cout << format("거리 최대 %.1f", dmax) << endl;
    normalize(dist, distN, 0, 1, NORM_MINMAX);

    // TODO: 0.20 ~ 0.50 을 0.05 간격으로 돌며 씨앗 개수를 출력하세요

    imshow("solid", solid);
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat bin;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);

    vector<vector<Point>> outer;
    findContours(bin, outer, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    Mat solid = Mat::zeros(bin.size(), CV_8UC1);
    drawContours(solid, outer, -1, Scalar(255), FILLED);

    Mat dist, distN;
    distanceTransform(solid, dist, DIST_L2, DIST_MASK_5);
    double dmax;
    minMaxLoc(dist, nullptr, &dmax);
    cout << format("거리 최대 %.1f", dmax) << endl;
    normalize(dist, distN, 0, 1, NORM_MINMAX);

    for (int i = 0; i <= 6; i++)
    {
        double th = 0.20 + 0.05 * i;
        Mat pk, pk8, lab;
        threshold(distN, pk, th, 1.0, THRESH_BINARY);
        pk.convertTo(pk8, CV_8U, 255);
        cout << format("  %.2f → 씨앗 %d개", th, connectedComponents(pk8, lab) - 1) << endl;
    }
    imshow("dist", distN);
    waitKey(0);
    return 0;
}`
          },
          {
            title: '개수 세기 함수에 상한 면적 추가하기', level: 3,
            desc: '<code>countParts</code> 함수에 <b>최대 면적</b> 인수를 추가해 "너무 큰 덩어리(= 둘이 붙은 것)" 를 <b>따로 보고</b>하도록 고치세요. 반환값을 <code>struct CountResult { int ok; int tooBig; };</code> 로 바꾸고, 와셔 영상(면적 500~6000)과 동전 영상에 적용해 결과를 출력하세요.',
            hint: '구조체를 반환하면 호출 쪽에서 C++17 <b>구조적 바인딩</b>으로 받을 수 있습니다: <code>auto [ok, big] = countParts(...);</code>. 와셔 영상에서 면적 6000 을 넘는 블롭은 붙어 있는 와셔 쌍과 볼트+너트 쌍입니다.',
            expect: 'washers.png     → 정상 9개, 너무 큰 덩어리 2개 (총 11)\ncoins_parts.png → 정상 12개, 너무 큰 덩어리 0개 (총 12)',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

struct CountResult { int ok; int tooBig; };

CountResult countParts(const string& path, bool darkObject, int minArea, int maxArea)
{
    Mat img = imread(path, IMREAD_GRAYSCALE);
    if (img.empty()) return { 0, 0 };
    Mat bin, labels, stats, centroids;
    threshold(img, bin, 0, 255, (darkObject ? THRESH_BINARY_INV : THRESH_BINARY) | THRESH_OTSU);
    int n = connectedComponentsWithStats(bin, labels, stats, centroids);
    CountResult r = { 0, 0 };
    // TODO: 면적이 minArea 이상 maxArea 이하면 ok, maxArea 보다 크면 tooBig 으로 세세요
    return r;
}

int main()
{
    auto [ok, big] = countParts("images/washers.png", true, 500, 6000);
    cout << "washers.png     → 정상 " << ok << "개, 너무 큰 덩어리 " << big << "개 (총 " << ok + big << ")" << endl;
    // TODO: coins_parts.png 도 같은 방식으로 출력하세요
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

struct CountResult { int ok; int tooBig; };

CountResult countParts(const string& path, bool darkObject, int minArea, int maxArea)
{
    Mat img = imread(path, IMREAD_GRAYSCALE);
    if (img.empty()) return { 0, 0 };
    Mat bin, labels, stats, centroids;
    threshold(img, bin, 0, 255, (darkObject ? THRESH_BINARY_INV : THRESH_BINARY) | THRESH_OTSU);
    int n = connectedComponentsWithStats(bin, labels, stats, centroids);
    CountResult r = { 0, 0 };
    for (int i = 1; i < n; i++)
    {
        int area = stats.at<int>(i, CC_STAT_AREA);
        if (area < minArea) continue;
        if (area > maxArea) r.tooBig++; else r.ok++;
    }
    return r;
}

int main()
{
    auto [ok, big] = countParts("images/washers.png", true, 500, 6000);
    cout << "washers.png     → 정상 " << ok << "개, 너무 큰 덩어리 " << big << "개 (총 " << ok + big << ")" << endl;
    CountResult c = countParts("images/coins_parts.png", false, 500, 6000);
    cout << "coins_parts.png → 정상 " << c.ok << "개, 너무 큰 덩어리 " << c.tooBig << "개 (총 " << c.ok + c.tooBig << ")" << endl;
    return 0;
}`
          }
        ],
        quiz: QUIZ3,
        slides: [
          { layout: 'title', title: '윤곽선과 도형 분석 ③', subtitle: '연결 요소 라벨링과 닿아 있는 물체 분리', notes: '<p>💬 “두 교시 동안 와셔 영상은 계속 11개라고 했습니다. 실제는 13개인데요.” 이 문제를 오늘 끝낸다고 선언하며 시작합니다. (3분)</p>' },
          { layout: 'diagram', title: '연결 요소 라벨링', html: FIG_LABEL, caption: '배경 0, 물체 1부터 — 물체 수 = 반환값 − 1', notes: '<p>라벨 Mat 이 “픽셀마다 번호가 적힌 표”라는 점을 강조합니다. 💬 “반환값이 12 입니다. 물체는 몇 개?” — 11개(배경 제외). 이 실수는 거의 모든 학생이 한 번 합니다. 4연결/8연결도 짚어 줍니다. (5분)</p>' },
          { layout: 'table', title: '윤곽선 vs 라벨링 — 역할 분담', head: ['', '윤곽선', '라벨링'], rows: [
            ['면적', '다각형 (구멍 포함)', '<b>픽셀 수</b> (구멍 제외)'],
            ['모양 분석', '꼭짓점 · 원형도 등 풍부', '사각형 · 면적 · 중심'],
            ['마스크', '직접 그려야', '<code>labels == k</code>'],
            ['주 용도', '분류 · 측정', '<b>개수 · 필터</b>']
          ], notes: '<p>둘 중 하나를 고르는 것이 아니라 <b>라벨링으로 걸러 내고 윤곽선으로 분석</b>하는 조합이 실무 표준이라고 정리합니다. 와셔 면적 ≈3370(라벨) vs ≈3965(윤곽)의 차이도 여기서 설명. (4분)</p>' },
          { layout: 'code', title: 'connectedComponentsWithStats', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;
int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE), bin;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);

    Mat labels, stats, cent;
    int n = connectedComponentsWithStats(bin, labels, stats, cent);
    cout << "라벨 " << n << "개 → 물체 " << n - 1 << "개" << endl;
    for (int i = 1; i < 4; i++)
        cout << format("[%d] 면적 %d 중심 (%.1f, %.1f)", i,
                       stats.at<int>(i, CC_STAT_AREA),
                       cent.at<double>(i, 0), cent.at<double>(i, 1)) << endl;
    return 0;
}`, points: ['<code>stats</code>: LEFT · TOP · WIDTH · HEIGHT · <b>AREA</b> — <code>at&lt;int&gt;</code>', '<code>centroids</code>: x · y — <code>at&lt;double&gt;</code>', '라벨 0 = 배경 → 반복은 <code>i = 1</code> 부터'], notes: '<p>stats 를 <code>at&lt;double&gt;</code> 로 읽으면 어떻게 되는지 일부러 보여 주면 타입 규칙이 기억에 남습니다(쓰레기값 또는 형식 오류). 라벨 1 의 면적 9069 가 “두 개가 붙어 있다”는 신호임을 짚어 주세요. (6분)</p>' },
          { layout: 'code', title: '나만의 Blob 구조체', code: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;
struct Blob { int label, area; Point2d c; };
int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE), bin, labels, stats, cent;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    int n = connectedComponentsWithStats(bin, labels, stats, cent);

    vector<Blob> blobs;
    for (int i = 1; i < n; i++)
        blobs.push_back({ i, stats.at<int>(i, CC_STAT_AREA),
                          Point2d(cent.at<double>(i, 0), cent.at<double>(i, 1)) });
    sort(blobs.begin(), blobs.end(), [](const Blob& a, const Blob& b) { return a.area > b.area; });
    for (int i = 0; i < 3; i++)
        cout << format("라벨 %d 면적 %d", blobs[i].label, blobs[i].area) << endl;
    return 0;
}`, points: ['Mat 두 개 → <code>vector&lt;Blob&gt;</code> 로 한 번 바꿔 두면', '<code>sort</code> · <code>count_if</code> · 람다로 자유롭게', '<code>Mat mask = (labels == k);</code> 로 물체별 마스크'], notes: '<p>OpenCvSharp · Python 라이브러리의 “Blob 객체”를 C++ 에서는 직접 만든다는 점이 핵심입니다. 이 struct 는 17차시 검사 프로젝트에서 그대로 쓰입니다. (6분)</p>' },
          { layout: 'bullets', title: '면적 필터가 하는 일', lead: '현장 코드의 1번 방어선', bullets: [
            '<b>하한</b>: 먼지 · 잡음 · 반사점 제거 (예: 면적 &lt; 500)',
            '<b>상한</b>: “둘이 붙은 덩어리” 를 <b>불량 신호</b>로 잡아낸다',
            '화면 가장자리에 걸친 물체는 따로 제외',
            '번호는 <b>화면 순서로 다시</b> 매겨 사람이 읽게 한다 (줄 → x 정렬)',
            '기준값은 반드시 <b>실제 출력을 보고</b> 정한다'
          ], notes: '<p>💬 “면적 상한을 왜 두나요?” — 붙어 있는 물체를 놓치지 않기 위해. 개수만 세면 11개라 정상처럼 보이지만, 상한을 두면 “너무 큰 덩어리 2개”라는 경고가 나옵니다. (4분)</p>' },
          { layout: 'diagram', title: '거리 변환 + watershed 5단계', html: FIG_WS, caption: '이진화 → 거리 변환 → 봉우리(씨앗) → 마커 → watershed', notes: '<p>그림의 5칸을 순서대로 짚습니다. 핵심은 ②③: 물체 중심이 경계에서 가장 멀다 → 봉우리 = 물체 하나. 마커의 규칙(씨앗 +1, 미지 0, 결과 경계 −1)을 칠판에 씁니다. (6분)</p>' },
          { layout: 'code', title: '씨앗 만들기 (watershed 앞부분)', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;
int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE), bin;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    vector<vector<Point>> o;
    findContours(bin, o, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    Mat solid = Mat::zeros(bin.size(), CV_8UC1);
    drawContours(solid, o, -1, Scalar(255), FILLED);        // 구멍 메우기

    Mat dist, dn, peak, fg, seeds;
    distanceTransform(solid, dist, DIST_L2, DIST_MASK_5);
    normalize(dist, dn, 0, 1, NORM_MINMAX);
    threshold(dn, peak, 0.35, 1.0, THRESH_BINARY);
    peak.convertTo(fg, CV_8U, 255);
    cout << "씨앗 " << connectedComponents(fg, seeds) - 1 << "개" << endl;
    imshow("dist", dn);
    waitKey(0);
    return 0;
}`, points: ['① 구멍 메우기 (링이면 봉우리가 고리가 된다)', '② 거리 변환 → ③ 정규화 → 봉우리 임계값', '<b>임계값 0.35 → 씨앗 13개</b>', '다음: 마커 <code>seeds.convertTo(markers, CV_32S, 1, 1)</code> → <code>watershed</code>'], notes: '<p>여기까지 실행해 씨앗 13개를 확인합니다. 0.35 를 0.2 · 0.5 로 바꿔 개수가 달라지는 것을 반드시 시연하세요 — 이 차시 최대의 교훈입니다. 이어서 예제 4 전체를 실행해 빨간 경계선을 보여 줍니다. (7분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: 'watershed 의 markers Mat 형식과 미지 영역 값은?', options: ['CV_8UC1 / 255', 'CV_32SC1 / 0', 'CV_32FC1 / 1.0', 'CV_8UC3 / 0'], answer: 1, explain: '마커는 <b>CV_32SC1</b>(int)이고 <b>모르는 영역은 0</b> 입니다. 결과에서 물체 경계는 <b>−1</b> 로 표시되고, 입력 이미지는 CV_8UC3 이어야 합니다.', notes: '<p>정답 2번. 형식을 CV_8UC1 로 잘못 만들면 예외가 난다는 점을 덧붙입니다.</p>' },
          { layout: 'code', title: '파이프라인을 함수로', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;
int countParts(const string& path, bool darkObject, int minArea)
{
    Mat img = imread(path, IMREAD_GRAYSCALE);
    if (img.empty()) return 0;
    Mat bin, labels, stats, cent;
    threshold(img, bin, 0, 255, (darkObject ? THRESH_BINARY_INV : THRESH_BINARY) | THRESH_OTSU);
    int n = connectedComponentsWithStats(bin, labels, stats, cent);
    int count = 0;
    for (int i = 1; i < n; i++)
        if (stats.at<int>(i, CC_STAT_AREA) >= minArea) count++;
    return count;
}
int main()
{
    cout << "washers " << countParts("images/washers.png", true, 500)
         << "개 / coins " << countParts("images/coins_parts.png", false, 500) << "개" << endl;
    return 0;
}`, points: ['읽기 → 이진화 → 라벨링 → 면적 필터', '<code>const string&amp;</code> 로 받아 복사 방지', '<code>img.empty()</code> 로 실패 처리', '15차시 카메라 반복 · 16~17차시 클래스로 재사용'], notes: '<p>함수로 묶는 습관을 강조합니다. 이 함수가 15차시(카메라)와 17차시(검사 프로젝트)에서 다시 등장한다고 예고하면 학생들이 코드를 저장해 둡니다. (6분)</p>' },
          { layout: 'practice', title: '실습: 임계값 실험', desc: '<p>봉우리 임계값을 <b>0.20 ~ 0.50, 0.05 간격</b>으로 바꿔 가며 씨앗 개수를 출력하세요.</p><ul><li>정수 반복 <code>th = 0.20 + 0.05 * i</code></li><li>13개가 나오는 구간을 찾기</li><li>너무 낮으면 왜 많아지고, 너무 높으면 왜 줄어드는지 설명</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;
int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE), bin;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    vector<vector<Point>> o;
    findContours(bin, o, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    Mat solid = Mat::zeros(bin.size(), CV_8UC1);
    drawContours(solid, o, -1, Scalar(255), FILLED);
    Mat dist, dn;
    distanceTransform(solid, dist, DIST_L2, DIST_MASK_5);
    normalize(dist, dn, 0, 1, NORM_MINMAX);
    // TODO: 0.20 ~ 0.50 반복
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;
int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE), bin;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    vector<vector<Point>> o;
    findContours(bin, o, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    Mat solid = Mat::zeros(bin.size(), CV_8UC1);
    drawContours(solid, o, -1, Scalar(255), FILLED);
    Mat dist, dn;
    distanceTransform(solid, dist, DIST_L2, DIST_MASK_5);
    normalize(dist, dn, 0, 1, NORM_MINMAX);
    for (int i = 0; i <= 6; i++)
    {
        double th = 0.20 + 0.05 * i;
        Mat pk, pk8, lab;
        threshold(dn, pk, th, 1.0, THRESH_BINARY);
        pk.convertTo(pk8, CV_8U, 255);
        cout << format("%.2f → %d개", th, connectedComponents(pk8, lab) - 1) << endl;
    }
    return 0;
}`, notes: '<p>정답 구간은 실습 expect 를 참고하세요(0.30~0.40 에서 13개). 낮으면 한 물체 안에 봉우리가 여러 개(과분할), 높으면 작은 물체(볼트 몸통)의 봉우리가 사라집니다. (10분)</p>' },
          { layout: 'summary', title: '정리 (12차시 전체)', bullets: ['<b>1교시</b>: 윤곽선 = <code>vector&lt;vector&lt;Point&gt;&gt;</code>, <code>RETR_EXTERNAL</code>/<code>RETR_CCOMP</code>, <code>hi[k][3]</code> 로 구멍 세기', '<b>2교시</b>: 모멘트 중심 · 외접 도형 · 꼭짓점 수 · 원형도 · 볼록성 · matchShapes 로 분류', '<b>3교시</b>: 라벨링(배경 0 주의) + 면적 필터 → 거리 변환 + watershed 로 닿은 물체 분리', '와셔 영상: 이진화만 <b>11개</b> → watershed 로 <b>13개</b> (정답)', '결과는 <code>struct</code> 로, 정렬은 <code>sort</code> + 람다, 파이프라인은 <b>함수</b>로', '다음 차시: 허프 변환으로 직선과 원을 직접 검출'], notes: '<p>세 교시를 한 장으로 되짚습니다. 11 → 13 의 여정이 이 차시의 이야기였다고 정리하고, 다음 차시(허프 변환)에서는 “모양을 수식으로 찾는” 다른 접근을 배운다고 예고합니다. (3분)</p>' }
        ]
      }
    ]
  });
})();
