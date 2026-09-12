# 修正紀錄（R6）—— 濕空氣／空氣側驗證問題全修

依據 `docs/verification/psychro_air.md` §D 之 5 項 ❌ 錯誤與優先修正建議，產出修正版工作簿
**`00_HVAC Toolbox_R6.xlsm`**（R5 原檔保留未動），並同步修正 app 引擎與測試。
修正實作：`tools/fix_r6.py`（openpyxl、keep_vba 保留 VBA；公式寫入後由 Excel 於開啟時自動重算——
本沙盒環境無法執行 Excel COM／LibreOffice 重算，故以 `tools/verify_r6.py` 做結構檢查＋獨立數值驗證）。
共改寫 **2,462 個儲存格**（含共享公式展開之迭代表全列），清單見 `tools/r6_changes.log`。

## A. Excel 工作簿修正（R6）

| # | 錯誤（R5） | 修正（R6） | 位置 |
|---|---|---|---|
| 1 | 37 ℃ 動黏度誤用 28 ℃ 值 18.474e-6 | → `=18.94*10^-6`（Sutherland 18.936e-6） | `Air-side!AS5` |
| 2 | <0 ℃ 一律套用 0–200 ℃ 水面 Hyland-Wexler 係數（−5 ℃ 高估 5 %、−20 ℃ 高估 22 %） | 所有 pws 公式（合併 EXP 型、拆分 A/B 型、含共享公式展開之迭代表全列）加 `IF(K<273.16, 冰面係數 C1–C7, 水面係數 C8–C13)` 分支（ASHRAE eq.5/eq.6） | Supporting 1–6.1、Wheel、Wheel Support（Supporting 5.1 之 pws 經由 Supproting 5 引用，已連帶修正） |
| 3a | 露點閉式 0–93 ℃ 域外照算；pw=0 時 `LN(0)` → #NUM! | 所有 `6.54+14.526*LN(pw)+…` 加 `IF(pw<0.6112,"n/a (<0C)",…)` 護衛 | Supporting 1/3/4、Wheel、Wheel Support |
| 3b | 割線 J 列收斂後 `H=I` → #DIV/0! | 加 `IF(H=I,Tk,…)` 護衛 | Supporting 2.1/3.1/4.1/5.1/6.1 全部 J 列 |
| 4 | Supporting 6 tdb 收斂挑選鏈：全列容差 5e-6、無預設值 → 已收斂卻回傳 0；下游濕球以錯誤 tdb=0 計算得 −0.077 ℃ | 容差放寬（0.00005→0.005→0.05）＋鏈尾預設 J 值＋`RH<=0` 護衛（"n/a (RH>0 required)"）；A13/C13/A16/C16 加 `IF(ISNUMBER(tdb),…,"-")`；A19/C19 濕球挑選鏈同加護衛與預設值。**修正後：tdb=13.3042 ℃、twb=7.1404 ℃**（獨立重算驗證） | `Supporting 6!A10/C10/A13/C13/A16/C16/A19/C19` |
| 5 | 橢圓面積標註「pi x a x b x 4」 | → 「pi x a x b」（標準橢圓面積 πab） | `Air-side!BP10` |
| 6 | Wheel 飽和狀態表（−40…+40 ℃）row 11–168 為靜態舊值（<0 ℃ 用錯的水面 pws；R5 快照 −39.5 ℃ 列 pws=0.02006，冰面正確值 0.01359 kPa） | 整塊 BJ10:BT168 公式化（ice 分支生效），BS 列「露點」改為 `=T`（飽和時露點=T，精確；原閉式 <0 ℃ 無效，R5 得 −44.41 ℃） | `Wheel!BJ10:BT168` |
| 7 | （額外）VML 註解內未閉合 `<br>` 使 openpyxl 無法回存 | 存檔前正規化 `xl/drawings/vmlDrawing*.vml` 之 void 標籤，註解完整保留 | 全部 |

- 濕空氣核心係數維持 1997 ASHRAE 基準（0.62198 / 2501 / 1.805 / 2.381）——屬工作簿文件化之基準，非錯誤，不改。
- 矩形當量直徑 1.453 式維持（CIBSE 1.265 版，與 Huebscher 差 ≤2 %，屬合法近似），不改。
- 範圍外（由 fluids_thermal 驗證負責）：Coil / Coil Support 之 pws 與露點式有相同 <0 ℃ 問題，未於本次修改；如需可用同一 script 擴展（加兩個 sheet 名稱即可）。
- **開啟行為**：openpyxl 回存後公式快取值為空，Excel 開啟 R6 時會自動重算全部公式（一次性，數秒），此為預期。
- 重算後已知殘留錯誤（繼承自 R5、屬退化輸入之顯示值）：Air-side 空輸入區塊之 #DIV/0!、Wheel 空輸入列之 #VALUE!、Supporting 6.1 A 欄（RH=0 退化）迭代表之發散值——所有「有效輸入」路徑已修正。

