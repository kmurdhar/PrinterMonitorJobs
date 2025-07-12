import React, { useState, useEffect } from 'react';
import { Bell, Search, RefreshCw, Download, Building, User, Settings, LogOut, ChevronDown, Globe, ExternalLink, Trash2 } from 'lucide-react';
import { clearAllData } from '../../utils/clearData';

interface HeaderProps {
  activeTab: string;
  clientName?: string;
}

const Header: React.FC<HeaderProps> = ({ activeTab, clientName = 'Demo Client' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Get current server URL
  const getServerUrl = () => {
    return window.location.origin;
  };

  // Load notifications from localStorage and update them
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      try {
        return JSON.parse(saved).map((notif: any) => ({
          ...notif,
          time: notif.time // Keep the relative time as is
        }));
      } catch (error) {
        return [];
      }
    }
    return [];
  });

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Listen for new print jobs to create notifications
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'printJobs') {
        const newJobs = JSON.parse(e.newValue || '[]');
        const oldJobs = JSON.parse(e.oldValue || '[]');
        
        // Check if new jobs were added
        if (newJobs.length > oldJobs.length) {
          const latestJob = newJobs[0]; // Assuming newest job is first
          const newNotification = {
            id: Date.now(),
            message: `New print job: ${latestJob.fileName} from ${latestJob.systemName || latestJob.user}`,
            time: 'Just now',
            type: latestJob.status === 'success' ? 'success' : 'warning'
          };
          
          setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep only 10 notifications
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Add notification when print jobs are simulated
  useEffect(() => {
    const checkForNewJobs = () => {
      const printJobs = JSON.parse(localStorage.getItem('printJobs') || '[]');
      const lastNotificationTime = localStorage.getItem('lastNotificationTime');
      const currentTime = Date.now();
      
      if (printJobs.length > 0) {
        const latestJob = printJobs[0];
        const jobTime = new Date(latestJob.timestamp).getTime();
        
        // If there's a new job within the last 5 seconds, create a notification
        if (!lastNotificationTime || jobTime > parseInt(lastNotificationTime)) {
          const newNotification = {
            id: currentTime,
            message: `Print job captured: ${latestJob.fileName} from ${latestJob.systemName || latestJob.user}`,
            time: 'Just now',
            type: latestJob.status === 'success' ? 'success' : 'warning'
          };
          
          setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
          localStorage.setItem('lastNotificationTime', jobTime.toString());
        }
      }
    };

    // Check for new jobs every 2 seconds
    const interval = setInterval(checkForNewJobs, 2000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = (tab: string) => {
    const titles: { [key: string]: string } = {
      dashboard: 'Dashboard Overview',
      jobs: 'Print Job History',
      printers: 'Printer Management',
      users: 'User Activity',
      onboarding: 'Client Onboarding',
      analytics: 'Analytics & Reports',
      monitoring: 'Real-time Monitoring',
      settings: 'System Settings',
      pricing: 'Pricing Management',
      profile: 'Profile & Settings'
    };
    return titles[tab] || 'PrintMonitor';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Searching for: "${searchQuery}"`);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleExport = () => {
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
      alert('Logout functionality will be implemented');
    }
  };

  const handleClearData = () => {
    if (window.confirm('⚠️ This will clear ALL application data including clients, print jobs, and settings. This action cannot be undone. Are you sure?')) {
      clearAllData();
    }
  };
  const clearNotifications = () => {
    setNotifications([]);
    setIsNotificationsOpen(false);
  };

  const markAsRead = (notificationId: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <Building className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">{clientName}</span>
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-600 font-medium">Server: {getServerUrl()}</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle(activeTab)}</h1>
          <p className="text-sm text-gray-600">Monitor and manage your printing infrastructure</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Server Status */}
          <div className="hidden md:flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-700 font-medium">Production Server Online</span>
          </div>

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
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No notifications yet</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Print job notifications will appear here
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 group">
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === 'success' ? 'bg-green-500' :
                            notification.type === 'warning' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity"
                            title="Mark as read"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200">
                    <button 
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Close notifications
                    </button>
                  </div>
                )}
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
                  <button 
                    onClick={handleClearData}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Clear All Data</span>
                  </button>
                  <button 
                    onClick={() => window.open(getServerUrl(), '_blank')}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Open Server</span>
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