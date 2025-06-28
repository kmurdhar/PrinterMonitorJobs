import React, { useState } from 'react';
import { Bell, Search, RefreshCw, Download, Building, User, Settings, LogOut, ChevronDown } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  clientName?: string;
}

const Header: React.FC<HeaderProps> = ({ activeTab, clientName = 'Demo Client' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'New client onboarded: TechCorp Solutions', time: '5 min ago', type: 'success' },
    { id: 2, message: 'Printer offline: HP-LaserJet-01', time: '15 min ago', type: 'warning' },
    { id: 3, message: 'Low toner alert: Canon-Printer-02', time: '1 hour ago', type: 'info' }
  ]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const getPageTitle = (tab: string) => {
    const titles: { [key: string]: string } = {
      dashboard: 'Dashboard Overview',
      jobs: 'Print Job History',
      printers: 'Printer Management',
      users: 'User Activity',
      onboarding: 'Client Onboarding',
      analytics: 'Analytics & Reports',
      monitoring: 'Real-time Monitoring',
      settings: 'System Settings'
    };
    return titles[tab] || 'PrintMonitor';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement global search functionality
      alert(`Searching for: "${searchQuery}"`);
    }
  };

  const handleRefresh = () => {
    // TODO: Implement refresh functionality
    window.location.reload();
  };

  const handleExport = () => {
    // TODO: Implement export functionality based on current tab
    const exportData = {
      dashboard: 'dashboard_stats',
      jobs: 'print_jobs',
      printers: 'printer_status',
      users: 'user_activity',
      onboarding: 'onboarding_progress'
    };
    
    const filename = exportData[activeTab as keyof typeof exportData] || 'data';
    alert(`Exporting ${filename}.csv - Feature will be implemented`);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      // TODO: Implement logout functionality
      alert('Logout functionality will be implemented');
    }
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
          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search jobs, users, printers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
            />
          </form>
          
          {/* Refresh Button */}
          <button 
            onClick={handleRefresh}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          
          {/* Export Button */}
          <button 
            onClick={handleExport}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Export Data"
          >
            <Download className="h-5 w-5" />
          </button>
          
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === 'success' ? 'bg-green-500' :
                          notification.type === 'warning' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-200">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 hover:bg-gray-100 rounded-lg p-2 transition-colors"
            >
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-600">System Administrator</p>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                  <hr className="my-2" />
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(isProfileOpen || isNotificationsOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsProfileOpen(false);
            setIsNotificationsOpen(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;