// Sample data for demonstration - will be replaced with real data from database
import { PrintJob, Printer, User, DashboardStats } from '../types';

// Sample printers for each client
export const mockPrinters: Printer[] = [
  // TechCorp Solutions printers
  {
    id: 'printer-techcorp-01',
    name: 'TechCorp-Printer-01',
    location: 'Reception Area',
    model: 'HP LaserJet Pro M404n',
    status: 'online',
    paperLevel: 85,
    tonerLevel: 45,
    jobsToday: 12,
    lastActivity: new Date(),
    ipAddress: '192.168.1.101',
    department: 'Administration',
    clientId: 'techcorp-001',
    serialNumber: 'HP001TC',
    installDate: new Date('2024-01-15')
  },
  {
    id: 'printer-techcorp-02',
    name: 'TechCorp-Printer-02',
    location: 'Development Floor',
    model: 'Canon PIXMA Pro-200',
    status: 'online',
    paperLevel: 92,
    tonerLevel: 78,
    jobsToday: 8,
    lastActivity: new Date(),
    ipAddress: '192.168.1.102',
    department: 'Development',
    clientId: 'techcorp-001',
    serialNumber: 'CN002TC',
    installDate: new Date('2024-01-15')
  },
  {
    id: 'printer-techcorp-03',
    name: 'TechCorp-Printer-03',
    location: 'Management Office',
    model: 'Brother HL-L2350DW',
    status: 'warning',
    paperLevel: 15,
    tonerLevel: 25,
    jobsToday: 5,
    lastActivity: new Date(),
    ipAddress: '192.168.1.103',
    department: 'Management',
    clientId: 'techcorp-001',
    serialNumber: 'BR003TC',
    installDate: new Date('2024-01-15')
  },

  // Marketing Plus printers
  {
    id: 'printer-marketing-01',
    name: 'Marketing-Printer-01',
    location: 'Creative Studio',
    model: 'HP OfficeJet Pro 9015e',
    status: 'online',
    paperLevel: 67,
    tonerLevel: 89,
    jobsToday: 15,
    lastActivity: new Date(),
    ipAddress: '192.168.2.101',
    department: 'Creative',
    clientId: 'marketing-002',
    serialNumber: 'HP001MP',
    installDate: new Date('2024-01-20')
  },
  {
    id: 'printer-marketing-02',
    name: 'Marketing-Printer-02',
    location: 'Main Office',
    model: 'Canon imageCLASS MF445dw',
    status: 'online',
    paperLevel: 88,
    tonerLevel: 56,
    jobsToday: 11,
    lastActivity: new Date(),
    ipAddress: '192.168.2.102',
    department: 'Marketing',
    clientId: 'marketing-002',
    serialNumber: 'CN002MP',
    installDate: new Date('2024-01-20')
  },
  {
    id: 'printer-marketing-03',
    name: 'Marketing-Printer-03',
    location: 'Conference Room',
    model: 'Xerox VersaLink C405',
    status: 'offline',
    paperLevel: 0,
    tonerLevel: 12,
    jobsToday: 0,
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    ipAddress: '192.168.2.103',
    department: 'Administration',
    clientId: 'marketing-002',
    serialNumber: 'XR003MP',
    installDate: new Date('2024-01-20')
  },

  // Finance Group printers
  {
    id: 'printer-finance-01',
    name: 'Finance-Printer-01',
    location: 'Accounting Department',
    model: 'Brother MFC-L3770CDW',
    status: 'online',
    paperLevel: 95,
    tonerLevel: 72,
    jobsToday: 18,
    lastActivity: new Date(),
    ipAddress: '192.168.3.101',
    department: 'Finance',
    clientId: 'finance-003',
    serialNumber: 'BR001FG',
    installDate: new Date('2024-02-01')
  },
  {
    id: 'printer-finance-02',
    name: 'Finance-Printer-02',
    location: 'Executive Floor',
    model: 'HP LaserJet Pro M404n',
    status: 'online',
    paperLevel: 78,
    tonerLevel: 91,
    jobsToday: 7,
    lastActivity: new Date(),
    ipAddress: '192.168.3.102',
    department: 'Executive',
    clientId: 'finance-003',
    serialNumber: 'HP002FG',
    installDate: new Date('2024-02-01')
  },
  {
    id: 'printer-finance-03',
    name: 'Finance-Printer-03',
    location: 'Reception',
    model: 'Epson WorkForce Pro WF-3720',
    status: 'error',
    paperLevel: 45,
    tonerLevel: 8,
    jobsToday: 0,
    lastActivity: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    ipAddress: '192.168.3.103',
    department: 'Administration',
    clientId: 'finance-003',
    serialNumber: 'EP003FG',
    installDate: new Date('2024-02-01')
  },

  // Healthcare Inc printers
  {
    id: 'printer-healthcare-01',
    name: 'Healthcare-Printer-01',
    location: 'Nurses Station',
    model: 'HP LaserJet Pro M404n',
    status: 'online',
    paperLevel: 82,
    tonerLevel: 65,
    jobsToday: 22,
    lastActivity: new Date(),
    ipAddress: '192.168.4.101',
    department: 'Medical',
    clientId: 'healthcare-004',
    serialNumber: 'HP001HI',
    installDate: new Date('2024-02-10')
  },
  {
    id: 'printer-healthcare-02',
    name: 'Healthcare-Printer-02',
    location: 'Administration',
    model: 'Canon PIXMA Pro-200',
    status: 'online',
    paperLevel: 91,
    tonerLevel: 83,
    jobsToday: 14,
    lastActivity: new Date(),
    ipAddress: '192.168.4.102',
    department: 'Administration',
    clientId: 'healthcare-004',
    serialNumber: 'CN002HI',
    installDate: new Date('2024-02-10')
  },
  {
    id: 'printer-healthcare-03',
    name: 'Healthcare-Printer-03',
    location: 'Records Department',
    model: 'Brother HL-L2350DW',
    status: 'online',
    paperLevel: 73,
    tonerLevel: 41,
    jobsToday: 9,
    lastActivity: new Date(),
    ipAddress: '192.168.4.103',
    department: 'Records',
    clientId: 'healthcare-004',
    serialNumber: 'BR003HI',
    installDate: new Date('2024-02-10')
  },

  // Education Hub printers
  {
    id: 'printer-education-01',
    name: 'Education-Printer-01',
    location: 'Main Office',
    model: 'HP OfficeJet Pro 9015e',
    status: 'online',
    paperLevel: 88,
    tonerLevel: 76,
    jobsToday: 16,
    lastActivity: new Date(),
    ipAddress: '192.168.5.101',
    department: 'Administration',
    clientId: 'education-005',
    serialNumber: 'HP001EH',
    installDate: new Date('2024-02-15')
  },
  {
    id: 'printer-education-02',
    name: 'Education-Printer-02',
    location: 'Teachers Lounge',
    model: 'Canon imageCLASS MF445dw',
    status: 'online',
    paperLevel: 94,
    tonerLevel: 58,
    jobsToday: 12,
    lastActivity: new Date(),
    ipAddress: '192.168.5.102',
    department: 'Education',
    clientId: 'education-005',
    serialNumber: 'CN002EH',
    installDate: new Date('2024-02-15')
  },
  {
    id: 'printer-education-03',
    name: 'Education-Printer-03',
    location: 'Library',
    model: 'Brother MFC-L3770CDW',
    status: 'warning',
    paperLevel: 22,
    tonerLevel: 18,
    jobsToday: 6,
    lastActivity: new Date(),
    ipAddress: '192.168.5.103',
    department: 'Library',
    clientId: 'education-005',
    serialNumber: 'BR003EH',
    installDate: new Date('2024-02-15')
  }
];

