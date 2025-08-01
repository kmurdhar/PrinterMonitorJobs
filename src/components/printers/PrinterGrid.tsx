import React, { useState } from 'react';
import { Printer, MapPin, Wifi, WifiOff, AlertTriangle, Clock, Plus, Search, Filter, MoreVertical, Edit, Trash2, Settings, Building, Globe, Users } from 'lucide-react';
import { Printer as PrinterType } from '../../types';
import AddPrinterModal from './AddPrinterModal';

interface PrinterGridProps {
  printers: PrinterType[];
  onPrintersChange?: (printers: PrinterType[]) => void;
  selectedClient: string;
}

const PrinterGrid: React.FC<PrinterGridProps> = ({ printers, onPrintersChange, selectedClient }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');

  const isOverallView = selectedClient === 'overall';
  const serverUrl = window.location.origin;

  const handleAddPrinter = (newPrinter: PrinterType) => {
    const printerWithClient = {
      ...newPrinter,
      clientId: selectedClient === 'overall' ? 'default-client' : selectedClient
    };
    const updatedPrinters = [...printers, printerWithClient];
    onPrintersChange?.(updatedPrinters);
  };

  const handleDeletePrinter = (printerId: string) => {
    if (window.confirm('Are you sure you want to delete this printer?')) {
      const updatedPrinters = printers.filter(printer => printer.id !== printerId);
      onPrintersChange?.(updatedPrinters);
    }
  };

  const handleEditPrinter = (printer: PrinterType) => {
    // TODO: Implement edit functionality
    alert(`Edit functionality for ${printer.name} will be implemented`);
  };

  const filteredPrinters = printers.filter(printer => {
    const matchesSearch = printer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         printer.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         printer.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || printer.status === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || printer.department === filterDepartment;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const departments = [...new Set(printers.map(printer => printer.department))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-gray-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <Wifi className="h-5 w-5 text-green-600" />;
      case 'offline':
        return <WifiOff className="h-5 w-5 text-gray-600" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <WifiOff className="h-5 w-5 text-gray-600" />;
    }
  };

  const getLevelColor = (level: number) => {
    if (level > 50) return 'bg-green-500';
    if (level > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (printers.length === 0) {
    return (
      <>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Printer className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isOverallView ? 'No Printers in System' : 'No Printers for This Client'}
          </h3>
          <p className="text-gray-600 mb-6">
            {isOverallView 
              ? 'No printers have been added to the system yet. Printers are usually auto-discovered when clients start printing.'
              : 'This client doesn\'t have any printers configured yet. Printers are auto-discovered when users print, or you can add them manually.'
            }
          </p>

          {/* How Printer Discovery Works */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left max-w-2xl mx-auto">
            <div className="flex items-start space-x-3">
              <Globe className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-2">How Printer Discovery Works:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li><strong>Client installs Print Listener</strong> on their computers</li>
                  <li><strong>Users print normally</strong> - no changes needed</li>
                  <li><strong>Print Listener captures</strong> print job details</li>
                  <li><strong>Printer auto-discovered</strong> and added to client</li>
                  <li><strong>Appears in dashboard</strong> immediately</li>
                </ol>
                <div className="mt-3 p-2 bg-white border border-blue-300 rounded">
                  <p className="text-sm text-blue-900">
                    <strong>🌐 Server:</strong> <span className="font-mono">{serverUrl}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Client Assignment Info */}
          {!isOverallView && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left max-w-2xl mx-auto">
              <div className="flex items-start space-x-3">
                <Building className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-green-900">Client-Specific Printers</h4>
                  <p className="text-sm text-green-800 mt-1">
                    Printers added here will be assigned to this client only. Other clients cannot see or manage these printers.
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            <span>{isOverallView ? 'Add First Printer' : 'Add Client Printer'}</span>
          </button>
        </div>
        <AddPrinterModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddPrinter={handleAddPrinter}
          selectedClient={selectedClient}
        />
      </>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isOverallView ? 'All System Printers' : 'Client Printer Management'}
            </h2>
            <p className="text-gray-600">
              {isOverallView 
                ? `Monitor all printers across all clients (${printers.length} total)`
                : `Monitor printer status, supplies, and performance for this client (${printers.length} printers)`
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Server Status */}
            <div className="hidden md:flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-700 font-medium">Server Online</span>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="h-4 w-4" />
              <span>{isOverallView ? 'Add Printer' : 'Add Client Printer'}</span>
            </button>
          </div>
        </div>

        {/* Client Assignment Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <Users className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Printer-Client Relationship</h4>
              <div className="text-sm text-blue-800 mt-1">
                {isOverallView ? (
                  <p>
                    <strong>Admin View:</strong> You can see all printers from all clients. 
                    Each printer belongs to exactly one client for data isolation and billing.
                  </p>
                ) : (
                  <p>
                    <strong>Client View:</strong> These printers belong exclusively to this client. 
                    Print jobs from these printers will only appear in this client's dashboard.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search printers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
            </select>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrinters.map((printer) => (
          <div key={printer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Printer className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{printer.name}</h3>
                  <p className="text-sm text-gray-600">{printer.model}</p>
                  {isOverallView && (
                    <p className="text-xs text-blue-600 font-medium">
                      Client: {printer.clientId}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(printer.status)}
                <span className={`w-3 h-3 rounded-full ${getStatusColor(printer.status)}`}></span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleEditPrinter(printer)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit Printer"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeletePrinter(printer.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Printer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{printer.location}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Building className="h-4 w-4" />
                <span>{printer.department}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{printer.jobsToday} jobs today</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Paper Level</span>
                  <span className="text-sm font-medium">{printer.paperLevel}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getLevelColor(printer.paperLevel)}`}
                    style={{ width: `${printer.paperLevel}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Toner Level</span>
                  <span className="text-sm font-medium">{printer.tonerLevel}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getLevelColor(printer.tonerLevel)}`}
                    style={{ width: `${printer.tonerLevel}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">IP Address</span>
                  <span className="font-mono text-gray-900">{printer.ipAddress}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-gray-600">Last Activity</span>
                  <span className="text-gray-900">{printer.lastActivity.toLocaleTimeString()}</span>
                </div>
                {isOverallView && (
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-gray-600">Client ID</span>
                    <span className="font-mono text-blue-600 text-xs">{printer.clientId}</span>
                  </div>
                )}
              </div>

              {printer.status === 'error' && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 font-medium">Paper jam detected</p>
                  <p className="text-xs text-red-600 mt-1">Requires manual intervention</p>
                </div>
              )}

              {printer.status === 'warning' && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 font-medium">Low supplies</p>
                  <p className="text-xs text-yellow-600 mt-1">Refill recommended</p>
                </div>
              )}

              {printer.status === 'offline' && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-800 font-medium">Printer Offline</p>
                  <p className="text-xs text-gray-600 mt-1">Will show online after first print job</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredPrinters.length === 0 && printers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No printers match your search criteria.</p>
        </div>
      )}

      <AddPrinterModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPrinter={handleAddPrinter}
        selectedClient={selectedClient}
      />
    </>
  );
};

export default PrinterGrid;