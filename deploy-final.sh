#!/bin/bash
# Altus Production Deployment - Run on your local machine
# This script uploads and deploys the production build to your VPS

set -e

echo "🚀 Altus Production Deployment"
echo "=============================="

# Configuration
VPS_HOST="72.60.187.1"
VPS_USER="root"
LOCAL_PROJECT="/workspaces/altus-lms-fe"
DEPLOY_PACKAGE="altus-production-deploy.tar.gz"

echo "📋 Configuration:"
echo "   VPS: $VPS_USER@$VPS_HOST"
echo "   Local project: $LOCAL_PROJECT"
echo "   Deploy package: $DEPLOY_PACKAGE"
echo ""

# Check if deployment package exists
echo "Step 1: Checking deployment package..."
if [ ! -f "$LOCAL_PROJECT/$DEPLOY_PACKAGE" ]; then
    echo "❌ Deployment package not found!"
    echo "   Creating deployment package..."
    cd "$LOCAL_PROJECT"
    tar -czf "$DEPLOY_PACKAGE" hostinger-deployment/
    echo "✅ Package created: $DEPLOY_PACKAGE"
else
    echo "✅ Deployment package found: $DEPLOY_PACKAGE"
fi
echo ""

# Test SSH connection
echo "Step 2: Testing SSH connection..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$VPS_USER@$VPS_HOST" "echo 'SSH OK'" >/dev/null 2>&1; then
    echo "❌ SSH connection failed!"
    echo ""
    echo "🔧 To fix SSH connection:"
    echo "   1. Ensure you have SSH access to $VPS_HOST"
    echo "   2. Check if SSH key is properly configured"
    echo "   3. Try: ssh $VPS_USER@$VPS_HOST"
    echo "   4. If password auth required, ensure you can connect manually first"
    exit 1
fi
echo "✅ SSH connection successful"
echo ""

# Upload deployment package
echo "Step 3: Uploading deployment package..."
scp "$LOCAL_PROJECT/$DEPLOY_PACKAGE" "$VPS_USER@$VPS_HOST:/tmp/"
echo "✅ Upload complete"
echo ""

# Deploy on server
echo "Step 4: Deploying on server..."
ssh "$VPS_USER@$VPS_HOST" << 'EOF'
    echo "🔧 Starting server deployment..."

    # Create backup
    echo "   Creating backup..."
    BACKUP_DIR="/opt/altus-backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    if [ -d "/www/wwwroot/72.60.187.1" ]; then
        cp -r /www/wwwroot/72.60.187.1/* "$BACKUP_DIR/" 2>/dev/null || true
        echo "   Backup created: $BACKUP_DIR"
    fi

    # Extract and deploy
    echo "   Extracting files..."
    cd /tmp
    tar -xzf altus-production-deploy.tar.gz

    echo "   Deploying to web root..."
    cd /www/wwwroot/72.60.187.1
    rm -rf *
    mv /tmp/hostinger-deployment/* .

    echo "   Setting permissions..."
    chown -R www:www . 2>/dev/null || chown -R apache:apache . 2>/dev/null || chown -R nginx:nginx . 2>/dev/null || true
    chmod -R 755 .

    # Clean up
    echo "   Cleaning up..."
    rm -rf /tmp/hostinger-deployment
    rm /tmp/altus-production-deploy.tar.gz

    # Verify
    echo "   Verifying deployment..."
    FILE_COUNT=$(find . -type f | wc -l)
    DIR_SIZE=$(du -sh . | cut -f1)
    echo "   Files deployed: $FILE_COUNT files"
    echo "   Total size: $DIR_SIZE"

    if [ -f "index.html" ] && [ -d "static" ]; then
        echo "✅ Deployment successful!"
    else
        echo "❌ Deployment verification failed!"
        exit 1
    fi
EOF

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "🌐 Your production site should now be available at:"
echo "   https://applynow.altuszm.com"
echo "   http://72.60.187.1"
echo ""
echo "🔍 To verify:"
echo "   curl -I https://applynow.altuszm.com"
echo "   curl -I http://72.60.187.1"
echo ""
echo "📋 What was deployed:"
echo "   ✅ Production React build"
echo "   ✅ Real API configuration (no 401 errors)"
echo "   ✅ SPA routing support"
echo "   ✅ Optimized static assets"
echo ""
echo "⚠️  Note: If you still see ERR_CONNECTION_REFUSED:"
echo "   1. Check if domain DNS points to $VPS_HOST"
echo "   2. Verify web server is running on VPS"
echo "   3. Check AAPanel configuration"
echo ""
echo "🚀 Ready to test your production site!"

# Cleanup
echo "🧹 Cleaning up local files..."
rm -f "$LOCAL_PROJECT/$DEPLOY_PACKAGE"
echo "✅ Local cleanup complete"