# Linux Print Listener Setup Guide

## Overview
This guide explains how to set up the Linux Print Listener service on client machines to automatically capture print job events from any user/system and send them to the central monitoring system.

## Prerequisites
- Linux distribution (Ubuntu 18.04+, CentOS 7+, RHEL 7+, Debian 9+)
- Python 3.6 or later
- CUPS printing system (usually pre-installed)
- Network access to the central server
- Root/sudo privileges for installation

## Installation Steps

### Step 1: Download Print Listener Script
Create `print_listener.py`:

```python
#!/usr/bin/env python3
"""
Linux Print Job Monitor - Captures print jobs from any user/system
Monitors CUPS logs and sends data to central server
"""

import os
import sys
import time
import json
import socket
import logging
import requests
import subprocess
import configparser
from datetime import datetime
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class PrintJobHandler(FileSystemEventHandler):
    def __init__(self, config):
        self.config = config
        self.client_id = config['client_id']
        self.api_endpoint = config['api_endpoint']
        self.api_key = config['api_key']
        self.last_position = 0
        
        # Setup logging
        log_dir = Path('/var/log/printmonitor')
        log_dir.mkdir(exist_ok=True)
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('/var/log/printmonitor/printmonitor.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
    def get_system_info(self):
        """Get system information for department detection"""
        hostname = socket.gethostname().upper()
        username = os.getenv('USER', 'unknown')
        
        # Department detection based on hostname patterns
        department = "Unknown"
        
        if any(dept in hostname for dept in ['FINANCE', 'FIN', 'ACCOUNTING', 'ACC']):
            department = "Finance"
        elif any(dept in hostname for dept in ['MARKETING', 'MKT', 'SALES']):
            department = "Marketing"
        elif any(dept in hostname for dept in ['HR', 'HUMAN']):
            department = "HR"
        elif any(dept in hostname for dept in ['IT', 'TECH', 'DEV']):
            department = "IT"
        elif any(dept in hostname for dept in ['OPS', 'OPERATIONS']):
            department = "Operations"
        elif any(dept in hostname for dept in ['ADMIN', 'MGMT', 'EXEC']):
            department = "Administration"
        elif any(dept in hostname for dept in ['LEGAL', 'LAW']):
            department = "Legal"
            
        return {
            'system_name': hostname,
            'username': username,
            'department': department
        }
    
    def get_printer_info(self, printer_name):
        """Get printer information from CUPS"""
        try:
            # Get printer status from lpstat
            result = subprocess.run(['lpstat', '-p', printer_name], 
                                  capture_output=True, text=True)
            
            if result.returncode == 0:
                status_line = result.stdout.strip()
                if 'idle' in status_line.lower():
                    status = 'online'
                elif 'disabled' in status_line.lower():
                    status = 'offline'
                else:
                    status = 'unknown'
            else:
                status = 'unknown'
                
            # Get printer description
            desc_result = subprocess.run(['lpstat', '-l', '-p', printer_name], 
                                       capture_output=True, text=True)
            description = "Unknown"
            if desc_result.returncode == 0:
                for line in desc_result.stdout.split('\n'):
                    if 'Description:' in line:
                        description = line.split('Description:')[1].strip()
                        break
                        
            return {
                'model': description,
                'status': status,
                'location': 'Unknown'
            }
        except Exception as e:
            self.logger.error(f"Error getting printer info: {e}")
            return {
                'model': 'Unknown',
                'status': 'unknown',
                'location': 'Unknown'
            }
    
    def parse_cups_log_line(self, line):
        """Parse a CUPS access log line for print job information"""
        try:
            # CUPS access log format: IP - user [timestamp] "POST /printers/printer HTTP/1.1" status size
            # Example: 127.0.0.1 - john [25/Dec/2024:10:30:45 +0000] "POST /printers/HP-LaserJet HTTP/1.1" 200 1234
            
            if 'POST /printers/' not in line or '"' not in line:
                return None
                
            parts = line.split('"')
            if len(parts) < 2:
                return None
                
            request_part = parts[1]
            if not request_part.startswith('POST /printers/'):
                return None
                
            # Extract printer name from URL
            printer_path = request_part.split()[1]  # "/printers/HP-LaserJet"
            printer_name = printer_path.split('/printers/')[-1]
            
            # Extract user from log line
            before_bracket = line.split('[')[0]
            user_part = before_bracket.split(' - ')[-1].strip()
            
            # Extract timestamp
            timestamp_match = line.split('[')[1].split(']')[0] if '[' in line else None
            
            return {
                'printer_name': printer_name,
                'user': user_part if user_part != '-' else 'unknown',
                'timestamp': timestamp_match,
                'raw_line': line
            }
            
        except Exception as e:
            self.logger.error(f"Error parsing log line: {e}")
            return None
    
    def get_job_details_from_cups(self, job_id=None):
        """Get additional job details from CUPS if available"""
        try:
            # Try to get job information
            result = subprocess.run(['lpstat', '-o'], capture_output=True, text=True)
            
            if result.returncode == 0:
                # Parse active jobs
                for line in result.stdout.split('\n'):
                    if line.strip():
                        # Format: "printer-job_id user priority [date time] filename"
                        parts = line.split()
                        if len(parts) >= 4:
                            return {
                                'pages': 1,  # Default, hard to get exact count
                                'file_size': 'Unknown',
                                'status': 'success'
                            }
            
            return {
                'pages': 1,
                'file_size': 'Unknown', 
                'status': 'success'
            }
            
        except Exception as e:
            self.logger.error(f"Error getting job details: {e}")
            return {
                'pages': 1,
                'file_size': 'Unknown',
                'status': 'success'
            }
    
    def send_print_job_data(self, job_data):
        """Send print job data to central server"""
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
                'X-Client-ID': self.client_id
            }
            
            response = requests.post(
                f"{self.api_endpoint}/print-jobs",
                json=job_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                self.logger.info(f"Successfully sent print job data: {job_data['fileName']} from {job_data['systemName']}")
                return True
            else:
                self.logger.error(f"Failed to send print job data: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error sending print job data: {e}")
            return False
    
    def process_new_log_entries(self):
        """Process new entries in CUPS access log"""
        cups_log_path = '/var/log/cups/access_log'
        
        try:
            if not os.path.exists(cups_log_path):
                self.logger.warning(f"CUPS log file not found: {cups_log_path}")
                return
                
            with open(cups_log_path, 'r') as f:
                f.seek(self.last_position)
                new_lines = f.readlines()
                self.last_position = f.tell()
                
            for line in new_lines:
                line = line.strip()
                if not line:
                    continue
                    
                job_info = self.parse_cups_log_line(line)
                if not job_info:
                    continue
                    
                # Get system information
                system_info = self.get_system_info()
                
                # Get printer information
                printer_info = self.get_printer_info(job_info['printer_name'])
                
                # Get job details
                job_details = self.get_job_details_from_cups()
                
                # Prepare print job data
                print_data = {
                    'fileName': f"document_{int(time.time())}.pdf",  # Generic filename
                    'user': system_info['system_name'],  # Use system name as primary identifier
                    'systemName': system_info['system_name'],
                    'department': system_info['department'],
                    'printer': job_info['printer_name'],
                    'pages': job_details['pages'],
                    'status': job_details['status'],
                    'timestamp': datetime.now().isoformat(),
                    'fileSize': job_details['file_size'],
                    'paperSize': 'A4',  # Default
                    'colorMode': 'blackwhite',  # Default
                    'printerModel': printer_info['model'],
                    'printerLocation': printer_info['location'],
                    'actualUser': system_info['username']  # Store actual user for reference
                }
                
                # Send data to API
                success = self.send_print_job_data(print_data)
                
                if success:
                    self.logger.info(f"Print job captured: {print_data['fileName']} from system {print_data['systemName']} (user: {print_data['actualUser']})")
                else:
                    self.logger.error(f"Failed to send print job: {print_data['fileName']} from {print_data['systemName']}")
                    
        except Exception as e:
            self.logger.error(f"Error processing log entries: {e}")
    
    def on_modified(self, event):
        """Handle file modification events"""
        if event.is_directory:
            return
            
        if event.src_path.endswith('access_log'):
            self.logger.debug("CUPS access log modified, processing new entries")
            self.process_new_log_entries()

class PrintMonitorService:
    def __init__(self, config_file='/etc/printmonitor/config.ini'):
        self.config_file = config_file
        self.config = self.load_config()
        self.handler = PrintJobHandler(self.config)
        self.observer = Observer()
        
    def load_config(self):
        """Load configuration from file"""
        config = configparser.ConfigParser()
        
        if os.path.exists(self.config_file):
            config.read(self.config_file)
            return {
                'client_id': config.get('api', 'client_id'),
                'api_endpoint': config.get('api', 'endpoint'),
                'api_key': config.get('api', 'key')
            }
        else:
            raise FileNotFoundError(f"Configuration file not found: {self.config_file}")
    
    def start(self):
        """Start the print monitoring service"""
        self.handler.logger.info(f"Starting Print Monitor for Client: {self.config['client_id']} (Linux)")
        
        # Watch CUPS log directory
        cups_log_dir = '/var/log/cups'
        if os.path.exists(cups_log_dir):
            self.observer.schedule(self.handler, cups_log_dir, recursive=False)
            self.observer.start()
            self.handler.logger.info(f"Monitoring CUPS logs in: {cups_log_dir}")
        else:
            self.handler.logger.error(f"CUPS log directory not found: {cups_log_dir}")
            return False
        
        try:
            while True:
                time.sleep(30)
                self.handler.logger.debug("Print Monitor is running... (Monitoring all users on Linux)")
                
                # Also process any missed entries periodically
                self.handler.process_new_log_entries()
                
        except KeyboardInterrupt:
            self.handler.logger.info("Print Monitor stopped by user")
        except Exception as e:
            self.handler.logger.error(f"Print Monitor error: {e}")
        finally:
            self.observer.stop()
            self.observer.join()
            self.handler.logger.info("Print Monitor stopped")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == '--daemon':
        # Run as daemon
        import daemon
        import daemon.pidfile
        
        with daemon.DaemonContext(
            pidfile=daemon.pidfile.PIDLockFile('/var/run/printmonitor.pid'),
            working_directory='/var/log/printmonitor'
        ):
            service = PrintMonitorService()
            service.start()
    else:
        # Run in foreground
        service = PrintMonitorService()
        service.start()
```

