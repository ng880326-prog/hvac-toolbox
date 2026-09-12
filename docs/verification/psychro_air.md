# 濕空氣（Psychrometrics）＋空氣側（Air-side / 風管）公式驗證報告

> **狀態更新**：本報告 §D 所列 5 項 ❌ 錯誤已全數修正於 **`00_HVAC Toolbox_R6.xlsm`**（R5 原檔保留），app 引擎與測試同步修正，詳見 [`psychro_air_fixes.md`](psychro_air_fixes.md)。

- 驗證範圍：`Air-side`、`Psychrometric Chart`、`Supporting 1`～`Supporting 6.1`、`Wheel`、`Wheel Support`（來源：`analysis/unique_formulas.md` 與 `analysis/sheets/*.txt` 之公式快照）
- 判定符號：**✅ 標準一致** / **⚠️ 近似式或需注意** / **❌ 有誤**
- 全表基礎出處（工作表自身標註）：**1997 ASHRAE Handbook Fundamentals — Chapter 6（Psychrometrics）**（見 `Psychrometric Chart!B24`）；風管側標註 **CIBSE Guide C / CIBSE Guide B2 Table 3.1 / CIBSE Guide B3 Table 3.4 / ASHRAE Fundamentals 2009 Chapter 21 — Duct Design**。

---

## A. 濕空氣物性公式（Psychrometrics）

### A1. 飽和水蒸氣壓 pws —— Hyland-Wexler 多項式

- **Excel 原文**（Supporting 1–6 全系列、Coil、Wheel 通用）：
  `pws = EXP(-5800.2206/T + 1.3914993 - 0.048640239*T + 0.000041764768*T^2 - 0.000000014452093*T^3 + 6.5459673*LN(T))/1000`（T 為 K，結果 kPa）
- **標準公式**（ASHRAE Fundamentals，Hyland & Wexler 1983；1997 Ch.6 eq.(5)/(6)、2001 起移入 Ch.1）：
  `ln pws = C8/T + C9 + C10·T + C11·T² + C12·T³ + C13·ln T`（pws 為 Pa）
  0–200 ℃ 係數：`C8=-5.8002206E3, C9=1.3914993, C10=-4.8640239E-2, C11=4.1764768E-5, C12=-1.4452093E-8, C13=6.5459673`；
  −100–0 ℃ 係數：`C1=-5.6745359E3, C2=6.3925247, C3=-9.677843E-3, C4=6.2215701E-7, C5=2.0747825E-9, C6=-9.484024E-13, C7=4.1635019`
- **判定：✅ 係數完全一致**。Excel 的 6 個係數與 ASHRAE「0–200 ℃」組 C8–C13 逐位吻合（−5800.2206 / 1.3914993 / −0.048640239 / 4.1764768e-5 / −1.4452093e-8 / 6.5459673）。
- **⚠️ 使用範圍問題**：此組係數僅對 **0–200 ℃（水面）** 有效。工作表對任何溫度一律套用，包括 <0 ℃：
  - `Supporting 3`（tdb=10 ℃, RH=40%）算出 tdp = **−3.05 ℃**；`Supporting 6` 算出 twb = **−0.077 ℃** —— 均落在公式有效域外。
  - 定量：0 ℃ 以下外插與「冰面」係數組相比，pws 高估 **~5 %（−5 ℃）**、**~22 %（−20 ℃）**（本報告以雙組係數實算）。
- **修正建議**：實作時加入分支——T≥273.15 K 用水面係數（C8–C13），T<273.15 K 用冰面係數（C1–C7）；或限制輸入為 ≥0 ℃ 並提示。
- **出處**：
  - ASHRAE F 2002 Psychrometrics Eq. 5 & 6 係數表（R 套件 climateeng 原始碼逐字引用）：https://rdrr.io/github/chrras/climateeng/src/R/sat-w-press.R
  - C8 值與露點式之獨立引用（PUCP 論文）：https://tesis.pucp.edu.pe/server/api/core/bitstreams/171262f3-94dc-4db2-b865-18466d822f29/content
  - Hyland & Wexler 1983 原始文獻：R. W. Hyland, A. Wexler, "Formulations for the Thermodynamic Properties of the Saturated Phases of H₂O from 173.15 K to 473.15 K", *ASHRAE Transactions* 89(2A), 1983。

### A2. 含濕量 W = 0.62198·pw/(p−pw)

