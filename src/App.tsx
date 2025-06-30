import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ClientStatsCards from './components/dashboard/ClientStatsCards';
import ClientSelector from './components/dashboard/ClientSelector';
import DashboardCharts from './components/dashboard/DashboardCharts';
import PrintJobsTable from './components/jobs/PrintJobsTable';
import PrinterGrid from './components/printers/PrinterGrid';
import UsersTable from './components/users/UsersTable';
import OnboardingDashboard from './components/onboarding/OnboardingDashboard';
import PricingDashboard from './components/pricing/PricingDashboard';
import ProfileSettings from './components/profile/ProfileSettings';
import { 
  mockDashboardStats, 
  mockPrinters as initialPrinters,
  mockUsers as initialUsers,
  mockPrintJobs as initialPrintJobs
} from './data/mockData';
import { generateOverallStats, generateClientStats } from './data/clientData';
import { Printer, User, PrintJob, Client } from './types';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClient, setSelectedClient] = useState('overall');
  
  // Check URL parameters for client selection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const clientParam = urlParams.get('client');
    if (clientParam) {
      setSelectedClient(clientParam);
    }
  }, []);

  // Update URL when client changes
  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedClient !== 'overall') {
      url.searchParams.set('client', selectedClient);
    } else {
      url.searchParams.delete('client');
    }
    window.history.replaceState({}, '', url.toString());
  }, [selectedClient]);
  
  // Load clients from localStorage on component mount
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('mainClients');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        return parsed.map((client: any) => ({
          ...client,
          createdAt: new Date(client.createdAt)
        }));
      } catch (error) {
        console.error('Error parsing saved clients:', error);
        return [];
      }
    }
    return [];
  });

  const [printers, setPrinters] = useState<Printer[]>(initialPrinters);
  const [users, setUsers] = useState<User[]>(initialUsers);
  
  // Load print jobs from localStorage
  const [printJobs, setPrintJobs] = useState<PrintJob[]>(() => {
    const saved = localStorage.getItem('printJobs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((job: any) => ({
          ...job,
          timestamp: new Date(job.timestamp)
        }));
      } catch (error) {
        console.error('Error parsing saved print jobs:', error);
        return initialPrintJobs;
      }
    }
    return initialPrintJobs;
  });
  
  // Save clients to localStorage whenever clients change
  useEffect(() => {
    localStorage.setItem('mainClients', JSON.stringify(clients));
  }, [clients]);

  // Save print jobs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('printJobs', JSON.stringify(printJobs));
  }, [printJobs]);

  const isOverallView = selectedClient === 'overall';
  const currentClient = clients.find(c => c.id === selectedClient);
  const currentClientName = isOverallView ? 'Overall System' : currentClient?.name || 'Unknown Client';

  // Filter data by client
  const getClientPrinters = (clientId: string) => {
    if (clientId === 'overall') return printers;
    return printers.filter(printer => printer.clientId === clientId);
  };

  const getClientUsers = (clientId: string) => {
    if (clientId === 'overall') return users;
    return users.filter(user => user.clientId === clientId);
  };

  const getClientPrintJobs = (clientId: string) => {
    if (clientId === 'overall') return printJobs;
    return printJobs.filter(job => job.clientId === clientId);
  };

  // Get client-specific data
  const clientPrinters = getClientPrinters(selectedClient);
  const clientUsers = getClientUsers(selectedClient);
  const clientPrintJobs = getClientPrintJobs(selectedClient);

  // Get appropriate stats based on view
  const currentStats = isOverallView 
    ? generateOverallStats() 
    : generateClientStats(selectedClient);

  // Handler functions for CRUD operations
  const handlePrintersChange = (updatedPrinters: Printer[]) => {
    if (isOverallView) {
      setPrinters(updatedPrinters);
    } else {
      // Update only the printers for the current client
      const otherClientPrinters = printers.filter(p => p.clientId !== selectedClient);
      const newPrintersWithClient = updatedPrinters.map(p => ({
        ...p,
        clientId: p.clientId || selectedClient
      }));
      setPrinters([...otherClientPrinters, ...newPrintersWithClient]);
    }
  };

  const handleUsersChange = (updatedUsers: User[]) => {
    if (isOverallView) {
      setUsers(updatedUsers);
    } else {
      // Update only the users for the current client
      const otherClientUsers = users.filter(u => u.clientId !== selectedClient);
      const newUsersWithClient = updatedUsers.map(u => ({
        ...u,
        clientId: u.clientId || selectedClient
      }));
      setUsers([...otherClientUsers, ...newUsersWithClient]);
    }
  };

  const handlePrintJobsChange = (updatedJobs: PrintJob[]) => {
    if (isOverallView) {
      setPrintJobs(updatedJobs);
    } else {
      // Update only the jobs for the current client
      const otherClientJobs = printJobs.filter(j => j.clientId !== selectedClient);
      const newJobsWithClient = updatedJobs.map(j => ({
        ...j,
        clientId: j.clientId || selectedClient
      }));
      setPrintJobs([...otherClientJobs, ...newJobsWithClient]);
    }
  };

  const handleClientsChange = (updatedClients: Client[]) => {
    setClients(updatedClients);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <div className="mb-6">
              <ClientSelector 
                clients={clients}
                selectedClient={selectedClient}
                onClientChange={setSelectedClient}
              />
            </div>
            
            <ClientStatsCards 
              stats={currentStats} 
              isOverallView={isOverallView}
              clientName={currentClientName}
            />
            
            <DashboardCharts />
            
            {clientPrintJobs.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  {isOverallView ? 'Production Server Ready' : 'Client Setup Complete'}
                </h3>
                <p className="text-blue-800 mb-4">
                  {isOverallView 
                    ? `Your PrintMonitor server is running at ${window.location.origin} and ready to accept client connections!`
                    : `This client's printer monitoring is ready! Print jobs will be automatically captured from any system in the organization.`
                  }
                </p>
                {!isOverallView && (
                  <ol className="list-decimal list-inside text-blue-800 space-y-2">
                    <li>Install the Windows Print Listener on client machines</li>
                    <li>Configure printers in the system</li>
                    <li>Print jobs will be automatically captured from any system</li>
                    <li>No need to pre-configure users - system names are captured automatically</li>
                  </ol>
                )}
                <div className="mt-4 p-3 bg-white border border-blue-300 rounded-lg">
                  <p className="text-sm text-blue-900 font-medium">
                    🌐 Server URL: <span className="font-mono">{window.location.origin}</span>
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Share this URL with clients for dashboard access
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      case 'jobs':
        return (
          <div>
            <div className="mb-6">
              <ClientSelector 
                clients={clients}
                selectedClient={selectedClient}
                onClientChange={setSelectedClient}
              />
            </div>
            <PrintJobsTable 
              jobs={clientPrintJobs} 
              onJobsChange={handlePrintJobsChange}
              selectedClient={selectedClient}
            />
          </div>
        );
      case 'printers':
        return (
          <div>
            <div className="mb-6">
              <ClientSelector 
                clients={clients}
                selectedClient={selectedClient}
                onClientChange={setSelectedClient}
              />
            </div>
            <PrinterGrid 
              printers={clientPrinters} 
              onPrintersChange={handlePrintersChange}
              selectedClient={selectedClient}
            />
          </div>
        );
      case 'users':
        return (
          <div>
            <div className="mb-6">
              <ClientSelector 
                clients={clients}
                selectedClient={selectedClient}
                onClientChange={setSelectedClient}
              />
            </div>
            <UsersTable 
              users={clientUsers} 
              onUsersChange={handleUsersChange}
              selectedClient={selectedClient}
            />
          </div>
        );
      case 'onboarding':
        return (
          <OnboardingDashboard 
            onClientsChange={handleClientsChange}
          />
        );
      case 'pricing':
        return (
          <div>
            <div className="mb-6">
              <ClientSelector 
                clients={clients}
                selectedClient={selectedClient}
                onClientChange={setSelectedClient}
              />
            </div>
            <PricingDashboard 
              clients={clients}
              selectedClient={selectedClient}
            />
          </div>
        );
      case 'profile':
        return <ProfileSettings />;
      case 'analytics':
        return (
          <div>
            <div className="mb-6">
              <ClientSelector 
                clients={clients}
                selectedClient={selectedClient}
                onClientChange={setSelectedClient}
              />
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {isOverallView ? 'Overall Analytics & Reports' : `${currentClientName} Analytics`}
              </h2>
              <p className="text-gray-600">
                {isOverallView 
                  ? 'Comprehensive printing analytics across all clients'
                  : 'Client-specific printing analytics and cost reports'
                }
              </p>
            </div>
            <DashboardCharts />
          </div>
        );
      case 'monitoring':
        return (
          <div>
            <div className="mb-6">
              <ClientSelector 
                clients={clients}
                selectedClient={selectedClient}
                onClientChange={setSelectedClient}
              />
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {isOverallView ? 'System-wide Monitoring' : `${currentClientName} Monitoring`}
              </h2>
              <p className="text-gray-600">
                {isOverallView 
                  ? 'Real-time monitoring across all clients'
                  : 'Live print job queue and client system status'
                }
              </p>
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
                    <span className="text-sm text-gray-600">Server Status</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database Connection</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Endpoint</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Clients</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{clients.length} Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Server URL</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-mono">{window.location.origin}</span>
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
        <Header activeTab={activeTab} clientName={currentClientName} />
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;