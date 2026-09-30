// ColorSortInspector.cpp
#include "ColorSortInspector.h"
using namespace cv;

ColorSortInspector::ColorSortInspector()
{
    // color_caps.png 의 5색 기준 — 범위는 실제 픽셀 값(HSV)을 읽어서 정했다 (17차시 2교시)
    specs = {
        { "red",    Scalar( 0, 90,  60), Scalar(  8, 255, 255), Scalar(170, 90, 60), Scalar(179, 255, 255), Scalar(  0,   0, 255) },
        { "yellow", Scalar(18, 90,  60), Scalar( 35, 255, 255), Scalar(), Scalar(-1, 0, 0, 0),                Scalar(  0, 255, 255) },
        { "green",  Scalar(40, 70,  50), Scalar( 85, 255, 255), Scalar(), Scalar(-1, 0, 0, 0),                Scalar(  0, 255,   0) },
        { "blue",   Scalar(95, 90,  50), Scalar(130, 255, 255), Scalar(), Scalar(-1, 0, 0, 0),                Scalar(255, 144,  30) },
        { "white",  Scalar( 0,  0, 170), Scalar(179,  60, 255), Scalar(), Scalar(-1, 0, 0, 0),                Scalar(255, 255, 255) },
    };
}

InspectionResult ColorSortInspector::inspect(const Mat& img)
{
    if (img.empty())
        throw std::invalid_argument("빈 이미지입니다");
    if (img.channels() == 1)
        throw std::invalid_argument("색 분류에는 컬러 이미지가 필요합니다");

    Mat bgr = toBgr(img), hsv;
    cvtColor(bgr, hsv, COLOR_BGR2HSV);
    Mat kernel = getStructuringElement(MORPH_ELLIPSE, Size(5, 5));

    InspectionResult r;
    r.inspector = name();
    r.overlay = bgr.clone();
    int total = 0;
    for (const ColorSpec& spec : specs)
    {
        Mat mask, mask2;
        inRange(hsv, spec.lo, spec.hi, mask);
        if (spec.hi2[0] >= 0)                              // 두 번째 범위가 있으면 OR
        {
            inRange(hsv, spec.lo2, spec.hi2, mask2);
            mask |= mask2;
        }
        morphologyEx(mask, mask, MORPH_OPEN, kernel);      // 하이라이트 · 경계 잡점 제거
        morphologyEx(mask, mask, MORPH_CLOSE, kernel);     // 톱니 무늬 구멍 메우기

        std::vector<std::vector<Point>> contours;
        findContours(mask, contours, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
        int count = 0;
        for (const auto& c : contours)
        {
            if (contourArea(c) < minArea) continue;
            count++;
            Point2f center;
            float radius;
            minEnclosingCircle(c, center, radius);
            circle(r.overlay, center, (int)radius, spec.draw, 2);
            putLabel(r.overlay, spec.name.substr(0, 1), Point(center) + Point(-5, 5), spec.draw, 0.5);
        }
        total += count;
        r.values.push_back({ spec.name, (double)count });

        auto it = expected.find(spec.name);
        if (it != expected.end() && it->second != count)
        {
            r.ok = false;                                  // 기대와 다른 색이 하나라도 있으면 NG
        }
    }
    r.values.push_back({ "total", (double)total });
    putJudge(r.overlay, r.ok);
    return r;
}
