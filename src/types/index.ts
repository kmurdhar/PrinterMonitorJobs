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
  pricingConfig?: PricingConfig;
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

export interface PricingConfig {
  id: string;
  clientId: string;
  name: string;
  blackWhitePerPage: number;
  colorPerPage: number;
  paperSizes: {
    A4: number;
    A3: number;
    Letter: number;
    Legal: number;
  };
  departmentMultipliers: {
    [department: string]: number;
  };
  volumeDiscounts: {
    threshold: number;
    discount: number;
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  avatar?: string;
  phone?: string;
  department: string;
  permissions: string[];
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
      printerAlerts: boolean;
      lowSupplies: boolean;
      jobFailures: boolean;
    };
    dashboard: {
      defaultView: string;
      refreshInterval: number;
      showAdvancedMetrics: boolean;
    };
  };
  lastLogin: Date;
  createdAt: Date;
}

export interface SystemSettings {
  id: string;
  general: {
    systemName: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    language: string;
  };
  security: {
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
    twoFactorAuth: boolean;
    ipWhitelist: string[];
  };
  monitoring: {
    dataRetentionDays: number;
    alertThresholds: {
      paperLevel: number;
      tonerLevel: number;
      failureRate: number;
    };
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
  };
  integrations: {
    email: {
      enabled: boolean;
      smtpServer: string;
      smtpPort: number;
      username: string;
      useSSL: boolean;
    };
    webhook: {
      enabled: boolean;
      url: string;
      events: string[];
    };
  };
}