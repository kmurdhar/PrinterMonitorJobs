import React from 'react';
import { 
  BarChart3, 
  Printer, 
  FileText, 
  Users, 
  Settings, 
  Activity,
  Home,
  UserPlus,
  DollarSign
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'jobs', label: 'Print Jobs', icon: FileText },
    { id: 'printers', label: 'Printers', icon: Printer },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'onboarding', label: 'Onboarding', icon: UserPlus },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'monitoring', label: 'Monitoring', icon: Activity },
    { id: 'profile', label: 'Profile', icon: Settings }
  ];

  return (
    <div className="bg-slate-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <Printer className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold">PrintMonitor</h1>
            <p className="text-slate-400 text-sm">Enterprise Edition</p>
          </div>
        </div>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="mt-8 p-4 bg-slate-800 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">System Status</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Listeners</span>
            <span className="text-xs text-green-400">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Database</span>
            <span className="text-xs text-green-400">Connected</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Queue</span>
            <span className="text-xs text-yellow-400">3 pending</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;