- **Excel 原文**：`W = 0.62198*(pw/(p-pw))`（x33/x260/x208 等大量出現）
- **標準公式**：`W = ε·pw/(p−pw)`，ε = M_w/M_da = **18.01528/28.966 = 0.621945**（ASHRAE 現行常數 0.621945）。實算 18.01528/28.966 = 0.62195；Excel 取 **0.62198**（四捨五入至 5 位）。
- **判定：✅ 標準一致**（0.62198 與 0.621945 差 5.6e-5，相對誤差 0.009 %，對 W 的影響遠小於工程容差；1997 ASHRAE 版即以此值行之）。
- **出處**：
  - ε = 0.621945（ASHRAE F 2017 基礎、NeqSim 摘要）：https://raw.githubusercontent.com/equinor/neqsim/refs/heads/master/docs/wiki/humid_air_math.md
  - 摩爾質量：水 18.01528 g/mol、乾空氣 28.966 g/mol（ASHRAE Psychrometrics 章節表列值）。

### A3. 焓 h = 1.006·t + W·(2501 + 1.805·t)

- **Excel 原文**：`h = 1.006*t + W*(2501+1.805*t)`（t 為 ℃，h 為 kJ/kg 乾空氣）
- **標準公式**：
  - 1997 ASHRAE F Ch.6（工作表引用之版本）：`h = 1.006·t + W·(2501 + 1.805·t)`
  - 現行 ASHRAE（2001 起）：`h = 1.006·t + W·(2501 + 1.86·t)` —— 水蒸氣比熱取 1.86 kJ/kg·K。
- **判定：✅ 與其引用的 1997 ASHRAE 版一致**（1.805 非筆誤：1997 版焓式與濕球式同時採用 1.805 / 2.381 之舊係數組，內部自洽）。
- **⚠️ 版本差異提醒**：與現行 ASHRAE（1.86）混用時焓值相差 `Δh = W·(1.86−1.805)·t`，於 24.6 ℃、W=0.01172 時 ≈ 0.016 kJ/kg（0.03 %）——實務可忽略，但**跨版本比對測試時必須以同一係數組重算**（例如 ASHRAE 線上計算機輸出會與本表差 ~0.02 kJ/kg）。
- **數值常數出處**：2501 kJ/kg ≈ 0 ℃ 水之汽化潛熱 h_fg；1.006 kJ/kg·K = 乾空氣 cp（1.005 之捨入）；1.805 為 1997 版之水蒸氣 cp 值。
- **出處**：
  - 現行 1.86 版：https://raw.githubusercontent.com/equinor/neqsim/refs/heads/master/docs/wiki/humid_air_math.md
  - 1997 版 1.805：工作表自身標註「1997 ASHRAE Handbook Fundamentals - Chapter 6」（`Psychrometric Chart!B24`）；同係數組見於 ASHRAE Psychrometric Analysis 工具與 1997 版章節 eq.(30)–(32)。

### A4. 比容 v = 0.2871·(t+273.15)·(1+1.6078·W)/p

- **Excel 原文**：`v = 0.2871*(t+273.15)*(1+1.6078*W)/p`（t ℃、p kPa、v m³/kg 乾空氣）
- **標準公式**：`v = R_da·T·(1+1.6078·W)/p`，其中 R_da = 287.1 J/kg·K（ASHRAE 精確值 287.055；1997 版表格值 287.1 之捨入），且 `1/0.62198 = 1.6078`（= 28.966/18.01528，即 1.6078 = 1/ε）。
- **判定：✅ 標準一致**。0.2871 與 1.6078 互為捨入（0.2871×1.6078 = 0.46159 ≈ 0.46153 之 R_v 定義自洽）。已以 Air1/Air2 向量驗證（見 vectors 檔）。
- **出處**：ASHRAE F Psychrometrics 章節（eq. 26/28 型）；Engineering Toolbox Moist Air Specific Volume：https://www.engineeringtoolbox.com/moist-air-specific-volume-d_25.html

### A5. 濕球公式與 Wwb 收斂（Secant 迭代）

- **Excel 原文**（Supporting 1/2/3/4/5/6、Coil、Wheel）：
  `W = ((2501-2.381*twb)*Wwb - (tdb-twb))/(2501+1.805*tdb - 4.186*twb)`
  其中 Wwb = Ws(twb) = `0.62198*pws(twb)/(p-pws(twb))`；Supporting 2.1 以割線法（Secant）解
  `F(T) = ((2501-2.381*T)*Ws(T)-(tdb-T))/(2501+1.805*tdb-4.186*T) - W = 0`，初始區間 [0, 50] ℃，收斂條件 |F| < 5e-5（Supporting 2 回讀 8 層 IF 判定）。
