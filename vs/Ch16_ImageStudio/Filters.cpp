#include "Filter.h"
#include <stdexcept>
using namespace cv;

Mat toGray(const Mat& src)
{
    if (src.channels() == 1) return src.clone();
    Mat g;
    cvtColor(src, g, COLOR_BGR2GRAY);
    return g;
}

int oddKernel(int k)
{
    if (k < 3) k = 3;
    return (k % 2 == 1) ? k : k + 1;
}

Mat GrayFilter::apply(const Mat& src) const { return toGray(src); }

Mat BlurFilter::apply(const Mat& src) const
{
    Mat dst;
    GaussianBlur(src, dst, Size(k_, k_), 0);
    return dst;
}

Mat MedianFilter::apply(const Mat& src) const
{
    Mat dst;
    medianBlur(src, dst, k_);
    return dst;
}

Mat ThresholdFilter::apply(const Mat& src) const
{
    Mat dst;
    if (t_ < 0) threshold(toGray(src), dst, 0, 255, THRESH_BINARY | THRESH_OTSU);
    else        threshold(toGray(src), dst, t_, 255, THRESH_BINARY);
    return dst;
}

Mat CannyFilter::apply(const Mat& src) const
{
    Mat dst;
    Canny(toGray(src), dst, lo_, hi_);
    return dst;
}

Mat SharpenFilter::apply(const Mat& src) const     // 원본 + amount × (원본 − 흐린 것)
{
    Mat blurred, dst;
    GaussianBlur(src, blurred, Size(0, 0), 3);
    addWeighted(src, 1.0 + amount_, blurred, -amount_, 0, dst);
    return dst;
}

Mat BrightnessContrastFilter::apply(const Mat& src) const
{
    Mat dst;
    src.convertTo(dst, -1, alpha_, beta_);        // 포화 연산 (0~255 로 잘림)
    return dst;
}

MorphFilter::MorphFilter(const std::string& op, int k) : opName_(op), k_(oddKernel(k))
{
    if (op == "erode") op_ = MORPH_ERODE;
    else if (op == "dilate") op_ = MORPH_DILATE;
    else if (op == "open") op_ = MORPH_OPEN;
    else if (op == "close") op_ = MORPH_CLOSE;
    else throw std::invalid_argument("morph: erode · dilate · open · close 중 하나");
}

Mat MorphFilter::apply(const Mat& src) const
{
    Mat dst;
    morphologyEx(src, dst, op_, getStructuringElement(MORPH_ELLIPSE, Size(k_, k_)));
    return dst;
}

Mat InvertFilter::apply(const Mat& src) const
{
    Mat dst;
    bitwise_not(src, dst);
    return dst;
}

// ---- 팩토리 ----
// 인수 읽기: 없으면 기본값, 숫자가 아니면 예외
static int readInt(std::istringstream& in, int def, const std::string& cmd)
{
    int v;
    if (in >> v) return v;
    if (in.eof()) return def;
    throw std::invalid_argument(cmd + ": 숫자가 필요합니다");
}

static double readDouble(std::istringstream& in, double def, const std::string& cmd)
{
    double v;
    if (in >> v) return v;
    if (in.eof()) return def;
    throw std::invalid_argument(cmd + ": 숫자가 필요합니다");
}

std::map<std::string, FilterMaker> makeFactory()
{
    std::map<std::string, FilterMaker> f;
    f["gray"]   = [](std::istringstream&) { return std::make_unique<GrayFilter>(); };
    f["blur"]   = [](std::istringstream& in) { return std::make_unique<BlurFilter>(readInt(in, 5, "blur")); };
    f["median"] = [](std::istringstream& in) { return std::make_unique<MedianFilter>(readInt(in, 5, "median")); };
    f["thresh"] = [](std::istringstream& in) -> std::unique_ptr<Filter> {
        std::string arg = "otsu";
        in >> arg;
        if (arg == "otsu") return std::make_unique<ThresholdFilter>(-1);
        std::istringstream num(arg);
        int t = readInt(num, -1, "thresh");
        if (t < 0 || t > 255) throw std::out_of_range("thresh: 0~255 또는 otsu");
        return std::make_unique<ThresholdFilter>(t);
    };
    f["canny"] = [](std::istringstream& in) {
        int lo = readInt(in, 50, "canny");
        int hi = readInt(in, 150, "canny");
        if (lo >= hi) throw std::invalid_argument("canny: 낮은 값 < 높은 값 이어야 합니다");
        return std::make_unique<CannyFilter>(lo, hi);
    };
    f["sharpen"] = [](std::istringstream& in) { return std::make_unique<SharpenFilter>(readDouble(in, 1.0, "sharpen")); };
    f["bc"] = [](std::istringstream& in) {
        double alpha = readDouble(in, 1.2, "bc");
        int beta = readInt(in, 10, "bc");
        return std::make_unique<BrightnessContrastFilter>(alpha, beta);
    };
    f["morph"] = [](std::istringstream& in) {
        std::string op = "open";
        in >> op;
        return std::make_unique<MorphFilter>(op, readInt(in, 5, "morph"));
    };
    f["invert"] = [](std::istringstream&) { return std::make_unique<InvertFilter>(); };
    return f;
}
