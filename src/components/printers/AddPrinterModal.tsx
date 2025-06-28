import React, { useState } from 'react';
import { X, Printer, MapPin, Wifi, Building, Hash, Calendar, Monitor } from 'lucide-react';

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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Printer className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add New Printer</h2>
              <p className="text-sm text-gray-600">Configure a new printer for monitoring</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                  placeholder="e.g., Office-Printer-01"
                />
              </div>
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
                Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Reception Area, Floor 2"
                />
              </div>
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
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Setup Instructions</h4>
                <p className="text-sm text-blue-800 mt-1">
                  After adding the printer, install the Windows Print Listener on machines that will use this printer. 
                  The printer will show as "offline" until the first print job is detected.
                </p>
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
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add Printer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPrinterModal;