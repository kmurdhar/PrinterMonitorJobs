# Printer Monitoring System - Multi-Client Deployment Guide

## Overview
This guide will help you deploy the Printer Monitoring System for 5 different clients, each with 3 printers.

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client 1      │    │   Client 2      │    │   Client 3      │
│   3 Printers    │    │   3 Printers    │    │   3 Printers    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Central Server │
                    │  - Web App      │
                    │  - Database     │
                    │  - API          │
                    └─────────────────┘
```

## Prerequisites

### Server Requirements
- **Operating System**: Ubuntu 20.04+ or Windows Server 2019+
- **RAM**: Minimum 4GB, Recommended 8GB
- **Storage**: Minimum 50GB SSD
- **Network**: Static IP address, ports 80, 443, 5432 open
- **Domain**: Optional but recommended for SSL

### Software Requirements
- Node.js 18+ 
- PostgreSQL 14+
- Nginx (for production)
- PM2 (for process management)

## Step 1: Server Setup

### 1.1 Install Dependencies (Ubuntu)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx
sudo apt install nginx -y

# Install PM2
sudo npm install -g pm2
```

### 1.2 Database Setup
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE printmonitor;
CREATE USER printmonitor_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE printmonitor TO printmonitor_user;
\q
```

## Step 2: Application Deployment

### 2.1 Clone and Build Application
```bash
# Clone your application
git clone <your-repo-url> /opt/printmonitor
cd /opt/printmonitor

# Install dependencies
npm install

# Build for production
npm run build
```

### 2.2 Environment Configuration
Create `.env` file:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://printmonitor_user:your_secure_password@localhost:5432/printmonitor
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=https://yourdomain.com
```

### 2.3 Database Schema
```sql
-- Connect to database
psql -U printmonitor_user -d printmonitor

-- Create tables
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    printer_count INTEGER DEFAULT 0,
    user_count INTEGER DEFAULT 0
);

CREATE TABLE printers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    model VARCHAR(255),
    status VARCHAR(50) DEFAULT 'offline',
    paper_level INTEGER DEFAULT 0,
    toner_level INTEGER DEFAULT 0,
    jobs_today INTEGER DEFAULT 0,
    last_activity TIMESTAMP DEFAULT NOW(),
    ip_address INET,
    department VARCHAR(255),
    serial_number VARCHAR(255),
    install_date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    email VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    jobs_today INTEGER DEFAULT 0,
    pages_total INTEGER DEFAULT 0,
    cost_total DECIMAL(10,2) DEFAULT 0,
    last_activity TIMESTAMP DEFAULT NOW()
);

CREATE TABLE print_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    printer_id UUID REFERENCES printers(id),
    user_id UUID REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    file_size VARCHAR(50),
    pages INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    timestamp TIMESTAMP DEFAULT NOW(),
    cost DECIMAL(10,2) DEFAULT 0,
    paper_size VARCHAR(50),
    color_mode VARCHAR(50),
    department VARCHAR(255)
);

-- Insert sample clients
INSERT INTO clients (name, address, contact_email, contact_phone, printer_count) VALUES
('TechCorp Solutions', '123 Business Ave, City, State 12345', 'admin@techcorp.com', '+1-555-0101', 3),
('Marketing Plus', '456 Creative St, City, State 12346', 'admin@marketingplus.com', '+1-555-0102', 3),
('Finance Group', '789 Money Blvd, City, State 12347', 'admin@financegroup.com', '+1-555-0103', 3),
('Healthcare Inc', '321 Medical Dr, City, State 12348', 'admin@healthcare.com', '+1-555-0104', 3),
('Education Hub', '654 Learning Ln, City, State 12349', 'admin@educationhub.com', '+1-555-0105', 3);
```

## Step 3: Client-Specific Printer Setup

### 3.1 Printer Configuration Template
For each client, configure 3 printers:

