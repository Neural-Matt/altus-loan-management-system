# Simple deployment script for Windows
$VPS = "root@72.60.187.1"

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "  Altus Loan Management Deployment" -ForegroundColor Cyan
Write-Host "==================================`n" -ForegroundColor Cyan

# Build if needed
if (!(Test-Path "build")) {
    Write-Host "[1/5] Building application..." -ForegroundColor Yellow
    npm run build
    Write-Host "      Build complete`n" -ForegroundColor Green
} else {
    Write-Host "[1/5] Build exists - skipping`n" -ForegroundColor Green
}

# Create package
Write-Host "[2/5] Creating deployment package..." -ForegroundColor Yellow
$pkg = "altus-deploy.tar.gz"
tar -czf $pkg build Dockerfile docker-compose.yml nginx.conf package.json package-lock.json public
Write-Host "      Package created: $pkg`n" -ForegroundColor Green

# Upload package
Write-Host "[3/5] Uploading to VPS..." -ForegroundColor Yellow
scp $pkg "${VPS}:/opt/altus-app/"
Write-Host "      Upload complete`n" -ForegroundColor Green

# Upload setup script
Write-Host "[4/5] Uploading setup script..." -ForegroundColor Yellow
scp vps-setup.sh "${VPS}:/opt/altus-app/"
Write-Host "      Script uploaded`n" -ForegroundColor Green

# Run setup on VPS
Write-Host "[5/5] Running deployment on VPS..." -ForegroundColor Yellow
Write-Host "      (This may take a few minutes)...`n" -ForegroundColor Cyan
ssh $VPS "cd /opt/altus-app && chmod +x vps-setup.sh && ./vps-setup.sh"

# Cleanup
Remove-Item $pkg -Force -ErrorAction SilentlyContinue

# Summary
Write-Host "`n==================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "==================================`n" -ForegroundColor Green
Write-Host "Your application is now running at:" -ForegroundColor White
Write-Host "  http://72.60.187.1" -ForegroundColor Cyan
Write-Host "  http://72.60.187.1/loan-workflow-test.html`n" -ForegroundColor Cyan
Write-Host "To view logs: ssh $VPS 'docker logs altus-loan-container'`n" -ForegroundColor Gray
