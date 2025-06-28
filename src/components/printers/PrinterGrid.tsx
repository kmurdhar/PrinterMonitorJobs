import React from 'react';
import { Printer, MapPin, Wifi, WifiOff, AlertTriangle, Clock } from 'lucide-react';
import { Printer as PrinterType } from '../../types';

interface PrinterGridProps {
  printers: PrinterType[];
}

const PrinterGrid: React.FC<PrinterGridProps> = ({ printers }) => {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {printers.map((printer) => (
        <div key={printer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Printer className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{printer.name}</h3>
                <p className="text-sm text-gray-600">{printer.model}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(printer.status)}
              <span className={`w-3 h-3 rounded-full ${getStatusColor(printer.status)}`}></span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{printer.location}</span>
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
            </div>

            {printer.status === 'error' && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">Paper jam detected</p>
                <p className="text-xs text-red-600 mt-1">Requires manual intervention</p>
              </div>
            )}

            {printer.status === 'warning' && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium">Low paper level</p>
                <p className="text-xs text-yellow-600 mt-1">Refill recommended</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PrinterGrid;