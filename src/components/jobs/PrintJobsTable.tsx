import React, { useState } from 'react';
import { FileText, User, Printer, Calendar, AlertCircle, CheckCircle, Clock, Plus, Monitor, Building, Zap } from 'lucide-react';
import { PrintJob } from '../../types';

interface PrintJobsTableProps {
  jobs: PrintJob[];
  onJobsChange?: (jobs: PrintJob[]) => void;
  selectedClient: string;
}

const PrintJobsTable: React.FC<PrintJobsTableProps> = ({ jobs, onJobsChange, selectedClient }) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('timestamp');
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);

  const filteredJobs = jobs.filter(job => 
    filterStatus === 'all' || job.status === filterStatus
  );

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'timestamp') {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
    return 0;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'success':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const simulatePrintJob = () => {
    const sampleJobs = [
      {
        fileName: 'Financial_Report_Q4.pdf',
        systemName: 'FINANCE-PC-01',
        printer: 'HP-LaserJet-Pro-01',
        pages: 15,
        department: 'Finance'
      },
      {
        fileName: 'Marketing_Proposal.docx',
        systemName: 'MARKETING-LAPTOP-03',
        printer: 'Canon-PIXMA-02',
        pages: 8,
        department: 'Marketing'
      },
      {
        fileName: 'Employee_Handbook.pdf',
        systemName: 'HR-WORKSTATION-02',
        printer: 'Brother-HL-L2350DW-03',
        pages: 42,
        department: 'HR'
      },
      {
        fileName: 'Project_Timeline.xlsx',
        systemName: 'OPERATIONS-PC-05',
        printer: 'HP-LaserJet-Pro-01',
        pages: 3,
        department: 'Operations'
      },
      {
        fileName: 'Invoice_Template.pdf',
        systemName: 'ADMIN-LAPTOP-01',
        printer: 'Canon-PIXMA-02',
        pages: 2,
        department: 'Administration'
      },
      {
        fileName: 'IT_Security_Policy.pdf',
        systemName: 'IT-DESKTOP-07',
        printer: 'Brother-HL-L2350DW-03',
        pages: 12,
        department: 'IT'
      },
      {
        fileName: 'Sales_Presentation.pptx',
        systemName: 'SALES-LAPTOP-04',
        printer: 'Canon-PIXMA-02',
        pages: 25,
        department: 'Sales'
      }
    ];

    const randomJob = sampleJobs[Math.floor(Math.random() * sampleJobs.length)];
    
    const newJob: PrintJob = {
      id: `job-${Date.now()}`,
      fileName: randomJob.fileName,
      user: randomJob.systemName, // Using system name as user identifier
      systemName: randomJob.systemName,
      department: randomJob.department,
      printer: randomJob.printer,
      pages: randomJob.pages,
      status: Math.random() > 0.1 ? 'success' : 'failed', // 90% success rate
      timestamp: new Date(),
      cost: randomJob.pages * 0.05, // $0.05 per page
      fileSize: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
      paperSize: 'A4',
      colorMode: Math.random() > 0.7 ? 'color' : 'blackwhite',
      clientId: selectedClient === 'overall' ? 'default-client' : selectedClient
    };

    if (onJobsChange) {
      onJobsChange([newJob, ...jobs]);
    }
    setIsSimulateModalOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Troubleshooting Section */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6 text-left max-w-2xl mx-auto">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-yellow-900 mb-2">Not seeing print jobs? Check:</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• <strong>Server URL:</strong> Client machine can reach {window.location.origin}</li>
                  <li>• <strong>Print Listener:</strong> PowerShell script is running as Administrator</li>
                  <li>• <strong>Network:</strong> No firewall blocking port 3000</li>
                  <li>• <strong>Client ID:</strong> Correct client ID in the URL</li>
                  <li>• <strong>Test Print:</strong> Try printing a document from the client machine</li>
                </ul>
                <div className="mt-3 p-2 bg-white border border-yellow-300 rounded">
                  <p className="text-sm text-yellow-900">
                    <strong>Current Client:</strong> <span className="font-mono">{selectedClient}</span>
                  </p>
                  <p className="text-sm text-yellow-900">
                    <strong>API Endpoint:</strong> <span className="font-mono">{window.location.origin.replace(':5173', ':3000')}/api</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSimulateModalOpen(true)}
              className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Zap className="h-4 w-4" />
              <span>Simulate Print Job (Test)</span>
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Print Job History</h2>
              <p className="text-sm text-gray-600 mt-1">
                Automatically captured print jobs from any system in the organization
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="success">Successful</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="timestamp">Sort by Date</option>
                <option value="user">Sort by System</option>
                <option value="pages">Sort by Pages</option>
              </select>
            </div>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <FileText className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Print Jobs Captured Yet</h3>
            <p className="text-gray-600 mb-6">
              Print jobs will automatically appear here when users print from any system in the organization.
            </p>
            
            {/* How it Works Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left max-w-2xl mx-auto">
              <div className="flex items-start space-x-3">
                <Monitor className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-2">How Print Capture Works:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Windows Print Listener monitors all print jobs</li>
                    <li>• Captures system name, document, date, and page count</li>
                    <li>• No need to pre-configure users - works with any system</li>
                    <li>• Automatically detects department based on system naming</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Simulate Button */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900 mb-2">Ready for Real Print Jobs</p>
                <p className="text-sm text-gray-500">
                  Install the Print Listener on client computers to start capturing real print jobs
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    System & Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Printer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pages & Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{job.fileName}</p>
                          <p className="text-xs text-gray-500">{job.fileSize} • {job.paperSize} • {job.colorMode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Monitor className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{job.systemName || job.user}</p>
                          <div className="flex items-center mt-1">
                            <Building className="h-3 w-3 text-gray-400 mr-1" />
                            <p className="text-xs text-gray-500">{job.department}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Printer className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-sm text-gray-900">{job.printer}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {job.status === 'success' ? job.pages : 0} pages
                        </p>
                        <p className="text-xs text-gray-500">${job.cost.toFixed(2)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(job.status)}
                        <span className={getStatusBadge(job.status)}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm text-gray-900">
                            {job.timestamp.toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {job.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Simulate Print Job Modal */}
      {isSimulateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Simulate Print Job</h3>
                <p className="text-gray-600">
                  This will simulate a print job being captured from a system in the organization.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-blue-900 mb-2">What will be captured:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>System name</strong> (e.g., FINANCE-PC-01, MARKETING-LAPTOP-03)</li>
                  <li>• <strong>Document name</strong> and file details</li>
                  <li>• <strong>Print timestamp</strong> (current date/time)</li>
                  <li>• <strong>Page count</strong> and calculated cost</li>
                  <li>• <strong>Department</strong> (auto-detected from system name)</li>
                  <li>• <strong>Printer used</strong> and job status</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800">
                      <strong>Demo Mode:</strong> This simulates the Windows Print Listener capturing real print jobs. 
                      In production, jobs are captured automatically when users print.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setIsSimulateModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={simulatePrintJob}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Simulate Print Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PrintJobsTable;