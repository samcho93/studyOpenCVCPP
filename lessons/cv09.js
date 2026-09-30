/* 09차시 모폴로지 연산 */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 격자 만들기 도우미 (문자열 SVG)
  function grid(x0, y0, n, cell, cls, on) {
    let s = '';
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        s += `<rect x="${x0 + c * cell}" y="${y0 + r * cell}" width="${cell}" height="${cell}" class="${on(r, c) ? cls : 'card-bg'}"/>`;
        s += `<rect x="${x0 + c * cell}" y="${y0 + r * cell}" width="${cell}" height="${cell}" class="ln" fill="none"/>`;
      }
    }
    return s;
  }

  // 그림 1: 구조 요소(커널) 세 가지 모양
  const FIG_SE = `<svg viewBox="0 0 700 250" role="img" aria-label="MORPH_RECT MORPH_CROSS MORPH_ELLIPSE 세 가지 구조 요소의 5x5 모양">
  <text x="350" y="22" text-anchor="middle" class="tx-b">getStructuringElement(MORPH_____, Size(5, 5))</text>
  <text x="115" y="56" text-anchor="middle" class="tx-b">MORPH_RECT</text>
  ${grid(60, 68, 5, 22, 'p1', () => true)}
  <text x="115" y="206" text-anchor="middle" class="tx-m">1 이 25개 — 정사각형</text>
  <text x="115" y="228" text-anchor="middle" class="tx-m">가장 강하게 깎고 넓힌다</text>
  <text x="350" y="56" text-anchor="middle" class="tx-b">MORPH_CROSS</text>
  ${grid(295, 68, 5, 22, 'p3', (r, c) => r === 2 || c === 2)}
  <text x="350" y="206" text-anchor="middle" class="tx-m">1 이 9개 — 가로 · 세로만</text>
  <text x="350" y="228" text-anchor="middle" class="tx-m">가는 선 · 대각 무늬를 살린다</text>
  <text x="585" y="56" text-anchor="middle" class="tx-b">MORPH_ELLIPSE</text>
  ${grid(530, 68, 5, 22, 'p4', (r, c) => (r === 0 || r === 4 ? c === 2 : true))}
  <text x="585" y="206" text-anchor="middle" class="tx-m">1 이 17개 — 원(타원)</text>
  <text x="585" y="228" text-anchor="middle" class="tx-m">둥근 부품에 가장 자연스럽다</text>
</svg>`;

  // 그림 2: 침식과 팽창의 원리
  const FIG_ED = `<svg viewBox="0 0 740 320" role="img" aria-label="구조 요소가 완전히 들어가는 위치만 남기는 침식과 하나라도 겹치면 칠하는 팽창">
  ${ARROW('c09a1')}
  <text x="120" y="24" text-anchor="middle" class="tx-b">원본 (칠한 칸 = 물체, 값 ≠ 0)</text>
  ${grid(45, 36, 7, 22, 'p1', (r, c) => (r >= 2 && r <= 4 && c >= 1 && c <= 4) || (r === 0 && c === 6))}
  <text x="120" y="212" text-anchor="middle" class="tx-m">3×4 덩어리 + 외톨이 점 1개</text>
  <text x="120" y="234" text-anchor="middle" class="tx-m">흰 픽셀 = 13개</text>
  <text x="370" y="24" text-anchor="middle" class="tx-b">침식 erode (3×3 RECT)</text>
  ${grid(295, 36, 7, 22, 'p5', (r, c) => r === 3 && c >= 2 && c <= 3)}
  <text x="370" y="212" text-anchor="middle" class="tx-m">3×3 이 <tspan class="tx-b">완전히 들어가는</tspan> 중심만 남김</text>
  <text x="370" y="234" text-anchor="middle" class="tx-m">= 이웃의 최솟값 → 2개</text>
  <text x="370" y="256" text-anchor="middle" class="tx-b">외톨이 점은 사라진다 (잡음 제거)</text>
  <text x="620" y="24" text-anchor="middle" class="tx-b">팽창 dilate (3×3 RECT)</text>
  ${grid(545, 36, 7, 22, 'p2', (r, c) => (r >= 1 && r <= 5 && c >= 0 && c <= 5) || (r <= 1 && c >= 5))}
  <text x="620" y="212" text-anchor="middle" class="tx-m">3×3 이 <tspan class="tx-b">하나라도 겹치면</tspan> 칠함</text>
  <text x="620" y="234" text-anchor="middle" class="tx-m">= 이웃의 최댓값 → 33개</text>
  <text x="620" y="256" text-anchor="middle" class="tx-b">구멍 · 끊어진 틈이 메워진다</text>
  <line x1="208" y1="120" x2="288" y2="120" class="ln" stroke-width="2" marker-end="url(#c09a1)"/>
  <line x1="458" y1="120" x2="538" y2="120" class="ln" stroke-width="2" marker-end="url(#c09a1)"/>
  <text x="370" y="300" text-anchor="middle" class="tx-m">주의: OpenCV 의 모폴로지는 <tspan class="tx-b">밝은(흰) 값</tspan> 을 기준으로 동작한다 — 물체가 검으면 결과가 뒤바뀐다</text>
</svg>`;

  // 그림 3: 직접 구현 — 최솟값/최댓값 필터 (람다로 연산 바꾸기)
  const FIG_MINMAX = `<svg viewBox="0 0 740 230" role="img" aria-label="3x3 이웃의 최솟값이 침식, 최댓값이 팽창이고 람다로 연산을 바꿔 끼운다">
  ${ARROW('c09a4')}
  <text x="100" y="24" text-anchor="middle" class="tx-b">3×3 이웃 (회색 영상)</text>
  <rect x="40" y="36" width="120" height="90" rx="4" class="p1s"/>
  <line x1="40" y1="66" x2="160" y2="66" class="ln"/><line x1="40" y1="96" x2="160" y2="96" class="ln"/>
  <line x1="80" y1="36" x2="80" y2="126" class="ln"/><line x1="120" y1="36" x2="120" y2="126" class="ln"/>
  ${[[200, 210, 205], [198, 40, 207], [201, 199, 212]].map((row, r) => row.map((v, c) => `<text x="${60 + c * 40}" y="${57 + r * 30}" text-anchor="middle" class="${v === 40 ? 'tx-b' : 'tx-m'}">${v}</text>`).join('')).join('')}
  <text x="100" y="148" text-anchor="middle" class="tx-m">가운데가 작은 어두운 점</text>
  <line x1="170" y1="70" x2="270" y2="54" class="ln" stroke-width="2" marker-end="url(#c09a4)"/>
  <line x1="170" y1="92" x2="270" y2="112" class="ln" stroke-width="2" marker-end="url(#c09a4)"/>
  <rect x="280" y="30" width="200" height="44" rx="8" class="p5s"/><text x="380" y="50" text-anchor="middle" class="tx-b">erode = min → 40</text><text x="380" y="66" text-anchor="middle" class="tx-m">어두운 점이 3×3 으로 커진다</text>
  <rect x="280" y="92" width="200" height="44" rx="8" class="p2s"/><text x="380" y="112" text-anchor="middle" class="tx-b">dilate = max → 212</text><text x="380" y="128" text-anchor="middle" class="tx-m">어두운 점이 지워진다</text>
  <rect x="520" y="30" width="200" height="106" rx="8" class="card-bg"/>
  <text x="620" y="54" text-anchor="middle" class="tx-b">C++ 로 한 함수에</text>
  <text x="620" y="78" text-anchor="middle" class="tx-m">template&lt;typename Pick&gt;</text>
  <text x="620" y="98" text-anchor="middle" class="tx-m">morph3x3(src, init, pick)</text>
  <text x="620" y="120" text-anchor="middle" class="tx-m">pick = [](uchar a, uchar b){…}</text>
  <text x="370" y="180" text-anchor="middle" class="tx">이진 영상(0/255)이면 min = “모두 흰색일 때만 흰색”, max = “하나라도 흰색이면 흰색”</text>
  <text x="370" y="206" text-anchor="middle" class="tx-m">→ 그림 2 의 침식 · 팽창 규칙과 정확히 같다. 이미지 밖 이웃은 건너뛴다(OpenCV 기본 경계값)</text>
</svg>`;

  // 그림 4: 열기와 닫기
  const FIG_OPENCLOSE = `<svg viewBox="0 0 740 370" role="img" aria-label="열기는 침식 후 팽창으로 작은 점을 지우고 닫기는 팽창 후 침식으로 구멍을 메운다">
  ${ARROW('c09a2')}
  <text x="370" y="22" text-anchor="middle" class="tx-b">열기 MORPH_OPEN = 침식 → 팽창 : 작은 흰 점을 지우고 크기는 되돌린다</text>
  ${grid(60, 34, 6, 18, 'p1', (r, c) => (r >= 1 && r <= 4 && c >= 1 && c <= 4) || (r === 0 && c === 0) || (r === 5 && c === 5))}
  <text x="114" y="164" text-anchor="middle" class="tx-m">원본 + 점 2개</text>
  ${grid(290, 34, 6, 18, 'p5', (r, c) => r >= 2 && r <= 3 && c >= 2 && c <= 3)}
  <text x="344" y="164" text-anchor="middle" class="tx-m">① 침식 (점 사라짐)</text>
  ${grid(520, 34, 6, 18, 'p2', (r, c) => r >= 1 && r <= 4 && c >= 1 && c <= 4)}
  <text x="574" y="164" text-anchor="middle" class="tx-b">② 팽창 → 원래 크기</text>
  <line x1="180" y1="88" x2="284" y2="88" class="ln" stroke-width="2" marker-end="url(#c09a2)"/>
  <line x1="410" y1="88" x2="514" y2="88" class="ln" stroke-width="2" marker-end="url(#c09a2)"/>
  <line x1="20" y1="186" x2="720" y2="186" class="ln" stroke-dasharray="5 4"/>
  <text x="370" y="212" text-anchor="middle" class="tx-b">닫기 MORPH_CLOSE = 팽창 → 침식 : 작은 검은 구멍을 메우고 크기는 되돌린다</text>
  ${grid(60, 224, 6, 18, 'p1', (r, c) => !((r === 2 && c === 2) || (r === 3 && c === 4)))}
  <text x="114" y="354" text-anchor="middle" class="tx-m">원본 + 구멍 2개</text>
  ${grid(290, 224, 6, 18, 'p2', () => true)}
  <text x="344" y="354" text-anchor="middle" class="tx-m">① 팽창 (구멍 메움)</text>
  ${grid(520, 224, 6, 18, 'p4', () => true)}
  <text x="574" y="354" text-anchor="middle" class="tx-b">② 침식 → 원래 크기</text>
  <line x1="180" y1="278" x2="284" y2="278" class="ln" stroke-width="2" marker-end="url(#c09a2)"/>
  <line x1="410" y1="278" x2="514" y2="278" class="ln" stroke-width="2" marker-end="url(#c09a2)"/>
</svg>`;

  // 그림 5: 그래디언트 · 톱햇 · 블랙햇 (1D 프로파일)
  const FIG_HAT = `<svg viewBox="0 0 740 330" role="img" aria-label="한 줄 밝기 프로파일로 본 모폴로지 열기와 톱햇 블랙햇">
  <text x="370" y="22" text-anchor="middle" class="tx-b">한 줄의 밝기 프로파일로 보면</text>
  <text x="30" y="80" class="tx">원본</text>
  <path d="M120,96 L200,96 L200,60 L240,60 L240,96 L300,96 L300,110 L330,110 L330,96 L420,96 C440,96 470,58 500,58 C530,58 560,96 580,96 L700,96" class="s1" fill="none" stroke-width="2"/>
  <line x1="120" y1="118" x2="700" y2="118" class="ax"/>
  <text x="220" y="50" text-anchor="middle" class="tx-m">밝은 작은 점</text>
  <text x="315" y="132" text-anchor="middle" class="tx-m">어두운 작은 점</text>
  <text x="500" y="50" text-anchor="middle" class="tx-m">넓은 밝은 덩어리</text>
  <text x="30" y="210" class="tx">열기 OPEN</text>
  <path d="M120,220 L300,220 L300,234 L330,234 L330,220 L420,220 C440,220 470,182 500,182 C530,182 560,220 580,220 L700,220" class="s2" fill="none" stroke-width="2"/>
  <line x1="120" y1="242" x2="700" y2="242" class="ax"/>
  <text x="250" y="204" text-anchor="middle" class="tx-m">작은 밝은 점만 제거 (어두운 점 · 넓은 덩어리 유지)</text>
  <text x="30" y="296" class="tx-b">TOPHAT</text>
  <text x="30" y="314" class="tx-m">= 원본 − 열기</text>
  <path d="M120,316 L200,316 L200,280 L240,280 L240,316 L700,316" class="s3" fill="none" stroke-width="2"/>
  <line x1="120" y1="316" x2="700" y2="316" class="ax"/>
  <text x="400" y="300" text-anchor="middle" class="tx-b">밝은 작은 것만 남는다</text>
  <text x="590" y="300" text-anchor="middle" class="tx-m">BLACKHAT = 닫기 − 원본 → 어두운 작은 것만</text>
</svg>`;

  // 그림 6: 조명 기울기 제거 파이프라인
  const FIG_FLAT = `<svg viewBox="0 0 740 200" role="img" aria-label="큰 커널 닫기로 배경을 추정해 조명 기울기를 제거하는 순서">
  ${ARROW('c09a3')}
  <rect x="15" y="60" width="130" height="64" rx="8" class="p1s"/><text x="80" y="86" text-anchor="middle" class="tx-b">원본</text><text x="80" y="106" text-anchor="middle" class="tx-m">왼쪽 위 밝고 오른쪽 아래 어둡다</text>
  <rect x="185" y="60" width="150" height="64" rx="8" class="p2s"/><text x="260" y="82" text-anchor="middle" class="tx">MORPH_CLOSE (51×51)</text><text x="260" y="102" text-anchor="middle" class="tx-m">글자 · 점이 메워진</text><text x="260" y="118" text-anchor="middle" class="tx-m">배경(조명)만 남는다</text>
  <rect x="375" y="60" width="150" height="64" rx="8" class="p3s"/><text x="450" y="82" text-anchor="middle" class="tx">subtract(bg, img)</text><text x="450" y="102" text-anchor="middle" class="tx-m">= MORPH_BLACKHAT</text><text x="450" y="118" text-anchor="middle" class="tx-m">기울기가 사라진 평평한 영상</text>
  <rect x="565" y="60" width="160" height="64" rx="8" class="p4s"/><text x="645" y="82" text-anchor="middle" class="tx-b">고정 임계값 이진화</text><text x="645" y="102" text-anchor="middle" class="tx-m">전역 Otsu 로는 실패했던</text><text x="645" y="118" text-anchor="middle" class="tx-b">점 32개가 모두 나온다</text>
  <line x1="148" y1="92" x2="181" y2="92" class="ln" stroke-width="2" marker-end="url(#c09a3)"/>
  <line x1="338" y1="92" x2="371" y2="92" class="ln" stroke-width="2" marker-end="url(#c09a3)"/>
  <line x1="528" y1="92" x2="561" y2="92" class="ln" stroke-width="2" marker-end="url(#c09a3)"/>
  <text x="370" y="176" text-anchor="middle" class="tx-m">커널은 “지우고 싶은 것보다 크고, 배경 변화보다 작게” — 점 지름 17 px 이므로 51 이면 충분하다</text>
</svg>`;

  // ------------------------------------------------------------------ 1교시 예제
  const EX_SE = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat rect3 = getStructuringElement(MORPH_RECT, Size(3, 3));
    cout << "RECT 3x3:" << endl << rect3 << endl;

    Mat cross3 = getStructuringElement(MORPH_CROSS, Size(3, 3));
    cout << "CROSS 3x3:" << endl << cross3 << endl;

    Mat ellipse5 = getStructuringElement(MORPH_ELLIPSE, Size(5, 5));
    cout << "ELLIPSE 5x5:" << endl << ellipse5 << endl;
    cout << "형식: " << typeToString(ellipse5.type()) << endl;

    Mat rect5 = getStructuringElement(MORPH_RECT, Size(5, 5));
    Mat cross5 = getStructuringElement(MORPH_CROSS, Size(5, 5));
    cout << "RECT 5x5 의 1 개수    = " << countNonZero(rect5) << " / 25" << endl;
    cout << "CROSS 5x5 의 1 개수   = " << countNonZero(cross5) << " / 25" << endl;
    cout << "ELLIPSE 5x5 의 1 개수 = " << countNonZero(ellipse5) << " / 25" << endl;
    return 0;
}`;

  const EX_ED = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    // 7x7 작은 이진 이미지: 3x4 덩어리 + 외톨이 점 1개 (보기 좋게 값은 1 로)
    Mat m = Mat::zeros(7, 7, CV_8UC1);
    rectangle(m, Rect(1, 2, 4, 3), Scalar(1), FILLED);
    m.at<uchar>(0, 6) = 1;                           // (행 0, 열 6)
    cout << "원본 (흰 픽셀 " << countNonZero(m) << "개):" << endl << m << endl;

    Mat k = getStructuringElement(MORPH_RECT, Size(3, 3));

    Mat er, di;
    erode(m, er, k);
    cout << "침식 erode (흰 픽셀 " << countNonZero(er) << "개):" << endl << er << endl;

    dilate(m, di, k);
    cout << "팽창 dilate (흰 픽셀 " << countNonZero(di) << "개):" << endl << di << endl;
    return 0;
}`;

  const EX_MYMORPH = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

