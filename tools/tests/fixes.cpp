// 고친 부분 점검: cv::Exception 필드 · calcHist 모양 · getWindowProperty
#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    try { Mat e, g; cvtColor(e, g, COLOR_BGR2GRAY); }
    catch (const cv::Exception& ex) { cout << "code=" << ex.code << " func=" << ex.func << " err=" << ex.err << " line>0=" << (ex.line > 0) << endl; }
    Mat gray = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat hist; int ch = 0, hs = 256; float r[] = { 0, 256 }; const float* rs[] = { r };
    calcHist(&gray, 1, &ch, Mat(), hist, 1, &hs, rs);
    Point mx; minMaxLoc(hist, nullptr, nullptr, nullptr, &mx);
    cout << "hist " << hist.size() << " peak y=" << mx.y << " at(10,0)=" << hist.at<float>(10, 0) << endl;
    calcHist(&gray, 1, &ch, Mat(), hist, 1, &hs, rs, true, true);
    cout << "accumulate " << hist.size() << " " << sum(hist)[0] << endl;
    cout << "visible " << getWindowProperty("w", WND_PROP_VISIBLE) << endl;
    return 0;
}
