/* 08차시 필터링: 블러 · 샤프닝 · 잡음 제거 */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 커널이 이미지 위를 미끄러진다 (컨볼루션)
  const FIG_CONV = `<svg viewBox="0 0 760 330" role="img" aria-label="3x3 커널이 입력 이미지 위를 한 칸씩 미끄러지며 출력 픽셀 하나를 만드는 컨볼루션 과정">
  ${ARROW('c08a1')}
  <text x="125" y="24" text-anchor="middle" class="tx-b">입력 이미지 (CV_8UC1)</text>
  <rect x="20" y="36" width="210" height="210" rx="4" class="p1s"/>
  ${[66, 96, 126, 156, 186, 216].map((y) => `<line x1="20" y1="${y}" x2="230" y2="${y}" class="ln"/>`).join('')}
  ${[50, 80, 110, 140, 170, 200].map((x) => `<line x1="${x}" y1="36" x2="${x}" y2="246" class="ln"/>`).join('')}
  <rect x="80" y="96" width="90" height="90" rx="3" class="p3s"/>
  <rect x="80" y="96" width="90" height="90" rx="3" class="s3" fill="none" stroke-width="3"/>
  <text x="95" y="120" text-anchor="middle" class="tx-m">60</text><text x="125" y="120" text-anchor="middle" class="tx-m">62</text><text x="155" y="120" text-anchor="middle" class="tx-m">70</text>
  <text x="95" y="150" text-anchor="middle" class="tx-m">61</text><text x="125" y="150" text-anchor="middle" class="tx-b">90</text><text x="155" y="150" text-anchor="middle" class="tx-m">72</text>
  <text x="95" y="180" text-anchor="middle" class="tx-m">59</text><text x="125" y="180" text-anchor="middle" class="tx-m">63</text><text x="155" y="180" text-anchor="middle" class="tx-m">71</text>
  <text x="125" y="272" text-anchor="middle" class="tx-m">3×3 이웃 (앵커 = 가운데, 행 y · 열 x)</text>
  <text x="125" y="292" text-anchor="middle" class="tx-m">→ 오른쪽으로 한 칸, 끝나면 아래 행으로</text>
  <text x="380" y="24" text-anchor="middle" class="tx-b">커널 (3×3 평균)</text>
  <rect x="320" y="96" width="120" height="90" rx="4" class="p2s"/>
  <line x1="320" y1="126" x2="440" y2="126" class="ln"/><line x1="320" y1="156" x2="440" y2="156" class="ln"/>
  <line x1="360" y1="96" x2="360" y2="186" class="ln"/><line x1="400" y1="96" x2="400" y2="186" class="ln"/>
  ${[120, 150, 180].map((y) => [340, 380, 420].map((x) => `<text x="${x}" y="${y}" text-anchor="middle" class="tx-m">1/9</text>`).join('')).join('')}
  <text x="380" y="212" text-anchor="middle" class="tx-m">가중치 합 = 1</text>
  <text x="380" y="232" text-anchor="middle" class="tx-m">Mat_&lt;float&gt;(3,3) 로 만든다</text>
  <text x="270" y="146" text-anchor="middle" class="tx-b">⊛</text>
  <line x1="450" y1="140" x2="520" y2="140" class="ln" stroke-width="2" marker-end="url(#c08a1)"/>
  <text x="485" y="128" text-anchor="middle" class="tx-m">곱해서 더함</text>
  <text x="640" y="24" text-anchor="middle" class="tx-b">출력 이미지 dst</text>
  <rect x="535" y="36" width="210" height="210" rx="4" class="p4s"/>
  ${[66, 96, 126, 156, 186, 216].map((y) => `<line x1="535" y1="${y}" x2="745" y2="${y}" class="ln"/>`).join('')}
  ${[565, 595, 625, 655, 685, 715].map((x) => `<line x1="${x}" y1="36" x2="${x}" y2="246" class="ln"/>`).join('')}
  <rect x="595" y="126" width="30" height="30" class="p5"/>
  <text x="640" y="150" class="tx-b">= 68</text>
  <text x="640" y="272" text-anchor="middle" class="tx-m">(60+62+70+61+90+72+59+63+71) / 9 = 67.6 → 68</text>
  <text x="640" y="292" text-anchor="middle" class="tx-m">가운데 값 90 이 주변에 묻혀 사라진다 = 블러</text>
</svg>`;

  // 그림 2: 행 포인터 3개로 3x3 평균을 직접 계산 (C++ 반복문)
  const FIG_PTR = `<svg viewBox="0 0 760 290" role="img" aria-label="copyMakeBorder 로 테두리를 붙인 뒤 위 · 가운데 · 아래 행 포인터 세 개로 3x3 합을 구하는 구조">
  ${ARROW('c08a4')}
  <text x="20" y="24" class="tx-b">① copyMakeBorder(src, pad, 1, 1, 1, 1, BORDER_REFLECT_101)</text>
  <rect x="20" y="40" width="300" height="200" rx="6" class="p5s"/>
  <rect x="40" y="60" width="260" height="160" rx="4" class="p1s"/>
  <text x="170" y="144" text-anchor="middle" class="tx-m">src (rows × cols)</text>
  <text x="170" y="236" text-anchor="middle" class="tx-m">pad = (rows+2) × (cols+2) · 바깥 1 픽셀 = 거울</text>
  <rect x="100" y="80" width="60" height="20" class="p3s"/><rect x="100" y="100" width="60" height="20" class="p3s"/><rect x="100" y="120" width="60" height="20" class="p3s"/>
  <rect x="100" y="80" width="60" height="60" class="s3" fill="none" stroke-width="2"/>
  <text x="400" y="24" class="tx-b">② 한 행씩: 포인터 3개 + 출력 포인터 1개</text>
  <rect x="400" y="46" width="330" height="30" rx="4" class="p3s"/><text x="410" y="66" class="tx">const uchar* up  = pad.ptr&lt;uchar&gt;(y);</text>
  <rect x="400" y="82" width="330" height="30" rx="4" class="p3s"/><text x="410" y="102" class="tx">const uchar* mid = pad.ptr&lt;uchar&gt;(y + 1);</text>
  <rect x="400" y="118" width="330" height="30" rx="4" class="p3s"/><text x="410" y="138" class="tx">const uchar* dn  = pad.ptr&lt;uchar&gt;(y + 2);</text>
  <rect x="400" y="154" width="330" height="30" rx="4" class="p4s"/><text x="410" y="174" class="tx">uchar* out = dst.ptr&lt;uchar&gt;(y);</text>
  <line x1="162" y1="110" x2="396" y2="100" class="ln" stroke-width="2" marker-end="url(#c08a4)"/>
  <text x="565" y="212" text-anchor="middle" class="tx-m">x 마다 up[x..x+2] + mid[x..x+2] + dn[x..x+2] → 9개 합</text>
  <text x="565" y="234" text-anchor="middle" class="tx-b">out[x] = saturate_cast&lt;uchar&gt;(sum / 9.0)</text>
  <text x="380" y="272" text-anchor="middle" class="tx-m">at&lt;uchar&gt;(y, x) 를 9번 부르는 대신 행 시작 주소를 한 번 구해 두고 배열처럼 읽는다 — 빠르고 C++ 다운 방법</text>
</svg>`;

  // 그림 3: 평균 커널 vs 가우시안 커널 가중치
  const FIG_KERNEL2 = `<svg viewBox="0 0 700 250" role="img" aria-label="평균 커널은 모든 이웃을 똑같이, 가우시안 커널은 가운데에 큰 가중치를 준다">
  <text x="130" y="26" text-anchor="middle" class="tx-b">평균(Box) 커널 5×5</text>
  <rect x="40" y="40" width="180" height="90" rx="4" class="p2s"/>
  <text x="130" y="72" text-anchor="middle" class="tx-m">모든 칸 = 1/25</text>
  <text x="130" y="100" text-anchor="middle" class="tx-m">멀리 있는 픽셀도 똑같이 반영</text>
  <rect x="40" y="150" width="180" height="60" rx="4" class="p2s"/>
  <rect x="40" y="150" width="180" height="60" class="s2" fill="none" stroke-width="2"/>
  <text x="130" y="186" text-anchor="middle" class="tx-m">가중치 단면 = 평평한 사각</text>
  <text x="130" y="232" text-anchor="middle" class="tx-m">빠르지만 네모난 번짐 · 링잉</text>
  <text x="470" y="26" text-anchor="middle" class="tx-b">가우시안 커널 5×5 (σ≈1, 정수 근사)</text>
  <rect x="380" y="40" width="180" height="90" rx="4" class="p3s"/>
  <text x="470" y="66" text-anchor="middle" class="tx-m">1  4  6  4  1</text>
  <text x="470" y="88" text-anchor="middle" class="tx-m">4 16 24 16  4</text>
  <text x="470" y="110" text-anchor="middle" class="tx-m">6 24 <tspan class="tx-b">36</tspan> 24  6  (÷256)</text>
  <path d="M380,210 C410,210 425,205 440,185 C455,160 460,152 470,152 C480,152 485,160 500,185 C515,205 530,210 560,210" class="s3" fill="none" stroke-width="2"/>
  <line x1="380" y1="210" x2="560" y2="210" class="ax"/>
  <text x="470" y="232" text-anchor="middle" class="tx-m">종 모양 → 부드럽고 자연스러운 번짐</text>
  <text x="300" y="120" text-anchor="middle" class="tx-b">vs</text>
  <text x="630" y="80" text-anchor="middle" class="tx-m">= 1D 커널</text>
  <text x="630" y="100" text-anchor="middle" class="tx-m">× 1D 커널ᵀ</text>
  <text x="630" y="120" text-anchor="middle" class="tx-m">(분리 가능)</text>
</svg>`;

  // 그림 4: 경계 처리 (BorderTypes)
  const FIG_BORDER = `<svg viewBox="0 0 700 220" role="img" aria-label="이미지 경계 밖의 값을 만드는 네 가지 방법">
  <text x="350" y="22" text-anchor="middle" class="tx-b">원본 한 줄: 10 20 30 40 50 — 왼쪽 2칸을 어떻게 채울까?</text>
  <text x="20" y="62" class="tx">CONSTANT</text>
  <rect x="150" y="44" width="60" height="26" class="p5s"/><text x="180" y="62" text-anchor="middle" class="tx-m">0  0</text>
  <rect x="210" y="44" width="150" height="26" class="p1s"/><text x="285" y="62" text-anchor="middle" class="tx-m">10 20 30 40 50</text>
  <text x="400" y="62" class="tx-m">밖은 0 (검정)으로 채움</text>
  <text x="20" y="100" class="tx">REPLICATE</text>
  <rect x="150" y="82" width="60" height="26" class="p5s"/><text x="180" y="100" text-anchor="middle" class="tx-m">10 10</text>
  <rect x="210" y="82" width="150" height="26" class="p1s"/><text x="285" y="100" text-anchor="middle" class="tx-m">10 20 30 40 50</text>
  <text x="400" y="100" class="tx-m">맨 끝 값을 그대로 늘림</text>
  <text x="20" y="138" class="tx">REFLECT</text>
  <rect x="150" y="120" width="60" height="26" class="p5s"/><text x="180" y="138" text-anchor="middle" class="tx-m">20 10</text>
  <rect x="210" y="120" width="150" height="26" class="p1s"/><text x="285" y="138" text-anchor="middle" class="tx-m">10 20 30 40 50</text>
  <text x="400" y="138" class="tx-m">거울 (맨 끝 값도 반복)</text>
  <text x="20" y="176" class="tx">REFLECT_101</text>
  <rect x="150" y="158" width="60" height="26" class="p3s"/><text x="180" y="176" text-anchor="middle" class="tx-m">30 20</text>
  <rect x="210" y="158" width="150" height="26" class="p1s"/><text x="285" y="176" text-anchor="middle" class="tx-m">10 20 30 40 50</text>
  <text x="400" y="176" class="tx-b">BORDER_DEFAULT — 맨 끝 값은 빼고 거울</text>
  <text x="350" y="208" text-anchor="middle" class="tx-m">필터는 이미지 밖의 픽셀이 필요하므로 규칙(BORDER_*)을 정해야 한다</text>
</svg>`;

  // 그림 5: 가우시안 잡음 vs 소금-후추(임펄스) 잡음
  const FIG_NOISE = `<svg viewBox="0 0 700 280" role="img" aria-label="가우시안 잡음은 모든 픽셀이 조금씩 흔들리고 임펄스 잡음은 일부 픽셀만 0 또는 255 로 튄다">
  <text x="175" y="24" text-anchor="middle" class="tx-b">가우시안 잡음 (센서 잡음)</text>
  <line x1="40" y1="150" x2="320" y2="150" class="ax"/>
  <path d="M40,110 L60,116 L80,104 L100,113 L120,106 L140,115 L160,108 L180,112 L200,104 L220,114 L240,107 L260,111 L280,105 L300,113 L320,108" class="s1" fill="none" stroke-width="2"/>
  <line x1="40" y1="110" x2="320" y2="110" class="ln" stroke-dasharray="4 3"/>
  <text x="332" y="114" class="tx-m">참값</text>
  <text x="175" y="176" text-anchor="middle" class="tx-m">모든 픽셀이 참값 주변에서 ±σ 만큼 흔들린다</text>
  <text x="175" y="200" text-anchor="middle" class="tx-m">평균을 내면 상쇄된다 → <tspan class="tx-b">GaussianBlur · blur</tspan> 가 효과적</text>
  <text x="175" y="228" text-anchor="middle" class="tx-m">gradient_noise.png (σ=15)</text>
  <line x1="350" y1="30" x2="350" y2="250" class="ln" stroke-dasharray="4 4"/>
  <text x="525" y="24" text-anchor="middle" class="tx-b">임펄스(소금-후추) 잡음</text>
  <line x1="390" y1="150" x2="670" y2="150" class="ax"/>
  <path d="M390,110 L670,110" class="s1" fill="none" stroke-width="2"/>
  <line x1="450" y1="110" x2="450" y2="46" class="s5" stroke-width="3"/><circle cx="450" cy="46" r="4" class="p5"/>
  <line x1="530" y1="110" x2="530" y2="148" class="s5" stroke-width="3"/><circle cx="530" cy="148" r="4" class="p5"/>
  <line x1="610" y1="110" x2="610" y2="46" class="s5" stroke-width="3"/><circle cx="610" cy="46" r="4" class="p5"/>
  <text x="462" y="42" class="tx-m">255 (소금)</text>
  <text x="542" y="164" class="tx-m">0 (후추)</text>
  <text x="525" y="176" text-anchor="middle" class="tx-m">대부분은 정확하고 일부만 끝값으로 튄다</text>
  <text x="525" y="200" text-anchor="middle" class="tx-m">평균은 튄 값에 끌려간다 → <tspan class="tx-b">medianBlur</tspan> 가 정답</text>
  <text x="525" y="228" text-anchor="middle" class="tx-m">salt_pepper.png (소금 4% + 후추 4%)</text>
</svg>`;

  // 그림 6: 중간값 필터는 정렬해서 가운데를 고른다
  const FIG_MEDIAN = `<svg viewBox="0 0 720 250" role="img" aria-label="3x3 이웃의 값을 정렬해 가운데 값을 고르는 중간값 필터와 평균 필터의 비교">
  <text x="90" y="24" text-anchor="middle" class="tx-b">3×3 이웃</text>
  <rect x="30" y="36" width="120" height="90" rx="4" class="p1s"/>
  <line x1="30" y1="66" x2="150" y2="66" class="ln"/><line x1="30" y1="96" x2="150" y2="96" class="ln"/>
  <line x1="70" y1="36" x2="70" y2="126" class="ln"/><line x1="110" y1="36" x2="110" y2="126" class="ln"/>
  <text x="50" y="60" text-anchor="middle" class="tx-m">62</text><text x="90" y="60" text-anchor="middle" class="tx-m">61</text><text x="130" y="60" text-anchor="middle" class="tx-m">63</text>
  <text x="50" y="90" text-anchor="middle" class="tx-m">60</text><text x="90" y="90" text-anchor="middle" class="tx-b">255</text><text x="130" y="90" text-anchor="middle" class="tx-m">64</text>
  <text x="50" y="120" text-anchor="middle" class="tx-m">59</text><text x="90" y="120" text-anchor="middle" class="tx-m">62</text><text x="130" y="120" text-anchor="middle" class="tx-m">61</text>
  <text x="90" y="148" text-anchor="middle" class="tx-m">가운데가 소금 잡음</text>
  <text x="380" y="24" text-anchor="middle" class="tx-b">9개를 크기 순으로 정렬 (std::nth_element)</text>
  <rect x="200" y="46" width="360" height="30" rx="4" class="p3s"/>
  <text x="380" y="66" text-anchor="middle" class="tx">59 60 61 61 <tspan class="tx-b">62</tspan> 62 63 64 255</text>
  <line x1="380" y1="80" x2="380" y2="104" class="ln" stroke-width="2"/>
  <text x="380" y="122" text-anchor="middle" class="tx-b">5번째 = 중간값 62 → 잡음 완전히 사라짐</text>
  <rect x="200" y="140" width="360" height="30" rx="4" class="p5s"/>
  <text x="380" y="160" text-anchor="middle" class="tx">평균 = (59+…+255)/9 = <tspan class="tx-b">83</tspan> → 잡음이 번져 남음</text>
  <text x="380" y="196" text-anchor="middle" class="tx-m">중간값은 튄 값 하나에 끌려가지 않는다 (비선형 필터)</text>
  <text x="380" y="220" text-anchor="middle" class="tx-m">단, 커널이 크면 가는 선 · 작은 점이 지워질 수 있다</text>
  <text x="640" y="66" text-anchor="middle" class="tx-m">medianBlur</text>
  <text x="640" y="160" text-anchor="middle" class="tx-m">blur</text>
</svg>`;

  // 그림 7: 양방향 필터 (에지 보존)
  const FIG_BILATERAL = `<svg viewBox="0 0 700 250" role="img" aria-label="가우시안 필터는 에지를 흐리게 만들고 양방향 필터는 밝기 차가 큰 이웃을 무시해 에지를 남긴다">
  <text x="350" y="22" text-anchor="middle" class="tx-b">밝은 면과 어두운 면이 만나는 에지에서</text>
  <text x="115" y="50" text-anchor="middle" class="tx">원본</text>
  <path d="M40,120 L110,120 L110,70 L190,70" class="s1" fill="none" stroke-width="3"/>
  <line x1="40" y1="130" x2="190" y2="130" class="ax"/>
  <text x="115" y="152" text-anchor="middle" class="tx-m">계단처럼 뚝 바뀜</text>
  <text x="115" y="176" text-anchor="middle" class="tx-m">여기에 잡음이 조금 섞여 있다</text>
  <text x="350" y="50" text-anchor="middle" class="tx">GaussianBlur</text>
  <path d="M275,120 C305,120 320,118 345,95 C370,72 395,70 425,70" class="s5" fill="none" stroke-width="3"/>
  <line x1="275" y1="130" x2="425" y2="130" class="ax"/>
  <text x="350" y="152" text-anchor="middle" class="tx-m">잡음도 줄지만 에지도 뭉개짐</text>
  <text x="350" y="176" text-anchor="middle" class="tx-m">거리만 보고 섞기 때문</text>
  <text x="585" y="50" text-anchor="middle" class="tx">bilateralFilter</text>
  <path d="M510,120 L578,120 L578,70 L660,70" class="s3" fill="none" stroke-width="3"/>
  <line x1="510" y1="130" x2="660" y2="130" class="ax"/>
  <text x="585" y="152" text-anchor="middle" class="tx-m">에지는 그대로, 면만 매끈해짐</text>
  <text x="585" y="176" text-anchor="middle" class="tx-m">거리 + <tspan class="tx-b">밝기 차</tspan> 를 함께 본다</text>
  <text x="350" y="212" text-anchor="middle" class="tx-m">가중치 = (거리 가우시안 sigmaSpace) × (밝기 차 가우시안 sigmaColor)</text>
  <text x="350" y="236" text-anchor="middle" class="tx-m">밝기가 많이 다른 이웃은 가중치가 0 에 가까워져 섞이지 않는다 — 대신 느리다</text>
</svg>`;

  // 그림 8: 언샤프 마스크
  const FIG_UNSHARP = `<svg viewBox="0 0 740 200" role="img" aria-label="원본에서 블러를 빼서 얻은 세부를 원본에 더하는 언샤프 마스크">
  ${ARROW('c08a2')}
  <rect x="20" y="60" width="120" height="60" rx="8" class="p1s"/><text x="80" y="86" text-anchor="middle" class="tx-b">원본</text><text x="80" y="106" text-anchor="middle" class="tx-m">src</text>
  <rect x="200" y="20" width="130" height="60" rx="8" class="p2s"/><text x="265" y="46" text-anchor="middle" class="tx">GaussianBlur</text><text x="265" y="66" text-anchor="middle" class="tx-m">blur (저주파)</text>
  <rect x="200" y="110" width="130" height="60" rx="8" class="p3s"/><text x="265" y="136" text-anchor="middle" class="tx">src − blur</text><text x="265" y="156" text-anchor="middle" class="tx-m">세부 · 에지 (고주파)</text>
  <line x1="142" y1="80" x2="196" y2="55" class="ln" stroke-width="2" marker-end="url(#c08a2)"/>
  <line x1="142" y1="100" x2="196" y2="135" class="ln" stroke-width="2" marker-end="url(#c08a2)"/>
  <rect x="400" y="60" width="190" height="60" rx="8" class="p4s"/><text x="495" y="86" text-anchor="middle" class="tx-b">src + k × 세부</text><text x="495" y="106" text-anchor="middle" class="tx-m">addWeighted(src, 1+k, blur, −k, 0, dst)</text>
  <line x1="334" y1="50" x2="396" y2="78" class="ln" stroke-width="2" marker-end="url(#c08a2)"/>
  <line x1="334" y1="140" x2="396" y2="102" class="ln" stroke-width="2" marker-end="url(#c08a2)"/>
  <rect x="624" y="60" width="100" height="60" rx="8" class="p5s"/><text x="674" y="86" text-anchor="middle" class="tx-b">선명해진</text><text x="674" y="106" text-anchor="middle" class="tx-b">결과</text>
  <line x1="592" y1="90" x2="620" y2="90" class="ln" stroke-width="2" marker-end="url(#c08a2)"/>
  <text x="370" y="190" text-anchor="middle" class="tx-m">k 가 크면 선명하지만 에지에 하얀 테두리(오버슈트)와 잡음까지 강조된다 — 보통 k = 0.5 ~ 1.5</text>
</svg>`;

  // ------------------------------------------------------------------ 1교시 예제
  const EX_CONV = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/gradient_clean.png", IMREAD_GRAYSCALE);
    // 원의 왼쪽 에지를 가로지르는 5x5 만 복사해(clone) 손으로 컨볼루션해 봅니다
    Mat roi = img(Rect(96, 148, 5, 5)).clone();
    cout << "원본 5x5 ROI:" << endl << roi << endl;

    int sum = 0;
    for (int dy = -1; dy <= 1; dy++)
        for (int dx = -1; dx <= 1; dx++)
            sum += roi.at<uchar>(2 + dy, 2 + dx);        // (행, 열) 순서
    cout << "가운데 3x3 합 = " << sum << format(", 평균 = %.2f", sum / 9.0) << endl;

    Mat blurred;
    blur(roi, blurred, Size(3, 3));
    cout << "blur 의 가운데 값 = " << (int)blurred.at<uchar>(2, 2) << endl;
    cout << "blur 결과 5x5:" << endl << blurred << endl;
    return 0;
}`;

  const EX_HANDMEAN = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

// 3x3 평균 필터를 직접 구현: 테두리를 붙이고 행 포인터 3개로 9개 합을 구한다
Mat myMean3x3(const Mat& src)
{
    CV_Assert(src.type() == CV_8UC1);
    Mat pad;
    copyMakeBorder(src, pad, 1, 1, 1, 1, BORDER_REFLECT_101);   // OpenCV 기본 경계 규칙

    Mat dst(src.size(), CV_8UC1);
    for (int y = 0; y < src.rows; y++)
    {
        const uchar* up  = pad.ptr<uchar>(y);        // pad 의 y 행 = src 의 y-1 행
        const uchar* mid = pad.ptr<uchar>(y + 1);
        const uchar* dn  = pad.ptr<uchar>(y + 2);
        uchar* out = dst.ptr<uchar>(y);
        for (int x = 0; x < src.cols; x++)
        {
            int s = up[x]  + up[x + 1]  + up[x + 2]
                  + mid[x] + mid[x + 1] + mid[x + 2]
                  + dn[x]  + dn[x + 1]  + dn[x + 2];
            out[x] = saturate_cast<uchar>(s / 9.0);  // 반올림 + 0~255 로 자르기
        }
    }
    return dst;
}

int main()
{
    Mat src = imread("images/gradient_noise.png", IMREAD_GRAYSCALE);
    Mat mine = myMean3x3(src);

    Mat ref, diff;
    blur(src, ref, Size(3, 3));                     // OpenCV 의 3x3 평균
    absdiff(mine, ref, diff);
    double maxDiff;
    minMaxLoc(diff, nullptr, &maxDiff);
    cout << "크기: " << src.cols << " x " << src.rows << endl;
    cout << "blur 와 다른 픽셀 수 = " << countNonZero(diff) << " / " << src.total() << endl;
    cout << "최대 차이 = " << maxDiff << endl;

    imshow("my mean 3x3", mine);
    imshow("blur 3x3", ref);
    waitKey(0);
    return 0;
}`;

  const EX_BLUR = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat noisy = imread("images/gradient_noise.png", IMREAD_GRAYSCALE);
    Mat clean = imread("images/gradient_clean.png", IMREAD_GRAYSCALE);
    cout << format("필터 없음         PSNR = %.2f dB", PSNR(clean, noisy)) << endl;

    Mat box, box2, gau, gau5;
    blur(noisy, box, Size(3, 3));                          // = boxFilter(normalize = true)
    cout << format("blur(3x3)         PSNR = %.2f dB", PSNR(clean, box)) << endl;

    boxFilter(noisy, box2, -1, Size(3, 3));                // ddepth -1 = 입력과 같은 깊이
    cout << format("boxFilter(3x3)    PSNR = %.2f dB  (blur 와 같다)", PSNR(clean, box2)) << endl;

    GaussianBlur(noisy, gau, Size(3, 3), 0);               // sigma 0 → ksize 로 자동 계산
    cout << format("GaussianBlur(3x3) PSNR = %.2f dB", PSNR(clean, gau)) << endl;

    GaussianBlur(noisy, gau5, Size(5, 5), 1.5);
    cout << format("GaussianBlur(5x5, sigma 1.5) PSNR = %.2f dB", PSNR(clean, gau5)) << endl;

    imshow("noisy", noisy);
    imshow("gaussian 5x5", gau5);
    waitKey(0);
    return 0;
}`;

  const EX_KSIZE = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

int main()
{
    Mat noisy = imread("images/gradient_noise.png", IMREAD_GRAYSCALE);
    Mat clean = imread("images/gradient_clean.png", IMREAD_GRAYSCALE);
    int sizes[] = { 3, 9, 21 };

    for (int k : sizes)                                   // 범위 기반 for
    {
        Mat dst;
        GaussianBlur(noisy, dst, Size(k, k), 0);
        Scalar m, sd;
        meanStdDev(dst, m, sd);
        cout << format("ksize %2dx%-2d PSNR %.2f dB, 표준편차 %.2f", k, k, PSNR(clean, dst), sd[0]) << endl;
        imshow("gaussian " + to_string(k), dst);
    }
    waitKey(0);
    return 0;
}`;

  const EX_GKERNEL = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    // ① 1D 가우시안 커널: ksize x 1 열 벡터 (CV_64F), 합 = 1
    Mat g = getGaussianKernel(5, 1.0, CV_64F);
    cout << "1D 커널 (5, sigma 1.0):";
    for (int i = 0; i < g.rows; i++) cout << format(" %.4f", g.at<double>(i, 0));
    cout << format("  합 = %.4f", sum(g)[0]) << endl;

    // ② 2D 커널 = 열 벡터 × 행 벡터 (외적). 256 배 해서 정수로 보기
    Mat g2 = g * g.t();
    Mat show;
    g2.convertTo(show, CV_32S, 256);
    cout << "2D 커널 x 256:" << endl << show << endl;

    // ③ sigma = 0 이면 ksize 로 계산: 0.3 * ((ksize - 1) * 0.5 - 1) + 0.8
    for (int k = 3; k <= 7; k += 2)
        cout << format("ksize %d → sigma %.2f", k, 0.3 * ((k - 1) * 0.5 - 1) + 0.8) << endl;

    // ④ 분리 가능(separable): 1D 커널을 가로 · 세로로 한 번씩 = GaussianBlur
    Mat img = imread("images/gradient_noise.png", IMREAD_GRAYSCALE);
    Mat a, b, d;
    GaussianBlur(img, a, Size(5, 5), 1.0);
    sepFilter2D(img, b, -1, g, g);
    absdiff(a, b, d);
    double mx;
    minMaxLoc(d, nullptr, &mx);
    cout << "GaussianBlur 와 sepFilter2D 의 최대 차이 = " << mx << endl;
    return 0;
}`;

  const EX_FILTER2D = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png", IMREAD_COLOR);

    // 샤프닝 커널: 가운데를 5배로 키우고 상하좌우를 빼서 차이를 강조 (합 = 1)
    Mat sharpK = (Mat_<float>(3, 3) <<  0, -1,  0,
                                       -1,  5, -1,
                                        0, -1,  0);
    cout << "샤프닝 커널:" << endl << sharpK << endl;
    cout << "커널 합 = " << sum(sharpK)[0] << endl;

    Mat sharp;
    filter2D(img, sharp, -1, sharpK);          // ddepth -1 → CV_8UC3 그대로 (0~255 로 잘림)

    // 엠보싱 커널: 대각선 방향 차이만 남긴다 (합 = 0 → delta 128 을 더해 회색 기준)
    Mat embossK = (Mat_<float>(3, 3) << -2, -1, 0,
                                        -1,  0, 1,
                                         0,  1, 2);
    Mat emboss;
    filter2D(img, emboss, -1, embossK, Point(-1, -1), 128);

    cout << format("원본 평균   B %.1f", mean(img)[0]) << endl;
    cout << format("샤프닝 평균 B %.1f  (커널 합이 1 이라 밝기는 거의 그대로)", mean(sharp)[0]) << endl;
    cout << format("엠보싱 평균 B %.1f  (합이 0 + delta 128 → 회색 주변)", mean(emboss)[0]) << endl;
    imshow("original", img);
    imshow("sharpen", sharp);
    imshow("emboss", emboss);
    waitKey(0);
    return 0;
}`;

  const EX_BORDER = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    // 한 줄짜리 이미지로 경계 처리 규칙을 눈으로 확인합니다
    Mat src = (Mat_<uchar>(1, 5) << 10, 20, 30, 40, 50);
    const char* names[] = { "CONSTANT   ", "REPLICATE  ", "REFLECT    ", "REFLECT_101" };
    int types[] = { BORDER_CONSTANT, BORDER_REPLICATE, BORDER_REFLECT, BORDER_REFLECT_101 };

    for (int i = 0; i < 4; i++)
    {
        Mat padded;
        copyMakeBorder(src, padded, 0, 0, 2, 2, types[i], Scalar(0));
        cout << names[i] << " : " << padded << endl;
    }

    // 같은 규칙이 필터의 가장자리 결과를 바꿉니다
    Mat a, b;
    blur(src, a, Size(3, 3), Point(-1, -1), BORDER_REPLICATE);
    blur(src, b, Size(3, 3), Point(-1, -1), BORDER_CONSTANT);
    cout << "blur + REPLICATE : " << a << endl;
    cout << "blur + CONSTANT  : " << b << endl;
    return 0;
}`;

  const EX_TRACK_LOCAL = `// 🖥 Visual Studio: 트랙바로 GaussianBlur 커널 크기를 바꾸며 보기
