/* 01차시 Visual Studio 에 OpenCV 5.0 설치 · 설정하기 */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 설치 흐름 5단계
  const FIG_INSTALL = `<svg viewBox="0 0 760 250" role="img" aria-label="설치 흐름: Visual Studio 설치, OpenCV 압축 풀기, 환경 변수, 프로젝트 속성, main.cpp 빌드와 실행">
  ${ARROW('c01a1')}
  <rect x="10" y="10" width="740" height="230" rx="12" class="card-bg"/>
  <rect x="24" y="40" width="130" height="90" rx="10" class="p1s"/><text x="89" y="66" text-anchor="middle" class="tx-b">① Visual Studio</text><text x="89" y="88" text-anchor="middle" class="tx-m">2022 / 2026</text><text x="89" y="108" text-anchor="middle" class="tx-m">C++ 데스크톱 개발</text>
  <line x1="156" y1="85" x2="170" y2="85" class="ln" stroke-width="2" marker-end="url(#c01a1)"/>
  <rect x="172" y="40" width="130" height="90" rx="10" class="p2s"/><text x="237" y="66" text-anchor="middle" class="tx-b">② OpenCV 5.0</text><text x="237" y="88" text-anchor="middle" class="tx-m">windows.exe 실행</text><text x="237" y="108" text-anchor="middle" class="tx-m">→ C:\\opencv 에 풀기</text>
  <line x1="304" y1="85" x2="318" y2="85" class="ln" stroke-width="2" marker-end="url(#c01a1)"/>
  <rect x="320" y="40" width="130" height="90" rx="10" class="p3s"/><text x="385" y="66" text-anchor="middle" class="tx-b">③ 환경 변수</text><text x="385" y="88" text-anchor="middle" class="tx-m">OPENCV_DIR</text><text x="385" y="108" text-anchor="middle" class="tx-m">PATH += …\\bin</text>
  <line x1="452" y1="85" x2="466" y2="85" class="ln" stroke-width="2" marker-end="url(#c01a1)"/>
  <rect x="468" y="40" width="130" height="90" rx="10" class="p4s"/><text x="533" y="66" text-anchor="middle" class="tx-b">④ 프로젝트 속성</text><text x="533" y="88" text-anchor="middle" class="tx-m">x64 · 포함 · lib</text><text x="533" y="108" text-anchor="middle" class="tx-m">C++17 · /utf-8</text>
  <line x1="600" y1="85" x2="614" y2="85" class="ln" stroke-width="2" marker-end="url(#c01a1)"/>
  <rect x="616" y="40" width="120" height="90" rx="10" class="p5s"/><text x="676" y="66" text-anchor="middle" class="tx-b">⑤ main.cpp</text><text x="676" y="88" text-anchor="middle" class="tx-m">빌드 · 실행 (F5)</text><text x="676" y="108" text-anchor="middle" class="tx-m">images/ 복사</text>
  <rect x="24" y="150" width="712" height="70" rx="10" class="p1s"/>
  <text x="380" y="176" text-anchor="middle" class="tx-b">PC 마다 한 번: ① ② ③  ·  프로젝트마다: ④ (속성 시트로 1분)  ·  매번 바뀌는 것: ⑤</text>
  <text x="380" y="202" text-anchor="middle" class="tx-m">이 사이트에서 익힌 C++ 코드는 ⑤ 의 main.cpp 에 그대로 붙여 넣으면 됩니다 (⬇ .cpp 내려받기)</text>
</svg>`;

  // 그림 2: 설치 폴더 구조
  const FIG_TREE = `<svg viewBox="0 0 760 330" role="img" aria-label="OpenCV 5.0 설치 폴더 구조: build 아래 include, x64 vc17 lib, bin">
  ${ARROW('c01a2')}
  <rect x="10" y="10" width="410" height="310" rx="12" class="card-bg"/>
  <text x="215" y="38" text-anchor="middle" class="tx-b">📁 C:\\opencv\\ (압축을 푼 곳)</text>
  <text x="30" y="68" class="tx">├ build\\</text>
  <rect x="44" y="78" width="360" height="30" rx="6" class="p1s"/><text x="54" y="98" class="tx">│ ├ include\\opencv2\\  opencv.hpp · core.hpp …</text>
  <rect x="44" y="116" width="360" height="30" rx="6" class="p4s"/><text x="54" y="136" class="tx-b">│ ├ x64\\vc17\\   ← OPENCV_DIR</text>
  <rect x="64" y="152" width="340" height="44" rx="6" class="p2s"/><text x="74" y="170" class="tx">│ │ ├ lib\\  opencv_world500.lib</text><text x="158" y="188" class="tx-m">opencv_world500d.lib (Debug)</text>
  <rect x="64" y="202" width="340" height="44" rx="6" class="p3s"/><text x="74" y="220" class="tx">│ │ └ bin\\  opencv_world500.dll</text><text x="158" y="238" class="tx-m">opencv_world500d.dll (Debug)</text>
  <text x="54" y="268" class="tx-m">│ ├ etc\\ · OpenCVConfig.cmake (CMake 용)</text>
  <text x="30" y="292" class="tx-m">└ sources\\ · LICENSE (소스 코드 · 라이선스)</text>
  <rect x="440" y="10" width="310" height="310" rx="12" class="card-bg"/>
  <text x="595" y="38" text-anchor="middle" class="tx-b">어느 단계에서 쓰이나?</text>
  <rect x="456" y="60" width="278" height="56" rx="8" class="p1s"/><text x="595" y="84" text-anchor="middle" class="tx-b">include → 컴파일</text><text x="595" y="104" text-anchor="middle" class="tx-m">#include &lt;opencv2/opencv.hpp&gt;</text>
  <rect x="456" y="130" width="278" height="56" rx="8" class="p2s"/><text x="595" y="154" text-anchor="middle" class="tx-b">lib → 링크</text><text x="595" y="174" text-anchor="middle" class="tx-m">함수 이름표(가져오기 라이브러리)</text>
  <rect x="456" y="200" width="278" height="56" rx="8" class="p3s"/><text x="595" y="224" text-anchor="middle" class="tx-b">bin → 실행</text><text x="595" y="244" text-anchor="middle" class="tx-m">실제 기계어 코드(DLL) · PATH 필요</text>
  <text x="595" y="284" text-anchor="middle" class="tx-m">vc17 = Visual Studio 2022 용 빌드</text>
  <text x="595" y="304" text-anchor="middle" class="tx-m">(내 폴더 이름은 dir 로 꼭 확인!)</text>
</svg>`;

  // 그림 3: 컴파일 → 링크 → 실행 과 include / lib / dll
  const FIG_STAGES = `<svg viewBox="0 0 760 330" role="img" aria-label="빌드 3단계: 컴파일은 헤더, 링크는 lib, 실행은 dll 이 필요하고 각각 없을 때 오류가 다르다">
  ${ARROW('c01a3')}
  <rect x="10" y="10" width="740" height="310" rx="12" class="card-bg"/>
  <rect x="24" y="34" width="100" height="44" rx="8" class="p1s"/><text x="74" y="61" text-anchor="middle" class="tx-b">main.cpp</text>
  <line x1="126" y1="56" x2="150" y2="56" class="ln" stroke-width="2" marker-end="url(#c01a3)"/>
  <rect x="152" y="30" width="150" height="52" rx="8" class="p1"/><text x="227" y="53" text-anchor="middle" class="tx-w">① 컴파일</text><text x="227" y="71" text-anchor="middle" class="tx-w">cl.exe</text>
  <line x1="304" y1="56" x2="328" y2="56" class="ln" stroke-width="2" marker-end="url(#c01a3)"/>
  <rect x="330" y="34" width="90" height="44" rx="8" class="p1s"/><text x="375" y="61" text-anchor="middle" class="tx-b">main.obj</text>
  <line x1="422" y1="56" x2="446" y2="56" class="ln" stroke-width="2" marker-end="url(#c01a3)"/>
  <rect x="448" y="30" width="130" height="52" rx="8" class="p2"/><text x="513" y="53" text-anchor="middle" class="tx-w">② 링크</text><text x="513" y="71" text-anchor="middle" class="tx-w">link.exe</text>
  <line x1="580" y1="56" x2="604" y2="56" class="ln" stroke-width="2" marker-end="url(#c01a3)"/>
  <rect x="606" y="30" width="130" height="52" rx="8" class="p3"/><text x="671" y="53" text-anchor="middle" class="tx-w">③ 실행</text><text x="671" y="71" text-anchor="middle" class="tx-w">main.exe</text>
  <text x="24" y="120" class="tx-b">필요한 것</text>
  <rect x="152" y="100" width="150" height="50" rx="6" class="p1s"/><text x="227" y="122" text-anchor="middle" class="tx">헤더 .hpp</text><text x="227" y="140" text-anchor="middle" class="tx-m">build\\include</text>
  <rect x="448" y="100" width="130" height="50" rx="6" class="p2s"/><text x="513" y="122" text-anchor="middle" class="tx">.lib 파일</text><text x="513" y="140" text-anchor="middle" class="tx-m">x64\\vc17\\lib</text>
  <rect x="606" y="100" width="130" height="50" rx="6" class="p3s"/><text x="671" y="122" text-anchor="middle" class="tx">.dll 파일</text><text x="671" y="140" text-anchor="middle" class="tx-m">x64\\vc17\\bin</text>
  <text x="24" y="188" class="tx-b">설정 위치</text>
  <rect x="152" y="166" width="150" height="56" rx="6" class="p1s"/><text x="227" y="188" text-anchor="middle" class="tx-m">C/C++ → 일반 →</text><text x="227" y="208" text-anchor="middle" class="tx-m">추가 포함 디렉터리</text>
  <rect x="448" y="166" width="130" height="56" rx="6" class="p2s"/><text x="513" y="188" text-anchor="middle" class="tx-m">링커 → 일반 (폴더)</text><text x="513" y="208" text-anchor="middle" class="tx-m">링커 → 입력 (이름)</text>
  <rect x="606" y="166" width="130" height="56" rx="6" class="p3s"/><text x="671" y="188" text-anchor="middle" class="tx-m">PATH 환경 변수</text><text x="671" y="208" text-anchor="middle" class="tx-m">또는 exe 옆에 복사</text>
  <text x="24" y="262" class="tx-b">없으면</text>
  <rect x="152" y="240" width="150" height="60" rx="6" class="p5s"/><text x="227" y="264" text-anchor="middle" class="tx">C1083</text><text x="227" y="284" text-anchor="middle" class="tx-m">헤더를 열 수 없음</text>
  <rect x="448" y="240" width="130" height="60" rx="6" class="p5s"/><text x="513" y="264" text-anchor="middle" class="tx">LNK1104 · LNK2019</text><text x="513" y="284" text-anchor="middle" class="tx-m">lib 없음 · 기호 없음</text>
  <rect x="606" y="240" width="130" height="60" rx="6" class="p5s"/><text x="671" y="264" text-anchor="middle" class="tx">시스템 오류 창</text><text x="671" y="284" text-anchor="middle" class="tx-m">…500d.dll 이 없어</text>
  <text x="375" y="190" text-anchor="middle" class="tx-m">오류 코드의</text><text x="375" y="210" text-anchor="middle" class="tx-m">앞 글자로 단계를</text><text x="375" y="230" text-anchor="middle" class="tx-m">구분: C = 컴파일</text><text x="375" y="250" text-anchor="middle" class="tx-m">LNK = 링크</text>
</svg>`;

  // 그림 4: 속성 페이지 탐색
  const FIG_PROPS = `<svg viewBox="0 0 760 340" role="img" aria-label="Visual Studio 프로젝트 속성 페이지: 구성은 모든 구성, 플랫폼은 x64, 왼쪽 트리에서 설정할 항목">
  <rect x="10" y="10" width="740" height="320" rx="12" class="card-bg"/>
  <text x="30" y="38" class="tx-b">OpenCVFirst 속성 페이지</text>
  <rect x="250" y="22" width="220" height="26" rx="6" class="p4s"/><text x="360" y="40" text-anchor="middle" class="tx">구성: 모든 구성 ▾</text>
  <rect x="490" y="22" width="160" height="26" rx="6" class="p4s"/><text x="570" y="40" text-anchor="middle" class="tx">플랫폼: x64 ▾</text>
  <rect x="24" y="60" width="210" height="256" rx="8" class="p1s"/>
  <text x="36" y="84" class="tx">▾ 구성 속성</text>
  <text x="52" y="108" class="tx-m">일반</text>
  <text x="52" y="130" class="tx-b">디버깅 ⑤</text>
  <text x="52" y="152" class="tx-m">VC++ 디렉터리</text>
  <text x="44" y="176" class="tx">▾ C/C++</text>
  <text x="64" y="198" class="tx-b">일반 ①</text>
  <text x="64" y="220" class="tx-b">언어 ④</text>
  <text x="64" y="242" class="tx-b">명령줄 ⑥</text>
  <text x="44" y="266" class="tx">▾ 링커</text>
  <text x="64" y="288" class="tx-b">일반 ②</text>
  <text x="64" y="310" class="tx-b">입력 ③</text>
  <rect x="250" y="60" width="486" height="256" rx="8" class="p2s"/>
  <text x="264" y="86" class="tx-b">① 추가 포함 디렉터리</text><text x="470" y="86" class="tx">$(OPENCV_DIR)\\..\\..\\include</text>
  <text x="264" y="122" class="tx-b">② 추가 라이브러리 디렉터리</text><text x="470" y="122" class="tx">$(OPENCV_DIR)\\lib</text>
  <text x="264" y="158" class="tx-b">③ 추가 종속성</text><text x="470" y="158" class="tx">Debug: opencv_world500d.lib</text><text x="470" y="178" class="tx">Release: opencv_world500.lib</text>
  <text x="264" y="214" class="tx-b">④ C++ 언어 표준</text><text x="470" y="214" class="tx">ISO C++17 표준 (/std:c++17)</text>
  <text x="264" y="250" class="tx-b">⑤ 작업 디렉터리</text><text x="470" y="250" class="tx">$(ProjectDir)</text>
  <text x="264" y="286" class="tx-b">⑥ 추가 옵션</text><text x="470" y="286" class="tx">/utf-8</text>
  <text x="493" y="308" text-anchor="middle" class="tx-m">③ 만 Debug / Release 를 따로 (구성 드롭다운을 바꿔서) 입력합니다</text>
</svg>`;

  // ---------------------------------------------------------------- 1교시 코드
  const SH_DIR = `:: 명령 프롬프트(cmd)에서 압축을 푼 폴더 확인하기
dir C:\\opencv\\build
dir C:\\opencv\\build\\x64
:: ↑ 여기서 vc16 / vc17 / vc18 중 실제 폴더 이름을 확인하세요 (이 강좌는 vc17 로 설명)

dir C:\\opencv\\build\\x64\\vc17\\lib
:: → opencv_world500.lib, opencv_world500d.lib  (버전 숫자 500 을 확인)
dir C:\\opencv\\build\\x64\\vc17\\bin
:: → opencv_world500.dll, opencv_world500d.dll, opencv_videoio_ffmpeg500_64.dll …`;

  const SH_SETX = `:: ① OPENCV_DIR 만들기 (사용자 환경 변수, 새로 연 창부터 적용)
setx OPENCV_DIR C:\\opencv\\build\\x64\\vc17

:: ② 새 명령 프롬프트를 열고 확인
echo %OPENCV_DIR%
:: → C:\\opencv\\build\\x64\\vc17

:: ③ PATH 에 %OPENCV_DIR%\\bin 을 넣은 뒤(GUI 권장, 아래 설명) DLL 을 찾는지 확인
where opencv_world500d.dll
:: → C:\\opencv\\build\\x64\\vc17\\bin\\opencv_world500d.dll`;

  const SH_VCPKG = `:: vcpkg 로 설치하기 (소스를 받아 내 PC 에서 빌드 — 처음 한 번은 오래 걸림)
git clone https://github.com/microsoft/vcpkg C:\\vcpkg
C:\\vcpkg\\bootstrap-vcpkg.bat
C:\\vcpkg\\vcpkg install opencv:x64-windows
:: Visual Studio 와 자동 연결 → 포함 · 라이브러리 · DLL 복사를 알아서 해 줌
C:\\vcpkg\\vcpkg integrate install`;

  const CMAKE_LISTS = `cmake_minimum_required(VERSION 3.20)
project(OpenCVFirst CXX)

set(CMAKE_CXX_STANDARD 17)            # OpenCV 5 는 C++17 이상
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# OpenCV_DIR 에 C:/opencv/build 를 주면 OpenCVConfig.cmake 를 찾습니다
find_package(OpenCV 5 REQUIRED)

add_executable(OpenCVFirst main.cpp)
target_link_libraries(OpenCVFirst PRIVATE \${OpenCV_LIBS})`;

  const EX_VERSION = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    // 1) 매크로: 컴파일할 때 헤더(opencv2/core/version.hpp)에 적힌 버전
    cout << "CV_VERSION         = " << CV_VERSION << endl;
    cout << "MAJOR.MINOR.REV    = " << CV_VERSION_MAJOR << "." << CV_VERSION_MINOR
         << "." << CV_VERSION_REVISION << endl;

    // 2) 함수: 실행할 때 라이브러리(DLL)가 알려 주는 버전
    cout << "getVersionString() = " << getVersionString() << endl;
    cout << "getVersionMajor()  = " << getVersionMajor() << endl;

    // 3) 헤더와 DLL 의 버전이 같은가? (다르면 설치가 섞인 것)
    bool same = getVersionMajor() == CV_VERSION_MAJOR && getVersionMinor() == CV_VERSION_MINOR;
    cout << "헤더 = 라이브러리 ? " << (same ? "예" : "아니오") << endl;

    // 4) C++ 표준: 201703 = C++17, 202002 = C++20
    cout << "__cplusplus        = " << __cplusplus << endl;
    return 0;
}`;

  const EX_BUILDINFO = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <sstream>
using namespace cv;
using namespace std;

int main()
{
    // 빌드 정보: 어떤 컴파일러 · 옵션 · 모듈로 만든 OpenCV 인가 (로컬에서는 수백 줄)
    string info = getBuildInformation();
    istringstream in(info);
    string line;
    int n = 0;
    while (getline(in, line) && n < 10)     // 앞의 10줄만
    {
        cout << line << endl;
        n++;
    }
    cout << "... (전체 " << info.size() << " 글자)" << endl;
    return 0;
}`;

  const EX_LOCAL_CHECK = `// main.cpp — 로컬 PC 에서 설치 확인 (Visual Studio x64 콘솔 프로젝트)
#include <opencv2/opencv.hpp>
#include <iostream>
using namespace std;

int main()
{
    cout << "OpenCV " << CV_VERSION << endl;
    cout << "포인터 크기: " << sizeof(void*) * 8 << "비트" << endl;   // 64 여야 함 (x64)
#ifdef _MSC_VER
    cout << "MSVC 버전(_MSC_VER): " << _MSC_VER << endl;           // 1930 이상 = VS 2022
    cout << "C++ 표준(_MSVC_LANG): " << _MSVC_LANG << endl;        // 201703 이상
#endif
#ifdef _DEBUG
    cout << "구성: Debug  → opencv_world500d.lib/.dll 사용" << endl;
#else
    cout << "구성: Release → opencv_world500.lib/.dll 사용" << endl;
#endif
    // 빌드 정보 전체 — 'Visual Studio', 'C++ standard', 'Video I/O' 줄을 찾아보세요
    cout << cv::getBuildInformation() << endl;
    return 0;
}`;

  // ---------------------------------------------------------------- 2교시 코드
  const XML_PROPS = `<?xml version="1.0" encoding="utf-8"?>
<!-- OpenCV5.props — OpenCV 5.0 프로젝트 설정을 한 파일에 모은 속성 시트 -->
<Project ToolsVersion="4.0" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
  <ImportGroup Label="PropertySheets" />
  <PropertyGroup Label="UserMacros">
    <!-- 버전이 바뀌면 여기만 고칩니다 (5.0.0 → 500) -->
    <OpenCVVer>500</OpenCVVer>
  </PropertyGroup>

  <PropertyGroup>
    <!-- 디버깅: 작업 디렉터리 = 프로젝트 폴더 (images/ 를 여기에 둔다) -->
    <LocalDebuggerWorkingDirectory>$(ProjectDir)</LocalDebuggerWorkingDirectory>
    <!-- 디버깅: F5 로 실행할 때만 DLL 폴더를 PATH 앞에 붙인다 -->
    <LocalDebuggerEnvironment>PATH=$(OPENCV_DIR)\\bin;%PATH%</LocalDebuggerEnvironment>
  </PropertyGroup>

  <!-- 모든 구성 공통: 헤더 · lib 폴더 · C++17 · UTF-8 -->
  <ItemDefinitionGroup>
    <ClCompile>
      <AdditionalIncludeDirectories>$(OPENCV_DIR)\\..\\..\\include;%(AdditionalIncludeDirectories)</AdditionalIncludeDirectories>
      <LanguageStandard>stdcpp17</LanguageStandard>
      <AdditionalOptions>/utf-8 /Zc:__cplusplus %(AdditionalOptions)</AdditionalOptions>
    </ClCompile>
    <Link>
      <AdditionalLibraryDirectories>$(OPENCV_DIR)\\lib;%(AdditionalLibraryDirectories)</AdditionalLibraryDirectories>
    </Link>
  </ItemDefinitionGroup>

  <!-- Debug 구성: 이름 끝에 d -->
  <ItemDefinitionGroup Condition="'$(Configuration)'=='Debug'">
    <Link>
      <AdditionalDependencies>opencv_world$(OpenCVVer)d.lib;%(AdditionalDependencies)</AdditionalDependencies>
    </Link>
  </ItemDefinitionGroup>

  <!-- Release 구성 -->
  <ItemDefinitionGroup Condition="'$(Configuration)'=='Release'">
    <Link>
      <AdditionalDependencies>opencv_world$(OpenCVVer).lib;%(AdditionalDependencies)</AdditionalDependencies>
    </Link>
  </ItemDefinitionGroup>

  <ItemGroup>
    <BuildMacro Include="OpenCVVer"><Value>$(OpenCVVer)</Value></BuildMacro>
  </ItemGroup>
</Project>`;

  const CPP_PRAGMA = `// 속성 페이지의 '추가 종속성' 대신 소스 코드에서 lib 를 지정하는 방법 (MSVC 전용)
// 라이브러리 '폴더'(추가 라이브러리 디렉터리)는 여전히 설정해야 합니다.
#include <opencv2/opencv.hpp>

#ifdef _DEBUG
#pragma comment(lib, "opencv_world500d.lib")    // Debug 구성
#else
#pragma comment(lib, "opencv_world500.lib")     // Release 구성
#endif`;

  const EX_LOCAL_TEST = `// main.cpp — OpenCV 5.0 설치 확인 프로그램 (Visual Studio x64 콘솔 프로젝트)
// 프로젝트 폴더에 images/ 폴더(강좌 저장소의 assets/images)를 복사해 두세요.
#include <opencv2/opencv.hpp>
#include <iostream>
#ifdef _WIN32
#define NOMINMAX            // windows.h 의 min/max 매크로가 cv::min/max 와 부딪히지 않게
#include <windows.h>        // SetConsoleOutputCP
#endif
using namespace cv;
using namespace std;

int main()
{
#ifdef _WIN32
    SetConsoleOutputCP(CP_UTF8);     // 콘솔 출력을 UTF-8 로 (/utf-8 컴파일 옵션과 짝)
#endif
    cout << "OpenCV " << CV_VERSION << " 설치 확인" << endl;

    Mat img = imread("images/sample_color.png");
    if (img.empty())
    {
        cout << "이미지를 읽지 못했습니다 → 작업 디렉터리에 images/ 가 있는지 확인" << endl;
        return -1;
    }
    Mat gray;
    cvtColor(img, gray, COLOR_BGR2GRAY);
    cout << "읽기 성공: " << img.cols << " x " << img.rows << ", " << img.channels() << "채널" << endl;

    imshow("color", img);        // 로컬: 실제 창이 열립니다
    imshow("gray", gray);
    waitKey(0);                  // 이미지 창을 누르고 아무 키 → 종료
    destroyAllWindows();
    return 0;
}`;

  const EX_TEST = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    cout << "OpenCV " << CV_VERSION << " 설치 확인" << endl;

    // [1] imgcodecs: 파일 읽기
    Mat img = imread("images/sample_color.png");
    if (img.empty()) { cout << "[1] 읽기 실패" << endl; return -1; }
    cout << "[1] imread   : " << img.cols << " x " << img.rows << ", "
         << img.channels() << "채널 " << typeToString(img.type()) << endl;

    // [2] imgproc: 색 변환 · 이진화
    Mat gray, bin;
    cvtColor(img, gray, COLOR_BGR2GRAY);
    double t = threshold(gray, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    cout << "[2] cvtColor : " << gray.channels() << "채널 " << typeToString(gray.type()) << endl;
    cout << "[2] threshold: Otsu 임계값 " << t << endl;

    // [3] 그리기 + highgui: 창에 표시
    putText(img, "OpenCV " CV_VERSION " OK", Point(20, 40), FONT_HERSHEY_SIMPLEX, 1.0, Scalar(0, 0, 255), 2);
    imshow("color", img);
    imshow("binary", bin);
    waitKey(0);
    cout << "[3] imshow   : 창 2개 표시 → 설치 완료!" << endl;
    return 0;
}`;

  const EX_WORKDIR = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    // 상대 경로는 '작업 디렉터리' 기준 — 폴더 오타 · 파일 오타를 구분해 봅니다
    string paths[] = { "images/sample_color.png", "image/sample_color.png", "images/sample_colour.png" };
    for (const string& p : paths)
    {
        cout << "[" << p << "]" << endl;
        Mat img = imread(p);                        // imread 는 실패해도 예외 없이 빈 Mat
        if (img.empty())
        {
            cout << "   -> 빈 Mat! 작업 디렉터리 · 경로를 확인하세요" << endl;
            continue;
        }
        cout << "   -> OK " << img.cols << " x " << img.rows << endl;
    }
    return 0;
}`;

  const EX_EXCEPTION = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/washers.png", IMREAD_GRAYSCALE);
    cout << "입력: " << gray.channels() << "채널" << endl;
    Mat dst;
    try
    {
        // 1채널 영상에 BGR2GRAY → 입력 채널 수 조건(assertion) 위반
        cvtColor(gray, dst, COLOR_BGR2GRAY);
        cout << "이 줄은 실행되지 않습니다" << endl;
    }
    catch (const cv::Exception& e)
    {
        // e.what() 에는 파일 · 줄 · 함수 이름 · 깨진 조건식이 들어 있습니다
        cout << "cv::Exception 발생!" << endl;
        cout << "오류 코드: " << e.code << endl;
    }
    cout << "프로그램은 계속 실행됩니다" << endl;
    return 0;
}`;

  const CPP_UTF8 = `// 한글 출력이 깨질 때 (예: "?덈뀞" 또는 "媛쒖닔") — 두 가지를 함께 설정합니다
