# PrintMonitor Server Setup Guide

This guide provides detailed instructions for setting up and running the PrintMonitor server.

## System Requirements

- **Node.js**: v18.0.0 or higher
- **NPM**: v8.0.0 or higher
- **Operating System**: Windows, macOS, or Linux
- **Network**: Open ports 3000 (API/WebSocket) and 5173 (Frontend)

## Installation

### Step 1: Clone or Download the Repository

```bash
# If using Git
git clone https://github.com/yourusername/printer-monitoring-system.git
cd printer-monitoring-system

# If downloaded as ZIP
# Extract the ZIP file and navigate to the extracted directory
```

### Step 2: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

## Configuration

### Environment Variables

1. **Create Environment File**:
   - Copy the example environment file:
     ```bash
     cp .env.example .env
     ```
   - Edit the `.env` file with your specific configuration

2. **Important Configuration Options**:
   - `PORT`: API server port (default: 3000)
   - `VITE_API_BASE_URL`: API base URL (default: http://localhost:3000)
   - `HOST`: Server hostname or IP address

### Network Configuration

1. **Determine Server IP Address**:
   ```bash
   # On Linux/macOS
   ifconfig
   
   # On Windows
   ipconfig
   ```

2. **Update Configuration**:
   - Edit the `.env` file to set your server's IP address
   - This ensures clients can connect to the correct server

## Starting the Server

### Development Mode

1. **Start API Server Only**:
   ```bash
   node server/server.js
   ```
   This starts the API server on port 3000.

2. **Start Frontend Development Server Only**:
   ```bash
   npm run dev
   ```
   This starts the frontend development server on port 5173.

3. **Start Both Servers (Recommended)**:
   ```bash
   npm run full-stack
   ```
   This starts both the API server and frontend development server concurrently.

### Production Mode

1. **Build the Frontend**:
   ```bash
   npm run build
   ```
   This creates optimized production files in the `dist` directory.

2. **Start the Production Server**:
   ```bash
   NODE_ENV=production node server/server.js
   ```
   This serves both the API and the built frontend from a single server on port 3000.

## Verifying Server Status

1. **Check API Server**:
   - Open a browser and navigate to: `http://localhost:3000/api/health`
   - You should see a JSON response with status "ok"

2. **Check Frontend Server**:
   - Development: `http://localhost:5173`
   - Production: `http://localhost:3000`

3. **Check WebSocket Server**:
   - WebSocket status is visible in the dashboard
   - Or check: `http://localhost:3000/api/websocket/status`

## Server Maintenance

### Logs

- **Server Logs**: Output to the console where the server is running
- **Important Log Patterns**:
  - `🖨️ PrintMonitor Server running on port 3000`: Server started successfully
  - `📄 Print job captured`: Print job received and processed
  - `❌ Error`: Error messages to investigate

### Restarting the Server

```bash
# If running in foreground, press Ctrl+C to stop, then restart
node server/server.js

# If running with PM2
pm2 restart printmonitor-backend
```

### Updating the Server

1. **Pull Latest Changes** (if using Git):
   ```bash
   git pull origin main
   ```

2. **Update Dependencies**:
   ```bash
   npm install
   cd server
   npm install
   cd ..
   ```

3. **Rebuild Frontend**:
   ```bash
   npm run build
   ```

4. **Restart Server**:
   ```bash
   node server/server.js
   ```

## Advanced Configuration

### Using PM2 for Production

1. **Install PM2**:
   ```bash
   npm install -g pm2
   ```

2. **Start with PM2**:
   ```bash
   pm2 start server/server.js --name printmonitor-backend
   ```

3. **Configure Auto-restart**:
   ```bash
   pm2 startup
   pm2 save
   ```

### Setting Up HTTPS

1. **Generate SSL Certificates**:
   ```bash
   # Using OpenSSL
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout server.key -out server.cert
   ```

2. **Update Server Code** to use HTTPS:
   - Edit `server/server.js` to use HTTPS
   - Update WebSocket to use WSS

### Load Balancing

For high-traffic environments, consider:
- Using multiple server instances with PM2 cluster mode
- Setting up Nginx as a reverse proxy
- Implementing a database for print job storage instead of in-memory

## Monitoring Server Health

1. **Check Active Connections**:
   ```bash
   # View WebSocket connections
   curl http://localhost:3000/api/websocket/status
   ```

2. **Monitor System Resources**:
   ```bash
   # Using PM2
   pm2 monit
   
   # Using standard tools
   top -p $(pgrep -f "node server/server.js")
   ```

3. **Test Print Job Submission**:
   ```bash
   # Simulate a print job
   curl -X POST http://localhost:3000/api/test/simulate-print \
     -H "Content-Type: application/json" \
     -d '{"clientId":"test-client"}'
   ```

## Backup and Recovery

1. **Backup Configuration**:
   - Save the `.env` file
   - Backup the `ecosystem.config.js` file if using PM2

2. **Data Persistence**:
   - In the current implementation, data is stored in memory
   - For production, implement a database solution
   - Regular database backups are recommended

## Security Considerations

1. **API Security**:
   - Implement proper authentication for API endpoints
   - Use HTTPS in production
   - Validate all input data

2. **Network Security**:
   - Restrict access to server ports (3000, 5173)
   - Use a firewall to limit access
   - Consider VPN for remote access

3. **Client Authentication**:
   - Implement proper validation of client credentials
   - Rotate API keys periodically