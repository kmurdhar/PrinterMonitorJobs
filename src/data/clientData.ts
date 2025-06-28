import { Client } from '../types';

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
    userCount: 25
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
    userCount: 18
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
    userCount: 22
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
    userCount: 35
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
    userCount: 12
  }
];

// Generate aggregated stats for overall view
export const generateOverallStats = () => {
  return {
    totalJobs: 0,
    totalPages: 0,
    activePrinters: 15, // 5 clients × 3 printers each
    totalCost: 0,
    jobsToday: 0,
    failureRate: 0,
    activeUsers: 112, // Sum of all users
    clientCount: 5
  };
};

// Generate client-specific stats
export const generateClientStats = (clientId: string) => {
  const client = mockClients.find(c => c.id === clientId);
  if (!client) {
    return {
      totalJobs: 0,
      totalPages: 0,
      activePrinters: 0,
      totalCost: 0,
      jobsToday: 0,
      failureRate: 0,
      activeUsers: 0
    };
  }

  return {
    totalJobs: 0,
    totalPages: 0,
    activePrinters: 0, // Will be updated when printers are online
    totalCost: 0,
    jobsToday: 0,
    failureRate: 0,
    activeUsers: 0 // Will be updated when users are active
  };
};