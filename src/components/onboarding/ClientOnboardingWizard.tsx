import React, { useState } from 'react';
import { 
  X, 
  Building, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Printer, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Globe,
  Key,
  Shield,
  Download,
  Copy,
  Check,
  Monitor,
  Settings,
  Zap,
  AlertTriangle,
  FileText,
  Network,
  ExternalLink,
  Package,
  Server,
  Wifi,
  Code
} from 'lucide-react';

interface ClientOnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (clientData: any) => void;
}

interface ClientData {
  // Company Information
  companyName: string;
  address: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  
  // Subscription
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  
  // Technical Setup
  printerCount: number;
  estimatedUsers: number;
  subdomain: string;
  
  // Generated Data
  clientId: string;
  apiKey: string;
}

const ClientOnboardingWizard: React.FC<ClientOnboardingWizardProps> = ({ 
  isOpen, 
  onClose, 
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [clientData, setClientData] = useState<ClientData>({
    companyName: '',
    address: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    subscriptionPlan: 'premium',
    printerCount: 3,
    estimatedUsers: 10,
    subdomain: '',
    clientId: '',
    apiKey: ''
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Get current server URL dynamically
  const getServerUrl = () => {
    return window.location.origin; // This will be http://192.168.29.84:5173 in production
  };

  if (!isOpen) return null;

  const generateClientId = () => {
    const prefix = clientData.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 8);
    const suffix = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${suffix}`;
  };

  const generateApiKey = () => {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const generateSubdomain = () => {
    return clientData.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 12);
  };

  const handleNext = () => {
    if (currentStep === 2) {
      // Generate technical data when moving to step 3
      setClientData(prev => ({
        ...prev,
        clientId: generateClientId(),
        apiKey: generateApiKey(),
        subdomain: prev.subdomain || generateSubdomain()
      }));
    }
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleComplete = () => {
    onComplete(clientData);
    onClose();
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const downloadSetupGuide = () => {
    const serverUrl = getServerUrl();
    const setupGuide = `
# 🖨️ PrintMonitor Client Setup Guide - ${clientData.companyName}

## 🏢 Client Information
- Company: ${clientData.companyName}
- Client ID: ${clientData.clientId}
- Subscription: ${clientData.subscriptionPlan}
- Setup Date: ${new Date().toLocaleDateString()}

## 🔑 API Configuration
- Client ID: ${clientData.clientId}
- API Key: ${clientData.apiKey}
- API Endpoint: ${serverUrl}/api
- Client Dashboard: ${serverUrl}/?client=${clientData.clientId}

## 🖥️ Windows Print Listener Installation

### Step 1: Download the Print Listener
Download the PowerShell script from your PrintMonitor admin:
- File: PrintMonitor_Listener.ps1
- Or copy the script provided in this guide

### Step 2: Install on Each Computer
Run this PowerShell script AS ADMINISTRATOR on every computer that will print:

1. Open PowerShell as Administrator
2. Navigate to the script location
3. Run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
4. Run the installation script with your credentials

### Step 3: PowerShell Installation Script
Save this as 'PrintMonitor_Installer.ps1' and run as Administrator:

\`\`\`powershell
# PrintMonitor Installation Script for ${clientData.companyName}
param(
    [string]$ClientId = "${clientData.clientId}",
    [string]$ApiEndpoint = "${serverUrl}/api",
    [string]$ApiKey = "${clientData.apiKey}"
)

Write-Host "Installing PrintMonitor for ${clientData.companyName}..." -ForegroundColor Green

# Create service directory
$serviceDir = "C:\\PrintMonitor"
if (!(Test-Path $serviceDir)) {
    New-Item -ItemType Directory -Path $serviceDir -Force
    Write-Host "Created directory: $serviceDir" -ForegroundColor Yellow
}

# Create configuration file
$config = @{
    ClientId = $ClientId
    ApiEndpoint = $ApiEndpoint
    ApiKey = $ApiKey
    CompanyName = "${clientData.companyName}"
    InstallDate = (Get-Date).ToString()
}
$config | ConvertTo-Json | Set-Content "$serviceDir\\config.json"

# Create the print monitoring script
$monitorScript = @'
# PrintMonitor Service Script
$configPath = "C:\\PrintMonitor\\config.json"
$config = Get-Content $configPath | ConvertFrom-Json

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $Message" | Add-Content "C:\\PrintMonitor\\printmonitor.log"
}

function Send-PrintJobData {
    param($JobData)
    
    try {
        $headers = @{
            "Authorization" = "Bearer $($config.ApiKey)"
            "Content-Type" = "application/json"
            "X-Client-ID" = $config.ClientId
        }
        
        $response = Invoke-RestMethod -Uri "$($config.ApiEndpoint)/print-jobs" -Method POST -Body ($JobData | ConvertTo-Json) -Headers $headers
        Write-Log "Successfully sent print job: $($JobData.fileName)"
        return $true
    }
    catch {
        Write-Log "Error sending print job: $($_.Exception.Message)"
        return $false
    }
}

function Get-SystemInfo {
    $computerName = $env:COMPUTERNAME
    $userName = $env:USERNAME
    
    # Department detection based on computer name patterns
    $department = "Unknown"
    if ($computerName -match "FINANCE|FIN|ACCOUNTING|ACC") { $department = "Finance" }
    elseif ($computerName -match "MARKETING|MKT|SALES") { $department = "Marketing" }
    elseif ($computerName -match "HR|HUMAN") { $department = "HR" }
    elseif ($computerName -match "IT|TECH|DEV") { $department = "IT" }
    elseif ($computerName -match "OPS|OPERATIONS") { $department = "Operations" }
    elseif ($computerName -match "ADMIN|MGMT|EXEC") { $department = "Administration" }
    elseif ($computerName -match "LEGAL|LAW") { $department = "Legal" }
    
    return @{
        SystemName = $computerName
        UserName = $userName
        Department = $department
    }
}

Write-Log "PrintMonitor started for client: $($config.ClientId)"

# Register for print job events
Register-WmiEvent -Query "SELECT * FROM Win32_PrintJob" -Action {
    $job = $Event.SourceEventArgs.NewEvent
    $systemInfo = Get-SystemInfo
    
    $printData = @{
        fileName = $job.Document
        user = $systemInfo.SystemName
        systemName = $systemInfo.SystemName
        department = $systemInfo.Department
        printer = $job.Name
        pages = if ($job.TotalPages) { $job.TotalPages } else { 1 }
        status = if ($job.Status -eq "OK" -or $job.Status -eq $null) { "success" } else { "failed" }
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
        fileSize = if ($job.Size) { "$([math]::Round($job.Size/1MB, 2)) MB" } else { "Unknown" }
        paperSize = "A4"
        colorMode = "blackwhite"
        actualUser = $systemInfo.UserName
        clientId = $config.ClientId
    }
    
    Send-PrintJobData -JobData $printData
}

# Keep running
Write-Log "Print monitoring active. Press Ctrl+C to stop."
try {
    while ($true) {
        Start-Sleep -Seconds 30
        Write-Log "Print Monitor running... (Client: $($config.ClientId))"
    }
}
finally {
    Write-Log "Print Monitor stopped."
}
'@

$monitorScript | Set-Content "$serviceDir\\PrintMonitor.ps1"

Write-Host "Installation completed!" -ForegroundColor Green
Write-Host "Configuration saved to: $serviceDir\\config.json" -ForegroundColor Yellow
Write-Host "Monitor script saved to: $serviceDir\\PrintMonitor.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "To start monitoring:" -ForegroundColor Cyan
Write-Host "1. Open PowerShell as Administrator" -ForegroundColor White
Write-Host "2. Run: C:\\PrintMonitor\\PrintMonitor.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Your dashboard: ${serverUrl}/?client=${clientData.clientId}" -ForegroundColor Green
\`\`\`

### Step 4: Start the Print Monitor
After installation, start the monitor on each computer:

1. Open PowerShell as Administrator
2. Run: C:\\PrintMonitor\\PrintMonitor.ps1
3. Leave PowerShell window open (minimized is fine)
4. Print a test document to verify it's working

### Step 5: Verify Installation
1. Print any document from any application
2. Check your dashboard at: ${serverUrl}/?client=${clientData.clientId}
3. Print job should appear within 30 seconds

## 🖨️ How Printer Mapping Works

### Automatic Discovery:
- Printers are automatically discovered when users print
- No manual configuration needed
- System detects printer name, location, and department

### First Print Job Process:
1. User prints document normally
2. Print Listener captures the job
3. Printer automatically added to system
4. Print job appears in dashboard

### System Naming Convention:
For best department detection, name computers like:
- FINANCE-PC-01 → Finance Department
- MARKETING-LAPTOP-03 → Marketing Department  
- HR-WORKSTATION-02 → HR Department
- IT-DESKTOP-07 → IT Department

## 📊 What Gets Captured:
- System name (computer name)
- Document name and size
- Printer used
- Page count
- Date and time
- Department (auto-detected)
- User name (Windows user)

## 🎯 Testing the Setup:

### Test Print Job:
1. Print any document from any application
2. Check dashboard at: ${serverUrl}/?client=${clientData.clientId}
3. Print job should appear within 30 seconds

### Troubleshooting:
- Ensure PowerShell script is running as Administrator
- Check that computer can reach ${serverUrl}
- Verify API credentials are correct
- Check Windows Event Viewer for errors

## 📞 Support Information:
- Server: ${serverUrl}
- Client Dashboard: ${serverUrl}/?client=${clientData.clientId}
- Setup Date: ${new Date().toLocaleDateString()}

## 🚀 Next Steps:
1. Install Print Listener on all computers that will print
2. Test with sample print jobs
3. Monitor dashboard for real-time data
4. Configure ${clientData.printerCount} printers as needed
5. Set up user accounts for ${clientData.estimatedUsers} users

Installation Date: ${new Date().toLocaleDateString()}
Setup by: PrintMonitor Admin Team
Server: ${serverUrl}
    `;

    const blob = new Blob([setupGuide], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${clientData.companyName.replace(/[^a-z0-9]/gi, '_')}_PrintMonitor_Setup_Guide.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadInstallerConfig = () => {
    const serverUrl = getServerUrl();
    const configFile = `
# PrintMonitor Configuration File
# Company: ${clientData.companyName}
# Generated: ${new Date().toLocaleString()}

CLIENT_ID=${clientData.clientId}
API_KEY=${clientData.apiKey}
API_ENDPOINT=${serverUrl}/api
CLIENT_NAME=${clientData.companyName}
SUBDOMAIN=${clientData.subdomain}
SERVER_URL=${serverUrl}
DASHBOARD_URL=${serverUrl}/?client=${clientData.clientId}

# Installation Instructions:
# 1. Save this file as 'printmonitor.config'
# 2. Use these values in the PowerShell installation script
# 3. Run PowerShell script as Administrator on each computer
# 4. Verify installation by printing a test document

# Support:
# Dashboard: ${serverUrl}/?client=${clientData.clientId}
# Server: ${serverUrl}
    `;

    const blob = new Blob([configFile], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${clientData.companyName.replace(/[^a-z0-9]/gi, '_')}_config.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadProductionInstaller = () => {
    const serverUrl = getServerUrl();
    const productionInstaller = `
# PrintMonitor Production Installer for ${clientData.companyName}
# Server: ${serverUrl}
# Generated: ${new Date().toLocaleString()}

param(
    [string]$ClientId = "${clientData.clientId}",
    [string]$ApiEndpoint = "${serverUrl}/api",
    [string]$ApiKey = "${clientData.apiKey}"
)

Write-Host "=== PrintMonitor Production Installer ===" -ForegroundColor Green
Write-Host "Company: ${clientData.companyName}" -ForegroundColor Yellow
Write-Host "Server: ${serverUrl}" -ForegroundColor Yellow
Write-Host "Client ID: $ClientId" -ForegroundColor Yellow
Write-Host ""

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✓ Running as Administrator" -ForegroundColor Green

# Create service directory
$serviceDir = "C:\\PrintMonitor"
Write-Host "Creating service directory..." -ForegroundColor Cyan
if (!(Test-Path $serviceDir)) {
    New-Item -ItemType Directory -Path $serviceDir -Force | Out-Null
    Write-Host "✓ Created directory: $serviceDir" -ForegroundColor Green
} else {
    Write-Host "✓ Directory already exists: $serviceDir" -ForegroundColor Green
}

# Create logs directory
$logsDir = "$serviceDir\\logs"
if (!(Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
    Write-Host "✓ Created logs directory: $logsDir" -ForegroundColor Green
}

# Test API connectivity
Write-Host "Testing API connectivity..." -ForegroundColor Cyan
try {
    $testResponse = Invoke-WebRequest -Uri $ApiEndpoint -Method GET -TimeoutSec 10
    Write-Host "✓ API endpoint is reachable" -ForegroundColor Green
} catch {
    Write-Host "⚠ Warning: Could not reach API endpoint" -ForegroundColor Yellow
    Write-Host "  This might be normal if the server is not running yet" -ForegroundColor Gray
}

# Create configuration file
Write-Host "Creating configuration file..." -ForegroundColor Cyan
$config = @{
    ClientId = $ClientId
    ApiEndpoint = $ApiEndpoint
    ApiKey = $ApiKey
    CompanyName = "${clientData.companyName}"
    ServerUrl = "${serverUrl}"
    DashboardUrl = "${serverUrl}/?client=$ClientId"
    InstallDate = (Get-Date).ToString()
    ComputerName = $env:COMPUTERNAME
    UserName = $env:USERNAME
}
$config | ConvertTo-Json -Depth 3 | Set-Content "$serviceDir\\config.json"
Write-Host "✓ Configuration saved to: $serviceDir\\config.json" -ForegroundColor Green

# Create the print monitoring script
Write-Host "Installing print monitoring script..." -ForegroundColor Cyan
$monitorScript = @'
# PrintMonitor Production Service
# Auto-generated for ${clientData.companyName}

$configPath = "C:\\PrintMonitor\\config.json"
$logPath = "C:\\PrintMonitor\\logs\\printmonitor.log"

if (!(Test-Path $configPath)) {
    Write-Error "Configuration file not found: $configPath"
    exit 1
}

$config = Get-Content $configPath | ConvertFrom-Json

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    $logEntry | Add-Content $logPath
    Write-Host $logEntry
}

function Send-PrintJobData {
    param($JobData)
    
    try {
        $headers = @{
            "Authorization" = "Bearer $($config.ApiKey)"
            "Content-Type" = "application/json"
            "X-Client-ID" = $config.ClientId
            "User-Agent" = "PrintMonitor-Client/1.0"
        }
        
        $jsonData = $JobData | ConvertTo-Json -Depth 3
        $response = Invoke-RestMethod -Uri "$($config.ApiEndpoint)/print-jobs" -Method POST -Body $jsonData -Headers $headers -TimeoutSec 30
        
        Write-Log "✓ Print job sent successfully: $($JobData.fileName)" "SUCCESS"
        return $true
    }
    catch {
        Write-Log "✗ Failed to send print job: $($_.Exception.Message)" "ERROR"
        Write-Log "  Job data: $($JobData.fileName) from $($JobData.systemName)" "ERROR"
        return $false
    }
}

function Get-SystemInfo {
    $computerName = $env:COMPUTERNAME
    $userName = $env:USERNAME
    
    # Enhanced department detection
    $department = "Unknown"
    $computerUpper = $computerName.ToUpper()
    
    if ($computerUpper -match "FINANCE|FIN|ACCOUNTING|ACC|ACCT") { $department = "Finance" }
    elseif ($computerUpper -match "MARKETING|MKT|SALES|SELL") { $department = "Marketing" }
    elseif ($computerUpper -match "HR|HUMAN|PEOPLE") { $department = "HR" }
    elseif ($computerUpper -match "IT|TECH|DEV|SUPPORT|SYS") { $department = "IT" }
    elseif ($computerUpper -match "OPS|OPERATIONS|PROD") { $department = "Operations" }
    elseif ($computerUpper -match "ADMIN|MGMT|EXEC|OFFICE") { $department = "Administration" }
    elseif ($computerUpper -match "LEGAL|LAW|COMPLIANCE") { $department = "Legal" }
    elseif ($computerUpper -match "RECEPTION|FRONT|LOBBY") { $department = "Reception" }
    
    return @{
        SystemName = $computerName
        UserName = $userName
        Department = $department
        Domain = $env:USERDOMAIN
        LogonServer = $env:LOGONSERVER
    }
}

function Get-PrinterInfo {
    param([string]$PrinterName)
    
    try {
        $printer = Get-Printer -Name $PrinterName -ErrorAction SilentlyContinue
        if ($printer) {
            return @{
                Model = $printer.DriverName
                Location = $printer.Location
                Status = $printer.PrinterStatus
                PortName = $printer.PortName
                Shared = $printer.Shared
            }
        }
    }
    catch {
        Write-Log "Could not get printer info for: $PrinterName" "WARN"
    }
    
    return @{
        Model = "Unknown"
        Location = "Unknown"
        Status = "Unknown"
        PortName = "Unknown"
        Shared = $false
    }
}

# Startup
Write-Log "=== PrintMonitor Service Starting ===" "INFO"
Write-Log "Company: $($config.CompanyName)" "INFO"
Write-Log "Client ID: $($config.ClientId)" "INFO"
Write-Log "API Endpoint: $($config.ApiEndpoint)" "INFO"
Write-Log "Computer: $($env:COMPUTERNAME)" "INFO"
Write-Log "User: $($env:USERNAME)" "INFO"
Write-Log "Dashboard: $($config.DashboardUrl)" "INFO"

# Test initial connectivity
try {
    $testHeaders = @{
        "Authorization" = "Bearer $($config.ApiKey)"
        "X-Client-ID" = $config.ClientId
    }
    $healthCheck = Invoke-RestMethod -Uri "$($config.ApiEndpoint)/health" -Headers $testHeaders -TimeoutSec 10 -ErrorAction Stop
    Write-Log "✓ API connectivity verified" "SUCCESS"
} catch {
    Write-Log "⚠ API connectivity test failed: $($_.Exception.Message)" "WARN"
    Write-Log "  Service will continue and retry on print jobs" "INFO"
}

# Register for print job events
Write-Log "Registering for print job events..." "INFO"
Register-WmiEvent -Query "SELECT * FROM Win32_PrintJob" -Action {
    $job = $Event.SourceEventArgs.NewEvent
    $systemInfo = Get-SystemInfo
    $printerInfo = Get-PrinterInfo -PrinterName $job.Name
    
    # Determine color mode based on printer name/model
    $colorMode = "blackwhite"
    if ($printerInfo.Model -match "color|colour|pixma|inkjet") {
        $colorMode = "color"
    }
    
    # Calculate file size
    $fileSizeStr = "Unknown"
    if ($job.Size -and $job.Size -gt 0) {
        $fileSizeMB = [math]::Round($job.Size / 1MB, 2)
        $fileSizeStr = "$fileSizeMB MB"
    }
    
    $printData = @{
        fileName = $job.Document
        user = $systemInfo.SystemName
        systemName = $systemInfo.SystemName
        department = $systemInfo.Department
        printer = $job.Name
        printerModel = $printerInfo.Model
        printerLocation = $printerInfo.Location
        pages = if ($job.TotalPages -and $job.TotalPages -gt 0) { $job.TotalPages } else { 1 }
        status = if ($job.Status -eq "OK" -or $job.Status -eq $null -or $job.Status -eq "") { "success" } else { "failed" }
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
        fileSize = $fileSizeStr
        paperSize = "A4"
        colorMode = $colorMode
        actualUser = $systemInfo.UserName
        domain = $systemInfo.Domain
        clientId = $config.ClientId
        jobId = $job.JobId
        priority = $job.Priority
        submitTime = $job.TimeSubmitted
    }
    
    Write-Log "📄 Print job detected: $($printData.fileName) ($($printData.pages) pages) from $($printData.systemName) to $($printData.printer)" "INFO"
    
    $success = Send-PrintJobData -JobData $printData
    
    if ($success) {
        Write-Log "✓ Print job successfully processed" "SUCCESS"
    } else {
        Write-Log "✗ Failed to process print job" "ERROR"
    }
}

Write-Log "✓ Print monitoring is now active" "SUCCESS"
Write-Log "Dashboard available at: $($config.DashboardUrl)" "INFO"

# Keep the service running
try {
    while ($true) {
        Start-Sleep -Seconds 60
        # Periodic heartbeat
        $timestamp = Get-Date -Format "HH:mm:ss"
        Write-Log "💓 Service heartbeat - $timestamp" "DEBUG"
    }
}
catch {
    Write-Log "Service interrupted: $($_.Exception.Message)" "ERROR"
}
finally {
    Write-Log "=== PrintMonitor Service Stopped ===" "INFO"
}
'@

$monitorScript | Set-Content "$serviceDir\\PrintMonitor.ps1"
Write-Host "✓ Print monitoring script installed" -ForegroundColor Green

# Create start script
$startScript = @"
@echo off
echo Starting PrintMonitor for ${clientData.companyName}...
echo Dashboard: ${serverUrl}/?client=${clientData.clientId}
echo.
powershell.exe -ExecutionPolicy Bypass -File "C:\\PrintMonitor\\PrintMonitor.ps1"
"@

$startScript | Set-Content "$serviceDir\\Start_PrintMonitor.bat"
Write-Host "✓ Start script created: $serviceDir\\Start_PrintMonitor.bat" -ForegroundColor Green

# Set execution policy
Write-Host "Setting PowerShell execution policy..." -ForegroundColor Cyan
try {
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Write-Host "✓ PowerShell execution policy set" -ForegroundColor Green
} catch {
    Write-Host "⚠ Could not set execution policy automatically" -ForegroundColor Yellow
    Write-Host "  You may need to run: Set-ExecutionPolicy RemoteSigned" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Installation Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Installation Directory: $serviceDir" -ForegroundColor Cyan
Write-Host "📊 Dashboard URL: ${serverUrl}/?client=${clientData.clientId}" -ForegroundColor Cyan
Write-Host "📋 Configuration: $serviceDir\\config.json" -ForegroundColor Cyan
Write-Host "📜 Logs: $serviceDir\\logs\\printmonitor.log" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 To start monitoring:" -ForegroundColor Yellow
Write-Host "   Option 1: Double-click: $serviceDir\\Start_PrintMonitor.bat" -ForegroundColor White
Write-Host "   Option 2: Run PowerShell as Admin and execute: $serviceDir\\PrintMonitor.ps1" -ForegroundColor White
Write-Host ""
Write-Host "🧪 To test:" -ForegroundColor Yellow
Write-Host "   1. Start the monitoring service" -ForegroundColor White
Write-Host "   2. Print any document from any application" -ForegroundColor White
Write-Host "   3. Check dashboard: ${serverUrl}/?client=${clientData.clientId}" -ForegroundColor White
Write-Host "   4. Print job should appear within 30 seconds" -ForegroundColor White
Write-Host ""
Write-Host "📞 Support: Check dashboard for real-time status" -ForegroundColor Cyan
Write-Host ""

# Create desktop shortcut
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = "$desktopPath\\PrintMonitor Dashboard.url"
$shortcutContent = @"
[InternetShortcut]
URL=${serverUrl}/?client=${clientData.clientId}
IconFile=shell32.dll
IconIndex=13
"@
$shortcutContent | Set-Content $shortcutPath
Write-Host "✓ Desktop shortcut created: PrintMonitor Dashboard" -ForegroundColor Green

Write-Host ""
Write-Host "Installation completed successfully!" -ForegroundColor Green
Write-Host "You can now start monitoring print jobs." -ForegroundColor Green
pause
    `;

    const blob = new Blob([productionInstaller], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PrintMonitor_Production_Installer_${clientData.companyName.replace(/[^a-z0-9]/gi, '_')}.ps1`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const steps = [
    { number: 1, title: 'Company Info', description: 'Basic company details' },
    { number: 2, title: 'Subscription', description: 'Plan and requirements' },
    { number: 3, title: 'Technical Setup', description: 'API keys and configuration' },
    { number: 4, title: 'Installation Guide', description: 'How clients set up the system' },
    { number: 5, title: 'Complete', description: 'Review and finish' }
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              currentStep >= step.number
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {currentStep > step.number ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                step.number
              )}
            </div>
            <div className="mt-2 text-center">
              <p className={`text-sm font-medium ${
                currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step.title}
              </p>
              <p className="text-xs text-gray-400">{step.description}</p>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-16 h-0.5 mx-4 mt-5 ${
              currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Company Information</h3>
        <p className="text-gray-600">Let's start with basic information about your client</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name *
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              required
              value={clientData.companyName}
              onChange={(e) => setClientData({ ...clientData, companyName: e.target.value })}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter company name"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Address *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
            <textarea
              required
              value={clientData.address}
              onChange={(e) => setClientData({ ...clientData, address: e.target.value })}
              rows={3}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter full business address"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Contact Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              required
              value={clientData.contactName}
              onChange={(e) => setClientData({ ...clientData, contactName: e.target.value })}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contact person name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="email"
              required
              value={clientData.contactEmail}
              onChange={(e) => setClientData({ ...clientData, contactEmail: e.target.value })}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="admin@company.com"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Phone
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="tel"
              value={clientData.contactPhone}
              onChange={(e) => setClientData({ ...clientData, contactPhone: e.target.value })}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+1-555-0123"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Subscription & Requirements</h3>
        <p className="text-gray-600">Choose the plan and specify technical requirements</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Subscription Plan *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                id: 'basic',
                name: 'Basic',
                price: '$29/month',
                features: ['Up to 3 printers', 'Basic reporting', 'Email support'],
                color: 'border-gray-300'
              },
              {
                id: 'premium',
                name: 'Premium',
                price: '$79/month',
                features: ['Up to 10 printers', 'Advanced analytics', 'Priority support'],
                color: 'border-blue-500 ring-2 ring-blue-200'
              },
              {
                id: 'enterprise',
                name: 'Enterprise',
                price: '$199/month',
                features: ['Unlimited printers', 'Custom integrations', '24/7 support'],
                color: 'border-purple-500'
              }
            ].map((plan) => (
              <div
                key={plan.id}
                className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all ${
                  clientData.subscriptionPlan === plan.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setClientData({ ...clientData, subscriptionPlan: plan.id as any })}
              >
                {clientData.subscriptionPlan === plan.id && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                )}
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h4>
                <p className="text-2xl font-bold text-blue-600 mb-4">{plan.price}</p>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Printers *
            </label>
            <div className="relative">
              <Printer className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={clientData.printerCount}
                onChange={(e) => setClientData({ ...clientData, printerCount: parseInt(e.target.value) })}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>{num} printer{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Users *
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={clientData.estimatedUsers}
                onChange={(e) => setClientData({ ...clientData, estimatedUsers: parseInt(e.target.value) })}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                {[5, 10, 15, 20, 25, 30, 40, 50, 75, 100].map(num => (
                  <option key={num} value={num}>{num} users</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Subdomain
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={clientData.subdomain}
              onChange={(e) => setClientData({ ...clientData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
              className="w-full pl-11 pr-32 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="companyname"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              .printmonitor.com
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Leave blank to auto-generate from company name
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Key className="h-8 w-8 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Technical Configuration</h3>
        <p className="text-gray-600">Generated API keys and access credentials</p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-6 w-6 text-blue-600" />
          <h4 className="text-lg font-semibold text-gray-900">Security Credentials</h4>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          These credentials are automatically generated and should be kept secure. 
          They will be used to configure the Windows Print Listener.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client ID
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={clientData.clientId}
                readOnly
                className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg font-mono text-sm"
              />
              <button
                onClick={() => copyToClipboard(clientData.clientId, 'clientId')}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {copiedField === 'clientId' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={clientData.apiKey}
                readOnly
                className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg font-mono text-sm"
              />
              <button
                onClick={() => copyToClipboard(clientData.apiKey, 'apiKey')}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {copiedField === 'apiKey' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Dashboard URL
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={`${getServerUrl()}/?client=${clientData.clientId}`}
                readOnly
                className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm"
              />
              <button
                onClick={() => copyToClipboard(`${getServerUrl()}/?client=${clientData.clientId}`, 'url')}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {copiedField === 'url' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Endpoint
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={`${getServerUrl()}/api`}
                readOnly
                className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm"
              />
              <button
                onClick={() => copyToClipboard(`${getServerUrl()}/api`, 'endpoint')}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {copiedField === 'endpoint' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Server className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-green-900">Production Server Information</h4>
            <p className="text-sm text-green-800 mt-1">
              <strong>Server URL:</strong> {getServerUrl()}<br/>
              <strong>Network Access:</strong> Available on your local network<br/>
              <strong>Client Dashboard:</strong> {getServerUrl()}/?client={clientData.clientId}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-900">Security Notice</h4>
            <p className="text-sm text-yellow-800 mt-1">
              Store these credentials securely. The API key provides full access to the client's 
              print monitoring data and should never be shared publicly or stored in plain text.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Monitor className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Production Installation Guide</h3>
        <p className="text-gray-600">How the client will set up and use the system on your server</p>
      </div>

      <div className="space-y-6">
        {/* Server Information */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Server className="h-6 w-6 text-blue-600" />
            <h4 className="text-lg font-semibold text-gray-900">Production Server Details</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Server Information</h5>
              <div className="space-y-2 text-sm">
                <div><strong>Server URL:</strong> {getServerUrl()}</div>
                <div><strong>Network:</strong> Local Network Access</div>
                <div><strong>API Endpoint:</strong> {getServerUrl()}/api</div>
                <div><strong>Status:</strong> <span className="text-green-600">● Online</span></div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Client Access</h5>
              <div className="space-y-2 text-sm">
                <div><strong>Dashboard:</strong> {getServerUrl()}/?client={clientData.clientId}</div>
                <div><strong>Client ID:</strong> {clientData.clientId}</div>
                <div><strong>Company:</strong> {clientData.companyName}</div>
                <div><strong>Setup:</strong> <span className="text-blue-600">Ready</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Download Options */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Package className="h-6 w-6 text-green-600" />
            <h4 className="text-lg font-semibold text-gray-900">Production Installation Files</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Code className="h-6 w-6 text-blue-600" />
              </div>
              <h5 className="font-medium text-gray-900 mb-2">Production Installer</h5>
              <p className="text-sm text-gray-600 mb-3">Complete PowerShell installer for client computers</p>
              <button
                onClick={downloadProductionInstaller}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Download Installer
              </button>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h5 className="font-medium text-gray-900 mb-2">Setup Guide</h5>
              <p className="text-sm text-gray-600 mb-3">Complete installation instructions</p>
              <button
                onClick={downloadSetupGuide}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Download Guide
              </button>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <h5 className="font-medium text-gray-900 mb-2">Config File</h5>
              <p className="text-sm text-gray-600 mb-3">Pre-configured settings file</p>
              <button
                onClick={downloadInstallerConfig}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                Download Config
              </button>
            </div>
          </div>
        </div>

        {/* Installation Overview */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="h-6 w-6 text-blue-600" />
            <h4 className="text-lg font-semibold text-gray-900">Installation Process</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Download className="h-6 w-6 text-blue-600" />
              </div>
              <h5 className="font-medium text-gray-900 mb-2">1. Download Files</h5>
              <p className="text-sm text-gray-600">Client downloads the PowerShell installer and config files</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Monitor className="h-6 w-6 text-green-600" />
              </div>
              <h5 className="font-medium text-gray-900 mb-2">2. Install on Computers</h5>
              <p className="text-sm text-gray-600">Run installer as Administrator on each computer that will print</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <h5 className="font-medium text-gray-900 mb-2">3. Start Monitoring</h5>
              <p className="text-sm text-gray-600">Print jobs automatically captured and sent to your server</p>
            </div>
          </div>
        </div>

        {/* How Printer Mapping Works */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Network className="h-6 w-6 text-green-600" />
            <h4 className="text-lg font-semibold text-gray-900">How Printer Mapping Works</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 font-bold text-sm">1</span>
              </div>
              <div>
                <h5 className="font-medium text-gray-900">Automatic Discovery</h5>
                <p className="text-sm text-gray-600">When a user prints, the system automatically detects and adds the printer to your dashboard. No manual configuration needed!</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-bold text-sm">2</span>
              </div>
              <div>
                <h5 className="font-medium text-gray-900">Smart Department Detection</h5>
                <p className="text-sm text-gray-600">System detects department from computer names (e.g., FINANCE-PC-01 → Finance Department)</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-purple-600 font-bold text-sm">3</span>
              </div>
              <div>
                <h5 className="font-medium text-gray-900">Real-time Monitoring</h5>
                <p className="text-sm text-gray-600">All print jobs appear in your dashboard at {getServerUrl()} within 30 seconds of printing</p>
              </div>
            </div>
          </div>
        </div>

        {/* What Gets Captured */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-6 w-6 text-gray-600" />
            <h4 className="text-lg font-semibold text-gray-900">What Gets Captured</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'System name (computer)',
              'Document name & size',
              'Printer used',
              'Page count',
              'Date & time',
              'Department (auto-detected)',
              'User name',
              'Print status'
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-900">Important Notes for Client</h4>
              <ul className="text-sm text-yellow-800 mt-2 space-y-1">
                <li>• Install Print Listener on EVERY computer that will print</li>
                <li>• Run installer as Administrator</li>
                <li>• Ensure computers can reach your server at {getServerUrl()}</li>
                <li>• End users don't need to change how they print</li>
                <li>• Printers are discovered automatically when first used</li>
                <li>• Dashboard available at {getServerUrl()}/?client={clientData.clientId}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Setup Complete!</h3>
        <p className="text-gray-600">Review the configuration and download setup materials</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Client Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Company:</span>
            <span className="ml-2 text-gray-900">{clientData.companyName}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Contact:</span>
            <span className="ml-2 text-gray-900">{clientData.contactName}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Email:</span>
            <span className="ml-2 text-gray-900">{clientData.contactEmail}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Plan:</span>
            <span className="ml-2 text-gray-900 capitalize">{clientData.subscriptionPlan}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Printers:</span>
            <span className="ml-2 text-gray-900">{clientData.printerCount}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Users:</span>
            <span className="ml-2 text-gray-900">{clientData.estimatedUsers}</span>
          </div>
          <div className="md:col-span-2">
            <span className="font-medium text-gray-700">Server URL:</span>
            <span className="ml-2 text-blue-600">{getServerUrl()}</span>
          </div>
          <div className="md:col-span-2">
            <span className="font-medium text-gray-700">Client Dashboard:</span>
            <span className="ml-2 text-blue-600">{getServerUrl()}/?client={clientData.clientId}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>Download the complete setup guide with all configuration details</li>
          <li>Send the installer and credentials to the client's IT team</li>
          <li>Guide them through installing Print Listener on all computers</li>
          <li>Test with sample print jobs to verify data capture</li>
          <li>Monitor the dashboard at {getServerUrl()} for incoming print job data</li>
        </ol>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={downloadSetupGuide}
          className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <Download className="h-5 w-5" />
          <span>Download Setup Guide</span>
        </button>
        <button
          onClick={downloadInstallerConfig}
          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Settings className="h-5 w-5" />
          <span>Download Config File</span>
        </button>
        <button
          onClick={downloadProductionInstaller}
          className="inline-flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          <Package className="h-5 w-5" />
          <span>Download Production Installer</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Production Client Onboarding</h2>
            <p className="text-gray-600">Set up a new client for your PrintMonitor server at {getServerUrl()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="p-8">
          {renderStepIndicator()}

          <div className="min-h-[500px]">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
          </div>

          <div className="flex justify-between pt-8 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="inline-flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && (!clientData.companyName || !clientData.contactName || !clientData.contactEmail)) ||
                  (currentStep === 2 && !clientData.subscriptionPlan)
                }
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Complete Setup</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientOnboardingWizard;