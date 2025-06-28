import React from 'react';
import { Bell, Search, RefreshCw, Download, Building } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  clientName?: string;
}

const Header: React.FC<HeaderProps> = ({ activeTab, clientName = 'Demo Client' }) => {
  const getPageTitle = (tab: string) => {
    const titles: { [key: string]: string } = {
      dashboard: 'Dashboard Overview',
      jobs: 'Print Job History',
      printers: 'Printer Management',
      users: 'User Activity',
      analytics: 'Analytics & Reports',
      monitoring: 'Real-time Monitoring',
      settings: 'System Settings'
    };
    return titles[tab] || 'PrintMonitor';
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <Building className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">{clientName}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle(activeTab)}</h1>
          <p className="text-sm text-gray-600">Monitor and manage your printing infrastructure</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search jobs, users, printers..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
            />
          </div>
          
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className="h-5 w-5" />
          </button>
          
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Download className="h-5 w-5" />
          </button>
          
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              0
            </span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-600">System Administrator</p>
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;