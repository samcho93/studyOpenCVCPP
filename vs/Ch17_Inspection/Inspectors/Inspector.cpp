// Inspector.cpp — InspectionResult 와 도우미 함수의 구현
#include "Inspector.h"
using namespace cv;

std::string InspectionResult::valuesText() const
{
    std::string s;
    for (const Measurement& m : values)
        s += (s.empty() ? "" : " ") + m.name + "=" + format("%g", m.value);
    return s;
}

std::string InspectionResult::summary() const
{
    std::string s = std::string(ok ? "OK" : "NG") + " | " + inspector + " | " + image + " | " + valuesText();
    if (!defects.empty())
        s += " | 불량 " + std::to_string(defects.size()) + "곳";
    return s;
}

Mat toGray(const Mat& src)
{
    if (src.channels() == 1) return src.clone();
    Mat gray;
    cvtColor(src, gray, src.channels() == 4 ? COLOR_BGRA2GRAY : COLOR_BGR2GRAY);
    return gray;
}

Mat toBgr(const Mat& src)
{
    if (src.channels() == 3) return src.clone();
    Mat bgr;
    cvtColor(src, bgr, src.channels() == 4 ? COLOR_BGRA2BGR : COLOR_GRAY2BGR);
    return bgr;
}

// 검은 테두리 + 색 글자 → 밝은 배경에서도 어두운 배경에서도 보인다
void putLabel(Mat& img, const std::string& text, Point org, Scalar color, double scale)
{
    putText(img, text, org, FONT_HERSHEY_SIMPLEX, scale, Scalar(0, 0, 0), 3, LINE_AA);
    putText(img, text, org, FONT_HERSHEY_SIMPLEX, scale, color, 1, LINE_AA);
}

// putText 는 한글을 그리지 못하므로 띠에는 영문 OK / NG 만 쓴다 (자세한 내용은 콘솔 · CSV 에 한글로)
void putJudge(Mat& img, bool ok)
{
    Scalar color = ok ? Scalar(0, 180, 0) : Scalar(0, 0, 220);
    rectangle(img, Rect(0, 0, img.cols, 44), color, FILLED);
    putText(img, ok ? "OK" : "NG", Point(12, 34), FONT_HERSHEY_DUPLEX, 1.1, Scalar(255, 255, 255), 2, LINE_AA);
}
