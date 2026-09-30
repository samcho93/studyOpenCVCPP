/* studyOpenCVCPP — 브라우저 실습용 OpenCV 5.0 C++ API
 *
 *  실제 OpenCV 와 같은 이름 · 같은 사용법의 C++ API 입니다.
 *  - cv::Mat, Point, Size, Rect, Scalar, Vec ... 는 이 헤더 안의 진짜 C++ 클래스입니다
 *    (픽셀 접근 at<> / ptr<> / ROI / clone / copyTo / convertTo 등은 C++ 에서 그대로 동작).
 *  - cvtColor, threshold, GaussianBlur, findContours ... 같은 알고리즘은 브라우저의
 *    OpenCV.js 5.0(WebAssembly)으로 계산합니다 (js/cv-bridge.js).
 *  - Visual Studio 의 실제 OpenCV 5.0 에서도 강좌 코드는 그대로 컴파일됩니다.
 */
#pragma once
#ifndef STUDY_OPENCV_SHIM_HPP
#define STUDY_OPENCV_SHIM_HPP

#include <cstdint>
#include <cstring>
#include <cstdio>
#include <cstdlib>
#include <cmath>
#include <cfloat>
#include <climits>
#include <string>
#include <vector>
#include <iostream>
#include <sstream>
#include <iomanip>
#include <memory>
#include <algorithm>
#include <limits>
#include <initializer_list>
#include <type_traits>
#include <exception>
#include <functional>

#define CV_VERSION_MAJOR 5
#define CV_VERSION_MINOR 0
#define CV_VERSION_REVISION 0
#define CV_VERSION "5.0.0"

typedef unsigned char uchar;
typedef signed char schar;
typedef unsigned short ushort;
typedef long long int64;
typedef unsigned long long uint64;

// ---------------------------------------------------------------- 자료형 (OpenCV 5: 채널 시프트 5비트)
#define CV_CN_MAX 128
#define CV_CN_SHIFT 5
#define CV_DEPTH_MAX (1 << CV_CN_SHIFT)
#define CV_8U 0
#define CV_8S 1
#define CV_16U 2
#define CV_16S 3
#define CV_32S 4
#define CV_32F 5
#define CV_64F 6
#define CV_16F 7
#define CV_MAT_DEPTH_MASK (CV_DEPTH_MAX - 1)
#define CV_MAT_DEPTH(flags) ((flags) & CV_MAT_DEPTH_MASK)
#define CV_MAKETYPE(depth, cn) (CV_MAT_DEPTH(depth) + (((cn) - 1) << CV_CN_SHIFT))
#define CV_MAKE_TYPE CV_MAKETYPE
#define CV_MAT_CN_MASK ((CV_CN_MAX - 1) << CV_CN_SHIFT)
#define CV_MAT_CN(flags) ((((flags) & CV_MAT_CN_MASK) >> CV_CN_SHIFT) + 1)
#define CV_MAT_TYPE_MASK (CV_DEPTH_MAX * CV_CN_MAX - 1)
#define CV_MAT_TYPE(flags) ((flags) & CV_MAT_TYPE_MASK)
#define CV_ELEM_SIZE1(type) ((int)cv::detail::depthSize(CV_MAT_DEPTH(type)))
#define CV_ELEM_SIZE(type) (CV_MAT_CN(type) * CV_ELEM_SIZE1(type))

#define CV_8UC1 CV_MAKETYPE(CV_8U, 1)
#define CV_8UC2 CV_MAKETYPE(CV_8U, 2)
#define CV_8UC3 CV_MAKETYPE(CV_8U, 3)
#define CV_8UC4 CV_MAKETYPE(CV_8U, 4)
#define CV_8UC(n) CV_MAKETYPE(CV_8U, (n))
#define CV_8SC1 CV_MAKETYPE(CV_8S, 1)
#define CV_8SC2 CV_MAKETYPE(CV_8S, 2)
#define CV_8SC3 CV_MAKETYPE(CV_8S, 3)
#define CV_8SC4 CV_MAKETYPE(CV_8S, 4)
#define CV_8SC(n) CV_MAKETYPE(CV_8S, (n))
#define CV_16UC1 CV_MAKETYPE(CV_16U, 1)
#define CV_16UC2 CV_MAKETYPE(CV_16U, 2)
#define CV_16UC3 CV_MAKETYPE(CV_16U, 3)
#define CV_16UC4 CV_MAKETYPE(CV_16U, 4)
#define CV_16UC(n) CV_MAKETYPE(CV_16U, (n))
#define CV_16SC1 CV_MAKETYPE(CV_16S, 1)
#define CV_16SC2 CV_MAKETYPE(CV_16S, 2)
#define CV_16SC3 CV_MAKETYPE(CV_16S, 3)
#define CV_16SC4 CV_MAKETYPE(CV_16S, 4)
#define CV_16SC(n) CV_MAKETYPE(CV_16S, (n))
#define CV_32SC1 CV_MAKETYPE(CV_32S, 1)
#define CV_32SC2 CV_MAKETYPE(CV_32S, 2)
#define CV_32SC3 CV_MAKETYPE(CV_32S, 3)
#define CV_32SC4 CV_MAKETYPE(CV_32S, 4)
#define CV_32SC(n) CV_MAKETYPE(CV_32S, (n))
#define CV_32FC1 CV_MAKETYPE(CV_32F, 1)
#define CV_32FC2 CV_MAKETYPE(CV_32F, 2)
#define CV_32FC3 CV_MAKETYPE(CV_32F, 3)
#define CV_32FC4 CV_MAKETYPE(CV_32F, 4)
#define CV_32FC(n) CV_MAKETYPE(CV_32F, (n))
#define CV_64FC1 CV_MAKETYPE(CV_64F, 1)
#define CV_64FC2 CV_MAKETYPE(CV_64F, 2)
#define CV_64FC3 CV_MAKETYPE(CV_64F, 3)
#define CV_64FC4 CV_MAKETYPE(CV_64F, 4)
#define CV_64FC(n) CV_MAKETYPE(CV_64F, (n))

#define CV_PI 3.1415926535897932384626433832795
#define CV_2PI 6.283185307179586476925286766559
#define CV_LOG2 0.69314718055994530941723212145818

#define CV_StsOk 0
#define CV_StsError (-2)
#define CV_StsBadArg (-5)
#define CV_StsOutOfRange (-211)
#define CV_StsAssert (-215)

#define CV_Error(code, msg) cv::error(code, msg, __func__, __FILE__, __LINE__)
#define CV_Assert(expr) do { if (!!(expr)) ; else cv::error(cv::Error::StsAssert, #expr, __func__, __FILE__, __LINE__); } while (0)
#define CV_DbgAssert(expr) CV_Assert(expr)

namespace cv {

// ---------------------------------------------------------------- 기본 유틸리티
namespace Error {
enum Code { StsOk = 0, StsBackTrace = -1, StsError = -2, StsInternal = -3, StsNoMem = -4, StsBadArg = -5, StsBadFunc = -6,
  StsNoConv = -7, StsAutoTrace = -8, StsNullPtr = -27, StsBadSize = -201, StsOutOfRange = -211, StsUnsupportedFormat = -210,
  StsNotImplemented = -213, StsBadMemBlock = -214, StsAssert = -215 };
}

class Exception : public std::exception {
public:
  Exception() : code(0), line(0) {}
  Exception(int _code, const std::string& _err, const std::string& _func, const std::string& _file, int _line);
  virtual ~Exception() noexcept {}
  const char* what() const noexcept override { return msg.c_str(); }
  void formatMessage();
  std::string msg;
  int code;
  std::string err;
  std::string func;
  std::string file;
  int line;
};

[[noreturn]] void error(int code, const std::string& err, const char* func, const char* file, int line);
[[noreturn]] void error(const Exception& exc);

template<typename T> using Ptr = std::shared_ptr<T>;
template<typename T, typename... A> static inline Ptr<T> makePtr(A&&... a) { return std::make_shared<T>(std::forward<A>(a)...); }
typedef std::string String;

std::string format(const char* fmt, ...);
int64 getTickCount();
double getTickFrequency();
int64 getCPUTickCount();
int getNumThreads();
void setNumThreads(int n);
int getNumberOfCPUs();
std::string getBuildInformation();
std::string getVersionString();
int getVersionMajor();
int getVersionMinor();
int getVersionRevision();
bool useOptimized();
void setUseOptimized(bool);

static inline int cvRound(double v) { return (int)std::lrint(v); }
static inline int cvRound(float v) { return (int)std::lrintf(v); }
static inline int cvRound(int v) { return v; }
static inline int cvFloor(double v) { return (int)std::floor(v); }
static inline int cvFloor(float v) { return (int)std::floor(v); }
static inline int cvFloor(int v) { return v; }
static inline int cvCeil(double v) { return (int)std::ceil(v); }
static inline int cvCeil(float v) { return (int)std::ceil(v); }
static inline int cvCeil(int v) { return v; }
static inline bool cvIsNaN(double v) { return std::isnan(v); }
static inline bool cvIsInf(double v) { return std::isinf(v); }
float cubeRoot(float v);
/** 형식 이름: typeToString(CV_8UC3) → "CV_8UC3", depthToString(CV_32F) → "CV_32F" */
std::string typeToString(int type);
const char* depthToString(int depth);
float fastAtan2(float y, float x);

namespace detail {
static inline size_t depthSize(int d) { static const unsigned char s[8] = { 1, 1, 2, 2, 4, 4, 8, 2 }; return s[d & 7]; }
}

/** saturate_cast: 범위를 넘으면 잘라 내고, 실수 → 정수는 가장 가까운 정수로 반올림 */
template<typename T, typename S> static inline T saturate_cast(S v) {
  if constexpr (std::is_integral_v<T> && !std::is_same_v<T, bool>) {
    constexpr long long lo = (long long)std::numeric_limits<T>::min();
    constexpr long long hi = (long long)std::numeric_limits<T>::max();
    if constexpr (std::is_floating_point_v<S>) {
      if (std::isnan(v)) return (T)0;
      double d = std::nearbyint((double)v);
      if (d < (double)lo) return (T)lo;
      if (d > (double)hi) return (T)hi;
      return (T)(long long)d;
    } else {
      if constexpr (std::is_unsigned_v<S> && sizeof(S) >= sizeof(long long)) {
        return v > (unsigned long long)hi ? (T)hi : (T)v;
      } else {
        long long x = (long long)v;
        return (T)(x < lo ? lo : x > hi ? hi : x);
      }
    }
  } else {
    return static_cast<T>(v);
  }
}

// ---------------------------------------------------------------- DataType
template<typename T> struct DataType {};
#define CV_SHIM_DT(T, D) template<> struct DataType<T> { typedef T value_type; typedef T work_type; typedef T channel_type; \
  enum { generic_type = 0, depth = D, channels = 1, fmt = 0, type = CV_MAKETYPE(D, 1) }; };
CV_SHIM_DT(bool, CV_8U)
CV_SHIM_DT(uchar, CV_8U)
CV_SHIM_DT(schar, CV_8S)
CV_SHIM_DT(char, CV_8S)
CV_SHIM_DT(ushort, CV_16U)
CV_SHIM_DT(short, CV_16S)
CV_SHIM_DT(int, CV_32S)
CV_SHIM_DT(float, CV_32F)
CV_SHIM_DT(double, CV_64F)
#undef CV_SHIM_DT
namespace traits {
template<typename T> struct Depth { enum { value = DataType<T>::depth }; };
template<typename T> struct Type { enum { value = DataType<T>::type }; };
}

// ---------------------------------------------------------------- Vec · Scalar
template<typename T, int cn> class Vec {
public:
  typedef T value_type;
  enum { channels = cn };
  T val[cn];
  Vec() { for (int i = 0; i < cn; i++) val[i] = T(0); }
  template<typename... A, typename = std::enable_if_t<(sizeof...(A) >= 1 && sizeof...(A) <= cn && (std::is_arithmetic_v<std::decay_t<A>> && ...))>>
  Vec(A... a) {
    const T tmp[] = { static_cast<T>(a)... };
    int n = (int)sizeof...(A);
    for (int i = 0; i < cn; i++) val[i] = i < n ? tmp[i] : T(0);
  }
  explicit Vec(const T* values) { for (int i = 0; i < cn; i++) val[i] = values[i]; }
  Vec(std::initializer_list<T> l) { int i = 0; for (auto v : l) { if (i < cn) val[i++] = v; } for (; i < cn; i++) val[i] = T(0); }
  template<typename T2> operator Vec<T2, cn>() const { Vec<T2, cn> r; for (int i = 0; i < cn; i++) r.val[i] = saturate_cast<T2>(val[i]); return r; }
  static Vec all(T a) { Vec v; for (int i = 0; i < cn; i++) v.val[i] = a; return v; }
  static Vec zeros() { return Vec(); }
  static Vec ones() { return all(T(1)); }
  const T& operator[](int i) const { return val[i]; }
  T& operator[](int i) { return val[i]; }
  const T& operator()(int i) const { return val[i]; }
  T& operator()(int i) { return val[i]; }
  Vec mul(const Vec& v) const { Vec r; for (int i = 0; i < cn; i++) r.val[i] = saturate_cast<T>(val[i] * v.val[i]); return r; }
  T dot(const Vec& v) const { T s = 0; for (int i = 0; i < cn; i++) s += saturate_cast<T>(val[i] * v.val[i]); return s; }
  double ddot(const Vec& v) const { double s = 0; for (int i = 0; i < cn; i++) s += (double)val[i] * v.val[i]; return s; }
};
template<typename T, int cn> struct DataType<Vec<T, cn>> {
  typedef Vec<T, cn> value_type; typedef T channel_type;
  enum { generic_type = 0, depth = DataType<T>::depth, channels = cn, fmt = 0, type = CV_MAKETYPE(DataType<T>::depth, cn) };
};
template<typename T, int cn> static inline Vec<T, cn> operator+(const Vec<T, cn>& a, const Vec<T, cn>& b) { Vec<T, cn> r; for (int i = 0; i < cn; i++) r.val[i] = saturate_cast<T>(a.val[i] + b.val[i]); return r; }
template<typename T, int cn> static inline Vec<T, cn> operator-(const Vec<T, cn>& a, const Vec<T, cn>& b) { Vec<T, cn> r; for (int i = 0; i < cn; i++) r.val[i] = saturate_cast<T>(a.val[i] - b.val[i]); return r; }
template<typename T, int cn> static inline Vec<T, cn> operator-(const Vec<T, cn>& a) { Vec<T, cn> r; for (int i = 0; i < cn; i++) r.val[i] = saturate_cast<T>(-a.val[i]); return r; }
template<typename T, int cn> static inline Vec<T, cn> operator*(const Vec<T, cn>& a, double s) { Vec<T, cn> r; for (int i = 0; i < cn; i++) r.val[i] = saturate_cast<T>(a.val[i] * s); return r; }
template<typename T, int cn> static inline Vec<T, cn> operator*(double s, const Vec<T, cn>& a) { return a * s; }
template<typename T, int cn> static inline Vec<T, cn> operator/(const Vec<T, cn>& a, double s) { Vec<T, cn> r; for (int i = 0; i < cn; i++) r.val[i] = saturate_cast<T>(a.val[i] / s); return r; }
template<typename T, int cn> static inline Vec<T, cn>& operator+=(Vec<T, cn>& a, const Vec<T, cn>& b) { a = a + b; return a; }
template<typename T, int cn> static inline Vec<T, cn>& operator-=(Vec<T, cn>& a, const Vec<T, cn>& b) { a = a - b; return a; }
template<typename T, int cn> static inline Vec<T, cn>& operator*=(Vec<T, cn>& a, double s) { a = a * s; return a; }
template<typename T, int cn> static inline Vec<T, cn>& operator/=(Vec<T, cn>& a, double s) { a = a / s; return a; }
template<typename T, int cn> static inline bool operator==(const Vec<T, cn>& a, const Vec<T, cn>& b) { for (int i = 0; i < cn; i++) if (a.val[i] != b.val[i]) return false; return true; }
template<typename T, int cn> static inline bool operator!=(const Vec<T, cn>& a, const Vec<T, cn>& b) { return !(a == b); }
template<typename T, int cn> static inline double norm(const Vec<T, cn>& a) { double s = 0; for (int i = 0; i < cn; i++) s += (double)a.val[i] * a.val[i]; return std::sqrt(s); }

