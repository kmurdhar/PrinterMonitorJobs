export interface PrintJob {
  id: string;
  fileName: string;
  user: string;
  department: string;
  printer: string;
  pages: number;
  status: 'success' | 'failed' | 'pending';
  timestamp: Date;
  cost: number;
  fileSize: string;
  paperSize: string;
  colorMode: 'color' | 'blackwhite';
}

export interface Printer {
  id: string;
  name: string;
  location: string;
  model: string;
  status: 'online' | 'offline' | 'error' | 'warning';
  paperLevel: number;
  tonerLevel: number;
  jobsToday: number;
  lastActivity: Date;
  ipAddress: string;
  department: string;
}

export interface User {
  id: string;
  name: string;
  department: string;
  jobsToday: number;
  pagesTotal: number;
  costTotal: number;
  lastActivity: Date;
}

export interface DashboardStats {
  totalJobs: number;
  totalPages: number;
  activePrinters: number;
  totalCost: number;
  jobsToday: number;
  failureRate: number;
}