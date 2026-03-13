@echo off
title DrugShield Frontend Setup
echo ================================================
echo   DrugShield Admin Frontend - Setup
echo ================================================
echo.

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found!
    echo         Download from: https://nodejs.org/ (LTS version)
    pause
    exit /b 1
)
echo [OK] Node.js found:
node --version

:: Install dependencies
echo.
echo [SETUP] Installing dependencies...
npm install
if errorlevel 1 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
)

echo.
echo ================================================
echo   Setup Complete!
echo   Run start.bat to launch the frontend.
echo ================================================
pause