typedef Vec<uchar, 2> Vec2b; typedef Vec<uchar, 3> Vec3b; typedef Vec<uchar, 4> Vec4b;
typedef Vec<short, 2> Vec2s; typedef Vec<short, 3> Vec3s; typedef Vec<short, 4> Vec4s;
typedef Vec<ushort, 2> Vec2w; typedef Vec<ushort, 3> Vec3w; typedef Vec<ushort, 4> Vec4w;
typedef Vec<int, 2> Vec2i; typedef Vec<int, 3> Vec3i; typedef Vec<int, 4> Vec4i; typedef Vec<int, 6> Vec6i; typedef Vec<int, 8> Vec8i;
typedef Vec<float, 2> Vec2f; typedef Vec<float, 3> Vec3f; typedef Vec<float, 4> Vec4f; typedef Vec<float, 6> Vec6f;
typedef Vec<double, 2> Vec2d; typedef Vec<double, 3> Vec3d; typedef Vec<double, 4> Vec4d; typedef Vec<double, 6> Vec6d;

template<typename T> class Scalar_ : public Vec<T, 4> {
public:
  Scalar_() {}
  Scalar_(T v0, T v1 = 0, T v2 = 0, T v3 = 0) { this->val[0] = v0; this->val[1] = v1; this->val[2] = v2; this->val[3] = v3; }
  template<typename T2, int cn> Scalar_(const Vec<T2, cn>& v) { for (int i = 0; i < 4; i++) this->val[i] = i < cn ? saturate_cast<T>(v.val[i]) : T(0); }
  static Scalar_ all(T v) { return Scalar_(v, v, v, v); }
  Scalar_ mul(const Scalar_& a, double scale = 1) const { return Scalar_(saturate_cast<T>(this->val[0] * a.val[0] * scale), saturate_cast<T>(this->val[1] * a.val[1] * scale), saturate_cast<T>(this->val[2] * a.val[2] * scale), saturate_cast<T>(this->val[3] * a.val[3] * scale)); }
  Scalar_ conj() const { return Scalar_(this->val[0], -this->val[1], -this->val[2], -this->val[3]); }
  bool isReal() const { return this->val[1] == 0 && this->val[2] == 0 && this->val[3] == 0; }
  template<typename T2> operator Scalar_<T2>() const { return Scalar_<T2>(saturate_cast<T2>(this->val[0]), saturate_cast<T2>(this->val[1]), saturate_cast<T2>(this->val[2]), saturate_cast<T2>(this->val[3])); }
};
typedef Scalar_<double> Scalar;
template<typename T> struct DataType<Scalar_<T>> { typedef Scalar_<T> value_type; typedef T channel_type;
  enum { generic_type = 0, depth = DataType<T>::depth, channels = 4, fmt = 0, type = CV_MAKETYPE(DataType<T>::depth, 4) }; };
template<typename T> static inline Scalar_<T> operator+(const Scalar_<T>& a, const Scalar_<T>& b) { return Scalar_<T>(a.val[0] + b.val[0], a.val[1] + b.val[1], a.val[2] + b.val[2], a.val[3] + b.val[3]); }
template<typename T> static inline Scalar_<T> operator-(const Scalar_<T>& a, const Scalar_<T>& b) { return Scalar_<T>(a.val[0] - b.val[0], a.val[1] - b.val[1], a.val[2] - b.val[2], a.val[3] - b.val[3]); }
template<typename T> static inline Scalar_<T> operator*(const Scalar_<T>& a, T s) { return Scalar_<T>(a.val[0] * s, a.val[1] * s, a.val[2] * s, a.val[3] * s); }
template<typename T> static inline Scalar_<T> operator*(T s, const Scalar_<T>& a) { return a * s; }
template<typename T> static inline Scalar_<T> operator/(const Scalar_<T>& a, T s) { return Scalar_<T>(a.val[0] / s, a.val[1] / s, a.val[2] / s, a.val[3] / s); }

// ---------------------------------------------------------------- Point · Size · Rect
template<typename T> class Size_;
template<typename T> class Rect_;
template<typename T> class Point_ {
public:
  typedef T value_type;
  T x, y;
  Point_() : x(0), y(0) {}
  Point_(T _x, T _y) : x(_x), y(_y) {}
  Point_(const Size_<T>& sz);
  Point_(const Vec<T, 2>& v) : x(v[0]), y(v[1]) {}
  template<typename T2> operator Point_<T2>() const { return Point_<T2>(saturate_cast<T2>(x), saturate_cast<T2>(y)); }
  operator Vec<T, 2>() const { return Vec<T, 2>(x, y); }
  T dot(const Point_& p) const { return saturate_cast<T>(x * p.x + y * p.y); }
  double ddot(const Point_& p) const { return (double)x * p.x + (double)y * p.y; }
  double cross(const Point_& p) const { return (double)x * p.y - (double)y * p.x; }
  bool inside(const Rect_<T>& r) const;
};
template<typename T> struct DataType<Point_<T>> { typedef Point_<T> value_type; typedef T channel_type;
  enum { generic_type = 0, depth = DataType<T>::depth, channels = 2, fmt = 0, type = CV_MAKETYPE(DataType<T>::depth, 2) }; };
typedef Point_<int> Point2i; typedef Point_<int64> Point2l; typedef Point_<float> Point2f; typedef Point_<double> Point2d; typedef Point2i Point;
template<typename T> static inline Point_<T> operator+(const Point_<T>& a, const Point_<T>& b) { return Point_<T>(saturate_cast<T>(a.x + b.x), saturate_cast<T>(a.y + b.y)); }
template<typename T> static inline Point_<T> operator-(const Point_<T>& a, const Point_<T>& b) { return Point_<T>(saturate_cast<T>(a.x - b.x), saturate_cast<T>(a.y - b.y)); }
template<typename T> static inline Point_<T> operator-(const Point_<T>& a) { return Point_<T>(saturate_cast<T>(-a.x), saturate_cast<T>(-a.y)); }
template<typename T> static inline Point_<T> operator*(const Point_<T>& a, double s) { return Point_<T>(saturate_cast<T>(a.x * s), saturate_cast<T>(a.y * s)); }
template<typename T> static inline Point_<T> operator*(double s, const Point_<T>& a) { return a * s; }
template<typename T> static inline Point_<T> operator/(const Point_<T>& a, double s) { return Point_<T>(saturate_cast<T>(a.x / s), saturate_cast<T>(a.y / s)); }
template<typename T> static inline Point_<T>& operator+=(Point_<T>& a, const Point_<T>& b) { a = a + b; return a; }
template<typename T> static inline Point_<T>& operator-=(Point_<T>& a, const Point_<T>& b) { a = a - b; return a; }
template<typename T> static inline Point_<T>& operator*=(Point_<T>& a, double s) { a = a * s; return a; }
template<typename T> static inline Point_<T>& operator/=(Point_<T>& a, double s) { a = a / s; return a; }
template<typename T> static inline bool operator==(const Point_<T>& a, const Point_<T>& b) { return a.x == b.x && a.y == b.y; }
template<typename T> static inline bool operator!=(const Point_<T>& a, const Point_<T>& b) { return !(a == b); }
template<typename T> static inline double norm(const Point_<T>& p) { return std::sqrt((double)p.x * p.x + (double)p.y * p.y); }

template<typename T> class Point3_ {
public:
  typedef T value_type;
  T x, y, z;
  Point3_() : x(0), y(0), z(0) {}
  Point3_(T _x, T _y, T _z) : x(_x), y(_y), z(_z) {}
  Point3_(const Vec<T, 3>& v) : x(v[0]), y(v[1]), z(v[2]) {}
  template<typename T2> operator Point3_<T2>() const { return Point3_<T2>(saturate_cast<T2>(x), saturate_cast<T2>(y), saturate_cast<T2>(z)); }
  operator Vec<T, 3>() const { return Vec<T, 3>(x, y, z); }
  T dot(const Point3_& p) const { return saturate_cast<T>(x * p.x + y * p.y + z * p.z); }
  double ddot(const Point3_& p) const { return (double)x * p.x + (double)y * p.y + (double)z * p.z; }
  Point3_ cross(const Point3_& p) const { return Point3_(y * p.z - z * p.y, z * p.x - x * p.z, x * p.y - y * p.x); }
};
template<typename T> struct DataType<Point3_<T>> { typedef Point3_<T> value_type; typedef T channel_type;
  enum { generic_type = 0, depth = DataType<T>::depth, channels = 3, fmt = 0, type = CV_MAKETYPE(DataType<T>::depth, 3) }; };
typedef Point3_<int> Point3i; typedef Point3_<float> Point3f; typedef Point3_<double> Point3d;
template<typename T> static inline Point3_<T> operator+(const Point3_<T>& a, const Point3_<T>& b) { return Point3_<T>(a.x + b.x, a.y + b.y, a.z + b.z); }
template<typename T> static inline Point3_<T> operator-(const Point3_<T>& a, const Point3_<T>& b) { return Point3_<T>(a.x - b.x, a.y - b.y, a.z - b.z); }
template<typename T> static inline Point3_<T> operator*(const Point3_<T>& a, double s) { return Point3_<T>(saturate_cast<T>(a.x * s), saturate_cast<T>(a.y * s), saturate_cast<T>(a.z * s)); }
template<typename T> static inline bool operator==(const Point3_<T>& a, const Point3_<T>& b) { return a.x == b.x && a.y == b.y && a.z == b.z; }
template<typename T> static inline double norm(const Point3_<T>& p) { return std::sqrt((double)p.x * p.x + (double)p.y * p.y + (double)p.z * p.z); }

template<typename T> class Size_ {
public:
  typedef T value_type;
  T width, height;
  Size_() : width(0), height(0) {}
  Size_(T w, T h) : width(w), height(h) {}
  Size_(const Point_<T>& p) : width(p.x), height(p.y) {}
  template<typename T2> operator Size_<T2>() const { return Size_<T2>(saturate_cast<T2>(width), saturate_cast<T2>(height)); }
  T area() const { return width * height; }
  double aspectRatio() const { return (double)width / (double)height; }
  bool empty() const { return width <= 0 || height <= 0; }
};
template<typename T> struct DataType<Size_<T>> { typedef Size_<T> value_type; typedef T channel_type;
  enum { generic_type = 0, depth = DataType<T>::depth, channels = 2, fmt = 0, type = CV_MAKETYPE(DataType<T>::depth, 2) }; };
typedef Size_<int> Size2i; typedef Size_<int64> Size2l; typedef Size_<float> Size2f; typedef Size_<double> Size2d; typedef Size2i Size;
template<typename T> Point_<T>::Point_(const Size_<T>& sz) : x(sz.width), y(sz.height) {}
template<typename T> static inline Size_<T> operator*(const Size_<T>& a, T s) { return Size_<T>(a.width * s, a.height * s); }
template<typename T> static inline Size_<T> operator/(const Size_<T>& a, T s) { return Size_<T>(a.width / s, a.height / s); }
template<typename T> static inline Size_<T> operator+(const Size_<T>& a, const Size_<T>& b) { return Size_<T>(a.width + b.width, a.height + b.height); }
template<typename T> static inline Size_<T> operator-(const Size_<T>& a, const Size_<T>& b) { return Size_<T>(a.width - b.width, a.height - b.height); }
template<typename T> static inline bool operator==(const Size_<T>& a, const Size_<T>& b) { return a.width == b.width && a.height == b.height; }
template<typename T> static inline bool operator!=(const Size_<T>& a, const Size_<T>& b) { return !(a == b); }

template<typename T> class Rect_ {
public:
  typedef T value_type;
  T x, y, width, height;
  Rect_() : x(0), y(0), width(0), height(0) {}
  Rect_(T _x, T _y, T w, T h) : x(_x), y(_y), width(w), height(h) {}
  Rect_(const Point_<T>& org, const Size_<T>& sz) : x(org.x), y(org.y), width(sz.width), height(sz.height) {}
  Rect_(const Point_<T>& p1, const Point_<T>& p2) {
    x = std::min(p1.x, p2.x); y = std::min(p1.y, p2.y);
    width = std::max(p1.x, p2.x) - x; height = std::max(p1.y, p2.y) - y;
  }
  template<typename T2> operator Rect_<T2>() const { return Rect_<T2>(saturate_cast<T2>(x), saturate_cast<T2>(y), saturate_cast<T2>(width), saturate_cast<T2>(height)); }
  Point_<T> tl() const { return Point_<T>(x, y); }
  Point_<T> br() const { return Point_<T>(x + width, y + height); }
  Size_<T> size() const { return Size_<T>(width, height); }
  T area() const { return width * height; }
  bool empty() const { return width <= 0 || height <= 0; }
  bool contains(const Point_<T>& p) const { return x <= p.x && p.x < x + width && y <= p.y && p.y < y + height; }
};
template<typename T> struct DataType<Rect_<T>> { typedef Rect_<T> value_type; typedef T channel_type;
  enum { generic_type = 0, depth = DataType<T>::depth, channels = 4, fmt = 0, type = CV_MAKETYPE(DataType<T>::depth, 4) }; };
