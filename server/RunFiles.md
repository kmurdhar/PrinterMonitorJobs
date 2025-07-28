#========install-service.ps1=================
# PrintMonitor Windows Print Listener - MESSAGE PARSING VERSION - FIXED
param(
    [Parameter(Mandatory=$true)]
    [string]$ClientId,
    
    [Parameter(Mandatory=$true)]
    [string]$ApiEndpoint,
    
    [Parameter(Mandatory=$true)]
    [string]$ApiKey,
    
    [string]$LogPath = "C:\PrintMonitor\logs\print-listener.log"
)

# Ensure log directory exists
$logDir = Split-Path $LogPath -Parent
if (!(Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force
}

# Enhanced logging function
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    switch ($Level) {
        "ERROR" { Write-Host $logMessage -ForegroundColor Red }
        "WARN"  { Write-Host $logMessage -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $logMessage -ForegroundColor Green }
        "PRINT"   { Write-Host $logMessage -ForegroundColor Cyan }
        "DEBUG"   { Write-Host $logMessage -ForegroundColor Magenta }
        default { Write-Host $logMessage -ForegroundColor White }
    }
    
    Add-Content -Path $LogPath -Value $logMessage
}

Write-Log "=== PrintMonitor MESSAGE PARSING VERSION Starting ===" "SUCCESS"
Write-Log "Client ID: $ClientId"
Write-Log "API Endpoint: $ApiEndpoint"
Write-Log "Computer: $env:COMPUTERNAME"

# Global tracking to prevent duplicates - using event time + message hash
$processedEvents = @{}

