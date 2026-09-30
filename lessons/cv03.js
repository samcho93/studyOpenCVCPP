/* 03차시 Mat 과 픽셀: 이미지 자료 구조 */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: Mat 의 메모리 배치 — 행 우선 · 채널 인터리브 · step
  const FIG_MAT = `<svg viewBox="0 0 760 330" role="img" aria-label="Mat 의 행 우선 메모리 배치와 BGR 채널 인터리브, step">
  ${ARROW('c03a1')}
  <text x="20" y="26" class="tx-b">① 2차원으로 보면: rows=4, cols=5</text>
  <line x1="40" y1="46" x2="250" y2="46" class="ax" marker-end="url(#c03a1)"/><text x="255" y="50" class="tx-m">x (열, cols)</text>
  <line x1="40" y1="46" x2="40" y2="220" class="ax" marker-end="url(#c03a1)"/><text x="18" y="235" class="tx-m">y (행)</text>
  ${[0, 1, 2, 3].map((y) => [0, 1, 2, 3, 4].map((x) => `<rect x="${50 + x * 40}" y="${56 + y * 40}" width="38" height="38" class="${y === 1 && x === 3 ? 'p2' : 'p1s'}"/><text x="${69 + x * 40}" y="${80 + y * 40}" text-anchor="middle" class="${y === 1 && x === 3 ? 'tx-w' : 'tx-m'}">${y * 5 + x}</text>`).join('')).join('')}
  <text x="150" y="245" text-anchor="middle" class="tx">칸의 숫자 = 메모리 순서. 색칠한 픽셀 = (행 y=1, 열 x=3)</text>
  <text x="150" y="266" text-anchor="middle" class="tx-b">img.at&lt;uchar&gt;(1, 3)  ·  Point(3, 1)</text>
  <text x="400" y="26" class="tx-b">② 메모리(1차원)로 보면: 행을 차례로 이어 붙인다 (행 우선)</text>
  ${[0, 1, 2, 3].map((y) => [0, 1, 2, 3, 4].map((x) => `<rect x="${400 + (y * 5 + x) * 17}" y="52" width="16" height="26" class="${y * 5 + x === 8 ? 'p2' : ['p1s', 'p3s', 'p4s', 'p5s'][y]}"/>`).join('')).join('')}
  <text x="442" y="96" text-anchor="middle" class="tx-m">행 0</text><text x="527" y="96" text-anchor="middle" class="tx-m">행 1</text><text x="612" y="96" text-anchor="middle" class="tx-m">행 2</text><text x="697" y="96" text-anchor="middle" class="tx-m">행 3</text>
  <text x="570" y="120" text-anchor="middle" class="tx">주소 = data + y × step + x × elemSize() = 1×5 + 3 = <tspan class="tx-b">8</tspan></text>
  <text x="400" y="160" class="tx-b">③ 3채널(CV_8UC3)이면 픽셀 하나가 B, G, R 3바이트</text>
  ${[0, 1, 2].map((p) => ['B', 'G', 'R'].map((c, k) => `<rect x="${400 + (p * 3 + k) * 34}" y="172" width="33" height="30" class="${['p1s', 'p3s', 'p2s'][k]}"/><text x="${416 + (p * 3 + k) * 34}" y="192" text-anchor="middle" class="tx">${c}</text>`).join('')).join('')}
  <text x="450" y="222" text-anchor="middle" class="tx-m">픽셀 (y, 0)</text><text x="552" y="222" text-anchor="middle" class="tx-m">픽셀 (y, 1)</text><text x="654" y="222" text-anchor="middle" class="tx-m">픽셀 (y, 2)</text>
  <text x="400" y="252" class="tx">elemSize() = 3 바이트 · 한 행 = step = cols × 3 바이트</text>
  <text x="400" y="274" class="tx">전체 = total() × elemSize() = rows × cols × 3 바이트</text>
  <text x="400" y="306" class="tx-m">Vec3b px = img.at&lt;Vec3b&gt;(y, x);  px[0] = B, px[1] = G, px[2] = R</text>
</svg>`;

  // 그림 2: 형식 이름 CV_8UC3 해부 + CV_MAKETYPE
  const FIG_TYPE = `<svg viewBox="0 0 760 270" role="img" aria-label="형식 이름 CV_8UC3 의 뜻과 CV_MAKETYPE">
  <rect x="20" y="20" width="720" height="230" rx="14" class="card-bg"/>
  <text x="150" y="80" text-anchor="middle" class="tx-b" style="font-size:34px">CV_</text>
  <rect x="200" y="46" width="110" height="50" rx="8" class="p1s"/><text x="255" y="80" text-anchor="middle" class="tx-b" style="font-size:34px">8U</text>
  <rect x="320" y="46" width="90" height="50" rx="8" class="p2s"/><text x="365" y="80" text-anchor="middle" class="tx-b" style="font-size:34px">C3</text>
  <text x="560" y="66" text-anchor="middle" class="tx">CV_MAKETYPE(CV_8U, 3) == CV_8UC3</text>
  <text x="560" y="88" text-anchor="middle" class="tx-m">img.depth() → CV_8U · img.channels() → 3</text>
  <text x="255" y="126" text-anchor="middle" class="tx-b">깊이(depth) = 값 1개의 자료형</text>
  <text x="255" y="146" text-anchor="middle" class="tx-m">8U: uchar · 8S: schar · 16U: ushort · 16S: short</text>
  <text x="255" y="164" text-anchor="middle" class="tx-m">32S: int · 32F: float · 64F: double</text>
  <text x="255" y="186" text-anchor="middle" class="tx-m">U = 부호 없음(Unsigned), S = 부호 있음, F = 실수(Float)</text>
  <text x="560" y="126" text-anchor="middle" class="tx-b">채널 수(channels) = 픽셀 하나의 값 개수</text>
  <text x="560" y="146" text-anchor="middle" class="tx-m">C1: 그레이 · 마스크 · 실수 계산 결과</text>
  <text x="560" y="164" text-anchor="middle" class="tx-m">C3: 컬러(B, G, R) · C4: 컬러 + 알파</text>
  <text x="560" y="186" text-anchor="middle" class="tx-m">C2: (x, y) 좌표 쌍 · 복소수(DFT)</text>
  <text x="380" y="222" text-anchor="middle" class="tx">elemSize1() = 깊이의 바이트 수 · elemSize() = elemSize1() × channels()</text>
  <text x="380" y="240" text-anchor="middle" class="tx-m">Python: uint8 배열 shape (h, w, 3) ⟷ C++: Mat CV_8UC3 (rows=h, cols=w)</text>
</svg>`;

  // 그림 3: Mat 헤더 → 참조 계수 → 데이터 (얕은 복사 vs clone)
  const FIG_HEADER = `<svg viewBox="0 0 760 320" role="img" aria-label="Mat 헤더 두 개가 참조 계수 2 인 데이터 하나를 공유하고, clone 은 새 데이터를 만든다">
  ${ARROW('c03a4')}
  <text x="20" y="24" class="tx-b">Mat b = a;  (얕은 복사: 헤더만 새로)</text>
  <rect x="20" y="40" width="170" height="110" rx="10" class="p1s"/>
  <text x="105" y="62" text-anchor="middle" class="tx-b">헤더 a</text>
  <text x="34" y="84" class="tx-m">rows=2, cols=3</text><text x="34" y="102" class="tx-m">flags: CV_8UC1</text><text x="34" y="120" class="tx-m">step=3 · data* · u*</text>
  <rect x="20" y="170" width="170" height="110" rx="10" class="p1s"/>
  <text x="105" y="192" text-anchor="middle" class="tx-b">헤더 b</text>
  <text x="34" y="214" class="tx-m">rows=2, cols=3</text><text x="34" y="232" class="tx-m">flags: CV_8UC1</text><text x="34" y="250" class="tx-m">step=3 · data* · u*</text>
  <rect x="250" y="120" width="120" height="70" rx="10" class="p4s"/>
  <text x="310" y="148" text-anchor="middle" class="tx-b">u (UMatData)</text><text x="310" y="170" text-anchor="middle" class="tx">refcount = 2</text>
  <line x1="192" y1="100" x2="248" y2="140" class="ln" stroke-width="2" marker-end="url(#c03a4)"/>
  <line x1="192" y1="220" x2="248" y2="172" class="ln" stroke-width="2" marker-end="url(#c03a4)"/>
  ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${400 + i * 34}" y="138" width="32" height="34" class="p2s"/><text x="${416 + i * 34}" y="160" text-anchor="middle" class="tx">${i === 5 ? 99 : 10}</text>`).join('')}
  <text x="502" y="126" text-anchor="middle" class="tx-b">픽셀 데이터 (하나뿐)</text>
  <line x1="372" y1="155" x2="398" y2="155" class="ln" stroke-width="2" marker-end="url(#c03a4)"/>
  <text x="502" y="194" text-anchor="middle" class="tx-m">b.at&lt;uchar&gt;(1, 2) = 99 → a 에서도 99</text>
  <text x="590" y="40" text-anchor="middle" class="tx-b">Mat c = a.clone();  (깊은 복사)</text>
  <rect x="440" y="230" width="100" height="60" rx="10" class="p3s"/><text x="490" y="256" text-anchor="middle" class="tx-b">헤더 c</text><text x="490" y="276" text-anchor="middle" class="tx-m">u* · data*</text>
  <rect x="560" y="230" width="90" height="60" rx="10" class="p4s"/><text x="605" y="256" text-anchor="middle" class="tx">refcount</text><text x="605" y="276" text-anchor="middle" class="tx-b">= 1</text>
  <rect x="670" y="236" width="70" height="48" rx="6" class="p3s"/><text x="705" y="264" text-anchor="middle" class="tx-m">새 데이터</text>
  <line x1="541" y1="260" x2="558" y2="260" class="ln" stroke-width="2" marker-end="url(#c03a4)"/>
  <line x1="651" y1="260" x2="668" y2="260" class="ln" stroke-width="2" marker-end="url(#c03a4)"/>
  <text x="380" y="312" text-anchor="middle" class="tx-m">헤더가 소멸(RAII)할 때마다 refcount −1 → 0 이 되면 데이터를 해제. delete 가 필요 없다</text>
</svg>`;

  // 그림 4: (행, 열) 과 (x, y) — 픽셀 접근 순서
  const FIG_YX = `<svg viewBox="0 0 760 300" role="img" aria-label="at(y, x) 는 행 열 순서, Point(x, y) 는 x y 순서">
  ${ARROW('c03a2')}
  <text x="20" y="26" class="tx-b">같은 픽셀, 두 가지 표기</text>
  <line x1="60" y1="50" x2="330" y2="50" class="ax" marker-end="url(#c03a2)"/><text x="336" y="54" class="tx-m">x = 0 … cols−1</text>
  <line x1="60" y1="50" x2="60" y2="250" class="ax" marker-end="url(#c03a2)"/><text x="28" y="264" class="tx-m">y = 0 … rows−1</text>
  ${[0, 1, 2, 3, 4].map((y) => [0, 1, 2, 3, 4, 5].map((x) => `<rect x="${70 + x * 40}" y="${60 + y * 36}" width="38" height="34" class="${y === 2 && x === 4 ? 'p2' : 'p1s'}"/>`).join('')).join('')}
  <text x="89" y="83" text-anchor="middle" class="tx-m">(0,0)</text>
  <text x="249" y="155" text-anchor="middle" class="tx-w">●</text>
  <rect x="380" y="70" width="360" height="80" rx="10" class="p2s"/>
  <text x="560" y="98" text-anchor="middle" class="tx-b">Mat 픽셀 접근 = (행 y, 열 x)</text>
  <text x="560" y="122" text-anchor="middle" class="tx">img.at&lt;uchar&gt;(2, 4) · img.ptr&lt;uchar&gt;(2)[4] · m1b(2, 4)</text>
  <text x="560" y="140" text-anchor="middle" class="tx-m">Python 의 img[y, x] 와 같은 순서</text>
  <rect x="380" y="170" width="360" height="80" rx="10" class="p3s"/>
  <text x="560" y="198" text-anchor="middle" class="tx-b">OpenCV 함수의 점 · 사각형 = (x, y)</text>
  <text x="560" y="222" text-anchor="middle" class="tx">Point(4, 2) · Rect(4, 2, w, h) · Size(w, h)</text>
  <text x="560" y="240" text-anchor="middle" class="tx-m">img.at&lt;uchar&gt;(Point(4, 2)) 도 같은 픽셀</text>
  <text x="380" y="285" text-anchor="middle" class="tx-m">순서를 바꿔 쓰면 다른 픽셀을 읽거나 범위를 벗어난다 (640×480 에서 at(600, 100) 은 범위 밖!)</text>
</svg>`;

  // 그림 5: ROI 는 같은 데이터를 가리키는 헤더 — step 은 원본과 같고 연속이 아니다
  const FIG_ROI = `<svg viewBox="0 0 760 330" role="img" aria-label="ROI 헤더는 원본 데이터의 일부를 가리키고 step 은 원본과 같아 메모리가 연속이 아니다">
  ${ARROW('c03a3')}
  <rect x="20" y="40" width="280" height="190" rx="8" class="p1s"/>
  <text x="160" y="30" text-anchor="middle" class="tx-b">원본 img (640×480, step = 640)</text>
  <rect x="80" y="84" width="140" height="90" rx="4" class="p2s" stroke-dasharray="6 4"/>
  <text x="150" y="118" text-anchor="middle" class="tx-b">roi = img(Rect(50, 50, 200, 150))</text>
  <text x="150" y="138" text-anchor="middle" class="tx-m">data → img 의 (50, 50)</text>
  <text x="150" y="156" text-anchor="middle" class="tx-m">step = 640 (원본과 같음)</text>
  <text x="160" y="252" text-anchor="middle" class="tx-m">roi.setTo(0) → img 의 그 부분도 0</text>
  <text x="20" y="285" class="tx-b">메모리:</text>
  ${[0, 1, 2, 3].map((r) => `<rect x="${90 + r * 150}" y="270" width="140" height="22" class="p1s"/><rect x="${90 + r * 150 + 30}" y="270" width="70" height="22" class="p2"/>`).join('')}
  <text x="400" y="314" text-anchor="middle" class="tx-m">roi 의 행 사이에 원본의 나머지 픽셀이 끼어 있다 → isContinuous() == false · isSubmatrix() == true</text>
  <line x1="305" y1="130" x2="430" y2="130" class="ln" stroke-width="2" marker-end="url(#c03a3)"/>
  <text x="368" y="120" text-anchor="middle" class="tx-m">roi.clone()</text>
  <text x="368" y="150" text-anchor="middle" class="tx-m">roi.copyTo(dst)</text>
  <rect x="440" y="84" width="140" height="90" rx="4" class="p3s"/>
  <text x="510" y="118" text-anchor="middle" class="tx-b">part</text>
  <text x="510" y="138" text-anchor="middle" class="tx-m">새 데이터 (독립)</text>
  <text x="510" y="156" text-anchor="middle" class="tx-m">step = 200, 연속</text>
  <rect x="600" y="40" width="140" height="200" rx="10" class="card-bg"/>
  <text x="670" y="64" text-anchor="middle" class="tx-b">언제 무엇을?</text>
  <text x="670" y="92" text-anchor="middle" class="tx-m">일부만 처리 · 그리기</text><text x="670" y="108" text-anchor="middle" class="tx-b">→ img(rect)</text>
  <text x="670" y="140" text-anchor="middle" class="tx-m">원본 보존 · 잘라내기</text><text x="670" y="156" text-anchor="middle" class="tx-b">→ clone()</text>
  <text x="670" y="188" text-anchor="middle" class="tx-m">다른 이미지에 붙이기</text><text x="670" y="204" text-anchor="middle" class="tx-b">→ src.copyTo(img(r))</text>
</svg>`;

  // ------------------------------------------------------------------ 1교시 예제
  const EX1_INFO = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat color = imread("images/sample_color.png", IMREAD_COLOR);
    if (gray.empty() || color.empty()) { cout << "이미지를 읽지 못했습니다" << endl; return -1; }

    cout << "--- 그레이 ---" << endl;
    cout << "rows(행)=" << gray.rows << ", cols(열)=" << gray.cols << ", size()=" << gray.size() << endl;
    cout << "channels()=" << gray.channels() << ", depth()=" << gray.depth()
         << " (CV_8U=" << CV_8U << "), type()=" << typeToString(gray.type()) << endl;
    cout << "elemSize()=" << gray.elemSize() << " 바이트, step=" << gray.step << " 바이트/행" << endl;
    cout << "total()=" << gray.total() << " 픽셀, 메모리=" << gray.total() * gray.elemSize() << " 바이트" << endl;

    cout << "--- 컬러 ---" << endl;
    cout << "size()=" << color.size() << ", channels()=" << color.channels()
         << ", type()=" << typeToString(color.type()) << endl;
    cout << "elemSize()=" << color.elemSize() << ", elemSize1()=" << color.elemSize1()
         << ", step=" << color.step << endl;
    cout << "메모리=" << color.total() * color.elemSize() << " 바이트, isContinuous()="
         << boolalpha << color.isContinuous() << endl;
    return 0;
}`;

  const EX1_TYPE = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <iomanip>
using namespace cv;
using namespace std;

int main()
{
    // 형식(type) = 깊이(depth) + 채널 수(channels) 를 합친 정수
    int types[] = { CV_8UC1, CV_8UC3, CV_16UC1, CV_16SC1, CV_32SC1, CV_32FC1, CV_64FC3 };
    cout << "형식       채널 elemSize1 elemSize" << endl;
    for (int t : types)
    {
        Mat m(2, 2, t);
        cout << left << setw(10) << typeToString(t) << right
             << setw(5) << CV_MAT_CN(t) << setw(10) << m.elemSize1() << setw(9) << m.elemSize() << endl;
    }

    int t2 = CV_MAKETYPE(CV_32F, 2);                  // 깊이 + 채널 수 → 형식
    cout << "CV_MAKETYPE(CV_32F, 2) = " << typeToString(t2)
         << (t2 == CV_32FC2 ? " (== CV_32FC2)" : "") << endl;
    cout << "CV_MAT_DEPTH(CV_8UC3) == CV_8U ? " << boolalpha << (CV_MAT_DEPTH(CV_8UC3) == CV_8U) << endl;

    Mat img = imread("images/sample_color.png");
    cout << "img.type() == CV_8UC3 ? " << (img.type() == CV_8UC3) << endl;
    cout << "img.depth() == CV_8U ? " << (img.depth() == CV_8U) << endl;

    // C++ 자료형 → OpenCV 형식 (템플릿 코드에서 쓴다)
    cout << "traits::Type<float>::value = " << typeToString(traits::Type<float>::value) << endl;
    cout << "traits::Type<Vec3b>::value = " << typeToString(traits::Type<Vec3b>::value) << endl;
    return 0;
}`;

  const EX1_CREATE = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    // 1) 크기 · 형식 · 초기값으로 만들기 (행 수, 열 수 순서!)
    Mat a(3, 4, CV_8UC1, Scalar(7));
    cout << "a =" << endl << a << endl;

    // 2) 0 · 1 · 단위 행렬 (정적 함수)
    Mat z = Mat::zeros(2, 3, CV_8UC1);
    Mat o = Mat::ones(2, 3, CV_32F);
    Mat e = Mat::eye(3, 3, CV_64F);
    cout << "zeros =" << endl << z << endl;
    cout << "ones (float) =" << endl << o << endl;
    cout << "eye (double) =" << endl << e << endl;

    // 3) Size 로 만들기 — Size 는 (너비, 높이) 순서! 3채널 초기값은 (B, G, R)
    Mat c(Size(4, 2), CV_8UC3, Scalar(1, 2, 3));
    cout << "c: rows=" << c.rows << ", cols=" << c.cols << endl << c << endl;

    // 4) Mat_<T> + 쉼표 초기화: 값을 직접 적어 작은 행렬 만들기 (필터 커널 · 변환 행렬)
    Mat k = (Mat_<float>(3, 3) <<  0, -1,  0,
                                  -1,  5, -1,
                                   0, -1,  0);
    cout << "k (" << typeToString(k.type()) << ") =" << endl << k << endl;
    return 0;
}`;

  const EX1_SHARE = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

void paintCorner(Mat m)            // 값으로 받아도 헤더만 복사 → 픽셀 데이터는 공유
{
    m.at<uchar>(0, 0) = 111;
}

int main()
{
    Mat a(2, 3, CV_8UC1, Scalar(10));
    Mat b = a;                           // 얕은 복사: 헤더만 새로, 데이터는 공유
    cout << "b = a 후 refcount=" << a.u->refcount
         << ", 같은 데이터? " << (a.data == b.data ? "예" : "아니오") << endl;
    b.at<uchar>(1, 2) = 99;              // b 를 바꾸면
    cout << "a(1,2) = " << (int)a.at<uchar>(1, 2) << "  <- a 도 바뀐다" << endl;

    Mat c = a.clone();                   // 깊은 복사 1: 새 데이터에 복사해 돌려준다
    Mat d;
    a.copyTo(d);                         // 깊은 복사 2: d 에 복사 (필요하면 d 를 할당)
    c.at<uchar>(0, 1) = 50;
    d.at<uchar>(0, 2) = 60;
    cout << "clone · copyTo 후 a.refcount=" << a.u->refcount << ", c.refcount=" << c.u->refcount << endl;
    cout << "a =" << endl << a << endl;

    {
        Mat tmp = a;                     // 블록 안에서 하나 더 공유
        cout << "블록 안 refcount=" << a.u->refcount << endl;
    }                                    // tmp 소멸자 → refcount 감소 (RAII)
    cout << "블록 밖 refcount=" << a.u->refcount << endl;

    paintCorner(a);
    cout << "paintCorner(a) 후 a(0,0) = " << (int)a.at<uchar>(0, 0) << endl;
    return 0;
}`;

  // ------------------------------------------------------------------ 2교시 예제
  const EX2_AT = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat m(3, 5, CV_8UC1, Scalar(10));
    m.at<uchar>(1, 3) = 200;                  // (행 1, 열 3) 에 쓰기
    uchar v = m.at<uchar>(1, 3);              // 읽기 — at 은 참조(uchar&)를 돌려준다
    cout << "at(1,3) = " << (int)v << endl;  // uchar 는 (int) 로 바꿔 출력!
    m.at<uchar>(Point(4, 2)) = 77;            // Point(x, y) 로도 가능 = (행 2, 열 4)
    m.at<uchar>(0, 0) += 5;                   // 참조이므로 += 도 된다
    cout << m << endl;

    int sum = 0;
    for (int y = 0; y < m.rows; y++)          // 바깥 = 행(y), 안쪽 = 열(x)
        for (int x = 0; x < m.cols; x++)
            sum += m.at<uchar>(y, x);
    cout << "합계 = " << sum << format(", 평균 = %.1f", mean(m)[0]) << endl;

    Mat A(1, 1, CV_8UC1, Scalar(65));
    cout << "(int) 없이: " << A.at<uchar>(0, 0) << ", (int) 붙이면: " << (int)A.at<uchar>(0, 0) << endl;
    return 0;
}`;

  const EX2_COLOR = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png");   // CV_8UC3

    // 컬러 픽셀은 Vec3b (uchar 3개) 로 읽습니다 — (행 y, 열 x) 순서!
    Vec3b red   = img.at<Vec3b>(110, 120);   // 빨간 원 중심 (x=120, y=110)
    Vec3b green = img.at<Vec3b>(370, 520);   // 초록 사각형 (x=520, y=370)
    Vec3b blue  = img.at<Vec3b>(290, 130);   // 파란 삼각형 (x=130, y=290)
    cout << "빨간 원  : B=" << (int)red[0] << " G=" << (int)red[1] << " R=" << (int)red[2] << endl;
    cout << "초록 사각: " << green << endl;    // Vec3b 는 cout 으로 바로 [B, G, R]
    cout << "파란 삼각: " << blue << endl;

    // 쓰기: 원 중심에 10x10 노란 점 — 참조(Vec3b&)로 받아 채널을 바꾼다
    for (int y = 105; y < 115; y++)
        for (int x = 115; x < 125; x++)
        {
            Vec3b& p = img.at<Vec3b>(y, x);
            p[0] = 0; p[1] = 255; p[2] = 255;       // (B, G, R) = 노랑
        }
    cout << "바꾼 뒤 (110,120): " << img.at<Vec3b>(110, 120) << endl;

    // Mat_<Vec3b> 로 감싸면 c(y, x) 처럼 짧게 쓸 수 있다 (헤더만 새로 — 데이터 공유)
    Mat_<Vec3b> c = img;
    c(200, 300) = Vec3b(255, 0, 0);
    cout << "Mat_ 로 쓴 (200,300): " << img.at<Vec3b>(200, 300) << endl;

    imshow("sample_color", img);
    waitKey(0);
    return 0;
}`;

  const EX2_PTR = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    // 1) 가로 그라데이션: 밝기 = x — 행마다 행 포인터를 한 번 얻는다
    Mat g(256, 256, CV_8UC1);
    for (int y = 0; y < g.rows; y++)
    {
        uchar* row = g.ptr<uchar>(y);           // y 번째 행의 첫 픽셀 주소
        for (int x = 0; x < g.cols; x++)
            row[x] = (uchar)x;
    }

    // 2) 컬러 그라데이션: B = x, G = y, R = 128
    Mat c(256, 256, CV_8UC3);
    for (int y = 0; y < c.rows; y++)
    {
        Vec3b* row = c.ptr<Vec3b>(y);           // 픽셀 단위 포인터
        for (int x = 0; x < c.cols; x++)
            row[x] = Vec3b((uchar)x, (uchar)y, 128);
    }

    // 3) uchar* 로 채널까지 직접: 한 행 = cols x channels 바이트
    Mat d(2, 3, CV_8UC3);
    for (int y = 0; y < d.rows; y++)
    {
        uchar* p = d.ptr<uchar>(y);
        for (int i = 0; i < d.cols * d.channels(); i++)
            p[i] = (uchar)(y * 100 + i);
    }

    cout << "g(100,60)=" << (int)g.at<uchar>(100, 60) << ", c(200,50)=" << c.at<Vec3b>(200, 50) << endl;
    cout << "d =" << endl << d << endl;
    imshow("gray gradient", g);
    imshow("color gradient", c);
    waitKey(0);
    return 0;
}`;

  const EX2_ITER = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <numeric>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);

    // 1) 반복자: begin<T>() ~ end<T>() — ROI 처럼 연속이 아닌 Mat 에서도 안전
    int bright = 0;
    for (MatConstIterator_<uchar> it = img.begin<uchar>(); it != img.end<uchar>(); ++it)
        if (*it >= 200) bright++;
    cout << "밝은 픽셀(>=200): " << bright << endl;

    // 2) 반복자는 STL 알고리즘과 함께 쓸 수 있다
    long long sum = accumulate(img.begin<uchar>(), img.end<uchar>(), 0LL);
    int dark = (int)count_if(img.begin<uchar>(), img.end<uchar>(), [](uchar v) { return v < 100; });
    cout << "합계: " << sum << format(", 평균: %.1f", (double)sum / img.total()) << ", 어두운 픽셀(<100): " << dark << endl;

    // 3) Mat_<uchar>: 형식을 타입에 새겨 두고 g(y, x) 로 접근
    Mat_<uchar> g = img;
    cout << "g(240, 320) = " << (int)g(240, 320) << ", g(100, 100) = " << (int)g(100, 100) << endl;

    // 4) forEach: 모든 픽셀에 람다 적용 (진짜 OpenCV 는 여러 스레드로 나눠 실행)
    Mat inv = img.clone();
    inv.forEach<uchar>([](uchar& p, const int* pos) { p = 255 - p; });
    cout << "forEach 반전 후 (240, 320) = " << (int)inv.at<uchar>(240, 320) << endl;
    imshow("inverted (forEach)", inv);
    waitKey(0);
    return 0;
}`;

  const EX2_SPEED = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_gray.png", IMREAD_GRAYSCALE);   // 640x480
    Mat inv1(img.size(), CV_8UC1), inv2(img.size(), CV_8UC1), inv3 = img.clone(), inv4;
    TickMeter tm;

    // 방법 1: at<uchar>(y, x) — 호출마다 주소 계산 (Debug 빌드는 범위 검사까지)
    tm.start();
    for (int y = 0; y < img.rows; y++)
        for (int x = 0; x < img.cols; x++)
            inv1.at<uchar>(y, x) = 255 - img.at<uchar>(y, x);
    tm.stop();  double tAt = tm.getTimeMilli();  tm.reset();

    // 방법 2: ptr<uchar>(y) — 행마다 한 번만 주소 계산, 안쪽은 배열 접근
    tm.start();
    for (int y = 0; y < img.rows; y++)
    {
        const uchar* s = img.ptr<uchar>(y);
        uchar* d = inv2.ptr<uchar>(y);
        for (int x = 0; x < img.cols; x++) d[x] = 255 - s[x];
    }
    tm.stop();  double tPtr = tm.getTimeMilli();  tm.reset();

    // 방법 3: forEach + 람다
    tm.start();
    inv3.forEach<uchar>([](uchar& p, const int*) { p = 255 - p; });
    tm.stop();  double tEach = tm.getTimeMilli();  tm.reset();

    // 방법 4: OpenCV 함수 한 줄 (SIMD 최적화) — ~img 도 같은 뜻
    tm.start();
    bitwise_not(img, inv4);
    tm.stop();  double tCv = tm.getTimeMilli();

    cout << "결과가 다른 픽셀 수: " << countNonZero(inv1 != inv4) + countNonZero(inv2 != inv4)
                                      + countNonZero(inv3 != inv4) << endl;
    cout << format("at: %.2f ms, ptr: %.2f ms, forEach: %.2f ms, bitwise_not: %.2f ms",
                   tAt, tPtr, tEach, tCv) << endl;
    imshow("inverted", inv4);
    waitKey(0);
    return 0;
}`;

  const EX2_MISTAKES = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/washers.png", IMREAD_GRAYSCALE);   // 640x480, CV_8UC1
    cout << "rows=" << gray.rows << ", cols=" << gray.cols << ", " << typeToString(gray.type()) << endl;

    // 실수 1: (x, y) 순서로 넘기기 — 행 600 은 없다 (행은 0~479)
    try {
        cout << (int)gray.at<uchar>(600, 100) << endl;
    } catch (const cv::Exception& e) {
        cout << "실수 1 -> cv::Exception (code " << e.code << "): at(600, 100) 은 (행, 열)!" << endl;
    }
    cout << "     올바른 at(100, 600) = " << (int)gray.at<uchar>(100, 600) << endl;

    // 실수 2: 1채널 Mat 을 Vec3b 로 읽기 — x 가 작으면 오류 없이 엉뚱한 값!
    Vec3b wrong = gray.at<Vec3b>(100, 10);         // 열 30, 31, 32 의 픽셀 3개를 B, G, R 로 착각
    cout << "실수 2 -> at<Vec3b>(100, 10) = " << wrong << "  (진짜 (100,10) = "
         << (int)gray.at<uchar>(100, 10) << ")" << endl;
    try {
        Vec3b p = gray.at<Vec3b>(100, 300);          // 300 x 3 = 900 >= 640 → 범위 밖
        cout << p << endl;
    } catch (const cv::Exception& e) {
        cout << "     at<Vec3b>(100, 300) -> cv::Exception (code " << e.code << ")" << endl;
    }

    // 올바른 습관: 형식을 먼저 확인
    if (gray.type() == CV_8UC1) cout << "CV_8UC1 은 at<uchar>, CV_8UC3 은 at<Vec3b>" << endl;
    return 0;
}`;

  // ------------------------------------------------------------------ 3교시 예제
  const EX3_ROI = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    Rect r(50, 50, 200, 150);                  // (x, y, 너비, 높이)
    Mat roi = img(r);                          // = Mat(img, r) — 새 헤더, 데이터는 공유

    cout << boolalpha;
    cout << "roi: " << roi.size() << ", isSubmatrix=" << roi.isSubmatrix()
         << ", isContinuous=" << roi.isContinuous() << endl;
    cout << "roi.step=" << roi.step << " (img.step=" << img.step << ")" << endl;
    cout << "roi.data - img.data = " << (roi.data - img.data) << " (= 50*640 + 50)" << endl;
    Size whole; Point ofs;
    roi.locateROI(whole, ofs);                 // ROI 가 원본의 어디인지
    cout << "locateROI: 원본 " << whole << ", 시작 " << ofs << endl;

    cout << "수정 전 img(100,100) = " << (int)img.at<uchar>(100, 100) << endl;
    roi.setTo(Scalar(0));                      // ROI 를 검게 → 원본도 바뀐다!
    cout << "roi.setTo(0) 후 img(100,100) = " << (int)img.at<uchar>(100, 100) << endl;
    roi.at<uchar>(0, 0) = 255;                 // ROI 의 (0,0) = 원본의 (50,50)
    cout << "roi(0,0)=255 후 img(50,50) = " << (int)img.at<uchar>(50, 50) << endl;

    Mat band = img.rowRange(300, 310);         // 행 범위도 ROI (row · col · colRange 도)
    band = Scalar(255);                        // Mat = Scalar 는 픽셀을 채운다
    cout << "band: isContinuous=" << band.isContinuous() << ", img(305, 10) = " << (int)img.at<uchar>(305, 10) << endl;
    imshow("img (ROI 가 바뀜)", img);
    waitKey(0);
    return 0;
}`;

  const EX3_CLONE = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    Rect r(50, 50, 200, 150);

    // clone(): 잘라내기의 정석 — 새 데이터, 연속 메모리
    Mat part = img(r).clone();
    part.setTo(Scalar(0));
    cout << boolalpha << "part.setTo(0) 후 img(100,100) = " << (int)img.at<uchar>(100, 100)
         << " (원본 그대로), part.isContinuous=" << part.isContinuous() << endl;

    // 함정: ROI 헤더에 다른 Mat 을 '대입'하면 헤더만 바뀐다 (픽셀 복사 아님!)
    Mat roi = img(r);
    Mat black = Mat::zeros(r.size(), CV_8UC1);
    roi = black;                               // roi 가 black 을 가리키게 될 뿐
    cout << "roi = black 후 img(100,100) = " << (int)img.at<uchar>(100, 100) << " (안 바뀜)" << endl;

    // 픽셀을 원본에 복사하려면 copyTo(목적지 ROI)
    black.copyTo(img(r));
    cout << "black.copyTo(img(r)) 후 img(100,100) = " << (int)img.at<uchar>(100, 100) << endl;

    // copyTo 는 목적지의 크기 · 형식이 맞으면 그 메모리에 그대로 쓴다
    Mat dst(img.size(), img.type());
    uchar* before = dst.data;
    img.copyTo(dst);
    cout << "dst 메모리 재사용? " << (dst.data == before) << ", dst(100,100) = " << (int)dst.at<uchar>(100, 100) << endl;
    imshow("img", img);
    waitKey(0);
    return 0;
}`;

  const EX3_LOGO = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png");

    // 80x80 로고 만들기: 노란 배경 + 파란 원, 마스크는 원 부분만 255
    Mat logo(80, 80, CV_8UC3, Scalar(0, 220, 255));
    circle(logo, Point(40, 40), 30, Scalar(255, 80, 0), FILLED);
    Mat mask = Mat::zeros(80, 80, CV_8UC1);
    circle(mask, Point(40, 40), 30, Scalar(255), FILLED);

    // 1) 사각형 그대로 붙이기: 붙일 자리의 ROI 에 copyTo
    Rect pos1(img.cols - 90, 10, 80, 80);
    logo.copyTo(img(pos1));

    // 2) 마스크로 원 부분만 붙이기 (마스크가 0 이 아닌 픽셀만 복사)
    Rect pos2(10, img.rows - 90, 80, 80);
    logo.copyTo(img(pos2), mask);

    cout << "로고 중심 (원)       : " << img.at<Vec3b>(pos1.y + 40, pos1.x + 40) << endl;
    cout << "로고 모서리 (배경)   : " << img.at<Vec3b>(pos1.y + 2, pos1.x + 2) << endl;
    cout << "마스크 붙임 모서리   : " << img.at<Vec3b>(pos2.y + 2, pos2.x + 2) << " (원본 유지)" << endl;
    imshow("logo inserted", img);
    waitKey(0);
    return 0;
}`;

  const EX3_ARITH = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    int y = 240, x = 320;
    cout << "원본 (240,320) = " << (int)img.at<uchar>(y, x) << ", (10,10) = " << (int)img.at<uchar>(10, 10) << endl;

    Mat brighter = img + 50;          // 모든 픽셀 +50 (255 에서 포화)
    Mat darker = img - 50;            // 0 에서 포화 (음수 없음)
    Mat contrast = img * 1.5;         // 곱하기 → 대비 증가, 반올림 후 포화
    Mat inverted = ~img;              // 255 - v
    cout << "img + 50  : " << (int)brighter.at<uchar>(y, x) << ", " << (int)brighter.at<uchar>(10, 10) << endl;
    cout << "img - 50  : " << (int)darker.at<uchar>(y, x) << ", " << (int)darker.at<uchar>(10, 10) << endl;
    cout << "img * 1.5 : " << (int)contrast.at<uchar>(y, x) << ", " << (int)contrast.at<uchar>(10, 10) << endl;
    cout << "~img      : " << (int)inverted.at<uchar>(y, x) << ", " << (int)inverted.at<uchar>(10, 10) << endl;

    // 두 이미지 사이 연산: 크기 · 형식이 같아야 한다
    Mat other = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    Mat sub = img - other;            // 픽셀별 뺄셈 (음수 → 0)
    Mat diff;
    absdiff(img, other, diff);        // |a - b| — 차이 검출에 자주 쓴다
    cout << "img - other = " << (int)sub.at<uchar>(y, x) << ", absdiff = " << (int)diff.at<uchar>(y, x) << endl;

    // 비교 → 0/255 마스크, 비트 연산으로 영역 남기기
    Mat mask = Mat::zeros(img.size(), CV_8UC1);
    rectangle(mask, Rect(160, 120, 320, 240), Scalar(255), FILLED);
    Mat masked = img & mask;          // 마스크 밖은 0
    Mat darkMask = img < 100;         // 어두운 픽셀 = 255
    cout << "img & mask: 안=" << (int)masked.at<uchar>(y, x) << ", 밖=" << (int)masked.at<uchar>(10, 10) << endl;
    cout << "img < 100 인 픽셀 수: " << countNonZero(darkMask) << endl;
    imshow("img + 50", brighter);
    imshow("img & mask", masked);
    waitKey(0);
    return 0;
}`;

  const EX3_CONVERT = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    // saturate_cast: 범위를 넘으면 잘라 내고, 실수는 반올림 — C++ 형 변환과 다르다
    int big = 300, neg = -20;
    cout << "saturate_cast<uchar>(300) = " << (int)saturate_cast<uchar>(big)
         << ", (uchar)300 = " << (int)(uchar)big << endl;
    cout << "saturate_cast<uchar>(-20) = " << (int)saturate_cast<uchar>(neg)
         << ", saturate_cast<uchar>(127.6) = " << (int)saturate_cast<uchar>(127.6) << endl;

    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);

    // convertTo(dst, 형식, alpha, beta): dst = saturate_cast(src * alpha + beta)
    Mat f;
    img.convertTo(f, CV_32F, 1.0 / 255.0);                 // 8U → 32F, 0~1 로 스케일
    cout << typeToString(f.type()) << format(", f(240,320) = %.3f", f.at<float>(240, 320)) << endl;

    Mat adj;
    img.convertTo(adj, -1, 1.5, -40);                      // -1 = 깊이 그대로, 대비 1.5 · 밝기 -40
    cout << "1.5*v-40: (240,320) " << (int)img.at<uchar>(240, 320) << " -> " << (int)adj.at<uchar>(240, 320)
         << ", (10,10) " << (int)img.at<uchar>(10, 10) << " -> " << (int)adj.at<uchar>(10, 10) << endl;

    Mat back;
    f.convertTo(back, CV_8U, 255.0);                       // 32F → 8U 로 되돌리기 (표시용)
    cout << typeToString(back.type()) << ", back(240,320) = " << (int)back.at<uchar>(240, 320) << endl;

    // setTo(값, 마스크): 마스크가 0 이 아닌 픽셀만 채우기
    Mat color = imread("images/nuts_bolts_color.png");
    Mat mask;
    threshold(img, mask, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);   // 어두운 부품 = 255
    color.setTo(Scalar(0, 0, 255), mask);                  // 부품 자리를 빨갛게
    cout << "마스크 픽셀 수: " << countNonZero(mask) << endl;
    cout << "와셔 몸통 (y=60, x=90) = " << color.at<Vec3b>(60, 90) << endl;
    cout << "배경 (y=10, x=10)      = " << color.at<Vec3b>(10, 10) << endl;
    imshow("adj", adj);
    imshow("setTo(red, mask)", color);
    waitKey(0);
    return 0;
}`;

  const EX3_ERRORS = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

