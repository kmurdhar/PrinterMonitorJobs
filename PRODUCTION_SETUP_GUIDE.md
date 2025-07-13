# 🖨️ PrintMonitor Production Setup Guide

## 📋 Table of Contents
1. [Server Setup](#server-setup)
2. [Client Onboarding Process](#client-onboarding-process)
3. [Windows Print Listener Installation](#windows-print-listener-installation)
4. [Verification Steps](#verification-steps)
5. [Troubleshooting](#troubleshooting)

---

## 🖥️ Server Setup

### Step 1: Start the PrintMonitor Server

```bash
# Navigate to your project directory
cd /path/to/PrinterMonitorJobs

# Install dependencies (if not already done)
npm install

# Start both frontend and backend servers
npm run full-stack
```

**Expected Output:**
```
🖨️ PrintMonitor Server running on port 3000
🔗 API: http://localhost:3000/api
📡 WebSocket: ws://localhost:3000
🌐 Network: http://192.168.1.102:3000
📊 Frontend Dev: http://localhost:5173
```

### Step 2: Verify Server Status

1. **Check API Health:**
   - Open browser: `http://localhost:3000/api/health`
   - Should see: `{"status":"ok","server":"PrintMonitor API v1.0"}`

2. **Check Frontend:**
   - Open browser: `http://localhost:5173`
   - Should see PrintMonitor dashboard

3. **Check Network Access:**
   - From another computer: `http://[SERVER-IP]:5173`
   - Replace `[SERVER-IP]` with your server's IP address

---

## 🏢 Client Onboarding Process

### Step 1: Access Admin Dashboard

1. Open browser: `http://localhost:5173` (or `http://[SERVER-IP]:5173`)
2. Click **"Onboarding"** tab in sidebar
3. Click **"Onboard New Client"** button

### Step 2: Complete 5-Step Wizard

#### **Step 1: Company Information**
- Company Name: `TechCorp Solutions`
- Contact Name: `John Smith`
- Contact Email: `john@techcorp.com`
- Contact Phone: `+1-555-0123`
- Address: `123 Business St, City, State`

#### **Step 2: Platform & Requirements**
- Select: ✅ **Windows** (required)
- Subscription Plan: **Premium** (recommended)
- Number of Printers: `5`
- Estimated Users: `25`

#### **Step 3: Technical Configuration** (Auto-Generated)
- Client ID: `techcorp-a1b2c3` (automatically created)
- API Key: `pk_eu1v649ny5i` (automatically created)
- Dashboard URL: `http://192.168.1.102:5173/?client=techcorp-a1b2c3`
- API Endpoint: `http://192.168.1.102:3000/api`

#### **Step 4: Installation Files** (Download)
- `Deploy.bat` - Windows deployment script
- `install-service.ps1` - PowerShell installer
- `README.txt` - Installation instructions

#### **Step 5: Complete Setup**
- Review configuration
- Copy client credentials
- Access client dashboard

### Step 3: Generated Client Assets

The system automatically creates:
```
📁 Installation Package/
├── Deploy.bat                    # Main installer (run as Admin)
├── install-service.ps1          # PowerShell service installer
├── README.txt                   # Installation instructions
└── client_config.json          # Pre-configured settings
```

---

## 💻 Windows Print Listener Installation

### Step 1: Prepare Client Computer

**Requirements:**
- Windows 10/11
- PowerShell 5.1+
- Administrator access
- Network access to server

### Step 2: Install Print Listener

1. **Copy Installation Files** to client computer
2. **Right-click** on `Deploy.bat`
3. **Select** "Run as administrator"
4. **Follow** installation prompts

### Step 3: Installation Process

The installer will:
```
📁 Create directories:
   C:\PrintMonitor\
   C:\PrintMonitor\service\
   C:\PrintMonitor\logs\

🔧 Install components:
   - Print listener script
   - Service wrapper
   - Configuration file
   - Scheduled task

🔗 Test connection:
   - Connect to server
   - Send test print job
   - Verify dashboard access

▶️ Start monitoring:
   - Create "PrintMonitorListener" task
   - Begin print job capture
   - Real-time data transmission
```

### Step 4: Verify Installation

**Check Scheduled Task:**
```powershell
Get-ScheduledTask -TaskName "PrintMonitorListener"
```

**View Logs:**
```powershell
Get-Content 'C:\PrintMonitor\logs\print-listener.log' -Tail 20 -Wait
```

**Expected Log Output:**
```
[2025-07-12 18:30:15] PrintMonitor Print Listener Starting...
[2025-07-12 18:30:15] Client ID: techcorp-a1b2c3
[2025-07-12 18:30:15] API Endpoint: http://192.168.1.102:3000/api
[2025-07-12 18:30:16] ✅ Server connection successful
[2025-07-12 18:30:16] 🧪 Test print job sent successfully!
[2025-07-12 18:30:16] 🔍 Starting print job monitoring...
```

---

## ✅ Verification Steps

### Step 1: Test Print Job Capture

1. **Print a document** from the client computer
2. **Check dashboard** at: `http://192.168.1.102:5173/?client=techcorp-a1b2c3`
3. **Verify job appears** in Print Jobs tab

### Step 2: Expected Dashboard View

**Empty State (Before Printing):**
```
📊 Dashboard shows:
   - 0 jobs today
   - 0 total pages
   - 0 active printers
   - $0.00 total cost

💡 Message: "No Print Jobs Captured Yet"
🔧 Instructions: Print jobs will automatically appear
```

**After First Print Job:**
```
📊 Dashboard shows:
   - 1 job today
   - X pages printed
   - 1 active printer (auto-discovered)
   - $X.XX calculated cost

📄 Print Jobs Table shows:
   - Document name
   - System name (computer name)
   - Printer name
   - Page count and cost
   - Timestamp
```

### Step 3: Real-Time Updates

- Print jobs appear **immediately** after printing
- **WebSocket connection** shows live updates
- **No page refresh** needed
- **Auto-discovery** of new printers

---

## 🔧 Troubleshooting

### Server Issues

**Problem:** Server won't start
```bash
# Check if port 3000 is in use
netstat -tulpn | grep :3000

# Kill existing processes
pkill -f "node server/server.js"

# Restart server
npm run full-stack
```

**Problem:** Frontend can't connect to backend
```bash
# Check server logs for errors
# Verify API endpoint: http://localhost:3000/api/health
# Check firewall settings
```

### Client Installation Issues

**Problem:** "Run as Administrator" required
```
Solution: Right-click Deploy.bat → "Run as administrator"
```

**Problem:** PowerShell execution policy
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

**Problem:** Network connectivity
```powershell
# Test server connection
Invoke-RestMethod -Uri "http://192.168.1.102:3000/api/health"
```

### Print Jobs Not Appearing

**Check List:**
1. ✅ Server running on port 3000
2. ✅ Client has correct URL with client parameter
3. ✅ Print Listener service is running
4. ✅ Network connectivity to server
5. ✅ Correct client ID in configuration

**Debug Commands:**
```powershell
# Check service status
Get-ScheduledTask -TaskName "PrintMonitorListener"

# View recent logs
Get-Content 'C:\PrintMonitor\logs\print-listener.log' -Tail 10

# Test manual connection
Invoke-RestMethod -Uri "http://192.168.1.102:3000/api/debug/client/techcorp-a1b2c3"
```

---

## 🌐 Network Configuration

### Server Network Setup

**Internal Network Access:**
```
Frontend: http://192.168.1.102:5173
API: http://192.168.1.102:3000
Client Dashboard: http://192.168.1.102:5173/?client=CLIENT-ID
```

**Firewall Rules:**
```bash
# Allow inbound connections
sudo ufw allow 3000  # API server
sudo ufw allow 5173  # Frontend dev server
```

### Client Network Requirements

**Outbound Access Required:**
- Port 3000 (API communication)
- Port 5173 (Dashboard access)
- HTTP/HTTPS protocols

---

## 📊 Production Monitoring

### Server Health Checks

**API Health:** `GET /api/health`
```json
{
  "status": "ok",
  "clients": 1,
  "printers": 2,
  "jobs": 15,
  "websocket": {
    "connections": 3,
    "server": "active"
  }
}
```

**WebSocket Status:** `GET /api/websocket/status`
```json
{
  "totalConnections": 3,
  "connections": [...]
}
```

### Client Debug Information

**Client Debug:** `GET /api/debug/client/CLIENT-ID`
```json
{
  "clientId": "techcorp-a1b2c3",
  "totalJobs": 15,
  "totalPrinters": 2,
  "recentJobs": [...],
  "serverTime": "2025-07-12T18:30:00.000Z"
}
```

---

## 🚀 Production Deployment

### For Production Environment

1. **Build Frontend:**
   ```bash
   npm run build
   ```

2. **Start Production Server:**
   ```bash
   NODE_ENV=production node server/server.js
   ```

3. **Use Process Manager:**
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js --env production
   ```

4. **Setup SSL/HTTPS:**
   - Configure reverse proxy (Nginx)
   - Install SSL certificates
   - Update client configurations

---

## 📞 Support Information

**Server URLs:**
- Frontend: `http://localhost:5173`
- API: `http://localhost:3000/api`
- Health Check: `http://localhost:3000/api/health`

**Client Dashboard:**
- Format: `http://[SERVER-IP]:5173/?client=[CLIENT-ID]`
- Example: `http://192.168.1.102:5173/?client=techcorp-a1b2c3`

**Log Locations:**
- Server: Terminal output
- Client: `C:\PrintMonitor\logs\print-listener.log`

**Service Management:**
```powershell
# Start service
Start-ScheduledTask -TaskName "PrintMonitorListener"

# Stop service
Stop-ScheduledTask -TaskName "PrintMonitorListener"

# Remove service
Unregister-ScheduledTask -TaskName "PrintMonitorListener" -Confirm:$false
```

---

## ✅ Production Checklist

### Server Setup
- [ ] Server running on port 3000
- [ ] Frontend accessible on port 5173
- [ ] API health check responds
- [ ] WebSocket server active
- [ ] Network access configured

### Client Onboarding
- [ ] Client onboarded through wizard
- [ ] Installation files downloaded
- [ ] Client credentials generated
- [ ] Dashboard URL accessible

### Print Listener Installation
- [ ] Deployed on client computers
- [ ] Running as Administrator
- [ ] Service/task created successfully
- [ ] Connection to server verified
- [ ] Test print job sent

### Verification
- [ ] Print jobs appear in dashboard
- [ ] Real-time updates working
- [ ] Printers auto-discovered
- [ ] Client isolation working
- [ ] No dummy data visible

---

**🎉 Your PrintMonitor system is now production-ready!**

Print jobs will be automatically captured from any Windows computer with the Print Listener installed, and will appear in real-time on the client's dashboard.