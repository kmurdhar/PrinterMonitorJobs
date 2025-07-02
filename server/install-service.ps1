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

# Create installation directory
$installPath = "C:\PrintMonitor"
$servicePath = "$installPath\service"
$logsPath = "$installPath\logs"

Write-Host "📁 Creating installation directories..."
New-Item -ItemType Directory -Path $installPath -Force | Out-Null
New-Item -ItemType Directory -Path $servicePath -Force | Out-Null
New-Item -ItemType Directory -Path $logsPath -Force | Out-Null

# Copy print listener script
Write-Host "📋 Installing print listener script..."
$listenerScript = "$servicePath\print-listener.ps1"
Copy-Item -Path "windows-print-listener.ps1" -Destination $listenerScript -Force

# Create service wrapper script
$serviceWrapper = @"
# PrintMonitor Service Wrapper
`$clientId = "$ClientId"
`$apiEndpoint = "$ApiEndpoint"
`$apiKey = "$ApiKey"
`$logPath = "$logsPath\print-listener.log"

# Start the print listener
& "$listenerScript" -ClientId `$clientId -ApiEndpoint `$apiEndpoint -ApiKey `$apiKey -LogPath `$logPath
"@

$serviceWrapper | Out-File -FilePath "$servicePath\service-wrapper.ps1" -Encoding UTF8

# Create configuration file
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

# Create Windows Service
Write-Host "🔧 Creating Windows Service..."
$serviceName = "PrintMonitorListener"
$serviceDisplayName = "PrintMonitor Print Listener"
$serviceDescription = "Monitors print jobs and sends data to PrintMonitor server"

# Remove existing service if it exists
$existingService = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
if ($existingService) {
    Write-Host "🗑️  Removing existing service..."
    Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
    sc.exe delete $serviceName
    Start-Sleep -Seconds 2
}

# Create the service using NSSM (Non-Sucking Service Manager) alternative
# For simplicity, we'll create a scheduled task instead
Write-Host "📅 Creating scheduled task for print monitoring..."

$taskName = "PrintMonitorListener"

# Remove existing task if it exists
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

# Create scheduled task action
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File `"$servicePath\service-wrapper.ps1`""

# Create scheduled task trigger (run at startup and every 5 minutes)
$trigger1 = New-ScheduledTaskTrigger -AtStartup
$trigger2 = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration (New-TimeSpan -Days 365)

# Create scheduled task settings
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable

# Create scheduled task principal (run as SYSTEM)
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

# Register the scheduled task
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger @($trigger1, $trigger2) -Settings $settings -Principal $principal -Description $serviceDescription

# Start the task
Start-ScheduledTask -TaskName $taskName

Write-Host "✅ PrintMonitor service installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Configuration:" -ForegroundColor Cyan
Write-Host "   Client ID: $ClientId"
Write-Host "   API Endpoint: $ApiEndpoint"
Write-Host "   Installation Path: $installPath"
Write-Host "   Logs Path: $logsPath"
Write-Host ""
Write-Host "🔍 Service Status:" -ForegroundColor Cyan
$task = Get-ScheduledTask -TaskName $taskName
Write-Host "   Task Name: $($task.TaskName)"
Write-Host "   State: $($task.State)"
Write-Host ""
Write-Host "📝 To view logs:" -ForegroundColor Yellow
Write-Host "   Get-Content '$logsPath\print-listener.log' -Tail 20 -Wait"
Write-Host ""
Write-Host "🔧 To manage the service:" -ForegroundColor Yellow
Write-Host "   Start: Start-ScheduledTask -TaskName '$taskName'"
Write-Host "   Stop:  Stop-ScheduledTask -TaskName '$taskName'"
Write-Host "   Remove: Unregister-ScheduledTask -TaskName '$taskName' -Confirm:`$false"
Write-Host ""
Write-Host "🎉 Installation complete! Print jobs will now be monitored automatically." -ForegroundColor Green

# Test the connection
Write-Host "🔗 Testing connection to PrintMonitor server..."
try {
    $response = Invoke-RestMethod -Uri "$ApiEndpoint/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Server connection successful!" -ForegroundColor Green
    Write-Host "   Server: $($response.server)" -ForegroundColor Cyan
    Write-Host "   Status: $($response.status)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to connect to server: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "⚠️  Please check that the PrintMonitor server is running at: $ApiEndpoint" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")