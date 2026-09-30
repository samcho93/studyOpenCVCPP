/* 13차시 허프 변환: 직선과 원 검출 */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 직선의 극좌표(ρ, θ) 표현
  const FIG_POLAR = `<svg viewBox="0 0 700 300" role="img" aria-label="직선을 원점에서의 거리 rho 와 법선 각도 theta 로 나타내는 그림">
  ${ARROW('c13a1')}
  <rect x="40" y="30" width="330" height="240" rx="8" class="card-bg"/>
  <line x1="40" y1="30" x2="370" y2="30" class="ax"/><line x1="40" y1="30" x2="40" y2="270" class="ax"/>
  <text x="46" y="24" class="tx-m">(0, 0) 원점 = 왼쪽 위</text>
  <text x="352" y="48" class="tx-m">x</text><text x="52" y="264" class="tx-m">y</text>
  <line x1="90" y1="250" x2="350" y2="120" class="s1" stroke-width="3"/>
  <text x="300" y="112" class="tx-b">직선 L</text>
  <line x1="40" y1="30" x2="152" y2="254" class="s2" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#c13a1)"/>
  <text x="96" y="150" class="tx-b">ρ</text><text x="88" y="170" class="tx-m">원점 → L 최단 거리</text>
  <path d="M 100 30 A 60 60 0 0 1 66 86" class="ln" stroke-width="1.5"/>
  <text x="104" y="62" class="tx-b">θ</text>
  <circle cx="230" cy="185" r="4" class="p3"/><text x="238" y="182" class="tx-m">(x, y)</text>
  <rect x="400" y="50" width="280" height="200" rx="10" class="p1s"/>
  <text x="540" y="80" text-anchor="middle" class="tx-b">직선의 방정식 (허프 형식)</text>
  <text x="540" y="114" text-anchor="middle" class="tx-b">x · cos θ + y · sin θ = ρ</text>
  <text x="540" y="142" text-anchor="middle" class="tx-m">ρ = 원점에서 직선까지의 거리 (px)</text>
  <text x="540" y="164" text-anchor="middle" class="tx-m">θ = 그 수직선이 x축과 이루는 각 (0~180°)</text>
  <text x="540" y="192" text-anchor="middle" class="tx-m">y = ax + b 는 세로선에서 a 가 무한 →</text>
  <text x="540" y="212" text-anchor="middle" class="tx-m">모든 직선을 (ρ, θ) 두 수로 표현한다</text>
  <text x="540" y="238" text-anchor="middle" class="tx-m">C++: <tspan class="tx-b">Vec2f l</tspan> → l[0] = ρ, l[1] = θ(라디안)</text>
</svg>`;

  // 그림 2: 점 → 곡선 → 투표
  const FIG_VOTE = `<svg viewBox="0 0 740 320" role="img" aria-label="영상 공간의 세 점이 rho theta 공간에서 세 곡선이 되어 한 점에서 만나는 투표 원리">
  <rect x="20" y="40" width="300" height="250" rx="8" class="card-bg"/>
  <text x="170" y="30" text-anchor="middle" class="tx-b">① 영상 공간 (x, y) — 에지 점</text>
  <line x1="40" y1="60" x2="300" y2="60" class="ax"/><line x1="40" y1="60" x2="40" y2="275" class="ax"/>
  <line x1="60" y1="240" x2="260" y2="140" class="s1" stroke-width="2" stroke-dasharray="5 4"/>
  <circle cx="80" cy="230" r="6" class="p1"/><text x="88" y="250" class="tx-m">A</text>
  <circle cx="160" cy="190" r="6" class="p2"/><text x="168" y="210" class="tx-m">B</text>
  <circle cx="240" cy="150" r="6" class="p3"/><text x="248" y="170" class="tx-m">C</text>
  <text x="120" y="120" class="tx-m">세 점이 한 직선 위에 있다</text>
  <text x="120" y="140" class="tx-m">— 그 직선을 찾고 싶다</text>
  <rect x="380" y="40" width="340" height="250" rx="8" class="card-bg"/>
  <text x="550" y="30" text-anchor="middle" class="tx-b">② 파라미터 공간 (θ, ρ) — 투표</text>
  <line x1="400" y1="240" x2="700" y2="240" class="ax"/><line x1="400" y1="60" x2="400" y2="270" class="ax"/>
  <text x="690" y="262" class="tx-m">θ</text><text x="380" y="70" class="tx-m">ρ</text>
  <text x="400" y="262" class="tx-m">0°</text><text x="540" y="262" class="tx-m">90°</text><text x="676" y="262" class="tx-m">180°</text>
  <polyline points="400,224 422,209 444,194 466,182 488,177 510,175 532,176 554,183 576,193 598,206 620,222 642,240 664,258 686,272" class="s1" fill="none" stroke-width="2.5"/>
  <polyline points="400,192 422,178 444,170 466,168 488,170 510,175 532,186 554,200 576,216 598,234 620,252 642,268 664,282 686,290" class="s2" fill="none" stroke-width="2.5"/>
  <polyline points="400,160 422,152 444,150 466,154 488,164 510,175 532,194 554,216 576,240 598,264 620,284 642,290" class="s3" fill="none" stroke-width="2.5"/>
  <circle cx="510" cy="175" r="9" class="p4"/>
  <text x="524" y="160" class="tx-b">3표!</text>
  <text x="524" y="140" class="tx-m">(θ*, ρ*) = 찾던 직선</text>
  <text x="410" y="90" class="tx-m">점 하나 → 곡선 하나</text>
  <text x="410" y="110" class="tx-m">(그 점을 지나는 모든 직선)</text>
  <text x="20" y="312" class="tx-m">③ 누적 배열(accumulator)에서 threshold 표 이상 모인 칸을 직선으로 인정한다 → 표 수 = 그 직선 위의 에지 점 개수</text>
</svg>`;

  // 그림 3: 원 허프 변환 (기울기 방향 투표)
  const FIG_CIRCLE = `<svg viewBox="0 0 720 300" role="img" aria-label="에지 점의 기울기 방향으로 중심 후보에 투표해 원의 중심을 찾는 그림">
  ${ARROW('c13b1')}
  <rect x="20" y="30" width="320" height="250" rx="8" class="card-bg"/>
  <text x="180" y="22" text-anchor="middle" class="tx-b">① 에지 점 + 기울기 방향 → 중심 투표</text>
  <circle cx="180" cy="160" r="78" class="s1" fill="none" stroke-width="3"/>
  <circle cx="180" cy="160" r="4" class="p4"/>
  <text x="188" y="156" class="tx-m">중심 (a, b)</text>
  <circle cx="180" cy="82" r="5" class="p1"/><line x1="180" y1="82" x2="180" y2="150" class="s2" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#c13b1)"/>
  <circle cx="255" cy="185" r="5" class="p1"/><line x1="255" y1="185" x2="190" y2="163" class="s2" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#c13b1)"/>
  <circle cx="123" cy="214" r="5" class="p1"/><line x1="123" y1="214" x2="172" y2="168" class="s2" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#c13b1)"/>
  <text x="34" y="266" class="tx-m">에지마다 기울기(법선) 방향 직선을 그으면 중심에서 겹친다</text>
  <rect x="370" y="30" width="330" height="250" rx="8" class="card-bg"/>
  <text x="535" y="22" text-anchor="middle" class="tx-b">② 2단계 계산 (HOUGH_GRADIENT)</text>
  <rect x="390" y="50" width="290" height="46" rx="8" class="p1s"/>
  <text x="535" y="70" text-anchor="middle" class="tx">1단계: 중심 (a, b) 투표</text>
  <text x="535" y="88" text-anchor="middle" class="tx-m">param2 표 이상 · 서로 minDist 이상 떨어진 칸만</text>
  <rect x="390" y="108" width="290" height="46" rx="8" class="p2s"/>
  <text x="535" y="128" text-anchor="middle" class="tx">2단계: 중심마다 반지름 r 투표</text>
  <text x="535" y="146" text-anchor="middle" class="tx-m">minRadius ~ maxRadius 범위에서 가장 표가 많은 r</text>
  <rect x="390" y="166" width="290" height="46" rx="8" class="p3s"/>
  <text x="535" y="186" text-anchor="middle" class="tx">에지는 내부에서 Canny(param1) 로 구한다</text>
  <text x="535" y="204" text-anchor="middle" class="tx-m">→ 입력은 <tspan class="tx-b">그레이 영상</tspan> (이진화 영상 아님!)</text>
  <text x="390" y="238" class="tx-m">3차원 (a, b, r) 을 한 번에 세면 너무 느리므로</text>
  <text x="390" y="258" class="tx-m">중심 → 반지름 두 단계로 나눈다 = Hough Gradient 방법</text>
</svg>`;

  // 그림 4: 결과 자료형 — Vec2f / Vec4i / Vec3f
  const FIG_TYPES = `<svg viewBox="0 0 740 200" role="img" aria-label="HoughLines, HoughLinesP, HoughCircles 의 결과 벡터 원소 구조">
  <text x="20" y="24" class="tx-b">세 함수의 결과는 모두 std::vector — 원소 하나가 직선 · 선분 · 원 하나</text>
  <rect x="20" y="40" width="220" height="140" rx="10" class="p1s"/>
  <text x="130" y="64" text-anchor="middle" class="tx-b">HoughLines</text>
  <text x="130" y="84" text-anchor="middle" class="tx-m">vector&lt;Vec2f&gt;</text>
  <rect x="45" y="100" width="80" height="32" class="p1"/><text x="85" y="121" text-anchor="middle" class="tx-w">[0] ρ</text>
  <rect x="135" y="100" width="80" height="32" class="p1"/><text x="175" y="121" text-anchor="middle" class="tx-w">[1] θ</text>
  <text x="130" y="160" text-anchor="middle" class="tx-m">무한 직선 (라디안 각도)</text>
  <rect x="260" y="40" width="220" height="140" rx="10" class="p2s"/>
  <text x="370" y="64" text-anchor="middle" class="tx-b">HoughLinesP</text>
  <text x="370" y="84" text-anchor="middle" class="tx-m">vector&lt;Vec4i&gt;</text>
  <rect x="275" y="100" width="46" height="32" class="p2"/><text x="298" y="121" text-anchor="middle" class="tx-w">x1</text>
  <rect x="323" y="100" width="46" height="32" class="p2"/><text x="346" y="121" text-anchor="middle" class="tx-w">y1</text>
  <rect x="371" y="100" width="46" height="32" class="p2"/><text x="394" y="121" text-anchor="middle" class="tx-w">x2</text>
  <rect x="419" y="100" width="46" height="32" class="p2"/><text x="442" y="121" text-anchor="middle" class="tx-w">y2</text>
  <text x="370" y="160" text-anchor="middle" class="tx-m">끝점 두 개가 있는 선분 (정수)</text>
  <rect x="500" y="40" width="220" height="140" rx="10" class="p3s"/>
  <text x="610" y="64" text-anchor="middle" class="tx-b">HoughCircles</text>
  <text x="610" y="84" text-anchor="middle" class="tx-m">vector&lt;Vec3f&gt;</text>
  <rect x="520" y="100" width="58" height="32" class="p3"/><text x="549" y="121" text-anchor="middle" class="tx-w">cx</text>
  <rect x="581" y="100" width="58" height="32" class="p3"/><text x="610" y="121" text-anchor="middle" class="tx-w">cy</text>
  <rect x="642" y="100" width="58" height="32" class="p3"/><text x="671" y="121" text-anchor="middle" class="tx-w">r</text>
  <text x="610" y="160" text-anchor="middle" class="tx-m">중심 + 반지름 (실수)</text>
</svg>`;

  // ------------------------------------------------------------------ 1교시 코드
  const EX_LINES = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/bracket_edges.png", IMREAD_GRAYSCALE);
    Mat edges;
    Canny(img, edges, 60, 160);
    cout << "에지 픽셀 수: " << countNonZero(edges) << endl;

    // rho 1픽셀, theta 1도, 같은 직선에 110표 이상 모이면 직선으로 인정
    vector<Vec2f> lines;                          // 원소 하나 = (rho, theta)
    HoughLines(edges, lines, 1, CV_PI / 180, 110);
    cout << "직선 " << lines.size() << "개" << endl;

    Mat canvas;
    cvtColor(img, canvas, COLOR_GRAY2BGR);
    for (const Vec2f& l : lines)
    {
        float rho = l[0], theta = l[1];
        double ct = cos(theta), st = sin(theta);
        double x0 = rho * ct, y0 = rho * st;      // 원점에서 가장 가까운 직선 위의 점
        Point p1(cvRound(x0 - 1000 * st), cvRound(y0 + 1000 * ct));
        Point p2(cvRound(x0 + 1000 * st), cvRound(y0 - 1000 * ct));
        line(canvas, p1, p2, Scalar(0, 0, 255), 2);
        double deg = theta * 180 / CV_PI;
        cout << format("  rho = %6.1f px, theta = %5.1f deg  -> 직선 기울기 %5.1f deg", rho, deg, 90 - deg) << endl;
    }
    imshow("edges", edges);
    imshow("lines", canvas);
    waitKey(0);
    return 0;
}`;

  const EX_LINESP = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/bracket_edges.png", IMREAD_GRAYSCALE);
    Mat edges;
    Canny(img, edges, 60, 160);

    // threshold 80표 · 최소 길이 100px · 끊긴 간격 10px 까지 이어 붙임
    vector<Vec4i> segs;                           // 원소 하나 = (x1, y1, x2, y2)
    HoughLinesP(edges, segs, 1, CV_PI / 180, 80, 100, 10);
    cout << "선분 " << segs.size() << "개" << endl;

    // 길이 계산 람다 → 긴 것부터 정렬 (같은 길이는 원래 순서 유지: stable_sort)
    auto len = [](const Vec4i& s) { return hypot(s[2] - s[0], s[3] - s[1]); };
    stable_sort(segs.begin(), segs.end(), [&](const Vec4i& a, const Vec4i& b) { return len(a) > len(b); });

    Mat canvas;
    cvtColor(img, canvas, COLOR_GRAY2BGR);
    for (size_t i = 0; i < segs.size(); i++)
    {
        const Vec4i& s = segs[i];
        Point p1(s[0], s[1]), p2(s[2], s[3]);
        line(canvas, p1, p2, Scalar(0, 255, 0), 2);
        circle(canvas, p1, 4, Scalar(0, 0, 255), FILLED);     // 빨강 = 시작점
        circle(canvas, p2, 4, Scalar(255, 0, 0), FILLED);     // 파랑 = 끝점
        cout << format("  [%d] (%3d,%3d) - (%3d,%3d)  길이 %6.1f", (int)i, s[0], s[1], s[2], s[3], len(s)) << endl;
    }
    imshow("segments", canvas);
    waitKey(0);
    return 0;
}`;

  const EX_PARAMS = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/bracket_edges.png", IMREAD_GRAYSCALE);
    Mat edges;
    Canny(img, edges, 60, 160);

    // 파라미터 세 개를 받아 선분 개수를 돌려주는 람다
    auto count = [&](int th, double minLen, double gap) {
        vector<Vec4i> segs;
        HoughLinesP(edges, segs, 1, CV_PI / 180, th, minLen, gap);
        return (int)segs.size();
    };

    cout << "threshold (minLineLength 100, maxLineGap 10)" << endl;
    for (int th : {40, 80, 120, 160})
        cout << format("  threshold %3d -> 선분 %d개", th, count(th, 100, 10)) << endl;

    cout << "minLineLength (threshold 80, maxLineGap 10)" << endl;
    for (int ml : {20, 80, 140, 200})
        cout << format("  minLineLength %3d -> 선분 %d개", ml, count(80, ml, 10)) << endl;

    cout << "maxLineGap (threshold 80, minLineLength 100)" << endl;
    for (int gap : {2, 16, 30})
        cout << format("  maxLineGap %2d -> 선분 %d개", gap, count(80, 100, gap)) << endl;
    return 0;
}`;

  const EX_ANGLE = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/bracket_edges.png", IMREAD_GRAYSCALE);
    Mat edges;
    Canny(img, edges, 60, 160);

    // theta 를 0.5도(CV_PI/360)로 잘게 → 긴 변이 한 덩어리로 잡힌다
    vector<Vec4i> segs;
    HoughLinesP(edges, segs, 1, CV_PI / 360, 80, 100, 10);
    cout << "선분 " << segs.size() << "개 (theta 0.5도)" << endl;

    auto len = [](const Vec4i& s) { return hypot(s[2] - s[0], s[3] - s[1]); };
    Vec4i L = *max_element(segs.begin(), segs.end(),
                           [&](const Vec4i& a, const Vec4i& b) { return len(a) < len(b); });
    cout << format("가장 긴 선분: (%d,%d) - (%d,%d), 길이 %.1f px", L[0], L[1], L[2], L[3], len(L)) << endl;

    double dx = L[2] - L[0], dy = L[3] - L[1];
    double screenDeg = atan2(dy, dx) * 180 / CV_PI;   // 화면 좌표(y 아래쪽 +)
    double ccwDeg = -screenDeg;                       // 수학 좌표(반시계 +)
    cout << format("화면 기준 각도 = %.2f deg (y축이 아래쪽)", screenDeg) << endl;
    cout << format("반시계 기준 각도 = %.2f deg", ccwDeg) << endl;
    cout << format("정답 +3.50 deg, 오차 %.2f deg", fabs(ccwDeg - 3.5)) << endl;

    Mat canvas;
    cvtColor(img, canvas, COLOR_GRAY2BGR);
    line(canvas, Point(L[0], L[1]), Point(L[2], L[3]), Scalar(0, 0, 255), 2);
    line(canvas, Point(L[0], L[1]), Point(L[2], L[1]), Scalar(0, 200, 255), 1);   // 수평 기준선
    putText(canvas, format("%.2f deg CCW", ccwDeg), Point(150, 120), FONT_HERSHEY_SIMPLEX, 0.8, Scalar(0, 255, 0), 2);
    imshow("angle", canvas);
    waitKey(0);
    return 0;
}`;

  const EX_TRACK = `// 로컬 PC 전용: 트랙바 세 개로 HoughLinesP 파라미터를 끌어 보며 조정합니다
#include <opencv2/opencv.hpp>
using namespace cv;
using namespace std;

Mat g_gray, g_edges;

void onChange(int, void*)
{
    int th  = max(getTrackbarPos("threshold", "hough"), 1);   // 0 표는 의미가 없으므로 최소 1
    int len = getTrackbarPos("minLineLength", "hough");
    int gap = getTrackbarPos("maxLineGap", "hough");
    vector<Vec4i> segs;
    HoughLinesP(g_edges, segs, 1, CV_PI / 180, th, len, gap);

    Mat canvas;
    cvtColor(g_gray, canvas, COLOR_GRAY2BGR);
    for (const Vec4i& s : segs)
        line(canvas, Point(s[0], s[1]), Point(s[2], s[3]), Scalar(0, 255, 0), 2);
    putText(canvas, format("th=%d len=%d gap=%d -> %d segments", th, len, gap, (int)segs.size()),
            Point(10, 30), FONT_HERSHEY_SIMPLEX, 0.7, Scalar(0, 0, 255), 2);
    imshow("hough", canvas);
}

int main()
{
    g_gray = imread("images/bracket_edges.png", IMREAD_GRAYSCALE);
    if (g_gray.empty()) return -1;
    Canny(g_gray, g_edges, 60, 160);
    namedWindow("hough");
    createTrackbar("threshold", "hough", nullptr, 200, onChange);
    createTrackbar("minLineLength", "hough", nullptr, 300, onChange);
    createTrackbar("maxLineGap", "hough", nullptr, 50, onChange);
    setTrackbarPos("threshold", "hough", 80);
    setTrackbarPos("minLineLength", "hough", 100);
    setTrackbarPos("maxLineGap", "hough", 10);
    onChange(0, nullptr);
    waitKey(0);                                  // 키를 누를 때까지 트랙바를 움직일 수 있다
    return 0;
}`;

  // ------------------------------------------------------------------ 2교시 코드
  const EX_CIRCLES = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    Mat blur;
    medianBlur(gray, blur, 5);

    // dp 1 · minDist 40 · param1(Canny 상위) 120 · param2(누적 임계) 30 · 반지름 15~45
    vector<Vec3f> circles;                        // 원소 하나 = (cx, cy, r)
    HoughCircles(blur, circles, HOUGH_GRADIENT, 1, 40, 120, 30, 15, 45);
    cout << "원 " << circles.size() << "개" << endl;

    // 위 → 아래, 같은 줄은 왼쪽 → 오른쪽 순으로 정렬
    sort(circles.begin(), circles.end(), [](const Vec3f& a, const Vec3f& b) {
        return a[1] != b[1] ? a[1] < b[1] : a[0] < b[0];
    });

    Mat canvas;
    cvtColor(gray, canvas, COLOR_GRAY2BGR);
    int s = 0, m = 0, l = 0;
    for (const Vec3f& c : circles)
    {
        float r = c[2];
        string cls = r < 23.5f ? "S" : (r < 30.5f ? "M" : "L");
        if (cls == "S") s++; else if (cls == "M") m++; else l++;
        Point ctr(cvRound(c[0]), cvRound(c[1]));
        circle(canvas, ctr, cvRound(r), Scalar(0, 0, 255), 2);
        circle(canvas, ctr, 2, Scalar(0, 255, 0), FILLED);
        putText(canvas, cls, Point(ctr.x - 8, ctr.y - cvRound(r) - 6), FONT_HERSHEY_SIMPLEX, 0.6, Scalar(0, 255, 255), 2);
        cout << format("  (%5.1f,%5.1f) r = %4.1f px -> ", c[0], c[1], r) << cls << endl;
    }
    cout << "크기별 개수: S " << s << "개 / M " << m << "개 / L " << l << "개" << endl;
    imshow("circles", canvas);
    waitKey(0);
    return 0;
}`;

  const EX_CPARAM = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    Mat blur;
    medianBlur(gray, blur, 5);

    // 인수를 바꿔 가며 원을 찾아 주는 람다
    auto find = [&](double minDist, double p2, int rMin, int rMax) {
        vector<Vec3f> c;
        HoughCircles(blur, c, HOUGH_GRADIENT, 1, minDist, 120, p2, rMin, rMax);
        return c;
    };

    cout << "param2 (누적 임계값) — 작으면 헛것까지, 크면 놓친다" << endl;
    for (int p2 : {30, 80, 100, 120, 150})
        cout << format("  param2 %3d -> %d개", p2, (int)find(40, p2, 15, 45).size()) << endl;

    cout << "minDist (중심 사이 최소 거리)" << endl;
    for (int md : {10, 40, 80, 150})
        cout << format("  minDist %3d -> %d개", md, (int)find(md, 30, 15, 45).size()) << endl;

    cout << "minRadius ~ maxRadius (크기 선별에 그대로 쓸 수 있다)" << endl;
    for (int r0 : {15, 25, 30})
    {
        vector<Vec3f> c = find(40, 30, r0, 45);
        sort(c.begin(), c.end(), [](const Vec3f& a, const Vec3f& b) { return a[2] < b[2]; });
        cout << format("  r %d~45 -> %d개 ", r0, (int)c.size());
        for (const Vec3f& v : c) cout << format(" %.0f", v[2]);
        cout << endl;
    }
    return 0;
}`;

  const EX_PRE = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

