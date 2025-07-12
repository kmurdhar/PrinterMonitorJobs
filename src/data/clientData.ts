import { Client } from '../types';

// Production-ready client data - starts empty
export const mockClients: Client[] = [];

// Generate aggregated stats for overall view - production ready
export const generateOverallStats = () => {
  // In production, this will calculate from real data
  return {
    totalJobs: 0,
    totalPages: 0,
    activePrinters: 0,
    totalCost: 0,
    jobsToday: 0,
    failureRate: 0,
    activeUsers: 0,
    clientCount: 0
  };
};

// Generate client-specific stats - production ready
export const generateClientStats = (clientId: string) => {
  // In production, this will calculate from real client data
  return {
    totalJobs: 0,
    totalPages: 0,
    activePrinters: 0,
    totalCost: 0,
    jobsToday: 0,
    failureRate: 0,
    activeUsers: 0
  };
};