// Sample users for each client
export const mockUsers: User[] = [
  // TechCorp Solutions users
  {
    id: 'user-techcorp-01',
    name: 'John Smith',
    department: 'Development',
    jobsToday: 8,
    pagesTotal: 1247,
    costTotal: 62.35,
    lastActivity: new Date(),
    clientId: 'techcorp-001',
    email: 'john.smith@techcorp.com',
    role: 'user'
  },
  {
    id: 'user-techcorp-02',
    name: 'Sarah Johnson',
    department: 'Administration',
    jobsToday: 12,
    pagesTotal: 2156,
    costTotal: 107.80,
    lastActivity: new Date(),
    clientId: 'techcorp-001',
    email: 'sarah.johnson@techcorp.com',
    role: 'admin'
  },
  {
    id: 'user-techcorp-03',
    name: 'Mike Davis',
    department: 'Development',
    jobsToday: 5,
    pagesTotal: 892,
    costTotal: 44.60,
    lastActivity: new Date(),
    clientId: 'techcorp-001',
    email: 'mike.davis@techcorp.com',
    role: 'user'
  },
  {
    id: 'user-techcorp-04',
    name: 'Emily Chen',
    department: 'Management',
    jobsToday: 3,
    pagesTotal: 567,
    costTotal: 28.35,
    lastActivity: new Date(),
    clientId: 'techcorp-001',
    email: 'emily.chen@techcorp.com',
    role: 'manager'
  },

  // Marketing Plus users
  {
    id: 'user-marketing-01',
    name: 'David Wilson',
    department: 'Creative',
    jobsToday: 15,
    pagesTotal: 1834,
    costTotal: 91.70,
    lastActivity: new Date(),
    clientId: 'marketing-002',
    email: 'david.wilson@marketingplus.com',
    role: 'user'
  },
  {
    id: 'user-marketing-02',
    name: 'Lisa Brown',
    department: 'Marketing',
    jobsToday: 11,
    pagesTotal: 1456,
    costTotal: 72.80,
    lastActivity: new Date(),
    clientId: 'marketing-002',
    email: 'lisa.brown@marketingplus.com',
    role: 'admin'
  },
  {
    id: 'user-marketing-03',
    name: 'Tom Anderson',
    department: 'Creative',
    jobsToday: 9,
    pagesTotal: 1123,
    costTotal: 56.15,
    lastActivity: new Date(),
    clientId: 'marketing-002',
    email: 'tom.anderson@marketingplus.com',
    role: 'user'
  },

  // Finance Group users
  {
    id: 'user-finance-01',
    name: 'Jennifer Lee',
    department: 'Finance',
    jobsToday: 18,
    pagesTotal: 2234,
    costTotal: 111.70,
    lastActivity: new Date(),
    clientId: 'finance-003',
    email: 'jennifer.lee@financegroup.com',
    role: 'admin'
  },
  {
    id: 'user-finance-02',
    name: 'Robert Taylor',
    department: 'Finance',
    jobsToday: 14,
    pagesTotal: 1789,
    costTotal: 89.45,
    lastActivity: new Date(),
    clientId: 'finance-003',
    email: 'robert.taylor@financegroup.com',
    role: 'user'
  },
  {
    id: 'user-finance-03',
    name: 'Amanda White',
    department: 'Executive',
    jobsToday: 7,
    pagesTotal: 945,
    costTotal: 47.25,
    lastActivity: new Date(),
    clientId: 'finance-003',
    email: 'amanda.white@financegroup.com',
    role: 'manager'
  },

  // Healthcare Inc users
  {
    id: 'user-healthcare-01',
    name: 'Dr. Michael Rodriguez',
    department: 'Medical',
    jobsToday: 22,
    pagesTotal: 2567,
    costTotal: 128.35,
    lastActivity: new Date(),
    clientId: 'healthcare-004',
    email: 'michael.rodriguez@healthcare.com',
    role: 'user'
  },
  {
    id: 'user-healthcare-02',
    name: 'Nurse Patricia Garcia',
    department: 'Medical',
    jobsToday: 16,
    pagesTotal: 1923,
    costTotal: 96.15,
    lastActivity: new Date(),
    clientId: 'healthcare-004',
    email: 'patricia.garcia@healthcare.com',
    role: 'user'
  },
  {
    id: 'user-healthcare-03',
    name: 'Admin Susan Miller',
    department: 'Administration',
    jobsToday: 12,
    pagesTotal: 1456,
    costTotal: 72.80,
    lastActivity: new Date(),
    clientId: 'healthcare-004',
    email: 'susan.miller@healthcare.com',
    role: 'admin'
  },

  // Education Hub users
  {
    id: 'user-education-01',
    name: 'Teacher Mary Johnson',
    department: 'Education',
    jobsToday: 16,
    pagesTotal: 1834,
    costTotal: 91.70,
    lastActivity: new Date(),
    clientId: 'education-005',
    email: 'mary.johnson@educationhub.com',
    role: 'user'
  },
  {
    id: 'user-education-02',
    name: 'Principal James Wilson',
    department: 'Administration',
    jobsToday: 8,
    pagesTotal: 1123,
    costTotal: 56.15,
    lastActivity: new Date(),
    clientId: 'education-005',
    email: 'james.wilson@educationhub.com',
    role: 'admin'
  },
  {
    id: 'user-education-03',
    name: 'Librarian Karen Davis',
    department: 'Library',
    jobsToday: 6,
    pagesTotal: 789,
    costTotal: 39.45,
    lastActivity: new Date(),
    clientId: 'education-005',
    email: 'karen.davis@educationhub.com',
    role: 'user'
  }
];

// Sample print jobs
export const mockPrintJobs: PrintJob[] = [
  {
    id: 'job-001',
    fileName: 'Project_Proposal.pdf',
    user: 'John Smith',
    department: 'Development',
    printer: 'TechCorp-Printer-01',
    pages: 12,
    status: 'success',
    timestamp: new Date(),
    cost: 0.60,
    fileSize: '2.3 MB',
    paperSize: 'A4',
    colorMode: 'blackwhite',
    clientId: 'techcorp-001'
  },
  {
    id: 'job-002',
    fileName: 'Marketing_Campaign.pdf',
    user: 'David Wilson',
    department: 'Creative',
    printer: 'Marketing-Printer-01',
    pages: 8,
    status: 'success',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    cost: 0.40,
    fileSize: '1.8 MB',
    paperSize: 'A4',
    colorMode: 'color',
    clientId: 'marketing-002'
  },
  {
    id: 'job-003',
    fileName: 'Financial_Report.xlsx',
    user: 'Jennifer Lee',
    department: 'Finance',
    printer: 'Finance-Printer-01',
    pages: 15,
    status: 'success',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    cost: 0.75,
    fileSize: '3.1 MB',
    paperSize: 'A4',
    colorMode: 'blackwhite',
    clientId: 'finance-003'
  }
];