#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

Mat g_src, g_dst;

void onKsize(int pos, void*)
{
    int k = pos * 2 + 1;                         // 0,1,2,... → 1,3,5,... 항상 홀수!
    GaussianBlur(g_src, g_dst, Size(k, k), 0);
    putText(g_dst, format("GaussianBlur %dx%d", k, k), Point(10, 30),
            FONT_HERSHEY_SIMPLEX, 0.8, Scalar(255), 2);
    imshow("blur", g_dst);
}

int main()
{
    g_src = imread("images/gradient_noise.png", IMREAD_GRAYSCALE);
    if (g_src.empty()) return -1;

    int pos = 1;                                 // 처음 = 3x3
    namedWindow("blur");
    createTrackbar("k (2k+1)", "blur", &pos, 15, onKsize);
    onKsize(pos, nullptr);

    while (waitKey(0) != 27) {}                  // ESC 로 종료
    return 0;
}`;

  // ------------------------------------------------------------------ 2교시 예제
  const EX_NOISEKIND = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat clean = imread("images/flange.png", IMREAD_GRAYSCALE);
    Mat sp = imread("images/salt_pepper.png", IMREAD_GRAYSCALE);

    Mat saltMask = (sp == 255);                   // 비교 연산자 → 255/0 마스크
    Mat pepperMask;
    compare(sp, 0, pepperMask, CMP_EQ);           // 같은 일을 함수로
    int total = (int)sp.total();
    int salt = countNonZero(saltMask);
    int pepper = countNonZero(pepperMask);
    cout << "전체 픽셀 " << total << endl;
    cout << format("소금(255) %d = %.1f %%", salt, 100.0 * salt / total) << endl;
    cout << format("후추(0)   %d = %.1f %%", pepper, 100.0 * pepper / total) << endl;
    cout << format("원본(flange) 대비 PSNR = %.2f dB", PSNR(clean, sp)) << endl;

    Mat noisy = imread("images/gradient_noise.png", IMREAD_GRAYSCALE);
    Mat gclean = imread("images/gradient_clean.png", IMREAD_GRAYSCALE);
    cout << format("가우시안 잡음 영상의 PSNR = %.2f dB", PSNR(gclean, noisy)) << endl;
    imshow("salt_pepper", sp);
    waitKey(0);
    return 0;
}`;

  const EX_MEDIAN = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