# Function to send print job to server
function Send-PrintJob {
    param(
        [string]$DocumentName,
        [string]$PrinterName,
        [int]$Pages,
        [string]$UserName,
        [string]$JobId,
        [string]$FileSize = "Unknown"
    )
    
    try {
        Write-Log "=== SENDING PRINT JOB ===" "PRINT"
        Write-Log "Document: $DocumentName" "PRINT"
        Write-Log "Printer: $PrinterName" "PRINT"
        Write-Log "Pages: $Pages" "PRINT"
        Write-Log "User: $UserName" "PRINT"
        Write-Log "JobID: $JobId" "PRINT"
        Write-Log "Size: $FileSize" "PRINT"
        
        $body = @{
            clientId = $ClientId
            apiKey = $ApiKey
            fileName = $DocumentName
            systemName = $env:COMPUTERNAME
            printerName = $PrinterName
            pages = $Pages
            fileSize = $FileSize
            paperSize = "A4"
            colorMode = "blackwhite"
            userName = $UserName
            jobId = $JobId
        } | ConvertTo-Json
        
        $headers = @{
            'Content-Type' = 'application/json'
            'User-Agent' = 'PrintMonitor-MessageParser/6.0'
        }
        
        $response = Invoke-RestMethod -Uri "$ApiEndpoint/print-jobs" -Method POST -Body $body -Headers $headers -TimeoutSec 30
        
        if ($response.success) {
            Write-Log "SUCCESS! Server Job ID: $($response.jobId), Cost: $($response.cost)" "SUCCESS"
            return $true
        } else {
            Write-Log "Server rejected job: $($response.message)" "ERROR"
            return $false
        }
    }
    catch {
        Write-Log "Error sending job: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Test server connection
Write-Log "Testing server connection..." "INFO"
try {
    $healthCheck = Invoke-RestMethod -Uri "$ApiEndpoint/health" -Method GET -TimeoutSec 10
    Write-Log "Server connection OK: $($healthCheck.status)" "SUCCESS"
} catch {
    Write-Log "Cannot connect to server: $($_.Exception.Message)" "ERROR"
    exit 1
}

# Function to parse Event ID 307 message and extract all details
function Parse-PrintEventMessage {
    param([string]$Message)
    
    try {
        Write-Log "Parsing message: $Message" "DEBUG"
        
        # Initialize default values
        $jobId = "Unknown"
        $documentName = "Print Document"
        $userName = "Unknown"
        $printerName = "Unknown Printer"
        $pages = 1
        $fileSize = "Unknown"
        
        # Parse the message format:
        # "Document 40, Print Document owned by Digit-IT on \\DESKTOP-RDRNDRQ was printed on HP LaserJet Pro MFP M225-M226 PCL 6 through port HPLaserJetProMFPM226dn. Size in bytes: 231072. Pages printed: 1. No user action is required."
        
        # Extract Document ID (Job ID)
        if ($Message -match 'Document (\d+),') {
            $jobId = $matches[1]
            Write-Log "Extracted Job ID: $jobId" "DEBUG"
        }
        
        # Extract document name (between comma and "owned by")
        if ($Message -match 'Document \d+,\s*(.+?)\s+owned by') {
            $documentName = $matches[1].Trim()
            Write-Log "Extracted Document Name: $documentName" "DEBUG"
        }
        
        # Extract username (between "owned by" and "on")
        if ($Message -match 'owned by\s+(.+?)\s+on') {
            $userName = $matches[1].Trim()
            Write-Log "Extracted User Name: $userName" "DEBUG"
        }
        
        # Extract printer name (between "printed on" and "through port")
        if ($Message -match 'printed on\s+(.+?)\s+through port') {
            $printerName = $matches[1].Trim()
            Write-Log "Extracted Printer Name: $printerName" "DEBUG"
        }
        
        # Extract file size (between "Size in bytes:" and ".")
        if ($Message -match 'Size in bytes:\s*(\d+)') {
            $sizeInBytes = [int]$matches[1]
            $sizeInMB = [math]::Round($sizeInBytes / 1MB, 2)
            $fileSize = "$sizeInMB MB"
            Write-Log "Extracted File Size: $fileSize ($sizeInBytes bytes)" "DEBUG"
        }
        
        # Extract pages (between "Pages printed:" and ".")
        if ($Message -match 'Pages printed:\s*(\d+)') {
            $pages = [int]$matches[1]
            Write-Log "Extracted Pages: $pages" "DEBUG"
        }
        
        return @{
            JobId = $jobId
            DocumentName = $documentName
            UserName = $userName
            PrinterName = $printerName
            Pages = $pages
            FileSize = $fileSize
            Success = $true
        }
        
    } catch {
        Write-Log "Error parsing message: $($_.Exception.Message)" "ERROR"
        return @{ Success = $false }
    }
}

# FIXED: Create unique key for event deduplication
function Get-EventKey {
    param(
        [DateTime]$EventTime,
        [string]$Message
    )
    
    try {
        # Handle null or empty message
        if ([string]::IsNullOrEmpty($Message)) {
            Write-Log "Warning: Message is null or empty, using default" "WARN"
            $Message = "EmptyMessage"
        }
        
        # Create hash of message content to detect identical events
        $messageBytes = [System.Text.Encoding]::UTF8.GetBytes($Message)
        $memoryStream = [System.IO.MemoryStream]::new($messageBytes)
        $messageHash = (Get-FileHash -Algorithm MD5 -InputStream $memoryStream).Hash.Substring(0, 8)
        $memoryStream.Dispose()
        
        # Combine event time (to minute precision) with message hash
        $timeKey = $EventTime.ToString("yyyy-MM-dd HH:mm")
        $eventKey = "$timeKey|$messageHash"
        
        Write-Log "Generated event key: $eventKey" "DEBUG"
        return $eventKey
        
    } catch {
        Write-Log "Error generating event key: $($_.Exception.Message)" "ERROR"
        # Fallback to time-based key only
        $fallbackKey = $EventTime.ToString("yyyy-MM-dd HH:mm:ss.fff")
        Write-Log "Using fallback event key: $fallbackKey" "WARN"
        return $fallbackKey
    }
}

# FIXED: Main function to process print completion events
function Process-PrintCompletion {
    param($Event)
    
    Write-Log "=== PROCESSING PRINT COMPLETION EVENT ===" "INFO"
    Write-Log "Event ID: $($Event.Id), Time: $($Event.TimeCreated)" "INFO"
    
    # Check if event has a valid message
    if ([string]::IsNullOrEmpty($Event.Message)) {
        Write-Log "Warning: Event has no message content, skipping" "WARN"
        return
    }
    
    Write-Log "Event message preview: $($Event.Message.Substring(0, [Math]::Min(100, $Event.Message.Length)))..." "DEBUG"
    
    # Create unique event key to prevent processing the same event multiple times
    try {
        $eventKey = Get-EventKey -EventTime $Event.TimeCreated -Message $Event.Message
    } catch {
        Write-Log "Failed to generate event key: $($_.Exception.Message)" "ERROR"
        return
    }
    
    # Check if we already processed this exact event
    if ($processedEvents.ContainsKey($eventKey)) {
        Write-Log "DUPLICATE EVENT DETECTED - Already processed this exact event: $eventKey" "WARN"
        return
    }
    
    # Parse the event message to extract job details
    $jobDetails = Parse-PrintEventMessage -Message $Event.Message
    
    if (-not $jobDetails.Success) {
        Write-Log "Failed to parse event message, skipping" "ERROR"
        return
    }
    
    Write-Log "Parsed Job Details - ID: $($jobDetails.JobId), Doc: '$($jobDetails.DocumentName)', User: '$($jobDetails.UserName)', Printer: '$($jobDetails.PrinterName)', Pages: $($jobDetails.Pages)" "SUCCESS"
    
    # Send the job to server
    $success = Send-PrintJob -DocumentName $jobDetails.DocumentName -PrinterName $jobDetails.PrinterName -Pages $jobDetails.Pages -UserName $jobDetails.UserName -JobId $jobDetails.JobId -FileSize $jobDetails.FileSize
    
    if ($success) {
        # Mark this event as processed
        $processedEvents[$eventKey] = @{
            JobId = $jobDetails.JobId
            Time = Get-Date
            DocumentName = $jobDetails.DocumentName
            EventTime = $Event.TimeCreated
        }
        Write-Log "Event processed successfully and marked as complete" "SUCCESS"
    }
    
    Write-Log "=== END PROCESSING ===" "INFO"
}

# Cleanup old processed events periodically
function Cleanup-ProcessedEvents {
    $twoHoursAgo = (Get-Date).AddHours(-2)
    $keysToRemove = @()
    
    foreach ($key in $processedEvents.Keys) {
        if ($processedEvents[$key].Time -lt $twoHoursAgo) {
            $keysToRemove += $key
        }
    }
    
    foreach ($key in $keysToRemove) {
        $processedEvents.Remove($key)
    }
    
    if ($keysToRemove.Count -gt 0) {
        Write-Log "Cleaned up $($keysToRemove.Count) old event records" "INFO"
    }
}

# FIXED MAIN MONITORING LOOP - ONLY Event ID 307
Write-Log "Starting Print Job Monitoring - MESSAGE PARSING MODE" "SUCCESS"
Write-Log "Monitoring ONLY Event ID 307 (Print Job Completed)" "INFO"
Write-Log "Parsing event messages directly - NO duplicates guaranteed!" "INFO"

$loopCount = 0
$totalJobsProcessed = 0
$monitoringStart = Get-Date

try {
    while ($true) {
        try {
            # Get only completion events from the last 10 seconds
            $startTime = (Get-Date).AddSeconds(-10)
            
            # CRITICAL: ONLY monitor Event ID 307 (print job completed) - NOT 800!
            $events = Get-WinEvent -FilterHashtable @{
                LogName = "Microsoft-Windows-PrintService/Operational"
                Id = 307  # ONLY completion events
                StartTime = $startTime
            } -ErrorAction SilentlyContinue
            
            if ($events) {
                Write-Log "Found $($events.Count) print completion event(s) in last 10 seconds" "INFO"
                
                # Process each completion event (deduplication happens inside Process-PrintCompletion)
                foreach ($event in $events | Sort-Object TimeCreated) {
                    Process-PrintCompletion -Event $event
                    $totalJobsProcessed++
                }
            }
            
            # Heartbeat every 2 minutes
            $loopCount++
            if ($loopCount % 60 -eq 0) {
                $uptime = (Get-Date) - $monitoringStart
                Write-Log "HEARTBEAT - Uptime: $($uptime.ToString('hh\:mm\:ss')), Jobs Processed: $totalJobsProcessed, Events in Memory: $($processedEvents.Count)" "INFO"
                
                # Check printer status during heartbeat
                try {
                    $defaultPrinter = Get-WmiObject -Query "SELECT * FROM Win32_Printer WHERE Default = TRUE" -ErrorAction SilentlyContinue
                    if ($defaultPrinter) {
                        Write-Log "Default Printer: $($defaultPrinter.Name) - Status: $($defaultPrinter.PrinterStatus)" "INFO"
                    } else {
                        Write-Log "WARNING: No default printer found!" "WARN"
                    }
                } catch {
                    Write-Log "Could not check printer status" "WARN"
                }
            }
            
            # Cleanup every 30 minutes
            if ($loopCount % 900 -eq 0) {
                Cleanup-ProcessedEvents
            }
            
            Start-Sleep -Seconds 2
            
        } catch {
            Write-Log "Error in monitoring loop: $($_.Exception.Message)" "ERROR"
            Start-Sleep -Seconds 5
        }
    }
} catch {
    Write-Log "Critical error in monitoring loop: $($_.Exception.Message)" "ERROR"
    exit 1
}

#========END install-service.ps1=================
#========Deploy.bat=================
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

#=====End of Deploy.bat======================

#==============client_config.json================
{
  "clientId": "xyz-sbucubvd",
  "companyName": "xyz",
  "apiEndpoint": "http://192.168.1.105:3000/api",
  "platforms": [
    "windows"
  ],
  "printerCount": 3,
  "estimatedUsers": 25,
  "subscriptionPlan": "basic",
  "dashboardUrl": "http://192.168.1.105:5173/?client=xyz-sbucubvd",
  "createdAt": "2025-07-27T13:23:28.449Z"
}
#==============End client_config.json================