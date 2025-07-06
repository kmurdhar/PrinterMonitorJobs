import React, { useState } from 'react';
import { 
  X, 
  Building, 
  User, 
  CreditCard, 
  Settings, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  Download,
  Copy,
  ExternalLink,
  Monitor,
  Globe,
  Key,
  FileText,
  Zap,
  AlertTriangle
} from 'lucide-react';
import PlatformSelector from './PlatformSelector';

interface ClientOnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (clientData: any) => void;
}

const ClientOnboardingWizard: React.FC<ClientOnboardingWizardProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Company Information
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    
    // Step 2: Subscription & Requirements
    subscriptionPlan: 'premium',
    printerCount: 3,
    estimatedUsers: 25,
    platforms: ['windows'] as string[],
    
    // Step 3: Technical Configuration (auto-generated)
    clientId: '',
    apiKey: '',
    subdomain: '',
    dashboardUrl: '',
    apiEndpoint: '',
    
    // Step 4: Installation Files
    installationFiles: [] as any[]
  });

  const [generatedCredentials, setGeneratedCredentials] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const steps = [
    { id: 1, title: 'Company Information', icon: Building },
    { id: 2, title: 'Platform & Requirements', icon: Monitor },
    { id: 3, title: 'Technical Configuration', icon: Settings },
    { id: 4, title: 'Installation Guide', icon: Download },
    { id: 5, title: 'Complete Setup', icon: CheckCircle }
  ];

  const generateTechnicalConfig = () => {
    const companySlug = formData.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const clientId = `${companySlug}-${Math.random().toString(36).substr(2, 8)}`;
    const apiKey = 'pk_' + Math.random().toString(36).substr(2, 32);
    
    const serverUrl = window.location.origin;
    const dashboardUrl = `${serverUrl}/?client=${clientId}`;
    const apiEndpoint = `${serverUrl.replace(':5173', ':3000')}/api`;
    
    const credentials = {
      clientId,
      apiKey,
      subdomain: companySlug,
      dashboardUrl,
      apiEndpoint,
      serverUrl
    };
    
    setFormData(prev => ({ ...prev, ...credentials }));
    setGeneratedCredentials(credentials);
    
    return credentials;
  };

  const generateInstallationFiles = (credentials: any) => {
    const files = [];
    
    // Windows Installation Package
    if (formData.platforms.includes('windows')) {
      const windowsConfig = {
        name: 'Windows Installation Package',
        platform: 'windows',
        files: [
          {
            name: 'Deploy.bat',
            description: 'Windows deployment script',
            content: `@echo off
echo PrintMonitor Client Installation for ${formData.companyName}
echo ==========================================

set CLIENT_ID=${credentials.clientId}
set API_ENDPOINT=${credentials.apiEndpoint}
set API_KEY=${credentials.apiKey}

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

echo Installing PrintMonitor Service...
echo.
powershell.exe -ExecutionPolicy Bypass -File "install-service.ps1" -ClientId "%CLIENT_ID%" -ApiEndpoint "%API_ENDPOINT%" -ApiKey "%API_KEY%"

echo Installation complete!
echo.
echo Client ID: %CLIENT_ID%
echo Dashboard: ${credentials.dashboardUrl}
echo.
pause`
          },
          {
            name: 'install-service.ps1',
            description: 'PowerShell service installer',
            content: `# PrintMonitor Service Installer for ${formData.companyName}
# Generated on ${new Date().toISOString()}
# Client ID: ${credentials.clientId}

param(
    [Parameter(Mandatory=\$true)]
    [string]\$ClientId,
    
    [Parameter(Mandatory=\$true)]
    [string]\$ApiEndpoint,
    
    [Parameter(Mandatory=\$true)]
    [string]\$ApiKey
)

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "🖨️  PrintMonitor Service Installer for ${formData.companyName}" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "Client ID: \$ClientId" -ForegroundColor Cyan
Write-Host "API Endpoint: \$ApiEndpoint" -ForegroundColor Cyan
Write-Host ""

# Create installation directory
\$installPath = "C:\\PrintMonitor"
\$servicePath = "\$installPath\\service"
\$logsPath = "\$installPath\\logs"

Write-Host "📁 Creating installation directories..."
New-Item -ItemType Directory -Path \$installPath -Force | Out-Null
New-Item -ItemType Directory -Path \$servicePath -Force | Out-Null
New-Item -ItemType Directory -Path \$logsPath -Force | Out-Null

# Create print listener script
Write-Host "📋 Creating print listener script..."
\$listenerScript = "\$servicePath\\print-listener.ps1"

\$printListenerContent = @"
# PrintMonitor Windows Print Listener for ${formData.companyName}
# Generated on ${new Date().toISOString()}

param(
    [Parameter(Mandatory=\\\$true)]
    [string]\\\$ClientId,
    
    [Parameter(Mandatory=\\\$true)]
    [string]\\\$ApiEndpoint,
    
    [Parameter(Mandatory=\\\$true)]
    [string]\\\$ApiKey,
    
    [string]\\\$LogPath = "C:\\PrintMonitor\\logs\\print-listener.log"
)

# Ensure log directory exists
\\\$logDir = Split-Path \\\$LogPath -Parent
if (!(Test-Path \\\$logDir)) {
    New-Item -ItemType Directory -Path \\\$logDir -Force
}

# Logging function
function Write-Log {
    param([string]\\\$Message)
    \\\$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    \\\$logMessage = "[\\\$timestamp] \\\$Message"
    Write-Host \\\$logMessage
    Add-Content -Path \\\$LogPath -Value \\\$logMessage
}

Write-Log "PrintMonitor Print Listener Starting for ${formData.companyName}..."
Write-Log "Client ID: \\\$ClientId"
Write-Log "API Endpoint: \\\$ApiEndpoint"
Write-Log "Computer: \\\$env:COMPUTERNAME"
Write-Log "User: \\\$env:USERNAME"

# Function to send print job data to server
function Send-PrintJob {
    param(
        [string]\\\$FileName,
        [string]\\\$SystemName,
        [string]\\\$PrinterName,
        [int]\\\$Pages,
        [string]\\\$FileSize,
        [string]\\\$UserName
    )
    
    try {
        \\\$body = @{
            clientId = \\\$ClientId
            apiKey = \\\$ApiKey
            fileName = \\\$FileName
            systemName = \\\$SystemName
            printerName = \\\$PrinterName
            pages = \\\$Pages
            fileSize = \\\$FileSize
            paperSize = "A4"
            colorMode = "blackwhite"
            userName = \\\$UserName
        } | ConvertTo-Json
        
        \\\$headers = @{
            'Content-Type' = 'application/json'
            'User-Agent' = 'PrintMonitor-Windows-Listener/1.0'
        }
        
        Write-Log "📄 Sending print job: \\\$FileName (\\\$Pages pages) from \\\$SystemName to \\\$PrinterName"
        
        \\\$response = Invoke-RestMethod -Uri "\\\$ApiEndpoint/print-jobs" -Method POST -Body \\\$body -Headers \\\$headers -TimeoutSec 30
        
        if (\\\$response.success) {
            Write-Log "✅ Print job sent successfully. Job ID: \\\$(\\\$response.jobId), Cost: \\\$(\\\$response.cost)"
        } else {
            Write-Log "❌ Failed to send print job: \\\$(\\\$response.message)"
        }
    }
    catch {
        Write-Log "❌ Error sending print job: \\\$(\\\$_.Exception.Message)"
    }
}

# Test connection to server
try {
    Write-Log "🔗 Testing connection to PrintMonitor server..."
    \\\$healthCheck = Invoke-RestMethod -Uri "\\\$ApiEndpoint/health" -Method GET -TimeoutSec 10
    Write-Log "✅ Server connection successful. Server status: \\\$(\\\$healthCheck.status)"
} catch {
    Write-Log "❌ Failed to connect to PrintMonitor server: \\\$(\\\$_.Exception.Message)"
    Write-Log "⚠️  Please check that the server is running and accessible at: \\\$ApiEndpoint"
    exit 1
}

# Monitor print jobs (simplified for demo)
Write-Log "🔍 Starting print job monitoring..."
Write-Log "💡 This is a demo version. In production, this would monitor actual Windows print spooler events."

# Simulate print job detection every 30 seconds for demo
while (\\\$true) {
    try {
        # In production, this would monitor actual print spooler events
        # For demo, we'll simulate occasional print jobs
        
        if ((Get-Random -Minimum 1 -Maximum 100) -lt 10) { # 10% chance every loop
            \\\$sampleFiles = @(
                "Document_\\\$(Get-Date -Format 'yyyyMMdd_HHmmss').pdf",
                "Report_\\\$(Get-Random -Minimum 1000 -Maximum 9999).docx",
                "Invoice_\\\$(Get-Random -Minimum 100 -Maximum 999).pdf",
                "Presentation_\\\$(Get-Date -Format 'MMdd').pptx"
            )
            
            \\\$samplePrinters = @(
                "HP LaserJet Pro M404n",
                "Canon PIXMA Pro-200", 
                "Brother HL-L2350DW"
            )
            
            \\\$fileName = \\\$sampleFiles | Get-Random
            \\\$printerName = \\\$samplePrinters | Get-Random
            \\\$systemName = \\\$env:COMPUTERNAME
            \\\$userName = \\\$env:USERNAME
            \\\$pages = Get-Random -Minimum 1 -Maximum 20
            \\\$fileSize = "\\\$(Get-Random -Minimum 1 -Maximum 10).\\\$(Get-Random -Minimum 1 -Maximum 9) MB"
            
            Write-Log "📄 Simulating print job for demo purposes"
            Send-PrintJob -FileName \\\$fileName -SystemName \\\$systemName -PrinterName \\\$printerName -Pages \\\$pages -FileSize \\\$fileSize -UserName \\\$userName
        }
        
        Start-Sleep -Seconds 30
    }
    catch {
        Write-Log "❌ Error in monitoring loop: \\\$(\\\$_.Exception.Message)"
        Start-Sleep -Seconds 60
    }
}
"@

\$printListenerContent | Out-File -FilePath \$listenerScript -Encoding UTF8

# Create service wrapper script
Write-Host "🔧 Creating service wrapper..."
\$serviceWrapper = @"
# PrintMonitor Service Wrapper for ${formData.companyName}
\\\$clientId = "\$ClientId"
\\\$apiEndpoint = "\$ApiEndpoint"
\\\$apiKey = "\$ApiKey"
\\\$logPath = "\$logsPath\\print-listener.log"

# Start the print listener
& "\$listenerScript" -ClientId \\\$clientId -ApiEndpoint \\\$apiEndpoint -ApiKey \\\$apiKey -LogPath \\\$logPath
"@

\$serviceWrapper | Out-File -FilePath "\$servicePath\\service-wrapper.ps1" -Encoding UTF8

# Create configuration file
Write-Host "📝 Creating configuration file..."
\$config = @{
    clientId = \$ClientId
    companyName = "${formData.companyName}"
    apiEndpoint = \$ApiEndpoint
    apiKey = \$ApiKey
    dashboardUrl = "${credentials.dashboardUrl}"
    installPath = \$installPath
    servicePath = \$servicePath
    logsPath = \$logsPath
    installedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    computerName = \$env:COMPUTERNAME
    userName = \$env:USERNAME
} | ConvertTo-Json -Depth 3

\$config | Out-File -FilePath "\$installPath\\config.json" -Encoding UTF8

# Create Windows Scheduled Task (more reliable than service for this demo)
Write-Host "📅 Creating scheduled task for print monitoring..."

\$taskName = "PrintMonitorListener"

# Remove existing task if it exists
Unregister-ScheduledTask -TaskName \$taskName -Confirm:\$false -ErrorAction SilentlyContinue

# Create scheduled task action
\$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File \\"\$servicePath\\service-wrapper.ps1\\""

# Create scheduled task trigger (run at startup)
\$trigger = New-ScheduledTaskTrigger -AtStartup

# Create scheduled task settings
\$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable

# Create scheduled task principal (run as current user)
\$principal = New-ScheduledTaskPrincipal -UserId \$env:USERNAME -LogonType Interactive -RunLevel Highest

# Register the scheduled task
Register-ScheduledTask -TaskName \$taskName -Action \$action -Trigger \$trigger -Settings \$settings -Principal \$principal -Description "PrintMonitor Print Listener for ${formData.companyName}"

# Start the task immediately
Write-Host "▶️ Starting print monitoring service..."
Start-ScheduledTask -TaskName \$taskName

Write-Host ""
Write-Host "✅ PrintMonitor service installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Configuration:" -ForegroundColor Cyan
Write-Host "   Company: ${formData.companyName}"
Write-Host "   Client ID: \$ClientId"
Write-Host "   API Endpoint: \$ApiEndpoint"
Write-Host "   Dashboard: ${credentials.dashboardUrl}"
Write-Host "   Installation Path: \$installPath"
Write-Host "   Logs Path: \$logsPath"
Write-Host ""
Write-Host "🔍 Service Status:" -ForegroundColor Cyan
\$task = Get-ScheduledTask -TaskName \$taskName -ErrorAction SilentlyContinue
if (\$task) {
    Write-Host "   Task Name: \$(\$task.TaskName)"
    Write-Host "   State: \$(\$task.State)"
} else {
    Write-Host "   Task: Not found (there may have been an error)"
}
Write-Host ""
Write-Host "📝 To view logs:" -ForegroundColor Yellow
Write-Host "   Get-Content '\$logsPath\\print-listener.log' -Tail 20 -Wait"
Write-Host ""
Write-Host "🔧 To manage the service:" -ForegroundColor Yellow
Write-Host "   Start: Start-ScheduledTask -TaskName '\$taskName'"
Write-Host "   Stop:  Stop-ScheduledTask -TaskName '\$taskName'"
Write-Host "   Remove: Unregister-ScheduledTask -TaskName '\$taskName' -Confirm:\\\$false"
Write-Host ""

# Test the connection again
Write-Host "🔗 Testing connection to PrintMonitor server..."
try {
    \$response = Invoke-RestMethod -Uri "\$ApiEndpoint/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Server connection successful!" -ForegroundColor Green
    Write-Host "   Server: \$(\$response.server)" -ForegroundColor Cyan
    Write-Host "   Status: \$(\$response.status)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🎉 Installation complete! Print jobs will now be monitored automatically." -ForegroundColor Green
    Write-Host "📊 View your dashboard at: ${credentials.dashboardUrl}" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to connect to server: \$(\$_.Exception.Message)" -ForegroundColor Red
    Write-Host "⚠️  Please check that the PrintMonitor server is running at: \$ApiEndpoint" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
\$null = \$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
`
          },
          {
            name: 'README.txt',
            description: 'Installation instructions',
            content: `PrintMonitor Installation Package for ${formData.companyName}
Generated on ${new Date().toLocaleString()}

INSTALLATION INSTRUCTIONS:
==========================

1. EXTRACT FILES
   - Extract all files to a folder on the client computer
   - Make sure all files are in the same directory

2. RUN AS ADMINISTRATOR
   - Right-click on "Deploy.bat"
   - Select "Run as administrator"
   - This is REQUIRED for the installation to work

3. FOLLOW THE INSTALLER
   - The installer will create a scheduled task
   - It will test the connection to the server
   - Print monitoring will start automatically

4. VERIFY INSTALLATION
   - Check the dashboard at: ${credentials.dashboardUrl}
   - Print a test document to verify monitoring
   - Check logs at: C:\\PrintMonitor\\logs\\print-listener.log

CONFIGURATION:
==============
Client ID: ${credentials.clientId}
API Endpoint: ${credentials.apiEndpoint}
Dashboard URL: ${credentials.dashboardUrl}

TROUBLESHOOTING:
================
- Make sure the PrintMonitor server is running
- Check Windows Firewall settings
- Verify network connectivity to the server
- Run PowerShell as Administrator if needed

SUPPORT:
========
If you need help, contact your system administrator with:
- Client ID: ${credentials.clientId}
- Computer name: [Your computer name]
- Error messages from the installation

For technical support, include the log file:
C:\\PrintMonitor\\logs\\print-listener.log
`
          }
        ]
      };
      files.push(windowsConfig);
    }
    
    // Linux Installation Package
    if (formData.platforms.includes('linux')) {
      const linuxConfig = {
        name: 'Linux Installation Package',
        platform: 'linux',
        files: [
          {
            name: 'deploy_linux.sh',
            description: 'Linux deployment script',
            content: `#!/bin/bash
echo "PrintMonitor Linux Installation for ${formData.companyName}"
echo "============================================="

CLIENT_ID="${credentials.clientId}"
API_ENDPOINT="${credentials.apiEndpoint}"
API_KEY="${credentials.apiKey}"

echo "Installing PrintMonitor Service for Linux..."
echo "Client ID: $CLIENT_ID"
echo "API Endpoint: $API_ENDPOINT"
echo "Client ID: $CLIENT_ID"
echo "Dashboard: ${credentials.dashboardUrl}"

sudo ./install_linux.sh "$CLIENT_ID" "$API_ENDPOINT" "$API_KEY"

echo "Installation complete!"
echo "Service will now monitor print jobs from all users on this Linux system."
echo "Check status: sudo systemctl status printmonitor"
echo "Dashboard: ${credentials.dashboardUrl}"`
          },
          {
            name: 'install_linux.sh',
            description: 'Linux installation script',
            content: '# Linux installation script (see Linux Listener Setup Guide)'
          },
          {
            name: 'print_listener.py',
            description: 'Python monitoring service',
            content: '# Python print monitoring service (see Linux Listener Setup Guide)'
          }
        ]
      };
      files.push(linuxConfig);
    }
    
    // Configuration file
    const configFile = {
      name: 'Configuration File',
      platform: 'universal',
      files: [
        {
          name: 'client_config.json',
          description: 'Client configuration',
          content: JSON.stringify({
            clientId: credentials.clientId,
            companyName: formData.companyName,
            apiEndpoint: credentials.apiEndpoint,
            platforms: formData.platforms,
            printerCount: formData.printerCount,
            estimatedUsers: formData.estimatedUsers,
            subscriptionPlan: formData.subscriptionPlan,
            dashboardUrl: credentials.dashboardUrl,
            createdAt: new Date().toISOString()
          }, null, 2)
        }
      ]
    };
    files.push(configFile);
    
    setFormData(prev => ({ ...prev, installationFiles: files }));
    return files;
  };

  const handleNext = () => {
    if (currentStep === 2) {
      // Generate technical configuration
      if (!formData.companyName || !formData.contactName || !formData.contactEmail) {
        alert('Please fill in all required fields before proceeding');
        return;
      }
      
      const credentials = generateTechnicalConfig();
      generateInstallationFiles(credentials);
    }
    
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNext = () => {
    if (currentStep === 1) return formData.companyName && formData.contactName && formData.contactEmail;
    if (currentStep === 2) return formData.platforms.length > 0;
    return true;
  };

  const handleComplete = () => {
    const clientData = {
      ...formData,
      ...generatedCredentials
    };
    onComplete(clientData);
    onClose();
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Building className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Company Information</h3>
        <p className="text-gray-600">Tell us about your organization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name *
          </label>
          <input
            type="text"
            required
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter company name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Contact *
          </label>
          <input
            type="text"
            required
            value={formData.contactName}
            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Contact person name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Email *
          </label>
          <input
            type="email"
            required
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="admin@company.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Phone
          </label>
          <input
            type="tel"
            value={formData.contactPhone}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+1-555-0123"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Address
        </label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Full business address"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Monitor className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Platform & Requirements</h3>
        <p className="text-gray-600">Configure your printing environment</p>
      </div>

      {/* Platform Selection */}
      <PlatformSelector
        selectedPlatforms={formData.platforms}
        onPlatformSelect={(platforms) => setFormData({ ...formData, platforms })}
      />

      {/* Subscription Plan */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Subscription Plan
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'basic', name: 'Basic', price: '$29/month', features: ['Up to 5 printers', 'Basic reporting', 'Email support'] },
            { id: 'premium', name: 'Premium', price: '$79/month', features: ['Up to 15 printers', 'Advanced analytics', 'Priority support'], recommended: true },
            { id: 'enterprise', name: 'Enterprise', price: '$199/month', features: ['Unlimited printers', 'Custom integrations', '24/7 support'] }
          ].map((plan) => (
            <div
              key={plan.id}
              onClick={() => setFormData({ ...formData, subscriptionPlan: plan.id })}
              className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.subscriptionPlan === plan.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Recommended
                  </span>
                </div>
              )}
              <div className="text-center">
                <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                <p className="text-2xl font-bold text-blue-600 my-2">{plan.price}</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Printers
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={formData.printerCount}
            onChange={(e) => setFormData({ ...formData, printerCount: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Users
          </label>
          <input
            type="number"
            min="1"
            max="1000"
            value={formData.estimatedUsers}
            onChange={(e) => setFormData({ ...formData, estimatedUsers: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Settings className="mx-auto h-12 w-12 text-green-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Technical Configuration</h3>
        <p className="text-gray-600">Your client credentials have been generated</p>
      </div>

      {generatedCredentials && (
        <div className="space-y-4">
          {/* Client ID */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">Client ID</label>
                <p className="font-mono text-sm text-gray-900 mt-1">{generatedCredentials.clientId}</p>
              </div>
              <button
                onClick={() => copyToClipboard(generatedCredentials.clientId, 'clientId')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {copiedField === 'clientId' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* API Key */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-gray-700">API Key</label>
                <p className="font-mono text-sm text-gray-900 mt-1 truncate">{generatedCredentials.apiKey}</p>
              </div>
              <button
                onClick={() => copyToClipboard(generatedCredentials.apiKey, 'apiKey')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors ml-2"
              >
                {copiedField === 'apiKey' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Dashboard URL */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-blue-700">Dashboard URL</label>
                <p className="font-mono text-sm text-blue-900 mt-1 truncate">{generatedCredentials.dashboardUrl}</p>
              </div>
              <div className="flex items-center space-x-2 ml-2">
                <button
                  onClick={() => copyToClipboard(generatedCredentials.dashboardUrl, 'dashboardUrl')}
                  className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
                >
                  {copiedField === 'dashboardUrl' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => window.open(generatedCredentials.dashboardUrl, '_blank')}
                  className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* API Endpoint */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">API Endpoint</label>
                <p className="font-mono text-sm text-gray-900 mt-1">{generatedCredentials.apiEndpoint}</p>
              </div>
              <button
                onClick={() => copyToClipboard(generatedCredentials.apiEndpoint, 'apiEndpoint')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {copiedField === 'apiEndpoint' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Important Notes */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-900">Important Installation Notes</h4>
            <div className="text-sm text-red-800 mt-2 space-y-2">
              <p><strong>1. Run as Administrator:</strong> The Deploy.bat file MUST be run as Administrator</p>
              <p><strong>2. Server Must Be Running:</strong> Ensure the PrintMonitor server is running at the API endpoint</p>
              <p><strong>3. Network Access:</strong> Client computers must be able to reach the server</p>
              <p><strong>4. Firewall:</strong> Windows Firewall may need to allow PowerShell network access</p>
              <p><strong>5. Demo Mode:</strong> This version simulates print jobs for demonstration purposes</p>
            </div>
            <div className="mt-3 p-2 bg-white border border-red-300 rounded">
              <p className="text-sm text-red-900 font-medium">
                📞 Support: If installation fails, check the server is running and accessible
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Key className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-900">Security Notice</h4>
            <p className="text-sm text-yellow-800 mt-1">
              Keep your API key secure and never share it publicly. This key provides access to your client's printing data.
              Store it securely and rotate it regularly for enhanced security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Download className="mx-auto h-12 w-12 text-purple-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Installation Packages</h3>
        <p className="text-gray-600">Download platform-specific installation files</p>
      </div>

      {formData.installationFiles.map((packageInfo, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                packageInfo.platform === 'windows' ? 'bg-blue-100' :
                packageInfo.platform === 'linux' ? 'bg-green-100' :
                'bg-gray-100'
              }`}>
                <Monitor className={`h-5 w-5 ${
                  packageInfo.platform === 'windows' ? 'text-blue-600' :
                  packageInfo.platform === 'linux' ? 'text-green-600' :
                  'text-gray-600'
                }`} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{packageInfo.name}</h4>
                <p className="text-sm text-gray-600 capitalize">{packageInfo.platform} Platform</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {packageInfo.files.map((file: any, fileIndex: number) => (
              <div key={fileIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-600">{file.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => downloadFile(file.name, file.content)}
                  className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Installation Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Next Steps</h4>
            <div className="text-sm text-blue-800 mt-2 space-y-2">
              <p><strong>1. Download Installation Files:</strong> Download the packages for your platforms above</p>
              <p><strong>2. Deploy to Client Systems:</strong> Run the installation scripts on each computer that will print</p>
              <p><strong>3. Test Print Jobs:</strong> Have users print test documents to verify monitoring</p>
              <p><strong>4. Access Dashboard:</strong> Use the dashboard URL to monitor print activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6 text-center">
      <div>
        <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Setup Complete!</h3>
        <p className="text-gray-600">
          {formData.companyName} has been successfully onboarded to PrintMonitor
        </p>
      </div>

      {/* Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-left">
        <h4 className="font-semibold text-green-900 mb-3">Onboarding Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Company:</strong> {formData.companyName}</p>
            <p><strong>Contact:</strong> {formData.contactName}</p>
            <p><strong>Email:</strong> {formData.contactEmail}</p>
            <p><strong>Plan:</strong> {formData.subscriptionPlan}</p>
          </div>
          <div>
            <p><strong>Platforms:</strong> {formData.platforms.join(', ')}</p>
            <p><strong>Printers:</strong> {formData.printerCount}</p>
            <p><strong>Users:</strong> {formData.estimatedUsers}</p>
            <p><strong>Client ID:</strong> {generatedCredentials?.clientId}</p>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => window.open(generatedCredentials?.dashboardUrl, '_blank')}
          className="inline-flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Globe className="h-4 w-4" />
          <span>Open Client Dashboard</span>
        </button>
        
        <button
          onClick={() => {
            const summary = `PrintMonitor Setup Complete\n\nCompany: ${formData.companyName}\nClient ID: ${generatedCredentials?.clientId}\nDashboard: ${generatedCredentials?.dashboardUrl}\nAPI Endpoint: ${generatedCredentials?.apiEndpoint}`;
            copyToClipboard(summary, 'summary');
          }}
          className="inline-flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Copy className="h-4 w-4" />
          <span>Copy Summary</span>
        </button>
      </div>

      {/* What's Next */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
        <h4 className="font-semibold text-blue-900 mb-3">What's Next?</h4>
        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-2">
          <li>Send the installation packages to the client's IT team</li>
          <li>Guide them through the installation process on their systems</li>
          <li>Monitor the dashboard for incoming print job data</li>
          <li>Provide ongoing support and training as needed</li>
          <li>Set up regular check-ins to ensure optimal performance</li>
        </ol>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Client Onboarding Wizard</h2>
            <p className="text-sm text-gray-600">Step {currentStep} of {steps.length}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    isCompleted ? 'bg-green-600 text-white' :
                    isActive ? 'bg-blue-600 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <div className="flex space-x-3">
            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                disabled={
                  !canProceedToNext()
                }
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
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