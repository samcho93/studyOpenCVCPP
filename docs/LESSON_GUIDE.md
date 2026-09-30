# 차시 콘텐츠 작성 가이드 (C++ 로 배우는 OpenCV 5 강좌)

사이트는 **3단 화면** 하나(`index.html`)로 동작합니다.
- 왼쪽: 목차(Part → 차시 → 교시), 학생용/교사용 전환, 🧰 VS 프로젝트 · 📁 작업 폴더
- 가운데: 🎓 학생용 = 문서(개념 · 그림 · 예제 · 실습 · 퀴즈) + 아래 **C++ 코드 편집기** / 🧑‍🏫 교사용 = **PPT 슬라이드** + 교사 노트 + 판서
- 오른쪽: **결과 창** — 컴파일 오류(줄 이동) · `cout` 출력 · `imshow` 이미지 창(좌표 · 픽셀 값 · 확대)

각 차시는 `lessons/cvNN.js` 파일 하나이며 `CV_COURSE.addChapter({...})` 를 한 번 호출합니다.
형식은 브라우저 스크립트입니다 (import/export 금지, 전역 변수 금지 → `(function(){ ... })();` 안에서 상수 정의).
**완성 예시: `lessons/cv00.js` 를 반드시 먼저 읽고 같은 스타일로 작성하세요.**
C# 판 강좌(`D:\Work\Web\studyOpenCVCSharp\lessons\csNN.js`)의 같은 번호 차시가 내용 · 순서 · 그림 · 퀴즈의 원본입니다. **C# 코드를 C++ OpenCV 5 코드로 바꾸고**, WPF 부분은 C++(highgui · 클래스 설계 · Visual Studio 프로젝트)로 바꿉니다.
`js/course.js` 의 `order` 에 차시 id(`cv00`~`cv17`), 제목, **교시 수(hours)** 가 있습니다. 교시 수를 지키세요.

## 0. 이 강좌의 방향 (가장 중요)

- 대상: C++ 을 조금 아는(변수 · 반복 · 함수 · 클래스 · vector) 학생. **OpenCV 5.0 C++ API** 를 익히고 **Visual Studio** 프로젝트로 완성하는 것이 목표.
- **모든 OpenCV 예제는 브라우저에서 컴파일 · 실행되는 C++ 코드**로 씁니다 (`#include <opencv2/opencv.hpp>` + `using namespace cv;` + `int main()`). 개념은 짧고 정확하게 → 곧바로 실행해 보는 예제 → 값을 바꿔 보는 실습.
- **로컬 전용 코드**(마우스 콜백 · 트랙바 · 실제 카메라 · 동영상 파일 쓰기 · 프로젝트 설정 파일)는 `run: false, local: true` 로 표시하고, 같은 처리를 하는 **브라우저 실행 버전을 반드시 함께** 둡니다. 완성 솔루션은 `vs/` 폴더.
- 예제 이미지는 `assets/images/*.png` (합성 이미지, 코드에서는 `"images/이름.png"`). **`assets/IMAGES.md` 에 이미지별 내용과 정답(개수 · 좌표 · 색)** 이 있습니다. 반드시 읽고 정답과 맞는 결과가 나오는 예제를 쓰세요.
- 용어는 한국어 + 영어 병기(예: 이진화(Thresholding), 윤곽선(Contour)). Python(cv2) 이름과 대응을 한 번씩 알려 주면 좋습니다.
- 💡 팁 · ⚠️ 주의(흔한 실수: BGR 순서, (y, x) 순서, 채널 수, 커널 홀수, `uchar` 출력 시 `(int)`, 얕은 복사 vs `clone()`, Debug/Release 라이브러리 `d` 접미사) · 🧰 Visual Studio 에서는 · 📘 더 알아보기를 자주 넣습니다.

## 1. 구조

```js
(function () {
  const FIG_X = `<svg ...>...</svg>`;        // 그림은 상수로 만들어 content 와 slides 에서 함께 사용
  const EX1 = `#include <opencv2/opencv.hpp> ...`;   // 예제 코드도 상수로 → 본문 · 슬라이드에서 재사용
  const QUIZ = [ {q, options, answer, explain}, ... ];

  CV_COURSE.addChapter({
    id: 'cv07', no: '07', title: '...', subtitle: '...',
    summary: '차시 요약 (html)',
    goals: ['차시 학습 목표', ...],
    vs: 'Ch07_Threshold',                    // (선택) vs/ 폴더의 관련 프로젝트 이름 — 실제로 있을 때만
    sections: [ /* 교시 = 50분 1개, course.js 의 hours 개수만큼 */ ]
  });
})();
```

섹션(교시):
```js
{ id: 'cv07-1', title: '교시 제목', minutes: 50,
  goals: ['...'], flow: [['도입', 5], ['개념', 15], ['실습', 20], ['정리', 10]],   // 합계 = minutes
  content: [ /* 본문 블록 */ ], practice: [ /* 실습 1~3 */ ], quiz: [ /* 퀴즈 3~5 */ ], slides: [ /* 슬라이드 8~14장 */ ] }
