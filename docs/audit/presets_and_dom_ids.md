# 設計預設（可編輯、可儲存）與本輪附帶修復

日期：2026-02 ｜ 相關檔案：`app/js/data/presets.js`、`app/js/presets_ui.js`、`app/js/ui.js`、
`app/js/modules/coil.js`、`app/js/charts.js`、`tests/smoke.mjs`

## 一、設計預設

**改動前**：三個預設（AHU／PAU／冬季）係寫死喺 `coil.js` 裡面嘅物件，用戶無法新增、改名或保存
自己公司嘅標準工況——每次都要重新輸入，而且無從得知邊組數字係「公司標準」。

**改動後**：

- `app/js/data/presets.js` — 版本化嘅記錄（`hvac-toolbox-presets-v1`），存於 `localStorage`。
  - 欄位：室外夏（乾球／濕球）、室外冬（乾球／相對濕度）、回風（乾球／相對濕度）、送風量、
    新風比例、送風出盤（溫度／相對濕度）、旁通係數、冷媒水供回水、熱媒水供回水。
  - **衍生值一律即時計算、不另存**：冷媒水溫差、熱媒水溫差、送風溫差（室內−送風）。
    咁樣就唔可能出現「溫差同供回水互相矛盾」嘅情況（原檔正是把兩者分開輸入而各自漂移）。
  - 出廠預設已按你提供嘅公司標準：**CHW 7／12.5 °C、HWS 60／50 °C、室內 24 °C／50 %RH**；
    其餘（室外 35／28、冬季 5 °C／70 %、送風出盤）係可直接改嘅預設值。
  - 讀取極度防禦：storage 不可用（私隱模式）、JSON 損壞、欄位缺失或非數字、超過 30 組、
    舊版 schema——任何情況都回退出廠清單，唔會令模組渲染失敗。
- `app/js/presets_ui.js` — 共用預設卡：選擇／改名／逐格編輯（即時儲存）／套用至輸入／
  以目前輸入更新／新增副本／刪除／還原出廠，並顯示「已儲存於本瀏覽器 · N 組」。
- `coil.js` — 由硬編碼 `PRESETS` 改用上述卡片；冷媒水供回水對成為單一來源：改供水／回水會同步
  更新冷媒水溫差欄位，兩者永遠一致。

## 二、附帶修復（都係新測試守衛揪出嚟嘅真缺陷）

### 1. 六個模組出現重複 DOM id

`field()` 以 `f-<key>` 命名輸入格，同一頁有兩張卡用同一個 key 就會產生**重複 id**：
`acoustics`（r、q）、`coil`（vMax）、`ducts`（q、t、rh、vMax、pdMax、v）、`pipes`（vMax）、
`psychro`（t1、rh1、t2、rh2）、`convert`（x，每個換算卡都叫 x）。

影響：`<label for>` 全部指向第一個同名輸入（點標籤會跳到錯嘅格）、任何 `document.querySelector('#f-x')`
取到錯嘅元素、無障礙工具亦判定為無效 HTML。之前完全隱形，因為 smoke 測試用嘅 id 對照表以 id 為鍵、
後寫入者覆蓋前者，重複 id 根本不會被發現。

**修法**：`form()` 新增第 4 個參數 `idPrefix`（`ui.js` 亦支援 `spec.id`），逐個有衝突嘅表單加命名空間
（`size-`／`table-`／`dif-`／`lou-`／`steam-`／`swl-`／`pipe-`／`coil-`／`conv1-`⋯），
state key 不變，所以計算邏輯完全唔受影響。`fcu.js` 與 `psychro.js` 兩處直接查 `#f-` 嘅地方已同步更新。

**守衛**：`tests/smoke.mjs` 逐模組走一次 DOM，收集所有 `id` 屬性，有重複即 FAIL。

### 2. 零風量會把 NaN 畫入圖表

冷氣盤管在 `vs = 0`（或預設值被清成 0）時，質量加權混合 `mix()` 除以零 → NaN →
傳入濕空氣圖表 → SVG 出現 `x1="NaN"`。瀏覽器報 console error 而且畫唔出任何嘢；
測試記錄到 8 個 `Expected length, "NaN"` 錯誤。

**修法**：`coil.js` 在混合前守衛風量（`vs > 0` 且 `0 ≤ fra ≤ 1`），否則清空結果與圖表；
`charts.js` 再過濾非有限值——非有限嘅製程線直接略過、狀態點不畫，圖例亦只列真正畫出嘅點。

**守衛**：`tests/smoke.mjs` 檢查每個模組渲染後嘅 markup 有無 `NaN`。

### 3. 轉輪頁：改高度 1 m 壓力無反應

原本用 0.05 kPa 死區比較，改高度 1 m（壓力差 0.012 kPa）會落在死區內，壓力顯示不變。
現改為清晰語意：**高度為主**，每次改高度即重算 ISA 壓力並寫入壓力欄；直接改壓力則視為
手動覆寫，並顯示提示，改回高度即回復推算值。

## 三、驗證證據

| 命令 | 結果 |
|---|---|
| `node tests/run_tests.mjs` | PASS 76 / 76 |
| `node tests/smoke.mjs` | SMOKE OK（22 模組，含重複 id 與 NaN 兩項新守衛，0 違規） |
| `python tools/verify_presets.py`（真實瀏覽器 E2E） | 18 ok / 0 fail、0 console error |
| `python tools/verify_wheel.py` | 22 ok / 0 fail |
| `python tools/check_wheel_layout.py` | 桌面／平板兩欄並排、手機堆疊、無橫向溢出、0 error |
| `python tools/deep_audit_full.py` | logic 28/28、uifails 0、errors 0、offline tiles 22、csv True |
| `python tools/list_form_ids.py` | 靜態列出各模組表單 key 衝突（修復前 16 項，修復後由 smoke 守衛把關） |

`verify_presets.py` 覆蓋：出廠預設內容（CHW 7/12.5、HWS 60/50、室內 24/50）、衍生溫差、
**改值→重載→仍在**（真 localStorage）、套用至模組輸入、冷媒水溫差由供回水推算、新增／刪除／
還原出廠、以及**人手改壞 store 後仍可正常渲染**（回退單一可用預設、無 NaN 流出）。
