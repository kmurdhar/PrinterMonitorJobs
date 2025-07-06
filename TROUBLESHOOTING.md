# PrintMonitor Troubleshooting Guide

This guide provides detailed troubleshooting steps for common issues with the PrintMonitor system.

## Connection Issues

### Server Not Reachable

**Symptoms:**
- Client machines cannot connect to the server
- "Failed to connect to server" errors in client logs
- WebSocket connection failures

**Solutions:**
1. **Check Server Status**:
   ```bash
   # Check if server process is running
   ps aux | grep server.js
   
   # Restart server if needed
   node server/server.js
   ```

2. **Verify Network Configuration**:
   - Ensure the server is using the correct IP address
   - Check that ports 3000 (API) and 5173 (frontend) are open
   - Test connectivity from client machine:
     ```
     ping [server-ip]
     telnet [server-ip] 3000
     ```

3. **Check Firewall Settings**:
   - Allow inbound connections on ports 3000 and 5173
   - Allow outbound connections from client machines

### WebSocket Connection Failures

**Symptoms:**
- Constant reconnection attempts in browser console
- No real-time updates in dashboard

**Solutions:**
1. **Check WebSocket Server**:
   - Verify the WebSocket server is running
   - Check server logs for WebSocket connection attempts
   - Ensure the WebSocket URL is correct (ws://[server-ip]:3000)

2. **Test WebSocket Connection**:
   - Use a WebSocket testing tool like [websocket.org](https://websocket.org/echo.html)
   - Connect to: `ws://[server-ip]:3000`
   - Send a test message: `{"type":"ping"}`

3. **Network Configuration**:
   - Some networks block WebSocket connections
   - Try using a different network or VPN

## Print Job Issues

### Print Jobs Not Appearing

**Symptoms:**
- Client machines are printing, but jobs don't appear in dashboard
- No errors in client logs

**Solutions:**
1. **Verify Client Configuration**:
   - Check `C:\PrintMonitor\config.json` for correct clientId and apiEndpoint
   - Ensure the client ID matches what's in the dashboard URL

2. **Test Manual Print Job**:
   - In the dashboard, go to "Print Jobs" tab
   - Click "Test Print" button
   - Check server logs for incoming job

3. **Check Print Listener Service**:
   ```powershell
   # Check if service is running
   Get-ScheduledTask -TaskName "PrintMonitorListener"
   
   # Restart service if needed
   Stop-ScheduledTask -TaskName "PrintMonitorListener"
   Start-ScheduledTask -TaskName "PrintMonitorListener"
   ```

4. **Debug API Endpoint**:
   - Access `http://[server-ip]:3000/api/debug/client/[client-id]`
   - This shows all print jobs and printers for the client
   - If jobs appear here but not in dashboard, it's a frontend issue

### Incorrect Client Assignment

**Symptoms:**
- Print jobs appear under the wrong client
- Jobs missing from expected client dashboard

**Solutions:**
1. **Check Client ID in Configuration**:
   - Verify the client ID in `C:\PrintMonitor\config.json`
   - Ensure it matches the expected client

2. **Check URL Parameters**:
   - Dashboard URL should include correct client parameter
   - Example: `http://[server-ip]:5173/?client=[client-id]`

3. **Test with Explicit Client ID**:
   - Manually trigger a test print with specific client ID:
     ```
     http://[server-ip]:3000/api/debug/test-print/[client-id]
     ```

## Server Issues

### Server Crashes

**Symptoms:**
- Server process terminates unexpectedly
- Error messages in server console

**Solutions:**
1. **Check Error Logs**:
   - Look for error messages in the terminal where server was running
   - Common issues: memory limits, unhandled exceptions

2. **Restart with Logging**:
   ```bash
   # Redirect output to log file
   node server/server.js > server.log 2>&1
   ```

3. **Memory Issues**:
   - If server crashes due to memory limits, consider:
     - Limiting stored print jobs
     - Implementing database storage instead of in-memory

### Performance Problems

**Symptoms:**
- Slow dashboard loading
- Delayed print job appearance
- High CPU/memory usage

**Solutions:**
1. **Check Resource Usage**:
   ```bash
   # Check CPU and memory usage
   top -p $(pgrep -f "node server/server.js")
   ```

2. **Optimize Storage**:
   - Implement pagination for print jobs
   - Limit the number of stored jobs
   - Consider database storage for production

3. **Network Optimization**:
   - Reduce WebSocket message frequency
   - Implement batching for multiple updates

## Client Installation Issues

### Installation Script Fails

**Symptoms:**
- Deploy.bat or install-service.ps1 fails to complete
- Error messages during installation

**Solutions:**
1. **Run as Administrator**:
   - Right-click on Deploy.bat
   - Select "Run as administrator"

2. **PowerShell Execution Policy**:
   ```powershell
   # Check current policy
   Get-ExecutionPolicy
   
   # Set to allow script execution
   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
   ```

3. **Script Path Issues**:
   - Ensure all files are in the same directory
   - Try using absolute paths in the scripts

### Scheduled Task Problems

**Symptoms:**
- PrintMonitorListener task doesn't run
- Task runs but no print jobs are captured

**Solutions:**
1. **Check Task Status**:
   ```powershell
   # View task details
   Get-ScheduledTask -TaskName "PrintMonitorListener" | Get-ScheduledTaskInfo
   ```

2. **Check Task History**:
   - Open Task Scheduler
   - Find PrintMonitorListener task
   - View History tab for error messages

3. **Manual Task Execution**:
   ```powershell
   # Run task manually to check for errors
   Start-ScheduledTask -TaskName "PrintMonitorListener"
   ```

4. **Recreate Task**:
   - Unregister existing task:
     ```powershell
     Unregister-ScheduledTask -TaskName "PrintMonitorListener" -Confirm:$false
     ```
   - Run installation script again

## Dashboard Issues

### Dashboard Not Loading

**Symptoms:**
- Blank page when accessing dashboard URL
- Console errors in browser developer tools

**Solutions:**
1. **Check Frontend Server**:
   - Verify the frontend server is running
   - Check for errors in the terminal where `npm run dev` is running

2. **Clear Browser Cache**:
   - Clear browser cache and cookies
   - Try in incognito/private browsing mode

3. **Check Browser Console**:
   - Open browser developer tools (F12)
   - Look for errors in the Console tab

### Data Not Refreshing

**Symptoms:**
- Dashboard shows stale data
- New print jobs don't appear without manual refresh

**Solutions:**
1. **Check WebSocket Connection**:
   - Look for WebSocket connection status in browser console
   - Verify the WebSocket URL is correct

2. **Manual Refresh**:
   - Click the "Refresh" button in the Print Jobs tab
   - Check if data updates after refresh

3. **Test Print Job**:
   - Click "Test Print" button to generate a new job
   - Check if it appears in the dashboard

## Advanced Troubleshooting

### API Request Debugging

1. **Monitor API Requests**:
   - Open browser developer tools
   - Go to Network tab
   - Filter by "api" to see all API requests
   - Check for failed requests (red)

2. **Test API Endpoints Manually**:
   ```bash
   # Health check
   curl http://[server-ip]:3000/api/health
   
   # Get print jobs
   curl http://[server-ip]:3000/api/print-jobs?clientId=[client-id]
   
   # Simulate print job
   curl -X POST http://[server-ip]:3000/api/test/simulate-print \
     -H "Content-Type: application/json" \
     -d '{"clientId":"[client-id]"}'
   ```

### Client-Side Debugging

1. **Enable Verbose Logging**:
   - Edit `C:\PrintMonitor\service\print-listener.ps1`
   - Add more detailed logging statements
   - Restart the service

2. **Test Network Connectivity**:
   ```powershell
   # Test API endpoint
   Invoke-RestMethod -Uri "[api-endpoint]/health" -Method GET
   
   # Test with explicit credentials
   $body = @{
       clientId = "[client-id]"
       apiKey = "[api-key]"
       fileName = "TEST_DEBUG.pdf"
       systemName = $env:COMPUTERNAME
       printerName = "Test Printer"
       pages = 1
   } | ConvertTo-Json
   
   Invoke-RestMethod -Uri "[api-endpoint]/print-jobs" -Method POST -Body $body -ContentType "application/json"
   ```

3. **Check System Requirements**:
   - PowerShell version: `$PSVersionTable.PSVersion`
   - .NET Framework version: `[System.Environment]::Version`
   - Windows version: `[System.Environment]::OSVersion.Version`