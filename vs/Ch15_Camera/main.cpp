// 15차시 완성 프로젝트: 웹캠 뷰어 (VideoCapture · TickMeter · VideoWriter · MOG2)
//  - 실행: Ch15_Camera.exe            → 카메라 0 번
//          Ch15_Camera.exe 1          → 카메라 1 번
//          Ch15_Camera.exe a.mp4      → 동영상 파일 (끝나면 종료)
//  - 키:  SPACE 스냅샷(snap_001.png …) · g 흑백 · e Canny 에지 · m 움직임 검출(MOG2)
//         r 녹화 시작/정지(record_날짜_시각.avi, MJPG) · h 도움말 · ESC/q 종료
//  - 작업 폴더는 OpenCV5.props 에서 솔루션 폴더(vs/)로 설정되어 있습니다 → 저장 파일도 그곳에 생깁니다.
#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
#include <ctime>
#include <cctype>
#ifdef _WIN32
#include <windows.h>
#endif
using namespace cv;
using namespace std;

// ------------------------------------------------------------------ 상태 (키로 바꾸는 값)
struct AppState
{
    bool gray = false;      // g: 흑백
    bool edges = false;     // e: Canny 에지
    bool motion = false;    // m: 움직임 검출 (MOG2)
    bool recording = false; // r: 녹화 중
    bool snapshot = false;  // SPACE: 이번 프레임을 저장
    bool quit = false;      // ESC / q
};

// 키 하나를 상태 변화로 바꾼다 — 화면 · 카메라와 분리해 두면 시험하기 쉽다
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
}

void printHelp()
{
    cout << "[키] SPACE 스냅샷 | g 흑백 | e 에지 | m 움직임 검출 | r 녹화 | h 도움말 | ESC/q 종료" << endl;
}

// "20261001_153012" 형태의 현재 시각 문자열 (녹화 파일 이름용)
string timeStamp()
{
    time_t t = time(nullptr);
    tm local{};
#ifdef _WIN32
    localtime_s(&local, &t);
#else
    localtime_r(&t, &local);
#endif
    char buf[32];
    strftime(buf, sizeof(buf), "%Y%m%d_%H%M%S", &local);
    return buf;
}

