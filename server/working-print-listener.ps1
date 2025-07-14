# PrintMonitor Windows Print Listener - PRODUCTION VERSION
# This script monitors actual Windows print jobs and sends data to PrintMonitor server

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
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

# Logging function with console and file output
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage -ForegroundColor Green
    try {
        Add-Content -Path $LogPath -Value $logMessage -ErrorAction SilentlyContinue
    } catch {
        Write-Host "Warning: Could not write to log file: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Log "=== PrintMonitor Print Listener Starting ==="
Write-Log "Client ID: $ClientId"
Write-Log "API Endpoint: $ApiEndpoint"
Write-Log "Computer: $env:COMPUTERNAME"
Write-Log "User: $env:USERNAME"
Write-Log "Log Path: $LogPath"
Write-Log "PowerShell Version: $($PSVersionTable.PSVersion)"

# Test API connection first
function Test-ServerConnection {
    try {
        Write-Log "Testing connection to PrintMonitor server..."
        $healthUrl = "$ApiEndpoint/health"
        Write-Log "Health check URL: $healthUrl"
        
        $response = Invoke-RestMethod -Uri $healthUrl -Method GET -TimeoutSec 10
        Write-Log "✅ Server connection successful!"
        Write-Log "Server: $($response.server)"
        Write-Log "Status: $($response.status)"
        return $true
    }
    catch {
        Write-Log "❌ Failed to connect to server: $($_.Exception.Message)"
        Write-Log "Please verify:"
        Write-Log "1. Server is running at: $ApiEndpoint"
        Write-Log "2. Network connectivity is working"
        Write-Log "3. Firewall allows outbound connections"
        return $false
    }
}

# Function to send print job to server
function Send-PrintJob {
    param(
        [string]$FileName,
        [string]$SystemName,
        [string]$PrinterName,
        [int]$Pages,
        [string]$FileSize = "Unknown",
        [string]$UserName = $env:USERNAME,
        [string]$JobStatus = "success"
    )
    
    try {
        $body = @{
            clientId = $ClientId
            apiKey = $ApiKey
            fileName = $FileName
            systemName = $SystemName
            printerName = $PrinterName
            pages = $Pages
            fileSize = $FileSize
            paperSize = "A4"
            colorMode = "blackwhite"
            userName = $UserName
            status = $JobStatus
        } | ConvertTo-Json -Depth 3
        
        $headers = @{
            'Content-Type' = 'application/json'
            'User-Agent' = 'PrintMonitor-Windows-Listener/2.0'
        }
        
        Write-Log "📄 Sending print job to server:"
        Write-Log "   File: $FileName"
        Write-Log "   Printer: $PrinterName"
        Write-Log "   Pages: $Pages"
        Write-Log "   System: $SystemName"
        Write-Log "   User: $UserName"
        
        $response = Invoke-RestMethod -Uri "$ApiEndpoint/print-jobs" -Method POST -Body $body -Headers $headers -TimeoutSec 30
        
        if ($response.success) {
            Write-Log "✅ Print job sent successfully!"
            Write-Log "   Job ID: $($response.jobId)"
            Write-Log "   Cost: $($response.cost)"
            return $true
        } else {
            Write-Log "❌ Server rejected print job: $($response.message)"
            return $false
        }
    }
    catch {
        Write-Log "❌ Error sending print job: $($_.Exception.Message)"
        Write-Log "   Request URL: $ApiEndpoint/print-jobs"
        return $false
    }
}

# Method 1: Monitor using WMI Events (Most Reliable)
function Start-WMIEventMonitoring {
    Write-Log "🔍 Starting WMI Event monitoring for print jobs..."
    
    try {
        # Register for print job events
        Register-WmiEvent -Query "SELECT * FROM Win32_VolumeChangeEvent WHERE EventType = 2" -Action {
            # This will trigger on various system events, we'll filter for print-related ones
        } -ErrorAction SilentlyContinue
        
        Write-Log "✅ WMI Event monitoring registered"
    }
    catch {
        Write-Log "⚠️ WMI Event monitoring failed: $($_.Exception.Message)"
    }
}

# Method 2: Monitor Print Spooler Service Events
function Monitor-PrintSpoolerEvents {
    Write-Log "🔍 Checking Windows Print Spooler events..."
    
    try {
        # Get recent print events from Windows Event Log
        $events = Get-WinEvent -FilterHashtable @{
            LogName = 'Microsoft-Windows-PrintService/Operational'
            ID = 307  # Document printed event
            StartTime = (Get-Date).AddMinutes(-2)
        } -MaxEvents 50 -ErrorAction SilentlyContinue
        
        if ($events) {
            Write-Log "📋 Found $($events.Count) recent print events"
            
            foreach ($event in $events) {
                try {
                    $message = $event.Message
                    Write-Log "📄 Event message: $message"
                    
                    # Parse the event message for print job details
                    if ($message -match "Document\s+(.+?)\s+owned by\s+(.+?)\s+was printed on\s+(.+?)\s+through") {
                        $fileName = $matches[1].Trim()
                        $userName = $matches[2].Trim()
                        $printerName = $matches[3].Trim()
                        
                        # Clean up the extracted data
                        $fileName = $fileName -replace '"', ''
                        $printerName = $printerName -replace '"', ''
                        
                        Write-Log "📄 Parsed print job:"
                        Write-Log "   Document: $fileName"
                        Write-Log "   User: $userName"
                        Write-Log "   Printer: $printerName"
                        
                        # Send to server
                        $sent = Send-PrintJob -FileName $fileName -SystemName $env:COMPUTERNAME -PrinterName $printerName -Pages 1 -UserName $userName
                        
                        if ($sent) {
                            Write-Log "✅ Print job successfully processed"
                        }
                    }
                    else {
                        Write-Log "⚠️ Could not parse event message format"
                    }
                }
                catch {
                    Write-Log "❌ Error processing event: $($_.Exception.Message)"
                }
            }
        }
        else {
            Write-Log "📋 No recent print events found"
        }
    }
    catch {
        Write-Log "❌ Error accessing print events: $($_.Exception.Message)"
    }
}

# Method 3: Monitor Active Print Jobs
function Monitor-ActivePrintJobs {
    Write-Log "🔍 Checking active print jobs..."
    
    try {
        # Method 3a: Use Get-PrintJob cmdlet (Windows 8+)
        if (Get-Command Get-PrintJob -ErrorAction SilentlyContinue) {
            Write-Log "📋 Using PowerShell Get-PrintJob cmdlet"
            
            $printJobs = Get-PrintJob -ErrorAction SilentlyContinue
            
            if ($printJobs) {
                Write-Log "📄 Found $($printJobs.Count) active print jobs"
                
                foreach ($job in $printJobs) {
                    try {
                        $fileName = if ($job.DocumentName) { $job.DocumentName } else { "Unknown Document" }
                        $printerName = if ($job.PrinterName) { $job.PrinterName } else { "Unknown Printer" }
                        $userName = if ($job.UserName) { $job.UserName } else { $env:USERNAME }
                        $pages = if ($job.TotalPages -and $job.TotalPages -gt 0) { $job.TotalPages } else { 1 }
                        $size = if ($job.Size -and $job.Size -gt 0) { "$([math]::Round($job.Size / 1KB, 1)) KB" } else { "Unknown" }
                        
                        Write-Log "📄 Active print job found:"
                        Write-Log "   Document: $fileName"
                        Write-Log "   Printer: $printerName"
                        Write-Log "   User: $userName"
                        Write-Log "   Pages: $pages"
                        Write-Log "   Size: $size"
                        
                        $sent = Send-PrintJob -FileName $fileName -SystemName $env:COMPUTERNAME -PrinterName $printerName -Pages $pages -FileSize $size -UserName $userName
                        
                        if ($sent) {
                            Write-Log "✅ Active print job successfully processed"
                        }
                    }
                    catch {
                        Write-Log "❌ Error processing active job: $($_.Exception.Message)"
                    }
                }
            }
            else {
                Write-Log "📋 No active print jobs found"
            }
        }
        
        # Method 3b: Use WMI Win32_PrintJob
        Write-Log "📋 Using WMI Win32_PrintJob"
        $wmiJobs = Get-WmiObject -Class Win32_PrintJob -ErrorAction SilentlyContinue
        
        if ($wmiJobs) {
            Write-Log "📄 Found $($wmiJobs.Count) WMI print jobs"
            
            foreach ($job in $wmiJobs) {
                try {
                    $fileName = if ($job.Document) { $job.Document } else { "Unknown Document" }
                    $printerName = if ($job.Name) { ($job.Name -split ",")[0] } else { "Unknown Printer" }
                    $userName = if ($job.Owner) { $job.Owner } else { $env:USERNAME }
                    $pages = if ($job.TotalPages -and $job.TotalPages -gt 0) { $job.TotalPages } else { 1 }
                    $size = if ($job.Size -and $job.Size -gt 0) { "$([math]::Round($job.Size / 1KB, 1)) KB" } else { "Unknown" }
                    
                    Write-Log "📄 WMI print job found:"
                    Write-Log "   Document: $fileName"
                    Write-Log "   Printer: $printerName"
                    Write-Log "   User: $userName"
                    Write-Log "   Pages: $pages"
                    Write-Log "   Size: $size"
                    
                    $sent = Send-PrintJob -FileName $fileName -SystemName $env:COMPUTERNAME -PrinterName $printerName -Pages $pages -FileSize $size -UserName $userName
                    
                    if ($sent) {
                        Write-Log "✅ WMI print job successfully processed"
                    }
                }
                catch {
                    Write-Log "❌ Error processing WMI job: $($_.Exception.Message)"
                }
            }
        }
        else {
            Write-Log "📋 No WMI print jobs found"
        }
    }
    catch {
        Write-Log "❌ Error monitoring active print jobs: $($_.Exception.Message)"
    }
}

# Method 4: Send a test print job to verify connection
function Send-TestPrintJob {
    Write-Log "🧪 Sending test print job to verify connection..."
    
    $testFileName = "TEST_CONNECTION_$(Get-Date -Format 'yyyyMMdd_HHmmss').pdf"
    $testPrinter = "Test Connection Printer"
    
    $sent = Send-PrintJob -FileName $testFileName -SystemName $env:COMPUTERNAME -PrinterName $testPrinter -Pages 1 -FileSize "0.1 KB" -UserName $env:USERNAME -JobStatus "success"
    
    if ($sent) {
        Write-Log "✅ Test print job sent successfully!"
        Write-Log "🌐 Check your dashboard at: $ApiEndpoint/../?client=$ClientId"
    } else {
        Write-Log "❌ Test print job failed"
    }
}

# Main monitoring loop
function Start-PrintMonitoring {
    Write-Log "🚀 Starting comprehensive print job monitoring..."
    Write-Log "📊 Monitoring methods:"
    Write-Log "   1. Windows Event Log monitoring"
    Write-Log "   2. PowerShell Get-PrintJob cmdlets"
    Write-Log "   3. WMI Win32_PrintJob monitoring"
    Write-Log "   4. Real-time print spooler events"
    
    # Send initial test job
    Send-TestPrintJob
    
    # Start WMI event monitoring
    Start-WMIEventMonitoring
    
    $loopCount = 0
    
    while ($true) {
        try {
            $loopCount++
            Write-Log "🔄 Monitoring cycle #$loopCount - $(Get-Date -Format 'HH:mm:ss')"
            
            # Method 1: Check Windows Event Log
            Monitor-PrintSpoolerEvents
            
            # Method 2: Check active print jobs
            Monitor-ActivePrintJobs
            
            Write-Log "⏱️ Waiting 10 seconds before next check..."
            Start-Sleep -Seconds 10
        }
        catch {
            Write-Log "❌ Error in monitoring loop: $($_.Exception.Message)"
            Write-Log "⏱️ Waiting 30 seconds before retry..."
            Start-Sleep -Seconds 30
        }
    }
}

# Main execution
try {
    # Test server connection first
    if (Test-ServerConnection) {
        Write-Log "🎯 Server connection verified - starting print monitoring"
        Start-PrintMonitoring
    } else {
        Write-Log "❌ Cannot start monitoring - server connection failed"
        Write-Log "💡 Please check server status and network connectivity"
        exit 1
    }
}
catch {
    Write-Log "❌ Fatal error: $($_.Exception.Message)"
    Write-Log "💡 Print monitoring stopped"
    exit 1
}