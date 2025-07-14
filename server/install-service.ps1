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

# Create print listener script
Write-Host "📋 Creating print listener script..."
$listenerScript = "$servicePath\print-listener.ps1"

# Copy the working print listener script
$workingScript = "$PSScriptRoot\working-print-listener.ps1"
if (Test-Path $workingScript) {
    Copy-Item $workingScript $listenerScript -Force
    Write-Host "✅ Copied working print listener script"
} else {
    Write-Host "❌ Working print listener script not found at: $workingScript"
    Write-Host "💡 Creating basic print listener..."
    
    # Create a basic working print listener
    $basicListener = @"
# PrintMonitor Windows Print Listener - PRODUCTION VERSION
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

Write-Log "=== PrintMonitor Print Listener Starting ==="
Write-Log "Client ID: `$ClientId"
Write-Log "API Endpoint: `$ApiEndpoint"
Write-Log "Computer: `$env:COMPUTERNAME"
Write-Log "User: `$env:USERNAME"

# Function to send print job
function Send-PrintJob {
    param([string]`$FileName, [string]`$SystemName, [string]`$PrinterName, [int]`$Pages, [string]`$FileSize = "Unknown", [string]`$UserName = `$env:USERNAME)
    
    try {
        `$body = @{
            clientId = `$ClientId; apiKey = `$ApiKey; fileName = `$FileName; systemName = `$SystemName
            printerName = `$PrinterName; pages = `$Pages; fileSize = `$FileSize; paperSize = "A4"
            colorMode = "blackwhite"; userName = `$UserName
        } | ConvertTo-Json
        
        `$headers = @{ 'Content-Type' = 'application/json'; 'User-Agent' = 'PrintMonitor-Windows-Listener/2.0' }
        
        Write-Log "📄 Sending: `$FileName (`$Pages pages) from `$SystemName to `$PrinterName"
        `$response = Invoke-RestMethod -Uri "`$ApiEndpoint/print-jobs" -Method POST -Body `$body -Headers `$headers -TimeoutSec 30
        
        if (`$response.success) {
            Write-Log "✅ Print job sent successfully! Job ID: `$(`$response.jobId)"
            return `$true
        } else {
            Write-Log "❌ Server rejected: `$(`$response.message)"
            return `$false
        }
    } catch {
        Write-Log "❌ Error sending: `$(`$_.Exception.Message)"
        return `$false
    }
}

# Test connection
try {
    Write-Log "🔗 Testing server connection..."
    `$health = Invoke-RestMethod -Uri "`$ApiEndpoint/health" -Method GET -TimeoutSec 10
    Write-Log "✅ Server connected: `$(`$health.status)"
} catch {
    Write-Log "❌ Server connection failed: `$(`$_.Exception.Message)"
    exit 1
}

# Send test job
Write-Log "🧪 Sending test print job..."
Send-PrintJob -FileName "TEST_CONNECTION_`$(Get-Date -Format 'yyyyMMdd_HHmmss').pdf" -SystemName `$env:COMPUTERNAME -PrinterName "Test Connection Printer" -Pages 1 -FileSize "0.1 KB"

# Main monitoring loop
Write-Log "🚀 Starting print job monitoring..."
`$loopCount = 0

while (`$true) {
    try {
        `$loopCount++
        Write-Log "🔄 Monitoring cycle #`$loopCount - `$(Get-Date -Format 'HH:mm:ss')"
        
        # Method 1: Windows Event Log
        try {
            `$events = Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-PrintService/Operational'; ID=307; StartTime=(Get-Date).AddMinutes(-2)} -MaxEvents 50 -ErrorAction SilentlyContinue
            if (`$events) {
                Write-Log "📋 Found `$(`$events.Count) recent print events"
                foreach (`$event in `$events) {
                    `$message = `$event.Message
                    if (`$message -match "Document\s+(.+?)\s+owned by\s+(.+?)\s+was printed on\s+(.+?)\s+through") {
                        `$fileName = `$matches[1].Trim() -replace '"', ''
                        `$userName = `$matches[2].Trim()
                        `$printerName = `$matches[3].Trim() -replace '"', ''
                        Write-Log "📄 Event: `$fileName by `$userName on `$printerName"
                        Send-PrintJob -FileName `$fileName -SystemName `$env:COMPUTERNAME -PrinterName `$printerName -Pages 1 -UserName `$userName
                    }
                }
            }
        } catch { Write-Log "⚠️ Event log access failed: `$(`$_.Exception.Message)" }
        
        # Method 2: PowerShell Get-PrintJob
        try {
            if (Get-Command Get-PrintJob -ErrorAction SilentlyContinue) {
                `$printJobs = Get-PrintJob -ErrorAction SilentlyContinue
                if (`$printJobs) {
                    Write-Log "📄 Found `$(`$printJobs.Count) active print jobs"
                    foreach (`$job in `$printJobs) {
                        `$fileName = if (`$job.DocumentName) { `$job.DocumentName } else { "Unknown Document" }
                        `$printerName = if (`$job.PrinterName) { `$job.PrinterName } else { "Unknown Printer" }
                        `$userName = if (`$job.UserName) { `$job.UserName } else { `$env:USERNAME }
                        `$pages = if (`$job.TotalPages -and `$job.TotalPages -gt 0) { `$job.TotalPages } else { 1 }
                        `$size = if (`$job.Size -and `$job.Size -gt 0) { "`$([math]::Round(`$job.Size / 1KB, 1)) KB" } else { "Unknown" }
                        Write-Log "📄 Active: `$fileName (`$pages pages) on `$printerName"
                        Send-PrintJob -FileName `$fileName -SystemName `$env:COMPUTERNAME -PrinterName `$printerName -Pages `$pages -FileSize `$size -UserName `$userName
                    }
                }
            }
        } catch { Write-Log "⚠️ Get-PrintJob failed: `$(`$_.Exception.Message)" }
        
        # Method 3: WMI Win32_PrintJob
        try {
            `$wmiJobs = Get-WmiObject -Class Win32_PrintJob -ErrorAction SilentlyContinue
            if (`$wmiJobs) {
                Write-Log "📄 Found `$(`$wmiJobs.Count) WMI print jobs"
                foreach (`$job in `$wmiJobs) {
                    `$fileName = if (`$job.Document) { `$job.Document } else { "Unknown Document" }
                    `$printerName = if (`$job.Name) { (`$job.Name -split ",")[0] } else { "Unknown Printer" }
                    `$userName = if (`$job.Owner) { `$job.Owner } else { `$env:USERNAME }
                    `$pages = if (`$job.TotalPages -and `$job.TotalPages -gt 0) { `$job.TotalPages } else { 1 }
                    `$size = if (`$job.Size -and `$job.Size -gt 0) { "`$([math]::Round(`$job.Size / 1KB, 1)) KB" } else { "Unknown" }
                    Write-Log "📄 WMI: `$fileName (`$pages pages) on `$printerName"
                    Send-PrintJob -FileName `$fileName -SystemName `$env:COMPUTERNAME -PrinterName `$printerName -Pages `$pages -FileSize `$size -UserName `$userName
                }
            }
        } catch { Write-Log "⚠️ WMI access failed: `$(`$_.Exception.Message)" }
        
        Write-Log "⏱️ Waiting 10 seconds before next check..."
        Start-Sleep -Seconds 10
    } catch {
        Write-Log "❌ Error in monitoring loop: `$(`$_.Exception.Message)"
        Start-Sleep -Seconds 30
    }
}
"@
    
    $basicListener | Out-File -FilePath $listenerScript -Encoding UTF8
    Write-Host "✅ Created basic print listener script"
}

# Create service wrapper script
Write-Host "🔧 Creating service wrapper..."
$wrapperLines = @(
    "# PrintMonitor Service Wrapper",
    "`$clientId = `"$ClientId`"",
    "`$apiEndpoint = `"$ApiEndpoint`"", 
    "`$apiKey = `"$ApiKey`"",
    "`$logPath = `"$logsPath\print-listener.log`"",
    "",
    "# Start the print listener",
    "& `"$listenerScript`" -ClientId `$clientId -ApiEndpoint `$apiEndpoint -ApiKey `$apiKey -LogPath `$logPath"
)

$wrapperContent = $wrapperLines -join "`r`n"
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
} | ConvertTo-Json -Depth 3

$config | Out-File -FilePath "$installPath\config.json" -Encoding UTF8

# Create Windows Scheduled Task (more reliable than service for this demo)
Write-Host "📅 Creating scheduled task for print monitoring..."

$taskName = "PrintMonitorListener"

# Remove existing task if it exists
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

# Create scheduled task action
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File `"$servicePath\service-wrapper.ps1`""

# Create scheduled task trigger (run at startup)
$trigger = New-ScheduledTaskTrigger -AtStartup

# Create scheduled task settings
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable

# Create scheduled task principal (run as current user)
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest

# Register the scheduled task
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description "PrintMonitor Print Listener"

# Start the task immediately
Write-Host "▶️ Starting print monitoring service..."
Start-ScheduledTask -TaskName $taskName

Write-Host ""
Write-Host "✅ PrintMonitor service installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Configuration:" -ForegroundColor Cyan
Write-Host "   Client ID: $ClientId"
Write-Host "   API Endpoint: $ApiEndpoint"
Write-Host "   Installation Path: $installPath"
Write-Host "   Logs Path: $logsPath"
Write-Host ""
Write-Host "🔍 Service Status:" -ForegroundColor Cyan
$task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($task) {
    Write-Host "   Task Name: $($task.TaskName)"
    Write-Host "   State: $($task.State)"
} else {
    Write-Host "   Task: Not found (there may have been an error)"
}
Write-Host ""
Write-Host "📝 To view logs:" -ForegroundColor Yellow
Write-Host "   Get-Content '$logsPath\print-listener.log' -Tail 20 -Wait"
Write-Host ""
Write-Host "🔧 To manage the service:" -ForegroundColor Yellow
Write-Host "   Start: Start-ScheduledTask -TaskName '$taskName'"
Write-Host "   Stop:  Stop-ScheduledTask -TaskName '$taskName'"
Write-Host "   Remove: Unregister-ScheduledTask -TaskName '$taskName' -Confirm:`$false"
Write-Host ""

# Test the connection again
Write-Host "🔗 Testing connection to PrintMonitor server..."
try {
    $response = Invoke-RestMethod -Uri "$ApiEndpoint/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Server connection successful!" -ForegroundColor Green
    Write-Host "   Server: $($response.server)" -ForegroundColor Cyan
    Write-Host "   Status: $($response.status)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🎉 Installation complete! Print jobs will now be monitored automatically." -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to connect to server: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "⚠️  Please check that the PrintMonitor server is running at: $ApiEndpoint" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")