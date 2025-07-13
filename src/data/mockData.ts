// Production-ready data - NO dummy/sample data
import { PrintJob, Printer, User, DashboardStats } from '../types';

// PRODUCTION: All arrays start empty - no dummy data
export const mockPrinters: Printer[] = [];
export const mockUsers: User[] = [];
export const mockPrintJobs: PrintJob[] = [];

// PRODUCTION: Zero stats for clean system
export const mockDashboardStats: DashboardStats = {
  totalJobs: 0,
  totalPages: 0,
  activePrinters: 0,
  totalCost: 0,
  jobsToday: 0,
  failureRate: 0
};

// PRODUCTION: Empty chart data
export const chartData = [
  { name: 'Mon', jobs: 0, pages: 0, cost: 0 },
  { name: 'Tue', jobs: 0, pages: 0, cost: 0 },
  { name: 'Wed', jobs: 0, pages: 0, cost: 0 },
  { name: 'Thu', jobs: 0, pages: 0, cost: 0 },
  { name: 'Fri', jobs: 0, pages: 0, cost: 0 },
  { name: 'Sat', jobs: 0, pages: 0, cost: 0 },
  { name: 'Sun', jobs: 0, pages: 0, cost: 0 }
];

export const departmentData = [
  { name: 'Finance', value: 0, color: '#3B82F6' },
  { name: 'Marketing', value: 0, color: '#10B981' },
  { name: 'Operations', value: 0, color: '#F59E0B' },
  { name: 'IT', value: 0, color: '#EF4444' },
  { name: 'HR', value: 0, color: '#8B5CF6' }
];

// PRODUCTION: No helper functions that return dummy data