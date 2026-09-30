// OpenCV 5.0 시작 프로젝트: 설치 · 설정 확인
//  - 솔루션 폴더(vs/)에 images/ 폴더를 복사해 두세요 (강좌 저장소의 assets/images).
//  - 작업 폴더는 OpenCV5.props 에서 솔루션 폴더로 설정되어 있습니다.
#include <opencv2/opencv.hpp>
#include <iostream>
#ifdef _WIN32
#include <windows.h>
#endif
using namespace cv;
using namespace std;

int main()
{
#ifdef _WIN32
    SetConsoleOutputCP(CP_UTF8);   // 한글 출력 (/utf-8 옵션과 함께)
#endif
    cout << "OpenCV 버전: " << CV_VERSION << endl;
    cout << "C++ 표준: " << __cplusplus << endl;

    Mat img = imread("images/sample_color.png");
    if (img.empty())
    {
        cout << "images/sample_color.png 를 읽지 못했습니다. 작업 폴더에 images/ 를 복사했는지 확인하세요." << endl;
        return -1;
    }
    cout << "크기: " << img.size() << ", 형식: " << typeToString(img.type()) << endl;

    Mat gray, edges;
    cvtColor(img, gray, COLOR_BGR2GRAY);
    Canny(gray, edges, 50, 150);

    imshow("input", img);
    imshow("edges", edges);
    cout << "아무 키나 누르면 끝납니다." << endl;
    waitKey(0);
    destroyAllWindows();
    return 0;
}
