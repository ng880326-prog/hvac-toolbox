# 水管/流體＋熱工類公式驗證報告（Fluids & Thermal Verification Report）

- 工作簿：HVAC Toolbox Pro（Excel）
- 檢驗範圍：Pipe Sizing / Coil / Coil Support / Hx / Chiller / Boiler / AHU / FCU / SAC / Insulations / NPSH / PN
- 方法：sheet 快取值抽驗（用 PowerShell 重算）+ 權威出處比對（ASHRAE Fundamentals、CIBSE Guide C、AHRI 550/590、IAPWS/ASME 蒸汽表、GB 50264-2013、ISO 12241、香港 EMSD BEC 2012/2021）
- 判定符號：✅ 正確 ｜ ⚠️ 可用但有誤差/注意事項 ｜ ❌ 疑似錯誤
- 驗證日期：2026-01（以實際執行日為準）

---

## 0. 執行摘要

| 結論 | 數量 |
|---|---|
| ✅ 正確 | 約 38 項 |
| ⚠️ 可用但需注意 | 約 12 項 |
| ❌ 疑似錯誤 | 2 項（Boiler 換算表 2 處）+ 1 項標籤誤導 |

**最需要修正的三件事：**
1. **Boiler 單位換算表**：`kW×860` 標示為 `Mcal/hr`（應為 `×0.86` 或改標 `kcal/hr`）——差 1000 倍；`AJ17 = AJ16/2.6` 與同一表內其他 `÷9.83` 的 HP 定義互相矛盾。
2. **「668」不是汽化熱**：668 kcal/kg 的講法不成立（100°C 汽化熱 = 539 kcal/kg）。它在 Boiler 表中實際是「**1 Ton/hr ≈ 668 kW**」（10 barg 蒸汽、~90°C 給水的 Δh≈2405 kJ/kg 換算值），用法本身自洽，但若被文件標為汽化熱會誤導。
3. **Chiller `10.7×3.516`**：`10.7` 是 ft²→m² 換算倒數 10.7639 的粗值（0.6% 誤差），**不是** AHRI 效率常數；IPLV 權重（0.01/0.42/0.45/0.12）本身 ✅ 正確。

---

## 1. 水管 Hazen-Williams（Pipe Sizing / Coil / FCU 共用）

**Excel 原文**
```
P7 = ROUND(6.819*(O7/$E$7)^1.852/(K7/1000)^1.167*1000*9.81, 0)   ' ΔP Pa/m
AF7 = (IF($AD7=0,AF$5,$AD7)/1000/9.81*($K7/1000)^1.167/6.819)^(1/1.852)*$E$7  ' 反算 V
E7 = IF(AF52=1,140,100)   ' 閉式 140 / 開式 100
```
V = m/s、D = mm、C = 粗糙係數、ΔP = Pa/m。

**標準公式（SI Hazen-Williams）**
```
h_f (m/m) = 10.67 · Q^1.852 / (C^1.852 · d^4.8704)，Q = m³/s，d = m
代入 Q = V·π·d²/4：
h_f = 10.67·(π/4)^1.852 · (V/C)^1.852 / d^1.1664
ΔP (Pa/m) = ρ·g·h_f = 1000×9.81×h_f
```

**數值驗證**
- 常數：`10.67×(π/4)^1.852 = 6.8214`；表內用 **6.819**（低 0.035%，可忽略）。
- 指數：表內 `1.167` vs 理論 `1.1664`（差 0.05%，可忽略）。
- 快取值抽驗：DN15，ID=16.2 mm，V=0.6567 m/s，C=140 → 重算 = **399.96 Pa/m → 400 ✓**（與表一致）。
- DN20，ID=21.7 mm，V=0.78955 m/s → 重算 = **400.00 Pa/m ✓**。
- 反算 V（AF7）與正算互逆 ✓；`AF6 = AF5/1000/9.81*100 = 4.0775 m/100m`（400 Pa/m 換水頭）✓。

