# Ch17_Inspection — 실전 검사 프로그램 (17차시 완성 프로젝트)

**개수 세기 · 색 분류 · 결함 검사** 세 검사기를 하나의 인터페이스(`Inspector`)로 묶어 예제 이미지들을 **일괄 검사**하고,
OK / NG 판정 표 · CSV 리포트 · NG 근거 이미지를 남긴 뒤, 결과 오버레이를 창에서 한 장씩 넘겨 보는 콘솔 + highgui 프로그램입니다.
검사 로직은 모두 `Inspectors/` 폴더의 클래스에 있고, `main.cpp` 는 “무엇을 어떤 검사기로 검사할지”와 화면 · 저장만 담당합니다.

## 실행
1. `vs/studyOpenCVCPP.sln` 을 열고 `Ch17_Inspection` 을 **시작 프로젝트로 설정** → 플랫폼 **x64** → **F5** (Release 가 훨씬 빠릅니다).
2. 작업 폴더는 솔루션 폴더(`vs/`)입니다. `vs/images/` 에 강좌의 `assets/images` 가 복사되어 있어야 합니다 (`vs/README.md` 5번).
3. 다른 이미지 폴더를 쓰려면: 프로젝트 속성 → 디버깅 → **명령 인수** 에 폴더 경로 (같은 파일 이름이 있어야 함).
4. 결과는 `vs/results/` 에 생깁니다: `report.csv`(UTF-8 BOM → Excel 에서 한글이 바로 보임), `NG_*.png`(불량 근거), `overlay_*.png`(s 키로 저장한 것).

## 키 (결과 보기 창)
| 키 | 동작 |
|---|---|
| `n` / `SPACE` | 다음 결과 |
| `p` | 이전 결과 |
| `s` | 지금 보이는 오버레이를 `results/overlay_파일이름.png` 로 저장 |
| `ESC` / `q` / 창 닫기 | 종료 |

## 기대 결과 (확인됨 — 브라우저 강좌 17차시 3교시 예제와 같음)
| no | 이미지 | 검사기 (설정) | 판정 | 측정값 |
|---|---|---|---|---|
| 1 | `washers.png` | 개수 세기 (기대 13) | **NG** | count=11 — 닿은 2쌍(W1–W2, B3–N4)이 한 덩어리 → 면적이 중앙값의 1.8배 이상이라 “붙음 의심” 2곳 |
| 2 | `coins_parts.png` | 개수 세기 (기대 12) | OK | count=12 |
| 3 | `color_caps.png` | 색 분류 (red 5 · yellow 6 · green 4 · blue 3 · white 2) | OK | total=20 |
| 4 | `metal_scratch.png` | 결함 검사 (골든 `metal_ok.png`, 임계 10) | **NG** | maxDiff=38, 결함 4 (긁힘 S1 · S2, 얼룩 ST, 찍힘 D1) |
| 5 | `metal_ok.png` | 결함 검사 (골든 `metal_ok.png`) | OK | 결함 0 (양품 → 과검 없음) |
| 6 | `pcb_board.png` | 결함 검사 (골든 `pcb_golden.png`, 임계 30, 면적 50) | **NG** | maxDiff=120, 결함 4 (D1 극성 · U1 브리지 · R3 누락 · C2 틀어짐) |
| 7 | `pcb_golden.png` | 결함 검사 (골든 `pcb_golden.png`) | OK | 결함 0 |

요약: 총 7건 · OK 4 · NG 3 · 불량률 42.9%. 처리 시간(ms)은 PC 마다 다릅니다.

## 파일 구성
| 파일 | 역할 |
|---|---|
| `Inspectors/Inspector.h/.cpp` | `Measurement`(측정값 한 줄), `InspectionResult`(판정 · 측정값 · 불량 `Rect` · 오버레이 · `summary()`), 추상 클래스 `Inspector`(`name()`, `virtual InspectionResult inspect(const Mat&) = 0`), 도우미 `toGray` · `toBgr` · `putLabel` · `putJudge` |
| `Inspectors/CountInspector.h/.cpp` | 블러 → Otsu(극성 자동: 흰색이 절반 이상이면 반전) → 열기 → 바깥 윤곽선 → 면적 필터 → 번호. `expected`, `minArea`(300), `mergedRatio`(1.8) |
| `Inspectors/ColorSortInspector.h/.cpp` | BGR → HSV → 색마다 `inRange`(빨강은 두 범위 OR) → 열기 · 닫기 → 윤곽선 → 색별 개수. 색 목록 `specs` 는 **데이터**(`ColorSpec`), `expected` 는 색별 기대 개수 |
| `Inspectors/DefectInspector.h/.cpp` | `absdiff`(골든, 검사) → 블러 → 임계값 → 닫기 → 윤곽선 → 면적 필터. 골든은 **생성자**에서 받는다. `diffThreshold`(10), `closeSize`(21), `minArea`(80) |
| `main.cpp` | ① 검사기(레시피) 준비 — `vector<unique_ptr<Inspector>>` 가 소유 ② 작업(`Job`) 목록 일괄 검사 → 표 · `report.csv` · `NG_*.png` ③ 결과 보기 창(키 n · p · s · ESC) |

## 코드에서 볼 것
- **다형성**: `main` 은 `job.inspector->inspect(img)` 한 줄로 세 종류를 모두 부릅니다. 새 검사기(예: 블리스터 · 커넥터 핀)는
  `Inspector` 를 상속한 클래스 하나 + `jobs` 에 한 줄이면 끝 — `main` 의 반복문은 바뀌지 않습니다 (16차시 `Filter` 와 같은 설계).
- **소유권**: 검사기 객체는 `vector<unique_ptr<Inspector>>` 가 소유하고, `Job` 은 날 포인터로 **가리키기만** 합니다.
  `unique_ptr` 을 목록으로 `std::move` 해도 가리키는 객체의 주소는 그대로라 포인터가 유효합니다.
- **골든은 설정이다**: C# 판은 `Inspect(image, golden)` + `NeedsGolden` 이었지만, C++ 판은 골든을 `DefectInspector` 생성자에서 받아
  모든 검사기의 `inspect(img)` 모양을 같게 만들었습니다. 제품마다 골든 · 임계값이 다른 **검사기 객체(레시피)** 를 따로 만듭니다.
- **예외**: “골든과 크기가 다름 · 빈 이미지” 같은 사용 방법 오류는 `std::invalid_argument`, OpenCV 내부 오류는 `cv::Exception` —
  둘 다 `std::exception` 이므로 `main` 은 한 번에 잡아 **그 작업만 ERROR 로 기록**하고 다음 작업을 계속합니다.
- **한글**: `putText` 는 한글을 그리지 못하므로 오버레이에는 `OK/NG`, 번호, 색 머리글자만 그리고, 한글 설명은 콘솔 · CSV 에 씁니다.

## 확장 과제
- `BlisterInspector`(2×5 포켓 ROI: 빈 포켓 · 깨짐 · 색 불량) · `PinInspector`(공칭 격자 대조: 누락 · 휨)를 추가해 보세요 (17차시 실습).
- 검사 설정(기대 개수 · 임계값 · 골든 파일)을 코드가 아니라 `recipe.txt` 파일에서 읽기 (`ifstream`).
- `VideoCapture` 로 카메라 프레임을 받아 한 장씩 검사하기 (15차시 `Ch15_Camera` 와 합치기).

## 관련 차시
17차시 실전 검사 프로젝트 — 05(HSV) · 07(Otsu) · 09(모폴로지) · 12(윤곽선 · 연결 요소 · watershed) · 16(클래스 설계)의 종합.
