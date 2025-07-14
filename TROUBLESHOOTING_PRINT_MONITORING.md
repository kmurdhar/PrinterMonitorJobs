# 🔧 PrintMonitor Troubleshooting Guide

## 🚨 **Current Issue: Print Jobs Not Being Tracked**

Your client installation is successful but print jobs aren't being captured. Here's how to fix it:

## ✅ **Step 1: Update the Print Listener Script**

**On the client machine (as Administrator):**

1. **Stop the current service:**
```powershell
Stop-ScheduledTask -TaskName "PrintMonitorListener"
```

2. **Replace the print listener script:**
```powershell
# Navigate to the PrintMonitor directory
cd C:\PrintMonitor\service

# Backup the old script
Copy-Item print-listener.ps1 print-listener-backup.ps1

# Download the new working script (or copy from server)
# Replace the content of print-listener.ps1 with the new working version
```

3. **Restart the service:**
```powershell
Start-ScheduledTask -TaskName "PrintMonitorListener"
```

## ✅ **Step 2: Verify Log File Creation**

**Check if logs are being created:**
```powershell
# Check if log directory exists
Test-Path "C:\PrintMonitor\logs"

# Check if log file exists
Test-Path "C:\PrintMonitor\logs\print-listener.log"

# View live logs
Get-Content 'C:\PrintMonitor\logs\print-listener.log' -Tail 20 -Wait
```

**Expected log output:**
```
[2025-01-XX XX:XX:XX] === PrintMonitor Print Listener Starting ===
[2025-01-XX XX:XX:XX] Client ID: harry-e03alvwb
[2025-01-XX XX:XX:XX] API Endpoint: http://192.168.1.102:3000/api
[2025-01-XX XX:XX:XX] Computer: CLIENT-PC-NAME
[2025-01-XX XX:XX:XX] ✅ Server connection successful!
[2025-01-XX XX:XX:XX] 🧪 Sending test print job...
[2025-01-XX XX:XX:XX] ✅ Test print job sent successfully!
[2025-01-XX XX:XX:XX] 🚀 Starting print job monitoring...
```

## ✅ **Step 3: Test Real Print Job Capture**

1. **Print a test document:**
   - Open Notepad
   - Type some text
   - Print to any printer (even if it fails)

2. **Check logs immediately:**
```powershell
Get-Content 'C:\PrintMonitor\logs\print-listener.log' -Tail 10
```

3. **Check dashboard:**
   - Go to: `http://192.168.1.102:5173/?client=harry-e03alvwb`
   - Look for new print jobs

## ✅ **Step 4: Manual Testing**

**Test the API connection manually:**
```powershell
# Test server health
Invoke-RestMethod -Uri "http://192.168.1.102:3000/api/health" -Method GET

# Send a manual test print job
$testJob = @{
    clientId = "harry-e03alvwb"
    apiKey = "your-api-key"
    fileName = "MANUAL_TEST.pdf"
    systemName = $env:COMPUTERNAME
    printerName = "Manual Test Printer"
    pages = 1
    fileSize = "1 KB"
    paperSize = "A4"
    colorMode = "blackwhite"
    userName = $env:USERNAME
} | ConvertTo-Json

$headers = @{
    'Content-Type' = 'application/json'
}

Invoke-RestMethod -Uri "http://192.168.1.102:3000/api/print-jobs" -Method POST -Body $testJob -Headers $headers
```

## ✅ **Step 5: Check Windows Print Spooler**

**Verify Windows Print Spooler is running:**
```powershell
# Check Print Spooler service
Get-Service -Name "Spooler"

# Start if stopped
Start-Service -Name "Spooler"

# Check for print jobs in spooler
Get-WmiObject -Class Win32_PrintJob
```

## ✅ **Step 6: Enable Print Service Logging**

**Enable detailed print logging:**
```powershell
# Enable print service operational log
wevtutil sl Microsoft-Windows-PrintService/Operational /e:true

# Check recent print events
Get-WinEvent -LogName "Microsoft-Windows-PrintService/Operational" -MaxEvents 10
```

## 🔍 **Common Issues & Solutions**

### **Issue 1: No Log File Created**
- **Cause:** PowerShell execution policy or permissions
- **Solution:** Run as Administrator and set execution policy:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

### **Issue 2: Server Connection Failed**
- **Cause:** Network/firewall blocking connection
- **Solution:** Test connectivity:
```powershell
Test-NetConnection -ComputerName "192.168.1.102" -Port 3000
```

### **Issue 3: Print Jobs Not Detected**
- **Cause:** Windows Print Spooler events not accessible
- **Solution:** Run PowerShell as Administrator

### **Issue 4: Wrong Printer Names**
- **Cause:** WMI returning internal printer IDs
- **Solution:** The new script uses multiple methods to get correct names

## 📊 **Verification Checklist**

- [ ] Server running at `http://192.168.1.102:3000`
- [ ] Client service running: `Get-ScheduledTask -TaskName "PrintMonitorListener"`
- [ ] Log file exists: `C:\PrintMonitor\logs\print-listener.log`
- [ ] Log file has recent entries (last 5 minutes)
- [ ] Test print job appears in dashboard
- [ ] Real print job captured when printing document

## 🆘 **If Still Not Working**

1. **Completely reinstall:**
```powershell
# Remove old installation
Unregister-ScheduledTask -TaskName "PrintMonitorListener" -Confirm:$false
Remove-Item -Path "C:\PrintMonitor" -Recurse -Force

# Re-run Deploy.bat as Administrator
```

2. **Check server logs:**
   - Look at server console output for incoming requests
   - Verify API endpoint is receiving data

3. **Use debug endpoint:**
   - Check: `http://192.168.1.102:3000/api/debug/client/harry-e03alvwb`
   - This shows all data for your client

## 📞 **Support Information**

**Your Configuration:**
- Client ID: `harry-e03alvwb`
- Server: `http://192.168.1.102:3000`
- Dashboard: `http://192.168.1.102:5173/?client=harry-e03alvwb`
- API Endpoint: `http://192.168.1.102:3000/api`

**Key Files:**
- Service Script: `C:\PrintMonitor\service\print-listener.ps1`
- Log File: `C:\PrintMonitor\logs\print-listener.log`
- Config File: `C:\PrintMonitor\config.json`