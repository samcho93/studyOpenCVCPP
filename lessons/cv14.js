/* 14차시 템플릿 매칭과 특징점 (ORB) */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 템플릿 슬라이딩 + 유사도 맵
  const FIG_SLIDE = `<svg viewBox="0 0 740 330" role="img" aria-label="템플릿을 영상 위에서 한 칸씩 옮기며 유사도를 계산해 유사도 맵을 만드는 그림">
  ${ARROW('c14a1')}
  <text x="150" y="24" text-anchor="middle" class="tx-b">① 원본 영상 W × H</text>
  <rect x="30" y="34" width="240" height="180" rx="6" class="card-bg"/>
  <rect x="62" y="58" width="60" height="60" rx="4" class="p1s"/>
  <rect x="62" y="58" width="60" height="60" rx="4" class="s1" fill="none" stroke-width="2.5"/>
  <text x="92" y="94" text-anchor="middle" class="tx-b">w × h</text>
  <line x1="122" y1="70" x2="182" y2="70" class="ln" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#c14a1)"/>
  <rect x="182" y="58" width="60" height="60" rx="4" class="s1" fill="none" stroke-width="1.5" stroke-dasharray="4 3"/>
  <line x1="92" y1="118" x2="92" y2="146" class="ln" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#c14a1)"/>
  <rect x="62" y="148" width="60" height="60" rx="4" class="s1" fill="none" stroke-width="1.5" stroke-dasharray="4 3"/>
  <circle cx="212" cy="180" r="16" class="p3"/>
  <circle cx="98" cy="90" r="12" class="p2"/>
  <text x="150" y="232" text-anchor="middle" class="tx-m">템플릿을 <tspan class="tx-b">1픽셀씩</tspan> 옮기며 겹친 부분을 비교</text>
  <text x="150" y="252" text-anchor="middle" class="tx-m">옮길 수 있는 위치 = (W−w+1) × (H−h+1)</text>
  <text x="470" y="24" text-anchor="middle" class="tx-b">② 유사도 맵 (result, CV_32FC1)</text>
  <rect x="350" y="34" width="240" height="180" rx="6" class="p4s"/>
  <circle cx="392" cy="70" r="22" class="p5"/>
  <circle cx="392" cy="70" r="9" class="p1"/>
  <text x="418" y="64" class="tx-b">최대 = 찾은 위치</text>
  <text x="418" y="82" class="tx-m">minMaxLoc → maxLoc</text>
  <circle cx="500" cy="160" r="12" class="p5"/>
  <text x="520" y="164" class="tx-m">약한 봉우리 (닮은 곳)</text>
  <text x="470" y="232" text-anchor="middle" class="tx-m">한 칸의 값 = 그 위치에서의 <tspan class="tx-b">유사도 점수</tspan></text>
  <text x="470" y="252" text-anchor="middle" class="tx-m">크기가 원본보다 w−1, h−1 만큼 작다</text>
  <rect x="620" y="34" width="100" height="180" rx="6" class="p2s"/>
  <text x="670" y="60" text-anchor="middle" class="tx-b">③ 결과</text>
  <text x="670" y="86" text-anchor="middle" class="tx-m">maxLoc =</text>
  <text x="670" y="104" text-anchor="middle" class="tx-m">사각형의</text>
  <text x="670" y="122" text-anchor="middle" class="tx-m">왼쪽 위</text>
  <text x="670" y="150" text-anchor="middle" class="tx-m">중심 =</text>
  <text x="670" y="168" text-anchor="middle" class="tx-m">maxLoc +</text>
  <text x="670" y="186" text-anchor="middle" class="tx-m">(w/2, h/2)</text>
  <text x="30" y="290" class="tx-m">⚠️ maxLoc 은 <tspan class="tx-b">템플릿의 왼쪽 위 모서리</tspan> 위치입니다. 부품 중심을 원하면 템플릿 안에서의 기준점 좌표를 더해 주세요.</text>
  <text x="30" y="314" class="tx-m">⚠️ TM_SQDIFF 계열은 <tspan class="tx-b">작을수록</tspan> 비슷하므로 maxLoc 이 아니라 <tspan class="tx-b">minLoc</tspan> 을 씁니다.</text>
</svg>`;

  // 그림 2: 다중 검출 — 임계값 + NMS
  const FIG_NMS = `<svg viewBox="0 0 740 220" role="img" aria-label="임계값을 넘는 후보 픽셀 여러 개 중 점수가 가장 높은 것만 남기는 비최대 억제">
  ${ARROW('c14c1')}
  <rect x="20" y="30" width="210" height="160" rx="8" class="card-bg"/>
  <text x="125" y="22" text-anchor="middle" class="tx-b">① 임계값 이상 픽셀</text>
  ${[[70, 80], [76, 84], [72, 90], [80, 78], [66, 86], [170, 140], [176, 136], [168, 146], [174, 144]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" class="p2"/>`).join('')}
  <text x="125" y="180" text-anchor="middle" class="tx-m">한 물체 주변에 후보가 수십 개</text>
  <line x1="238" y1="110" x2="278" y2="110" class="ln" stroke-width="2" marker-end="url(#c14c1)"/>
  <rect x="286" y="30" width="210" height="160" rx="8" class="card-bg"/>
  <text x="391" y="22" text-anchor="middle" class="tx-b">② 점수 높은 순으로 정렬</text>
  <text x="306" y="62" class="tx">0.993 (32,24) ✔ 채택</text>
  <text x="306" y="86" class="tx-m">0.991 (33,24) ✘ 가까움</text>
  <text x="306" y="110" class="tx-m">0.990 (32,25) ✘ 가까움</text>
  <text x="306" y="134" class="tx">0.988 (544,28) ✔ 채택</text>
  <text x="306" y="158" class="tx-m">…</text>
  <line x1="504" y1="110" x2="544" y2="110" class="ln" stroke-width="2" marker-end="url(#c14c1)"/>
  <rect x="552" y="30" width="170" height="160" rx="8" class="card-bg"/>
  <text x="637" y="22" text-anchor="middle" class="tx-b">③ 물체당 1개</text>
  <circle cx="600" cy="84" r="8" class="p1"/><circle cx="690" cy="84" r="8" class="p1"/><circle cx="600" cy="150" r="8" class="p1"/>
  <text x="637" y="180" text-anchor="middle" class="tx-m">NMS 후 3개</text>
  <text x="20" y="212" class="tx-m">비최대 억제(NMS) = 이미 뽑은 것과 minGap 안쪽이면 버린다 — 임계값은 진짜(0.98)와 가짜(0.90) 점수 <tspan class="tx-b">사이</tspan>에 둔다</text>
</svg>`;

  // 그림 3: 특징점과 기술자
  const FIG_KP = `<svg viewBox="0 0 740 340" role="img" aria-label="특징점 검출과 이진 기술자 생성, 해밍 거리로 매칭하는 과정">
  ${ARROW('c14b1')}
  <text x="120" y="24" text-anchor="middle" class="tx-b">① 특징점(KeyPoint) 찾기</text>
  <rect x="20" y="34" width="200" height="160" rx="6" class="card-bg"/>
  <path d="M 60 60 L 160 60 L 160 100 L 110 100 L 110 170 L 60 170 Z" class="p1s"/>
  <path d="M 60 60 L 160 60 L 160 100 L 110 100 L 110 170 L 60 170 Z" class="s1" fill="none" stroke-width="2"/>
  <circle cx="60" cy="60" r="7" class="s2" fill="none" stroke-width="2.5"/>
  <circle cx="160" cy="60" r="7" class="s2" fill="none" stroke-width="2.5"/>
  <circle cx="160" cy="100" r="7" class="s2" fill="none" stroke-width="2.5"/>
  <circle cx="110" cy="100" r="7" class="s2" fill="none" stroke-width="2.5"/>
  <circle cx="110" cy="170" r="7" class="s2" fill="none" stroke-width="2.5"/>
  <circle cx="60" cy="170" r="7" class="s2" fill="none" stroke-width="2.5"/>
  <text x="120" y="212" text-anchor="middle" class="tx-m">밝기가 확 꺾이는 곳 = <tspan class="tx-b">코너</tspan></text>
  <text x="120" y="230" text-anchor="middle" class="tx-m">(FAST) — 평평한 면 · 직선 중간은 안 잡힌다</text>
  <line x1="228" y1="114" x2="268" y2="114" class="ln" stroke-width="2" marker-end="url(#c14b1)"/>
  <text x="380" y="24" text-anchor="middle" class="tx-b">② 기술자(descriptor) 만들기</text>
  <rect x="280" y="34" width="200" height="160" rx="6" class="card-bg"/>
  <circle cx="380" cy="112" r="56" class="s2" fill="none" stroke-width="2"/>
  <circle cx="380" cy="112" r="5" class="p2"/>
  <line x1="380" y1="112" x2="424" y2="78" class="s3" stroke-width="2.5" marker-end="url(#c14b1)"/>
  <text x="428" y="74" class="tx-m">방향</text>
  <line x1="352" y1="90" x2="404" y2="104" class="ln" stroke-width="1.2"/>
  <line x1="360" y1="134" x2="402" y2="122" class="ln" stroke-width="1.2"/>
  <line x1="344" y1="118" x2="390" y2="146" class="ln" stroke-width="1.2"/>
  <text x="380" y="212" text-anchor="middle" class="tx-m">주위 픽셀 쌍을 256번 비교 (밝다/어둡다)</text>
  <text x="380" y="230" text-anchor="middle" class="tx-m">→ <tspan class="tx-b">256비트 = 32바이트</tspan> (BRIEF)</text>
  <line x1="488" y1="114" x2="528" y2="114" class="ln" stroke-width="2" marker-end="url(#c14b1)"/>
  <text x="630" y="24" text-anchor="middle" class="tx-b">③ 해밍 거리로 매칭</text>
  <rect x="540" y="34" width="180" height="160" rx="6" class="card-bg"/>
  <text x="630" y="64" text-anchor="middle" class="tx">A: 1011<tspan class="tx-b">0</tspan>110 …</text>
  <text x="630" y="88" text-anchor="middle" class="tx">B: 1011<tspan class="tx-b">1</tspan>110 …</text>
  <line x1="560" y1="100" x2="700" y2="100" class="ln"/>
  <text x="630" y="124" text-anchor="middle" class="tx-b">다른 비트 수 = 거리</text>
  <text x="630" y="148" text-anchor="middle" class="tx-m">0 = 완전히 같음</text>
  <text x="630" y="168" text-anchor="middle" class="tx-m">작을수록 좋은 매칭</text>
  <text x="630" y="212" text-anchor="middle" class="tx-m"><tspan class="tx-b">NORM_HAMMING</tspan></text>
  <text x="20" y="272" class="tx-m">특징점은 <tspan class="tx-b">회전 · 크기 · 밝기</tspan>가 바뀌어도 같은 기술자가 나오도록 설계되어 있습니다 —</text>
  <text x="20" y="292" class="tx-m">ORB 는 ① FAST 코너 + ② 방향 계산 + ③ 회전 보정한 BRIEF 기술자 (Oriented FAST and Rotated BRIEF).</text>
  <text x="20" y="318" class="tx-m">그래서 템플릿 매칭이 못 하는 <tspan class="tx-b">회전 · 크기 변화 · 부분 가림</tspan>을 견딜 수 있습니다.</text>
</svg>`;

  // 그림 4: 매칭 → RANSAC → 호모그래피 → 모서리 투영
  const FIG_HOMO = `<svg viewBox="0 0 740 250" role="img" aria-label="매칭된 점 쌍에서 RANSAC 으로 이상치를 걸러 호모그래피를 구하고 템플릿 모서리를 장면으로 투영하는 과정">
  ${ARROW('c14d1')}
  <rect x="20" y="40" width="150" height="120" rx="6" class="card-bg"/>
  <text x="95" y="30" text-anchor="middle" class="tx-b">템플릿 (여백 포함)</text>
  <path d="M 50 70 L 130 70 L 130 100 L 90 100 L 90 140 L 50 140 Z" class="p1s"/>
  <circle cx="50" cy="70" r="4" class="p2"/><circle cx="130" cy="70" r="4" class="p2"/><circle cx="90" cy="100" r="4" class="p2"/><circle cx="50" cy="140" r="4" class="p2"/>
  <rect x="280" y="40" width="200" height="160" rx="6" class="card-bg"/>
  <text x="380" y="30" text-anchor="middle" class="tx-b">장면 (회전 · 이동된 부품)</text>
  <path d="M 330 90 L 400 60 L 412 88 L 377 103 L 393 140 L 358 155 Z" class="p1s"/>
  <circle cx="330" cy="90" r="4" class="p2"/><circle cx="400" cy="60" r="4" class="p2"/><circle cx="377" cy="103" r="4" class="p2"/><circle cx="358" cy="155" r="4" class="p2"/>
  <circle cx="450" cy="180" r="4" class="p4"/>
  <line x1="54" y1="70" x2="326" y2="90" class="s3" stroke-width="1.2"/>
  <line x1="134" y1="70" x2="396" y2="60" class="s3" stroke-width="1.2"/>
  <line x1="94" y1="100" x2="373" y2="103" class="s3" stroke-width="1.2"/>
  <line x1="54" y1="140" x2="354" y2="155" class="s3" stroke-width="1.2"/>
  <line x1="130" y1="70" x2="446" y2="180" class="s4" stroke-width="1.5" stroke-dasharray="5 4"/>
  <text x="200" y="200" class="tx-m">초록 선 = 인라이어 · 점선 = 이상치(틀린 쌍)</text>
  <rect x="510" y="40" width="210" height="160" rx="8" class="p2s"/>
  <text x="615" y="64" text-anchor="middle" class="tx-b">findHomography(RANSAC)</text>
  <text x="615" y="88" text-anchor="middle" class="tx-m">무작위 4쌍 → H 후보</text>
  <text x="615" y="108" text-anchor="middle" class="tx-m">가장 많이 동의하는 H 채택</text>
  <text x="615" y="128" text-anchor="middle" class="tx-m">mask = 인라이어 1 / 이상치 0</text>
  <text x="615" y="156" text-anchor="middle" class="tx-b">perspectiveTransform</text>
  <text x="615" y="176" text-anchor="middle" class="tx-m">템플릿 모서리 · 기준점 → 장면 좌표</text>
  <text x="20" y="236" class="tx-m">3 × 3 행렬 H 하나로 평면 물체의 이동 · 회전 · 배율 · 원근을 모두 표현한다 (11차시 getPerspectiveTransform 과 같은 H)</text>
