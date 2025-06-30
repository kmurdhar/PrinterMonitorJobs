# Complete Client Setup Flow - How Clients Use the System

## Overview
After onboarding a client through the admin panel, here's how they actually start using the system and how printer mapping works.

## 🏢 **Step 1: Client Onboarding (Admin Side)**

### What Happens When You Onboard a Client:
1. **Client Record Created** - Company info, subscription plan, contact details
2. **API Credentials Generated** - Unique Client ID and API Key
3. **Access URL Created** - `clientname.printmonitor.com` subdomain
4. **Setup Guide Generated** - Downloadable configuration file

### Generated Credentials Example:
```
Client ID: techcorp-a1b2c3d4
API Key: 8f7e6d5c4b3a2918f7e6d5c4b3a2918f7e6d5c4b3a291...
Access URL: https://techcorp.printmonitor.com
API Endpoint: https://printmonitor.com/api
```

---

## 🖥️ **Step 2: Client-Side Installation**

### What the Client Receives:
1. **Setup Guide** (downloaded from onboarding wizard)
2. **Windows Print Listener Installer**
3. **Configuration Instructions**
4. **Access Credentials**

### Installation Process:

#### A. Download Print Listener
```
PrintMonitor_Installer_v1.0.exe
├── PrintListener.ps1 (PowerShell script)
├── InstallService.ps1 (Service installer)
├── nssm.exe (Service manager)
└── config_template.json
```

#### B. Run Installation (As Administrator)
```batch
# Client runs this command on EACH computer that will print
PrintMonitor_Installer.exe

# During installation, they enter:
Client ID: techcorp-a1b2c3d4
API Key: 8f7e6d5c4b3a2918f7e6d5c4b3a291...
API Endpoint: https://printmonitor.com/api
```

#### C. What Gets Installed:
- **Windows Service**: "PrintMonitor Service"
- **Event Listener**: Monitors Windows print spooler
- **API Client**: Sends data to central server
- **Auto-Start**: Service starts with Windows

---

## 🖨️ **Step 3: How Printer Mapping Works**

### Automatic Printer Detection:
The system **automatically discovers and maps printers** - no manual configuration needed!

#### When a User Prints:
1. **User prints document** from any application (Word, Excel, PDF, etc.)
2. **Windows Print Spooler** processes the job
3. **Print Listener** captures the event with:
   ```json
   {
     "systemName": "FINANCE-PC-01",
     "printerName": "HP LaserJet Pro M404n",
     "documentName": "Invoice_2024.pdf",
     "userName": "john.smith",
     "pages": 3,
     "timestamp": "2024-01-15T10:30:00Z",
     "department": "Finance" // Auto-detected from system name
   }
   ```

4. **Data sent to API** using client credentials
5. **Printer automatically added** to system if not exists
6. **Print job recorded** and appears in dashboard

### Printer Auto-Discovery Process:

#### First Print Job from New Printer:
```
User prints → System detects printer → Auto-creates printer record
```

**Example:**
- User at `MARKETING-LAPTOP-05` prints to `Canon PIXMA Pro-200`
- System automatically creates:
  ```
  Printer Name: Canon PIXMA Pro-200
  Location: Marketing Department (auto-detected)
  IP Address: 192.168.1.105 (detected from network)
  Department: Marketing (from system name pattern)
  Status: Online (since it just printed)
  ```

#### System Name Patterns for Auto-Detection:
```
FINANCE-PC-01 → Finance Department
MARKETING-LAPTOP-03 → Marketing Department
HR-WORKSTATION-02 → HR Department
IT-DESKTOP-07 → IT Department
SALES-LAPTOP-04 → Sales Department
```

---

## 🔄 **Step 4: Real-World Usage Flow**

### Day 1: Installation
1. **IT Admin** installs Print Listener on all computers
2. **Service starts** monitoring print jobs
3. **First print jobs** automatically create printer records

### Day 2+: Normal Operations
1. **Users print normally** - no change in behavior
2. **Print jobs captured** automatically
3. **Data appears** in client's dashboard
4. **Printers show up** as they're used

