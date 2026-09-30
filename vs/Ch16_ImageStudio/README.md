# Ch16_ImageStudio — 16차시 이미지 처리 도구 (클래스 설계)

필터 9종을 키보드로 적용하고, 되돌리기(undo) · 다시 실행(redo) · 저장 · 다른 이미지에 같은 처리 반복(replay)이 되는 작은 이미지 편집 도구입니다.
처리 로직(`Filter` · `Pipeline` · `History` · `Studio::execute`)은 강좌 3교시 예제 3(브라우저에서 `cin` 명령으로 실행하는 판)과 **같은 코드**이고, 이 프로젝트는 입력 장치만 **키보드 + 트랙바**로 바꾼 것입니다.

## 실행 방법

1. 솔루션 폴더(`vs/`)에 강좌 저장소의 `assets/images` 를 **`images`** 라는 이름으로 복사합니다 (작업 폴더 = 솔루션 폴더, `OpenCV5.props` 참고).
2. `studyOpenCVCPP.sln` 에서 `Ch16_ImageStudio` 를 오른쪽 클릭 → **시작 프로젝트로 설정** → **F5** (x64 Debug 또는 Release).
3. "Image Studio" 창에 **원본 | 현재** 비교 화면과 아래 상태 줄(undo · redo 개수, 레시피)이 보입니다. 창을 클릭해 포커스를 준 뒤 키를 누르세요.
4. 실행 인수로 이미지 경로를 주면 그 이미지로 시작합니다 (프로젝트 속성 → 디버깅 → 명령 인수).

## 단축키

| 키 | 명령 | 키 | 명령 |
|---|---|---|---|
| `1` | gray | `z` | undo (되돌리기) |
| `2` | blur (트랙바 `kernel`) | `y` | redo (다시 실행) |
| `3` | median (트랙바 `kernel`) | `r` | reset (원본으로) |
| `4` | thresh (트랙바 `thresh`, 0 = Otsu) | `i` · `h` | info · history (콘솔 출력) |
| `5` | canny 50 150 | `s` | save → `studio_001.png`, `studio_002.png` … |
| `6` | sharpen 1.0 | `o` | 다음 예제 이미지 열기 |
| `7` | bc 1.2 10 (밝기 · 대비) | `c` | 콘솔에서 명령 직접 입력 (예: `replay images/washers.png out.png`, `morph close 7`) |
| `8` | morph open (트랙바 `kernel`) | `?` | 도움말 |
| `9` | invert | `ESC` | 끝내기 (창의 X 로 닫아도 끝남) |

커널 크기는 짝수 · 3 미만이면 자동으로 3 이상 홀수로 보정됩니다 (`Blur(5)` 처럼 이름에 실제 값이 보임).

## 파일 구성

| 파일 | 역할 |
|---|---|
| `Filter.h` | 추상 클래스 `Filter`(`virtual Mat apply(const Mat&) const = 0`, `name()`) + 필터 9종 선언 · 팩토리 선언 `makeFactory()` |
| `Filters.cpp` | 필터 `apply` 정의(Gray · Blur · Median · Thresh · Canny · Sharpen · BC · Morph · Invert), 팩토리 `map<string, function<unique_ptr<Filter>(istringstream&)>>` |
| `Pipeline.h` | `vector<unique_ptr<Filter>>` 를 소유 — `add` · `popBack` · `run` · `describe` (레시피) |
| `History.h` | 스냅숏(`Mat` + 이름) undo/redo 스택, `clone` 으로 보관, 깊이 제한 20 (`deque::pop_front`) |
| `main.cpp` | `sideBySide`(hconcat + putText), `Studio` 클래스(명령 해석기 `execute`), 키보드 루프 `runKeyboardUI`, `main` |

## 코드에서 볼 것

- **필터 약속**: 입력(src)을 바꾸지 않고 항상 새 Mat 반환, 1 · 3채널 모두 처리 (Canny · Thresh 는 안에서 `toGray`)
- **소유권**: 팩토리가 만든 `unique_ptr<Filter>` → 적용 후 `recipe_.add(std::move(f))` → undo 때 `popBack()` 으로 `redoFilters_` 에 보관 → redo 때 되돌려 놓음
- **clone**: `History::push/reset` 은 `img.clone()` 을 보관 (호출한 쪽의 제자리 처리 · 화면 그리기가 기록을 망치지 않게)
- **한 곳에서 처리**: 키 → 명령 문자열 → `Studio::execute` → 예외는 루프에서 `cv::Exception` → `std::exception` 순으로 catch
- **창 닫기**: `waitKey(50)` 이 −1 이면 `getWindowProperty(WIN, WND_PROP_VISIBLE)` 로 창이 닫혔는지 확인

## 과제 아이디어

- 새 필터 추가: `SepiaFilter`(`transform` 3×3 색 행렬) · `EmbossFilter`(`filter2D`) · `ClaheFilter`(`createCLAHE`) → `Filters.cpp` 팩토리에 한 줄 등록 → 키 `0` 에 연결
- `saverecipe 파일` / `loadrecipe 파일` 명령: 레시피를 명령 문자열로 텍스트 파일에 저장하고 다시 읽기 (17차시 검사 레시피)
- 트랙바 콜백으로 즉시 미리보기(History 에는 넣지 않고 키로 확정)

## 관련 차시

- 16차시 이미지 처리 도구 만들기 (클래스 설계)
- 05(색 공간) · 06(산술 · 비트 연산) · 07(이진화) · 08(필터링) · 09(모폴로지) · 10(에지) 차시의 함수를 한 도구에 모음
