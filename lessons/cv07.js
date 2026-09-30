/* 07차시 이진화 (Threshold) */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 히스토그램의 두 봉우리와 임계선
  const FIG_THRESH = `<svg viewBox="0 0 740 300" role="img" aria-label="히스토그램에 봉우리가 두 개 있을 때 그 사이 골짜기에 임계값을 두면 물체와 배경이 갈린다">
  ${ARROW('c07a1')}
  <text x="20" y="26" class="tx-b">히스토그램: 물체(어두움)와 배경(밝음) 두 봉우리</text>
  <line x1="60" y1="230" x2="700" y2="230" class="ax"/>
  <line x1="60" y1="230" x2="60" y2="50" class="ax"/>
  <text x="58" y="250" text-anchor="middle" class="tx-m">0</text>
  <text x="370" y="250" text-anchor="middle" class="tx-m">125</text>
  <text x="694" y="250" text-anchor="middle" class="tx-m">255</text>
  <text x="50" y="46" text-anchor="end" class="tx-m">개수</text>
  <path d="M60,230 C120,230 140,90 190,90 C240,90 250,228 300,230 L300,230 Z" class="p1s"/>
  <path d="M460,230 C520,226 540,70 590,70 C640,70 660,228 700,230 L700,230 Z" class="p3s"/>
  <text x="180" y="82" text-anchor="middle" class="tx">물체 (어두운 픽셀)</text>
  <text x="585" y="62" text-anchor="middle" class="tx">배경 (밝은 픽셀)</text>
  <line x1="370" y1="40" x2="370" y2="240" class="s2" stroke-width="3" stroke-dasharray="7 5"/>
  <text x="370" y="34" text-anchor="middle" class="tx-b">임계값 t = 125</text>
  <text x="378" y="200" class="tx-m">골짜기 — 여기 선을 그으면</text>
  <text x="378" y="220" class="tx-m">두 무리가 깨끗이 갈린다</text>
  <rect x="60" y="266" width="310" height="26" rx="6" class="p1"/>
  <text x="215" y="284" text-anchor="middle" class="tx-w">v ≤ t → 0 (검정)</text>
  <rect x="370" y="266" width="330" height="26" rx="6" class="p3"/>
  <text x="535" y="284" text-anchor="middle" class="tx-w">v &gt; t → 255 (흰색) — THRESH_BINARY 기준</text>
  <text x="378" y="160" class="tx-m">Otsu 는 이 골짜기 위치를</text>
  <text x="378" y="180" class="tx-m">자동으로 찾아 준다</text>
</svg>`;

  // 그림 2: ThresholdTypes 5종의 입출력 그래프
  const FIG_TYPES = `<svg viewBox="0 0 740 260" role="img" aria-label="THRESH_BINARY, BINARY_INV, TRUNC, TOZERO, TOZERO_INV 다섯 가지 이진화 방식의 입출력 그래프">
  <text x="20" y="22" class="tx-b">임계값 t = 127, maxval = 255 — 입력(가로) → 출력(세로)</text>
  <g>
    <line x1="30" y1="200" x2="150" y2="200" class="ax"/><line x1="30" y1="200" x2="30" y2="60" class="ax"/>
    <polyline points="30,200 90,200 90,70 150,70" class="s3" fill="none" stroke-width="3"/>
    <line x1="90" y1="200" x2="90" y2="210" class="ln"/><text x="90" y="226" text-anchor="middle" class="tx-m">t</text>
    <text x="90" y="248" text-anchor="middle" class="tx-b">BINARY</text>
    <text x="24" y="66" text-anchor="end" class="tx-m">255</text>
  </g>
  <g>
    <line x1="180" y1="200" x2="300" y2="200" class="ax"/><line x1="180" y1="200" x2="180" y2="60" class="ax"/>
    <polyline points="180,70 240,70 240,200 300,200" class="s3" fill="none" stroke-width="3"/>
    <line x1="240" y1="200" x2="240" y2="210" class="ln"/><text x="240" y="226" text-anchor="middle" class="tx-m">t</text>
    <text x="240" y="248" text-anchor="middle" class="tx-b">BINARY_INV</text>
  </g>
  <g>
    <line x1="330" y1="200" x2="450" y2="200" class="ax"/><line x1="330" y1="200" x2="330" y2="60" class="ax"/>
    <polyline points="330,200 390,130 450,130" class="s2" fill="none" stroke-width="3"/>
    <line x1="390" y1="200" x2="390" y2="210" class="ln"/><text x="390" y="226" text-anchor="middle" class="tx-m">t</text>
    <text x="390" y="248" text-anchor="middle" class="tx-b">TRUNC</text>
  </g>
  <g>
    <line x1="480" y1="200" x2="600" y2="200" class="ax"/><line x1="480" y1="200" x2="480" y2="60" class="ax"/>
    <polyline points="480,200 540,200 540,130 600,60" class="s1" fill="none" stroke-width="3"/>
    <line x1="540" y1="200" x2="540" y2="210" class="ln"/><text x="540" y="226" text-anchor="middle" class="tx-m">t</text>
    <text x="540" y="248" text-anchor="middle" class="tx-b">TOZERO</text>
  </g>
  <g>
    <line x1="620" y1="200" x2="720" y2="200" class="ax"/><line x1="620" y1="200" x2="620" y2="60" class="ax"/>
    <polyline points="620,200 670,130 670,200 720,200" class="s1" fill="none" stroke-width="3"/>
    <line x1="670" y1="200" x2="670" y2="210" class="ln"/><text x="670" y="226" text-anchor="middle" class="tx-m">t</text>
    <text x="670" y="248" text-anchor="middle" class="tx-b">TOZERO_INV</text>
  </g>
</svg>`;

  // 그림 3: 전역 vs 적응형
  const FIG_ADAPT = `<svg viewBox="0 0 740 320" role="img" aria-label="조명이 기울어진 영상에서는 하나의 전역 임계값이 한쪽에서 실패하고, 픽셀 주변 평균을 쓰는 적응형 이진화가 성공한다">
  ${ARROW('c07a3')}
  <text x="20" y="24" class="tx-b">한 줄(가로)의 밝기 프로파일 — 조명이 왼쪽은 밝고 오른쪽은 어둡다</text>
  <line x1="40" y1="200" x2="700" y2="200" class="ax"/>
  <line x1="40" y1="200" x2="40" y2="44" class="ax"/>
  <path d="M40,70 L180,86 L200,140 L220,86 L360,116 L380,168 L400,116 L540,150 L560,196 L580,150 L700,176" class="s1" fill="none" stroke-width="3"/>
  <text x="120" y="62" class="tx-m">밝은 배경</text>
  <text x="600" y="166" class="tx-m">어두운 배경</text>
  <text x="196" y="160" text-anchor="middle" class="tx-m">글자</text>
  <text x="556" y="216" text-anchor="middle" class="tx-m">글자</text>
  <line x1="40" y1="128" x2="700" y2="128" class="s2" stroke-width="3" stroke-dasharray="7 5"/>
  <text x="706" y="132" class="tx">전역 t</text>
  <text x="430" y="122" class="tx-m">오른쪽 배경 전체가 t 아래 → 통째로 물체로 (실패)</text>
  <path d="M40,84 L180,100 L220,100 L360,130 L400,130 L540,164 L580,164 L700,190" class="s3" fill="none" stroke-width="3" stroke-dasharray="4 3"/>
  <text x="460" y="186" class="tx">적응형: 주변 평균 − C (배경을 따라 내려간다)</text>
  <rect x="40" y="246" width="660" height="60" rx="8" class="p4s"/>
  <text x="56" y="270" class="tx">adaptiveThreshold(src, dst, 255, ADAPTIVE_THRESH_MEAN_C, THRESH_BINARY_INV, <tspan class="tx-b">51</tspan>, <tspan class="tx-b">15</tspan>)</text>
  <text x="56" y="294" class="tx-m">blockSize 51 = 주변 51×51 의 평균을 기준으로 · C 15 = 그 평균에서 15 를 뺀 값을 임계값으로 (blockSize 는 홀수!)</text>
</svg>`;

  // 그림 4: 이진화 파이프라인
  const FIG_PIPE = `<svg viewBox="0 0 740 200" role="img" aria-label="컬러 입력에서 흑백, 이진화, 마스크 활용, 개수 세기로 이어지는 처리 흐름">
  ${ARROW('c07a4')}
  <rect x="14" y="60" width="110" height="60" rx="8" class="p1s"/><text x="69" y="86" text-anchor="middle" class="tx-b">입력</text><text x="69" y="106" text-anchor="middle" class="tx-m">컬러 / 흑백</text>
  <line x1="126" y1="90" x2="158" y2="90" class="ln" stroke-width="2" marker-end="url(#c07a4)"/>
  <rect x="160" y="60" width="120" height="60" rx="8" class="p2s"/><text x="220" y="86" text-anchor="middle" class="tx-b">Gray 변환</text><text x="220" y="106" text-anchor="middle" class="tx-m">COLOR_BGR2GRAY</text>
  <line x1="282" y1="90" x2="314" y2="90" class="ln" stroke-width="2" marker-end="url(#c07a4)"/>
  <rect x="316" y="46" width="130" height="88" rx="8" class="p3s"/><text x="381" y="72" text-anchor="middle" class="tx-b">이진화</text><text x="381" y="94" text-anchor="middle" class="tx-m">threshold + OTSU</text><text x="381" y="114" text-anchor="middle" class="tx-m">또는 adaptiveThreshold</text>
  <line x1="448" y1="90" x2="480" y2="90" class="ln" stroke-width="2" marker-end="url(#c07a4)"/>
  <rect x="482" y="20" width="120" height="54" rx="8" class="p4s"/><text x="542" y="42" text-anchor="middle" class="tx-b">마스크 활용</text><text x="542" y="62" text-anchor="middle" class="tx-m">bitwise_and · mean</text>
  <rect x="482" y="106" width="120" height="54" rx="8" class="p4s"/><text x="542" y="128" text-anchor="middle" class="tx-b">개수 · 측정</text><text x="542" y="148" text-anchor="middle" class="tx-m">connectedComponents</text>
  <line x1="604" y1="47" x2="636" y2="47" class="ln" stroke-width="2" marker-end="url(#c07a4)"/>
  <line x1="604" y1="133" x2="636" y2="133" class="ln" stroke-width="2" marker-end="url(#c07a4)"/>
  <rect x="638" y="60" width="90" height="60" rx="8" class="p5s"/><text x="683" y="86" text-anchor="middle" class="tx-b">판정</text><text x="683" y="106" text-anchor="middle" class="tx-m">OK / NG</text>
  <text x="14" y="180" class="tx-m">이진화는 “보기 좋게” 만드는 단계가 아니라 <tspan class="tx-b">물체와 배경을 가르는 결정</tspan> 단계다 — 뒤의 모든 측정이 이 결과 위에서 이루어진다.</text>
</svg>`;

  // ---------------------------------------------------------------- 1교시 예제
  const EX_BASIC = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    double mn, mx;
    minMaxLoc(img, &mn, &mx);
    cout << "원본 최소/최대 " << mn << "/" << mx << format(" 평균 %.1f", mean(img)[0]) << endl;

    int ts[] = { 60, 100, 150, 200 };
    for (int t : ts)
    {
        Mat bin;
        double ret = threshold(img, bin, t, 255, THRESH_BINARY);   // 반환값 = 사용된 임계값
        int white = countNonZero(bin);
        cout << format("임계값 %d (반환 %.0f): 흰 픽셀 %d (%.1f%%)", t, ret, white, 100.0 * white / bin.total()) << endl;
    }

    Mat bin2, labels;
    double otsu = threshold(img, bin2, 0, 255, THRESH_BINARY | THRESH_OTSU);
    cout << "Otsu 임계값 = " << otsu << endl;
    cout << "물체 수 " << connectedComponents(bin2, labels) - 1 << endl;   // 0번 라벨 = 배경
    imshow("bin", bin2);
    waitKey(0);
    return 0;
}`;

  const EX_TYPES = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    // 값 6개만 담은 아주 작은 영상(1행 6열)으로 5가지 방식을 한눈에 비교
    Mat ramp = (Mat_<uchar>(1, 6) << 0, 50, 100, 150, 200, 255);

    int types[] = { THRESH_BINARY, THRESH_BINARY_INV, THRESH_TRUNC, THRESH_TOZERO, THRESH_TOZERO_INV };
    const char* names[] = { "BINARY", "BINARY_INV", "TRUNC", "TOZERO", "TOZERO_INV" };
    cout << "input        0   50  100  150  200  255   (임계값 127, maxval 255)" << endl;
    for (int k = 0; k < 5; k++)
    {
        Mat dst;
        threshold(ramp, dst, 127, 255, types[k]);
        cout << format("%-10s ", names[k]);
        for (int i = 0; i < 6; i++) cout << format("%4d ", (int)dst.at<uchar>(0, i));
        cout << endl;
    }
    return 0;
}`;

  const EX_MANUAL = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    int t = 125;

    // 직접 구현한 THRESH_BINARY_INV: v <= t 이면 255, 아니면 0
    Mat mine(img.size(), CV_8UC1), off(img.size(), CV_8UC1);
    for (int y = 0; y < img.rows; y++)
    {
        const uchar* s = img.ptr<uchar>(y);
        uchar* d = mine.ptr<uchar>(y);
        uchar* o = off.ptr<uchar>(y);
        for (int x = 0; x < img.cols; x++)
        {
            d[x] = (s[x] <= t) ? 255 : 0;    // OpenCV 와 같은 경계 (v > t 가 배경)
            o[x] = (s[x] < t) ? 255 : 0;     // 경계를 하나 틀리게 (<) 쓴 버전
        }
    }
    Mat bin;
    threshold(img, bin, t, 255, THRESH_BINARY_INV);
    cout << "threshold 와 다른 픽셀 (<=): " << countNonZero(mine != bin) << endl;
    cout << "threshold 와 다른 픽셀 (<) : " << countNonZero(off != bin) << endl;
    cout << "밝기가 정확히 " << t << " 인 픽셀: " << countNonZero(img == t) << endl;
    imshow("mine", mine);
    waitKey(0);
    return 0;
}`;

  const EX_OTSU = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    cout << format("백라이트 영상 평균 %.1f (배경이 밝고 부품이 어둡다)", mean(img)[0]) << endl;

    Mat wrong, bin;
    double t1 = threshold(img, wrong, 0, 255, THRESH_BINARY | THRESH_OTSU);
    double t2 = threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    cout << "Otsu 임계값 BINARY " << t1 << " / BINARY_INV " << t2 << " (같은 값)" << endl;
    cout << "BINARY 흰 픽셀 " << countNonZero(wrong) << " = 배경 / BINARY_INV 흰 픽셀 "
         << countNonZero(bin) << " = 부품" << endl;
    double ratio = 100.0 * countNonZero(bin) / bin.total();
    cout << format("부품이 차지하는 면적 비율 %.1f%%", ratio) << endl;

    Mat labels;
    cout << "BINARY_INV 로 센 물체 수 " << connectedComponents(bin, labels) - 1 << " (실제 13개 — 닿은 2쌍)" << endl;
    cout << "BINARY 로 세면 " << connectedComponents(wrong, labels) - 1 << " (배경 1 + 부품 속 구멍 10)" << endl;
    imshow("binary", bin);
    waitKey(0);
    return 0;
}`;

  const EX_AREA = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <cmath>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    Mat bin;
    double t = threshold(img, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);

    int total = (int)bin.total();
    int white = countNonZero(bin);
    cout << format("Otsu %.0f -> 부품 픽셀 %d / 전체 %d = %.2f%%", t, white, total, 100.0 * white / total) << endl;

    // 덩어리마다 면적을 구한다: stats 의 i 행 = i 번 라벨의 [left, top, width, height, area]
    Mat labels, stats, centroids;
    int n = connectedComponentsWithStats(bin, labels, stats, centroids);
    int count = 0;
    double sum = 0;
    for (int i = 1; i < n; i++)                        // 0 번은 배경
    {
        int area = stats.at<int>(i, CC_STAT_AREA);
        if (area < 300) continue;                      // 잡음 조각 무시
        count++;
        sum += area;
    }
    double avg = sum / count;
    double d = 2 * sqrt(avg / CV_PI) * 0.1;            // 등가 지름, 배율 0.1 mm/px
    cout << format("부품 %d개, 평균 면적 %.0f px -> 등가 지름 %.2f mm", count, avg, d) << endl;
    cout << format("흰 픽셀 비율로 본 물체 1개당 면적 %.0f px", white / (double)count) << endl;
    imshow("bin", bin);
    waitKey(0);
    return 0;
}`;

  const EX_TRACKBAR = `// 로컬 PC 전용: 트랙바로 임계값을 바꾸며 이진화 결과 보기 (브라우저 버전은 예제 1)