typedef Rect_<int> Rect2i; typedef Rect_<float> Rect2f; typedef Rect_<double> Rect2d; typedef Rect2i Rect;
template<typename T> bool Point_<T>::inside(const Rect_<T>& r) const { return r.contains(*this); }
template<typename T> static inline Rect_<T> operator&(const Rect_<T>& a, const Rect_<T>& b) {
  T x1 = std::max(a.x, b.x), y1 = std::max(a.y, b.y);
  T x2 = std::min(a.x + a.width, b.x + b.width), y2 = std::min(a.y + a.height, b.y + b.height);
  if (x2 <= x1 || y2 <= y1) return Rect_<T>();
  return Rect_<T>(x1, y1, x2 - x1, y2 - y1);
}
template<typename T> static inline Rect_<T> operator|(const Rect_<T>& a, const Rect_<T>& b) {
  if (a.empty()) return b;
  if (b.empty()) return a;
  T x1 = std::min(a.x, b.x), y1 = std::min(a.y, b.y);
  T x2 = std::max(a.x + a.width, b.x + b.width), y2 = std::max(a.y + a.height, b.y + b.height);
  return Rect_<T>(x1, y1, x2 - x1, y2 - y1);
}
template<typename T> static inline Rect_<T>& operator&=(Rect_<T>& a, const Rect_<T>& b) { a = a & b; return a; }
template<typename T> static inline Rect_<T>& operator|=(Rect_<T>& a, const Rect_<T>& b) { a = a | b; return a; }
template<typename T> static inline Rect_<T> operator+(const Rect_<T>& a, const Point_<T>& p) { return Rect_<T>(a.x + p.x, a.y + p.y, a.width, a.height); }
template<typename T> static inline Rect_<T> operator-(const Rect_<T>& a, const Point_<T>& p) { return Rect_<T>(a.x - p.x, a.y - p.y, a.width, a.height); }
template<typename T> static inline Rect_<T> operator+(const Rect_<T>& a, const Size_<T>& s) { return Rect_<T>(a.x, a.y, a.width + s.width, a.height + s.height); }
template<typename T> static inline Rect_<T> operator-(const Rect_<T>& a, const Size_<T>& s) { return Rect_<T>(a.x, a.y, a.width - s.width, a.height - s.height); }
template<typename T> static inline Rect_<T>& operator+=(Rect_<T>& a, const Point_<T>& p) { a = a + p; return a; }
template<typename T> static inline Rect_<T>& operator-=(Rect_<T>& a, const Point_<T>& p) { a = a - p; return a; }
template<typename T> static inline Rect_<T>& operator+=(Rect_<T>& a, const Size_<T>& s) { a = a + s; return a; }
template<typename T> static inline bool operator==(const Rect_<T>& a, const Rect_<T>& b) { return a.x == b.x && a.y == b.y && a.width == b.width && a.height == b.height; }
template<typename T> static inline bool operator!=(const Rect_<T>& a, const Rect_<T>& b) { return !(a == b); }

class RotatedRect {
public:
  RotatedRect() : angle(0) {}
  RotatedRect(const Point2f& c, const Size2f& s, float a) : center(c), size(s), angle(a) {}
  RotatedRect(const Point2f& p1, const Point2f& p2, const Point2f& p3);
  void points(Point2f pts[]) const;
  void points(std::vector<Point2f>& pts) const;
  Rect boundingRect() const;
  Rect_<float> boundingRect2f() const;
  Point2f center;
  Size2f size;
  float angle;
};

class Range {
public:
  Range() : start(0), end(0) {}
  Range(int s, int e) : start(s), end(e) {}
  int size() const { return end - start; }
  bool empty() const { return start == end; }
  static Range all() { return Range(INT_MIN, INT_MAX); }
  int start, end;
};
static inline bool operator==(const Range& a, const Range& b) { return a.start == b.start && a.end == b.end; }

class TermCriteria {
public:
  enum Type { COUNT = 1, MAX_ITER = COUNT, EPS = 2 };
  TermCriteria() : type(0), maxCount(0), epsilon(0) {}
  TermCriteria(int t, int m, double e) : type(t), maxCount(m), epsilon(e) {}
  bool isValid() const { return ((type & COUNT) == 0 || maxCount > 0) && ((type & EPS) == 0 || epsilon >= 0) && type != 0; }
  int type;
  int maxCount;
  double epsilon;
};

class KeyPoint {
public:
  KeyPoint() : size(0), angle(-1), response(0), octave(0), class_id(-1) {}
  KeyPoint(Point2f p, float s, float a = -1, float r = 0, int o = 0, int c = -1) : pt(p), size(s), angle(a), response(r), octave(o), class_id(c) {}
  KeyPoint(float x, float y, float s, float a = -1, float r = 0, int o = 0, int c = -1) : pt(x, y), size(s), angle(a), response(r), octave(o), class_id(c) {}
  static void convert(const std::vector<KeyPoint>& kps, std::vector<Point2f>& pts, const std::vector<int>& idx = std::vector<int>()) {
    pts.clear();
    if (idx.empty()) for (auto& k : kps) pts.push_back(k.pt);
    else for (int i : idx) pts.push_back(kps[i].pt);
  }
  static void convert(const std::vector<Point2f>& pts, std::vector<KeyPoint>& kps, float size = 1, float response = 1, int octave = 0, int class_id = -1) {
    kps.clear();
    for (auto& p : pts) kps.push_back(KeyPoint(p, size, -1, response, octave, class_id));
  }
  Point2f pt;
  float size;
  float angle;
  float response;
  int octave;
  int class_id;
};

class DMatch {
public:
  DMatch() : queryIdx(-1), trainIdx(-1), imgIdx(-1), distance(FLT_MAX) {}
  DMatch(int q, int t, float d) : queryIdx(q), trainIdx(t), imgIdx(-1), distance(d) {}
  DMatch(int q, int t, int i, float d) : queryIdx(q), trainIdx(t), imgIdx(i), distance(d) {}
  bool operator<(const DMatch& m) const { return distance < m.distance; }
  int queryIdx;
  int trainIdx;
  int imgIdx;
  float distance;
};

class Moments {
public:
  Moments() { std::memset(this, 0, sizeof(*this)); }
  double m00, m10, m01, m20, m11, m02, m30, m21, m12, m03;
  double mu20, mu11, mu02, mu30, mu21, mu12, mu03;
  double nu20, nu11, nu02, nu30, nu21, nu12, nu03;
};

// ---------------------------------------------------------------- Mat
enum { ACCESS_READ = 1 << 24, ACCESS_WRITE = 1 << 25, ACCESS_RW = 3 << 24 };
class Mat;
class _InputArray;
class _OutputArray;
typedef const _InputArray& InputArray;
typedef InputArray InputArrayOfArrays;
typedef const _OutputArray& OutputArray;
typedef OutputArray OutputArrayOfArrays;
typedef OutputArray InputOutputArray;
typedef OutputArray InputOutputArrayOfArrays;
typedef Mat MatExpr;
typedef Mat UMat;

namespace detail { struct MatData { int refcount; uchar* ptr; size_t size; }; }

struct MatSize {
  explicit MatSize(int* _p) : p(_p) {}
  Size operator()() const { return Size(p[1], p[0]); }
  int operator[](int i) const { return p[i]; }
  int dims() const { return 2; }
  operator Size() const { return (*this)(); }
  int* p;
};
struct MatStep {
  MatStep() { buf[0] = buf[1] = 0; }
  size_t operator[](int i) const { return buf[i]; }
  size_t& operator[](int i) { return buf[i]; }
  operator size_t() const { return buf[0]; }
  size_t buf[2];
};

template<typename T> class MatIterator_;
template<typename T> class MatConstIterator_;
template<typename T> class Mat_;
template<typename T> class MatCommaInitializer_;

class Mat {
public:
  enum { MAGIC_VAL = 0x42FF0000, AUTO_STEP = 0, CONTINUOUS_FLAG = 1 << 14, SUBMATRIX_FLAG = 1 << 15 };
  Mat();
  Mat(int rows, int cols, int type);
  Mat(Size size, int type);
  Mat(int rows, int cols, int type, const Scalar& s);
  Mat(Size size, int type, const Scalar& s);
  Mat(int rows, int cols, int type, void* data, size_t step = AUTO_STEP);
  Mat(Size size, int type, void* data, size_t step = AUTO_STEP);
  Mat(const Mat& m);
  Mat(Mat&& m) noexcept;
  Mat(const Mat& m, const Rect& roi);
  Mat(const Mat& m, const Range& rowRange, const Range& colRange = Range::all());
  template<typename T> explicit Mat(const std::vector<T>& vec, bool copyData = false);
  template<typename T, int n> explicit Mat(const Vec<T, n>& vec, bool copyData = true);
  template<typename T> explicit Mat(const Point_<T>& pt, bool copyData = true);
  template<typename T> explicit Mat(const Point3_<T>& pt, bool copyData = true);
  ~Mat();
  Mat& operator=(const Mat& m);
  Mat& operator=(Mat&& m) noexcept;
  Mat& operator=(const Scalar& s);

  Mat row(int y) const;
  Mat col(int x) const;
  Mat rowRange(int startrow, int endrow) const;
  Mat rowRange(const Range& r) const;
  Mat colRange(int startcol, int endcol) const;
  Mat colRange(const Range& r) const;
  Mat diag(int d = 0) const;
  Mat clone() const;
  void copyTo(OutputArray m) const;
  void copyTo(OutputArray m, InputArray mask) const;
  void convertTo(OutputArray m, int rtype, double alpha = 1, double beta = 0) const;
  void assignTo(Mat& m, int type = -1) const;
  Mat& setTo(InputArray value, InputArray mask);
  Mat& setTo(const Scalar& value);
  Mat reshape(int cn, int rows = 0) const;
  Mat t() const;
  Mat inv(int method = 0) const;
  Mat mul(InputArray m, double scale = 1) const;
  Mat cross(InputArray m) const;
  double dot(InputArray m) const;
  static Mat zeros(int rows, int cols, int type);
  static Mat zeros(Size size, int type);
  static Mat ones(int rows, int cols, int type);
  static Mat ones(Size size, int type);
  static Mat eye(int rows, int cols, int type);
  static Mat eye(Size size, int type);
  void create(int rows, int cols, int type);
  void create(Size size, int type);
  void release();
  void deallocate() { release(); }
  void push_back(const Mat& m);
  template<typename T> void push_back(const T& elem);
  void pop_back(size_t nelems = 1);
  void locateROI(Size& wholeSize, Point& ofs) const;
  Mat& adjustROI(int dtop, int dbottom, int dleft, int dright);
  Mat operator()(Range rowRange, Range colRange) const;
  Mat operator()(const Rect& roi) const;
  bool isContinuous() const { return (flags & CONTINUOUS_FLAG) != 0; }
  bool isSubmatrix() const { return (flags & SUBMATRIX_FLAG) != 0; }
  size_t elemSize() const { return CV_ELEM_SIZE(flags); }
  size_t elemSize1() const { return CV_ELEM_SIZE1(flags); }
  int type() const { return CV_MAT_TYPE(flags); }
  int depth() const { return CV_MAT_DEPTH(flags); }
  int channels() const { return CV_MAT_CN(flags); }
  size_t step1(int i = 0) const { return step.buf[i] / elemSize1(); }
  bool empty() const { return data == nullptr || rows == 0 || cols == 0; }
  size_t total() const { return (size_t)rows * cols; }
  int checkVector(int elemChannels, int depth = -1, bool requireContinuous = true) const;

  uchar* ptr(int i0 = 0) { return data + step.buf[0] * i0; }
  const uchar* ptr(int i0 = 0) const { return data + step.buf[0] * i0; }
  uchar* ptr(int row, int col) { return data + step.buf[0] * row + elemSize() * col; }
  const uchar* ptr(int row, int col) const { return data + step.buf[0] * row + elemSize() * col; }
  template<typename T> T* ptr(int i0 = 0) { chkRow(i0); return (T*)(data + step.buf[0] * i0); }
  template<typename T> const T* ptr(int i0 = 0) const { chkRow(i0); return (const T*)(data + step.buf[0] * i0); }
  template<typename T> T* ptr(int row, int col) { chkAt(row, col, sizeof(T), 1); return (T*)(data + step.buf[0] * row) + col; }
  template<typename T> const T* ptr(int row, int col) const { chkAt(row, col, sizeof(T), 1); return (const T*)(data + step.buf[0] * row) + col; }

  template<typename T> T& at(int i0, int i1) { chkAt(i0, i1, sizeof(T), DataType<T>::channels, DataType<T>::depth); return ((T*)(data + step.buf[0] * i0))[i1]; }
  template<typename T> const T& at(int i0, int i1) const { chkAt(i0, i1, sizeof(T), DataType<T>::channels, DataType<T>::depth); return ((const T*)(data + step.buf[0] * i0))[i1]; }
  template<typename T> T& at(Point pt) { return at<T>(pt.y, pt.x); }
  template<typename T> const T& at(Point pt) const { return at<T>(pt.y, pt.x); }
  template<typename T> T& at(int i0) {
    if (isContinuous() || rows == 1) { chkIdx(i0, sizeof(T)); return ((T*)data)[i0]; }
    if (cols == 1) return at<T>(i0, 0);
    int r = i0 / cols; return at<T>(r, i0 - r * cols);
  }
  template<typename T> const T& at(int i0) const { return const_cast<Mat*>(this)->at<T>(i0); }

  template<typename T> MatIterator_<T> begin();
  template<typename T> MatIterator_<T> end();
  template<typename T> MatConstIterator_<T> begin() const;
  template<typename T> MatConstIterator_<T> end() const;
  template<typename T, typename F> void forEach(const F& op) {
    int pos[2];
    for (int r = 0; r < rows; r++) { T* p = (T*)(data + step.buf[0] * r); pos[0] = r; for (int c = 0; c < cols; c++) { pos[1] = c; op(p[c], (const int*)pos); } }
  }
  template<typename T, typename F> void forEach(const F& op) const { const_cast<Mat*>(this)->forEach<T>(op); }
  template<typename T> operator std::vector<T>() const;

  int flags;
  int dims;
  int rows, cols;
  uchar* data;
  const uchar* datastart;
  const uchar* dataend;
  const uchar* datalimit;
  detail::MatData* u;
  MatSize size;
  MatStep step;

  // 내부용
  void updateContinuity();
  void chkRow(int r) const;
  void chkAt(int r, int c, size_t tsize, int tcn, int tdepth = -1) const;
  void chkIdx(int i, size_t tsize) const;
  static Mat fromVec(const void* ptr, int n, int type, bool copy);
};

// Mat 산술 연산 (MatExpr 대신 바로 계산된 Mat 을 돌려준다)
Mat operator+(const Mat& a, const Mat& b);
Mat operator+(const Mat& a, const Scalar& s);
Mat operator+(const Scalar& s, const Mat& a);
Mat operator-(const Mat& a, const Mat& b);
Mat operator-(const Mat& a, const Scalar& s);
Mat operator-(const Scalar& s, const Mat& a);
Mat operator-(const Mat& a);
Mat operator*(const Mat& a, const Mat& b);
Mat operator*(const Mat& a, double s);
Mat operator*(double s, const Mat& a);
Mat operator/(const Mat& a, const Mat& b);
Mat operator/(const Mat& a, double s);
Mat operator/(double s, const Mat& a);
Mat operator&(const Mat& a, const Mat& b);
Mat operator&(const Mat& a, const Scalar& s);
Mat operator|(const Mat& a, const Mat& b);
Mat operator|(const Mat& a, const Scalar& s);
Mat operator^(const Mat& a, const Mat& b);
Mat operator^(const Mat& a, const Scalar& s);
Mat operator~(const Mat& a);
Mat operator<(const Mat& a, const Mat& b);
Mat operator<(const Mat& a, double s);
Mat operator<=(const Mat& a, const Mat& b);
Mat operator<=(const Mat& a, double s);
Mat operator>(const Mat& a, const Mat& b);
Mat operator>(const Mat& a, double s);
Mat operator>=(const Mat& a, const Mat& b);
Mat operator>=(const Mat& a, double s);
Mat operator==(const Mat& a, const Mat& b);
Mat operator==(const Mat& a, double s);
Mat operator!=(const Mat& a, const Mat& b);
Mat operator!=(const Mat& a, double s);
Mat& operator+=(Mat& a, const Mat& b);
Mat& operator+=(Mat& a, const Scalar& s);
Mat& operator-=(Mat& a, const Mat& b);
Mat& operator-=(Mat& a, const Scalar& s);
Mat& operator*=(Mat& a, const Mat& b);
Mat& operator*=(Mat& a, double s);
Mat& operator/=(Mat& a, const Mat& b);
Mat& operator/=(Mat& a, double s);
Mat& operator&=(Mat& a, const Mat& b);
Mat& operator&=(Mat& a, const Scalar& s);
Mat& operator|=(Mat& a, const Mat& b);
Mat& operator|=(Mat& a, const Scalar& s);
Mat& operator^=(Mat& a, const Mat& b);
Mat abs(const Mat& a);
Mat min(const Mat& a, const Mat& b);
Mat min(const Mat& a, double s);
Mat max(const Mat& a, const Mat& b);
Mat max(const Mat& a, double s);

// ---------------------------------------------------------------- InputArray / OutputArray
class _InputArray {
public:
  enum KindFlag { NONE = 0, MAT = 1, MATX = 2, SCALAR = 3, VECVEC = 4, MATVEC = 5, KPVEC = 6, DMVEC = 7 };
  _InputArray() : kind(NONE), mptr(nullptr), obj(nullptr), vcount(0) {}
  _InputArray(const Mat& m) : kind(MAT), mptr(&m), obj(nullptr), vcount(0) {}
  _InputArray(const double& v) : kind(SCALAR), mptr(nullptr), obj(nullptr), vcount(0) { sc = Scalar(v); }
  _InputArray(const Scalar& s) : kind(SCALAR), mptr(nullptr), obj(nullptr), vcount(0) { sc = s; }
  template<typename T, int n> _InputArray(const Vec<T, n>& v) : kind(MATX), mptr(nullptr), obj(nullptr), vcount(0) { tmp = Mat::fromVec(&v, n, DataType<T>::type, true); }
  template<typename T> _InputArray(const std::vector<T>& v) : kind(MATX), mptr(nullptr), obj(&v), vcount(0) {
    tmp = Mat::fromVec(v.empty() ? nullptr : (const void*)v.data(), (int)v.size(), DataType<T>::type, false);
  }
  _InputArray(const std::vector<KeyPoint>& v) : kind(KPVEC), mptr(nullptr), obj(&v), vcount((int)v.size()) {}
  _InputArray(const std::vector<DMatch>& v) : kind(DMVEC), mptr(nullptr), obj(&v), vcount((int)v.size()) {}
  _InputArray(const std::vector<uchar>& v) : kind(MATX), mptr(nullptr), obj(&v), vcount(0) { tmp = Mat::fromVec(v.empty() ? nullptr : v.data(), (int)v.size(), CV_8U, false); }
  _InputArray(const std::vector<bool>& v);
  _InputArray(const std::vector<Mat>& v) : kind(MATVEC), mptr(nullptr), obj(&v), vcount((int)v.size()) { for (auto& m : v) list.push_back(m); }
  template<typename T> _InputArray(const std::vector<std::vector<T>>& v) : kind(VECVEC), mptr(nullptr), obj(&v), vcount((int)v.size()) {
    for (auto& e : v) list.push_back(Mat::fromVec(e.empty() ? nullptr : (const void*)e.data(), (int)e.size(), DataType<T>::type, false));
  }
  template<typename T> _InputArray(const Mat_<T>& m) : kind(MAT), mptr(&m), obj(nullptr), vcount(0) {}
  template<typename T> _InputArray(const MatCommaInitializer_<T>& c);
  _InputArray(const _InputArray& o) : kind(o.kind), mptr(o.mptr == &o.tmp ? &tmp : o.mptr), obj(o.obj), vcount(o.vcount), tmp(o.tmp), sc(o.sc), list(o.list) {}

  Mat getMat(int idx = -1) const;
  void getMatVector(std::vector<Mat>& mv) const;
  bool empty() const;
  int kindOf() const { return kind; }
  bool isMat() const { return kind == MAT; }
  bool isScalar() const { return kind == SCALAR; }
  Size size(int i = -1) const;
  int type(int i = -1) const;
  int channels(int i = -1) const { return CV_MAT_CN(type(i)); }
  int depth(int i = -1) const { return CV_MAT_DEPTH(type(i)); }
  size_t total(int i = -1) const;
  int rows(int i = -1) const { return size(i).height; }
  int cols(int i = -1) const { return size(i).width; }

  int kind;
  const Mat* mptr;
  const void* obj;
  int vcount;
  Mat tmp;
  Scalar sc;
  std::vector<Mat> list;
};

class _OutputArray : public _InputArray {
public:
  enum OKind { O_NONE = 0, O_MAT = 1, O_VEC = 2, O_VECVEC = 3, O_MATVEC = 4, O_FIXED = 5, O_KP = 6, O_DM = 7, O_DMVV = 8 };
  _OutputArray() : okind(O_NONE), dst(nullptr), vtype(-1), vassign(nullptr), vvassign(nullptr) {}
  _OutputArray(Mat& m) : _InputArray(m), okind(O_MAT), dst(&m), vtype(-1), vassign(nullptr), vvassign(nullptr) {}
  _OutputArray(const Mat& m) : _InputArray(m), okind(O_MAT), dst(const_cast<Mat*>(&m)), vtype(-1), vassign(nullptr), vvassign(nullptr) {}
  template<typename T> _OutputArray(Mat_<T>& m) : _InputArray(m), okind(O_MAT), dst(&m), vtype(DataType<T>::type), vassign(nullptr), vvassign(nullptr) {}
  template<typename T> _OutputArray(std::vector<T>& v) : _InputArray(v), okind(O_VEC), dst(const_cast<void*>((const void*)&v)), vtype(DataType<T>::type), vvassign(nullptr) {
    vassign = [](void* obj, const Mat& m) {
      auto& vv = *(std::vector<T>*)obj;
      size_t n = m.empty() ? 0 : m.total() * m.channels() / DataType<T>::channels;
      vv.resize(n);
      if (n) { Mat src = m.isContinuous() ? m : m.clone(); std::memcpy((void*)vv.data(), src.data, n * sizeof(T)); }
    };
  }
  _OutputArray(std::vector<uchar>& v) : _InputArray(v), okind(O_VEC), dst(&v), vtype(CV_8U), vvassign(nullptr) {
    vassign = [](void* obj, const Mat& m) {
      auto& vv = *(std::vector<uchar>*)obj;
      size_t n = m.empty() ? 0 : m.total() * m.channels();
      vv.resize(n);
      if (n) { Mat src = m.isContinuous() ? m : m.clone(); std::memcpy(vv.data(), src.data, n); }
    };
  }
  _OutputArray(std::vector<KeyPoint>& v) : _InputArray(v), okind(O_KP), dst(&v), vtype(-1), vassign(nullptr), vvassign(nullptr) {}
  _OutputArray(std::vector<DMatch>& v) : _InputArray(v), okind(O_DM), dst(&v), vtype(-1), vassign(nullptr), vvassign(nullptr) {}
  _OutputArray(std::vector<std::vector<DMatch>>& v) : okind(O_DMVV), dst(&v), vtype(-1), vassign(nullptr), vvassign(nullptr) {}
  _OutputArray(std::vector<Mat>& v) : _InputArray(v), okind(O_MATVEC), dst(&v), vtype(-1), vassign(nullptr), vvassign(nullptr) {}
  template<typename T> _OutputArray(std::vector<std::vector<T>>& v) : _InputArray(v), okind(O_VECVEC), dst(&v), vtype(DataType<T>::type), vassign(nullptr) {
    vvassign = [](void* obj, const std::vector<Mat>& ms) {
      auto& vv = *(std::vector<std::vector<T>>*)obj;
      vv.resize(ms.size());
      for (size_t i = 0; i < ms.size(); i++) {
        const Mat& m = ms[i];
        size_t n = m.empty() ? 0 : m.total() * m.channels() / DataType<T>::channels;
        vv[i].resize(n);
        if (n) { Mat src = m.isContinuous() ? m : m.clone(); std::memcpy((void*)vv[i].data(), src.data, n * sizeof(T)); }
      }
    };
  }
  template<typename T, int n> _OutputArray(Vec<T, n>& v) : _InputArray(v), okind(O_FIXED), dst(&v), vtype(DataType<T>::type), vvassign(nullptr) {
    vassign = [](void* obj, const Mat& m) {
      auto& vv = *(Vec<T, n>*)obj;
      Mat src = m.isContinuous() ? m : m.clone();
      int total = (int)(src.total() * src.channels());
      for (int i = 0; i < n; i++) vv[i] = i < total ? ((const T*)src.data)[i] : T(0);
    };
  }

  bool needed() const { return okind != O_NONE; }
  Mat& getMatRef(int i = -1) const;
  void create(int rows, int cols, int type) const;
  void create(Size sz, int type) const { create(sz.height, sz.width, type); }
  void release() const;
  /** 계산 결과(Mat)를 이 출력에 넣는다 (Mat 이면 create 후 복사 → ROI 에도 그대로 써진다) */
  void assign(const Mat& m) const;
  void assignList(const std::vector<Mat>& ms) const;

  int okind;
  void* dst;
  int vtype;
  void (*vassign)(void*, const Mat&);
  void (*vvassign)(void*, const std::vector<Mat>&);
};
typedef _OutputArray _InputOutputArray;
const _OutputArray& noArray();

// ---------------------------------------------------------------- Mat_<T>
template<typename T> class MatCommaInitializer_;
template<typename T> class Mat_ : public Mat {
public:
  typedef T value_type;
  Mat_() : Mat() { flags = (flags & ~CV_MAT_TYPE_MASK) | DataType<T>::type; }
  Mat_(int r, int c) : Mat(r, c, DataType<T>::type) {}
  Mat_(int r, int c, const T& v) : Mat(r, c, DataType<T>::type) { for (int i = 0; i < r; i++) for (int j = 0; j < c; j++) (*this)(i, j) = v; }
  explicit Mat_(Size sz) : Mat(sz.height, sz.width, DataType<T>::type) {}
  Mat_(Size sz, const T& v) : Mat_(sz.height, sz.width, v) {}
  Mat_(int r, int c, T* d, size_t st = AUTO_STEP) : Mat(r, c, DataType<T>::type, (void*)d, st) {}
  Mat_(const Mat& m) : Mat() { if (m.type() == DataType<T>::type || m.empty()) Mat::operator=(m); else m.convertTo(*this, DataType<T>::type); }
  Mat_(const Mat_& m) : Mat(m) {}
  Mat_(std::initializer_list<T> l) : Mat((int)l.size(), 1, DataType<T>::type) { int i = 0; for (auto& v : l) (*this)(i++, 0) = v; }
  explicit Mat_(const std::vector<T>& v, bool copyData = false) : Mat(v, copyData) {}
  Mat_& operator=(const Mat& m) { if (m.type() == DataType<T>::type || m.empty()) Mat::operator=(m); else m.convertTo(*this, DataType<T>::type); return *this; }
  Mat_& operator=(const Mat_& m) { Mat::operator=(m); return *this; }
  Mat_& operator=(const T& v) { for (int i = 0; i < rows; i++) for (int j = 0; j < cols; j++) (*this)(i, j) = v; return *this; }
  T& operator()(int r, int c) { return this->template at<T>(r, c); }
  const T& operator()(int r, int c) const { return this->template at<T>(r, c); }
  T& operator()(Point p) { return this->template at<T>(p.y, p.x); }
  const T& operator()(Point p) const { return this->template at<T>(p.y, p.x); }
  T& operator()(int i) { return this->template at<T>(i); }
  const T& operator()(int i) const { return this->template at<T>(i); }
  T* operator[](int r) { return this->template ptr<T>(r); }
  const T* operator[](int r) const { return this->template ptr<T>(r); }
  Mat_ operator()(const Rect& roi) const { return Mat_(Mat::operator()(roi)); }
  Mat_ operator()(const Range& rr, const Range& cr) const { return Mat_(Mat::operator()(rr, cr)); }
  Mat_ clone() const { return Mat_(Mat::clone()); }
  Mat_ row(int y) const { return Mat_(Mat::row(y)); }
  Mat_ col(int x) const { return Mat_(Mat::col(x)); }
  MatIterator_<T> begin();
  MatIterator_<T> end();
  MatConstIterator_<T> begin() const;
  MatConstIterator_<T> end() const;
  static Mat_ zeros(int r, int c) { return Mat_(Mat::zeros(r, c, DataType<T>::type)); }
  static Mat_ ones(int r, int c) { return Mat_(Mat::ones(r, c, DataType<T>::type)); }
  static Mat_ eye(int r, int c) { return Mat_(Mat::eye(r, c, DataType<T>::type)); }
};
typedef Mat_<uchar> Mat1b; typedef Mat_<Vec2b> Mat2b; typedef Mat_<Vec3b> Mat3b; typedef Mat_<Vec4b> Mat4b;
typedef Mat_<short> Mat1s; typedef Mat_<Vec3s> Mat3s;
typedef Mat_<ushort> Mat1w; typedef Mat_<Vec3w> Mat3w;
typedef Mat_<int> Mat1i; typedef Mat_<Vec2i> Mat2i; typedef Mat_<Vec3i> Mat3i; typedef Mat_<Vec4i> Mat4i;
typedef Mat_<float> Mat1f; typedef Mat_<Vec2f> Mat2f; typedef Mat_<Vec3f> Mat3f; typedef Mat_<Vec4f> Mat4f;
typedef Mat_<double> Mat1d; typedef Mat_<Vec2d> Mat2d; typedef Mat_<Vec3d> Mat3d; typedef Mat_<Vec4d> Mat4d;

