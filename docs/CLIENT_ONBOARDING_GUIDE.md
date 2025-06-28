# Client Onboarding Guide - Printer Monitoring System

## Overview
This comprehensive guide walks you through the complete process of onboarding a new client to the Printer Monitoring System. Each client will have their own isolated environment with 3 printers and dedicated user management.

## Table of Contents
1. [Pre-Onboarding Checklist](#pre-onboarding-checklist)
2. [Client Account Setup](#client-account-setup)
3. [Infrastructure Configuration](#infrastructure-configuration)
4. [Printer Setup](#printer-setup)
5. [User Management](#user-management)
6. [Windows Listener Installation](#windows-listener-installation)
7. [Testing & Validation](#testing--validation)
8. [Go-Live Checklist](#go-live-checklist)
9. [Post-Onboarding Support](#post-onboarding-support)

---

## Pre-Onboarding Checklist

### Client Information Gathering
Before starting the onboarding process, collect the following information:

#### **Business Information**
- [ ] Company name and legal entity
- [ ] Primary contact person and role
- [ ] Business address (physical location)
- [ ] Primary email and phone number
- [ ] Backup contact information
- [ ] Preferred communication channels

#### **Technical Requirements**
- [ ] Number of printers to monitor (standard: 3)
- [ ] Printer models and locations
- [ ] Network infrastructure details
- [ ] IT contact person and credentials
- [ ] Preferred IP address ranges
- [ ] Domain/subdomain preferences

#### **Subscription Details**
- [ ] Subscription plan (Basic, Premium, Enterprise)
- [ ] Billing contact and preferences
- [ ] Contract start date
- [ ] Special requirements or customizations

---

## Client Account Setup

### Step 1: Database Configuration

#### Create Client Record
```sql
-- Connect to the PrintMonitor database
psql -U printmonitor_user -d printmonitor

-- Insert new client record
INSERT INTO clients (
    name, 
    address, 
    contact_email, 
    contact_phone, 
    subscription_plan, 
    is_active, 
    printer_count,
    user_count
) VALUES (
    'Client Company Name',
    'Full Business Address',
    'admin@clientcompany.com',
    '+1-555-0123',
    'premium',
    true,
    3,
    0
);

-- Get the client ID for reference
SELECT id, name FROM clients WHERE name = 'Client Company Name';
```

#### Generate API Keys
```bash
# Generate unique API key for the client
CLIENT_ID="client-uuid-here"
API_KEY=$(openssl rand -hex 32)

# Store in secure key management system
echo "Client: $CLIENT_ID"
echo "API Key: $API_KEY"
```

### Step 2: Access Configuration

#### Subdomain Setup
Configure client-specific access:
- **Option A**: Subdomain - `clientname.printmonitor.com`
- **Option B**: Path-based - `printmonitor.com/clientname`

#### SSL Certificate
```bash
# Generate SSL certificate for subdomain
sudo certbot --nginx -d clientname.printmonitor.com
```

---

## Infrastructure Configuration

### Step 3: Network Setup

#### Client Network Requirements
- **Bandwidth**: Minimum 1 Mbps upload
- **Ports**: Outbound HTTPS (443) access required
- **Firewall**: Allow connections to printmonitor.com
- **DNS**: Configure subdomain if using custom domain

#### VPN Configuration (Optional)
For enhanced security, set up VPN tunnel:
```bash
# Configure OpenVPN client certificate
sudo openvpn --config client-config.ovpn
```

---

## Printer Setup

### Step 4: Printer Configuration

#### Standard 3-Printer Setup
For each client, configure exactly 3 printers:

```sql
-- Insert printer records for the client
INSERT INTO printers (client_id, name, location, model, ip_address, department) VALUES
((SELECT id FROM clients WHERE name = 'Client Company Name'), 'ClientName-Printer-01', 'Reception Area', 'HP LaserJet Pro M404n', '192.168.1.101', 'Administration'),
((SELECT id FROM clients WHERE name = 'Client Company Name'), 'ClientName-Printer-02', 'Main Office', 'Canon PIXMA Pro-200', '192.168.1.102', 'Operations'),
((SELECT id FROM clients WHERE name = 'Client Company Name'), 'ClientName-Printer-03', 'Conference Room', 'Brother HL-L2350DW', '192.168.1.103', 'Management');
```

#### Printer Naming Convention
- **Format**: `ClientName-Printer-XX`
- **Examples**: 
  - `TechCorp-Printer-01`
  - `Marketing-Printer-02`
  - `Finance-Printer-03`

#### IP Address Assignment
- **Range**: 192.168.1.101-103 (or client-specific range)
- **Static IPs**: Required for consistent monitoring
- **Documentation**: Maintain IP address registry

---

## User Management

### Step 5: Initial User Setup

#### Create Admin User
```sql
-- Create primary admin user for the client
INSERT INTO users (client_id, name, department, email, role) VALUES
((SELECT id FROM clients WHERE name = 'Client Company Name'), 'Admin User', 'IT', 'admin@clientcompany.com', 'admin');
```

#### Department Structure
Set up standard departments:
- Administration
- Finance
- Marketing
- Operations
- IT
- HR
- Sales
- Legal
- Executive

#### User Roles
- **Admin**: Full system access
- **Manager**: Department-level access
- **User**: Basic printing access

---

## Windows Listener Installation

### Step 6: Deploy Print Monitoring

#### Create Client-Specific Installation Package

**File: `install-client.bat`**
```batch
@echo off
echo PrintMonitor Installation for [CLIENT_NAME]
echo ==========================================

set CLIENT_ID=[CLIENT_UUID]
set API_ENDPOINT=https://printmonitor.com/api
set API_KEY=[CLIENT_API_KEY]

echo Installing PrintMonitor Service...
powershell.exe -ExecutionPolicy Bypass -File "InstallService.ps1" -ClientId "%CLIENT_ID%" -ApiEndpoint "%API_ENDPOINT%" -ApiKey "%API_KEY%"

echo Installation complete!
echo.
echo Client ID: %CLIENT_ID%
echo API Endpoint: %API_ENDPOINT%
echo.
echo Please verify the service is running in Windows Services.
pause
```

#### Installation Steps
1. **Download Package**: Provide client with installation files
2. **Run as Administrator**: Execute `install-client.bat`
3. **Verify Service**: Check Windows Services for "PrintMonitor Service"
4. **Test Connection**: Send test print job

#### Configuration Verification
```powershell
# Test API connectivity
$headers = @{
    "Authorization" = "Bearer [CLIENT_API_KEY]"
    "Content-Type" = "application/json"
    "X-Client-ID" = "[CLIENT_UUID]"
}

$testData = @{
    fileName = "test-connection.pdf"
    user = "system.test"
    department = "IT"
    printer = "Test-Printer"
    pages = 1
    status = "success"
    timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
}

Invoke-RestMethod -Uri "https://printmonitor.com/api/print-jobs" -Method POST -Body ($testData | ConvertTo-Json) -Headers $headers
```

---

## Testing & Validation

### Step 7: System Testing

#### Connectivity Tests
- [ ] API endpoint accessibility
- [ ] Authentication working
- [ ] Database connectivity
- [ ] Print job capture

#### Functional Tests
- [ ] Print job logging
- [ ] User activity tracking
- [ ] Printer status monitoring
- [ ] Dashboard data display

#### Performance Tests
- [ ] Response time < 2 seconds
- [ ] Concurrent user handling
- [ ] Data synchronization
- [ ] Error handling

#### Test Print Jobs
Generate test data to verify system functionality:
```sql
-- Insert test print jobs
INSERT INTO print_jobs (client_id, printer_id, user_id, file_name, pages, status, cost) VALUES
((SELECT id FROM clients WHERE name = 'Client Company Name'), 
 (SELECT id FROM printers WHERE name = 'ClientName-Printer-01'), 
 (SELECT id FROM users WHERE email = 'admin@clientcompany.com'), 
 'test-document.pdf', 5, 'success', 0.25);
```

---

## Go-Live Checklist

### Step 8: Production Deployment

#### Pre-Launch Verification
- [ ] All printers configured and online
- [ ] Windows listeners installed on all machines
- [ ] Admin users created and trained
- [ ] API keys secured and documented
- [ ] Backup procedures tested
- [ ] Monitoring alerts configured

#### Launch Day Tasks
- [ ] Enable production monitoring
- [ ] Verify real print job capture
- [ ] Monitor system performance
- [ ] Address any immediate issues
- [ ] Confirm client satisfaction

#### Documentation Handover
Provide client with:
- [ ] User manual and training materials
- [ ] Admin guide for user management
- [ ] Troubleshooting documentation
- [ ] Support contact information
- [ ] API documentation (if needed)

---

## Post-Onboarding Support

### Step 9: Ongoing Support

#### First Week Support
- **Daily Check-ins**: Monitor system health
- **Issue Resolution**: Address any problems immediately
- **User Training**: Provide additional training if needed
- **Performance Tuning**: Optimize based on usage patterns

#### First Month Monitoring
- **Weekly Reports**: Provide usage analytics
- **System Optimization**: Fine-tune performance
- **User Feedback**: Collect and address feedback
- **Feature Requests**: Document enhancement requests

#### Ongoing Maintenance
- **Monthly Health Checks**: System performance review
- **Quarterly Business Reviews**: Usage analysis and optimization
- **Annual Contract Reviews**: Plan renewals and upgrades
- **Continuous Improvement**: Implement new features and updates

---

## Troubleshooting Common Issues

### Connection Problems
```powershell
# Test network connectivity
Test-NetConnection printmonitor.com -Port 443

# Verify DNS resolution
nslookup printmonitor.com

# Check firewall settings
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*PrintMonitor*"}
```

### Service Issues
```powershell
# Check service status
Get-Service -Name "PrintMonitorService"

# Restart service
Restart-Service -Name "PrintMonitorService"

# View service logs
Get-EventLog -LogName Application -Source "PrintMonitorService" -Newest 50
```

### API Issues
```bash
# Test API endpoint
curl -H "Authorization: Bearer [API_KEY]" \
     -H "X-Client-ID: [CLIENT_ID]" \
     https://printmonitor.com/api/health

# Validate API key
curl -H "Authorization: Bearer [API_KEY]" \
     https://printmonitor.com/api/validate
```

---

## Client Onboarding Timeline

### Typical Timeline: 5-7 Business Days

| Day | Activity | Duration | Responsible |
|-----|----------|----------|-------------|
| 1 | Information gathering & account setup | 2-3 hours | Account Manager |
| 2 | Database configuration & API setup | 1-2 hours | Technical Team |
| 3 | Printer configuration & testing | 2-3 hours | Technical Team |
| 4 | Windows listener installation | 1-2 hours | Client IT + Support |
| 5 | User training & system testing | 2-3 hours | Support Team |
| 6-7 | Go-live & initial support | Ongoing | Support Team |

---

## Success Metrics

### Key Performance Indicators
- **Setup Time**: < 5 business days
- **First Print Job Captured**: Within 24 hours of go-live
- **System Uptime**: > 99.5%
- **Client Satisfaction**: > 4.5/5 rating
- **Support Tickets**: < 2 per month after first month

### Quality Assurance
- All printers showing online status
- Print jobs being captured accurately
- Users able to access dashboard
- Reports generating correctly
- No data loss or corruption

---

## Contact Information

### Support Channels
- **Email**: support@printmonitor.com
- **Phone**: +1-800-PRINT-MON
- **Portal**: https://support.printmonitor.com
- **Emergency**: +1-800-EMERGENCY (24/7)

### Escalation Path
1. **Level 1**: General support team
2. **Level 2**: Technical specialists
3. **Level 3**: Engineering team
4. **Level 4**: Management escalation

This comprehensive onboarding guide ensures consistent, successful client deployments while maintaining high quality standards and client satisfaction.