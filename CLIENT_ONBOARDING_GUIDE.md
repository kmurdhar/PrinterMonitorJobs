# PrintMonitor Client Onboarding Guide

This guide provides step-by-step instructions for onboarding new clients to the PrintMonitor system, checking logs, and starting the server.

## Table of Contents
1. [Server Setup](#server-setup)
2. [Client Onboarding Process](#client-onboarding-process)
3. [Checking Logs](#checking-logs)
4. [Troubleshooting](#troubleshooting)

## Server Setup

### Starting the Server

1. **Start the API Server**:
   ```bash
   node server/server.js
   ```
   This will start the API server on port 3000.

2. **Start the Frontend Development Server**:
   ```bash
   npm run dev
   ```
   This will start the frontend development server on port 5173.

3. **Run Both Servers Simultaneously**:
   ```bash
   npm run full-stack
   ```
   This will start both the API server and the frontend development server concurrently.

### Verifying Server Status

1. **Check API Server Health**:
   - Open a browser and navigate to: `http://localhost:3000/api/health`
   - You should see a JSON response with status "ok"

2. **Check Frontend Server**:
   - Open a browser and navigate to: `http://localhost:5173`
   - You should see the PrintMonitor dashboard

## Client Onboarding Process

### Step 1: Create a New Client

1. **Access the Admin Dashboard**:
   - Navigate to the PrintMonitor dashboard: `http://localhost:5173`
   - Click on the "Onboarding" tab in the sidebar

2. **Start the Onboarding Process**:
   - Click "Onboard New Client" button
   - Complete the 5-step wizard:
     - Company Information
     - Platform & Requirements
     - Technical Configuration (auto-generated)
     - Installation Guide
     - Complete Setup

3. **Save Client Credentials**:
   - Client ID (e.g., `company-abc123`)
   - API Key
   - Dashboard URL (e.g., `http://localhost:5173/?client=company-abc123`)

### Step 2: Prepare Client Installation Files

1. **Download Installation Files**:
   - Windows Installation Package (Deploy.bat and install-service.ps1)
   - Configuration File (client_config.json)

2. **Customize Installation Files**:
   - The files are pre-configured with the client's credentials
   - No manual editing is required

### Step 3: Install on Client Machines

1. **Copy Installation Files** to the client's computer

2. **Run as Administrator**:
   - Right-click on `Deploy.bat`
   - Select "Run as administrator"

3. **Verify Installation**:
   - The script will create a scheduled task called "PrintMonitorListener"
   - It will automatically start monitoring print jobs

4. **Access Client Dashboard**:
   - Provide the client with their unique dashboard URL:
   - `http://[server-ip]:5173/?client=[client-id]`
   - Example: `http://192.168.1.102:5173/?client=company-abc123`

## Checking Logs

### Server Logs

1. **API Server Logs**:
   - Logs are displayed in the terminal where the server is running
   - Look for lines starting with:
     - `🖨️ PrintMonitor Server running on port 3000`
     - `📄 Print job captured: [filename]`
     - `✅ Print job stored in memory`

2. **WebSocket Connection Logs**:
   - Look for lines starting with:
     - `🔌 WebSocket client connected`
     - `📡 Broadcast sent to [n] WebSocket clients`

### Client Logs

1. **Windows Client Logs**:
   - Logs are stored at: `C:\PrintMonitor\logs\print-listener.log`
   - View logs using PowerShell:
     ```powershell
     Get-Content 'C:\PrintMonitor\logs\print-listener.log' -Tail 20 -Wait
     ```

2. **Log Content to Check**:
   - Connection status: `✅ Server connection successful`
   - Print job submissions: `📄 Sending print job: [filename]`
   - Errors: `❌ Error sending print job: [error message]`

## Troubleshooting

### Server Issues

1. **Server Won't Start**:
   - Ensure Node.js is installed (v18+)
   - Check if port 3000 is already in use
   - Run `npm install` to ensure all dependencies are installed

2. **No Print Jobs Appearing**:
   - Check server logs for API requests
   - Verify the server is running on the correct IP address
   - Test the API with a manual request:
     ```bash
     curl -X POST http://localhost:3000/api/test/simulate-print -H "Content-Type: application/json" -d '{"clientId":"client-id-here"}'
     ```

### Client Issues

1. **Installation Fails**:
   - Ensure PowerShell is running as Administrator
   - Check Windows execution policy with:
     ```powershell
     Get-ExecutionPolicy
     ```
   - If restricted, run:
     ```powershell
     Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
     ```

2. **Print Jobs Not Being Captured**:
   - Check client logs for connection errors
   - Verify the API endpoint is correct and accessible
   - Ensure the client ID matches what's in the dashboard URL
   - Check firewall settings to allow outbound connections to port 3000

3. **Manual Test Print**:
   - In the dashboard, go to "Print Jobs" tab
   - Click "Test Print" button to generate a test print job
   - Check logs to see if the job was processed

### Connection Verification

1. **Verify API Connection**:
   - From client machine, open a browser and navigate to:
     ```
     http://[server-ip]:3000/api/health
     ```
   - Should return a JSON response with status "ok"

2. **Verify Client Configuration**:
   - Check the client configuration file at:
     ```
     C:\PrintMonitor\config.json
     ```
   - Ensure the clientId and apiEndpoint are correct

3. **Debug Client Connection**:
   - Access the debug endpoint:
     ```
     http://[server-ip]:3000/api/debug/client/[client-id]
     ```
   - This will show all print jobs and printers for the client

## Quick Reference

### Important URLs
- Admin Dashboard: `http://[server-ip]:5173`
- Client Dashboard: `http://[server-ip]:5173/?client=[client-id]`
- API Health Check: `http://[server-ip]:3000/api/health`
- Client Debug: `http://[server-ip]:3000/api/debug/client/[client-id]`

### Server Commands
- Start API Server: `node server/server.js`
- Start Frontend: `npm run dev`
- Start Both: `npm run full-stack`

### Client Commands
- View Logs: `Get-Content 'C:\PrintMonitor\logs\print-listener.log' -Tail 20 -Wait`
- Start Service: `Start-ScheduledTask -TaskName 'PrintMonitorListener'`
- Stop Service: `Stop-ScheduledTask -TaskName 'PrintMonitorListener'`