@echo off
:: ─────────────────────────────────────────────────────────────────────────────
::  Samagama — Windows Start Script  (start.bat)
::  Usage:  start.bat          (normal start)
::          start.bat --seed   (seed DB with sample data, then start)
::          start.bat --clean  (kill processes on ports 5001 & 5173 first)
:: ─────────────────────────────────────────────────────────────────────────────
setlocal EnableDelayedExpansion

:: ── Ensure Node.js is on PATH ─────────────────────────────────────────────
set "PATH=C:\Program Files\nodejs;%PATH%"

set "ROOT_DIR=%~dp0"
set "SERVER_DIR=%ROOT_DIR%server"
set "CLIENT_DIR=%ROOT_DIR%client"
set "LOG_DIR=%ROOT_DIR%.logs"
set "SEED=0"
set "CLEAN=0"

:: ── Parse args ────────────────────────────────────────────────────────────────
:parse_args
if "%~1"=="" goto :done_args
if /I "%~1"=="--seed"  set "SEED=1"
if /I "%~1"=="--clean" set "CLEAN=1"
if /I "%~1"=="--help"  goto :show_help
shift
goto :parse_args

:show_help
echo.
echo  Samagama Windows start script
echo    start.bat              Start everything
echo    start.bat --seed       Seed the database first, then start
echo    start.bat --clean      Kill processes on ports 5001/5173 first
echo.
exit /b 0

:done_args

:: ── Banner ────────────────────────────────────────────────────────────────────
echo.
echo  ========================================================
echo    Samagama - Community FAQ Platform
echo    Local Dev Server
echo  ========================================================
echo    Frontend : http://localhost:5173
echo    API      : http://localhost:5001
echo    Health   : http://localhost:5001/health
echo  ========================================================
echo.

:: ── Create log dir ────────────────────────────────────────────────────────────
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

:: ── Prerequisite: Node.js ─────────────────────────────────────────────────────
echo [INFO]  Checking prerequisites...
node -v >nul 2>&1
if errorlevel 1 (
    echo [FAIL]  Node.js is not installed. Install from https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo [  OK]  Node.js %NODE_VER% found

npm -v >nul 2>&1
if errorlevel 1 (
    echo [FAIL]  npm is not installed. Install from https://nodejs.org
    pause
    exit /b 1
)
echo [  OK]  npm found

:: ── Clean ports if requested ──────────────────────────────────────────────────
if "%CLEAN%"=="1" (
    echo [INFO]  Killing processes on port 5001...
    for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":5001 "') do (
        taskkill /PID %%p /F >nul 2>&1
    )
    echo [INFO]  Killing processes on port 5173...
    for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":5173 "') do (
        taskkill /PID %%p /F >nul 2>&1
    )
    timeout /t 1 /nobreak >nul
)

:: ── Install dependencies ──────────────────────────────────────────────────────
echo.
echo [INFO]  ── Installing Dependencies ──────────────────────────────
if not exist "%ROOT_DIR%node_modules" (
    echo [INFO]  Installing root dependencies...
    pushd "%ROOT_DIR%"
    npm install --silent
    if errorlevel 1 ( echo [FAIL]  Root npm install failed & pause & exit /b 1 )
    popd
    echo [  OK]  Root dependencies installed
) else (
    echo [  OK]  Root dependencies already installed
)

if not exist "%SERVER_DIR%\node_modules" (
    echo [INFO]  Installing server dependencies...
    pushd "%SERVER_DIR%"
    npm install --silent
    if errorlevel 1 ( echo [FAIL]  Server npm install failed & pause & exit /b 1 )
    popd
    echo [  OK]  Server dependencies installed
) else (
    echo [  OK]  Server dependencies already installed
)

if not exist "%CLIENT_DIR%\node_modules" (
    echo [INFO]  Installing client dependencies...
    pushd "%CLIENT_DIR%"
    npm install --silent
    if errorlevel 1 ( echo [FAIL]  Client npm install failed & pause & exit /b 1 )
    popd
    echo [  OK]  Client dependencies installed
) else (
    echo [  OK]  Client dependencies already installed
)

:: ── Seed database (optional) ──────────────────────────────────────────────────
if "%SEED%"=="1" (
    echo.
    echo [INFO]  ── Seeding Database ─────────────────────────────────────
    pushd "%SERVER_DIR%"
    npx ts-node src/scripts/seed.ts
    if errorlevel 1 ( echo [FAIL]  Seed script failed & pause & exit /b 1 )
    popd
    echo [  OK]  Database seeded
    echo          Admin email:    admin@samagama.dev
    echo          Admin password: admin123
)

:: ── Start Server in a new window ──────────────────────────────────────────────
echo.
echo [INFO]  ── Starting Services ─────────────────────────────────────
echo [INFO]  Starting API server on http://localhost:5001 ...
start "Samagama - API Server" cmd /k "set PATH=C:\Program Files\nodejs;%%PATH%% && cd /d "%SERVER_DIR%" && npm run dev"
timeout /t 5 /nobreak >nul

:: ── Start Client in a new window ─────────────────────────────────────────────
echo [INFO]  Starting Vite client on http://localhost:5173 ...
start "Samagama - Client" cmd /k "set PATH=C:\Program Files\nodejs;%%PATH%% && cd /d "%CLIENT_DIR%" && npm run dev -- --host 0.0.0.0"
timeout /t 5 /nobreak >nul

:: ── Done ──────────────────────────────────────────────────────────────────────
echo.
echo  ========================================================
echo    [OK]  Samagama is starting up!
echo  ========================================================
echo.
echo    Frontend  :  http://localhost:5173
echo    API       :  http://localhost:5001
echo    Health    :  http://localhost:5001/health
echo.
echo    Two windows have been opened:
echo      - "Samagama - API Server"   (port 5001)
echo      - "Samagama - Client"       (port 5173)
echo.
echo    Close those windows or press Ctrl+C in them to stop.
echo  ========================================================
echo.
pause