```
섹션 id 는 반드시 `'차시id-번호'` (예: `cv07-2`).

## 2. 본문 블록 (`content`)

| type | 필드 | 설명 |
|---|---|---|
| `h` | `text` | 소제목 |
| `p` | `html` | 문단 |
| `list` | `items`, `ordered?` | 목록 |
| `table` | `head`, `rows`, `caption?` | 표 |
| `figure` | `html`(인라인 SVG), `caption` | 그림 |
| `image` | `src`(예: `'images/sample_color.png'`), `caption`, `width?` | 예제 이미지 보여 주기 |
| `code` | `title`, `code`, `lang?`, `file?`, `desc?`, `expect?`, `stdin?`, `run?`, `local?`, `nondeterministic?` | **코드 (C++ 은 브라우저에서 컴파일 · 실행)** → 3절 |
| `callout` | `kind: tip/warn/info/more/vs/field`, `title?`, `html` | 강조 상자 (`vs` = 🧰 Visual Studio, `more` = 📘 더 알아보기, `field` = 🏭 현장 노트) |
| `project` | `title`, `html`, `project?` | 🧰 Visual Studio 프로젝트 안내 (project = `vs/` 폴더 이름 → GitHub 링크, 실제로 있을 때만) |

어떤 블록이든 `teacher: true` 를 붙이면 **교사용 화면에서만** 보입니다 (수업 준비 체크리스트, 평가 루브릭 등 — 보통 마지막 교시 끝에).

**원칙: 문제 → 원리(그림) → 코드 → 결과 해석 → 흔한 실수/팁.** 수식은 HTML(`<sub>`, `<sup>`, `∑`, `√`, `θ`, `×`)로 씁니다.

## 3. 코드 (가장 중요)

### 3.1 형식
```js
{ type: 'code', title: '예제 2: Otsu 이진화', desc: '해석 (html)',
  code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat bin;
    double t = threshold(img, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    cout << "Otsu 임계값: " << t << endl;
    imshow("binary", bin);
    waitKey(0);
    return 0;
}`,
  expect: 'Otsu 임계값: 125' }
```
- `int main()` 이 있는 완전한 프로그램을 기본으로 씁니다 (Visual Studio 의 main.cpp 에 그대로 붙일 수 있게). `main` 이 없는 짧은 조각(함수 · 클래스 선언만)은 실행하지 않고 보여 주기만 합니다.
- 여러 파일: `// ===== File: Filter.h =====` 구분 주석으로 한 편집기에 여러 파일을 넣을 수 있습니다 (`.h/.hpp/.cpp`, `.txt` 는 데이터 파일).
- **실행하지 않는 코드**: `run: false`. **로컬 전용 코드**(마우스 콜백 · 트랙바 · 실제 카메라 · VideoWriter · selectROI): `run: false, local: true` → “🖥 Visual Studio 에서 실행” 표시. `file: 'main.cpp'` 로 파일 이름을 적어 주세요.
- **프로젝트 설정 · 명령**: `.vcxproj` · `.props` → `lang:'xml'`, `CMakeLists.txt` → `lang:'cmake'`, 명령 프롬프트 · PowerShell → `lang:'sh'`, 기타 `lang:'txt'`. `lang` 기본값은 `cpp`.
- `expect` 는 실제 실행 출력(검증 도구 `--print` 로 얻음). 이미지 창만 있는 예제는 `expect` 생략 가능.

### 3.2 브라우저 실행 환경에서 되는 것
- **C++17 표준 라이브러리 전체**: iostream · iomanip · string · vector · map · set · algorithm · numeric · memory(unique_ptr/shared_ptr) · functional · 람다 · 예외 · 템플릿 · 클래스/상속/가상 함수 · fstream(작업 폴더 파일) · chrono. `cin` 입력은 `stdin` 필드로 예시 입력을 줄 수 있습니다.
- **OpenCV 5.0 C++ API**(`runtime/include/opencv2/cvshim.hpp` 에 선언된 것 — 모르면 헤더를 grep 하세요):
  - core: `Mat`(생성 · `at<T>` · `ptr<T>` · ROI `img(Rect)` / `Mat(img, rect)` · `row/col/rowRange/colRange` · `clone` · `copyTo(dst, mask)` · `convertTo` · `setTo` · `reshape` · `t()` · `inv()` · `mul()` · `Mat::zeros/ones/eye` · 반복자 `begin<T>()` · `forEach`) · `Mat_<T>` + 쉼표 초기화 `(Mat_<float>(3,3) << ...)` · 산술 연산자(`+ - * / & | ~ > <` …, 포화 연산) · `Scalar` · `Point/Point2f/Point2d/Point3f` · `Size` · `Rect` · `RotatedRect` · `Range` · `Vec3b/Vec3f/Vec4i` … · `saturate_cast` · `RNG` · `TickMeter` · `getTickCount` · `format` · `typeToString` · `cout << mat`(OpenCV 형식 출력) · `cv::Exception`
  - 함수: split/merge · add/subtract/multiply/divide/addWeighted/absdiff · bitwise_* · compare · inRange · min/max · minMaxLoc · mean/meanStdDev · sum · countNonZero · findNonZero · normalize · norm · LUT · flip/rotate/transpose/repeat/hconcat/vconcat · copyMakeBorder · gemm/invert/solve/determinant · dft · kmeans · randu/randn
  - imgproc: cvtColor · threshold · adaptiveThreshold · blur/boxFilter/GaussianBlur/medianBlur/bilateralFilter · filter2D/sepFilter2D · Sobel/Scharr/Laplacian/Canny · erode/dilate/morphologyEx/getStructuringElement · resize/pyrDown/pyrUp · warpAffine/warpPerspective/getRotationMatrix2D/getAffineTransform/getPerspectiveTransform/remap · equalizeHist · createCLAHE · calcHist/compareHist/calcBackProject · integral · distanceTransform · connectedComponents(WithStats) · findContours/drawContours · contourArea/arcLength/approxPolyDP/boundingRect/minAreaRect/minEnclosingCircle/fitEllipse/fitLine/convexHull/convexityDefects/moments/HuMoments/matchShapes/pointPolygonTest · HoughLines/HoughLinesP/HoughCircles · matchTemplate · cornerHarris/goodFeaturesToTrack · floodFill · watershed · grabCut · applyColorMap · 그리기(line · arrowedLine · rectangle · circle · ellipse · polylines · fillPoly · fillConvexPoly · drawMarker · putText · getTextSize)
  - imgcodecs/highgui: imread(IMREAD_* 플래그) · imwrite(📁 작업 폴더에 저장) · imencode/imdecode(PNG) · imshow · waitKey · destroyWindow/destroyAllWindows · namedWindow(무시)
  - videoio: `VideoCapture cap(0)` → **컨베이어 시뮬레이션 영상** (60프레임 뒤 `read` 가 false), `VideoCapture("conveyor.mp4")` → 20프레임 영상 · `get(CAP_PROP_FRAME_WIDTH …)`
  - features: `ORB::create` · `detect/compute/detectAndCompute` · `FastFeatureDetector` · `BFMatcher`(`match` · `knnMatch`) · `drawKeypoints` · `drawMatches` · `KeyPoint` · `DMatch`
  - geometry: `findHomography` · `perspectiveTransform` · `estimateAffine2D`
  - video: `createBackgroundSubtractorMOG2` · `calcOpticalFlowPyrLK` · `calcOpticalFlowFarneback` · `meanShift` · `CamShift`
  - objdetect/photo: `QRCodeDetector` · `inpaint`
- `waitKey(0)` 은 브라우저에서 기다리지 않고 바로 돌아옵니다 (키가 있으면 그 키). 카메라 반복에서는 `waitKey(30)` 이 30ms 쉬며 화면을 갱신합니다. **반복은 반드시 끝나게** 쓰세요 (`while (cap.read(frame))` 은 60프레임 뒤 false).
- **안 되는 것**: `setMouseCallback` · `createTrackbar` · `selectROI`(경고만 나오고 무시), `std::thread`, 실제 웹캠 · 동영상 파일 · `VideoWriter`(프레임 수만 셈), `dnn` · `ml` · `CascadeClassifier` · 카메라 보정(`findChessboardCorners`, `calibrateCamera`) · `fastNlMeansDenoising` · `cornerSubPix`(좌표 그대로) · `cv::sort`. 이런 코드는 `run: false, local: true`.
- ⚠️ 코드 문자열은 JS 템플릿 문자열 안에 있으므로 **`${` 금지, 백틱 금지**, 역슬래시는 두 번(`\\n`, `"\\t"`). 정규식이나 경로의 `\` 도 `\\`.
- 출력은 결정적으로: 난수는 `RNG rng(12345);` 처럼 시드를 고정하되 **난수 값 자체는 expect 에 넣지 말 것**(실제 OpenCV 와 다를 수 있음). 실수는 `format("%.2f", v)` 또는 `fixed << setprecision(2)` 로 자릿수 고정. 시간 측정값은 expect 에 넣지 말 것(`nondeterministic: true`).
- `cout << mat` 은 OpenCV 형식(`[  1,   2;\n   3,   4]`)으로 출력됩니다. `uchar` 값은 반드시 `(int)` 로 바꿔 출력.
- 각 예제 **실행 시간 3초 이내**. C++ 로 컴파일되므로 640×480 픽셀 이중 반복은 충분히 빠릅니다 (컴파일에 몇 초가 걸리는 것은 별개).

### 3.3 실습(practice)
```js
{ title, level: 1~3, desc: 'html', hint?: 'html',
  starter: `...`,     // 컴파일 오류 없이 실행되는 뼈대 (// TODO)
  solution: `...`,    // 완전한 정답 (교사용에서만 보임)
  expect?: '...' }
```
섹션마다 1~3개.

## 4. 그림 (SVG)

- 인라인 SVG, CSS 클래스만 사용: `.p1~.p5`(채움) `.p1s~.p5s`(옅은 채움) `.s1~.s5`(선) `.ln` `.ax` `.tx` `.tx-m` `.tx-b` `.tx-w` `.card-bg` `.fill-arrow`. **하드코딩 색 금지** (테마 전환).
- `<marker id>` 등 SVG 안의 id 는 **차시 접두어로 고유하게** (예: `c07a1`).
- Mat 메모리 배치(행 · 열 · 채널 · step), 헤더/데이터 공유, BGR 순서, (x, y) vs (행, 열), 커널 슬라이딩, 이진화 곡선, HSV 원기둥, 어파인 변환, 윤곽 계층, 클래스 다이어그램 같은 그림을 적극적으로 그립니다. viewBox 폭 640~760.

## 5. 퀴즈

`{ q: 'html', options: ['..','..','..','..'], answer: 0부터, explain: 'html' }` — 섹션마다 3~5문항. q 의 코드는 `<code>`, `<` 는 `&lt;`.

## 6. 교사용 슬라이드 (`slides`)

한 장 = 객체 하나, **모든 슬라이드에 `notes`**(교사 노트: 말할 내용, 💬 발문과 예상 답, 주의점, 시간). 섹션당 8~14장.
첫 장 뒤에 “학습 목표 + 수업 흐름” 슬라이드가 자동으로 들어갑니다.

| layout | 필드 |
|---|---|
| `title` | `title`, `subtitle?` — 섹션 첫 장 |
| `bullets` | `title`, `bullets: [html \| [html, [하위…]]]`, `lead?` — 불릿 3~6개 |
| `code` | `title`, `code`, `lang?`, `file?`, `run?`, `local?`, `points?: [html 2~4개]` — **24줄** 이내(#include · main 포함), 실행 가능 |
| `two` | `title`, `left: {title, bullets?/html?/code?, lang?}`, `right: {...}` |
| `table` | `title`, `head`, `rows`, `lead?` |
| `diagram` | `title`, `html`(SVG), `caption?` |
| `image` | `title`, `src`(`images/….png`), `caption?` |
| `quiz` | `title`, `q`, `options`, `answer`, `explain` |
| `practice` | `title`, `desc`, `starter`, `solution` |
| `summary` | `title`, `bullets` — 섹션 마지막 장 |

권장 흐름: `title` → 문제 제기(image/bullets) → 원리(diagram) → 예제(code) → … → quiz → practice → summary.
슬라이드 코드가 길면 `using namespace` 뒤 빈 줄을 줄이고 핵심만 남기세요.

## 7. 검증 (필수)

```bash
node tools/validate.mjs cv07              # 스키마 + 모든 C++ 코드를 브라우저와 같은 컴파일러 + OpenCV 로 컴파일 · 실행, expect 비교
node tools/validate.mjs cv07 --print      # 실제 출력 보기 (expect 작성용)
node tools/try.mjs 파일.cpp               # 코드 하나 시험 실행
```
오류 0 이 될 때까지 고치세요 (경고 “expect 없음”은 괜찮지만, 결정적 출력이면 expect 를 넣으세요).
결과는 `tools/.cache/` 에 캐시되므로 바뀐 코드만 다시 컴파일됩니다 (코드 1개 컴파일 5~10초).
`run:false` · 코드 조각은 실행하지 않습니다. `local:true` 이면서 `main` 이 있는 코드는 컴파일만 시도해 실패하면 경고합니다(로컬 전용 API 가 없으면 정상).
브라우저 헤더에 없는 OpenCV 함수가 꼭 필요하면 직접 추가하지 말고 보고하세요 (`runtime/include/` 와 `js/cv-bridge.js` 를 함께 고쳐야 함).
