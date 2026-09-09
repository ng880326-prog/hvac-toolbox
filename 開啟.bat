@echo off
rem HVAC Toolbox Pro - one-click launcher
title HVAC Toolbox Pro
cd /d "%~dp0"
echo HVAC Toolbox Pro is starting at http://localhost:8080
echo Close this window to stop the app.
start "" http://localhost:8080
node tools\serve.js 8080
pause
