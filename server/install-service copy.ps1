# PrintMonitor Service Installer for asdasjdhkj
# Generated on 2025-07-06T07:05:14.421Z
# Client ID: asdasjdhkj-zfsl6x7t

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
    Write-Host "This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "PrintMonitor Service Installer for asdasjdhkj" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "Client ID: $ClientId" -ForegroundColor Cyan
Write-Host "API Endpoint: $ApiEndpoint" -ForegroundColor Cyan
Write-Host ""

# Create installation directory
$installPath = "C:\PrintMonitor"
$servicePath = "$installPath\service"
$logsPath = "$installPath\logs"

Write-Host "Creating installation directories..."
New-Item -ItemType Directory -Path $installPath -Force | Out-Null
New-Item -ItemType Directory -Path $servicePath -Force | Out-Null
New-Item -ItemType Directory -Path $logsPath -Force | Out-Null

# Create print listener script
Write-Host "📋 Creating print listener script..."
$listenerScript = "$servicePath\print-listener.ps1"

# Create the print listener content as separate lines to avoid here-string issues
$printListenerLines = @(
    "# PrintMonitor Windows Print Listener for asdasjdhkj",
    "# Generated on 2025-07-06T07:05:14.421Z",
    "",
    "param(",
    "    [Parameter(Mandatory=`$true)]",
    "    [string]`$ClientId,",
    "    ",
    "    [Parameter(Mandatory=`$true)]",
    "    [string]`$ApiEndpoint,",
    "    ",
    "    [Parameter(Mandatory=`$true)]",
    "    [string]`$ApiKey,",
    "    ",
    "    [string]`$LogPath = `"C:\PrintMonitor\logs\print-listener.log`"",
    ")",
    "",
    "# Ensure log directory exists",
    "`$logDir = Split-Path `$LogPath -Parent",
    "if (!(Test-Path `$logDir)) {",
    "    New-Item -ItemType Directory -Path `$logDir -Force",
    "}",
    "",
    "# Logging function",
    "function Write-Log {",
    "    param([string]`$Message)",
    "    `$timestamp = Get-Date -Format `"yyyy-MM-dd HH:mm:ss`"",
    "    `$logMessage = `"[`$timestamp] `$Message`"",
    "    Write-Host `$logMessage",
    "    Add-Content -Path `$LogPath -Value `$logMessage",
    "}",
    "",
    "Write-Log `"PrintMonitor Print Listener Starting for asdasjdhkj...`"",
    "Write-Log `"Client ID: `$ClientId`"",
    "Write-Log `"API Endpoint: `$ApiEndpoint`"",
    "Write-Log `"Computer: `$env:COMPUTERNAME`"",
    "Write-Log `"User: `$env:USERNAME`"",
    "",
    "# Function to send print job data to server",
    "function Send-PrintJob {",
    "    param(",
    "        [string]`$FileName,",
    "        [string]`$SystemName,",
    "        [string]`$PrinterName,",
    "        [int]`$Pages,",
    "        [string]`$FileSize,",
    "        [string]`$UserName",
    "    )",
    "    ",
    "    try {",
    "        `$body = @{",
    "            clientId = `$ClientId",
    "            apiKey = `$ApiKey",
    "            fileName = `$FileName",
    "            systemName = `$SystemName",
    "            printerName = `$PrinterName",
    "            pages = `$Pages",
    "            fileSize = `$FileSize",
    "            paperSize = `"A4`"",
    "            colorMode = `"blackwhite`"",
    "            userName = `$UserName",
    "        } | ConvertTo-Json",
    "        ",
    "        `$headers = @{",
    "            'Content-Type' = 'application/json'",
    "            'User-Agent' = 'PrintMonitor-Windows-Listener/1.0'",
    "        }",
    "        ",
    "        Write-Log `"📄 Sending print job: `$FileName (`$Pages pages) from `$SystemName to `$PrinterName`"",
    "        ",
    "        `$response = Invoke-RestMethod -Uri `"`$ApiEndpoint/print-jobs`" -Method POST -Body `$body -Headers `$headers -TimeoutSec 30",
    "        ",
    "        if (`$response.success) {",
    "            Write-Log `"Print job sent successfully. Job ID: `$(`$response.jobId), Cost: `$(`$response.cost)`"",
    "        } else {",
    "            Write-Log `"Failed to send print job: `$(`$response.message)`"",
    "        }",
    "    }",
    "    catch {",
    "        Write-Log `"Error sending print job: `$(`$_.Exception.Message)`"",
    "    }",
    "}",
    "",
    "# Test connection to server",
    "try {",
    "    Write-Log `"Testing connection to PrintMonitor server...`"",
    "    `$healthCheck = Invoke-RestMethod -Uri `"`$ApiEndpoint/health`" -Method GET -TimeoutSec 10",
    "    Write-Log `"Server connection successful. Server status: `$(`$healthCheck.status)`"",
    "} catch {",
    "    Write-Log `"Failed to connect to PrintMonitor server: `$(`$_.Exception.Message)`"",
    "    Write-Log `"Please check that the server is running and accessible at: `$ApiEndpoint`"",
    "    exit 1",
    "}",
    "",
    "# Monitor print jobs (simplified for demo)",
    "Write-Log `"Starting print job monitoring...`"",
    "Write-Log `"💡 This is a demo version. In production, this would monitor actual Windows print spooler events.`"",
    "",
    "# Simulate print job detection every 30 seconds for demo",
    "while (`$true) {",
    "    try {",
    "        # In production, this would monitor actual print spooler events",
    "        # For demo, we'll simulate occasional print jobs",
    "        ",
    "        if ((Get-Random -Minimum 1 -Maximum 100) -lt 10) { # 10% chance every loop",
    "            `$sampleFiles = @(",
    "                `"Document_`$(Get-Date -Format 'yyyyMMdd_HHmmss').pdf`",",
    "                `"Report_`$(Get-Random -Minimum 1000 -Maximum 9999).docx`",",
    "                `"Invoice_`$(Get-Random -Minimum 100 -Maximum 999).pdf`",",
    "                `"Presentation_`$(Get-Date -Format 'MMdd').pptx`"",
    "            )",
    "            ",
    "            `$samplePrinters = @(",
    "                `"HP LaserJet Pro M404n`",",
    "                `"Canon PIXMA Pro-200`",", 
    "                `"Brother HL-L2350DW`"",
    "            )",
    "            ",
    "            `$fileName = `$sampleFiles | Get-Random",
    "            `$printerName = `$samplePrinters | Get-Random",
    "            `$systemName = `$env:COMPUTERNAME",
    "            `$userName = `$env:USERNAME",
    "            `$pages = Get-Random -Minimum 1 -Maximum 20",
    "            `$fileSize = `"`$(Get-Random -Minimum 1 -Maximum 10).`$(Get-Random -Minimum 1 -Maximum 9) MB`"",
    "            ",
    "            Write-Log `"📄 Simulating print job for demo purposes`"",
    "            Send-PrintJob -FileName `$fileName -SystemName `$systemName -PrinterName `$printerName -Pages `$pages -FileSize `$fileSize -UserName `$userName",
    "        }",
    "        ",
    "        Start-Sleep -Seconds 30",
    "    }",
    "    catch {",
    "        Write-Log `"Error in monitoring loop: `$(`$_.Exception.Message)`"",
    "        Start-Sleep -Seconds 60",
    "    }",
    "}"
)

# Join the lines and write to file
$printListenerContent = $printListenerLines -join "`r`n"
$printListenerContent | Out-File -FilePath $listenerScript -Encoding UTF8

# Create service wrapper script
Write-Host "Creating service wrapper..."
$wrapperLines = @(
    "# PrintMonitor Service Wrapper for asdasjdhkj",
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
Write-Host "Creating configuration file..."
$config = @{
    clientId = $ClientId
    companyName = "asdasjdhkj"
    apiEndpoint = $ApiEndpoint
    apiKey = $ApiKey
    dashboardUrl = "http://192.168.1.102:5173/?client=asdasjdhkj-zfsl6x7t"
    installPath = $installPath
    servicePath = $servicePath
    logsPath = $logsPath
    installedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    computerName = $env:COMPUTERNAME
    userName = $env:USERNAME
} | ConvertTo-Json -Depth 3

$config | Out-File -FilePath "$installPath\config.json" -Encoding UTF8

# Create Windows Scheduled Task
Write-Host "Creating scheduled task for print monitoring..."

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
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description "PrintMonitor Print Listener for asdasjdhkj"

# Start the task immediately
Write-Host "Starting print monitoring service..."
Start-ScheduledTask -TaskName $taskName

Write-Host ""
Write-Host "PrintMonitor service installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "   Company: asdasjdhkj"
Write-Host "   Client ID: $ClientId"
Write-Host "   API Endpoint: $ApiEndpoint"
Write-Host "   Dashboard: http://192.168.1.102:5173/?client=asdasjdhkj-zfsl6x7t"
Write-Host "   Installation Path: $installPath"
Write-Host "   Logs Path: $logsPath"
Write-Host ""
Write-Host "Service Status:" -ForegroundColor Cyan
$task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($task) {
    Write-Host "   Task Name: $($task.TaskName)"
    Write-Host "   State: $($task.State)"
} else {
    Write-Host "   Task: Not found (there may have been an error)"
}
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Yellow
Write-Host "   Get-Content '$logsPath\print-listener.log' -Tail 20 -Wait"
Write-Host ""
Write-Host "To manage the service:" -ForegroundColor Yellow
Write-Host "   Start: Start-ScheduledTask -TaskName '$taskName'"
Write-Host "   Stop:  Stop-ScheduledTask -TaskName '$taskName'"
Write-Host "   Remove: Unregister-ScheduledTask -TaskName '$taskName' -Confirm:`$false"
Write-Host ""

# Test the connection again
Write-Host "Testing connection to PrintMonitor server..."
try {
    $response = Invoke-RestMethod -Uri "$ApiEndpoint/health" -Method GET -TimeoutSec 10
    Write-Host "Server connection successful!" -ForegroundColor Green
    Write-Host "   Server: $($response.server)" -ForegroundColor Cyan
    Write-Host "   Status: $($response.status)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Installation complete! Print jobs will now be monitored automatically." -ForegroundColor Green
    Write-Host "View your dashboard at: http://192.168.1.102:5173/?client=asdasjdhkj-zfsl6x7t" -ForegroundColor Cyan
} catch {
    Write-Host "Failed to connect to server: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check that the PrintMonitor server is running at: $ApiEndpoint" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