### Example Timeline:
```
9:00 AM - John prints invoice → HP-LaserJet-01 discovered
9:15 AM - Sarah prints report → Canon-PIXMA-02 discovered  
9:30 AM - Mike prints presentation → Brother-HL-03 discovered
10:00 AM - All 3 printers now visible in dashboard
```

---

## 🎯 **Step 5: Client Dashboard Access**

### How Clients Access Their Data:

#### Option A: Dedicated Subdomain
```
URL: https://techcorp.printmonitor.com
Login: admin@techcorp.com
Password: (set during onboarding)
```

#### Option B: Main Portal with Client Login
```
URL: https://printmonitor.com/login
Client ID: techcorp-a1b2c3d4
Username: admin@techcorp.com
Password: (client password)
```

### What Clients See:
- **Their printers only** (isolated data)
- **Their print jobs only** 
- **Their users only**
- **Department-specific reports**
- **Cost tracking for their organization**

---

## 🔧 **Step 6: Printer Configuration (Optional)**

### Manual Printer Setup (If Needed):
While printers are auto-discovered, admins can manually add printers:

1. **Go to Printers tab** in client dashboard
2. **Click "Add Printer"**
3. **Enter details:**
   ```
   Name: Reception-Printer-01
   Model: HP LaserJet Pro M404n
   Location: Reception Area
   IP Address: 192.168.1.101
   Department: Administration
   ```

### Printer Status Monitoring:
- **Online/Offline** status from network pings
- **Paper/Toner levels** (if printer supports SNMP)
- **Error states** (paper jams, etc.)
- **Usage statistics** (jobs per day, pages printed)

---

## 📊 **Step 7: Data Flow Architecture**

```
[User Computer] → [Print Listener] → [API] → [Central Database] → [Client Dashboard]
```

### Detailed Flow:
1. **User prints** document on their computer
2. **Print Listener** (Windows service) captures:
   - System name (computer name)
   - Printer name
   - Document name
   - Page count
   - Timestamp
   - User name (Windows user)

3. **API call** sent to central server:
   ```
   POST https://printmonitor.com/api/print-jobs
   Headers: 
     Authorization: Bearer [CLIENT_API_KEY]
     X-Client-ID: [CLIENT_ID]
   ```

4. **Server processes** and stores data with client isolation

5. **Client dashboard** shows real-time data

---

## 🛠️ **Troubleshooting Common Issues**

### Issue 1: Printer Not Showing Up
**Cause**: Print Listener not installed on computer
**Solution**: Install Print Listener on the computer connected to printer

### Issue 2: Print Jobs Not Captured
**Cause**: Windows service not running
**Solution**: 
```cmd
# Check service status
Get-Service -Name "PrintMonitorService"

# Restart service
Restart-Service -Name "PrintMonitorService"
```

### Issue 3: Wrong Department Detection
**Cause**: Computer name doesn't follow naming convention
**Solution**: 
- Rename computer to follow pattern (DEPT-TYPE-##)
- Or manually set department in printer settings

### Issue 4: API Connection Failed
**Cause**: Firewall blocking outbound HTTPS
**Solution**: Allow outbound connections to printmonitor.com on port 443

---

## 🎯 **Summary: Complete Setup Checklist**

### Admin Side (You):
- [ ] Onboard client through wizard
- [ ] Generate API credentials
- [ ] Download setup guide
- [ ] Send credentials to client IT team

### Client Side (Their IT Team):
- [ ] Download Print Listener installer
- [ ] Install on all computers that will print
- [ ] Configure with provided credentials
- [ ] Test with sample print job
- [ ] Verify data appears in dashboard

### End Users (Their Employees):
- [ ] Print normally - no changes needed!
- [ ] Print jobs automatically captured
- [ ] Data appears in real-time dashboard

---

## 🚀 **Next Steps**

1. **Complete client onboarding** in the admin panel
2. **Download the setup guide** from the wizard
3. **Send credentials** to client's IT team
4. **Guide them through** Print Listener installation
5. **Test with sample print jobs**
6. **Monitor dashboard** for incoming data

The beauty of this system is that **end users don't need to change anything** - they print normally, and the system captures everything automatically!