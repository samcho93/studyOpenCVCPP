// Inspector.h — 모든 검사기의 공통 인터페이스 · 검사 결과 · 도우미 함수 (17차시)
#pragma once
#include <opencv2/opencv.hpp>
#include <string>
#include <vector>
#include <stdexcept>

// 측정값 한 줄: 이름 + 값 (예: count = 11, maxDiff = 38)
struct Measurement
{
    std::string name;
    double value;
};

// 검사 한 번의 결과: 판정 · 측정값 · 불량 위치 · 근거(오버레이) 이미지
struct InspectionResult
{
    std::string inspector;              // 검사기 이름
    std::string image;                  // 이미지 파일 이름
    bool ok = true;                     // 판정 (OK / NG)
    std::vector<Measurement> values;    // 측정값들
    std::vector<cv::Rect> defects;      // 불량(의심) 위치
    cv::Mat overlay;                    // 근거를 그린 이미지 (항상 3채널 BGR)
    double ms = 0;                      // 처리 시간 (main 이 채운다)

    std::string summary() const;        // "NG | 개수 세기 | washers.png | count=11 expected=13 | 불량 2곳"
    std::string valuesText() const;     // "count=11 expected=13"
};

// 모든 검사기의 공통 인터페이스 (추상 클래스)
//  - inspect 는 입력 이미지를 바꾸지 않고, 결과 오버레이는 새 Mat 으로 만든다.
//  - 사용 방법이 잘못되면(골든과 크기가 다름 등) std::invalid_argument 를 던진다.
class Inspector
{
public:
    virtual ~Inspector() = default;
    virtual std::string name() const = 0;
    virtual InspectionResult inspect(const cv::Mat& img) = 0;
};

// 검사기들이 함께 쓰는 도우미
cv::Mat toGray(const cv::Mat& src);          // 1채널 복사본
cv::Mat toBgr(const cv::Mat& src);           // 3채널 복사본
void putLabel(cv::Mat& img, const std::string& text, cv::Point org, cv::Scalar color, double scale = 0.6);
void putJudge(cv::Mat& img, bool ok);        // 맨 위 OK(초록) / NG(빨강) 띠
