// CountInspector.cpp
#include "CountInspector.h"
#include <algorithm>
using namespace cv;

InspectionResult CountInspector::inspect(const Mat& img)
{
    if (img.empty())
        throw std::invalid_argument("빈 이미지입니다");

    // 1) 흑백 + 블러 — 잡음이 윤곽선 개수를 늘리는 것을 막는다
    Mat gray = toGray(img), bin;
    GaussianBlur(gray, gray, Size(5, 5), 0);

    // 2) Otsu 이진화 + 극성 자동 판단 (흰색이 절반 이상이면 그것은 배경 → 반전)
    threshold(gray, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    if (countNonZero(bin) > (int)(bin.total() / 2))
        bitwise_not(bin, bin);

    // 3) 열기로 작은 점 잡음 제거
    morphologyEx(bin, bin, MORPH_OPEN, getStructuringElement(MORPH_ELLIPSE, Size(3, 3)));

    // 4) 바깥 윤곽선 → 면적 필터 (구멍은 세지 않음)
    std::vector<std::vector<Point>> contours;
    findContours(bin, contours, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    struct Blob { Rect box; double area; };
    std::vector<Blob> blobs;
    for (const auto& c : contours)
    {
        double a = contourArea(c);
        if (a >= minArea) blobs.push_back({ boundingRect(c), a });
    }

    // 번호 순서: 위 → 아래(60 px 단위 줄), 같은 줄은 왼쪽 → 오른쪽
    std::sort(blobs.begin(), blobs.end(), [](const Blob& a, const Blob& b) {
        int ra = (a.box.y + a.box.height / 2) / 60, rb = (b.box.y + b.box.height / 2) / 60;
        if (ra != rb) return ra < rb;
        return a.box.x < b.box.x;
    });

    // 5) 붙음 의심: 면적이 중앙값의 mergedRatio 배 이상
    double median = 0;
    if (!blobs.empty())
    {
        std::vector<double> areas;
        for (const Blob& b : blobs) areas.push_back(b.area);
        std::sort(areas.begin(), areas.end());
        median = areas[areas.size() / 2];
    }

    InspectionResult r;
    r.inspector = name();
    r.overlay = toBgr(img);
    for (size_t i = 0; i < blobs.size(); i++)
    {
        bool merged = blobs[i].area >= mergedRatio * median;
        if (merged) r.defects.push_back(blobs[i].box);
        Scalar color = merged ? Scalar(0, 0, 255) : Scalar(0, 220, 0);
        rectangle(r.overlay, blobs[i].box, color, 2);
        putLabel(r.overlay, std::to_string(i + 1), blobs[i].box.tl() + Point(0, -6), color);
    }

    int found = (int)blobs.size();
    r.ok = (expected <= 0 || found == expected) && r.defects.empty();
    r.values.push_back({ "count", (double)found });
    r.values.push_back({ "expected", (double)expected });
    putJudge(r.overlay, r.ok);
    return r;
}
