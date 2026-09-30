/* 11차시 기하 변환: 크기 · 회전 · 어파인 · 원근 */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 보간(interpolation) 세 가지가 픽셀 사이를 채우는 방법
  const FIG_INTERP = `<svg viewBox="0 0 720 300" role="img" aria-label="확대할 때 원본 픽셀 사이를 Nearest, Linear, Cubic 이 채우는 방법 비교">
  <text x="360" y="22" text-anchor="middle" class="tx-b">확대 = 원본 픽셀 사이의 빈 자리를 "추측"해서 채우는 일 (보간)</text>
  <line x1="60" y1="250" x2="660" y2="250" class="ax"/><line x1="60" y1="60" x2="60" y2="250" class="ax"/>
  <text x="40" y="66" class="tx-m">밝기</text><text x="650" y="272" class="tx-m">x</text>
  <circle cx="120" cy="220" r="5" class="p1"/><circle cx="300" cy="90" r="5" class="p1"/><circle cx="480" cy="190" r="5" class="p1"/><circle cx="600" cy="80" r="5" class="p1"/>
  <text x="120" y="272" text-anchor="middle" class="tx-m">40</text><text x="300" y="272" text-anchor="middle" class="tx-m">200</text><text x="480" y="272" text-anchor="middle" class="tx-m">90</text><text x="600" y="272" text-anchor="middle" class="tx-m">220</text>
  <text x="360" y="292" text-anchor="middle" class="tx-m">● 원본 픽셀 값 (샘플)</text>
  <polyline points="60,220 210,220 210,90 390,90 390,190 540,190 540,80 660,80" class="s1" fill="none" stroke-width="2.5"/>
  <polyline points="120,220 300,90 480,190 600,80" class="s2" fill="none" stroke-width="2.5"/>
  <path d="M120,220 C180,235 240,80 300,90 C360,100 420,205 480,190 C525,179 555,80 600,80" class="s3" fill="none" stroke-width="2.5"/>
  <rect x="400" y="40" width="270" height="24" rx="4" class="card-bg"/>
  <line x1="410" y1="52" x2="440" y2="52" class="s1" stroke-width="2.5"/><text x="446" y="56" class="tx-m">NEAREST</text>
  <line x1="510" y1="52" x2="535" y2="52" class="s2" stroke-width="2.5"/><text x="540" y="56" class="tx-m">LINEAR</text>
  <line x1="600" y1="52" x2="620" y2="52" class="s3" stroke-width="2.5"/><text x="625" y="56" class="tx-m">CUBIC</text>
  <text x="180" y="120" class="tx-m">계단(블록)</text><text x="330" y="150" class="tx-m">직선</text><text x="500" y="130" class="tx-m">곡선(부드러움)</text>
</svg>`;

  // 그림 2: 어파인 변환 행렬 2×3 의 의미
  const FIG_AFFINE = `<svg viewBox="0 0 720 320" role="img" aria-label="어파인 변환 2x3 행렬과 이동, 회전, 크기 변환 행렬의 모습">
  <text x="360" y="22" text-anchor="middle" class="tx-b">어파인 변환(Affine) = 2×3 행렬 하나로 이동 · 회전 · 크기 · 기울이기를 한 번에</text>
  <rect x="30" y="40" width="290" height="110" rx="10" class="p1s"/>
  <text x="50" y="76" class="tx">[ a  b  t<tspan dy="4" font-size="10">x</tspan> ]</text>
  <text x="50" y="112" class="tx">[ c  d  t<tspan dy="4" font-size="10">y</tspan> ]</text>
  <text x="170" y="76" class="tx-m">x' = a·x + b·y + t<tspan dy="3" font-size="9">x</tspan></text>
  <text x="170" y="112" class="tx-m">y' = c·x + d·y + t<tspan dy="3" font-size="9">y</tspan></text>
  <text x="175" y="140" text-anchor="middle" class="tx-m">Mat 2행 3열 CV_64F · 읽기는 M.at&lt;double&gt;(r, c)</text>
  <rect x="340" y="40" width="350" height="110" rx="10" class="card-bg"/>
  <text x="515" y="66" text-anchor="middle" class="tx-b">직선은 직선으로, 평행선은 평행선으로</text>
  <text x="515" y="92" text-anchor="middle" class="tx-m">→ 원근(깊이)은 표현하지 못한다</text>
  <text x="515" y="118" text-anchor="middle" class="tx-m">필요한 대응점: <tspan class="tx">3쌍</tspan> (미지수 6개)</text>
  <text x="515" y="140" text-anchor="middle" class="tx-m">getAffineTransform(src3, dst3)</text>
  <rect x="30" y="170" width="205" height="130" rx="10" class="p2s"/>
  <text x="132" y="196" text-anchor="middle" class="tx-b">이동 (translate)</text>
  <text x="132" y="228" text-anchor="middle" class="tx">[ 1  0  t<tspan dy="3" font-size="9">x</tspan> ]</text>
  <text x="132" y="252" text-anchor="middle" class="tx">[ 0  1  t<tspan dy="3" font-size="9">y</tspan> ]</text>
  <rect x="60" y="264" width="30" height="22" rx="3" class="p1s"/><rect x="90" y="272" width="30" height="22" rx="3" class="p1"/>
  <text x="130" y="284" class="tx-m">→ 오른쪽 아래로</text>
  <rect x="255" y="170" width="205" height="130" rx="10" class="p3s"/>
  <text x="357" y="196" text-anchor="middle" class="tx-b">회전 (rotate θ)</text>
  <text x="357" y="228" text-anchor="middle" class="tx">[ cosθ  −sinθ  0 ]</text>
  <text x="357" y="252" text-anchor="middle" class="tx">[ sinθ   cosθ  0 ]</text>
  <rect x="300" y="266" width="26" height="20" rx="3" class="p1s"/><rect x="340" y="266" width="26" height="20" rx="3" class="p1" transform="rotate(-20 353 276)"/>
  <text x="378" y="282" class="tx-m">원점 기준</text>
  <rect x="480" y="170" width="210" height="130" rx="10" class="p4s"/>
  <text x="585" y="196" text-anchor="middle" class="tx-b">크기 (scale)</text>
  <text x="585" y="228" text-anchor="middle" class="tx">[ s<tspan dy="3" font-size="9">x</tspan>  0   0 ]</text>
  <text x="585" y="252" text-anchor="middle" class="tx">[ 0   s<tspan dy="3" font-size="9">y</tspan>  0 ]</text>
  <rect x="520" y="268" width="20" height="16" rx="2" class="p1s"/><rect x="552" y="262" width="34" height="26" rx="3" class="p1"/>
  <text x="600" y="282" class="tx-m">배율</text>
</svg>`;

  // 그림 3: 회전 후 잘림 방지 — 출력 크기 계산
  const FIG_CROP = `<svg viewBox="0 0 700 260" role="img" aria-label="회전 후 원본 크기로 출력하면 모서리가 잘리고, 새 크기를 계산하면 전체가 담긴다">
  <text x="350" y="20" text-anchor="middle" class="tx-b">회전하면 모서리가 원래 화면 밖으로 나간다</text>
  <rect x="40" y="46" width="250" height="185" rx="6" class="card-bg"/>
  <text x="165" y="70" text-anchor="middle" class="tx-m">출력 크기 = 원본 (640×480)</text>
  <rect x="70" y="86" width="190" height="130" class="s2" fill="none" stroke-width="2" stroke-dasharray="5 4"/>
  <rect x="70" y="86" width="190" height="130" class="p1s" transform="rotate(30 165 151)"/>
  <text x="165" y="240" text-anchor="middle" class="tx-m">→ 네 모서리가 <tspan class="tx">잘림</tspan></text>
  <rect x="380" y="46" width="290" height="185" rx="6" class="card-bg"/>
  <text x="525" y="70" text-anchor="middle" class="tx-m">출력 크기 = 새로 계산 (791×791)</text>
  <rect x="430" y="82" width="190" height="130" class="p1s" transform="rotate(30 525 147)"/>
  <rect x="404" y="80" width="242" height="136" class="s3" fill="none" stroke-width="2" stroke-dasharray="5 4"/>
  <text x="525" y="240" text-anchor="middle" class="tx-m">nw = h·|sinθ| + w·|cosθ|,  nh = h·|cosθ| + w·|sinθ|</text>
</svg>`;

  // 그림 4: 어파인 3점 vs 원근 4점
  const FIG_PERSP = `<svg viewBox="0 0 740 330" role="img" aria-label="어파인 변환은 3점, 원근 변환은 4점 대응이 필요하며 원근은 3x3 행렬을 쓴다">
  ${ARROW('c11b1')}
  <rect x="20" y="34" width="330" height="200" rx="10" class="p2s"/>
  <text x="185" y="58" text-anchor="middle" class="tx-b">어파인 (2×3) — 대응점 3쌍</text>
  <polygon points="60,180 170,180 60,90" class="p1s"/><circle cx="60" cy="180" r="5" class="p1"/><circle cx="170" cy="180" r="5" class="p1"/><circle cx="60" cy="90" r="5" class="p1"/>
  <polygon points="215,190 320,172 230,100" class="p3s"/><circle cx="215" cy="190" r="5" class="p3"/><circle cx="320" cy="172" r="5" class="p3"/><circle cx="230" cy="100" r="5" class="p3"/>
  <line x1="180" y1="150" x2="208" y2="150" class="ln" stroke-width="2" marker-end="url(#c11b1)"/>
  <text x="185" y="215" text-anchor="middle" class="tx-m">평행선은 계속 평행 (원근 없음)</text>
  <rect x="370" y="34" width="350" height="200" rx="10" class="p4s"/>
  <text x="545" y="58" text-anchor="middle" class="tx-b">원근 (3×3, 호모그래피) — 대응점 4쌍</text>
  <polygon points="410,180 520,180 520,90 410,90" class="p1s"/>
  <circle cx="410" cy="180" r="5" class="p1"/><circle cx="520" cy="180" r="5" class="p1"/><circle cx="520" cy="90" r="5" class="p1"/><circle cx="410" cy="90" r="5" class="p1"/>
  <polygon points="590,196 700,178 678,104 606,96" class="p5s"/>
  <circle cx="590" cy="196" r="5" class="p5"/><circle cx="700" cy="178" r="5" class="p5"/><circle cx="678" cy="104" r="5" class="p5"/><circle cx="606" cy="96" r="5" class="p5"/>
  <line x1="534" y1="140" x2="576" y2="140" class="ln" stroke-width="2" marker-end="url(#c11b1)"/>
  <text x="545" y="215" text-anchor="middle" class="tx-m">사각형 → 임의의 사각형 (기울어진 평면)</text>
  <rect x="20" y="248" width="700" height="72" rx="10" class="card-bg"/>
  <text x="120" y="278" text-anchor="middle" class="tx">[ h00 h01 h02 ]</text>
  <text x="120" y="302" text-anchor="middle" class="tx">[ h10 h11 h12 ] [ h20 h21 1 ]</text>
  <text x="440" y="276" text-anchor="middle" class="tx-m">u = h00·x + h01·y + h02,  v = h10·x + h11·y + h12,  w = h20·x + h21·y + 1</text>
  <text x="440" y="306" text-anchor="middle" class="tx">최종 좌표 x' = u / w,  y' = v / w   ← 마지막 <tspan class="tx-b">나눗셈</tspan>이 원근을 만든다</text>
</svg>`;

  // 그림 5: 영상 px → 로봇 mm 좌표 변환
  const FIG_PXMM = `<svg viewBox="0 0 720 300" role="img" aria-label="영상의 기준 마크 4개와 로봇 좌표 4개를 짝지어 px에서 mm로 가는 변환 행렬을 만든다">
  ${ARROW('c11b2')}
  <rect x="20" y="40" width="300" height="230" rx="10" class="card-bg"/>
  <text x="170" y="64" text-anchor="middle" class="tx-b">카메라 영상 (px)</text>
  <polygon points="52,92 288,98 282,242 56,238" class="p1s"/>
  <circle cx="52" cy="92" r="6" class="p1"/><text x="44" y="86" class="tx-m">M1</text>
  <circle cx="288" cy="98" r="6" class="p1"/><text x="282" y="90" class="tx-m">M2</text>
  <circle cx="282" cy="242" r="6" class="p1"/><text x="276" y="262" class="tx-m">M3</text>
  <circle cx="56" cy="238" r="6" class="p1"/><text x="48" y="258" class="tx-m">M4</text>
  <circle cx="150" cy="160" r="12" class="p3"/><text x="168" y="164" class="tx-m">부품 (x, y) px</text>
  <rect x="400" y="40" width="300" height="230" rx="10" class="card-bg"/>
  <text x="550" y="64" text-anchor="middle" class="tx-b">로봇 좌표 (mm)</text>
  <rect x="440" y="96" width="220" height="145" class="p2s"/>
  <circle cx="440" cy="96" r="6" class="p2"/><text x="416" y="90" class="tx-m">270, 90</text>
  <circle cx="660" cy="96" r="6" class="p2"/><text x="636" y="90" class="tx-m">530, 90</text>
  <circle cx="660" cy="241" r="6" class="p2"/><text x="630" y="260" class="tx-m">530, −90</text>
  <circle cx="440" cy="241" r="6" class="p2"/><text x="412" y="260" class="tx-m">270, −90</text>
  <circle cx="530" cy="168" r="12" class="p3"/><text x="548" y="172" class="tx-m">집을 위치 (X, Y) mm</text>
  <line x1="326" y1="155" x2="394" y2="155" class="ln" stroke-width="2.5" marker-end="url(#c11b2)"/>
  <text x="360" y="146" text-anchor="middle" class="tx-m">H</text>
  <text x="360" y="290" text-anchor="middle" class="tx-m">H = getPerspectiveTransform(px4, mm4) → perspectiveTransform(점들, 결과, H) 로 점 좌표 변환</text>
</svg>`;

  // ================================================================= 1교시 예제
  const EX_RESIZE = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_gray.png", IMREAD_GRAYSCALE);
    cout << "원본: " << img.cols << " x " << img.rows << endl;

    Mat half, big;
    resize(img, half, Size(320, 240));              // ① 크기를 직접 지정 (너비, 높이)
    cout << "Size 지정: " << half.cols << " x " << half.rows << endl;
    resize(img, big, Size(), 1.5, 1.5);             // ② 배율 지정 (fx, fy) — Size() 는 0 x 0
    cout << "배율 1.5배: " << big.cols << " x " << big.rows << endl;

    // 2x2 (0, 100 / 200, 255) 를 8x8 로 4배 확대 → 첫 줄 값 비교
    Mat tiny = (Mat_<uchar>(2, 2) << 0, 100, 200, 255);
    int flags[] = { INTER_NEAREST, INTER_LINEAR, INTER_CUBIC };
    const char* names[] = { "NEAREST", "LINEAR ", "CUBIC  " };
    for (int i = 0; i < 3; i++)
    {
        Mat up;
        resize(tiny, up, Size(8, 8), 0, 0, flags[i]);
        cout << names[i] << ":";
        for (int x = 0; x < 8; x++) cout << " " << (int)up.at<uchar>(0, x);   // uchar → (int)
        cout << endl;
    }
    imshow("half", half);
    waitKey(0);
    return 0;
}`;

  const EX_QUALITY = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    int flags[] = { INTER_NEAREST, INTER_LINEAR, INTER_CUBIC };
    const char* names[] = { "NEAREST", "LINEAR ", "CUBIC  " };

    // (1) 확대: 작은 ROI 30x30 을 8배(240x240) 로
    Mat img = imread("images/sample_gray.png", IMREAD_GRAYSCALE);
    Mat roi = img(Rect(96, 136, 30, 30));                   // 원의 왼쪽 에지 부분
    for (int i = 0; i < 3; i++)
    {
        Mat up, lap;
        resize(roi, up, Size(), 8, 8, flags[i]);
        Laplacian(up, lap, CV_32F);                          // 계단이 많으면 값이 커진다
        Scalar m, sd;
        meanStdDev(lap, m, sd);
        double lo, hi;
        minMaxLoc(up, &lo, &hi);
        cout << format("%s %dx%d 계단 정도 %.2f 밝기 %.0f~%.0f", names[i], up.cols, up.rows, sd[0], lo, hi) << endl;
        imshow(names[i], up);
    }
    double rlo, rhi;
    minMaxLoc(roi, &rlo, &rhi);
    cout << format("원본 ROI 밝기 %.0f~%.0f", rlo, rhi) << endl;

    // (2) 축소: 1/4 로 줄일 때 평균 밝기가 얼마나 보존되는가
    Mat src = imread("images/gradient_clean.png", IMREAD_GRAYSCALE);
    cout << format("원본 평균 %.2f", mean(src)[0]) << endl;
    int f2[] = { INTER_NEAREST, INTER_LINEAR, INTER_AREA };
    const char* n2[] = { "NEAREST", "LINEAR ", "AREA   " };
    for (int i = 0; i < 3; i++)
    {
        Mat small;
        resize(src, small, Size(), 0.25, 0.25, f2[i]);
        Scalar m, sd;
        meanStdDev(small, m, sd);
        cout << format("%s 1/4 축소: 평균 %.2f 표준편차 %.2f", n2[i], m[0], sd[0]) << endl;
    }
    waitKey(0);
    return 0;
}`;

  const EX_FLIP = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_gray.png", IMREAD_GRAYSCALE);

    Mat fx, fy, fxy, r90;
    flip(img, fx, 0);                        // 0: 위아래 (x축 기준)
    flip(img, fy, 1);                        // 1: 좌우 (y축 기준, 거울)
    flip(img, fxy, -1);                      // -1: 양쪽 = 180도 회전
    rotate(img, r90, ROTATE_90_CLOCKWISE);   // 시계 방향 90도

    cout << "원본 " << img.cols << "x" << img.rows << " / 90도 회전 " << r90.cols << "x" << r90.rows << endl;
    cout << "(0,0)=" << (int)img.at<uchar>(0, 0)
         << " / 위아래 (479,0)=" << (int)fx.at<uchar>(479, 0)
         << " / 좌우 (0,639)=" << (int)fy.at<uchar>(0, 639) << endl;

    // 평행 이동 행렬을 직접 만들어 warpAffine 에 넘기기 (CV_64F = double)
    double tx = 80, ty = -40;
    Mat M = (Mat_<double>(2, 3) << 1, 0, tx,
                                   0, 1, ty);
    Mat moved;
    warpAffine(img, moved, M, img.size(), INTER_LINEAR, BORDER_CONSTANT, Scalar(0));
    cout << "M =" << endl << M << endl;
    cout << "이동 결과 " << moved.cols << "x" << moved.rows << ", 빈 자리 값 " << (int)moved.at<uchar>(10, 10) << endl;

    imshow("flip 1 (mirror)", fy);
    imshow("rotate 90", r90);
    imshow("moved", moved);
    waitKey(0);
    return 0;
}`;

  const EX_ROTFIX = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

// 가장 큰 어두운 덩어리의 기울기(도)를 -45 ~ 45 범위로 돌려준다
double measureAngle(const Mat& gray)
{
    Mat bin;
    threshold(gray, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    vector<vector<Point>> cs;
    findContours(bin, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    size_t big = 0;
    for (size_t i = 1; i < cs.size(); i++)
        if (contourArea(cs[i]) > contourArea(cs[big])) big = i;
    double a = minAreaRect(cs[big]).angle;
    if (a > 45) a -= 90;                 // 버전마다 범위가 달라 0도 근처로 맞춘다
    if (a < -45) a += 90;
    return a;
}

int main()
{
    Mat img = imread("images/chip_rotated.png", IMREAD_GRAYSCALE);

    // ① 지금 몇 도 기울어져 있나? (어두운 몸체 이진화 → 최소 외접 회전 사각형)
    cout << format("원본 기울기 %.2f 도", measureAngle(img)) << endl;

    // ② 반대 방향으로 돌리는 어파인 행렬 (중심 · 각도 · 배율) — 각도는 반시계가 +
    Point2f center(330.4f, 245.2f);
    Mat M = getRotationMatrix2D(center, -23.5, 1.0);
    cout << "M = " << M.rows << "x" << M.cols << " " << typeToString(M.type()) << endl;
    cout << format("  [%.4f %.4f %.2f]", M.at<double>(0, 0), M.at<double>(0, 1), M.at<double>(0, 2)) << endl;
    cout << format("  [%.4f %.4f %.2f]", M.at<double>(1, 0), M.at<double>(1, 1), M.at<double>(1, 2)) << endl;

    // ③ 적용 — 빈 자리는 트레이와 비슷한 밝은 값으로 채운다
    Mat dst;
    warpAffine(img, dst, M, img.size(), INTER_LINEAR, BORDER_CONSTANT, Scalar(200));
    cout << format("보정 후 기울기 %.2f 도", measureAngle(dst)) << endl;

    imshow("input", img);
    imshow("rotated back", dst);
    waitKey(0);
    return 0;
}`;

  const EX_CROP = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <cmath>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_gray.png", IMREAD_GRAYSCALE);
    double angle = 45;
    Point2f center(img.cols / 2.0f, img.rows / 2.0f);
    Mat M = getRotationMatrix2D(center, angle, 1.0);

    // 회전 행렬의 cos · sin 으로 필요한 출력 크기를 계산
    double c = fabs(M.at<double>(0, 0)), s = fabs(M.at<double>(0, 1));
    int nw = (int)(img.rows * s + img.cols * c);
    int nh = (int)(img.rows * c + img.cols * s);
    cout << "원본 " << img.cols << "x" << img.rows << " → 새 크기 " << nw << "x" << nh << endl;

    Mat cut;                                             // (1) 원본 크기 그대로 → 잘림
    warpAffine(img, cut, M, img.size());

    // (2) 새 화면의 중앙으로 오도록 이동량(3열)을 더해 준다
    M.at<double>(0, 2) += nw / 2.0 - center.x;
    M.at<double>(1, 2) += nh / 2.0 - center.y;
    Mat full;
    warpAffine(img, full, M, Size(nw, nh), INTER_LINEAR, BORDER_CONSTANT, Scalar(255));
    cout << "잘린 결과 " << cut.cols << "x" << cut.rows << " / 전체 담은 결과 " << full.cols << "x" << full.rows << endl;
    cout << "full 의 왼쪽 위 모서리 값 " << (int)full.at<uchar>(2, 2) << " (borderValue 255)" << endl;

    imshow("cut", cut);
    imshow("full", full);
    waitKey(0);
    return 0;
}`;

  // ================================================================= 2교시 예제
  const EX_AFFINE3 = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_gray.png", IMREAD_GRAYSCALE);

    // 원본의 세 점이 결과에서 어디로 가야 하는지 짝지어 준다 (3쌍)
    Point2f src[3] = { Point2f(0, 0), Point2f(639, 0), Point2f(0, 479) };
    Point2f dst[3] = { Point2f(60, 40), Point2f(600, 90), Point2f(10, 450) };

    Mat A = getAffineTransform(src, dst);              // 2x3, CV_64F
    cout << "A = " << A.rows << "x" << A.cols << " " << typeToString(A.type()) << endl;
    cout << format("  [%.4f %.4f %.2f]", A.at<double>(0, 0), A.at<double>(0, 1), A.at<double>(0, 2)) << endl;
    cout << format("  [%.4f %.4f %.2f]", A.at<double>(1, 0), A.at<double>(1, 1), A.at<double>(1, 2)) << endl;

    Mat warped;
    warpAffine(img, warped, A, Size(640, 480), INTER_LINEAR, BORDER_CONSTANT, Scalar(0));

    // 확인: 원본 (639, 0) 은 정말 (600, 90) 으로 갔나? → 점 변환은 transform
    vector<Point2f> p = { Point2f(639, 0) }, q;
    transform(p, q, A);
    cout << format("(639, 0) → (%.1f, %.1f)", q[0].x, q[0].y) << endl;

    imshow("input", img);
    imshow("affine", warped);
    waitKey(0);
    return 0;
}`;

  const EX_FRONT = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    // 살짝 기울어 찍힌 점 격자 교정판을 정면 모습으로 펴기
    Mat img = imread("images/calib_grid_top.png", IMREAD_GRAYSCALE);

    // 네 꼭지 점 (0,0) (10,0) (10,7) (0,7) 의 영상 좌표 (px) — 좌상 → 우상 → 우하 → 좌하
    Point2f src[4] = { Point2f(95.30f, 72.80f), Point2f(560.21f, 80.10f),
                       Point2f(552.60f, 410.40f), Point2f(88.70f, 398.89f) };
    // 펴진 뒤에 놓일 자리 — 1 mm = 10 px, 여백 50 px (점 간격 5 mm = 50 px)
    Point2f dst[4] = { Point2f(50, 50), Point2f(550, 50), Point2f(550, 400), Point2f(50, 400) };

    Mat H = getPerspectiveTransform(src, dst);         // 3x3, CV_64F
    Mat top;
    warpPerspective(img, top, H, Size(600, 450));
    cout << "정면화 결과 " << top.cols << "x" << top.rows << endl;

    // 검증: 점 88개가 50 px 격자 위에 놓였는지 (윤곽선 → 모멘트 중심, 12차시 미리보기)
    Mat bin;
    threshold(top, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    vector<vector<Point>> cs;
    findContours(bin, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    vector<Point2f> dots;
    for (const auto& c : cs)
    {
        double a = contourArea(c);
        if (a < 50 || a > 1000) continue;
        Moments m = moments(c);
        dots.push_back(Point2f((float)(m.m10 / m.m00), (float)(m.m01 / m.m00)));
    }
    float x0 = 1e9f, x1 = -1e9f, y0 = 1e9f, y1 = -1e9f;
    for (const auto& p : dots)
    {
        x0 = min(x0, p.x); x1 = max(x1, p.x);
        y0 = min(y0, p.y); y1 = max(y1, p.y);
    }
    cout << "점 " << dots.size() << "개" << endl;
    cout << format("x 범위 %.1f ~ %.1f", x0, x1) << endl;
    cout << format("y 범위 %.1f ~ %.1f", y0, y1) << endl;

    imshow("input", img);
    imshow("front", top);
    waitKey(0);
    return 0;
}`;

  const EX_PXMM = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    // robot_pick.png 의 기준 마크 4개: 영상 좌표(px) 와 로봇 좌표(mm) 를 모두 안다
    vector<Point2f> px = { Point2f(61.56f, 57.38f), Point2f(583.83f, 65.15f),
                           Point2f(574.58f, 426.42f), Point2f(67.27f, 419.64f) };
    vector<Point2f> mm = { Point2f(270, 90), Point2f(530, 90),
                           Point2f(530, -90), Point2f(270, -90) };

    Mat H = getPerspectiveTransform(px, mm);           // px → mm
    cout << "H = " << H.rows << "x" << H.cols << " " << typeToString(H.type()) << endl;
    for (int r = 0; r < 3; r++)
        cout << format("  [%10.6f %10.6f %10.4f]", H.at<double>(r, 0), H.at<double>(r, 1), H.at<double>(r, 2)) << endl;

    // 점 좌표 변환은 warpPerspective 가 아니라 perspectiveTransform!
    vector<Point2f> test = { Point2f(61.56f, 57.38f), Point2f(583.83f, 65.15f), Point2f(320, 240) };
    vector<Point2f> robot;
    perspectiveTransform(test, robot, H);
    for (size_t k = 0; k < test.size(); k++)
        cout << format("  px (%.1f, %.1f) → mm (%.2f, %.2f)", test[k].x, test[k].y, robot[k].x, robot[k].y) << endl;

    imshow("robot_pick", imread("images/robot_pick.png", IMREAD_GRAYSCALE));
    waitKey(0);
    return 0;
}`;

  const EX_INVERT = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    vector<Point2f> px = { Point2f(61.56f, 57.38f), Point2f(583.83f, 65.15f),
                           Point2f(574.58f, 426.42f), Point2f(67.27f, 419.64f) };
    vector<Point2f> mm = { Point2f(270, 90), Point2f(530, 90),
                           Point2f(530, -90), Point2f(270, -90) };

    Mat H = getPerspectiveTransform(px, mm);           // px → mm
    Mat Hinv;
    invert(H, Hinv);                                    // mm → px (역행렬, H.inv() 도 같음)

    // 로봇 좌표를 영상 어디에 표시할지 = 역변환
    vector<Point2f> want = { Point2f(400, 0), Point2f(320, 30), Point2f(470, 40) }, shown;
    perspectiveTransform(want, shown, Hinv);
    Mat img = imread("images/robot_pick.png", IMREAD_COLOR);
    for (size_t k = 0; k < want.size(); k++)
    {
        cout << format("  mm (%.0f, %.0f) → px (%.2f, %.2f)", want[k].x, want[k].y, shown[k].x, shown[k].y) << endl;
        drawMarker(img, Point(cvRound(shown[k].x), cvRound(shown[k].y)), Scalar(0, 0, 255), MARKER_CROSS, 24, 2);
    }

    // 왕복 확인: px → mm → px 하면 제자리로 돌아온다
    vector<Point2f> p0 = { Point2f(320, 240) }, p1, p2;
    perspectiveTransform(p0, p1, H);
    perspectiveTransform(p1, p2, Hinv);
    cout << format("왕복 확인: (320, 240) → (%.2f, %.2f)", p2[0].x, p2[0].y) << endl;

    imshow("robot marks", img);
    waitKey(0);
    return 0;
}`;

  const EX_SCANNER = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

// 네 점(좌상 → 우상 → 우하 → 좌하) 을 w x h 직사각형으로 펴 준다
Mat scan(const Mat& src, const vector<Point2f>& quad, int w, int h)
{
    vector<Point2f> dst = { Point2f(0, 0), Point2f(w - 1, 0), Point2f(w - 1, h - 1), Point2f(0, h - 1) };
    Mat H = getPerspectiveTransform(quad, dst);
    Mat out;
    warpPerspective(src, out, H, Size(w, h));
    return out;                                          // Mat 은 헤더만 복사되어 빠르다
}

int main()
{
    // 문서/카드 스캐너: 기울어진 네 꼭짓점 → 반듯한 직사각형
    Mat img = imread("images/calib_grid_top.png", IMREAD_GRAYSCALE);
    vector<Point2f> corners = { Point2f(95.30f, 72.80f), Point2f(560.21f, 80.10f),
                                Point2f(552.60f, 410.40f), Point2f(88.70f, 398.89f) };
    Mat flat = scan(img, corners, 500, 350);
    cout << "스캔 결과 " << flat.cols << "x" << flat.rows << endl;
    imshow("scan", flat);
    waitKey(0);
    return 0;
}`;

  const EX_MOUSE = `// 로컬 PC 전용: 마우스로 찍은 네 점을 펴서 새 창에 표시 (브라우저 버전은 예제 5)
#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

Mat g_src, g_view;
vector<Point2f> g_picked;

void onMouse(int event, int x, int y, int, void*)
{
    if (event != EVENT_LBUTTONDOWN) return;
    g_picked.push_back(Point2f((float)x, (float)y));        // imshow 창 좌표 = 원본 픽셀 좌표
    circle(g_view, Point(x, y), 5, Scalar(0, 0, 255), FILLED);
    imshow("pick 4 points", g_view);
    cout << g_picked.size() << " / 4 점" << endl;
    if (g_picked.size() < 4) return;

    vector<Point2f> dst = { Point2f(0, 0), Point2f(499, 0), Point2f(499, 349), Point2f(0, 349) };
    Mat H = getPerspectiveTransform(g_picked, dst);
    Mat flat;
    warpPerspective(g_src, flat, H, Size(500, 350));
    imshow("flat", flat);
    g_picked.clear();
    g_view = g_src.clone();
}

int main()
{
    g_src = imread("images/calib_grid_top.png", IMREAD_COLOR);
    if (g_src.empty()) return -1;
    g_view = g_src.clone();
    namedWindow("pick 4 points");
    setMouseCallback("pick 4 points", onMouse);
    imshow("pick 4 points", g_view);
    cout << "좌상 → 우상 → 우하 → 좌하 순서로 클릭하세요 (ESC 종료)" << endl;
    while (waitKey(30) != 27) {}
    return 0;
}`;

  const QUIZ1 = [
    { q: '이미지를 <b>절반 크기로 줄일 때</b> 가장 알맞은 보간 방식은?', options: ['<code>INTER_NEAREST</code>', '<code>INTER_CUBIC</code>', '<code>INTER_AREA</code>', '<code>INTER_LANCZOS4</code>'], answer: 2,
      explain: '<b>축소는 INTER_AREA</b>(영역 평균)가 기본입니다. 여러 픽셀을 평균 내므로 평균 밝기가 잘 보존되고 계단 무늬(에일리어싱)가 줄어듭니다. <b>확대는 INTER_CUBIC</b>(또는 INTER_LINEAR)이 부드럽고, <code>INTER_NEAREST</code> 는 픽셀 값을 그대로 복사하므로 계단이 보입니다.' },
    { q: '<code>resize(img, dst, Size(), 2, 2)</code> 의 결과 크기는? (원본 640×480)', options: ['640×480', '1280×960', '320×240', '오류 — Size 를 지정해야 한다'], answer: 1,
      explain: '<code>Size()</code>(= 0×0)을 주고 <code>fx</code>, <code>fy</code> 배율을 넘기면 <b>원본 × 배율</b> 크기가 됩니다. 반대로 Size 를 지정하면 배율은 무시됩니다. 둘 다 0 이면 예외(<code>cv::Exception</code>)가 납니다.' },
    { q: '<code>getRotationMatrix2D(center, 30, 1.0)</code> 이 돌려주는 것은?', options: ['회전된 이미지', '3×3 원근 행렬', '2×3 어파인 행렬 (CV_64F Mat)', '회전 각도(double)'], answer: 2,
      explain: '회전 <b>행렬만</b> 돌려줍니다(2행 3열, double → <code>M.at&lt;double&gt;(r, c)</code> 로 읽기). 실제로 이미지를 돌리려면 <code>warpAffine(src, dst, M, size)</code> 를 호출해야 합니다. 각도는 <b>반시계(CCW)가 +</b> 입니다.' },
    { q: '이미지를 오른쪽으로 50, 아래로 20 px 옮기는 어파인 행렬은?', options: ['<code>(Mat_&lt;double&gt;(2,3) &lt;&lt; 1,0,50, 0,1,20)</code>', '<code>(Mat_&lt;double&gt;(2,3) &lt;&lt; 1,0,20, 0,1,50)</code>', '<code>(Mat_&lt;double&gt;(2,3) &lt;&lt; 0,1,50, 1,0,20)</code>', '<code>(Mat_&lt;double&gt;(2,3) &lt;&lt; 50,0,1, 0,20,1)</code>'], answer: 0,
      explain: 'x\' = 1·x + 0·y + t<sub>x</sub>, y\' = 0·x + 1·y + t<sub>y</sub> 이므로 첫 행이 <code>1, 0, 50</code>, 둘째 행이 <code>0, 1, 20</code> 입니다. 3열이 이동량입니다.' },
    { q: '45° 회전 후 모서리가 잘리지 않게 하려면?', options: ['<code>BORDER_REFLECT</code> 를 쓴다', '출력 <code>Size</code> 를 계산해 키우고 이동량(3열)을 더한다', '<code>INTER_CUBIC</code> 을 쓴다', '<code>rotate</code> 를 쓴다'], answer: 1,
      explain: '<code>warpAffine</code> 은 지정한 출력 크기 밖은 버립니다. <b>nw = h·|sinθ| + w·|cosθ|</b>, <b>nh = h·|cosθ| + w·|sinθ|</b> 로 새 크기를 구하고, 회전 행렬의 3열에 <code>nw/2 − cx</code>, <code>nh/2 − cy</code> 를 더해 중앙으로 옮깁니다.' }
  ];

  const QUIZ2 = [
    { q: '원근 변환(호모그래피) 행렬을 만들려면 대응점이 몇 쌍 필요한가?', options: ['2쌍', '3쌍', '4쌍', '6쌍'], answer: 2,
      explain: '원근 변환은 3×3 행렬이고 마지막 성분을 1로 고정하므로 미지수가 8개 → <b>4쌍</b>이 필요합니다(<code>getPerspectiveTransform</code>). 어파인은 2×3, 미지수 6개 → <b>3쌍</b>(<code>getAffineTransform</code>) 입니다.' },
    { q: '이미지 전체를 펴는 함수와 <b>점 좌표만</b> 변환하는 함수를 옳게 짝지은 것은?', options: ['<code>warpPerspective</code> / <code>perspectiveTransform</code>', '<code>perspectiveTransform</code> / <code>warpPerspective</code>', '<code>warpAffine</code> / <code>invert</code>', '<code>remap</code> / <code>transform</code>'], answer: 0,
      explain: '이미지는 <code>warpPerspective(src, dst, H, size)</code>, 점 배열은 <code>perspectiveTransform(points, result, H)</code> 입니다. 부품 중심 좌표 몇 개만 로봇 좌표로 바꿀 때 이미지 전체를 펼 필요가 없습니다.' },
    { q: '원근 변환에서 마지막 <b>나눗셈</b>(x\' = u/w) 이 하는 일은?', options: ['색을 보정한다', '멀리 있는 것이 작게 보이는 원근 효과를 만든다', '행렬을 정규화한다', '보간 오차를 줄인다'], answer: 1,
      explain: 'w = h<sub>20</sub>x + h<sub>21</sub>y + 1 로 나누기 때문에 위치에 따라 배율이 달라집니다. 어파인은 이 나눗셈이 없으므로(w = 1) 평행선이 항상 평행하게 유지됩니다.' },
    { q: 'px → mm 변환 행렬 <code>H</code> 로 로봇 좌표를 영상 좌표로 되돌리려면?', options: ['<code>H.t()</code>', '<code>invert(H, Hinv)</code> 후 <code>Hinv</code> 사용', '<code>H</code> 에 −1 을 곱한다', '<code>invertAffineTransform(H, Hinv)</code>'], answer: 1,
      explain: '<b>역행렬</b>을 구합니다: <code>invert(H, Hinv)</code> 또는 <code>H.inv()</code>. (<code>invertAffineTransform</code> 은 2×3 어파인 전용입니다.) 또는 처음부터 mm→px 로 <code>getPerspectiveTransform(mm4, px4)</code> 를 만들어도 됩니다.' },
    { q: '기준 마크 4개를 쓸 때 <b>가장 좋은 배치</b>는?', options: ['한 줄로 나란히', '작업 영역 네 귀퉁이에 넓게', '화면 가운데 모아서', '세 개는 모으고 하나만 멀리'], answer: 1,
      explain: '대응점이 <b>넓게 퍼져 있을수록</b> 행렬이 안정적입니다. 세 점이 한 직선 위에 있거나 좁은 영역에 모이면 행렬이 불안정해져(작은 검출 오차가 크게 증폭) 변환 결과가 크게 틀립니다.' }
  ];

  CV_COURSE.addChapter({
    id: 'cv11', no: '11', title: '기하 변환: 크기 · 회전 · 어파인 · 원근', subtitle: 'resize · flip · rotate · warpAffine · warpPerspective 로 픽셀 위치를 옮기기',
    summary: '지금까지는 픽셀의 <b>값</b>을 바꿨습니다. 이번에는 픽셀의 <b>위치</b>를 바꿉니다. 크기 변경(<code>resize</code>)과 보간 방식 선택, 뒤집기 · 90° 회전, 2×3 <b>어파인 변환</b>으로 기울어진 부품을 바로 세우고, 3×3 <b>원근 변환</b>으로 기울어 찍힌 평면을 정면화하며, 영상 좌표(px)를 로봇 좌표(mm)로 바꾸는 변환 행렬까지 만들어 봅니다. 변환 행렬은 모두 <code>CV_64F</code> Mat 이라 <code>M.at&lt;double&gt;(r, c)</code> 로 읽고 고칩니다.',
    goals: ['resize 의 크기 · 배율 지정과 보간 방식(NEAREST/LINEAR/CUBIC/AREA)을 상황에 맞게 고를 수 있다',
      '어파인 변환 2×3 행렬의 의미를 설명하고 getRotationMatrix2D · warpAffine 으로 기울기를 보정할 수 있다',
      '회전 후 잘리지 않게 출력 크기를 계산할 수 있다',
      'getPerspectiveTransform · warpPerspective 로 평면을 정면화하고, perspectiveTransform 으로 px → mm 좌표 변환을 할 수 있다'],
    sections: [
      // ============================================================ 1교시
      {
        id: 'cv11-1', title: '크기 · 뒤집기 · 회전과 어파인 변환', minutes: 50,
        goals: ['resize 의 두 가지 사용법과 보간 방식의 차이를 안다', 'flip · rotate 로 빠르게 방향을 바꿀 수 있다', '어파인 2×3 행렬을 직접 만들고 warpAffine 으로 기울기를 보정할 수 있다'],
        flow: [['도입: 왜 위치를 바꾸나', 5], ['resize 와 보간', 15], ['flip · rotate · 어파인', 20], ['정리 · 퀴즈', 10]],
        content: [
          { type: 'h', text: '픽셀의 값이 아니라 위치를 바꾼다' },
          { type: 'p', html: '07~10차시에서 배운 이진화 · 필터 · 에지는 모두 픽셀의 <b>값</b>을 바꾸는 일이었습니다. <b>기하 변환(Geometric transform)</b>은 픽셀의 <b>위치</b>를 옮깁니다. 현장에서 쓰는 곳은 분명합니다.' },
          { type: 'list', items: [
            '<b>속도</b>: 640×480 을 320×240 으로 줄이면 픽셀이 1/4 → 검사 속도가 몇 배 빨라집니다 (<code>resize</code>).',
            '<b>정렬</b>: 트레이에 비뚤게 놓인 IC 칩을 바로 세워야 글자(OCR)를 읽을 수 있습니다 (<code>warpAffine</code>).',
            '<b>정면화</b>: 카메라가 비스듬히 본 라벨 · 문서 · 교정판을 정면 모습으로 펴야 치수를 잴 수 있습니다 (<code>warpPerspective</code>, 2교시).',
            '<b>좌표 변환</b>: 영상에서 찾은 부품 위치(px)를 로봇이 쓰는 실제 좌표(mm)로 바꿉니다 (2교시).'
          ] },
          { type: 'callout', kind: 'warn', title: '기하 변환의 공통 문제 두 가지', html: '① 옮긴 자리의 <b>값을 어디서 가져올지</b> — 원본에 없는 소수 좌표의 값을 추측해야 합니다(<b>보간, interpolation</b>). ② 원본에 없던 <b>빈 자리를 무엇으로 채울지</b> — <code>borderMode</code>(<code>BORDER_CONSTANT</code> …)와 <code>borderValue</code> 로 정합니다.' },
          { type: 'h', text: 'resize: 크기 지정 또는 배율 지정' },
          { type: 'figure', html: FIG_INTERP, caption: '그림 1. 원본 픽셀(●) 사이를 채우는 세 가지 방법 — NEAREST 는 계단, LINEAR 는 직선, CUBIC 은 곡선' },
          { type: 'table', head: ['interpolation', '뜻', '속도', '쓰는 곳'], rows: [
            ['<code>INTER_NEAREST</code>', '가장 가까운 픽셀 값을 그대로 복사', '가장 빠름', '<b>라벨/마스크</b> 이미지(값이 섞이면 안 되는 것), 픽셀 값 확대 관찰'],
            ['<code>INTER_LINEAR</code>', '이웃 2×2 픽셀의 가중 평균', '빠름', '<b>기본값</b> — 대부분의 확대 · warpAffine'],
            ['<code>INTER_CUBIC</code>', '이웃 4×4 로 3차 곡선 맞춤', '느림(약 4배)', '<b>확대</b> 품질이 중요할 때 (에지가 더 살아남)'],
            ['<code>INTER_AREA</code>', '줄어드는 영역의 픽셀 평균', '보통', '<b>축소</b> — 평균 밝기 보존, 계단 무늬(에일리어싱) 억제'],
            ['<code>INTER_LANCZOS4</code>', '8×8 창의 Lanczos 보간', '가장 느림', '인쇄용 고품질 확대']
          ], caption: '표 1. resize(src, dst, dsize, fx = 0, fy = 0, interpolation = INTER_LINEAR) — 외우기: 축소는 AREA, 확대는 CUBIC, 라벨은 NEAREST' },
          { type: 'code', title: '예제 1: resize — 크기 지정 · 배율 지정과 보간 값 비교', code: EX_RESIZE,
            desc: '<code>resize(src, dst, Size(w, h))</code> 는 크기를 직접, <code>Size()</code> + <code>fx, fy</code> 는 배율로 지정합니다(Python: <code>cv2.resize(img, None, fx=1.5, fy=1.5)</code>). <code>Size</code> 는 <b>(너비, 높이)</b> 순서라는 점을 다시 확인하세요. 뒤쪽은 2×2 (0, 100 / 200, 255) 를 4배 확대한 <b>첫 줄</b>입니다. NEAREST 는 <code>0 0 0 0 100 100 100 100</code> 처럼 값이 계단으로 복사되고, LINEAR 는 0 → 100 사이를 직선으로(12 · 37 · 62 · 87), CUBIC 은 곡선으로 채웁니다(양 끝에서 살짝 눌려 95). <code>uchar</code> 값은 <code>(int)</code> 로 바꿔 출력해야 숫자로 보입니다.',
            expect: '원본: 640 x 480\nSize 지정: 320 x 240\n배율 1.5배: 960 x 720\nNEAREST: 0 0 0 0 100 100 100 100\nLINEAR : 0 0 12 37 62 87 100 100\nCUBIC  : 0 0 0 16 45 72 91 95' },
          { type: 'callout', kind: 'more', title: '📘 OpenCV 5 에서 달라진 보간 수치', html: 'OpenCV 5 는 <code>INTER_NEAREST</code> resize 와 <code>warpAffine</code> · <code>warpPerspective</code> 의 보간 계산 방식을 정리하면서 <b>4.x 와 결과 픽셀 값이 조금 다를 수 있습니다</b>(최근접 픽셀을 고르는 반올림 규칙, 고정 소수점 가중치 등). 그래서 이 차시의 출력 숫자는 OpenCV 4.x · Python 자료의 값과 한두 단계(또는 소수점 아래) 차이가 날 수 있습니다. 4.x 의 최근접 동작이 꼭 필요하면 <code>INTER_NEAREST_EXACT</code> 와 비교해 보세요. 검사 기준값은 <b>실제로 쓰는 OpenCV 버전으로 다시 측정</b>하는 것이 원칙입니다.' },
          { type: 'code', title: '예제 2: 확대는 CUBIC, 축소는 AREA — 숫자로 확인', code: EX_QUALITY,
            desc: '앞부분은 30×30 ROI 를 8배(240×240) 확대한 결과입니다. <b>라플라시안 표준편차</b>는 값이 갑자기 꺾이는 정도 — NEAREST 는 2.74 로 크고(계단), LINEAR · CUBIC 은 1.04 로 매끄럽습니다. CUBIC 은 에지에서 살짝 <b>넘어짐(overshoot)</b> 이 생겨 최소 밝기가 원본(76)보다 낮은 75 가 됩니다 — 그 대신 에지가 더 또렷합니다. 뒷부분은 1/4 축소인데, <b>AREA</b> 의 평균(127.72)이 원본 평균(127.71)에 가장 가깝고 표준편차가 가장 작습니다(가는 선이 잘 섞여 들어감). ROI <code>img(Rect(...))</code> 는 원본과 데이터를 공유하는 헤더라는 점(03차시)도 기억하세요. 결과 창에서 세 확대 이미지를 눌러 픽셀 격자를 비교해 보세요.',
            expect: 'NEAREST 240x240 계단 정도 2.74 밝기 76~149\nLINEAR  240x240 계단 정도 1.04 밝기 76~149\nCUBIC   240x240 계단 정도 1.04 밝기 75~149\n원본 ROI 밝기 76~149\n원본 평균 127.71\nNEAREST 1/4 축소: 평균 127.26 표준편차 63.24\nLINEAR  1/4 축소: 평균 127.83 표준편차 62.66\nAREA    1/4 축소: 평균 127.72 표준편차 61.90' },
          { type: 'callout', kind: 'tip', title: '축소는 AREA 로, 라벨은 NEAREST 로', html: '10배 축소를 <code>INTER_NEAREST</code> 로 하면 10픽셀 중 1개만 남아 <b>가는 결함이 사라집니다</b>. 검사 전 축소는 반드시 <code>INTER_AREA</code>(또는 <code>GaussianBlur</code> 후 NEAREST)로 하세요. 반대로 <b>라벨 이미지</b>(<code>connectedComponents</code> 의 번호가 들어 있는 Mat)는 평균을 내면 없는 번호가 생기므로 꼭 <code>INTER_NEAREST</code> 를 씁니다.' },
          { type: 'h', text: 'flip · rotate: 90° 단위는 계산 없이' },
          { type: 'p', html: '좌우/위아래 뒤집기와 90° 단위 회전은 픽셀을 <b>그대로 옮기기만</b> 하므로 보간이 필요 없고 매우 빠릅니다. 90°·270° 회전은 <b>너비와 높이가 바뀝니다</b>(640×480 → 480×640).' },
          { type: 'table', head: ['코드', '뜻'], rows: [
            ['<code>flip(src, dst, 0)</code>', '위아래 뒤집기 (x축 기준, 행 순서 역순)'],
            ['<code>flip(src, dst, 1)</code>', '좌우 뒤집기 (y축 기준, 거울 영상)'],
            ['<code>flip(src, dst, -1)</code>', '양쪽 모두 = 180° 회전'],
            ['<code>rotate(src, dst, ROTATE_90_CLOCKWISE)</code>', '시계 방향 90° (크기 바뀜)'],
            ['<code>ROTATE_180</code> / <code>ROTATE_90_COUNTERCLOCKWISE</code>', '180° / 반시계 90°']
          ] },
          { type: 'code', title: '예제 3: flip · rotate · 평행 이동 행렬 직접 만들기', code: EX_FLIP,
            desc: '앞부분은 뒤집기 · 회전입니다. (0,0) 의 값이 위아래 뒤집기에서는 (479, 0) 에, 좌우 뒤집기에서는 (0, 639) 에 그대로 옮겨진 것을 확인하세요. 뒷부분은 <b>평행 이동 어파인 행렬</b>을 쉼표 초기화 <code>(Mat_&lt;double&gt;(2, 3) &lt;&lt; 1, 0, tx, 0, 1, ty)</code> 로 직접 만들어 넘긴 것입니다. <code>cout &lt;&lt; M</code> 으로 행렬을 그대로 출력할 수 있습니다. 화면 밖에서 들어온 자리는 <code>BORDER_CONSTANT</code> + <code>Scalar(0)</code> 이라 검게(0) 남습니다.',
            expect: '원본 640x480 / 90도 회전 480x640\n(0,0)=46 / 위아래 (479,0)=46 / 좌우 (0,639)=46\nM =\n[1, 0, 80;\n 0, 1, -40]\n이동 결과 640x480, 빈 자리 값 0' },
          { type: 'h', text: '어파인 변환: 2×3 행렬 하나로' },
          { type: 'figure', html: FIG_AFFINE, caption: '그림 2. 어파인 변환 2×3 행렬 — 왼쪽 2×2 가 회전 · 크기 · 기울이기, 오른쪽 1열이 이동량' },
          { type: 'p', html: '이동 · 회전 · 크기 · 기울이기를 섞은 변환은 모두 <b>2×3 행렬 하나</b>로 표현됩니다. 직접 만들 수도 있고, 자주 쓰는 “중심 기준 회전 + 배율” 은 <code>getRotationMatrix2D(center, angle, scale)</code> 이 만들어 줍니다(반환값: 2×3 <code>CV_64F</code> Mat). 만든 행렬은 <code>warpAffine(src, dst, M, dsize, flags, borderMode, borderValue)</code> 로 적용합니다.' },
          { type: 'image', src: 'images/chip_rotated.png', caption: '트레이 위에 23.5° 기울어져 놓인 SOIC-16 칩 — 글자를 읽으려면 먼저 바로 세워야 한다', width: 420 },
          { type: 'code', title: '예제 4: 기울어진 칩 바로 세우기 (getRotationMatrix2D + warpAffine)', code: EX_ROTFIX,
            desc: '<code>images/chip_rotated.png</code> 의 칩은 화면 기준 <b>+23.5°</b>(반시계) 기울어져 있습니다. 측정값은 영상 좌표계(y 아래) 기준이라 <b>−23.50°</b> 로 나옵니다. 같은 중심에서 <b>−23.5°</b> 로 도는 행렬을 만들어 적용하면 기울기가 <b>0.00°</b> 가 됩니다. 행렬의 왼쪽 2×2 는 cos · sin(−23.5°) = 0.9171, 0.3987 이고 3열은 “중심을 제자리에 두기 위한” 이동량입니다. 각도 측정은 12차시에서 배울 <code>minAreaRect</code> 를 미리 썼습니다. <code>minAreaRect</code> 가 돌려주는 각도의 범위는 OpenCV 버전에 따라 다르므로(4.5 이전 [−90, 0), 이후 (0, 90]) <code>measureAngle</code> 에서 <b>−45° ~ 45° 로 정규화</b>했습니다.',
            expect: '원본 기울기 -23.50 도\nM = 2x3 CV_64FC1\n  [0.9171 -0.3987 125.18]\n  [0.3987 0.9171 -111.41]\n보정 후 기울기 0.00 도' },
          { type: 'callout', kind: 'warn', title: '자주 틀리는 세 가지', html: '<ul><li><b>각도 부호</b>: <code>getRotationMatrix2D</code> 의 각도는 <b>반시계(CCW) 가 +</b> 입니다. 화면에서 +23.5° 기울어진 것을 바로 세우려면 <b>−23.5°</b> 를 넣습니다.</li><li><b>중심</b>: 회전 중심을 (0, 0) 으로 두면 이미지가 화면 밖으로 날아갑니다. 보통 물체의 중심이나 이미지 중심을 씁니다.</li><li><b>행렬 형식</b>: 직접 만들 때 <code>Mat_&lt;double&gt;</code>(<code>CV_64F</code>) 또는 <code>CV_32F</code> 여야 합니다. 원소를 읽을 때도 <code>M.at&lt;double&gt;</code> — <code>at&lt;float&gt;</code> 로 읽으면 엉뚱한 값이 나옵니다.</li></ul>' },
          { type: 'h', text: '회전하면 모서리가 잘린다' },
          { type: 'figure', html: FIG_CROP, caption: '그림 3. 출력 크기를 원본으로 두면 모서리가 잘린다 — 새 크기를 계산하고 이동량을 더해야 전체가 담긴다' },
          { type: 'code', title: '예제 5: 잘림 없이 회전하기 (출력 크기 계산 + borderValue)', code: EX_CROP,
            desc: '<code>warpAffine</code> 은 <b>지정한 출력 크기 밖은 그냥 버립니다</b>. 회전 행렬의 (0,0) = cosθ, (0,1) = sinθ 를 이용해 <b>nw = h·|sin| + w·|cos|</b>, <b>nh = h·|cos| + w·|sin|</b> 로 새 크기를 구하고, 3열(이동량)에 <code>nw/2 − cx</code> · <code>nh/2 − cy</code> 를 더해 새 화면의 중앙으로 옮깁니다. <code>M.at&lt;double&gt;(0, 2) += …</code> 처럼 <code>at</code> 은 참조를 돌려주므로 행렬 원소를 바로 고칠 수 있습니다. 빈 자리는 <code>borderValue</code> 로 흰색(255)이 됩니다. 결과 창에서 “cut” 과 “full” 을 비교해 보세요.',
            expect: '원본 640x480 → 새 크기 791x791\n잘린 결과 640x480 / 전체 담은 결과 791x791\nfull 의 왼쪽 위 모서리 값 255 (borderValue 255)' },
          { type: 'callout', kind: 'vs', title: 'Visual Studio 에서는', html: '로컬 PC 의 <code>imshow</code> 창은 이미지 크기 그대로 열리므로 큰 이미지는 화면을 넘칠 수 있습니다. <b>표시용은 <code>INTER_AREA</code> 로 축소한 사본</b>을 쓰고, 검사 · 측정은 원본 Mat 으로 하세요(<code>namedWindow(name, WINDOW_NORMAL)</code> 로 창 크기를 바꿀 수도 있지만 그것은 화면만 바뀌는 것입니다). 16차시에서 만들 도구 클래스에서도 “표시용 사본 · 처리용 원본”을 나누는 것이 기본 설계입니다.' },
          { type: 'callout', kind: 'field', title: '🏭 현장 노트: 왜 굳이 이미지를 돌리나', html: '회전한 물체를 읽는 방법은 두 가지입니다. ① <b>이미지를 돌린다</b>(<code>warpAffine</code>) — 이후 처리(OCR · 템플릿 매칭 · ROI 검사)가 모두 간단해지지만 보간 때문에 픽셀 값이 살짝 변합니다. ② <b>좌표만 돌린다</b>(<code>transform</code>) — 원본 픽셀을 그대로 쓰므로 치수 측정에 유리합니다. <b>측정은 ②, 판독은 ①</b> 이 실무의 기본 선택입니다.' }
        ],
        practice: [
          {
            title: '썸네일 만들기 — 보간 방식 바꿔 보기', level: 1,
            desc: '<code>images/plate_holes.png</code>(800×600) 를 <b>가로 200 px</b> 짜리 썸네일로 줄이세요. 비율(3:4)을 유지하도록 배율을 계산하고, <code>INTER_AREA</code> 와 <code>INTER_NEAREST</code> 두 가지로 줄여 <b>평균 밝기</b>를 비교해 출력하세요.',
            hint: '배율 <code>double s = 200.0 / img.cols;</code> 를 구해 <code>resize(img, dst, Size(), s, s, flag)</code> 로 넘깁니다. 평균은 <code>mean(dst)[0]</code>. 두 방식을 배열 <code>int flags[] = { INTER_AREA, INTER_NEAREST };</code> 로 묶어 반복하면 간단합니다.',
            expect: '원본 800x600 평균 102.56\nAREA    200x150 평균 102.57\nNEAREST 200x150 평균 102.59',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/plate_holes.png", IMREAD_GRAYSCALE);
    cout << format("원본 %dx%d 평균 %.2f", img.cols, img.rows, mean(img)[0]) << endl;

    double s = 200.0 / img.cols;
    // TODO: INTER_AREA 와 INTER_NEAREST 로 각각 줄이고 크기 · 평균 밝기를 출력하세요

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
    Mat img = imread("images/plate_holes.png", IMREAD_GRAYSCALE);
    cout << format("원본 %dx%d 평균 %.2f", img.cols, img.rows, mean(img)[0]) << endl;

    double s = 200.0 / img.cols;
    int flags[] = { INTER_AREA, INTER_NEAREST };
    const char* names[] = { "AREA   ", "NEAREST" };
    for (int i = 0; i < 2; i++)
    {
        Mat thumb;
        resize(img, thumb, Size(), s, s, flags[i]);
        cout << format("%s %dx%d 평균 %.2f", names[i], thumb.cols, thumb.rows, mean(thumb)[0]) << endl;
        imshow(names[i], thumb);
    }
    waitKey(0);
    return 0;
}`
          },
          {
            title: '기울어진 판을 스스로 바로 세우기', level: 2,
            desc: '<code>images/bracket_edges.png</code> 는 <b>3.5°</b> 기울어진 판(백라이트 실루엣 → 판이 <b>어둡다</b>)입니다. 각도를 <b>코드로 측정</b>해서(<code>minAreaRect</code>) 그만큼 되돌리는 행렬을 만들고, 보정 후 각도가 0 에 가까워지는지 확인하세요. 회전 중심은 <code>minAreaRect</code> 의 <code>center</code> 를 쓰세요.',
            hint: '① 이진화(판이 어두우므로 <code>THRESH_BINARY_INV | THRESH_OTSU</code>) ② 가장 큰 외곽 윤곽선 ③ <code>RotatedRect rr = minAreaRect(cs[big]);</code> ④ 각도 정규화: <code>double a = rr.angle; if (a &gt; 45) a -= 90; if (a &lt; -45) a += 90;</code> ⑤ <code>getRotationMatrix2D(rr.center, a, 1.0)</code> — 측정 각도(영상 좌표계 기준)를 그대로 넣으면 되돌려집니다. 부호가 반대로 되면 더 기울어지니 결과 각도로 확인하세요.',
            expect: '측정 각도 -3.50 중심 (318.6, 241.3)\n보정 후 각도 0.00',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

RotatedRect measure(const Mat& gray)
{
    Mat bin;
    threshold(gray, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    vector<vector<Point>> cs;
    findContours(bin, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    size_t big = 0;
    for (size_t i = 1; i < cs.size(); i++)
        if (contourArea(cs[i]) > contourArea(cs[big])) big = i;
    return minAreaRect(cs[big]);
}

int main()
{
    Mat img = imread("images/bracket_edges.png", IMREAD_GRAYSCALE);
    RotatedRect rr = measure(img);
    cout << format("minAreaRect 각도 %.2f 중심 (%.1f, %.1f)", rr.angle, rr.center.x, rr.center.y) << endl;

    // TODO: 각도를 -45~45 로 정규화하고 getRotationMatrix2D + warpAffine 으로 보정하세요
    // TODO: 보정 후 measure() 로 각도를 다시 재어 출력하세요

    imshow("input", img);
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

RotatedRect measure(const Mat& gray)
{
    Mat bin;
    threshold(gray, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    vector<vector<Point>> cs;
    findContours(bin, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    size_t big = 0;
    for (size_t i = 1; i < cs.size(); i++)
        if (contourArea(cs[i]) > contourArea(cs[big])) big = i;
    return minAreaRect(cs[big]);
}

double normAngle(double a)
{
    if (a > 45) a -= 90;
    if (a < -45) a += 90;
    return a;
}

int main()
{
    Mat img = imread("images/bracket_edges.png", IMREAD_GRAYSCALE);
    RotatedRect rr = measure(img);
    double a = normAngle(rr.angle);
    cout << format("측정 각도 %.2f 중심 (%.1f, %.1f)", a, rr.center.x, rr.center.y) << endl;

    Mat M = getRotationMatrix2D(rr.center, a, 1.0);
    Mat dst;
    warpAffine(img, dst, M, img.size(), INTER_LINEAR, BORDER_CONSTANT, Scalar(255));
    RotatedRect r2 = measure(dst);
    cout << format("보정 후 각도 %.2f", normAngle(r2.angle)) << endl;

    imshow("input", img);
    imshow("fixed", dst);
    waitKey(0);
    return 0;
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: '기하 변환 ①', subtitle: '크기 · 뒤집기 · 회전과 어파인 변환', notes: '<p>💬 “트레이에 부품이 비뚤게 놓여 있으면 어떻게 읽을까요?” — 예상 답: 돌려서 읽는다. 이번 시간에는 픽셀의 <b>값</b>이 아니라 <b>위치</b>를 바꾸는 방법을 배운다고 안내합니다. (2분)</p>' },
          { layout: 'bullets', title: '왜 위치를 바꾸나', lead: '기하 변환이 필요한 네 장면', bullets: [
            '<b>속도</b>: 640×480 → 320×240 이면 픽셀 1/4 (<code>resize</code>)',
            '<b>정렬</b>: 비뚤어진 칩을 바로 세워 글자 읽기 (<code>warpAffine</code>)',
            '<b>정면화</b>: 비스듬히 본 라벨/문서 펴기 (<code>warpPerspective</code>, 2교시)',
            '<b>좌표 변환</b>: 영상 px → 로봇 mm (2교시)',
            ['공통 문제 2개', ['소수 좌표의 값을 어떻게 추측? → <b>보간</b>', '빈 자리는 무엇으로? → <b>borderMode · borderValue</b>']]
          ], notes: '<p>실무에서 가장 흔한 것은 ①속도용 축소와 ④좌표 변환입니다. 오늘은 ①②를, 정면화와 좌표 변환은 2교시에 다룬다고 예고합니다. (4분)</p>' },
          { layout: 'diagram', title: '보간: 픽셀 사이를 채우는 방법', html: FIG_INTERP, caption: 'NEAREST 는 계단, LINEAR 는 직선, CUBIC 은 곡선', notes: '<p>그래프의 ●이 원본 픽셀임을 강조합니다. 💬 “확대하면 픽셀이 늘어나는데, 없는 값은 어디서 오나요?” — 이웃에서 추측(보간). NEAREST 는 “그대로 복사”라서 계단이 보인다는 점을 손으로 짚어 줍니다. (5분)</p>' },
          { layout: 'table', title: '보간 방식 고르기', head: ['방식', '뜻', '쓰는 곳'], rows: [
            ['<code>INTER_NEAREST</code>', '가장 가까운 값 복사', '라벨/마스크, 픽셀 관찰'],
            ['<code>INTER_LINEAR</code>', '2×2 가중 평균', '<b>기본값</b>'],
            ['<code>INTER_CUBIC</code>', '4×4 곡선 맞춤', '<b>확대</b> 품질'],
            ['<code>INTER_AREA</code>', '영역 평균', '<b>축소</b>'],
            ['<code>INTER_LANCZOS4</code>', '8×8 Lanczos', '고품질 확대']
          ], lead: '외우기: 축소는 AREA, 확대는 CUBIC, 라벨은 NEAREST', notes: '<p>한 줄로 외우게 합니다: <b>축소 AREA · 확대 CUBIC · 라벨 NEAREST</b>. 💬 “라벨 이미지를 LINEAR 로 줄이면?” — 1번과 3번 사이에 없는 2번 라벨이 생긴다. OpenCV 5 에서는 NEAREST · warp 의 수치가 4.x 와 조금 다를 수 있다는 점(📘 상자)도 한 줄로 언급합니다. (3분)</p>' },
          { layout: 'code', title: 'resize 두 가지 사용법', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_gray.png", IMREAD_GRAYSCALE);
    Mat a, b;
    resize(img, a, Size(320, 240));            // 크기 지정 (너비, 높이)
    resize(img, b, Size(), 1.5, 1.5);          // 배율 지정 (fx, fy)
    cout << img.size() << " → " << a.size() << " / " << b.size() << endl;
    imshow("half", a);
    waitKey(0);
    return 0;
}`, points: ['<code>Size(w, h)</code> = 크기 직접 지정 — (너비, 높이)!', '<code>Size()</code> + <code>fx, fy</code> = 배율', '둘 다 0 이면 예외', '여섯 번째 인수가 <code>interpolation</code>'], notes: '<p>실행해 보고 배율을 0.5 · 3 으로 바꿔 보게 합니다. <code>cout &lt;&lt; img.size()</code> 는 <code>[640 x 480]</code> 처럼 (너비 x 높이)로 나온다는 것도 확인합니다. (5분)</p>' },
          { layout: 'code', title: '보간이 만드는 값 — 2×2 를 4배로', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat tiny = (Mat_<uchar>(2, 2) << 0, 100, 200, 255);
    int flags[] = { INTER_NEAREST, INTER_LINEAR, INTER_CUBIC };
    const char* names[] = { "NEAREST", "LINEAR ", "CUBIC  " };
    for (int i = 0; i < 3; i++)
    {
        Mat up;
        resize(tiny, up, Size(8, 8), 0, 0, flags[i]);
        cout << names[i] << ":";
        for (int x = 0; x < 8; x++) cout << " " << (int)up.at<uchar>(0, x);
        cout << endl;
    }
    return 0;
}`, points: ['NEAREST: 계단 (값을 그대로 복사)', 'LINEAR: 직선 (0 → 100 을 일정하게)', 'CUBIC: 곡선 (끝이 살짝 눌림)'], notes: '<p>세 줄의 숫자를 같이 읽습니다. LINEAR 의 값이 일정한 간격으로 커지는 직선이라는 것을 짚어 주면 “선형”이라는 이름이 이해됩니다. <code>(int)</code> 를 빼면 글자가 찍히는 것도 다시 보여 주세요. (5분)</p>' },
          { layout: 'two', title: '축소와 확대는 다른 문제', left: { title: '축소 (여러 픽셀 → 1개)', bullets: ['NEAREST: 1개만 남기고 <b>버림</b> → 가는 결함 소실', 'AREA: 평균 → 밝기 보존, 에일리어싱 억제', '측정 전 축소는 <b>AREA</b>', '예제 2: AREA 평균이 원본에 가장 가깝다'] }, right: { title: '확대 (1픽셀 → 여러 개)', bullets: ['NEAREST: 블록(계단) — 라플라시안 σ 가 크다', 'LINEAR/CUBIC: 매끄러움', 'CUBIC 은 에지에서 살짝 넘어짐(overshoot)', '확대는 <b>CUBIC</b>, 급하면 LINEAR'] }, notes: '<p>축소/확대는 반대 문제라는 점을 강조합니다. 예제 2 를 실행해 숫자를 함께 읽습니다. 💬 “10배 축소를 NEAREST 로 하면 폭 1 px 긁힘은?” — 90% 확률로 사라진다. 이것이 현장에서 검사 실패의 흔한 원인입니다. (5분)</p>' },
          { layout: 'diagram', title: '어파인 변환 = 2×3 행렬', html: FIG_AFFINE, caption: '왼쪽 2×2 가 회전 · 크기 · 기울이기, 3열이 이동량', notes: '<p>x\' = a·x + b·y + t<sub>x</sub> 를 칠판에 한 번 써 봅니다. 이동/회전/크기 행렬 세 개를 보여 주고, 💬 “회전 행렬에서 θ = 0 이면?” — 단위행렬(변화 없음). C++ 에서는 <code>(Mat_&lt;double&gt;(2,3) &lt;&lt; …)</code> 로 바로 만들 수 있다는 점을 연결합니다. (5분)</p>' },
          { layout: 'image', title: '문제: 23.5° 기울어진 칩', src: 'images/chip_rotated.png', caption: '글자(MV2026)를 읽으려면 먼저 바로 세워야 한다', notes: '<p>이미지를 크게 띄웁니다. 💬 “이 칩의 글자를 OCR 로 읽으려면 무엇이 먼저 필요할까요?” — 회전 보정. 각도는 어떻게 알까요? — 12차시에서 배울 minAreaRect(미리보기). (3분)</p>' },
          { layout: 'code', title: '회전 보정: getRotationMatrix2D + warpAffine', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/chip_rotated.png", IMREAD_GRAYSCALE);
    Point2f center(330.4f, 245.2f);
    Mat M = getRotationMatrix2D(center, -23.5, 1.0);   // 반시계 +
    cout << typeToString(M.type()) << endl << M << endl;
    cout << format("cos = %.4f", M.at<double>(0, 0)) << endl;

    Mat dst;
    warpAffine(img, dst, M, img.size(), INTER_LINEAR, BORDER_CONSTANT, Scalar(200));
    imshow("input", img);
    imshow("fixed", dst);
    waitKey(0);
    return 0;
}`, points: ['각도는 <b>반시계(+)</b> → +23.5° 기울기는 <b>−23.5°</b> 로 보정', '행렬만 만들고 <code>warpAffine</code> 으로 적용', '행렬은 <code>CV_64F</code> → <code>at&lt;double&gt;</code>', 'borderValue 200 = 트레이와 비슷한 밝은 값'], notes: '<p>실행해 두 창을 비교합니다. 각도를 +23.5 로 바꿔 더 기울어지는 것을 보여 주면 부호가 확실히 기억됩니다. <code>cout &lt;&lt; M</code> 이 2행 3열로 찍히는 것도 확인합니다. borderValue 를 0 으로 바꿔 보게도 합니다. (7분)</p>' },
          { layout: 'diagram', title: '회전하면 모서리가 잘린다', html: FIG_CROP, caption: 'nw = h·|sinθ| + w·|cosθ|, nh = h·|cosθ| + w·|sinθ|', notes: '<p>💬 “45° 돌렸는데 모서리가 사라졌습니다. 왜?” — 출력 크기가 원본과 같아서 밖으로 나간 부분이 버려짐. 새 크기 공식을 칠판에 쓰고, 행렬 3열에 중앙 이동을 더한다는 점(<code>M.at&lt;double&gt;(0, 2) += …</code>)을 강조합니다. 640×480 → 791×791. (5분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>getRotationMatrix2D(center, 30, 1.0)</code> 이 돌려주는 것은?', options: ['회전된 이미지', '3×3 원근 행렬', '2×3 어파인 행렬 (CV_64F Mat)', '회전 각도(double)'], answer: 2, explain: '행렬만 돌려줍니다. 이미지를 돌리려면 warpAffine 에 넘기세요. 각도는 반시계가 + 입니다.', notes: '<p>정답 3번. “행렬을 만드는 함수”와 “적용하는 함수”가 따로라는 점을 다시 강조합니다. (2분)</p>' },
          { layout: 'practice', title: '실습: 스스로 각도를 재서 보정', desc: '<p><code>images/bracket_edges.png</code>(3.5° 기울어진 판)의 각도를 <b>코드로 측정</b>해 보정하세요.</p><ul><li><code>minAreaRect</code> 로 각도 · 중심 얻기</li><li>각도 정규화: −45° ~ 45° 로</li><li>보정 후 각도를 다시 재어 0 에 가까운지 확인</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/bracket_edges.png", IMREAD_GRAYSCALE);
    Mat bin;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    vector<vector<Point>> cs;
    findContours(bin, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    size_t big = 0;
    for (size_t i = 1; i < cs.size(); i++)
        if (contourArea(cs[i]) > contourArea(cs[big])) big = i;
    RotatedRect rr = minAreaRect(cs[big]);
    cout << format("minAreaRect 각도 %.2f", rr.angle) << endl;
    // TODO: 정규화 → getRotationMatrix2D → warpAffine
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/bracket_edges.png", IMREAD_GRAYSCALE);
    Mat bin, dst;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    vector<vector<Point>> cs;
    findContours(bin, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    size_t big = 0;
    for (size_t i = 1; i < cs.size(); i++)
        if (contourArea(cs[i]) > contourArea(cs[big])) big = i;
    RotatedRect rr = minAreaRect(cs[big]);
    double a = rr.angle;
    if (a > 45) a -= 90;
    if (a < -45) a += 90;
    cout << format("측정 각도 %.2f", a) << endl;
    warpAffine(img, dst, getRotationMatrix2D(rr.center, a, 1.0), img.size(), INTER_LINEAR, BORDER_CONSTANT, Scalar(255));
    imshow("fixed", dst);
    waitKey(0);
    return 0;
}`, notes: '<p>측정 각도를 정규화한 값을 그대로 <code>getRotationMatrix2D</code> 에 넣으면 보정 후 0 에 가까워집니다. 학생들이 부호를 반대로 넣어 7° 기울어지는 실수를 자주 합니다 — 그 결과를 보여 주며 “측정 각도(영상 좌표계)를 그대로 넣으면 되돌려진다”를 정리합니다. 빈 자리를 255(배경색)로 채우는 이유(보정 후 재측정 때 가짜 물체가 생기지 않게)도 짚습니다. (8분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['<code>resize</code>: <code>Size(w, h)</code> 지정 또는 <code>Size()</code> + <code>fx, fy</code> 배율 — <b>축소 AREA · 확대 CUBIC · 라벨 NEAREST</b>', '<code>flip</code>(0/1/−1) · <code>rotate</code>(90° 단위)는 보간 없이 빠르다 (90°는 W↔H 바뀜)', '어파인 = <b>2×3 CV_64F</b> 행렬, 3열이 이동량 — <code>warpAffine</code> 으로 적용, <code>at&lt;double&gt;</code> 로 읽기', '<code>getRotationMatrix2D(center, angle, scale)</code>: 각도는 <b>반시계 +</b>', '잘림 방지: 새 크기 계산 + 3열에 중앙 이동 더하기, 빈 자리는 <code>borderValue</code>', '다음: 대응점으로 변환 행렬 만들기 — 어파인 3점, 원근 4점'], notes: '<p>세 가지를 반복해 읽힙니다: 보간 선택 규칙, 각도 부호, 출력 크기. 2교시에는 “행렬을 계산하지 않고 <b>점을 짝지어</b> 만드는” 방법을 배운다고 예고합니다. (2분)</p>' }
        ]
      },
      // ============================================================ 2교시
      {
        id: 'cv11-2', title: '대응점으로 만드는 변환: 어파인 3점 · 원근 4점', minutes: 50,
        goals: ['getAffineTransform(3점) 과 getPerspectiveTransform(4점) 의 차이를 안다', 'warpPerspective 로 기울어 찍힌 평면을 정면화할 수 있다', 'perspectiveTransform 과 invert 로 px ↔ mm 좌표 변환을 할 수 있다'],
        flow: [['도입: 비스듬히 찍힌 평면', 5], ['어파인 3점 · 원근 4점', 15], ['정면화 · px→mm 변환', 20], ['정리 · 퀴즈', 10]],
        content: [
          { type: 'h', text: '행렬을 계산하지 말고, 점을 짝지어라' },
          { type: 'p', html: '1교시에서는 행렬을 직접 만들거나 <code>getRotationMatrix2D</code> 로 얻었습니다. 그런데 현장에서는 보통 <b>“이 점이 저기로 가야 한다”</b> 는 정보밖에 없습니다. 기판의 피듀셜 마크 위치, 교정판 네 귀퉁이, 컨베이어의 기준 마크 4개처럼요. OpenCV 는 이런 <b>대응점(corresponding points)</b> 만 주면 변환 행렬을 풀어 줍니다.' },
          { type: 'figure', html: FIG_PERSP, caption: '그림 4. 어파인은 3쌍(2×3), 원근은 4쌍(3×3) — 원근은 마지막에 w 로 나누기 때문에 원근감이 생긴다' },
          { type: 'table', head: ['', '어파인 (Affine)', '원근 (Perspective · Homography)'], rows: [
            ['행렬 크기', '2×3 <code>CV_64F</code>', '3×3 <code>CV_64F</code> (마지막 성분 = 1)'],
            ['미지수', '6개', '8개'],
            ['필요한 대응점', '<b>3쌍</b>', '<b>4쌍</b>'],
            ['만들기', '<code>getAffineTransform(src, dst)</code>', '<code>getPerspectiveTransform(src, dst)</code>'],
            ['이미지 적용', '<code>warpAffine</code>', '<code>warpPerspective</code>'],
            ['점만 변환', '<code>transform</code>', '<code>perspectiveTransform</code>'],
            ['성질', '평행선 유지, 원근 없음', '사각형 → 임의의 사각형 (기울어진 평면)'],
            ['점이 많을 때', '<code>estimateAffine2D</code>', '<code>findHomography</code> (RANSAC)']
          ], caption: '표 2. 어파인 vs 원근 — 대응점 개수와 함수 이름이 다르다. 점은 Point2f src[3] 같은 C 배열이나 vector&lt;Point2f&gt; 로 넘긴다' },
          { type: 'code', title: '예제 1: getAffineTransform — 세 점을 짝지어 행렬 만들기', code: EX_AFFINE3,
            desc: '원본의 세 점 (0,0) · (639,0) · (0,479) 가 각각 (60,40) · (600,90) · (10,450) 으로 가도록 하는 2×3 행렬을 구합니다. 점은 <code>Point2f src[3]</code> 처럼 <b>C 배열</b>로 넘길 수 있습니다(<code>vector&lt;Point2f&gt;</code> 도 됨). 마지막 줄처럼 <code>transform(점들, 결과, A)</code> 로 점을 변환해 보면 정확히 짝지은 점이 나옵니다(검산). 세 점만 정하면 <b>나머지 모든 픽셀의 위치가 자동으로 정해진다</b>는 점이 핵심입니다.',
            expect: 'A = 2x3 CV_64FC1\n  [0.8451 -0.1044 60.00]\n  [0.0782 0.8559 40.00]\n(639, 0) → (600.0, 90.0)' },
          { type: 'callout', kind: 'warn', title: '세 점이 한 직선 위에 있으면 안 된다', html: '어파인 3점이 <b>일직선</b>이거나 거의 겹치면 행렬을 풀 수 없습니다(또는 엉뚱한 값). 원근 4점도 <b>세 점이 일직선</b>이면 안 됩니다. 실무에서는 작업 영역의 <b>네 귀퉁이처럼 넓게 퍼진 점</b>을 씁니다 — 검출 오차가 1 px 있어도 결과가 크게 흔들리지 않습니다.' },
          { type: 'h', text: '원근 변환: 비스듬히 본 평면을 정면으로' },
          { type: 'p', html: '카메라가 평면을 정면에서 보지 않으면 직사각형이 <b>사다리꼴</b>로 찍힙니다. 이때 “원래 직사각형의 네 꼭짓점이 영상에서 어디에 찍혔는지” 를 알면, 네 점을 반듯한 직사각형으로 보내는 3×3 행렬(<b>호모그래피</b>)로 평면 전체를 정면화할 수 있습니다. 스마트폰의 문서 스캐너가 바로 이 원리입니다.' },
          { type: 'image', src: 'images/calib_grid_top.png', caption: '점 격자 교정판 — 카메라가 살짝 기울어 약한 원근이 있다 (11×8 = 88개 점, 간격 5 mm)', width: 420 },
          { type: 'code', title: '예제 2: 교정판 정면화 (getPerspectiveTransform + warpPerspective)', code: EX_FRONT,
            desc: '격자 네 귀퉁이 점의 영상 좌표를 <b>1 mm = 10 px</b> 인 정면 좌표로 보냅니다. 점 간격 5 mm 는 정확히 50 px 이 되어야 합니다. 변환 뒤 점 88개를 검출해 보니 x 가 49.9 ~ 550.1, y 가 49.9 ~ 400.1 범위에 놓입니다 — 10칸 × 50 px = 500, 7칸 × 50 px = 350 과 맞습니다. 즉 이 이미지에서는 <b>모든 거리를 0.1 mm/px 로 바로 읽을 수 있게</b> 바뀐 것입니다. 점 검출(윤곽선 · 모멘트)은 12차시에서 자세히 배웁니다.',
            expect: '정면화 결과 600x450\n점 88개\nx 범위 49.9 ~ 550.1\ny 범위 49.9 ~ 400.1' },
          { type: 'callout', kind: 'tip', title: 'warp vs transform — 헷갈리면 안 되는 짝', html: '<b>이미지 전체</b>를 펴는 것은 <code>warpPerspective(src, dst, H, size)</code>, <b>점 좌표 몇 개</b>만 바꾸는 것은 <code>perspectiveTransform(vector&lt;Point2f&gt; 입력, 출력, H)</code> 입니다. 부품 중심 5개를 로봇 좌표로 바꾸는 데 이미지 전체를 펴는 것은 수천 배 낭비입니다 — <b>점만 변환</b>하세요.' },
          { type: 'h', text: '영상 좌표(px) → 로봇 좌표(mm)' },
          { type: 'figure', html: FIG_PXMM, caption: '그림 5. 로봇 좌표를 아는 기준 마크 4개로 px → mm 변환 행렬을 만든다 (2D 핸드-아이 교정)' },
          { type: 'p', html: '로봇이 부품을 집으려면 <b>영상에서 찾은 위치(px)를 로봇이 쓰는 좌표(mm)</b> 로 바꿔 줘야 합니다. 부품이 모두 같은 평면(컨베이어) 위에 있다면 3×3 호모그래피 하나로 충분합니다. <code>images/robot_pick.png</code> 에는 <b>로봇 좌표를 아는 기준 마크 4개</b>가 있습니다.' },
          { type: 'table', head: ['마크', '영상 좌표 (px)', '로봇 좌표 (mm)'], rows: [
            ['M1', '(61.56, 57.38)', '(270, 90)'],
            ['M2', '(583.83, 65.15)', '(530, 90)'],
            ['M3', '(574.58, 426.42)', '(530, −90)'],
            ['M4', '(67.27, 419.64)', '(270, −90)']
          ], caption: '표 3. robot_pick.png 의 기준 마크 — 마크를 미리 로봇으로 찍어(티칭) 좌표를 기록해 둔다' },
          { type: 'code', title: '예제 3: px → mm 변환 행렬 만들고 점 좌표 바꾸기', code: EX_PXMM,
            desc: '기준 마크 4쌍(<code>vector&lt;Point2f&gt;</code>)으로 <code>H</code> 를 만들면, 마크 자신은 당연히 정확히 (270, 90) · (530, 90) 으로 돌아옵니다(검산). 영상 중앙 (320, 240) 은 로봇 좌표 (398.94, 2.36) mm 입니다. H 의 (2,0) · (2,1) 성분이 −0.000003 · −0.000079 처럼 <b>아주 작지만 0 이 아닌</b> 값인 것이 원근이 조금 들어 있다는 뜻입니다. y 대각 성분 (1,1) 이 음수(−0.487560)인 것은 <b>영상의 y 는 아래로, 로봇의 Y 는 위로</b> 커지기 때문입니다.',
            expect: 'H = 3x3 CV_64FC1\n  [  0.493715  -0.029059   240.0046]\n  [  0.006879  -0.487560   117.1295]\n  [ -0.000003  -0.000079     1.0000]\n  px (61.6, 57.4) → mm (270.00, 90.00)\n  px (583.8, 65.2) → mm (530.00, 90.00)\n  px (320.0, 240.0) → mm (398.94, 2.36)' },
          { type: 'code', title: '예제 4: 역변환 — 로봇 좌표를 영상에 표시하기', code: EX_INVERT,
            desc: '<code>invert(H, Hinv)</code>(또는 <code>H.inv()</code>)로 역행렬을 구하면 <b>mm → px</b> 변환이 됩니다. 로봇의 목표 위치를 영상에 십자(<code>drawMarker</code>)로 표시해 오퍼레이터에게 보여 주거나, 검사 ROI 를 mm 단위로 정의할 때 씁니다. 소수 좌표를 픽셀 좌표로 바꿀 때는 <code>cvRound</code> 로 반올림합니다. 마지막 줄은 px → mm → px 왕복이 제자리로 돌아오는지 확인한 것입니다(수치 오차가 거의 없음).',
            expect: '  mm (400, 0) → px (322.07, 244.78)\n  mm (320, 30) → px (163.13, 181.92)\n  mm (470, 40) → px (461.86, 165.90)\n왕복 확인: (320, 240) → (320.00, 240.00)' },
          { type: 'code', title: '예제 5: 카드 · 문서 스캐너를 함수로 정리', code: EX_SCANNER,
            desc: '네 꼭짓점을 <b>좌상 → 우상 → 우하 → 좌하</b> 순서로 넘기면 원하는 크기의 직사각형으로 펴 주는 함수입니다. 입력은 <code>const vector&lt;Point2f&gt;&amp;</code>(복사 없음 · 수정 방지), 결과 <code>Mat</code> 은 값으로 돌려줘도 헤더만 복사되므로 빠릅니다. 실제 앱에서는 ① Canny + <code>findContours</code> 로 종이의 사각형 윤곽을 찾고 ② <code>approxPolyDP</code> 로 꼭짓점 4개를 얻어(12차시) ③ 이 함수에 넘깁니다. 출력 크기를 원본 종이의 가로:세로 비율(예: A4 = 210:297)로 주면 비율까지 바로잡힙니다.',
            expect: '스캔 결과 500x350' },
          { type: 'callout', kind: 'warn', title: '점 순서가 어긋나면 결과가 뒤집힌다', html: 'src 와 dst 의 점은 <b>같은 순서</b>로 짝지어야 합니다. 좌상 → 우상 → 우하 → 좌하 를 섞으면 결과가 좌우 반전되거나 X 자로 접힌 그림이 나옵니다. 검출된 꼭짓점 4개는 보통 <b>중심을 기준으로 각도 정렬</b>하거나 “x+y 가 최소 = 좌상, 최대 = 우하” 규칙으로 정렬합니다(<code>std::sort</code> + 람다).' },
          { type: 'callout', kind: 'field', title: '🏭 현장 노트: 2D 핸드-아이 교정', html: '평면 위 픽킹은 이 4점 호모그래피로 충분합니다(오차 &lt; 0.5 mm). 다만 ① <b>부품 높이가 다르면</b> 시차(parallax) 때문에 틀립니다 — 높이별로 H 를 따로 만들거나 텔레센트릭 렌즈를 씁니다. ② 렌즈 왜곡이 크면 먼저 <code>undistort</code> 로 펴고 H 를 만듭니다(체스보드 캘리브레이션). ③ 마크는 <b>넓게, 4개 이상</b>을 쓰고 점이 많을 때는 <code>findHomography(src, dst, RANSAC)</code> 로 이상점을 걸러냅니다.' },
          { type: 'callout', kind: 'vs', title: 'Visual Studio 에서는 — 마우스로 네 점 찍기', html: '로컬 PC 에서는 <code>setMouseCallback</code> 으로 창의 클릭 좌표를 받아 네 점이 모이면 <code>warpPerspective</code> 로 펴서 새 창에 보여 줄 수 있습니다. <code>imshow</code> 창의 좌표는 <b>원본 픽셀 좌표 그대로</b>라 배율 환산이 필요 없습니다(단, <code>WINDOW_NORMAL</code> 로 창 크기를 바꿔도 콜백 좌표는 원본 기준으로 들어옵니다). 브라우저에서는 마우스 콜백이 동작하지 않으므로 예제 5 처럼 좌표를 코드에 적어 같은 계산을 합니다.' },
          { type: 'code', title: '추가: 마우스로 네 점 찍어 정면화 (로컬 전용)', code: EX_MOUSE, run: false, local: true, file: 'main.cpp',
            desc: '계산 부분은 예제 5 와 완전히 같습니다 — 달라지는 것은 <b>네 점을 어디서 얻는지</b>(마우스 클릭)와 <b>결과를 어떻게 보여 주는지</b>뿐입니다. 콜백이 원본 · 표시 이미지 · 점 목록에 접근해야 하므로 전역 변수로 두었습니다(16차시에서 클래스로 정리). <code>while (waitKey(30) != 27)</code> 은 ESC 를 누를 때까지 창 이벤트를 처리하는 로컬 전용 반복입니다.' },
          { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 · 오개념 지도', html: '<ul><li><b>오개념 1</b>: “<code>warpPerspective</code> 로 점도 바꿀 수 있다” → 이미지 전용입니다. 점은 <code>perspectiveTransform</code>. 실습에서 가장 많이 나오는 오류입니다.</li><li><b>오개념 2</b>: “대응점을 많이 주면 <code>getPerspectiveTransform</code> 이 더 정확해진다” → 정확히 4쌍만 받습니다. 많으면 <code>findHomography</code>.</li><li><b>오개념 3</b>: “회전 각도는 시계 방향이 +” → OpenCV 의 <code>getRotationMatrix2D</code> 는 반시계가 +.</li><li><b>C++ 주의</b>: <code>perspectiveTransform</code> 의 입력은 <code>vector&lt;Point2f&gt;</code>(float)입니다. <code>vector&lt;Point&gt;</code>(int)를 넘기면 예외가 납니다.</li><li>평가 루브릭: ① resize 보간 선택 근거 설명(3점) ② 어파인/원근의 대응점 개수와 함수 짝 맞추기(3점) ③ px→mm 변환 코드 완성 및 검산(4점).</li><li>💬 마무리 발문: “카메라를 옮겨 다시 설치하면 무엇을 다시 해야 할까?” — 기준 마크 4점을 다시 찍어 H 를 다시 만든다(재교정).</li></ul>' }
        ],
        practice: [
          {
            title: '부품 중심을 로봇 좌표로 바꾸기', level: 2,
            desc: '<code>images/robot_pick.png</code> 에서 부품 5개의 중심을 찾아 <b>로봇 좌표(mm)</b> 로 출력하세요. Otsu 이진화 후 <code>connectedComponentsWithStats</code> 로 블롭을 얻고, <b>면적 1500 ~ 5000</b> 인 것만 부품으로 봅니다(컨베이어 양쪽의 큰 띠는 면적이 3만 이상). 정답은 IMAGES.md 의 P1~P5: (320, 30) (400, −35) (470, 40) (300, −40) (400, 45) mm 입니다.',
            hint: '<code>stats.at&lt;int&gt;(i, CC_STAT_AREA)</code> 로 면적, <code>centroids.at&lt;double&gt;(i, 0)</code> · <code>(i, 1)</code> 로 중심(x, y)을 읽습니다(0번 라벨은 배경). 중심을 <code>vector&lt;Point2f&gt;</code> 에 모아 x 로 정렬(<code>sort</code> + 람다)한 뒤 <code>perspectiveTransform(src, dst, H)</code> 를 <b>한 번만</b> 호출하세요.',
            expect: '부품 5개\n  px (124.8, 321.7) → 로봇 (300.0, -39.9) mm\n  px (163.1, 181.9) → 로봇 (320.0, 30.0) mm\n  px (321.8, 314.6) → 로봇 (400.0, -34.9) mm\n  px (322.5, 153.6) → 로봇 (400.0, 45.0) mm\n  px (461.8, 165.8) → 로봇 (470.0, 40.0) mm',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/robot_pick.png", IMREAD_GRAYSCALE);
    Mat bin, labels, stats, centroids;
    threshold(img, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    int n = connectedComponentsWithStats(bin, labels, stats, centroids);

    vector<Point2f> parts;
    for (int i = 1; i < n; i++)                       // 0 = 배경
    {
        int area = stats.at<int>(i, CC_STAT_AREA);
        if (area < 1500 || area > 5000) continue;
        parts.push_back(Point2f((float)centroids.at<double>(i, 0), (float)centroids.at<double>(i, 1)));
    }
    sort(parts.begin(), parts.end(), [](const Point2f& a, const Point2f& b) { return a.x < b.x; });
    cout << "부품 " << parts.size() << "개" << endl;
    for (const auto& p : parts) cout << format("  px (%.1f, %.1f)", p.x, p.y) << endl;

    // TODO: 기준 마크 4쌍으로 H(px→mm) 를 만드세요
    // TODO: perspectiveTransform 으로 parts 를 mm 로 바꿔 출력하세요

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
    Mat img = imread("images/robot_pick.png", IMREAD_GRAYSCALE);
    Mat bin, labels, stats, centroids;
    threshold(img, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    int n = connectedComponentsWithStats(bin, labels, stats, centroids);

    vector<Point2f> parts;
    for (int i = 1; i < n; i++)
    {
        int area = stats.at<int>(i, CC_STAT_AREA);
        if (area < 1500 || area > 5000) continue;
        parts.push_back(Point2f((float)centroids.at<double>(i, 0), (float)centroids.at<double>(i, 1)));
    }
    sort(parts.begin(), parts.end(), [](const Point2f& a, const Point2f& b) { return a.x < b.x; });
    cout << "부품 " << parts.size() << "개" << endl;

    vector<Point2f> mk = { Point2f(61.56f, 57.38f), Point2f(583.83f, 65.15f),
                           Point2f(574.58f, 426.42f), Point2f(67.27f, 419.64f) };
    vector<Point2f> mm = { Point2f(270, 90), Point2f(530, 90), Point2f(530, -90), Point2f(270, -90) };
    Mat H = getPerspectiveTransform(mk, mm);

    vector<Point2f> robot;
    perspectiveTransform(parts, robot, H);
    for (size_t k = 0; k < parts.size(); k++)
        cout << format("  px (%.1f, %.1f) → 로봇 (%.1f, %.1f) mm", parts[k].x, parts[k].y, robot[k].x, robot[k].y) << endl;

    imshow("bin", bin);
    waitKey(0);
    return 0;
}`
          },
          {
            title: '기울어진 격자를 원하는 배율로 펴기', level: 3,
            desc: '<code>images/calib_grid_top.png</code> 를 <b>1 mm = 20 px</b>(0.05 mm/px) 로 정면화하세요. 점 간격 5 mm 는 100 px 이 되어야 합니다. 여백을 30 px 두고 출력 크기를 직접 계산해, 변환 후 점 88개의 x · y 범위가 예상과 맞는지 확인하세요.',
            hint: '격자는 가로 10칸(50 mm) × 세로 7칸(35 mm). 1 mm = 20 px 이면 격자가 1000 × 700 px, 여백 30 을 양쪽에 두면 출력 크기는 1060 × 760 입니다. dst 네 점은 (30,30) (1030,30) (1030,730) (30,730). 점 면적 기준도 배율이 커진 만큼 키워야 합니다(약 4배: 200 ~ 4000).',
            expect: '결과 1060x760 (점 간격 100 px 예상)\n점 88개\nx 29.9 ~ 1030.1 / y 29.9 ~ 730.1',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/calib_grid_top.png", IMREAD_GRAYSCALE);
    Point2f src[4] = { Point2f(95.30f, 72.80f), Point2f(560.21f, 80.10f),
                       Point2f(552.60f, 410.40f), Point2f(88.70f, 398.89f) };
    int pxPerMm = 20, margin = 30;
    // TODO: dst 네 점과 출력 크기를 계산해 warpPerspective 하세요
    // TODO: 변환 결과에서 점을 검출해 개수와 x · y 범위를 출력하세요

    imshow("input", img);
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
    Mat img = imread("images/calib_grid_top.png", IMREAD_GRAYSCALE);
    Point2f src[4] = { Point2f(95.30f, 72.80f), Point2f(560.21f, 80.10f),
                       Point2f(552.60f, 410.40f), Point2f(88.70f, 398.89f) };
    int pxPerMm = 20, margin = 30;
    float w = 50.0f * pxPerMm, h = 35.0f * pxPerMm;          // 격자 크기 (mm → px)
    Point2f dst[4] = { Point2f(margin, margin), Point2f(margin + w, margin),
                       Point2f(margin + w, margin + h), Point2f(margin, margin + h) };
    Mat H = getPerspectiveTransform(src, dst);
    Mat top;
    warpPerspective(img, top, H, Size((int)w + 2 * margin, (int)h + 2 * margin));
    cout << "결과 " << top.cols << "x" << top.rows << " (점 간격 " << 5 * pxPerMm << " px 예상)" << endl;

    Mat bin;
    threshold(top, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    vector<vector<Point>> cs;
    findContours(bin, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    int count = 0;
    float x0 = 1e9f, x1 = -1e9f, y0 = 1e9f, y1 = -1e9f;
    for (const auto& c : cs)
    {
        double a = contourArea(c);
        if (a < 200 || a > 4000) continue;
        Moments m = moments(c);
        float cx = (float)(m.m10 / m.m00), cy = (float)(m.m01 / m.m00);
        x0 = min(x0, cx); x1 = max(x1, cx); y0 = min(y0, cy); y1 = max(y1, cy);
        count++;
    }
    cout << "점 " << count << "개" << endl;
    cout << format("x %.1f ~ %.1f / y %.1f ~ %.1f", x0, x1, y0, y1) << endl;

    imshow("front", top);
    waitKey(0);
    return 0;
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: '기하 변환 ②', subtitle: '대응점으로 만드는 변환 — 어파인 3점 · 원근 4점', notes: '<p>1교시 복습 한 줄: 행렬을 직접 만들거나 getRotationMatrix2D 로 얻었다. 💬 “그런데 현장에서 각도를 모르고 <b>점 위치만</b> 안다면?” 이 질문으로 시작합니다. (2분)</p>' },
          { layout: 'diagram', title: '어파인 3점 vs 원근 4점', html: FIG_PERSP, caption: '원근은 마지막에 w 로 나누기 때문에 원근감이 생긴다', notes: '<p>미지수 개수로 설명합니다: 어파인 6개 → 점 3쌍(한 쌍이 식 2개), 원근 8개 → 4쌍. 아래쪽 3×3 행렬과 x\'=u/w 를 짚어 주고, 💬 “어파인은 왜 원근을 못 만드나?” — 나눗셈(w)이 없어서. (6분)</p>' },
          { layout: 'table', title: '함수 이름 짝 맞추기', head: ['', '어파인', '원근'], rows: [
            ['행렬', '2×3', '3×3'],
            ['대응점', '<b>3쌍</b>', '<b>4쌍</b>'],
            ['만들기', '<code>getAffineTransform</code>', '<code>getPerspectiveTransform</code>'],
            ['이미지', '<code>warpAffine</code>', '<code>warpPerspective</code>'],
            ['점만', '<code>transform</code>', '<code>perspectiveTransform</code>'],
            ['점 많을 때', '<code>estimateAffine2D</code>', '<code>findHomography</code>']
          ], notes: '<p>이 표를 노트에 그대로 적게 합니다. 특히 <b>warp(이미지) / transform(점)</b> 구분이 시험과 실습에서 가장 많이 틀리는 부분입니다. 점은 <code>Point2f</code> C 배열이나 <code>vector&lt;Point2f&gt;</code> 둘 다 된다는 점도 말해 줍니다. (4분)</p>' },
          { layout: 'code', title: 'getAffineTransform: 세 점만 정하면 끝', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_gray.png", IMREAD_GRAYSCALE);
    Point2f src[3] = { Point2f(0, 0), Point2f(639, 0), Point2f(0, 479) };
    Point2f dst[3] = { Point2f(60, 40), Point2f(600, 90), Point2f(10, 450) };
    Mat A = getAffineTransform(src, dst);
    cout << A << endl;

    Mat warped;
    warpAffine(img, warped, A, Size(640, 480));
    imshow("affine", warped);
    waitKey(0);
    return 0;
}`, points: ['점 3쌍 → 2×3 행렬 자동 계산', '세 점이 <b>일직선이면 안 됨</b>', '나머지 픽셀 위치는 자동으로 정해진다'], notes: '<p>dst 의 값을 바꿔 보게 합니다. 세 점을 모두 한 직선(y=0) 위에 두면 결과가 어떻게 되는지 시연하면 “일직선 금지”가 확실히 남습니다. (5분)</p>' },
          { layout: 'image', title: '문제: 비스듬히 찍힌 교정판', src: 'images/calib_grid_top.png', caption: '11×8 점 격자 (간격 5 mm) — 약한 원근 때문에 위아래 간격이 다르다', notes: '<p>💬 “이 영상에서 점 사이 거리를 재면 위쪽과 아래쪽이 다릅니다. 왜?” — 카메라가 기울어 원근이 생김. 그래서 정면화(rectification)가 먼저라는 흐름을 만듭니다. (3분)</p>' },
          { layout: 'code', title: '정면화: 네 귀퉁이를 직사각형으로', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/calib_grid_top.png", IMREAD_GRAYSCALE);
    Point2f src[4] = { Point2f(95.30f, 72.80f), Point2f(560.21f, 80.10f),
                       Point2f(552.60f, 410.40f), Point2f(88.70f, 398.89f) };
    Point2f dst[4] = { Point2f(50, 50), Point2f(550, 50),
                       Point2f(550, 400), Point2f(50, 400) };      // 1 mm = 10 px
    Mat H = getPerspectiveTransform(src, dst);
    Mat top;
    warpPerspective(img, top, H, Size(600, 450));
    cout << "정면화 " << top.cols << "x" << top.rows << endl;
    imshow("input", img);
    imshow("front", top);
    waitKey(0);
    return 0;
}`, points: ['dst 를 <b>1 mm = 10 px</b> 로 정하면 결과가 곧 실측 좌표', '점 간격 5 mm → 정확히 50 px', '<b>점 순서</b>(좌상→우상→우하→좌하)를 맞춰야 한다'], notes: '<p>실행해 두 창을 비교하고, 결과에서 점 간격을 마우스로 재 보게 합니다(결과 창의 좌표 표시). dst 의 두 점 순서를 바꿔 X 자로 접히는 모습을 보여 주면 “순서 맞추기”가 기억에 남습니다. (7분)</p>' },
          { layout: 'diagram', title: 'px → mm: 로봇에게 위치 알려 주기', html: FIG_PXMM, caption: '로봇 좌표를 아는 기준 마크 4개 → H → 부품 좌표 변환', notes: '<p>산업 현장에서 가장 많이 쓰는 응용입니다. 마크의 로봇 좌표는 로봇을 직접 그 점에 옮겨 기록(티칭)합니다. 💬 “카메라를 건드리면?” — 다시 교정. (4분)</p>' },
          { layout: 'code', title: 'px → mm 변환과 검산', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    vector<Point2f> px = { Point2f(61.56f, 57.38f), Point2f(583.83f, 65.15f),
                           Point2f(574.58f, 426.42f), Point2f(67.27f, 419.64f) };
    vector<Point2f> mm = { Point2f(270, 90), Point2f(530, 90),
                           Point2f(530, -90), Point2f(270, -90) };
    Mat H = getPerspectiveTransform(px, mm);

    vector<Point2f> test = { Point2f(61.56f, 57.38f), Point2f(320, 240) }, robot;
    perspectiveTransform(test, robot, H);        // 점만 변환!
    for (const auto& p : robot)
        cout << format("mm (%.2f, %.2f)", p.x, p.y) << endl;
    return 0;
}`, points: ['마크 자신은 정확히 (270, 90) 으로 돌아온다 = <b>검산</b>', '입력 · 출력은 <code>vector&lt;Point2f&gt;</code>', 'y 대각 성분이 <b>음수</b>: 영상 y 는 아래로, 로봇 Y 는 위로'], notes: '<p>검산 습관을 강조합니다: 변환을 만들면 <b>반드시 입력 점을 다시 넣어</b> 원하는 값이 나오는지 확인. 여기서 오차가 크면 마크 좌표를 잘못 짝지은 것입니다. (6분)</p>' },
          { layout: 'two', title: '역변환과 응용', left: { title: '역변환 <code>invert(H, Hinv)</code>', bullets: ['mm → px: 로봇 목표를 영상에 표시', '검사 ROI 를 mm 로 정의', 'px→mm→px 왕복은 제자리', '어파인 전용: <code>invertAffineTransform</code>'] }, right: { title: '문서 · 카드 스캐너', bullets: ['① Canny + findContours 로 사각형 찾기', '② approxPolyDP 로 꼭짓점 4개 (12차시)', '③ getPerspectiveTransform → warpPerspective', '출력 비율을 A4(210:297)로 주면 비율까지 교정'] }, notes: '<p>오늘 배운 것이 스마트폰 스캐너 앱과 같은 원리임을 알려 줍니다. 로컬 PC 에서는 마우스로 네 점을 찍는 버전(추가 예제)을 돌려 볼 수 있습니다. 12차시에서 꼭짓점 4개를 자동으로 찾는 방법(approxPolyDP)을 배운다고 예고합니다. (4분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '부품 중심 5개를 로봇 좌표로 바꿀 때 쓰는 함수는?', options: ['<code>warpPerspective</code>', '<code>perspectiveTransform</code>', '<code>warpAffine</code>', '<code>remap</code>'], answer: 1, explain: '이미지 전체를 펴는 것은 <code>warpPerspective</code>, <b>점 좌표만</b> 바꾸는 것은 <code>perspectiveTransform</code> 입니다. 점 5개 때문에 30만 픽셀을 다시 만들 필요가 없습니다.', notes: '<p>정답 2번. 실습에서 가장 많이 틀리는 부분이므로 여기서 한 번 더 확인합니다. (2분)</p>' },
          { layout: 'practice', title: '실습: 부품 → 로봇 좌표', desc: '<p><code>images/robot_pick.png</code> 의 부품 5개 중심을 찾아 로봇 좌표(mm)로 출력하세요.</p><ul><li>Otsu → <code>connectedComponentsWithStats</code>, 면적 1500~5000 만 부품</li><li>기준 마크 4쌍으로 H 만들기</li><li><code>perspectiveTransform</code> 한 번으로 5개 변환</li><li>정답: (320,30) (400,−35) (470,40) (300,−40) (400,45) mm</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/robot_pick.png", IMREAD_GRAYSCALE);
    Mat bin, labels, stats, cents;
    threshold(img, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    int n = connectedComponentsWithStats(bin, labels, stats, cents);
    vector<Point2f> parts;
    for (int i = 1; i < n; i++)
    {
        int area = stats.at<int>(i, CC_STAT_AREA);
        if (area >= 1500 && area <= 5000)
            parts.push_back(Point2f((float)cents.at<double>(i, 0), (float)cents.at<double>(i, 1)));
    }
    cout << "부품 " << parts.size() << "개" << endl;
    // TODO: H 를 만들고 중심을 mm 로 변환
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/robot_pick.png", IMREAD_GRAYSCALE);
    Mat bin, labels, stats, cents;
    threshold(img, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    int n = connectedComponentsWithStats(bin, labels, stats, cents);
    vector<Point2f> parts, robot;
    for (int i = 1; i < n; i++)
    {
        int area = stats.at<int>(i, CC_STAT_AREA);
        if (area >= 1500 && area <= 5000)
            parts.push_back(Point2f((float)cents.at<double>(i, 0), (float)cents.at<double>(i, 1)));
    }
    vector<Point2f> mk = { {61.56f, 57.38f}, {583.83f, 65.15f}, {574.58f, 426.42f}, {67.27f, 419.64f} };
    vector<Point2f> mm = { {270, 90}, {530, 90}, {530, -90}, {270, -90} };
    perspectiveTransform(parts, robot, getPerspectiveTransform(mk, mm));
    for (const auto& p : robot) cout << format("로봇 (%.1f, %.1f) mm", p.x, p.y) << endl;
    return 0;
}`, notes: '<p>면적 필터를 빼면 컨베이어 양쪽 띠(면적 3만 이상)까지 섞여 나옵니다 — 그 결과를 먼저 보여 주고 필터를 넣게 하면 “면적 필터”의 필요성이 체감됩니다. 결과가 정답과 0.5 mm 이내로 맞는지 확인하게 하세요. <code>{61.56f, 57.38f}</code> 같은 중괄호 초기화도 <code>Point2f</code> 를 만든다는 점을 알려 줍니다. (10분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['대응점만 있으면 행렬을 풀 수 있다 — 어파인 <b>3쌍</b>, 원근 <b>4쌍</b>', '이미지는 <code>warp*</code>, 점은 <code>*Transform</code> — 절대 헷갈리지 말 것', 'dst 를 <b>실측 단위(1 mm = N px)</b> 로 정하면 결과가 곧 측정 좌표', '<code>invert</code> 로 역변환(mm → px), 점이 많으면 <code>findHomography</code> + RANSAC', '변환을 만들면 <b>입력 점으로 검산</b>하는 습관', '다음 차시: 윤곽선과 도형 분석 — 꼭짓점 4개를 자동으로 찾아 스캐너 완성'], notes: '<p>오늘의 핵심 한 줄: “<b>점을 짝지으면 변환이 생긴다.</b>” 다음 차시(12)에서 윤곽선 · approxPolyDP 로 네 점을 자동 검출해 오늘의 스캐너를 완성한다고 예고합니다. (2분)</p>' }
        ]
      }
    ]
  });
})();
