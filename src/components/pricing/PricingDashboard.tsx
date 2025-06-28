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
  const [pricingConfigs, setPricingConfigs] = useState<PricingConfig[]>([
    {
      id: 'pricing-001',
      clientId: 'techcorp-001',
      name: 'TechCorp Standard Pricing',
      blackWhitePerPage: 0.05,
      colorPerPage: 0.15,
      paperSizes: {
        A4: 1.0,
        A3: 1.5,
        Letter: 1.0,
        Legal: 1.2
      },
      departmentMultipliers: {
        'Executive': 1.2,
        'Finance': 1.0,
        'Marketing': 1.1,
        'Operations': 0.9,
        'IT': 0.8
      },
      volumeDiscounts: [
        { threshold: 1000, discount: 0.05 },
        { threshold: 5000, discount: 0.10 },
        { threshold: 10000, discount: 0.15 }
      ],
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 'pricing-002',
      clientId: 'marketing-002',
      name: 'Marketing Plus Premium',
      blackWhitePerPage: 0.04,
      colorPerPage: 0.12,
      paperSizes: {
        A4: 1.0,
        A3: 1.4,
        Letter: 1.0,
        Legal: 1.1
      },
      departmentMultipliers: {
        'Creative': 1.3,
        'Marketing': 1.0,
        'Administration': 0.9
      },
      volumeDiscounts: [
        { threshold: 500, discount: 0.03 },
        { threshold: 2000, discount: 0.08 },
        { threshold: 5000, discount: 0.12 }
      ],
      isActive: true,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20')
    }
  ]);

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
    avgBlackWhitePrice: pricingConfigs.reduce((sum, c) => sum + c.blackWhitePerPage, 0) / pricingConfigs.length,
    avgColorPrice: pricingConfigs.reduce((sum, c) => sum + c.colorPerPage, 0) / pricingConfigs.length
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
              <p className="text-3xl font-bold text-green-600 mt-2">$2,847</p>
              <p className="text-xs text-green-600 mt-1">+12% this month</p>
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

      {/* Pricing Configurations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredConfigs.map((config) => {
          const configClient = clients.find(c => c.id === config.clientId);
          const estimatedCost = calculateEstimatedCost(config);
          
          return (
            <div key={config.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{config.name}</h3>
                    {isOverallView && configClient && (
                      <p className="text-sm text-gray-600">{configClient.name}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    config.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {config.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleCopyConfig(config)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Copy Configuration"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditConfig(config)}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title="Edit Configuration"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteConfig(config.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Configuration"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Base Pricing */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Black & White</p>
                    <p className="text-lg font-bold text-gray-900">
                      ${config.blackWhitePerPage.toFixed(3)}
                    </p>
                    <p className="text-xs text-gray-500">per page</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Color</p>
                    <p className="text-lg font-bold text-purple-600">
                      ${config.colorPerPage.toFixed(3)}
                    </p>
                    <p className="text-xs text-gray-500">per page</p>
                  </div>
                </div>

                {/* Paper Size Multipliers */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Paper Size Multipliers</p>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(config.paperSizes).map(([size, multiplier]) => (
                      <div key={size} className="text-center">
                        <p className="text-xs text-gray-600">{size}</p>
                        <p className="text-sm font-medium text-gray-900">{multiplier}x</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Volume Discounts */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Volume Discounts</p>
                  <div className="space-y-1">
                    {config.volumeDiscounts.map((discount, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-gray-600">{discount.threshold}+ pages</span>
                        <span className="font-medium text-green-600">
                          {(discount.discount * 100).toFixed(0)}% off
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Department Multipliers */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Department Rates</p>
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(config.departmentMultipliers).slice(0, 4).map(([dept, multiplier]) => (
                      <div key={dept} className="flex justify-between text-xs">
                        <span className="text-gray-600">{dept}</span>
                        <span className="font-medium">{multiplier}x</span>
                      </div>
                    ))}
                  </div>
                  {Object.keys(config.departmentMultipliers).length > 4 && (
                    <p className="text-xs text-gray-500 mt-1">
                      +{Object.keys(config.departmentMultipliers).length - 4} more departments
                    </p>
                  )}
                </div>

                {/* Cost Estimate */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calculator className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Est. Cost (100 pages)
                      </span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      ${estimatedCost.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    80% B&W, 20% Color with volume discounts
                  </p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Updated {config.updatedAt.toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => handleEditConfig(config)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Configure
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredConfigs.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isOverallView ? 'No Pricing Configurations' : 'No Pricing Config for This Client'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'No configurations match your search criteria.'
              : 'Create your first pricing configuration to start tracking costs.'
            }
          </p>
          <button
            onClick={handleAddConfig}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            <span>Create Pricing Config</span>
          </button>
        </div>
      )}

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