// 이진화 후 윤곽선 전체 개수와, 부모가 있는(내부) 큰 윤곽선 = 구멍 개수
void report(const string& name, const Mat& gray)
{
    Mat bin;
    threshold(gray, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    vector<vector<Point>> cs;
    vector<Vec4i> hi;                               // [다음, 이전, 첫 자식, 부모]
    findContours(bin, cs, hi, RETR_CCOMP, CHAIN_APPROX_SIMPLE);
    int holes = 0;
    for (size_t i = 0; i < cs.size(); i++)
        if (hi[i][3] >= 0 && contourArea(cs[i]) > 50) holes++;
    cout << name << " : 윤곽선 " << cs.size() << "개, 구멍 " << holes << "개" << endl;
}

int main()
{
    Mat sp = imread("images/salt_pepper.png", IMREAD_GRAYSCALE);

    Mat med, gau;
    medianBlur(sp, med, 5);                         // ksize 는 정수 하나, 홀수 3 이상
    GaussianBlur(sp, gau, Size(5, 5), 0);

    report("필터 없음", sp);
    report("Median  ", med);
    report("Gaussian", gau);
    imshow("salt_pepper", sp);
    imshow("median 5", med);
    imshow("gaussian 5", gau);
    waitKey(0);
    return 0;
}`;

  const EX_MYMEDIAN = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

// 3x3 중간값 필터를 직접: 9개를 배열에 모아 nth_element 로 5번째(가운데)를 고른다
Mat myMedian3x3(const Mat& src)
{
    Mat pad, dst(src.size(), CV_8UC1);
    copyMakeBorder(src, pad, 1, 1, 1, 1, BORDER_REPLICATE);   // medianBlur 의 경계 규칙
    uchar v[9];
    for (int y = 0; y < src.rows; y++)
    {
        uchar* out = dst.ptr<uchar>(y);
        for (int x = 0; x < src.cols; x++)
        {
            int n = 0;
            for (int dy = 0; dy < 3; dy++)
            {
                const uchar* p = pad.ptr<uchar>(y + dy) + x;
                v[n++] = p[0]; v[n++] = p[1]; v[n++] = p[2];
            }
            nth_element(v, v + 4, v + 9);          // 전체 정렬보다 빠르다
            out[x] = v[4];
        }
    }
    return dst;
}

int main()
{
    Mat clean = imread("images/flange.png", IMREAD_GRAYSCALE);
    Mat sp = imread("images/salt_pepper.png", IMREAD_GRAYSCALE);

    Mat mine = myMedian3x3(sp);
    Mat ref, diff;
    medianBlur(sp, ref, 3);
    absdiff(mine, ref, diff);
    cout << "medianBlur(3) 와 다른 픽셀 수 = " << countNonZero(diff) << endl;
    cout << format("직접 만든 중간값 PSNR = %.2f dB", PSNR(clean, mine)) << endl;
    imshow("my median", mine);
    waitKey(0);
    return 0;
}`;

  const EX_BILATERAL = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

void printRow(const char* name, const Mat& img, int y, int x0, int x1)
{
    cout << name;
    const uchar* p = img.ptr<uchar>(y);              // y 행의 시작 주소
    for (int x = x0; x <= x1; x++) cout << format(" %3d", p[x]);
    cout << endl;
}

int main()
{
    Mat noisy = imread("images/gradient_noise.png", IMREAD_GRAYSCALE);
    Mat gau, bil;
    GaussianBlur(noisy, gau, Size(7, 7), 2);
    bilateralFilter(noisy, bil, 7, 50, 7);           // d, sigmaColor, sigmaSpace

    // 사각형(420,150,150x90) 의 왼쪽 에지를 가로지르는 한 줄을 비교
    cout << "x=340..352 의 밝기 (에지 통과, y=150)" << endl;
    printRow("원본     :", noisy, 150, 340, 352);
    printRow("Gaussian :", gau, 150, 340, 352);
    printRow("Bilateral:", bil, 150, 340, 352);
    imshow("gaussian 7x7", gau);
    imshow("bilateral", bil);
    waitKey(0);
    return 0;
}`;

  const EX_COMPARE = `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat clean = imread("images/gradient_clean.png", IMREAD_GRAYSCALE);
    Mat noisy = imread("images/gradient_noise.png", IMREAD_GRAYSCALE);
    cout << format("잡음 영상        : %.2f dB", PSNR(clean, noisy)) << endl;

    Mat box, gau, med, bil;
    blur(noisy, box, Size(5, 5));
    cout << format("blur(5x5)        : %.2f dB", PSNR(clean, box)) << endl;

    GaussianBlur(noisy, gau, Size(5, 5), 1.5);
    cout << format("GaussianBlur(5x5): %.2f dB", PSNR(clean, gau)) << endl;

    medianBlur(noisy, med, 5);
    cout << format("medianBlur(5)    : %.2f dB", PSNR(clean, med)) << endl;

    bilateralFilter(noisy, bil, 7, 40, 7);           // d, sigmaColor, sigmaSpace
    cout << format("bilateral(7,40,7): %.2f dB", PSNR(clean, bil)) << endl;

    imshow("noisy", noisy);
    imshow("gaussian", gau);
    imshow("bilateral", bil);
    waitKey(0);
    return 0;
}`;

  const EX_MYPSNR = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <cmath>
using namespace cv;
using namespace std;

// PSNR = 10 · log10(255² / MSE),  MSE = 차이 제곱의 평균
double myPSNR(const Mat& a, const Mat& b)
{
    CV_Assert(a.size() == b.size() && a.type() == CV_8UC1 && b.type() == CV_8UC1);
    double se = 0;                                     // 제곱 오차의 합 (double 로!)
    for (int y = 0; y < a.rows; y++)
    {
        const uchar* pa = a.ptr<uchar>(y);
        const uchar* pb = b.ptr<uchar>(y);
        for (int x = 0; x < a.cols; x++)
        {
            double d = (double)pa[x] - pb[x];          // uchar 끼리 빼면 음수가 사라질 수 있다
            se += d * d;
        }
    }
    double mse = se / a.total();
    cout << format("  MSE = %.2f", mse) << endl;
    if (mse == 0) return INFINITY;                     // 완전히 같으면 무한대
    return 10.0 * log10(255.0 * 255.0 / mse);
}

int main()
{
    Mat clean = imread("images/gradient_clean.png", IMREAD_GRAYSCALE);
    Mat noisy = imread("images/gradient_noise.png", IMREAD_GRAYSCALE);

    cout << "잡음 영상:" << endl;
    double p1 = myPSNR(clean, noisy);
    cout << format("  직접 계산 %.2f dB / PSNR() %.2f dB", p1, PSNR(clean, noisy)) << endl;

    double n = norm(clean, noisy, NORM_L2);            // sqrt(차이 제곱의 합)
    cout << format("  norm 으로: MSE = %.2f", n * n / clean.total()) << endl;

    cout << "같은 영상:" << endl;
    double p2 = myPSNR(clean, clean);                  // 먼저 계산한 뒤 출력
    cout << "  PSNR = " << p2 << endl;
    return 0;
}`;

  const EX_UNSHARP = `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png", IMREAD_COLOR);
    Mat blurImg;
    GaussianBlur(img, blurImg, Size(0, 0), 3);         // ksize (0,0) → sigma 로 자동 결정

    double ks[] = { 0.5, 1.0, 2.0 };
    for (double k : ks)
    {
        Mat sharp, gray;
        addWeighted(img, 1 + k, blurImg, -k, 0, sharp); // 결과 = (1+k)·원본 − k·블러
        cvtColor(sharp, gray, COLOR_BGR2GRAY);
        Scalar m, sd;
        meanStdDev(gray, m, sd);
        cout << format("k = %.1f : 평균 %.1f, 표준편차 %.2f (클수록 대비가 세다)", k, m[0], sd[0]) << endl;
        imshow(format("unsharp k=%.1f", k), sharp);
    }
    Mat g0;
    cvtColor(img, g0, COLOR_BGR2GRAY);
    Scalar m0, sd0;
    meanStdDev(g0, m0, sd0);
    cout << format("원본     : 평균 %.1f, 표준편차 %.2f", m0[0], sd0[0]) << endl;
    waitKey(0);
    return 0;
}`;

  const EX_NLM_LOCAL = `// 🖥 Visual Studio: 비국소 평균(Non-Local Means) 잡음 제거 — 브라우저에서는 실행되지 않습니다
#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat clean = imread("images/gradient_clean.png", IMREAD_GRAYSCALE);
    Mat noisy = imread("images/gradient_noise.png", IMREAD_GRAYSCALE);

    Mat nlm;
    // h: 잡음 세기(클수록 강하게), templateWindowSize 7, searchWindowSize 21
    fastNlMeansDenoising(noisy, nlm, 15, 7, 21);        // photo 모듈 (opencv2/photo.hpp)
    cout << format("fastNlMeansDenoising: %.2f dB", PSNR(clean, nlm)) << endl;

    TickMeter tm;
    Mat gau;
    tm.start();
    GaussianBlur(noisy, gau, Size(5, 5), 1.5);
    tm.stop();
    cout << format("GaussianBlur        : %.2f dB (%.2f ms)", PSNR(clean, gau), tm.getTimeMilli()) << endl;
    imshow("nlmeans", nlm);
    waitKey(0);
    return 0;
}`;

  // ------------------------------------------------------------------ 퀴즈
  const QUIZ1 = [
    { q: '<code>GaussianBlur(src, dst, Size(4, 4), 0);</code> 를 실행하면?', options: ['4×4 커널로 잘 동작한다', '커널 크기가 짝수라서 <code>cv::Exception</code> 이 발생한다', '자동으로 5×5 로 바뀐다', '결과가 원본과 같다'], answer: 1,
      explain: '블러 커널은 <b>앵커(가운데)</b>가 있어야 하므로 <b>홀수</b>여야 합니다. 짝수를 주면 <code>ksize.width % 2 == 1</code> 검사에 걸려 예외가 납니다. 단 <code>Size(0, 0)</code> 은 “sigma 로 알아서 정하라”는 특별한 뜻입니다.' },
    { q: '3×3 평균 커널의 가중치 합은 1 입니다. 합이 1 이면 무엇이 보장되나?', options: ['에지가 강조된다', '전체 밝기가 거의 유지된다', '잡음이 완전히 사라진다', '커널이 대칭이 된다'], answer: 1,
      explain: '가중치 합 = 1 이면 평평한 영역의 값이 그대로 유지되므로 <b>전체 밝기가 변하지 않습니다</b>. 합이 0 인 커널(에지 · 엠보싱)은 평평한 곳이 0(검정)이 되므로 <code>filter2D</code> 의 <code>delta</code> 로 128 을 더해 주는 경우가 많습니다.' },
    { q: '<code>blur</code> 와 <code>boxFilter</code> 의 관계로 옳은 것은?', options: ['완전히 다른 알고리즘이다', '<code>blur(src, dst, ksize)</code> = <code>boxFilter(src, dst, -1, ksize)</code> (normalize = true)', '<code>blur</code> 는 가우시안 가중치를 쓴다', '<code>boxFilter</code> 는 컬러 이미지에 못 쓴다'], answer: 1,
      explain: '<code>blur</code> 는 <code>boxFilter</code> 의 정규화(합을 커널 칸 수로 나눔) 버전입니다. <code>boxFilter(..., normalize = false)</code> 이면 단순 합이 되어 8비트에서는 값이 넘칩니다(포화) — <code>ddepth</code> 를 <code>CV_32F</code> 로 주면 합을 그대로 받을 수 있습니다.' },
    { q: '필터가 이미지 가장자리를 계산할 때 쓰는 기본 규칙 <code>BORDER_DEFAULT</code> 는?', options: ['<code>BORDER_CONSTANT</code> (0 으로 채움)', '<code>BORDER_REPLICATE</code> (끝 값 복사)', '<code>BORDER_REFLECT_101</code> (맨 끝 값을 빼고 거울)', '<code>BORDER_WRAP</code> (반대편에서 가져옴)'], answer: 2,
      explain: '<code>BORDER_DEFAULT</code> = <code>BORDER_REFLECT_101</code> 입니다. <code>10 20 30</code> 의 왼쪽은 <code>30 20 | 10 20 30</code> 처럼 맨 끝 값(10)을 중복하지 않고 거울처럼 채웁니다.' },
    { q: '<code>Mat k = (Mat_&lt;float&gt;(3, 3) &lt;&lt; 0, -1, 0, -1, 5, -1, 0, -1, 0);</code> 에서 <code>k.at&lt;float&gt;(1, 0)</code> 의 값은?', options: ['0', '-1', '5', '1'], answer: 1,
      explain: '쉼표 초기화는 <b>행 우선(row-major)</b> 으로 채웁니다. 1행(두 번째 줄)은 <code>-1, 5, -1</code> 이고 그 0열은 <b>-1</b> 입니다. 커널 형식은 <code>CV_32F</code> 이므로 <code>at&lt;float&gt;</code> 로 읽어야 합니다 — <code>at&lt;uchar&gt;</code> 로 읽으면 Debug 에서 형식 검사에 걸립니다.' }
  ];

  const QUIZ2 = [
    { q: '소금-후추(임펄스) 잡음에 가장 알맞은 필터는?', options: ['<code>blur</code>', '<code>GaussianBlur</code>', '<code>medianBlur</code>', '<code>boxFilter</code>'], answer: 2,
      explain: '평균 계열은 0 · 255 로 튄 값에 끌려가 잡음이 <b>번져서</b> 남습니다. <b>중간값(median)</b>은 정렬해서 가운데를 고르므로 튄 값이 그냥 버려집니다.' },
    { q: 'PSNR 값에 대한 설명으로 옳은 것은?', options: ['작을수록 원본에 가깝다', '클수록 원본에 가깝다', '단위는 픽셀이다', '두 이미지 크기가 달라도 계산된다'], answer: 1,
      explain: 'PSNR = 10·log<sub>10</sub>(255² / MSE) 이므로 오차(MSE)가 작을수록 <b>커집니다</b>. 단위는 dB 이고, 두 이미지의 크기 · 형식이 같아야 계산됩니다(아니면 예외). 보통 30 dB 이상이면 꽤 비슷한 편입니다.' },
    { q: '<code>bilateralFilter</code> 가 에지를 살리는 이유는?', options: ['커널이 정사각형이 아니기 때문', '거리뿐 아니라 <b>밝기 차</b>도 가중치에 쓰기 때문', '중간값을 고르기 때문', '이진화를 먼저 하기 때문'], answer: 1,
      explain: '양방향 필터는 (거리 가우시안) × (밝기 차 가우시안) 을 가중치로 씁니다. 밝기가 많이 다른 이웃은 가중치가 거의 0 이 되어 섞이지 않으므로 <b>에지가 남고 면만 매끈해집니다</b>. 대신 느리고, src 와 dst 를 같은 Mat 으로 쓸 수 없습니다(in-place 불가).' },
    { q: '언샤프 마스크를 <code>addWeighted(src, 1.5, blurImg, -0.5, 0, dst);</code> 로 만들었습니다. k 값은?', options: ['0.5', '1.0', '1.5', '2.0'], answer: 0,
      explain: '언샤프 마스크는 <code>(1+k)·원본 − k·블러</code> 이므로 alpha 1.5 = 1+k → <b>k = 0.5</b> 입니다. k 를 키우면 선명해지지만 에지에 흰 테두리(오버슈트)가 생기고 잡음도 강조됩니다.' },
    { q: 'MSE 를 직접 계산하는 반복문에서 <code>int d = pa[x] - pb[x];</code> 대신 <code>uchar d = pa[x] - pb[x];</code> 로 쓰면?', options: ['똑같이 동작한다', '음수 차이가 256 을 더한 큰 양수로 바뀌어 MSE 가 틀린다', '컴파일 오류가 난다', '속도만 느려진다'], answer: 1,
      explain: '<code>uchar</code> 는 0~255 만 담으므로 <code>60 - 62 = -2</code> 가 <b>254</b> 로 저장됩니다(모듈로 256). 차이 · 합을 계산할 때는 반드시 <code>int</code> 나 <code>double</code> 로 받으세요. OpenCV 함수(<code>subtract</code>)는 대신 <b>포화</b>(0 으로 자름)를 합니다 — 둘 다 “음수가 없다”는 점을 기억하세요.' }
  ];

  CV_COURSE.addChapter({
    id: 'cv08', no: '08', title: '필터링: 블러 · 샤프닝 · 잡음 제거', subtitle: '컨볼루션 원리 · blur / GaussianBlur / medianBlur / bilateralFilter · filter2D',
    summary: '커널(kernel)이 이미지 위를 미끄러지며 계산하는 <b>컨볼루션(Convolution)</b> 원리를 <b>행 포인터 반복문으로 직접 구현</b>해 보고, 평균 · 가우시안 · 중간값 · 양방향 필터를 골라 쓰는 기준을 세웁니다. <code>Mat_&lt;float&gt;</code> 쉼표 초기화로 샤프닝 · 엠보싱 커널을 만들어 <code>filter2D</code> 에 넣고, <code>PSNR</code> 로 잡음 제거 성능을 숫자로 비교합니다.',
    goals: [
      '컨볼루션의 동작(커널 슬라이딩 · 가중치 합 · 경계 처리)을 설명하고 ptr 반복문으로 구현할 수 있다',
      'blur · GaussianBlur · medianBlur · bilateralFilter 를 잡음 종류에 맞게 고를 수 있다',
      'filter2D 로 직접 만든 커널(샤프닝 · 엠보싱)을 적용하고 PSNR 로 결과를 평가할 수 있다'
    ],
    sections: [
      {
        id: 'cv08-1', title: '컨볼루션과 블러: blur · GaussianBlur · filter2D', minutes: 50,
        goals: ['커널이 미끄러지며 곱하고 더하는 컨볼루션을 손계산과 ptr 반복문으로 확인할 수 있다', 'blur · boxFilter · GaussianBlur 의 차이와 커널 크기 효과를 안다', 'Mat_<float> 커널을 filter2D 에 적용하고 BORDER_* 규칙을 설명할 수 있다'],
        flow: [['도입: 왜 흐리게 만드나', 5], ['컨볼루션 원리 · 직접 구현', 15], ['blur · Gaussian · 커널 크기', 15], ['filter2D · 경계 처리', 10], ['정리 · 퀴즈', 5]],
        content: [
          { type: 'h', text: '왜 일부러 흐리게 만드나?' },
          { type: 'p', html: '검사 영상에는 항상 <b>잡음(noise)</b>이 있습니다. 센서의 전기적 잡음, 조명 깜빡임, 먼지 한 점이 이진화 · 에지 검출 결과를 엉망으로 만듭니다. 그래서 대부분의 비전 처리 파이프라인은 <b>필터링(Filtering)</b> 으로 시작합니다. 반대로 흐릿한 영상을 또렷하게 만드는 <b>샤프닝(Sharpening)</b> 도 같은 도구(컨볼루션)로 만듭니다.' },
          { type: 'list', ordered: true, items: [
            '<b>잡음 줄이기</b> — 이진화 · 에지 검출 전처리 (이 차시)',
            '<b>세부 없애기</b> — 배경의 무늬(텍스처)를 지우고 큰 덩어리만 남기기',
            '<b>선명하게</b> — 흐린 렌즈 · 초점 오차 보정 (샤프닝 · 언샤프 마스크)',
            '<b>특정 방향만 보기</b> — 에지 검출도 결국 커널 하나입니다 (10차시)'
          ] },
          { type: 'h', text: '컨볼루션: 커널이 미끄러진다' },
          { type: 'p', html: '<b>커널(kernel, 마스크 · 필터)</b> 은 작은 숫자 표(보통 3×3, 5×5)입니다. 이 커널을 이미지의 모든 픽셀에 차례로 올려놓고, <b>겹친 값끼리 곱해서 모두 더한 값</b>을 그 위치의 새 픽셀 값으로 씁니다. 커널이 이미지 위를 왼쪽 → 오른쪽, 위 → 아래로 미끄러지는 이 계산을 <b>컨볼루션(Convolution)</b> 이라고 합니다.' },
          { type: 'figure', html: FIG_CONV, caption: '그림 1. 3×3 커널이 미끄러지며 출력 픽셀 하나씩을 만든다. 가운데 픽셀(앵커)이 결과의 자리다' },
          { type: 'p', html: '출력 픽셀 하나 = ∑ (이웃 값 × 커널 값). 3×3 평균 커널은 모든 칸이 1/9 이므로 결국 <b>9개 이웃의 평균</b>입니다. 튀는 값 하나가 9로 나뉘어 옅어지므로 잡음이 줄고, 대신 에지도 함께 뭉개집니다.' },
          { type: 'code', title: '예제 1: 3×3 평균 커널을 손으로 계산해 보기', code: EX_CONV,
            desc: '<code>img(Rect(96, 148, 5, 5)).clone()</code> 로 원의 왼쪽 에지 부분 5×5 만 <b>독립된 복사본</b>으로 떼어 값을 직접 봅니다(배경 ≈ 67, 원 내부 ≈ 49). <code>clone()</code> 을 빼면 ROI 는 원본과 메모리를 공유하는 <b>헤더</b>일 뿐이라(03차시) 값을 바꾸면 원본도 바뀝니다. 손으로 구한 9개 평균(67.67)과 <code>blur</code> 의 가운데 값(68)이 같으면 컨볼루션을 이해한 것입니다 — OpenCV 는 결과를 반올림합니다. <code>cout &lt;&lt; roi</code> 는 Mat 의 모든 값을 OpenCV 형식으로 보여 줍니다.',
            expect: '원본 5x5 ROI:\n[ 67,  67,  68,  68,  50;\n  67,  67,  68,  68,  49;\n  67,  67,  68,  68,  49;\n  67,  67,  68,  68,  49;\n  67,  67,  68,  68,  50]\n가운데 3x3 합 = 609, 평균 = 67.67\nblur 의 가운데 값 = 68\nblur 결과 5x5:\n[ 67,  67,  68,  62,  62;\n  67,  67,  68,  62,  62;\n  67,  67,  68,  62,  62;\n  67,  67,  68,  62,  62;\n  67,  67,  68,  62,  62]' },
          { type: 'callout', kind: 'tip', title: '왜 커널은 홀수인가', html: '커널의 결과를 적을 자리(<b>앵커, anchor</b>)가 정확히 가운데여야 결과가 한쪽으로 밀리지 않습니다. 3 · 5 · 7 처럼 홀수만 가운데가 있으므로 <code>GaussianBlur</code> · <code>medianBlur</code> 는 짝수 커널을 거부합니다(<code>Size(4, 4)</code> → <code>cv::Exception</code>). 예외적으로 <code>GaussianBlur</code> 의 <code>Size(0, 0)</code> 은 “sigma 에서 크기를 계산하라”는 뜻입니다. <code>Point(-1, -1)</code> 앵커는 “가운데”를 뜻합니다.' },
          { type: 'h', text: 'C++ 로 직접 구현하기: 행 포인터 반복문' },
          { type: 'p', html: '컨볼루션은 이중 반복문 그 자체입니다. 이미지 전체에 3×3 평균을 직접 적용해 보고 OpenCV 의 <code>blur</code> 와 비교해 봅시다. 가장자리에서 이미지 밖을 읽지 않도록 <code>copyMakeBorder</code> 로 1 픽셀 테두리를 먼저 붙이고, 각 행마다 <code>ptr&lt;uchar&gt;(y)</code> 로 <b>행 시작 주소</b>를 구해 배열처럼 읽습니다.' },
          { type: 'figure', html: FIG_PTR, caption: '그림 2. 테두리를 붙인 pad 에서 위 · 가운데 · 아래 행 포인터 3개로 9개 합을 구한다' },
          { type: 'code', title: '예제 2: 3×3 평균 필터를 직접 만들어 blur 와 비교', code: EX_HANDMEAN,
            desc: '함수 <code>myMean3x3</code> 는 <code>const Mat&amp;</code> 로 받아 복사 없이 읽고, 결과 <code>Mat</code> 을 값으로 돌려줍니다(헤더만 복사되므로 싸다). <code>CV_Assert</code> 는 조건이 거짓이면 <code>cv::Exception</code> 을 던지는 OpenCV 의 검사 매크로입니다. <code>saturate_cast&lt;uchar&gt;(s / 9.0)</code> 는 <b>반올림 + 0~255 자르기</b>를 한 번에 합니다. 30만 개 픽셀 중 다른 픽셀이 <b>0개</b>면 여러분의 코드가 OpenCV 와 똑같이 계산한 것입니다.',
            expect: '크기: 640 x 480\nblur 와 다른 픽셀 수 = 0 / 307200\n최대 차이 = 0' },
          { type: 'callout', kind: 'more', title: '📘 OpenCV 는 왜 더 빠를까', html: '<code>blur</code> 는 9번 더하지 않습니다. 가로 방향 3개 합을 먼저 구해 두고(한 칸 옮길 때 <b>새로 들어온 값을 더하고 나간 값을 뺌</b>), 그 결과를 세로로 다시 합칩니다 — 커널 크기가 21 이어도 픽셀당 연산 수가 거의 같습니다. 여기에 SIMD(AVX2 · NEON) 와 멀티스레드가 더해집니다. 알고리즘을 이해하려고 직접 구현해 보되, 실무에서는 라이브러리 함수를 쓰세요.' },
          { type: 'h', text: '평균 블러와 가우시안 블러' },
          { type: 'figure', html: FIG_KERNEL2, caption: '그림 3. 평균 커널은 모든 이웃을 똑같이 섞고, 가우시안 커널은 가까운 이웃에 큰 가중치를 준다' },
          { type: 'table', head: ['C++ (OpenCV 5)', 'Python', '커널', '특징'], rows: [
            ['<code>blur(src, dst, Size(w, h))</code>', '<code>cv2.blur</code>', '모두 1/(w·h)', '가장 빠름. 네모난 번짐 · 링잉이 보인다'],
            ['<code>boxFilter(src, dst, ddepth, Size, anchor, normalize)</code>', '<code>cv2.boxFilter</code>', '모두 1 (또는 1/n)', '<code>normalize = false</code> 면 단순 합 → 8비트는 포화'],
            ['<code>GaussianBlur(src, dst, Size, sigmaX)</code>', '<code>cv2.GaussianBlur</code>', '종 모양 가중치', '가장 널리 쓰임. 전처리 표준'],
            ['<code>medianBlur(src, dst, ksize)</code>', '<code>cv2.medianBlur</code>', '커널 없음(정렬)', '임펄스 잡음에 강함 (2교시)'],
            ['<code>filter2D(src, dst, ddepth, kernel)</code>', '<code>cv2.filter2D</code>', '내가 만든 커널', '샤프닝 · 엠보싱 · 방향 필터'],
            ['<code>sepFilter2D(src, dst, ddepth, kx, ky)</code>', '<code>cv2.sepFilter2D</code>', '1D × 1D', '분리 가능한 커널을 빠르게']
          ], caption: '표 1. 이 차시에서 쓰는 필터 함수 — 결과는 모두 출력 인수 dst 로 받는다' },
          { type: 'p', html: '<code>GaussianBlur</code> 의 네 번째 인수 <code>sigmaX</code> 는 종 모양의 폭입니다. <b>0 을 주면 커널 크기에서 자동 계산</b>(σ = 0.3·((ksize−1)·0.5 − 1) + 0.8)되고, 반대로 <code>Size(0, 0)</code> 을 주면 σ 에서 커널 크기를 계산합니다. 둘 중 하나만 정하면 됩니다.' },
          { type: 'code', title: '예제 3: blur · boxFilter · GaussianBlur 를 PSNR 로 비교', code: EX_BLUR,
            desc: '<code>images/gradient_noise.png</code> 는 <code>gradient_clean.png</code> 에 가우시안 잡음(σ=15)을 더한 영상입니다. 정답 영상이 있으니 <b><code>PSNR</code>(Peak Signal-to-Noise Ratio, dB)</b> 로 “얼마나 원본에 가까운가”를 숫자로 볼 수 있습니다. <b>클수록 좋습니다.</b> 잡음 영상은 약 24.7 dB 인데 필터를 거치면 올라갑니다. <code>boxFilter</code> 의 <code>ddepth = -1</code> 은 “입력과 같은 깊이(CV_8U)”라는 뜻입니다.',
            expect: '필터 없음         PSNR = 24.67 dB\nblur(3x3)         PSNR = 30.16 dB\nboxFilter(3x3)    PSNR = 30.16 dB  (blur 와 같다)\nGaussianBlur(3x3) PSNR = 30.82 dB\nGaussianBlur(5x5, sigma 1.5) PSNR = 29.61 dB' },
          { type: 'image', src: 'images/gradient_noise.png', caption: 'gradient_noise.png — 그라데이션 배경 위 도형과 가는 세로선 6개. 커널을 키우면 가는 선부터 사라진다', width: 420 },
          { type: 'code', title: '예제 4: 커널 크기 3 · 9 · 21 효과 비교', code: EX_KSIZE,
            desc: '결과 창의 세 이미지를 나란히 보세요. 3×3 은 잡음만 살짝 줄이고, 9×9 는 매끈하지만 가는 세로선이 희미해지고, 21×21 은 글자 “FILTER 3x3” 까지 읽을 수 없습니다. <code>meanStdDev</code> 의 <b>표준편차</b>가 줄어드는 것은 영상의 대비가 함께 줄었다는 뜻입니다. PSNR 도 어느 지점을 지나면 다시 나빠집니다 — 잡음보다 신호를 더 많이 지우기 때문입니다. <code>"gaussian " + to_string(k)</code> 로 창 이름을 만들었습니다.',
            expect: 'ksize  3x3  PSNR 30.82 dB, 표준편차 62.54\nksize  9x9  PSNR 28.30 dB, 표준편차 61.25\nksize 21x21 PSNR 24.59 dB, 표준편차 59.77' },
          { type: 'code', title: '예제 5: 가우시안 커널 들여다보기 — getGaussianKernel · 분리 가능성', code: EX_GKERNEL,
            desc: '<code>getGaussianKernel(ksize, sigma)</code> 는 <b>ksize×1 열 벡터</b>를 돌려줍니다(합 = 1). 2D 가우시안 커널은 이 벡터와 그 전치의 <b>행렬 곱(외적)</b> <code>g * g.t()</code> 입니다. 그래서 2D 필터 한 번 대신 <b>가로 1D + 세로 1D</b> 두 번(<code>sepFilter2D</code>)으로 같은 결과를 얻습니다 — k×k 곱셈이 2k 로 줄어드는 <b>분리 가능(separable)</b> 필터입니다. 최대 차이가 <b>1 이하</b>면 두 방법이 같은 계산이라는 증거입니다 — 8비트 <code>GaussianBlur</code> 는 속도를 위해 <b>정수 고정소수점</b>으로 계산하므로 반올림이 1 정도 다를 수 있습니다.',
            expect: '1D 커널 (5, sigma 1.0): 0.0545 0.2442 0.4026 0.2442 0.0545  합 = 1.0000\n2D 커널 x 256:\n[1, 3, 6, 3, 1;\n 3, 15, 25, 15, 3;\n 6, 25, 41, 25, 6;\n 3, 15, 25, 15, 3;\n 1, 3, 6, 3, 1]\nksize 3 → sigma 0.80\nksize 5 → sigma 1.10\nksize 7 → sigma 1.40\nGaussianBlur 와 sepFilter2D 의 최대 차이 = 1' },
          { type: 'callout', kind: 'warn', title: '흔한 실수 세 가지', html: '<ul><li><b>짝수 커널</b>: <code>Size(4, 4)</code> → 예외. 트랙바 값을 쓸 때는 <code>k = pos * 2 + 1</code> 처럼 항상 홀수로 만드세요.</li><li><b>medianBlur 의 ksize 는 <u>정수 하나</u></b>: <code>medianBlur(src, dst, 5)</code> 이고 <code>Size(5, 5)</code> 가 아닙니다 — C++ 에서는 컴파일 오류로 바로 드러납니다.</li><li><b>src 와 dst 를 같은 Mat 으로</b>: <code>GaussianBlur(img, img, …)</code> 는 대부분 동작하지만(in-place) <code>bilateralFilter</code> 처럼 안 되는 함수가 있습니다. 결과는 새 <code>Mat</code> 에 받는 습관을 들이세요.</li></ul>' },
          { type: 'h', text: 'filter2D: 커널을 직접 만든다' },
          { type: 'p', html: '<code>filter2D</code> 에 내가 만든 커널을 넘기면 어떤 선형 필터든 만들 수 있습니다. 커널은 실수 행렬이므로 <code>Mat_&lt;float&gt;</code> 의 <b>쉼표 초기화</b>로 만들면 읽기 쉽습니다: <code>Mat k = (Mat_&lt;float&gt;(3, 3) &lt;&lt; 0, -1, 0, -1, 5, -1, 0, -1, 0);</code>' },
          { type: 'table', head: ['커널', '값 (3×3)', '합', '효과'], rows: [
            ['샤프닝', '0 −1 0 / −1 <b>5</b> −1 / 0 −1 0', '1', '가운데를 키우고 이웃을 빼서 대비 강조'],
            ['강한 샤프닝', '−1 −1 −1 / −1 <b>9</b> −1 / −1 −1 −1', '1', '더 세지만 잡음도 같이 강조'],
            ['엠보싱', '−2 −1 0 / −1 <b>0</b> 1 / 0 1 2', '0', '한쪽 방향 차이만 남겨 도장 느낌 (delta 128)'],
            ['평균', '1/9 × 전부 1', '1', '<code>blur(src, dst, Size(3, 3))</code> 과 같다'],
            ['가로 에지', '−1 −1 −1 / 0 <b>0</b> 0 / 1 1 1', '0', '위아래 밝기 변화 (10차시 Sobel 의 뼈대)']
          ], caption: '표 2. 자주 쓰는 3×3 커널. 합이 1 이면 밝기 유지, 0 이면 평평한 곳이 검정이 된다' },
          { type: 'code', title: '예제 6: filter2D 로 샤프닝 · 엠보싱', code: EX_FILTER2D,
            desc: '쉼표 초기화는 <b>행 우선(row-major)</b>: 첫 3개가 첫 줄입니다. 코드에서 줄을 맞춰 쓰면 커널 모양이 그대로 보입니다. 엠보싱 커널처럼 합이 0 이면 결과가 0 근처로 몰려 거의 검정이 되므로 <code>filter2D</code> 의 <code>delta</code> 인수에 128 을 주어 회색을 기준으로 삼습니다. <code>ddepth = -1</code> 이면 결과가 입력과 같은 <code>CV_8UC3</code> 이 되어 0~255 로 잘립니다(포화). 컬러 영상은 <b>채널마다 같은 커널</b>이 적용됩니다.',
            expect: '샤프닝 커널:\n[0, -1, 0;\n -1, 5, -1;\n 0, -1, 0]\n커널 합 = 1\n원본 평균   B 115.5\n샤프닝 평균 B 115.5  (커널 합이 1 이라 밝기는 거의 그대로)\n엠보싱 평균 B 128.5  (합이 0 + delta 128 → 회색 주변)' },
          { type: 'callout', kind: 'tip', title: '엄밀히 말하면 상관(Correlation)', html: 'OpenCV 의 <code>filter2D</code> 는 커널을 180° 돌리지 않고 그대로 곱합니다 — 수학적으로는 <b>상관(correlation)</b> 입니다. 우리가 쓰는 커널은 대부분 대칭이라 결과가 같지만, 비대칭 커널(엠보싱 등)에서는 방향이 반대가 됩니다. 진짜 컨볼루션이 필요하면 <code>flip(kernel, k2, -1)</code> 로 커널을 뒤집어 넘기세요.' },
          { type: 'h', text: '가장자리는 어떻게? — BORDER_*' },
          { type: 'p', html: '왼쪽 맨 위 픽셀에 3×3 커널을 올리면 이미지 밖의 값이 필요합니다. OpenCV 는 밖의 값을 만드는 규칙을 <code>borderType</code> 인수(<code>BORDER_*</code> 상수)로 고르게 합니다. 기본값은 <code>BORDER_DEFAULT</code> = <code>BORDER_REFLECT_101</code> 입니다.' },
          { type: 'figure', html: FIG_BORDER, caption: '그림 4. 이미지 밖의 값을 만드는 네 가지 방법. 기본값은 REFLECT_101' },
          { type: 'code', title: '예제 7: 경계 처리 규칙을 눈으로 확인', code: EX_BORDER,
            desc: '<code>(Mat_&lt;uchar&gt;(1, 5) &lt;&lt; 10, 20, 30, 40, 50)</code> 로 한 줄짜리 영상을 만들고 <code>copyMakeBorder</code> 로 실제로 테두리를 붙여 값을 찍어 봅니다. <code>BORDER_CONSTANT</code> 는 밖을 0 으로 채우므로 <b>가장자리가 어두워지는</b> 문제가 생깁니다 — 조명 검사나 정규화에서 오차의 원인이 됩니다. 특별한 이유가 없으면 기본값(<code>REFLECT_101</code>)이나 <code>REPLICATE</code> 를 쓰세요. 예제 2 의 <code>myMean3x3</code> 가 <code>blur</code> 와 똑같았던 것도 같은 경계 규칙을 썼기 때문입니다.',
            expect: 'CONSTANT    : [  0,   0,  10,  20,  30,  40,  50,   0,   0]\nREPLICATE   : [ 10,  10,  10,  20,  30,  40,  50,  50,  50]\nREFLECT     : [ 20,  10,  10,  20,  30,  40,  50,  50,  40]\nREFLECT_101 : [ 30,  20,  10,  20,  30,  40,  50,  40,  30]\nblur + REPLICATE : [ 13,  20,  30,  40,  47]\nblur + CONSTANT  : [  3,   7,  10,  13,  10]' },
          { type: 'callout', kind: 'vs', title: 'Visual Studio 에서는 — 트랙바로 커널 크기 조절', html: '로컬 PC 에서는 <code>createTrackbar</code> 로 커널 크기를 바꾸며 결과를 즉시 볼 수 있습니다. 주의할 점 두 가지: ① 트랙바 값은 0 부터의 정수이므로 <code>k = pos * 2 + 1</code> 로 <b>항상 홀수</b>로 바꿀 것 ② 콜백은 전역 변수나 <code>userdata</code> 포인터로 영상에 접근합니다. 브라우저에서는 트랙바 대신 예제 4 처럼 <b>반복문으로 여러 크기를 한 번에</b> 비교하세요.' },
          { type: 'code', title: '추가: 트랙바로 블러 세기 바꾸기 (Visual Studio)', code: EX_TRACK_LOCAL, run: false, local: true, file: 'main.cpp',
            desc: '같은 <code>GaussianBlur</code> 호출을 트랙바 콜백 안에서 부를 뿐입니다. <code>putText</code> 로 현재 커널 크기를 영상 위에 적어 두면 캡처한 화면만 봐도 설정을 알 수 있습니다. 브라우저에서는 <code>createTrackbar</code> 가 경고만 내고 무시됩니다.' }
        ],
        practice: [
          {
            title: '내 커널로 세로 방향 에지만 강조하기', level: 2,
            desc: '<code>filter2D</code> 로 <b>좌우 밝기 변화(세로 에지)</b>를 강조하는 3×3 커널 <code>[-1 0 1; -2 0 2; -1 0 1]</code> 을 <code>Mat_&lt;float&gt;</code> 쉼표 초기화로 만들어 <code>images/gradient_clean.png</code> 에 적용하세요. 합이 0 인 커널이므로 <code>delta</code> 에 128 을 주어 회색 기준으로 보이게 하고, 결과의 평균 · 표준편차를 출력하세요. 커널을 <code>[-1 -2 -1; 0 0 0; 1 2 1]</code> 로 바꾸면 무엇이 강조되는지 결과 창에서 비교해 보세요.',
            hint: '<code>Mat kx = (Mat_&lt;float&gt;(3, 3) &lt;&lt; -1, 0, 1, -2, 0, 2, -1, 0, 1);</code> → <code>filter2D(img, dx, -1, kx, Point(-1, -1), 128);</code>. 통계는 <code>Scalar m, sd; meanStdDev(dx, m, sd);</code> 후 <code>m[0]</code>, <code>sd[0]</code>. 이 커널의 이름이 바로 10차시에서 배울 <b>Sobel</b> 입니다.',
            expect: '세로 에지 강조: 평균 130.0, 표준편차 22.00\n가로 에지 강조: 평균 128.0, 표준편차 16.23',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/gradient_clean.png", IMREAD_GRAYSCALE);

    // TODO: 세로 에지 커널 [-1 0 1; -2 0 2; -1 0 1] 을 만드세요
    Mat kx = (Mat_<float>(3, 3) << 0, 0, 0,
                                   0, 1, 0,
                                   0, 0, 0);     // 지금은 아무것도 안 하는 커널

    Mat dst;
    filter2D(img, dst, -1, kx, Point(-1, -1), 128);
    Scalar m, sd;
    meanStdDev(dst, m, sd);
    cout << format("평균 %.1f, 표준편차 %.2f", m[0], sd[0]) << endl;

    imshow("vertical edge", dst);
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/gradient_clean.png", IMREAD_GRAYSCALE);

    Mat kx = (Mat_<float>(3, 3) << -1, 0, 1,
                                   -2, 0, 2,
                                   -1, 0, 1);    // 세로 에지 (x 방향 미분)
    Mat ky = (Mat_<float>(3, 3) << -1, -2, -1,
                                    0,  0,  0,
                                    1,  2,  1);  // 가로 에지 (y 방향 미분)

    Mat dx, dy;
    filter2D(img, dx, -1, kx, Point(-1, -1), 128);
    filter2D(img, dy, -1, ky, Point(-1, -1), 128);
    Scalar mx, sx, my, sy;
    meanStdDev(dx, mx, sx);
    meanStdDev(dy, my, sy);
    cout << format("세로 에지 강조: 평균 %.1f, 표준편차 %.2f", mx[0], sx[0]) << endl;
    cout << format("가로 에지 강조: 평균 %.1f, 표준편차 %.2f", my[0], sy[0]) << endl;

    imshow("vertical edge", dx);
    imshow("horizontal edge", dy);
    waitKey(0);
    return 0;
}`
          },
          {
            title: '가장 좋은 가우시안 커널 크기 찾기', level: 1,
            desc: '<code>images/gradient_noise.png</code> 에 <code>GaussianBlur</code> 를 커널 3, 5, 7, 9, 11 로 적용하고 <code>images/gradient_clean.png</code> 대비 PSNR 을 출력하세요. PSNR 이 가장 큰 커널 크기와 그때의 값을 마지막 줄에 출력하세요.',
            hint: '<code>for (int k = 3; k &lt;= 11; k += 2)</code> 로 홀수만 돌리고, <code>double best = -1; int bestK = 0;</code> 를 두고 갱신하세요. PSNR 은 <code>PSNR(clean, dst)</code>, 출력은 <code>format("ksize %2d : PSNR %.2f dB", k, p)</code>.',
            expect: 'ksize  3 : PSNR 30.82 dB\nksize  5 : PSNR 30.54 dB\nksize  7 : PSNR 29.26 dB\nksize  9 : PSNR 28.30 dB\nksize 11 : PSNR 27.42 dB\n가장 좋은 커널 = 3x3 (30.82 dB)',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat noisy = imread("images/gradient_noise.png", IMREAD_GRAYSCALE);
    Mat clean = imread("images/gradient_clean.png", IMREAD_GRAYSCALE);

    for (int k = 3; k <= 11; k += 2)
    {
        Mat dst;
        GaussianBlur(noisy, dst, Size(k, k), 0);
        // TODO: PSNR 을 출력하고 가장 큰 값을 기억하세요
        cout << "ksize " << k << endl;
    }
    // TODO: 가장 좋은 커널 크기를 출력하세요
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat noisy = imread("images/gradient_noise.png", IMREAD_GRAYSCALE);
    Mat clean = imread("images/gradient_clean.png", IMREAD_GRAYSCALE);

    double best = -1;
    int bestK = 0;
    for (int k = 3; k <= 11; k += 2)
    {
        Mat dst;
        GaussianBlur(noisy, dst, Size(k, k), 0);
        double p = PSNR(clean, dst);
        cout << format("ksize %2d : PSNR %.2f dB", k, p) << endl;
        if (p > best) { best = p; bestK = k; }
    }
    cout << format("가장 좋은 커널 = %dx%d (%.2f dB)", bestK, bestK, best) << endl;
    return 0;
}`
          },
          {
            title: 'k×k 평균 필터 함수로 일반화하기', level: 3,
            desc: '예제 2 의 <code>myMean3x3</code> 를 <b>커널 크기 k(홀수)</b>를 받는 <code>Mat myMean(const Mat&amp; src, int k)</code> 로 일반화하세요. 테두리는 <code>r = k / 2</code> 픽셀씩 붙이고, 이중 반복문 안에서 k×k 합을 구합니다. <code>images/gradient_noise.png</code> 에 k = 3, 5, 7 을 적용해 <code>blur(src, ref, Size(k, k))</code> 와 다른 픽셀 수를 출력하세요. 짝수 k 가 들어오면 <code>CV_Assert</code> 로 막으세요.',
            hint: '<code>CV_Assert(k % 2 == 1);</code> → <code>copyMakeBorder(src, pad, r, r, r, r, BORDER_REFLECT_101);</code>. 안쪽 반복: <code>for (int dy = 0; dy &lt; k; dy++) { const uchar* p = pad.ptr&lt;uchar&gt;(y + dy) + x; for (int dx = 0; dx &lt; k; dx++) s += p[dx]; }</code> 그리고 <code>saturate_cast&lt;uchar&gt;((double)s / (k * k))</code>. 커널이 커지면 합이 커지므로 <code>int</code> 로 충분한지 생각해 보세요(255 × 49 = 12495).',
            expect: 'k = 3 : blur 와 다른 픽셀 0개\nk = 5 : blur 와 다른 픽셀 0개\nk = 7 : blur 와 다른 픽셀 0개\nk = 4 : 예외 발생 (짝수 커널)',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

// TODO: k x k 평균 필터를 직접 구현하세요 (k 는 홀수)
Mat myMean(const Mat& src, int k)
{
    Mat dst = src.clone();   // 지금은 복사만 한다
    return dst;
}

int main()
{
    Mat src = imread("images/gradient_noise.png", IMREAD_GRAYSCALE);
    int ks[] = { 3, 5, 7 };
    for (int k : ks)
    {
        Mat mine = myMean(src, k), ref, diff;
        blur(src, ref, Size(k, k));
        absdiff(mine, ref, diff);
        cout << "k = " << k << " : blur 와 다른 픽셀 " << countNonZero(diff) << "개" << endl;
    }
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

Mat myMean(const Mat& src, int k)
{
    CV_Assert(src.type() == CV_8UC1 && k % 2 == 1 && k >= 1);
    int r = k / 2;
    Mat pad;
    copyMakeBorder(src, pad, r, r, r, r, BORDER_REFLECT_101);

    Mat dst(src.size(), CV_8UC1);
    for (int y = 0; y < src.rows; y++)
    {
        uchar* out = dst.ptr<uchar>(y);
        for (int x = 0; x < src.cols; x++)
        {
            int s = 0;
            for (int dy = 0; dy < k; dy++)
            {
                const uchar* p = pad.ptr<uchar>(y + dy) + x;   // (y+dy) 행의 x 열부터
                for (int dx = 0; dx < k; dx++) s += p[dx];
            }
            out[x] = saturate_cast<uchar>((double)s / (k * k));
        }
    }
    return dst;
}

int main()
{
    Mat src = imread("images/gradient_noise.png", IMREAD_GRAYSCALE);
    int ks[] = { 3, 5, 7 };
    for (int k : ks)
    {
        Mat mine = myMean(src, k), ref, diff;
        blur(src, ref, Size(k, k));
        absdiff(mine, ref, diff);
        cout << "k = " << k << " : blur 와 다른 픽셀 " << countNonZero(diff) << "개" << endl;
    }
    try { myMean(src, 4); }
    catch (const cv::Exception& e) { cout << "k = 4 : 예외 발생 (짝수 커널)" << endl; }
    return 0;
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: '필터링 ① 컨볼루션과 블러', subtitle: '커널이 미끄러진다 — blur · GaussianBlur · filter2D', notes: '<p>💬 “카메라로 찍은 사진을 확대해 보면 왜 자글자글한 점이 보일까요?” — 센서 잡음. 이 차시는 그 점들을 지우는 방법과, 같은 도구로 오히려 선명하게 만드는 방법을 배웁니다. 07차시 이진화에서 잡음 때문에 결과가 지저분했던 경험을 떠올리게 합니다. (3분)</p>' },
          { layout: 'bullets', title: '왜 필터링부터 배우나', lead: '거의 모든 비전 파이프라인의 첫 단계', bullets: [
            '잡음 한 점이 <b>이진화 · 에지 검출</b> 결과를 망친다',
            '필터 = <b>커널(작은 숫자 표)</b> 을 이미지에 미끄러뜨리는 계산 = 컨볼루션',
            '같은 도구로 <b>흐리게(블러)</b> 도, <b>또렷하게(샤프닝)</b> 도 만든다',
            ['이 교시에서', ['손계산 → <code>ptr</code> 반복문으로 직접 구현 → <code>blur</code> 와 비교', 'GaussianBlur 와 커널 크기 효과', '<code>Mat_&lt;float&gt;</code> 커널 + filter2D']]
          ], notes: '<p>필터는 목적이 두 가지(잡음 제거 · 강조)라는 점을 먼저 말해 둡니다. 다음 교시는 잡음 종류별 대응, 10차시는 에지 커널로 이어진다고 지도를 그려 줍니다. (4분)</p>' },
          { layout: 'diagram', title: '컨볼루션: 커널이 미끄러진다', html: FIG_CONV, caption: '3×3 이웃 × 커널 → 곱해서 더한 값이 출력 픽셀 하나', notes: '<p>판서로 한 칸 옮겨 가며 두 번째 픽셀도 함께 계산해 봅니다. 💬 “가운데 90 은 어디로 갔을까요?” — 68 로 묻혔다 = 블러. 💬 “왼쪽 맨 끝 픽셀은 어떻게 계산할까요?” — 이미지 밖이 필요하다 → 뒤에서 BORDER_* 로 이어집니다. (6분)</p>' },
          { layout: 'code', title: '손계산 = blur 확인', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/gradient_clean.png", IMREAD_GRAYSCALE);
    Mat roi = img(Rect(96, 148, 5, 5)).clone();     // 원의 왼쪽 에지
    cout << roi << endl;

    int sum = 0;
    for (int dy = -1; dy <= 1; dy++)
        for (int dx = -1; dx <= 1; dx++)
            sum += roi.at<uchar>(2 + dy, 2 + dx);
    cout << "3x3 합 " << sum << format(", 평균 %.2f", sum / 9.0) << endl;

    Mat blurred;
    blur(roi, blurred, Size(3, 3));
    cout << "blur 가운데 = " << (int)blurred.at<uchar>(2, 2) << endl;
    return 0;
}`, points: ['<code>cout &lt;&lt; roi</code> 로 Mat 값을 그대로 확인', '<code>at&lt;uchar&gt;(행, 열)</code> 순서 · 출력은 <code>(int)</code>', '손 평균 ≈ blur 의 가운데 값 → 컨볼루션 확인'], notes: '<p>학생이 직접 <code>Rect</code> 위치를 바꿔 다른 자리에서도 확인하게 합니다. 반올림 때문에 67.67 → 68 이 된다는 것을 짚습니다. <code>clone()</code> 을 빼면 어떻게 되는지(ROI 는 원본 공유) 03차시를 복습합니다. (5분)</p>' },
          { layout: 'diagram', title: '직접 구현: 행 포인터 3개', html: FIG_PTR, caption: 'copyMakeBorder 로 테두리 → up · mid · dn 행 포인터로 9개 합', notes: '<p>💬 “<code>at</code> 을 9번 부르는 것과 무엇이 다를까요?” — 행 주소를 한 번만 계산하고, Debug 의 범위 검사도 행마다 한 번. 경계 처리를 위해 테두리를 먼저 붙이는 이유(반복문 안에서 if 로 검사하지 않으려고)를 설명합니다. (4분)</p>' },
          { layout: 'code', title: 'myMean3x3 vs blur', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat src = imread("images/gradient_noise.png", IMREAD_GRAYSCALE), pad;
    copyMakeBorder(src, pad, 1, 1, 1, 1, BORDER_REFLECT_101);
    Mat mine(src.size(), CV_8UC1), ref, diff;
    for (int y = 0; y < src.rows; y++)
    {
        const uchar *up = pad.ptr<uchar>(y), *mid = pad.ptr<uchar>(y + 1), *dn = pad.ptr<uchar>(y + 2);
        uchar* out = mine.ptr<uchar>(y);
        for (int x = 0; x < src.cols; x++)
            out[x] = saturate_cast<uchar>((up[x] + up[x+1] + up[x+2] + mid[x] + mid[x+1]
                     + mid[x+2] + dn[x] + dn[x+1] + dn[x+2]) / 9.0);
    }
    blur(src, ref, Size(3, 3));
    absdiff(mine, ref, diff);
    cout << "다른 픽셀 수 = " << countNonZero(diff) << endl;
    return 0;
}`, points: ['<code>saturate_cast&lt;uchar&gt;</code> = 반올림 + 0~255 자르기', '같은 경계 규칙(REFLECT_101) → <b>다른 픽셀 0개</b>', '640×480 이중 반복도 C++ 에서는 순식간'], notes: '<p>실행 후 0 이 나오면 박수! 💬 “REFLECT_101 을 REPLICATE 로 바꾸면?” — 가장자리 픽셀만 달라진다(학생이 직접 바꿔 확인). 본문 예제 2 는 같은 코드를 함수로 정리한 버전입니다. (6분)</p>' },
          { layout: 'diagram', title: '평균 커널 vs 가우시안 커널', html: FIG_KERNEL2, caption: '평균은 평평한 가중치, 가우시안은 종 모양 가중치 (1D × 1D 로 분리 가능)', notes: '<p>💬 “멀리 있는 픽셀과 바로 옆 픽셀을 똑같이 믿어도 될까요?” — 가까운 이웃이 더 비슷하다 → 가우시안. 실무 전처리의 기본값은 <code>GaussianBlur</code> 라고 못 박아 줍니다. 오른쪽의 “분리 가능”은 예제 5(getGaussianKernel)에서 확인한다고 예고. (4분)</p>' },
          { layout: 'code', title: 'PSNR 로 성능을 숫자로', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat noisy = imread("images/gradient_noise.png", IMREAD_GRAYSCALE);
    Mat clean = imread("images/gradient_clean.png", IMREAD_GRAYSCALE);
    cout << format("필터 없음  %.2f dB", PSNR(clean, noisy)) << endl;

    Mat box, gau;
    blur(noisy, box, Size(3, 3));
    cout << format("blur 3x3   %.2f dB", PSNR(clean, box)) << endl;
    GaussianBlur(noisy, gau, Size(5, 5), 1.5);
    cout << format("Gauss 5x5  %.2f dB", PSNR(clean, gau)) << endl;

    imshow("gauss", gau);
    waitKey(0);
    return 0;
}`, points: ['정답 영상이 있으면 PSNR(dB) 로 비교 — <b>클수록 좋다</b>', '잡음 영상은 약 24.7 dB', 'sigma 0 = 커널 크기에서 자동 계산'], notes: '<p>PSNR = 10·log₁₀(255²/MSE). 2교시에 직접 구현해 본다고 예고합니다. 💬 “그럼 커널을 아주 크게 하면 PSNR 이 계속 올라갈까요?” — 다음 슬라이드에서 확인. (4분)</p>' },
          { layout: 'code', title: '커널 크기 3 · 9 · 21', code: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>
using namespace cv;
using namespace std;

int main()
{
    Mat noisy = imread("images/gradient_noise.png", IMREAD_GRAYSCALE);
    Mat clean = imread("images/gradient_clean.png", IMREAD_GRAYSCALE);
    int sizes[] = { 3, 9, 21 };
    for (int k : sizes)
    {
        Mat dst;
        GaussianBlur(noisy, dst, Size(k, k), 0);
        Scalar m, sd;
        meanStdDev(dst, m, sd);
        cout << format("ksize %d: PSNR %.2f dB, 표준편차 %.2f", k, PSNR(clean, dst), sd[0]) << endl;
        imshow("gaussian " + to_string(k), dst);
    }
    waitKey(0);
    return 0;
}`, points: ['3×3 → 잡음만 살짝, 21×21 → 글자도 사라짐', '표준편차가 줄면 대비도 줄었다는 뜻', '잡음 제거와 세부 보존은 서로 반대 방향'], notes: '<p>결과 창의 세 이미지를 나란히 놓고 가는 세로선(굵기 2~7 px)이 어디서부터 사라지는지 찾게 합니다. 💬 “치수를 재야 하는 검사에서 21×21 블러를 쓰면 어떻게 될까요?” — 에지가 밀려 측정값이 틀어진다. (5분)</p>' },
          { layout: 'code', title: 'filter2D: Mat_<float> 커널', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/sample_color.png", IMREAD_COLOR);
    Mat sharpK = (Mat_<float>(3, 3) <<  0, -1,  0,
                                       -1,  5, -1,
                                        0, -1,  0);
    Mat embossK = (Mat_<float>(3, 3) << -2, -1, 0,
                                        -1,  0, 1,
                                         0,  1, 2);
    Mat sharp, emboss;
    filter2D(img, sharp, -1, sharpK);
    filter2D(img, emboss, -1, embossK, Point(-1, -1), 128);
    imshow("sharpen", sharp);
    imshow("emboss", emboss);
    waitKey(0);
    return 0;
}`, points: ['쉼표 초기화는 <b>행 우선</b> — 줄을 맞춰 쓰면 모양이 보인다', '합 1 → 밝기 유지 / 합 0 → <code>delta</code> 128 필요', '<code>ddepth = -1</code> → 입력과 같은 형식 (포화)'], notes: '<p>가운데 값 5 를 6, 9 로 바꿔 실행해 보게 합니다. 💬 “샤프닝이 잡음을 늘리는 이유는?” — 잡음도 이웃과 다른 값이므로 함께 강조된다. 여기서 “선명하게 = 차이 강조”라는 직관을 만듭니다. (6분)</p>' },
          { layout: 'diagram', title: '가장자리는 어떻게? BORDER_*', html: FIG_BORDER, caption: '기본값은 REFLECT_101 — CONSTANT 는 가장자리를 어둡게 만든다', notes: '<p>💬 “CONSTANT(0) 로 하면 검사 영상의 가장자리에서 어떤 문제가 생길까요?” — 테두리가 어두워져 가짜 에지 · 가짜 결함. 실무 기본값은 그대로 두는 것이 안전하다고 정리합니다. 예제 7 을 실행해 네 줄의 값을 함께 읽습니다. (3분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>GaussianBlur(src, dst, Size(4, 4), 0);</code> 을 실행하면?', options: ['4×4 커널로 잘 동작한다', '커널이 짝수라서 예외가 난다', '자동으로 5×5 가 된다', '결과가 원본과 같다'], answer: 1, explain: '커널은 앵커(가운데)가 필요하므로 <b>홀수</b>여야 합니다. <code>Size(0, 0)</code> 만 “sigma 로 정하라”는 예외입니다.', notes: '<p>정답 2번. 실제로 편집기에서 4 를 넣고 실행해 <code>cv::Exception</code> 메시지(<code>ksize.width % 2 == 1</code>)를 함께 읽습니다 — 오류를 읽는 습관을 들입니다. (2분)</p>' },
          { layout: 'practice', title: '실습: 내 커널로 세로 에지 강조', desc: '<p><code>[-1 0 1; -2 0 2; -1 0 1]</code> 커널을 <code>Mat_&lt;float&gt;</code> 로 만들어 <code>gradient_clean.png</code> 에 적용하고 평균 · 표준편차를 출력하세요.</p><ul><li>합이 0 → <code>delta</code> 128</li><li>커널을 <code>[-1 -2 -1; 0 0 0; 1 2 1]</code> 로 바꾸면 무엇이 강조되나?</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/gradient_clean.png", IMREAD_GRAYSCALE);
    // TODO: 세로 에지 커널을 만드세요
    Mat kx = (Mat_<float>(3, 3) << 0, 0, 0, 0, 1, 0, 0, 0, 0);

    Mat dst;
    filter2D(img, dst, -1, kx, Point(-1, -1), 128);
    Scalar m, sd;
    meanStdDev(dst, m, sd);
    cout << format("평균 %.1f, 표준편차 %.2f", m[0], sd[0]) << endl;
    imshow("vertical edge", dst);
    waitKey(0);
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat img = imread("images/gradient_clean.png", IMREAD_GRAYSCALE);
    Mat kx = (Mat_<float>(3, 3) << -1, 0, 1, -2, 0, 2, -1, 0, 1);
    Mat ky = (Mat_<float>(3, 3) << -1, -2, -1, 0, 0, 0, 1, 2, 1);

    Mat dx, dy;
    filter2D(img, dx, -1, kx, Point(-1, -1), 128);
    filter2D(img, dy, -1, ky, Point(-1, -1), 128);
    Scalar m, sd;
    meanStdDev(dx, m, sd);
    cout << format("세로 에지: 평균 %.1f, 표준편차 %.2f", m[0], sd[0]) << endl;
    imshow("vertical edge", dx);
    imshow("horizontal edge", dy);
    waitKey(0);
    return 0;
}`, notes: '<p>세로선이 밝게/어둡게 쌍으로 나타나는 것을 확인시킵니다. 이 커널의 이름이 <b>Sobel</b> 이고 10차시에서 <code>Sobel()</code> 한 줄로 쓴다고 예고하면 동기가 생깁니다. 빨리 끝난 학생은 실습 3(k×k 평균 함수)에 도전. (6분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['필터 = 커널을 미끄러뜨려 곱하고 더하기(컨볼루션). 커널은 <b>홀수</b>', '직접 구현: <code>copyMakeBorder</code> + <code>ptr&lt;uchar&gt;</code> 행 포인터 + <code>saturate_cast</code>', '<code>blur</code>(평균) · <code>boxFilter</code> · <code>GaussianBlur</code>(종 모양, 전처리 표준, 분리 가능)', '커널을 키우면 잡음 ↓ 이지만 에지 · 가는 선도 함께 사라진다', '<code>filter2D</code> + <code>Mat_&lt;float&gt;</code> 커널 → 샤프닝 · 엠보싱 (합 0 이면 <code>delta</code>)', '가장자리 규칙 <code>BORDER_DEFAULT</code> = <code>BORDER_REFLECT_101</code>'], notes: '<p>세 가지를 기억하게 합니다: 홀수 커널 · 커널 합의 의미 · 가우시안이 기본. 다음 교시 예고: 소금-후추 잡음에는 가우시안이 아예 안 통한다는 것을 보여 준다고 예고합니다. (2분)</p>' }
        ]
      },
      {
        id: 'cv08-2', title: '잡음 제거: median · bilateral · PSNR · 언샤프 마스크', minutes: 50,
        goals: ['가우시안 잡음과 임펄스 잡음을 구분하고 알맞은 필터를 고를 수 있다', 'medianBlur 가 임펄스 잡음을 지우고 구조를 보존하는 것을 결과로 확인하고, 중간값 필터를 직접 구현할 수 있다', 'bilateralFilter · 언샤프 마스크를 적용하고 PSNR(직접 구현 포함)로 평가할 수 있다'],
        flow: [['도입: 잡음 종류', 7], ['medianBlur · 직접 구현', 14], ['bilateralFilter · PSNR', 14], ['언샤프 마스크 · 선택 가이드', 10], ['정리 · 퀴즈', 5]],
        content: [
          { type: 'h', text: '잡음에도 종류가 있다' },
          { type: 'p', html: '1교시에서 배운 가우시안 블러는 만능이 아닙니다. <b>잡음의 성질</b>에 따라 알맞은 필터가 다릅니다. 산업 현장에서 만나는 잡음은 크게 두 가지입니다.' },
          { type: 'figure', html: FIG_NOISE, caption: '그림 5. 가우시안 잡음은 모든 픽셀이 조금씩 흔들리고, 임펄스 잡음은 일부 픽셀만 0 · 255 로 튄다' },
          { type: 'table', head: ['잡음', '원인', '모습', '알맞은 필터'], rows: [
            ['가우시안(Gaussian)', '센서 열잡음 · 낮은 노출 · 높은 게인', '전체가 자글자글', '<b>GaussianBlur</b> · blur · bilateral'],
            ['임펄스(소금-후추)', '전송 오류 · 불량 화소(dead pixel) · 먼지', '흰 점 · 검은 점이 흩뿌려짐', '<b>medianBlur</b>'],
            ['주기 잡음', '조명 깜빡임 · 격자 무늬', '규칙적인 줄무늬', 'DFT 노치 필터 (심화)'],
            ['얼룩 · 조명 기울기', '불균일 조명', '넓게 밝고 어두움', '큰 커널 배경 추정 · 모폴로지 (09차시)']
          ], caption: '표 3. 잡음 종류와 대응. 먼저 “어떤 잡음인가”를 보는 것이 순서다' },
          { type: 'image', src: 'images/salt_pepper.png', caption: 'salt_pepper.png — flange.png 에 소금 4% + 후추 4% 임펄스 잡음을 넣은 영상. 원본에는 구멍이 7개(중앙 보어 1 + 볼트 구멍 6) 있다', width: 420 },
          { type: 'code', title: '예제 1: 잡음의 정체를 숫자로 확인', code: EX_NOISEKIND,
            desc: '<code>sp == 255</code> 는 C++ 연산자 오버로딩으로 <b>값이 정확히 255 인 픽셀만 255, 나머지 0</b> 인 마스크 Mat 을 만듭니다. 같은 일을 <code>compare(sp, 0, mask, CMP_EQ)</code> 함수로도 할 수 있습니다. <code>countNonZero</code> 로 세면 소금 · 후추 비율이 각각 약 4% 로 나옵니다. 가우시안 잡음 영상(<code>gradient_noise</code>)은 PSNR 이 24.67 dB 인데, <b>8% 만 망가진 임펄스 잡음 영상이 오히려 PSNR 이 더 낮습니다</b> — 망가진 픽셀의 오차가 매우 크기 때문입니다. <code>format</code> 안에서 <code>%</code> 글자는 <code>%%</code> 로 씁니다.',
            expect: '전체 픽셀 307200\n소금(255) 12125 = 3.9 %\n후추(0)   12206 = 4.0 %\n원본(flange) 대비 PSNR = 15.54 dB\n가우시안 잡음 영상의 PSNR = 24.67 dB' },
          { type: 'h', text: 'medianBlur: 정렬해서 가운데를 고른다' },
          { type: 'p', html: '중간값 필터는 곱셈 · 덧셈이 아니라 <b>정렬</b>을 씁니다. 커널 안의 값을 크기 순으로 줄 세우고 정확히 가운데 값을 고릅니다. 그래서 0 이나 255 로 튄 값은 양 끝으로 밀려나 <b>선택되지 않습니다</b>. 가중치가 없는 <b>비선형(non-linear) 필터</b> 입니다.' },
          { type: 'figure', html: FIG_MEDIAN, caption: '그림 6. 중간값은 튄 값 하나에 끌려가지 않는다. 평균은 83 으로 번지고 중간값은 62 로 깨끗하다' },
          { type: 'code', title: '예제 2: medianBlur 는 잡음만 지우고 구멍 7개를 지킨다', code: EX_MEDIAN,
            desc: '<code>flange.png</code> 원본에는 구멍이 <b>7개</b>(중앙 보어 1 + 볼트 구멍 6) 있습니다. 세 경우 모두 “면적 50 이 넘는 큰 구멍”은 7개로 나오지만, <b>윤곽선 총 개수</b>를 보면 차이가 확연합니다. 필터 없이 이진화하면 잡음 점 하나하나가 윤곽선이 되어 <b>1만 개가 넘고</b>, <code>GaussianBlur(5×5)</code> 는 점을 <b>회색으로 번지게만</b> 해서 얼룩 윤곽선이 <b>77개</b> 남습니다. <code>medianBlur(5)</code> 는 <b>외곽 1 + 구멍 7 = 8개</b>로 깔끔합니다. 윤곽선은 <code>vector&lt;vector&lt;Point&gt;&gt;</code>, 계층은 <code>vector&lt;Vec4i&gt;</code> 로 받고 <code>hi[i][3]</code>(부모) 가 0 이상이면 내부 윤곽선 = 구멍입니다 (12차시에서 자세히).',
            expect: '필터 없음 : 윤곽선 10399개, 구멍 7개\nMedian   : 윤곽선 8개, 구멍 7개\nGaussian : 윤곽선 77개, 구멍 7개' },
          { type: 'code', title: '예제 3: 3×3 중간값 필터 직접 구현 (std::nth_element)', code: EX_MYMEDIAN,
            desc: '9개 값을 <code>uchar v[9]</code> 배열에 모으고 <code>&lt;algorithm&gt;</code> 의 <code>nth_element(v, v + 4, v + 9)</code> 로 <b>5번째로 작은 값만</b> 제자리에 놓습니다 — 전체를 정렬(<code>sort</code>)할 필요가 없어 더 빠릅니다. <code>medianBlur</code> 는 경계에서 <b>REPLICATE</b> 규칙을 쓰므로 똑같이 맞췄습니다. 다른 픽셀 수가 0 이면 성공입니다. 직접 만든 3×3 중간값만으로도 PSNR 이 15 dB 에서 40 dB 이상으로 뛰는 것을 확인하세요.',
            expect: 'medianBlur(3) 와 다른 픽셀 수 = 0\n직접 만든 중간값 PSNR = 43.17 dB' },
          { type: 'callout', kind: 'warn', title: 'medianBlur 주의점', html: '<ul><li><code>ksize</code> 는 <b>정수 하나</b>(3, 5, 7…)이고 홀수여야 합니다.</li><li>8비트 영상에서 <code>ksize</code> 5 이하는 매우 빠르지만 7 이상은 알고리즘이 바뀌어 느려집니다. 16비트 · 실수 영상은 <code>ksize</code> 3 · 5 만 됩니다.</li><li>커널이 크면 <b>가는 선 · 작은 점이 아예 지워집니다</b>. 0.5 px 급 결함을 찾는 검사에서는 위험합니다 — 결함까지 잡음으로 지워 버릴 수 있습니다.</li></ul>' },
          { type: 'h', text: 'bilateralFilter: 에지는 남기고 면만 매끈하게' },
          { type: 'p', html: '가우시안 블러는 “가까운 이웃일수록 많이 섞는다”만 봅니다. <b>양방향 필터(Bilateral Filter)</b> 는 여기에 “<b>밝기가 비슷한 이웃일수록 많이 섞는다</b>”를 곱합니다. 그래서 에지 반대편의 아주 다른 밝기는 거의 섞이지 않고, 같은 면 안의 잡음만 지워집니다.' },
          { type: 'figure', html: FIG_BILATERAL, caption: '그림 7. 양방향 필터는 거리 × 밝기 차 가중치로 에지를 보존한다' },
          { type: 'p', html: '<code>bilateralFilter(src, dst, d, sigmaColor, sigmaSpace)</code> — <code>d</code> 는 이웃의 지름(0 이하면 <code>sigmaSpace</code> 에서 계산), <code>sigmaColor</code> 는 “얼마나 다른 밝기까지 같은 면으로 볼까”(크면 가우시안에 가까워짐), <code>sigmaSpace</code> 는 공간 범위입니다. 실무에서는 <code>d = 5~9</code>, <code>sigmaColor = 25~75</code> 부터 시작합니다. <b>src 와 dst 가 같으면 안 됩니다</b>(in-place 불가).' },
          { type: 'code', title: '예제 4: 에지를 가로지르는 한 줄 비교', code: EX_BILATERAL,
            desc: '<code>gradient_clean.png</code> 의 사각형은 (420, 150) 을 중심으로 150×90 크기라 왼쪽 에지가 x ≈ 345 에 있습니다. <code>printRow</code> 함수는 <code>ptr&lt;uchar&gt;(y)</code> 로 한 행의 주소를 얻어 x0~x1 을 출력합니다. 세 줄의 숫자를 비교하세요: <code>GaussianBlur(7×7, σ=2)</code> 는 에지 양쪽 값이 서로 섞여 <b>계단이 완만한 경사</b>가 되지만, <code>bilateralFilter</code> 는 <b>계단 모양이 거의 그대로</b>입니다. 에지 위치로 치수를 재는 검사에서는 이 차이가 곧 측정 오차입니다.',
            expect: 'x=340..352 의 밝기 (에지 통과, y=150)\n원본     : 127 117 140 141 142 196 223 250 240 223 226 223 252\nGaussian : 135 135 138 147 163 183 203 219 229 233 232 232 232\nBilateral: 133 137 136 141 147 189 219 229 232 232 231 231 233' },
          { type: 'code', title: '예제 5: 네 필터를 PSNR 로 한 번에 비교', code: EX_COMPARE,
            desc: '이 영상에서는 <b>bilateral &gt; median &gt; Gaussian &gt; blur</b> 순서입니다. 도형과 가는 선이 많아 <b>에지를 지키는 필터가 유리</b>하기 때문입니다. 반면 <code>salt_pepper.png</code> 에서는 median 이 Gaussian 보다 15 dB 이상 높아 격차가 훨씬 큽니다(실습 1). 즉 <b>PSNR 순위는 영상과 잡음 종류에 따라 달라집니다</b>. PSNR 하나만 보고 필터를 고르면 안 됩니다 — 다음에 할 처리(이진화? 치수 측정? 사람이 보기?)가 기준입니다.',
            expect: '잡음 영상        : 24.67 dB\nblur(5x5)        : 28.20 dB\nGaussianBlur(5x5): 29.61 dB\nmedianBlur(5)    : 32.91 dB\nbilateral(7,40,7): 35.91 dB' },
          { type: 'h', text: 'PSNR 을 직접 계산해 보기' },
          { type: 'code', title: '예제 6: MSE · PSNR 직접 구현 (ptr 반복문 · norm)', code: EX_MYPSNR,
            desc: 'MSE = 두 영상의 차이를 제곱해 평균낸 값, PSNR = 10·log<sub>10</sub>(255² / MSE) [dB]. 반복문에서 차이를 <code>(double)pa[x] - pb[x]</code> 로 계산한 점을 보세요 — <code>uchar</code> 끼리의 뺄셈을 <code>uchar</code> 에 담으면 음수가 사라집니다(퀴즈 5). <code>norm(a, b, NORM_L2)</code> 는 √(차이 제곱의 합) 이므로 제곱해서 픽셀 수로 나누면 MSE 입니다. 두 영상이 완전히 같으면 MSE = 0 → PSNR = ∞(<code>inf</code>) 입니다.',
            expect: '잡음 영상:\n  MSE = 221.67\n  직접 계산 24.67 dB / PSNR() 24.67 dB\n  norm 으로: MSE = 221.67\n같은 영상:\n  MSE = 0.00\n  PSNR = inf' },
          { type: 'callout', kind: 'more', title: '📘 PSNR 감 잡기', html: '대략 <b>20 dB 이하 = 눈에 잘 보이는 잡음</b>, <b>30 dB 이상 = 꽤 비슷함</b>, <b>40 dB 이상 = 거의 구분 안 됨</b> 정도로 감을 잡으세요. 정답 영상이 없는 현장에서는 PSNR 을 쓸 수 없으므로, 평평한 영역의 <b>표준편차</b>(<code>meanStdDev</code> + ROI)나 최종 검사 결과(개수 · 치수 오차)로 평가합니다. Python 에서는 <code>cv2.PSNR(a, b)</code> 로 이름이 같습니다.' },
          { type: 'h', text: '언샤프 마스크: 블러를 빼서 선명하게' },
          { type: 'p', html: '흐린 영상을 또렷하게 만드는 표준 방법입니다. 원본에서 블러를 빼면 <b>세부(고주파)</b> 만 남습니다. 이것을 원본에 다시 더하면 세부가 강조됩니다.' },
          { type: 'figure', html: FIG_UNSHARP, caption: '그림 8. 언샤프 마스크 = 원본 + k × (원본 − 블러) = addWeighted(src, 1+k, blur, −k, 0, dst)' },
          { type: 'code', title: '예제 7: 언샤프 마스크 (addWeighted)', code: EX_UNSHARP,
            desc: '<code>addWeighted(src1, alpha, src2, beta, gamma, dst)</code> 는 <code>dst = alpha·src1 + beta·src2 + gamma</code> 를 계산합니다(포화 처리 포함 — 중간 계산은 실수라 음수도 잃지 않음). 언샤프 마스크는 <code>alpha = 1+k</code>, <code>beta = −k</code> 입니다. k 를 키우면 표준편차(대비)가 커지며 또렷해지지만, 에지에 흰 테두리(오버슈트)가 생기고 잡음까지 강조됩니다. <code>Size(0, 0)</code> + σ 로 블러 크기를 지정한 것과, 변수 이름을 <code>blur</code> 함수와 겹치지 않게 <code>blurImg</code> 로 지은 것도 눈여겨보세요.',
            expect: 'k = 0.5 : 평균 119.2, 표준편차 39.35 (클수록 대비가 세다)\nk = 1.0 : 평균 119.2, 표준편차 40.07 (클수록 대비가 세다)\nk = 2.0 : 평균 119.2, 표준편차 41.69 (클수록 대비가 세다)\n원본     : 평균 119.2, 표준편차 38.73' },
          { type: 'h', text: '필터 선택 가이드' },
          { type: 'table', head: ['상황', '고를 필터', '이유 · 팁'], rows: [
            ['일반 전처리 (이진화 · 에지 전)', '<code>GaussianBlur(3~5)</code>', '가장 무난한 기본값. 커널을 최소로'],
            ['흰 점 · 검은 점(먼지 · 불량 화소)', '<code>medianBlur(3 또는 5)</code>', '점이 번지지 않고 사라진다'],
            ['치수 · 서브픽셀 에지 측정', '<code>GaussianBlur(3)</code> 또는 <code>bilateralFilter</code>', '큰 커널은 에지를 밀어 측정 오차가 된다'],
            ['사람이 보는 화면 (미관)', '<code>bilateralFilter</code> + 언샤프', '표면이 매끈하면서 윤곽은 선명'],
            ['속도가 최우선 (고속 라인)', '<code>blur</code> 또는 <code>boxFilter</code>', '누적 합으로 커널 크기와 거의 무관하게 빠름'],
            ['조명 기울기 · 얼룩', '큰 커널 블러로 배경 추정 후 빼기 · 나누기', '09차시 모폴로지(TOPHAT/BLACKHAT) 와 함께'],
            ['흐린 영상 되살리기', '언샤프 마스크 (k 0.5~1.5)', '잡음도 함께 커진다 → 먼저 잡음 제거']
          ], caption: '표 4. 목적별 필터 선택. “다음 단계가 무엇인가”가 기준이다' },
          { type: 'callout', kind: 'warn', title: '브라우저 실습 환경의 제한 — fastNlMeansDenoising', html: '<code>fastNlMeansDenoising</code>(비국소 평균 잡음 제거, <code>photo</code> 모듈)은 이 사이트의 OpenCV.js 에 포함되어 있지 않아 <b>브라우저에서는 실행되지 않습니다</b>. 로컬 PC 의 OpenCV 5.0 에서는 잘 동작하며, 가우시안 잡음 제거 성능이 가장 좋은 편입니다(대신 수십~수백 배 느립니다). 아래 코드를 Visual Studio 에서 실행해 PSNR 과 시간을 예제 5 와 비교해 보세요.' },
          { type: 'code', title: '추가: fastNlMeansDenoising 과 시간 비교 (Visual Studio)', code: EX_NLM_LOCAL, run: false, local: true, file: 'main.cpp',
            desc: '<code>TickMeter</code> 로 처리 시간을 잽니다. 로컬 PC 에서 <b>Release</b> 로 빌드해야 의미 있는 시간이 나옵니다(Debug 는 몇 배 느림). 비국소 평균은 멀리 떨어진 <b>비슷한 패치</b>들을 찾아 평균하므로, 반복 무늬가 많은 영상에서 특히 강합니다.' },
          { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 · 오개념 지도', html: '<ul><li><b>준비</b>: <code>salt_pepper.png</code> 와 <code>flange.png</code> 를 결과 창에 나란히 띄워 두면 비교가 쉽습니다. 예제 2 는 윤곽선 개수를 쓰므로 “12차시에서 배울 것”이라고 미리 선을 그어 주세요.</li><li><b>오개념 1</b>: “블러는 화질을 나쁘게 하는 것” → 다음 단계(이진화 · 에지)의 결과를 좋게 하는 <b>전처리</b>임을 강조.</li><li><b>오개념 2</b>: “PSNR 이 높은 필터가 항상 좋다” → 치수 측정에서는 에지 보존이 더 중요. 예제 4 의 숫자 줄로 반박.</li><li><b>오개념 3</b>: “medianBlur 가 만능” → 커널이 크면 가는 선 · 작은 결함까지 지운다. 실습 1 에서 직접 확인시키세요.</li><li><b>C++ 포인트</b>: <code>uchar</code> 뺄셈의 음수 소실, <code>nth_element</code>, <code>const Mat&amp;</code> 전달 — 퀴즈 5 와 예제 3 · 6 으로 확인.</li><li><b>평가 루브릭</b>: ① 잡음 종류를 보고 필터를 고를 수 있다(40%) ② 커널 크기 · 인수를 바꿔 결과를 설명한다(30%) ③ PSNR 등 숫자로 근거를 댄다(30%).</li><li>💬 마무리 발문: “필터로 지울 수 없는 잡음은 무엇일까?” — 물체와 크기 · 밝기가 비슷한 잡음. 그때는 모폴로지(09차시)나 형상 특징(12차시)으로 구분한다고 이어 줍니다.</li></ul>' }
        ],
        practice: [
          {
            title: 'medianBlur 커널 크기와 잡음 제거율', level: 2,
            desc: '<code>images/salt_pepper.png</code> 에 <code>medianBlur</code> 를 커널 3, 5, 7 로 적용하고, 원본 <code>images/flange.png</code> 대비 PSNR 을 각각 출력하세요. 같은 크기의 <code>GaussianBlur</code> 결과도 함께 출력해 비교하고, 가장 좋은 조합을 마지막 줄에 쓰세요.',
            hint: '<code>for (int k = 3; k &lt;= 7; k += 2)</code>. median 은 <code>medianBlur(sp, med, k)</code>, Gaussian 은 <code>GaussianBlur(sp, gau, Size(k, k), 0)</code>. PSNR 은 <code>PSNR(clean, med)</code>. median 이 Gaussian 보다 10 dB 이상 높게 나오면 성공입니다.',
            expect: '필터 없음 : 15.54 dB\nksize 3 : median 43.17 dB / Gaussian 23.43 dB\nksize 5 : median 43.28 dB / Gaussian 25.54 dB\nksize 7 : median 41.46 dB / Gaussian 27.10 dB\n가장 좋은 조합 = medianBlur(5) 43.28 dB',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat clean = imread("images/flange.png", IMREAD_GRAYSCALE);
    Mat sp = imread("images/salt_pepper.png", IMREAD_GRAYSCALE);
    cout << format("필터 없음 : %.2f dB", PSNR(clean, sp)) << endl;

    for (int k = 3; k <= 7; k += 2)
    {
        Mat med;
        medianBlur(sp, med, k);
        // TODO: median 의 PSNR 을 출력하세요

        // TODO: 같은 크기의 GaussianBlur 결과도 출력해 비교하세요
    }
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat clean = imread("images/flange.png", IMREAD_GRAYSCALE);
    Mat sp = imread("images/salt_pepper.png", IMREAD_GRAYSCALE);
    cout << format("필터 없음 : %.2f dB", PSNR(clean, sp)) << endl;

    double best = -1;
    int bestK = 0;
    for (int k = 3; k <= 7; k += 2)
    {
        Mat med, gau;
        medianBlur(sp, med, k);
        GaussianBlur(sp, gau, Size(k, k), 0);
        double pm = PSNR(clean, med), pg = PSNR(clean, gau);
        cout << format("ksize %d : median %.2f dB / Gaussian %.2f dB", k, pm, pg) << endl;
        if (pm > best) { best = pm; bestK = k; }
        imshow(format("median %d", k), med);
    }
    cout << format("가장 좋은 조합 = medianBlur(%d) %.2f dB", bestK, best) << endl;
    waitKey(0);
    return 0;
}`
          },
          {
            title: '잡음 제거 → 선명화 파이프라인 만들기', level: 3,
            desc: '<code>images/gradient_noise.png</code> 를 ① <code>bilateralFilter</code> 로 잡음을 줄이고 ② 언샤프 마스크(<code>addWeighted</code>)로 선명하게 만드는 2단계 파이프라인을 완성하세요. 각 단계의 PSNR(<code>gradient_clean.png</code> 대비)을 출력해서, 선명화를 하면 PSNR 이 오히려 낮아지는 것을 확인하고 왜 그런지 주석으로 설명하세요.',
            hint: '① <code>bilateralFilter(noisy, bil, 7, 50, 7)</code> ② <code>GaussianBlur(bil, blurImg, Size(0, 0), 2)</code> 로 블러를 만들고 <code>addWeighted(bil, 1.8, blurImg, -0.8, 0, sharp)</code>. 선명화는 “원본과의 차이”를 키우는 일이므로 PSNR(차이가 작을수록 큰 값)과는 목표가 다릅니다.',
            expect: '1. 원본(잡음)     : 24.67 dB\n2. bilateral      : 36.20 dB\n3. + 언샤프(k=0.8): 30.92 dB',
            starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat clean = imread("images/gradient_clean.png", IMREAD_GRAYSCALE);
    Mat noisy = imread("images/gradient_noise.png", IMREAD_GRAYSCALE);
    cout << format("1. 원본(잡음)     : %.2f dB", PSNR(clean, noisy)) << endl;

    // TODO: ① bilateralFilter 로 잡음 제거 후 PSNR 출력
    Mat bil;

    // TODO: ② 언샤프 마스크로 선명화 후 PSNR 출력
    Mat blurImg, sharp;

    imshow("noisy", noisy);
    waitKey(0);
    return 0;
}`,
            solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat clean = imread("images/gradient_clean.png", IMREAD_GRAYSCALE);
    Mat noisy = imread("images/gradient_noise.png", IMREAD_GRAYSCALE);
    cout << format("1. 원본(잡음)     : %.2f dB", PSNR(clean, noisy)) << endl;

    Mat bil;
    bilateralFilter(noisy, bil, 7, 50, 7);
    cout << format("2. bilateral      : %.2f dB", PSNR(clean, bil)) << endl;

    Mat blurImg, sharp;
    GaussianBlur(bil, blurImg, Size(0, 0), 2);
    addWeighted(bil, 1.8, blurImg, -0.8, 0, sharp);        // k = 0.8
    cout << format("3. + 언샤프(k=0.8): %.2f dB", PSNR(clean, sharp)) << endl;

    // 선명화는 원본과의 '차이'를 키우는 처리이므로 PSNR(차이가 작을수록 좋은 지표)은 낮아진다.
    // 눈으로 보기 좋은 것과 원본에 수치적으로 가까운 것은 다른 목표다.
    imshow("noisy", noisy);
    imshow("bilateral", bil);
    imshow("sharpened", sharp);
    waitKey(0);
    return 0;
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: '필터링 ② 잡음 제거와 선명화', subtitle: 'medianBlur · bilateralFilter · PSNR · 언샤프 마스크', notes: '<p>1교시 복습으로 시작: 커널 · 홀수 · 가우시안. 💬 “가우시안 블러로 지워지지 않는 잡음이 있을까요?” 오늘의 답은 “있다 — 소금-후추”. (3분)</p>' },
          { layout: 'image', title: '문제: 이 영상의 구멍을 세어 보자', src: 'images/salt_pepper.png', caption: 'flange.png 에 소금 4% + 후추 4% — 원본 구멍은 7개(중앙 보어 1 + 볼트 6)', notes: '<p>먼저 육안으로 구멍이 몇 개인지 물어봅니다(7개). 💬 “이 영상을 그냥 이진화하면 윤곽선이 몇 개 나올까요?” — 실제로 <b>1만 개가 넘습니다</b>(흰 점 · 검은 점이 모두 윤곽선). 이 교시의 목표를 “윤곽선 8개만 남기기”로 잡아 줍니다. 이어서 본문 그림 5(잡음 두 종류)를 띄우고 💬 “평균을 내면 어느 쪽이 잘 지워질까요?” — 가우시안은 상쇄되고, 임펄스는 255 가 평균을 끌어올려 번진다. 원인(센서 잡음 vs 불량 화소 · 먼지)도 짚어 줍니다. (6분)</p>' },
          { layout: 'diagram', title: 'medianBlur: 정렬해서 가운데', html: FIG_MEDIAN, caption: '중간값 62 vs 평균 83 — 튄 값 하나에 끌려가지 않는다', notes: '<p>학생 9명을 세워 키 순으로 줄 세우는 비유가 잘 통합니다. 한 명이 사다리를 타도 가운데 사람 키는 안 바뀐다. “비선형 필터라서 커널 가중치가 없다”는 점도 언급합니다. (4분)</p>' },
          { layout: 'code', title: 'median vs Gaussian — 윤곽선 개수', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat sp = imread("images/salt_pepper.png", IMREAD_GRAYSCALE);
    Mat med, gau, bin;
    medianBlur(sp, med, 5);                         // ksize 는 정수 하나!
    GaussianBlur(sp, gau, Size(5, 5), 0);

    threshold(med, bin, 0, 255, THRESH_BINARY | THRESH_OTSU);
    vector<vector<Point>> cs;
    vector<Vec4i> hi;
    findContours(bin, cs, hi, RETR_CCOMP, CHAIN_APPROX_SIMPLE);
    cout << "median 후 윤곽선 " << cs.size() << "개" << endl;

    imshow("median 5", med);
    imshow("gaussian 5", gau);
    waitKey(0);
    return 0;
}`, points: ['정답은 구멍 7개 + 외곽 1 = 윤곽선 8개', 'median 은 점이 <b>사라지고</b>, Gaussian 은 <b>번져서 남는다</b>', '<code>medianBlur</code> 의 ksize 는 <code>Size</code> 가 아니다'], notes: '<p>결과 창의 두 이미지를 확대해서 Gaussian 쪽에 남은 회색 얼룩을 보여 줍니다. 본문 예제 2 에서 세 경우(필터 없음 · median · Gaussian)의 윤곽선 개수를 함께 찍어 비교합니다. 윤곽선 · 계층 코드는 12차시 예고로 가볍게 넘어갑니다. (6분)</p>' },
          { layout: 'code', title: '직접 구현: nth_element 로 중간값', code: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <algorithm>
using namespace cv;
using namespace std;

int main()
{
    Mat sp = imread("images/salt_pepper.png", IMREAD_GRAYSCALE), pad, ref, diff;
    copyMakeBorder(sp, pad, 1, 1, 1, 1, BORDER_REPLICATE);
    Mat mine(sp.size(), CV_8UC1);
    uchar v[9];
    for (int y = 0; y < sp.rows; y++)
        for (int x = 0; x < sp.cols; x++)
        {
            for (int i = 0; i < 9; i++) v[i] = pad.at<uchar>(y + i / 3, x + i % 3);
            nth_element(v, v + 4, v + 9);          // 5번째로 작은 값만 제자리에
            mine.at<uchar>(y, x) = v[4];
        }
    medianBlur(sp, ref, 3);
    absdiff(mine, ref, diff);
    cout << "다른 픽셀 수 = " << countNonZero(diff) << endl;
    return 0;
}`, points: ['9개를 배열에 모아 <b>가운데(인덱스 4)</b> 선택', '<code>nth_element</code> — 전체 정렬보다 빠르다', 'medianBlur 의 경계 = <b>REPLICATE</b>'], notes: '<p>💬 “sort 로 해도 될까요?” — 된다, 다만 필요 없는 일까지 한다. <code>i / 3</code>, <code>i % 3</code> 으로 9칸을 한 줄 반복으로 도는 요령도 짚습니다. 본문 예제 3 은 행 포인터를 쓴 더 빠른 버전입니다. (5분)</p>' },
          { layout: 'diagram', title: 'bilateralFilter: 에지 보존', html: FIG_BILATERAL, caption: '거리 × 밝기 차 가중치 → 면만 매끈, 에지는 그대로', notes: '<p>💬 “치수를 재는 검사에서 에지가 흐려지면 어떤 문제가 생길까요?” — 50% 지점이 밀려 측정값이 틀어진다. 인수 세 개(d, sigmaColor, sigmaSpace)의 의미와 “느리다 · in-place 불가”라는 단점을 명확히 말합니다. (4분)</p>' },
          { layout: 'code', title: '에지를 가로지르는 한 줄 비교', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

void printRow(const char* name, const Mat& img, int y)
{
    cout << name;
    const uchar* p = img.ptr<uchar>(y);
    for (int x = 340; x <= 352; x++) cout << format(" %3d", p[x]);
    cout << endl;
}

int main()
{
    Mat noisy = imread("images/gradient_noise.png", IMREAD_GRAYSCALE), gau, bil;
    GaussianBlur(noisy, gau, Size(7, 7), 2);
    bilateralFilter(noisy, bil, 7, 50, 7);
    printRow("원본     :", noisy, 150);
    printRow("Gaussian :", gau, 150);
    printRow("Bilateral:", bil, 150);
    return 0;
}`, points: ['사각형 왼쪽 에지(x≈345)를 가로지르는 한 줄', 'Gaussian: 계단 → 완만한 경사', 'Bilateral: 계단 모양 유지 + 잡음만 감소'], notes: '<p>숫자 세 줄을 함께 읽으며 어디서 값이 뛰는지 손으로 짚습니다. 이런 “1D 프로파일 읽기”가 캘리퍼 측정의 기본이라고 예고합니다(13차시 · 실전). (5분)</p>' },
          { layout: 'code', title: 'PSNR 직접 구현', code: `#include <opencv2/opencv.hpp>
#include <iostream>
#include <cmath>
using namespace cv;
using namespace std;

int main()
{
    Mat a = imread("images/gradient_clean.png", IMREAD_GRAYSCALE);
    Mat b = imread("images/gradient_noise.png", IMREAD_GRAYSCALE);
    double se = 0;
    for (int y = 0; y < a.rows; y++)
    {
        const uchar *pa = a.ptr<uchar>(y), *pb = b.ptr<uchar>(y);
        for (int x = 0; x < a.cols; x++)
            se += ((double)pa[x] - pb[x]) * ((double)pa[x] - pb[x]);   // uchar 뺄셈 주의!
    }
    double mse = se / a.total();
    cout << format("MSE %.2f → 직접 %.2f dB / PSNR() %.2f dB", mse,
                   10 * log10(255.0 * 255.0 / mse), PSNR(a, b)) << endl;
    return 0;
}`, points: ['MSE = 차이 제곱의 평균, PSNR = 10·log₁₀(255²/MSE)', '차이는 <code>double</code>(또는 <code>int</code>)로 — uchar 는 음수 없음', '직접 계산 = <code>PSNR()</code> 이면 이해 완료'], notes: '<p>💬 “<code>double d</code> 를 <code>uchar d</code> 로 바꾸면?” — 직접 바꿔 실행해 MSE 가 엉뚱해지는 것을 보여 줍니다(퀴즈 5). 합을 <code>int</code> 로 받으면 넘칠 수 있는지도 계산해 봅니다(255² × 30만 ≈ 200억 → int 범위 초과!). (5분)</p>' },
          { layout: 'code', title: '네 필터를 PSNR 로 비교', code: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat clean = imread("images/gradient_clean.png", IMREAD_GRAYSCALE);
    Mat noisy = imread("images/gradient_noise.png", IMREAD_GRAYSCALE);
    Mat box, gau, med, bil;
    blur(noisy, box, Size(5, 5));
    GaussianBlur(noisy, gau, Size(5, 5), 1.5);
    medianBlur(noisy, med, 5);
    bilateralFilter(noisy, bil, 7, 40, 7);
    cout << format("blur      %.2f dB", PSNR(clean, box)) << endl;
    cout << format("Gaussian  %.2f dB", PSNR(clean, gau)) << endl;
    cout << format("median    %.2f dB", PSNR(clean, med)) << endl;
    cout << format("bilateral %.2f dB", PSNR(clean, bil)) << endl;
    return 0;
}`, points: ['이 영상: blur &lt; Gaussian &lt; median &lt; <b>bilateral</b>', '도형 · 가는 선이 많은 영상 → <b>에지를 지키는 필터가 유리</b>', 'salt_pepper 에서는 median 이 압도 — 순위가 영상마다 다르다'], notes: '<p>💬 “왜 bilateral 이 1위일까?” — 이 영상은 도형 · 세로선 · 글자가 많아 에지를 지키는 것이 오차를 줄인다. 실습 1(salt_pepper)에서는 median 이 압도한다는 것을 예고해 <b>정답은 영상마다 다르다</b>를 못 박습니다. (4분)</p>' },
          { layout: 'diagram', title: '언샤프 마스크', html: FIG_UNSHARP, caption: '원본 + k × (원본 − 블러) = addWeighted(src, 1+k, blur, −k, 0, dst)', notes: '<p>“빼서 남은 것이 세부”라는 직관을 강조합니다. 💬 “왜 이름이 언샤프(unsharp) 마스크일까?” — 흐린(unsharp) 영상을 마스크로 쓰기 때문. 인쇄 제판 시절의 용어입니다. k=2.0 결과를 확대해 에지의 흰 테두리(오버슈트)를 찾게 합니다. 순서는 <b>잡음 제거 → 선명화</b>. (4분)</p>' },
          { layout: 'table', title: '필터 선택 가이드', head: ['상황', '고를 필터'], rows: [
            ['일반 전처리 (이진화 · 에지 전)', '<code>GaussianBlur(3~5)</code>'],
            ['흰 점 · 검은 점 (먼지 · 불량 화소)', '<code>medianBlur(3 또는 5)</code>'],
            ['치수 · 서브픽셀 에지 측정', '<code>GaussianBlur(3)</code> / <code>bilateralFilter</code>'],
            ['사람이 보는 화면', '<code>bilateralFilter</code> + 언샤프'],
            ['속도 최우선', '<code>blur</code> · <code>boxFilter</code>'],
            ['조명 기울기 · 얼룩', '큰 커널 배경 추정 · 모폴로지 (09차시)'],
            ['최고 품질 (로컬 전용)', '<code>fastNlMeansDenoising</code> — 느림']
          ], notes: '<p>표를 노트에 옮겨 적게 합니다. 기준은 “<b>다음 단계가 무엇인가</b>”. fastNlMeansDenoising 은 브라우저에서 안 되므로 Visual Studio 에서 과제로 해 보게 합니다. 09차시 모폴로지로 자연스럽게 연결합니다. (3분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '소금-후추(임펄스) 잡음에 가장 알맞은 필터는?', options: ['<code>blur</code>', '<code>GaussianBlur</code>', '<code>medianBlur</code>', '<code>boxFilter</code>'], answer: 2, explain: '평균 계열은 튄 값에 끌려가 잡음이 번집니다. 중간값은 정렬해서 가운데를 고르므로 튄 값이 버려집니다.', notes: '<p>정답 3번. 틀린 학생에게는 그림 6 의 정렬 줄을 다시 보여 줍니다. (1분)</p>' },
          { layout: 'practice', title: '실습: median 커널 크기 찾기', desc: '<p><code>salt_pepper.png</code> 에 median 3 · 5 · 7 과 같은 크기 Gaussian 을 적용하고 <code>flange.png</code> 대비 PSNR 을 비교하세요.</p><ul><li>median 이 Gaussian 보다 10 dB 이상 높으면 성공</li><li>커널을 더 키우면 왜 다시 나빠지는지 설명</li></ul>', starter: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat clean = imread("images/flange.png", IMREAD_GRAYSCALE);
    Mat sp = imread("images/salt_pepper.png", IMREAD_GRAYSCALE);
    cout << format("필터 없음 : %.2f dB", PSNR(clean, sp)) << endl;
    for (int k = 3; k <= 7; k += 2)
    {
        Mat med;
        medianBlur(sp, med, k);
        // TODO: median · Gaussian 의 PSNR 을 출력하세요
    }
    return 0;
}`, solution: `#include <opencv2/opencv.hpp>
#include <iostream>
using namespace cv;
using namespace std;

int main()
{
    Mat clean = imread("images/flange.png", IMREAD_GRAYSCALE);
    Mat sp = imread("images/salt_pepper.png", IMREAD_GRAYSCALE);
    cout << format("필터 없음 : %.2f dB", PSNR(clean, sp)) << endl;
    for (int k = 3; k <= 7; k += 2)
    {
        Mat med, gau;
        medianBlur(sp, med, k);
        GaussianBlur(sp, gau, Size(k, k), 0);
        cout << format("ksize %d : median %.2f dB / Gaussian %.2f dB",
                       k, PSNR(clean, med), PSNR(clean, gau)) << endl;
    }
    return 0;
}`, notes: '<p>median 5 가 가장 좋게 나옵니다(잡음 8% 는 3×3 으로는 조금 부족). 7 이상은 플랜지의 가는 구조를 지우기 시작해 다시 나빠집니다. 여기서 “커널은 잡음을 이길 만큼만 크게”라는 원칙을 정리합니다. (6분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['잡음 종류를 먼저 본다: 가우시안(전체 자글자글) vs 임펄스(점)', '<b>임펄스 → medianBlur</b> (직접 구현: <code>nth_element</code>), 가우시안 → GaussianBlur', '<b>bilateralFilter</b> = 거리 × 밝기 차 → 에지 보존 (느림 · in-place 불가)', '<b>PSNR</b>(dB) = 10·log₁₀(255²/MSE) — 목적이 치수 측정이면 에지 보존이 우선', '언샤프 마스크 = <code>addWeighted(src, 1+k, blur, −k, 0, dst)</code> — 잡음 제거 → 선명화 순서', '다음 차시: 모폴로지 — <b>모양</b>으로 지우고 메우고 이어 붙인다'], notes: '<p>오늘의 한 줄: “필터는 다음 단계를 위해 고른다.” 09차시 예고 — 이진 영상에서 남은 점과 구멍을 <b>모양</b>으로 처리하는 방법(열기 · 닫기)을 배운다고 예고하면 자연스럽게 이어집니다. (2분)</p>' }
        ]
      }
    ]
  });
})();
