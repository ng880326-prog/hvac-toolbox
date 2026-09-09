# Partner Center — 建產品畫面逐欄指引（HVAC Toolbox Pro）

## 0) 註冊時會問什麼（我無法代填，以下直接照抄）
| 畫面欄位 | 建議填寫 |
|---|---|
| Microsoft 帳號 | 您的個人/公司 Microsoft 帳號 |
| 國家/地區 | Hong Kong SAR（依帳單地） |
| 帳戶類型 | **個人**（2025-09-10 起個人開發者免費） |
| 開發者顯示名稱 | 可用公司名或「HVAC Toolbox」 |
| 電話驗證 | 您的號碼（收 SMS/來電） |
| 稅務資料 | 完成稅務問卷（免費 App 也要填; 香港無 VAT, 依畫面完成即可） |

## 1) 建產品：兩條路徑（A 最快）

### ✅ 路徑 A — 「Web App」型（強烈推薦，免 MSIX）
Partner Center → **Apps → New product → Type: Web app**
- **只填 2 個欄位**：
  - URL: **`<YOUR-URL>`**（你的 GitHub Pages / Cloudflare URL）
  - Name: **HVAC Toolbox Pro**
- 微軟會**自動快照你的 PWA**（manifest＋SW＋圖示已齊 ✔）
- 其餘（文案/截圖/隱私政策/類別）照 old 清單貼
- 省去 MSIX 上傳與簽署 → **最快過審**

### 路徑 B — MSIX 型（原本方案）
1. Apps → Application → Store app
2. 上傳 PWABuilder 的 `.msix`
3. 其餘同上

## 2) 同一畫面剩餘欄位（兩路徑通用）

| 畫面 | 欄位 | 內容（見 microsoft_store_guide.md / partner_center_submission.md） |
|---|---|---|
| Market | Markets | 全選（預設）或先「Hong Kong SAR + 台灣/中國大陸/全球英文區」 |
| Properties | Category | Utilities / Productivity |
|  | Keywords | HVAC, air conditioning, psychrometrics, duct sizing, pipe sizing, coil, chiller, VRF, engineering calculator, 暖通, 空調, 工程計算 |
|  | Age rating | 完成問卷 → 3+（無暴力/賭博/酒精） |
|  | **Privacy policy URL** | **`<YOUR-URL>/privacy.html`** |
| Store listing | Name / Short desc / Description | 指南內中英全版（複製即貼） |
|  | Logo | `app/icons/icon-512.png` |
|  | Screenshots | `docs/screenshots/` 4 張 |
|  | Support contact | 您的電郵 |
|  | Website | `<YOUR-URL>` |
| Pricing | Price | Free |

## 3) 提交後
- 審查 **1–3 個工作天**（路徑 A 更快, 常 <24h）
- 隨時回來貼審查意見 → 我按「審查退回應對表」處理

## 4) 若您是公司/發行商
- 帳戶類型選「公司」→ 需企業驗證（D-U-N-S 或商業登記）；文案/圖資產完全相同
- 路徑 A 的 URL 穩定即可（公司域更佳）
