/* 04차시 그리기와 텍스트 */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 좌표 규칙과 도형 인수
  const FIG_COORD = `<svg viewBox="0 0 760 340" role="img" aria-label="그리기 함수의 좌표 규칙과 도형별 인수">
  ${ARROW('c04a1')}
  <text x="20" y="26" class="tx-b">① 좌표: 원점 (0, 0) = 왼쪽 위 · 모든 점은 (x, y) 순서</text>
  <rect x="16" y="38" width="404" height="288" rx="10" class="card-bg"/>
  <line x1="58" y1="64" x2="400" y2="64" class="ax" marker-end="url(#c04a1)"/><text x="360" y="56" class="tx-m">x 증가 →</text>
  <line x1="58" y1="64" x2="58" y2="308" class="ax" marker-end="url(#c04a1)"/><text x="22" y="190" class="tx-m">y ↓</text>
  <text x="64" y="82" class="tx-m">(0, 0)</text>
  <rect x="112" y="98" width="150" height="84" class="p1s"/>
  <circle cx="112" cy="98" r="5" class="p1"/><text x="120" y="94" class="tx-m">(x, y)</text>
  <text x="187" y="146" text-anchor="middle" class="tx-b">Rect(x, y, w, h)</text>
  <line x1="112" y1="194" x2="262" y2="194" class="s1" stroke-width="1.5" marker-end="url(#c04a1)"/>
  <text x="187" y="210" text-anchor="middle" class="tx-m">w (너비)</text>
  <line x1="276" y1="98" x2="276" y2="182" class="s1" stroke-width="1.5" marker-end="url(#c04a1)"/>
  <text x="286" y="126" class="tx-m">h</text>
  <text x="300" y="150" class="tx-m">rectangle 은</text><text x="300" y="166" class="tx-m">두 점(왼위 · 오른아래)</text><text x="300" y="182" class="tx-m">으로도 그린다</text>
  <circle cx="140" cy="256" r="40" class="p3s"/><circle cx="140" cy="256" r="4" class="p3"/>
  <line x1="140" y1="256" x2="180" y2="256" class="s3" stroke-width="1.5" marker-end="url(#c04a1)"/><text x="150" y="249" class="tx-m">r</text>
  <text x="140" y="314" text-anchor="middle" class="tx">circle(중심, r, …)</text>
  <line x1="236" y1="296" x2="382" y2="228" class="s2" stroke-width="2" marker-end="url(#c04a1)"/>
  <circle cx="236" cy="296" r="4" class="p2"/>
  <text x="318" y="314" text-anchor="middle" class="tx">line(p1, p2, …)</text>
  <text x="446" y="26" class="tx-b">② 공통 인수: (Mat, 위치…, 색, 두께, 선 종류)</text>
  <rect x="434" y="38" width="306" height="288" rx="10" class="card-bg"/>
  <text x="448" y="62" class="tx">rectangle(img, rect, Scalar(B,G,R), 2);</text>
  <rect x="452" y="78" width="72" height="48" class="s4" stroke-width="1"/>
  <text x="488" y="142" text-anchor="middle" class="tx-m">두께 1</text>
  <rect x="546" y="78" width="72" height="48" class="s4" stroke-width="6"/>
  <text x="582" y="142" text-anchor="middle" class="tx-m">두께 6</text>
  <rect x="640" y="78" width="72" height="48" class="p4"/>
  <text x="676" y="142" text-anchor="middle" class="tx-m">FILLED (−1, 채움)</text>
  <line x1="452" y1="240" x2="574" y2="182" class="s5" stroke-width="1"/>
  <text x="513" y="262" text-anchor="middle" class="tx-m">LINE_8 (기본)</text>
  <text x="513" y="278" text-anchor="middle" class="tx-m">계단(톱니)이 보인다</text>
  <line x1="600" y1="240" x2="722" y2="182" class="s5" stroke-width="1" opacity="0.55"/>
  <line x1="600" y1="240" x2="722" y2="182" class="s5" stroke-width="2.4" opacity="0.35"/>
  <text x="661" y="262" text-anchor="middle" class="tx-m">LINE_AA</text>
  <text x="661" y="278" text-anchor="middle" class="tx-m">경계 픽셀을 섞어 매끈</text>
  <text x="587" y="308" text-anchor="middle" class="tx-m">색은 항상 Scalar(B, G, R) — 빨강 = (0, 0, 255)</text>
</svg>`;

  // 그림 2: 도형별 인수 한눈에
  const FIG_SHAPES = `<svg viewBox="0 0 760 300" role="img" aria-label="line rectangle circle ellipse polylines 의 인수 비교">
  <rect x="16" y="20" width="728" height="264" rx="12" class="card-bg"/>
  <line x1="60" y1="80" x2="170" y2="60" class="s1" stroke-width="3"/>
  <text x="115" y="112" text-anchor="middle" class="tx-b">line</text>
  <text x="115" y="130" text-anchor="middle" class="tx-m">p1, p2</text>
  <rect x="210" y="46" width="110" height="52" class="s2" stroke-width="3"/>
  <text x="265" y="112" text-anchor="middle" class="tx-b">rectangle</text>
  <text x="265" y="130" text-anchor="middle" class="tx-m">Rect 또는 두 점</text>
  <circle cx="410" cy="72" r="28" class="s3" stroke-width="3"/>
  <text x="410" y="112" text-anchor="middle" class="tx-b">circle</text>
  <text x="410" y="130" text-anchor="middle" class="tx-m">중심, 반지름</text>
  <ellipse cx="540" cy="72" rx="42" ry="24" class="s4" stroke-width="3" transform="rotate(-20 540 72)"/>
  <text x="540" y="112" text-anchor="middle" class="tx-b">ellipse</text>
  <text x="540" y="130" text-anchor="middle" class="tx-m">중심, Size(a, b), 각도</text>
  <polygon points="650,96 700,42 730,96" class="s5" stroke-width="3"/>
  <text x="690" y="112" text-anchor="middle" class="tx-b">polylines</text>
  <text x="690" y="130" text-anchor="middle" class="tx-m">vector&lt;Point&gt;</text>
  <polygon points="80,230 130,176 160,230" class="p5"/>
  <text x="120" y="252" text-anchor="middle" class="tx-b">fillPoly</text>
  <text x="120" y="268" text-anchor="middle" class="tx-m">안을 채운 다각형</text>
  <line x1="230" y1="228" x2="330" y2="182" class="ln" stroke-width="2.5"/>
  <polygon points="330,182 316,182 326,192" class="fill-arrow"/>
  <text x="280" y="252" text-anchor="middle" class="tx-b">arrowedLine</text>
  <text x="280" y="268" text-anchor="middle" class="tx-m">화살촉 있는 선</text>
  <line x1="400" y1="204" x2="430" y2="204" class="s3" stroke-width="2"/><line x1="415" y1="189" x2="415" y2="219" class="s3" stroke-width="2"/>
  <line x1="470" y1="192" x2="492" y2="216" class="s3" stroke-width="2"/><line x1="492" y1="192" x2="470" y2="216" class="s3" stroke-width="2"/>
  <polygon points="540,188 552,204 540,220 528,204" class="s3" stroke-width="2"/>
  <rect x="586" y="192" width="24" height="24" class="s3" stroke-width="2"/>
  <text x="505" y="252" text-anchor="middle" class="tx-b">drawMarker</text>
  <text x="505" y="268" text-anchor="middle" class="tx-m">CROSS · TILTED_CROSS · DIAMOND · SQUARE</text>
  <text x="678" y="204" text-anchor="middle" class="tx-m">중심을 정확히</text>
  <text x="678" y="222" text-anchor="middle" class="tx-m">찍을 때 편하다</text>
</svg>`;

  // 그림 3: putText 의 기준점과 getTextSize
  const FIG_TEXT = `<svg viewBox="0 0 760 300" role="img" aria-label="putText 의 기준점은 글자의 왼쪽 아래이고 getTextSize 는 폭 높이 baseLine 을 돌려준다">
  ${ARROW('c04a2')}
  <rect x="16" y="24" width="728" height="256" rx="12" class="card-bg"/>
  <rect x="150" y="96" width="250" height="52" class="p2s"/>
  <line x1="120" y1="148" x2="600" y2="148" class="ln" stroke-dasharray="6 4"/>
  <text x="606" y="152" class="tx-m">기준선(baseline)</text>
  <text x="156" y="144" class="tx-b" style="font-size:42px">OK 12.34</text>
  <circle cx="150" cy="148" r="6" class="p4"/>
  <line x1="150" y1="148" x2="90" y2="196" class="ln" marker-end="url(#c04a2)"/>
  <text x="34" y="216" class="tx-b">org = Point(x, y)</text>
  <text x="34" y="234" class="tx-m">글자의 <tspan class="tx-b">왼쪽 아래</tspan> (왼쪽 위가 아니다!)</text>
  <line x1="150" y1="84" x2="400" y2="84" class="s2" stroke-width="1.5" marker-end="url(#c04a2)"/>
  <text x="275" y="76" text-anchor="middle" class="tx-m">size.width</text>
  <line x1="420" y1="96" x2="420" y2="148" class="s2" stroke-width="1.5" marker-end="url(#c04a2)"/>
  <text x="432" y="126" class="tx-m">size.height</text>
  <rect x="150" y="148" width="250" height="16" class="p3s"/>
  <line x1="420" y1="148" x2="420" y2="164" class="s3" stroke-width="1.5" marker-end="url(#c04a2)"/>
  <text x="432" y="162" class="tx-m">baseLine (g, y, p 의 꼬리 공간)</text>
  <text x="34" y="262" class="tx">int baseLine = 0;  Size size = getTextSize(text, font, fontScale, thickness, &amp;baseLine);</text>
  <text x="440" y="212" class="tx-m">글자를 감싸는 상자 =</text>
  <text x="440" y="230" class="tx-m">Rect(x, y − height, width, height + baseLine)</text>
</svg>`;

  // 그림 4: 라벨 상자 만드는 3단계
  const FIG_LABEL = `<svg viewBox="0 0 760 240" role="img" aria-label="getTextSize 로 크기를 재고 배경 상자를 채운 뒤 글자를 얹는 3단계">
  ${ARROW('c04a3')}
  <rect x="16" y="40" width="216" height="150" rx="10" class="card-bg"/>
  <text x="124" y="32" text-anchor="middle" class="tx-b">① 글자 크기 재기</text>
  <rect x="56" y="82" width="136" height="44" class="s2" stroke-width="1.5" stroke-dasharray="5 4"/>
  <text x="124" y="110" text-anchor="middle" class="tx">W × H</text>
  <text x="124" y="152" text-anchor="middle" class="tx-m">getTextSize(...)</text>
  <text x="124" y="172" text-anchor="middle" class="tx-m">아직 그리지 않는다</text>
  <line x1="238" y1="115" x2="266" y2="115" class="ln" stroke-width="2" marker-end="url(#c04a3)"/>
  <rect x="272" y="40" width="216" height="150" rx="10" class="card-bg"/>
  <text x="380" y="32" text-anchor="middle" class="tx-b">② 배경 상자 채우기</text>
  <rect x="304" y="78" width="152" height="52" class="p3"/>
  <text x="380" y="152" text-anchor="middle" class="tx-m">Rect(W + 2·pad, H + 2·pad)</text>
  <text x="380" y="172" text-anchor="middle" class="tx-m">두께 FILLED 로 채운다</text>
  <line x1="494" y1="115" x2="522" y2="115" class="ln" stroke-width="2" marker-end="url(#c04a3)"/>
  <rect x="528" y="40" width="216" height="150" rx="10" class="card-bg"/>
  <text x="636" y="32" text-anchor="middle" class="tx-b">③ 글자 얹기</text>
  <rect x="560" y="78" width="152" height="52" class="p3"/>
  <text x="636" y="114" text-anchor="middle" class="tx-w" style="font-size:22px">OK 12.34</text>
  <text x="636" y="152" text-anchor="middle" class="tx-m">org = 상자 왼쪽 아래 − pad</text>
  <text x="636" y="172" text-anchor="middle" class="tx-m">배경색과 대비되는 글자색</text>
  <text x="380" y="216" text-anchor="middle" class="tx-m">글자가 사진 위에서 묻히지 않게 하는 가장 쉬운 방법 — 검사 장비 화면의 기본 표현</text>
</svg>`;

  // ------------------------------------------------------------------ 1교시 예제
  const EX1_BASIC = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    // 어두운 캔버스 (480행 × 640열, 3채널 컬러)
    Mat canvas(480, 640, CV_8UC3, Scalar(40, 40, 40));

    // 선: 시작점 → 끝점, 색은 (B, G, R)
    line(canvas, Point(40, 40), Point(600, 40), Scalar(0, 255, 255), 2);

    // 사각형 ① Rect 로  ② 두 점(왼쪽 위 · 오른쪽 아래)으로 — 같은 크기가 된다
    rectangle(canvas, Rect(40, 80, 200, 120), Scalar(0, 200, 0), 2);
    rectangle(canvas, Point(280, 80), Point(479, 199), Scalar(0, 200, 0), 2);

    // 원: 중심 · 반지름 · 두께 (FILLED = -1 이면 안을 채운다)
    circle(canvas, Point(120, 320), 60, Scalar(0, 0, 255), 3);
    circle(canvas, Point(300, 320), 60, Scalar(255, 120, 0), FILLED);

    // 확인은 at<Vec3b>(행 y, 열 x) — Vec3b 는 cout 으로 바로 출력할 수 있다
    cout << "선 위 픽셀        at(40, 300)  = " << canvas.at<Vec3b>(40, 300) << endl;
    cout << "채운 원 중심      at(320, 300) = " << canvas.at<Vec3b>(320, 300) << endl;
    cout << "빈 원 안쪽        at(320, 120) = " << canvas.at<Vec3b>(320, 120) << endl;
    cout << "아무것도 없는 곳  at(460, 620) = " << canvas.at<Vec3b>(460, 620) << endl;
    imshow("basic shapes", canvas);
    waitKey(0);
    return 0;
}`;

  const EX1_STYLE = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

int main()
{
    Mat canvas(300, 640, CV_8UC3, Scalar(30, 30, 30));

    // 두께 비교: 1 · 2 · 4 · 8 · FILLED(-1)
    int th[] = { 1, 2, 4, 8, FILLED };
    for (int i = 0; i < 5; i++)
    {
        int x = 30 + i * 122;
        rectangle(canvas, Rect(x, 40, 96, 64), Scalar(0, 220, 220), th[i]);
        putText(canvas, "t=" + to_string(th[i]), Point(x, 126), FONT_HERSHEY_PLAIN, 1.0, Scalar(255, 255, 255), 1);
    }

    // 같은 기울기의 대각선을 기본(LINE_8) 과 LINE_AA 로
    line(canvas, Point(60, 180), Point(300, 280), Scalar(0, 0, 255), 1, LINE_8);
    line(canvas, Point(340, 180), Point(580, 280), Scalar(0, 0, 255), 1, LINE_AA);

    // x 를 고정하고 y 를 훑어 선의 '단면' 을 봅니다 (R 채널 = [2])
    cout << "LINE_8  단면(y=227~233): ";
    for (int y = 227; y <= 233; y++) cout << (int)canvas.at<Vec3b>(y, 180)[2] << " ";
    cout << endl;
    cout << "LINE_AA 단면(y=227~233): ";
    for (int y = 227; y <= 233; y++) cout << (int)canvas.at<Vec3b>(y, 460)[2] << " ";
    cout << endl;
    imshow("thickness / lineType", canvas);
    waitKey(0);
    return 0;
}`;

  const EX1_ELLIPSE = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat canvas(400, 640, CV_8UC3, Scalar(35, 35, 35));

    // ellipse(img, 중심, Size(가로 반지름, 세로 반지름), 회전각, 시작각, 끝각, 색, 두께)
    ellipse(canvas, Point(120, 120), Size(90, 50), 0, 0, 360, Scalar(0, 220, 255), 2);
    ellipse(canvas, Point(320, 120), Size(90, 50), 30, 0, 360, Scalar(0, 220, 255), 2);

    // 호(arc): 시작각 0° ~ 끝각 120° — 각도는 x축에서 시계 방향(y 가 아래라서)
    ellipse(canvas, Point(520, 120), Size(80, 80), 0, 0, 120, Scalar(80, 255, 80), 3);
    // 부채꼴 채우기
    ellipse(canvas, Point(520, 120), Size(40, 40), 0, 0, 120, Scalar(200, 80, 255), FILLED);

    // RotatedRect 하나로: 중심 · 크기(지름!) · 각도 — 12차시 fitEllipse 결과를 그릴 때 이 형태
    RotatedRect rr(Point2f(320, 290), Size2f(300, 120), -20);
    ellipse(canvas, rr, Scalar(255, 160, 0), 2);
    cout << "중심 " << rr.center << ", 크기(지름) " << rr.size << ", 각도 " << rr.angle << endl;
    cout << "→ Size(가로 반지름, 세로 반지름) = (" << rr.size.width / 2 << ", " << rr.size.height / 2 << ")" << endl;
    imshow("ellipse / arc / RotatedRect", canvas);
    waitKey(0);
    return 0;
}`;

  const EX1_POLY = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
using namespace cv;
using namespace std;

int main()
{
    Mat canvas(400, 640, CV_8UC3, Scalar(35, 35, 35));

    // 꼭짓점을 vector<Point> 로 만든다 (모두 (x, y) 순서)
    vector<Point> tri  = { Point(60, 40), Point(200, 40), Point(130, 150) };
    vector<Point> home = { Point(300, 40), Point(420, 40), Point(420, 100), Point(470, 100),
                           Point(360, 170), Point(250, 100), Point(300, 100) };
    vector<Point> hex  = { Point(520, 40), Point(600, 70), Point(600, 130),
                           Point(520, 160), Point(480, 100) };

    // polylines · fillPoly 는 다각형 '여러 개' 를 받는다 → vector<vector<Point>>
    vector<vector<Point>> polys1 = { tri }, polys2 = { home };
    polylines(canvas, polys1, true, Scalar(0, 255, 255), 2, LINE_AA);
    fillPoly(canvas, polys2, Scalar(60, 180, 255), LINE_AA);
    fillConvexPoly(canvas, hex, Scalar(255, 120, 60), LINE_AA);   // 볼록 다각형 하나 전용(더 빠름)

    arrowedLine(canvas, Point(60, 340), Point(250, 250), Scalar(255, 255, 255), 2, LINE_AA, 0, 0.18);

    int marks[] = { MARKER_CROSS, MARKER_TILTED_CROSS, MARKER_STAR,
                    MARKER_DIAMOND, MARKER_SQUARE, MARKER_TRIANGLE_UP };
    for (int i = 0; i < 6; i++)
        drawMarker(canvas, Point(340 + i * 50, 300), Scalar(0, 0, 255), marks[i], 26, 2, LINE_AA);

    cout << "꼭짓점 수: 삼각형 " << tri.size() << ", 집 모양 " << home.size() << ", 오각 " << hex.size() << endl;
    cout << "채운 집 모양 안쪽 at(60, 360) = " << canvas.at<Vec3b>(60, 360) << endl;
    cout << "빈 삼각형 안쪽    at(60, 130) = " << canvas.at<Vec3b>(60, 130) << endl;
    imshow("polygons / arrow / markers", canvas);
    waitKey(0);
    return 0;
}`;

  const EX1_GRID = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

