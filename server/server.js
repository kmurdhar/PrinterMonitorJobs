import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory storage (in production, use a real database)
let printJobs = [];
let printers = [];
let clients = [];

// WebSocket connections for real-time updates
const wsConnections = new Set();

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  wsConnections.add(ws);
  
  ws.on('close', () => {
    wsConnections.delete(ws);
    console.log('WebSocket client disconnected');
  });
});

// Broadcast to all connected WebSocket clients
function broadcast(data) {
  wsConnections.forEach(ws => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(data));
    }
  });
}

// Helper function to detect department from system name
function detectDepartment(systemName) {
  const name = systemName.toLowerCase();
  if (name.includes('finance')) return 'Finance';
  if (name.includes('marketing')) return 'Marketing';
  if (name.includes('hr')) return 'HR';
  if (name.includes('it')) return 'IT';
  if (name.includes('sales')) return 'Sales';
  if (name.includes('admin')) return 'Administration';
  if (name.includes('operations') || name.includes('ops')) return 'Operations';
  if (name.includes('legal')) return 'Legal';
  if (name.includes('executive') || name.includes('exec')) return 'Executive';
  return 'General';
}

// Helper function to auto-discover printers
function autoDiscoverPrinter(printerName, clientId) {
  const existingPrinter = printers.find(p => p.name === printerName && p.clientId === clientId);
  if (!existingPrinter) {
    const newPrinter = {
      id: `printer-${uuidv4()}`,
      name: printerName,
      location: 'Auto-discovered',
      model: 'Unknown Model',
      status: 'online',
      paperLevel: 85,
      tonerLevel: 70,
      jobsToday: 1,
      lastActivity: new Date(),
      ipAddress: '192.168.1.100',
      department: 'General',
      clientId: clientId,
      serialNumber: '',
      installDate: new Date()
    };
    printers.push(newPrinter);
    
    // Broadcast printer discovery
    broadcast({
      type: 'printer_discovered',
      printer: newPrinter
    });
    
    console.log(`Auto-discovered printer: ${printerName} for client: ${clientId}`);
    return newPrinter;
  } else {
    // Update last activity and job count
    existingPrinter.lastActivity = new Date();
    existingPrinter.jobsToday += 1;
    existingPrinter.status = 'online';
    return existingPrinter;
  }
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    server: 'PrintMonitor API v1.0',
    clients: clients.length,
    printers: printers.length,
    jobs: printJobs.length
  });
});