- **標準公式**：
  - 1997 ASHRAE F Ch.6：`W = ((2501−2.381·t*)·Ws* − (t−t*))/(2501+1.805·t−4.186·t*)` ✅ 與 Excel 完全相同。
  - 現行 ASHRAE（2001+）：`W = ((2501−2.326·t*)·Ws* − 1.006·(t−t*))/(2501+1.86·t−4.186·t*)`。
- **判定：✅ 公式正確、數值方法合理**。實測收斂：Air1（tdb=24.6, W=0.003775）7 次迭代 → twb=12.1769 ℃；Air2（tdb=10, W=0.003775）7 次 → twb=0.8130 ℃；F 收斂至 ~1e-14。
- **⚠️ 兩點注意**：
  1. 2.381/1.805 為 1997 版係數（與 A3 自洽），與現行 2.326/1.86 之結果差 ~0.01 ℃ 級；
  2. 飽和狀態（tdb=twb、W=Ws）時割線式分母為 0，dump 中可見 `#DIV/0!`（Supporting 2.1 row 40–41）——需加「若 |tdb−twb|<容差 直接回 tdb」之護衛；且收斂結果 <0 ℃ 時仍套用 0–200 ℃ 之 pws（同 A1 問題）。
- **出處**：
  - 現行 2.326/1.86 形式（Der gipark 期刊論文）：https://dergipark.org.tr/tr/download/article-file/446066
  - 1997 形式：工作表自引「1997 ASHRAE Fundamentals Ch.6」。

### A6. 相對濕度／飽和度換算、水蒸氣分壓、露點

- **Excel 原文**：
  - `μ = W/Ws`（飽和度 Degree of saturation）
  - `RH = μ/(1-(1-μ)*(pws/p))*100`
  - `pw = p*W/(0.62198+W)`
  - `tdp = 6.54 + 14.526*LN(pw) + 0.7389*LN(pw)^2 + 0.09486*LN(pw)^3 + 0.4569*pw^0.1984`（pw 為 kPa）
- **標準公式**：ASHRAE F eq.(12)/(13)：`μ = W/Ws`、`φ = μ/(1−(1−μ)·(pws/p))`；`pw = p·W/(ε+W)` 為 A2 之反解；露點式為 ASHRAE 之封閉式（tdp 以 ℃，pw 以 kPa），**有效範圍 0–93 ℃**。
- **判定**：
  - μ、φ、pw：**✅ 標準一致**（以 Air1 向量驗證：μ=0.59823 → φ=60.566 %）。
  - 露點式：**✅ 係數一致**，但 **❌ 有效域外使用**——工作表對 <0 ℃ 結果照算（Supporting 3 得 −3.05 ℃），且 pw=0（RH=0 之退化輸入）時 `LN(0)` 產生 **#NUM!**（Supporting 3!A25、Supporting 4!A25 實證）。
- **備註（與委託描述之差異）**：委託書提及「露點由 pv 反查 Tdp 線性內插」——實際工作簿使用的是上述 ASHRAE 封閉式（比查表內插更精確）；Air-side 中的 INDEX/MATCH 線性內插只用於**風管查表**（見 B9），非露點。
- **修正建議**：tdp<0 ℃ 時改用冰面 pws 反解（Newton 或對數內插），pw≤0 時回傳空值而非 #NUM!。
- **出處**：
  - 露點式（含 0–93 ℃ 有效域標註）：https://tesis.pucp.edu.pe/server/api/core/bitstreams/171262f3-94dc-4db2-b865-18466d822f29/content
  - φ–μ 關係：ASHRAE F Psychrometrics eq.(12)/(13)。

### A7. Supporting 迭代求解器總評

