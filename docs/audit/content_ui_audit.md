# 內容與 UI 詳細審計（自動生成）

模組數：22

## convert — 單位換算  (cards 5 · inputs 5 · results 11 · tables 0/0 rows)
-    **功率** — in 1, sel 0, chk 0, seg [], res 3, notes 0
-    **m³/s** — in 1, sel 0, chk 0, seg [], res 3, notes 0
-    **Pa** — in 1, sel 0, chk 0, seg [], res 3, notes 0
-    **溫度** — in 1, sel 0, chk 0, seg [], res 1, notes 0
-    **扭矩** — in 1, sel 0, chk 0, seg [], res 1, notes 0

## webtools — 選型網站與參考  (cards 2 · inputs 0 · results 0 · tables 2/41 rows)
-    **選型網站與參考** — in 0, sel 0, chk 0, seg [], res 0, notes 2
    - src: Website sheet (workbook)
    - table: 9×3 hdr=[設備類, 品牌, 連結]
-    **供應商目錄（按設備類）** — in 0, sel 0, chk 0, seg [], res 0, notes 2
    - src: Supplier sheet (workbook)
    - table: 32×3 hdr=[類別, Brand, 供應商]

## psychro — 濕空氣計算器  (cards 4 · inputs 18 · results 21 · tables 1/9 rows)
-    **濕空氣計算器** — in 3, sel 0, chk 0, seg [4], res 10, notes 1
    - src: ASHRAE Fundamentals 2025 Ch.1/Ch.1; Hyland & Wexler (1983) — W=0.62198·pw/(p−pw); h=1.006T+W(2501+1.805T); v=0
-    **雙空氣比較（Air1／Air2）** — in 4, sel 0, chk 0, seg [], res 0, notes 1
    - table: 9×4 hdr=[, Air1, Air2, D (Air2-Air1)]
- 🔽 **絕熱混合（兩股氣流）** — in 6, sel 0, chk 0, seg [], res 6, notes 0
- 🔽 **盤管負荷（空氣處理過程）** — in 5, sel 0, chk 0, seg [], res 5, notes 0

## ducts — 空氣側／風管計算  (cards 5 · inputs 19 · results 14 · tables 1/15 rows)
-    **換氣次數（ACH）** — in 3, sel 0, chk 0, seg [], res 4, notes 0
-    **風管選徑** — in 6, sel 0, chk 0, seg [3], res 7, notes 1, formula
    - src: CIBSE Guide C (workbook ref); ASHRAE Fundamentals 2025 Ch.21 Duct Design; Haaland (1983)
- 🔽 **標準風管尺寸表（摩擦速查）** — in 5, sel 0, chk 0, seg [], res 1, notes 2
    - src: ASHRAE Fundamentals 2025 Ch.21 · generated from Haaland/Darcy-Weisbach (replaces 3000-row lookup)
    - table: 15×5 hdr=[Ø mm, V m/s, Re, λ, Pa/m]
- 🔽 **送風口選型** — in 3, sel 0, chk 0, seg [], res 1, notes 1
    - src: CIBSE Guide B3 — Table 3.4 (workbook ref)
- 🔽 **百葉選型** — in 2, sel 0, chk 0, seg [], res 1, notes 1
    - src: ASHRAE Fundamentals 2025 Ch.21 (workbook ref)

## coil — 盤管 · AHU／PAU 選型  (cards 7 · inputs 38 · results 25 · tables 0/0 rows)
-    **設計條件** — in 8, sel 0, chk 0, seg [], res 0, notes 2
    - src: Coil sheet (workbook) — design conditions
-    **情境預設** — in 0, sel 0, chk 0, seg [3], res 0, notes 1
-    **情境並排（AHU｜PAU）** — in 12, sel 0, chk 0, seg [], res 8, notes 0
-    **冷卻盤管（AHU／PAU）** — in 4, sel 0, chk 0, seg [], res 7, notes 1, formula
    - src: Coil sheet (workbook); psychrometrics per ASHRAE
- 🔽 **水溫與風管設計** — in 6, sel 0, chk 0, seg [], res 3, notes 1
    - src: Coil sheet (workbook): water temperature & duct design blocks
- 🔽 **冷媒水管選徑** — in 4, sel 0, chk 0, seg [], res 3, notes 1, formula
    - src: ASHRAE F. Ch.22 · CIBSE 2.5 m/s / 400 Pa/m
- 🔽 **預熱／再熱／蒸汽／加濕** — in 4, sel 0, chk 0, seg [], res 4, notes 1
    - src: Coil sheet (workbook) — preheat / reheat / steam / humidification

## wheel — 轉輪熱回收  (cards 1 · inputs 8 · results 7 · tables 0/0 rows)
-    **轉輪熱回收** — in 8, sel 0, chk 0, seg [2], res 7, notes 2, formula
    - src: Effectiveness-NTU relations (workbook Wheel sheet)

