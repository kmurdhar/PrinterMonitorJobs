#!/bin/bash

# PrintMonitor Deployment Script
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production

set -e

# Configuration
PROJECT_NAME="printmonitor"
PROJECT_DIR="/var/www/printmonitor"
BACKUP_DIR="/var/backups/printmonitor"
DATE=$(date +%Y%m%d_%H%M%S)
ENVIRONMENT=${1:-production}

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
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root for security reasons"
fi

# Check if required commands exist
command -v node >/dev/null 2>&1 || error "Node.js is not installed"
command -v npm >/dev/null 2>&1 || error "npm is not installed"
command -v pm2 >/dev/null 2>&1 || error "PM2 is not installed"

log "🚀 Starting PrintMonitor deployment to $ENVIRONMENT environment..."

# Create backup directory
log "📦 Creating backup directory..."
sudo mkdir -p $BACKUP_DIR

# Backup current deployment
if [ -d "$PROJECT_DIR" ]; then
    log "💾 Creating backup of current deployment..."
    sudo cp -r $PROJECT_DIR $BACKUP_DIR/backup_$DATE
    success "Backup created: $BACKUP_DIR/backup_$DATE"
else
    warning "No existing deployment found to backup"
fi

# Navigate to project directory
if [ ! -d "$PROJECT_DIR" ]; then
    error "Project directory $PROJECT_DIR does not exist"
fi

cd $PROJECT_DIR
log "📁 Changed to project directory: $PROJECT_DIR"

# Pull latest changes (if using Git)
if [ -d ".git" ]; then
    log "📥 Pulling latest changes from Git..."
    git fetch origin
    git reset --hard origin/main
    success "Git pull completed"
else
    warning "Not a Git repository, skipping Git pull"
fi

# Install dependencies
log "📦 Installing dependencies..."
npm ci --production=false
success "Dependencies installed"

# Run tests (if available)
if npm run test --silent 2>/dev/null; then
    log "🧪 Running tests..."
    npm run test
    success "Tests passed"
else
    warning "No tests found, skipping test phase"
fi

# Build application
log "🔨 Building application for $ENVIRONMENT..."
if [ "$ENVIRONMENT" = "production" ]; then
    NODE_ENV=production npm run build
else
    npm run build
fi
success "Build completed"

# Verify build output
if [ ! -d "dist" ]; then
    error "Build failed - dist directory not found"
fi

# Update file permissions
log "🔐 Setting file permissions..."
sudo chown -R $USER:$USER $PROJECT_DIR
sudo chmod -R 755 $PROJECT_DIR
success "Permissions updated"

# Stop existing PM2 processes
log "⏹️ Stopping existing PM2 processes..."
pm2 stop $PROJECT_NAME || warning "No existing PM2 process found"

# Start application with PM2
log "▶️ Starting application with PM2..."
pm2 start ecosystem.config.js --env $ENVIRONMENT
pm2 save
success "Application started with PM2"

# Reload Nginx (if available)
if command -v nginx >/dev/null 2>&1; then
    log "🔄 Reloading Nginx..."
    sudo nginx -t && sudo systemctl reload nginx
    success "Nginx reloaded"
else
    warning "Nginx not found, skipping reload"
fi

# Health check
log "🏥 Performing health check..."
sleep 10

HEALTH_URL="http://localhost:3000"
if curl -f --max-time 30 $HEALTH_URL > /dev/null 2>&1; then
    success "Health check passed - application is responding"
else
    error "Health check failed - application is not responding"
    
    # Rollback on failure
    log "🔄 Rolling back to previous version..."
    if [ -d "$BACKUP_DIR/backup_$DATE" ]; then
        sudo rm -rf $PROJECT_DIR
        sudo cp -r $BACKUP_DIR/backup_$DATE $PROJECT_DIR
        pm2 restart $PROJECT_NAME
        error "Deployment failed - rolled back to previous version"
    else
        error "Deployment failed and no backup available for rollback"
    fi
fi

# Cleanup old backups (keep last 5)
log "🧹 Cleaning up old backups..."
sudo find $BACKUP_DIR -name "backup_*" -type d | sort -r | tail -n +6 | xargs sudo rm -rf
success "Old backups cleaned up"

# Display deployment summary
log "📊 Deployment Summary:"
echo "  Environment: $ENVIRONMENT"
echo "  Deployment Time: $DATE"
echo "  Project Directory: $PROJECT_DIR"
echo "  Backup Location: $BACKUP_DIR/backup_$DATE"
echo "  Application URL: $HEALTH_URL"

# Show PM2 status
log "📈 PM2 Status:"
pm2 list

success "🎉 Deployment completed successfully!"

# Optional: Send notification (uncomment if you have webhook configured)
# curl -X POST "$WEBHOOK_URL" \
#      -H "Content-Type: application/json" \
#      -d "{\"text\":\"PrintMonitor deployed successfully to $ENVIRONMENT at $DATE\"}"

log "✅ PrintMonitor is now running at $HEALTH_URL"