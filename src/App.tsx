import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import StatsCards from './components/dashboard/StatsCards';
import DashboardCharts from './components/dashboard/DashboardCharts';
import PrintJobsTable from './components/jobs/PrintJobsTable';
import PrinterGrid from './components/printers/PrinterGrid';
import UsersTable from './components/users/UsersTable';
import { 
  mockDashboardStats, 
  mockPrintJobs, 
  mockPrinters, 
  mockUsers 
} from './data/mockData';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // In production, this would come from authentication/routing
  const currentClient = "Demo Client - Setup Required";

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <StatsCards stats={mockDashboardStats} />
            <DashboardCharts />
            {mockPrintJobs.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Getting Started</h3>
                <p className="text-blue-800 mb-4">
                  Your printer monitoring system is ready! To start capturing print jobs:
                </p>
                <ol className="list-decimal list-inside text-blue-800 space-y-2">
                  <li>Install the Windows Print Listener on client machines</li>
                  <li>Configure your printers in the system</li>
                  <li>Set up user accounts and departments</li>
                  <li>Start monitoring print activity</li>
                </ol>
                <p className="text-sm text-blue-600 mt-4">
                  Check the documentation for detailed setup instructions.
                </p>
              </div>
            )}
          </div>
        );
      case 'jobs':
        return (
          <div>
            {mockPrintJobs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Print Jobs Yet</h3>
                <p className="text-gray-600 mb-4">
                  Print jobs will appear here once the Windows Print Listener is installed and configured.
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  View Setup Guide
                </button>
              </div>
            ) : (
              <PrintJobsTable jobs={mockPrintJobs} />
            )}
          </div>
        );
      case 'printers':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Printer Health Status</h2>
              <p className="text-gray-600">Monitor printer status, supplies, and performance</p>
            </div>
            {mockPrinters.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Printers Configured</h3>
                <p className="text-gray-600 mb-4">
                  Add your printers to start monitoring their health and status.
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Add Printer
                </button>
              </div>
            ) : (
              <PrinterGrid printers={mockPrinters} />
            )}
          </div>
        );
      case 'users':
        return (
          <div>
            {mockUsers.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No User Activity</h3>
                <p className="text-gray-600 mb-4">
                  User activity will be tracked automatically once print jobs start flowing through the system.
                </p>
              </div>
            ) : (
              <UsersTable users={mockUsers} />
            )}
          </div>
        );
      case 'analytics':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Analytics & Reports</h2>
              <p className="text-gray-600">Comprehensive printing analytics and cost reports</p>
            </div>
            <DashboardCharts />
          </div>
        );
      case 'monitoring':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Real-time Monitoring</h2>
              <p className="text-gray-600">Live print job queue and system status</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Print Queue</h3>
                <div className="text-center py-8 text-gray-500">
                  <p>No active print jobs</p>
                  <p className="text-sm mt-2">Queue will populate when print jobs are submitted</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Print Spooler Service</span>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Not Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database Connection</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Windows Event Listener</span>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Not Configured</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Disk Space</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">System Settings</h2>
              <p className="text-gray-600">Configure print monitoring and system preferences</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Print Monitoring</h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Monitor all print jobs</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Track user authentication</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-700">Enable cost tracking</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                    <input 
                      type="text" 
                      value={currentClient}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">API Endpoint</label>
                    <input 
                      type="text" 
                      value="https://printmonitor.com/api" 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Connection Status</span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Setup Required</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1">
        <Header activeTab={activeTab} clientName={currentClient} />
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;