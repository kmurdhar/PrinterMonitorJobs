import React from 'react';
import { FileText, Printer, DollarSign, AlertTriangle, TrendingUp, Users, Building, Globe, Zap } from 'lucide-react';

interface ClientStats {
  totalJobs: number;
  totalPages: number;
  activePrinters: number;
  totalCost: number;
  jobsToday: number;
  failureRate: number;
  activeUsers: number;
  clientCount?: number; // Only for overall view
}

interface ClientStatsCardsProps {
  stats: ClientStats;
  isOverallView: boolean;
  clientName?: string;
}

const ClientStatsCards: React.FC<ClientStatsCardsProps> = ({ stats, isOverallView, clientName }) => {
  const cards = [
    {
      title: 'Jobs Today',
      value: stats.jobsToday.toLocaleString(),
      icon: FileText,
      color: 'bg-blue-500',
      change: stats.jobsToday > 0 ? '+12%' : 'No activity',
      changeColor: stats.jobsToday > 0 ? 'text-green-600' : 'text-gray-500'
    },
    {
      title: isOverallView ? 'Total Printers' : 'Active Printers',
      value: isOverallView ? stats.activePrinters.toString() : `${stats.activePrinters}/3`,
      icon: Printer,
      color: 'bg-green-500',
      change: stats.activePrinters > 0 ? 'Online' : 'Offline',
      changeColor: stats.activePrinters > 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Total Pages',
      value: stats.totalPages.toLocaleString(),
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: stats.totalPages > 0 ? '+8%' : 'No data',
      changeColor: stats.totalPages > 0 ? 'text-green-600' : 'text-gray-500'
    },
    {
      title: 'Total Cost',
      value: `$${stats.totalCost.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: stats.totalCost > 0 ? '+5%' : 'No costs',
      changeColor: stats.totalCost > 0 ? 'text-green-600' : 'text-gray-500'
    },
    {
      title: 'Failure Rate',
      value: `${stats.failureRate}%`,
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: stats.failureRate === 0 ? 'Excellent' : 'Needs attention',
      changeColor: stats.failureRate === 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toString(),
      icon: Users,
      color: 'bg-indigo-500',
      change: stats.activeUsers > 0 ? 'Active' : 'No activity',
      changeColor: stats.activeUsers > 0 ? 'text-green-600' : 'text-gray-500'
    }
  ];

  // Add client count card for overall view
  if (isOverallView && stats.clientCount) {
    cards.splice(1, 0, {
      title: 'Active Clients',
      value: stats.clientCount.toString(),
      icon: Building,
      color: 'bg-cyan-500',
      change: 'Multi-tenant',
      changeColor: 'text-blue-600'
    });
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {isOverallView ? (
            <Globe className="h-6 w-6 text-blue-600" />
          ) : (
            <Building className="h-6 w-6 text-blue-600" />
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isOverallView ? 'Overall System Statistics' : `${clientName} Statistics`}
            </h2>
            <p className="text-sm text-gray-600">
              {isOverallView 
                ? 'Aggregated data across all clients' 
                : 'Real-time metrics for this client'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Last updated</p>
            <p className="text-sm font-medium text-gray-900">{new Date().toLocaleTimeString()}</p>
          </div>
          {stats.totalJobs === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Try simulating print jobs to see data
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                  <p className={`text-sm mt-2 ${card.changeColor}`}>
                    {card.change}
                  </p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClientStatsCards;