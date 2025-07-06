# PrintMonitor Client Setup Flow

This document outlines the complete process for setting up a new client in the PrintMonitor system, from onboarding to print job monitoring.

## Overview

The PrintMonitor client setup process involves:
1. Onboarding the client in the admin dashboard
2. Generating client-specific installation files
3. Installing the print listener on client machines
4. Verifying the setup with test print jobs
5. Monitoring print activity in the client dashboard

## Step 1: Client Onboarding

### Access the Admin Dashboard

1. Open a web browser and navigate to the PrintMonitor admin dashboard:
   ```
   http://[server-ip]:5173
   ```

2. Click on the "Onboarding" tab in the sidebar.

3. Click the "Onboard New Client" button to start the wizard.

### Complete the 5-Step Onboarding Wizard

#### Step 1: Company Information
- Enter company name
- Enter contact person details
- Provide contact email and phone
- Add business address (optional)

#### Step 2: Platform & Requirements
- Select operating systems (Windows, Linux)
- Choose subscription plan
- Specify number of printers
- Estimate number of users

#### Step 3: Technical Configuration
- System generates:
  - Client ID (e.g., `company-abc123`)
  - API Key
  - Dashboard URL
  - API Endpoint

#### Step 4: Installation Files
- Download the generated installation files:
  - Windows Installation Package (Deploy.bat, install-service.ps1)
  - Configuration File (client_config.json)
  - README.txt with installation instructions

#### Step 5: Complete Setup
- Review onboarding summary
- Access client dashboard URL
- Copy client credentials for reference

## Step 2: Client Installation

### Prepare Client Machines

1. **System Requirements**:
   - Windows 10/11
   - PowerShell 5.1 or higher
   - Administrator access
   - Network connectivity to the PrintMonitor server

2. **Copy Installation Files** to the client machine:
   - Deploy.bat
   - install-service.ps1
   - README.txt

### Run Installation Script

1. **Run as Administrator**:
   - Right-click on `Deploy.bat`
   - Select "Run as administrator"

2. **Installation Process**:
   - Script creates installation directories:
     - C:\PrintMonitor
     - C:\PrintMonitor\service
     - C:\PrintMonitor\logs
   - Installs print listener script
   - Creates scheduled task "PrintMonitorListener"
   - Tests connection to server
   - Sends test print job

3. **Verify Installation**:
   - Check installation log output
   - Confirm "PrintMonitor service installed successfully!" message
   - Note the dashboard URL for client access

## Step 3: Verification

### Check Client Logs

1. **View Print Listener Logs**:
   ```powershell
   Get-Content 'C:\PrintMonitor\logs\print-listener.log' -Tail 20 -Wait
   ```

2. **Verify Server Connection**:
   - Look for "Server connection successful" message
   - Confirm test print job was sent successfully

### Test Print Job Capture

1. **Print a Test Document** from the client machine:
   - Open any document (Word, PDF, etc.)
   - Print to any printer
   - The print listener should capture this activity

2. **Check Dashboard**:
   - Open the client dashboard URL
   - Navigate to "Print Jobs" tab
   - The test print job should appear in the list

3. **Alternative Test Method**:
   - In the dashboard, click "Test Print" button
   - This simulates a print job without actual printing
   - Verify the job appears in the list

## Step 4: Client Dashboard Access

### Provide Dashboard Access

1. **Share Client Dashboard URL**:
   ```
   http://[server-ip]:5173/?client=[client-id]
   ```
   Example: `http://192.168.1.102:5173/?client=company-abc123`

2. **Dashboard Features**:
   - Real-time print job monitoring
   - Printer status tracking
   - Cost analysis and reporting
   - User activity monitoring

### Client Dashboard Navigation

1. **Dashboard Overview**:
   - Summary statistics
   - Print activity charts
   - Active printers status

2. **Print Jobs Tab**:
   - Complete print job history
   - Filter by status, date, user
   - Export job data

3. **Printers Tab**:
   - All discovered printers
   - Printer status and details
   - Supply levels (toner, paper)

4. **Users Tab**:
   - User print activity
   - Department grouping
   - Cost per user

## Step 5: Ongoing Monitoring

### Regular Checks

1. **Server Health**:
   - Monitor server status in the dashboard
   - Check for WebSocket connectivity
   - Verify API server is responding

2. **Client Connectivity**:
   - Ensure print listener service is running
   - Check for new print jobs appearing
   - Verify printer discovery is working

### Maintenance Tasks

1. **Client Service Management**:
   ```powershell
   # Start the service
   Start-ScheduledTask -TaskName "PrintMonitorListener"
   
   # Stop the service
   Stop-ScheduledTask -TaskName "PrintMonitorListener"
   
   # Restart the service
   Stop-ScheduledTask -TaskName "PrintMonitorListener"
   Start-ScheduledTask -TaskName "PrintMonitorListener"
   ```

2. **Log Management**:
   - Periodically check logs for errors
   - Clear old logs if needed:
     ```powershell
     Clear-Content 'C:\PrintMonitor\logs\print-listener.log'
     ```

3. **Updates**:
   - When new versions are available, re-run the installation script
   - This will update the print listener while preserving settings

## Troubleshooting

### Common Issues

1. **Print Jobs Not Appearing**:
   - Check client logs for connection errors
   - Verify server is running and accessible
   - Test with manual print job simulation

2. **Connection Failures**:
   - Verify network connectivity to server
   - Check firewall settings
   - Confirm correct API endpoint in configuration

3. **Service Not Running**:
   - Check scheduled task status
   - Verify PowerShell execution policy
   - Check for errors in logs

### Getting Help

For additional assistance:
- Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
- Contact system administrator
- Provide client ID and log files when reporting issues