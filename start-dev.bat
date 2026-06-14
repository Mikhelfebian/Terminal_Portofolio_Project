@echo off
title terminal-bio DEV
echo ========================================
echo  Menjalankan terminal-bio (Development)
echo ========================================
echo.
echo [1/2] Memulai Backend (port 3001)...
start "API Server" cmd /c "cd /d %~dp0server && node src/index.js"
timeout /t 3 /nobreak >nul

echo [2/2] Memulai Frontend (port 5173)...
start "Vite Dev" cmd /c "cd /d %~dp0 && npx vite --host"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo  Frontend : http://localhost:5173
echo  Backend  : http://localhost:3001
echo ========================================
echo  Tutup jendela ini untuk menghentikan.
echo ========================================
pause
