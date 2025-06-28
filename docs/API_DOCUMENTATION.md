# Printer Monitoring System - API Documentation

## Base URL
```
https://your-domain.com/api
```

## Authentication
All API requests require authentication using Bearer tokens:
```
Authorization: Bearer YOUR_API_TOKEN
```

## Client Identification
Include client ID in requests:
```
X-Client-ID: client-uuid
```

## Endpoints

### 1. Print Jobs

#### POST /print-jobs
Create a new print job record
```json
{
  "fileName": "document.pdf",
  "user": "john.doe",
  "department": "Finance",
  "printer": "HP-LaserJet-01",
  "pages": 5,
  "status": "success",
  "fileSize": "2.3 MB",
  "paperSize": "A4",
  "colorMode": "blackwhite"
}
```

#### GET /print-jobs
Retrieve print jobs with filtering
```
GET /print-jobs?status=success&date=2024-01-15&user=john.doe
```

### 2. Printers

#### GET /printers
Get all printers for client
```json
[
  {
    "id": "printer-uuid",
    "name": "HP-LaserJet-01",
    "status": "online",
    "paperLevel": 85,
    "tonerLevel": 45,
    "location": "Finance Department"
  }
]
```

#### PUT /printers/:id/status
Update printer status
```json
{
  "status": "online",
  "paperLevel": 75,
  "tonerLevel": 40,
  "lastActivity": "2024-01-15T10:30:00Z"
}
```

### 3. Dashboard

#### GET /dashboard/stats
Get dashboard statistics
```json
{
  "totalJobs": 1247,
  "totalPages": 18456,
  "activePrinters": 3,
  "totalCost": 2847.65,
  "jobsToday": 49,
  "failureRate": 3.2
}
```

## Error Handling
```json
{
  "error": "Invalid request",
  "message": "Missing required field: fileName",
  "code": 400
}
```

## Rate Limiting
- 1000 requests per hour per client
- 100 requests per minute per IP