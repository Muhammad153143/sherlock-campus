@echo off
echo.
echo ============================================
echo    SHERLOCK PRODUCTION STARTUP SCRIPT
echo ============================================
echo.

echo Starting SherLock Production Services...
echo.

echo 1. Starting AI Service on port 5001...
cd /d "%~dp0\ai_service"
start "SherLock AI Service" cmd /c "python app.py"

timeout /t 10 /nobreak >nul

echo.
echo 2. Starting Backend Service on port 5000...
cd /d "%~dp0\backend"
start "SherLock Backend" cmd /c "node server.js"

echo.
echo ============================================
echo Services started successfully!
echo.
echo - AI Service: http://localhost:5001
echo - Backend: http://localhost:5000  
echo - Frontend: http://localhost:5000
echo.
echo Admin Dashboard: http://localhost:5000/html/admin-dashboard.html
echo ============================================
echo.

pause