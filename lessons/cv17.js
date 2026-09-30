/* 17차시 실전 검사 프로젝트: 개수 세기 · 색 분류 · 결함 검사 (3교시) — vs/Ch17_Inspection */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 검사 프로그램의 공통 흐름 — 세 검사기는 가운데 단계만 다르다
  const FIG_PIPE = `<svg viewBox="0 0 760 380" role="img" aria-label="검사 프로그램의 공통 6단계 흐름과 개수 세기 · 색 분류 · 결함 검사가 각 단계에서 하는 일">
  ${ARROW('c17a1')}
  <text x="380" y="20" text-anchor="middle" class="tx-b">검사 프로그램의 공통 흐름 — 세 검사기는 ②~⑤ 의 내용만 다르다</text>
  <rect x="16" y="36" width="110" height="60" rx="10" class="p1s"/><text x="71" y="60" text-anchor="middle" class="tx-b">① 입력</text><text x="71" y="80" text-anchor="middle" class="tx-m">imread · 카메라</text>
  <rect x="140" y="36" width="110" height="60" rx="10" class="p2s"/><text x="195" y="60" text-anchor="middle" class="tx-b">② 전처리</text><text x="195" y="80" text-anchor="middle" class="tx-m">Gray · 블러 · HSV</text>
  <rect x="264" y="36" width="110" height="60" rx="10" class="p2s"/><text x="319" y="60" text-anchor="middle" class="tx-b">③ 분할</text><text x="319" y="80" text-anchor="middle" class="tx-m">이진화 · 차영상</text>
  <rect x="388" y="36" width="110" height="60" rx="10" class="p3s"/><text x="443" y="60" text-anchor="middle" class="tx-b">④ 측정</text><text x="443" y="80" text-anchor="middle" class="tx-m">윤곽 · 면적 · 위치</text>
  <rect x="512" y="36" width="110" height="60" rx="10" class="p4s"/><text x="567" y="60" text-anchor="middle" class="tx-b">⑤ 판정</text><text x="567" y="80" text-anchor="middle" class="tx-m">기대값 · 공차</text>
  <rect x="636" y="36" width="110" height="60" rx="10" class="p5s"/><text x="691" y="60" text-anchor="middle" class="tx-b">⑥ 기록</text><text x="691" y="80" text-anchor="middle" class="tx-m">CSV · 이미지</text>
  <line x1="127" y1="66" x2="137" y2="66" class="ln" stroke-width="2" marker-end="url(#c17a1)"/>
  <line x1="251" y1="66" x2="261" y2="66" class="ln" stroke-width="2" marker-end="url(#c17a1)"/>
  <line x1="375" y1="66" x2="385" y2="66" class="ln" stroke-width="2" marker-end="url(#c17a1)"/>
  <line x1="499" y1="66" x2="509" y2="66" class="ln" stroke-width="2" marker-end="url(#c17a1)"/>
  <line x1="623" y1="66" x2="633" y2="66" class="ln" stroke-width="2" marker-end="url(#c17a1)"/>

  <rect x="16" y="112" width="730" height="60" rx="8" class="card-bg"/>
  <text x="71" y="138" text-anchor="middle" class="tx-b">개수 세기</text><text x="71" y="156" text-anchor="middle" class="tx-m">washers · coins</text>
  <text x="195" y="138" text-anchor="middle" class="tx-m">흑백 + 블러 5×5</text>
  <text x="319" y="138" text-anchor="middle" class="tx-m">Otsu + 극성 판단</text><text x="319" y="156" text-anchor="middle" class="tx-m">+ 열기(잡점 제거)</text>
  <text x="443" y="138" text-anchor="middle" class="tx-m">바깥 윤곽선</text><text x="443" y="156" text-anchor="middle" class="tx-m">면적 ≥ 300 · 개수</text>
  <text x="567" y="138" text-anchor="middle" class="tx-m">개수 == 기대</text><text x="567" y="156" text-anchor="middle" class="tx-m">붙음 의심 없음</text>
  <text x="691" y="138" text-anchor="middle" class="tx-m">사각형 · 번호</text><text x="691" y="156" text-anchor="middle" class="tx-m">OK/NG 띠</text>

  <rect x="16" y="180" width="730" height="60" rx="8" class="card-bg"/>
  <text x="71" y="206" text-anchor="middle" class="tx-b">색 분류</text><text x="71" y="224" text-anchor="middle" class="tx-m">color_caps</text>
  <text x="195" y="206" text-anchor="middle" class="tx-m">BGR → HSV</text>
  <text x="319" y="206" text-anchor="middle" class="tx-m">색마다 inRange</text><text x="319" y="224" text-anchor="middle" class="tx-m">(빨강은 두 구간)</text>
  <text x="443" y="206" text-anchor="middle" class="tx-m">윤곽선 · 면적</text><text x="443" y="224" text-anchor="middle" class="tx-m">색별 개수</text>
  <text x="567" y="206" text-anchor="middle" class="tx-m">색별 개수</text><text x="567" y="224" text-anchor="middle" class="tx-m">== 기대</text>
  <text x="691" y="206" text-anchor="middle" class="tx-m">색마다 원</text><text x="691" y="224" text-anchor="middle" class="tx-m">OK/NG 띠</text>

  <rect x="16" y="248" width="730" height="60" rx="8" class="card-bg"/>
  <text x="71" y="274" text-anchor="middle" class="tx-b">결함 검사</text><text x="71" y="292" text-anchor="middle" class="tx-m">metal · pcb</text>
  <text x="195" y="274" text-anchor="middle" class="tx-m">흑백 (골든도)</text>
  <text x="319" y="274" text-anchor="middle" class="tx-m">|골든 − 검사|</text><text x="319" y="292" text-anchor="middle" class="tx-m">블러 → 임계 → 닫기</text>
  <text x="443" y="274" text-anchor="middle" class="tx-m">윤곽선</text><text x="443" y="292" text-anchor="middle" class="tx-m">면적 ≥ 80 · 위치</text>
  <text x="567" y="274" text-anchor="middle" class="tx-m">결함 0개</text><text x="567" y="292" text-anchor="middle" class="tx-m">→ OK</text>
  <text x="691" y="274" text-anchor="middle" class="tx-m">결함 상자 D1…</text><text x="691" y="292" text-anchor="middle" class="tx-m">OK/NG 띠</text>

  <rect x="16" y="322" width="730" height="46" rx="10" class="p1s"/>
  <text x="381" y="342" text-anchor="middle" class="tx">결과는 모두 같은 모양: <tspan class="tx-b">InspectionResult { ok · values · defects · overlay }</tspan></text>
  <text x="381" y="360" text-anchor="middle" class="tx-m">→ summary() 한 줄 · CSV 한 줄 · NG 근거 이미지 — 그래서 한 반복문으로 모두 처리할 수 있다</text>
</svg>`;

  // 그림 2: 클래스 다이어그램
  const FIG_CLASS = `<svg viewBox="0 0 760 350" role="img" aria-label="Inspector 추상 클래스와 세 검사기 클래스, InspectionResult 구조체, main 의 관계를 나타낸 클래스 다이어그램">
  ${ARROW('c17a2')}
  <rect x="16" y="16" width="226" height="96" rx="10" class="p5s"/>
  <text x="129" y="38" text-anchor="middle" class="tx-b">main.cpp</text>
  <text x="129" y="60" text-anchor="middle" class="tx-m">vector&lt;unique_ptr&lt;Inspector&gt;&gt; (소유)</text>
  <text x="129" y="80" text-anchor="middle" class="tx-m">jobs: { 파일, Inspector* } (가리킴)</text>
  <text x="129" y="100" text-anchor="middle" class="tx-m">job.inspector-&gt;inspect(img)</text>

  <rect x="276" y="16" width="226" height="96" rx="10" class="p1s"/>
  <text x="389" y="36" text-anchor="middle" class="tx-m">«추상 클래스»</text>
  <text x="389" y="56" text-anchor="middle" class="tx-b">Inspector</text>
  <line x1="286" y1="64" x2="492" y2="64" class="ln"/>
  <text x="296" y="82" class="tx-m">+ virtual name() const = 0</text>
  <text x="296" y="100" class="tx-m">+ virtual inspect(const Mat&amp;) = 0</text>

  <rect x="536" y="16" width="210" height="96" rx="10" class="p2s"/>
  <text x="641" y="36" text-anchor="middle" class="tx-b">struct InspectionResult</text>
  <text x="641" y="56" text-anchor="middle" class="tx-m">ok · inspector · image</text>
  <text x="641" y="74" text-anchor="middle" class="tx-m">values (vector&lt;Measurement&gt;)</text>
  <text x="641" y="92" text-anchor="middle" class="tx-m">defects (vector&lt;Rect&gt;) · overlay</text>
  <text x="641" y="108" text-anchor="middle" class="tx-m">summary()</text>

  <line x1="244" y1="64" x2="272" y2="64" class="ln" stroke-width="2" marker-end="url(#c17a2)"/>
  <text x="258" y="12" text-anchor="middle" class="tx-m">호출</text>
  <line x1="504" y1="64" x2="532" y2="64" class="ln" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#c17a2)"/>
  <text x="518" y="12" text-anchor="middle" class="tx-m">반환</text>

  <rect x="16" y="190" width="230" height="104" rx="10" class="p3s"/>
  <text x="131" y="212" text-anchor="middle" class="tx-b">CountInspector</text>
  <line x1="26" y1="220" x2="236" y2="220" class="ln"/>
  <text x="28" y="240" class="tx-m">expected · minArea(300)</text>
  <text x="28" y="258" class="tx-m">mergedRatio(1.8)</text>
  <text x="28" y="280" class="tx-m">inspect() override</text>

  <rect x="265" y="190" width="230" height="104" rx="10" class="p3s"/>
  <text x="380" y="212" text-anchor="middle" class="tx-b">ColorSortInspector</text>
  <line x1="275" y1="220" x2="485" y2="220" class="ln"/>
  <text x="277" y="240" class="tx-m">specs: vector&lt;ColorSpec&gt; (데이터)</text>
  <text x="277" y="258" class="tx-m">expected: map&lt;string, int&gt;</text>
  <text x="277" y="280" class="tx-m">inspect() override</text>

  <rect x="514" y="190" width="230" height="104" rx="10" class="p3s"/>
  <text x="629" y="212" text-anchor="middle" class="tx-b">DefectInspector</text>
  <line x1="524" y1="220" x2="734" y2="220" class="ln"/>
  <text x="526" y="240" class="tx-m">생성자(golden) · golden_ (private)</text>
  <text x="526" y="258" class="tx-m">diffThreshold · closeSize · minArea</text>
  <text x="526" y="280" class="tx-m">inspect() override</text>

  <line x1="131" y1="188" x2="360" y2="116" class="ln" stroke-width="2" marker-end="url(#c17a2)"/>
  <line x1="380" y1="188" x2="389" y2="116" class="ln" stroke-width="2" marker-end="url(#c17a2)"/>
  <line x1="629" y1="188" x2="418" y2="116" class="ln" stroke-width="2" marker-end="url(#c17a2)"/>
  <text x="560" y="160" class="tx-m">public 상속 (is-a)</text>

  <text x="380" y="318" text-anchor="middle" class="tx">main 은 <tspan class="tx-b">Inspector 로만</tspan> 부른다 → 새 검사기 = 클래스 하나 + jobs 한 줄 (main 의 반복문은 그대로)</text>
  <text x="380" y="340" text-anchor="middle" class="tx-m">16차시 Filter · Pipeline 과 같은 설계: 공통 인터페이스 + 가상 함수 + unique_ptr 로 소유</text>
</svg>`;

  // 그림 3: 개수 세기 파이프라인 (CountInspector)
  const FIG_COUNT = `<svg viewBox="0 0 760 330" role="img" aria-label="CountInspector 의 처리 순서: 흑백 블러, Otsu 와 극성 판단, 열기, 바깥 윤곽선, 면적 필터, 판정과 오버레이">
  ${ARROW('c17a3')}
  <rect x="14" y="30" width="112" height="60" rx="10" class="p1s"/>
  <text x="70" y="54" text-anchor="middle" class="tx-b">입력 영상</text>
  <text x="70" y="74" text-anchor="middle" class="tx-m">const Mat&amp; img</text>
  <rect x="146" y="30" width="112" height="60" rx="10" class="p2s"/>
  <text x="202" y="54" text-anchor="middle" class="tx-b">toGray + 블러</text>
  <text x="202" y="74" text-anchor="middle" class="tx-m">GaussianBlur 5×5</text>
  <rect x="278" y="30" width="146" height="60" rx="10" class="p2s"/>
  <text x="351" y="50" text-anchor="middle" class="tx-b">Otsu 이진화</text>
  <text x="351" y="68" text-anchor="middle" class="tx-m">흰 비율 &gt; 50% 면</text>
  <text x="351" y="84" text-anchor="middle" class="tx-m">bitwise_not (반전)</text>
  <rect x="444" y="30" width="146" height="60" rx="10" class="p3s"/>
  <text x="517" y="50" text-anchor="middle" class="tx-b">morphologyEx</text>
  <text x="517" y="68" text-anchor="middle" class="tx-m">MORPH_OPEN 타원 3×3</text>
  <text x="517" y="84" text-anchor="middle" class="tx-m">작은 잡점 제거</text>
  <rect x="610" y="30" width="136" height="60" rx="10" class="p3s"/>
  <text x="678" y="50" text-anchor="middle" class="tx-b">findContours</text>
  <text x="678" y="68" text-anchor="middle" class="tx-m">RETR_EXTERNAL</text>
  <text x="678" y="84" text-anchor="middle" class="tx-m">(구멍은 세지 않음)</text>
  <line x1="128" y1="60" x2="142" y2="60" class="ln" stroke-width="2" marker-end="url(#c17a3)"/>
  <line x1="260" y1="60" x2="274" y2="60" class="ln" stroke-width="2" marker-end="url(#c17a3)"/>
  <line x1="426" y1="60" x2="440" y2="60" class="ln" stroke-width="2" marker-end="url(#c17a3)"/>
  <line x1="592" y1="60" x2="606" y2="60" class="ln" stroke-width="2" marker-end="url(#c17a3)"/>

  <rect x="60" y="140" width="190" height="64" rx="10" class="p4s"/>
  <text x="155" y="162" text-anchor="middle" class="tx-b">면적 필터 · 정렬</text>
  <text x="155" y="180" text-anchor="middle" class="tx-m">contourArea ≥ minArea(300)</text>
  <text x="155" y="196" text-anchor="middle" class="tx-m">위→아래, 왼→오 번호 (sort)</text>
  <rect x="280" y="140" width="200" height="64" rx="10" class="p5s"/>
  <text x="380" y="162" text-anchor="middle" class="tx-b">판정</text>
  <text x="380" y="180" text-anchor="middle" class="tx-m">개수 == expected ?</text>
  <text x="380" y="196" text-anchor="middle" class="tx-m">면적 ≥ 중앙값 × 1.8 → 붙음 의심</text>
  <rect x="510" y="140" width="200" height="64" rx="10" class="p1s"/>
  <text x="610" y="162" text-anchor="middle" class="tx-b">오버레이</text>
  <text x="610" y="180" text-anchor="middle" class="tx-m">rectangle · putLabel 번호</text>
  <text x="610" y="196" text-anchor="middle" class="tx-m">putJudge (OK/NG 띠)</text>
  <line x1="678" y1="92" x2="678" y2="118" class="ln" stroke-width="2"/>
  <line x1="678" y1="118" x2="155" y2="118" class="ln" stroke-width="2"/>
  <line x1="155" y1="118" x2="155" y2="136" class="ln" stroke-width="2" marker-end="url(#c17a3)"/>
  <line x1="252" y1="172" x2="276" y2="172" class="ln" stroke-width="2" marker-end="url(#c17a3)"/>
  <line x1="482" y1="172" x2="506" y2="172" class="ln" stroke-width="2" marker-end="url(#c17a3)"/>

  <rect x="60" y="234" width="650" height="56" rx="10" class="card-bg"/>
  <text x="385" y="256" text-anchor="middle" class="tx-b">InspectionResult { ok · values{count, expected} · defects(붙음 의심) · overlay }</text>
  <text x="385" y="276" text-anchor="middle" class="tx-m">washers.png: 13개 중 11개 검출 + 붙음 의심 2곳 → NG / coins_parts.png: 12개 → OK</text>
  <line x1="610" y1="206" x2="610" y2="230" class="ln" stroke-width="2" marker-end="url(#c17a3)"/>
  <text x="385" y="316" text-anchor="middle" class="tx-m">닿아 있는 부품은 개수가 적게 나온다 → 붙음 의심으로 보고하거나, 거리 변환 + watershed 로 분리 (11 → 13)</text>
</svg>`;

  // 그림 4: 기준 격자 대조 (핀 검사)
  const FIG_GRID = `<svg viewBox="0 0 740 260" role="img" aria-label="공칭 격자 좌표와 실제 검출 중심을 비교해 누락과 휨을 판정하는 방법">
  <text x="370" y="26" text-anchor="middle" class="tx-b">공칭 격자 x = 100 + 40·i (i = 0…11), y = 240</text>
  <line x1="40" y1="90" x2="700" y2="90" class="ax"/>
  <g class="tx-m" font-size="11">
    <text x="60" y="118" text-anchor="middle">i=0</text><text x="113" y="118" text-anchor="middle">1</text><text x="166" y="118" text-anchor="middle">2</text>
    <text x="219" y="118" text-anchor="middle">3</text><text x="272" y="118" text-anchor="middle">4</text><text x="325" y="118" text-anchor="middle">5</text>
    <text x="378" y="118" text-anchor="middle">6</text><text x="431" y="118" text-anchor="middle">7</text><text x="484" y="118" text-anchor="middle">8</text>
    <text x="537" y="118" text-anchor="middle">9</text><text x="590" y="118" text-anchor="middle">10</text><text x="643" y="118" text-anchor="middle">11</text>
  </g>
  <g>
    <rect x="50" y="76" width="20" height="20" rx="3" class="p2s"/><rect x="103" y="76" width="20" height="20" rx="3" class="p2s"/>
    <rect x="156" y="76" width="20" height="20" rx="3" class="p2s"/><rect x="209" y="76" width="20" height="20" rx="3" class="p2s"/>
    <rect x="266" y="84" width="20" height="20" rx="3" class="p4s"/><rect x="315" y="76" width="20" height="20" rx="3" class="p2s"/>
    <rect x="368" y="76" width="20" height="20" rx="3" class="p2s"/><rect x="421" y="76" width="20" height="20" rx="3" class="p2s"/>
    <rect x="474" y="76" width="20" height="20" rx="3" class="p5s" stroke-dasharray="3 3"/><rect x="527" y="76" width="20" height="20" rx="3" class="p2s"/>
    <rect x="580" y="76" width="20" height="20" rx="3" class="p2s"/><rect x="633" y="76" width="20" height="20" rx="3" class="p2s"/>
  </g>
  <text x="276" y="150" text-anchor="middle" class="tx">i=4 : 중심이 (+3.5, +9.0) 만큼 벗어남</text>
  <text x="276" y="168" text-anchor="middle" class="tx-m">거리 9.7 px &gt; 5 → <tspan class="tx-b">휨(NG)</tspan></text>
  <text x="520" y="150" text-anchor="middle" class="tx">i=8 : 가까운 블롭이 없음</text>
  <text x="520" y="168" text-anchor="middle" class="tx-m">최근접 거리 39.9 px &gt; 20 → <tspan class="tx-b">누락(NG)</tspan></text>
  <rect x="60" y="188" width="620" height="56" rx="10" class="card-bg"/>
  <text x="370" y="210" text-anchor="middle" class="tx">판정 규칙: 공칭 위치마다 <tspan class="tx-b">가장 가까운 블롭 중심까지의 거리</tspan> norm(p − q) 를 구한다</text>
  <text x="370" y="232" text-anchor="middle" class="tx-m">거리 ≤ 5 px → OK / 5 &lt; 거리 ≤ 20 px → 휨 / 거리 &gt; 20 px → 누락</text>
</svg>`;

  // ================================================================= 1교시 예제
  const BASE = `// ===== File: Inspector.h =====
#pragma once
#include <opencv2/opencv.hpp>
#include <string>
#include <vector>

// 측정값 한 줄: 이름 + 값 (예: count = 11)
struct Measurement
{
    std::string name;
    double value;
};

// 검사 한 번의 결과: 판정 · 측정값 · 불량 위치 · 근거 이미지
struct InspectionResult
{
    std::string inspector;              // 검사기 이름
    std::string image;                  // 이미지 파일 이름
    bool ok = true;                     // 판정 (OK / NG)
    std::vector<Measurement> values;    // 측정값들
    std::vector<cv::Rect> defects;      // 불량(의심) 위치
    cv::Mat overlay;                    // 근거를 그린 이미지

    std::string summary() const;        // 한 줄 요약 (Inspector.cpp)
};

// 모든 검사기의 공통 인터페이스 (추상 클래스)
class Inspector
{
public:
    virtual ~Inspector() = default;
    virtual std::string name() const = 0;
    virtual InspectionResult inspect(const cv::Mat& img) = 0;
};

// 검사기들이 함께 쓰는 도우미
cv::Mat toGray(const cv::Mat& src);
cv::Mat toBgr(const cv::Mat& src);
void putLabel(cv::Mat& img, const std::string& text, cv::Point org, cv::Scalar color, double scale = 0.6);
void putJudge(cv::Mat& img, bool ok);

// ===== File: Inspector.cpp =====
#include "Inspector.h"
using namespace cv;

std::string InspectionResult::summary() const
{
    std::string s = std::string(ok ? "OK" : "NG") + " | " + inspector + " | " + image + " |";
    for (const Measurement& m : values)
        s += " " + m.name + "=" + format("%g", m.value);
    if (!defects.empty())
        s += " | 불량 " + std::to_string(defects.size()) + "곳";
    return s;
}

Mat toGray(const Mat& src)
{
    if (src.channels() == 1) return src.clone();
    Mat gray;
    cvtColor(src, gray, COLOR_BGR2GRAY);
    return gray;
}

Mat toBgr(const Mat& src)
{
    if (src.channels() == 3) return src.clone();
    Mat bgr;
    cvtColor(src, bgr, COLOR_GRAY2BGR);
    return bgr;
}

// 검은 테두리 + 색 글자 → 밝은 배경에서도 어두운 배경에서도 보인다
void putLabel(Mat& img, const std::string& text, Point org, Scalar color, double scale)
{
    putText(img, text, org, FONT_HERSHEY_SIMPLEX, scale, Scalar(0, 0, 0), 3, LINE_AA);
    putText(img, text, org, FONT_HERSHEY_SIMPLEX, scale, color, 1, LINE_AA);
}

// 맨 위 판정 띠: OK 초록 · NG 빨강 (putText 는 한글을 못 그린다 → 영문)
void putJudge(Mat& img, bool ok)
{
    Scalar color = ok ? Scalar(0, 180, 0) : Scalar(0, 0, 220);
    rectangle(img, Rect(0, 0, img.cols, 44), color, FILLED);
    putText(img, ok ? "OK" : "NG", Point(12, 34), FONT_HERSHEY_DUPLEX, 1.1, Scalar(255, 255, 255), 2, LINE_AA);
}`;
  const COUNT_H = `// ===== File: CountInspector.h =====
#pragma once
#include "Inspector.h"
#include <algorithm>

// 개수 세기: 블러 → Otsu(극성 자동) → 열기 → 바깥 윤곽선 → 면적 필터 → 판정
class CountInspector : public Inspector
{
public:
    int expected = 0;           // 기대 개수 (0 이면 개수 판정 안 함)
    double minArea = 300;       // 이보다 작은 덩어리는 잡음
    double mergedRatio = 1.8;   // 면적이 중앙값의 1.8배 이상 → "붙음 의심"

    std::string name() const override { return "개수 세기"; }

    InspectionResult inspect(const cv::Mat& img) override
    {
        using namespace cv;
        Mat gray = toGray(img), bin;
        GaussianBlur(gray, gray, Size(5, 5), 0);
        threshold(gray, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
        if (countNonZero(bin) > bin.total() / 2)      // 흰색이 절반 이상 = 배경 → 반전
            bitwise_not(bin, bin);
        morphologyEx(bin, bin, MORPH_OPEN, getStructuringElement(MORPH_ELLIPSE, Size(3, 3)));

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

        InspectionResult r;
        r.inspector = name();
        r.overlay = toBgr(img);
        double median = 0;
        if (!blobs.empty())
        {
            std::vector<double> areas;
            for (const Blob& b : blobs) areas.push_back(b.area);
            std::sort(areas.begin(), areas.end());
            median = areas[areas.size() / 2];
        }
        for (size_t i = 0; i < blobs.size(); i++)
        {
            bool merged = blobs[i].area >= mergedRatio * median;   // 두 개가 붙은 덩어리?
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
};`;
  const COLOR_H = `// ===== File: ColorSortInspector.h =====
#pragma once
#include "Inspector.h"
#include <map>

// 색 하나의 정의 (데이터): 이름 · HSV 범위 · (빨강처럼 H 가 끊기면) 두 번째 범위 · 그릴 색
struct ColorSpec
{
    std::string name;
    cv::Scalar lo, hi;
    cv::Scalar lo2, hi2;        // 두 번째 범위 (없으면 hi2[0] < 0)
    cv::Scalar draw;
};

// 색 분류: BGR → HSV → 색마다 inRange → 열기 · 닫기 → 윤곽선 → 면적 필터 → 색별 개수
class ColorSortInspector : public Inspector
{
public:
    std::vector<ColorSpec> specs = {
        { "red",    { 0, 90, 60},  {  8, 255, 255}, {170, 90, 60}, {179, 255, 255}, {  0,   0, 255} },
        { "yellow", {18, 90, 60},  { 35, 255, 255}, {0, 0, 0}, {-1, 0, 0},          {  0, 255, 255} },
        { "green",  {40, 70, 50},  { 85, 255, 255}, {0, 0, 0}, {-1, 0, 0},          {  0, 255,   0} },
        { "blue",   {95, 90, 50},  {130, 255, 255}, {0, 0, 0}, {-1, 0, 0},          {255, 144,  30} },
        { "white",  { 0,  0, 170}, {179,  60, 255}, {0, 0, 0}, {-1, 0, 0},          {255, 255, 255} },
    };
    std::map<std::string, int> expected;   // 색별 기대 개수 (비어 있으면 판정 안 함)
    double minArea = 400;

    std::string name() const override { return "색 분류"; }

    InspectionResult inspect(const cv::Mat& img) override
    {
        using namespace cv;
        Mat bgr = toBgr(img), hsv;
        cvtColor(bgr, hsv, COLOR_BGR2HSV);
        Mat kernel = getStructuringElement(MORPH_ELLIPSE, Size(5, 5));

        InspectionResult r;
        r.inspector = name();
        r.overlay = bgr.clone();
        int total = 0;
        for (const ColorSpec& spec : specs)
        {
            Mat mask, mask2;
            inRange(hsv, spec.lo, spec.hi, mask);
            if (spec.hi2[0] >= 0)                              // 두 번째 범위가 있으면 OR
            {
                inRange(hsv, spec.lo2, spec.hi2, mask2);
                mask |= mask2;
            }
            morphologyEx(mask, mask, MORPH_OPEN, kernel);      // 하이라이트 · 경계 잡점 제거
            morphologyEx(mask, mask, MORPH_CLOSE, kernel);     // 톱니 무늬 구멍 메우기

            std::vector<std::vector<Point>> contours;
            findContours(mask, contours, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
            int count = 0;
            for (const auto& c : contours)
            {
                if (contourArea(c) < minArea) continue;
                count++;
                Point2f center;
                float radius;
                minEnclosingCircle(c, center, radius);
                circle(r.overlay, center, (int)radius, spec.draw, 2);
                putLabel(r.overlay, spec.name.substr(0, 1), Point(center) + Point(-5, 5), spec.draw, 0.5);
            }
            total += count;
            r.values.push_back({ spec.name, (double)count });
            auto it = expected.find(spec.name);
            if (it != expected.end() && it->second != count) r.ok = false;   // 기대와 다르면 NG
        }
        r.values.push_back({ "total", (double)total });
        putJudge(r.overlay, r.ok);
        return r;
    }
};`;
  const DEFECT_H = `// ===== File: DefectInspector.h =====
#pragma once
#include "Inspector.h"
#include <algorithm>
#include <stdexcept>

// 결함 검사: |골든 − 검사| → 블러 → 임계값 → 닫기 → 윤곽선 → 면적 필터 → 결함 상자
// 골든(양품 기준) 영상은 "검사기의 설정" 이므로 생성자에서 받는다 → inspect(img) 모양은 다른 검사기와 같다
class DefectInspector : public Inspector
{
public:
    double diffThreshold = 10;   // 차이가 이보다 크면 결함 후보 (낮출수록 민감)
    int closeSize = 21;          // 끊어진 긁힘을 이어 붙이는 닫기 커널
    double minArea = 80;         // 이보다 작은 후보는 잡음

    explicit DefectInspector(const cv::Mat& golden) : golden_(toGray(golden)) {}

    std::string name() const override { return "결함 검사"; }

    InspectionResult inspect(const cv::Mat& img) override
    {
        using namespace cv;
        Mat gray = toGray(img);
        if (gray.size() != golden_.size())          // 사용 방법 오류 → 예외로 알린다
            throw std::invalid_argument("골든과 크기가 다릅니다");

        Mat diff, bin;
        absdiff(gray, golden_, diff);
        GaussianBlur(diff, diff, Size(5, 5), 0);
        threshold(diff, bin, diffThreshold, 255, THRESH_BINARY);
        morphologyEx(bin, bin, MORPH_CLOSE, getStructuringElement(MORPH_ELLIPSE, Size(closeSize, closeSize)));

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

        r.overlay = toBgr(img);
        for (size_t i = 0; i < r.defects.size(); i++)
        {
            Rect box = r.defects[i] + Size(12, 12) - Point(6, 6);   // 6 px 여유를 두고 그린다
            rectangle(r.overlay, box, Scalar(0, 0, 255), 2);
            putLabel(r.overlay, "D" + std::to_string(i + 1), box.tl() + Point(0, -6), Scalar(0, 0, 255));
        }
        putJudge(r.overlay, r.ok);
        return r;
    }

private:
    cv::Mat golden_;             // 흑백으로 바꿔 한 번만 저장
};`;
  const join = (...parts) => parts.join('\n\n');

  const EX_COUNT = join(BASE, COUNT_H, `// ===== File: main.cpp =====
#include "CountInspector.h"
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/washers.png", IMREAD_GRAYSCALE);
    CountInspector counter;
    counter.expected = 13;                    // 와셔 6 + 너트 4 + 볼트 3

    InspectionResult r = counter.inspect(img);
    r.image = "washers.png";
    cout << r.summary() << endl;
    for (const Rect& d : r.defects)
        cout << "  붙음 의심: " << d << endl;

    // 같은 검사기를 다른 제품에 — 설정(기대 개수)만 바꾼다
    Mat coins = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    counter.expected = 12;
    InspectionResult r2 = counter.inspect(coins);
    r2.image = "coins_parts.png";
    cout << r2.summary() << endl;

    imshow("washers", r.overlay);
    imshow("coins_parts", r2.overlay);
    waitKey(0);
    return 0;
}`);
  const EX_POLARITY = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <iomanip>
