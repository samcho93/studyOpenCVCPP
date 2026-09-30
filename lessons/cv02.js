/* 02차시 첫 OpenCV 프로그램: 읽기 · 보기 · 저장 · 창과 키 */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 파일 → imread → Mat → imshow / 처리 → imwrite → 파일
  const FIG_PIPE = `<svg viewBox="0 0 760 300" role="img" aria-label="이미지 파일을 imread 로 읽어 Mat 을 만들고, imshow 로 창에 보여 주거나 처리한 뒤 imwrite 로 파일에 저장하는 흐름">
  ${ARROW('c02a1')}
  <rect x="10" y="100" width="130" height="90" rx="10" class="p1s"/>
  <text x="75" y="130" text-anchor="middle" class="tx-b">📄 파일</text>
  <text x="75" y="152" text-anchor="middle" class="tx-m">washers.png</text>
  <text x="75" y="172" text-anchor="middle" class="tx-m">(압축된 바이트)</text>
  <line x1="142" y1="145" x2="206" y2="145" class="ln" stroke-width="2" marker-end="url(#c02a1)"/>
  <text x="174" y="132" text-anchor="middle" class="tx">imread</text>
  <text x="174" y="168" text-anchor="middle" class="tx-m">디코딩</text>
  <rect x="210" y="40" width="260" height="210" rx="12" class="card-bg"/>
  <text x="340" y="66" text-anchor="middle" class="tx-b">Mat (메모리 속 이미지)</text>
  <rect x="226" y="80" width="110" height="150" rx="8" class="p2s"/>
  <text x="281" y="102" text-anchor="middle" class="tx-b">헤더</text>
  <text x="281" y="124" text-anchor="middle" class="tx-m">rows = 480</text>
  <text x="281" y="144" text-anchor="middle" class="tx-m">cols = 640</text>
  <text x="281" y="164" text-anchor="middle" class="tx-m">type = CV_8UC1</text>
  <text x="281" y="184" text-anchor="middle" class="tx-m">step = 640</text>
  <text x="281" y="208" text-anchor="middle" class="tx-m">data ●</text>
  <rect x="356" y="80" width="98" height="150" rx="8" class="p3s"/>
  <text x="405" y="102" text-anchor="middle" class="tx-b">픽셀 데이터</text>
  <rect x="370" y="116" width="70" height="98" class="p3"/>
  <line x1="370" y1="140" x2="440" y2="140" class="s3" stroke-width="1"/>
  <line x1="370" y1="164" x2="440" y2="164" class="s3" stroke-width="1"/>
  <line x1="370" y1="188" x2="440" y2="188" class="s3" stroke-width="1"/>
  <line x1="316" y1="204" x2="366" y2="204" class="ln" stroke-width="1.5" marker-end="url(#c02a1)"/>
  <line x1="472" y1="100" x2="556" y2="70" class="ln" stroke-width="2" marker-end="url(#c02a1)"/>
  <text x="508" y="70" text-anchor="middle" class="tx">imshow</text>
  <rect x="560" y="30" width="190" height="90" rx="10" class="p4s"/>
  <text x="655" y="58" text-anchor="middle" class="tx-b">🪟 창 "input"</text>
  <text x="655" y="80" text-anchor="middle" class="tx-m">waitKey 가 호출될 때</text>
  <text x="655" y="100" text-anchor="middle" class="tx-m">화면이 그려진다</text>
  <line x1="472" y1="190" x2="556" y2="220" class="ln" stroke-width="2" marker-end="url(#c02a1)"/>
  <text x="506" y="232" text-anchor="middle" class="tx">imwrite</text>
  <rect x="560" y="170" width="190" height="90" rx="10" class="p1s"/>
  <text x="655" y="198" text-anchor="middle" class="tx-b">📄 result.png</text>
  <text x="655" y="220" text-anchor="middle" class="tx-m">확장자로 형식 결정</text>
  <text x="655" y="240" text-anchor="middle" class="tx-m">(인코딩 · 성공하면 true)</text>
  <text x="380" y="288" text-anchor="middle" class="tx-m">파일은 압축된 바이트, Mat 은 압축이 풀린 픽셀 배열 — 처리는 언제나 Mat 에서 한다</text>
</svg>`;

  // 그림 2: 상대 경로와 작업 폴더
  const FIG_PATH = `<svg viewBox="0 0 760 300" role="img" aria-label="상대 경로 images/washers.png 는 작업 폴더를 기준으로 찾는다. Visual Studio 에서 F5 로 실행하면 프로젝트 폴더, exe 를 더블클릭하면 exe 가 있는 폴더가 작업 폴더가 된다">
  ${ARROW('c02a2')}
  <rect x="250" y="12" width="260" height="46" rx="10" class="p2s"/>
  <text x="380" y="34" text-anchor="middle" class="tx-b">imread("images/washers.png")</text>
  <text x="380" y="51" text-anchor="middle" class="tx-m">상대 경로 = 작업 폴더 + 경로</text>
  <line x1="300" y1="60" x2="140" y2="96" class="ln" stroke-width="2" marker-end="url(#c02a2)"/>
  <line x1="380" y1="60" x2="380" y2="96" class="ln" stroke-width="2" marker-end="url(#c02a2)"/>
  <line x1="460" y1="60" x2="620" y2="96" class="ln" stroke-width="2" marker-end="url(#c02a2)"/>
  <rect x="10" y="100" width="240" height="180" rx="12" class="card-bg"/>
  <text x="130" y="124" text-anchor="middle" class="tx-b">🧰 VS 에서 F5 (디버깅)</text>
  <text x="130" y="146" text-anchor="middle" class="tx-m">작업 폴더 = $(ProjectDir)</text>
  <rect x="24" y="158" width="212" height="84" rx="8" class="p1s"/>
  <text x="34" y="180" class="tx-m">MyViewer\\</text>
  <text x="50" y="200" class="tx-m">main.cpp</text>
  <text x="50" y="220" class="tx-m">images\\washers.png ✔</text>
  <text x="130" y="266" text-anchor="middle" class="tx">찾음</text>
  <rect x="260" y="100" width="240" height="180" rx="12" class="card-bg"/>
  <text x="380" y="124" text-anchor="middle" class="tx-b">🖱 exe 더블클릭</text>
  <text x="380" y="146" text-anchor="middle" class="tx-m">작업 폴더 = exe 가 있는 폴더</text>
  <rect x="274" y="158" width="212" height="84" rx="8" class="p5s"/>
  <text x="284" y="180" class="tx-m">MyViewer\\x64\\Debug\\</text>
  <text x="300" y="200" class="tx-m">MyViewer.exe</text>
  <text x="300" y="220" class="tx-m">images\\ 없음 ✘</text>
  <text x="380" y="266" text-anchor="middle" class="tx">빈 Mat (empty)</text>
  <rect x="510" y="100" width="240" height="180" rx="12" class="card-bg"/>
  <text x="630" y="124" text-anchor="middle" class="tx-b">🌐 이 사이트 (브라우저)</text>
  <text x="630" y="146" text-anchor="middle" class="tx-m">작업 폴더 = 📁 작업 폴더</text>
  <rect x="524" y="158" width="212" height="84" rx="8" class="p3s"/>
  <text x="534" y="180" class="tx-m">/ (작업 폴더 루트)</text>
  <text x="550" y="200" class="tx-m">images/washers.png ✔</text>
  <text x="550" y="220" class="tx-m">result.png (imwrite)</text>
  <text x="630" y="266" text-anchor="middle" class="tx">찾음 · 저장 파일도 여기</text>
</svg>`;

  // 그림 3: hconcat — 행 수와 형식이 같아야 붙는다
  const FIG_CONCAT = `<svg viewBox="0 0 760 250" role="img" aria-label="hconcat 은 행 수와 형식이 같은 두 Mat 을 가로로 붙이고, vconcat 은 열 수와 형식이 같은 Mat 을 세로로 붙인다">
  ${ARROW('c02a3')}
  <rect x="20" y="40" width="150" height="112" rx="4" class="p1s"/>
  <text x="95" y="90" text-anchor="middle" class="tx-b">img</text>
  <text x="95" y="112" text-anchor="middle" class="tx-m">480×640 CV_8UC3</text>
  <text x="185" y="100" text-anchor="middle" class="tx-b">+</text>
  <rect x="200" y="40" width="150" height="112" rx="4" class="p4s"/>
  <text x="275" y="90" text-anchor="middle" class="tx-b">gray3</text>
  <text x="275" y="112" text-anchor="middle" class="tx-m">480×640 CV_8UC3</text>
  <line x1="360" y1="96" x2="408" y2="96" class="ln" stroke-width="2" marker-end="url(#c02a3)"/>
  <text x="384" y="84" text-anchor="middle" class="tx">hconcat</text>
  <rect x="414" y="40" width="160" height="112" rx="4" class="p1s"/>
  <rect x="574" y="40" width="160" height="112" rx="4" class="p4s"/>
  <text x="574" y="90" text-anchor="middle" class="tx-b">both: 480 × 1280</text>
  <text x="574" y="112" text-anchor="middle" class="tx-m">CV_8UC3</text>
  <text x="95" y="30" text-anchor="middle" class="tx-m">행 480</text>
  <text x="275" y="30" text-anchor="middle" class="tx-m">행 480 (같아야 함)</text>
  <rect x="20" y="176" width="720" height="60" rx="10" class="card-bg"/>
  <text x="380" y="200" text-anchor="middle" class="tx">⚠️ 형식이 다르면(CV_8UC3 + CV_8UC1) 예외: <tspan class="tx-m">src[i].rows == src[0].rows &amp;&amp; src[i].type() == src[0].type()</tspan></text>
  <text x="380" y="224" text-anchor="middle" class="tx-m">흑백 결과는 cvtColor(gray, gray3, COLOR_GRAY2BGR) 로 3채널로 바꾼 뒤 붙인다 · 세로로 붙이기는 vconcat (열 수가 같아야)</text>
</svg>`;

  // 그림 4: waitKey 이벤트 루프
  const FIG_LOOP = `<svg viewBox="0 0 760 320" role="img" aria-label="waitKey 이벤트 루프: imshow 로 그림을 올리고 waitKey 가 창을 다시 그리며 키를 기다린다. 키 값에 따라 다음, 이전, 저장, 종료를 처리하고 다시 imshow 로 돌아간다">
  ${ARROW('c02a4')}
  <rect x="20" y="120" width="150" height="70" rx="10" class="p2s"/>
  <text x="95" y="150" text-anchor="middle" class="tx-b">imshow(win, img)</text>
  <text x="95" y="172" text-anchor="middle" class="tx-m">그릴 이미지 등록</text>
  <line x1="172" y1="155" x2="226" y2="155" class="ln" stroke-width="2" marker-end="url(#c02a4)"/>
  <rect x="230" y="110" width="170" height="90" rx="10" class="p3s"/>
  <text x="315" y="138" text-anchor="middle" class="tx-b">key = waitKey(delay)</text>
  <text x="315" y="160" text-anchor="middle" class="tx-m">창 다시 그리기 + 이벤트 처리</text>
  <text x="315" y="180" text-anchor="middle" class="tx-m">0 = 무한 대기 · 30 = 30ms</text>
  <line x1="402" y1="130" x2="488" y2="52" class="ln" stroke-width="2" marker-end="url(#c02a4)"/>
  <line x1="402" y1="145" x2="488" y2="122" class="ln" stroke-width="2" marker-end="url(#c02a4)"/>
  <line x1="402" y1="165" x2="488" y2="192" class="ln" stroke-width="2" marker-end="url(#c02a4)"/>
  <line x1="402" y1="180" x2="488" y2="262" class="ln" stroke-width="2" marker-end="url(#c02a4)"/>
  <rect x="492" y="28" width="250" height="46" rx="8" class="card-bg"/>
  <text x="617" y="56" text-anchor="middle" class="tx">-1 : 시간 초과(키 없음) → 계속</text>
  <rect x="492" y="98" width="250" height="46" rx="8" class="p1s"/>
  <text x="617" y="126" text-anchor="middle" class="tx">'n' / 'p' : 번호 ± 1 → 다시 표시</text>
  <rect x="492" y="168" width="250" height="46" rx="8" class="p4s"/>
  <text x="617" y="196" text-anchor="middle" class="tx">'s' : imwrite 로 저장</text>
  <rect x="492" y="238" width="250" height="46" rx="8" class="p5s"/>
  <text x="617" y="266" text-anchor="middle" class="tx-b">27 (ESC) : break → 종료</text>
  <path d="M 490 60 C 440 20, 120 20, 95 116" class="ln" fill="none" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#c02a4)"/>
  <text x="250" y="36" text-anchor="middle" class="tx-m">while (true) 반복</text>
  <text x="200" y="300" text-anchor="middle" class="tx-m">waitKey 를 부르지 않으면 창이 그려지지도, 키가 읽히지도 않는다</text>
</svg>`;

  // ───────────────────────── 1교시 코드 ─────────────────────────
  const EX_READ = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png");     // 플래그 생략 = IMREAD_COLOR (BGR 3채널)
    if (img.empty())                                  // ① 읽었는지 반드시 확인
    {
        cout << "이미지를 읽지 못했습니다" << endl;
        return -1;
    }
    // ② Mat 기본 정보
    cout << "rows(높이)  = " << img.rows << ", cols(너비) = " << img.cols << endl;
    cout << "size()      = " << img.size() << endl;               // [너비 x 높이]
    cout << "channels()  = " << img.channels() << endl;
    cout << "type()      = " << img.type() << " → " << typeToString(img.type()) << endl;
    cout << "total()     = " << img.total() << " 픽셀" << endl;
    cout << "elemSize()  = " << img.elemSize() << " 바이트/픽셀" << endl;
    cout << "데이터 크기 = " << img.total() * img.elemSize() << " 바이트" << endl;

    // ③ 창에 보여 주고 키를 기다린 뒤 창 닫기
    imshow("sample_color", img);
    waitKey(0);
    destroyAllWindows();
    return 0;
}`;

  const EX_FLAGS = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    // sample_gray.png 는 1채널(흑백)로 저장된 파일입니다
    const int flags[] = { IMREAD_COLOR, IMREAD_GRAYSCALE, IMREAD_UNCHANGED,
                          IMREAD_REDUCED_COLOR_2, IMREAD_REDUCED_GRAYSCALE_4 };
    const char* names[] = { "IMREAD_COLOR", "IMREAD_GRAYSCALE", "IMREAD_UNCHANGED",
                            "IMREAD_REDUCED_COLOR_2", "IMREAD_REDUCED_GRAYSCALE_4" };

    for (int i = 0; i < 5; i++)
    {
        Mat m = imread("images/sample_gray.png", flags[i]);
        cout << format("%-27s", names[i]) << m.size() << "  " << typeToString(m.type()) << endl;
    }

    Mat small = imread("images/sample_color.png", IMREAD_REDUCED_COLOR_2);   // 읽으면서 1/2 축소
    imshow("reduced 1/2", small);
    waitKey(0);
    return 0;
}`;

  const EX_PATHS = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
using namespace cv;
using namespace std;

