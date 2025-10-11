@echo off
REM Altus Loan Management System - Docker Build Script for Windows

setlocal EnableDelayedExpansion

echo.
echo 🐳 Building Altus Loan Management System Docker Container...
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the project root directory.
    pause
    exit /b 1
)

REM Check for docker-compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [INFO] Using 'docker compose' command...
    set DOCKER_COMPOSE=docker compose
) else (
    echo [INFO] Using 'docker-compose' command...
    set DOCKER_COMPOSE=docker-compose
)

echo.
echo [INFO] Building Docker container...
%DOCKER_COMPOSE% build --no-cache

if errorlevel 1 (
    echo [ERROR] Docker build failed!
    pause
    exit /b 1
)

echo [SUCCESS] Docker build completed successfully!
echo.

echo [INFO] Starting the application...
%DOCKER_COMPOSE% up -d

if errorlevel 1 (
    echo [ERROR] Failed to start the application!
    pause
    exit /b 1
)

echo [SUCCESS] Application started successfully!
echo.
echo 🎉 Altus Loan Management System is now running!
echo.
echo 📋 Access URLs:
echo    • Main Application: http://localhost
echo    • Health Check:     http://localhost/health
echo    • Test Page:        http://localhost/deployment-test.html
echo.
echo 🔧 Management Commands:
echo    • View logs:        %DOCKER_COMPOSE% logs -f
echo    • Stop app:         %DOCKER_COMPOSE% down
echo    • Restart app:      %DOCKER_COMPOSE% restart
echo.

echo [INFO] Waiting for application to be ready...
timeout /t 5 /nobreak >nul

echo [INFO] Checking application health...
curl -f http://localhost/health >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Application may still be starting up. Check logs with: %DOCKER_COMPOSE% logs
) else (
    echo [SUCCESS] Application is healthy and ready!
)

echo.
echo [SUCCESS] Deployment complete! 🚀
echo.
pause