// 긴 메시지에서 "(코드:설명)" 부분만 꺼낸다
string brief(const cv::Exception& e)
{
    string m = e.what();
    size_t a = m.find("error: (");
    size_t b = m.find(')', a);
    return (a == string::npos || b == string::npos) ? m : m.substr(a + 7, b - a - 6);
}

int main()
{
    Mat gray = imread("images/washers.png", IMREAD_GRAYSCALE);   // CV_8UC1
    Mat color = imread("images/sample_color.png");               // CV_8UC3
    Mat small(100, 100, CV_8UC1, Scalar(0));

    try { Mat g; cvtColor(gray, g, COLOR_BGR2GRAY); }                  // 1채널에 BGR2GRAY
    catch (const cv::Exception& e) { cout << "오류 1: " << brief(e) << endl; }

    try { Mat s = gray + small; }                                      // 크기가 다름
    catch (const cv::Exception& e) { cout << "오류 2: " << brief(e) << endl; }

    try { Mat s = gray + color; }                                      // 채널 수가 다름
    catch (const cv::Exception& e) { cout << "오류 3: " << brief(e) << endl; }

    try { Mat r = gray(Rect(600, 400, 100, 100)); }                    // ROI 가 이미지 밖
    catch (const cv::Exception& e) { cout << "오류 4: " << brief(e) << endl; }

    try { Mat b; threshold(color, b, 0, 255, THRESH_BINARY | THRESH_OTSU); }   // Otsu 는 1채널만
    catch (const cv::Exception& e) { cout << "오류 5: " << brief(e) << endl; }

    // 디버깅 1순위: 관련 Mat 의 크기와 형식을 출력한다
    cout << "gray " << gray.size() << " " << typeToString(gray.type())
         << " / color " << color.size() << " " << typeToString(color.type()) << endl;
    return 0;
}`;

  // ------------------------------------------------------------------ 퀴즈
  const QUIZ1 = [
    { q: '<code>Mat m(480, 640, CV_8UC3);</code> 로 만든 Mat 의 <code>m.cols</code> 는?', options: ['480', '640', '3', '921600'], answer: 1,
      explain: '생성자는 <b>(행 수, 열 수)</b> = (높이, 너비) 순서입니다. 행 480 = rows, 열 640 = cols. 반대로 <code>Size(640, 480)</code> 은 (너비, 높이) 순서입니다.' },
    { q: '<code>CV_16UC1</code> 의 뜻은?', options: ['16비트 부호 없는 정수, 1채널', '16비트 실수, 1채널', '8비트 정수, 16채널', '16비트 부호 있는 정수, 1채널'], answer: 0,
      explain: '<b>16U</b> = 16비트 Unsigned(<code>ushort</code>, 0~65535), <b>C1</b> = 1채널. 부호 있는 것은 16S(<code>short</code>), 실수는 32F/64F 입니다.' },
    { q: '640×480 컬러 이미지(CV_8UC3)의 <code>step</code>(한 행의 바이트 수)과 전체 메모리는?', options: ['640 · 307,200 바이트', '1920 · 921,600 바이트', '3 · 921,600 바이트', '480 · 1,228,800 바이트'], answer: 1,
      explain: 'elemSize() = 3 바이트이므로 한 행 = 640 × 3 = <b>1920</b> 바이트(연속 Mat 의 step), 전체 = total() × elemSize() = 307,200 × 3 = <b>921,600</b> 바이트입니다.' },
    { q: '<code>Mat a = imread(...); Mat b = a; b.setTo(Scalar(0));</code> 를 실행하면 a 는?', options: ['그대로다 — b 는 복사본', 'a 도 검게 된다 — 데이터를 공유', '컴파일 오류', 'b 만 비게 된다'], answer: 1,
      explain: '<code>Mat b = a;</code> 는 <b>헤더만 복사</b>하고 픽셀 데이터는 공유합니다(참조 계수 +1). 독립된 복사본이 필요하면 <code>a.clone()</code> 이나 <code>a.copyTo(b)</code> 를 쓰세요.' },
    { q: '<code>Mat k = (Mat_&lt;float&gt;(2, 2) &lt;&lt; 1, 2, 3, 4);</code> 에서 <code>k.at&lt;float&gt;(1, 0)</code> 의 값은?', options: ['1', '2', '3', '4'], answer: 2,
      explain: '쉼표 초기화는 <b>행 우선</b>으로 채웁니다: 0행 = 1, 2 / 1행 = 3, 4. (행 1, 열 0) 은 <b>3</b> 입니다.' }
  ];
  const QUIZ2 = [
    { q: '컬러 이미지(CV_8UC3)에서 <code>x=200, y=50</code> 픽셀을 읽는 올바른 코드는?', options: ['<code>img.at&lt;uchar&gt;(200, 50)</code>', '<code>img.at&lt;Vec3b&gt;(50, 200)</code>', '<code>img.at&lt;Vec3b&gt;(200, 50)</code>', '<code>img.at&lt;int&gt;(50, 200)</code>'], answer: 1,
      explain: '<code>at</code> 은 <b>(행 y, 열 x)</b> 순서이고, 3채널 8비트이므로 <b>Vec3b</b> 로 읽습니다.' },
    { q: '<code>Vec3b p = img.at&lt;Vec3b&gt;(y, x);</code> 에서 빨강(R) 값을 숫자로 출력하는 코드는?', options: ['<code>cout &lt;&lt; p[0];</code>', '<code>cout &lt;&lt; p[2];</code>', '<code>cout &lt;&lt; (int)p[2];</code>', '<code>cout &lt;&lt; p.r;</code>'], answer: 2,
      explain: 'BGR 순서이므로 <b>p[2] = R</b>. 그런데 원소가 <code>uchar</code>(문자형)라서 그냥 출력하면 글자가 나옵니다 → <b><code>(int)p[2]</code></b>. Vec3b 전체는 <code>cout &lt;&lt; p</code> 로 <code>[B, G, R]</code> 숫자가 나옵니다.' },
    { q: '큰 이미지를 반복문으로 처리할 때 가장 빠른 픽셀 접근 방법은?', options: ['매번 <code>img.at&lt;uchar&gt;(y, x)</code>', '행마다 <code>uchar* p = img.ptr&lt;uchar&gt;(y);</code> 후 <code>p[x]</code>', '<code>cout</code> 으로 출력하며 확인', '매 픽셀마다 <code>img.clone()</code>'], answer: 1,
      explain: '<code>ptr&lt;T&gt;(y)</code> 는 행의 시작 주소를 <b>한 번만</b> 계산하고, 안쪽 반복은 배열 접근이라 가장 빠릅니다. <code>at</code> 은 호출마다 주소 계산(Debug 빌드에서는 범위 검사)이 들어갑니다. 그래도 가능하면 OpenCV 함수가 가장 빠릅니다.' },
    { q: '640×480 그레이 이미지에서 <code>img.at&lt;uchar&gt;(600, 100)</code> 을 실행하면?', options: ['x=600, y=100 픽셀 값', '범위 밖 — Debug 빌드 · 이 사이트는 cv::Exception, Release 빌드는 엉뚱한 메모리', '0 이 반환된다', '가장 가까운 픽셀 값'], answer: 1,
      explain: '첫 인수는 <b>행(y)</b> 인데 행은 0~479 입니다. OpenCV 의 <code>at</code> 범위 검사는 <b>Debug 빌드에서만</b>(CV_DbgAssert) 동작하므로, Release 에서는 검사 없이 잘못된 메모리를 읽습니다. (x=600, y=100) 은 <code>at(100, 600)</code>.' },
    { q: '<code>Mat_&lt;uchar&gt; g = img;</code> (img 는 CV_8UC1) 에 대한 설명으로 옳은 것은?', options: ['픽셀 데이터를 모두 복사한다', '<code>g(y, x)</code> 로 접근할 수 있고 img 와 데이터를 공유한다', '<code>g</code> 는 3채널이 된다', '<code>g.at</code> 은 쓸 수 없다'], answer: 1,
      explain: '<code>Mat_&lt;T&gt;</code> 는 형식을 타입에 새긴 Mat 입니다. 형식이 같으면 <b>헤더만 새로</b> 만들고 데이터를 공유하며, <code>g(y, x)</code> 로 <code>at&lt;uchar&gt;</code> 없이 짧게 씁니다.' }
  ];
  const QUIZ3 = [
    { q: '<code>Mat roi = img(Rect(50, 50, 200, 150)); roi.setTo(Scalar(0));</code> 를 실행하면?', options: ['roi 만 검게 되고 img 는 그대로', 'img 의 그 영역도 검게 된다', '오류가 난다', 'img 전체가 검게 된다'], answer: 1,
      explain: 'ROI 는 <b>원본 데이터의 일부를 가리키는 헤더</b>입니다. ROI 를 수정하면 원본의 그 영역이 함께 바뀝니다. 독립 복사가 필요하면 <code>img(r).clone()</code>.' },
    { q: 'logo(80×80) 를 img 의 <code>Rect r(10, 10, 80, 80)</code> 자리에 붙이는 올바른 코드는?', options: ['<code>img(r) = logo;</code>', '<code>Mat roi = img(r); roi = logo;</code>', '<code>logo.copyTo(img(r));</code>', '<code>img = logo(r);</code>'], answer: 2,
      explain: '<code>Mat</code> 끼리의 <code>=</code> 는 <b>헤더를 바꿔 가리킬 뿐</b> 픽셀을 복사하지 않습니다(1, 2번은 img 가 그대로). 붙이기는 <b>목적지 ROI 에 <code>copyTo</code></b> 입니다. 단 <code>img(r) = Scalar(0)</code> 처럼 Scalar 를 대입하면 픽셀이 채워집니다.' },
    { q: '8비트 이미지에서 <code>img + 100</code> 의 결과, 원래 값이 200 이던 픽셀은?', options: ['300', '44 (오버플로)', '255 (포화)', '오류'], answer: 2,
      explain: 'OpenCV 의 Mat 산술은 <b>포화(saturate)</b> 연산입니다 — 255 를 넘으면 255, 0 아래는 0. C++ 의 <code>(uchar)300 == 44</code> 처럼 돌아가지 않습니다. 직접 계산할 때는 <code>saturate_cast&lt;uchar&gt;()</code>.' },
    { q: '<code>img.convertTo(f, CV_32F, 1.0 / 255.0);</code> 의 결과는?', options: ['0~255 정수 그대로', '0.0~1.0 실수', '−1~1 실수', '0~65535 정수'], answer: 1,
      explain: '<code>convertTo</code> 는 <b>dst = src × alpha + beta</b> 를 계산하며 형식을 바꿉니다. alpha = 1/255 이므로 0~255 → 0.0~1.0 실수가 됩니다. 8비트로 되돌릴 때는 <code>convertTo(back, CV_8U, 255)</code>.' },
    { q: '그레이(CV_8UC1) 이미지에 <code>cvtColor(gray, dst, COLOR_BGR2GRAY)</code> 를 하면?', options: ['정상 동작', 'cv::Exception — (-15:Bad number of channels), scn is 1', '결과가 컬러가 된다', '컴파일 오류'], answer: 1,
      explain: 'BGR2GRAY 는 <b>3(또는 4)채널 입력</b>을 기대합니다. 메시지의 <code>scn</code>(source channel number)이 1 이라는 뜻입니다. 오류가 나면 먼저 <code>channels()</code> · <code>typeToString(type())</code> 을 출력하세요.' }
  ];

  // ------------------------------------------------------------------ 차시
  CV_COURSE.addChapter({
    id: 'cv03', no: '03', title: 'Mat 과 픽셀: 이미지 자료 구조', subtitle: 'Mat 의 헤더와 데이터 · 형식(CV_8UC3) · at/ptr 픽셀 접근 · ROI 와 복사 · 산술 연산',
    summary: 'OpenCV 의 모든 이미지는 <b>cv::Mat</b> 입니다. Mat 이 <b>헤더(크기 · 형식 · step · 포인터)</b>와 <b>참조 계수로 공유되는 픽셀 데이터</b>로 이루어져 있다는 것, <code>Mat b = a;</code> 가 복사가 아니라는 것, <b>CV_8UC3</b> 같은 형식 이름의 뜻을 이해합니다. <code>at&lt;T&gt;(y, x)</code> · <code>ptr&lt;T&gt;(y)</code> · <code>Mat_&lt;T&gt;</code> · 반복자로 픽셀을 읽고 쓰고, <b>ROI</b> 가 원본을 공유한다는 사실과 <code>clone/copyTo</code>, 포화 산술 · <code>convertTo</code> · <code>saturate_cast</code> 를 익힙니다. 이후 모든 차시의 기초입니다.',
    goals: ['Mat 의 rows/cols/channels/depth/type/elemSize/step 을 읽고 CV_8UC3 같은 형식 이름을 해석할 수 있다', 'Mat 헤더와 데이터(참조 계수)의 관계를 설명하고 얕은 복사와 clone/copyTo 를 구분할 수 있다', 'at&lt;T&gt; · ptr&lt;T&gt; · Mat_&lt;T&gt; · 반복자로 픽셀을 (행, 열) 순서로 읽고 쓸 수 있다', 'ROI · copyTo(mask) · 포화 산술 · convertTo 를 쓰고 cv::Exception 메시지를 읽을 수 있다'],
    sections: [
      // ================================================================ 1교시
      {
        id: 'cv03-1', title: 'Mat 의 구조: 형식 · 헤더와 데이터', minutes: 50,
        goals: ['rows/cols · channels() · depth() · type() · elemSize() · step 의 뜻을 안다', 'CV_8UC1 · CV_8UC3 · CV_32FC1 형식 이름과 CV_MAKETYPE 을 해석할 수 있다', 'Mat 생성자 · zeros/ones/eye · Mat_ 쉼표 초기화로 Mat 을 만들고 cout 으로 출력할 수 있다', '얕은 복사(Mat b = a)와 깊은 복사(clone/copyTo)를 참조 계수로 설명할 수 있다'],
        flow: [['도입: 이미지는 숫자 표', 5], ['Mat 구조 · 형식', 15], ['생성 · 헤더와 데이터 실습', 20], ['정리 · 퀴즈', 10]],
        content: [
          { type: 'h', text: '이미지는 숫자로 채워진 표(행렬)다' },
          { type: 'p', html: '카메라가 찍은 사진은 컴퓨터 안에서 <b>숫자로 채워진 2차원 표</b>입니다. 그레이(흑백) 이미지라면 칸마다 밝기 하나(0=검정 ~ 255=흰색), 컬러 이미지라면 칸마다 <b>B, G, R</b> 세 값이 들어 있습니다. OpenCV 는 이 표를 <b><code>cv::Mat</code></b>(Matrix, 행렬) 클래스로 다룹니다 — Python 의 numpy 배열에 해당합니다. <code>imread</code> 가 돌려주는 것도, 거의 모든 함수가 입력 · 출력으로 받는 것도 Mat 입니다.' },
          { type: 'figure', html: FIG_MAT, caption: '그림 1. Mat 의 메모리 배치 — 행을 차례로 이어 붙인 1차원 메모리(행 우선). 3채널이면 픽셀마다 B, G, R 이 번갈아(인터리브) 놓인다' },
          { type: 'table', head: ['멤버', '뜻', '예 (640×480 컬러)'], rows: [
            ['<code>rows</code> · <code>cols</code>', '행 수(높이) · 열 수(너비) — 괄호 없는 멤버 변수', '480 · 640'],
            ['<code>size()</code>', '<code>Size(너비, 높이)</code>', '[640 x 480]'],
            ['<code>channels()</code>', '픽셀 하나의 값 개수', '3 (B, G, R)'],
            ['<code>depth()</code>', '값 하나의 자료형 (<code>CV_8U</code>, <code>CV_32F</code> …)', 'CV_8U (= 0)'],
            ['<code>type()</code>', '깊이 + 채널 = 형식 → <code>typeToString()</code> 으로 이름', 'CV_8UC3'],
            ['<code>elemSize()</code> · <code>elemSize1()</code>', '픽셀 하나 · 값 하나의 바이트 수', '3 · 1'],
            ['<code>step</code>', '한 행의 바이트 수 (다음 행까지의 거리)', '1920'],
            ['<code>total()</code>', '픽셀 수 = rows × cols', '307200'],
            ['<code>data</code>', '첫 픽셀의 주소 (<code>uchar*</code>)', '—'],
            ['<code>empty()</code>', '비어 있는가 (읽기 실패 확인!)', 'false']
          ], caption: '표 1. Mat 의 기본 정보 — rows · cols · step · data 는 멤버 변수, 나머지는 멤버 함수' },
          { type: 'code', title: '예제 1: 이미지를 읽고 Mat 정보 출력', code: EX1_INFO,
            desc: '그레이와 컬러로 읽은 두 이미지의 정보를 비교합니다. 크기는 같지만 <b>채널 수 · elemSize · step</b> 이 달라 메모리가 3배 차이납니다. <code>cout &lt;&lt; img.size()</code> 는 <code>[너비 x 높이]</code> 로 출력됩니다. <code>boolalpha</code> 는 <code>bool</code> 을 1/0 대신 true/false 로 출력하게 합니다.',
            expect: '--- 그레이 ---\nrows(행)=480, cols(열)=640, size()=[640 x 480]\nchannels()=1, depth()=0 (CV_8U=0), type()=CV_8UC1\nelemSize()=1 바이트, step=640 바이트/행\ntotal()=307200 픽셀, 메모리=307200 바이트\n--- 컬러 ---\nsize()=[640 x 480], channels()=3, type()=CV_8UC3\nelemSize()=3, elemSize1()=1, step=1920\n메모리=921600 바이트, isContinuous()=true' },
          { type: 'callout', kind: 'warn', title: '가장 흔한 실수: (행, 열) 과 (너비, 높이)', html: '<code>Mat m(480, 640, …)</code> 은 <b>(행 수, 열 수)</b> = (높이, 너비) 순서이고, <code>Size(640, 480)</code> 은 <b>(너비, 높이)</b> 순서입니다. Python 의 <code>img.shape</code> 가 (h, w, ch) 인 것과 같은 이유입니다 — 행렬은 "행 × 열"로 말하고, 화면 크기는 "가로 × 세로"로 말하기 때문입니다.' },
          { type: 'h', text: '형식: CV_8UC3 을 읽는 법' },
          { type: 'figure', html: FIG_TYPE, caption: '그림 2. 형식 이름 = CV_ + 깊이(비트 수 + U/S/F) + C채널 수. CV_MAKETYPE(깊이, 채널 수) 로 만들 수 있다' },
          { type: 'table', head: ['깊이', 'C++ 자료형', '범위', '주로 쓰는 곳'], rows: [
            ['<code>CV_8U</code>', '<code>uchar</code>', '0 ~ 255', '보통의 이미지 · 마스크 (가장 많이 씀)'],
            ['<code>CV_8S</code>', '<code>schar</code>', '−128 ~ 127', '드묾'],
            ['<code>CV_16U</code>', '<code>ushort</code>', '0 ~ 65535', '고감도 카메라 · 깊이(depth) 카메라'],
            ['<code>CV_16S</code>', '<code>short</code>', '−32768 ~ 32767', 'Sobel 미분 결과 (음수 있음)'],
            ['<code>CV_32S</code>', '<code>int</code>', '정수', '<code>connectedComponents</code> 의 라벨'],
            ['<code>CV_32F</code>', '<code>float</code>', '실수', '히스토그램 · 필터 계산 · DFT · 정규화(0~1)'],
            ['<code>CV_64F</code>', '<code>double</code>', '배정밀도 실수', '변환 행렬(<code>getRotationMatrix2D</code>) · 카메라 행렬']
          ], caption: '표 2. 깊이(depth)별 C++ 자료형 — at<T> · ptr<T> 의 T 는 이 표의 자료형과 맞아야 한다 (3채널이면 Vec3b · Vec3f …)' },
          { type: 'code', title: '예제 2: 형식 해부 — CV_MAT_CN · elemSize · CV_MAKETYPE', code: EX1_TYPE,
            desc: '형식은 정수 하나에 깊이와 채널 수를 함께 담은 값입니다. <code>CV_MAT_DEPTH(t)</code> · <code>CV_MAT_CN(t)</code> 매크로로 분해하고 <code>CV_MAKETYPE(깊이, 채널)</code> 로 합칩니다. <code>elemSize</code> 는 (값의 바이트 수) × (채널 수) — CV_64FC3 = 8 × 3 = 24 바이트. <code>traits::Type&lt;T&gt;::value</code> 는 C++ 자료형에서 형식을 얻는 방법으로, 템플릿 함수를 만들 때 씁니다.',
            expect: '형식       채널 elemSize1 elemSize\nCV_8UC1       1         1        1\nCV_8UC3       3         1        3\nCV_16UC1      1         2        2\nCV_16SC1      1         2        2\nCV_32SC1      1         4        4\nCV_32FC1      1         4        4\nCV_64FC3      3         8       24\nCV_MAKETYPE(CV_32F, 2) = CV_32FC2 (== CV_32FC2)\nCV_MAT_DEPTH(CV_8UC3) == CV_8U ? true\nimg.type() == CV_8UC3 ? true\nimg.depth() == CV_8U ? true\ntraits::Type<float>::value = CV_32FC1\ntraits::Type<Vec3b>::value = CV_8UC3' },
          { type: 'callout', kind: 'tip', title: '형식은 이름으로 비교하고 이름으로 출력하자', html: '<code>cout &lt;&lt; img.type()</code> 은 정수(예: 16 이나 64)를 출력하는데, 이 값은 OpenCV 버전에 따라 채널 비트 배치가 달라 바뀔 수 있습니다. 코드에서는 항상 <code>img.type() == CV_8UC3</code> 처럼 <b>이름으로 비교</b>하고, 출력할 때는 <code>typeToString(img.type())</code> 을 쓰세요. <code>img.depth() == CV_8U</code> · <code>img.channels() == 3</code> 처럼 나눠서 확인할 수도 있습니다.' },
          { type: 'h', text: 'Mat 만들기와 출력: 생성자 · zeros/ones/eye · Mat_ 쉼표 초기화' },
          { type: 'code', title: '예제 3: 작은 Mat 을 만들어 cout 으로 들여다보기', code: EX1_CREATE,
            desc: '<code>cout &lt;&lt; mat</code> 은 작은 Mat 의 모든 값을 <code>[행0; 행1; …]</code> 형식으로 보여 줍니다 (큰 이미지에는 쓰지 마세요!). <code>Mat(행, 열, 형식, 초기값)</code> 의 초기값은 <b>Scalar</b> — 3채널이면 <code>Scalar(B, G, R)</code>. 3채널 출력에서 한 행에 값이 12개(4픽셀 × 3채널, <code>1, 2, 3, 1, 2, 3, …</code>)인 것이 그림 1 의 인터리브 배치입니다. <code>(Mat_&lt;float&gt;(3, 3) &lt;&lt; …)</code> 은 값을 <b>행 우선</b>으로 채우는 쉼표 초기화로, 필터 커널이나 변환 행렬을 적을 때 씁니다.',
            expect: 'a =\n[  7,   7,   7,   7;\n   7,   7,   7,   7;\n   7,   7,   7,   7]\nzeros =\n[  0,   0,   0;\n   0,   0,   0]\nones (float) =\n[1, 1, 1;\n 1, 1, 1]\neye (double) =\n[1, 0, 0;\n 0, 1, 0;\n 0, 0, 1]\nc: rows=2, cols=4\n[  1,   2,   3,   1,   2,   3,   1,   2,   3,   1,   2,   3;\n   1,   2,   3,   1,   2,   3,   1,   2,   3,   1,   2,   3]\nk (CV_32FC1) =\n[0, -1, 0;\n -1, 5, -1;\n 0, -1, 0]' },
          { type: 'callout', kind: 'warn', title: '초기값 없이 만든 Mat 은 쓰레기값', html: '<code>Mat m(480, 640, CV_8UC1);</code> 처럼 초기값을 생략하면 메모리만 잡고 <b>내용은 정해지지 않습니다</b>(이전에 쓰던 값이 남아 있을 수 있음). 반복문으로 모든 픽셀을 채울 것이 아니라면 <code>Mat::zeros</code> 나 <code>Scalar(0)</code> 초기값을 쓰세요. OpenCV 함수의 출력용 Mat 은 <code>Mat dst;</code>(빈 Mat)로 선언하면 함수가 알맞은 크기 · 형식으로 할당해 줍니다.' },
          { type: 'h', text: 'Mat 은 헤더 + 데이터: 얕은 복사와 깊은 복사' },
          { type: 'p', html: 'Mat 객체 자체는 크기 · 형식 · step · <b>데이터 포인터</b>만 담은 작은 <b>헤더</b>입니다. 실제 픽셀은 따로 할당된 메모리에 있고, 이 메모리에는 <b>참조 계수(refcount)</b> 가 붙어 있습니다. <code>Mat b = a;</code> · 함수에 값으로 넘기기 · <code>return img;</code> 는 모두 <b>헤더만 복사</b>하고 refcount 를 1 올립니다 — 그래서 매우 빠르지만 <b>한쪽을 고치면 다른 쪽도 바뀝니다</b>. 헤더가 소멸(범위를 벗어남)할 때 refcount 가 1 줄고, 0 이 되면 데이터가 해제됩니다. C++ 의 <b>RAII</b> 와 <code>std::shared_ptr</code> 과 같은 원리이므로 <code>new/delete</code> 가 필요 없습니다.' },
          { type: 'figure', html: FIG_HEADER, caption: '그림 3. Mat b = a 는 헤더만 새로 만들고 데이터(refcount 2)를 공유한다. clone() 은 새 데이터(refcount 1)를 만든다' },
          { type: 'code', title: '예제 4: 헤더와 데이터 — 얕은 복사 · clone · copyTo · 참조 계수', code: EX1_SHARE,
            desc: '<code>a.u-&gt;refcount</code> 는 데이터의 참조 계수입니다(내부 멤버 — 학습용으로만 들여다봅니다). <code>b = a</code> 후 2 가 되고, <code>b</code> 를 고치면 <code>a</code> 도 바뀝니다. <code>clone()</code> · <code>copyTo()</code> 로 만든 c, d 는 독립이라 a 에 영향이 없습니다. 블록 안의 <code>tmp</code> 가 소멸하면 refcount 가 다시 줄어드는 것(RAII)도 확인하세요. <code>paintCorner(Mat m)</code> 처럼 <b>값으로 받아도</b> 데이터는 공유되므로 함수 안에서 픽셀을 바꾸면 호출한 쪽 이미지가 바뀝니다.',
            expect: 'b = a 후 refcount=2, 같은 데이터? 예\na(1,2) = 99  <- a 도 바뀐다\nclone · copyTo 후 a.refcount=2, c.refcount=1\na =\n[ 10,  10,  10;\n  10,  10,  99]\n블록 안 refcount=3\n블록 밖 refcount=2\npaintCorner(a) 후 a(0,0) = 111' },
          { type: 'callout', kind: 'tip', title: '함수 매개변수 규칙', html: '<ul><li><b>읽기만</b> 하는 입력: <code>const Mat&amp; src</code> (헤더 복사도 없음, 실수로 고칠 수도 없음)</li><li><b>결과를 담을</b> 출력: <code>Mat&amp; dst</code> — 함수 안에서 <code>dst.create(...)</code> 나 <code>src.copyTo(dst)</code></li><li>원본을 보존해야 하는데 함수가 이미지를 고친다면 <b>호출하는 쪽에서 <code>img.clone()</code></b> 을 넘깁니다.</li><li>OpenCV 함수의 <code>InputArray</code> / <code>OutputArray</code> 도 같은 약속입니다 (16차시 클래스 설계에서 다시).</li></ul>' },
          { type: 'callout', kind: 'more', title: '📘 대입은 헤더를 바꾸고, Scalar 대입은 픽셀을 바꾼다', html: '<code>b = a + 1;</code> 은 새 결과 데이터를 만들어 <b>b 의 헤더가 그것을 가리키게</b> 합니다 — a 와의 공유가 끊어질 뿐 a 는 그대로입니다. 반면 <code>b = Scalar(0);</code> 과 <code>b.setTo(0)</code> 은 <b>b 가 가리키는 데이터의 픽셀을 채웁니다</b> — a 와 공유 중이면 a 도 바뀝니다. 이 차이는 3교시 ROI 에서 중요해집니다.' },
          { type: 'callout', kind: 'vs', title: 'Visual Studio 에서 Mat 들여다보기', html: '디버깅 중 조사식(Watch) 창에 <code>img</code> 를 넣으면 <code>rows</code> · <code>cols</code> · <code>flags</code> · <code>data</code> · <code>u</code> 가 보이고, <code>img.u-&gt;refcount</code> 로 참조 계수를 볼 수 있습니다. 픽셀을 그림으로 보려면 Visual Studio 확장 <b>Image Watch</b>(Microsoft) 를 설치하세요 — 중단점에서 Mat 을 이미지로 보여 줍니다.' }
        ],
        practice: [
          {
            title: '여러 형식의 Mat 정보 표 만들기', level: 1,
            desc: '아래 Mat 4개를 만들어 <b>이름 · rows · cols · 형식 · elemSize · step · 전체 바이트</b>를 한 줄씩 출력하는 함수 <code>printInfo(const string&amp; name, const Mat&amp; m)</code> 를 완성하세요. 전체 바이트 = <code>total() * elemSize()</code>.<br>① 그레이 320×240 (CV_8UC1) ② 컬러 320×240 (CV_8UC3) ③ 실수 100×100 (CV_32FC1) ④ 16비트 2채널 64×64 (CV_16UC2)',
            hint: '<code>Mat(행, 열, 형식)</code> 의 행 = 세로(240), 열 = 가로(320) 입니다. elemSize 는 (바이트 수 × 채널 수): CV_16UC2 = 2 × 2 = 4. 형식 이름은 <code>typeToString(m.type())</code>.',
            expect: 'gray   rows=240 cols=320 CV_8UC1 elemSize=1 step=320 bytes=76800\ncolor  rows=240 cols=320 CV_8UC3 elemSize=3 step=960 bytes=230400\nfloat  rows=100 cols=100 CV_32FC1 elemSize=4 step=400 bytes=40000\nu16c2  rows=64 cols=64 CV_16UC2 elemSize=4 step=256 bytes=16384',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <iomanip>
using namespace cv;
using namespace std;

void printInfo(const string& name, const Mat& m)
{
    // TODO: rows · cols · 형식 · elemSize · step · 전체 바이트를 출력하세요
    cout << left << setw(6) << name << " rows=" << m.rows << endl;
}

int main()
{
    Mat gray(240, 320, CV_8UC1, Scalar(0));
    printInfo("gray", gray);
    // TODO: color (320x240, CV_8UC3), floatMat (100x100, CV_32FC1), u16c2 (64x64, CV_16UC2) 를 만들어 printInfo
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <iomanip>
using namespace cv;
using namespace std;

void printInfo(const string& name, const Mat& m)
{
    cout << left << setw(6) << name << " rows=" << m.rows << " cols=" << m.cols << " "
         << typeToString(m.type()) << " elemSize=" << m.elemSize() << " step=" << m.step
         << " bytes=" << m.total() * m.elemSize() << endl;
}

int main()
{
    Mat gray(240, 320, CV_8UC1, Scalar(0));
    Mat color(240, 320, CV_8UC3, Scalar(0));
    Mat floatMat(100, 100, CV_32FC1, Scalar(0));
    Mat u16c2(64, 64, CV_16UC2, Scalar(0));
    printInfo("gray", gray);
    printInfo("color", color);
    printInfo("float", floatMat);
    printInfo("u16c2", u16c2);
    return 0;
}`
          },
          {
            title: '백업이 왜 같이 바뀌었을까? — 얕은 복사 버그 고치기', level: 2,
            desc: '아래 프로그램은 원본을 <code>backup</code> 에 보관한 뒤 어두운 부품 픽셀(값 &lt; 100)을 255 로 지우고, 처리 전후의 평균 밝기를 비교하려고 합니다. 그런데 실행하면 <b>원본 평균과 처리 후 평균이 같게</b> 나옵니다. 원인을 찾아 한 줄을 고치고, <code>backup</code> 과 <code>img</code> 가 같은 데이터인지(<code>data</code> 포인터 비교)와 참조 계수를 함께 출력하세요.',
            hint: '<code>Mat backup = img;</code> 는 헤더만 복사합니다 → <code>img.clone()</code>. <code>img.setTo(Scalar(255), img &lt; 100)</code> 의 두 번째 인수는 <b>마스크</b>(비교 결과 0/255 Mat)입니다.',
            expect: '원본 평균: 191.8\n처리 후 평균: 225.2\n같은 데이터? 아니오, img refcount=1',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat backup = img;                              // TODO: 이 줄이 버그! 원본을 보관하려면?

    img.setTo(Scalar(255), img < 100);             // 어두운 부품 픽셀을 흰색으로 지운다
    cout << format("원본 평균: %.1f", mean(backup)[0]) << endl;
    cout << format("처리 후 평균: %.1f", mean(img)[0]) << endl;
    cout << "같은 데이터? " << (img.data == backup.data ? "예" : "아니오")
         << ", img refcount=" << img.u->refcount << endl;
    imshow("backup", backup);
    imshow("img", img);
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
    Mat backup = img.clone();                      // 깊은 복사: 새 데이터에 보관

    img.setTo(Scalar(255), img < 100);             // 어두운 부품 픽셀을 흰색으로 지운다
    cout << format("원본 평균: %.1f", mean(backup)[0]) << endl;
    cout << format("처리 후 평균: %.1f", mean(img)[0]) << endl;
    cout << "같은 데이터? " << (img.data == backup.data ? "예" : "아니오")
         << ", img refcount=" << img.u->refcount << endl;
    imshow("backup", backup);
    imshow("img", img);
    waitKey(0);
    return 0;
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: 'Mat 과 픽셀: 이미지 자료 구조', subtitle: '1교시 — Mat 의 구조: 형식 · 헤더와 데이터', notes: '<p>💬 "사진은 컴퓨터 안에 어떤 모양으로 들어 있을까?" — 예상 답: 점들의 모임, 숫자. 오늘은 그 숫자 표(<code>cv::Mat</code>)를 해부합니다. 이 차시는 이후 모든 차시의 기초이므로 천천히, 실행해 보며 진행합니다. (3분)</p>' },
          { layout: 'bullets', title: '이미지 = 숫자로 채워진 표', lead: 'cv::Mat (Matrix, 행렬)', bullets: [
            '그레이 이미지: 칸마다 밝기 1개 (0 검정 ~ 255 흰색)',
            '컬러 이미지: 칸마다 <b>B, G, R</b> 3개 (OpenCV 는 BGR 순서!)',
            'OpenCV 는 이 표를 <b>Mat</b> 클래스로 다룬다 — Python 의 numpy 배열',
            '<code>imread</code> 가 돌려주는 것도, 함수가 주고받는 것도 Mat',
            ['Mat 의 핵심 정보', ['행 수 <code>rows</code>(높이) · 열 수 <code>cols</code>(너비)', '<code>channels()</code> · <code>depth()</code> → 합쳐서 <code>type()</code>', '<code>step</code> (한 행의 바이트) · <code>data</code> (첫 픽셀 주소)']]
          ], notes: '<p>결과 창에서 이미지 위에 마우스를 올려 픽셀 값을 보여 주며 "칸마다 숫자"를 확인시킵니다. 💬 "컬러 픽셀 하나에는 숫자가 몇 개?" — 3개(B, G, R). (5분)</p>' },
          { layout: 'diagram', title: 'Mat 의 메모리 배치', html: FIG_MAT, caption: '행 우선(row-major): 행 0, 행 1, … 을 이어 붙인 1차원 메모리. 3채널은 B G R 이 픽셀마다 번갈아(인터리브) 놓인다', notes: '<p>색칠한 픽셀 (행 1, 열 3) 의 메모리 위치 = 1 × 5 + 3 = 8 을 함께 계산합니다. 주소 공식 <code>data + y × step + x × elemSize()</code> 를 판서하세요 — 2교시의 <code>ptr&lt;T&gt;(y)</code> 가 바로 <code>data + y × step</code> 입니다. (5분)</p>' },
          { layout: 'code', title: '예제 1: Mat 정보 읽기', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat color = imread("images/sample_color.png");
    if (gray.empty() || color.empty()) return -1;

    cout << "rows=" << gray.rows << ", cols=" << gray.cols << ", size=" << gray.size() << endl;
    cout << "channels=" << gray.channels() << ", type=" << typeToString(gray.type()) << endl;
    cout << "elemSize=" << gray.elemSize() << ", step=" << gray.step << endl;
    cout << "메모리=" << gray.total() * gray.elemSize() << " 바이트" << endl;

    cout << "컬러: channels=" << color.channels() << ", type=" << typeToString(color.type()) << endl;
    cout << "컬러: step=" << color.step << ", 메모리=" << color.total() * color.elemSize() << endl;
    return 0;
}`, points: ['<code>rows/cols/step/data</code> 는 변수, <code>channels()/type()</code> 는 함수', '컬러는 elemSize 3 → step 1920, 메모리 3배', '<code>typeToString(type())</code> 으로 형식 이름 출력', '<code>empty()</code> 로 읽기 실패 확인'], notes: '<p>실행 후 두 이미지의 차이(채널 수 · elemSize · step · 메모리)를 짚습니다. 💬 "그레이 이미지는 왜 메모리가 1/3 일까?" 학생들에게 <code>IMREAD_GRAYSCALE</code> 을 지우고 다시 실행해 값이 바뀌는 것을 보게 합니다. (6분)</p>' },
          { layout: 'diagram', title: '형식 이름 읽기: CV_8UC3', html: FIG_TYPE, caption: 'CV_ + 비트 수 + U(부호 없음)/S(부호)/F(실수) + C채널 수 · CV_MAKETYPE(깊이, 채널)', notes: '<p>이름을 소리 내어 읽게 합니다: "8비트 부호 없는 정수, 3채널". 💬 "CV_32FC1 은?" — 32비트 실수 1채널. 💬 "소수점이 필요한 계산 결과는?" — 32F. <code>type()</code> 의 정수 값은 외우지 말고 이름으로 비교한다는 점을 강조합니다. (4분)</p>' },
          { layout: 'table', title: '깊이(depth)와 C++ 자료형', head: ['깊이', 'C++ 형', '범위', '쓰는 곳'], rows: [
            ['CV_8U', 'uchar', '0~255', '보통 이미지 · 마스크'],
            ['CV_16U', 'ushort', '0~65535', '고감도 · 깊이 카메라'],
            ['CV_16S', 'short', '±32767', 'Sobel 미분 (음수)'],
            ['CV_32S', 'int', '정수', '연결 요소 라벨'],
            ['CV_32F', 'float', '실수', '히스토그램 · 0~1 정규화'],
            ['CV_64F', 'double', '실수', '변환 행렬']
          ], lead: 'at<T> · ptr<T> 의 T 는 이 표의 형과 맞아야 한다 (3채널: Vec3b · Vec3f)', notes: '<p>지금은 CV_8U(uchar) 만 확실히 알면 됩니다. 나머지는 해당 차시(에지 · 히스토그램 · 기하 변환)에서 다시 만납니다. "형이 안 맞으면 엉뚱한 값이 읽힌다" 를 2교시로 예고. (3분)</p>' },
          { layout: 'code', title: '예제 3: Mat 만들기 · cout 출력', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat a(3, 4, CV_8UC1, Scalar(7));                 // (행, 열, 형식, 초기값)
    cout << a << endl;

    cout << Mat::zeros(2, 3, CV_8UC1) << endl;
    cout << Mat::eye(3, 3, CV_64F) << endl;

    Mat c(Size(4, 2), CV_8UC3, Scalar(1, 2, 3));     // Size 는 (너비, 높이)!
    cout << "rows=" << c.rows << ", cols=" << c.cols << endl << c << endl;

    Mat k = (Mat_<float>(3, 3) <<  0, -1,  0,         // 쉼표 초기화 (행 우선)
                                  -1,  5, -1,
                                   0, -1,  0);
    cout << typeToString(k.type()) << endl << k << endl;
    return 0;
}`, points: ['<code>Mat(행, 열, 형식, Scalar)</code> vs <code>Size(너비, 높이)</code>', '<code>cout &lt;&lt; mat</code> 은 작은 Mat 확인용 (큰 이미지 금지)', '3채널: 픽셀마다 1, 2, 3 반복 = 인터리브', '<code>(Mat_&lt;float&gt;(3,3) &lt;&lt; …)</code>: 커널 · 행렬을 값으로'], notes: '<p>출력의 행 · 열 개수를 세어 보게 합니다. c 의 한 행에 값이 12개(4픽셀 × 3채널)인 이유를 그림 1 과 연결합니다. 💬 "<code>Mat(4, 2, …)</code> 로 바꾸면 rows 는?" — 4. 쉼표 초기화는 8차시(filter2D 커널)에서 다시 씁니다. (7분)</p>' },
          { layout: 'diagram', title: 'Mat = 헤더 + 참조 계수 + 데이터', html: FIG_HEADER, caption: 'Mat b = a 는 헤더만 복사(refcount 2, 데이터 공유) · clone() 은 새 데이터(refcount 1)', notes: '<p>C++ 강좌에서 가장 중요한 그림입니다. <code>std::shared_ptr</code> 을 배운 학생에게는 "Mat 은 shared_ptr 처럼 동작하는 이미지" 라고 설명하면 빠릅니다. 💬 "그럼 <code>Mat b = a;</code> 후 b 를 고치면?" — a 도 바뀐다. 투표 후 다음 예제로 확인. (4분)</p>' },
          { layout: 'code', title: '예제 4: 얕은 복사 vs clone', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat a(2, 3, CV_8UC1, Scalar(10));
    Mat b = a;                                   // 헤더만 복사 (데이터 공유)
    cout << "refcount=" << a.u->refcount << endl;
    b.at<uchar>(1, 2) = 99;
    cout << "a(1,2)=" << (int)a.at<uchar>(1, 2) << endl;   // 99!

    Mat c = a.clone();                           // 새 데이터
    c.at<uchar>(0, 0) = 50;
    cout << "a(0,0)=" << (int)a.at<uchar>(0, 0)
         << ", c.refcount=" << c.u->refcount << endl;
    {
        Mat tmp = a;
        cout << "블록 안 refcount=" << a.u->refcount << endl;
    }                                            // 소멸자 → refcount 감소
    cout << "블록 밖 refcount=" << a.u->refcount << endl;
    return 0;
}`, points: ['<code>Mat b = a;</code> · 값 전달 · return → 헤더만 복사', '독립 복사는 <code>clone()</code> / <code>copyTo()</code>', '소멸자가 refcount 를 줄이고 0 이면 해제 (RAII)', '<code>u-&gt;refcount</code> 는 학습용으로만 들여다보기'], notes: '<p>실행 결과 a(1,2) = 99 를 보고 투표 결과와 비교합니다. 💬 "왜 OpenCV 는 기본을 얕은 복사로 만들었을까?" — 640×480 컬러 한 장이 900 KB, 함수에 넘길 때마다 복사하면 느리다. 원본을 지키려면 clone. (6분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>Mat a = imread(...); Mat b = a; b.setTo(Scalar(0));</code> 를 실행하면 a 는?', options: ['그대로다 — b 는 복사본', 'a 도 검게 된다 — 데이터를 공유', '컴파일 오류', 'b 만 비게 된다'], answer: 1, explain: '<code>Mat b = a;</code> 는 헤더만 복사 — 데이터는 하나. 독립 복사는 clone().', notes: '<p>정답 2번. 많이 틀리는 문제입니다. 틀린 학생에게는 그림 3 을 다시 보여 주고 "헤더 두 개, 데이터 하나" 를 말로 설명하게 합니다. (3분)</p>' },
          { layout: 'practice', title: '실습: 여러 형식의 Mat 정보 표', desc: '<p>4개의 Mat 을 만들어 rows · cols · 형식 · elemSize · step · 전체 바이트를 출력하는 <code>printInfo</code> 를 완성하세요.</p><ul><li>그레이 320×240 CV_8UC1 · 컬러 320×240 CV_8UC3</li><li>실수 100×100 CV_32FC1 · 16비트 2채널 64×64 CV_16UC2</li><li>전체 바이트 = <code>total() * elemSize()</code></li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <iomanip>
using namespace cv;
using namespace std;

void printInfo(const string& name, const Mat& m)
{
    // TODO: rows · cols · 형식 · elemSize · step · 전체 바이트
    cout << left << setw(6) << name << " rows=" << m.rows << endl;
}

int main()
{
    Mat gray(240, 320, CV_8UC1, Scalar(0));
    printInfo("gray", gray);
    // TODO: color, floatMat, u16c2 를 만들어 printInfo
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <iomanip>
using namespace cv;
using namespace std;

void printInfo(const string& name, const Mat& m)
{
    cout << left << setw(6) << name << " rows=" << m.rows << " cols=" << m.cols << " "
         << typeToString(m.type()) << " elemSize=" << m.elemSize() << " step=" << m.step
         << " bytes=" << m.total() * m.elemSize() << endl;
}

int main()
{
    printInfo("gray", Mat(240, 320, CV_8UC1, Scalar(0)));
    printInfo("color", Mat(240, 320, CV_8UC3, Scalar(0)));
    printInfo("float", Mat(100, 100, CV_32FC1, Scalar(0)));
    printInfo("u16c2", Mat(64, 64, CV_16UC2, Scalar(0)));
    return 0;
}`, notes: '<p>정답: 76800 / 230400 / 40000 / 16384 바이트, step 320 / 960 / 400 / 256. CV_16UC2 의 elemSize 가 4(2바이트 × 2채널)인 이유를 확인합니다. <code>const Mat&amp;</code> 로 받는 이유(복사 없음 · 수정 방지)도 짚습니다. 빨리 끝난 학생은 실습 2(얕은 복사 버그). (7분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['이미지 = 숫자 표 = <b>cv::Mat</b>. 행 우선 메모리, 3채널은 B G R 인터리브', '<b>rows/cols</b> · <b>channels()</b> · <b>depth()</b> · <b>type()</b> · elemSize() · <b>step</b> · total()', '형식: CV_ + 비트 수 + U/S/F + C채널 수 → <b>CV_8UC3</b> = uchar 3채널, <code>typeToString</code> 으로 출력', '<code>Mat(행, 열, 형식, Scalar)</code> · zeros/ones/eye · <code>Mat_&lt;T&gt;</code> 쉼표 초기화 · <code>cout &lt;&lt; mat</code>', '<b>Mat b = a 는 데이터 공유</b>(refcount) · 독립 복사는 <b>clone()/copyTo()</b>', '다음 교시: 픽셀을 직접 읽고 쓰기 — at&lt;T&gt;(y, x) · ptr&lt;T&gt;(y) · Vec3b'], notes: '<p>세 가지를 다시 말하게 합니다: ① (행, 열) vs (너비, 높이) ② CV_8UC3 의 뜻 ③ Mat b = a 는 복사가 아니다. 다음 교시에서 at&lt;uchar&gt; 와 at&lt;Vec3b&gt; 로 픽셀을 읽는다고 예고. (2분)</p>' }
        ]
      },

      // ================================================================ 2교시
      {
        id: 'cv03-2', title: '픽셀 접근: at · ptr · Mat_ · 반복자', minutes: 50,
        goals: ['at&lt;uchar&gt; · at&lt;Vec3b&gt; 로 픽셀을 (행 y, 열 x) 순서로 읽고 쓰며, uchar 를 (int) 로 출력할 수 있다', 'ptr&lt;T&gt;(y) 행 포인터 반복으로 이미지를 빠르게 처리할 수 있다', 'Mat_&lt;T&gt; · 반복자 · forEach 를 쓰고, 방법별 속도를 TickMeter 로 비교할 수 있다', '(y, x) 순서 · 채널 형식 실수를 알아보고 피할 수 있다'],
        flow: [['도입: 픽셀 하나 읽기', 5], ['at · Vec3b · ptr', 15], ['반복자 · 속도 · 실수 실습', 20], ['정리 · 퀴즈', 10]],
        content: [
          { type: 'h', text: '픽셀 하나 읽고 쓰기: at<T>(y, x)' },
          { type: 'p', html: 'Mat 의 픽셀은 <code>img.at&lt;T&gt;(행, 열)</code> 로 읽고 씁니다. <b>T 는 픽셀의 자료형</b> — CV_8UC1 이면 <code>uchar</code>, CV_8UC3 이면 <code>Vec3b</code>(uchar 3개), CV_32FC1 이면 <code>float</code> 입니다. <code>at</code> 은 <b>참조(<code>T&amp;</code>)</b>를 돌려주므로 <code>img.at&lt;uchar&gt;(y, x) = 200;</code> 처럼 바로 대입할 수 있습니다. 순서는 <b>(행 y, 열 x)</b> — Python 의 <code>img[y, x]</code> 와 같습니다.' },
          { type: 'figure', html: FIG_YX, caption: '그림 4. 같은 픽셀도 Mat 접근은 (행 y, 열 x), 함수의 점 · 사각형은 (x, y) — 이 두 규칙을 섞으면 안 된다' },
          { type: 'code', title: '예제 1: 작은 Mat 에서 at 으로 읽고 쓰기', code: EX2_AT,
            desc: '<code>at&lt;uchar&gt;(Point(x, y))</code> 처럼 Point 를 넘기면 (x, y) 순서로 쓸 수 있습니다 — 같은 픽셀을 가리킵니다. <code>uchar</code> 는 C++ 에서 <b>문자형</b>이라서 <code>cout</code> 으로 그대로 출력하면 65 가 <b>A</b> 로 나옵니다. 픽셀 값을 출력할 때는 항상 <code>(int)</code> 로 바꾸세요.',
            expect: 'at(1,3) = 200\n[ 15,  10,  10,  10,  10;\n  10,  10,  10, 200,  10;\n  10,  10,  10,  10,  77]\n합계 = 412, 평균 = 27.5\n(int) 없이: A, (int) 붙이면: 65' },
          { type: 'h', text: '컬러 픽셀: Vec3b 와 [0] · [1] · [2]' },
          { type: 'p', html: '3채널 8비트 Mat 의 픽셀은 <b><code>Vec3b</code></b>(<code>Vec&lt;uchar, 3&gt;</code>) 입니다. <code>p[0] = B</code>, <code>p[1] = G</code>, <code>p[2] = R</code> — OpenCV 의 BGR 순서 그대로입니다. <code>Vec3b&amp; p = img.at&lt;Vec3b&gt;(y, x);</code> 처럼 <b>참조로 받으면</b> 채널 하나만 바꿀 수 있고, <code>Vec3b(b, g, r)</code> 로 만들어 통째로 대입할 수도 있습니다. <code>cout &lt;&lt; p</code> 는 <code>[B, G, R]</code> 을 숫자로 출력합니다.' },
          { type: 'image', src: 'images/sample_color.png', caption: 'images/sample_color.png — 회색 트레이 위 7가지 색의 부품 10개 (빨간 원 중심 (120, 110), 초록 사각형 (520, 370), 파란 삼각형 (130, 290))', width: 420 },
          { type: 'code', title: '예제 2: 컬러 이미지 픽셀 읽기 · 쓰기 (Vec3b · Mat_<Vec3b>)', code: EX2_COLOR,
            desc: '빨간 원 중심은 (x=120, y=110) 이므로 <code>at&lt;Vec3b&gt;(110, 120)</code> 으로 읽습니다. 합성 이미지에 센서 잡음이 있어 값이 기준색 근처에서 조금 다릅니다. <code>Mat_&lt;Vec3b&gt; c = img;</code> 는 형식을 타입에 새긴 Mat 으로, <b>헤더만 새로 만들고 데이터를 공유</b>하므로 <code>c(y, x)</code> 로 쓴 값이 img 에 그대로 나타납니다. 결과 창에서 원 중심의 노란 점을 확대해 보세요.',
            expect: '빨간 원  : B=37 G=37 R=196\n초록 사각: [56, 159, 56]\n파란 삼각: [189, 85, 29]\n바꾼 뒤 (110,120): [0, 255, 255]\nMat_ 로 쓴 (200,300): [255, 0, 0]' },
          { type: 'callout', kind: 'warn', title: '자료형이 맞지 않으면 — 컴파일러는 모른다', html: '<code>at&lt;T&gt;</code> 의 T 는 템플릿 인수일 뿐, Mat 의 실제 형식과 맞는지는 <b>컴파일 때 검사되지 않습니다</b>. CV_8UC1 Mat 을 <code>at&lt;int&gt;</code> 로 읽으면 바이트 4개를 int 하나로 해석해 엉뚱한 값이 나오고, <code>at&lt;Vec3b&gt;</code> 로 읽으면 이웃 픽셀 3개를 B, G, R 로 착각합니다(예제 6). <b>type() 을 확인하고 표 2 의 자료형을 쓰세요</b>: CV_8UC1 → uchar, CV_8UC3 → Vec3b, CV_32FC1 → float, CV_16SC1 → short, CV_32SC1 → int. 타입을 고정하고 싶으면 <code>Mat_&lt;T&gt;</code> 를 씁니다 (형식이 다른 Mat 을 대입하면 변환됩니다).' },
          { type: 'h', text: '빠른 반복: 행 포인터 ptr<T>(y)' },
          { type: 'p', html: '<code>img.ptr&lt;T&gt;(y)</code> 는 <b>y 번째 행의 첫 픽셀 주소</b>(<code>data + y × step</code>)를 <code>T*</code> 로 돌려줍니다. 행마다 포인터를 한 번 얻고 안쪽 반복에서는 <code>row[x]</code> 배열 접근만 하므로, 매번 주소를 계산하는 <code>at</code> 보다 빠르고 컴파일러 최적화(벡터화)도 잘 됩니다. 이미지 전체를 훑는 C++ 코드의 <b>표준 형태</b>입니다. 바깥 반복이 <b>행(y)</b>, 안쪽이 <b>열(x)</b> — 메모리 순서와 같아 캐시에도 유리합니다.' },
          { type: 'code', title: '예제 3: ptr 로 그라데이션 만들기 (uchar* · Vec3b*)', code: EX2_PTR,
            desc: '그레이는 <code>uchar*</code>, 컬러는 <code>Vec3b*</code> 행 포인터를 씁니다. 세 번째처럼 3채널 Mat 을 <code>uchar*</code> 로 받으면 한 행이 <code>cols × channels()</code> 바이트의 평범한 배열이 됩니다 — <code>cout</code> 출력에서 값이 0, 1, 2, … 순서로 채워진 것을 확인하세요. 모든 픽셀을 채우므로 초기값 없이 만들어도 괜찮습니다.',
            expect: 'g(100,60)=60, c(200,50)=[50, 200, 128]\nd =\n[  0,   1,   2,   3,   4,   5,   6,   7,   8;\n 100, 101, 102, 103, 104, 105, 106, 107, 108]' },
          { type: 'callout', kind: 'more', title: '📘 isContinuous() 면 한 번에 훑을 수도 있다', html: '행 사이에 빈틈이 없는 Mat(<code>img.isContinuous() == true</code> — imread · clone 결과는 항상 연속)은 전체가 하나의 1차원 배열이므로 <code>uchar* p = img.ptr&lt;uchar&gt;(0);</code> 후 <code>for (size_t i = 0; i &lt; img.total() * img.channels(); i++)</code> 로 한 번에 처리할 수 있습니다. 하지만 3교시의 <b>ROI 는 연속이 아니므로</b> 이렇게 하면 다른 행의 픽셀을 건드립니다. 행마다 <code>ptr(y)</code> 를 얻는 방식은 두 경우 모두 안전합니다.' },
          { type: 'h', text: '반복자 · Mat_<T> · forEach' },
          { type: 'code', title: '예제 4: 반복자와 STL 알고리즘, Mat_<uchar>, forEach', code: EX2_ITER,
            desc: '<code>img.begin&lt;uchar&gt;()</code> ~ <code>end&lt;uchar&gt;()</code> 는 STL 반복자라서 <code>std::accumulate</code> · <code>std::count_if</code> 같은 알고리즘에 그대로 넘길 수 있고, ROI 처럼 연속이 아닌 Mat 에서도 안전합니다(대신 ptr 보다 느림). <code>forEach&lt;T&gt;(람다)</code> 는 (픽셀 참조, 위치 <code>pos[0]=행, pos[1]=열</code>) 을 받는 람다를 모든 픽셀에 적용합니다 — 진짜 OpenCV 는 <b>여러 스레드로 병렬 실행</b>하므로 람다 안에서 공유 변수(합계 등)를 고치면 안 됩니다.',
            expect: '밝은 픽셀(>=200): 252738\n합계: 58924552, 평균: 191.8, 어두운 픽셀(<100): 44889\ng(240, 320) = 22, g(100, 100) = 224\nforEach 반전 후 (240, 320) = 233' },
          { type: 'table', head: ['방법', '코드', '속도', '언제'], rows: [
            ['<code>at&lt;T&gt;(y, x)</code>', '<code>img.at&lt;uchar&gt;(y, x) = v;</code>', '보통 (Debug 는 느림)', '픽셀 몇 개 읽기 · 쓰기'],
            ['<code>ptr&lt;T&gt;(y)</code>', '<code>uchar* p = img.ptr&lt;uchar&gt;(y); p[x]</code>', '<b>빠름</b>', '직접 만든 픽셀 알고리즘 (표준)'],
            ['<code>Mat_&lt;T&gt;</code>', '<code>Mat_&lt;uchar&gt; g = img; g(y, x)</code>', '보통', '형식을 고정해 코드를 짧게'],
            ['반복자', '<code>img.begin&lt;uchar&gt;()</code> · STL 알고리즘', '느림', 'STL 과 함께 · 비연속 Mat'],
            ['<code>forEach</code>', '<code>img.forEach&lt;uchar&gt;([](uchar&amp; p, const int*){…})</code>', '빠름 (병렬)', '픽셀마다 독립적인 계산'],
            ['OpenCV 함수', '<code>bitwise_not</code> · <code>add</code> · <code>LUT</code> · <code>inRange</code> …', '<b>가장 빠름</b> (SIMD)', '<b>있으면 항상 이것</b>']
          ], caption: '표 3. 픽셀 접근 방법 비교 — 직접 반복은 원리를 익히거나 OpenCV 에 없는 규칙일 때만' },
          { type: 'code', title: '예제 5: 밝기 반전 — at · ptr · forEach · bitwise_not 속도 비교 (TickMeter)', code: EX2_SPEED, nondeterministic: true,
            desc: '<code>TickMeter</code> 는 OpenCV 의 스톱워치입니다(<code>start()</code> · <code>stop()</code> · <code>getTimeMilli()</code> · <code>reset()</code>). 네 방법의 결과가 모두 같은지 <code>inv1 != inv4</code>(다르면 255 인 마스크) + <code>countNonZero</code> 로 확인합니다 (0 = 모두 같음). 시간은 PC · 브라우저 · 빌드 설정마다 다르므로 <b>실행할 때마다 달라집니다</b>. Visual Studio 에서는 반드시 <b>Release</b> 로 재세요 — Debug 는 최적화가 꺼져 있고 <code>at</code> 의 범위 검사까지 켜져 수십 배 느립니다.' },
          { type: 'h', text: '흔한 실수 세 가지' },
          { type: 'code', title: '예제 6: (x, y) 순서 · 채널 형식 실수 잡아 보기', code: EX2_MISTAKES,
            desc: '640×480 이미지에서 <code>at(600, 100)</code> 은 "600행" 을 요구하므로 범위 밖입니다. x=600 이 열로는 유효하기 때문에 이런 실수는 <b>가로가 긴 이미지의 오른쪽 픽셀</b>을 읽을 때 갑자기 터집니다. 두 번째 실수는 더 위험합니다: 1채널 Mat 을 <code>at&lt;Vec3b&gt;(100, 10)</code> 로 읽으면 <b>오류 없이</b> 열 30~32 의 그레이 값 3개가 B, G, R 로 나옵니다. 열이 cols/3 을 넘을 때만(300 × 3 ≥ 640) 범위 검사에 걸립니다.',
            expect: 'rows=480, cols=640, CV_8UC1\n실수 1 -> cv::Exception (code -215): at(600, 100) 은 (행, 열)!\n     올바른 at(100, 600) = 25\n실수 2 -> at<Vec3b>(100, 10) = [221, 219, 219]  (진짜 (100,10) = 222)\n     at<Vec3b>(100, 300) -> cv::Exception (code -215)\nCV_8UC1 은 at<uchar>, CV_8UC3 은 at<Vec3b>' },
          { type: 'callout', kind: 'vs', title: 'Debug 와 Release 에서 다르게 동작한다', html: 'OpenCV 의 <code>at</code> · <code>ptr</code> 범위 검사는 <code>CV_DbgAssert</code> 로 되어 있어 <b>Debug 빌드(opencv_world500<b>d</b>.lib)에서만</b> 동작합니다 — 이 사이트도 Debug 처럼 검사해 줍니다. <b>Release 빌드</b>에서는 검사가 빠지므로 범위 밖을 읽으면 쓰레기값이 나오거나 <b>메모리 접근 위반으로 프로그램이 죽습니다</b>. 개발 중에는 Debug 로 실행해 실수를 잡고, 속도 측정과 배포는 Release 로 하세요.' },
          { type: 'callout', kind: 'tip', title: '세 번째 실수: uchar 출력', html: '<code>cout &lt;&lt; img.at&lt;uchar&gt;(y, x);</code> 는 숫자가 아니라 <b>문자</b>를 출력합니다(<code>uchar</code> = <code>unsigned char</code>). 값이 13 이면 줄바꿈 문자, 0 이면 아무것도 안 보입니다. 항상 <code>(int)img.at&lt;uchar&gt;(y, x)</code> 로 출력하세요. <code>Vec3b</code> 전체(<code>cout &lt;&lt; px</code>)와 <code>cout &lt;&lt; mat</code> 은 OpenCV 가 알아서 숫자로 출력합니다.' }
        ],
        practice: [
          {
            title: 'ptr 로 체커보드 만들기', level: 1,
            desc: '256×256 그레이 Mat 에 <b>8×8 칸 체커보드</b>(한 칸 32 픽셀)를 <code>ptr&lt;uchar&gt;(y)</code> 행 포인터 반복으로 그리세요. (행 번호 ÷ 32 + 열 번호 ÷ 32) 가 짝수면 255(흰색), 홀수면 0(검정). 흰 픽셀 수를 <code>countNonZero</code> 로 출력하고 이미지를 표시하세요.',
            hint: '<code>uchar* row = board.ptr&lt;uchar&gt;(y);</code> → <code>row[x] = ((y / 32 + x / 32) % 2 == 0) ? 255 : 0;</code>',
            expect: '흰 픽셀 수: 32768 (전체의 50.0%)\n(0,0)=255, (0,32)=0, (32,32)=255',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat board(256, 256, CV_8UC1, Scalar(0));
    for (int y = 0; y < board.rows; y++)
    {
        uchar* row = board.ptr<uchar>(y);
        for (int x = 0; x < board.cols; x++)
        {
            // TODO: 칸 번호 (y / 32, x / 32) 의 합이 짝수면 row[x] = 255
        }
    }
    int white = countNonZero(board);
    cout << "흰 픽셀 수: " << white << format(" (전체의 %.1f%%)", 100.0 * white / board.total()) << endl;
    cout << "(0,0)=" << (int)board.at<uchar>(0, 0) << ", (0,32)=" << (int)board.at<uchar>(0, 32)
         << ", (32,32)=" << (int)board.at<uchar>(32, 32) << endl;
    imshow("checkerboard", board);
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat board(256, 256, CV_8UC1, Scalar(0));
    for (int y = 0; y < board.rows; y++)
    {
        uchar* row = board.ptr<uchar>(y);
        for (int x = 0; x < board.cols; x++)
            row[x] = ((y / 32 + x / 32) % 2 == 0) ? 255 : 0;
    }
    int white = countNonZero(board);
    cout << "흰 픽셀 수: " << white << format(" (전체의 %.1f%%)", 100.0 * white / board.total()) << endl;
    cout << "(0,0)=" << (int)board.at<uchar>(0, 0) << ", (0,32)=" << (int)board.at<uchar>(0, 32)
         << ", (32,32)=" << (int)board.at<uchar>(32, 32) << endl;
    imshow("checkerboard", board);
    waitKey(0);
    return 0;
}`
          },
          {
            title: '밝은 픽셀 세기: 반복문과 threshold 비교', level: 2,
            desc: '<code>images/washers.png</code>(백라이트 — 배경이 밝고 부품이 어둡다)의 왼쪽 위 200×200 영역에서 밝기가 <b>200 이상</b>인 픽셀(= 배경) 수를 <code>ptr&lt;uchar&gt;</code> 반복으로 세세요. 그다음 같은 영역을 ROI(<code>img(Rect(0, 0, 200, 200))</code>)로 잘라 <code>threshold(roi, bin, 199, 255, THRESH_BINARY)</code> + <code>countNonZero</code> 로 센 값과 같은지 출력하세요. 전체 40,000 픽셀에서 배경을 뺀 나머지가 와셔 2개(W1 · W2)의 면적입니다.',
            hint: '반복 범위는 y 0~199, x 0~199. threshold 는 "199 보다 크면 255" 이므로 200 이상과 같습니다. ROI 는 3교시 내용이지만 미리 써 봅니다.',
            expect: '반복문: 30922\nthreshold: 30922, 같은가? 예\n와셔 면적: 9078 픽셀',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    int count = 0;
    // TODO: y 0~199 에서 행 포인터를 얻고, x 0~199 에서 p[x] >= 200 이면 count++

    cout << "반복문: " << count << endl;

    Mat roi = img(Rect(0, 0, 200, 200));
    Mat bin;
    // TODO: threshold(roi, bin, 199, 255, THRESH_BINARY) 후 countNonZero
    int count2 = 0;
    cout << "threshold: " << count2 << ", 같은가? " << (count == count2 ? "예" : "아니오") << endl;
    cout << "와셔 면적: " << 200 * 200 - count << " 픽셀" << endl;
    imshow("roi", roi);
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
    int count = 0;
    for (int y = 0; y < 200; y++)
    {
        const uchar* p = img.ptr<uchar>(y);
        for (int x = 0; x < 200; x++)
            if (p[x] >= 200) count++;
    }
    cout << "반복문: " << count << endl;

    Mat roi = img(Rect(0, 0, 200, 200));
    Mat bin;
    threshold(roi, bin, 199, 255, THRESH_BINARY);
    int count2 = countNonZero(bin);
    cout << "threshold: " << count2 << ", 같은가? " << (count == count2 ? "예" : "아니오") << endl;
    cout << "와셔 면적: " << 200 * 200 - count << " 픽셀" << endl;
    imshow("roi", roi);
    imshow("bin", bin);
    waitKey(0);
    return 0;
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: 'Mat 과 픽셀: 이미지 자료 구조', subtitle: '2교시 — 픽셀 접근: at · ptr · Mat_ · 반복자', notes: '<p>💬 "이미지 한가운데 픽셀이 얼마나 밝은지 코드로 어떻게 알까?" 지난 시간 Mat 구조(행 우선 · step)를 떠올리게 하고, 오늘은 칸 하나하나를 직접 읽고 쓴다고 안내합니다. (2분)</p>' },
          { layout: 'diagram', title: '(행 y, 열 x) vs (x, y)', html: FIG_YX, caption: 'Mat 접근 at · ptr · Mat_ = (행, 열) · OpenCV 함수의 Point/Rect/Size = (x, y)', notes: '<p>이 차시에서 가장 중요한 슬라이드입니다. 같은 픽셀을 두 방식으로 적어 보게 합니다: 점 (x=4, y=2) → <code>at&lt;uchar&gt;(2, 4)</code>, <code>Point(4, 2)</code>. 💬 "왜 다를까?" — Mat 은 행렬(수학: 행 먼저), 점은 좌표(기하: x 먼저). (5분)</p>' },
          { layout: 'code', title: '예제 1: at<T>(y, x) 로 읽고 쓰기', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat m(3, 5, CV_8UC1, Scalar(10));
    m.at<uchar>(1, 3) = 200;                 // (행 1, 열 3) ← 200
    uchar v = m.at<uchar>(1, 3);             // 읽기 (참조를 돌려줌)
    cout << "at(1,3)=" << (int)v << endl;    // (int) 필수!
    m.at<uchar>(Point(4, 2)) = 77;           // Point 는 (x, y)
    m.at<uchar>(0, 0) += 5;
    cout << m << endl;

    int sum = 0;
    for (int y = 0; y < m.rows; y++)
        for (int x = 0; x < m.cols; x++)
            sum += m.at<uchar>(y, x);
    cout << "합계=" << sum << endl;
    return 0;
}`, points: ['<code>at&lt;T&gt;(y, x)</code> 는 참조 → 읽기 · 쓰기 · <code>+=</code>', 'T 는 픽셀 자료형: CV_8UC1 → <code>uchar</code>', '<code>uchar</code> 출력은 <code>(int)</code> — 안 하면 글자', '바깥 for = 행(y), 안쪽 for = 열(x)'], notes: '<p><code>cout &lt;&lt; m</code> 으로 바뀐 칸을 확인하게 합니다. <code>(int)</code> 를 지우고 실행해 이상한 문자가 나오는 것을 보여 줍니다. 💬 "<code>m.at&lt;uchar&gt;(3, 0)</code> 을 읽으면?" — 행이 0~2 이므로 cv::Exception. (6분)</p>' },
          { layout: 'code', title: '예제 2: 컬러 픽셀 = Vec3b', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png");   // CV_8UC3
    Vec3b red = img.at<Vec3b>(110, 120);   // 빨간 원 중심 (x=120, y=110)
    cout << "B=" << (int)red[0] << " G=" << (int)red[1] << " R=" << (int)red[2] << endl;
    cout << red << endl;                   // [B, G, R]

    for (int y = 105; y < 115; y++)        // 원 중심에 10x10 노란 점
        for (int x = 115; x < 125; x++)
            img.at<Vec3b>(y, x) = Vec3b(0, 255, 255);

    Mat_<Vec3b> c = img;                   // 데이터 공유, c(y, x) 로 짧게
    c(200, 300) = Vec3b(255, 0, 0);
    cout << img.at<Vec3b>(200, 300) << endl;
    imshow("sample_color", img);
    waitKey(0);
    return 0;
}`, points: ['3채널 8비트 → <code>Vec3b</code> (uchar 3개)', '<code>[0] = B</code>, <code>[1] = G</code>, <code>[2] = R</code>', '<code>Vec3b(b, g, r)</code> 로 쓰기 · <code>cout &lt;&lt; px</code> 는 숫자', '<code>Mat_&lt;Vec3b&gt;</code>: 형식 고정 + <code>c(y, x)</code>'], notes: '<p>결과 창에서 원 중심을 확대해 노란 점을 보여 주고, 마우스로 픽셀 값을 읽어 콘솔 출력과 비교합니다. 💬 "R 이 210 근처인데 왜 정확히 210 이 아닐까?" — 카메라 잡음을 흉내 낸 합성 이미지. (5분)</p>' },
          { layout: 'code', title: '예제 3: 행 포인터 ptr<T>(y)', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;
int main()
{
    Mat g(256, 256, CV_8UC1);
    for (int y = 0; y < g.rows; y++)
    {
        uchar* row = g.ptr<uchar>(y);        // = data + y * step
        for (int x = 0; x < g.cols; x++) row[x] = (uchar)x;   // 밝기 = x
    }
    Mat c(256, 256, CV_8UC3);
    for (int y = 0; y < c.rows; y++)
    {
        Vec3b* row = c.ptr<Vec3b>(y);
        for (int x = 0; x < c.cols; x++)
            row[x] = Vec3b((uchar)x, (uchar)y, 128);   // B=x, G=y
    }
    cout << c.at<Vec3b>(200, 50) << endl;
    imshow("gray", g);  imshow("color", c);
    return 0;
}`, points: ['행마다 주소를 <b>한 번만</b> 계산 → 안쪽은 배열 접근', '그레이 <code>uchar*</code> · 컬러 <code>Vec3b*</code>', 'C++ 픽셀 반복의 표준 형태 (가장 빠른 직접 접근)', '모든 픽셀을 채우면 초기값 생략 OK'], notes: '<p>그림 1 의 주소 공식 <code>data + y × step</code> 과 연결합니다. 결과의 색 방향을 읽게 합니다: 오른쪽으로 갈수록 B 증가, 아래로 갈수록 G 증가. 💬 "R = x 로 바꾸면?" 학생들이 직접 바꿔 실행. (6분)</p>' },
          { layout: 'code', title: '예제 4: 반복자 · Mat_ · forEach', code: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <numeric>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    long long sum = accumulate(img.begin<uchar>(), img.end<uchar>(), 0LL);
    int dark = (int)count_if(img.begin<uchar>(), img.end<uchar>(),
                             [](uchar v) { return v < 100; });
    cout << format("평균 %.1f, 어두운 픽셀 %d", (double)sum / img.total(), dark) << endl;

    Mat_<uchar> g = img;                           // g(y, x)
    cout << "g(240, 320) = " << (int)g(240, 320) << endl;

    Mat inv = img.clone();
    inv.forEach<uchar>([](uchar& p, const int* pos) { p = 255 - p; });
    imshow("inverted", inv);
    waitKey(0);
    return 0;
}`, points: ['<code>begin&lt;T&gt;()</code> · <code>end&lt;T&gt;()</code> → STL 알고리즘', '<code>Mat_&lt;uchar&gt;</code> 로 형식을 타입에 고정', '<code>forEach</code>: (픽셀&amp;, 위치) 람다 — 진짜 OpenCV 는 병렬', '람다 안에서 공유 변수 수정 금지'], notes: '<p>STL 을 배운 학생에게 반가운 부분입니다. accumulate 의 초기값을 <code>0LL</code> 로 주는 이유(307,200 × 255 는 int 범위 안이지만 큰 이미지면 넘친다)도 짚습니다. forEach 는 병렬이라 합계 같은 누적에는 쓰지 않는다고 강조. (5분)</p>' },
          { layout: 'two', title: '어떤 방법을 쓸까?', left: { title: '직접 반복 (at · ptr · 반복자 · forEach)', bullets: ['원리 학습, OpenCV 에 없는 특수 규칙', '<b>ptr&lt;T&gt;(y)</b> 가 표준 · 가장 빠른 직접 접근', 'at 은 몇 픽셀 읽기용 (Debug 에서 느림)', '포화 · 경계 · 반올림은 직접 (<code>saturate_cast</code>)'] }, right: { title: 'OpenCV 함수 (bitwise_not · add · LUT …)', bullets: ['SIMD · 병렬 최적화 — 대개 가장 빠름', '포화 연산 등을 알아서 처리', '한 줄 — 읽기 쉽다', '<b>있으면 항상 이쪽</b>', '속도 측정은 <code>TickMeter</code> + Release 빌드'] }, notes: '<p>예제 5(속도 비교)를 실행해 네 방법의 시간을 보여 줍니다. 브라우저(WebAssembly)에서도 ptr 이 at 보다 빠르고, bitwise_not 이 가장 빠른 경우가 많습니다. 시간은 실행마다 달라진다는 점, VS 에서는 Release 로 재야 한다는 점을 강조. (5분)</p>' },
          { layout: 'bullets', title: '흔한 실수 3가지', bullets: [
            '<b>(x, y) 순서</b>: 640×480 에서 <code>at(600, 100)</code> → 행 600 은 없다 → cv::Exception (-215)',
            '<b>채널 형식</b>: CV_8UC1 을 <code>at&lt;Vec3b&gt;</code> 로 → x 가 작으면 <b>오류 없이</b> 이웃 픽셀 3개를 B, G, R 로 착각',
            '<b>uchar 출력</b>: <code>cout &lt;&lt; img.at&lt;uchar&gt;(y, x)</code> → 문자! <code>(int)</code> 로',
            '범위 검사는 <b>Debug 빌드 · 이 사이트</b>에서만 — Release 는 검사 없이 쓰레기값 · 프로그램 종료',
            '해결: <code>typeToString(img.type())</code> 으로 형식 확인 → 표 2 의 자료형'
          ], notes: '<p>예제 6 을 실행해 결과를 함께 읽습니다. 특히 두 번째 실수가 "오류 없이 틀린 값" 을 준다는 점이 무섭다는 것을 강조합니다 — 컴파일러도 OpenCV 도 알려 주지 않는다. (5분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '컬러 이미지(CV_8UC3)에서 <code>x=200, y=50</code> 픽셀을 읽는 올바른 코드는?', options: ['<code>img.at&lt;uchar&gt;(200, 50)</code>', '<code>img.at&lt;Vec3b&gt;(50, 200)</code>', '<code>img.at&lt;Vec3b&gt;(200, 50)</code>', '<code>img.at&lt;int&gt;(50, 200)</code>'], answer: 1, explain: '(행 y=50, 열 x=200) 순서 + 3채널 8비트는 Vec3b.', notes: '<p>정답 2번. 1번(uchar · 순서)과 3번(순서)이 왜 틀렸는지 각각 말하게 합니다. (3분)</p>' },
          { layout: 'practice', title: '실습: ptr 로 체커보드 만들기', desc: '<p>256×256 그레이 Mat 에 8×8 칸(한 칸 32px) 체커보드를 <code>ptr&lt;uchar&gt;(y)</code> 반복으로 그리세요.</p><ul><li><code>(y / 32 + x / 32)</code> 가 짝수면 255</li><li><code>countNonZero</code> 로 흰 픽셀 수 출력 (정답 32768)</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat board(256, 256, CV_8UC1, Scalar(0));
    for (int y = 0; y < board.rows; y++)
    {
        uchar* row = board.ptr<uchar>(y);
        for (int x = 0; x < board.cols; x++)
        {
            // TODO: (y / 32 + x / 32) % 2 == 0 이면 row[x] = 255
        }
    }
    cout << "흰 픽셀 수: " << countNonZero(board) << endl;
    imshow("checkerboard", board);
    waitKey(0);
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat board(256, 256, CV_8UC1, Scalar(0));
    for (int y = 0; y < board.rows; y++)
    {
        uchar* row = board.ptr<uchar>(y);
        for (int x = 0; x < board.cols; x++)
            if ((y / 32 + x / 32) % 2 == 0) row[x] = 255;
    }
    cout << "흰 픽셀 수: " << countNonZero(board) << endl;
    imshow("checkerboard", board);
    waitKey(0);
    return 0;
}`, notes: '<p>정답 32768 (절반). 칸 크기를 16 으로 바꾸거나 컬러(<code>Vec3b*</code>)로 두 색 체커보드를 만들어 보게 합니다. 빨리 끝난 학생은 실습 2(밝은 픽셀 세기 vs threshold). (7분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['<code>at&lt;T&gt;(y, x)</code> 는 참조 — 읽기 · 쓰기. <code>uchar</code> 출력은 <b>(int)</b>', 'T 는 type() 에 맞게: CV_8UC1 → uchar, <b>CV_8UC3 → Vec3b</b> ([0]=B, [1]=G, [2]=R), CV_32FC1 → float', '빠른 반복은 <b>ptr&lt;T&gt;(y)</b> 행 포인터 · <code>Mat_&lt;T&gt;</code> · 반복자 · forEach', '순서는 <b>(행 y, 열 x)</b> — 함수의 Point/Rect 는 (x, y)', '범위 검사는 Debug 에서만 · 속도는 TickMeter + Release · 실제 처리는 OpenCV 함수', '다음 교시: ROI 는 원본을 공유한다 — clone · copyTo · 산술 연산'], notes: '<p>(y, x) 와 Vec3b, ptr 패턴을 다시 확인하고 마칩니다. 다음 교시 예고: "이미지 일부만 잘라 처리하면 원본은 어떻게 될까?" (2분)</p>' }
        ]
      },

      // ================================================================ 3교시
      {
        id: 'cv03-3', title: 'ROI 와 복사, Mat 연산', minutes: 50,
        goals: ['ROI(img(rect) · Mat(img, rect) · rowRange)가 원본 데이터를 공유하고 연속이 아님을 실험으로 확인할 수 있다', 'clone/copyTo 로 독립 복사하고, copyTo(img(r), mask) 로 다른 이미지에 붙일 수 있다', 'Mat 산술 · 비트 · 비교 연산자, saturate_cast, convertTo(alpha, beta), setTo(mask) 를 쓸 수 있다', 'cv::Exception 메시지에서 채널 · 크기 · 형식 오류를 찾을 수 있다'],
        flow: [['도입: 일부만 처리하려면', 5], ['ROI · clone · copyTo', 15], ['연산자 · convertTo · 오류 읽기', 20], ['정리 · 퀴즈', 10]],
        content: [
          { type: 'h', text: 'ROI: 원본 데이터의 일부를 가리키는 헤더' },
          { type: 'p', html: '검사 장비는 보통 화면 전체가 아니라 <b>관심 영역(ROI, Region Of Interest)</b>만 처리합니다. OpenCV 에서 ROI 는 <code>img(Rect(x, y, w, h))</code>, <code>Mat(img, rect)</code>, <code>img(Range(행), Range(열))</code>, <code>img.rowRange(a, b)</code> · <code>colRange</code> · <code>row(y)</code> · <code>col(x)</code> 로 만드는데, 모두 <b>픽셀을 복사하지 않고 원본 데이터의 일부를 가리키는 새 헤더</b>입니다(1교시의 얕은 복사와 같은 원리 — refcount 도 올라갑니다). 그래서 만드는 데 시간이 거의 들지 않고, <b>ROI 를 수정하면 원본도 바뀝니다</b>.' },
          { type: 'figure', html: FIG_ROI, caption: '그림 5. ROI 헤더는 원본 데이터의 (50, 50) 을 가리키고 step 은 원본과 같다 — 행 사이에 원본 픽셀이 끼어 있어 연속이 아니다. clone()/copyTo() 만 새 데이터를 만든다' },
          { type: 'code', title: '예제 1: ROI 를 수정하면 원본이 바뀐다', code: EX3_ROI,
            desc: '<code>roi.setTo(0)</code> 을 했는데 <code>img</code> 의 픽셀이 0 이 됩니다 — 같은 데이터이기 때문입니다. ROI 의 <code>data</code> 는 원본의 (50, 50) 주소(= 50 × 640 + 50 바이트 뒤)이고, <code>step</code> 은 원본과 같은 640 이라 <b>isContinuous() 가 false</b> 입니다. <code>locateROI</code> 로 ROI 가 원본의 어디인지 알 수 있습니다. ROI 안의 좌표는 <b>ROI 기준 (0, 0)</b> 부터 시작합니다. <code>rowRange</code> 처럼 전체 너비의 행 묶음은 연속입니다.',
            expect: 'roi: [200 x 150], isSubmatrix=true, isContinuous=false\nroi.step=640 (img.step=640)\nroi.data - img.data = 32050 (= 50*640 + 50)\nlocateROI: 원본 [640 x 480], 시작 [50, 50]\n수정 전 img(100,100) = 224\nroi.setTo(0) 후 img(100,100) = 0\nroi(0,0)=255 후 img(50,50) = 255\nband: isContinuous=true, img(305, 10) = 255' },
          { type: 'callout', kind: 'tip', title: 'ROI 는 버그가 아니라 기능', html: '"일부만 처리하고 그 결과가 원본에 바로 반영되기"를 원할 때 ROI 는 가장 빠르고 간단한 방법입니다: <code>GaussianBlur(img(r), img(r), Size(5, 5), 0);</code> 처럼 ROI 에 바로 결과를 쓰거나, <code>rectangle(img(r), …)</code> 로 ROI 좌표계에서 그릴 수 있습니다. 반대로 원본을 <b>보존</b>해야 하면 반드시 <code>clone()</code> 하세요.' },
          { type: 'h', text: 'clone · copyTo: 진짜 복사, 그리고 대입의 함정' },
          { type: 'code', title: '예제 2: clone() · copyTo() 와 "roi = 다른 Mat" 함정', code: EX3_CLONE,
            desc: '<code>img(r).clone()</code> 은 "잘라내기"의 정석으로, 결과는 연속 메모리의 독립 Mat 입니다. 가장 흔한 C++ 함정은 <code>roi = black;</code> 입니다 — Mat 끼리의 <code>=</code> 는 <b>roi 헤더가 black 의 데이터를 가리키게 바꿀 뿐</b> 원본 픽셀은 그대로입니다 (<code>img(r) = black;</code> 도 마찬가지로 아무 일도 안 합니다). 원본에 픽셀을 넣으려면 <code>black.copyTo(img(r))</code>. <code>copyTo</code> 는 목적지의 크기 · 형식이 같으면 <b>새로 할당하지 않고 그 메모리에 씁니다</b> — 그래서 ROI 에 복사할 수 있는 것입니다.',
            expect: 'part.setTo(0) 후 img(100,100) = 224 (원본 그대로), part.isContinuous=true\nroi = black 후 img(100,100) = 224 (안 바뀜)\nblack.copyTo(img(r)) 후 img(100,100) = 0\ndst 메모리 재사용? true, dst(100,100) = 0' },
          { type: 'code', title: '예제 3: 로고 삽입 — copyTo(ROI) 와 마스크', code: EX3_LOGO,
            desc: '<b>다른 이미지에 붙이기</b> = "붙일 자리의 ROI 에 copyTo". 크기와 형식이 같아야 합니다. 두 번째 인수로 <b>마스크</b>(CV_8UC1, 0 이 아닌 곳만 복사)를 주면 원 모양처럼 일부만 붙일 수 있어 로고 · 아이콘 오버레이에 쓰입니다. 마스크 밖은 원본 픽셀이 그대로 남습니다.',
            expect: '로고 중심 (원)       : [255, 80, 0]\n로고 모서리 (배경)   : [0, 220, 255]\n마스크 붙임 모서리   : [53, 49, 48] (원본 유지)' },
          { type: 'h', text: 'Mat 산술 · 비트 · 비교 연산자' },
          { type: 'table', head: ['연산', '뜻', '같은 함수', '주의'], rows: [
            ['<code>img + 50</code> / <code>img - 50</code>', '모든 픽셀에 더하기/빼기', '<code>add(img, Scalar(50), dst)</code>', '<b>포화</b>: 0~255 를 벗어나면 잘림 (밝기 조절, 6차시)'],
            ['<code>img * 1.5</code> / <code>img / 2</code>', '모든 픽셀에 곱하기/나누기', '<code>img.convertTo(dst, -1, 1.5)</code>', '대비 조절. 반올림 후 포화'],
            ['<code>a + b</code> / <code>a - b</code>', '픽셀별 덧셈/뺄셈', '<code>add</code> / <code>subtract</code>', '크기 · 형식이 같아야. 음수는 0 → 차이는 <code>absdiff</code>'],
            ['<code>a.mul(b)</code>', '픽셀별 곱셈', '<code>multiply</code>', '<code>a * b</code> 는 <b>행렬 곱</b>(실수 Mat)이다!'],
            ['<code>a &amp; b</code> / <code>a | b</code> / <code>a ^ b</code> / <code>~a</code>', '비트 AND/OR/XOR/NOT', '<code>bitwise_and/or/xor/not</code>', '마스크(0/255) 결합 · 반전'],
            ['<code>a &gt; 100</code> · <code>a == b</code> 등', '비교 → 0/255 마스크 (CV_8U)', '<code>compare</code>', '간단한 이진화 (7차시)']
          ], caption: '표 4. Mat 연산자 — numpy 배열 연산과 비슷하지만 오버플로 대신 포화. 진짜 OpenCV 는 MatExpr(지연 계산)를 거쳐 Mat 이 된다' },
          { type: 'code', title: '예제 4: 산술 · 비트 · 비교 연산자 써 보기', code: EX3_ARITH,
            desc: '<code>img + 50</code> 은 모든 픽셀을 밝게, <code>img * 1.5</code> 는 대비를 키우고, <code>~img</code> 는 반전입니다. 8비트에서 결과는 <b>0~255 로 포화</b>됩니다 — 밝은 배경(215)에 50 을 더하면 265 가 아니라 255. 두 이미지 뺄셈은 음수가 0 이 되므로 "차이"가 필요하면 <code>absdiff</code>. <code>img &lt; 100</code> 같은 비교는 조건을 만족하는 픽셀이 255 인 마스크를 돌려줍니다.',
            expect: '원본 (240,320) = 22, (10,10) = 215\nimg + 50  : 72, 255\nimg - 50  : 0, 165\nimg * 1.5 : 33, 255\n~img      : 233, 40\nimg - other = 0, absdiff = 11\nimg & mask: 안=22, 밖=0\nimg < 100 인 픽셀 수: 44889' },
          { type: 'h', text: 'saturate_cast · convertTo · setTo(mask)' },
          { type: 'p', html: '직접 픽셀을 계산할 때 C++ 의 형 변환 <code>(uchar)300</code> 은 <b>256 으로 나눈 나머지 44</b> 가 됩니다. OpenCV 함수와 같은 포화 결과를 얻으려면 <b><code>saturate_cast&lt;uchar&gt;(값)</code></b> 을 쓰세요 — 범위를 넘으면 잘라 내고 실수는 반올림합니다. <code>src.convertTo(dst, 형식, alpha, beta)</code> 는 모든 픽셀에 <b>dst = saturate_cast(src × alpha + beta)</b> 를 적용하며 깊이를 바꿉니다(형식에 <code>-1</code> 을 주면 깊이 유지).' },
          { type: 'code', title: '예제 5: saturate_cast · convertTo(alpha, beta) · setTo(값, 마스크)', code: EX3_CONVERT,
            desc: '8비트 → 32F 로 바꿔 0~1 범위로 만들면 오버플로 걱정 없이 계산할 수 있고, 표시할 때는 다시 8비트로 돌립니다 (<code>imshow</code> 는 32F 를 0~1 로 가정해 보여 줍니다). <code>convertTo(adj, -1, 1.5, -40)</code> 은 대비 1.5배 · 밝기 −40 — 22 는 <code>1.5×22−40 = −7</code> 이 포화되어 0, 215 는 282.5 가 포화되어 255 가 됩니다. <code>setTo(값, 마스크)</code> 는 마스크가 0 이 아닌 픽셀만 값으로 채웁니다 — 검출 결과를 색으로 칠할 때 자주 씁니다.',
            expect: 'saturate_cast<uchar>(300) = 255, (uchar)300 = 44\nsaturate_cast<uchar>(-20) = 0, saturate_cast<uchar>(127.6) = 128\nCV_32FC1, f(240,320) = 0.086\n1.5*v-40: (240,320) 22 -> 0, (10,10) 215 -> 255\nCV_8UC1, back(240,320) = 22\n마스크 픽셀 수: 46478\n와셔 몸통 (y=60, x=90) = [0, 0, 255]\n배경 (y=10, x=10)      = [111, 96, 82]' },
          { type: 'h', text: '오류 메시지 읽는 법: cv::Exception' },
          { type: 'code', title: '예제 6: 채널 · 크기 · 형식 오류를 try/catch 로 모아 보기', code: EX3_ERRORS,
            desc: 'OpenCV 함수는 잘못된 입력을 받으면 <code>cv::Exception</code>(<code>std::exception</code> 을 상속)을 던집니다. <code>e.what()</code> 은 <code>OpenCV(5.0.0) 파일:줄: error: (코드:설명) … in function …</code> 형식의 긴 메시지이고, <code>e.code</code> 는 오류 코드입니다. 예제는 <code>(코드:설명)</code> 부분만 잘라 보여 줍니다. try/catch 가 없으면 프로그램이 종료되며 결과 창(또는 콘솔)에 전체 메시지가 나옵니다.',
            expect: '오류 1: (-15:Bad number of channels)\n오류 2: (-209:Sizes of input arguments do not match)\n오류 3: (-209:Sizes of input arguments do not match)\n오류 4: (-215:Assertion failed)\n오류 5: (-2:Unspecified error)\ngray [640 x 480] CV_8UC1 / color [640 x 480] CV_8UC3' },
          { type: 'table', head: ['메시지 조각', '뜻', '해결'], rows: [
            ['<code>Bad number of channels</code> · <code>\'scn\' is 1</code>', '입력 채널 수가 틀림 — 그레이를 BGR2GRAY 에 넘김', '<code>channels()</code> 확인, 컬러로 읽거나 <code>COLOR_GRAY2BGR</code>'],
            ['<code>src_type == CV_8UC1</code> · <code>\'src_type\' is 64 (CV_8UC3)</code>', '8비트 1채널이 필요 (Otsu · findContours 등)', '<code>cvtColor(BGR2GRAY)</code> · <code>convertTo(CV_8U)</code>'],
            ['<code>Sizes of input arguments do not match</code>', '두 Mat 의 크기 또는 채널 수가 다름', '<code>size()</code> · <code>typeToString(type())</code> 출력 → resize / cvtColor 로 맞추기'],
            ['<code>0 &lt;= roi.x &amp;&amp; … roi.x + roi.width &lt;= m.cols</code>', 'Rect 가 이미지 밖으로 나감', '<code>r &amp;= Rect(0, 0, img.cols, img.rows);</code> 로 잘라내기'],
            ['<code>!_src.empty()</code>', '빈 Mat — 대부분 imread 경로 오류', '<code>img.empty()</code> 확인, 경로 · 작업 폴더 확인']
          ], caption: '표 5. 자주 보는 오류 메시지와 해결법 — 결과 창도 이 메시지들에 도움말을 붙여 준다' },
          { type: 'callout', kind: 'vs', title: 'Visual Studio 에서 예외가 나면', html: 'try/catch 없이 OpenCV 예외가 나면 콘솔 창에 메시지가 찍히고 <code>abort()</code> 로 종료되거나, 디버거가 <b>"처리되지 않은 예외: cv::Exception"</b> 에서 멈춥니다. 이때 <b>호출 스택(Call Stack)</b> 창에서 내 코드(main.cpp)의 줄을 더블클릭하면 어느 호출이 원인인지 바로 보입니다. 메시지 전체는 출력(Output) 창에 있습니다.' },
          { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 · 오개념 지도', html: '<ul><li><b>ROI 공유</b>는 학생들이 가장 놀라는 부분입니다. 예제 1 을 실행 전에 "roi.setTo(0) 하면 img 는 바뀔까?" 를 투표시키고 실행하면 기억에 남습니다.</li><li><b><code>roi = black;</code> 함정</b>: "=" 가 C++ 에서 무엇을 복사하는지(헤더) 1교시 그림 3 으로 되돌아가 설명하세요. <code>img(r) = Scalar(0)</code>(픽셀 채움) 과 <code>img(r) = black</code>(아무 일 없음) 을 나란히 판서하면 효과적입니다.</li><li><b>포화 연산</b>: <code>(uchar)300 = 44</code> 와 <code>saturate_cast&lt;uchar&gt;(300) = 255</code>, <code>img + 100 → 255</code> 를 비교하면 차이가 분명해집니다.</li><li>평가 루브릭: ① ROI 수정 → 원본 변화 설명 (3) ② clone/copyTo · 대입 구분 (3) ③ 오류 메시지에서 원인(채널/크기) 찾기 (4).</li><li>시간이 남으면 <code>addWeighted</code>(가중 합)로 두 이미지 블렌딩을 시연 — 4차시 오버레이에서 다시 씁니다.</li></ul>' }
        ],
        practice: [
          {
            title: '4분할 영역별 평균 밝기', level: 1,
            desc: '<code>images/washers.png</code>(그레이) 를 <b>4분할</b>(왼쪽 위 · 오른쪽 위 · 왼쪽 아래 · 오른쪽 아래, 각 320×240) ROI 로 나누고, 각 영역의 <b>평균 밝기</b>(<code>mean(roi)[0]</code>, 소수 첫째 자리)를 출력하세요. 가장 어두운 영역(부품이 많은 곳)의 ROI 를 <code>setTo(Scalar(0))</code> 으로 검게 만들어 원본 이미지를 표시하세요.',
            hint: 'Rect 4개를 배열(또는 vector)에 넣고 반복. 가장 어두운 것은 최소 평균을 기억하는 변수로. <code>img(quads[i]).setTo(Scalar(0));</code> 이 원본을 바꿉니다.',
            expect: '왼쪽 위: 평균 밝기 189.9\n오른쪽 위: 평균 밝기 177.9\n왼쪽 아래: 평균 밝기 204.7\n오른쪽 아래: 평균 밝기 194.8\n가장 어두운 영역: 오른쪽 위',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    int w = img.cols / 2, h = img.rows / 2;
    Rect quads[] = { Rect(0, 0, w, h), Rect(w, 0, w, h), Rect(0, h, w, h), Rect(w, h, w, h) };
    string names[] = { "왼쪽 위", "오른쪽 위", "왼쪽 아래", "오른쪽 아래" };

    // TODO: 각 ROI 의 평균 밝기를 출력하고 가장 어두운 영역을 찾으세요
    for (int i = 0; i < 4; i++)
    {
        Mat roi = img(quads[i]);
        cout << names[i] << ": " << quads[i] << endl;
    }

    // TODO: 가장 어두운 영역의 ROI 를 setTo(Scalar(0)) 으로 검게
    imshow("washers", img);
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
    int w = img.cols / 2, h = img.rows / 2;
    Rect quads[] = { Rect(0, 0, w, h), Rect(w, 0, w, h), Rect(0, h, w, h), Rect(w, h, w, h) };
    string names[] = { "왼쪽 위", "오른쪽 위", "왼쪽 아래", "오른쪽 아래" };

    int darkest = 0;
    double minMean = 255;
    for (int i = 0; i < 4; i++)
    {
        double m = mean(img(quads[i]))[0];
        cout << names[i] << format(": 평균 밝기 %.1f", m) << endl;
        if (m < minMean) { minMean = m; darkest = i; }
    }
    cout << "가장 어두운 영역: " << names[darkest] << endl;
    img(quads[darkest]).setTo(Scalar(0));
    imshow("washers", img);
    waitKey(0);
    return 0;
}`
          },
          {
            title: '두 이미지 합성: 반반 붙이기 + 마스크로 겹치기', level: 2,
            desc: '<code>images/washers.png</code> 와 <code>images/coins_parts.png</code>(둘 다 640×480 그레이)로 ① 왼쪽 절반은 washers, 오른쪽 절반은 coins 인 이미지를 <b>copyTo(ROI)</b> 로 만들고, ② coins 의 밝은 부품(<code>coins &gt; 105</code> 마스크)만 washers 위에 <b>copyTo(dst, mask)</b> 로 겹친 이미지를 만드세요. 마스크의 흰 픽셀 수와 합성 결과의 (240, 320) 픽셀 값을 출력하세요. 원본 washers 는 바뀌면 안 됩니다(clone!).',
            hint: '① <code>coins(right).copyTo(half(right));</code> — ROI → ROI 복사. ② <code>Mat over = washers.clone(); coins.copyTo(over, mask);</code> — <code>Mat half = washers;</code> 로 하면 washers 원본이 바뀝니다.',
            expect: '마스크 흰 픽셀: 26230\nhalf(240,500) = coins(240,500) ? 예\nover(240,320) = 22\nwashers 원본 (240,500) 그대로? 예',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat washers = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat coins = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    Mat washersBackup = washers.clone();           // 검사용 원본 보관
    Rect right(320, 0, 320, 480);

    // ① 반반 붙이기: half = washers 의 복사본, 오른쪽 절반에 coins 의 오른쪽 절반을 copyTo
    Mat half = washers.clone();
    // TODO

    // ② 마스크로 겹치기: coins 의 밝은 부품(> 105)만 washers 복사본 위에
    Mat mask = coins > 105;
    Mat over = washers.clone();
    // TODO: coins.copyTo(over, mask);

    cout << "마스크 흰 픽셀: " << countNonZero(mask) << endl;
    cout << "half(240,500) = coins(240,500) ? " << (half.at<uchar>(240, 500) == coins.at<uchar>(240, 500) ? "예" : "아니오") << endl;
    cout << "over(240,320) = " << (int)over.at<uchar>(240, 320) << endl;
    cout << "washers 원본 (240,500) 그대로? " << (washers.at<uchar>(240, 500) == washersBackup.at<uchar>(240, 500) ? "예" : "아니오") << endl;
    imshow("half", half);
    imshow("over", over);
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat washers = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat coins = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    Mat washersBackup = washers.clone();           // 검사용 원본 보관
    Rect right(320, 0, 320, 480);

    Mat half = washers.clone();
    coins(right).copyTo(half(right));              // ROI → ROI 복사

    Mat mask = coins > 105;
    Mat over = washers.clone();
    coins.copyTo(over, mask);                      // 마스크가 255 인 곳만

    cout << "마스크 흰 픽셀: " << countNonZero(mask) << endl;
    cout << "half(240,500) = coins(240,500) ? " << (half.at<uchar>(240, 500) == coins.at<uchar>(240, 500) ? "예" : "아니오") << endl;
    cout << "over(240,320) = " << (int)over.at<uchar>(240, 320) << endl;
    cout << "washers 원본 (240,500) 그대로? " << (washers.at<uchar>(240, 500) == washersBackup.at<uchar>(240, 500) ? "예" : "아니오") << endl;
    imshow("half", half);
    imshow("over", over);
    waitKey(0);
    return 0;
}`
          }
        ],
        quiz: QUIZ3,
        slides: [
          { layout: 'title', title: 'Mat 과 픽셀: 이미지 자료 구조', subtitle: '3교시 — ROI 와 복사, Mat 연산', notes: '<p>💬 "검사 카메라 화면에서 부품이 있는 부분만 처리하고 싶다면?" — 관심 영역(ROI). 오늘의 핵심 질문: "ROI 를 고치면 원본은?" 을 던지고 시작합니다. 1교시의 "헤더와 데이터" 그림을 다시 떠올리게 합니다. (2분)</p>' },
          { layout: 'diagram', title: 'ROI 는 원본을 가리키는 헤더', html: FIG_ROI, caption: 'img(rect) · Mat(img, rect) · rowRange … 은 데이터 공유(step 은 원본과 같음, 비연속). clone()/copyTo() 만 새 데이터', notes: '<p>실행 전 투표: "roi.setTo(0) 하면 img 도 검게 될까?" 손 들게 한 뒤 예제 1 을 실행합니다. 아래 메모리 띠에서 ROI 행 사이에 원본 픽셀이 끼어 있는 모습 → isContinuous false 를 설명. 오른쪽 "언제 무엇을?" 을 함께 읽습니다. (5분)</p>' },
          { layout: 'code', title: '예제 1: ROI 수정 → 원본이 바뀐다', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat roi = img(Rect(50, 50, 200, 150));       // = Mat(img, rect)

    cout << boolalpha << "isContinuous=" << roi.isContinuous()
         << ", step=" << roi.step << endl;       // 640 (원본과 같음)
    cout << "data 차이=" << (roi.data - img.data) << endl;   // 50*640+50

    cout << "전 img(100,100)=" << (int)img.at<uchar>(100, 100) << endl;
    roi.setTo(Scalar(0));                        // ROI 를 검게
    cout << "후 img(100,100)=" << (int)img.at<uchar>(100, 100) << endl;  // 0!

    roi.at<uchar>(0, 0) = 255;                   // ROI (0,0) = 원본 (50,50)
    cout << "img(50,50)=" << (int)img.at<uchar>(50, 50) << endl;
    imshow("img", img);
    waitKey(0);
    return 0;
}`, points: ['ROI = 원본 데이터를 가리키는 헤더 → 수정하면 원본도', 'step 은 원본과 같다 → <code>isContinuous() == false</code>', 'ROI 안 좌표는 ROI 의 (0, 0) 부터', '복사가 없어 매우 빠르다 — 검사 장비의 기본 기법'], notes: '<p>실행 결과 img(100,100) 이 0 이 되는 것을 확인하고 투표 결과와 비교합니다. "이건 버그가 아니라 기능" — 일부만 처리해 원본에 바로 반영할 때 씀. 원본을 지키려면 다음 슬라이드. (6분)</p>' },
          { layout: 'code', title: '예제 2: clone · copyTo · 대입의 함정', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;
int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    Rect r(50, 50, 200, 150);
    Mat part = img(r).clone();                   // 잘라내기 (독립, 연속)
    part.setTo(Scalar(0));
    cout << "img(100,100)=" << (int)img.at<uchar>(100, 100) << endl;   // 224

    Mat black = Mat::zeros(r.size(), CV_8UC1);
    Mat roi = img(r);
    roi = black;                                 // ✗ 헤더만 바뀜
    cout << "roi = black 후: " << (int)img.at<uchar>(100, 100) << endl;   // 224

    black.copyTo(img(r));                        // ✓ 픽셀 복사
    cout << "copyTo 후: " << (int)img.at<uchar>(100, 100) << endl;      // 0

    img(Rect(300, 300, 50, 50)) = Scalar(255);   // ✓ Scalar 대입은 픽셀을 채움
    imshow("img", img);  waitKey(0);
    return 0;
}`, points: ['<code>img(r).clone()</code> = 잘라내기의 정석', '<code>roi = black;</code> · <code>img(r) = black;</code> 은 <b>픽셀 복사가 아니다</b>', '붙이기 = <code>src.copyTo(img(r))</code> (크기 · 형식 같아야)', '<code>img(r) = Scalar(v)</code> 는 픽셀을 채운다'], notes: '<p>C++ 강좌에서 꼭 짚어야 할 함정입니다. OpenCvSharp(C#) 의 <code>img[rect] = logo</code> 는 복사하지만 C++ 의 <code>img(r) = logo</code> 는 임시 헤더에 대입할 뿐이라 아무 일도 없습니다. 💬 "왜 Scalar 대입은 될까?" — <code>operator=(const Scalar&amp;)</code> 는 데이터를 채우도록 정의되어 있다. (6분)</p>' },
          { layout: 'code', title: '예제 3: 로고 붙이기 — copyTo(ROI, mask)', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png");
    Mat logo(80, 80, CV_8UC3, Scalar(0, 220, 255));             // 노란 배경
    circle(logo, Point(40, 40), 30, Scalar(255, 80, 0), FILLED);  // 파란 원
    Mat mask = Mat::zeros(80, 80, CV_8UC1);
    circle(mask, Point(40, 40), 30, Scalar(255), FILLED);         // 원 부분만 255

    Rect pos1(img.cols - 90, 10, 80, 80), pos2(10, img.rows - 90, 80, 80);
    logo.copyTo(img(pos1));              // 사각형 그대로
    logo.copyTo(img(pos2), mask);        // 원 부분만

    cout << img.at<Vec3b>(pos1.y + 2, pos1.x + 2) << " / "
         << img.at<Vec3b>(pos2.y + 2, pos2.x + 2) << endl;
    imshow("logo", img);
    waitKey(0);
    return 0;
}`, points: ['붙일 자리의 <b>ROI</b> 에 <code>copyTo</code>', '<code>copyTo(dst, mask)</code>: 마스크가 0 이 아닌 곳만', '마스크 밖은 원본 유지 → 모양대로 붙이기', '로고 · 아이콘 · 검사 결과 오버레이에 활용'], notes: '<p>두 로고의 차이(사각형/원)를 결과 창에서 보여 줍니다. 💬 "로고가 90×90 이면?" — copyTo 는 목적지를 새로 할당해 버리므로 img 에 안 붙는다 → resize 로 크기를 맞춰야 함. (5분)</p>' },
          { layout: 'table', title: 'Mat 연산자', head: ['연산', '뜻', '함수', '주의'], rows: [
            ['<code>img + 50</code>, <code>img - 50</code>', '밝기 이동', 'add / subtract', '0~255 <b>포화</b>'],
            ['<code>img * 1.5</code>', '대비', 'convertTo', '반올림 후 포화'],
            ['<code>a - b</code>', '픽셀별 뺄셈', 'subtract', '음수 → 0. 차이는 <b>absdiff</b>'],
            ['<code>a.mul(b)</code>', '픽셀별 곱', 'multiply', '<code>a * b</code> 는 행렬 곱!'],
            ['<code>a &amp; m</code>, <code>a | m</code>, <code>~a</code>', '비트 연산', 'bitwise_and/or/not', '마스크(0/255) 용'],
            ['<code>a &gt; 100</code>', '비교 → 마스크', 'compare', '간단한 이진화']
          ], lead: 'numpy 배열 연산과 비슷하지만 오버플로 대신 포화', notes: '<p>예제 4 를 실행해 (240,320) 과 (10,10) 값이 각 연산으로 어떻게 바뀌는지 봅니다. C++ <code>(uchar)(200 + 100)</code> = 44 와 Mat 의 포화(255)를 대비시킵니다. <code>a * b</code> 가 행렬 곱이라는 점은 Python(numpy 의 <code>*</code> 는 원소 곱)과 반대라 주의. (5분)</p>' },
          { layout: 'code', title: '예제 5: saturate_cast · convertTo · setTo(mask)', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;
int main()
{
    int big = 300;
    cout << (int)saturate_cast<uchar>(big) << " vs " << (int)(uchar)big << endl;  // 255 vs 44

    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat f, adj, back;
    img.convertTo(f, CV_32F, 1.0 / 255.0);       // dst = src*alpha + beta → 0~1
    img.convertTo(adj, -1, 1.5, -40);            // 깊이 그대로, 대비 · 밝기
    f.convertTo(back, CV_8U, 255.0);             // 표시용 8비트로
    cout << format("f=%.3f adj=%d back=%d", f.at<float>(240, 320),
                   (int)adj.at<uchar>(240, 320), (int)back.at<uchar>(240, 320)) << endl;

    Mat color = imread("images/nuts_bolts_color.png"), mask;
    threshold(img, mask, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    color.setTo(Scalar(0, 0, 255), mask);        // 부품 자리만 빨갛게
    imshow("adj", adj);  imshow("setTo(red, mask)", color);
    waitKey(0);
    return 0;
}`, points: ['<code>saturate_cast&lt;uchar&gt;</code>: 잘라 내기 + 반올림 (C++ 캐스트와 다름)', '<code>convertTo(dst, 형식, alpha, beta)</code> = saturate(src×alpha + beta)', '형식 <code>-1</code> = 깊이 유지 · 32F 로 계산 → 8U 로 표시', '<code>setTo(값, 마스크)</code>: 검출 결과 색칠'], notes: '<p>직접 픽셀 반복으로 밝기를 바꿀 때 <code>saturate_cast</code> 를 안 쓰면 밝은 곳이 검게 뒤집히는 버그가 난다는 것을 보여 주세요 (<code>(uchar)(v + 100)</code>). SetTo 결과에서 백라이트 마스크가 컬러 사진의 부품 자리와 맞는 이유 — 같은 배치의 합성 이미지. (5분)</p>' },
          { layout: 'bullets', title: '오류 메시지 읽는 법: cv::Exception', bullets: [
            '<code>(-15:Bad number of channels)</code> · <code>\'scn\' is 1</code> → 입력 <b>채널 수</b>가 틀림',
            '<code>src_type == CV_8UC1</code> · <code>is 64 (CV_8UC3)</code> → <b>8비트 1채널</b> 필요',
            '<code>(-209:Sizes of input arguments do not match)</code> → 두 Mat 의 <b>크기/채널 불일치</b>',
            '<code>(-215:Assertion failed) … roi.x + roi.width &lt;= m.cols</code> → Rect 가 이미지 밖',
            '<code>!_src.empty()</code> → imread 경로 오류. <code>empty()</code> 로 먼저 확인',
            '디버깅 1순위: 관련 Mat 의 <code>size()</code> 와 <code>typeToString(type())</code> 출력'
          ], notes: '<p>예제 6 을 실행해 다섯 메시지를 함께 읽습니다. try/catch 로 <code>const cv::Exception&amp;</code> 을 잡는 문법도 짚습니다. "오류 메시지는 힌트" 라는 태도를 심어 주는 것이 목표. VS 에서는 호출 스택으로 원인 줄을 찾는다. (5분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: 'logo(80×80) 를 img 의 <code>Rect r(10, 10, 80, 80)</code> 자리에 붙이는 올바른 코드는?', options: ['<code>img(r) = logo;</code>', '<code>Mat roi = img(r); roi = logo;</code>', '<code>logo.copyTo(img(r));</code>', '<code>img = logo(r);</code>'], answer: 2, explain: 'Mat 끼리 = 는 헤더만 바꾼다. 픽셀을 넣으려면 목적지 ROI 에 copyTo.', notes: '<p>정답 3번. 1·2번이 컴파일은 되지만 아무 일도 하지 않는다는 점을 다시 강조합니다. 수업 시작 때의 투표(ROI 공유)와 연결해 정리합니다. (2분)</p>' },
          { layout: 'practice', title: '실습: 4분할 영역별 평균 밝기', desc: '<p><code>washers.png</code> 를 320×240 ROI 4개로 나누어 각 평균 밝기를 출력하고, 가장 어두운 영역을 <code>setTo(Scalar(0))</code> 으로 검게 만드세요.</p><ul><li><code>mean(img(rect))[0]</code></li><li><code>img(rect).setTo(Scalar(0))</code> 이 원본을 바꾼다</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    int w = img.cols / 2, h = img.rows / 2;
    Rect quads[] = { Rect(0, 0, w, h), Rect(w, 0, w, h), Rect(0, h, w, h), Rect(w, h, w, h) };
    // TODO: 각 ROI 평균 밝기 출력, 가장 어두운 영역 setTo(Scalar(0))
    imshow("washers", img);
    waitKey(0);
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    int w = img.cols / 2, h = img.rows / 2;
    Rect quads[] = { Rect(0, 0, w, h), Rect(w, 0, w, h), Rect(0, h, w, h), Rect(w, h, w, h) };
    int darkest = 0; double minMean = 255;
    for (int i = 0; i < 4; i++)
    {
        double m = mean(img(quads[i]))[0];
        cout << quads[i] << format(": %.1f", m) << endl;
        if (m < minMean) { minMean = m; darkest = i; }
    }
    img(quads[darkest]).setTo(Scalar(0));
    imshow("washers", img);
    waitKey(0);
    return 0;
}`, notes: '<p>부품이 많은 영역(오른쪽 위, 177.9)이 가장 어둡게 나옵니다(백라이트). ROI 에 setTo 한 것이 원본 img 에 반영되어 표시되는 것을 확인. <code>cout &lt;&lt; Rect</code> 가 <code>[320 x 240 from (320, 0)]</code> 형식으로 출력되는 것도 보여 줍니다. 빨리 끝난 학생은 실습 2(두 이미지 합성). (7분)</p>' },
          { layout: 'summary', title: '정리 — 03차시 전체', bullets: ['Mat = <b>헤더 + 참조 계수 + 데이터</b>. <code>Mat b = a</code> · 값 전달 · ROI 는 데이터 공유, <b>clone/copyTo</b> 만 새 데이터', '형식 <b>CV_8UC3</b> = uchar 3채널 · (행, 열) vs (너비, 높이) · <code>typeToString</code>', '픽셀: <code>at&lt;T&gt;(y, x)</code> · <b><code>ptr&lt;T&gt;(y)</code></b> · <code>Mat_&lt;T&gt;</code> · 반복자 · <code>(int)</code> 출력', 'ROI <code>img(rect)</code> 는 원본 공유 · 비연속 · 붙이기는 <code>copyTo(img(r)[, mask])</code> · <code>img(r) = mat</code> 은 함정', '연산자는 <b>포화</b> · <code>saturate_cast</code> · <code>convertTo(alpha, beta)</code> · <code>setTo(값, mask)</code>', '다음 차시: 그리기와 텍스트 — line · rectangle · circle · putText'], notes: '<p>차시 전체를 되짚습니다. 다음 차시(그리기)는 오늘 배운 Point/Rect/Scalar 와 ROI 를 그대로 씁니다. 과제: 실습 2(두 이미지 합성)를 완성해 오기. (3분)</p>' }
        ]
      }
    ]
  });
})();
