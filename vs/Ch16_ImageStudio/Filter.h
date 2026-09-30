#pragma once
#include <opencv2/opencv.hpp>
#include <functional>
#include <map>
#include <memory>
#include <sstream>
#include <string>

// 모든 필터의 약속: ① src 는 바꾸지 않는다 ② 항상 새 Mat 을 돌려준다 ③ 1 · 3채널 모두 받는다
class Filter
{
public:
    virtual ~Filter() = default;
    virtual cv::Mat apply(const cv::Mat& src) const = 0;
    virtual std::string name() const = 0;
};

cv::Mat toGray(const cv::Mat& src);      // 3채널 → 1채널 (1채널이면 복사본)
int oddKernel(int k);                    // 커널 크기를 3 이상 홀수로

class GrayFilter : public Filter
{
public:
    cv::Mat apply(const cv::Mat& src) const override;
    std::string name() const override { return "Gray"; }
};

class BlurFilter : public Filter
{
public:
    explicit BlurFilter(int k) : k_(oddKernel(k)) {}
    cv::Mat apply(const cv::Mat& src) const override;
    std::string name() const override { return "Blur(" + std::to_string(k_) + ")"; }
private:
    int k_;
};

class MedianFilter : public Filter
{
public:
    explicit MedianFilter(int k) : k_(oddKernel(k)) {}
    cv::Mat apply(const cv::Mat& src) const override;
    std::string name() const override { return "Median(" + std::to_string(k_) + ")"; }
private:
    int k_;
};

class ThresholdFilter : public Filter
{
public:
    explicit ThresholdFilter(int t) : t_(t) {}          // t < 0 이면 Otsu 자동
    cv::Mat apply(const cv::Mat& src) const override;
    std::string name() const override { return t_ < 0 ? "Thresh(otsu)" : "Thresh(" + std::to_string(t_) + ")"; }
private:
    int t_;
};

class CannyFilter : public Filter
{
public:
    CannyFilter(int lo, int hi) : lo_(lo), hi_(hi) {}
    cv::Mat apply(const cv::Mat& src) const override;
    std::string name() const override { return "Canny(" + std::to_string(lo_) + "," + std::to_string(hi_) + ")"; }
private:
    int lo_, hi_;
};

class SharpenFilter : public Filter                    // 언샵 마스크
{
public:
    explicit SharpenFilter(double amount) : amount_(amount) {}
    cv::Mat apply(const cv::Mat& src) const override;
    std::string name() const override { return cv::format("Sharpen(%.1f)", amount_); }
private:
    double amount_;
};

class BrightnessContrastFilter : public Filter        // dst = alpha * src + beta
{
public:
    BrightnessContrastFilter(double alpha, int beta) : alpha_(alpha), beta_(beta) {}
    cv::Mat apply(const cv::Mat& src) const override;
    std::string name() const override { return cv::format("BC(%.1f,%d)", alpha_, beta_); }
private:
    double alpha_;
    int beta_;
};

class MorphFilter : public Filter
{
public:
    MorphFilter(const std::string& op, int k);          // op: erode · dilate · open · close
    cv::Mat apply(const cv::Mat& src) const override;
    std::string name() const override { return opName_ + "(" + std::to_string(k_) + ")"; }
private:
    std::string opName_;
    int op_;
    int k_;
};

class InvertFilter : public Filter
{
public:
    cv::Mat apply(const cv::Mat& src) const override;
    std::string name() const override { return "Invert"; }
};

// 팩토리: 명령 단어 → "인수를 읽어 필터를 만드는 함수"
using FilterMaker = std::function<std::unique_ptr<Filter>(std::istringstream&)>;
std::map<std::string, FilterMaker> makeFactory();