// 반지름 범위를 넓게(5~60) 열고 찾은 원의 반지름을 작은 순으로 출력
void report(const string& name, const Mat& src)
{
    vector<Vec3f> c;
    HoughCircles(src, c, HOUGH_GRADIENT, 1, 20, 120, 30, 5, 60);
    sort(c.begin(), c.end(), [](const Vec3f& a, const Vec3f& b) { return a[2] < b[2]; });
    cout << name << ": " << c.size() << "개, r =";
    for (const Vec3f& v : c) cout << format(" %.0f", v[2]);
    cout << endl;
}

int main()
{
    Mat gray = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    // 부품 안쪽에는 동심 홈이 있다. 전처리를 빼면 홈을 원으로 잡는다.
    report("전처리 없음", gray);

    Mat med;
    medianBlur(gray, med, 5);
    report("medianBlur(5)", med);

    Mat gau;
    GaussianBlur(gray, gau, Size(9, 9), 2);
    report("GaussianBlur(9x9, s=2)", gau);
    cout << "정답: r = 20 x5, 27 x4, 34 x3 (총 12개)" << endl;
    return 0;
}`;

  const EX_MM = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

const double MM_PER_PX = 0.05;      // 20 px = 1 mm

int main()
{
    Mat gray = imread("images/plate_holes.png", IMREAD_GRAYSCALE);
    Mat blur;
    medianBlur(gray, blur, 5);

    // dp 2 = 누적 배열을 절반 크기로 → 표가 모여 반지름이 더 안정적으로 나온다
    vector<Vec3f> holes;
    HoughCircles(blur, holes, HOUGH_GRADIENT, 2, 100, 150, 40, 30, 80);
    cout << "판재 " << gray.cols << "x" << gray.rows << ", 구멍 " << holes.size()
         << "개 (배율 " << MM_PER_PX << " mm/px)" << endl;
    sort(holes.begin(), holes.end(), [](const Vec3f& a, const Vec3f& b) {
        return a[1] != b[1] ? a[1] < b[1] : a[0] < b[0];
    });

    Mat canvas;
    cvtColor(gray, canvas, COLOR_GRAY2BGR);
    int ng = 0;
    for (const Vec3f& h : holes)
    {
        double dia = 2 * h[2] * MM_PER_PX;             // 지름 = 2 x 반지름 x 배율
        double nominal = dia > 5.0 ? 6.0 : 4.0;        // 공칭 지름 (Ø4 / Ø6)
        bool ok = fabs(dia - nominal) <= 0.1;
        if (!ok) ng++;
        Scalar col = ok ? Scalar(0, 255, 0) : Scalar(0, 0, 255);
        Point ctr(cvRound(h[0]), cvRound(h[1]));
        circle(canvas, ctr, cvRound(h[2]), col, 2);
        putText(canvas, format("%.2f", dia), Point(ctr.x - 30, ctr.y - cvRound(h[2]) - 8), FONT_HERSHEY_SIMPLEX, 0.6, col, 2);
        cout << format("  (%5.0f,%5.0f) r = %4.1f px -> 지름 %.2f mm (공칭 %.1f +-0.1) %s",
                       h[0], h[1], h[2], dia, nominal, ok ? "OK" : "NG") << endl;
    }
    cout << "판정: 불량 " << ng << "개" << endl;
    imshow("holes", canvas);
    waitKey(0);
    return 0;
}`;

  const EX_CONTOUR = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/coins_parts.png", IMREAD_GRAYSCALE);

    // ① 허프
    Mat blur;
    medianBlur(gray, blur, 5);
    vector<Vec3f> hough;
    HoughCircles(blur, hough, HOUGH_GRADIENT, 1, 40, 120, 30, 15, 45);
    sort(hough.begin(), hough.end(), [](const Vec3f& a, const Vec3f& b) {
        return a[1] != b[1] ? a[1] < b[1] : a[0] < b[0];
    });

    // ② 윤곽선 (12차시)
    Mat bin;
    threshold(gray, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    vector<vector<Point>> contours;
    findContours(bin, contours, RETR_EXTERNAL, CHAIN_APPROX_NONE);
    cout << "허프 " << hough.size() << "개 · 윤곽선 " << contours.size() << "개" << endl;
    cout << "  중심(허프)        r(허프)  중심(윤곽선)      r(minEnclosing)  차이" << endl;

    for (int i = 0; i < 4; i++)
    {
        const Vec3f& h = hough[i];
        // 허프 중심에 가장 가까운 윤곽선 고르기 (외접 사각형 중심 기준)
        auto dist = [&](const vector<Point>& c) {
            Rect r = boundingRect(c);
            return fabs(r.x + r.width / 2.0 - h[0]) + fabs(r.y + r.height / 2.0 - h[1]);
        };
        const vector<Point>& near = *min_element(contours.begin(), contours.end(),
            [&](const vector<Point>& a, const vector<Point>& b) { return dist(a) < dist(b); });
        Point2f ctr;
        float rad;
        minEnclosingCircle(near, ctr, rad);
        cout << format("  (%5.1f,%5.1f)  %5.1f   (%5.1f,%5.1f)   %5.2f         %5.2f",
                       h[0], h[1], h[2], ctr.x, ctr.y, rad, rad - h[2]) << endl;
    }
    return 0;
}`;

  // ------------------------------------------------------------------ 퀴즈
  const QUIZ1 = [
    { q: '허프 직선 변환에서 직선을 <code>y = ax + b</code> 대신 <code>x·cosθ + y·sinθ = ρ</code> 로 나타내는 이유는?', options: ['계산이 더 빠르기 때문', '세로 직선에서 기울기 a 가 무한이 되기 때문', 'ρ 가 정수라서 메모리를 아낄 수 있기 때문', 'OpenCV 가 극좌표만 지원하기 때문'], answer: 1,
      explain: '세로 직선은 <code>a</code> 가 ∞ 가 되어 누적 배열을 만들 수 없습니다. (ρ, θ) 는 <b>모든 직선을 유한한 두 수</b>로 표현합니다 (ρ 는 −대각선 길이 ~ +대각선 길이, θ 는 0~180°).' },
    { q: '<code>HoughLines</code> 와 <code>HoughLinesP</code> 의 결과 자료형으로 알맞은 것은?', options: ['둘 다 <code>vector&lt;Vec4i&gt;</code>', 'HoughLines 는 <code>vector&lt;Vec2f&gt;</code>(ρ, θ) — 무한 직선, HoughLinesP 는 <code>vector&lt;Vec4i&gt;</code>(x1, y1, x2, y2) — 선분', 'HoughLines 는 <code>vector&lt;Point&gt;</code>, HoughLinesP 는 <code>vector&lt;Rect&gt;</code>', 'HoughLinesP 는 <code>vector&lt;Vec3f&gt;</code>'], answer: 1,
      explain: '<code>HoughLines</code> 는 직선의 <b>방정식</b>(ρ, θ)만 주므로 그릴 때 화면 끝까지 늘려야 합니다. <code>HoughLinesP</code>(확률적 허프)는 실제 <b>끝점 두 개</b>를 정수로 주어 바로 <code>line()</code> 으로 그릴 수 있습니다.' },
    { q: '<code>HoughLinesP(edges, segs, 1, CV_PI/180, 80, 100, 10)</code> 에서 <code>10</code> 은 무엇인가?', options: ['최소 선분 길이', '허용 오차(픽셀)', '끊긴 구간을 이어 붙이는 최대 간격(maxLineGap)', '검출할 선분 개수'], answer: 2,
      explain: '인수 순서는 <code>(image, lines, rho, theta, threshold, minLineLength, maxLineGap)</code> 입니다. <b>maxLineGap</b> 을 너무 작게 하면(예: 2) 잡음으로 끊긴 에지가 이어지지 않아 선분이 하나도 안 나옵니다.' },
    { q: '화면 좌표에서 <code>atan2(dy, dx)</code> 가 <code>-3.47°</code> 였다. 부품은 어느 방향으로 얼마나 기울었나?', options: ['시계 방향 3.47°', '반시계 방향 3.47°', '시계 방향 86.53°', '알 수 없다'], answer: 1,
      explain: '영상의 <b>y축은 아래쪽이 +</b> 이므로 화면 각도의 부호를 뒤집으면 눈으로 보는 <b>반시계(CCW)</b> 각도가 됩니다. −3.47° → <b>반시계 +3.47°</b> (정답 +3.5°).' },
    { q: '<code>HoughLines</code> 의 입력으로 알맞은 것은?', options: ['컬러 원본 영상', 'Canny 등으로 만든 <b>에지(이진) 영상</b>', '거리 변환 결과', '히스토그램'], answer: 1,
      explain: '허프 직선 변환은 <b>0 이 아닌 픽셀</b>을 모두 에지 점으로 보고 투표합니다. 따라서 <code>Canny</code> 결과를 넣어야 합니다. (원 검출 <code>HoughCircles</code> 는 반대로 <b>그레이 영상</b>을 넣습니다!)' }
  ];

  const QUIZ2 = [
    { q: '<code>HoughCircles</code> 에 넣어야 하는 입력 영상은?', options: ['Canny 에지 영상', '이진화(0/255) 영상', '그레이스케일 영상 (8비트 1채널)', '컬러(BGR) 영상'], answer: 2,
      explain: '<code>HoughCircles</code> 는 내부에서 <b>스스로 Canny(param1)</b> 를 돌리고 기울기 방향까지 쓰기 때문에 <b>그레이 영상</b>을 넣습니다. 에지 영상을 넣으면 기울기 정보가 사라져 결과가 나빠집니다 — <code>HoughLines</code> 와 반대라서 가장 흔한 실수입니다.' },
    { q: '<code>HoughCircles(gray, circles, HOUGH_GRADIENT, 1, 40, 120, 30, 15, 45)</code> 에서 <code>40</code> 과 <code>30</code> 의 뜻은?', options: ['40 = 반지름, 30 = 개수', '40 = minDist(중심 간 최소 거리), 30 = param2(누적 임계값)', '40 = param1, 30 = dp', '40 = 최소 반지름, 30 = 최대 반지름'], answer: 1,
      explain: '순서는 <code>(image, circles, method, dp, minDist, param1, param2, minRadius, maxRadius)</code> 입니다. <b>minDist</b> 가 너무 크면 가까운 원을 놓치고(150 → 6개), <b>param2</b> 가 너무 크면 원을 못 찾습니다(150 → 0개).' },
    { q: '찾은 원 <code>Vec3f c</code> 로 원을 그리는 코드로 알맞은 것은?', options: ['<code>circle(img, c, c[2], color)</code>', '<code>circle(img, Point(cvRound(c[0]), cvRound(c[1])), cvRound(c[2]), color, 2)</code>', '<code>circle(img, Point(c[1], c[0]), c[2], color)</code>', '<code>rectangle(img, c, color)</code>'], answer: 1,
      explain: '<code>Vec3f</code> 는 <b>(cx, cy, r)</b> 순서의 실수입니다. <code>circle</code> 은 정수 중심 <code>Point</code> 와 정수 반지름을 받으므로 <code>cvRound</code> 로 반올림해 넘깁니다. (x, y) 순서를 (y, x) 로 바꾸는 실수에 주의하세요.' },
    { q: '배율이 0.05 mm/px 이고 반지름이 44.0 px 였다. 지름은?', options: ['2.20 mm', '4.40 mm', '8.80 mm', '0.44 mm'], answer: 1,
      explain: '지름 = 2 × 반지름 × 배율 = 2 × 44.0 × 0.05 = <b>4.40 mm</b>. 공칭 4.0±0.1 mm 를 벗어나므로 <b>NG</b> 입니다 (plate_holes.png 의 H4).' },
    { q: '허프 원 검출과 <code>윤곽선 + minEnclosingCircle</code> 을 비교한 설명 중 <u>틀린</u> 것은?', options: ['허프는 물체가 겹치거나 일부만 보여도 원을 찾을 수 있다', '윤곽선 방법은 이진화가 잘 되어야 하지만 서브픽셀에 가까운 정밀도를 얻기 쉽다', '허프는 반지름이 누적 배열 칸 단위라 정밀 측정에는 불리하다', '허프가 항상 더 정확하므로 측정에는 허프만 쓰면 된다'], answer: 3,
      explain: '허프는 <b>찾기(detection)</b> 에 강하고, 윤곽선 + 원 피팅은 <b>재기(measurement)</b> 에 강합니다. 현장에서는 허프로 대략 위치를 찾고 그 ROI 에서 윤곽선/에지 피팅으로 정밀 측정하는 <b>2단계</b> 방식을 많이 씁니다.' }
  ];

  CV_COURSE.addChapter({
    id: 'cv13', no: '13', title: '허프 변환: 직선과 원 검출', subtitle: '에지 점들을 모아 직선 · 원의 방정식을 찾는다 (각도 · 지름 측정)',
    summary: '에지 검출(10차시)이 알려 주는 것은 <b>점들</b>뿐입니다. 허프 변환(Hough Transform)은 이 점들이 <b>파라미터 공간에서 투표</b>하게 해서 직선과 원의 방정식을 찾아 줍니다. <code>HoughLines</code>(<code>vector&lt;Vec2f&gt;</code>) · <code>HoughLinesP</code>(<code>vector&lt;Vec4i&gt;</code>) 로 기울어진 판의 각도를 재고, <code>HoughCircles</code>(<code>vector&lt;Vec3f&gt;</code>) 로 원형 부품의 개수를 세고 구멍 지름을 mm 로 측정해 공차 판정까지 해 봅니다.',
    goals: ['허프 변환의 투표 원리와 (ρ, θ) 표현을 설명할 수 있다', 'HoughLines · HoughLinesP 로 직선 · 선분을 찾고 각도를 측정할 수 있다', 'HoughCircles 의 파라미터를 조절해 원형 부품을 세고 지름을 mm 로 측정할 수 있다', '허프 방법과 윤곽선 기반 방법의 장단점을 비교해 고를 수 있다'],
    sections: [
      {
        id: 'cv13-1', title: '허프 변환 원리와 직선 검출', minutes: 50,
        goals: ['에지 점 → (ρ, θ) 곡선 → 투표 과정을 말할 수 있다', 'HoughLines 와 HoughLinesP 의 차이와 결과 자료형(Vec2f · Vec4i)을 안다', 'threshold · minLineLength · maxLineGap 의 효과를 예측할 수 있다', '가장 긴 선분의 각도를 측정해 기울기를 보고할 수 있다'],
        flow: [['도입: 에지에서 직선으로', 5], ['원리: (ρ, θ) 투표', 15], ['HoughLines · HoughLinesP · 파라미터', 20], ['각도 측정 · 정리', 10]],
        content: [
          { type: 'h', text: '문제: 에지 점들을 "직선"으로 만들기' },
          { type: 'p', html: '10차시에서 <code>Canny</code> 로 에지를 찾았습니다. 그런데 결과는 <b>흰 점의 모음</b>일 뿐입니다. "이 판이 몇 도 기울었나?", "두 변 사이 거리가 몇 mm 인가?" 에 답하려면 점이 아니라 <b>직선의 방정식</b>이 필요합니다. 게다가 실제 영상의 에지는 잡음과 그림자 때문에 <b>중간중간 끊겨</b> 있습니다.' },
          { type: 'image', src: 'images/bracket_edges.png', caption: '예제 이미지: +3.5° 기울어진 판(380 × 170 px)의 백라이트 실루엣 — 이 각도를 코드로 알아내는 것이 목표', width: 460 },
          { type: 'p', html: '<b>허프 변환(Hough Transform)</b> 은 "점 하나하나가 자기가 속할 수 있는 모든 직선에 <b>투표</b>한다" 는 아이디어로 이 문제를 풉니다. 표를 가장 많이 받은 직선이 실제 직선입니다. 점이 끊겨 있어도, 몇 개가 잡음이어도 <b>표가 많은 쪽이 이기므로</b> 강건(robust)합니다.' },
          { type: 'h', text: '직선을 두 수로: ρ 와 θ' },
          { type: 'figure', html: FIG_POLAR, caption: '그림 1. 직선을 (ρ, θ) 로 표현 — ρ 는 원점에서의 최단 거리, θ 는 그 수직선이 x축과 이루는 각' },
          { type: 'p', html: '학교에서 배운 <code>y = ax + b</code> 는 <b>세로 직선</b>에서 기울기 a 가 무한이 되어 쓸 수 없습니다. 그래서 허프 변환은 <b>x · cos θ + y · sin θ = ρ</b> 형식을 씁니다. θ 는 0 ~ 180°, ρ 는 −(대각선 길이) ~ +(대각선 길이) 사이의 <b>유한한 범위</b>이므로 표를 셀 2차원 배열(누적 배열, accumulator)을 만들 수 있습니다.' },
          { type: 'figure', html: FIG_VOTE, caption: '그림 2. 영상의 점 하나 = (θ, ρ) 공간의 곡선 하나. 한 직선 위의 점들의 곡선은 한 칸에서 만난다 → 그 칸의 표 수 = 직선 위 점 개수' },
          { type: 'list', ordered: true, items: [
            '에지 영상의 <b>0 이 아닌 픽셀</b> (x, y) 를 하나씩 본다.',
            'θ 를 0°부터 180°까지 <code>theta</code> 간격으로 돌려 보며 ρ = x·cosθ + y·sinθ 를 계산하고, 누적 배열의 (ρ, θ) 칸에 <b>1표</b>를 넣는다.',
            '모든 점이 끝나면 누적 배열에서 <b>threshold 표 이상 받은 칸</b>을 찾는다.',
            '그 칸의 (ρ, θ) 가 곧 직선의 방정식이다.'
          ] },
          { type: 'figure', html: FIG_TYPES, caption: '그림 3. 허프 함수 세 개의 결과 자료형 — OpenCV 의 고정 크기 벡터 Vec2f · Vec4i · Vec3f 를 원소로 하는 std::vector' },
          { type: 'table', head: ['', '<code>HoughLines</code>', '<code>HoughLinesP</code> (확률적)'], rows: [
            ['결과 형식', '<code>vector&lt;Vec2f&gt;</code> — <code>l[0]</code> = ρ, <code>l[1]</code> = θ(라디안)', '<code>vector&lt;Vec4i&gt;</code> — <code>(x1, y1, x2, y2)</code>'],
            ['의미', '무한히 긴 <b>직선</b> (시작·끝이 없다)', '실제 에지가 있는 <b>선분</b>'],
            ['그리기', 'ρ, θ 로 두 점을 계산해 길게 그어야 함', '<code>line(img, Point(s[0], s[1]), Point(s[2], s[3]), …)</code>'],
            ['추가 인수', '없음 (threshold 까지)', '<code>minLineLength</code>, <code>maxLineGap</code>'],
            ['속도', '모든 점 × 모든 θ', '점을 무작위로 골라 확인 → 보통 더 빠름'],
            ['주로 쓰는 곳', '판의 기준선 · 격자 방향처럼 <b>방향</b>만 필요할 때', '길이 · 위치가 필요한 대부분의 실무'],
            ['Python 이름', '<code>cv2.HoughLines</code>', '<code>cv2.HoughLinesP</code>']
          ], caption: '표 1. 두 함수의 차이 — 실무에서는 HoughLinesP 를 훨씬 많이 쓴다' },
          { type: 'h', text: 'HoughLines: 직선의 방정식 찾기' },
          { type: 'code', title: '예제 1: HoughLines 로 판의 긴 변 찾기', code: EX_LINES,
            desc: '<code>threshold 110</code> 은 "같은 직선에 에지 점이 110개 이상" 이라는 뜻입니다. 짧은 변(170 px)은 표가 부족해 빠지고 <b>긴 변(380 px) 두 개만</b> 남았습니다. 그런데 결과가 4개인 이유는 θ 를 1° 칸으로 잘랐기 때문에 실제 86.5° 인 변이 <b>86° 칸과 87° 칸에 나뉘어</b> 두 번 검출되었기 때문입니다. 그리기 공식은 직선 위의 한 점 (ρcosθ, ρsinθ) 에서 직선 방향 <b>(−sinθ, cosθ)</b> 로 ±1000 px 늘린 것입니다. <code>cvRound</code> 는 실수를 가장 가까운 정수로 반올림하는 OpenCV 함수입니다.',
            expect: '에지 픽셀 수: 1316\n직선 4개\n  rho =  343.0 px, theta =  87.0 deg  -> 직선 기울기   3.0 deg\n  rho =  172.0 px, theta =  87.0 deg  -> 직선 기울기   3.0 deg\n  rho =  178.0 px, theta =  86.0 deg  -> 직선 기울기   4.0 deg\n  rho =  347.0 px, theta =  86.0 deg  -> 직선 기울기   4.0 deg' },
          { type: 'callout', kind: 'warn', title: '허프의 두 가지 해상도', html: '<ul><li><code>rho = 1</code> (픽셀), <code>theta = CV_PI/180</code> (1°) 은 <b>누적 배열의 칸 크기</b>입니다. 칸이 크면 빠르지만 각도 정밀도가 1° 로 떨어지고, 하나의 직선이 <b>옆 칸으로 새어 두 번</b> 검출될 수 있습니다.</li><li>정밀한 각도가 필요하면 <code>CV_PI/360</code>(0.5°) 처럼 잘게 나눕니다. 대신 표가 흩어져 <code>threshold</code> 도 함께 낮춰야 할 수 있습니다.</li><li>θ 는 <b>라디안</b>입니다. 도(°)로 보려면 <code>theta * 180 / CV_PI</code>. <code>CV_PI</code> 는 OpenCV 가 정의한 π 상수입니다.</li><li>같은 변이 여러 번 나오는 것을 막으려면 (ρ, θ) 가 비슷한 직선을 <b>하나로 묶는(clustering) 후처리</b>가 필요합니다 — 또는 아예 <code>HoughLinesP</code> 를 씁니다.</li></ul>' },
          { type: 'h', text: 'HoughLinesP: 끝점이 있는 선분' },
          { type: 'code', title: '예제 2: HoughLinesP 로 선분 찾기', code: EX_LINESP,
            desc: '<code>Vec4i</code> 는 <code>(x1, y1, x2, y2)</code> 네 정수입니다. 길이는 <code>hypot(dx, dy)</code> 로 직접 계산하고, 람다를 비교 함수로 넘겨 <code>stable_sort</code> 로 긴 것부터 정렬했습니다(같은 길이는 원래 순서 유지). 결과를 보면 긴 변이 <b>146 px 짜리 두 조각</b>으로 끊어졌습니다 — θ 를 1° 로 잘랐기 때문입니다. 아래 예제 4 에서 이 문제를 해결합니다. 빨강 점 = 시작점, 파랑 점 = 끝점입니다.',
            expect: '선분 6개\n  [0] (204,333) - (350,325)  길이  146.2\n  [1] (335,325) - (481,317)  길이  146.2\n  [2] (182,164) - (328,156)  길이  146.2\n  [3] (126,209) - (134,337)  길이  128.2\n  [4] (390,152) - (503,145)  길이  113.2\n  [5] (503,146) - (510,255)  길이  109.2' },
          { type: 'callout', kind: 'tip', title: 'Vec4i 를 Point 두 개로', html: '<code>Vec4i s</code> 를 다룰 때마다 <code>Point(s[0], s[1])</code>, <code>Point(s[2], s[3])</code> 를 쓰는 것이 번거로우면 작은 구조체를 만들어 두세요: <code>struct Seg { Point p1, p2; double length() const { return norm(p2 - p1); } };</code>. 16차시에서 이런 작은 자료형을 모아 검사 도구 클래스를 설계합니다. <code>norm(Point)</code> 은 점의 원점 거리(√(x²+y²))를 돌려줍니다.' },
          { type: 'code', title: '예제 3: 파라미터 세 개의 효과', code: EX_PARAMS,
            desc: '세 파라미터를 하나씩 바꿔 보면 성격이 분명해집니다. <code>threshold</code> 를 120 으로 올리면 <b>선분이 아예 사라집니다</b> (각 변의 표가 120 미만). <code>minLineLength</code> 를 200 으로 올리면 조각난 선분이 모두 걸러집니다. <code>maxLineGap</code> 을 2 로 줄이면 잡음으로 끊긴 에지를 못 이어 붙여 <b>0개</b>가 되고, 16 이상이면 오히려 7개로 늘어납니다. 람다 <code>count</code> 가 <code>[&amp;]</code> 로 <code>edges</code> 를 참조 캡처해 같은 에지 영상을 반복해서 씁니다.',
            expect: 'threshold (minLineLength 100, maxLineGap 10)\n  threshold  40 -> 선분 6개\n  threshold  80 -> 선분 6개\n  threshold 120 -> 선분 0개\n  threshold 160 -> 선분 0개\nminLineLength (threshold 80, maxLineGap 10)\n  minLineLength  20 -> 선분 6개\n  minLineLength  80 -> 선분 6개\n  minLineLength 140 -> 선분 3개\n  minLineLength 200 -> 선분 0개\nmaxLineGap (threshold 80, minLineLength 100)\n  maxLineGap  2 -> 선분 0개\n  maxLineGap 16 -> 선분 7개\n  maxLineGap 30 -> 선분 7개' },
          { type: 'table', head: ['인수', '뜻', '크게 하면', '작게 하면'], rows: [
            ['<code>rho</code>', '거리 칸 크기 (px)', '빠르지만 위치 정밀도 ↓', '정밀하지만 표가 흩어짐'],
            ['<code>theta</code>', '각도 칸 크기 (라디안)', '각도 정밀도 ↓ · 한 직선이 여러 번', '각도 정밀 ↑ · threshold 를 낮춰야 함'],
            ['<code>threshold</code>', '직선으로 인정할 최소 표 수', '확실한 직선만 (놓침 ↑)', '잡음 직선까지 (오검출 ↑)'],
            ['<code>minLineLength</code>', '이 길이보다 짧은 선분은 버림', '짧은 조각 제거', '짧은 잡음 선분도 남음'],
            ['<code>maxLineGap</code>', '끊긴 간격을 이어 붙일 최대 거리', '멀리 떨어진 선까지 한 선으로 합침', '조금만 끊겨도 따로 나오거나 사라짐']
          ], caption: '표 2. 허프 직선 파라미터 정리 — 보통 threshold → minLineLength → maxLineGap 순으로 조정한다' },
          { type: 'callout', kind: 'vs', title: 'Visual Studio 에서는 — 트랙바로 허프 파라미터 조절', html: '허프 파라미터는 현장에서 계속 손대는 값입니다. 로컬 PC 에서는 아래 코드처럼 <code>createTrackbar</code> 세 개를 붙여 <code>threshold</code> · <code>minLineLength</code> · <code>maxLineGap</code> 을 끌어 가며 결과를 바로 보세요. 콜백 안에서 <code>threshold</code> 를 <code>max(…, 1)</code> 로 막는 것처럼 <b>잘못된 값을 코드에서 걸러 내는</b> 습관이 중요합니다. 브라우저에서는 트랙바가 동작하지 않으므로 예제 3 처럼 값을 여러 개 돌려 비교합니다.' },
          { type: 'code', title: '추가: 트랙바로 HoughLinesP 파라미터 조절 (로컬 전용)', code: EX_TRACK, run: false, local: true, file: 'main.cpp',
            desc: '<code>getTrackbarPos</code> 로 세 값을 읽어 매번 <code>HoughLinesP</code> 를 다시 돌립니다. 같은 동작의 브라우저 버전이 예제 3 입니다. 전역 변수 <code>g_gray</code> · <code>g_edges</code> 는 콜백에서 쓰기 위한 것이며, 16차시에서는 이런 상태를 클래스 멤버로 옮깁니다.' },
          { type: 'h', text: '응용: 부품의 기울기 각도 측정' },
          { type: 'code', title: '예제 4: 가장 긴 선분으로 기울기 재기 (정답 +3.5°)', code: EX_ANGLE,
            desc: '<code>theta</code> 를 <b>0.5°</b> 로 잘게 하니 긴 변이 <b>379.7 px 한 덩어리</b>로 잡혔습니다 (실제 380 px). <code>max_element</code> 에 길이 비교 람다를 주어 가장 긴 선분을 고르고, <code>atan2(dy, dx)</code> 로 각도를 구하면 −3.47° 가 나옵니다. 부호를 뒤집은 <b>+3.47°</b> 가 우리가 보는 반시계 기울기입니다. 정답 +3.5° 와 오차 0.03° — 1픽셀 단위 에지로도 이 정도 정밀도가 나옵니다.',
            expect: '선분 4개 (theta 0.5도)\n가장 긴 선분: (124,168) - (503,145), 길이 379.7 px\n화면 기준 각도 = -3.47 deg (y축이 아래쪽)\n반시계 기준 각도 = 3.47 deg\n정답 +3.50 deg, 오차 0.03 deg' },
          { type: 'callout', kind: 'warn', title: '⚠️ y축이 아래쪽이라 각도 부호가 뒤집힌다', html: '영상 좌표계는 <b>y 가 아래로 갈수록 커집니다</b>. 그래서 <code>atan2(dy, dx)</code> 로 얻은 각도는 <b>시계 방향이 +</b> 인 "화면 각도" 입니다. 사람이 말하는 반시계(CCW) 각도로 바꾸려면 <b>부호를 뒤집습니다</b>(<code>-screenDeg</code>).<br><code>atan2</code> 의 인수 순서는 <b>(y, x)</b> 입니다 — <code>atan2(dx, dy)</code> 로 쓰면 전혀 다른 값이 나옵니다. 같은 이유로 <code>getRotationMatrix2D(center, angle, 1)</code> 의 <code>angle</code> 은 <b>반시계</b>가 + 입니다(11차시). <code>minAreaRect</code> 의 <code>angle</code> 은 또 다른 규칙이라는 점도 기억해 두세요(12차시).' },
          { type: 'callout', kind: 'field', title: '현장 노트 — 각도 측정은 어디에 쓰나', html: '<ul><li><b>정렬(alignment)</b>: 트레이에 비뚤게 놓인 부품의 각도를 재서 로봇 손목 각도로 보내거나, <code>warpAffine</code> 으로 영상을 똑바로 돌린 뒤 검사합니다 (11차시).</li><li><b>직각도 · 평행도</b>: 두 변의 θ 차이가 90°±허용치인지 봅니다.</li><li><b>격자 방향</b>: 웨이퍼 다이 격자(<code>wafer_align.png</code>, +1.7°)처럼 반복 패턴의 방향을 허프로 구합니다.</li><li>정밀도를 더 올려야 하면 허프로 <b>대략적인 위치</b>를 찾고, 그 근처에서 <code>fitLine</code> 이나 1D 프로파일 서브픽셀 에지(캘리퍼)로 <b>다시 정밀 측정</b>합니다. 허프는 "찾기", 피팅은 "재기" 입니다.</li></ul>' },
          { type: 'callout', kind: 'more', title: '📘 더 알아보기 — 표 수 받기 · 모듈 위치', html: '<ul><li><code>HoughLines</code> 에 <code>vector&lt;Vec3f&gt;</code> 를 넘기면 세 번째 값으로 그 직선의 <b>표 수(votes)</b>까지 받을 수 있습니다(로컬 OpenCV). 표 수는 직선의 "확실한 정도" 라서 여러 직선 중 가장 확실한 것을 고를 때 씁니다.</li><li>허프 함수들은 OpenCV 5 에서도 그대로 <b>imgproc</b> 모듈(<code>&lt;opencv2/imgproc.hpp&gt;</code>)에 있습니다. <code>&lt;opencv2/opencv.hpp&gt;</code> 하나로 모두 포함되며, 링크할 라이브러리도 <code>opencv_world500.lib</code> 하나면 됩니다.</li><li>Python 은 <code>lines = cv2.HoughLinesP(edges, 1, np.pi/180, 80, minLineLength=100, maxLineGap=10)</code> 처럼 결과를 <b>반환값</b>으로 받고, C++ 은 <b>출력 인수</b>(<code>vector</code>)로 받습니다.</li></ul>' },
          { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 · 오개념 지도', html: '<ul><li><b>오개념 1</b>: "허프는 선을 그려 주는 함수" → 아닙니다. <b>방정식(ρ, θ)</b> 을 줄 뿐이고 그리는 것은 우리 몫입니다. 예제 1 에서 ±1000 을 ±50 으로 바꿔 보여 주면 확실해집니다.</li><li><b>오개념 2</b>: "threshold 는 밝기 임계값" → <b>표(투표) 개수</b>입니다. 에지 점이 몇 개나 그 직선 위에 있는지입니다.</li><li><b>오개념 3</b>: θ 가 직선의 기울기라고 생각합니다 → θ 는 <b>법선(수직선)</b> 의 각도입니다. 직선 자체의 기울기는 <code>90° − θ</code>.</li><li><b>C++ 실수</b>: <code>Vec4i</code> 의 순서를 (x1, x2, y1, y2) 로 착각, <code>theta</code> 를 도(°)로 착각해 <code>cos(90)</code> 을 계산하는 실수가 많습니다.</li><li>💬 발문: "threshold 를 120 으로 올렸더니 선분이 0개가 되었다. 왜?" — 각 변의 에지 점이 120개가 안 되기 때문. 영상을 2배로 키우면? (표가 늘어 다시 검출됨)</li><li>시간이 모자라면 예제 3(파라미터 표)을 시연으로만 보여 주고 실습 2 를 과제로 돌립니다.</li></ul>' }
        ],
        practice: [
          {
            title: '두 부품 사이의 틈 재기 (gap_measure.png)', level: 1,
            desc: '<code>images/gap_measure.png</code> 는 백라이트 앞 두 블록 사이에 <b>세로 틈</b>이 있는 영상입니다. <code>HoughLinesP</code> 로 선분을 찾고 그중 <b>세로 선분</b>(시작 · 끝의 x 차이가 2 이하)만 골라 x 좌표 순으로 정렬한 뒤, <b>가운데 두 선분의 간격</b>을 출력하세요. 정답(서브픽셀)은 18.60 px 입니다.',
            hint: '세로 선분은 <code>abs(s[2] - s[0]) &lt;= 2</code> 로 골라 <code>vector&lt;Vec4i&gt; vert</code> 에 넣고, <code>sort</code> 에 <code>a[0] &lt; b[0]</code> 람다를 줍니다. x 순으로 판 왼쪽 바깥(40), 왼쪽 부품 오른쪽 에지(300), 오른쪽 부품 왼쪽 에지(319), 오른쪽 바깥(600) 네 개가 나옵니다 → <code>vert[2][0] - vert[1][0]</code>.',
            expect: '선분 8개\n세로 선분 4개: x = 40 300 319 600\n틈 = 19 px (서브픽셀 정답 18.60 px)\n배율 0.02 mm/px -> 0.380 mm (정답 0.372 mm)',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/gap_measure.png", IMREAD_GRAYSCALE);
    Mat edges;
    Canny(img, edges, 60, 160);
    vector<Vec4i> segs;
    HoughLinesP(edges, segs, 1, CV_PI / 180, 100, 150, 5);
    cout << "선분 " << segs.size() << "개" << endl;

    // TODO: 세로 선분(abs(s[2] - s[0]) <= 2)만 vert 에 모아 x 좌표 순으로 정렬하세요
    vector<Vec4i> vert;

    // TODO: 가운데 두 선분의 x 간격을 출력하세요 (배율 0.02 mm/px 로 mm 도 함께)

    imshow("edges", edges);
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
    Mat img = imread("images/gap_measure.png", IMREAD_GRAYSCALE);
    Mat edges;
    Canny(img, edges, 60, 160);
    vector<Vec4i> segs;
    HoughLinesP(edges, segs, 1, CV_PI / 180, 100, 150, 5);
    cout << "선분 " << segs.size() << "개" << endl;

    vector<Vec4i> vert;
    for (const Vec4i& s : segs)
        if (abs(s[2] - s[0]) <= 2) vert.push_back(s);
    sort(vert.begin(), vert.end(), [](const Vec4i& a, const Vec4i& b) { return a[0] < b[0]; });
    cout << "세로 선분 " << vert.size() << "개: x =";
    for (const Vec4i& s : vert) cout << " " << s[0];
    cout << endl;

    int gap = vert[2][0] - vert[1][0];
    cout << "틈 = " << gap << " px (서브픽셀 정답 18.60 px)" << endl;
    cout << format("배율 0.02 mm/px -> %.3f mm (정답 0.372 mm)", gap * 0.02) << endl;

    Mat canvas;
    cvtColor(img, canvas, COLOR_GRAY2BGR);
    line(canvas, Point(vert[1][0], vert[1][1]), Point(vert[1][2], vert[1][3]), Scalar(0, 255, 0), 2);
    line(canvas, Point(vert[2][0], vert[2][1]), Point(vert[2][2], vert[2][3]), Scalar(0, 0, 255), 2);
    imshow("gap", canvas);
    waitKey(0);
    return 0;
}`
          },
          {
            title: '두 짧은 변 사이 거리 = 판의 길이', level: 2,
            desc: '<code>HoughLines</code> 로 <code>bracket_edges.png</code> 의 직선을 <code>threshold 90</code> 으로 찾으면 6개가 나옵니다. 이 중 <b>짧은 변 계열</b>(θ 가 약 176°)만 골라 <b>ρ 의 최대 − 최소</b>를 계산하면 두 짧은 변 사이 거리, 즉 판의 <b>긴 쪽 길이</b>가 나옵니다. 정답은 380.0 px 입니다.',
            hint: 'θ 는 라디안이므로 <code>l[1] * 180 / CV_PI</code> 로 도(°)로 바꿔 <code>fabs(deg - 176.5) &lt; 10</code> 으로 고릅니다. 같은 방향의 평행한 두 직선은 θ 가 같고 <b>ρ 만 다릅니다</b> — 그 차이가 수직 거리입니다. 최대 · 최소는 변수 두 개를 두고 <code>max</code> · <code>min</code> 으로 갱신하면 됩니다.',
            expect: '직선 6개\n짧은 변 계열(theta 약 176도) 2개\n  rho = -491.0, theta = 176.0 deg\n  rho = -111.0, theta = 176.0 deg\n두 짧은 변 사이 거리 = 380.0 px (정답 380.0)',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/bracket_edges.png", IMREAD_GRAYSCALE);
    Mat edges;
    Canny(img, edges, 60, 160);
    vector<Vec2f> lines;
    HoughLines(edges, lines, 1, CV_PI / 180, 90);
    cout << "직선 " << lines.size() << "개" << endl;
    for (const Vec2f& l : lines)
        cout << format("  rho = %.1f, theta = %.1f deg", l[0], l[1] * 180 / CV_PI) << endl;

    // TODO: theta 가 176도 근처(fabs(deg - 176.5) < 10)인 직선만 고르세요
    // TODO: 그 직선들의 rho 최대값 - 최소값 을 출력하세요
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/bracket_edges.png", IMREAD_GRAYSCALE);
    Mat edges;
    Canny(img, edges, 60, 160);
    vector<Vec2f> lines;
    HoughLines(edges, lines, 1, CV_PI / 180, 90);
    cout << "직선 " << lines.size() << "개" << endl;

    vector<Vec2f> shortSide;
    for (const Vec2f& l : lines)
        if (fabs(l[1] * 180 / CV_PI - 176.5) < 10) shortSide.push_back(l);
    cout << "짧은 변 계열(theta 약 176도) " << shortSide.size() << "개" << endl;

    float rMax = -1e9f, rMin = 1e9f;
    for (const Vec2f& l : shortSide)
    {
        cout << format("  rho = %.1f, theta = %.1f deg", l[0], l[1] * 180 / CV_PI) << endl;
        rMax = max(rMax, l[0]);
        rMin = min(rMin, l[0]);
    }
    cout << format("두 짧은 변 사이 거리 = %.1f px (정답 380.0)", rMax - rMin) << endl;
    return 0;
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: '허프 변환 ①: 직선 검출', subtitle: '에지 점들의 투표로 직선의 방정식을 찾는다', notes: '<p>10차시 Canny 결과 화면을 띄워 두고 시작합니다. 💬 “이 흰 점들만 보고 판이 몇 도 기울었는지 어떻게 알까요?” — 사람은 눈으로 선을 잇지만 컴퓨터는 점의 좌표 목록만 가지고 있다는 점을 강조합니다. (2분)</p>' },
          { layout: 'image', title: '오늘의 재료: 3.5° 기울어진 판', src: 'images/bracket_edges.png', caption: '380 × 170 px 판이 반시계 +3.5° 기울어져 있다 — 이 값을 코드로 맞히는 것이 1교시 목표', notes: '<p>정답을 미리 알려 주고 시작하면 학생이 자기 결과를 스스로 채점할 수 있습니다. 구멍(r=30)도 있어서 원 검출(2교시)에도 쓸 수 있다고 예고합니다. 💬 “에지가 중간에 끊기면 어떻게 될까?” (3분)</p>' },
          { layout: 'diagram', title: '직선을 두 수로: ρ 와 θ', html: FIG_POLAR, caption: 'x·cosθ + y·sinθ = ρ — 세로 직선도 문제없이 표현된다', notes: '<p>칠판에 세로선을 그리고 <code>y = ax + b</code> 로 써 보라고 시킵니다 → a 가 무한. 그래서 (ρ, θ). θ 는 <b>법선</b> 각도이고 직선 기울기는 90°−θ 라는 점을 꼭 짚습니다. ρ 는 음수도 됩니다(θ 를 0~180°로 제한하기 때문). C++ 에서는 <code>Vec2f</code> 의 [0] 이 ρ, [1] 이 θ(라디안). (7분)</p>' },
          { layout: 'diagram', title: '점 → 곡선 → 투표', html: FIG_VOTE, caption: '점 하나가 (θ, ρ) 공간의 곡선 하나. 곡선들이 만나는 칸의 표 수 = 그 직선 위 점의 개수', notes: '<p>여기가 이 차시의 핵심입니다. A, B, C 세 점을 하나씩 짚으며 “이 점을 지나는 직선은 무한히 많다 → 곡선 한 개” 를 반복합니다. 그 다음 “세 곡선이 만나는 칸은 세 점 모두를 지나는 직선” → 3표. threshold 는 이 표 수의 하한선. 💬 “잡음 점 하나가 들어오면?” — 곡선 하나가 늘지만 다른 곡선과 만나지 않아 표가 적다 = 강건함. (8분)</p>' },
          { layout: 'diagram', title: '결과 자료형: Vec2f · Vec4i · Vec3f', html: FIG_TYPES, caption: '허프 함수는 결과를 std::vector 출력 인수로 채운다 — 원소 하나 = 직선 · 선분 · 원 하나', notes: '<p>C++ 에서 가장 헷갈리는 부분이 “결과가 무슨 형인가” 입니다. <code>Vec2f</code> 는 float 2개, <code>Vec4i</code> 는 int 4개, <code>Vec3f</code> 는 float 3개짜리 고정 크기 벡터이고 <code>[i]</code> 로 꺼냅니다. 💬 “HoughLinesP 결과를 <code>vector&lt;Vec2f&gt;</code> 로 받으면?” — 실행 시 오류(형식 불일치). 2교시의 원 검출(Vec3f)까지 한 장에 미리 보여 줍니다. (3분)</p>' },
          { layout: 'code', title: 'HoughLines: 방정식 찾고 길게 그리기', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;
int main()
{
    Mat img = imread("images/bracket_edges.png", IMREAD_GRAYSCALE);
    Mat edges, canvas;
    Canny(img, edges, 60, 160);
    cvtColor(img, canvas, COLOR_GRAY2BGR);
    vector<Vec2f> lines;
    HoughLines(edges, lines, 1, CV_PI / 180, 110);
    for (const Vec2f& l : lines)
    {
        double ct = cos(l[1]), st = sin(l[1]);
        double x0 = l[0] * ct, y0 = l[0] * st;       // 원점에서 가장 가까운 점
        line(canvas, Point(cvRound(x0 - 1000 * st), cvRound(y0 + 1000 * ct)),
                     Point(cvRound(x0 + 1000 * st), cvRound(y0 - 1000 * ct)), Scalar(0, 0, 255), 2);
        cout << format("  rho=%.1f theta=%.1f", l[0], l[1] * 180 / CV_PI) << endl;
    }
    imshow("lines", canvas);
    waitKey(0);
    return 0;
}`, points: ['입력은 <b>에지 영상</b> (Canny 결과)', '<code>(ρcosθ, ρsinθ)</code> 에서 방향 <code>(−sinθ, cosθ)</code> 로 ±1000 px', '4개가 나오지만 실제로는 <b>긴 변 2개</b> — 1° 칸에 나뉘어 중복'], notes: '<p>실행 후 “왜 4개일까?” 💬 — θ 86°/87° 로 나뉘었다. 86.5° 가 정답이므로 칸 경계에 걸린 것. <code>±1000</code> 을 <code>±40</code> 으로 바꿔 실행해 “허프는 그려 주지 않는다” 를 체감시킵니다. <code>cvRound</code> 가 없으면 double → int 변환 경고가 나는 것도 짚어 주세요. (8분)</p>' },
          { layout: 'code', title: 'HoughLinesP: 선분 그대로 쓰기', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;
int main()
{
    Mat img = imread("images/bracket_edges.png", IMREAD_GRAYSCALE);
    Mat edges, canvas;
    Canny(img, edges, 60, 160);
    cvtColor(img, canvas, COLOR_GRAY2BGR);
    vector<Vec4i> segs;
    HoughLinesP(edges, segs, 1, CV_PI / 180, 80, 100, 10);
    cout << "선분 " << segs.size() << "개" << endl;
    for (const Vec4i& s : segs)
    {
        line(canvas, Point(s[0], s[1]), Point(s[2], s[3]), Scalar(0, 255, 0), 2);
        cout << format("  (%d,%d)-(%d,%d) 길이 %.1f", s[0], s[1], s[2], s[3],
                       hypot(s[2] - s[0], s[3] - s[1])) << endl;
    }
    imshow("segments", canvas);
    waitKey(0);
    return 0;
}`, points: ['인수: <code>(edges, segs, rho, theta, threshold, minLineLength, maxLineGap)</code>', '<code>Vec4i</code> = (x1, y1, x2, y2) → <code>Point</code> 두 개로', '길이는 <code>hypot(dx, dy)</code> 로 직접 계산', '긴 변이 146 px 두 조각으로 끊김 → 0.5° 로 해결'], notes: '<p>선분 6개의 좌표를 화면 그림과 대응시켜 봅니다. 146 px 조각 3개가 나오는 이유(θ 1° 칸)를 다시 확인하고, 0.5° 해법을 예고합니다. 정렬이 필요하면 <code>sort</code> 에 람다를 넘긴다는 것도 보여 주세요(본문 예제 2). (7분)</p>' },
          { layout: 'table', title: '파라미터를 하나씩 바꿔 보면', head: ['바꾼 값', '결과', '해석'], rows: [
            ['threshold 40 / 80', '6개 / 6개', '표가 충분한 구간'],
            ['threshold 120 / 160', '0개 / 0개', '각 변의 에지 점이 120개 미만 → 전멸'],
            ['minLineLength 140', '3개', '조각난 짧은 선분이 걸러짐'],
            ['minLineLength 200', '0개', '조각난 상태에서는 200 px 선분이 없음'],
            ['maxLineGap 2', '0개', '잡음으로 끊긴 에지를 못 이음'],
            ['maxLineGap 16 / 30', '7개 / 7개', '멀리 떨어진 것까지 합쳐 오히려 늘어남']
          ], lead: 'bracket_edges.png · Canny(60, 160) 기준 (본문 예제 3)', notes: '<p>표를 보며 “선분이 0개면 threshold 를 내린다, 조각나면 maxLineGap 을 올린다” 는 실전 순서를 정리합니다. maxLineGap 을 키우면 개수가 <b>늘 수도</b> 있다는 반직관적 결과를 함께 설명하세요(합쳐지면서 minLineLength 를 넘는 선분이 새로 생김). 로컬 PC 라면 트랙바 코드(본문 추가 예제)로 끌어 보게 합니다. (5분)</p>' },
          { layout: 'code', title: '각도 측정: theta 0.5° + atan2', code: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/bracket_edges.png", IMREAD_GRAYSCALE);
    Mat edges;
    Canny(img, edges, 60, 160);
    vector<Vec4i> segs;
    HoughLinesP(edges, segs, 1, CV_PI / 360, 80, 100, 10);

    auto len = [](const Vec4i& s) { return hypot(s[2] - s[0], s[3] - s[1]); };
    Vec4i L = *max_element(segs.begin(), segs.end(),
                           [&](const Vec4i& a, const Vec4i& b) { return len(a) < len(b); });
    cout << format("최장 선분 길이 %.1f px", len(L)) << endl;

    double screenDeg = atan2(L[3] - L[1], L[2] - L[0]) * 180 / CV_PI;
    cout << format("화면 각도 %.2f deg (y축 아래쪽)", screenDeg) << endl;
    cout << format("반시계 각도 %.2f deg  (정답 +3.50)", -screenDeg) << endl;
    return 0;
}`, points: ['<code>CV_PI/360</code> = 0.5° → 380 px 변이 한 덩어리로', '<code>max_element</code> + 길이 비교 람다', '<code>atan2(dy, dx)</code> 는 <b>화면</b> 각도 (y 아래쪽 +)', '부호를 뒤집어야 반시계 각도 — 오차 0.03°'], notes: '<p>여기서 부호 문제를 크게 다룹니다. 칠판에 y축을 아래로 그린 좌표계를 그리고, 오른쪽 위로 올라가는 선의 dy 가 <b>음수</b>임을 확인시킵니다. 💬 “atan2 에 (dx, dy) 순서로 넣으면?” — 완전히 다른 값. 인수 순서는 (y, x). (7분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>HoughLines</code> 의 입력으로 알맞은 것은?', options: ['컬러 원본 영상', 'Canny 등으로 만든 에지(이진) 영상', '거리 변환 결과', '히스토그램'], answer: 1, explain: '허프 직선 변환은 <b>0 이 아닌 픽셀</b>을 에지 점으로 보고 투표합니다. (원 검출 <code>HoughCircles</code> 는 반대로 <b>그레이 영상</b>을 넣습니다 — 2교시에서!)', notes: '<p>정답 2번. 여기서 2교시 예고를 겁니다: “원 검출은 입력이 반대다” — 가장 흔한 실수이므로 미리 심어 둡니다.</p>' },
          { layout: 'practice', title: '실습: 두 부품 사이 틈 재기', desc: '<p><code>images/gap_measure.png</code> 에서 세로 선분만 골라 가운데 두 선분의 간격을 구하세요 (정답 18.60 px).</p><ul><li>세로 판정: <code>abs(s[2] - s[0]) &lt;= 2</code></li><li>x 순 정렬 → 40, 300, 319, 600 네 개</li><li>배율 0.02 mm/px</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/gap_measure.png", IMREAD_GRAYSCALE);
    Mat edges;
    Canny(img, edges, 60, 160);
    vector<Vec4i> segs;
    HoughLinesP(edges, segs, 1, CV_PI / 180, 100, 150, 5);
    cout << "선분 " << segs.size() << "개" << endl;
    // TODO: 세로 선분만 고르고 x 순 정렬 → 가운데 두 개의 간격 출력
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/gap_measure.png", IMREAD_GRAYSCALE);
    Mat edges;
    Canny(img, edges, 60, 160);
    vector<Vec4i> segs, vert;
    HoughLinesP(edges, segs, 1, CV_PI / 180, 100, 150, 5);
    for (const Vec4i& s : segs)
        if (abs(s[2] - s[0]) <= 2) vert.push_back(s);
    sort(vert.begin(), vert.end(), [](const Vec4i& a, const Vec4i& b) { return a[0] < b[0]; });
    int gap = vert[2][0] - vert[1][0];
    cout << format("틈 = %d px -> %.3f mm", gap, gap * 0.02) << endl;
    return 0;
}`, notes: '<p>정답: 세로 선분 x = 40, 300, 319, 600 → 틈 19 px = 0.380 mm. 정답 18.60 px(0.372 mm) 와 0.4 px 차이가 나는 이유는 허프가 <b>정수 픽셀</b> 단위이기 때문 — 서브픽셀 측정은 프로파일 보간이 필요하다고 정리합니다. <code>vert</code> 가 4개보다 적으면 <code>vert[2]</code> 에서 범위 밖 접근이 되므로 <code>if (vert.size() &lt; 4)</code> 검사를 넣게 하면 좋습니다. (10분)</p>' },
          { layout: 'summary', title: '1교시 정리', bullets: ['허프 변환 = 에지 점들이 <b>(ρ, θ) 공간에서 투표</b> → 표 많은 칸이 직선', '<code>x·cosθ + y·sinθ = ρ</code> — θ 는 <b>법선</b> 각도(라디안), 직선 기울기는 90°−θ', '<code>HoughLines</code> → <code>vector&lt;Vec2f&gt;</code>(ρ, θ) / <code>HoughLinesP</code> → <code>vector&lt;Vec4i&gt;</code>(x1, y1, x2, y2)', 'threshold(표) · minLineLength(길이) · maxLineGap(간격) 세 개를 순서대로 조정', '각도는 <code>atan2(dy, dx)</code> → <b>부호를 뒤집어</b> 반시계 각도로 보고', '다음: 같은 투표 원리로 <b>원</b>을 찾는다 (HoughCircles)'], notes: '<p>여섯 줄을 학생이 소리내어 읽게 합니다. 2교시 예고: “원은 (a, b, r) 세 개라서 3차원 투표 — 어떻게 빨리 할까?” 를 숙제 질문으로 던집니다. (3분)</p>' }
        ]
      },
      {
        id: 'cv13-2', title: '허프 원 검출과 지름 측정', minutes: 50,
        goals: ['HoughCircles 의 2단계(중심 → 반지름) 동작과 입력 형식을 설명할 수 있다', 'dp · minDist · param1 · param2 · 반지름 범위를 조절해 원을 정확히 셀 수 있다', '검출한 반지름을 mm 로 환산해 공차 판정을 할 수 있다', '허프와 윤곽선(minEnclosingCircle) 방법을 비교해 상황에 맞게 고를 수 있다'],
        flow: [['도입: 원 찾기 문제', 5], ['HoughCircles 원리 · 파라미터', 15], ['개수 세기 · 지름 측정', 20], ['윤곽선 방법 비교 · 정리', 10]],
        content: [
          { type: 'h', text: '원은 (a, b, r) 세 개 — 3차원 투표?' },
          { type: 'p', html: '직선은 (ρ, θ) 두 개였지만 원은 <b>중심 (a, b) 와 반지름 r</b> 세 개입니다. 그대로 3차원 누적 배열을 만들면 640 × 480 × 100 = 3천만 칸을 매 에지 점마다 돌아야 해서 너무 느립니다. OpenCV 는 이를 <b>2단계</b>로 쪼갭니다 — 이것이 <code>HOUGH_GRADIENT</code> 방법입니다.' },
          { type: 'figure', html: FIG_CIRCLE, caption: '그림 4. 에지의 기울기(법선) 방향으로 중심에 투표 → 중심을 먼저 정하고, 중심마다 반지름을 다시 투표한다' },
          { type: 'p', html: '핵심 아이디어: 원 위의 에지 점에서 <b>밝기 기울기 방향</b>은 언제나 중심을 향합니다(또는 그 반대). 그래서 에지 점마다 그 방향의 직선에만 투표하면 중심 한 점에 표가 몰립니다. 기울기 방향을 쓰기 때문에 입력은 <b>에지 영상이 아니라 그레이 영상</b>이어야 합니다 — <code>HoughLines</code> 와 정반대입니다!' },
          { type: 'table', head: ['인수', '뜻', '실전 감각'], rows: [
            ['<code>image</code>', '<b>그레이스케일</b> 영상 (<code>CV_8UC1</code>)', '이진화 영상을 넣으면 기울기 정보가 없어져 잘 안 된다'],
            ['<code>circles</code>', '출력 <code>vector&lt;Vec3f&gt;</code> — (cx, cy, r)', '표가 많은 원부터 들어 있다 (위치 순서가 아님)'],
            ['<code>method</code>', '<code>HOUGH_GRADIENT</code> (사실상 이것)', '<code>HOUGH_GRADIENT_ALT</code> 는 더 정확하지만 param 의미가 다름'],
            ['<code>dp</code>', '누적 배열 해상도 비율 (1 = 원본 크기, 2 = 절반)', '2 로 하면 표가 모여 <b>검출·반지름이 안정적</b>. 위치 정밀도는 ↓'],
            ['<code>minDist</code>', '두 원 중심 사이 최소 거리', '가장 중요! 부품 간격보다 작게. 크면 붙은 원을 놓친다'],
            ['<code>param1</code>', '내부 Canny 의 <b>상위</b> 임계값 (하위는 절반)', '에지가 안 잡히면 내린다. 보통 100~200'],
            ['<code>param2</code>', '중심 누적 임계값 (표 개수)', '작으면 헛것까지, 크면 아무것도 못 찾는다. 보통 20~50'],
            ['<code>minRadius</code> / <code>maxRadius</code>', '찾을 반지름 범위 (px)', '알고 있으면 꼭 좁힌다 — 속도 ↑ 오검출 ↓ <b>크기 선별</b>에도 쓴다']
          ], caption: '표 3. HoughCircles 인수 — 순서는 (image, circles, method, dp, minDist, param1, param2, minRadius, maxRadius)' },
          { type: 'h', text: '원형 부품 세고 크기별로 나누기' },
          { type: 'image', src: 'images/coins_parts.png', caption: '예제 이미지: 어두운 배경 위 원형 부품 12개 — L(r=34) 3개 · M(r=27) 4개 · S(r=20) 5개, 배율 0.1 mm/px', width: 460 },
          { type: 'code', title: '예제 1: HoughCircles 로 12개 찾고 S/M/L 분류', code: EX_CIRCLES,
            desc: '<code>Vec3f c</code> 의 <code>c[0], c[1]</code> 이 중심, <code>c[2]</code> 가 반지름입니다. 결과는 <b>표가 많은 순</b>으로 들어 있어서 보기 좋게 <code>sort</code> 로 (y, x) 순 정렬했습니다. 검출된 반지름은 20.2~20.4 / 26.4~27.4 / 33.5~33.8 로 정답(20 / 27 / 34)과 1 px 이내로 맞습니다. 두 경계값(23.5, 30.5)으로 나누면 <b>S 5개 · M 4개 · L 3개</b> — IMAGES.md 의 정답과 일치합니다. <code>circle</code> 은 정수 좌표만 받으므로 <code>cvRound</code> 로 반올림해 그립니다.',
            expect: '원 12개\n  (194.5, 53.5) r = 20.4 px -> S\n  (340.5, 67.5) r = 20.4 px -> S\n  (480.5, 95.5) r = 20.4 px -> S\n  (119.5,164.5) r = 33.5 px -> L\n  (310.5,165.5) r = 27.4 px -> M\n  (588.5,165.5) r = 26.4 px -> M\n  (413.5,229.5) r = 27.4 px -> M\n  ( 55.5,277.5) r = 27.4 px -> M\n  (333.5,288.5) r = 20.2 px -> S\n  (548.5,345.5) r = 33.6 px -> L\n  (210.5,370.5) r = 20.4 px -> S\n  (278.5,383.5) r = 33.8 px -> L\n크기별 개수: S 5개 / M 4개 / L 3개' },
          { type: 'code', title: '예제 2: 파라미터 튜닝 — 무엇이 개수를 좌우하나', code: EX_CPARAM,
            desc: '<code>param2</code> 를 30 → 150 으로 올리면 12 → 0개로 줄어듭니다(표가 부족). <code>minDist</code> 를 150 으로 올리면 서로 가까운 부품이 지워져 6개만 남습니다. <code>minRadius</code> 를 30 으로 올리면 <b>큰 것 3개만</b> 나옵니다 — 반지름 범위만으로 크기 선별이 되는 셈입니다. 현장에서는 이 순서로 조정합니다: <b>반지름 범위 → minDist → param2 → param1</b>. 람다 <code>find</code> 는 <code>vector&lt;Vec3f&gt;</code> 를 값으로 돌려주는데, C++ 의 이동(move) 덕분에 복사 비용이 거의 없습니다.',
            expect: 'param2 (누적 임계값) — 작으면 헛것까지, 크면 놓친다\n  param2  30 -> 12개\n  param2  80 -> 8개\n  param2 100 -> 4개\n  param2 120 -> 2개\n  param2 150 -> 0개\nminDist (중심 사이 최소 거리)\n  minDist  10 -> 12개\n  minDist  40 -> 12개\n  minDist  80 -> 11개\n  minDist 150 -> 6개\nminRadius ~ maxRadius (크기 선별에 그대로 쓸 수 있다)\n  r 15~45 -> 12개  20 20 20 20 20 26 27 27 27 34 34 34\n  r 25~45 -> 7개  26 27 27 27 34 34 34\n  r 30~45 -> 3개  34 34 34' },
          { type: 'callout', kind: 'tip', title: '반지름 범위를 아는 것이 최고의 파라미터', html: '부품 크기와 카메라 배율은 보통 <b>미리 알고 있습니다</b>. 공칭 반지름 ±20% 정도로 <code>minRadius</code>/<code>maxRadius</code> 를 묶어 두면 속도도 빨라지고 엉뚱한 원도 사라집니다. 반대로 "모르겠으니 0, 0 으로 두자"(= 제한 없음)는 가장 나쁜 선택입니다.' },
          { type: 'h', text: '전처리: 흐리게 하지 않으면 헛것을 잡는다' },
          { type: 'code', title: '예제 3: 전처리 유무 비교 (동심 홈을 원으로 오검출)', code: EX_PRE,
            desc: 'coins_parts 의 부품 안쪽에는 <b>동심 홈</b>(r ≈ 0.78R)이 있습니다. 반지름 범위를 5~60 으로 넓게 열고 전처리를 하지 않으면 홈을 원으로 잡아 <b>r = 14~15 가 4개</b> 나옵니다(정답에는 없는 값). <code>medianBlur(gray, med, 5)</code> 한 줄만 넣으면 잔무늬가 지워져 r = 20 ×5, 27 ×4, 34 ×3 으로 정확히 맞습니다. 가우시안도 비슷하지만 median 이 잔무늬 · 임펄스 잡음에 더 강합니다(8차시). 같은 출력을 세 번 하므로 <code>report</code> 함수로 묶었습니다 — <code>const Mat&amp;</code> 로 받아 복사 없이 넘깁니다.',
            expect: '전처리 없음: 12개, r = 14 15 15 15 19 20 20 26 27 34 34 34\nmedianBlur(5): 12개, r = 20 20 20 20 20 26 27 27 27 34 34 34\nGaussianBlur(9x9, s=2): 12개, r = 19 19 20 20 20 26 27 27 27 33 34 34\n정답: r = 20 x5, 27 x4, 34 x3 (총 12개)' },
          { type: 'callout', kind: 'warn', title: '전처리 · 커널의 흔한 실수', html: '<ul><li><code>medianBlur</code> · <code>GaussianBlur</code> 의 커널 크기는 <b>반드시 홀수</b>입니다 (3, 5, 7, 9…). 짝수를 넣으면 <code>cv::Exception</code> 이 납니다.</li><li>너무 세게 흐리면 에지가 약해져 <code>param1</code>(내부 Canny) 을 통과하지 못하고 원이 <b>사라집니다</b>. 부품 반지름의 1/5 정도를 넘지 않게 하세요.</li><li><code>HoughCircles</code> 에 <b>이진화 영상</b>을 넣는 실수가 정말 많습니다. 이진 영상은 기울기 방향이 계단처럼 튀어 중심 투표가 흩어집니다 — <b>그레이 영상 + 약한 블러</b>가 정답입니다.</li><li>컬러 영상(<code>CV_8UC3</code>)을 그대로 넣으면 예외가 납니다. <code>IMREAD_GRAYSCALE</code> 로 읽거나 <code>cvtColor(…, COLOR_BGR2GRAY)</code> 를 먼저 하세요.</li></ul>' },
          { type: 'h', text: '지름을 mm 로: 공차 판정까지' },
          { type: 'image', src: 'images/plate_holes.png', caption: '예제 이미지: 가공 판재(800 × 600)의 구멍 6개 — 배율 0.05 mm/px (20 px = 1 mm). Ø4 4개 · Ø6 2개 중 하나가 불량', width: 500 },
          { type: 'code', title: '예제 4: 구멍 지름 측정 · 공차 판정 (4.4 mm NG 찾기)', code: EX_MM,
            desc: '<code>dp = 2</code> 로 누적 배열을 절반 크기로 줄이면 표가 모여 <b>반지름이 훨씬 안정적</b>으로 나옵니다 (dp=1 에서는 39.4~40.0 / 59.3 으로 흔들려 Ø6 구멍이 5.93 mm 로 <b>NG 로 오판정</b>됩니다). 결과는 40.2~40.4 px(Ø4.02~4.04 mm) 4개, 60.2~60.4 px(Ø6.02~6.04 mm) 2개, 그리고 <b>44.0 px = Ø4.40 mm → NG</b>. IMAGES.md 의 H4(r=44) 와 정확히 일치합니다. 배율은 <code>const double</code> 전역 상수로 두어 한 곳에서만 고치게 했습니다.',
            expect: '판재 800x600, 구멍 6개 (배율 0.05 mm/px)\n  (  161,  159) r = 40.4 px -> 지름 4.04 mm (공칭 4.0 +-0.1) OK\n  (  641,  161) r = 40.2 px -> 지름 4.02 mm (공칭 4.0 +-0.1) OK\n  (  479,  299) r = 60.4 px -> 지름 6.04 mm (공칭 6.0 +-0.1) OK\n  (  321,  301) r = 60.2 px -> 지름 6.02 mm (공칭 6.0 +-0.1) OK\n  (  641,  439) r = 44.0 px -> 지름 4.40 mm (공칭 4.0 +-0.1) NG\n  (  159,  441) r = 40.2 px -> 지름 4.02 mm (공칭 4.0 +-0.1) OK\n판정: 불량 1개' },
          { type: 'callout', kind: 'field', title: '현장 노트 — px → mm 배율은 어디서 오나', html: '<ul><li>배율(scale)은 <b>교정판(calibration target)</b> 으로 구합니다. 크기를 아는 게이지나 점 격자를 찍어 "몇 px 이 1 mm 인가"를 측정합니다 (<code>calib_grid_top.png</code>).</li><li>렌즈 왜곡과 원근 때문에 <b>화면 위치마다 배율이 조금씩 다릅니다</b>. 정밀 측정에서는 단일 배율 대신 호모그래피로 영상을 정면화한 뒤 잽니다 (11차시).</li><li>공차 판정은 <b>측정 불확도</b>를 함께 봐야 합니다. 이 예제는 ±0.02 mm 수준으로 흔들리므로 ±0.1 mm 공차는 판정 가능하지만, ±0.02 mm 공차라면 이 광학계로는 불합격입니다.</li><li>보고서에는 항상 <b>px 값과 mm 값을 함께</b> 남기세요. 나중에 배율이 잘못된 것을 알아도 다시 계산할 수 있습니다.</li></ul>' },
          { type: 'h', text: '허프 vs 윤곽선(minEnclosingCircle)' },
          { type: 'code', title: '예제 5: 같은 부품을 두 방법으로 재 보기', code: EX_CONTOUR,
            desc: '12차시의 <code>findContours</code> + <code>minEnclosingCircle</code> 로도 원을 잴 수 있습니다. 각 허프 원에 대해 외접 사각형 중심이 가장 가까운 윤곽선을 <code>min_element</code> 로 고른 뒤 비교했습니다. 두 결과의 중심은 0.5 px 이내로 같지만 반지름은 <b>0.5 px 정도 차이</b>가 납니다. 허프 반지름은 누적 배열 칸 단위라 계단처럼 튀고, 윤곽선 쪽은 실제 경계 점들에서 계산하므로 연속적인 값이 나옵니다. 그래서 <b>찾기는 허프, 재기는 윤곽선/피팅</b>이 원칙입니다.',
            expect: '허프 12개 · 윤곽선 12개\n  중심(허프)        r(허프)  중심(윤곽선)      r(minEnclosing)  차이\n  (194.5, 53.5)   20.4   (194.0, 53.6)   19.91         -0.49\n  (340.5, 67.5)   20.4   (340.8, 67.8)   19.95         -0.45\n  (480.5, 95.5)   20.4   (480.7, 95.8)   19.95         -0.45\n  (119.5,164.5)   33.5   (119.8,164.8)   33.96          0.46' },
          { type: 'table', head: ['항목', 'HoughCircles', '윤곽선 + minEnclosingCircle / fitEllipse'], rows: [
            ['입력', '그레이 영상 (내부에서 Canny)', '이진화가 잘 된 영상'],
            ['겹친 · 잘린 원', '<b>강함</b> — 일부만 보여도 찾음', '약함 — 윤곽이 붙거나 잘리면 실패'],
            ['배경 잡음', '강함 (표가 적으면 탈락)', '이진화 품질에 좌우됨'],
            ['중심 정밀도', '누적 배열 칸 단위 (dp 에 좌우)', '모멘트 · 피팅으로 <b>서브픽셀</b>'],
            ['반지름 정밀도', '±0.5 px 정도 계단', '경계 점 전체로 피팅 → 더 정밀'],
            ['속도', '느린 편 (반지름 범위에 비례)', '빠름'],
            ['파라미터', '많다 (dp · minDist · param1 · param2 · r 범위)', '적다 (임계값 · 면적 필터)'],
            ['원이 아닌 것', '원만 찾음 → 원형 부품 선별에 유리', '면적 · 원형도 · 꼭짓점 수로 <b>모양 분류</b> 가능'],
            ['추천', '개수 세기 · 위치 찾기 · 겹친 원', '치수 측정 · 모양 판정']
          ], caption: '표 4. 두 방법의 비교 — 실무에서는 허프로 찾고 그 ROI 에서 윤곽선/에지 피팅으로 정밀 측정하는 2단계가 정석' },
          { type: 'callout', kind: 'vs', title: 'Visual Studio 에서는 — 검사 결과를 구조체로', html: '검사 프로그램에서는 <code>Vec3f</code> 를 그대로 들고 다니지 말고 의미 있는 이름의 구조체로 바꿔 두세요: <code>struct Hole { Point2f center; float radiusPx; double diaMm; bool ok; };</code>. <code>vector&lt;Hole&gt;</code> 를 만들어 두면 판정 · 표시 · CSV 저장(<code>ofstream</code>) 코드가 모두 읽기 쉬워집니다. 배율(mm/px) · 공칭 지름 · 공차는 코드에 박지 말고 <b>설정 파일</b>에서 읽게 하세요 — 16 · 17차시에서 이런 검사 도구 클래스를 직접 설계합니다.' },
          { type: 'callout', kind: 'more', title: '📘 더 알아보기 — HOUGH_GRADIENT_ALT', html: 'OpenCV 4.3 부터 <code>HOUGH_GRADIENT_ALT</code> 방법이 추가되었고 OpenCV 5 에서도 그대로 쓸 수 있습니다. 이 방법에서는 <code>param2</code> 가 표 개수가 아니라 <b>원다운 정도(0~1, 보통 0.9)</b> 이고, <code>param1</code> 은 보통 300 정도로 크게 줍니다. 반지름이 더 정확하게 나오지만 파라미터 감각이 완전히 달라지므로 <b>같은 값을 그대로 옮기면 안 됩니다</b>. Python 에서는 <code>cv2.HoughCircles(img, cv2.HOUGH_GRADIENT, dp, minDist, param1=…, param2=…, minRadius=…, maxRadius=…)</code> 처럼 이름 붙은 인수를 쓰지만, C++ 은 <b>순서</b>로만 넘기므로 표 3 의 순서를 꼭 확인하세요.' },
          { type: 'callout', kind: 'tip', teacher: true, title: '평가 루브릭 · 마무리', html: '<ul><li><b>상</b>: 파라미터를 근거 있게(반지름 범위 → minDist → param2) 조정하고, px 를 mm 로 환산해 공차 판정까지 코드로 쓴다. 허프와 윤곽선 방법의 선택 이유를 설명한다.</li><li><b>중</b>: 예제를 수정해 다른 영상에서 원 개수를 맞춘다. 전처리가 필요한 이유를 안다.</li><li><b>하</b>: 인수 순서를 혼동하거나 이진화 영상을 입력한다 → 표 3 을 다시 보게 하고 <code>HoughLines</code>(에지) ↔ <code>HoughCircles</code>(그레이) 대비를 반복합니다.</li><li>💬 마무리 발문: “구멍이 완전한 원이 아니라 타원이면?” — <code>fitEllipse</code> 로 장축 · 단축을 재야 한다 (12차시 연결).</li><li>다음 차시 예고: 원이나 직선이 아닌 <b>임의의 모양</b>을 찾으려면? → 14차시 템플릿 매칭과 특징점.</li></ul>' }
        ],
        practice: [
          {
            title: '플랜지의 구멍 개수와 반지름 (flange.png)', level: 1,
            desc: '<code>images/flange.png</code> 는 중앙 보어 1개(r = 48)와 볼트 구멍 6개(r = 15)가 있는 플랜지입니다. 반지름 범위를 <b>두 번 나눠</b> 검출해서 "볼트 구멍 6개 · 중앙 보어 1개 · 합계 7개" 와 볼트 구멍의 <b>평균 반지름</b>을 출력하세요.',
            hint: '볼트 구멍은 <code>minRadius 10, maxRadius 25</code>, 중앙 보어는 <code>minRadius 40, maxRadius 60</code> 으로 <code>HoughCircles</code> 를 두 번 호출합니다. 중앙 보어는 하나뿐이니 <code>minDist</code> 를 크게(100) 잡으면 안전합니다. 평균은 <code>for</code> 로 <code>c[2]</code> 를 더한 뒤 개수로 나눕니다.',
            expect: '볼트 구멍 6개 (정답 6), 중앙 보어 1개 (정답 1)\n구멍 합계 7개\n볼트 구멍 평균 반지름 14.7 px (정답 15.0)',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/flange.png", IMREAD_GRAYSCALE);
    Mat blur;
    medianBlur(gray, blur, 5);

    // TODO: 볼트 구멍 (반지름 10~25) 을 찾으세요 — minDist 40, param1 150, param2 30
    vector<Vec3f> bolts;
    // TODO: 중앙 보어 (반지름 40~60) 를 찾으세요 — minDist 100
    vector<Vec3f> bore;
    // TODO: 개수와 합계, 볼트 구멍 평균 반지름을 출력하세요

    imshow("flange", gray);
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/flange.png", IMREAD_GRAYSCALE);
    Mat blur;
    medianBlur(gray, blur, 5);

    vector<Vec3f> bolts, bore;
    HoughCircles(blur, bolts, HOUGH_GRADIENT, 1, 40, 150, 30, 10, 25);
    HoughCircles(blur, bore, HOUGH_GRADIENT, 1, 100, 150, 30, 40, 60);
    cout << "볼트 구멍 " << bolts.size() << "개 (정답 6), 중앙 보어 " << bore.size() << "개 (정답 1)" << endl;
    cout << "구멍 합계 " << bolts.size() + bore.size() << "개" << endl;

    double sum = 0;
    for (const Vec3f& c : bolts) sum += c[2];
    cout << format("볼트 구멍 평균 반지름 %.1f px (정답 15.0)", sum / bolts.size()) << endl;

    Mat canvas;
    cvtColor(gray, canvas, COLOR_GRAY2BGR);
    for (const Vec3f& c : bolts)
        circle(canvas, Point(cvRound(c[0]), cvRound(c[1])), cvRound(c[2]), Scalar(0, 255, 0), 2);
    for (const Vec3f& c : bore)
        circle(canvas, Point(cvRound(c[0]), cvRound(c[1])), cvRound(c[2]), Scalar(0, 0, 255), 2);
    imshow("holes", canvas);
    waitKey(0);
    return 0;
}`
          },
          {
            title: '원통형 셀 격자 검사 — 누락 자리 찾기', level: 2,
            desc: '<code>images/battery_cells.png</code> 는 4행 × 6열 홀더에 18650 셀이 꽂힌 영상입니다(반지름 40). 셀 중심의 공칭 위치는 <b>x = 95 + 90·열, y = 105 + 90·행</b> 입니다. <code>HoughCircles</code> 로 셀을 찾은 뒤, 24개 공칭 위치 중 <b>원이 없는 자리</b>를 찾아 "행 · 열" 로 출력하세요.',
            hint: '반지름 범위 30~50, <code>minDist</code> 는 셀 간격(90)보다 약간 작게 70 으로 잡습니다. 각 공칭 위치 (x, y) 에 대해 <code>any_of(cells.begin(), cells.end(), [&amp;](const Vec3f&amp; k) { return fabs(k[0] - x) &lt; 25 &amp;&amp; fabs(k[1] - y) &lt; 25; })</code> 로 있는지 확인하세요 (<code>&lt;algorithm&gt;</code>). 정답은 셀 23개 · 누락 1자리입니다.',
            expect: '검출된 셀 23개 / 홀더 자리 24개\n  누락: 행 2 열 5 (중심 545,285)',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/battery_cells.png", IMREAD_GRAYSCALE);
    Mat blur;
    medianBlur(gray, blur, 5);
    vector<Vec3f> cells;
    HoughCircles(blur, cells, HOUGH_GRADIENT, 1, 70, 150, 30, 30, 50);
    cout << "검출된 셀 " << cells.size() << "개 / 홀더 자리 24개" << endl;

    // TODO: 4행 x 6열 공칭 위치를 이중 for 로 돌면서
    //       x = 95 + 90 * 열, y = 105 + 90 * 행 근처(±25)에 원이 있는지 확인하고
    //       없으면 "누락: 행 r 열 c" 를 출력하세요

    imshow("cells", gray);
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
    Mat gray = imread("images/battery_cells.png", IMREAD_GRAYSCALE);
    Mat blur;
    medianBlur(gray, blur, 5);
    vector<Vec3f> cells;
    HoughCircles(blur, cells, HOUGH_GRADIENT, 1, 70, 150, 30, 30, 50);
    cout << "검출된 셀 " << cells.size() << "개 / 홀더 자리 24개" << endl;

    Mat canvas;
    cvtColor(gray, canvas, COLOR_GRAY2BGR);
    for (int r = 0; r < 4; r++)
        for (int c = 0; c < 6; c++)
        {
            int x = 95 + 90 * c, y = 105 + 90 * r;
            bool found = any_of(cells.begin(), cells.end(), [&](const Vec3f& k) {
                return fabs(k[0] - x) < 25 && fabs(k[1] - y) < 25;
            });
            circle(canvas, Point(x, y), 40, found ? Scalar(0, 255, 0) : Scalar(0, 0, 255), 2);
            if (!found)
                cout << "  누락: 행 " << r << " 열 " << c << " (중심 " << x << "," << y << ")" << endl;
        }
    imshow("check", canvas);
    waitKey(0);
    return 0;
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: '허프 변환 ②: 원 검출과 지름 측정', subtitle: 'HoughCircles · 파라미터 튜닝 · px → mm 공차 판정', notes: '<p>1교시 복습으로 시작: 직선은 (ρ, θ) 두 개. 💬 “원은 파라미터가 몇 개일까요?” — 중심 (a, b) 와 반지름 r = 3개. “그럼 3차원 배열에 투표하면 되겠네요?” 라는 학생 답을 받아 다음 슬라이드로 넘어갑니다. (3분)</p>' },
          { layout: 'image', title: '오늘의 재료 ①: 원형 부품 12개', src: 'images/coins_parts.png', caption: 'L(r=34) 3개 · M(r=27) 4개 · S(r=20) 5개 — 개수와 크기별 분류를 코드로', notes: '<p>💬 “사람은 한눈에 12개를 세는데, 프로그램은 무엇부터 해야 할까?” — 이진화 + 윤곽선(12차시)도 가능하다는 답이 나오면 “맞다, 그런데 서로 겹치면?” 으로 허프의 필요성을 끌어냅니다. 부품 안쪽 동심 홈도 미리 보여 주세요(전처리 예고). (3분)</p>' },
          { layout: 'diagram', title: '원은 어떻게 투표하나 — 2단계', html: FIG_CIRCLE, caption: '에지의 기울기 방향은 중심을 향한다 → ① 중심 투표 → ② 중심마다 반지름 투표', notes: '<p>3차원 투표의 비용(640×480×100 ≈ 3천만 칸)을 칠판에 적어 “그래서 쪼갠다” 를 납득시킵니다. 기울기 방향을 쓰기 때문에 <b>그레이 영상</b>이 입력이라는 점을 여기서 세 번 반복하세요 — 1교시의 HoughLines(에지 영상)와 정반대입니다. (8분)</p>' },
          { layout: 'table', title: 'HoughCircles 인수', head: ['인수', '뜻', '감각'], rows: [
            ['<code>image</code>', '<b>그레이</b> 영상', '이진화 영상 금지!'],
            ['<code>circles</code>', '<code>vector&lt;Vec3f&gt;</code> (cx, cy, r)', '표 많은 순으로 들어 있음'],
            ['<code>dp</code>', '누적 배열 해상도 비율', '2 면 반지름이 안정적'],
            ['<code>minDist</code>', '중심 간 최소 거리', '가장 중요 — 부품 간격보다 작게'],
            ['<code>param1</code> / <code>param2</code>', '내부 Canny 상위 / 중심 누적 임계', '100~200 / 20~50'],
            ['<code>minRadius</code>/<code>maxRadius</code>', '반지름 범위', '알면 꼭 좁힌다']
          ], lead: 'HoughCircles(image, circles, HOUGH_GRADIENT, dp, minDist, param1, param2, minRadius, maxRadius)', notes: '<p>인수 순서를 외우지 말고 Visual Studio 의 <b>IntelliSense(매개 변수 정보, Ctrl+Shift+Space)</b> 로 확인하라고 알려 줍니다. Python 은 이름 붙은 인수(<code>param1=…</code>)를 쓰지만 C++ 은 순서만으로 넘기므로 더 조심해야 합니다. (4분)</p>' },
          { layout: 'code', title: '원 12개 찾아 S/M/L 로 나누기', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    Mat blur;
    medianBlur(gray, blur, 5);

    vector<Vec3f> circles;
    HoughCircles(blur, circles, HOUGH_GRADIENT, 1, 40, 120, 30, 15, 45);
    cout << "원 " << circles.size() << "개" << endl;
    int s = 0, m = 0, l = 0;
    for (const Vec3f& c : circles)
    {
        if (c[2] < 23.5f) s++;
        else if (c[2] < 30.5f) m++;
        else l++;
    }
    cout << "S " << s << " / M " << m << " / L " << l << endl;
    return 0;
}`, points: ['<code>Vec3f</code> = (cx, cy, r) — <code>c[2]</code> 가 반지름', '검출 반지름 20.2~20.4 / 26.4~27.4 / 33.5~33.8 → 정답과 1 px 이내', '경계값 23.5 · 30.5 로 분류 → <b>S 5 / M 4 / L 3</b>'], notes: '<p>실행 후 본문 예제 1 의 반지름 목록을 함께 읽으며 “왜 정확히 20 이 아닌가?” 💬 — 누적 배열 칸 단위 + 잡음. 경계값을 21 로 바꾸면 어떻게 되는지 시켜 보고, <b>경계값은 두 그룹의 중간</b>에 두어야 한다는 원칙을 정리합니다. (8분)</p>' },
          { layout: 'table', title: '파라미터를 바꾸면 개수가 이렇게 바뀐다', head: ['바꾼 값', '결과', '해석'], rows: [
            ['param2 30 → 80 → 100 → 150', '12 → 8 → 4 → 0개', '중심 표가 부족해 하나씩 탈락'],
            ['minDist 10 / 40', '12 / 12개', '부품 간격보다 작으면 문제없음'],
            ['minDist 80 / 150', '11 / 6개', '가까운 부품이 지워진다'],
            ['r 15~45 → 25~45', '12 → 7개', 'S 5개가 빠짐'],
            ['r 30~45', '3개', '<b>L 만</b> — 반지름 범위로 크기 선별']
          ], lead: 'coins_parts.png · medianBlur(5) 기준 (본문 예제 2)', notes: '<p>“개수가 안 맞을 때 무엇부터 만지나?” 순서를 정리해 줍니다: ① 반지름 범위 ② minDist ③ param2 ④ param1. 마지막 줄(r 30~45 → 3개)은 크기 선별 검사에 그대로 쓰는 실전 기법이라고 강조합니다. (5분)</p>' },
          { layout: 'code', title: '전처리를 빼면 동심 홈을 원으로 잡는다', code: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

void report(const string& name, const Mat& src)
{
    vector<Vec3f> c;
    HoughCircles(src, c, HOUGH_GRADIENT, 1, 20, 120, 30, 5, 60);
    sort(c.begin(), c.end(), [](const Vec3f& a, const Vec3f& b) { return a[2] < b[2]; });
    cout << name << ": r =";
    for (const Vec3f& v : c) cout << format(" %.0f", v[2]);
    cout << endl;
}

int main()
{
    Mat gray = imread("images/coins_parts.png", IMREAD_GRAYSCALE), med;
    report("전처리 없음", gray);
    medianBlur(gray, med, 5);
    report("medianBlur(5)", med);   // 정답: 20 x5, 27 x4, 34 x3
    return 0;
}`, points: ['전처리 없음 → <b>r = 14~15 가 4개</b> (안쪽 홈을 잡았다)', 'medianBlur(5) → 20 ×5, 27 ×4, 34 ×3 정확', '커널은 <b>홀수</b>, 너무 세게 흐리면 원이 사라진다'], notes: '<p>두 줄의 출력을 나란히 놓고 차이를 찾게 합니다. 💬 “r=15 는 무엇일까?” — 부품 안쪽 동심 홈(0.78R). 실무에서 “원이 두 겹으로 나온다”는 신고가 들어오면 대개 이 문제라고 알려 주세요. medianBlur 커널을 4 로 바꿔 예외가 나는 것도 한 번 보여 줍니다. (7분)</p>' },
          { layout: 'image', title: '오늘의 재료 ②: 가공 판재 구멍 측정', src: 'images/plate_holes.png', caption: '배율 0.05 mm/px (20 px = 1 mm) · Ø4 4개 + Ø6 2개 — 하나가 공차를 벗어난다', notes: '<p>실제 검사 장면입니다. 💬 “어느 구멍이 불량일까요? 눈으로 찾을 수 있나요?” — 0.4 mm 차이(8 px)는 눈으로 거의 안 보입니다. 그래서 측정이 필요하다는 동기를 만듭니다. 배율 0.05 mm/px 를 칠판에 적어 두세요. (3분)</p>' },
          { layout: 'code', title: '지름 mm 환산 + 공차 판정', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;
const double MM_PER_PX = 0.05;      // 20 px = 1 mm

int main()
{
    Mat gray = imread("images/plate_holes.png", IMREAD_GRAYSCALE);
    Mat blur;
    medianBlur(gray, blur, 5);
    vector<Vec3f> holes;
    HoughCircles(blur, holes, HOUGH_GRADIENT, 2, 100, 150, 40, 30, 80);
    int ng = 0;
    for (const Vec3f& h : holes)
    {
        double dia = 2 * h[2] * MM_PER_PX;       // 지름 = 2 x 반지름 x 배율
        bool ok = fabs(dia - (dia > 5.0 ? 6.0 : 4.0)) <= 0.1;
        if (!ok) ng++;
        cout << format("r=%.1fpx D%.2fmm %s", h[2], dia, ok ? "OK" : "NG") << endl;
    }
    cout << "불량 " << ng << "개" << endl;
    return 0;
}`, points: ['지름 = <code>2 × r × 배율</code>', '<code>dp = 2</code> 로 반지름이 안정적 (dp=1 은 흔들려 오판정)', '44.0 px → <b>Ø4.40 mm NG</b> — IMAGES.md 의 H4 와 일치'], notes: '<p><code>dp</code> 를 1 로 바꿔 실행시켜 반지름이 39.4~40.0 · 59.3 으로 흔들리고 <b>Ø6 구멍이 NG 로 뒤집히는</b> 것을 꼭 보여 주세요. “측정에서는 파라미터 하나가 판정을 바꾼다” 는 무게 있는 메시지입니다. 이어서 “그래서 측정은 허프보다 피팅” 으로 다음 슬라이드에 연결합니다. (8분)</p>' },
          { layout: 'two', title: '찾기는 허프, 재기는 피팅', left: { title: '⭕ HoughCircles', bullets: ['입력: <b>그레이</b> 영상', '겹치거나 일부만 보여도 찾음', '배경 잡음에 강함', '반지름은 칸 단위 (±0.5 px 계단)', '파라미터가 많다', '→ <b>개수 · 위치</b>'] }, right: { title: '🔷 윤곽선 + minEnclosingCircle', bullets: ['입력: 이진화가 잘 된 영상', '붙거나 잘린 윤곽에는 약함', '이진화 품질에 좌우', '경계 점 전체로 피팅 → <b>서브픽셀</b>', '파라미터가 적다', '→ <b>치수 · 모양 판정</b>'] }, notes: '<p>본문 예제 5 의 출력(중심은 0.5 px 이내로 같고 반지름은 0.45~0.49 px 차이)을 근거로 설명합니다. 실무 정석: 허프로 ROI 를 잡고 그 안에서 피팅으로 정밀 측정하는 <b>2단계</b>. 💬 “구멍이 타원이면?” — fitEllipse(12차시). (6분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '배율 0.05 mm/px, 검출 반지름 44.0 px 일 때 지름은?', options: ['2.20 mm', '4.40 mm', '8.80 mm', '0.44 mm'], answer: 1, explain: '지름 = 2 × 44.0 × 0.05 = <b>4.40 mm</b>. 공칭 4.0±0.1 을 벗어나 <b>NG</b>.', notes: '<p>정답 2번. “반지름을 지름으로 바꾸는 ×2 를 빼먹는 실수” 가 현장 버그 1위라고 알려 줍니다. 단위를 변수 이름에 넣는 습관(<code>radiusPx</code>, <code>diaMm</code>)을 권하세요.</p>' },
          { layout: 'practice', title: '실습: 셀 격자 누락 검사', desc: '<p><code>images/battery_cells.png</code> (4행×6열, 반지름 40) 에서 셀을 찾고 <b>빈 자리</b>를 찾으세요.</p><ul><li>공칭 중심: x = 95 + 90·열, y = 105 + 90·행</li><li>반지름 30~50, minDist 70</li><li><code>any_of</code> + 람다로 근처(±25)에 원이 있는지 확인</li><li>정답: 셀 23개 · 누락 1자리</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/battery_cells.png", IMREAD_GRAYSCALE);
    Mat blur;
    medianBlur(gray, blur, 5);
    vector<Vec3f> cells;
    HoughCircles(blur, cells, HOUGH_GRADIENT, 1, 70, 150, 30, 30, 50);
    cout << "셀 " << cells.size() << "개" << endl;
    // TODO: 24개 공칭 위치를 돌며 원이 없는 자리를 출력
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/battery_cells.png", IMREAD_GRAYSCALE);
    Mat blur;
    medianBlur(gray, blur, 5);
    vector<Vec3f> cells;
    HoughCircles(blur, cells, HOUGH_GRADIENT, 1, 70, 150, 30, 30, 50);
    cout << "셀 " << cells.size() << "개 / 자리 24개" << endl;
    for (int r = 0; r < 4; r++)
        for (int c = 0; c < 6; c++)
        {
            int x = 95 + 90 * c, y = 105 + 90 * r;
            if (none_of(cells.begin(), cells.end(), [&](const Vec3f& k) {
                    return fabs(k[0] - x) < 25 && fabs(k[1] - y) < 25; }))
                cout << "  누락: 행 " << r << " 열 " << c << endl;
        }
    return 0;
}`, notes: '<p>정답: 셀 23개, 누락은 행 2 · 열 5. “검출된 것을 세는” 대신 <b>기준 격자와 대조</b>하는 방식이 산업 검사의 기본 패턴임을 강조하세요(커넥터 핀, 블리스터 포장도 같은 구조). 시간이 남으면 “역삽(극성 반대) 셀도 찾아보라” 를 추가 과제로 — 가운데 밝은 원의 반지름이 13 vs 34. (12분)</p>' },
          { layout: 'summary', title: '13차시 정리', bullets: ['허프 원 검출은 <b>2단계</b>: 기울기 방향으로 중심 투표 → 중심마다 반지름 투표', '입력은 <b>그레이 영상</b> (<code>HoughLines</code> 는 에지 영상 — 반대!), 결과는 <code>vector&lt;Vec3f&gt;</code>', '파라미터 조정 순서: <b>반지름 범위 → minDist → param2 → param1</b>', '<code>medianBlur</code> 같은 약한 전처리가 오검출을 크게 줄인다 (커널은 홀수)', '지름 = <code>2 × r × 배율(mm/px)</code> → 공차 판정', '<b>찾기는 허프, 재기는 윤곽선/피팅</b> — 2단계로 조합한다', '다음: 원 · 직선이 아닌 <b>임의의 모양</b> 찾기 → 템플릿 매칭과 ORB (14차시)'], notes: '<p>일곱 줄을 정리하고, 특히 “입력이 반대” 와 “찾기/재기 분리” 두 가지를 다시 확인합니다. 과제: 실습 1(플랜지)과 <code>washer_ring.png</code> 의 내 · 외경 재기. 다음 차시 예고로 <code>fiducial_board.png</code> 를 살짝 보여 주세요. (3분)</p>' }
        ]
      }
    ]
  });
})();
