#!/bin/bash

##############################################
# Altus Loan Management - VPS Deployment Script
# Target: Hostinger VPS (Ubuntu 24.04 LTS)
# Server: 72.60.187.1
##############################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_HOST="72.60.187.1"
VPS_USER="root"
APP_NAME="altus-loan-management"
DEPLOY_DIR="/opt/altus-app"
BACKUP_DIR="/opt/altus-backups"
DOCKER_IMAGE_NAME="altus-loan-app"
CONTAINER_NAME="altus-loan-container"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Altus Loan Management System${NC}"
echo -e "${BLUE}  VPS Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Step 1: Check SSH connectivity
echo -e "${YELLOW}Step 1: Testing SSH connectivity...${NC}"
if ssh -o ConnectTimeout=5 ${VPS_USER}@${VPS_HOST} exit 2>/dev/null; then
    print_status "SSH connection successful"
else
    print_error "Cannot connect to VPS. Please check:"
    echo "  - VPS IP: ${VPS_HOST}"
    echo "  - SSH access"
    echo "  - Firewall settings"
    exit 1
fi

# Step 2: Prepare VPS (Install Docker if needed)
echo ""
echo -e "${YELLOW}Step 2: Preparing VPS environment...${NC}"
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
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
ENDSSH
print_status "VPS environment prepared"

# Step 3: Build application locally
echo ""
echo -e "${YELLOW}Step 3: Building application locally...${NC}"
if [ ! -d "build" ]; then
    print_info "Building React application..."
    npm run build
    print_status "Application built successfully"
else
    print_warning "Build directory exists. Using existing build."
fi

# Step 4: Create deployment package
echo ""
echo -e "${YELLOW}Step 4: Creating deployment package...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOY_PACKAGE="altus-deploy-${TIMESTAMP}.tar.gz"

print_info "Creating package: ${DEPLOY_PACKAGE}"
tar -czf ${DEPLOY_PACKAGE} \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.tar.gz' \
    --exclude='src' \
    build/ \
    Dockerfile \
    docker-compose.yml \
    nginx.conf \
    package.json \
    package-lock.json \
    public/

print_status "Deployment package created: ${DEPLOY_PACKAGE}"

# Step 5: Upload to VPS
echo ""
echo -e "${YELLOW}Step 5: Uploading to VPS...${NC}"
print_info "Uploading ${DEPLOY_PACKAGE} to ${VPS_HOST}..."
scp ${DEPLOY_PACKAGE} ${VPS_USER}@${VPS_HOST}:${DEPLOY_DIR}/
print_status "Upload complete"

# Step 6: Backup existing deployment (if exists)
echo ""
echo -e "${YELLOW}Step 6: Backing up existing deployment...${NC}"
ssh ${VPS_USER}@${VPS_HOST} << ENDSSH
    if [ -d "${DEPLOY_DIR}/current" ]; then
        BACKUP_NAME="backup_\$(date +%Y%m%d_%H%M%S)"
        mv ${DEPLOY_DIR}/current ${BACKUP_DIR}/\${BACKUP_NAME}
        echo "✓ Backup created: \${BACKUP_NAME}"
    else
        echo "✓ No existing deployment to backup"
    fi
ENDSSH
print_status "Backup complete"

# Step 7: Extract and setup new deployment
echo ""
echo -e "${YELLOW}Step 7: Extracting deployment package...${NC}"
ssh ${VPS_USER}@${VPS_HOST} << ENDSSH
    cd ${DEPLOY_DIR}
    mkdir -p current
    tar -xzf ${DEPLOY_PACKAGE} -C current/
    cd current
    echo "✓ Package extracted"
ENDSSH
print_status "Deployment extracted"

# Step 8: Stop existing containers
echo ""
echo -e "${YELLOW}Step 8: Stopping existing containers...${NC}"
ssh ${VPS_USER}@${VPS_HOST} << ENDSSH
    cd ${DEPLOY_DIR}/current
    if docker ps -a | grep -q ${CONTAINER_NAME}; then
        echo "Stopping existing container..."
        docker-compose down || docker stop ${CONTAINER_NAME} || true
        docker rm ${CONTAINER_NAME} || true
        echo "✓ Existing containers stopped"
    else
        echo "✓ No existing containers to stop"
    fi
ENDSSH
print_status "Containers stopped"

# Step 9: Build and start Docker containers
echo ""
echo -e "${YELLOW}Step 9: Building and starting Docker containers...${NC}"
ssh ${VPS_USER}@${VPS_HOST} << ENDSSH
    cd ${DEPLOY_DIR}/current
    
    # Build the Docker image
    echo "Building Docker image..."
    docker build -t ${DOCKER_IMAGE_NAME}:latest .
    
    # Start the container
    echo "Starting container..."
    docker-compose up -d
    
    # Wait for container to be healthy
    echo "Waiting for container to be ready..."
    sleep 10
    
    # Check container status
    if docker ps | grep -q ${CONTAINER_NAME}; then
        echo "✓ Container started successfully"
    else
        echo "✗ Container failed to start"
        docker logs ${CONTAINER_NAME}
        exit 1
    fi
ENDSSH
print_status "Docker containers started"

# Step 10: Verify deployment
echo ""
echo -e "${YELLOW}Step 10: Verifying deployment...${NC}"
sleep 5
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://${VPS_HOST}/ || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    print_status "Application is responding (HTTP ${HTTP_CODE})"
else
    print_warning "Application returned HTTP ${HTTP_CODE}"
fi

# Step 11: Cleanup
echo ""
echo -e "${YELLOW}Step 11: Cleaning up...${NC}"
ssh ${VPS_USER}@${VPS_HOST} << ENDSSH
    # Remove deployment package
    rm -f ${DEPLOY_DIR}/${DEPLOY_PACKAGE}
    
    # Clean up old Docker images
    echo "Removing old Docker images..."
    docker image prune -f
    
    # Keep only last 5 backups
    cd ${BACKUP_DIR}
    ls -t | tail -n +6 | xargs -r rm -rf
    
    echo "✓ Cleanup complete"
ENDSSH
print_status "Cleanup complete"

# Remove local deployment package
rm -f ${DEPLOY_PACKAGE}

# Final summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Successful! 🚀${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Application URL:  ${BLUE}http://${VPS_HOST}${NC}"
echo -e "Test Workflow:    ${BLUE}http://${VPS_HOST}/loan-workflow-test.html${NC}"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo "  View logs:      ssh ${VPS_USER}@${VPS_HOST} 'docker logs ${CONTAINER_NAME}'"
echo "  Restart:        ssh ${VPS_USER}@${VPS_HOST} 'cd ${DEPLOY_DIR}/current && docker-compose restart'"
echo "  Stop:           ssh ${VPS_USER}@${VPS_HOST} 'cd ${DEPLOY_DIR}/current && docker-compose down'"
echo "  Shell access:   ssh ${VPS_USER}@${VPS_HOST} 'docker exec -it ${CONTAINER_NAME} sh'"
echo ""
echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
