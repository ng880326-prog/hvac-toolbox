# Capacitor 打包上架 — 逐步指南（在您本機執行）

App 已是純 Web/PWA（零依賴，`app/` 目錄），打包只需三步：包裝 → 商店資產 → 上傳。

## 0) 前置
- Node.js ≥ 20（已有）
- 手機：**Android** = Android Studio；**iOS** = Mac + Xcode（必須 Mac）
- 桌面/電腦版：**Microsoft Store** 用 PWABuilder 即可（免 Capacitor）

## 1) 初始化（每個平台 1 條命令）

```powershell
cd "C:\Users\Kyle Ng\OneDrive\Desktop\HVAC_Toolbox_Pro_App\HVAC Tool"
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init "HVAC Toolbox Pro" "com.yourco.hvacpro" --web-dir=app
npx cap add android
npx cap add ios            # 需 Mac
npx cap sync
```

## 2) 打包
```powershell
# Android 執行（一鍵出 .aab 用於 Play）
npx cap open android      # Android Studio 內 Build > Generate Signed Bundle (.aab)
# iOS（Mac）
npx cap open ios          # Xcode 內 Archive → Distribute
# Windows：PWA → MSIX（免 Capacitor）
#   https://www.pwabuilder.com 貼上 https://你的網址 → Generate packages → MSIX
```

## 3) 商店上架要點（詳見 store_roadmap.md）

| | Google Play | Apple App Store | Microsoft Store |
|---|---|---|---|
| 帳號 | USD 25 一次性 | USD 99/年（需 Mac） | 個人免費（2025-09 起） |
| 檔案 | .aab | .ipa (Xcode) | MSIX (PWABuilder) |
| 特殊 | 新帳號需 20 測試員×14 天封測 | 4.2 準則：本 App 已離線運算 ✓ | 審查 1–3 天 |
| 必備 | 隱私政策、通訊錄無資料 ✓（供應商目錄已去個人資料） | 免責聲明（首頁已有） | 截圖 ×4 |

## 4) 商店資產清單
- 圖示：**已生成**（`app/icons/icon-192.png`、`icon-512.png`、`icon.svg`）
- 截圖：手機 6.7"×3 張 + 平板 1 張（用 Chrome DevTools 裝置模式截首頁＋盤管頁＋風機頁）
- 隱私政策：可貼簡版（離線計算、無收集數據、本地 localStorage 僅存語言/主題）
- 免責聲明：首頁已有（工程參考，須註冊工程師覆核）

## 5) 上傳站點（MS Store 之外建議部署）
```powershell
# GitHub Pages / Cloudflare Pages / Netlify 任選；只需上傳 app/ 目錄
# 唯一要求：HTTPS（PWA 與 Capacitor 需 https 來源）
```

時間線（平行做）：Capacitor 初始化 1 天 → 商店帳號/審查 1–2 週 → 全平台上架約 **3–4 週**。