</svg>`;

  // ------------------------------------------------------------------ 1교시 코드
  const EX_TM = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat board = imread("images/fiducial_board.png", IMREAD_GRAYSCALE);
    Mat tmpl = imread("images/fiducial_template.png", IMREAD_GRAYSCALE);
    cout << "기판 " << board.cols << "x" << board.rows << ", 템플릿 " << tmpl.cols << "x" << tmpl.rows << endl;

    Mat res;
    matchTemplate(board, tmpl, res, TM_CCOEFF_NORMED);
    cout << "유사도 맵: " << res.cols << " x " << res.rows << " (" << typeToString(res.type()) << ")" << endl;
    cout << "= (640-64+1) x (480-64+1) = " << board.cols - tmpl.cols + 1 << " x " << board.rows - tmpl.rows + 1 << endl;

    double minVal, maxVal;
    Point minLoc, maxLoc;
    minMaxLoc(res, &minVal, &maxVal, &minLoc, &maxLoc);      // 결과를 포인터로 받는다
    cout << format("최대 점수 %.3f @ 좌상단 (%d,%d)", maxVal, maxLoc.x, maxLoc.y) << endl;
    cout << format("최소 점수 %.3f @ (%d,%d)", minVal, minLoc.x, minLoc.y) << endl;
    Point center = maxLoc + Point(tmpl.cols / 2, tmpl.rows / 2);
    cout << format("피듀셜 중심 = 좌상단 + 템플릿 중심 = (%d,%d)  (정답 64,56)", center.x, center.y) << endl;

    Mat canvas;
    cvtColor(board, canvas, COLOR_GRAY2BGR);
    rectangle(canvas, Rect(maxLoc, tmpl.size()), Scalar(0, 0, 255), 2);   // Rect(왼쪽 위, 크기)
    drawMarker(canvas, center, Scalar(0, 255, 0), MARKER_CROSS, 20, 2);

    // 유사도 맵(float)을 눈으로 보려면 0~255 로 펴서 8비트로 바꾼다
    Mat vis;
    normalize(res, vis, 0, 255, NORM_MINMAX, CV_8U);
    imshow("similarity map", vis);
    imshow("found", canvas);
    waitKey(0);
    return 0;
}`;

  const EX_MODES = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat board = imread("images/fiducial_board.png", IMREAD_GRAYSCALE);
    Mat tmpl = imread("images/fiducial_template.png", IMREAD_GRAYSCALE);

    // TM_SQDIFF(0) ~ TM_CCOEFF_NORMED(5) 는 정수 상수이므로 for 로 돌 수 있다
    const char* names[] = { "TM_SQDIFF", "TM_SQDIFF_NORMED", "TM_CCORR", "TM_CCORR_NORMED", "TM_CCOEFF", "TM_CCOEFF_NORMED" };
    cout << "모드                최소값 위치    최대값 위치    찾는 쪽" << endl;
    for (int m = TM_SQDIFF; m <= TM_CCOEFF_NORMED; m++)
    {
        Mat r;
        matchTemplate(board, tmpl, r, m);
        Point pn, px;
        minMaxLoc(r, nullptr, nullptr, &pn, &px);         // 필요 없는 값은 nullptr
        bool useMin = (m == TM_SQDIFF || m == TM_SQDIFF_NORMED);
        cout << format("%-18s  (%3d,%3d)      (%3d,%3d)      %s", names[m], pn.x, pn.y, px.x, px.y,
                       useMin ? "최소(minLoc)" : "최대(maxLoc)") << endl;
    }
    cout << "정답 피듀셜 F1 좌상단 = (32,24)" << endl;
    return 0;
}`;

  const EX_MULTI = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

// 임계값 이상 픽셀을 점수 순으로 보며, 이미 뽑은 것과 minGap 안쪽이면 버린다 (간단 NMS)
vector<Point> findPeaks(const Mat& score, double thresh, int minGap)
{
    Mat mask, mask8;
    threshold(score, mask, thresh, 255, THRESH_BINARY);   // float 결과 → 0 / 255 (아직 CV_32F)
    mask.convertTo(mask8, CV_8U);                         // findNonZero 는 8비트 1채널
    vector<Point> cand;
    findNonZero(mask8, cand);
    stable_sort(cand.begin(), cand.end(), [&](const Point& a, const Point& b) {
        return score.at<float>(a.y, a.x) > score.at<float>(b.y, b.x);   // (행, 열) 순서!
    });
    vector<Point> keep;
    for (const Point& p : cand)
    {
        bool near = false;
        for (const Point& k : keep)
            if (abs(k.x - p.x) < minGap && abs(k.y - p.y) < minGap) near = true;
        if (!near) keep.push_back(p);
    }
    cout << "  후보 픽셀 " << cand.size() << "개 → NMS 후 " << keep.size() << "개" << endl;
    return keep;
}

int main()
{
    Mat board = imread("images/fiducial_board.png", IMREAD_GRAYSCALE);
    Mat tmpl = imread("images/fiducial_template.png", IMREAD_GRAYSCALE);
    Mat res;
    matchTemplate(board, tmpl, res, TM_CCOEFF_NORMED);

    cout << "임계값 0.95" << endl;
    vector<Point> found = findPeaks(res, 0.95, 32);
    sort(found.begin(), found.end(), [](const Point& a, const Point& b) { return a.y < b.y; });
    for (const Point& p : found)
        cout << format("  좌상단 (%d,%d) 점수 %.3f → 중심 (%d,%d)", p.x, p.y, res.at<float>(p.y, p.x), p.x + 32, p.y + 32) << endl;

    cout << "임계값 0.85 (방해 패드까지 섞인다)" << endl;
    vector<Point> loose = findPeaks(res, 0.85, 32);
    for (const Point& p : loose)
        cout << format("  (%d,%d) 점수 %.3f", p.x + 32, p.y + 32, res.at<float>(p.y, p.x)) << endl;

    Mat canvas;
    cvtColor(board, canvas, COLOR_GRAY2BGR);
    for (const Point& p : found)
        rectangle(canvas, Rect(p.x, p.y, 64, 64), Scalar(0, 0, 255), 2);
    imshow("fiducials", canvas);
    waitKey(0);
    return 0;
}`;

  const EX_CROP = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat board = imread("images/fiducial_board.png", IMREAD_GRAYSCALE);

    // 로컬에서는 selectROI 로 마우스로 고르지만, 여기서는 좌표를 직접 준다 (F1 피듀셜)
    Rect roi(32, 24, 64, 64);
    Mat tmpl = board(roi).clone();        // clone: 원본과 메모리를 나누지 않는 독립 복사본
    imwrite("my_template.png", tmpl);     // 📁 작업 폴더에 저장 → 다음 실행에서 imread 로 재사용

    Mat res;
    matchTemplate(board, tmpl, res, TM_CCOEFF_NORMED);
    double maxVal;
    Point maxLoc;
    minMaxLoc(res, nullptr, &maxVal, nullptr, &maxLoc);
    cout << format("자기 자신: 점수 %.3f @ (%d,%d)", maxVal, maxLoc.x, maxLoc.y) << endl;

    // 다른 피듀셜 · 방해 패드 자리의 점수 (좌상단 = 중심 - 32)
    Point others[] = { Point(544, 28), Point(38, 388), Point(218, 78), Point(348, 388) };
    const char* names[] = { "F2 피듀셜", "F3 피듀셜", "방해 패드", "방해 패드" };
    for (int i = 0; i < 4; i++)
        cout << format("  %s (%d,%d): %.3f", names[i], others[i].x + 32, others[i].y + 32,
                       res.at<float>(others[i].y, others[i].x)) << endl;

    imshow("template", tmpl);
    waitKey(0);
    return 0;
}`;

  const EX_SELECT = `// 로컬 PC 전용: 마우스로 템플릿 영역을 드래그해 고르고 파일로 저장
