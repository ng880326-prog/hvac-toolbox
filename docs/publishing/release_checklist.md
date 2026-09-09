# 發布就緒清單（Release Checklist）— 基本面逐項核對

狀態：✅ 已就緒 / ⬜ 待做

## A. PWA 基本面
- ✅ manifest: name/short_name/start_url/**id**/scope/display/**display_override**/lang/theme/background/categories
- ✅ 圖示 192 + 512 + **maskable** + SVG；apple-touch-icon
- ✅ Service Worker: 離線快取 **全 46 檔**（含 privacy.html）；navigate fallback → index.html
- ✅ 雙語（zh-HK / en）、深色模式、系統主題跟隨、語言自動偵測
- ✅ iOS meta（apple-mobile-web-app-capable/status-bar/title）
- ✅ PWA 安裝按鈕（beforeinstallprompt）
- ⬜ 上傳託管後於 Lighthouse/PWABuilder 複檢（需公開網址）

## B. 應用功能基本面（21 模組）
- ✅ 全部模組可渲染＋**88 次交互模擬**通過（行為測試）
- ✅ 引擎 69/69（對照 Excel 快取值＋最新標準）
- ✅ 每模組：即時計算、錯誤狀態「—」、輸入邊界（null 防護）、公式＋出處顯示
- ✅ 複製結果 / CSV 匯出 / 列印計算摘要 / 重置按鈕
- ✅ 濕空氣圖表＋AHU 示意圖（SVG，深淺色適配）
- ✅ 首頁「關於」：版本 1.0.0、隱私與安全聲明

## C. 原生打包基本面
- ✅ Android 專案：applicationId `com.hvactoolbox.pro`、versionCode 1、**versionName "1.0.0"**、minSdk/targetSdk 用 Capacitor 預設（23/34）
- ✅ strings.xml app_name = HVAC Toolbox Pro、custom_url_scheme
- ✅ Web 資產 47 檔已 sync（含新版 manifest/SW/隱私頁）
- ✅ Launcher 圖示品牌化（15 mipmap）
- ✅ 一鍵建置 `android/build_android.ps1`（.aab）
- ⬜ 本機編譯（需 Java/Android SDK——僅您本機可做）
- ⬜ iOS 平台（Mac 上 npx cap add ios）

## D. 商店提交基本面
- ✅ 文案（中英短/長描述、關鍵字、類別）→ microsoft_store_guide.md
- ✅ 隱私政策頁 privacy.html ＋ 中英隱私聲明（指南附錄）
- ✅ 截圖 ×4（1366×900）→ docs/screenshots/
- ✅ Partner Center 逐欄對照 + 註冊指引（兩份 doc）
- ✅ 部署包 dist/hvac-toolbox-site.zip（46 檔）
- ⬜ 託管網址（需您的帳號）
- ⬜ Partner Center / Play Console / App Store Connect 提交（需您的帳號）

## E. 代碼健康
- ✅ `npm run check` 全綠（引擎＋行為）
- ✅ 零建置依賴（PWA 直接用；Capacitor 僅打包用）
- ✅ 所有入庫數據附來源＋可重算驗證

## 發布前必做的最後 3 件事
1. `npm run check` 再跑一次（已綠 ✓）
2. 託管後：開 `https://<url>/privacy.html` 確認 200
3. 每改一次 `app/`：`npx cap sync android`（10 秒）
