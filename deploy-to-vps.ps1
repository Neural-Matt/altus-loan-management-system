# Deploy to VPS (Windows PowerShell)
##############################################
# Altus Loan Management - VPS Deployment
# Target: Hostinger VPS (Ubuntu 24.04 LTS)
# Server: 72.60.187.1
##############################################

$ErrorActionPreference = "Stop"

# Configuration
$VPS_HOST = "72.60.187.1"
$VPS_USER = "root"
$DEPLOY_DIR = "/opt/altus-app"
$BACKUP_DIR = "/opt/altus-backups"
$CONTAINER_NAME = "altus-loan-container"
$DOCKER_IMAGE_NAME = "altus-loan-app"

Write-Host "`n========================================" -ForegroundColor Blue
Write-Host "  Altus Loan Management System" -ForegroundColor Blue
Write-Host "  VPS Deployment Script (PowerShell)" -ForegroundColor Blue
Write-Host "========================================`n" -ForegroundColor Blue

# Step 1: Test SSH connectivity
Write-Host "Step 1: Testing SSH connectivity..." -ForegroundColor Yellow
try {
    ssh -o BatchMode=yes -o ConnectTimeout=5 ${VPS_USER}@${VPS_HOST} exit
    Write-Host "[✓] SSH connection successful" -ForegroundColor Green
} catch {
    Write-Host "[✗] Cannot connect to VPS. Please check:" -ForegroundColor Red
    Write-Host "  - VPS IP: $VPS_HOST"
    Write-Host "  - SSH access and keys"
    Write-Host "  - Firewall settings"
    exit 1
}

# Step 2: Prepare VPS environment
Write-Host "`nStep 2: Preparing VPS environment..." -ForegroundColor Yellow
$setupScript = @'
# Update system
echo "Updating system packages..."
apt-get update -qq

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    apt-get update -qq
    apt-get install -y docker-ce docker-ce-cli containerd.io
    systemctl start docker
    systemctl enable docker
    echo "✓ Docker installed successfully"
else
    echo "✓ Docker already installed"
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "✓ Docker Compose installed successfully"
else
    echo "✓ Docker Compose already installed"
fi

# Create necessary directories
mkdir -p /opt/altus-app
mkdir -p /opt/altus-backups
mkdir -p /opt/altus-app/logs

echo "✓ VPS environment ready"
'@

ssh ${VPS_USER}@${VPS_HOST} $setupScript
Write-Host "[✓] VPS environment prepared" -ForegroundColor Green

# Step 3: Build application locally
Write-Host "`nStep 3: Building application locally..." -ForegroundColor Yellow
if (!(Test-Path "build")) {
    Write-Host "[i] Building React application..." -ForegroundColor Cyan
    npm run build
    Write-Host "[✓] Application built successfully" -ForegroundColor Green
} else {
    Write-Host "[!] Build directory exists. Using existing build." -ForegroundColor Yellow
}

# Step 4: Create deployment package
Write-Host "`nStep 4: Creating deployment package..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$deployPackage = "altus-deploy-$timestamp.tar.gz"

Write-Host "[i] Creating package: $deployPackage" -ForegroundColor Cyan

# Use tar command (available in Windows 10+)
tar -czf $deployPackage `
    --exclude='node_modules' `
    --exclude='.git' `
    --exclude='*.tar.gz' `
    --exclude='src' `
    build `
    Dockerfile `
    docker-compose.yml `
    nginx.conf `
    package.json `
    package-lock.json `
    public

Write-Host "[✓] Deployment package created: $deployPackage" -ForegroundColor Green

# Step 5: Upload to VPS
Write-Host "`nStep 5: Uploading to VPS..." -ForegroundColor Yellow
Write-Host "[i] Uploading $deployPackage to $VPS_HOST..." -ForegroundColor Cyan
scp $deployPackage ${VPS_USER}@${VPS_HOST}:${DEPLOY_DIR}/
Write-Host "[✓] Upload complete" -ForegroundColor Green

# Step 6: Backup existing deployment
Write-Host "`nStep 6: Backing up existing deployment..." -ForegroundColor Yellow
$backupScript = @"
if [ -d "$DEPLOY_DIR/current" ]; then
    BACKUP_NAME="backup_`$(date +%Y%m%d_%H%M%S)"
    mv $DEPLOY_DIR/current $BACKUP_DIR/`$BACKUP_NAME
    echo "✓ Backup created: `$BACKUP_NAME"
