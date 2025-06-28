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
  Check
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
    setCurrentStep(prev => Math.min(prev + 1, 4));
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
    const setupGuide = `
# Client Setup Guide - ${clientData.companyName}

## Client Information
- Company: ${clientData.companyName}
- Client ID: ${clientData.clientId}
- Subdomain: ${clientData.subdomain}.printmonitor.com
- Subscription: ${clientData.subscriptionPlan}

## API Configuration
- API Key: ${clientData.apiKey}
- API Endpoint: https://printmonitor.com/api
- Client Access URL: https://${clientData.subdomain}.printmonitor.com

## Windows Listener Installation
1. Download the PrintMonitor installer
2. Run as Administrator
3. Use the following configuration:
   - Client ID: ${clientData.clientId}
   - API Key: ${clientData.apiKey}
   - API Endpoint: https://printmonitor.com/api

## Next Steps
1. Install Windows Print Listener on client machines
2. Configure ${clientData.printerCount} printers in the system
3. Set up user accounts for ${clientData.estimatedUsers} users
4. Test print job monitoring

For support, contact: support@printmonitor.com
    `;

    const blob = new Blob([setupGuide], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${clientData.companyName.replace(/[^a-z0-9]/gi, '_')}_setup_guide.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const steps = [
    { number: 1, title: 'Company Info', description: 'Basic company details' },
    { number: 2, title: 'Subscription', description: 'Plan and requirements' },
    { number: 3, title: 'Technical Setup', description: 'API keys and configuration' },
    { number: 4, title: 'Complete', description: 'Review and finish' }
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
              Client Access URL
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={`https://${clientData.subdomain}.printmonitor.com`}
                readOnly
                className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm"
              />
              <button
                onClick={() => copyToClipboard(`https://${clientData.subdomain}.printmonitor.com`, 'url')}
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
                value="https://printmonitor.com/api"
                readOnly
                className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm"
              />
              <button
                onClick={() => copyToClipboard('https://printmonitor.com/api', 'endpoint')}
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
            <span className="font-medium text-gray-700">Access URL:</span>
            <span className="ml-2 text-blue-600">{clientData.subdomain}.printmonitor.com</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>Download the setup guide with all configuration details</li>
          <li>Install the Windows Print Listener on client machines</li>
          <li>Configure {clientData.printerCount} printers in the system</li>
          <li>Set up user accounts for the client's team</li>
          <li>Test print job monitoring and verify data flow</li>
        </ol>
      </div>

      <div className="flex justify-center">
        <button
          onClick={downloadSetupGuide}
          className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <Download className="h-5 w-5" />
          <span>Download Setup Guide</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Client Onboarding</h2>
            <p className="text-gray-600">Set up a new client for printer monitoring</p>
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

            {currentStep < 4 ? (
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