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
Write-Log "💡 Demo mode: Generating print jobs every 30 seconds for testing"
        [string]$UserName = $env:USERNAME
# Generate print jobs regularly for demo
    
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
    
    # Register for print job events
    Register-WmiEvent -Query "SELECT * FROM Win32_VolumeChangeEvent WHERE EventType = 2" -Action {
        # This is a simplified example - in production, you'd monitor actual print spooler events
        Write-Log "Print event detected (simplified monitoring)"
    }
    
    # Simulate print job detection for demo purposes
    # In production, this would monitor actual Windows print spooler events
    while ($true) {
        try {
            # Check for new print jobs in the spooler
            $printJobs = Get-WmiObject -Class Win32_PrintJob -ErrorAction SilentlyContinue
            
            if ($printJobs) {
                foreach ($job in $printJobs) {
                    $fileName = if ($job.Document) { $job.Document } else { "Unknown Document" }
                    $printerName = if ($job.Name) { ($job.Name -split ",")[0] } else { "Unknown Printer" }
                    $systemName = $env:COMPUTERNAME
                    $userName = $env:USERNAME
                    $pages = if ($job.TotalPages -and $job.TotalPages -gt 0) { $job.TotalPages } else { 1 }
                    $fileSize = "1.2 MB" # Estimated
                    
                    Send-PrintJob -FileName $fileName -SystemName $systemName -PrinterName $printerName -Pages $pages -FileSize $fileSize -UserName $userName
                }
            }
            
            # Also simulate some print jobs for demo
            if ((Get-Random -Minimum 1 -Maximum 100) -lt 15) { # 15% chance every loop
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
            }
            
            Start-Sleep -Seconds 20
        }
        catch {
            Write-Log "❌ Error in monitoring loop: $($_.Exception.Message)"
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
        
        Write-Log "📄 Generating demo print job: $fileName"
        Send-PrintJob -FileName $fileName -SystemName $systemName -PrinterName $printerName -Pages $pages -FileSize $fileSize -UserName $userName
            # Wait 30 seconds before sending the next job
            Start-Sleep -Seconds 30
        }
        catch {
            Write-Log "❌ Error sending test print job: $($_.Exception.Message)"
            Start-Sleep -Seconds 60
        Start-Sleep -Seconds 30
    }
}
catch {
    Write-Log "❌ Print monitoring stopped with error: $($_.Exception.Message)"
    exit 1
}