// 3x3 사각 구조 요소 모폴로지를 직접: 이웃 9칸을 pick 으로 하나씩 합친다
// pick = min 이면 침식, max 이면 팽창. 이미지 밖 이웃은 건너뛴다 (OpenCV 기본 경계값과 같음)
template <typename Pick>
Mat morph3x3(const Mat& src, uchar init, Pick pick)
{
    CV_Assert(src.type() == CV_8UC1);
    Mat dst(src.size(), CV_8UC1);
    for (int y = 0; y < src.rows; y++)
    {
        uchar* out = dst.ptr<uchar>(y);
        for (int x = 0; x < src.cols; x++)
        {
            uchar v = init;
            for (int yy = max(y - 1, 0); yy <= min(y + 1, src.rows - 1); yy++)
            {
                const uchar* p = src.ptr<uchar>(yy);
                for (int xx = max(x - 1, 0); xx <= min(x + 1, src.cols - 1); xx++)
                    v = pick(v, p[xx]);
            }
            out[x] = v;
        }
    }
    return dst;
}

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE), bin;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);

    auto pickMin = [](uchar a, uchar b) { return min(a, b); };   // 람다 = 이름 없는 함수
    auto pickMax = [](uchar a, uchar b) { return max(a, b); };

    Mat myEr = morph3x3(bin, 255, pickMin);
    Mat myDi = morph3x3(bin, 0, pickMax);
    Mat er, di, d1, d2;
    erode(bin, er, Mat());                     // 빈 Mat() = 기본 3x3 사각 구조 요소
    dilate(bin, di, Mat());
    absdiff(myEr, er, d1);
    absdiff(myDi, di, d2);
    cout << "이진 영상: erode 와 다른 픽셀 " << countNonZero(d1)
         << "개, dilate 와 다른 픽셀 " << countNonZero(d2) << "개" << endl;

    // 회색 영상에도 그대로: 침식 = 최솟값 필터, 팽창 = 최댓값 필터
    Mat gEr = morph3x3(img, 255, pickMin), gRef, d3;
    erode(img, gRef, Mat());
    absdiff(gEr, gRef, d3);
    cout << "회색 영상: erode 와 다른 픽셀 " << countNonZero(d3) << "개" << endl;
    cout << format("평균 밝기: 원본 %.1f → 침식 %.1f", mean(img)[0], mean(gEr)[0]) << endl;

    imshow("my erode", myEr);
    imshow("my dilate", myDi);
    waitKey(0);
    return 0;
}`;

  const EX_AREA = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat bin;
    // 백라이트 영상이라 부품이 어둡다 → THRESH_BINARY_INV 로 부품을 흰색으로
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    int a0 = countNonZero(bin);
    cout << "이진화 결과 면적 = " << a0 << " px" << endl;

    Mat k = getStructuringElement(MORPH_ELLIPSE, Size(5, 5));
    for (int it = 1; it <= 3; it++)
    {
        Mat er, di;
        erode(bin, er, k, Point(-1, -1), it);          // 앵커 (-1,-1) = 가운데, it = 반복 횟수
        dilate(bin, di, k, Point(-1, -1), it);
        int ae = countNonZero(er), ad = countNonZero(di);
        cout << format("iterations %d: 침식 %d (%.1f%%), 팽창 %d (%.1f%%)",
                       it, ae, 100.0 * ae / a0, ad, 100.0 * ad / a0) << endl;
    }

    Mat er3;
    erode(bin, er3, k, Point(-1, -1), 3);
    imshow("binary", bin);
    imshow("erode x3", er3);
    waitKey(0);
    return 0;
}`;

  const EX_SPECK = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat sp = imread("images/salt_pepper.png", IMREAD_GRAYSCALE);
    Mat bin, labels;
    threshold(sp, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    cout << "이진화 직후 덩어리 " << connectedComponents(bin, labels) - 1 << "개" << endl;

    Mat k3 = getStructuringElement(MORPH_RECT, Size(3, 3));
    Mat e1, e2;
    erode(bin, e1, k3);
    cout << "3x3 침식 1번  덩어리 " << connectedComponents(e1, labels) - 1 << "개" << endl;

    erode(bin, e2, k3, Point(-1, -1), 2);
    cout << "3x3 침식 2번  덩어리 " << connectedComponents(e2, labels) - 1 << "개" << endl;
    cout << "플랜지 면적: 원본 " << countNonZero(bin) << " → 2번 침식 " << countNonZero(e2) << " px" << endl;

    imshow("binary", bin);
    imshow("erode x2", e2);
    waitKey(0);
    return 0;
}`;

  const EX_BRIDGE = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    // 점선처럼 끊어진 선 12조각을 그립니다 (길이 18, 간격 12)
    Mat canvas = Mat::zeros(120, 400, CV_8UC1);
    for (int x = 20; x < 380; x += 30)
        line(canvas, Point(x, 60), Point(x + 18, 60), Scalar(255), 3);

    Mat labels;
    cout << "원본 조각 수 = " << connectedComponents(canvas, labels) - 1 << endl;
    cout << "흰 픽셀 = " << countNonZero(canvas) << endl;

    // 가로로 긴 커널(15x1) 로 팽창하면 좌우로 7 px 씩 자라 틈이 이어진다
    Mat kx = getStructuringElement(MORPH_RECT, Size(15, 1));     // Size(폭, 높이)!
    Mat joined;
    dilate(canvas, joined, kx);
    cout << "15x1 팽창 후 조각 수 = " << connectedComponents(joined, labels) - 1 << endl;
    cout << "흰 픽셀 = " << countNonZero(joined) << " (굵어진 만큼 늘어난다)" << endl;

    // 정사각 커널이면 선이 두꺼워지기까지 한다
    Mat k15 = getStructuringElement(MORPH_RECT, Size(15, 15));
    Mat fat;
    dilate(canvas, fat, k15);
    cout << "15x15 팽창 후 흰 픽셀 = " << countNonZero(fat) << endl;

    imshow("dashed", canvas);
    imshow("dilate 15x1", joined);
    imshow("dilate 15x15", fat);
    waitKey(0);
    return 0;
}`;

  const EX_TRACK_LOCAL = `// 🖥 Visual Studio: 트랙바 두 개로 모폴로지 연산과 커널 크기를 고르는 실험 도구
#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

struct MorphApp
{
    Mat bin;                 // 이진화는 한 번만 해 둔다
    int op = 2;              // 0 ERODE 1 DILATE 2 OPEN 3 CLOSE 4 GRADIENT 5 TOPHAT 6 BLACKHAT
    int half = 2;            // 커널 = 2 * half + 1 (항상 홀수)
};

void onChange(int, void* userdata)
{
    MorphApp& a = *static_cast<MorphApp*>(userdata);
    int k = 2 * a.half + 1;
    Mat kernel = getStructuringElement(MORPH_ELLIPSE, Size(k, k));
    Mat dst;
    morphologyEx(a.bin, dst, a.op, kernel);          // MorphTypes 는 int 값이라 그대로 넘긴다
    cout << "op " << a.op << ", ELLIPSE " << k << "x" << k << ", 면적 " << countNonZero(dst) << " px" << endl;
    imshow("morph", dst);
}

int main()
{
    MorphApp app;
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    if (img.empty()) return -1;
    threshold(img, app.bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);

    namedWindow("morph");
    createTrackbar("op", "morph", &app.op, 6, onChange, &app);
    createTrackbar("k (2k+1)", "morph", &app.half, 15, onChange, &app);
    onChange(0, &app);

    while (waitKey(0) != 27) {}                      // ESC 로 종료
    return 0;
}`;

  // ------------------------------------------------------------------ 2교시 예제
  const EX_MORPHEX = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE), bin;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    Mat k = getStructuringElement(MORPH_ELLIPSE, Size(7, 7));
    cout << "원본 이진 영상 면적 = " << countNonZero(bin) << " px" << endl;

    int ops[] = { MORPH_OPEN, MORPH_CLOSE, MORPH_GRADIENT, MORPH_TOPHAT, MORPH_BLACKHAT };
    string names[] = { "OPEN", "CLOSE", "GRADIENT", "TOPHAT", "BLACKHAT" };

    for (int i = 0; i < 5; i++)
    {
        Mat dst;
        morphologyEx(bin, dst, ops[i], k);
        cout << format("%-8s : 흰 픽셀 %6d px", names[i].c_str(), countNonZero(dst)) << endl;
        imshow(names[i], dst);
    }
    imshow("binary", bin);
    waitKey(0);
    return 0;
}`;

  const EX_OPENSP = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

// 윤곽선 전체 개수와, 부모가 있는(내부) 큰 윤곽선 = 구멍 개수
void report(const string& name, const Mat& bin)
{
    vector<vector<Point>> cs;
    vector<Vec4i> hi;
    findContours(bin, cs, hi, RETR_CCOMP, CHAIN_APPROX_SIMPLE);
    int holes = 0;
    for (size_t i = 0; i < cs.size(); i++)
        if (hi[i][3] >= 0 && contourArea(cs[i]) > 50) holes++;
    cout << format("%s : 윤곽선 %5d개, 구멍 %d개", name.c_str(), (int)cs.size(), holes) << endl;
}

int main()
{
    Mat sp = imread("images/salt_pepper.png", IMREAD_GRAYSCALE), bin;
    threshold(sp, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    Mat k = getStructuringElement(MORPH_ELLIPSE, Size(5, 5));

    Mat opened, cleaned;
    morphologyEx(bin, opened, MORPH_OPEN, k);          // 흰 점(소금) 제거
    morphologyEx(opened, cleaned, MORPH_CLOSE, k);     // 검은 점(후추) 메우기

    report("이진화만    ", bin);
    report("+ OPEN      ", opened);
    report("+ OPEN+CLOSE", cleaned);

    imshow("binary", bin);
    imshow("open + close", cleaned);
    waitKey(0);
    return 0;
}`;

  const EX_FLAT = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

// 덩어리 전체 수와, 그중 "점"(면적 150 이상 + 가로 세로 20 px 이하) 개수
// 반지름 8 원 → bbox 17x17, 면적 약 210 / 글자는 세로가 25 px 이상이라 걸러진다
void report(const string& name, const Mat& bin)
{
    Mat labels, stats, centroids;
    int n = connectedComponentsWithStats(bin, labels, stats, centroids);
    int dots = 0;
    for (int i = 1; i < n; i++)                        // 0 번 = 배경
    {
        int area = stats.at<int>(i, CC_STAT_AREA);
        int w = stats.at<int>(i, CC_STAT_WIDTH);
        int h = stats.at<int>(i, CC_STAT_HEIGHT);
        if (area >= 150 && w <= 20 && h <= 20) dots++;
    }
    cout << format("%s : 흰 픽셀 %6d px, 덩어리 %3d개, 점 %d개",
                   name.c_str(), countNonZero(bin), n - 1, dots) << endl;
}