template<typename T> class MatCommaInitializer_ {
public:
  MatCommaInitializer_(Mat_<T>* m) : mat(m), idx(0) {}
  template<typename T2> MatCommaInitializer_& operator,(T2 v) {
    if (idx >= (int)mat->total()) cv::error(Error::StsOutOfRange, "Too many initializers", "operator,", __FILE__, __LINE__);
    mat->template at<T>(idx / mat->cols, idx % mat->cols) = saturate_cast<T>(v);
    idx++;
    return *this;
  }
  operator Mat_<T>() const { return *mat; }
  Mat_<T> operator*() const { return *mat; }
  Mat_<T>* mat;
  int idx;
};
template<typename T, typename T2> static inline MatCommaInitializer_<T> operator<<(const Mat_<T>& m, T2 v) {
  MatCommaInitializer_<T> c(const_cast<Mat_<T>*>(&m));
  return (c, v);
}
template<typename T> _InputArray::_InputArray(const MatCommaInitializer_<T>& c) : kind(MAT), mptr(nullptr), obj(nullptr), vcount(0) { tmp = *c.mat; mptr = &tmp; }

// ---------------------------------------------------------------- MatIterator_
template<typename T> class MatConstIterator_ {
public:
  typedef T value_type; typedef std::ptrdiff_t difference_type; typedef const T* pointer; typedef const T& reference;
  typedef std::random_access_iterator_tag iterator_category;
  MatConstIterator_() : m(nullptr), pos(0) {}
  MatConstIterator_(const Mat* _m, size_t p) : m(_m), pos(p) {}
  const T& operator*() const { size_t r = pos / m->cols, c = pos % m->cols; return ((const T*)(m->data + m->step.buf[0] * r))[c]; }
  const T* operator->() const { return &**this; }
  const T& operator[](std::ptrdiff_t i) const { return *(*this + i); }
  MatConstIterator_& operator++() { pos++; return *this; }
  MatConstIterator_ operator++(int) { auto t = *this; pos++; return t; }
  MatConstIterator_& operator--() { pos--; return *this; }
  MatConstIterator_ operator--(int) { auto t = *this; pos--; return t; }
  MatConstIterator_& operator+=(std::ptrdiff_t d) { pos += d; return *this; }
  MatConstIterator_& operator-=(std::ptrdiff_t d) { pos -= d; return *this; }
  MatConstIterator_ operator+(std::ptrdiff_t d) const { return MatConstIterator_(m, pos + d); }
  MatConstIterator_ operator-(std::ptrdiff_t d) const { return MatConstIterator_(m, pos - d); }
  std::ptrdiff_t operator-(const MatConstIterator_& o) const { return (std::ptrdiff_t)pos - (std::ptrdiff_t)o.pos; }
  bool operator==(const MatConstIterator_& o) const { return pos == o.pos; }
  bool operator!=(const MatConstIterator_& o) const { return pos != o.pos; }
  bool operator<(const MatConstIterator_& o) const { return pos < o.pos; }
  Point pos_() const { return Point((int)(pos % m->cols), (int)(pos / m->cols)); }
  const Mat* m;
  size_t pos;
};
template<typename T> class MatIterator_ : public MatConstIterator_<T> {
public:
  typedef T* pointer; typedef T& reference;
  MatIterator_() {}
  MatIterator_(Mat* _m, size_t p) : MatConstIterator_<T>(_m, p) {}
  T& operator*() const { return const_cast<T&>(MatConstIterator_<T>::operator*()); }
  T* operator->() const { return &**this; }
  T& operator[](std::ptrdiff_t i) const { return *(*this + i); }
  MatIterator_& operator++() { this->pos++; return *this; }
  MatIterator_ operator++(int) { auto t = *this; this->pos++; return t; }
  MatIterator_& operator--() { this->pos--; return *this; }
  MatIterator_ operator--(int) { auto t = *this; this->pos--; return t; }
  MatIterator_& operator+=(std::ptrdiff_t d) { this->pos += d; return *this; }
  MatIterator_ operator+(std::ptrdiff_t d) const { return MatIterator_(const_cast<Mat*>(this->m), this->pos + d); }
  MatIterator_ operator-(std::ptrdiff_t d) const { return MatIterator_(const_cast<Mat*>(this->m), this->pos - d); }
  std::ptrdiff_t operator-(const MatIterator_& o) const { return (std::ptrdiff_t)this->pos - (std::ptrdiff_t)o.pos; }
};
template<typename T> MatIterator_<T> Mat::begin() { return MatIterator_<T>(this, 0); }
template<typename T> MatIterator_<T> Mat::end() { return MatIterator_<T>(this, total()); }
template<typename T> MatConstIterator_<T> Mat::begin() const { return MatConstIterator_<T>(this, 0); }
template<typename T> MatConstIterator_<T> Mat::end() const { return MatConstIterator_<T>(this, total()); }
template<typename T> MatIterator_<T> Mat_<T>::begin() { return Mat::begin<T>(); }
template<typename T> MatIterator_<T> Mat_<T>::end() { return Mat::end<T>(); }
template<typename T> MatConstIterator_<T> Mat_<T>::begin() const { return Mat::begin<T>(); }
template<typename T> MatConstIterator_<T> Mat_<T>::end() const { return Mat::end<T>(); }

template<typename T> Mat::Mat(const std::vector<T>& vec, bool copyData) : Mat() {
  *this = fromVec(vec.empty() ? nullptr : (const void*)vec.data(), (int)vec.size(), DataType<T>::type, copyData);
}
template<typename T, int n> Mat::Mat(const Vec<T, n>& vec, bool copyData) : Mat() { *this = fromVec(&vec, n, DataType<T>::type, true); (void)copyData; }
template<typename T> Mat::Mat(const Point_<T>& pt, bool copyData) : Mat() { T v[2] = { pt.x, pt.y }; *this = fromVec(v, 2, DataType<T>::type, true); (void)copyData; }
template<typename T> Mat::Mat(const Point3_<T>& pt, bool copyData) : Mat() { T v[3] = { pt.x, pt.y, pt.z }; *this = fromVec(v, 3, DataType<T>::type, true); (void)copyData; }
template<typename T> void Mat::push_back(const T& elem) { Mat m(1, 1, DataType<T>::type); *(T*)m.data = elem; push_back(m); }
template<typename T> Mat::operator std::vector<T>() const {
  std::vector<T> v;
  if (empty()) return v;
  Mat src = isContinuous() ? *this : clone();
  size_t n = total() * channels() / DataType<T>::channels;
  v.resize(n);
  std::memcpy((void*)v.data(), src.data, n * sizeof(T));
  return v;
}

// ---------------------------------------------------------------- 출력 (std::cout << ...)
std::ostream& operator<<(std::ostream& out, const Mat& m);
template<typename T> static inline std::ostream& operator<<(std::ostream& out, const Point_<T>& p) { return out << "[" << p.x << ", " << p.y << "]"; }
template<typename T> static inline std::ostream& operator<<(std::ostream& out, const Point3_<T>& p) { return out << "[" << p.x << ", " << p.y << ", " << p.z << "]"; }
template<typename T> static inline std::ostream& operator<<(std::ostream& out, const Size_<T>& s) { return out << "[" << s.width << " x " << s.height << "]"; }
template<typename T> static inline std::ostream& operator<<(std::ostream& out, const Rect_<T>& r) { return out << "[" << r.width << " x " << r.height << " from (" << r.x << ", " << r.y << ")]"; }
template<typename T, int n> static inline std::ostream& operator<<(std::ostream& out, const Vec<T, n>& v) {
  out << "[";
  for (int i = 0; i < n; i++) {
    if constexpr (DataType<T>::depth <= CV_32S) out << (int)v[i]; else out << v[i];
    out << (i < n - 1 ? ", " : "]");
  }
  return out;
}
template<typename T> static inline std::ostream& operator<<(std::ostream& out, const Scalar_<T>& s) { return out << (const Vec<T, 4>&)s; }
static inline std::ostream& operator<<(std::ostream& out, const Range& r) { return out << "[" << r.start << ", " << r.end << ")"; }
static inline std::ostream& operator<<(std::ostream& out, const RotatedRect& r) { return out << "[" << r.size.width << " x " << r.size.height << " from (" << r.center.x << ", " << r.center.y << "), angle " << r.angle << "]"; }

// ---------------------------------------------------------------- RNG
class RNG {
public:
  enum { UNIFORM = 0, NORMAL = 1 };
  RNG() : state(0xffffffff) {}
  RNG(uint64 s) : state(s ? s : 0xffffffff) {}
  unsigned next() { state = (uint64)(unsigned)state * 4164903690U + (unsigned)(state >> 32); return (unsigned)state; }
  operator uchar() { return (uchar)next(); }
  operator schar() { return (schar)next(); }
  operator ushort() { return (ushort)next(); }
  operator short() { return (short)next(); }
  operator unsigned() { return next(); }
  operator int() { return (int)next(); }
  operator float() { return (next() >> 8) * (1.f / (1 << 24)); }
  operator double() { unsigned t = next(); return (((uint64)t << 32) | next()) * 5.4210108624275221700372640043497e-20; }
  unsigned operator()() { return next(); }
  unsigned operator()(unsigned N) { return (unsigned)uniform(0, (int)N); }
  int uniform(int a, int b) { return a == b ? a : (int)(next() % (b - a) + a); }
  float uniform(float a, float b) { return ((float)*this) * (b - a) + a; }
  double uniform(double a, double b) { return ((double)*this) * (b - a) + a; }
  double gaussian(double sigma);
  void fill(InputOutputArray mat, int distType, InputArray a, InputArray b, bool saturateRange = false);
  bool operator==(const RNG& o) const { return state == o.state; }
  uint64 state;
};
RNG& theRNG();
void setRNGSeed(int seed);
void randu(InputOutputArray dst, InputArray low, InputArray high);
void randn(InputOutputArray dst, InputArray mean, InputArray stddev);
void randShuffle(InputOutputArray dst, double iterFactor = 1., RNG* rng = 0);

class TickMeter {
public:
  TickMeter() { reset(); }
  void start() { startTime = getTickCount(); }
  void stop() { int64 t = getTickCount(); if (startTime == 0) return; ++counter; sumTime += (t - startTime); startTime = 0; }
  int64 getTimeTicks() const { return sumTime; }
  double getTimeMicro() const { return getTimeMilli() * 1e3; }
  double getTimeMilli() const { return getTimeSec() * 1e3; }
  double getTimeSec() const { return (double)getTimeTicks() / getTickFrequency(); }
  int64 getCounter() const { return counter; }
  double getFPS() const { double s = getTimeSec(); return s < 1e-9 ? 0. : (double)counter / s; }
  double getAvgTimeSec() const { return counter <= 0 ? 0. : getTimeSec() / counter; }
  double getAvgTimeMilli() const { return getAvgTimeSec() * 1e3; }
  void reset() { startTime = 0; sumTime = 0; counter = 0; }
  int64 counter, sumTime, startTime;
};

// ================================================================ core
enum BorderTypes { BORDER_CONSTANT = 0, BORDER_REPLICATE = 1, BORDER_REFLECT = 2, BORDER_WRAP = 3, BORDER_REFLECT_101 = 4, BORDER_TRANSPARENT = 5,
  BORDER_REFLECT101 = BORDER_REFLECT_101, BORDER_DEFAULT = BORDER_REFLECT_101, BORDER_ISOLATED = 16 };
enum CmpTypes { CMP_EQ = 0, CMP_GT = 1, CMP_GE = 2, CMP_LT = 3, CMP_LE = 4, CMP_NE = 5 };
enum NormTypes { NORM_INF = 1, NORM_L1 = 2, NORM_L2 = 4, NORM_L2SQR = 5, NORM_HAMMING = 6, NORM_HAMMING2 = 7, NORM_TYPE_MASK = 7, NORM_RELATIVE = 8, NORM_MINMAX = 32 };
enum DecompTypes { DECOMP_LU = 0, DECOMP_SVD = 1, DECOMP_EIG = 2, DECOMP_CHOLESKY = 3, DECOMP_QR = 4, DECOMP_NORMAL = 16 };
enum DftFlags { DFT_INVERSE = 1, DFT_SCALE = 2, DFT_ROWS = 4, DFT_COMPLEX_OUTPUT = 16, DFT_REAL_OUTPUT = 32, DFT_COMPLEX_INPUT = 64, DCT_INVERSE = DFT_INVERSE, DCT_ROWS = DFT_ROWS };
enum ReduceTypes { REDUCE_SUM = 0, REDUCE_AVG = 1, REDUCE_MAX = 2, REDUCE_MIN = 3, REDUCE_SUM2 = 4 };
enum RotateFlags { ROTATE_90_CLOCKWISE = 0, ROTATE_180 = 1, ROTATE_90_COUNTERCLOCKWISE = 2 };
enum KmeansFlags { KMEANS_RANDOM_CENTERS = 0, KMEANS_PP_CENTERS = 2, KMEANS_USE_INITIAL_LABELS = 1 };
enum SortFlags { SORT_EVERY_ROW = 0, SORT_EVERY_COLUMN = 1, SORT_ASCENDING = 0, SORT_DESCENDING = 16 };
enum GemmFlags { GEMM_1_T = 1, GEMM_2_T = 2, GEMM_3_T = 4 };