## B. App 引擎修正（app/ + legacy/ 同步）

| 檔案 | 修正 |
|---|---|
| `app/js/engine/ducts.js`、`legacy/js/engine/ducts.js` | `AIR_MU[37]`: 18.474e-6 → **18.94e-6**；註解更新 |
| `app/js/engine/psychro.js`、`legacy/js/engine/psychro.js` | `state()` 加域護衛：RH 必須在 (0,100]；twb/tdp 不得大於 tdb；t 限 −100…200 ℃；w≥0；h 路徑負 W 拒絕；pw=0 時 `tdp=null`（不再回傳 −60 假值）。RH=0 之 tdp+rh 除零（t→∞）與 twb>tdb 錯誤輸入不再產生假結果 |

## C. 測試（app/js/data/vectors.js，單一來源）

新增 7 條回歸向量：`state(rh=0)`、`state(rh=101)`、`state(twb>tdb)`、`state(tdp>tdb)` → null；
`state(tdp=0, rh=40) → tdb ≈ 13.3045 ℃`（R5 回 0）；`state(t,w=0).tdp == null`；`AIR_MU[37] = 18.94e-6`。
`node tests/run_tests.mjs`：**102/102 通過**。

## D. 驗證文件更新

- `docs/verification/psychro_air_vectors.md`：Supporting 6 列已標註 R6 修正後之正確解。
- 本檔（psychro_air_fixes.md）為 R6 修正之正式紀錄；`tools/fix_r6.py`（產出）與 `tools/verify_r6.py`（驗證）可重跑。
- 驗證結果：2,460 條改寫公式結構檢查 0 錯誤；關鍵修正點獨立數值驗證全部一致（Supporting 6 C10=13.3042 ℃、C19=7.1404 ℃、Wheel BK11=0.01359 kPa、BS11=−39.5 ℃）；vbaProject.bin 完整保留；R5 原檔未動。

---

## E. 交付方式更正（2026-02，由 parent 審查後修訂）

**原文第 5 行同第 45 行嘅交付描述已過時，請以本節為準。** 詳細量度與指令見
`docs/verification/r6_workbook_delivery.md`。

1. **openpyxl 產出唔可以直接交付**：逐部件比對（`tools/verify_r6_fidelity.py`）顯示該版本令
   **21 張表失去表單按鈕（`<controls>`）、16 張表失去繪圖引用**、少 33 個 drawing 部件、
   1 張內嵌圖片、22 個列印設定、3 個圖表 `.rels`。公式正確但工作簿介面層受損。
2. **改走無損路線**：`tools/patch_workbook_min.py` 以 R5 為底，只替換 3,733 格（14 張表）嘅公式，
   其餘部件逐位元組複製；刪 `calcChain.xml` 並設 `fullCalcOnLoad="1"`。
   意圖存於 `tools/r6_formula_intent.json`，重跑唔需要 openpyxl。
   openpyxl 產出改名為 `tools/R6_openpyxl_intent.xlsm`（已 .gitignore），唔會再覆蓋交付檔。
3. **Wheel 飽和表嘅冰面分支原版本實際未生效**：`fix_r6.py` 第 11 行起嘅 `BK`／`BL` 用咗水面係數，
   而該表驅動格 `D9`／`D11` 為空 → 表只覆蓋 **−40…0 ℃**，即整表都喺冰面區，所以原版本
   −39.5 ℃ 仍然算出 0.0201 kPa。已在補丁流程加入 `wheel_ice_correction()`（318 格改為
   `IF(BJ<273.16, 冰面, 水面)`），並由 `tools/verify_r6_values.py` **直接求值工作簿公式**證實
   −39.5 ℃ = 0.013591 kPa、−25 ℃ = 0.063289、0 ℃ = 0.611154、模擬 `D11=40` 時 20 ℃ = 2.3388 kPa。
4. **第 7 項（VML `<br>` 正規化）已不再需要**：無損路線唔經 openpyxl 回存，VML 保持原樣。
5. App 引擎修正照原樣保留（`AIR_MU[37] = 18.94e-6`、`state()` 域護衛），
   另加兩處 null 安全顯示（`wheel.js`／`psychro.js` 喺 `tdp = null` 時顯示「—」而唔係爆錯或顯示 0）。