#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

Mat g_gray, g_bin;

void onThresh(int pos, void*)
{
    threshold(g_gray, g_bin, pos, 255, THRESH_BINARY);
    imshow("binary", g_bin);
}

int main()
{
    g_gray = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    if (g_gray.empty()) return -1;
    namedWindow("binary");
    createTrackbar("thresh", "binary", nullptr, 255, onThresh);

    // 시작 위치는 Otsu 가 고른 값으로
    Mat tmp;
    int otsu = (int)threshold(g_gray, tmp, 0, 255, THRESH_BINARY | THRESH_OTSU);
    setTrackbarPos("thresh", "binary", otsu);
    onThresh(otsu, nullptr);
    cout << "Otsu = " << otsu << " — 트랙바를 움직여 보세요 (아무 키나 누르면 종료)" << endl;
    waitKey(0);
    return 0;
}`;

  // ---------------------------------------------------------------- 2교시 예제
  const EX_FAIL = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

// 검은 점(반지름 8 -> 면적 200 안팎, 17x17)만 세는 도우미
int countDots(const Mat& bin)
{
    Mat labels, stats, centroids;
    int n = connectedComponentsWithStats(bin, labels, stats, centroids);
    int cnt = 0;
    for (int i = 1; i < n; i++)
    {
        int a = stats.at<int>(i, CC_STAT_AREA);
        int w = stats.at<int>(i, CC_STAT_WIDTH), h = stats.at<int>(i, CC_STAT_HEIGHT);
        if (a >= 150 && a <= 400 && w >= 12 && w <= 22 && h >= 12 && h <= 22) cnt++;
    }
    return cnt;
}

int main()
{
    Mat img = imread("images/uneven_light.png", IMREAD_GRAYSCALE);
    cout << format("평균 %.1f", mean(img)[0]) << endl;
    cout << "왼쪽 위 (40,40) = " << (int)img.at<uchar>(40, 40)
         << " / 오른쪽 아래 (600,440) = " << (int)img.at<uchar>(440, 600) << endl;
    cout << "같은 흰 종이인데 배경 밝기가 246 과 93 — 하나의 임계값으로는 가를 수 없다" << endl;

    Mat otsu;
    double t = threshold(img, otsu, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    int white = countNonZero(otsu);
    cout << format("전역 Otsu 임계값 %.0f -> 검출된 픽셀 %d (전체의 %.1f%%)", t, white, 100.0 * white / img.total()) << endl;
    cout << "점(면적 150~400, 정사각형) 개수 = " << countDots(otsu) << " 개 — 정답은 32 개" << endl;
    imshow("global otsu", otsu);
    waitKey(0);
    return 0;
}`;

  const EX_ADAPT = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int countDots(const Mat& bin)
{
    Mat labels, stats, centroids;
    int n = connectedComponentsWithStats(bin, labels, stats, centroids);
    int cnt = 0;
    for (int i = 1; i < n; i++)
    {
        int a = stats.at<int>(i, CC_STAT_AREA);
        int w = stats.at<int>(i, CC_STAT_WIDTH), h = stats.at<int>(i, CC_STAT_HEIGHT);
        if (a >= 150 && a <= 400 && w >= 12 && w <= 22 && h >= 12 && h <= 22) cnt++;
    }
    return cnt;
}

