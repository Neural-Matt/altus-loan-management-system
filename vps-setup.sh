#!/bin/bash
# Altus Loan Management - VPS Setup and Deployment
# Run this script on your VPS

set -e

echo "=================================="
echo "  Altus VPS Setup & Deployment"
echo "=================================="
echo ""

# Step 1: Install Docker
echo "Step 1: Installing Docker..."
if ! command -v docker &> /dev/null; then
    echo "  [INFO] Installing Docker..."
    apt-get update -qq
    apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    apt-get update -qq
    apt-get install -y docker-ce docker-ce-cli containerd.io
    systemctl start docker
    systemctl enable docker
    echo "  [OK] Docker installed"
else
    echo "  [OK] Docker already installed"
fi

# Step 2: Install Docker Compose
echo ""
echo "Step 2: Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo "  [INFO] Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "  [OK] Docker Compose installed"
else
    echo "  [OK] Docker Compose already installed"
fi

# Step 3: Create directories
echo ""
echo "Step 3: Creating directories..."
mkdir -p /opt/altus-app/current
mkdir -p /opt/altus-backups
mkdir -p /opt/altus-app/logs
echo "  [OK] Directories created"

# Step 4: Extract deployment
echo ""
echo "Step 4: Extracting deployment..."
cd /opt/altus-app
PACKAGE=$(ls *.tar.gz 2>/dev/null | head -n 1)
if [ -n "$PACKAGE" ]; then
    echo "  [INFO] Found deployment package: $PACKAGE"
    tar -xzf "$PACKAGE" -C current/
    echo "  [OK] Package extracted"
else
    echo "  [ERROR] No deployment package found"
    echo "  Please upload the package first"
    exit 1
fi

# Step 5: Stop old containers
echo ""
echo "Step 5: Stopping old containers..."
cd /opt/altus-app/current
docker-compose down 2>/dev/null || true
docker stop altus-loan-container 2>/dev/null || true
docker rm altus-loan-container 2>/dev/null || true
echo "  [OK] Old containers stopped"

# Step 6: Build and start
echo ""
echo "Step 6: Building and starting containers..."
echo "  [INFO] Building Docker image..."
docker build -t altus-loan-app:latest .
echo "  [INFO] Starting containers..."
docker-compose up -d
echo "  [INFO] Waiting for container to start..."
sleep 10

# Step 7: Verify
echo ""
echo "Step 7: Verifying deployment..."
if docker ps | grep -q altus-loan-container; then
    echo "  [OK] Container is running!"
    docker ps | grep altus
else
    echo "  [ERROR] Container failed to start"
    docker logs altus-loan-container 2>&1 | tail -20
    exit 1
fi

# Step 8: Cleanup
echo ""
echo "Step 8: Cleaning up..."
rm -f /opt/altus-app/*.tar.gz
docker image prune -f
echo "  [OK] Cleanup complete"

# Summary
echo ""
echo "=================================="
echo "  Deployment Successful!"
echo "=================================="
echo ""
echo "Your application is now running!"
echo ""
echo "Access it at: http://$(hostname -I | awk '{print $1}')"
echo ""
echo "Useful commands:"
echo "  View logs:    docker logs altus-loan-container"
echo "  Restart:      docker-compose restart"
echo "  Stop:         docker-compose down"
echo ""
