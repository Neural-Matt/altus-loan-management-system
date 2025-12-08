#!/bin/bash
# Altus Production Deployment Script
# Run this on your local machine with SSH access to VPS

echo "🚀 Altus Production Deployment"
echo "=============================="

set -e

# Upload deployment package
echo "Step 1: Uploading deployment package..."
scp /workspaces/altus-lms-fe/altus-production-deploy.tar.gz root@72.60.187.1:/tmp/

# SSH and deploy
echo "Step 2: Deploying on server..."
ssh root@72.60.187.1 << 'EOF'
    echo "🔧 Deploying production build..."
    cd /www/wwwroot/72.60.187.1
    rm -rf *
    cd /tmp
    tar -xzf altus-production-deploy.tar.gz
    cd /www/wwwroot/72.60.187.1
    mv /tmp/hostinger-deployment/* .
    chown -R www:www .
    chmod -R 755 .
    rm -rf /tmp/hostinger-deployment
    rm /tmp/altus-production-deploy.tar.gz
    echo "✅ Deployment complete!"
EOF

echo "🎉 Production site deployed!"
echo "🌐 Test: http://72.60.187.1"
echo "🔗 Domain: https://applynow.altuszm.com"