## vrf — 多聯機（VRF）選型  (cards 1 · inputs 2 · results 4 · tables 0/0 rows)
-    **多聯機（VRF）選型** — in 2, sel 2, chk 0, seg [2], res 4, notes 2, formula
    - src: Fujitsu General · Mitsubishi Electric official tables (HK catalogue library)

## pipes — 水管管徑計算  (cards 3 · inputs 9 · results 12 · tables 1/15 rows)
-    **水管管徑計算** — in 4, sel 0, chk 0, seg [2], res 6, notes 2, formula
    - src: ASHRAE Fundamentals 2025 Ch.22; CIBSE Guide C limits 2.5 m/s / 400 Pa/m
    - table: 15×4 hdr=[DN, 流速 (m/s), 比摩阻 (Pa/m), 合格]
- 🔽 **蒸汽管選徑（飽和蒸汽）** — in 3, sel 0, chk 0, seg [], res 4, notes 2, formula
    - src: IAPWS IF-97 · ideal-gas ρ approx (±5%)
- 🔽 **凝水管（原檔兩表）** — in 2, sel 0, chk 0, seg [], res 2, notes 1, formula
    - src: Pipe Sizing sheet (workbook) — condensate tables

## npsh — 泵 NPSH／氣蝕檢查  (cards 1 · inputs 7 · results 4 · tables 0/0 rows)
-    **泵 NPSH／氣蝕檢查** — in 7, sel 0, chk 0, seg [], res 4, notes 1, formula
    - src: CIBSE / pump handbooks; vapour pressure: Hyland & Wexler (1983)

## insulation — 管道保溫計算  (cards 1 · inputs 7 · results 3 · tables 0/0 rows)
-    **管道保溫計算** — in 7, sel 0, chk 0, seg [7, 2], res 3, notes 1, formula
    - src: ISO 12241 / GB 50264-2013 (workbook Insulations sheet matches)

## pn — 系統壓力等級（PN）  (cards 1 · inputs 3 · results 6 · tables 0/0 rows)
-    **系統壓力等級（PN）** — in 3, sel 0, chk 0, seg [], res 6, notes 2
    - src: PN sheet (workbook); pressure conversion 1 mH₂O = 0.0980665 bar

## hx — 換熱器計算  (cards 1 · inputs 7 · results 5 · tables 0/0 rows)
-    **換熱器計算** — in 7, sel 0, chk 0, seg [4], res 5, notes 1, formula
    - src: Standard heat exchanger relations (workbook Hx sheet matches)

## chiller — 冷機性能  (cards 4 · inputs 6 · results 7 · tables 2/27 rows)
-    **冷機性能** — in 2, sel 0, chk 0, seg [], res 5, notes 2
    - src: AHRI 550/590-2023 conventions; workbook conversions
-    **IPLV／NPLV（AHRI 550/590-2023）** — in 4, sel 0, chk 0, seg [], res 2, notes 1, formula
    - src: AHRI 550/590-2023 (workbook 10.7×3.516 resolved: ft²→m² factor, not an efficiency constant)
-    **MHI Thermal Systems — Water-cooled Chillers (2025 catalogue)** — in 0, sel 0, chk 0, seg [], res 0, notes 2
    - src: G:\我的雲端硬碟\catalogue\Mitsubishi heavy industries\20250417\Water-cooled Chiller
    - table: 5×4 hdr=[Series, Drive, Refrigerant, Range]
-    **MHI GART — catalogue table (OCR-verified)** — in 0, sel 0, chk 0, seg [], res 0, notes 2
    - src: GART SERIES CATALOG 07/08 · OCR p10/p11
    - table: 22×4 hdr=[RT, kW, Input kW, COP]

## boiler — 鍋爐計算  (cards 2 · inputs 5 · results 8 · tables 0/0 rows)
-    **鍋爐計算** — in 2, sel 0, chk 0, seg [2], res 4, notes 2
    - src: IAPWS IF-97 hfg(100 °C) = 2257 kJ/kg; workbook ton/hr rule 668 kW
-    **蒸汽壓力與膨脹水箱（按壓力）** — in 3, sel 0, chk 0, seg [], res 4, notes 2, formula
    - src: IAPWS IF-97 · Watson correlation

## motor — 馬達電力計算  (cards 4 · inputs 5 · results 4 · tables 1/6 rows)
-    **馬達電力計算** — in 4, sel 0, chk 0, seg [2], res 2, notes 2
    - src: I = P/(V·pf·η) 1Ø; I = P/(√3·V·pf·η) 3Ø
-    **扭矩換算** — in 1, sel 0, chk 0, seg [], res 1, notes 0, formula
-    **氣候分區（GB 50176）** — in 0, sel 1, chk 0, seg [], res 1, notes 1
    - src: GB 50176 (workbook zone list)
