/* studyOpenCVCPP — OpenCV 5.0 C++ API 구현 (브라우저 실습용)
 *  - Mat 메모리 · 픽셀 연산(copyTo / convertTo / setTo ...)은 C++ 로 직접 구현
 *  - 알고리즘은 WebAssembly 가져오기(import module "cv")를 통해 OpenCV.js 5.0 으로 계산 (js/cv-bridge.js)
 *  이 파일은 한 번만 컴파일해 두고(runtime/cvshim.o) 모든 프로그램에 링크한다.
 */
#include "opencv2/cvshim.hpp"
#include <cstdarg>
#include <ctime>
#include <map>

namespace cv {
namespace detail {

extern "C" {
__attribute__((import_module("cv"), import_name("call"))) int cvb_call(const char* name, int nameLen, const int32_t* args, int nwords);
__attribute__((import_module("cv"), import_name("outinfo"))) int cvb_outinfo(int slot, int sub, int32_t* info);
__attribute__((import_module("cv"), import_name("outcopy"))) void cvb_outcopy(int slot, int sub, void* dst, int step);
__attribute__((import_module("cv"), import_name("ret"))) double cvb_ret(int i);
__attribute__((import_module("cv"), import_name("nret"))) int cvb_nret();
__attribute__((import_module("cv"), import_name("retstr"))) int cvb_retstr(char* buf, int cap);
__attribute__((import_module("cv"), import_name("errmsg"))) int cvb_errmsg(char* buf, int cap);
}

enum Tag { T_INT = 1, T_DBL = 2, T_STR = 3, T_MAT = 4, T_OUT = 5, T_NONE = 6, T_LIST = 7, T_SCALAR = 8, T_DBLS = 9, T_INTS = 10, T_KP = 11, T_DM = 12 };

/** OpenCV.js 호출 하나: 인수를 32비트 단어 배열로 만들어 JS 에 넘기고, 결과를 C++ 쪽 Mat / vector 에 채운다 */
struct Call {
  const char* name;
  std::vector<int32_t> w;
  std::vector<const _OutputArray*> outs;
  std::vector<std::string> keep;
  explicit Call(const char* n) : name(n) { w.reserve(64); }
  Call& i(int v) { w.push_back(T_INT); w.push_back(v); return *this; }
  Call& b(bool v) { return i(v ? 1 : 0); }
  void pushd(double v) { int32_t t[2]; std::memcpy(t, &v, 8); w.push_back(t[0]); w.push_back(t[1]); }
  Call& d(double v) { w.push_back(T_DBL); pushd(v); return *this; }
  Call& s(const std::string& str) { keep.push_back(str); w.push_back(T_STR); w.push_back(-1 - (int)(keep.size() - 1)); w.push_back((int)str.size()); return *this; }
  Call& dbls(std::initializer_list<double> l) { w.push_back(T_DBLS); w.push_back((int)l.size()); for (double v : l) pushd(v); return *this; }
  Call& dblv(const double* p, int n) { w.push_back(T_DBLS); w.push_back(n); for (int k = 0; k < n; k++) pushd(p[k]); return *this; }
  Call& ints(const int* p, int n) { w.push_back(T_INTS); w.push_back(n); for (int k = 0; k < n; k++) w.push_back(p[k]); return *this; }
  Call& pt(Point2f p) { return dbls({ (double)p.x, (double)p.y }); }
  Call& pti(Point p) { return dbls({ (double)p.x, (double)p.y }); }
  Call& sz(Size s) { return dbls({ (double)s.width, (double)s.height }); }
  Call& rc(Rect r) { return dbls({ (double)r.x, (double)r.y, (double)r.width, (double)r.height }); }
  Call& sc(const Scalar& s) { return dbls({ s[0], s[1], s[2], s[3] }); }
  Call& tc(const TermCriteria& t) { return dbls({ (double)t.type, (double)t.maxCount, t.epsilon }); }
  Call& rr(const RotatedRect& r) { return dbls({ (double)r.center.x, (double)r.center.y, (double)r.size.width, (double)r.size.height, (double)r.angle }); }
  void matw(const Mat& m) {
    w.push_back(m.type());
    w.push_back(m.empty() ? 0 : m.rows);
    w.push_back(m.empty() ? 0 : m.cols);
    w.push_back((int)m.step.buf[0]);
    w.push_back((int)(intptr_t)m.data);
  }
  Call& m(const Mat& mm) { w.push_back(T_MAT); matw(mm); return *this; }
  Call& in(InputArray a) {
    switch (a.kind) {
      case _InputArray::MAT: return m(*a.mptr);
      case _InputArray::MATX: return m(a.tmp);
      case _InputArray::SCALAR: w.push_back(T_SCALAR); for (int k = 0; k < 4; k++) pushd(a.sc[k]); return *this;
      case _InputArray::VECVEC:
      case _InputArray::MATVEC: w.push_back(T_LIST); w.push_back((int)a.list.size()); for (auto& e : a.list) matw(e); return *this;
      case _InputArray::KPVEC: w.push_back(T_KP); w.push_back(a.vcount); w.push_back((int)(intptr_t)(a.vcount ? ((const std::vector<KeyPoint>*)a.obj)->data() : nullptr)); return *this;
      case _InputArray::DMVEC: w.push_back(T_DM); w.push_back(a.vcount); w.push_back((int)(intptr_t)(a.vcount ? ((const std::vector<DMatch>*)a.obj)->data() : nullptr)); return *this;
      default: w.push_back(T_NONE); return *this;
    }
  }
  Call& out(OutputArray o) {
    if (!o.needed()) { w.push_back(T_NONE); return *this; }
    w.push_back(T_OUT);
    w.push_back((int)outs.size());
    w.push_back(o.okind);
    int want = o.vtype;
    if (o.okind == _OutputArray::O_MAT && o.dst) want = o.vtype >= 0 ? o.vtype : -1;
    w.push_back(want);
    // 현재 출력 Mat 의 정보(in-place · 누적 연산용)
    if (o.okind == _OutputArray::O_MAT) matw(*(Mat*)o.dst); else { Mat e; matw(e); }
    outs.push_back(&o);
    return *this;
  }
  Call& run() {
    // 문자열은 keep 에 모은 뒤 포인터를 채운다 (vector 재할당 뒤에도 안전)
    std::vector<int32_t> ww = w;
    for (size_t k = 0; k < ww.size(); k++) {
      if (ww[k] == T_STR && k + 2 < ww.size() && ww[k + 1] < 0) { int idx = -1 - ww[k + 1]; ww[k + 1] = (int)(intptr_t)keep[idx].data(); k += 2; }
    }
    int r = cvb_call(name, (int)std::strlen(name), ww.data(), (int)ww.size());
    if (r < 0) {
      char buf[2048];
      int n = cvb_errmsg(buf, sizeof(buf) - 1);
      buf[n < 0 ? 0 : n] = 0;
      std::string msg(buf);
      int code = Error::StsError;
      size_t p = msg.find("(-");
      if (p != std::string::npos) code = std::atoi(msg.c_str() + p + 1);
      Exception e;
      e.msg = msg; e.code = code; e.err = msg; e.func = name; e.line = 0;
      throw e;
    }
    for (size_t k = 0; k < outs.size(); k++) fetch((int)k, *outs[k]);
    return *this;
  }
  static void copyInto(int slot, int sub, Mat& d) { if (!d.empty()) cvb_outcopy(slot, sub, d.data, (int)d.step.buf[0]); }
  void fetch(int slot, const _OutputArray& o) {
    int32_t info[8] = { 0 };
    int kind = cvb_outinfo(slot, -1, info);
    if (kind == 0) return;
    if (kind == 1) {
      int type = info[0], rows = info[1], cols = info[2];
      switch (o.okind) {
        case _OutputArray::O_MAT: {
          Mat& d = *(Mat*)o.dst;
          if (rows == 0 || cols == 0) { d.release(); return; }
          d.create(rows, cols, type);
          copyInto(slot, -1, d);
          return;
        }
        case _OutputArray::O_VEC:
        case _OutputArray::O_FIXED: {
          Mat t;
          if (rows && cols) { t.create(rows, cols, type); copyInto(slot, -1, t); }
          o.vassign(o.dst, t);
          return;
        }
        case _OutputArray::O_KP: {
          auto& v = *(std::vector<KeyPoint>*)o.dst;
          v.resize(rows);
          if (rows) cvb_outcopy(slot, -1, v.data(), (int)sizeof(KeyPoint));
          return;
        }
        case _OutputArray::O_DM: {
          auto& v = *(std::vector<DMatch>*)o.dst;
          v.resize(rows);
          if (rows) cvb_outcopy(slot, -1, v.data(), (int)sizeof(DMatch));
          return;
        }
        case _OutputArray::O_MATVEC: {
          auto& v = *(std::vector<Mat>*)o.dst;
          v.resize(1);
          v[0].create(rows, cols, type);
          copyInto(slot, -1, v[0]);
          return;
        }
        default: return;
      }
    }
    // 목록(윤곽선 · 채널 · knn 매칭)
    int count = info[0];
    std::vector<Mat> ms(count);
    if (o.okind == _OutputArray::O_DMVV) {
      auto& v = *(std::vector<std::vector<DMatch>>*)o.dst;
      v.resize(count);
      for (int k = 0; k < count; k++) {
        int32_t in2[8] = { 0 };
        cvb_outinfo(slot, k, in2);
        v[k].resize(in2[1]);
        if (in2[1]) cvb_outcopy(slot, k, v[k].data(), (int)sizeof(DMatch));
      }
      return;
    }
    for (int k = 0; k < count; k++) {
      int32_t in2[8] = { 0 };
      cvb_outinfo(slot, k, in2);
      if (in2[1] && in2[2]) { ms[k].create(in2[1], in2[2], in2[0]); copyInto(slot, k, ms[k]); }
    }
    o.assignList(ms);
  }
  double ret(int k = 0) const { return cvb_ret(k); }
  int nret() const { return cvb_nret(); }
  std::string retstr() const {
    std::vector<char> buf(1 << 16);
    int n = cvb_retstr(buf.data(), (int)buf.size() - 1);
    return std::string(buf.data(), n < 0 ? 0 : n);
  }
};

void note(const std::string& text) { Call c("note"); c.s(text).run(); }
void notSupported(const char* what) { Call c("notSupported"); c.s(what).run(); }

template<typename S, typename D> static void cvtRow(const uchar* s, uchar* d, int n, double alpha, double beta, bool scale) {
  const S* sp = (const S*)s; D* dp = (D*)d;
  if (!scale) for (int k = 0; k < n; k++) dp[k] = saturate_cast<D>(sp[k]);
  else for (int k = 0; k < n; k++) dp[k] = saturate_cast<D>(sp[k] * alpha + beta);
}
typedef void (*CvtFn)(const uchar*, uchar*, int, double, double, bool);
template<typename S> static CvtFn cvtFor(int ddepth) {
  switch (ddepth) {
    case CV_8U: return cvtRow<S, uchar>;
    case CV_8S: return cvtRow<S, schar>;
    case CV_16U: return cvtRow<S, ushort>;
    case CV_16S: return cvtRow<S, short>;
    case CV_32S: return cvtRow<S, int>;
    case CV_32F: return cvtRow<S, float>;
    default: return cvtRow<S, double>;
  }
}
static CvtFn getCvt(int sdepth, int ddepth) {
  switch (sdepth) {
    case CV_8U: return cvtFor<uchar>(ddepth);
    case CV_8S: return cvtFor<schar>(ddepth);
    case CV_16U: return cvtFor<ushort>(ddepth);
    case CV_16S: return cvtFor<short>(ddepth);
    case CV_32S: return cvtFor<int>(ddepth);
    case CV_32F: return cvtFor<float>(ddepth);
    default: return cvtFor<double>(ddepth);
  }
}
static double getElem(const uchar* p, int depth) {
  switch (depth) {
    case CV_8U: return *(const uchar*)p;
    case CV_8S: return *(const schar*)p;
    case CV_16U: return *(const ushort*)p;
    case CV_16S: return *(const short*)p;
    case CV_32S: return *(const int*)p;
    case CV_32F: return *(const float*)p;
    default: return *(const double*)p;
  }
}
static void putElem(uchar* p, int depth, double v) {
  switch (depth) {
    case CV_8U: *(uchar*)p = saturate_cast<uchar>(v); break;
    case CV_8S: *(schar*)p = saturate_cast<schar>(v); break;
    case CV_16U: *(ushort*)p = saturate_cast<ushort>(v); break;
    case CV_16S: *(short*)p = saturate_cast<short>(v); break;
    case CV_32S: *(int*)p = saturate_cast<int>(v); break;
    case CV_32F: *(float*)p = (float)v; break;
    default: *(double*)p = v; break;
  }
}
static std::string typeName(int type) {
  static const char* d[] = { "CV_8U", "CV_8S", "CV_16U", "CV_16S", "CV_32S", "CV_32F", "CV_64F", "CV_16F" };
  return std::string(d[CV_MAT_DEPTH(type) & 7]) + "C" + std::to_string(CV_MAT_CN(type));
}
[[noreturn]] static void assertFail(const char* expr, const char* func) { cv::error(Error::StsAssert, expr, func, "mat.inl.hpp", 0); }
} // namespace detail

using namespace detail;

// ================================================================ 기본 유틸리티
Exception::Exception(int _code, const std::string& _err, const std::string& _func, const std::string& _file, int _line)
  : code(_code), err(_err), func(_func), file(_file), line(_line) { formatMessage(); }

static const char* errorStr(int code) {
  switch (code) {
    case Error::StsAssert: return "Assertion failed";
    case Error::StsBadArg: return "Bad argument";
    case Error::StsOutOfRange: return "One of the arguments' values is out of range";
    case Error::StsNotImplemented: return "The function/feature is not implemented";
    case Error::StsBadSize: return "Incorrect size of input array";
    case Error::StsNullPtr: return "Null pointer";
    case Error::StsUnsupportedFormat: return "Unsupported format or combination of formats";
    default: return "Unspecified error";
  }
}
void Exception::formatMessage() {
  std::ostringstream o;
  o << "OpenCV(" << CV_VERSION << ") " << file << ":" << line << ": error: (" << code << ":" << errorStr(code) << ") " << err;
  if (!func.empty()) o << " in function '" << func << "'";
  o << "\n";
  msg = o.str();
}
void error(int code, const std::string& err, const char* func, const char* file, int line) {
  const char* f = file ? std::strrchr(file, '/') : nullptr;
  throw Exception(code, err, func ? func : "", f ? f + 1 : (file ? file : ""), line);
}
void error(const Exception& exc) { throw exc; }

std::string format(const char* fmt, ...) {
  char buf[4096];
  va_list ap;
  va_start(ap, fmt);
  int n = std::vsnprintf(buf, sizeof(buf), fmt, ap);
  va_end(ap);
  if (n < (int)sizeof(buf)) return std::string(buf, n < 0 ? 0 : n);
  std::vector<char> big(n + 1);
  va_start(ap, fmt);
  std::vsnprintf(big.data(), big.size(), fmt, ap);
  va_end(ap);
  return std::string(big.data(), n);
}
int64 getTickCount() { timespec ts; clock_gettime(CLOCK_MONOTONIC, &ts); return (int64)ts.tv_sec * 1000000000LL + ts.tv_nsec; }
double getTickFrequency() { return 1e9; }
int64 getCPUTickCount() { return getTickCount(); }
int getNumThreads() { return 1; }
void setNumThreads(int) {}
int getNumberOfCPUs() { return 1; }
std::string getVersionString() { return CV_VERSION; }
int getVersionMajor() { return CV_VERSION_MAJOR; }
int getVersionMinor() { return CV_VERSION_MINOR; }
int getVersionRevision() { return CV_VERSION_REVISION; }
bool useOptimized() { return true; }
void setUseOptimized(bool) {}
std::string getBuildInformation() {
  Call c("getBuildInformation");
  c.run();
  return "study-OpenCV C++ (browser): C++ API shim + " + c.retstr();
}
float cubeRoot(float v) { return std::cbrt(v); }
const char* depthToString(int depth) {
  static const char* d[] = { "CV_8U", "CV_8S", "CV_16U", "CV_16S", "CV_32S", "CV_32F", "CV_64F", "CV_16F" };
  return depth >= 0 && depth < 8 ? d[depth] : "<invalid depth>";
}
std::string typeToString(int type) { return std::string(depthToString(CV_MAT_DEPTH(type))) + "C" + std::to_string(CV_MAT_CN(type)); }
float fastAtan2(float y, float x) {
  float a = (float)(std::atan2((double)y, (double)x) * 180.0 / CV_PI);
  if (a < 0) a += 360.f;
  return a;
}
int borderInterpolate(int p, int len, int borderType) {
  if ((unsigned)p < (unsigned)len) return p;
  if (borderType == BORDER_REPLICATE) return p < 0 ? 0 : len - 1;
  if (borderType == BORDER_REFLECT || borderType == BORDER_REFLECT_101) {
    int delta = borderType == BORDER_REFLECT_101;
    if (len == 1) return 0;
    do {
      if (p < 0) p = -p - 1 + delta;
      else p = len - 1 - (p - len) - delta;
    } while ((unsigned)p >= (unsigned)len);
    return p;
  }
  if (borderType == BORDER_WRAP) {
    if (p < 0) p -= ((p - len + 1) / len) * len;
    if (p >= len) p %= len;
    return p;
  }
  return -1;
}

// ================================================================ RotatedRect
RotatedRect::RotatedRect(const Point2f& p1, const Point2f& p2, const Point2f& p3) {
  Point2f c = (p1 + p3) * 0.5f;
  Point2f v1 = p2 - p1, v2 = p3 - p2;
  center = c;
  size = Size2f((float)cv::norm(v1), (float)cv::norm(v2));
  angle = (float)(std::atan2((double)v1.y, (double)v1.x) * 180.0 / CV_PI);
}
void RotatedRect::points(Point2f pt[]) const {
  double a_ = angle * CV_PI / 180.;
  float b = (float)std::cos(a_) * 0.5f;
  float a = (float)std::sin(a_) * 0.5f;
  pt[0].x = center.x - a * size.height - b * size.width;
  pt[0].y = center.y + b * size.height - a * size.width;
  pt[1].x = center.x + a * size.height - b * size.width;
  pt[1].y = center.y - b * size.height - a * size.width;
  pt[2].x = 2 * center.x - pt[0].x;
  pt[2].y = 2 * center.y - pt[0].y;
  pt[3].x = 2 * center.x - pt[1].x;
  pt[3].y = 2 * center.y - pt[1].y;
}
void RotatedRect::points(std::vector<Point2f>& pts) const { pts.resize(4); points(pts.data()); }
Rect RotatedRect::boundingRect() const {
  Point2f pt[4];
  points(pt);
  Rect r(cvFloor(std::min(std::min(std::min(pt[0].x, pt[1].x), pt[2].x), pt[3].x)),
         cvFloor(std::min(std::min(std::min(pt[0].y, pt[1].y), pt[2].y), pt[3].y)),
         cvCeil(std::max(std::max(std::max(pt[0].x, pt[1].x), pt[2].x), pt[3].x)),
         cvCeil(std::max(std::max(std::max(pt[0].y, pt[1].y), pt[2].y), pt[3].y)));
  r.width -= r.x - 1;
  r.height -= r.y - 1;
  return r;
}
Rect_<float> RotatedRect::boundingRect2f() const {
  Point2f pt[4];
  points(pt);
  float x0 = std::min(std::min(std::min(pt[0].x, pt[1].x), pt[2].x), pt[3].x), y0 = std::min(std::min(std::min(pt[0].y, pt[1].y), pt[2].y), pt[3].y);
  float x1 = std::max(std::max(std::max(pt[0].x, pt[1].x), pt[2].x), pt[3].x), y1 = std::max(std::max(std::max(pt[0].y, pt[1].y), pt[2].y), pt[3].y);
  return Rect_<float>(x0, y0, x1 - x0, y1 - y0);
}

// ================================================================ Mat
static inline void initHeader(Mat& m) {
  m.flags = Mat::CONTINUOUS_FLAG; m.dims = 2; m.rows = 0; m.cols = 0; m.data = nullptr;
  m.datastart = m.dataend = m.datalimit = nullptr; m.u = nullptr; m.step.buf[0] = m.step.buf[1] = 0;
}
Mat::Mat() : size(&rows) { initHeader(*this); }
Mat::Mat(int r, int c, int t) : size(&rows) { initHeader(*this); create(r, c, t); }
Mat::Mat(Size s, int t) : size(&rows) { initHeader(*this); create(s.height, s.width, t); }
Mat::Mat(int r, int c, int t, const Scalar& s) : size(&rows) { initHeader(*this); create(r, c, t); setTo(s); }
Mat::Mat(Size sz, int t, const Scalar& s) : size(&rows) { initHeader(*this); create(sz.height, sz.width, t); setTo(s); }
Mat::Mat(int r, int c, int t, void* d, size_t st) : size(&rows) {
  initHeader(*this);
  if (!d) { create(r, c, t); if (data) std::memset(data, 0, (size_t)r * step.buf[0]); return; }
  flags = CV_MAT_TYPE(t);
  rows = r; cols = c;
  size_t esz = CV_ELEM_SIZE(t);
  step.buf[0] = st == AUTO_STEP ? esz * c : st;
  step.buf[1] = esz;
  data = (uchar*)d;
  datastart = data;
  dataend = datalimit = data + step.buf[0] * r;
  updateContinuity();
}
Mat::Mat(Size sz, int t, void* d, size_t st) : Mat(sz.height, sz.width, t, d, st) {}
Mat::Mat(const Mat& m) : size(&rows) {
  flags = m.flags; dims = m.dims; rows = m.rows; cols = m.cols; data = m.data;
  datastart = m.datastart; dataend = m.dataend; datalimit = m.datalimit; u = m.u; step = m.step;
  if (u) u->refcount++;
}
Mat::Mat(Mat&& m) noexcept : size(&rows) {
  flags = m.flags; dims = m.dims; rows = m.rows; cols = m.cols; data = m.data;
  datastart = m.datastart; dataend = m.dataend; datalimit = m.datalimit; u = m.u; step = m.step;
  m.u = nullptr; m.data = nullptr; m.rows = m.cols = 0; m.datastart = m.dataend = m.datalimit = nullptr;
}
Mat::Mat(const Mat& m, const Rect& roi) : Mat(m) {
  if (!(0 <= roi.x && 0 <= roi.width && roi.x + roi.width <= m.cols && 0 <= roi.y && 0 <= roi.height && roi.y + roi.height <= m.rows))
    cv::error(Error::StsAssert, "0 <= roi.x && 0 <= roi.width && roi.x + roi.width <= m.cols && 0 <= roi.y && 0 <= roi.height && roi.y + roi.height <= m.rows", "Mat", "matrix.cpp", 0);
  data += roi.y * step.buf[0] + roi.x * elemSize();
  rows = roi.height; cols = roi.width;
  if (roi.width < m.cols || roi.height < m.rows) flags |= SUBMATRIX_FLAG;
  updateContinuity();
  if (rows <= 0 || cols <= 0) { rows = cols = 0; }
}
Mat::Mat(const Mat& m, const Range& rr, const Range& cr) : Mat(m) {
  Range r = rr == Range::all() ? Range(0, m.rows) : rr;
  Range c = cr == Range::all() ? Range(0, m.cols) : cr;
  if (!(0 <= r.start && r.start <= r.end && r.end <= m.rows))
    cv::error(Error::StsAssert, "0 <= _rowRange.start && _rowRange.start <= _rowRange.end && _rowRange.end <= m.rows", "Mat", "matrix.cpp", 0);
  if (!(0 <= c.start && c.start <= c.end && c.end <= m.cols))
    cv::error(Error::StsAssert, "0 <= _colRange.start && _colRange.start <= _colRange.end && _colRange.end <= m.cols", "Mat", "matrix.cpp", 0);
  data += r.start * step.buf[0] + c.start * elemSize();
  rows = r.size(); cols = c.size();
  if (rows < m.rows || cols < m.cols) flags |= SUBMATRIX_FLAG;
  updateContinuity();
}
Mat::~Mat() { release(); }
Mat& Mat::operator=(const Mat& m) {
  if (this == &m) return *this;
  if (m.u) m.u->refcount++;
  release();
  flags = m.flags; dims = m.dims; rows = m.rows; cols = m.cols; data = m.data;
  datastart = m.datastart; dataend = m.dataend; datalimit = m.datalimit; u = m.u; step = m.step;
  return *this;
}
Mat& Mat::operator=(Mat&& m) noexcept {
  if (this == &m) return *this;
  release();
  flags = m.flags; dims = m.dims; rows = m.rows; cols = m.cols; data = m.data;
  datastart = m.datastart; dataend = m.dataend; datalimit = m.datalimit; u = m.u; step = m.step;
  m.u = nullptr; m.data = nullptr; m.rows = m.cols = 0; m.datastart = m.dataend = m.datalimit = nullptr;
  return *this;
}
Mat& Mat::operator=(const Scalar& s) { return setTo(s); }
void Mat::updateContinuity() {
  if (rows <= 1 || step.buf[0] == (size_t)cols * elemSize()) flags |= CONTINUOUS_FLAG;
  else flags &= ~CONTINUOUS_FLAG;
}
void Mat::create(int r, int c, int t) {
  t = CV_MAT_TYPE(t);
  if (data && rows == r && cols == c && type() == t) return;
  release();
  if (r < 0 || c < 0) cv::error(Error::StsAssert, "_sizes[i] >= 0", "create", "matrix.cpp", 0);
  flags = t | CONTINUOUS_FLAG;
  rows = r; cols = c;
  size_t esz = CV_ELEM_SIZE(t);
  step.buf[0] = esz * c; step.buf[1] = esz;
  size_t total = step.buf[0] * r;
  if (total == 0) { rows = r; cols = c; return; }
  u = new detail::MatData;
  u->refcount = 1;
  u->size = total;
  u->ptr = (uchar*)std::malloc(total + 16);
  if (!u->ptr) cv::error(Error::StsNoMem, format("Failed to allocate %zu bytes", total), "OutOfMemoryError", "alloc.cpp", 0);
  data = u->ptr;
  datastart = data; dataend = datalimit = data + total;
}
void Mat::create(Size s, int t) { create(s.height, s.width, t); }
void Mat::release() {
  if (u && --u->refcount == 0) { std::free(u->ptr); delete u; }
  u = nullptr; data = nullptr; datastart = dataend = datalimit = nullptr; rows = cols = 0;
  flags = (flags & CV_MAT_TYPE_MASK) | CONTINUOUS_FLAG;
}
Mat Mat::fromVec(const void* ptr, int n, int type, bool copy) {
  if (!ptr || n <= 0) { Mat e; e.flags = CV_MAT_TYPE(type) | CONTINUOUS_FLAG; return e; }
  Mat h(n, 1, type, const_cast<void*>(ptr));
  return copy ? h.clone() : h;
}
void Mat::chkRow(int r) const {
  if (!data) assertFail("data", "ptr");
  if ((unsigned)r >= (unsigned)rows) assertFail("y == 0 || (data && dims >= 1 && (unsigned)y < (unsigned)size.p[0])", "ptr");
}
void Mat::chkAt(int r, int c, size_t tsize, int tcn, int tdepth) const {
  (void)tsize;
  if (!data) assertFail("dims <= 2 && data && (unsigned)i0 < (unsigned)size.p[0] && (unsigned)(i1 * DataType<_Tp>::channels) < (unsigned)(size.p[1] * channels()) && CV_ELEM_SIZE1(traits::Depth<_Tp>::value) == elemSize1()", "at");
  if ((unsigned)r >= (unsigned)rows || (unsigned)(c * tcn) >= (unsigned)(cols * channels()))
    assertFail("dims <= 2 && data && (unsigned)i0 < (unsigned)size.p[0] && (unsigned)(i1 * DataType<_Tp>::channels) < (unsigned)(size.p[1] * channels()) && CV_ELEM_SIZE1(traits::Depth<_Tp>::value) == elemSize1()", "at");
  if (tdepth >= 0 && detail::depthSize(tdepth) != elemSize1())
    assertFail("dims <= 2 && data && (unsigned)i0 < (unsigned)size.p[0] && (unsigned)(i1 * DataType<_Tp>::channels) < (unsigned)(size.p[1] * channels()) && CV_ELEM_SIZE1(traits::Depth<_Tp>::value) == elemSize1()", "at");
}
void Mat::chkIdx(int i, size_t tsize) const {
  if (!data || (size_t)(unsigned)i * tsize >= total() * elemSize())
    assertFail("dims <= 2 && data && (unsigned)i0 < (unsigned)(size.p[0] * size.p[1]) && elemSize() == sizeof(_Tp)", "at");
}
int Mat::checkVector(int ecn, int d, bool requireContinuous) const {
  if (data && (d <= 0 || depth() == d) && (isContinuous() || !requireContinuous)) {
    if (cols == 1 || rows == 1) {
      if (channels() == ecn) return (int)total();
      if (channels() == 1 && (cols == ecn || rows == ecn)) return cols == ecn ? rows : cols;
    }
    if (channels() == 1 && cols == ecn) return rows;
  }
  return -1;
}
Mat Mat::row(int y) const { return Mat(*this, Range(y, y + 1), Range::all()); }
Mat Mat::col(int x) const { return Mat(*this, Range::all(), Range(x, x + 1)); }
Mat Mat::rowRange(int a, int b) const { return Mat(*this, Range(a, b), Range::all()); }
Mat Mat::rowRange(const Range& r) const { return Mat(*this, r, Range::all()); }
Mat Mat::colRange(int a, int b) const { return Mat(*this, Range::all(), Range(a, b)); }
Mat Mat::colRange(const Range& r) const { return Mat(*this, Range::all(), r); }
Mat Mat::operator()(Range rr, Range cr) const { return Mat(*this, rr, cr); }
Mat Mat::operator()(const Rect& roi) const { return Mat(*this, roi); }
Mat Mat::diag(int d) const {
  Mat m = *this;
  size_t esz = elemSize();
  int len;
  if (d >= 0) { len = std::min(cols - d, rows); m.data += esz * d; }
  else { len = std::min(rows + d, cols); m.data -= step.buf[0] * d; }
  if (len < 0) len = 0;
  m.rows = len; m.cols = 1;
  m.step.buf[0] += (len > 1 ? esz : 0);
  m.updateContinuity();
  return m;
}
void Mat::locateROI(Size& wholeSize, Point& ofs) const {
  size_t esz = elemSize();
  ptrdiff_t delta1 = data - datastart, delta2 = datalimit - datastart;
  if (delta1 == 0) ofs.x = ofs.y = 0;
  else { ofs.y = (int)(delta1 / step.buf[0]); ofs.x = (int)((delta1 - step.buf[0] * ofs.y) / esz); }
  size_t minstep = (ofs.x + cols) * esz;
  wholeSize.height = (int)((delta2 - minstep) / step.buf[0] + 1);
  wholeSize.height = std::max(wholeSize.height, ofs.y + rows);
  wholeSize.width = (int)((delta2 - step.buf[0] * (wholeSize.height - 1)) / esz);
  wholeSize.width = std::max(wholeSize.width, ofs.x + cols);
}
Mat& Mat::adjustROI(int dtop, int dbottom, int dleft, int dright) {
  Size wholeSize; Point ofs;
  size_t esz = elemSize();
  locateROI(wholeSize, ofs);
  int row1 = std::min(std::max(ofs.y - dtop, 0), wholeSize.height), row2 = std::max(0, std::min(ofs.y + rows + dbottom, wholeSize.height));
  int col1 = std::min(std::max(ofs.x - dleft, 0), wholeSize.width), col2 = std::max(0, std::min(ofs.x + cols + dright, wholeSize.width));
  data += (row1 - ofs.y) * (ptrdiff_t)step.buf[0] + (col1 - ofs.x) * (ptrdiff_t)esz;
  rows = row2 - row1; cols = col2 - col1;
  updateContinuity();
  return *this;
}
Mat Mat::clone() const {
  Mat m;
  if (empty()) { m.flags = (flags & CV_MAT_TYPE_MASK) | CONTINUOUS_FLAG; return m; }
  copyTo(m);
  return m;
}
static void copyRows(const Mat& s, Mat& d) {
  size_t rowBytes = (size_t)s.cols * s.elemSize();
  if (s.data == d.data) return;
  for (int r = 0; r < s.rows; r++) std::memmove(d.data + d.step.buf[0] * r, s.data + s.step.buf[0] * r, rowBytes);
}
void Mat::copyTo(OutputArray o) const {
  if (o.okind != _OutputArray::O_MAT) { o.assign(*this); return; }
  Mat& d = *(Mat*)o.dst;
  if (empty()) { d.release(); return; }
  if (d.data == data && d.rows == rows && d.cols == cols && d.type() == type()) return;
  // 같은 메모리를 공유하는 다른 모양이면 먼저 복사본을 만든다
  Mat src = *this;
  d.create(rows, cols, type());
  copyRows(src, d);
}
void Mat::copyTo(OutputArray o, InputArray maskArr) const {
  Mat mask = maskArr.getMat();
  if (mask.empty()) { copyTo(o); return; }
  if (mask.rows != rows || mask.cols != cols) assertFail("size() == mask.size()", "copyTo");
  if (mask.depth() != CV_8U || (mask.channels() != 1 && mask.channels() != channels())) assertFail("mask.depth() == CV_8U && (mcn == 1 || mcn == cn)", "copyTo");
  if (o.okind != _OutputArray::O_MAT) { Mat t; copyTo(t, maskArr); o.assign(t); return; }
  Mat& d = *(Mat*)o.dst;
  bool fresh = !(d.data && d.rows == rows && d.cols == cols && d.type() == type());
  Mat src = *this;
  if (fresh) { d.create(rows, cols, type()); for (int r = 0; r < rows; r++) std::memset(d.data + d.step.buf[0] * r, 0, (size_t)cols * elemSize()); }
  size_t esz = elemSize(), esz1 = elemSize1();
  int cn = channels(), mcn = mask.channels();
  for (int r = 0; r < rows; r++) {
    const uchar* sp = src.data + src.step.buf[0] * r;
    uchar* dp = d.data + d.step.buf[0] * r;
    const uchar* mp = mask.data + mask.step.buf[0] * r;
    for (int c = 0; c < cols; c++) {
      if (mcn == 1) { if (mp[c]) std::memcpy(dp + c * esz, sp + c * esz, esz); }
      else for (int k = 0; k < cn; k++) if (mp[c * cn + k]) std::memcpy(dp + c * esz + k * esz1, sp + c * esz + k * esz1, esz1);
    }
  }
}
void Mat::convertTo(OutputArray o, int rtype, double alpha, double beta) const {
  if (empty()) { o.release(); return; }
  int ddepth = rtype < 0 ? depth() : CV_MAT_DEPTH(rtype);
  int dt = CV_MAKETYPE(ddepth, channels());
  bool scale = std::fabs(alpha - 1) > DBL_EPSILON || std::fabs(beta) > DBL_EPSILON;
  if (!scale && dt == type()) { copyTo(o); return; }
  Mat src = *this;
  Mat tmp(rows, cols, dt);
  CvtFn fn = getCvt(depth(), ddepth);
  int n = cols * channels();
  for (int r = 0; r < rows; r++) fn(src.data + src.step.buf[0] * r, tmp.data + tmp.step.buf[0] * r, n, alpha, beta, scale);
  if (o.okind == _OutputArray::O_MAT) {
    Mat& d = *(Mat*)o.dst;
    d.create(rows, cols, dt);
    copyRows(tmp, d);
  } else o.assign(tmp);
}
void Mat::assignTo(Mat& m, int t) const { if (t < 0) m = *this; else convertTo(m, t); }
Mat& Mat::setTo(const Scalar& s) { return setTo(_InputArray(s), noArray()); }
Mat& Mat::setTo(InputArray value, InputArray maskArr) {
  if (empty()) return *this;
  Scalar s;
  if (value.kind == _InputArray::SCALAR) s = value.sc;
  else {
    Mat v = value.getMat();
    Mat vd; v.convertTo(vd, CV_64F);
    for (int k = 0; k < 4 && k < (int)(vd.total() * vd.channels()); k++) s[k] = ((double*)vd.data)[k];
  }
  int cn = channels(), dep = depth();
  size_t esz = elemSize(), esz1 = elemSize1();
  uchar pix[64];
  for (int k = 0; k < cn; k++) putElem(pix + k * esz1, dep, s[k < 4 ? k : 3]);
  if (cn > 4) for (int k = 4; k < cn; k++) putElem(pix + k * esz1, dep, 0);
  Mat mask = maskArr.getMat();
  if (!mask.empty() && (mask.rows != rows || mask.cols != cols)) assertFail("mask.empty() || (mask.type() == CV_8U && size == mask.size)", "setTo");
  for (int r = 0; r < rows; r++) {
    uchar* dp = data + step.buf[0] * r;
    const uchar* mp = mask.empty() ? nullptr : mask.data + mask.step.buf[0] * r;
    for (int c = 0; c < cols; c++) if (!mp || mp[c * mask.channels()]) std::memcpy(dp + c * esz, pix, esz);
  }
  return *this;
}
Mat Mat::reshape(int cn, int newRows) const {
  int ocn = channels();
  if (cn == 0) cn = ocn;
  if (!isContinuous() && newRows != 0 && newRows != rows) assertFail("m.isContinuous()", "reshape");
  Mat m = *this;
  int totalElems = cols * ocn;   // 한 행의 원소 수
  if (newRows > 0) {
    size_t t = total() * ocn;
    if (t % newRows) cv::error(Error::StsBadArg, "The total number of matrix elements is not divisible by the new number of rows", "reshape", "matrix.cpp", 0);
    totalElems = (int)(t / newRows);
    m.rows = newRows;
    m.step.buf[0] = (size_t)totalElems * elemSize1();
  }
  if (totalElems % cn) cv::error(Error::StsBadArg, "The total width is not divisible by the new number of channels", "reshape", "matrix.cpp", 0);
  m.cols = totalElems / cn;
  m.flags = (m.flags & ~CV_MAT_TYPE_MASK) | CV_MAKETYPE(depth(), cn);
  m.step.buf[1] = CV_ELEM_SIZE(m.flags);
  m.updateContinuity();
  return m;
}
Mat Mat::zeros(int r, int c, int t) { Mat m(r, c, t); m.setTo(Scalar::all(0)); return m; }
Mat Mat::zeros(Size s, int t) { return zeros(s.height, s.width, t); }
Mat Mat::ones(int r, int c, int t) { Mat m(r, c, t); m.setTo(Scalar(1)); return m; }
Mat Mat::ones(Size s, int t) { return ones(s.height, s.width, t); }
Mat Mat::eye(int r, int c, int t) { Mat m = zeros(r, c, t); for (int k = 0; k < std::min(r, c); k++) putElem(m.data + m.step.buf[0] * k + m.elemSize() * k, m.depth(), 1); return m; }
Mat Mat::eye(Size s, int t) { return eye(s.height, s.width, t); }
void Mat::push_back(const Mat& m) {
  if (empty()) { *this = m.clone(); return; }
  if (m.cols != cols || m.type() != type()) assertFail("m.type() == type() && m.cols == cols", "push_back");
  Mat n(rows + m.rows, cols, type());
  copyRows(*this, n);
  Mat bottom = n.rowRange(rows, rows + m.rows);
  copyRows(m, bottom);
  *this = n;
}
void Mat::pop_back(size_t k) { if ((size_t)rows >= k) { rows -= (int)k; updateContinuity(); } }
Mat Mat::t() const { Mat d; transpose(*this, d); return d; }
Mat Mat::inv(int method) const { Mat d; invert(*this, d, method); return d; }
Mat Mat::mul(InputArray m, double scale) const { Mat d; multiply(*this, m, d, scale); return d; }
Mat Mat::cross(InputArray m) const {
  Mat a, b; this->convertTo(a, CV_64F); m.getMat().convertTo(b, CV_64F);
  double* x = (double*)a.data; double* y = (double*)b.data;
  Mat r(rows, cols, CV_64F);
  double* z = (double*)r.data;
  z[0] = x[1] * y[2] - x[2] * y[1]; z[1] = x[2] * y[0] - x[0] * y[2]; z[2] = x[0] * y[1] - x[1] * y[0];
  Mat out; r.convertTo(out, type());
  return out;
}
double Mat::dot(InputArray mm) const {
  Mat m = mm.getMat();
  if (m.rows * m.cols * m.channels() != rows * cols * channels()) assertFail("mat.size == size", "dot");
  double s = 0;
  int cn = channels();
  size_t e1 = elemSize1();
  for (int r = 0; r < rows; r++) for (int c = 0; c < cols * cn; c++) {
    int k = r * cols * cn + c;
    int r2 = k / (m.cols * cn), c2 = k % (m.cols * cn);
    s += getElem(data + step.buf[0] * r + c * e1, depth()) * getElem(m.data + m.step.buf[0] * r2 + c2 * m.elemSize1(), m.depth());
  }
  return s;
}

// ---------------------------------------------------------------- 출력 형식 (OpenCV 기본 Formatter 와 같게)
std::ostream& operator<<(std::ostream& out, const Mat& m) {
  if (m.empty()) return out << "[]";
  int cn = m.channels(), d = m.depth();
  char buf[64];
  out << "[";
  for (int r = 0; r < m.rows; r++) {
    const uchar* p = m.data + m.step.buf[0] * r;
    for (int c = 0; c < m.cols * cn; c++) {
      const uchar* e = p + c * m.elemSize1();
      switch (d) {
        case CV_8U: std::snprintf(buf, sizeof(buf), "%3d", (int)*(const uchar*)e); break;
        case CV_8S: std::snprintf(buf, sizeof(buf), "%3d", (int)*(const schar*)e); break;
        case CV_16U: std::snprintf(buf, sizeof(buf), "%d", (int)*(const ushort*)e); break;
        case CV_16S: std::snprintf(buf, sizeof(buf), "%d", (int)*(const short*)e); break;
        case CV_32S: std::snprintf(buf, sizeof(buf), "%d", *(const int*)e); break;
        case CV_32F: std::snprintf(buf, sizeof(buf), "%.8g", (double)*(const float*)e); break;
        default: std::snprintf(buf, sizeof(buf), "%.16g", *(const double*)e); break;
      }
      out << buf;
      if (c < m.cols * cn - 1) out << ", ";
    }
    if (r < m.rows - 1) out << ";\n ";
  }
  return out << "]";
}

// ================================================================ InputArray / OutputArray
_InputArray::_InputArray(const std::vector<bool>& v) : kind(MATX), mptr(nullptr), obj(&v), vcount(0) {
  tmp.create((int)v.size(), 1, CV_8U);
  for (size_t k = 0; k < v.size(); k++) tmp.data[k] = v[k] ? 1 : 0;
  if (v.empty()) tmp = Mat();
}
Mat _InputArray::getMat(int idx) const {
  switch (kind) {
    case MAT: return *mptr;
    case MATX: return tmp;
    case SCALAR: { Mat m(4, 1, CV_64F); for (int k = 0; k < 4; k++) ((double*)m.data)[k] = sc[k]; return m; }
    case VECVEC:
    case MATVEC: if (idx >= 0 && idx < (int)list.size()) return list[idx]; return list.empty() ? Mat() : list[0];
    case KPVEC: {
      auto& v = *(const std::vector<KeyPoint>*)obj;
      Mat m((int)v.size(), 1, CV_32FC2);
      for (size_t k = 0; k < v.size(); k++) m.at<Point2f>((int)k, 0) = v[k].pt;
      return v.empty() ? Mat() : m;
    }
    default: return Mat();
  }
}
void _InputArray::getMatVector(std::vector<Mat>& mv) const {
  if (kind == VECVEC || kind == MATVEC) mv = list;
  else if (kind != NONE) { Mat m = getMat(); mv.assign(1, m); }
  else mv.clear();
}
bool _InputArray::empty() const {
  switch (kind) {
    case NONE: return true;
    case MAT: return mptr->empty();
    case MATX: return tmp.empty();
    case SCALAR: return false;
    default: return vcount == 0;
  }
}
Size _InputArray::size(int i) const {
  if ((kind == VECVEC || kind == MATVEC) && i < 0) return Size(vcount, 1);
  if (kind == KPVEC || kind == DMVEC) return Size(1, vcount);
  Mat m = getMat(i);
  return Size(m.cols, m.rows);
}
int _InputArray::type(int i) const {
  if (kind == SCALAR) return CV_64F;
  if (kind == NONE) return -1;
  return getMat(i < 0 ? 0 : i).type();
}
size_t _InputArray::total(int i) const {
  if ((kind == VECVEC || kind == MATVEC) && i < 0) return vcount;
  if (kind == KPVEC || kind == DMVEC) return vcount;
  return getMat(i).total();
}
Mat& _OutputArray::getMatRef(int i) const {
  if (okind == O_MAT) return *(Mat*)dst;
  if (okind == O_MATVEC) return (*(std::vector<Mat>*)dst)[i < 0 ? 0 : i];
  cv::error(Error::StsNotImplemented, "getMatRef() is only for Mat outputs", "getMatRef", "matrix_wrap.cpp", 0);
}
void _OutputArray::create(int r, int c, int t) const {
  if (okind == O_MAT) { ((Mat*)dst)->create(r, c, t); return; }
  Mat m(r, c, t);
  assign(m);
}
void _OutputArray::release() const {
  switch (okind) {
    case O_MAT: ((Mat*)dst)->release(); break;
    case O_VEC: case O_FIXED: vassign(dst, Mat()); break;
    case O_VECVEC: vvassign(dst, std::vector<Mat>()); break;
    case O_MATVEC: ((std::vector<Mat>*)dst)->clear(); break;
    case O_KP: ((std::vector<KeyPoint>*)dst)->clear(); break;
    case O_DM: ((std::vector<DMatch>*)dst)->clear(); break;
    case O_DMVV: ((std::vector<std::vector<DMatch>>*)dst)->clear(); break;
    default: break;
  }
}
void _OutputArray::assign(const Mat& m) const {
  switch (okind) {
    case O_MAT: {
      Mat& d = *(Mat*)dst;
      if (m.empty()) { d.release(); return; }
      if (d.data == m.data && d.rows == m.rows && d.cols == m.cols && d.type() == m.type()) return;
      Mat src = m;
      d.create(m.rows, m.cols, m.type());
      copyRows(src, d);
      return;
    }
    case O_VEC: case O_FIXED: {
      if (vtype >= 0 && !m.empty() && CV_MAT_DEPTH(vtype) != m.depth()) { Mat t; m.convertTo(t, CV_MAT_DEPTH(vtype)); vassign(dst, t); }
      else vassign(dst, m);
      return;
    }
    case O_MATVEC: { auto& v = *(std::vector<Mat>*)dst; v.assign(1, m.clone()); return; }
    default: return;
  }
}
void _OutputArray::assignList(const std::vector<Mat>& ms) const {
  switch (okind) {
    case O_VECVEC: vvassign(dst, ms); return;
    case O_MATVEC: {
      auto& v = *(std::vector<Mat>*)dst;
      v.resize(ms.size());
      for (size_t k = 0; k < ms.size(); k++) v[k] = ms[k];
      return;
    }
    default: if (!ms.empty()) assign(ms[0]); return;
  }
}
const _OutputArray& noArray() { static _OutputArray none; return none; }

// ================================================================ 산술 연산자
Mat operator+(const Mat& a, const Mat& b) { Mat d; add(a, b, d); return d; }
Mat operator+(const Mat& a, const Scalar& s) { Mat d; add(a, s, d); return d; }
Mat operator+(const Scalar& s, const Mat& a) { Mat d; add(a, s, d); return d; }
Mat operator-(const Mat& a, const Mat& b) { Mat d; subtract(a, b, d); return d; }
Mat operator-(const Mat& a, const Scalar& s) { Mat d; subtract(a, s, d); return d; }
Mat operator-(const Scalar& s, const Mat& a) { Mat d; subtract(s, a, d); return d; }
Mat operator-(const Mat& a) { Mat d; subtract(Scalar::all(0), a, d); return d; }
Mat operator*(const Mat& a, const Mat& b) { Mat d; gemm(a, b, 1, noArray(), 0, d); return d; }
Mat operator*(const Mat& a, double s) { Mat d; a.convertTo(d, -1, s); return d; }
Mat operator*(double s, const Mat& a) { Mat d; a.convertTo(d, -1, s); return d; }
Mat operator/(const Mat& a, const Mat& b) { Mat d; divide(a, b, d); return d; }
Mat operator/(const Mat& a, double s) { Mat d; a.convertTo(d, -1, 1.0 / s); return d; }
Mat operator/(double s, const Mat& a) { Mat d; divide(s, a, d); return d; }
Mat operator&(const Mat& a, const Mat& b) { Mat d; bitwise_and(a, b, d); return d; }
Mat operator&(const Mat& a, const Scalar& s) { Mat d; bitwise_and(a, s, d); return d; }
Mat operator|(const Mat& a, const Mat& b) { Mat d; bitwise_or(a, b, d); return d; }
Mat operator|(const Mat& a, const Scalar& s) { Mat d; bitwise_or(a, s, d); return d; }
Mat operator^(const Mat& a, const Mat& b) { Mat d; bitwise_xor(a, b, d); return d; }
Mat operator^(const Mat& a, const Scalar& s) { Mat d; bitwise_xor(a, s, d); return d; }
Mat operator~(const Mat& a) { Mat d; bitwise_not(a, d); return d; }
Mat operator<(const Mat& a, const Mat& b) { Mat d; compare(a, b, d, CMP_LT); return d; }
Mat operator<(const Mat& a, double s) { Mat d; compare(a, s, d, CMP_LT); return d; }
Mat operator<=(const Mat& a, const Mat& b) { Mat d; compare(a, b, d, CMP_LE); return d; }
Mat operator<=(const Mat& a, double s) { Mat d; compare(a, s, d, CMP_LE); return d; }
Mat operator>(const Mat& a, const Mat& b) { Mat d; compare(a, b, d, CMP_GT); return d; }
Mat operator>(const Mat& a, double s) { Mat d; compare(a, s, d, CMP_GT); return d; }
Mat operator>=(const Mat& a, const Mat& b) { Mat d; compare(a, b, d, CMP_GE); return d; }
Mat operator>=(const Mat& a, double s) { Mat d; compare(a, s, d, CMP_GE); return d; }
Mat operator==(const Mat& a, const Mat& b) { Mat d; compare(a, b, d, CMP_EQ); return d; }
Mat operator==(const Mat& a, double s) { Mat d; compare(a, s, d, CMP_EQ); return d; }
Mat operator!=(const Mat& a, const Mat& b) { Mat d; compare(a, b, d, CMP_NE); return d; }
Mat operator!=(const Mat& a, double s) { Mat d; compare(a, s, d, CMP_NE); return d; }
Mat& operator+=(Mat& a, const Mat& b) { add(a, b, a); return a; }
Mat& operator+=(Mat& a, const Scalar& s) { add(a, s, a); return a; }
Mat& operator-=(Mat& a, const Mat& b) { subtract(a, b, a); return a; }
Mat& operator-=(Mat& a, const Scalar& s) { subtract(a, s, a); return a; }
Mat& operator*=(Mat& a, const Mat& b) { Mat d = a * b; a = d; return a; }
Mat& operator*=(Mat& a, double s) { a.convertTo(a, -1, s); return a; }
Mat& operator/=(Mat& a, const Mat& b) { divide(a, b, a); return a; }
Mat& operator/=(Mat& a, double s) { a.convertTo(a, -1, 1.0 / s); return a; }
Mat& operator&=(Mat& a, const Mat& b) { bitwise_and(a, b, a); return a; }
Mat& operator&=(Mat& a, const Scalar& s) { bitwise_and(a, s, a); return a; }
Mat& operator|=(Mat& a, const Mat& b) { bitwise_or(a, b, a); return a; }
Mat& operator|=(Mat& a, const Scalar& s) { bitwise_or(a, s, a); return a; }
Mat& operator^=(Mat& a, const Mat& b) { bitwise_xor(a, b, a); return a; }
Mat abs(const Mat& a) { Mat d; absdiff(a, Scalar::all(0), d); return d; }
Mat min(const Mat& a, const Mat& b) { Mat d; min(a, b, d); return d; }
Mat min(const Mat& a, double s) { Mat d; min(a, s, d); return d; }
Mat max(const Mat& a, const Mat& b) { Mat d; max(a, b, d); return d; }
Mat max(const Mat& a, double s) { Mat d; max(a, s, d); return d; }

// ================================================================ RNG
double RNG::gaussian(double sigma) {
  // Box-Muller (실제 OpenCV 는 Ziggurat 이라 난수 값 자체는 다르다)
  double u1, u2;
  do { u1 = (double)*this; } while (u1 <= 1e-300);
  u2 = (double)*this;
  return std::sqrt(-2.0 * std::log(u1)) * std::cos(CV_2PI * u2) * sigma;
}
void RNG::fill(InputOutputArray mat, int distType, InputArray a, InputArray b, bool) {
  Mat& m = mat.getMatRef();
  Scalar A = a.kind == _InputArray::SCALAR ? a.sc : Scalar(), B = b.kind == _InputArray::SCALAR ? b.sc : Scalar();
  if (a.kind != _InputArray::SCALAR) { Mat t; a.getMat().convertTo(t, CV_64F); for (int k = 0; k < 4 && k < (int)(t.total() * t.channels()); k++) A[k] = ((double*)t.data)[k]; }
  if (b.kind != _InputArray::SCALAR) { Mat t; b.getMat().convertTo(t, CV_64F); for (int k = 0; k < 4 && k < (int)(t.total() * t.channels()); k++) B[k] = ((double*)t.data)[k]; }
  int cn = m.channels(), dep = m.depth();
  bool isInt = dep <= CV_32S;
  for (int r = 0; r < m.rows; r++) {
    uchar* p = m.data + m.step.buf[0] * r;
    for (int c = 0; c < m.cols * cn; c++) {
      int k = c % cn;
      double v;
      if (distType == UNIFORM) {
        if (isInt) { int lo = cvCeil(A[k < 4 ? k : 0]), hi = cvCeil(B[k < 4 ? k : 0]); v = uniform(lo, hi); }
        else v = uniform(A[k < 4 ? k : 0], B[k < 4 ? k : 0]);
      } else v = A[k < 4 ? k : 0] + gaussian(B[k < 4 ? k : 0]);
      putElem(p + c * m.elemSize1(), dep, v);
    }
  }
}
RNG& theRNG() { static RNG rng; return rng; }
void setRNGSeed(int seed) { theRNG() = RNG((uint64)seed); }
void randu(InputOutputArray dst, InputArray low, InputArray high) { theRNG().fill(dst, RNG::UNIFORM, low, high); }
void randn(InputOutputArray dst, InputArray mean, InputArray stddev) { theRNG().fill(dst, RNG::NORMAL, mean, stddev); }
void randShuffle(InputOutputArray dstArr, double iterFactor, RNG* rng) {
  RNG& r = rng ? *rng : theRNG();
  Mat& m = dstArr.getMatRef();
  if (dstArr.okind != _OutputArray::O_MAT) { notSupported("randShuffle(vector)"); return; }
  size_t esz = m.elemSize();
  int n = (int)m.total();
  int iters = cvRound(iterFactor * n);
  std::vector<uchar> tmp(esz);
  for (int k = 0; k < iters; k++) {
    int i = r.uniform(0, n), j = r.uniform(0, n);
    uchar* a = m.ptr(i / m.cols) + (i % m.cols) * esz;
    uchar* b = m.ptr(j / m.cols) + (j % m.cols) * esz;
    std::memcpy(tmp.data(), a, esz); std::memcpy(a, b, esz); std::memcpy(b, tmp.data(), esz);
  }
}

// ================================================================ core (브리지)
void add(InputArray a, InputArray b, OutputArray d, InputArray mask, int dtype) { Call c("add"); c.in(a).in(b).out(d).in(mask).i(dtype).run(); }
void subtract(InputArray a, InputArray b, OutputArray d, InputArray mask, int dtype) { Call c("subtract"); c.in(a).in(b).out(d).in(mask).i(dtype).run(); }
void multiply(InputArray a, InputArray b, OutputArray d, double scale, int dtype) { Call c("multiply"); c.in(a).in(b).out(d).d(scale).i(dtype).run(); }
void divide(InputArray a, InputArray b, OutputArray d, double scale, int dtype) { Call c("divide"); c.in(a).in(b).out(d).d(scale).i(dtype).run(); }
void divide(double scale, InputArray b, OutputArray d, int dtype) { Call c("divideScale"); c.d(scale).in(b).out(d).i(dtype).run(); }
void scaleAdd(InputArray a, double alpha, InputArray b, OutputArray d) { Call c("addWeighted"); c.in(a).d(alpha).in(b).d(1.0).d(0.0).out(d).i(-1).run(); }
void addWeighted(InputArray a, double alpha, InputArray b, double beta, double gamma, OutputArray d, int dtype) { Call c("addWeighted"); c.in(a).d(alpha).in(b).d(beta).d(gamma).out(d).i(dtype).run(); }
void convertScaleAbs(InputArray s, OutputArray d, double alpha, double beta) { Call c("convertScaleAbs"); c.in(s).out(d).d(alpha).d(beta).run(); }
void absdiff(InputArray a, InputArray b, OutputArray d) { Call c("absdiff"); c.in(a).in(b).out(d).run(); }
void bitwise_and(InputArray a, InputArray b, OutputArray d, InputArray mask) { Call c("bitwise_and"); c.in(a).in(b).out(d).in(mask).run(); }
void bitwise_or(InputArray a, InputArray b, OutputArray d, InputArray mask) { Call c("bitwise_or"); c.in(a).in(b).out(d).in(mask).run(); }
void bitwise_xor(InputArray a, InputArray b, OutputArray d, InputArray mask) { Call c("bitwise_xor"); c.in(a).in(b).out(d).in(mask).run(); }
void bitwise_not(InputArray a, OutputArray d, InputArray mask) { Call c("bitwise_not"); c.in(a).out(d).in(mask).run(); }
void compare(InputArray a, InputArray b, OutputArray d, int op) { Call c("compare"); c.in(a).in(b).out(d).i(op).run(); }
void inRange(InputArray s, InputArray lo, InputArray hi, OutputArray d) { Call c("inRange"); c.in(s).in(lo).in(hi).out(d).run(); }
void min(InputArray a, InputArray b, OutputArray d) { Call c("min"); c.in(a).in(b).out(d).run(); }
void max(InputArray a, InputArray b, OutputArray d) { Call c("max"); c.in(a).in(b).out(d).run(); }
void sqrt(InputArray s, OutputArray d) { Call c("sqrt"); c.in(s).out(d).run(); }
void pow(InputArray s, double p, OutputArray d) { Call c("pow"); c.in(s).d(p).out(d).run(); }
void exp(InputArray s, OutputArray d) { Call c("exp"); c.in(s).out(d).run(); }
void log(InputArray s, OutputArray d) { Call c("log"); c.in(s).out(d).run(); }
void magnitude(InputArray x, InputArray y, OutputArray m) { Call c("magnitude"); c.in(x).in(y).out(m).run(); }
void phase(InputArray x, InputArray y, OutputArray a, bool deg) { Call c("phase"); c.in(x).in(y).out(a).b(deg).run(); }
void cartToPolar(InputArray x, InputArray y, OutputArray m, OutputArray a, bool deg) { Call c("cartToPolar"); c.in(x).in(y).out(m).out(a).b(deg).run(); }
void polarToCart(InputArray m, InputArray a, OutputArray x, OutputArray y, bool deg) { Call c("polarToCart"); c.in(m).in(a).out(x).out(y).b(deg).run(); }
Scalar sum(InputArray src) {
  Mat m = src.getMat();
  Scalar s;
  int cn = m.channels();
  for (int r = 0; r < m.rows; r++) {
    const uchar* p = m.data + m.step.buf[0] * r;
    for (int c = 0; c < m.cols * cn; c++) { int k = c % cn; if (k < 4) s[k] += getElem(p + c * m.elemSize1(), m.depth()); }
  }
  return s;
}
Scalar mean(InputArray src, InputArray mask) { Call c("mean"); c.in(src).in(mask).run(); return Scalar(c.ret(0), c.ret(1), c.ret(2), c.ret(3)); }
void meanStdDev(InputArray src, OutputArray mean, OutputArray stddev, InputArray mask) { Call c("meanStdDev"); c.in(src).out(mean).out(stddev).in(mask).run(); }
int countNonZero(InputArray src) { Call c("countNonZero"); c.in(src).run(); return (int)c.ret(0); }
bool hasNonZero(InputArray src) { return countNonZero(src) > 0; }
void findNonZero(InputArray src, OutputArray idx) {
  Mat m = src.getMat();
  if (m.channels() != 1) assertFail("src.channels() == 1 && src.dims == 2", "findNonZero");
  std::vector<Point> pts;
  for (int r = 0; r < m.rows; r++) {
    const uchar* p = m.data + m.step.buf[0] * r;
    for (int c = 0; c < m.cols; c++) if (getElem(p + c * m.elemSize1(), m.depth()) != 0) pts.push_back(Point(c, r));
  }
  Mat out = pts.empty() ? Mat() : Mat((int)pts.size(), 1, CV_32SC2, pts.data()).clone();
  idx.assign(out);
}
void minMaxLoc(InputArray src, double* minVal, double* maxVal, Point* minLoc, Point* maxLoc, InputArray mask) {
  Call c("minMaxLoc"); c.in(src).in(mask).run();
  if (minVal) *minVal = c.ret(0);
  if (maxVal) *maxVal = c.ret(1);
  if (minLoc) *minLoc = Point((int)c.ret(2), (int)c.ret(3));
  if (maxLoc) *maxLoc = Point((int)c.ret(4), (int)c.ret(5));
}
void minMaxIdx(InputArray src, double* minVal, double* maxVal, int* minIdx, int* maxIdx, InputArray mask) {
  Point a, b;
  minMaxLoc(src, minVal, maxVal, &a, &b, mask);
  Mat m = src.getMat();
  if (minIdx) { if (m.rows == 1 || m.cols == 1) { minIdx[0] = m.rows == 1 ? 0 : a.y; minIdx[1] = m.rows == 1 ? a.x : 0; } else { minIdx[0] = a.y; minIdx[1] = a.x; } }
  if (maxIdx) { if (m.rows == 1 || m.cols == 1) { maxIdx[0] = m.rows == 1 ? 0 : b.y; maxIdx[1] = m.rows == 1 ? b.x : 0; } else { maxIdx[0] = b.y; maxIdx[1] = b.x; } }
}
double norm(InputArray a, int t, InputArray mask) { Call c("norm1"); c.in(a).i(t).in(mask).run(); return c.ret(0); }
double norm(InputArray a, InputArray b, int t, InputArray mask) { Call c("norm2"); c.in(a).in(b).i(t).in(mask).run(); return c.ret(0); }
double PSNR(InputArray a, InputArray b, double R) {
  Mat A = a.getMat();
  double diff = std::sqrt(norm(a, b, NORM_L2SQR) / (A.total() * A.channels()));
  return 20 * std::log10(R / (diff + DBL_EPSILON));
}
void normalize(InputArray s, InputOutputArray d, double alpha, double beta, int nt, int dtype, InputArray mask) { Call c("normalize"); c.in(s).out(d).d(alpha).d(beta).i(nt).i(dtype).in(mask).run(); }
void split(InputArray m, OutputArrayOfArrays mv) { Call c("split"); c.in(m).out(mv).run(); }
void split(const Mat& src, Mat* mvbegin) {
  std::vector<Mat> v;
  split(src, v);
  for (size_t k = 0; k < v.size(); k++) mvbegin[k] = v[k];
}
void merge(InputArrayOfArrays mv, OutputArray d) { Call c("merge"); c.in(mv).out(d).run(); }
void merge(const Mat* mv, size_t count, OutputArray d) { std::vector<Mat> v(mv, mv + count); merge(v, d); }
void extractChannel(InputArray src, OutputArray dst, int coi) {
  Mat s = src.getMat();
  if (coi < 0 || coi >= s.channels()) assertFail("0 <= coi && coi < cn", "extractChannel");
  Mat d(s.rows, s.cols, s.depth());
  size_t e1 = s.elemSize1();
  for (int r = 0; r < s.rows; r++) for (int c = 0; c < s.cols; c++) std::memcpy(d.data + d.step.buf[0] * r + c * e1, s.data + s.step.buf[0] * r + c * s.elemSize() + coi * e1, e1);
  dst.assign(d);
}
void insertChannel(InputArray src, InputOutputArray dstArr, int coi) {
  Mat s = src.getMat();
  Mat& d = dstArr.getMatRef();
  if (coi < 0 || coi >= d.channels() || s.channels() != 1 || s.rows != d.rows || s.cols != d.cols || s.depth() != d.depth()) assertFail("src.size == dst.size && src.depth() == dst.depth() && 0 <= coi && coi < dcn && scn == 1", "insertChannel");
  size_t e1 = d.elemSize1();
  for (int r = 0; r < s.rows; r++) for (int c = 0; c < s.cols; c++) std::memcpy(d.data + d.step.buf[0] * r + c * d.elemSize() + coi * e1, s.data + s.step.buf[0] * r + c * e1, e1);
}
void mixChannels(InputArrayOfArrays src, InputOutputArrayOfArrays dst, const std::vector<int>& fromTo) {
  std::vector<Mat> S, D;
  src.getMatVector(S);
  if (dst.okind == _OutputArray::O_MATVEC) D = *(std::vector<Mat>*)dst.dst; else D.push_back(dst.getMatRef());
  auto locate = [](std::vector<Mat>& v, int idx, int& mi, int& ch) { mi = 0; while (mi < (int)v.size() && idx >= v[mi].channels()) { idx -= v[mi].channels(); mi++; } ch = idx; };
  for (size_t k = 0; k + 1 < fromTo.size(); k += 2) {
    int sm, sc, dm, dc;
    locate(D, fromTo[k + 1], dm, dc);
    Mat& d = D[dm];
    size_t e1 = d.elemSize1();
    if (fromTo[k] < 0) { for (int r = 0; r < d.rows; r++) for (int c = 0; c < d.cols; c++) std::memset(d.data + d.step.buf[0] * r + c * d.elemSize() + dc * e1, 0, e1); continue; }
    locate(S, fromTo[k], sm, sc);
    Mat& s = S[sm];
    for (int r = 0; r < d.rows; r++) for (int c = 0; c < d.cols; c++) std::memcpy(d.data + d.step.buf[0] * r + c * d.elemSize() + dc * e1, s.data + s.step.buf[0] * r + c * s.elemSize() + sc * e1, e1);
  }
}
void flip(InputArray s, OutputArray d, int code) { Call c("flip"); c.in(s).out(d).i(code).run(); }
void rotate(InputArray s, OutputArray d, int code) { Call c("rotate"); c.in(s).out(d).i(code).run(); }
void transpose(InputArray s, OutputArray d) { Call c("transpose"); c.in(s).out(d).run(); }
void repeat(InputArray s, int ny, int nx, OutputArray d) { Call c("repeat"); c.in(s).i(ny).i(nx).out(d).run(); }
Mat repeat(const Mat& s, int ny, int nx) { Mat d; repeat(s, ny, nx, d); return d; }
void hconcat(InputArray a, InputArray b, OutputArray d) { std::vector<Mat> v{ a.getMat(), b.getMat() }; hconcat(v, d); }
void hconcat(InputArrayOfArrays src, OutputArray d) { Call c("hconcat"); c.in(src).out(d).run(); }
void hconcat(const Mat* src, size_t n, OutputArray d) { std::vector<Mat> v(src, src + n); hconcat(v, d); }
void vconcat(InputArray a, InputArray b, OutputArray d) { std::vector<Mat> v{ a.getMat(), b.getMat() }; vconcat(v, d); }
void vconcat(InputArrayOfArrays src, OutputArray d) { Call c("vconcat"); c.in(src).out(d).run(); }
void vconcat(const Mat* src, size_t n, OutputArray d) { std::vector<Mat> v(src, src + n); vconcat(v, d); }
void copyMakeBorder(InputArray s, OutputArray d, int top, int bottom, int left, int right, int bt, const Scalar& v) { Call c("copyMakeBorder"); c.in(s).out(d).i(top).i(bottom).i(left).i(right).i(bt).sc(v).run(); }
void LUT(InputArray s, InputArray lut, OutputArray d) { Call c("LUT"); c.in(s).in(lut).out(d).run(); }
void gemm(InputArray a, InputArray b, double alpha, InputArray c3, double beta, OutputArray d, int flags) { Call c("gemm"); c.in(a).in(b).d(alpha).in(c3).d(beta).out(d).i(flags).run(); }
double invert(InputArray s, OutputArray d, int flags) { Call c("invert"); c.in(s).out(d).i(flags).run(); return c.ret(0); }
double determinant(InputArray m) { Call c("determinant"); c.in(m).run(); return c.ret(0); }
bool solve(InputArray a, InputArray b, OutputArray d, int flags) { Call c("solve"); c.in(a).in(b).out(d).i(flags).run(); return c.ret(0) != 0; }
bool eigen(InputArray s, OutputArray vals, OutputArray vecs) { Call c("eigen"); c.in(s).out(vals).out(vecs).run(); return c.ret(0) != 0; }
double trace(InputArray m) { Mat a = m.getMat(); double s = 0; for (int k = 0; k < std::min(a.rows, a.cols); k++) s += getElem(a.data + a.step.buf[0] * k + a.elemSize() * k, a.depth()); return s; }
void reduce(InputArray s, OutputArray d, int dim, int rtype, int dtype) { Call c("reduce"); c.in(s).out(d).i(dim).i(rtype).i(dtype).run(); }
void setIdentity(InputOutputArray m, const Scalar& s) {
  Mat& a = m.getMatRef();
  a.setTo(Scalar::all(0));
  for (int k = 0; k < std::min(a.rows, a.cols); k++) for (int ch = 0; ch < a.channels(); ch++) putElem(a.data + a.step.buf[0] * k + a.elemSize() * k + ch * a.elemSize1(), a.depth(), s[ch < 4 ? ch : 0]);
}
void dft(InputArray s, OutputArray d, int flags, int nz) { Call c("dft"); c.in(s).out(d).i(flags).i(nz).run(); }
void idft(InputArray s, OutputArray d, int flags, int nz) { dft(s, d, flags | DFT_INVERSE, nz); }
int getOptimalDFTSize(int n) { Call c("getOptimalDFTSize"); c.i(n).run(); return (int)c.ret(0); }
double kmeans(InputArray data, int K, InputOutputArray labels, TermCriteria tc, int attempts, int flags, OutputArray centers) {
  Call c("kmeans");
  Mat cur = labels.okind == _OutputArray::O_MAT ? *(Mat*)labels.dst : Mat();
  c.in(data).i(K).out(labels).m(cur).tc(tc).i(attempts).i(flags).out(centers).run();
  return c.ret(0);
}
void sort(InputArray s, OutputArray d, int flags) { Call c("sort"); c.in(s).out(d).i(flags).run(); }
void sortIdx(InputArray s, OutputArray d, int flags) { Call c("sortIdx"); c.in(s).out(d).i(flags).run(); }
void patchNaNs(InputOutputArray a, double v) {
  Mat& m = a.getMatRef();
  for (int r = 0; r < m.rows; r++) for (int c = 0; c < m.cols * m.channels(); c++) {
    uchar* p = m.data + m.step.buf[0] * r + c * m.elemSize1();
    if (m.depth() == CV_32F && std::isnan(*(float*)p)) *(float*)p = (float)v;
    if (m.depth() == CV_64F && std::isnan(*(double*)p)) *(double*)p = v;
  }
}
bool checkRange(InputArray a, bool quiet, Point* pos, double minVal, double maxVal) {
  Mat m = a.getMat();
  for (int r = 0; r < m.rows; r++) for (int c = 0; c < m.cols * m.channels(); c++) {
    double v = getElem(m.data + m.step.buf[0] * r + c * m.elemSize1(), m.depth());
    if (std::isnan(v) || v < minVal || v >= maxVal) {
      if (pos) *pos = Point(c / m.channels(), r);
      if (!quiet) cv::error(Error::StsOutOfRange, "the value is out of range", "checkRange", "mathfuncs.cpp", 0);
      return false;
    }
  }
  return true;
}

// ================================================================ imgproc
void cvtColor(InputArray s, OutputArray d, int code, int dcn) { Call c("cvtColor"); c.in(s).out(d).i(code).i(dcn).run(); }
double threshold(InputArray s, OutputArray d, double t, double mv, int type) { Call c("threshold"); c.in(s).out(d).d(t).d(mv).i(type).run(); return c.ret(0); }
void adaptiveThreshold(InputArray s, OutputArray d, double mv, int m, int t, int bs, double C) { Call c("adaptiveThreshold"); c.in(s).out(d).d(mv).i(m).i(t).i(bs).d(C).run(); }
void blur(InputArray s, OutputArray d, Size k, Point a, int bt) { Call c("blur"); c.in(s).out(d).sz(k).pti(a).i(bt).run(); }
void boxFilter(InputArray s, OutputArray d, int dd, Size k, Point a, bool nrm, int bt) { Call c("boxFilter"); c.in(s).out(d).i(dd).sz(k).pti(a).b(nrm).i(bt).run(); }
void GaussianBlur(InputArray s, OutputArray d, Size k, double sx, double sy, int bt) { Call c("GaussianBlur"); c.in(s).out(d).sz(k).d(sx).d(sy).i(bt).run(); }
void medianBlur(InputArray s, OutputArray d, int k) { Call c("medianBlur"); c.in(s).out(d).i(k).run(); }
void bilateralFilter(InputArray s, OutputArray d, int dd, double sc, double ss, int bt) { Call c("bilateralFilter"); c.in(s).out(d).i(dd).d(sc).d(ss).i(bt).run(); }
void filter2D(InputArray s, OutputArray d, int dd, InputArray k, Point a, double delta, int bt) { Call c("filter2D"); c.in(s).out(d).i(dd).in(k).pti(a).d(delta).i(bt).run(); }
void sepFilter2D(InputArray s, OutputArray d, int dd, InputArray kx, InputArray ky, Point a, double delta, int bt) { Call c("sepFilter2D"); c.in(s).out(d).i(dd).in(kx).in(ky).pti(a).d(delta).i(bt).run(); }
Mat getGaussianKernel(int n, double sigma, int ktype) {
  static const float small[4][7] = { { 1.f }, { 0.25f, 0.5f, 0.25f }, { 0.0625f, 0.25f, 0.375f, 0.25f, 0.0625f }, { 0.03125f, 0.109375f, 0.21875f, 0.28125f, 0.21875f, 0.109375f, 0.03125f } };
  const float* fixed = n % 2 == 1 && n <= 7 && sigma <= 0 ? small[n >> 1] : nullptr;
  Mat k(n, 1, CV_64F);
  double* c = (double*)k.data;
  double sigmaX = sigma > 0 ? sigma : ((n - 1) * 0.5 - 1) * 0.3 + 0.8;
  double scale2X = -0.5 / (sigmaX * sigmaX), s = 0;
  for (int i = 0; i < n; i++) {
    double x = i - (n - 1) * 0.5;
    double t = fixed ? (double)fixed[i] : std::exp(scale2X * x * x);
    c[i] = t; s += t;
  }
  for (int i = 0; i < n; i++) c[i] /= s;
  Mat out; k.convertTo(out, ktype);
  return out;
}
void Sobel(InputArray s, OutputArray d, int dd, int dx, int dy, int k, double sc, double delta, int bt) { Call c("Sobel"); c.in(s).out(d).i(dd).i(dx).i(dy).i(k).d(sc).d(delta).i(bt).run(); }
void Scharr(InputArray s, OutputArray d, int dd, int dx, int dy, double sc, double delta, int bt) { Call c("Scharr"); c.in(s).out(d).i(dd).i(dx).i(dy).d(sc).d(delta).i(bt).run(); }
void Laplacian(InputArray s, OutputArray d, int dd, int k, double sc, double delta, int bt) { Call c("Laplacian"); c.in(s).out(d).i(dd).i(k).d(sc).d(delta).i(bt).run(); }
void Canny(InputArray s, OutputArray d, double t1, double t2, int ap, bool l2) { Call c("Canny"); c.in(s).out(d).d(t1).d(t2).i(ap).b(l2).run(); }
void cornerHarris(InputArray s, OutputArray d, int bs, int k, double kk, int bt) { Call c("cornerHarris"); c.in(s).out(d).i(bs).i(k).d(kk).i(bt).run(); }
void cornerMinEigenVal(InputArray s, OutputArray d, int bs, int k, int bt) { Call c("cornerMinEigenVal"); c.in(s).out(d).i(bs).i(k).i(bt).run(); }
void goodFeaturesToTrack(InputArray img, OutputArray corners, int maxC, double q, double md, InputArray mask, int bs, bool harris, double k) {
  Call c("goodFeaturesToTrack"); c.in(img).out(corners).i(maxC).d(q).d(md).in(mask).i(bs).b(harris).d(k).run();
}
void cornerSubPix(InputArray img, InputOutputArray corners, Size win, Size zz, TermCriteria tc) {
  Call c("cornerSubPix"); c.in(img).in(corners).out(corners).sz(win).sz(zz).tc(tc).run();
}
Mat getStructuringElement(int shape, Size k, Point a) { Mat d; Call c("getStructuringElement"); c.i(shape).sz(k).pti(a).out(d).run(); return d; }
void erode(InputArray s, OutputArray d, InputArray k, Point a, int it, int bt, const Scalar& bv) { Call c("erode"); c.in(s).out(d).in(k).pti(a).i(it).i(bt).sc(bv).run(); }
void dilate(InputArray s, OutputArray d, InputArray k, Point a, int it, int bt, const Scalar& bv) { Call c("dilate"); c.in(s).out(d).in(k).pti(a).i(it).i(bt).sc(bv).run(); }
void morphologyEx(InputArray s, OutputArray d, int op, InputArray k, Point a, int it, int bt, const Scalar& bv) { Call c("morphologyEx"); c.in(s).out(d).i(op).in(k).pti(a).i(it).i(bt).sc(bv).run(); }
void resize(InputArray s, OutputArray d, Size ds, double fx, double fy, int interp) { Call c("resize"); c.in(s).out(d).sz(ds).d(fx).d(fy).i(interp).run(); }
void warpAffine(InputArray s, OutputArray d, InputArray M, Size ds, int f, int bm, const Scalar& bv) { Call c("warpAffine"); c.in(s).out(d).in(M).sz(ds).i(f).i(bm).sc(bv).run(); }
void warpPerspective(InputArray s, OutputArray d, InputArray M, Size ds, int f, int bm, const Scalar& bv) { Call c("warpPerspective"); c.in(s).out(d).in(M).sz(ds).i(f).i(bm).sc(bv).run(); }
void remap(InputArray s, OutputArray d, InputArray m1, InputArray m2, int interp, int bm, const Scalar& bv) { Call c("remap"); c.in(s).out(d).in(m1).in(m2).i(interp).i(bm).sc(bv).run(); }
Mat getRotationMatrix2D(Point2f center, double angle, double scale) {
  angle *= CV_PI / 180;
  double alpha = std::cos(angle) * scale, beta = std::sin(angle) * scale;
  Mat M(2, 3, CV_64F);
  double* m = (double*)M.data;
  m[0] = alpha; m[1] = beta; m[2] = (1 - alpha) * center.x - beta * center.y;
  m[3] = -beta; m[4] = alpha; m[5] = beta * center.x + (1 - alpha) * center.y;
  return M;
}
Mat getAffineTransform(InputArray s, InputArray d) { Mat M; Call c("getAffineTransform"); c.in(s).in(d).out(M).run(); return M; }
Mat getAffineTransform(const Point2f s[], const Point2f d[]) { std::vector<Point2f> a(s, s + 3), b(d, d + 3); return getAffineTransform(a, b); }
Mat getPerspectiveTransform(InputArray s, InputArray d, int m) { Mat M; Call c("getPerspectiveTransform"); c.in(s).in(d).out(M).i(m).run(); return M; }
Mat getPerspectiveTransform(const Point2f s[], const Point2f d[], int m) { std::vector<Point2f> a(s, s + 4), b(d, d + 4); return getPerspectiveTransform(a, b, m); }
void invertAffineTransform(InputArray M, OutputArray iM) { Call c("invertAffineTransform"); c.in(M).out(iM).run(); }
void getRectSubPix(InputArray img, Size ps, Point2f center, OutputArray patch, int pt) { Call c("getRectSubPix"); c.in(img).sz(ps).pt(center).out(patch).i(pt).run(); }
void warpPolar(InputArray s, OutputArray d, Size ds, Point2f center, double r, int f) { Call c("warpPolar"); c.in(s).out(d).sz(ds).pt(center).d(r).i(f).run(); }
void pyrDown(InputArray s, OutputArray d, const Size& ds, int bt) { Call c("pyrDown"); c.in(s).out(d).sz(ds).i(bt).run(); }
void pyrUp(InputArray s, OutputArray d, const Size& ds, int bt) { Call c("pyrUp"); c.in(s).out(d).sz(ds).i(bt).run(); }
void equalizeHist(InputArray s, OutputArray d) { Call c("equalizeHist"); c.in(s).out(d).run(); }
void calcHist(InputArrayOfArrays images, const std::vector<int>& channels, InputArray mask, OutputArray hist, const std::vector<int>& histSize, const std::vector<float>& ranges, bool accumulate) {
  std::vector<double> rg(ranges.begin(), ranges.end());
  Mat cur = hist.okind == _OutputArray::O_MAT ? *(Mat*)hist.dst : Mat();
  Call c("calcHist");
  c.in(images).ints(channels.data(), (int)channels.size()).in(mask).out(hist).ints(histSize.data(), (int)histSize.size()).dblv(rg.data(), (int)rg.size()).b(accumulate).m(cur).run();
}
void calcHist(const Mat* images, int nimages, const int* channels, InputArray mask, OutputArray hist, int dims, const int* histSize, const float** ranges, bool uniform, bool accumulate) {
  if (!uniform) notSupported("calcHist(uniform=false)");
  std::vector<Mat> imgs(images, images + nimages);
  std::vector<int> ch(channels, channels + dims), hs(histSize, histSize + dims);
  std::vector<float> rg;
  for (int k = 0; k < dims; k++) { rg.push_back(ranges[k][0]); rg.push_back(ranges[k][1]); }
  calcHist(imgs, ch, mask, hist, hs, rg, accumulate);
}
void calcBackProject(InputArrayOfArrays images, const std::vector<int>& channels, InputArray hist, OutputArray dst, const std::vector<float>& ranges, double scale) {
  std::vector<double> rg(ranges.begin(), ranges.end());
  Call c("calcBackProject");
  c.in(images).ints(channels.data(), (int)channels.size()).in(hist).out(dst).dblv(rg.data(), (int)rg.size()).d(scale).run();
}
void calcBackProject(const Mat* images, int nimages, const int* channels, InputArray hist, OutputArray backProject, const float** ranges, double scale, bool uniform) {
  (void)uniform;
  std::vector<Mat> imgs(images, images + nimages);
  Mat h = hist.getMat();
  int dims = h.cols > 1 && h.rows > 1 ? 2 : 1;
  std::vector<int> ch(channels, channels + dims);
  std::vector<float> rg;
  for (int k = 0; k < dims; k++) { rg.push_back(ranges[k][0]); rg.push_back(ranges[k][1]); }
  calcBackProject(imgs, ch, hist, backProject, rg, scale);
}
double compareHist(InputArray a, InputArray b, int m) { Call c("compareHist"); c.in(a).in(b).i(m).run(); return c.ret(0); }
void integral(InputArray s, OutputArray sum, int sd) { Call c("integral"); c.in(s).out(sum).i(sd).run(); }
void integral(InputArray s, OutputArray sum, OutputArray sq, int sd, int sqd) { Call c("integral2"); c.in(s).out(sum).out(sq).i(sd).i(sqd).run(); }
void distanceTransform(InputArray s, OutputArray d, int dt, int ms, int dstType) { Call c("distanceTransform"); c.in(s).out(d).i(dt).i(ms).i(dstType).run(); }
void distanceTransform(InputArray s, OutputArray d, OutputArray labels, int dt, int ms, int lt) { Call c("distanceTransformWithLabels"); c.in(s).out(d).out(labels).i(dt).i(ms).i(lt).run(); }
int connectedComponents(InputArray img, OutputArray labels, int conn, int lt) { Call c("connectedComponents"); c.in(img).out(labels).i(conn).i(lt).run(); return (int)c.ret(0); }
int connectedComponentsWithStats(InputArray img, OutputArray labels, OutputArray stats, OutputArray cent, int conn, int lt) {
  Call c("connectedComponentsWithStats"); c.in(img).out(labels).out(stats).out(cent).i(conn).i(lt).run(); return (int)c.ret(0);
}
void findContours(InputArray img, OutputArrayOfArrays contours, OutputArray hierarchy, int mode, int method, Point off) {
  Call c("findContours"); c.in(img).out(contours).out(hierarchy).i(mode).i(method).pti(off).run();
}
void findContours(InputArray img, OutputArrayOfArrays contours, int mode, int method, Point off) { findContours(img, contours, noArray(), mode, method, off); }
void drawContours(InputOutputArray img, InputArrayOfArrays contours, int idx, const Scalar& color, int th, int lt, InputArray hier, int maxLevel, Point off) {
  Call c("drawContours"); c.m(img.getMatRef()).in(contours).i(idx).sc(color).i(th).i(lt).in(hier).i(maxLevel).pti(off).out(img).run();
}
double contourArea(InputArray ct, bool oriented) { Call c("contourArea"); c.in(ct).b(oriented).run(); return c.ret(0); }
double arcLength(InputArray ct, bool closed) { Call c("arcLength"); c.in(ct).b(closed).run(); return c.ret(0); }
void approxPolyDP(InputArray ct, OutputArray approx, double eps, bool closed) { Call c("approxPolyDP"); c.in(ct).out(approx).d(eps).b(closed).run(); }
Rect boundingRect(InputArray a) { Call c("boundingRect"); c.in(a).run(); return Rect((int)c.ret(0), (int)c.ret(1), (int)c.ret(2), (int)c.ret(3)); }
static RotatedRect retRR(const Call& c, int o = 0) { return RotatedRect(Point2f((float)c.ret(o), (float)c.ret(o + 1)), Size2f((float)c.ret(o + 2), (float)c.ret(o + 3)), (float)c.ret(o + 4)); }
RotatedRect minAreaRect(InputArray p) { Call c("minAreaRect"); c.in(p).run(); return retRR(c); }
void boxPoints(RotatedRect box, OutputArray pts) {
  Point2f p[4];
  box.points(p);
  Mat m(4, 2, CV_32F);
  for (int k = 0; k < 4; k++) { m.at<float>(k, 0) = p[k].x; m.at<float>(k, 1) = p[k].y; }
  if (pts.okind == _OutputArray::O_VEC) pts.assign(m.reshape(2, 4)); else pts.assign(m);
}
void minEnclosingCircle(InputArray p, Point2f& center, float& radius) { Call c("minEnclosingCircle"); c.in(p).run(); center = Point2f((float)c.ret(0), (float)c.ret(1)); radius = (float)c.ret(2); }
double minEnclosingTriangle(InputArray p, OutputArray tri) { Call c("minEnclosingTriangle"); c.in(p).out(tri).run(); return c.ret(0); }
RotatedRect fitEllipse(InputArray p) { Call c("fitEllipse"); c.in(p).run(); return retRR(c); }
void fitLine(InputArray p, OutputArray line, int dt, double param, double reps, double aeps) { Call c("fitLine"); c.in(p).out(line).i(dt).d(param).d(reps).d(aeps).run(); }
void convexHull(InputArray p, OutputArray hull, bool cw, bool rp) {
  bool wantIdx = hull.okind == _OutputArray::O_VEC && CV_MAT_DEPTH(hull.vtype) == CV_32S && CV_MAT_CN(hull.vtype) == 1;
  Call c("convexHull"); c.in(p).out(hull).b(cw).b(wantIdx ? false : rp).run();
}
void convexityDefects(InputArray ct, InputArray hull, OutputArray defects) { Call c("convexityDefects"); c.in(ct).in(hull).out(defects).run(); }
bool isContourConvex(InputArray ct) { Call c("isContourConvex"); c.in(ct).run(); return c.ret(0) != 0; }
Moments moments(InputArray a, bool bin) {
  Call c("moments"); c.in(a).b(bin).run();
  Moments m;
  double* p = &m.m00;
  for (int k = 0; k < 24; k++) p[k] = c.ret(k);
  return m;
}
void HuMoments(const Moments& m, double hu[7]) {
  double t0 = m.nu30 + m.nu12, t1 = m.nu21 + m.nu03;
  double q0 = t0 * t0, q1 = t1 * t1;
  double n4 = 4 * m.nu11;
  double s = m.nu20 + m.nu02, d = m.nu20 - m.nu02;
  hu[0] = s;
  hu[1] = d * d + n4 * m.nu11;
  hu[3] = q0 + q1;
  hu[5] = d * (q0 - q1) + n4 * t0 * t1;
  t0 *= q0 - 3 * q1;
  t1 *= 3 * q0 - q1;
  q0 = m.nu30 - 3 * m.nu12;
  q1 = 3 * m.nu21 - m.nu03;
  hu[2] = q0 * q0 + q1 * q1;
  hu[4] = q0 * t0 + q1 * t1;
  hu[6] = q1 * t0 - q0 * t1;
}
void HuMoments(const Moments& m, OutputArray hu) { Mat h(7, 1, CV_64F); HuMoments(m, (double*)h.data); hu.assign(h); }
double matchShapes(InputArray a, InputArray b, int method, double param) { Call c("matchShapes"); c.in(a).in(b).i(method).d(param).run(); return c.ret(0); }
double pointPolygonTest(InputArray ct, Point2f pt, bool md) { Call c("pointPolygonTest"); c.in(ct).pt(pt).b(md).run(); return c.ret(0); }
int rotatedRectangleIntersection(const RotatedRect& a, const RotatedRect& b, OutputArray region) { Call c("rotatedRectangleIntersection"); c.rr(a).rr(b).out(region).run(); return (int)c.ret(0); }
void HoughLines(InputArray img, OutputArray lines, double rho, double theta, int th, double srn, double stn, double mint, double maxt) {
  Call c("HoughLines"); c.in(img).out(lines).d(rho).d(theta).i(th).d(srn).d(stn).d(mint).d(maxt).run();
}
void HoughLinesP(InputArray img, OutputArray lines, double rho, double theta, int th, double minLen, double maxGap) {
  Call c("HoughLinesP"); c.in(img).out(lines).d(rho).d(theta).i(th).d(minLen).d(maxGap).run();
}
void HoughCircles(InputArray img, OutputArray circles, int method, double dp, double md, double p1, double p2, int minR, int maxR) {
  Call c("HoughCircles"); c.in(img).out(circles).i(method).d(dp).d(md).d(p1).d(p2).i(minR).i(maxR).run();
}
void matchTemplate(InputArray img, InputArray tpl, OutputArray res, int method, InputArray mask) { Call c("matchTemplate"); c.in(img).in(tpl).out(res).i(method).in(mask).run(); }
int floodFill(InputOutputArray img, InputOutputArray mask, Point seed, Scalar nv, Rect* rect, Scalar lo, Scalar up, int flags) {
  Mat& m = img.getMatRef();
  Mat mk = mask.needed() ? mask.getMatRef() : Mat();
  Call c("floodFill"); c.m(m).out(img).m(mk).out(mask).pti(seed).sc(nv).sc(lo).sc(up).i(flags).run();
  if (rect) *rect = Rect((int)c.ret(1), (int)c.ret(2), (int)c.ret(3), (int)c.ret(4));
  return (int)c.ret(0);
}
int floodFill(InputOutputArray img, Point seed, Scalar nv, Rect* rect, Scalar lo, Scalar up, int flags) { return floodFill(img, noArray(), seed, nv, rect, lo, up, flags); }
void watershed(InputArray img, InputOutputArray markers) { Call c("watershed"); c.in(img).m(markers.getMatRef()).out(markers).run(); }
void grabCut(InputArray img, InputOutputArray mask, Rect rect, InputOutputArray bgd, InputOutputArray fgd, int it, int mode) {
  Call c("grabCut"); c.in(img).m(mask.getMatRef()).out(mask).rc(rect).m(bgd.getMatRef()).out(bgd).m(fgd.getMatRef()).out(fgd).i(it).i(mode).run();
}
void applyColorMap(InputArray s, OutputArray d, int cm) { Call c("applyColorMap"); c.in(s).out(d).i(cm).run(); }
void demosaicing(InputArray s, OutputArray d, int code, int dcn) { cvtColor(s, d, code, dcn); }
void accumulate(InputArray s, InputOutputArray d, InputArray mask) { Mat& D = d.getMatRef(); Mat t; s.getMat().convertTo(t, D.depth()); add(D, t, D, mask); }
void accumulateWeighted(InputArray s, InputOutputArray d, double alpha, InputArray mask) {
  Mat& D = d.getMatRef(); Mat t; s.getMat().convertTo(t, D.depth());
  Mat r; addWeighted(D, 1 - alpha, t, alpha, 0, r);
  r.copyTo(D, mask);
}
Point2d phaseCorrelate(InputArray a, InputArray b, InputArray win, double* resp) {
  Call c("phaseCorrelate"); c.in(a).in(b).in(win).run();
  if (resp) *resp = c.ret(2);
  return Point2d(c.ret(0), c.ret(1));
}

CLAHE::CLAHE(double c, Size t) : handle(0), clip(c), tiles(t) { Call k("CLAHE_create"); k.d(c).sz(t).run(); handle = (int)k.ret(0); }
CLAHE::~CLAHE() { if (handle) { Call k("release"); k.i(handle); try { k.run(); } catch (...) {} } }
void CLAHE::apply(InputArray s, OutputArray d) { Call c("CLAHE_apply"); c.i(handle).in(s).out(d).run(); }
void CLAHE::setClipLimit(double c) { clip = c; Call k("CLAHE_set"); k.i(handle).d(clip).sz(tiles).run(); }
void CLAHE::setTilesGridSize(Size t) { tiles = t; Call k("CLAHE_set"); k.i(handle).d(clip).sz(tiles).run(); }
Ptr<CLAHE> createCLAHE(double clip, Size tiles) { return makePtr<CLAHE>(clip, tiles); }

// 그리기
void line(InputOutputArray img, Point a, Point b, const Scalar& col, int th, int lt, int sh) { Call c("line"); c.m(img.getMatRef()).pti(a).pti(b).sc(col).i(th).i(lt).i(sh).out(img).run(); }
void arrowedLine(InputOutputArray img, Point a, Point b, const Scalar& col, int th, int lt, int sh, double tip) { Call c("arrowedLine"); c.m(img.getMatRef()).pti(a).pti(b).sc(col).i(th).i(lt).i(sh).d(tip).out(img).run(); }
void rectangle(InputOutputArray img, Point a, Point b, const Scalar& col, int th, int lt, int sh) { Call c("rectangle"); c.m(img.getMatRef()).pti(a).pti(b).sc(col).i(th).i(lt).i(sh).out(img).run(); }
void rectangle(InputOutputArray img, Rect r, const Scalar& col, int th, int lt, int sh) { rectangle(img, r.tl(), Point(r.x + r.width - 1, r.y + r.height - 1), col, th, lt, sh); }
void circle(InputOutputArray img, Point ctr, int rad, const Scalar& col, int th, int lt, int sh) {
  if (rad < 0) cv::error(Error::StsAssert, "radius >= 0 && thickness <= MAX_THICKNESS && 0 <= shift && shift <= XY_SHIFT", "circle", "drawing.cpp", 0);
  Call c("circle"); c.m(img.getMatRef()).pti(ctr).i(rad).sc(col).i(th).i(lt).i(sh).out(img).run();
}
void ellipse(InputOutputArray img, Point ctr, Size axes, double ang, double sa, double ea, const Scalar& col, int th, int lt, int sh) {
  Call c("ellipse"); c.m(img.getMatRef()).pti(ctr).sz(axes).d(ang).d(sa).d(ea).sc(col).i(th).i(lt).i(sh).out(img).run();
}
void ellipse(InputOutputArray img, const RotatedRect& box, const Scalar& col, int th, int lt) { Call c("ellipseBox"); c.m(img.getMatRef()).rr(box).sc(col).i(th).i(lt).out(img).run(); }
void drawMarker(InputOutputArray img, Point pos, const Scalar& col, int mt, int ms, int th, int lt) { Call c("drawMarker"); c.m(img.getMatRef()).pti(pos).sc(col).i(mt).i(ms).i(th).i(lt).out(img).run(); }
void fillConvexPoly(InputOutputArray img, InputArray pts, const Scalar& col, int lt, int sh) { Call c("fillConvexPoly"); c.m(img.getMatRef()).in(pts).sc(col).i(lt).i(sh).out(img).run(); }
void fillPoly(InputOutputArray img, InputArrayOfArrays pts, const Scalar& col, int lt, int sh, Point off) { Call c("fillPoly"); c.m(img.getMatRef()).in(pts).sc(col).i(lt).i(sh).pti(off).out(img).run(); }
void polylines(InputOutputArray img, InputArrayOfArrays pts, bool closed, const Scalar& col, int th, int lt, int sh) { Call c("polylines"); c.m(img.getMatRef()).in(pts).b(closed).sc(col).i(th).i(lt).i(sh).out(img).run(); }
void putText(InputOutputArray img, const std::string& text, Point org, int ff, double fs, Scalar col, int th, int lt, bool bl) {
  Call c("putText"); c.m(img.getMatRef()).s(text).pti(org).i(ff).d(fs).sc(col).i(th).i(lt).b(bl).out(img).run();
}
Size getTextSize(const std::string& text, int ff, double fs, int th, int* baseLine) {
  Call c("getTextSize"); c.s(text).i(ff).d(fs).i(th).run();
  if (baseLine) *baseLine = (int)c.ret(2);
  return Size((int)c.ret(0), (int)c.ret(1));
}
double getFontScaleFromHeight(int ff, int ph, int th) { Call c("getFontScaleFromHeight"); c.i(ff).i(ph).i(th).run(); return c.ret(0); }
bool clipLine(Rect r, Point& a, Point& b) {
  Point o = r.tl();
  Point p1 = a - o, p2 = b - o;
  bool ok = clipLine(Size(r.width, r.height), p1, p2);
  a = p1 + o; b = p2 + o;
  return ok;
}
bool clipLine(Size s, Point& a, Point& b) {
  Call c("clipLine"); c.sz(s).pti(a).pti(b).run();
  a = Point((int)c.ret(1), (int)c.ret(2)); b = Point((int)c.ret(3), (int)c.ret(4));
  return c.ret(0) != 0;
}

// ================================================================ imgcodecs · highgui
Mat imread(const std::string& fn, int flags) { Mat m; Call c("imread"); c.s(fn).i(flags).out(m).run(); return m; }
bool imwrite(const std::string& fn, InputArray img, const std::vector<int>& params) { (void)params; Call c("imwrite"); c.s(fn).in(img).run(); return c.ret(0) != 0; }
bool haveImageReader(const std::string& fn) { Call c("haveImageReader"); c.s(fn).run(); return c.ret(0) != 0; }
bool imencode(const std::string& ext, InputArray img, std::vector<uchar>& buf, const std::vector<int>& params) {
  (void)params; Call c("imencode"); c.s(ext).in(img).out(buf).run(); return c.ret(0) != 0;
}
Mat imdecode(InputArray buf, int flags) { Mat m; Call c("imdecode"); c.in(buf).i(flags).out(m).run(); return m; }
void imshow(const std::string& name, InputArray img) { Call c("imshow"); c.s(name).in(img).run(); }
int waitKey(int delay) { std::cout.flush(); std::cerr.flush(); std::fflush(stdout); Call c("waitKey"); c.i(delay).run(); return (int)c.ret(0); }
int waitKeyEx(int delay) { return waitKey(delay); }
int pollKey() { return waitKey(1); }
void namedWindow(const std::string& name, int flags) { Call c("namedWindow"); c.s(name).i(flags).run(); }
void destroyWindow(const std::string& name) { Call c("destroyWindow"); c.s(name).run(); }
void destroyAllWindows() { Call c("destroyAllWindows"); c.run(); }
void moveWindow(const std::string&, int, int) {}
void resizeWindow(const std::string&, int, int) {}
void setWindowTitle(const std::string&, const std::string&) {}
void setMouseCallback(const std::string&, MouseCallback, void*) { notSupported("setMouseCallback (마우스 이벤트)"); }
static std::map<std::string, int*>& trackbars() { static std::map<std::string, int*> m; return m; }
int createTrackbar(const std::string& tn, const std::string& wn, int* value, int count, TrackbarCallback cb, void* ud) {
  (void)count; (void)cb; (void)ud;
  trackbars()[wn + "/" + tn] = value;
  notSupported("createTrackbar (트랙바)");
  return 0;
}
int getTrackbarPos(const std::string& tn, const std::string& wn) { auto it = trackbars().find(wn + "/" + tn); return it != trackbars().end() && it->second ? *it->second : 0; }
void setTrackbarPos(const std::string& tn, const std::string& wn, int pos) { auto it = trackbars().find(wn + "/" + tn); if (it != trackbars().end() && it->second) *it->second = pos; }
Rect selectROI(const std::string&, InputArray, bool, bool, bool) { notSupported("selectROI (마우스로 영역 선택)"); return Rect(); }

// ================================================================ videoio
VideoCapture::VideoCapture() : handle(0) {}
VideoCapture::VideoCapture(int index, int api) : handle(0) { open(index, api); }
VideoCapture::VideoCapture(const std::string& fn, int api) : handle(0) { open(fn, api); }
VideoCapture::~VideoCapture() { release(); }
bool VideoCapture::open(int index, int) { release(); Call c("vc_open"); c.i(1).i(index).s("").run(); handle = (int)c.ret(0); return handle != 0; }
bool VideoCapture::open(const std::string& fn, int) { release(); Call c("vc_open"); c.i(0).i(0).s(fn).run(); handle = (int)c.ret(0); return handle != 0; }
bool VideoCapture::isOpened() const { return handle != 0; }
void VideoCapture::release() { if (handle) { Call c("release"); c.i(handle); try { c.run(); } catch (...) {} handle = 0; } }
bool VideoCapture::grab() { if (!handle) return false; Call c("vc_read"); c.i(handle).out(grabbed).run(); return c.ret(0) != 0; }
bool VideoCapture::retrieve(OutputArray image, int) { if (grabbed.empty()) { image.release(); return false; } grabbed.copyTo(image); return true; }
bool VideoCapture::read(OutputArray image) {
  if (!handle) { image.release(); return false; }
  Call c("vc_read"); c.i(handle).out(image).run();
  bool ok = c.ret(0) != 0;
  if (!ok) image.release();
  return ok;
}
VideoCapture& VideoCapture::operator>>(Mat& image) { read(image); return *this; }
bool VideoCapture::set(int prop, double v) { if (!handle) return false; Call c("vc_set"); c.i(handle).i(prop).d(v).run(); return c.ret(0) != 0; }
double VideoCapture::get(int prop) const { if (!handle) return 0; Call c("vc_get"); c.i(handle).i(prop).run(); return c.ret(0); }
bool VideoWriter::open(const std::string& fn, int fourcc, double fps, Size fs, bool isColor) {
  (void)fourcc; (void)isColor;
  name = fn; frames = 0; opened = true;
  Call c("vw_open"); c.s(fn).d(fps).sz(fs).run();
  return true;
}
void VideoWriter::write(InputArray image) { if (!opened) return; frames++; Call c("vw_write"); c.s(name).i(frames).in(image).run(); }
void VideoWriter::release() { if (opened) { opened = false; Call c("vw_release"); c.s(name).i(frames); try { c.run(); } catch (...) {} } }

// ================================================================ features
Algorithm::~Algorithm() { if (handle) { Call c("release"); c.i(handle); try { c.run(); } catch (...) {} handle = 0; } }
void Feature2D::detect(InputArray img, std::vector<KeyPoint>& kps, InputArray mask) { Call c("f2d_detect"); c.i(handle).in(img).out(kps).in(mask).run(); }
void Feature2D::compute(InputArray img, std::vector<KeyPoint>& kps, OutputArray desc) { Call c("f2d_compute"); c.i(handle).in(img).in(kps).out(kps).out(desc).run(); }
void Feature2D::detectAndCompute(InputArray img, InputArray mask, std::vector<KeyPoint>& kps, OutputArray desc, bool useProvided) {
  if (useProvided) { compute(img, kps, desc); return; }
  Call c("f2d_detectAndCompute"); c.i(handle).in(img).in(mask).out(kps).out(desc).run();
}
Ptr<ORB> ORB::create(int nf, float sf, int nl, int et, int fl, int wta, ORB::ScoreType st, int ps, int ft) {
  auto p = makePtr<ORB>();
  Call c("ORB_create"); c.i(nf).d(sf).i(nl).i(et).i(fl).i(wta).i((int)st).i(ps).i(ft).run();
  p->handle = (int)c.ret(0); p->nfeatures = nf;
  return p;
}
void ORB::setMaxFeatures(int n) { nfeatures = n; Call c("ORB_setMaxFeatures"); c.i(handle).i(n).run(); }
Ptr<FastFeatureDetector> FastFeatureDetector::create(int th, bool nms, FastFeatureDetector::DetectorType t) {
  auto p = makePtr<FastFeatureDetector>();
  Call c("FAST_create"); c.i(th).b(nms).i((int)t).run();
  p->handle = (int)c.ret(0);
  return p;
}
Ptr<GFTTDetector> GFTTDetector::create(int mc, double q, double md, int bs, bool h, double k) {
  auto p = makePtr<GFTTDetector>();
  Call c("GFTT_create"); c.i(mc).d(q).d(md).i(bs).b(h).d(k).run();
  p->handle = (int)c.ret(0);
  return p;
}
SimpleBlobDetector::Params::Params() {
  thresholdStep = 10; minThreshold = 50; maxThreshold = 220; minRepeatability = 2; minDistBetweenBlobs = 10;
  filterByColor = true; blobColor = 0;
  filterByArea = true; minArea = 25; maxArea = 5000;
  filterByCircularity = false; minCircularity = 0.8f; maxCircularity = std::numeric_limits<float>::max();
  filterByInertia = true; minInertiaRatio = 0.1f; maxInertiaRatio = std::numeric_limits<float>::max();
  filterByConvexity = true; minConvexity = 0.95f; maxConvexity = std::numeric_limits<float>::max();
  collectContours = false;
}
Ptr<SimpleBlobDetector> SimpleBlobDetector::create(const SimpleBlobDetector::Params& p) {
  auto d = makePtr<SimpleBlobDetector>();
  Call c("Blob_create");
  c.dbls({ p.thresholdStep, p.minThreshold, p.maxThreshold, (double)p.minRepeatability, p.minDistBetweenBlobs,
           (double)p.filterByColor, (double)p.blobColor, (double)p.filterByArea, p.minArea, p.maxArea,
           (double)p.filterByCircularity, p.minCircularity, std::min((double)p.maxCircularity, 1e30),
           (double)p.filterByInertia, p.minInertiaRatio, std::min((double)p.maxInertiaRatio, 1e30),
           (double)p.filterByConvexity, p.minConvexity, std::min((double)p.maxConvexity, 1e30) }).run();
  d->handle = (int)c.ret(0);
  return d;
}
BFMatcher::BFMatcher(int nt, bool cc) { Call c("BFMatcher_create"); c.i(nt).b(cc).run(); handle = (int)c.ret(0); }
Ptr<BFMatcher> BFMatcher::create(int nt, bool cc) { return makePtr<BFMatcher>(nt, cc); }
Ptr<DescriptorMatcher> DescriptorMatcher::create(const std::string& t) {
  int nt = NORM_L2;
  if (t == "BruteForce-Hamming" || t == "BruteForce-HammingLUT") nt = NORM_HAMMING;
  else if (t == "BruteForce-Hamming(2)") nt = NORM_HAMMING2;
  else if (t == "BruteForce-L1") nt = NORM_L1;
  else if (t == "BruteForce-SL2") nt = NORM_L2SQR;
  else if (t == "FlannBased") note("FlannBased 매처는 이 실습 환경에서 BruteForce(L2) 매처로 대신 실행합니다.");
  return makePtr<BFMatcher>(nt, false);
}
Ptr<DescriptorMatcher> DescriptorMatcher::create(const DescriptorMatcher::MatcherType& mt) {
  static const char* names[] = { "", "FlannBased", "BruteForce", "BruteForce-L1", "BruteForce-Hamming", "BruteForce-HammingLUT", "BruteForce-SL2" };
  return create(std::string(names[(int)mt >= 1 && (int)mt <= 6 ? (int)mt : 2]));
}
void DescriptorMatcher::match(InputArray q, InputArray t, std::vector<DMatch>& m, InputArray mask) const { Call c("dm_match"); c.i(handle).in(q).in(t).out(m).in(mask).run(); }
void DescriptorMatcher::knnMatch(InputArray q, InputArray t, std::vector<std::vector<DMatch>>& m, int k, InputArray mask, bool compact) const {
  Call c("dm_knnMatch"); c.i(handle).in(q).in(t).out(m).i(k).in(mask).b(compact).run();
}
void DescriptorMatcher::radiusMatch(InputArray q, InputArray t, std::vector<std::vector<DMatch>>& m, float maxd, InputArray mask, bool compact) const {
  Call c("dm_radiusMatch"); c.i(handle).in(q).in(t).out(m).d(maxd).in(mask).b(compact).run();
}
void drawKeypoints(InputArray img, const std::vector<KeyPoint>& kps, InputOutputArray out, const Scalar& color, DrawMatchesFlags flags) {
  Mat cur = out.okind == _OutputArray::O_MAT ? *(Mat*)out.dst : Mat();
  Call c("drawKeypoints"); c.in(img).in(kps).out(out).m(cur).sc(color).i((int)flags).run();
}
void drawMatches(InputArray img1, const std::vector<KeyPoint>& k1, InputArray img2, const std::vector<KeyPoint>& k2, const std::vector<DMatch>& m, InputOutputArray out,
  const Scalar& mc, const Scalar& spc, const std::vector<char>& mask, DrawMatchesFlags flags) {
  Mat cur = out.okind == _OutputArray::O_MAT ? *(Mat*)out.dst : Mat();
  Call c("drawMatches"); c.in(img1).in(k1).in(img2).in(k2).in(m).out(out).m(cur).sc(mc).sc(spc).in(mask).i((int)flags).run();
}
void drawMatches(InputArray img1, const std::vector<KeyPoint>& k1, InputArray img2, const std::vector<KeyPoint>& k2, const std::vector<std::vector<DMatch>>& m, InputOutputArray out,
  const Scalar& mc, const Scalar& spc, const std::vector<std::vector<char>>& mask, DrawMatchesFlags flags) {
  std::vector<DMatch> flat;
  std::vector<char> fm;
  for (size_t i = 0; i < m.size(); i++) for (size_t j = 0; j < m[i].size(); j++) { flat.push_back(m[i][j]); fm.push_back(mask.empty() ? 1 : mask[i][j]); }
  drawMatches(img1, k1, img2, k2, flat, out, mc, spc, fm, flags);
}

// ================================================================ geometry (calib3d)
Mat findHomography(InputArray s, InputArray d, int method, double th, OutputArray mask, const int maxIters, const double conf) {
  Mat H; Call c("findHomography"); c.in(s).in(d).i(method).d(th).out(mask).i(maxIters).d(conf).out(H).run(); return H;
}
Mat findHomography(InputArray s, InputArray d, OutputArray mask, int method, double th) { return findHomography(s, d, method, th, mask); }
void perspectiveTransform(InputArray s, OutputArray d, InputArray m) { Call c("perspectiveTransform"); c.in(s).out(d).in(m).run(); }
void transform(InputArray s, OutputArray d, InputArray m) { Call c("transform"); c.in(s).out(d).in(m).run(); }
Mat estimateAffine2D(InputArray from, InputArray to, OutputArray inl, int method, double th, size_t mi, double conf, size_t ri) {
  Mat M; Call c("estimateAffine2D"); c.in(from).in(to).out(inl).i(method).d(th).i((int)mi).d(conf).i((int)ri).out(M).run(); return M;
}
Mat estimateAffinePartial2D(InputArray from, InputArray to, OutputArray inl, int method, double th, size_t mi, double conf, size_t ri) {
  Mat M; Call c("estimateAffinePartial2D"); c.in(from).in(to).out(inl).i(method).d(th).i((int)mi).d(conf).i((int)ri).out(M).run(); return M;
}
void Rodrigues(InputArray s, OutputArray d, OutputArray j) { Call c("Rodrigues"); c.in(s).out(d).out(j).run(); }

// ================================================================ video
void BackgroundSubtractor::apply(InputArray img, OutputArray fg, double lr) { Call c("bs_apply"); c.i(handle).in(img).out(fg).d(lr).run(); }
void BackgroundSubtractor::getBackgroundImage(OutputArray bg) const { Call c("bs_getBackgroundImage"); c.i(handle).out(bg).run(); }
Ptr<BackgroundSubtractorMOG2> createBackgroundSubtractorMOG2(int h, double vt, bool ds) {
  auto p = makePtr<BackgroundSubtractorMOG2>();
  Call c("MOG2_create"); c.i(h).d(vt).b(ds).run();
  p->handle = (int)c.ret(0); p->history = h; p->varThreshold = vt; p->shadows = ds;
  return p;
}
void calcOpticalFlowPyrLK(InputArray prev, InputArray next, InputArray pp, InputOutputArray np, OutputArray status, OutputArray err, Size win, int ml, TermCriteria tc, int flags, double me) {
  Call c("calcOpticalFlowPyrLK");
  c.in(prev).in(next).in(pp).in(np).out(np).out(status).out(err).sz(win).i(ml).tc(tc).i(flags).d(me).run();
}
void calcOpticalFlowFarneback(InputArray prev, InputArray next, InputOutputArray flow, double ps, int lv, int ws, int it, int pn, double sg, int flags) {
  Call c("calcOpticalFlowFarneback"); c.in(prev).in(next).out(flow).d(ps).i(lv).i(ws).i(it).i(pn).d(sg).i(flags).run();
}
int meanShift(InputArray prob, Rect& win, TermCriteria tc) {
  Call c("meanShift"); c.in(prob).rc(win).tc(tc).run();
  win = Rect((int)c.ret(1), (int)c.ret(2), (int)c.ret(3), (int)c.ret(4));
  return (int)c.ret(0);
}
RotatedRect CamShift(InputArray prob, Rect& win, TermCriteria tc) {
  Call c("CamShift"); c.in(prob).rc(win).tc(tc).run();
  win = Rect((int)c.ret(5), (int)c.ret(6), (int)c.ret(7), (int)c.ret(8));
  return retRR(c);
}

// ================================================================ objdetect · photo
QRCodeDetector::QRCodeDetector() : handle(0) { Call c("QR_create"); c.run(); handle = (int)c.ret(0); }
QRCodeDetector::~QRCodeDetector() { if (handle) { Call c("release"); c.i(handle); try { c.run(); } catch (...) {} } }
bool QRCodeDetector::detect(InputArray img, OutputArray pts) const { Call c("QR_detect"); c.i(handle).in(img).out(pts).run(); return c.ret(0) != 0; }
std::string QRCodeDetector::decode(InputArray img, InputArray pts, OutputArray sc) const { Call c("QR_decode"); c.i(handle).in(img).in(pts).out(sc).run(); return c.retstr(); }
std::string QRCodeDetector::detectAndDecode(InputArray img, OutputArray pts, OutputArray sc) const { Call c("QR_detectAndDecode"); c.i(handle).in(img).out(pts).out(sc).run(); return c.retstr(); }
void inpaint(InputArray s, InputArray m, OutputArray d, double r, int f) { Call c("inpaint"); c.in(s).in(m).out(d).d(r).i(f).run(); }
void groupRectangles(std::vector<Rect>& rl, int gt, double eps) {
  // 간단한 구현: 비슷한 사각형끼리 묶어 평균 (실제 OpenCV 의 partition 방식과 같은 기준)
  std::vector<int> labels(rl.size(), -1);
  int nclasses = 0;
  auto similar = [eps](const Rect& a, const Rect& b) {
    double delta = eps * (std::min(a.width, b.width) + std::min(a.height, b.height)) * 0.5;
    return std::abs(a.x - b.x) <= delta && std::abs(a.y - b.y) <= delta && std::abs(a.x + a.width - b.x - b.width) <= delta && std::abs(a.y + a.height - b.y - b.height) <= delta;
  };
  for (size_t i = 0; i < rl.size(); i++) {
    if (labels[i] >= 0) continue;
    labels[i] = nclasses;
    std::vector<size_t> st{ i };
    while (!st.empty()) { size_t k = st.back(); st.pop_back(); for (size_t j = 0; j < rl.size(); j++) if (labels[j] < 0 && similar(rl[k], rl[j])) { labels[j] = nclasses; st.push_back(j); } }
    nclasses++;
  }
  std::vector<Rect> out;
  for (int c = 0; c < nclasses; c++) {
    double x = 0, y = 0, w = 0, h = 0; int n = 0;
    for (size_t i = 0; i < rl.size(); i++) if (labels[i] == c) { x += rl[i].x; y += rl[i].y; w += rl[i].width; h += rl[i].height; n++; }
    if (n <= gt) continue;
    out.push_back(Rect(cvRound(x / n), cvRound(y / n), cvRound(w / n), cvRound(h / n)));
  }
  rl = out;
}

} // namespace cv