#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat board = imread("images/fiducial_board.png", IMREAD_GRAYSCALE);
    if (board.empty()) return -1;

    Rect roi = selectROI("select template", board);   // 드래그 → Enter (취소는 c)
    destroyWindow("select template");
    if (roi.empty()) { cout << "선택하지 않았습니다" << endl; return 0; }

    Mat tmpl = board(roi).clone();
    imwrite("images/my_template.png", tmpl);
    cout << "템플릿 " << roi << " 저장" << endl;

    Mat res;
    matchTemplate(board, tmpl, res, TM_CCOEFF_NORMED);
    double maxVal;
    Point maxLoc;
    minMaxLoc(res, nullptr, &maxVal, nullptr, &maxLoc);
    Mat canvas;
    cvtColor(board, canvas, COLOR_GRAY2BGR);
    rectangle(canvas, Rect(maxLoc, roi.size()), Scalar(0, 0, 255), 2);
    imshow("found", canvas);
    waitKey(0);
    return 0;
}`;

  const EX_OCR = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat disp = imread("images/seven_segment.png", IMREAD_GRAYSCALE);
    Mat tpl = imread("images/digits_templates.png", IMREAD_GRAYSCALE);
    cout << "표시기 " << disp.cols << "x" << disp.rows << ", 숫자 템플릿 띠 " << tpl.cols << "x" << tpl.rows << endl;

    string result;
    for (int i = 0; i < 8; i++)
    {
        Mat cell = disp(Rect(64 + 64 * i, 60, 64, 120));      // 자리 i 의 셀 (ROI — 복사 없음)
        int best = -1;
        double bestScore = -2;
        for (int d = 0; d <= 9; d++)
        {
            Mat t = tpl(Rect(64 * d, 0, 64, 120));             // 숫자 d 의 템플릿
            Mat r;
            matchTemplate(cell, t, r, TM_CCOEFF_NORMED);       // 크기가 같으면 결과는 1 x 1
            double mx;
            minMaxLoc(r, nullptr, &mx);
            if (mx > bestScore) { bestScore = mx; best = d; }
        }
        result += to_string(best);
        cout << format("  %d번째 자리 = %d (점수 %.3f)", i, best, bestScore) << endl;
    }
    cout << "판독 결과: " << result << "  (정답 20480735)" << endl;
    return 0;
}`;

  const EX_LIMIT = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat scene = imread("images/parts_scene.png", IMREAD_GRAYSCALE);
    Mat tmpl = imread("images/part_template.png", IMREAD_GRAYSCALE);
    Mat res;
    matchTemplate(scene, tmpl, res, TM_CCOEFF_NORMED);
    double mx;
    Point px;
    minMaxLoc(res, nullptr, &mx, nullptr, &px);
    cout << format("최고 점수 %.3f @ (%d,%d) → 기준점 (%d,%d)", mx, px.x, px.y, px.x + 60, px.y + 50) << endl;

    // 부품 6개의 기준점 위치(정답)와 회전각 — 그 자리 ±6 px 안의 최고 점수를 본다
    int bx[] = { 120, 330, 520, 150, 360, 540 };
    int by[] = { 110, 100, 120, 340, 330, 360 };
    int deg[] = { 0, 30, -45, 90, 160, -120 };
    cout << "부품   회전각   그 자리의 최고 점수" << endl;
    for (int i = 0; i < 6; i++)
    {
        float best = -2;
        for (int dy = -6; dy <= 6; dy++)
            for (int dx = -6; dx <= 6; dx++)
            {
                int x = bx[i] - 60 + dx, y = by[i] - 50 + dy;     // 기준점 → 좌상단
                if (x < 0 || y < 0 || x >= res.cols || y >= res.rows) continue;
                best = max(best, res.at<float>(y, x));
            }
        cout << format("  #%d   %4d도      %.3f", i + 1, deg[i], best) << endl;
    }
    cout << "→ 0도 부품만 찾고, 30도만 돌아가도 0.53 으로 떨어진다" << endl;
    return 0;
}`;

  // ------------------------------------------------------------------ 2교시 코드
  const EX_ORB = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat scene = imread("images/parts_scene.png", IMREAD_GRAYSCALE);
    Ptr<ORB> orb = ORB::create(500);              // 최대 특징점 개수 · Ptr = 스마트 포인터
    vector<KeyPoint> kps;
    Mat desc;
    orb->detectAndCompute(scene, noArray(), kps, desc);   // noArray() = 마스크 없음 (영상 전체)

    cout << "특징점 " << kps.size() << "개" << endl;
    cout << "기술자(descriptor) Mat: " << desc.rows << " x " << desc.cols << " (" << typeToString(desc.type()) << ")" << endl;
    cout << "→ 특징점 1개 = 32바이트 = 256비트 이진 기술자" << endl;

    vector<KeyPoint> top = kps;                   // 원본 순서는 두고 복사본을 정렬
    stable_sort(top.begin(), top.end(), [](const KeyPoint& a, const KeyPoint& b) { return a.response > b.response; });
    cout << "response(코너 강도) 상위 5개:" << endl;
    for (int i = 0; i < 5 && i < (int)top.size(); i++)
    {
        const KeyPoint& k = top[i];
        cout << format("  (%5.0f,%5.0f) size %4.0f angle %6.1f octave %d", k.pt.x, k.pt.y, k.size, k.angle, k.octave) << endl;
    }

    Mat vis;
    drawKeypoints(scene, kps, vis, Scalar::all(-1), DrawMatchesFlags::DRAW_RICH_KEYPOINTS);
    imshow("keypoints", vis);
    waitKey(0);
    return 0;
}`;

  const EX_MATCH = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat scene = imread("images/parts_scene.png", IMREAD_GRAYSCALE);
    Mat t0 = imread("images/part_template.png", IMREAD_GRAYSCALE);
    // 템플릿이 작으면 ORB 가 테두리 근처 특징점을 버린다 → 여백을 32px 붙인다
    Mat tmpl;
    copyMakeBorder(t0, tmpl, 32, 32, 32, 32, BORDER_REPLICATE);

    Ptr<ORB> orb = ORB::create(1000);
    vector<KeyPoint> kT, kS;
    Mat dT, dS;
    orb->detectAndCompute(tmpl, noArray(), kT, dT);
    orb->detectAndCompute(scene, noArray(), kS, dS);
    cout << "템플릿 특징점 " << kT.size() << "개 / 장면 특징점 " << kS.size() << "개" << endl;

    // 이진 기술자 → 해밍 거리. crossCheck: 서로가 서로의 1등일 때만 매칭으로 인정
    BFMatcher matcher(NORM_HAMMING, true);
    vector<DMatch> matches;
    matcher.match(dT, dS, matches);               // query = 템플릿, train = 장면
    cout << "crossCheck 매칭 " << matches.size() << "개" << endl;

    stable_sort(matches.begin(), matches.end());  // DMatch 는 distance 로 비교된다 (operator<)
    vector<DMatch> good(matches.begin(), matches.begin() + min<size_t>(20, matches.size()));
    cout << format("거리 정렬 상위 %d개: %.0f ~ %.0f (해밍 거리 = 다른 비트 수)",
                   (int)good.size(), good.front().distance, good.back().distance) << endl;
    for (int i = 0; i < 5; i++)
    {
        const DMatch& m = good[i];
        Point2f p = kS[m.trainIdx].pt;
        cout << format("  템플릿 kp%3d → 장면 kp%3d  거리 %3.0f  장면 위치 (%.0f,%.0f)", m.queryIdx, m.trainIdx, m.distance, p.x, p.y) << endl;
    }

    Mat drawn;
    drawMatches(tmpl, kT, scene, kS, good, drawn);
    imshow("matches", drawn);
    waitKey(0);
    return 0;
}`;

  const EX_HOMO = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat scene = imread("images/parts_scene.png", IMREAD_GRAYSCALE);
    Mat t0 = imread("images/part_template.png", IMREAD_GRAYSCALE);
    Mat tmpl;
    copyMakeBorder(t0, tmpl, 32, 32, 32, 32, BORDER_REPLICATE);

    Ptr<ORB> orb = ORB::create(1000);
    vector<KeyPoint> kT, kS;
    Mat dT, dS;
    orb->detectAndCompute(tmpl, noArray(), kT, dT);
    orb->detectAndCompute(scene, noArray(), kS, dS);
    vector<DMatch> matches;
    BFMatcher(NORM_HAMMING, true).match(dT, dS, matches);
    stable_sort(matches.begin(), matches.end());
    matches.resize(min<size_t>(20, matches.size()));      // 거리 상위 20쌍

    // 매칭된 점 쌍 → 3x3 호모그래피. RANSAC 이 엉뚱한 쌍(이상치)을 걸러 준다
    vector<Point2f> src, dst;
    for (const DMatch& m : matches)
    {
        src.push_back(kT[m.queryIdx].pt);     // 템플릿 좌표
        dst.push_back(kS[m.trainIdx].pt);     // 장면 좌표 (같은 순서)
    }
    Mat inlierMask;
    Mat H = findHomography(src, dst, RANSAC, 3, inlierMask);
    int inliers = countNonZero(inlierMask);
    cout << "호모그래피 H: " << H.rows << "x" << H.cols << " (" << typeToString(H.type()) << ")"
         << ", RANSAC 인라이어 " << inliers << " / " << matches.size() << endl;

    // 여백을 뺀 원본 템플릿의 네 모서리 (32,32)-(152,132) 와 기준점 (60,50)+32 를 장면으로 투영
    vector<Point2f> corners = { Point2f(32, 32), Point2f(152, 32), Point2f(152, 132), Point2f(32, 132) };
    vector<Point2f> proj;
    perspectiveTransform(corners, proj, H);
    cout << "투영된 네 모서리:" << endl;
    for (const Point2f& p : proj) cout << format("  (%6.1f,%6.1f)", p.x, p.y) << endl;

    vector<Point2f> ref = { Point2f(92, 82) }, refOut;
    perspectiveTransform(ref, refOut, H);
    double err = norm(refOut[0] - Point2f(120, 110));
    cout << format("기준점(템플릿 60,50) 투영 = (%.1f,%.1f)  (정답 120,110)", refOut[0].x, refOut[0].y) << endl;
    cout << "판정: " << (inliers >= 10 && err < 5 ? "찾음" : "못 찾음") << " (인라이어 10개 이상 · 기준점 오차 5 px 미만)" << endl;

    Mat canvas;
    cvtColor(scene, canvas, COLOR_GRAY2BGR);
    vector<Point> poly;
    for (const Point2f& p : proj) poly.push_back(Point(cvRound(p.x), cvRound(p.y)));
    polylines(canvas, vector<vector<Point>>{ poly }, true, Scalar(0, 0, 255), 2);
    drawMarker(canvas, Point(cvRound(refOut[0].x), cvRound(refOut[0].y)), Scalar(0, 255, 0), MARKER_CROSS, 24, 2);
    imshow("located", canvas);
    waitKey(0);
    return 0;
}`;

  const EX_KNN = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat scene = imread("images/parts_scene.png", IMREAD_GRAYSCALE);
    Mat t0 = imread("images/part_template.png", IMREAD_GRAYSCALE);
    Mat tmpl;
    copyMakeBorder(t0, tmpl, 32, 32, 32, 32, BORDER_REPLICATE);
    Ptr<ORB> orb = ORB::create(1000);
    vector<KeyPoint> kT, kS;
    Mat dT, dS;
    orb->detectAndCompute(tmpl, noArray(), kT, dT);
    orb->detectAndCompute(scene, noArray(), kS, dS);

    // crossCheck 를 끄고 후보 2개를 받아 1등 / 2등 거리를 비교한다 (Lowe 비율 검사)
    BFMatcher matcher(NORM_HAMMING, false);
    vector<vector<DMatch>> knn;
    matcher.knnMatch(dT, dS, knn, 2);
    cout << "knnMatch(k=2): 템플릿 특징점 " << knn.size() << "개마다 후보 2개" << endl;

    for (double ratio : {0.6, 0.7, 0.75, 0.8, 0.9})
    {
        int pass = 0;
        for (const vector<DMatch>& p : knn)
            if (p.size() == 2 && p[0].distance < ratio * p[1].distance) pass++;
        cout << format("  비율 %.2f 통과 %3d개", ratio, pass) << endl;
    }

    vector<DMatch> good;
    for (const vector<DMatch>& p : knn)
        if (p.size() == 2 && p[0].distance < 0.75 * p[1].distance) good.push_back(p[0]);
    stable_sort(good.begin(), good.end());
    cout << "Lowe 0.75 로 고른 매칭 " << good.size() << "개" << endl;
    for (int i = 0; i < 3 && i < (int)good.size(); i++)
        cout << format("  거리 %.0f → 장면 (%.0f,%.0f)", good[i].distance, kS[good[i].trainIdx].pt.x, kS[good[i].trainIdx].pt.y) << endl;
    return 0;
}`;

  const EX_QR = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <sstream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/label_lot.png", IMREAD_GRAYSCALE);
    QRCodeDetector qr;
    vector<Point2f> pts;
    string text = qr.detectAndDecode(img, pts);

    if (text.empty())                             // 못 찾으면 빈 문자열
    {
        cout << "QR 코드를 찾지 못했습니다." << endl;
        return 0;
    }
    cout << "QR 내용: " << text << endl;
    cout << "꼭짓점 " << pts.size() << "개:" << endl;
    for (const Point2f& p : pts) cout << format("  (%.0f,%.0f)", p.x, p.y) << endl;

    // "SN=...;LOT=...;EXP=..." 를 ';' 와 '=' 로 쪼갠다
    stringstream ss(text);
    string part;
    while (getline(ss, part, ';'))
    {
        size_t eq = part.find('=');
        if (eq != string::npos)
            cout << format("  %-4s = ", part.substr(0, eq).c_str()) << part.substr(eq + 1) << endl;
    }

    Mat canvas;
    cvtColor(img, canvas, COLOR_GRAY2BGR);
    for (size_t i = 0; i < pts.size(); i++)
        line(canvas, pts[i], pts[(i + 1) % pts.size()], Scalar(0, 0, 255), 2);
    imshow("qr", canvas);
    waitKey(0);
    return 0;
}`;

  // ------------------------------------------------------------------ 퀴즈
  const QUIZ1 = [
    { q: '640×480 영상에서 64×64 템플릿으로 <code>matchTemplate</code> 을 돌리면 결과 Mat 의 크기는?', options: ['640 × 480', '576 × 416', '577 × 417', '64 × 64'], answer: 2,
      explain: '결과 크기 = <b>(W − w + 1) × (H − h + 1)</b> = (640−64+1) × (480−64+1) = <b>577 × 417</b>. 템플릿을 놓을 수 있는 위치의 개수입니다. 형식은 <code>CV_32FC1</code>(실수 1채널) 입니다.' },
    { q: '<code>minMaxLoc(res, &amp;minV, &amp;maxV, &amp;minL, &amp;maxL)</code> 의 <code>maxL</code> 은 무엇의 좌표인가?', options: ['찾은 물체의 중심', '템플릿의 <b>왼쪽 위 모서리</b>가 놓인 위치', '템플릿의 오른쪽 아래 모서리', '가장 밝은 픽셀'], answer: 1,
      explain: '<code>maxLoc</code> 은 템플릿의 <b>왼쪽 위</b>가 놓인 위치입니다. 물체 중심이 필요하면 템플릿 안의 기준점 좌표를 더합니다 — 피듀셜 템플릿은 중심이 (32, 32) 이므로 <code>maxLoc + Point(32, 32)</code>.' },
    { q: '<code>TM_SQDIFF_NORMED</code> 를 쓸 때 찾아야 하는 것은?', options: ['maxVal / maxLoc', 'minVal / minLoc', '평균값', '표준편차'], answer: 1,
      explain: 'SQDIFF 계열은 <b>차이의 제곱합</b>이므로 <b>작을수록 비슷</b>합니다 → <code>minLoc</code>. CCORR · CCOEFF 계열은 클수록 비슷해서 <code>maxLoc</code> 입니다. 모드를 바꿨는데 min/max 를 안 바꿔서 엉뚱한 곳을 찾는 실수가 흔합니다.' },
    { q: '유사도 맵 <code>res</code> 에서 점 <code>p</code> 의 점수를 읽는 올바른 코드는?', options: ['<code>res.at&lt;uchar&gt;(p.x, p.y)</code>', '<code>res.at&lt;float&gt;(p.y, p.x)</code>', '<code>res.at&lt;float&gt;(p.x, p.y)</code>', '<code>res.at&lt;double&gt;(p.y, p.x)</code>'], answer: 1,
      explain: '결과 Mat 은 <code>CV_32FC1</code> 이므로 <code>float</code>, 그리고 <code>at</code> 은 <b>(행 y, 열 x)</b> 순서입니다. <code>uchar</code> 나 <code>double</code> 로 읽으면 엉뚱한 값이 나오고(Debug 빌드에서는 assertion), (x, y) 로 바꿔 쓰면 다른 위치를 읽습니다.' },
    { q: '템플릿 매칭의 가장 큰 약점은?', options: ['컬러 영상을 못 쓴다', '물체가 <b>회전하거나 크기가 바뀌면</b> 점수가 급격히 떨어진다', '결과가 정수 좌표뿐이다', '템플릿이 크면 못 쓴다'], answer: 1,
      explain: '예제에서 같은 부품이 30° 돌아간 것만으로 0.998 → <b>0.534</b> 로 떨어졌습니다. 해결책은 ① 템플릿을 여러 각도로 돌려 여러 번 매칭 ② <b>특징점(ORB)</b> 사용 — 2교시 주제입니다.' }
  ];

  const QUIZ2 = [
    { q: 'ORB 의 기술자(descriptor) 한 개의 크기는?', options: ['8바이트', '32바이트(256비트)', '128바이트(float 32개)', '이미지 크기에 따라 다르다'], answer: 1,
      explain: 'ORB 는 <b>이진 기술자</b>라서 특징점 하나가 256비트 = <b>32바이트</b>입니다. 그래서 <code>desc</code> Mat 은 <code>특징점 개수 × 32</code> 의 <code>CV_8UC1</code> 입니다. SIFT(float 128개 = 512바이트)보다 훨씬 작고 빠릅니다.' },
    { q: 'ORB 기술자를 매칭할 때 <code>BFMatcher</code> 에 넣어야 하는 거리는?', options: ['<code>NORM_L2</code>', '<code>NORM_HAMMING</code>', '<code>NORM_L1</code>', '<code>NORM_INF</code>'], answer: 1,
      explain: '이진 기술자는 <b>다른 비트의 개수</b>(해밍 거리)로 비교합니다 → <code>NORM_HAMMING</code>. SIFT 같은 실수 기술자는 <code>NORM_L2</code> 입니다. <code>BFMatcher</code> 의 기본값이 <code>NORM_L2</code> 라서 인수를 빼먹으면 조용히 나쁜 결과가 나옵니다.' },
    { q: '<code>BFMatcher matcher(NORM_HAMMING, true);</code> 의 <code>true</code> 는?', options: ['거리가 임계값보다 작은 것만 남긴다', 'crossCheck — A→B 의 1등이 B→A 의 1등일 때만 매칭으로 인정한다', '매칭을 두 번 계산해 평균한다', '이상치를 RANSAC 으로 제거한다'], answer: 1,
      explain: '양쪽에서 서로를 <b>1등으로 지목할 때만</b> 남기므로 애매한 매칭이 줄어듭니다. 대신 <code>knnMatch</code>(k=2)+Lowe 비율 검사와는 함께 쓰지 않습니다 — 둘 중 하나를 고릅니다.' },
    { q: 'Lowe 의 비율 검사 <code>p[0].distance &lt; 0.75 * p[1].distance</code> 가 걸러 내는 것은?', options: ['거리가 먼 매칭', '1등과 2등이 <b>비슷하게 닮은</b> 애매한 매칭', '회전된 특징점', '크기가 다른 특징점'], answer: 1,
      explain: '반복 무늬(격자 · 나사산 · 같은 부품 여러 개)에서는 1등과 2등 거리가 거의 같아 <b>어느 쪽인지 알 수 없습니다</b>. 1등이 2등보다 충분히(0.75배 미만) 가까울 때만 믿습니다.' },
    { q: '<code>findHomography(src, dst, RANSAC, 3, mask)</code> 로 얻은 <code>H</code> 로 템플릿 모서리 4개를 장면 좌표로 옮기는 함수는?', options: ['<code>warpPerspective</code>', '<code>perspectiveTransform</code>', '<code>transform</code>', '<code>remap</code>'], answer: 1,
      explain: '<code>warpPerspective</code> 는 <b>영상 전체</b>를 변형하고, <code>perspectiveTransform(src, dst, H)</code> 는 <b>점 목록</b>(<code>vector&lt;Point2f&gt;</code>)을 변환합니다. 네 모서리만 옮겨 다각형을 그릴 때는 후자입니다. RANSAC 의 3 은 인라이어 판정 허용 오차(px), <code>mask</code> 의 1 의 개수가 인라이어 수입니다.' }
  ];

  CV_COURSE.addChapter({
    id: 'cv14', no: '14', title: '템플릿 매칭과 특징점 (ORB)', subtitle: '모양 그대로 찾기 → 회전 · 크기가 바뀌어도 찾기',
    summary: '직선 · 원이 아닌 <b>임의의 모양</b>을 찾는 두 가지 방법을 배웁니다. <code>matchTemplate</code> 은 작은 그림(템플릿)을 영상 위에서 슬라이딩하며 유사도 맵을 만들고 <code>minMaxLoc</code> 으로 최고점을 찾습니다 — 피듀셜 마크 정렬과 7-세그먼트 숫자 판독에 바로 씁니다. 회전 · 크기 변화에 약한 한계를 <b>특징점(<code>Ptr&lt;ORB&gt;</code>) + <code>BFMatcher</code> + <code>findHomography</code></b> 로 넘어서고, 보너스로 QR 코드까지 읽습니다.',
    goals: ['템플릿 매칭의 원리와 결과 Mat(유사도 맵)의 의미를 설명할 수 있다', 'matchTemplate 모드별 min/max 사용법을 구분하고 다중 검출(임계값 + NMS)을 구현할 수 있다', '템플릿 매칭으로 셀 단위 숫자 판독(OCR)을 만들 수 있다', 'ORB 특징점 · 기술자 · 해밍 거리 매칭 · 호모그래피로 회전된 부품의 위치를 찾을 수 있다'],
    sections: [
      {
        id: 'cv14-1', title: '템플릿 매칭: 모양 그대로 찾기', minutes: 50,
        goals: ['matchTemplate 의 슬라이딩 원리와 결과 크기 (W−w+1)를 설명할 수 있다', '6가지 모드의 차이와 min/max 선택을 안다', '임계값 + NMS 로 같은 모양 여러 개를 찾을 수 있다', '셀 단위 템플릿 매칭으로 7-세그먼트 숫자를 판독할 수 있다'],
        flow: [['도입: 임의의 모양 찾기', 5], ['원리 · 모드 · minMaxLoc', 15], ['다중 검출 · 숫자 판독', 20], ['한계와 정리', 10]],
        content: [
          { type: 'h', text: '문제: 직선도 원도 아닌 "이 모양" 을 찾고 싶다' },
          { type: 'p', html: '13차시의 허프 변환은 <b>직선과 원</b>만 찾습니다. 그런데 현장에서 찾아야 하는 것은 십자 마크, 피듀셜, 로고, 숫자, 특정 부품처럼 <b>임의의 모양</b>입니다. 가장 단순하고 확실한 방법은 "찾고 싶은 모양의 작은 사진(<b>템플릿</b>)을 만들어 두고, 영상 위를 훑으며 가장 닮은 곳을 찾는" 것입니다.' },
          { type: 'figure', html: FIG_SLIDE, caption: '그림 1. 템플릿을 1픽셀씩 옮기며 유사도를 계산 → 유사도 맵. 맵의 최고점이 찾은 위치 (템플릿의 왼쪽 위 기준)' },
          { type: 'table', head: ['모드 (<code>TemplateMatchModes</code>)', '수식 감각', '찾을 값', '특징'], rows: [
            ['<code>TM_SQDIFF</code>', 'Σ(T − I)²  차이의 제곱합', '<b>최소</b>', '값이 크고 밝기에 민감'],
            ['<code>TM_SQDIFF_NORMED</code>', '위를 0~1 로 정규화', '<b>최소</b>', '0 = 완전 일치'],
            ['<code>TM_CCORR</code>', 'Σ(T × I)  곱의 합', '최대', '밝은 영역에서 무조건 커짐 → 위험'],
            ['<code>TM_CCORR_NORMED</code>', '위를 0~1 로 정규화', '최대', '밝기 <b>배율</b> 변화에 강함'],
            ['<code>TM_CCOEFF</code>', '평균을 뺀 뒤 곱의 합', '최대', '밝기 <b>오프셋</b>에 강함'],
            ['<code>TM_CCOEFF_NORMED</code>', '위를 −1~1 로 정규화', '최대', '<b>가장 무난 — 기본으로 이것</b>']
          ], caption: '표 1. 6가지 모드 — SQDIFF 계열만 "작을수록 비슷" 이라는 것이 핵심 (Python: cv2.TM_CCOEFF_NORMED …)' },
          { type: 'h', text: '기본: 피듀셜 마크 한 개 찾기' },
          { type: 'image', src: 'images/fiducial_board.png', caption: '예제 이미지: PCB 위 원형 피듀셜 3개 (중심 64,56 / 576,60 / 70,420) + 방해 패드 2개', width: 460 },
          { type: 'code', title: '예제 1: matchTemplate + minMaxLoc', code: EX_TM,
            desc: '결과 Mat 은 <b>577 × 417 = (640−64+1) × (480−64+1)</b> 의 <code>CV_32FC1</code> 입니다. <code>minMaxLoc</code> 은 결과를 <b>포인터 인수</b>로 받으므로 변수 앞에 <code>&amp;</code> 를 붙입니다. 최고 점수 0.993 이 (32, 24) 에서 나왔고, 템플릿 안 피듀셜 중심이 (32, 32) 이므로 실제 중심은 <b>(64, 56)</b> — IMAGES.md 정답과 일치합니다. <code>Point</code> 끼리는 <code>+</code> 로 더할 수 있고, <code>Rect(maxLoc, tmpl.size())</code> 처럼 왼쪽 위 + 크기로 사각형을 만들 수 있습니다. 유사도 맵은 실수 Mat 이라 <code>normalize(…, NORM_MINMAX, CV_8U)</code> 로 0~255 로 펴서 봅니다 — 맵에서 밝은 점 3개가 보이죠?',
            expect: '기판 640x480, 템플릿 64x64\n유사도 맵: 577 x 417 (CV_32FC1)\n= (640-64+1) x (480-64+1) = 577 x 417\n최대 점수 0.993 @ 좌상단 (32,24)\n최소 점수 -0.329 @ (132,334)\n피듀셜 중심 = 좌상단 + 템플릿 중심 = (64,56)  (정답 64,56)' },
          { type: 'callout', kind: 'warn', title: '⚠️ maxLoc 은 중심이 아니다 · 필요 없는 값은 nullptr', html: '<code>minMaxLoc</code> 이 주는 위치는 <b>템플릿의 왼쪽 위 모서리</b>가 놓인 자리입니다. 물체 중심을 원하면 <b>템플릿 안에서의 기준점 좌표</b>를 더해 주세요. 사각형은 <code>Rect(maxLoc, tmpl.size())</code> 가 그대로 맞습니다.<br>또 하나: 네 결과를 다 받을 필요는 없습니다. <code>minMaxLoc(res, nullptr, &amp;maxVal, nullptr, &amp;maxLoc);</code> 처럼 필요 없는 자리에 <b><code>nullptr</code></b>(또는 <code>0</code>)를 넣으면 됩니다. Python 은 <code>minV, maxV, minL, maxL = cv2.minMaxLoc(res)</code> 로 네 값을 한꺼번에 돌려받습니다.' },
          { type: 'code', title: '예제 2: 6가지 모드 비교 — min 인가 max 인가', code: EX_MODES,
            desc: '정답 위치는 (32, 24) 입니다. <code>TM_SQDIFF</code> · <code>TM_SQDIFF_NORMED</code> 는 <b>최소값 위치</b>가 정답이고, <code>TM_CCOEFF_NORMED</code> · <code>TM_CCORR_NORMED</code> 는 <b>최대값 위치</b>가 정답입니다. 눈여겨볼 것은 <code>TM_CCORR</code>(정규화 없음)와 <code>TM_CCOEFF</code>(정규화 없음)가 <b>엉뚱한 곳</b>을 최대로 꼽는다는 점 — 정규화하지 않은 모드는 밝은 영역에서 값이 그냥 커지기 때문입니다. 그래서 실무 기본은 <b>TM_CCOEFF_NORMED</b> 입니다. 모드 상수가 0~5 의 정수라서 <code>for</code> 로 돌고 이름 배열의 인덱스로 썼습니다.',
            expect: '모드                최소값 위치    최대값 위치    찾는 쪽\nTM_SQDIFF           ( 32, 24)      (282,139)      최소(minLoc)\nTM_SQDIFF_NORMED    ( 32, 24)      (354,139)      최소(minLoc)\nTM_CCORR            ( 41,  9)      (300,133)      최대(maxLoc)\nTM_CCORR_NORMED     ( 45, 12)      ( 32, 24)      최대(maxLoc)\nTM_CCOEFF           (354,139)      (544, 28)      최대(maxLoc)\nTM_CCOEFF_NORMED    (132,334)      ( 32, 24)      최대(maxLoc)\n정답 피듀셜 F1 좌상단 = (32,24)' },
          { type: 'h', text: '다중 검출: 같은 모양 여러 개 찾기' },
          { type: 'p', html: '<code>minMaxLoc</code> 은 최고점 <b>하나</b>만 줍니다. 여러 개를 찾으려면 ① 유사도 맵을 <b>임계값</b>으로 걸러 후보를 모으고 ② 한 물체에서 여러 후보가 나오므로 <b>NMS(Non-Maximum Suppression, 비최대 억제)</b> 로 정리합니다. 가장 간단한 NMS 는 "점수 높은 순으로 보면서 이미 뽑은 것과 가까우면 버리기" 입니다.' },
          { type: 'figure', html: FIG_NMS, caption: '그림 2. 임계값 → 후보 픽셀 여러 개 → 점수순 정렬 → 가까운 것 버리기(NMS) → 물체당 1개' },
          { type: 'code', title: '예제 3: 임계값 0.95 + 간단 NMS → 피듀셜 3개', code: EX_MULTI,
            desc: '0.95 이상 픽셀이 15개 나오지만 NMS 로 <b>3개</b>만 남습니다 — 세 피듀셜 중심 (64,56) · (576,60) · (70,420) 모두 정답입니다. 임계값을 0.85 로 낮추면 <b>방해 패드 2개</b>(점수 0.898 · 0.884)까지 섞입니다. 이렇게 <b>진짜와 가짜의 점수 사이</b>(0.98 vs 0.90)에 임계값을 두는 것이 실무의 요령입니다. <code>threshold</code> 는 <code>float</code> Mat 에도 동작하지만 결과도 <code>CV_32F</code> 라서, <code>findNonZero</code> 에 넣기 전에 <code>convertTo(…, CV_8U)</code> 로 8비트로 바꿨습니다. 점수는 <code>score.at&lt;float&gt;(y, x)</code> — 유사도 맵은 <b>float</b> Mat 이고 <b>(행, 열)</b> 순서임을 잊지 마세요.',
            expect: '임계값 0.95\n  후보 픽셀 15개 → NMS 후 3개\n  좌상단 (32,24) 점수 0.993 → 중심 (64,56)\n  좌상단 (544,28) 점수 0.988 → 중심 (576,60)\n  좌상단 (38,388) 점수 0.980 → 중심 (70,420)\n임계값 0.85 (방해 패드까지 섞인다)\n  후보 픽셀 77개 → NMS 후 5개\n  (64,56) 점수 0.993\n  (576,60) 점수 0.988\n  (70,420) 점수 0.980\n  (250,110) 점수 0.898\n  (380,420) 점수 0.884' },
          { type: 'h', text: '템플릿 만들기: 영상에서 오려 내기' },
          { type: 'code', title: '예제 4: 기판에서 직접 템플릿을 오려 매칭하기', code: EX_CROP,
            desc: '템플릿 파일이 없으면 <b>양품 영상에서 ROI 로 오려 내면</b> 됩니다. <code>board(roi)</code> 는 원본과 메모리를 공유하는 <b>헤더</b>일 뿐이므로(03차시), 템플릿으로 오래 쓸 것이면 <code>clone()</code> 으로 독립 복사본을 만듭니다. 자기 자신과는 당연히 1.000 이고, 다른 두 피듀셜도 0.99 · 0.986 으로 높지만 방해 패드는 0.86 · 0.84 로 확실히 낮습니다 — 실제 기판에서 오린 템플릿은 배경 무늬까지 같아서 오히려 구별이 더 잘 되기도 합니다. <code>imwrite</code> 로 저장한 파일은 📁 작업 폴더에서 내려받을 수 있습니다.',
            expect: '자기 자신: 점수 1.000 @ (32,24)\n  F2 피듀셜 (576,60): 0.990\n  F3 피듀셜 (70,420): 0.986\n  방해 패드 (250,110): 0.857\n  방해 패드 (380,420): 0.840' },
          { type: 'callout', kind: 'vs', title: 'Visual Studio 에서는 — selectROI 로 템플릿 지정', html: '로컬 PC 에서는 <code>Rect roi = selectROI("창 이름", img);</code> 한 줄로 <b>마우스 드래그</b>로 영역을 고를 수 있습니다(Enter 로 확정, c 로 취소). 고른 영역을 <code>clone()</code> 해 <code>imwrite</code> 로 저장해 두면 다음 실행부터는 파일을 읽어 씁니다 — 장비의 "티칭(teaching)" 기능이 바로 이것입니다. 브라우저에서는 <code>selectROI</code> 가 동작하지 않으므로 예제 4 처럼 좌표를 직접 줍니다. <code>cout &lt;&lt; roi</code> 는 <code>[64 x 64 from (32, 24)]</code> 형식으로 출력됩니다.' },
          { type: 'code', title: '추가: selectROI 로 템플릿 고르기 (로컬 전용)', code: EX_SELECT, run: false, local: true, file: 'main.cpp',
            desc: '같은 동작의 브라우저 버전이 예제 4 입니다. <code>roi.empty()</code> 는 폭이나 높이가 0 이면 참 — 사용자가 취소한 경우를 꼭 처리하세요.' },
          { type: 'h', text: '응용: 7-세그먼트 숫자 판독 (템플릿 OCR)' },
          { type: 'image', src: 'images/seven_segment.png', caption: '예제 이미지: 계측기 표시기 8자리 "20480735" (6° 기울임, 꺼진 세그먼트도 희미하게 보인다). 자리 i 의 셀 = (64 + 64·i, 60, 64, 120)', width: 560 },
          { type: 'p', html: '글자 위치가 <b>고정된 격자</b>라면 굳이 영상 전체를 훑을 필요가 없습니다. 자리마다 셀을 <b>ROI 로 잘라내고</b> 숫자 0~9 템플릿과 <b>같은 크기로</b> 비교하면 됩니다. 크기가 같으면 결과 Mat 이 1×1 이 되어 점수 하나만 나옵니다 — 가장 점수가 높은 숫자가 답입니다.' },
          { type: 'code', title: '예제 5: 셀 × 숫자 템플릿 10개 → "20480735" 판독', code: EX_OCR,
            desc: '8자리 × 10개 = 80번 매칭하지만 셀이 64×120 으로 작아 순식간에 끝납니다. ROI(<code>disp(Rect(…))</code>)는 복사하지 않으므로 반복 안에서 만들어도 부담이 없습니다. 모든 자리의 점수가 <b>0.998 이상</b>으로 아주 확실합니다 — 표시기의 기하와 템플릿 띠의 기하가 같기 때문입니다. 실제 장비에서는 표시기 위치를 먼저 찾고(피듀셜 · 윤곽선), 기울기를 보정한 뒤(11차시) 이 방법을 쓰면 튼튼한 계측값 자동 수집기가 됩니다.',
            expect: '표시기 640x240, 숫자 템플릿 띠 640x120\n  0번째 자리 = 2 (점수 0.998)\n  1번째 자리 = 0 (점수 0.999)\n  2번째 자리 = 4 (점수 0.998)\n  3번째 자리 = 8 (점수 0.999)\n  4번째 자리 = 0 (점수 0.999)\n  5번째 자리 = 7 (점수 0.998)\n  6번째 자리 = 3 (점수 0.998)\n  7번째 자리 = 5 (점수 0.998)\n판독 결과: 20480735  (정답 20480735)' },
          { type: 'callout', kind: 'tip', title: '점수에 "확신도" 문턱을 두자', html: '최고 점수만 보고 답을 내면 <b>10개 중 아무거나</b> 고르게 됩니다. 실무에서는 ① 최고 점수가 0.9 미만이면 "판독 실패", ② 1등과 2등 점수 차이가 0.05 미만이면 "애매함" 으로 처리해 <b>사람에게 넘깁니다</b>. 틀린 값을 자신 있게 보고하는 것보다 "모르겠다" 가 훨씬 안전합니다.' },
          { type: 'h', text: '한계: 회전과 크기 변화' },
          { type: 'code', title: '예제 6: 같은 부품인데 30° 돌면 점수가 반토막', code: EX_LIMIT,
            desc: '<code>parts_scene.png</code> 에는 <b>같은 L 브래킷 6개</b>가 서로 다른 각도로 놓여 있습니다. 0° 부품 #1 은 0.998 로 완벽하게 찾지만, <b>30° 만 돌아간 #2 는 0.534</b>, 90° 인 #4 는 0.259 까지 떨어집니다. 템플릿 매칭은 <b>픽셀을 그대로 겹쳐 비교</b>하기 때문입니다. 해결책은 두 가지: ① 템플릿을 여러 각도로 돌려 여러 번 매칭(실습 2) ② <b>특징점 매칭</b>(2교시).',
            expect: '최고 점수 0.998 @ (60,60) → 기준점 (120,110)\n부품   회전각   그 자리의 최고 점수\n  #1      0도      0.998\n  #2     30도      0.534\n  #3    -45도      0.430\n  #4     90도      0.259\n  #5    160도      0.180\n  #6   -120도      0.152\n→ 0도 부품만 찾고, 30도만 돌아가도 0.53 으로 떨어진다' },
          { type: 'callout', kind: 'field', title: '현장 노트 — 템플릿 매칭을 쓸 때 / 안 쓸 때', html: '<ul><li><b>잘 맞는 상황</b>: 조명이 일정하고, 물체 자세가 거의 고정이며(±2° 이내), 배율도 고정. 대표 예가 <b>피듀셜 정렬</b>과 <b>고정 격자 OCR</b> 입니다. 단순하고 빠르고 디버깅이 쉬워 지금도 가장 많이 쓰입니다.</li><li><b>안 맞는 상황</b>: 물체가 자유롭게 회전 · 거리 변화 · 일부 가림. 이때는 특징점(ORB)이나 학습 기반 방법을 씁니다.</li><li><b>템플릿 만들기</b>: 실제 장비에서 찍은 <b>양품</b> 영상에서 오려 냅니다. 템플릿에 배경이 많이 들어가면 배경이 바뀔 때 점수가 떨어지므로 <b>물체에 꼭 맞게</b> 자르세요.</li><li><b>속도</b>: 전체 영상을 훑지 말고 <b>ROI</b> 로 좁히세요. 피듀셜은 대략 위치를 아니까 ±30 px 창만 보면 됩니다 — 수십 배 빨라집니다. <code>matchTemplate(board(searchRect), tmpl, …)</code> 처럼 ROI 를 바로 넘기면 복사도 없습니다(결과 좌표에 <code>searchRect.tl()</code> 을 더하는 것을 잊지 마세요).</li><li><b>서브픽셀</b>: 최고점 좌우 3점으로 포물선을 맞추면 0.1 px 수준까지 위치를 세밀하게 낼 수 있습니다.</li></ul>' },
          { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 · 오개념 지도', html: '<ul><li><b>오개념 1</b>: "결과 Mat 이 원본과 같은 크기" → (W−w+1) × (H−h+1). 칠판에 작은 격자(6×5 영상, 3×3 템플릿)를 그려 4×3 이 나오는 것을 손으로 세어 보게 하면 확실히 이해합니다.</li><li><b>오개념 2</b>: "점수가 높으면 무조건 그 물체" → 방해 패드가 0.90 을 받는 것을 보여 주세요. <b>임계값은 진짜와 가짜 사이</b>에 둡니다.</li><li><b>오개념 3</b>: TM_SQDIFF 인데 maxLoc 을 쓰는 실수. 예제 2 의 표를 그대로 보여 주고 "모드를 바꾸면 min/max 도 바꾼다" 를 반복합니다.</li><li><b>C++ 실수</b>: <code>minMaxLoc(res, minV, maxV)</code> 처럼 <code>&amp;</code> 를 빼먹어 컴파일 오류, <code>res.at&lt;uchar&gt;</code> 로 읽어 이상한 값 — 결과 형식(<code>CV_32FC1</code>)을 <code>typeToString</code> 으로 확인하는 습관을 들이게 합니다.</li><li>💬 발문: “피듀셜 3개를 찾으면 무엇을 계산할 수 있을까?” — 기판의 이동량 · 회전량. “세 점이면 배율까지” 도 유도해 보세요.</li><li>시간 관리: 예제 1~3 을 꼭 하고, 예제 5(OCR)는 시연 후 코드를 읽히는 정도로도 충분합니다. 예제 6 은 2교시 동기부여이므로 반드시 실행해서 점수 표를 보여 주세요.</li></ul>' }
        ],
        practice: [
          {
            title: 'TM_SQDIFF_NORMED 로 찾아보기 — min/max 바꿔 쓰기', level: 1,
            desc: '예제 1 과 같은 피듀셜을 <code>TM_SQDIFF_NORMED</code> 로 찾으세요. 이 모드는 <b>작을수록 비슷</b>하므로 <code>maxLoc</code> 이 아니라 <b><code>minLoc</code></b> 을 써야 합니다. 최소 점수 · 그 위치 · 피듀셜 중심을 출력하고, <b>최대 점수 위치</b>(가장 안 닮은 곳)도 함께 출력해 비교해 보세요.',
            hint: '<code>minMaxLoc(res, &amp;minVal, &amp;maxVal, &amp;minLoc, &amp;maxLoc);</code> 네 개를 모두 받아 출력하면 차이가 한눈에 보입니다. 점수는 0 에 가까울수록 완전 일치이므로 <code>%.4f</code> 로 자릿수를 늘려 찍으세요.',
            expect: 'TM_SQDIFF_NORMED 는 작을수록 비슷 → minLoc 을 쓴다\n최소 점수 0.0029 @ (32,24) → 중심 (64,56)\n최대 점수 0.5100 @ (354,139) = 가장 안 닮은 곳',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat board = imread("images/fiducial_board.png", IMREAD_GRAYSCALE);
    Mat tmpl = imread("images/fiducial_template.png", IMREAD_GRAYSCALE);
    Mat res;
    // TODO: TM_SQDIFF_NORMED 로 matchTemplate 하세요

    // TODO: minMaxLoc 으로 네 값을 받아 최소 점수 · 위치 · 중심을 출력하세요
    //       (중심 = 위치 + (32, 32))

    imshow("board", board);
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat board = imread("images/fiducial_board.png", IMREAD_GRAYSCALE);
    Mat tmpl = imread("images/fiducial_template.png", IMREAD_GRAYSCALE);
    Mat res;
    matchTemplate(board, tmpl, res, TM_SQDIFF_NORMED);
    double minVal, maxVal;
    Point minLoc, maxLoc;
    minMaxLoc(res, &minVal, &maxVal, &minLoc, &maxLoc);

    cout << "TM_SQDIFF_NORMED 는 작을수록 비슷 → minLoc 을 쓴다" << endl;
    cout << format("최소 점수 %.4f @ (%d,%d) → 중심 (%d,%d)", minVal, minLoc.x, minLoc.y, minLoc.x + 32, minLoc.y + 32) << endl;
    cout << format("최대 점수 %.4f @ (%d,%d) = 가장 안 닮은 곳", maxVal, maxLoc.x, maxLoc.y) << endl;

    Mat canvas;
    cvtColor(board, canvas, COLOR_GRAY2BGR);
    rectangle(canvas, Rect(minLoc, tmpl.size()), Scalar(0, 255, 0), 2);
    imshow("found", canvas);
    waitKey(0);
    return 0;
}`
          },
          {
            title: '회전 템플릿 매칭 — 여러 자세의 부품 찾기', level: 2,
            desc: '템플릿 매칭이 회전에 약하다면, <b>템플릿을 돌려서 여러 번</b> 매칭하면 됩니다. <code>part_template.png</code> 에 여백 30 px 을 붙이고(180 × 160, 기준점 (90, 80)) <code>getRotationMatrix2D</code> + <code>warpAffine</code> 으로 −60° ~ 180° 를 30° 간격으로 돌려 가며 <code>parts_scene.png</code> 에 매칭하고, 각 각도의 최고 점수와 기준점 위치를 출력하세요.',
            hint: '회전 행렬은 <code>getRotationMatrix2D(Point2f(pad.cols / 2.f, pad.rows / 2.f), ang, 1)</code>, 회전은 <code>warpAffine(pad, rot, M, pad.size(), INTER_LINEAR, BORDER_REPLICATE)</code>. 기준점은 <code>maxLoc + Point(90, 80)</code> 입니다. 정답 자세는 0° → (120,110), 30° → (330,100), 90° → (150,340) 입니다 — 30° 간격이므로 −45° · 160° · −120° 부품은 못 찾습니다.',
            expect: '여백 붙인 템플릿 180 x 160, 기준점 (90,80)\n  회전  -60도: 최고 점수 0.750 @ 기준점 (521,119)\n  회전  -30도: 최고 점수 0.756 @ 기준점 (518,122)\n  회전    0도: 최고 점수 0.994 @ 기준점 (120,110)\n  회전   30도: 최고 점수 0.989 @ 기준점 (330,100)\n  회전   60도: 최고 점수 0.616 @ 기준점 (146,335)\n  회전   90도: 최고 점수 0.993 @ 기준점 (150,340)\n  회전  120도: 최고 점수 0.619 @ 기준점 (156,340)\n  회전  150도: 최고 점수 0.838 @ 기준점 (360,330)\n  회전  180도: 최고 점수 0.710 @ 기준점 (361,325)',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat scene = imread("images/parts_scene.png", IMREAD_GRAYSCALE);
    Mat t0 = imread("images/part_template.png", IMREAD_GRAYSCALE);
    Mat pad;
    copyMakeBorder(t0, pad, 30, 30, 30, 30, BORDER_REPLICATE);   // 180 x 160
    cout << "여백 붙인 템플릿 " << pad.cols << " x " << pad.rows << ", 기준점 (90,80)" << endl;

    for (int ang = -60; ang <= 180; ang += 30)
    {
        // TODO: pad 를 ang 도 회전시킨 rot 을 만드세요 (getRotationMatrix2D + warpAffine)
        // TODO: scene 에 rot 을 matchTemplate(TM_CCOEFF_NORMED) 하고 minMaxLoc 으로 최고 점수와 위치를 구하세요
        // TODO: 각도 · 점수 · 기준점(위치 + (90,80)) 을 출력하세요
    }
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat scene = imread("images/parts_scene.png", IMREAD_GRAYSCALE);
    Mat t0 = imread("images/part_template.png", IMREAD_GRAYSCALE);
    Mat pad;
    copyMakeBorder(t0, pad, 30, 30, 30, 30, BORDER_REPLICATE);
    cout << "여백 붙인 템플릿 " << pad.cols << " x " << pad.rows << ", 기준점 (90,80)" << endl;

    for (int ang = -60; ang <= 180; ang += 30)
    {
        Mat M = getRotationMatrix2D(Point2f(pad.cols / 2.f, pad.rows / 2.f), ang, 1);
        Mat rot;
        warpAffine(pad, rot, M, pad.size(), INTER_LINEAR, BORDER_REPLICATE);
        Mat res;
        matchTemplate(scene, rot, res, TM_CCOEFF_NORMED);
        double mx;
        Point px;
        minMaxLoc(res, nullptr, &mx, nullptr, &px);
        Point refPt = px + Point(90, 80);
        cout << format("  회전 %4d도: 최고 점수 %.3f @ 기준점 (%d,%d)", ang, mx, refPt.x, refPt.y) << endl;
    }
    return 0;
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: '템플릿 매칭: 모양 그대로 찾기', subtitle: 'matchTemplate · minMaxLoc · 다중 검출 · 숫자 판독', notes: '<p>13차시 복습: 허프는 <b>직선과 원</b>만 찾는다. 💬 “십자 마크나 로고를 찾으려면?” — 학생들에게 방법을 상상해 보게 하면 대개 “비교해 본다” 가 나옵니다. 그것이 바로 템플릿 매칭이라고 이어 갑니다. (3분)</p>' },
          { layout: 'image', title: '오늘의 재료 ①: 피듀셜 마크', src: 'images/fiducial_board.png', caption: '피듀셜 3개 (64,56) (576,60) (70,420) + 비슷하게 생긴 방해 패드 2개', notes: '<p>피듀셜(기준 마크)이 무엇인지 설명합니다: PCB · 디스플레이 공정에서 <b>기판의 위치와 회전을 알아내는 기준점</b>. 실제로 SMT 장비가 부품을 놓기 전에 가장 먼저 하는 일입니다. 💬 “방해 패드와 어떻게 구별할까?” — 점수 차이. (3분)</p>' },
          { layout: 'diagram', title: '슬라이딩 + 유사도 맵', html: FIG_SLIDE, caption: '템플릿을 1픽셀씩 옮기며 점수 계산 → (W−w+1) × (H−h+1) 크기의 CV_32FC1 유사도 맵', notes: '<p>칠판에 6×5 영상, 3×3 템플릿을 그려 놓을 수 있는 위치가 4×3 = 12 개인 것을 손으로 세어 보게 합니다. 결과 Mat 이 원본보다 작다는 것이 첫 번째 놀람 포인트. 두 번째는 <b>maxLoc 이 중심이 아니라 왼쪽 위</b>. (8분)</p>' },
          { layout: 'code', title: 'matchTemplate + minMaxLoc', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat board = imread("images/fiducial_board.png", IMREAD_GRAYSCALE);
    Mat tmpl = imread("images/fiducial_template.png", IMREAD_GRAYSCALE);
    Mat res;
    matchTemplate(board, tmpl, res, TM_CCOEFF_NORMED);
    cout << "유사도 맵 " << res.cols << " x " << res.rows << " (" << typeToString(res.type()) << ")" << endl;
    double maxVal;
    Point maxLoc;
    minMaxLoc(res, nullptr, &maxVal, nullptr, &maxLoc);
    cout << format("점수 %.3f @ (%d,%d), 중심 (%d,%d)", maxVal, maxLoc.x, maxLoc.y, maxLoc.x + 32, maxLoc.y + 32) << endl;

    Mat canvas;
    cvtColor(board, canvas, COLOR_GRAY2BGR);
    rectangle(canvas, Rect(maxLoc, tmpl.size()), Scalar(0, 0, 255), 2);
    imshow("found", canvas);
    waitKey(0);
    return 0;
}`, points: ['결과 577 × 417 = (640−64+1) × (480−64+1), <code>CV_32FC1</code>', '<code>minMaxLoc</code> 은 <b>포인터</b>로 받는다 — 필요 없는 값은 <code>nullptr</code>', '점수 0.993 @ (32,24) → 중심 <b>(64,56)</b>', '<code>Rect(maxLoc, tmpl.size())</code> = 왼쪽 위 + 크기'], notes: '<p>C++ 에서 결과를 포인터로 받는 이유(여러 값을 한 번에 돌려주기 위해)를 짧게 설명하고, <code>&amp;</code> 를 빼먹으면 컴파일 오류가 나는 것을 한 번 보여 줍니다. 실행 후 사각형이 정확히 피듀셜을 감싸는지 확인시키고, <code>+32</code> 를 빼면 표시가 어긋나는 것도 보여 주세요. (8분)</p>' },
          { layout: 'table', title: '6가지 모드 — min 이냐 max 냐', head: ['모드', '찾을 값', '특징'], rows: [
            ['<code>TM_SQDIFF</code> / <code>TM_SQDIFF_NORMED</code>', '<b>최소</b>', '차이의 제곱합 — 0 = 완전 일치'],
            ['<code>TM_CCORR</code>', '최대', '정규화 없음 → 밝은 곳이 무조건 큼 (위험)'],
            ['<code>TM_CCORR_NORMED</code>', '최대', '밝기 배율 변화에 강함'],
            ['<code>TM_CCOEFF</code>', '최대', '정규화 없음 → 엉뚱한 곳을 꼽기도'],
            ['<code>TM_CCOEFF_NORMED</code>', '최대', '<b>기본으로 쓰는 모드</b>']
          ], lead: '실제 실행 결과: 정답 (32,24) 를 맞히는 모드는 SQDIFF · SQDIFF_NORMED(최소) 와 CCORR_NORMED · CCOEFF_NORMED(최대)', notes: '<p>정규화 없는 <code>TM_CCORR</code> · <code>TM_CCOEFF</code> 가 <b>틀린 답</b>을 준 실제 출력(본문 예제 2)을 보여 주는 것이 핵심입니다. 💬 “왜 밝은 곳에서 CCORR 가 커질까?” — 곱의 합이니 밝으면 무조건 커진다. 결론: <b>NORMED 붙은 것을 쓰자</b>. (5분)</p>' },
          { layout: 'diagram', title: '여러 개 찾기: 임계값 + NMS', html: FIG_NMS, caption: '한 물체 주변에서 후보가 여러 개 → 점수 높은 순으로 보며 가까운 것은 버린다', notes: '<p>NMS 가 왜 필요한지 먼저 그림으로 이해시킵니다. 봉우리 주변은 점수가 완만하게 높아서 0.95 를 넘는 픽셀이 15개나 됩니다. 💬 “minGap 을 얼마로 할까?” — 물체 크기의 절반 정도(피듀셜 64 → 32). (3분)</p>' },
          { layout: 'code', title: '다중 검출: 임계값 + 간단 NMS', code: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;
int main()
{
    Mat board = imread("images/fiducial_board.png", IMREAD_GRAYSCALE);
    Mat tmpl = imread("images/fiducial_template.png", IMREAD_GRAYSCALE);
    Mat res, m, m8;
    matchTemplate(board, tmpl, res, TM_CCOEFF_NORMED);
    threshold(res, m, 0.95, 255, THRESH_BINARY);
    m.convertTo(m8, CV_8U);                              // findNonZero 는 8비트
    vector<Point> cand, keep;
    findNonZero(m8, cand);
    sort(cand.begin(), cand.end(), [&](Point a, Point b) { return res.at<float>(a.y, a.x) > res.at<float>(b.y, b.x); });
    for (const Point& p : cand)                          // 이미 뽑은 것과 가까우면 버린다
        if (none_of(keep.begin(), keep.end(), [&](const Point& k) { return abs(k.x - p.x) < 32 && abs(k.y - p.y) < 32; }))
            keep.push_back(p);
    cout << "후보 " << cand.size() << "개 → NMS 후 " << keep.size() << "개" << endl;
    return 0;
}`, points: ['<code>findNonZero</code> → 0 이 아닌 픽셀 좌표 <code>vector&lt;Point&gt;</code>', '<code>sort</code> + 람다로 점수 <b>높은 순</b>', '가까운 것은 버림 = NMS → 후보 15개 → <b>3개</b>', '점수는 <code>res.at&lt;float&gt;(y, x)</code>'], notes: '<p>NMS 없이 그냥 찍으면 15개가 나오는 것을 먼저 보여 주고 필요성을 느끼게 합니다. 임계값 0.85 로 내리면 방해 패드(0.898 · 0.884)가 섞이는 것도 실행해 보여 주세요. 💬 “임계값을 얼마로 둘까?” — 진짜(0.98)와 가짜(0.90) <b>사이</b>. 람다의 <code>[&amp;]</code> 가 <code>res</code> 를 참조로 캡처한다는 점도 짚습니다. (8분)</p>' },
          { layout: 'image', title: '오늘의 재료 ②: 7-세그먼트 표시기', src: 'images/seven_segment.png', caption: '"20480735" — 자리 i 의 셀 = (64 + 64·i, 60, 64, 120), 숫자 템플릿은 digits_templates.png', notes: '<p>계측기 값을 사람이 손으로 적는 현장이 아직 많다는 이야기로 동기를 만듭니다. 💬 “글자 위치가 고정이면 영상 전체를 훑을 필요가 있을까?” — 없다. 셀만 잘라 비교. 꺼진 세그먼트도 희미하게 보이는 점(≈52)이 왜 어려움인지도 짚어 줍니다. (3분)</p>' },
          { layout: 'code', title: '셀 단위 템플릿 OCR', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;
int main()
{
    Mat disp = imread("images/seven_segment.png", IMREAD_GRAYSCALE);
    Mat tpl = imread("images/digits_templates.png", IMREAD_GRAYSCALE), r;
    string result;
    for (int i = 0; i < 8; i++)                                  // 8자리
    {
        Mat cell = disp(Rect(64 + 64 * i, 60, 64, 120));
        int best = -1; double top = -2, mx;                      // 가장 점수 높은 숫자를 고른다
        for (int d = 0; d <= 9; d++)
        {
            matchTemplate(cell, tpl(Rect(64 * d, 0, 64, 120)), r, TM_CCOEFF_NORMED);
            minMaxLoc(r, nullptr, &mx);
            if (mx > top) { top = mx; best = d; }
        }
        result += to_string(best);
    }
    cout << "판독: " << result << endl;
    return 0;
}`, points: ['셀과 템플릿 크기가 같으면 결과 Mat 은 <b>1×1</b>', 'ROI <code>disp(Rect(…))</code> 는 복사 없음 → 반복 안에서도 가볍다', '모든 자리 점수 0.998 이상 → <b>20480735</b>'], notes: '<p>이중 반복 구조를 먼저 말로 정리합니다: “자리마다, 숫자 10개와 비교해 최고점을 고른다.” 실행 후 <b>확신도 문턱</b> 이야기를 꼭 얹습니다: 점수가 0.9 미만이면 실패 처리, 1 · 2등 차이가 작으면 애매함 처리. 💬 “표시기가 기울거나 흔들리면?” — 먼저 정렬 보정(11차시). (8분)</p>' },
          { layout: 'code', title: '한계: 30° 돌면 0.53', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat scene = imread("images/parts_scene.png", IMREAD_GRAYSCALE);
    Mat tmpl = imread("images/part_template.png", IMREAD_GRAYSCALE);
    Mat res;
    matchTemplate(scene, tmpl, res, TM_CCOEFF_NORMED);
    double mx;
    Point px;
    minMaxLoc(res, nullptr, &mx, nullptr, &px);
    cout << format("최고 %.3f @ 기준점 (%d,%d)", mx, px.x + 60, px.y + 50) << endl;

    // 부품 #2 (30도) · #4 (90도) 자리의 점수 — at<float>(행 y, 열 x)
    cout << format("#2(30도) 자리 점수 %.3f", res.at<float>(50, 270)) << endl;
    cout << format("#4(90도) 자리 점수 %.3f", res.at<float>(290, 90)) << endl;
    imshow("scene", scene);
    waitKey(0);
    return 0;
}`, points: ['같은 L 브래킷 6개가 다른 각도로 놓여 있다', '0° → 0.998 / 30° → 0.53 / 90° → 0.26', '픽셀을 그대로 겹쳐 비교하므로 회전에 무력'], notes: '<p>여기가 2교시로 넘어가는 다리입니다. 본문 예제 6 의 점수 표를 보여 주고 💬 “어떻게 해결할까?” — ① 템플릿을 여러 각도로 돌린다(실습 2, 각도 수만큼 느려짐) ② 회전해도 변하지 않는 <b>특징</b>을 쓴다 → ORB. 후자가 2교시. (6분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '640×480 영상에서 64×64 템플릿으로 matchTemplate 하면 결과 Mat 크기는?', options: ['640 × 480', '576 × 416', '577 × 417', '64 × 64'], answer: 2, explain: '(W − w + 1) × (H − h + 1) = <b>577 × 417</b>. 템플릿을 놓을 수 있는 위치의 개수입니다.', notes: '<p>정답 3번. 576 × 416 을 고른 학생이 많으면 “양 끝 위치도 센다” 는 +1 의 의미를 1차원(길이 6 에 길이 3 → 4곳)으로 다시 설명합니다.</p>' },
          { layout: 'practice', title: '실습: 회전 템플릿 매칭', desc: '<p>템플릿을 −60° ~ 180° 까지 30° 간격으로 돌려 가며 <code>parts_scene.png</code> 에 매칭하고 각 각도의 최고 점수와 기준점을 출력하세요.</p><ul><li>여백 30 px → 180 × 160, 기준점 (90, 80)</li><li><code>getRotationMatrix2D</code> + <code>warpAffine</code></li><li>정답: 0° → (120,110) · 30° → (330,100) · 90° → (150,340)</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat scene = imread("images/parts_scene.png", IMREAD_GRAYSCALE);
    Mat t0 = imread("images/part_template.png", IMREAD_GRAYSCALE);
    Mat pad;
    copyMakeBorder(t0, pad, 30, 30, 30, 30, BORDER_REPLICATE);
    for (int ang = -60; ang <= 180; ang += 30)
    {
        // TODO: pad 를 ang 도 회전 → scene 에 매칭 → 점수와 기준점 출력
    }
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat scene = imread("images/parts_scene.png", IMREAD_GRAYSCALE);
    Mat t0 = imread("images/part_template.png", IMREAD_GRAYSCALE);
    Mat pad;
    copyMakeBorder(t0, pad, 30, 30, 30, 30, BORDER_REPLICATE);
    for (int ang = -60; ang <= 180; ang += 30)
    {
        Mat M = getRotationMatrix2D(Point2f(pad.cols / 2.f, pad.rows / 2.f), ang, 1);
        Mat rot, res;
        warpAffine(pad, rot, M, pad.size(), INTER_LINEAR, BORDER_REPLICATE);
        matchTemplate(scene, rot, res, TM_CCOEFF_NORMED);
        double mx;
        Point px;
        minMaxLoc(res, nullptr, &mx, nullptr, &px);
        cout << format("  %4d도: %.3f @ (%d,%d)", ang, mx, px.x + 90, px.y + 80) << endl;
    }
    return 0;
}`, notes: '<p>정답: 0°(0.994), 30°(0.989), 90°(0.993) 세 자세만 0.95 를 넘습니다. 💬 “−45° 부품은 왜 못 찾았을까?” — 30° 간격이라 −45° 가 없다. 💬 “5° 간격으로 하면?” — 정확해지지만 <b>매칭 횟수가 6배</b>. 이 트레이드오프가 2교시 ORB 의 동기입니다. <code>BORDER_REPLICATE</code> 를 빼면 회전된 모서리가 검게 채워져 점수가 떨어지는 것도 보여 주면 좋습니다. (10분)</p>' },
          { layout: 'summary', title: '1교시 정리', bullets: ['<code>matchTemplate</code> → 유사도 맵 <b>(W−w+1) × (H−h+1)</b>, <code>CV_32FC1</code>', '<code>minMaxLoc(res, &amp;minV, &amp;maxV, &amp;minL, &amp;maxL)</code> 의 위치는 <b>템플릿 왼쪽 위</b> — 중심은 기준점을 더한다', 'SQDIFF 계열은 <b>최소</b>, CCORR · CCOEFF 계열은 <b>최대</b>. 기본은 <code>TM_CCOEFF_NORMED</code>', '여러 개 찾기 = <b>임계값 + NMS</b> (진짜와 가짜 점수 사이에 문턱을 둔다)', '고정 격자라면 셀 ROI × 템플릿으로 <b>숫자 판독</b>까지 가능', '약점은 <b>회전 · 크기 변화</b> → 다음: 특징점 ORB'], notes: '<p>여섯 줄을 정리하고, 특히 “왼쪽 위” 와 “SQDIFF 는 최소” 를 다시 확인합니다. 다음 시간 예고: “회전해도 변하지 않는 특징을 뽑아서 비교한다 — 그리고 호모그래피로 부품 윤곽까지 그린다.” (3분)</p>' }
        ]
      },
      {
        id: 'cv14-2', title: '특징점과 기술자: ORB 매칭', minutes: 50,
        goals: ['특징점 · 기술자 · 해밍 거리의 개념을 설명할 수 있다', 'ORB::create → detectAndCompute → drawKeypoints 를 쓸 수 있다', 'BFMatcher(NORM_HAMMING, crossCheck) 와 knnMatch + Lowe 비율 검사를 구분해 쓸 수 있다', 'findHomography + perspectiveTransform 으로 부품 위치를 다각형으로 표시할 수 있다'],
        flow: [['도입: 회전을 견디는 방법', 5], ['특징점 · 기술자 개념', 12], ['ORB 검출 · 매칭 · 호모그래피', 23], ['비율 검사 · QR · 정리', 10]],
        content: [
          { type: 'h', text: '아이디어: 영상 전체가 아니라 "특징적인 점"만 비교한다' },
          { type: 'p', html: '템플릿 매칭은 <b>모든 픽셀을 그대로</b> 겹쳐 비교했습니다. 그래서 30° 만 돌아도 무너졌습니다. 다른 접근은 이렇습니다: 영상에서 <b>눈에 띄는 점(코너)</b> 수백 개를 찾고, 각 점 주변 모습을 <b>회전에 상관없는 숫자 묶음(기술자)</b>으로 요약합니다. 두 영상에서 기술자가 비슷한 점끼리 짝지으면, 물체가 돌아가 있어도 <b>같은 점끼리 이어집니다</b>.' },
          { type: 'figure', html: FIG_KP, caption: '그림 3. ① FAST 로 코너 찾기 → ② 방향을 재고 회전 보정한 256비트 BRIEF 기술자 → ③ 해밍 거리로 짝짓기' },
          { type: 'table', head: ['용어', '뜻', 'C++ OpenCV 형'], rows: [
            ['특징점 (keypoint)', '위치 · 크기 · 방향을 가진 "눈에 띄는 점"', '<code>KeyPoint</code> — <code>pt</code>, <code>size</code>, <code>angle</code>, <code>response</code>, <code>octave</code> (공개 멤버 변수)'],
            ['기술자 (descriptor)', '그 점 주변 모습을 요약한 숫자 묶음', '<code>Mat</code> — 행 = 특징점, 열 = 32 (ORB, <code>CV_8UC1</code>)'],
            ['검출기 (detector)', '특징점을 찾는 알고리즘', '<code>Ptr&lt;ORB&gt; orb = ORB::create(500);</code> → <code>orb-&gt;detectAndCompute(…)</code>'],
            ['매칭 (match)', '두 기술자 집합에서 닮은 쌍 찾기', '<code>BFMatcher</code> → <code>vector&lt;DMatch&gt;</code>'],
            ['<code>DMatch</code>', '한 쌍의 정보', '<code>queryIdx</code>(첫 영상), <code>trainIdx</code>(둘째 영상), <code>distance</code>'],
            ['해밍 거리 (Hamming)', '이진 기술자에서 <b>다른 비트의 개수</b>', '<code>NORM_HAMMING</code> (0 ~ 256)']
          ], caption: '표 2. 특징점 매칭의 등장인물 — ORB = Oriented FAST + Rotated BRIEF (Python: cv2.ORB_create, cv2.BFMatcher)' },
          { type: 'callout', kind: 'info', title: 'Ptr<ORB> 와 -> — 스마트 포인터', html: 'ORB 같은 알고리즘 객체는 <code>new</code> 로 만들지 않고 <b>팩토리 함수</b> <code>ORB::create(…)</code> 로 만듭니다. 돌려받는 <code>Ptr&lt;ORB&gt;</code> 는 OpenCV 의 스마트 포인터(<code>std::shared_ptr</code> 와 같음)라서 <b><code>delete</code> 가 필요 없고</b>, 멤버 함수는 <code>orb-&gt;detectAndCompute(…)</code> 처럼 <b>화살표(<code>-&gt;</code>)</b> 로 부릅니다. 반면 <code>BFMatcher matcher(NORM_HAMMING, true);</code> 는 보통 객체라서 <code>matcher.match(…)</code> 처럼 점(<code>.</code>)으로 부릅니다. 둘 다 <code>Feature2D</code> · <code>DescriptorMatcher</code> 라는 <b>부모 클래스</b>를 상속하므로, 나중에 SIFT 등으로 바꿔도 나머지 코드는 그대로입니다(16차시의 인터페이스 설계와 같은 원리).' },
          { type: 'h', text: 'ORB 로 특징점 찾기' },
          { type: 'code', title: '예제 1: ORB::create → detectAndCompute → drawKeypoints', code: EX_ORB, nondeterministic: true,
            desc: '<code>ORB::create(500)</code> 의 500 은 <b>최대</b> 특징점 개수입니다(이 영상에서는 473개). <code>detectAndCompute</code> 는 특징점 <code>vector&lt;KeyPoint&gt;</code> 와 기술자 Mat 을 한 번에 채웁니다 — 두 번째 인수 <code>noArray()</code> 는 "마스크 없음(영상 전체)" 입니다. 기술자는 <b>473 × 32</b> 의 <code>CV_8UC1</code>: 한 점이 32바이트 = 256비트입니다. <code>DrawMatchesFlags::DRAW_RICH_KEYPOINTS</code> 를 주면 크기(원)와 방향(선)까지 그려 줍니다 — 결과 창에서 원의 크기가 제각각인 것을 확인하세요(피라미드 <code>octave</code> 가 다릅니다). <b>특징점 개수 · 좌표 · 각도는 OpenCV 빌드(버전 · SIMD 최적화)에 따라 조금 다를 수 있습니다</b> — 아래 출력은 이 사이트의 결과입니다.',
            expect: '특징점 473개\n기술자(descriptor) Mat: 473 x 32 (CV_8UC1)\n→ 특징점 1개 = 32바이트 = 256비트 이진 기술자\nresponse(코너 강도) 상위 5개:\n  (   90,   85) size   77 angle   51.5 octave 5\n  (  125,  367) size   93 angle  319.5 octave 6\n  (  290,   96) size   93 angle   14.1 octave 6\n  (  291,   92) size   77 angle   22.5 octave 5\n  (  127,  366) size   77 angle  322.6 octave 5' },
          { type: 'callout', kind: 'warn', title: '⚠️ 템플릿이 작으면 특징점이 안 나온다', html: 'ORB 는 기술자를 만들려고 특징점 주변 <b>31 × 31 픽셀</b>을 봅니다(<code>edgeThreshold = 31</code>). 그래서 영상 <b>테두리 근처</b>의 점은 모두 버립니다. <code>part_template.png</code>(120 × 100)는 부품이 화면을 거의 채우고 있어 특징점이 <b>4개</b>밖에 안 나옵니다!<br>해결책은 <code>copyMakeBorder(t0, tmpl, 32, 32, 32, 32, BORDER_REPLICATE)</code> 로 <b>여백을 붙이는</b> 것입니다 — 이렇게 하면 62개가 나옵니다. 대신 좌표가 32 px 씩 밀리므로 나중에 계산할 때 그만큼 감안해야 합니다.' },
          { type: 'h', text: '매칭: 해밍 거리와 crossCheck' },
          { type: 'code', title: '예제 2: BFMatcher(NORM_HAMMING, crossCheck) + drawMatches', code: EX_MATCH, nondeterministic: true,
            desc: '<code>BFMatcher</code>(Brute-Force)는 모든 쌍을 다 비교합니다 — 특징점이 수백 개면 충분히 빠릅니다. 이진 기술자이므로 <b><code>NORM_HAMMING</code></b> 을 써야 합니다. 두 번째 인수 <code>true</code> 는 crossCheck — "A→B 의 1등이 B→A 의 1등일 때만" 인정해 애매한 매칭을 줄입니다 (62개 중 55개). <code>DMatch</code> 에는 <code>operator&lt;</code> 가 <code>distance</code> 비교로 정의되어 있어서 <code>sort</code> 에 비교 함수를 안 줘도 거리순으로 정렬됩니다. 상위 20개의 해밍 거리가 <b>3 ~ 11</b> 로 매우 작습니다(256비트 중 3~11비트만 다름). 매칭된 장면 좌표가 (92,82), (96,86) … 부품 #1 근처에 모여 있는 것도 확인하세요. <b>개수는 빌드에 따라 조금 다를 수 있습니다.</b>',
            expect: '템플릿 특징점 62개 / 장면 특징점 549개\ncrossCheck 매칭 55개\n거리 정렬 상위 20개: 3 ~ 11 (해밍 거리 = 다른 비트 수)\n  템플릿 kp  4 → 장면 kp 13  거리   3  장면 위치 (92,82)\n  템플릿 kp  8 → 장면 kp 21  거리   4  장면 위치 (96,86)\n  템플릿 kp 16 → 장면 kp 39  거리   4  장면 위치 (92,94)\n  템플릿 kp 11 → 장면 kp 28  거리   5  장면 위치 (84,90)\n  템플릿 kp 14 → 장면 kp107  거리   5  장면 위치 (133,365)' },
          { type: 'h', text: '호모그래피: 부품 윤곽을 장면에 그리기' },
          { type: 'p', html: '매칭 쌍이 모였다면 "템플릿 좌표 → 장면 좌표" 변환을 계산할 수 있습니다. 평면 물체라면 <b>3 × 3 호모그래피 H</b> 하나로 표현됩니다(11차시). 매칭에는 반드시 <b>틀린 쌍(이상치, outlier)</b> 이 섞이므로 <code>RANSAC</code> 을 씁니다 — 무작위로 4쌍을 골라 H 를 만들고 가장 많은 쌍이 동의하는 H 를 채택하는 방식입니다. 허프 변환의 "투표" 와 같은 정신입니다.' },
          { type: 'figure', html: FIG_HOMO, caption: '그림 4. 매칭 쌍 → RANSAC 으로 이상치 제거 → 호모그래피 H → 템플릿 모서리 · 기준점을 장면 좌표로 투영' },
          { type: 'code', title: '예제 3: findHomography(RANSAC) + perspectiveTransform', code: EX_HOMO, nondeterministic: true,
            desc: '<code>findHomography</code> 는 <code>vector&lt;Point2f&gt;</code> 두 개(같은 순서의 대응점)를 받아 <code>CV_64FC1</code> 3×3 행렬을 돌려줍니다. RANSAC 이 20쌍 중 <b>16쌍</b>을 인라이어로 인정했습니다 — <code>inlierMask</code> 에 0/1 로 들어오므로 <code>countNonZero</code> 로 셉니다. 네 모서리를 투영하면 <b>부품 #1 을 감싸는 사각형</b>이 나옵니다(정답은 (60,60)-(180,160) 이므로 몇 px 오차). 더 중요한 것은 <b>기준점</b>: 템플릿의 (60,50) → 여백 포함 (92,82) 를 투영하니 <b>(118.2, 108.5)</b> — 정답 (120, 110) 과 2 px 남짓입니다. 인라이어 개수 · 소수점 값은 빌드마다 조금 다를 수 있으므로, 마지막 줄처럼 <b>"인라이어 ≥ 10 · 오차 &lt; 5 px"</b> 같은 판정 기준으로 결과를 보고하는 것이 튼튼합니다. <code>polylines</code> 는 다각형 여러 개를 받으므로 <code>vector&lt;vector&lt;Point&gt;&gt;</code> 로 감싸 넘겼습니다.',
            expect: '호모그래피 H: 3x3 (CV_64FC1), RANSAC 인라이어 16 / 20\n투영된 네 모서리:\n  (  57.5,  57.7)\n  ( 172.2,  61.6)\n  ( 164.6, 147.4)\n  (  60.7, 158.5)\n기준점(템플릿 60,50) 투영 = (118.2,108.5)  (정답 120,110)\n판정: 찾음 (인라이어 10개 이상 · 기준점 오차 5 px 미만)' },
          { type: 'callout', kind: 'tip', title: 'warpPerspective 와 perspectiveTransform 은 다르다', html: '<ul><li><code>warpPerspective(src, dst, H, size)</code> — <b>영상 전체</b>를 변형해 새 영상을 만듭니다 (정면화 · 보정, 11차시).</li><li><code>perspectiveTransform(points, out, H)</code> — <b>점 목록</b>(<code>vector&lt;Point2f&gt;</code>)만 변환합니다 (모서리 투영 · 좌표 변환).</li></ul>모서리 네 개만 옮겨 다각형을 그릴 때 영상 전체를 변형하면 아주 느리고 낭비입니다. 점만 옮기세요.' },
          { type: 'h', text: 'knnMatch + Lowe 비율 검사' },
          { type: 'code', title: '예제 4: 1등과 2등을 비교해 애매한 매칭 걸러내기', code: EX_KNN, nondeterministic: true,
            desc: '<code>knnMatch(dT, dS, knn, 2)</code> 는 각 템플릿 특징점마다 <b>가장 가까운 2개</b>를 줍니다(<code>vector&lt;vector&lt;DMatch&gt;&gt;</code>). 1등 거리가 2등의 0.75배보다 작으면 "확실히 1등" 으로 봅니다 — David Lowe 가 SIFT 논문에서 제안한 <b>비율 검사(ratio test)</b>입니다. 비율을 0.6 → 0.9 로 올리면 통과 개수가 8 → 42 개로 늘어납니다. 반복 무늬(격자 · 나사산 · 같은 부품 여러 개)가 있는 영상에서는 이 검사가 <b>crossCheck 보다 효과적</b>입니다. 단 crossCheck 는 <code>false</code> 로 두어야 합니다 — 둘 중 하나를 고르세요. 특징점이 적으면 후보가 1개뿐일 수 있으므로 <code>p.size() == 2</code> 검사를 꼭 넣습니다.',
            expect: 'knnMatch(k=2): 템플릿 특징점 62개마다 후보 2개\n  비율 0.60 통과   8개\n  비율 0.70 통과  18개\n  비율 0.75 통과  23개\n  비율 0.80 통과  26개\n  비율 0.90 통과  42개\nLowe 0.75 로 고른 매칭 23개\n  거리 3 → 장면 (92,82)\n  거리 4 → 장면 (96,86)\n  거리 4 → 장면 (92,94)' },
          { type: 'table', head: ['', '템플릿 매칭', 'ORB 특징점 매칭'], rows: [
            ['회전', '❌ 30° 에서 0.53 으로 붕괴', '✅ 견딘다 (방향 보정)'],
            ['크기 변화', '❌ 배율마다 다시 매칭', '✅ 어느 정도 견딘다 (피라미드)'],
            ['부분 가림', '❌ 점수 급락', '✅ 보이는 특징점만으로 가능'],
            ['무늬 없는 물체', '✅ 형상만으로 찾음', '❌ 특징점이 안 잡힌다'],
            ['작은 템플릿', '✅ 문제없음', '❌ 테두리 여백이 필요'],
            ['결과', '위치(사각형) + 점수', '점 대응 → <b>H</b> → 위치 · <b>회전 · 배율</b>'],
            ['재현성', '빌드가 달라도 거의 같은 점수', '특징점 개수 · 좌표가 빌드마다 조금 다름 → <b>판정 기준</b>으로 보고'],
            ['튜닝', '모드 · 임계값', 'nfeatures · 거리 임계 · 비율 · RANSAC 오차']
          ], caption: '표 3. 두 방법은 경쟁 관계가 아니라 상보 관계 — 자세가 고정이면 템플릿, 자유롭게 놓이면 특징점' },
          { type: 'h', text: '보너스: QR 코드 읽기' },
          { type: 'code', title: '예제 5: QRCodeDetector 로 라벨 읽기', code: EX_QR,
            desc: 'OpenCV 에는 QR 코드 전용 검출 · 해독기가 들어 있습니다(objdetect 모듈). <code>detectAndDecode</code> 는 내용을 <code>std::string</code> 으로 돌려주고 네 꼭짓점을 <code>vector&lt;Point2f&gt;</code> 에 채웁니다. 찾지 못하면 <b>빈 문자열</b>을 주므로 반드시 <code>text.empty()</code> 를 확인하세요. 읽은 문자열을 <code>stringstream</code> + <code>getline(ss, part, \';\')</code> 과 <code>find(\'=\')</code> 로 쪼개면 바로 생산 이력(SN · LOT · EXP)으로 쓸 수 있습니다. 바코드(EAN-13)는 <code>barcode::BarcodeDetector</code> 로 읽습니다(로컬 OpenCV).',
            expect: 'QR 내용: SN=MV-000123;LOT=A2309-117;EXP=2027-09-30\n꼭짓점 4개:\n  (428,258)\n  (543,258)\n  (543,374)\n  (428,374)\n  SN   = MV-000123\n  LOT  = A2309-117\n  EXP  = 2027-09-30' },
          { type: 'callout', kind: 'more', title: '📘 더 알아보기 — OpenCV 5 의 모듈 이름 변화', html: '<ul><li>OpenCV 5 에서는 4.x 의 <b><code>features2d</code> 모듈 이름이 <code>features</code></b> 로 바뀌었습니다. 헤더는 <code>&lt;opencv2/features.hpp&gt;</code> 이지만, <code>&lt;opencv2/opencv.hpp&gt;</code> 를 쓰면 신경 쓸 필요가 없습니다. ORB · SIFT · FAST · AKAZE · BFMatcher 는 본 저장소(main)에 그대로 있고, <b>SURF · BRIEF</b> 등은 contrib(<code>xfeatures2d</code>)에 있습니다.</li><li><code>findHomography</code> · <code>estimateAffine2D</code> 같은 기하 추정 함수는 4.x 의 <code>calib3d</code> 에서 새 <b><code>geometry</code></b> 모듈로 옮겨졌습니다. 함수 이름과 인수는 같습니다.</li><li>Visual Studio 에서는 <code>opencv_world500.lib</code> 하나에 모든 모듈이 들어 있으므로 링크 설정은 바꿀 것이 없습니다. 4.x 예제의 <code>#include &lt;opencv2/features2d.hpp&gt;</code> 를 그대로 가져오면 컴파일 오류가 날 수 있으니 <code>opencv.hpp</code> 로 바꾸세요.</li><li>SIFT 는 특허가 끝나(2020) 4.4 부터 본 저장소에 들어왔습니다. <code>Ptr&lt;SIFT&gt; sift = SIFT::create();</code> 로 만들고 매칭은 <code>NORM_L2</code> 입니다(로컬 OpenCV).</li></ul>' },
          { type: 'callout', kind: 'field', title: '현장 노트 — 특징점 매칭을 실제로 쓸 때', html: '<ul><li><b>ORB vs AKAZE vs SIFT</b>: ORB 는 빠르고 특허가 없어 산업용으로 널리 쓰입니다. 정밀도가 더 필요하면 AKAZE, 최고 품질은 SIFT 입니다. <code>Ptr&lt;Feature2D&gt; det = AKAZE::create();</code> 처럼 부모 형으로 받으면 한 줄만 바꿔 실험할 수 있습니다(로컬 OpenCV).</li><li><b>인라이어 개수가 품질 지표</b>: 인라이어가 10개 미만이면 "못 찾았다" 로 처리하세요. 매칭이 몇 개 나왔는지가 아니라 <b>RANSAC 을 통과한 개수</b>가 신뢰도입니다.</li><li><b>숫자 대신 판정으로 보고</b>: 특징점 개수 · 좌표는 OpenCV 버전 · CPU 최적화에 따라 조금씩 달라집니다. 장비 프로그램의 합격 기준은 "인라이어 ≥ N, 위치 오차 ≤ E" 처럼 <b>범위</b>로 정하세요.</li><li><b>무늬 없는 금속 부품</b>에는 특징점이 거의 안 잡힙니다. 그때는 윤곽선 기반(12차시 <code>matchShapes</code> · <code>minAreaRect</code>)이 더 낫습니다. "특징점이 만능" 이 아닙니다.</li><li><b>조명</b>: 특징점은 밝기 <b>패턴</b>에 의존합니다. 조명이 바뀌어 반사 하이라이트가 움직이면 특징점도 움직입니다. 확산 조명(diffuse)으로 하이라이트를 없애는 것이 알고리즘 튜닝보다 효과적일 때가 많습니다.</li></ul>' },
          { type: 'callout', kind: 'vs', title: 'Visual Studio 에서는', html: '<code>drawMatches</code> 가 만든 Mat(두 영상을 나란히 붙이고 선을 그린 것)은 훌륭한 디버깅 화면입니다. 로컬 PC 에서는 <code>createTrackbar</code> 로 <code>nfeatures</code> 와 Lowe 비율을 조절하게 하면 파라미터의 의미를 눈으로 익힐 수 있습니다. 특징점 검출은 무거우므로 <b>템플릿의 특징점 · 기술자는 프로그램 시작 때 한 번만</b> 계산해 두고, 매 프레임에는 장면 쪽만 계산하세요. 기술자는 <code>FileStorage</code> 로 YAML 파일에 저장해 둘 수도 있습니다. <b>Release</b> 빌드로 실행해야 속도가 제대로 나옵니다(Debug 는 수 배 느림).' },
          { type: 'callout', kind: 'tip', teacher: true, title: '평가 루브릭 · 마무리', html: '<ul><li><b>상</b>: 템플릿 매칭과 특징점 매칭을 상황에 맞게 고르고 근거를 설명한다. 인라이어 개수를 신뢰도로 쓰고, 기준점 투영과 판정까지 코드로 완성한다.</li><li><b>중</b>: 예제를 수정해 다른 영상에서 매칭을 돌린다. NORM_HAMMING / crossCheck / Lowe 비율의 뜻을 안다.</li><li><b>하</b>: <code>BFMatcher</code> 를 기본값(<code>NORM_L2</code>)으로 쓰거나 작은 템플릿에서 특징점이 안 나와 막힌다 → 표 2 와 ⚠️ 콜아웃을 다시 보게 합니다. <code>queryIdx</code> / <code>trainIdx</code> 를 바꿔 써서 범위 밖 접근이 나는 경우도 흔합니다(“query = 템플릿 = 첫 번째 인수”).</li><li>💬 마무리 발문: “매끈한 금속 부품처럼 무늬가 전혀 없으면?” — 특징점이 안 잡힌다 → 윤곽선 기반(12차시)이나 형상 매칭을 쓴다. “특징점이 만능이 아니다” 로 마무리하세요.</li><li>다음 차시 예고: 지금까지는 <b>사진 한 장</b>이었습니다. 15차시부터는 <b>움직이는 영상</b>(VideoCapture) 을 다룹니다 — 컨베이어 위를 지나가는 부품을 한 번만 세는 문제.</li></ul>' }
        ],
        practice: [
          {
            title: 'nfeatures 를 바꿔 보기 — 특징점은 몇 개가 적당한가', level: 1, nondeterministic: true,
            desc: '<code>ORB::create(n)</code> 의 <code>n</code> 을 100 · 300 · 500 · 1000 · 2000 으로 바꿔 가며 <code>parts_scene.png</code> 의 특징점 개수와 기술자 Mat 크기를 출력하세요. 어느 지점부터 더 늘지 않는지 확인하고, 그 이유를 생각해 보세요. (개수는 OpenCV 빌드에 따라 조금 다를 수 있습니다.)',
            hint: '<code>for (int n : {100, 300, 500, 1000, 2000})</code> 안에서 <code>Ptr&lt;ORB&gt; orb = ORB::create(n);</code> 을 만들고 <code>detectAndCompute</code> 를 부르면 됩니다. <code>n</code> 은 <b>상한</b>이므로 영상에 코너가 그만큼 없으면 더 나오지 않습니다.',
            expect: '  ORB::create( 100) → 특징점  100개, 기술자 100x32\n  ORB::create( 300) → 특징점  298개, 기술자 298x32\n  ORB::create( 500) → 특징점  473개, 기술자 473x32\n  ORB::create(1000) → 특징점  549개, 기술자 549x32\n  ORB::create(2000) → 특징점  549개, 기술자 549x32',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat scene = imread("images/parts_scene.png", IMREAD_GRAYSCALE);
    for (int n : {100, 300, 500, 1000, 2000})
    {
        // TODO: ORB::create(n) 으로 검출기를 만들고 detectAndCompute 를 부르세요
        // TODO: 특징점 개수와 기술자 Mat 크기(rows x cols)를 출력하세요
    }
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat scene = imread("images/parts_scene.png", IMREAD_GRAYSCALE);
    for (int n : {100, 300, 500, 1000, 2000})
    {
        Ptr<ORB> orb = ORB::create(n);
        vector<KeyPoint> k;
        Mat d;
        orb->detectAndCompute(scene, noArray(), k, d);
        cout << format("  ORB::create(%4d) → 특징점 %4d개, 기술자 %dx%d", n, (int)k.size(), d.rows, d.cols) << endl;
    }
    return 0;
}`
          },
          {
            title: '장면을 90° 돌려도 ORB 는 같은 부품을 찾는다', level: 2,
            desc: '<code>rotate(scene0, scene, ROTATE_90_CLOCKWISE)</code> 로 장면을 90° 시계 회전시킨 뒤 ① 템플릿 매칭과 ② ORB + 호모그래피를 둘 다 돌려 결과를 비교하세요. 템플릿 매칭은 <b>다른 부품</b>(원래 90° 였다가 0° 가 된 #4)을 찾고, ORB 는 <b>같은 #1 부품</b>을 계속 따라갑니다. 원본 (120, 110) 을 90° 시계 회전하면 (479−110, 120) = <b>(369, 120)</b> 입니다. ORB 결과는 숫자 대신 <b>판정</b>(인라이어 10개 이상 · 오차 5 px 미만)으로 출력하세요.',
            hint: 'ORB 쪽은 예제 3 의 코드를 그대로 쓰면 됩니다 (여백 32 px → 기준점은 (92, 82)). 90° 시계 회전의 좌표 변환은 <code>x\' = H − 1 − y</code>, <code>y\' = x</code> (H = 원본 높이 480) 입니다. 오차는 <code>norm(out[0] - Point2f(369, 120))</code>.',
            expect: '[템플릿 매칭] 최고 점수 0.996 @ 기준점 (139,150)\n  → #1 이 아니라, 회전 덕분에 0도가 된 다른 부품(#4)을 찾았다\n[ORB] 인라이어 10개 이상: 예\n[ORB] 기준점이 정답 (369,120) 에서 5 px 이내: 예\n  → ORB 는 회전해도 같은 #1 부품을 따라간다',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat scene0 = imread("images/parts_scene.png", IMREAD_GRAYSCALE);
    Mat scene;
    rotate(scene0, scene, ROTATE_90_CLOCKWISE);
    Mat t0 = imread("images/part_template.png", IMREAD_GRAYSCALE);

    // TODO ①: 템플릿 매칭(TM_CCOEFF_NORMED) 최고 점수와 기준점(위치 + (60,50)) 을 출력하세요

    // TODO ②: t0 에 여백 32px 을 붙이고 ORB(1000) + BFMatcher(NORM_HAMMING, true) 로
    //          상위 20개 매칭 → findHomography(RANSAC, 3) → (92,82) 를 투영해
    //          "인라이어 10개 이상" · "정답 (369,120) 에서 5 px 이내" 를 예/아니오로 출력하세요

    imshow("rotated scene", scene);
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
    Mat scene0 = imread("images/parts_scene.png", IMREAD_GRAYSCALE);
    Mat scene;
    rotate(scene0, scene, ROTATE_90_CLOCKWISE);
    Mat t0 = imread("images/part_template.png", IMREAD_GRAYSCALE);

    // ① 템플릿 매칭
    Mat res;
    matchTemplate(scene, t0, res, TM_CCOEFF_NORMED);
    double mx;
    Point px;
    minMaxLoc(res, nullptr, &mx, nullptr, &px);
    cout << format("[템플릿 매칭] 최고 점수 %.3f @ 기준점 (%d,%d)", mx, px.x + 60, px.y + 50) << endl;
    cout << "  → #1 이 아니라, 회전 덕분에 0도가 된 다른 부품(#4)을 찾았다" << endl;

    // ② ORB + 호모그래피
    Mat tmpl;
    copyMakeBorder(t0, tmpl, 32, 32, 32, 32, BORDER_REPLICATE);
    Ptr<ORB> orb = ORB::create(1000);
    vector<KeyPoint> kT, kS;
    Mat dT, dS;
    orb->detectAndCompute(tmpl, noArray(), kT, dT);
    orb->detectAndCompute(scene, noArray(), kS, dS);
    vector<DMatch> m;
    BFMatcher(NORM_HAMMING, true).match(dT, dS, m);
    stable_sort(m.begin(), m.end());
    m.resize(min<size_t>(20, m.size()));

    vector<Point2f> src, dst;
    for (const DMatch& d : m) { src.push_back(kT[d.queryIdx].pt); dst.push_back(kS[d.trainIdx].pt); }
    Mat mask;
    Mat H = findHomography(src, dst, RANSAC, 3, mask);
    vector<Point2f> ref = { Point2f(92, 82) }, out;
    perspectiveTransform(ref, out, H);
    double err = norm(out[0] - Point2f(369, 120));
    cout << "[ORB] 인라이어 10개 이상: " << (countNonZero(mask) >= 10 ? "예" : "아니오") << endl;
    cout << "[ORB] 기준점이 정답 (369,120) 에서 5 px 이내: " << (err < 5 ? "예" : "아니오") << endl;
    cout << "  → ORB 는 회전해도 같은 #1 부품을 따라간다" << endl;
    return 0;
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: '특징점과 기술자: ORB 매칭', subtitle: '회전 · 크기가 바뀌어도 같은 물체를 찾는다', notes: '<p>1교시 마지막 결과(30° → 0.53)를 다시 띄우고 시작합니다. 💬 “사람은 부품이 돌아가 있어도 같은 부품인 줄 아는데, 무엇을 보고 알까요?” — 모서리 · 구멍 같은 <b>특징</b>. 그것을 코드로 옮기는 것이 오늘 주제입니다. (3분)</p>' },
          { layout: 'diagram', title: '특징점 → 기술자 → 해밍 거리', html: FIG_KP, caption: 'ORB = Oriented FAST(코너) + Rotated BRIEF(256비트 이진 기술자)', notes: '<p>세 단계를 천천히 짚습니다. ① 코너: 평평한 면이나 직선의 중간은 "어디인지 알 수 없어서" 특징점이 안 됩니다 — 창문을 손으로 가리는 비유가 잘 통합니다. ② 방향을 먼저 재고 그 방향으로 비교 패턴을 <b>돌려서</b> 기술자를 만들기 때문에 회전에 강합니다. ③ 이진이므로 XOR 후 1의 개수 = 해밍 거리, 아주 빠릅니다. (10분)</p>' },
          { layout: 'table', title: '등장인물 정리 (C++)', head: ['용어', '뜻', 'C++ OpenCV'], rows: [
            ['특징점', '위치 · 크기 · 방향이 있는 점', '<code>KeyPoint</code> (pt, size, angle, response)'],
            ['기술자', '주변 모습 요약', '<code>Mat</code> N × 32 <code>CV_8UC1</code>'],
            ['검출기', '찾는 알고리즘', '<code>Ptr&lt;ORB&gt; orb = ORB::create(500);</code>'],
            ['매칭', '닮은 쌍', '<code>BFMatcher</code> → <code>vector&lt;DMatch&gt;</code>'],
            ['<code>DMatch</code>', '쌍 정보', 'queryIdx · trainIdx · distance'],
            ['해밍 거리', '다른 비트 수', '<code>NORM_HAMMING</code>']
          ], notes: '<p><code>queryIdx</code>(첫 번째 인수 = 템플릿)와 <code>trainIdx</code>(두 번째 인수 = 장면)를 혼동하는 실수가 많습니다. “query = 찾는 쪽, train = 찾아지는 쪽” 으로 외우게 하세요. <code>Ptr</code> 은 스마트 포인터라 <code>-&gt;</code> 로 부르고 delete 가 필요 없다는 것, <code>BFMatcher</code> 기본값이 <code>NORM_L2</code> 라서 꼭 <code>NORM_HAMMING</code> 을 넘겨야 한다는 것도 강조. (4분)</p>' },
          { layout: 'code', title: 'ORB 로 특징점 찾기', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat scene = imread("images/parts_scene.png", IMREAD_GRAYSCALE);
    Ptr<ORB> orb = ORB::create(500);
    vector<KeyPoint> kps;
    Mat desc;
    orb->detectAndCompute(scene, noArray(), kps, desc);

    cout << "특징점 " << kps.size() << "개" << endl;
    cout << "기술자 " << desc.rows << " x " << desc.cols << " (" << typeToString(desc.type()) << ")" << endl;
    cout << format("첫 점 (%.0f,%.0f) angle %.1f", kps[0].pt.x, kps[0].pt.y, kps[0].angle) << endl;

    Mat vis;
    drawKeypoints(scene, kps, vis, Scalar::all(-1), DrawMatchesFlags::DRAW_RICH_KEYPOINTS);
    imshow("keypoints", vis);
    waitKey(0);
    return 0;
}`, points: ['<code>ORB::create(500)</code> 의 500 은 <b>상한</b> (실제 473개)', '<code>noArray()</code> = 마스크 없음(영상 전체)', '기술자 473 × 32 = 점마다 <b>32바이트(256비트)</b>', '<code>DRAW_RICH_KEYPOINTS</code> → 크기(원) · 방향(선)까지'], notes: '<p>실행해서 특징점이 <b>모서리와 구멍</b>에 몰려 있는 것을 확인시킵니다. 💬 “배경(평평한 면)에는 왜 없을까?” 원의 크기가 다른 이유(<code>octave</code> = 피라미드 층)도 설명. 개수는 OpenCV 빌드마다 조금 다를 수 있다고 미리 말해 두세요 — 학생 PC 의 Visual Studio 결과와 달라도 정상입니다. <code>metal_scratch.png</code> 로 바꿔 실행하면 특징점이 확 줄어드는 것도 보여 주면 좋습니다. (8분)</p>' },
          { layout: 'code', title: '매칭: NORM_HAMMING + crossCheck', code: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;
int main()
{
    Mat scene = imread("images/parts_scene.png", IMREAD_GRAYSCALE);
    Mat t0 = imread("images/part_template.png", IMREAD_GRAYSCALE), tmpl;
    copyMakeBorder(t0, tmpl, 32, 32, 32, 32, BORDER_REPLICATE);   // 여백 32px
    Ptr<ORB> orb = ORB::create(1000);
    vector<KeyPoint> kT, kS;  Mat dT, dS;
    orb->detectAndCompute(tmpl, noArray(), kT, dT);
    orb->detectAndCompute(scene, noArray(), kS, dS);
    vector<DMatch> matches;
    BFMatcher(NORM_HAMMING, true).match(dT, dS, matches);           // crossCheck = true
    sort(matches.begin(), matches.end());  matches.resize(20);     // distance 순 상위 20
    cout << "거리 " << matches.front().distance << " ~ " << matches.back().distance << endl;
    Mat drawn;
    drawMatches(tmpl, kT, scene, kS, matches, drawn);
    imshow("matches", drawn);
    waitKey(0);
    return 0;
}`, points: ['<code>copyMakeBorder</code> 없이는 템플릿 특징점이 <b>4개</b>뿐!', '<code>NORM_HAMMING</code> — 이진 기술자이므로 필수', 'crossCheck: 서로가 서로의 1등일 때만 (62 → 55개)', '<code>DMatch</code> 는 <code>operator&lt;</code> 로 distance 비교 → <code>sort</code> 그대로'], notes: '<p><code>copyMakeBorder</code> 를 지우고 실행해 특징점이 4개로 떨어지는 것을 <b>반드시</b> 보여 주세요. 이유: ORB 는 31×31 패치가 필요해 테두리 근처를 버린다. <code>drawMatches</code> 결과 그림에서 선들이 부품 #1 한 곳으로 모이는 것을 확인시킵니다. <code>matches.resize(20)</code> 은 매칭이 20개 미만이면 빈 DMatch 가 생기므로 실무에서는 <code>min</code> 으로 막는다는 것도 짚어 주세요(본문 예제). (10분)</p>' },
          { layout: 'diagram', title: 'RANSAC + 호모그래피', html: FIG_HOMO, caption: '틀린 쌍(점선)은 RANSAC 이 걸러 내고, 남은 인라이어로 3×3 H 를 구해 점을 옮긴다', notes: '<p>RANSAC 을 “투표로 다수 의견을 고른다” 로 설명합니다(허프의 투표와 같은 정신!). 💬 “H 를 정하려면 최소 몇 쌍이 필요할까?” — 4쌍 (11차시 getPerspectiveTransform). 무작위 4쌍으로 H 를 만들어 보고, 나머지 쌍이 얼마나 동의하는지 세는 것을 반복합니다. (4분)</p>' },
          { layout: 'code', title: '호모그래피로 기준점 찾기', code: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;
int main()
{
    Mat scene = imread("images/parts_scene.png", IMREAD_GRAYSCALE);
    Mat t0 = imread("images/part_template.png", IMREAD_GRAYSCALE), tmpl;
    copyMakeBorder(t0, tmpl, 32, 32, 32, 32, BORDER_REPLICATE);
    Ptr<ORB> orb = ORB::create(1000);
    vector<KeyPoint> kT, kS;  Mat dT, dS;
    orb->detectAndCompute(tmpl, noArray(), kT, dT);
    orb->detectAndCompute(scene, noArray(), kS, dS);
    vector<DMatch> m;
    BFMatcher(NORM_HAMMING, true).match(dT, dS, m);
    sort(m.begin(), m.end());  m.resize(20);                       // 좋은 쌍 20개
    vector<Point2f> src, dst, ref = { Point2f(92, 82) }, out;
    for (const DMatch& d : m) { src.push_back(kT[d.queryIdx].pt); dst.push_back(kS[d.trainIdx].pt); }
    Mat mask, H = findHomography(src, dst, RANSAC, 3, mask);        // 이상치 제거
    perspectiveTransform(ref, out, H);
    cout << format("인라이어 %d/20, 기준점 (%.1f,%.1f)", countNonZero(mask), out[0].x, out[0].y) << endl;
    return 0;
}`, points: ['<code>RANSAC</code> — 틀린 쌍(이상치)을 걸러 준다', '<code>mask</code> 의 1 개수 = 인라이어 (16 / 20) = <b>신뢰도</b>', '<code>perspectiveTransform</code> 은 <b>점</b>만 변환 (영상은 warpPerspective)', '기준점 (118.2, 108.5) — 정답 (120, 110) 과 2 px 남짓'], notes: '<p>인라이어 개수를 <b>신뢰도</b>로 쓰라는 실무 규칙을 강조: 10개 미만이면 “못 찾았다”. <code>m.resize(20)</code> 을 <code>resize(55)</code> 로 바꾸면 사각형이 찌그러지는 것도 보여 주면 좋습니다 — 나쁜 쌍이 늘면 H 가 흔들립니다. 소수점 값은 빌드마다 조금 다르므로 “오차 5 px 미만이면 찾음” 처럼 <b>판정</b>으로 보고하게 합니다. (10분)</p>' },
          { layout: 'code', title: 'knnMatch + Lowe 비율 검사', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;
int main()
{
    Mat scene = imread("images/parts_scene.png", IMREAD_GRAYSCALE);
    Mat t0 = imread("images/part_template.png", IMREAD_GRAYSCALE), tmpl;
    copyMakeBorder(t0, tmpl, 32, 32, 32, 32, BORDER_REPLICATE);
    Ptr<ORB> orb = ORB::create(1000);
    vector<KeyPoint> kT, kS;  Mat dT, dS;
    orb->detectAndCompute(tmpl, noArray(), kT, dT);
    orb->detectAndCompute(scene, noArray(), kS, dS);
    BFMatcher matcher(NORM_HAMMING, false);          // crossCheck 끔
    vector<vector<DMatch>> knn;
    matcher.knnMatch(dT, dS, knn, 2);                // 점마다 후보 2개
    for (double r : {0.6, 0.75, 0.9})
    {
        int pass = 0;
        for (const auto& p : knn) if (p.size() == 2 && p[0].distance < r * p[1].distance) pass++;
        cout << format("비율 %.2f 통과 %d", r, pass) << endl;
    }
    return 0;
}`, points: ['<code>knnMatch(…, 2)</code> → <code>vector&lt;vector&lt;DMatch&gt;&gt;</code>', '1등이 2등보다 <b>충분히</b> 가까울 때만 믿는다', '0.6 → 8개 / 0.75 → 23개 / 0.9 → 42개', 'crossCheck 는 <b>false</b> 로 — 둘 중 하나만'], notes: '<p>반복 무늬(격자 · 나사산)에서 1등과 2등이 구별되지 않는 상황을 그림으로 설명합니다. Lowe 의 0.7~0.8 이 경험적 표준값. 💬 “비율을 1.0 으로 하면?” — 전부 통과 = 검사 안 함. <code>p.size() == 2</code> 검사를 빼면 후보가 1개인 점에서 범위 밖 접근이 날 수 있다는 C++ 주의점도 짚으세요. (7분)</p>' },
          { layout: 'table', title: '템플릿 매칭 vs ORB — 언제 무엇을', head: ['상황', '템플릿 매칭', 'ORB'], rows: [
            ['회전 · 크기 변화', '❌', '✅'],
            ['부분 가림', '❌', '✅'],
            ['무늬 없는 물체', '✅', '❌'],
            ['작은 템플릿', '✅', '❌ (여백 필요)'],
            ['얻는 정보', '위치 + 점수', '위치 + <b>회전 · 배율</b> (H)'],
            ['추천', '피듀셜 · 고정 격자 OCR', '자유 자세 부품 · 정렬']
          ], notes: '<p>“둘 중 무엇이 더 좋은가” 가 아니라 “언제 무엇을” 이라는 결론을 분명히 합니다. 현장에서 템플릿 매칭이 여전히 1위인 이유: 단순 · 빠름 · 디버깅 쉬움 · 결과가 빌드에 덜 민감. 💬 “피듀셜에 ORB 를 쓰면?” — 마크가 작고 무늬가 없어 특징점이 안 나온다. (4분)</p>' },
          { layout: 'code', title: '보너스: QR 코드 읽기', code: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <sstream>
using namespace cv;
using namespace std;
int main()
{
    Mat img = imread("images/label_lot.png", IMREAD_GRAYSCALE);
    QRCodeDetector qr;
    vector<Point2f> pts;
    string text = qr.detectAndDecode(img, pts);
    if (text.empty()) { cout << "QR 을 찾지 못했습니다." << endl; return 0; }
    cout << "QR: " << text << endl;

    stringstream ss(text);
    string part;
    while (getline(ss, part, ';'))                   // ';' 로 나누고
    {
        size_t eq = part.find('=');                  // '=' 앞뒤로 키 · 값
        if (eq != string::npos)
            cout << "  " << part.substr(0, eq) << " = " << part.substr(eq + 1) << endl;
    }
    return 0;
}`, points: ['<code>detectAndDecode</code> → 내용 <code>string</code> + 네 꼭짓점', '못 찾으면 <b>빈 문자열</b> → <code>empty()</code> 확인', '<code>getline(ss, part, \';\')</code> 로 SN · LOT · EXP 분리'], notes: '<p>QR 은 알고리즘이 표준화되어 있어 한 줄로 끝난다는 것이 요점입니다. 문자열 쪼개기는 C++ 표준 라이브러리(<code>stringstream</code> · <code>getline</code> · <code>find</code> · <code>substr</code>)만으로 충분합니다. 💬 “QR 이 기울어져 있거나 일부가 가려지면?” — 오류 정정 코드가 들어 있어 최대 30%까지 복구 가능. (5분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: 'ORB 기술자를 <code>BFMatcher</code> 로 매칭할 때 써야 하는 거리는?', options: ['<code>NORM_L2</code>', '<code>NORM_HAMMING</code>', '<code>NORM_L1</code>', '<code>NORM_INF</code>'], answer: 1, explain: 'ORB 는 <b>이진</b> 기술자이므로 다른 비트 수를 세는 <b>해밍 거리</b>입니다. SIFT 같은 실수 기술자는 <code>NORM_L2</code>(BFMatcher 의 기본값).', notes: '<p>정답 2번. 기본값이 <code>NORM_L2</code> 라서 인수를 빼먹으면 “동작은 하지만 결과가 나쁘다” 는 조용한 버그가 된다는 점을 특히 강조하세요.</p>' },
          { layout: 'practice', title: '실습: 90° 돌려도 같은 부품을 따라가는가', desc: '<p>장면을 <code>rotate(…, ROTATE_90_CLOCKWISE)</code> 로 돌린 뒤 템플릿 매칭과 ORB 를 비교하세요.</p><ul><li>템플릿 매칭 → 회전 덕분에 0° 가 된 <b>다른</b> 부품(#4)을 찾는다</li><li>ORB + H → 같은 #1 부품, 기준점 정답 <b>(369, 120)</b></li><li>ORB 결과는 “인라이어 ≥ 10 · 오차 &lt; 5 px” <b>판정</b>으로 출력</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat scene0 = imread("images/parts_scene.png", IMREAD_GRAYSCALE), scene;
    rotate(scene0, scene, ROTATE_90_CLOCKWISE);
    Mat t0 = imread("images/part_template.png", IMREAD_GRAYSCALE);
    // TODO ①: 템플릿 매칭 결과 출력
    // TODO ②: ORB + findHomography 로 (92,82) 투영 → 판정 출력
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat scene0 = imread("images/parts_scene.png", IMREAD_GRAYSCALE), scene;
    rotate(scene0, scene, ROTATE_90_CLOCKWISE);
    Mat t0 = imread("images/part_template.png", IMREAD_GRAYSCALE);
    Mat res;
    matchTemplate(scene, t0, res, TM_CCOEFF_NORMED);
    double mx;
    Point px;
    minMaxLoc(res, nullptr, &mx, nullptr, &px);
    cout << format("[템플릿] %.3f @ (%d,%d)", mx, px.x + 60, px.y + 50) << endl;

    Mat tmpl;
    copyMakeBorder(t0, tmpl, 32, 32, 32, 32, BORDER_REPLICATE);
    Ptr<ORB> orb = ORB::create(1000);
    vector<KeyPoint> kT, kS;
    Mat dT, dS;
    orb->detectAndCompute(tmpl, noArray(), kT, dT);
    orb->detectAndCompute(scene, noArray(), kS, dS);
    vector<DMatch> m;
    BFMatcher(NORM_HAMMING, true).match(dT, dS, m);
    sort(m.begin(), m.end());
    m.resize(min<size_t>(20, m.size()));
    vector<Point2f> src, dst, ref = { Point2f(92, 82) }, out;
    for (const DMatch& d : m) { src.push_back(kT[d.queryIdx].pt); dst.push_back(kS[d.trainIdx].pt); }
    Mat mask, H = findHomography(src, dst, RANSAC, 3, mask);
    perspectiveTransform(ref, out, H);
    bool ok = countNonZero(mask) >= 10 && norm(out[0] - Point2f(369, 120)) < 5;
    cout << "[ORB] " << (ok ? "같은 #1 부품을 찾음" : "못 찾음") << endl;
    return 0;
}`, notes: '<p>템플릿 매칭이 <b>0.996 이라는 높은 점수</b>를 내는 것이 함정입니다 — 점수가 높아도 <b>원하는 물체가 아닐 수</b> 있습니다. 위치를 확인해야 하는 이유. ORB 는 이 사이트에서 (370.7, 117.9) 로 정답 (369, 120) 에 근접합니다. 💬 “점수만 믿으면 안 되는 이유는?” 로 마무리하세요. (12분)</p>' },
          { layout: 'summary', title: '14차시 정리', bullets: ['특징점(코너) + 기술자(주변 모습 요약) → 회전 · 크기가 바뀌어도 짝지을 수 있다', '<code>Ptr&lt;ORB&gt; orb = ORB::create(500); orb-&gt;detectAndCompute(img, noArray(), kps, desc);</code> — 기술자는 <b>32바이트(256비트)</b>', '<code>BFMatcher matcher(NORM_HAMMING, true);</code> → <code>vector&lt;DMatch&gt;</code> (distance 로 정렬)', '작은 템플릿에는 <code>copyMakeBorder</code> 로 <b>여백</b>을 붙인다', '<code>findHomography(…, RANSAC, 3, mask)</code> + <code>perspectiveTransform</code> → 위치 · 회전 · 배율', '<b>인라이어 개수</b>가 신뢰도 — 결과는 숫자보다 <b>판정 기준</b>으로 보고', 'QR 은 <code>QRCodeDetector::detectAndDecode</code> 한 줄', '다음: 사진 한 장이 아니라 <b>움직이는 영상</b> — VideoCapture (15차시)'], notes: '<p>여덟 줄을 정리합니다. 과제: 실습 1(nfeatures)과 <code>chip_rotated.png</code> 에 ORB 를 적용해 특징점을 관찰. OpenCV 5 에서 features2d → features, findHomography → geometry 모듈로 바뀐 점(📘 상자)도 한 번 짚어 주세요. 다음 차시 예고: “컨베이어 위를 지나가는 부품을 <b>한 번만</b> 세려면?” 을 질문으로 남기세요. (3분)</p>' }
        ]
      }
    ]
  });
})();
