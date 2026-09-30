/* 15차시 동영상과 카메라: VideoCapture */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 캡처 루프
  const FIG_LOOP = `<svg viewBox="0 0 760 350" role="img" aria-label="VideoCapture 열기부터 read 반복, 처리, imshow, waitKey 종료, release 까지의 흐름도">
  ${ARROW('c15a1')}
  <rect x="270" y="14" width="220" height="44" rx="10" class="p1s"/>
  <text x="380" y="34" text-anchor="middle" class="tx-b">VideoCapture cap(0);</text>
  <text x="380" y="51" text-anchor="middle" class="tx-m">카메라 번호 또는 파일 경로</text>
  <line x1="380" y1="58" x2="380" y2="78" class="ln" stroke-width="2" marker-end="url(#c15a1)"/>
  <rect x="290" y="80" width="180" height="38" rx="10" class="p2s"/>
  <text x="380" y="104" text-anchor="middle" class="tx">cap.isOpened() ?</text>
  <line x1="470" y1="99" x2="570" y2="99" class="ln" stroke-width="2" marker-end="url(#c15a1)"/>
  <text x="520" y="92" text-anchor="middle" class="tx-m">false</text>
  <rect x="572" y="80" width="170" height="38" rx="10" class="p5s"/>
  <text x="657" y="104" text-anchor="middle" class="tx">안내 후 return -1</text>
  <line x1="380" y1="118" x2="380" y2="140" class="ln" stroke-width="2" marker-end="url(#c15a1)"/>
  <text x="402" y="134" class="tx-m">true</text>
  <rect x="120" y="142" width="520" height="150" rx="12" class="card-bg"/>
  <text x="140" y="164" class="tx-b">while (cap.read(frame))  — 프레임 루프</text>
  <rect x="146" y="176" width="150" height="42" rx="8" class="p1s"/>
  <text x="221" y="194" text-anchor="middle" class="tx">cap.read(frame)</text>
  <text x="221" y="211" text-anchor="middle" class="tx-m">성공 true · 끝 false</text>
  <line x1="296" y1="197" x2="332" y2="197" class="ln" stroke-width="2" marker-end="url(#c15a1)"/>
  <rect x="334" y="176" width="130" height="42" rx="8" class="p2s"/>
  <text x="399" y="194" text-anchor="middle" class="tx">프레임 처리</text>
  <text x="399" y="211" text-anchor="middle" class="tx-m">gray · Canny · 검출</text>
  <line x1="464" y1="197" x2="500" y2="197" class="ln" stroke-width="2" marker-end="url(#c15a1)"/>
  <rect x="502" y="176" width="116" height="42" rx="8" class="p3s"/>
  <text x="560" y="194" text-anchor="middle" class="tx">imshow</text>
  <text x="560" y="211" text-anchor="middle" class="tx-m">그릴 내용 등록</text>
  <rect x="290" y="236" width="240" height="42" rx="8" class="p4s"/>
  <text x="410" y="254" text-anchor="middle" class="tx">waitKey(30) == 27 ?</text>
  <text x="410" y="271" text-anchor="middle" class="tx-m">창 그리기 + 키 확인 · 27 = ESC → break</text>
  <path d="M 560 218 L 560 257 L 534 257" class="ln" stroke-width="2" fill="none" marker-end="url(#c15a1)"/>
  <path d="M 290 257 L 221 257 L 221 222" class="ln" stroke-width="2" fill="none" marker-end="url(#c15a1)"/>
  <line x1="380" y1="292" x2="380" y2="310" class="ln" stroke-width="2" marker-end="url(#c15a1)"/>
  <rect x="230" y="312" width="300" height="32" rx="8" class="p5s"/>
  <text x="380" y="333" text-anchor="middle" class="tx">cap.release()  (소멸자도 자동으로 호출)</text>
  <text x="14" y="180" class="tx-m">read 가 false 면</text>
  <text x="14" y="198" class="tx-m">루프 종료</text>
  <text x="14" y="216" class="tx-m">(파일 끝 · 카메라 끊김)</text>
  <text x="650" y="180" class="tx-m">waitKey 는 반드시!</text>
  <text x="650" y="198" class="tx-m">없으면 창이</text>
  <text x="650" y="216" class="tx-m">갱신되지 않는다</text>
</svg>`;

  // 그림 2: 움직임 검출 파이프라인
  const FIG_MOTION = `<svg viewBox="0 0 760 320" role="img" aria-label="프레임 차이 또는 배경 차분으로 전경 마스크를 만들고 모폴로지와 윤곽선으로 물체를 찾아 기준선 통과를 세는 흐름">
  ${ARROW('c15b1')}
  <text x="120" y="24" text-anchor="middle" class="tx-b">① 두 프레임 비교</text>
  <rect x="20" y="34" width="200" height="110" rx="8" class="card-bg"/>
  <rect x="38" y="50" width="78" height="52" rx="4" class="p1s"/><text x="77" y="80" text-anchor="middle" class="tx-m">이전 prev</text>
  <rect x="124" y="50" width="78" height="52" rx="4" class="p2s"/><text x="163" y="80" text-anchor="middle" class="tx-m">현재 gray</text>
  <text x="120" y="126" text-anchor="middle" class="tx">absdiff(gray, prev, diff)</text>
  <text x="120" y="162" text-anchor="middle" class="tx-m">또는 <tspan class="tx-b">BackgroundSubtractorMOG2</tspan></text>
  <text x="120" y="180" text-anchor="middle" class="tx-m">bg-&gt;apply(frame, fg)</text>
  <line x1="228" y1="90" x2="264" y2="90" class="ln" stroke-width="2" marker-end="url(#c15b1)"/>
  <text x="330" y="24" text-anchor="middle" class="tx-b">② 이진화 · 모폴로지</text>
  <rect x="266" y="34" width="130" height="110" rx="8" class="card-bg"/>
  <circle cx="300" cy="66" r="4" class="p5"/><circle cx="340" cy="58" r="3" class="p5"/><circle cx="370" cy="84" r="3" class="p5"/>
  <rect x="304" y="92" width="34" height="34" rx="6" class="p1"/>
  <rect x="348" y="96" width="30" height="30" rx="6" class="p1"/>
  <text x="330" y="162" text-anchor="middle" class="tx">threshold</text>
  <text x="330" y="180" text-anchor="middle" class="tx">MORPH_OPEN</text>
  <text x="330" y="200" text-anchor="middle" class="tx-m">작은 점 잡음 제거</text>
  <line x1="404" y1="90" x2="440" y2="90" class="ln" stroke-width="2" marker-end="url(#c15b1)"/>
  <text x="510" y="24" text-anchor="middle" class="tx-b">③ 윤곽선 → 물체</text>
  <rect x="442" y="34" width="130" height="110" rx="8" class="card-bg"/>
  <rect x="462" y="60" width="44" height="44" rx="4" class="s1" fill="none" stroke-width="2.5"/>
  <rect x="516" y="66" width="38" height="38" rx="4" class="s1" fill="none" stroke-width="2.5"/>
  <text x="510" y="162" text-anchor="middle" class="tx">findContours</text>
  <text x="510" y="180" text-anchor="middle" class="tx">면적 필터 → boundingRect</text>
  <text x="510" y="200" text-anchor="middle" class="tx-m">중심 = 사각형의 가운데</text>
  <line x1="580" y1="90" x2="616" y2="90" class="ln" stroke-width="2" marker-end="url(#c15b1)"/>
  <text x="680" y="24" text-anchor="middle" class="tx-b">④ 기준선 통과 카운트</text>
  <rect x="618" y="34" width="130" height="110" rx="8" class="card-bg"/>
  <line x1="683" y1="40" x2="683" y2="138" class="s4" stroke-width="3"/>
  <circle cx="650" cy="70" r="9" class="p2"/>
  <circle cx="706" cy="70" r="9" class="p1"/>
  <line x1="662" y1="70" x2="694" y2="70" class="ln" stroke-width="1.5" stroke-dasharray="3 3" marker-end="url(#c15b1)"/>
  <text x="683" y="118" text-anchor="middle" class="tx-m">이전 &lt; 320 ≤ 현재</text>
  <text x="683" y="162" text-anchor="middle" class="tx">→ crossed++</text>
  <text x="683" y="182" text-anchor="middle" class="tx-m">한 번만 세는 비결</text>
  <text x="20" y="244" class="tx-m">⚠️ 프레임 차이(absdiff)는 <tspan class="tx-b">카메라가 고정</tspan>되어 있을 때만 "움직인 물체"를 뜻합니다.</text>
  <text x="20" y="266" class="tx-m">컨베이어처럼 <tspan class="tx-b">배경(벨트) 자체가 움직이면</tspan> 벨트 무늬도 전부 변화로 잡힙니다 → 밝기 같은 다른 단서를 씁니다.</text>
  <text x="20" y="294" class="tx-m">⚠️ 프레임마다 물체를 "검출"만 하면 같은 부품을 <tspan class="tx-b">여러 번</tspan> 셉니다. 기준선을 <tspan class="tx-b">넘는 순간</tspan>에만 세야 정확합니다.</text>
</svg>`;

  // 그림 3: Ch15_Camera 구조 — 키 → 상태 → 프레임 파이프라인
  const FIG_APP = `<svg viewBox="0 0 760 330" role="img" aria-label="Ch15_Camera 프로그램 구조: 키 입력이 AppState 를 바꾸고, 프레임마다 상태에 따라 처리 녹화 스냅샷 HUD 표시를 한다">
  ${ARROW('c15c1')}
  <rect x="20" y="20" width="180" height="140" rx="12" class="p4s"/>
  <text x="110" y="44" text-anchor="middle" class="tx-b">⌨ 키 (waitKey)</text>
  <text x="110" y="68" text-anchor="middle" class="tx-m">SPACE 스냅샷</text>
  <text x="110" y="86" text-anchor="middle" class="tx-m">g 흑백 · e 에지</text>
  <text x="110" y="104" text-anchor="middle" class="tx-m">m 움직임(MOG2)</text>
  <text x="110" y="122" text-anchor="middle" class="tx-m">r 녹화 · h 도움말</text>
  <text x="110" y="140" text-anchor="middle" class="tx-m">ESC / q 종료</text>
  <line x1="110" y1="160" x2="110" y2="196" class="ln" stroke-width="2" marker-end="url(#c15c1)"/>
  <text x="120" y="184" class="tx-m">handleKey(key, state)</text>
  <rect x="20" y="198" width="180" height="110" rx="12" class="p1s"/>
  <text x="110" y="222" text-anchor="middle" class="tx-b">struct AppState</text>
  <text x="110" y="244" text-anchor="middle" class="tx-m">bool gray, edges, motion</text>
  <text x="110" y="262" text-anchor="middle" class="tx-m">bool recording, snapshot</text>
  <text x="110" y="280" text-anchor="middle" class="tx-m">bool quit</text>
  <line x1="200" y1="252" x2="236" y2="252" class="ln" stroke-width="2" marker-end="url(#c15c1)"/>
  <rect x="238" y="20" width="502" height="288" rx="12" class="card-bg"/>
  <text x="489" y="44" text-anchor="middle" class="tx-b">while (!state.quit) — 프레임마다</text>
  <rect x="256" y="60" width="110" height="46" rx="8" class="p1s"/><text x="311" y="80" text-anchor="middle" class="tx">cap.read</text><text x="311" y="97" text-anchor="middle" class="tx-m">meter.start()</text>
  <line x1="366" y1="83" x2="386" y2="83" class="ln" stroke-width="2" marker-end="url(#c15c1)"/>
  <rect x="388" y="60" width="160" height="46" rx="8" class="p2s"/><text x="468" y="80" text-anchor="middle" class="tx">gray? edges? → canvas</text><text x="468" y="97" text-anchor="middle" class="tx-m">항상 3채널 BGR</text>
  <line x1="548" y1="83" x2="568" y2="83" class="ln" stroke-width="2" marker-end="url(#c15c1)"/>
  <rect x="570" y="60" width="154" height="46" rx="8" class="p5s"/><text x="647" y="80" text-anchor="middle" class="tx">motion? → MOG2</text><text x="647" y="97" text-anchor="middle" class="tx-m">빨간 사각형</text>
  <line x1="647" y1="106" x2="647" y2="130" class="ln" stroke-width="2" marker-end="url(#c15c1)"/>
  <rect x="540" y="132" width="184" height="46" rx="8" class="p3s"/><text x="632" y="152" text-anchor="middle" class="tx">recording? → writer.write</text><text x="632" y="169" text-anchor="middle" class="tx-m">MJPG .avi (켤 때 open)</text>
  <rect x="330" y="132" width="192" height="46" rx="8" class="p3s"/><text x="426" y="152" text-anchor="middle" class="tx">snapshot? → imwrite</text><text x="426" y="169" text-anchor="middle" class="tx-m">snap_001.png …</text>
  <line x1="540" y1="155" x2="524" y2="155" class="ln" stroke-width="2" marker-end="url(#c15c1)"/>
  <line x1="426" y1="178" x2="426" y2="202" class="ln" stroke-width="2" marker-end="url(#c15c1)"/>
  <rect x="330" y="204" width="192" height="46" rx="8" class="p4s"/><text x="426" y="224" text-anchor="middle" class="tx">meter.stop → drawHud</text><text x="426" y="241" text-anchor="middle" class="tx-m">FPS · 모드 · ● REC</text>
  <line x1="522" y1="227" x2="552" y2="227" class="ln" stroke-width="2" marker-end="url(#c15c1)"/>
  <rect x="554" y="204" width="170" height="46" rx="8" class="p1s"/><text x="639" y="224" text-anchor="middle" class="tx">imshow → waitKey(1)</text><text x="639" y="241" text-anchor="middle" class="tx-m">키 → handleKey</text>
  <text x="489" y="282" text-anchor="middle" class="tx-m">녹화 · 스냅샷은 HUD 를 그리기 <tspan class="tx-b">전</tspan>의 canvas 를 저장 → 기록 영상에 글씨가 남지 않는다</text>
  <text x="489" y="300" text-anchor="middle" class="tx-m">끝나면 writer.release() → cap.release() → destroyAllWindows()</text>
</svg>`;

  // ------------------------------------------------------------------ 1교시 예제
  const EX1_OPEN = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap(0);                              // 0 = 기본 카메라
    if (!cap.isOpened())
    {
        cout << "카메라를 열 수 없습니다" << endl;
        return -1;
    }
    cout << "해상도: " << cap.get(CAP_PROP_FRAME_WIDTH) << " x " << cap.get(CAP_PROP_FRAME_HEIGHT) << endl;
    cout << "FPS: " << cap.get(CAP_PROP_FPS) << endl;
    cout << "FRAME_COUNT: " << cap.get(CAP_PROP_FRAME_COUNT) << " (카메라는 모름 = -1)" << endl;

    Mat frame;                                        // 루프 밖에서 한 번만
    int n = 0;
    while (cap.read(frame))                           // 성공하면 true
    {
        n++;
        if (n == 1)
            cout << "프레임 1: " << frame.size() << ", " << frame.channels() << "채널, "
                 << typeToString(frame.type()) << endl;
        if (n % 20 == 0) cout << format("  프레임 %d 평균 밝기 %.1f", n, mean(frame)[0]) << endl;
        imshow("camera", frame);
        if (waitKey(1) == 27) break;                  // ESC 누르면 종료
    }
    cout << "총 " << n << "프레임 읽고 끝 (read 가 false 를 돌려줌)" << endl;
    cap.release();
    return 0;
}`;

  const EX1_PROC = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap(0);
    if (!cap.isOpened()) return -1;

    Mat frame, gray, edges;                           // 버퍼는 루프 밖에서 한 번만 선언
    int n = 0, saved = 0;
    while (cap.read(frame))
    {
        n++;
        cvtColor(frame, gray, COLOR_BGR2GRAY);        // 크기가 같으면 메모리를 다시 쓴다
        Canny(gray, edges, 60, 150);
        if (n == 30) saved = countNonZero(edges);    // 글씨를 얹기 전에 센다
        putText(edges, format("frame %d", n), Point(12, 34), FONT_HERSHEY_SIMPLEX, 0.9, Scalar(255), 2);
        imshow("camera", frame);
        imshow("edges", edges);
        if (n == 30) imwrite("snap30.png", edges);   // 📁 작업 폴더에 저장
        if (waitKey(1) == 27) break;
    }
    cout << n << "프레임 처리" << endl;
    cout << "30번 프레임 에지 픽셀 " << saved << "개 -> snap30.png 저장" << endl;
    return 0;
}`;

  const EX1_KEYS = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap(0);
    if (!cap.isOpened()) return -1;
    cout << "결과 창을 클릭한 뒤 키를 눌러 보세요: g 흑백 | e 에지 | SPACE 스냅샷 | ESC 종료" << endl;

    Mat frame, gray, view;
    bool useGray = false, useEdge = false;
    int n = 0, snaps = 0;
    while (cap.read(frame))
    {
        n++;
        if (useGray || useEdge)
        {
            cvtColor(frame, gray, COLOR_BGR2GRAY);
            if (useEdge) Canny(gray, gray, 60, 150);
            cvtColor(gray, view, COLOR_GRAY2BGR);     // 글씨를 컬러로 쓰려고 다시 3채널
        }
        else
            frame.copyTo(view);
        putText(view, format("#%d %s%s", n, useGray ? "GRAY " : "", useEdge ? "EDGE" : ""),
                Point(12, 34), FONT_HERSHEY_SIMPLEX, 0.9, Scalar(0, 255, 0), 2);
        imshow("camera", view);

        int key = waitKey(30);                        // 30 ms 동안 창을 그리며 키를 기다린다 (-1 = 없음)
        if (key == 27) break;                         // ESC
        switch (key)
        {
        case 'g':
            useGray = !useGray;
            cout << "프레임 " << n << ": 흑백 " << (useGray ? "켬" : "끔") << endl;
            break;
        case 'e':
            useEdge = !useEdge;
            cout << "프레임 " << n << ": 에지 " << (useEdge ? "켬" : "끔") << endl;
            break;
        case ' ':
            imwrite(format("snap_%02d.png", ++snaps), view);
            cout << "프레임 " << n << ": snap_" << (snaps < 10 ? "0" : "") << snaps << ".png 저장" << endl;
            break;
        }
    }
    cout << n << "프레임, 스냅샷 " << snaps << "장" << endl;
    return 0;
}`;

  const EX1_FPS = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap(0);
    if (!cap.isOpened()) return -1;

    Mat frame, gray, edges;
    TickMeter total, proc;                           // 전체 시간 · 처리 시간 따로
    int n = 0;
    total.start();
    while (cap.read(frame))
    {
        proc.start();
        cvtColor(frame, gray, COLOR_BGR2GRAY);
        GaussianBlur(gray, gray, Size(5, 5), 0);
        Canny(gray, edges, 60, 150);
        proc.stop();                                  // stop 할 때마다 getCounter() + 1

        putText(edges, format("proc %.2f ms", proc.getAvgTimeMilli()), Point(12, 34),
                FONT_HERSHEY_SIMPLEX, 0.9, Scalar(255), 2);
        imshow("edges", edges);
        n++;
        if (waitKey(1) == 27) break;
    }
    total.stop();

    cout << "장치가 보고한 FPS: " << cap.get(CAP_PROP_FPS) << endl;
    cout << format("처리만: 평균 %.2f ms/프레임 -> 초당 %.0f 프레임까지 가능", proc.getAvgTimeMilli(), proc.getFPS()) << endl;
    cout << format("전체(읽기 + 처리 + 표시): %d프레임 / %.2f초 = %.1f FPS", n, total.getTimeSec(), n / total.getTimeSec()) << endl;
    return 0;
}`;

  const EX1_FILE = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    // 카메라 번호 대신 파일 경로를 넣으면 동영상이 열린다
    VideoCapture cap("videos/conveyor.mp4");
    if (!cap.isOpened())
    {
        cout << "동영상을 열 수 없습니다" << endl;
        return -1;
    }
    double fps = cap.get(CAP_PROP_FPS);
    double count = cap.get(CAP_PROP_FRAME_COUNT);
    cout << cap.get(CAP_PROP_FRAME_WIDTH) << " x " << cap.get(CAP_PROP_FRAME_HEIGHT)
         << ", " << fps << " fps, 전체 " << count << "프레임" << endl;
    cout << format("재생 시간 = %.2f초", count / fps) << endl;

    Mat frame;
    int n = 0;
    while (cap.read(frame)) n++;
    cout << "읽은 프레임 " << n << "개, 현재 위치 POS_FRAMES = " << cap.get(CAP_PROP_POS_FRAMES) << endl;

    cap.set(CAP_PROP_POS_FRAMES, 0);                  // 처음으로 되감기 (파일에서만 의미 있다)
    cap >> frame;                                     // read 와 같은 뜻의 연산자
    cout << format("되감은 뒤 첫 프레임 평균 밝기 %.2f", mean(frame)[0]) << endl;

    cap.set(CAP_PROP_POS_FRAMES, 10);                 // 10번 프레임으로 점프
    cap.read(frame);
    cout << "점프 후 POS_FRAMES = " << cap.get(CAP_PROP_POS_FRAMES)
         << format(", POS_MSEC = %.1f", cap.get(CAP_PROP_POS_MSEC)) << endl;
    imshow("frame 10", frame);
    waitKey(0);
    return 0;
}`;

  const EX1_WRITE = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap(0);
    if (!cap.isOpened()) return -1;

    Size size((int)cap.get(CAP_PROP_FRAME_WIDTH), (int)cap.get(CAP_PROP_FRAME_HEIGHT));
    double fps = cap.get(CAP_PROP_FPS);
    if (fps <= 0) fps = 30;                           // 모르면 -1 (또는 0) → 기본값
    int fourcc = VideoWriter::fourcc('M', 'J', 'P', 'G');   // 코덱 4글자 코드
    cout << "fourcc MJPG = " << fourcc << ", 크기 " << size << ", " << fps << " fps" << endl;

    VideoWriter writer("record.avi", fourcc, fps, size, true);   // true = 컬러(3채널)
    if (!writer.isOpened())
    {
        cout << "녹화 파일을 만들 수 없습니다 (코덱 확인)" << endl;
        return -1;
    }

    Mat frame;
    int n = 0;
    while (n < 45 && cap.read(frame))                 // 45프레임 = 1.5초 분량
    {
        putText(frame, format("REC %02d", n + 1), Point(12, 34), FONT_HERSHEY_SIMPLEX, 0.9, Scalar(0, 0, 255), 2);
        writer.write(frame);                          // writer << frame; 도 같다
        n++;
        imshow("recording", frame);
        if (waitKey(1) == 27) break;
    }
    writer.release();                                 // 파일 마무리 (소멸자도 호출)
    cout << n << "프레임을 record.avi 로 기록 (" << format("%.1f", n / fps) << "초 분량)" << endl;
    return 0;
}`;

  const EX1_WRITE_LOCAL = `// main.cpp — 실제 웹캠: r 키로 녹화 켜고 끄기, 파일 이름에 시각 넣기
#include <opencv2/opencv.hpp>
#include <iostream>
#include <ctime>
using namespace cv;
using namespace std;

string timeStamp()                                     // "20261001_153012"
{
    time_t t = time(nullptr);
    tm local{};
    localtime_s(&local, &t);                          // Windows (리눅스는 localtime_r)
    char buf[32];
    strftime(buf, sizeof(buf), "%Y%m%d_%H%M%S", &local);
    return buf;
}

int main()
{
    VideoCapture cap(0, CAP_DSHOW);                   // Windows: DirectShow 가 빨리 열린다
    if (!cap.isOpened()) cap.open(0);                 // 안 되면 기본 백엔드로
    if (!cap.isOpened()) { cout << "카메라를 열 수 없습니다" << endl; return -1; }
    double fps = cap.get(CAP_PROP_FPS);
    if (fps <= 0) fps = 30;

    VideoWriter writer;
    Mat frame;
    while (cap.read(frame))
    {
        if (writer.isOpened())
        {
            writer.write(frame);
            circle(frame, Point(frame.cols - 30, 30), 10, Scalar(0, 0, 255), FILLED);   // 녹화 표시 (기록 뒤에 그림)
        }
        imshow("camera (r: 녹화, ESC: 종료)", frame);
        int key = waitKey(1) & 0xFF;
        if (key == 27) break;
        if (key == 'r')
        {
            if (!writer.isOpened())
            {
                string name = "record_" + timeStamp() + ".avi";
                writer.open(name, VideoWriter::fourcc('M', 'J', 'P', 'G'), fps, frame.size(), true);
                cout << (writer.isOpened() ? "녹화 시작: " + name : string("녹화 실패")) << endl;
            }
            else
            {
                writer.release();
                cout << "녹화 정지" << endl;
            }
        }
    }
    writer.release();
    cap.release();
    return 0;
}`;

  // ------------------------------------------------------------------ 2교시 예제
  const EX2_DIFF = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap("videos/conveyor.mp4");
    Mat frame, gray, prev, diff, moved;
    int n = 0;
    while (cap.read(frame))
    {
        n++;
        cvtColor(frame, gray, COLOR_BGR2GRAY);
        if (!prev.empty())
        {
            absdiff(gray, prev, diff);                        // |현재 - 이전|
            threshold(diff, moved, 30, 255, THRESH_BINARY);
            int cnt = countNonZero(moved);
            if (n <= 4 || n == 20)
                cout << format("  프레임 %2d: 변화 픽셀 %6d개 (%.1f%%)", n, cnt, 100.0 * cnt / gray.total()) << endl;
            if (n == 10) { imshow("diff", diff); imshow("moved", moved); }
        }
        gray.copyTo(prev);                                    // 다음 비교를 위해 '복사'
        if (waitKey(1) == 27) break;
    }
    cout << "총 " << n << "프레임 (벨트가 프레임당 36px 이동 -> 벨트 무늬도 변화로 잡힌다)" << endl;
    return 0;
}`;

  const EX2_MOG2 = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap("videos/conveyor.mp4");
    Ptr<BackgroundSubtractorMOG2> bg = createBackgroundSubtractorMOG2();   // history 500, varThreshold 16, 그림자 검출 켬
    Mat frame, fg, open;
    Mat k = getStructuringElement(MORPH_ELLIPSE, Size(5, 5));
    int n = 0;
    while (cap.read(frame))
    {
        n++;
        bg->apply(frame, fg);                                 // 전경 마스크 + 배경 모델 갱신
        morphologyEx(fg, open, MORPH_OPEN, k);                // 작은 점 잡음 제거
        if (n == 2)
            cout << "마스크 형식: " << typeToString(fg.type()) << ", 그림자(127) 픽셀: " << countNonZero(fg == 127) << endl;
        if (n >= 17)
        {
            vector<vector<Point>> cs;
            findContours(open, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
            int big = 0;
            for (const auto& c : cs)
                if (contourArea(c) > 200) big++;
            cout << format("  프레임 %d: 흰 픽셀 %5d, 윤곽 %2d개, 면적>200 인 것 %d개",
                           n, countNonZero(open), (int)cs.size(), big) << endl;
            if (n == 20) { imshow("fgmask", fg); imshow("open", open); }
        }
    }
    cout << "총 " << n << "프레임" << endl;
    return 0;
}`;

  const EX2_PARTS = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap("videos/conveyor.mp4");
    Mat frame, gray, bin;
    Mat k = getStructuringElement(MORPH_ELLIPSE, Size(5, 5));
    for (int n = 1; cap.read(frame); n++)
    {
        cvtColor(frame, gray, COLOR_BGR2GRAY);
        threshold(gray, bin, 150, 255, THRESH_BINARY);            // 부품은 밝다 (벨트 ≈ 60)
        morphologyEx(bin, bin, MORPH_OPEN, k);
        vector<vector<Point>> cs;
        findContours(bin, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);

        vector<Rect> parts;
        for (const auto& c : cs)
            if (contourArea(c) > 1200) parts.push_back(boundingRect(c));
        sort(parts.begin(), parts.end(), [](const Rect& a, const Rect& b) { return a.x < b.x; });

        if (n <= 3 || n == 20)
        {
            cout << format("  프레임 %2d: 부품 %d개 ", n, (int)parts.size());
            for (const Rect& r : parts) cout << " (" << r.x + r.width / 2 << "," << r.y + r.height / 2 << ")";
            cout << endl;
        }
        if (n == 20)
        {
            for (const Rect& r : parts) rectangle(frame, r, Scalar(0, 0, 255), 2);
            imshow("parts", frame);
        }
    }
    waitKey(0);
    return 0;
}`;

  const EX2_COUNT = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

const int LINE_X = 320;                                     // 세로 기준선

// 밝은 부품의 중심 목록 (x 오름차순)
vector<Point2f> findParts(const Mat& frame)
{
    static const Mat k = getStructuringElement(MORPH_ELLIPSE, Size(5, 5));
    Mat gray, bin;
    cvtColor(frame, gray, COLOR_BGR2GRAY);
    threshold(gray, bin, 150, 255, THRESH_BINARY);
    morphologyEx(bin, bin, MORPH_OPEN, k);
    vector<vector<Point>> cs;
    findContours(bin, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    vector<Point2f> centers;
    for (const auto& c : cs)
    {
        if (contourArea(c) < 1200) continue;
        Rect r = boundingRect(c);
        centers.push_back(Point2f(r.x + r.width / 2.f, r.y + r.height / 2.f));
    }
    sort(centers.begin(), centers.end(), [](const Point2f& a, const Point2f& b) { return a.x < b.x; });
    return centers;
}

int main()
{
    VideoCapture cap("videos/conveyor.mp4");
    Mat frame;
    vector<Point2f> prevCenters;
    int crossed = 0, n = 0;
    while (cap.read(frame))
    {
        n++;
        vector<Point2f> centers = findParts(frame);
        for (const Point2f& c : centers)
        {
            if (c.x < LINE_X) continue;                     // 아직 선 왼쪽
            // 이전 프레임의 같은 부품: y 가 비슷하고 x 가 10~60 px 왼쪽 (벨트 36 px/프레임)
            for (const Point2f& p : prevCenters)
                if (abs(p.y - c.y) < 30 && c.x - p.x > 10 && c.x - p.x < 60 && p.x < LINE_X)
                {
                    crossed++;                              // 이전엔 왼쪽, 지금은 오른쪽 → 통과!
                    break;
                }
        }
        cout << format("프레임 %2d: 부품 %d개  x =", n, (int)centers.size());
        for (const Point2f& c : centers) cout << format(" %.0f", c.x);
        cout << "   누적 " << crossed << endl;
        prevCenters = centers;                              // vector 대입 = 복사

        if (n == 20)
        {
            line(frame, Point(LINE_X, 0), Point(LINE_X, frame.rows), Scalar(0, 255, 255), 2);
            for (const Point2f& c : centers) circle(frame, c, 6, Scalar(0, 0, 255), FILLED);
            putText(frame, format("count %d", crossed), Point(12, 34), FONT_HERSHEY_SIMPLEX, 1.0, Scalar(0, 255, 0), 2);
            imshow("counting", frame);
        }
    }
    cout << "기준선 x=" << LINE_X << " 을 통과한 부품 = " << crossed << "개" << endl;
    waitKey(0);
    return 0;
}`;

  const EX2_LK = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <cmath>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap("videos/conveyor.mp4");
    Mat frame, gray, prevGray;
    cap.read(frame);
    cvtColor(frame, prevGray, COLOR_BGR2GRAY);

    // 추적할 점: 밝은 부품 위의 모서리(코너) — 11차시 goodFeaturesToTrack
    vector<Point2f> pts;
    goodFeaturesToTrack(prevGray, pts, 40, 0.01, 10, prevGray > 150);
    cout << "추적 점 " << pts.size() << "개" << endl;

    for (int n = 2; n <= 6 && cap.read(frame); n++)
    {
        cvtColor(frame, gray, COLOR_BGR2GRAY);
        vector<Point2f> next;
        vector<uchar> status;                                 // 1 = 찾음, 0 = 놓침
        vector<float> err;
        calcOpticalFlowPyrLK(prevGray, gray, pts, next, status, err);

        vector<Point2f> kept;
        double sumDx = 0, maxDy = 0;
        for (size_t i = 0; i < pts.size(); i++)
        {
            if (!status[i]) continue;
            sumDx += next[i].x - pts[i].x;
            maxDy = max(maxDy, (double)fabs(next[i].y - pts[i].y));
            arrowedLine(frame, pts[i], next[i], Scalar(0, 0, 255), 2);
            kept.push_back(next[i]);
        }
        cout << format("프레임 %d: 추적 %2d/%2d, 평균 x 이동 %.1f px, 최대 y 이동 %.1f px",
                       n, (int)kept.size(), (int)pts.size(), sumDx / max<size_t>(kept.size(), 1), maxDy) << endl;
        imshow("optical flow", frame);
        pts = kept;                                           // 찾은 점만 다음 프레임으로
        gray.copyTo(prevGray);
    }
    waitKey(0);
    return 0;
}`;

  // Ch15_Camera 발췌 (로컬 전용)
  const APP_STATE = `// Ch15_Camera / main.cpp — 상태와 키 처리 (화면 · 카메라와 분리)
