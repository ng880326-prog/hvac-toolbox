# 公式檢驗總目錄（Formula Verification Index）

原檔：`00_HVAC Toolbox_R5.xlsm`（34 工作表、約 60,000 公式格；去重後 ~200 獨立公式族）。
方法：擷取公式＋快取值 → 與權威文獻逐條比對 → JS 引擎以 Excel 快取值做數值驗證（`tests/run_tests.mjs`，64/64 PASS）。

## 報告清單

| 檔案 | 範圍 | 判定統計 |
|---|---|---|
| `psychro_air.md` | 濕空氣 6 族、風管/空氣側 5 族、轉輪 1 族（19 小節） | ✅ 多數；❌ 5 項 |
| `psychro_air_vectors.md` | Air1/Air2 主向量、Supporting 各路徑、風管/扁圓期望值 | — |
| `air_side_spec.md` | Air-side 模組規格（F1–F21 公式庫、欄位對照） | — |
| `fluids_thermal.md` | 水管 HW、換熱器、冷機、鍋爐、NPSH、保溫、PN（52 項） | ✅38 / ⚠️12 / ❌2 |
| `fluids_vectors.md` | 約 70 條測試向量（含 DN15/DN20 HW 精確還原） | — |
| `module_specs_fluids.md` | Pipe Sizing / Hx / Chiller / Boiler / NPSH / Insulations / PN 規格 | — |
| `electrical_acoustics_codes.md` | 馬達、聲學、GB 規範（19 條細項） | ✅9 / ⚠️8 / ❌4 |
| `electrical_vectors.md` | 聲學/馬達/SPF 新舊雙模式向量 | — |
| `module_specs_electrical.md` | Motor / Acoustics / 梯間加壓規格（含 ✅Fix） | — |

## 原檔錯誤／問題總表（已在 App 引擎修正）

| # | 位置 | 問題 | App 處理 |
|---|---|---|---|
| 1 | Psychrometric Chart | 密度用 1/v（應 (1+W)/v，差 ~1.2%；與自家 Air-side 的 (1+W)/v 矛盾） | 引擎用 (1+W)/v |
| 2 | Psychrometric Chart | RH 輸入與 Tdb/Twb 矛盾時直接回顯輸入值（Air2: 顯示 40%，實際 95.2%） | App 只顯示計算值 |
| 3 | Air-side | 37°C 動黏度誤用 28°C 值（−2.4%） | Sutherland 公式 |
| 4 | Supporting 3/4 | <0°C 套用液面 pws 係數（−20°C 高估 22%）；RH=0 產生 #NUM! | 引擎加入 ice 係數（−100~0.01°C）、無退化發散 |
| 5 | Supporting 6 | 收斂挑選鏈容差 bug（收斂值 13.3057°C 被回傳 0） | 閉式/二分法取代割線表 |
| 6 | Motor | 馬達電流忽略 η（小型馬達低估 10–25%） | 增加 η 輸入（原檔相容 η=1，可切換） |
| 7 | SPF(PRC) | 採用已廢止 GB 50045-95；現行 GB 51251-2017 高 30–60% + 須 ×1.2；D 型誤用避難層 30 m³/h·m²；2 個公式 bug | 雙規範模式，預設 GB 51251-2017 表 3.4.2×1.2，避難層另立輸入 |
| 8 | Boiler | kW×860 標「Mcal/hr」（差 1000 倍）；「668」被當汽化熱（實為 ton/hr 經驗值）；HP 列 2.6 與 9.83 矛盾 | kcal/h 正確標示；產汽雙換算（2257 kJ/kg／668 經驗值可選） |
| 9 | 多處 | 3.516/3.517 混用；0.09804139432 非標準 g；9.8 vs 9.80665 | 統一 3.51685、9.80665、0.1019716 |
| 10 | Air-side | 當量直徑 1.453 式（CIBSE 1.265 版）與標準 Huebscher 差 ≤2% | 引擎用標準 Huebscher（1.30 式）＋保留 legacy 函數供對照 |
| 11 | Chiller | 「10.7」非效率常數（實為 ft²→m² 倒數粗值）；2.798708 來源不明 | App 不使用，直接 COP/kW·RT |
| 12 | Pipe Sizing | 蒸汽區 Boiler plant 選項 h_f 重複相加（邊界 bug）；BR10 限 0.4–5 barg | 蒸汽區未納入原型（列入 roadmap） |
| 13 | NPSH | 飽和蒸氣壓查表 5°C 步距；/9.8 | 直接 Hyland-Wexler 計算；ρg=9.80665 |
| 14 | Insulations | #REF! 殘留（AN4 列） | 引擎重寫無殘留 |

## 修正後仍保留的「已知近似」（有標註）

- h = 1.006t + W(2501+1.805t)：ASHRAE F 2025 Ch.1 版本（現行 1.86，差 ~0.03%）— 保留以與原檔一致，可在 `psychro.js` 的 `CONST` 切換。
- Haaland 對 Colebrook 約 −1.4%（顯式式固有）。
- GB 51251 表值按高度線性內插（條文說明允許）；出入口 >1 的 ×1.5~1.75 僅保留於舊版模式。
- 風管 k=0.1 mm（鍍鋅鋼板，ASHRAE 建議 0.09 mm）。

## 出處（主要）

- ASHRAE Handbook—Fundamentals：Ch.1/6 Psychrometrics（Hyland & Wexler 1983 係數 C8–C13）、Ch.21 Duct Design、Ch.22 Pipe Sizing
- Haaland, S.E. (1983), *J. Fluids Eng.* — 摩阻顯式式
- Huebscher, R.G. (1948), *ASHVE Trans.* — 矩形當量直徑
- CIBSE Guide B2/B3/C（ACH、送風口、管徑限值）
- ISO 12241 / GB 50264-2013（保溫）、GB 51251-2017 / GB 50045-95（梯間加壓）、GB 50176（氣候分區）
- AHRI 550/590-2023（IPLV 權重）、ASME 蒸汽表
