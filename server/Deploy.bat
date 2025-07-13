@echo off
echo PrintMonitor Client Installation
echo ================================

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo Right-click this file and select "Run as administrator"
    pause
    exit /b 1
)

REM Configuration - These values are replaced during client onboarding
set CLIENT_ID=REPLACE_CLIENT_ID
set API_ENDPOINT=REPLACE_API_ENDPOINT
set API_KEY=REPLACE_API_KEY

echo Client ID: %CLIENT_ID%
echo API Endpoint: %API_ENDPOINT%
echo.

REM Check if PowerShell is available
powershell -Command "Write-Host 'PowerShell is available'" >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: PowerShell is required but not available!
    pause
    exit /b 1
)

REM Change to the script's directory
cd /d "%~dp0"

echo Installing PrintMonitor Service...
echo.

REM Run the PowerShell installer
powershell -ExecutionPolicy Bypass -File "%~dp0install-service.ps1" -ClientId "%CLIENT_ID%" -ApiEndpoint "%API_ENDPOINT%" -ApiKey "%API_KEY%"

if %errorLevel% equ 0 (
    echo.
    echo ========================================
    echo PrintMonitor installation completed!
    echo ========================================
    echo.
    echo Your computer will now automatically monitor print jobs
    echo and send data to the PrintMonitor server.
    echo.
    echo Dashboard URL: %API_ENDPOINT%/../?client=%CLIENT_ID%
    echo.
) else (
    echo.
    echo ========================================
    echo Installation failed!
    echo ========================================
    echo Please check the error messages above.
)

echo Press any key to exit...
pause >nul