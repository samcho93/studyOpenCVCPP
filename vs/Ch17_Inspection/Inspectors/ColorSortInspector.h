// ColorSortInspector.h — 색 분류 검사기 (병뚜껑 색별 개수)
#pragma once
#include "Inspector.h"
#include <map>

// 색 하나의 정의 (데이터): 이름 · HSV 범위 · (빨강처럼 H 가 0/179 에서 끊기면) 두 번째 범위 · 그릴 색
struct ColorSpec
{
    std::string name;
    cv::Scalar lo, hi;
    cv::Scalar lo2, hi2;        // 두 번째 범위 (없으면 hi2[0] < 0)
    cv::Scalar draw;
};

// 흐름: BGR → HSV → 색마다 inRange(빨강은 두 범위 OR) → 열기 · 닫기 → 윤곽선 → 면적 필터 → 색별 개수
//  - OpenCV HSV: H 0~179, S 0~255, V 0~255. 흰색은 H 가 의미 없어 "S 낮고 V 높음" 으로 판정
class ColorSortInspector : public Inspector
{
public:
    std::vector<ColorSpec> specs;              // 색 목록 (생성자에서 color_caps 기준으로 채움)
    std::map<std::string, int> expected;       // 색별 기대 개수 (비어 있으면 판정 안 함)
    double minArea = 400;

    ColorSortInspector();

    std::string name() const override { return "색 분류"; }
    InspectionResult inspect(const cv::Mat& img) override;
};