```sql
-- Example for Client 1 (TechCorp Solutions)
INSERT INTO printers (client_id, name, location, model, ip_address, department) VALUES
((SELECT id FROM clients WHERE name = 'TechCorp Solutions'), 'TechCorp-Printer-01', 'Reception Area', 'HP LaserJet Pro M404n', '192.168.1.101', 'Administration'),
((SELECT id FROM clients WHERE name = 'TechCorp Solutions'), 'TechCorp-Printer-02', 'Development Floor', 'Canon PIXMA Pro-200', '192.168.1.102', 'Development'),
((SELECT id FROM clients WHERE name = 'TechCorp Solutions'), 'TechCorp-Printer-03', 'Management Office', 'Brother HL-L2350DW', '192.168.1.103', 'Management');
```

### 3.2 Windows Print Listener Setup

Create a Windows service for each client location:

```powershell
# PowerShell script for print monitoring
# Save as PrintMonitor.ps1

$clientId = "CLIENT_ID_HERE"
$apiEndpoint = "https://your-server.com/api/print-jobs"
$apiKey = "YOUR_API_KEY"

# Register for print job events
Register-WmiEvent -Query "SELECT * FROM Win32_PrintJob" -Action {
    $job = $Event.SourceEventArgs.NewEvent
    
    $printData = @{
        clientId = $clientId
        fileName = $job.Document
        user = $job.Owner
        printer = $job.Name
        pages = $job.TotalPages
        timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
        status = if($job.Status -eq "OK") { "success" } else { "failed" }
    }
    
    # Send to API
    Invoke-RestMethod -Uri $apiEndpoint -Method POST -Body ($printData | ConvertTo-Json) -ContentType "application/json" -Headers @{"Authorization" = "Bearer $apiKey"}
}
```

## Step 4: Production Configuration

### 4.1 PM2 Process Management
```bash
# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'printmonitor',
    script: 'npm',
    args: 'start',
    cwd: '/opt/printmonitor',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4.2 Nginx Configuration
```nginx
# /etc/nginx/sites-available/printmonitor
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/printmonitor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 5: Client Access Configuration

### 5.1 Multi-Tenant Access
Each client gets their own subdomain or path:
- `client1.printmonitor.com`
- `client2.printmonitor.com`
- Or: `printmonitor.com/client1`

### 5.2 Authentication Setup
Implement client-specific authentication:
```javascript
// Example middleware for client isolation
const clientAuth = (req, res, next) => {
    const clientId = req.headers['x-client-id'] || req.subdomain;
    req.clientId = clientId;
    next();
};
```

## Step 6: Monitoring and Maintenance

### 6.1 Health Checks
```bash
# Create health check script
cat > /opt/printmonitor/health-check.sh << EOF
#!/bin/bash
curl -f http://localhost:3000/health || exit 1
psql -U printmonitor_user -d printmonitor -c "SELECT 1;" || exit 1
EOF

chmod +x /opt/printmonitor/health-check.sh
```

### 6.2 Backup Strategy
```bash
# Daily database backup
cat > /opt/printmonitor/backup.sh << EOF
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U printmonitor_user printmonitor > /opt/backups/printmonitor_$DATE.sql
find /opt/backups -name "printmonitor_*.sql" -mtime +7 -delete
EOF

# Add to crontab
echo "0 2 * * * /opt/printmonitor/backup.sh" | crontab -
```

## Step 7: Client Onboarding Checklist

For each new client:

- [ ] Create client record in database
- [ ] Configure 3 printers with unique IP addresses
- [ ] Install Windows print listener on client machines
- [ ] Set up client-specific subdomain/access
- [ ] Provide login credentials
- [ ] Test print job capture
- [ ] Configure alerts and notifications
- [ ] Provide user training

## Security Considerations

1. **Network Security**: Use VPN or secure tunnels for client connections
2. **Data Encryption**: Enable SSL/TLS for all communications
3. **Access Control**: Implement role-based access control
4. **Regular Updates**: Keep system and dependencies updated
5. **Monitoring**: Set up intrusion detection and monitoring

## Support and Maintenance

- **Documentation**: Maintain client-specific documentation
- **Monitoring**: Set up alerts for system health
- **Updates**: Plan regular maintenance windows
- **Support**: Establish support channels for each client

This deployment guide provides a comprehensive approach to setting up your multi-client printer monitoring system. Each client will have isolated data and their own set of 3 printers, while sharing the same application infrastructure.