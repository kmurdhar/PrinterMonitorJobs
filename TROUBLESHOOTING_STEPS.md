# PrintMonitor Troubleshooting - Log File Not Created

## 🚨 **Issue: Log file doesn't exist**
This means the print listener script isn't running or has permission issues.

## ✅ **Step 1: Check Service Status**

```powershell
# Check if scheduled task exists and is running
Get-ScheduledTask -TaskName "PrintMonitorListener"

# Check task history for errors
Get-ScheduledTask -TaskName "PrintMonitorListener" | Get-ScheduledTaskInfo
```

## ✅ **Step 2: Check Directory Structure**

```powershell
# Check if directories exist
Test-Path "C:\PrintMonitor"
Test-Path "C:\PrintMonitor\service"
Test-Path "C:\PrintMonitor\logs"

# List all files in PrintMonitor directory
Get-ChildItem "C:\PrintMonitor" -Recurse
```

## ✅ **Step 3: Check Script Files**

```powershell
# Check if print listener script exists
Test-Path "C:\PrintMonitor\service\print-listener.ps1"
Test-Path "C:\PrintMonitor\service\service-wrapper.ps1"

# Check script content (first few lines)
Get-Content "C:\PrintMonitor\service\print-listener.ps1" -Head 10
```

## ✅ **Step 4: Manual Test Run**

```powershell
# Try running the script manually to see errors
cd "C:\PrintMonitor\service"

# Run with your actual credentials
.\print-listener.ps1 -ClientId "harry-e03alvwb" -ApiEndpoint "http://192.168.1.102:3000/api" -ApiKey "your-api-key"
```

## ✅ **Step 5: Check PowerShell Execution Policy**

```powershell
# Check current execution policy
Get-ExecutionPolicy

# Set to allow script execution (if needed)
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
```

## ✅ **Step 6: Create Log Directory Manually**

```powershell
# Create log directory if it doesn't exist
New-Item -ItemType Directory -Path "C:\PrintMonitor\logs" -Force

# Test log file creation
"Test log entry" | Out-File -FilePath "C:\PrintMonitor\logs\test.log"
Get-Content "C:\PrintMonitor\logs\test.log"
```

## ✅ **Step 7: Reinstall Service**

If nothing works, reinstall:

```powershell
# Remove existing task
Unregister-ScheduledTask -TaskName "PrintMonitorListener" -Confirm:$false

# Remove directory
Remove-Item -Path "C:\PrintMonitor" -Recurse -Force

# Re-run Deploy.bat as Administrator
```

## 🔍 **Common Issues:**

1. **PowerShell Execution Policy** - Scripts blocked by Windows
2. **Permissions** - Not running as Administrator
3. **Missing Files** - Installation didn't complete properly
4. **Wrong Credentials** - API key or endpoint incorrect

## 📞 **Next Steps:**

Run the commands above and share the output so I can identify the exact issue.