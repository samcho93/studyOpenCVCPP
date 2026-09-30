/* 06차시 밝기 · 대비 · 히스토그램 */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 밝기(더하기) · 대비(곱하기) 의 입출력 그래프와 포화
  const FIG_BRIGHT = `<svg viewBox="0 0 720 330" role="img" aria-label="입력 밝기를 가로축, 출력 밝기를 세로축으로 둔 그래프. 더하기는 선을 위로 밀고 곱하기는 기울기를 키우며, 255 를 넘으면 평평해진다">
  ${ARROW('c06a1')}
  <line x1="80" y1="290" x2="355" y2="290" class="ax" marker-end="url(#c06a1)"/>
  <line x1="80" y1="290" x2="80" y2="25" class="ax" marker-end="url(#c06a1)"/>
  <text x="360" y="295" class="tx-m">입력</text>
  <text x="60" y="22" text-anchor="end" class="tx-m">출력</text>
  <text x="76" y="308" text-anchor="middle" class="tx-m">0</text>
  <text x="208" y="308" text-anchor="middle" class="tx-m">128</text>
  <text x="335" y="308" text-anchor="middle" class="tx-m">255</text>
  <text x="70" y="40" text-anchor="end" class="tx-m">255</text>
  <line x1="80" y1="35" x2="335" y2="35" class="ln" stroke-dasharray="4 4"/>
  <polyline points="80,290 335,35" class="s1" fill="none"/>
  <text x="300" y="80" class="tx">y = x (원본)</text>
  <polyline points="80,240 285,35 335,35" class="s3" fill="none" stroke-width="3"/>
  <text x="92" y="228" class="tx">y = x + 50 (밝기)</text>
  <polyline points="80,290 250,35 335,35" class="s2" fill="none" stroke-width="3"/>
  <text x="150" y="120" class="tx">y = 1.5x (대비)</text>
  <text x="262" y="26" class="tx-m">← 255 에서 잘림 (포화)</text>
  <rect x="400" y="40" width="300" height="70" rx="8" class="p3s"/>
  <text x="416" y="66" class="tx-b">밝기 = 더하기 (beta)</text>
  <text x="416" y="90" class="tx-m">선이 위아래로 평행 이동 — 전체가 밝아진다</text>
  <rect x="400" y="124" width="300" height="70" rx="8" class="p2s"/>
  <text x="416" y="150" class="tx-b">대비 = 곱하기 (alpha)</text>
  <text x="416" y="174" class="tx-m">기울기가 커진다 — 밝은 곳은 더 밝게,</text>
  <text x="416" y="190" class="tx-m">어두운 곳은 덜 → 차이가 벌어진다</text>
  <rect x="400" y="208" width="300" height="88" rx="8" class="p1s"/>
  <text x="416" y="234" class="tx-b">포화 (saturate_cast&lt;uchar&gt;)</text>
  <text x="416" y="258" class="tx-m">uchar 는 0~255 뿐 → 255 를 넘는 값은 255,</text>
  <text x="416" y="274" class="tx-m">0 보다 작은 값은 0 으로 잘린다.</text>
  <text x="416" y="290" class="tx-m">한 번 잘린 밝기는 되돌릴 수 없다!</text>
</svg>`;

  // 그림 2: 감마 곡선
  const FIG_GAMMA = `<svg viewBox="0 0 720 330" role="img" aria-label="감마 곡선. 감마가 1보다 작으면 어두운 부분이 크게 밝아지고, 1보다 크면 전체가 어두워진다">
  ${ARROW('c06a2')}
  <line x1="80" y1="290" x2="355" y2="290" class="ax" marker-end="url(#c06a2)"/>
  <line x1="80" y1="290" x2="80" y2="25" class="ax" marker-end="url(#c06a2)"/>
  <text x="360" y="295" class="tx-m">입력</text>
  <text x="60" y="22" text-anchor="end" class="tx-m">출력</text>
  <text x="76" y="308" text-anchor="middle" class="tx-m">0</text>
  <text x="208" y="308" text-anchor="middle" class="tx-m">128</text>
  <text x="335" y="308" text-anchor="middle" class="tx-m">255</text>
  <polyline points="80,290 144,162 208,109 272,69 335,35" class="s3" fill="none" stroke-width="3"/>
  <polyline points="80,290 335,35" class="s1" fill="none" stroke-dasharray="5 4"/>
  <polyline points="80,290 144,274 208,226 272,145 335,35" class="s2" fill="none" stroke-width="3"/>
  <text x="150" y="150" class="tx">gamma 0.5</text>
  <text x="250" y="120" class="tx-m">gamma 1.0 (그대로)</text>
  <text x="212" y="255" class="tx">gamma 2.0</text>
  <text x="400" y="60" class="tx-b">out = 255 × (in / 255)<tspan dy="-6" font-size="11">gamma</tspan></text>
  <rect x="400" y="80" width="300" height="88" rx="8" class="p3s"/>
  <text x="416" y="106" class="tx-b">gamma &lt; 1 (예: 0.5)</text>
  <text x="416" y="130" class="tx-m">어두운 쪽이 크게 밝아진다 → 그림자 속</text>
  <text x="416" y="146" class="tx-m">글자를 살릴 때. 128 → 181</text>
  <text x="416" y="162" class="tx-m">밝은 쪽은 255 를 넘지 않는다 (포화 없음)</text>
  <rect x="400" y="182" width="300" height="72" rx="8" class="p2s"/>
  <text x="416" y="208" class="tx-b">gamma &gt; 1 (예: 2.0)</text>
  <text x="416" y="232" class="tx-m">전체가 어두워진다 → 하얗게 날아간</text>
  <text x="416" y="248" class="tx-m">영상을 눌러 줄 때. 128 → 64</text>
  <text x="400" y="282" class="tx-m">곱하기 · 더하기와 달리 곡선이라 밝은 쪽을</text>
  <text x="400" y="300" class="tx-m">잘라먹지 않는다 → 1×256 CV_8U 표 + LUT()</text>
</svg>`;

  // 그림 3: 히스토그램이란
  const FIG_HIST = `<svg viewBox="0 0 720 300" role="img" aria-label="픽셀 값을 밝기별로 세어 막대로 그린 것이 히스토그램이다">
  ${ARROW('c06a3')}
  <text x="20" y="26" class="tx-b">픽셀 값 (4 × 4 조각)</text>
  <rect x="20" y="40" width="160" height="160" rx="6" class="card-bg"/>
  <text x="40" y="66" class="tx-m">10</text><text x="80" y="66" class="tx-m">12</text><text x="120" y="66" class="tx">200</text><text x="160" y="66" class="tx">205</text>
  <text x="40" y="100" class="tx-m">11</text><text x="80" y="100" class="tx-m">13</text><text x="120" y="100" class="tx">202</text><text x="160" y="100" class="tx">210</text>
  <text x="40" y="134" class="tx-m">9</text><text x="80" y="134" class="tx-m">12</text><text x="120" y="134" class="tx">198</text><text x="160" y="134" class="tx">203</text>
  <text x="40" y="168" class="tx-m">10</text><text x="80" y="168" class="tx-m">11</text><text x="120" y="168" class="tx">201</text><text x="160" y="168" class="tx">199</text>
  <text x="100" y="224" text-anchor="middle" class="tx-m">어두운 픽셀 8개</text>
  <text x="100" y="244" text-anchor="middle" class="tx-m">밝은 픽셀 8개</text>
  <line x1="196" y1="120" x2="246" y2="120" class="ln" stroke-width="2" marker-end="url(#c06a3)"/>
  <text x="221" y="108" text-anchor="middle" class="tx-m">세기</text>
  <line x1="280" y1="230" x2="700" y2="230" class="ax"/>
  <line x1="280" y1="230" x2="280" y2="40" class="ax"/>
  <text x="278" y="250" text-anchor="middle" class="tx-m">0</text>
  <text x="490" y="250" text-anchor="middle" class="tx-m">128</text>
  <text x="690" y="250" text-anchor="middle" class="tx-m">255</text>
  <text x="270" y="36" text-anchor="end" class="tx-m">개수</text>
  <rect x="292" y="70" width="14" height="160" class="p1"/>
  <rect x="640" y="70" width="14" height="160" class="p3"/>
  <text x="299" y="62" text-anchor="middle" class="tx-m">8</text>
  <text x="647" y="62" text-anchor="middle" class="tx-m">8</text>
  <text x="490" y="120" text-anchor="middle" class="tx-b">가로축 = 밝기 0~255 (256칸 = bin)</text>
  <text x="490" y="146" text-anchor="middle" class="tx-m">세로축 = 그 밝기를 가진 픽셀 수</text>
  <text x="490" y="176" text-anchor="middle" class="tx-m">가운데가 비어 있다 = 중간 밝기가 없다</text>
  <text x="490" y="196" text-anchor="middle" class="tx-m">→ 이진화에 아주 좋은 영상 (07차시)</text>
  <text x="490" y="280" text-anchor="middle" class="tx-m">막대 높이의 합 = 전체 픽셀 수. 히스토그램은 위치 정보를 버리고 개수만 남긴다</text>
</svg>`;

  // 그림 4: calcHist 인수 구조
  const FIG_CALC = `<svg viewBox="0 0 740 250" role="img" aria-label="calcHist 의 포인터 인수들이 무엇을 가리키는지 보여 주는 그림">
  ${ARROW('c06a5')}
  <text x="20" y="26" class="tx-b">calcHist(&amp;gray, 1, channels, Mat(), hist, 1, &amp;histSize, ranges);</text>
  <rect x="20" y="44" width="120" height="58" rx="8" class="p1s"/><text x="80" y="68" text-anchor="middle" class="tx-b">&amp;gray, 1</text><text x="80" y="88" text-anchor="middle" class="tx-m">영상 배열 · 개수</text>
  <rect x="150" y="44" width="120" height="58" rx="8" class="p2s"/><text x="210" y="68" text-anchor="middle" class="tx-b">channels</text><text x="210" y="88" text-anchor="middle" class="tx-m">{0} = 0번 채널</text>
  <rect x="280" y="44" width="100" height="58" rx="8" class="p4s"/><text x="330" y="68" text-anchor="middle" class="tx-b">Mat()</text><text x="330" y="88" text-anchor="middle" class="tx-m">마스크 없음</text>
  <rect x="390" y="44" width="100" height="58" rx="8" class="p3s"/><text x="440" y="68" text-anchor="middle" class="tx-b">hist, 1</text><text x="440" y="88" text-anchor="middle" class="tx-m">출력 · 1차원</text>
  <rect x="500" y="44" width="110" height="58" rx="8" class="p5s"/><text x="555" y="68" text-anchor="middle" class="tx-b">&amp;histSize</text><text x="555" y="88" text-anchor="middle" class="tx-m">bin 수 256</text>
  <rect x="620" y="44" width="100" height="58" rx="8" class="p1s"/><text x="670" y="68" text-anchor="middle" class="tx-b">ranges</text><text x="670" y="88" text-anchor="middle" class="tx-m">{0, 256}</text>
  <line x1="670" y1="104" x2="670" y2="134" class="ln" stroke-width="1.5" marker-end="url(#c06a5)"/>
  <rect x="520" y="138" width="200" height="54" rx="8" class="card-bg"/>
  <text x="620" y="160" text-anchor="middle" class="tx-m">float range[] = {0, 256};</text>
  <text x="620" y="180" text-anchor="middle" class="tx-m">const float* ranges[] = {range};</text>
  <line x1="440" y1="104" x2="440" y2="134" class="ln" stroke-width="1.5" marker-end="url(#c06a5)"/>
  <rect x="330" y="138" width="170" height="92" rx="8" class="card-bg"/>
  <text x="415" y="160" text-anchor="middle" class="tx-b">hist: CV_32FC1</text>
  <text x="415" y="180" text-anchor="middle" class="tx-m">256행 × 1열 (float)</text>
  <text x="415" y="200" text-anchor="middle" class="tx-m">hist.at&lt;float&gt;(i)</text>
  <text x="415" y="220" text-anchor="middle" class="tx-m">= 밝기 i 인 픽셀 수</text>
  <text x="20" y="160" class="tx-m">차원마다 배열 하나씩 —</text>
  <text x="20" y="180" class="tx-m">1차원(흑백)이라 원소가 1개뿐이어도</text>
  <text x="20" y="200" class="tx-m">배열 · 포인터로 넘긴다.</text>
  <text x="20" y="224" class="tx-m">상한 256 은 제외 → 0~255 포함</text>
</svg>`;

  // 그림 5: 평탄화 · CLAHE 개념
  const FIG_EQ = `<svg viewBox="0 0 720 300" role="img" aria-label="저대비 영상의 좁은 히스토그램을 넓게 펴는 것이 평탄화이고, 타일마다 제한을 두고 펴는 것이 CLAHE 이다">
  ${ARROW('c06a4')}
  <text x="20" y="26" class="tx-b">원본 (저대비): 102 ~ 134 에만 몰려 있다</text>
  <line x1="30" y1="150" x2="320" y2="150" class="ax"/>
  <text x="28" y="170" text-anchor="middle" class="tx-m">0</text>
  <text x="318" y="170" text-anchor="middle" class="tx-m">255</text>
  <rect x="146" y="60" width="8" height="90" class="p1"/>
  <rect x="154" y="44" width="8" height="106" class="p1"/>
  <rect x="162" y="52" width="8" height="98" class="p1"/>
  <rect x="170" y="72" width="8" height="78" class="p1"/>
  <rect x="178" y="96" width="8" height="54" class="p1"/>
  <text x="166" y="36" text-anchor="middle" class="tx-m">좁은 봉우리</text>
  <path d="M40,220 C120,220 200,120 310,96" class="s3" fill="none"/>
  <text x="60" y="244" class="tx-m">누적 히스토그램(CDF) — 이 곡선을 변환표로 쓴다</text>
  <line x1="336" y1="140" x2="386" y2="140" class="ln" stroke-width="2" marker-end="url(#c06a4)"/>
  <text x="361" y="128" text-anchor="middle" class="tx-m">평탄화</text>
  <text x="404" y="26" class="tx-b">equalizeHist: 0 ~ 255 전체로 펴진다</text>
  <line x1="410" y1="150" x2="700" y2="150" class="ax"/>
  <text x="408" y="170" text-anchor="middle" class="tx-m">0</text>
  <text x="698" y="170" text-anchor="middle" class="tx-m">255</text>
  <rect x="420" y="96" width="24" height="54" class="p2"/>
  <rect x="452" y="70" width="24" height="80" class="p2"/>
  <rect x="484" y="52" width="24" height="98" class="p2"/>
  <rect x="516" y="60" width="24" height="90" class="p2"/>
  <rect x="548" y="80" width="24" height="70" class="p2"/>
  <rect x="580" y="64" width="24" height="86" class="p2"/>
  <rect x="612" y="88" width="24" height="62" class="p2"/>
  <rect x="644" y="104" width="24" height="46" class="p2"/>
  <text x="556" y="196" text-anchor="middle" class="tx-m">간격이 벌어져 대비가 커진다 (잡음도 함께 커짐)</text>
  <rect x="30" y="256" width="660" height="34" rx="8" class="p4s"/>
  <text x="360" y="278" text-anchor="middle" class="tx">CLAHE = 영상을 <tspan class="tx-b">타일(8×8)</tspan> 로 나눠 각각 평탄화 + <tspan class="tx-b">clipLimit</tspan> 로 과도한 증폭을 잘라 냄</text>
</svg>`;

  // ---------------------------------------------------------------- 1교시 예제
  const EX_BRIGHT = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_gray.png", IMREAD_GRAYSCALE);
    cout << format("원본 평균 %.1f", mean(img)[0]) << endl;

    Mat bright = img + Scalar(50);          // 모든 픽셀에 +50 (연산자 — 포화 연산)
    Mat bright2, dark;
    add(img, Scalar(50), bright2);           // 같은 뜻 (함수)
    subtract(img, Scalar(50), dark);
    cout << format("+50 평균 %.1f, add 평균 %.1f, -50 평균 %.1f",
                   mean(bright)[0], mean(bright2)[0], mean(dark)[0]) << endl;

    Point pts[] = { Point(350, 60), Point(120, 110), Point(20, 20) };
    for (Point p : pts)
    {
        int o = img.at<uchar>(p.y, p.x);     // (행 y, 열 x)
        cout << "(" << p.x << "," << p.y << "): " << o
             << " -> +50 " << (int)bright.at<uchar>(p.y, p.x)
             << " / -50 " << (int)dark.at<uchar>(p.y, p.x) << endl;
    }
    double mn, mx, mn2, mx2;
    minMaxLoc(img, &mn, &mx);
    minMaxLoc(bright, &mn2, &mx2);
    cout << "최소/최대: 원본 " << mn << "/" << mx << " -> +50 " << mn2 << "/" << mx2
         << "  (255 에서 막힘 = 포화)" << endl;
    imshow("bright", bright);
    waitKey(0);
    return 0;
}`;

  const EX_CONTRAST = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/low_contrast.png", IMREAD_GRAYSCALE);
    Scalar m0, s0;
    meanStdDev(img, m0, s0);
    cout << format("원본 평균 %.1f, 표준편차 %.1f", m0[0], s0[0]) << endl;

    double alphas[] = { 1.0, 2.0, 3.0 };
    for (double a : alphas)
    {
        Mat dst;
        img.convertTo(dst, -1, a, 0);          // dst = saturate(img x a + 0), -1 = 형식 그대로(CV_8U)
        Scalar m, s;
        double mn, mx;
        meanStdDev(dst, m, s);
        minMaxLoc(dst, &mn, &mx);
        cout << format("alpha=%.1f: 평균 %.1f 표준편차 %.1f 최소/최대 %.0f/%.0f", a, m[0], s[0], mn, mx) << endl;
    }
    Mat fixed1;
    img.convertTo(fixed1, -1, 3.0, -250);      // 대비 3배 + 밝기 -250
    Scalar m2, s2;
    double mn3, mx3;
    meanStdDev(fixed1, m2, s2);
    minMaxLoc(fixed1, &mn3, &mx3);
    cout << format("alpha=3.0, beta=-250: 평균 %.1f 표준편차 %.1f 최소/최대 %.0f/%.0f", m2[0], s2[0], mn3, mx3) << endl;
    imshow("contrast", fixed1);
    waitKey(0);
    return 0;
}`;

  const EX_MANUAL = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

