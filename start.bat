@echo off
title Nutrition Assistant Starter
color 0A

echo ==========================================================
echo    🍎  NUTRITION ASSISTANT FULL-STACK STARTER  🍎
echo ==========================================================
echo.

:: Check if dependencies are installed
if not exist node_modules (
    echo [INFO] Installing root dependencies...
    call npm install
)

if not exist server\node_modules (
    echo [INFO] Installing server dependencies...
    call npm install --prefix server
)

if not exist client\node_modules (
    echo [INFO] Installing client dependencies...
    call npm install --prefix client --legacy-peer-deps
)

echo [1/3] Seeding the database (Registering default users)...
call npm run seed
if %ERRORLEVEL% neq 0 (
    echo.
    echo [WARNING] Database seeding failed.
    echo Please check if your Internet connection is working and if your IP
    echo is whitelisted on your MongoDB Atlas cluster.
    echo.
    pause
)

echo.
echo [2/3] Starting Backend Server (Port 5000)...
start "Backend Server (Port 5000)" cmd /k "npm run dev-server"

timeout /t 2 >nul

echo [3/3] Starting Frontend Client (Port 5173)...
start "Frontend Client (Port 5173)" cmd /k "npm run dev-client"

echo.
echo ==========================================================
echo  🎉 SETUP & STARTUP ACTIONS COMPLETED 🎉
echo ==========================================================
echo.
echo  Default Login Credentials:
echo    - Standard User:
echo        Email:    user@assistant.com
echo        Password: user123
echo.
echo    - Admin User:
echo        Email:    admin@assistant.com
echo        Password: admin123
echo.
echo  Note: If you receive "invalid login" or "not registered" errors,
echo  please verify that the database seeding in step [1/3] was successful.
echo ==========================================================
echo.
echo Press any key to exit this starter window (servers will keep running)...
pause >nul