void add(InputArray src1, InputArray src2, OutputArray dst, InputArray mask = noArray(), int dtype = -1);
void subtract(InputArray src1, InputArray src2, OutputArray dst, InputArray mask = noArray(), int dtype = -1);
void multiply(InputArray src1, InputArray src2, OutputArray dst, double scale = 1, int dtype = -1);
void divide(InputArray src1, InputArray src2, OutputArray dst, double scale = 1, int dtype = -1);
void divide(double scale, InputArray src2, OutputArray dst, int dtype = -1);
void scaleAdd(InputArray src1, double alpha, InputArray src2, OutputArray dst);
void addWeighted(InputArray src1, double alpha, InputArray src2, double beta, double gamma, OutputArray dst, int dtype = -1);
void convertScaleAbs(InputArray src, OutputArray dst, double alpha = 1, double beta = 0);
void absdiff(InputArray src1, InputArray src2, OutputArray dst);
void bitwise_and(InputArray src1, InputArray src2, OutputArray dst, InputArray mask = noArray());
void bitwise_or(InputArray src1, InputArray src2, OutputArray dst, InputArray mask = noArray());
void bitwise_xor(InputArray src1, InputArray src2, OutputArray dst, InputArray mask = noArray());
void bitwise_not(InputArray src, OutputArray dst, InputArray mask = noArray());
void compare(InputArray src1, InputArray src2, OutputArray dst, int cmpop);
void inRange(InputArray src, InputArray lowerb, InputArray upperb, OutputArray dst);
void min(InputArray src1, InputArray src2, OutputArray dst);
void max(InputArray src1, InputArray src2, OutputArray dst);
void sqrt(InputArray src, OutputArray dst);
void pow(InputArray src, double power, OutputArray dst);
void exp(InputArray src, OutputArray dst);
void log(InputArray src, OutputArray dst);
void magnitude(InputArray x, InputArray y, OutputArray magnitude);
void phase(InputArray x, InputArray y, OutputArray angle, bool angleInDegrees = false);
void cartToPolar(InputArray x, InputArray y, OutputArray magnitude, OutputArray angle, bool angleInDegrees = false);
void polarToCart(InputArray magnitude, InputArray angle, OutputArray x, OutputArray y, bool angleInDegrees = false);
Scalar sum(InputArray src);
Scalar mean(InputArray src, InputArray mask = noArray());
void meanStdDev(InputArray src, OutputArray mean, OutputArray stddev, InputArray mask = noArray());
int countNonZero(InputArray src);
bool hasNonZero(InputArray src);
void findNonZero(InputArray src, OutputArray idx);
void minMaxLoc(InputArray src, double* minVal, double* maxVal = 0, Point* minLoc = 0, Point* maxLoc = 0, InputArray mask = noArray());
void minMaxIdx(InputArray src, double* minVal, double* maxVal = 0, int* minIdx = 0, int* maxIdx = 0, InputArray mask = noArray());
double norm(InputArray src1, int normType = NORM_L2, InputArray mask = noArray());
double norm(InputArray src1, InputArray src2, int normType = NORM_L2, InputArray mask = noArray());
double PSNR(InputArray src1, InputArray src2, double R = 255.);
void normalize(InputArray src, InputOutputArray dst, double alpha = 1, double beta = 0, int norm_type = NORM_L2, int dtype = -1, InputArray mask = noArray());
void split(const Mat& src, Mat* mvbegin);
void split(InputArray m, OutputArrayOfArrays mv);
void merge(const Mat* mv, size_t count, OutputArray dst);
void merge(InputArrayOfArrays mv, OutputArray dst);
void extractChannel(InputArray src, OutputArray dst, int coi);
void insertChannel(InputArray src, InputOutputArray dst, int coi);
void mixChannels(InputArrayOfArrays src, InputOutputArrayOfArrays dst, const std::vector<int>& fromTo);
void flip(InputArray src, OutputArray dst, int flipCode);
void rotate(InputArray src, OutputArray dst, int rotateCode);
void transpose(InputArray src, OutputArray dst);
void repeat(InputArray src, int ny, int nx, OutputArray dst);
Mat repeat(const Mat& src, int ny, int nx);
void hconcat(InputArray src1, InputArray src2, OutputArray dst);
void hconcat(InputArrayOfArrays src, OutputArray dst);
void hconcat(const Mat* src, size_t nsrc, OutputArray dst);
void vconcat(InputArray src1, InputArray src2, OutputArray dst);
void vconcat(InputArrayOfArrays src, OutputArray dst);
void vconcat(const Mat* src, size_t nsrc, OutputArray dst);
void copyMakeBorder(InputArray src, OutputArray dst, int top, int bottom, int left, int right, int borderType, const Scalar& value = Scalar());
void LUT(InputArray src, InputArray lut, OutputArray dst);
void gemm(InputArray src1, InputArray src2, double alpha, InputArray src3, double beta, OutputArray dst, int flags = 0);
double invert(InputArray src, OutputArray dst, int flags = DECOMP_LU);
double determinant(InputArray mtx);
bool solve(InputArray src1, InputArray src2, OutputArray dst, int flags = DECOMP_LU);
bool eigen(InputArray src, OutputArray eigenvalues, OutputArray eigenvectors = noArray());
double trace(InputArray mtx);
void reduce(InputArray src, OutputArray dst, int dim, int rtype, int dtype = -1);
void setIdentity(InputOutputArray mtx, const Scalar& s = Scalar(1));
void dft(InputArray src, OutputArray dst, int flags = 0, int nonzeroRows = 0);
void idft(InputArray src, OutputArray dst, int flags = 0, int nonzeroRows = 0);
int getOptimalDFTSize(int vecsize);
double kmeans(InputArray data, int K, InputOutputArray bestLabels, TermCriteria criteria, int attempts, int flags, OutputArray centers = noArray());
void sort(InputArray src, OutputArray dst, int flags);
void sortIdx(InputArray src, OutputArray dst, int flags);
void patchNaNs(InputOutputArray a, double val = 0);
bool checkRange(InputArray a, bool quiet = true, Point* pos = 0, double minVal = -DBL_MAX, double maxVal = DBL_MAX);
int borderInterpolate(int p, int len, int borderType);

// ================================================================ imgproc
enum ColorConversionCodes {
  COLOR_BGR2BGRA = 0, COLOR_RGB2RGBA = COLOR_BGR2BGRA, COLOR_BGRA2BGR = 1, COLOR_RGBA2RGB = COLOR_BGRA2BGR,
  COLOR_BGR2RGBA = 2, COLOR_RGB2BGRA = COLOR_BGR2RGBA, COLOR_RGBA2BGR = 3, COLOR_BGRA2RGB = COLOR_RGBA2BGR,
  COLOR_BGR2RGB = 4, COLOR_RGB2BGR = COLOR_BGR2RGB, COLOR_BGRA2RGBA = 5, COLOR_RGBA2BGRA = COLOR_BGRA2RGBA,
  COLOR_BGR2GRAY = 6, COLOR_RGB2GRAY = 7, COLOR_GRAY2BGR = 8, COLOR_GRAY2RGB = COLOR_GRAY2BGR, COLOR_GRAY2BGRA = 9, COLOR_GRAY2RGBA = COLOR_GRAY2BGRA,
  COLOR_BGRA2GRAY = 10, COLOR_RGBA2GRAY = 11,
  COLOR_BGR2XYZ = 32, COLOR_RGB2XYZ = 33, COLOR_XYZ2BGR = 34, COLOR_XYZ2RGB = 35,
  COLOR_BGR2YCrCb = 36, COLOR_RGB2YCrCb = 37, COLOR_YCrCb2BGR = 38, COLOR_YCrCb2RGB = 39,
  COLOR_BGR2HSV = 40, COLOR_RGB2HSV = 41, COLOR_BGR2Lab = 44, COLOR_RGB2Lab = 45, COLOR_BGR2Luv = 50, COLOR_RGB2Luv = 51,
  COLOR_BGR2HLS = 52, COLOR_RGB2HLS = 53, COLOR_HSV2BGR = 54, COLOR_HSV2RGB = 55, COLOR_Lab2BGR = 56, COLOR_Lab2RGB = 57,
  COLOR_Luv2BGR = 58, COLOR_Luv2RGB = 59, COLOR_HLS2BGR = 60, COLOR_HLS2RGB = 61,
  COLOR_BGR2HSV_FULL = 66, COLOR_RGB2HSV_FULL = 67, COLOR_BGR2HLS_FULL = 68, COLOR_RGB2HLS_FULL = 69,
  COLOR_HSV2BGR_FULL = 70, COLOR_HSV2RGB_FULL = 71, COLOR_HLS2BGR_FULL = 72, COLOR_HLS2RGB_FULL = 73,
  COLOR_BGR2YUV = 82, COLOR_RGB2YUV = 83, COLOR_YUV2BGR = 84, COLOR_YUV2RGB = 85
};
enum ThresholdTypes { THRESH_BINARY = 0, THRESH_BINARY_INV = 1, THRESH_TRUNC = 2, THRESH_TOZERO = 3, THRESH_TOZERO_INV = 4, THRESH_MASK = 7, THRESH_OTSU = 8, THRESH_TRIANGLE = 16, THRESH_DRYRUN = 128 };
enum AdaptiveThresholdTypes { ADAPTIVE_THRESH_MEAN_C = 0, ADAPTIVE_THRESH_GAUSSIAN_C = 1 };
enum InterpolationFlags { INTER_NEAREST = 0, INTER_LINEAR = 1, INTER_CUBIC = 2, INTER_AREA = 3, INTER_LANCZOS4 = 4, INTER_LINEAR_EXACT = 5, INTER_NEAREST_EXACT = 6, INTER_MAX = 7, WARP_FILL_OUTLIERS = 8, WARP_INVERSE_MAP = 16 };
enum MorphTypes { MORPH_ERODE = 0, MORPH_DILATE = 1, MORPH_OPEN = 2, MORPH_CLOSE = 3, MORPH_GRADIENT = 4, MORPH_TOPHAT = 5, MORPH_BLACKHAT = 6, MORPH_HITMISS = 7 };
enum MorphShapes { MORPH_RECT = 0, MORPH_CROSS = 1, MORPH_ELLIPSE = 2 };
enum RetrievalModes { RETR_EXTERNAL = 0, RETR_LIST = 1, RETR_CCOMP = 2, RETR_TREE = 3, RETR_FLOODFILL = 4 };
enum ContourApproximationModes { CHAIN_APPROX_NONE = 1, CHAIN_APPROX_SIMPLE = 2, CHAIN_APPROX_TC89_L1 = 3, CHAIN_APPROX_TC89_KCOS = 4 };
enum LineTypes { FILLED = -1, LINE_4 = 4, LINE_8 = 8, LINE_AA = 16 };
enum HersheyFonts { FONT_HERSHEY_SIMPLEX = 0, FONT_HERSHEY_PLAIN = 1, FONT_HERSHEY_DUPLEX = 2, FONT_HERSHEY_COMPLEX = 3, FONT_HERSHEY_TRIPLEX = 4,
  FONT_HERSHEY_COMPLEX_SMALL = 5, FONT_HERSHEY_SCRIPT_SIMPLEX = 6, FONT_HERSHEY_SCRIPT_COMPLEX = 7, FONT_ITALIC = 16 };
enum MarkerTypes { MARKER_CROSS = 0, MARKER_TILTED_CROSS = 1, MARKER_STAR = 2, MARKER_DIAMOND = 3, MARKER_SQUARE = 4, MARKER_TRIANGLE_UP = 5, MARKER_TRIANGLE_DOWN = 6 };
enum HoughModes { HOUGH_STANDARD = 0, HOUGH_PROBABILISTIC = 1, HOUGH_MULTI_SCALE = 2, HOUGH_GRADIENT = 3, HOUGH_GRADIENT_ALT = 4 };
enum TemplateMatchModes { TM_SQDIFF = 0, TM_SQDIFF_NORMED = 1, TM_CCORR = 2, TM_CCORR_NORMED = 3, TM_CCOEFF = 4, TM_CCOEFF_NORMED = 5 };
enum DistanceTypes { DIST_USER = -1, DIST_L1 = 1, DIST_L2 = 2, DIST_C = 3, DIST_L12 = 4, DIST_FAIR = 5, DIST_WELSCH = 6, DIST_HUBER = 7 };
enum DistanceTransformMasks { DIST_MASK_3 = 3, DIST_MASK_5 = 5, DIST_MASK_PRECISE = 0 };
enum DistanceTransformLabelTypes { DIST_LABEL_CCOMP = 0, DIST_LABEL_PIXEL = 1 };
enum ConnectedComponentsTypes { CC_STAT_LEFT = 0, CC_STAT_TOP = 1, CC_STAT_WIDTH = 2, CC_STAT_HEIGHT = 3, CC_STAT_AREA = 4, CC_STAT_MAX = 5 };
enum ConnectedComponentsAlgorithmsTypes { CCL_DEFAULT = -1, CCL_WU = 0, CCL_GRANA = 1, CCL_BOLELLI = 2, CCL_SAUF = 3, CCL_BBDT = 4, CCL_SPAGHETTI = 5 };
enum HistCompMethods { HISTCMP_CORREL = 0, HISTCMP_CHISQR = 1, HISTCMP_INTERSECT = 2, HISTCMP_BHATTACHARYYA = 3, HISTCMP_HELLINGER = HISTCMP_BHATTACHARYYA, HISTCMP_CHISQR_ALT = 4, HISTCMP_KL_DIV = 5 };
enum ShapeMatchModes { CONTOURS_MATCH_I1 = 1, CONTOURS_MATCH_I2 = 2, CONTOURS_MATCH_I3 = 3 };
enum FloodFillFlags { FLOODFILL_FIXED_RANGE = 1 << 16, FLOODFILL_MASK_ONLY = 1 << 17 };
enum GrabCutClasses { GC_BGD = 0, GC_FGD = 1, GC_PR_BGD = 2, GC_PR_FGD = 3 };
enum GrabCutModes { GC_INIT_WITH_RECT = 0, GC_INIT_WITH_MASK = 1, GC_EVAL = 2, GC_EVAL_FREEZE_MODEL = 3 };
enum ColormapTypes { COLORMAP_AUTUMN = 0, COLORMAP_BONE = 1, COLORMAP_JET = 2, COLORMAP_WINTER = 3, COLORMAP_RAINBOW = 4, COLORMAP_OCEAN = 5, COLORMAP_SUMMER = 6,
  COLORMAP_SPRING = 7, COLORMAP_COOL = 8, COLORMAP_HSV = 9, COLORMAP_PINK = 10, COLORMAP_HOT = 11, COLORMAP_PARULA = 12, COLORMAP_MAGMA = 13, COLORMAP_INFERNO = 14,
  COLORMAP_PLASMA = 15, COLORMAP_VIRIDIS = 16, COLORMAP_CIVIDIS = 17, COLORMAP_TWILIGHT = 18, COLORMAP_TWILIGHT_SHIFTED = 19, COLORMAP_TURBO = 20, COLORMAP_DEEPGREEN = 21 };
enum RectanglesIntersectTypes { INTERSECT_NONE = 0, INTERSECT_PARTIAL = 1, INTERSECT_FULL = 2 };