// dst = alpha x src + beta 를 행 포인터 루프로 직접 계산한다
Mat applyManual(const Mat& src, double alpha, double beta, bool useSaturate)
{
    Mat dst(src.size(), CV_8UC1);
    for (int y = 0; y < src.rows; y++)
    {
        const uchar* s = src.ptr<uchar>(y);    // y 행의 첫 픽셀 주소
        uchar* d = dst.ptr<uchar>(y);
        for (int x = 0; x < src.cols; x++)
        {
            double v = alpha * s[x] + beta;
            if (useSaturate)
                d[x] = saturate_cast<uchar>(v);   // 반올림 + 0~255 로 자르기
            else
                d[x] = (uchar)(int)v;             // 잘못: 256 -> 0, 300 -> 44 로 넘쳐 돌아온다
        }
    }
    return dst;
}

int main()
{
    Mat img = imread("images/low_contrast.png", IMREAD_GRAYSCALE);

    // (1) alpha 3, beta -250: saturate_cast 로 직접 구현 -> convertTo 와 비교
    Mat mine = applyManual(img, 3.0, -250, true), byCv;
    img.convertTo(byCv, -1, 3.0, -250);
    cout << "alpha 3, beta -250: convertTo 와 다른 픽셀 " << countNonZero(mine != byCv) << endl;

    // (2) alpha 2, beta 0: 값이 204~268 -> 255 를 넘는 픽셀이 생긴다
    Mat good = applyManual(img, 2.0, 0, true);
    Mat bad = applyManual(img, 2.0, 0, false);
    img.convertTo(byCv, -1, 2.0, 0);
    cout << "alpha 2 (saturate_cast): 다른 픽셀 " << countNonZero(good != byCv)
         << format(", 평균 %.1f", mean(good)[0]) << endl;
    cout << "alpha 2 ((uchar) 변환) : 다른 픽셀 " << countNonZero(bad != byCv)
         << format(", 평균 %.1f", mean(bad)[0]) << endl;
    imshow("saturate_cast", good);
    imshow("overflow (wrong)", bad);
    waitKey(0);
    return 0;
}`;

  const EX_BLEND = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat a = imread("images/sample_gray.png", IMREAD_GRAYSCALE);
    Mat b = imread("images/gradient_clean.png", IMREAD_GRAYSCALE);
    cout << format("a %dx%d 평균 %.1f / b %dx%d 평균 %.1f",
                   a.cols, a.rows, mean(a)[0], b.cols, b.rows, mean(b)[0]) << endl;
    double ws[] = { 0.0, 0.3, 0.5, 0.7, 1.0 };
    for (double w : ws)
    {
        Mat dst;
        addWeighted(a, w, b, 1.0 - w, 0, dst);     // dst = a x w + b x (1-w) + 0
        cout << format("a x %.1f + b x %.1f -> 평균 %.1f", w, 1 - w, mean(dst)[0]) << endl;
    }
    Mat blend;
    addWeighted(a, 0.5, b, 0.5, 0, blend);
    imshow("blend", blend);
    waitKey(0);
    return 0;
}`;

  const EX_GAMMA = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <cmath>
using namespace cv;
using namespace std;

// 256칸 변환표(1행 256열, CV_8U)를 만든다
Mat makeGamma(double gamma)
{
    Mat table(1, 256, CV_8U);
    uchar* p = table.ptr<uchar>();
    for (int i = 0; i < 256; i++)
        p[i] = saturate_cast<uchar>(pow(i / 255.0, gamma) * 255.0);
    return table;
}

void printTable(const char* tag, const Mat& t)
{
    cout << tag;
    int keys[] = { 0, 64, 128, 192, 255 };
    for (int k : keys) cout << " " << k << "->" << (int)t.at<uchar>(k);
    cout << endl;
}

int main()
{
    Mat img = imread("images/sample_gray.png", IMREAD_GRAYSCALE);
    Mat lut = makeGamma(0.5), lut2 = makeGamma(2.0);
    printTable("gamma 0.5 표:", lut);
    printTable("gamma 2.0 표:", lut2);

    Mat bright, dark;
    LUT(img, lut, bright);        // 256칸 변환표를 한 번에 적용 (아주 빠름)
    LUT(img, lut2, dark);
    cout << format("원본 평균 %.1f / gamma 0.5 %.1f / gamma 2.0 %.1f",
                   mean(img)[0], mean(bright)[0], mean(dark)[0]) << endl;
    double mn, mx;
    minMaxLoc(bright, &mn, &mx);
    cout << "gamma 0.5 최소/최대 " << mn << "/" << mx << " (포화 없음)" << endl;
    imshow("gamma 0.5", bright);
    waitKey(0);
    return 0;
}`;

  const EX_NORM = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/low_contrast.png", IMREAD_GRAYSCALE);
    double mn, mx;
    Scalar m0, s0;
    minMaxLoc(img, &mn, &mx);
    meanStdDev(img, m0, s0);
    cout << format("원본: 최소 %.0f 최대 %.0f 평균 %.1f 표준편차 %.1f", mn, mx, m0[0], s0[0]) << endl;

    Mat stretched;
    normalize(img, stretched, 0, 255, NORM_MINMAX);     // 최소 -> 0, 최대 -> 255
    double mn2, mx2;
    Scalar m1, s1;
    minMaxLoc(stretched, &mn2, &mx2);
    meanStdDev(stretched, m1, s1);
    cout << format("스트레칭: 최소 %.0f 최대 %.0f 평균 %.1f 표준편차 %.1f", mn2, mx2, m1[0], s1[0]) << endl;

    int x = 350, y = 60;
    int v = img.at<uchar>(y, x);
    cout << "(" << x << "," << y << ") " << v << " -> " << (int)stretched.at<uchar>(y, x) << endl;
    cout << format("직접 계산: (v - %.0f) x 255 / (%.0f - %.0f) = %.1f", mn, mx, mn, (v - mn) * 255 / (mx - mn)) << endl;
    imshow("stretched", stretched);
    waitKey(0);
    return 0;
}`;

  const EX_TRACKBAR = `// 로컬 PC 전용: 트랙바 두 개로 밝기 · 대비를 실시간 조절 (브라우저 버전은 예제 2)
#include <opencv2/opencv.hpp>
using namespace cv;

Mat g_src, g_dst;

void onChange(int, void*)
{
    double alpha = getTrackbarPos("alpha x10", "adjust") / 10.0;   // 0 ~ 4.0
    int beta = getTrackbarPos("beta+255", "adjust") - 255;         // -255 ~ +255
    g_src.convertTo(g_dst, -1, alpha, beta);    // 항상 "원본"에서 다시 계산한다!
    imshow("adjust", g_dst);
}

int main()
{
    g_src = imread("images/low_contrast.png", IMREAD_GRAYSCALE);
    if (g_src.empty()) return -1;
    namedWindow("adjust");
    createTrackbar("alpha x10", "adjust", nullptr, 40, onChange);
    createTrackbar("beta+255", "adjust", nullptr, 510, onChange);
    setTrackbarPos("alpha x10", "adjust", 10);
    setTrackbarPos("beta+255", "adjust", 255);
    onChange(0, nullptr);
    waitKey(0);
    return 0;
}`;

  // ---------------------------------------------------------------- 2교시 예제
  const EX_HIST = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

// 히스토그램(256x1 float)을 막대 그래프 이미지로 직접 그린다
Mat drawHist(const Mat& hist)
{
    int w = 512, h = 300;
    Mat canvas(h, w, CV_8UC3, Scalar::all(30));
    double mx;
    minMaxLoc(hist, 0, &mx);
    for (int i = 0; i < 256; i++)
    {
        int barH = cvRound(hist.at<float>(i) / mx * (h - 20));    // 가장 큰 막대가 280 px
        line(canvas, Point(i * 2, h - 1), Point(i * 2, h - 1 - barH), Scalar(200, 200, 200), 2);
    }
    line(canvas, Point(0, h - 1), Point(w - 1, h - 1), Scalar(0, 180, 255), 1);
    return canvas;
}

int main()
{
    Mat gray = imread("images/sample_gray.png", IMREAD_GRAYSCALE);

    const int channels[] = { 0 };           // 0번 채널
    int histSize = 256;                     // bin 256개
    float range[] = { 0, 256 };             // 0 이상 256 미만
    const float* ranges[] = { range };
    Mat hist;
    calcHist(&gray, 1, channels, Mat(), hist, 1, &histSize, ranges);

    cout << "bin 수 " << hist.total() << ", 형식 " << typeToString(hist.type()) << endl;
    cout << "밝기 0 픽셀 " << hist.at<float>(0) << "개, 128 픽셀 " << hist.at<float>(128)
         << "개, 255 픽셀 " << hist.at<float>(255) << "개" << endl;
    int best = 0;                                // 가장 많은 밝기(최빈값) 찾기
    for (int i = 1; i < 256; i++)
        if (hist.at<float>(i) > hist.at<float>(best)) best = i;
    cout << "가장 많은 밝기 = " << best << " (" << hist.at<float>(best) << "개)" << endl;
    cout << "합계 " << sum(hist)[0] << " = 전체 픽셀 " << gray.total() << endl;

    imshow("histogram", drawHist(hist));
    waitKey(0);
    return 0;
}`;

  const EX_READ = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    const char* files[] = { "images/sample_gray.png", "images/low_contrast.png", "images/uneven_light.png" };
    for (const char* f : files)
    {
        Mat img = imread(f, IMREAD_GRAYSCALE);
        Mat hist;
        // vector 형식 calcHist: {영상}, {채널}, 마스크, 출력, {bin 수}, {하한, 상한}
        calcHist(vector<Mat>{ img }, { 0 }, Mat(), hist, { 256 }, { 0, 256 });

        double mn, mx;
        Scalar m, sd;
        minMaxLoc(img, &mn, &mx);
        meanStdDev(img, m, sd);
        cout << f << endl;
        cout << format("   최소 %.0f 최대 %.0f 평균 %.1f 표준편차 %.1f", mn, mx, m[0], sd[0]) << endl;
        double total = (double)img.total();
        for (int b = 0; b < 4; b++)
        {
            double s = 0;
            for (int i = b * 64; i < b * 64 + 64; i++) s += hist.at<float>(i);
            cout << format("   %3d ~ %3d : %5.1f%%", b * 64, b * 64 + 63, 100 * s / total) << endl;
        }
    }
    return 0;
}`;

  const EX_EQ = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

