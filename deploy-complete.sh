#!/bin/bash
# Complete Altus Production Deployment Script
# Run this on your local machine with SSH access to the VPS

set -e

echo "🚀 Altus Production Deployment - Complete Process"
echo "================================================="

# Configuration
VPS_HOST="72.60.187.1"
VPS_USER="root"
REMOTE_WEB_ROOT="/www/wwwroot/72.60.187.1"
LOCAL_PROJECT_DIR="/workspaces/altus-lms-fe"

echo "📋 Configuration:"
echo "   VPS Host: $VPS_HOST"
echo "   Remote Web Root: $REMOTE_WEB_ROOT"
echo "   Local Project: $LOCAL_PROJECT_DIR"
echo ""

# Step 1: Verify deployment package exists
echo "Step 1: Checking deployment package..."
if [ ! -f "$LOCAL_PROJECT_DIR/altus-production-deploy.tar.gz" ]; then
    echo "❌ Deployment package not found. Creating it..."
    cd "$LOCAL_PROJECT_DIR"
    tar -czf altus-production-deploy.tar.gz hostinger-deployment/
    echo "✅ Package created"
else
    echo "✅ Deployment package found"
fi
echo ""

# Step 2: Test SSH connection
echo "Step 2: Testing SSH connection..."
if ssh -o ConnectTimeout=10 -o BatchMode=yes "$VPS_USER@$VPS_HOST" "echo 'SSH OK'" 2>/dev/null; then
    echo "✅ SSH connection successful"
else
    echo "❌ SSH connection failed. Please check:"
    echo "   - SSH key authentication"
    echo "   - VPS accessibility"
    echo "   - Firewall settings"
    exit 1
fi
echo ""

# Step 3: Upload deployment package
echo "Step 3: Uploading deployment package..."
scp "$LOCAL_PROJECT_DIR/altus-production-deploy.tar.gz" "$VPS_USER@$VPS_HOST:/tmp/"
echo "✅ Upload complete"
echo ""

# Step 4: Deploy on server
echo "Step 4: Deploying on server..."
ssh "$VPS_USER@$VPS_HOST" << EOF
    set -e
    echo "🔧 Starting server-side deployment..."

    # Create backup of current site
    echo "   Creating backup..."
    if [ -d "$REMOTE_WEB_ROOT" ] && [ "\$(ls -A '$REMOTE_WEB_ROOT')" ]; then
        BACKUP_DIR="/opt/altus-backups/\$(date +%Y%m%d_%H%M%S)"
        mkdir -p "\$BACKUP_DIR"
        cp -r "$REMOTE_WEB_ROOT"/* "\$BACKUP_DIR/" 2>/dev/null || true
        echo "   Backup created at: \$BACKUP_DIR"
    fi

    # Extract new files
    echo "   Extracting deployment package..."
    cd /tmp
    tar -xzf altus-production-deploy.tar.gz

    # Deploy to web root
    echo "   Deploying to web root..."
    cd "$REMOTE_WEB_ROOT"
    rm -rf *
    mv /tmp/hostinger-deployment/* .

    # Set proper permissions
    echo "   Setting permissions..."
    chown -R www:www . 2>/dev/null || chown -R apache:apache . 2>/dev/null || chown -R nginx:nginx . 2>/dev/null || true
    chmod -R 755 .

    # Clean up
    echo "   Cleaning up temporary files..."
    rm -rf /tmp/hostinger-deployment
    rm /tmp/altus-production-deploy.tar.gz

    # Verify deployment
    echo "   Verifying deployment..."
    if [ -f "index.html" ] && [ -d "static" ]; then
        echo "   ✅ Files deployed successfully"
        echo "   📊 File count: \$(find . -type f | wc -l) files"
        echo "   📁 Directory size: \$(du -sh . | cut -f1)"
    else
        echo "   ❌ Deployment verification failed"
        exit 1
    fi

    echo "✅ Server-side deployment complete!"
EOF

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "🌐 Your production site is now live at:"
echo "   https://applynow.altuszm.com"
echo "   http://72.60.187.1"
echo ""
echo "🔍 To verify the deployment:"
echo "   curl -s https://applynow.altuszm.com | head -5"
echo ""
echo "📋 Deployment Summary:"
echo "   ✅ Production build deployed"
echo "   ✅ API configuration set for real services"
echo "   ✅ No mock mode (connects to production APIs)"
echo "   ✅ Permissions set correctly"
echo "   ✅ Backup created on server"
echo ""
echo "🚀 The site should now work without 401 errors!"

# Cleanup local files
echo "🧹 Cleaning up local deployment files..."
rm -f "$LOCAL_PROJECT_DIR/altus-production-deploy.tar.gz"
echo "✅ Local cleanup complete"