// Print job submission endpoint (called by Windows Print Listener)
app.post('/api/print-jobs', (req, res) => {
  try {
    const {
      clientId,
      apiKey,
      fileName,
      systemName,
      printerName,
      pages,
      fileSize,
      paperSize = 'A4',
      colorMode = 'blackwhite',
      userName
    } = req.body;

    console.log('Received print job:', {
      clientId,
      fileName,
      systemName,
      printerName,
      pages
    });

    // Validate required fields
    if (!clientId || !fileName || !systemName || !printerName || !pages) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['clientId', 'fileName', 'systemName', 'printerName', 'pages']
      });
    }

    // Auto-discover printer
    const printer = autoDiscoverPrinter(printerName, clientId);

    // Detect department from system name
    const department = detectDepartment(systemName);

    // Calculate cost (basic calculation - $0.05 per page for B&W, $0.15 for color)
    const costPerPage = colorMode === 'color' ? 0.15 : 0.05;
    const cost = pages * costPerPage;

    // Create print job
    const printJob = {
      id: `job-${uuidv4()}`,
      fileName,
      user: systemName, // Use system name as user identifier
      systemName,
      department,
      printer: printerName,
      pages: parseInt(pages),
      status: 'success', // Assume success unless specified otherwise
      timestamp: new Date(),
      cost,
      fileSize: fileSize || '1.2 MB',
      paperSize,
      colorMode,
      clientId
    };

    // Store the print job
    printJobs.push(printJob);

    // Broadcast real-time update
    broadcast({
      type: 'new_print_job',
      job: printJob,
      printer: printer
    });

    console.log(`Print job captured: ${fileName} from ${systemName} (Client: ${clientId})`);

    res.json({
      success: true,
      jobId: printJob.id,
      message: 'Print job recorded successfully',
      cost: cost.toFixed(2)
    });

  } catch (error) {
    console.error('Error processing print job:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get print jobs for a client
app.get('/api/print-jobs', (req, res) => {
  const { clientId, limit = 100 } = req.query;
  
  let jobs = printJobs;
  if (clientId && clientId !== 'overall') {
    jobs = printJobs.filter(job => job.clientId === clientId);
  }
  
  // Sort by timestamp (newest first) and limit results
  jobs = jobs
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, parseInt(limit));
  
  res.json(jobs);
});

// Get printers for a client
app.get('/api/printers', (req, res) => {
  const { clientId } = req.query;
  
  let clientPrinters = printers;
  if (clientId && clientId !== 'overall') {
    clientPrinters = printers.filter(printer => printer.clientId === clientId);
  }
  
  res.json(clientPrinters);
});

// Get clients
app.get('/api/clients', (req, res) => {
  res.json(clients);
});

// Add/update client
app.post('/api/clients', (req, res) => {
  const client = req.body;
  const existingIndex = clients.findIndex(c => c.id === client.id);
  
  if (existingIndex >= 0) {
    clients[existingIndex] = { ...clients[existingIndex], ...client };
  } else {
    clients.push(client);
  }
  
  res.json({ success: true, client });
});

// Get dashboard stats
app.get('/api/stats', (req, res) => {
  const { clientId } = req.query;
  
  let jobs = printJobs;
  let clientPrinters = printers;
  
  if (clientId && clientId !== 'overall') {
    jobs = printJobs.filter(job => job.clientId === clientId);
    clientPrinters = printers.filter(printer => printer.clientId === clientId);
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const jobsToday = jobs.filter(job => new Date(job.timestamp) >= today);
  
  const stats = {
    totalJobs: jobs.length,
    totalPages: jobs.reduce((sum, job) => sum + job.pages, 0),
    activePrinters: clientPrinters.filter(p => p.status === 'online').length,
    totalCost: jobs.reduce((sum, job) => sum + job.cost, 0),
    jobsToday: jobsToday.length,
    failureRate: jobs.length > 0 ? (jobs.filter(j => j.status === 'failed').length / jobs.length) * 100 : 0,
    activeUsers: [...new Set(jobs.map(job => job.systemName))].length,
    clientCount: clientId === 'overall' ? clients.length : undefined
  };
  
  res.json(stats);
});

// Test endpoint to simulate print jobs
app.post('/api/test/simulate-print', (req, res) => {
  const { clientId = 'test-client' } = req.body;
  
  const sampleJobs = [
    {
      fileName: 'Financial_Report_Q4.pdf',
      systemName: 'FINANCE-PC-01',
      printerName: 'HP-LaserJet-Pro-01',
      pages: 15,
      colorMode: 'blackwhite'
    },
    {
      fileName: 'Marketing_Proposal.docx',
      systemName: 'MARKETING-LAPTOP-03',
      printerName: 'Canon-PIXMA-02',
      pages: 8,
      colorMode: 'color'
    },
    {
      fileName: 'Employee_Handbook.pdf',
      systemName: 'HR-WORKSTATION-02',
      printerName: 'Brother-HL-L2350DW-03',
      pages: 42,
      colorMode: 'blackwhite'
    }
  ];
  
  const randomJob = sampleJobs[Math.floor(Math.random() * sampleJobs.length)];
  
  // Simulate the print job submission
  const simulatedRequest = {
    body: {
      clientId,
      fileName: randomJob.fileName,
      systemName: randomJob.systemName,
      printerName: randomJob.printerName,
      pages: randomJob.pages,
      fileSize: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
      paperSize: 'A4',
      colorMode: randomJob.colorMode
    }
  };
  
  // Process the simulated job
  app._router.handle(simulatedRequest, res, () => {});
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Catch-all handler for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🖨️  PrintMonitor Server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`📡 WebSocket: ws://localhost:${PORT}`);
  console.log(`🌐 Network: http://192.168.29.84:${PORT}`);
});