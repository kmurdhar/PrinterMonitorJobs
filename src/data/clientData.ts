import { Client } from '../types';
import { getClientPrinters, getClientUsers, getClientPrintJobs } from './mockData';

export const mockClients: Client[] = [
  {
    id: 'techcorp-001',
    name: 'TechCorp Solutions',
    address: '123 Business Ave, City, State 12345',
    contactEmail: 'admin@techcorp.com',
    contactPhone: '+1-555-0101',
    subscriptionPlan: 'enterprise',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    printerCount: 3,
    userCount: 4
  },
  {
    id: 'marketing-002',
    name: 'Marketing Plus',
    address: '456 Creative St, City, State 12346',
    contactEmail: 'admin@marketingplus.com',
    contactPhone: '+1-555-0102',
    subscriptionPlan: 'premium',
    isActive: true,
    createdAt: new Date('2024-01-20'),
    printerCount: 3,
    userCount: 3
  },
  {
    id: 'finance-003',
    name: 'Finance Group',
    address: '789 Money Blvd, City, State 12347',
    contactEmail: 'admin@financegroup.com',
    contactPhone: '+1-555-0103',
    subscriptionPlan: 'premium',
    isActive: true,
    createdAt: new Date('2024-02-01'),
    printerCount: 3,
    userCount: 3
  },
  {
    id: 'healthcare-004',
    name: 'Healthcare Inc',
    address: '321 Medical Dr, City, State 12348',
    contactEmail: 'admin@healthcare.com',
    contactPhone: '+1-555-0104',
    subscriptionPlan: 'enterprise',
    isActive: true,
    createdAt: new Date('2024-02-10'),
    printerCount: 3,
    userCount: 3
  },
  {
    id: 'education-005',
    name: 'Education Hub',
    address: '654 Learning Ln, City, State 12349',
    contactEmail: 'admin@educationhub.com',
    contactPhone: '+1-555-0105',
    subscriptionPlan: 'basic',
    isActive: true,
    createdAt: new Date('2024-02-15'),
    printerCount: 3,
    userCount: 3
  }
];

// Generate aggregated stats for overall view
export const generateOverallStats = () => {
  const allPrinters = getClientPrinters('overall');
  const allUsers = getClientUsers('overall');
  const allJobs = getClientPrintJobs('overall');
  
  return {
    totalJobs: allJobs.length,
    totalPages: allJobs.reduce((sum, job) => sum + job.pages, 0),
    activePrinters: allPrinters.filter(p => p.status === 'online').length,
    totalCost: allJobs.reduce((sum, job) => sum + job.cost, 0),
    jobsToday: allJobs.length,
    failureRate: 2.1,
    activeUsers: allUsers.length,
    clientCount: mockClients.length
  };
};

// Generate client-specific stats
export const generateClientStats = (clientId: string) => {
  const clientPrinters = getClientPrinters(clientId);
  const clientUsers = getClientUsers(clientId);
  const clientJobs = getClientPrintJobs(clientId);

  return {
    totalJobs: clientJobs.length,
    totalPages: clientJobs.reduce((sum, job) => sum + job.pages, 0),
    activePrinters: clientPrinters.filter(p => p.status === 'online').length,
    totalCost: clientJobs.reduce((sum, job) => sum + job.cost, 0),
    jobsToday: clientJobs.length,
    failureRate: clientJobs.length > 0 ? 0 : 0,
    activeUsers: clientUsers.length
  };
};