| 求解器 | 已知輸入 | 求解目標 | 收斂 | 判定 |
|---|---|---|---|---|
| Supporting 2.1 | tdb + W（由 tdp 得） | twb | 7–12 次，|F|<1e-13 | ✅ |
| Supporting 3.1 | tdb + RH（W 直接算出） | twb | 同上 | ✅ |
| Supporting 4.1 | twb + RH | tdb | 4–6 次 | ✅（RH=0 退化輸入仍收斂至 tdb=53.49 ℃=乾空氣解） |
| Supporting 5.1 | twb + W（由 tdp 得） | tdb | 收斂 | ✅ |
| Supporting 6.1 (a) | W + RH | tdb | RH=40 %（Air2）**迭代收斂至 13.3057 ℃，但結果挑選鏈全列容差 5e-6 且無預設值 → 回傳 0**（❌ 見下）；RH=0（Air1）時 φ(t)=0 無有限解、割線發散（50→52.6→71.7→85.4→…→354.8） | ❌/⚠️ 無發散護衛 |
| Supporting 6.1 (b) | W + tdb | twb | 以錯誤之 tdb=0 代入 → twb=−0.077 ℃（域外） | ❌ 受 (a) 連累 |

- **建議**：JS 移植時以 bracket 法（Brent/二分）或固定 20 次上限取代無限割線；輸入矛盾組合（如 tdp=0 ℃ 且 RH=0 %）應先驗證「pw ≤ pws(tdb)」再求解。

---

## B. 空氣側／風管公式（Air-side）

### B1. 風管摩阻 —— Darcy-Weisbach + Haaland

- **Excel 原文**：
  - `Δp/L = λ*0.5*ρ*16*Q²/(π²*D⁵)`（Q m³/s、D m；即 Darcy-Weisbach 之流量形式）
  - `λ = (1/(-1.8*LOG((6.9/Re)+((k/D)/3.71)^1.11, 10)))^2`，k = 0.1 mm（P7）
- **標準公式**：
  - Darcy-Weisbach：`Δp/L = λ·ρ·v²/(2D)`，以 v=4Q/(πD²) 代入得 `λ·ρ·8Q²/(π²D⁵)` —— Excel 之 `λ·0.5·ρ·16·Q²/(π²D⁵)` 展開後相同 ✅
  - Haaland（1983）：`1/√λ = −1.8·log₁₀((ε/D/3.7)^1.11 + 6.9/Re)`，即 `λ = (1/(−1.8·log₁₀(6.9/Re + (k/D/3.71)^1.11)))²` ✅ 逐字一致（ε 即 k）。
- **判定：✅ 標準一致**。Haaland 對 Colebrook 之偏差：本報告實算 Re=1e5、k/D=3e-4 時 λ=0.01919 vs Colebrook 0.01947（**−1.4 %**），落在 Haaland 宣稱 ±1.5 % 內。k=0.1 mm 對鍍鋅鋼板（ASHRAE 用 0.09 mm≈0.0003 ft）合理 ✅。
- **出處**：
  - Haaland, S. E., 1983, "Simple and Explicit Formulas for the Friction Factor in Turbulent Pipe Flow", *J. Fluids Engineering* 105, pp. 89–90：https://www.sciepub.com/reference/127556
  - Colebrook/Haaland 對照（Wikipedia）：https://it.wikipedia.org/wiki/Equazione_di_Colebrook

### B2. 雷諾數與黏度

- **Excel 原文**：`Re = ρ*v*D/μ`（AX5 型）；`ν = μ/ρ`（AO12）；動黏度表（AN2:AS5）：
  | 條件 | μ (Pa·s) |
  |---|---|
  | 13 ℃ DB / 97 % RH | `17.78*10^-6` |
  | 24 ℃ DB / 50 % RH | `18.312*10^-6` |
  | 28 ℃ DB / 55 % RH | `18.474*10^-6` |
  | 37 ℃ DB / 23 % RH | `18.474*10^-6` |
- **標準值**（Sutherland 定律與 Engineering Toolbox 表交叉驗證）：
  | t | Sutherland μ | ETB 表值 | Excel | 偏差 |
  |---|---|---|---|---|
  | 13 ℃ | 17.797e-6 | 17.79e-6（內插） | 17.78e-6 | **−0.1 % ✅** |
  | 24 ℃ | 18.325e-6 | 18.32e-6（內插） | 18.312e-6 | **−0.07 % ✅** |
  | 28 ℃ | 18.514e-6 | 18.51e-6（內插） | 18.474e-6 | **−0.2 % ⚠️ 可忽略** |
  | 37 ℃ | 18.936e-6 | 18.93e-6（內插） | 18.474e-6 | **−2.4 % ❌（誤用 28 ℃ 值）** |
