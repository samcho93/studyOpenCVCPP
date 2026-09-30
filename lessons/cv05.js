/* 05차시 색 공간: BGR · Gray · HSV · 채널 */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 컬러 Mat 의 메모리 배치(B G R 인터리브)와 split / merge
  const FIG_CHANNELS = `<svg viewBox="0 0 740 320" role="img" aria-label="컬러 Mat 은 한 픽셀마다 B G R 세 바이트가 이어져 있고, split 으로 세 장의 1채널 영상으로 나눌 수 있다">
  ${ARROW('c05a1')}
  <text x="20" y="26" class="tx-b">컬러 Mat — CV_8UC3 (한 픽셀 = 3바이트, 순서는 B → G → R)</text>
  <rect x="20" y="40" width="42" height="40" rx="5" class="p1s"/><text x="41" y="65" text-anchor="middle" class="tx">B</text>
  <rect x="64" y="40" width="42" height="40" rx="5" class="p2s"/><text x="85" y="65" text-anchor="middle" class="tx">G</text>
  <rect x="108" y="40" width="42" height="40" rx="5" class="p3s"/><text x="129" y="65" text-anchor="middle" class="tx">R</text>
  <rect x="160" y="40" width="42" height="40" rx="5" class="p1s"/><text x="181" y="65" text-anchor="middle" class="tx">B</text>
  <rect x="204" y="40" width="42" height="40" rx="5" class="p2s"/><text x="225" y="65" text-anchor="middle" class="tx">G</text>
  <rect x="248" y="40" width="42" height="40" rx="5" class="p3s"/><text x="269" y="65" text-anchor="middle" class="tx">R</text>
  <rect x="300" y="40" width="42" height="40" rx="5" class="p1s"/><text x="321" y="65" text-anchor="middle" class="tx">B</text>
  <rect x="344" y="40" width="42" height="40" rx="5" class="p2s"/><text x="365" y="65" text-anchor="middle" class="tx">G</text>
  <rect x="388" y="40" width="42" height="40" rx="5" class="p3s"/><text x="409" y="65" text-anchor="middle" class="tx">R</text>
  <text x="440" y="65" class="tx-m">…</text>
  <text x="85" y="100" text-anchor="middle" class="tx-m">픽셀 (y=0, x=0)</text>
  <text x="225" y="100" text-anchor="middle" class="tx-m">픽셀 (y=0, x=1)</text>
  <text x="365" y="100" text-anchor="middle" class="tx-m">픽셀 (y=0, x=2)</text>
  <text x="20" y="130" class="tx">img.at&lt;Vec3b&gt;(0, 1) → [0] = B, [1] = G, [2] = R</text>
  <line x1="240" y1="146" x2="240" y2="186" class="ln" stroke-width="2" marker-end="url(#c05a1)"/>
  <text x="252" y="172" class="tx">split(img, ch)</text>
  <line x1="520" y1="186" x2="520" y2="146" class="ln" stroke-width="2" marker-end="url(#c05a1)"/>
  <text x="532" y="172" class="tx">merge(ch, dst)</text>
  <rect x="40" y="196" width="180" height="100" rx="8" class="p1s"/><text x="130" y="232" text-anchor="middle" class="tx-b">ch[0] = B 채널</text><text x="130" y="256" text-anchor="middle" class="tx-m">1채널 CV_8UC1</text><text x="130" y="278" text-anchor="middle" class="tx-m">크기는 원본과 같다</text>
  <rect x="240" y="196" width="180" height="100" rx="8" class="p2s"/><text x="330" y="232" text-anchor="middle" class="tx-b">ch[1] = G 채널</text><text x="330" y="256" text-anchor="middle" class="tx-m">1채널 CV_8UC1</text>
  <rect x="440" y="196" width="180" height="100" rx="8" class="p3s"/><text x="530" y="232" text-anchor="middle" class="tx-b">ch[2] = R 채널</text><text x="530" y="256" text-anchor="middle" class="tx-m">1채널 CV_8UC1</text>
  <text x="640" y="228" class="tx-m">vector&lt;Mat&gt; ch</text><text x="640" y="250" class="tx-m">흑백 영상</text><text x="640" y="272" class="tx-m">3장으로 보인다</text>
</svg>`;

  // 그림 2: Gray 변환 = 가중 평균
  const FIG_GRAY = `<svg viewBox="0 0 700 260" role="img" aria-label="회색 변환은 R G B 에 각각 0.299, 0.587, 0.114 를 곱해 더하는 가중 평균이다">
  ${ARROW('c05a2')}
  <text x="20" y="26" class="tx-b">Gray = 0.299·R + 0.587·G + 0.114·B  (빨간 원 픽셀 B=37 G=37 R=196)</text>
  <rect x="30" y="48" width="200" height="40" rx="6" class="p3s"/><text x="130" y="74" text-anchor="middle" class="tx">R = 196</text>
  <text x="248" y="74" class="tx">× 0.299 =</text>
  <rect x="340" y="48" width="120" height="40" rx="6" class="p3"/><text x="400" y="74" text-anchor="middle" class="tx-w">58.6</text>
  <rect x="30" y="100" width="200" height="40" rx="6" class="p2s"/><text x="130" y="126" text-anchor="middle" class="tx">G = 37</text>
  <text x="248" y="126" class="tx">× 0.587 =</text>
  <rect x="340" y="100" width="120" height="40" rx="6" class="p2"/><text x="400" y="126" text-anchor="middle" class="tx-w">21.7</text>
  <rect x="30" y="152" width="200" height="40" rx="6" class="p1s"/><text x="130" y="178" text-anchor="middle" class="tx">B = 37</text>
  <text x="248" y="178" class="tx">× 0.114 =</text>
  <rect x="340" y="152" width="120" height="40" rx="6" class="p1"/><text x="400" y="178" text-anchor="middle" class="tx-w">4.2</text>
  <line x1="340" y1="204" x2="460" y2="204" class="ax"/>
  <text x="400" y="230" text-anchor="middle" class="tx-b">합 = 84.5 → 85</text>
  <line x1="470" y1="204" x2="540" y2="204" class="ln" stroke-width="2" marker-end="url(#c05a2)"/>
  <rect x="548" y="180" width="120" height="48" rx="8" class="p4s"/><text x="608" y="210" text-anchor="middle" class="tx-b">Gray = 85</text>
  <text x="500" y="70" class="tx-m">사람 눈은 초록에 가장 민감해서</text>
  <text x="500" y="92" class="tx-m">G 의 계수(0.587)가 가장 크다.</text>
  <text x="500" y="122" class="tx-m">그래서 밝은 빨강과 짙은 파랑이</text>
  <text x="500" y="144" class="tx-m">흑백에서는 비슷한 값이 된다.</text>
</svg>`;

  // 그림 3: HSV 원기둥
  const FIG_HSV = `<svg viewBox="0 0 700 340" role="img" aria-label="HSV 원기둥: 둘레 각도가 색상 H, 중심에서의 거리가 채도 S, 높이가 명도 V">
  ${ARROW('c05a3')}
  <ellipse cx="220" cy="80" rx="150" ry="52" class="p1s"/>
  <path d="M70,80 L70,250 A150,52 0 0 0 370,250 L370,80" class="p2s"/>
  <ellipse cx="220" cy="250" rx="150" ry="52" class="p3s"/>
  <ellipse cx="220" cy="80" rx="150" ry="52" class="s1" fill="none"/>
  <line x1="220" y1="80" x2="360" y2="100" class="ln" stroke-width="2" marker-end="url(#c05a3)"/>
  <text x="300" y="70" class="tx">S (채도) 0 → 255</text>
  <path d="M100,62 A150,52 0 0 1 330,55" class="s2" fill="none" marker-end="url(#c05a3)"/>
  <text x="215" y="40" text-anchor="middle" class="tx">H (색상) 0 → 179 — 둘레를 한 바퀴</text>
  <line x1="420" y1="250" x2="420" y2="80" class="ln" stroke-width="2" marker-end="url(#c05a3)"/>
  <text x="432" y="170" class="tx">V (명도)</text>
  <text x="432" y="192" class="tx-m">0 = 검정 → 255 = 밝음</text>
  <text x="220" y="86" text-anchor="middle" class="tx-m">중심 = 무채색 (S≈0)</text>
  <text x="220" y="308" text-anchor="middle" class="tx-m">아래로 갈수록 어둡다 (V 작아짐)</text>
  <text x="432" y="230" class="tx-m">조명이 약해지면</text>
  <text x="432" y="252" class="tx-m">V 만 작아지고</text>
  <text x="432" y="274" class="tx-m">H 는 거의 그대로!</text>
</svg>`;

  // 그림 4: H 축과 빨강의 두 구간
  const FIG_HUE = `<svg viewBox="0 0 740 250" role="img" aria-label="H 축은 0 에서 179 까지이며 빨강은 0 근처와 179 근처 두 구간에 걸쳐 있다">
  ${ARROW('c05a4')}
  <text x="20" y="26" class="tx-b">OpenCV 의 H 축 (8비트: 0 ~ 179 = 색상환 360° ÷ 2)</text>
  <line x1="40" y1="120" x2="700" y2="120" class="ax"/>
  <rect x="40" y="76" width="38" height="44" class="p3s"/><text x="59" y="140" text-anchor="middle" class="tx-m">0~10</text><text x="59" y="68" text-anchor="middle" class="tx">빨강</text>
  <rect x="78" y="76" width="36" height="44" class="p5s"/><text x="96" y="140" text-anchor="middle" class="tx-m">10~20</text><text x="96" y="68" text-anchor="middle" class="tx-m">주황</text>
  <rect x="114" y="76" width="56" height="44" class="p4s"/><text x="142" y="140" text-anchor="middle" class="tx-m">20~35</text><text x="142" y="68" text-anchor="middle" class="tx">노랑</text>
  <rect x="170" y="76" width="160" height="44" class="p2s"/><text x="250" y="140" text-anchor="middle" class="tx-m">40~80</text><text x="250" y="68" text-anchor="middle" class="tx">초록</text>
  <rect x="330" y="76" width="74" height="44" class="p2"/><text x="367" y="140" text-anchor="middle" class="tx-m">80~100</text><text x="367" y="68" text-anchor="middle" class="tx-m">청록</text>
  <rect x="404" y="76" width="112" height="44" class="p1s"/><text x="460" y="140" text-anchor="middle" class="tx-m">100~130</text><text x="460" y="68" text-anchor="middle" class="tx">파랑</text>
  <rect x="516" y="76" width="112" height="44" class="p5s"/><text x="572" y="140" text-anchor="middle" class="tx-m">130~170</text><text x="572" y="68" text-anchor="middle" class="tx-m">자주</text>
  <rect x="628" y="76" width="62" height="44" class="p3s"/><text x="659" y="140" text-anchor="middle" class="tx-m">170~179</text><text x="659" y="68" text-anchor="middle" class="tx">빨강</text>
  <path d="M59,166 C59,216 659,216 659,166" class="s3" fill="none" marker-end="url(#c05a4)"/>
  <text x="360" y="212" text-anchor="middle" class="tx-b">색상환은 둥글다 → 빨강은 양쪽 끝에 걸친다</text>
  <text x="360" y="238" text-anchor="middle" class="tx-m">그래서 빨강 마스크는 0~10 과 170~179 를 각각 만들어 bitwise_or 로 합친다</text>
</svg>`;

  // ---------------------------------------------------------------- 1교시 예제
  const EX_PIXEL = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png", IMREAD_COLOR);
    cout << "크기 " << img.cols << "x" << img.rows << ", 채널 " << img.channels()
         << ", 형식 " << typeToString(img.type()) << endl;

    int pts[5][2] = { { 120, 110 }, { 270, 120 }, { 130, 300 }, { 520, 120 }, { 350, 60 } };   // (x, y)
    string names[5] = { "빨간 원", "초록 사각형", "파란 삼각형", "노란 육각형", "트레이 배경" };
    for (int i = 0; i < 5; i++)
    {
        int x = pts[i][0], y = pts[i][1];
        Vec3b p = img.at<Vec3b>(y, x);                 // (행 y, 열 x) 순서!
        cout << names[i] << " (" << x << "," << y << "): B=" << (int)p[0]
             << " G=" << (int)p[1] << " R=" << (int)p[2] << endl;
    }
    return 0;
}`;

  const EX_GRAY = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png");     // 기본값 IMREAD_COLOR → 3채널 BGR
    Mat gray;
    cvtColor(img, gray, COLOR_BGR2GRAY);
    cout << "원본 채널 " << img.channels() << " -> 회색 채널 " << gray.channels()
         << ", 형식 " << typeToString(gray.type()) << endl;

    int pts[3][2] = { { 120, 110 }, { 270, 120 }, { 130, 300 } };
    string names[3] = { "빨강", "초록", "파랑" };
    for (int i = 0; i < 3; i++)
    {
        int x = pts[i][0], y = pts[i][1];
        Vec3b p = img.at<Vec3b>(y, x);
        double calc = 0.299 * p[2] + 0.587 * p[1] + 0.114 * p[0];     // 공식을 직접 계산
        cout << names[i] << " B=" << (int)p[0] << " G=" << (int)p[1] << " R=" << (int)p[2]
             << format(" -> 공식 %.1f", calc) << ", cvtColor " << (int)gray.at<uchar>(y, x) << endl;
    }
    imshow("gray", gray);
    waitKey(0);
    return 0;
}`;

  const EX_SPLIT = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
