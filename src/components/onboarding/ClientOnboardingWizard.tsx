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
  Zap
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
    const apiKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const serverUrl = window.location.origin;
    const dashboardUrl = `${serverUrl}/?client=${clientId}`;
    const apiEndpoint = `${serverUrl}/api`;
    
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
echo PrintMonitor Installation for ${formData.companyName}
echo ==========================================

set CLIENT_ID=${credentials.clientId}
set API_ENDPOINT=${credentials.apiEndpoint}
set API_KEY=${credentials.apiKey}

echo Installing PrintMonitor Service...
powershell.exe -ExecutionPolicy Bypass -File "InstallService.ps1" -ClientId "%CLIENT_ID%" -ApiEndpoint "%API_ENDPOINT%" -ApiKey "%API_KEY%"

echo Installation complete!
echo.
echo Client ID: %CLIENT_ID%
echo Dashboard: ${credentials.dashboardUrl}
echo.
pause`
          },
          {
            name: 'InstallService.ps1',
            description: 'PowerShell service installer',
            content: '# PowerShell installation script (see Windows Listener Setup Guide)'
          },
          {
            name: 'PrintListener.ps1',
            description: 'Print monitoring script',
            content: '# Print monitoring PowerShell script (see Windows Listener Setup Guide)'
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
echo "PrintMonitor Installation for ${formData.companyName}"
echo "============================================="

CLIENT_ID="${credentials.clientId}"
API_ENDPOINT="${credentials.apiEndpoint}"
API_KEY="${credentials.apiKey}"

echo "Installing PrintMonitor Service for Linux..."
echo "Client ID: $CLIENT_ID"
echo "Dashboard: ${credentials.dashboardUrl}"

sudo ./install_linux.sh "$CLIENT_ID" "$API_ENDPOINT" "$API_KEY"

echo "Installation complete!"
echo "Service will now monitor print jobs from all users on this Linux system."
echo "Check status: sudo systemctl status printmonitor"`
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
            dashboardUrl: credentials.dashboardUrl,
            platforms: formData.platforms,
            printerCount: formData.printerCount,
            estimatedUsers: formData.estimatedUsers,
            subscriptionPlan: formData.subscriptionPlan,
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
                  (currentStep === 1 && (!formData.companyName || !formData.contactName || !formData.contactEmail)) ||
                  (currentStep === 2 && formData.platforms.length === 0)
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