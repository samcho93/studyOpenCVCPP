// DefectInspector.h — 결함 검사기 (골든 이미지 비교)
#pragma once
#include "Inspector.h"

// 흐름: |골든 − 검사| → 블러 → 임계값 → 닫기 → 윤곽선 → 면적 필터 → 결함 상자
//  - 골든(양품 기준) 영상은 "검사기의 설정" 이므로 생성자에서 받는다.
//    그래서 inspect(img) 모양이 다른 검사기와 똑같다 (C# 판의 NeedsGolden 이 필요 없다).
//  - 전제: 검사 영상과 골든이 픽셀 단위로 정렬되어 있어야 한다 (같은 카메라 · 같은 위치).
class DefectInspector : public Inspector
{
public:
    double diffThreshold = 10;   // 차이가 이보다 크면 결함 후보 (낮출수록 민감 → 과검 위험)
    int closeSize = 21;          // 끊어진 긁힘을 이어 붙이는 닫기 커널 (홀수)
    double minArea = 80;         // 이보다 작은 후보는 잡음

    explicit DefectInspector(const cv::Mat& golden, std::string goldenName = "");

    std::string name() const override { return "결함 검사"; }
    InspectionResult inspect(const cv::Mat& img) override;

    const std::string& goldenName() const { return goldenName_; }

private:
    cv::Mat golden_;             // 흑백으로 바꿔 한 번만 저장
    std::string goldenName_;
};