// ① 컴파일러: 소스 파일을 UTF-8 로 읽고, 문자열도 UTF-8 로 저장
//    프로젝트 속성 → C/C++ → 명령줄 → 추가 옵션:  /utf-8
// ② 콘솔: 출력 코드 페이지를 UTF-8(65001) 로
#define NOMINMAX
#include <windows.h>
// main() 첫 줄에서:
//     SetConsoleOutputCP(CP_UTF8);
// 또는 명령 프롬프트에서 실행 전에:  chcp 65001`;

  // ---------------------------------------------------------------- 퀴즈
  const QUIZ1 = [
    { q: 'OpenCV 5.0 Windows 패키지를 <code>C:\\opencv</code> 에 풀었습니다. <code>#include &lt;opencv2/opencv.hpp&gt;</code> 가 찾는 헤더가 들어 있는 폴더는?', options: ['<code>C:\\opencv\\build\\x64\\vc17\\bin</code>', '<code>C:\\opencv\\build\\include</code>', '<code>C:\\opencv\\build\\x64\\vc17\\lib</code>', '<code>C:\\opencv\\sources</code>'], answer: 1,
      explain: '헤더는 <code>build\\include\\opencv2\\</code> 에 있으므로 “추가 포함 디렉터리” 에는 그 위 폴더인 <code>build\\include</code> 를 넣습니다. <code>lib</code> 는 링크용, <code>bin</code> 은 실행용 DLL 입니다.' },
    { q: 'Debug 구성으로 빌드할 때 링크해야 하는 OpenCV 5.0.0 라이브러리 파일은?', options: ['<code>opencv_world500.lib</code>', '<code>opencv_world500d.lib</code>', '<code>opencv_world500d.dll</code>', '<code>opencv_world5.lib</code>'], answer: 1,
      explain: 'Debug 용 라이브러리는 이름 끝에 <b>d</b> 가 붙습니다(<code>500d</code>). 링커에는 <code>.lib</code> 를, 실행에는 같은 짝의 <code>.dll</code> 을 씁니다. Debug 프로그램에 Release lib 를 섞으면 링크 오류나 실행 중 이상한 충돌이 납니다.' },
    { q: '환경 변수 <code>OPENCV_DIR</code> 과 <code>PATH</code> 를 설정한 직후 Visual Studio 에서 실행했더니 여전히 “DLL 이 없다” 는 오류가 납니다. 가장 먼저 할 일은?', options: ['OpenCV 를 다시 설치한다', 'Visual Studio 를 <b>완전히 종료했다가 다시 실행</b>한다', '<code>main.cpp</code> 를 지우고 다시 만든다', 'Release 구성으로 바꾼다'], answer: 1,
      explain: '환경 변수는 프로그램이 <b>시작할 때</b> 복사됩니다. 이미 열려 있던 Visual Studio · 명령 프롬프트는 옛 값을 가지고 있으므로 <b>다시 시작</b>해야 새 PATH 를 봅니다.' },
    { q: 'OpenCV 5 헤더를 쓰는 프로젝트에서 C++ 언어 표준을 <u>최소</u> 무엇으로 설정해야 하는가?', options: ['C++98', 'C++11', 'C++14', 'C++17'], answer: 3,
      explain: 'OpenCV 5 는 <b>C++17</b> 이 최소 요구 사항입니다. Visual Studio 속성 → C/C++ → 언어 → C++ 언어 표준을 <b>ISO C++17 표준 (/std:c++17)</b> 이상으로 둡니다(VS 2022 의 기본값은 C++14).' }
  ];

  const QUIZ2 = [
    { q: '프로젝트 속성을 모두 넣었는데 <code>LNK1104: \'opencv_world500d.lib\' 파일을 열 수 없습니다</code> 가 납니다. 가장 가능성이 낮은 원인은?', options: ['추가 라이브러리 디렉터리 경로가 틀렸다 (vc17 대신 vc16 등)', '솔루션 플랫폼이 <b>x86(Win32)</b> 이라 x64 용으로 넣은 설정이 적용되지 않았다', '<code>main.cpp</code> 에서 <code>using namespace cv;</code> 를 빠뜨렸다', '설정을 Release 구성에만 넣고 Debug 로 빌드했다'], answer: 2,
      explain: 'LNK1104 는 링커가 <b>.lib 파일 자체를 찾지 못한</b> 것입니다 — 폴더 경로 · 플랫폼(x64/Win32) · 구성(Debug/Release) 문제입니다. <code>using namespace</code> 누락은 컴파일 오류(C2065 등)가 납니다.' },
    { q: '<code>fatal error C1083: 포함 파일을 열 수 없습니다. \'opencv2/opencv.hpp\'</code> 를 고치려면 어느 설정을 확인하는가?', options: ['링커 → 입력 → 추가 종속성', 'C/C++ → 일반 → <b>추가 포함 디렉터리</b>', '디버깅 → 작업 디렉터리', '환경 변수 PATH'], answer: 1,
      explain: '<b>C</b> 로 시작하는 오류는 <b>컴파일</b> 단계입니다. 컴파일러가 헤더를 찾는 곳은 추가 포함 디렉터리(<code>$(OPENCV_DIR)\\..\\..\\include</code>)입니다. PATH 는 실행 단계의 DLL 에만 쓰입니다.' },
    { q: '빌드는 성공했는데 F5 로 실행하면 <code>imread</code> 가 빈 Mat 을 돌려줍니다. <code>images</code> 폴더는 프로젝트 폴더에 있습니다. 확인할 설정은?', options: ['디버깅 → <b>작업 디렉터리</b>가 <code>$(ProjectDir)</code> 인지', '링커 → 추가 종속성', 'C++ 언어 표준', '문자 집합(유니코드/멀티바이트)'], answer: 0,
      explain: '상대 경로 <code>"images/…"</code> 는 <b>작업 디렉터리</b> 기준입니다. Visual Studio 의 기본값 <code>$(ProjectDir)</code> 이면 프로젝트 폴더에서 찾습니다. exe 를 탐색기에서 직접 더블클릭하면 exe 폴더(<code>x64\\Debug</code>)가 작업 디렉터리가 되므로 거기에도 images 가 있어야 합니다.' },
    { q: '<code>cout &lt;&lt; "안녕"</code> 의 한글이 콘솔에 깨져 나옵니다. 올바른 해결 조합은?', options: ['<code>#include &lt;string&gt;</code> 추가', '컴파일 옵션 <code>/utf-8</code> + <code>SetConsoleOutputCP(CP_UTF8)</code>(또는 <code>chcp 65001</code>)', 'Release 구성으로 빌드', '<code>opencv_world500.dll</code> 을 exe 옆에 복사'], answer: 1,
      explain: '소스(UTF-8)를 컴파일러가 CP949 로 잘못 읽거나, UTF-8 문자열을 콘솔이 CP949 로 해석하면 깨집니다. <b>/utf-8</b> 로 컴파일러 쪽을, <b>SetConsoleOutputCP(CP_UTF8)</b> 로 콘솔 쪽을 맞춥니다.' },
    { q: '속성 시트(<code>OpenCV5.props</code>)를 쓰는 가장 큰 장점은?', options: ['프로그램 실행 속도가 빨라진다', '한 번 만든 OpenCV 설정을 <b>새 프로젝트마다 “기존 속성 시트 추가” 한 번으로</b> 재사용한다', 'DLL 없이도 실행된다', 'x86 에서도 OpenCV 를 쓸 수 있다'], answer: 1,
      explain: '속성 시트는 설정만 모은 XML 파일입니다. 속성 관리자에서 추가하면 포함 · 라이브러리 · 종속성 · C++17 · /utf-8 이 한 번에 적용되고, 버전이 바뀌면 props 한 곳만 고치면 됩니다.' }
  ];

  CV_COURSE.addChapter({
    id: 'cv01', no: '01', title: 'Visual Studio 에 OpenCV 5.0 설치 · 설정하기', subtitle: '설치 → 환경 변수 → 프로젝트 속성 · 속성 시트 → 설치 확인과 오류 해결',
    summary: '<b>Visual Studio 2022</b>(C++ 데스크톱 개발)와 <b>OpenCV 5.0.0</b> Windows 패키지를 설치하고, <code>OPENCV_DIR</code> · <code>PATH</code> 환경 변수를 설정합니다. x64 콘솔 프로젝트에 <b>추가 포함 디렉터리 · 추가 라이브러리 디렉터리 · 추가 종속성(opencv_world500d.lib / 500.lib) · C++17 · /utf-8</b> 을 넣고, 이 설정을 <b>속성 시트(OpenCV5.props)</b>로 재사용합니다. 컴파일 → 링크 → 실행 단계별로 헤더 · lib · dll 의 역할을 이해하고 C1083 · LNK2019 · DLL 없음 · 빈 Mat · 한글 깨짐을 스스로 해결합니다.',
    goals: ['Visual Studio 2022 C++ 워크로드와 OpenCV 5.0 패키지를 설치하고 폴더 구조(include · lib · bin)를 설명할 수 있다', 'OPENCV_DIR · PATH 환경 변수를 설정하고 확인할 수 있다', 'x64 콘솔 프로젝트에 포함 · 라이브러리 · 종속성 · C++17 · 작업 디렉터리를 설정하고 속성 시트로 재사용할 수 있다', '컴파일 · 링크 · 실행 단계의 오류 메시지를 보고 원인을 찾아 해결할 수 있다'],
    sections: [
      // ============================================================ 1교시
      {
        id: 'cv01-1', title: 'Visual Studio 와 OpenCV 5.0 설치하기', minutes: 50,
        goals: ['Visual Studio 2022 에 “C++를 사용한 데스크톱 개발” 워크로드를 설치할 수 있다', 'OpenCV 5.0.0 Windows 패키지를 C:\\opencv 에 풀고 include · lib · bin 폴더의 역할을 말할 수 있다', 'OPENCV_DIR · PATH 환경 변수를 설정하고 CV_VERSION 으로 버전을 확인할 수 있다'],
        flow: [['도입: 무엇을 설치하나', 5], ['Visual Studio 설치', 8], ['OpenCV 내려받기 · 폴더 구조', 15], ['환경 변수 · 버전 확인', 14], ['정리 · 퀴즈', 8]],
        content: [
          { type: 'h', text: '브라우저에서 로컬 PC 로: 무엇을 설치해야 하나?' },
          { type: 'p', html: '00차시에서는 브라우저 안에서 C++ OpenCV 코드를 컴파일 · 실행했습니다. 실제 검사 장비 프로그램은 <b>Windows PC 의 실행 파일(.exe)</b>로 돌아가므로 이제 내 PC 에 개발 환경을 만듭니다. Python 의 <code>pip install opencv-python</code> 한 줄과 달리 C++ 은 <b>① 컴파일러(Visual Studio) ② OpenCV 라이브러리 파일 ③ 둘을 연결하는 설정</b>을 직접 해야 합니다. 조금 번거롭지만, 이 과정을 이해하면 어떤 C++ 라이브러리든 스스로 설치할 수 있게 됩니다.' },
          { type: 'figure', html: FIG_INSTALL, caption: '그림 1. 설치 흐름 5단계 — ① ② ③ 은 PC 마다 한 번, ④ 는 프로젝트마다(2교시), ⑤ 는 이 사이트에서 익힌 코드를 붙여 넣는 자리' },
          { type: 'h', text: '① Visual Studio 2022 Community 설치' },
          { type: 'callout', kind: 'vs', title: '설치 순서', html: '<ol><li><a href="https://visualstudio.microsoft.com/ko/vs/community/" target="_blank" rel="noopener">visualstudio.microsoft.com</a> 에서 <b>Visual Studio 2022 Community</b>(무료, 2026 도 같음) 설치 프로그램을 내려받아 실행합니다.</li><li>워크로드(Workloads) 화면에서 <b>C++를 사용한 데스크톱 개발</b>(Desktop development with C++)에 체크합니다. 오른쪽 “설치 세부 정보” 에 <b>MSVC v143 빌드 도구</b>와 <b>Windows SDK</b> 가 체크되어 있는지 확인하세요 (약 7~10 GB).</li><li>“.NET 데스크톱 개발” 만 설치했다면 C++ 프로젝트 템플릿이 보이지 않습니다 → <b>Visual Studio Installer → 수정</b>에서 C++ 워크로드를 추가합니다.</li><li>확인: 시작 메뉴 → <b>Developer Command Prompt for VS 2022</b> 에서 <code>cl</code> 을 입력하면 “Microsoft (R) C/C++ 최적화 컴파일러 버전 19.4x…” 가 나옵니다.</li></ol>' },
          { type: 'h', text: '② OpenCV 5.0.0 내려받기 · 압축 풀기' },
          { type: 'p', html: 'OpenCV 5.0 은 2026년 6월에 나온 메이저 버전입니다. Windows 용으로는 <b>미리 빌드된(prebuilt) 패키지</b>가 제공되므로 소스를 직접 빌드할 필요가 없습니다.' },
          { type: 'list', ordered: true, items: [
            '<a href="https://github.com/opencv/opencv/releases" target="_blank" rel="noopener">github.com/opencv/opencv/releases</a> (또는 opencv.org/releases) 의 <b>5.0.0</b> 항목 → Assets 에서 <code>opencv-5.0.0-windows.exe</code> (약 186 MB) 를 내려받습니다.',
            '이 exe 는 설치 프로그램이 아니라 <b>자동 압축 풀기(7-Zip SFX)</b> 파일입니다. 실행하면 풀 위치를 묻습니다 → <code>C:\\</code> 를 입력하면 <code>C:\\opencv</code> 폴더가 생깁니다.',
            '경로에 <b>한글 · 공백이 없는 곳</b>을 권장합니다 (<code>C:\\Program Files</code> 는 공백 + 관리자 권한 문제로 피함).',
            '압축을 푼 뒤 명령 프롬프트에서 <code>dir</code> 로 실제 폴더 이름과 파일 이름을 확인합니다 (아래).'
          ] },
          { type: 'figure', html: FIG_TREE, caption: '그림 2. C:\\opencv 폴더 구조 — include(헤더)는 컴파일, lib 는 링크, bin(DLL)은 실행에 쓰인다. OPENCV_DIR 은 x64\\vc17 을 가리킨다' },
          { type: 'code', title: '압축을 푼 폴더 확인하기 (명령 프롬프트)', lang: 'sh', code: SH_DIR, run: false,
            desc: '<b>vc17</b> 은 “Visual C++ 17 = Visual Studio 2022 용 빌드” 라는 뜻입니다. 패키지에 따라 <code>vc16</code> 또는 <code>vc18</code> 일 수 있으니 <b>이 강좌의 vc17 을 내 폴더 이름으로 바꿔</b> 읽으세요. VS 2022 · 2026 은 같은 런타임(v14x)을 쓰므로 vc16 ~ vc18 빌드를 모두 링크할 수 있습니다. <code>::</code> 로 시작하는 줄은 cmd 의 주석입니다.' },
          { type: 'table', head: ['파일', '위치', '쓰이는 단계', 'Debug / Release'], rows: [
            ['<code>opencv2/*.hpp</code>', '<code>build\\include</code>', '컴파일 (<code>#include</code>)', '공통'],
            ['<code>opencv_world500d.lib</code>', '<code>build\\x64\\vc17\\lib</code>', '링크', '<b>Debug</b> (끝에 <b>d</b>)'],
            ['<code>opencv_world500.lib</code>', '<code>build\\x64\\vc17\\lib</code>', '링크', 'Release'],
            ['<code>opencv_world500d.dll</code>', '<code>build\\x64\\vc17\\bin</code>', '실행 (PATH)', '<b>Debug</b>'],
            ['<code>opencv_world500.dll</code>', '<code>build\\x64\\vc17\\bin</code>', '실행 (PATH)', 'Release'],
            ['<code>opencv_videoio_ffmpeg500_64.dll</code>', '<code>build\\x64\\vc17\\bin</code>', '실행 (동영상 파일 읽기)', '공통']
          ], caption: '표 1. OpenCV 5.0.0 패키지의 핵심 파일 — “world” 는 모든 모듈을 하나로 합친 라이브러리, 500 은 버전 5.0.0' },
          { type: 'callout', kind: 'warn', title: '파일 이름은 반드시 dir 로 확인!', html: '이 강좌는 <code>vc17</code> · <code>opencv_world500d.lib</code> 로 설명하지만, 패키지 빌드에 따라 폴더(<code>vc16/vc17/vc18</code>)나 파일 이름이 다를 수 있습니다. 속성 페이지에 이름을 한 글자라도 틀리게 쓰면 <b>LNK1104</b> 가 납니다. <code>dir C:\\opencv\\build\\x64\\vc17\\lib</code> 결과를 <b>복사해서</b> 붙여 넣는 습관을 들이세요.' },
          { type: 'callout', kind: 'info', title: '.lib 와 .dll 은 왜 둘 다 필요한가?', html: 'OpenCV 는 <b>동적 링크(DLL)</b> 방식으로 배포됩니다. <code>.lib</code> 는 “<code>cv::imread</code> 는 opencv_world500.dll 안에 있다” 는 <b>이름표(가져오기 라이브러리)</b>만 담고 있어 링커가 exe 를 만들 때 씁니다. 실제 기계어 코드는 <code>.dll</code> 에 있어서 <b>exe 가 실행될 때</b> Windows 가 DLL 을 찾아 불러옵니다. 그래서 빌드가 성공해도 DLL 을 못 찾으면 실행이 안 됩니다.' },
          { type: 'h', text: '③ 환경 변수 OPENCV_DIR · PATH 설정' },
          { type: 'p', html: '매 프로젝트마다 <code>C:\\opencv\\build\\x64\\vc17</code> 같은 긴 경로를 적으면 설치 위치가 바뀔 때마다 모두 고쳐야 합니다. 대신 <b>환경 변수 <code>OPENCV_DIR</code></b> 하나에 경로를 저장하고, 프로젝트에서는 <code>$(OPENCV_DIR)</code> 로 부릅니다. 또 실행할 때 DLL 을 찾을 수 있도록 <b><code>%OPENCV_DIR%\\bin</code> 을 PATH 에 추가</b>합니다.' },
          { type: 'code', title: '명령 프롬프트로 OPENCV_DIR 만들고 확인하기', lang: 'sh', code: SH_SETX, run: false,
            desc: '<code>setx</code> 는 값을 <b>영구히</b> 저장하지만 <b>지금 열린 창에는 적용되지 않습니다</b> — 새 명령 프롬프트를 열어 확인하세요. <code>where</code> 는 PATH 에서 파일을 찾아 주는 명령입니다.' },
          { type: 'callout', kind: 'vs', title: 'GUI 로 PATH 에 bin 추가하기 (권장)', html: '<ol><li>시작 메뉴에서 <b>“시스템 환경 변수 편집”</b> 검색 → <b>환경 변수(N)…</b> 버튼.</li><li>위쪽 <b>사용자 변수</b>에 <code>OPENCV_DIR</code> 이 있는지 확인(없으면 <b>새로 만들기</b>: 이름 <code>OPENCV_DIR</code>, 값 <code>C:\\opencv\\build\\x64\\vc17</code>).</li><li>사용자 변수의 <b>Path</b> 선택 → <b>편집</b> → <b>새로 만들기</b> → <code>%OPENCV_DIR%\\bin</code> 입력 → 확인.</li><li><b>열려 있던 Visual Studio · 명령 프롬프트를 모두 닫고 다시 엽니다.</b> 환경 변수는 프로그램이 시작될 때 읽히기 때문입니다.</li></ol>' },
          { type: 'callout', kind: 'warn', title: 'setx PATH "%PATH%;…" 는 쓰지 마세요', html: '<code>setx PATH "%PATH%;C:\\opencv\\…"</code> 는 인터넷에 흔한 방법이지만, 시스템 PATH 와 사용자 PATH 가 합쳐진 값을 사용자 PATH 에 덮어쓰고 <b>1024 글자에서 잘라 버려</b> 다른 프로그램의 경로가 사라질 수 있습니다. PATH 는 위의 GUI 편집기로 한 줄만 추가하세요.' },
          { type: 'h', text: 'OpenCV 5 는 C++17 이 필요하다 — 버전 확인 프로그램' },
          { type: 'p', html: 'OpenCV 5 의 헤더는 <code>std::optional</code> · <code>if constexpr</code> 같은 <b>C++17</b> 기능을 씁니다. Visual Studio 2022 의 기본 언어 표준은 C++14 라서 그대로 두면 OpenCV 헤더 안에서 수십 개의 컴파일 오류가 납니다 → 2교시에서 <b>/std:c++17</b> 로 설정합니다. 설치가 끝나면 가장 먼저 <b>버전</b>을 확인합니다. 아래 예제를 브라우저에서 실행해 보세요 — 로컬 PC 에서도 같은 결과가 나와야 합니다.' },
          { type: 'code', title: '예제 1: 버전 확인 — 매크로(헤더) vs 함수(라이브러리)', code: EX_VERSION,
            desc: '<code>CV_VERSION</code> 은 <b>컴파일할 때</b> 헤더에서 정해지는 문자열 매크로이고, <code>getVersionString()</code> 은 <b>실행할 때</b> DLL 이 돌려주는 값입니다. 두 값이 다르면 헤더와 DLL 이 서로 다른 설치에서 온 것입니다(예: PATH 에 예전 OpenCV 4 bin 이 먼저 있음). <code>__cplusplus</code> 의 <code>201703</code> 은 C++17 을 뜻합니다. ⚠️ MSVC 는 옛 코드 호환 때문에 <code>/Zc:__cplusplus</code> 옵션을 주지 않으면 <code>__cplusplus</code> 를 <b>199711</b> 로 보고합니다 — 대신 <code>_MSVC_LANG</code> 을 보세요.',
            expect: 'CV_VERSION         = 5.0.0\nMAJOR.MINOR.REV    = 5.0.0\ngetVersionString() = 5.0.0\ngetVersionMajor()  = 5\n헤더 = 라이브러리 ? 예\n__cplusplus        = 201703' },
          { type: 'code', title: '예제 2: 빌드 정보 getBuildInformation()', code: EX_BUILDINFO, nondeterministic: true,
            desc: '<code>getBuildInformation()</code> 은 OpenCV 가 어떤 컴파일러 · 옵션 · 모듈로 빌드되었는지 긴 문자열로 돌려줍니다. 로컬 PC 에서는 <b>수백 줄</b>이 나오며 “Visual Studio”, “C++ standard”, “Video I/O: FFMPEG”, “Parallel framework” 같은 줄로 설치된 기능을 확인합니다. 브라우저 환경은 OpenCV.js 빌드이므로 짧은 요약만 나옵니다. <code>istringstream</code> + <code>getline</code> 으로 문자열을 줄 단위로 나누는 방법도 익혀 두세요.' },
          { type: 'code', title: '로컬 PC 에서 설치 확인 (x64 · 구성 · 컴파일러)', code: EX_LOCAL_CHECK, run: false, local: true, file: 'main.cpp',
            desc: '2교시에서 프로젝트를 설정한 뒤 실행합니다. <code>sizeof(void*) * 8</code> 이 <b>64</b> 이면 x64 로 빌드된 것입니다(OpenCV 패키지는 x64 전용). <code>_DEBUG</code> 는 Debug 구성에서만 정의되는 매크로라서 지금 어느 lib 를 써야 하는지 알려 줍니다. <code>_MSC_VER</code> 1930~1949 는 VS 2022, 1950 이상은 VS 2026 입니다.' },
          { type: 'callout', kind: 'more', title: '📘 다른 설치 방법: vcpkg 와 CMake', html: '<p><b>vcpkg</b> 는 Microsoft 의 C++ 패키지 관리자입니다(Python 의 pip 와 비슷). <code>vcpkg install opencv</code> 한 줄이면 소스를 받아 내 PC 에서 빌드하고, <code>vcpkg integrate install</code> 후에는 Visual Studio 프로젝트에서 <b>포함 · 라이브러리 · DLL 복사를 자동</b>으로 처리합니다. 대신 처음 빌드에 30분 이상 걸리고, 최신 5.0 이 반영되기까지 시간이 걸릴 수 있습니다.</p><p><b>CMake</b> 는 여러 운영체제용 빌드 설정을 만드는 도구입니다. 패키지의 <code>build\\OpenCVConfig.cmake</code> 를 <code>find_package(OpenCV REQUIRED)</code> 가 찾아 헤더 · 라이브러리 경로를 알아서 채웁니다. Visual Studio 는 <b>폴더 열기</b>로 CMakeLists.txt 프로젝트를 바로 엽니다. 이 강좌는 Windows 에서 가장 흔한 <b>.vcxproj + 속성 시트</b> 방식을 씁니다.</p>' },
          { type: 'code', title: 'vcpkg 로 설치하기 (참고)', lang: 'sh', code: SH_VCPKG, run: false },
          { type: 'code', title: 'CMakeLists.txt (참고)', lang: 'cmake', file: 'CMakeLists.txt', code: CMAKE_LISTS, run: false,
            desc: 'cmake 를 실행할 때 <code>-DOpenCV_DIR=C:/opencv/build</code> 를 주거나 환경 변수 <code>OpenCV_DIR</code> 을 설정하면 <code>find_package</code> 가 OpenCV 를 찾습니다. <code>OpenCV_LIBS</code> 에는 Debug/Release 에 맞는 lib 이름이 자동으로 들어갑니다.' }
        ],
        practice: [
          {
            title: '버전으로 라이브러리 파일 이름 만들기', level: 1,
            desc: '<code>libName(bool debug, string ext)</code> 함수를 완성하세요. <code>getVersionMajor/Minor/Revision()</code> 으로 <code>"opencv_world500"</code> 을 만들고, Debug 이면 <code>d</code> 를 붙인 뒤 확장자(<code>.lib</code> / <code>.dll</code>)를 붙여 돌려줍니다. 이렇게 이름 규칙을 이해하면 다음 버전(5.1 → <code>510</code>)에서도 헷갈리지 않습니다.',
            hint: '<code>to_string(getVersionMajor())</code> 처럼 숫자를 문자열로 바꿔 이어 붙입니다. <code>string s = "opencv_world" + to_string(...) + ...; if (debug) s += "d"; return s + ext;</code>',
            expect: 'Debug   링크: opencv_world500d.lib, 실행: opencv_world500d.dll\nRelease 링크: opencv_world500.lib, 실행: opencv_world500.dll',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

// TODO: "opencv_world" + 버전 숫자 3개 + (debug 이면 "d") + ext 를 돌려주세요
string libName(bool debug, const string& ext)
{
    string s = "opencv_world";
    return s + ext;
}

int main()
{
    cout << "Debug   링크: " << libName(true, ".lib") << ", 실행: " << libName(true, ".dll") << endl;
    cout << "Release 링크: " << libName(false, ".lib") << ", 실행: " << libName(false, ".dll") << endl;
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

string libName(bool debug, const string& ext)
{
    string s = "opencv_world" + to_string(getVersionMajor())
             + to_string(getVersionMinor()) + to_string(getVersionRevision());
    if (debug) s += "d";
    return s + ext;
}

int main()
{
    cout << "Debug   링크: " << libName(true, ".lib") << ", 실행: " << libName(true, ".dll") << endl;
    cout << "Release 링크: " << libName(false, ".lib") << ", 실행: " << libName(false, ".dll") << endl;
    return 0;
}`
          },
          {
            title: '전처리기로 설치 조건 점검하기', level: 2,
            desc: '전처리기 <code>#if</code> 로 두 조건을 검사해 결과를 출력하세요. ① <code>CV_VERSION_MAJOR</code> 가 5 이상이면 <b>“OpenCV 5 이상: OK”</b>, 아니면 <b>“OpenCV 버전이 낮습니다”</b> ② <code>__cplusplus</code> 가 <code>201703L</code> 이상이면 <b>“C++17 이상: OK”</b>, 아니면 <b>“C++17 로 설정하세요”</b>. 마지막 줄에 <code>CV_VERSION</code> 을 출력하세요.',
            hint: '<code>#if CV_VERSION_MAJOR &gt;= 5</code> … <code>#else</code> … <code>#endif</code>. 전처리기 조건은 <b>컴파일 전에</b> 판단되므로, 조건에 맞지 않는 쪽 코드는 아예 컴파일되지 않습니다. 실제 라이브러리들은 <code>#error</code> 로 빌드를 멈추기도 합니다.',
            expect: 'OpenCV 5 이상: OK\nC++17 이상: OK\n버전: 5.0.0',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace std;

int main()
{
    // TODO ①: CV_VERSION_MAJOR >= 5 인지 #if 로 검사해 출력

    // TODO ②: __cplusplus >= 201703L 인지 #if 로 검사해 출력

    cout << "버전: " << CV_VERSION << endl;
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace std;

int main()
{
#if CV_VERSION_MAJOR >= 5
    cout << "OpenCV 5 이상: OK" << endl;
#else
    cout << "OpenCV 버전이 낮습니다" << endl;
#endif

#if __cplusplus >= 201703L
    cout << "C++17 이상: OK" << endl;
#else
    cout << "C++17 로 설정하세요" << endl;
#endif

    cout << "버전: " << CV_VERSION << endl;
    return 0;
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: '01. Visual Studio 에 OpenCV 5.0 설치 · 설정하기', subtitle: '1교시 — Visual Studio 와 OpenCV 5.0 설치하기', notes: '<p>00차시에는 브라우저에서 실행했지만 실제 장비 프로그램은 Windows 의 exe 라는 점에서 시작합니다. 💬 “Python 에서 OpenCV 를 쓸 때는 무엇을 설치했나요?” — <code>pip install opencv-python</code>. C++ 에는 그런 한 줄이 기본으로는 없어서 오늘은 손으로 설치 · 연결한다고 안내합니다. 학생 PC 에 Visual Studio 와 OpenCV 설치 파일이 준비되어 있는지 손들어 확인. (3분)</p>' },
          { layout: 'bullets', title: '오늘 설치할 것 세 가지', lead: '컴파일러 · 라이브러리 · 연결 설정', bullets: [
            '<b>Visual Studio 2022 Community</b> + <b>C++를 사용한 데스크톱 개발</b> 워크로드 (MSVC 컴파일러)',
            '<b>OpenCV 5.0.0</b> Windows 패키지 → <code>C:\\opencv</code> 에 압축 풀기',
            ['<b>환경 변수</b>', ['<code>OPENCV_DIR = C:\\opencv\\build\\x64\\vc17</code>', 'PATH 에 <code>%OPENCV_DIR%\\bin</code> 추가']],
            '(2교시) 프로젝트 속성: 포함 · 라이브러리 · 종속성 · C++17'
          ], notes: '<p>Python 의 pip 가 해 주던 일을 셋으로 나눠 직접 한다고 설명합니다. 이 과정을 이해하면 다른 C++ 라이브러리(Eigen, Boost, 카메라 SDK)도 같은 방식으로 설치할 수 있다는 점이 동기 부여 포인트. (3분)</p>' },
          { layout: 'diagram', title: '설치 흐름 5단계', html: FIG_INSTALL, caption: '① ② ③ PC 마다 한 번 · ④ 프로젝트마다 · ⑤ 이 사이트의 코드를 붙여 넣는 자리', notes: '<p>💬 “이 중 한 번만 하면 되는 단계는?” — ①②③. ④ 는 2교시에 속성 시트로 1분 만에 끝내는 법을 배운다고 예고. (3분)</p>' },
          { layout: 'bullets', title: '① Visual Studio 2022 설치', bullets: [
            '설치 프로그램 → 워크로드 <b>C++를 사용한 데스크톱 개발</b> 체크 (약 7~10 GB)',
            '설치 세부 정보: <b>MSVC v143</b> 빌드 도구 · <b>Windows SDK</b> 확인',
            '.NET 워크로드만 있으면 C++ 템플릿이 없다 → Installer 에서 <b>수정</b>',
            '확인: <b>Developer Command Prompt</b> 에서 <code>cl</code> → 컴파일러 버전 19.4x'
          ], notes: '<p>교사 PC 에서 Visual Studio Installer 의 워크로드 화면을 보여 줍니다. 설치가 오래 걸리므로 수업 전에 미리 설치되어 있어야 합니다. 설치가 안 된 학생은 짝과 함께 진행하고 브라우저로 예제를 따라가게 합니다. (5분)</p>' },
          { layout: 'bullets', title: '② OpenCV 5.0.0 내려받기 · 압축 풀기', bullets: [
            'github.com/opencv/opencv/releases → 5.0.0 → <code>opencv-5.0.0-windows.exe</code> (≈186 MB)',
            'exe 는 <b>자동 압축 풀기</b> 파일 — 풀 위치 <code>C:\\</code> → <code>C:\\opencv</code>',
            '경로에 <b>한글 · 공백 없이</b> (<code>Program Files</code> 피하기)',
            '<code>dir C:\\opencv\\build\\x64</code> 로 <b>vc16 / vc17 / vc18</b> 실제 이름 확인'
          ], notes: '<p>파일이 크므로 미리 USB · 공유 폴더로 나눠 주면 좋습니다. exe 를 실행하면 설치 마법사가 아니라 압축 풀기 창이 뜬다는 점을 미리 말해 둡니다. 압축 풀기에 1~2분. (5분)</p>' },
          { layout: 'diagram', title: 'C:\\opencv 폴더 구조', html: FIG_TREE, caption: 'include = 컴파일 · lib = 링크 · bin(DLL) = 실행 — OPENCV_DIR 은 x64\\vc17', notes: '<p>탐색기로 실제 폴더를 열어 함께 확인합니다. 💬 “opencv_world500d.lib 의 d 는 무슨 뜻일까?” — Debug. “500 은?” — 버전 5.0.0. .lib 는 이름표, .dll 은 실제 코드라는 비유를 씁니다. (5분)</p>' },
          { layout: 'code', title: '폴더 · 파일 이름 확인 (cmd)', code: SH_DIR, lang: 'sh', run: false, points: ['<b>vc17</b> = Visual Studio 2022 용 빌드 — 내 폴더 이름으로 바꿔 읽기', 'lib · dll 파일 이름은 <b>복사해서</b> 붙여 넣기', '<code>::</code> = cmd 주석'], notes: '<p>학생들이 직접 명령 프롬프트를 열어 입력하게 합니다. 결과에서 vcNN 폴더 이름과 파일 이름을 공책에 적게 합니다 — 2교시에 그대로 씁니다. (4분)</p>' },
          { layout: 'two', title: '③ 환경 변수: OPENCV_DIR · PATH', left: { title: '⌨ 명령 프롬프트', code: `setx OPENCV_DIR C:\\opencv\\build\\x64\\vc17
:: 새 창에서 확인
echo %OPENCV_DIR%
where opencv_world500d.dll`, lang: 'sh' }, right: { title: '🧰 GUI (PATH 는 이쪽으로)', bullets: ['“시스템 환경 변수 편집” → 환경 변수', '사용자 변수 <b>Path</b> → 편집 → 새로 만들기', '<code>%OPENCV_DIR%\\bin</code>', '⚠️ <b>Visual Studio 다시 시작</b>'] }, notes: '<p>setx 로 OPENCV_DIR 을 만들고 GUI 로 PATH 를 추가하는 것을 시연합니다. <code>setx PATH "%PATH%;..."</code> 가 PATH 를 1024 글자에서 잘라 버리는 위험을 꼭 경고합니다. 💬 “환경 변수를 바꿨는데 왜 Visual Studio 를 다시 켜야 할까?” — 프로그램은 시작할 때 환경 변수를 복사해 가기 때문. (7분)</p>' },
          { layout: 'code', title: '버전 확인: CV_VERSION', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    cout << "CV_VERSION         = " << CV_VERSION << endl;          // 헤더
    cout << "getVersionString() = " << getVersionString() << endl;  // DLL
    bool same = getVersionMajor() == CV_VERSION_MAJOR
             && getVersionMinor() == CV_VERSION_MINOR;
    cout << "헤더 = 라이브러리 ? " << (same ? "예" : "아니오") << endl;
    cout << "__cplusplus        = " << __cplusplus << endl;         // 201703 = C++17
    return 0;
}`, points: ['<code>CV_VERSION</code>: 컴파일할 때(헤더) · <code>getVersionString()</code>: 실행할 때(DLL)', '둘이 다르면 설치가 섞인 것 (옛 OpenCV 가 PATH 에)', 'OpenCV 5 는 <b>C++17</b> 필수 — <code>201703</code>'], notes: '<p>▶ 실행. 5.0.0 이 두 번 나오는 이유를 묻습니다 💬 — 하나는 헤더, 하나는 DLL. MSVC 에서 <code>__cplusplus</code> 가 199711 로 나오는 함정(/Zc:__cplusplus)을 짧게 언급합니다. (5분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: 'Debug 구성으로 빌드할 때 링크해야 하는 OpenCV 5.0.0 라이브러리는?', options: ['<code>opencv_world500.lib</code>', '<code>opencv_world500d.lib</code>', '<code>opencv_world500d.dll</code>', '<code>opencv_world5.lib</code>'], answer: 1, explain: 'Debug 는 이름 끝에 <b>d</b>. 링커에는 .lib, 실행에는 같은 짝의 .dll.', notes: '<p>정답 2번. .dll 을 고른 학생에게 “링커는 .lib, 실행은 .dll” 을 그림 2 로 다시 짚어 줍니다. (2분)</p>' },
          { layout: 'practice', title: '실습: 버전으로 lib 이름 만들기', desc: '<p><code>libName(debug, ext)</code> 를 완성해 다음을 출력하세요.</p><ul><li><code>opencv_world500d.lib</code> / <code>opencv_world500d.dll</code> (Debug)</li><li><code>opencv_world500.lib</code> / <code>opencv_world500.dll</code> (Release)</li><li><code>getVersionMajor/Minor/Revision()</code> + <code>to_string</code></li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

// TODO: "opencv_world" + 버전 숫자 3개 + (debug 이면 "d") + ext
string libName(bool debug, const string& ext)
{
    string s = "opencv_world";
    return s + ext;
}

int main()
{
    cout << "Debug   링크: " << libName(true, ".lib") << ", 실행: " << libName(true, ".dll") << endl;
    cout << "Release 링크: " << libName(false, ".lib") << ", 실행: " << libName(false, ".dll") << endl;
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

string libName(bool debug, const string& ext)
{
    string s = "opencv_world" + to_string(getVersionMajor())
             + to_string(getVersionMinor()) + to_string(getVersionRevision());
    if (debug) s += "d";
    return s + ext;
}

int main()
{
    cout << "Debug   링크: " << libName(true, ".lib") << ", 실행: " << libName(true, ".dll") << endl;
    cout << "Release 링크: " << libName(false, ".lib") << ", 실행: " << libName(false, ".dll") << endl;
    return 0;
}`, notes: '<p>이름 규칙을 코드로 만들어 보며 외우게 합니다. 빨리 끝낸 학생은 실습 2(전처리기 #if 점검)로. 💬 “OpenCV 5.1 이 나오면 lib 이름은?” — opencv_world510.lib. (6분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['Visual Studio: <b>C++를 사용한 데스크톱 개발</b> 워크로드', 'OpenCV 5.0.0: <code>opencv-5.0.0-windows.exe</code> → <code>C:\\opencv</code>', '<b>include</b> = 컴파일 · <b>lib</b> = 링크 · <b>bin(dll)</b> = 실행', '<code>OPENCV_DIR</code> = <code>…\\build\\x64\\vc17</code>, PATH += <code>%OPENCV_DIR%\\bin</code> → VS 재시작', 'Debug 는 <code>opencv_world500<b>d</b></code> · OpenCV 5 는 <b>C++17</b>', '다음 시간: 프로젝트 속성 · 속성 시트 · 오류 해결'], notes: '<p>세 폴더의 역할(컴파일 · 링크 · 실행)을 학생이 소리 내어 말하게 합니다. 2교시 전에 모든 학생의 <code>echo %OPENCV_DIR%</code> 결과가 나오는지 확인해 둡니다. (2분)</p>' }
        ]
      },
      // ============================================================ 2교시
      {
        id: 'cv01-2', title: '프로젝트 설정 · 속성 시트 · 설치 확인', minutes: 50,
        goals: ['x64 콘솔 프로젝트에 포함 · 라이브러리 디렉터리 · 추가 종속성 · C++17 · 작업 디렉터리를 설정할 수 있다', 'OpenCV5.props 속성 시트로 설정을 재사용하고 /utf-8 로 한글 출력을 맞출 수 있다', 'C1083 · LNK1104 · LNK2019 · DLL 없음 · 빈 Mat 오류를 단계별로 구분해 해결할 수 있다'],
        flow: [['도입: 빌드 3단계', 5], ['프로젝트 만들기 · 속성 설정', 17], ['속성 시트 · 한글 출력', 8], ['설치 확인 · 오류 해결', 15], ['정리 · 퀴즈', 5]],
        content: [
          { type: 'h', text: '컴파일 → 링크 → 실행: 설정이 세 군데인 이유' },
          { type: 'p', html: 'C++ 프로그램은 <b>세 단계</b>를 거쳐 실행됩니다. ① <b>컴파일러</b>(cl.exe)가 main.cpp 를 기계어(main.obj)로 바꿀 때 <code>opencv.hpp</code> 같은 <b>헤더</b>가 필요하고, ② <b>링커</b>(link.exe)가 main.obj 와 라이브러리를 묶어 main.exe 를 만들 때 <b>.lib</b> 가 필요하며, ③ main.exe 가 <b>실행</b>될 때 Windows 가 <b>.dll</b> 을 찾아 불러옵니다. 그래서 프로젝트 설정도 세 군데이고, 오류도 단계마다 다르게 나옵니다.' },
          { type: 'figure', html: FIG_STAGES, caption: '그림 3. 빌드 3단계와 필요한 파일 · 설정 위치 · 없을 때의 오류 — 오류 코드가 C 로 시작하면 컴파일, LNK 로 시작하면 링크 단계' },
          { type: 'h', text: '① 빈 프로젝트 만들기와 x64 플랫폼' },
          { type: 'list', ordered: true, items: [
            'Visual Studio 시작 → <b>새 프로젝트 만들기</b> → 언어 C++ → <b>빈 프로젝트</b>(Empty Project) 선택 (“콘솔 앱” 을 골라도 됩니다 — Hello World 가 든 cpp 가 생길 뿐).',
            '프로젝트 이름 <code>OpenCVFirst</code>, 위치는 한글 · 공백 없는 경로(예: <code>C:\\dev</code>).',
            '솔루션 탐색기 → <b>소스 파일</b> 오른쪽 클릭 → <b>추가 → 새 항목 → C++ 파일(.cpp)</b> → 이름 <code>main.cpp</code>.',
            '위쪽 도구 모음의 솔루션 플랫폼이 <b>x64</b> 인지 확인합니다 (<b>x86</b> 이면 x64 로 바꾸기).'
          ] },
          { type: 'callout', kind: 'warn', title: 'x86(Win32) 로 빌드하면 안 된다', html: 'OpenCV 5.0 Windows 패키지에는 <b>64비트(x64) 라이브러리만</b> 들어 있습니다. 플랫폼이 x86 이면 ① x64 에 넣은 설정이 적용되지 않아 <b>C1083 / LNK1104</b> 가 나거나, ② 64비트 lib 를 32비트 프로그램에 링크하려 해서 <b>LNK4272</b>(“라이브러리 컴퓨터 유형 x64 가 대상 컴퓨터 유형 x86 과 충돌”) + <b>LNK2019</b> 가 쏟아집니다. 설정 전에 <b>x64</b> 부터 고르세요.' },
          { type: 'h', text: '② 프로젝트 속성 설정 (모든 구성 · x64)' },
          { type: 'p', html: '솔루션 탐색기에서 프로젝트 이름을 <b>오른쪽 클릭 → 속성</b>(Alt+Enter). 위쪽 <b>구성: 모든 구성</b>, <b>플랫폼: x64</b> 로 맞춘 뒤 아래 표대로 입력합니다. <code>$(OPENCV_DIR)</code> 은 1교시에 만든 환경 변수로, Visual Studio 가 <code>C:\\opencv\\build\\x64\\vc17</code> 로 바꿔 읽습니다.' },
          { type: 'figure', html: FIG_PROPS, caption: '그림 4. 속성 페이지 — 구성 “모든 구성” · 플랫폼 “x64” 에서 ①~⑥ 을 설정. ③ 추가 종속성만 Debug / Release 를 따로 입력한다' },
          { type: 'table', head: ['번호', '위치 (구성 속성 → …)', '값', '구성'], rows: [
            ['①', 'C/C++ → 일반 → <b>추가 포함 디렉터리</b>', '<code>$(OPENCV_DIR)\\..\\..\\include</code>', '모든 구성'],
            ['②', '링커 → 일반 → <b>추가 라이브러리 디렉터리</b>', '<code>$(OPENCV_DIR)\\lib</code>', '모든 구성'],
            ['③', '링커 → 입력 → <b>추가 종속성</b>', '<code>opencv_world500d.lib;</code> (앞에 추가)', '<b>Debug</b>'],
            ['③', '링커 → 입력 → <b>추가 종속성</b>', '<code>opencv_world500.lib;</code> (앞에 추가)', '<b>Release</b>'],
            ['④', 'C/C++ → 언어 → <b>C++ 언어 표준</b>', 'ISO C++17 표준 (<code>/std:c++17</code>) 또는 C++20', '모든 구성'],
            ['⑤', '디버깅 → <b>작업 디렉터리</b>', '<code>$(ProjectDir)</code> (기본값)', '모든 구성'],
            ['⑥', 'C/C++ → 명령줄 → <b>추가 옵션</b>', '<code>/utf-8</code>', '모든 구성']
          ], caption: '표 2. OpenCV 5.0 프로젝트 설정 — $(OPENCV_DIR)\\..\\..\\include 는 “vc17 에서 두 단계 위(build) 의 include”' },
          { type: 'callout', kind: 'tip', title: '추가 종속성은 구성을 바꿔 두 번', html: '③ 은 <b>구성 드롭다운을 Debug 로 바꾸고</b> <code>opencv_world500d.lib</code> 를, 다시 <b>Release 로 바꾸고</b> <code>opencv_world500.lib</code> 를 입력합니다. 기존 값(<code>kernel32.lib;…</code> 또는 <code>%(AdditionalDependencies)</code>)은 지우지 말고 <b>맨 앞에</b> 세미콜론으로 이어 붙이세요. Debug 프로그램에 Release lib 를 쓰면 링크 경고(LNK4098) 또는 실행 중 알 수 없는 충돌이 납니다.' },
          { type: 'h', text: '③ main.cpp 에 설치 확인 프로그램 넣고 실행' },
          { type: 'code', title: '로컬 PC: 설치 확인 main.cpp', code: EX_LOCAL_TEST, run: false, local: true, file: 'main.cpp',
            desc: '<b>F5</b>(디버그 시작)로 실행합니다. 콘솔에 “읽기 성공” 이 나오고 <b>color</b> · <b>gray</b> 창이 열리면 설치 성공! <code>SetConsoleOutputCP(CP_UTF8)</code> 는 콘솔의 한글 출력을 맞추는 Windows API 이고, <code>NOMINMAX</code> 는 windows.h 의 <code>min/max</code> 매크로가 <code>cv::min/max</code> · <code>std::min/max</code> 를 망가뜨리지 않게 하는 관용구입니다. 이미지를 못 읽으면 ⑤ 작업 디렉터리를 보세요.' },
          { type: 'p', html: '같은 확인 과정을 브라우저에서도 해 봅니다. 모듈 세 개(imgcodecs · imgproc · highgui)가 모두 동작하는지 한 번에 점검하는 프로그램입니다.' },
          { type: 'code', title: '예제 3: 설치 확인 프로그램 — 읽기 · 변환 · 표시', code: EX_TEST,
            desc: '<code>"OpenCV " CV_VERSION " OK"</code> 처럼 문자열 리터럴을 나란히 쓰면 컴파일러가 하나로 이어 붙입니다(<code>CV_VERSION</code> 이 문자열 매크로라서 가능). <code>typeToString</code> 은 <code>CV_8UC3</code> 같은 형식 이름을 돌려주는 OpenCV 5 함수입니다. 로컬에서는 <code>waitKey(0)</code> 에서 키를 누를 때까지 멈췄다가 [3] 이 출력됩니다.',
            expect: 'OpenCV 5.0.0 설치 확인\n[1] imread   : 640 x 480, 3채널 CV_8UC3\n[2] cvtColor : 1채널 CV_8UC1\n[2] threshold: Otsu 임계값 101\n[3] imshow   : 창 2개 표시 → 설치 완료!' },
          { type: 'h', text: '④ 작업 디렉터리와 images 폴더' },
          { type: 'p', html: '<code>imread("images/sample_color.png")</code> 의 상대 경로는 <b>작업 디렉터리</b>(현재 폴더) 기준입니다. Visual Studio 에서 F5 로 실행하면 작업 디렉터리는 <b>디버깅 → 작업 디렉터리</b> 값(<code>$(ProjectDir)</code> = main.cpp 가 있는 프로젝트 폴더)입니다. 그래서 이 강좌 저장소의 <code>assets/images</code> 폴더를 <b>프로젝트 폴더에 <code>images</code> 로</b> 복사하면 됩니다. 단, exe(<code>x64\\Debug\\OpenCVFirst.exe</code>)를 탐색기에서 더블클릭하면 exe 가 있는 폴더가 작업 디렉터리가 되므로 거기에도 images 가 필요합니다.' },
          { type: 'code', title: '예제 4: 경로 확인과 빈 Mat 검사', code: EX_WORKDIR,
            desc: '<code>imread</code> 는 실패해도 <b>예외를 던지지 않고 빈 Mat</b> 을 돌려줍니다. 읽은 직후 <code>img.empty()</code> 를 검사하지 않으면, 빈 Mat 이 다음 함수로 넘어가서야 알 수 없는 오류가 납니다. 두 번째는 폴더 이름 오타(<code>image</code>), 세 번째는 파일 이름 오타(<code>colour</code>)입니다. 결과 창 위쪽의 실행 노트에도 “파일이 없어 빈 Mat” 안내가 나옵니다. 로컬에서는 <code>std::filesystem::exists(p)</code>(C++17)로 파일이 있는지 먼저 확인하면 “경로 문제” 와 “파일 형식 문제” 를 구분할 수 있습니다.',
            expect: '[images/sample_color.png]\n   -> OK 640 x 480\n[image/sample_color.png]\n   -> 빈 Mat! 작업 디렉터리 · 경로를 확인하세요\n[images/sample_colour.png]\n   -> 빈 Mat! 작업 디렉터리 · 경로를 확인하세요' },
          { type: 'code', title: '예제 5: OpenCV 오류는 cv::Exception 으로 잡는다', code: EX_EXCEPTION,
            desc: 'OpenCV 함수의 조건(assertion)이 깨지면 <b><code>cv::Exception</code></b> 이 던져집니다. 잡지 않으면 로컬에서는 “처리되지 않은 예외” 로 프로그램이 멈추고 Visual Studio 가 예외 창을 띄웁니다. <code>e.what()</code> 에는 <code>OpenCV(5.0.0) … error: (-15:Bad number of channels) …</code> 형식의 전체 메시지가, <code>e.err</code> 에는 깨진 조건, <code>e.code</code> 에는 오류 코드(<code>-15</code> = <code>Error::BadNumChannels</code>, 채널 수 오류), <code>e.func</code> 에는 오류가 난 함수 이름이 들어 있습니다. <code>e.func</code> 는 <code>cvtColor</code> 안의 템플릿 도우미처럼 <b>내부 함수의 긴 이름</b>으로 나오는 경우가 많아 출력에 쓰기에는 불편합니다.',
            expect: '입력: 1채널\ncv::Exception 발생!\n오류 코드: -15\n프로그램은 계속 실행됩니다' },
          { type: 'h', text: '⑤ 속성 시트(OpenCV5.props)로 설정 재사용하기' },
          { type: 'p', html: '새 프로젝트를 만들 때마다 표 2 를 다시 입력하는 것은 번거롭고 실수하기 쉽습니다. <b>속성 시트(.props)</b>는 프로젝트 설정만 모은 XML 파일로, 여러 프로젝트에 붙여 쓸 수 있습니다. 아래 파일을 <code>OpenCV5.props</code> 로 저장해 두면 새 프로젝트에서 <b>한 번의 “추가”</b>로 OpenCV 설정이 끝납니다. <code>Condition="\'$(Configuration)\'==\'Debug\'"</code> 로 Debug/Release 의 lib 이름을 자동으로 고릅니다.' },
          { type: 'code', title: 'OpenCV5.props — OpenCV 5.0 속성 시트', lang: 'xml', file: 'OpenCV5.props', code: XML_PROPS, run: false,
            desc: '<code>%(AdditionalDependencies)</code> 처럼 <code>%(…)</code> 는 “기존 값 이어 붙이기” 입니다. <code>LocalDebuggerEnvironment</code> 는 F5 로 실행할 때만 PATH 앞에 bin 폴더를 붙여 주므로, 시스템 PATH 를 건드리지 않아도 DLL 을 찾습니다. <code>/Zc:__cplusplus</code> 는 <code>__cplusplus</code> 매크로가 실제 표준(201703)을 보고하게 합니다. OpenCV 버전이 바뀌면 <code>&lt;OpenCVVer&gt;</code> 한 줄만 고치세요.' },
          { type: 'callout', kind: 'vs', title: '속성 시트 추가하는 법', html: '<ol><li>메뉴 <b>보기 → 다른 창 → 속성 관리자</b>(Property Manager).</li><li>프로젝트 이름 아래 <b>Debug | x64</b> · <b>Release | x64</b> 가 보입니다. 프로젝트 이름을 오른쪽 클릭 → <b>기존 속성 시트 추가</b> → <code>OpenCV5.props</code> 선택 (두 구성에 한 번에 추가됨).</li><li>프로젝트 속성을 열어 보면 ①~⑥ 항목이 <b>굵지 않은 글씨</b>(상속된 값)로 채워져 있습니다. 프로젝트에서 직접 입력한 값(굵은 글씨)은 속성 시트보다 우선하므로, 앞에서 손으로 넣은 값이 있다면 <b>&lt;부모 또는 프로젝트 기본값에서 상속&gt;</b> 으로 되돌리세요.</li><li>이 강좌의 <code>vs/OpenCV5Starter</code> 솔루션에는 <code>OpenCV5.props</code> 가 이미 연결되어 있어, 열고 x64 로 F5 만 누르면 됩니다 (준비 중).</li></ol>' },
          { type: 'code', title: '추가 종속성 대신 #pragma comment 쓰기 (MSVC 전용)', code: CPP_PRAGMA, run: false,
            desc: '<code>#pragma comment(lib, "…")</code> 는 “이 lib 를 링크하라” 는 메모를 obj 파일에 남기는 MSVC 확장입니다. 설정 화면을 몰라도 소스만 보고 어떤 lib 가 필요한지 알 수 있다는 장점이 있지만, 다른 컴파일러(GCC · Clang)에서는 무시되고 버전 숫자가 소스에 박히므로 이 강좌는 속성 시트를 권장합니다.' },
          { type: 'h', text: '⑥ 한글 출력이 깨질 때: /utf-8 과 콘솔 코드 페이지' },
          { type: 'p', html: '이 강좌의 코드는 <code>cout &lt;&lt; "읽기 성공"</code> 처럼 한글을 출력합니다. 한국어 Windows 는 기본 코드 페이지가 <b>CP949</b> 라서 두 군데에서 깨질 수 있습니다. ① 컴파일러가 BOM 없는 UTF-8 소스 파일을 CP949 로 잘못 읽으면 경고 <b>C4819</b> 와 함께 문자열이 망가지고, ② UTF-8 로 만든 문자열을 콘솔이 CP949 로 해석하면 <code>?쎄린</code> 같은 글자가 나옵니다. <b>/utf-8</b> 옵션(소스 · 실행 문자 집합 모두 UTF-8)과 <b><code>SetConsoleOutputCP(CP_UTF8)</code></b>(또는 실행 전 <code>chcp 65001</code>)를 <b>함께</b> 쓰면 해결됩니다.' },
          { type: 'code', title: '한글 출력 설정 정리', code: CPP_UTF8, run: false },
          { type: 'h', text: '흔한 오류와 해결' },
          { type: 'table', head: ['증상 (오류 메시지)', '단계', '원인', '해결'], rows: [
            ['<code>C1083: 포함 파일을 열 수 없습니다. \'opencv2/opencv.hpp\'</code>', '컴파일', '추가 포함 디렉터리 누락 · 오타, 플랫폼 x86', '①: <code>$(OPENCV_DIR)\\..\\..\\include</code>, 구성 “모든 구성” · x64 확인, <code>echo %OPENCV_DIR%</code>'],
            ['OpenCV 헤더 안에서 <code>C2039 · C7525</code> 등 수십 개 오류', '컴파일', 'C++ 언어 표준이 C++14', '④: <b>ISO C++17</b> 이상'],
            ['<code>LNK1104: \'opencv_world500d.lib\' 파일을 열 수 없습니다</code>', '링크', '라이브러리 디렉터리 틀림 · vcNN 폴더 이름 · lib 이름 오타', '②·③: <code>dir %OPENCV_DIR%\\lib</code> 결과를 복사해 입력'],
            ['<code>LNK2019: 확인할 수 없는 외부 기호 "cv::imread …"</code>', '링크', '추가 종속성 누락, x86 로 빌드(LNK4272 동반), 다른 구성에만 입력', '③ 을 Debug · Release 각각, 플랫폼 x64'],
            ['“<b>opencv_world500d.dll 이(가) 없어</b> 코드 실행을 진행할 수 없습니다”', '실행', 'PATH 에 bin 없음, PATH 바꾼 뒤 VS 재시작 안 함', 'PATH 추가 → <b>VS 재시작</b>, 또는 DLL 을 exe 옆에 복사, 또는 props 의 <code>LocalDebuggerEnvironment</code>'],
            ['<code>imread</code> 가 빈 Mat (<code>empty() == true</code>)', '실행', '작업 디렉터리에 images/ 없음, 경로 오타', '⑤: <code>$(ProjectDir)</code> 에 images 복사, 예제 4 처럼 확인'],
            ['한글이 <code>?쎄린</code> · <code>챙챙</code> 처럼 깨짐, 경고 C4819', '컴파일 · 실행', '소스 · 콘솔 코드 페이지 불일치', '⑥: <code>/utf-8</code> + <code>SetConsoleOutputCP(CP_UTF8)</code>'],
            ['<code>imshow</code> 창이 떴다가 바로 사라짐', '실행', '<code>waitKey</code> 없이 main 이 끝남', '<code>waitKey(0);</code> 추가']
          ], caption: '표 3. 설치 · 설정에서 자주 만나는 오류 — 먼저 오류 코드로 단계(C = 컴파일, LNK = 링크, 창 = 실행)를 구분한다' },
          { type: 'callout', kind: 'tip', title: '오류 목록은 “출력” 창에서 첫 번째 오류부터', html: '오류 목록 창은 오류를 정렬해 보여 주므로 원인과 결과가 섞입니다. <b>보기 → 출력</b>(Ctrl+Alt+O) 창에서 <b>가장 위에 나온 첫 오류</b>를 먼저 고치세요. 헤더 하나를 못 찾으면 그 뒤의 수백 개 오류가 모두 따라 나옵니다.' },
          { type: 'callout', kind: 'field', title: '🏭 다른 PC 에 프로그램을 배포할 때', html: '완성한 exe 를 검사 장비 PC 로 옮길 때는 <b>Release</b> 로 빌드하고, exe 옆에 <code>opencv_world500.dll</code>(동영상을 쓰면 <code>opencv_videoio_ffmpeg500_64.dll</code> 도)을 함께 복사합니다. 대상 PC 에 Visual Studio 가 없으면 <b>Visual C++ 재배포 가능 패키지(x64)</b>도 설치해야 합니다. Debug DLL(<code>…d.dll</code>)은 배포할 수 없습니다.' },
          { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 체크리스트', html: '<ul><li>학생 PC 에 VS 2022 C++ 워크로드가 설치되어 있는지 사전 점검 (설치는 수업 시간 안에 끝나지 않음).</li><li><code>opencv-5.0.0-windows.exe</code> 를 공유 폴더 · USB 로 배포, 가능하면 <code>C:\\opencv</code> 에 미리 풀어 둠. 실제 <code>vcNN</code> 폴더 · lib 이름을 교사가 먼저 확인해 칠판에 적어 둡니다.</li><li><code>OpenCV5.props</code> 와 <code>assets/images</code> 를 공유 폴더에 준비 — 1교시에 손으로 설정해 본 뒤 2교시 후반에 props 로 교체해 비교.</li><li>일부러 오류를 만들어 보는 시연 준비: ① 포함 디렉터리 지우기 → C1083 ② x86 로 바꾸기 → LNK ③ PATH 빼고 실행 → DLL 없음 ④ images 폴더 이름 바꾸기 → 빈 Mat.</li><li>평가: 설치 확인 프로그램이 Debug · Release 두 구성 모두에서 실행되면 통과.</li></ul>' }
        ],
        practice: [
          {
            title: '설치 점검 프로그램: 예제 이미지 목록 검사', level: 1,
            desc: '작업 디렉터리에 강좌 예제 이미지가 제대로 복사되었는지 확인하는 프로그램을 완성하세요. <code>files</code> 의 각 파일을 <code>IMREAD_UNCHANGED</code> 로 읽어 성공하면 <b>“OK   파일 너비x높이 N채널”</b>, 실패하면 <b>“FAIL 파일”</b> 을 출력하고, 마지막에 <b>“결과: 성공 개수/전체”</b> 를 출력합니다.',
            hint: '<code>Mat m = imread(f, IMREAD_UNCHANGED); if (m.empty()) { … continue; }</code>. 배열 크기는 <code>size(files)</code>(C++17) 또는 <code>sizeof(files) / sizeof(files[0])</code>.',
            expect: 'OK   images/sample_color.png 640x480 3채널\nOK   images/sample_gray.png 640x480 1채널\nFAIL images/sample.png\nOK   images/washers.png 640x480 1채널\n결과: 3/4',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

int main()
{
    string files[] = { "images/sample_color.png", "images/sample_gray.png",
                       "images/sample.png", "images/washers.png" };
    int ok = 0;
    for (const string& f : files)
    {
        // TODO: IMREAD_UNCHANGED 로 읽고, 실패면 "FAIL 파일", 성공이면 "OK   파일 WxH N채널"
        cout << f << endl;
    }
    // TODO: "결과: 성공/전체" 출력
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

int main()
{
    string files[] = { "images/sample_color.png", "images/sample_gray.png",
                       "images/sample.png", "images/washers.png" };
    int ok = 0;
    for (const string& f : files)
    {
        Mat m = imread(f, IMREAD_UNCHANGED);
        if (m.empty())
        {
            cout << "FAIL " << f << endl;
            continue;
        }
        ok++;
        cout << "OK   " << f << " " << m.cols << "x" << m.rows << " " << m.channels() << "채널" << endl;
    }
    cout << "결과: " << ok << "/" << size(files) << endl;
    return 0;
}`
          },
          {
            title: '안전한 처리 함수: cv::Exception 잡기', level: 2,
            desc: '<code>toGray(const Mat&amp; src, Mat&amp; dst)</code> 함수를 완성하세요. 입력이 <b>비어 있으면</b> “빈 입력” 을 출력하고 <code>false</code>, <b>3채널이면</b> <code>cvtColor</code> 로 변환, <b>1채널이면</b> <code>clone()</code> 으로 복사해 <code>true</code> 를 돌려줍니다. 혹시 모를 다른 오류는 <code>try/catch (const cv::Exception&amp;)</code> 로 잡아 “OpenCV 오류” 를 출력하고 <code>false</code>.',
            hint: '<code>if (src.empty()) { … return false; }</code> → <code>if (src.channels() == 3) cvtColor(src, dst, COLOR_BGR2GRAY); else dst = src.clone();</code>. 전체를 <code>try { … } catch (const cv::Exception&amp; e) { … }</code> 로 감쌉니다.',
            expect: 'images/sample_color.png -> 1채널 CV_8UC1\nimages/washers.png -> 1채널 CV_8UC1\n빈 입력\nimages/nothing.png -> 실패',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

// TODO: 빈 입력 검사 → 3채널이면 cvtColor, 1채널이면 clone → try/catch
bool toGray(const Mat& src, Mat& dst)
{
    dst = src.clone();     // 지금은 복사만 합니다
    return true;
}

int main()
{
    string files[] = { "images/sample_color.png", "images/washers.png", "images/nothing.png" };
    for (const string& f : files)
    {
        Mat img = imread(f, IMREAD_UNCHANGED), gray;
        if (toGray(img, gray))
            cout << f << " -> " << gray.channels() << "채널 " << typeToString(gray.type()) << endl;
        else
            cout << f << " -> 실패" << endl;
    }
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

bool toGray(const Mat& src, Mat& dst)
{
    if (src.empty()) { cout << "빈 입력" << endl; return false; }
    try
    {
        if (src.channels() == 3) cvtColor(src, dst, COLOR_BGR2GRAY);
        else dst = src.clone();
        return true;
    }
    catch (const cv::Exception& e)
    {
        cout << "OpenCV 오류: " << e.func << endl;
        return false;
    }
}

int main()
{
    string files[] = { "images/sample_color.png", "images/washers.png", "images/nothing.png" };
    for (const string& f : files)
    {
        Mat img = imread(f, IMREAD_UNCHANGED), gray;
        if (toGray(img, gray))
            cout << f << " -> " << gray.channels() << "채널 " << typeToString(gray.type()) << endl;
        else
            cout << f << " -> 실패" << endl;
    }
    return 0;
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: '01. Visual Studio 에 OpenCV 5.0 설치 · 설정하기', subtitle: '2교시 — 프로젝트 설정 · 속성 시트 · 설치 확인', notes: '<p>1교시에 설치한 것을 확인합니다: 새 명령 프롬프트에서 <code>echo %OPENCV_DIR%</code> 와 <code>where opencv_world500d.dll</code>. 안 나오는 학생은 이 시간 초반에 먼저 해결합니다. (3분)</p>' },
          { layout: 'diagram', title: '빌드 3단계: 컴파일 → 링크 → 실행', html: FIG_STAGES, caption: '헤더 = 컴파일 · .lib = 링크 · .dll = 실행 — 오류 코드 C / LNK 로 단계를 구분', notes: '<p>이 그림이 오늘의 핵심입니다. 💬 “빌드는 성공했는데 실행하면 DLL 이 없다고 한다. 어느 단계 문제일까?” — 실행 단계, PATH. “LNK2019 는?” — 링크 단계, lib. 오류 코드 앞 글자만 보고 단계를 맞히는 연습을 합니다. (5분)</p>' },
          { layout: 'bullets', title: '① 빈 프로젝트 + x64', bullets: [
            '새 프로젝트 → C++ → <b>빈 프로젝트</b> → 이름 <code>OpenCVFirst</code> (경로: 한글 · 공백 없이)',
            '소스 파일 → 추가 → 새 항목 → <code>main.cpp</code>',
            '도구 모음 솔루션 플랫폼 <b>x64</b> ← 가장 먼저!',
            '⚠️ OpenCV 패키지는 <b>x64 전용</b> — x86 이면 C1083 · LNK1104 · LNK4272'
          ], notes: '<p>교사 화면으로 따라 하게 합니다. x86/x64 드롭다운 위치를 꼭 짚어 줍니다 — 이 강좌에서 가장 흔한 실수입니다. (4분)</p>' },
          { layout: 'diagram', title: '② 프로젝트 속성 페이지', html: FIG_PROPS, caption: '구성: 모든 구성 · 플랫폼: x64 → ①~⑥ 입력 (③ 만 Debug / Release 따로)', notes: '<p>속성 페이지(Alt+Enter)를 열고 위쪽 드롭다운 두 개를 먼저 맞춥니다. 트리에서 항목을 찾아가는 경로를 그림과 실제 화면을 번갈아 보며 안내합니다. 학생들은 1교시에 적어 둔 vcNN · lib 이름을 씁니다. (4분)</p>' },
          { layout: 'table', title: '설정 값 정리', head: ['항목', '값', '구성'], rows: [
            ['추가 포함 디렉터리', '<code>$(OPENCV_DIR)\\..\\..\\include</code>', '모든 구성'],
            ['추가 라이브러리 디렉터리', '<code>$(OPENCV_DIR)\\lib</code>', '모든 구성'],
            ['추가 종속성', '<code>opencv_world500d.lib</code>', 'Debug'],
            ['추가 종속성', '<code>opencv_world500.lib</code>', 'Release'],
            ['C++ 언어 표준', 'ISO C++17 (<code>/std:c++17</code>)', '모든 구성'],
            ['작업 디렉터리 · 추가 옵션', '<code>$(ProjectDir)</code> · <code>/utf-8</code>', '모든 구성']
          ], lead: '$(OPENCV_DIR) = C:\\opencv\\build\\x64\\vc17', notes: '<p>학생들이 입력하는 동안 돌아다니며 확인합니다. 흔한 실수: 추가 종속성을 “모든 구성” 에 d 붙은 이름 하나만 넣음, 기존 값 지워 버림, <code>..\\..</code> 개수 틀림. 💬 “<code>$(OPENCV_DIR)\\..\\..\\include</code> 는 실제로 어느 폴더?” — C:\\opencv\\build\\include. (8분)</p>' },
          { layout: 'code', title: '설치 확인: 읽기 · 변환 · 표시', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    cout << "OpenCV " << CV_VERSION << " 설치 확인" << endl;
    Mat img = imread("images/sample_color.png");
    if (img.empty()) { cout << "읽기 실패 → 작업 디렉터리 확인" << endl; return -1; }
    cout << "imread: " << img.cols << " x " << img.rows << ", " << img.channels() << "채널" << endl;

    Mat gray;
    cvtColor(img, gray, COLOR_BGR2GRAY);
    cout << "cvtColor: " << typeToString(gray.type()) << endl;

    putText(img, "OpenCV " CV_VERSION " OK", Point(20, 40),
            FONT_HERSHEY_SIMPLEX, 1.0, Scalar(0, 0, 255), 2);
    imshow("color", img);
    imshow("gray", gray);
    waitKey(0);
    return 0;
}`, points: ['imgcodecs · imgproc · highgui 세 모듈을 한 번에 점검', '<code>empty()</code> 검사 — imread 는 실패해도 예외가 없다', '로컬: F5 → 창 2개 → 키를 누르면 종료'], notes: '<p>브라우저에서 ▶ 실행으로 결과를 보여 준 뒤, 같은 코드를 학생 프로젝트의 main.cpp 에 붙여 F5. 창이 두 개 뜨면 성공! 처음엔 “읽기 실패” 가 나오는 학생이 많습니다 → 다음 슬라이드. (6분)</p>' },
          { layout: 'two', title: '작업 디렉터리와 images 폴더', left: { title: '📁 어디에 두나?', bullets: ['F5 실행: 작업 디렉터리 = <code>$(ProjectDir)</code>', '→ 프로젝트 폴더에 <code>images/</code> 복사', 'exe 더블클릭: exe 폴더(<code>x64\\Debug</code>) 기준', 'imread 실패 = 예외 없이 <b>빈 Mat</b>'] }, right: { title: '🔍 확인 코드', code: `Mat img = imread(p);
if (img.empty())
{
    cout << "빈 Mat! 경로 확인" << endl;
    return -1;
}`, lang: 'cpp' }, notes: '<p>탐색기로 프로젝트 폴더를 열어 main.cpp 옆에 images 폴더를 복사하고 다시 F5. 💬 “exe 를 더블클릭해서 실행하면 왜 또 못 읽을까?” — 작업 디렉터리가 달라지기 때문. (4분)</p>' },
          { layout: 'code', title: '속성 시트 OpenCV5.props (핵심 부분)', lang: 'xml', run: false, file: 'OpenCV5.props', code: `<ItemDefinitionGroup>
  <ClCompile>
    <AdditionalIncludeDirectories>$(OPENCV_DIR)\\..\\..\\include;%(AdditionalIncludeDirectories)</AdditionalIncludeDirectories>
    <LanguageStandard>stdcpp17</LanguageStandard>
    <AdditionalOptions>/utf-8 %(AdditionalOptions)</AdditionalOptions>
  </ClCompile>
  <Link>
    <AdditionalLibraryDirectories>$(OPENCV_DIR)\\lib;%(AdditionalLibraryDirectories)</AdditionalLibraryDirectories>
  </Link>
</ItemDefinitionGroup>
<ItemDefinitionGroup Condition="'$(Configuration)'=='Debug'">
  <Link>
    <AdditionalDependencies>opencv_world500d.lib;%(AdditionalDependencies)</AdditionalDependencies>
  </Link>
</ItemDefinitionGroup>
<ItemDefinitionGroup Condition="'$(Configuration)'=='Release'">
  <Link>
    <AdditionalDependencies>opencv_world500.lib;%(AdditionalDependencies)</AdditionalDependencies>
  </Link>
</ItemDefinitionGroup>`, points: ['표 2 의 설정을 XML 한 파일로', '<code>Condition</code> 으로 Debug/Release lib 자동 선택', '속성 관리자 → <b>기존 속성 시트 추가</b>'], notes: '<p>방금 손으로 한 설정이 XML 로 어떻게 보이는지 대응시켜 줍니다. 속성 관리자에서 props 를 추가하는 것을 시연하고, 새 프로젝트를 하나 더 만들어 props 만 추가해 1분 만에 동작시키는 것을 보여 줍니다. vs/OpenCV5Starter 에 같은 파일이 들어갈 예정이라고 안내. (5분)</p>' },
          { layout: 'two', title: '한글이 깨질 때', left: { title: '① 컴파일러 쪽', bullets: ['BOM 없는 UTF-8 소스를 CP949 로 읽음', '경고 <b>C4819</b>', '해결: 추가 옵션 <code>/utf-8</code>'] }, right: { title: '② 콘솔 쪽', bullets: ['UTF-8 문자열을 CP949 로 표시', '<code>?쎄린</code> 같은 글자', '해결: <code>SetConsoleOutputCP(CP_UTF8);</code>', '또는 <code>chcp 65001</code>'] }, notes: '<p>/utf-8 을 빼고 실행해 깨지는 것을 직접 보여 준 뒤 다시 넣어 비교하면 효과적입니다. windows.h 를 쓸 때 <code>#define NOMINMAX</code> 를 먼저 쓰는 이유(min/max 매크로)도 짧게. (3분)</p>' },
          { layout: 'table', title: '흔한 오류 → 단계 → 해결', head: ['오류', '단계', '해결'], rows: [
            ['<code>C1083</code> 헤더 없음', '컴파일', '추가 포함 디렉터리 · x64'],
            ['헤더 안 수십 개 오류', '컴파일', 'C++17 로'],
            ['<code>LNK1104</code> lib 못 엶', '링크', 'lib 폴더 · 이름 (dir 로 확인)'],
            ['<code>LNK2019</code> 외부 기호', '링크', '추가 종속성 · x64 · d 접미사'],
            ['…500d.dll 이 없어', '실행', 'PATH + VS 재시작 / exe 옆 복사'],
            ['imread 빈 Mat', '실행', '작업 디렉터리에 images/']
          ], notes: '<p>시연: 설정을 하나씩 일부러 망가뜨리고 어떤 오류가 나는지 학생이 먼저 예측하게 합니다 💬 “포함 디렉터리를 지우면?” — C1083. “PATH 를 빼면?” — 빌드는 성공, 실행 시 DLL 없음. 출력 창의 <b>첫 번째 오류</b>부터 보라고 강조. (5분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>LNK1104: \'opencv_world500d.lib\' 파일을 열 수 없습니다</code> 의 원인으로 가장 가능성이 <u>낮은</u> 것은?', options: ['추가 라이브러리 디렉터리 경로가 틀렸다', '솔루션 플랫폼이 x86 이다', '<code>using namespace cv;</code> 를 빠뜨렸다', '설정을 Release 에만 넣고 Debug 로 빌드했다'], answer: 2, explain: 'LNK1104 는 링커가 .lib 파일을 못 찾은 것 — 경로 · 플랫폼 · 구성 문제. using 누락은 컴파일 오류.', notes: '<p>정답 3번. 오류 단계 구분(C vs LNK)을 다시 확인합니다. (2분)</p>' },
          { layout: 'practice', title: '실습: 설치 점검 프로그램', desc: '<p>예제 이미지 4개를 <code>IMREAD_UNCHANGED</code> 로 읽어 점검하세요.</p><ul><li>성공: <code>OK   파일 WxH N채널</code></li><li>실패: <code>FAIL 파일</code></li><li>마지막 줄: <code>결과: 3/4</code></li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

int main()
{
    string files[] = { "images/sample_color.png", "images/sample_gray.png",
                       "images/sample.png", "images/washers.png" };
    int ok = 0;
    for (const string& f : files)
    {
        // TODO: 읽기 → FAIL / OK 출력
        cout << f << endl;
    }
    // TODO: "결과: 성공/전체"
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

int main()
{
    string files[] = { "images/sample_color.png", "images/sample_gray.png",
                       "images/sample.png", "images/washers.png" };
    int ok = 0;
    for (const string& f : files)
    {
        Mat m = imread(f, IMREAD_UNCHANGED);
        if (m.empty()) { cout << "FAIL " << f << endl; continue; }
        ok++;
        cout << "OK   " << f << " " << m.cols << "x" << m.rows << " " << m.channels() << "채널" << endl;
    }
    cout << "결과: " << ok << "/" << size(files) << endl;
    return 0;
}`, notes: '<p>브라우저에서 완성한 뒤 <b>로컬 프로젝트에서도</b> 실행해 같은 결과가 나오는지 확인하게 합니다 — 이것이 오늘의 최종 점검입니다. Debug · Release 둘 다 실행되면 통과. (6분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['빌드 3단계: 헤더(컴파일) · <b>.lib</b>(링크) · <b>.dll</b>(실행) — 오류 코드 C / LNK', '플랫폼 <b>x64</b>, 구성 “모든 구성” 에서 포함 · 라이브러리 · C++17 · /utf-8', '추가 종속성: Debug <code>opencv_world500d.lib</code> · Release <code>opencv_world500.lib</code>', '<b>OpenCV5.props</b> 로 새 프로젝트도 한 번에', '작업 디렉터리에 <code>images/</code> · <code>empty()</code> 검사 · <code>cv::Exception</code>', '다음 시간: imread · imshow · imwrite · 창과 키 다루기'], notes: '<p>오늘 만든 OpenCVFirst 프로젝트(또는 props)를 앞으로 계속 쓴다고 안내합니다. 설치가 끝나지 않은 학생은 다음 시간 전까지 완료하고, 그동안은 브라우저에서 따라올 수 있다고 안심시킵니다. (2분)</p>' }
        ]
      }
    ]
  });
})();