int main()
{
    // 후보 경로를 차례로 시도해 처음 성공한 것을 씁니다
    vector<string> candidates = {
        "sample_color.png",           // 작업 폴더 바로 아래 → 없음
        "images/sample_colour.png",   // 철자 오타 → 없음
        "images/sample_color.png"     // 정답
    };
    Mat img;
    for (const string& path : candidates)
    {
        img = imread(path);
        cout << path << " → " << (img.empty() ? "실패 (빈 Mat)" : "성공") << endl;
        if (!img.empty()) break;
    }
    if (img.empty()) { cout << "어느 경로에서도 찾지 못했습니다" << endl; return -1; }

    imshow("found", img);
    waitKey(0);
    return 0;
}`;

  const EX_EXC = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/no_such_file.png");   // 없는 파일 → 예외가 아니라 빈 Mat!
    cout << boolalpha << "empty() = " << img.empty() << endl;

    try
    {
        Mat gray;
        cvtColor(img, gray, COLOR_BGR2GRAY);          // 빈 Mat 을 넣으면 여기서 예외
        cout << "이 줄은 실행되지 않습니다" << endl;
    }
    catch (const cv::Exception& e)
    {
        cout << "cv::Exception 을 잡았습니다" << endl;
        cout << "  code = " << e.code << endl;        // -215 = 조건 검사(Assertion) 실패
        cout << "  func = " << e.func << endl;        // 예외가 난 OpenCV 함수
        cout << "  what = " << e.what();              // 전체 메시지 (끝에 줄바꿈 포함)
    }
    cout << "프로그램은 멈추지 않고 계속됩니다" << endl;
    return 0;
}`;

  const EX_VS_DIR = `// 🧰 Visual Studio: 지금 작업 폴더가 어디인지 출력해 보기 (C++17)
#include <opencv2/opencv.hpp>
#include <filesystem>
#include <iostream>
using namespace cv;
using namespace std;
namespace fs = std::filesystem;

int main()
{
    cout << "작업 폴더: " << fs::current_path() << endl;
    string path = "images/washers.png";
    cout << "찾는 파일: " << fs::absolute(path) << endl;
    cout << "존재 여부: " << boolalpha << fs::exists(path) << endl;

    Mat img = imread(path, IMREAD_GRAYSCALE);
    if (img.empty()) { cerr << "읽기 실패: " << path << endl; return -1; }
    imshow("washers", img);
    waitKey(0);
    return 0;
}`;

  const P1_INFO_START = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
using namespace cv;
using namespace std;

// TODO: 이미지 정보를 한 줄로 출력하는 함수
// 출력 형식: 파일이름: 너비 x 높이, 채널 수, 형식 이름
void printInfo(const string& path, const Mat& m)
{
}

int main()
{
    vector<string> files = { "images/sample_color.png", "images/washers.png",
                              "images/plate_holes.png", "images/seven_segment.png" };
    for (const string& f : files)
    {
        Mat img = imread(f, IMREAD_UNCHANGED);
        printInfo(f, img);
    }
    return 0;
}`;

  const P1_INFO_SOL = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
using namespace cv;
using namespace std;

void printInfo(const string& path, const Mat& m)
{
    if (m.empty()) { cout << path << ": 읽기 실패" << endl; return; }
    cout << path << ": " << m.cols << " x " << m.rows << ", " << m.channels() << "채널, "
         << typeToString(m.type()) << endl;
}

int main()
{
    vector<string> files = { "images/sample_color.png", "images/washers.png",
                              "images/plate_holes.png", "images/seven_segment.png" };
    for (const string& f : files)
    {
        Mat img = imread(f, IMREAD_UNCHANGED);
        printInfo(f, img);
    }
    return 0;
}`;

  const P1_LOAD_START = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <stdexcept>
using namespace cv;
using namespace std;

// TODO: 읽기에 실패하면 runtime_error 예외를 던지는 함수를 완성하세요
//       메시지 예: "파일을 열 수 없습니다: images/washer.png"
Mat loadImage(const string& path, int flags = IMREAD_COLOR)
{
    Mat img = imread(path, flags);
    return img;
}

int main()
{
    string files[] = { "images/washer.png", "images/washers.png" };
    for (const string& f : files)
    {
        // TODO: try/catch 로 감싸 실패해도 다음 파일로 넘어가게 하세요
        Mat img = loadImage(f, IMREAD_GRAYSCALE);
        cout << f << " → " << img.cols << " x " << img.rows << endl;
    }
    return 0;
}`;

  const P1_LOAD_SOL = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <stdexcept>
using namespace cv;
using namespace std;

Mat loadImage(const string& path, int flags = IMREAD_COLOR)
{
    Mat img = imread(path, flags);
    if (img.empty())
        throw runtime_error("파일을 열 수 없습니다: " + path);
    return img;
}

int main()
{
    string files[] = { "images/washer.png", "images/washers.png" };
    for (const string& f : files)
    {
        try
        {
            Mat img = loadImage(f, IMREAD_GRAYSCALE);
            cout << f << " → " << img.cols << " x " << img.rows << endl;
        }
        catch (const exception& e)      // cv::Exception 도 std::exception 을 상속하므로 함께 잡힘
        {
            cout << "[오류] " << e.what() << endl;
        }
    }
    return 0;
}`;

  // ───────────────────────── 2교시 코드 ─────────────────────────
  const EX_SAVE = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png");
    Mat gray;
    cvtColor(img, gray, COLOR_BGR2GRAY);                  // 3채널 → 1채널

    bool ok = imwrite("gray.png", gray);                  // 확장자(.png)로 형식 결정
    cout << "gray.png 저장: " << (ok ? "성공" : "실패") << endl;

    vector<int> params = { IMWRITE_JPEG_QUALITY, 90 };    // (옵션 이름, 값) 쌍
    imwrite("gray_q90.jpg", gray, params);

    // 저장한 파일을 다시 읽어 원본과 비교
    Mat back = imread("gray.png", IMREAD_UNCHANGED);
    cout << "다시 읽기: " << back.size() << " " << typeToString(back.type()) << endl;
    cout << "원본과 다른 픽셀 수: " << countNonZero(back != gray) << endl;   // PNG = 무손실 → 0

    imshow("gray (다시 읽음)", back);
    waitKey(0);
    return 0;
}`;

  const EX_SIDE = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/nuts_bolts_color.png");
    Mat gray, gray3;
    cvtColor(img, gray, COLOR_BGR2GRAY);           // 결과: 1채널
    cvtColor(gray, gray3, COLOR_GRAY2BGR);         // 붙이기 위해 다시 3채널로 (값은 흑백 그대로)

    Mat both, half;
    hconcat(img, gray3, both);                     // 가로로 나란히: 행 수 · 형식이 같아야 한다
    resize(both, half, Size(), 0.5, 0.5, INTER_AREA);
    putText(half, "original", Point(10, 25), FONT_HERSHEY_SIMPLEX, 0.7, Scalar(0, 255, 255), 2);
    putText(half, "gray", Point(330, 25), FONT_HERSHEY_SIMPLEX, 0.7, Scalar(0, 255, 255), 2);
    cout << "both: " << both.size() << ", half: " << half.size() << endl;
    imwrite("compare.png", half);

    try
    {
        Mat bad;
        hconcat(img, gray, bad);                   // 3채널 + 1채널 → 예외
    }
    catch (const cv::Exception& e)
    {
        cout << "hconcat 실패: code " << e.code << " in " << e.func << endl;
    }
    imshow("compare", half);
    waitKey(0);
    return 0;
}`;

  const EX_LOOP = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    double scales[] = { 1.0, 0.5, 0.25 };

    // ① 크기를 바꿔 가며 result_00.png, result_01.png ... 로 저장
    for (int i = 0; i < 3; i++)
    {
        Mat dst;
        resize(img, dst, Size(), scales[i], scales[i], INTER_AREA);
        string name = format("result_%02d.png", i);          // 두 자리 번호: 00, 01, 02
        bool ok = imwrite(name, dst);
        cout << name << " 저장 " << (ok ? "OK" : "실패") << ": " << dst.cols << " x " << dst.rows << endl;
    }

    // ② 저장한 파일을 다시 읽어 확인
    for (int i = 0; i < 3; i++)
    {
        string name = format("result_%02d.png", i);
        Mat m = imread(name, IMREAD_UNCHANGED);
        cout << "읽기 " << name << ": " << m.size() << ", " << m.channels() << "채널" << endl;
        imshow(name, m);                                     // 창 이름이 다르면 창이 여러 개
    }
    waitKey(0);
    return 0;
}`;

  const EX_VS_SAVE = `// 🧰 Visual Studio: 저장 폴더 만들기 + JPEG 품질에 따른 파일 크기 비교 (C++17)
#include <opencv2/opencv.hpp>
#include <filesystem>
#include <iostream>
using namespace cv;
using namespace std;
namespace fs = std::filesystem;

int main()
{
    Mat img = imread("images/sample_color.png");
    if (img.empty()) return -1;

    fs::create_directories("out");                 // 폴더가 없으면 imwrite 가 실패한다
    for (int q : { 95, 75, 50, 20 })
    {
        string name = format("out/q%02d.jpg", q);
        imwrite(name, img, { IMWRITE_JPEG_QUALITY, q });
        cout << name << " : " << fs::file_size(name) / 1024 << " KB" << endl;
    }
    imwrite("out/lossless.png", img, { IMWRITE_PNG_COMPRESSION, 9 });   // 0~9, 크면 느리지만 작다
    cout << "out/lossless.png : " << fs::file_size("out/lossless.png") / 1024 << " KB" << endl;
    return 0;
}`;

  const P2_THUMB_START = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
using namespace cv;
using namespace std;

int main()
{
    vector<string> files = { "images/sample_color.png", "images/color_caps.png", "images/pcb_golden.png" };
    for (int i = 0; i < (int)files.size(); i++)
    {
        Mat img = imread(files[i]);
        // TODO: 너비가 160 이 되도록 비율을 유지해 축소 (scale = 160.0 / img.cols)
        Mat thumb;

        // TODO: thumb_00.png, thumb_01.png ... 로 저장하고 "이름: 너비 x 높이" 출력

    }
    return 0;
}`;

  const P2_THUMB_SOL = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
using namespace cv;
using namespace std;

int main()
{
    vector<string> files = { "images/sample_color.png", "images/color_caps.png", "images/pcb_golden.png" };
    for (int i = 0; i < (int)files.size(); i++)
    {
        Mat img = imread(files[i]);
        double scale = 160.0 / img.cols;
        Mat thumb;
        resize(img, thumb, Size(), scale, scale, INTER_AREA);

        string name = format("thumb_%02d.png", i);
        imwrite(name, thumb);
        cout << name << ": " << thumb.cols << " x " << thumb.rows << endl;
        imshow(name, thumb);
    }
    waitKey(0);
    return 0;
}`;

  const P2_STRIP_START = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    Mat binary;
    threshold(gray, binary, 0, 255, THRESH_BINARY | THRESH_OTSU);

    // TODO: 원본 · 이진화 결과를 가로로 붙여(hconcat) 절반 크기로 줄이고
    //       "strip.png" 로 저장한 뒤 크기를 출력하세요
    //       (둘 다 1채널 CV_8UC1 이므로 그대로 붙일 수 있습니다)
    Mat strip;

    return 0;
}`;

  const P2_STRIP_SOL = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    Mat binary;
    threshold(gray, binary, 0, 255, THRESH_BINARY | THRESH_OTSU);

    Mat both, strip;
    hconcat(gray, binary, both);
    resize(both, strip, Size(), 0.5, 0.5, INTER_AREA);
    bool ok = imwrite("strip.png", strip);
    cout << "strip.png " << (ok ? "저장" : "실패") << ": " << strip.cols << " x " << strip.rows
         << ", " << typeToString(strip.type()) << endl;
    imshow("strip", strip);
    waitKey(0);
    return 0;
}`;

  // ───────────────────────── 3교시 코드 ─────────────────────────
  const EX_SLIDE = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
using namespace cv;
using namespace std;

int main()
{
    vector<string> files = { "images/sample_color.png", "images/washers.png",
                             "images/coins_parts.png", "images/color_caps.png" };
    namedWindow("viewer", WINDOW_AUTOSIZE);          // 한 창을 계속 재사용

    for (size_t i = 0; i < files.size(); i++)
    {
        Mat img = imread(files[i]);                   // 흑백 파일도 3채널로 → 글자를 색으로
        if (img.empty()) { cout << "읽기 실패: " << files[i] << endl; continue; }

        string caption = format("[%d/%d] ", (int)i + 1, (int)files.size()) + files[i];
        putText(img, caption, Point(10, 30), FONT_HERSHEY_SIMPLEX, 0.8, Scalar(0, 255, 255), 2);
        imshow("viewer", img);
        cout << caption << "  (" << img.cols << " x " << img.rows << ")" << endl;

        int key = waitKey(400);                       // 0.4초 보여 주기 (그 사이 키를 누르면 key)
        if (key == 27) { cout << "ESC → 중단" << endl; break; }
    }
    destroyAllWindows();
    return 0;
}`;

  const EX_KEYSIM = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
using namespace cv;
using namespace std;

// 키 하나를 처리해 현재 번호를 바꾼다 — 키가 waitKey · 문자열 · cin 어디서 오든 같은 규칙
bool handleKey(int key, int& index, int count)
{
    switch (key)
    {
    case 'n': case ' ': index = (index + 1) % count; break;           // 다음 (끝이면 처음으로)
    case 'p':           index = (index - 1 + count) % count; break;   // 이전
    case 'g':           index = 0; break;                              // 처음으로
    case 'q': case 27:  return false;                                  // 종료
    default: break;                                                    // 모르는 키는 무시
    }
    return true;
}

int main()
{
    vector<string> files = { "images/sample_color.png", "images/washers.png",
                             "images/coins_parts.png", "images/color_caps.png" };
    string keys = "nnnnpxgq";          // 사용자가 누른 키라고 가정 (x 는 모르는 키)
    int index = 0;
    for (char c : keys)
    {
        if (!handleKey(c, index, (int)files.size())) { cout << "'" << c << "' → 종료" << endl; break; }
        cout << "'" << c << "' → " << index << ": " << files[index] << endl;
    }
    imshow("viewer", imread(files[index]));
    waitKey(0);
    return 0;
}`;

  const EX_VIEWER_LOCAL = `// 🖥 Visual Studio: 키보드로 넘기는 이미지 뷰어 (n/→ 다음, p/← 이전, s 저장, ESC 종료)
#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
using namespace cv;
using namespace std;

