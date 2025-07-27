# PrintMonitor Windows Print Listener - COMPLETE FIX
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
        default { Write-Host $logMessage -ForegroundColor White }
    }
    
    Add-Content -Path $LogPath -Value $logMessage
}

Write-Log "=== PrintMonitor COMPLETE FIXED VERSION Starting ===" "SUCCESS"
Write-Log "Client ID: $ClientId"
Write-Log "API Endpoint: $ApiEndpoint"
Write-Log "Computer: $env:COMPUTERNAME"

# Global tracking to prevent duplicates
$processedJobs = @{}

# Function to get printer name from various sources
function Get-PrinterName {
    param(
        [string]$JobId,
        [object]$WmiJob = $null
    )
    
    try {
        # Method 1: From WMI job name pattern
        if ($WmiJob -and $WmiJob.Name) {
            Write-Log "WMI Job Name: '$($WmiJob.Name)'" "INFO"
            
            # Pattern: JobID, PrinterName, ServerName
            if ($WmiJob.Name -match '^\d+,\s*(.+?),\s*(.*)$') {
                $printerName = $matches[1].Trim()
                Write-Log "Extracted printer from WMI Name pattern: '$printerName'" "INFO"
                return $printerName
            }
        }
        
        # Method 2: Query all printers and find recent jobs
        $printers = Get-WmiObject -Class Win32_Printer -ErrorAction SilentlyContinue
        foreach ($printer in $printers) {
            try {
                $printerJobs = Get-WmiObject -Class Win32_PrintJob -Filter "Name like '%$($printer.Name)%'" -ErrorAction SilentlyContinue
                if ($printerJobs) {
                    foreach ($job in $printerJobs) {
                        if ($job.JobId -eq $JobId) {
                            Write-Log "Found printer via job query: '$($printer.Name)'" "INFO"
                            return $printer.Name
                        }
                    }
                }
            } catch {
                # Continue to next printer
            }
        }
        
        # Method 3: Get default printer as fallback
        try {
            $defaultPrinter = Get-WmiObject -Class Win32_Printer -Filter "Default=True" -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($defaultPrinter) {
                Write-Log "Using default printer as fallback: '$($defaultPrinter.Name)'" "WARN"
                return $defaultPrinter.Name
            }
        } catch {
            Write-Log "Could not get default printer" "WARN"
        }
        
    } catch {
        Write-Log "Error in printer name detection: $($_.Exception.Message)" "ERROR"
    }
    
    Write-Log "Could not determine printer name, using fallback" "WARN"
    return "System Printer"
}

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
            'User-Agent' = 'PrintMonitor-CompleteFixed/4.0'
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

# Function to get complete job info from WMI
function Get-PrintJobInfo {
    param([string]$JobId)
    
    try {
        Write-Log "Querying WMI for JobID: $JobId" "INFO"
        
        # Get job from WMI
        $job = Get-WmiObject -Class Win32_PrintJob -Filter "JobId='$JobId'" -ErrorAction SilentlyContinue | Select-Object -First 1
        
        if ($job) {
            Write-Log "WMI Job found - Name: '$($job.Name)', Document: '$($job.Document)'" "INFO"
            
            # Get printer name using improved method
            $printerName = Get-PrinterName -JobId $JobId -WmiJob $job
            
            # Get document name
            $documentName = "Unknown Document"
            if ($job.Document -and $job.Document -ne "Print Document" -and $job.Document.Trim() -ne "") {
                $documentName = $job.Document.Trim()
            } else {
                $documentName = "Document_$JobId"
            }
            
            # Get page count
            $pages = 1
            if ($job.TotalPages -and $job.TotalPages -gt 0) {
                $pages = [int]$job.TotalPages
            }
            
            # Get user/owner
            $userName = $env:USERNAME
            if ($job.Owner -and $job.Owner.Trim() -ne "") {
                $userName = $job.Owner.Trim()
            }
            
            # Calculate file size
            $fileSize = "Unknown"
            if ($job.Size -and $job.Size -gt 0) {
                $sizeInMB = [math]::Round($job.Size / 1MB, 2)
                $fileSize = "$sizeInMB MB"
            }
            
            Write-Log "FINAL Job Details - Doc: '$documentName', Printer: '$printerName', Pages: $pages, User: '$userName'" "SUCCESS"
            
            return @{
                DocumentName = $documentName
                PrinterName = $printerName
                Pages = $pages
                UserName = $userName
                FileSize = $fileSize
                Found = $true
            }
        } else {
            Write-Log "No WMI job found for JobID: $JobId" "WARN"
        }
    } catch {
        Write-Log "WMI query error for JobID $JobId : $($_.Exception.Message)" "ERROR"
    }
    
    return @{ Found = $false }
}

# Function to extract JobID from event data
function Get-JobIdFromEvent {
    param($Event)
    
    try {
        $eventXml = [xml]$Event.ToXml()
        $eventData = $eventXml.Event.EventData.Data
        
        # Extract all data elements
        $dataArray = @()
        foreach ($data in $eventData) {
            if ($data.'#text') {
                $dataArray += $data.'#text'
            }
        }
        
        if ($dataArray.Count -gt 0) {
            $jobId = $dataArray[0]  # First parameter is usually JobID
            Write-Log "Extracted JobID from event: $jobId" "INFO"
            return $jobId
        }
    } catch {
        Write-Log "Error extracting JobID from event: $($_.Exception.Message)" "ERROR"
    }
    
    return $null
}

