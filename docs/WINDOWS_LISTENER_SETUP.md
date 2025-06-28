# Windows Print Listener Setup Guide

## Overview
This guide explains how to set up the Windows Print Listener service on client machines to capture print job events and send them to the central monitoring system.

## Prerequisites
- Windows 10/11 or Windows Server 2016+
- PowerShell 5.1 or later
- Network access to the central server
- Administrator privileges

## Installation Steps

### Step 1: Download Print Listener Script
Create `PrintListener.ps1`:

```powershell
# PrintListener.ps1 - Windows Print Job Monitor
param(
    [Parameter(Mandatory=$true)]
    [string]$ClientId,
    
    [Parameter(Mandatory=$true)]
    [string]$ApiEndpoint,
    
    [Parameter(Mandatory=$true)]
    [string]$ApiKey
)

# Configuration
$logPath = "C:\PrintMonitor\logs"
$configPath = "C:\PrintMonitor\config.json"

# Ensure directories exist
if (!(Test-Path $logPath)) {
    New-Item -ItemType Directory -Path $logPath -Force
}

# Save configuration
$config = @{
    ClientId = $ClientId
    ApiEndpoint = $ApiEndpoint
    ApiKey = $ApiKey
    LastUpdate = Get-Date
}
$config | ConvertTo-Json | Set-Content $configPath

# Logging function
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $Message" | Add-Content "$logPath\printmonitor.log"
}

# Function to send print job data
function Send-PrintJobData {
    param($JobData)
    
    try {
        $headers = @{
            "Authorization" = "Bearer $ApiKey"
            "Content-Type" = "application/json"
            "X-Client-ID" = $ClientId
        }
        
        $response = Invoke-RestMethod -Uri "$ApiEndpoint/print-jobs" -Method POST -Body ($JobData | ConvertTo-Json) -Headers $headers
        Write-Log "Successfully sent print job data: $($JobData.fileName)"
        return $true
    }
    catch {
        Write-Log "Error sending print job data: $($_.Exception.Message)"
        return $false
    }
}

# Function to get printer info
function Get-PrinterInfo {
    param([string]$PrinterName)
    
    try {
        $printer = Get-Printer -Name $PrinterName -ErrorAction SilentlyContinue
        if ($printer) {
            return @{
                Model = $printer.DriverName
                Location = $printer.Location
                Status = $printer.PrinterStatus
            }
        }
    }
    catch {
        Write-Log "Error getting printer info: $($_.Exception.Message)"
    }
    
    return @{
        Model = "Unknown"
        Location = "Unknown"
        Status = "Unknown"
    }
}

# Main monitoring loop
Write-Log "Starting Print Monitor for Client: $ClientId"

# Register for print job events
Register-WmiEvent -Query "SELECT * FROM Win32_PrintJob" -Action {
    $job = $Event.SourceEventArgs.NewEvent
    
    # Get additional printer information
    $printerInfo = Get-PrinterInfo -PrinterName $job.Name
    
    # Prepare print job data
    $printData = @{
        fileName = $job.Document
        user = $job.Owner
        department = $env:USERDOMAIN
        printer = $job.Name
        pages = if ($job.TotalPages) { $job.TotalPages } else { 1 }
        status = if ($job.Status -eq "OK" -or $job.Status -eq $null) { "success" } else { "failed" }
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
        fileSize = if ($job.Size) { "$([math]::Round($job.Size/1MB, 2)) MB" } else { "Unknown" }
        paperSize = "A4"  # Default, could be enhanced to detect actual size
        colorMode = "blackwhite"  # Default, could be enhanced
        printerModel = $printerInfo.Model
        printerLocation = $printerInfo.Location
    }
    
    # Send data to API
    $success = Send-PrintJobData -JobData $printData
    
    if ($success) {
        Write-Log "Print job captured: $($printData.fileName) by $($printData.user)"
    } else {
        Write-Log "Failed to send print job: $($printData.fileName)"
        # Could implement retry logic here
    }
}

# Keep the script running
Write-Log "Print Monitor is now active. Press Ctrl+C to stop."
try {
    while ($true) {
        Start-Sleep -Seconds 30
        # Periodic health check
        Write-Log "Print Monitor is running..."
    }
}
finally {
    Write-Log "Print Monitor stopped."
}
```

### Step 2: Create Windows Service
Create `InstallService.ps1`:

```powershell
# InstallService.ps1 - Install Print Monitor as Windows Service
param(
    [Parameter(Mandatory=$true)]
    [string]$ClientId,
    
    [Parameter(Mandatory=$true)]
    [string]$ApiEndpoint,
    
    [Parameter(Mandatory=$true)]
    [string]$ApiKey
)

# Service configuration
$serviceName = "PrintMonitorService"
$serviceDisplayName = "Print Monitor Service"
$serviceDescription = "Monitors print jobs and sends data to central server"
$scriptPath = "C:\PrintMonitor\PrintListener.ps1"
$serviceScript = "C:\PrintMonitor\ServiceWrapper.ps1"

# Create service directory
$serviceDir = "C:\PrintMonitor"
if (!(Test-Path $serviceDir)) {
    New-Item -ItemType Directory -Path $serviceDir -Force
}

# Copy main script
Copy-Item "PrintListener.ps1" -Destination $scriptPath -Force

# Create service wrapper script
$wrapperContent = @"
# ServiceWrapper.ps1
`$clientId = "$ClientId"
`$apiEndpoint = "$ApiEndpoint"
`$apiKey = "$ApiKey"

& "C:\PrintMonitor\PrintListener.ps1" -ClientId `$clientId -ApiEndpoint `$apiEndpoint -ApiKey `$apiKey
"@

$wrapperContent | Set-Content $serviceScript

# Install NSSM (Non-Sucking Service Manager) if not present
$nssmPath = "C:\PrintMonitor\nssm.exe"
if (!(Test-Path $nssmPath)) {
    Write-Host "Downloading NSSM..."
    # Download NSSM from official source
    # This is a simplified example - in production, include NSSM in your deployment package
}

# Remove existing service if it exists
$existingService = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
if ($existingService) {
    Stop-Service -Name $serviceName -Force
    & $nssmPath remove $serviceName confirm
}

# Install new service
& $nssmPath install $serviceName powershell.exe
& $nssmPath set $serviceName Arguments "-ExecutionPolicy Bypass -File `"$serviceScript`""
& $nssmPath set $serviceName DisplayName "$serviceDisplayName"
& $nssmPath set $serviceName Description "$serviceDescription"
& $nssmPath set $serviceName Start SERVICE_AUTO_START

# Start the service
Start-Service -Name $serviceName

Write-Host "Print Monitor Service installed and started successfully!"
Write-Host "Service Name: $serviceName"
Write-Host "Client ID: $ClientId"
Write-Host "API Endpoint: $ApiEndpoint"
```

### Step 3: Deployment Script
Create `Deploy.bat`:

```batch
@echo off
echo Print Monitor Deployment Script
echo ================================

set /p CLIENT_ID="Enter Client ID: "
set /p API_ENDPOINT="Enter API Endpoint (e.g., https://printmonitor.com/api): "
set /p API_KEY="Enter API Key: "

echo.
echo Installing Print Monitor Service...
echo Client ID: %CLIENT_ID%
echo API Endpoint: %API_ENDPOINT%
echo.

powershell.exe -ExecutionPolicy Bypass -File "InstallService.ps1" -ClientId "%CLIENT_ID%" -ApiEndpoint "%API_ENDPOINT%" -ApiKey "%API_KEY%"

echo.
echo Installation complete!
echo Check Windows Services to verify "Print Monitor Service" is running.
pause
```

## Configuration for Each Client

### Client 1: TechCorp Solutions
```batch
CLIENT_ID=techcorp-001
API_ENDPOINT=https://printmonitor.com/api
API_KEY=techcorp_api_key_here
```

### Client 2: Marketing Plus
```batch
CLIENT_ID=marketing-002
API_ENDPOINT=https://printmonitor.com/api
API_KEY=marketing_api_key_here
```

### Client 3: Finance Group
```batch
CLIENT_ID=finance-003
API_ENDPOINT=https://printmonitor.com/api
API_KEY=finance_api_key_here
```

### Client 4: Healthcare Inc
```batch
CLIENT_ID=healthcare-004
API_ENDPOINT=https://printmonitor.com/api
API_KEY=healthcare_api_key_here
```

### Client 5: Education Hub
```batch
CLIENT_ID=education-005
API_ENDPOINT=https://printmonitor.com/api
API_KEY=education_api_key_here
```

## Troubleshooting

### Check Service Status
```powershell
Get-Service -Name "PrintMonitorService"
```

### View Logs
```powershell
Get-Content "C:\PrintMonitor\logs\printmonitor.log" -Tail 50
```

### Test API Connection
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
    "Content-Type" = "application/json"
    "X-Client-ID" = "YOUR_CLIENT_ID"
}

$testData = @{
    fileName = "test.pdf"
    user = "test.user"
    department = "IT"
    printer = "Test-Printer"
    pages = 1
    status = "success"
    timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
}

Invoke-RestMethod -Uri "https://printmonitor.com/api/print-jobs" -Method POST -Body ($testData | ConvertTo-Json) -Headers $headers
```

## Security Considerations

1. **API Keys**: Store API keys securely, rotate regularly
2. **Network**: Use HTTPS for all communications
3. **Permissions**: Run service with minimal required permissions
4. **Logging**: Avoid logging sensitive information
5. **Updates**: Plan for regular updates and patches

## Maintenance

- Monitor service status daily
- Review logs weekly
- Update API keys quarterly
- Test connectivity monthly
- Backup configuration files