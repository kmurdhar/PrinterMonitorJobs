# PrintMonitor Service Installer
# Run as Administrator

param(
    [Parameter(Mandatory=$true)]
    [string]$ClientId,
    
    [Parameter(Mandatory=$true)]
    [string]$ApiEndpoint,
    
    [Parameter(Mandatory=$true)]
    [string]$ApiKey
)

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "🖨️  PrintMonitor Service Installer" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "Client ID: $ClientId" -ForegroundColor Cyan
Write-Host "API Endpoint: $ApiEndpoint" -ForegroundColor Cyan
Write-Host ""

# Create installation directory
$installPath = "C:\PrintMonitor"
$servicePath = "$installPath\service"
$logsPath = "$installPath\logs"

Write-Host "📁 Creating installation directories..."
New-Item -ItemType Directory -Path $installPath -Force | Out-Null
New-Item -ItemType Directory -Path $servicePath -Force | Out-Null
New-Item -ItemType Directory -Path $logsPath -Force | Out-Null

# Create REAL print listener script (NO DEMO JOBS)
Write-Host "📋 Creating REAL print listener script (NO DEMO JOBS)..."
$listenerScript = "$servicePath\print-listener.ps1"

$realPrintListener = @"
# PrintMonitor Windows Print Listener - PRODUCTION ONLY (NO DEMO JOBS)
param(
    [Parameter(Mandatory=`$true)][string]`$ClientId,
    [Parameter(Mandatory=`$true)][string]`$ApiEndpoint,
    [Parameter(Mandatory=`$true)][string]`$ApiKey,
    [string]`$LogPath = "C:\PrintMonitor\logs\print-listener.log"
)

# Ensure log directory exists
`$logDir = Split-Path `$LogPath -Parent
if (!(Test-Path `$logDir)) { New-Item -ItemType Directory -Path `$logDir -Force | Out-Null }

# Logging function
function Write-Log {
    param([string]`$Message)
    `$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    `$logMessage = "[`$timestamp] `$Message"
    Write-Host `$logMessage -ForegroundColor Green
    try { Add-Content -Path `$LogPath -Value `$logMessage -ErrorAction SilentlyContinue } catch { }
}

Write-Log "=== PrintMonitor REAL Print Listener Starting ==="
Write-Log "Client ID: `$ClientId"
Write-Log "API Endpoint: `$ApiEndpoint"
Write-Log "Computer: `$env:COMPUTERNAME"
Write-Log "User: `$env:USERNAME"
Write-Log "🚫 NO DEMO JOBS - REAL PRINT MONITORING ONLY"

# Function to send print job to server
function Send-PrintJob {
    param(
        [string]`$FileName,
        [string]`$SystemName,
        [string]`$PrinterName,
        [int]`$Pages,
        [string]`$FileSize = "Unknown",
        [string]`$UserName = `$env:USERNAME,
        [string]`$Source = "Unknown"
    )
    
    try {
        `$body = @{
            clientId = `$ClientId
            apiKey = `$ApiKey
            fileName = `$FileName
            systemName = `$SystemName
            printerName = `$PrinterName
            pages = `$Pages
            fileSize = `$FileSize
            paperSize = "A4"
            colorMode = "blackwhite"
            userName = `$UserName
        } | ConvertTo-Json
        
        `$headers = @{
            'Content-Type' = 'application/json'
            'User-Agent' = 'PrintMonitor-Windows-Listener/3.0-REAL'
        }
        
        Write-Log "📄 REAL PRINT JOB DETECTED [`$Source]:"
        Write-Log "   Document: `$FileName"
        Write-Log "   Printer: `$PrinterName"
        Write-Log "   Pages: `$Pages"
        Write-Log "   User: `$UserName"
        Write-Log "   System: `$SystemName"
        
        `$response = Invoke-RestMethod -Uri "`$ApiEndpoint/print-jobs" -Method POST -Body `$body -Headers `$headers -TimeoutSec 30
        
        if (`$response.success) {
            Write-Log "✅ REAL print job sent successfully! Job ID: `$(`$response.jobId), Cost: `$(`$response.cost)"
            return `$true
        } else {
            Write-Log "❌ Server rejected print job: `$(`$response.message)"
            return `$false
        }
    } catch {
        Write-Log "❌ Error sending print job: `$(`$_.Exception.Message)"
        return `$false
    }
}

# Test server connection
try {
    Write-Log "🔗 Testing server connection..."
    `$health = Invoke-RestMethod -Uri "`$ApiEndpoint/health" -Method GET -TimeoutSec 10
    Write-Log "✅ Server connected: `$(`$health.status)"
} catch {
    Write-Log "❌ Server connection failed: `$(`$_.Exception.Message)"
    exit 1
}

# Send ONE test job only on startup
Write-Log "🧪 Sending ONE test connection job..."
Send-PrintJob -FileName "TEST_CONNECTION_`$(Get-Date -Format 'yyyyMMdd_HHmmss').pdf" -SystemName `$env:COMPUTERNAME -PrinterName "Connection Test" -Pages 1 -FileSize "0.1 KB" -Source "STARTUP_TEST"

Write-Log "🚀 Starting REAL print job monitoring (NO MORE DEMO JOBS)..."
Write-Log "💡 Monitoring Windows Print Spooler for ACTUAL print jobs only"

# Track processed jobs to avoid duplicates
`$processedJobs = @{}
`$loopCount = 0

while (`$true) {
    try {
        `$loopCount++
        Write-Log "🔄 Monitoring cycle #`$loopCount - `$(Get-Date -Format 'HH:mm:ss') - REAL JOBS ONLY"
        
        # Method 1: Monitor Windows Event Log for REAL print events
        try {
            `$events = Get-WinEvent -FilterHashtable @{
                LogName = 'Microsoft-Windows-PrintService/Operational'
                ID = 307  # Document printed successfully
                StartTime = (Get-Date).AddMinutes(-1)
            } -MaxEvents 20 -ErrorAction SilentlyContinue
            
            if (`$events) {
                Write-Log "📋 Found `$(`$events.Count) REAL print events in Windows Event Log"
                
                foreach (`$event in `$events) {
                    try {
                        `$message = `$event.Message
                        `$eventId = `$event.RecordId
                        
                        # Skip if already processed
                        if (`$processedJobs.ContainsKey(`$eventId)) { continue }
                        
                        Write-Log "📄 Processing event: `$message"
                        
                        # Parse Windows print event message
                        if (`$message -match "Document\s+(.+?)\s+owned by\s+(.+?)\s+was printed on\s+(.+?)\s+through") {
                            `$fileName = `$matches[1].Trim() -replace '"', '' -replace "'", ""
                            `$userName = `$matches[2].Trim()
                            `$printerName = `$matches[3].Trim() -replace '"', '' -replace "'", ""
                            
                            # Clean up printer name (remove server prefix if present)
                            if (`$printerName -match "\\\\(.+?)\\\\(.+)") {
                                `$printerName = `$matches[2]
                            }
                            
                            Write-Log "📄 REAL PRINT EVENT PARSED:"
                            Write-Log "   Document: `$fileName"
                            Write-Log "   User: `$userName"
                            Write-Log "   Printer: `$printerName"
                            
                            # Send real print job
                            `$sent = Send-PrintJob -FileName `$fileName -SystemName `$env:COMPUTERNAME -PrinterName `$printerName -Pages 1 -UserName `$userName -Source "WINDOWS_EVENT_LOG"
                            
                            if (`$sent) {
                                `$processedJobs[`$eventId] = `$true
                                Write-Log "✅ REAL print job successfully processed from Windows Event Log"
                            }
                        } else {
                            Write-Log "⚠️ Could not parse event message format: `$message"
                        }
                    } catch {
                        Write-Log "❌ Error processing event: `$(`$_.Exception.Message)"
                    }
                }
            } else {
                Write-Log "📋 No recent REAL print events found in Windows Event Log"
            }
        } catch {
            Write-Log "⚠️ Windows Event Log access failed: `$(`$_.Exception.Message)"
        }
        
        # Method 2: Monitor active print jobs using PowerShell cmdlets
        try {
            if (Get-Command Get-PrintJob -ErrorAction SilentlyContinue) {
                `$printJobs = Get-PrintJob -ErrorAction SilentlyContinue
                if (`$printJobs) {
                    Write-Log "📄 Found `$(`$printJobs.Count) active print jobs via PowerShell"
                    
                    foreach (`$job in `$printJobs) {
                        try {
                            `$jobId = "`$(`$job.Id)_`$(`$job.PrinterName)"
                            
                            # Skip if already processed
                            if (`$processedJobs.ContainsKey(`$jobId)) { continue }
                            
                            `$fileName = if (`$job.DocumentName) { `$job.DocumentName } else { "Unknown Document" }
                            `$printerName = if (`$job.PrinterName) { `$job.PrinterName } else { "Unknown Printer" }
                            `$userName = if (`$job.UserName) { `$job.UserName } else { `$env:USERNAME }
                            `$pages = if (`$job.TotalPages -and `$job.TotalPages -gt 0) { `$job.TotalPages } else { 1 }
                            `$size = if (`$job.Size -and `$job.Size -gt 0) { "`$([math]::Round(`$job.Size / 1KB, 1)) KB" } else { "Unknown" }
                            
                            Write-Log "📄 ACTIVE PRINT JOB FOUND:"
                            Write-Log "   Document: `$fileName"
                            Write-Log "   Printer: `$printerName"
                            Write-Log "   User: `$userName"
                            Write-Log "   Pages: `$pages"
                            Write-Log "   Size: `$size"
                            
                            `$sent = Send-PrintJob -FileName `$fileName -SystemName `$env:COMPUTERNAME -PrinterName `$printerName -Pages `$pages -FileSize `$size -UserName `$userName -Source "POWERSHELL_CMDLET"
                            
                            if (`$sent) {
                                `$processedJobs[`$jobId] = `$true
                                Write-Log "✅ REAL active print job successfully processed"
                            }
                        } catch {
                            Write-Log "❌ Error processing active job: `$(`$_.Exception.Message)"
                        }
                    }
                } else {
                    Write-Log "📋 No active print jobs found via PowerShell"
                }
            }
        } catch {
            Write-Log "⚠️ PowerShell Get-PrintJob failed: `$(`$_.Exception.Message)"
        }
        
        # Method 3: Monitor WMI print jobs
        try {
            `$wmiJobs = Get-WmiObject -Class Win32_PrintJob -ErrorAction SilentlyContinue
            if (`$wmiJobs) {
                Write-Log "📄 Found `$(`$wmiJobs.Count) WMI print jobs"
                
                foreach (`$job in `$wmiJobs) {
                    try {
                        `$jobId = "`$(`$job.JobId)_`$(`$job.Name)"
                        
                        # Skip if already processed
                        if (`$processedJobs.ContainsKey(`$jobId)) { continue }
                        
                        `$fileName = if (`$job.Document) { `$job.Document } else { "Unknown Document" }
                        `$printerName = if (`$job.Name) { (`$job.Name -split ",")[0] } else { "Unknown Printer" }
                        `$userName = if (`$job.Owner) { `$job.Owner } else { `$env:USERNAME }
                        `$pages = if (`$job.TotalPages -and `$job.TotalPages -gt 0) { `$job.TotalPages } else { 1 }
                        `$size = if (`$job.Size -and `$job.Size -gt 0) { "`$([math]::Round(`$job.Size / 1KB, 1)) KB" } else { "Unknown" }
                        
                        Write-Log "📄 WMI PRINT JOB FOUND:"
                        Write-Log "   Document: `$fileName"
                        Write-Log "   Printer: `$printerName"
                        Write-Log "   User: `$userName"
                        Write-Log "   Pages: `$pages"
                        Write-Log "   Size: `$size"
                        
                        `$sent = Send-PrintJob -FileName `$fileName -SystemName `$env:COMPUTERNAME -PrinterName `$printerName -Pages `$pages -FileSize `$size -UserName `$userName -Source "WMI"
                        
                        if (`$sent) {
                            `$processedJobs[`$jobId] = `$true
                            Write-Log "✅ REAL WMI print job successfully processed"
                        }
                    } catch {
                        Write-Log "❌ Error processing WMI job: `$(`$_.Exception.Message)"
                    }
                }
            } else {
                Write-Log "📋 No WMI print jobs found"
            }
        } catch {
            Write-Log "⚠️ WMI access failed: `$(`$_.Exception.Message)"
        }
        
        # Clean up old processed jobs (keep last 100)
        if (`$processedJobs.Count -gt 100) {
            `$processedJobs.Clear()
            Write-Log "🧹 Cleared processed jobs cache"
        }
        
        Write-Log "⏱️ Waiting 5 seconds before next REAL print check..."
        Start-Sleep -Seconds 5
        
    } catch {
        Write-Log "❌ Error in monitoring loop: `$(`$_.Exception.Message)"
        Start-Sleep -Seconds 10
    }
}
"@

$realPrintListener | Out-File -FilePath $listenerScript -Encoding UTF8

# Create service wrapper script
Write-Host "🔧 Creating service wrapper..."
$wrapperContent = @"
# PrintMonitor Service Wrapper - REAL JOBS ONLY
`$clientId = "$ClientId"
`$apiEndpoint = "$ApiEndpoint"
`$apiKey = "$ApiKey"
`$logPath = "$logsPath\print-listener.log"

# Start the REAL print listener (NO DEMO JOBS)
& "$listenerScript" -ClientId `$clientId -ApiEndpoint `$apiEndpoint -ApiKey `$apiKey -LogPath `$logPath
"@

$wrapperContent | Out-File -FilePath "$servicePath\service-wrapper.ps1" -Encoding UTF8

# Create configuration file
Write-Host "📝 Creating configuration file..."
$config = @{
    clientId = $ClientId
    apiEndpoint = $ApiEndpoint
    apiKey = $ApiKey
    installPath = $installPath
    servicePath = $servicePath
    logsPath = $logsPath
    installedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    computerName = $env:COMPUTERNAME
    userName = $env:USERNAME
    mode = "PRODUCTION_REAL_JOBS_ONLY"
} | ConvertTo-Json -Depth 3

$config | Out-File -FilePath "$installPath\config.json" -Encoding UTF8

# Remove existing task and recreate
Write-Host "📅 Recreating scheduled task for REAL print monitoring..."
$taskName = "PrintMonitorListener"

# Remove existing task
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

# Create new scheduled task action
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File `"$servicePath\service-wrapper.ps1`""

# Create scheduled task trigger (run at startup)
$trigger = New-ScheduledTaskTrigger -AtStartup

# Create scheduled task settings
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable

# Create scheduled task principal (run as current user)
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest

# Register the scheduled task
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description "PrintMonitor REAL Print Listener (NO DEMO JOBS)"

# Start the task immediately
Write-Host "▶️ Starting REAL print monitoring service..."
Start-ScheduledTask -TaskName $taskName

Write-Host ""
Write-Host "✅ PrintMonitor REAL print listener installed successfully!" -ForegroundColor Green
Write-Host "🚫 NO MORE DEMO JOBS - REAL PRINT MONITORING ONLY" -ForegroundColor Yellow
Write-Host ""
Write-Host "📊 Configuration:" -ForegroundColor Cyan
Write-Host "   Client ID: $ClientId"
Write-Host "   API Endpoint: $ApiEndpoint"
Write-Host "   Mode: PRODUCTION - REAL JOBS ONLY"
Write-Host "   Installation Path: $installPath"
Write-Host "   Logs Path: $logsPath"
Write-Host ""

# Test the connection
Write-Host "🔗 Testing connection to PrintMonitor server..."
try {
    $response = Invoke-RestMethod -Uri "$ApiEndpoint/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Server connection successful!" -ForegroundColor Green
    Write-Host "   Server: $($response.server)" -ForegroundColor Cyan
    Write-Host "   Status: $($response.status)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🎉 Installation complete! REAL print jobs will now be monitored." -ForegroundColor Green
    Write-Host "🚫 NO MORE DEMO/FAKE JOBS!" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Failed to connect to server: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📝 To view logs:" -ForegroundColor Yellow
Write-Host "   Get-Content '$logsPath\print-listener.log' -Tail 20 -Wait"
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")