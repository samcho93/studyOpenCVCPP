// DefectInspector.cpp
#include "DefectInspector.h"
#include <algorithm>
#include <stdexcept>
using namespace cv;

DefectInspector::DefectInspector(const Mat& golden, std::string goldenName)
    : golden_(golden.empty() ? Mat() : toGray(golden)), goldenName_(std::move(goldenName))
{
}

InspectionResult DefectInspector::inspect(const Mat& img)
{
    if (golden_.empty())
        throw std::invalid_argument("골든(기준) 이미지가 없습니다");
    if (img.empty())
        throw std::invalid_argument("빈 이미지입니다");
    Mat gray = toGray(img);
    if (gray.size() != golden_.size())
        throw std::invalid_argument(format("골든과 크기가 다릅니다 (검사 %dx%d, 골든 %dx%d)",
                                           gray.cols, gray.rows, golden_.cols, golden_.rows));

    // 1) 차영상 → 블러(잡음 평탄화) → 임계값 → 닫기(조각 잇기)
    Mat diff, bin;
    absdiff(gray, golden_, diff);
    GaussianBlur(diff, diff, Size(5, 5), 0);
    threshold(diff, bin, diffThreshold, 255, THRESH_BINARY);
    int k = std::max(1, closeSize | 1);                    // 홀수로
    morphologyEx(bin, bin, MORPH_CLOSE, getStructuringElement(MORPH_ELLIPSE, Size(k, k)));

    // 2) 결함 영역
    std::vector<std::vector<Point>> contours;
    findContours(bin, contours, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);

    InspectionResult r;
    r.inspector = name();
    for (const auto& c : contours)
        if (contourArea(c) >= minArea) r.defects.push_back(boundingRect(c));
    std::sort(r.defects.begin(), r.defects.end(), [](const Rect& a, const Rect& b) { return a.x < b.x; });

    double maxDiff;
    minMaxLoc(diff, nullptr, &maxDiff);
    r.values.push_back({ "maxDiff", maxDiff });
    r.values.push_back({ "defects", (double)r.defects.size() });
    r.ok = r.defects.empty();

    // 3) 오버레이: 결함마다 빨간 사각형(6 px 여유) + D1, D2 …
    r.overlay = toBgr(img);
    for (size_t i = 0; i < r.defects.size(); i++)
    {
        Rect box = r.defects[i] + Size(12, 12) - Point(6, 6);
        rectangle(r.overlay, box, Scalar(0, 0, 255), 2);
        putLabel(r.overlay, "D" + std::to_string(i + 1), box.tl() + Point(0, -6), Scalar(0, 0, 255));
    }
    putJudge(r.overlay, r.ok);
    return r;
}