int main()
{
    Mat img = imread("images/uneven_light.png", IMREAD_GRAYSCALE);
    Mat ad, ag;
    adaptiveThreshold(img, ad, 255, ADAPTIVE_THRESH_MEAN_C, THRESH_BINARY_INV, 51, 15);
    cout << "Adaptive MEAN_C (block 51, C 15): 흰 픽셀 " << countNonZero(ad) << ", 점 " << countDots(ad) << " 개" << endl;

    adaptiveThreshold(img, ag, 255, ADAPTIVE_THRESH_GAUSSIAN_C, THRESH_BINARY_INV, 51, 15);
    cout << "Adaptive GAUSSIAN_C (block 51, C 15): 흰 픽셀 " << countNonZero(ag) << ", 점 " << countDots(ag) << " 개" << endl;

    imshow("adaptive mean", ad);
    imshow("adaptive gaussian", ag);
    waitKey(0);
    return 0;
}`;

  const EX_PARAM = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/uneven_light.png", IMREAD_GRAYSCALE);
    int blocks[] = { 21, 51, 101 };
    for (int bs : blocks)
    {
        Mat ad;
        adaptiveThreshold(img, ad, 255, ADAPTIVE_THRESH_MEAN_C, THRESH_BINARY_INV, bs, 15);
        cout << format("blockSize %3d C 15 : 흰 픽셀 %6d", bs, countNonZero(ad)) << endl;
    }
    int cs[] = { 5, 15, 25 };
    for (int c : cs)
    {
        Mat ad;
        adaptiveThreshold(img, ad, 255, ADAPTIVE_THRESH_MEAN_C, THRESH_BINARY_INV, 51, c);
        cout << format("blockSize  51 C %2d : 흰 픽셀 %6d", c, countNonZero(ad)) << endl;
    }
    try
    {
        Mat bad;
        adaptiveThreshold(img, bad, 255, ADAPTIVE_THRESH_MEAN_C, THRESH_BINARY_INV, 50, 15);
    }
    catch (const cv::Exception& e)       // OpenCV 오류는 cv::Exception 으로 던져진다
    {
        cout << "blockSize 50 (짝수) -> 오류! blockSize 는 3 이상의 홀수여야 한다" << endl;
    }
    return 0;
}`;

  const EX_MASK = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat bin;
    double t = threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);

    Mat objOnly;
    bitwise_and(img, img, objOnly, bin);          // 마스크가 흰 곳(부품)만 남기기
    cout << "임계값 " << t << ", 부품 픽셀 " << countNonZero(bin) << endl;
    cout << format("부품 영역 평균 밝기 %.1f", mean(img, bin)[0]) << endl;
    Mat inv;
    bitwise_not(bin, inv);                        // 마스크 반전 = 배경  (~bin 과 같다)
    cout << format("배경 영역 평균 밝기 %.1f", mean(img, inv)[0]) << endl;

    Mat labels, stats, centroids;
    int n = connectedComponentsWithStats(bin, labels, stats, centroids);
    int big = 0;
    for (int i = 1; i < n; i++)
        if (stats.at<int>(i, CC_STAT_AREA) >= 500) big++;
    cout << "면적 500 이상 덩어리 " << big << " 개 / 전체 성분 " << n - 1 << " 개" << endl;
    imshow("objects", objOnly);
    waitKey(0);
    return 0;
}`;

  const EX_PIPE = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat color = imread("images/nuts_bolts_color.png", IMREAD_COLOR);
    cout << "입력 채널 " << color.channels() << endl;

    // 컬러를 그대로 Otsu 에 넣으면 오류! 먼저 1채널로 바꾼다
    try
    {
        Mat bad;
        threshold(color, bad, 0, 255, THRESH_BINARY | THRESH_OTSU);
    }
    catch (const cv::Exception&)
    {
        cout << "오류: THRESH_OTSU 는 src_type == CV_8UC1 이어야 한다 (지금은 " << typeToString(color.type()) << ")" << endl;
    }

    Mat gray, bin;
    cvtColor(color, gray, COLOR_BGR2GRAY);
    double t = threshold(gray, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    cout << "Gray 로 바꾼 뒤 Otsu = " << t << ", 흰 픽셀 " << countNonZero(bin) << endl;
    Scalar m = mean(color, bin);                  // 컬러 영상 + 1채널 마스크
    cout << format("마스크 안 평균색 BGR = %.0f, %.0f, %.0f", m[0], m[1], m[2]) << endl;

    Mat labels, stats, centroids;
    int n = connectedComponentsWithStats(bin, labels, stats, centroids);
    int cnt = 0;
    for (int i = 1; i < n; i++)
        if (stats.at<int>(i, CC_STAT_AREA) >= 500) cnt++;
    cout << "면적 500 이상 덩어리 " << cnt << " 개" << endl;
    bool ok = imwrite("out/binary.png", bin);
    cout << "저장: " << (ok ? "true" : "false") << " (📁 작업 폴더에서 내려받기)" << endl;
    imshow("binary", bin);
    waitKey(0);
    return 0;
}`;

  // ---------------------------------------------------------------- 슬라이드용 짧은 코드
  const S_BASIC = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    Mat b100, otsu, labels;
    threshold(img, b100, 100, 255, THRESH_BINARY);
    double t = threshold(img, otsu, 0, 255, THRESH_BINARY | THRESH_OTSU);

    cout << "t=100 흰 픽셀 " << countNonZero(b100) << endl;
    cout << "Otsu 가 고른 t = " << t << ", 흰 픽셀 " << countNonZero(otsu) << endl;
    cout << "물체 수 " << connectedComponents(otsu, labels) - 1 << endl;
    imshow("otsu", otsu);
    waitKey(0);
    return 0;
}`;

  const S_TYPES = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat ramp = (Mat_<uchar>(1, 6) << 0, 50, 100, 150, 200, 255);
    Mat bin, tr;
    threshold(ramp, bin, 127, 255, THRESH_BINARY);
    threshold(ramp, tr, 127, 255, THRESH_TRUNC);
    for (int i = 0; i < 6; i++)
        cout << format("%3d -> BINARY %3d / TRUNC %3d", (int)ramp.at<uchar>(0, i),
                       (int)bin.at<uchar>(0, i), (int)tr.at<uchar>(0, i)) << endl;
    return 0;
}`;

  const S_MANUAL = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    int t = 125;
    Mat mine(img.size(), CV_8UC1);
    for (int y = 0; y < img.rows; y++)
    {
        const uchar* s = img.ptr<uchar>(y);
        uchar* d = mine.ptr<uchar>(y);
        for (int x = 0; x < img.cols; x++)
            d[x] = (s[x] <= t) ? 255 : 0;          // BINARY_INV
    }
    Mat bin;
    threshold(img, bin, t, 255, THRESH_BINARY_INV);
    cout << "다른 픽셀 " << countNonZero(mine != bin) << endl;
    imshow("mine", mine);
    waitKey(0);
    return 0;
}`;

  const S_OTSU = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat bin, labels;
    double t = threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    cout << "Otsu 가 고른 임계값 " << t << endl;
    cout << format("부품 픽셀 %d = 전체의 %.1f%%", countNonZero(bin),
                   100.0 * countNonZero(bin) / bin.total()) << endl;
    cout << "물체 수 " << connectedComponents(bin, labels) - 1 << " (실제 13개)" << endl;
    imshow("binary", bin);
    waitKey(0);
    return 0;
}`;

  const S_FAIL = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/uneven_light.png", IMREAD_GRAYSCALE);
    cout << "(40,40)=" << (int)img.at<uchar>(40, 40) << " / (600,440)=" << (int)img.at<uchar>(440, 600) << endl;

    Mat g, a;
    double t = threshold(img, g, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    adaptiveThreshold(img, a, 255, ADAPTIVE_THRESH_MEAN_C, THRESH_BINARY_INV, 51, 15);
    cout << "전역 Otsu t=" << t << " 흰 픽셀 " << countNonZero(g) << endl;
    cout << "적응형 흰 픽셀 " << countNonZero(a) << endl;
    imshow("global", g);
    imshow("adaptive", a);
    waitKey(0);
    return 0;
}`;

  const S_ADAPT = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/uneven_light.png", IMREAD_GRAYSCALE);
    Mat ad, labels, stats, cents;
    adaptiveThreshold(img, ad, 255, ADAPTIVE_THRESH_MEAN_C, THRESH_BINARY_INV, 51, 15);

    int n = connectedComponentsWithStats(ad, labels, stats, cents), dots = 0;
    for (int i = 1; i < n; i++)
    {
        int a = stats.at<int>(i, CC_STAT_AREA);
        int w = stats.at<int>(i, CC_STAT_WIDTH), h = stats.at<int>(i, CC_STAT_HEIGHT);
        if (a >= 150 && a <= 400 && w >= 12 && w <= 22 && h >= 12 && h <= 22) dots++;
    }
    cout << "흰 픽셀 " << countNonZero(ad) << ", 점 " << dots << " 개" << endl;
    imshow("adaptive", ad);
    waitKey(0);
    return 0;
}`;

  const S_MASK = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat bin, objOnly, inv;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);

    bitwise_and(img, img, objOnly, bin);      // 부품만 남기기
    bitwise_not(bin, inv);                    // 배경 마스크
    cout << format("부품 평균 %.1f", mean(img, bin)[0]) << endl;
    cout << format("배경 평균 %.1f", mean(img, inv)[0]) << endl;
    imshow("objects", objOnly);
    waitKey(0);
    return 0;
}`;

  const S_PIPE = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat color = imread("images/nuts_bolts_color.png");
    Mat gray, bin, labels, stats, cents;
    cvtColor(color, gray, COLOR_BGR2GRAY);                              // ① 1채널로
    double t = threshold(gray, bin, 0, 255, THRESH_BINARY | THRESH_OTSU); // ② 이진화

    int n = connectedComponentsWithStats(bin, labels, stats, cents), cnt = 0;  // ③ 개수
    for (int i = 1; i < n; i++)
        if (stats.at<int>(i, CC_STAT_AREA) >= 500) cnt++;
    cout << "Otsu " << t << ", 덩어리 " << cnt << " 개" << endl;
    imwrite("out/binary.png", bin);                                     // ④ 저장
    imshow("binary", bin);
    waitKey(0);
    return 0;
}`;

  // ---------------------------------------------------------------- 퀴즈
  const QUIZ1 = [
    { q: '<code>double t = threshold(img, bin, 100, 255, THRESH_BINARY);</code> 에서 반환값 <code>t</code> 는?',
      options: ['이진화된 픽셀 수', '넘겨 준 임계값 100 (Otsu 가 아니면 그대로)', '평균 밝기', '항상 255'], answer: 1,
      explain: '<code>threshold</code> 는 <b>사용된 임계값</b>을 돌려줍니다. 직접 값을 준 경우에는 그 값이 그대로 나오고, <b><code>THRESH_OTSU</code> · <code>THRESH_TRIANGLE</code> 플래그를 결합하면 자동으로 계산된 값</b>이 나옵니다 — 그래서 Otsu 를 쓸 때는 반환값을 꼭 출력해 보세요. (Python 은 <code>ret, dst = cv2.threshold(...)</code> 로 둘을 함께 받습니다.)' },
    { q: '배경이 밝고 물체가 어두운 <b>백라이트</b> 영상에서 물체를 흰색으로 만들려면?',
      options: ['<code>THRESH_BINARY</code>', '<code>THRESH_BINARY_INV</code>', '<code>THRESH_TRUNC</code>', '<code>THRESH_TOZERO</code>'], answer: 1,
      explain: '<code>THRESH_BINARY</code> 는 <b>임계값보다 밝은</b> 픽셀을 255 로 만듭니다. 물체가 어두우므로 반대인 <code>THRESH_BINARY_INV</code> 를 써야 물체가 흰색(255)이 됩니다. 뒤의 <code>connectedComponents</code> · <code>findContours</code> 는 모두 <b>흰색을 물체</b>로 봅니다.' },
    { q: 'Otsu 이진화를 쓸 때 임계값 인수에는 보통 무엇을 넣는가?',
      options: ['영상의 평균', '<code>0</code> (어차피 무시되고 자동 계산된다)', '<code>127</code>', '<code>255</code>'], answer: 1,
      explain: '<code>THRESH_OTSU</code> 를 <code>|</code> 로 결합하면 임계값 인수는 <b>무시</b>되고 히스토그램에서 자동으로 계산됩니다. 관례적으로 <code>0</code> 을 넣습니다. 계산된 값은 <b>반환값</b>으로 받으세요.' },
    { q: '<code>THRESH_TRUNC</code> 를 t=127 로 적용하면 200 인 픽셀은?',
      options: ['255', '127', '0', '200 그대로'], answer: 1,
      explain: 'TRUNC(truncate)는 <b>임계값보다 큰 값을 임계값으로 깎고</b> 작은 값은 그대로 둡니다: 200 → 127, 100 → 100. 이진(0/255) 영상이 아니라 <b>밝기 상한을 씌운</b> 영상이 나옵니다 — 하이라이트를 눌러 줄 때 씁니다.' },
    { q: '직접 구현한 <code>THRESH_BINARY</code> 로 OpenCV 와 같은 결과를 내려면 안쪽 루프를 어떻게 써야 하나?',
      options: ['<code>d[x] = (s[x] &gt;= t) ? 255 : 0;</code>', '<code>d[x] = (s[x] &gt; t) ? 255 : 0;</code>', '<code>d[x] = s[x] - t;</code>', '<code>d[x] = saturate_cast&lt;uchar&gt;(s[x] * t);</code>'], answer: 1,
      explain: 'OpenCV 의 BINARY 는 <b>v &gt; t 일 때만 255</b> 입니다(v = t 이면 0). <code>&gt;=</code> 로 쓰면 밝기가 정확히 t 인 픽셀 수만큼 결과가 달라집니다 — 예제 3 에서 그 개수를 직접 확인했습니다.' }
  ];

  const QUIZ2 = [
    { q: '전역(global) 이진화가 실패하는 대표적인 상황은?',
      options: ['물체가 배경보다 밝을 때', '조명이 한쪽으로 기울어 배경 밝기가 영상 안에서 크게 다를 때', '물체가 여러 개일 때', '영상이 클 때'], answer: 1,
      explain: '<code>uneven_light.png</code> 처럼 배경이 한쪽은 246, 다른 쪽은 93 이면 <b>어떤 값 하나로도</b> 양쪽을 동시에 가를 수 없습니다. 한쪽 배경이 통째로 물체로 잡히거나, 다른 쪽 글자가 사라집니다.' },
    { q: '<code>adaptiveThreshold</code> 의 <code>blockSize</code> 는?',
      options: ['결과 영상의 크기', '임계값을 계산할 <b>주변 영역의 한 변</b> — 3 이상의 <b>홀수</b>', '반복 횟수', '임계값'], answer: 1,
      explain: '각 픽셀마다 <b>주변 blockSize × blockSize</b> 의 평균(MEAN_C) 또는 가우시안 가중 평균(GAUSSIAN_C)을 구해 <code>− C</code> 한 값을 그 픽셀의 임계값으로 씁니다. 중심 픽셀이 있어야 하므로 <b>홀수</b>여야 하고, 짝수를 주면 <code>cv::Exception</code> 이 던져집니다.' },
    { q: '적응형 이진화에서 <code>C</code> 를 키우면?',
      options: ['검출 영역이 넓어진다', '주변 평균보다 <b>더 많이 어두워야</b> 검출되므로 결과가 깔끔해지고 검출량이 줄어든다', '블록 크기가 커진다', '임계값이 없어진다'], answer: 1,
      explain: '임계값 = (주변 평균) − C 이므로 C 가 크면 기준이 낮아져 <b>확실히 어두운 픽셀만</b> 남습니다. C 를 너무 키우면 연한 글자가 사라지고, 너무 작게 하면 배경 잡음이 점점이 남습니다.' },
    { q: '컬러 영상을 바로 <code>THRESH_OTSU</code> 로 이진화하면?',
      options: ['채널별로 알아서 처리된다', '<code>src_type == CV_8UC1</code> 조건 위반으로 <code>cv::Exception</code> 이 던져진다', '자동으로 Gray 로 바뀐다', '결과가 4채널이 된다'], answer: 1,
      explain: 'Otsu 는 <b>1채널 히스토그램</b>에서 임계값을 찾는 방법이라 <code>CV_8UC1</code>(또는 CV_16UC1)만 받습니다. 오류 메시지에 <code>THRESH_OTSU mode: src_type == CV_8UC1</code> 이 보이면 <code>cvtColor(..., COLOR_BGR2GRAY)</code> 를 빠뜨린 것입니다. <code>try</code> 로 잡지 않으면 프로그램이 종료됩니다.' },
    { q: '이진 마스크로 원본에서 <b>물체만</b> 남기려면?',
      options: ['<code>bitwise_and(img, img, dst, bin)</code>', '<code>add(img, bin, dst)</code>', '<code>bitwise_not(bin, dst)</code>', '<code>addWeighted(img, 0.5, bin, 0.5, 0, dst)</code>'], answer: 0,
      explain: '같은 영상을 두 번 넘기고 <code>mask</code> 로 이진 영상을 주면 <b>마스크가 흰 픽셀만 계산</b>되고 나머지는 0 이 됩니다(<code>img.copyTo(dst, bin)</code> 도 같은 결과 — dst 를 미리 0 으로 만들어 둘 때). 반대(배경만)를 원하면 <code>bitwise_not</code> 으로 마스크를 반전해서 넘기세요.' }
  ];

  CV_COURSE.addChapter({
    id: 'cv07', no: '07', title: '이진화 (Threshold)', subtitle: '물체와 배경을 가르는 결정 — 전역 · Otsu · 적응형',
    summary: '임계값 하나로 영상을 흑과 백으로 나누는 <b>이진화</b>를 배웁니다. <code>threshold</code> 의 반환값과 5가지 <code>THRESH_*</code> 방식, 배경/물체 밝기에 따른 <code>_INV</code> 선택, <code>ptr&lt;uchar&gt;</code> 로 직접 구현해 보는 이진화, 히스토그램에서 임계값을 자동으로 찾는 <b>Otsu</b>, 그리고 조명이 기울어진 영상을 살리는 <b>적응형 이진화</b>(<code>adaptiveThreshold</code>)까지 다룹니다. 마지막에는 이진 마스크로 물체만 남기고 개수를 세어 저장하는 검사 파이프라인을 완성합니다.',
    goals: ['threshold 의 반환값과 THRESH_* 5가지를 구분해 쓸 수 있다', '배경 · 물체의 밝기를 보고 THRESH_BINARY / THRESH_BINARY_INV 를 고를 수 있다', 'Otsu 로 임계값을 자동 계산하고, 그 원리를 히스토그램으로 직접 구현해 확인할 수 있다', '전역 이진화가 실패하는 경우를 설명하고 adaptiveThreshold 로 해결할 수 있다', '이진 마스크로 물체만 남기고 개수를 세어 결과를 저장할 수 있다'],
    sections: [
      {
        id: 'cv07-1', title: '전역 이진화와 Otsu', minutes: 50,
        goals: ['임계값 · 이진화의 뜻을 히스토그램으로 설명할 수 있다', 'THRESH_* 5가지의 차이를 값으로 확인하고 직접 구현할 수 있다', 'Otsu 로 임계값을 자동 계산하고 면적 비율을 구할 수 있다'],
        flow: [['도입: 임계값이란', 7], ['THRESH_* 비교 · 직접 구현', 17], ['Otsu 와 면적 측정', 18], ['정리 · 퀴즈', 8]],
        content: [
          { type: 'h', text: '이진화 = 물체와 배경을 가르는 결정' },
          { type: 'p', html: '06차시에서 히스토그램에 <b>봉우리가 두 개</b> 있으면 물체와 배경이 잘 갈린다고 했습니다. <b>이진화(Thresholding)</b> 는 그 사이에 선(임계값 · threshold)을 긋고 <b>모든 픽셀을 0 또는 255 둘 중 하나로</b> 만드는 일입니다. 개수 세기 · 면적 측정 · 윤곽선 · 모폴로지 등 뒤에 나오는 거의 모든 분석이 <b>이진 영상 위에서</b> 이루어지므로, 이진화는 머신비전에서 가장 중요한 한 줄입니다.' },
          { type: 'figure', html: FIG_THRESH, caption: '그림 1. 두 봉우리 사이 골짜기에 임계값을 두면 물체와 배경이 갈린다 (Otsu 는 이 위치를 자동으로 찾는다)' },
          { type: 'image', src: 'images/coins_parts.png', caption: 'images/coins_parts.png — 어두운 배경 위 밝은 원형 부품 12개 (지름 3종). 물체가 밝으므로 THRESH_BINARY 를 쓴다' },
          { type: 'code', title: '예제 1: 임계값을 바꿔 보고 Otsu 와 비교', code: EX_BASIC,
            desc: '임계값을 60 → 150 까지 올려도 흰 픽셀 수가 9.0% → 7.9% 로 조금만 줄어듭니다. 두 봉우리가 멀리 떨어져 있어 <b>그 사이 어디를 골라도 결과가 비슷</b>하기 때문입니다 — 좋은 영상의 특징입니다. 반면 200 에서는 부품 안쪽까지 검게 되어 0.5% 로 무너집니다. <code>threshold</code> 의 <b>반환값(double)</b>은 사용된 임계값이고, <code>THRESH_OTSU</code> 를 결합하면 자동 계산된 값(105)이 돌아옵니다. Python 의 <code>ret, dst = cv2.threshold(...)</code> 와 달리 C++ 은 결과 영상을 <b>출력 인수</b>로, 임계값을 <b>반환값</b>으로 받습니다.',
            expect: '원본 최소/최대 20/209 평균 45.3\n임계값 60 (반환 60): 흰 픽셀 27646 (9.0%)\n임계값 100 (반환 100): 흰 픽셀 26377 (8.6%)\n임계값 150 (반환 150): 흰 픽셀 24338 (7.9%)\n임계값 200 (반환 200): 흰 픽셀 1453 (0.5%)\nOtsu 임계값 = 105\n물체 수 12' },
          { type: 'h', text: 'THRESH_* 5가지' },
          { type: 'figure', html: FIG_TYPES, caption: '그림 2. 다섯 가지 방식의 입출력 그래프 — BINARY · BINARY_INV 만 0/255 의 "이진" 영상을 만든다' },
          { type: 'code', title: '예제 2: 값 6개로 5가지 방식 비교하기', code: EX_TYPES,
            desc: '<code>Mat_&lt;uchar&gt;(1, 6) &lt;&lt; ...</code> 쉼표 초기화로 1행 6열의 작은 Mat 을 만들어 대표값 6개에 각 방식을 적용했습니다. 표를 세로로 읽어 보세요: 입력 150 은 BINARY 에서 255, BINARY_INV 에서 0, TRUNC 에서 127, TOZERO 에서 150, TOZERO_INV 에서 0 입니다. <b>이진 영상이 필요하면 BINARY 또는 BINARY_INV</b>, 밝기 상한을 씌우려면 TRUNC, 어두운 부분만 지우려면 TOZERO 를 씁니다. <code>THRESH_*</code> 는 <code>int</code> 상수라서 배열에 담아 반복할 수 있습니다.',
            expect: 'input        0   50  100  150  200  255   (임계값 127, maxval 255)\nBINARY        0    0    0  255  255  255 \nBINARY_INV  255  255  255    0    0    0 \nTRUNC         0   50  100  127  127  127 \nTOZERO        0    0    0  150  200  255 \nTOZERO_INV    0   50  100    0    0    0 ' },
          { type: 'table', head: ['THRESH_*', 'v &gt; t 일 때', 'v ≤ t 일 때', '쓰는 곳'], rows: [
            ['<code>THRESH_BINARY</code>', 'maxval (255)', '0', '<b>밝은 물체</b> 검출 (기본)'],
            ['<code>THRESH_BINARY_INV</code>', '0', 'maxval (255)', '<b>어두운 물체</b> 검출 (백라이트 · 글자)'],
            ['<code>THRESH_TRUNC</code>', 't 로 깎음', '그대로', '하이라이트 억제 (이진 아님)'],
            ['<code>THRESH_TOZERO</code>', '그대로', '0', '어두운 부분만 지우기'],
            ['<code>THRESH_TOZERO_INV</code>', '0', '그대로', '밝은 부분만 지우기'],
            ['<code>| THRESH_OTSU</code>', '— (플래그 결합)', '—', '임계값 자동 계산'],
            ['<code>| THRESH_TRIANGLE</code>', '— (플래그 결합)', '—', '봉우리가 하나일 때 자동 계산']
          ], caption: '표 1. 다섯 가지 방식 + 자동 임계값 플래그. <code>THRESH_BINARY | THRESH_OTSU</code> 처럼 비트 OR <b>|</b> 로 결합한다 (Python: <code>cv2.THRESH_BINARY + cv2.THRESH_OTSU</code>)' },
          { type: 'h', text: '직접 구현해 보기: 경계값 하나의 차이' },
          { type: 'code', title: '예제 3: ptr 루프로 BINARY_INV 직접 구현하기', code: EX_MANUAL,
            desc: '이진화는 픽셀 하나하나에 대한 <b>if 문</b>일 뿐입니다. 행 포인터 루프에 삼항 연산자 한 줄이면 됩니다. 핵심은 <b>경계</b>입니다: OpenCV 의 BINARY 는 <b>v &gt; t</b> 에서 255, BINARY_INV 는 <b>v ≤ t</b> 에서 255 입니다. <code>&lt;=</code> 로 쓴 버전은 <code>threshold</code> 와 <b>0 픽셀</b> 다르지만, <code>&lt;</code> 로 쓴 버전은 <b>160 픽셀</b> 다릅니다 — 정확히 <b>밝기가 125 인 픽셀 수</b>입니다. <code>img == t</code> 는 조건이 참인 곳이 255 인 마스크를 만드는 Mat 비교 연산입니다.',
            expect: 'threshold 와 다른 픽셀 (<=): 0\nthreshold 와 다른 픽셀 (<) : 160\n밝기가 정확히 125 인 픽셀: 160' },
          { type: 'callout', kind: 'warn', title: '_INV 를 고르는 기준: 물체가 흰색이 되게', html: '뒤에 오는 <code>connectedComponents</code> · <code>findContours</code> · 모폴로지는 모두 <b>흰색(255)을 물체</b>로 봅니다. 그러므로 규칙은 하나입니다 — <b>결과에서 물체가 흰색이 되도록</b> 고르세요.<ul><li>어두운 배경 + <b>밝은</b> 물체 (coins_parts) → <code>THRESH_BINARY</code></li><li>밝은 배경 + <b>어두운</b> 물체 (washers 백라이트, 흰 종이 위 글자) → <code>THRESH_BINARY_INV</code></li></ul>반대로 고르면 배경이 하나의 거대한 물체로 잡혀 개수가 엉뚱하게 나옵니다.' },
          { type: 'h', text: 'Otsu: 임계값을 자동으로 찾기' },
          { type: 'p', html: '조명이 조금씩 바뀌는 현장에서 임계값을 코드에 고정하면 오래 못 버팁니다. <b>Otsu 방법</b>은 히스토그램을 두 무리로 나눌 때 <b>두 무리 안의 분산 합이 가장 작아지는</b>(= 무리 사이 분산이 가장 커지는) 값을 찾아 줍니다 — 그림 1 의 골짜기입니다. 쓰는 법은 간단합니다: 임계값 인수에 <code>0</code> 을 넣고 <code>THRESH_OTSU</code> 를 <b>|</b> 로 결합하면, <b>반환값</b>으로 계산된 임계값이 나옵니다.' },
          { type: 'image', src: 'images/washers.png', caption: 'images/washers.png — 백라이트 실루엣 (와셔 6 · 너트 4 · 볼트 3 = 13개, 그중 2쌍이 서로 닿아 있다)' },
          { type: 'code', title: '예제 4: Otsu + BINARY_INV 로 백라이트 영상 이진화', code: EX_OTSU,
            desc: 'Otsu 가 고른 임계값은 <b>125</b> 입니다(BINARY 든 BINARY_INV 든 임계값 계산은 같습니다). 흰 픽셀 수를 보면 차이가 분명합니다: BINARY 는 260722(배경), BINARY_INV 는 46478(부품). 개수가 <b>11</b> 인 이유는 서로 닿은 2쌍이 한 덩어리로 세어졌기 때문입니다(12차시에서 거리 변환 + watershed 로 분리). 흥미롭게도 BINARY 로 세도 11 이 나오는데, 이때는 <b>배경 1개 + 부품 속 구멍 10개</b> 라는 완전히 다른 의미입니다. <code>connectedComponents</code> 의 반환값은 <b>배경(0번)을 포함한</b> 라벨 수라서 1 을 뺍니다.',
            expect: '백라이트 영상 평균 191.8 (배경이 밝고 부품이 어둡다)\nOtsu 임계값 BINARY 125 / BINARY_INV 125 (같은 값)\nBINARY 흰 픽셀 260722 = 배경 / BINARY_INV 흰 픽셀 46478 = 부품\n부품이 차지하는 면적 비율 15.1%\nBINARY_INV 로 센 물체 수 11 (실제 13개 — 닿은 2쌍)\nBINARY 로 세면 11 (배경 1 + 부품 속 구멍 10)' },
          { type: 'callout', kind: 'tip', title: 'Otsu 가 잘 되는 조건 · 안 되는 조건', html: '<ul><li><b>잘 됨</b>: 봉우리가 두 개고 골짜기가 뚜렷할 때 (백라이트, 대비 좋은 조명)</li><li><b>안 됨</b>: ① 물체가 아주 작아 봉우리 하나가 거의 없을 때 → <code>THRESH_TRIANGLE</code> 이나 고정값 ② 조명이 기울어졌을 때 → <b>적응형 이진화</b>(2교시) ③ 잡음이 많을 때 → 먼저 <code>GaussianBlur</code>(08차시) 후 Otsu</li></ul>실무에서는 Otsu 로 얻은 값을 <b>로그로 남겨</b> 두고, 값이 평소와 크게 달라지면 조명 이상으로 보고 경고를 띄웁니다.' },
          { type: 'code', title: '예제 5: countNonZero 로 면적 비율 · 지름 환산', code: EX_AREA,
            desc: '<code>countNonZero</code> 는 흰 픽셀 수, 즉 <b>물체의 총 면적(px)</b> 입니다. 전체 픽셀 수(<code>bin.total()</code>)로 나누면 면적 비율이 되고, 개수로 나누면 부품 하나의 평균 면적이 됩니다. <code>connectedComponentsWithStats</code> 의 <code>stats</code> 는 <b>CV_32S</b> Mat 으로, i 행에 i 번 덩어리의 <code>[left, top, width, height, area]</code> 가 들어 있어 <code>stats.at&lt;int&gt;(i, CC_STAT_AREA)</code> 로 읽습니다. 원이라고 가정하면 등가 지름 = 2√(면적/π) 이고, 배율 0.1 mm/px 를 곱하면 <b>실제 치수(mm)</b> 가 나옵니다 — 부품 3종(Ø6.8 · Ø5.4 · Ø4.0 mm)의 평균이므로 5.2 mm 정도가 나옵니다.',
            expect: 'Otsu 105 -> 부품 픽셀 26230 / 전체 307200 = 8.54%\n부품 12개, 평균 면적 2186 px -> 등가 지름 5.28 mm\n흰 픽셀 비율로 본 물체 1개당 면적 2186 px' },
          { type: 'callout', kind: 'vs', title: 'Visual Studio 에서는 — 임계값 트랙바', html: '이진화는 <b>값을 눈으로 맞춰 보는</b> 작업이 많아 트랙바가 특히 유용합니다. 아래 코드는 트랙바를 움직일 때마다 <code>onThresh</code> 콜백에서 다시 이진화합니다. 시작 위치를 <b>Otsu 값</b>으로 두면 “자동값에서 출발해 손으로 미세 조정”하는 현장 도구가 됩니다. 브라우저에서는 트랙바가 동작하지 않으므로 예제 1 처럼 임계값 배열을 돌려 비교하세요. 16차시에서 이런 도구를 클래스로 설계합니다.' },
          { type: 'code', title: '추가: 트랙바로 임계값 조절 (로컬 전용)', code: EX_TRACKBAR, run: false, local: true, file: 'main.cpp',
            desc: '<code>createTrackbar(이름, 창, 값 포인터, 최대값, 콜백)</code> — 값 포인터에 <code>nullptr</code> 를 주고 콜백의 첫 인수(<code>pos</code>)로 현재 값을 받는 방식이 OpenCV 5 에서 권장됩니다. 콜백이 전역 Mat 을 쓰므로 <code>g_</code> 접두어로 구분했습니다(16차시에서는 클래스 멤버로 바꿉니다).' }
        ],
        practice: [
          {
            title: 'Otsu 임계값과 면적 비율 구하기', level: 1,
            desc: '<code>images/flange.png</code>(어두운 배경 위 밝은 금속 플랜지)를 Otsu 로 이진화하고 ① 임계값 ② 흰 픽셀 수 ③ 면적 비율(%) ④ <code>connectedComponents</code> 로 센 덩어리 수를 출력하세요. 물체가 배경보다 <b>밝으므로</b> 어떤 <code>THRESH_*</code> 를 쓸지 먼저 판단하세요.',
            hint: '<code>double t = threshold(img, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);</code> · 비율은 <code>100.0 * countNonZero(bin) / bin.total()</code> (정수 나눗셈이 되지 않도록 <code>100.0</code>) · 플랜지는 한 덩어리이므로 덩어리 수 1 이 나오면 성공입니다(구멍은 배경 쪽으로 세어집니다).',
            expect: 'Otsu 임계값 104\n흰 픽셀 79407 / 전체 307200 = 25.85%\n덩어리 수 1',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/flange.png", IMREAD_GRAYSCALE);
    Mat bin;
    // TODO: Otsu 이진화를 하고 임계값을 출력하세요 (물체가 밝다 -> BINARY? BINARY_INV?)

    // TODO: 흰 픽셀 수와 면적 비율(%)을 출력하세요

    // TODO: connectedComponents 로 덩어리 수를 출력하세요
    imshow("input", img);
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/flange.png", IMREAD_GRAYSCALE);
    Mat bin;
    double t = threshold(img, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    cout << "Otsu 임계값 " << t << endl;

    int white = countNonZero(bin);
    cout << format("흰 픽셀 %d / 전체 %d = %.2f%%", white, (int)bin.total(), 100.0 * white / bin.total()) << endl;

    Mat labels;
    cout << "덩어리 수 " << connectedComponents(bin, labels) - 1 << endl;
    imshow("binary", bin);
    waitKey(0);
    return 0;
}`
          },
          {
            title: 'THRESH_* 를 바꿔 결과를 예측하기', level: 2,
            desc: '<code>images/washers.png</code> 에 <b>다섯 가지</b> <code>THRESH_*</code> 를 임계값 125 로 적용하고, 각각의 <b>0 이 아닌 픽셀 수(countNonZero)와 평균 밝기</b>를 출력하세요. 출력 전에 각 값을 <b>먼저 예측해 적어 보고</b> 맞춰 보세요. 왜 <code>TOZERO</code> 는 BINARY 와 0 아닌 픽셀 수가 같고, <code>TRUNC</code> 는 전체 픽셀이 0 이 아닌지 설명해 보세요.',
            hint: '<code>int types[] = { THRESH_BINARY, THRESH_BINARY_INV, THRESH_TRUNC, THRESH_TOZERO, THRESH_TOZERO_INV };</code> 를 반복문으로 돌리세요. <code>countNonZero</code> 는 “0 이 아닌 픽셀 수”이므로 이진 영상이 아니어도 값이 나옵니다. 출력은 <code>format("%-10s: 0 아닌 픽셀 %6d, 평균 %5.1f", ...)</code>.',
            expect: 'BINARY    : 0 아닌 픽셀 260722, 평균 216.4\nBINARY_INV: 0 아닌 픽셀  46478, 평균  38.6\nTRUNC     : 0 아닌 픽셀 307200, 평균 110.6\nTOZERO    : 0 아닌 픽셀 260722, 평균 187.3\nTOZERO_INV: 0 아닌 픽셀  46478, 평균   4.5',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    int types[] = { THRESH_BINARY, THRESH_BINARY_INV, THRESH_TRUNC, THRESH_TOZERO, THRESH_TOZERO_INV };
    const char* names[] = { "BINARY", "BINARY_INV", "TRUNC", "TOZERO", "TOZERO_INV" };

    for (int k = 0; k < 5; k++)
    {
        Mat dst;
        // TODO: 임계값 125, maxval 255 로 이진화하고 0 아닌 픽셀 수와 평균을 출력하세요
        cout << format("%-10s", names[k]) << endl;
    }
    imshow("input", img);
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
    int types[] = { THRESH_BINARY, THRESH_BINARY_INV, THRESH_TRUNC, THRESH_TOZERO, THRESH_TOZERO_INV };
    const char* names[] = { "BINARY", "BINARY_INV", "TRUNC", "TOZERO", "TOZERO_INV" };

    for (int k = 0; k < 5; k++)
    {
        Mat dst;
        threshold(img, dst, 125, 255, types[k]);
        cout << format("%-10s: 0 아닌 픽셀 %6d, 평균 %5.1f", names[k], countNonZero(dst), mean(dst)[0]) << endl;
    }
    imshow("input", img);
    waitKey(0);
    return 0;
}`
          },
          {
            title: 'Otsu 를 히스토그램으로 직접 구현하기', level: 3,
            desc: '06차시의 <code>calcHist</code> 로 히스토그램을 구하고, 임계값 t 를 0~255 로 바꿔 가며 <b>두 무리 사이 분산</b> σ<sub>B</sub>² = w<sub>0</sub> · w<sub>1</sub> · (μ<sub>0</sub> − μ<sub>1</sub>)² 이 가장 큰 t 를 찾는 함수 <code>int myOtsu(const Mat&amp; gray)</code> 를 완성하세요. (w<sub>0</sub> = t 이하 픽셀 수, μ<sub>0</sub> = 그 평균 밝기, w<sub>1</sub> · μ<sub>1</sub> = t 초과 쪽.) washers · coins_parts · flange 세 영상에서 <code>threshold(..., THRESH_OTSU)</code> 의 반환값과 <b>같은 값</b>이 나오는지 확인하세요.',
            hint: '누적합으로 한 번에 계산합니다: 전체 합 <code>sumAll = Σ i·h[i]</code> 를 먼저 구하고, 루프에서 <code>w0 += h[t]; sum0 += t * h[t];</code> → <code>w1 = total - w0</code>, <code>mu0 = sum0 / w0</code>, <code>mu1 = (sumAll - sum0) / w1</code>. w0 나 w1 이 0 이면 건너뜁니다. 최대값 비교는 <code>&gt;</code>(처음 나온 최대)로 하세요.',
            expect: 'images/washers.png: 직접 125 / OpenCV 125\nimages/coins_parts.png: 직접 105 / OpenCV 105\nimages/flange.png: 직접 104 / OpenCV 104',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int myOtsu(const Mat& gray)
{
    const int channels[] = { 0 };
    int histSize = 256;
    float range[] = { 0, 256 };
    const float* ranges[] = { range };
    Mat hist;
    calcHist(&gray, 1, channels, Mat(), hist, 1, &histSize, ranges);

    double total = (double)gray.total();
    int bestT = 0;
    // TODO: sumAll 을 구하고, t = 0..255 에 대해 사이 분산이 최대인 t 를 찾으세요
    return bestT;
}

int main()
{
    const char* files[] = { "images/washers.png", "images/coins_parts.png", "images/flange.png" };
    for (const char* f : files)
    {
        Mat img = imread(f, IMREAD_GRAYSCALE), bin;
        double cvT = threshold(img, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
        cout << f << ": 직접 " << myOtsu(img) << " / OpenCV " << cvT << endl;
    }
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int myOtsu(const Mat& gray)
{
    const int channels[] = { 0 };
    int histSize = 256;
    float range[] = { 0, 256 };
    const float* ranges[] = { range };
    Mat hist;
    calcHist(&gray, 1, channels, Mat(), hist, 1, &histSize, ranges);

    double total = (double)gray.total();
    double sumAll = 0;
    for (int i = 0; i < 256; i++) sumAll += i * hist.at<float>(i);

    double w0 = 0, sum0 = 0, best = -1;
    int bestT = 0;
    for (int t = 0; t < 256; t++)
    {
        w0 += hist.at<float>(t);                 // t 이하 픽셀 수
        sum0 += t * hist.at<float>(t);
        double w1 = total - w0;                  // t 초과 픽셀 수
        if (w0 == 0 || w1 == 0) continue;
        double mu0 = sum0 / w0, mu1 = (sumAll - sum0) / w1;
        double between = w0 * w1 * (mu0 - mu1) * (mu0 - mu1);   // 사이 분산 (상수배 무시)
        if (between > best) { best = between; bestT = t; }
    }
    return bestT;
}

int main()
{
    const char* files[] = { "images/washers.png", "images/coins_parts.png", "images/flange.png" };
    for (const char* f : files)
    {
        Mat img = imread(f, IMREAD_GRAYSCALE), bin;
        double cvT = threshold(img, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
        cout << f << ": 직접 " << myOtsu(img) << " / OpenCV " << cvT << endl;
    }
    return 0;
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: '이진화 (1) 전역 이진화와 Otsu', subtitle: '물체와 배경을 가르는 한 줄', notes: '<p>06차시의 히스토그램 두 봉우리 그림을 떠올리게 하며 시작합니다. 💬 “봉우리 두 개 사이에 선을 그으면 무엇이 되나요?” — 물체/배경 분리. 오늘은 그 선을 손으로, 직접 구현으로, 그리고 자동으로 긋습니다. (2분)</p>' },
          { layout: 'diagram', title: '임계값과 이진화', html: FIG_THRESH, caption: '골짜기에 선을 긋는다 → v > t 는 255, v ≤ t 는 0', notes: '<p>이진화가 “정보를 버리는” 연산이라는 점을 강조합니다: 256단계 → 2단계. 그래서 <b>어디에 선을 긋느냐</b>가 모든 것을 결정합니다. 뒤의 개수 세기 · 측정이 모두 이 결과 위에 올라간다고 예고. (4분)</p>' },
          { layout: 'image', title: '밝은 물체: coins_parts.png', src: 'images/coins_parts.png', caption: '어두운 배경 위 밝은 원형 부품 12개 → THRESH_BINARY', notes: '<p>💬 “이 영상에서 물체를 흰색으로 만들려면 BINARY 일까요 BINARY_INV 일까요?” — 물체가 밝으니 BINARY. 이 판단 습관을 오늘 반복해서 훈련시킵니다. (2분)</p>' },
          { layout: 'code', title: '예제: 임계값 바꿔 보기 + Otsu', code: S_BASIC, points: ['<code>threshold</code> 의 <b>반환값(double) = 사용된 임계값</b>', 'Otsu 를 결합하면 임계값 인수(0)는 무시된다', '이 영상은 60~150 어디를 골라도 결과가 비슷', 'Otsu 가 고른 값 105 → 물체 12개'], notes: '<p>실행 후 값을 확인합니다. 학생들에게 임계값 100 을 200 으로 바꿔 실행해 무너지는 것을 보게 합니다(0.5%). 💬 “왜 60 과 150 의 결과가 비슷할까?” — 봉우리가 멀다. Python 은 <code>ret, dst</code> 튜플로 받는다는 대응도 한 줄. (6분)</p>' },
          { layout: 'diagram', title: 'THRESH_* 5가지', html: FIG_TYPES, caption: 'BINARY · BINARY_INV 만 0/255 이진 영상을 만든다', notes: '<p>다섯 그래프를 하나씩 손으로 짚습니다. TRUNC/TOZERO 는 “이진이 아니다”가 핵심. 💬 “하늘이 하얗게 날아간 사진을 눌러 주려면?” — TRUNC. (4분)</p>' },
          { layout: 'code', title: '예제: 값 6개로 방식 비교', code: S_TYPES, points: ['<code>(Mat_&lt;uchar&gt;(1, 6) &lt;&lt; ...)</code> 쉼표 초기화', 'BINARY: 150 → 255 · TRUNC: 150 → 127', '작은 Mat 으로 실험하면 이해가 빠르다', '출력은 <code>(int)</code> 로 — uchar 는 문자로 찍힌다'], notes: '<p>실행 결과를 함께 읽습니다. 본문 예제 2 에는 5가지가 모두 있으니 학생들에게 나머지 세 가지를 추가해 보라고 하면 좋습니다. (5분)</p>' },
          { layout: 'code', title: '직접 구현: 이진화는 if 문 하나', code: S_MANUAL, points: ['<code>d[x] = (s[x] &lt;= t) ? 255 : 0;</code>', 'OpenCV 규칙: BINARY 는 <b>v &gt; t</b> 에서 255', '<code>&lt;</code> 로 쓰면 v = t 인 픽셀만큼 달라진다', '<code>mine != bin</code> → 다른 곳이 255 인 마스크'], notes: '<p>C++ 강좌의 강점 — 알고리즘을 직접 써 보고 OpenCV 와 비교합니다. <code>&lt;=</code> 를 <code>&lt;</code> 로 바꿔 실행해 차이가 “밝기가 정확히 125 인 픽셀 수”와 같다는 것을 확인시키세요(본문 예제 3). (6분)</p>' },
          { layout: 'image', title: '어두운 물체: washers.png (백라이트)', src: 'images/washers.png', caption: '배경이 밝고 부품이 어둡다 → BINARY_INV. 부품 13개 중 2쌍이 닿아 있다', notes: '<p>백라이트 조명 방식을 설명합니다(뒤에서 빛을 쏘아 실루엣만 본다 — 치수 측정에 최적). 💬 “여기서 BINARY 를 쓰면 무엇이 흰색이 될까?” — 배경. (2분)</p>' },
          { layout: 'code', title: '예제: Otsu + BINARY_INV', code: S_OTSU, points: ['임계값 인수 <code>0</code> + <code>| THRESH_OTSU</code>', '반환값 <b>125</b> = 자동 계산된 임계값', '부품 면적 46478 px = 전체의 15.1%', '개수 11 — 닿은 2쌍이 합쳐졌다 (12차시에서 해결)'], notes: '<p>Otsu 값을 로그로 남겨 두면 조명 이상을 감지할 수 있다는 실무 팁을 곁들입니다. 개수 11 의 이유를 학생들이 결과 창 이미지에서 직접 찾게 합니다. (6분)</p>' },
          { layout: 'table', title: '어떤 방식을 쓸까', head: ['상황', '고르기', '예'], rows: [
            ['어두운 배경 + 밝은 물체', '<code>THRESH_BINARY</code>', 'coins_parts · flange'],
            ['밝은 배경 + 어두운 물체', '<code>THRESH_BINARY_INV</code>', 'washers(백라이트) · 흰 종이 위 글자'],
            ['임계값을 모르겠다', '<code>| THRESH_OTSU</code>', '반환값을 출력해 확인'],
            ['밝은 쪽만 눌러 주기', '<code>THRESH_TRUNC</code>', '하이라이트 억제'],
            ['조명이 기울었다', '<code>adaptiveThreshold</code>', '다음 교시']
          ], notes: '<p>규칙 한 줄로 정리: <b>“결과에서 물체가 흰색이 되게”</b>. 이것만 기억하면 _INV 선택을 틀리지 않습니다. (3분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: 'Otsu 를 쓸 때 임계값 인수에는 보통 무엇을 넣는가?', options: ['영상의 평균', '0 (무시되고 자동 계산)', '127', '255'], answer: 1, explain: '<code>THRESH_OTSU</code> 를 결합하면 임계값 인수는 무시됩니다. 계산된 값은 <b>반환값</b>으로 받으세요.', notes: '<p>정답 2번. “그럼 계산된 값은 어디서 보나?” 로 이어 반환값의 중요성을 다시 강조합니다.</p>' },
          { layout: 'practice', title: '실습: flange.png 의 면적 비율', desc: '<p><code>images/flange.png</code> 를 Otsu 로 이진화하고 임계값 · 면적 비율 · 덩어리 수를 출력하세요.</p><ul><li>물체가 밝다 → 어떤 방식?</li><li>비율 = <code>100.0 * countNonZero(bin) / bin.total()</code></li><li>빨리 끝나면: 실습 3 — Otsu 직접 구현</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/flange.png", IMREAD_GRAYSCALE);
    Mat bin;
    // TODO: Otsu 이진화 + 임계값 · 면적 비율 · 덩어리 수 출력
    imshow("input", img);
    waitKey(0);
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/flange.png", IMREAD_GRAYSCALE);
    Mat bin, labels;
    double t = threshold(img, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    int white = countNonZero(bin);
    cout << format("Otsu %.0f, 비율 %.2f%%, 덩어리 %d", t, 100.0 * white / bin.total(),
                   connectedComponents(bin, labels) - 1) << endl;
    imshow("binary", bin);
    waitKey(0);
    return 0;
}`, notes: '<p>정답: Otsu 104, 비율 25.85%, 덩어리 1. BINARY_INV 를 쓴 학생은 비율이 약 74% 로 나오므로 바로 알 수 있습니다 — 좋은 자기 점검 지표입니다. 실습 3(Otsu 직접 구현)은 상위 학생용 도전 과제입니다. (6분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['이진화 = 임계값으로 <b>0 또는 255</b> 로 나누는 결정 (뒤의 모든 분석의 토대)', '<code>threshold</code> 의 <b>반환값 = 사용된 임계값</b> (결과 영상은 출력 인수)', '<b>물체가 흰색이 되도록</b> BINARY / BINARY_INV 를 고른다', 'BINARY 는 <b>v &gt; t</b> 에서 255 — 직접 구현은 if 문 하나', '<code>| THRESH_OTSU</code> = 히스토그램 골짜기 자동 탐색 (임계값 인수는 0)', '<code>countNonZero</code> = 물체 면적(px) → 비율 · 지름 환산', '다음 교시: 조명이 기울면 전역 이진화가 <b>실패</b>한다 → 적응형 이진화'], notes: '<p>일곱 줄을 읽고 다음 교시를 예고합니다: “한 장 안에서 배경 밝기가 246 과 93 이면 어떻게 할까?” 실제 영상을 잠깐 띄워 궁금증을 남깁니다. (2분)</p>' }
        ]
      },
      {
        id: 'cv07-2', title: '적응형 이진화와 마스크 활용', minutes: 50,
        goals: ['전역 이진화가 실패하는 상황을 설명하고 adaptiveThreshold 로 해결할 수 있다', 'blockSize · C 의 효과를 예측하고 잘못된 값의 cv::Exception 을 처리할 수 있다', '이진 마스크로 물체만 남기고 개수를 세어 결과를 저장할 수 있다'],
        flow: [['도입: 전역 이진화의 실패', 7], ['적응형 이진화 · 매개변수', 18], ['마스크 활용 · 파이프라인', 17], ['정리 · 퀴즈', 8]],
        content: [
          { type: 'h', text: '전역 임계값 하나로는 안 되는 영상' },
          { type: 'p', html: '지금까지는 영상 전체에 <b>하나의 임계값</b>을 썼습니다(전역 · global). 그런데 조명이 한쪽으로 기울면 <b>같은 흰 종이가 한쪽에서는 246, 다른 쪽에서는 93</b> 으로 찍힙니다. 이때 어떤 값 하나를 골라도 한쪽은 반드시 틀립니다 — 밝은 쪽 기준으로 잡으면 어두운 쪽 배경이 통째로 물체가 되고, 어두운 쪽 기준으로 잡으면 밝은 쪽 글자가 사라집니다.' },
          { type: 'image', src: 'images/uneven_light.png', caption: 'images/uneven_light.png — 왼쪽 위가 밝고 오른쪽 아래가 어두운 강한 조명 기울기. 글자 3줄 + 검은 점 32개 (4행 × 8열)' },
          { type: 'code', title: '예제 1: 전역 Otsu 의 실패를 숫자로 확인', code: EX_FAIL,
            desc: 'Otsu 가 고른 162 는 <b>밝은 쪽과 어두운 쪽 배경의 중간</b>입니다. 그 결과 오른쪽 아래 어두운 영역 전체가 "물체"로 잡혀 검출 픽셀이 <b>147364 개(48%)</b> 나 되고, 점 개수는 32 가 아니라 <b>12</b> 밖에 세어지지 않습니다(나머지는 거대한 덩어리에 흡수). 결과 창의 이진 영상을 보면 오른쪽 아래가 통째로 하얗게 된 것이 한눈에 보입니다. <code>countDots</code> 는 <code>connectedComponentsWithStats</code> 의 면적 · 폭 · 높이로 <b>점 크기의 덩어리만</b> 세는 도우미 함수입니다.',
            expect: '평균 164.3\n왼쪽 위 (40,40) = 246 / 오른쪽 아래 (600,440) = 93\n같은 흰 종이인데 배경 밝기가 246 과 93 — 하나의 임계값으로는 가를 수 없다\n전역 Otsu 임계값 162 -> 검출된 픽셀 147364 (전체의 48.0%)\n점(면적 150~400, 정사각형) 개수 = 12 개 — 정답은 32 개' },
          { type: 'h', text: '적응형 이진화: 픽셀마다 다른 임계값' },
          { type: 'p', html: '해결책은 간단합니다 — <b>임계값을 픽셀마다 다르게</b> 두는 것입니다. 각 픽셀의 <b>주변 blockSize × blockSize</b> 영역의 평균(또는 가우시안 가중 평균)을 구하고, 거기서 <b>C</b> 를 뺀 값을 그 픽셀의 임계값으로 씁니다. 배경이 어두운 곳에서는 기준선도 함께 내려가므로 조명 기울기가 <b>저절로 상쇄</b>됩니다.' },
          { type: 'figure', html: FIG_ADAPT, caption: '그림 3. 전역 임계값은 어두운 쪽에서 실패하지만, 주변 평균 − C 를 쓰는 적응형은 배경을 따라 내려간다' },
          { type: 'code', title: '예제 2: adaptiveThreshold 로 점 32개 모두 찾기', code: EX_ADAPT,
            desc: '<code>blockSize 51, C 15</code> 로 <b>점 32개(4행 × 8열)를 정확히</b> 찾았습니다 — 정답과 일치합니다. <code>ADAPTIVE_THRESH_MEAN_C</code> 는 주변의 <b>단순 평균</b>, <code>ADAPTIVE_THRESH_GAUSSIAN_C</code> 는 중심에 가중치를 더 주는 <b>가우시안 가중 평균</b>을 씁니다. GAUSSIAN_C 가 보통 조금 더 부드럽고 잡음에 강하지만, 이 영상처럼 잡음이 적으면 결과는 거의 같습니다. 결과 창에서 오른쪽 아래 글자까지 살아난 것을 확인하세요. 다섯째 인수(<code>THRESH_BINARY</code> 또는 <code>_INV</code>)만 받으며, OTSU 플래그는 쓸 수 없습니다.',
            expect: 'Adaptive MEAN_C (block 51, C 15): 흰 픽셀 23135, 점 32 개\nAdaptive GAUSSIAN_C (block 51, C 15): 흰 픽셀 20614, 점 32 개' },
          { type: 'code', title: '예제 3: blockSize 와 C 의 효과 (+ 짝수 blockSize 는 cv::Exception)', code: EX_PARAM,
            desc: '<b>blockSize</b> 는 "배경으로 볼 범위"입니다 — 너무 작으면(21) 글자 획 내부까지 배경으로 보아 획이 속이 비고, 너무 크면(101) 조명 변화를 못 따라갑니다. 대략 <b>찾으려는 물체(글자 · 점)보다 2~3배 큰 홀수</b>가 좋습니다. <b>C</b> 는 "주변 평균보다 얼마나 더 어두워야 물체로 볼지"입니다 — 키우면 깔끔해지지만 연한 글자가 사라지고, 줄이면 배경 잡음이 점점이 남습니다. 마지막의 <code>blockSize 50</code> 은 짝수라서 OpenCV 가 <b><code>cv::Exception</code></b> 을 던집니다. <code>try / catch (const cv::Exception&amp; e)</code> 로 잡으면 프로그램이 죽지 않고, <code>e.what()</code> 으로 전체 오류 메시지(실패한 조건식 <code>blockSize % 2 == 1 &amp;&amp; blockSize &gt; 1</code> 포함)를 볼 수 있습니다.',
            expect: 'blockSize  21 C 15 : 흰 픽셀  20323\nblockSize  51 C 15 : 흰 픽셀  23135\nblockSize 101 C 15 : 흰 픽셀  24266\nblockSize  51 C  5 : 흰 픽셀  25349\nblockSize  51 C 15 : 흰 픽셀  23135\nblockSize  51 C 25 : 흰 픽셀  21489\nblockSize 50 (짝수) -> 오류! blockSize 는 3 이상의 홀수여야 한다' },
          { type: 'table', head: ['매개변수', '작게 하면', '크게 하면', '시작값'], rows: [
            ['<code>blockSize</code>', '글자 획 속이 빈다 (배경 범위가 좁음)', '조명 변화를 못 따라간다 (전역에 가까워짐)', '물체 크기의 2~3배 <b>홀수</b> (예: 51)'],
            ['<code>C</code>', '배경 잡음이 점점이 남는다', '연한 물체가 사라진다', '<b>5~20</b> (예: 15)'],
            ['<code>MEAN_C</code> / <code>GAUSSIAN_C</code>', '—', '—', '잡음 있으면 <b>GAUSSIAN_C</b>']
          ], caption: '표 2. 적응형 이진화 매개변수 조정 가이드 — 두 값을 번갈아 조금씩 바꾸며 눈으로 맞춘다' },
          { type: 'callout', kind: 'warn', title: '적응형 이진화의 주의점', html: '<ul><li><b>blockSize 는 3 이상의 홀수</b> (짝수면 <code>cv::Exception</code>). 중심 픽셀이 있어야 하기 때문입니다. 트랙바 값처럼 사용자가 고르는 값이면 <code>int bs = pos | 1;</code> 로 홀수를 보장하세요.</li><li><b>1채널 8비트(CV_8UC1)만</b> 받습니다 — 컬러는 먼저 <code>COLOR_BGR2GRAY</code>.</li><li><b>넓고 평평한 영역</b>(예: 큰 부품의 내부)은 주변 평균과 값이 비슷해 <b>속이 비어</b> 보입니다. 큰 물체의 실루엣을 얻는 데는 적응형이 오히려 불리합니다 — 그럴 때는 전역 Otsu 나 조명 보정(배경 나누기)을 쓰세요.</li><li>적응형은 <b>얇은 글자 · 작은 점 · 에지</b>를 뽑는 데 강합니다 (OCR · 바코드 전처리).</li></ul>' },
          { type: 'h', text: '이진 마스크 활용하기' },
          { type: 'code', title: '예제 4: bitwise_and 로 물체만 남기기 · 마스크 반전', code: EX_MASK,
            desc: '이진 영상은 그 자체로 <b>마스크</b>입니다. <code>bitwise_and(img, img, dst, bin)</code> 으로 부품만 남기고, <code>bitwise_not</code>(또는 <code>~bin</code>)으로 반전하면 배경만 남습니다. <code>mean(img, mask)</code> 로 <b>영역별 평균 밝기</b>를 재면 부품과 배경의 밝기가 크게 다르게 나옵니다 — 이진화가 제대로 되었는지 <b>숫자로 검증</b>하는 좋은 방법입니다. 두 값이 비슷하게 나오면 임계값이 잘못된 것입니다.',
            expect: '임계값 125, 부품 픽셀 46478\n부품 영역 평균 밝기 29.8\n배경 영역 평균 밝기 220.7\n면적 500 이상 덩어리 11 개 / 전체 성분 11 개' },
          { type: 'h', text: '이진화 → 개수 세기 → 저장: 전체 파이프라인' },
          { type: 'figure', html: FIG_PIPE, caption: '그림 4. 컬러 입력 → Gray → 이진화 → 마스크 활용 / 개수 세기 → 판정. 이 흐름이 검사 프로그램의 기본 골격' },
          { type: 'code', title: '예제 5: 컬러 입력부터 저장까지 (흔한 오류 포함)', code: EX_PIPE,
            desc: '컬러 Mat 을 그대로 Otsu 에 넣으면 <code>cv::Exception</code> 이 던져집니다: <code>THRESH_OTSU mode: src_type == CV_8UC1</code>. 이 메시지를 만나면 <code>cvtColor(..., COLOR_BGR2GRAY)</code> 를 빠뜨린 것입니다. 정면 조명 컬러 영상은 그림자 때문에 백라이트보다 이진화가 어려워 Otsu 가 137 을 고르고 덩어리가 <b>9 개</b>로 나옵니다(실제 13개) — 05차시의 <b>HSV 색 분리</b>나 09차시의 <b>모폴로지</b>로 개선할 수 있습니다. <code>mean(color, bin)</code> 처럼 <b>컬러 영상에 1채널 마스크</b>를 줄 수 있습니다. <code>imwrite</code> 는 성공 여부를 <code>bool</code> 로 돌려주며, 저장한 파일은 왼쪽 <b>📁 작업 폴더</b>에서 내려받을 수 있습니다.',
            expect: '입력 채널 3\n오류: THRESH_OTSU 는 src_type == CV_8UC1 이어야 한다 (지금은 CV_8UC3)\nGray 로 바꾼 뒤 Otsu = 137, 흰 픽셀 30052\n마스크 안 평균색 BGR = 154, 172, 180\n면적 500 이상 덩어리 9 개\n저장: true (📁 작업 폴더에서 내려받기)' },
          { type: 'callout', kind: 'tip', title: '이진화 결과를 의심하는 습관', html: '이진화는 뒤의 모든 단계를 좌우하므로 <b>항상 검증</b>하세요.<ul><li><code>countNonZero</code> 비율이 상식적인가? (부품이 화면의 5~30% 정도)</li><li><code>mean(img, mask)</code> 와 <code>mean(img, inv)</code> 의 차이가 충분히 큰가?</li><li>Otsu 반환값이 평소와 비슷한가? (조명 이상 감지)</li><li>덩어리 개수가 예상과 맞는가? 너무 많으면 잡음 → 블러(08차시) · 모폴로지(09차시)</li></ul>' },
          { type: 'callout', kind: 'vs', title: 'Visual Studio 에서는 — 오류로 죽는 프로그램 막기', html: '로컬 PC 에서 <code>cv::Exception</code> 을 잡지 않으면 콘솔 창에 오류 메시지가 찍히고 프로그램이 <b>abort</b> 됩니다(디버거에서는 “처리되지 않은 예외” 창). 검사 장비 프로그램은 하루 종일 돌아야 하므로 <b>프레임 처리 함수 전체를 <code>try { ... } catch (const cv::Exception&amp; e) { 로그 남기고 NG 처리 }</code> 로 감싸는 것</b>이 기본입니다. 디버깅 중에는 <b>예외 설정</b>(Ctrl+Alt+E)에서 C++ 예외를 켜 두면 던져지는 바로 그 줄에서 멈춥니다. 적응형 이진화 매개변수를 트랙바로 조절하는 도구는 16차시에서 만듭니다.' },
          { type: 'callout', kind: 'tip', teacher: true, title: '오개념 지도 · 평가 루브릭', html: '<ul><li>수업 전 준비: 예제 1(전역 실패)과 예제 2(적응형 성공)의 <b>결과 이미지를 나란히</b> 띄워 두면 설명이 3분으로 줄어듭니다.</li><li>오개념 ①: <b>“적응형이 항상 낫다”</b> → 큰 부품의 실루엣은 속이 비어 실패한다는 것을 <code>washers.png</code> 에 적응형을 적용해 보여 주면 확실합니다.</li><li>오개념 ②: <b>blockSize 를 짝수로</b> → 예외 메시지를 미리 보여 줍니다(예제 3). <code>try/catch</code> 를 처음 쓰는 학생에게는 “OpenCV 는 잘못된 인수를 오류 코드가 아니라 예외로 알린다”를 강조.</li><li>오개념 ③: <b>“이진화 결과는 눈으로만 확인”</b> → countNonZero · mean(mask) 로 숫자 검증하는 습관을 강조.</li><li>평가 루브릭(5점): ① 물체가 흰색이 되게 방식 선택(1) ② Otsu 반환값 출력(1) ③ 전역 실패를 설명(1) ④ 적응형으로 점 32개 검출(1) ⑤ 마스크 활용 · 저장(1).</li><li>💬 마무리 발문: “점 32개는 찾았지만 글자 획이 끊어져 보입니다. 어떻게 메울까요?” → 09차시 모폴로지(닫기)로 연결.</li></ul>' }
        ],
        practice: [
          {
            title: '적응형 이진화로 점 32개 찾아 표시하기', level: 2,
            desc: '<code>images/uneven_light.png</code> 에서 <b>검은 점 32개</b>를 모두 찾아 개수를 출력하세요. <code>adaptiveThreshold(MEAN_C, BINARY_INV, blockSize 51, C 15)</code> 로 이진화한 뒤, <code>connectedComponentsWithStats</code> 의 덩어리 중 <b>면적 150~400 이고 폭 · 높이가 12~22</b> 인 것만 세면 글자를 걸러 낼 수 있습니다. 찾은 점의 중심(<code>centroids</code>)에 빨간 원을 그려 표시하고, 첫 점의 중심 좌표도 출력하세요.',
            hint: '<code>centroids</code> 는 <b>CV_64F</b> Mat 이라 <code>centroids.at&lt;double&gt;(i, 0)</code> 이 x, <code>(i, 1)</code> 이 y 입니다. 원을 그리려면 흑백 영상을 <code>cvtColor(img, view, COLOR_GRAY2BGR)</code> 로 3채널로 바꾸세요. 개수가 35~36 으로 나오면 조건이 느슨한 것이고, 12~13 으로 나오면 전역 이진화를 쓴 것입니다.',
            expect: '흰 픽셀 23135\n점 32 개 (첫 점 중심 (70, 250))',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/uneven_light.png", IMREAD_GRAYSCALE);
    Mat bin;
    adaptiveThreshold(img, bin, 255, ADAPTIVE_THRESH_MEAN_C, THRESH_BINARY_INV, 51, 15);
    cout << "흰 픽셀 " << countNonZero(bin) << endl;

    Mat labels, stats, centroids;
    int n = connectedComponentsWithStats(bin, labels, stats, centroids);
    int dots = 0;
    // TODO: 면적 150~400, 폭 · 높이 12~22 인 덩어리만 세고, 중심에 원을 그리고, 첫 점의 중심을 출력하세요

    cout << "점 " << dots << " 개" << endl;
    imshow("adaptive", bin);
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/uneven_light.png", IMREAD_GRAYSCALE);
    Mat bin;
    adaptiveThreshold(img, bin, 255, ADAPTIVE_THRESH_MEAN_C, THRESH_BINARY_INV, 51, 15);
    cout << "흰 픽셀 " << countNonZero(bin) << endl;

    Mat view;
    cvtColor(img, view, COLOR_GRAY2BGR);
    Mat labels, stats, centroids;
    int n = connectedComponentsWithStats(bin, labels, stats, centroids);
    int dots = 0, firstX = 0, firstY = 0;
    for (int i = 1; i < n; i++)
    {
        int a = stats.at<int>(i, CC_STAT_AREA);
        int w = stats.at<int>(i, CC_STAT_WIDTH), h = stats.at<int>(i, CC_STAT_HEIGHT);
        if (a < 150 || a > 400) continue;
        if (w < 12 || w > 22 || h < 12 || h > 22) continue;
        int cx = (int)centroids.at<double>(i, 0), cy = (int)centroids.at<double>(i, 1);
        dots++;
        if (dots == 1) { firstX = cx; firstY = cy; }
        circle(view, Point(cx, cy), 14, Scalar(0, 0, 255), 2);
    }
    cout << "점 " << dots << " 개 (첫 점 중심 (" << firstX << ", " << firstY << "))" << endl;
    imshow("result", view);
    waitKey(0);
    return 0;
}`
          },
          {
            title: '이진화 파이프라인 완성하고 저장하기', level: 2,
            desc: '<code>images/nuts_bolts_color.png</code>(컬러)를 입력으로 ① Gray 변환 ② Otsu 이진화 ③ <code>bitwise_and</code> 로 부품만 남기기 ④ 면적 500 이상 덩어리 수 세기 ⑤ <code>imwrite("out/parts.png", ...)</code> 로 저장까지 하는 프로그램을 완성하세요. 저장한 파일은 왼쪽 <b>📁 작업 폴더</b>에서 확인할 수 있습니다.',
            hint: '컬러를 바로 <code>threshold(..., THRESH_OTSU)</code> 에 넣으면 <code>src_type == CV_8UC1</code> 예외가 납니다 — <code>cvtColor(color, gray, COLOR_BGR2GRAY)</code> 가 먼저입니다. 마스크로 남긴 컬러 영상은 <code>bitwise_and(color, color, only, bin)</code> 의 결과를 쓰세요. <code>imwrite</code> 의 반환값(bool)은 <code>(ok ? "true" : "false")</code> 로 출력하면 읽기 좋습니다.',
            expect: 'Otsu 임계값 137\n부품 픽셀 30052 (9.78%)\n덩어리 9 개\n부품 평균색 BGR = 154, 172, 180\n저장 완료: true',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat color = imread("images/nuts_bolts_color.png", IMREAD_COLOR);
    Mat gray;
    // TODO: ① COLOR_BGR2GRAY

    Mat bin;
    // TODO: ② Otsu 이진화 (물체가 배경보다 밝다) + 임계값 · 부품 픽셀 비율 출력

    Mat only;
    // TODO: ③ bitwise_and 로 부품만 남기기

    // TODO: ④ connectedComponentsWithStats 로 면적 500 이상 덩어리 수 · 부품 평균색 출력

    // TODO: ⑤ imwrite("out/parts.png", only) 로 저장하고 결과 출력
    imshow("input", color);
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat color = imread("images/nuts_bolts_color.png", IMREAD_COLOR);
    Mat gray;
    cvtColor(color, gray, COLOR_BGR2GRAY);

    Mat bin;
    double t = threshold(gray, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    cout << "Otsu 임계값 " << t << endl;
    int white = countNonZero(bin);
    cout << format("부품 픽셀 %d (%.2f%%)", white, 100.0 * white / bin.total()) << endl;

    Mat only;
    bitwise_and(color, color, only, bin);

    Mat labels, stats, centroids;
    int n = connectedComponentsWithStats(bin, labels, stats, centroids);
    int cnt = 0;
    for (int i = 1; i < n; i++)
        if (stats.at<int>(i, CC_STAT_AREA) >= 500) cnt++;
    cout << "덩어리 " << cnt << " 개" << endl;
    Scalar m = mean(color, bin);
    cout << format("부품 평균색 BGR = %.0f, %.0f, %.0f", m[0], m[1], m[2]) << endl;
    bool ok = imwrite("out/parts.png", only);
    cout << "저장 완료: " << (ok ? "true" : "false") << endl;
    imshow("parts", only);
    waitKey(0);
    return 0;
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: '이진화 (2) 적응형 이진화와 마스크 활용', subtitle: '조명이 기울어도 되는 이진화', notes: '<p>1교시 마지막 질문을 다시 꺼냅니다: “한 장 안에서 배경이 246 과 93 이면?” 오늘의 답: 픽셀마다 다른 임계값. (2분)</p>' },
          { layout: 'image', title: '전역 이진화가 실패하는 영상', src: 'images/uneven_light.png', caption: '왼쪽 위 밝고 오른쪽 아래 어둡다 · 글자 3줄 + 검은 점 32개', notes: '<p>💬 “이 영상에서 임계값 하나를 고른다면 몇으로 하겠습니까?” 학생 답을 두세 개 받아 칠판에 적고, 어느 값을 골라도 한쪽이 망가진다는 것을 다음 예제로 확인합니다. (3분)</p>' },
          { layout: 'code', title: '예제: 전역 Otsu 의 실패 vs 적응형', code: S_FAIL, points: ['배경 밝기 246 vs 93 — 한 값으로 불가능', '전역 Otsu t=162 → 48% 가 “물체”로 잡힘', '적응형은 흰 픽셀 23135 (7.5%)', '두 결과 이미지를 꼭 비교해 보기'], notes: '<p>결과 창의 두 이미지가 이 교시의 핵심 체험입니다. 전역 결과의 오른쪽 아래가 통째로 하얗게 된 것을 손으로 가리켜 주세요. (6분)</p>' },
          { layout: 'diagram', title: '적응형 이진화의 원리', html: FIG_ADAPT, caption: '임계값 = (주변 blockSize×blockSize 평균) − C → 배경을 따라 내려간다', notes: '<p>프로파일 그림으로 “기준선이 배경을 따라간다”를 설명합니다. blockSize 와 C 의 역할을 그림 위에서 짚어 줍니다. 💬 “C 를 0 으로 하면 무슨 일이 생길까?” — 평균보다 조금만 어두워도 물체 → 잡음이 점점이. (5분)</p>' },
          { layout: 'code', title: '예제: adaptiveThreshold 로 점 32개', code: S_ADAPT, points: ['<code>ADAPTIVE_THRESH_MEAN_C</code> = 주변 단순 평균 · <code>GAUSSIAN_C</code> = 가중 평균', 'blockSize <b>51 (홀수!)</b>, C 15', '<code>stats.at&lt;int&gt;(i, CC_STAT_AREA)</code> 로 크기 조건 → 점만 세기', '결과 <b>32 개</b> = 정답 (4행 × 8열)'], notes: '<p>정답과 일치하는 순간이 학생들에게 가장 큰 성취감을 줍니다. 크기 조건(면적 · 폭)이 왜 필요한지 글자 블롭의 크기와 비교해 설명합니다. 💬 “높이 조건을 지우면?” — 글자 획 조각까지 세어져 62 개가 됩니다(직접 실행해 보게 하세요). (7분)</p>' },
          { layout: 'table', title: 'blockSize 와 C 조정 가이드', head: ['매개변수', '작게', '크게', '시작값'], rows: [
            ['<code>blockSize</code>', '글자 획 속이 빈다', '전역에 가까워진다', '물체의 2~3배 <b>홀수</b> (51)'],
            ['<code>C</code>', '배경 잡음이 남는다', '연한 물체가 사라진다', '5~20 (15)'],
            ['방식', '<code>MEAN_C</code> 단순', '<code>GAUSSIAN_C</code> 부드럽다', '잡음 있으면 GAUSSIAN']
          ], lead: '두 값을 번갈아 조금씩 바꾸며 눈으로 맞춘다', notes: '<p>본문 예제 3 의 숫자(흰 픽셀 수)를 함께 보며 표를 확인합니다: C 를 5 → 25 로 키우면 흰 픽셀이 줄어듭니다. 짝수 blockSize 는 <code>cv::Exception</code> — 예제 3 의 try/catch 를 보여 줍니다. (5분)</p>' },
          { layout: 'bullets', title: '적응형이 오히려 불리한 경우', lead: '“적응형이 항상 낫다”는 오해', bullets: [
            '<b>넓고 평평한 영역</b>(큰 부품 내부)은 주변 평균과 비슷해 <b>속이 빈다</b>',
            '큰 물체의 <b>실루엣 · 면적 측정</b>에는 전역 Otsu 가 유리 (백라이트 영상)',
            '적응형이 강한 곳: <b>얇은 글자 · 작은 점 · 저대비 에지</b> (OCR · 바코드 전처리)',
            ['조명 불균일의 다른 해법', ['배경 추정 후 나누기(flat-field)', 'top-hat / black-hat 모폴로지 (09차시)']]
          ], notes: '<p>washers.png 에 적응형을 적용해 속이 빈 결과를 시연하면 오개념이 즉시 교정됩니다. 시간이 없으면 말로만 설명하고 숙제로 냅니다. (4분)</p>' },
          { layout: 'code', title: '예제: 마스크로 물체만 남기기', code: S_MASK, points: ['이진 영상 = 그대로 <b>마스크</b>', '<code>bitwise_and(img, img, dst, bin)</code> → 부품만', '<code>bitwise_not(bin, inv)</code> (= <code>~bin</code>) → 배경 마스크', '<code>mean(img, mask)</code> 로 <b>숫자 검증</b> (29.8 vs 220.7)'], notes: '<p>“이진화가 잘 됐는지 눈이 아니라 숫자로 확인한다”는 실무 습관을 심어 줍니다. 두 평균이 비슷하면 임계값이 잘못된 것. (5분)</p>' },
          { layout: 'diagram', title: '검사 파이프라인', html: FIG_PIPE, caption: '컬러 → Gray → 이진화 → 마스크 / 개수 → 판정', notes: '<p>지금까지 배운 것(05 색 변환, 06 히스토그램, 07 이진화)이 하나의 흐름으로 연결되는 장면입니다. 12차시 이후가 오른쪽 두 칸을 자세히 다룬다고 예고. (3분)</p>' },
          { layout: 'code', title: '예제: 컬러부터 저장까지', code: S_PIPE, points: ['컬러를 바로 Otsu → <b>cv::Exception</b> (CV_8UC1 필요)', '① Gray ② 이진화 ③ 개수 ④ <code>imwrite</code>', '저장 파일은 📁 작업 폴더에서 내려받기', '정면 조명 + 그림자 → 9개 (실제 13개)'], notes: '<p>본문 예제 5 로 예외 메시지를 일부러 한 번 보여 주는 것이 좋습니다(학생들이 나중에 반드시 만납니다). 왜 13 이 아니고 9 인지 물어 그림자 문제를 짚고 05차시 HSV · 09차시 모폴로지로 연결합니다. (6분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>adaptiveThreshold</code> 의 <code>blockSize</code> 는?', options: ['결과 영상 크기', '임계값을 계산할 주변 영역의 한 변 — 3 이상의 홀수', '반복 횟수', '임계값'], answer: 1, explain: '주변 blockSize × blockSize 의 평균 − C 가 그 픽셀의 임계값입니다. 중심 픽셀이 있어야 하므로 홀수만 됩니다(짝수 → <code>cv::Exception</code>).', notes: '<p>정답 2번. 짝수를 넣으면 나는 예외 메시지를 함께 떠올리게 합니다.</p>' },
          { layout: 'practice', title: '실습: 파이프라인 완성하기', desc: '<p><code>nuts_bolts_color.png</code> 로 ① Gray ② Otsu ③ bitwise_and ④ 개수 ⑤ 저장까지 완성하세요.</p><ul><li>컬러를 바로 Otsu 에 넣으면? → 예외 확인</li><li>저장: <code>imwrite("out/parts.png", only)</code></li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat color = imread("images/nuts_bolts_color.png");
    Mat gray;
    // TODO: Gray -> Otsu -> bitwise_and -> 개수 -> imwrite
    imshow("input", color);
    waitKey(0);
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat color = imread("images/nuts_bolts_color.png");
    Mat gray, bin, only, labels, stats, cents;
    cvtColor(color, gray, COLOR_BGR2GRAY);
    double t = threshold(gray, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    bitwise_and(color, color, only, bin);
    int n = connectedComponentsWithStats(bin, labels, stats, cents), cnt = 0;
    for (int i = 1; i < n; i++)
        if (stats.at<int>(i, CC_STAT_AREA) >= 500) cnt++;
    bool ok = imwrite("out/parts.png", only);
    cout << "Otsu " << t << ", 덩어리 " << cnt << " 개, 저장 " << (ok ? "true" : "false") << endl;
    imshow("parts", only);
    waitKey(0);
    return 0;
}`, notes: '<p>정답: Otsu 137, 덩어리 9개. 📁 작업 폴더를 열어 저장된 PNG 를 함께 확인하면 “결과를 파일로 남긴다”는 실감이 생깁니다. (7분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['조명이 기울면 <b>전역 임계값 하나로는 불가능</b> (Otsu 도 실패)', '<code>adaptiveThreshold(src, dst, 255, MEAN_C/GAUSSIAN_C, THRESH_BINARY_INV, blockSize, C)</code>', '임계값 = <b>주변 평균 − C</b> · blockSize 는 <b>3 이상 홀수</b> (아니면 <code>cv::Exception</code>)', 'blockSize 는 물체의 2~3배, C 는 5~20 에서 시작', '넓고 평평한 영역은 속이 빈다 → 큰 실루엣은 전역 Otsu', '이진 영상 = 마스크: <code>bitwise_and</code> · <code>bitwise_not</code> · <code>mean(img, mask)</code> 로 검증', '컬러는 반드시 <b>Gray 먼저</b> · 결과는 <code>imwrite</code> 로 저장', '다음 차시: 잡음을 다루는 <b>필터링</b> (블러 · 샤프닝 · 미디언)'], notes: '<p>정리 후 남은 문제를 제시합니다: “점은 찾았지만 글자 획이 끊어지고 배경에 잡티가 남았다.” → 08차시 필터링, 09차시 모폴로지로 이어집니다. (2분)</p>' }
        ]
      }
    ]
  });
})();
