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

// Function to generate chart data from real print jobs
export const generateChartData = (printJobs: PrintJob[]) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const chartData = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1]; // Adjust for Monday start
    
    // Filter jobs for this specific day
    const dayJobs = printJobs.filter(job => {
      const jobDate = new Date(job.timestamp);
      return jobDate.toDateString() === date.toDateString();
    });
    
    const dayStats = {
      name: dayName,
      jobs: dayJobs.length,
      pages: dayJobs.reduce((sum, job) => sum + job.pages, 0),
      cost: dayJobs.reduce((sum, job) => sum + job.cost, 0)
    };
    
    chartData.push(dayStats);
  }
  
  return chartData;
};

// Function to generate department data from real print jobs
export const generateDepartmentData = (printJobs: PrintJob[]) => {
  const departmentColors = {
    'Finance': '#3B82F6',
    'Marketing': '#10B981', 
    'Operations': '#F59E0B',
    'IT': '#EF4444',
    'HR': '#8B5CF6',
    'General': '#6B7280',
    'Administration': '#7C3AED',
    'Sales': '#EC4899',
    'Legal': '#F97316'
  };
  
  // Count jobs by department
  const departmentCounts = {};
  const totalJobs = printJobs.length;
  
  printJobs.forEach(job => {
    const dept = job.department || 'General';
    departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
  });
  
  // Convert to percentage data for pie chart
  return Object.entries(departmentCounts).map(([name, count]) => ({
    name,
    value: totalJobs > 0 ? Math.round((count as number / totalJobs) * 100) : 0,
    color: departmentColors[name as keyof typeof departmentColors] || '#6B7280'
  }));
};

// PRODUCTION: No helper functions that return dummy data