#!/bin/bash

# Altus Loan Management System - Docker Build Script

set -e  # Exit on any error

echo "🐳 Building Altus Loan Management System Docker Container..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    print_warning "docker-compose not found, trying docker compose..."
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

print_status "Using: $DOCKER_COMPOSE"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Build the container
print_status "Building Docker container..."
$DOCKER_COMPOSE build --no-cache

if [ $? -eq 0 ]; then
    print_success "Docker build completed successfully!"
else
    print_error "Docker build failed!"
    exit 1
fi

# Start the container
print_status "Starting the application..."
$DOCKER_COMPOSE up -d

if [ $? -eq 0 ]; then
    print_success "Application started successfully!"
    echo ""
    echo "🎉 Altus Loan Management System is now running!"
    echo ""
    echo "📋 Access URLs:"
    echo "   • Main Application: http://localhost"
    echo "   • Health Check:     http://localhost/health"
    echo "   • Test Page:        http://localhost/deployment-test.html"
    echo ""
    echo "🔧 Management Commands:"
    echo "   • View logs:        $DOCKER_COMPOSE logs -f"
    echo "   • Stop app:         $DOCKER_COMPOSE down"
    echo "   • Restart app:      $DOCKER_COMPOSE restart"
    echo ""
else
    print_error "Failed to start the application!"
    exit 1
fi

# Wait for health check
print_status "Waiting for application to be ready..."
sleep 5

# Check if the application is responding
if curl -f http://localhost/health &>/dev/null; then
    print_success "Application is healthy and ready!"
else
    print_warning "Application may still be starting up. Check logs with: $DOCKER_COMPOSE logs"
fi

echo ""
print_success "Deployment complete! 🚀"