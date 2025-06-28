import React, { useState } from 'react';
import { X, User, Building, Mail, Shield, Upload, Download, FileText } from 'lucide-react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (user: any) => void;
  selectedClient: string;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onAddUser, selectedClient }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    role: 'user'
  });
  const [importMode, setImportMode] = useState(false);
  const [csvData, setCsvData] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = {
      id: `user-${Date.now()}`,
      ...formData,
      jobsToday: 0,
      pagesTotal: 0,
      costTotal: 0,
      lastActivity: new Date(),
      clientId: selectedClient === 'overall' ? 'default-client' : selectedClient
    };
    onAddUser(newUser);
    setFormData({ name: '', email: '', department: '', role: 'user' });
    onClose();
  };

  const handleImport = () => {
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const user = {
        id: `user-${Date.now()}-${i}`,
        name: values[0] || '',
        email: values[1] || '',
        department: values[2] || '',
        role: values[3] || 'user',
        jobsToday: 0,
        pagesTotal: 0,
        costTotal: 0,
        lastActivity: new Date(),
        clientId: selectedClient === 'overall' ? 'default-client' : selectedClient
      };
      onAddUser(user);
    }
    setCsvData('');
    setImportMode(false);
    onClose();
  };

  const downloadTemplate = () => {
    const template = 'Name,Email,Department,Role\nJohn Doe,john.doe@company.com,Finance,user\nJane Smith,jane.smith@company.com,Marketing,admin';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {importMode ? 'Import Users' : 'Add New User'}
              </h2>
              <p className="text-sm text-gray-600">
                {importMode ? 'Import multiple users from CSV' : 'Add a single user to the system'}
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
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setImportMode(false)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                !importMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <User className="h-4 w-4 inline mr-2" />
              Single User
            </button>
            <button
              onClick={() => setImportMode(true)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                importMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Upload className="h-4 w-4 inline mr-2" />
              Import CSV
            </button>
          </div>

          {!importMode ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email address"
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
                    Role
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      <option value="user">User</option>
                      <option value="admin">Administrator</option>
                      <option value="manager">Manager</option>
                    </select>
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
                  Add User
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">CSV Format Requirements</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      Your CSV file should have columns: Name, Email, Department, Role
                    </p>
                    <button
                      onClick={downloadTemplate}
                      className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 mt-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Template</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CSV Data
                </label>
                <textarea
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Name,Email,Department,Role&#10;John Doe,john.doe@company.com,Finance,user&#10;Jane Smith,jane.smith@company.com,Marketing,admin"
                />
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
                  onClick={handleImport}
                  disabled={!csvData.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import Users
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;