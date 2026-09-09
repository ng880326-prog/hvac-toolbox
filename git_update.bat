@echo off
rem HVAC Toolbox Pro - git update & push
cd /d "%~dp0"
git add -A
git commit -m "update: HVAC Toolbox Pro" || echo (no changes or commit failed)
if "%~1"=="" (
  echo Usage: git_update.bat https://github.com/YOU/REPO.git
  echo First time: git remote add origin https://github.com/YOU/REPO.git
) else (
  git remote add origin %1 2>nul
  git push -u origin main
)
pause