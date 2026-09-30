// CountInspector.h — 개수 세기 검사기
#pragma once
#include "Inspector.h"

// 흐름: 흑백 → 블러 → Otsu(극성 자동 판단) → 열기 → 바깥 윤곽선 → 면적 필터 → 번호 · 판정
//  - expected > 0 이면 검출 개수와 비교해 판정
//  - 면적이 중앙값의 mergedRatio 배 이상인 덩어리는 "붙음 의심" 으로 defects 에 넣고 NG
class CountInspector : public Inspector
{
public:
    int expected = 0;           // 기대 개수 (0 이면 개수 판정 안 함)
    double minArea = 300;       // 이보다 작은 덩어리는 잡음
    double mergedRatio = 1.8;   // 붙음 의심 기준 (중앙값 대비)

    CountInspector() = default;
    explicit CountInspector(int expectedCount) : expected(expectedCount) {}

    std::string name() const override { return "개수 세기"; }
    InspectionResult inspect(const cv::Mat& img) override;
};
