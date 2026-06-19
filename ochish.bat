@echo off
chcp 65001 >nul
cd /d "%~dp0"

if exist "login.html" (
  start "" "%CD%\login.html"
  exit /b 0
)

start "" "https://yoqubjonovozodbek99-dotcom.github.io/new-project/login.html"