struct AppState
{
    bool gray = false;      // g: 흑백
    bool edges = false;     // e: Canny 에지
    bool motion = false;    // m: 움직임 검출 (MOG2)
    bool recording = false; // r: 녹화 중
    bool snapshot = false;  // SPACE: 이번 프레임을 저장
    bool quit = false;      // ESC / q
};

void handleKey(int key, AppState& s)
{
    if (key < 0) return;          // 아무 키도 없음
    switch (key & 0xFF)           // 일부 백엔드는 상위 비트에 수식 키 정보를 싣는다
    {
    case 27: case 'q': s.quit = true; break;
    case ' ': s.snapshot = true; break;
    case 'g': s.gray = !s.gray; break;
    case 'e': s.edges = !s.edges; break;
    case 'm': s.motion = !s.motion; break;
    case 'r': s.recording = !s.recording; break;
    default: break;
    }
}`;

  const APP_LOOP = `// Ch15_Camera / main.cpp — 프레임 루프 (발췌)
    Mat frame, gray, canvas;
    Ptr<BackgroundSubtractorMOG2> bg = createBackgroundSubtractorMOG2(300, 25, true);
    VideoWriter writer;
    AppState state;
    TickMeter meter;                                    // 읽기 + 처리 시간 → FPS
    double fps = 0;
    int snaps = 0, recorded = 0;

    while (!state.quit)
    {
        meter.start();
        if (!cap.read(frame) || frame.empty()) break;

        int moving = 0;
        if (state.gray || state.edges)
        {
            cvtColor(frame, gray, COLOR_BGR2GRAY);
            if (state.edges) { GaussianBlur(gray, gray, Size(5, 5), 0); Canny(gray, gray, 60, 150); }
            cvtColor(gray, canvas, COLOR_GRAY2BGR);     // canvas 는 항상 3채널
        }
        else
            frame.copyTo(canvas);
        if (state.motion)
            moving = detectMotion(frame, bg, canvas);   // MOG2 → 그림자 제거 → 열기 → 사각형

        if (state.recording && !writer.isOpened())     // r 을 켜는 순간 파일 열기
            writer.open("record_" + timeStamp() + ".avi",
                        VideoWriter::fourcc('M', 'J', 'P', 'G'), camFps, canvas.size(), true);
        else if (!state.recording && writer.isOpened()) // 끄는 순간 닫기
            writer.release();
        if (writer.isOpened()) { writer.write(canvas); recorded++; }

        if (state.snapshot)
        {
            imwrite(format("snap_%03d.png", ++snaps), canvas);
            state.snapshot = false;                     // 한 번만
        }

        meter.stop();
        if (meter.getCounter() >= 10) { fps = meter.getFPS(); meter.reset(); }   // 10프레임 평균

        drawHud(canvas, fps, state, moving, snaps);     // 기록 · 저장 '뒤에' 글씨를 얹는다
        imshow(win, canvas);
        handleKey(waitKey(1), state);
        if (getWindowProperty(win, WND_PROP_VISIBLE) < 1) state.quit = true;   // 창 X 버튼
    }
    writer.release();
    cap.release();
    destroyAllWindows();`;

  // ------------------------------------------------------------------ 퀴즈
  const QUIZ1 = [
    { q: '<code>while (cap.read(frame))</code> 반복이 끝나는 때는?', options: ['ESC 키를 눌렀을 때', '프레임을 더 읽지 못해(파일 끝 · 카메라 끊김) <code>read</code> 가 false 를 돌려줄 때', '1초가 지났을 때', 'frame 이 가득 찼을 때'], answer: 1,
      explain: '<code>read</code> 는 성공하면 true, 실패하면 false 를 돌려줍니다. <b>실제 웹캠은 끝나지 않으므로</b> 이 조건만으로는 영원히 돕니다 — 반드시 <code>if (waitKey(30) == 27) break;</code> 같은 <b>종료 장치</b>를 넣으세요.' },
    { q: '카메라 루프에서 <code>waitKey(30)</code> 이 하는 일 두 가지는?', options: ['영상을 저장하고 화면을 지운다', '창을 실제로 그리고(이벤트 처리) 30 ms 동안 키 입력을 기다린다', '프레임을 버퍼에 채운다', 'FPS 를 계산한다'], answer: 1,
      explain: '<code>imshow</code> 는 그릴 내용을 등록만 하고, <b>실제 그리기는 <code>waitKey</code> 안</b>에서 일어납니다. 그래서 <code>waitKey</code> 를 빼면 창이 안 뜨거나 멈춘 것처럼 보입니다. 눌린 키의 코드를 돌려주고, 없으면 <b>-1</b> 입니다(ESC = <b>27</b>).' },
    { q: 'OpenCV 5 에서 웹캠에 <code>cap.get(CAP_PROP_FRAME_COUNT)</code> 를 부르면?', options: ['0', '<b>-1</b> (알 수 없음 · 지원하지 않는 속성)', '무한대', '예외가 난다'], answer: 1,
      explain: 'OpenCV 5 의 <code>VideoCapture::get()</code> 은 백엔드가 지원하지 않는 속성에 <b>-1</b> 을 돌려줍니다(예전 버전은 0 인 경우가 많았습니다). 그래서 FPS 처럼 나눗셈에 쓸 값은 <code>if (fps &lt;= 0) fps = 30;</code> 처럼 <b>0 과 -1 을 함께</b> 걸러야 합니다.' },
    { q: '가장 밝은 프레임을 보관하려고 <code>best = frame;</code> 이라고 썼더니 저장된 그림이 <b>마지막 프레임</b>이었다. 이유는?', options: ['imwrite 의 버그', '<code>Mat</code> 대입은 헤더만 복사 → <code>read</code> 가 같은 메모리에 다음 프레임을 덮어써서', '카메라가 느려서', 'best 가 비어 있어서'], answer: 1,
      explain: '<code>Mat best = frame;</code> 은 <b>데이터를 공유</b>합니다(3차시). <code>cap.read(frame)</code> 은 크기가 같으면 <b>같은 메모리에</b> 새 프레임을 씁니다. 보관하려면 <code>frame.copyTo(best)</code> 또는 <code>best = frame.clone()</code>.' },
    { q: '이 브라우저 실습 환경에서 <code>VideoCapture cap(0)</code> 은 무엇인가?', options: ['실제 웹캠', '컨베이어 영상 20프레임을 3번 반복하는 <b>시뮬레이션</b> (총 60프레임)', '검은 화면', '컴파일 오류'], answer: 1,
      explain: '브라우저는 실제 웹캠을 쓸 수 없으므로 <b>컨베이어 영상(conveyor_00~19)</b> 을 3회 반복해 60프레임을 준 뒤 <code>read</code> 가 false 를 돌려줍니다. <b>코드는 실제 웹캠과 똑같습니다</b> — Visual Studio 에서 그대로 돌리면 진짜 카메라가 열립니다.' }
  ];

  const QUIZ2 = [
    { q: '고정 카메라에서 "움직인 곳" 을 찾는 가장 단순한 방법은?', options: ['<code>absdiff(현재, 이전, diff)</code> 후 <code>threshold</code>', '<code>Canny</code>', '<code>HoughCircles</code>', '<code>resize</code>'], answer: 0,
      explain: '두 프레임의 <b>절대 차이</b>가 큰 곳이 움직인 곳입니다. 단 <b>카메라가 고정</b>되어 있어야 의미가 있고, 물체가 멈추면 차이가 0 이 되어 사라진다는 한계가 있습니다.' },
    { q: '<code>bg-&gt;apply(frame, fg)</code> (MOG2 기본 설정)가 만드는 마스크의 값은?', options: ['0 과 1', '0(배경) · 127(그림자) · 255(전경)', '−1 ~ 1 실수', 'BGR 컬러'], answer: 1,
      explain: '기본값 <code>detectShadows = true</code> 에서는 <b>그림자를 127</b> 로 표시합니다. 그림자를 빼려면 <code>createBackgroundSubtractorMOG2(500, 16, false)</code> 로 끄거나 <code>threshold(fg, fg, 200, 255, THRESH_BINARY)</code> 로 255 만 남깁니다(Ch15_Camera 방식).' },
    { q: '이전 프레임을 보관하는 코드로 옳은 것은?', options: ['<code>prev = gray;</code>', '<code>gray.copyTo(prev);</code>', '<code>Mat&amp; prev = gray;</code>', '<code>prev.release();</code>'], answer: 1,
      explain: '<code>prev = gray;</code> 는 <b>같은 데이터를 공유</b>하므로 다음 프레임의 <code>cvtColor(frame, gray, …)</code> 가 prev 까지 바꿔 차이가 항상 0 이 됩니다. <code>copyTo</code>(또는 <code>clone</code>)로 <b>복사</b>해야 합니다.' },
    { q: '컨베이어 영상에서 <code>absdiff</code> 와 MOG2 가 잘 안 되는 이유는?', options: ['영상이 흑백이라서', '<b>배경(벨트)이 프레임마다 36 px 움직여</b> 벨트 무늬까지 전경으로 잡히기 때문', '해상도가 낮아서', '프레임이 20장뿐이라서'], answer: 1,
      explain: '두 방법 모두 <b>배경이 정지해 있다</b>고 가정합니다. 벨트가 움직이면 가정이 깨집니다. 이 영상에서는 부품이 <b>밝다</b>는 다른 단서(<code>threshold</code> 150)가 훨씬 안정적입니다 — 알고리즘보다 <b>영상의 성질</b>을 먼저 보세요.' },
    { q: '컨베이어 위 부품을 <b>한 번만</b> 세려면?', options: ['프레임마다 검출된 개수를 모두 더한다', '가장 많이 검출된 프레임의 개수를 쓴다', '<b>기준선(x=320)을 넘는 순간</b>에만 센다 (이전 프레임 중심과 비교)', '마지막 프레임의 개수를 쓴다'], answer: 2,
      explain: '프레임마다 4~5개가 보이므로 그냥 더하면 87개가 됩니다. 이전 프레임의 중심 목록과 비교해 <b>이전에는 선 왼쪽 · 지금은 선 오른쪽</b>인 경우에만 세면 정확히 <b>5개</b>가 나옵니다 (부품 #2 ~ #6).' }
  ];

  // ------------------------------------------------------------------ 차시
  CV_COURSE.addChapter({
    id: 'cv15', no: '15', title: '동영상과 카메라: VideoCapture', subtitle: '프레임 루프 · 키 조작 · FPS(TickMeter) · VideoWriter · 움직임 검출 · 라인 통과 카운트',
    summary: '지금까지는 <b>사진 한 장</b>을 다뤘습니다. 이제 <code>cv::VideoCapture</code> 로 웹캠과 동영상 파일을 열어 <b>프레임 루프</b>를 돌립니다. <code>while (cap.read(frame))</code> + <code>imshow</code> + <code>waitKey</code> 의 기본 패턴, <code>cap.get(CAP_PROP_…)</code> 속성(OpenCV 5 는 모르면 <b>-1</b>), 프레임마다 처리 · 키 조작 · <code>TickMeter</code> 로 FPS 재기 · <code>VideoWriter</code> 녹화를 익히고, 2교시에는 <b>움직임 검출</b>(absdiff · MOG2 · 광류)과 <b>기준선 통과 카운트</b>로 컨베이어 부품을 한 번만 셉니다. 마지막으로 실제 웹캠으로 도는 Visual Studio 완성 프로젝트 <code>Ch15_Camera</code> 를 읽습니다.',
    goals: ['VideoCapture 로 카메라 · 동영상을 열고 get/set 으로 속성을 다루며, OpenCV 5 의 -1 반환 규칙을 안다',
      'read → 처리 → imshow → waitKey 프레임 루프를 쓰고 키로 모드를 바꾸며 안전하게 종료할 수 있다',
      'TickMeter 로 처리 FPS 를 재고 VideoWriter(fourcc MJPG) 로 영상을 기록할 수 있다',
      'absdiff · MOG2 · calcOpticalFlowPyrLK 로 움직임을 다루고, 모폴로지 · 윤곽선으로 물체를 찾을 수 있다',
      '기준선 통과 방식으로 지나가는 부품을 한 번만 세고, 상태(struct) · 키 처리 함수를 분리한 카메라 프로그램 구조를 설명할 수 있다'],
    vs: 'Ch15_Camera',
    sections: [
      // ================================================================ 1교시
      {
        id: 'cv15-1', title: 'VideoCapture 와 프레임 루프', minutes: 50,
        goals: ['VideoCapture 를 열고 isOpened · get(CAP_PROP_*) 로 해상도 · FPS 를 확인할 수 있다', 'read/imshow/waitKey 루프와 ESC 종료 · 키 조작 패턴을 쓸 수 있다', '프레임마다 처리하고 한 장을 imwrite 로 저장하며, TickMeter 로 처리 FPS 를 잴 수 있다', '동영상 파일의 되감기(POS_FRAMES)와 VideoWriter 녹화를 할 수 있다'],
        flow: [['도입: 사진에서 영상으로', 5], ['열기 · 속성 · 프레임 루프', 15], ['처리 · 키 · FPS 실습', 20], ['파일 · VideoWriter · 정리', 10]],
        content: [
          { type: 'h', text: '사진 한 장에서 초당 30장으로' },
          { type: 'p', html: '14차시까지는 <code>imread</code> 로 읽은 <b>사진 한 장</b>을 다뤘습니다. 실제 검사 장비는 컨베이어가 돌아가는 동안 <b>초당 30~120장</b>을 받아 그때그때 판정합니다. OpenCV 에서 이 입구가 <b><code>cv::VideoCapture</code></b>(videoio 모듈) 입니다 — 웹캠도, 동영상 파일도, 네트워크 카메라(RTSP 주소)도 같은 클래스로 엽니다. Python 의 <code>cv2.VideoCapture(0)</code> 과 이름 · 사용법이 같습니다.' },
          { type: 'figure', html: FIG_LOOP, caption: '그림 1. 카메라 프로그램의 기본 골격 — 열기 → (읽기 → 처리 → 표시 → 키 확인) 반복 → 놓아 주기' },
          { type: 'callout', kind: 'warn', title: '📷 브라우저에서는 카메라 0 이 "컨베이어 시뮬레이션" 입니다', html: '이 사이트는 브라우저 안에서 돌아가므로 <b>실제 웹캠을 열 수 없습니다</b>. 대신 <code>VideoCapture cap(0)</code> 이 <b>컨베이어 영상 20프레임을 3회 반복(총 60프레임)</b> 하는 가짜 카메라로 동작하고, 그 뒤 <code>read</code> 가 <code>false</code> 를 돌려줍니다. <code>VideoCapture("videos/conveyor.mp4")</code> 처럼 이름에 conveyor 가 들어가거나 .mp4/.avi 로 끝나는 파일은 같은 영상 20프레임(1회)으로 열립니다.<br><b>코드는 실제 웹캠과 한 글자도 다르지 않습니다</b> — 아래 예제를 그대로 Visual Studio 프로젝트의 main.cpp 에 붙이면 진짜 카메라 영상이 나옵니다. 다만 실제 카메라는 <b>끝나지 않으므로</b> ESC 종료 코드를 반드시 넣어야 합니다.' },
          { type: 'code', title: '예제 1: 카메라 열기 · 속성 읽기 · 프레임 세기', code: EX1_OPEN,
            desc: '<code>isOpened()</code> 확인은 <b>습관</b>으로 만드세요 — 카메라가 없거나 다른 프로그램이 쓰고 있으면 여기서 걸러야 합니다. 속성은 <code>cap.get(CAP_PROP_…)</code> 로 읽고 모두 <code>double</code> 로 돌아옵니다. 프레임은 <b>3채널 BGR(CV_8UC3)</b> 로 들어옵니다(컨베이어 영상은 흑백이지만 카메라처럼 3채널로 변환되어 옵니다 — 그래서 B · G · R 평균이 같습니다). 60프레임 뒤 <code>read</code> 가 false 가 되어 루프가 끝납니다.',
            expect: '해상도: 640 x 480\nFPS: 30\nFRAME_COUNT: -1 (카메라는 모름 = -1)\n프레임 1: [640 x 480], 3채널, CV_8UC3\n  프레임 20 평균 밝기 102.7\n  프레임 40 평균 밝기 102.7\n  프레임 60 평균 밝기 102.7\n총 60프레임 읽고 끝 (read 가 false 를 돌려줌)' },
          { type: 'table', head: ['C++ (OpenCV 5)', '뜻', '비고'], rows: [
            ['<code>VideoCapture cap(0);</code>', '카메라 0번 열기', '노트북 내장 카메라가 보통 0 · USB 는 1'],
            ['<code>VideoCapture cap(0, CAP_DSHOW);</code>', '백엔드를 골라 열기', 'Windows: <code>CAP_DSHOW</code> · <code>CAP_MSMF</code>(기본)'],
            ['<code>VideoCapture cap("a.mp4");</code>', '동영상 파일 · RTSP 주소', '상대 경로는 <b>작업 폴더</b> 기준'],
            ['<code>cap.isOpened()</code>', '열렸는지', '<b>반드시 확인</b>'],
            ['<code>cap.read(frame)</code> · <code>cap &gt;&gt; frame</code>', '한 장 읽기', '성공 true / 실패 false (<code>&gt;&gt;</code> 는 빈 Mat)'],
            ['<code>cap.get(CAP_PROP_FRAME_WIDTH)</code> · <code>HEIGHT</code>', '해상도', '<code>double</code> → <code>(int)</code> 로 변환'],
            ['<code>cap.get(CAP_PROP_FPS)</code>', '장치 · 파일이 <b>보고한</b> FPS', '실제 처리 속도와 다르다'],
            ['<code>cap.get(CAP_PROP_FRAME_COUNT)</code>', '전체 프레임 수', '파일에서만 의미 · 카메라는 -1'],
            ['<code>cap.set(CAP_PROP_POS_FRAMES, 0)</code>', '위치 이동(되감기)', '파일만 · 카메라는 false'],
            ['<code>cap.set(CAP_PROP_FRAME_WIDTH, 1280)</code>', '해상도 <b>요청</b>', '카메라가 지원해야 반영 → get 으로 확인'],
            ['<code>cap.release()</code>', '장치 놓아 주기', '소멸자가 자동으로 호출 (RAII)']
          ], caption: '표 1. VideoCapture 의 주요 멤버 — Python 의 cap.get(cv2.CAP_PROP_FPS) 와 이름이 같다 (C# 의 cap.Fps 같은 속성 문법은 없다)' },
          { type: 'callout', kind: 'info', title: 'OpenCV 5: 모르는 속성은 -1', html: 'OpenCV 5 의 <code>VideoCapture::get()</code> 은 백엔드가 <b>지원하지 않거나 알 수 없는 속성</b>에 <b>-1</b> 을 돌려줍니다(예전 버전은 0 을 돌려주는 경우가 많았습니다). 웹캠의 <code>CAP_PROP_FRAME_COUNT</code> 가 대표적입니다. FPS 처럼 나눗셈이나 <code>VideoWriter</code> 에 넘길 값은 <b>0 과 -1 을 모두</b> 거르세요: <code>double fps = cap.get(CAP_PROP_FPS); if (fps &lt;= 0) fps = 30;</code>. 반대로 <code>set()</code> 은 적용 여부를 <code>bool</code> 로 돌려주지만, true 여도 실제 값이 다를 수 있으니 <b>set 뒤에는 get 으로 다시 확인</b>합니다.' },
          { type: 'h', text: '프레임마다 처리하기' },
          { type: 'code', title: '예제 2: gray → Canny → 프레임 번호 오버레이 → 한 장 저장', code: EX1_PROC,
            desc: '<b>버퍼(Mat)를 루프 밖에서 선언</b>하는 것이 핵심입니다. <code>cvtColor(frame, gray, …)</code> 는 gray 의 크기 · 형식이 맞으면 <b>메모리를 다시 할당하지 않고 그대로 씁니다</b>(3차시 <code>create</code> 규칙). 루프 안에서 <code>Mat gray;</code> 를 매번 선언하면 초당 30번 할당 · 해제가 일어납니다. <code>putText</code> 로 프레임 번호를 얹으면 어떤 프레임을 보고 있는지 확인하기 좋습니다. <code>imwrite("snap30.png", edges)</code> 로 저장한 파일은 왼쪽 <b>📁 작업 폴더</b>에서 내려받을 수 있습니다. 현장에서는 이렇게 <b>NG 프레임만 저장</b>해 두고 나중에 분석합니다.',
            expect: '60프레임 처리\n30번 프레임 에지 픽셀 2763개 -> snap30.png 저장' },
          { type: 'callout', kind: 'tip', title: 'waitKey 의 숫자는 무슨 뜻인가', html: '<ul><li><code>waitKey(0)</code> — 키를 누를 때까지 <b>무한 대기</b>. 사진 한 장 보여 줄 때.</li><li><code>waitKey(30)</code> — <b>30 ms 기다리면서</b> 창을 그리고 키를 확인. 처리 시간이 짧으면 초당 약 30프레임 — 동영상 파일 <b>재생</b>에 알맞습니다.</li><li><code>waitKey(1)</code> — 1 ms 만 쉼. 카메라는 <code>read</code> 가 다음 프레임을 <b>기다려 주므로</b> 실시간 처리에는 1 이면 충분합니다. 이 사이트는 실행 시간 제한(3초)이 있어 예제에서 주로 <code>waitKey(1)</code> 을 씁니다.</li><li>반환값은 눌린 키의 코드입니다: <b>ESC = 27</b>, <code>\'q\'</code> = 113, <code>\' \'</code>(SPACE) = 32, 아무 키도 없으면 <b>-1</b>.</li><li>백엔드에 따라 상위 비트에 수식 키 정보가 붙을 수 있어 <code>(waitKey(30) &amp; 0xFF) == 27</code> 처럼 쓰기도 합니다. 방향키 등 특수 키가 필요하면 <code>waitKeyEx</code>.</li></ul>' },
          { type: 'h', text: '키로 조작하기' },
          { type: 'p', html: '카메라 프로그램은 실행 중에 <b>모드를 바꾸는</b> 일이 많습니다: 흑백 보기, 에지 보기, 지금 장면 저장, 녹화 시작… 가장 간단한 방법은 <code>waitKey</code> 가 돌려준 키를 <code>switch</code> 로 나눠 <code>bool</code> 변수를 뒤집는 것입니다. 이 사이트에서도 <b>실행 중 결과 창을 클릭하고 키를 누르면</b> 프로그램에 전달됩니다 (60프레임 × 30 ms ≈ 2초 동안).' },
          { type: 'code', title: '예제 3: g · e · SPACE · ESC 키로 모드 바꾸기', code: EX1_KEYS, nondeterministic: true,
            desc: '<code>switch (key)</code> 의 <code>case \'g\':</code> 처럼 <b>문자 상수</b>를 그대로 쓸 수 있습니다(<code>int</code> 로 자동 변환). 흑백 · 에지 결과(1채널)를 <code>COLOR_GRAY2BGR</code> 로 다시 3채널로 만드는 이유는 <b>초록 글씨</b>를 얹기 위해서입니다 — 1채널에 <code>Scalar(0, 255, 0)</code> 을 그리면 첫 값(0)만 쓰여 검은 글씨가 됩니다. 키를 누르지 않으면 마지막 줄만 나옵니다.<br><span class="chip">누른 키에 따라 출력이 달라집니다.</span>' },
          { type: 'code', title: '예제 4: TickMeter 로 처리 시간과 FPS 재기', code: EX1_FPS, nondeterministic: true,
            desc: '<code>cap.get(CAP_PROP_FPS)</code> 는 카메라가 <b>스스로 보고한</b> 값이고, 내 프로그램이 실제로 처리하는 속도는 다릅니다. <code>TickMeter</code> 는 <code>start()</code> ~ <code>stop()</code> 구간을 누적하고 <code>stop</code> 횟수(<code>getCounter()</code>)도 세므로 <code>getAvgTimeMilli()</code> · <code>getFPS()</code> 로 <b>한 프레임 평균</b>을 바로 얻습니다. 처리만 잰 값(proc)과 읽기 · 표시까지 포함한 값(total)을 나눠 보면 어디가 느린지 알 수 있습니다. 검사 장비에서는 <b>라인 속도가 요구하는 FPS</b>보다 처리 FPS 가 높아야 합니다. 느리면 ① 처리 해상도를 줄이고(<code>resize</code> · <code>pyrDown</code>) ② ROI 만 보고 ③ 무거운 연산을 몇 프레임에 한 번만 하고 ④ <b>Release 빌드</b>로 실행합니다(Debug 는 몇 배 느립니다).<br><span class="chip">실행할 때마다 시간이 달라지므로 출력값은 고정되지 않습니다.</span>' },
          { type: 'h', text: '동영상 파일 열기' },
          { type: 'code', title: '예제 5: 파일 경로로 열고 되감기 · 점프', code: EX1_FILE,
            desc: '카메라 번호 대신 <b>경로 문자열</b>을 넣으면 동영상 파일이 열립니다(실제 OpenCV 는 FFmpeg · MSMF 백엔드로 디코딩). 파일에서는 <code>CAP_PROP_FRAME_COUNT</code> 와 <code>CAP_PROP_POS_FRAMES</code>(다음에 읽을 프레임 번호)가 의미 있어서 <b>되감기 · 특정 프레임으로 점프</b>가 가능합니다. <code>POS_MSEC</code> 는 그 위치의 시간(ms) = 프레임 번호 ÷ FPS × 1000. 웹캠은 되감을 수 없다는 점을 기억하세요. <b>알고리즘 개발은 녹화된 파일로</b> 하고(재현 가능!), 완성한 뒤 카메라로 바꾸는 것이 실무의 정석입니다.',
            expect: '640 x 480, 30 fps, 전체 20프레임\n재생 시간 = 0.67초\n읽은 프레임 20개, 현재 위치 POS_FRAMES = 20\n되감은 뒤 첫 프레임 평균 밝기 103.14\n점프 후 POS_FRAMES = 11, POS_MSEC = 366.7' },
          { type: 'callout', kind: 'more', title: '📘 read = grab + retrieve', html: '<code>cap.read(frame)</code> 은 사실 <code>cap.grab()</code>(프레임을 장치에서 가져오기) + <code>cap.retrieve(frame)</code>(디코딩해 Mat 으로)입니다. 카메라 두 대를 <b>거의 같은 순간</b>에 찍어야 할 때(스테레오)는 <code>cap1.grab(); cap2.grab();</code> 을 먼저 연달아 부르고 나서 각각 <code>retrieve</code> 합니다. 또 <code>cap.read(frame)</code> 은 크기 · 형식이 같으면 <b>frame 의 메모리를 재사용</b>하므로, 이전 프레임을 보관하려면 반드시 복사(<code>copyTo</code> · <code>clone</code>)해야 합니다 — 실습 2 의 함정입니다.' },
          { type: 'h', text: '녹화: VideoWriter' },
          { type: 'p', html: '<code>VideoWriter</code> 는 <b>파일 이름 · 코덱(FourCC) · FPS · 프레임 크기 · 컬러 여부</b> 다섯 가지로 만듭니다. FourCC 는 코덱을 뜻하는 4글자로, <code>VideoWriter::fourcc(\'M\', \'J\', \'P\', \'G\')</code> 가 네 글자를 <code>int</code> 하나로 묶어 줍니다(Python 의 <code>cv2.VideoWriter_fourcc(*"MJPG")</code>). Windows 에서는 <b>MJPG + .avi</b> 가 가장 무난하고(OpenCV 내장 인코더), <code>mp4v</code> + .mp4 도 많이 씁니다.' },
          { type: 'code', title: '예제 6: VideoWriter 로 45프레임 기록하기', code: EX1_WRITE,
            desc: '두 가지를 꼭 지키세요. ① 생성할 때의 <b>크기</b>가 실제로 쓰는 프레임과 다르면 오류 없이 <b>빈 파일</b>이 됩니다 → <code>cap.get</code> 으로 읽은 크기를 그대로 씁니다. ② <code>isColor = true</code> 면 <b>3채널</b> 프레임을 써야 합니다(흑백 결과는 <code>COLOR_GRAY2BGR</code> 로 바꿔서). <code>while (n &lt; 45 &amp;&amp; cap.read(frame))</code> 처럼 개수 조건을 <b>먼저</b> 검사해야 46번째 프레임을 헛되이 읽지 않습니다. 브라우저에서는 파일을 만들지 않고 <b>기록한 프레임 수만</b> 알려 줍니다.',
            expect: 'fourcc MJPG = 1196444237, 크기 [640 x 480], 30 fps\n45프레임을 record.avi 로 기록 (1.5초 분량)' },
          { type: 'code', title: '🖥 로컬 전용: 실제 웹캠에서 r 키로 녹화 켜고 끄기', code: EX1_WRITE_LOCAL, run: false, local: true, file: 'main.cpp',
            desc: '실제 녹화 프로그램은 보통 <b>키로 켜고 끕니다</b>. 켜는 순간 <code>writer.open(...)</code>, 끄는 순간 <code>writer.release()</code> — <code>isOpened()</code> 가 곧 "녹화 중" 표시입니다. 파일 이름에 시각을 넣으면(<code>strftime</code>) 덮어쓰기를 막을 수 있습니다. 빨간 녹화 표시는 <code>write</code> <b>다음에</b> 그려서 기록 영상에 남지 않게 합니다. 완성판은 2교시의 <code>Ch15_Camera</code> 입니다.' },
          { type: 'callout', kind: 'field', title: '현장 노트 — 카메라를 다룰 때 실제로 겪는 것들', html: '<ul><li><b>"카메라를 열 수 없습니다"</b>: ① 다른 프로그램(줌 · 팀즈)이 쓰고 있다 ② 이전 실행이 <code>release</code> 없이 죽었다 ③ Windows 설정 → 개인 정보 및 보안 → 카메라에서 데스크톱 앱 접근이 꺼져 있다 — 이 순서로 확인합니다.</li><li><b>백엔드</b>: Windows 기본은 MSMF 인데, 카메라에 따라 <code>VideoCapture(0, CAP_DSHOW)</code> 가 훨씬 빨리 열립니다. <code>cap.getBackendName()</code> 으로 무엇이 쓰였는지 확인할 수 있습니다.</li><li><b>버퍼 지연</b>: 카메라가 프레임을 버퍼에 쌓아 두면 화면이 <b>몇 프레임 늦게</b> 보입니다. <code>cap.set(CAP_PROP_BUFFERSIZE, 1)</code>(지원하는 백엔드에서)로 줄이거나, 처리를 빠르게 해 버퍼가 쌓이지 않게 합니다.</li><li><b>산업용 카메라</b>(GigE · USB3 Vision)는 보통 제조사 SDK 로 프레임 버퍼를 받아 <code>Mat img(h, w, CV_8UC1, buffer);</code> 처럼 <b>복사 없이 감싸서</b> 씁니다(3차시 외부 데이터 생성자). 그 뒤의 코드는 완전히 같습니다.</li><li><b>개발은 파일로</b>: 현장에서 문제 장면을 녹화해 두면 사무실에서 몇 번이고 같은 조건으로 디버깅할 수 있습니다. 이것이 <code>VideoWriter</code> 의 진짜 쓸모입니다.</li></ul>' },
          { type: 'callout', kind: 'vs', title: 'Visual Studio 에서 실제 웹캠으로', html: '이 교시의 예제는 모두 <b>그대로</b> Visual Studio 의 main.cpp 에 붙여 실행할 수 있습니다(<code>OpenCV5Starter</code> 프로젝트에 붙여도 됩니다). 실제 카메라는 <code>read</code> 가 끝나지 않으므로 창을 클릭하고 <b>ESC</b> 로 끝내세요. 콘솔 창을 닫아 강제 종료하면 카메라가 제대로 놓이지 않을 수 있습니다. 키 조작 · FPS · 녹화 · 움직임 검출을 모두 넣은 완성 프로젝트는 <code>vs/Ch15_Camera</code> 입니다(2교시).' },
          { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 · 오개념 지도', html: '<ul><li>수업 전 교사 PC 에 웹캠을 연결해 <code>Ch15_Camera</code> 를 한 번 띄워 보세요. 브라우저는 시뮬레이션이므로 <b>실물 시연</b>이 학생의 이해를 크게 높입니다.</li><li><b>오개념 1</b>: "<code>imshow</code> 가 그린다" → 실제 그리기는 <code>waitKey</code> 안에서 일어납니다. Visual Studio 에서 <code>waitKey</code> 를 지우고 실행해 창이 회색으로 멈추는 것을 보여 주세요.</li><li><b>오개념 2</b>: "<code>CAP_PROP_FPS</code> 가 내 프로그램 속도" → 장치가 보고한 값일 뿐. <code>TickMeter</code> 로 잰 값과 비교시킵니다.</li><li><b>오개념 3</b>: "<code>best = frame;</code> 으로 보관된다" → Mat 대입은 공유(3차시). 실습 2 에서 반드시 한 번 틀리게 두세요.</li><li><b>C++ 포인트</b>: <code>get()</code> 의 반환형이 <code>double</code> 이라 <code>Size</code> 에 넣을 때 <code>(int)</code> 변환, <code>switch</code> 의 문자 상수, <code>&amp;&amp;</code> 단락 평가(<code>n &lt; 45 &amp;&amp; cap.read(frame)</code>).</li><li>💬 발문: “실제 웹캠이라면 이 <code>while</code> 은 언제 끝날까?” — 끝나지 않는다 → 종료 장치의 필요성. “ESC 말고 어떤 종료 조건이 있을까?” — 시간 · 프레임 수 · 검사 완료 신호 · 창 닫기.</li><li>시간 관리: 예제 1~3 을 충분히, 예제 4(FPS)는 시연, 예제 5 · 6 은 빠르게.</li></ul>' }
        ],
        practice: [
          {
            title: '프레임 5장마다 밝기 · 에지 기록하기', level: 1,
            desc: '카메라 0 을 열고 <b>5프레임마다</b> 프레임 번호 · 평균 밝기(소수 둘째 자리) · 에지 픽셀 수를 출력하세요. 에지는 <code>Canny(gray, edges, 60, 150)</code> 로 구합니다. 마지막에 총 프레임 수를 출력하고 <code>release</code> 하세요.',
            hint: '<code>if (n % 5 == 0)</code> 로 5프레임마다 출력합니다. 평균 밝기는 <code>mean(gray)[0]</code>, 에지 픽셀 수는 <code>countNonZero(edges)</code>. 형식은 <code>format("  f%2d: 평균 %.2f, 에지 %d", …)</code>. 20프레임 주기로 같은 값이 반복되는 이유도 생각해 보세요(시뮬레이션 카메라가 20프레임짜리 영상을 3번 돌립니다).',
            expect: '  f 5: 평균 103.06, 에지 2730\n  f10: 평균 103.41, 에지 2763\n  f15: 평균 103.31, 에지 2905\n  f20: 평균 102.74, 에지 2716\n  f25: 평균 103.06, 에지 2730\n  f30: 평균 103.41, 에지 2763\n  f35: 평균 103.31, 에지 2905\n  f40: 평균 102.74, 에지 2716\n  f45: 평균 103.06, 에지 2730\n  f50: 평균 103.41, 에지 2763\n  f55: 평균 103.31, 에지 2905\n  f60: 평균 102.74, 에지 2716\n총 60프레임',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap(0);
    if (!cap.isOpened()) { cout << "카메라를 열 수 없습니다" << endl; return -1; }

    Mat frame, gray, edges;
    int n = 0;
    while (cap.read(frame))
    {
        n++;
        cvtColor(frame, gray, COLOR_BGR2GRAY);
        // TODO: Canny 로 에지를 구하세요 (60, 150)

        // TODO: 5프레임마다 "  f 5: 평균 103.06, 에지 2730" 형식으로 출력하세요

        imshow("camera", frame);
        if (waitKey(1) == 27) break;
    }
    // TODO: 총 프레임 수를 출력하고 release 하세요
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap(0);
    if (!cap.isOpened()) { cout << "카메라를 열 수 없습니다" << endl; return -1; }

    Mat frame, gray, edges;
    int n = 0;
    while (cap.read(frame))
    {
        n++;
        cvtColor(frame, gray, COLOR_BGR2GRAY);
        Canny(gray, edges, 60, 150);
        if (n % 5 == 0)
            cout << format("  f%2d: 평균 %.2f, 에지 %d", n, mean(gray)[0], countNonZero(edges)) << endl;
        imshow("camera", frame);
        imshow("edges", edges);
        if (waitKey(1) == 27) break;
    }
    cout << "총 " << n << "프레임" << endl;
    cap.release();
    return 0;
}`
          },
          {
            title: '가장 밝은 프레임 찾아 저장하기 — 공유 함정 피하기', level: 2,
            desc: '동영상 <code>videos/conveyor.mp4</code> 를 읽으며 <b>평균 밝기가 가장 큰 프레임</b>과 <b>가장 작은 프레임</b>의 번호 · 밝기를 찾아 출력하세요. 그리고 가장 밝은 프레임을 <code>imwrite("brightest.png", best)</code> 로 저장하고, 저장한 그림의 평균 밝기를 다시 계산해 <b>정말 그 프레임인지</b> 확인하세요. starter 는 <code>best = frame;</code> 으로 되어 있어 틀린 그림이 저장됩니다 — 왜 그런지 설명하고 고치세요.',
            hint: '<code>cap.read(frame)</code> 은 같은 크기면 <b>frame 의 메모리를 그대로 재사용</b>합니다. <code>best = frame;</code> 은 그 메모리를 <b>공유</b>하므로 루프가 끝나면 best 는 <b>마지막 프레임</b>이 됩니다(확인 값 102.74). <code>frame.copyTo(best);</code> 또는 <code>best = frame.clone();</code> 으로 고치세요.',
            expect: '가장 밝은 프레임: 2번 (103.63)\n가장 어두운 프레임: 13번 (102.66)\nbrightest.png 저장 (640x480), 다시 잰 평균 103.63',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap("videos/conveyor.mp4");
    Mat frame, gray, best;
    double maxMean = -1, minMean = 999;
    int maxAt = 0, minAt = 0, n = 0;

    while (cap.read(frame))
    {
        n++;
        cvtColor(frame, gray, COLOR_BGR2GRAY);
        double m = mean(gray)[0];
        if (m > maxMean)
        {
            maxMean = m; maxAt = n;
            best = frame;                  // TODO: 이 줄이 버그! 무엇이 문제일까?
        }
        // TODO: 가장 어두운 프레임 번호 · 밝기도 갱신하세요
    }

    cout << format("가장 밝은 프레임: %d번 (%.2f)", maxAt, maxMean) << endl;
    // TODO: 가장 어두운 프레임도 출력하세요
    imwrite("brightest.png", best);
    cout << "brightest.png 저장 (" << best.cols << "x" << best.rows << ")"
         << format(", 다시 잰 평균 %.2f", mean(best)[0]) << endl;
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap("videos/conveyor.mp4");
    Mat frame, gray, best;
    double maxMean = -1, minMean = 999;
    int maxAt = 0, minAt = 0, n = 0;

    while (cap.read(frame))
    {
        n++;
        cvtColor(frame, gray, COLOR_BGR2GRAY);
        double m = mean(gray)[0];
        if (m > maxMean)
        {
            maxMean = m; maxAt = n;
            frame.copyTo(best);            // read 가 frame 을 덮어쓰므로 '복사'!
        }
        if (m < minMean) { minMean = m; minAt = n; }
    }

    cout << format("가장 밝은 프레임: %d번 (%.2f)", maxAt, maxMean) << endl;
    cout << format("가장 어두운 프레임: %d번 (%.2f)", minAt, minMean) << endl;
    imwrite("brightest.png", best);
    cout << "brightest.png 저장 (" << best.cols << "x" << best.rows << ")"
         << format(", 다시 잰 평균 %.2f", mean(best)[0]) << endl;
    imshow("brightest", best);
    waitKey(0);
    return 0;
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: '동영상과 카메라: VideoCapture', subtitle: '1교시 — 프레임 루프 · 키 조작 · FPS · 녹화', notes: '<p>💬 “지금까지 다룬 것은 사진 한 장이었습니다. 컨베이어가 돌아가는 공장에서는 무엇이 달라질까요?” — 시간 제한, 같은 물체를 여러 번 본다, 한 번만 세야 한다. 오늘부터 <b>시간</b>이 들어온다고 선언하며 시작합니다. 가능하면 교사 PC 에서 <code>Ch15_Camera</code> 로 실제 웹캠을 먼저 10초 보여 주세요. (3분)</p>' },
          { layout: 'diagram', title: '카메라 프로그램의 골격', html: FIG_LOOP, caption: '열기 → isOpened 확인 → (read → 처리 → imshow → waitKey) 반복 → release', notes: '<p>이 그림 하나가 15차시의 뼈대라고 말해 줍니다. 네 군데를 짚습니다: ① <code>isOpened</code> 확인은 습관 ② <code>read</code> 가 false 면 끝 ③ <code>waitKey</code> 가 <b>그리기 + 키 확인</b> 두 일을 한다 ④ <code>release</code> 로 장치를 놓아 준다 — C++ 에서는 소멸자가 자동으로 해 주지만(RAII) 순서를 분명히 하려고 직접 부르기도 한다. (6분)</p>' },
          { layout: 'code', title: '카메라 열고 속성 읽기', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap(0);
    if (!cap.isOpened()) { cout << "카메라를 열 수 없습니다" << endl; return -1; }
    cout << cap.get(CAP_PROP_FRAME_WIDTH) << " x " << cap.get(CAP_PROP_FRAME_HEIGHT)
         << ", " << cap.get(CAP_PROP_FPS) << " fps" << endl;

    Mat frame;
    int n = 0;
    while (cap.read(frame))
    {
        n++;
        imshow("camera", frame);
        if (waitKey(1) == 27) break;        // ESC = 27
    }
    cout << "총 " << n << "프레임" << endl;
    return 0;
}`, points: ['<code>isOpened()</code> 확인은 <b>습관</b>으로', '속성은 <code>cap.get(CAP_PROP_…)</code> → <code>double</code>', '프레임은 <b>3채널 BGR</b> (CV_8UC3)', '브라우저 60프레임 뒤 false · 실제 웹캠은 안 끝난다 → <b>ESC 필수</b>'], notes: '<p>실행해서 이미지 창이 움직이는 것을 보여 줍니다. 💬 “실제 웹캠이면 이 while 은 언제 끝날까요?” — 끝나지 않는다. 브라우저 시뮬레이션(60프레임)을 설명하고, <b>같은 코드가 Visual Studio 에서는 진짜 카메라</b>라는 점을 강조합니다. (7분)</p>' },
          { layout: 'table', title: 'VideoCapture 주요 멤버', head: ['C++', '뜻', '비고'], rows: [
            ['<code>VideoCapture cap(0)</code>', '카메라 0번', '<code>(0, CAP_DSHOW)</code> 로 백엔드 선택'],
            ['<code>VideoCapture cap("a.mp4")</code>', '동영상 파일', '작업 폴더 기준 경로'],
            ['<code>read(frame)</code> · <code>&gt;&gt;</code>', '한 장 읽기', '실패하면 false / 빈 Mat'],
            ['<code>get(CAP_PROP_FPS)</code>', '장치가 <b>보고한</b> FPS', '모르면 <b>-1</b> (OpenCV 5)'],
            ['<code>get(CAP_PROP_FRAME_COUNT)</code>', '전체 프레임 수', '카메라는 -1'],
            ['<code>set(CAP_PROP_POS_FRAMES, 0)</code>', '되감기', '<b>파일에서만</b>'],
            ['<code>release()</code>', '장치 놓아 주기', '소멸자가 자동 호출']
          ], lead: 'Python 과 이름이 같다: cap.get(cv2.CAP_PROP_FPS) ⟷ cap.get(CAP_PROP_FPS)', notes: '<p>OpenCV 5 의 변화 한 가지를 짚습니다: <b>모르는 속성은 -1</b>. 그래서 <code>if (fps &lt;= 0) fps = 30;</code> 처럼 0 과 -1 을 함께 거릅니다. <code>set</code> 은 “요청” 이므로 뒤에 <code>get</code> 으로 확인한다는 것도. (4분)</p>' },
          { layout: 'code', title: '프레임마다 처리하기', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap(0);
    Mat frame, gray, edges;                 // 버퍼는 루프 밖에서!
    int n = 0;
    while (cap.read(frame))
    {
        n++;
        cvtColor(frame, gray, COLOR_BGR2GRAY);
        Canny(gray, edges, 60, 150);
        putText(edges, format("frame %d", n), Point(12, 34), FONT_HERSHEY_SIMPLEX, 0.9, Scalar(255), 2);
        imshow("edges", edges);
        if (n == 30) imwrite("snap30.png", edges);
        if (waitKey(1) == 27) break;
    }
    cout << n << "프레임 처리" << endl;
    return 0;
}`, points: ['버퍼 <code>Mat</code> 은 <b>루프 밖에</b> — 크기가 같으면 메모리 재사용', '<code>putText</code> 로 프레임 번호 → 디버깅이 쉽다', '<code>imwrite</code> → 📁 작업 폴더 (NG 프레임 보관)'], notes: '<p>프레임 번호가 올라가는 것을 보여 줍니다. 💬 “왜 Mat 을 루프 밖에서 선언할까?” — 초당 30번 할당 · 해제를 피하려고. 3차시의 <code>create</code> 규칙(크기 · 형식이 같으면 재할당 없음)과 연결합니다. 저장된 snap30.png 를 📁 작업 폴더에서 열어 보게 합니다. (7분)</p>' },
          { layout: 'bullets', title: 'waitKey 의 숫자', lead: '카메라 루프에서 가장 많이 틀리는 곳', bullets: [
            '<code>waitKey(0)</code> — 키를 누를 때까지 <b>무한 대기</b> (사진 한 장)',
            '<code>waitKey(30)</code> — 30 ms 쉬며 그리기 + 키 확인 → 파일 <b>재생</b> 속도',
            '<code>waitKey(1)</code> — 1 ms 만 쉼 → 카메라 <b>실시간 처리</b> (read 가 기다려 준다)',
            '반환값 = 키 코드. <b>ESC = 27</b>, SPACE = 32, 없으면 <b>-1</b> · <code>&amp; 0xFF</code> 로 하위 8비트만',
            ['<b>waitKey 를 빼면?</b>', ['창이 안 뜨거나 멈춘 것처럼 보인다 — <code>imshow</code> 는 등록만, 그리기는 <code>waitKey</code> 안에서']]
          ], notes: '<p>Visual Studio 에서 <code>waitKey</code> 를 주석 처리하고 실행해 보여 주는 것이 가장 강력합니다(브라우저 결과 창은 따로 그려 주므로 차이가 안 보입니다). 💬 “<code>waitKey(1000)</code> 으로 하면?” — 초당 1프레임. (4분)</p>' },
          { layout: 'code', title: '키로 모드 바꾸기', code: `#include <opencv2/opencv.hpp>
using namespace cv;
int main()
{
    VideoCapture cap(0);
    Mat frame, gray, view;
    bool useGray = false, useEdge = false;
    while (cap.read(frame))
    {
        if (useGray || useEdge)
        {
            cvtColor(frame, gray, COLOR_BGR2GRAY);
            if (useEdge) Canny(gray, gray, 60, 150);
            cvtColor(gray, view, COLOR_GRAY2BGR);
        }
        else frame.copyTo(view);
        imshow("camera", view);
        int key = waitKey(30);
        if (key == 27) break;
        if (key == 'g') useGray = !useGray;
        if (key == 'e') useEdge = !useEdge;
        if (key == ' ') imwrite("snap.png", view);
    }
}`, points: ['키 = <code>waitKey</code> 의 반환값 → <code>bool</code> 을 뒤집는다', '<code>\'g\'</code> 같은 문자 상수와 바로 비교', '결과 창을 클릭하고 키를 누르면 브라우저에서도 동작'], notes: '<p>실행 중에 학생들이 결과 창을 클릭하고 g · e 를 눌러 보게 합니다(약 2초 동안). 💬 “1채널 결과를 왜 다시 3채널로 바꿨을까?” — 컬러 글씨 · 녹화 때문(녹화는 3채널이어야 한다). (5분)</p>' },
          { layout: 'code', title: '실제 처리 FPS 재기 (TickMeter)', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap(0);
    Mat frame, gray, edges;
    TickMeter proc;
    while (cap.read(frame))
    {
        proc.start();
        cvtColor(frame, gray, COLOR_BGR2GRAY);
        Canny(gray, edges, 60, 150);
        proc.stop();                        // 횟수 + 1, 시간 누적
        imshow("edges", edges);
        if (waitKey(1) == 27) break;
    }
    cout << "장치 FPS: " << cap.get(CAP_PROP_FPS) << endl;
    cout << format("처리 평균 %.2f ms -> %.0f FPS 가능", proc.getAvgTimeMilli(), proc.getFPS()) << endl;
    return 0;
}`, points: ['<code>CAP_PROP_FPS</code> = 장치가 보고한 값 ≠ 내 프로그램 속도', '<code>getAvgTimeMilli()</code> · <code>getFPS()</code> = stop 횟수로 나눈 평균', '느리면: 해상도 ↓ · ROI · 몇 프레임에 한 번 · <b>Release 빌드</b>', '실행할 때마다 값이 달라진다'], notes: '<p>두 번 실행해 값이 달라지는 것을 보여 주고, “시간 값은 <code>expect</code> 에 넣지 않는다” 는 원칙을 알려 줍니다. 💬 “1초에 부품 10개가 지나가면 몇 FPS 가 필요할까?” — 부품당 최소 2~3프레임은 봐야 하므로 30 FPS 이상. Visual Studio 에서 Debug/Release 차이를 재 보는 것도 좋은 과제입니다. (5분)</p>' },
          { layout: 'code', title: '동영상 파일 열고 되감기', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap("videos/conveyor.mp4");
    if (!cap.isOpened()) { cout << "열 수 없습니다" << endl; return -1; }
    double count = cap.get(CAP_PROP_FRAME_COUNT), fps = cap.get(CAP_PROP_FPS);
    cout << count << "프레임, " << fps << " fps, " << format("%.2f초", count / fps) << endl;

    Mat frame;
    int n = 0;
    while (cap.read(frame)) n++;
    cout << "읽은 프레임 " << n << ", POS_FRAMES = " << cap.get(CAP_PROP_POS_FRAMES) << endl;

    cap.set(CAP_PROP_POS_FRAMES, 0);        // 되감기 (파일에서만!)
    cap >> frame;
    cout << format("첫 프레임 평균 %.2f", mean(frame)[0]) << endl;
    return 0;
}`, points: ['카메라 번호 대신 <b>경로 문자열</b>', '파일은 <code>FRAME_COUNT</code> · <code>POS_FRAMES</code> 가 의미 있다', '<b>알고리즘 개발은 녹화 파일로</b> — 재현 가능!'], notes: '<p>실무 조언을 강조합니다: 현장에서 문제 장면을 녹화해 두고 사무실에서 같은 조건으로 몇 번이고 디버깅한다. 💬 “웹캠도 되감을 수 있을까?” — 불가능. 그래서 <code>VideoWriter</code> 로 녹화해 둔다 → 다음 슬라이드. (4분)</p>' },
          { layout: 'two', title: 'VideoWriter: 녹화의 다섯 가지', left: { title: '만들기', code: `int fourcc = VideoWriter::fourcc('M', 'J', 'P', 'G');
VideoWriter writer("record.avi", fourcc,
                   fps, Size(w, h), true);
if (!writer.isOpened()) { /* 코덱 확인 */ }
writer.write(frame);      // 또는 writer << frame;
writer.release();`, run: false }, right: { title: '지킬 것', bullets: ['<b>크기</b>가 실제 프레임과 다르면 빈 파일', '<code>isColor=true</code> 면 <b>3채널</b>만', 'FPS 는 <code>get</code> 값이 0 · -1 이면 30', 'Windows: <b>MJPG + .avi</b> 가 무난', '브라우저: 파일 없이 <b>프레임 수만</b> 셈'] }, notes: '<p>FourCC 는 네 글자를 한 int 에 담는 것일 뿐이라고 설명합니다(<code>\'M\' + (\'J\' &lt;&lt; 8) + …</code>). 예제 6 을 실행해 “45프레임을 기록” 을 확인하고, 실제 파일은 Visual Studio 에서 만들어진다고 안내합니다. r 키로 켜고 끄는 로컬 코드도 보여 주세요. (4분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '가장 밝은 프레임을 보관하려고 <code>best = frame;</code> 이라고 썼더니 저장된 그림이 <b>마지막 프레임</b>이었다. 이유는?', options: ['imwrite 의 버그', 'Mat 대입은 헤더만 복사 → read 가 같은 메모리에 다음 프레임을 덮어써서', '카메라가 느려서', 'best 가 비어 있어서'], answer: 1, explain: '<code>cap.read(frame)</code> 은 크기가 같으면 <b>같은 메모리</b>에 새 프레임을 씁니다. 보관하려면 <code>frame.copyTo(best)</code> 또는 <code>frame.clone()</code>.', notes: '<p>정답 2번. 3차시의 “헤더와 데이터” 그림을 다시 띄우면 좋습니다. 이어지는 실습 2 가 바로 이 함정입니다. (3분)</p>' },
          { layout: 'practice', title: '실습: 가장 밝은 프레임 저장하기', desc: '<p><code>videos/conveyor.mp4</code> 를 읽으며 평균 밝기가 가장 큰/작은 프레임 번호를 찾고, 가장 밝은 프레임을 <code>brightest.png</code> 로 저장하세요.</p><ul><li>starter 의 <code>best = frame;</code> 은 버그 — 저장 후 다시 잰 평균이 102.74(마지막 프레임)</li><li>정답: 최대 2번(103.63) · 최소 13번(102.66), 다시 잰 평균 103.63</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap("videos/conveyor.mp4");
    Mat frame, gray, best;
    double maxMean = -1;
    int maxAt = 0, n = 0;
    while (cap.read(frame))
    {
        n++;
        cvtColor(frame, gray, COLOR_BGR2GRAY);
        double m = mean(gray)[0];
        if (m > maxMean) { maxMean = m; maxAt = n; best = frame; }   // TODO: 버그!
    }
    cout << format("%d번 (%.2f), 저장본 평균 %.2f", maxAt, maxMean, mean(best)[0]) << endl;
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap("videos/conveyor.mp4");
    Mat frame, gray, best;
    double maxMean = -1;
    int maxAt = 0, n = 0;
    while (cap.read(frame))
    {
        n++;
        cvtColor(frame, gray, COLOR_BGR2GRAY);
        double m = mean(gray)[0];
        if (m > maxMean) { maxMean = m; maxAt = n; frame.copyTo(best); }
    }
    cout << format("%d번 (%.2f), 저장본 평균 %.2f", maxAt, maxMean, mean(best)[0]) << endl;
    imwrite("brightest.png", best);
    return 0;
}`, notes: '<p>일부러 starter 를 먼저 실행시켜 “저장본 평균 102.74” 가 최대값 103.63 과 다르다는 것을 발견하게 합니다. 💬 “왜 마지막 프레임이 나왔을까?” — 3차시 얕은 복사. <code>copyTo</code> 로 고치면 오래 기억에 남습니다. 빨리 끝난 학생은 실습 1(5프레임마다 기록). (8분)</p>' },
          { layout: 'summary', title: '1교시 정리', bullets: ['<code>VideoCapture cap(0)</code> = 카메라 · <code>cap("a.mp4")</code> = 파일, 그 뒤 코드는 같다', '<code>isOpened()</code> → <code>while (cap.read(frame))</code> → 처리 → <code>imshow</code> → <code>waitKey</code>', '<code>waitKey</code> 가 <b>그리기 + 키 확인</b>. ESC = 27, 키가 없으면 -1 · 실제 카메라는 종료 장치 필수', '<code>cap.get(CAP_PROP_…)</code> 은 double, OpenCV 5 는 모르면 <b>-1</b> → <code>fps &lt;= 0</code> 검사', '버퍼는 루프 밖에 · 보관은 <code>copyTo</code>/<code>clone</code> (read 는 덮어쓴다)', '<code>TickMeter</code> 로 처리 FPS, <code>VideoWriter</code>(MJPG, 크기 · 3채널 일치)로 녹화', '다음: 프레임 사이의 <b>변화</b>로 움직이는 물체를 찾고, 한 번만 센다'], notes: '<p>일곱 줄을 정리합니다. 2교시 예고 질문: “컨베이어 위 부품이 매 프레임 4~5개씩 보이는데, 전체로는 몇 개가 지나간 걸까?” — 한 번만 세는 문제를 숙제처럼 던져 두세요. (3분)</p>' }
        ]
      },

      // ================================================================ 2교시
      {
        id: 'cv15-2', title: '움직임 검출 · 라인 통과 카운트 · Ch15_Camera', minutes: 50,
        goals: ['absdiff · MOG2 로 전경(움직이는 부분)을 얻고 그림자(127)를 다룰 수 있다', '모폴로지 + 윤곽선으로 움직이는 물체의 개수와 사각형을 구할 수 있다', '배경이 움직이는 영상에서 두 방법의 한계를 설명하고 대안(밝기 · 광류)을 고를 수 있다', '기준선 통과 방식으로 지나가는 부품을 한 번만 셀 수 있다', '상태 struct · 키 처리 함수 · 녹화를 갖춘 Ch15_Camera 의 구조를 설명할 수 있다'],
        flow: [['도입: 무엇이 움직였나', 5], ['absdiff · MOG2 · 모폴로지', 15], ['부품 검출 · 라인 통과 · 광류', 20], ['Ch15_Camera · 정리', 10]],
        content: [
          { type: 'h', text: '움직인 곳 = 프레임 사이에 달라진 곳' },
          { type: 'p', html: '카메라가 고정되어 있다면 <b>배경은 그대로</b>이고 움직인 물체가 있는 곳만 픽셀 값이 바뀝니다. 가장 단순한 방법은 <b>이전 프레임과의 절대 차이</b>(<code>absdiff</code>)를 구해 임계값을 넘는 곳을 찾는 것입니다. 더 똑똑한 방법은 <b>배경 모델</b>을 학습해 두고 거기서 벗어난 픽셀을 전경으로 보는 <code>BackgroundSubtractorMOG2</code> 입니다(video 모듈).' },
          { type: 'figure', html: FIG_MOTION, caption: '그림 2. 움직임 검출 파이프라인 — 차이/배경 차분 → 이진화 · 모폴로지 → 윤곽선 → 기준선 통과 카운트' },
          { type: 'h', text: '오늘의 영상: 컨베이어' },
          { type: 'image', src: 'images/conveyor_00.png', caption: '컨베이어 프레임 0 — 벨트가 프레임당 +36 px 이동, 부품(와셔 ro 34 · ri 14)이 왼쪽에서 오른쪽으로 흐른다. NG 부품: #2 구멍 없음 · #5 균열 · #8 깨짐', width: 460 },
          { type: 'code', title: '예제 1: 두 프레임의 차이 (absdiff)', code: EX2_DIFF,
            desc: '<code>prev</code> 에 직전 프레임을 보관해 두고 <code>absdiff</code> 로 차이를 구합니다. <code>gray.copyTo(prev)</code> 로 <b>복사</b>하는 것이 중요합니다 — <code>prev = gray;</code> 라고 쓰면 같은 데이터를 공유해, 다음 프레임의 <code>cvtColor</code> 가 prev 까지 바꾸므로 차이가 항상 0 이 됩니다. 결과를 보면 변화 픽셀이 <b>전체의 6~7%</b> 나 됩니다. 부품만 움직인 게 아니라 <b>벨트 무늬 전체</b>가 36 px 씩 흘렀기 때문입니다.',
            expect: '  프레임  2: 변화 픽셀  21053개 (6.9%)\n  프레임  3: 변화 픽셀  21157개 (6.9%)\n  프레임  4: 변화 픽셀  19651개 (6.4%)\n  프레임 20: 변화 픽셀  20099개 (6.5%)\n총 20프레임 (벨트가 프레임당 36px 이동 -> 벨트 무늬도 변화로 잡힌다)' },
          { type: 'code', title: '예제 2: BackgroundSubtractorMOG2 + 모폴로지 열기 + 윤곽선', code: EX2_MOG2,
            desc: '<code>createBackgroundSubtractorMOG2()</code> 는 <code>Ptr&lt;BackgroundSubtractorMOG2&gt;</code>(OpenCV 의 스마트 포인터 = <code>std::shared_ptr</code>)를 돌려주므로 <code>bg-&gt;apply(…)</code> 처럼 <b>화살표</b>로 부릅니다. MOG2 는 픽셀마다 밝기 분포를 <b>가우시안 혼합 모델</b>로 학습해 배경을 기억하고, <code>apply</code> 는 전경 마스크를 만들면서 동시에 모델을 갱신합니다(0 = 배경, <b>127 = 그림자</b>, 255 = 전경). <code>MORPH_OPEN</code> 으로 점 잡음을 지웁니다. 그런데 결과를 보면 큰 덩어리가 <b>1~5개로 들쭉날쭉</b>합니다 — 부품 12개가 흐르는데도 말이죠. 왜 그럴까요?',
            expect: '마스크 형식: CV_8UC1, 그림자(127) 픽셀: 35393\n  프레임 17: 흰 픽셀  3778, 윤곽 24개, 면적>200 인 것 5개\n  프레임 18: 흰 픽셀  2439, 윤곽 29개, 면적>200 인 것 2개\n  프레임 19: 흰 픽셀  2729, 윤곽 19개, 면적>200 인 것 1개\n  프레임 20: 흰 픽셀  2806, 윤곽 28개, 면적>200 인 것 1개\n총 20프레임' },
          { type: 'callout', kind: 'warn', title: '⚠️ absdiff 도 MOG2 도 "배경은 정지" 를 가정한다', html: '두 방법 모두 <b>카메라와 배경이 고정</b>되어 있다는 전제 위에 있습니다. 컨베이어 영상에서는 <b>벨트 자체가 프레임당 36 px 움직이므로</b> 그 가정이 깨집니다. 그래서 ① 벨트 무늬가 전경으로 잡히고 ② 부품은 앞뒤 테두리만 남거나 배경으로 학습되어 사라집니다.<br>이럴 때 파라미터와 씨름하기보다 <b>영상의 다른 성질</b>을 보는 것이 빠릅니다 — 이 영상에서 부품은 <b>벨트보다 확실히 밝습니다</b>(결과 창에서 마우스로 확인: 벨트 ≈ 60, 부품 ≈ 200). 밝기 임계값 하나로 훨씬 안정적인 결과가 나옵니다(예제 3). <b>"알고리즘보다 영상을 먼저 보라"</b> 가 현장의 첫 번째 규칙입니다.' },
          { type: 'code', title: '예제 3: 밝기 임계값으로 부품 검출 (이 영상에 맞는 방법)', code: EX2_PARTS,
            desc: '<code>threshold(gray, bin, 150, 255, THRESH_BINARY)</code> 한 줄로 밝은 부품만 남기고, <code>MORPH_OPEN</code> 으로 잡음을 지운 뒤 <code>findContours</code> + 면적 필터(1200 초과)로 부품을 찾습니다. 사각형을 <code>std::sort</code> + 람다로 <b>x 순서</b>로 정렬하면 출력을 비교하기 쉽습니다. 프레임마다 <b>4~5개</b>가 안정적으로 잡히고, 중심 좌표도 IMAGES.md 의 정답과 거의 일치합니다(프레임 1: 132 · 289 · 440 · 584 ↔ 정답 132 · 290 · 440 · 585 — 정수 나눗셈 r.width / 2 로 1 px 쯤 차이). 와셔 면적은 π(34² − 14²) ≈ 3016 px² 이므로 1200 은 <b>반쯤 잘린 부품까지</b> 잡는 넉넉한 값입니다.',
            expect: '  프레임  1: 부품 4개  (132,217) (289,240) (440,257) (584,224)\n  프레임  2: 부품 5개  (32,218) (168,217) (325,240) (476,257) (613,224)\n  프레임  3: 부품 4개  (66,218) (204,217) (361,240) (512,257)\n  프레임 20: 부품 4개  (79,257) (219,220) (367,236) (527,238)' },
          { type: 'h', text: '한 번만 세기: 기준선 통과 카운트' },
          { type: 'p', html: '프레임마다 4~5개가 보이므로 <b>그냥 더하면 87개</b>가 됩니다. 실제로 지나간 부품 수를 알려면 <b>같은 부품을 여러 번 세지 않는</b> 장치가 필요합니다. 가장 널리 쓰이는 방법이 <b>가상의 기준선(counting line)</b> 입니다: 화면 가운데 세로선을 하나 긋고, 어떤 부품의 중심이 <b>이전 프레임에는 선 왼쪽, 이번 프레임에는 선 오른쪽</b>일 때만 1 을 더합니다.' },
          { type: 'p', html: '이를 위해 <b>아주 간단한 추적</b>이 필요합니다: 이번 프레임의 중심마다, 이전 프레임의 중심 중 <b>높이(y)가 비슷하고 x 가 10~60 px 왼쪽</b>인 것을 같은 부품으로 봅니다. 벨트가 프레임당 36 px 움직이므로 이 범위면 충분합니다. 검출 부분은 <code>vector&lt;Point2f&gt; findParts(const Mat&amp;)</code> 함수로 분리해 <code>main</code> 을 짧게 유지합니다.' },
          { type: 'code', title: '예제 4: 기준선 x=320 통과 카운트 → 정답 5개', code: EX2_COUNT,
            desc: '누적 카운트가 프레임 2 · 7 · 11 · 15 · 19 에서 하나씩 올라 <b>최종 5개</b>가 됩니다. IMAGES.md 의 부품 위치(x = x0 + 36·f)로 검산하면 20프레임 동안 x=320 을 넘는 부품은 <b>#2 · #3 · #4 · #5 · #6</b> 정확히 5개입니다 (#0 · #1 은 이미 지나갔고, #7 · #8 은 아직 도착 전). 매칭 조건(<code>abs(p.y - c.y) &lt; 30</code>, <code>10 &lt; c.x - p.x &lt; 60</code>)은 <b>벨트 속도를 알고 있기에</b> 쓸 수 있는 단순한 추적입니다 — 실무에서는 이렇게 <b>공정 지식을 코드에 넣는 것</b>이 복잡한 추적 알고리즘보다 훨씬 튼튼합니다. <code>static const Mat k</code> 는 함수가 처음 불릴 때 한 번만 만들어집니다.',
            expect: '프레임  1: 부품 4개  x = 132 290 440 584   누적 0\n프레임  2: 부품 5개  x = 32 168 326 476 614   누적 1\n프레임  3: 부품 4개  x = 66 204 362 512   누적 1\n프레임  4: 부품 4개  x = 103 240 398 548   누적 1\n프레임  5: 부품 4개  x = 138 276 434 584   누적 1\n프레임  6: 부품 5개  x = 28 174 312 470 614   누적 1\n프레임  7: 부품 4개  x = 59 210 348 506   누적 2\n프레임  8: 부품 4개  x = 95 246 384 542   누적 2\n프레임  9: 부품 4개  x = 131 282 420 578   누적 2\n프레임 10: 부품 5개  x = 20 167 318 456 610   누적 2\n프레임 11: 부품 4개  x = 44 204 354 492   누적 3\n프레임 12: 부품 4개  x = 80 240 390 528   누적 3\n프레임 13: 부품 4개  x = 116 276 426 564   누적 3\n프레임 14: 부품 5개  x = 18 152 312 462 600   누적 3\n프레임 15: 부품 5개  x = 40 188 348 498 622   누적 4\n프레임 16: 부품 4개  x = 76 224 384 534   누적 4\n프레임 17: 부품 4개  x = 112 260 419 570   누적 4\n프레임 18: 부품 5개  x = 20 148 296 455 606   누적 4\n프레임 19: 부품 5개  x = 43 184 332 491 624   누적 5\n프레임 20: 부품 4개  x = 79 220 368 527   누적 5\n기준선 x=320 을 통과한 부품 = 5개' },
          { type: 'h', text: '점을 따라가기: 광류(Optical Flow)' },
          { type: 'p', html: '공정 지식이 없거나 물체가 제멋대로 움직이면 <b>점 자체를 따라가는</b> 방법을 씁니다. <code>calcOpticalFlowPyrLK</code>(Lucas-Kanade 광류)는 이전 프레임의 점 목록을 받아 <b>다음 프레임에서 각 점이 어디로 갔는지</b>를 찾습니다. 점은 보통 11차시의 <code>goodFeaturesToTrack</code> 으로 고른 코너를 씁니다. <code>status[i] == 1</code> 이면 찾은 것, 0 이면 놓친 것(화면 밖 · 가려짐)입니다. 피라미드(<code>maxLevel</code> = 3)를 써서 한 프레임에 수십 px 움직여도 따라갑니다.' },
          { type: 'code', title: '예제 5: calcOpticalFlowPyrLK 로 부품 위의 점 따라가기', code: EX2_LK,
            desc: '밝은 부품 위(<code>prevGray &gt; 150</code> 마스크)의 코너 40개를 골라 5프레임 동안 따라갑니다. 평균 x 이동이 약 <b>31~33 px</b> 로 벨트 속도(36 px/프레임)에 가깝고, y 이동은 대부분 0.5 px 이하입니다 — 광류가 "오른쪽으로 흐른다" 는 사실을 <b>공정 지식 없이</b> 알아낸 것입니다(모션 블러와 화면 밖으로 나가는 점 때문에 조금 작게 나옵니다). 프레임 3 의 <b>최대 y 이동 7.5 px</b> 은 이웃 무늬로 잘못 따라간 점 하나입니다 — <code>status</code> 가 1 이어도 오추적이 있을 수 있으므로 실무에서는 <code>err</code> 값이나 이동량이 너무 다른 점을 한 번 더 거릅니다. 놓친 점을 버리므로 추적 점 수가 점점 줄어듭니다. 실무에서는 점이 일정 수 아래로 줄면 <code>goodFeaturesToTrack</code> 을 다시 불러 보충합니다.',
            expect: '추적 점 40개\n프레임 2: 추적 37/40, 평균 x 이동 33.2 px, 최대 y 이동 0.3 px\n프레임 3: 추적 36/37, 평균 x 이동 32.2 px, 최대 y 이동 7.5 px\n프레임 4: 추적 32/36, 평균 x 이동 32.4 px, 최대 y 이동 0.3 px\n프레임 5: 추적 32/32, 평균 x 이동 33.2 px, 최대 y 이동 0.4 px\n프레임 6: 추적 30/32, 평균 x 이동 31.3 px, 최대 y 이동 0.3 px' },
          { type: 'callout', kind: 'field', title: '현장 노트 — 지나가는 물체를 세는 실전 요령', html: '<ul><li><b>기준선은 화면 가운데</b>에 둡니다. 가장자리에 두면 부품이 잘린 상태로 검출되어 중심이 튑니다.</li><li><b>양방향 카운트</b>가 필요하면 방향도 함께 기록합니다(들어온 것 · 나간 것). 사람 수 세기(입장/퇴장)가 대표적입니다.</li><li><b>검사는 기준선에서</b>: 부품 중심이 기준선에 가장 가까운 프레임이 가장 선명하고 잘리지 않은 프레임입니다. 그 프레임에서 OK/NG 판정을 하고 결과를 기록하세요(실습 2).</li><li><b>트리거 신호</b>: 실제 장비는 포토센서나 엔코더가 "부품이 왔다" 는 신호를 주고, 그 순간에만 촬영 · 판정합니다. 영상만으로 세는 것은 신호가 없을 때의 대안입니다.</li><li><b>속도 변화</b>: 벨트가 빨라져 부품이 프레임당 60 px 이상 움직이면 매칭 범위를 늘려야 합니다. 이럴 때 광류로 잰 실제 이동량(예제 5)을 매칭 범위에 쓰면 튼튼해집니다. 더 정교하게는 칼만 필터(<code>cv::KalmanFilter</code>)로 다음 위치를 예측합니다.</li></ul>' },
          { type: 'h', text: '완성 프로젝트: Ch15_Camera (실제 웹캠)' },
          { type: 'p', html: '지금까지의 조각을 모아 <b>실제 웹캠</b>에서 도는 프로그램을 만듭니다. C# 판은 WPF 창과 백그라운드 스레드를 썼지만, C++ 판은 <b>콘솔 + highgui 창 하나</b>로 충분합니다 — <code>waitKey</code> 가 창 이벤트를 처리해 주므로 스레드 없이 <b>한 루프</b>에서 읽기 · 처리 · 표시 · 키 처리를 모두 합니다. 대신 루프가 길어지지 않도록 <b>상태(struct)</b>, <b>키 처리 함수</b>, <b>움직임 검출 함수</b>, <b>화면 정보(HUD) 함수</b>로 나눕니다.' },
          { type: 'figure', html: FIG_APP, caption: '그림 3. Ch15_Camera 구조 — 키가 AppState 를 바꾸고, 프레임 루프는 상태를 보고 처리 · 녹화 · 스냅샷 · HUD 를 한다' },
          { type: 'project', title: 'Ch15_Camera — 웹캠 뷰어', project: 'Ch15_Camera',
            html: '실제 웹캠(또는 명령 인수로 준 동영상 파일)을 열어 실시간으로 처리하는 완성 프로젝트입니다.<ul><li><b>키</b>: <code>SPACE</code> 스냅샷(<code>snap_001.png</code> …) · <code>g</code> 흑백 · <code>e</code> Canny 에지 · <code>m</code> 움직임 검출(MOG2, 빨간 사각형) · <code>r</code> 녹화 시작/정지(<code>record_날짜_시각.avi</code>, MJPG) · <code>h</code> 도움말 · <code>ESC</code>/<code>q</code>/창 닫기 종료</li><li><b>화면</b>: 왼쪽 위 FPS(<code>TickMeter</code>, 10프레임 평균) · 모드, 녹화 중이면 오른쪽 위 <b>● REC</b></li><li><b>열기</b>: <code>CAP_DSHOW</code> → <code>CAP_MSMF</code> → 기본 순서로 시도, 실패하면 원인 안내. <code>set</code> 으로 640×480 을 요청한 뒤 <code>get</code> 으로 실제 값을 읽고, FPS 가 0 · -1 이면 30</li><li><b>구조</b>: <code>struct AppState</code> · <code>handleKey()</code> · <code>detectMotion()</code> · <code>drawHud()</code> · <code>timeStamp()</code> + <code>main</code> 의 프레임 루프</li><li>파일: <code>vs/Ch15_Camera/Ch15_Camera.vcxproj</code> · <code>main.cpp</code> · <code>README.md</code> (x64 Debug/Release, <code>OpenCV5.props</code>)</li></ul>' },
          { type: 'code', title: 'main.cpp ① — 상태와 키 처리 함수', code: APP_STATE, run: false, file: 'main.cpp',
            desc: '키가 바꾸는 값을 <code>struct AppState</code> 하나에 모으고, <code>handleKey(int key, AppState&amp; s)</code> 가 키를 <b>상태 변화로만</b> 바꿉니다. 이 함수는 카메라 · 창과 전혀 관계없으므로 <b>키 목록을 넣어 시험</b>할 수 있습니다(실습 3). 스냅샷처럼 "한 번만" 일어나는 일은 <code>snapshot = true</code> 로 표시만 하고, 루프가 처리한 뒤 <code>false</code> 로 되돌립니다. <code>key &amp; 0xFF</code> 는 일부 백엔드가 상위 비트에 싣는 정보를 떼어 냅니다.' },
          { type: 'code', title: 'main.cpp ② — 프레임 루프 (발췌)', code: APP_LOOP, run: false, local: true, file: 'main.cpp',
            desc: '1교시의 루프와 <b>구조가 똑같습니다</b>: 읽기 → 처리 → 표시 → 키. 달라진 점은 ① 종료 조건이 <code>state.quit</code> ② 흑백 · 에지 결과도 <b>항상 3채널 canvas</b> 로 만들어 녹화(<code>isColor=true</code>)와 컬러 글씨가 쉽게 ③ 녹화는 <code>r</code> 을 켜는 순간 <code>open</code>, 끄는 순간 <code>release</code> ④ 녹화 · 스냅샷은 <b>HUD 를 그리기 전</b>에 해서 기록에 글씨가 남지 않게 ⑤ <code>getWindowProperty(win, WND_PROP_VISIBLE) &lt; 1</code> 이면 사용자가 창의 X 를 누른 것 — 이 함수는 브라우저 실습 환경에 없어서 Visual Studio 에서만 씁니다.' },
          { type: 'callout', kind: 'vs', title: 'Visual Studio 에서 실행하기', html: '<ol><li><code>vs/studyOpenCVCPP.sln</code> 을 열고 솔루션 탐색기에서 <code>Ch15_Camera</code> 를 우클릭 → <b>시작 프로젝트로 설정</b>, 플랫폼 <b>x64</b> → <b>F5</b>.</li><li>카메라 1 번이나 동영상 파일을 쓰려면 프로젝트 속성 → 디버깅 → <b>명령 인수</b>에 <code>1</code> 또는 <code>images/…mp4</code> 경로를 넣습니다.</li><li>안 열리면: Windows 설정 → 개인 정보 및 보안 → 카메라 → <b>"데스크톱 앱이 카메라에 액세스하도록 허용"</b> 을 켜고, 줌 · 팀즈 등 카메라를 쓰는 프로그램을 종료합니다.</li><li><code>e</code> · <code>m</code> 을 켜 가며 FPS 가 어떻게 변하는지 보세요. <b>Release</b> 로 바꾸면 크게 빨라집니다.</li><li>스냅샷 · 녹화 파일은 작업 폴더(<code>vs/</code>)에 생깁니다. 녹화 파일이 0 KB 면 크기 · 채널 수 불일치를 의심하세요.</li></ol>' },
          { type: 'callout', kind: 'tip', teacher: true, title: '평가 루브릭 · 마무리', html: '<ul><li><b>상</b>: 영상의 성질(부품이 밝다)을 보고 알고리즘을 고르며, 기준선 통과 카운트를 직접 구현하고 왜 정답이 5개인지 부품 좌표로 검산한다. <code>handleKey</code> 를 분리한 이유(시험 가능성)를 설명한다.</li><li><b>중</b>: 예제를 수정해 임계값 · 면적 필터를 조정하고 프레임별 검출 결과를 해석한다. <code>prev = gray</code> 와 <code>copyTo</code> 의 차이를 안다.</li><li><b>하</b>: 프레임마다 개수를 더해 87개를 답한다 → 예제 4 의 누적 출력을 함께 읽으며 "같은 부품" 개념을 짚어 줍니다.</li><li><b>C++ 포인트</b>: <code>Ptr&lt;…&gt;</code> 와 <code>-&gt;</code>, 람다 정렬, <code>static const</code> 지역 변수, <code>struct</code> 기본 멤버 초기화, 참조 매개변수(<code>AppState&amp;</code>).</li><li>💬 마무리 발문: “벨트가 두 배 빨라져 프레임당 72 px 씩 움직이면 어디를 고쳐야 할까?” — 매칭 범위 <code>10~60</code> 을 넓힌다(또는 광류로 잰 이동량 사용). “부품이 두 줄로 흐르면?” — y 로도 구분(이미 <code>abs(p.y - c.y) &lt; 30</code> 이 그 역할).</li><li>다음 차시 예고: Part 4 로 넘어가 지금까지의 처리들을 <b>클래스</b>로 묶는 이미지 처리 도구(16차시)와 실전 검사 프로젝트(17차시)를 만듭니다. 오늘의 <code>AppState</code> · <code>handleKey</code> 분리가 그 출발점입니다.</li></ul>' }
        ],
        practice: [
          {
            title: '임계값과 면적 필터 바꿔 보기', level: 1,
            desc: '<code>videos/conveyor.mp4</code> 의 <b>10번 프레임</b>에서 밝기 임계값을 100 · 150 · 200 으로, 면적 필터를 500 · 1200 · 3000 으로 바꿔 가며 검출되는 부품 수가 어떻게 달라지는지 출력하세요. (힌트: <code>cap.set(CAP_PROP_POS_FRAMES, 9)</code> 로 바로 점프하면 한 장만 읽으면 됩니다.)',
            hint: '<code>POS_FRAMES</code> 는 0부터 세므로 10번째 프레임은 9 입니다. 이중 <code>for</code> 로 임계값 × 면적 조합 9가지를 돌립니다. 윤곽선은 임계값마다 한 번만 구하고, 면적별로 <code>count_if</code> 나 반복문으로 셉니다. 임계값 100 은 레일 등 밝은 배경까지 흰색이 되어 개수가 늘고, 200 은 부품 가장자리가 깎여 면적 필터에 걸립니다 — 150 부근이 정답(5개)을 안정적으로 줍니다.',
            expect: '10번 프레임으로 조합 시험 (정답: 부품 5개)\n  임계값 100, 면적>  500 -> 7개\n  임계값 100, 면적> 1200 -> 7개\n  임계값 100, 면적> 3000 -> 5개\n  임계값 150, 면적>  500 -> 5개\n  임계값 150, 면적> 1200 -> 5개\n  임계값 150, 면적> 3000 -> 3개\n  임계값 200, 면적>  500 -> 4개\n  임계값 200, 면적> 1200 -> 0개\n  임계값 200, 면적> 3000 -> 0개',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap("videos/conveyor.mp4");
    Mat frame, gray, bin;
    cap.set(CAP_PROP_POS_FRAMES, 9);           // 10번째 프레임으로 점프 (0부터 센다)
    cap.read(frame);
    cvtColor(frame, gray, COLOR_BGR2GRAY);
    Mat k = getStructuringElement(MORPH_ELLIPSE, Size(5, 5));
    cout << "10번 프레임으로 조합 시험 (정답: 부품 5개)" << endl;

    int ths[] = { 100, 150, 200 };
    int areas[] = { 500, 1200, 3000 };
    for (int th : ths)
    {
        // TODO: gray 를 th 로 이진화하고 MORPH_OPEN 한 뒤 윤곽선을 구하세요
        // TODO: areas 의 각 값보다 면적이 큰 윤곽선 개수를 출력하세요
        //       format("  임계값 %d, 면적>%5d -> %d개", th, a, cnt)
    }
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap("videos/conveyor.mp4");
    Mat frame, gray, bin;
    cap.set(CAP_PROP_POS_FRAMES, 9);           // 10번째 프레임으로 점프 (0부터 센다)
    cap.read(frame);
    cvtColor(frame, gray, COLOR_BGR2GRAY);
    Mat k = getStructuringElement(MORPH_ELLIPSE, Size(5, 5));
    cout << "10번 프레임으로 조합 시험 (정답: 부품 5개)" << endl;

    int ths[] = { 100, 150, 200 };
    int areas[] = { 500, 1200, 3000 };
    for (int th : ths)
    {
        threshold(gray, bin, th, 255, THRESH_BINARY);
        morphologyEx(bin, bin, MORPH_OPEN, k);
        vector<vector<Point>> cs;
        findContours(bin, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
        for (int a : areas)
        {
            int cnt = 0;
            for (const auto& c : cs)
                if (contourArea(c) > a) cnt++;
            cout << format("  임계값 %d, 면적>%5d -> %d개", th, a, cnt) << endl;
        }
    }
    imshow("frame 10", frame);
    waitKey(0);
    return 0;
}`
          },
          {
            title: '구멍 없는 불량 부품(NG) 찾아내기', level: 2,
            desc: '컨베이어의 부품 <b>#2 는 구멍이 없는 불량</b>입니다(IMAGES.md). 정상 와셔는 가운데가 <b>어둡고</b>(구멍), NG 부품은 가운데까지 <b>밝습니다</b>. 각 프레임에서 검출한 부품마다 <b>바운딩 박스 중심의 그레이 값</b>을 보고 150 보다 크면 "NG 구멍없음" 으로 판정하세요. 화면에 잘린 부품(중심 x &lt; 40 또는 &gt; 600)은 건너뜁니다. 프레임 2 와 5 의 판정 결과를 출력하고, NG 가 보인 횟수(프레임 수)를 세세요.',
            hint: '중심 픽셀 값은 <code>gray.at&lt;uchar&gt;(cy, cx)</code> 입니다 — <b>(행 y, 열 x)</b> 순서와 <code>(int)</code> 출력에 주의하세요. 프레임 2 에서는 x=325 인 부품이, 프레임 5 에서는 x=433 인 부품이 NG 입니다 (같은 #2 부품이 흘러가는 중).',
            expect: '  f 2 x=168 면적 3444 중심 밝기  70 -> OK\n  f 2 x=325 면적 3458 중심 밝기 201 -> NG 구멍없음\n  f 2 x=476 면적 3456 중심 밝기  68 -> OK\n  f 5 x=138 면적 3454 중심 밝기  71 -> OK\n  f 5 x=276 면적 3453 중심 밝기  70 -> OK\n  f 5 x=433 면적 3456 중심 밝기 198 -> NG 구멍없음\n  f 5 x=584 면적 3437 중심 밝기  66 -> OK\n구멍 없는 부품이 보인 프레임 수(연): 9',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap("videos/conveyor.mp4");
    Mat frame, gray, bin;
    Mat k = getStructuringElement(MORPH_ELLIPSE, Size(5, 5));
    int n = 0, ngSeen = 0;
    while (cap.read(frame))
    {
        n++;
        cvtColor(frame, gray, COLOR_BGR2GRAY);
        threshold(gray, bin, 150, 255, THRESH_BINARY);
        morphologyEx(bin, bin, MORPH_OPEN, k);
        vector<vector<Point>> cs;
        findContours(bin, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
        sort(cs.begin(), cs.end(), [](const vector<Point>& a, const vector<Point>& b)
             { return boundingRect(a).x < boundingRect(b).x; });
        for (const auto& c : cs)
        {
            double area = contourArea(c);
            if (area <= 1200) continue;
            Rect r = boundingRect(c);
            int cx = r.x + r.width / 2, cy = r.y + r.height / 2;
            if (cx < 40 || cx > 600) continue;         // 화면에 잘린 부품 제외
            // TODO: gray.at<uchar>(cy, cx) 로 중심 밝기를 읽고 150 초과면 NG
            // TODO: NG 면 ngSeen++, n 이 2 또는 5 면 아래 형식으로 출력
            //   format("  f%2d x=%3d 면적 %.0f 중심 밝기 %3d -> %s", n, cx, area, v, "OK")
        }
    }
    cout << "구멍 없는 부품이 보인 프레임 수(연): " << ngSeen << endl;
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap("videos/conveyor.mp4");
    Mat frame, gray, bin;
    Mat k = getStructuringElement(MORPH_ELLIPSE, Size(5, 5));
    int n = 0, ngSeen = 0;
    while (cap.read(frame))
    {
        n++;
        cvtColor(frame, gray, COLOR_BGR2GRAY);
        threshold(gray, bin, 150, 255, THRESH_BINARY);
        morphologyEx(bin, bin, MORPH_OPEN, k);
        vector<vector<Point>> cs;
        findContours(bin, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
        sort(cs.begin(), cs.end(), [](const vector<Point>& a, const vector<Point>& b)
             { return boundingRect(a).x < boundingRect(b).x; });
        for (const auto& c : cs)
        {
            double area = contourArea(c);
            if (area <= 1200) continue;
            Rect r = boundingRect(c);
            int cx = r.x + r.width / 2, cy = r.y + r.height / 2;
            if (cx < 40 || cx > 600) continue;
            int v = gray.at<uchar>(cy, cx);              // (행 y, 열 x)!
            bool noHole = v > 150;
            if (noHole) ngSeen++;
            if (n == 2 || n == 5)
                cout << format("  f%2d x=%3d 면적 %.0f 중심 밝기 %3d -> %s", n, cx, area, v,
                               noHole ? "NG 구멍없음" : "OK") << endl;
        }
    }
    cout << "구멍 없는 부품이 보인 프레임 수(연): " << ngSeen << endl;
    return 0;
}`
          },
          {
            title: '키 처리 함수를 카메라 없이 시험하기', level: 2,
            desc: 'Ch15_Camera 의 <code>handleKey(int key, AppState&amp; s)</code> 를 완성하세요. <code>ESC</code>(27)와 <code>q</code> 는 종료, <code>SPACE</code> 는 스냅샷, <code>g</code> · <code>e</code> · <code>m</code> · <code>r</code> 은 각각 흑백 · 에지 · 움직임 · 녹화를 켜고 끕니다. <code>-1</code>(키 없음)과 모르는 키는 무시합니다. <code>main</code> 은 <b>미리 정한 키 목록</b>을 차례로 넣으며 상태를 출력합니다 — 카메라 없이도 키 처리를 확인할 수 있다는 것이 함수를 분리한 이유입니다.',
            hint: '<code>switch (key &amp; 0xFF)</code> 안에서 <code>case 27: case \'q\': s.quit = true; break;</code> 처럼 두 case 를 붙여 쓸 수 있습니다. 켜고 끄기는 <code>s.gray = !s.gray;</code>. <code>key &lt; 0</code> 이면 바로 <code>return</code> 하세요 — <code>-1 &amp; 0xFF</code> 는 255 이므로 먼저 걸러야 합니다.',
            expect: "키 'g' -> gray=1 edges=0 motion=0 rec=0 snap=0 quit=0\n키 -1 -> gray=1 edges=0 motion=0 rec=0 snap=0 quit=0\n키 'e' -> gray=1 edges=1 motion=0 rec=0 snap=0 quit=0\n키 ' ' -> gray=1 edges=1 motion=0 rec=0 snap=1 quit=0\n키 'g' -> gray=0 edges=1 motion=0 rec=0 snap=0 quit=0\n키 'r' -> gray=0 edges=1 motion=0 rec=1 snap=0 quit=0\n키 'x' -> gray=0 edges=1 motion=0 rec=1 snap=0 quit=0\n키 'm' -> gray=0 edges=1 motion=1 rec=1 snap=0 quit=0\n키 'r' -> gray=0 edges=1 motion=1 rec=0 snap=0 quit=0\n키 27 -> gray=0 edges=1 motion=1 rec=0 snap=0 quit=1\n종료 요청 -> 루프를 빠져나갑니다",
            starter: `#include <iostream>
#include <vector>
using namespace std;

struct AppState
{
    bool gray = false, edges = false, motion = false;
    bool recording = false, snapshot = false, quit = false;
};

void handleKey(int key, AppState& s)
{
    // TODO: key < 0 이면 무시
    // TODO: switch (key & 0xFF) — 27/'q' 종료, ' ' 스냅샷, 'g' 'e' 'm' 'r' 켜고 끄기
}

void print(int key, const AppState& s)
{
    if (key >= 32 && key < 127) cout << "키 '" << (char)key << "'";
    else cout << "키 " << key;
    cout << " -> gray=" << s.gray << " edges=" << s.edges << " motion=" << s.motion
         << " rec=" << s.recording << " snap=" << s.snapshot << " quit=" << s.quit << endl;
}

int main()
{
    vector<int> keys = { 'g', -1, 'e', ' ', 'g', 'r', 'x', 'm', 'r', 27 };   // 미리 정한 키 입력
    AppState s;
    for (int key : keys)
    {
        handleKey(key, s);
        print(key, s);
        s.snapshot = false;              // 루프가 스냅샷을 저장한 뒤 되돌리는 것을 흉내
        if (s.quit) { cout << "종료 요청 -> 루프를 빠져나갑니다" << endl; break; }
    }
    return 0;
}`,
            solution: `#include <iostream>
#include <vector>
using namespace std;

struct AppState
{
    bool gray = false, edges = false, motion = false;
    bool recording = false, snapshot = false, quit = false;
};

void handleKey(int key, AppState& s)
{
    if (key < 0) return;                 // -1 = 키 없음 (-1 & 0xFF 는 255 이므로 먼저 거른다)
    switch (key & 0xFF)
    {
    case 27: case 'q': s.quit = true; break;
    case ' ': s.snapshot = true; break;
    case 'g': s.gray = !s.gray; break;
    case 'e': s.edges = !s.edges; break;
    case 'm': s.motion = !s.motion; break;
    case 'r': s.recording = !s.recording; break;
    default: break;                      // 모르는 키는 무시
    }
}

void print(int key, const AppState& s)
{
    if (key >= 32 && key < 127) cout << "키 '" << (char)key << "'";
    else cout << "키 " << key;
    cout << " -> gray=" << s.gray << " edges=" << s.edges << " motion=" << s.motion
         << " rec=" << s.recording << " snap=" << s.snapshot << " quit=" << s.quit << endl;
}

int main()
{
    vector<int> keys = { 'g', -1, 'e', ' ', 'g', 'r', 'x', 'm', 'r', 27 };
    AppState s;
    for (int key : keys)
    {
        handleKey(key, s);
        print(key, s);
        s.snapshot = false;
        if (s.quit) { cout << "종료 요청 -> 루프를 빠져나갑니다" << endl; break; }
    }
    return 0;
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: '움직임 검출과 라인 통과 카운트', subtitle: '2교시 — absdiff · MOG2 · 광류 · 한 번만 세기 · Ch15_Camera', notes: '<p>1교시 숙제 질문으로 시작: “매 프레임 4~5개가 보이는데 전체로 몇 개가 지나갔을까?” 💬 학생들의 답을 몇 개 받아 둡니다(더한다 / 최대값 / 모르겠다). 오늘 끝에 정답 5개를 코드로 확인한다고 예고합니다. (3분)</p>' },
          { layout: 'diagram', title: '움직임 검출 파이프라인', html: FIG_MOTION, caption: '프레임 차이 / 배경 차분 → 이진화 · 모폴로지 → 윤곽선 → 기준선 통과 카운트', notes: '<p>네 단계를 짚고, 특히 아래 두 줄의 ⚠️ 를 강조합니다: ① 배경이 움직이면 전제가 깨진다 ② 검출만으로는 같은 부품을 여러 번 센다. 이 두 가지가 오늘의 핵심 난관입니다. (5분)</p>' },
          { layout: 'image', title: '오늘의 영상: 컨베이어', src: 'images/conveyor_00.png', caption: '벨트가 프레임당 +36 px · 부품(와셔)이 왼→오로 흐른다 · NG: #2 구멍없음 · #5 균열 · #8 깨짐', notes: '<p>20장의 프레임이 <code>conveyor_00~19.png</code> 로 들어 있고, <code>VideoCapture("videos/conveyor.mp4")</code> 로 열린다고 설명합니다. 💬 “부품과 벨트를 구별할 수 있는 단서는?” — 밝기! 이 답을 미리 받아 두면 예제 3 이 자연스러워집니다. (3분)</p>' },
          { layout: 'code', title: '두 프레임의 차이 (absdiff)', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap("videos/conveyor.mp4");
    Mat frame, gray, prev, diff, moved;
    int n = 0;
    while (cap.read(frame))
    {
        n++;
        cvtColor(frame, gray, COLOR_BGR2GRAY);
        if (!prev.empty())
        {
            absdiff(gray, prev, diff);
            threshold(diff, moved, 30, 255, THRESH_BINARY);
            if (n <= 3) cout << "f" << n << ": 변화 " << countNonZero(moved) << endl;
        }
        gray.copyTo(prev);                 // prev = gray; 는 공유 → 차이 0!
    }
    return 0;
}`, points: ['<code>gray.copyTo(prev)</code> — <code>prev = gray;</code> 는 데이터 공유', '변화 픽셀이 전체의 <b>6~7%</b>', '부품만이 아니라 <b>벨트 무늬 전체</b>가 움직였다'], notes: '<p><code>prev = gray;</code> 함정을 일부러 보여 주세요 — 실행하면 변화가 0 이 됩니다. 1교시 실습 2 와 같은 원리(Mat 대입 = 공유)입니다. 결과 이미지(diff)를 띄워 벨트 이음매가 줄무늬로 보이는 것을 확인시킵니다. 💬 “우리가 찾고 싶은 건 부품인데 벨트가 잡혔다. 왜?” (6분)</p>' },
          { layout: 'code', title: '배경 차분 MOG2 + 열기 + 윤곽선', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;
int main()
{
    VideoCapture cap("videos/conveyor.mp4");
    Ptr<BackgroundSubtractorMOG2> bg = createBackgroundSubtractorMOG2();
    Mat frame, fg, open, k = getStructuringElement(MORPH_ELLIPSE, Size(5, 5));
    int n = 0;
    while (cap.read(frame))
    {
        n++;
        bg->apply(frame, fg);                  // 0 배경 · 127 그림자 · 255 전경
        morphologyEx(fg, open, MORPH_OPEN, k);
        if (n < 18) continue;
        vector<vector<Point>> cs;
        findContours(open, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
        int big = 0;
        for (const auto& c : cs) if (contourArea(c) > 200) big++;
        cout << "f" << n << ": 큰 덩어리 " << big << "개" << endl;
    }
    return 0;
}`, points: ['<code>Ptr&lt;&gt;</code> = 스마트 포인터 → <code>bg-&gt;apply</code>', 'MOG2 = 픽셀마다 배경 밝기 분포를 <b>학습</b>', '마스크: 0 배경 · <b>127 그림자</b> · 255 전경', '결과는 1~5개로 <b>들쭉날쭉</b> — 왜?'], notes: '<p>결과가 기대와 다르다는 점을 학생이 먼저 느끼게 합니다. 💬 “부품은 12개인데 왜 1~5개일까요?” — 벨트가 움직여 배경 모델이 계속 무너지고, 부품은 앞뒤 테두리만 남는다. <code>Ptr</code> 은 <code>std::shared_ptr</code> 과 같다(13차시 CLAHE 와 같은 패턴)고 짚어 줍니다. (6분)</p>' },
          { layout: 'bullets', title: '⚠️ 알고리즘보다 영상을 먼저 보라', lead: 'absdiff · MOG2 가 이 영상에서 잘 안 되는 이유', bullets: [
            '두 방법 모두 <b>"배경은 정지해 있다"</b> 를 가정한다',
            '컨베이어는 <b>벨트 자체가 프레임당 36 px</b> 움직인다 → 가정이 깨진다',
            '벨트 무늬가 전경으로 잡히고, 부품은 테두리만 남거나 배경으로 학습된다',
            '<b>이 영상의 진짜 단서: 부품이 벨트보다 확실히 밝다</b> (≈200 vs ≈60)',
            ['해결', ['<code>threshold(gray, bin, 150, 255, THRESH_BINARY)</code> 한 줄', '→ 프레임마다 4~5개가 안정적으로 잡힌다']]
          ], notes: '<p>15차시에서 가장 중요한 교훈입니다. 파라미터 튜닝 전에 <b>영상을 픽셀 값으로 들여다보라</b>. 결과 창에서 벨트와 부품의 밝기를 마우스로 확인시키면 완벽합니다. 💬 “고정 카메라 + 정지 배경(사람 · 차량 감시)이면 MOG2 가 좋은 선택” 이라는 균형도 함께. (4분)</p>' },
          { layout: 'code', title: '밝기 임계값으로 부품 찾기', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap("videos/conveyor.mp4");
    Mat frame, gray, bin, k = getStructuringElement(MORPH_ELLIPSE, Size(5, 5));
    for (int n = 1; cap.read(frame); n++)
    {
        cvtColor(frame, gray, COLOR_BGR2GRAY);
        threshold(gray, bin, 150, 255, THRESH_BINARY);     // 부품은 밝다
        morphologyEx(bin, bin, MORPH_OPEN, k);
        vector<vector<Point>> cs;
        findContours(bin, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
        int parts = 0;
        for (const auto& c : cs) if (contourArea(c) > 1200) parts++;
        if (n <= 3) cout << "f" << n << ": 부품 " << parts << "개" << endl;
    }
    return 0;
}`, points: ['부품은 밝다 → <code>threshold(150)</code> 한 줄', '와셔 면적 ≈ π(34²−14²) ≈ 3016 → 필터 1200 은 넉넉', '프레임마다 <b>4~5개</b> 안정 · 중심도 정답과 일치'], notes: '<p>본문 예제 3 으로 검출 사각형을 그린 화면을 함께 띄웁니다. 중심 좌표(132 · 289 · 440 · 584)를 IMAGES.md 정답(132 · 290 · 440 · 585)과 비교시키면 신뢰가 생깁니다. 💬 “면적 필터를 3000 으로 올리면?” — 잘린 부품이 빠진다(실습 1). (5분)</p>' },
          { layout: 'code', title: '한 번만 세기: 기준선 통과', code: `// findParts(frame) = 밝기 검출로 구한 부품 중심 (x 순서) — 예제 4
const int LINE_X = 320;
vector<Point2f> prevCenters;
int crossed = 0;
while (cap.read(frame))
{
    vector<Point2f> centers = findParts(frame);
    for (const Point2f& c : centers)
    {
        if (c.x < LINE_X) continue;                    // 아직 선 왼쪽
        for (const Point2f& p : prevCenters)           // 이전 프레임의 같은 부품?
            if (abs(p.y - c.y) < 30 && c.x - p.x > 10 && c.x - p.x < 60
                && p.x < LINE_X)                       // 이전엔 선 왼쪽!
            {
                crossed++;
                break;
            }
    }
    prevCenters = centers;                             // vector 대입 = 복사
}`, run: false, points: ['같은 부품: <b>y 가 비슷 + x 가 10~60 px 왼쪽</b> (벨트 36 px/프레임)', '조건: <b>이전엔 선 왼쪽, 지금은 선 오른쪽</b> → crossed++', '전체 실행 결과 = <b>5개</b> (부품 #2 ~ #6)', '<code>vector</code> 대입은 Mat 과 달리 <b>깊은 복사</b>'], notes: '<p>칠판에 기준선과 두 프레임의 중심을 그려 “넘는 순간” 을 시각화합니다. 본문 예제 4 를 실행해 누적 카운트가 f2 · f7 · f11 · f15 · f19 에서 오르는 것을 확인시키고, IMAGES.md 의 좌표로 검산합니다(#2~#6). 💬 “<code>prevCenters = centers;</code> 는 Mat 처럼 공유일까?” — 아니다, <code>std::vector</code> 는 값 복사. (8분)</p>' },
          { layout: 'code', title: '광류: 점을 따라가기 (Lucas-Kanade)', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap("videos/conveyor.mp4");
    Mat frame, gray, prevGray;
    cap.read(frame);
    cvtColor(frame, prevGray, COLOR_BGR2GRAY);
    vector<Point2f> pts, next;
    goodFeaturesToTrack(prevGray, pts, 40, 0.01, 10, prevGray > 150);

    cap.read(frame);
    cvtColor(frame, gray, COLOR_BGR2GRAY);
    vector<uchar> status;  vector<float> err;
    calcOpticalFlowPyrLK(prevGray, gray, pts, next, status, err);
    double dx = 0; int ok = 0;
    for (size_t i = 0; i < pts.size(); i++)
        if (status[i]) { dx += next[i].x - pts[i].x; ok++; }
    cout << ok << "/" << pts.size() << "개 추적, 평균 x 이동 " << dx / ok << endl;
    return 0;
}`, points: ['<code>goodFeaturesToTrack</code> 으로 코너를 고르고', '<code>calcOpticalFlowPyrLK</code> → 다음 프레임의 위치 + <code>status</code>', '평균 이동 ≈ 33 px → <b>공정 지식 없이</b> 벨트 속도 추정'], notes: '<p>본문 예제 5 로 화살표가 그려진 화면을 보여 줍니다. 💬 “벨트 속도(36 px)보다 조금 작게 나오는 이유는?” — 모션 블러, 화면 밖으로 나가는 점. 광류는 기준선 방법의 매칭 범위를 자동으로 정할 때 쓸 수 있다고 연결합니다. (5분)</p>' },
          { layout: 'diagram', title: 'Ch15_Camera: 실제 웹캠 뷰어의 구조', html: FIG_APP, caption: '키 → handleKey → AppState → 프레임 루프(처리 · 녹화 · 스냅샷 · HUD · imshow)', notes: '<p>C# 판은 WPF + 스레드였지만 C++ 판은 <b>한 루프</b>로 충분합니다 — <code>waitKey</code> 가 창 이벤트를 처리하기 때문. 대신 함수로 나눈다: 상태 · 키 처리 · 움직임 검출 · HUD. 💬 “녹화 파일에 FPS 글씨가 찍히지 않게 하려면?” — HUD 를 기록 <b>뒤에</b> 그린다. (4분)</p>' },
          { layout: 'code', title: 'Ch15_Camera: 키 처리 함수', code: `struct AppState
{
    bool gray = false, edges = false, motion = false;
    bool recording = false, snapshot = false, quit = false;
};

void handleKey(int key, AppState& s)    // 키 → 상태 변화만
{
    if (key < 0) return;                // -1 = 키 없음
    switch (key & 0xFF)
    {
    case 27: case 'q': s.quit = true; break;
    case ' ': s.snapshot = true; break;   // 루프가 저장 후 false 로
    case 'g': s.gray = !s.gray; break;
    case 'e': s.edges = !s.edges; break;
    case 'm': s.motion = !s.motion; break;
    case 'r': s.recording = !s.recording; break;
    }
}
// 루프:  handleKey(waitKey(1), state);  if (state.quit) break;`, run: false, file: 'main.cpp', points: ['상태를 <code>struct</code> 하나에 — 기본 멤버 초기화', '키 처리는 카메라 · 창과 <b>분리</b> → 키 목록으로 시험 가능 (실습 3)', '녹화: 켜는 순간 <code>open</code>, 끄는 순간 <code>release</code>'], notes: '<p>“함수로 나누면 무엇이 좋은가?” 를 묻고 “카메라 없이 시험할 수 있다” 는 답을 끌어냅니다. 실습 3 이 바로 그것. <code>-1 &amp; 0xFF</code> 가 255 라서 <code>key &lt; 0</code> 을 먼저 거른다는 C++ 비트 연산 포인트도 짚어 주세요. Visual Studio 에서 실제 웹캠으로 시연하면 가장 좋습니다. (5분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '컨베이어 위 부품을 <b>한 번만</b> 세려면?', options: ['프레임마다 검출된 개수를 모두 더한다', '가장 많이 검출된 프레임의 개수를 쓴다', '기준선을 넘는 순간에만 센다 (이전 프레임 중심과 비교)', '마지막 프레임의 개수를 쓴다'], answer: 2, explain: '프레임마다 4~5개가 보이므로 그냥 더하면 87개가 됩니다. <b>이전엔 선 왼쪽 · 지금은 선 오른쪽</b>일 때만 세면 정확히 5개입니다.', notes: '<p>정답 3번. 1번을 고른 학생이 있으면 실제로 더해 보게 해 87 이 나오는 것을 확인시킵니다 — 틀린 답을 직접 만들어 보는 것이 가장 잘 남습니다. (2분)</p>' },
          { layout: 'practice', title: '실습: 구멍 없는 NG 부품 찾기', desc: '<p>부품 <b>#2 는 구멍이 없는 불량</b>입니다. 정상은 가운데가 어둡고(구멍), NG 는 가운데까지 밝습니다.</p><ul><li>부품마다 <code>gray.at&lt;uchar&gt;(cy, cx)</code> 로 중심 밝기 확인 → 150 초과면 NG</li><li>잘린 부품(중심 x &lt; 40 또는 &gt; 600)은 제외</li><li>정답: 프레임 2 의 x=325, 프레임 5 의 x=433 이 NG · NG 가 보인 프레임 9번</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap("videos/conveyor.mp4");
    Mat frame, gray, bin;
    int n = 0;
    while (cap.read(frame))
    {
        n++;
        cvtColor(frame, gray, COLOR_BGR2GRAY);
        threshold(gray, bin, 150, 255, THRESH_BINARY);
        // TODO: 윤곽선 → 면적 1200 초과 → 중심 밝기로 OK / NG 판정
    }
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap("videos/conveyor.mp4");
    Mat frame, gray, bin;
    int n = 0;
    while (cap.read(frame))
    {
        n++;
        cvtColor(frame, gray, COLOR_BGR2GRAY);
        threshold(gray, bin, 150, 255, THRESH_BINARY);
        if (n != 2) continue;
        vector<vector<Point>> cs;
        findContours(bin, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
        for (const auto& c : cs)
        {
            if (contourArea(c) <= 1200) continue;
            Rect r = boundingRect(c);
            int cx = r.x + r.width / 2, cy = r.y + r.height / 2;
            if (cx < 40 || cx > 600) continue;
            int v = gray.at<uchar>(cy, cx);
            cout << "x=" << cx << " 중심 " << v << " -> " << (v > 150 ? "NG" : "OK") << endl;
        }
    }
    return 0;
}`, notes: '<p>핵심은 <code>at&lt;uchar&gt;(cy, cx)</code> 의 <b>(행, 열)</b> 순서와 <code>(int)</code> 출력입니다 — 3차시 이후 계속 강조해 온 규칙이 여기서 또 나옵니다. 💬 “#5 균열과 #8 깨짐은 이 방법으로 찾을 수 있을까?” — 못 찾는다. 균열은 가는 선이라 면적/원형도, 깨짐은 면적 감소로 봐야 한다 → 17차시 예고. 빨리 끝난 학생은 실습 3(키 처리 시험). (8분)</p>' },
          { layout: 'summary', title: '15차시 정리', bullets: ['<code>absdiff</code> · <code>MOG2</code> = 배경이 <b>정지</b>해 있을 때의 움직임 검출 (그림자 = 127)', '전경 마스크 → <code>MORPH_OPEN</code> → <code>findContours</code> + 면적 필터 → 물체', '<b>알고리즘보다 영상을 먼저</b>: 컨베이어는 밝기 임계값 한 줄이 더 튼튼했다', '지나가는 물체는 <b>기준선을 넘는 순간</b>에만 센다 → 컨베이어 5개', '<code>calcOpticalFlowPyrLK</code> 로 점을 따라가 이동량을 잰다', 'Ch15_Camera: <code>AppState</code> + <code>handleKey</code> + 한 루프 · 녹화는 켤 때 open / 끌 때 release', '<code>vs/Ch15_Camera</code> 를 Visual Studio 에서 실제 웹캠으로 실행해 보기', '다음: Part 4 — 이미지 처리 도구를 클래스로 설계(16차시) · 실전 검사 프로젝트(17차시)'], notes: '<p>여덟 줄을 정리합니다. 과제: ① <code>Ch15_Camera</code> 를 실행해 모드별 FPS 를 Debug/Release 로 기록 ② 실습 2 를 확장해 기준선에서만 OK/NG 판정하기. Part 3 이 끝났음을 알리고, 지금까지 배운 것들이 Part 4 에서 하나의 프로그램으로 합쳐진다고 마무리합니다. (3분)</p>' }
        ]
      }
    ]
  });
})();
