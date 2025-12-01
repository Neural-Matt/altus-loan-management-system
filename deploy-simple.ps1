# Simplified VPS Deployment Script for Windows PowerShell
# Altus Loan Management System

$ErrorActionPreference = "Stop"

# Configuration
$VPS_HOST = "72.60.187.1"
$VPS_USER = "root"
$DEPLOY_DIR = "/opt/altus-app"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Altus Loan Management - VPS Deployment" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Test SSH
Write-Host "Step 1: Testing SSH connection..." -ForegroundColor Yellow
Write-Host "  [INFO] Connecting to $VPS_USER@$VPS_HOST..." -ForegroundColor Cyan
try {
    $sshTest = ssh "$VPS_USER@$VPS_HOST" "echo 'Connected'" 2>&1
    if ($sshTest -match "Connected") {
        Write-Host "  [OK] SSH connection successful`n" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] SSH connection may require setup`n" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  [INFO] Proceeding with deployment (will prompt for password if needed)`n" -ForegroundColor Cyan
}

# Step 2: Check build directory
Write-Host "Step 2: Checking build directory..." -ForegroundColor Yellow
if (!(Test-Path "build")) {
    Write-Host "  [INFO] Building application..." -ForegroundColor Cyan
    npm run build
    Write-Host "  [OK] Build complete`n" -ForegroundColor Green
} else {
    Write-Host "  [OK] Build directory exists`n" -ForegroundColor Green
}

# Step 3: Create deployment package
Write-Host "Step 3: Creating deployment package..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$packageName = "altus-deploy-$timestamp.tar.gz"

Write-Host "  [INFO] Packaging files..." -ForegroundColor Cyan

# Create tar package
tar -czf $packageName build Dockerfile docker-compose.yml nginx.conf package.json public

if (Test-Path $packageName) {
    Write-Host "  [OK] Package created: $packageName`n" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Failed to create package`n" -ForegroundColor Red
    exit 1
}

# Step 4: Upload to VPS
Write-Host "Step 4: Uploading to VPS..." -ForegroundColor Yellow
Write-Host "  [INFO] Uploading $packageName..." -ForegroundColor Cyan

scp $packageName "$VPS_USER@${VPS_HOST}:$DEPLOY_DIR/"

if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Upload complete`n" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Upload failed`n" -ForegroundColor Red
    Remove-Item $packageName -Force
    exit 1
}

# Step 5: Deploy on VPS
Write-Host "Step 5: Deploying on VPS..." -ForegroundColor Yellow

$deployCommands = @"
echo '[INFO] Extracting package...'
cd $DEPLOY_DIR
mkdir -p current
tar -xzf $packageName -C current/
cd current

echo '[INFO] Stopping old containers...'
docker-compose down 2>/dev/null || true
docker stop altus-loan-container 2>/dev/null || true
docker rm altus-loan-container 2>/dev/null || true

echo '[INFO] Building Docker image...'
docker build -t altus-loan-app:latest .

echo '[INFO] Starting containers...'
docker-compose up -d

echo '[INFO] Waiting for container to start...'
sleep 10

if docker ps | grep -q altus-loan-container; then
    echo '[OK] Container is running'
    docker ps | grep altus
else
    echo '[ERROR] Container failed to start'
    docker logs altus-loan-container 2>&1 | tail -20
    exit 1
fi

echo '[INFO] Cleaning up...'
rm -f $DEPLOY_DIR/$packageName
docker image prune -f

echo '[OK] Deployment complete!'
"@

Write-Host "  [INFO] Running deployment commands on VPS..." -ForegroundColor Cyan
ssh "$VPS_USER@$VPS_HOST" $deployCommands

if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Deployment successful`n" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Deployment failed`n" -ForegroundColor Red
    Remove-Item $packageName -Force
    exit 1
}

# Step 6: Verify
Write-Host "Step 6: Verifying deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $response = Invoke-WebRequest -Uri "http://$VPS_HOST/" -Method Get -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "  [OK] Application is responding (HTTP 200)`n" -ForegroundColor Green
    }
} catch {
    Write-Host "  [WARN] Application may not be ready yet`n" -ForegroundColor Yellow
}

# Cleanup local package
Remove-Item $packageName -Force -ErrorAction SilentlyContinue

# Summary
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Deployment Completed Successfully!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Application URL:" -ForegroundColor White
Write-Host "  http://$VPS_HOST" -ForegroundColor Cyan
Write-Host "  http://$VPS_HOST/loan-workflow-test.html" -ForegroundColor Cyan

Write-Host "`nUseful Commands:" -ForegroundColor White
Write-Host "  View logs:" -ForegroundColor Gray
Write-Host "    ssh $VPS_USER@$VPS_HOST 'docker logs altus-loan-container'" -ForegroundColor DarkGray
Write-Host "  Restart:" -ForegroundColor Gray  
Write-Host "    ssh $VPS_USER@$VPS_HOST 'cd $DEPLOY_DIR/current; docker-compose restart'" -ForegroundColor DarkGray
Write-Host "  Stop:" -ForegroundColor Gray
Write-Host "    ssh $VPS_USER@$VPS_HOST 'cd $DEPLOY_DIR/current; docker-compose down'" -ForegroundColor DarkGray

Write-Host "`n[SUCCESS] Your application is now live on your VPS!`n" -ForegroundColor Green