void report(const string& tag, const Mat& m)
{
    double mn, mx;
    Scalar mean, sd;
    minMaxLoc(m, &mn, &mx);
    meanStdDev(m, mean, sd);
    cout << format("%-14s 최소/최대 %.0f/%.0f 평균 %.1f 표준편차 %.1f", tag.c_str(), mn, mx, mean[0], sd[0]) << endl;
}

int main()
{
    Mat img = imread("images/low_contrast.png", IMREAD_GRAYSCALE);
    Mat norm, eq, cl;
    normalize(img, norm, 0, 255, NORM_MINMAX);
    equalizeHist(img, eq);                                  // 전역 평탄화
    Ptr<CLAHE> clahe = createCLAHE(2.0, Size(8, 8));        // clipLimit 2.0, 타일 8x8
    clahe->apply(img, cl);                                  // Ptr 은 스마트 포인터 -> 화살표로 호출

    report("original", img);
    report("normalize", norm);
    report("equalizeHist", eq);
    report("CLAHE(2.0)", cl);
    double clips[] = { 4.0, 8.0 };
    for (double clip : clips)
    {
        clahe->setClipLimit(clip);                          // 같은 객체의 설정만 바꿔 재사용
        Mat d;
        clahe->apply(img, d);
        report(format("CLAHE(%.1f)", clip), d);
    }
    imshow("equalize", eq);
    imshow("clahe", cl);
    waitKey(0);
    return 0;
}`;

  const EX_COLOR = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

void show(const string& tag, const Mat& bgr)
{
    Scalar m = mean(bgr);
    Vec3b p = bgr.at<Vec3b>(110, 120);           // 빨간 원 (행 110, 열 120)
    Mat hsv;
    cvtColor(bgr, hsv, COLOR_BGR2HSV);
    Vec3b h = hsv.at<Vec3b>(110, 120);
    cout << format("%-8s 평균 BGR (%.0f,%.0f,%.0f)  빨간 원 BGR (%d,%d,%d) H=%d", tag.c_str(),
                   m[0], m[1], m[2], p[0], p[1], p[2], h[0]) << endl;
}

int main()
{
    Mat img = imread("images/sample_color.png");
    Mat dark;
    img.convertTo(dark, -1, 0.5, 0);             // 어둡게 찍힌 컬러 사진 흉내

    // (1) 잘못된 방법: B G R 채널을 따로 평탄화 -> 색이 틀어진다
    vector<Mat> ch;
    split(dark, ch);
    for (Mat& c : ch) equalizeHist(c, c);
    Mat wrong;
    merge(ch, wrong);

    // (2) 올바른 방법: HSV 로 바꿔 V(명도) 채널만 평탄화
    Mat hsv, right;
    cvtColor(dark, hsv, COLOR_BGR2HSV);
    vector<Mat> hc;
    split(hsv, hc);
    equalizeHist(hc[2], hc[2]);
    merge(hc, hsv);
    cvtColor(hsv, right, COLOR_HSV2BGR);

    show("dark", dark);
    show("BGR each", wrong);
    show("V only", right);
    imshow("BGR each", wrong);
    imshow("V only", right);
    waitKey(0);
    return 0;
}`;

  const EX_STATS = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/low_contrast.png", IMREAD_GRAYSCALE);

    // 1) 최소 · 최대와 그 위치
    double mn, mx;
    Point mnLoc, mxLoc;
    minMaxLoc(img, &mn, &mx, &mnLoc, &mxLoc);
    cout << "최소 " << mn << " @ " << mnLoc << " / 최대 " << mx << " @ " << mxLoc << endl;

    // 2) 평균과 표준편차 (표준편차 = 대비의 척도)
    Scalar mean_, sd;
    meanStdDev(img, mean_, sd);
    cout << format("평균 %.2f 표준편차 %.2f", mean_[0], sd[0]) << endl;
    cout << format("mean() 만 쓰면 %.2f", mean(img)[0]) << endl;

    // 3) 마스크를 주면 그 영역만 통계 (ROI 검사의 기본)
    Mat roiMask = Mat::zeros(img.size(), CV_8UC1);
    rectangle(roiMask, Rect(200, 100, 240, 200), Scalar(255), FILLED);
    Scalar m2, s2;
    meanStdDev(img, m2, s2, roiMask);
    cout << format("가운데 사각형 영역: 평균 %.2f 표준편차 %.2f", m2[0], s2[0]) << endl;
    if (sd[0] < 15)
        cout << format("판정: 표준편차 %.2f < 15 이므로 '저대비 — 조명 · 노출 점검 필요'", sd[0]) << endl;
    return 0;
}`;

  // ---------------------------------------------------------------- 슬라이드용 짧은 코드
  const S_BRIGHT = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_gray.png", IMREAD_GRAYSCALE);
    Mat bright = img + Scalar(50);            // = add(img, Scalar(50), dst)
    Mat dark;
    subtract(img, Scalar(50), dark);

    cout << format("원본 평균 %.1f", mean(img)[0]) << endl;
    cout << format("+50 평균 %.1f / -50 평균 %.1f", mean(bright)[0], mean(dark)[0]) << endl;
    double mn, mx;
    minMaxLoc(bright, &mn, &mx);
    cout << "+50 최소/최대 " << mn << "/" << mx << "  (255 에서 포화)" << endl;
    imshow("bright", bright);
    waitKey(0);
    return 0;
}`;

  const S_CONTRAST = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/low_contrast.png", IMREAD_GRAYSCALE);
    Mat a2, ok;
    img.convertTo(a2, -1, 2.0, 0);          // 대비 2배만
    img.convertTo(ok, -1, 3.0, -250);       // 대비 3배 + 밝기 -250

    Scalar m1, s1, m2, s2;
    meanStdDev(a2, m1, s1);
    meanStdDev(ok, m2, s2);
    cout << format("alpha 2.0         평균 %.1f 표준편차 %.1f", m1[0], s1[0]) << endl;
    cout << format("alpha 3 beta -250 평균 %.1f 표준편차 %.1f", m2[0], s2[0]) << endl;
    imshow("contrast", ok);
    waitKey(0);
    return 0;
}`;

  const S_MANUAL = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/low_contrast.png", IMREAD_GRAYSCALE);
    Mat mine(img.size(), CV_8UC1);
    for (int y = 0; y < img.rows; y++)
    {
        const uchar* s = img.ptr<uchar>(y);     // 행 포인터 — 가장 빠른 접근
        uchar* d = mine.ptr<uchar>(y);
        for (int x = 0; x < img.cols; x++)
            d[x] = saturate_cast<uchar>(3.0 * s[x] - 250);
    }
    Mat byCv;
    img.convertTo(byCv, -1, 3.0, -250);
    cout << "다른 픽셀 " << countNonZero(mine != byCv) << endl;
    imshow("mine", mine);
    waitKey(0);
    return 0;
}`;

  const S_GAMMA = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <cmath>
using namespace cv;
using namespace std;

