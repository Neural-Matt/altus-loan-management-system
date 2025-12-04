@echo off
REM Deploy bank branch fix to production

echo Extracting build on VPS...
plink -ssh root@72.60.187.1 -pw Lfem.2018 "cd /tmp && unzip -o build-fixed.zip -d /var/www/loan-app/html/"

echo.
echo Reloading nginx...
plink -ssh root@72.60.187.1 -pw Lfem.2018 "docker exec altus-loan-container nginx -s reload"

echo.
echo Verifying deployment...
plink -ssh root@72.60.187.1 -pw Lfem.2018 "ls -lh /var/www/loan-app/html/index.html && head -20 /var/www/loan-app/html/index.html"

echo.
echo Deployment complete!
pause
