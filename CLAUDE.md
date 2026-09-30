# studyOpenCVCPP — C++ 로 배우는 OpenCV 5 웹 강좌

GitHub Pages 정적 사이트 (`index.html` 하나 + `lessons/*.js`). 서버 없이 동작하며, C++ 코드는 브라우저 안의 **Clang(WebAssembly)** 으로 진짜 컴파일되고 OpenCV 알고리즘은 **OpenCV.js 5.0** 이 계산한다.

## 구조
- `js/course.js` 커리큘럼 → `lessons/cvNN.js` 가 `CV_COURSE.addChapter()` 로 내용 등록
- `js/app.js` 문서 UI · `js/slides.js` 교사용 슬라이드 · `js/annotate.js` 판서 · `js/runner.js` 결과 창 · `js/imageview.js` 이미지 창
- 실행 엔진: `js/cv-engine.js`(메인) → `js/cpp-worker.js`(Clang 컴파일, `js/cpp-common.mjs`) + `js/cv-run-worker.js`(WASI `js/wasi.js` + `js/cv-bridge.js` + `runtime/opencv.js`)
- OpenCV C++ API: `runtime/include/opencv2/cvshim.hpp`(헤더) + `runtime/include/cvshim_impl.cpp` → **`node tools/build-shim.mjs` 로 `runtime/cvshim.o` 재생성** (헤더 · 구현을 바꾸면 `js/cpp-common.mjs` 의 `SHIM_VERSION` 도 올린다)
- C++ `detail::Call` → WebAssembly import `cv` → `js/cv-bridge.js` 의 함수 표 `F[이름]` 이 OpenCV.js 호출
- `assets/images` 예제 이미지(정답은 `assets/IMAGES.md`), `vs/` Visual Studio 솔루션, `tools/` 검증 · 테스트

## 차시 작성 · 검증
- 반드시 `docs/LESSON_GUIDE.md` 와 `lessons/cv00.js` 를 먼저 읽는다. C# 판(`../studyOpenCVCSharp/lessons/csNN.js`)이 내용 원본.
- `node tools/validate.mjs cv07` (오류 0 이 되어야 함), `--print` 로 실제 출력 확인 후 `expect` 작성. 한 파일 실행: `node tools/try.mjs a.cpp`. API 점검: `node tools/try.mjs tools/tests/api.cpp`.
- 로컬 확인: `python server/serve.py --port 8093` → http://localhost:8093 (또는 `start.bat`).

## 규칙
- 커밋 메시지 · UI 문구는 한국어. 커밋은 작업 단위마다 자주, `main` 에 바로 푸시 (GitHub Pages: samcho93.github.io/studyOpenCVCPP).
- 코드 문자열 안에 `${` · 백틱 금지 (JS 템플릿 문자열). 로컬 전용 코드는 `run: false, local: true`.