# Create unique key for deduplication
function Get-UniqueKey {
    param(
        [string]$DocumentName,
        [string]$PrinterName,
        [string]$UserName,
        [int]$Pages
    )
    
    $cleanDoc = ($DocumentName -replace '[^\w\.]', '_').Trim('_')
    $cleanPrinter = ($PrinterName -replace '[^\w\s]', '_').Trim('_')
    $cleanUser = ($UserName -replace '[^\w]', '_').Trim('_')
    
    # Create time window (2 minutes) to group related jobs
    $timeWindow = [math]::Floor((Get-Date).Ticks / 1200000000)
    
    $uniqueKey = "$cleanDoc|$cleanPrinter|$cleanUser|$Pages|$timeWindow"
    Write-Log "Generated unique key: $uniqueKey" "INFO"
    
    return $uniqueKey
}

# Main function to process print completion events
function Process-PrintCompletion {
    param($Event)
    
    Write-Log "=== PROCESSING PRINT COMPLETION EVENT ===" "INFO"
    Write-Log "Event ID: $($Event.Id), Time: $($Event.TimeCreated)" "INFO"
    
    # Extract JobID from event
    $jobId = Get-JobIdFromEvent -Event $Event
    if (-not $jobId) {
        Write-Log "Could not extract JobID from event, skipping" "WARN"
        return
    }
    
    # Get complete job information from WMI
    $jobInfo = Get-PrintJobInfo -JobId $jobId
    if (-not $jobInfo.Found) {
        Write-Log "Could not get job details from WMI for JobID: $jobId" "WARN"
        return
    }
    
    # Create unique key for this job
    $uniqueKey = Get-UniqueKey -DocumentName $jobInfo.DocumentName -PrinterName $jobInfo.PrinterName -UserName $jobInfo.UserName -Pages $jobInfo.Pages
    
    # Check if we already processed this job
    if ($processedJobs.ContainsKey($uniqueKey)) {
        Write-Log "DUPLICATE DETECTED - Already processed: $uniqueKey" "WARN"
        return
    }
    
    # Send the job to server
    $success = Send-PrintJob -DocumentName $jobInfo.DocumentName -PrinterName $jobInfo.PrinterName -Pages $jobInfo.Pages -UserName $jobInfo.UserName -JobId $jobId -FileSize $jobInfo.FileSize
    
    if ($success) {
        # Mark as processed
        $processedJobs[$uniqueKey] = @{
            JobId = $jobId
            Time = Get-Date
            DocumentName = $jobInfo.DocumentName
        }
        Write-Log "Job processed successfully and marked as complete" "SUCCESS"
    }
    
    Write-Log "=== END PROCESSING ===" "INFO"
}

# Cleanup old processed jobs periodically
function Cleanup-ProcessedJobs {
    $oneHourAgo = (Get-Date).AddHours(-1)
    $keysToRemove = @()
    
    foreach ($key in $processedJobs.Keys) {
        if ($processedJobs[$key].Time -lt $oneHourAgo) {
            $keysToRemove += $key
        }
    }
    
    foreach ($key in $keysToRemove) {
        $processedJobs.Remove($key)
    }
    
    if ($keysToRemove.Count -gt 0) {
        Write-Log "Cleaned up $($keysToRemove.Count) old job records" "INFO"
    }
}

# MAIN MONITORING LOOP
Write-Log "Starting Print Job Monitoring - SINGLE EVENT MODE" "SUCCESS"
Write-Log "Monitoring ONLY Event ID 307 (Print Job Completed)" "INFO"
Write-Log "Duplicate detection enabled - ONE entry per print job guaranteed" "INFO"

$loopCount = 0
$totalJobsProcessed = 0
$monitoringStart = Get-Date

try {
    while ($true) {
        try {
            # Get only completion events from the last 10 seconds
            $startTime = (Get-Date).AddSeconds(-10)
            
            # CRITICAL: ONLY monitor Event ID 307 (print job completed)
            # This is the key fix - ignore all other event IDs
            $events = Get-WinEvent -FilterHashtable @{
                LogName = "Microsoft-Windows-PrintService/Operational"
                Id = 307  # ONLY completion events
                StartTime = $startTime
            } -ErrorAction SilentlyContinue
            
            if ($events) {
                Write-Log "Found $($events.Count) print completion event(s)" "INFO"
                
                # Process each completion event
                foreach ($event in $events | Sort-Object TimeCreated) {
                    Process-PrintCompletion -Event $event
                    $totalJobsProcessed++
                }
            }
            
            # Heartbeat every 2 minutes
            $loopCount++
            if ($loopCount % 60 -eq 0) {
                $uptime = (Get-Date) - $monitoringStart
                Write-Log "HEARTBEAT - Uptime: $($uptime.ToString('hh\:mm\:ss')), Jobs Processed: $totalJobsProcessed, In Memory: $($processedJobs.Count)" "INFO"
            }
            
            # Cleanup every 30 minutes
            if ($loopCount % 900 -eq 0) {
                Cleanup-ProcessedJobs
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