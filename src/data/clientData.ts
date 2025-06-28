import { Client } from '../types';
import { getClientPrinters, getClientUsers, getClientPrintJobs } from './mockData';

// Empty clients array - start fresh
export const mockClients: Client[] = [];

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
    failureRate: allJobs.length > 0 ? 0 : 0,
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