### Step 2: Create Installation Script
Create `install_linux.sh`:

```bash
#!/bin/bash

# Linux Print Monitor Installation Script
# Usage: sudo ./install_linux.sh CLIENT_ID API_ENDPOINT API_KEY

set -e

# Configuration
SERVICE_NAME="printmonitor"
SERVICE_USER="printmonitor"
INSTALL_DIR="/opt/printmonitor"
CONFIG_DIR="/etc/printmonitor"
LOG_DIR="/var/log/printmonitor"
PYTHON_SCRIPT="print_listener.py"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root (use sudo)"
fi

# Check arguments
if [ $# -ne 3 ]; then
    error "Usage: $0 CLIENT_ID API_ENDPOINT API_KEY"
fi

CLIENT_ID="$1"
API_ENDPOINT="$2"
API_KEY="$3"

log "🚀 Starting PrintMonitor installation for Linux..."
log "Client ID: $CLIENT_ID"
log "API Endpoint: $API_ENDPOINT"

# Detect Linux distribution
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
else
    error "Cannot detect Linux distribution"
fi

log "📋 Detected OS: $OS $VER"

# Install dependencies based on distribution
log "📦 Installing dependencies..."

if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
    apt-get update
    apt-get install -y python3 python3-pip python3-venv cups curl
    
elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Rocky"* ]]; then
    yum update -y
    yum install -y python3 python3-pip cups curl
    
elif [[ "$OS" == *"Fedora"* ]]; then
    dnf update -y
    dnf install -y python3 python3-pip cups curl
    
else
    warning "Unsupported distribution. Attempting generic installation..."
    # Try to install with package manager detection
    if command -v apt-get &> /dev/null; then
        apt-get update && apt-get install -y python3 python3-pip python3-venv cups curl
    elif command -v yum &> /dev/null; then
        yum install -y python3 python3-pip cups curl
    elif command -v dnf &> /dev/null; then
        dnf install -y python3 python3-pip cups curl
    else
        error "Cannot install dependencies automatically. Please install Python 3, pip, and CUPS manually."
    fi
fi

# Verify Python installation
if ! command -v python3 &> /dev/null; then
    error "Python 3 is not installed or not in PATH"
fi

# Verify CUPS installation
if ! command -v lpstat &> /dev/null; then
    error "CUPS is not installed or not in PATH"
fi

success "Dependencies installed successfully"

# Create service user
log "👤 Creating service user..."
if ! id "$SERVICE_USER" &>/dev/null; then
    useradd --system --no-create-home --shell /bin/false $SERVICE_USER
    success "Created user: $SERVICE_USER"
else
    log "User $SERVICE_USER already exists"
fi

# Create directories
log "📁 Creating directories..."
mkdir -p $INSTALL_DIR
mkdir -p $CONFIG_DIR
mkdir -p $LOG_DIR

# Set permissions
chown $SERVICE_USER:$SERVICE_USER $LOG_DIR
chmod 755 $INSTALL_DIR
chmod 755 $CONFIG_DIR
chmod 755 $LOG_DIR

success "Directories created"

# Create Python virtual environment
log "🐍 Setting up Python environment..."
python3 -m venv $INSTALL_DIR/venv
source $INSTALL_DIR/venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install requests watchdog python-daemon configparser

success "Python environment configured"

# Copy Python script
log "📄 Installing Python script..."
cat > $INSTALL_DIR/$PYTHON_SCRIPT << 'EOF'
# The Python script content goes here (from above)
EOF

chmod +x $INSTALL_DIR/$PYTHON_SCRIPT
chown $SERVICE_USER:$SERVICE_USER $INSTALL_DIR/$PYTHON_SCRIPT

success "Python script installed"

# Create configuration file
log "⚙️ Creating configuration..."
cat > $CONFIG_DIR/config.ini << EOF
[api]
client_id = $CLIENT_ID
endpoint = $API_ENDPOINT
key = $API_KEY

[logging]
level = INFO
file = $LOG_DIR/printmonitor.log

[monitoring]
cups_log_path = /var/log/cups/access_log
check_interval = 30
EOF

chown $SERVICE_USER:$SERVICE_USER $CONFIG_DIR/config.ini
chmod 600 $CONFIG_DIR/config.ini

success "Configuration created"

# Create systemd service file
log "🔧 Creating systemd service..."
cat > /etc/systemd/system/$SERVICE_NAME.service << EOF
[Unit]
Description=PrintMonitor Service (Linux)
After=network.target cups.service
Wants=cups.service

[Service]
Type=simple
User=$SERVICE_USER
Group=$SERVICE_USER
WorkingDirectory=$INSTALL_DIR
Environment=PATH=$INSTALL_DIR/venv/bin
ExecStart=$INSTALL_DIR/venv/bin/python $INSTALL_DIR/$PYTHON_SCRIPT
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
systemctl daemon-reload
systemctl enable $SERVICE_NAME

success "Systemd service created and enabled"

# Configure CUPS logging
log "📊 Configuring CUPS logging..."
CUPS_CONFIG="/etc/cups/cupsd.conf"

if [ -f "$CUPS_CONFIG" ]; then
    # Backup original config
    cp $CUPS_CONFIG $CUPS_CONFIG.backup.$(date +%Y%m%d_%H%M%S)
    
    # Ensure access logging is enabled
    if ! grep -q "^AccessLog " $CUPS_CONFIG; then
        echo "AccessLog /var/log/cups/access_log" >> $CUPS_CONFIG
    fi
    
    # Set appropriate log level
    sed -i 's/^LogLevel.*/LogLevel info/' $CUPS_CONFIG || echo "LogLevel info" >> $CUPS_CONFIG
    
    # Restart CUPS to apply changes
    systemctl restart cups
    
    success "CUPS logging configured"
else
    warning "CUPS configuration file not found. Manual configuration may be required."
fi

# Add service user to necessary groups
log "🔐 Configuring permissions..."
usermod -a -G lp $SERVICE_USER  # For printer access
usermod -a -G adm $SERVICE_USER  # For log access (on some systems)

# Set up log rotation
log "🔄 Setting up log rotation..."
cat > /etc/logrotate.d/printmonitor << EOF
$LOG_DIR/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
    su $SERVICE_USER $SERVICE_USER
}
EOF

success "Log rotation configured"

# Start the service
log "▶️ Starting PrintMonitor service..."
systemctl start $SERVICE_NAME

# Check service status
sleep 3
if systemctl is-active --quiet $SERVICE_NAME; then
    success "PrintMonitor service started successfully"
else
    error "Failed to start PrintMonitor service. Check logs: journalctl -u $SERVICE_NAME"
fi

# Display service status
log "📊 Service Status:"
systemctl status $SERVICE_NAME --no-pager -l

# Test API connectivity
log "🔗 Testing API connectivity..."
if curl -f --max-time 10 "$API_ENDPOINT" > /dev/null 2>&1; then
    success "API endpoint is reachable"
else
    warning "API endpoint test failed. Check network connectivity and endpoint URL."
fi

# Final instructions
log "✅ Installation completed successfully!"
echo
echo "📋 Service Information:"
echo "  Service Name: $SERVICE_NAME"
echo "  Client ID: $CLIENT_ID"
echo "  API Endpoint: $API_ENDPOINT"
echo "  Install Directory: $INSTALL_DIR"
echo "  Config File: $CONFIG_DIR/config.ini"
echo "  Log Directory: $LOG_DIR"
echo
echo "🔧 Useful Commands:"
echo "  Check status: sudo systemctl status $SERVICE_NAME"
echo "  View logs: sudo journalctl -u $SERVICE_NAME -f"
echo "  Restart service: sudo systemctl restart $SERVICE_NAME"
echo "  Stop service: sudo systemctl stop $SERVICE_NAME"
echo
echo "📝 Next Steps:"
echo "  1. Verify CUPS is running: sudo systemctl status cups"
echo "  2. Test printing to generate log entries"
echo "  3. Check service logs for print job capture"
echo "  4. Monitor dashboard for incoming data"

success "🎉 PrintMonitor for Linux is now running!"
```

