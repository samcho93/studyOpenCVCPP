# Visual Studio 예제 솔루션 (OpenCV 5.0 · C++17)

`studyOpenCVCPP.sln` 을 Visual Studio 2022(또는 2026)로 여세요. 모든 프로젝트는 **x64** 전용이며 공통 설정 `OpenCV5.props` 를 가져옵니다.

## 준비 (한 번만 — 01차시)
1. Visual Studio 설치 시 **C++를 사용한 데스크톱 개발** 워크로드를 선택합니다.
2. https://github.com/opencv/opencv/releases 에서 `opencv-5.0.0-windows.exe` 를 받아 `C:\` 에 풀면 `C:\opencv` 가 생깁니다.
3. `C:\opencv\build\x64` 아래의 `vc**` 폴더 이름을 확인하고(예: `vc17`), 명령 프롬프트에서:
   ```bat
   setx OPENCV_DIR C:\opencv\build\x64\vc17
   ```
   (시스템 PATH 에 `%OPENCV_DIR%\bin` 을 추가하면 탐색기에서 exe 를 바로 실행할 수도 있습니다. Visual Studio 안에서 F5 로 실행할 때는 속성 시트가 PATH 를 잡아 줍니다.)
4. `lib` 폴더의 파일 이름이 `opencv_world500.lib` / `opencv_world500d.lib` 인지 확인합니다. 다르면 `OpenCV5.props` 의 `OpenCVLibVer` 를 고칩니다.
5. 강좌 저장소의 `assets/images` 폴더를 이 폴더(`vs/`)에 **`images`** 라는 이름으로 복사합니다. (작업 폴더 = 솔루션 폴더)
6. Visual Studio 를 다시 시작하고 솔루션을 엽니다 (환경 변수를 새로 읽도록).

## 프로젝트
| 프로젝트 | 차시 | 내용 |
|---|---|---|
| `OpenCV5Starter` | 01 | 설치 · 설정 확인 (버전 · 이미지 읽기 · Canny) |
| `Ch15_Camera` | 15 | 웹캠 뷰어: VideoCapture · FPS(TickMeter) · 키 조작(스냅샷 · 흑백 · Canny · MOG2 움직임 검출) · VideoWriter 녹화(MJPG .avi) |

## 자주 나는 오류
| 증상 | 원인 · 해결 |
|---|---|
| `C1083: 'opencv2/opencv.hpp' 파일을 열 수 없습니다` | `OPENCV_DIR` 이 없거나 잘못됨 → 3번 확인 후 Visual Studio 재시작 |
| `LNK1104: 'opencv_world500d.lib' 파일을 열 수 없습니다` | lib 이름 · 폴더 확인(4번), 플랫폼이 **x64** 인지 확인 |
| 실행 시 `opencv_world500d.dll 이 없어…` | exe 를 탐색기에서 직접 실행 → PATH 에 `%OPENCV_DIR%\bin` 추가 또는 DLL 을 exe 옆에 복사 |
| 이미지를 읽지 못함(빈 Mat) | 5번: `vs/images/` 가 있는지 확인 |
| 한글이 깨짐 | 속성 시트의 `/utf-8` + `SetConsoleOutputCP(CP_UTF8)` (main.cpp 참고) |
