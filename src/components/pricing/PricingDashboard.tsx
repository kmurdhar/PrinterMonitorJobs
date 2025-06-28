import React, { useState } from 'react';
import { 
  Plus, 
  DollarSign, 
  Edit, 
  Trash2, 
  Copy, 
  Search, 
  Filter,
  Calculator,
  TrendingUp,
  Users,
  Building,
  FileText,
  Settings,
  Save,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';
import { PricingConfig, Client } from '../../types';
import PricingConfigModal from './PricingConfigModal';

interface PricingDashboardProps {
  clients: Client[];
  selectedClient: string;
}

const PricingDashboard: React.FC<PricingDashboardProps> = ({ clients, selectedClient }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<PricingConfig | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Start with empty pricing configurations
  const [pricingConfigs, setPricingConfigs] = useState<PricingConfig[]>([]);

  const isOverallView = selectedClient === 'overall';
  const currentClient = clients.find(c => c.id === selectedClient);
  
  const filteredConfigs = isOverallView 
    ? pricingConfigs.filter(config => 
        config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clients.find(c => c.id === config.clientId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : pricingConfigs.filter(config => 
        config.clientId === selectedClient &&
        config.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const handleAddConfig = () => {
    setEditingConfig(null);
    setIsModalOpen(true);
  };

  const handleEditConfig = (config: PricingConfig) => {
    setEditingConfig(config);
    setIsModalOpen(true);
  };

  const handleDeleteConfig = (configId: string) => {
    if (window.confirm('Are you sure you want to delete this pricing configuration?')) {
      setPricingConfigs(prev => prev.filter(config => config.id !== configId));
    }
  };

  const handleSaveConfig = (configData: Partial<PricingConfig>) => {
    if (editingConfig) {
      // Update existing config
      setPricingConfigs(prev => prev.map(config => 
        config.id === editingConfig.id 
          ? { ...config, ...configData, updatedAt: new Date() }
          : config
      ));
    } else {
      // Create new config
      const newConfig: PricingConfig = {
        id: `pricing-${Date.now()}`,
        clientId: selectedClient === 'overall' ? '' : selectedClient,
        ...configData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      } as PricingConfig;
      setPricingConfigs(prev => [newConfig, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleCopyConfig = (config: PricingConfig) => {
    const newConfig: PricingConfig = {
      ...config,
      id: `pricing-${Date.now()}`,
      name: `${config.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setPricingConfigs(prev => [newConfig, ...prev]);
  };

  const calculateEstimatedCost = (config: PricingConfig, pages: number = 100, colorRatio: number = 0.2) => {
    const bwPages = pages * (1 - colorRatio);
    const colorPages = pages * colorRatio;
    const baseCost = (bwPages * config.blackWhitePerPage) + (colorPages * config.colorPerPage);
    
    // Apply volume discount
    let discount = 0;
    for (const tier of config.volumeDiscounts.sort((a, b) => b.threshold - a.threshold)) {
      if (pages >= tier.threshold) {
        discount = tier.discount;
        break;
      }
    }
    
    return baseCost * (1 - discount);
  };

  const stats = {
    totalConfigs: pricingConfigs.length,
    activeConfigs: pricingConfigs.filter(c => c.isActive).length,
    avgBlackWhitePrice: pricingConfigs.length > 0 ? pricingConfigs.reduce((sum, c) => sum + c.blackWhitePerPage, 0) / pricingConfigs.length : 0,
    avgColorPrice: pricingConfigs.length > 0 ? pricingConfigs.reduce((sum, c) => sum + c.colorPerPage, 0) / pricingConfigs.length : 0
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isOverallView ? 'Pricing Management' : `${currentClient?.name} Pricing`}
          </h1>
          <p className="text-gray-600">
            {isOverallView 
              ? 'Configure pricing models for all clients'
              : 'Manage pricing configuration for this client'
            }
          </p>
        </div>
        <button
          onClick={handleAddConfig}
          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="h-5 w-5" />
          <span>Add Pricing Config</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Configs</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalConfigs}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.activeConfigs} active</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg B&W Price</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${stats.avgBlackWhitePrice.toFixed(3)}
              </p>
              <p className="text-xs text-gray-500 mt-1">per page</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <FileText className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Color Price</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${stats.avgColorPrice.toFixed(3)}
              </p>
              <p className="text-xs text-gray-500 mt-1">per page</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Est. Revenue</p>
              <p className="text-3xl font-bold text-green-600 mt-2">$0</p>
              <p className="text-xs text-green-600 mt-1">No data yet</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search pricing configurations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isOverallView ? 'No Pricing Configurations' : 'No Pricing Config for This Client'}
        </h3>
        <p className="text-gray-600 mb-6">
          Create your first pricing configuration to start tracking costs and managing billing.
        </p>
        <button
          onClick={handleAddConfig}
          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          <span>Create Pricing Config</span>
        </button>
      </div>

      <PricingConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveConfig}
        editingConfig={editingConfig}
        clients={clients}
        selectedClient={selectedClient}
      />
    </div>
  );
};

export default PricingDashboard;