- **判定**：Re 與 ν=μ/ρ 之公式 ✅；13/24/28 ℃ 之 μ 值 ✅/⚠️；**37 ℃ 之 μ 為 ❌（沿用 28 ℃ 值，應為 ~18.94e-6）**。
- **修正建議**：37 ℃ 列改為 `18.94*10^-6`（或改以 Sutherland 公式動態計算）。
- **出處**：Engineering Toolbox Air - Dynamic and Kinematic Viscosity：https://www.engineeringtoolbox.com/air-absolute-kinematic-viscosity-d_601.html （10 ℃=17.64、20 ℃=18.13、25 ℃=18.37、30 ℃=18.60、40 ℃=19.07 μPa·s）

### B3. 矩形風管當量直徑 De = 1.453·A^0.6/P^0.2

- **Excel 原文**：`De = 1.453*(A^0.6)/(P^0.2)`（A m²、P m，×1000 得 mm；BI4=W·H、BI6=2(W+H)）
- **與標準比較**：
  - 因 `P = 2(a+b)`，`1.453·A^0.6/P^0.2 = (1.453/2^0.2)·(ab)^0.6/(a+b)^0.2 = 1.265·(ab)^0.6/(a+b)^0.2`（實算 1.453/2^0.2 = 1.2649）——即 **CIBSE／英國體系之等摩阻等效直徑 `De = 1.265·(a³b³/(a+b))^0.2`**。
  - ASHRAE Huebscher 式：`De = 1.30·(ab)^0.625/(a+b)^0.25`。
- **判定：⚠️ 近似式（但為合法之等摩阻近似，非 Huebscher 版本）**。兩式對照（本報告實算）：
  | 風管 | Huebscher | Excel(1.453 式) | 差 |
  |---|---|---|---|
  | 300×300（方形） | 0.3279 m | 0.3304 m | +0.7 % |
  | 600×300（2:1） | 0.4570 m | 0.4617 m | +1.0 % |
  | 1000×250（4:1） | 0.5169 m | 0.5266 m | +1.9 % |
- **結論**：與 Huebscher 差 ≤ ~2 %，且本表整體標註 CIBSE Guide C（英國體系），引用 1.265 型合理；**若改標 ASHRAE 體系則應換用 1.30 式**。同頁另有 `BP11` 標註扁圓管 `de = 1.55·A^0.625/P^0.25`（ASHRAE 扁圓等效直徑式）✅ 為標準式。
- **出處**：
  - 1.265 式推導（等壓損、同流量）：https://www.ques10.com/p/35691/derive-expression-equivalent-diameter-of-circula-1/
  - Huebscher 式（ASHRAE F Duct Design；Engineering Toolbox）：https://www.engineeringtoolbox.com/equivalent-diameter-d_205.html

### B4. 扁圓（Flat Oval）風管幾何、長寬比、動壓

- **Excel 原文**（BL33 型 / BL51 型）：
  - 面積：`A = π*(h/2)² + (W-h)*h`（m²，h=短軸、W=長軸）
  - 周長：`P = π*h + 2*(W-h)`（m）
  - 長寬比檢查：`IF(W/h > 4, "Unacceptable (> 1:4)", "Acceptable")`（AU2/AU8）
  - 速度壓力：`Pv = 0.5*ρ*v²`（P34）
- **標準公式**（ASHRAE F Duct Design / SMACNA）：扁圓 = 兩半圓 + 矩形，`A = πa²/4 + (A_maj−a)·a`、`P = πa + 2(A_maj−a)`，a=短軸 ✅；速度壓力 0.5ρv² ✅；SMACNA/製造商慣例扁圓主:短軸比 ≤ 4:1 ✅。
- **判定：✅ 標準一致**（實算：150×264 扁圓 A=0.03477 m²、P=0.6992 m，與 dump 值吻合）。
- **⚠️ 標註瑕疵（非活公式）**：
  - `BP10` 標註「A = pi x a x b x 4」——橢圓面積為 πab（a、b 為全軸）；「×4」與標準不符（若 a、b 為半軸則 πab 已正確，多乘 4 為誤）。此為註解文字，未參與計算，但應更正避免誤導。
  - `BP12` 標註「P = 2π(½((a/2)²+(b/2)²))^0.5」——為橢圓周長近似式 `P≈2π√((a²+b²)/2)`（Ramanujan 一階），未用於計算；僅供參考。
- **出處**：ASHRAE F Duct Design 扁圓幾何；SMACNA HVAC Duct Construction Standards（扁圓 4:1 限制）。

### B5. ACH 區塊與單位換算

- **Excel 原文**：`Q(m³/h) = Room Volume × ACH`；`ACH = Q ÷ Room Volume`；換算 1 cfm = 0.472 L/s（`AI4/0.472` 型）。
- **判定**：✅ 公式平凡正確；0.472 L/s per cfm ✅（精確值 0.471947）。ACH 建議值表標註 **CIBSE Guide B2 Table 3.1**（Boiler 3 / Carpark 6 / Garbage 8 / Kitchen(C) 60 / Kitchen(W) 40 / Lab 6–15 / Lift m/c 10 / Pump 6 / Sewage 20 / Storage 2 / Toilet 15–20 / Water meter 6）。
- **⚠️**：各值落在 CIBSE／香港慣用範圍內，但**表 3.1 為付費文獻未能逐項核對**，建議以紙本 CIBSE Guide B2（2016）Table 3.1 複核；廚房 60 ACH 屬中式重烹飪設計值（港式做法）而非 CIBSE 通用值。
- **出處**：CIBSE Guide B2 Ventilation and ductwork (2016)：https://www.cibse.org/knowledge-research/knowledge-portal/guide-b2-ventilation-and-ductwork-2016?id=a0q20000008JuB7AAK

### B6. 送風口（Diffuser）選型 —— CIBSE Guide B3 Table 3.4

- **Excel 原文**：`Diffuser area = Q(m³/s) ÷ v(m/s) ÷ η`，η（X12）= **0.7**；`X16 = X8/Y15`（Y15 = 設計風速×0.7）；所需長度 `X20 = MROUND(X16/(X19×10⁻³)×1000, 50)`；數量 `X22 = ROUNDUP(Y20/Y19,0)`；每只風量 `X23 = X6/X22`；實際風速 `Y31 = Q/(n·A_boot)`、`X31 = Y31/η`。
- **判定：✅ 公式結構正確**（A = Q/(v·η) 為終端裝置選型通用式；0.7 為典型擴散器有效面積比）。工作表引用 CIBSE Guide B3 Table 3.4，**未能線上取得原表逐項核對**（付費文獻），判定以方法論為準。
- **修正建議**：η=0.7 應改為依擴散器型錄之有效面積比（Neck/Face 有 X14/X15 兩欄已預留 Neck/Face 兩法）。
- **出處**：CIBSE Guide B3（工作表自引）；同類方法見 CIBSE Journal CPD「Applying the psychrometric relationships / Room air distribution」：https://www.cibsejournal.com/cpd/modules/2022-12-air/

### B7. 百葉（Louvre）選型 —— ASHRAE F2009 Ch.21

- **Excel 原文**：
  - 迎面風速 VLOOKUP（AC27:AD29）：`Intake = 2`、`Exhaust = 2.5`、`Smoke = 5` m/s（可覆寫 AD14）
  - `Louvre Area = Q(m³/s)/v × 0.45 / η_weatherproof(0.45) / η_decorative(1)`（AD20）
  - `NFA = Area × 0.45`（AD21）；`Neck Velocity = Q/NFA`（AD22）；尺寸 `MROUND(...,50)` mm
- **標準值**：ASHRAE F2009 Ch.21（Duct Design）百葉面風速建議：進風 400 fpm（≈2.03 m/s）、排風 500 fpm（≈2.54 m/s）——Excel 之 2 / 2.5 m/s ✅ 對應。
- **判定**：
  - 風速建議值：**✅ 與 ASHRAE 一致**（2、2.5 m/s）。
  - Smoke 5 m/s：**⚠️ 設計慣例值**（煙控系統穿越風速限值之保守取值，非出自該 ASHRAE 表），建議標註出處（如 NFPA 92 / EN 12101 之 damper 風速）。
  - 面積式：**⚠️ 結構可簡化**——預設 0.45/0.45/1 相消後 `Area = Q/v`（以毛面積為基礎），NFA=0.45·Area 另計；若把 η_wp 改成 0.3 面積會放大 1.5 倍（行為正確）。建議改寫為 `A = Q/(v·η_wp·η_dec)` 並註明 0.45 為防風雨百葉自由面積比。
- **出處**：
  - ASHRAE F2009 Ch.21 引用（工作表自引 AC3：ASHRAE Fundamentals 2009 Chapter 21 - Duct Design）
  - 500 fpm 自由面風速實務（Air Performance LLC）：https://airperformancellc.com/news/intake-louver-sizing-and-placement

### B8. 空氣密度與設計條件

- **Excel 原文**：`ρ = (1+W)/v`（P6 = `(1+AO10)/AO9`）——濕空氣密度（以乾空氣比容 v 為基）✅ 標準。條件表：13 ℃/97 %、24 ℃/50 %、28 ℃/55 %、37 ℃/23 %（香港常用設計條件 ✅）。動黏度對應表見 B2。
- **判定：✅**。

### B9. 風管三模式選型邏輯（含查表內插）

- **Case 1 定風速**：`A = Q/v`、`De = 2√(A/π)×1000` mm ✅；再算 Re、λ、Pa/m。
- **Case 2 定壓損**：預建 3000 列「假設風速 0.01–30 m/s、步長 0.01」之表（BC:BH, row 12–3011），以 `MATCH + INDEX` 線性內插反查風速與 De（BD8/BD9 型）——**✅ 方法正確**（等價於查 Ductulator 曲線）。
- **Case 3 定風管尺寸**：`A=W·H`、`P=2(W+H)`、De 用 B3 式、`v=Q/A`、Re、λ、Pa/m ✅。
- **長寬比檢查**：`W/H ≤ 4 "Acceptable"`（AU2/AU8；SMACNA 建議矩形 ≤4:1）✅；壓損 >1.5 Pa/m 標「Over」（U25，1.5 Pa/m 為低壓風管慣用設計上限）⚠️ 為設計判準非標準值。
- **互斥檢查**：T15/AU14 於多於一項輸入時顯示「x」✅。
- **判定：✅（Case1/Case2/Case3 全部成立）**。

---

## C. Wheel（轉輪熱回收）與 Wheel Support

### C1. 濕空氣引擎
Wheel / Wheel Support 完全複用 Supporting 系列之 pws、W、v、h、露點、濕球式（0.62198 / 2501 / 1.805 / 2.381 / 6.5459673 同款）——判定同 A1–A6（✅ 係數、⚠️ <0 ℃ 外推）。另有一 −40 ℃～100 %RH 之飽和焓/露點查表（BH:BT, row 10–168，步長 0.5 ℃）供冬季排氣側結露分析用——注意該表對 <0 ℃ 同樣用 0–200 ℃ 係數（BS10 對 −40 ℃ 得 −45.1 ℃ 露點，屬域外值 ⚠️）。

### C2. 顯熱／潛熱／全熱與效率定義
- **Excel 原文**（O8/O11/O12、V13/X14 型）：
  - `QS = min(Vs,Ve) × ρ×c × (t_r,1 − t_o,1) × ηS`
  - `QT = QS + QL`；`t_o,2 = t_o,1 + Q/(Vs·ρ·c)`；`t_r,2 = t_r,1 − Q/(Ve·ρ·c)`（冬季）
  - `t_o,2wb` 由濕球迭代（Wheel Support，CG8 型）
- **標準定義**：顯熱效率（平衡流量時）`ε_s = (t_s,out−t_s,in)/(t_e,in−t_s,in) = (t_e,in−t_e,out)/(t_e,in−t_s,in)`——委託書所列 `ε = (t_exhaust_in − t_exhaust_out)/(t_exhaust_in − t_supply_in)` ✅ 即此式之排氣側形式；全熱效率以焓差同比定義。工作簿把 ηS/ηT 作為**輸入**（D18/D19），輸出以熱平衡反算出口狀態——**✅ 公式與定義一致**（用 min 流量算回收量為保守且正確之做法）。
- **⚠️ 小項**：ρ×c 取 `1.2×1.02 = 1.224 kJ/(m³·K)` 之常數（P11/Y13 型 `G4*1.02`），20 ℃ 乾空氣實為 ≈1.21 —— 誤差 ~1 % 可忽略，但建議以濕空氣 ρ、cp 動態計算。
- **出處**：AHRI 1060 / ASHRAE 84 之轉輪效率定義；ε_s 形式見 ASHRAE Systems & Equipment「Air-to-Air Energy Recovery」章。