void cvtColor(InputArray src, OutputArray dst, int code, int dstCn = 0);
double threshold(InputArray src, OutputArray dst, double thresh, double maxval, int type);
void adaptiveThreshold(InputArray src, OutputArray dst, double maxValue, int adaptiveMethod, int thresholdType, int blockSize, double C);
void blur(InputArray src, OutputArray dst, Size ksize, Point anchor = Point(-1, -1), int borderType = BORDER_DEFAULT);
void boxFilter(InputArray src, OutputArray dst, int ddepth, Size ksize, Point anchor = Point(-1, -1), bool normalize = true, int borderType = BORDER_DEFAULT);
void GaussianBlur(InputArray src, OutputArray dst, Size ksize, double sigmaX, double sigmaY = 0, int borderType = BORDER_DEFAULT);
void medianBlur(InputArray src, OutputArray dst, int ksize);
void bilateralFilter(InputArray src, OutputArray dst, int d, double sigmaColor, double sigmaSpace, int borderType = BORDER_DEFAULT);
void filter2D(InputArray src, OutputArray dst, int ddepth, InputArray kernel, Point anchor = Point(-1, -1), double delta = 0, int borderType = BORDER_DEFAULT);
void sepFilter2D(InputArray src, OutputArray dst, int ddepth, InputArray kernelX, InputArray kernelY, Point anchor = Point(-1, -1), double delta = 0, int borderType = BORDER_DEFAULT);
Mat getGaussianKernel(int ksize, double sigma, int ktype = CV_64F);
void Sobel(InputArray src, OutputArray dst, int ddepth, int dx, int dy, int ksize = 3, double scale = 1, double delta = 0, int borderType = BORDER_DEFAULT);
void Scharr(InputArray src, OutputArray dst, int ddepth, int dx, int dy, double scale = 1, double delta = 0, int borderType = BORDER_DEFAULT);
void Laplacian(InputArray src, OutputArray dst, int ddepth, int ksize = 1, double scale = 1, double delta = 0, int borderType = BORDER_DEFAULT);
void Canny(InputArray image, OutputArray edges, double threshold1, double threshold2, int apertureSize = 3, bool L2gradient = false);
void cornerHarris(InputArray src, OutputArray dst, int blockSize, int ksize, double k, int borderType = BORDER_DEFAULT);
void cornerMinEigenVal(InputArray src, OutputArray dst, int blockSize, int ksize = 3, int borderType = BORDER_DEFAULT);
void goodFeaturesToTrack(InputArray image, OutputArray corners, int maxCorners, double qualityLevel, double minDistance, InputArray mask = noArray(), int blockSize = 3, bool useHarrisDetector = false, double k = 0.04);
void cornerSubPix(InputArray image, InputOutputArray corners, Size winSize, Size zeroZone, TermCriteria criteria);
Mat getStructuringElement(int shape, Size ksize, Point anchor = Point(-1, -1));
static inline Scalar morphologyDefaultBorderValue() { return Scalar::all(DBL_MAX); }
void erode(InputArray src, OutputArray dst, InputArray kernel, Point anchor = Point(-1, -1), int iterations = 1, int borderType = BORDER_CONSTANT, const Scalar& borderValue = morphologyDefaultBorderValue());
void dilate(InputArray src, OutputArray dst, InputArray kernel, Point anchor = Point(-1, -1), int iterations = 1, int borderType = BORDER_CONSTANT, const Scalar& borderValue = morphologyDefaultBorderValue());
void morphologyEx(InputArray src, OutputArray dst, int op, InputArray kernel, Point anchor = Point(-1, -1), int iterations = 1, int borderType = BORDER_CONSTANT, const Scalar& borderValue = morphologyDefaultBorderValue());
void resize(InputArray src, OutputArray dst, Size dsize, double fx = 0, double fy = 0, int interpolation = INTER_LINEAR);
void warpAffine(InputArray src, OutputArray dst, InputArray M, Size dsize, int flags = INTER_LINEAR, int borderMode = BORDER_CONSTANT, const Scalar& borderValue = Scalar());
void warpPerspective(InputArray src, OutputArray dst, InputArray M, Size dsize, int flags = INTER_LINEAR, int borderMode = BORDER_CONSTANT, const Scalar& borderValue = Scalar());
void remap(InputArray src, OutputArray dst, InputArray map1, InputArray map2, int interpolation, int borderMode = BORDER_CONSTANT, const Scalar& borderValue = Scalar());
Mat getRotationMatrix2D(Point2f center, double angle, double scale);
Mat getAffineTransform(const Point2f src[], const Point2f dst[]);
Mat getAffineTransform(InputArray src, InputArray dst);
Mat getPerspectiveTransform(const Point2f src[], const Point2f dst[], int solveMethod = DECOMP_LU);
Mat getPerspectiveTransform(InputArray src, InputArray dst, int solveMethod = DECOMP_LU);
void invertAffineTransform(InputArray M, OutputArray iM);
void getRectSubPix(InputArray image, Size patchSize, Point2f center, OutputArray patch, int patchType = -1);
void warpPolar(InputArray src, OutputArray dst, Size dsize, Point2f center, double maxRadius, int flags);
void pyrDown(InputArray src, OutputArray dst, const Size& dstsize = Size(), int borderType = BORDER_DEFAULT);
void pyrUp(InputArray src, OutputArray dst, const Size& dstsize = Size(), int borderType = BORDER_DEFAULT);
void equalizeHist(InputArray src, OutputArray dst);
void calcHist(const Mat* images, int nimages, const int* channels, InputArray mask, OutputArray hist, int dims, const int* histSize, const float** ranges, bool uniform = true, bool accumulate = false);
void calcHist(InputArrayOfArrays images, const std::vector<int>& channels, InputArray mask, OutputArray hist, const std::vector<int>& histSize, const std::vector<float>& ranges, bool accumulate = false);
void calcBackProject(const Mat* images, int nimages, const int* channels, InputArray hist, OutputArray backProject, const float** ranges, double scale = 1, bool uniform = true);
void calcBackProject(InputArrayOfArrays images, const std::vector<int>& channels, InputArray hist, OutputArray dst, const std::vector<float>& ranges, double scale);
double compareHist(InputArray H1, InputArray H2, int method);
void integral(InputArray src, OutputArray sum, int sdepth = -1);
void integral(InputArray src, OutputArray sum, OutputArray sqsum, int sdepth = -1, int sqdepth = -1);
void distanceTransform(InputArray src, OutputArray dst, int distanceType, int maskSize, int dstType = CV_32F);
void distanceTransform(InputArray src, OutputArray dst, OutputArray labels, int distanceType, int maskSize, int labelType = DIST_LABEL_CCOMP);
int connectedComponents(InputArray image, OutputArray labels, int connectivity = 8, int ltype = CV_32S);
int connectedComponentsWithStats(InputArray image, OutputArray labels, OutputArray stats, OutputArray centroids, int connectivity = 8, int ltype = CV_32S);
void findContours(InputArray image, OutputArrayOfArrays contours, OutputArray hierarchy, int mode, int method, Point offset = Point());
void findContours(InputArray image, OutputArrayOfArrays contours, int mode, int method, Point offset = Point());
void drawContours(InputOutputArray image, InputArrayOfArrays contours, int contourIdx, const Scalar& color, int thickness = 1, int lineType = LINE_8, InputArray hierarchy = noArray(), int maxLevel = INT_MAX, Point offset = Point());
double contourArea(InputArray contour, bool oriented = false);
double arcLength(InputArray curve, bool closed);
void approxPolyDP(InputArray curve, OutputArray approxCurve, double epsilon, bool closed);
Rect boundingRect(InputArray array);
RotatedRect minAreaRect(InputArray points);
void boxPoints(RotatedRect box, OutputArray points);
void minEnclosingCircle(InputArray points, Point2f& center, float& radius);
double minEnclosingTriangle(InputArray points, OutputArray triangle);
RotatedRect fitEllipse(InputArray points);
void fitLine(InputArray points, OutputArray line, int distType, double param, double reps, double aeps);
void convexHull(InputArray points, OutputArray hull, bool clockwise = false, bool returnPoints = true);
void convexityDefects(InputArray contour, InputArray convexhull, OutputArray convexityDefects);
bool isContourConvex(InputArray contour);
Moments moments(InputArray array, bool binaryImage = false);
void HuMoments(const Moments& m, double hu[7]);
void HuMoments(const Moments& m, OutputArray hu);
double matchShapes(InputArray contour1, InputArray contour2, int method, double parameter);
double pointPolygonTest(InputArray contour, Point2f pt, bool measureDist);
int rotatedRectangleIntersection(const RotatedRect& rect1, const RotatedRect& rect2, OutputArray intersectingRegion);
void HoughLines(InputArray image, OutputArray lines, double rho, double theta, int threshold, double srn = 0, double stn = 0, double min_theta = 0, double max_theta = CV_PI);
void HoughLinesP(InputArray image, OutputArray lines, double rho, double theta, int threshold, double minLineLength = 0, double maxLineGap = 0);
void HoughCircles(InputArray image, OutputArray circles, int method, double dp, double minDist, double param1 = 100, double param2 = 100, int minRadius = 0, int maxRadius = 0);
void matchTemplate(InputArray image, InputArray templ, OutputArray result, int method, InputArray mask = noArray());
int floodFill(InputOutputArray image, Point seedPoint, Scalar newVal, Rect* rect = 0, Scalar loDiff = Scalar(), Scalar upDiff = Scalar(), int flags = 4);
int floodFill(InputOutputArray image, InputOutputArray mask, Point seedPoint, Scalar newVal, Rect* rect = 0, Scalar loDiff = Scalar(), Scalar upDiff = Scalar(), int flags = 4);
void watershed(InputArray image, InputOutputArray markers);
void grabCut(InputArray img, InputOutputArray mask, Rect rect, InputOutputArray bgdModel, InputOutputArray fgdModel, int iterCount, int mode = GC_EVAL);
void applyColorMap(InputArray src, OutputArray dst, int colormap);
void demosaicing(InputArray src, OutputArray dst, int code, int dstCn = 0);
void accumulate(InputArray src, InputOutputArray dst, InputArray mask = noArray());
void accumulateWeighted(InputArray src, InputOutputArray dst, double alpha, InputArray mask = noArray());
Point2d phaseCorrelate(InputArray src1, InputArray src2, InputArray window = noArray(), double* response = 0);

class CLAHE {
public:
  CLAHE(double clipLimit, Size tileGridSize);
  ~CLAHE();
  void apply(InputArray src, OutputArray dst);
  void setClipLimit(double clipLimit);
  double getClipLimit() const { return clip; }
  void setTilesGridSize(Size tileGridSize);
  Size getTilesGridSize() const { return tiles; }
  void collectGarbage() {}
  int handle;
  double clip;
  Size tiles;
};
Ptr<CLAHE> createCLAHE(double clipLimit = 40.0, Size tileGridSize = Size(8, 8));

// 그리기
void line(InputOutputArray img, Point pt1, Point pt2, const Scalar& color, int thickness = 1, int lineType = LINE_8, int shift = 0);
void arrowedLine(InputOutputArray img, Point pt1, Point pt2, const Scalar& color, int thickness = 1, int lineType = LINE_8, int shift = 0, double tipLength = 0.1);
void rectangle(InputOutputArray img, Point pt1, Point pt2, const Scalar& color, int thickness = 1, int lineType = LINE_8, int shift = 0);
void rectangle(InputOutputArray img, Rect rec, const Scalar& color, int thickness = 1, int lineType = LINE_8, int shift = 0);
void circle(InputOutputArray img, Point center, int radius, const Scalar& color, int thickness = 1, int lineType = LINE_8, int shift = 0);
void ellipse(InputOutputArray img, Point center, Size axes, double angle, double startAngle, double endAngle, const Scalar& color, int thickness = 1, int lineType = LINE_8, int shift = 0);
void ellipse(InputOutputArray img, const RotatedRect& box, const Scalar& color, int thickness = 1, int lineType = LINE_8);
void drawMarker(InputOutputArray img, Point position, const Scalar& color, int markerType = MARKER_CROSS, int markerSize = 20, int thickness = 1, int line_type = 8);
void fillConvexPoly(InputOutputArray img, InputArray points, const Scalar& color, int lineType = LINE_8, int shift = 0);
void fillPoly(InputOutputArray img, InputArrayOfArrays pts, const Scalar& color, int lineType = LINE_8, int shift = 0, Point offset = Point());
void polylines(InputOutputArray img, InputArrayOfArrays pts, bool isClosed, const Scalar& color, int thickness = 1, int lineType = LINE_8, int shift = 0);
void putText(InputOutputArray img, const std::string& text, Point org, int fontFace, double fontScale, Scalar color, int thickness = 1, int lineType = LINE_8, bool bottomLeftOrigin = false);
Size getTextSize(const std::string& text, int fontFace, double fontScale, int thickness, int* baseLine);
double getFontScaleFromHeight(int fontFace, int pixelHeight, int thickness = 1);
bool clipLine(Size imgSize, Point& pt1, Point& pt2);
bool clipLine(Rect imgRect, Point& pt1, Point& pt2);

// ================================================================ imgcodecs · highgui
enum ImreadModes { IMREAD_UNCHANGED = -1, IMREAD_GRAYSCALE = 0, IMREAD_COLOR_BGR = 1, IMREAD_COLOR = 1, IMREAD_ANYDEPTH = 2, IMREAD_ANYCOLOR = 4,
  IMREAD_LOAD_GDAL = 8, IMREAD_REDUCED_GRAYSCALE_2 = 16, IMREAD_REDUCED_COLOR_2 = 17, IMREAD_REDUCED_GRAYSCALE_4 = 32, IMREAD_REDUCED_COLOR_4 = 33,
  IMREAD_REDUCED_GRAYSCALE_8 = 64, IMREAD_REDUCED_COLOR_8 = 65, IMREAD_IGNORE_ORIENTATION = 128, IMREAD_COLOR_RGB = 256 };
enum ImwriteFlags { IMWRITE_JPEG_QUALITY = 1, IMWRITE_PNG_COMPRESSION = 16 };
Mat imread(const std::string& filename, int flags = IMREAD_COLOR_BGR);
bool imwrite(const std::string& filename, InputArray img, const std::vector<int>& params = std::vector<int>());
bool haveImageReader(const std::string& filename);
bool imencode(const std::string& ext, InputArray img, std::vector<uchar>& buf, const std::vector<int>& params = std::vector<int>());
Mat imdecode(InputArray buf, int flags);

enum WindowFlags { WINDOW_NORMAL = 0x00000000, WINDOW_AUTOSIZE = 0x00000001, WINDOW_OPENGL = 0x00001000, WINDOW_FULLSCREEN = 1, WINDOW_FREERATIO = 0x00000100, WINDOW_KEEPRATIO = 0x00000000, WINDOW_GUI_EXPANDED = 0x00000000, WINDOW_GUI_NORMAL = 0x00000010 };
enum MouseEventTypes { EVENT_MOUSEMOVE = 0, EVENT_LBUTTONDOWN = 1, EVENT_RBUTTONDOWN = 2, EVENT_MBUTTONDOWN = 3, EVENT_LBUTTONUP = 4, EVENT_RBUTTONUP = 5, EVENT_MBUTTONUP = 6,
  EVENT_LBUTTONDBLCLK = 7, EVENT_RBUTTONDBLCLK = 8, EVENT_MBUTTONDBLCLK = 9, EVENT_MOUSEWHEEL = 10, EVENT_MOUSEHWHEEL = 11 };
