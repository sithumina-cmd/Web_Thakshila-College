@echo off
title Thakshila College - Gampaha Web Server Launcher
cd /d "%~dp0"
echo ========================================================
echo    Thakshila College - Gampaha Official Website
echo ========================================================
echo.
echo Starting Web Server...
echo Opening in default browser at http://localhost:5173/
echo.

start "" "http://localhost:5173/"
npm run dev

pause
