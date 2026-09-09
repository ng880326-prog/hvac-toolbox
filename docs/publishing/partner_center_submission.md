# Step 3 — Partner Center 逐欄填寫單（複製即貼）

前置: 託管網址 `<YOUR-URL>`（GitHub Pages / Cloudflare Pages, 見 microsoft_store_guide.md Step 1）
隱私政策 URL: **`<YOUR-URL>/privacy.html`**（已生成，隨部署包一併上傳 ✔）

## ① 註冊（免費）
1. https://partner.microsoft.com → 用 Microsoft 帳號 →「註冊個人帳戶」（2025-09-10 起個人免費）
2. 國家/地區選你的帳單地（香港: "Hong Kong SAR"）；完成驗證（電話/身份）

## ② 建立產品
- Product name: **HVAC Toolbox Pro**
- Default language: English (United States) + 可加 "Chinese (Traditional, Hong Kong SAR)"

## ③ 商店清單（欄位 → 內容, 全部已寫在 microsoft_store_guide.md 可直接貼）

| 欄位 | 內容 |
|---|---|
| Name | HVAC Toolbox Pro |
| Short description | 見指南（中英各 ≤100 字） |
| Description | 見指南（4000 字內, 中英全版） |
| Category | Utilities + Productivity |
| Keywords | HVAC, air conditioning, psychrometrics, duct, pipe, coil, chiller, VRF, engineering calculator, 暖通, 空調, 工程計算 |
| Search terms | 同 Keywords |
| Screenshots | `docs/screenshots/` 4 張（1366×900）✔ |
| Store logo / icon | `app/icons/icon-512.png` ✔ |
| **Privacy policy URL** | **`<YOUR-URL>/privacy.html`** ← 必填, 用隨包上傳的隱私頁 |
| Website | `<YOUR-URL>` |
| Support contact | 你的電郵 |
| Price | Free |
| Content rating | 3+ 全年齡（完成 age rating 問卷: 無暴力/賭博/酒精） |
| Categories (MS only) | Business & productivity tools |

## ④ 套件提交
- Upload MSIX（PWABuilder 產出）
- Target: Windows 10/11（x64 ✓ x86 ✓）
- 發布選項: 立即 / 指定日期
- 提交 → 審查 **1–3 個工作天**

## ⑤ 同文案用於其他商店（欄位對照）
- **Google Play**: 商店清單→實際字幕同文案；隱私政策 = 同上 `<YOUR-URL>/privacy.html`；
  Data safety 表: 「不收集任何資料」→ 全欄 No（無位置/無通訊錄/無分析/無廣告）
- **Apple**: App Store Connect → 隱私政策 URL 同上；App 隱私「Data Not Collected」→ 全 No

## 附: 審查常見退回 → 應對
| 退回原因 | 應對 |
|---|---|
| 隱私政策缺失/連結失效 | 上傳 `privacy.html` 並確認 `<YOUR-URL>/privacy.html` 可開 |
| 功能不完整/佔位 | 本 App 21 模組全功能＋離線, 已滿足 4.2；附上「關於」頁展示 |
| 網路存取說明不清 | 貼指南附錄的中英聲明 |
| 圖示/截圖尺寸 | 已 512/1366×900 ✔ |