**出處**
- ASHRAE Handbook—Fundamentals, Ch. 22 Pipe Sizing（SI 式 `h_f = 10.67 Q^1.852/(C^1.852 d^4.8704)`，d 用 m）。
- [Engineering ToolBox – Hazen-Williams Water Flow Formula](https://www.engineeringtoolbox.com/hazen-williams-water-d_797.html)（同式之 US 版本 0.2083(100/C)^1.852 q^1.852/d^4.8655，並註明適用 Re>10⁵、水溫 5–25°C、ν≈1.1 cSt）。
- C 值：鋼管新管 140–150、焊接無縫鋼管 100、鑄鐵 100 —— [Engineering ToolBox – Hazen-Williams Coefficients](https://www.engineeringtoolbox.com/hazen-williams-coefficients-d_798.html)。開式系統因腐蝕/老舊取 100、閉式新管取 140 為常見保守慣例（CIBSE Guide C 亦同精神）。

**判定：✅ 正確**（常數 6.819 與指數 1.167 有 <0.05% 捨入，無需修改）。注意 Hazen-Williams 為經驗式，僅適用於水、湍流、常溫；熱水（如 HWS 80/60°C）誤差會變大，可考慮 Darcy-Weisbach（工程手冊同見上述出處）。

---

## 2. 管速 2.5 m/s、比摩阻 400 Pa/m 設計慣例

**Excel 原文**
```
AG5 = $E$10 = 2.5 (m/s 上限) ; AF5 = $E$11 = 400 (Pa/m 上限)   ' Pipe Sizing
DX5 = D45 = 2.5 ; DW5 = D46 = 300                                ' Coil
CA5 = 300 Pa/m ; CB5 = 2.5 m/s                                   ' FCU 快速配管
```

**出處與慣例**
- ASHRAE Handbook—Fundamentals（Pipe Sizing 章節圖表）：一般空調水系統建議摩擦損失 1–4 ft/100 ft（**100–400 Pa/m**），一般服務流速約 4 fps（1.2 m/s）以下；絕對上限（防沖蝕/噪音）10–15 fps（3–4.6 m/s）。詳見 [aircondlounge – Chilled Water Pipe Sizing Guide](https://aircondlounge.com/chilled-water-pipe-sizing-guide-chart-standard-calculator/)（引述 ASHRAE 圖表準則：≤2″ 管用 4 fps，>2″ 管用 4 ft/100 ft ≈ 400 Pa/m）。
- Carrier System Design Manual：泵浦出口 8–12 fps、立管 3–10 fps，沖蝕限度隨年運轉時數 8–15 fps。
- CIBSE Guide C（2007）參考資料：[CIBSE Guide C](https://www.cibse.org/knowledge-research/knowledge-portal/guide-c-reference-data-2007/) 一般建議幹管 ≤2.5 m/s、末端 ≤1.5 m/s。

**判定：✅ 正確（設計慣例）**。2.5 m/s 略高於 ASHRAE 一般服務建議（1.2–2.4 m/s）但在 Carrier/CIBSE 允許範圍內，作為「上限」並配合 400 Pa/m 雙重約束是可接受的工程慣例；Coil/FCU 用 300 Pa/m 更保守，亦屬常見。**建議在 UI 標註「ASHRAE 一般建議 1.2–2.4 m/s、100–400 Pa/m」以免使用者以為是強制規定。**

---

## 3. 冷量單位換算

| Excel 公式 | 檢驗 | 判定 |
|---|---|---|
| `R7/3.517`、`S7 = R7/3.517` | 1 RT = 12000 Btu/h × 0.293071 W/(Btu/h) = **3516.9 W = 3.5169 kW**；3.516 與 3.517 都是取整近似（差 0.03%） | ⚠️ 建議全簿統一為 **3.517**（ASHRAE/維基定義值） |
| `*3412`、`/3412` | 1 kW = 3412.14 Btu/h ✓ | ✅ |
| `*860`、`/860` | 1 kW = 859.85 kcal/h ✓ | ✅ |
| `*12000` | 1 RT = 12000 Btu/h ✓（ASHRAE/美制冷凍噸定義） | ✅ |
| `*2.6`、`/2.6`（SAC、Chiller、Boiler 部分格） | 2.6 kW/HP 是**中國「空調匹」市場慣例**（1 匹≈2600 W），非 SI、非鍋爐馬力（9.81 kW）、非機械馬力（0.746 kW） | ⚠️ 名稱「HP」極易誤解；建議改標「匹(PRC)」或改用 kW |

**出處**
- [維基百科：冷凍噸](https://zh.wikipedia.org/wiki/%E5%86%B7%E5%87%8D%E5%99%B8)：1 美制冷凍噸 = 12000 Btu/h = 3024 kcal/h = 3.517 kW。
- NIST SP811 附錄 B（同頁引用）。
- 1 鍋爐馬力 = 33,475 Btu/h = 9.81 kW（[Engineering ToolBox – Boiler Horsepower](https://www.engineeringtoolbox.com/boiler-horsepower-d_1061.html)；[Ontario Gazette 定義](https://files.ontario.ca/books/ontariogazette_134-27.pdf)）。

**判定：⚠️（值正確、但 3.516/3.517 混用與「HP=2.6 kW」標籤需注意）**。

---

## 4. 水流量 Q = m·cp·ΔT

| Excel 公式 | 檢驗 | 判定 |
|---|---|---|
| `R7 = M7*4.186789*$Q$4`（kW = L/s×4.186789×ΔT） | 4.186789 kJ/kgK = 熱化學卡定義值（4.1868 J/cal）；常用值 4.185/4.186/4.2 皆為近似。抽驗：0.13537 L/s×4.186789×8 = 4.534 kW ✓（表值一致） | ✅（建議統一為 4.185 或 4.186） |
| `L6 = J6/(4.2*(12-7))`（FCU） | **輸出單位是 L/s**（欄頭 "CHWS/R L/s"），不是 GPM。kW/(4.2×ΔT) = L/s ✓；2.312/(4.2×5) = 0.1101 ✓ | ✅ 公式對；⚠️ 若有人把它當 GPM 會差 15.85 倍（GPM = L/s×15.85）。全簿未見 GPM 公式 |
| `M6 = K6/(4.2*(60-50))`（FCU 加熱） | 同式 ΔT=10 ✓ | ✅ |
| `U23 = U6*1000/4.185/U12`（Boiler 熱水鍋爐，MW→L/s） | MW×1000/4.185/ΔT = L/s ✓ | ✅ |
| `P32 = M7/4.185/C13`（Hx 熱側 kg/s） | kW/4.185/ΔT = kg/s（ρ≈1 時= L/s）✓ | ✅ |
| `E43 = $AG$48*4.185*G43`（Pipe Sizing HWS 容量） | L/s×4.185×ΔT = kW ✓ | ✅ |

**出處**：Q = ṁ·cp·ΔT（熱力學基本式）；cp 水 20–60°C ≈ 4.18–4.19 kJ/kgK（[Engineering ToolBox – Water Specific Heat](https://www.engineeringtoolbox.com/specific-heat-capacity-water-d_660.html)）。

**判定：✅**（4.186789/4.185/4.2 混用屬正常工程精度範圍）。

---

## 5. Hx 熱交換器

**Excel 原文（sheet 24_Hx.txt）**
```
O6 = ABS(C16-C11)              ' ΔT1 = |冷出−熱入|
O7 = ABS(C15-C12)              ' ΔT2 = |冷入−熱出|
O8 = IF(... , IF(O6-O7=0,(C17+C13)/2,(O6-O7)/LN(O6/O7)))   ' LMTD；ΔT=0 → 算術平均
C27 = M7/C23/O8*1000           ' A = Q(kW)×1000/(U×LMTD)
J31 = IF(C11-C12>=0,"ok","x")  ' 熱入≥熱出
J35 = IF(C15-C16<=0,"ok","x")  ' 冷出≥冷入
H40 = H38*H39 ; J39 = IF(H40<=0,"x","ok")   ' 溫度交叉檢查
K31/K39 = "Error: Inappropriate Temperatures" / "Error: Temperature Cross"
```

**檢驗**
- LMTD = (ΔT1−ΔT2)/ln(ΔT1/ΔT2)（逆流）✅；ΔT1=ΔT2 時以算術平均 (ΔT1+ΔT2)/2 取代 ✅（lim x→1 之極限）。
- 抽驗：熱 80/60、冷 45/55 → ΔT1=25、ΔT2=15 → LMTD = **19.576** ✓。
- Q = U·A·LMTD → A = Q/(U·LMTD)，×1000 為 kW→W ✓；U 預設 5000 W/m²K 在板式水-水換熱器合理範圍（3000–7000）✅。
- 溫度交叉檢查邏輯 ✅：對逆流，冷出 > 熱出（H38=冷出−熱入 或 冷入−熱出 乘積 ≤0）即交叉。雙「ok/x」狀態合併為 `J41 = AND(ok,ok,ok)` ✅。
- ⚠️ 標籤瑕疵：`B25 = "A = U∆T / Q"` 文字是「面積=U·ΔT/Q」的錯排（應為 Q = U·A·ΔT），僅為顯示文字，不影響計算（實際 C27 = M7/C23/O8*1000 正確）。

**出處**：LMTD 定義見任何傳熱學教材；工程版（TEMA/板式逆流）同 [Engineering ToolBox – Arithmetic & Logarithmic Mean Temperature Difference](https://www.engineeringtoolbox.com/arithmetic-logarithmic-mean-temperature-difference-d_436.html)（註：該頁為算術平均與對數平均之關係）。HISAKA 板式選型（表內引用 hisaka.co.jp）採逆流 LMTD。

**判定：✅**（僅顯示文字 B25 建議修正）。

---

## 6. Coil / Coil Support 盤管與濕空氣

**Excel 原文與抽驗（全部以 sheet 快取值重算核對）**

| 公式 | 標準式 | 抽驗 | 判定 |
|---|---|---|---|
| `CR4 = EXP(CP4+CQ4)/1000`，CP4 = −5800.2206/T+1.3914993−0.048640239T，CQ4 = 4.1764768e-5T²−1.4452093e-8T³+6.5459673·ln(T) | ASHRAE Fundamentals 飽和水蒸氣壓式（T=K，p=Pa，0–200°C） | T=301.15K → 3.7822 kPa ✓ | ✅ |
| `CS4 = 0.62198*CR4/(F3-CR4)` | W_s = 0.621945·p_ws/(P−p_ws)（ASHRAE） | 0.024117 ✓ | ✅ |
| `DC4 = 1.006*CL4+DE4*(2501+1.805*CL4)` | h = 1.006t + W(2501+1.86t)（ASHRAE 用 **1.86**，表用 1.805） | 35°C, W=0.02113 → 89.396 ✓ | ✅（1.805 vs 1.86 差 <0.05%） |
| `DE4 = ((2501-2.381*WB)*W_s(WB)-(DB-WB))/(2501+1.805*DB-4.186*WB)` | 標準濕球迭代式（ASHRAE/CIBSE） | 35/28°C → 0.021132 ✓ | ✅ |
| `DD4 = 6.54+14.526*LN(CZ4)+0.7389*LN²+0.09486*LN³+0.4569*p^0.1984` | ASHRAE 露點溫式（p=kPa，0–93°C） | 25.83°C ✓ | ✅ |
| `DA4 = 0.2871*(t+273.15)*(1+1.6078*W)/P` | ρ = 1/v，v = R_a·T(1+1.607858W)/P（ASHRAE，R_a=0.287042；表用 0.2871） | 0.9028 kg/m³ ✓ | ✅（0.02% 差） |
| `DB4 = CY4/(1-(1-CY4)*(CW4/F3))*100` | RH（ASHRAE） | 59.16% ✓ | ✅ |
| `E16 = E14/(E14+E15)`（SHR） | SHR = Qs/(Qs+Ql) | — | ✅ |
| `W11/(W11+W15)`（BF 旁通係數） | BF = (h_off−h_adp)/(h_on−h_adp) | — | ✅ |
| `(W14*X14*(Z14-AA14)*2500.8)`（潛熱） | Q_l = V·ρ·(W1−W2)·h_fg(0°C=2500.8 kJ/kg) | — | ✅（ASHRAE 用 2501，差 0.01%） |
| `((U23/(W23*F4*2500.8))+AA23)`（ADP 反算） | t_adp 由 W_adp=W_off−Q_l/(V·ρ·h_fg) 反查 | — | ✅ 近似（忽略顯熱耦合，工程可接受） |
| `BF23`（冷凝水量 kg/hr 區） | m_cond = V·ρ·(W1−W2) | — | ✅ |
| Coil Support 固定點迭代 `IF(ABS(H40-I40)<0.00005,...)` | ADP/WB 迭代收斂檢查 | — | ✅ |
| `AV16 = AT16/(AY16-AZ16)/AW16`（加濕量 L/s） | Q/(Δh)/4.2 型（kW/(kJ/kg)/cp） | — | ✅ |
| 水側 `6.819*(DS7/DP2)^1.852/...`（DT15=300 Pa/m） | 同 §1 Hazen-Williams | — | ✅ |

**出處**
- ASHRAE Handbook—Fundamentals 2017, Ch. 1 Psychrometrics（p_ws、W=0.621945、h、露點式、v=R_aT(1+1.607858W)/p）。
- 濕空氣數學整理（引 ASHRAE 2017 + IAPWS）：[Equinor NeqSim – Humid air mathematics](https://equinor.github.io/neqsim/wiki/humid_air_math.html)。
- 濕球/ADP 迭代與 BF 定義：ASHRAE Fundamentals Ch. 23（Coils）/Carrier 盤管文獻。

**判定：✅ 整體正確**。注意事項：①焓式 cp_v 用 1.805（ASHRAE 1.86、部分中文教材 1.84），誤差可忽略但建議統一；②RH=0 時露點式 `LN(0)` 會 #NUM!（表內有 IF 護欄但 DD5 出現過 #NUM! 快照），建議加 p_w>0 守衛；③DE16 在極端輸入下出現負 W（快照 -1.41e-3），建議 clamp W≥0。

---

## 7. Boiler 鍋爐

### 7.1 蒸汽量與「668」常數
**Excel 原文**
```
AG15 = AG16/668*1000        ' kW → kg/hr
AE16 = AE14*668             ' Ton/hr → kW
AJ16 = AJ18/3412            ' Btu/h → kW
AH16 = AH17*9.83            ' HP → kW
AH18 = AH17*33439           ' HP → Btu/h
```

**檢驗「668」**
- 100°C 水的**汽化熱 = 539.4 kcal/kg**（=2257 kJ/kg）。668 **不是**汽化熱。
- 668 的實際身分：**1 Ton/hr 蒸汽 ≈ 668 kW**。推導：10 barg（11 bar abs）飽和蒸汽 h_g = 2781.7 kJ/kg，給水 90°C h_f = 376.9 kJ/kg → Δh = 2404.8 kJ/kg；1000 kg/hr×2404.8/3600 = **668.0 kW/Ton/hr** ✓ 完全吻合。等價於 Δh = 2404.8 kJ/kg = 574 kcal/kg。
- 全表自洽性：`Ton/hr→kg/hr ×1000` ✓、`Ton/hr→kW ×668` ✓、`kW→kg/hr ×1000/668` ✓、`kg/hr→Ton/hr /1000` ✓。**核心鏈 ✅**。
- ⚠️ 前提敏感：668 依賴「10 barg、給水 90°C」；給水 0°C 時應為 772.7 kW/Ton，給水 100°C 時 655.5 kW/Ton（±16%）。建議改成 `kg/hr = kW×3600/Δh(BR10,Tw)` 動態查表（Pipe Sizing 蒸汽區已有 h_g/h_f 表可複用）。

**出處**：蒸汽性質 [Engineering ToolBox – Water Saturation Pressure](https://www.engineeringtoolbox.com/water-vapor-saturation-pressure-d_599.html)、[Water – Heat of Vaporization](https://www.engineeringtoolbox.com/water-properties-d_1573.html)（100°C h_fg = 2257 kJ/kg）。

### 7.2 單位換算表（AD13:AJ19）逐格核查
| 格 | 公式 | 檢驗 | 判定 |
|---|---|---|---|
| AE15/AF14 | Ton/hr↔kg/hr ×1000/÷1000 | ✓ | ✅ |
| AE16 | Ton/hr×668 → kW | 見 7.1 ✓ | ✅ |
| AE17/AF17/AG17 | kW÷9.83 → HP | 1 鍋爐馬力 = 9.8095 kW；用 9.83 差 0.2% | ⚠️ 建議 9.81 |
| AE18/AF18/AG18/AH18 | HP×33439 → Btu/h | 標準 33,475；用 33,439 差 0.11% | ⚠️ 建議 33475 |
| **AE19/AF19/AG19/AH19/AI19** | **kW×860 標為 "Mcal/hr"** | kW×860 = **kcal/hr**；Mcal/hr 應為 ×0.86 | **❌ 差 1000 倍（或標籤錯）** |
| AJ16 | Btu/h÷3412 → kW | ✓ | ✅ |
| AJ18 | kcal/hr÷860×3412 → Btu/h | ✓ | ✅ |
| **AJ17** | **kW÷2.6 → "HP"** | 同表他列用 9.83（鍋爐馬力）；2.6 是「空調匹」。定義矛盾 | **❌ 不一致** |
| AJ15 | kW×1000/668 → kg/hr | ✓（見 7.1） | ✅ |

### 7.3 安全係數/裕量慣例
| Excel 原文 | 慣例 | 判定 |
|---|---|---|
| `O18 = (I6+I6*0.13)*1.1`（給水泵流量 = 蒸發量×1.13×1.1） | 鍋爐給水泵常用 1.1–1.25× 蒸發量（+排污裕量） | ✅ 合理慣例（13% 排污/波動 + 10% 裕量） |
| `O24 = O18*1.5`（泵浦選型流量×1.5） | 給水泵選型裕量 1.25–1.5× | ✅ |
| `O13 = I7*1000*O12/60`（凝結水箱 = 每小時蒸發量×儲存分鐘） | 凝結水箱 15–30 min 儲量慣例 | ✅ |
| `AA11 = SUM(AA6:AA9)*1.2`（合併煙囪斷面×1.2） | 多爐合併煙囪 +20% 裕量慣例 | ✅ |
| `Z11 = MROUND(AA12,50)` | 煙囪直徑取整 50 mm | ✅ |

### 7.4 膨脹水箱
**檢驗結果：Boiler sheet 內無膨脹水箱計算**（全簿僅 Insulations 提到「膨脹水管」保溫）。若需求包含膨脹水箱選型，屬**缺失功能**，建議另建模組（V_exp = V_sys·[(ρ1/ρ2)−1] 型，按 ASHRAE/CIBSE）。

---

## 8. Chiller

### 8.1 COP / kW/RT
```
AA3: "COP = 3.516 / ikW/RT"
AB6 = IF(AA5=AO26, 1/(AB5/3.516), 3.516/AB5)   ' COP = 3.516 ÷ (kW/RT)
```
COP = Q_cool/P_in = 3.516/kW·RT⁻¹ ✅。抽驗：0.6 kW/RT → COP = 5.86 ✓。

### 8.2 IPLV/NPLV 權重（AHRI 550/590）
```
AA14:AB17 = Loading {1, 0.75, 0.5, 0.25} × 權重 {0.01, 0.42, 0.45, 0.12}
AE14:AE17 = 冷凝水溫 {29.4, 23.9, 18.3, 18.3}°C
AC19 = SUM(AD14:AD17) = Σ AB×AC（ikW/RT 加權）
AA20: "*Reference: ARI 550/590-1998"
```
- IPLV = 0.01A + 0.42B + 0.45C + 0.12D，權重和 = 1 ✓，與 AHRI 550/590 (IP) 完全一致。
- 水冷冷凝器 IPLV 進水溫 29.4/23.9/18.3/18.3°C（85/75/65/65°F）✓ 與 AHRI 550/590 表一致。
- 出處：[EnergyPlus Engineering Reference – IPLV = (0.01A)+(0.42B)+(0.45C)+(0.12D)](https://energyplus.net/assets/nrel_custom/pdfs/pdfs_v24.2.0/EngineeringReference.pdf)；[Daikin WCHX 手冊（引 AHRI 550/590）](https://dbamericas.com/wp-content/uploads/2018/09/WCHX-A_R134a_50Hz_MS04107A-0225_lo.pdf)。

**判定：✅**（NPLV 權重相同，僅冷凝水溫/工況非標稱，表內文字正確）。

### 8.3 `10.7*3.516` 常數
```
AP43 = AO43/(10.7*3.516)     ' ft2/RT → m2/kW
```
- 正確換算：m²/kW = ft²/RT × 0.092903 m²/ft² ÷ 3.516 kW/RT = ft²/RT × 0.026423。
- 表內：÷(10.7×3.516) = ÷37.62 = ×0.026581。**10.7 是 10.7639（ft²→m² 倒數）的四捨五入**，不是 AHRI 效率常數。誤差 0.59%。
- 判定：**⚠️ 形式正確、常數粗糙**（建議 10.76391）。

### 8.4 `2.798708`
`AR43 = AQ43/2.798708`（W/m²→"ft2/HP"）與 `AQ46 = AR46*2.798708`。2.7987 ≈ 9.81/3.516 = 2.790（鍋爐馬力↔RT 換算倒數，0.3% 差），但用在 W/m²↔ft²/HP 維度上不對（正確因子應為 8025.4 = 1000×0.092903/0.7457 之倒數的倒數…即 0.12459 m²/kW）。**判定：⚠️ 常數來源不明、量綱存疑，建議複核該格**（低優先，僅影響冷負荷密度輔助換算區）。

---

## 9. AHU / FCU / SAC 風側

| Excel 公式 | 檢驗 | 判定 |
|---|---|---|
| `W6*X6*(Z6-AA6)`（Coil：V×1.2×(h_on−h_off)，kW） | Q = V·ρ·Δh ✓ | ✅ |
| `AF6*AG6*(AI6-AJ6)`（顯熱：V×1.02×ρ×ΔT） | Qs = V·ρ·cp·ΔT，ρ=1.2、cp=1.02 → 1.224VΔT ✓ | ✅ |
| `E24/1.23/(E25-E26)*1000`（AHU：kW→L/s） | Q = V×1.23×ΔT → V = Q/(1.23ΔT) m³/s；×1000 = L/s ✓。抽驗 20.6 kW/8K → 2093.5 L/s ✓ | ✅ |
| `G6*0.472`（FCU：cfm→L/s） | 1 cfm = 0.47195 L/s ✓（400 cfm→188.8 ✓） | ✅ |
| 面風速：AHU 2.5 m/s、PAU 2.3 m/s（`M4/X4 "AHU (2.5m/s)"`）；SAC `IF(H4=W23,"-",2.5)` | 盤管面風速慣例 1.5–2.5 m/s（ASHRAE 建議 ≤500 fpm≈2.54 m/s；乾冷盤 2–3 m/s） | ✅ |
| SAC/Chiller `*2.6` `/2.6` | 見 §3（空調匹） | ⚠️ |

**出處**：ASHRAE Fundamentals Ch. 23（Coils，面風速 300–600 fpm）；顯熱式 ρ·cp = 1.2×1.02 ≈ 1.23 kJ/m³K 為 HVAC 通用常數（ASHRAE/CIBSE 教材）。

**判定：✅**（除 2.6 匹標籤外）。

---

## 10. NPSH

**Excel 原文（sheet 31_NPSH.txt）**
```
F15 = F14/9.8            ' Ha：kPa → m（流體表面絕對壓力）
F21 = F20+F19            ' Hz = (h1−x)+h2（液面標高±）
F25 = F24/9.8            ' Hv：蒸氣壓 → m
F29 = F15+F21-F25-F27    ' NPSHa = Ha ± Hz − Hf − Hv
F33 = F29-F31            ' NPSHa − NPSHr ≥ 0 → 不氣蝕
```

**檢驗**
- 式與各項定義 ✅（與 ASHRAE Fundamentals / Hydraulic Institute 標準一致：Ha 絕對壓力頭、Hz 靜液面高差（+灌入/−吸入）、Hf 吸入管摩擦+速度頭、Hv 液體在工作溫度之飽和蒸氣壓頭）。
- ⚠️ `kPa/9.8`：正確為 P×1000/(ρ·g)。取 ρ=1000、g=9.8 → /9.8 近似 ✓，但 g 標準值 9.80665（差 0.07%），且**熱水 ρ<1000 使 Hv 被低估**（80°C 水 ρ=972 → 差 2.9%）。建議 `= P/(ρ(T)/1000*9.80665)` 或至少用 9.81。
- 抽驗：大氣 101.325 kPa → Ha = 10.34 m ✓（標準大氣 ≈10.33 m 水柱）。
- 100°C 水：Hv = 101.35/9.8 = 10.34 m → 開式槽 NPSHa ≈ Hz − Hf − 0，與實務一致 ✓。

### 10.1 水蒸氣壓表（C44:D114）
與 [Engineering ToolBox – Water Saturation Pressure](https://www.engineeringtoolbox.com/water-vapor-saturation-pressure-d_599.html)（IAPWS-97 值）逐點比對：

| °C | Sheet kPa | 參考 kPa | 差 |
|---|---|---|---|
| 0.01 | 0.6113 | 0.61165 | −0.06% ✓ |
| 20 | 2.339 | 2.3393 | ✓ |
| 50 | 12.349 | 12.352 | −0.02% ✓ |
| 100 | 101.35 | 101.325(IAPWS)/101.42(表) | ✓ |
| 150 | 475.8 | 476.16 | −0.08% ✓ |
| 300 | 8581 | 8587.9 | −0.08% ✓ |
| 350 | 16513 | 16529 | −0.10% ✓ |
| 370 | 21030 | 21044 | −0.07% ✓ |
| 374.14 | 22090 | 22.064 MPa（IAPWS-95 臨界 373.946°C）；22.09 MPa（ASME/Keenan-Keyes 臨界 374.14°C） | 表採用 **ASME 舊版臨界點** ✓ |

判定：**✅ 表值正確**（與 ASME/Keenan-Keyes 蒸汽表一致，全範圍 <0.1%）。臨界點 374.14°C/22090 kPa 與 IAPWS-95（373.95/22064）差 0.2%/0.1%，工程上等價。
- 線性內插 `INDEX/MATCH`（C41/D40）✅。

---

## 11. Insulations 保溫

### 11.1 等效厚度（圓管→平板）
```
AR4 = 0.5*(S18+2*AQ4)*LN(1+2*AQ4/S18)
S18 = 管外徑 D（mm，VLOOKUP 自管表）；AQ = 試算厚度 t（mm）
```
- 標準式：等效平面厚度 δ_eq = (D/2+δ)·ln(1+2δ/D)（以 D/2 半徑對數平均），用於把圓管保溫折算成平板（經濟厚度/散熱比較）。
- 抽驗：D=100、t=25 → 0.5×150×ln(1.5) = **30.41 mm** ✓（比 25 mm 大，符合幾何直覺）。
- 出處：GB 50264-2013《工業設備及管道絕熱工程設計規範》之圓管折算；ISO 12241:2022《Thermal insulation for building equipment and industrial installations — Calculation rules》（圓管熱流 q_l = 2πΔT/[ln(D2/D1)/λ + …]，[波蘭標準網站引 ISO 12241:2022](https://swiatizolacji.pl/artykuly/grubosc-izolacji-iso12241.html)、[ISO 12241 目錄](https://www.iso.org/standard/74655.html)）。

**判定：✅**

### 11.2 防結露厚度
```
Q13 標籤: "c = 1000*(l/h)*{(qd-q1)/(qm-qd)}"
S13 = 1000*(S6/S7)*((S8-S9)/(S10-S8))
S6=λ W/mK、S7=α W/m²K、S8=qd 露點℃、S9=q1 流體℃、S10=qm 環境℃
```
- 標準式：δ = (λ/α)·(T_d − T_s)/(T_a − T_d)（平板近似，×1000 → mm）。單位檢查：W/mK ÷ W/m²K = m；×1000 = mm ✓。
- 抽驗：λ=0.04、α=8.141、Td=27、Ts=7、Ta=28.8 → δ = 1000×0.004913×20/1.8 = **54.6 mm** ✓ 量級正確（BEC 示例 28.8°C/露點 27°C 即表內註解）。
- 出處：表內自引 **香港 EMSD《Code of Practice for Energy Efficiency of Building Services Installation（BEC 2012）》§6.11** 及 Technical Guidelines —— [EMSD TG-BEC 2012](https://www.emsd.gov.hk/beeo/en/pee/TG-BEC_2012%20%28Rev.%201%29.pdf)、[TG-BEC 2021 §6.11.2](https://www.emsd.gov.hk/beeo/en/pee/TG-BEC_2021.pdf)；同型見 GB 50264-2013 §5（防結露：Ts 取 Td+0.3°C、α_s=8.141 —— [GB 50264 §5.9](https://gf.cabr-fire.com/m/article-11124.htm)）。
- ⚠️ 表內未加 GB 50264 建議的 +0.3°C 露點裕度（BEC 版不需）；如需國內項目適用，建議加裕度。

**判定：✅**（HK/BEC 版正確；國內版建議按 GB 50264 加 0.3°C 裕度）。

---

## 12. PN 壓力分級

| Excel 公式 | 檢驗 | 判定 |
|---|---|---|
| PN 級距 4/6/10/16/20/25（AH8:AN13） | PN 級標準（ISO 7005/EN 1092-1：PN 2.5/6/10/16/25/40；PN20 見於亞洲/ASME 對照慣例） | ✅ |
| `K8*0.09804139432`（m 水柱→bar） | 標準 1 mH2O = ρg×1m = 9806.65 Pa = **0.0980665 bar**。表用 0.09804139432（=g 9.804139432）差 **0.026%** | ⚠️ 建議 0.0980665 |
| `@*9.804139432`（m→kPa） | 標準 9.80665 kPa/m；差 0.026% | ⚠️ |
| `AJ47/100`（kPa→bar） | ×0.01 ✓ | ✅ |
| `AJ45*0.001`（kPa→MPa）、`AK48*1000`（MPa→kPa） | ✓ | ✅ |
| 壓力突破檢查 `IF(N17=0,"Pressure break required","")` | 樓高壓力超過 PN 級時提示減壓（BEC/消防慣例） | ✅ |

**判定：✅（⚠️ 換算常數 0.026% 偏差，可忽略或統一為 9.80665/100）**。

---

## 13. Pipe Sizing 蒸汽管與凝水管

### 13.1 每 kg/hr 蒸汽輸入能量
```
CU4 = 1/((1/(BR11-BR15))*3.6) = (h_g − h_f)/3.6  W/(kg/hr)
BR11 = h_g（EE 表按 BR10 bar 查）、BR15 = 給水/凝水焓 h_f
```
- 推導：W = kg/hr × Δh(kJ/kg)×1000/3600 = Δh/3.6 per kg/hr ✓ 形式正確。
- 100°C（0 barg）→ (2676−419)/3.6 = **627 W**（2257/3.6）✓ 與任務所述 2257 kJ/kg 對應一致。
- 表數據抽驗：0.4 barg 行 T_sat=109.55°C、h_f=459.7 ✓（1.4 bar abs：109.3°C/458.9）；3 barg 行 h_f=605.3、h_g=2738.7 ✓（4 bar abs：143.6°C/605.3/2738.1）。飽和溫度/h_f/h_g 表與蒸汽表一致 ✅。
- ⚠️ 邊界缺陷：`BR15 = EF60 = EF55+EF59`，當 BR10 ∈ {0.4…5 barg} 且 BR5="Boiler plant" 時 EF55（該壓力飽和水焓）與 EF59（給水溫度焓）會**重複相加**（正常鍋爐 >5 barg 或終端模式下只加一項，正確）。建議拆成 `IF(BR5="Boiler plant", EF59, EF55)`。

### 13.2 凝水管坡度表
```
X/Y/Z/AA：Pipe Dia mm / Coil load kW / RT / Slope
AA7:AA10 = 1:40（小管）、AA32 = 1:70（大管）
```
- 坡度 1:40（2.5%）與 1:70（1.4%）在空調凝水管慣例（1:50–1:100）範圍內，取較陡屬保守 ✓。管徑-負載對照為經驗表（廠家型錄型），無標準可對。
- 出處參考：BEC 2012 §6.11 附近排水管要求（[EMSD TG-BEC 2012](https://www.emsd.gov.hk/beeo/en/pee/TG-BEC_2012%20%28Rev.%201%29.pdf)）。

**判定：✅（⚠️ 邊界雙加 h_f 建議修正）**。

---

## 14. 蒸汽飽和壓力表（NPSH 內建）—— 已在 §10.1 完成，判定 ✅。

---

## 附錄 A：判定清單（共 52 項）

| # | 公式族 | 判定 |
|---|---|---|
| 1–4 | Hazen-Williams（常數/指數/正算/反算） | ✅✅✅✅ |
| 5–6 | 2.5 m/s、400 Pa/m 慣例 | ✅✅ |
| 7–11 | RT/kW/Btu/kcal 換算（3.516/3.517、3412、860、12000、2.6） | ⚠️✅✅✅⚠️ |
| 12–16 | Q=m·cp·ΔT（4.186789、4.2、FCU L/s、Boiler MW、Hx kg/s） | ✅✅✅✅✅ |
| 17–22 | Hx（LMTD、ΔT=0 算術、A=Q/U/LMTD、交叉檢查、U 值、標籤） | ✅✅✅✅✅⚠️ |
| 23–32 | Coil（p_ws、W、h、露點、濕球、密度、RH、SHR、BF、潛熱/ADP/凝結水） | ✅×10 |
| 33–36 | Boiler（668 鏈、9.83、33439、1.13×1.1/1.5/1.2 裕量） | ✅⚠️⚠️✅ |
| 37–38 | Boiler 換算表（kW×860=Mcal ❌、/2.6 ❌） | ❌❌ |
| 39–42 | Chiller（COP、IPLV 權重、冷凝水溫、10.7×3.516） | ✅✅✅⚠️ |
| 43 | Chiller 2.798708 | ⚠️ |
| 44–47 | AHU/FCU/SAC 風側（VρΔh、1.23、cfm→L/s、面風速） | ✅✅✅✅ |
| 48–49 | NPSH（公式、/9.8 近似） | ✅⚠️ |
| 50 | NPSH 蒸汽表 | ✅ |
| 51 | Insulations（等效厚度、防結露） | ✅✅ |
| 52 | PN（分級、0.09804、kPa/MPa） | ✅⚠️ |

## 附錄 B：主要參考來源
1. ASHRAE Handbook—Fundamentals（Pipe Sizing；Psychrometrics；Coils）—— 引用文獻見 §1/§6/§9。
2. CIBSE Guide C 2007（[CIBSE](https://www.cibse.org/knowledge-research/knowledge-portal/guide-c-reference-data-2007/)）。
3. AHRI Standard 550/590 (I-P)（IPLV）；[EnergyPlus Engineering Reference](https://energyplus.net/assets/nrel_custom/pdfs/pdfs_v24.2.0/EngineeringReference.pdf)。
4. IAPWS-IF97 / ASME（Keenan-Keyes）蒸汽表；[Engineering ToolBox – Water Saturation Pressure](https://www.engineeringtoolbox.com/water-vapor-saturation-pressure-d_599.html)。
5. GB 50264-2013（[§5.9 保冷參數](https://gf.cabr-fire.com/m/article-11124.htm)）；ISO 12241:2022（[ISO](https://www.iso.org/standard/74655.html)）。
6. 香港 EMSD BEC 2012 CoP + [TG-BEC 2012](https://www.emsd.gov.hk/beeo/en/pee/TG-BEC_2012%20%28Rev.%201%29.pdf) / [TG-BEC 2021](https://www.emsd.gov.hk/beeo/en/pee/TG-BEC_2021.pdf)。
7. Engineering ToolBox：Hazen-Williams（[式](https://www.engineeringtoolbox.com/hazen-williams-water-d_797.html)、[C 值](https://www.engineeringtoolbox.com/hazen-williams-coefficients-d_798.html)）、[鍋爐馬力](https://www.engineeringtoolbox.com/boiler-horsepower-d_1061.html)、[汽化熱](https://www.engineeringtoolbox.com/water-properties-d_1573.html)。
