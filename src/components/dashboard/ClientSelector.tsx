import React from 'react';
import { Building, ChevronDown, Globe } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  printerCount: number;
  userCount: number;
}

interface ClientSelectorProps {
  clients: Client[];
  selectedClient: string;
  onClientChange: (clientId: string) => void;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({ clients, selectedClient, onClientChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const currentClient = clients.find(c => c.id === selectedClient);
  const isOverallView = selectedClient === 'overall';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors min-w-[200px]"
      >
        <div className="flex items-center space-x-2 flex-1">
          {isOverallView ? (
            <>
              <Globe className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-gray-900">Overall View</span>
            </>
          ) : (
            <>
              <Building className="h-4 w-4 text-blue-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">{currentClient?.name}</div>
                <div className="text-xs text-gray-500">
                  {currentClient?.printerCount} printers • {currentClient?.userCount} users
                </div>
              </div>
            </>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="py-1">
            <button
              onClick={() => {
                onClientChange('overall');
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                isOverallView ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <div>
                  <div className="font-medium">Overall View</div>
                  <div className="text-xs text-gray-500">All clients combined</div>
                </div>
              </div>
            </button>
            
            <div className="border-t border-gray-100 my-1"></div>
            
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => {
                  onClientChange(client.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  selectedClient === client.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-xs text-gray-500">
                        {client.printerCount} printers • {client.userCount} users
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    client.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {client.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientSelector;