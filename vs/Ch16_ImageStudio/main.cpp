// 16차시 Image Studio — Visual Studio 판 (키보드 단축키 · 트랙바)
//  - Studio 클래스(명령 해석기)는 강좌 3교시 예제 3(브라우저 판)과 같습니다. 키를 "명령 문자열" 로 바꿔 execute() 에 넘깁니다.
//  - 솔루션 폴더(vs/)에 images/ 폴더를 복사해 두세요 (강좌 저장소의 assets/images). 저장 파일도 솔루션 폴더에 생깁니다.
//  - 실행 인수로 이미지 경로를 주면 그 이미지로 시작합니다:  Ch16_ImageStudio.exe my.png
#include "Filter.h"
#include "Pipeline.h"
#include "History.h"
#include <iostream>
#ifdef _WIN32
#include <windows.h>
#endif
using namespace cv;
using namespace std;

// 원본 | 결과를 나란히 + 위쪽 글자 띠 + 아래쪽 상태 줄
Mat sideBySide(const Mat& before, const Mat& after, const string& a, const string& b, const string& status)
{
    Mat l = before, r = after, out;                 // 헤더만 복사 — hconcat 이 새 Mat 을 만든다
    if (l.channels() == 1) cvtColor(before, l, COLOR_GRAY2BGR);
    if (r.channels() == 1) cvtColor(after, r, COLOR_GRAY2BGR);
    hconcat(l, r, out);
    for (int i = 0; i < 2; i++)
    {
        rectangle(out, Rect(i * l.cols, 0, l.cols, 32), Scalar(0, 0, 0), FILLED);
        putText(out, i == 0 ? a : b, Point(i * l.cols + 10, 23), FONT_HERSHEY_SIMPLEX, 0.7, Scalar(255, 255, 255), 2);
    }
    copyMakeBorder(out, out, 0, 30, 0, 0, BORDER_CONSTANT, Scalar(50, 50, 50));
    putText(out, status, Point(10, out.rows - 9), FONT_HERSHEY_SIMPLEX, 0.55, Scalar(0, 255, 255), 1);
    return out;
}

class Studio
{
public:
    Studio() : factory_(makeFactory()) {}
    bool execute(const string& line);               // false = 끝내기
    Mat view() const
    {
        return sideBySide(original_, history_.current(), "BEFORE", "AFTER: " + history_.label(),
                          format("undo %d | redo %d | ", (int)history_.undoCount(), (int)history_.redoCount()) + recipe_.describe());
    }
    bool hasImage() const { return !original_.empty(); }

private:
    void open(const string& path);
    void applyFilter(unique_ptr<Filter> f);
    void info() const;
    void help() const;

    map<string, FilterMaker> factory_;
    History history_{ 20 };
    Pipeline recipe_;                               // 원본 → 현재 이미지를 만든 필터들
    vector<unique_ptr<Filter>> redoFilters_;        // undo 로 꺼낸 필터 (redo 때 되돌려 놓음)
    Mat original_;
    string path_;
};

void Studio::open(const string& path)
{
    Mat img = imread(path);
    if (img.empty()) { cout << "  열 수 없음: " << path << endl; return; }
    original_ = img;
    path_ = path;
    history_.reset(img, "open");
    recipe_.clear();
    redoFilters_.clear();
    cout << "  열기: " << path << " (" << img.cols << "x" << img.rows << ")" << endl;
}

void Studio::applyFilter(unique_ptr<Filter> f)
{
    Mat result = f->apply(history_.current());
    history_.push(result, f->name());
    recipe_.add(std::move(f));                      // 필터 객체의 소유권을 레시피로 옮긴다
    redoFilters_.clear();
    cout << "  적용: " << history_.label() << " -> " << typeToString(result.type())
         << format(", 평균 %.1f", mean(result)[0]) << endl;
}

void Studio::info() const
{
    const Mat& cur = history_.current();
    cout << "  파일: " << path_ << ", 원본 " << original_.cols << "x" << original_.rows
         << " " << typeToString(original_.type()) << endl;
    cout << "  현재: " << history_.label() << " (" << typeToString(cur.type())
         << format(", 평균 %.1f)", mean(cur)[0]) << endl;
    cout << "  레시피: " << recipe_.describe() << endl;
    cout << "  undo " << history_.undoCount() << " / redo " << history_.redoCount() << endl;
}

void Studio::help() const
{
    cout << "  필터:";
    for (const auto& kv : factory_) cout << " " << kv.first;
    cout << endl << "  기타: open info history undo redo reset show save replay quit" << endl;
}

