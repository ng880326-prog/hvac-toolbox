# HVAC Toolbox Pro — Android 打包 (在您本機執行)
# 前置: Android Studio (含 JDK 17+) 與 Android SDK Platform 34、Node.js
#
# 重要: gradlew 唔會自動更新網頁資產。android/app/src/main/assets/public/ 係 Capacitor 由 app/
# 複製出嚟嘅副本，而且已被 .gitignore 排除，所以舊副本會靜靜咁被打包入 .aab（曾經因此差點
# 出貨一個冰面飽和壓力錯 1000 倍嘅引擎）。每次 build 之前一定要 sync。
$root = Split-Path -Parent $PSScriptRoot
Push-Location $root
Write-Host '==> syncing web assets from app/ (capacitor sync)' -ForegroundColor Cyan
npx --no-install cap sync android
if ($LASTEXITCODE -ne 0) {
  Write-Host 'npx cap sync 失敗：請先在專案根目錄執行 npm install' -ForegroundColor Red
  Pop-Location
  exit 1
}
Pop-Location

cd $PSScriptRoot
if (-not (Test-Path "local.properties")) {
  if ($env:ANDROID_HOME) { "sdk.dir=$($env:ANDROID_HOME)" | Out-File -Encoding ascii local.properties }
  elseif (Test-Path "$env:LOCALAPPDATA\Android\Sdk") { "sdk.dir=$env:LOCALAPPDATA\Android\Sdk" | Out-File -Encoding ascii local.properties }
}
.\gradlew.bat bundleRelease   # 產出: android\app\build\outputs\bundle\release\app-release.aab -> 上傳 Google Play
# 或 .\gradlew.bat assembleDebug 除錯包 (apk)
