# HVAC Toolbox Pro — Android 打包 (在您本機執行)
# 前置: 安裝 Android Studio (含 JDK 17+ 與 Android SDK)、Android SDK Platform 34
cd android
if (-not (Test-Path "local.properties")) {
  if ($env:ANDROID_HOME) { "sdk.dir=$($env:ANDROID_HOME)" | Out-File -Encoding ascii local.properties }
  elseif (Test-Path "$env:LOCALAPPDATA\Android\Sdk") { "sdk.dir=$env:LOCALAPPDATA\Android\Sdk" | Out-File -Encoding ascii local.properties }
}
.\gradlew.bat bundleRelease   # 產出: android\app\build\outputs\bundle\release\app-release.aab -> 上傳 Google Play
# 或 .\gradlew.bat assembleDebug 除錯包 (apk)