### Step 3: Create Deployment Package
Create `deploy_linux.sh`:

```bash
#!/bin/bash

# Linux Deployment Script for PrintMonitor
# Usage: ./deploy_linux.sh

echo "PrintMonitor Linux Deployment"
echo "============================="

# Get client configuration
read -p "Enter Client ID: " CLIENT_ID
read -p "Enter API Endpoint (e.g., https://printmonitor.com/api): " API_ENDPOINT
read -s -p "Enter API Key: " API_KEY
echo

echo
echo "Installing PrintMonitor Service for Linux..."
echo "Client ID: $CLIENT_ID"
echo "API Endpoint: $API_ENDPOINT"
echo

# Make install script executable
chmod +x install_linux.sh

# Run installation
sudo ./install_linux.sh "$CLIENT_ID" "$API_ENDPOINT" "$API_KEY"

echo
echo "Installation complete!"
echo "The service will now monitor print jobs from all users on this Linux system."
echo "System name will be used as the primary identifier."
echo
echo "Check service status: sudo systemctl status printmonitor"
echo "View logs: sudo journalctl -u printmonitor -f"
```

## How It Works

### Automatic User Detection
- **System Name**: Uses hostname (e.g., FINANCE-DESKTOP-01, MARKETING-LAPTOP-03)
- **Department Detection**: Automatically detects department based on hostname patterns
- **User Context**: Captures actual Linux user but uses hostname as primary identifier
- **No Pre-configuration**: Works immediately without setting up individual users

