import React from 'react';
import { FileText, Printer, DollarSign, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { DashboardStats } from '../../types';

interface StatsCardsProps {
  stats: DashboardStats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Jobs Today',
      value: stats.jobsToday.toLocaleString(),
      icon: FileText,
      color: 'bg-blue-500',
      change: stats.jobsToday > 0 ? '+12%' : 'No data',
      changeColor: stats.jobsToday > 0 ? 'text-green-600' : 'text-gray-500'
    },
    {
      title: 'Active Printers',
      value: `${stats.activePrinters}/3`,
      icon: Printer,
      color: 'bg-green-500',
      change: stats.activePrinters > 0 ? '100% uptime' : 'Offline',
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
      change: stats.totalCost > 0 ? '+5%' : 'No data',
      changeColor: stats.totalCost > 0 ? 'text-green-600' : 'text-gray-500'
    },
    {
      title: 'Failure Rate',
      value: `${stats.failureRate}%`,
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: stats.failureRate === 0 ? 'Excellent' : '-2%',
      changeColor: stats.failureRate === 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Active Users',
      value: '0',
      icon: Users,
      color: 'bg-indigo-500',
      change: 'No activity',
      changeColor: 'text-gray-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
  );
};

export default StatsCards;