import { PrintJob, Printer, User, DashboardStats } from '../types';

const generateTimestamp = (daysAgo: number, hoursAgo: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  return date;
};

export const mockPrintJobs: PrintJob[] = [
  {
    id: '1',
    fileName: 'Q3_Financial_Report.pdf',
    user: 'John Smith',
    department: 'Finance',
    printer: 'HP LaserJet Pro M404n - Finance',
    pages: 15,
    status: 'success',
    timestamp: generateTimestamp(0, 2),
    cost: 1.50,
    fileSize: '2.3 MB',
    paperSize: 'A4',
    colorMode: 'blackwhite'
  },
  {
    id: '2',
    fileName: 'Marketing_Presentation.pptx',
    user: 'Sarah Johnson',
    department: 'Marketing',
    printer: 'Canon PIXMA Pro-200 - Marketing',
    pages: 24,
    status: 'success',
    timestamp: generateTimestamp(0, 1),
    cost: 4.80,
    fileSize: '5.7 MB',
    paperSize: 'A4',
    colorMode: 'color'
  },
  {
    id: '3',
    fileName: 'Employee_Handbook.docx',
    user: 'Mike Wilson',
    department: 'HR',
    printer: 'HP LaserJet Pro M404n - Finance',
    pages: 0,
    status: 'failed',
    timestamp: generateTimestamp(0, 3),
    cost: 0,
    fileSize: '1.2 MB',
    paperSize: 'A4',
    colorMode: 'blackwhite'
  },
  {
    id: '4',
    fileName: 'Project_Timeline.xlsx',
    user: 'Emily Davis',
    department: 'Operations',
    printer: 'Brother HL-L2350DW - Operations',
    pages: 3,
    status: 'success',
    timestamp: generateTimestamp(1, 5),
    cost: 0.30,
    fileSize: '0.8 MB',
    paperSize: 'A4',
    colorMode: 'blackwhite'
  },
  {
    id: '5',
    fileName: 'Product_Catalog.pdf',
    user: 'David Brown',
    department: 'Sales',
    printer: 'Canon PIXMA Pro-200 - Marketing',
    pages: 48,
    status: 'success',
    timestamp: generateTimestamp(1, 2),
    cost: 9.60,
    fileSize: '12.4 MB',
    paperSize: 'A4',
    colorMode: 'color'
  },
  {
    id: '6',
    fileName: 'Security_Policies.pdf',
    user: 'Lisa Anderson',
    department: 'IT',
    printer: 'HP LaserJet Pro M404n - Finance',
    pages: 12,
    status: 'success',
    timestamp: generateTimestamp(2, 1),
    cost: 1.20,
    fileSize: '1.9 MB',
    paperSize: 'A4',
    colorMode: 'blackwhite'
  }
];

export const mockPrinters: Printer[] = [
  {
    id: '1',
    name: 'HP LaserJet Pro M404n - Finance',
    location: 'Finance Department - Floor 3',
    model: 'HP LaserJet Pro M404n',
    status: 'online',
    paperLevel: 85,
    tonerLevel: 45,
    jobsToday: 23,
    lastActivity: generateTimestamp(0, 1),
    ipAddress: '192.168.1.101',
    department: 'Finance'
  },
  {
    id: '2',
    name: 'Canon PIXMA Pro-200 - Marketing',
    location: 'Marketing Department - Floor 2',
    model: 'Canon PIXMA Pro-200',
    status: 'warning',
    paperLevel: 15,
    tonerLevel: 78,
    jobsToday: 18,
    lastActivity: generateTimestamp(0, 0),
    ipAddress: '192.168.1.102',
    department: 'Marketing'
  },
  {
    id: '3',
    name: 'Brother HL-L2350DW - Operations',
    location: 'Operations Department - Floor 1',
    model: 'Brother HL-L2350DW',
    status: 'online',
    paperLevel: 92,
    tonerLevel: 88,
    jobsToday: 15,
    lastActivity: generateTimestamp(0, 2),
    ipAddress: '192.168.1.103',
    department: 'Operations'
  },
  {
    id: '4',
    name: 'Xerox WorkCentre 6515 - IT',
    location: 'IT Department - Floor 4',
    model: 'Xerox WorkCentre 6515',
    status: 'error',
    paperLevel: 0,
    tonerLevel: 25,
    jobsToday: 0,
    lastActivity: generateTimestamp(0, 8),
    ipAddress: '192.168.1.104',
    department: 'IT'
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Smith',
    department: 'Finance',
    jobsToday: 8,
    pagesTotal: 156,
    costTotal: 18.75,
    lastActivity: generateTimestamp(0, 2)
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    department: 'Marketing',
    jobsToday: 12,
    pagesTotal: 243,
    costTotal: 32.40,
    lastActivity: generateTimestamp(0, 1)
  },
  {
    id: '3',
    name: 'Mike Wilson',
    department: 'HR',
    jobsToday: 5,
    pagesTotal: 89,
    costTotal: 12.20,
    lastActivity: generateTimestamp(0, 3)
  },
  {
    id: '4',
    name: 'Emily Davis',
    department: 'Operations',
    jobsToday: 6,
    pagesTotal: 124,
    costTotal: 15.60,
    lastActivity: generateTimestamp(1, 5)
  }
];

export const mockDashboardStats: DashboardStats = {
  totalJobs: 1247,
  totalPages: 18456,
  activePrinters: 3,
  totalCost: 2847.65,
  jobsToday: 49,
  failureRate: 3.2
};

export const chartData = [
  { name: 'Mon', jobs: 45, pages: 680, cost: 89.50 },
  { name: 'Tue', jobs: 52, pages: 745, cost: 102.30 },
  { name: 'Wed', jobs: 38, pages: 590, cost: 78.40 },
  { name: 'Thu', jobs: 49, pages: 712, cost: 95.60 },
  { name: 'Fri', jobs: 56, pages: 834, cost: 115.20 },
  { name: 'Sat', jobs: 12, pages: 145, cost: 18.75 },
  { name: 'Sun', jobs: 8, pages: 98, cost: 12.50 }
];

export const departmentData = [
  { name: 'Finance', value: 35, color: '#3B82F6' },
  { name: 'Marketing', value: 25, color: '#10B981' },
  { name: 'Operations', value: 20, color: '#F59E0B' },
  { name: 'IT', value: 12, color: '#EF4444' },
  { name: 'HR', value: 8, color: '#8B5CF6' }
];