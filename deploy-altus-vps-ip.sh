#!/bin/bash
# Altus VPS Deployment Script - IP Address Access
# For Ubuntu VPS with AAPanel

# CONFIGURATION - CHANGE THESE VALUES
VPS_IP="YOUR_VPS_IP"  # Replace with your actual VPS IP address
SITE_ROOT="/www/wwwroot/$VPS_IP"
BUILD_ZIP="Altus shared hosting build.zip"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "Please run this script as root or with sudo"
        exit 1
    fi
}

# Function to validate VPS IP
validate_ip() {
    if [[ $VPS_IP == "YOUR_VPS_IP" ]]; then
        print_error "Please edit the script and set your actual VPS IP address"
        print_info "Change VPS_IP=\"YOUR_VPS_IP\" to VPS_IP=\"192.168.1.100\" (your actual IP)"
        exit 1
    fi
    
    print_info "Deploying to IP: $VPS_IP"
}

# Function to check if build zip exists
check_build_zip() {
    if [ ! -f "$BUILD_ZIP" ]; then
        print_error "Build zip file not found: $BUILD_ZIP"
        print_info "Please ensure 'Altus shared hosting build.zip' is in the current directory"
        exit 1
    fi
    print_status "Build zip file found"
}

# Function to create site directory
create_site_directory() {
    print_info "Creating site directory: $SITE_ROOT"
    mkdir -p "$SITE_ROOT"
    print_status "Site directory created"
}

# Function to deploy application files
deploy_files() {
    print_info "Extracting and deploying application files..."
    
    # Create temporary directory
    TEMP_DIR="/tmp/altus-deploy-$(date +%s)"
    mkdir -p "$TEMP_DIR"
    
    # Extract zip file
    unzip -q "$BUILD_ZIP" -d "$TEMP_DIR"
    
    # Copy files to site root
    cp -r "$TEMP_DIR"/* "$SITE_ROOT/"
    
    # Clean up temporary directory
    rm -rf "$TEMP_DIR"
    
    print_status "Application files deployed successfully"
}

# Function to set proper file permissions
set_permissions() {
    print_info "Setting proper file permissions..."
    
    # Set ownership to www user (nginx/apache user)
    chown -R www:www "$SITE_ROOT"
    
    # Set directory permissions
    find "$SITE_ROOT" -type d -exec chmod 755 {} \;
    
    # Set file permissions
    find "$SITE_ROOT" -type f -exec chmod 644 {} \;
    
    print_status "File permissions set correctly"
}

# Function to create nginx configuration
create_nginx_config() {
    print_info "Creating Nginx configuration for IP: $VPS_IP"
    
    NGINX_CONFIG="/www/server/panel/vhost/nginx/$VPS_IP.conf"
    
    cat > "$NGINX_CONFIG" << EOF
server {
    listen 80;
    server_name $VPS_IP;
    root $SITE_ROOT;
    index index.html index.htm;
    
    # Handle React Router (SPA routing)
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Static assets with long-term caching
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options nosniff;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Gzip compression for better performance
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/json
        application/xml+rss
        application/atom+xml;
    
    # Security - hide sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(env|log|config)$ {
        deny all;
    }
    
    # Error pages redirect to React app (SPA handling)
    error_page 404 /index.html;
    error_page 500 502 503 504 /index.html;
    
    # Logging
    access_log /www/wwwlogs/$VPS_IP.log;
    error_log /www/wwwlogs/$VPS_IP.error.log;
}
EOF
    
    print_status "Nginx configuration created"
}

# Function to test and reload nginx
reload_nginx() {
    print_info "Testing Nginx configuration..."
    
    # Test nginx configuration
    if nginx -t; then
        print_status "Nginx configuration is valid"
        
        # Reload nginx
        print_info "Reloading Nginx..."
        nginx -s reload
        print_status "Nginx reloaded successfully"
    else
        print_error "Nginx configuration test failed"
        print_info "Please check the configuration manually"
        exit 1
    fi
}

# Function to create firewall rules
setup_firewall() {
    print_info "Checking firewall configuration..."
    
    # Check if ufw is installed and active
    if command -v ufw &> /dev/null; then
        # Allow HTTP traffic
        ufw allow 80/tcp >/dev/null 2>&1
        print_status "HTTP port 80 allowed in firewall"
    else
        print_warning "UFW firewall not found. Please ensure port 80 is open in your firewall"
        print_info "You can configure this in AAPanel → Security → Firewall"
    fi
}

# Function to verify deployment
verify_deployment() {
    print_info "Verifying deployment..."
    
    # Check if index.html exists
    if [ -f "$SITE_ROOT/index.html" ]; then
        print_status "Main application file found"
    else
        print_error "Main application file (index.html) not found"
        exit 1
    fi
    
    # Check if static directory exists
    if [ -d "$SITE_ROOT/static" ]; then
        print_status "Static assets directory found"
    else
        print_warning "Static assets directory not found - this may cause issues"
    fi
    
    # Test HTTP response
    print_info "Testing HTTP response..."
    if curl -s -I "http://$VPS_IP" | grep -q "200 OK"; then
        print_status "HTTP response test passed"
    else
        print_warning "HTTP response test failed - site may still be starting"
    fi
}

# Function to display completion message
show_completion_message() {
    echo ""
    echo -e "${GREEN}🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉${NC}"
    echo ""
    echo -e "${BLUE}📍 Your Altus Loan Management System is now live at:${NC}"
    echo -e "${YELLOW}   http://$VPS_IP${NC}"
    echo ""
    echo -e "${BLUE}🔗 Available URLs:${NC}"
    echo -e "${YELLOW}   Main Application:  http://$VPS_IP${NC}"
    echo -e "${YELLOW}   Loan Tracking:     http://$VPS_IP/track${NC}"
    echo -e "${YELLOW}   Apply for Loan:    http://$VPS_IP/apply/personal/instant-salary-advance${NC}"
    echo ""
    echo -e "${BLUE}📁 Site Files Location:${NC}"
    echo -e "${YELLOW}   $SITE_ROOT${NC}"
    echo ""
    echo -e "${BLUE}📊 Nginx Configuration:${NC}"
    echo -e "${YELLOW}   /www/server/panel/vhost/nginx/$VPS_IP.conf${NC}"
    echo ""
    echo -e "${BLUE}📝 Log Files:${NC}"
    echo -e "${YELLOW}   Access: /www/wwwlogs/$VPS_IP.log${NC}"
    echo -e "${YELLOW}   Error:  /www/wwwlogs/$VPS_IP.error.log${NC}"
    echo ""
    echo -e "${GREEN}✅ Ready for production use!${NC}"
    echo ""
}

# Main deployment function
main() {
    echo -e "${BLUE}🚀 Altus Loan Management System - VPS Deployment${NC}"
    echo -e "${BLUE}=================================================${NC}"
    echo ""
    
    # Pre-deployment checks
    check_root
    validate_ip
    check_build_zip
    
    # Confirm deployment
    echo -e "${YELLOW}Ready to deploy to: $VPS_IP${NC}"
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Deployment cancelled by user"
        exit 0
    fi
    
    echo ""
    print_info "Starting deployment process..."
    echo ""
    
    # Deployment steps
    create_site_directory
    deploy_files
    set_permissions
    create_nginx_config
    setup_firewall
    reload_nginx
    verify_deployment
    
    # Show completion message
    show_completion_message
}

# Run main function with all arguments
main "$@"