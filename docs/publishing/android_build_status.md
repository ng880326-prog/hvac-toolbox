# Android 打包狀態 (2026)
- Capacitor 原生專案已生成: `android/` (110 檔, 含 Gradle 包裝器)
- App 資產已打包: `android/app/src/main/assets/public/` (47 檔 = 完整 app/)
- Launcher 圖示已品牌化 (15 個 mipmap ic_launcher.png = app/icons/icon-512.png)
- 一鍵建置腳本: `android/build_android.ps1` (偵測 sdk.dir、gradlew bundleRelease)

## 您本機執行
1. 裝 Android Studio (內含 JDK 17+、SDK Platform 34)
   https://developer.android.com/studio
2. `android\build_android.ps1` → 產出 `app-release.aab`
   (.aab 需簽名: Android Studio Build > Generate Signed Bundle)
3. Google Play Console: 上傳 .aab → 填商店資料 (見 store_roadmap.md)
   - 新個人帳號: 20 測試員 x 14 天封測 (2023-11 起)
4. iOS: 在 Mac 上 `npx cap add ios` → Xcode Archive → App Store Connect
5. Windows: PWABuilder 直接出 MSIX (無需本專案)

## 自訂 appId
`capacitor.config.json` → "appId": 改為您網域倒序, 再 `npx cap sync`。
(目前: com.hvactoolbox.pro)
