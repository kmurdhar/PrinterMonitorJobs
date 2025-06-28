import React, { useState, useEffect } from 'react';
import { 
  X, 
  DollarSign, 
  Plus, 
  Trash2, 
  Calculator,
  Building,
  Users,
  FileText,
  Percent,
  Save,
  AlertTriangle
} from 'lucide-react';
import { PricingConfig, Client } from '../../types';

interface PricingConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: Partial<PricingConfig>) => void;
  editingConfig: PricingConfig | null;
  clients: Client[];
  selectedClient: string;
}

const PricingConfigModal: React.FC<PricingConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingConfig,
  clients,
  selectedClient
}) => {
  const [formData, setFormData] = useState({
    name: '',
    clientId: selectedClient === 'overall' ? '' : selectedClient,
    blackWhitePerPage: 0.05,
    colorPerPage: 0.15,
    paperSizes: {
      A4: 1.0,
      A3: 1.5,
      Letter: 1.0,
      Legal: 1.2
    },
    departmentMultipliers: {} as { [key: string]: number },
    volumeDiscounts: [
      { threshold: 1000, discount: 0.05 }
    ]
  });

  const [newDepartment, setNewDepartment] = useState('');
  const [newMultiplier, setNewMultiplier] = useState(1.0);
  const [previewPages, setPreviewPages] = useState(100);
  const [previewColorRatio, setPreviewColorRatio] = useState(0.2);

  useEffect(() => {
    if (editingConfig) {
      setFormData({
        name: editingConfig.name,
        clientId: editingConfig.clientId,
        blackWhitePerPage: editingConfig.blackWhitePerPage,
        colorPerPage: editingConfig.colorPerPage,
        paperSizes: editingConfig.paperSizes,
        departmentMultipliers: editingConfig.departmentMultipliers,
        volumeDiscounts: editingConfig.volumeDiscounts
      });
    } else {
      setFormData({
        name: '',
        clientId: selectedClient === 'overall' ? '' : selectedClient,
        blackWhitePerPage: 0.05,
        colorPerPage: 0.15,
        paperSizes: {
          A4: 1.0,
          A3: 1.5,
          Letter: 1.0,
          Legal: 1.2
        },
        departmentMultipliers: {},
        volumeDiscounts: [
          { threshold: 1000, discount: 0.05 }
        ]
      });
    }
  }, [editingConfig, selectedClient]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addDepartmentMultiplier = () => {
    if (newDepartment.trim() && newMultiplier > 0) {
      setFormData(prev => ({
        ...prev,
        departmentMultipliers: {
          ...prev.departmentMultipliers,
          [newDepartment.trim()]: newMultiplier
        }
      }));
      setNewDepartment('');
      setNewMultiplier(1.0);
    }
  };

  const removeDepartmentMultiplier = (department: string) => {
    setFormData(prev => {
      const newMultipliers = { ...prev.departmentMultipliers };
      delete newMultipliers[department];
      return {
        ...prev,
        departmentMultipliers: newMultipliers
      };
    });
  };

  const addVolumeDiscount = () => {
    setFormData(prev => ({
      ...prev,
      volumeDiscounts: [
        ...prev.volumeDiscounts,
        { threshold: 0, discount: 0 }
      ]
    }));
  };

  const updateVolumeDiscount = (index: number, field: 'threshold' | 'discount', value: number) => {
    setFormData(prev => ({
      ...prev,
      volumeDiscounts: prev.volumeDiscounts.map((discount, i) => 
        i === index ? { ...discount, [field]: value } : discount
      )
    }));
  };

  const removeVolumeDiscount = (index: number) => {
    setFormData(prev => ({
      ...prev,
      volumeDiscounts: prev.volumeDiscounts.filter((_, i) => i !== index)
    }));
  };

  const calculatePreviewCost = () => {
    const bwPages = previewPages * (1 - previewColorRatio);
    const colorPages = previewPages * previewColorRatio;
    const baseCost = (bwPages * formData.blackWhitePerPage) + (colorPages * formData.colorPerPage);
    
    // Apply volume discount
    let discount = 0;
    for (const tier of formData.volumeDiscounts.sort((a, b) => b.threshold - a.threshold)) {
      if (previewPages >= tier.threshold) {
        discount = tier.discount;
        break;
      }
    }
    
    return {
      baseCost,
      discount,
      finalCost: baseCost * (1 - discount),
      savings: baseCost * discount
    };
  };

  const previewCost = calculatePreviewCost();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {editingConfig ? 'Edit Pricing Configuration' : 'Create Pricing Configuration'}
              </h2>
              <p className="text-sm text-gray-600">Configure pricing rules and rates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <span>Basic Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Configuration Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Standard Pricing, Premium Rates"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={selectedClient !== 'overall'}
                >
                  {selectedClient === 'overall' ? (
                    <>
                      <option value="">Select Client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </>
                  ) : (
                    <option value={selectedClient}>
                      {clients.find(c => c.id === selectedClient)?.name || 'Current Client'}
                    </option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Base Pricing */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Base Pricing</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Black & White per Page *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    required
                    value={formData.blackWhitePerPage}
                    onChange={(e) => setFormData({ ...formData, blackWhitePerPage: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.050"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color per Page *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    required
                    value={formData.colorPerPage}
                    onChange={(e) => setFormData({ ...formData, colorPerPage: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.150"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Paper Size Multipliers */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Paper Size Multipliers</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(formData.paperSizes).map(([size, multiplier]) => (
                <div key={size}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {size}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={multiplier}
                    onChange={(e) => setFormData({
                      ...formData,
                      paperSizes: {
                        ...formData.paperSizes,
                        [size]: parseFloat(e.target.value) || 1.0
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Department Multipliers */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Department Multipliers</span>
            </h3>

            <div className="space-y-4">
              {Object.entries(formData.departmentMultipliers).map(([department, multiplier]) => (
                <div key={department} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={department}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={multiplier}
                      onChange={(e) => setFormData({
                        ...formData,
                        departmentMultipliers: {
                          ...formData.departmentMultipliers,
                          [department]: parseFloat(e.target.value) || 1.0
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDepartmentMultiplier(department)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="Department name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={newMultiplier}
                    onChange={(e) => setNewMultiplier(parseFloat(e.target.value) || 1.0)}
                    placeholder="1.0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="button"
                  onClick={addDepartmentMultiplier}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Volume Discounts */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Percent className="h-5 w-5 text-blue-600" />
              <span>Volume Discounts</span>
            </h3>

            <div className="space-y-4">
              {formData.volumeDiscounts.map((discount, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      min="1"
                      value={discount.threshold}
                      onChange={(e) => updateVolumeDiscount(index, 'threshold', parseInt(e.target.value) || 0)}
                      placeholder="Pages threshold"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={discount.discount}
                      onChange={(e) => updateVolumeDiscount(index, 'discount', parseFloat(e.target.value) || 0)}
                      placeholder="0.05"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-16">
                    {(discount.discount * 100).toFixed(0)}% off
                  </span>
                  <button
                    type="button"
                    onClick={() => removeVolumeDiscount(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addVolumeDiscount}
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                <Plus className="h-4 w-4" />
                <span>Add Volume Discount</span>
              </button>
            </div>
          </div>

          {/* Cost Preview */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              <span>Cost Preview</span>
            </h3>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview Pages
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={previewPages}
                    onChange={(e) => setPreviewPages(parseInt(e.target.value) || 100)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Ratio (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={previewColorRatio * 100}
                    onChange={(e) => setPreviewColorRatio((parseInt(e.target.value) || 0) / 100)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Base Cost</p>
                  <p className="text-lg font-bold text-gray-900">${previewCost.baseCost.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Discount</p>
                  <p className="text-lg font-bold text-green-600">
                    {(previewCost.discount * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Savings</p>
                  <p className="text-lg font-bold text-green-600">-${previewCost.savings.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Final Cost</p>
                  <p className="text-xl font-bold text-blue-600">${previewCost.finalCost.toFixed(2)}</p>
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
              <Save className="h-4 w-4" />
              <span>{editingConfig ? 'Update Configuration' : 'Create Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PricingConfigModal;