export const mockDashboardStats: DashboardStats = {
  totalJobs: mockPrintJobs.length,
  totalPages: mockPrintJobs.reduce((sum, job) => sum + job.pages, 0),
  activePrinters: mockPrinters.filter(p => p.status === 'online').length,
  totalCost: mockPrintJobs.reduce((sum, job) => sum + job.cost, 0),
  jobsToday: mockPrintJobs.length,
  failureRate: 2.1
};

export const chartData = [
  { name: 'Mon', jobs: 45, pages: 234, cost: 11.70 },
  { name: 'Tue', jobs: 52, pages: 287, cost: 14.35 },
  { name: 'Wed', jobs: 38, pages: 198, cost: 9.90 },
  { name: 'Thu', jobs: 61, pages: 312, cost: 15.60 },
  { name: 'Fri', jobs: 49, pages: 256, cost: 12.80 },
  { name: 'Sat', jobs: 23, pages: 123, cost: 6.15 },
  { name: 'Sun', jobs: 18, pages: 89, cost: 4.45 }
];

export const departmentData = [
  { name: 'Finance', value: 28, color: '#3B82F6' },
  { name: 'Marketing', value: 22, color: '#10B981' },
  { name: 'Operations', value: 18, color: '#F59E0B' },
  { name: 'IT', value: 15, color: '#EF4444' },
  { name: 'HR', value: 17, color: '#8B5CF6' }
];

// Helper functions to filter data by client
export const getClientPrinters = (clientId: string) => {
  if (clientId === 'overall') return mockPrinters;
  return mockPrinters.filter(printer => printer.clientId === clientId);
};

export const getClientUsers = (clientId: string) => {
  if (clientId === 'overall') return mockUsers;
  return mockUsers.filter(user => user.clientId === clientId);
};

export const getClientPrintJobs = (clientId: string) => {
  if (clientId === 'overall') return mockPrintJobs;
  return mockPrintJobs.filter(job => job.clientId === clientId);
};