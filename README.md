# C++ 로 배우는 OpenCV 5 — 웹 실습 강좌

🌐 **https://samcho93.github.io/studyOpenCVCPP/** (학생용: `student.html`, 교사용: `teacher.html`)

Visual Studio 에 **OpenCV 5.0 을 설치 · 설정**하는 것부터 Mat · 색 공간 · 이진화 · 필터 · 모폴로지 · 에지 · 기하 변환 · 윤곽선 · 허프 변환 · 템플릿 매칭 · 특징점 · 카메라까지 익히고, 마지막에 **클래스로 설계한 이미지 처리 도구**와 **실전 검사 프로젝트**를 완성하는 18차시(39교시) 강좌입니다.

## 특징
- **브라우저에서 C++ OpenCV 코드를 진짜로 컴파일 · 실행**: 저장소에 들어 있는 Clang/LLD 컴파일러(WebAssembly)가 `#include <opencv2/opencv.hpp>` 코드를 C++17 프로그램으로 컴파일합니다. `cv::Mat` · `Point` · `Rect` · `Vec3b` 등은 실제 C++ 클래스로 동작하고(픽셀 접근 · ROI · 참조 계수), `cvtColor` · `threshold` · `findContours` 같은 알고리즘은 **OpenCV.js 5.0** 이 계산합니다. 설치 없이 예제를 고쳐 실행하고, `imshow` 결과를 이미지 창(좌표 · 픽셀 값 · 확대)으로 봅니다.
- **학생용 / 교사용** 두 화면: 학생용은 문서(개념 · 그림 · 예제 · 실습 · 퀴즈), 교사용은 16:9 PPT 슬라이드 + 교사 노트 + 판서(펜 · 형광펜 · 지우개 · 지시봉) + 수업 타이머 + 발표자 창.
- **Visual Studio 솔루션** `vs/`: 공통 속성 시트 `OpenCV5.props`, 시작 프로젝트, 웹캠 뷰어, 이미지 처리 도구, 검사 프로그램.
- 예제 이미지 64장(합성 산업 이미지, `assets/images`, 정답은 `assets/IMAGES.md`).

## 로컬에서 열기
```bash
start.bat                       # Windows: 파이썬 로컬 서버 → http://localhost:8080/student.html
python server/serve.py --lan    # 같은 네트워크의 학생 PC 가 교사 PC 로 접속
```
파일을 직접(`file://`) 열면 컴파일러 · OpenCV 를 불러올 수 없습니다. GitHub Pages 주소로 열면 서버가 필요 없습니다.
처음 실행할 때 컴파일러(약 110MB)와 OpenCV.js(약 16MB)를 한 번 내려받고, 이후에는 브라우저 캐시를 씁니다. 최신 Chrome · Edge(137+) · Firefox(131+) · Safari(18.4+) 가 필요합니다(WebAssembly 예외 처리).

## 폴더 구조
| 경로 | 내용 |
|---|---|
| `index.html` · `js/app.js` · `js/slides.js` · `js/annotate.js` | 화면 · 문서 · 슬라이드 · 판서 |
| `js/course.js` · `lessons/cvNN.js` | 커리큘럼과 차시 내용 (`CV_COURSE.addChapter`) |
| `js/cv-engine.js` · `js/cpp-worker.js` · `js/cpp-common.mjs` | 컴파일 워커 (Clang) |
| `js/cv-run-worker.js` · `js/wasi.js` · `js/cv-bridge.js` · `js/cv-host.js` | 실행 워커 (WASI · OpenCV.js 브리지 · PNG · 카메라 시뮬레이션) |
| `runtime/include/opencv2/cvshim.hpp` · `runtime/include/cvshim_impl.cpp` · `runtime/cvshim.o` | OpenCV 5.0 C++ API (헤더 + 미리 컴파일한 구현) |
| `runtime/clang/` · `runtime/opencv.js` | Clang/LLD (WebAssembly, YoWASP) · OpenCV.js 5.0 |
| `vs/` | Visual Studio 2022/2026 솔루션 (x64, C++17) |
| `tools/` | 차시 검증(`validate.mjs`) · 한 파일 실행(`try.mjs`) · 구현 빌드(`build-shim.mjs`) |
| `docs/LESSON_GUIDE.md` | 차시 작성 가이드 |

## 차시 검증
```bash
node tools/validate.mjs                 # 모든 차시: 스키마 + 모든 C++ 예제 컴파일 · 실행 + expect 비교
node tools/validate.mjs cv07 --print    # 실제 출력 보기
node tools/try.mjs tools/tests/api.cpp  # OpenCV API 점검
node tools/build-shim.mjs               # runtime/include 를 고친 뒤 runtime/cvshim.o 다시 만들기
```

## 교사용 화면
왼쪽 위 **🧑‍🏫 교사용** 버튼 → 비밀번호(`js/course.js` 의 `teacherPass`, 기본값 `cv2026`). 단축키: `F` 전체 화면, `← →` 이동, `G` 목록, `N` 노트, `T` 타이머, `B` 검은 화면, `R` 결과 패널, `Ctrl+Z` 판서 되돌리기.

## 라이선스 · 출처
- OpenCV · OpenCV.js: Apache 2.0 (https://opencv.org).
- Clang/LLVM: Apache 2.0 with LLVM Exception, WebAssembly 빌드는 YoWASP (https://yowasp.org), wasi-sdk.
- 예제 이미지는 numpy + OpenCV 로 만든 합성 영상입니다.