int main()
{
    vector<string> files = { "images/sample_color.png", "images/washers.png",
                             "images/coins_parts.png", "images/color_caps.png" };
    int index = 0, saved = 0;
    namedWindow("viewer", WINDOW_NORMAL);             // 마우스로 창 크기 조절 가능
    resizeWindow("viewer", 800, 600);

    while (true)
    {
        Mat img = imread(files[index]);
        if (img.empty()) { cerr << "읽기 실패: " << files[index] << endl; break; }
        setWindowTitle("viewer", format("[%d/%d] ", index + 1, (int)files.size()) + files[index]);
        imshow("viewer", img);

        int key = waitKeyEx(0);                        // 화살표 키까지 받으려면 waitKeyEx
        if (key == 27) break;                                              // ESC
        else if (key == 'n' || key == 0x270000) index = (index + 1) % (int)files.size();       // → (Windows)
        else if (key == 'p' || key == 0x250000) index = (index - 1 + (int)files.size()) % (int)files.size(); // ←
        else if (key == 's')
        {
            string name = format("capture_%02d.png", saved++);
            imwrite(name, img);
            cout << name << " 저장" << endl;
        }
    }
    destroyAllWindows();
    return 0;
}`;

  const EX_CIN = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
using namespace cv;
using namespace std;

int main()
{
    vector<string> files = { "images/sample_color.png", "images/washers.png",
                             "images/coins_parts.png", "images/plate_holes.png" };
    for (size_t i = 0; i < files.size(); i++)
        cout << i << ": " << files[i] << endl;

    int idx;
    while (true)
    {
        cout << "번호 (-1 = 끝): ";
        if (!(cin >> idx) || idx < 0) break;          // 입력이 끝나거나 음수면 종료
        cout << endl;
        if (idx >= (int)files.size()) { cout << "  범위 밖입니다" << endl; continue; }

        Mat img = imread(files[idx], IMREAD_UNCHANGED);
        cout << "  " << files[idx] << " → " << img.cols << " x " << img.rows
             << ", " << img.channels() << "채널" << endl;
        imshow("viewer", img);
        waitKey(1);                                    // 1ms: 창을 그리기만 하고 넘어감
    }
    cout << endl << "뷰어 종료" << endl;
    return 0;
}`;

  const EX_MOUSE_LOCAL = `// 🖥 Visual Studio: 클릭한 위치의 픽셀 값 출력 (마우스 콜백)
#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

// 콜백 함수 모양은 정해져 있다: (이벤트, x, y, 플래그, 사용자 데이터)
void onMouse(int event, int x, int y, int flags, void* userdata)
{
    if (event != EVENT_LBUTTONDOWN) return;             // 왼쪽 버튼 누를 때만
    Mat& img = *static_cast<Mat*>(userdata);            // 넘겨준 Mat 을 다시 꺼냄 (전역 변수 없이)
    if (x < 0 || y < 0 || x >= img.cols || y >= img.rows) return;
    Vec3b px = img.at<Vec3b>(y, x);                     // (행 y, 열 x)!
    cout << format("(%d, %d) B=%d G=%d R=%d", x, y, px[0], px[1], px[2]) << endl;
    if (flags & EVENT_FLAG_CTRLKEY) cout << "  (Ctrl 을 누른 채 클릭)" << endl;
}

int main()
{
    Mat img = imread("images/color_chart.png");
    if (img.empty()) return -1;
    namedWindow("chart");
    setMouseCallback("chart", onMouse, &img);           // 창이 먼저 있어야 한다
    imshow("chart", img);
    while (waitKey(0) != 27) {}                         // ESC 까지 이벤트 처리
    return 0;
}`;

  const EX_PIXELS = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/color_chart.png");
    // "클릭했다고 가정한" 좌표들: 패치 1, 7, 19, 24 의 중심 (x, y)
    Point clicks[] = { Point(60, 72), Point(60, 144), Point(60, 288), Point(420, 288) };

    for (const Point& p : clicks)
    {
        Vec3b px = img.at<Vec3b>(p.y, p.x);               // at 은 (행 y, 열 x)
        cout << format("(%d, %d) B=%d G=%d R=%d", p.x, p.y, px[0], px[1], px[2]) << endl;
        drawMarker(img, p, Scalar(255, 255, 255), MARKER_CROSS, 16, 2);
    }
    imshow("chart", img);     // 결과 창에서 마우스를 올려 같은 값인지 확인해 보세요
    waitKey(0);
    return 0;
}`;

  const EX_TRACK_LOCAL = `// 🖥 Visual Studio: 트랙바로 임계값을 바꾸며 이진화 결과 보기
#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

struct AppData { Mat gray, binary; };

void onThresh(int pos, void* userdata)                   // 트랙바가 움직일 때마다 호출
{
    AppData& d = *static_cast<AppData*>(userdata);
    threshold(d.gray, d.binary, pos, 255, THRESH_BINARY);
    imshow("binary", d.binary);
}

int main()
{
    AppData d;
    d.gray = imread("images/washers.png", IMREAD_GRAYSCALE);
    if (d.gray.empty()) return -1;

    int value = 128;                                      // 트랙바와 연결된 변수
    namedWindow("binary");
    createTrackbar("thresh", "binary", &value, 255, onThresh, &d);
    onThresh(value, &d);                                  // 처음 한 번 직접 그림

    while (true)
    {
        int key = waitKey(0);
        if (key == 27) break;
        if (key == 's') { imwrite("binary.png", d.binary); cout << "저장 (임계값 " << value << ")" << endl; }
    }
    return 0;
}`;

  const EX_TRACK_WEB = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/washers.png", IMREAD_GRAYSCALE);
    int values[] = { 60, 120, 180, 230 };                 // 트랙바를 이 값들로 옮겼다고 가정

    for (int v : values)
    {
        Mat binary;
        threshold(gray, binary, v, 255, THRESH_BINARY);
        double white = 100.0 * countNonZero(binary) / binary.total();
        cout << format("임계값 %3d → 흰 픽셀 %5.1f %%", v, white) << endl;
        imshow("binary", binary);                         // 같은 창을 계속 갱신
        waitKey(300);
    }
    return 0;
}`;

  const P3_KEYS_START = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
using namespace cv;
using namespace std;

bool handleKey(int key, int& index, int count)
{
    switch (key)
    {
    case 'n': index = (index + 1) % count; break;
    case 'p': index = (index - 1 + count) % count; break;
    // TODO ① 'e' → 마지막 이미지로
    // TODO ② '1' ~ '9' → 그 번호의 이미지로 (1 = 첫 번째, 범위 밖이면 무시)
    case 'q': return false;
    default: break;
    }
    return true;
}

