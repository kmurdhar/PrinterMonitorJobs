import React, { useState } from 'react';
import { X, Printer, MapPin, Wifi, Building, Hash, Calendar, Monitor, AlertCircle, CheckCircle, Globe } from 'lucide-react';

interface AddPrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPrinter: (printer: any) => void;
  selectedClient: string;
}

const AddPrinterModal: React.FC<AddPrinterModalProps> = ({ isOpen, onClose, onAddPrinter, selectedClient }) => {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    location: '',
    department: '',
    ipAddress: '',
    serialNumber: ''
  });

  if (!isOpen) return null;

  const isOverallView = selectedClient === 'overall';
  const serverUrl = window.location.origin;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPrinter = {
      id: `printer-${Date.now()}`,
      ...formData,
      status: 'offline' as const,
      paperLevel: 100,
      tonerLevel: 100,
      jobsToday: 0,
      lastActivity: new Date(),
      clientId: selectedClient === 'overall' ? 'default-client' : selectedClient,
      installDate: new Date()
    };
    onAddPrinter(newPrinter);
    setFormData({
      name: '',
      model: '',
      location: '',
      department: '',
      ipAddress: '',
      serialNumber: ''
    });
    onClose();
  };

  const generateIPAddress = () => {
    const ip = `192.168.1.${Math.floor(Math.random() * 254) + 1}`;
    setFormData({ ...formData, ipAddress: ip });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Printer className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isOverallView ? 'Add Printer (Admin)' : 'Add Client Printer'}
              </h2>
              <p className="text-sm text-gray-600">
                {isOverallView 
                  ? 'Add a printer for any client (admin view)'
                  : 'Add a printer for this specific client'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Client-Printer Relationship Explanation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Building className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">How Printer-Client Mapping Works</h4>
                <div className="text-sm text-blue-800 mt-2 space-y-1">
                  <p><strong>🔄 Automatic Discovery:</strong> Printers are usually auto-discovered when users print</p>
                  <p><strong>🏢 Client Isolation:</strong> Each printer belongs to exactly one client</p>
                  <p><strong>📍 Manual Addition:</strong> Use this form to pre-configure printers before first use</p>
                  {!isOverallView && (
                    <p><strong>🎯 Current Client:</strong> This printer will be assigned to the selected client</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Production Setup Instructions */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Globe className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-green-900">Production Setup Process</h4>
                <div className="text-sm text-green-800 mt-2">
                  <ol className="list-decimal list-inside space-y-1">
                    <li><strong>Client installs Print Listener</strong> on their computers</li>
                    <li><strong>Users print normally</strong> - no changes needed</li>
                    <li><strong>Printers auto-discovered</strong> when first print job occurs</li>
                    <li><strong>Manual addition optional</strong> for pre-configuration</li>
                  </ol>
                  <p className="mt-2 font-medium">
                    🌐 Server: <span className="font-mono">{serverUrl}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Printer Name *
                </label>
                <div className="relative">
                  <Printer className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Office-Printer-01, HP-LaserJet-Reception"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use descriptive names like: ClientName-Printer-01
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Printer Model *
                </label>
                <div className="relative">
                  <Monitor className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Select Model</option>
                    <option value="HP LaserJet Pro M404n">HP LaserJet Pro M404n</option>
                    <option value="Canon PIXMA Pro-200">Canon PIXMA Pro-200</option>
                    <option value="Brother HL-L2350DW">Brother HL-L2350DW</option>
                    <option value="Epson WorkForce Pro WF-3720">Epson WorkForce Pro WF-3720</option>
                    <option value="HP OfficeJet Pro 9015e">HP OfficeJet Pro 9015e</option>
                    <option value="Canon imageCLASS MF445dw">Canon imageCLASS MF445dw</option>
                    <option value="Brother MFC-L3770CDW">Brother MFC-L3770CDW</option>
                    <option value="Xerox VersaLink C405">Xerox VersaLink C405</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Physical Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Reception Area, Floor 2, Conference Room"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Where is this printer physically located?
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Select Department</option>
                    <option value="Administration">Administration</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                    <option value="IT">IT</option>
                    <option value="HR">Human Resources</option>
                    <option value="Sales">Sales</option>
                    <option value="Legal">Legal</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Which department primarily uses this printer?
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IP Address *
                </label>
                <div className="relative">
                  <Wifi className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    required
                    value={formData.ipAddress}
                    onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="192.168.1.100"
                    pattern="^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
                  />
                  <button
                    type="button"
                    onClick={generateIPAddress}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Auto
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Network IP address for printer monitoring
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serial Number
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Optional serial number"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  For asset tracking and warranty management
                </p>
              </div>
            </div>

            {/* Client Assignment Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-900">Client Assignment</h4>
                  <div className="text-sm text-yellow-800 mt-1">
                    {isOverallView ? (
                      <p>
                        <strong>Admin Mode:</strong> This printer will be assigned to the default client. 
                        To assign to a specific client, select the client first from the client selector.
                      </p>
                    ) : (
                      <p>
                        <strong>Client Mode:</strong> This printer will be automatically assigned to the currently selected client. 
                        Only this client will see and manage this printer.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Setup Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Next Steps After Adding Printer</h4>
                  <div className="text-sm text-blue-800 mt-2">
                    <ol className="list-decimal list-inside space-y-1">
                      <li><strong>Install Print Listener</strong> on computers that will use this printer</li>
                      <li><strong>Configure network access</strong> to ensure printer is reachable</li>
                      <li><strong>Test print job</strong> to verify monitoring is working</li>
                      <li><strong>Monitor status</strong> - printer will show "offline" until first print job</li>
                    </ol>
                    <div className="mt-3 p-2 bg-white border border-blue-300 rounded">
                      <p className="font-medium text-blue-900">
                        🔗 Print Listener connects to: <span className="font-mono">{serverUrl}/api</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Add Printer</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPrinterModal;