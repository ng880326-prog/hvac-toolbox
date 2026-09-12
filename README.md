# HVAC Toolbox Pro — 跨平台升級原型

將 `00_HVAC Toolbox_R5.xlsm`（Benjamin Leung, 2014, R5）的**全部工作表**升級為現代化、響應式、可離線安裝的跨平台應用程式原型（PWA）：22 個模組對應原檔 30+ 張工作表（含隱藏計算表邏輯），並重繪濕空氣圖表（O／M／H／S 點＋冷卻／加熱過程線）。

## 快速開始

```powershell
npm start              # http://localhost:8080  (零依賴，Node 內建伺服器，serve app/)
npm test               # 引擎測試 76 條（與 Excel 快取值 + ASHRAE 2025 對照）
npm run smoke          # DOM 行為測試（22 模組渲染 + 155 次輸入交互 + 重複 id／NaN 守衛）
npm run check          # 上列兩項 + dist/ 打包副本防漂移檢查
npm run package:site   # 重建 dist/hvac-toolbox-site/（+ .zip），上架用
```

瀏覽器開啟 `http://localhost:8080`；桌面 Chrome/Edge 可「安裝」為獨立視窗應用，手機瀏覽器可「加到主畫面」離線使用。

## 目錄結構

```
app/                    PWA 應用（無建置步驟，純 ES Modules）— 唯一來源
  index.html            殼層
  privacy.html          私隱政策（商店上架必備）
  css/app.css           設計系統（響應式、深淺色、觸控）
  js/engine/            計算引擎（純函數，Node/瀏覽器共用）
    psychro.js          濕空氣（Hyland-Wexler 水/冰兩分支、焓、濕球迭代…）
    fluids.js           Hazen-Williams、LMTD、換算、NPSH、保溫
    ducts.js            Haaland、Darcy-Weisbach、Huebscher、扁圓
    electrical.js       馬達電流、扭矩、dB、梯間加壓(GB 51251/50045)
  js/modules/           22 個計算模組 UI（雙語 繁中/EN）
  js/data/pipes.js      鋼管尺寸表（原檔 Pipe Sizing 表）
  js/data/vectors.js    引擎測試向量（74 條，Node 與 App 自檢共用同一份）
  js/data/presets.js    設計預設（可編輯、存於瀏覽器；出廠含公司標準 CHW 7/12.5、HWS 60/50）
  js/presets_ui.js      共用的預設編輯卡（選擇／改名／編輯／套用／新增／刪除／還原出廠）
  manifest.webmanifest  PWA manifest（可安裝、捷徑）
  sw.js                 Service worker（離線快取）
  icons/                SVG + PNG 圖示
dist/hvac-toolbox-site/ 由 app/ 鏡像出來的商店上架副本（勿手改，見下）
legacy/                 最初嘅單頁原型（死碼，只供歷史參考 — 見 legacy/README.md）
tests/                  Node 端測試（run_tests.mjs 讀 app/js/data/vectors.js、smoke.mjs）
analysis/               Excel 擷取結果（34 工作表、公式去重、快取值）
docs/
  verification/         逐條公式檢驗報告（三份 + 向量 + 模組規格）
  publishing/           商店上架路線圖
tools/                  擷取腳本、靜態伺服器、package_site.mjs（打包/防漂移）
```

> **單一來源原則**：`app/` 係唯一真本。`dist/` 由 `npm run package:site` 產生，`npm run check`
> 會逐檔 sha256 比對，唔一致就失敗；Android 資產由 `npm run sync:android` 同步（`gradlew` 唔會自動做）。
> 呢兩層防護係為咗堵住一次真實事故：`dist/` 曾經缺 `privacy.html`（商店即退）兼夾住舊引擎出貨。

## 22 個計算模組

| 模組 | 原 Excel 工作表 | 模組 | 原 Excel 工作表 |
|---|---|---|---|
| 🌡️ 濕空氣計算器 | Psychrometric Chart | 🔥 鍋爐 | Boiler |
| 💨 風管/ACH/送風口/百葉 | Air-side | ⚡ 馬達電力 | Motor |
| 🚿 水管管徑 | Pipe Sizing | 🔊 聲學 | Acoustics |
| 🧊 冷卻盤管 | Coil | 🌀 NPSH 氣蝕 | NPSH |
| ⚙️ 轉輪熱回收 | Wheel | 🧊 管道保溫 | Insulations |
| 🔀 換熱器 | Hx | 🏢 梯間加壓 | SPF(PRC) → GB 51251-2017 |
| ❄️ 冷機 | Chiller | 🔁 單位換算 | （綜合） |

其餘 8 個模組對應原檔其他工作表與查表資料：🏗️ AHU 機組（Trane CLCP）、🪟 風機盤管 FCU、
🛋️ 分體機 SAC（HK 目錄）、🪭 風機 Fan（252 行目錄）、🏙️ VRF 多聯（原廠補正表）、
🧱 水泵/管路 PN、🌐 網絡工具（供應商/網站表）、🔍 數據真確性（App 內跑全部 74 條向量）。

## 公式檢驗與修正摘要

- 引擎 **74/74 測試通過**；濕空氣、Hazen-Williams、聲學、GB 表等直接以 **Excel 快取值**為基準，
  再以 ASHRAE Fundamentals 2025、CIBSE、IAPWS、GB 51251-2017、AHRI 550/590-2023 獨立覆核。
- 修正了原檔多項問題：濕空氣密度（1/v → (1+W)/v）、馬達電流補效率 η、37°C 黏度、
  <0°C 飽和蒸氣壓（改用 Hyland-Wexler 冰面係數）、梯間加壓改接現行 **GB 51251-2017 表 3.4.2 + ×1.2**、
  當量直徑改標準 Huebscher、鍋爐產汽雙換算等。
- **2026-02 修復**：冰面分支係數 C6 曾抄成 `-9.484024e-10`（正確 `-9.484024e-13`，差 1000 倍），
  令 pws(0°C) 回報 0.0031 kPa（應為 0.6112）；現已改用科學記號書寫，並加入 −40/−20/−10/0°C
  及冰↔水分支連續性 5 條回歸向量永久鎖定。
- 詳見 `docs/verification/` 四份報告（每條公式：Excel 原文／標準公式／出處 URL／判定 ✅⚠️❌）。

## 上架路線

PWA 原型 → 打包上架，詳見 `docs/publishing/store_roadmap.md`：
- **Google Play**：Capacitor 打包 `.aab`（或 TWA），開發者帳號 USD 25 一次性
- **Apple App Store**：Capacitor（需 Mac + Xcode），USD 99/年，需離線運算（本 app 已離線可用）＋免責聲明
- **Microsoft Store**：PWABuilder（MSIX），個人開發者現時免費

> ⚠️ 本工具僅供工程參考，實際設計須由註冊專業工程師按適用規範覆核。
