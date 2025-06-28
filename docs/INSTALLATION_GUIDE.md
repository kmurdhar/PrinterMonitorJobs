# Printer Monitoring System - Installation Guide

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Local Development Setup](#local-development-setup)
3. [Production Server Setup](#production-server-setup)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Running the Application](#running-the-application)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements
- **Operating System**: Windows 10/11, macOS 10.15+, or Ubuntu 18.04+
- **Node.js**: Version 18.0 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space for development, 10GB for production
- **Network**: Internet connection for package downloads

### Recommended Development Environment
- **Code Editor**: Visual Studio Code with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - TypeScript Importer
  - Prettier - Code formatter
  - ESLint

---

## Local Development Setup

### Step 1: Install Node.js and npm

#### Windows
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Run the installer and follow the setup wizard
3. Verify installation:
```cmd
node --version
npm --version
```

#### macOS
```bash
# Using Homebrew (recommended)
brew install node

# Or download from nodejs.org
```

#### Ubuntu/Debian
```bash
# Using NodeSource repository (recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 2: Clone and Setup Project

```bash
# Clone the repository (if using Git)
git clone <your-repository-url>
cd printer-monitoring-system

# Or if you have the project files locally, navigate to the directory
cd /path/to/printer-monitoring-system

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

### Step 3: Install Development Tools (Optional)

```bash
# Install global development tools
npm install -g @vitejs/create-vite
npm install -g typescript
npm install -g eslint
npm install -g prettier

# For Windows users - install Windows Build Tools if needed
npm install -g windows-build-tools
```

---

## Production Server Setup

### Ubuntu Server Setup

#### Step 1: Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install curl wget git build-essential -y
```

#### Step 2: Install Node.js
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Step 3: Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

#### Step 4: Install Nginx (Web Server)
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### Step 5: Install PostgreSQL (Database)
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Windows Server Setup

#### Step 1: Install Node.js
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Run installer as Administrator
3. Verify installation in Command Prompt:
```cmd
node --version
npm --version
```

#### Step 2: Install PM2
```cmd
npm install -g pm2
npm install -g pm2-windows-startup
pm2-startup install
```

#### Step 3: Install IIS (Optional - Alternative to Nginx)
1. Open "Turn Windows features on or off"
2. Enable "Internet Information Services"
3. Enable "World Wide Web Services"

---

## Database Setup

### PostgreSQL Setup

#### Ubuntu/Linux
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE printmonitor;
CREATE USER printmonitor_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE printmonitor TO printmonitor_user;

# Exit PostgreSQL
\q
```

#### Windows
```cmd
# Open Command Prompt as Administrator
# Navigate to PostgreSQL bin directory
cd "C:\Program Files\PostgreSQL\15\bin"

# Connect to PostgreSQL
psql -U postgres

# Create database and user (same commands as Linux)
CREATE DATABASE printmonitor;
CREATE USER printmonitor_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE printmonitor TO printmonitor_user;

# Exit
\q
```

### Database Schema Setup
```sql
-- Connect to the database
psql -U printmonitor_user -d printmonitor

-- Create tables (run the SQL from DEPLOYMENT_GUIDE.md)
-- Copy and paste the CREATE TABLE statements from the deployment guide
```

---

## Environment Configuration

### Step 1: Create Environment File

Create a `.env` file in the project root:

```bash
# For development
cp .env.example .env

# Or create manually
touch .env
```

### Step 2: Configure Environment Variables

#### Development (.env)
```env
# Application
NODE_ENV=development
PORT=5173
VITE_APP_NAME=PrintMonitor

# Database (if using backend)
DATABASE_URL=postgresql://printmonitor_user:your_password@localhost:5432/printmonitor

# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_VERSION=1.0.0

# Security
JWT_SECRET=your_jwt_secret_key_here
ENCRYPTION_KEY=your_encryption_key_here

# External Services (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/app.log
```

#### Production (.env.production)
```env
# Application
NODE_ENV=production
PORT=3000
VITE_APP_NAME=PrintMonitor

# Database
DATABASE_URL=postgresql://printmonitor_user:secure_password@localhost:5432/printmonitor

# API Configuration
VITE_API_BASE_URL=https://yourdomain.com/api
VITE_APP_VERSION=1.0.0

# Security
JWT_SECRET=very_secure_jwt_secret_key
ENCRYPTION_KEY=very_secure_encryption_key

# External Services
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=secure_smtp_password

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/printmonitor/app.log
```

---

## Running the Application

### Development Mode

```bash
# Start development server
npm run dev

# The application will be available at:
# http://localhost:5173
```

#### Development Commands
```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Run type checking
npx tsc --noEmit
```

### Production Mode

#### Step 1: Build the Application
```bash
# Build for production
npm run build

# This creates a 'dist' folder with optimized files
```

#### Step 2: Serve with PM2
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'printmonitor-frontend',
    script: 'npm',
    args: 'run preview',
    cwd: '/path/to/your/project',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/printmonitor/err.log',
    out_file: '/var/log/printmonitor/out.log',
    log_file: '/var/log/printmonitor/combined.log',
    time: true
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Step 3: Configure Nginx (Linux)
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/printmonitor

# Add the following configuration:
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
    
    # Root directory
    root /path/to/your/project/dist;
    index index.html;
    
    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy (if you have a backend API)
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security
    location ~ /\. {
        deny all;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/printmonitor /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Deployment

### Automated Deployment Script

Create `deploy.sh`:
```bash
#!/bin/bash

# Deployment script for PrintMonitor
set -e

echo "🚀 Starting PrintMonitor deployment..."

# Variables
PROJECT_DIR="/var/www/printmonitor"
BACKUP_DIR="/var/backups/printmonitor"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
echo "📦 Creating backup..."
sudo mkdir -p $BACKUP_DIR
sudo cp -r $PROJECT_DIR $BACKUP_DIR/backup_$DATE

# Pull latest changes (if using Git)
echo "📥 Pulling latest changes..."
cd $PROJECT_DIR
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Build application
echo "🔨 Building application..."
npm run build

# Restart services
echo "🔄 Restarting services..."
pm2 restart printmonitor-frontend
sudo systemctl reload nginx

# Health check
echo "🏥 Performing health check..."
sleep 5
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Deployment successful!"
else
    echo "❌ Deployment failed - rolling back..."
    sudo rm -rf $PROJECT_DIR
    sudo cp -r $BACKUP_DIR/backup_$DATE $PROJECT_DIR
    pm2 restart printmonitor-frontend
    exit 1
fi

echo "🎉 Deployment completed successfully!"
```

Make it executable:
```bash
chmod +x deploy.sh
```

### SSL Certificate Setup (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run

# Setup automatic renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

---

## Monitoring and Maintenance

### Log Management

```bash
# Create log directories
sudo mkdir -p /var/log/printmonitor
sudo chown $USER:$USER /var/log/printmonitor

# Setup log rotation
sudo nano /etc/logrotate.d/printmonitor
```

Add to logrotate config:
```
/var/log/printmonitor/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reload printmonitor-frontend
    endscript
}
```

### Health Monitoring

Create `health-check.sh`:
```bash
#!/bin/bash

# Health check script
URL="http://localhost:3000"
TIMEOUT=10

if curl -f --max-time $TIMEOUT $URL > /dev/null 2>&1; then
    echo "✅ Application is healthy"
    exit 0
else
    echo "❌ Application is down - attempting restart"
    pm2 restart printmonitor-frontend
    sleep 10
    
    if curl -f --max-time $TIMEOUT $URL > /dev/null 2>&1; then
        echo "✅ Application restarted successfully"
        exit 0
    else
        echo "❌ Application restart failed"
        exit 1
    fi
fi
```

Setup cron job:
```bash
# Add to crontab
crontab -e

# Add this line to check every 5 minutes
*/5 * * * * /path/to/health-check.sh >> /var/log/printmonitor/health.log 2>&1
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find process using port 5173
lsof -i :5173

# Kill the process
kill -9 <PID>

# Or use a different port
npm run dev -- --port 3000
```

#### 2. Permission Denied Errors
```bash
# Fix npm permissions
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER /usr/local/lib/node_modules

# Fix project permissions
sudo chown -R $USER:$USER /path/to/project
```

#### 3. Build Failures
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npx tsc --noEmit
```

#### 4. Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
psql -U printmonitor_user -d printmonitor -h localhost

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Performance Optimization

#### 1. Enable Gzip Compression
Already included in Nginx configuration above.

#### 2. Optimize Build
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Enable source maps for debugging (development only)
# Add to vite.config.ts:
# build: { sourcemap: true }
```

#### 3. Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_print_jobs_client_id ON print_jobs(client_id);
CREATE INDEX idx_print_jobs_timestamp ON print_jobs(timestamp);
CREATE INDEX idx_printers_client_id ON printers(client_id);
CREATE INDEX idx_users_client_id ON users(client_id);
```

### Backup and Recovery

#### Automated Backup Script
```bash
#!/bin/bash

# backup.sh
BACKUP_DIR="/var/backups/printmonitor"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U printmonitor_user printmonitor > $BACKUP_DIR/db_backup_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /var/www/printmonitor

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Setup daily backup:
```bash
# Add to crontab
0 2 * * * /path/to/backup.sh >> /var/log/printmonitor/backup.log 2>&1
```

---

## Quick Start Commands

### Development
```bash
# Clone and setup
git clone <repo-url>
cd printer-monitoring-system
npm install
npm run dev
```

### Production Deployment
```bash
# Build and deploy
npm run build
pm2 start ecosystem.config.js
sudo systemctl restart nginx
```

### Maintenance
```bash
# Update application
git pull
npm install
npm run build
pm2 restart printmonitor-frontend

# View logs
pm2 logs printmonitor-frontend
tail -f /var/log/nginx/access.log

# Monitor performance
pm2 monit
htop
```

This comprehensive guide covers everything needed to install, configure, and deploy the Printer Monitoring System in both development and production environments.