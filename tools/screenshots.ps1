# HVAC Toolbox Pro — 商店截圖一鍵重跑（Chrome headless）
# 用法: powershell -File tools\screenshots.ps1
$ErrorActionPreference = 'SilentlyContinue'
$chrome = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $chrome) { Write-Output "CHROME NOT FOUND - install Chrome or change path"; exit 1 }
$root = Split-Path -Parent $PSScriptRoot
New-Item -ItemType Directory -Force -Path (Join-Path $root 'docs\screenshots') | Out-Null
$job = Start-Job -ScriptBlock { Set-Location $using:root; node tools\serve.js 8157 }
Start-Sleep -Seconds 2
$shots = @(
  @('home', 'index.html#/'),
  @('psychro', 'index.html#m/psychro'),
  @('coil', 'index.html#m/coil'),
  @('pipes', 'index.html#m/pipes')
)
foreach ($s in $shots) {
  $out = Join-Path $root "docs\screenshots\$($s[0]).png"
  & $chrome --headless --disable-gpu --no-sandbox --hide-scrollbars `
    --window-size=1366,900 --virtual-time-budget=6000 "--screenshot=$out" "http://localhost:8157/$($s[1])" | Out-Null
  if (Test-Path $out) { Write-Output "captured: $($s[0]).png" } else { Write-Output "FAILED: $($s[0])" }
}
Stop-Job $job; Remove-Job $job -Force
Write-Output "done -> docs\screenshots\"