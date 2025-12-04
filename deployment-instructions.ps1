# Deploy bank branch fix - Manual steps
Write-Host "=== Deployment Instructions ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "The build-fixed.zip file has been uploaded to /tmp/ on the VPS." -ForegroundColor Green
Write-Host ""
Write-Host "Please run the following commands manually via SSH:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Connect to VPS:" -ForegroundColor White
Write-Host "   ssh root@72.60.187.1" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Extract the build:" -ForegroundColor White
Write-Host "   cd /tmp" -ForegroundColor Gray
Write-Host "   unzip -o build-fixed.zip -d /var/www/loan-app/html/" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Reload nginx:" -ForegroundColor White
Write-Host "   docker exec altus-loan-container nginx -s reload" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Verify deployment:" -ForegroundColor White
Write-Host "   ls -lh /var/www/loan-app/html/index.html" -ForegroundColor Gray
Write-Host "   grep 'main' /var/www/loan-app/html/index.html" -ForegroundColor Gray
Write-Host ""
Write-Host "Expected: Should see main.3aca9c72.js in the index.html file" -ForegroundColor Green
Write-Host ""
Write-Host "=== Alternative: Use WinSCP ===" -ForegroundColor Cyan
Write-Host "Or manually upload the build folder contents from:" -ForegroundColor Yellow
Write-Host "c:\Users\Admin\OneDrive\Documents\NCE Builds\Altus Loan Management System\Build\my-react-app-1\build" -ForegroundColor Gray
Write-Host "to: /var/www/loan-app/html/ on the VPS" -ForegroundColor Gray