### C3. 風量比、結露警告邏輯
- **Excel 原文**：`D16 = Vs/Ve`，`>1.5 或 <0.7 → "Ratio Out of Range"`；結露：`IF(X22 <= J11, "**Condensation occurs; exhaust temperature to be determined by saturated enthalpy", "")`（X22=排氣出口乾球 t_r,2；J11=排氣入口（室內）露點）＋`IF(O22-O28<=0.1, "**Condensation occurs at supply outlet","")`（送氣出口乾球−濕球 ≤0.1 ℃ 即近飽和）；顯熱-only 模式（AF1=1）顯示「Supply/Exhaust moisture content unchanged」。
- **判定**：
  - 排氣側結露判據 `t_r,2 ≤ Tdp(室內進氣)`：**✅ 邏輯正確**（冷卻至露點以下必結露；此時應改以飽和焓線求排氣出口溫度——訊息文字亦正確）。
  - 送氣側 `tdb−twb ≤ 0.1 ℃`：**✅ 為飽和之合理數值判據**。
  - 風量比 0.7–1.5：**⚠️ 設計慣例**（AHRI 1060 測試要求與廠商準則；0.7–1.5 為常見允差帶），建議標註出處。
- **出處**：AHRI Standard 1060（Performance Rating of Air-to-Air Exchangers）；ASHRAE F Ch.26 Air-to-Air Energy Recovery。

---

## D. 總結

### 驗證統計
- 委託之 **12 個公式族全部完成驗證**：濕空氣 6 族（A1–A7 小節）、風管/空氣側 5 族（B1–B9 小節）、轉輪 1 族（C1–C3 小節），共 19 個驗證小節。
- **✅ 標準一致（無保留）：** A1 係數、A2、A4、A5 公式、A6 之 μ/φ/pw、B1（DW+Haaland）、B4（扁圓幾何）、B8（密度/條件表）、C2（效率定義）、C3（結露邏輯）。
- **⚠️ 近似式／需注意（10 項）：** A3 之 1.805/2.381/0.62198（1997 版係數，與現行 1.86/2.326/0.621945 之版本差異）；A1/A6 之 <0 ℃ 域外（見 ❌2）；B2 之 μ(28 ℃) −0.2 %；B3 之矩形 De 1.453 式（CIBSE 版，與 Huebscher 差 ≤2 %）；B5 之 ACH 表值待查原表；B6 之 η=0.7 為典型值；B7 之 Smoke 5 m/s 與 0.45 相消結構；B9 之 1.5 Pa/m 判準；C2 之 ρc=1.224 常數；C3 之風量比 0.7–1.5。

### 發現的明確錯誤（❌，共 5 項）
1. **37 ℃ 動黏度誤用 28 ℃ 值**（18.474e-6 應為 ~18.94e-6，−2.4 %，Air-side AN5:AS5）。
2. **<0 ℃ 之露點／濕球**：pws 一律套用 0–200 ℃ Hyland-Wexler 水面係數（−5 ℃ 高估 5 %、−20 ℃ 高估 22 %）；ASHRAE 露點式本身亦僅 0–93 ℃ 有效（Supporting 3 得 −3.05 ℃ 為域外值）。
3. **RH=0 之退化輸入**：`LN(pw=0)` 產生 #NUM!（Supporting 3!A25、Supporting 4!A25）；Supporting 6.1 之 tdb 求解對 φ=0 無解且**無發散護衛**（割線法 50→354 ℃ 直上）。
4. **Supporting 6 收斂判定鏈有缺陷**：Air2（tdp=0 ℃、RH=40 %）之 tdb 割線已收斂至 **13.3057 ℃**（F→2.1e-7），但結果挑選公式 `IF(ABS(I−H)<0.000005, J, ...)` 全列採 5e-6 容差、鏈尾**無預設值**——最後一列 |I₇₀−H₇₀| = 6.7e-5 仍未達標 → 整鏈落入 FALSE 回傳 **0**；下游濕球求解遂以錯誤 tdb=0 算出 twb=−0.077 ℃。對照 Supporting 4 之同型鏈在末兩列放寬至 0.005 故正常（此為不一致之實證）。
5. **橢圓面積標註「πab×4」** 與標準 πab 不符（BP10，註解性）。

### 優先修正建議（依序）
1. 黏度表 37 ℃ 列 → 18.94e-6（或 Sutherland 動態式）。
2. pws 加溫度分支（T<273.15 K 用冰面係數）＋露點式 0 ℃ 下限護衛。
3. 求解器加 bracket／迭代上限與輸入自洽檢查（pw ≤ pws(tdb)）；收斂挑選鏈改為「取 |F| 最小列」或放寬末列容差＋預設值（修復 Supporting 6 之 0 回傳）。
4. 矩形 De 若對外宣稱 ASHRAE，改 1.30·(ab)^0.625/(a+b)^0.25；或保留 1.453 並標註 CIBSE。
5. 更正 BP10 標註；louvre 面積式改寫為 A=Q/(v·η_wp·η_dec)。
