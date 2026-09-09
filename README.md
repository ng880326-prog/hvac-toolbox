# HVAC Toolbox Pro — 跨平台升級原型

將 `00_HVAC Toolbox_R5.xlsm`（Benjamin Leung, 2014, R5）的**全部工作表**升級為現代化、響應式、可離線安裝的跨平台應用程式原型（PWA）：20 個模組對應原檔 30+ 張工作表（含隱藏計算表邏輯），並重繪濕空氣圖表（O／M／H／S 點＋冷卻／加熱過程線）。

## 快速開始

```powershell
npm start          # http://localhost:8080  (零依賴，Node 內建伺服器)
npm test           # 引擎測試（69 條，與 Excel 快取值對照）
npm run smoke      # DOM 行為測試（20 模組渲染 + 82 次輸入交互模擬）
npm run check      # 兩者
```

瀏覽器開啟 `http://localhost:8080`；桌面 Chrome/Edge 可「安裝」為獨立視窗應用，手機瀏覽器可「加到主畫面」離線使用。

## 目錄結構

```
app/                    PWA 應用（無建置步驟，純 ES Modules）
  index.html            殼層
  css/app.css           設計系統（響應式、深淺色、觸控）
  js/engine/            計算引擎（純函數，Node/瀏覽器共用）
    psychro.js          濕空氣（Hyland-Wexler、焓、濕球迭代…）
    fluids.js           Hazen-Williams、LMTD、換算、NPSH、保溫
    ducts.js            Haaland、Darcy-Weisbach、Huebscher、扁圓
    electrical.js       馬達電流、扭矩、dB、梯間加壓(GB 51251/50045)
  js/modules/           14 個計算模組 UI（雙語 繁中/EN）
  js/data/pipes.js      鋼管尺寸表（原檔 Pipe Sizing 表）
  manifest.webmanifest  PWA manifest（可安裝、捷徑）
  sw.js                 Service worker（離線快取）
  icons/                SVG + PNG 圖示
tests/                  引擎測試向量 + DOM 煙霧測試
analysis/               Excel 擷取結果（34 工作表、公式去重、快取值）
docs/
  verification/         逐條公式檢驗報告（三份 + 向量 + 模組規格）
  publishing/           商店上架路線圖
tools/                  擷取腳本、靜態伺服器
```

## 14 個計算模組

| 模組 | 原 Excel 工作表 | 模組 | 原 Excel 工作表 |
|---|---|---|---|
| 🌡️ 濕空氣計算器 | Psychrometric Chart | 🔥 鍋爐 | Boiler |
| 💨 風管/ACH/送風口/百葉 | Air-side | ⚡ 馬達電力 | Motor |
| 🚿 水管管徑 | Pipe Sizing | 🔊 聲學 | Acoustics |
| 🧊 冷卻盤管 | Coil | 🌀 NPSH 氣蝕 | NPSH |
| ⚙️ 轉輪熱回收 | Wheel | 🧊 管道保溫 | Insulations |
| 🔀 換熱器 | Hx | 🏢 梯間加壓 | SPF(PRC) → GB 51251-2017 |
| ❄️ 冷機 | Chiller | 🔁 單位換算 | （綜合） |

## 公式檢驗與修正摘要

- 引擎 **64/64 測試通過**，其中濕空氣、Hazen-Williams、聲學、GB 表等直接以 **Excel 快取值**為基準。
- 修正了原檔多項問題：濕空氣密度（1/v → (1+W)/v）、馬達電流補效率 η、37°C 黏度、<0°C 飽和蒸氣壓（加 ice 係數）、梯間加壓改接現行 **GB 51251-2017 表 3.4.2 + ×1.2**、當量直徑改標準 Huebscher、鍋爐產汽雙換算等。
- 詳見 `docs/verification/` 四份報告（每條公式：Excel 原文／標準公式／出處 URL／判定 ✅⚠️❌）。

## 上架路線

PWA 原型 → 打包上架，詳見 `docs/publishing/store_roadmap.md`：
- **Google Play**：Capacitor 打包 `.aab`（或 TWA），開發者帳號 USD 25 一次性
- **Apple App Store**：Capacitor（需 Mac + Xcode），USD 99/年，需離線運算（本 app 已離線可用）＋免責聲明
- **Microsoft Store**：PWABuilder（MSIX），個人開發者現時免費

> ⚠️ 本工具僅供工程參考，實際設計須由註冊專業工程師按適用規範覆核。
