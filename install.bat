@echo off
echo ========================================
echo    SherLock - First Time Setup
echo ========================================
echo.
echo This will install all required dependencies.
echo Make sure you have Node.js, Python, and MongoDB installed.
echo.
pause

echo.
echo [1/4] Installing Backend Dependencies...
echo ----------------------------------------
cd /d %~dp0backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend npm install failed!
    pause
    exit /b 1
)

echo.
echo [2/4] Installing AI Service Dependencies...
echo ----------------------------------------
cd /d %~dp0ai_service
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: AI service pip install failed!
    pause
    exit /b 1
)

echo.
echo [3/4] Creating Admin User...
echo ----------------------------------------
cd /d %~dp0backend
node seed.js

echo.
echo [4/4] Setup Complete!
echo ========================================
echo.
echo    Admin Credentials:
echo    Username: admin
echo    Password: Admin@123
echo.
echo    To start the application:
echo    Double-click start_all.bat
echo.
echo ========================================
pause