else
    echo "✓ No existing deployment to backup"
fi
"@

ssh ${VPS_USER}@${VPS_HOST} $backupScript
Write-Host "[✓] Backup complete" -ForegroundColor Green

# Step 7: Extract deployment
Write-Host "`nStep 7: Extracting deployment package..." -ForegroundColor Yellow
$extractScript = @"
cd $DEPLOY_DIR
mkdir -p current
tar -xzf $deployPackage -C current/
cd current
echo "✓ Package extracted"
"@

ssh ${VPS_USER}@${VPS_HOST} $extractScript
Write-Host "[✓] Deployment extracted" -ForegroundColor Green

# Step 8: Stop existing containers
Write-Host "`nStep 8: Stopping existing containers..." -ForegroundColor Yellow
$stopScript = @"
cd $DEPLOY_DIR/current
if docker ps -a | grep -q $CONTAINER_NAME; then
    echo "Stopping existing container..."
    docker-compose down || docker stop $CONTAINER_NAME || true
    docker rm $CONTAINER_NAME || true
    echo "✓ Existing containers stopped"
else
    echo "✓ No existing containers to stop"
fi
"@

ssh ${VPS_USER}@${VPS_HOST} $stopScript
Write-Host "[✓] Containers stopped" -ForegroundColor Green

# Step 9: Build and start Docker containers
Write-Host "`nStep 9: Building and starting Docker containers..." -ForegroundColor Yellow
$startScript = @"
cd $DEPLOY_DIR/current

# Build the Docker image
echo "Building Docker image..."
docker build -t ${DOCKER_IMAGE_NAME}:latest .

# Start the container
echo "Starting container..."
docker-compose up -d

# Wait for container to be ready
echo "Waiting for container to be ready..."
sleep 10

# Check container status
if docker ps | grep -q $CONTAINER_NAME; then
    echo "✓ Container started successfully"
else
    echo "✗ Container failed to start"
    docker logs $CONTAINER_NAME
    exit 1
fi
"@

ssh ${VPS_USER}@${VPS_HOST} $startScript
Write-Host "[✓] Docker containers started" -ForegroundColor Green

# Step 10: Verify deployment
Write-Host "`nStep 10: Verifying deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $response = Invoke-WebRequest -Uri "http://$VPS_HOST/" -Method Get -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "[✓] Application is responding (HTTP $($response.StatusCode))" -ForegroundColor Green
    }
} catch {
    Write-Host "[!] Application may not be ready yet" -ForegroundColor Yellow
}

# Step 11: Cleanup
Write-Host "`nStep 11: Cleaning up..." -ForegroundColor Yellow
$cleanupScript = @"
# Remove deployment package
rm -f $DEPLOY_DIR/$deployPackage

# Clean up old Docker images
echo "Removing old Docker images..."
docker image prune -f

# Keep only last 5 backups
cd $BACKUP_DIR
ls -t | tail -n +6 | xargs -r rm -rf

echo "✓ Cleanup complete"
"@

ssh ${VPS_USER}@${VPS_HOST} $cleanupScript
Write-Host "[✓] Cleanup complete" -ForegroundColor Green

# Remove local deployment package
Remove-Item $deployPackage -Force

# Final summary
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Deployment Successful! 🚀" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Application URL:  " -NoNewline
Write-Host "http://$VPS_HOST" -ForegroundColor Cyan

Write-Host "Test Workflow:    " -NoNewline
Write-Host "http://$VPS_HOST/loan-workflow-test.html" -ForegroundColor Cyan

Write-Host "`nUseful Commands:" -ForegroundColor Yellow
Write-Host "  View logs:      ssh ${VPS_USER}@${VPS_HOST} 'docker logs $CONTAINER_NAME'"
Write-Host "  Restart:        ssh ${VPS_USER}@${VPS_HOST} 'cd $DEPLOY_DIR/current && docker-compose restart'"
Write-Host "  Stop:           ssh ${VPS_USER}@${VPS_HOST} 'cd $DEPLOY_DIR/current && docker-compose down'"
Write-Host "  Shell access:   ssh ${VPS_USER}@${VPS_HOST} 'docker exec -it $CONTAINER_NAME sh'"

Write-Host "`n[✓] Deployment completed successfully!" -ForegroundColor Green