- 🔽 **熱回收效率 ER 限值（GB 50189-2005 表 5.3.27）** — in 0, sel 0, chk 0, seg [], res 0, notes 2
    - src: GB 50189-2005 (superseded) · GB 50189-2015
    - table: 6×2 hdr=[Zone, ER limit]

## ahu — AHU／PAU 快速選型  (cards 1 · inputs 1 · results 4 · tables 1/23 rows)
-    **AHU／PAU 快速選型** — in 1, sel 0, chk 11, seg [2], res 4, notes 3
    - src: AHU sheet (workbook) — Trane CLCP; verified against Trane Hong Kong CLCP/CLCH catalogue (PRC010C-EN, 2024-10):
    - table: 23×6 hdr=[Model, AHU CMH, AHU L/s, PAU CMH, PAU L/s, L×W×H mm]

## fcu — 風機盤管（FCU）  (cards 3 · inputs 3 · results 16 · tables 1/8 rows)
-    **風機盤管（FCU）** — in 0, sel 1, chk 0, seg [3], res 8, notes 2
    - src: FCU sheet (workbook) — data rows; CHW = kW/(4.2×(12−7)); HWS = kW/(4.2×(60−50))
-    **水管速算（2.5 m/s、300 Pa/m）** — in 3, sel 0, chk 0, seg [], res 4, notes 1
    - src: ASHRAE F. Ch.22; Hazen–Williams C=140
- 🔽 **Carrier 42CN（香港實數據）** — in 0, sel 1, chk 0, seg [], res 4, notes 2
    - src: G:\我的雲端硬碟\catalogue\Fan coil\Carrier — FCU capacity 10/18°C
    - table: 8×5 hdr=[Model, m³/h, kW @7/15, kW @10/16.4, L/min]

## sac — 分體空調（SAC）  (cards 3 · inputs 1 · results 4 · tables 3/15 rows)
-    **分體空調（SAC）** — in 1, sel 0, chk 0, seg [], res 4, notes 2
    - src: SAC sheet (workbook) — unit conversion
-    **Mitsubishi Electric — MSZ-GE / MXZ** — in 0, sel 0, chk 0, seg [], res 0, notes 3
    - table: 5×4 hdr=[HP, kW, COP, Model]
    - table: 3×4 hdr=[Config, kW, COP, Model]
-    **Fujitsu General — AOHG18LAC2 Multi Split** — in 0, sel 0, chk 0, seg [], res 0, notes 1
    - table: 7×6 hdr=[Indoor, kW, Input kW, EER, SEER, Class]

## fan — 風機選型  (cards 2 · inputs 0 · results 4 · tables 2/41 rows)
-    **風機選型** — in 0, sel 0, chk 0, seg [3, 2, 4], res 4, notes 2
    - src: Fan sheet (workbook) — Kruger · National · Ostberg, ≤1450 / ≤2900 RPM, 100–1200 Pa
    - table: 14×4 hdr=[, , , kW]
- 🔽 **EAF 選型單（Fantech · Anway 香港代理）** — in 0, sel 0, chk 0, seg [], res 0, notes 2
    - src: Ventilation Fan (EAF-*.pdf) — Fantech, HK rep. Anway Engineering
    - table: 27×6 hdr=[EAF, Model, m³/s, Pa, Ø mm, kW]

## acoustics — 聲學計算  (cards 3 · inputs 8 · results 3 · tables 0/0 rows)
-    **距離 r 處聲壓級** — in 2, sel 1, chk 0, seg [], res 1, notes 1
    - src: Standard handbook relation (workbook sheet matches exactly)
-    **聲源聲功率級** — in 2, sel 1, chk 0, seg [], res 1, notes 0
-    **多聲源疊加** — in 4, sel 0, chk 0, seg [], res 1, notes 0

## stairwell — 梯間加壓送風估算  (cards 1 · inputs 2 · results 5 · tables 0/0 rows)
-    **梯間加壓送風估算** — in 2, sel 0, chk 0, seg [2, 5, 2, 2], res 5, notes 2, formula
    - src: GB 51251-2017 §3.4 · Table 3.4.2 (current) / GB 50045-95 8.3 (superseded)

## verify — 數據真確性  (cards 1 · inputs 0 · results 6 · tables 0/0 rows)
-    **數據真確性自檢** — in 0, sel 0, chk 0, seg [], res 6, notes 8
    - src: tests/vectors.js (69 vectors) · ASHRAE 2025 · CIBSE · IAPWS · GB · Excel cached values

## 全局 UI 指標
- 每頁 h1 數：2
- 目錄 chips：0（手機顯示）
- 摺疊卡（本頁 0）

## 匯總
- 欄位總數 154｜結果瓦片 173｜表格 15（200 列）

## 潛在 UI 待改進：1
- (1×) 結果「DN25」預設為空