@echo off
echo PrintMonitor Client Installation for xyz
echo ==========================================

set CLIENT_ID=xyz-sbucubvd
set API_ENDPOINT=http://192.168.1.105:3000/api
set API_KEY=pk_7er39mufacb

echo Installing PrintMonitor Service...
echo.
echo Client ID: %CLIENT_ID%
echo API Endpoint: %API_ENDPOINT%
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo Right-click this file and select "Run as administrator"
    pause
    exit /b 1
)

REM Check if PowerShell is available
powershell -Command "Write-Host 'PowerShell is available'" >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: PowerShell is required but not available!
    pause
    exit /b 1
)
cd /d "%~dp0"
echo Installing PrintMonitor Service...
echo.
powershell.exe -ExecutionPolicy Bypass -File "%~dp0install-service.ps1" -ClientId "%CLIENT_ID%" -ApiEndpoint "%API_ENDPOINT%" -ApiKey "%API_KEY%"

echo Installation complete!
echo.
echo Client ID: %CLIENT_ID%
echo Dashboard: http://192.168.1.105:5173/?client=xyz-sbucubvd
echo.
pause