int main()
{
    vector<string> files = { "images/sample_color.png", "images/washers.png",
                             "images/coins_parts.png", "images/color_caps.png" };
    string keys = "e3n9p1q";
    int index = 0;
    for (char c : keys)
    {
        if (!handleKey(c, index, (int)files.size())) { cout << "'" << c << "' → 종료" << endl; break; }
        cout << "'" << c << "' → " << index << ": " << files[index] << endl;
    }
    return 0;
}`;

  const P3_KEYS_SOL = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
using namespace cv;
using namespace std;

bool handleKey(int key, int& index, int count)
{
    if (key >= '1' && key <= '9')                   // 숫자 키: switch 앞에서 범위로 처리
    {
        int n = key - '1';                          // '1' → 0
        if (n < count) index = n;
        return true;
    }
    switch (key)
    {
    case 'n': index = (index + 1) % count; break;
    case 'p': index = (index - 1 + count) % count; break;
    case 'e': index = count - 1; break;
    case 'q': return false;
    default: break;
    }
    return true;
}

int main()
{
    vector<string> files = { "images/sample_color.png", "images/washers.png",
                             "images/coins_parts.png", "images/color_caps.png" };
    string keys = "e3n9p1q";
    int index = 0;
    for (char c : keys)
    {
        if (!handleKey(c, index, (int)files.size())) { cout << "'" << c << "' → 종료" << endl; break; }
        cout << "'" << c << "' → " << index << ": " << files[index] << endl;
    }
    imshow("viewer", imread(files[index]));
    waitKey(0);
    return 0;
}`;

  const P3_CIN_START = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    int t;
    // TODO: 임계값을 반복해서 입력받아(음수면 종료)
    //       threshold → 흰 픽셀 비율(%) 출력 → imshow("binary", ...) → waitKey(1)
    //       0~255 밖의 값이면 "0~255 사이로 입력하세요" 출력
    cout << "임계값 (음수 = 끝): ";

    return 0;
}`;

  const P3_CIN_SOL = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    int t;
    while (true)
    {
        cout << "임계값 (음수 = 끝): ";
        if (!(cin >> t) || t < 0) break;
        cout << endl;
        if (t > 255) { cout << "  0~255 사이로 입력하세요" << endl; continue; }

        Mat binary;
        threshold(gray, binary, t, 255, THRESH_BINARY);
        cout << format("  임계값 %d → 흰 픽셀 %.1f %%", t, 100.0 * countNonZero(binary) / binary.total()) << endl;
        imshow("binary", binary);
        waitKey(1);
    }
    cout << endl << "끝" << endl;
    return 0;
}`;

  // ───────────────────────── 퀴즈 ─────────────────────────
  const QUIZ1 = [
    { q: '<code>imread("images/washer.png")</code> 처럼 <b>없는 파일</b>을 읽으면 어떻게 되는가?', options: ['컴파일 오류가 난다', '<code>cv::Exception</code> 예외가 던져진다', '경고 한 줄이 출력되고 <b>빈 Mat</b> 이 돌아온다', '검은 640×480 이미지가 돌아온다'], answer: 2,
      explain: '<code>imread</code> 는 실패해도 예외를 던지지 않고 <b>빈 Mat</b>(<code>empty() == true</code>)을 돌려줍니다 (stderr 에 <code>[ WARN ] ... can\'t open/read file</code> 경고). 그래서 <b>읽은 직후 <code>empty()</code> 검사</b>가 필수입니다. 검사 없이 <code>cvtColor</code> 등에 넘기면 그때 예외가 납니다.' },
    { q: '<code>imread("images/sample_gray.png", IMREAD_COLOR)</code> 로 1채널 흑백 파일을 읽으면 결과 형식은?', options: ['<code>CV_8UC1</code>', '<code>CV_8UC3</code>', '<code>CV_8UC4</code>', '빈 Mat'], answer: 1,
      explain: '<code>IMREAD_COLOR</code>(기본값)는 파일이 흑백이어도 <b>항상 BGR 3채널</b>로 만듭니다 (B = G = R). 파일에 저장된 그대로 받으려면 <code>IMREAD_UNCHANGED</code>, 항상 1채널로 받으려면 <code>IMREAD_GRAYSCALE</code>.' },
    { q: '640×480 컬러(<code>CV_8UC3</code>) 이미지의 <code>total()</code> 과 <code>elemSize()</code> 는?', options: ['307200, 3', '921600, 1', '640, 480', '307200, 1'], answer: 0,
      explain: '<code>total()</code> = 픽셀 수 = 640 × 480 = 307200, <code>elemSize()</code> = 픽셀 하나의 바이트 수 = 1바이트 × 3채널 = 3. 데이터 크기는 둘을 곱한 921600 바이트입니다.' },
    { q: '예외 메시지 <code>error: (-215:Assertion failed) !_src.empty() in function \'cvtColor\'</code> 가 알려 주는 원인은?', options: ['색 변환 코드가 잘못되었다', '<code>cvtColor</code> 에 <b>빈 Mat</b> 이 입력으로 들어왔다', '메모리가 부족하다', '출력 Mat 을 미리 만들지 않았다'], answer: 1,
      explain: '<code>-215</code> 는 조건 검사(Assertion) 실패, 괄호 뒤의 <code>!_src.empty()</code> 가 <b>통과하지 못한 조건</b>, <code>in function</code> 뒤가 예외가 난 함수입니다. “입력(src)이 비어 있지 않아야 하는데 비어 있었다” → 대부분 앞의 <code>imread</code> 경로 문제입니다.' },
    { q: 'Visual Studio 에서 F5 로는 이미지가 잘 읽히는데, <code>x64\\Debug</code> 의 exe 를 더블클릭하면 빈 Mat 이 된다. 가장 가능성 높은 원인은?', options: ['Release 빌드가 아니라서', '작업 폴더(현재 디렉터리)가 달라져 상대 경로가 다른 곳을 가리켜서', 'OpenCV DLL 이 없어서', '이미지가 손상되어서'], answer: 1,
      explain: 'F5 실행의 작업 폴더는 기본값이 <code>$(ProjectDir)</code>(프로젝트 폴더), 더블클릭은 <b>exe 가 있는 폴더</b>입니다. 상대 경로 <code>images/…</code> 는 작업 폴더 기준이므로 exe 옆에 <code>images</code> 폴더를 복사하거나 경로를 설정으로 받아야 합니다. (DLL 이 없으면 아예 실행이 안 됩니다.)' }
  ];

  const QUIZ2 = [
    { q: '<code>imwrite("result.jpg", img)</code> 에서 저장 형식(JPEG)을 정하는 것은?', options: ['<code>img</code> 의 채널 수', '파일 이름의 <b>확장자</b>', '세 번째 인수 params', '운영 체제 설정'], answer: 1,
      explain: '<code>imwrite</code> 는 <b>확장자</b>(.png · .jpg · .bmp · .tif …)로 인코더를 고릅니다. params 는 그 형식의 세부 옵션(JPEG 품질 등)입니다.' },
    { q: 'JPEG 품질을 80 으로 저장하는 올바른 코드는?', options: ['<code>imwrite("a.jpg", img, 80);</code>', '<code>imwrite("a.jpg", img, {IMWRITE_JPEG_QUALITY, 80});</code>', '<code>imwrite("a.jpg", img, {80, IMWRITE_JPEG_QUALITY});</code>', '<code>imwrite("a.jpg:80", img);</code>'], answer: 1,
      explain: 'params 는 <code>vector&lt;int&gt;</code> 이고 <b>(옵션 이름, 값)</b> 쌍을 순서대로 넣습니다. 여러 옵션이면 <code>{이름1, 값1, 이름2, 값2}</code>.' },
    { q: '컬러 <code>img</code>(CV_8UC3)와 흑백 <code>gray</code>(CV_8UC1)를 <code>hconcat(img, gray, out)</code> 하면?', options: ['자동으로 3채널로 맞춰 붙는다', '흑백 부분만 저장된다', '형식이 달라 <code>cv::Exception</code>(-215) 이 난다', '컴파일 오류가 난다'], answer: 2,
      explain: '<code>hconcat</code> 은 모든 입력의 <b>행 수와 형식(type)</b>이 같아야 합니다. <code>cvtColor(gray, gray3, COLOR_GRAY2BGR)</code> 로 3채널로 바꾼 뒤 붙이세요. 컴파일은 되고 <b>실행 중</b>에 예외가 납니다.' },
    { q: '<code>format("result_%02d.png", 7)</code> 의 결과는?', options: ['<code>result_7.png</code>', '<code>result_07.png</code>', '<code>result_%02d.png</code>', '<code>result_007.png</code>'], answer: 1,
      explain: '<code>%02d</code> = 정수를 <b>2자리, 빈 곳은 0</b>으로 채움. 번호를 맞춰 두면 파일 탐색기에서 이름순 정렬이 번호순과 같아집니다 (<code>10</code> 이 <code>2</code> 앞에 오는 문제 방지).' }
  ];

  const QUIZ3 = [
    { q: '로컬 PC 에서 <code>imshow("w", img);</code> 만 쓰고 <code>waitKey</code> 를 부르지 않으면?', options: ['창이 계속 떠 있다', '창이 그려지지 않거나 곧바로 사라진다', '컴파일 오류가 난다', '이미지가 파일로 저장된다'], answer: 1,
      explain: 'HighGUI 는 <code>waitKey</code> 안에서 창 다시 그리기 · 이벤트 처리를 합니다. <code>waitKey</code> 없이 프로그램이 끝나면 창이 그려지지 않거나 순간 떴다가 사라집니다.' },
    { q: '<code>int key = waitKey(30);</code> 에서 30ms 동안 아무 키도 누르지 않았다면 <code>key</code> 는?', options: ['0', '27', '-1', '30'], answer: 2,
      explain: '시간 안에 키가 없으면 <b>-1</b>. 키를 누르면 그 키의 코드(<code>\'a\'</code> = 97, ESC = 27, Enter = 13)가 돌아옵니다. <code>waitKey(0)</code> 은 키를 누를 때까지 무한히 기다립니다.' },
    { q: '마우스 콜백 <code>onMouse(int event, int x, int y, int flags, void* userdata)</code> 안에서 클릭한 픽셀을 읽는 올바른 코드는? (<code>img</code> 는 CV_8UC3)', options: ['<code>img.at&lt;Vec3b&gt;(x, y)</code>', '<code>img.at&lt;Vec3b&gt;(y, x)</code>', '<code>img.at&lt;uchar&gt;(x, y)</code>', '<code>img(x, y)</code>'], answer: 1,
      explain: '콜백은 <b>(x, y)</b> 로 주지만 <code>at</code> 은 <b>(행 y, 열 x)</b> 입니다. 순서를 바꾸지 않으면 엉뚱한 픽셀을 읽거나, 가로가 긴 이미지에서는 범위를 벗어납니다.' },
    { q: '이 강좌의 브라우저 환경에서 <b>실행할 수 없어</b> 🖥 Visual Studio 전용으로 표시되는 것은?', options: ['<code>waitKey(400)</code> 으로 차례로 보여 주기', '<code>cin</code> 으로 번호를 입력받아 보여 주기', '<code>createTrackbar</code> 로 임계값 조절', '<code>imwrite</code> 로 결과 저장'], answer: 2,
      explain: '<code>setMouseCallback</code> · <code>createTrackbar</code> 는 브라우저에서 동작하지 않습니다. 대신 <b>값 목록을 반복</b>하거나 <b>cin 입력</b>으로 같은 처리를 해 보고, 완성 프로그램은 Visual Studio 에서 실행합니다.' }
  ];

  CV_COURSE.addChapter({
    id: 'cv02', no: '02', title: '첫 OpenCV 프로그램: 읽기 · 보기 · 저장 · 창과 키', subtitle: 'imread · Mat 정보 · imshow/waitKey · imwrite · 예외 처리 · 키보드 이미지 뷰어',
    summary: 'OpenCV 프로그램의 기본 뼈대인 <b>읽기(imread) → 확인(empty · Mat 정보) → 보기(imshow · waitKey) → 저장(imwrite)</b> 을 익히고, 상대 경로와 작업 폴더, <b>cv::Exception</b> 예외 처리, <b>waitKey 키 루프</b>로 동작하는 간단한 이미지 뷰어를 만듭니다. 마우스 콜백 · 트랙바는 Visual Studio 용 코드와 브라우저 대체 코드를 함께 봅니다.',
    goals: ['imread 플래그와 empty() 검사, Mat 기본 정보(rows · cols · channels · type · total · elemSize)를 설명할 수 있다', 'imwrite 로 결과 이미지를 저장하고, hconcat · resize 로 비교 이미지를 만들 수 있다', 'waitKey 반환값으로 키를 처리하는 뷰어를 만들고, 마우스 콜백 · 트랙바의 구조를 안다'],
    sections: [
      // ═══════════════════════════ 1교시 ═══════════════════════════
      {
        id: 'cv02-1', title: '이미지 읽기와 Mat 정보 · 경로 · 예외 처리', minutes: 50,
        goals: ['imread 의 플래그를 골라 쓰고 empty() 로 실패를 검사할 수 있다', 'Mat 의 rows · cols · channels() · type() · total() · elemSize() 를 출력하고 해석할 수 있다', '상대 경로와 작업 폴더의 관계, cv::Exception 메시지 읽는 법을 안다'],
        flow: [['도입: 3단계 뼈대', 5], ['imread · Mat 정보', 15], ['경로와 작업 폴더', 10], ['예외 처리', 10], ['실습 · 퀴즈', 10]],
        content: [
          { type: 'h', text: 'OpenCV 프로그램의 기본 뼈대: 읽기 → 확인 → 보기' },
          { type: 'p', html: '앞으로 만들 모든 비전 프로그램은 같은 뼈대로 시작합니다. ① <code>imread</code> 로 이미지 파일을 읽어 <code>Mat</code> 을 만들고 ② 제대로 읽었는지 <code>empty()</code> 로 확인한 뒤 ③ 처리하고 ④ <code>imshow</code> 로 보여 주거나 <code>imwrite</code> 로 저장합니다. 파일(PNG · JPG)은 <b>압축된 바이트</b>이고, <code>Mat</code> 은 압축을 푼 <b>픽셀 배열</b>입니다. 처리는 언제나 Mat 에서 합니다.' },
          { type: 'figure', html: FIG_PIPE, caption: '그림 1. 파일 → imread(디코딩) → Mat(헤더 + 픽셀 데이터) → imshow(창) / imwrite(인코딩) → 파일' },
          { type: 'code', title: '예제 1: 이미지 읽기와 Mat 기본 정보', code: EX_READ,
            desc: '<code>size()</code> 는 <code>Size(너비, 높이)</code> 라서 <code>[640 x 480]</code> 처럼 <b>너비가 먼저</b>, <code>rows</code> 는 높이입니다. <code>type()</code> 의 숫자(64)는 외울 필요가 없습니다 — OpenCV 5 에서는 새 자료형이 늘어나 번호 체계가 바뀌었고(4.x 에서 <code>CV_8UC3</code> 는 16), <code>typeToString()</code> 으로 이름을 보면 됩니다. <code>CV_8UC3</code> = <b>8</b>비트 <b>U</b>nsigned(0~255) <b>C</b>hannel <b>3</b>개.',
            expect: 'rows(높이)  = 480, cols(너비) = 640\nsize()      = [640 x 480]\nchannels()  = 3\ntype()      = 64 → CV_8UC3\ntotal()     = 307200 픽셀\nelemSize()  = 3 바이트/픽셀\n데이터 크기 = 921600 바이트' },
          { type: 'table', head: ['속성 · 함수', '뜻', '640×480 컬러의 값'], rows: [
            ['<code>rows</code> / <code>cols</code>', '행 수(높이) / 열 수(너비) — 괄호 없는 멤버 변수', '480 / 640'],
            ['<code>size()</code>', '<code>Size(width, height)</code> — 너비가 먼저', '[640 x 480]'],
            ['<code>channels()</code>', '채널 수 (흑백 1, BGR 3, BGRA 4)', '3'],
            ['<code>type()</code> · <code>depth()</code>', '형식 번호 · 채널 하나의 자료형 (<code>typeToString</code> 으로 이름)', 'CV_8UC3 · CV_8U'],
            ['<code>total()</code>', '픽셀 수 = rows × cols', '307200'],
            ['<code>elemSize()</code>', '픽셀 하나의 바이트 수 = 채널 바이트 × 채널 수', '3'],
            ['<code>empty()</code>', '데이터가 없는가 (읽기 실패 검사)', 'false']
          ], caption: '표 1. Mat 의 기본 정보 — Python 의 img.shape (h, w, ch) 는 C++ 에서 rows · cols · channels() 세 개로 나뉜다' },
          { type: 'h', text: 'imread 플래그: 어떤 형식으로 읽을까?' },
          { type: 'table', head: ['플래그', '결과', '언제 쓰나'], rows: [
            ['<code>IMREAD_COLOR</code> (기본값, = <code>IMREAD_COLOR_BGR</code>)', '항상 <b>BGR 3채널</b> (흑백 파일도 3채널로)', '컬러 처리 · 결과에 색 글자 · 도형을 그릴 때'],
            ['<code>IMREAD_GRAYSCALE</code>', '항상 <b>1채널</b> (컬러 파일은 밝기로 변환)', '이진화 · 에지 · 측정 등 대부분의 검사'],
            ['<code>IMREAD_UNCHANGED</code>', '파일에 저장된 그대로 (알파 채널 · 16비트 유지)', '투명 PNG, 16비트 깊이 영상'],
            ['<code>IMREAD_REDUCED_COLOR_2/4/8</code>', '읽으면서 1/2 · 1/4 · 1/8 로 축소 (컬러)', '큰 이미지 미리 보기 · 썸네일'],
            ['<code>IMREAD_REDUCED_GRAYSCALE_2/4/8</code>', '읽으면서 축소 (흑백)', '빠른 대략 검사'],
            ['<code>IMREAD_COLOR_RGB</code> (5.0 새 기능)', 'RGB 순서 3채널', '다른 라이브러리(딥러닝 등)로 넘길 때']
          ], caption: '표 2. 자주 쓰는 imread 플래그 (Python: cv2.IMREAD_GRAYSCALE …)' },
          { type: 'code', title: '예제 2: 같은 흑백 파일을 플래그만 바꿔 읽기', code: EX_FLAGS,
            desc: '<code>sample_gray.png</code> 는 1채널 파일인데도 <code>IMREAD_COLOR</code> 로 읽으면 <b>3채널</b>이 됩니다 (B = G = R 로 복사). <code>IMREAD_UNCHANGED</code> 는 파일 그대로 1채널. <code>REDUCED</code> 플래그는 읽는 동시에 크기를 줄입니다. <code>format("%-27s", …)</code> 는 27칸 왼쪽 정렬입니다.',
            expect: 'IMREAD_COLOR               [640 x 480]  CV_8UC3\nIMREAD_GRAYSCALE           [640 x 480]  CV_8UC1\nIMREAD_UNCHANGED           [640 x 480]  CV_8UC1\nIMREAD_REDUCED_COLOR_2     [320 x 240]  CV_8UC3\nIMREAD_REDUCED_GRAYSCALE_4 [160 x 120]  CV_8UC1' },
          { type: 'callout', kind: 'warn', title: '흔한 실수: empty() 검사를 빼먹기', html: '<code>imread</code> 는 파일이 없거나 이름이 틀려도 <b>예외를 던지지 않고 빈 Mat 을 돌려줍니다</b>. 오류 출력(stderr)에 <code>[ WARN:0@0.001] global loadsave.cpp:275 findDecoder imread_(\'images/x.png\'): can\'t open/read file: check file path/integrity</code> 같은 경고만 한 줄 나옵니다. 검사 없이 진행하면 한참 뒤의 <code>cvtColor</code> · <code>threshold</code> 에서 예외가 나서 원인을 찾기 어렵습니다. <b>읽은 직후에 항상 <code>if (img.empty())</code></b>.' },
          { type: 'h', text: '상대 경로와 작업 폴더' },
          { type: 'p', html: '<code>"images/washers.png"</code> 처럼 드라이브(<code>C:\\</code>)로 시작하지 않는 경로는 <b>상대 경로</b>이고, 프로그램의 <b>작업 폴더(현재 디렉터리, current directory)</b>를 기준으로 찾습니다. 작업 폴더는 소스 파일 위치도, 반드시 exe 위치도 아닙니다 — <b>프로그램을 어떻게 실행했느냐</b>에 따라 달라집니다.' },
          { type: 'figure', html: FIG_PATH, caption: '그림 2. 같은 상대 경로라도 실행 방법에 따라 기준 폴더가 다르다' },
          { type: 'code', title: '예제 3: 여러 경로를 차례로 시도하기', code: EX_PATHS,
            desc: '앞의 두 경로는 실패(빈 Mat)하고 세 번째에서 성공합니다. 실패할 때마다 결과 창 아래에 OpenCV 의 <code>WARN</code> 경고가 찍히는 것도 확인하세요. 실제 프로그램에서는 이렇게 <b>설정 파일 · 명령줄 인수 · 기본 폴더</b> 순으로 경로를 찾는 방식을 자주 씁니다.',
            expect: 'sample_color.png → 실패 (빈 Mat)\nimages/sample_colour.png → 실패 (빈 Mat)\nimages/sample_color.png → 성공' },
          { type: 'callout', kind: 'vs', title: 'Visual Studio 의 작업 폴더', html: '<ul><li><b>F5 / Ctrl+F5</b> 로 실행: 프로젝트 속성 → <b>디버깅 → 작업 디렉터리</b>(기본값 <code>$(ProjectDir)</code>) 가 작업 폴더입니다. 그래서 <code>images</code> 폴더를 <b>프로젝트 폴더(.vcxproj 옆)</b>에 두면 됩니다.</li><li><b>exe 더블클릭 · 명령 프롬프트</b>: exe 가 있는 폴더(또는 명령 프롬프트의 현재 폴더). 배포할 때는 exe 옆에 <code>images</code> 를 복사하거나 빌드 후 이벤트로 복사하세요.</li><li>경로 문자열의 역슬래시는 <code>"C:\\\\data\\\\a.png"</code> 처럼 두 번 쓰거나, <b>슬래시 <code>"C:/data/a.png"</code></b> 를 쓰세요 (Windows 에서도 동작).</li><li>한글 · 공백이 들어간 폴더 경로는 <code>imread</code> 가 실패할 수 있습니다 (Windows 의 문자 인코딩 문제). 실습 폴더는 <b>영문 경로</b>에 만드세요.</li></ul>' },
          { type: 'code', title: '추가: 작업 폴더 확인하기 (Visual Studio)', code: EX_VS_DIR, run: false, local: true, file: 'main.cpp',
            desc: 'C++17 의 <code>&lt;filesystem&gt;</code> 으로 현재 작업 폴더와 파일의 절대 경로 · 존재 여부를 출력합니다. “분명히 파일이 있는데 안 읽혀요” 할 때 가장 먼저 해 볼 진단입니다. (프로젝트 속성 → C/C++ → 언어 → C++ 언어 표준을 <b>ISO C++17</b> 이상으로)' },
          { type: 'h', text: 'imshow · waitKey · destroyAllWindows' },
          { type: 'table', head: ['함수', '하는 일', '브라우저(이 사이트)'], rows: [
            ['<code>imshow("이름", img)</code>', '이름의 창을 만들고(없으면) 이미지를 올림 — 같은 이름이면 같은 창을 갱신', '결과 창에 이미지 창 표시'],
            ['<code>waitKey(0)</code>', '키를 누를 때까지 <b>무한히</b> 기다림 + 창 그리기', '기다리지 않고 바로 돌아옴'],
            ['<code>waitKey(ms)</code>', 'ms 밀리초 동안 기다림, 키가 없으면 -1', 'ms 만큼 쉬며 화면 갱신'],
            ['<code>destroyWindow("이름")</code> / <code>destroyAllWindows()</code>', '창 하나 / 모든 창 닫기', '이미지 창 닫기']
          ], caption: '표 3. HighGUI 기본 함수 (Python: cv2.imshow · cv2.waitKey · cv2.destroyAllWindows)' },
          { type: 'callout', kind: 'info', title: 'imshow 가 보여 주는 방식', html: '<code>imshow</code> 는 8비트 이미지를 그대로 보여 주고, <code>CV_32F</code> 같은 실수 이미지는 <b>0.0~1.0 을 0~255 로</b> 늘려 보여 줍니다. 창 크기는 기본적으로 이미지 크기(<code>WINDOW_AUTOSIZE</code>)라서 큰 이미지는 화면을 넘칩니다 → 3교시의 <code>namedWindow(…, WINDOW_NORMAL)</code>.' },
          { type: 'h', text: '예외 처리: cv::Exception 읽는 법' },
          { type: 'p', html: 'OpenCV 함수는 잘못된 입력을 받으면 <code>cv::Exception</code> 예외를 던집니다. 잡지 않으면 프로그램이 즉시 종료되고(Visual Studio 에서는 “처리되지 않은 예외” 창), 잡으면 메시지를 보여 주고 계속 실행할 수 있습니다. <code>cv::Exception</code> 은 <code>std::exception</code> 을 상속하므로 <code>catch (const std::exception&amp; e)</code> 로도 잡힙니다.' },
          { type: 'code', title: '예제 4: 빈 Mat 을 cvtColor 에 넣으면?', code: EX_EXC,
            desc: '메시지 <code>OpenCV(5.0.0) …/color.cpp:199: error: (-215:Assertion failed) !_src.empty() in function \'cvtColor\'</code> 는 이렇게 읽습니다: <b>①</b> OpenCV 버전 · 소스 위치 <b>②</b> 오류 코드(<code>-215</code> = 조건 검사 실패) <b>③</b> <b>통과하지 못한 조건</b> <code>!_src.empty()</code> — “입력이 비어 있으면 안 된다” <b>④</b> 예외가 난 함수. 조건식을 읽으면 원인이 거의 보입니다.',
            expect: "empty() = true\ncv::Exception 을 잡았습니다\n  code = -215\n  func = cvtColor\n  what = OpenCV(5.0.0) opencv/modules/imgproc/src/color.cpp:199: error: (-215:Assertion failed) !_src.empty() in function 'cvtColor'\n프로그램은 멈추지 않고 계속됩니다" },
          { type: 'table', head: ['자주 보는 조건식', '뜻 · 원인'], rows: [
            ['<code>!_src.empty()</code> · <code>!_img.empty()</code>', '입력 Mat 이 비었다 → imread 경로 확인'],
            ['<code>scn == 3 || scn == 4</code> (cvtColor)', 'BGR→Gray 변환에 1채널이 들어왔다 → 이미 흑백'],
            ['<code>src.type() == CV_8UC1</code>', '흑백 8비트만 받는 함수(Otsu 이진화 · equalizeHist 등)에 다른 형식'],
            ['<code>0 &lt;= roi.x &amp;&amp; … roi.x + roi.width &lt;= m.cols …</code>', 'ROI(Rect)가 이미지 밖으로 나갔다'],
            ['<code>src[i].rows == src[0].rows &amp;&amp; src[i].type() == src[0].type()</code>', 'hconcat 할 이미지의 높이 · 형식이 다르다 (2교시)']
          ], caption: '표 4. cv::Exception 메시지의 조건식으로 원인 찾기' },
          { type: 'callout', kind: 'tip', title: '예외 vs 빈 Mat — 두 가지 실패 방식', html: '<b>파일 입출력(imread)</b>은 실패를 <b>반환값</b>(빈 Mat · <code>imwrite</code> 의 false)으로 알리고, <b>처리 함수</b>는 잘못된 입력을 <b>예외</b>로 알립니다. 그래서 “읽기 직후 <code>empty()</code> 검사 + 처리 부분은 <code>try/catch</code>” 가 기본 패턴입니다. 16 · 17차시의 검사 프로그램에서도 이 구조를 그대로 씁니다.' },
          { type: 'callout', kind: 'more', title: '📘 Debug 빌드에서의 예외', html: 'Visual Studio 에서 F5(디버그)로 실행하면 예외가 던져지는 순간 디버거가 멈추고 “예외가 throw 됨: cv::Exception” 창이 뜰 수 있습니다. <b>계속(F5)</b>을 누르면 우리의 <code>catch</code> 로 넘어갑니다. 출력 창에 <code>what()</code> 메시지 전체가 나오니 조건식을 읽어 보세요.' }
        ],
        practice: [
          {
            title: '여러 이미지의 정보를 한 줄씩 출력하기', level: 1,
            desc: '<code>printInfo(path, m)</code> 함수를 완성해 4개 이미지의 <b>파일 이름: 너비 x 높이, 채널 수, 형식</b> 을 출력하세요. 빈 Mat 이면 “읽기 실패” 를 출력합니다.',
            hint: '<code>m.cols</code> 가 너비, <code>m.rows</code> 가 높이. 형식 이름은 <code>typeToString(m.type())</code>. 매개변수를 <code>const Mat&amp;</code> 로 받으면 복사 없이 읽기만 합니다.',
            starter: P1_INFO_START, solution: P1_INFO_SOL,
            expect: 'images/sample_color.png: 640 x 480, 3채널, CV_8UC3\nimages/washers.png: 640 x 480, 1채널, CV_8UC1\nimages/plate_holes.png: 800 x 600, 1채널, CV_8UC1\nimages/seven_segment.png: 640 x 240, 1채널, CV_8UC1'
          },
          {
            title: '실패하면 예외를 던지는 loadImage 함수', level: 2,
            desc: '<code>loadImage(path, flags)</code> 가 읽기에 실패하면 <code>runtime_error</code> 를 던지게 하고, <code>main</code> 에서 <code>try/catch</code> 로 잡아 “[오류] …” 를 출력한 뒤 다음 파일로 넘어가게 하세요. 첫 파일 이름은 일부러 틀렸습니다(<code>washer.png</code>).',
            hint: '<code>throw runtime_error("파일을 열 수 없습니다: " + path);</code> — <code>catch (const exception&amp; e)</code> 로 잡으면 <code>cv::Exception</code> 도 함께 잡을 수 있습니다.',
            starter: P1_LOAD_START, solution: P1_LOAD_SOL,
            expect: '[오류] 파일을 열 수 없습니다: images/washer.png\nimages/washers.png → 640 x 480'
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: '첫 OpenCV 프로그램 ①', subtitle: '이미지 읽기와 Mat 정보 · 경로 · 예외 처리', notes: '<p>지난 시간 Visual Studio 에 OpenCV 를 설치 · 설정했습니다. 오늘은 모든 비전 프로그램의 공통 뼈대 — 읽기 · 확인 · 보기 · 저장 — 를 제대로 익힙니다. 💬 “이미지를 읽다가 실패하면 프로그램이 어떻게 될까요?” — 대부분 “오류가 난다”고 답하는데, 실제로는 조용히 빈 Mat 이 돌아온다는 것이 오늘의 첫 반전입니다. (2분)</p>' },
          { layout: 'diagram', title: '파일 → Mat → 창 / 파일', html: FIG_PIPE, caption: '파일은 압축된 바이트, Mat 은 풀린 픽셀 배열', notes: '<p>imread 는 “디코딩”, imwrite 는 “인코딩”이라는 말을 짚어 줍니다. PNG 파일 크기(258KB)와 Mat 데이터 크기(921,600바이트)가 다른 이유 💬 — 파일은 압축, Mat 은 압축이 풀린 상태. Mat 헤더(rows · cols · type · step · data 포인터)는 03차시에서 자세히 합니다. (3분)</p>' },
          { layout: 'code', title: 'imread 와 Mat 기본 정보', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png");
    if (img.empty()) { cout << "읽기 실패" << endl; return -1; }

    cout << "rows = " << img.rows << ", cols = " << img.cols << endl;
    cout << "size() = " << img.size() << endl;
    cout << "channels() = " << img.channels() << endl;
    cout << "type = " << typeToString(img.type()) << endl;
    cout << "total() = " << img.total() << endl;
    cout << "elemSize() = " << img.elemSize() << endl;

    imshow("sample_color", img);
    waitKey(0);
    destroyAllWindows();
    return 0;
}`, points: ['읽은 직후 <b><code>empty()</code> 검사</b>', '<code>size()</code> 는 <b>[너비 x 높이]</b>, rows 는 높이', '<code>CV_8UC3</code> = 8비트 · 부호 없음 · 3채널', '데이터 크기 = total() × elemSize() = 921600'], notes: '<p>실행 후 출력 한 줄씩 해석합니다. 💬 “Python 의 img.shape 는?” — (480, 640, 3). C++ 에서는 세 개로 나뉜다. type() 숫자는 64 인데 4.x 에서는 16 이었다 — 숫자 대신 typeToString 을 쓰는 이유. 파일 이름을 틀리게 바꿔 실행해 보게 해 “읽기 실패” 분기를 확인합니다. (8분)</p>' },
          { layout: 'table', title: 'imread 플래그', head: ['플래그', '결과'], rows: [
            ['<code>IMREAD_COLOR</code> (기본)', '항상 BGR 3채널'],
            ['<code>IMREAD_GRAYSCALE</code>', '항상 1채널'],
            ['<code>IMREAD_UNCHANGED</code>', '파일 그대로 (알파 · 16비트)'],
            ['<code>IMREAD_REDUCED_COLOR_2/4/8</code>', '읽으면서 축소'],
            ['<code>IMREAD_COLOR_RGB</code> (5.0)', 'RGB 순서']
          ], lead: '같은 파일도 플래그에 따라 다른 Mat 이 된다', notes: '<p>예제 2 를 실행해 sample_gray.png(1채널 파일)가 IMREAD_COLOR 로 3채널이 되는 것을 보여 줍니다. 💬 “검사 프로그램에서는 주로 어떤 플래그?” — GRAYSCALE (이진화 · 에지 · 측정). 결과에 색 도형을 그려야 하면 COLOR 로 따로 읽거나 변환. (5분)</p>' },
          { layout: 'bullets', title: '없는 파일을 읽으면?', lead: '예외가 아니라 빈 Mat', bullets: [
            '<code>imread</code> 는 실패해도 <b>예외를 던지지 않는다</b> → 빈 Mat',
            'stderr 에 경고 한 줄: <code>[ WARN ] … imread_(\'x.png\'): can\'t open/read file</code>',
            '검사하지 않으면 나중에 <code>cvtColor</code> 등에서 예외 → 원인 찾기 어려움',
            ['규칙', ['<b>읽은 직후 <code>if (img.empty())</code></b>', '실패 메시지에 <b>경로를 함께</b> 출력']]
          ], notes: '<p>파일 이름 오타(sample_colour)로 실행해 결과 창의 WARN 줄을 보여 줍니다. “경고가 빨갛게 나와도 프로그램은 계속 진행한다”가 핵심. (3분)</p>' },
          { layout: 'diagram', title: '상대 경로 = 작업 폴더 기준', html: FIG_PATH, caption: 'F5 = 프로젝트 폴더 · 더블클릭 = exe 폴더 · 브라우저 = 📁 작업 폴더', notes: '<p>학생들이 가장 많이 겪는 문제입니다. 💬 “F5 로는 되는데 exe 를 친구에게 보내니 안 된다, 왜?” — 작업 폴더가 exe 폴더로 바뀌어 images 가 없음. 프로젝트 속성 → 디버깅 → 작업 디렉터리를 화면으로 보여 주면 좋습니다. 한글 경로 주의도 함께. (5분)</p>' },
          { layout: 'code', title: '경로를 차례로 시도하기', code: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
using namespace cv;
using namespace std;

int main()
{
    vector<string> candidates = { "sample_color.png",
        "images/sample_colour.png", "images/sample_color.png" };
    Mat img;
    for (const string& path : candidates)
    {
        img = imread(path);
        cout << path << " → " << (img.empty() ? "실패" : "성공") << endl;
        if (!img.empty()) break;
    }
    if (img.empty()) return -1;
    imshow("found", img);
    waitKey(0);
    return 0;
}`, points: ['실패할 때마다 WARN 경고 + 빈 Mat', '처음 성공한 경로에서 <code>break</code>', '실무: 설정 파일 → 명령줄 인수 → 기본 폴더 순'], notes: '<p>📁 작업 폴더를 열어 images/ 가 어디 있는지 보여 주고, 첫 번째 후보가 왜 실패하는지 확인합니다. (4분)</p>' },
          { layout: 'code', title: '예외 처리: cv::Exception', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/no_such_file.png");
    try
    {
        Mat gray;
        cvtColor(img, gray, COLOR_BGR2GRAY);
    }
    catch (const cv::Exception& e)
    {
        cout << "code = " << e.code << endl;
        cout << "func = " << e.func << endl;
        cout << e.what();
    }
    cout << "계속 실행" << endl;
    return 0;
}`, points: ['<code>-215</code> = Assertion failed (조건 검사 실패)', '<code>!_src.empty()</code> = <b>통과 못 한 조건</b>', '<code>in function \'cvtColor\'</code> = 예외가 난 함수', '<code>catch (const std::exception&amp;)</code> 로도 잡힘'], notes: '<p>메시지를 칠판에 써서 네 부분으로 끊어 읽습니다. 💬 “<code>!_src.empty()</code> 는 무슨 뜻?” — 입력이 비어 있지 않아야 한다. try/catch 를 지우고 실행하면 프로그램이 비정상 종료되는 것도 보여 줍니다. (8분)</p>' },
          { layout: 'table', title: '조건식으로 원인 찾기', head: ['조건식', '원인'], rows: [
            ['<code>!_src.empty()</code>', '입력이 빈 Mat → 경로'],
            ['<code>scn == 3 || scn == 4</code>', '이미 흑백인데 BGR2GRAY'],
            ['<code>src.type() == CV_8UC1</code>', '흑백 8비트만 받는 함수'],
            ['<code>roi.x + roi.width &lt;= m.cols</code>', 'ROI 가 이미지 밖'],
            ['<code>src[i].type() == src[0].type()</code>', 'hconcat 형식 불일치']
          ], notes: '<p>앞으로 자주 볼 메시지 목록입니다. 오류가 나면 “조건식부터 읽는다”는 습관을 강조합니다. (2분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '예외 메시지 <code>(-215:Assertion failed) !_src.empty() in function \'cvtColor\'</code> 의 원인은?', options: ['색 변환 코드가 틀림', 'cvtColor 에 빈 Mat 이 들어옴', '메모리 부족', '출력 Mat 을 안 만듦'], answer: 1, explain: '통과하지 못한 조건 <code>!_src.empty()</code> = 입력이 비어 있었다 → 대부분 imread 경로 문제.', notes: '<p>정답 2번. 출력 Mat 은 미리 만들 필요가 없다(함수가 알아서 할당)는 것도 짚어 줍니다.</p>' },
          { layout: 'practice', title: '실습: printInfo 함수', desc: '<p>4개 이미지의 <b>이름: 너비 x 높이, 채널, 형식</b>을 한 줄씩 출력하는 <code>printInfo</code> 를 완성하세요.</p><ul><li>빈 Mat 이면 “읽기 실패”</li><li>형식 이름 = <code>typeToString(m.type())</code></li></ul>', starter: P1_INFO_START, solution: P1_INFO_SOL, notes: '<p>plate_holes 는 800×600, seven_segment 는 640×240 이라는 것을 결과로 확인합니다. 빨리 끝낸 학생은 실습 2(loadImage 예외)로 넘어가게 합니다. (8분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['<code>imread(경로, 플래그)</code> → 실패하면 <b>빈 Mat</b> (예외 아님) → 즉시 <code>empty()</code> 검사', 'Mat 정보: rows · cols · <code>size()</code>[너비 x 높이] · channels() · <code>typeToString(type())</code> · total() · elemSize()', '상대 경로는 <b>작업 폴더</b> 기준 (F5 = 프로젝트 폴더)', '처리 함수의 잘못된 입력 → <code>cv::Exception</code> → 조건식을 읽는다', '다음 교시: <code>imwrite</code> 로 결과 저장하기'], notes: '<p>“빈 Mat 검사 + try/catch” 를 한 번 더 말하게 합니다. (2분)</p>' }
        ]
      },
      // ═══════════════════════════ 2교시 ═══════════════════════════
      {
        id: 'cv02-2', title: '결과 저장하기: imwrite 와 비교 이미지 만들기', minutes: 50,
        goals: ['imwrite 로 PNG · JPG 를 저장하고 반환값과 params 를 쓸 수 있다', 'cvtColor · resize · hconcat 으로 원본과 결과를 나란히 놓은 비교 이미지를 만들 수 있다', 'format 과 반복문으로 번호가 붙은 여러 파일을 저장하고 다시 읽을 수 있다'],
        flow: [['도입: 결과는 파일로 남긴다', 5], ['imwrite · params', 12], ['비교 이미지 (hconcat)', 13], ['여러 파일 저장', 10], ['실습 · 퀴즈', 10]],
        content: [
          { type: 'h', text: '결과는 파일로 남긴다' },
          { type: 'p', html: '검사 장비는 불량이 나온 순간의 이미지를 <b>파일로 저장</b>해 두어야 나중에 원인을 분석할 수 있습니다. 보고서에 넣을 결과 그림, 학습 데이터 수집도 모두 저장에서 시작합니다. OpenCV 의 저장 함수는 <code>imwrite(파일이름, Mat, 옵션)</code> 하나입니다.' },
          { type: 'code', title: '예제 1: 흑백으로 바꿔 저장하고 다시 읽기', code: EX_SAVE,
            desc: '<code>imwrite</code> 는 성공하면 <code>true</code> 를 돌려줍니다. PNG 는 <b>무손실</b>이라 다시 읽으면 원본과 픽셀이 완전히 같습니다(다른 픽셀 0개). <code>back != gray</code> 는 픽셀마다 비교해 다르면 255 인 Mat 을 만들고, <code>countNonZero</code> 가 그 개수를 셉니다. 브라우저에서는 저장한 파일이 <b>📁 작업 폴더</b>에 생기며 거기서 내려받을 수 있습니다.',
            expect: 'gray.png 저장: 성공\n다시 읽기: [640 x 480] CV_8UC1\n원본과 다른 픽셀 수: 0' },
          { type: 'table', head: ['확장자', '형식', '특징', '주요 params'], rows: [
            ['<code>.png</code>', 'PNG', '<b>무손실</b> · 알파 채널 · 16비트 가능 — 검사 결과 · 마스크 저장에 권장', '<code>IMWRITE_PNG_COMPRESSION</code> 0~9 (기본 1)'],
            ['<code>.jpg</code> / <code>.jpeg</code>', 'JPEG', '<b>손실</b> 압축 · 파일이 작음 — 사진 · 기록용 (이진 영상 · 측정용으로는 부적합)', '<code>IMWRITE_JPEG_QUALITY</code> 0~100 (기본 95)'],
            ['<code>.bmp</code>', 'BMP', '압축 없음 · 크다 · 가장 단순', '—'],
            ['<code>.tif</code> / <code>.tiff</code>', 'TIFF', '무손실 · 16비트 · 산업용 카메라 소프트웨어에서 흔함', '<code>IMWRITE_TIFF_COMPRESSION</code>']
          ], caption: '표 1. imwrite 는 확장자로 형식을 고른다 (Python: cv2.imwrite(name, img, [cv2.IMWRITE_JPEG_QUALITY, 90]))' },
          { type: 'callout', kind: 'warn', title: '이 사이트에서의 imwrite', html: '브라우저 실행 환경의 <code>imwrite</code> 는 확장자와 상관없이 <b>항상 PNG 로 인코딩</b>해 📁 작업 폴더에 저장합니다 (JPEG 품질 옵션은 무시). 그래서 JPEG 품질에 따른 파일 크기 비교는 Visual Studio 에서 해 보세요. 또 브라우저에서는 <code>out/a.png</code> 처럼 <b>없는 폴더</b>에 저장해도 성공하지만, 실제 OpenCV 는 <b>폴더가 없으면 저장에 실패</b>합니다(false 또는 예외). 폴더는 미리 만들어 두세요.' },
          { type: 'code', title: '추가: 폴더 만들기 + JPEG 품질별 파일 크기 (Visual Studio)', code: EX_VS_SAVE, run: false, local: true, file: 'main.cpp',
            desc: '<code>std::filesystem::create_directories</code> 로 폴더를 만든 뒤 저장합니다. 품질 95 → 20 으로 갈수록 파일이 작아지지만 <b>블록 경계(8×8)가 보이는 손실</b>이 생깁니다. 저장한 JPG 를 다시 읽어 원본과 <code>absdiff</code> 해 보면 차이가 0 이 아닌 것을 확인할 수 있습니다.' },
          { type: 'h', text: '원본과 결과를 나란히: 비교 이미지 만들기' },
          { type: 'p', html: '처리 결과는 원본과 <b>나란히</b> 놓고 봐야 차이가 잘 보입니다. <code>hconcat</code>(가로) · <code>vconcat</code>(세로)으로 여러 Mat 을 한 장으로 붙이고, 크면 <code>resize</code> 로 줄여 저장합니다.' },
          { type: 'figure', html: FIG_CONCAT, caption: '그림 1. hconcat 은 행 수와 형식이 같아야 한다 — 흑백 결과는 GRAY2BGR 로 3채널로 바꿔 붙인다' },
          { type: 'code', title: '예제 2: 원본 | 흑백 비교 이미지 저장', code: EX_SIDE,
            desc: '<code>COLOR_GRAY2BGR</code> 은 흑백 값을 B · G · R 세 채널에 똑같이 복사합니다 (보기에는 여전히 흑백). <code>resize(src, dst, Size(), 0.5, 0.5, INTER_AREA)</code> 는 크기 대신 <b>배율</b>로 줄이며, 축소에는 <code>INTER_AREA</code> 가 깔끔합니다. 마지막 <code>try</code> 는 형식이 다른 두 Mat 을 붙이려다 예외가 나는 것을 보여 줍니다.',
            expect: 'both: [1280 x 480], half: [640 x 240]\nhconcat 실패: code -215 in hconcat' },
          { type: 'callout', kind: 'tip', title: '결과 그림에 글자 넣기', html: '<code>putText(img, "text", Point(x, y), FONT_HERSHEY_SIMPLEX, 크기, Scalar(B,G,R), 두께)</code> 의 <code>Point</code> 는 글자의 <b>왼쪽 아래</b> 기준입니다. Hershey 폰트는 <b>한글을 그리지 못하므로</b>(물음표로 나옴) 이미지 안의 글자는 영어로 쓰세요. 04차시에서 자세히 다룹니다.' },
          { type: 'h', text: '번호를 붙여 여러 파일 저장하기' },
          { type: 'code', title: '예제 3: result_00.png, result_01.png … 저장하고 다시 읽기', code: EX_LOOP,
            desc: '<code>format("result_%02d.png", i)</code> 는 <code>printf</code> 형식으로 문자열을 만듭니다. <code>%02d</code> 는 2자리, 빈 곳은 0 — 파일 탐색기에서 이름순 정렬이 번호순과 같아집니다. 저장한 파일은 📁 작업 폴더에 보이고, 같은 프로그램 안에서 곧바로 다시 읽을 수도 있습니다.',
            expect: 'result_00.png 저장 OK: 640 x 480\nresult_01.png 저장 OK: 320 x 240\nresult_02.png 저장 OK: 160 x 120\n읽기 result_00.png: [640 x 480], 1채널\n읽기 result_01.png: [320 x 240], 1채널\n읽기 result_02.png: [160 x 120], 1채널' },
          { type: 'callout', kind: 'field', title: '🏭 현장 노트: 불량 이미지 저장 규칙', html: '검사 장비는 보통 <code>NG_20260930_142501_023_cam1.png</code> 처럼 <b>판정 · 날짜 · 시각 · 번호 · 카메라</b>를 파일 이름에 넣고, 날짜별 폴더에 저장합니다. 원본(무손실 PNG)과 결과 오버레이(JPG)를 따로 남기고, 디스크가 차지 않게 오래된 파일을 지우는 정책도 함께 둡니다. 이 이름 만들기에 <code>format</code> 을 그대로 씁니다.' },
          { type: 'callout', kind: 'more', title: '📘 imencode / imdecode: 메모리에서 인코딩', html: '<code>vector&lt;uchar&gt; buf; imencode(".png", img, buf);</code> 는 파일 대신 <b>메모리 버퍼</b>에 PNG 바이트를 만듭니다. 네트워크로 이미지를 보내거나 DB 에 넣을 때 쓰고, 받은 바이트는 <code>imdecode(buf, IMREAD_COLOR)</code> 로 다시 Mat 이 됩니다.' }
        ],
        practice: [
          {
            title: '썸네일 만들기: 너비 160 으로 줄여 저장', level: 1,
            desc: '세 이미지를 <b>비율을 유지하며 너비 160</b>으로 줄여 <code>thumb_00.png</code> ~ <code>thumb_02.png</code> 로 저장하고, 이름과 크기를 출력하세요. (pcb_golden 은 800×600 입니다.)',
            hint: '<code>double scale = 160.0 / img.cols;</code> — <code>160 / img.cols</code> 로 쓰면 정수 나눗셈이라 0 이 됩니다! <code>resize(img, thumb, Size(), scale, scale, INTER_AREA);</code>',
            starter: P2_THUMB_START, solution: P2_THUMB_SOL,
            expect: 'thumb_00.png: 160 x 120\nthumb_01.png: 160 x 120\nthumb_02.png: 160 x 120'
          },
          {
            title: '원본 | 이진화 결과 띠(strip) 저장', level: 2,
            desc: '<code>coins_parts.png</code> 의 원본과 Otsu 이진화 결과를 <b>가로로 붙이고 절반으로 줄여</b> <code>strip.png</code> 로 저장하세요. 저장 성공 여부 · 크기 · 형식을 출력합니다.',
            hint: '둘 다 1채널(CV_8UC1)이므로 변환 없이 <code>hconcat(gray, binary, both)</code> 가 됩니다. 결과: 1280×480 → 절반 640×240.',
            starter: P2_STRIP_START, solution: P2_STRIP_SOL,
            expect: 'strip.png 저장: 640 x 240, CV_8UC1'
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: '첫 OpenCV 프로그램 ②', subtitle: '결과 저장하기: imwrite 와 비교 이미지', notes: '<p>💬 “검사 장비가 불량을 찾았다. 무엇을 남겨야 할까?” — 불량 이미지, 시각, 판정 결과. 오늘은 저장과, 원본 · 결과를 한 장에 보여 주는 비교 이미지를 만듭니다. (2분)</p>' },
          { layout: 'code', title: 'imwrite 기본', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png");
    Mat gray;
    cvtColor(img, gray, COLOR_BGR2GRAY);

    bool ok = imwrite("gray.png", gray);
    cout << "저장: " << (ok ? "성공" : "실패") << endl;
    imwrite("gray_q90.jpg", gray, { IMWRITE_JPEG_QUALITY, 90 });

    Mat back = imread("gray.png", IMREAD_UNCHANGED);
    cout << "다른 픽셀: " << countNonZero(back != gray) << endl;
    imshow("back", back);
    waitKey(0);
    return 0;
}`, points: ['<b>확장자</b>로 형식 결정 · 성공하면 true', 'params = <b>(이름, 값)</b> 쌍의 vector', 'PNG 는 무손실 → 다른 픽셀 0', '저장 파일은 📁 작업 폴더에서 내려받기'], notes: '<p>실행 후 📁 작업 폴더를 열어 gray.png 를 내려받아 보게 합니다. 💬 “JPG 로 저장한 걸 다시 읽으면 다른 픽셀이 0 일까?” — 아니다(손실 압축). 브라우저는 항상 PNG 로 저장하므로 VS 에서 확인할 과제로 남깁니다. (8분)</p>' },
          { layout: 'table', title: '저장 형식 고르기', head: ['형식', '특징', '용도'], rows: [
            ['PNG', '무손실 · 알파 · 16비트', '검사 원본 · 마스크 · 결과'],
            ['JPEG', '손실 · 작음 · 품질 0~100', '사진 · 기록 · 보고서'],
            ['BMP', '무압축 · 큼', '단순 호환'],
            ['TIFF', '무손실 · 16비트', '산업용 카메라 SW']
          ], lead: '측정 · 이진 영상은 PNG, 사진 기록은 JPEG', notes: '<p>이진 영상을 JPEG 로 저장하면 경계에 0/255 가 아닌 값이 생긴다 — 다시 읽어 측정하면 결과가 달라진다는 점을 강조합니다. 실제 OpenCV 는 없는 폴더에 저장하면 실패한다는 것도 말해 줍니다. (4분)</p>' },
          { layout: 'diagram', title: 'hconcat: 행 수 · 형식이 같아야', html: FIG_CONCAT, caption: '흑백 결과는 GRAY2BGR 로 3채널로 바꿔 붙인다', notes: '<p>💬 “컬러 원본 옆에 흑백 결과를 붙이려면?” — 흑백을 3채널로. 값은 그대로 흑백이지만 형식이 CV_8UC3 가 된다. vconcat 은 열 수가 같아야 한다. (4분)</p>' },
          { layout: 'code', title: '원본 | 흑백 비교 이미지', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/nuts_bolts_color.png");
    Mat gray, gray3, both, half;
    cvtColor(img, gray, COLOR_BGR2GRAY);
    cvtColor(gray, gray3, COLOR_GRAY2BGR);      // 1 → 3채널

    hconcat(img, gray3, both);                  // 640+640 = 1280
    resize(both, half, Size(), 0.5, 0.5, INTER_AREA);
    putText(half, "original", Point(10, 25), FONT_HERSHEY_SIMPLEX,
            0.7, Scalar(0, 255, 255), 2);
    cout << both.size() << " → " << half.size() << endl;
    imwrite("compare.png", half);
    imshow("compare", half);
    waitKey(0);
    return 0;
}`, points: ['<code>GRAY2BGR</code>: 형식만 3채널로', '<code>resize(…, Size(), 0.5, 0.5, INTER_AREA)</code> = 배율로 축소', 'putText 는 영어로 (Hershey 폰트는 한글 불가)'], notes: '<p>gray3 대신 gray 를 넣어 실행 → 예외 메시지의 조건식(<code>src[i].type() == src[0].type()</code>)을 함께 읽습니다. 1교시의 “조건식 읽기” 복습. (8분)</p>' },
          { layout: 'code', title: '번호 붙여 여러 파일 저장', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    double scales[] = { 1.0, 0.5, 0.25 };
    for (int i = 0; i < 3; i++)
    {
        Mat dst;
        resize(img, dst, Size(), scales[i], scales[i], INTER_AREA);
        string name = format("result_%02d.png", i);
        imwrite(name, dst);
        cout << name << ": " << dst.size() << endl;
    }
    Mat m = imread("result_02.png", IMREAD_UNCHANGED);
    cout << "다시 읽기: " << m.size() << endl;
    imshow("result_02", m);
    waitKey(0);
    return 0;
}`, points: ['<code>format("%02d", i)</code> → 00, 01, 02', '이름순 = 번호순', '저장 직후 다시 읽을 수 있다'], notes: '<p>%02d 를 %d 로 바꾸면 result_10 이 result_2 앞에 정렬되는 문제를 말로 설명합니다. 현장 노트(판정 · 날짜 · 번호 파일 이름)로 연결합니다. (6분)</p>' },
          { layout: 'two', title: '브라우저 vs Visual Studio 의 imwrite', left: { title: '🌐 이 사이트', bullets: ['항상 PNG 로 인코딩 (JPEG 품질 무시)', '📁 작업 폴더에 저장 → 내려받기', '없는 폴더 경로도 저장됨'] }, right: { title: '🖥 Visual Studio', bullets: ['확장자대로 인코딩 · 품질 반영', '작업 폴더(프로젝트 폴더)에 저장', '<b>폴더가 없으면 실패</b> → <code>filesystem::create_directories</code>'] }, notes: '<p>두 환경의 차이를 정리합니다. VS 과제: EX_VS_SAVE 로 품질별 파일 크기를 비교해 오기. (3분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: 'JPEG 품질 80 으로 저장하는 올바른 코드는?', options: ['<code>imwrite("a.jpg", img, 80)</code>', '<code>imwrite("a.jpg", img, {IMWRITE_JPEG_QUALITY, 80})</code>', '<code>imwrite("a.jpg", img, {80, IMWRITE_JPEG_QUALITY})</code>', '<code>imwrite("a.jpg:80", img)</code>'], answer: 1, explain: 'params 는 (옵션 이름, 값) 쌍을 순서대로 넣은 <code>vector&lt;int&gt;</code>.', notes: '<p>정답 2번. 순서가 바뀌면 옵션 번호 80 으로 해석된다는 점을 짚어 줍니다.</p>' },
          { layout: 'practice', title: '실습: 썸네일 만들기', desc: '<p>세 이미지를 <b>너비 160</b>(비율 유지)으로 줄여 <code>thumb_00.png</code>~ 로 저장하세요.</p><ul><li><code>scale = 160.0 / img.cols</code> (정수 나눗셈 주의)</li><li><code>INTER_AREA</code> 로 축소</li></ul>', starter: P2_THUMB_START, solution: P2_THUMB_SOL, notes: '<p>160 / img.cols 로 써서 0 배율 예외를 만나는 학생이 꼭 있습니다 — 좋은 교육 기회이니 메시지를 함께 읽습니다. 빨리 끝낸 학생은 실습 2(strip). (8분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['<code>imwrite(이름, img, {옵션, 값})</code> — 확장자로 형식, 반환값 bool', '측정 · 이진 영상은 <b>PNG</b>(무손실), 사진 기록은 JPEG', '<code>hconcat</code>/<code>vconcat</code>: 행(열) 수 · 형식이 같아야 → <code>GRAY2BGR</code>', '<code>format("result_%02d.png", i)</code> 로 번호 파일', '다음 교시: 창과 키 — waitKey 로 움직이는 이미지 뷰어'], notes: '<p>저장 → 다시 읽기로 검증하는 습관을 강조합니다. (2분)</p>' }
        ]
      },
      // ═══════════════════════════ 3교시 ═══════════════════════════
      {
        id: 'cv02-3', title: '창과 키: waitKey 루프 · 이미지 뷰어 · 마우스 · 트랙바', minutes: 50,
        goals: ['namedWindow 플래그와 waitKey 반환값의 의미를 안다', '키 처리 함수를 분리해 키보드로 넘기는 이미지 뷰어를 만들 수 있다', '마우스 콜백 · 트랙바의 구조(콜백 함수 + userdata)를 설명할 수 있다'],
        flow: [['도입: 이벤트 루프', 5], ['namedWindow · waitKey', 10], ['이미지 뷰어 (키 · cin)', 17], ['마우스 · 트랙바', 10], ['실습 · 정리', 8]],
        content: [
          { type: 'h', text: 'HighGUI 의 창과 키' },
          { type: 'p', html: 'OpenCV 의 <b>HighGUI</b> 모듈은 창 띄우기 · 키 입력 · 마우스 · 트랙바 같은 <b>간단한 UI</b> 를 제공합니다. 본격적인 화면(버튼 · 메뉴)은 Qt · MFC 같은 GUI 프레임워크로 만들지만, 알고리즘을 시험하고 결과를 확인하는 도구로는 HighGUI 만으로 충분합니다. 핵심은 <b><code>waitKey</code> 를 중심으로 도는 반복(이벤트 루프)</b> 입니다.' },
          { type: 'figure', html: FIG_LOOP, caption: '그림 1. waitKey 이벤트 루프 — imshow 로 그릴 이미지를 올리고, waitKey 가 창을 그리며 키를 받아 온다' },
          { type: 'table', head: ['namedWindow 플래그', '동작'], rows: [
            ['<code>WINDOW_AUTOSIZE</code> (기본값)', '창 크기 = 이미지 크기, 사용자가 크기 조절 불가'],
            ['<code>WINDOW_NORMAL</code>', '마우스로 크기 조절 가능, <code>resizeWindow(이름, w, h)</code> 로 지정 — <b>큰 이미지</b>에 필수'],
            ['<code>WINDOW_KEEPRATIO</code> / <code>WINDOW_FREERATIO</code>', '크기 조절 시 가로세로 비율 유지 / 자유 (NORMAL 과 함께 <code>|</code> 로)'],
            ['<code>WINDOW_GUI_NORMAL</code>', '(Qt 빌드) 도구 모음 · 상태 표시줄 없는 단순한 창']
          ], caption: '표 1. namedWindow(이름, 플래그) — imshow 전에 부르면 창의 성질을 정할 수 있다. 이 사이트에서는 무시된다' },
          { type: 'list', items: [
            '<b>창 이름이 창의 ID</b> 입니다. <code>imshow("viewer", …)</code> 를 반복해서 부르면 같은 창이 갱신되고, 이름이 다르면 창이 새로 생깁니다.',
            '<code>waitKey(delay)</code>: <code>delay</code> ms 동안 키를 기다립니다. <b>0 이면 무한</b>. 반환값은 누른 키의 코드(<code>\'a\'</code> = 97, <b>ESC = 27</b>, Enter = 13, Space = 32), 시간 안에 키가 없으면 <b>-1</b>.',
            '<code>waitKey</code> 는 <b>HighGUI 창이 하나 이상 있어야</b> 키를 받습니다. 창 없이 부르면 콘솔에서 키를 눌러도 반응하지 않습니다 (콘솔 입력은 <code>cin</code>).',
            '화살표 같은 특수 키는 <code>waitKeyEx</code> 로 받습니다 (Windows: ← <code>0x250000</code>, ↑ <code>0x260000</code>, → <code>0x270000</code>, ↓ <code>0x280000</code>). 옛날 코드의 <code>waitKey(0) &amp; 0xFF</code> 는 하위 8비트만 남기는 관용구입니다.',
            '<b>이 사이트</b>에서는 <code>waitKey(0)</code> 이 기다리지 않고 바로 돌아오고(결과 창에서 누른 키가 있으면 그 키), <code>waitKey(ms)</code> 는 ms 만큼 쉬며 화면을 갱신합니다.'
          ] },
          { type: 'callout', kind: 'warn', title: '창 이름에 한글을 쓰면?', html: 'Windows 의 기본 HighGUI(Win32) 창은 제목 문자열을 시스템 코드 페이지로 해석하므로, 소스 파일이 UTF-8 이면 <code>imshow("결과", img)</code> 의 제목이 <b>깨져 보입니다</b>. 창 이름은 <b>영어</b>로 짓는 것이 안전합니다 (이 사이트는 한글도 잘 보이지만 VS 로 옮길 것을 생각하세요). <code>cout</code> 의 한글이 깨지면 프로젝트 속성 → C/C++ → 명령줄에 <code>/utf-8</code> 을 넣었는지 확인하세요 (01차시).' },
          { type: 'h', text: '이미지 뷰어 ① 차례로 보여 주기 (슬라이드 쇼)' },
          { type: 'code', title: '예제 1: 파일 목록을 0.4초씩 보여 주기', code: EX_SLIDE,
            desc: '같은 창 <code>"viewer"</code> 를 계속 갱신합니다. <code>waitKey(400)</code> 은 0.4초 동안 화면을 보여 주며 키를 기다리고, 그 사이 <b>ESC</b> 를 누르면 중단합니다. 흑백 파일(washers)도 <code>IMREAD_COLOR</code> 로 읽었기 때문에 노란 글자를 쓸 수 있습니다. 결과 창에서 이미지가 바뀌는 모습을 보세요.',
            expect: '[1/4] images/sample_color.png  (640 x 480)\n[2/4] images/washers.png  (640 x 480)\n[3/4] images/coins_parts.png  (640 x 480)\n[4/4] images/color_caps.png  (640 x 480)' },
          { type: 'h', text: '이미지 뷰어 ② 키로 넘기기 — 키 처리 함수 분리' },
          { type: 'p', html: '키 입력을 받는 부분(<code>waitKey</code>)과 <b>키에 따라 상태를 바꾸는 규칙</b>을 한 곳에 섞으면 시험하기 어렵습니다. 규칙을 <code>handleKey(key, index, count)</code> 함수로 분리하면, 키가 <b>waitKey · 문자열 · cin</b> 어디서 오든 같은 함수로 처리할 수 있고, 브라우저에서도 “누른 키 목록”으로 동작을 시험할 수 있습니다.' },
          { type: 'code', title: '예제 2: 키 처리 함수 + 키 목록으로 시험하기', code: EX_KEYSIM,
            desc: '<code>(index + 1) % count</code> 는 마지막 다음에 처음으로 돌아가고, <code>(index - 1 + count) % count</code> 는 처음 이전에 마지막으로 돌아갑니다 (<code>+ count</code> 가 없으면 C++ 의 <code>%</code> 가 음수를 돌려줄 수 있음). 모르는 키 <code>\'x\'</code> 는 <code>default</code> 에서 무시됩니다.',
            expect: "'n' → 1: images/washers.png\n'n' → 2: images/coins_parts.png\n'n' → 3: images/color_caps.png\n'n' → 0: images/sample_color.png\n'p' → 3: images/color_caps.png\n'x' → 3: images/color_caps.png\n'g' → 0: images/sample_color.png\n'q' → 종료" },
          { type: 'code', title: '완성: 키보드 이미지 뷰어 (Visual Studio)', code: EX_VIEWER_LOCAL, run: false, local: true, file: 'main.cpp',
            desc: '로컬 PC 에서는 <code>waitKeyEx(0)</code> 이 실제로 키를 기다리므로 <code>while (true)</code> 루프가 사용자가 ESC 를 누를 때까지 돕니다. <code>WINDOW_NORMAL</code> + <code>resizeWindow</code> 로 창 크기를 정하고, <code>setWindowTitle</code> 로 제목에 현재 파일을 보여 줍니다. <b>s</b> 를 누르면 현재 이미지를 <code>capture_00.png</code> … 로 저장합니다.' },
          { type: 'callout', kind: 'warn', title: '브라우저에서 while (true) + waitKey(0) 을 쓰지 마세요', html: '이 사이트의 <code>waitKey(0)</code> 은 기다리지 않으므로, ESC 를 받을 때까지 도는 무한 루프는 CPU 를 계속 쓰며 멈추지 않습니다(■ 중지 버튼으로 멈출 수는 있음). 브라우저에서는 <b>정해진 횟수만 반복</b>하거나(예제 1), <b>키 목록 · cin</b> 으로 입력을 주세요(예제 2 · 3).' },
          { type: 'h', text: '이미지 뷰어 ③ cin 으로 번호를 입력받기' },
          { type: 'code', title: '예제 3: 번호를 입력하면 그 이미지를 보여 주기', code: EX_CIN, stdin: '2\n7\n0\n-1\n',
            desc: '<b>예시 입력으로 실행</b>을 누르면 <code>2 ⏎ 7 ⏎ 0 ⏎ -1</code> 이 차례로 들어갑니다 (편집기에서 실행하면 결과 창에서 직접 입력). <code>cin &gt;&gt; idx</code> 가 실패(숫자가 아닌 입력 · 입력 끝)하면 <code>!(cin &gt;&gt; idx)</code> 가 참이 되어 루프를 끝냅니다. <code>waitKey(1)</code> 은 창을 그리기만 하고 곧바로 다음 입력으로 넘어갑니다.',
            expect: '0: images/sample_color.png\n1: images/washers.png\n2: images/coins_parts.png\n3: images/plate_holes.png\n번호 (-1 = 끝): \n  images/coins_parts.png → 640 x 480, 1채널\n번호 (-1 = 끝): \n  범위 밖입니다\n번호 (-1 = 끝): \n  images/sample_color.png → 640 x 480, 3채널\n번호 (-1 = 끝): \n뷰어 종료' },
          { type: 'h', text: '마우스 콜백: 클릭한 곳의 픽셀 값' },
          { type: 'p', html: '<b>콜백(callback)</b>은 “이벤트가 생기면 OpenCV 가 대신 불러 줄 함수”입니다. <code>setMouseCallback(창 이름, 함수, userdata)</code> 로 등록하면, <code>waitKey</code> 가 이벤트를 처리하는 동안 마우스 이벤트마다 그 함수가 호출됩니다. 함수 모양은 <code>void f(int event, int x, int y, int flags, void* userdata)</code> 로 정해져 있고, 필요한 데이터(Mat 등)는 <b><code>void*</code> userdata</b> 로 넘겨 전역 변수 없이 씁니다.' },
          { type: 'code', title: '로컬: 클릭한 위치의 BGR 값 출력 (Visual Studio)', code: EX_MOUSE_LOCAL, run: false, local: true, file: 'main.cpp',
            desc: '<code>static_cast&lt;Mat*&gt;(userdata)</code> 로 <code>void*</code> 를 원래 형식으로 되돌립니다. 콜백은 <b>(x, y)</b> 를 주지만 <code>at</code> 은 <b>(y, x)</b> — 여기서도 순서에 주의! <code>flags</code> 로 Ctrl · Shift 가 눌렸는지 알 수 있습니다. <code>setMouseCallback</code> 은 창이 있어야 하므로 <code>namedWindow</code> 를 먼저 부릅니다.' },
          { type: 'code', title: '예제 4 (브라우저 버전): 정해 둔 좌표의 픽셀 값', code: EX_PIXELS,
            desc: '브라우저에서는 마우스 콜백 대신 <b>좌표 목록</b>으로 같은 처리를 합니다. <code>color_chart.png</code> 의 패치 k 는 왼쪽 위 (30 + 72·열, 42 + 72·행), 크기 60×60 이므로 중심은 +30 입니다. 결과 창의 이미지 위에 마우스를 올리면 나오는 값과 비교해 보세요 — 결과 창의 좌표 · 픽셀 표시가 바로 마우스 콜백으로 만든 기능입니다.',
            expect: '(60, 72) B=55 G=79 R=125\n(60, 144) B=38 G=117 R=228\n(60, 288) B=213 G=233 R=248\n(420, 288) B=50 G=54 R=58' },
          { type: 'h', text: '트랙바: 값을 드래그해서 바꾸기' },
          { type: 'p', html: '<code>createTrackbar(이름, 창 이름, &amp;변수, 최댓값, 콜백, userdata)</code> 는 창에 슬라이더를 붙입니다. 슬라이더를 움직이면 <b>변수 값이 바뀌고 콜백이 호출</b>되므로, 콜백 안에서 처리를 다시 하고 <code>imshow</code> 합니다. 임계값 · 커널 크기 같은 파라미터를 눈으로 보며 맞출 때 아주 유용합니다.' },
          { type: 'code', title: '로컬: 트랙바로 이진화 임계값 조절 (Visual Studio)', code: EX_TRACK_LOCAL, run: false, local: true, file: 'main.cpp',
            desc: '여러 데이터를 콜백에 넘겨야 하면 <b>구조체</b>로 묶어 그 주소를 userdata 로 넘깁니다. 트랙바를 만든 직후에는 콜백이 불리지 않으므로 <code>onThresh(value, &amp;d)</code> 를 한 번 직접 부릅니다. <code>getTrackbarPos("thresh", "binary")</code> 로 현재 값을 읽을 수도 있습니다.' },
          { type: 'code', title: '예제 5 (브라우저 버전): 임계값 목록으로 결과 보기', code: EX_TRACK_WEB,
            desc: '트랙바를 네 위치로 옮겼다고 가정하고 같은 창을 갱신합니다. 와셔 이미지는 밝은 백라이트 배경(약 241) 위의 어두운 부품(약 18)이라, 임계값이 부품과 배경 사이에 있는 동안은 흰 픽셀 비율이 거의 변하지 않다가 배경 밝기에 가까워지면 급격히 줄어듭니다 — 07차시 이진화의 예고편입니다.',
            expect: '임계값  60 → 흰 픽셀  86.1 %\n임계값 120 → 흰 픽셀  85.0 %\n임계값 180 → 흰 픽셀  83.8 %\n임계값 230 → 흰 픽셀  10.5 %' },
          { type: 'callout', kind: 'tip', title: '브라우저에서 익히고, Visual Studio 에서 완성', html: '마우스 · 트랙바가 없는 브라우저에서도 <b>처리 부분(콜백이 할 일)</b> 은 좌표 목록 · 값 목록 · cin 으로 똑같이 시험할 수 있습니다. 처리를 함수로 분리해 두면 <b>콜백은 그 함수를 부르기만</b> 하면 되므로 옮기기도 쉽습니다. 이것이 16차시 클래스 설계로 이어집니다.' },
          { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 · 평가', html: '<ul><li>교사 PC 의 Visual Studio 에 <b>키보드 뷰어 · 마우스 콜백 · 트랙바</b> 세 프로그램을 미리 빌드해 두고 시연합니다 (images 폴더를 프로젝트 폴더에 복사).</li><li>한글 창 제목이 깨지는 모습을 한 번 보여 주면 “창 이름은 영어” 규칙이 잘 기억됩니다.</li><li>평가 루브릭(뷰어 과제): ① empty() 검사와 오류 메시지 (2점) ② n/p 순환 인덱스가 범위를 벗어나지 않음 (3점) ③ s 키 저장과 번호 파일 이름 (2점) ④ ESC 종료 · destroyAllWindows (1점) ⑤ 키 처리를 함수로 분리 (2점).</li><li>💬 발문: “waitKey 를 지우면 왜 창이 안 보일까?” — 창을 그리는 일도 waitKey 가 한다.</li></ul>' }
        ],
        practice: [
          {
            title: '뷰어에 “마지막으로” · 숫자 키 추가하기', level: 2,
            desc: '<code>handleKey</code> 에 <b>\'e\' = 마지막 이미지</b>, <b>\'1\'~\'9\' = 그 번호 이미지</b>(1 = 첫 번째, 없는 번호는 무시)를 추가하세요. 키 목록 <code>"e3n9p1q"</code> 로 시험합니다.',
            hint: '문자 \'1\' 의 코드는 49 입니다. <code>key - \'1\'</code> 을 하면 \'1\' → 0, \'3\' → 2 가 됩니다. <code>switch</code> 의 case 로 9개를 다 쓰는 대신 <code>if (key &gt;= \'1\' &amp;&amp; key &lt;= \'9\')</code> 로 범위를 먼저 처리하세요.',
            starter: P3_KEYS_START, solution: P3_KEYS_SOL,
            expect: "'e' → 3: images/color_caps.png\n'3' → 2: images/coins_parts.png\n'n' → 3: images/color_caps.png\n'9' → 3: images/color_caps.png\n'p' → 2: images/coins_parts.png\n'1' → 0: images/sample_color.png\n'q' → 종료"
          },
          {
            title: 'cin 으로 임계값을 입력받아 이진화 보기', level: 2,
            desc: '트랙바 대신 <code>cin</code> 으로 임계값을 반복해서 입력받아 <code>coins_parts.png</code> 를 이진화하고 흰 픽셀 비율(%)을 출력 · 표시하세요. 음수를 입력하면 끝, 255 보다 크면 경고를 출력합니다.',
            hint: '1교시 예제 3 의 <code>while (true) { … if (!(cin &gt;&gt; t) || t &lt; 0) break; … }</code> 구조를 그대로 씁니다. 비율 = <code>100.0 * countNonZero(binary) / binary.total()</code>.',
            stdin: '50\n300\n150\n-1\n',
            starter: P3_CIN_START, solution: P3_CIN_SOL,
            expect: '임계값 (음수 = 끝): \n  임계값 50 → 흰 픽셀 9.2 %\n임계값 (음수 = 끝): \n  0~255 사이로 입력하세요\n임계값 (음수 = 끝): \n  임계값 150 → 흰 픽셀 7.9 %\n임계값 (음수 = 끝): \n끝'
          }
        ],
        quiz: QUIZ3,
        slides: [
          { layout: 'title', title: '첫 OpenCV 프로그램 ③', subtitle: '창과 키: waitKey 루프 · 이미지 뷰어 · 마우스 · 트랙바', notes: '<p>💬 “지금까지 waitKey(0) 을 왜 매번 썼을까?” — 창을 보이게 하려고. 오늘은 waitKey 의 반환값을 써서 키보드로 움직이는 뷰어를 만듭니다. (2분)</p>' },
          { layout: 'diagram', title: 'waitKey 이벤트 루프', html: FIG_LOOP, caption: 'imshow 로 올리고 → waitKey 가 그리고 키를 받는다 → 키에 따라 처리 → 반복', notes: '<p>그림을 따라 루프를 손가락으로 짚어 갑니다. 💬 “키를 안 누르면 waitKey(30) 은 무엇을 돌려줄까?” — -1. “ESC 는?” — 27. waitKey 가 창 그리기도 한다는 점이 핵심입니다. (4분)</p>' },
          { layout: 'bullets', title: 'namedWindow 와 waitKey 규칙', bullets: [
            '<b>창 이름 = 창 ID</b> — 같은 이름으로 imshow 하면 같은 창 갱신',
            '<code>namedWindow(n, WINDOW_NORMAL)</code> + <code>resizeWindow</code> → 큰 이미지',
            '<code>waitKey(0)</code> 무한 대기 · <code>waitKey(ms)</code> 키 없으면 <b>-1</b> · ESC = <b>27</b>',
            '화살표 키는 <code>waitKeyEx</code> (Windows ← 0x250000, → 0x270000)',
            '창 이름은 <b>영어</b>로 (Win32 창 제목에서 한글이 깨짐)'
          ], notes: '<p>VS 에서 WINDOW_AUTOSIZE 로 plate_holes(800×600)를 띄우면 괜찮지만 4K 카메라 이미지는 화면을 넘는다 — 그래서 WINDOW_NORMAL. 브라우저에서는 namedWindow 가 무시된다는 것도 알려 줍니다. (4분)</p>' },
          { layout: 'code', title: '슬라이드 쇼: 0.4초씩 보여 주기', code: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
using namespace cv;
using namespace std;

int main()
{
    vector<string> files = { "images/sample_color.png", "images/washers.png",
                             "images/coins_parts.png", "images/color_caps.png" };
    for (size_t i = 0; i < files.size(); i++)
    {
        Mat img = imread(files[i]);
        string caption = format("[%d/%d] ", (int)i + 1, (int)files.size()) + files[i];
        putText(img, caption, Point(10, 30), FONT_HERSHEY_SIMPLEX, 0.8, Scalar(0, 255, 255), 2);
        imshow("viewer", img);
        cout << caption << endl;
        if (waitKey(400) == 27) break;          // ESC 면 중단
    }
    destroyAllWindows();
    return 0;
}`, points: ['같은 창 <code>"viewer"</code> 를 계속 갱신', '<code>waitKey(400)</code>: 0.4초 표시 + 키 확인', '흑백 파일도 COLOR 로 읽어 색 글자'], notes: '<p>실행해 결과 창에서 이미지가 바뀌는 것을 봅니다. 실행 중 결과 창을 누르고 ESC 를 눌러 중단되는지 시도해 보게 합니다. (5분)</p>' },
          { layout: 'code', title: '키 처리 함수 분리', code: `#include <iostream>
using namespace std;
bool handleKey(int key, int& index, int count)
{
    switch (key)
    {
    case 'n': case ' ': index = (index + 1) % count; break;
    case 'p':           index = (index - 1 + count) % count; break;
    case 'g':           index = 0; break;
    case 'q': case 27:  return false;
    }
    return true;
}
int main()
{
    int index = 0;
    for (char c : string("nnnnpxgq"))
    {
        if (!handleKey(c, index, 4)) break;
        cout << c << " → " << index << endl;
    }
    return 0;
}`, points: ['키가 어디서 오든(waitKey · 문자열 · cin) 같은 규칙', '<code>% count</code> 로 순환, <code>+ count</code> 로 음수 방지', '<code>int&amp; index</code>: 참조로 받아 바꿈'], notes: '<p>💬 “index 가 0 일 때 p 를 누르면 (0 - 1) % 4 는?” — C++ 에서는 -1! 그래서 + count. 참조 매개변수(int&amp;)를 복습합니다. (6분)</p>' },
          { layout: 'code', title: '완성 뷰어 (Visual Studio)', code: `#include <opencv2/opencv.hpp>
#include <vector>
using namespace cv;
using namespace std;
int main()
{
    vector<string> files = { "images/sample_color.png", "images/washers.png" };
    int index = 0, saved = 0;
    namedWindow("viewer", WINDOW_NORMAL);
    while (true)
    {
        Mat img = imread(files[index]);
        imshow("viewer", img);
        int key = waitKeyEx(0);
        if (key == 27) break;
        else if (key == 'n' || key == 0x270000) index = (index + 1) % (int)files.size();
        else if (key == 'p' || key == 0x250000) index = (index - 1 + (int)files.size()) % (int)files.size();
        else if (key == 's') imwrite(format("capture_%02d.png", saved++), img);
    }
    destroyAllWindows();
    return 0;
}`, run: false, local: true, file: 'main.cpp', points: ['로컬에서는 <code>waitKeyEx(0)</code> 이 실제로 기다림', '→ ← 화살표 · n/p · s 저장 · ESC', '브라우저에서는 무한 루프가 되므로 실행 금지'], notes: '<p>교사 PC 의 VS 에서 미리 빌드한 뷰어를 시연합니다. 화살표 키 코드가 운영체제마다 다르다는 점(Windows 기준)을 언급합니다. (4분)</p>' },
          { layout: 'code', title: 'cin 으로 번호 입력', code: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
using namespace cv;
using namespace std;

int main()
{
    vector<string> files = { "images/sample_color.png", "images/washers.png",
                             "images/coins_parts.png", "images/plate_holes.png" };
    int idx;
    while (true)
    {
        cout << "번호 (-1 = 끝): ";
        if (!(cin >> idx) || idx < 0) break;
        cout << endl;
        if (idx >= (int)files.size()) { cout << "범위 밖" << endl; continue; }
        Mat img = imread(files[idx]);
        cout << files[idx] << " → " << img.size() << endl;
        imshow("viewer", img);
        waitKey(1);
    }
    return 0;
}`, points: ['<code>!(cin &gt;&gt; idx)</code>: 입력 실패 · 끝이면 종료', '범위 검사 후 <code>continue</code>', '<code>waitKey(1)</code>: 그리기만 하고 넘어감'], notes: '<p>편집기에서 실행하면 결과 창 아래 입력칸에 숫자를 직접 넣을 수 있습니다. 문자(abc)를 넣으면 어떻게 되는지 💬 — cin 실패 → 종료. (4분)</p>' },
          { layout: 'two', title: '마우스 콜백 · 트랙바의 구조', left: { title: '🖱 setMouseCallback', run: false, code: `void onMouse(int event, int x, int y,
             int flags, void* userdata)
{
    if (event != EVENT_LBUTTONDOWN) return;
    Mat& img = *static_cast<Mat*>(userdata);
    Vec3b px = img.at<Vec3b>(y, x);  // (y, x)!
}
// main: setMouseCallback("w", onMouse, &img);` }, right: { title: '🎚 createTrackbar', run: false, code: `void onThresh(int pos, void* userdata)
{
    AppData& d = *static_cast<AppData*>(userdata);
    threshold(d.gray, d.binary, pos, 255,
              THRESH_BINARY);
    imshow("binary", d.binary);
}
// main: createTrackbar("thresh", "binary",
//            &value, 255, onThresh, &d);` }, notes: '<p>두 콜백의 공통 구조: <b>정해진 함수 모양 + void* userdata 로 데이터 전달</b>. 💬 “userdata 가 없다면 Mat 을 어떻게 넘길까?” — 전역 변수(나쁜 습관). static_cast 로 원래 형식으로 되돌리는 부분을 강조합니다. 둘 다 브라우저에서는 동작하지 않으므로 VS 로 시연. (6분)</p>' },
          { layout: 'code', title: '브라우저 버전: 값 목록으로 트랙바 흉내', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/washers.png", IMREAD_GRAYSCALE);
    int values[] = { 60, 120, 180, 230 };
    for (int v : values)
    {
        Mat binary;
        threshold(gray, binary, v, 255, THRESH_BINARY);
        double white = 100.0 * countNonZero(binary) / binary.total();
        cout << format("임계값 %3d → 흰 픽셀 %5.1f %%", v, white) << endl;
        imshow("binary", binary);
        waitKey(300);
    }
    return 0;
}`, points: ['콜백이 할 일을 반복문으로', '60~180 에서는 거의 그대로 → 230 에서 급감', '07차시 이진화 예고'], notes: '<p>💬 “왜 60~180 사이에서는 비율이 거의 안 변할까?” — 부품(≈18)과 배경(≈241) 사이의 빈 구간. 히스토그램(06차시) · Otsu(07차시)로 연결합니다. (4분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '마우스 콜백에서 클릭한 픽셀을 읽는 올바른 코드는?', options: ['<code>img.at&lt;Vec3b&gt;(x, y)</code>', '<code>img.at&lt;Vec3b&gt;(y, x)</code>', '<code>img.at&lt;uchar&gt;(x, y)</code>', '<code>img(x, y)</code>'], answer: 1, explain: '콜백은 (x, y), at 은 (행 y, 열 x).', notes: '<p>정답 2번. 00차시부터 반복되는 좌표 순서 규칙을 한 번 더 확인합니다.</p>' },
          { layout: 'practice', title: '실습: e · 숫자 키 추가', desc: '<p><code>handleKey</code> 에 키를 추가하세요.</p><ul><li><b>e</b> = 마지막 이미지</li><li><b>1~9</b> = 그 번호 (범위 밖은 무시)</li><li>키 목록 <code>"e3n9p1q"</code> 로 시험</li></ul>', starter: P3_KEYS_START, solution: P3_KEYS_SOL, notes: '<p><code>key - \'1\'</code> 로 번호를 만드는 요령을 힌트로 줍니다. 빨리 끝낸 학생은 실습 2(cin 임계값)로. (6분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['<b>waitKey</b> = 창 그리기 + 키 받기 — 반환값: 키 코드 · 없으면 -1 · ESC 27', '창 이름 = 창 ID · 큰 이미지는 <code>WINDOW_NORMAL</code> · 이름은 영어로', '키 처리를 <b>함수로 분리</b> → waitKey · 문자열 · cin 어디서든 시험', '마우스 콜백 · 트랙바 = 정해진 함수 모양 + <code>void*</code> userdata (VS 전용)', '다음 차시: Mat 과 픽셀 — 이미지 자료 구조 깊이 보기'], notes: '<p>02차시 전체 정리: 읽기(empty 검사) → 보기(imshow/waitKey) → 저장(imwrite) → 창과 키. 과제: VS 에서 키보드 뷰어를 완성해 s 키로 저장한 파일을 제출. (2분)</p>' }
        ]
      }
    ]
  });
})();
