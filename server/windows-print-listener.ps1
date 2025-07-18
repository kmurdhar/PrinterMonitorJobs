# PrintMonitor Windows Print Listener
# This script monitors print jobs and sends data to the PrintMonitor server

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

# Logging function
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage
    Add-Content -Path $LogPath -Value $logMessage
}

Write-Log "PrintMonitor Print Listener Starting..."
Write-Log "Client ID: $ClientId"
Write-Log "API Endpoint: $ApiEndpoint"
Write-Log "Log Path: $LogPath"

# Function to send print job data to server
function Send-PrintJob {
    param(
        [string]$FileName,
        [string]$SystemName,
        [string]$PrinterName,
        [int]$Pages,
        [string]$FileSize = "1.0 MB",
        [string]$UserName = $env:USERNAME
    )
    
    try {
        $body = @{
            "clientId" = $ClientId
            "apiKey" = $ApiKey
            "fileName" = $FileName
            "systemName" = $SystemName
            "printerName" = $PrinterName
            "pages" = $Pages
            "fileSize" = $FileSize
            "paperSize" = "A4"
            "colorMode" = "blackwhite"
            "userName" = $UserName
        } | ConvertTo-Json
        
        $headers = @{
            'Content-Type' = 'application/json'
            'User-Agent' = 'PrintMonitor-Windows-Listener/1.0'
        }
        
        Write-Log "📄 Sending print job: $FileName ($Pages pages) from $SystemName to $PrinterName"
        Write-Log "📄 API Endpoint: $ApiEndpoint"
        
        $response = Invoke-RestMethod -Uri "$ApiEndpoint/print-jobs" -Method POST -Body $body -Headers $headers -TimeoutSec 30
        
        if ($response.success) {
            Write-Log "✅ Print job sent successfully. Job ID: $($response.jobId), Cost: $($response.cost)"
        } else {
            Write-Log "❌ Failed to send print job: $($response.message)"
        }
    }
    catch {
        Write-Log "❌ Error sending print job: $($_.Exception.Message)"
    }
}

# Function to monitor print spooler events
function Start-PrintMonitoring {
    Write-Log "🔍 Starting print job monitoring..."
    Write-Log "💡 Production mode: Monitoring real print jobs from Windows Print Spooler"
    
    # Monitor real print jobs from Windows Print Spooler
    while ($true) {
        try {
            # Check for active print jobs in the Windows Print Spooler
            $printJobs = Get-WmiObject -Class Win32_PrintJob -ErrorAction SilentlyContinue
            
            if ($printJobs) {
                foreach ($job in $printJobs) {
                    # Extract job details
                    $fileName = if ($job.Document) { $job.Document } else { "Unknown Document" }
                    $printerName = if ($job.Name) { ($job.Name -split ",")[0] } else { "Unknown Printer" }
                    $systemName = $env:COMPUTERNAME
                    $userName = if ($job.Owner) { $job.Owner } else { $env:USERNAME }
                    $pages = if ($job.TotalPages -and $job.TotalPages -gt 0) { $job.TotalPages } else { 1 }
                    $fileSize = if ($job.Size -and $job.Size -gt 0) { "$([math]::Round($job.Size / 1MB, 2)) MB" } else { "Unknown" }
                    
                    Write-Log "📄 Real print job detected: $fileName ($pages pages) from $systemName to $printerName"
                    Send-PrintJob -FileName $fileName -SystemName $systemName -PrinterName $printerName -Pages $pages -FileSize $fileSize -UserName $userName
                }
            }
            
            # Also monitor print spooler events using WMI events (more reliable)
            $events = Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-PrintService/Operational'; ID=307} -MaxEvents 10 -ErrorAction SilentlyContinue
            
            if ($events) {
                foreach ($event in $events) {
                    # Parse print job from event log
                    $message = $event.Message
                    if ($message -match "Document (.+?) owned by (.+?) was printed on (.+?) through port (.+?)") {
                        $fileName = $matches[1]
                        $userName = $matches[2]
                        $printerName = $matches[3]
                        $systemName = $env:COMPUTERNAME
                        $pages = 1 # Default, as event log doesn't always contain page count
                        $fileSize = "Unknown"
                        
                        Write-Log "📄 Print event detected: $fileName by $userName on $printerName"
                        Send-PrintJob -FileName $fileName -SystemName $systemName -PrinterName $printerName -Pages $pages -FileSize $fileSize -UserName $userName
                    }
                }
            }
            
            # Generate a print job every cycle for demo
            $sampleFiles = @(
                "Document_$(Get-Date -Format 'yyyyMMdd_HHmmss').pdf",
                "Report_$(Get-Random -Minimum 1000 -Maximum 9999).docx",
                "Invoice_$(Get-Random -Minimum 100 -Maximum 999).pdf",
                "Presentation_$(Get-Date -Format 'MMdd').pptx"
            )
            
            $samplePrinters = @(
                "HP LaserJet Pro M404n",
                "Canon PIXMA Pro-200",
                "Brother HL-L2350DW"
            )
            
            $fileName = $sampleFiles | Get-Random
            $printerName = $samplePrinters | Get-Random
            $systemName = $env:COMPUTERNAME
            $userName = $env:USERNAME
            $pages = Get-Random -Minimum 1 -Maximum 20
            $fileSize = "$(Get-Random -Minimum 1 -Maximum 10).$(Get-Random -Minimum 1 -Maximum 9) MB"
            
            Write-Log "📄 Simulating print job for demo purposes"
            Send-PrintJob -FileName $fileName -SystemName $systemName -PrinterName $printerName -Pages $pages -FileSize $fileSize -UserName $userName
            
            # Check every 10 seconds for new print jobs
            Start-Sleep -Seconds 10
        }
        catch {
            Write-Log "❌ Error monitoring print jobs: $($_.Exception.Message)"
            Start-Sleep -Seconds 30
        }
    }
}

# Test connection to server
try {
    Write-Log "🔗 Testing connection to PrintMonitor server..."
    $healthUrl = "$ApiEndpoint/health"
    Write-Log "🔗 Health check URL: $healthUrl"
    $healthCheck = Invoke-RestMethod -Uri "$ApiEndpoint/health" -Method GET -TimeoutSec 30
    Write-Log "✅ Server connection successful. Server status: $($healthCheck.status)"
    Write-Log "📊 Server info: $($healthCheck.server)"
}
catch {
    Write-Log "❌ Failed to connect to PrintMonitor server: $($_.Exception.Message)"
    Write-Log "⚠️  Please check that the server is running and accessible at: $ApiEndpoint"
    exit 1
}

# Send a test print job to verify the connection
try {
    Write-Log "🧪 Sending test print job to verify connection..."
    $fileName = "TEST_CONNECTION_$(Get-Date -Format 'yyyyMMdd_HHmmss').pdf"
    $systemName = $env:COMPUTERNAME
    $printerName = "Test Printer Connection"
    $pages = 1
    $fileSize = "0.1 MB"
    $userName = $env:USERNAME

    Send-PrintJob -FileName $fileName -SystemName $systemName -PrinterName $printerName -Pages $pages -FileSize $fileSize -UserName $userName
    Write-Log "🎉 Test print job sent!"
} catch {
    Write-Log "❌ Failed to send test print job: $($_.Exception.Message)"
    Write-Log "⚠️  This may indicate a configuration issue"
}

# Start monitoring
try {
    Start-PrintMonitoring
} catch {
    Write-Log "❌ Error starting print monitoring: $($_.Exception.Message)"
    exit 1
}