using namespace cv;
using namespace std;

// Otsu 이진화 결과에서 흰 픽셀의 비율 (0~1)
double whiteRatio(const Mat& gray, Mat& bin)
{
    threshold(gray, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    return (double)countNonZero(bin) / bin.total();
}

// 바깥 윤곽선 중 면적 minArea 이상인 것의 개수
int countBlobs(const Mat& bin, double minArea)
{
    vector<vector<Point>> contours;
    findContours(bin, contours, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    int n = 0;
    for (const auto& c : contours)
        if (contourArea(c) >= minArea) n++;
    return n;
}

int main()
{
    const char* files[] = { "washers.png", "coins_parts.png", "connector_pins.png" };
    for (const char* f : files)
    {
        Mat gray = imread(string("images/") + f, IMREAD_GRAYSCALE);
        Mat bin;
        double ratio = whiteRatio(gray, bin);
        bool invert = ratio > 0.5;                 // 흰색이 절반 이상이면 그것이 배경
        if (invert) bitwise_not(bin, bin);
        cout << left << setw(20) << f << right << fixed << setprecision(3) << "흰 비율 " << ratio
             << (invert ? " → 반전(어두운 물체)" : " → 그대로(밝은 물체)")
             << " → 물체 " << countBlobs(bin, 100) << "개" << endl;
        imshow(f, bin);
    }
    waitKey(0);
    return 0;
}`;
  const EX_WATERSHED = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

// 닿아 있는 부품을 거리 변환 + watershed 로 떼어 낸 뒤 개수를 센다 (12차시 기법을 함수 하나로)
int countSeparated(const Mat& gray, Mat& overlay, double peakRatio = 0.4, int minArea = 300)
{
    Mat bin;
    threshold(gray, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);

    // ① 구멍 메우기: 바깥 윤곽만 찾아 채운다 (와셔 · 너트 구멍 때문에 거리 값이 작아지는 것을 막음)
    vector<vector<Point>> outer;
    findContours(bin, outer, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    Mat solid = Mat::zeros(bin.size(), CV_8UC1);
    drawContours(solid, outer, -1, Scalar(255), FILLED);

    // ② 거리 변환 → 봉우리만 남기면 부품마다 씨앗 하나
    Mat dist, seeds;
    distanceTransform(solid, dist, DIST_L2, DIST_MASK_5);
    double dmax;
    minMaxLoc(dist, nullptr, &dmax);
    threshold(dist, seeds, peakRatio * dmax, 255, THRESH_BINARY);
    seeds.convertTo(seeds, CV_8UC1);

    // ③ 마커: 배경 1 · 씨앗 2.. · 모르는 곳 0
    Mat markers;
    int n = connectedComponents(seeds, markers, 8, CV_32S);
    markers += Scalar(1);
    markers.setTo(Scalar(0), solid - seeds);

    // ④ watershed (입력은 3채널)
    cvtColor(gray, overlay, COLOR_GRAY2BGR);
    watershed(overlay, markers);

    // ⑤ 라벨마다 면적 · 상자
    int count = 0;
    for (int k = 2; k <= n; k++)
    {
        Mat mask = (markers == k);
        if (countNonZero(mask) < minArea) continue;
        count++;
        Rect box = boundingRect(mask);
        rectangle(overlay, box, Scalar(0, 200, 0), 2);
        putText(overlay, to_string(count), box.tl() + Point(3, 16), FONT_HERSHEY_SIMPLEX, 0.5, Scalar(0, 255, 255), 1);
    }
    return count;
}

int main()
{
    Mat gray = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat bin, labels, overlay;
    threshold(gray, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);
    cout << "그냥 세면: " << connectedComponents(bin, labels) - 1 << "개" << endl;

    for (double ratio : { 0.25, 0.4, 0.5 })
    {
        int n = countSeparated(gray, overlay, ratio);
        cout << format("봉우리 비율 %.2f → 분리 후 %d개", ratio, n) << (n == 13 ? "  (기대 13 OK)" : "  (기대 13 NG)") << endl;
    }
    countSeparated(gray, overlay);           // 기본값 0.4 로 다시 그린다
    imshow("separated", overlay);
    waitKey(0);
    return 0;
}`;
  const EX_SIZE = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <map>
#include <cmath>
using namespace cv;
using namespace std;

const double MM_PER_PX = 0.1;          // 배율 (IMAGES.md): 10 px = 1 mm

// 등가 반지름 → 크기 등급 (L r=34 · M r=27 · S r=20 px 사이에 경계 30, 24)
string sizeClass(double r)
{
    if (r >= 30) return "L";
    if (r >= 24) return "M";
    return "S";
}

int main()
{
    Mat gray = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    Mat bin, labels, stats, cents;
    double t = threshold(gray, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    morphologyEx(bin, bin, MORPH_OPEN, getStructuringElement(MORPH_ELLIPSE, Size(5, 5)));
    int n = connectedComponentsWithStats(bin, labels, stats, cents);

    Mat overlay;
    cvtColor(gray, overlay, COLOR_GRAY2BGR);
    map<string, int> count;                              // 등급 → 개수
    map<string, Scalar> color = { {"L", Scalar(0, 200, 0)}, {"M", Scalar(0, 200, 255)}, {"S", Scalar(255, 120, 0)} };

    cout << "Otsu 임계값 " << t << endl;
    for (int i = 1; i < n; i++)
    {
        int area = stats.at<int>(i, CC_STAT_AREA);
        if (area < 300) continue;
        double r = sqrt(area / CV_PI);                   // A = πr²  →  r = √(A/π)
        string cls = sizeClass(r);
        count[cls]++;
        Rect box(stats.at<int>(i, CC_STAT_LEFT), stats.at<int>(i, CC_STAT_TOP),
                 stats.at<int>(i, CC_STAT_WIDTH), stats.at<int>(i, CC_STAT_HEIGHT));
        rectangle(overlay, box, color[cls], 2);
        putText(overlay, cls, box.tl() + Point(4, 18), FONT_HERSHEY_SIMPLEX, 0.6, color[cls], 2);
        cout << format("  (%5.1f, %5.1f) r=%.1fpx  지름 %.1fmm -> %s",
                       cents.at<double>(i, 0), cents.at<double>(i, 1), r, 2 * r * MM_PER_PX, cls.c_str()) << endl;
    }
    cout << "S " << count["S"] << "개 · M " << count["M"] << "개 · L " << count["L"] << "개" << endl;
    bool ok = count["S"] == 5 && count["M"] == 4 && count["L"] == 3;
    cout << "판정: " << (ok ? "OK (S5 M4 L3)" : "NG") << endl;

    imshow("size classes", overlay);
    waitKey(0);
    return 0;
}`;
  const EX_PINS = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/connector_pins.png", IMREAD_GRAYSCALE);

    // 핀 = 검은 하우징 안의 밝은 사각형 → THRESH_BINARY 고정 (자동 극성 판단은 여기서 틀린다!)
    Mat bin, labels, stats, cents;
    double t = threshold(gray, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    morphologyEx(bin, bin, MORPH_OPEN, getStructuringElement(MORPH_RECT, Size(3, 3)));
    int n = connectedComponentsWithStats(bin, labels, stats, cents);

    // 핀 크기 14 x 14 ≈ 200 px² → 100~2000 만 남긴다 (큰 배경 덩어리를 버림)
    vector<Point2d> found;
    for (int i = 1; i < n; i++)
    {
        int area = stats.at<int>(i, CC_STAT_AREA);
        if (area >= 100 && area <= 2000)
            found.push_back(Point2d(cents.at<double>(i, 0), cents.at<double>(i, 1)));
    }
    cout << "Otsu 임계값 " << t << ", 핀 크기 블롭 " << found.size() << "개 / 자리 12개" << endl;

    Mat overlay;
    cvtColor(gray, overlay, COLOR_GRAY2BGR);
    int ng = 0;
    for (int i = 0; i < 12; i++)
    {
        Point2d nominal(100 + 40 * i, 240);          // 공칭 격자 (설계 도면 좌표)
        double best = 1e9;
        int bi = -1;
        for (int k = 0; k < (int)found.size(); k++)
        {
            double d = norm(found[k] - nominal);     // 두 점 사이 거리
            if (d < best) { best = d; bi = k; }
        }
        string judge = best > 20 ? "누락" : (best > 5 ? "휨" : "OK");
        if (judge != "OK") ng++;
        Scalar color = judge == "OK" ? Scalar(0, 200, 0) : Scalar(0, 0, 255);
        rectangle(overlay, Rect((int)nominal.x - 12, (int)nominal.y - 12, 24, 24), color, 1);
        if (judge == "휨") line(overlay, Point(nominal), Point(found[bi]), Scalar(0, 0, 255), 2);
        cout << format("  핀 %2d 공칭 x=%3d : 편차 %4.1f px -> ", i, (int)nominal.x, best) << judge
             << (judge == "OK" ? "" : " (NG)") << endl;
    }
    cout << "불량 " << ng << "개 -> 전체 판정 " << (ng == 0 ? "OK" : "NG") << endl;
    imshow("pins", overlay);
    waitKey(0);
    return 0;
}`;
  const EX_CSV = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <fstream>
#include <cmath>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    Mat bin, labels, stats, cents;
    threshold(gray, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    int n = connectedComponentsWithStats(bin, labels, stats, cents);

    // ① 파일 열기 — 브라우저에서는 📁 작업 폴더, Visual Studio 에서는 작업 디렉터리에 생긴다
    ofstream csv("report.csv");
    if (!csv) { cout << "report.csv 를 열 수 없습니다" << endl; return -1; }
    csv << "no,cx,cy,area,radius_px,dia_mm,class,judge\\n";          // 헤더 한 줄

    int no = 0, ng = 0;
    for (int i = 1; i < n; i++)
    {
        int area = stats.at<int>(i, CC_STAT_AREA);
        if (area < 300) continue;
        no++;
        double r = sqrt(area / CV_PI);
        double dia = 2 * r * 0.1;                                    // 0.1 mm/px
        string cls = r >= 30 ? "L" : (r >= 24 ? "M" : "S");
        string judge = (dia >= 3.5 && dia <= 7.5) ? "OK" : "NG";      // 허용 지름 3.5~7.5 mm
        if (judge == "NG") ng++;
        csv << no << "," << format("%.1f,%.1f", cents.at<double>(i, 0), cents.at<double>(i, 1)) << ","
            << area << "," << format("%.1f,%.2f", r, dia) << "," << cls << "," << judge << "\\n";
    }
    csv << "total," << no << ",,,,,," << (ng == 0 ? "OK" : "NG") << "\\n";
    csv.close();                                                     // 닫아야 파일에 확실히 기록된다
    cout << "검사 " << no << "건, 불량 " << ng << "건 -> report.csv 저장" << endl;

    // ② 저장한 파일을 다시 읽어 확인
    ifstream in("report.csv");
    vector<string> lines;
    string line;
    while (getline(in, line)) lines.push_back(line);
    cout << "CSV " << lines.size() << "줄" << endl;
    for (int k = 0; k < 4; k++) cout << "  " << lines[k] << endl;
    cout << "  ..." << endl << "  " << lines.back() << endl;
    return 0;
}`;

  const SEC1 = {
    id: 'cv17-1', title: '검사기 설계와 개수 세기: Inspector · InspectionResult · CountInspector', minutes: 50,
    goals: ['검사 결과(InspectionResult)와 검사기 인터페이스(Inspector 추상 클래스)를 설계하고 파일(.h/.cpp)로 나눌 수 있다', 'Otsu + 극성 판단 + 면적 필터로 개수를 세고 OK/NG 판정 · 오버레이를 만들 수 있다', '닿은 부품 분리 · 크기 선별 · 공칭 격자 대조를 하고 결과를 CSV(ofstream)로 남길 수 있다'],
    flow: [['도입: 검사 프로그램의 구조', 8], ['클래스 설계 · CountInspector', 15], ['닿은 부품 · 크기 · 격자 대조', 17], ['CSV 리포트 · 정리', 10]],
    content: [
      { type: 'h', text: '검사 프로그램은 무엇을 하나' },
      { type: 'p', html: '16차시의 Image Studio 는 “사람이 보기 좋게 이미지를 바꾸는” 도구였습니다. 검사(Inspection) 프로그램은 목적이 다릅니다 — <b>판정(OK / NG)과 그 근거를 남기는 것</b>입니다. 공장의 검사 장비는 제품 한 개마다 다음 네 가지를 만들어 냅니다.' },
      { type: 'list', ordered: true, items: [
        '<b>판정</b> (<code>ok</code>): 이 제품을 통과시킬지 버릴지',
        '<b>측정값</b> (<code>values</code>): 개수 · 지름 · 차이 최대값처럼 판정의 근거가 된 숫자 — CSV 리포트의 한 줄이 된다',
        '<b>불량 위치</b> (<code>defects</code>): 어디가 잘못됐는지 <code>Rect</code> 목록',
        '<b>오버레이</b> (<code>overlay</code>): 사람이 확인할 수 있도록 결과를 그린 이미지 (사각형 · 번호 · OK/NG 띠)'
      ] },
      { type: 'figure', html: FIG_PIPE, caption: '그림 1. 검사 프로그램의 공통 흐름 — 입력 → 전처리 → 분할 → 측정 → 판정 → 기록. 세 검사기는 가운데 단계만 다르고 결과의 모양은 같다' },
      { type: 'h', text: '클래스 설계: Inspector 인터페이스와 InspectionResult' },
      { type: 'p', html: '결과의 모양이 같으므로 <b>구조체 하나</b>(<code>struct InspectionResult</code>)에 담고, 모든 검사기가 <b>추상 클래스</b> <code>Inspector</code> 를 상속해 <code>virtual InspectionResult inspect(const Mat&amp; img) = 0;</code> 을 구현하게 합니다. 그러면 <code>main</code> 은 <b>어떤 검사기인지 몰라도</b> <code>inspector-&gt;inspect(img)</code> 한 줄로 부를 수 있습니다 — 16차시 <code>Filter</code> · <code>Pipeline</code> 과 같은 설계(다형성, Polymorphism)입니다.' },
      { type: 'figure', html: FIG_CLASS, caption: '그림 2. 클래스 다이어그램 — Inspector(추상) ← CountInspector · ColorSortInspector · DefectInspector, 결과는 InspectionResult. main 은 unique_ptr 로 소유하고 Inspector 로만 부른다' },
      { type: 'table', head: ['구성 요소', 'C++ 코드', '설계 이유'], rows: [
        ['측정값 한 줄', '<code>struct Measurement { string name; double value; };</code>', '검사기마다 측정 항목이 달라도 “이름 = 값” 목록이면 같은 방식으로 출력 · 저장'],
        ['검사 결과', '<code>struct InspectionResult { bool ok; vector&lt;Measurement&gt; values; vector&lt;Rect&gt; defects; Mat overlay; string summary() const; }</code>', '데이터 묶음이라 <code>struct</code>. <code>Mat</code> 은 참조 계수로 메모리를 관리하므로 복사해도 안전 (C# 판의 <code>Dispose</code> 불필요)'],
        ['검사기 인터페이스', '<code>class Inspector { virtual string name() const = 0; virtual InspectionResult inspect(const Mat&amp;) = 0; virtual ~Inspector() = default; };</code>', '<code>= 0</code> 순수 가상 함수 → 객체를 만들 수 없는 “약속”. <b>가상 소멸자</b>는 부모 포인터로 지울 때 필수'],
        ['설정(파라미터)', '공개 멤버 변수 <code>expected</code> · <code>minArea</code> …', '같은 클래스라도 제품마다 설정이 다른 <b>객체(레시피)</b>를 따로 만든다'],
        ['입력', '<code>const Mat&amp; img</code>', '복사하지 않고(참조), 바꾸지 않는다(<code>const</code>) — 오버레이는 새 Mat 으로']
      ], caption: '표 1. 검사기 설계 한눈에 보기' },
      { type: 'h', text: '개수 세기 파이프라인' },
      { type: 'image', src: 'images/washers.png', caption: '검사할 영상 — 백라이트 실루엣: 와셔 6 · 육각너트 4 · 볼트 3 = 13개. 좌상단(W1–W2)과 아래쪽(B3–N4)이 서로 닿아 있다', width: 520 },
      { type: 'figure', html: FIG_COUNT, caption: '그림 3. CountInspector 의 처리 순서 — 블러 → Otsu(극성 자동) → 열기 → 바깥 윤곽선 → 면적 필터 · 정렬 → 판정 → 오버레이' },
      { type: 'p', html: '아래 예제는 한 편집기 안에 <b>파일 4개</b>를 넣었습니다 (<code>// ===== File: 이름 =====</code> 구분 주석). <code>Inspector.h</code> 는 <b>선언</b>(구조체 · 추상 클래스 · 도우미 함수 원형), <code>Inspector.cpp</code> 는 그 <b>구현</b>, <code>CountInspector.h</code> 는 검사기 클래스, <code>main.cpp</code> 는 사용하는 쪽입니다. Visual Studio 의 <code>vs/Ch17_Inspection</code> 프로젝트도 같은 구성입니다.' },
      { type: 'code', title: '예제 1: Inspector 설계 + CountInspector (파일 4개)', code: EX_COUNT,
        desc: '<code>CountInspector</code> 는 <code>Inspector</code> 를 <code>public</code> 상속하고 두 순수 가상 함수를 <code>override</code> 합니다. 판정 규칙은 두 가지입니다: ① 개수가 <code>expected</code> 와 같은가 ② <b>면적이 중앙값의 1.8배 이상인 덩어리</b>(= 두 개가 붙었을 가능성)가 없는가. <code>washers.png</code> 는 부품이 13개인데 11개로 세어지고, 바로 그 두 덩어리(W1–W2 · B3–N4)가 “붙음 의심” 으로 <code>defects</code> 에 들어갑니다 — 개수만 보고 NG 를 내는 것보다 <b>원인까지 알려 주는</b> 검사기입니다. 같은 객체의 <code>expected</code> 만 12 로 바꿔 <code>coins_parts.png</code> 를 검사하면 OK 입니다. <code>struct Blob</code> 을 함수 안에 선언하고 <code>std::sort</code> 에 <b>람다</b>로 “위→아래, 왼→오” 순서를 주는 방법도 눈여겨보세요. <code>cout &lt;&lt; Rect</code> 는 <code>[폭 x 높이 from (x, y)]</code> 형식으로 출력됩니다.',
        expect: 'NG | 개수 세기 | washers.png | count=11 expected=13 | 불량 2곳\n  붙음 의심: [168 x 88 from (48, 48)]\n  붙음 의심: [223 x 67 from (325, 367)]\nOK | 개수 세기 | coins_parts.png | count=12 expected=12' },
      { type: 'callout', kind: 'vs', title: '파일 나누기 규칙 (Visual Studio 프로젝트에서)', html: '<ul><li><b>헤더(.h)</b>: 맨 위에 <code>#pragma once</code>(두 번 포함 방지). 선언 · 클래스 정의만 두고, <b><code>using namespace</code> 를 쓰지 않습니다</b> — 헤더를 포함하는 모든 파일에 퍼지기 때문입니다. 그래서 헤더 안에서는 <code>std::string</code> · <code>cv::Mat</code> 처럼 전체 이름을 씁니다 (함수 안에서만 <code>using namespace cv;</code> 는 괜찮음).</li><li><b>소스(.cpp)</b>: 함수 몸체(구현). <code>InspectionResult::summary()</code> 처럼 <code>클래스이름::</code> 을 붙입니다. 기본 인수(<code>double scale = 0.6</code>)는 <b>선언에만</b> 적습니다.</li><li>클래스 안에 몸체를 쓴 멤버 함수는 자동으로 <code>inline</code> 이라 헤더에 둬도 링크 오류가 나지 않습니다. 완성 프로젝트는 <code>CountInspector.h</code> / <code>CountInspector.cpp</code> 로 나눴습니다.</li><li>프로젝트에 새 파일 추가: 솔루션 탐색기 → <code>Inspectors</code> 필터 우클릭 → 추가 → 새 항목 → C++ 파일 / 헤더 파일.</li></ul>' },
      { type: 'p', html: '핵심은 <b>“부품이 흰색”이 되도록 맞추는 것</b>입니다. 07차시에서 배웠듯 <code>THRESH_OTSU</code> 는 임계값을 자동으로 찾아 주지만 <b>어느 쪽이 물체인지</b>는 알려 주지 않습니다. 백라이트 영상(<code>washers.png</code>)은 배경이 밝고 부품이 어둡고, 정면 조명 영상(<code>coins_parts.png</code>)은 그 반대입니다. 간단한 자동 판단 규칙: <b>Otsu 결과에서 흰 픽셀이 절반을 넘으면 흰색이 배경</b>이므로 <code>bitwise_not</code> 으로 반전합니다.' },
      { type: 'code', title: '예제 2: 극성(밝은 물체 / 어두운 물체) 자동 판단과 그 한계', code: EX_POLARITY,
        desc: '<code>countNonZero(bin) / bin.total()</code> 로 흰 비율을 구합니다 (<code>total()</code> = 픽셀 수). 앞의 두 영상은 규칙이 잘 맞지만, <code>connector_pins.png</code> 는 <b>밝은 배경 · 검은 하우징 · 그 안의 밝은 핀</b>이라 흰 비율이 0.780 → “반전” 을 골라 <b>하우징 덩어리 1개</b>만 남습니다. 핀 12자리를 보려면 극성을 <b>수동으로 고정</b>해야 합니다(예제 5).',
        expect: 'washers.png         흰 비율 0.849 → 반전(어두운 물체) → 물체 11개\ncoins_parts.png     흰 비율 0.085 → 그대로(밝은 물체) → 물체 12개\nconnector_pins.png  흰 비율 0.780 → 반전(어두운 물체) → 물체 1개' },
      { type: 'callout', kind: 'warn', title: '자동은 편리한 기본값이지 정답이 아니다', html: '현장 검사기는 보통 <b>극성을 설정값</b>(밝은 물체 / 어두운 물체)으로 둡니다. 조명(백라이트 · 정면 조명)이 고정되어 있으니 극성도 고정이기 때문입니다. <code>CountInspector</code> 에 <code>int polarity = 0; // 0 자동, 1 밝은 물체, -1 어두운 물체</code> 같은 멤버를 추가해 보는 것이 좋은 확장 과제입니다. 흔한 실수: 물체가 검은데 <code>THRESH_BINARY</code> 를 쓰면 <b>배경 전체가 하나의 큰 윤곽</b>이 되어 개수가 1 로 나옵니다.' },
      { type: 'h', text: '닿아 있는 부품 분리: 거리 변환 + watershed' },
      { type: 'p', html: '두 부품이 한 픽셀이라도 붙으면 윤곽선 · 연결 요소는 하나로 봅니다. 12차시의 <b>거리 변환(Distance Transform)</b>으로 부품 중심의 <b>봉우리</b>를 씨앗으로 만들고, <b>watershed</b> 로 경계를 그리면 떼어 낼 수 있습니다. 여기서는 그 과정을 <b>함수 하나</b>(<code>countSeparated</code>)로 묶어 검사기에서 부를 수 있게 했습니다.' },
      { type: 'callout', kind: 'tip', title: '와셔 · 너트는 구멍을 먼저 메워야 한다', html: '와셔는 <b>도넛 모양</b>이라 거리 변환의 최대값이 “링 두께의 절반”밖에 안 되어 봉우리가 링을 따라 여러 개 생깁니다. <code>RETR_EXTERNAL</code> 로 바깥 윤곽만 찾아 <code>drawContours(..., FILLED)</code> 로 채우면 최대값이 41.7 px(가장 큰 와셔의 반지름)가 되어 분리가 깔끔해집니다.' },
      { type: 'code', title: '예제 3: 닿은 부품 분리 (11개 → 13개) — 봉우리 비율의 영향', code: EX_WATERSHED,
        desc: '마커 규칙: <b>1 = 확실한 배경, 2 이상 = 씨앗, 0 = 모르는 영역</b>(물이 채울 곳). <code>markers += Scalar(1)</code> 한 줄로 “배경 0 → 1, 씨앗 1.. → 2..” 가 되고, <code>setTo(Scalar(0), solid - seeds)</code> 로 부품이지만 씨앗이 아닌 곳을 0 으로 만듭니다. watershed 뒤에는 <code>markers == k</code>(비교 연산 → 0/255 마스크)로 라벨마다 면적 · 상자를 구합니다. 봉우리 비율이 너무 낮으면(0.25) 한 부품에 씨앗이 둘 생겨 14개, 너무 높으면(0.5) 작은 부품의 씨앗이 사라져 10개 — <b>파라미터 민감도</b>를 반드시 확인하세요.',
        expect: '그냥 세면: 11개\n봉우리 비율 0.25 → 분리 후 14개  (기대 13 NG)\n봉우리 비율 0.40 → 분리 후 13개  (기대 13 OK)\n봉우리 비율 0.50 → 분리 후 10개  (기대 13 NG)' },
      { type: 'h', text: '크기 선별: 면적 → 등가 지름 → mm' },
      { type: 'code', title: '예제 4: 크기별 선별 (S · M · L) 과 mm 환산', code: EX_SIZE,
        desc: '면적에서 <b>등가 반지름</b> r = √(A/π) 을 구하면 크기 분류가 아주 간단해집니다. <code>coins_parts.png</code> 의 정답은 L(r=34 px, Ø6.8 mm) 3개 · M(r=27, Ø5.4) 4개 · S(r=20, Ø4.0) 5개이고, 경계를 24 · 30 으로 두면 깔끔하게 나뉩니다. 배율 <b>0.1 mm/px</b> 를 곱해 <b>mm 단위</b>로 보고하는 것이 현장 방식입니다. <code>map&lt;string, int&gt;</code> 의 <code>count[cls]++</code> 는 키가 없으면 0 으로 만들고 더하므로 개수 세기에 편리합니다. <code>CC_STAT_AREA</code>(=4) 처럼 열 번호 대신 <b>이름 상수</b>를 쓰세요.',
        expect: 'Otsu 임계값 105\n  (194.0,  53.6) r=19.9px  지름 4.0mm -> S\n  (340.7,  67.8) r=20.0px  지름 4.0mm -> S\n  (480.7,  95.8) r=20.0px  지름 4.0mm -> S\n  (119.7, 164.8) r=33.9px  지름 6.8mm -> L\n  (310.4, 165.8) r=27.0px  지름 5.4mm -> M\n  (588.0, 165.3) r=26.9px  지름 5.4mm -> M\n  (413.5, 229.8) r=27.0px  지름 5.4mm -> M\n  ( 55.5, 277.1) r=26.9px  지름 5.4mm -> M\n  (333.4, 288.3) r=20.0px  지름 4.0mm -> S\n  (549.1, 345.5) r=33.9px  지름 6.8mm -> L\n  (210.1, 370.2) r=19.9px  지름 4.0mm -> S\n  (278.8, 384.1) r=33.9px  지름 6.8mm -> L\nS 5개 · M 4개 · L 3개\n판정: OK (S5 M4 L3)' },
      { type: 'h', text: '기준 격자와 대조: 누락 · 휨 찾기' },
      { type: 'p', html: '커넥터 핀처럼 <b>위치가 정해져 있는</b> 부품은 “몇 개인가” 보다 “<b>어디가</b> 비었는가”가 중요합니다. 방법은 간단합니다: 공칭(설계) 위치마다 <b>가장 가까운 블롭 중심까지의 거리</b>를 구해 임계값으로 판정합니다.' },
      { type: 'figure', html: FIG_GRID, caption: '그림 4. 공칭 격자 x = 100 + 40·i 와 검출 중심 비교 — i=4 휨, i=8 누락' },
      { type: 'code', title: '예제 5: 커넥터 핀 12개 검사 (누락 1 · 휨 1)', code: EX_PINS,
        desc: '<code>connector_pins.png</code> 의 정답은 피치 40 px(2.54 mm), <b>i=4 가 (+3.5, +9.0) px 휨</b>, <b>i=8 누락</b>입니다. 극성 자동 판단을 쓰지 않고 <code>THRESH_BINARY</code> 를 <b>고정</b>한 점과, <b>면적 100~2000</b> 으로 큰 배경 덩어리를 버린 점이 요령입니다. 두 점 사이 거리는 <code>norm(p - q)</code> 한 줄 (<code>Point2d</code> 끼리 빼면 벡터). 편차 9.7 px × 0.0635 mm/px ≈ <b>0.62 mm</b> 로 보고하면 바로 공차 판정에 쓸 수 있습니다.',
        expect: 'Otsu 임계값 71, 핀 크기 블롭 11개 / 자리 12개\n  핀  0 공칭 x=100 : 편차  0.1 px -> OK\n  핀  1 공칭 x=140 : 편차  0.1 px -> OK\n  핀  2 공칭 x=180 : 편차  0.0 px -> OK\n  핀  3 공칭 x=220 : 편차  0.0 px -> OK\n  핀  4 공칭 x=260 : 편차  9.7 px -> 휨 (NG)\n  핀  5 공칭 x=300 : 편차  0.0 px -> OK\n  핀  6 공칭 x=340 : 편차  0.0 px -> OK\n  핀  7 공칭 x=380 : 편차  0.0 px -> OK\n  핀  8 공칭 x=420 : 편차 39.9 px -> 누락 (NG)\n  핀  9 공칭 x=460 : 편차  0.1 px -> OK\n  핀 10 공칭 x=500 : 편차  0.1 px -> OK\n  핀 11 공칭 x=540 : 편차  0.1 px -> OK\n불량 2개 -> 전체 판정 NG' },
      { type: 'h', text: '결과를 남기기: CSV 리포트 (ofstream)' },
      { type: 'code', title: '예제 6: 검사 결과를 CSV 로 저장하고 다시 읽기', code: EX_CSV,
        desc: '<code>std::ofstream</code> 은 <code>cout</code> 과 똑같이 <code>&lt;&lt;</code> 로 씁니다. <b>CSV</b>(Comma-Separated Values)는 “헤더 한 줄 + 데이터 줄” 의 텍스트이고 Excel 로 바로 열립니다. 브라우저에서는 파일이 왼쪽 <b>📁 작업 폴더</b>에 저장되고(결과 창에 “💾 파일 저장” 표시), Visual Studio 에서는 작업 디렉터리(<code>vs/</code>)에 생깁니다. <code>ifstream</code> + <code>getline</code> 으로 다시 읽어 확인했습니다.',
        expect: '검사 12건, 불량 0건 -> report.csv 저장\nCSV 14줄\n  no,cx,cy,area,radius_px,dia_mm,class,judge\n  1,194.0,53.6,1244,19.9,3.98,S,OK\n  2,340.7,67.7,1252,20.0,3.99,S,OK\n  3,480.7,95.8,1254,20.0,4.00,S,OK\n  ...\n  total,12,,,,,,OK' },
      { type: 'callout', kind: 'tip', title: 'ofstream 으로 CSV 쓸 때', html: '<ul><li>줄 끝은 <code>"\\n"</code> — <code>endl</code> 은 매번 버퍼를 비워(flush) 수천 줄에서 느려집니다. 대신 다 쓰면 <code>close()</code>(또는 블록을 벗어나 소멸)해야 내용이 확실히 기록됩니다.</li><li><code>if (!csv)</code> 로 열기 실패를 확인하세요 — 폴더가 없거나 Excel 이 파일을 열고 있으면 실패합니다.</li><li>값에 <b>쉼표</b>가 들어가면 칸이 밀립니다 → <code>"..."</code> 로 감싸거나 다른 구분자를 씁니다 (완성 프로젝트의 <code>csvCell</code> 함수).</li><li>Excel 에서 한글이 깨지면 파일 맨 앞에 <b>UTF-8 BOM</b>(<code>"\\xEF\\xBB\\xBF"</code>)을 씁니다 (완성 프로젝트는 이렇게 저장).</li></ul>' },
      { type: 'callout', kind: 'field', title: '🏭 현장에서는', html: '<ul><li><b>면적 필터의 하한</b>은 잡음 제거용, <b>상한</b>(또는 중앙값 대비 배율)은 “두 개가 붙은 덩어리” 를 골라내는 용도로 씁니다 — 예제 1 의 붙음 의심이 그 예입니다.</li><li><b>판정 이력</b>은 반드시 남깁니다: 시간 · 로트 · 판정 · 측정값 · 이미지 파일명. 파일명에 날짜 · 로트 번호를 넣고(<code>report_20261001_A2309-117.csv</code>) 헤더는 바꾸지 않습니다.</li><li><b>조명이 먼저</b>입니다. 백라이트로 실루엣을 만들면(washers) 이진화가 거의 실패하지 않습니다. 알고리즘으로 조명 문제를 해결하려 하면 파라미터가 끝없이 늘어납니다.</li></ul>' },
      { type: 'project', title: 'Ch17_Inspection — 완성 검사 프로그램', project: 'Ch17_Inspection', html: '<code>vs/Ch17_Inspection</code> 은 이 차시의 세 검사기를 <code>Inspectors/</code> 폴더(<code>Inspector.h/.cpp</code> · <code>CountInspector.h/.cpp</code> · <code>ColorSortInspector.h/.cpp</code> · <code>DefectInspector.h/.cpp</code>)로 나누고, <code>main.cpp</code> 가 예제 이미지 7장을 <b>일괄 검사</b> → 콘솔 표 · <code>results/report.csv</code> · <code>results/NG_*.png</code> 를 남긴 뒤, 결과 오버레이를 창에서 넘겨 봅니다(<kbd>n</kbd> 다음 · <kbd>p</kbd> 이전 · <kbd>s</kbd> 저장 · <kbd>ESC</kbd> 종료). 1교시에서는 <code>CountInspector</code> 부분을 먼저 읽어 보세요 — 예제 1 과 같은 코드를 <code>.h</code>(선언) / <code>.cpp</code>(구현)로 나눈 것입니다.' }
    ],
    practice: [
      {
        title: '기대 개수를 바꿔 OK/NG 판정 확인하기', level: 1,
        desc: '<code>images/coins_parts.png</code> 에서 면적 300 이상인 부품을 세고 <b>기대 12</b> 와 <b>기대 10</b> 으로 판정하세요. 그다음 면적 하한을 <b>2000</b> 으로 올리면 개수가 어떻게 바뀌는지, 기대 12 와 비교하면 무엇이 되는지 확인하세요.',
        hint: '<code>stats.at&lt;int&gt;(i, CC_STAT_AREA)</code> 가 면적입니다. 0 번 라벨은 배경이므로 <code>i = 1</code> 부터. 하한 2000 이면 작은 S 부품(면적 약 1250) 5개가 빠집니다.',
        expect: '면적 300 이상: 12개\n기대 12 -> OK\n기대 10 -> NG\n면적 2000 이상: 7개 (작은 부품이 빠진다) -> 기대 12 NG',
        starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

// 면적이 minArea 이상인 연결 요소의 개수
int countParts(const Mat& bin, int minArea)
{
    Mat labels, stats, cents;
    int n = connectedComponentsWithStats(bin, labels, stats, cents);
    int found = 0;
    // TODO: i = 1 부터(0 은 배경) stats.at<int>(i, CC_STAT_AREA) 가 minArea 이상인 것만 세세요
    return found;
}

string judge(int found, int expected)
{
    // TODO: 같으면 "OK", 다르면 "NG"
    return "?";
}

int main()
{
    Mat gray = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    Mat bin;
    threshold(gray, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);

    int c1 = countParts(bin, 300);
    cout << "면적 300 이상: " << c1 << "개" << endl;
    cout << "기대 12 -> " << judge(c1, 12) << endl;
    cout << "기대 10 -> " << judge(c1, 10) << endl;

    // TODO: 면적 하한을 2000 으로 올려 다시 세고, 기대 12 와 비교해 출력하세요
    imshow("bin", bin);
    waitKey(0);
    return 0;
}`,
        solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

// 면적이 minArea 이상인 연결 요소의 개수
int countParts(const Mat& bin, int minArea)
{
    Mat labels, stats, cents;
    int n = connectedComponentsWithStats(bin, labels, stats, cents);
    int found = 0;
    for (int i = 1; i < n; i++)                  // 0 번은 배경
        if (stats.at<int>(i, CC_STAT_AREA) >= minArea) found++;
    return found;
}

string judge(int found, int expected)
{
    return found == expected ? "OK" : "NG";
}

int main()
{
    Mat gray = imread("images/coins_parts.png", IMREAD_GRAYSCALE);
    Mat bin;
    threshold(gray, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);

    int c1 = countParts(bin, 300);
    cout << "면적 300 이상: " << c1 << "개" << endl;
    cout << "기대 12 -> " << judge(c1, 12) << endl;
    cout << "기대 10 -> " << judge(c1, 10) << endl;

    int c2 = countParts(bin, 2000);
    cout << "면적 2000 이상: " << c2 << "개 (작은 부품이 빠진다) -> 기대 12 " << judge(c2, 12) << endl;
    imshow("bin", bin);
    waitKey(0);
    return 0;
}`
      },
      {
        title: '배터리 셀 트레이: 누락 · 역삽 찾기 (격자 ROI)', level: 2,
        desc: '<code>images/battery_cells.png</code> 는 4 × 6 홀더에 원통형 셀이 꽂힌 윗면입니다. 셀 중심은 x = 95 + 90·c, y = 105 + 90·r (반지름 40). 정상 셀은 가운데에 <b>작은 밝은 + 단자</b>(r≈13), <b>역삽</b>은 <b>넓고 밝은 − 원판</b>(r≈34), <b>누락</b>은 <b>검은 구멍</b>입니다. starter 는 각 자리의 평균 밝기와 밝은 픽셀(&gt;170) 수를 출력합니다 — 값을 보고 판정 규칙을 정해 불량 자리만 출력하세요.',
        hint: '정상 셀: 평균 ≈ 100~106, 밝은 픽셀 ≈ 500 (π·13² ≈ 531). (1,3): 평균 180, 밝은 픽셀 3466. (2,5): 평균 27. 규칙 예: 평균 &lt; 60 → 누락, 밝은 픽셀 &gt; 1500 → 역삽. 정답: 셀 23개, (행1, 열3) 역삽 · (행2, 열5) 누락.',
        expect: '(1,3) 평균 180 밝은 픽셀 3466 -> 역삽\n(2,5) 평균 27 밝은 픽셀 0 -> 누락\n셀 23개 / 자리 24개, 불량 2개 -> NG',
        starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

// 셀 자리 하나의 판정: 평균 밝기로 유무, 밝은 픽셀 수로 극성
string judgeCell(const Mat& gray, Point center, double& meanV, int& bright)
{
    Mat mask = Mat::zeros(gray.size(), CV_8UC1);
    circle(mask, center, 36, Scalar(255), FILLED);           // 셀 반지름 40 보다 조금 안쪽
    meanV = mean(gray, mask)[0];
    Mat roi = gray(Rect(center.x - 40, center.y - 40, 80, 80));
    bright = countNonZero(roi > 170);
    // TODO: 결과 창에서 값을 보고 규칙을 정하세요
    //   누락 = 검은 구멍 (평균이 아주 낮다) → "누락"
    //   역삽 = 넓고 밝은 − 원판 (밝은 픽셀이 아주 많다) → "역삽"
    return "OK";
}

int main()
{
    Mat gray = imread("images/battery_cells.png", IMREAD_GRAYSCALE);
    Mat overlay;
    cvtColor(gray, overlay, COLOR_GRAY2BGR);
    int present = 0, ng = 0;
    for (int r = 0; r < 4; r++)
        for (int c = 0; c < 6; c++)
        {
            Point center(95 + 90 * c, 105 + 90 * r);         // 셀 격자 (IMAGES.md)
            double m;
            int bright;
            string j = judgeCell(gray, center, m, bright);
            cout << format("(%d,%d) 평균 %.0f 밝은 픽셀 %d -> ", r, c, m, bright) << j << endl;
            // TODO: present(누락이 아닌 셀) · ng(OK 가 아닌 셀) 를 세고, 불량은 빨간 원으로 그리세요
            circle(overlay, center, 40, Scalar(0, 200, 0), 2);
        }
    cout << "셀 " << present << "개 / 자리 24개, 불량 " << ng << "개" << endl;
    imshow("cells", overlay);
    waitKey(0);
    return 0;
}`,
        solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

// 셀 자리 하나의 판정: 평균 밝기로 유무, 밝은 픽셀 수로 극성
string judgeCell(const Mat& gray, Point center, double& meanV, int& bright)
{
    Mat mask = Mat::zeros(gray.size(), CV_8UC1);
    circle(mask, center, 36, Scalar(255), FILLED);           // 셀 반지름 40 보다 조금 안쪽
    meanV = mean(gray, mask)[0];
    Mat roi = gray(Rect(center.x - 40, center.y - 40, 80, 80));
    bright = countNonZero(roi > 170);
    if (meanV < 60) return "누락";                           // 검은 구멍
    if (bright > 1500) return "역삽";                        // 넓고 밝은 − 원판 (r=34)
    return "OK";                                             // 작은 + 단자 (r=13)
}

int main()
{
    Mat gray = imread("images/battery_cells.png", IMREAD_GRAYSCALE);
    Mat overlay;
    cvtColor(gray, overlay, COLOR_GRAY2BGR);
    int present = 0, ng = 0;
    for (int r = 0; r < 4; r++)
        for (int c = 0; c < 6; c++)
        {
            Point center(95 + 90 * c, 105 + 90 * r);         // 셀 격자 (IMAGES.md)
            double m;
            int bright;
            string j = judgeCell(gray, center, m, bright);
            if (j != "누락") present++;
            if (j != "OK")
            {
                ng++;
                cout << format("(%d,%d) 평균 %.0f 밝은 픽셀 %d -> ", r, c, m, bright) << j << endl;
            }
            circle(overlay, center, 40, j == "OK" ? Scalar(0, 200, 0) : Scalar(0, 0, 255), 2);
        }
    cout << "셀 " << present << "개 / 자리 24개, 불량 " << ng << "개 -> " << (ng == 0 ? "OK" : "NG") << endl;
    imshow("cells", overlay);
    waitKey(0);
    return 0;
}`
      },
      {
        title: '구멍 유무로 부품 종류 나누기 (윤곽 계층)', level: 3,
        desc: '<code>images/washers.png</code> 에서 <b>구멍 있는 부품</b>(와셔 · 너트)과 <b>구멍 없는 부품</b>(볼트)을 나누세요. <code>findContours</code> 를 <code>RETR_CCOMP</code> 로 부르면 <code>vector&lt;Vec4i&gt; hier</code> 에 <code>[next, prev, child, parent]</code> 가 들어옵니다. <b>부모가 없는 윤곽(바깥)</b>마다 <b>자식(구멍)</b>이 있는지 보면 됩니다.',
        hint: '<code>hier[i][3] &lt; 0</code> 이면 바깥 윤곽, <code>hier[i][2] &gt;= 0</code> 이면 구멍이 있습니다. 면적 500 미만은 무시. 닿은 부품 때문에 바깥 윤곽은 11개이고, 볼트+너트(B3–N4) 덩어리는 너트 구멍 때문에 “구멍 있음” 으로 분류됩니다 → 결과 9 · 2 를 해석해 보세요.',
        expect: '윤곽선 21개 (바깥 + 구멍)\n구멍 있는 부품 9개, 구멍 없는 부품 2개',
        starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat bin;
    threshold(gray, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);

    vector<vector<Point>> contours;
    vector<Vec4i> hier;                                   // [next, prev, child, parent]
    findContours(bin, contours, hier, RETR_CCOMP, CHAIN_APPROX_SIMPLE);
    cout << "윤곽선 " << contours.size() << "개 (바깥 + 구멍)" << endl;

    int withHole = 0, noHole = 0;
    for (size_t i = 0; i < contours.size(); i++)
    {
        if (hier[i][3] >= 0) continue;                    // 부모가 있으면 구멍 → 건너뛴다
        // TODO: 면적 500 미만은 무시하고, 자식(hier[i][2])이 있으면 withHole, 없으면 noHole 을 세세요
    }
    cout << "구멍 있는 부품 " << withHole << "개, 구멍 없는 부품 " << noHole << "개" << endl;
    imshow("bin", bin);
    waitKey(0);
    return 0;
}`,
        solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat gray = imread("images/washers.png", IMREAD_GRAYSCALE);
    Mat bin;
    threshold(gray, bin, 0, 255, THRESH_BINARY_INV | THRESH_OTSU);

    vector<vector<Point>> contours;
    vector<Vec4i> hier;                                   // [next, prev, child, parent]
    findContours(bin, contours, hier, RETR_CCOMP, CHAIN_APPROX_SIMPLE);
    cout << "윤곽선 " << contours.size() << "개 (바깥 + 구멍)" << endl;

    Mat overlay;
    cvtColor(gray, overlay, COLOR_GRAY2BGR);
    int withHole = 0, noHole = 0;
    for (size_t i = 0; i < contours.size(); i++)
    {
        if (hier[i][3] >= 0) continue;                    // 부모가 있으면 구멍 → 건너뛴다
        if (contourArea(contours[i]) < 500) continue;
        bool hasHole = hier[i][2] >= 0;                   // 자식(구멍)이 있는가
        if (hasHole) withHole++; else noHole++;
        Scalar color = hasHole ? Scalar(0, 200, 0) : Scalar(0, 0, 255);
        Rect box = boundingRect(contours[i]);
        rectangle(overlay, box, color, 2);
        putText(overlay, hasHole ? "H" : "B", box.tl() + Point(3, 18), FONT_HERSHEY_SIMPLEX, 0.6, color, 2);
    }
    cout << "구멍 있는 부품 " << withHole << "개, 구멍 없는 부품 " << noHole << "개" << endl;
    imshow("holes", overlay);
    waitKey(0);
    return 0;
}`
      }
    ],
    quiz: [
      { q: '<code>class Inspector { public: virtual InspectionResult inspect(const Mat&amp; img) = 0; };</code> 에 대한 설명으로 옳은 것은?', options: ['<code>Inspector</code> 객체를 바로 만들 수 있다', '<code>= 0</code> 은 순수 가상 함수 — <b>자식 클래스가 반드시 구현</b>해야 하고 <code>Inspector</code> 자체로는 객체를 만들 수 없다', '<code>= 0</code> 은 기본 반환값이 0 이라는 뜻이다', '<code>virtual</code> 이 없어도 부모 포인터로 부르면 자식 함수가 불린다'], answer: 1,
        explain: '순수 가상 함수가 하나라도 있으면 <b>추상 클래스</b>입니다. <code>unique_ptr&lt;Inspector&gt; p = make_unique&lt;CountInspector&gt;();</code> 처럼 자식 객체를 부모 포인터로 다루고, <code>p-&gt;inspect(img)</code> 는 실제 객체(CountInspector)의 함수를 부릅니다. <code>virtual</code> 이 없으면 부모 함수가 불립니다.' },
      { q: 'Otsu 이진화만으로는 알 수 <u>없는</u> 것은?', options: ['임계값', '<b>어느 쪽이 물체인지</b>(밝은 쪽 / 어두운 쪽)', '영상의 크기', '히스토그램의 모양'], answer: 1,
        explain: 'Otsu 는 두 덩어리를 가장 잘 나누는 임계값만 찾습니다. 물체가 밝은지 어두운지는 <b>조명 방식</b>에 달려 있으므로 따로 정해야 합니다 — 흰 비율로 자동 추정하거나(connector_pins 에서는 실패), 현장처럼 <b>조명을 고정하고 설정값으로</b> 둡니다.' },
      { q: '<code>washers.png</code> 의 부품 13개가 11개로 세어질 때, 예제 1 의 <code>CountInspector</code> 가 “붙음 의심” 을 찾는 방법은?', options: ['윤곽선의 꼭짓점 수', '면적이 <b>중앙값의 1.8배 이상</b>인 덩어리', '덩어리의 평균 밝기', '구멍의 개수'], answer: 1,
        explain: '부품 크기가 비슷하면 두 개가 붙은 덩어리는 면적이 약 2배가 됩니다. 평균 대신 <b>중앙값</b>을 쓰는 이유는 큰 덩어리 몇 개가 평균을 끌어올려도 중앙값은 거의 변하지 않기 때문입니다. 분리가 필요하면 거리 변환 + watershed(예제 3).' },
      { q: '헤더 파일(<code>Inspector.h</code>)에 대한 규칙으로 <u>틀린</u> 것은?', options: ['맨 위에 <code>#pragma once</code> 를 둔다', '<code>using namespace std;</code> 를 맨 위에 써 두면 편하다', '함수 선언의 기본 인수는 선언(헤더)에만 적는다', '클래스 안에 몸체를 쓴 멤버 함수는 헤더에 있어도 된다(inline)'], answer: 1,
        explain: '헤더의 <code>using namespace</code> 는 그 헤더를 포함하는 <b>모든 파일</b>로 퍼져 이름 충돌을 일으킵니다. 헤더에서는 <code>std::string</code> · <code>cv::Mat</code> 처럼 전체 이름을 쓰고, <code>.cpp</code> 나 함수 안에서만 <code>using namespace</code> 를 씁니다.' },
      { q: '커넥터 핀의 <b>누락</b> 과 <b>휨</b> 을 구분하는 기준은?', options: ['블롭의 면적', '공칭 위치에서 <b>가장 가까운 블롭까지의 거리</b>(조금 멀면 휨, 아주 멀면 누락)', '블롭의 밝기', '윤곽선의 개수'], answer: 1,
        explain: '거리 ≤ 5 px 이면 OK, 5~20 px 이면 자리에는 있으나 벗어남(휨), 20 px 초과면 그 자리에 핀이 없음(누락). 정답은 i=4 휨(9.7 px), i=8 누락(39.9 px) 입니다.' }
    ],
    slides: [
      { layout: 'title', title: '실전 검사 프로젝트', subtitle: '1교시 — 검사기 설계와 개수 세기: Inspector · InspectionResult · CountInspector', notes: '<p>강좌의 마지막 차시(캡스톤)입니다. 💬 “16차시 Image Studio 와 검사 프로그램의 가장 큰 차이는?” — 예상 답: 검사는 <b>판정(OK/NG)과 근거</b>를 남긴다. 이번 차시는 지금까지 배운 것(색 공간 · 이진화 · 모폴로지 · 윤곽선 · 클래스 설계)을 모두 쓰는 종합 실습이라고 알려 줍니다. (3분)</p>' },
      { layout: 'bullets', title: '검사 결과는 네 가지', lead: 'InspectionResult 하나에 담는다', bullets: [
        '<b>ok</b> — 통과 / 불량',
        '<b>values</b> — 개수 · 지름 · 차이처럼 판정 근거가 된 숫자 (CSV 한 줄)',
        '<b>defects</b> — 불량 위치 <code>vector&lt;Rect&gt;</code>',
        '<b>overlay</b> — 근거를 그린 이미지 (사각형 · 번호 · OK/NG 띠)',
        ['<code>summary()</code>', ['“NG | 개수 세기 | washers.png | count=11 expected=13 | 불량 2곳”']]
      ], notes: '<p>“근거 없는 판정은 쓸 수 없다” 를 강조하세요 — 현장에서 NG 가 나면 반드시 사람이 확인하므로 오버레이와 측정값이 필수입니다. 💬 “측정값을 왜 남길까?” — 나중에 불량 원인 분석 · 임계값 조정의 근거. (4분)</p>' },
      { layout: 'diagram', title: '검사 프로그램의 공통 흐름', html: FIG_PIPE, caption: '입력 → 전처리 → 분할 → 측정 → 판정 → 기록. 검사기마다 ②~⑤ 만 다르다', notes: '<p>각 단계가 어느 차시에서 배운 것인지 짚어 주세요: Gray · HSV(05) · Otsu(07) · 블러(08) · 모폴로지(09) · 윤곽선(12). 💬 “세 검사기의 결과 모양이 같다면 무엇을 할 수 있을까?” — 한 반복문으로 모두 처리(다형성). (4분)</p>' },
      { layout: 'diagram', title: '클래스 설계', html: FIG_CLASS, caption: 'Inspector(추상) ← 세 검사기 · 결과는 InspectionResult · main 은 unique_ptr 로 소유', notes: '<p>16차시 <code>Filter</code> 와 1:1 로 대응시켜 설명합니다: <code>Filter::apply</code> ↔ <code>Inspector::inspect</code>, <code>Pipeline</code> 의 <code>vector&lt;unique_ptr&lt;Filter&gt;&gt;</code> ↔ 검사기 목록. 💬 “DefectInspector 는 골든 이미지가 필요한데 inspect(img) 모양을 어떻게 맞췄을까?” — 생성자에서 받아 멤버로 저장(3교시). (5분)</p>' },
      { layout: 'code', title: 'Inspector.h — 결과와 인터페이스', file: 'Inspector.h', run: false, code: `#pragma once
#include <opencv2/opencv.hpp>
#include <string>
#include <vector>

struct Measurement { std::string name; double value; };

struct InspectionResult
{
    std::string inspector, image;
    bool ok = true;
    std::vector<Measurement> values;    // 측정값
    std::vector<cv::Rect> defects;      // 불량 위치
    cv::Mat overlay;                    // 근거 이미지
    std::string summary() const;
};

class Inspector                         // 추상 클래스
{
public:
    virtual ~Inspector() = default;     // 가상 소멸자!
    virtual std::string name() const = 0;
    virtual InspectionResult inspect(const cv::Mat& img) = 0;
};`, points: ['<code>= 0</code> 순수 가상 함수 → 객체를 못 만드는 “약속”', '헤더에는 <code>using namespace</code> 금지 → <code>std::</code> · <code>cv::</code>', '<code>const Mat&amp;</code>: 복사 안 함 · 바꾸지 않음'], notes: '<p>한 줄씩 읽으며 <b>struct vs class</b>(데이터 묶음 vs 동작 약속)를 구분합니다. 가상 소멸자가 없으면 <code>unique_ptr&lt;Inspector&gt;</code> 가 자식 객체를 지울 때 자식 소멸자가 불리지 않는다는 점을 강조하세요. (5분)</p>' },
      { layout: 'code', title: 'CountInspector — 이진화 · 극성 · 윤곽선', file: 'CountInspector.h', run: false, code: `class CountInspector : public Inspector
{
public:
    int expected = 0;          // 기대 개수
    double minArea = 300;      // 잡음 하한
    std::string name() const override { return "개수 세기"; }

    InspectionResult inspect(const cv::Mat& img) override
    {
        using namespace cv;
        Mat gray = toGray(img), bin;
        GaussianBlur(gray, gray, Size(5, 5), 0);
        threshold(gray, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
        if (countNonZero(bin) > bin.total() / 2)   // 흰색 = 배경?
            bitwise_not(bin, bin);
        morphologyEx(bin, bin, MORPH_OPEN,
                     getStructuringElement(MORPH_ELLIPSE, Size(3, 3)));
        std::vector<std::vector<Point>> contours;
        findContours(bin, contours, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
        // … 면적 필터 · 정렬 · 붙음 의심 · 오버레이 · 판정
    }
};`, points: ['<code>override</code>: 부모 함수를 제대로 덮어썼는지 컴파일러가 확인', '극성 판단: 흰 비율 &gt; 50% → 반전', '<code>RETR_EXTERNAL</code>: 와셔 구멍은 세지 않는다'], notes: '<p>학생들이 예제 1 을 실행합니다. 결과 <b>count=11 · 불량 2곳 → NG</b> 를 확인하고 오버레이에서 빨간 사각형(붙음 의심)을 찾게 합니다. 💬 “Open 은 왜 넣나?” — 잡점 하나가 부품 하나로 세어지는 것을 막는다(면적 필터와 이중 방어). (6분)</p>' },
      { layout: 'image', title: 'washers.png — 13개인데 11개', src: 'images/washers.png', caption: '와셔 6 · 너트 4 · 볼트 3. 좌상단(W1–W2)과 아래(B3–N4)가 닿아 있다', notes: '<p>이미지를 크게 띄우고 닿은 쌍을 찾아보게 합니다. 💬 “현장이라면 어떻게 해결할까?” — 부품을 떨어뜨려 공급(근본책), 알고리즘으로 분리(차선책), 붙음 의심으로 사람에게 넘기기(예제 1). (3분)</p>' },
      { layout: 'code', title: '닿은 부품 분리 (거리 변환 + watershed)', run: false, code: `// ① 구멍 메우기 → ② 거리 변환 → 봉우리 = 씨앗
drawContours(solid, outer, -1, Scalar(255), FILLED);
distanceTransform(solid, dist, DIST_L2, DIST_MASK_5);
minMaxLoc(dist, nullptr, &dmax);                 // 41.7 px
threshold(dist, seeds, 0.4 * dmax, 255, THRESH_BINARY);
seeds.convertTo(seeds, CV_8UC1);

// ③ 마커: 배경 1 · 씨앗 2.. · 모름 0
int n = connectedComponents(seeds, markers, 8, CV_32S);
markers += Scalar(1);
markers.setTo(Scalar(0), solid - seeds);

// ④ watershed → ⑤ 라벨마다 마스크
watershed(overlay, markers);
for (int k = 2; k <= n; k++)
{
    Mat mask = (markers == k);
    Rect box = boundingRect(mask);
}`, points: ['봉우리 비율 0.25 → 14개 · <b>0.4 → 13개</b> · 0.5 → 10개', '마커 규칙 <b>1=배경, 2..=씨앗, 0=모름</b>', '<code>markers == k</code> → 0/255 마스크'], notes: '<p>12차시 복습입니다. 비율을 바꾸면 결과가 크게 달라지는 것을 실행해 보여 주며 “파라미터 민감도” 를 체감시킵니다. 마커 규칙 세 가지는 칠판에 적으세요. (5분)</p>' },
      { layout: 'two', title: '크기 선별과 격자 대조', left: { title: '크기 선별 (coins_parts)', bullets: ['등가 반지름 r = √(A/π)', 'r ≥ 30 → L, ≥ 24 → M, 그 외 S', '정답: S 5 · M 4 · L 3', '× 0.1 mm/px → Ø4.0 / 5.4 / 6.8 mm'] }, right: { title: '격자 대조 (connector_pins)', bullets: ['공칭 x = 100 + 40·i, y = 240', '가장 가까운 블롭까지 <code>norm(p − q)</code>', '≤5 OK / ≤20 휨 / &gt;20 누락', '정답: i=4 휨(9.7 px), i=8 누락'] }, notes: '<p>“개수만 세는 검사”와 “위치를 보는 검사”의 차이를 정리합니다. 후자는 <b>설계 도면의 좌표</b>가 필요하고, 그래서 현장에서는 카메라를 고정하고 정렬 마크(14차시)로 좌표를 맞춥니다. 핀 검사는 극성을 <b>고정</b>한 점도 짚어 주세요. (5분)</p>' },
      { layout: 'code', title: 'CSV 리포트 — ofstream', code: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <fstream>
using namespace cv;
using namespace std;

int main()
{
    ofstream csv("report.csv");                  // 📁 작업 폴더에 생긴다
    if (!csv) { cout << "열 수 없음" << endl; return -1; }
    csv << "no,image,judge,count" << "\\n";       // 헤더
    csv << 1 << ",washers.png,NG," << 11 << "\\n";
    csv << 2 << ",coins_parts.png,OK," << 12 << "\\n";
    csv.close();                                 // 닫아야 확실히 기록

    ifstream in("report.csv");
    for (string line; getline(in, line); )
        cout << line << endl;
    return 0;
}`, points: ['<code>cout</code> 과 똑같이 <code>&lt;&lt;</code> 로 쓴다', '줄 끝은 <code>"\\n"</code> (endl 은 매번 flush → 느림)', 'Excel 한글: 파일 앞에 UTF-8 BOM'], notes: '<p>실행하면 결과 창에 “💾 파일 저장: report.csv” 가 뜨고 📁 작업 폴더에서 내려받을 수 있음을 보여 줍니다. 💬 “왜 한 줄씩 파일을 열고 닫지 않나?” — 열기/닫기 비용이 크다. 장비는 하루 수만 건을 기록합니다. (4분)</p>' },
      { layout: 'quiz', title: '확인 퀴즈', q: '<code>= 0</code> 이 붙은 <code>virtual InspectionResult inspect(const Mat&amp;) = 0;</code> 의 의미는?', options: ['기본 반환값이 0', '<b>순수 가상 함수</b> — 자식이 반드시 구현, 부모 객체는 못 만든다', '인라인 함수', 'const 함수'], answer: 1, explain: '순수 가상 함수가 있는 클래스는 추상 클래스. 자식(<code>CountInspector</code>)이 <code>override</code> 로 구현합니다.', notes: '<p>정답 2번. 이어서 “가상 소멸자는 왜 필요?” 를 물어 복습합니다. (2분)</p>' },
      { layout: 'practice', title: '실습: 배터리 셀 누락 · 역삽', desc: '<p><code>battery_cells.png</code> 4 × 6 자리에서 <b>누락</b>과 <b>역삽</b>을 찾으세요.</p><ul><li>셀 중심 x = 95 + 90·c, y = 105 + 90·r</li><li>평균 밝기 · 밝은 픽셀 수를 보고 규칙 정하기</li><li>정답: (1,3) 역삽 · (2,5) 누락</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

// 셀 자리 하나의 판정: 평균 밝기로 유무, 밝은 픽셀 수로 극성
string judgeCell(const Mat& gray, Point center, double& meanV, int& bright)
{
    Mat mask = Mat::zeros(gray.size(), CV_8UC1);
    circle(mask, center, 36, Scalar(255), FILLED);           // 셀 반지름 40 보다 조금 안쪽
    meanV = mean(gray, mask)[0];
    Mat roi = gray(Rect(center.x - 40, center.y - 40, 80, 80));
    bright = countNonZero(roi > 170);
    // TODO: 결과 창에서 값을 보고 규칙을 정하세요
    //   누락 = 검은 구멍 (평균이 아주 낮다) → "누락"
    //   역삽 = 넓고 밝은 − 원판 (밝은 픽셀이 아주 많다) → "역삽"
    return "OK";
}

int main()
{
    Mat gray = imread("images/battery_cells.png", IMREAD_GRAYSCALE);
    Mat overlay;
    cvtColor(gray, overlay, COLOR_GRAY2BGR);
    int present = 0, ng = 0;
    for (int r = 0; r < 4; r++)
        for (int c = 0; c < 6; c++)
        {
            Point center(95 + 90 * c, 105 + 90 * r);         // 셀 격자 (IMAGES.md)
            double m;
            int bright;
            string j = judgeCell(gray, center, m, bright);
            cout << format("(%d,%d) 평균 %.0f 밝은 픽셀 %d -> ", r, c, m, bright) << j << endl;
            // TODO: present(누락이 아닌 셀) · ng(OK 가 아닌 셀) 를 세고, 불량은 빨간 원으로 그리세요
            circle(overlay, center, 40, Scalar(0, 200, 0), 2);
        }
    cout << "셀 " << present << "개 / 자리 24개, 불량 " << ng << "개" << endl;
    imshow("cells", overlay);
    waitKey(0);
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

// 셀 자리 하나의 판정: 평균 밝기로 유무, 밝은 픽셀 수로 극성
string judgeCell(const Mat& gray, Point center, double& meanV, int& bright)
{
    Mat mask = Mat::zeros(gray.size(), CV_8UC1);
    circle(mask, center, 36, Scalar(255), FILLED);           // 셀 반지름 40 보다 조금 안쪽
    meanV = mean(gray, mask)[0];
    Mat roi = gray(Rect(center.x - 40, center.y - 40, 80, 80));
    bright = countNonZero(roi > 170);
    if (meanV < 60) return "누락";                           // 검은 구멍
    if (bright > 1500) return "역삽";                        // 넓고 밝은 − 원판 (r=34)
    return "OK";                                             // 작은 + 단자 (r=13)
}

int main()
{
    Mat gray = imread("images/battery_cells.png", IMREAD_GRAYSCALE);
    Mat overlay;
    cvtColor(gray, overlay, COLOR_GRAY2BGR);
    int present = 0, ng = 0;
    for (int r = 0; r < 4; r++)
        for (int c = 0; c < 6; c++)
        {
            Point center(95 + 90 * c, 105 + 90 * r);         // 셀 격자 (IMAGES.md)
            double m;
            int bright;
            string j = judgeCell(gray, center, m, bright);
            if (j != "누락") present++;
            if (j != "OK")
            {
                ng++;
                cout << format("(%d,%d) 평균 %.0f 밝은 픽셀 %d -> ", r, c, m, bright) << j << endl;
            }
            circle(overlay, center, 40, j == "OK" ? Scalar(0, 200, 0) : Scalar(0, 0, 255), 2);
        }
    cout << "셀 " << present << "개 / 자리 24개, 불량 " << ng << "개 -> " << (ng == 0 ? "OK" : "NG") << endl;
    imshow("cells", overlay);
    waitKey(0);
    return 0;
}`, notes: '<p>먼저 starter 를 실행해 24자리의 값을 모두 보게 한 뒤 규칙을 정하게 합니다 — “측정 → 규칙” 순서가 핵심입니다. 정상 ≈ 평균 105 · 밝은 픽셀 500, 역삽 3466, 누락 평균 27. 빨리 끝난 학생은 이 코드를 <code>Inspector</code> 를 상속한 <code>CellInspector</code> 로 바꿔 보게 합니다. (10분)</p>' },
      { layout: 'summary', title: '1교시 정리', bullets: [
        '검사 결과 = <b>ok + values + defects + overlay</b> (<code>InspectionResult</code>)',
        '<code>Inspector</code> 추상 클래스 + <code>virtual inspect(const Mat&amp;) = 0</code> → 다형성',
        '파일 나누기: <code>.h</code> 선언(<code>#pragma once</code>, using 금지) · <code>.cpp</code> 구현',
        'Otsu(극성 판단) → Open → 바깥 윤곽선 → 면적 필터 → 판정 (+ 붙음 의심)',
        '위치가 정해진 부품: <b>공칭 격자와 최근접 거리</b> · 결과는 <b>CSV(ofstream)</b>',
        '다음 시간: 색으로 판정하기 — HSV · ColorSortInspector · 격자 ROI · 병 라인'
      ], notes: '<p>파이프라인 순서를 학생들이 말하게 하고 마칩니다. 숙제: 예제 1 의 <code>CountInspector</code> 에 극성 설정(<code>polarity</code>) 멤버를 추가해 connector_pins 에서도 12자리 중 11개가 세어지게 해 보기. (2분)</p>' }
    ]
  };

  // ───────────────────────────── 2교시 ─────────────────────────────

  // 그림 5: HSV 색상(H) 범위 나누기
  const FIG_HSV = `<svg viewBox="0 0 740 300" role="img" aria-label="OpenCV HSV 의 색상 H 값 0부터 179 까지를 색별 구간으로 나눈 그림">
  <text x="370" y="24" text-anchor="middle" class="tx-b">OpenCV HSV: H 0~179 (일반 색상환 0~359 의 절반), S 0~255, V 0~255</text>
  <rect x="40" y="40" width="660" height="34" rx="4" class="p1s"/>
  <g class="ln" stroke-width="1">
    <line x1="77" y1="40" x2="77" y2="74"/><line x1="114" y1="40" x2="114" y2="74"/><line x1="169" y1="40" x2="169" y2="74"/>
    <line x1="187" y1="40" x2="187" y2="74"/><line x1="352" y1="40" x2="352" y2="74"/><line x1="389" y1="40" x2="389" y2="74"/>
    <line x1="517" y1="40" x2="517" y2="74"/><line x1="664" y1="40" x2="664" y2="74"/>
  </g>
  <g class="tx-m" font-size="11">
    <text x="40" y="90">0</text><text x="110" y="90">10</text><text x="180" y="90">30</text><text x="350" y="90">85</text>
    <text x="512" y="90">130</text><text x="660" y="90">170</text><text x="694" y="90">179</text>
  </g>
  <text x="58" y="62" text-anchor="middle" class="tx">빨강</text>
  <text x="141" y="62" text-anchor="middle" class="tx">주황</text>
  <text x="270" y="62" text-anchor="middle" class="tx">노랑 · 초록</text>
  <text x="453" y="62" text-anchor="middle" class="tx">파랑</text>
  <text x="590" y="62" text-anchor="middle" class="tx">보라 · 자홍</text>
  <text x="682" y="62" text-anchor="middle" class="tx">빨강</text>
  <rect x="40" y="112" width="320" height="94" rx="10" class="p2s"/>
  <text x="200" y="134" text-anchor="middle" class="tx-b">⚠ 빨강은 두 구간</text>
  <text x="200" y="154" text-anchor="middle" class="tx-m">H 0~8(10) <tspan class="tx-b">과</tspan> H 170~179</text>
  <text x="200" y="174" text-anchor="middle" class="tx-m">inRange 두 번 + mask1 | mask2</text>
  <text x="200" y="194" text-anchor="middle" class="tx-m">(색상환이 0 에서 이어지므로)</text>
  <rect x="380" y="112" width="320" height="94" rx="10" class="p3s"/>
  <text x="540" y="134" text-anchor="middle" class="tx-b">⚠ 흰색 · 검정 · 회색은 H 가 무의미</text>
  <text x="540" y="154" text-anchor="middle" class="tx-m">흰색: S 낮고(≤60) V 높음(≥170)</text>
  <text x="540" y="174" text-anchor="middle" class="tx-m">검정: V 낮음 / 회색: S 낮고 V 중간</text>
  <text x="540" y="194" text-anchor="middle" class="tx-m">→ H 를 0~179 전체로 두고 S · V 로 판정</text>
  <rect x="40" y="224" width="660" height="60" rx="10" class="card-bg"/>
  <text x="370" y="246" text-anchor="middle" class="tx">순서: BGR → <tspan class="tx-b">cvtColor(BGR2HSV)</tspan> → <tspan class="tx-b">inRange(lo, hi)</tspan> → 열기 · 닫기 → 윤곽선 · 면적</text>
  <text x="370" y="270" text-anchor="middle" class="tx-m">밝기(조명)가 바뀌어도 H 는 거의 그대로 → BGR 값으로 직접 비교하는 것보다 훨씬 튼튼하다</text>
</svg>`;

  // 그림 6: 블리스터 포켓 격자
  const FIG_POCKET = `<svg viewBox="0 0 740 300" role="img" aria-label="블리스터 포장의 2행 5열 포켓 격자와 불량 위치">
  <text x="370" y="24" text-anchor="middle" class="tx-b">포켓 중심 x = 120 + 100·c (c = 0…4), y = 170 + 140·r (r = 0, 1) · 포켓 반지름 38</text>
  <rect x="40" y="40" width="660" height="180" rx="10" class="p1s"/>
  <circle cx="110" cy="90" r="34" class="p5s"/><text x="110" y="95" text-anchor="middle" class="tx">OK</text>
  <circle cx="240" cy="90" r="34" class="p5s"/><text x="240" y="95" text-anchor="middle" class="tx">OK</text>
  <circle cx="370" cy="90" r="34" class="p5s"/><text x="370" y="95" text-anchor="middle" class="tx">OK</text>
  <circle cx="500" cy="90" r="34" class="p4s" stroke-dasharray="4 3"/><text x="500" y="88" text-anchor="middle" class="tx-b">빈</text><text x="500" y="104" text-anchor="middle" class="tx-m">(0,3)</text>
  <circle cx="630" cy="90" r="34" class="p5s"/><text x="630" y="95" text-anchor="middle" class="tx">OK</text>
  <circle cx="110" cy="170" r="34" class="p5s"/><text x="110" y="175" text-anchor="middle" class="tx">OK</text>
  <circle cx="240" cy="170" r="34" class="p4s"/><text x="240" y="168" text-anchor="middle" class="tx-b">깨짐</text><text x="240" y="184" text-anchor="middle" class="tx-m">(1,1)</text>
  <circle cx="370" cy="170" r="34" class="p5s"/><text x="370" y="175" text-anchor="middle" class="tx">OK</text>
  <circle cx="500" cy="170" r="34" class="p5s"/><text x="500" y="175" text-anchor="middle" class="tx">OK</text>
  <circle cx="630" cy="170" r="34" class="p4s"/><text x="630" y="168" text-anchor="middle" class="tx-b">색 불량</text><text x="630" y="184" text-anchor="middle" class="tx-m">(1,4)</text>
  <text x="370" y="248" text-anchor="middle" class="tx">각 포켓마다 <tspan class="tx-b">ROI hsv(Rect)</tspan> 를 잘라 흰 알약 픽셀 수와 주황 픽셀 수를 센다</text>
  <text x="370" y="272" text-anchor="middle" class="tx-m">둘 다 적으면 <tspan class="tx-b">빈 포켓</tspan> · 주황이 더 많으면 <tspan class="tx-b">색 불량</tspan> · 흰 픽셀이 정상(약 2400)의 80% 미만이면 <tspan class="tx-b">깨짐</tspan></text>
  <text x="370" y="294" text-anchor="middle" class="tx-m">정답: (0,3) 빈 포켓 · (1,1) 깨짐 · (1,4) 색 불량 → 전체 NG</text>
</svg>`;

  const EX_HSVPICK = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

// HSV 값으로 색 이름 추정 (색 범위 표를 만들기 위한 근거)
string guess(int h, int s, int v)
{
    if (s <= 55 && v >= 150) return "white";      // 무채색: H 는 의미 없음 → S · V 로
    if (h <= 10 || h >= 170) return "red";        // 빨강은 두 구간
    if (h >= 20 && h <= 35) return "yellow";
    if (h >= 40 && h <= 85) return "green";
    if (h >= 95 && h <= 130) return "blue";
    return "?";
}

int main()
{
    Mat src = imread("images/color_caps.png", IMREAD_COLOR);
    Mat hsv, gray, bin, labels, stats, cents;
    cvtColor(src, hsv, COLOR_BGR2HSV);

    // 뚜껑 위치는 밝기로 먼저 찾는다 (어두운 컨베이어 위의 밝은 뚜껑)
    cvtColor(src, gray, COLOR_BGR2GRAY);
    threshold(gray, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    int n = connectedComponentsWithStats(bin, labels, stats, cents);

    cout << "뚜껑 중심의 BGR → HSV (색 범위를 정하는 근거)" << endl;
    int shown = 0;
    for (int i = 1; i < n && shown < 10; i++)
    {
        if (stats.at<int>(i, CC_STAT_AREA) < 600) continue;
        int cx = (int)cents.at<double>(i, 0), cy = (int)cents.at<double>(i, 1);
        Vec3b b = src.at<Vec3b>(cy, cx);           // (행 y, 열 x) 순서!
        Vec3b p = hsv.at<Vec3b>(cy, cx);
        cout << format("  (%3d,%3d) BGR(%3d,%3d,%3d) -> H=%3d S=%3d V=%3d  %s", cx, cy,
                       b[0], b[1], b[2], p[0], p[1], p[2], guess(p[0], p[1], p[2]).c_str()) << endl;
        shown++;
    }
    imshow("caps", src);
    waitKey(0);
    return 0;
}`;
  const EX_COLOR = join(BASE, COLOR_H, `// ===== File: main.cpp =====
#include "ColorSortInspector.h"
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/color_caps.png", IMREAD_COLOR);
    ColorSortInspector sorter;
    sorter.expected = { {"red", 5}, {"yellow", 6}, {"green", 4}, {"blue", 3}, {"white", 2} };

    InspectionResult r = sorter.inspect(img);
    r.image = "color_caps.png";
    cout << r.summary() << endl;

    // 색 정의는 "데이터" — 코드를 고치지 않고 범위만 바꿔 본다 (흰색 V 하한 170 → 240)
    sorter.specs[4].lo = Scalar(0, 0, 240);
    InspectionResult r2 = sorter.inspect(img);
    r2.image = "color_caps.png (white V>=240)";
    cout << r2.summary() << endl;

    imshow("color sort", r.overlay);
    waitKey(0);
    return 0;
}`);
  const EX_BLISTER = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

const int NORMAL_PILL = 2400;      // 정상 알약의 흰 픽셀 수 (양품 샘플로 측정)

int main()
{
    Mat src = imread("images/blister_pack.png", IMREAD_COLOR);
    Mat hsv;
    cvtColor(src, hsv, COLOR_BGR2HSV);
    Mat overlay = src.clone();

    int ng = 0;
    cout << "행 열  흰픽셀 주황픽셀  판정" << endl;
    for (int r = 0; r < 2; r++)
        for (int c = 0; c < 5; c++)
        {
            Point center(120 + 100 * c, 170 + 140 * r);          // 포켓 격자 (IMAGES.md)
            Rect roi(center.x - 38, center.y - 38, 76, 76);      // 포켓 반지름 38
            Mat sub = hsv(roi);                                   // ROI = 복사가 아니라 "창"

            Mat white, orange;
            inRange(sub, Scalar(0, 0, 150), Scalar(179, 70, 255), white);      // 채도 낮고 밝음
            inRange(sub, Scalar(5, 90, 90), Scalar(25, 255, 255), orange);     // H 5~25
            int wa = countNonZero(white), oa = countNonZero(orange);

            string judge;                                          // 가장 확실한 것부터!
            if (wa < 500 && oa < 500)        judge = "NG 빈 포켓";
            else if (oa > wa)                judge = "NG 색 불량";
            else if (wa < NORMAL_PILL * 0.8) judge = "NG 깨짐";
            else                             judge = "OK";
            bool ok = judge == "OK";
            if (!ok) ng++;

            Scalar color = ok ? Scalar(0, 200, 0) : Scalar(0, 0, 255);
            rectangle(overlay, roi, color, 2);
            putText(overlay, ok ? "OK" : "NG", roi.tl() + Point(6, 20), FONT_HERSHEY_SIMPLEX, 0.5, color, 2);
            cout << format(" %d  %d   %5d   %5d   ", r, c, wa, oa) << judge << endl;
        }
    cout << "불량 " << ng << "개 -> 전체 판정 " << (ng == 0 ? "OK" : "NG") << endl;
    imshow("blister", overlay);
    waitKey(0);
    return 0;
}`;
  const EX_PROFILE = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

// 열 x 를 위에서 아래로 훑어 밝기가 처음 thr 아래로 떨어지는 y (없으면 -1)
int findLevel(const Mat& gray, int x, int thr = 130)
{
    for (int y = 130; y < 420; y++)
        if (gray.at<uchar>(y, x) < thr) return y;
    return -1;
}

int main()
{
    Mat src = imread("images/bottle_line.png", IMREAD_COLOR);
    Mat gray;
    cvtColor(src, gray, COLOR_BGR2GRAY);

    // 병 0(정상) 과 병 1(과소 충전) 의 세로 프로파일 비교
    for (int x : { 80, 200 })
    {
        cout << "x = " << x << " 열의 밝기 (y = 140 ~ 230, 10 픽셀 간격)" << endl << " ";
        for (int y = 140; y <= 230; y += 10)
            cout << format("%4d", (int)gray.at<uchar>(y, x));     // uchar 는 (int) 로!
        cout << endl << "  액면 y = " << findLevel(gray, x) << " (기준 170 ± 8)" << endl;
    }

    // 프로파일 그래프 (가로 = 밝기, 세로 = y)
    Mat chart(300, 200, CV_8UC3, Scalar(30, 30, 30));
    for (int y = 130; y < 420; y++)
    {
        int v = gray.at<uchar>(y, 200);
        circle(chart, Point(10 + v * 180 / 255, (y - 130) * 299 / 289), 1, Scalar(0, 255, 255), FILLED);
    }
    int tx = 10 + 130 * 180 / 255;                                // 임계값 130 위치
    line(chart, Point(tx, 0), Point(tx, 299), Scalar(0, 0, 255), 1);
    imshow("profile x=200", chart);
    waitKey(0);
    return 0;
}`;
  const EX_BOTTLE = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <cmath>
using namespace cv;
using namespace std;

int main()
{
    Mat src = imread("images/bottle_line.png", IMREAD_COLOR);
    Mat hsv, gray;
    cvtColor(src, hsv, COLOR_BGR2HSV);
    cvtColor(src, gray, COLOR_BGR2GRAY);
    Mat overlay = src.clone();

    const int centers[] = { 80, 200, 320, 440, 560 };       // 병 5개의 중심 x (IMAGES.md)
    int ngCount = 0;
    for (int i = 0; i < 5; i++)
    {
        int x = centers[i];

        // ① 캡(빨강) 유무 · 기울기 — 캡 ROI 안의 빨강 마스크
        Rect capRoi(x - 35, 78, 70, 56);
        Mat m1, m2;
        inRange(hsv(capRoi), Scalar(0, 90, 60), Scalar(10, 255, 255), m1);
        inRange(hsv(capRoi), Scalar(170, 90, 60), Scalar(179, 255, 255), m2);
        Mat red = m1 | m2;
        int capPx = countNonZero(red);

        string capJudge = "캡 정상";
        double tilt = 0;
        if (capPx < 300) capJudge = "캡 없음";
        else
        {
            vector<vector<Point>> cs;
            findContours(red, cs, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
            size_t big = 0;                                   // 가장 큰 윤곽
            for (size_t k = 1; k < cs.size(); k++)
                if (contourArea(cs[k]) > contourArea(cs[big])) big = k;
            tilt = minAreaRect(cs[big]).angle;
            while (tilt < -45) tilt += 90;                    // -45 ~ +45 로 정규화 (0 = 똑바로)
            while (tilt > 45) tilt -= 90;
            if (abs(tilt) > 5) capJudge = "캡 기울어짐";
        }

        // ② 액면 높이 — 중심 열을 위에서 아래로 훑어 처음 어두워지는 y
        int level = -1;
        for (int y = 130; y < 420; y++)
            if (gray.at<uchar>(y, x) < 130) { level = y; break; }
        string lvJudge = level < 0 ? "액면 없음" : level < 162 ? "과다 충전" : level > 178 ? "과소 충전" : "액면 정상";

        bool ok = capJudge == "캡 정상" && lvJudge == "액면 정상";   // 모든 항목 AND
        if (!ok) ngCount++;
        Scalar color = ok ? Scalar(0, 200, 0) : Scalar(0, 0, 255);
        rectangle(overlay, capRoi, color, 2);
        if (level > 0) line(overlay, Point(x - 30, level), Point(x + 30, level), color, 2);
        putText(overlay, ok ? "OK" : "NG", Point(x - 14, 440), FONT_HERSHEY_SIMPLEX, 0.6, color, 2);

        cout << format("병 %d: 캡 빨강 %4dpx, 기울기 %5.1f도 -> ", i, capPx, tilt) << capJudge
             << " / 액면 y=" << level << " -> " << lvJudge << " => " << (ok ? "OK" : "NG") << endl;
    }
    cout << "불량 " << ngCount << " / 5 -> 라인 판정 " << (ngCount == 0 ? "OK" : "NG") << endl;
    imshow("bottle line", overlay);
    waitKey(0);
    return 0;
}`;

  const SEC2 = {
    id: 'cv17-2', title: '색 분류 검사: HSV · ColorSortInspector · 격자 ROI · 병 라인', minutes: 50,
    goals: ['HSV inRange 로 색별 개수를 세고 빨강(두 구간) · 흰색(S · V)의 특수 처리를 할 수 있다', '색 정의를 데이터(vector&lt;ColorSpec&gt;)로 분리한 ColorSortInspector 를 만들 수 있다', '격자 ROI 로 자리마다 판정하고, 세로 프로파일 · 여러 항목(AND)으로 종합 판정할 수 있다'],
    flow: [['도입: 왜 HSV 인가', 6], ['ColorSortInspector', 16], ['격자 ROI 검사', 14], ['병 라인 · 규칙 정리', 14]],
    content: [
      { type: 'h', text: '색으로 판정하려면 HSV' },
      { type: 'p', html: '05차시에서 배웠듯 <b>BGR 값으로 색을 판정하면 조명이 조금만 바뀌어도 무너집니다</b>. 같은 빨간 뚜껑이 그늘에서는 (30, 30, 150), 밝은 곳에서는 (60, 60, 230) 이 되기 때문입니다. <b>HSV</b> 로 바꾸면 <b>H(색상, Hue)</b>는 거의 그대로이고 밝기 변화는 <b>V(명도)</b>에만 나타납니다. 그래서 색 검사는 거의 항상 <code>cvtColor(src, hsv, COLOR_BGR2HSV)</code> → <code>inRange(hsv, lo, hi, mask)</code> 로 시작합니다 (Python: <code>cv2.inRange</code>).' },
      { type: 'figure', html: FIG_HSV, caption: '그림 5. OpenCV HSV 의 H 는 0~179. 빨강은 두 구간, 흰색 · 검정은 S · V 로 판정한다' },
      { type: 'callout', kind: 'warn', title: '색 검사의 두 가지 함정', html: '<ul><li><b>빨강은 H 가 끊어져 있다</b>: 색상환이 원형이라 빨강이 <code>0~8</code> 과 <code>170~179</code> 로 나뉩니다 → <code>inRange</code> 를 두 번 하고 <code>mask1 | mask2</code>(= <code>bitwise_or</code>)로 합칩니다.</li><li><b>흰색 · 검정 · 회색은 H 가 의미 없다</b>: 무채색은 H 가 잡음에 따라 아무 값이나 나옵니다 → H 를 <code>0~179</code> 전체로 열어 두고 <b>S 가 낮고 V 가 높으면 흰색</b>, <b>V 가 낮으면 검정</b> 으로 판정합니다.</li><li>⚠️ <code>Scalar(H, S, V)</code> 순서입니다. BGR 영상에 HSV 범위를 넣는 실수(cvtColor 를 잊음)가 가장 흔합니다.</li></ul>' },
      { type: 'p', html: '범위를 정하는 가장 확실한 방법은 <b>실제 픽셀 값을 읽어 보는 것</b>입니다. 결과 창의 이미지 위에 마우스를 올리면 BGR 값이 보이고, 코드로는 <code>hsv.at&lt;Vec3b&gt;(y, x)</code> 로 읽습니다 — <b>(행 y, 열 x)</b> 순서!' },
      { type: 'code', title: '예제 1: 색 범위를 정하는 근거 — 뚜껑 중심의 HSV 읽기', code: EX_HSVPICK,
        desc: '<code>color_caps.png</code> 의 기준 색은 BGR 로 red (40,40,200) · green (60,160,50) · blue (190,90,30) · yellow (40,200,230) · white (225,225,222) 입니다. HSV 로 읽으면 노랑은 H≈25, 초록은 H≈63, 흰색은 <b>S 가 2~4</b> 로 아주 낮습니다 — 흰색을 S 로 판정하는 근거입니다. 그런데 목록에 빨강 · 파랑이 없습니다: 두 색은 <b>흑백으로 바꾸면 어두워서</b>(빨강 Gray ≈ 83) 밝기 Otsu 에서 배경으로 빠졌기 때문입니다 — <b>흑백만으로는 색 검사가 안 되는</b> 또 하나의 이유입니다. <code>Vec3b</code> 원소는 <code>uchar</code> 이지만 <code>format("%3d", ...)</code> 에 넣으면 정수로 출력됩니다(<code>cout</code> 이면 <code>(int)</code> 필요).',
        expect: '뚜껑 중심의 BGR → HSV (색 범위를 정하는 근거)\n  (582, 70) BGR(214,213,212) -> H=105 S=  2 V=214  white\n  (111,122) BGR( 70,187, 58) -> H= 63 S=176 V=187  green\n  (521,167) BGR( 39,195,226) -> H= 25 S=211 V=226  yellow\n  ( 69,195) BGR( 38,192,221) -> H= 25 S=211 V=221  yellow\n  (584,195) BGR( 38,191,222) -> H= 25 S=211 V=222  yellow\n  (424,226) BGR(227,226,223) -> H= 98 S=  4 V=227  white\n  (197,247) BGR( 39,199,229) -> H= 25 S=212 V=229  yellow\n  ( 88,362) BGR( 38,190,218) -> H= 25 S=211 V=218  yellow\n  (258,376) BGR( 70,187, 58) -> H= 63 S=176 V=187  green\n  (587,418) BGR( 37,189,216) -> H= 25 S=211 V=216  yellow' },
      { type: 'h', text: 'ColorSortInspector: 색 정의는 데이터로' },
      { type: 'p', html: '색이 다섯 개라고 <code>if</code> 를 다섯 번 쓰면, 색을 하나 추가하거나 범위를 고칠 때마다 검사 코드를 고쳐야 합니다. 대신 색 하나를 <b>구조체</b>(<code>struct ColorSpec { name, lo, hi, lo2, hi2, draw }</code>)로 표현하고 <b>목록</b>(<code>vector&lt;ColorSpec&gt;</code>)을 반복하면, 검사 코드는 그대로 두고 <b>데이터만</b> 바꾸면 됩니다. 실무에서는 이 목록을 제품별 <b>레시피 파일</b>로 저장해 불러옵니다.' },
      { type: 'code', title: '예제 2: ColorSortInspector (파일 4개) — red 5 · yellow 6 · green 4 · blue 3 · white 2', code: EX_COLOR,
        desc: '<code>Inspector.h</code> · <code>Inspector.cpp</code> 는 1교시와 <b>똑같은 파일</b>입니다 — 새 검사기는 <code>ColorSortInspector.h</code> 하나만 추가했습니다. <code>specs</code> 는 <b>집합 초기화</b>(aggregate initialization) <code>{ "red", {0,90,60}, {8,255,255}, … }</code> 로 채웠고, 두 번째 범위가 없는 색은 <code>hi2[0] = -1</code> 로 표시했습니다. <code>expected</code> 는 <code>map&lt;string, int&gt;</code> 라서 색 이름으로 기대 개수를 찾습니다(<code>find</code> → 없으면 판정 안 함). 마스크에 <b>열기</b>(하이라이트 · 경계 잡점 제거)와 <b>닫기</b>(톱니 무늬 구멍 메우기)를 모두 하고 면적 400 으로 거릅니다. 두 번째 줄은 흰색의 V 하한을 240 으로 바꾼 결과 — 코드는 그대로, <b>데이터 한 칸</b>만 바꿔도 흰 뚜껑(V≈214~227)이 0개가 되어 NG 입니다.',
        expect: 'OK | 색 분류 | color_caps.png | red=5 yellow=6 green=4 blue=3 white=2 total=20\nNG | 색 분류 | color_caps.png (white V>=240) | red=5 yellow=6 green=4 blue=3 white=0 total=18' },
      { type: 'callout', kind: 'more', title: '📘 C++ 문법 짚어 보기', html: '<ul><li><code>mask |= mask2;</code> — Mat 의 비트 OR 대입 연산자. <code>bitwise_or(mask, mask2, mask)</code> 와 같습니다.</li><li><code>Point(center)</code> — <code>Point2f</code> → <code>Point</code>(정수) 변환. 그리기 함수는 정수 좌표를 받습니다.</li><li><code>auto it = expected.find(name); if (it != expected.end()) …</code> — <code>map</code> 에서 키가 있는지 확인하는 표준 방법. <code>expected[name]</code> 으로 읽으면 없는 키가 <b>0 으로 새로 생겨</b> 판정이 틀어집니다.</li><li><code>for (const ColorSpec&amp; spec : specs)</code> — 구조체를 복사하지 않고 참조로 반복.</li></ul>' },
      { type: 'h', text: '격자 ROI 검사: 자리마다 따로 판정' },
      { type: 'p', html: '포장 · 트레이 · 커넥터처럼 <b>부품 자리가 격자로 정해져 있으면</b> 전체를 한 번에 처리하는 대신 <b>자리마다 ROI 를 잘라</b> 판정하는 것이 훨씬 쉽고 정확합니다. 장점: ① 어느 자리가 불량인지 바로 알 수 있다 ② 옆 자리의 영향을 받지 않는다 ③ 판정 규칙이 단순해진다(그 ROI 안의 픽셀 수만 보면 된다).' },
      { type: 'figure', html: FIG_POCKET, caption: '그림 6. 블리스터 2×5 포켓 격자와 정답 — (0,3) 빈 포켓 · (1,1) 깨짐 · (1,4) 색 불량' },
      { type: 'code', title: '예제 3: 블리스터 포장 검사 (빈 포켓 · 깨짐 · 색 불량)', code: EX_BLISTER,
        desc: '<code>hsv(roi)</code> 는 <b>픽셀을 복사하지 않고</b> 원본의 일부를 가리키는 “창”(ROI)입니다 — 빠르고 메모리도 쓰지 않습니다(03차시). 판정 순서가 중요합니다: <b>① 빈 포켓 → ② 색 불량 → ③ 깨짐</b>. 순서를 바꿔 “흰 픽셀이 적으면 깨짐” 을 먼저 보면 <b>빈 포켓과 색 불량이 모두 “깨짐” 으로</b> 오판정됩니다. 정상 알약 면적 약 2400 의 80% 인 1920 이 깨짐 기준이고, (1,1)은 1389 로 걸립니다.',
        expect: '행 열  흰픽셀 주황픽셀  판정\n 0  0    2407       0   OK\n 0  1    2403       0   OK\n 0  2    2421       0   OK\n 0  3      51       0   NG 빈 포켓\n 0  4    2406       0   OK\n 1  0    2392       0   OK\n 1  1    1389       0   NG 깨짐\n 1  2    2401       0   OK\n 1  3    2401       0   OK\n 1  4      72    2301   NG 색 불량\n불량 3개 -> 전체 판정 NG' },
      { type: 'callout', kind: 'tip', title: '판정 규칙을 만드는 순서', html: '<ol><li><b>양품 샘플로 기준값을 측정</b>한다 (정상 알약의 흰 픽셀 ≈ 2400).</li><li><b>불량 종류를 나열</b>하고 각각이 어떤 값에서 달라지는지 본다 (빈 포켓 51 · 깨짐 1389 · 색 불량 흰 72 + 주황 2301).</li><li><b>가장 확실하게 구분되는 것부터</b> 판정한다 (빈 포켓 → 색 → 크기).</li><li>임계값은 정상값과 불량값의 <b>중간</b>에 두고 여유(마진)를 기록한다 (1920 은 2400 과 1389 사이).</li></ol>' },
      { type: 'h', text: '병 라인: 캡 유무 · 기울기 · 액면 높이' },
      { type: 'p', html: '한 제품에 <b>여러 검사 항목</b>이 있는 전형적인 예입니다. <code>bottle_line.png</code> 의 병 5개에 대해 ① 캡(빨강)이 있는가 ② 캡이 기울지 않았는가 ③ 액면 높이가 기준(y = 170 ± 8)인가를 봅니다. 액면은 <b>세로 프로파일</b>(한 열의 밝기를 위에서 아래로 훑기)로 찾습니다 — 공기(밝음 ≈210)에서 액체(어두움 ≈105)로 <b>처음 떨어지는 y</b> 가 액면입니다.' },
      { type: 'code', title: '예제 4: 세로 프로파일로 액면 찾기', code: EX_PROFILE,
        desc: '병 0(정상)은 y=170 에서, 병 1(과소 충전)은 y=215 에서 밝기가 떨어집니다. 임계값 130 은 공기 210 과 액체 105 사이에 두었습니다. <code>gray.at&lt;uchar&gt;(y, x)</code> 는 <code>uchar</code> 이므로 <code>(int)</code> 로 바꿔 출력합니다. 더 정밀하게 하려면 <b>서브픽셀 보간</b>(두 픽셀 사이를 선형 보간해 밝기 50% 지점 찾기)으로 0.1 px 단위까지 잽니다. 오른쪽 그래프 창은 x=200 열의 프로파일입니다(빨간 선 = 임계값 130).',
        expect: 'x = 80 열의 밝기 (y = 140 ~ 230, 10 픽셀 간격)\n  208 207 207 127 101 102 102 101 101 102\n  액면 y = 170 (기준 170 ± 8)\nx = 200 열의 밝기 (y = 140 ~ 230, 10 픽셀 간격)\n  214 216 214 215 215 215 215 215 104 105\n  액면 y = 215 (기준 170 ± 8)' },
      { type: 'code', title: '예제 5: 병 5개 종합 판정 (캡 + 액면)', code: EX_BOTTLE,
        desc: '캡 기울기는 빨간 마스크의 <code>minAreaRect(...).angle</code> 로 구합니다. <code>RotatedRect::angle</code> 의 범위는 OpenCV 버전에 따라 [−90, 0) 또는 (0, 90] 이므로 <b>−45~+45 로 정규화</b>해야 “0도 = 똑바로” 가 됩니다(부호는 버전에 따라 반대일 수 있어 판정은 <code>abs</code> 로). <code>Mat red = m1 | m2;</code> 로 빨강 두 구간을 합쳤습니다. 항목별로 판정한 뒤 <b>모두 정상일 때만 OK</b>(AND). 결과는 IMAGES.md 정답과 일치합니다: 병 0 OK, 1 과소 충전, 2 캡 누락, 3 과다 충전, 4 캡 12° 기울어짐.',
        expect: '병 0: 캡 빨강 1617px, 기울기   0.0도 -> 캡 정상 / 액면 y=170 -> 액면 정상 => OK\n병 1: 캡 빨강 1616px, 기울기   0.0도 -> 캡 정상 / 액면 y=215 -> 과소 충전 => NG\n병 2: 캡 빨강    0px, 기울기   0.0도 -> 캡 없음 / 액면 y=172 -> 액면 정상 => NG\n병 3: 캡 빨강 1617px, 기울기   0.0도 -> 캡 정상 / 액면 y=151 -> 과다 충전 => NG\n병 4: 캡 빨강 1566px, 기울기 -12.1도 -> 캡 기울어짐 / 액면 y=169 -> 액면 정상 => NG\n불량 4 / 5 -> 라인 판정 NG' },
      { type: 'table', head: ['검사', '측정값', '판정 규칙', '정답'], rows: [
        ['색별 개수 (color_caps)', 'HSV inRange 마스크의 윤곽 수 (면적 ≥ 400)', '색마다 기대 개수와 일치해야 OK', 'red 5 · green 4 · blue 3 · yellow 6 · white 2'],
        ['빈 포켓 (blister)', 'ROI 의 흰 픽셀 수 + 주황 픽셀 수', '둘 다 500 미만 → 빈 포켓', '(0, 3)'],
        ['색 불량 (blister)', '주황 픽셀 수 vs 흰 픽셀 수', '주황이 더 많으면 색 불량', '(1, 4)'],
        ['깨짐 (blister)', 'ROI 의 흰 픽셀 수', '정상(2400)의 80% 미만 → 깨짐', '(1, 1) — 1389'],
        ['캡 유무 (bottle)', '캡 ROI 의 빨강 픽셀 수', '300 미만 → 캡 없음', '병 2'],
        ['캡 기울기 (bottle)', 'minAreaRect 각도 (−45~+45 정규화)', '|각도| &gt; 5도 → 기울어짐', '병 4 (12도)'],
        ['액면 높이 (bottle)', '중심 열에서 밝기 &lt; 130 이 되는 첫 y', '162 미만 과다 · 178 초과 과소', '병 3 과다(151) · 병 1 과소(215)']
      ], caption: '표 2. 2교시 색 검사의 측정값 · 판정 규칙 · 정답' },
      { type: 'callout', kind: 'field', title: '🏭 현장에서는', html: '<ul><li><b>색은 조명에 가장 민감한 검사</b>입니다. 백색 LED 도 시간이 지나면 색온도가 변하므로, 화면 안에 <b>기준 색 패치</b>를 함께 찍어 화이트밸런스를 보정하는 경우가 많습니다(<code>color_chart.png</code>).</li><li>HSV 대신 <b>Lab 색공간</b>과 ΔE(색 차이)를 쓰면 “사람이 느끼는 색 차이” 에 더 가깝게 판정할 수 있습니다.</li><li>격자 좌표는 <b>하드코딩하지 말고</b> 정렬 마크(14차시 템플릿 매칭)로 매번 찾아 보정합니다 — 제품이 조금 밀려 놓이면 ROI 가 전부 어긋납니다.</li></ul>' },
      { type: 'project', title: '완성 프로젝트의 ColorSortInspector', project: 'Ch17_Inspection', html: '<code>Inspectors/ColorSortInspector.h/.cpp</code> 는 예제 2 와 같은 코드를 선언 / 구현으로 나눈 것입니다. 색 목록은 <b>생성자</b>에서 채우고, <code>main.cpp</code> 는 <code>capsPtr-&gt;expected = { {"red", 5}, … }</code> 로 기대 개수만 설정합니다. 흑백 이미지가 들어오면 <code>std::invalid_argument("색 분류에는 컬러 이미지가 필요합니다")</code> 를 던집니다. 확장 과제: 예제 3 의 블리스터 검사를 <code>BlisterInspector</code> 클래스로 만들어 <code>jobs</code> 에 추가해 보세요 (3교시 실습).' }
    ],
    practice: [
      {
        title: '노란 뚜껑만 찾아 좌표 출력하기', level: 1,
        desc: '<code>images/color_caps.png</code> 에서 <b>노란 뚜껑(H 20~35)</b>만 찾아 개수와 각 중심 좌표 · 면적을 출력하세요. 정답은 6개입니다. 그다음 H 상한을 35 → 45 로 넓혀도 개수가 그대로인지 확인하고, 왜 안전한지 생각해 보세요.',
        hint: '<code>inRange(hsv, Scalar(20, 90, 60), Scalar(hiH, 255, 255), mask)</code> → 열기 → <code>connectedComponentsWithStats</code> → 면적 600 이상. 중심은 <code>cents.at&lt;double&gt;(i, 0)</code>, <code>(i, 1)</code>. 초록의 H 는 63 이라 45 와 충분히 떨어져 있습니다.',
        expect: '  #1 중심 (521, 168) 면적 2624\n  #2 중심 (70, 196) 면적 2630\n  #3 중심 (584, 196) 면적 2619\n  #4 중심 (198, 247) 면적 2622\n  #5 중심 (89, 363) 면적 2631\n  #6 중심 (588, 419) 면적 2617\nH 20~35: 노란 뚜껑 6개 (기대 6)\nH 20~45: 6개 — 초록(H=63)과 충분히 떨어져 있어 변화 없음',
        starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

// H 범위 [20, hiH] 의 노란 뚜껑 개수 (print 가 true 면 좌표도 출력)
int countYellow(const Mat& hsv, int hiH, bool print)
{
    Mat mask, labels, stats, cents;
    inRange(hsv, Scalar(20, 90, 60), Scalar(hiH, 255, 255), mask);
    morphologyEx(mask, mask, MORPH_OPEN, getStructuringElement(MORPH_ELLIPSE, Size(7, 7)));
    int n = connectedComponentsWithStats(mask, labels, stats, cents);
    int count = 0;
    // TODO: 면적 600 이상인 성분만 세고, print 가 true 면 중심 좌표 · 면적을 출력하세요
    return count;
}

int main()
{
    Mat src = imread("images/color_caps.png", IMREAD_COLOR);
    Mat hsv;
    cvtColor(src, hsv, COLOR_BGR2HSV);

    int c1 = countYellow(hsv, 35, true);
    cout << "H 20~35: 노란 뚜껑 " << c1 << "개 (기대 6)" << endl;
    // TODO: H 상한을 45 로 넓혀 다시 세어 보세요
    imshow("caps", src);
    waitKey(0);
    return 0;
}`,
        solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

// H 범위 [20, hiH] 의 노란 뚜껑 개수 (print 가 true 면 좌표도 출력)
int countYellow(const Mat& hsv, int hiH, bool print)
{
    Mat mask, labels, stats, cents;
    inRange(hsv, Scalar(20, 90, 60), Scalar(hiH, 255, 255), mask);
    morphologyEx(mask, mask, MORPH_OPEN, getStructuringElement(MORPH_ELLIPSE, Size(7, 7)));
    int n = connectedComponentsWithStats(mask, labels, stats, cents);
    int count = 0;
    for (int i = 1; i < n; i++)
    {
        if (stats.at<int>(i, CC_STAT_AREA) < 600) continue;
        count++;
        if (print)
            cout << format("  #%d 중심 (%.0f, %.0f) 면적 %d", count, cents.at<double>(i, 0), cents.at<double>(i, 1),
                           stats.at<int>(i, CC_STAT_AREA)) << endl;
    }
    return count;
}

int main()
{
    Mat src = imread("images/color_caps.png", IMREAD_COLOR);
    Mat hsv;
    cvtColor(src, hsv, COLOR_BGR2HSV);

    int c1 = countYellow(hsv, 35, true);
    cout << "H 20~35: 노란 뚜껑 " << c1 << "개 (기대 6)" << endl;
    int c2 = countYellow(hsv, 45, false);
    cout << "H 20~45: " << c2 << "개 — 초록(H=63)과 충분히 떨어져 있어 변화 없음" << endl;
    imshow("caps", src);
    waitKey(0);
    return 0;
}`
      },
      {
        title: '블리스터 판정 임계값 맞추기', level: 2,
        desc: '블리스터 검사의 임계값 두 개(<code>EMPTY_LIMIT</code> · <code>BROKEN_RATIO</code>)를 조정해 <b>정답 3개</b>((0,3) 빈 포켓 · (1,1) 깨짐 · (1,4) 색 불량)만 NG 가 되게 만드세요. starter 는 기준이 너무 커서 <b>정상 포켓까지 NG</b>(10개)로 판정합니다. 먼저 실행해 측정값을 보고, 정상값과 불량값의 <b>중간</b>에 임계값을 두세요.',
        hint: '정상 포켓의 흰 픽셀은 약 2392~2421, (1,1) 은 1389, 빈 포켓은 51, 색 불량은 흰 72 · 주황 2301. <code>EMPTY_LIMIT = 500</code>, <code>BROKEN_RATIO = 0.8</code>(기준 1920) 이면 정답만 걸립니다.',
        expect: '(0,0) 흰  2407 주황     0 -> OK\n(0,1) 흰  2403 주황     0 -> OK\n(0,2) 흰  2421 주황     0 -> OK\n(0,3) 흰    51 주황     0 -> NG 빈 포켓\n(0,4) 흰  2406 주황     0 -> OK\n(1,0) 흰  2392 주황     0 -> OK\n(1,1) 흰  1389 주황     0 -> NG 깨짐\n(1,2) 흰  2401 주황     0 -> OK\n(1,3) 흰  2401 주황     0 -> OK\n(1,4) 흰    72 주황  2301 -> NG 색 불량\nNG 3개 (정답은 3개)',
        starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

const int NORMAL_PILL = 2400;
const int EMPTY_LIMIT = 1500;         // TODO: 너무 큽니다 — 빈 포켓만 걸리게 줄이세요
const double BROKEN_RATIO = 1.05;     // TODO: 너무 큽니다 — 정상 알약까지 깨짐으로 보고 있습니다

int main()
{
    Mat src = imread("images/blister_pack.png", IMREAD_COLOR);
    Mat hsv;
    cvtColor(src, hsv, COLOR_BGR2HSV);

    int ng = 0;
    for (int r = 0; r < 2; r++)
        for (int c = 0; c < 5; c++)
        {
            Mat sub = hsv(Rect(120 + 100 * c - 38, 170 + 140 * r - 38, 76, 76));
            Mat white, orange;
            inRange(sub, Scalar(0, 0, 150), Scalar(179, 70, 255), white);
            inRange(sub, Scalar(5, 90, 90), Scalar(25, 255, 255), orange);
            int wa = countNonZero(white), oa = countNonZero(orange);

            string judge;
            if (wa < EMPTY_LIMIT && oa < EMPTY_LIMIT)  judge = "NG 빈 포켓";
            else if (oa > wa)                          judge = "NG 색 불량";
            else if (wa < NORMAL_PILL * BROKEN_RATIO)  judge = "NG 깨짐";
            else                                       judge = "OK";
            if (judge != "OK") ng++;
            cout << format("(%d,%d) 흰 %5d 주황 %5d -> ", r, c, wa, oa) << judge << endl;
        }
    cout << "NG " << ng << "개 (정답은 3개)" << endl;
    return 0;
}`,
        solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

const int NORMAL_PILL = 2400;
const int EMPTY_LIMIT = 500;          // 빈 포켓(51) 과 깨짐(1389) 사이
const double BROKEN_RATIO = 0.8;      // 기준 1920: 정상(2390~) 통과, 깨짐(1389) 만 NG

int main()
{
    Mat src = imread("images/blister_pack.png", IMREAD_COLOR);
    Mat hsv;
    cvtColor(src, hsv, COLOR_BGR2HSV);

    int ng = 0;
    for (int r = 0; r < 2; r++)
        for (int c = 0; c < 5; c++)
        {
            Mat sub = hsv(Rect(120 + 100 * c - 38, 170 + 140 * r - 38, 76, 76));
            Mat white, orange;
            inRange(sub, Scalar(0, 0, 150), Scalar(179, 70, 255), white);
            inRange(sub, Scalar(5, 90, 90), Scalar(25, 255, 255), orange);
            int wa = countNonZero(white), oa = countNonZero(orange);

            string judge;
            if (wa < EMPTY_LIMIT && oa < EMPTY_LIMIT)  judge = "NG 빈 포켓";
            else if (oa > wa)                          judge = "NG 색 불량";
            else if (wa < NORMAL_PILL * BROKEN_RATIO)  judge = "NG 깨짐";
            else                                       judge = "OK";
            if (judge != "OK") ng++;
            cout << format("(%d,%d) 흰 %5d 주황 %5d -> ", r, c, wa, oa) << judge << endl;
        }
    cout << "NG " << ng << "개 (정답은 3개)" << endl;
    return 0;
}`
      }
    ],
    quiz: [
      { q: '색 검사에서 BGR 대신 HSV 를 쓰는 주된 이유는?', options: ['HSV 가 계산이 빨라서', '밝기가 바뀌어도 <b>H(색상)</b>은 거의 그대로여서 조명 변화에 튼튼하기 때문', 'HSV 가 채널이 적어서', 'OpenCV 가 BGR 을 지원하지 않아서'], answer: 1,
        explain: '조명이 밝아지면 BGR 세 값이 모두 커지지만 HSV 에서는 주로 <b>V</b> 만 커집니다. 그래서 H 범위로 색을 고르면 그늘/하이라이트에서도 같은 색으로 잡힙니다.' },
      { q: '빨강을 <code>inRange</code> 로 잡을 때 두 번 호출해 합치는 이유는?', options: ['빨강이 두 가지 밝기를 갖기 때문', '색상환이 원형이라 빨강이 <b>H 0~8 과 170~179</b> 로 나뉘기 때문', '빨강이 채도가 높아서', '빨강만 3채널이기 때문'], answer: 1,
        explain: 'OpenCV 의 H 는 0~179 로 접혀 있어 빨강이 양 끝에 걸칩니다. <code>inRange</code> 두 번 + <code>mask1 | mask2</code> 로 합칩니다.' },
      { q: '<b>흰색</b> 뚜껑을 판정하는 올바른 방법은?', options: ['H 를 0~5 로 좁게 잡는다', 'H 는 0~179 전체로 두고 <b>S 를 낮게, V 를 높게</b> 잡는다', 'V 를 0~50 으로 잡는다', 'BGR 에서 B 가 가장 큰 픽셀을 찾는다'], answer: 1,
        explain: '무채색은 H 가 잡음에 따라 아무 값이나 나옵니다. <code>color_caps.png</code> 의 흰 뚜껑은 S 가 2~4 로 아주 낮습니다(예제 1). 검정은 V 가 낮은 것으로 판정합니다.' },
      { q: '<code>ColorSortInspector</code> 에서 색 정의를 <code>vector&lt;ColorSpec&gt;</code> 데이터로 분리한 이점은?', options: ['실행 속도가 빨라진다', '색을 추가 · 수정할 때 <b>inspect 코드를 고치지 않고</b> 데이터만 바꾸면 된다', '메모리를 덜 쓴다', 'HSV 변환이 필요 없어진다'], answer: 1,
        explain: '처리 로직과 설정(데이터)을 분리하면 제품이 바뀌어도 코드를 다시 컴파일하지 않고 레시피만 바꿔 쓸 수 있습니다. 예제 2 의 두 번째 줄처럼 <code>specs[4].lo</code> 한 칸만 바꿔도 판정이 달라집니다.' },
      { q: '블리스터 판정에서 <b>빈 포켓 → 색 불량 → 깨짐</b> 순서로 검사하는 이유는?', options: ['코드가 짧아져서', '순서를 바꾸면 빈 포켓과 색 불량이 “흰 픽셀이 적다” 는 이유로 <b>깨짐으로 오판정</b>되기 때문', '깨짐이 가장 드물어서', 'ROI 크기 때문에'], answer: 1,
        explain: '판정 규칙은 <b>가장 확실하게 구분되는 것부터</b> 적용합니다. 빈 포켓(흰 51)과 색 불량(흰 72)은 모두 흰 픽셀이 적으므로 깨짐 조건을 먼저 보면 셋 다 “깨짐” 이 됩니다.' }
    ],
    slides: [
      { layout: 'title', title: '색 분류 검사', subtitle: '2교시 — HSV · ColorSortInspector · 격자 ROI · 병 라인', notes: '<p>💬 “빨간 뚜껑을 찾으려면 BGR 에서 R 값이 크면 될까요?” 로 시작합니다 — 주황도, 분홍도, 밝은 회색도 R 이 큽니다. 색을 “값의 크기” 가 아니라 <b>색상(Hue)</b> 으로 봐야 한다는 점으로 이어집니다. (3분)</p>' },
      { layout: 'diagram', title: 'HSV: 색상 H 는 0~179', html: FIG_HSV, caption: '빨강은 두 구간, 흰색 · 검정은 S · V 로 판정', notes: '<p>05차시 복습입니다. H 가 0~359 가 아니라 <b>0~179</b> 인 이유(8bit 에 담기 위해 절반으로)를 짚어 주세요. 빨강 두 구간과 무채색 문제는 실무에서 가장 많이 실수하는 부분입니다. (5분)</p>' },
      { layout: 'code', title: '색 범위는 픽셀 값을 읽어서 정한다', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat src = imread("images/color_caps.png", IMREAD_COLOR);
    Mat hsv;
    cvtColor(src, hsv, COLOR_BGR2HSV);

    Point pts[] = { {111, 122}, {521, 167}, {582, 70} };   // 초록 · 노랑 · 흰색 뚜껑 중심
    for (Point p : pts)
    {
        Vec3b b = src.at<Vec3b>(p.y, p.x);                  // (행, 열)!
        Vec3b h = hsv.at<Vec3b>(p.y, p.x);
        cout << "BGR(" << (int)b[0] << "," << (int)b[1] << "," << (int)b[2] << ") -> H="
             << (int)h[0] << " S=" << (int)h[1] << " V=" << (int)h[2] << endl;
    }
    return 0;
}`, points: ['초록 H≈63 · 노랑 H≈25', '흰색 <b>S≈2</b> → H 가 아니라 S · V 로', '<code>uchar</code> 출력은 <code>(int)</code>'], notes: '<p>실행하고 결과 창에서 마우스로 다른 뚜껑의 BGR 값도 확인하게 합니다. 💬 “흰색의 H=105 는 믿을 수 있나?” — 아니다, S 가 2 라서 H 는 잡음. (4분)</p>' },
      { layout: 'code', title: 'ColorSpec — 색 정의는 데이터', file: 'ColorSortInspector.h', run: false, code: `struct ColorSpec
{
    std::string name;
    cv::Scalar lo, hi;          // HSV 하한 · 상한
    cv::Scalar lo2, hi2;        // 두 번째 범위 (없으면 hi2[0] < 0)
    cv::Scalar draw;            // 오버레이 색 (BGR)
};

std::vector<ColorSpec> specs = {
    { "red",    { 0, 90, 60}, {  8, 255, 255}, {170, 90, 60}, {179, 255, 255}, {0, 0, 255} },
    { "yellow", {18, 90, 60}, { 35, 255, 255}, {0, 0, 0}, {-1, 0, 0},   {0, 255, 255} },
    { "white",  { 0,  0, 170}, {179, 60, 255}, {0, 0, 0}, {-1, 0, 0},   {255, 255, 255} },
    // … green · blue
};
std::map<std::string, int> expected;   // {"red", 5}, …`, points: ['색 추가 = 목록에 한 줄 (inspect 는 그대로)', '빨강만 두 번째 범위 사용', '<code>map</code> 으로 색별 기대 개수'], notes: '<p>16차시 팩토리의 “이름 → 필터” 표와 같은 발상이라고 연결합니다. 💬 “이 목록을 파일에서 읽으려면?” — <code>ifstream</code> 으로 한 줄씩 읽어 <code>ColorSpec</code> 을 만든다(레시피 파일). (4분)</p>' },
      { layout: 'code', title: 'inspect — 색마다 같은 처리 반복', file: 'ColorSortInspector.h', run: false, code: `for (const ColorSpec& spec : specs)
{
    Mat mask, mask2;
    inRange(hsv, spec.lo, spec.hi, mask);
    if (spec.hi2[0] >= 0)                       // 빨강: 두 범위 OR
    {
        inRange(hsv, spec.lo2, spec.hi2, mask2);
        mask |= mask2;
    }
    morphologyEx(mask, mask, MORPH_OPEN, kernel);    // 잡점 제거
    morphologyEx(mask, mask, MORPH_CLOSE, kernel);   // 톱니 구멍 메우기

    std::vector<std::vector<Point>> contours;
    findContours(mask, contours, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    int count = 0;
    for (const auto& c : contours)
        if (contourArea(c) >= minArea) count++;
    r.values.push_back({ spec.name, (double)count });
    auto it = expected.find(spec.name);
    if (it != expected.end() && it->second != count) r.ok = false;
}`, points: ['결과: red 5 · yellow 6 · green 4 · blue 3 · white 2 → <b>OK</b>', '열기 + 닫기 + 면적 = 이중 방어', '<code>find</code> 로 확인 (<code>[]</code> 는 키를 새로 만든다!)'], notes: '<p>학생들이 예제 2 를 실행합니다. 두 번째 줄(흰색 V ≥ 240 → white 0 → NG)을 보고 “데이터 한 칸이 판정을 바꾼다” 를 확인합니다. <code>expected[name]</code> 을 쓰면 안 되는 이유를 꼭 짚으세요. (6분)</p>' },
      { layout: 'image', title: 'color_caps.png — 5색 뚜껑 20개', src: 'images/color_caps.png', caption: '어두운 컨베이어 위 병뚜껑 20개. 가장자리 톱니 무늬와 하이라이트가 있다', notes: '<p>뚜껑 가장자리의 톱니 무늬와 반사 하이라이트를 확대해 보여 주고 “왜 열기 · 닫기가 필요한가” 를 눈으로 확인시킵니다. (2분)</p>' },
      { layout: 'diagram', title: '격자 ROI 검사', html: FIG_POCKET, caption: '자리마다 ROI 를 잘라 판정 → 어느 자리가 불량인지 바로 알 수 있다', notes: '<p>격자 좌표 공식을 칠판에 적고 (1,4) 포켓의 중심을 함께 계산해 봅니다: x = 120 + 400 = 520, y = 170 + 140 = 310. 💬 “전체를 한 번에 처리하면 무엇이 어려울까?” — 어느 포켓인지 다시 계산해야 하고, 옆 알약이 붙어 보일 수 있다. (4분)</p>' },
      { layout: 'code', title: '포켓마다 ROI 를 잘라 판정', run: false, code: `for (int r = 0; r < 2; r++)
    for (int c = 0; c < 5; c++)
    {
        Point center(120 + 100 * c, 170 + 140 * r);
        Rect roi(center.x - 38, center.y - 38, 76, 76);
        Mat sub = hsv(roi);                       // 복사 없는 "창"

        Mat white, orange;
        inRange(sub, Scalar(0, 0, 150), Scalar(179, 70, 255), white);
        inRange(sub, Scalar(5, 90, 90), Scalar(25, 255, 255), orange);
        int wa = countNonZero(white), oa = countNonZero(orange);

        string judge;                             // 가장 확실한 것부터!
        if (wa < 500 && oa < 500)        judge = "NG 빈 포켓";
        else if (oa > wa)                judge = "NG 색 불량";
        else if (wa < NORMAL_PILL * 0.8) judge = "NG 깨짐";
        else                             judge = "OK";
    }`, points: ['<code>hsv(roi)</code>: 복사 없음 (03차시 ROI)', '판정 순서: 빈 → 색 → 깨짐', '정답 (0,3) · (1,1) · (1,4)'], notes: '<p>판정 순서를 바꾸면(깨짐을 먼저) 결과가 어떻게 되는지 학생들에게 예측하게 한 뒤 실제로 바꿔 실행해 봅니다 — 빈 포켓 · 색 불량이 “깨짐” 으로 나옵니다. (6분)</p>' },
      { layout: 'table', title: '판정 규칙 정리', head: ['검사', '측정값', '규칙', '정답'], rows: [
        ['색별 개수', 'inRange 윤곽 수', '기대와 일치', 'R5 · G4 · B3 · Y6 · W2'],
        ['빈 포켓', '흰 + 주황 픽셀', '둘 다 &lt; 500', '(0,3)'],
        ['색 불량', '주황 vs 흰', '주황 &gt; 흰', '(1,4)'],
        ['깨짐', '흰 픽셀', '&lt; 2400 × 0.8', '(1,1)'],
        ['캡', '빨강 픽셀 · 각도', '&lt; 300 없음 · |각| &gt; 5° 기울어짐', '병 2 · 병 4'],
        ['액면', '밝기 &lt; 130 첫 y', '162~178', '병 1 과소 · 병 3 과다']
      ], notes: '<p>병 라인 예제 4 · 5 를 실행하고 이 표로 정리합니다. 여러 항목은 <b>각각 판정한 뒤 AND</b> 로 최종 OK. minAreaRect 각도의 범위가 버전마다 다르다는 점(정규화 필요)도 짚어 주세요. (6분)</p>' },
      { layout: 'quiz', title: '확인 퀴즈', q: '흰색 뚜껑을 판정하는 올바른 HSV 조건은?', options: ['H 0~5', 'H 전체 + <b>S 낮음 + V 높음</b>', 'V 0~50', 'H 95~130'], answer: 1, explain: '무채색은 H 가 무의미. 흰색은 S 가 낮고 V 가 높다(예제 1: S 2~4, V 214~227).', notes: '<p>정답 2번. 이어서 “검정 뚜껑이면?” — V 가 낮다(S 는 상관없음). (2분)</p>' },
      { layout: 'practice', title: '실습: 블리스터 임계값 맞추기', desc: '<p>임계값을 조정해 <b>정답 3개</b>만 NG 가 되게 하세요.</p><ul><li>starter 는 정상 포켓까지 NG (10개)</li><li>먼저 실행해 측정값을 보고 결정</li><li>임계값은 정상값과 불량값의 <b>중간</b>에</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

const int NORMAL_PILL = 2400;
const int EMPTY_LIMIT = 1500;         // TODO: 너무 큽니다 — 빈 포켓만 걸리게 줄이세요
const double BROKEN_RATIO = 1.05;     // TODO: 너무 큽니다 — 정상 알약까지 깨짐으로 보고 있습니다

int main()
{
    Mat src = imread("images/blister_pack.png", IMREAD_COLOR);
    Mat hsv;
    cvtColor(src, hsv, COLOR_BGR2HSV);

    int ng = 0;
    for (int r = 0; r < 2; r++)
        for (int c = 0; c < 5; c++)
        {
            Mat sub = hsv(Rect(120 + 100 * c - 38, 170 + 140 * r - 38, 76, 76));
            Mat white, orange;
            inRange(sub, Scalar(0, 0, 150), Scalar(179, 70, 255), white);
            inRange(sub, Scalar(5, 90, 90), Scalar(25, 255, 255), orange);
            int wa = countNonZero(white), oa = countNonZero(orange);

            string judge;
            if (wa < EMPTY_LIMIT && oa < EMPTY_LIMIT)  judge = "NG 빈 포켓";
            else if (oa > wa)                          judge = "NG 색 불량";
            else if (wa < NORMAL_PILL * BROKEN_RATIO)  judge = "NG 깨짐";
            else                                       judge = "OK";
            if (judge != "OK") ng++;
            cout << format("(%d,%d) 흰 %5d 주황 %5d -> ", r, c, wa, oa) << judge << endl;
        }
    cout << "NG " << ng << "개 (정답은 3개)" << endl;
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

const int NORMAL_PILL = 2400;
const int EMPTY_LIMIT = 500;          // 빈 포켓(51) 과 깨짐(1389) 사이
const double BROKEN_RATIO = 0.8;      // 기준 1920: 정상(2390~) 통과, 깨짐(1389) 만 NG

int main()
{
    Mat src = imread("images/blister_pack.png", IMREAD_COLOR);
    Mat hsv;
    cvtColor(src, hsv, COLOR_BGR2HSV);

    int ng = 0;
    for (int r = 0; r < 2; r++)
        for (int c = 0; c < 5; c++)
        {
            Mat sub = hsv(Rect(120 + 100 * c - 38, 170 + 140 * r - 38, 76, 76));
            Mat white, orange;
            inRange(sub, Scalar(0, 0, 150), Scalar(179, 70, 255), white);
            inRange(sub, Scalar(5, 90, 90), Scalar(25, 255, 255), orange);
            int wa = countNonZero(white), oa = countNonZero(orange);

            string judge;
            if (wa < EMPTY_LIMIT && oa < EMPTY_LIMIT)  judge = "NG 빈 포켓";
            else if (oa > wa)                          judge = "NG 색 불량";
            else if (wa < NORMAL_PILL * BROKEN_RATIO)  judge = "NG 깨짐";
            else                                       judge = "OK";
            if (judge != "OK") ng++;
            cout << format("(%d,%d) 흰 %5d 주황 %5d -> ", r, c, wa, oa) << judge << endl;
        }
    cout << "NG " << ng << "개 (정답은 3개)" << endl;
    return 0;
}`, notes: '<p>학생마다 다른 임계값(예: 600, 0.7)을 골라도 정답이 나올 수 있습니다 — 여러 답을 모아 “마진이 가장 큰 값은?” 을 토론하면 좋습니다(빈 포켓 51 ~ 깨짐 1389 사이 → 500~1000, 깨짐 1389 ~ 정상 2392 사이 → 비율 0.6~0.99). (8분)</p>' },
      { layout: 'summary', title: '2교시 정리', bullets: [
        '색 검사는 <b>cvtColor(BGR2HSV) → inRange</b> — 조명 변화에 튼튼',
        '빨강은 <b>두 구간 + OR</b>, 무채색은 <b>S · V</b> 로 판정',
        '색 정의는 <b>데이터</b>(<code>vector&lt;ColorSpec&gt;</code>) — 검사 코드는 그대로',
        '자리가 정해져 있으면 <b>격자 ROI</b> 로 자리마다 판정 · 규칙은 가장 확실한 것부터',
        '여러 항목(캡 · 액면)은 각각 판정한 뒤 <b>AND</b>',
        '다음 시간: 골든 이미지와 비교해 <b>예상 못한 결함</b> 찾기 + 일괄 검사 · 리포트'
      ], notes: '<p>지금까지는 “무엇을 찾을지 알고 있는” 검사였다는 점을 짚고, 다음 시간은 “무엇이 잘못됐는지 모를 때” 쓰는 골든 비교와, 세 검사기를 한 프로그램으로 묶는 일괄 검사라고 예고합니다. (2분)</p>' }
    ]
  };

  // ───────────────────────────── 3교시 ─────────────────────────────

  // 그림 7: 골든 이미지 비교 파이프라인
  const FIG_GOLDEN = `<svg viewBox="0 0 760 330" role="img" aria-label="골든 이미지와 검사 이미지의 차영상으로 결함을 찾는 파이프라인">
  ${ARROW('c17a4')}
  <rect x="20" y="30" width="150" height="50" rx="10" class="p1s"/>
  <text x="95" y="52" text-anchor="middle" class="tx-b">골든(양품 기준)</text>
  <text x="95" y="70" text-anchor="middle" class="tx-m">metal_ok.png</text>
  <rect x="20" y="96" width="150" height="50" rx="10" class="p1s"/>
  <text x="95" y="118" text-anchor="middle" class="tx-b">검사 영상</text>
  <text x="95" y="136" text-anchor="middle" class="tx-m">metal_scratch.png</text>
  <rect x="212" y="58" width="130" height="60" rx="10" class="p2s"/>
  <text x="277" y="82" text-anchor="middle" class="tx-b">absdiff</text>
  <text x="277" y="102" text-anchor="middle" class="tx-m">|골든 − 검사|</text>
  <rect x="384" y="58" width="140" height="60" rx="10" class="p2s"/>
  <text x="454" y="78" text-anchor="middle" class="tx-b">GaussianBlur</text>
  <text x="454" y="96" text-anchor="middle" class="tx-m">잡음 평탄화</text>
  <text x="454" y="112" text-anchor="middle" class="tx-m">5×5</text>
  <rect x="566" y="58" width="176" height="60" rx="10" class="p3s"/>
  <text x="654" y="78" text-anchor="middle" class="tx-b">threshold</text>
  <text x="654" y="96" text-anchor="middle" class="tx-m">차이 &gt; 10 만 남긴다</text>
  <text x="654" y="112" text-anchor="middle" class="tx-m">(결함 대비가 약하다!)</text>
  <line x1="172" y1="60" x2="208" y2="78" class="ln" stroke-width="2" marker-end="url(#c17a4)"/>
  <line x1="172" y1="126" x2="208" y2="102" class="ln" stroke-width="2" marker-end="url(#c17a4)"/>
  <line x1="344" y1="88" x2="380" y2="88" class="ln" stroke-width="2" marker-end="url(#c17a4)"/>
  <line x1="526" y1="88" x2="562" y2="88" class="ln" stroke-width="2" marker-end="url(#c17a4)"/>
  <rect x="120" y="170" width="180" height="62" rx="10" class="p4s"/>
  <text x="210" y="192" text-anchor="middle" class="tx-b">MORPH_CLOSE</text>
  <text x="210" y="210" text-anchor="middle" class="tx-m">끊긴 긁힘을 이어 붙인다</text>
  <text x="210" y="226" text-anchor="middle" class="tx-m">타원 커널 21×21</text>
  <rect x="336" y="170" width="170" height="62" rx="10" class="p5s"/>
  <text x="421" y="192" text-anchor="middle" class="tx-b">findContours</text>
  <text x="421" y="210" text-anchor="middle" class="tx-m">면적 ≥ 80 만 결함</text>
  <text x="421" y="226" text-anchor="middle" class="tx-m">boundingRect</text>
  <rect x="542" y="170" width="200" height="62" rx="10" class="p1s"/>
  <text x="642" y="192" text-anchor="middle" class="tx-b">결함 상자 · 판정</text>
  <text x="642" y="210" text-anchor="middle" class="tx-m">정답 4개: S1 · S2 · ST · D1</text>
  <text x="642" y="226" text-anchor="middle" class="tx-m">결함 0개면 OK</text>
  <line x1="654" y1="120" x2="654" y2="146" class="ln" stroke-width="2"/>
  <line x1="654" y1="146" x2="210" y2="146" class="ln" stroke-width="2"/>
  <line x1="210" y1="146" x2="210" y2="166" class="ln" stroke-width="2" marker-end="url(#c17a4)"/>
  <line x1="302" y1="200" x2="332" y2="200" class="ln" stroke-width="2" marker-end="url(#c17a4)"/>
  <line x1="508" y1="200" x2="538" y2="200" class="ln" stroke-width="2" marker-end="url(#c17a4)"/>
  <rect x="20" y="254" width="722" height="62" rx="10" class="card-bg"/>
  <text x="381" y="276" text-anchor="middle" class="tx"><tspan class="tx-b">전제 조건</tspan>: 두 영상이 <tspan class="tx-b">픽셀 단위로 정렬</tspan>되어 있어야 한다 (같은 카메라 · 같은 위치 · 같은 조명)</text>
  <text x="381" y="300" text-anchor="middle" class="tx-m">어긋나 있으면 부품 경계 전체가 “결함” 으로 나온다 → 14차시 템플릿 매칭 · 피듀셜로 먼저 정렬(warpAffine)</text>
</svg>`;

  // 그림 8: 일괄 검사와 기록
  const FIG_BATCH = `<svg viewBox="0 0 760 320" role="img" aria-label="작업 목록을 반복하며 검사기의 가상 함수 inspect 를 부르고 화면 표, CSV, NG 이미지를 남기는 일괄 검사 흐름">
  ${ARROW('c17a5')}
  <rect x="16" y="20" width="220" height="230" rx="10" class="p1s"/>
  <text x="126" y="42" text-anchor="middle" class="tx-b">jobs (작업 목록)</text>
  <text x="30" y="68" class="tx-m">washers.png → 개수(13)</text>
  <text x="30" y="90" class="tx-m">coins_parts.png → 개수(12)</text>
  <text x="30" y="112" class="tx-m">color_caps.png → 색 분류</text>
  <text x="30" y="134" class="tx-m">metal_scratch.png → 결함(metal)</text>
  <text x="30" y="156" class="tx-m">metal_ok.png → 결함(metal)</text>
  <text x="30" y="178" class="tx-m">pcb_board.png → 결함(pcb)</text>
  <text x="30" y="200" class="tx-m">pcb_golden.png → 결함(pcb)</text>
  <text x="126" y="234" text-anchor="middle" class="tx-m">{ 파일, Inspector* }</text>
  <rect x="270" y="20" width="230" height="230" rx="10" class="p2s"/>
  <text x="385" y="42" text-anchor="middle" class="tx-b">for (const Job&amp; job : jobs)</text>
  <text x="385" y="74" text-anchor="middle" class="tx-m">① imread (빈 Mat 확인)</text>
  <text x="385" y="104" text-anchor="middle" class="tx-m">② try {</text>
  <text x="385" y="124" text-anchor="middle" class="tx">job.inspector-&gt;inspect(img)</text>
  <text x="385" y="144" text-anchor="middle" class="tx-m">} catch (exception&amp;) → ERROR</text>
  <text x="385" y="176" text-anchor="middle" class="tx-m">③ OK / NG 개수 세기</text>
  <text x="385" y="206" text-anchor="middle" class="tx-m">가상 함수 → 검사기 종류에</text>
  <text x="385" y="224" text-anchor="middle" class="tx-m">맞는 inspect 가 불린다</text>
  <rect x="534" y="20" width="210" height="62" rx="10" class="p3s"/>
  <text x="639" y="44" text-anchor="middle" class="tx-b">화면 표 (cout)</text>
  <text x="639" y="66" text-anchor="middle" class="tx-m">no · image · 판정 · 측정값</text>
  <rect x="534" y="104" width="210" height="62" rx="10" class="p4s"/>
  <text x="639" y="128" text-anchor="middle" class="tx-b">report.csv (ofstream)</text>
  <text x="639" y="150" text-anchor="middle" class="tx-m">한 작업 = 한 줄</text>
  <rect x="534" y="188" width="210" height="62" rx="10" class="p5s"/>
  <text x="639" y="212" text-anchor="middle" class="tx-b">NG_*.png (imwrite)</text>
  <text x="639" y="234" text-anchor="middle" class="tx-m">불량의 근거 이미지</text>
  <line x1="238" y1="135" x2="266" y2="135" class="ln" stroke-width="2" marker-end="url(#c17a5)"/>
  <line x1="502" y1="80" x2="530" y2="52" class="ln" stroke-width="2" marker-end="url(#c17a5)"/>
  <line x1="502" y1="135" x2="530" y2="135" class="ln" stroke-width="2" marker-end="url(#c17a5)"/>
  <line x1="502" y1="190" x2="530" y2="218" class="ln" stroke-width="2" marker-end="url(#c17a5)"/>
  <rect x="16" y="266" width="728" height="44" rx="10" class="card-bg"/>
  <text x="380" y="286" text-anchor="middle" class="tx">요약: <tspan class="tx-b">총 7건 · OK 4 · NG 3 · 불량률 42.9%</tspan></text>
  <text x="380" y="302" text-anchor="middle" class="tx-m">검사기(레시피) 5개는 vector&lt;unique_ptr&lt;Inspector&gt;&gt; 가 소유 — 같은 클래스라도 설정이 다르면 다른 객체</text>
</svg>`;

  const EX_METAL = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat golden = imread("images/metal_ok.png", IMREAD_GRAYSCALE);       // 양품 기준
    Mat test = imread("images/metal_scratch.png", IMREAD_GRAYSCALE);    // 검사 대상
    cout << "골든 " << golden.size() << ", 검사 " << test.size() << endl;

    // ① 차영상: 같은 위치의 밝기 차이 (밝아진 곳 · 어두워진 곳 모두)
    Mat diff;
    absdiff(golden, test, diff);
    double dmax;
    minMaxLoc(diff, nullptr, &dmax);
    cout << "차이 최대 " << dmax << " (헤어라인 표면 결함은 대비가 아주 약하다)" << endl;

    // ② 잡음 평탄화 → ③ 이진화 (임계값을 낮게!)
    Mat smooth, bin;
    GaussianBlur(diff, smooth, Size(5, 5), 0);
    threshold(smooth, bin, 10, 255, THRESH_BINARY);
    cout << "임계 10 통과 픽셀 " << countNonZero(bin) << "개" << endl;

    // ④ 닫기: 끊어진 긁힘 조각을 하나로 이어 붙인다
    morphologyEx(bin, bin, MORPH_CLOSE, getStructuringElement(MORPH_ELLIPSE, Size(21, 21)));

    // ⑤ 윤곽선 → 면적 필터 → 결함 상자 (왼쪽부터 번호)
    vector<vector<Point>> contours;
    findContours(bin, contours, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    vector<Rect> defects;
    for (const auto& c : contours)
        if (contourArea(c) >= 80) defects.push_back(boundingRect(c));
    sort(defects.begin(), defects.end(), [](const Rect& a, const Rect& b) { return a.x < b.x; });

    Mat overlay;
    cvtColor(test, overlay, COLOR_GRAY2BGR);
    cout << "결함 " << defects.size() << "개 (정답 4개: 긁힘 S1 · S2, 얼룩 ST, 찍힘 D1)" << endl;
    for (size_t i = 0; i < defects.size(); i++)
    {
        Rect r = defects[i];
        rectangle(overlay, r, Scalar(0, 0, 255), 2);
        putText(overlay, "D" + to_string(i + 1), r.tl() + Point(0, -6), FONT_HERSHEY_SIMPLEX, 0.5, Scalar(0, 255, 255), 1);
        cout << "  D" << i + 1 << " (" << r.x << "," << r.y << ")-(" << r.br().x << "," << r.br().y << ") 크기 " << r.size() << endl;
    }
    cout << "판정: " << (defects.empty() ? "OK" : "NG") << endl;

    imshow("diff x5", smooth * 5);          // 차이가 작아 5배로 밝혀서 본다
    imshow("defects", overlay);
    waitKey(0);
    return 0;
}`;
  const EX_PCB = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

// 정답 결함 하나: 이름 + 위치 (IMAGES.md 의 bbox)
struct Truth
{
    string name;
    Rect box;
};

int main()
{
    Mat golden = imread("images/pcb_golden.png", IMREAD_COLOR);
    Mat board = imread("images/pcb_board.png", IMREAD_COLOR);
    Mat ga, gb, diff, bin;
    cvtColor(golden, ga, COLOR_BGR2GRAY);
    cvtColor(board, gb, COLOR_BGR2GRAY);

    absdiff(ga, gb, diff);
    GaussianBlur(diff, diff, Size(5, 5), 0);
    threshold(diff, bin, 30, 255, THRESH_BINARY);                    // PCB 는 대비가 커서 30
    morphologyEx(bin, bin, MORPH_CLOSE, getStructuringElement(MORPH_ELLIPSE, Size(21, 21)));

    vector<vector<Point>> contours;
    findContours(bin, contours, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    vector<Rect> found;
    for (const auto& c : contours)
        if (contourArea(c) >= 50) found.push_back(boundingRect(c));
    sort(found.begin(), found.end(), [](const Rect& a, const Rect& b) { return a.x < b.x; });

    // 정답 (x, y, w, h) — IMAGES.md 의 (x0, y0, x1, y1) 을 Rect 로
    vector<Truth> truth = {
        { "D1 극성 반대",   Rect(120, 502, 60, 36) },
        { "U1 솔더 브리지", Rect(234, 252, 32, 16) },
        { "R3 부품 누락",   Rect(300, 380, 60, 40) },
        { "C2 이동·회전",   Rect(600, 375, 65, 45) },
    };

    Mat overlay = board.clone();
    cout << "검출 " << found.size() << "개 / 정답 " << truth.size() << "개" << endl;
    int falseAlarm = 0;
    for (size_t i = 0; i < found.size(); i++)
    {
        string match = "오검출";
        for (const Truth& t : truth)
            if ((found[i] & t.box).area() > 0) match = t.name;         // & = 두 Rect 의 교집합
        if (match == "오검출") falseAlarm++;
        rectangle(overlay, found[i], Scalar(0, 0, 255), 2);
        cout << "  #" << i + 1 << " " << found[i] << " -> " << match << endl;
    }
    int hit = 0;
    for (const Truth& t : truth)
    {
        bool detected = false;
        for (const Rect& f : found)
            if ((f & t.box).area() > 0) detected = true;
        if (detected) hit++;
        rectangle(overlay, t.box, Scalar(0, 255, 0), 1);                // 초록 = 정답
    }
    cout << "검출률 " << hit << " / " << truth.size() << " · 오검출 " << falseAlarm << "개" << endl;
    imshow("pcb", overlay);
    waitKey(0);
    return 0;
}`;
  const EX_SELFREF = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

// 차이 영상 → 이진화 → (닫기) → 결함 상자 목록 (면적은 픽셀 수로 센다: 1 px 폭 선도 잡히게)
vector<Rect> findDefects(const Mat& diff, double thr, int closeSize, int minPixels)
{
    Mat bin, labels, stats, cents;
    threshold(diff, bin, thr, 255, THRESH_BINARY);
    if (closeSize > 1)
        morphologyEx(bin, bin, MORPH_CLOSE, getStructuringElement(MORPH_ELLIPSE, Size(closeSize, closeSize)));
    int n = connectedComponentsWithStats(bin, labels, stats, cents);
    vector<Rect> boxes;
    for (int i = 1; i < n; i++)
        if (stats.at<int>(i, CC_STAT_AREA) >= minPixels)
            boxes.push_back(Rect(stats.at<int>(i, CC_STAT_LEFT), stats.at<int>(i, CC_STAT_TOP),
                                 stats.at<int>(i, CC_STAT_WIDTH), stats.at<int>(i, CC_STAT_HEIGHT)));
    return boxes;
}

int main()
{
    // ① 직물: 무늬가 16 px 마다 반복 → 위 · 아래로 한 주기 민 영상이 곧 "골든"
    Mat fab = imread("images/fabric_defect.png", IMREAD_GRAYSCALE);
    const int P = 16;
    Mat up = fab.clone(), down = fab.clone();
    fab.rowRange(P, fab.rows).copyTo(up.rowRange(0, fab.rows - P));      // up(y) = fab(y + P)
    fab.rowRange(0, fab.rows - P).copyTo(down.rowRange(P, fab.rows));    // down(y) = fab(y - P)
    Mat d1, d2, dfab;
    absdiff(fab, up, d1);
    absdiff(fab, down, d2);
    dfab = cv::min(d1, d2);         // 두 방향 모두 달라야 진짜 결함 (한쪽만 다르면 이웃 줄의 결함이 비친 것)
    GaussianBlur(dfab, dfab, Size(5, 5), 0);
    cout << "직물 (주기 16 px 비교)" << endl;
    for (const Rect& r : findDefects(dfab, 20, 9, 60))
        cout << "  결함 " << r << endl;

    // ② LCD: 결함이 가늘고 작다 → 미디언 필터로 결함만 지운 영상이 "골든"
    Mat lcd = imread("images/lcd_mura.png", IMREAD_GRAYSCALE);
    Mat ref, dlcd;
    medianBlur(lcd, ref, 5);
    absdiff(lcd, ref, dlcd);
    cout << "LCD (미디언 5 와 비교)" << endl;
    for (const Rect& r : findDefects(dlcd, 40, 1, 3))
        cout << "  결함 " << r << (r.height > 100 ? "  ← 꺼진 세로 라인" : "  ← 휘점") << endl;

    imshow("fabric diff x4", dfab * 4);
    imshow("lcd diff x3", dlcd * 3);
    waitKey(0);
    return 0;
}`;
  const EX_DEFECT = join(BASE, DEFECT_H, `// ===== File: main.cpp =====
#include "DefectInspector.h"
#include <iostream>
#include <fstream>
using namespace cv;
using namespace std;

int main()
{
    DefectInspector metal(imread("images/metal_ok.png", IMREAD_GRAYSCALE));
    Mat test = imread("images/metal_scratch.png", IMREAD_GRAYSCALE);

    InspectionResult r = metal.inspect(test);
    r.image = "metal_scratch.png";
    cout << r.summary() << endl;

    // ① 근거 이미지 저장 — NG 는 반드시 남긴다
    bool saved = imwrite("metal_result.png", r.overlay);
    cout << "metal_result.png 저장 " << (saved ? "성공" : "실패") << " (" << r.overlay.size() << ", 채널 " << r.overlay.channels() << ")" << endl;

    // ② 결함 목록 CSV
    ofstream csv("metal_defects.csv");
    csv << "id,x,y,w,h\\n";
    for (size_t i = 0; i < r.defects.size(); i++)
    {
        const Rect& d = r.defects[i];
        csv << "D" << i + 1 << "," << d.x << "," << d.y << "," << d.width << "," << d.height << "\\n";
    }
    csv.close();
    ifstream in("metal_defects.csv");
    for (string line; getline(in, line); ) cout << "  " << line << endl;

    // ③ 사용 방법이 틀리면? — 크기가 다른 영상 (예외를 잡아 메시지로)
    try
    {
        metal.inspect(imread("images/pcb_board.png"));
    }
    catch (const exception& e)
    {
        cout << "검사할 수 없습니다: " << e.what() << endl;
    }

    imshow("result", r.overlay);
    waitKey(0);
    return 0;
}`);
  const EX_BATCH = join(BASE, COUNT_H, COLOR_H, DEFECT_H, `// ===== File: main.cpp =====
#include "CountInspector.h"
#include "ColorSortInspector.h"
#include "DefectInspector.h"
#include <iostream>
#include <fstream>
#include <memory>
using namespace cv;
using namespace std;

// 검사 작업 하나: 어떤 이미지를 어떤 검사기로 (검사기는 inspectors 가 소유, 여기서는 가리키기만)
struct Job
{
    string file;
    Inspector* inspector;
};

int main()
{
    // ① 검사기 준비 — 제품마다 설정(레시피)이 다른 객체를 만든다
    vector<unique_ptr<Inspector>> inspectors;
    auto washers = make_unique<CountInspector>();
    washers->expected = 13;
    auto coins = make_unique<CountInspector>();
    coins->expected = 12;
    auto caps = make_unique<ColorSortInspector>();
    caps->expected = { {"red", 5}, {"yellow", 6}, {"green", 4}, {"blue", 3}, {"white", 2} };
    auto metal = make_unique<DefectInspector>(imread("images/metal_ok.png", IMREAD_GRAYSCALE));
    auto pcb = make_unique<DefectInspector>(imread("images/pcb_golden.png"));
    pcb->diffThreshold = 30;                  // PCB 는 대비가 커서 30
    pcb->minArea = 50;

    vector<Job> jobs = {
        { "washers.png", washers.get() },     { "coins_parts.png", coins.get() },
        { "color_caps.png", caps.get() },     { "metal_scratch.png", metal.get() },
        { "metal_ok.png", metal.get() },      { "pcb_board.png", pcb.get() },
        { "pcb_golden.png", pcb.get() },
    };
    inspectors.push_back(std::move(washers));      // 소유권을 목록으로 옮긴다 (jobs 의 포인터는 그대로 유효)
    inspectors.push_back(std::move(coins));
    inspectors.push_back(std::move(caps));
    inspectors.push_back(std::move(metal));
    inspectors.push_back(std::move(pcb));

    // ② 일괄 검사 → 화면 표 · CSV · NG 이미지 저장
    ofstream csv("report.csv");
    csv << "no,image,inspector,judge,values,defects\\n";
    int okCount = 0, ngCount = 0, no = 0;
    cout << "no  image              판정  측정값" << endl;
    for (const Job& job : jobs)
    {
        no++;
        Mat img = imread("images/" + job.file, IMREAD_UNCHANGED);
        InspectionResult r;
        try
        {
            r = job.inspector->inspect(img);       // 가상 함수 → 검사기 종류에 맞는 inspect 가 불린다
        }
        catch (const exception& e)
        {
            cout << format("%-3d %-18s ERR  ", no, job.file.c_str()) << e.what() << endl;
            csv << no << "," << job.file << "," << job.inspector->name() << ",ERROR,,\\n";
            continue;
        }
        r.image = job.file;
        (r.ok ? okCount : ngCount)++;

        string values;
        for (const Measurement& m : r.values)
            values += (values.empty() ? "" : " ") + m.name + "=" + format("%g", m.value);
        cout << format("%-3d %-18s %-4s ", no, job.file.c_str(), r.ok ? "OK" : "NG") << values
             << "  (" << r.inspector << ")" << endl;
        csv << no << "," << job.file << "," << r.inspector << "," << (r.ok ? "OK" : "NG") << ","
            << values << "," << r.defects.size() << "\\n";
        if (!r.ok)
            imwrite("NG_" + job.file, r.overlay);  // 불량은 근거 이미지를 남긴다
        imshow(job.file, r.overlay);
    }
    csv.close();

    // ③ 요약
    int total = okCount + ngCount;
    cout << "----------------------------------------" << endl;
    cout << format("총 %d건 · OK %d · NG %d · 불량률 %.1f%%", total, okCount, ngCount, 100.0 * ngCount / total) << endl;
    cout << "검사기 " << inspectors.size() << "개 · report.csv 와 NG_*.png 저장" << endl;
    waitKey(0);
    return 0;
}`);

  // Visual Studio 완성 프로젝트의 결과 보기 부분 (발췌 — 브라우저에서는 키 입력을 기다리지 않으므로 로컬 전용)
  const VS_VIEWER = `// vs/Ch17_Inspection/main.cpp (발췌) — ③ 결과 보기: n 다음 · p 이전 · s 저장 · ESC 종료
const string win = "Ch17 Inspection";
namedWindow(win, WINDOW_AUTOSIZE);
size_t i = 0;
bool changed = true;
while (true)
{
    if (changed)
    {
        imshow(win, withFooter(results[i], i, results.size()));   // 아래쪽에 [3/7] 파일 이름 · 키 안내
        cout << "  " << results[i].summary() << endl;
        changed = false;
    }
    int key = waitKey(50);                        // 50 ms 기다림, 키가 없으면 -1
    if (key < 0)
    {
        if (getWindowProperty(win, WND_PROP_VISIBLE) < 1) break;   // 창의 X 버튼으로 닫으면 종료
        continue;
    }
    key &= 0xFF;
    if (key == 27 || key == 'q') break;           // ESC
    if (key == 'n' || key == ' ') { i = (i + 1) % results.size(); changed = true; }
    else if (key == 'p') { i = (i + results.size() - 1) % results.size(); changed = true; }
    else if (key == 's')
    {
        string path = outDir + "/overlay_" + results[i].image;
        if (imwrite(path, results[i].overlay)) cout << "  저장: " << path << endl;
    }
}
destroyAllWindows();`;

  const SEC3 = {
    id: 'cv17-3', title: '결함 검사(골든 비교) · 일괄 검사와 리포트 · 강좌 정리', minutes: 50,
    goals: ['골든 이미지 차영상으로 예상 못한 결함의 위치를 찾고, 정답과 대조해 검출률 · 오검출을 평가할 수 있다', '골든을 생성자로 받는 DefectInspector 를 만들고 예외로 사용 오류를 알릴 수 있다', 'vector&lt;unique_ptr&lt;Inspector&gt;&gt; 로 여러 검사를 일괄 실행해 표 · CSV · NG 이미지를 남길 수 있다'],
    flow: [['골든 이미지 비교', 14], ['PCB 평가 · 기준 없는 결함', 10], ['DefectInspector · 일괄 검사', 16], ['강좌 정리 · 다음 학습', 10]],
    content: [
      { type: 'h', text: '예상 못한 결함은 어떻게 찾나' },
      { type: 'p', html: '1 · 2교시의 검사는 <b>무엇을 찾을지 알고 있었습니다</b> — 부품 개수, 색, 정해진 자리. 그런데 “긁힘 · 얼룩 · 찍힘” 처럼 <b>어디에 어떤 모양으로 생길지 모르는</b> 결함은 규칙을 미리 쓸 수 없습니다. 이럴 때 쓰는 가장 기본적이고 강력한 방법이 <b>골든 이미지 비교</b>(Golden Template Comparison)입니다: <b>양품 기준 영상</b>과 검사 영상의 <b>차이</b>를 구해, 차이가 큰 영역을 결함으로 봅니다.' },
      { type: 'figure', html: FIG_GOLDEN, caption: '그림 7. 골든 비교 파이프라인 — absdiff → GaussianBlur → threshold → MORPH_CLOSE → findContours → 결함 상자' },
      { type: 'callout', kind: 'warn', title: '전제: 두 영상이 픽셀 단위로 정렬되어 있어야 한다', html: '카메라 · 위치 · 조명이 같아야 하고, 제품이 놓인 위치가 1~2 픽셀만 어긋나도 <b>모든 경계선이 결함으로</b> 나옵니다. 그래서 실제 장비는 ① 제품을 지그로 고정하거나 ② 14차시의 <b>템플릿 매칭 · 피듀셜 마크</b>로 위치를 찾아 <code>warpAffine</code> 으로 정렬한 뒤 비교합니다. 이 차시의 <code>metal_ok</code> ↔ <code>metal_scratch</code>, <code>pcb_golden</code> ↔ <code>pcb_board</code> 는 <b>이미 정렬된</b> 쌍입니다.' },
      { type: 'code', title: '예제 1: 금속 표면 결함 4개 찾기 (metal_ok vs metal_scratch)', code: EX_METAL,
        desc: '헤어라인 금속 표면의 결함은 <b>차이 최대값이 58</b>(블러 뒤에는 38)밖에 되지 않고 대부분의 결함 픽셀은 차이가 10~20 입니다 — 그래서 임계값을 <b>10</b> 처럼 낮게 잡아야 합니다(PCB 는 30). 대신 낮은 임계값은 잡음도 통과시키므로 <code>GaussianBlur</code>(평탄화) → <code>MORPH_CLOSE</code>(조각 이어 붙이기) → <b>면적 필터</b> 세 단계로 걸러 냅니다. 닫기를 21×21 로 크게 잡은 이유는 긁힘 S1 이 <b>가늘고 길어</b> 여러 조각으로 끊기기 때문입니다. 결과는 IMAGES.md 의 정답 4개(D1=S1 긁힘 · D2=찍힘 · D3=얼룩 ST · D4=S2 긁힘)와 위치가 일치합니다. <code>smooth * 5</code> 는 차이가 작아 5배로 밝혀서 보기 위한 것(포화 연산)입니다.',
        expect: '골든 [640 x 480], 검사 [640 x 480]\n차이 최대 58 (헤어라인 표면 결함은 대비가 아주 약하다)\n임계 10 통과 픽셀 5812개\n결함 4개 (정답 4개: 긁힘 S1 · S2, 얼룩 ST, 찍힘 D1)\n  D1 (109,94)-(432,177) 크기 [323 x 83]\n  D2 (173,343)-(207,378) 크기 [34 x 35]\n  D3 (427,304)-(518,372) 크기 [91 x 68]\n  D4 (470,80)-(561,141) 크기 [91 x 61]\n판정: NG' },
      { type: 'table', head: ['이미지', '차이 최대(블러 후)', '임계값', '닫기 커널', '최소 면적', '결함'], rows: [
        ['<code>metal_scratch.png</code> (헤어라인 금속)', '38', '10', '21', '80', '4개 (S1 · S2 · ST · D1)'],
        ['<code>pcb_board.png</code> (초록 솔더마스크 PCB)', '120', '30', '21', '50', '4개 (D1 · U1 · R3 · C2)']
      ], caption: '표 3. 같은 파이프라인, 다른 파라미터 — 표면 대비에 따라 임계값이 3배 차이 난다. 제품마다 파라미터를 “레시피”로 둔다' },
      { type: 'code', title: '예제 2: PCB 결함 검사 + 정답 대조 (검출률 · 오검출)', code: EX_PCB,
        desc: '<b>검출 결과를 정답과 대조하는 코드</b>를 함께 두는 것이 이 예제의 요점입니다. 검사 알고리즘을 만들 때는 반드시 <b>정답이 있는 샘플 세트</b>로 ① 검출률(정답 중 몇 개를 찾았나) ② 오검출(정답이 아닌 것을 몇 개 찾았나)을 잽니다. 두 사각형이 겹치는지는 <code>(a &amp; b).area() &gt; 0</code> — <code>Rect</code> 의 <code>&amp;</code> 연산자는 <b>교집합</b> 사각형을 돌려줍니다. 결과는 4/4 검출 · 오검출 0. 초록 사각형이 정답, 빨간 사각형이 검출 결과입니다.',
        expect: '검출 4개 / 정답 4개\n  #1 [27 x 23 from (137, 509)] -> D1 극성 반대\n  #2 [9 x 9 from (246, 256)] -> U1 솔더 브리지\n  #3 [40 x 26 from (313, 389)] -> R3 부품 누락\n  #4 [46 x 33 from (613, 382)] -> C2 이동·회전\n검출률 4 / 4 · 오검출 0개' },
      { type: 'callout', kind: 'tip', title: '검출률과 오검출(과검)의 균형', html: '임계값을 낮추면 <b>검출률↑ 오검출↑</b>, 높이면 <b>검출률↓ 오검출↓</b> 입니다. 현장에서는 보통 “<b>불량을 놓치지 않는 것</b>”이 우선이므로 과검을 어느 정도 감수하고 임계값을 낮춘 뒤, NG 로 나온 것만 사람이 재확인합니다. 반대로 과검이 너무 많으면 라인이 멈추므로 <b>정답 세트로 측정해 균형점을 찾는 것</b>이 개발의 핵심 작업입니다 (실습 1).' },
      { type: 'h', text: '골든이 없을 때: 영상 스스로 기준 만들기' },
      { type: 'p', html: '직물 · LCD 처럼 <b>무늬가 규칙적</b>이거나 결함이 <b>아주 가늘고 작으면</b> 양품 사진 없이도 기준을 만들 수 있습니다. ① 무늬가 주기 P 로 반복되면 <b>P 만큼 민 영상</b>이 곧 골든입니다. ② 결함이 필터 커널보다 작으면 <b>미디언 필터</b>가 결함만 지운 영상이 골든입니다. 나머지 과정(차이 → 이진화 → 상자)은 똑같습니다.' },
      { type: 'code', title: '예제 3: 직물(주기 비교) · LCD(미디언 비교) 결함 찾기', code: EX_SELFREF,
        desc: '<code>fabric_defect.png</code> 는 평직 반복 주기가 16 px 이라 위 · 아래로 16 px 민 영상과 비교합니다. <code>cv::min(d1, d2)</code> 로 <b>두 방향 모두 다를 때만</b> 남기는 것이 요령입니다 — 한 방향 차이만 보면 결함이 16 px 떨어진 곳에 <b>한 번 더</b> 비칩니다. 결과는 정답 F2 매듭 (135,110)-(165,130), F1 끊어진 씨실 (300,248)-(372,256) 과 일치합니다. <code>lcd_mura.png</code> 는 <code>medianBlur(5)</code> 와 비교해 <b>꺼진 세로 라인 x=173</b> 과 <b>휘점 (520,389) 2×2</b> 를 찾습니다. 폭 1 px 선은 <code>contourArea</code> 가 0 이므로 면적을 <b>픽셀 수</b>(<code>CC_STAT_AREA</code>)로 셉니다. 단, 대비 −5% 의 넓은 <b>무라(얼룩)</b>는 이 방법으로 찾을 수 없습니다 — 큰 블러로 배경을 추정해 빼는 방법이 필요합니다(📘 더 알아보기).',
        expect: '직물 (주기 16 px 비교)\n  결함 [22 x 12 from (140, 115)]\n  결함 [70 x 8 from (303, 248)]\nLCD (미디언 5 와 비교)\n  결함 [1 x 480 from (173, 0)]  ← 꺼진 세로 라인\n  결함 [2 x 2 from (520, 389)]  ← 휘점' },
      { type: 'h', text: 'DefectInspector: 골든은 “설정” 이다' },
      { type: 'p', html: 'C# 판 강좌의 검사기는 <code>Inspect(image, golden)</code> 처럼 골든을 매번 넘기고 <code>NeedsGolden</code> 속성으로 필요 여부를 알렸습니다. C++ 판은 골든을 <b>생성자</b>에서 받아 멤버(<code>golden_</code>)로 저장합니다. 골든은 제품이 바뀌기 전까지 변하지 않는 <b>검사기의 설정</b>이기 때문입니다. 그 덕분에 <code>DefectInspector</code> 도 <code>inspect(const Mat&amp; img)</code> — 다른 검사기와 <b>똑같은 모양</b>이 되어 한 반복문에 넣을 수 있습니다.' },
      { type: 'code', title: '예제 4: DefectInspector + 결과 이미지 · CSV 저장 + 예외 (파일 4개)', code: EX_DEFECT,
        desc: '<code>explicit DefectInspector(const Mat&amp; golden)</code> — <code>explicit</code> 은 <code>Mat</code> 이 검사기로 <b>몰래 변환</b>되는 것을 막습니다. 골든은 생성자에서 한 번 흑백으로 바꿔 두므로 검사할 때마다 변환하지 않습니다. 크기가 다른 영상이 들어오면 <code>throw std::invalid_argument(...)</code> 로 <b>사용 방법 오류</b>를 알리고, 부르는 쪽은 <code>catch (const exception&amp; e)</code> 로 잡아 메시지를 보여 줍니다(<code>cv::Exception</code> 도 <code>std::exception</code> 을 상속하므로 함께 잡힘). 결과 이미지는 <code>imwrite</code> 로, 결함 목록은 <code>ofstream</code> 으로 남깁니다 — 저장한 파일은 📁 작업 폴더에서 확인하세요. <code>r.defects[i] + Size(12, 12) - Point(6, 6)</code> 은 상자를 6 px 씩 넓혀 그리는 <code>Rect</code> 연산입니다.',
        expect: 'NG | 결함 검사 | metal_scratch.png | maxDiff=38 defects=4 | 불량 4곳\nmetal_result.png 저장 성공 ([640 x 480], 채널 3)\n  id,x,y,w,h\n  D1,109,94,323,83\n  D2,173,343,34,35\n  D3,427,304,91,68\n  D4,470,80,91,61\n검사할 수 없습니다: 골든과 크기가 다릅니다' },
      { type: 'h', text: '세 검사기를 한 번에: 일괄 검사 · 리포트' },
      { type: 'p', html: '이제 세 검사기가 모두 같은 모양(<code>name()</code> · <code>inspect(img)</code>)을 갖췄습니다. 검사기 객체는 <code>vector&lt;unique_ptr&lt;Inspector&gt;&gt;</code> 가 <b>소유</b>하고, “어떤 이미지를 어떤 검사기로” 는 작업 목록(<code>vector&lt;Job&gt;</code>)이 <b>가리키기만</b> 합니다. 같은 <code>CountInspector</code> 클래스라도 기대 개수가 다르면 <b>다른 객체(레시피)</b>입니다.' },
      { type: 'figure', html: FIG_BATCH, caption: '그림 8. 일괄 검사 — 작업 목록을 반복하며 inspect(가상 함수)를 부르고 화면 표 · report.csv · NG 이미지를 남긴다' },
      { type: 'code', title: '예제 5: 일괄 검사 — 7장 · 검사기 5개 · report.csv · NG 이미지 (파일 6개)', code: EX_BATCH,
        desc: '<code>job.inspector-&gt;inspect(img)</code> 한 줄이 세 종류의 검사를 모두 부릅니다 — 이것이 <b>다형성</b>입니다. <code>make_unique&lt;CountInspector&gt;()</code> 로 만든 객체를 설정한 뒤 <code>std::move</code> 로 목록에 넘겨도 객체 주소는 그대로라 <code>jobs</code> 의 포인터(<code>.get()</code>)는 유효합니다. 검사 하나가 예외를 던져도 <code>try/catch</code> 로 그 작업만 ERROR 로 기록하고 다음으로 넘어갑니다 — 장비는 멈추면 안 되기 때문입니다. 불량만 <code>NG_파일이름.png</code> 로 저장하고, 마지막에 불량률을 출력합니다. 결과는 완성 프로젝트(<code>vs/Ch17_Inspection</code>)와 같습니다. 표의 열 맞춤은 영문 파일 이름에만 <code>%-18s</code> 를 쓰고 한글은 줄 끝에 두었습니다(한글은 글자 폭이 달라 <code>setw</code> 로 맞지 않음).',
        expect: 'no  image              판정  측정값\n1   washers.png        NG   count=11 expected=13  (개수 세기)\n2   coins_parts.png    OK   count=12 expected=12  (개수 세기)\n3   color_caps.png     OK   red=5 yellow=6 green=4 blue=3 white=2 total=20  (색 분류)\n4   metal_scratch.png  NG   maxDiff=38 defects=4  (결함 검사)\n5   metal_ok.png       OK   maxDiff=0 defects=0  (결함 검사)\n6   pcb_board.png      NG   maxDiff=120 defects=4  (결함 검사)\n7   pcb_golden.png     OK   maxDiff=0 defects=0  (결함 검사)\n----------------------------------------\n총 7건 · OK 4 · NG 3 · 불량률 42.9%\n검사기 5개 · report.csv 와 NG_*.png 저장' },
      { type: 'callout', kind: 'warn', title: '임계값 하나로 “불량을 OK 로” 보내는 사고', html: '<code>DefectInspector::diffThreshold</code> 기본값은 <b>10</b> 입니다. 이 값을 <b>20</b> 으로 올리면 금속 결함 4개 중 1개를 놓치고, <b>40</b> 에서는 <b>0개 → OK</b> 가 됩니다(실습 1). 불량을 양품으로 내보내는 <b>미검출</b>은 양품을 버리는 과검보다 훨씬 비싼 사고입니다. 임계값은 반드시 <b>정답 세트</b>로 검출률과 과검을 함께 재서 정하고, <b>양품이 OK 로 나오는지</b>(예제 5 의 metal_ok · pcb_golden)도 함께 시험하세요. 경계값 근처에서는 블러 · 반올림 구현 차이 때문에 로컬 OpenCV 와 결과가 조금 다를 수 있다는 것도 기억하세요.' },
      { type: 'code', title: 'Visual Studio: 결과 보기 창 (n 다음 · p 이전 · s 저장 · ESC 종료)', code: VS_VIEWER, run: false, local: true, file: 'main.cpp',
        desc: '완성 프로젝트는 일괄 검사 뒤 결과 오버레이를 창에 띄우고 <b>키로 넘겨 봅니다</b>. <code>waitKey(50)</code> 은 키가 없으면 -1 을 돌려주므로, 그때 <code>getWindowProperty(win, WND_PROP_VISIBLE)</code> 로 창이 닫혔는지 확인합니다. <code>(i + size - 1) % size</code> 는 0 에서 “이전” 을 누르면 마지막으로 돌아가게 하는 요령입니다. 브라우저의 <code>waitKey</code> 는 키를 기다리지 않으므로 이 반복은 로컬 전용입니다(브라우저에서는 예제 5 처럼 모든 결과를 <code>imshow</code> 로 한꺼번에 봅니다).' },
      { type: 'project', title: 'Ch17_Inspection — 완성 프로젝트로 전체 확인하기', project: 'Ch17_Inspection', html: '<ol><li><code>vs/studyOpenCVCPP.sln</code> → <code>Ch17_Inspection</code> 을 시작 프로젝트로 → x64 → <kbd>F5</kbd>. 작업 폴더(<code>vs/</code>)에 <code>images/</code> 가 있어야 합니다.</li><li>콘솔에 7장의 판정 표(예제 5 와 같음, 처리 시간 ms 포함)가 나오고 <code>vs/results/report.csv</code> · <code>NG_*.png</code> 가 생깁니다. CSV 는 <b>UTF-8 BOM</b> 으로 저장해 Excel 에서 한글이 바로 보입니다.</li><li>결과 창에서 <kbd>n</kbd> / <kbd>p</kbd> 로 넘기며 오버레이를 확인하고, <kbd>s</kbd> 로 <code>results/overlay_*.png</code> 를 저장, <kbd>ESC</kbd> 로 종료합니다.</li><li><code>main.cpp</code> 의 <code>pcbPtr-&gt;diffThreshold</code> 를 30 → 60 으로 바꿔 다시 실행해 보고, 불량이 몇 개 남는지 확인하세요.</li><li>확장: 실습 3 의 <code>BlisterInspector</code> 를 <code>Inspectors/</code> 에 추가하고 <code>jobs</code> 에 <code>{ "blister_pack.png", blister }</code> 한 줄을 넣어 보세요 — <code>main</code> 의 반복문은 그대로입니다.</li></ol>' },
      { type: 'h', text: '강좌 전체 정리' },
      { type: 'table', head: ['Part', '차시', '핵심', '17차시에서 쓴 곳'], rows: [
        ['1. 준비', '00~02', 'Visual Studio + OpenCV 5.0 설정 · imread/imshow/imwrite · waitKey', '프로젝트 · 결과 이미지 저장 · 결과 보기 창'],
        ['2. 기초', '03 Mat · 04 그리기', '픽셀 접근 · ROI · 도형 · putText', '포켓 ROI · 오버레이 사각형 · 번호 · OK/NG 띠'],
        ['2. 기초', '05 색 공간', 'BGR ↔ Gray ↔ HSV · <code>inRange</code>', '색 분류 검사 전체 · 병 캡'],
        ['2. 기초', '06 히스토그램 · 07 이진화', 'Otsu · 극성', '개수 세기 · 차영상 이진화'],
        ['2. 기초', '08 필터 · 09 모폴로지', '블러 · 미디언 · Open/Close', '잡점 제거 · 결함 조각 잇기 · LCD 기준 영상'],
        ['2. 기초', '10 에지 · 11 기하 변환', 'Canny · warpAffine', '골든 정렬(전제 조건)'],
        ['3. 분석', '12 윤곽선', 'findContours · 계층 · 연결 요소 · 거리 변환 · watershed', '닿은 부품 분리 · 결함 상자 · 구멍 판별'],
        ['3. 분석', '13 허프 · 14 매칭', '원/직선 검출 · 템플릿 매칭 · 특징점', '격자 정렬(피듀셜) · 원형 부품'],
        ['3. 분석', '15 카메라', 'VideoCapture · 프레임 처리', '라인 연속 검사로 확장'],
        ['4. 응용', '16 Image Studio', '추상 클래스 · 다형성 · unique_ptr · 파일 나누기', '<code>Inspector</code> 설계 · 검사기 목록'],
        ['4. 응용', '17 검사 (이 차시)', '판정 · 오버레이 · 리포트 · 일괄 검사', '전부']
      ], caption: '표 4. 강좌 전체 지도 — 17차시는 앞의 모든 차시를 한 프로그램에서 쓴다' },
      { type: 'callout', kind: 'more', title: '📘 다음 학습: 여기서 더 나아가려면', html: '<ul><li><b>저대비 결함(무라)</b>: 큰 블러 · 다항식 피팅으로 배경을 추정해 빼고(flat-field), 결과를 정규화해 대비를 키웁니다. <code>lcd_mura.png</code> 의 무라는 깊이 −5% 라 눈으로도 거의 안 보입니다.</li><li><b>딥러닝 검사</b>: 규칙으로 쓰기 어려운 결함(직물 · 용접 · 도장)은 학습 기반이 유리합니다 — 분류(OK/NG) · 이상 탐지(정상만 학습) · 분할. C++ 에서는 ONNX 모델을 OpenCV <code>dnn</code> 모듈이나 ONNX Runtime 으로 추론합니다(브라우저 환경은 dnn 미지원).</li><li><b>산업 카메라</b>: GigE Vision · USB3 Vision 카메라와 GenICam 표준, 제조사 SDK(C++ API). 트리거 촬영 · 노출 고정 · 스트로브 조명이 재현성의 핵심입니다.</li><li><b>정밀 측정</b>: 서브픽셀 에지(캘리퍼) · 원 피팅 · 카메라 캘리브레이션(<code>calibrateCamera</code>) · px→mm 변환 (<code>plate_holes.png</code> · <code>gap_measure.png</code>).</li><li><b>시스템</b>: 레시피 파일 · 이력 DB · PLC 통신 · 멀티스레드(<code>std::thread</code>)로 촬영과 검사를 겹치기 · 로그와 자동 복구.</li></ul>' },
      { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 · 오개념 지도', html: '<p><b>수업 준비</b></p><ul><li><code>vs/Ch17_Inspection</code> 을 교사 PC 에서 미리 빌드하고(Release 권장) 한 번 실행해 <code>vs/results/</code> 가 생기는지 확인하세요. <code>vs/images/</code> 가 없으면 7건 모두 ERROR 가 됩니다 — 학생들이 가장 많이 막히는 지점입니다.</li><li>예제 5(파일 6개)는 브라우저 컴파일에 15~20초 걸립니다. 수업 전에 한 번 실행해 두면 캐시로 빨라집니다.</li><li>“정답 세트로 평가” 를 체감하게 하려면 실습 1 의 임계값 표(5 · 10 · 20 · 40 → 4 · 4 · 3 · 0)를 미리 칠판에 그려 두세요.</li><li>3교시 마지막 10분은 강좌 전체 정리입니다. 표 4 를 인쇄해 나눠 주면 복습에 좋습니다.</li></ul><p><b>자주 나오는 오개념</b></p><ul><li>“골든 비교는 어디서나 된다” → <b>정렬이 전제</b>. <code>warpAffine</code> 으로 골든을 3 px 밀어 비교해 보여 주면(경계 전체가 결함으로 나옴) 확실히 이해합니다.</li><li>“임계값을 낮출수록 좋다” → 과검이 폭발합니다(실습 2: 밝기 +8 양품이 임계 5 에서 NG). 검출률과 과검을 <b>함께</b> 봐야 합니다.</li><li>“결함 개수가 정답과 같으면 성공” → <b>위치가 맞는지</b>도 봐야 합니다(예제 2 의 교집합 대조).</li><li>“부모 포인터로 부르면 부모 함수가 불린다” → <code>virtual</code> 이면 실제 객체의 함수. <code>virtual</code> 을 지워 보고 컴파일 오류(<code>override</code>)를 확인시키면 좋습니다.</li></ul><p>💬 발문 모음: “불량을 놓치는 것과 양품을 버리는 것 중 무엇이 더 큰 손실일까?”(제품마다 다름 — 의약품 · 자동차 부품은 전자) / “검사기를 하나 더 추가하려면 어느 파일을 고쳐야 하나?”(<code>Inspectors/</code> 에 클래스 하나 + <code>jobs</code> 에 한 줄) / “이 프로그램을 24시간 돌리려면 무엇이 더 필요할까?”(카메라 트리거 · 이력 DB · 자동 복구 · 로그).</p>' },
      { type: 'table', teacher: true, head: ['평가 항목 (100점)', '상 (만점)', '중 (절반)', '하 (0~1/4)'], rows: [
        ['① 설계 · 파일 구성 (15)', '<code>Inspector</code> 추상 클래스 · <code>InspectionResult</code> 를 .h/.cpp 로 나누고 가상 소멸자 · <code>override</code> · <code>const Mat&amp;</code> 를 바르게 사용', '인터페이스는 있으나 헤더에 <code>using namespace</code> · 가상 소멸자 누락 등 규칙 위반', 'main 하나에 모든 코드'],
        ['② 개수 세기 (20)', '극성 판단 · 열기 · 면적 필터 · 기대 개수 판정 + 붙음 의심 또는 watershed 분리로 washers 원인 설명', '개수와 판정은 맞으나 붙음 · 극성 문제를 설명하지 못함', '개수가 틀리거나 판정 없음'],
        ['③ 색 분류 (20)', 'HSV 범위를 픽셀 값으로 근거 제시, 빨강 두 구간 · 흰색 S/V 처리, 색 정의를 데이터로 분리해 5색 모두 정답', '대부분 맞으나 빨강 · 흰색 중 하나 오류 또는 if 나열', 'BGR 로 판정 · 결과 틀림'],
        ['④ 결함 검사 · 평가 (20)', '골든 차영상 + 정답 대조(검출률 · 과검) + 임계값 근거 제시 + 양품 OK 확인', '결함은 찾았으나 정답 대조 · 임계값 근거 없음', '결함 개수 · 위치 틀림'],
        ['⑤ 기록 · 예외 · 일괄 처리 (15)', '오버레이 · imwrite · CSV(헤더 고정) · 예외 처리로 한 작업 실패에도 계속 진행 · 요약 출력', '저장은 되나 예외 처리 · 요약 누락', '결과를 남기지 않음'],
        ['⑥ 발표 · 해석 (10)', '오검출 · 미검출 사례와 개선안을 스스로 설명', '결과만 설명', '설명 없음']
      ], caption: '🧑‍🏫 평가 루브릭 (교사용) — 팀 프로젝트로 운영할 때는 ⑥ 을 동료 평가로 대체할 수 있다' }
    ],
    practice: [
      {
        title: '임계값을 바꿔 결함 검출 개수 표 만들기', level: 2,
        desc: '금속 표면 골든 비교에서 <b>임계값 5 · 10 · 20 · 40</b> 을 각각 적용해 검출된 결함 개수를 표로 출력하세요. 정답은 4개입니다. 임계값을 <b>높이면</b> 대비가 약한 결함부터 놓쳐 개수가 줄어드는 것을 확인하고, 이 표면에 알맞은 임계값을 결론으로 적어 보세요.',
        hint: '차영상 → <code>GaussianBlur 5×5</code> → <code>threshold(thr)</code> → <code>MORPH_CLOSE 21×21</code> → <code>findContours</code> → 면적 80 이상. 임계값만 바꿔 같은 함수를 네 번 부르면 됩니다.',
        expect: '임계값 | 결함 수 (정답 4)\n     5 | 4\n    10 | 4\n    20 | 3\n    40 | 0\n임계값을 높이면 대비가 약한 결함부터 놓친다.\n너무 낮추면 잡음까지 통과해 과검이 늘어난다. 이 표면은 10 이 적절.',
        starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

// 골든 비교로 찾은 결함 개수
int countDefects(const Mat& golden, const Mat& test, double thr, double minArea)
{
    Mat diff, bin;
    absdiff(golden, test, diff);
    GaussianBlur(diff, diff, Size(5, 5), 0);
    // TODO: threshold(thr) → 닫기(타원 21x21) → 바깥 윤곽선 → 면적 minArea 이상인 개수를 돌려주세요
    return 0;
}

int main()
{
    Mat golden = imread("images/metal_ok.png", IMREAD_GRAYSCALE);
    Mat test = imread("images/metal_scratch.png", IMREAD_GRAYSCALE);
    cout << "임계값 | 결함 수 (정답 4)" << endl;
    for (double t : { 5, 10, 20, 40 })
        cout << format("%6.0f | %d", t, countDefects(golden, test, t, 80)) << endl;
    // TODO: 결과를 보고 이 표면에 알맞은 임계값을 결론으로 출력하세요
    return 0;
}`,
        solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

// 골든 비교로 찾은 결함 개수
int countDefects(const Mat& golden, const Mat& test, double thr, double minArea)
{
    Mat diff, bin;
    absdiff(golden, test, diff);
    GaussianBlur(diff, diff, Size(5, 5), 0);
    threshold(diff, bin, thr, 255, THRESH_BINARY);
    morphologyEx(bin, bin, MORPH_CLOSE, getStructuringElement(MORPH_ELLIPSE, Size(21, 21)));
    vector<vector<Point>> contours;
    findContours(bin, contours, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    int count = 0;
    for (const auto& c : contours)
        if (contourArea(c) >= minArea) count++;
    return count;
}

int main()
{
    Mat golden = imread("images/metal_ok.png", IMREAD_GRAYSCALE);
    Mat test = imread("images/metal_scratch.png", IMREAD_GRAYSCALE);
    cout << "임계값 | 결함 수 (정답 4)" << endl;
    for (double t : { 5, 10, 20, 40 })
        cout << format("%6.0f | %d", t, countDefects(golden, test, t, 80)) << endl;
    cout << "임계값을 높이면 대비가 약한 결함부터 놓친다." << endl;
    cout << "너무 낮추면 잡음까지 통과해 과검이 늘어난다. 이 표면은 10 이 적절." << endl;
    return 0;
}`
      },
      {
        title: '양품을 넣어 과검(오검출)이 없는지 확인하기', level: 2,
        desc: '<b>같은 골든 이미지를 검사 이미지로도</b> 넣으면 결함이 0개여야 합니다. 그런데 실제 라인에서는 같은 양품이라도 <b>조명이 조금씩 변합니다</b>. <code>metal_ok.png</code> 에 밝기 <b>+3</b> 과 <b>+8</b> 을 더한 “밝아진 양품” 을 만들어 임계값 5 와 10 에서 과검이 생기는지 확인하세요.',
        hint: '밝기 더하기는 <code>Mat brighter = golden + Scalar(3);</code> (포화 연산). 차이가 8 이면 블러 후에도 약 8 이므로 임계 5 를 넘어 <b>화면 전체가 하나의 결함</b>이 됩니다. 결론: 임계값은 조명 변동보다 충분히 커야 한다.',
        expect: '자기 자신과 비교 (임계 10): 결함 0개\n밝기 +3 양품: 임계 5 → 결함 0개, 임계 10 → 결함 0개\n밝기 +8 양품: 임계 5 → 결함 1개, 임계 10 → 결함 0개\n→ 임계값은 조명 변동(차이)보다 충분히 커야 과검이 없다\n불량 (임계 10): 결함 4개 -> NG',
        starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int countDefects(const Mat& golden, const Mat& test, double thr, double minArea)
{
    Mat diff, bin;
    absdiff(golden, test, diff);
    GaussianBlur(diff, diff, Size(5, 5), 0);
    threshold(diff, bin, thr, 255, THRESH_BINARY);
    morphologyEx(bin, bin, MORPH_CLOSE, getStructuringElement(MORPH_ELLIPSE, Size(21, 21)));
    vector<vector<Point>> contours;
    findContours(bin, contours, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    int count = 0;
    for (const auto& c : contours)
        if (contourArea(c) >= minArea) count++;
    return count;
}

int main()
{
    Mat golden = imread("images/metal_ok.png", IMREAD_GRAYSCALE);
    cout << "자기 자신과 비교 (임계 10): 결함 " << countDefects(golden, golden, 10, 80) << "개" << endl;

    // TODO: 조명이 조금 밝아진 양품을 만들어(golden + Scalar(3), + Scalar(8))
    //       임계값 5 와 10 으로 각각 검사해 결함 개수를 출력하세요

    return 0;
}`,
        solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int countDefects(const Mat& golden, const Mat& test, double thr, double minArea)
{
    Mat diff, bin;
    absdiff(golden, test, diff);
    GaussianBlur(diff, diff, Size(5, 5), 0);
    threshold(diff, bin, thr, 255, THRESH_BINARY);
    morphologyEx(bin, bin, MORPH_CLOSE, getStructuringElement(MORPH_ELLIPSE, Size(21, 21)));
    vector<vector<Point>> contours;
    findContours(bin, contours, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
    int count = 0;
    for (const auto& c : contours)
        if (contourArea(c) >= minArea) count++;
    return count;
}

int main()
{
    Mat golden = imread("images/metal_ok.png", IMREAD_GRAYSCALE);
    cout << "자기 자신과 비교 (임계 10): 결함 " << countDefects(golden, golden, 10, 80) << "개" << endl;

    // 조명이 조금 밝아진 양품: 모든 픽셀 +3, +8
    for (int delta : { 3, 8 })
    {
        Mat brighter = golden + Scalar(delta);            // 포화 연산 (255 를 넘지 않음)
        cout << "밝기 +" << delta << " 양품: 임계 5 → 결함 " << countDefects(golden, brighter, 5, 80)
             << "개, 임계 10 → 결함 " << countDefects(golden, brighter, 10, 80) << "개" << endl;
    }
    cout << "→ 임계값은 조명 변동(차이)보다 충분히 커야 과검이 없다" << endl;

    Mat scratch = imread("images/metal_scratch.png", IMREAD_GRAYSCALE);
    cout << "불량 (임계 10): 결함 " << countDefects(golden, scratch, 10, 80) << "개 -> NG" << endl;
    return 0;
}`
      },
      {
        title: '새 검사기 추가하기: BlisterInspector', level: 3,
        desc: '2교시 예제 3 의 블리스터 검사를 <code>Inspector</code> 를 상속한 <b><code>BlisterInspector</code> 클래스</b>로 만드세요. <code>Inspector.h</code> · <code>Inspector.cpp</code> 는 그대로 두고 <code>BlisterInspector.h</code> 하나만 완성하면 됩니다. 불량 포켓의 <code>Rect</code> 를 <code>r.defects</code> 에 넣고, <code>main</code> 은 <code>unique_ptr&lt;Inspector&gt;</code>(부모 포인터)로 부릅니다.',
        hint: '포켓마다 <code>inRange(hsv(roi), …)</code> 로 흰 · 주황 픽셀 수를 세고, <code>bool bad = (wa &lt; emptyLimit &amp;&amp; oa &lt; emptyLimit) || oa &gt; wa || wa &lt; normalPill * brokenRatio;</code>. 마지막에 <code>r.ok = r.defects.empty(); putJudge(r.overlay, r.ok);</code>. 정답 불량 포켓: (0,3) · (1,1) · (1,4) → ROI 좌상단 (382,132) · (182,272) · (482,272).',
        expect: 'NG | 블리스터 | blister_pack.png | pockets=10 ng=3 | 불량 3곳\n  불량 포켓 [76 x 76 from (382, 132)]\n  불량 포켓 [76 x 76 from (182, 272)]\n  불량 포켓 [76 x 76 from (482, 272)]',
        starter: join(BASE, `// ===== File: BlisterInspector.h =====
#pragma once
#include "Inspector.h"

// 블리스터 포장: 2 x 5 포켓마다 ROI 를 잘라 빈 포켓 · 색 불량 · 깨짐 판정
class BlisterInspector : public Inspector
{
public:
    int normalPill = 2400;       // 정상 알약의 흰 픽셀 수
    int emptyLimit = 500;
    double brokenRatio = 0.8;

    std::string name() const override { return "블리스터"; }

    InspectionResult inspect(const cv::Mat& img) override
    {
        using namespace cv;
        Mat hsv;
        cvtColor(toBgr(img), hsv, COLOR_BGR2HSV);
        InspectionResult r;
        r.inspector = name();
        r.overlay = toBgr(img);
        for (int row = 0; row < 2; row++)
            for (int col = 0; col < 5; col++)
            {
                Rect roi(120 + 100 * col - 38, 170 + 140 * row - 38, 76, 76);
                // TODO: ① hsv(roi) 에서 흰 픽셀(0,0,150 ~ 179,70,255) · 주황 픽셀(5,90,90 ~ 25,255,255) 수를 센다
                //       ② 빈 포켓 · 색 불량 · 깨짐 중 하나라도 해당하면 r.defects.push_back(roi)
                //       ③ 불량은 빨강, 정상은 초록 사각형
            }
        r.values.push_back({ "pockets", 10 });
        r.values.push_back({ "ng", (double)r.defects.size() });
        // TODO: 판정 r.ok 를 정하고 putJudge 로 띠를 그리세요
        return r;
    }
};

// ===== File: main.cpp =====
#include "BlisterInspector.h"
#include <iostream>
#include <memory>
using namespace cv;
using namespace std;

int main()
{
    unique_ptr<Inspector> inspector = make_unique<BlisterInspector>();   // 부모 포인터로 다룬다
    InspectionResult r = inspector->inspect(imread("images/blister_pack.png"));
    r.image = "blister_pack.png";
    cout << r.summary() << endl;
    for (const Rect& d : r.defects)
        cout << "  불량 포켓 " << d << endl;
    imshow("blister", r.overlay);
    waitKey(0);
    return 0;
}`),
        solution: join(BASE, `// ===== File: BlisterInspector.h =====
#pragma once
#include "Inspector.h"

// 블리스터 포장: 2 x 5 포켓마다 ROI 를 잘라 빈 포켓 · 색 불량 · 깨짐 판정
class BlisterInspector : public Inspector
{
public:
    int normalPill = 2400;       // 정상 알약의 흰 픽셀 수
    int emptyLimit = 500;
    double brokenRatio = 0.8;

    std::string name() const override { return "블리스터"; }

    InspectionResult inspect(const cv::Mat& img) override
    {
        using namespace cv;
        Mat hsv;
        cvtColor(toBgr(img), hsv, COLOR_BGR2HSV);
        InspectionResult r;
        r.inspector = name();
        r.overlay = toBgr(img);
        for (int row = 0; row < 2; row++)
            for (int col = 0; col < 5; col++)
            {
                Rect roi(120 + 100 * col - 38, 170 + 140 * row - 38, 76, 76);
                Mat white, orange;
                inRange(hsv(roi), Scalar(0, 0, 150), Scalar(179, 70, 255), white);
                inRange(hsv(roi), Scalar(5, 90, 90), Scalar(25, 255, 255), orange);
                int wa = countNonZero(white), oa = countNonZero(orange);
                bool bad = (wa < emptyLimit && oa < emptyLimit) || oa > wa || wa < normalPill * brokenRatio;
                if (bad) r.defects.push_back(roi);
                rectangle(r.overlay, roi, bad ? Scalar(0, 0, 255) : Scalar(0, 200, 0), 2);
            }
        r.values.push_back({ "pockets", 10 });
        r.values.push_back({ "ng", (double)r.defects.size() });
        r.ok = r.defects.empty();
        putJudge(r.overlay, r.ok);
        return r;
    }
};

// ===== File: main.cpp =====
#include "BlisterInspector.h"
#include <iostream>
#include <memory>
using namespace cv;
using namespace std;

int main()
{
    unique_ptr<Inspector> inspector = make_unique<BlisterInspector>();   // 부모 포인터로 다룬다
    InspectionResult r = inspector->inspect(imread("images/blister_pack.png"));
    r.image = "blister_pack.png";
    cout << r.summary() << endl;
    for (const Rect& d : r.defects)
        cout << "  불량 포켓 " << d << endl;
    imshow("blister", r.overlay);
    waitKey(0);
    return 0;
}`)
      }
    ],
    quiz: [
      { q: '골든 이미지 비교가 성립하기 위한 가장 중요한 전제는?', options: ['골든 이미지가 더 밝아야 한다', '두 영상이 <b>픽셀 단위로 정렬</b>되어 있어야 한다', '두 영상의 채널 수가 달라야 한다', '결함이 항상 어두워야 한다'], answer: 1,
        explain: '1~2 픽셀만 어긋나도 모든 경계선이 차이로 나와 결함처럼 보입니다. 실제 장비는 지그로 고정하거나 피듀셜 마크로 위치를 찾아 <code>warpAffine</code> 으로 정렬한 뒤 비교합니다.' },
      { q: '금속 표면(metal_scratch)의 임계값을 10 으로, PCB 는 30 으로 쓴 이유는?', options: ['이미지 크기가 달라서', '금속 결함의 차이 최대값이 <b>38</b>(블러 후)로 아주 약하고, PCB 는 <b>120</b> 으로 크기 때문', '금속이 흑백이어서', 'PCB 가 더 크기 때문'], answer: 1,
        explain: '같은 파이프라인이어도 <b>표면 대비에 따라 파라미터가 달라집니다</b>. 그래서 제품마다 파라미터(골든 · 임계값 · 면적)를 가진 <b>검사기 객체(레시피)</b>를 따로 만듭니다 — 예제 5 의 <code>metal</code> · <code>pcb</code>.' },
      { q: 'C++ 판 <code>DefectInspector</code> 가 골든 이미지를 <b>생성자</b>에서 받는 이유로 가장 알맞은 것은?', options: ['생성자가 더 빠르기 때문', '골든은 검사기의 <b>설정</b>이라 한 번만 받으면 되고, 그래야 <code>inspect(const Mat&amp;)</code> 모양이 다른 검사기와 같아져 한 반복문에 넣을 수 있다', 'Mat 은 함수 인수로 넘길 수 없기 때문', '골든은 private 이어야 하기 때문'], answer: 1,
        explain: '인터페이스의 모양이 같아야 다형성으로 묶을 수 있습니다. 검사마다 달라지는 것(검사 영상)은 인수로, 제품이 바뀌기 전까지 그대로인 것(골든 · 임계값)은 멤버로 둡니다.' },
      { q: '<code>vector&lt;unique_ptr&lt;Inspector&gt;&gt; inspectors;</code> 로 검사기를 보관하는 이유가 <u>아닌</u> 것은?', options: ['서로 다른 자식 클래스 객체를 한 목록에 담을 수 있다', '목록이 사라질 때 객체가 자동으로 delete 된다', '부모 포인터로 가상 함수 <code>inspect</code> 를 부를 수 있다', '<code>unique_ptr</code> 을 쓰면 <code>virtual</code> 이 없어도 자식 함수가 불린다'], answer: 3,
        explain: '자식 함수가 불리는 것은 <code>virtual</code> 덕분입니다. <code>unique_ptr</code> 은 <b>소유와 자동 해제</b>를 맡습니다. <code>vector&lt;Inspector&gt;</code> 처럼 값으로 담으면 추상 클래스라 만들 수도 없고, 자식 객체가 잘려(slicing) 버립니다.' },
      { q: '검사 알고리즘을 평가할 때 반드시 <b>함께</b> 봐야 하는 두 가지는?', options: ['처리 시간과 메모리', '<b>검출률</b>(정답을 몇 개 찾았나)과 <b>오검출</b>(정답이 아닌 것을 몇 개 찾았나)', '이미지 크기와 채널 수', '임계값과 커널 크기'], answer: 1,
        explain: '임계값을 낮추면 검출률이 오르지만 과검도 늡니다. 정답이 있는 샘플 세트로 둘을 함께 재고, <b>양품이 OK 로 나오는지</b>도 반드시 시험합니다(예제 5 의 metal_ok · pcb_golden, 실습 2).' }
    ],
    slides: [
      { layout: 'title', title: '결함 검사와 프로그램 완성', subtitle: '3교시 — 골든 비교 · 평가 · 일괄 검사와 리포트 · 강좌 정리', notes: '<p>강좌의 마지막 교시입니다. 💬 “1 · 2교시 검사로 긁힘을 찾을 수 있을까?” — 어디에 어떤 모양으로 생길지 모르니 규칙을 쓸 수 없다 → 양품과 비교한다. (3분)</p>' },
      { layout: 'diagram', title: '골든 비교 파이프라인', html: FIG_GOLDEN, caption: 'absdiff → 블러 → threshold → 닫기 → findContours → 결함 상자', notes: '<p>각 단계를 한 문장으로: 차이 구하기 · 잡음 줄이기 · 큰 차이만 남기기 · 조각 잇기 · 덩어리 찾기. 전제 조건(정렬)을 반드시 강조하세요. (4분)</p>' },
      { layout: 'image', title: 'metal_scratch.png — 결함 4개', src: 'images/metal_scratch.png', caption: '헤어라인 금속: 긁힘 2(S1 밝은 곡선 · S2 어두운 직선) · 얼룩 ST · 찍힘 D1', notes: '<p>💬 “결함 4개를 모두 찾아보세요” — 눈으로도 S2 와 얼룩은 찾기 어렵습니다. 그래서 차이가 10~20 밖에 안 되고, 임계값을 낮게 잡아야 한다는 점으로 연결합니다. (3분)</p>' },
      { layout: 'code', title: '차영상으로 결함 찾기', run: false, code: `Mat diff, smooth, bin;
absdiff(golden, test, diff);                    // |골든 − 검사|
GaussianBlur(diff, smooth, Size(5, 5), 0);      // 잡음 평탄화
threshold(smooth, bin, 10, 255, THRESH_BINARY); // 낮은 임계값!
morphologyEx(bin, bin, MORPH_CLOSE,
             getStructuringElement(MORPH_ELLIPSE, Size(21, 21)));

vector<vector<Point>> contours;
findContours(bin, contours, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
vector<Rect> defects;
for (const auto& c : contours)
    if (contourArea(c) >= 80) defects.push_back(boundingRect(c));
// → 4개: (109,94) · (173,343) · (427,304) · (470,80)`, points: ['차이 최대 58 → 임계값 <b>10</b> (PCB 는 30)', 'Close 21×21: 가는 긁힘 조각 잇기', '면적 필터로 남은 잡음 제거'], notes: '<p>학생들이 예제 1 을 실행합니다. <code>diff x5</code> 창에서 결함이 희미하게 보이는 것을 확인하고, 임계값을 5 · 20 으로 바꿔 보게 합니다. (6분)</p>' },
      { layout: 'code', title: '정답과 대조하기 — Rect 교집합', run: false, code: `struct Truth { string name; Rect box; };
vector<Truth> truth = {
    { "D1 극성 반대",   Rect(120, 502, 60, 36) },
    { "U1 솔더 브리지", Rect(234, 252, 32, 16) },
    { "R3 부품 누락",   Rect(300, 380, 60, 40) },
    { "C2 이동·회전",   Rect(600, 375, 65, 45) },
};
int hit = 0;
for (const Truth& t : truth)
{
    bool detected = false;
    for (const Rect& f : found)
        if ((f & t.box).area() > 0) detected = true;   // & = 교집합
    if (detected) hit++;
}
// 검출률 4 / 4 · 오검출 0개`, points: ['<b>검출률</b> = 찾은 정답 / 전체 정답', '<b>오검출</b> = 정답과 겹치지 않는 검출', '<code>a &amp; b</code>: 두 Rect 의 교집합'], notes: '<p>“개수가 맞으면 성공?” 이라는 오개념을 여기서 바로잡습니다 — 위치가 맞아야 한다. 정답 세트가 없으면 알고리즘을 평가할 수 없다는 점을 강조하세요. (5분)</p>' },
      { layout: 'two', title: '골든이 없을 때', left: { title: '직물 (주기 16 px)', bullets: ['위 · 아래로 16 px 민 영상 = 골든', '<code>cv::min(d1, d2)</code>: 두 방향 모두 달라야 결함', '→ F2 매듭 · F1 끊어진 씨실'] }, right: { title: 'LCD (가는 결함)', bullets: ['<code>medianBlur(5)</code> = 결함만 지운 골든', '→ 꺼진 라인 x=173 · 휘점 2×2', '넓은 무라(−5%)는 못 찾음 → 배경 추정'] }, notes: '<p>“기준 영상을 스스로 만든다” 는 발상을 전합니다. 예제 3 을 실행하고, 한 방향 차이만 쓰면 결함이 두 번 나오는 이유를 그림으로 설명하세요. (4분)</p>' },
      { layout: 'code', title: 'DefectInspector — 골든은 생성자로', file: 'DefectInspector.h', run: false, code: `class DefectInspector : public Inspector
{
public:
    double diffThreshold = 10;
    int closeSize = 21;
    double minArea = 80;

    explicit DefectInspector(const cv::Mat& golden) : golden_(toGray(golden)) {}
    std::string name() const override { return "결함 검사"; }

    InspectionResult inspect(const cv::Mat& img) override
    {
        cv::Mat gray = toGray(img);
        if (gray.size() != golden_.size())
            throw std::invalid_argument("골든과 크기가 다릅니다");
        // absdiff → 블러 → threshold → 닫기 → 윤곽선 → defects …
    }

private:
    cv::Mat golden_;            // 설정: 한 번만 받아 둔다
};`, points: ['<code>inspect(img)</code> 모양이 다른 검사기와 같다', '<code>explicit</code>: Mat → 검사기 몰래 변환 금지', '사용 오류는 <code>throw invalid_argument</code>'], notes: '<p>C# 판(<code>Inspect(image, golden)</code> + <code>NeedsGolden</code>)과 비교해 “무엇을 인수로, 무엇을 멤버로?” 를 토론합니다 — 매번 바뀌는 것은 인수, 제품이 바뀌기 전까지 그대로인 것은 멤버. 예제 4 를 실행해 크기가 다른 PCB 를 넣었을 때의 예외 메시지를 확인합니다. (5분)</p>' },
      { layout: 'diagram', title: '일괄 검사와 기록', html: FIG_BATCH, caption: 'jobs 반복 → inspect(가상 함수) → 화면 표 · report.csv · NG 이미지', notes: '<p>소유(unique_ptr 목록)와 가리킴(Job 의 Inspector*)을 구분해 설명합니다. 💬 “같은 CountInspector 인데 왜 객체가 두 개?” — 기대 개수(레시피)가 다르다. (4분)</p>' },
      { layout: 'code', title: '일괄 검사 — 다형성 한 줄', file: 'main.cpp', run: false, code: `vector<unique_ptr<Inspector>> inspectors;     // 소유
auto metal = make_unique<DefectInspector>(imread("images/metal_ok.png", IMREAD_GRAYSCALE));
vector<Job> jobs = { { "metal_scratch.png", metal.get() }, /* … */ };
inspectors.push_back(std::move(metal));        // 주소는 그대로 → jobs 포인터 유효

ofstream csv("report.csv");
csv << "no,image,inspector,judge,values,defects" << "\\n";
for (const Job& job : jobs)
{
    Mat img = imread("images/" + job.file, IMREAD_UNCHANGED);
    InspectionResult r;
    try { r = job.inspector->inspect(img); }   // 가상 함수!
    catch (const exception& e) { /* ERROR 로 기록하고 계속 */ continue; }
    (r.ok ? okCount : ngCount)++;
    csv << no << "," << job.file << "," << (r.ok ? "OK" : "NG") /* … */ << "\\n";
    if (!r.ok) imwrite("NG_" + job.file, r.overlay);
}
// 총 7건 · OK 4 · NG 3 · 불량률 42.9%`, points: ['<code>job.inspector-&gt;inspect(img)</code> 가 세 종류를 모두 부른다', '예외가 나도 그 작업만 ERROR → 계속', '불량만 근거 이미지 저장'], notes: '<p>학생들이 예제 5 를 실행합니다(컴파일 15~20초). 📁 작업 폴더에 <code>report.csv</code> 와 <code>NG_*.png</code> 3장이 생긴 것을 확인하고 CSV 를 내려받아 열어 보게 합니다. (6분)</p>' },
      { layout: 'table', title: '강좌 전체 지도', head: ['Part', '핵심', '17차시에서 쓴 곳'], rows: [
        ['1. 준비 (00~02)', 'VS · OpenCV 설정 · 읽기/보기/저장', '프로젝트 · imwrite · 결과 창'],
        ['2. 기초 (03~11)', 'Mat · ROI · 그리기 · HSV · Otsu · 필터 · 모폴로지', '오버레이 · 포켓 ROI · 색 · 이진화 · 잡점'],
        ['3. 분석 (12~15)', '윤곽선 · watershed · 매칭 · 카메라', '개수 · 분리 · 결함 상자 · 정렬'],
        ['4. 응용 (16~17)', '클래스 설계 · 다형성 · 검사 프로그램', 'Inspector · 일괄 검사 · 리포트']
      ], notes: '<p>표 4(본문)를 요약한 것입니다. 학생들에게 “가장 어려웠던 차시” 와 “17차시에서 가장 많이 쓴 차시” 를 하나씩 말하게 하면 좋은 마무리가 됩니다. (4분)</p>' },
      { layout: 'bullets', title: '다음 학습', lead: '여기서 더 나아가려면', bullets: [
        '<b>저대비 결함</b>: 배경 추정(flat-field) · 정규화 — LCD 무라',
        '<b>딥러닝 검사</b>: 분류 · 이상 탐지 · 분할 → ONNX + OpenCV <code>dnn</code>',
        '<b>산업 카메라</b>: GigE / USB3 Vision · GenICam · 트리거 촬영',
        '<b>정밀 측정</b>: 서브픽셀 · 원 피팅 · 캘리브레이션 · px→mm',
        '<b>시스템</b>: 레시피 파일 · 이력 DB · PLC · 멀티스레드'
      ], notes: '<p>각 방향마다 이 강좌의 어느 부분이 기초가 되는지 짚어 줍니다(예: 딥러닝 검사도 전처리 · ROI · 결과 기록은 똑같다). 💬 “이 프로그램을 24시간 돌리려면?” — 트리거 · DB · 자동 복구 · 로그. (3분)</p>' },
      { layout: 'quiz', title: '확인 퀴즈', q: '골든 이미지 비교의 가장 중요한 전제는?', options: ['골든이 더 밝아야 한다', '두 영상이 <b>픽셀 단위로 정렬</b>', '채널 수가 달라야 한다', '결함이 어두워야 한다'], answer: 1, explain: '1~2 px 만 어긋나도 경계 전체가 결함으로 나온다 → 지그 고정 또는 피듀셜 정렬 후 비교.', notes: '<p>정답 2번. “정렬하려면 어느 차시의 기술?” — 14차시 템플릿 매칭 + 11차시 warpAffine. (2분)</p>' },
      { layout: 'practice', title: '실습: 새 검사기 BlisterInspector', desc: '<p>2교시 블리스터 검사를 <code>Inspector</code> 를 상속한 클래스로 만드세요.</p><ul><li><code>BlisterInspector.h</code> 하나만 완성</li><li>불량 포켓 → <code>r.defects</code></li><li>정답: 불량 3곳 → NG</li></ul>', starter: join(BASE, `// ===== File: BlisterInspector.h =====
#pragma once
#include "Inspector.h"

// 블리스터 포장: 2 x 5 포켓마다 ROI 를 잘라 빈 포켓 · 색 불량 · 깨짐 판정
class BlisterInspector : public Inspector
{
public:
    int normalPill = 2400;       // 정상 알약의 흰 픽셀 수
    int emptyLimit = 500;
    double brokenRatio = 0.8;

    std::string name() const override { return "블리스터"; }

    InspectionResult inspect(const cv::Mat& img) override
    {
        using namespace cv;
        Mat hsv;
        cvtColor(toBgr(img), hsv, COLOR_BGR2HSV);
        InspectionResult r;
        r.inspector = name();
        r.overlay = toBgr(img);
        for (int row = 0; row < 2; row++)
            for (int col = 0; col < 5; col++)
            {
                Rect roi(120 + 100 * col - 38, 170 + 140 * row - 38, 76, 76);
                // TODO: ① hsv(roi) 에서 흰 픽셀(0,0,150 ~ 179,70,255) · 주황 픽셀(5,90,90 ~ 25,255,255) 수를 센다
                //       ② 빈 포켓 · 색 불량 · 깨짐 중 하나라도 해당하면 r.defects.push_back(roi)
                //       ③ 불량은 빨강, 정상은 초록 사각형
            }
        r.values.push_back({ "pockets", 10 });
        r.values.push_back({ "ng", (double)r.defects.size() });
        // TODO: 판정 r.ok 를 정하고 putJudge 로 띠를 그리세요
        return r;
    }
};

// ===== File: main.cpp =====
#include "BlisterInspector.h"
#include <iostream>
#include <memory>
using namespace cv;
using namespace std;

int main()
{
    unique_ptr<Inspector> inspector = make_unique<BlisterInspector>();   // 부모 포인터로 다룬다
    InspectionResult r = inspector->inspect(imread("images/blister_pack.png"));
    r.image = "blister_pack.png";
    cout << r.summary() << endl;
    for (const Rect& d : r.defects)
        cout << "  불량 포켓 " << d << endl;
    imshow("blister", r.overlay);
    waitKey(0);
    return 0;
}`), solution: join(BASE, `// ===== File: BlisterInspector.h =====
#pragma once
#include "Inspector.h"

// 블리스터 포장: 2 x 5 포켓마다 ROI 를 잘라 빈 포켓 · 색 불량 · 깨짐 판정
class BlisterInspector : public Inspector
{
public:
    int normalPill = 2400;       // 정상 알약의 흰 픽셀 수
    int emptyLimit = 500;
    double brokenRatio = 0.8;

    std::string name() const override { return "블리스터"; }

    InspectionResult inspect(const cv::Mat& img) override
    {
        using namespace cv;
        Mat hsv;
        cvtColor(toBgr(img), hsv, COLOR_BGR2HSV);
        InspectionResult r;
        r.inspector = name();
        r.overlay = toBgr(img);
        for (int row = 0; row < 2; row++)
            for (int col = 0; col < 5; col++)
            {
                Rect roi(120 + 100 * col - 38, 170 + 140 * row - 38, 76, 76);
                Mat white, orange;
                inRange(hsv(roi), Scalar(0, 0, 150), Scalar(179, 70, 255), white);
                inRange(hsv(roi), Scalar(5, 90, 90), Scalar(25, 255, 255), orange);
                int wa = countNonZero(white), oa = countNonZero(orange);
                bool bad = (wa < emptyLimit && oa < emptyLimit) || oa > wa || wa < normalPill * brokenRatio;
                if (bad) r.defects.push_back(roi);
                rectangle(r.overlay, roi, bad ? Scalar(0, 0, 255) : Scalar(0, 200, 0), 2);
            }
        r.values.push_back({ "pockets", 10 });
        r.values.push_back({ "ng", (double)r.defects.size() });
        r.ok = r.defects.empty();
        putJudge(r.overlay, r.ok);
        return r;
    }
};

// ===== File: main.cpp =====
#include "BlisterInspector.h"
#include <iostream>
#include <memory>
using namespace cv;
using namespace std;

int main()
{
    unique_ptr<Inspector> inspector = make_unique<BlisterInspector>();   // 부모 포인터로 다룬다
    InspectionResult r = inspector->inspect(imread("images/blister_pack.png"));
    r.image = "blister_pack.png";
    cout << r.summary() << endl;
    for (const Rect& d : r.defects)
        cout << "  불량 포켓 " << d << endl;
    imshow("blister", r.overlay);
    waitKey(0);
    return 0;
}`), notes: '<p>“검사기 추가 = 클래스 하나” 를 직접 체험하는 캡스톤 실습입니다. 빨리 끝난 팀은 예제 5 의 <code>jobs</code> 에 추가해 일괄 검사 결과가 8건이 되게 하고, 완성 프로젝트(<code>vs/Ch17_Inspection</code>)에도 옮겨 보게 합니다. (10분)</p>' },
      { layout: 'summary', title: '17차시 · 강좌 정리', bullets: [
        '골든 비교: <b>absdiff → 블러 → 임계 → 닫기 → 윤곽선</b> (전제: 정렬)',
        '평가는 <b>정답 세트</b>로 검출률 · 오검출 — 양품이 OK 인지도 시험',
        '골든 · 임계값은 검사기의 <b>설정(레시피)</b> → 생성자 · 멤버',
        '<code>vector&lt;unique_ptr&lt;Inspector&gt;&gt;</code> + 가상 함수 → 일괄 검사 · CSV · NG 이미지',
        '완성: <code>vs/Ch17_Inspection</code> — 검사기 추가 = 클래스 하나 + 한 줄',
        'OpenCV 5 + C++ 로 “판정하고 근거를 남기는” 프로그램을 끝까지 만들었다 🎉'
      ], notes: '<p>강좌를 마칩니다. 처음 00차시에서 washers 가 11개로 세어졌던 것을 떠올리게 하고, 이제는 그 이유를 설명하고 해결(분리 · 붙음 의심)할 수 있게 되었다는 점을 짚어 성장을 확인시킵니다. 평가 루브릭(교사용)에 따라 팀 프로젝트 과제를 안내합니다. (3분)</p>' }
    ]
  };

  CV_COURSE.addChapter({
    id: 'cv17', no: '17', title: '실전 검사 프로젝트: 개수 세기 · 색 분류 · 결함 검사', subtitle: '판정 · 오버레이 · 리포트를 갖춘 C++ 검사 프로그램 만들기 (캡스톤)',
    summary: '강좌의 마무리 프로젝트입니다. 검사 결과(<code>InspectionResult</code>)와 검사기 인터페이스(<code>Inspector</code> 추상 클래스)를 설계하고, <b>개수 세기</b>(Otsu · 윤곽선 · 붙음 의심 · watershed · 격자 대조) · <b>색 분류</b>(HSV · 데이터로 분리한 색 정의 · 격자 ROI · 병 라인) · <b>결함 검사</b>(골든 이미지 차영상 · 정답 대조 평가) 세 검사기를 만든 뒤, <code>vector&lt;unique_ptr&lt;Inspector&gt;&gt;</code> 로 여러 이미지를 <b>일괄 검사</b>해 판정 표 · CSV 리포트(<code>ofstream</code>) · NG 근거 이미지(<code>imwrite</code>)를 남깁니다. 완성 프로그램은 Visual Studio 프로젝트 <code>vs/Ch17_Inspection</code> 입니다.',
    goals: ['검사 결과 구조체와 추상 클래스 인터페이스를 설계하고 .h/.cpp 로 나눈 검사 프로그램을 만들 수 있다', '이진화 · HSV · 차영상으로 개수 · 색 · 결함을 판정하고, 정답 세트로 검출률 · 오검출을 평가할 수 있다', '여러 검사를 일괄 실행해 오버레이 · CSV · 요약으로 판정의 근거를 남길 수 있다'],
    vs: 'Ch17_Inspection',
    sections: [SEC1, SEC2, SEC3]
  });
})();