#include <vector>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png");
    vector<Mat> ch;
    split(img, ch);                        // ch[0]=B, ch[1]=G, ch[2]=R
    string names[3] = { "B(파랑)", "G(초록)", "R(빨강)" };
    for (int i = 0; i < 3; i++)
        cout << names[i] << " 채널: 크기 " << ch[i].cols << "x" << ch[i].rows << ", 채널 수 "
             << ch[i].channels() << format(", 평균 %.1f", mean(ch[i])[0]) << endl;

    Vec3b p = img.at<Vec3b>(110, 120);
    cout << "빨간 원 (120,110): Vec3b=" << p << " / 채널별=(" << (int)ch[0].at<uchar>(110, 120) << ","
         << (int)ch[1].at<uchar>(110, 120) << "," << (int)ch[2].at<uchar>(110, 120) << ")" << endl;

    // 채널 하나만 필요하면 extractChannel
    Mat r;
    extractChannel(img, r, 2);
    cout << "extractChannel(img, r, 2) 평균 " << format("%.1f", mean(r)[0]) << endl;

    for (int i = 0; i < 3; i++) imshow(names[i], ch[i]);
    waitKey(0);
    return 0;                              // vector<Mat> 은 범위를 벗어나면 자동으로 해제된다
}`;

  const EX_MERGE = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png");
    vector<Mat> ch;
    split(img, ch);
    ch[2].setTo(0);                        // R 채널을 전부 0 으로 (split 결과는 복사본 → img 는 그대로)
    Mat noRed;
    merge(ch, noRed);                      // 다시 3채널로 합치기
    cout << "R 제거 후 (120,110) = " << noRed.at<Vec3b>(110, 120) << endl;
    cout << "원본 (120,110)      = " << img.at<Vec3b>(110, 120) << endl;

    Scalar m1 = mean(img), m2 = mean(noRed);
    cout << format("원본 평균 BGR = %.1f, %.1f, %.1f", m1[0], m1[1], m1[2]) << endl;
    cout << format("결과 평균 BGR = %.1f, %.1f, %.1f", m2[0], m2[1], m2[2]) << endl;

    // 순서를 바꿔 merge 하면 BGR <-> RGB 가 뒤집힌다
    split(img, ch);                        // 원래 채널을 다시 얻기
    vector<Mat> rev = { ch[2], ch[1], ch[0] };
    Mat swapped;
    merge(rev, swapped);
    imshow("noRed", noRed);
    imshow("swapped", swapped);
    waitKey(0);
    return 0;
}`;

  const EX_OVERLAY = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png");
    Mat gray, canvas;
    cvtColor(img, gray, COLOR_BGR2GRAY);
    cvtColor(gray, canvas, COLOR_GRAY2BGR);        // 1채널 -> 3채널 (색은 여전히 회색)
    cout << "gray 채널 " << gray.channels() << " -> canvas 채널 " << canvas.channels() << endl;
    cout << "(120,110) canvas = " << canvas.at<Vec3b>(110, 120) << " (B=G=R)" << endl;

    Rect roi(86, 76, 68, 68);                      // 빨간 원 주변만
    Mat dstRoi = canvas(roi);                      // canvas 의 일부를 가리키는 창
    img(roi).copyTo(dstRoi);                       // 그 부분만 원본 컬러로 되살리기
    rectangle(canvas, roi, Scalar(0, 255, 255), 2);
    putText(canvas, "RED", Point(80, 70), FONT_HERSHEY_SIMPLEX, 0.7, Scalar(0, 255, 255), 2);
    cout << "강조 후 (120,110) = " << canvas.at<Vec3b>(110, 120) << endl;
    imshow("overlay", canvas);
    waitKey(0);
    return 0;
}`;

  // ---------------------------------------------------------------- 2교시 예제
  const EX_HSV = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/color_caps.png");
    Mat hsv;
    cvtColor(img, hsv, COLOR_BGR2HSV);

    int pts[6][2] = { { 412, 96 }, { 265, 382 }, { 310, 229 }, { 521, 167 }, { 424, 227 }, { 10, 10 } };
    string names[6] = { "빨강 뚜껑", "초록 뚜껑", "파랑 뚜껑", "노랑 뚜껑", "흰 뚜껑", "배경" };
    cout << "  B   G   R  |   H   S   V" << endl;
    for (int i = 0; i < 6; i++)
    {
        int x = pts[i][0], y = pts[i][1];
        Vec3b b = img.at<Vec3b>(y, x);
        Vec3b h = hsv.at<Vec3b>(y, x);
        cout << format("%3d %3d %3d  | %3d %3d %3d  ", b[0], b[1], b[2], h[0], h[1], h[2]) << names[i] << endl;
    }
    imshow("hsv", hsv);
    waitKey(0);
    return 0;
}`;

  const EX_INRANGE = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/color_caps.png");
    Mat hsv, mask;
    cvtColor(img, hsv, COLOR_BGR2HSV);

    inRange(hsv, Scalar(40, 100, 70), Scalar(80, 255, 255), mask);   // 초록: H 40~80
    cout << "마스크 형식 " << typeToString(mask.type()) << ", 흰 픽셀 " << countNonZero(mask)
         << " / 전체 " << mask.rows * mask.cols << endl;

    // 흰 덩어리 찾기: stats 에 면적 · 외곽 사각형, centroids 에 중심
    Mat labels, stats, centroids;
    int nLabels = connectedComponentsWithStats(mask, labels, stats, centroids);
    int n = 0;
    for (int i = 1; i < nLabels; i++)                     // 0번은 배경
    {
        int area = stats.at<int>(i, CC_STAT_AREA);
        if (area < 300) continue;                          // 작은 잡티는 무시
        n++;
        cout << format("  #%d 면적 %d 중심 (%.0f, %.0f)", n, area,
                       centroids.at<double>(i, 0), centroids.at<double>(i, 1)) << endl;
    }
    cout << "초록 뚜껑 " << n << " 개" << endl;
    imshow("green mask", mask);
    waitKey(0);
    return 0;
}`;

  const EX_RED = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

// 면적 minArea 이상인 흰 덩어리 개수
int countBlobs(const Mat& mask, int minArea = 300)
{
    Mat labels, stats, centroids;
    int nLabels = connectedComponentsWithStats(mask, labels, stats, centroids);
    int n = 0;
    for (int i = 1; i < nLabels; i++)
        if (stats.at<int>(i, CC_STAT_AREA) >= minArea) n++;
    return n;
}

int main()
{
    Mat img = imread("images/color_caps.png");
    Mat hsv, low, high, red;
    cvtColor(img, hsv, COLOR_BGR2HSV);

    inRange(hsv, Scalar(0, 100, 70), Scalar(10, 255, 255), low);       // H 0~10
    inRange(hsv, Scalar(170, 100, 70), Scalar(179, 255, 255), high);   // H 170~179
    bitwise_or(low, high, red);                                        // 둘을 합친다
    cout << "아래 구간 " << countNonZero(low) << " px + 위 구간 " << countNonZero(high)
         << " px = OR " << countNonZero(red) << " px" << endl;
    cout << "아래 구간만 쓰면 " << countBlobs(low) << " 개, 두 구간 OR 이면 " << countBlobs(red) << " 개" << endl;
    imshow("red mask", red);
    waitKey(0);
    return 0;
}`;

  const EX_COUNT = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

int countBlobs(const Mat& mask, int minArea = 300)
{
    Mat labels, stats, centroids;
    int nLabels = connectedComponentsWithStats(mask, labels, stats, centroids);
    int n = 0;
    for (int i = 1; i < nLabels; i++)
        if (stats.at<int>(i, CC_STAT_AREA) >= minArea) n++;
    return n;
}

int main()
{
    Mat img = imread("images/color_caps.png");
    Mat hsv;
    cvtColor(img, hsv, COLOR_BGR2HSV);

    // 색 규격 표: 이름 · 하한 · 상한 (H, S, V)
    string names[5] = { "red", "yellow", "green", "blue", "white" };
    Scalar lo[5] = { Scalar(0, 100, 70), Scalar(20, 100, 70), Scalar(40, 100, 70), Scalar(100, 100, 70), Scalar(0, 0, 180) };
    Scalar hi[5] = { Scalar(10, 255, 255), Scalar(35, 255, 255), Scalar(80, 255, 255), Scalar(130, 255, 255), Scalar(179, 40, 255) };
    int total = 0;
    for (int i = 0; i < 5; i++)
    {
        Mat mask;
        inRange(hsv, lo[i], hi[i], mask);
        if (names[i] == "red")                     // 빨강만 두 구간을 합친다
        {
            Mat wrap;
            inRange(hsv, Scalar(170, 100, 70), Scalar(179, 255, 255), wrap);
            bitwise_or(mask, wrap, mask);
        }
        int n = countBlobs(mask);
        total += n;
        cout << format("%-7s %d 개", names[i].c_str(), n) << endl;
    }
    cout << "합계 " << total << " 개" << endl;
    return 0;
}`;

  const EX_BITAND = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/color_caps.png");
    Mat hsv, mask;
    cvtColor(img, hsv, COLOR_BGR2HSV);
    inRange(hsv, Scalar(20, 100, 70), Scalar(35, 255, 255), mask);    // 노랑

    Mat only;
    bitwise_and(img, img, only, mask);            // 마스크가 흰 곳만 남기고 나머지는 0
    cout << "노랑 픽셀 " << countNonZero(mask) << " px" << endl;
    cout << format("원본 평균(B) %.1f, 노랑만 남긴 영상 평균(B) %.1f", mean(img)[0], mean(only)[0]) << endl;
    Scalar m = mean(img, mask);                   // 마스크 안쪽만의 평균색
    cout << format("마스크 안 평균색 BGR = %.0f, %.0f, %.0f", m[0], m[1], m[2]) << endl;

    Mat inv;
    bitwise_not(mask, inv);                       // 마스크 반전 = 노랑이 아닌 곳
    cout << "반전 마스크 흰 픽셀 " << countNonZero(inv) << " px" << endl;
    imshow("yellow only", only);
    waitKey(0);
    return 0;
}`;

  const EX_LIGHT = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

void report(const string& tag, const Mat& bgr)
{
    Mat hsv, mask, wrap;
    cvtColor(bgr, hsv, COLOR_BGR2HSV);
    Vec3b h = hsv.at<Vec3b>(96, 412);                  // 빨강 뚜껑 한 점
    inRange(hsv, Scalar(0, 100, 50), Scalar(10, 255, 255), mask);
    inRange(hsv, Scalar(170, 100, 50), Scalar(179, 255, 255), wrap);
    bitwise_or(mask, wrap, mask);

    Mat labels, stats, centroids;
    int nLabels = connectedComponentsWithStats(mask, labels, stats, centroids);
    int n = 0;
    for (int i = 1; i < nLabels; i++)
        if (stats.at<int>(i, CC_STAT_AREA) >= 300) n++;
    cout << tag << ": 빨강 뚜껑 HSV=" << h << " -> 같은 H 범위로 " << n << " 개" << endl;
}

