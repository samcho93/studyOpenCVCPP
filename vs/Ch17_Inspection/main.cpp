// 17차시 완성 프로젝트: 실전 검사 프로그램 (개수 세기 · 색 분류 · 결함 검사)
//  - 실행: Ch17_Inspection.exe              → images/ 폴더의 예제 이미지를 검사
//          Ch17_Inspection.exe D:\my\images → 다른 폴더 (같은 파일 이름이 있어야 함)
//  - 순서: ① 검사기 준비(레시피) ② 모든 작업을 일괄 검사 → 표 출력 · results/report.csv · NG 이미지 저장
//          ③ 결과 보기 창: n/SPACE 다음 · p 이전 · s 현재 오버레이 저장 · ESC/q 종료
//  - 작업 폴더는 OpenCV5.props 에서 솔루션 폴더(vs/)로 설정되어 있습니다 → vs/images, vs/results
#include "Inspectors/CountInspector.h"
#include "Inspectors/ColorSortInspector.h"
#include "Inspectors/DefectInspector.h"
#include <iostream>
#include <fstream>
#include <memory>
#include <filesystem>
#ifdef _WIN32
#include <windows.h>
#endif
using namespace cv;
using namespace std;
namespace fs = std::filesystem;

// 검사 작업 하나: 어떤 이미지를 어떤 검사기로 (검사기는 inspectors 가 소유하고, 여기서는 가리키기만)
struct Job
{
    string file;
    Inspector* inspector;
};

// CSV 한 칸: 쉼표 · 따옴표가 있으면 "..." 로 감싼다
string csvCell(const string& s)
{
    if (s.find_first_of(",\"") == string::npos) return s;
    string q = "\"";
    for (char c : s) q += (c == '"') ? string("\"\"") : string(1, c);
    return q + "\"";
}

// 결과 보기 창의 아래쪽 안내 줄
Mat withFooter(const InspectionResult& r, size_t index, size_t total)
{
    Mat view = r.overlay.clone();
    rectangle(view, Rect(0, view.rows - 30, view.cols, 30), Scalar(40, 40, 40), FILLED);
    string text = format("[%d/%d] %s  (n: next  p: prev  s: save  ESC: quit)", (int)index + 1, (int)total, r.image.c_str());
    putText(view, text, Point(10, view.rows - 10), FONT_HERSHEY_SIMPLEX, 0.5, Scalar(255, 255, 255), 1, LINE_AA);
    return view;
}

