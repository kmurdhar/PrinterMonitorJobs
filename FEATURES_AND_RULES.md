# PrintMonitor - Features and Rules Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Core Features](#core-features)
3. [Architecture](#architecture)
4. [Business Rules](#business-rules)
5. [Technical Rules](#technical-rules)
6. [User Roles & Permissions](#user-roles--permissions)
7. [Data Management Rules](#data-management-rules)
8. [Security Rules](#security-rules)
9. [Integration Rules](#integration-rules)
10. [Deployment Rules](#deployment-rules)

---

## System Overview

**PrintMonitor** is an enterprise-grade printer monitoring and management system designed for multi-client environments. It provides real-time tracking of print jobs, printer status monitoring, cost analysis, and comprehensive reporting across multiple organizations.

### Key Components
- **Frontend Dashboard**: React-based web interface (Port 5173)
- **Backend API**: Node.js/Express server (Port 3000)
- **Windows Print Listener**: PowerShell-based client software
- **WebSocket Server**: Real-time communication
- **Multi-Client Architecture**: Isolated client environments

---

## Core Features

### 1. **Multi-Client Management**
- **Client Onboarding**: 5-step wizard for new client setup
- **Client Isolation**: Complete data separation between clients
- **Client Dashboard**: Individual dashboards per client
- **Overall View**: Admin view across all clients

#### Client Onboarding Process:
1. Company Information Collection
2. Platform & Requirements Selection
3. Technical Configuration Generation
4. Installation Package Creation
5. Setup Completion & Verification

### 2. **Print Job Monitoring**
- **Real-time Capture**: Automatic print job detection
- **System Integration**: Windows Print Spooler monitoring
- **Job Details**: File name, pages, cost, timestamp, system name
- **Status Tracking**: Success, failed, pending states
- **Department Detection**: Auto-detection from system names

### 3. **Printer Management**
- **Auto-Discovery**: Automatic printer detection on first use
- **Manual Addition**: Pre-configuration of printers
- **Status Monitoring**: Online, offline, error, warning states
- **Supply Tracking**: Paper and toner level monitoring
- **Location Management**: Physical location and department assignment

### 4. **User Management**
- **System-Based Tracking**: Uses computer names as identifiers
- **Manual User Addition**: Single user or CSV bulk import
- **Department Assignment**: Automatic and manual department mapping
- **Activity Tracking**: Print job history per user/system

### 5. **Analytics & Reporting**
- **Real-time Dashboard**: Live statistics and charts
- **Cost Analysis**: Per-page pricing with volume discounts
- **Department Reports**: Usage by department
- **Trend Analysis**: Historical data visualization
- **Export Capabilities**: CSV export functionality

### 6. **Pricing Management**
- **Flexible Pricing**: Black & white vs color pricing
- **Paper Size Multipliers**: Different rates for paper sizes
- **Department Multipliers**: Department-specific pricing
- **Volume Discounts**: Tiered pricing based on volume
- **Client-Specific Configs**: Individual pricing per client

### 7. **Real-time Communication**
- **WebSocket Integration**: Live updates without refresh
- **Notification System**: Real-time alerts and notifications
- **Status Broadcasting**: Printer and job status updates
- **Connection Management**: Automatic reconnection handling

---

## Architecture

### Frontend Architecture
```
React Application (Port 5173)
├── Components/
│   ├── Dashboard/
│   ├── Jobs/
│   ├── Printers/
│   ├── Users/
│   ├── Onboarding/
│   ├── Pricing/
│   └── Profile/
├── Services/
│   ├── API Service
│   └── WebSocket Hook
└── Data Management/
    ├── Local Storage
    └── State Management
```

### Backend Architecture
```
Node.js Server (Port 3000)
├── REST API Endpoints
├── WebSocket Server
├── Print Job Processing
├── Client Management
├── Real-time Broadcasting
└── Static File Serving
```

### Client Software
```
Windows Print Listener
├── PowerShell Scripts
├── Scheduled Task Service
├── Print Spooler Monitoring
├── API Communication
└── Logging System
```

---

## Business Rules

### 1. **Client Management Rules**
- Each client must have a unique Client ID
- Client data is completely isolated from other clients
- Clients can only access their own data and dashboards
- Admin users can view overall statistics across all clients
- Client onboarding requires all mandatory fields completion

### 2. **Print Job Rules**
- Print jobs are automatically captured from Windows systems
- Each print job must have: file name, system name, printer, page count
- Print jobs are assigned to clients based on the system's client configuration
- Failed print jobs are tracked but don't incur costs
- Print job timestamps use server time for consistency

### 3. **Printer Rules**
- Printers are auto-discovered on first print job
- Each printer belongs to exactly one client
- Printer status is updated based on recent activity
- Manual printer addition requires admin privileges
- Printer supplies are estimated based on usage patterns

### 4. **User/System Rules**
- Users are identified by their system/computer names
- Department assignment is auto-detected from system naming conventions
- Manual user addition is allowed for pre-configuration
- User activity is tracked per client environment
- System names must be unique within a client

### 5. **Pricing Rules**
- Default pricing: $0.05 per B&W page, $0.15 per color page
- Paper size multipliers apply to base pricing
- Department multipliers can adjust pricing per department
- Volume discounts apply based on total pages printed
- Pricing configurations are client-specific

---

## Technical Rules

### 1. **Data Storage Rules**
- Frontend uses localStorage for client-side persistence
- Backend uses in-memory storage (production should use database)
- Print jobs are stored with full metadata
- Client configurations are persisted across sessions
- Logs are maintained for troubleshooting

### 2. **API Communication Rules**
- All API endpoints use JSON format
- Authentication via Client ID and API Key
- RESTful design principles followed
- Error responses include descriptive messages
- Timeout handling for all external requests

### 3. **WebSocket Rules**
- Real-time updates for print jobs and printer status
- Automatic reconnection with exponential backoff
- Connection health monitoring with ping/pong
- Broadcast messages to all connected clients
- Graceful handling of connection failures

### 4. **File Organization Rules**
- Components must be under 300 lines
- Modular architecture with clear separation of concerns
- Proper import/export structure
- No global variables for state sharing
- Clean file naming conventions

---

## User Roles & Permissions

### 1. **Admin Role**
- **Permissions**: Full system access
- **Capabilities**:
  - View overall statistics across all clients
  - Onboard new clients
  - Manage pricing configurations
  - Access all client dashboards
  - System configuration and settings

### 2. **Client Manager Role**
- **Permissions**: Client-specific access
- **Capabilities**:
  - View client-specific dashboard
  - Manage client printers and users
  - Configure client pricing
  - Export client reports
  - Monitor client print jobs

### 3. **User Role**
- **Permissions**: Limited read access
- **Capabilities**:
  - View personal print history
  - Basic dashboard access
  - Limited reporting features

---

## Data Management Rules

### 1. **Data Retention**
- Print jobs: Retained indefinitely (configurable)
- Printer status: Real-time with historical trends
- User activity: Tracked per session and historically
- Client configurations: Persistent storage
- Logs: Configurable retention period

### 2. **Data Backup**
- Client configurations backed up on changes
- Print job data exported regularly
- System configurations versioned
- Recovery procedures documented

### 3. **Data Privacy**
- Client data completely isolated
- No cross-client data sharing
- Secure API key management
- Audit trails for data access

---

## Security Rules

### 1. **Authentication**
- Client ID and API Key required for all API calls
- Unique credentials per client
- Secure key generation and storage
- Regular key rotation recommended

### 2. **Authorization**
- Role-based access control
- Client-specific data access
- Admin-only functions protected
- API endpoint security

### 3. **Data Security**
- HTTPS recommended for production
- Secure WebSocket connections
- Input validation on all endpoints
- XSS and injection protection

### 4. **Network Security**
- Firewall configuration guidelines
- Network access requirements documented
- Secure communication protocols
- VPN support for remote access

---

## Integration Rules

### 1. **Windows Integration**
- PowerShell execution policy requirements
- Administrator privileges for installation
- Windows Print Spooler integration
- Scheduled task management
- Registry access for configuration

### 2. **Network Integration**
- HTTP/HTTPS communication
- WebSocket support required
- DNS resolution for server access
- Port accessibility (3000, 5173)
- Proxy configuration support

### 3. **Third-party Integration**
- Export capabilities for external systems
- Webhook support for notifications
- API documentation for integrations
- Standard data formats (JSON, CSV)

---

## Deployment Rules

### 1. **Server Deployment**
- Node.js 18+ required
- Port 3000 for API server
- Port 5173 for development frontend
- Environment variable configuration
- Process management with PM2

### 2. **Client Deployment**
- Windows 10/11 support
- PowerShell 5.1+ required
- Administrator installation required
- Network connectivity to server
- Scheduled task creation

### 3. **Production Requirements**
- Database integration recommended
- Load balancing for high availability
- SSL/TLS certificates
- Monitoring and alerting
- Backup and recovery procedures

### 4. **Development Environment**
- Concurrent frontend and backend development
- Hot reload for development
- Environment-specific configurations
- Testing frameworks integration
- Code quality tools

---

## Configuration Management

### 1. **Environment Configuration**
- Development, staging, production environments
- Environment-specific variables
- Configuration file management
- Secrets management
- Feature flags support

### 2. **Client Configuration**
- Client-specific settings
- Printer configuration templates
- User role definitions
- Pricing model configurations
- Integration settings

### 3. **System Configuration**
- Server performance tuning
- Database connection settings
- Logging configuration
- Security settings
- Monitoring configuration

---

## Monitoring & Maintenance

### 1. **System Monitoring**
- Server health checks
- WebSocket connection monitoring
- API response time tracking
- Error rate monitoring
- Resource utilization tracking

### 2. **Application Monitoring**
- Print job processing rates
- Client activity monitoring
- User session tracking
- Feature usage analytics
- Performance metrics

### 3. **Maintenance Procedures**
- Regular system updates
- Database maintenance
- Log rotation and cleanup
- Security patch management
- Performance optimization

---

## Compliance & Standards

### 1. **Data Protection**
- GDPR compliance considerations
- Data retention policies
- User consent management
- Data portability support
- Privacy by design principles

### 2. **Industry Standards**
- RESTful API design
- WebSocket protocol compliance
- JSON data format standards
- HTTP status code usage
- Security best practices

### 3. **Code Quality**
- TypeScript for type safety
- ESLint for code quality
- Component testing
- API testing
- Documentation standards

---

This document serves as the comprehensive guide for understanding PrintMonitor's features, rules, and operational guidelines. It should be referenced for development, deployment, and maintenance activities.