bool Studio::execute(const string& line)
{
    istringstream in(line);
    string cmd;
    if (!(in >> cmd) || cmd[0] == '#') return true;       // 빈 줄 · 주석
    if (cmd == "quit" || cmd == "exit") return false;
    if (cmd == "help") { help(); return true; }
    if (cmd == "open") { string p; in >> p; open(p); return true; }
    if (!hasImage()) { cout << "  먼저 open 으로 이미지를 여세요" << endl; return true; }

    if (cmd == "info") info();
    else if (cmd == "undo")
    {
        if (!history_.undo()) { cout << "  되돌릴 것이 없습니다" << endl; return true; }
        redoFilters_.push_back(recipe_.popBack());
        cout << "  되돌리기 -> " << history_.label() << endl;
    }
    else if (cmd == "redo")
    {
        if (!history_.redo()) { cout << "  다시 실행할 것이 없습니다" << endl; return true; }
        recipe_.add(std::move(redoFilters_.back()));
        redoFilters_.pop_back();
        cout << "  다시 실행 -> " << history_.label() << endl;
    }
    else if (cmd == "reset")
    {
        history_.reset(original_, "open");
        recipe_.clear();
        redoFilters_.clear();
        cout << "  원본으로 초기화" << endl;
    }
    else if (cmd == "history")
    {
        vector<string> v = history_.labels();
        for (size_t i = 0; i < v.size(); i++)
            cout << "  " << i << ": " << v[i] << (i + 1 == v.size() ? "  <- 현재" : "") << endl;
    }
    else if (cmd == "show") imshow("Image Studio", view());
    else if (cmd == "save")
    {
        string p = "result.png";
        in >> p;
        cout << (imwrite(p, history_.current()) ? "  저장: " : "  저장 실패: ") << p << endl;
    }
    else if (cmd == "replay")                              // 레시피를 다른 이미지에 그대로 적용
    {
        string src, dst = "replay.png";
        in >> src >> dst;
        Mat img = imread(src);
        if (img.empty()) { cout << "  열 수 없음: " << src << endl; return true; }
        Mat out = recipe_.run(img);
        imwrite(dst, out);
        cout << "  " << src << " -> [" << recipe_.describe() << "] -> " << dst
             << format(" (평균 %.1f)", mean(out)[0]) << endl;
    }
    else
    {
        auto it = factory_.find(cmd);
        if (it == factory_.end()) { cout << "  알 수 없는 명령: " << cmd << " (help 로 목록 보기)" << endl; return true; }
        applyFilter(it->second(in));                       // 인수가 틀리면 여기서 예외
    }
    return true;
}

// ------------------------------------------------------------------ 키보드 UI
void printHelp()
{
    cout << "---------------------------------------------------------------" << endl;
    cout << " 1 gray   2 blur(kernel)   3 median(kernel)   4 thresh(0=otsu)" << endl;
    cout << " 5 canny  6 sharpen        7 bright/contrast  8 morph open(kernel)  9 invert" << endl;
    cout << " z undo   y redo   r reset   i info   h history   s save   o 다음 이미지" << endl;
    cout << " c 콘솔에서 명령 입력 (예: replay images/washers.png out.png)   ? 도움말   ESC 끝" << endl;
    cout << "---------------------------------------------------------------" << endl;
}

void runKeyboardUI(Studio& studio, const vector<string>& images)
{
    const string WIN = "Image Studio";
    namedWindow(WIN, WINDOW_AUTOSIZE);
    int k = 5, t = 0;                                  // 트랙바 값 (t = 0 이면 Otsu)
    createTrackbar("kernel", WIN, &k, 31);
    createTrackbar("thresh 0=otsu", WIN, &t, 255);
    size_t imgIndex = 0;
    int saveNo = 1;

    while (true)
    {
        Mat v = studio.view();
        if (v.cols > 1600)                             // 큰 이미지는 화면용으로만 줄인다
            resize(v, v, Size(), 1600.0 / v.cols, 1600.0 / v.cols, INTER_AREA);
        imshow(WIN, v);

        int key = waitKey(50);
        if (key < 0)                                   // 키 없음: 창이 닫혔는지만 확인
        {
            if (getWindowProperty(WIN, WND_PROP_VISIBLE) < 1) break;
            continue;
        }
        key &= 0xFF;
        if (key == 27) break;                          // ESC

        string cmd;
        switch (key)
        {
        case '1': cmd = "gray"; break;
        case '2': cmd = "blur " + to_string(k); break;
        case '3': cmd = "median " + to_string(k); break;
        case '4': cmd = (t == 0) ? "thresh otsu" : "thresh " + to_string(t); break;
        case '5': cmd = "canny 50 150"; break;
        case '6': cmd = "sharpen 1.0"; break;
        case '7': cmd = "bc 1.2 10"; break;
        case '8': cmd = "morph open " + to_string(k); break;
        case '9': cmd = "invert"; break;
        case 'z': cmd = "undo"; break;
        case 'y': cmd = "redo"; break;
        case 'r': cmd = "reset"; break;
        case 'i': cmd = "info"; break;
        case 'h': cmd = "history"; break;
        case 's': cmd = format("save studio_%03d.png", saveNo++); break;
        case 'o':
            imgIndex = (imgIndex + 1) % images.size();
            cmd = "open " + images[imgIndex];
            break;
        case 'c': cout << "명령> "; getline(cin, cmd); break;   // 콘솔에서 명령 직접 입력
        case '?': printHelp(); continue;
        default: continue;
        }
        cout << "> " << cmd << endl;
        try
        {
            if (!studio.execute(cmd)) break;
        }
        catch (const cv::Exception& e) { cout << "  OpenCV 오류: " << e.err << endl; }
        catch (const exception& e)     { cout << "  오류: " << e.what() << endl; }
    }
    destroyAllWindows();
}

int main(int argc, char** argv)
{
#ifdef _WIN32
    SetConsoleOutputCP(CP_UTF8);                       // 한글 출력 (/utf-8 옵션과 함께)
#endif
    vector<string> images = { "images/sample_color.png", "images/washers.png", "images/salt_pepper.png",
                              "images/low_contrast.png", "images/uneven_light.png", "images/nuts_bolts_color.png" };
    if (argc > 1) images.insert(images.begin(), argv[1]);

    Studio studio;
    cout << "Image Studio (OpenCV " << CV_VERSION << ")" << endl;
    studio.execute("open " + images[0]);
    if (!studio.hasImage())
    {
        cout << images[0] << " 을(를) 읽지 못했습니다. 솔루션 폴더에 images/ 를 복사했는지 확인하세요." << endl;
        return -1;
    }
    printHelp();
    runKeyboardUI(studio, images);
    return 0;
}
