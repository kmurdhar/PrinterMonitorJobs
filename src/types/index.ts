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
  clientId?: string; // Added for multi-client support
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
  clientId: string; // Added for multi-client support
  serialNumber?: string;
  installDate?: Date;
}

export interface User {
  id: string;
  name: string;
  department: string;
  jobsToday: number;
  pagesTotal: number;
  costTotal: number;
  lastActivity: Date;
  clientId: string; // Added for multi-client support
  email?: string;
  role?: string;
}

export interface DashboardStats {
  totalJobs: number;
  totalPages: number;
  activePrinters: number;
  totalCost: number;
  jobsToday: number;
  failureRate: number;
  clientId?: string; // Added for multi-client support
}

export interface Client {
  id: string;
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  isActive: boolean;
  createdAt: Date;
  printerCount: number;
  userCount: number;
}

export interface PrinterHealth {
  printerId: string;
  paperJam: boolean;
  lowToner: boolean;
  lowPaper: boolean;
  doorOpen: boolean;
  offline: boolean;
  lastHealthCheck: Date;
  errorMessage?: string;
}