int main()
{
    Mat img = imread("images/color_caps.png");
    Mat dark;
    convertScaleAbs(img, dark, 0.55, 0);              // 조명이 약해진 상황 (밝기 55%)
    cout << format("원본 평균(B) %.1f -> 어두운 영상 %.1f", mean(img)[0], mean(dark)[0]) << endl;
    report("원본", img);
    report("55% 조명", dark);

    Mat lab;
    cvtColor(img, lab, COLOR_BGR2Lab);
    Vec3b p = lab.at<Vec3b>(96, 412);
    cout << "Lab 빨강 뚜껑: L=" << (int)p[0] << " a=" << (int)p[1] << " b=" << (int)p[2] << endl;
    imshow("dark", dark);
    waitKey(0);
    return 0;
}`;

  const EX_TRACKBAR = `// 로컬 PC 전용: 트랙바로 HSV 범위를 바꾸며 마스크를 실시간으로 확인하는 도구
#include <opencv2/opencv.hpp>
using namespace cv;

int main()
{
    Mat img = imread("images/color_caps.png"), hsv, mask;
    cvtColor(img, hsv, COLOR_BGR2HSV);

    namedWindow("mask");
    createTrackbar("H min", "mask", nullptr, 179);
    createTrackbar("H max", "mask", nullptr, 179);
    createTrackbar("S min", "mask", nullptr, 255);
    createTrackbar("V min", "mask", nullptr, 255);
    setTrackbarPos("H min", "mask", 40);  setTrackbarPos("H max", "mask", 80);
    setTrackbarPos("S min", "mask", 100); setTrackbarPos("V min", "mask", 70);

    while (true)
    {
        int h1 = getTrackbarPos("H min", "mask"), h2 = getTrackbarPos("H max", "mask");
        int s1 = getTrackbarPos("S min", "mask"), v1 = getTrackbarPos("V min", "mask");
        inRange(hsv, Scalar(h1, s1, v1), Scalar(h2, 255, 255), mask);
        imshow("mask", mask);
        if (waitKey(30) == 27) break;      // ESC 로 끝내기
    }
    return 0;
}`;

  // ---------------------------------------------------------------- 슬라이드용 짧은 코드
  const S_PIXEL = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png");
    Vec3b red  = img.at<Vec3b>(110, 120);    // 빨간 원 (x=120, y=110)
    Vec3b tray = img.at<Vec3b>(60, 350);     // 트레이 배경
    cout << "빨간 원 B=" << (int)red[0] << " G=" << (int)red[1] << " R=" << (int)red[2] << endl;
    cout << "트레이  B=" << (int)tray[0] << " G=" << (int)tray[1] << " R=" << (int)tray[2] << endl;
    imshow("color", img);
    waitKey(0);
    return 0;
}`;

  const S_GRAY = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png"), gray;
    cvtColor(img, gray, COLOR_BGR2GRAY);

    Vec3b p = img.at<Vec3b>(110, 120);
    double calc = 0.299 * p[2] + 0.587 * p[1] + 0.114 * p[0];
    cout << format("공식 %.1f vs cvtColor %d", calc, (int)gray.at<uchar>(110, 120)) << endl;
    imshow("gray", gray);
    waitKey(0);
    return 0;
}`;

  const S_SPLIT = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png");
    vector<Mat> ch;
    split(img, ch);                          // ch[0]=B ch[1]=G ch[2]=R
    for (int i = 0; i < 3; i++)
        cout << "ch[" << i << "] 평균 " << format("%.1f", mean(ch[i])[0])
             << ", 채널 수 " << ch[i].channels() << endl;

    ch[0].setTo(0);                          // B 를 0 으로
    Mat noBlue;
    merge(ch, noBlue);
    imshow("noBlue", noBlue);
    waitKey(0);
    return 0;
}`;

  const S_OVERLAY = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png"), gray, canvas;
    cvtColor(img, gray, COLOR_BGR2GRAY);
    cvtColor(gray, canvas, COLOR_GRAY2BGR);

    Rect roi(86, 76, 68, 68);
    Mat dstRoi = canvas(roi);
    img(roi).copyTo(dstRoi);                 // 그 부분만 컬러로
    rectangle(canvas, roi, Scalar(0, 255, 255), 2);
    cout << "canvas 채널 " << canvas.channels() << endl;
    imshow("overlay", canvas);
    waitKey(0);
    return 0;
}`;

  const S_HSV = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/color_caps.png"), hsv;
    cvtColor(img, hsv, COLOR_BGR2HSV);

    Vec3b r = hsv.at<Vec3b>(96, 412);     // 빨강 뚜껑
    Vec3b w = hsv.at<Vec3b>(227, 424);    // 흰 뚜껑
    cout << "빨강 H=" << (int)r[0] << " S=" << (int)r[1] << " V=" << (int)r[2] << endl;
    cout << "흰색 H=" << (int)w[0] << " S=" << (int)w[1] << " V=" << (int)w[2] << endl;
    imshow("hsv", hsv);
    waitKey(0);
    return 0;
}`;

  const S_MASK = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/color_caps.png"), hsv, mask;
    cvtColor(img, hsv, COLOR_BGR2HSV);
    inRange(hsv, Scalar(100, 100, 70), Scalar(130, 255, 255), mask);   // 파랑

    Mat labels, stats, centroids;
    int nLabels = connectedComponentsWithStats(mask, labels, stats, centroids);
    int n = 0;
    for (int i = 1; i < nLabels; i++)
        if (stats.at<int>(i, CC_STAT_AREA) >= 300) n++;
    cout << "파랑 뚜껑 " << n << " 개 (흰 픽셀 " << countNonZero(mask) << ")" << endl;
    imshow("blue mask", mask);
    waitKey(0);
    return 0;
}`;

  const S_RED = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/color_caps.png"), hsv, m1, m2, red;
    cvtColor(img, hsv, COLOR_BGR2HSV);
    inRange(hsv, Scalar(0, 100, 70), Scalar(10, 255, 255), m1);
    inRange(hsv, Scalar(170, 100, 70), Scalar(179, 255, 255), m2);
    bitwise_or(m1, m2, red);
    cout << countNonZero(m1) << " + " << countNonZero(m2) << " = " << countNonZero(red) << " px" << endl;
    imshow("red", red);
    waitKey(0);
    return 0;
}`;

  // ---------------------------------------------------------------- 퀴즈
  const QUIZ1 = [
    { q: '<code>imread</code> 로 읽은 컬러 이미지에서 <code>img.at&lt;Vec3b&gt;(y, x)[0]</code> 은 어떤 값인가?',
      options: ['빨강(R)', '초록(G)', '파랑(B)', '밝기(Gray)'], answer: 2,
      explain: 'OpenCV 의 채널 순서는 <b>B → G → R</b> 이므로 <code>[0]</code> = B, <code>[1]</code> = G, <code>[2]</code> = R 입니다. <code>Scalar(0, 0, 255)</code> 가 빨강인 것과 같은 규칙입니다. 출력할 때는 <code>(int)p[0]</code> 처럼 바꿔야 숫자로 나옵니다.' },
    { q: 'BGR = (37, 37, 196) 인 빨간 픽셀을 <code>COLOR_BGR2GRAY</code> 로 바꾸면 약 얼마인가?',
      options: ['약 37', '약 85', '약 196', '약 255'], answer: 1,
      explain: '0.299×196 + 0.587×37 + 0.114×37 = 58.6 + 21.7 + 4.2 = <b>84.5 → 85</b>. 빨강은 R 값이 커도 계수가 0.299 뿐이어서 흑백에서는 꽤 어둡게 나옵니다.' },
    { q: '<code>split(img, ch)</code> 가 <code>vector&lt;Mat&gt; ch</code> 에 넣어 주는 각 원소는?',
      options: ['원본과 같은 3채널 컬러 Mat 3개', '크기가 1/3 로 줄어든 Mat 3개', '원본과 같은 크기의 <b>1채널</b> Mat 3개', 'B, G, R 값을 담은 Scalar 3개'], answer: 2,
      explain: '채널 분리는 크기(행 · 열)는 그대로 두고 채널만 떼어 냅니다. 그래서 <code>CV_8UC1</code> 영상 3장이 되고, 화면에 띄우면 <b>흑백 영상</b>으로 보입니다.' },
    { q: '흑백 영상 위에 <b>빨간 선</b>을 그리려면 먼저 무엇을 해야 하나?',
      options: ['<code>cvtColor(gray, dst, COLOR_GRAY2BGR)</code> 로 3채널로 바꾼다', '<code>gray.setTo(Scalar(0, 0, 255))</code> 로 색을 넣는다', '<code>merge</code> 로 gray 한 장만 합친다', '아무것도 필요 없다 — 1채널에도 색이 그려진다'], answer: 0,
      explain: '1채널 영상에는 색을 그릴 수 없습니다(값 하나뿐). <code>COLOR_GRAY2BGR</code> 로 3채널로 만들면 화면은 여전히 회색이지만 <b>그 위에 컬러로 그릴 수</b> 있습니다. 색 정보가 되살아나는 것은 아닙니다.' },
    { q: '<code>split(img, ch); ch[2].setTo(0);</code> 을 실행하면 원본 <code>img</code> 는?',
      options: ['R 채널이 0 이 된다', '<b>그대로다</b> — split 은 채널을 새 메모리로 복사한다', '전부 검게 된다', '컴파일 오류가 난다'], answer: 1,
      explain: '<code>split</code> 은 채널마다 <b>새 Mat 을 만들어 값을 복사</b>합니다. 그래서 <code>ch</code> 를 바꿔도 원본은 그대로이고, 바꾼 결과를 보려면 <code>merge(ch, dst)</code> 로 합쳐야 합니다. 메모리는 <code>vector&lt;Mat&gt;</code> 가 범위를 벗어날 때 자동으로 해제됩니다(참조 계수).' }
  ];

  const QUIZ2 = [
    { q: 'OpenCV 의 8비트 HSV 에서 H(색상)의 범위는?',
      options: ['0 ~ 255', '0 ~ 360', '0 ~ 179', '−180 ~ 180'], answer: 2,
      explain: '색상환은 360° 이지만 8비트(0~255)에 담으려고 <b>2로 나눠 0~179</b> 를 씁니다. S 와 V 는 0~255 입니다. 다른 프로그램에서 본 H 값(0~360)을 그대로 쓰면 범위를 벗어납니다.' },
    { q: '빨강을 <code>inRange</code> 로 검출할 때 구간을 두 번 만들어 합치는 이유는?',
      options: ['빨강은 S 가 낮아서', '빨강의 H 가 0 근처와 179 근처 양쪽에 걸쳐 있어서', 'inRange 는 한 번에 한 채널만 되어서', '빨강은 V 가 커서'], answer: 1,
      explain: '색상환이 둥글기 때문에 빨강은 <b>H ≈ 0 과 H ≈ 179 양쪽</b>에 나타납니다. <code>0~10</code> 과 <code>170~179</code> 마스크를 각각 만들어 <code>bitwise_or</code> 로 합칩니다.' },
    { q: '흰색 물체를 HSV 로 고를 때 가장 알맞은 조건은?',
      options: ['H 가 0 근처', 'S 가 크고 V 가 작다', '<b>S 가 작고 V 가 크다</b>', 'H 가 90 근처'], answer: 2,
      explain: '흰색 · 회색 · 검정은 <b>무채색</b>이라 H 값에 의미가 없습니다. 흰색은 채도 S 가 거의 0, 명도 V 가 큽니다 — <code>inRange(hsv, Scalar(0, 0, 180), Scalar(179, 40, 255), mask)</code>.' },
    { q: '조명이 어두워져도 HSV 기반 색 검출이 잘 버티는 이유는?',
      options: ['H 와 S 는 그대로이고 주로 V 만 작아지기 때문', 'HSV 는 잡음이 없기 때문', 'inRange 가 자동으로 밝기를 보정하기 때문', 'H 가 밝기에 비례해 커지기 때문'], answer: 0,
      explain: '밝기 변화는 대부분 <b>V(명도)</b> 에 몰립니다. BGR 세 값은 모두 함께 변하지만 H(색상)는 거의 그대로여서, V 의 아래 한계만 넉넉히 잡으면 같은 범위로 검출됩니다.' },
    { q: '<code>bitwise_and(img, img, dst, mask)</code> 의 결과는?',
      options: ['마스크가 흰 곳만 원본 색이 남고 나머지는 0(검정)', '마스크가 검은 곳만 원본이 남는다', '마스크와 원본을 반반 섞는다', '마스크를 컬러로 바꾼다'], answer: 0,
      explain: '같은 영상을 두 번 넘기고 <code>mask</code> 를 주면 <b>마스크가 0 이 아닌 픽셀만 복사</b>됩니다(<code>img.copyTo(dst, mask)</code> 와 같은 효과). 반대로 남기고 싶으면 <code>bitwise_not</code> 으로 마스크를 반전하세요.' }
  ];

  CV_COURSE.addChapter({
    id: 'cv05', no: '05', title: '색 공간: BGR · Gray · HSV · 채널', subtitle: '색을 숫자로 다루기 — 채널 분리부터 색 검출까지',
    summary: '컬러 영상이 <b>B · G · R 세 장의 숫자판</b>으로 되어 있다는 것을 확인하고, 흑백 변환 공식을 직접 계산해 <code>cvtColor</code> 결과와 비교합니다. 이어서 색을 다루기 쉬운 <b>HSV</b> 좌표계를 배워 <code>inRange</code> 로 색 마스크를 만들고, <code>connectedComponentsWithStats</code> 로 병뚜껑을 색별로 세는 실전 파이프라인까지 완성합니다.',
    goals: ['컬러 Mat 의 BGR 채널 구조를 설명하고 split · merge · extractChannel 로 채널을 다룰 수 있다', 'Gray 변환 공식(0.299R+0.587G+0.114B)을 직접 계산해 cvtColor 결과와 비교할 수 있다', 'HSV 의 H · S · V 뜻과 OpenCV 의 범위(0~179 · 0~255)를 안다', 'inRange 로 색 마스크를 만들고 색별 개수를 세는 프로그램을 쓸 수 있다'],
    sections: [
      {
        id: 'cv05-1', title: 'BGR 채널과 흑백 변환', minutes: 50,
        goals: ['컬러 Mat 의 메모리 배치(B G R 인터리브)를 설명할 수 있다', 'Gray 변환 공식을 픽셀 하나로 직접 계산해 확인할 수 있다', 'split · merge · extractChannel 로 채널을 나누고 합칠 수 있다'],
        flow: [['도입: 색은 숫자 세 개', 8], ['BGR 과 Gray 변환', 17], ['채널 분리 · 합치기 실습', 17], ['정리 · 퀴즈', 8]],
        content: [
          { type: 'h', text: '컬러 영상 = 숫자판 세 장' },
          { type: 'p', html: '03차시에서 흑백 영상이 <b>숫자로 채워진 표</b>라는 것을 배웠습니다. 컬러 영상은 그 표가 <b>세 장</b> 겹쳐 있는 것입니다. OpenCV 는 이 세 장을 <b>B(파랑) · G(초록) · R(빨강)</b> 순서로 쌓고, 메모리에는 픽셀마다 <code>B G R B G R …</code> 처럼 <b>번갈아(interleaved)</b> 저장합니다. 그래서 <code>CV_8UC3</code> 영상의 한 픽셀은 3바이트이고, <code>at&lt;Vec3b&gt;(y, x)</code> 로 세 값을 한 번에 읽습니다.' },
          { type: 'image', src: 'images/sample_color.png', caption: '이 차시에서 쓰는 images/sample_color.png — 회색 트레이 위에 7가지 색 부품 10개 (누르면 확대 · 픽셀 값 확인)' },
          { type: 'figure', html: FIG_CHANNELS, caption: '그림 1. 컬러 Mat 의 메모리 배치와 split / merge' },
          { type: 'code', title: '예제 1: 픽셀의 B · G · R 값 읽기', code: EX_PIXEL,
            desc: '결과 창의 이미지 위에 마우스를 올려 같은 좌표의 값과 비교해 보세요. 빨간 원은 <b>R 만 크고 B · G 는 작습니다</b>. 트레이 배경은 세 값이 거의 같아 <b>회색</b>입니다 — 세 값이 비슷하면 무채색이라는 뜻입니다. <code>Vec3b</code> 의 원소는 <code>uchar</code> 이므로 <code>(int)</code> 로 바꿔 출력합니다.',
            expect: '크기 640x480, 채널 3, 형식 CV_8UC3\n빨간 원 (120,110): B=37 G=37 R=196\n초록 사각형 (270,120): B=58 G=169 R=58\n파란 삼각형 (130,300): B=187 G=84 R=28\n노란 육각형 (520,120): B=38 G=198 R=220\n트레이 배경 (350,60): B=143 G=145 R=148' },
          { type: 'callout', kind: 'warn', title: 'BGR 인가 RGB 인가', html: 'OpenCV 는 <b>BGR</b> 순서입니다. 반면 Windows GDI 의 <code>RGB()</code> 매크로 · 웹 · 대부분의 그림판 프로그램은 <b>RGB</b> 로 말합니다. 값 자체는 같고 <b>순서만</b> 다릅니다. 순서를 바꿀 때는 <code>cvtColor(img, dst, COLOR_BGR2RGB)</code> 를 쓰세요. 노랑이 <code>(0, 255, 255)</code>, 청록이 <code>(255, 255, 0)</code> 이 되는 것을 기억하면 헷갈리지 않습니다.' },
          { type: 'callout', kind: 'vs', title: '다른 라이브러리에 픽셀을 넘길 때', html: 'Visual Studio 프로젝트에서 OpenCV 영상을 GUI(MFC 의 <code>StretchDIBits</code>, Qt 의 <code>QImage</code>)나 다른 라이브러리에 넘길 때는 <b>채널 순서와 한 줄의 바이트 수(step)</b>를 꼭 확인하세요. Windows DIB(24비트)는 메모리에 B G R 순서로 저장되어 OpenCV 와 같지만, <code>QImage::Format_RGB888</code> 은 R G B 순서라 <code>COLOR_BGR2RGB</code> 변환이 필요합니다. 색이 "파랗게 뒤집혀" 보이면 거의 항상 이 문제입니다.' },
          { type: 'h', text: '흑백(Gray) 변환은 단순 평균이 아니다' },
          { type: 'p', html: '색을 하나의 밝기 값으로 줄일 때 <b>(R+G+B)/3</b> 을 쓰면 사람이 느끼는 밝기와 어긋납니다. 사람 눈은 초록에 가장 민감하고 파랑에 가장 둔감하기 때문입니다. 그래서 OpenCV 는 다음 <b>가중 평균</b>을 씁니다.' },
          { type: 'p', html: '<b>Gray = 0.299 × R + 0.587 × G + 0.114 × B</b> &nbsp;&nbsp;(계수의 합 = 1.000)' },
          { type: 'figure', html: FIG_GRAY, caption: '그림 2. 빨간 원 픽셀(B=37 G=37 R=196)의 Gray 값 계산 — 공식 84.5, cvtColor 85 (반올림 차이)' },
          { type: 'code', title: '예제 2: 공식을 직접 계산해 cvtColor 와 비교', code: EX_GRAY,
            desc: '공식 계산값과 <code>cvtColor</code> 결과가 <b>±1 안에서 일치</b>합니다. 차이는 OpenCV 가 속도를 위해 정수 연산(고정소수점)으로 계산하고 반올림하기 때문입니다. 중요한 관찰: <b>빨강 85 와 파랑 79 는 거의 같습니다</b> — 눈으로는 완전히 다른 색인데 흑백으로 바꾸면 구별이 안 됩니다. 이것이 다음 교시에서 HSV 를 배우는 이유입니다.',
            expect: '원본 채널 3 -> 회색 채널 1, 형식 CV_8UC1\n빨강 B=37 G=37 R=196 -> 공식 84.5, cvtColor 85\n초록 B=58 G=169 R=58 -> 공식 123.2, cvtColor 123\n파랑 B=187 G=84 R=28 -> 공식 79.0, cvtColor 79' },
          { type: 'table', head: ['부품', 'B', 'G', 'R', 'Gray', '메모'], rows: [
            ['빨간 원', '37', '37', '196', '<b>85</b>', 'R 이 커도 계수 0.299'],
            ['파란 삼각형', '187', '84', '28', '<b>79</b>', '빨강과 거의 같은 밝기!'],
            ['초록 사각형', '58', '169', '58', '123', 'G 계수 0.587 → 밝게'],
            ['노란 육각형', '38', '198', '220', '188', 'R + G 가 모두 큼 → 가장 밝다'],
            ['트레이 배경', '143', '145', '148', '145', '세 값이 비슷 = 무채색']
          ], caption: '표 1. 색이 다르면 Gray 값도 다를 것 같지만, 빨강과 파랑처럼 <b>밝기가 겹치는 색</b>이 흔하다' },
          { type: 'h', text: '채널 나누기: split · 합치기: merge' },
          { type: 'p', html: '<code>split(img, ch)</code> 는 3채널 Mat 을 <b>1채널 Mat 3장</b>으로 나눠 <code>vector&lt;Mat&gt; ch</code> 에 넣습니다. 각 장은 크기가 원본과 같고 화면에 띄우면 흑백으로 보입니다. 거꾸로 <code>merge(ch, dst)</code> 는 1채널 여러 장을 한 장의 다채널 Mat 으로 합칩니다. 채널 하나만 필요하면 <code>extractChannel(img, dst, 번호)</code> 가 간단합니다. Python 의 <code>cv2.split</code> / <code>cv2.merge</code> 와 같습니다.' },
          { type: 'code', title: '예제 3: 채널 분리 · 채널별 이미지 보기', code: EX_SPLIT,
            desc: '결과 창에 흑백 영상 3장이 나옵니다. <b>B 채널에서는 파란 삼각형이 밝게</b>, <b>R 채널에서는 빨간 원과 노란 육각형이 밝게</b> 보입니다. 즉 "어떤 채널에서 밝은가"만 봐도 대략적인 색 판단이 됩니다. 채널별 평균이 서로 비슷한 이유는 화면 대부분이 회색 트레이라서입니다. <code>extractChannel(img, r, 2)</code> 는 R 채널 하나만 꺼내므로 평균이 R 채널과 같습니다.',
            expect: 'B(파랑) 채널: 크기 640x480, 채널 수 1, 평균 115.5\nG(초록) 채널: 크기 640x480, 채널 수 1, 평균 119.0\nR(빨강) 채널: 크기 640x480, 채널 수 1, 평균 120.9\n빨간 원 (120,110): Vec3b=[37, 37, 196] / 채널별=(37,37,196)\nextractChannel(img, r, 2) 평균 120.9' },
          { type: 'code', title: '예제 4: 한 채널을 0 으로 만든 뒤 다시 merge', code: EX_MERGE,
            desc: 'R 채널을 <code>setTo(0)</code> 으로 지운 뒤 합치면 빨간 원이 <b>검게</b> 변하고 결과 영상의 R 평균이 0 이 됩니다. 원본 <code>img</code> 는 그대로입니다 — <code>split</code> 이 채널 값을 <b>새 메모리로 복사</b>하기 때문입니다. 마지막의 <code>merge({ ch[2], ch[1], ch[0] })</code> 는 순서를 뒤집어 <b>BGR → RGB</b> 를 만든 것과 같습니다 — 결과 창에서 보면 빨강과 파랑이 서로 바뀐 것처럼 보입니다.',
            expect: 'R 제거 후 (120,110) = [37, 37, 0]\n원본 (120,110)      = [37, 37, 196]\n원본 평균 BGR = 115.5, 119.0, 120.9\n결과 평균 BGR = 115.5, 119.0, 0.0' },
          { type: 'callout', kind: 'tip', title: 'C++ 에서는 해제를 신경 쓰지 않아도 된다', html: '<code>split</code> 은 <b>새 Mat 3개</b>를 만들지만, <code>Mat</code> 은 참조 계수로 메모리를 관리하므로 <code>vector&lt;Mat&gt; ch</code> 가 범위를 벗어나면(또는 다음 <code>split</code> 이 덮어쓰면) 자동으로 해제됩니다 — <code>delete</code> 나 <code>release()</code> 가 필요 없습니다. 카메라 반복처럼 매 프레임 split 할 때는 <code>vector&lt;Mat&gt; ch;</code> 를 <b>반복문 밖에</b> 두면, 크기가 같을 때 메모리를 다시 할당하지 않아 더 빠릅니다.' },
          { type: 'h', text: 'Gray → BGR: 색은 돌아오지 않지만 색을 그릴 수 있다' },
          { type: 'p', html: '흑백 영상(1채널)에는 <b>색을 그릴 수 없습니다</b> — 값이 하나뿐이니까요. <code>COLOR_GRAY2BGR</code> 로 3채널로 바꾸면 B = G = R 인 회색 영상이 되고, 그 위에 빨간 사각형 · 노란 글자를 그릴 수 있습니다. 검사 결과를 표시하는 화면에서 아주 자주 쓰는 방법입니다(04차시).' },
          { type: 'code', title: '예제 5: 흑백 배경 + 컬러 오버레이', code: EX_OVERLAY,
            desc: 'ROI 로 일부만 원본 컬러를 덮어써서 "관심 영역만 컬러" 효과를 냈습니다. <code>canvas(roi)</code> 는 <b>복사가 아니라 창</b>(03차시)이므로 여기에 <code>copyTo</code> 하면 <code>canvas</code> 가 바뀝니다 — 크기 · 형식이 같아 새로 할당되지 않기 때문입니다. 12차시에서는 이 방식으로 불량 부품만 빨간 테두리로 표시합니다.',
            expect: 'gray 채널 1 -> canvas 채널 3\n(120,110) canvas = [85, 85, 85] (B=G=R)\n강조 후 (120,110) = [37, 37, 196]' },
          { type: 'table', head: ['ColorConversionCodes', '뜻', '입력 → 출력 채널'], rows: [
            ['<code>COLOR_BGR2GRAY</code>', '컬러 → 흑백 (가중 평균)', '3 → 1'],
            ['<code>COLOR_GRAY2BGR</code>', '흑백 → 3채널 (B=G=R)', '1 → 3'],
            ['<code>COLOR_BGR2RGB</code>', '채널 순서 뒤집기', '3 → 3'],
            ['<code>COLOR_BGR2HSV</code>', '색상 · 채도 · 명도 (2교시)', '3 → 3'],
            ['<code>COLOR_BGR2Lab</code>', '밝기 L 과 색 a · b 분리', '3 → 3'],
            ['<code>COLOR_BGR2BGRA</code>', '투명도(알파) 채널 추가', '3 → 4']
          ], caption: '표 2. 자주 쓰는 색 변환 코드 — Python 의 <code>cv2.COLOR_BGR2GRAY</code> 와 이름이 같다 (<code>cv::</code> 네임스페이스)' },
          { type: 'callout', kind: 'tip', title: 'imread 로 바로 흑백 읽기', html: '처음부터 흑백만 필요하면 <code>imread("a.png", IMREAD_GRAYSCALE)</code> 로 읽는 것이 빠르고 메모리도 1/3 입니다. 반대로 <code>IMREAD_COLOR</code>(기본값)는 흑백 PNG 도 <b>3채널로</b> 읽어 옵니다(B=G=R). 예제에서 채널 수가 예상과 다르면 <code>imread</code> 의 두 번째 인수를 먼저 확인하세요.' }
        ],
        practice: [
          {
            title: 'BGR → RGB 로 뒤집어 확인하기', level: 1,
            desc: '<code>split</code> 으로 채널을 나눈 뒤 <b>순서를 뒤집어</b> <code>merge</code> 하세요. 같은 픽셀 (120, 110) 의 값이 <code>[196, 37, 37]</code> 처럼 뒤집혀야 합니다. 마지막으로 <code>cvtColor(..., COLOR_BGR2RGB)</code> 결과와 같은지 확인하세요.',
            hint: '<code>vector&lt;Mat&gt; rev = { ch[2], ch[1], ch[0] }; merge(rev, rgb);</code> — 순서만 바꾸면 됩니다. 비교는 <code>absdiff(rgb, rgb2, diff);</code> 후 <code>countNonZero(diff.reshape(1))</code> — <code>countNonZero</code> 는 1채널만 받으므로 <code>reshape(1)</code> 로 3채널을 1채널(폭 3배)로 펼칩니다.',
            expect: '원본 (120,110)   = [37, 37, 196]\n뒤집기 (120,110) = [196, 37, 37]\ncvtColor(BGR2RGB) 결과와 다른 값 개수 = 0',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png");
    cout << "원본 (120,110)   = " << img.at<Vec3b>(110, 120) << endl;

    vector<Mat> ch;
    split(img, ch);
    Mat rgb;
    // TODO: ch 의 순서를 뒤집어 merge 로 rgb 를 만드세요

    // TODO: rgb 의 같은 픽셀 값을 출력하고, cvtColor(BGR2RGB) 결과와 다른 값 개수를 출력하세요

    imshow("img", img);
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png");
    cout << "원본 (120,110)   = " << img.at<Vec3b>(110, 120) << endl;

    vector<Mat> ch;
    split(img, ch);
    Mat rgb;
    vector<Mat> rev = { ch[2], ch[1], ch[0] };
    merge(rev, rgb);
    cout << "뒤집기 (120,110) = " << rgb.at<Vec3b>(110, 120) << endl;

    Mat rgb2, diff;
    cvtColor(img, rgb2, COLOR_BGR2RGB);
    absdiff(rgb, rgb2, diff);
    cout << "cvtColor(BGR2RGB) 결과와 다른 값 개수 = " << countNonZero(diff.reshape(1)) << endl;

    imshow("rgb", rgb);
    waitKey(0);
    return 0;
}`
          },
          {
            title: '어느 채널이 파란 삼각형을 가장 잘 드러내나', level: 2,
            desc: '세 채널의 <b>평균 · 표준편차</b>를 구하고, 파란 삼각형 픽셀 (130, 300) 과 트레이 배경 (350, 60) 의 <b>차이(물체 − 배경)</b>를 채널별로 출력하세요. 마지막에 차이의 <b>절댓값이 가장 큰 채널</b>을 찾아 출력하세요 — 그 채널이 파란 물체를 골라내기에 가장 좋은 채널입니다. 부호도 함께 보세요 — 부호가 − 이면 그 채널에서 물체가 배경보다 <b>어둡다</b>(이진화할 때 <code>THRESH_BINARY_INV</code>)는 뜻입니다.',
            hint: '<code>Scalar m, sd; meanStdDev(ch[i], m, sd);</code> 로 평균과 표준편차를 한 번에 얻습니다(<code>m[0]</code>, <code>sd[0]</code>). 차이는 <code>(int)ch[i].at&lt;uchar&gt;(300, 130) - (int)ch[i].at&lt;uchar&gt;(60, 350)</code> — <code>abs</code> 로 크기를 비교하세요.',
            expect: 'B 채널: 평균 115.5 표준편차 42.7 | 삼각형 187 - 배경 143 = 44\nG 채널: 평균 119.0 표준편차 41.7 | 삼각형 84 - 배경 145 = -61\nR 채널: 평균 120.9 표준편차 48.3 | 삼각형 28 - 배경 148 = -120\n절댓값이 가장 큰 채널 = R (-120): 파란 물체는 이 채널에서 배경보다 어둡다',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png");
    vector<Mat> ch;
    split(img, ch);
    const char* names[3] = { "B", "G", "R" };
    for (int i = 0; i < 3; i++)
    {
        // TODO: meanStdDev 로 평균 · 표준편차를 구해 출력하세요

        // TODO: 파란 삼각형 (130,300) 과 배경 (350,60) 의 값 차이를 출력하세요
        cout << names[i] << " 채널" << endl;
    }
    // TODO: 차이의 절댓값이 가장 큰 채널을 출력하세요
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
#include <cstdlib>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png");
    vector<Mat> ch;
    split(img, ch);
    const char* names[3] = { "B", "G", "R" };
    int best = 0, bestDiff = 0;
    for (int i = 0; i < 3; i++)
    {
        Scalar m, sd;
        meanStdDev(ch[i], m, sd);
        int tri = ch[i].at<uchar>(300, 130);
        int bg = ch[i].at<uchar>(60, 350);
        cout << format("%s 채널: 평균 %.1f 표준편차 %.1f | 삼각형 %d - 배경 %d = %d",
                       names[i], m[0], sd[0], tri, bg, tri - bg) << endl;
        if (abs(tri - bg) > abs(bestDiff)) { best = i; bestDiff = tri - bg; }
    }
    cout << "절댓값이 가장 큰 채널 = " << names[best] << " (" << bestDiff << ")"
         << (bestDiff < 0 ? ": 파란 물체는 이 채널에서 배경보다 어둡다" : ": 배경보다 밝다") << endl;
    return 0;
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: '색 공간 (1) BGR 채널과 흑백 변환', subtitle: '컬러 영상은 숫자판 세 장', notes: '<p>💬 “빨간 사과와 파란 컵을 흑백 사진으로 찍으면 구별할 수 있을까요?” — 오늘 첫 예제에서 빨강 85, 파랑 79 라는 결과로 직접 확인합니다. 이 차시의 목표: 색을 숫자로 다루기. (2분)</p>' },
          { layout: 'image', title: '오늘의 재료: sample_color.png', src: 'images/sample_color.png', caption: '회색 트레이 위 7색 부품 10개 — 빨강 2 · 초록 2 · 파랑 2 · 노랑 · 보라 · 청록 · 주황', notes: '<p>결과 창에서 마우스를 올려 픽셀 값을 보여 줍니다. 💬 “빨간 원 위의 값이 (37, 37, 196) 인데 어느 것이 빨강일까요?” — 세 번째. BGR 순서를 여기서 각인시킵니다. (3분)</p>' },
          { layout: 'diagram', title: '컬러 Mat 의 메모리 배치', html: FIG_CHANNELS, caption: '픽셀마다 B G R 3바이트가 이어진다 → split 으로 1채널 3장, merge 로 되돌리기', notes: '<p>03차시의 “행 × 열 표” 그림과 이어서 설명합니다. 핵심: ① 픽셀 하나 = 3바이트(<code>Vec3b</code>) ② split 결과는 <b>크기가 같은</b> 1채널 3장(<code>vector&lt;Mat&gt;</code>) ③ merge 는 vector 순서대로 넣는다. 💬 “split 결과를 화면에 띄우면 무슨 색으로 보일까?” — 흑백. (5분)</p>' },
          { layout: 'code', title: '예제: 픽셀의 B · G · R 읽기', code: S_PIXEL, points: ['<code>at&lt;Vec3b&gt;(y, x)</code> — (행, 열) 순서', '<code>[0]</code>=B, <code>[1]</code>=G, <code>[2]</code>=R', '<code>uchar</code> 는 <code>(int)</code> 로 바꿔 출력', '세 값이 비슷하면 무채색(회색)'], notes: '<p>실행하고 값을 읽어 줍니다. 빨간 원 (37, 37, 196) / 트레이 (143, 145, 148). 💬 “트레이는 왜 세 값이 거의 같을까?” — 회색이니까. <code>(int)</code> 를 지우면 글자가 깨져 나오는 것도 한 번 보여 줍니다. 학생들에게 좌표를 바꿔 다른 부품 값을 찍어 보게 합니다(초록 사각형 270,120). (7분)</p>' },
          { layout: 'diagram', title: 'Gray = 0.299R + 0.587G + 0.114B', html: FIG_GRAY, caption: '사람 눈의 민감도를 반영한 가중 평균 — 계수의 합은 1', notes: '<p>왜 단순 평균이 아닌지 설명합니다: 눈은 초록에 민감, 파랑에 둔감. 계수 3개를 외우게 하지는 말고 “G 가 가장 크다”만 기억시킵니다. 💬 “(R+G+B)/3 로 하면 무엇이 이상해질까?” — 파란 하늘이 너무 밝아진다. (5분)</p>' },
          { layout: 'code', title: '예제: 공식 vs cvtColor', code: S_GRAY, points: ['<code>COLOR_BGR2GRAY</code> → 1채널 <code>CV_8UC1</code>', '공식 84.5 · cvtColor 85 (반올림 차이)', '빨강 85 와 파랑 79 — 흑백에서는 거의 같다!'], notes: '<p>여기가 이 교시의 핵심 장면입니다. 두 색의 Gray 값이 겹친다는 사실에서 “그러면 색으로 구분해야 한다” → 2교시 HSV 예고. 💬 “흑백 카메라로 빨강/파랑 부품을 분류할 수 있을까?” — 어렵다. (7분)</p>' },
          { layout: 'table', title: '색별 BGR 과 Gray', head: ['부품', 'B', 'G', 'R', 'Gray'], rows: [
            ['빨간 원', '37', '37', '196', '<b>85</b>'],
            ['파란 삼각형', '187', '84', '28', '<b>79</b>'],
            ['초록 사각형', '58', '169', '58', '123'],
            ['노란 육각형', '38', '198', '220', '188'],
            ['트레이', '143', '145', '148', '145']
          ], lead: '표의 빨강 · 파랑 줄을 비교해 보세요', notes: '<p>표를 보며 계산을 한 번 더 확인합니다. 노란 육각형이 가장 밝은 이유(R + G 둘 다 큼)를 물어봅니다. 💬 “가장 어두운 색은?” — 파랑. (3분)</p>' },
          { layout: 'code', title: '예제: split → 채널 보기 → merge', code: S_SPLIT, points: ['<code>split(img, ch)</code> → <code>vector&lt;Mat&gt;</code> 3장 (1채널)', 'split 결과는 <b>복사본</b> — 바꿔도 원본은 그대로', '<code>setTo(0)</code> 으로 채널 하나 지우기 → <code>merge</code>', '해제는 자동 (참조 계수)'], notes: '<p>B 채널을 지우면 파란 삼각형이 검게, 노란 육각형은 거의 그대로(B 가 작으니까) 남습니다. 💬 “R 을 지우면 어떤 부품이 사라질까?” — 빨간 원 · 주황 막대. 학생들이 직접 채널 번호를 바꿔 실행하게 합니다. 채널 하나만 필요하면 <code>extractChannel</code> 도 있다고 덧붙입니다. (8분)</p>' },
          { layout: 'code', title: '예제: 흑백 위에 컬러 오버레이', code: S_OVERLAY, points: ['1채널에는 색을 그릴 수 없다', '<code>COLOR_GRAY2BGR</code> → B=G=R 3채널', 'ROI 창(<code>canvas(roi)</code>)에 copyTo 하면 그 부분만 컬러', '검사 결과 표시의 기본 기법'], notes: '<p>“색 정보가 되살아나는 것은 아니다”를 분명히 합니다(정보는 이미 버려졌다). 결과 창에서 노란 테두리가 그려지는 것을 보여 주고, 12차시의 불량 표시 화면을 예고합니다. (5분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: 'BGR = (37, 37, 196) 인 빨간 픽셀의 Gray 값은 약 얼마?', options: ['약 37', '약 85', '약 196', '약 255'], answer: 1, explain: '0.299×196 + 0.587×37 + 0.114×37 = 84.5 → 85. R 이 커도 계수가 0.299 뿐입니다.', notes: '<p>정답 2번. 계산을 칠판에 한 줄로 적어 보여 줍니다. 196 × 0.3 ≈ 59 라는 어림 계산만으로도 답이 나온다는 것을 알려 줍니다.</p>' },
          { layout: 'practice', title: '실습: BGR → RGB 뒤집기', desc: '<p><code>split</code> 으로 나눈 vector 의 <b>순서를 바꿔</b> <code>merge</code> 하세요.</p><ul><li>(120, 110) 값이 <code>[196, 37, 37]</code> 로 뒤집혀야 한다</li><li><code>cvtColor(COLOR_BGR2RGB)</code> 결과와 같은지 비교</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png");
    vector<Mat> ch;
    split(img, ch);
    Mat rgb;
    // TODO: 순서를 뒤집어 merge 하고 (120,110) 값을 출력

    imshow("img", img);
    waitKey(0);
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png");
    vector<Mat> ch;
    split(img, ch);
    Mat rgb;
    vector<Mat> rev = { ch[2], ch[1], ch[0] };
    merge(rev, rgb);
    cout << rgb.at<Vec3b>(110, 120) << endl;
    imshow("rgb", rgb);
    waitKey(0);
    return 0;
}`, notes: '<p>결과 창에서 빨간 원이 파랗게, 파란 삼각형이 빨갛게 보이는 것을 함께 확인합니다. 이것이 “다른 라이브러리에 넘겼더니 색이 뒤집혀 보이는” 흔한 버그의 정체라고 알려 줍니다. (7분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['컬러 Mat = <code>CV_8UC3</code>, 픽셀마다 <b>B G R</b> 3바이트', '<code>at&lt;Vec3b&gt;(y, x)</code> 의 <code>[0]/[1]/[2]</code> = B/G/R (출력은 <code>(int)</code>)', 'Gray = <b>0.299R + 0.587G + 0.114B</b> — 빨강과 파랑의 밝기가 겹칠 수 있다', '<code>split</code> → <code>vector&lt;Mat&gt;</code> 1채널 3장(복사본) · <code>merge</code> → 합치기 · <code>extractChannel</code>', '<code>COLOR_GRAY2BGR</code> 로 3채널을 만들면 흑백 위에 컬러로 그릴 수 있다', '다음 교시: 색을 다루기 쉬운 <b>HSV</b> 와 <code>inRange</code> 색 검출'], notes: '<p>여섯 줄을 학생들이 읽게 합니다. 다음 시간 예고: “빨강만 골라내는 프로그램을 3줄로 만든다.” (2분)</p>' }
        ]
      },
      {
        id: 'cv05-2', title: 'HSV 와 색 검출 (inRange)', minutes: 50,
        goals: ['HSV 의 H · S · V 뜻과 OpenCV 의 값 범위를 설명할 수 있다', 'inRange 로 색 마스크를 만들고 빨강의 두 구간을 bitwise_or 로 합칠 수 있다', '색 마스크로 개수를 세고(connectedComponentsWithStats) 해당 색만 남기는 프로그램을 쓸 수 있다'],
        flow: [['도입: BGR 로 색 고르기의 어려움', 7], ['HSV 와 inRange', 16], ['색별 개수 세기 실습', 19], ['정리 · 퀴즈', 8]],
        content: [
          { type: 'h', text: 'BGR 로 "빨강"을 고르기 어려운 이유' },
          { type: 'p', html: '"빨간 부품만 찾아라"를 BGR 로 쓰면 <code>R &gt; 150 &amp;&amp; G &lt; 80 &amp;&amp; B &lt; 80</code> 같은 조건이 됩니다. 그런데 조명이 조금 어두워지면 R 이 120 으로 떨어져 검출이 실패하고, 반대로 밝으면 흰색까지 빨강으로 잡힙니다. <b>색(빨강이라는 성질)과 밝기가 세 값에 뒤섞여 있기 때문</b>입니다. 그래서 <b>색 · 진하기 · 밝기를 따로 떼어 놓은</b> 좌표계가 필요합니다 — 그것이 HSV 입니다.' },
          { type: 'image', src: 'images/color_caps.png', caption: 'images/color_caps.png — 어두운 컨베이어 위 병뚜껑 20개 (빨강 5 · 초록 4 · 파랑 3 · 노랑 6 · 흰색 2). 이 차시의 목표는 이 개수를 자동으로 세는 것' },
          { type: 'figure', html: FIG_HSV, caption: '그림 3. HSV 원기둥 — 둘레 각도 H(색상), 중심에서의 거리 S(채도), 높이 V(명도)' },
          { type: 'table', head: ['성분', '뜻', 'OpenCV 8비트 범위', '메모'], rows: [
            ['<b>H</b> (Hue)', '색상 — 빨강 · 노랑 · 초록 … 색상환의 각도', '<b>0 ~ 179</b>', '360° ÷ 2 (8비트에 담기 위해)'],
            ['<b>S</b> (Saturation)', '채도 — 색이 진한 정도', '0 ~ 255', '0 = 무채색(회색), 255 = 순색'],
            ['<b>V</b> (Value)', '명도 — 밝은 정도', '0 ~ 255', '0 = 검정. 조명 변화는 주로 여기에']
          ], caption: '표 3. <code>cvtColor(img, hsv, COLOR_BGR2HSV)</code> 의 결과 값 범위' },
          { type: 'code', title: '예제 1: 뚜껑 색의 HSV 값 보기', code: EX_HSV,
            desc: '빨강 H=0, 노랑 H=25, 초록 H=62, 파랑 H=108 — <b>색마다 H 값이 확실히 다릅니다</b>. 반면 흰 뚜껑은 S=5 로 채도가 거의 없어 H(=90)에는 의미가 없습니다. 어두운 배경은 V=34 로 아주 작습니다. 이 숫자들이 다음 예제의 inRange 범위를 정하는 근거입니다. <code>format</code> 의 <code>%3d</code> 에는 <code>uchar</code> 를 그대로 넘겨도 됩니다(가변 인수에서 int 로 승격).',
            expect: '  B   G   R  |   H   S   V\n 41  40 198  |   0 203 198  빨강 뚜껑\n 59 159  51  |  62 173 159  초록 뚜껑\n191  92  30  | 108 215 191  파랑 뚜껑\n 39 195 226  |  25 211 226  노랑 뚜껑\n225 225 221  |  90   5 225  흰 뚜껑\n 30  30  34  |   0  30  34  배경' },
          { type: 'callout', kind: 'warn', title: 'H 는 0~179 입니다', html: '그림판 · 포토샵 · 웹 CSS 는 H 를 <b>0~360</b> 으로 씁니다. OpenCV 는 8비트에 담으려고 <b>절반(0~179)</b> 으로 씁니다. 인터넷에서 찾은 "초록은 H 120" 같은 값을 그대로 쓰면 범위를 벗어나므로 <b>÷2</b> 를 해서 60 으로 바꿔야 합니다. (<code>CV_32F</code> 영상을 변환하면 0~360 을 쓰고, <code>COLOR_BGR2HSV_FULL</code> 은 0~255 로 늘려 씁니다. 수업에서는 8비트 기본값을 씁니다.)' },
          { type: 'h', text: 'inRange: 범위 안이면 255, 밖이면 0' },
          { type: 'p', html: '<code>inRange(src, lowerb, upperb, dst)</code> 는 <b>세 채널 모두</b> 범위 안에 들어오는 픽셀만 255(흰색), 나머지는 0(검정)으로 만든 <b>1채널 마스크</b>(<code>CV_8UC1</code>)를 만듭니다. HSV 로 바꾼 뒤 <code>Scalar(H최소, S최소, V최소)</code> ~ <code>Scalar(H최대, S최대, V최대)</code> 를 주면 그것이 곧 "이 색 찾기"입니다. 흰 덩어리의 개수 · 면적 · 중심은 <code>connectedComponentsWithStats</code> 가 한 번에 알려 줍니다(12차시에서 자세히).' },
          { type: 'code', title: '예제 2: 초록 마스크 만들고 개수 세기', code: EX_INRANGE,
            desc: '초록 뚜껑 4개의 중심 좌표까지 정확히 나옵니다(정답: 초록 4개). <code>connectedComponentsWithStats</code> 는 라벨 수를 돌려주고, <code>stats</code>(<code>CV_32S</code>, 행 = 라벨)에 <code>CC_STAT_LEFT · TOP · WIDTH · HEIGHT · AREA</code> 를, <code>centroids</code>(<code>CV_64F</code>)에 중심 (x, y) 를 채워 줍니다. <b>0번 라벨은 배경</b>이므로 1번부터 돌고, 잡티를 걸러 내려고 <code>면적 300 이상</code> 조건을 넣었습니다 — 뚜껑 하나의 면적은 약 2500 px 입니다.',
            expect: '마스크 형식 CV_8UC1, 흰 픽셀 10063 / 전체 307200\n  #1 면적 2520 중심 (119, 130)\n  #2 면적 2516 중심 (265, 383)\n  #3 면적 2511 중심 (522, 424)\n  #4 면적 2516 중심 (190, 434)\n초록 뚜껑 4 개' },
          { type: 'callout', kind: 'tip', title: 'S · V 의 아래 한계가 중요하다', html: '<code>Scalar(40, 100, 70)</code> 의 <b>100</b> 과 <b>70</b> 이 핵심입니다. S 의 아래 한계(100)는 <b>회색 배경</b>을 걸러 주고, V 의 아래 한계(70)는 <b>어두운 그림자</b>를 걸러 줍니다. 두 값을 0 으로 바꿔 실행해 보면 마스크가 온통 흰색으로 번지는 것을 볼 수 있습니다 — 색 검출이 실패하면 거의 항상 S · V 의 아래 한계를 조절해서 해결합니다.' },
          { type: 'h', text: '빨강은 구간이 둘이다' },
          { type: 'figure', html: FIG_HUE, caption: '그림 4. H 축과 색 구간 — 색상환이 둥글어서 빨강만 양쪽 끝(0~10, 170~179)에 걸린다' },
          { type: 'code', title: '예제 3: 두 구간 마스크를 bitwise_or 로 합치기', code: EX_RED,
            desc: '이 영상에서는 빨강의 대부분이 H ≈ 0 쪽에 있고 위 구간에는 조금만 걸쳐 있어 개수 결과는 같습니다. 하지만 <b>조명 색온도가 조금 바뀌거나 자홍빛 조명을 쓰면</b> 빨강의 H 가 175 쪽으로 밀려 아래 구간만으로는 하나도 못 찾을 수 있습니다. 그래서 빨강은 <b>습관적으로 두 구간을 OR</b> 하는 것이 안전합니다. <code>bitwise_or</code> 는 두 마스크 중 하나라도 흰 곳을 흰색으로 만듭니다. 개수 세기는 <code>countBlobs</code> 함수로 떼어 내 재사용했습니다.',
            expect: '아래 구간 12821 px + 위 구간 106 px = OR 12927 px\n아래 구간만 쓰면 5 개, 두 구간 OR 이면 5 개' },
          { type: 'h', text: '색별로 개수 세기 (검사 프로그램의 기본형)' },
          { type: 'code', title: '예제 4: 5색 병뚜껑 개수 세기', code: EX_COUNT,
            desc: '정답(빨강 5 · 초록 4 · 파랑 3 · 노랑 6 · 흰색 2 = 20개)과 정확히 일치합니다. 색마다 <b>범위 표(lo · hi 배열)</b>를 두고 같은 처리를 반복하는 구조에 주목하세요 — 실제 검사 장비 프로그램도 이렇게 색 규격을 표(또는 설정 파일)로 관리합니다. 흰색은 H 를 전부 열어 두고(<code>0~179</code>) <b>S ≤ 40, V ≥ 180</b> 으로 잡았습니다. <code>format("%-7s", …)</code> 에는 <code>string</code> 이 아니라 <code>c_str()</code> 을 넘겨야 합니다.',
            expect: 'red     5 개\nyellow  6 개\ngreen   4 개\nblue    3 개\nwhite   2 개\n합계 20 개' },
          { type: 'callout', kind: 'warn', title: '흰색 · 검정 · 회색은 H 로 찾을 수 없다', html: '무채색은 채도 S 가 거의 0 이라 H 값이 <b>잡음처럼 아무 값</b>이나 나옵니다(예제 1 의 흰 뚜껑 H=90 은 우연입니다). 따라서 흰색은 <code>S 작고 V 큼</code>, 검정은 <code>V 작음</code>, 회색은 <code>S 작고 V 중간</code> 으로 판정하세요. 색 검사에서 "흰색만 자꾸 엉뚱하게 잡힌다"는 문제는 대부분 이것 때문입니다.' },
          { type: 'h', text: '마스크로 그 색만 남기기' },
          { type: 'code', title: '예제 5: bitwise_and 로 노란 뚜껑만 남기기', code: EX_BITAND,
            desc: '<code>bitwise_and(img, img, only, mask)</code> 는 <b>마스크가 흰 픽셀만 원본에서 복사</b>하고 나머지는 0 으로 둡니다(같은 영상을 두 번 넘기는 관용적 표현 — <code>img.copyTo(only, mask)</code> 와 같은 결과). <code>mean(img, mask)</code> 처럼 <b>마스크를 준 평균</b>은 그 색 영역의 평균색을 알려 주므로, 색 규격을 정할 때 아주 유용합니다. <code>bitwise_not</code> 으로 반전하면 "그 색을 뺀 나머지"가 됩니다.',
            expect: '노랑 픽셀 15579 px\n원본 평균(B) 49.2, 노랑만 남긴 영상 평균(B) 1.9\n마스크 안 평균색 BGR = 38, 179, 205\n반전 마스크 흰 픽셀 291621 px' },
          { type: 'h', text: '조명이 바뀌어도 되는 이유 · Lab 색 공간' },
          { type: 'code', title: '예제 6: 조명을 55% 로 줄여도 같은 범위로 검출', code: EX_LIGHT,
            desc: '밝기를 55% 로 줄였는데도 빨강 뚜껑의 <b>H 는 0 그대로, S 도 거의 그대로</b>이고 V 만 크게 떨어집니다. 그래서 <b>같은 H · S 범위</b>로 5개가 그대로 검출됩니다(V 의 아래 한계만 50 으로 조금 낮췄습니다). 만약 BGR 조건(<code>R &gt; 150</code>)을 썼다면 R 이 약 109 로 떨어져 전부 놓쳤을 것입니다. <code>convertScaleAbs(src, dst, alpha, beta)</code> 는 <code>|alpha·src + beta|</code> 를 8비트로 저장합니다(06차시).',
            expect: '원본 평균(B) 49.2 -> 어두운 영상 27.1\n원본: 빨강 뚜껑 HSV=[0, 203, 198] -> 같은 H 범위로 5 개\n55% 조명: 빨강 뚜껑 HSV=[0, 204, 109] -> 같은 H 범위로 5 개\nLab 빨강 뚜껑: L=112 a=188 b=168' },
          { type: 'callout', kind: 'more', title: 'Lab 색 공간 — 색 차이를 재고 싶을 때', html: '<code>COLOR_BGR2Lab</code> 은 <b>L</b>(밝기 0~255) 과 <b>a</b>(초록↔빨강), <b>b</b>(파랑↔노랑) 로 나눕니다. HSV 처럼 밝기를 분리하면서, 두 색 사이 거리 √((ΔL)² + (Δa)² + (Δb)²) 가 <b>사람이 느끼는 색 차이에 비례</b>한다는 장점이 있습니다. 그래서 색 규격 관리 · 화이트밸런스 · ΔE 색차 계산에는 Lab 을, 단순한 색 검출에는 HSV 를 씁니다. (8비트 Lab 은 a · b 에 128 이 더해져 저장되므로 128 이 중립입니다.)' },
          { type: 'h', text: 'Visual Studio 에서: 트랙바로 색 범위 조절 도구 만들기' },
          { type: 'code', title: '추가: 트랙바로 HSV 범위를 실시간 조절 (로컬 전용)', code: EX_TRACKBAR, run: false, local: true, file: 'main.cpp',
            desc: '색 범위는 현장 조명에 따라 조금씩 바꿔야 합니다. highgui 의 <b>트랙바</b>(<code>createTrackbar</code> · <code>getTrackbarPos</code>)로 H · S · V 하한/상한을 움직이며 마스크를 보면, 몇 초 만에 알맞은 범위를 찾을 수 있습니다. 값 포인터 대신 <code>nullptr</code> 를 주고 <code>getTrackbarPos</code> 로 읽는 방식이 최신 OpenCV 에서 권장됩니다. 브라우저에서는 트랙바가 동작하지 않으므로 예제 2 의 <code>Scalar</code> 값을 직접 바꿔 실행하세요 — 같은 처리입니다.' },
          { type: 'callout', kind: 'tip', teacher: true, title: '오개념 지도 · 평가 포인트', html: '<ul><li>가장 흔한 오개념: <b>“H 는 0~360”</b> → 인터넷 값을 ÷2. 실습 중 마스크가 비면 먼저 이것을 확인시킵니다.</li><li>두 번째: <b>“inRange 는 색만 본다”</b> → S · V 의 아래 한계가 배경/그림자를 거른다는 것을 강조.</li><li>세 번째: <b>“흰색도 H 로 찾는다”</b> → 무채색은 S 로 판정.</li><li>C++ 특유의 실수: <code>stats.at&lt;int&gt;</code> 대신 <code>at&lt;double&gt;</code>, <code>centroids.at&lt;int&gt;</code> 처럼 <b>형식을 잘못 읽는 것</b>(stats = CV_32S, centroids = CV_64F), 0번(배경) 라벨을 세는 것.</li><li>평가 루브릭(3점): ① 색별 개수가 정답과 일치(1) ② 빨강을 두 구간으로 처리(1) ③ 면적 조건으로 잡티를 걸러 냄(1).</li><li>💬 마무리 발문: “조명이 노랗게 변하는 공장에서 흰 뚜껑과 노란 뚜껑을 어떻게 구분할까?” — S 값 비교 · 화이트밸런스 보정(Lab) 이야기로 연결.</li></ul>' }
        ],
        practice: [
          {
            title: '노란 뚜껑만 세기', level: 1,
            desc: 'HSV 로 바꾼 뒤 <b>노랑(H 20~35)</b> 마스크를 만들고, 면적 300 이상인 덩어리 개수를 출력하세요. 정답은 <b>6개</b>입니다. 개수가 맞으면 H 범위를 <code>15~40</code> 으로 넓혀 보고 주황빛 잡티가 섞이는지 확인해 보세요.',
            hint: '<code>inRange(hsv, Scalar(20, 100, 70), Scalar(35, 255, 255), mask);</code> 다음에 <code>connectedComponentsWithStats(mask, labels, stats, centroids)</code> 로 라벨 수를 얻고, <code>i = 1</code> 부터 <code>stats.at&lt;int&gt;(i, CC_STAT_AREA) &gt;= 300</code> 인 것을 셉니다.',
            expect: '마스크 흰 픽셀 15579\n노란 뚜껑 6 개',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/color_caps.png");
    Mat hsv, mask = Mat::zeros(img.size(), CV_8UC1);
    cvtColor(img, hsv, COLOR_BGR2HSV);
    // TODO: 노랑(H 20~35) 마스크를 만드세요

    // TODO: connectedComponentsWithStats 로 면적 300 이상 덩어리 수를 세어 출력하세요
    cout << "마스크 흰 픽셀 " << countNonZero(mask) << endl;   // 아직 0 입니다
    imshow("input", img);            // 마스크를 만들었으면 mask 로 바꿔 보세요
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/color_caps.png");
    Mat hsv, mask;
    cvtColor(img, hsv, COLOR_BGR2HSV);
    inRange(hsv, Scalar(20, 100, 70), Scalar(35, 255, 255), mask);

    Mat labels, stats, centroids;
    int nLabels = connectedComponentsWithStats(mask, labels, stats, centroids);
    int n = 0;
    for (int i = 1; i < nLabels; i++)
        if (stats.at<int>(i, CC_STAT_AREA) >= 300) n++;
    cout << "마스크 흰 픽셀 " << countNonZero(mask) << endl;
    cout << "노란 뚜껑 " << n << " 개" << endl;
    imshow("mask", mask);
    waitKey(0);
    return 0;
}`
          },
          {
            title: '흰 뚜껑 찾아 표시하기', level: 2,
            desc: '흰 뚜껑 <b>2개</b>를 찾아 중심 좌표를 출력하고, 원본 영상에 <code>circle</code> 로 표시해 보여 주세요. 흰색은 <b>채도 S 가 작고 명도 V 가 큰</b> 픽셀입니다 — H 는 전부(0~179) 열어 둡니다.',
            hint: '<code>inRange(hsv, Scalar(0, 0, 180), Scalar(179, 40, 255), mask);</code> 로 시작해 보세요. S 상한(40)을 80 으로 올리면 무엇이 섞이는지도 확인해 보세요. 중심은 <code>centroids.at&lt;double&gt;(i, 0)</code>(x) · <code>(i, 1)</code>(y), 표시는 <code>circle(img, Point(cx, cy), 34, Scalar(0, 0, 255), 2);</code>.',
            expect: '흰 뚜껑 #1 중심 (581, 69) 면적 2112\n흰 뚜껑 #2 중심 (423, 226) 면적 2230\n흰 뚜껑 2 개',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/color_caps.png");
    Mat hsv, mask;
    cvtColor(img, hsv, COLOR_BGR2HSV);
    // TODO: 흰색 조건(S 작고 V 큼)으로 마스크를 만드세요

    // TODO: 덩어리를 돌면서 중심 좌표를 출력하고 img 에 원을 그리세요
    imshow("result", img);
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/color_caps.png");
    Mat hsv, mask;
    cvtColor(img, hsv, COLOR_BGR2HSV);
    inRange(hsv, Scalar(0, 0, 180), Scalar(179, 40, 255), mask);

    Mat labels, stats, centroids;
    int nLabels = connectedComponentsWithStats(mask, labels, stats, centroids);
    int n = 0;
    for (int i = 1; i < nLabels; i++)
    {
        int area = stats.at<int>(i, CC_STAT_AREA);
        if (area < 300) continue;
        n++;
        int cx = (int)centroids.at<double>(i, 0), cy = (int)centroids.at<double>(i, 1);
        cout << "흰 뚜껑 #" << n << " 중심 (" << cx << ", " << cy << ") 면적 " << area << endl;
        circle(img, Point(cx, cy), 34, Scalar(0, 0, 255), 2);
    }
    cout << "흰 뚜껑 " << n << " 개" << endl;
    imshow("result", img);
    waitKey(0);
    return 0;
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: '색 공간 (2) HSV 와 색 검출', subtitle: 'inRange 로 “빨강만 찾기”', notes: '<p>1교시 결론(빨강 85, 파랑 79 — 흑백으로는 구분 불가)을 상기시키며 시작합니다. 💬 “컨베이어 위 병뚜껑을 색별로 세는 프로그램, 몇 줄이면 될까요?” — 오늘 30줄 남짓으로 만듭니다. (2분)</p>' },
          { layout: 'image', title: '오늘의 과제: 색별 개수 세기', src: 'images/color_caps.png', caption: '병뚜껑 20개 — 정답: 빨강 5 · 초록 4 · 파랑 3 · 노랑 6 · 흰색 2', notes: '<p>학생들에게 눈으로 세어 보게 합니다(30초). 답을 칠판에 적어 두고 프로그램 결과와 비교할 것이라고 예고합니다. 흰 뚜껑 2개가 어디 있는지도 찾아보게 합니다. (4분)</p>' },
          { layout: 'bullets', title: 'BGR 로 색을 고르면 왜 힘든가', lead: '<code>R &gt; 150 &amp;&amp; G &lt; 80 &amp;&amp; B &lt; 80</code> 의 문제', bullets: [
            '조명이 어두워지면 R 이 120 으로 떨어져 <b>놓친다</b>',
            '조명이 밝으면 흰색까지 <b>빨강으로 잡는다</b>',
            '근본 원인: <b>색 + 밝기가 세 값에 뒤섞여</b> 있다',
            ['해결: 색 · 진하기 · 밝기를 <b>분리한 좌표계</b>', ['HSV — 색 검출용', 'Lab — 색 차이 계산용']]
          ], notes: '<p>실제 현장 이야기를 곁들입니다: 낮/밤, 형광등 교체, 먼지로 인한 조도 저하. 💬 “조명이 절반으로 어두워지면 BGR 세 값은 어떻게 될까?” — 모두 절반. 그래서 비율(색)은 남는다 → HSV 로 연결. (5분)</p>' },
          { layout: 'diagram', title: 'HSV 원기둥', html: FIG_HSV, caption: 'H = 둘레 각도(색상) · S = 중심에서의 거리(채도) · V = 높이(명도)', notes: '<p>원기둥을 손으로 가리키며 설명합니다: 위에서 보면 색상환, 중심은 회색, 위로 갈수록 밝다. 핵심 한 줄: <b>“조명이 바뀌면 V 만 움직인다.”</b> 💬 “분홍색은 빨강과 H 가 같을까?” — 거의 같고 S 가 낮다. (5분)</p>' },
          { layout: 'table', title: 'OpenCV 의 HSV 범위', head: ['성분', '뜻', '범위'], rows: [
            ['H', '색상 (색상환 각도)', '<b>0 ~ 179</b> (360° ÷ 2)'],
            ['S', '채도 (진한 정도)', '0 ~ 255 (0 = 회색)'],
            ['V', '명도 (밝기)', '0 ~ 255 (0 = 검정)']
          ], lead: '가장 자주 하는 실수: H 를 0~360 으로 쓰기', notes: '<p>여기서 반드시 강조: 웹/포토샵의 H 값을 ÷2. “초록 120° → OpenCV 60”. 학생들이 나중에 스스로 디버깅할 수 있는 지식입니다. (3분)</p>' },
          { layout: 'code', title: '예제: 뚜껑 색의 HSV 값', code: S_HSV, points: ['빨강 H=0 · 노랑 25 · 초록 62 · 파랑 108', '흰 뚜껑은 <b>S=5</b> → H 는 의미 없음', '이 숫자가 inRange 범위의 근거'], notes: '<p>실행 후 값을 읽어 줍니다. 💬 “흰 뚜껑의 H 가 90 인데 이걸 청록이라고 해도 될까?” — 아니다, S 가 5 라 색이 없다. 무채색 판정 규칙을 여기서 심어 둡니다. (6분)</p>' },
          { layout: 'code', title: '예제: inRange 로 색 마스크 + 개수', code: S_MASK, points: ['<code>inRange</code> → 1채널 마스크(255/0)', 'S · V 의 <b>아래 한계</b>가 배경 · 그림자를 거른다', '<code>connectedComponentsWithStats</code> → 라벨마다 면적 · 중심', '0번 라벨은 배경, 면적 조건으로 잡티 제거'], notes: '<p>파랑 3개가 나오는 것을 정답과 맞춰 봅니다. S 하한을 0 으로 바꿔 실행해 마스크가 번지는 것을 시연하면 효과가 큽니다. <code>stats.at&lt;int&gt;(i, CC_STAT_AREA)</code> 의 형식(int)을 짚어 줍니다. 💬 “면적 300 조건을 없애면?” — 잡티가 세어진다. (7분)</p>' },
          { layout: 'diagram', title: '빨강은 구간이 둘', html: FIG_HUE, caption: '색상환이 둥글어서 빨강만 0~10 과 170~179 양쪽에 걸린다', notes: '<p>원형 축을 한 번 더 강조합니다. 💬 “왜 초록은 구간이 하나일까?” — 축 가운데에 있으니까. 실무 팁: 빨강은 습관적으로 두 구간 OR. (4분)</p>' },
          { layout: 'code', title: '예제: 두 구간을 bitwise_or', code: S_RED, points: ['마스크 2장을 각각 만든 뒤 합친다', '<code>bitwise_or</code> — 하나라도 흰 곳은 흰색', '이 영상은 위 구간이 아주 적지만…', '조명 색이 바뀌면 위 구간이 주력이 된다'], notes: '<p>정직하게 설명합니다: 이 영상에서는 개수가 같다. 하지만 색온도가 바뀐 영상에서는 아래 구간만으로 0개가 될 수 있다 → 안전한 습관. (5분)</p>' },
          { layout: 'code', title: '예제: 색별 개수 세기 (검사 프로그램의 기본형)', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/color_caps.png"), hsv;
    cvtColor(img, hsv, COLOR_BGR2HSV);
    const char* names[3] = { "yellow", "green", "blue" };
    Scalar lo[3] = { Scalar(20, 100, 70), Scalar(40, 100, 70), Scalar(100, 100, 70) };
    Scalar hi[3] = { Scalar(35, 255, 255), Scalar(80, 255, 255), Scalar(130, 255, 255) };
    for (int i = 0; i < 3; i++)
    {
        Mat mask, labels, stats, cents;
        inRange(hsv, lo[i], hi[i], mask);
        int nL = connectedComponentsWithStats(mask, labels, stats, cents), n = 0;
        for (int j = 1; j < nL; j++)
            if (stats.at<int>(j, CC_STAT_AREA) >= 300) n++;
        cout << format("%-7s %d 개", names[i], n) << endl;
    }
    return 0;
}`, points: ['색 규격을 <b>배열(표)</b> 로 관리 → 같은 코드 반복', '빨강만 두 구간 OR 을 추가', '흰색은 <code>S ≤ 40, V ≥ 180</code>', '결과가 정답(6 · 4 · 3)과 일치'], notes: '<p>본문 예제 4 의 축약판입니다. 실제 장비 프로그램도 색 규격을 표(또는 설정 파일)로 관리한다는 점을 강조합니다. 학생들에게 빨강 · 흰색 줄을 직접 추가하게 하면 그대로 실습이 됩니다. (7분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '흰색 물체를 HSV 로 고르는 알맞은 조건은?', options: ['H 가 0 근처', 'S 가 크고 V 가 작다', 'S 가 작고 V 가 크다', 'H 가 90 근처'], answer: 2, explain: '무채색은 H 에 의미가 없습니다. 흰색 = 채도 S 거의 0 + 명도 V 큼 → <code>Scalar(0,0,180) ~ Scalar(179,40,255)</code>.', notes: '<p>정답 3번. 4번을 고른 학생이 있으면 예제 1 의 흰 뚜껑 H=90 이 “우연”이라는 점을 다시 설명합니다.</p>' },
          { layout: 'practice', title: '실습: 흰 뚜껑 찾아 표시하기', desc: '<p>흰 뚜껑 <b>2개</b>의 중심 좌표를 출력하고 원본에 원을 그려 표시하세요.</p><ul><li>H 는 전부 열고 <code>S ≤ 40</code>, <code>V ≥ 180</code></li><li>면적 300 이상만 세기 · 0번 라벨(배경) 건너뛰기</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/color_caps.png"), hsv, mask;
    cvtColor(img, hsv, COLOR_BGR2HSV);
    // TODO: 흰색 마스크 → 덩어리 중심 출력 → circle 로 표시
    imshow("result", img);
    waitKey(0);
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/color_caps.png"), hsv, mask;
    cvtColor(img, hsv, COLOR_BGR2HSV);
    inRange(hsv, Scalar(0, 0, 180), Scalar(179, 40, 255), mask);
    Mat labels, stats, cents;
    int nL = connectedComponentsWithStats(mask, labels, stats, cents), n = 0;
    for (int i = 1; i < nL; i++)
    {
        if (stats.at<int>(i, CC_STAT_AREA) < 300) continue;
        n++;
        Point c((int)cents.at<double>(i, 0), (int)cents.at<double>(i, 1));
        circle(img, c, 34, Scalar(0, 0, 255), 2);
    }
    cout << "흰 뚜껑 " << n << " 개" << endl;
    imshow("result", img);
    waitKey(0);
    return 0;
}`, notes: '<p>정답 2개. S 상한을 80 으로 올려 보게 하면 노란 뚜껑의 하이라이트가 섞이는 것을 볼 수 있습니다 — 임계값 조절 감각을 기르는 좋은 관찰입니다. (8분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['<code>COLOR_BGR2HSV</code> → H(0~179) · S(0~255) · V(0~255)', '<code>inRange(hsv, lo, hi, mask)</code> = 색 찾기 → 1채널 마스크', 'S · V 의 <b>아래 한계</b>로 배경 · 그림자를 거른다', '빨강은 <b>0~10 과 170~179</b> 두 구간 → <code>bitwise_or</code>', '무채색(흰 · 검 · 회색)은 <b>S · V</b> 로 판정', '마스크 → <code>connectedComponentsWithStats</code> 로 개수 · 중심, <code>bitwise_and</code> 로 그 색만 남기기', '다음 차시: 밝기 · 대비 · 히스토그램'], notes: '<p>일곱 줄을 학생들이 번갈아 읽습니다. 다음 차시 예고: “어두운 사진을 밝게 만드는 정석과, 영상의 성적표인 히스토그램.” 숙제로 wire_harness.png 의 전선 색 순서를 눈으로 확인해 오게 하면 좋습니다. (2분)</p>' }
        ]
      }
    ]
  });
})();
