#!/bin/bash
# Altus Production Deployment Script
# Run this on your local machine to deploy to VPS

set -e

echo "🚀 Altus Production Deployment"
echo "=============================="

# Configuration
VPS_HOST="72.60.187.1"
VPS_USER="root"
REMOTE_DIR="/www/wwwroot/72.60.187.1"

echo "📦 Creating deployment package..."
cd /workspaces/altus-lms-fe
tar -czf altus-production-deploy.tar.gz hostinger-deployment/

echo "📤 Uploading to VPS..."
scp altus-production-deploy.tar.gz ${VPS_USER}@${VPS_HOST}:/tmp/

echo "🔧 Deploying on server..."
ssh ${VPS_USER}@${VPS_HOST} << 'EOF'
    set -e
    echo "Extracting files..."
    cd /tmp
    tar -xzf altus-production-deploy.tar.gz

    echo "Deploying to web root..."
    cd /www/wwwroot/72.60.187.1
    rm -rf *
    mv /tmp/hostinger-deployment/* .

    echo "Setting permissions..."
    chown -R www:www .
    chmod -R 755 .

    echo "Cleaning up..."
    rm -rf /tmp/hostinger-deployment
    rm /tmp/altus-production-deploy.tar.gz

    echo "✅ Deployment complete!"
EOF

echo "🎉 Production site deployed successfully!"
echo "🌐 Visit: https://applynow.altuszm.com"
echo "🔗 Or: http://72.60.187.1"

# Cleanup
rm altus-production-deploy.tar.gz