// 도형 그리기는 함수로 떼어 두면 어느 이미지에나 다시 쓸 수 있다
void drawGrid(Mat& img, int step)
{
    Scalar thin(215, 215, 215), bold(150, 150, 150);
    for (int x = 0; x <= img.cols; x += step)
        line(img, Point(x, 0), Point(x, img.rows), x % (step * 5) == 0 ? bold : thin, 1);
    for (int y = 0; y <= img.rows; y += step)
        line(img, Point(0, y), Point(img.cols, y), y % (step * 5) == 0 ? bold : thin, 1);
}

void drawRuler(Mat& img, int step)
{
    Scalar ink(70, 70, 70);
    for (int x = 0; x <= img.cols; x += step)
    {
        line(img, Point(x, 0), Point(x, 12), ink, 2);
        putText(img, to_string(x), Point(x + 3, 28), FONT_HERSHEY_PLAIN, 1.0, ink, 1);
    }
    for (int y = step; y <= img.rows; y += step)
    {
        line(img, Point(0, y), Point(12, y), ink, 2);
        putText(img, to_string(y), Point(16, y - 5), FONT_HERSHEY_PLAIN, 1.0, ink, 1);
    }
}

int main()
{
    Mat canvas(480, 640, CV_8UC3, Scalar(250, 250, 250));
    drawGrid(canvas, 40);          // 40 픽셀 격자
    drawRuler(canvas, 80);         // 80 픽셀마다 눈금 + 좌표 숫자
    circle(canvas, Point(320, 240), 6, Scalar(0, 0, 255), FILLED);
    cout << "세로선 " << canvas.cols / 40 + 1 << "개, 가로선 " << canvas.rows / 40 + 1 << "개" << endl;
    cout << "굵은 세로선 at(250, 200) = " << canvas.at<Vec3b>(250, 200) << endl;
    cout << "얇은 세로선 at(250, 240) = " << canvas.at<Vec3b>(250, 240) << endl;
    cout << "칸 안쪽     at(250, 210) = " << canvas.at<Vec3b>(250, 210) << endl;
    imshow("grid", canvas);
    waitKey(0);
    return 0;
}`;

  // ------------------------------------------------------------------ 2교시 예제
  const EX2_FONTS = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <iomanip>
#include <string>
using namespace cv;
using namespace std;

int main()
{
    Mat canvas(420, 640, CV_8UC3, Scalar(250, 250, 250));

    int fonts[] = { FONT_HERSHEY_SIMPLEX, FONT_HERSHEY_PLAIN, FONT_HERSHEY_DUPLEX, FONT_HERSHEY_COMPLEX,
                    FONT_HERSHEY_TRIPLEX, FONT_HERSHEY_COMPLEX_SMALL,
                    FONT_HERSHEY_SCRIPT_SIMPLEX, FONT_HERSHEY_SCRIPT_COMPLEX };
    string names[] = { "SIMPLEX", "PLAIN", "DUPLEX", "COMPLEX",
                       "TRIPLEX", "COMPLEX_SMALL", "SCRIPT_SIMPLEX", "SCRIPT_COMPLEX" };

    for (int i = 0; i < 8; i++)
    {
        string text = "OK 12.34 mm";
        int y = 46 + i * 46;
        putText(canvas, text + "  " + names[i], Point(20, y), fonts[i], 0.9,
                Scalar(40, 40, 40), 1, LINE_AA);
        int baseLine = 0;
        Size s = getTextSize(text, fonts[i], 0.9, 1, &baseLine);    // baseLine 은 포인터로 받는다
        cout << left << setw(15) << names[i] << " 폭=" << s.width << " 높이=" << s.height
             << " baseLine=" << baseLine << endl;
    }
    imshow("Hershey fonts", canvas);
    waitKey(0);
    return 0;
}`;

  const EX2_SCALE = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat canvas(320, 640, CV_8UC3, Scalar(250, 250, 250));
    string text = "OK 12.34";
    double scales[] = { 0.5, 0.8, 1.2, 1.8 };
    int y = 54;

    for (double sc : scales)
    {
        int baseLine = 0;
        Size s = getTextSize(text, FONT_HERSHEY_SIMPLEX, sc, 2, &baseLine);

        // 글자를 감싸는 상자: 기준점 y 에서 height 만큼 위 ~ baseLine 만큼 아래
        rectangle(canvas, Rect(40, y - s.height, s.width, s.height + baseLine), Scalar(190, 190, 190), 1);
        line(canvas, Point(40, y), Point(40 + s.width, y), Scalar(255, 160, 0), 1);     // 기준선
        putText(canvas, text, Point(40, y), FONT_HERSHEY_SIMPLEX, sc, Scalar(30, 30, 30), 2, LINE_AA);

        cout << format("fontScale=%.1f → 폭 %d, 높이 %d, baseLine %d", sc, s.width, s.height, baseLine) << endl;
        y += s.height + baseLine + 22;
    }
    imshow("fontScale", canvas);
    waitKey(0);
    return 0;
}`;

  const EX2_LABEL = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

// 글자 크기를 먼저 재서(getTextSize) 배경 상자를 그린 뒤 글자를 얹는다
void drawLabel(Mat& img, Point anchor, const string& text, const Scalar& color)
{
    int font = FONT_HERSHEY_SIMPLEX;
    double scale = 0.5;
    int thick = 1, pad = 4, baseLine = 0;
    Size s = getTextSize(text, font, scale, thick, &baseLine);
    Rect box(anchor.x, anchor.y - s.height - 2 * pad, s.width + 2 * pad, s.height + 2 * pad);
    rectangle(img, box, color, FILLED);                      // ① 채운 배경
    rectangle(img, box, Scalar(30, 30, 30), 1);              // ② 얇은 테두리
    putText(img, text, Point(box.x + pad, box.y + box.height - pad), font, scale,
            Scalar(20, 20, 20), thick, LINE_AA);             // ③ 글자 (상자 왼쪽 아래 기준)
    cout << "'" << text << "' → 글자 " << s.width << "x" << s.height
         << ", baseLine " << baseLine << ", 상자 " << box << endl;
}

int main()
{
    Mat gray = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    Mat view;
    cvtColor(gray, view, COLOR_GRAY2BGR);    // 색으로 표시하려면 3채널로

    drawLabel(view, Point(86, 128), "L  D6.8", Scalar(60, 180, 255));
    drawLabel(view, Point(387, 200), "M  D5.4", Scalar(90, 220, 90));
    drawLabel(view, Point(313, 265), "S  D4.0", Scalar(255, 150, 70));
    imshow("labels", view);
    waitKey(0);
    return 0;
}`;

  const EX2_PANEL = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

// ROI 를 어두운 Mat 과 섞어 반투명 배경을 만든다
void dim(Mat& img, Rect r)
{
    Mat roi = img(r);                                   // 복사가 아니라 '창' (03차시)
    Mat dark(roi.size(), CV_8UC3, Scalar(15, 15, 15));
    addWeighted(roi, 0.30, dark, 0.70, 0, roi);         // 결과를 roi 에 → 원본 img 가 바뀐다
}

void panelLine(Mat& img, Rect p, int i, const string& text, const Scalar& color)
{
    putText(img, text, Point(p.x + 10, p.y + 26 + i * 22), FONT_HERSHEY_SIMPLEX, 0.5, color, 1, LINE_AA);
}