int main(int argc, char** argv)
{
#ifdef _WIN32
    SetConsoleOutputCP(CP_UTF8);   // 한글 출력 (/utf-8 옵션과 함께)
#endif
    const string imageDir = argc > 1 ? argv[1] : "images";
    const string outDir = "results";
    fs::create_directories(outDir);

    // ------------------------------------------------------------ ① 검사기 준비 (제품마다 설정이 다른 객체)
    vector<unique_ptr<Inspector>> inspectors;
    auto add = [&inspectors](unique_ptr<Inspector> p) { Inspector* raw = p.get(); inspectors.push_back(std::move(p)); return raw; };

    Inspector* washers = add(make_unique<CountInspector>(13));    // 와셔 6 + 너트 4 + 볼트 3
    Inspector* coins = add(make_unique<CountInspector>(12));
    auto capsPtr = make_unique<ColorSortInspector>();
    capsPtr->expected = { {"red", 5}, {"yellow", 6}, {"green", 4}, {"blue", 3}, {"white", 2} };
    Inspector* caps = add(std::move(capsPtr));
    Inspector* metal = add(make_unique<DefectInspector>(imread(imageDir + "/metal_ok.png", IMREAD_GRAYSCALE), "metal_ok.png"));
    auto pcbPtr = make_unique<DefectInspector>(imread(imageDir + "/pcb_golden.png"), "pcb_golden.png");
    pcbPtr->diffThreshold = 30;                                   // PCB 는 대비가 커서 30
    pcbPtr->minArea = 50;
    Inspector* pcb = add(std::move(pcbPtr));

    vector<Job> jobs = {
        { "washers.png", washers },       { "coins_parts.png", coins },
        { "color_caps.png", caps },       { "metal_scratch.png", metal },
        { "metal_ok.png", metal },        { "pcb_board.png", pcb },
        { "pcb_golden.png", pcb },
    };

    // ------------------------------------------------------------ ② 일괄 검사
    vector<InspectionResult> results;
    ofstream csv(outDir + "/report.csv", ios::binary);
    csv << "\xEF\xBB\xBF";                                        // UTF-8 BOM: Excel 이 한글을 바로 읽는다
    csv << "no,image,inspector,judge,values,defects,ms\n";
    int no = 0, okCount = 0, ngCount = 0, errCount = 0;

    cout << "no  image              판정  측정값" << endl;
    for (const Job& job : jobs)
    {
        no++;
        Mat img = imread(imageDir + "/" + job.file, IMREAD_UNCHANGED);
        if (img.empty())
        {
            cout << format("%-3d %-18s ERR  ", no, job.file.c_str()) << "이미지를 읽을 수 없습니다 (" << imageDir << ")" << endl;
            csv << no << "," << csvCell(job.file) << "," << csvCell(job.inspector->name()) << ",ERROR,,,\n";
            errCount++;
            continue;
        }

        InspectionResult r;
        TickMeter tm;
        try
        {
            tm.start();
            r = job.inspector->inspect(img);                      // 가상 함수 → 검사기 종류에 맞는 inspect
            tm.stop();
        }
        catch (const exception& e)                                // invalid_argument · cv::Exception 모두
        {
            cout << format("%-3d %-18s ERR  ", no, job.file.c_str()) << e.what() << endl;
            csv << no << "," << csvCell(job.file) << "," << csvCell(job.inspector->name()) << ",ERROR,"
                << csvCell(e.what()) << ",,\n";
            errCount++;
            continue;
        }
        r.image = job.file;
        r.ms = tm.getTimeMilli();
        (r.ok ? okCount : ngCount)++;

        cout << format("%-3d %-18s %-4s ", no, job.file.c_str(), r.ok ? "OK" : "NG") << r.valuesText()
             << "  (" << r.inspector << format(", %.1f ms)", r.ms) << endl;
        csv << no << "," << csvCell(r.image) << "," << csvCell(r.inspector) << "," << (r.ok ? "OK" : "NG") << ","
            << csvCell(r.valuesText()) << "," << r.defects.size() << "," << format("%.1f", r.ms) << "\n";
        if (!r.ok)
            imwrite(outDir + "/NG_" + job.file, r.overlay);        // 불량은 근거 이미지를 반드시 남긴다
        results.push_back(r);
    }
    csv.close();

    int total = okCount + ngCount;
    cout << "----------------------------------------------------------" << endl;
    cout << format("총 %d건 · OK %d · NG %d · 오류 %d", total, okCount, ngCount, errCount);
    if (total > 0) cout << format(" · 불량률 %.1f%%", 100.0 * ngCount / total);
    cout << endl << "리포트: " << outDir << "/report.csv, NG 이미지: " << outDir << "/NG_*.png" << endl;
    if (results.empty()) { cout << "보여 줄 결과가 없습니다. images 폴더를 확인하세요." << endl; return -1; }

    // ------------------------------------------------------------ ③ 결과 보기 (키로 넘기기)
    cout << endl << "[키] n/SPACE 다음 · p 이전 · s 저장 · ESC/q 종료" << endl;
    const string win = "Ch17 Inspection";
    namedWindow(win, WINDOW_AUTOSIZE);
    size_t i = 0;
    bool changed = true;
    int saved = 0;
    while (true)
    {
        if (changed)
        {
            imshow(win, withFooter(results[i], i, results.size()));
            cout << "  " << results[i].summary() << endl;
            changed = false;
        }
        int key = waitKey(50);
        if (key < 0)
        {
            // 창의 X 버튼으로 닫으면 종료
            if (getWindowProperty(win, WND_PROP_VISIBLE) < 1) break;
            continue;
        }
        key &= 0xFF;
        if (key == 27 || key == 'q') break;
        if (key == 'n' || key == ' ') { i = (i + 1) % results.size(); changed = true; }
        else if (key == 'p') { i = (i + results.size() - 1) % results.size(); changed = true; }
        else if (key == 's')
        {
            string path = outDir + "/overlay_" + results[i].image;
            if (imwrite(path, results[i].overlay)) { saved++; cout << "  저장: " << path << endl; }
            else cout << "  저장 실패: " << path << endl;
        }
    }
    destroyAllWindows();
    cout << "종료 (저장 " << saved << "장)" << endl;
    return 0;
}