int main()
{
    double gamma = 0.5;
    Mat table(1, 256, CV_8U);
    for (int i = 0; i < 256; i++)
        table.at<uchar>(i) = saturate_cast<uchar>(pow(i / 255.0, gamma) * 255.0);

    Mat img = imread("images/sample_gray.png", IMREAD_GRAYSCALE);
    Mat dst;
    LUT(img, table, dst);
    cout << "128 -> " << (int)table.at<uchar>(128)
         << format(", 평균 %.1f -> %.1f", mean(img)[0], mean(dst)[0]) << endl;
    imshow("gamma", dst);
    waitKey(0);
    return 0;
}`;

  const S_NORM = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/low_contrast.png", IMREAD_GRAYSCALE);
    Mat dst;
    normalize(img, dst, 0, 255, NORM_MINMAX);

    double mn, mx, mn2, mx2;
    minMaxLoc(img, &mn, &mx);
    minMaxLoc(dst, &mn2, &mx2);
    Scalar m0, s0, m1, s1;
    meanStdDev(img, m0, s0);
    meanStdDev(dst, m1, s1);
    cout << mn << "~" << mx << " -> " << mn2 << "~" << mx2 << endl;
    cout << format("표준편차 %.1f -> %.1f", s0[0], s1[0]) << endl;
    imshow("stretched", dst);
    waitKey(0);
    return 0;
}`;

  const S_HIST = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/sample_gray.png", IMREAD_GRAYSCALE);
    const int channels[] = { 0 };
    int histSize = 256;
    float range[] = { 0, 256 };
    const float* ranges[] = { range };
    Mat hist, canvas(300, 512, CV_8UC3, Scalar::all(30));
    calcHist(&gray, 1, channels, Mat(), hist, 1, &histSize, ranges);

    double mx; minMaxLoc(hist, 0, &mx);
    for (int i = 0; i < 256; i++)
        line(canvas, Point(i * 2, 299), Point(i * 2, 299 - cvRound(hist.at<float>(i) / mx * 280)), Scalar::all(200), 2);
    cout << "형식 " << typeToString(hist.type()) << ", 가장 큰 막대 " << mx << endl;
    imshow("histogram", canvas);
    waitKey(0);
    return 0;
}`;

  const S_EQ = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/low_contrast.png", IMREAD_GRAYSCALE);
    Mat eq, cl;
    equalizeHist(img, eq);
    Ptr<CLAHE> clahe = createCLAHE(2.0, Size(8, 8));
    clahe->apply(img, cl);

    Scalar m0, s0, m1, s1, m2, s2;
    meanStdDev(img, m0, s0);
    meanStdDev(eq, m1, s1);
    meanStdDev(cl, m2, s2);
    cout << format("표준편차 원본 %.1f / 평탄화 %.1f / CLAHE %.1f", s0[0], s1[0], s2[0]) << endl;
    imshow("equalize", eq);
    imshow("clahe", cl);
    waitKey(0);
    return 0;
}`;

  const S_COLOR = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png");
    Mat dark, hsv, result;
    img.convertTo(dark, -1, 0.5, 0);             // 어둡게 찍힌 사진
    cvtColor(dark, hsv, COLOR_BGR2HSV);
    vector<Mat> hc;
    split(hsv, hc);
    equalizeHist(hc[2], hc[2]);                  // V 채널만!
    merge(hc, hsv);
    cvtColor(hsv, result, COLOR_HSV2BGR);
    cout << format("평균 B %.0f -> %.0f", mean(dark)[0], mean(result)[0]) << endl;
    imshow("fixed", result);
    waitKey(0);
    return 0;
}`;

  // ---------------------------------------------------------------- 퀴즈
  const QUIZ1 = [
    { q: '8비트 영상에서 밝기 230 인 픽셀에 <code>add(img, Scalar(50), dst)</code> 로 50 을 더하면?',
      options: ['280', '255', '24 (넘친 값이 돌아온다)', '컴파일 오류'], answer: 1,
      explain: 'OpenCV 의 산술은 <b>포화 연산(saturating)</b>입니다. 255 를 넘으면 255, 0 보다 작으면 0 으로 <b>잘립니다</b>. C++ 의 <code>uchar u = 230; u += 50;</code> 처럼 280 → 24 로 돌아오지 않습니다. 대신 한 번 잘린 값은 되돌릴 수 없습니다.' },
    { q: '<code>img.convertTo(dst, -1, 2.0, -100)</code> 은 무슨 뜻인가?',
      options: ['밝기 2배 후 대비 −100', '각 픽셀에 <code>saturate_cast&lt;uchar&gt;(v × 2.0 − 100)</code> 을 적용 (형식은 그대로)', '2행 −100열로 이동', '−1 번 채널만 2배'], answer: 1,
      explain: '<b>alpha = 대비(곱), beta = 밝기(더하기)</b> 입니다. 둘째 인수 <code>-1</code> 은 “출력 형식을 입력과 같게(CV_8U)” 라는 뜻입니다. 결과는 반올림 후 0~255 로 포화됩니다. <code>convertScaleAbs</code> 는 여기에 <b>절댓값</b>을 한 번 더 취하는 점만 다릅니다.' },
    { q: '두 영상을 반반 섞으려면?',
      options: ['<code>add(a, b, dst)</code>', '<code>addWeighted(a, 0.5, b, 0.5, 0, dst)</code>', '<code>multiply(a, b, dst)</code>', '<code>a + b</code>'], answer: 1,
      explain: '<code>add</code> · <code>a + b</code> 는 그냥 더해서 대부분 255 로 포화됩니다. <code>addWeighted(a, α, b, β, γ, dst)</code> = <code>a×α + b×β + γ</code> 이므로 α + β = 1 로 두면 평균이 유지됩니다.' },
    { q: '직접 픽셀 루프로 <code>3.0 * v - 250</code> 을 계산해 <code>uchar</code> 에 넣을 때 OpenCV 와 같은 결과를 내는 방법은?',
      options: ['<code>d[x] = (uchar)(3.0 * v - 250);</code>', '<code>d[x] = saturate_cast&lt;uchar&gt;(3.0 * v - 250);</code>', '<code>d[x] = abs(3.0 * v - 250);</code>', '<code>d[x] = (int)(3.0 * v - 250) % 256;</code>'], answer: 1,
      explain: '<code>saturate_cast&lt;uchar&gt;</code> 는 <b>반올림 + 0~255 로 자르기</b>를 한 번에 해 줍니다. 그냥 <code>(uchar)</code> 로 바꾸면 256 이 0 으로, 300 이 44 로 <b>넘쳐 돌아옵니다</b>(실수 → 정수 변환이 범위를 벗어나면 정의되지 않은 동작이기도 합니다).' },
    { q: '<code>normalize(img, dst, 0, 255, NORM_MINMAX)</code> 의 결과는?',
      options: ['평균이 128 이 된다', '최소값이 0, 최대값이 255 가 된다', '히스토그램이 평평해진다', '값이 0~1 로 바뀐다'], answer: 1,
      explain: '<b>선형 스트레칭</b>입니다. 가장 어두운 픽셀을 0, 가장 밝은 픽셀을 255 로 두고 사이를 비례로 늘립니다 — 히스토그램의 모양은 유지되고 폭만 넓어집니다. 모양까지 평평하게 만드는 것은 <code>equalizeHist</code> 입니다.' }
  ];

  const QUIZ2 = [
    { q: '히스토그램의 가로축과 세로축은?',
      options: ['가로 = 픽셀 위치, 세로 = 밝기', '가로 = 밝기(0~255), 세로 = 그 밝기의 픽셀 수', '가로 = 밝기, 세로 = 평균', '가로 = 시간, 세로 = 밝기'], answer: 1,
      explain: '히스토그램은 <b>위치 정보를 버리고 개수만</b> 남긴 표입니다. 그래서 서로 다른 두 영상이 같은 히스토그램을 가질 수도 있습니다. 막대 높이의 합 = 전체 픽셀 수.' },
    { q: '<code>calcHist</code> 결과 Mat 의 형식과 크기는 (bin 256, 1차원)?',
      options: ['CV_8UC1, 256×1', 'CV_32FC1, 256×1', 'CV_32SC1, 1×256', 'CV_8UC3, 256×256'], answer: 1,
      explain: '<b>CV_32FC1 (float) 256행 1열</b>입니다. 따라서 값은 <code>hist.at&lt;float&gt;(i)</code> 로 읽습니다. <code>at&lt;uchar&gt;</code> 나 <code>at&lt;int&gt;</code> 로 읽으면 엉뚱한 값이 나옵니다(형식 검사가 없어서 오류도 안 납니다).' },
    { q: '포인터 형식 <code>calcHist</code> 에서 <code>float range[] = {0, 255};</code> 로 쓰면?',
      options: ['아무 차이 없다', '상한이 제외되므로 밝기 255 픽셀이 세어지지 않는다', '컴파일 오류', '256칸이 255칸으로 줄어든다'], answer: 1,
      explain: '범위는 <b>[하한, 상한)</b> — 상한은 포함하지 않습니다. 0~255 전체를 세려면 <code>{0, 256}</code> 으로 써야 합니다. 포화된(255) 픽셀을 찾아야 할 때 특히 치명적인 실수입니다.' },
    { q: 'equalizeHist 대신 CLAHE 를 쓰는 이유는?',
      options: ['더 빠르기 때문', '지역(타일)별로 적용하고 clipLimit 로 과도한 증폭 · 잡음을 억제하기 때문', '컬러 영상에 바로 쓸 수 있기 때문', '히스토그램을 그려 주기 때문'], answer: 1,
      explain: '전역 평탄화는 영상 전체에 하나의 변환표를 써서 조명이 기울어진 영상에서는 한쪽이 뭉개지고, 잡음도 크게 증폭됩니다. CLAHE 는 <b>타일(8×8)마다</b> 평탄화하면서 <code>clipLimit</code> 로 기울기를 제한합니다. <code>createCLAHE</code> 는 <code>Ptr&lt;CLAHE&gt;</code> 를 돌려주므로 <code>clahe-&gt;apply(src, dst)</code> 로 호출합니다.' },
    { q: '컬러 영상의 밝기를 평탄화할 때 올바른 방법은?',
      options: ['B · G · R 채널을 각각 equalizeHist', 'HSV 로 바꿔 <b>V 채널만</b> equalizeHist 후 다시 BGR', 'Gray 로 바꿔 equalizeHist', 'convertTo 로 3배'], answer: 1,
      explain: '채널을 따로 평탄화하면 세 채널의 분포가 억지로 같아져 <b>색이 바래거나 틀어집니다</b>(예제 4 에서 평균 BGR 이 회색 쪽으로 몰림). 밝기만 손대려면 HSV 의 <b>V</b>(또는 Lab 의 L) 채널만 처리하세요.' }
  ];

  CV_COURSE.addChapter({
    id: 'cv06', no: '06', title: '밝기 · 대비 · 히스토그램', subtitle: '영상의 성적표를 읽고 고치기',
    summary: '밝기는 <b>더하기</b>, 대비는 <b>곱하기</b>라는 기본을 익히고 포화(<code>saturate_cast</code>) · <code>convertTo</code> · <code>addWeighted</code> · 감마 보정(<code>LUT</code>) · 선형 스트레칭을 다룹니다. <code>ptr&lt;uchar&gt;</code> 행 포인터로 같은 계산을 직접 구현해 OpenCV 결과와 비교합니다. 이어서 영상의 성적표인 <b>히스토그램</b>을 <code>calcHist</code> 로 구해 직접 막대 그래프로 그리고, <code>equalizeHist</code> 와 <b>CLAHE</b> 로 대비를 살리는 방법과 컬러 영상에서의 올바른 처리를 배웁니다.',
    goals: ['밝기(더하기) · 대비(곱하기)의 차이와 포화 현상을 설명하고 saturate_cast 로 직접 구현할 수 있다', 'convertTo · addWeighted · LUT(감마) · normalize 를 목적에 맞게 쓸 수 있다', 'calcHist 의 인수를 이해하고 결과를 읽어 막대 그래프로 그릴 수 있다', 'equalizeHist 와 CLAHE 의 차이를 알고 컬러 영상에 올바르게 적용할 수 있다'],
    sections: [
      {
        id: 'cv06-1', title: '밝기 · 대비 · 감마 보정', minutes: 50,
        goals: ['밝기와 대비를 더하기 · 곱하기로 조절하고 포화를 설명할 수 있다', 'ptr&lt;uchar&gt; 루프와 saturate_cast 로 같은 계산을 직접 구현할 수 있다', 'addWeighted 로 두 영상을 섞고, 1×256 LUT 로 감마 보정을 구현할 수 있다'],
        flow: [['도입: 어두운 사진 살리기', 6], ['밝기 · 대비 · 포화 · 직접 구현', 18], ['블렌딩 · 감마 · 스트레칭', 18], ['정리 · 퀴즈', 8]],
        content: [
          { type: 'h', text: '밝기는 더하기, 대비는 곱하기' },
          { type: 'p', html: '사진이 어두우면 <b>모든 픽셀에 같은 값을 더하면</b> 밝아집니다(밝기 · brightness). 흐릿해서 구분이 잘 안 되면 <b>값의 차이를 벌려야</b> 합니다 — 픽셀 값에 1 보다 큰 수를 곱하는 것입니다(대비 · contrast). 한 식으로 쓰면 <b>출력 = alpha × 입력 + beta</b> 이고, OpenCV C++ 에서는 <code>src.convertTo(dst, -1, alpha, beta)</code> 한 줄로 처리합니다.' },
          { type: 'figure', html: FIG_BRIGHT, caption: '그림 1. 입력 → 출력 그래프로 본 밝기(평행 이동) · 대비(기울기) · 포화(255 에서 잘림)' },
          { type: 'code', title: '예제 1: 밝기 더하기 · 빼기와 포화 확인', code: EX_BRIGHT,
            desc: '<code>img + Scalar(50)</code> 처럼 <b>연산자</b>를 써도 되고 <code>add(img, Scalar(50), dst)</code> 를 써도 같습니다. 주목할 점은 두 가지입니다. ① 원본 최대 208 이 +50 후 258 이 아니라 <b>255 로 막혔습니다</b>. ② (20,20) 의 47 은 −50 에서 <b>0 으로 잘렸습니다</b>. 이렇게 잘린 값은 되돌릴 수 없습니다. <code>minMaxLoc</code> 은 결과를 <b>포인터</b>(<code>&amp;mn</code>)로 받는 C 스타일 함수입니다.',
            expect: '원본 평균 119.2\n+50 평균 169.2, add 평균 169.2, -50 평균 69.4\n(350,60): 145 -> +50 195 / -50 95\n(120,110): 85 -> +50 135 / -50 35\n(20,20): 47 -> +50 97 / -50 0\n최소/최대: 원본 38/208 -> +50 88/255  (255 에서 막힘 = 포화)' },
          { type: 'callout', kind: 'warn', title: '포화(saturate) — C++ 의 uchar 산술과 다르다', html: 'C++ 에서 <code>uchar u = 230; u += 50;</code> 를 하면 <b>24</b> 가 됩니다(넘친 값이 돌아옴 · 280 mod 256). 하지만 OpenCV 의 <code>add</code> · <code>Mat + Scalar</code> · <code>convertTo</code> 는 <b>255 로 잘립니다</b>. 반대로 <code>subtract</code> 는 0 아래로 내려가지 않습니다. 직접 픽셀 루프를 돌 때는 <b><code>saturate_cast&lt;uchar&gt;(v)</code></b> 로 넣어야 OpenCV 와 같은 결과가 나옵니다(예제 3).' },
          { type: 'image', src: 'images/low_contrast.png', caption: 'images/low_contrast.png — 노출 부족으로 밝기가 102~134 에만 몰린 저대비 영상. 이 교시의 환자' },
          { type: 'code', title: '예제 2: 대비 키우기 (alpha) 와 밝기 보정 (beta)', code: EX_CONTRAST,
            desc: '표준편차(대비의 척도)가 6.7 → 13.3 → 그리고 alpha 3.0 에서는 <b>0.0</b> 이 되었습니다. 왜일까요? 값이 모두 255 를 넘어 <b>전부 흰색으로 포화</b>됐기 때문입니다. 그래서 대비를 키울 때는 <code>beta</code> 로 다시 내려 주어야 합니다: <code>alpha 3.0, beta -250</code> → 표준편차 20.1 로 <b>3배 선명</b>해지고 값도 56~152 범위에 잘 들어옵니다. <code>meanStdDev</code> 의 출력은 <code>Scalar</code> 두 개로 받습니다(채널별 값 · 흑백은 <code>[0]</code>).',
            expect: '원본 평균 118.2, 표준편차 6.7\nalpha=1.0: 평균 118.2 표준편차 6.7 최소/최대 102/134\nalpha=2.0: 평균 236.3 표준편차 13.3 최소/최대 204/255\nalpha=3.0: 평균 255.0 표준편차 0.0 최소/최대 255/255\nalpha=3.0, beta=-250: 평균 104.5 표준편차 20.1 최소/최대 56/152' },
          { type: 'table', head: ['목적', 'C++ 코드', '메모'], rows: [
            ['밝게', '<code>src.convertTo(dst, -1, 1.0, 40)</code>', 'beta 만 사용 = <code>src + Scalar(40)</code>'],
            ['어둡게', '<code>src.convertTo(dst, -1, 1.0, -40)</code>', '0 아래는 잘림'],
            ['대비 ↑', '<code>src.convertTo(dst, -1, 1.5, -60)</code>', 'alpha 로 벌리고 beta 로 중심 맞추기'],
            ['대비 ↓', '<code>src.convertTo(dst, -1, 0.6, 50)</code>', '값을 좁히고 위로 올림'],
            ['절댓값 필요', '<code>convertScaleAbs(src, dst, alpha, beta)</code>', '|결과| 후 8비트 — 에지(Sobel) 결과 표시용 (10차시)'],
            ['자동', '<code>normalize(src, dst, 0, 255, NORM_MINMAX)</code>', '최소 · 최대를 보고 알아서 늘림']
          ], caption: '표 1. alpha(대비) 와 beta(밝기) 의 조합 — beta 의 부호를 alpha 와 반대로 두는 것이 요령. Python: <code>cv2.convertScaleAbs</code> · <code>cv2.normalize</code>' },
          { type: 'h', text: '직접 구현하기: ptr&lt;uchar&gt; 와 saturate_cast' },
          { type: 'p', html: 'C++ 의 장점은 <b>픽셀 루프를 직접 써도 빠르다</b>는 것입니다. <code>img.ptr&lt;uchar&gt;(y)</code> 는 <b>y 행의 첫 픽셀 주소</b>를 돌려주므로, 안쪽 루프에서 <code>s[x]</code> 로 배열처럼 읽을 수 있습니다 — 픽셀마다 행 · 열 계산을 하는 <code>at&lt;uchar&gt;(y, x)</code> 보다 빠릅니다. 값을 되돌려 넣을 때는 <code>saturate_cast&lt;uchar&gt;</code> 가 <b>반올림과 0~255 자르기</b>를 한 번에 해 줍니다.' },
          { type: 'code', title: '예제 3: 행 포인터 루프로 alpha · beta 직접 구현 (+ 포화를 빼먹으면?)', code: EX_MANUAL,
            desc: '(1) <code>saturate_cast</code> 로 만든 결과는 <code>convertTo</code> 와 <b>한 픽셀도 다르지 않습니다</b>(0개) — OpenCV 내부도 똑같이 계산합니다. (2) alpha 2 에서는 128 이상인 픽셀이 256 을 넘습니다. <code>saturate_cast</code> 는 255 로 막아 주지만, <code>(uchar)(int)v</code> 처럼 그냥 형 변환하면 256 → 0, 268 → 12 로 <b>넘쳐 돌아와</b> 3660 개 픽셀이 틀립니다. 결과 창의 “overflow” 영상에서 가장 밝아야 할 곳이 <b>검은 점</b>으로 박힌 것을 확인하세요 — 직접 구현할 때 가장 흔한 버그입니다. (실수 → 정수 변환은 범위를 넘으면 정의되지 않은 동작이므로 먼저 <code>int</code> 로 바꿨습니다.)',
            expect: 'alpha 3, beta -250: convertTo 와 다른 픽셀 0\nalpha 2 (saturate_cast): 다른 픽셀 0, 평균 236.3\nalpha 2 ((uchar) 변환) : 다른 픽셀 3660, 평균 233.3' },
          { type: 'callout', kind: 'tip', title: 'Mat 연산 vs 직접 루프 — 언제 무엇을?', html: '<ul><li><b>OpenCV 함수(convertTo · add · LUT)</b>: 내부가 SIMD 최적화 · 멀티스레드라 대부분 가장 빠르고 버그가 없습니다. 기본 선택.</li><li><b>직접 루프(ptr)</b>: OpenCV 에 없는 계산(조건이 복잡한 규칙, 여러 영상을 동시에 보는 판정)을 할 때. 반드시 <code>ptr</code> 로 행 단위 접근 + <code>saturate_cast</code>.</li><li><code>at&lt;uchar&gt;(y, x)</code> 는 한두 점을 읽을 때 편하지만, 전체 루프에는 <code>ptr</code> 이 낫습니다. Debug 빌드에서는 <code>at</code> 에 범위 검사까지 들어가 훨씬 느립니다.</li></ul>' },
          { type: 'h', text: '두 영상 섞기: addWeighted' },
          { type: 'code', title: '예제 4: addWeighted 로 블렌딩', code: EX_BLEND,
            desc: '<code>addWeighted(a, α, b, β, γ, dst)</code> = <b>a×α + b×β + γ</b> 입니다. α + β = 1 로 두면 밝기가 유지되면서 두 영상이 섞입니다(결과 평균이 두 평균 사이에서 이동하는 것을 확인하세요). 검사 화면에서 <b>원본 위에 마스크를 반투명으로 겹칠 때</b> 가장 많이 쓰는 함수입니다. 두 영상의 <b>크기와 형식이 같아야</b> 합니다 — 다르면 <code>cv::Exception</code> 이 납니다.',
            expect: 'a 640x480 평균 119.2 / b 640x480 평균 127.7\na x 0.0 + b x 1.0 -> 평균 127.7\na x 0.3 + b x 0.7 -> 평균 125.2\na x 0.5 + b x 0.5 -> 평균 123.4\na x 0.7 + b x 0.3 -> 평균 121.7\na x 1.0 + b x 0.0 -> 평균 119.2' },
          { type: 'h', text: '감마 보정: 곡선으로 바꾸기 (LUT)' },
          { type: 'p', html: '곱하기는 <b>직선</b>이라 밝은 쪽이 먼저 포화됩니다. 어두운 부분만 살리고 밝은 부분은 그대로 두려면 <b>곡선</b>이 필요합니다 — 이것이 감마 보정입니다. <br><b>출력 = 255 × (입력 / 255)<sup>gamma</sup></b> &nbsp;· gamma &lt; 1 이면 밝아지고, gamma &gt; 1 이면 어두워집니다.' },
          { type: 'figure', html: FIG_GAMMA, caption: '그림 2. 감마 곡선 — gamma 0.5 는 어두운 쪽을 크게 끌어올리고 255 는 넘지 않는다' },
          { type: 'p', html: '픽셀마다 <code>pow</code> 를 계산하면 30만 번입니다. 값이 0~255 뿐이므로 <b>256칸 변환표(LUT · Look-Up Table)</b>를 <code>Mat(1, 256, CV_8U)</code> 로 미리 만들고 <code>LUT(src, table, dst)</code> 로 한 번에 적용하는 것이 정석입니다 — <code>pow</code> 는 256번만 부릅니다.' },
          { type: 'code', title: '예제 5: 1×256 변환표 + LUT 로 감마 보정', code: EX_GAMMA,
            desc: '표를 보면 gamma 0.5 에서 <b>128 → 181</b>(크게 밝아짐), <b>255 → 255</b>(포화 없음) 입니다. 반대로 gamma 2.0 은 128 → 64 로 눌러 줍니다. <code>makeGamma</code> 는 <code>Mat</code> 을 <b>값으로 돌려주지만</b> 픽셀 데이터는 복사되지 않습니다(참조 계수 · 03차시). 이 LUT 기법은 감마뿐 아니라 <b>어떤 1:1 밝기 변환</b>(반전 <code>255-v</code>, 계단식 색 줄이기, 색 보정)에도 그대로 쓸 수 있습니다.',
            expect: 'gamma 0.5 표: 0->0 64->128 128->181 192->221 255->255\ngamma 2.0 표: 0->0 64->16 128->64 192->145 255->255\n원본 평균 119.2 / gamma 0.5 171.5 / gamma 2.0 61.6\ngamma 0.5 최소/최대 98/230 (포화 없음)' },
          { type: 'h', text: '저대비 영상 살리기: 선형 스트레칭' },
          { type: 'code', title: '예제 6: normalize(NORM_MINMAX) 로 자동 스트레칭', code: EX_NORM,
            desc: '<code>NORM_MINMAX</code> 는 <b>현재 최소값을 0, 최대값을 255</b> 로 두고 사이를 비례로 늘립니다 — alpha · beta 를 직접 고르지 않아도 됩니다. 표준편차가 6.7 → 53.1 로 <b>8배</b> 커졌습니다. 마지막 두 줄은 같은 계산을 손으로 한 것입니다: (120 − 102) × 255 ÷ (134 − 102) = 143.4 ≈ 143. 단점은 <b>잡음 한 점</b>이 최소/최대가 되면 효과가 줄어드는 것 — 그래서 실무에서는 상·하위 1% 를 잘라 내고 늘리거나 CLAHE(2교시)를 씁니다.',
            expect: '원본: 최소 102 최대 134 평균 118.2 표준편차 6.7\n스트레칭: 최소 0 최대 255 평균 128.8 표준편차 53.1\n(350,60) 120 -> 143\n직접 계산: (v - 102) x 255 / (134 - 102) = 143.4' },
          { type: 'callout', kind: 'tip', title: '어떤 것을 쓸까', html: '<ul><li><b>노출이 살짝 어긋남</b> → <code>convertTo(dst, -1, alpha, beta)</code> 로 간단히</li><li><b>어두운 부분만 살리고 싶다</b> → <b>감마 0.4~0.7</b> (LUT)</li><li><b>전체가 좁은 범위에 몰렸다</b> → <code>normalize(NORM_MINMAX)</code></li><li><b>조명이 기울었거나 지역 대비가 필요</b> → <b>CLAHE</b> (2교시)</li></ul>' },
          { type: 'callout', kind: 'vs', title: 'Visual Studio 에서는 — 트랙바로 실시간 조절', html: '로컬 PC 에서는 <code>createTrackbar</code> 로 창에 슬라이더를 붙여 alpha · beta 를 끌어 가며 결과를 볼 수 있습니다(아래 코드 · 브라우저에서는 트랙바가 동작하지 않으므로 예제 2 로 같은 계산을 확인하세요). 핵심 규칙: <b>원본 Mat 은 절대 덮어쓰지 말고</b> 콜백마다 항상 원본에서 다시 계산하세요 — 안 그러면 조절할 때마다 값이 누적 · 포화되어 되돌릴 수 없습니다. OpenCV 5 에서는 트랙바 값 포인터 대신 <code>nullptr</code> 를 넘기고 <code>getTrackbarPos</code> 로 읽는 방식을 권장합니다.' },
          { type: 'code', title: '추가: 트랙바로 밝기 · 대비 조절 (로컬 전용)', code: EX_TRACKBAR, run: false, local: true, file: 'main.cpp',
            desc: 'alpha 는 정수 트랙바라서 <b>10배로 저장</b>(10 = 1.0)하고, beta 는 음수를 못 쓰므로 <b>+255 해서 저장</b>한 뒤 콜백에서 되돌립니다. 트랙바를 움직일 때마다 <code>onChange</code> 가 호출됩니다.' }
        ],
        practice: [
          {
            title: '감마 값을 바꿔 저대비 영상 살리기', level: 1,
            desc: '<code>images/low_contrast.png</code> 에 <b>감마 보정</b>을 적용해 보세요. <code>makeGamma(gamma)</code> 함수를 완성하고 gamma 를 <b>0.4 · 0.7 · 1.5</b> 로 바꿔 평균과 표준편차를 출력하세요. 감마만으로는 <b>표준편차가 별로 커지지 않는다</b>는 것을 확인하고, 왜 이 영상에는 <code>normalize</code> 가 더 나은지 생각해 보세요.',
            hint: '<code>p[i] = saturate_cast&lt;uchar&gt;(pow(i / 255.0, gamma) * 255.0);</code> · 적용은 <code>LUT(img, table, dst);</code> · 통계는 <code>Scalar m, sd; meanStdDev(dst, m, sd);</code> · 표의 값은 <code>(int)table.at&lt;uchar&gt;(128)</code>',
            expect: '원본 평균 118.2 표준편차 6.7\ngamma 0.4: 표 128 -> 194, 평균 187.3 표준편차 4.3\ngamma 0.7: 표 128 -> 157, 평균 148.8 표준편차 5.9\ngamma 1.5: 표 128 -> 91, 평균 80.2 표준편차 6.7\nnormalize: 평균 128.8 표준편차 53.1 <- 이 영상에는 이것이 답',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <cmath>
using namespace cv;
using namespace std;

Mat makeGamma(double gamma)
{
    Mat table(1, 256, CV_8U);
    uchar* p = table.ptr<uchar>();
    // TODO: 감마 공식으로 256칸을 채우세요 (지금은 그대로 복사)
    for (int i = 0; i < 256; i++) p[i] = (uchar)i;
    return table;
}

int main()
{
    Mat img = imread("images/low_contrast.png", IMREAD_GRAYSCALE);
    Scalar m0, s0;
    meanStdDev(img, m0, s0);
    cout << format("원본 평균 %.1f 표준편차 %.1f", m0[0], s0[0]) << endl;

    double gammas[] = { 0.4, 0.7, 1.5 };
    for (double g : gammas)
    {
        Mat table = makeGamma(g);
        Mat dst;
        // TODO: LUT 로 table 을 적용하고 평균 · 표준편차를 출력하세요
        cout << format("gamma %.1f: 표 128 -> %d", g, (int)table.at<uchar>(128)) << endl;
    }
    // TODO: normalize(NORM_MINMAX) 결과와도 비교해 보세요
    imshow("input", img);
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <cmath>
using namespace cv;
using namespace std;

Mat makeGamma(double gamma)
{
    Mat table(1, 256, CV_8U);
    uchar* p = table.ptr<uchar>();
    for (int i = 0; i < 256; i++)
        p[i] = saturate_cast<uchar>(pow(i / 255.0, gamma) * 255.0);
    return table;
}

int main()
{
    Mat img = imread("images/low_contrast.png", IMREAD_GRAYSCALE);
    Scalar m0, s0;
    meanStdDev(img, m0, s0);
    cout << format("원본 평균 %.1f 표준편차 %.1f", m0[0], s0[0]) << endl;

    double gammas[] = { 0.4, 0.7, 1.5 };
    for (double g : gammas)
    {
        Mat table = makeGamma(g);
        Mat dst;
        LUT(img, table, dst);
        Scalar m, sd;
        meanStdDev(dst, m, sd);
        cout << format("gamma %.1f: 표 128 -> %d, 평균 %.1f 표준편차 %.1f", g, (int)table.at<uchar>(128), m[0], sd[0]) << endl;
    }
    Mat norm;
    normalize(img, norm, 0, 255, NORM_MINMAX);
    Scalar mn, sn;
    meanStdDev(norm, mn, sn);
    cout << format("normalize: 평균 %.1f 표준편차 %.1f <- 이 영상에는 이것이 답", mn[0], sn[0]) << endl;
    imshow("norm", norm);
    waitKey(0);
    return 0;
}`
          },
          {
            title: '포화를 직접 구현해 add 와 비교하기', level: 2,
            desc: '<code>images/sample_gray.png</code> 의 밝은 영역 <b>Rect(300, 40, 200, 150)</b> 을 잘라(<code>clone()</code>) <code>ptr&lt;uchar&gt;</code> 루프로 픽셀마다 <b>+60</b> 을 하고 255 를 넘으면 255 로 잘라 보세요. 그 결과가 <code>add(src, Scalar(60), dst)</code> 와 <b>완전히 같은지</b> <code>absdiff</code> + <code>countNonZero</code> 로 확인하고, 잘린 픽셀이 몇 개인지도 세어 보세요.',
            hint: '<code>int v = s[x] + 60; if (v &gt; 255) { v = 255; clipped++; } d[x] = (uchar)v;</code> — <code>uchar</code> 끼리 더하면 <code>int</code> 로 올라가므로(정수 승격) 255 를 넘는 값도 계산됩니다. 잘라낸 영역은 <b><code>clone()</code> 으로 복사</b>해서 쓰세요 — ROI 는 원본의 창(같은 메모리)이라 ROI 를 바꾸면 원본도 함께 바뀝니다.',
            expect: 'add 결과와 다른 픽셀 0개 (0 이면 같음)\n잘린 픽셀 509개 / 전체 30000개',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_gray.png", IMREAD_GRAYSCALE);
    Mat src = img(Rect(300, 40, 200, 150)).clone();
    Mat mine = src.clone();
    int clipped = 0;

    for (int y = 0; y < src.rows; y++)
    {
        const uchar* s = src.ptr<uchar>(y);
        uchar* d = mine.ptr<uchar>(y);
        for (int x = 0; x < src.cols; x++)
        {
            // TODO: 값에 60 을 더하고 255 를 넘으면 255 로 잘라 d[x] 에 쓰세요 (잘린 개수도 세기)
        }
    }

    Mat byCv;
    add(src, Scalar(60), byCv);
    // TODO: absdiff 와 countNonZero 로 두 결과가 같은지 확인하세요
    cout << "잘린 픽셀 " << clipped << "개" << endl;
    imshow("mine", mine);
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_gray.png", IMREAD_GRAYSCALE);
    Mat src = img(Rect(300, 40, 200, 150)).clone();
    Mat mine = src.clone();
    int clipped = 0;

    for (int y = 0; y < src.rows; y++)
    {
        const uchar* s = src.ptr<uchar>(y);
        uchar* d = mine.ptr<uchar>(y);
        for (int x = 0; x < src.cols; x++)
        {
            int v = s[x] + 60;
            if (v > 255) { v = 255; clipped++; }
            d[x] = (uchar)v;               // 또는 d[x] = saturate_cast<uchar>(s[x] + 60);
        }
    }

    Mat byCv, diff;
    add(src, Scalar(60), byCv);
    absdiff(mine, byCv, diff);
    cout << "add 결과와 다른 픽셀 " << countNonZero(diff) << "개 (0 이면 같음)" << endl;
    cout << "잘린 픽셀 " << clipped << "개 / 전체 " << src.total() << "개" << endl;
    imshow("mine", mine);
    waitKey(0);
    return 0;
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: '밝기 · 대비 · 히스토그램 (1)', subtitle: '밝기는 더하기, 대비는 곱하기', notes: '<p>💬 “스마트폰 사진 앱의 ‘밝기’ 와 ‘대비’ 슬라이더는 안에서 무슨 계산을 할까요?” — 오늘 그 두 줄을 직접 씁니다. 목표: 출력 = alpha × 입력 + beta 를 몸에 익히고, C++ 루프로 직접 구현까지. (2분)</p>' },
          { layout: 'image', title: '환자: low_contrast.png', src: 'images/low_contrast.png', caption: '노출 부족 · 저대비 — 실제 최소 102, 최대 134 (전체 폭의 12% 만 사용)', notes: '<p>실제 현장에서 흔한 상황입니다(조명 부족, 노출 설정 실수, 렌즈 오염). 💬 “이 사진을 밝게만 하면 잘 보일까요?” — 아니다, 차이(대비)를 벌려야 한다. 이 감각이 이 교시의 핵심입니다. (3분)</p>' },
          { layout: 'diagram', title: '입출력 그래프로 보기', html: FIG_BRIGHT, caption: '더하기 = 평행 이동 · 곱하기 = 기울기 · 255 를 넘으면 잘림(포화)', notes: '<p>그래프를 손으로 따라가며 설명합니다. 특히 포화: 오른쪽 위가 평평해지는 구간 = 정보가 사라진 구간. 💬 “하얗게 날아간 사진을 어둡게 하면 되살아날까?” — 안 된다. (5분)</p>' },
          { layout: 'code', title: '예제: 밝기 ±50 과 포화', code: S_BRIGHT, points: ['<code>img + Scalar(50)</code> = <code>add(img, Scalar(50), dst)</code>', '<code>subtract</code> 는 0 아래로 안 내려감', 'OpenCV 는 <b>포화 연산</b> — C++ <code>uchar</code> 의 순환(230+50 → 24)과 다르다', '원본 최대 208 → 255 로 막힘'], notes: '<p>실행 후 최소/최대 값을 함께 읽습니다. 칠판에 <code>uchar u = 230; u += 50;</code> → 24 를 적어 대조하면 기억에 남습니다. <code>minMaxLoc(img, &amp;mn, &amp;mx)</code> 의 포인터 인수도 짚어 줍니다. (5분)</p>' },
          { layout: 'code', title: '예제: 대비(alpha) 와 밝기(beta)', code: S_CONTRAST, points: ['<code>src.convertTo(dst, -1, alpha, beta)</code> — <code>-1</code> = 형식 유지', 'alpha 2.0 만 → 평균 236, 대부분 포화', 'alpha 3.0 + beta −250 → 표준편차 20.1', '<b>표준편차 = 대비의 척도</b> (<code>meanStdDev</code>)'], notes: '<p>alpha 만 키우면 왜 실패하는지(전부 흰색) 반드시 보여 줍니다. beta 의 부호가 alpha 와 반대라는 요령을 강조. 💬 “alpha 3 이면 beta 는 대략 얼마?” — −(평균×(alpha−1)) ≈ −236. <code>convertScaleAbs</code> 는 절댓값만 다르다고 한 줄 언급. (6분)</p>' },
          { layout: 'code', title: '직접 구현: ptr + saturate_cast', code: S_MANUAL, points: ['<code>ptr&lt;uchar&gt;(y)</code> = y 행 첫 픽셀 주소 → <code>s[x]</code>', '<code>saturate_cast&lt;uchar&gt;</code> = 반올림 + 0~255 자르기', 'convertTo 와 다른 픽셀 <b>0개</b>', '<code>(uchar)</code> 로만 바꾸면 넘쳐서 얼룩무늬 (예제 3)'], notes: '<p>C++ 강좌만의 핵심 장면입니다. <code>saturate_cast</code> 를 지우고 <code>(uchar)(int)</code> 로 바꿔 실행해 결과 창의 얼룩무늬를 보여 주세요. 💬 “300 을 uchar 에 넣으면?” — 44 (300−256). (6분)</p>' },
          { layout: 'diagram', title: '감마 보정: 직선이 아니라 곡선', html: FIG_GAMMA, caption: 'gamma < 1 은 어두운 쪽을 크게 올리고 255 는 넘지 않는다', notes: '<p>곱하기(직선)와 감마(곡선)의 차이를 그래프로 비교합니다. 핵심: <b>밝은 쪽을 잘라먹지 않는다</b>. 감마는 모니터 · 카메라의 기본 특성이기도 하다는 배경도 한 줄 언급. (4분)</p>' },
          { layout: 'code', title: '예제: 1×256 LUT 로 감마 보정', code: S_GAMMA, points: ['값은 0~255 뿐 → <b>256칸 표</b>를 미리 계산', '<code>LUT(img, table, dst)</code> 한 번에 적용 (아주 빠름)', 'gamma 0.5 에서 128 → 181, 255 → 255', '반전 · 색 줄이기 등 <b>모든 1:1 변환</b>에 같은 기법'], notes: '<p>“픽셀마다 pow 를 부르면 30만 번” 과 “표 한 번 만들면 256번” 을 비교합니다. 학생들에게 gamma 값을 1.5, 0.3 으로 바꿔 실행하게 합니다. (6분)</p>' },
          { layout: 'code', title: '예제: normalize 로 자동 스트레칭', code: S_NORM, points: ['<code>NORM_MINMAX</code> — 최소 → 0, 최대 → 255', '표준편차 6.7 → 53.1 (8배)', 'alpha · beta 를 고르지 않아도 된다', '약점: 잡음 한 점이 최대값이면 효과 반감'], notes: '<p>저대비 영상의 정답이 이것이라는 점을 확인합니다. 💬 “잡음 픽셀 하나가 255 라면?” — 늘릴 폭이 없다 → 상·하위 1% 절단 또는 CLAHE(2교시) 예고. (5분)</p>' },
          { layout: 'table', title: '상황별 처방', head: ['증상', '처방 (C++)'], rows: [
            ['전체가 조금 어둡다', '<code>convertTo(dst, -1, 1.0, +40)</code>'],
            ['흐릿하다 (차이가 작다)', '<code>convertTo(dst, -1, 1.5, −60)</code>'],
            ['그림자 속이 안 보인다', '감마 0.4~0.7 (<code>LUT</code>)'],
            ['좁은 범위에 몰렸다', '<code>normalize(NORM_MINMAX)</code>'],
            ['조명이 한쪽으로 기울었다', 'CLAHE (2교시)']
          ], notes: '<p>학생 노트에 적게 할 표입니다. 실습 시간에 이 표를 보고 스스로 고르게 하면 좋습니다. (2분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '8비트 영상에서 230 인 픽셀에 <code>add</code> 로 50 을 더하면?', options: ['280', '255', '24', '컴파일 오류'], answer: 1, explain: 'OpenCV 는 포화 연산 — 255 로 잘립니다. C++ <code>uchar</code> 산술(24)과 다릅니다.', notes: '<p>정답 2번. 3번을 고른 학생이 많으면 <code>uchar</code> 산술과 OpenCV 의 차이, 그리고 <code>saturate_cast</code> 를 다시 강조합니다.</p>' },
          { layout: 'practice', title: '실습: 감마 값 바꿔 보기', desc: '<p><code>makeGamma(gamma)</code> 를 완성하고 <b>0.4 · 0.7 · 1.5</b> 로 실행해 평균 · 표준편차를 비교하세요.</p><ul><li>감마만으로는 표준편차가 크게 늘지 않는다는 것을 확인</li><li>같은 영상에 <code>normalize</code> 도 적용해 비교</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <cmath>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/low_contrast.png", IMREAD_GRAYSCALE);
    Mat table(1, 256, CV_8U);
    // TODO: gamma 0.5 표 채우기 -> LUT 적용 -> 평균 · 표준편차 출력
    for (int i = 0; i < 256; i++) table.at<uchar>(i) = (uchar)i;
    Mat dst;
    LUT(img, table, dst);
    cout << format("평균 %.1f", mean(dst)[0]) << endl;
    imshow("dst", dst);
    waitKey(0);
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <cmath>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/low_contrast.png", IMREAD_GRAYSCALE);
    Mat table(1, 256, CV_8U);
    for (int i = 0; i < 256; i++)
        table.at<uchar>(i) = saturate_cast<uchar>(pow(i / 255.0, 0.5) * 255.0);
    Mat dst;
    LUT(img, table, dst);
    Scalar m, sd;
    meanStdDev(dst, m, sd);
    cout << format("평균 %.1f 표준편차 %.1f", m[0], sd[0]) << endl;
    imshow("dst", dst);
    waitKey(0);
    return 0;
}`, notes: '<p>감마는 “어두운 쪽을 살리는” 도구이지 “대비를 만드는” 도구가 아니라는 결론을 학생 입으로 말하게 합니다. 저대비에는 normalize/CLAHE. 빨리 끝난 학생은 2번 실습(포화 직접 구현)으로. (6분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['출력 = <b>alpha × 입력 + beta</b> → <code>src.convertTo(dst, -1, alpha, beta)</code>', 'OpenCV 산술은 <b>포화</b> (255 · 0 에서 잘림, 되돌릴 수 없음)', '직접 루프: <code>ptr&lt;uchar&gt;(y)</code> + <b><code>saturate_cast&lt;uchar&gt;</code></b>', '<code>addWeighted(a, α, b, β, γ, dst)</code> = 두 영상 섞기 (α+β=1)', '감마 = 곡선 변환 → <b>Mat(1, 256, CV_8U)</b> 표 + <code>LUT</code>', '<code>normalize(NORM_MINMAX)</code> = 선형 스트레칭', '다음 교시: 영상의 성적표 <b>히스토그램</b> 과 equalizeHist · CLAHE'], notes: '<p>일곱 줄을 읽고 다음 교시를 예고합니다: “이 영상이 밝은지 어두운지, 대비가 좋은지 한눈에 보는 그래프를 직접 그린다.” (2분)</p>' }
        ]
      },
      {
        id: 'cv06-2', title: '히스토그램 · 평탄화 · CLAHE', minutes: 50,
        goals: ['calcHist 의 포인터 인수를 이해하고 히스토그램을 구해 막대 그래프로 그릴 수 있다', '히스토그램 모양으로 어두운 사진 · 저대비 · 포화를 판단할 수 있다', 'equalizeHist 와 CLAHE 를 비교하고 컬러 영상에 올바르게 적용할 수 있다'],
        flow: [['도입: 히스토그램이란', 7], ['calcHist 와 그리기 · 읽기', 18], ['평탄화 · CLAHE · 컬러 · 통계', 17], ['정리 · 퀴즈', 8]],
        content: [
          { type: 'h', text: '히스토그램 = 밝기별 픽셀 수' },
          { type: 'p', html: '히스토그램은 <b>어떤 밝기의 픽셀이 몇 개인가</b>를 세어 그린 막대 그래프입니다. 위치 정보는 버리고 개수만 남기므로, 영상이 <b>어두운지 · 밝은지 · 대비가 좋은지 · 날아갔는지</b>를 한눈에 알려 주는 <b>성적표</b> 역할을 합니다. 카메라의 노출을 맞출 때, 조명을 점검할 때 가장 먼저 보는 그래프입니다.' },
          { type: 'figure', html: FIG_HIST, caption: '그림 3. 4×4 조각의 픽셀 값을 세면 두 개의 봉우리가 생긴다 — 이런 영상은 이진화하기 쉽다' },
          { type: 'h', text: 'calcHist: C++ 의 고전적인 포인터 인수' },
          { type: 'p', html: '<code>calcHist</code> 는 여러 영상 · 여러 채널 · 다차원 히스토그램까지 계산하는 범용 함수라서, C++ 에서는 인수를 <b>배열(포인터)</b>로 받습니다. 흑백 1차원이라 원소가 1개뿐이어도 배열로 만들어 넘깁니다. 모양은 늘 같으니 한 번 익혀 두면 됩니다. Python 의 <code>cv2.calcHist([gray], [0], None, [256], [0, 256])</code> 과 인수 순서만 조금 다릅니다.' },
          { type: 'figure', html: FIG_CALC, caption: '그림 4. calcHist 의 인수 — 영상 배열 · 채널 배열 · 마스크 · 출력 · 차원 수 · bin 수 배열 · 범위 배열' },
          { type: 'code', title: '예제 1: calcHist 로 구해서 직접 그리기', code: EX_HIST,
            desc: '결과 <code>hist</code> 는 <b>bin 256개짜리 CV_32FC1(float)</b> Mat(OpenCV 에서는 256행 1열)이므로 <code>hist.at&lt;float&gt;(i)</code> 처럼 <b>인덱스 하나</b>로 읽습니다. 가장 많은 밝기(최빈값)는 반복문으로 직접 찾았고, <code>drawHist</code> 의 <code>minMaxLoc</code> 처럼 필요 없는 출력에는 <code>0</code>(널 포인터)을 넘기면 됩니다. <code>drawHist</code> 는 가장 큰 막대를 280 px 로 맞춰(정규화) <code>line</code> 을 256번 그립니다 — 결과 창의 그래프에서 <b>149 부근의 큰 봉우리(트레이 배경)</b> 와 어두운 쪽의 작은 봉우리(부품)를 확인하세요.',
            expect: 'bin 수 256, 형식 CV_32FC1\n밝기 0 픽셀 0개, 128 픽셀 1974개, 255 픽셀 0개\n가장 많은 밝기 = 149 (13845개)\n합계 307200 = 전체 픽셀 307200' },
          { type: 'callout', kind: 'warn', title: 'calcHist 의 흔한 실수 3가지', html: '<ul><li><b>float 로 읽기</b>: <code>hist.at&lt;uchar&gt;(i)</code> · <code>at&lt;int&gt;(i)</code> 는 엉뚱한 값을 줍니다(Release 빌드는 형식 검사도 안 합니다) — 반드시 <code>at&lt;float&gt;</code>.</li><li><b>범위는 상한 제외</b>: <code>float range[] = {0, 256}</code> 이라고 써야 255 까지 포함됩니다(<code>{0, 255}</code> 로 쓰면 포화된 255 픽셀이 빠집니다).</li><li><b>const 맞추기</b>: <code>ranges</code> 는 <code>const float*</code> 의 배열입니다. <code>float* ranges[]</code> 로 선언하면 컴파일 오류가 납니다.</li></ul>마스크를 주면 <b>그 영역만</b>의 히스토그램이 나옵니다 (<code>Mat()</code> 대신 CV_8UC1 마스크) — ROI 검사에 유용합니다.' },
          { type: 'callout', kind: 'more', title: 'vector 형식 calcHist', html: 'OpenCV 3 이후에는 <code>std::vector</code> 를 받는 간단한 형식도 있습니다: <code>calcHist(vector&lt;Mat&gt;{ img }, { 0 }, Mat(), hist, { 256 }, { 0, 256 });</code> — 인수 순서는 (영상들, 채널들, 마스크, 출력, bin 수들, 범위들)이고 차원 수는 벡터 길이로 정해집니다. 결과는 같습니다. 인터넷의 예제 대부분이 포인터 형식이라 두 형식을 모두 읽을 수 있어야 합니다(예제 2 는 vector 형식).' },
          { type: 'h', text: '히스토그램 읽는 법' },
          { type: 'code', title: '예제 2: 세 영상의 히스토그램 비교 (구간별 비율)', code: EX_READ,
            desc: '숫자로 보면 진단이 분명해집니다. <b>sample_gray</b> 는 128~191 에 61.8% 가 있고 폭(38~208)이 넓습니다 — 정상. <b>low_contrast</b> 는 64~127 구간에 <b>98.8%</b> 가 몰려 폭이 32 뿐 — 저대비. <b>uneven_light</b> 는 폭은 235 로 넓고 밝은 쪽(192~255)에 34.2% 가 있는데 최대값이 <b>255 로 포화(핫스폿)</b> 되어 있고 어두운 쪽은 20 까지 내려갑니다 — 한 장 안에서 밝기가 크게 다른 <b>조명 불균일</b>입니다. 처방이 각각 다릅니다. <code>format</code> 에서 <code>%</code> 글자는 <code>%%</code> 로 씁니다.',
            expect: 'images/sample_gray.png\n   최소 38 최대 208 평균 119.2 표준편차 38.8\n     0 ~  63 :  20.1%\n    64 ~ 127 :  17.7%\n   128 ~ 191 :  61.8%\n   192 ~ 255 :   0.5%\nimages/low_contrast.png\n   최소 102 최대 134 평균 118.2 표준편차 6.7\n     0 ~  63 :   0.0%\n    64 ~ 127 :  98.8%\n   128 ~ 191 :   1.2%\n   192 ~ 255 :   0.0%\nimages/uneven_light.png\n   최소 20 최대 255 평균 164.3 표준편차 50.5\n     0 ~  63 :   3.9%\n    64 ~ 127 :  21.3%\n   128 ~ 191 :  40.6%\n   192 ~ 255 :  34.2%' },
          { type: 'table', head: ['히스토그램 모양', '진단', '처방'], rows: [
            ['왼쪽(0 쪽)에 몰림', '노출 부족 — 어두운 사진', 'beta 더하기 · 감마 0.5 · 조명 강화'],
            ['오른쪽(255)에 붙어 봉우리', '포화 — 하얗게 날아감', '노출 · 조명 줄이기 (소프트웨어로 복구 불가)'],
            ['가운데 좁은 봉우리 하나', '저대비', '<code>normalize(NORM_MINMAX)</code> · CLAHE'],
            ['봉우리 두 개 + 사이가 빈다', '물체/배경이 잘 갈린다', '<b>이진화에 최적</b> (07차시 Otsu)'],
            ['전체에 고르게 퍼짐', '대비 좋음 (또는 평탄화 결과)', '그대로 사용']
          ], caption: '표 2. 히스토그램 모양 → 진단 → 처방. 검사 장비를 세팅할 때 가장 먼저 하는 점검' },
          { type: 'h', text: '평탄화(equalizeHist) 와 CLAHE' },
          { type: 'p', html: '<b>히스토그램 평탄화</b>는 누적 히스토그램(CDF)을 변환표로 써서 픽셀 값을 <b>0~255 전체에 고르게 퍼지도록</b> 재배치합니다. 강력하지만 영상 전체에 하나의 표를 쓰기 때문에 ① 조명이 기울어진 영상에서는 한쪽이 뭉개지고 ② <b>잡음도 함께 증폭</b>됩니다. <b>CLAHE</b>(Contrast Limited Adaptive Histogram Equalization)는 영상을 <b>타일(보통 8×8)</b> 로 나눠 각각 평탄화하고, <code>clipLimit</code> 로 <b>증폭 한도</b>를 두어 이 문제를 줄입니다. C++ 에서 CLAHE 는 <b>알고리즘 객체</b>입니다: <code>createCLAHE()</code> 가 스마트 포인터 <code>Ptr&lt;CLAHE&gt;</code> 를 돌려주고, <code>clahe-&gt;apply(src, dst)</code> 로 호출합니다(<code>delete</code> 불필요).' },
          { type: 'figure', html: FIG_EQ, caption: '그림 5. 좁은 봉우리를 CDF 로 펴는 평탄화 · 타일마다 제한을 두고 펴는 CLAHE' },
          { type: 'code', title: '예제 3: normalize · equalizeHist · CLAHE 비교', code: EX_EQ,
            desc: '표준편차로 강도를 비교해 보세요: 원본 6.7 → normalize 53.1 → <b>equalizeHist 78.5</b>(가장 셈, 잡음도 증폭) → CLAHE 는 <code>clipLimit</code> 에 따라 13.1 → 17.5 → 25.0 으로 <b>조절 가능</b>합니다. 같은 <code>clahe</code> 객체에 <code>setClipLimit</code> 으로 설정만 바꿔 재사용했습니다. 결과 창의 두 영상을 비교하면 equalizeHist 는 얼룩덜룩하고, CLAHE 는 부드럽게 살아납니다. 실무에서는 <b>clipLimit 2~4, 타일 8×8</b> 에서 시작해 눈으로 맞춥니다. (<code>format("%-14s", ...)</code> 은 왼쪽 정렬 14칸 — 한글은 바이트 수로 세어 줄이 어긋나므로 영문 이름을 썼습니다.)',
            expect: 'original       최소/최대 102/134 평균 118.2 표준편차 6.7\nnormalize      최소/최대 0/255 평균 128.8 표준편차 53.1\nequalizeHist   최소/최대 0/255 평균 139.4 표준편차 78.5\nCLAHE(2.0)     최소/최대 90/151 평균 122.8 표준편차 13.1\nCLAHE(4.0)     최소/최대 79/163 평균 125.0 표준편차 17.5\nCLAHE(8.0)     최소/최대 59/180 평균 128.1 표준편차 25.0' },
          { type: 'h', text: '컬러 영상의 밝기 평탄화' },
          { type: 'code', title: '예제 4: HSV 의 V 채널만 평탄화하기', code: EX_COLOR,
            desc: 'B · G · R 을 각각 평탄화하면 세 채널의 분포가 억지로 같아져 <b>평균이 회색 쪽으로 몰리고</b> 색이 바랩니다(빨간 원도 과장됨). HSV 의 <b>V 채널만</b> 평탄화하면 H(색상)와 S(채도)는 건드리지 않으므로 <b>색은 그대로 두고 밝기만</b> 살아납니다. <code>split</code> 은 <code>vector&lt;Mat&gt;</code> 로 채널을 나누고, <code>for (Mat&amp; c : ch)</code> 처럼 <b>참조</b>로 돌아야 각 채널이 제자리에서 바뀝니다. <code>equalizeHist(c, c)</code> 처럼 입력과 출력을 같은 Mat 으로 줘도 됩니다(in-place).',
            expect: 'dark     평균 BGR (58,60,60)  빨간 원 BGR (18,18,98) H=0\nBGR each 평균 BGR (134,134,134)  빨간 원 BGR (5,2,245) H=0\nV only   평균 BGR (116,120,122)  빨간 원 BGR (45,45,243) H=0' },
          { type: 'callout', kind: 'tip', title: '검사에서는 “보기 좋게” 가 목적이 아니다', html: '평탄화 · CLAHE 는 <b>사람이 보기 좋게</b> 만드는 데는 훌륭하지만, <b>측정</b>에는 조심해야 합니다. 픽셀 값이 비선형으로 바뀌므로 "밝기 200 이상이면 불량" 같은 <b>절대 기준이 깨집니다</b>. 그래서 실무에서는 ① 화면 표시용으로만 쓰거나 ② 조명 불균일 보정(배경 나누기 · 07차시의 적응형 이진화)처럼 <b>목적이 분명한</b> 방법을 씁니다.' },
          { type: 'code', title: '예제 5: minMaxLoc · mean · meanStdDev 통계와 판정', code: EX_STATS,
            desc: '<code>minMaxLoc</code> 은 값뿐 아니라 <b>위치</b>(<code>Point</code>)도 줍니다 — 가장 밝은 점이 어디인지 = 핫스폿 찾기. <code>Point</code> 는 <code>cout</code> 으로 바로 <code>[x, y]</code> 형태로 출력됩니다. <code>meanStdDev</code> 는 평균과 표준편차를 한 번에 주고, <b>마스크를 넘기면 그 영역만</b> 계산합니다 — ROI 검사에서 "이 창 안의 평균 밝기가 규격 안인가"를 판정하는 기본형입니다. 마지막 줄처럼 <b>표준편차로 저대비를 자동 판정</b>하면 조명 이상을 스스로 알려 주는 프로그램이 됩니다.',
            expect: "최소 102 @ [36, 4] / 최대 134 @ [498, 91]\n평균 118.18 표준편차 6.69\nmean() 만 쓰면 118.18\n가운데 사각형 영역: 평균 121.41 표준편차 3.79\n판정: 표준편차 6.69 < 15 이므로 '저대비 — 조명 · 노출 점검 필요'" },
          { type: 'callout', kind: 'vs', title: 'Visual Studio 에서는 — 히스토그램 창 띄우기', html: '로컬 PC 에서는 예제 1 의 <code>drawHist</code> 결과를 <code>imshow("histogram", ...)</code> 로 원본 창 옆에 띄워 두면 카메라 노출을 맞출 때 아주 유용합니다. 함수로 분리해 두었으므로 <b>헤더(Histogram.h) 와 소스(Histogram.cpp)</b> 로 옮기면 여러 프로젝트에서 재사용할 수 있습니다 — 16차시에서 이런 도구들을 클래스로 묶습니다. 마우스로 ROI 를 고르고(<code>selectROI</code>, 로컬 전용) 그 영역 마스크로 <code>calcHist</code> 를 다시 호출하면 실전 점검 도구가 됩니다.' },
          { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 · 오개념 지도', html: '<ul><li>미리 실행해 둘 것: 예제 1 의 히스토그램 그림과 예제 3 의 equalizeHist / CLAHE 영상 — <b>화면 비교</b>가 이 교시의 핵심 체험입니다.</li><li>오개념 ①: <b>“평탄화하면 항상 좋아진다”</b> → 잡음 증폭 · 절대 기준 붕괴를 예제 3 의 표준편차 78.5 로 설명.</li><li>오개념 ②: <b>“히스토그램이 같으면 같은 영상”</b> → 위치 정보가 없다는 점을 그림 3 으로.</li><li>오개념 ③: <code>at&lt;uchar&gt;</code> 로 히스토그램 읽기 → 형식이 <code>CV_32FC1</code>. 학생 코드에서 값이 0 이나 이상한 수로 나오면 가장 먼저 확인.</li><li>C++ 포인터 인수(<code>&amp;gray, 1, channels, …</code>)에 겁먹는 학생에게는 그림 4 를 보며 “배열 이름 = 첫 원소 주소” 를 짚어 줍니다.</li><li>평가 루브릭(4점): ① calcHist 인수를 바르게 씀(1) ② 막대 그래프를 그림(1) ③ 히스토그램으로 진단을 말함(1) ④ 컬러는 V 채널만 처리(1).</li><li>💬 마무리 발문: “봉우리가 두 개인 히스토그램에서 임계값을 어디에 둘까?” → 07차시 Otsu 로 자연스럽게 연결.</li></ul>' }
        ],
        practice: [
          {
            title: '히스토그램 그리기 함수 완성하기', level: 2,
            desc: '<code>Mat drawHist(const Mat&amp; gray)</code> 함수를 완성해 <b>512×300 컬러 캔버스</b>에 히스토그램 막대를 그리세요. 가장 큰 막대가 캔버스 높이의 약 90% 가 되도록 정규화하고, <code>images/low_contrast.png</code> 의 히스토그램이 <b>가운데 좁은 봉우리</b>로 보이는지 확인하세요. 픽셀이 존재하는 밝기 구간(처음 · 마지막으로 0 이 아닌 bin)도 구해 출력하세요.',
            hint: '① <code>calcHist(&amp;gray, 1, channels, Mat(), hist, 1, &amp;histSize, ranges);</code> → ② <code>minMaxLoc(hist, 0, &amp;mx)</code> 로 최대 개수, 반복문으로 그 위치(밝기) → ③ <code>int barH = cvRound(hist.at&lt;float&gt;(i) / mx * 270);</code> → ④ <code>line(canvas, Point(i*2, 299), Point(i*2, 299-barH), Scalar::all(200), 2);</code> → ⑤ <code>while (hist.at&lt;float&gt;(lo) == 0) lo++;</code>',
            expect: '가장 많은 밝기 123, 개수 58493\n픽셀이 존재하는 구간 102 ~ 134 (폭 32)',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

Mat drawHist(const Mat& gray)
{
    const int channels[] = { 0 };
    int histSize = 256;
    float range[] = { 0, 256 };
    const float* ranges[] = { range };
    Mat hist;
    calcHist(&gray, 1, channels, Mat(), hist, 1, &histSize, ranges);

    Mat canvas(300, 512, CV_8UC3, Scalar::all(30));
    // TODO: 가장 큰 막대(개수 · 밝기)를 찾아 출력하고,
    //       비율로 막대 높이를 정해 line 으로 256개를 그리세요
    // TODO: 픽셀이 존재하는 구간 lo ~ hi 를 구해 출력하세요

    return canvas;
}

int main()
{
    Mat img = imread("images/low_contrast.png", IMREAD_GRAYSCALE);
    imshow("histogram", drawHist(img));
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

Mat drawHist(const Mat& gray)
{
    const int channels[] = { 0 };
    int histSize = 256;
    float range[] = { 0, 256 };
    const float* ranges[] = { range };
    Mat hist;
    calcHist(&gray, 1, channels, Mat(), hist, 1, &histSize, ranges);

    double mx;
    minMaxLoc(hist, 0, &mx);                     // 가장 큰 막대의 값
    int best = 0;                                // 그 막대의 위치(밝기)
    for (int i = 1; i < 256; i++)
        if (hist.at<float>(i) > hist.at<float>(best)) best = i;
    cout << "가장 많은 밝기 " << best << ", 개수 " << mx << endl;

    Mat canvas(300, 512, CV_8UC3, Scalar::all(30));
    for (int i = 0; i < 256; i++)
    {
        int barH = cvRound(hist.at<float>(i) / mx * 270);
        line(canvas, Point(i * 2, 299), Point(i * 2, 299 - barH), Scalar::all(200), 2);
    }
    int lo = 0, hi = 255;
    while (hist.at<float>(lo) == 0) lo++;
    while (hist.at<float>(hi) == 0) hi--;
    cout << "픽셀이 존재하는 구간 " << lo << " ~ " << hi << " (폭 " << hi - lo << ")" << endl;
    return canvas;
}

int main()
{
    Mat img = imread("images/low_contrast.png", IMREAD_GRAYSCALE);
    imshow("histogram", drawHist(img));
    waitKey(0);
    return 0;
}`
          },
          {
            title: 'CLAHE 의 clipLimit · 타일 크기 바꿔 보기', level: 1,
            desc: '<code>images/uneven_light.png</code>(조명이 기울어진 영상)에 <b>equalizeHist</b> 와 <b>CLAHE</b> 를 적용해 표준편차를 비교하고, <code>clipLimit</code> 를 1 · 2 · 4 로, 타일을 <code>4×4</code> 와 <code>16×16</code> 으로 바꿔 결과를 관찰하세요. 어느 설정이 글자를 가장 잘 읽게 만드나요?',
            hint: '<code>Ptr&lt;CLAHE&gt; clahe = createCLAHE(clip, Size(tile, tile)); clahe-&gt;apply(img, dst);</code> · 설정만 바꾸려면 <code>clahe-&gt;setClipLimit(c)</code> · <code>clahe-&gt;setTilesGridSize(Size(t, t))</code>. 결과 창에 여러 장을 <code>imshow</code> 로 함께 띄우면 비교가 쉽습니다.',
            expect: '원본 표준편차 50.5\nequalizeHist 표준편차 73.7\nCLAHE clip 1.0 (8x8) 표준편차 49.5\nCLAHE clip 2.0 (8x8) 표준편차 48.2\nCLAHE clip 4.0 (8x8) 표준편차 47.1\nCLAHE clip 2.0 (4x4) 표준편차 51.9\nCLAHE clip 2.0 (16x16) 표준편차 48.5',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

double stdOf(const Mat& m)
{
    Scalar mean, sd;
    meanStdDev(m, mean, sd);
    return sd[0];
}

int main()
{
    Mat img = imread("images/uneven_light.png", IMREAD_GRAYSCALE);
    cout << format("원본 표준편차 %.1f", stdOf(img)) << endl;

    Mat eq;
    equalizeHist(img, eq);
    // TODO: equalizeHist 의 표준편차를 출력하세요

    double clips[] = { 1.0, 2.0, 4.0 };
    for (double clip : clips)
    {
        // TODO: CLAHE(clip, 8x8) 를 적용해 표준편차를 출력하세요
    }
    // TODO: clipLimit 2.0 으로 타일 4x4 와 16x16 도 비교하세요
    imshow("equalize", eq);
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

double stdOf(const Mat& m)
{
    Scalar mean, sd;
    meanStdDev(m, mean, sd);
    return sd[0];
}

int main()
{
    Mat img = imread("images/uneven_light.png", IMREAD_GRAYSCALE);
    cout << format("원본 표준편차 %.1f", stdOf(img)) << endl;

    Mat eq;
    equalizeHist(img, eq);
    cout << format("equalizeHist 표준편차 %.1f", stdOf(eq)) << endl;

    double clips[] = { 1.0, 2.0, 4.0 };
    for (double clip : clips)
    {
        Ptr<CLAHE> clahe = createCLAHE(clip, Size(8, 8));
        Mat dst;
        clahe->apply(img, dst);
        cout << format("CLAHE clip %.1f (8x8) 표준편차 %.1f", clip, stdOf(dst)) << endl;
    }
    int tiles[] = { 4, 16 };
    for (int tile : tiles)
    {
        Ptr<CLAHE> clahe = createCLAHE(2.0, Size(tile, tile));
        Mat dst;
        clahe->apply(img, dst);
        cout << format("CLAHE clip 2.0 (%dx%d) 표준편차 %.1f", tile, tile, stdOf(dst)) << endl;
        imshow(format("clahe %d", tile), dst);
    }
    imshow("equalize", eq);
    waitKey(0);
    return 0;
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: '밝기 · 대비 · 히스토그램 (2)', subtitle: '영상의 성적표를 읽고 고치기', notes: '<p>💬 “사진 앱의 히스토그램 그래프를 본 적 있나요? 그 그래프로 무엇을 알 수 있을까요?” — 노출 · 대비 진단. 오늘은 그 그래프를 C++ 로 직접 구하고 그립니다. (2분)</p>' },
          { layout: 'diagram', title: '히스토그램 = 밝기별 픽셀 수', html: FIG_HIST, caption: '가로축 밝기 0~255 · 세로축 개수. 위치 정보는 버린다', notes: '<p>4×4 조각을 함께 세어 봅니다(어두운 8개, 밝은 8개). 핵심 두 가지: ① 막대 합 = 전체 픽셀 수 ② 위치 정보가 없다. 💬 “같은 히스토그램을 가진 다른 영상이 있을 수 있을까?” — 있다(픽셀을 섞어도 같다). (4분)</p>' },
          { layout: 'diagram', title: 'calcHist 의 인수', html: FIG_CALC, caption: '원소가 하나뿐이어도 배열 · 포인터로 넘긴다 — 범위의 상한은 제외', notes: '<p>인수가 많아 겁먹지 않게 “늘 같은 모양 — 복사해서 쓰는 4줄”이라고 안심시킵니다. <code>&amp;gray, 1</code> = 영상 1장짜리 배열, <code>&amp;histSize</code> = 원소 1개짜리 배열. <code>const float*</code> 배열을 만드는 이유(차원마다 범위 하나). (5분)</p>' },
          { layout: 'code', title: '예제: calcHist → 막대 그래프로 그리기', code: S_HIST, points: ['결과는 <b>CV_32FC1 256×1</b> → <code>hist.at&lt;float&gt;(i)</code>', '<code>minMaxLoc(hist, 0, &amp;mx)</code> — 필요 없는 출력은 0', '최대값으로 정규화해 <code>line</code> 256번', '<code>{0, 256}</code> — 상한은 제외'], notes: '<p>결과 창의 그래프에서 149 봉우리(트레이)를 함께 찾습니다. <code>at&lt;float&gt;</code> 를 <code>at&lt;uchar&gt;</code> 로 바꿔 보게 하면 그래프가 엉망이 되는 것을 직접 확인할 수 있습니다. (7분)</p>' },
          { layout: 'table', title: '히스토그램 읽는 법', head: ['모양', '진단', '처방'], rows: [
            ['왼쪽에 몰림', '어두운 사진', '+beta · 감마 0.5'],
            ['오른쪽 끝에 붙음', '포화 (날아감)', '노출 · 조명 줄이기 — 복구 불가'],
            ['가운데 좁은 봉우리', '저대비', '<code>normalize</code> · CLAHE'],
            ['봉우리 2개', '물체/배경 분리 쉬움', '이진화 (07차시)'],
            ['고르게 퍼짐', '대비 양호', '그대로']
          ], notes: '<p>표를 보며 실제 세 영상(sample_gray · low_contrast · uneven_light)의 숫자를 대응시킵니다(예제 2): 98.8% 가 한 구간 = 저대비, 34.2% 가 192 이상 + 최대 255 = 포화 · 조명 불균일. (4분)</p>' },
          { layout: 'diagram', title: '평탄화와 CLAHE', html: FIG_EQ, caption: 'CDF 를 변환표로 써서 펴기 → 타일별 + clipLimit 로 제한한 것이 CLAHE', notes: '<p>CDF 곡선이 “변환표(= LUT)”라는 점만 직관적으로 설명하고 수식은 생략합니다 — 1교시의 LUT 와 연결. CLAHE 의 두 손잡이(clipLimit · 타일 크기)를 강조. (4분)</p>' },
          { layout: 'code', title: '예제: equalizeHist vs CLAHE', code: S_EQ, points: ['표준편차 6.7 → 평탄화 78.5 → CLAHE 13.1', '평탄화는 <b>가장 세지만</b> 잡음도 증폭', '<code>Ptr&lt;CLAHE&gt;</code> 스마트 포인터 → <code>clahe-&gt;apply</code>', '실무 시작값: clipLimit 2~4, 타일 8×8'], notes: '<p>두 결과 영상을 나란히 보여 주는 것이 핵심입니다. 얼룩덜룩함(평탄화) vs 자연스러움(CLAHE). 💬 “왜 숫자가 큰 쪽이 더 좋은 게 아닐까?” — 잡음까지 키운다. <code>Ptr</code> 은 <code>std::shared_ptr</code> 과 같아서 <code>delete</code> 가 필요 없다고 짚어 줍니다. (6분)</p>' },
          { layout: 'code', title: '예제: 컬러는 V 채널만', code: S_COLOR, points: ['B · G · R 각각 평탄화 → <b>색이 바랜다</b>', 'HSV 로 바꿔 <code>hc[2]</code>(V) 만 평탄화', '<code>merge</code> → <code>COLOR_HSV2BGR</code>', 'Lab 의 L 채널도 같은 원리'], notes: '<p>05차시의 split/merge 가 여기서 쓰인다는 점을 짚어 줍니다. 본문 예제 4 로 잘못된 방법의 결과(평균 BGR 이 회색으로 몰림)를 먼저 보여 주면 효과가 큽니다. (5분)</p>' },
          { layout: 'bullets', title: '통계 3종 세트', lead: '히스토그램을 다 그리지 않아도 알 수 있는 것들', bullets: [
            '<code>minMaxLoc(img, &amp;mn, &amp;mx, &amp;mnLoc, &amp;mxLoc)</code> — 값 + <b>위치</b> (핫스폿 찾기)',
            '<code>mean(img)</code> — 평균 (<code>Scalar</code> 의 [0]~[2] = 채널별)',
            '<code>meanStdDev(img, mean, sd)</code> — <b>표준편차 = 대비의 척도</b>',
            '<b>마스크</b>를 넘기면 그 영역만 계산 → ROI 검사의 기본형',
            ['자동 판정 예', ['<code>sd[0] &lt; 15</code> → 저대비 경고', '<code>mx == 255</code> → 포화 경고']]
          ], notes: '<p>실전에서 가장 많이 쓰는 4줄입니다(본문 예제 5). 학생들에게 “조명이 이상하면 자동으로 알려 주는 코드”를 써 보라고 하면 좋은 과제가 됩니다. (4분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>calcHist</code> 결과 Mat 의 형식과 크기는?', options: ['CV_8UC1, 256×1', 'CV_32FC1, 256×1', 'CV_32SC1, 1×256', 'CV_8UC3, 256×256'], answer: 1, explain: 'float 256행 1열 — 값은 <code>hist.at&lt;float&gt;(i)</code> 로 읽습니다.', notes: '<p>정답 2번. 실습에서 값이 이상하게 나오면 여기를 먼저 확인하라고 알려 줍니다.</p>' },
          { layout: 'practice', title: '실습: CLAHE 손잡이 돌려 보기', desc: '<p><code>uneven_light.png</code> 에 equalizeHist 와 CLAHE 를 적용해 표준편차를 비교하세요.</p><ul><li><code>clipLimit</code> 1 · 2 · 4</li><li>타일 4×4 와 16×16</li><li>어느 설정이 <b>글자를 가장 잘 읽게</b> 하나?</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/uneven_light.png", IMREAD_GRAYSCALE);
    Mat eq;
    equalizeHist(img, eq);
    // TODO: CLAHE 를 clipLimit 2.0, 8x8 로 적용해 표준편차를 비교하세요
    imshow("equalize", eq);
    waitKey(0);
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/uneven_light.png", IMREAD_GRAYSCALE);
    Mat eq, cl;
    equalizeHist(img, eq);
    Ptr<CLAHE> clahe = createCLAHE(2.0, Size(8, 8));
    clahe->apply(img, cl);
    Scalar me, se, mc, sc;
    meanStdDev(eq, me, se);
    meanStdDev(cl, mc, sc);
    cout << format("평탄화 %.1f / CLAHE %.1f", se[0], sc[0]) << endl;
    imshow("equalize", eq);
    imshow("clahe", cl);
    waitKey(0);
    return 0;
}`, notes: '<p>정답 경향: 평탄화 73.7 / CLAHE(2.0) 48.2. 글자는 CLAHE 가 훨씬 잘 보입니다. 하지만 오른쪽 아래 어두운 영역은 여전히 완전하지 않다 → 07차시의 <b>적응형 이진화</b>가 필요하다고 연결합니다. (7분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['히스토그램 = 밝기별 픽셀 수 (위치 정보는 없음)', '<code>calcHist(&amp;gray, 1, channels, Mat(), hist, 1, &amp;histSize, ranges)</code> → <b>CV_32FC1 256×1</b>', '범위 <code>{0, 256}</code> — 상한 제외 · 값은 <code>at&lt;float&gt;</code>', '모양으로 진단: 어두움 · 포화 · 저대비 · 봉우리 두 개', '<code>equalizeHist</code> = 전역(강함, 잡음 증폭) · <b>CLAHE</b> = 타일별 + clipLimit (<code>Ptr&lt;CLAHE&gt;</code>)', '컬러는 <b>HSV 의 V 채널만</b> (또는 Lab 의 L)', '다음 차시: 봉우리 사이에 선을 긋는 <b>이진화(Threshold)</b>'], notes: '<p>정리 후 다음 차시를 예고합니다: “봉우리 두 개 사이의 골짜기를 자동으로 찾아 주는 Otsu.” 히스토그램을 이해했으니 이진화는 자연스럽게 이어집니다. (2분)</p>' }
        ]
      }
    ]
  });
})();