int main()
{
    Mat gray = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat view;
    cvtColor(gray, view, COLOR_GRAY2BGR);

    // 측정: 백라이트 영상을 이진화해 부품이 차지하는 면적 비율 (07차시 내용)
    Mat bin;
    double th = threshold(gray, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    double ratio = 100.0 * countNonZero(bin) / bin.total();
    bool ok = ratio < 25.0;

    Rect panel(12, 12, 250, 104);
    dim(view, panel);                                   // 패널 자리를 어둡게 (반투명 효과)
    rectangle(view, panel, Scalar(200, 200, 200), 1);
    Scalar white(255, 255, 255);
    panelLine(view, panel, 0, "WASHER TRAY / LOT A2309", white);
    panelLine(view, panel, 1, format("OTSU TH : %.0f", th), white);
    panelLine(view, panel, 2, format("AREA    : %.2f %%", ratio), white);
    panelLine(view, panel, 3, ok ? "JUDGE   : OK" : "JUDGE   : NG",
              ok ? Scalar(80, 255, 80) : Scalar(80, 80, 255));

    cout << format("Otsu 임계값 %.0f, 면적 비율 %.2f %%, 판정 ", th, ratio) << (ok ? "OK" : "NG") << endl;
    imshow("overlay panel", view);
    waitKey(0);
    return 0;
}`;

  const EX2_MINI = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
#include <vector>
using namespace cv;
using namespace std;

void drawLabel(Mat& img, Point anchor, const string& text, const Scalar& color)
{
    int pad = 3, baseLine = 0;
    Size s = getTextSize(text, FONT_HERSHEY_SIMPLEX, 0.45, 1, &baseLine);
    Rect box(anchor.x, anchor.y - s.height - 2 * pad, s.width + 2 * pad, s.height + 2 * pad);
    rectangle(img, box, color, FILLED);
    putText(img, text, Point(box.x + pad, box.y + box.height - pad), FONT_HERSHEY_SIMPLEX,
            0.45, Scalar(20, 20, 20), 1, LINE_AA);
}

int main()
{
    Mat gray = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    Mat view;
    cvtColor(gray, view, COLOR_GRAY2BGR);

    // assets/IMAGES.md 의 정답 좌표 · 반지름 (검출하는 방법은 12~13차시)
    vector<Point> c = { Point(120, 165), Point(279, 384), Point(549, 346),
                        Point(56, 277), Point(588, 165), Point(414, 230), Point(311, 166),
                        Point(333, 288), Point(341, 68), Point(210, 370),
                        Point(194, 54), Point(481, 96) };
    vector<int> r = { 34, 34, 34, 27, 27, 27, 27, 20, 20, 20, 20, 20 };
    double mmPerPx = 0.1;
    int nL = 0, nM = 0, nS = 0;

    for (size_t i = 0; i < c.size(); i++)
    {
        string cls = "S";
        Scalar col(255, 150, 70);
        if (r[i] >= 34) { cls = "L"; col = Scalar(60, 180, 255); nL++; }
        else if (r[i] >= 27) { cls = "M"; col = Scalar(90, 220, 90); nM++; }
        else nS++;

        circle(view, c[i], r[i], col, 2, LINE_AA);
        drawMarker(view, c[i], col, MARKER_CROSS, 12, 1, LINE_AA);
        string tag = to_string(i + 1) + " " + cls + " " + format("%.1f", 2 * r[i] * mmPerPx);
        drawLabel(view, Point(c[i].x - r[i], c[i].y - r[i] - 2), tag, col);
    }

    cout << "부품 " << c.size() << "개 — L " << nL << " · M " << nM << " · S " << nS << endl;
    cout << "1번 라벨 배경 at(120, 87) = " << view.at<Vec3b>(120, 87) << endl;
    imwrite("coins_labeled.png", view);
    cout << "저장: coins_labeled.png (📁 작업 폴더에서 내려받기)" << endl;
    imshow("coins labeled", view);
    waitKey(0);
    return 0;
}`;

  const EX2_FREETYPE = `// opencv_contrib 의 freetype 모듈이 포함되도록 직접 빌드한 OpenCV 가 필요합니다
// (공식 Windows 설치 패키지에는 없습니다). 폰트 파일은 Windows 의 맑은 고딕.
#include <opencv2/opencv.hpp>
#include <opencv2/freetype.hpp>
using namespace cv;

int main()
{
    Mat view = imread("images/washers.png", IMREAD_COLOR);
    Ptr<freetype::FreeType2> ft2 = freetype::createFreeType2();
    ft2->loadFontData("C:/Windows/Fonts/malgun.ttf", 0);

    // putText(img, 글자, org, 글자 높이(px), 색, 두께(-1=채움), 선 종류, bottomLeftOrigin)
    ft2->putText(view, "판정: 양품", Point(20, 50), 32, Scalar(0, 200, 0), -1, LINE_AA, true);
    imshow("korean", view);
    waitKey(0);
    return 0;
}`;

  // ------------------------------------------------------------------ 퀴즈
  const QUIZ1 = [
    { q: '<code>circle(img, Point(100, 50), 30, Scalar(0, 0, 255), FILLED)</code> 에서 <code>FILLED</code> 의 뜻은?', options: ['선을 지운다', '안을 채운다', '두께 1로 그린다', '오류'], answer: 1,
      explain: '두께에 <b>FILLED</b>(= −1)를 주면 도형의 <b>안을 채웁니다</b>. rectangle · circle · ellipse 모두 같습니다. Python 의 <code>cv2.circle(..., -1)</code> 과 같습니다.' },
    { q: '<code>Scalar(0, 255, 0)</code> 은 어떤 색인가?', options: ['빨강', '초록', '파랑', '노랑'], answer: 1,
      explain: 'OpenCV 의 색은 <b>(B, G, R)</b> 순서이므로 G 만 255 → <b>초록</b>입니다. 빨강은 <code>(0, 0, 255)</code>, 노랑은 <code>(0, 255, 255)</code> 입니다.' },
    { q: '<code>rectangle</code> 에 <code>Rect(40, 80, 200, 120)</code> 을 넘겼을 때 사각형의 오른쪽 아래 모서리는?', options: ['(200, 120)', '(240, 200)', '(40, 80)', '(160, 40)'], answer: 1,
      explain: 'Rect 는 <b>(x, y, 너비, 높이)</b> 이므로 오른쪽 아래는 (40+200, 80+120) = <b>(240, 200)</b> 입니다(그려지는 마지막 픽셀은 (239, 199)). 두 점으로 그릴 때는 <code>Point(40, 80), Point(239, 199)</code> 로 넘깁니다.' },
    { q: '기울어진 선이나 원의 경계를 매끈하게 그리려면?', options: ['두께를 0 으로', '<code>LINE_AA</code> 를 준다', '<code>LINE_4</code> 를 준다', '이미지를 2배로 키운다'], answer: 1,
      explain: '<b>LINE_AA</b>(=16)는 경계 픽셀의 값을 배경과 섞어(부분 덮힘 비율만큼) 계단을 없앱니다. 기본값 <code>LINE_8</code> 은 빠르지만 톱니가 보입니다. 다만 안티에일리어싱 결과는 <b>중간 값 픽셀</b>이 생기므로 마스크(0/255)를 그릴 때는 쓰지 마세요.' },
    { q: '<code>polylines(img, pts, true, color, 2)</code> 의 세 번째 인수 <code>true</code> 는?', options: ['채우기 여부', '마지막 점과 첫 점을 잇는다(닫힌 도형)', '안티에일리어싱', '좌표를 (y, x) 로 해석'], answer: 1,
      explain: '<code>isClosed</code> 입니다. true 면 마지막 꼭짓점과 첫 꼭짓점을 이어 닫힌 도형을 그립니다. 안을 채우려면 <code>fillPoly</code>(오목해도 됨) 또는 <code>fillConvexPoly</code>(볼록 전용, 더 빠름)를 씁니다.' }
  ];
  const QUIZ2 = [
    { q: '<code>putText(img, "OK", Point(100, 200), …)</code> 에서 (100, 200) 은 글자의 어디인가?', options: ['왼쪽 위', '왼쪽 아래(기준선)', '가운데', '오른쪽 아래'], answer: 1,
      explain: 'putText 의 <code>org</code> 는 글자의 <b>왼쪽 아래(기준선 baseline 위치)</b>입니다. 그래서 y 를 그대로 쓰면 글자가 그 위로 올라갑니다 — y 가 작으면 이미지 밖으로 잘려 보이지 않습니다.' },
    { q: '글자 뒤에 배경 상자를 그리려면 무엇을 먼저 해야 하나?', options: ['<code>getTextSize</code> 로 글자 크기를 잰다', '<code>putText</code> 로 먼저 글자를 그린다', '이미지를 그레이로 바꾼다', '<code>resize</code> 로 이미지를 키운다'], answer: 0,
      explain: '<code>getTextSize(text, font, scale, thickness, &amp;baseLine)</code> 이 글자의 <b>폭 · 높이</b>를 <code>Size</code> 로 돌려주고 <b>baseLine</b> 은 포인터로 넘긴 변수에 써 줍니다. 이 값으로 Rect 를 만들어 <b>먼저 채운 상자</b>를 그리고, 그다음 글자를 얹습니다 (순서를 바꾸면 글자가 상자에 덮힙니다).' },
    { q: 'OpenCV 의 <code>putText</code> 로 "양품" 을 그리면?', options: ['정상적으로 한글이 나온다', '물음표(?)나 엉뚱한 기호로 나온다', '컴파일 오류가 난다', '자동으로 영문으로 번역된다'], answer: 1,
      explain: 'OpenCV 는 <b>Hershey 벡터 폰트(영문 · 숫자 · 기호)</b>만 내장하고 있어 한글은 그릴 수 없습니다(오류도 나지 않습니다). 이미지에 새길 글자는 영문 · 숫자로 쓰고, 한글이 꼭 필요하면 opencv_contrib 의 <code>freetype</code> 모듈이나 GUI 프레임워크(MFC · Qt 등)의 글자 출력을 씁니다.' },
    { q: '<code>getTextSize</code> 가 돌려주는 <code>baseLine</code> 은?', options: ['글자의 전체 높이', '기준선 아래로 내려가는 부분(g, y, p 의 꼬리) 높이', '글자 개수', '기준선의 y 좌표'], answer: 1,
      explain: 'baseLine 은 <b>기준선 아래로 더 필요한 높이</b>입니다. 글자를 완전히 감싸는 상자의 높이는 <code>size.height + baseLine</code> 입니다.' },
    { q: '사진 위의 흰 글자가 밝은 배경에서 잘 안 보일 때 가장 간단한 해결은?', options: ['fontScale 을 0.1 로 줄인다', '채운 상자(배경)를 먼저 그리거나, 굵은 검은 글자를 먼저 그린 뒤 흰 글자를 덧쓴다', 'imwrite 로 저장한다', 'CV_32F 로 바꾼다'], answer: 1,
      explain: '① <b>배경 상자</b>(getTextSize + rectangle(FILLED))를 깔거나 ② 같은 글자를 <b>두꺼운 검정</b>으로 먼저 그리고 그 위에 <b>얇은 흰색</b>을 덧그려 외곽선 효과를 줍니다. 검사 장비 화면에서 아주 많이 쓰는 기법입니다.' }
  ];

  // ------------------------------------------------------------------ 차시
  CV_COURSE.addChapter({
    id: 'cv04', no: '04', title: '그리기와 텍스트', subtitle: '도형 · 선 · 다각형 · 마커와 putText · 라벨 상자',
    summary: '검사 결과를 <b>사람이 볼 수 있게</b> 만드는 도구를 배웁니다. <code>line · rectangle · circle · ellipse · polylines · fillPoly · arrowedLine · drawMarker</code> 로 도형을 그리고, 두께 · <code>LINE_AA</code> · <code>FILLED</code> 채우기를 조절합니다. 2교시에는 <code>putText</code> 로 글자를 넣고 <b><code>getTextSize</code> 로 배경 상자를 만드는 라벨 함수</b>와 결과 오버레이 패널을 만들어, <code>images/coins_parts.png</code> 의 부품 12개에 번호 라벨을 붙입니다.',
    goals: ['line · rectangle · circle · ellipse · polylines · fillPoly · arrowedLine · drawMarker 로 원하는 도형을 그릴 수 있다', '두께 · lineType · FILLED · Scalar(B, G, R) 를 자유롭게 조절하고 반복문 · 함수로 그리기를 정리할 수 있다', 'putText 의 기준점(왼쪽 아래)을 이해하고 폰트 · fontScale · 두께를 고를 수 있다', 'getTextSize 로 배경 상자가 있는 라벨과 결과 오버레이 패널을 만들 수 있고, 한글은 putText 로 그릴 수 없음을 안다'],
    sections: [
      // ================================================================ 1교시
      {
        id: 'cv04-1', title: '도형 그리기: 선 · 사각형 · 원 · 다각형', minutes: 50,
        goals: ['그리기 함수들의 공통 인수 규칙(Mat, 위치, 색, 두께, 선 종류)을 안다', '타원 · 호 · RotatedRect · 다각형 · 화살표 · 마커를 그릴 수 있다', '반복문과 함수 분리로 격자 · 눈금 같은 반복 도형을 깔끔하게 그릴 수 있다'],
        flow: [['도입: 왜 그리나', 5], ['도형 함수와 인수 규칙', 15], ['타원 · 다각형 · 격자 실습', 20], ['정리 · 퀴즈', 10]],
        content: [
          { type: 'h', text: '왜 이미지에 그리나?' },
          { type: 'p', html: '검사 프로그램이 "부품 12개, 3번은 불량"이라고 계산해도, 사람은 <b>화면에서 어디가 불량인지</b> 보고 싶어 합니다. 그래서 머신비전 프로그램은 거의 항상 원본 이미지 위에 <b>검출 위치(원 · 사각형) · 측정선 · 번호 · 판정 결과</b>를 그려 보여 줍니다. 그리기는 또 가장 좋은 <b>디버깅 도구</b>입니다 — 윤곽선이 엉뚱하게 잡혔는지, ROI 가 제자리에 있는지는 그려 보면 1초에 압니다.' },
          { type: 'list', items: [
            '<b>결과 표시</b>: 검출한 물체에 원 · 사각형 · 번호 라벨, 합격/불량 색 구분',
            '<b>측정 표시</b>: 두 점 사이 거리, 캘리퍼 선, 기준 격자 · 눈금',
            '<b>디버깅</b>: 중간 결과(윤곽선 · 중심점 · ROI)를 눈으로 확인 — <code>imshow</code> + 그리기',
            '<b>보고서 · 기록</b>: <code>imwrite</code> 로 판정 결과가 그려진 이미지를 저장'
          ] },
          { type: 'callout', kind: 'warn', title: '원본에 그리면 원본이 망가진다', html: '그리기 함수는 첫 인수(<code>InputOutputArray</code>)로 받은 <b>Mat 에 직접 그립니다</b>(제자리 연산). 원본을 계속 쓸 거라면 <code>Mat view = img.clone();</code> 으로 복사본을 만들어 그 위에 그리세요 — <code>Mat view = img;</code> 는 <b>헤더만 복사</b>되어 같은 픽셀을 가리키므로 원본도 함께 바뀝니다 (03차시). 또 <b>그레이(1채널) 이미지에는 색이 나오지 않습니다</b> — <code>cvtColor(gray, view, COLOR_GRAY2BGR)</code> 로 3채널로 바꾼 뒤 그립니다.' },
          { type: 'h', text: '공통 규칙: (Mat, 위치…, 색, 두께, 선 종류)' },
          { type: 'figure', html: FIG_COORD, caption: '그림 1. 왼쪽 — 점은 모두 (x, y), Rect 는 (x, y, w, h). 오른쪽 — 두께와 선 종류(LINE_8 / LINE_AA), 두께 FILLED(−1)는 채우기' },
          { type: 'table', head: ['C++ (OpenCV)', 'Python cv2', '무엇을 그리나'], rows: [
            ['<code>line(img, p1, p2, color, thickness, lineType)</code>', '<code>cv2.line</code>', '두 점을 잇는 선'],
            ['<code>rectangle(img, rect, color, thickness)</code><br><code>rectangle(img, p1, p2, color, thickness)</code>', '<code>cv2.rectangle</code>', '사각형 — Rect 또는 두 점(왼위 · 오른아래)'],
            ['<code>circle(img, center, radius, color, thickness)</code>', '<code>cv2.circle</code>', '원'],
            ['<code>ellipse(img, center, Size(a, b), angle, start, end, color, thickness)</code><br><code>ellipse(img, rotatedRect, color, thickness)</code>', '<code>cv2.ellipse</code>', '타원 · 호 · 부채꼴'],
            ['<code>polylines(img, pts, isClosed, color, thickness)</code>', '<code>cv2.polylines</code>', '꺾은선 · 다각형 테두리'],
            ['<code>fillPoly(img, pts, color)</code> / <code>fillConvexPoly(img, pt, color)</code>', '<code>cv2.fillPoly</code> / <code>fillConvexPoly</code>', '채운 다각형 (Convex 는 볼록 전용 · 더 빠름)'],
            ['<code>arrowedLine(img, p1, p2, color, thickness, lineType, shift, tipLength)</code>', '<code>cv2.arrowedLine</code>', '화살표 (방향 표시)'],
            ['<code>drawMarker(img, pt, color, markerType, size, thickness)</code>', '<code>cv2.drawMarker</code>', '십자 · 별 · 다이아몬드 마커 (중심 표시)'],
            ['<code>putText(img, text, org, font, scale, color, thickness)</code>', '<code>cv2.putText</code>', '글자 (2교시)']
          ], caption: '표 1. 그리기 함수 — 이름 · 인수 순서가 Python 과 같다. 두께 · lineType 은 생략 가능(기본 1, LINE_8)' },
          { type: 'figure', html: FIG_SHAPES, caption: '그림 2. 도형별로 다른 것은 "위치를 어떻게 적는가" 뿐이다 — 색 · 두께 · 선 종류는 모두 같은 자리' },
          { type: 'code', title: '예제 1: 선 · 사각형 · 원 (기본 3종)', code: EX1_BASIC,
            desc: '<code>Rect(40, 80, 200, 120)</code> 과 <code>Point(280, 80), Point(479, 199)</code> 가 같은 크기(200×120)의 사각형을 만듭니다 — 두 점 방식은 <b>오른쪽 아래 점이 포함</b>되므로 너비가 <code>x2 − x1 + 1</code> 입니다. 마지막 원은 두께 <code>FILLED</code> 라 안이 채워집니다. 출력의 픽셀 값으로 어디에 무엇이 그려졌는지 확인하세요 (<code>at</code> 은 <b>(행 y, 열 x)</b>!). <code>Vec3b</code> 는 <code>cout</code> 에 바로 넘기면 <code>[B, G, R]</code> 형식의 숫자로 출력됩니다.',
            expect: '' },
          { type: 'code', title: '예제 2: 두께와 선 종류(LINE_AA) 비교', code: EX1_STYLE,
            desc: '두께를 1 → 8 로 키우고 마지막은 <code>FILLED</code>(-1, 채우기)입니다. 아래 두 대각선은 같은 기울기인데 <code>LINE_8</code>(기본)과 <code>LINE_AA</code> 로 그렸습니다. 출력된 <b>세로 단면</b>을 보면 LINE_8 은 배경(30)과 선(255)만 있는데 LINE_AA 는 그 <b>사이 값</b>이 생기는 것이 보입니다 — 이것이 톱니를 눈에 덜 띄게 만드는 원리입니다. 개별 채널 값은 <code>uchar</code> 이므로 <code>(int)</code> 로 바꿔 출력합니다.',
            expect: '' },
          { type: 'callout', kind: 'tip', title: '마스크에는 LINE_AA 금지', html: '이진 마스크(0 또는 255)를 만들려고 <code>circle(mask, …, FILLED, LINE_AA)</code> 를 쓰면 <b>경계에 1~254 의 중간 값</b>이 생겨 <code>countNonZero</code> · <code>copyTo(dst, mask)</code> 결과가 미묘하게 달라집니다. <b>보여 주는 그림에는 LINE_AA, 계산에 쓰는 마스크에는 기본값(LINE_8)</b>이 원칙입니다.' },
          { type: 'h', text: '타원 · 호 · RotatedRect' },
          { type: 'code', title: '예제 3: ellipse — 타원 · 호 · 부채꼴 · RotatedRect', code: EX1_ELLIPSE,
            desc: '<code>Size(a, b)</code> 는 <b>반지름</b>(가로 반지름, 세로 반지름)이지만, <code>RotatedRect</code> 의 <code>size</code> 는 <b>지름</b>(전체 너비, 높이)입니다 — 두 배 차이이니 주의하세요. 각도는 x축에서 <b>시계 방향</b>(y축이 아래를 향하므로)입니다. 12차시에서 <code>fitEllipse</code> 가 돌려주는 RotatedRect 를 이 한 줄로 그립니다. <code>Point2f</code> · <code>Size2f</code> 도 <code>cout</code> 으로 바로 출력됩니다.',
            expect: '' },
          { type: 'h', text: '다각형 · 화살표 · 마커' },
          { type: 'code', title: '예제 4: polylines · fillPoly · fillConvexPoly · arrowedLine · drawMarker', code: EX1_POLY,
            desc: '다각형은 <b><code>vector&lt;Point&gt;</code></b> 로 꼭짓점을 적습니다. <code>polylines</code> / <code>fillPoly</code> 는 여러 다각형을 한 번에 그릴 수 있어 인수가 <b>vector 의 vector</b>(<code>vector&lt;vector&lt;Point&gt;&gt;</code>)입니다 — 12차시의 <code>findContours</code> 결과를 그대로 넘길 수 있는 형태입니다. <code>fillConvexPoly</code> 는 볼록 다각형 <b>하나</b>(<code>vector&lt;Point&gt;</code>)만 받고 더 빠릅니다. <code>drawMarker</code> 는 중심을 정확히 찍을 때 십자 · 별 모양을 그려 줍니다. <code>tri.size()</code> 는 <code>size_t</code> 라서 그대로 출력됩니다.',
            expect: '' },
          { type: 'h', text: '반복문과 함수로 정리하기' },
          { type: 'code', title: '예제 5: 격자 · 눈금 그리기 (함수로 분리)', code: EX1_GRID,
            desc: '반복되는 그리기는 <b>함수로 떼어 냅니다</b>: <code>void drawGrid(Mat&amp; img, int step)</code> 처럼 "그릴 Mat" 을 인수로 받으면 어떤 이미지에나 다시 쓸 수 있습니다. <code>Mat</code> 은 헤더 + 공유 픽셀 구조라서 값으로 넘겨도(<code>Mat img</code>) 같은 픽셀에 그려지지만, "이 함수가 이미지를 바꾼다"는 뜻을 드러내려고 <b>참조(<code>Mat&amp;</code>)</b>로 받는 것이 좋습니다. 5칸마다 굵은 선을 넣어 좌표를 읽기 쉽게 했습니다. 출력에서 x=200 은 <code>step*5</code> 의 배수라 굵은 선(150)이고 x=240 은 얇은 선(215)입니다. 숫자를 글자로 바꿀 때는 <code>to_string(x)</code> 를 씁니다.',
            expect: '' },
          { type: 'callout', kind: 'tip', title: 'C++ 에는 색 이름 상수가 없다', html: 'C# 의 <code>Scalar.Red</code> 나 Python 의 색 이름 같은 상수는 OpenCV C++ 에 없습니다. 자주 쓰는 색은 직접 상수로 만들어 두세요: <code>const Scalar RED(0, 0, 255), GREEN(0, 255, 0), BLUE(255, 0, 0), YELLOW(0, 255, 255), WHITE(255, 255, 255);</code> 팀 규칙으로 <b>OK = 초록, NG = 빨강, 정보 = 노랑</b>처럼 색을 미리 정해 두면 화면이 훨씬 읽기 쉬워집니다.' },
          { type: 'callout', kind: 'vs', title: 'Visual Studio 에서는', html: '로컬 PC 에서는 <code>imshow</code> 창이 실제로 열립니다. 결과를 다시 그리고 싶을 때(예: 선택한 부품만 강조) 그림이 계속 쌓이지 않게 <b>매번 원본을 <code>clone()</code> 한 뒤 그리고 <code>imshow</code></b> 하는 습관을 들이세요. 창 크기가 이미지보다 작으면 <code>namedWindow("w", WINDOW_NORMAL)</code> 으로 크기를 조절할 수 있는 창을 만듭니다. 그려진 결과는 <code>imwrite</code> 로 저장하면 보고서 · 불량 이력에 그대로 쓸 수 있습니다.' }
        ],
        practice: [
          {
            title: '반복문으로 과녁(동심원) 그리기', level: 1,
            desc: '400×400 컬러 캔버스에 중심 (200, 200) 의 <b>과녁</b>을 그리세요. 반지름을 <b>180 → 20 까지 20 씩 줄이며</b> 원을 <code>FILLED</code>(채우기)로 그리고, 색은 빨강 <code>(0,0,255)</code> 과 흰색 <code>(255,255,255)</code> 을 번갈아 씁니다. 마지막으로 중심에 <code>drawMarker</code> 로 십자(크기 40, 두께 2, 검정)를 찍고, 원 개수와 중심 픽셀 · 가장 바깥 원의 픽셀 값을 출력하세요.',
            hint: '<code>for (int r = 180; r &gt;= 20; r -= 20)</code> 안에서 순번 <code>n</code> 을 세어 짝/홀로 색을 고릅니다: <code>Scalar col = (n % 2 == 0) ? Scalar(0, 0, 255) : Scalar(255, 255, 255);</code> 큰 원부터 그려야 작은 원이 위에 남습니다. 십자는 <code>MARKER_CROSS</code>.',
            expect: '',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat canvas(400, 400, CV_8UC3, Scalar(240, 240, 240));
    int n = 0;
    for (int r = 180; r >= 20; r -= 20)
    {
        // TODO: n 이 짝수면 빨강, 홀수면 흰색으로 채운 원을 그리고 n 을 늘리세요
    }
    // TODO: 중심 (200, 200) 에 drawMarker 로 검정 십자 (MARKER_CROSS, 40, 2)

    cout << "원 개수: " << n << endl;
    cout << "중심    at(200, 200) = " << canvas.at<Vec3b>(200, 200) << endl;
    cout << "바깥 원 at(200, 30)  = " << canvas.at<Vec3b>(200, 30) << endl;
    imshow("target", canvas);
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat canvas(400, 400, CV_8UC3, Scalar(240, 240, 240));
    int n = 0;
    for (int r = 180; r >= 20; r -= 20)
    {
        Scalar col = (n % 2 == 0) ? Scalar(0, 0, 255) : Scalar(255, 255, 255);
        circle(canvas, Point(200, 200), r, col, FILLED);
        n++;
    }
    drawMarker(canvas, Point(200, 200), Scalar(0, 0, 0), MARKER_CROSS, 40, 2);

    cout << "원 개수: " << n << endl;
    cout << "중심    at(200, 200) = " << canvas.at<Vec3b>(200, 200) << endl;
    cout << "바깥 원 at(200, 30)  = " << canvas.at<Vec3b>(200, 30) << endl;
    imshow("target", canvas);
    waitKey(0);
    return 0;
}`
          },
          {
            title: '부품 위치 표시 함수 만들기', level: 2,
            desc: '<code>void markPart(Mat&amp; img, Point center, int half, const Scalar&amp; color)</code> 함수를 만들어 ① 중심에 <code>drawMarker</code> 십자(크기 16, 두께 1) ② 한 변 <code>2*half</code> 인 사각형(두께 2)을 그리게 하세요. <code>images/washers.png</code> 를 흑백으로 읽어 <b>3채널로 변환</b>한 뒤 와셔 W1 (90, 90) · 너트 N2 (340, 240) · 볼트 B3 (400, 400) 세 곳을 각각 다른 색(노랑 · 초록 · 빨강)으로 표시하고, 사각형 왼쪽 위 모서리의 픽셀 값을 출력하세요.',
            hint: '사각형은 <code>Rect(center.x - half, center.y - half, 2 * half, 2 * half)</code>. 그레이를 3채널로: <code>cvtColor(gray, view, COLOR_GRAY2BGR)</code>. 색은 BGR 이므로 노랑 = (0,255,255).',
            expect: '',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

void markPart(Mat& img, Point center, int half, const Scalar& color)
{
    // TODO: drawMarker 로 십자(크기 16, 두께 1) + rectangle 로 사각형(두께 2)
}

int main()
{
    Mat gray = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat view;
    cvtColor(gray, view, COLOR_GRAY2BGR);

    markPart(view, Point(90, 90), 50, Scalar(0, 255, 255));
    // TODO: N2 (340, 240) 초록(0,255,0), B3 (400, 400) 빨강(0,0,255) 도 표시하세요

    cout << "W1 상자 모서리 at(40, 40)   = " << view.at<Vec3b>(40, 40) << endl;
    cout << "N2 상자 모서리 at(190, 290) = " << view.at<Vec3b>(190, 290) << endl;
    cout << "B3 상자 모서리 at(350, 350) = " << view.at<Vec3b>(350, 350) << endl;
    imshow("marked", view);
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

void markPart(Mat& img, Point center, int half, const Scalar& color)
{
    drawMarker(img, center, color, MARKER_CROSS, 16, 1);
    rectangle(img, Rect(center.x - half, center.y - half, 2 * half, 2 * half), color, 2);
}

int main()
{
    Mat gray = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat view;
    cvtColor(gray, view, COLOR_GRAY2BGR);

    markPart(view, Point(90, 90), 50, Scalar(0, 255, 255));
    markPart(view, Point(340, 240), 50, Scalar(0, 255, 0));
    markPart(view, Point(400, 400), 50, Scalar(0, 0, 255));

    cout << "W1 상자 모서리 at(40, 40)   = " << view.at<Vec3b>(40, 40) << endl;
    cout << "N2 상자 모서리 at(190, 290) = " << view.at<Vec3b>(190, 290) << endl;
    cout << "B3 상자 모서리 at(350, 350) = " << view.at<Vec3b>(350, 350) << endl;
    imshow("marked", view);
    waitKey(0);
    return 0;
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: '그리기와 텍스트', subtitle: '1교시 — 도형 그리기: 선 · 사각형 · 원 · 다각형', notes: '<p>💬 "검사 프로그램이 불량을 찾았을 때, 화면에는 무엇이 보여야 할까요?" — 예상 답: 어디가 불량인지 표시, 개수, 판정. 오늘은 그 표시를 그리는 도구를 배운다고 안내합니다. 3차시에서 배운 Point · Rect · Scalar 를 그대로 쓴다고 연결합니다. (3분)</p>' },
          { layout: 'bullets', title: '왜 이미지에 그리나', lead: '계산 결과 → 사람이 보는 화면', bullets: [
            '<b>결과 표시</b>: 검출한 물체에 원 · 사각형 · 번호, 합격/불량 색 구분',
            '<b>측정 표시</b>: 거리 · 캘리퍼 선 · 기준 격자',
            '<b>디버깅</b>: 중간 결과를 그려 보면 1초에 확인된다 (가장 강력한 디버깅 도구)',
            '<b>기록</b>: <code>imwrite</code> 로 판정이 그려진 이미지를 저장',
            ['주의', ['그리기 함수는 <b>넘긴 Mat 을 직접 바꾼다</b> → <code>img.clone()</code>', '그레이(1채널)에는 색이 안 나온다 → <code>COLOR_GRAY2BGR</code>']]
          ], notes: '<p>실제 검사 장비 화면을 떠올리게 합니다. 마지막 "주의" 두 가지는 오늘 실습에서 학생들이 반드시 만나는 함정이니 미리 강조합니다. 💬 "그레이 이미지에 빨간 원을 그리면?" — 회색으로 보인다(채널이 1개라 Scalar 의 첫 값 0 만 쓰여 검게 나온다). <code>Mat view = img;</code> 는 헤더 복사라 원본도 바뀐다는 03차시 내용도 상기시킵니다. (5분)</p>' },
          { layout: 'diagram', title: '좌표와 공통 인수 규칙', html: FIG_COORD, caption: '점은 모두 (x, y) · Rect 는 (x, y, w, h) · 색은 Scalar(B, G, R) · 두께 FILLED(−1) 는 채우기', notes: '<p>왼쪽: 3차시의 <code>at(행, 열)</code> 과 달리 <b>그리기 함수는 전부 (x, y)</b> 임을 다시 확인합니다. 오른쪽: 두께 1/6/FILLED 와 LINE_8/LINE_AA 를 비교합니다. 💬 "두께에 0 을 주면?" — 오류(두께는 양수 또는 FILLED). 마스크에는 LINE_AA 를 쓰지 않는다는 규칙을 예고합니다. (6분)</p>' },
          { layout: 'table', title: '그리기 함수 한눈에 (Python 대응)', head: ['C++', 'Python', '무엇'], rows: [
            ['<code>line(img, p1, p2, …)</code>', '<code>cv2.line</code>', '선'],
            ['<code>rectangle(img, rect 또는 p1, p2, …)</code>', '<code>cv2.rectangle</code>', '사각형'],
            ['<code>circle(img, center, r, …)</code>', '<code>cv2.circle</code>', '원'],
            ['<code>ellipse(img, center, Size(a,b), angle, s, e, …)</code>', '<code>cv2.ellipse</code>', '타원 · 호'],
            ['<code>polylines / fillPoly / fillConvexPoly</code>', '<code>cv2.polylines / fillPoly</code>', '다각형'],
            ['<code>arrowedLine / drawMarker</code>', '<code>cv2.arrowedLine / drawMarker</code>', '화살표 · 마커'],
            ['<code>putText(img, text, org, font, scale, …)</code>', '<code>cv2.putText</code>', '글자 (2교시)']
          ], lead: '다른 것은 "위치를 어떻게 적는가" 뿐 — 색 · 두께 · lineType 은 항상 뒤쪽 같은 자리', notes: '<p>표를 훑으며 이름 · 인수 순서가 Python 과 똑같다는 점을 강조합니다. 차이는 C++ 에서는 결과를 돌려받지 않고 <b>첫 인수 Mat 에 그린다</b>는 것. 두께와 lineType 은 생략 가능(기본 1, LINE_8). (4분)</p>' },
          { layout: 'code', title: '예제 1: 선 · 사각형 · 원', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat canvas(480, 640, CV_8UC3, Scalar(40, 40, 40));
    line(canvas, Point(40, 40), Point(600, 40), Scalar(0, 255, 255), 2);

    // 두 방식이 같은 크기(200×120) 사각형
    rectangle(canvas, Rect(40, 80, 200, 120), Scalar(0, 200, 0), 2);
    rectangle(canvas, Point(280, 80), Point(479, 199), Scalar(0, 200, 0), 2);

    circle(canvas, Point(120, 320), 60, Scalar(0, 0, 255), 3);
    circle(canvas, Point(300, 320), 60, Scalar(255, 120, 0), FILLED);   // 채우기

    cout << "채운 원 중심 at(320, 300) = " << canvas.at<Vec3b>(320, 300) << endl;
    imshow("basic shapes", canvas);
    waitKey(0);
    return 0;
}`, points: ['<code>Scalar(0, 0, 255)</code> = 빨강 (BGR!)', 'Rect(x, y, w, h) ↔ 두 점: 너비 = x2 − x1 + 1', '두께 <code>FILLED</code> = 채우기', '확인은 <code>at&lt;Vec3b&gt;(y, x)</code> — 그리기는 (x, y), 읽기는 (y, x)'], notes: '<p>실행한 뒤 결과 창에서 마우스로 픽셀 값을 확인하게 합니다. 학생 활동: 색을 바꿔 보기, 두께를 FILLED 로 바꿔 보기. 💬 "두 사각형의 크기가 정말 같을까?" — 두 점 방식은 끝점 포함이라 479−280+1 = 200. (7분)</p>' },
          { layout: 'diagram', title: '도형별 인수 비교', html: FIG_SHAPES, caption: 'line(두 점) · rectangle(Rect/두 점) · circle(중심, r) · ellipse(중심, Size, 각도) · polylines(vector<Point>)', notes: '<p>그림을 보며 각 도형이 "위치를 어떻게 적는지" 말하게 합니다. drawMarker 의 네 가지 모양을 짚고, 중심을 정확히 표시할 때 편하다고 설명합니다. (4분)</p>' },
          { layout: 'code', title: '예제 3: 타원 · 호 · RotatedRect', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat canvas(400, 640, CV_8UC3, Scalar(35, 35, 35));
    Scalar yellow(0, 220, 255);
    // Size(a, b) = (가로 반지름, 세로 반지름), 회전각, 시작각, 끝각
    ellipse(canvas, Point(120, 120), Size(90, 50), 0, 0, 360, yellow, 2);
    ellipse(canvas, Point(320, 120), Size(90, 50), 30, 0, 360, yellow, 2);
    // 호 · 부채꼴 (0° ~ 120°, 시계 방향)
    ellipse(canvas, Point(520, 120), Size(80, 80), 0, 0, 120, Scalar(80, 255, 80), 3);
    ellipse(canvas, Point(520, 120), Size(40, 40), 0, 0, 120, Scalar(200, 80, 255), FILLED);
    // RotatedRect 의 size 는 '지름' 이다 (Size(a,b) 의 2배)
    RotatedRect rr(Point2f(320, 290), Size2f(300, 120), -20);
    ellipse(canvas, rr, Scalar(255, 160, 0), 2);
    cout << "중심 " << rr.center << ", 크기 " << rr.size << ", 각도 " << rr.angle << endl;
    imshow("ellipse", canvas);
    waitKey(0);
    return 0;
}`, points: ['<code>Size(a, b)</code> = <b>반지름</b> 쌍', '<code>RotatedRect::size</code> = <b>지름</b> (2배 주의!)', '시작각 · 끝각으로 호 · 부채꼴', '12차시 <code>fitEllipse</code> 결과를 그리는 형태'], notes: '<p>반지름 vs 지름 혼동이 이 함수의 최대 함정입니다. 화면에서 두 타원(rr 과 Size(150,60))이 같은 크기인지 확인시키면 좋습니다. 💬 "각도를 90 으로 바꾸면?" — 세로로 긴 타원. (6분)</p>' },
          { layout: 'code', title: '예제 4: 다각형 · 화살표 · 마커', code: `#include <opencv2/opencv.hpp>
#include <vector>
using namespace cv;
using namespace std;

int main()
{
    Mat canvas(400, 640, CV_8UC3, Scalar(35, 35, 35));
    vector<Point> tri = { Point(60, 40), Point(200, 40), Point(130, 150) };
    vector<Point> hex = { Point(520, 40), Point(600, 70), Point(600, 130),
                          Point(520, 160), Point(480, 100) };

    // 여러 다각형을 받으므로 'vector 의 vector'
    vector<vector<Point>> polys = { tri };
    polylines(canvas, polys, true, Scalar(0, 255, 255), 2, LINE_AA);
    fillConvexPoly(canvas, hex, Scalar(255, 120, 60), LINE_AA);

    arrowedLine(canvas, Point(60, 340), Point(250, 250), Scalar(255, 255, 255), 2, LINE_AA, 0, 0.18);
    drawMarker(canvas, Point(400, 300), Scalar(0, 0, 255), MARKER_CROSS, 26, 2);
    drawMarker(canvas, Point(460, 300), Scalar(0, 255, 0), MARKER_DIAMOND, 26, 2);
    imshow("polygons", canvas);
    waitKey(0);
    return 0;
}`, points: ['꼭짓점 = <code>vector&lt;Point&gt;</code> (모두 (x, y))', '<code>polylines</code> 의 <code>isClosed=true</code> → 닫힌 도형', '<code>fillPoly</code>(오목 OK) vs <code>fillConvexPoly</code>(볼록 전용 · 빠름)', '<code>arrowedLine</code> 의 <code>tipLength</code> = 화살촉 비율'], notes: '<p>vector 의 vector 가 왜 필요한지 — 12차시 findContours 가 윤곽선 여러 개를 <code>vector&lt;vector&lt;Point&gt;&gt;</code> 로 돌려주기 때문이라고 미리 알려 줍니다. 학생 활동: 꼭짓점 좌표를 바꿔 자기 모양 만들기. (6분)</p>' },
          { layout: 'code', title: '예제 5: 격자 그리기 — 함수로 분리', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

void drawGrid(Mat& img, int step)
{
    Scalar thin(215, 215, 215), bold(150, 150, 150);
    for (int x = 0; x <= img.cols; x += step)
        line(img, Point(x, 0), Point(x, img.rows), x % (step * 5) == 0 ? bold : thin, 1);
    for (int y = 0; y <= img.rows; y += step)
        line(img, Point(0, y), Point(img.cols, y), y % (step * 5) == 0 ? bold : thin, 1);
}

int main()
{
    Mat canvas(480, 640, CV_8UC3, Scalar(250, 250, 250));
    drawGrid(canvas, 40);
    cout << "세로선 " << canvas.cols / 40 + 1 << "개" << endl;
    imshow("grid", canvas);
    waitKey(0);
    return 0;
}`, points: ['반복되는 그리기는 <b>함수로</b> — 어느 이미지에나 재사용', '<code>Mat&amp;</code> 로 받아 "이미지를 바꾸는 함수" 임을 드러낸다', '<code>step * 5</code> 마다 굵은 선 → 좌표 읽기 쉽게', '<code>img.cols</code> · <code>img.rows</code> 를 쓰면 크기에 상관없이 동작'], notes: '<p>"그리기 코드를 main 에 다 넣으면 금방 지저분해진다" 를 체감시키는 슬라이드입니다. 💬 "<code>Mat&amp;</code> 대신 <code>Mat img</code> 로 받으면 그림이 사라질까?" — 사라지지 않는다. Mat 은 헤더만 복사되고 픽셀은 공유(03차시). 그래도 의도를 드러내려고 참조로 받는다. 💬 "step 을 20 으로 바꾸면 세로선이 몇 개?" — 33개. (5분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>circle(img, Point(100, 50), 30, Scalar(0, 0, 255), FILLED)</code> 에서 <code>FILLED</code> 의 뜻은?', options: ['선을 지운다', '안을 채운다', '두께 1로 그린다', '오류'], answer: 1, explain: '두께 FILLED(= −1) = <b>안을 채우기</b>. rectangle · ellipse 도 같습니다.', notes: '<p>정답 2번. 이어서 구두 퀴즈: "<code>Scalar(255, 0, 0)</code> 은?" — 파랑(BGR). (2분)</p>' },
          { layout: 'practice', title: '실습: 과녁(동심원) 그리기', desc: '<p>400×400 캔버스에 중심 (200, 200) 의 과녁을 그리세요.</p><ul><li>반지름 180 → 20, 20 씩 줄이며 <b>채운 원</b>(FILLED)</li><li>색은 빨강 · 흰색 번갈아 (큰 원부터!)</li><li>중심에 <code>drawMarker</code> 검정 십자 (크기 40, 두께 2)</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat canvas(400, 400, CV_8UC3, Scalar(240, 240, 240));
    int n = 0;
    for (int r = 180; r >= 20; r -= 20)
    {
        // TODO: 짝/홀로 색을 바꿔 채운 원 그리기
    }
    // TODO: 중심에 검정 십자 마커
    cout << "원 개수: " << n << endl;
    imshow("target", canvas);
    waitKey(0);
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat canvas(400, 400, CV_8UC3, Scalar(240, 240, 240));
    int n = 0;
    for (int r = 180; r >= 20; r -= 20)
    {
        Scalar col = (n % 2 == 0) ? Scalar(0, 0, 255) : Scalar(255, 255, 255);
        circle(canvas, Point(200, 200), r, col, FILLED);
        n++;
    }
    drawMarker(canvas, Point(200, 200), Scalar(0, 0, 0), MARKER_CROSS, 40, 2);
    cout << "원 개수: " << n << endl;
    imshow("target", canvas);
    waitKey(0);
    return 0;
}`, notes: '<p>정답: 원 9개 (가장 바깥 · 가장 안쪽 모두 빨강, 중심 픽셀은 마지막에 그린 검정 십자 색). 흔한 실수: 작은 원부터 그려서 큰 원이 덮어 버리는 것 — "나중에 그린 것이 위" 규칙을 확인시킵니다. 빨리 끝난 학생은 실습 2(부품 위치 표시 함수)로. (8분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['그리기 함수의 위치 인수는 모두 <b>(x, y)</b> · 색은 <b>Scalar(B, G, R)</b> · 두께 <b>FILLED(−1) = 채우기</b>', 'line · rectangle(Rect/두 점) · circle · ellipse(반지름 Size / RotatedRect 는 지름)', 'polylines · fillPoly(<code>vector&lt;vector&lt;Point&gt;&gt;</code>) · fillConvexPoly(볼록 전용) · arrowedLine · drawMarker', '보여 줄 그림은 <code>LINE_AA</code>, 계산용 마스크는 기본값', '반복 도형은 <b>반복문 + 함수</b>로 정리 (<code>void drawGrid(Mat&amp; img, int step)</code>)', '다음 교시: 글자 넣기 — putText 와 getTextSize 로 라벨 상자 만들기'], notes: '<p>세 규칙(좌표 (x,y) · BGR · FILLED 채우기)을 학생들이 소리 내어 말하게 합니다. 다음 교시 예고: "부품에 번호를 붙이려면 글자가 필요하다". (2분)</p>' }
        ]
      },

      // ================================================================ 2교시
      {
        id: 'cv04-2', title: '텍스트와 라벨: putText · getTextSize', minutes: 50,
        goals: ['putText 의 기준점(글자 왼쪽 아래)과 Hershey 폰트 · fontScale · 두께를 이해한다', 'getTextSize 로 글자 크기를 재어 배경 상자가 있는 라벨과 오버레이 패널을 만들 수 있다', 'putText 로 한글이 안 되는 이유와 대안(freetype 모듈 · GUI)을 안다', 'coins_parts.png 의 부품 12개에 번호 · 크기 라벨을 붙여 저장할 수 있다'],
        flow: [['도입: putText 기준점', 8], ['폰트 · 크기 · getTextSize', 14], ['라벨 상자 · 오버레이 패널', 18], ['미니 프로젝트 · 정리', 10]],
        content: [
          { type: 'h', text: 'putText: 기준점은 글자의 왼쪽 아래' },
          { type: 'p', html: '<code>putText(img, text, org, fontFace, fontScale, color, thickness, lineType)</code> — 여기서 <code>org</code>(origin)는 글자의 <b>왼쪽 아래</b>, 정확히는 <b>기준선(baseline)의 왼쪽 끝</b>입니다. 사각형처럼 왼쪽 <u>위</u>가 아니므로, <code>Point(10, 10)</code> 에 글자를 쓰면 글자가 위쪽 밖으로 잘려 거의 보이지 않습니다. 이것이 putText 의 첫 번째 함정입니다. <code>text</code> 는 <code>std::string</code> 이므로 <code>"t=" + to_string(n)</code> 이나 <code>format("%.2f", v)</code> 로 만든 문자열을 그대로 넘길 수 있습니다.' },
          { type: 'figure', html: FIG_TEXT, caption: '그림 3. org = 기준선의 왼쪽 끝. getTextSize 는 폭 · 높이(Size)와 baseLine(기준선 아래 여유, 포인터로 받음)을 알려 준다' },
          { type: 'table', head: ['HersheyFonts', '특징', '어울리는 곳'], rows: [
            ['<code>FONT_HERSHEY_SIMPLEX</code>', '가장 기본 · 얇은 산세리프 (가장 많이 씀)', '라벨 · 측정값'],
            ['<code>FONT_HERSHEY_PLAIN</code>', '아주 작고 단순 (같은 scale 에서 제일 작다)', '좁은 곳 · 눈금 숫자'],
            ['<code>FONT_HERSHEY_DUPLEX</code>', 'SIMPLEX 의 두 줄 버전 — 조금 굵어 보임', '제목'],
            ['<code>FONT_HERSHEY_COMPLEX</code>', '세리프(장식) 있는 글꼴', '보고서용 캡션'],
            ['<code>FONT_HERSHEY_TRIPLEX</code>', '가장 굵고 또렷 (폭이 넓다)', '큰 판정 표시 (OK / NG)'],
            ['<code>FONT_HERSHEY_COMPLEX_SMALL</code>', 'COMPLEX 의 작은 버전', '좁은 곳'],
            ['<code>FONT_HERSHEY_SCRIPT_SIMPLEX</code> · <code>_SCRIPT_COMPLEX</code>', '필기체', '장식용 (검사 화면에는 비추천)'],
            ['<code>| FONT_ITALIC</code>', '어떤 글꼴에든 <code>|</code> 로 더하면 이탤릭', '강조']
          ], caption: '표 2. 내장 Hershey 벡터 폰트 8종 — Python 의 cv2.FONT_HERSHEY_* 와 같은 이름' },
          { type: 'code', title: '예제 1: 폰트 8종 비교 (+ 크기 측정)', code: EX2_FONTS,
            desc: '같은 <code>fontScale=0.9</code>, 같은 글자인데도 폰트마다 <b>폭과 높이가 다릅니다</b>. <code>FONT_HERSHEY_PLAIN</code> 이 가장 작습니다 — 그래서 "몇 픽셀 자리를 차지할지"는 항상 <code>getTextSize</code> 로 물어봐야 합니다. C++ 에서는 <code>baseLine</code> 을 <b>포인터</b>(<code>&amp;baseLine</code>)로 넘겨 받습니다(필요 없으면 <code>nullptr</code>). 결과 창에서 필기체(SCRIPT)가 검사 화면에 왜 안 어울리는지도 눈으로 확인하세요.' },
          { type: 'callout', kind: 'warn', title: '브라우저의 getTextSize 는 근사값', html: '이 사이트의 실행 환경은 <code>getTextSize</code> 를 브라우저 글꼴로 <b>근사 계산</b>합니다. 그래서 출력되는 폭 · 높이 · baseLine 이 Visual Studio(실제 OpenCV)의 값과 <b>몇 픽셀 다를 수 있습니다</b> (예: 실제 OpenCV 에서 SIMPLEX 0.9 의 "OK 12.34 mm" 는 폭 199 · 높이 19 · baseLine 2). 라벨 상자를 만드는 <b>방법</b>은 같으니, 정확한 픽셀 값은 로컬에서 확인하세요.' },
          { type: 'h', text: 'fontScale · 두께 · getTextSize' },
          { type: 'code', title: '예제 2: fontScale 을 키우며 글자 상자 그리기', code: EX2_SCALE,
            desc: '<code>fontScale</code> 은 <b>배율</b>입니다(1.0 이 기본 크기, 0.5 는 절반). <code>thickness</code> 는 획의 굵기로, 크게 쓸 때는 2~3 이 읽기 좋습니다. 회색 사각형이 <code>getTextSize</code> 로 계산한 <b>글자 상자</b>(높이 = <code>height + baseLine</code>)이고 주황 선이 <b>기준선</b>입니다 — 글자가 상자 안에 들어가는지 확인하세요. 출력을 보면 scale 이 2배가 되면 폭 · 높이도 대략 2배가 됩니다.' },
          { type: 'callout', kind: 'warn', title: '한글은 그려지지 않는다', html: 'OpenCV 는 <b>Hershey 벡터 폰트</b>(영문 대소문자 · 숫자 · 기본 기호)만 내장합니다. <code>putText(img, "양품", …)</code> 을 하면 한글 자리에 <b>물음표나 이상한 기호</b>가 나옵니다(오류는 나지 않습니다). 그래서 이미지에 새기는 글자는 <b>영문 · 숫자로</b> 씁니다: <code>"OK"</code>, <code>"NG"</code>, <code>"AREA 12.34 mm2"</code>, <code>"LOT A2309-117"</code>. 한글이 꼭 필요하면 ① opencv_contrib 의 <b><code>freetype</code> 모듈</b>(TTF 글꼴로 그리기, 아래 예제) ② MFC · Qt 같은 <b>GUI 프레임워크의 글자 출력</b>을 이미지 창 위에 겹치기 ③ 한글 안내는 <code>cout</code> · 로그 파일로 — 중에서 고릅니다.' },
          { type: 'h', text: '핵심 기법: getTextSize 로 배경 상자 만들기' },
          { type: 'p', html: '사진 위에 그냥 글자를 쓰면 배경이 밝은 곳에서는 흰 글자가, 어두운 곳에서는 검은 글자가 사라집니다. 해결책은 <b>글자 크기를 미리 재서 채운 상자를 깔고 그 위에 글자를 얹기</b>입니다. 이것이 검사 장비 화면에서 가장 많이 쓰이는 표현이고, <code>getTextSize</code> 가 바로 그 목적의 함수입니다.' },
          { type: 'figure', html: FIG_LABEL, caption: '그림 4. ① getTextSize 로 재고 ② 채운 상자를 그리고 ③ 글자를 얹는다 — 순서를 바꾸면 글자가 상자에 덮힌다' },
          { type: 'code', title: '예제 3: 라벨 상자 함수 drawLabel', code: EX2_LABEL,
            desc: '<code>getTextSize(text, font, scale, thickness, &amp;baseLine)</code> 이 <code>Size</code>(폭 · 높이)를 돌려주고 <code>baseLine</code> 을 포인터로 알려 줍니다. 여기에 여백(<code>pad</code>)을 더해 <code>Rect</code> 를 만들고 <b><code>FILLED</code> 로 채운 뒤</b> 글자를 얹습니다. 글자의 기준점은 <b>상자의 왼쪽 아래에서 pad 만큼 위</b>(<code>box.y + box.height - pad</code>)입니다. C++ 의 <code>Rect</code> 는 <code>cout</code> 으로 <code>[너비 x 높이 from (x, y)]</code> 형식으로 출력됩니다. 이 함수 하나를 만들어 두면 이후 모든 차시에서 재사용할 수 있습니다. (출력 숫자는 브라우저에서 근사값)' },
          { type: 'h', text: '결과 오버레이 패널' },
          { type: 'code', title: '예제 4: 측정값 오버레이 패널 (반투명 배경 + OK/NG)', code: EX2_PANEL,
            desc: '실제 검사 화면처럼 왼쪽 위에 <b>측정값 패널</b>을 올립니다. <code>dim</code> 함수는 패널 자리의 <b>ROI(<code>img(r)</code>)</b>를 잘라(03차시) 어두운 Mat 과 <code>addWeighted(roi, 0.30, dark, 0.70, 0, roi)</code> 로 섞어 <b>반투명 효과</b>를 냅니다 — ROI 가 원본 메모리를 가리키고 출력 크기 · 형식이 같아 새로 할당되지 않으므로 결과가 바로 이미지에 반영됩니다. 판정 줄만 색을 바꿔(OK = 초록, NG = 빨강) 한눈에 보이게 했습니다. <code>format</code> 에서 <code>%</code> 기호 자체는 <code>%%</code> 로 씁니다.',
            expect: '' },
          { type: 'callout', kind: 'tip', title: '글자가 배경에 묻힐 때 쓰는 세 가지', html: '<ul><li><b>배경 상자</b>: getTextSize + <code>rectangle(..., FILLED)</code> (예제 3)</li><li><b>반투명 패널</b>: ROI + <code>addWeighted</code> (예제 4)</li><li><b>외곽선 글자</b>: 같은 글자를 <b>두꺼운 검정</b>(thickness 4~5)으로 먼저 쓰고, 그 위에 <b>얇은 흰색</b>(thickness 1~2)을 덧쓰면 어떤 배경에서도 읽힙니다.</li></ul>' },
          { type: 'h', text: '미니 프로젝트: 부품 12개에 번호 라벨 붙이기' },
          { type: 'image', src: 'images/coins_parts.png', caption: 'images/coins_parts.png — 어두운 배경 위 밝은 원형 부품 12개 (지름 3종: r=34 ×3, r=27 ×4, r=20 ×5)' },
          { type: 'code', title: '예제 5: coins_parts.png 에 번호 · 크기 라벨 붙여 저장', code: EX2_MINI,
            desc: '부품을 <b>찾는</b> 방법(HoughCircles · 윤곽선)은 12~13차시에서 배우므로, 지금은 <code>assets/IMAGES.md</code> 에 적힌 <b>정답 좌표 · 반지름을 vector 에 직접 넣어</b> 그립니다. 반지름으로 L · M · S 를 나누고, 크기마다 다른 색으로 원 · 십자 · 라벨을 그린 뒤 <code>imwrite</code> 로 저장합니다 (📁 작업 폴더에서 내려받아 보세요). 배율 0.1 mm/px 를 곱해 지름을 mm 로 표시하는 것까지가 실제 검사 화면의 모습입니다. <code>c.size()</code> 는 <code>size_t</code> 이므로 반복 변수도 <code>size_t</code> 로 썼습니다.',
            expect: '' },
          { type: 'h', text: '한글이 꼭 필요할 때 (로컬 전용)' },
          { type: 'code', title: '추가: freetype 모듈로 한글 그리기', code: EX2_FREETYPE, run: false, local: true, file: 'main.cpp',
            desc: 'opencv_contrib 의 <code>freetype</code> 모듈은 TTF 글꼴 파일로 글자를 그립니다. 공식 Windows 설치 패키지(<code>opencv-5.0.0-windows.exe</code>)에는 <b>들어 있지 않아</b> CMake 로 contrib 를 포함해 직접 빌드해야 하고 FreeType · HarfBuzz 라이브러리도 필요합니다. 그래서 실무에서는 이미지에는 영문 · 숫자만 새기고, 한글 안내는 GUI(MFC · Qt)나 로그로 보여 주는 경우가 대부분입니다.' },
          { type: 'callout', kind: 'vs', title: 'Visual Studio 에서는 — 역할 나누기', html: '검사 결과를 <b>저장할 이미지</b>에는 OpenCV 로 도형 · 영문 · 숫자를 새기고(<code>imwrite</code>), 작업자에게 보여 줄 <b>한글 안내 · 버튼 · 표</b>는 GUI 프레임워크(MFC · Qt · Win32)로 이미지 창 옆이나 위에 표시하는 것이 실무의 정석입니다. 16차시에서 클래스로 설계하는 검사 도구에서 <code>drawLabel</code> 같은 그리기 함수를 <b>Overlay 클래스</b>로 묶어 재사용합니다.' },
          { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 · 오개념 지도 · 평가', html: '<ul><li><b>putText 기준점</b>: 수업 시작에 <code>Point(10, 10)</code> 으로 글자를 써서 <b>잘려 보이지 않는 화면</b>을 먼저 보여 주고 "왜 안 보일까?" 를 묻습니다. 기억에 아주 잘 남습니다.</li><li><b>반지름 vs 지름</b>(1교시 ellipse) 과 <b>Size(w, h) vs Rect(x, y, w, h)</b> 혼동이 가장 흔합니다.</li><li><b>getTextSize 의 baseLine</b>: C++ 에서는 <code>int*</code> 로 받으므로 <code>&amp;baseLine</code> 을 빼먹거나 초기화하지 않는 실수가 많습니다.</li><li><b>브라우저 근사값</b>: 브라우저의 getTextSize 값은 실제 OpenCV 와 몇 픽셀 다릅니다. 학생 결과가 교사 PC(Visual Studio)와 다르다고 당황하지 않게 미리 알려 주세요.</li><li><b>한글</b>: 학생들이 반드시 "양품" 을 써 보려 합니다. 미리 한 번 시연해 물음표가 나오는 것을 보여 주고 대안을 안내하세요.</li><li>평가 루브릭: ① 원하는 위치에 도형을 그린다 (3) ② getTextSize 로 배경 상자 라벨을 만든다 (4) ③ 그리기 코드를 함수로 분리했다 (2) ④ 색 · 두께로 OK/NG 를 구분했다 (1).</li><li>과제: 미니 프로젝트(예제 5)의 라벨에 <b>번호를 원 안쪽</b>에 넣도록 바꾸고, L/M/S 개수를 오버레이 패널로 함께 표시해 오기.</li></ul>' }
        ],
        practice: [
          {
            title: '라벨 상자로 부품 이름표 붙이기', level: 1,
            desc: '<code>images/washers.png</code> 를 3채널로 바꾼 뒤, <b>배경 상자가 있는 라벨</b>을 붙이는 <code>drawLabel</code> 함수를 완성해 세 부품에 이름표를 붙이세요: W1 노랑 · N2 초록 · B3 빨강. 라벨의 기준 위치(상자 왼쪽 아래)는 W1 (50, 40) · N2 (300, 190) · B3 (360, 350) 입니다. 확인용으로 각 상자의 <b>왼쪽 아래 안쪽</b> 픽셀 <code>(p.y - 3, p.x + 2)</code> 가 배경색으로 칠해졌는지 출력하세요.',
            hint: '① <code>int bl = 0; Size s = getTextSize(text, font, 0.5, 1, &amp;bl);</code> ② <code>Rect box(p.x, p.y - s.height - 8, s.width + 8, s.height + 8);</code> ③ <code>rectangle(img, box, color, FILLED);</code> ④ <code>putText(img, text, Point(box.x + 4, box.y + box.height - 4), font, 0.5, Scalar(20, 20, 20), 1, LINE_AA);</code>',
            expect: '',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

void drawLabel(Mat& img, Point p, const string& text, const Scalar& color)
{
    int font = FONT_HERSHEY_SIMPLEX, bl = 0;
    Size s = getTextSize(text, font, 0.5, 1, &bl);
    // TODO: 배경 상자(FILLED)를 그린 뒤 글자를 얹으세요

    cout << "'" << text << "' 상자 안쪽 = " << img.at<Vec3b>(p.y - 3, p.x + 2) << endl;
}

int main()
{
    Mat gray = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat view;
    cvtColor(gray, view, COLOR_GRAY2BGR);

    drawLabel(view, Point(50, 40), "W1 washer", Scalar(0, 255, 255));
    // TODO: N2 (300, 190) 초록 "N2 nut", B3 (360, 350) 빨강 "B3 bolt" 라벨도 붙이세요

    imshow("named", view);
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

void drawLabel(Mat& img, Point p, const string& text, const Scalar& color)
{
    int font = FONT_HERSHEY_SIMPLEX, bl = 0;
    Size s = getTextSize(text, font, 0.5, 1, &bl);
    Rect box(p.x, p.y - s.height - 8, s.width + 8, s.height + 8);
    rectangle(img, box, color, FILLED);
    rectangle(img, box, Scalar(30, 30, 30), 1);
    putText(img, text, Point(box.x + 4, box.y + box.height - 4), font, 0.5,
            Scalar(20, 20, 20), 1, LINE_AA);

    cout << "'" << text << "' 상자 안쪽 = " << img.at<Vec3b>(p.y - 3, p.x + 2) << endl;
}

int main()
{
    Mat gray = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat view;
    cvtColor(gray, view, COLOR_GRAY2BGR);

    drawLabel(view, Point(50, 40), "W1 washer", Scalar(0, 255, 255));
    drawLabel(view, Point(300, 190), "N2 nut", Scalar(0, 255, 0));
    drawLabel(view, Point(360, 350), "B3 bolt", Scalar(0, 0, 255));

    imshow("named", view);
    waitKey(0);
    return 0;
}`
          },
          {
            title: '오른쪽 아래에 정렬된 검사 결과 쓰기', level: 2,
            desc: '<code>images/coins_parts.png</code> 를 3채널로 바꾼 뒤 <b>오른쪽 아래 모서리에 오른쪽 정렬</b>로 두 줄을 쓰세요: <code>"PARTS 12"</code> 와 <code>"JUDGE OK"</code>. 오른쪽 정렬은 <code>getTextSize</code> 로 폭을 재서 <code>x = img.cols - s.width - 12</code> 로 계산합니다. 두 번째 줄은 초록색, 폰트는 <code>FONT_HERSHEY_SIMPLEX</code> · scale 0.8 · 두께 2 로 하고, 확인용으로 각 줄의 <b>오른쪽 끝</b>(<code>x + s.width</code>)을 출력하세요 — 두 줄 모두 <code>640 − 12 = 628</code> 이면 정렬 성공입니다.',
            hint: '아래 줄부터 y 를 정하면 편합니다: 아래 줄 기준선 y = <code>img.rows - 16</code>, 위 줄은 그보다 <code>s.height + 14</code> 만큼 위. 글자가 잘 보이도록 두꺼운 검정(두께 5)으로 먼저 쓰고 그 위에 색 글자를 덧써도 좋습니다.',
            expect: '',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    Mat view;
    cvtColor(gray, view, COLOR_GRAY2BGR);

    int font = FONT_HERSHEY_SIMPLEX;
    string line1 = "PARTS 12", line2 = "JUDGE OK";

    // TODO: line2 의 크기를 재서 오른쪽 아래(여백 12)에 초록으로 쓰고 오른쪽 끝을 출력하세요
    // TODO: line1 은 그 위쪽에 흰색으로 오른쪽 정렬해 쓰고 오른쪽 끝을 출력하세요

    imshow("result", view);
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    Mat view;
    cvtColor(gray, view, COLOR_GRAY2BGR);

    int font = FONT_HERSHEY_SIMPLEX;
    string line1 = "PARTS 12", line2 = "JUDGE OK";

    int bl2 = 0;
    Size s2 = getTextSize(line2, font, 0.8, 2, &bl2);
    int x2 = view.cols - s2.width - 12, y2 = view.rows - 16;
    putText(view, line2, Point(x2, y2), font, 0.8, Scalar(0, 0, 0), 5, LINE_AA);        // 외곽선
    putText(view, line2, Point(x2, y2), font, 0.8, Scalar(80, 255, 80), 2, LINE_AA);
    cout << "'" << line2 << "' 오른쪽 끝 = " << x2 + s2.width << endl;

    int bl1 = 0;
    Size s1 = getTextSize(line1, font, 0.8, 2, &bl1);
    int x1 = view.cols - s1.width - 12, y1 = y2 - s2.height - 14;
    putText(view, line1, Point(x1, y1), font, 0.8, Scalar(0, 0, 0), 5, LINE_AA);
    putText(view, line1, Point(x1, y1), font, 0.8, Scalar(255, 255, 255), 2, LINE_AA);
    cout << "'" << line1 << "' 오른쪽 끝 = " << x1 + s1.width << endl;

    imshow("result", view);
    waitKey(0);
    return 0;
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: '그리기와 텍스트', subtitle: '2교시 — 텍스트와 라벨: putText · getTextSize', notes: '<p>시작하자마자 <code>putText(img, "HELLO", Point(10, 10), …)</code> 를 실행해 <b>글자가 거의 보이지 않는 화면</b>을 보여 주고 💬 "글자가 어디로 갔을까요?" 를 묻습니다. 답: 기준점이 왼쪽 아래여서 위로 잘렸다. (4분)</p>' },
          { layout: 'diagram', title: 'putText 의 기준점과 getTextSize', html: FIG_TEXT, caption: 'org = 기준선(baseline)의 왼쪽 끝 · getTextSize → 폭 · 높이 + baseLine(포인터)', notes: '<p>그림에서 org 점의 위치를 손으로 짚습니다. 글자를 완전히 감싸는 상자의 높이가 <code>height + baseLine</code> 인 이유(g, y, p 의 꼬리)를 설명합니다. C++ 에서는 baseLine 을 <code>int*</code> 로 받는다는 점(<code>&amp;baseLine</code>)을 강조합니다. 💬 "글자를 위쪽 가장자리에 붙여 쓰려면 y 를 얼마로 해야 할까?" — 최소 height 만큼(약 20~30). (6분)</p>' },
          { layout: 'table', title: '내장 폰트 HersheyFonts', head: ['폰트', '특징', '쓰는 곳'], rows: [
            ['<code>FONT_HERSHEY_SIMPLEX</code>', '기본 · 얇은 산세리프', '라벨 · 측정값 (거의 항상 이것)'],
            ['<code>FONT_HERSHEY_PLAIN</code>', '가장 작고 단순', '눈금 숫자 · 좁은 곳'],
            ['<code>FONT_HERSHEY_DUPLEX</code>', '조금 굵음', '제목'],
            ['<code>FONT_HERSHEY_TRIPLEX</code>', '가장 굵고 또렷', 'OK / NG 큰 표시'],
            ['<code>FONT_HERSHEY_COMPLEX(_SMALL)</code>', '세리프', '캡션'],
            ['<code>FONT_HERSHEY_SCRIPT_…</code>', '필기체', '장식 (검사 화면 비추천)'],
            ['<code>… | FONT_ITALIC</code>', '이탤릭 추가', '강조']
          ], lead: 'Python 의 cv2.FONT_HERSHEY_* 와 같은 이름 — 한글은 없다!', notes: '<p>예제 1 을 실행해 8종을 함께 봅니다. 같은 scale 인데 폭 · 높이가 다르다는 점 → "자리 계산은 getTextSize 로" 로 이어집니다. 마지막 줄의 "한글은 없다" 를 강조하고 뒤에서 다룬다고 예고. (4분)</p>' },
          { layout: 'code', title: '예제 1: 폰트별 크기 재기', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat canvas(300, 640, CV_8UC3, Scalar(250, 250, 250));
    int fonts[] = { FONT_HERSHEY_SIMPLEX, FONT_HERSHEY_PLAIN,
                    FONT_HERSHEY_TRIPLEX, FONT_HERSHEY_COMPLEX };
    string names[] = { "SIMPLEX", "PLAIN", "TRIPLEX", "COMPLEX" };
    for (int i = 0; i < 4; i++)
    {
        string t = "OK 12.34 mm";
        putText(canvas, t + "  " + names[i], Point(20, 50 + i * 60), fonts[i],
                0.9, Scalar(40, 40, 40), 1, LINE_AA);
        int baseLine = 0;
        Size s = getTextSize(t, fonts[i], 0.9, 1, &baseLine);
        cout << names[i] << " 폭=" << s.width << " 높이=" << s.height << " baseLine=" << baseLine << endl;
    }
    imshow("fonts", canvas);
    waitKey(0);
    return 0;
}`, points: ['같은 scale 이라도 폰트마다 폭 · 높이가 다르다', '<code>int baseLine = 0;</code> → <code>&amp;baseLine</code> 으로 넘긴다', '검사 화면은 <code>FONT_HERSHEY_SIMPLEX</code> 가 기본', '브라우저의 getTextSize 값은 <b>근사값</b> (실제와 몇 px 차이)'], notes: '<p>출력을 함께 읽으며 PLAIN 이 가장 작은 것을 확인합니다. 브라우저의 숫자는 근사값이고 Visual Studio 에서는 조금 다르게 나온다는 점을 미리 알려 줍니다(실제 SIMPLEX 0.9: 199×19, baseLine 2). 💬 "글자를 화면 폭에 맞추려면?" — getTextSize 로 재서 scale 을 조절하거나 줄을 나눈다. (5분)</p>' },
          { layout: 'code', title: '예제 2: fontScale 과 글자 상자', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat canvas(320, 640, CV_8UC3, Scalar(250, 250, 250));
    string text = "OK 12.34";
    int y = 54, f = FONT_HERSHEY_SIMPLEX;
    for (double sc : { 0.5, 0.8, 1.2, 1.8 })
    {
        int bl = 0;
        Size s = getTextSize(text, f, sc, 2, &bl);
        rectangle(canvas, Rect(40, y - s.height, s.width, s.height + bl), Scalar(190, 190, 190), 1);
        line(canvas, Point(40, y), Point(40 + s.width, y), Scalar(255, 160, 0), 1);   // 기준선
        putText(canvas, text, Point(40, y), f, sc, Scalar(30, 30, 30), 2, LINE_AA);
        cout << format("scale=%.1f 폭 %d 높이 %d baseLine %d", sc, s.width, s.height, bl) << endl;
        y += s.height + bl + 22;
    }
    imshow("fontScale", canvas);
    waitKey(0);
    return 0;
}`, points: ['<code>fontScale</code> = 배율 (1.0 이 기본)', '상자 높이 = <code>height + baseLine</code>', '크게 쓸 때는 <code>thickness</code> 2~3', 'scale 2배 → 폭 · 높이도 대략 2배'], notes: '<p>화면에서 글자가 회색 상자 안에 들어가는지 확인합니다. 주황 기준선이 org 의 y 라는 것을 짚습니다. 범위 기반 for 에 <code>{ 0.5, 0.8, … }</code> 초기화 목록을 바로 쓸 수 있다는 C++ 문법도 짚어 줍니다. 학생 활동: scale 3.0 을 넣어 보고 글자가 잘리는지 보기(캔버스 크기 문제). (5분)</p>' },
          { layout: 'diagram', title: '라벨 상자 만드는 3단계', html: FIG_LABEL, caption: '① getTextSize 로 재기 → ② 채운 상자 그리기 → ③ 글자 얹기', notes: '<p>순서가 중요합니다 — 글자를 먼저 쓰면 상자가 글자를 덮습니다. 💬 "왜 배경 상자가 필요할까?" — 밝은 배경에서 흰 글자가, 어두운 배경에서 검은 글자가 사라진다. 실제 검사 장비 화면을 떠올리게 합니다. (5분)</p>' },
          { layout: 'code', title: '예제 3: drawLabel — 배경 상자가 있는 라벨', code: `#include <opencv2/opencv.hpp>
using namespace cv;
using namespace std;

void drawLabel(Mat& img, Point anchor, const string& text, const Scalar& color)
{
    int font = FONT_HERSHEY_SIMPLEX, pad = 4, baseLine = 0;
    Size s = getTextSize(text, font, 0.5, 1, &baseLine);
    Rect box(anchor.x, anchor.y - s.height - 2 * pad, s.width + 2 * pad, s.height + 2 * pad);
    rectangle(img, box, color, FILLED);                                     // ① 채운 상자
    putText(img, text, Point(box.x + pad, box.y + box.height - pad), font, 0.5,
            Scalar(20, 20, 20), 1, LINE_AA);                               // ② 글자
}

int main()
{
    Mat gray = imread("images/coins_parts.png", IMREAD_GRAYSCALE), view;
    cvtColor(gray, view, COLOR_GRAY2BGR);
    drawLabel(view, Point(86, 128), "L  D6.8", Scalar(60, 180, 255));
    drawLabel(view, Point(387, 200), "M  D5.4", Scalar(90, 220, 90));
    imshow("labels", view);
    waitKey(0);
    return 0;
}`, points: ['크기 재기 → 상자(FILLED) → 글자 순서', 'org = <code>box.y + box.height - pad</code> (상자 왼쪽 아래)', '배경색과 <b>대비되는</b> 글자색', '한 번 만들어 두면 모든 차시에서 재사용'], notes: '<p>이 차시의 핵심 코드입니다. 학생들이 그대로 따라 쓰고 pad · scale 을 바꿔 보게 합니다. <code>const string&amp;</code> · <code>const Scalar&amp;</code> 로 받는 이유(복사 없이 읽기 전용) 도 짚어 줍니다. 💬 "글자색을 흰색으로 바꾸면?" — 밝은 상자에서 안 보인다 → 상자색에 맞춰 글자색을 고르는 습관. (6분)</p>' },
          { layout: 'two', title: '한글은 어떻게?', left: { title: '❌ OpenCV putText', bullets: ['Hershey <b>벡터 폰트</b>만 내장 (영문 · 숫자 · 기호)', '<code>putText(img, "양품", …)</code> → 물음표 · 이상한 기호', '오류는 안 나므로 놓치기 쉽다', '이미지에 새길 글자는 <b>영문 · 숫자</b>로: <code>OK</code>, <code>NG</code>, <code>AREA 12.34</code>'] }, right: { title: '✅ 대안', bullets: ['opencv_contrib <code>freetype</code> 모듈 — TTF 글꼴로 그리기 (직접 빌드 필요)', 'MFC · Qt 등 <b>GUI 의 글자 출력</b>을 이미지 창에 겹치기', '한글 안내는 <code>cout</code> · 로그 파일로', '역할 분담: 저장 이미지 = 영문 · 숫자, 화면 안내 = GUI'] }, notes: '<p>실제로 "양품" 을 putText 해 보여 주는 것이 가장 효과적입니다. 역할 분담을 정리: <b>저장할 이미지에 새기는 영문 · 숫자 = OpenCV, 화면용 한글 = GUI</b>. freetype 모듈은 공식 설치 패키지에 없어 직접 빌드해야 한다는 점도 알려 줍니다. (5분)</p>' },
          { layout: 'code', title: '예제 4: 결과 오버레이 패널', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/washers.png", IMREAD_GRAYSCALE), view, bin;
    cvtColor(gray, view, COLOR_GRAY2BGR);
    double th = threshold(gray, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    double ratio = 100.0 * countNonZero(bin) / bin.total();

    Rect panel(12, 12, 250, 82);
    Mat roi = view(panel);                                   // 원본을 가리키는 창
    Mat dark(roi.size(), CV_8UC3, Scalar(15, 15, 15));
    addWeighted(roi, 0.30, dark, 0.70, 0, roi);              // 반투명 배경
    rectangle(view, panel, Scalar(200, 200, 200), 1);
    Scalar white(255, 255, 255);
    putText(view, format("OTSU TH : %.0f", th), Point(22, 40), FONT_HERSHEY_SIMPLEX, 0.5, white, 1);
    putText(view, format("AREA    : %.2f %%", ratio), Point(22, 62), FONT_HERSHEY_SIMPLEX, 0.5, white, 1);
    putText(view, "JUDGE   : OK", Point(22, 84), FONT_HERSHEY_SIMPLEX, 0.5, Scalar(0, 255, 0), 1);
    imshow("panel", view);
    waitKey(0);
    return 0;
}`, points: ['ROI + <code>addWeighted</code> = 반투명 패널', 'ROI 는 원본 메모리 → 결과가 바로 반영 (3차시)', '판정 줄만 색을 바꿔 한눈에 (OK 초록 / NG 빨강)', '측정값은 <code>format("%.2f", v)</code> 로 자릿수 고정'], notes: '<p>3차시 ROI 지식이 여기서 쓰입니다 — "ROI 에 addWeighted 를 하면 왜 원본이 바뀌는가?"를 복습 질문으로(출력 크기 · 형식이 같으면 새로 할당하지 않고 그 메모리에 쓴다). 결과: Otsu 125, 면적 15.13 %, OK. 실무 팁: 패널 위치 · 색 · 줄 간격을 상수로 빼 두면 유지보수가 쉽다. (5분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>putText(img, "OK", Point(100, 200), …)</code> 에서 (100, 200) 은 글자의 어디인가?', options: ['왼쪽 위', '왼쪽 아래(기준선)', '가운데', '오른쪽 아래'], answer: 1, explain: 'org 는 글자의 <b>왼쪽 아래</b>(기준선 위치). 그래서 y 가 작으면 글자가 위로 잘립니다.', notes: '<p>정답 2번. 수업 시작에 보여 준 "안 보이는 글자" 와 연결해 정리합니다. (2분)</p>' },
          { layout: 'practice', title: '미니 프로젝트: 부품 12개에 번호 라벨', desc: '<p><code>images/coins_parts.png</code> 에 <b>번호 · 크기 등급 · 지름(mm)</b> 라벨을 붙이세요. (검출은 12차시 — 좌표는 IMAGES.md 값을 vector 로)</p><ul><li>반지름 34 = L, 27 = M, 20 = S → 등급마다 다른 색 원 + 십자 + 라벨</li><li>지름 mm = <code>2 * r * 0.1</code></li><li><code>imwrite</code> 로 저장해 📁 작업 폴더에서 확인</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/coins_parts.png", IMREAD_GRAYSCALE), view;
    cvtColor(gray, view, COLOR_GRAY2BGR);
    vector<Point> c = { Point(120, 165), Point(279, 384), Point(549, 346), Point(56, 277),
                        Point(588, 165), Point(414, 230), Point(311, 166), Point(333, 288),
                        Point(341, 68), Point(210, 370), Point(194, 54), Point(481, 96) };
    vector<int> r = { 34, 34, 34, 27, 27, 27, 27, 20, 20, 20, 20, 20 };

    for (size_t i = 0; i < c.size(); i++)
    {
        // TODO: 등급(L/M/S)과 색을 정하고 원 · 십자 · 라벨을 그리세요
    }
    cout << "부품 " << c.size() << "개" << endl;
    imshow("labeled", view);
    waitKey(0);
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/coins_parts.png", IMREAD_GRAYSCALE), view;
    cvtColor(gray, view, COLOR_GRAY2BGR);
    vector<Point> c = { Point(120, 165), Point(279, 384), Point(549, 346), Point(56, 277),
                        Point(588, 165), Point(414, 230), Point(311, 166), Point(333, 288),
                        Point(341, 68), Point(210, 370), Point(194, 54), Point(481, 96) };
    vector<int> r = { 34, 34, 34, 27, 27, 27, 27, 20, 20, 20, 20, 20 };
    for (size_t i = 0; i < c.size(); i++)
    {
        string cls = r[i] >= 34 ? "L" : (r[i] >= 27 ? "M" : "S");
        Scalar col = r[i] >= 34 ? Scalar(60, 180, 255) : (r[i] >= 27 ? Scalar(90, 220, 90) : Scalar(255, 150, 70));
        circle(view, c[i], r[i], col, 2, LINE_AA);
        drawMarker(view, c[i], col, MARKER_CROSS, 12, 1);
        string tag = to_string(i + 1) + " " + cls + " " + format("%.1f", 2 * r[i] * 0.1);
        int bl = 0;
        Size s = getTextSize(tag, FONT_HERSHEY_SIMPLEX, 0.45, 1, &bl);
        Rect box(c[i].x - r[i], c[i].y - r[i] - 8 - s.height, s.width + 6, s.height + 6);
        rectangle(view, box, col, FILLED);
        putText(view, tag, Point(box.x + 3, box.y + box.height - 3), FONT_HERSHEY_SIMPLEX, 0.45, Scalar(20, 20, 20), 1, LINE_AA);
    }
    cout << "부품 " << c.size() << "개" << endl;
    imshow("labeled", view);
    waitKey(0);
    return 0;
}`, notes: '<p>학생들이 가장 재미있어 하는 과제입니다. 흔한 문제: 라벨이 이미지 위쪽 밖으로 나가 잘리는 것(OpenCV 가 알아서 잘라 줌) → y 를 조정하거나 원 아래에 붙이게 합니다. 완성한 이미지를 <code>imwrite</code> 로 저장해 📁 작업 폴더에서 내려받아 서로 비교하면 좋습니다. (12분)</p>' },
          { layout: 'summary', title: '정리 — 04차시 전체', bullets: ['도형: <code>line · rectangle · circle · ellipse · polylines · fillPoly · arrowedLine · drawMarker</code> — 위치는 (x, y), 색은 BGR, FILLED = 채우기', '<code>putText</code> 의 <code>org</code> 는 <b>글자의 왼쪽 아래</b> — 폰트는 <code>FONT_HERSHEY_SIMPLEX</code> 기본', '<b><code>getTextSize(text, font, scale, th, &amp;baseLine)</code> → 배경 상자 라벨</b>: 재기 → 채운 상자 → 글자 (재사용 함수로)', '반투명 패널 = ROI + <code>addWeighted</code>, 판정은 색으로 (OK 초록 / NG 빨강)', '<b>한글은 putText 로 안 된다</b> → freetype 모듈 · GUI · 로그', '다음 차시: 색 공간 — BGR · Gray · HSV 로 색으로 물체를 찾는다'], notes: '<p>오늘 만든 <code>drawLabel</code> 함수를 각자 코드 창고(헤더 파일)에 저장해 두라고 안내합니다(이후 차시에서 계속 씁니다). 과제: 미니 프로젝트에 L/M/S 개수 오버레이 패널 추가. (3분)</p>' }
        ]
      }
    ]
  });
})();