int main()
{
    Mat img = imread("images/uneven_light.png", IMREAD_GRAYSCALE);

    // ① 전역 Otsu 로는 실패한다 (오른쪽 아래가 통째로 물체로 잡힌다)
    Mat otsu;
    threshold(img, otsu, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    report("전역 Otsu", otsu);

    // ② 큰 커널 CLOSE 로 배경(조명)만 남긴 뒤 빼면 = BLACKHAT
    Mat kBig = getStructuringElement(MORPH_ELLIPSE, Size(51, 51));
    Mat bg, flat;
    morphologyEx(img, bg, MORPH_CLOSE, kBig);
    subtract(bg, img, flat);                           // 배경 − 원본 = 어두운 것만 남는다
    double lo, hi;
    minMaxLoc(flat, &lo, &hi);
    cout << "보정 영상 밝기 범위 = " << lo << " ~ " << hi << endl;

    Mat bh, d;
    morphologyEx(img, bh, MORPH_BLACKHAT, kBig);       // 같은 계산을 한 줄로
    absdiff(bh, flat, d);
    cout << "MORPH_BLACKHAT 과 다른 픽셀 = " << countNonZero(d) << endl;

    // ③ 평평해졌으니 고정 임계값으로 충분하다
    Mat bin;
    threshold(flat, bin, 40, 255, THRESH_BINARY);
    report("보정 후  ", bin);

    imshow("original", img);
    imshow("otsu (fail)", otsu);
    imshow("blackhat", flat);
    imshow("corrected binary", bin);
    waitKey(0);
    return 0;
}`;

  const EX_DOTS = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/dot_matrix_date.png", IMREAD_GRAYSCALE);
    Mat bin, labels;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    cout << "이진화 직후 덩어리 = " << connectedComponents(bin, labels) - 1 << "개 (도트 하나하나)" << endl;

    int sizes[] = { 3, 5, 9, 15 };
    for (int s : sizes)
    {
        Mat k = getStructuringElement(MORPH_RECT, Size(s, s));
        Mat closed;
        morphologyEx(bin, closed, MORPH_CLOSE, k);
        cout << format("CLOSE %2dx%-2d → 덩어리 %d개", s, s, connectedComponents(closed, labels) - 1) << endl;
    }

    // 글자 단위로 묶으려면 세로로 길고 가로로 짧은 커널이 좋다
    Mat kv = getStructuringElement(MORPH_RECT, Size(5, 25));     // 폭 5, 높이 25
    Mat glyph;
    morphologyEx(bin, glyph, MORPH_CLOSE, kv);
    cout << "CLOSE 5x25 (세로로 길게) → 덩어리 " << connectedComponents(glyph, labels) - 1 << "개" << endl;

    imshow("binary", bin);
    imshow("close 5x25", glyph);
    waitKey(0);
    return 0;
}`;

  const EX_KSEL = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat bin, labels;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    int a0 = countNonZero(bin);
    cout << "원본 덩어리 " << connectedComponents(bin, labels) - 1 << "개 (닿은 부품 2쌍 때문에 13 이 아니다)" << endl;

    // 커널을 키우면 닿은 부품이 떨어지지만 형상도 망가진다
    int sizes[] = { 5, 11, 17, 23 };
    for (int s : sizes)
    {
        Mat k = getStructuringElement(MORPH_ELLIPSE, Size(s, s));
        Mat er;
        erode(bin, er, k);
        int n = connectedComponents(er, labels) - 1;
        cout << format("ELLIPSE %2d 침식 → 덩어리 %2d개, 남은 면적 %.1f%%", s, n, 100.0 * countNonZero(er) / a0) << endl;
    }
    cout << "커널이 커지면 분리는 되지만 면적 · 모양을 잃는다 → 12차시 거리 변환 + watershed 가 정답" << endl;
    return 0;
}`;

  // ------------------------------------------------------------------ 퀴즈
  const QUIZ1 = [
    { q: 'OpenCV 의 <code>erode</code> 는 무엇을 깎는가?', options: ['어두운(검은) 영역', '밝은(흰) 영역', '이미지 가장자리', '윤곽선만'], answer: 1,
      explain: '모폴로지는 <b>밝은 값</b>을 기준으로 동작합니다. <code>erode</code> 는 흰 영역을 한 겹 깎고(최솟값) <code>dilate</code> 는 흰 영역을 한 겹 넓힙니다(최댓값). 물체가 검게 나오는 영상이라면 <code>THRESH_BINARY_INV</code> 로 <b>물체를 흰색으로 먼저 바꾸세요</b> — 안 그러면 결과가 반대가 됩니다.' },
    { q: '<code>getStructuringElement(MORPH_CROSS, Size(5, 5))</code> 의 1 의 개수는?', options: ['5개', '9개', '17개', '25개'], answer: 1,
      explain: '십자(CROSS)는 가운데 행 5개 + 가운데 열 5개인데 교차점이 겹치므로 <b>5 + 5 − 1 = 9개</b> 입니다. RECT 5×5 는 25개, ELLIPSE 5×5 는 <b>17개</b>(가운데 3줄은 꽉 차고 위 · 아래 줄은 가운데 1개씩)입니다 — 예제 1 에서 직접 출력해 확인하세요.' },
    { q: '3×3 RECT 커널로 <code>erode(src, dst, k, Point(-1, -1), 2)</code> 를 하면?', options: ['효과가 없다', '한 번 한 것과 같다', '5×5 RECT 커널로 한 번 한 것과 같다', '커널이 자동으로 커진다'], answer: 2,
      explain: '다섯 번째 인수가 <code>iterations</code> 입니다. 3×3 RECT 침식을 2번 하면 흰 영역이 두 겹 깎여 <b>5×5 RECT 한 번</b>과 같습니다. ELLIPSE 는 반복하면 모양이 달라집니다(마름모에 가까워짐). 네 번째 인수 <code>Point(-1, -1)</code> 은 앵커 = 가운데입니다.' },
    { q: '끊어진 인쇄 글자의 <b>가로 방향</b> 틈만 잇고 싶습니다. 알맞은 커널은?', options: ['<code>Size(15, 15)</code> RECT', '<code>Size(15, 1)</code> RECT', '<code>Size(1, 15)</code> RECT', '<code>Size(3, 3)</code> ELLIPSE'], answer: 1,
      explain: '커널의 <b>모양이 곧 연산의 방향</b>입니다. <code>Size(폭, 높이)</code> 이므로 <code>Size(15, 1)</code> 은 가로로만 긴 커널 → 좌우로만 자라 <b>가로 틈만</b> 이어집니다. <code>Mat(행, 열)</code> 과 순서가 반대라는 점도 주의하세요.' },
    { q: '예제 3 의 <code>morph3x3(src, init, pick)</code> 로 침식을 하려면 <code>init</code> 과 <code>pick</code> 은?', options: ['init 0, pick = max', 'init 255, pick = min', 'init 0, pick = min', 'init 255, pick = max'], answer: 1,
      explain: '침식 = 이웃의 <b>최솟값</b>이므로 시작값은 가장 큰 값 <b>255</b> 로 두고 <code>min</code> 으로 줄여 나갑니다. init 을 0 으로 두면 min 결과가 항상 0 이 됩니다. 팽창은 반대로 init 0 + max 입니다. 람다 <code>[](uchar a, uchar b) { return min(a, b); }</code> 를 넘기면 같은 함수가 침식 · 팽창을 모두 합니다.' }
  ];

  const QUIZ2 = [
    { q: '작은 <b>흰 점(잡음)</b>을 지우면서 물체의 크기는 유지하려면?', options: ['<code>MORPH_OPEN</code>', '<code>MORPH_CLOSE</code>', '<code>MORPH_GRADIENT</code>', '<code>MORPH_TOPHAT</code>'], answer: 0,
      explain: '<b>열기(OPEN) = 침식 → 팽창</b>. 침식으로 작은 점을 없애고 팽창으로 남은 물체를 원래 크기로 되돌립니다. 반대로 <b>닫기(CLOSE) = 팽창 → 침식</b> 은 작은 검은 구멍을 메웁니다.' },
    { q: '<code>MORPH_GRADIENT</code> 의 결과는 무엇인가?', options: ['팽창 − 침식 = 테두리', '원본 − 열기', '닫기 − 원본', '침식 − 팽창'], answer: 0,
      explain: '모폴로지 그래디언트 = <b>팽창 − 침식</b> 이므로 물체의 경계만 굵은 선으로 남습니다. 커널이 3×3 이면 얇은 테두리, 크면 굵은 테두리가 됩니다. 에지 검출(10차시)의 아주 간단한 대안입니다.' },
    { q: '조명이 왼쪽 위만 밝은 영상에서 작은 검은 점을 찾으려 합니다. 가장 알맞은 것은?', options: ['전역 Otsu 이진화', '큰 커널 <code>MORPH_BLACKHAT</code> 후 고정 임계값', '작은 커널 <code>MORPH_TOPHAT</code>', '<code>MORPH_GRADIENT</code> 후 Otsu'], answer: 1,
      explain: '<b>BLACKHAT = 닫기 − 원본</b> 은 “배경보다 어두운 작은 것”만 남기므로 넓게 퍼진 조명 기울기가 사라집니다. 커널은 찾으려는 점보다 크게(여기서는 51) 잡습니다. 밝은 작은 것을 찾을 때는 <code>MORPH_TOPHAT</code> 입니다.' },
    { q: '<code>subtract(img, bg, flat);</code> 처럼 순서를 바꿔 쓰면(bg 는 CLOSE 결과) 어떻게 되나?', options: ['결과가 같다', '결과가 반전된다 (255 − 값)', '대부분 0 이 된다 — 8비트 뺄셈은 음수가 0 으로 잘리기 때문', '컴파일 오류'], answer: 2,
      explain: 'CLOSE 결과(배경)는 원본보다 항상 <b>크거나 같으므로</b> <code>img − bg</code> 는 음수 → <b>포화(saturate)</b> 로 0 이 됩니다. “어두운 것을 찾을 때는 밝은 배경에서 원본을 빼기”(<code>subtract(bg, img, flat)</code>) 를 기억하세요.' },
    { q: '모폴로지 커널 크기를 정하는 기준으로 가장 적절한 것은?', options: ['항상 3×3 이 좋다', '이미지 크기의 1/10', '지우거나 이어야 할 <b>대상의 크기</b>를 기준으로', '클수록 좋다'], answer: 2,
      explain: '커널은 “<b>지우고 싶은 것보다 크고, 남기고 싶은 것보다 작게</b>” 정합니다. 지름 17 px 점을 배경 추정에서 지우려면 21 이상, 12 px 틈을 이으려면 13 이상이 필요합니다. 무턱대고 크게 하면 남겨야 할 형상까지 망가집니다.' }
  ];

  CV_COURSE.addChapter({
    id: 'cv09', no: '09', title: '모폴로지 연산', subtitle: '침식 · 팽창 · 열기 · 닫기 · 그래디언트 · 톱햇 / 블랙햇',
    summary: '모폴로지(Morphology)는 <b>모양(구조 요소)</b>을 이용해 영상을 깎고 넓히는 연산입니다. 이진화 결과에 남은 잡음 점을 지우고, 끊어진 선을 잇고, 구멍을 메우고, 조명 기울기까지 없애는 실전 도구를 <code>erode</code> · <code>dilate</code> · <code>morphologyEx</code> 로 익히고, <b>템플릿 + 람다</b>로 침식 · 팽창을 직접 구현해 원리를 확인합니다. 결과는 <code>countNonZero</code> · <code>connectedComponents</code> 로 숫자로 검증합니다.',
    goals: [
      '구조 요소(getStructuringElement)의 모양 · 크기가 침식 · 팽창 결과를 어떻게 바꾸는지 설명하고 직접 구현할 수 있다',
      'MORPH_OPEN · CLOSE · GRADIENT · TOPHAT · BLACKHAT 의 정의와 쓰임을 구분해 쓸 수 있다',
      '실제 검사 영상에서 잡음 제거 · 도트 연결 · 조명 보정에 모폴로지를 적용해 개수를 정확히 셀 수 있다'
    ],
    sections: [
      {
        id: 'cv09-1', title: '침식과 팽창: 구조 요소로 깎고 넓히기', minutes: 50,
        goals: ['구조 요소(RECT · CROSS · ELLIPSE)의 모양을 출력해 확인할 수 있다', '침식 · 팽창을 최솟값 · 최댓값 필터로 직접 구현하고 OpenCV 결과와 비교할 수 있다', '침식 · 팽창이 면적과 덩어리 개수를 어떻게 바꾸는지 숫자로 설명할 수 있다'],
        flow: [['도입: 이진화 뒤에 남는 문제', 5], ['구조 요소와 원리', 12], ['직접 구현 · 면적 · iterations', 18], ['점 제거 · 틈 잇기', 10], ['정리 · 퀴즈', 5]],
        content: [
          { type: 'h', text: '이진화만으로는 끝나지 않는다' },
          { type: 'p', html: '07차시에서 이진화를, 08차시에서 필터를 배웠습니다. 그래도 실제 검사 영상의 이진화 결과에는 늘 이런 문제가 남습니다.' },
          { type: 'list', items: [
            '배경에 <b>작은 흰 점</b>들이 남았다 (먼지 · 잡음) → 물체로 잘못 세어진다',
            '물체 안에 <b>작은 검은 구멍</b>이 생겼다 (반사 · 표면 무늬) → 면적이 틀린다',
            '인쇄된 글자 · 선이 <b>끊어져</b> 있다 → 하나로 인식되지 않는다',
            '서로 <b>닿아 있는 부품</b>이 하나로 붙어 있다 → 개수가 틀린다 (washers.png 는 13개인데 11개)'
          ] },
          { type: 'p', html: '이 문제들은 “얼마나 밝은가”가 아니라 “<b>얼마나 크고 어떤 모양인가</b>”의 문제입니다. 그래서 밝기가 아니라 <b>모양(구조 요소)</b>으로 처리하는 <b>모폴로지(Morphology, 형태학)</b> 연산이 필요합니다.' },
          { type: 'h', text: '구조 요소(Structuring Element) = 모폴로지의 커널' },
          { type: 'p', html: '모폴로지도 커널을 쓰지만 값이 <b>0 과 1</b> 뿐입니다. 이 커널을 <b>구조 요소</b>라고 부르고, <code>getStructuringElement(모양, Size(폭, 높이))</code> 로 만듭니다. 결과는 <code>CV_8UC1</code> 형식의 작은 <code>Mat</code> 입니다. (Python: <code>cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))</code>)' },
          { type: 'figure', html: FIG_SE, caption: '그림 1. 구조 요소 세 가지. 모양이 결과의 성격을 정한다' },
          { type: 'code', title: '예제 1: 구조 요소를 직접 출력해 보기', code: EX_SE,
            desc: '<code>cout &lt;&lt; Mat</code> 으로 0 · 1 배치를 눈으로 확인하세요. <code>MORPH_RECT</code> 는 전부 1, <code>MORPH_CROSS</code> 는 가운데 행 · 열만 1(3×3 은 5개, 5×5 는 9개), <code>MORPH_ELLIPSE</code> 는 모서리를 뺀 원 모양입니다. ELLIPSE 5×5 는 21개가 아니라 <b>17개</b>라는 점을 눈으로 확인하세요 — 구조 요소의 실제 모양은 반드시 출력해서 확인하는 습관을 들이세요. <code>erode</code> · <code>dilate</code> 에 커널 대신 <b>빈 <code>Mat()</code></b> 을 넘기면 3×3 RECT 가 쓰입니다.',
            expect: 'RECT 3x3:\n[  1,   1,   1;\n   1,   1,   1;\n   1,   1,   1]\nCROSS 3x3:\n[  0,   1,   0;\n   1,   1,   1;\n   0,   1,   0]\nELLIPSE 5x5:\n[  0,   0,   1,   0,   0;\n   1,   1,   1,   1,   1;\n   1,   1,   1,   1,   1;\n   1,   1,   1,   1,   1;\n   0,   0,   1,   0,   0]\n형식: CV_8UC1\nRECT 5x5 의 1 개수    = 25 / 25\nCROSS 5x5 의 1 개수   = 9 / 25\nELLIPSE 5x5 의 1 개수 = 17 / 25' },
          { type: 'h', text: '침식(erode)과 팽창(dilate)' },
          { type: 'table', head: ['연산', '규칙', '결과', 'Python'], rows: [
            ['<b>침식 erode</b>', '구조 요소가 <b>완전히 들어가는</b> 중심만 1 (= 이웃의 최솟값)', '흰 영역이 한 겹 깎인다 · 작은 점 사라짐 · 붙은 것 떨어짐', '<code>cv2.erode</code>'],
            ['<b>팽창 dilate</b>', '구조 요소가 <b>하나라도 겹치면</b> 1 (= 이웃의 최댓값)', '흰 영역이 한 겹 자란다 · 구멍 메워짐 · 끊긴 것 이어짐', '<code>cv2.dilate</code>']
          ], caption: '표 1. 침식과 팽창. 둘은 서로 반대(쌍대) 연산이다' },
          { type: 'figure', html: FIG_ED, caption: '그림 2. 7×7 이진 영상에 3×3 RECT 구조 요소를 적용한 결과' },
          { type: 'callout', kind: 'warn', title: '가장 흔한 실수: 밝기 기준', html: 'OpenCV 의 모폴로지는 항상 <b>밝은(흰) 값</b>을 기준으로 동작합니다. <code>washers.png</code> 처럼 백라이트 영상에서는 부품이 <b>어둡게</b> 나오므로, 그대로 <code>erode</code> 하면 부품이 <b>커집니다</b>(배경이 깎이므로). 반드시 <code>THRESH_BINARY_INV</code> 로 <b>물체를 흰색으로</b> 만든 다음 모폴로지를 적용하세요.' },
          { type: 'code', title: '예제 2: 7×7 이진 영상에서 눈으로 확인', code: EX_ED,
            desc: '<code>Mat::zeros</code> 로 만든 7×7 영상에 <code>rectangle(..., FILLED)</code> 로 3×4 덩어리를, <code>at&lt;uchar&gt;(0, 6)</code> 으로 외톨이 점을 찍었습니다. 값을 255 대신 <b>1</b> 로 칠해서 출력을 읽기 쉽게 했습니다(모폴로지는 0 이 아니면 전경으로 봅니다). 침식하면 3×4 덩어리가 1×2 로 줄고 외톨이 점은 <b>완전히 사라집니다</b>. 팽창하면 덩어리가 사방으로 한 겹 자라고 외톨이 점도 커집니다(13 → 33개). 그림 2 와 값을 하나씩 맞춰 보세요.',
            expect: '원본 (흰 픽셀 13개):\n[  0,   0,   0,   0,   0,   0,   1;\n   0,   0,   0,   0,   0,   0,   0;\n   0,   1,   1,   1,   1,   0,   0;\n   0,   1,   1,   1,   1,   0,   0;\n   0,   1,   1,   1,   1,   0,   0;\n   0,   0,   0,   0,   0,   0,   0;\n   0,   0,   0,   0,   0,   0,   0]\n침식 erode (흰 픽셀 2개):\n[  0,   0,   0,   0,   0,   0,   0;\n   0,   0,   0,   0,   0,   0,   0;\n   0,   0,   0,   0,   0,   0,   0;\n   0,   0,   1,   1,   0,   0,   0;\n   0,   0,   0,   0,   0,   0,   0;\n   0,   0,   0,   0,   0,   0,   0;\n   0,   0,   0,   0,   0,   0,   0]\n팽창 dilate (흰 픽셀 33개):\n[  0,   0,   0,   0,   0,   1,   1;\n   1,   1,   1,   1,   1,   1,   1;\n   1,   1,   1,   1,   1,   1,   0;\n   1,   1,   1,   1,   1,   1,   0;\n   1,   1,   1,   1,   1,   1,   0;\n   1,   1,   1,   1,   1,   1,   0;\n   0,   0,   0,   0,   0,   0,   0]' },
          { type: 'h', text: 'C++ 로 직접 구현하기: 최솟값 · 최댓값 필터' },
          { type: 'p', html: '침식은 “이웃 중 <b>최솟값</b>”, 팽창은 “이웃 중 <b>최댓값</b>”입니다. 이진 영상(0/255)에서 최솟값이 255 라는 것은 “이웃이 <b>모두</b> 흰색”이라는 뜻이고, 최댓값이 255 라는 것은 “<b>하나라도</b> 흰색”이라는 뜻이니 그림 2 의 규칙과 같습니다. 두 연산은 “어떻게 합치는가”만 다르므로 <b>함수 템플릿</b>에 합치는 방법을 <b>람다(lambda)</b>로 넘기면 한 함수로 둘 다 만들 수 있습니다.' },
          { type: 'figure', html: FIG_MINMAX, caption: '그림 3. 침식 = 최솟값, 팽창 = 최댓값 — 합치는 방법(pick)만 바꿔 끼운다' },
          { type: 'code', title: '예제 3: 템플릿 + 람다로 침식 · 팽창 직접 구현', code: EX_MYMORPH,
            desc: '<code>template &lt;typename Pick&gt;</code> 는 “<code>pick</code> 이 무엇이든(함수 · 람다) 받는다”는 뜻이고, <code>[](uchar a, uchar b) { return min(a, b); }</code> 는 이름 없는 함수(람다)입니다. 이미지 밖 이웃은 <code>max(y - 1, 0)</code> · <code>min(y + 1, rows - 1)</code> 로 범위를 잘라 <b>건너뜁니다</b> — OpenCV 의 기본 경계값(<code>morphologyDefaultBorderValue()</code>)이 “밖은 결과에 영향 없음”이기 때문입니다. 이진 영상 · 회색 영상 모두 다른 픽셀이 <b>0개</b>면 성공입니다. 회색 영상의 침식은 어두운 쪽이 넓어지므로 평균 밝기가 내려갑니다.',
            expect: '이진 영상: erode 와 다른 픽셀 0개, dilate 와 다른 픽셀 0개\n회색 영상: erode 와 다른 픽셀 0개\n평균 밝기: 원본 191.8 → 침식 186.0' },
          { type: 'h', text: '면적 변화와 iterations' },
          { type: 'p', html: '모폴로지가 잘 되었는지 확인하는 가장 쉬운 방법은 <b>흰 픽셀 수</b>(<code>countNonZero</code>)를 세는 것입니다. 침식은 줄고 팽창은 늘어납니다. 같은 연산을 여러 번 하려면 <code>iterations</code> 인수를 씁니다: <code>erode(src, dst, kernel, Point(-1, -1), iterations)</code>.' },
          { type: 'code', title: '예제 4: washers 이진 영상의 면적 변화', code: EX_AREA,
            desc: '네 번째 인수는 앵커(<code>Point(-1, -1)</code> = 가운데), 다섯 번째가 <code>iterations</code> 입니다. 5×5 ELLIPSE 로 한 번 침식하면 테두리가 약 2 px 깎여 면적이 약 20% 줄어듭니다. 반복할수록 침식은 계속 줄고 팽창은 계속 늡니다. 얇은 부분(볼트 몸통 · 와셔 링)은 <b>먼저 끊어지고 사라집니다</b> — 결과 창의 <code>erode x3</code> 를 확인하세요. <code>format</code> 에서 <code>%</code> 글자는 <code>%%</code> 로 씁니다.',
            expect: '이진화 결과 면적 = 46478 px\niterations 1: 침식 37129 (79.9%), 팽창 55827 (120.1%)\niterations 2: 침식 27937 (60.1%), 팽창 65008 (139.9%)\niterations 3: 침식 18853 (40.6%), 팽창 74097 (159.4%)' },
          { type: 'callout', kind: 'tip', title: 'iterations vs 큰 커널', html: '<code>erode(3×3 RECT, iterations 2)</code> = <code>erode(5×5 RECT, iterations 1)</code> 입니다. RECT 커널이면 정확히 같고, ELLIPSE 는 모양이 조금 달라집니다(반복하면 마름모에 가까워짐). RECT 는 가로 · 세로로 분리해서 계산할 수 있어 큰 커널도 빠릅니다. 결과가 중요하면 <b>둘 다 해 보고 <code>absdiff</code> + <code>countNonZero</code> 로 비교</b>하세요.' },
          { type: 'h', text: '침식으로 점 지우기 · 팽창으로 틈 잇기' },
          { type: 'code', title: '예제 5: 침식으로 소금 잡음 덩어리 지우기', code: EX_SPECK,
            desc: '<code>salt_pepper.png</code> 를 이진화하면 배경에 흰 점(소금)이 남아 덩어리가 <b>7529개</b>나 됩니다. 3×3 침식 <b>한 번</b>으로 1픽셀 점이 모두 사라져 <b>24개</b>로 줄어듭니다. 그런데 <b>두 번 하면 다시 302개로 늘어납니다</b> — 플랜지 안의 검은 점(후추)이 커져서 플랜지가 조각조각 쪼개지기 때문입니다. 면적도 85044 → 26269 px 로 무너집니다. <b>침식만으로는 안 된다</b>는 것이 이 예제의 핵심이고, 해결책이 다음 교시의 <b>열기(OPEN)</b> 와 <b>닫기(CLOSE)</b> 입니다.',
            expect: '이진화 직후 덩어리 7529개\n3x3 침식 1번  덩어리 24개\n3x3 침식 2번  덩어리 302개\n플랜지 면적: 원본 85044 → 2번 침식 26269 px' },
          { type: 'code', title: '예제 6: 팽창으로 끊어진 선 잇기 (커널 모양이 방향을 정한다)', code: EX_BRIDGE,
            desc: '길이 18, 간격 12 인 점선 12조각을 만들었습니다. <code>Size(15, 1)</code> 커널은 <b>가로로만</b> 7 px 씩 자라므로 틈이 이어져 조각이 1개가 됩니다. 반면 <code>Size(15, 15)</code> 는 위아래로도 자라 선이 아주 두꺼워집니다. <b>커널의 모양이 곧 연산의 방향</b>이라는 것이 모폴로지의 핵심 감각입니다. 흰 픽셀 수도 함께 보세요: 15×1 은 1236 → 1823 으로 조금 늘지만 15×15 는 6961 로 5배 이상 뚱뚱해집니다. <code>Size</code> 는 <b>(폭, 높이)</b> 순서이고 <code>Mat(행, 열)</code> 은 (높이, 폭) 순서입니다 — 헷갈리기 쉬우니 주의!',
            expect: '원본 조각 수 = 12\n흰 픽셀 = 1236\n15x1 팽창 후 조각 수 = 1\n흰 픽셀 = 1823 (굵어진 만큼 늘어난다)\n15x15 팽창 후 흰 픽셀 = 6961' },
          { type: 'callout', kind: 'vs', title: 'Visual Studio 에서는 — 트랙바 실험 도구', html: '모폴로지는 인수(연산 · 모양 · 크기 · 반복)가 많아서 <b>화면에서 바꿔 보며 고르는 것</b>이 가장 빠릅니다. 로컬 PC 에서는 <code>createTrackbar</code> 두 개로 연산(0~6)과 커널 크기를 고르고, 결과와 <code>countNonZero</code> 를 함께 보여 주면 훌륭한 실험 도구가 됩니다. 이진화는 한 번만 해 두고 모폴로지만 다시 계산하는 구조(구조체 + <code>userdata</code> 포인터)를 눈여겨보세요. 16차시에서 이것을 클래스로 발전시킵니다.' },
          { type: 'code', title: '추가: 모폴로지 실험 도구 (Visual Studio)', code: EX_TRACK_LOCAL, run: false, local: true, file: 'main.cpp',
            desc: '<code>MORPH_ERODE</code>(0) ~ <code>MORPH_BLACKHAT</code>(6) 은 정수 상수이므로 트랙바 값을 그대로 <code>morphologyEx</code> 의 <code>op</code> 로 넘길 수 있습니다. 전역 변수 대신 <code>MorphApp</code> 구조체를 <code>void*</code> 로 넘겨 콜백에서 <code>static_cast</code> 로 되돌립니다. 브라우저에서는 <code>createTrackbar</code> 가 무시되므로, 예제 4 · 6 처럼 반복문으로 여러 값을 한 번에 비교하세요.' }
        ],
        practice: [
          {
            title: '구조 요소 모양에 따른 침식 결과 비교', level: 2,
            desc: '<code>images/washers.png</code> 를 이진화(<code>THRESH_BINARY_INV | THRESH_OTSU</code>)한 뒤 <b>같은 크기(7×7)</b>의 <code>MORPH_RECT</code> · <code>MORPH_CROSS</code> · <code>MORPH_ELLIPSE</code> 구조 요소로 각각 침식하고, 구조 요소의 1 개수 · 남은 면적 · 덩어리 개수를 출력하세요. 어느 모양이 가장 많이 깎는지 확인하고 이유를 설명하세요.',
            hint: '<code>int shapes[] = { MORPH_RECT, MORPH_CROSS, MORPH_ELLIPSE };</code> 와 <code>const char* names[] = { "RECT   ", "CROSS  ", "ELLIPSE" };</code> 를 만들고 <code>for</code> 로 돌리세요. 덩어리 수는 <code>connectedComponents(er, labels) - 1</code>. 구조 요소의 1 개수가 많을수록(RECT) 조건이 까다로워 더 많이 깎입니다.',
            expect: '원본 면적 46478 px\nRECT    (1 이 49개): 면적  29503 px (63.5%), 덩어리 11개\nCROSS   (1 이 13개): 면적  34259 px (73.7%), 덩어리 11개\nELLIPSE (1 이 33개): 면적  33028 px (71.1%), 덩어리 11개',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat bin, labels;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    cout << "원본 면적 " << countNonZero(bin) << " px" << endl;

    int shapes[] = { MORPH_RECT };
    const char* names[] = { "RECT" };
    for (int i = 0; i < 1; i++)
    {
        Mat k = getStructuringElement(shapes[i], Size(7, 7));
        Mat er;
        erode(bin, er, k);
        // TODO: 구조 요소의 1 개수 · 남은 면적 · 덩어리 개수를 출력하세요
        cout << names[i] << endl;
    }
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat bin, labels;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    int a0 = countNonZero(bin);
    cout << "원본 면적 " << a0 << " px" << endl;

    int shapes[] = { MORPH_RECT, MORPH_CROSS, MORPH_ELLIPSE };
    const char* names[] = { "RECT   ", "CROSS  ", "ELLIPSE" };
    for (int i = 0; i < 3; i++)
    {
        Mat k = getStructuringElement(shapes[i], Size(7, 7));
        Mat er;
        erode(bin, er, k);
        int a = countNonZero(er);
        int n = connectedComponents(er, labels) - 1;
        cout << format("%s (1 이 %2d개): 면적 %6d px (%.1f%%), 덩어리 %d개",
                       names[i], countNonZero(k), a, 100.0 * a / a0, n) << endl;
        imshow(names[i], er);
    }
    waitKey(0);
    return 0;
}`
          },
          {
            title: '점선 간격을 바꿔 가며 필요한 커널 폭 찾기', level: 2,
            desc: '예제 6 처럼 점선을 그리되 <b>간격을 8 · 12 · 20 px</b> 로 바꾸고, 각 경우에 <code>Size(w, 1)</code> 팽창으로 하나가 되는 <b>가장 작은 홀수 w</b> 를 찾아 출력하세요. 간격과 w 사이의 규칙을 마지막 줄에 쓰세요.',
            hint: '선 길이는 18 로 고정하고 <code>x += 18 + gap</code> 으로 그리세요. <code>for (int w = 3; w &lt;= 31; w += 2)</code> 안에서 <code>connectedComponents(d, labels) - 1 == 1</code> 이 되는 순간 <code>break</code>. 팽창은 좌우로 (w−1)/2 씩 자라므로 대략 <b>w − 1 ≥ 실제 틈</b> 이면 이어집니다. 두께 3 으로 그린 선은 끝이 조금 넓어져 실제 틈이 설정값보다 작다는 점도 관찰해 보세요.',
            expect: '간격  8 px: 조각 14개 → 최소 커널 폭 5\n간격 12 px: 조각 12개 → 최소 커널 폭 9\n간격 20 px: 조각 9개 → 최소 커널 폭 17\n규칙: 팽창은 좌우로 (w-1)/2 씩 자란다 → w 는 대략 실제 틈보다 커야 한다\n(두께 3 으로 그린 선은 끝이 넓어져 실제 틈이 설정값보다 작다)',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    int gaps[] = { 8, 12, 20 };
    Mat labels;
    for (int gap : gaps)
    {
        Mat canvas = Mat::zeros(120, 400, CV_8UC1);
        for (int x = 20; x < 360; x += 18 + gap)
            line(canvas, Point(x, 60), Point(x + 18, 60), Scalar(255), 3);
        int n0 = connectedComponents(canvas, labels) - 1;
        // TODO: w 를 3 부터 홀수로 키우며 하나로 이어지는 최소 w 를 찾으세요
        cout << "간격 " << gap << ": 조각 " << n0 << "개" << endl;
    }
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    int gaps[] = { 8, 12, 20 };
    Mat labels;
    for (int gap : gaps)
    {
        Mat canvas = Mat::zeros(120, 400, CV_8UC1);
        for (int x = 20; x < 360; x += 18 + gap)
            line(canvas, Point(x, 60), Point(x + 18, 60), Scalar(255), 3);
        int n0 = connectedComponents(canvas, labels) - 1;

        int found = -1;
        for (int w = 3; w <= 31; w += 2)
        {
            Mat k = getStructuringElement(MORPH_RECT, Size(w, 1));
            Mat d;
            dilate(canvas, d, k);
            if (connectedComponents(d, labels) - 1 == 1) { found = w; break; }
        }
        cout << format("간격 %2d px: 조각 %d개 → 최소 커널 폭 %d", gap, n0, found) << endl;
    }
    cout << "규칙: 팽창은 좌우로 (w-1)/2 씩 자란다 → w 는 대략 실제 틈보다 커야 한다" << endl;
    cout << "(두께 3 으로 그린 선은 끝이 넓어져 실제 틈이 설정값보다 작다)" << endl;
    return 0;
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: '모폴로지 ① 침식과 팽창', subtitle: '모양(구조 요소)으로 깎고 넓히기', notes: '<p>07 · 08차시 복습으로 시작합니다. 💬 “이진화 결과에 점이 남으면 어떻게 지울까요?” — 블러(08차시)는 밝기를 섞을 뿐 이진 영상에는 잘 안 맞습니다. 오늘은 <b>모양</b>으로 지웁니다. (2분)</p>' },
          { layout: 'bullets', title: '이진화 뒤에 남는 네 가지 문제', lead: '밝기로는 풀 수 없다', bullets: [
            '배경에 <b>작은 흰 점</b> — 물체로 잘못 세어진다',
            '물체 안 <b>작은 검은 구멍</b> — 면적이 틀린다',
            '인쇄 글자 · 선이 <b>끊어짐</b> — 하나로 인식 안 됨',
            '<b>닿은 부품</b>이 하나로 붙음 — washers.png 13개 → 11개',
            '공통점: “얼마나 밝은가”가 아니라 “<b>얼마나 크고 어떤 모양인가</b>”'
          ], notes: '<p>네 문제를 하나씩 읽으며 학생들에게 00차시 결과(11개 문제)를 떠올리게 합니다. 오늘은 앞의 세 가지를 해결하고, 네 번째(닿은 부품)는 12차시 watershed 로 넘긴다고 미리 말해 둡니다. (3분)</p>' },
          { layout: 'diagram', title: '구조 요소 = 모폴로지의 커널', html: FIG_SE, caption: 'MORPH_RECT(전부 1) · MORPH_CROSS(십자) · MORPH_ELLIPSE(원) — 값은 0 과 1 뿐', notes: '<p>💬 “CROSS 5×5 에서 1 은 몇 개일까요?” — 9개(5+5−1). 각 모양이 어울리는 대상(RECT = 네모난 부품 · 글자, ELLIPSE = 둥근 부품, CROSS = 가는 선 보존)을 짚어 줍니다. (4분)</p>' },
          { layout: 'code', title: '구조 요소를 출력해 보기', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat rect3 = getStructuringElement(MORPH_RECT, Size(3, 3));
    cout << "RECT 3x3:" << endl << rect3 << endl;

    Mat cross3 = getStructuringElement(MORPH_CROSS, Size(3, 3));
    cout << "CROSS 3x3:" << endl << cross3 << endl;

    Mat ellipse5 = getStructuringElement(MORPH_ELLIPSE, Size(5, 5));
    cout << "ELLIPSE 5x5:" << endl << ellipse5 << endl;
    cout << "1 의 개수 = " << countNonZero(ellipse5) << " / 25" << endl;
    return 0;
}`, points: ['<code>cout &lt;&lt; Mat</code> 으로 0 · 1 배치 확인', '커널 자리에 빈 <code>Mat()</code> → 기본 3×3 RECT', 'ELLIPSE 5×5 는 17개, CROSS 5×5 는 9개'], notes: '<p>학생에게 <code>Size(7, 7)</code> 로 바꿔 ELLIPSE 모양을 보게 합니다. 크기가 커질수록 원에 가까워지는 것을 확인. (4분)</p>' },
          { layout: 'diagram', title: '침식과 팽창의 규칙', html: FIG_ED, caption: '침식 = 완전히 들어가는 곳만(최솟값) / 팽창 = 하나라도 겹치면(최댓값)', notes: '<p>판서에서 3×3 창을 손으로 옮기며 몇 칸이 남는지 세어 봅니다. 💬 “외톨이 점은 왜 사라질까요?” — 3×3 이 완전히 들어갈 수 없다. ⚠ <b>흰색 기준</b>이라는 점을 여기서 강하게 강조합니다(THRESH_BINARY_INV). (5분)</p>' },
          { layout: 'code', title: '7×7 로 눈으로 확인', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat m = Mat::zeros(7, 7, CV_8UC1);
    rectangle(m, Rect(1, 2, 4, 3), Scalar(1), FILLED);
    m.at<uchar>(0, 6) = 1;                          // 외톨이 점
    cout << "원본 " << countNonZero(m) << "개" << endl << m << endl;

    Mat k = getStructuringElement(MORPH_RECT, Size(3, 3)), er, di;
    erode(m, er, k);
    cout << "침식 후 " << countNonZero(er) << "개" << endl << er << endl;
    dilate(m, di, k);
    cout << "팽창 후 " << countNonZero(di) << "개" << endl << di << endl;
    return 0;
}`, points: ['값을 1 로 칠하면 출력이 읽기 쉽다', '침식 13 → 2개 (외톨이 점 소멸)', '팽창 13 → 33개'], notes: '<p>출력된 0/1 격자를 그림 2 와 한 칸씩 맞춰 보게 합니다. 여기서 이해가 되면 나머지는 응용일 뿐입니다. 시간이 남으면 커널을 CROSS 로 바꿔 결과가 달라지는 것을 보여 줍니다. (5분)</p>' },
          { layout: 'diagram', title: '직접 구현: 최솟값 · 최댓값', html: FIG_MINMAX, caption: 'erode = min, dilate = max — 템플릿 함수에 람다로 연산을 바꿔 끼운다', notes: '<p>💬 “이진 영상에서 이웃의 최솟값이 255 라는 것은 무슨 뜻일까요?” — 이웃이 모두 흰색 = 침식 규칙과 같다. 람다를 처음 보는 학생에게는 “이름 없는 작은 함수를 변수처럼 넘긴다”고 설명합니다. (4분)</p>' },
          { layout: 'two', title: '템플릿 + 람다로 침식 · 팽창', left: { title: '함수 템플릿 (본문 예제 3)', run: false, code: `template <typename Pick>
Mat morph3x3(const Mat& src, uchar init, Pick pick)
{
    Mat dst(src.size(), CV_8UC1);
    for (int y = 0; y < src.rows; y++)
        for (int x = 0; x < src.cols; x++)
        {
            uchar v = init;
            for (int yy = max(y-1, 0); yy <= min(y+1, src.rows-1); yy++)
                for (int xx = max(x-1, 0); xx <= min(x+1, src.cols-1); xx++)
                    v = pick(v, src.at<uchar>(yy, xx));
            dst.at<uchar>(y, x) = v;
        }
    return dst;
}` }, right: { title: '람다로 연산 바꿔 끼우기', run: false, code: `auto pickMin = [](uchar a, uchar b) { return min(a, b); };
auto pickMax = [](uchar a, uchar b) { return max(a, b); };

Mat myEr = morph3x3(bin, 255, pickMin);   // 침식
Mat myDi = morph3x3(bin, 0, pickMax);     // 팽창

Mat er, d;
erode(bin, er, Mat());                    // 기본 3x3 RECT
absdiff(myEr, er, d);
cout << countNonZero(d) << endl;          // 0 이면 성공` }, notes: '<p>왼쪽은 함수 템플릿, 오른쪽은 사용법입니다. 본문 예제 3 을 ▶ 실행해 다른 픽셀 0개를 확인한 뒤, 학생에게 <code>pickMax</code> 로 팽창도 직접 비교하게 합니다. 💬 “init 을 0 으로 두고 min 을 쓰면?” — 모두 0 (퀴즈 5). <code>max(y-1, 0)</code> 으로 이미지 밖을 건너뛰는 요령도 짚습니다. (6분)</p>' },
          { layout: 'code', title: '면적 변화와 iterations', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE), bin;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    cout << "이진화 면적 = " << countNonZero(bin) << " px" << endl;

    Mat k = getStructuringElement(MORPH_ELLIPSE, Size(5, 5));
    for (int it = 1; it <= 3; it++)
    {
        Mat er, di;
        erode(bin, er, k, Point(-1, -1), it);
        dilate(bin, di, k, Point(-1, -1), it);
        cout << "it " << it << ": 침식 " << countNonZero(er) << ", 팽창 " << countNonZero(di) << endl;
    }
    return 0;
}`, points: ['<code>THRESH_BINARY_INV</code> 로 부품을 <b>흰색</b>으로 먼저!', '4번째 인수 = 앵커 <code>Point(-1,-1)</code>, 5번째 = iterations', '침식 ↓ 팽창 ↑ — 면적으로 확인하는 습관'], notes: '<p>💬 “침식을 3번 하면 볼트의 얇은 몸통은 어떻게 될까요?” — 끊어지고 사라진다. 본문 예제 4 로 결과 창에서 직접 확인시킵니다. <code>iterations 2</code> ≈ 큰 커널 1번이라는 관계도 함께 짚습니다. (5분)</p>' },
          { layout: 'code', title: '침식으로 소금 잡음 지우기', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat sp = imread("images/salt_pepper.png", IMREAD_GRAYSCALE), bin, labels;
    threshold(sp, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    cout << "이진화 직후 덩어리 " << connectedComponents(bin, labels) - 1 << "개" << endl;

    Mat k3 = getStructuringElement(MORPH_RECT, Size(3, 3)), e1, e2;
    erode(bin, e1, k3);
    cout << "침식 1번 덩어리 " << connectedComponents(e1, labels) - 1 << "개" << endl;
    erode(bin, e2, k3, Point(-1, -1), 2);
    cout << "침식 2번 덩어리 " << connectedComponents(e2, labels) - 1 << "개" << endl;
    cout << "면적 " << countNonZero(bin) << " → " << countNonZero(e2) << endl;
    imshow("erode x2", e2);
    waitKey(0);
    return 0;
}`, points: ['7529개 → 침식 1번에 <b>24개</b>로 정리', '하지만 2번 하면 <b>302개로 되돌아간다</b> (플랜지가 쪼개짐)', '면적도 85044 → 26269 px — 침식만으로는 안 된다'], notes: '<p>“문제 제기 → 다음 교시 해결”의 고리를 만듭니다. 💬 “왜 두 번 하면 오히려 늘어날까요?” — 플랜지 안의 후추 구멍이 커져 플랜지가 조각난다. 💬 “면적을 재야 하는 검사라면 괜찮을까?” — 안 된다 → OPEN · CLOSE 가 필요하다. (4분)</p>' },
          { layout: 'code', title: '팽창으로 끊어진 선 잇기', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat canvas = Mat::zeros(120, 400, CV_8UC1), labels;
    for (int x = 20; x < 380; x += 30)
        line(canvas, Point(x, 60), Point(x + 18, 60), Scalar(255), 3);
    cout << "조각 " << connectedComponents(canvas, labels) - 1 << "개" << endl;

    Mat kx = getStructuringElement(MORPH_RECT, Size(15, 1)), joined;
    dilate(canvas, joined, kx);
    cout << "15x1 팽창 후 " << connectedComponents(joined, labels) - 1 << "개" << endl;

    Mat k15 = getStructuringElement(MORPH_RECT, Size(15, 15)), fat;
    dilate(canvas, fat, k15);
    cout << "15x15 팽창 후 흰 픽셀 " << countNonZero(fat) << endl;
    imshow("dilate 15x1", joined);
    waitKey(0);
    return 0;
}`, points: ['<code>Size(15, 1)</code> = <b>(폭, 높이)</b> → 가로로만 자란다', '틈을 이으려면 (w−1) ≥ 실제 틈', '<b>커널 모양이 곧 연산의 방향</b>'], notes: '<p>💬 “세로로 끊어진 것을 이으려면?” — <code>Size(1, 15)</code>. <code>Mat(행, 열)</code> 과 <code>Size(폭, 높이)</code> 의 순서 차이를 다시 강조합니다. 실제 현장 예(레이저 마킹 문자 · 도트 인쇄)를 들어 주고 다음 교시 dot_matrix_date 를 예고. (4분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>morph3x3(src, init, pick)</code> 로 <b>침식</b>을 하려면?', options: ['init 0, pick = max', 'init 255, pick = min', 'init 0, pick = min', 'init 255, pick = max'], answer: 1, explain: '침식 = 이웃의 최솟값. 시작값을 가장 큰 255 로 두고 min 으로 줄여 나갑니다. 팽창은 init 0 + max.', notes: '<p>정답 2번. 이어서 💬 “물체가 검게 나오는 영상에 그대로 침식하면?” — 물체가 오히려 커진다(가장 흔한 실수). (2분)</p>' },
          { layout: 'practice', title: '실습: 구조 요소 모양 비교', desc: '<p>washers 이진 영상을 7×7 <code>MORPH_RECT</code> · <code>MORPH_CROSS</code> · <code>MORPH_ELLIPSE</code> 로 각각 침식하고 면적 · 덩어리 수를 출력하세요.</p><ul><li>구조 요소의 1 개수(<code>countNonZero(k)</code>)도 함께 출력</li><li>어느 모양이 가장 많이 깎는지, 왜?</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE), bin, labels;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    cout << "원본 면적 " << countNonZero(bin) << " px" << endl;

    int shapes[] = { MORPH_RECT };
    for (int s : shapes)
    {
        Mat k = getStructuringElement(s, Size(7, 7)), er;
        erode(bin, er, k);
        // TODO: 1 개수 · 면적 · 덩어리 수 출력
    }
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE), bin, labels;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    cout << "원본 면적 " << countNonZero(bin) << " px" << endl;

    int shapes[] = { MORPH_RECT, MORPH_CROSS, MORPH_ELLIPSE };
    for (int s : shapes)
    {
        Mat k = getStructuringElement(s, Size(7, 7)), er;
        erode(bin, er, k);
        cout << "1 이 " << countNonZero(k) << "개: 면적 " << countNonZero(er)
             << " px, 덩어리 " << connectedComponents(er, labels) - 1 << "개" << endl;
    }
    return 0;
}`, notes: '<p>정답의 방향: RECT(49개) 가 가장 많이 깎고 CROSS(13개) 가 가장 적게 깎습니다. “1 이 많을수록 조건이 까다로워 살아남기 어렵다”로 정리합니다. CROSS 는 가는 선을 잘 보존해 인쇄 · 배선 검사에 씁니다. 세 경우 모두 덩어리는 11개로 같다는 점(= 이 정도 침식으로는 접촉이 떨어지지 않는다)도 함께 짚어 주세요. (6분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['모폴로지 = <b>모양(구조 요소)</b> 으로 깎고 넓히는 연산. 항상 <b>흰색 기준</b>', '<code>getStructuringElement(MORPH_RECT / CROSS / ELLIPSE, Size(폭, 높이))</code>', '<b>침식</b> = 이웃의 최솟값 → 작은 점 제거 · 면적 감소', '<b>팽창</b> = 이웃의 최댓값 → 구멍 · 틈 메움 · 면적 증가', '직접 구현: <b>템플릿 + 람다</b>로 min/max 를 바꿔 끼운다', '커널의 <b>모양이 방향</b>을 정한다 (<code>Size(15, 1)</code> = 가로만)'], notes: '<p>세 가지를 강조: 흰색 기준 · 면적 변화 · 커널 모양. 다음 교시 예고: “면적을 잃지 않고 점만 지우는 방법(OPEN · CLOSE)” 과 “조명 기울기를 모폴로지로 없애는 방법(BLACKHAT)”. (2분)</p>' }
        ]
      },
      {
        id: 'cv09-2', title: 'morphologyEx: 열기 · 닫기 · 그래디언트 · 톱햇 / 블랙햇', minutes: 50,
        goals: ['MORPH_OPEN · CLOSE · GRADIENT · TOPHAT · BLACKHAT 의 정의와 결과를 구분할 수 있다', '큰 커널 모폴로지로 조명 기울기를 제거하고 connectedComponentsWithStats 로 점 개수를 정확히 셀 수 있다', '도트 인쇄를 CLOSE 로 이어 글자 덩어리를 만들고 커널 크기를 근거 있게 고를 수 있다'],
        flow: [['도입: 5가지 연산', 7], ['열기 · 닫기 실습', 13], ['조명 보정(BLACKHAT)', 15], ['도트 연결 · 커널 선택', 10], ['정리 · 퀴즈', 5]],
        content: [
          { type: 'h', text: '침식과 팽창을 짝지으면' },
          { type: 'p', html: '1교시의 문제는 “점은 지워지는데 물체도 같이 작아진다”였습니다. 해결은 간단합니다 — <b>깎은 뒤 다시 넓히면</b> 됩니다. 순서를 바꾸면 반대 효과가 나옵니다. 이 조합들을 <code>morphologyEx(src, dst, MORPH_____, kernel)</code> 한 줄로 씁니다. (Python: <code>cv2.morphologyEx(img, cv2.MORPH_OPEN, k)</code>)' },
          { type: 'table', head: ['op 상수', '정의', '효과', '언제'], rows: [
            ['<b>MORPH_OPEN</b> (열기)', '침식 → 팽창', '작은 <b>흰 점</b> 제거, 물체 크기 유지, 얇은 연결 끊기', '배경 잡음 제거, 붙은 물체 분리'],
            ['<b>MORPH_CLOSE</b> (닫기)', '팽창 → 침식', '작은 <b>검은 구멍</b> 메움, 끊긴 것 잇기, 크기 유지', '표면 반사 구멍, 도트 인쇄 연결'],
            ['<b>MORPH_GRADIENT</b>', '팽창 − 침식', '물체의 <b>테두리</b>만 남는다', '간단한 윤곽 추출, 굵기 확인'],
            ['<b>MORPH_TOPHAT</b> (톱햇)', '원본 − 열기', '배경보다 <b>밝은 작은 것</b>만 남는다', '어두운 배경의 흰 결함 · 글자'],
            ['<b>MORPH_BLACKHAT</b> (블랙햇)', '닫기 − 원본', '배경보다 <b>어두운 작은 것</b>만 남는다', '밝은 배경의 검은 점 · 기공 · 문자']
          ], caption: '표 2. morphologyEx 의 다섯 가지 연산. 모두 침식 · 팽창의 조합이다 (MORPH_ERODE · MORPH_DILATE 도 op 로 쓸 수 있다)' },
          { type: 'figure', html: FIG_OPENCLOSE, caption: '그림 4. 열기는 흰 점을 지우고, 닫기는 검은 구멍을 메운다 — 둘 다 물체 크기는 그대로' },
          { type: 'code', title: '예제 1: 다섯 연산을 한 번에 비교', code: EX_MORPHEX,
            desc: '<code>washers.png</code> 이진 영상에 7×7 ELLIPSE 로 다섯 연산을 적용합니다. 연산 상수를 <code>int ops[]</code> 배열에, 창 이름을 <code>string names[]</code> 배열에 담아 반복문으로 돌렸습니다. 흰 픽셀 수를 보면 성격이 보입니다: <b>OPEN</b> 은 원본보다 조금 줄고, <b>CLOSE</b> 는 조금 늘고, <b>GRADIENT</b> 는 테두리만이라 훨씬 적고, <b>TOPHAT · BLACKHAT</b> 은 “원본에서 빠진 부분”이라 아주 작습니다. 결과 창의 <code>GRADIENT</code> 이미지가 윤곽선처럼 보이는 것을 꼭 확인하세요.',
            expect: '원본 이진 영상 면적 = 46478 px\nOPEN     : 흰 픽셀  46301 px\nCLOSE    : 흰 픽셀  46716 px\nGRADIENT : 흰 픽셀  26902 px\nTOPHAT   : 흰 픽셀    177 px\nBLACKHAT : 흰 픽셀    238 px' },
          { type: 'code', title: '예제 2: 소금-후추 이진 영상을 OPEN + CLOSE 로 정리', code: EX_OPENSP,
            desc: '08차시에서 <code>medianBlur</code> 로 풀었던 문제를 <b>이진화 뒤 모폴로지로</b> 풀어 봅니다. <code>MORPH_OPEN</code> 은 배경의 흰 점(소금)을, <code>MORPH_CLOSE</code> 는 플랜지 안의 검은 점(후추)을 없앱니다. 두 연산을 차례로 적용하면 윤곽선이 <b>10399개 → 11개</b>로 줄고 <b>큰 구멍은 정확히 7개</b>가 됩니다(<code>flange.png</code> 원본과 같은 값). OPEN 만 하면 구멍이 <b>10개</b>로 틀리게 나오는 것도 확인하세요 — 후추 점이 아직 남아 큰 구멍처럼 보이기 때문입니다. <b>순서가 중요합니다</b>: CLOSE 를 먼저 하면 배경의 흰 점들이 서로 붙어 지울 수 없는 덩어리가 됩니다 (실습 1).',
            expect: '이진화만     : 윤곽선 10399개, 구멍 7개\n+ OPEN       : 윤곽선  2114개, 구멍 10개\n+ OPEN+CLOSE : 윤곽선    11개, 구멍 7개' },
          { type: 'callout', kind: 'tip', title: '순서를 정하는 요령', html: '<b>지우고 싶은 것이 흰 점이면 OPEN 부터, 검은 구멍이면 CLOSE 부터</b> 입니다. 둘 다 있으면 보통 <b>OPEN → CLOSE</b> 가 안전합니다(작은 흰 점을 먼저 없애야 CLOSE 가 그것을 키우지 않습니다). 커널은 “잡음보다 크고 물체보다 작게”: 1~3 px 점에는 3×3 ~ 5×5 면 충분합니다.' },
          { type: 'h', text: '톱햇 · 블랙햇으로 조명 기울기 없애기' },
          { type: 'p', html: '큰 커널로 <code>MORPH_CLOSE</code> 를 하면 작은 글자 · 점은 모두 메워지고 <b>넓게 퍼진 배경(조명)만</b> 남습니다. 이 배경에서 원본을 빼면 조명 기울기가 사라진 평평한 영상이 됩니다 — 이것이 바로 <b>BLACKHAT</b> 입니다. 그러면 <b>고정 임계값 하나로</b> 전체를 이진화할 수 있습니다.' },
          { type: 'figure', html: FIG_HAT, caption: '그림 5. 한 줄 프로파일로 본 OPEN · TOPHAT. 톱햇은 밝은 작은 것만, 블랙햇은 어두운 작은 것만 남긴다' },
          { type: 'figure', html: FIG_FLAT, caption: '그림 6. 큰 커널 CLOSE → 배경 − 원본(BLACKHAT) → 고정 임계값 = 조명 보정 파이프라인' },
          { type: 'image', src: 'images/uneven_light.png', caption: 'uneven_light.png — 왼쪽 위가 밝고 오른쪽 아래가 어둡다. 글자 3줄 + 검은 점 32개(4행×8열, 반지름 8)', width: 420 },
          { type: 'code', title: '예제 3: 조명 기울기 제거 후 점 32개 세기', code: EX_FLAT,
            desc: '<b>전역 Otsu</b> 는 오른쪽 아래 어두운 영역을 통째로 물체로 잡아 실패합니다. 반면 51×51 ELLIPSE 로 <code>MORPH_CLOSE</code> 해서 만든 배경에서 원본을 빼면(= BLACKHAT) 밝기가 0 근처로 모여 <b>고정 임계값 40</b> 하나로 깔끔하게 이진화됩니다. <code>MORPH_BLACKHAT</code> 한 줄과 결과가 같은 것도 확인하세요(다른 픽셀 0). 전역 Otsu 는 같은 기준으로 점이 12개밖에 안 나옵니다. 보정 후에는 글자까지 함께 나오지만(덩어리 85개), 점은 <b>bbox 17×17 · 면적 약 210</b> 이고 글자는 더 크므로 “면적 150 이상 + 가로 세로 20 px 이하”로 걸러 <b>점 32개</b>가 정확히 나옵니다. <code>connectedComponentsWithStats</code> 는 덩어리마다 <code>stats</code> 한 행(<code>CC_STAT_LEFT · TOP · WIDTH · HEIGHT · AREA</code>, <code>int</code>)과 중심(<code>centroids</code>, <code>double</code>)을 돌려줍니다 — <code>stats.at&lt;int&gt;(i, CC_STAT_AREA)</code> 처럼 읽습니다 (12차시에서 자세히).',
            expect: '전역 Otsu : 흰 픽셀 147364 px, 덩어리 156개, 점 12개\n보정 영상 밝기 범위 = 0 ~ 199\nMORPH_BLACKHAT 과 다른 픽셀 = 0\n보정 후   : 흰 픽셀  23444 px, 덩어리  85개, 점 32개' },
          { type: 'callout', kind: 'warn', title: 'subtract 의 순서와 포화', html: '<code>subtract(bg, img, flat)</code> 는 <b>bg − img</b> 입니다. 8비트 영상의 뺄셈은 <b>0 에서 잘립니다</b>(포화) — 음수가 되지 않으므로 순서를 바꾸면 결과가 거의 0 이 됩니다. “어두운 것을 찾을 때는 밝은 배경에서 원본을 빼기”라고 기억하세요. C++ 연산자로 <code>Mat flat = bg - img;</code> 라고 써도 같은 포화 뺄셈입니다.' },
          { type: 'h', text: '도트 인쇄를 글자 덩어리로 묶기' },
          { type: 'code', title: '예제 4: dot_matrix_date 의 점을 CLOSE 로 잇기', code: EX_DOTS,
            desc: '<code>dot_matrix_date.png</code> 는 잉크젯 도트(반지름 약 2.2 px, 피치 6 px)로 찍은 2줄 인쇄 “EXP 2027.09.30” · “LOT A2309-117” 입니다. 이진화 직후에는 덩어리가 <b>186개</b>(점들이 부분적으로만 붙어 있음)여서 글자를 읽을 수 없습니다. 커널을 키우며 <code>MORPH_CLOSE</code> 하면 92 → 88 → 45 → 12개로 줄어드는데, <b>15×15 에서는 12개</b> — 글자를 지나 단어 · 숫자 그룹까지 붙어 버립니다. 글자 피치가 36 px 이므로 정사각 커널을 너무 키우면 안 됩니다. <code>Size(5, 25)</code> 처럼 <b>세로로 긴</b> 커널을 쓰면 세로로만 잘 붙어 <b>28개</b>, 즉 실제 글자 수(공백 제외 25개)에 가까워집니다.',
            expect: '이진화 직후 덩어리 = 186개 (도트 하나하나)\nCLOSE  3x3  → 덩어리 92개\nCLOSE  5x5  → 덩어리 88개\nCLOSE  9x9  → 덩어리 45개\nCLOSE 15x15 → 덩어리 12개\nCLOSE 5x25 (세로로 길게) → 덩어리 28개' },
          { type: 'code', title: '예제 5: 커널 크기를 키우면 무엇을 잃는가', code: EX_KSEL,
            desc: '<code>washers.png</code> 의 닿아 있는 부품 2쌍을 침식으로 떼어 낼 수 있을까요? 결과를 보면 <b>끝까지 13개가 되지 않습니다</b>: 11 → 12(k=11) → <b>55</b>(k=17, 얇은 부분이 쪼개져 조각이 폭발) → 6(k=23, 작은 부품이 아예 사라짐). 면적은 79.9% → 4.2% 로 무너집니다. 모폴로지로 접촉 분리를 억지로 하면 안 되고, <b>거리 변환 + watershed</b>(12차시)를 써야 하는 이유입니다. 커널 크기는 항상 “무엇을 잃는가”를 같이 봐야 합니다.',
            expect: '원본 덩어리 11개 (닿은 부품 2쌍 때문에 13 이 아니다)\nELLIPSE  5 침식 → 덩어리 11개, 남은 면적 79.9%\nELLIPSE 11 침식 → 덩어리 12개, 남은 면적 50.7%\nELLIPSE 17 침식 → 덩어리 55개, 남은 면적 23.0%\nELLIPSE 23 침식 → 덩어리  6개, 남은 면적 4.2%\n커널이 커지면 분리는 되지만 면적 · 모양을 잃는다 → 12차시 거리 변환 + watershed 가 정답' },
          { type: 'table', head: ['목적', '연산 · 커널', '크기 기준'], rows: [
            ['배경의 잡음 점 제거', '<code>MORPH_OPEN</code>, ELLIPSE', '점 지름보다 크게 (1~3 px 점 → 3~5)'],
            ['물체 안 구멍 메우기', '<code>MORPH_CLOSE</code>, ELLIPSE', '구멍 지름보다 크게'],
            ['끊어진 선 · 도트 잇기', '<code>MORPH_CLOSE</code> / <code>dilate</code>, 방향에 맞는 직사각', '틈보다 크게 (틈 + 1 이상)'],
            ['테두리만 보기', '<code>MORPH_GRADIENT</code>, RECT 3×3', '작게 (굵기 ≈ 커널 크기)'],
            ['밝은 작은 결함 찾기', '<code>MORPH_TOPHAT</code>, ELLIPSE', '결함보다 크고 배경 변화보다 작게'],
            ['어두운 작은 결함 · 조명 보정', '<code>MORPH_BLACKHAT</code>, ELLIPSE', '대상보다 훨씬 크게 (31 ~ 71)'],
            ['접촉 부품 분리', '<b>모폴로지로 하지 말 것</b>', '거리 변환 + watershed (12차시)']
          ], caption: '표 3. 목적별 연산과 커널 크기. 크기는 항상 “대상의 크기”에서 출발한다' },
          { type: 'callout', kind: 'more', title: '📘 회색 영상에도 쓸 수 있다', html: '모폴로지는 이진 영상 전용이 아닙니다. 1교시 예제 3 에서 직접 확인했듯이 회색 영상에서 <b>침식 = 이웃 중 최솟값</b>, <b>팽창 = 이웃 중 최댓값</b> 이 됩니다(min/max 필터). 그래서 <code>MORPH_TOPHAT</code> · <code>MORPH_BLACKHAT</code> 이 이진화 전의 <b>조명 보정</b>에 쓰일 수 있는 것입니다. 예제 3 은 이진화 전 회색 영상에 모폴로지를 적용한 예입니다.' },
          { type: 'callout', kind: 'vs', title: 'Visual Studio 에서는 — 레시피로 저장하기', html: '현장 검사 프로그램은 보통 <b>레시피(recipe)</b> 로 “연산 · 커널 모양 · 크기 · 반복”을 저장해 둡니다. <code>MORPH_*</code> 상수는 정수이므로 <code>cv::FileStorage</code> 로 YAML/JSON 에 <code>int</code> 로 저장하고 읽어 와 그대로 <code>morphologyEx</code> 에 넘기면 됩니다. 17차시 검사 프로젝트에서 이 구조를 <code>struct MorphStep { int op, shape, ksize, iterations; };</code> 와 <code>vector&lt;MorphStep&gt;</code> 로 만듭니다.' },
          { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 · 오개념 지도 · 평가', html: '<ul><li><b>준비</b>: 예제 3 은 결과 창에 이미지가 4개 나옵니다 — <code>otsu (fail)</code> 와 <code>corrected binary</code> 를 나란히 비교하는 것이 이 교시의 하이라이트입니다. 미리 한 번 실행해 두세요.</li><li><b>오개념 1</b>: “OPEN 은 구멍을 메운다” → 반대입니다. <b>OPEN = 흰 점 제거</b>, <b>CLOSE = 검은 구멍 메움</b>. 그림 4 로 반복 확인.</li><li><b>오개념 2</b>: “커널이 크면 좋다” → 예제 5 로 “면적 · 형상을 잃는다”를 숫자로 보여 주세요.</li><li><b>오개념 3</b>: “모폴로지는 이진 영상만” → 1교시 예제 3(회색 영상 min 필터)과 예제 3(조명 보정)으로 설명.</li><li><b>오개념 4</b>: 물체가 검은 영상에 그대로 OPEN 을 적용 → 결과가 반대. 1교시의 <code>THRESH_BINARY_INV</code> 규칙을 다시 강조.</li><li><b>C++ 포인트</b>: <code>stats.at&lt;int&gt;(i, CC_STAT_AREA)</code> 의 형식(<code>int</code>), 0번 라벨 = 배경이라 <code>i = 1</code> 부터, <code>Size(폭, 높이)</code> 순서.</li><li><b>평가 루브릭</b>: ① 다섯 연산의 정의와 효과를 구분한다(30%) ② 목적에 맞는 연산 · 커널을 근거와 함께 고른다(40%) ③ 결과를 개수 · 면적으로 검증한다(30%).</li><li>💬 마무리 발문: “모폴로지로도 안 되는 것은?” — 서로 닿은 물체 분리, 물체와 같은 크기의 잡음. 12차시(윤곽선 · watershed)로 이어 줍니다.</li></ul>' }
        ],
        practice: [
          {
            title: 'OPEN 과 CLOSE 의 순서를 바꿔 보기', level: 2,
            desc: '<code>images/salt_pepper.png</code> 를 이진화한 뒤 ① <code>MORPH_OPEN</code> → <code>MORPH_CLOSE</code> ② <code>MORPH_CLOSE</code> → <code>MORPH_OPEN</code> 두 순서로 5×5 ELLIPSE 모폴로지를 적용하고, 각각의 <b>윤곽선 개수</b>와 <b>흰 픽셀 수</b>를 출력해 비교하세요. 왜 순서가 중요한지 주석으로 설명하세요.',
            hint: '<code>morphologyEx(bin, a1, MORPH_OPEN, k); morphologyEx(a1, a2, MORPH_CLOSE, k);</code> 순으로 이어 붙입니다. 윤곽선 개수는 <code>vector&lt;vector&lt;Point&gt;&gt; cs; findContours(a2, cs, RETR_CCOMP, CHAIN_APPROX_SIMPLE);</code> 후 <code>cs.size()</code>. 같은 출력을 두 번 하므로 <code>void show(const string&amp; name, const Mat&amp; bin)</code> 함수로 만들면 깔끔합니다.',
            expect: 'OPEN -> CLOSE : 윤곽선    11개, 흰 픽셀 78003 px\nCLOSE -> OPEN : 윤곽선    32개, 흰 픽셀 80982 px',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat sp = imread("images/salt_pepper.png", IMREAD_GRAYSCALE), bin;
    threshold(sp, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    Mat k = getStructuringElement(MORPH_ELLIPSE, Size(5, 5));

    // TODO: OPEN → CLOSE 순서로 적용해 윤곽선 개수와 흰 픽셀 수를 출력하세요
    Mat a1, a2;

    // TODO: CLOSE → OPEN 순서로도 해 보고 비교하세요
    Mat b1, b2;

    imshow("binary", bin);
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

void show(const string& name, const Mat& bin)
{
    vector<vector<Point>> cs;
    findContours(bin, cs, RETR_CCOMP, CHAIN_APPROX_SIMPLE);
    cout << format("%s : 윤곽선 %5d개, 흰 픽셀 %d px", name.c_str(), (int)cs.size(), countNonZero(bin)) << endl;
}

int main()
{
    Mat sp = imread("images/salt_pepper.png", IMREAD_GRAYSCALE), bin;
    threshold(sp, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    Mat k = getStructuringElement(MORPH_ELLIPSE, Size(5, 5));

    Mat a1, a2;
    morphologyEx(bin, a1, MORPH_OPEN, k);
    morphologyEx(a1, a2, MORPH_CLOSE, k);
    show("OPEN -> CLOSE", a2);

    Mat b1, b2;
    morphologyEx(bin, b1, MORPH_CLOSE, k);
    morphologyEx(b1, b2, MORPH_OPEN, k);
    show("CLOSE -> OPEN", b2);

    // CLOSE 를 먼저 하면 배경의 흰 점들이 서로 이어져 큰 덩어리가 되고,
    // 뒤따르는 OPEN 으로도 지워지지 않는다. 그래서 작은 것을 없애는 OPEN 을 먼저 한다.
    imshow("OPEN then CLOSE", a2);
    imshow("CLOSE then OPEN", b2);
    waitKey(0);
    return 0;
}`
          },
          {
            title: '조명 보정 커널 크기의 영향', level: 3,
            desc: '예제 3 의 파이프라인에서 <code>MORPH_CLOSE</code> 커널 크기를 <b>11 · 21 · 51</b> 로 바꿔 가며 보정 → 고정 임계값 40 이진화 → “면적 150 이상 · 가로 세로 20 px 이하” 성분 개수를 출력하세요. 점 32개가 정확히 나오는 커널 범위를 찾고, 커널이 너무 작으면 왜 실패하는지 설명하세요.',
            hint: '점의 지름이 17 px 이므로 커널이 그보다 작으면 CLOSE 가 점을 메우지 못해 배경에 점이 그대로 남고, 빼면 점이 사라집니다. <code>connectedComponentsWithStats(bin, labels, stats, cents)</code> 후 <code>for (int i = 1; i &lt; n; i++)</code> 에서 <code>stats.at&lt;int&gt;(i, CC_STAT_AREA)</code> · <code>CC_STAT_WIDTH</code> · <code>CC_STAT_HEIGHT</code> 를 검사하세요.',
            expect: '커널 11: 흰 픽셀  16256 px, 둥근 점 0개\n커널 21: 흰 픽셀  23297 px, 둥근 점 32개\n커널 51: 흰 픽셀  23444 px, 둥근 점 32개\n점 지름이 17 px 이므로 커널이 그보다 충분히 커야 CLOSE 가 점을 메우고 배경만 남는다',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/uneven_light.png", IMREAD_GRAYSCALE);
    int sizes[] = { 11, 21, 51 };
    for (int s : sizes)
    {
        Mat k = getStructuringElement(MORPH_ELLIPSE, Size(s, s));
        Mat bg;
        morphologyEx(img, bg, MORPH_CLOSE, k);
        // TODO: bg - img 로 보정하고, 임계값 40 으로 이진화한 뒤
        //       면적 150 이상 · 가로 세로 20 px 이하인 성분 개수를 출력하세요
        cout << "커널 " << s << endl;
    }
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/uneven_light.png", IMREAD_GRAYSCALE);
    int sizes[] = { 11, 21, 51 };
    for (int s : sizes)
    {
        Mat k = getStructuringElement(MORPH_ELLIPSE, Size(s, s));
        Mat bg, flat, bin;
        morphologyEx(img, bg, MORPH_CLOSE, k);
        subtract(bg, img, flat);
        threshold(flat, bin, 40, 255, THRESH_BINARY);

        Mat labels, stats, cents;
        int n = connectedComponentsWithStats(bin, labels, stats, cents);
        int dots = 0;
        for (int i = 1; i < n; i++)
        {
            int a = stats.at<int>(i, CC_STAT_AREA);
            int w = stats.at<int>(i, CC_STAT_WIDTH), h = stats.at<int>(i, CC_STAT_HEIGHT);
            if (a >= 150 && w <= 20 && h <= 20) dots++;
        }
        cout << format("커널 %2d: 흰 픽셀 %6d px, 둥근 점 %d개", s, countNonZero(bin), dots) << endl;
    }
    cout << "점 지름이 17 px 이므로 커널이 그보다 충분히 커야 CLOSE 가 점을 메우고 배경만 남는다" << endl;
    return 0;
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: '모폴로지 ② morphologyEx', subtitle: '열기 · 닫기 · 그래디언트 · 톱햇 / 블랙햇', notes: '<p>1교시의 미해결 문제로 시작: “점은 지워지는데 물체도 작아진다.” 💬 “깎았으면 다시 넓히면 되지 않을까요?” — 그것이 열기(OPEN) 입니다. (2분)</p>' },
          { layout: 'table', title: '다섯 가지 연산', head: ['op', '정의', '효과'], rows: [
            ['<b>MORPH_OPEN</b>', '침식 → 팽창', '작은 <b>흰 점</b> 제거 (크기 유지)'],
            ['<b>MORPH_CLOSE</b>', '팽창 → 침식', '작은 <b>검은 구멍</b> 메움 (크기 유지)'],
            ['<b>MORPH_GRADIENT</b>', '팽창 − 침식', '테두리만 남는다'],
            ['<b>MORPH_TOPHAT</b>', '원본 − 열기', '밝은 작은 것만'],
            ['<b>MORPH_BLACKHAT</b>', '닫기 − 원본', '어두운 작은 것만']
          ], lead: '모두 침식 · 팽창의 조합 — 외울 것은 두 개뿐', notes: '<p>표를 한 줄씩 읽고 정의를 소리 내어 따라하게 합니다. 💬 “OPEN 과 CLOSE 를 헷갈리지 않으려면?” — <b>O</b>pen 은 열어서 점을 내보낸다 / <b>C</b>lose 는 닫아서 구멍을 막는다. (4분)</p>' },
          { layout: 'diagram', title: '열기와 닫기', html: FIG_OPENCLOSE, caption: 'OPEN = 점 제거 + 크기 복원 / CLOSE = 구멍 메움 + 크기 복원', notes: '<p>격자를 따라가며 두 단계를 손으로 짚습니다. 핵심은 “두 번째 단계가 크기를 되돌린다”. 💬 “OPEN 으로 얇게 연결된 두 물체는 어떻게 될까요?” — 끊어진다(분리 효과). (4분)</p>' },
          { layout: 'code', title: '다섯 연산 한 번에 비교', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE), bin;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    Mat k = getStructuringElement(MORPH_ELLIPSE, Size(7, 7));
    cout << "원본 면적 = " << countNonZero(bin) << " px" << endl;

    int ops[] = { MORPH_OPEN, MORPH_CLOSE, MORPH_GRADIENT, MORPH_TOPHAT, MORPH_BLACKHAT };
    const char* names[] = { "OPEN", "CLOSE", "GRADIENT", "TOPHAT", "BLACKHAT" };
    for (int i = 0; i < 5; i++)
    {
        Mat dst;
        morphologyEx(bin, dst, ops[i], k);
        cout << names[i] << " : " << countNonZero(dst) << " px" << endl;
        imshow(names[i], dst);
    }
    waitKey(0);
    return 0;
}`, points: ['OPEN 조금 ↓ / CLOSE 조금 ↑ / GRADIENT 는 테두리만', 'TOPHAT · BLACKHAT 은 “차이”라서 아주 작다', '결과 창에서 GRADIENT 가 윤곽선처럼 보인다'], notes: '<p>결과 창의 다섯 이미지를 한 장씩 클릭해 확대해 보여 줍니다. 💬 “GRADIENT 로 에지 검출을 대신할 수 있을까?” — 간단한 경우엔 가능. 10차시 Canny 와 비교 예고. (6분)</p>' },
          { layout: 'code', title: 'OPEN + CLOSE 로 소금-후추 정리', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat sp = imread("images/salt_pepper.png", IMREAD_GRAYSCALE), bin;
    threshold(sp, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    Mat k = getStructuringElement(MORPH_ELLIPSE, Size(5, 5));

    Mat opened, cleaned;
    morphologyEx(bin, opened, MORPH_OPEN, k);          // 흰 점 제거
    morphologyEx(opened, cleaned, MORPH_CLOSE, k);     // 검은 점 메우기

    vector<vector<Point>> c0, c1;
    findContours(bin, c0, RETR_CCOMP, CHAIN_APPROX_SIMPLE);
    findContours(cleaned, c1, RETR_CCOMP, CHAIN_APPROX_SIMPLE);
    cout << "이진화만   : 윤곽선 " << c0.size() << "개" << endl;
    cout << "OPEN+CLOSE : 윤곽선 " << c1.size() << "개" << endl;
    imshow("open + close", cleaned);
    waitKey(0);
    return 0;
}`, points: ['08차시 medianBlur 와 같은 목표를 <b>이진 영상에서</b>', '윤곽선 10399개 → <b>11개</b>, 큰 구멍 7개', '순서가 중요: OPEN 먼저 (CLOSE 먼저면 흰 점이 붙는다)'], notes: '<p>실습 1 에서 순서를 바꿔 보게 할 것이라고 예고합니다. 💬 “필터(08차시)와 모폴로지, 어느 쪽이 좋을까?” — 이진화 전이면 median, 이진화 후면 모폴로지. 둘을 같이 쓰는 경우도 많다. (6분)</p>' },
          { layout: 'diagram', title: '톱햇 · 블랙햇 = 배경 빼기', html: FIG_HAT, caption: '원본 − 열기 = 밝은 작은 것 / 닫기 − 원본 = 어두운 작은 것', notes: '<p>프로파일 그림으로 “큰 커널 OPEN/CLOSE 는 배경을 남긴다”를 설명합니다. 💬 “조명이 기울어진 영상에서 이게 왜 유용할까요?” — 배경(기울기)을 추정해 빼면 평평해진다. (4분)</p>' },
          { layout: 'image', title: '문제: 전역 Otsu 가 실패하는 영상', src: 'images/uneven_light.png', caption: '왼쪽 위 밝고 오른쪽 아래 어둡다 — 글자 3줄 + 검은 점 32개', notes: '<p>💬 “이 영상을 하나의 임계값으로 이진화하면 어떻게 될까요?” — 오른쪽 아래가 통째로 검게 잡힌다. 07차시의 adaptiveThreshold 를 기억하는 학생이 있으면 “오늘은 모폴로지로 배경을 <b>추정해서</b> 푼다”고 구분해 줍니다. (3분)</p>' },
          { layout: 'diagram', title: '조명 보정 파이프라인', html: FIG_FLAT, caption: '큰 커널 CLOSE → 배경 − 원본 → 고정 임계값', notes: '<p>네 단계를 순서대로 짚습니다. 커널 51 의 근거: 점 지름 17 px 보다 충분히 크고, 조명 변화 폭(수백 px)보다 작다. 이 “크기의 근거”가 오늘의 핵심 역량입니다. (3분)</p>' },
          { layout: 'code', title: '조명 보정 후 점 32개', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/uneven_light.png", IMREAD_GRAYSCALE);
    Mat flat, bin, labels, stats, cents;               // BLACKHAT = CLOSE − 원본
    morphologyEx(img, flat, MORPH_BLACKHAT, getStructuringElement(MORPH_ELLIPSE, Size(51, 51)));
    threshold(flat, bin, 40, 255, THRESH_BINARY);

    int n = connectedComponentsWithStats(bin, labels, stats, cents), dots = 0;
    for (int i = 1; i < n; i++)                        // 0 = 배경
    {
        int a = stats.at<int>(i, CC_STAT_AREA);
        int w = stats.at<int>(i, CC_STAT_WIDTH), h = stats.at<int>(i, CC_STAT_HEIGHT);
        if (a >= 150 && w <= 20 && h <= 20) dots++;    // 17x17 점만
    }
    cout << "덩어리 " << n - 1 << "개 중 둥근 점 " << dots << "개" << endl;
    imshow("corrected", bin);
    waitKey(0);
    return 0;
}`, points: ['<code>MORPH_BLACKHAT</code> = <code>subtract(CLOSE 결과, 원본)</code>', '평평해지면 <b>고정 임계값 40</b> 하나로 충분', '<code>stats.at&lt;int&gt;(i, CC_STAT_*)</code> — 크기로 걸러 <b>32개</b>'], notes: '<p>본문 예제 3 을 실행해 <code>otsu (fail)</code> 과 <code>corrected binary</code> 를 나란히 놓고 비교하는 것이 이 교시의 하이라이트입니다. 💬 “글자도 함께 나왔는데 어떻게 점만 골랐을까?” — 글자는 더 크다 → <b>bbox 크기</b>로 구분. 면적만으로는 안 된다는 점을 강조합니다. (7분)</p>' },
          { layout: 'code', title: '도트 인쇄를 글자로 묶기', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/dot_matrix_date.png", IMREAD_GRAYSCALE), bin, labels;
    threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    cout << "이진화 직후 " << connectedComponents(bin, labels) - 1 << "개" << endl;

    int sizes[] = { 3, 5, 9, 15 };
    for (int s : sizes)
    {
        Mat k = getStructuringElement(MORPH_RECT, Size(s, s)), closed;
        morphologyEx(bin, closed, MORPH_CLOSE, k);
        cout << "CLOSE " << s << "x" << s << " → " << connectedComponents(closed, labels) - 1 << "개" << endl;
    }
    Mat kv = getStructuringElement(MORPH_RECT, Size(5, 25)), glyph;
    morphologyEx(bin, glyph, MORPH_CLOSE, kv);
    cout << "CLOSE 5x25 → " << connectedComponents(glyph, labels) - 1 << "개" << endl;
    return 0;
}`, points: ['도트 피치 6 px, 글자 피치 36 px', '정사각 커널을 키우면 <b>글자끼리도</b> 붙는다', '세로로 긴 커널 → 세로만 붙어 글자 단위에 가까워진다'], notes: '<p>결과 창에서 커널별 이미지를 비교하게 합니다. 💬 “줄 단위로 묶으려면?” — 아주 가로로 긴 커널(<code>Size(41, 5)</code>). 실제 OCR 전처리 순서(줄 분리 → 글자 분리)를 설명합니다. (5분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '조명이 한쪽만 밝은 영상에서 작은 <b>검은 점</b>을 찾으려면?', options: ['전역 Otsu 이진화', '큰 커널 <code>MORPH_BLACKHAT</code> 후 고정 임계값', '작은 커널 <code>MORPH_TOPHAT</code>', '<code>MORPH_GRADIENT</code> 후 Otsu'], answer: 1, explain: 'BLACKHAT = 닫기 − 원본 은 “배경보다 어두운 작은 것”만 남겨 조명 기울기를 없앱니다. 커널은 찾으려는 점보다 충분히 크게.', notes: '<p>정답 2번. 밝은 결함이면 TOPHAT 이라고 짝을 지어 정리합니다. (2분)</p>' },
          { layout: 'practice', title: '실습: OPEN · CLOSE 순서 바꿔 보기', desc: '<p>salt_pepper 이진 영상에 ① OPEN→CLOSE ② CLOSE→OPEN 을 적용해 윤곽선 개수 · 흰 픽셀 수를 비교하세요.</p><ul><li>왜 순서가 중요한가?</li><li>커널은 5×5 ELLIPSE 로 고정</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat sp = imread("images/salt_pepper.png", IMREAD_GRAYSCALE), bin;
    threshold(sp, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    Mat k = getStructuringElement(MORPH_ELLIPSE, Size(5, 5));

    // TODO: OPEN -> CLOSE 와 CLOSE -> OPEN 을 각각 적용해 비교하세요
    Mat a1, a2, b1, b2;
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat sp = imread("images/salt_pepper.png", IMREAD_GRAYSCALE), bin;
    threshold(sp, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    Mat k = getStructuringElement(MORPH_ELLIPSE, Size(5, 5));

    Mat a1, a2, b1, b2;
    morphologyEx(bin, a1, MORPH_OPEN, k);
    morphologyEx(a1, a2, MORPH_CLOSE, k);
    morphologyEx(bin, b1, MORPH_CLOSE, k);
    morphologyEx(b1, b2, MORPH_OPEN, k);

    vector<vector<Point>> ca, cb;
    findContours(a2, ca, RETR_CCOMP, CHAIN_APPROX_SIMPLE);
    findContours(b2, cb, RETR_CCOMP, CHAIN_APPROX_SIMPLE);
    cout << "OPEN->CLOSE : 윤곽선 " << ca.size() << "개, 흰 픽셀 " << countNonZero(a2) << endl;
    cout << "CLOSE->OPEN : 윤곽선 " << cb.size() << "개, 흰 픽셀 " << countNonZero(b2) << endl;
    return 0;
}`, notes: '<p>CLOSE 를 먼저 하면 배경의 흰 점들이 서로 이어져 큰 덩어리가 되고 뒤의 OPEN 으로도 지워지지 않습니다. “작은 것을 먼저 없앤다”가 원칙. 빨리 끝난 학생은 실습 2(조명 보정 커널 크기)로. (7분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['<code>morphologyEx(src, dst, MORPH_*, kernel)</code> 한 줄로 다섯 연산 — 모두 침식 · 팽창의 조합', '<b>OPEN</b> 흰 점 제거 · <b>CLOSE</b> 검은 구멍 메움 (둘 다 크기 유지)', '<b>GRADIENT</b> 테두리 · <b>TOPHAT</b> 밝은 작은 것 · <b>BLACKHAT</b> 어두운 작은 것', '큰 커널 CLOSE − 원본 → <b>조명 기울기 제거</b> → 고정 임계값 + <code>connectedComponentsWithStats</code> 로 점 32개', '커널 크기는 <b>대상의 크기</b>에서 정한다 (지울 것보다 크고 남길 것보다 작게)', '다음 차시: 에지 검출 — 밝기가 변하는 곳을 미분으로 찾는다 (Sobel · Canny)'], notes: '<p>오늘의 한 줄: “모폴로지는 크기와 모양으로 고르는 필터.” 10차시 예고 — 모폴로지 GRADIENT 보다 훨씬 정밀한 에지 검출을 배운다고 연결합니다. (2분)</p>' }
        ]
      }
    ]
  });
})();