// 움직임 검출: MOG2 전경 → 그림자(127) 제거 → 열기 → 윤곽선 → 사각형. 움직이는 물체 수를 돌려준다
int detectMotion(const Mat& frame, Ptr<BackgroundSubtractorMOG2>& bg, Mat& canvas)
{
    static const Mat k = getStructuringElement(MORPH_ELLIPSE, Size(5, 5));
    Mat fg;
    bg->apply(frame, fg);                              // 0 배경 · 127 그림자 · 255 전경
    threshold(fg, fg, 200, 255, THRESH_BINARY);        // 그림자(127) 버리기
    morphologyEx(fg, fg, MORPH_OPEN, k);               // 점 잡음 제거
    dilate(fg, fg, k, Point(-1, -1), 2);               // 조각난 물체 이어 붙이기

    vector<vector<Point>> contours;
    findContours(fg, contours, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    int count = 0;
    for (const auto& c : contours)
    {
        if (contourArea(c) < 800) continue;            // 작은 변화는 무시
        rectangle(canvas, boundingRect(c), Scalar(0, 0, 255), 2);
        count++;
    }
    return count;
}

// 화면 위 정보(HUD): FPS · 모드 · 녹화 표시
void drawHud(Mat& canvas, double fps, const AppState& s, int moving, int snaps)
{
    string modes = string(s.gray ? "GRAY " : "") + (s.edges ? "EDGE " : "") + (s.motion ? "MOTION " : "");
    if (modes.empty()) modes = "ORIGINAL";
    putText(canvas, format("FPS %.1f", fps), Point(10, 28), FONT_HERSHEY_SIMPLEX, 0.8, Scalar(0, 255, 0), 2);
    putText(canvas, modes, Point(10, 56), FONT_HERSHEY_SIMPLEX, 0.6, Scalar(0, 255, 255), 2);
    if (s.motion)
        putText(canvas, format("moving: %d", moving), Point(10, 82), FONT_HERSHEY_SIMPLEX, 0.6, Scalar(0, 0, 255), 2);
    if (snaps > 0)
        putText(canvas, format("snap %d", snaps), Point(10, canvas.rows - 14), FONT_HERSHEY_SIMPLEX, 0.5, Scalar(255, 255, 255), 1);
    if (s.recording)
    {
        circle(canvas, Point(canvas.cols - 70, 24), 9, Scalar(0, 0, 255), FILLED);
        putText(canvas, "REC", Point(canvas.cols - 55, 32), FONT_HERSHEY_SIMPLEX, 0.7, Scalar(0, 0, 255), 2);
    }
}

int main(int argc, char** argv)
{
#ifdef _WIN32
    SetConsoleOutputCP(CP_UTF8);   // 한글 출력 (/utf-8 옵션과 함께)
#endif
    // ---------------------------------------------------------------- 1) 열기
    string source = argc > 1 ? argv[1] : "0";
    bool isCamera = !source.empty() && isdigit((unsigned char)source[0]) && source.size() <= 2;
    VideoCapture cap;
    if (isCamera)
    {
        int index = stoi(source);
#ifdef _WIN32
        cap.open(index, CAP_DSHOW);                    // Windows: DirectShow 가 보통 빨리 열린다
        if (!cap.isOpened()) cap.open(index, CAP_MSMF);
#endif
        if (!cap.isOpened()) cap.open(index);          // 기본(CAP_ANY) 로 한 번 더
    }
    else
        cap.open(source);

    if (!cap.isOpened())
    {
        cout << "'" << source << "' 을(를) 열 수 없습니다." << endl;
        cout << " - 카메라: 다른 프로그램(줌 · 팀즈)이 쓰고 있지 않은지, Windows 설정 > 개인 정보 > 카메라 권한을 확인하세요." << endl;
        cout << " - 파일: 경로(작업 폴더 = vs/)와 코덱을 확인하세요." << endl;
        return -1;
    }

    // 원하는 해상도를 요청 (카메라가 지원해야 반영된다 — 실제 값은 get 으로 다시 읽는다)
    if (isCamera)
    {
        cap.set(CAP_PROP_FRAME_WIDTH, 640);
        cap.set(CAP_PROP_FRAME_HEIGHT, 480);
    }
    int w = (int)cap.get(CAP_PROP_FRAME_WIDTH);
    int h = (int)cap.get(CAP_PROP_FRAME_HEIGHT);
    double camFps = cap.get(CAP_PROP_FPS);
    if (camFps <= 0) camFps = 30;                      // OpenCV 5: 모르는 값은 -1 (0 도 올 수 있다) → 기본값
    cout << "열림: " << source << " (" << cap.getBackendName() << ") " << w << " x " << h
         << ", 장치가 보고한 FPS " << camFps << endl;
    printHelp();

    // ---------------------------------------------------------------- 2) 루프 밖에서 한 번만 만드는 것들
    const string win = "Ch15_Camera";
    namedWindow(win, WINDOW_AUTOSIZE);
    Mat frame, gray, canvas;
    Ptr<BackgroundSubtractorMOG2> bg = createBackgroundSubtractorMOG2(300, 25, true);
    VideoWriter writer;
    AppState state;
    TickMeter meter;                                    // 읽기 + 처리 시간 → FPS
    double fps = 0;
    int snaps = 0, recorded = 0;

    // ---------------------------------------------------------------- 3) 프레임 루프
    while (!state.quit)
    {
        meter.start();
        if (!cap.read(frame) || frame.empty())
        {
            cout << (isCamera ? "카메라에서 프레임을 받지 못했습니다 (연결 끊김?)" : "동영상이 끝났습니다") << endl;
            break;
        }

        // 처리: 모드에 따라 canvas 를 만든다 (canvas 는 항상 3채널 → 녹화 · 컬러 글씨가 쉽다)
        int moving = 0;
        if (state.gray || state.edges)
        {
            cvtColor(frame, gray, COLOR_BGR2GRAY);
            if (state.edges)
            {
                GaussianBlur(gray, gray, Size(5, 5), 0);
                Canny(gray, gray, 60, 150);
            }
            cvtColor(gray, canvas, COLOR_GRAY2BGR);
        }
        else
            frame.copyTo(canvas);
        if (state.motion)
            moving = detectMotion(frame, bg, canvas);

        // 녹화: r 로 켜는 순간 파일을 열고, 끄는 순간 닫는다
        if (state.recording && !writer.isOpened())
        {
            string name = "record_" + timeStamp() + ".avi";
            writer.open(name, VideoWriter::fourcc('M', 'J', 'P', 'G'), camFps, canvas.size(), true);
            if (writer.isOpened()) { recorded = 0; cout << "녹화 시작: " << name << endl; }
            else { cout << "녹화 파일을 만들 수 없습니다 (코덱 확인)" << endl; state.recording = false; }
        }
        else if (!state.recording && writer.isOpened())
        {
            writer.release();
            cout << "녹화 정지: " << recorded << "프레임" << endl;
        }
        if (writer.isOpened())
        {
            writer.write(canvas);                       // HUD 를 그리기 전의 영상을 기록
            recorded++;
        }

        // 스냅샷: HUD 없는 처리 결과를 PNG 로
        if (state.snapshot)
        {
            string name = format("snap_%03d.png", ++snaps);
            imwrite(name, canvas);
            cout << "스냅샷 저장: " << name << endl;
            state.snapshot = false;
        }

        meter.stop();
        if (meter.getCounter() >= 10)                   // 10프레임마다 평균 FPS 갱신
        {
            fps = meter.getFPS();
            meter.reset();
        }

        drawHud(canvas, fps, state, moving, snaps);
        imshow(win, canvas);

        int key = waitKey(1);                           // 창 그리기 + 키 확인 (처리 속도를 재려고 1 ms)
        if ((key & 0xFF) == 'h') printHelp();
        handleKey(key, state);

        // 창의 X 버튼으로 닫았으면 끝낸다
        if (getWindowProperty(win, WND_PROP_VISIBLE) < 1) state.quit = true;
    }

    // ---------------------------------------------------------------- 4) 정리 (소멸자도 해 주지만 순서를 분명히)
    if (writer.isOpened())
    {
        writer.release();
        cout << "녹화 정지: " << recorded << "프레임" << endl;
    }
    cap.release();
    destroyAllWindows();
    cout << "종료 (스냅샷 " << snaps << "장)" << endl;
    return 0;
}
