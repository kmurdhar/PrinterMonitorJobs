# Fix PowerShell Execution Policy Issue

## 🚨 **Issue Identified:**
PowerShell execution policy is set to "Restricted" which blocks all scripts from running.

## ✅ **Solution:**

**Run these commands as Administrator:**

```powershell
# Set execution policy to allow scripts
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser

# Or for system-wide (requires Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine

# Verify the change
Get-ExecutionPolicy
```

## 🔧 **After Fixing Execution Policy:**

```powershell
# Start the scheduled task
Start-ScheduledTask -TaskName "PrintMonitorListener"

# Check task status
Get-ScheduledTask -TaskName "PrintMonitorListener"

# Wait 30 seconds, then check for log file
Start-Sleep -Seconds 30
Test-Path "C:\PrintMonitor\logs\print-listener.log"

# View logs
Get-Content 'C:\PrintMonitor\logs\print-listener.log' -Tail 20 -Wait
```

## 📋 **Expected Results:**
1. Log file will be created
2. You'll see connection test messages
3. Print monitoring will start working
4. Dashboard will show print jobs

## ⚠️ **If Still Not Working:**
Try running the script manually to see exact errors:

```powershell
cd "C:\PrintMonitor\service"
.\print-listener.ps1 -ClientId "harry-e03alvwb" -ApiEndpoint "http://192.168.1.102:3000/api" -ApiKey "your-api-key"
```