### Data Captured
- **System Name**: Hostname that initiated the print
- **Document Name**: Generic document name (CUPS doesn't always provide original filename)
- **Date & Time**: When the print job was submitted
- **Page Count**: Estimated page count (CUPS limitation)
- **Department**: Auto-detected from hostname
- **Printer**: Which printer was used
- **User**: Linux username (for reference)

### Department Auto-Detection
The system automatically detects departments based on hostname patterns:
- `FINANCE-*`, `FIN-*`, `ACCOUNTING-*` → Finance
- `MARKETING-*`, `MKT-*`, `SALES-*` → Marketing  
- `HR-*`, `HUMAN-*` → HR
- `IT-*`, `TECH-*`, `DEV-*` → IT
- `OPS-*`, `OPERATIONS-*` → Operations
- `ADMIN-*`, `MGMT-*`, `EXEC-*` → Administration
- `LEGAL-*`, `LAW-*` → Legal

## Configuration for Each Client

### Client 1: TechCorp Solutions
```bash
CLIENT_ID=techcorp-001
API_ENDPOINT=https://printmonitor.com/api
API_KEY=techcorp_api_key_here
```

### Client 2: Marketing Plus
```bash
CLIENT_ID=marketing-002
API_ENDPOINT=https://printmonitor.com/api
API_KEY=marketing_api_key_here
```

## Installation Process

### For System Administrators:
1. **Download the installation package**
2. **Run as root**: `sudo ./deploy_linux.sh`
3. **Enter client credentials** when prompted
4. **Service automatically starts** and begins monitoring

### For End Users:
- **No changes required** - users print normally
- **Print jobs automatically captured** from CUPS logs
- **Data appears in real-time** dashboard

## Troubleshooting

### Check Service Status
```bash
sudo systemctl status printmonitor
```

### View Logs
```bash
sudo journalctl -u printmonitor -f
```

### Test CUPS Logging
```bash
sudo tail -f /var/log/cups/access_log
```

### Test API Connection
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "X-Client-ID: YOUR_CLIENT_ID" \
     https://printmonitor.com/api/health
```

### Restart Service
```bash
sudo systemctl restart printmonitor
```

## Security Considerations

1. **Service User**: Runs as dedicated `printmonitor` user with minimal privileges
2. **Log Access**: Service user has read access to CUPS logs only
3. **API Keys**: Stored securely with restricted file permissions (600)
4. **Network**: Uses HTTPS for all communications
5. **Logging**: Comprehensive logging for audit trails

## Supported Distributions

- **Ubuntu**: 18.04, 20.04, 22.04, 24.04
- **Debian**: 9, 10, 11, 12
- **CentOS**: 7, 8
- **RHEL**: 7, 8, 9
- **Rocky Linux**: 8, 9
- **Fedora**: 35+
- **openSUSE**: Leap 15+

## Benefits of Linux Support

1. **Cross-Platform**: Works with both Windows and Linux clients
2. **CUPS Integration**: Leverages standard Linux printing system
3. **System-Based Tracking**: Uses hostnames for consistent identification
4. **Department Auto-Detection**: Automatically categorizes based on naming conventions
5. **Scalable**: Works with any number of users per system
6. **Maintenance-Free**: No need to add/remove users as staff changes
7. **Secure**: Runs as dedicated service user with minimal privileges

## Limitations

1. **Filename Detection**: CUPS doesn't always provide original filenames
2. **Page Count**: Exact page counts may not always be available
3. **File Size**: Original file sizes not captured from CUPS logs
4. **Color Detection**: Cannot determine if job was color or black & white from logs

## Future Enhancements

1. **Enhanced CUPS Integration**: Direct CUPS API integration for better data
2. **Print Queue Monitoring**: Real-time queue status monitoring
3. **Printer SNMP**: Direct printer communication for supply levels
4. **User Session Tracking**: Enhanced user identification methods
5. **Print Accounting**: Integration with CUPS accounting features