enum MouseEventFlags { EVENT_FLAG_LBUTTON = 1, EVENT_FLAG_RBUTTON = 2, EVENT_FLAG_MBUTTON = 4, EVENT_FLAG_CTRLKEY = 8, EVENT_FLAG_SHIFTKEY = 16, EVENT_FLAG_ALTKEY = 32 };
typedef void (*MouseCallback)(int event, int x, int y, int flags, void* userdata);
typedef void (*TrackbarCallback)(int pos, void* userdata);
void imshow(const std::string& winname, InputArray mat);
int waitKey(int delay = 0);
int waitKeyEx(int delay = 0);
int pollKey();
void namedWindow(const std::string& winname, int flags = WINDOW_AUTOSIZE);
void destroyWindow(const std::string& winname);
void destroyAllWindows();
void moveWindow(const std::string& winname, int x, int y);
void resizeWindow(const std::string& winname, int width, int height);
void setWindowTitle(const std::string& winname, const std::string& title);
enum WindowPropertyFlags { WND_PROP_FULLSCREEN = 0, WND_PROP_AUTOSIZE = 1, WND_PROP_ASPECT_RATIO = 2, WND_PROP_OPENGL = 3, WND_PROP_VISIBLE = 4, WND_PROP_TOPMOST = 5, WND_PROP_VSYNC = 6 };
double getWindowProperty(const std::string& winname, int prop_id);
void setWindowProperty(const std::string& winname, int prop_id, double prop_value);
void setMouseCallback(const std::string& winname, MouseCallback onMouse, void* userdata = 0);
int createTrackbar(const std::string& trackbarname, const std::string& winname, int* value, int count, TrackbarCallback onChange = 0, void* userdata = 0);
int getTrackbarPos(const std::string& trackbarname, const std::string& winname);
void setTrackbarPos(const std::string& trackbarname, const std::string& winname, int pos);
Rect selectROI(const std::string& windowName, InputArray img, bool showCrosshair = true, bool fromCenter = false, bool printNotice = true);

// ================================================================ videoio
enum VideoCaptureAPIs { CAP_ANY = 0, CAP_DSHOW = 700, CAP_MSMF = 1400, CAP_V4L2 = 200, CAP_FFMPEG = 1900, CAP_IMAGES = 2000, CAP_GSTREAMER = 1800 };
enum VideoCaptureProperties { CAP_PROP_POS_MSEC = 0, CAP_PROP_POS_FRAMES = 1, CAP_PROP_POS_AVI_RATIO = 2, CAP_PROP_FRAME_WIDTH = 3, CAP_PROP_FRAME_HEIGHT = 4,
  CAP_PROP_FPS = 5, CAP_PROP_FOURCC = 6, CAP_PROP_FRAME_COUNT = 7, CAP_PROP_FORMAT = 8, CAP_PROP_MODE = 9, CAP_PROP_BRIGHTNESS = 10, CAP_PROP_CONTRAST = 11,
  CAP_PROP_SATURATION = 12, CAP_PROP_HUE = 13, CAP_PROP_GAIN = 14, CAP_PROP_EXPOSURE = 15, CAP_PROP_CONVERT_RGB = 16, CAP_PROP_AUTOFOCUS = 39, CAP_PROP_AUTO_EXPOSURE = 21, CAP_PROP_FOCUS = 28, CAP_PROP_BUFFERSIZE = 38 };
class VideoCapture {
public:
  VideoCapture();
  explicit VideoCapture(int index, int apiPreference = CAP_ANY);
  explicit VideoCapture(const std::string& filename, int apiPreference = CAP_ANY);
  virtual ~VideoCapture();
  VideoCapture(const VideoCapture&) = delete;
  VideoCapture& operator=(const VideoCapture&) = delete;
  virtual bool open(int index, int apiPreference = CAP_ANY);
  virtual bool open(const std::string& filename, int apiPreference = CAP_ANY);
  virtual bool isOpened() const;
  virtual void release();
  virtual bool grab();
  virtual bool retrieve(OutputArray image, int flag = 0);
  virtual bool read(OutputArray image);
  VideoCapture& operator>>(Mat& image);
  virtual bool set(int propId, double value);
  virtual double get(int propId) const;
  std::string getBackendName() const { return "STUDY_SIM"; }
  int handle;
  Mat grabbed;
};
class VideoWriter {
public:
  VideoWriter() : frames(0), opened(false) {}
  VideoWriter(const std::string& filename, int fourcc, double fps, Size frameSize, bool isColor = true) : frames(0), opened(false) { open(filename, fourcc, fps, frameSize, isColor); }
  virtual ~VideoWriter() { release(); }
  virtual bool open(const std::string& filename, int fourcc, double fps, Size frameSize, bool isColor = true);
  virtual bool isOpened() const { return opened; }
  virtual void release();
  virtual void write(InputArray image);
  VideoWriter& operator<<(const Mat& image) { write(image); return *this; }
  static int fourcc(char c1, char c2, char c3, char c4) { return (c1 & 255) + ((c2 & 255) << 8) + ((c3 & 255) << 16) + ((c4 & 255) << 24); }
  std::string name;
  int frames;
  bool opened;
};

// ================================================================ features · geometry (calib3d)
class Algorithm {
public:
  Algorithm() : handle(0) {}
  virtual ~Algorithm();
  virtual void clear() {}
  virtual bool empty() const { return false; }
  virtual std::string getDefaultName() const { return "my_object"; }
  int handle;
};
class Feature2D : public virtual Algorithm {
public:
  virtual ~Feature2D() {}
  virtual void detect(InputArray image, std::vector<KeyPoint>& keypoints, InputArray mask = noArray());
  virtual void compute(InputArray image, std::vector<KeyPoint>& keypoints, OutputArray descriptors);
  virtual void detectAndCompute(InputArray image, InputArray mask, std::vector<KeyPoint>& keypoints, OutputArray descriptors, bool useProvidedKeypoints = false);
  virtual int descriptorSize() const { return 0; }
  virtual int descriptorType() const { return CV_8U; }
  virtual int defaultNorm() const { return NORM_HAMMING; }
};
typedef Feature2D FeatureDetector;
typedef Feature2D DescriptorExtractor;
class ORB : public Feature2D {
public:
  enum ScoreType { HARRIS_SCORE = 0, FAST_SCORE = 1 };
  static const int kBytes = 32;
  static Ptr<ORB> create(int nfeatures = 500, float scaleFactor = 1.2f, int nlevels = 8, int edgeThreshold = 31, int firstLevel = 0, int WTA_K = 2,
    ORB::ScoreType scoreType = ORB::HARRIS_SCORE, int patchSize = 31, int fastThreshold = 20);
  void setMaxFeatures(int maxFeatures);
  int getMaxFeatures() const { return nfeatures; }
  int descriptorSize() const override { return kBytes; }
  std::string getDefaultName() const override { return "Feature2D.ORB"; }
  int nfeatures = 500;
};
class FastFeatureDetector : public Feature2D {
public:
  enum DetectorType { TYPE_5_8 = 0, TYPE_7_12 = 1, TYPE_9_16 = 2 };
  static Ptr<FastFeatureDetector> create(int threshold = 10, bool nonmaxSuppression = true, FastFeatureDetector::DetectorType type = FastFeatureDetector::TYPE_9_16);
};
class GFTTDetector : public Feature2D {
public:
  static Ptr<GFTTDetector> create(int maxCorners = 1000, double qualityLevel = 0.01, double minDistance = 1, int blockSize = 3, bool useHarrisDetector = false, double k = 0.04);
};
class SimpleBlobDetector : public Feature2D {
public:
  struct Params {
    Params();
    float thresholdStep, minThreshold, maxThreshold;
    size_t minRepeatability;
    float minDistBetweenBlobs;
    bool filterByColor; uchar blobColor;
    bool filterByArea; float minArea, maxArea;
    bool filterByCircularity; float minCircularity, maxCircularity;
    bool filterByInertia; float minInertiaRatio, maxInertiaRatio;
    bool filterByConvexity; float minConvexity, maxConvexity;
    bool collectContours;
  };
  static Ptr<SimpleBlobDetector> create(const SimpleBlobDetector::Params& parameters = SimpleBlobDetector::Params());
};
class DescriptorMatcher : public virtual Algorithm {
public:
  enum MatcherType { FLANNBASED = 1, BRUTEFORCE = 2, BRUTEFORCE_L1 = 3, BRUTEFORCE_HAMMING = 4, BRUTEFORCE_HAMMINGLUT = 5, BRUTEFORCE_SL2 = 6 };
  virtual ~DescriptorMatcher() {}
  void match(InputArray queryDescriptors, InputArray trainDescriptors, std::vector<DMatch>& matches, InputArray mask = noArray()) const;
  void knnMatch(InputArray queryDescriptors, InputArray trainDescriptors, std::vector<std::vector<DMatch>>& matches, int k, InputArray mask = noArray(), bool compactResult = false) const;
  void radiusMatch(InputArray queryDescriptors, InputArray trainDescriptors, std::vector<std::vector<DMatch>>& matches, float maxDistance, InputArray mask = noArray(), bool compactResult = false) const;
  static Ptr<DescriptorMatcher> create(const std::string& descriptorMatcherType);
  static Ptr<DescriptorMatcher> create(const DescriptorMatcher::MatcherType& matcherType);
};
class BFMatcher : public DescriptorMatcher {
public:
  BFMatcher(int normType = NORM_L2, bool crossCheck = false);
  static Ptr<BFMatcher> create(int normType = NORM_L2, bool crossCheck = false);
};
enum class DrawMatchesFlags { DEFAULT = 0, DRAW_OVER_OUTIMG = 1, NOT_DRAW_SINGLE_POINTS = 2, DRAW_RICH_KEYPOINTS = 4 };
static inline DrawMatchesFlags operator|(DrawMatchesFlags a, DrawMatchesFlags b) { return (DrawMatchesFlags)((int)a | (int)b); }
void drawKeypoints(InputArray image, const std::vector<KeyPoint>& keypoints, InputOutputArray outImage, const Scalar& color = Scalar::all(-1), DrawMatchesFlags flags = DrawMatchesFlags::DEFAULT);
void drawMatches(InputArray img1, const std::vector<KeyPoint>& keypoints1, InputArray img2, const std::vector<KeyPoint>& keypoints2,
  const std::vector<DMatch>& matches1to2, InputOutputArray outImg, const Scalar& matchColor = Scalar::all(-1), const Scalar& singlePointColor = Scalar::all(-1),
  const std::vector<char>& matchesMask = std::vector<char>(), DrawMatchesFlags flags = DrawMatchesFlags::DEFAULT);
void drawMatches(InputArray img1, const std::vector<KeyPoint>& keypoints1, InputArray img2, const std::vector<KeyPoint>& keypoints2,
  const std::vector<std::vector<DMatch>>& matches1to2, InputOutputArray outImg, const Scalar& matchColor = Scalar::all(-1), const Scalar& singlePointColor = Scalar::all(-1),
  const std::vector<std::vector<char>>& matchesMask = std::vector<std::vector<char>>(), DrawMatchesFlags flags = DrawMatchesFlags::DEFAULT);

enum { LMEDS = 4, RANSAC = 8, RHO = 16, USAC_DEFAULT = 32, USAC_PARALLEL = 33, USAC_FM_8PTS = 34, USAC_FAST = 35, USAC_ACCURATE = 36, USAC_PROSAC = 37, USAC_MAGSAC = 38 };
Mat findHomography(InputArray srcPoints, InputArray dstPoints, int method = 0, double ransacReprojThreshold = 3, OutputArray mask = noArray(), const int maxIters = 2000, const double confidence = 0.995);
Mat findHomography(InputArray srcPoints, InputArray dstPoints, OutputArray mask, int method = 0, double ransacReprojThreshold = 3);
void perspectiveTransform(InputArray src, OutputArray dst, InputArray m);
void transform(InputArray src, OutputArray dst, InputArray m);
Mat estimateAffine2D(InputArray from, InputArray to, OutputArray inliers = noArray(), int method = RANSAC, double ransacReprojThreshold = 3, size_t maxIters = 2000, double confidence = 0.99, size_t refineIters = 10);
Mat estimateAffinePartial2D(InputArray from, InputArray to, OutputArray inliers = noArray(), int method = RANSAC, double ransacReprojThreshold = 3, size_t maxIters = 2000, double confidence = 0.99, size_t refineIters = 10);
void Rodrigues(InputArray src, OutputArray dst, OutputArray jacobian = noArray());

// ================================================================ video
class BackgroundSubtractor : public virtual Algorithm {
public:
  virtual ~BackgroundSubtractor() {}
  virtual void apply(InputArray image, OutputArray fgmask, double learningRate = -1);
  virtual void getBackgroundImage(OutputArray backgroundImage) const;
};
class BackgroundSubtractorMOG2 : public BackgroundSubtractor {
public:
  int getHistory() const { return history; }
  double getVarThreshold() const { return varThreshold; }
  bool getDetectShadows() const { return shadows; }
  int history = 500;
  double varThreshold = 16;
  bool shadows = true;
};
Ptr<BackgroundSubtractorMOG2> createBackgroundSubtractorMOG2(int history = 500, double varThreshold = 16, bool detectShadows = true);
enum { OPTFLOW_USE_INITIAL_FLOW = 4, OPTFLOW_LK_GET_MIN_EIGENVALS = 8, OPTFLOW_FARNEBACK_GAUSSIAN = 256 };
void calcOpticalFlowPyrLK(InputArray prevImg, InputArray nextImg, InputArray prevPts, InputOutputArray nextPts, OutputArray status, OutputArray err,
  Size winSize = Size(21, 21), int maxLevel = 3, TermCriteria criteria = TermCriteria(TermCriteria::COUNT + TermCriteria::EPS, 30, 0.01), int flags = 0, double minEigThreshold = 1e-4);
void calcOpticalFlowFarneback(InputArray prev, InputArray next, InputOutputArray flow, double pyr_scale, int levels, int winsize, int iterations, int poly_n, double poly_sigma, int flags);
int meanShift(InputArray probImage, Rect& window, TermCriteria criteria);
RotatedRect CamShift(InputArray probImage, Rect& window, TermCriteria criteria);

// ================================================================ objdetect · photo
class QRCodeDetector {
public:
  QRCodeDetector();
  ~QRCodeDetector();
  QRCodeDetector(const QRCodeDetector&) = delete;
  QRCodeDetector& operator=(const QRCodeDetector&) = delete;
  bool detect(InputArray img, OutputArray points) const;
  std::string decode(InputArray img, InputArray points, OutputArray straight_code = noArray()) const;
  std::string detectAndDecode(InputArray img, OutputArray points = noArray(), OutputArray straight_code = noArray()) const;
  int handle;
};
enum { INPAINT_NS = 0, INPAINT_TELEA = 1 };
void inpaint(InputArray src, InputArray inpaintMask, OutputArray dst, double inpaintRadius, int flags);
void groupRectangles(std::vector<Rect>& rectList, int groupThreshold, double eps = 0.2);

// ---------------------------------------------------------------- 내부: 브라우저 브리지
namespace detail {
/** 이 브라우저 환경에서 동작하지 않는 기능 안내 (Visual Studio 에서는 실제로 동작) */
void notSupported(const char* what);
void note(const std::string& text);
}

} // namespace cv

#endif
