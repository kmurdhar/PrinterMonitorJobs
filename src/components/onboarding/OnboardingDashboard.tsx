import React, { useState } from 'react';
import { 
  Plus, 
  Building, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Download,
  Calendar,
  TrendingUp,
  X,
  Mail,
  Phone,
  MapPin,
  CreditCard
} from 'lucide-react';
import ClientOnboardingWizard from './ClientOnboardingWizard';
import { Client } from '../../types';

interface OnboardingClient {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  subscriptionPlan: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  createdAt: Date;
  printerCount: number;
  estimatedUsers: number;
  subdomain: string;
  progress: number;
  clientId?: string;
  apiKey?: string;
}

interface ViewClientModalProps {
  client: OnboardingClient | null;
  isOpen: boolean;
  onClose: () => void;
}

interface OnboardingDashboardProps {
  onClientsChange?: (clients: Client[]) => void;
}

const ViewClientModal: React.FC<ViewClientModalProps> = ({ client, isOpen, onClose }) => {
  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{client.companyName}</h2>
              <p className="text-sm text-gray-600">Client Details & Configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Banner */}
          <div className={`p-4 rounded-lg border ${
            client.status === 'completed' ? 'bg-green-50 border-green-200' :
            client.status === 'in-progress' ? 'bg-blue-50 border-blue-200' :
            client.status === 'failed' ? 'bg-red-50 border-red-200' :
            'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {client.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-600" />}
                {client.status === 'in-progress' && <Clock className="h-5 w-5 text-blue-600" />}
                {client.status === 'failed' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                {client.status === 'pending' && <Clock className="h-5 w-5 text-yellow-600" />}
                <span className="font-medium capitalize">{client.status.replace('-', ' ')} Setup</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{client.progress}% Complete</div>
                <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className={`h-2 rounded-full ${
                      client.progress === 100 ? 'bg-green-500' :
                      client.progress >= 50 ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`}
                    style={{ width: `${client.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Building className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Company Name</p>
                  <p className="font-medium text-gray-900">{client.companyName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Contact Person</p>
                  <p className="font-medium text-gray-900">{client.contactName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{client.contactEmail}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Subscription Plan</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    client.subscriptionPlan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                    client.subscriptionPlan === 'premium' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {client.subscriptionPlan}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Configuration */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Access URL</p>
                <p className="font-mono text-sm text-blue-600">{client.subdomain}.printmonitor.com</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Printers</p>
                <p className="font-medium text-gray-900">{client.printerCount} configured</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estimated Users</p>
                <p className="font-medium text-gray-900">{client.estimatedUsers} users</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium text-gray-900">{client.createdAt.toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* API Credentials (if available) */}
          {client.clientId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">API Credentials</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Client ID</p>
                  <p className="font-mono text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                    {client.clientId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">API Endpoint</p>
                  <p className="font-mono text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                    https://printmonitor.com/api
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          {client.status !== 'completed' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Next Steps</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {client.progress < 50 && <li>Complete technical configuration</li>}
                {client.progress < 75 && <li>Install Windows Print Listener</li>}
                {client.progress < 100 && <li>Configure printers and test connectivity</li>}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Edit Client
          </button>
        </div>
      </div>
    </div>
  );
};

const OnboardingDashboard: React.FC<OnboardingDashboardProps> = ({ onClientsChange }) => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedClient, setSelectedClient] = useState<OnboardingClient | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  // Start with empty onboarding clients array
  const [onboardingClients, setOnboardingClients] = useState<OnboardingClient[]>([]);

  const handleCompleteOnboarding = (clientData: any) => {
    const newClient: OnboardingClient = {
      id: Date.now().toString(),
      companyName: clientData.companyName,
      contactName: clientData.contactName,
      contactEmail: clientData.contactEmail,
      contactPhone: clientData.contactPhone,
      address: clientData.address,
      subscriptionPlan: clientData.subscriptionPlan,
      status: 'pending',
      createdAt: new Date(),
      printerCount: clientData.printerCount,
      estimatedUsers: clientData.estimatedUsers,
      subdomain: clientData.subdomain,
      progress: 25,
      clientId: clientData.clientId,
      apiKey: clientData.apiKey
    };

    setOnboardingClients(prev => [newClient, ...prev]);

    // Also update the main clients list if callback is provided
    if (onClientsChange) {
      const mainClient: Client = {
        id: clientData.clientId,
        name: clientData.companyName,
        address: clientData.address,
        contactEmail: clientData.contactEmail,
        contactPhone: clientData.contactPhone,
        subscriptionPlan: clientData.subscriptionPlan,
        isActive: true,
        createdAt: new Date(),
        printerCount: clientData.printerCount,
        userCount: 0
      };
      // This would need to be implemented to update the main clients list
      // onClientsChange([...existingClients, mainClient]);
    }
  };

  const handleViewClient = (client: OnboardingClient) => {
    setSelectedClient(client);
    setIsViewModalOpen(true);
  };

  const handleEditClient = (client: OnboardingClient) => {
    // TODO: Implement edit functionality
    alert(`Edit functionality for ${client.companyName} will be implemented`);
  };

  const handleDeleteClient = (clientId: string) => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      setOnboardingClients(prev => prev.filter(client => client.id !== clientId));
    }
  };

  const handleExportData = () => {
    const csvContent = [
      ['Company', 'Contact', 'Email', 'Plan', 'Status', 'Progress', 'Created'],
      ...filteredClients.map(client => [
        client.companyName,
        client.contactName,
        client.contactEmail,
        client.subscriptionPlan,
        client.status,
        `${client.progress}%`,
        client.createdAt.toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onboarding_clients_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredClients = onboardingClients.filter(client => {
    const matchesSearch = client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'in-progress':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
  };

  const stats = {
    totalClients: onboardingClients.length,
    completedClients: onboardingClients.filter(c => c.status === 'completed').length,
    inProgressClients: onboardingClients.filter(c => c.status === 'in-progress').length,
    pendingClients: onboardingClients.filter(c => c.status === 'pending').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Onboarding</h1>
          <p className="text-gray-600">Manage and track client onboarding progress</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportData}
            className="inline-flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setIsWizardOpen(true)}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="h-5 w-5" />
            <span>Onboard New Client</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalClients}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.completedClients}</p>
              <p className="text-xs text-green-600 mt-1">
                {stats.totalClients > 0 ? Math.round((stats.completedClients / stats.totalClients) * 100) : 0}% success rate
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgressClients}</p>
              <p className="text-xs text-blue-600 mt-1">Active setups</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingClients}</p>
              <p className="text-xs text-yellow-600 mt-1">Awaiting setup</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by company, contact, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Clients Onboarded Yet</h3>
        <p className="text-gray-600 mb-6">
          Start by onboarding your first client to begin monitoring their printing infrastructure.
        </p>
        <button
          onClick={() => setIsWizardOpen(true)}
          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          <span>Onboard First Client</span>
        </button>
      </div>

      <ClientOnboardingWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={handleCompleteOnboarding}
      />

      <ViewClientModal
        client={selectedClient}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedClient(null);
        }}
      />
    </div>
  );
};

export default OnboardingDashboard;