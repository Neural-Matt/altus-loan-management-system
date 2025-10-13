# Altus VPS Deployment - IP Address Access
# Ubuntu VPS with AAPanel - No Domain Required

## 🎯 Deployment Overview

Since you're using IP address access, this deployment is actually simpler - no DNS or domain configuration needed!

## 📋 Step-by-Step IP-Based Deployment

### Step 1: Access Your AAPanel
```bash
# Get your AAPanel login details
ssh root@YOUR_VPS_IP
bt default

# Access AAPanel via browser
http://YOUR_VPS_IP:7800
```

### Step 2: Create Website with IP Address
1. **Login to AAPanel** → **Website** tab
2. **Click "Add Site"**
3. **Configure:**
   - **Domain**: `YOUR_VPS_IP` (e.g., `192.168.1.100`)
   - **Root Directory**: `/www/wwwroot/YOUR_VPS_IP`
   - **PHP Version**: 8.0+ (for AAPanel compatibility)
   - **Database**: None (skip)
   - **SSL**: Skip for now (IP addresses can't use standard SSL)

### Step 3: Upload Your Build Files

#### Option A: Via AAPanel File Manager (Recommended)
1. **Go to File Manager** in AAPanel
2. **Navigate to**: `/www/wwwroot/YOUR_VPS_IP/`
3. **Upload**: `Altus shared hosting build.zip`
4. **Right-click** → **Extract** the zip file
5. **Move all files** from the extracted folder to the root directory
6. **Delete** the empty folder and zip file

#### Option B: Via SCP/SFTP
```bash
# Upload from your Windows machine
scp "Altus shared hosting build.zip" root@YOUR_VPS_IP:/tmp/

# SSH to VPS and extract
ssh root@YOUR_VPS_IP
cd /www/wwwroot/YOUR_VPS_IP/
unzip /tmp/"Altus shared hosting build.zip"
mv hostinger-deployment/* .
rmdir hostinger-deployment
rm /tmp/"Altus shared hosting build.zip"
```

### Step 4: Configure Nginx for React Router
1. **In AAPanel** → **Website** → **Your IP** → **Config**
2. **Replace the location block** with:

```nginx
server {
    listen 80;
    server_name YOUR_VPS_IP;
    root /www/wwwroot/YOUR_VPS_IP;
    index index.html index.htm;
    
    # Handle React Router (SPA routing)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Static assets with caching
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options nosniff;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
    
    # Hide sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(env|log|config)$ {
        deny all;
    }
    
    # Error pages redirect to React app
    error_page 404 /index.html;
    error_page 500 502 503 504 /index.html;
}
```

### Step 5: Set File Permissions
```bash
# SSH to your VPS
ssh root@YOUR_VPS_IP

# Set proper permissions
chown -R www:www /www/wwwroot/YOUR_VPS_IP/
find /www/wwwroot/YOUR_VPS_IP/ -type f -exec chmod 644 {} \;
find /www/wwwroot/YOUR_VPS_IP/ -type d -exec chmod 755 {} \;
```

### Step 6: Restart Nginx
```bash
# Test Nginx configuration
nginx -t

# Reload Nginx
nginx -s reload

# Or via AAPanel: Software Store → Nginx → Restart
```

## 🚀 Quick Automated Deployment Script

Create this script for easy deployment:

```bash
#!/bin/bash
# Save as: deploy-altus-ip.sh

VPS_IP="YOUR_VPS_IP"  # Replace with your actual IP
SITE_ROOT="/www/wwwroot/$VPS_IP"

echo "🚀 Deploying Altus to IP: $VPS_IP"

# Create site directory
mkdir -p "$SITE_ROOT"

# Extract and deploy files
if [ -f "Altus shared hosting build.zip" ]; then
    echo "📥 Extracting files..."
    unzip -o "Altus shared hosting build.zip" -d /tmp/altus/
    cp -r /tmp/altus/* "$SITE_ROOT/"
    rm -rf /tmp/altus/
    echo "✅ Files deployed"
else
    echo "❌ Build zip not found!"
    exit 1
fi

# Set permissions
echo "🔒 Setting permissions..."
chown -R www:www "$SITE_ROOT"
find "$SITE_ROOT" -type f -exec chmod 644 {} \;
find "$SITE_ROOT" -type d -exec chmod 755 {} \;

# Create Nginx config
echo "⚙️ Creating Nginx config..."
cat > "/www/server/panel/vhost/nginx/$VPS_IP.conf" << EOF
server {
    listen 80;
    server_name $VPS_IP;
    root $SITE_ROOT;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    gzip on;
    gzip_types text/plain text/css application/javascript application/json;
    
    error_page 404 /index.html;
}
EOF

# Restart Nginx
nginx -t && nginx -s reload

echo "✅ Deployment complete!"
echo "🌐 Access your app at: http://$VPS_IP"
```

## 🔧 Firewall Configuration

Make sure your VPS firewall allows HTTP traffic:

```bash
# Via AAPanel Security panel, ensure these ports are open:
# - Port 80 (HTTP) - for your application
# - Port 22 (SSH) - for management
# - Port 7800 (AAPanel) - for panel access

# Or via command line:
ufw allow 80/tcp
ufw allow 22/tcp
ufw allow 7800/tcp
```

## 🧪 Testing Your Deployment

### 1. Basic Access Test
```bash
# Test from your local machine
curl -I http://YOUR_VPS_IP

# Should return: HTTP/1.1 200 OK
```

### 2. React Router Test
```bash
# Test SPA routing
curl -I http://YOUR_VPS_IP/track
curl -I http://YOUR_VPS_IP/apply/personal/instant-salary-advance

# Both should return: HTTP/1.1 200 OK
```

### 3. Browser Test
Open in your browser:
- `http://YOUR_VPS_IP` - Main application
- `http://YOUR_VPS_IP/track` - Loan tracking page
- `http://YOUR_VPS_IP/apply/personal/instant-salary-advance` - Application wizard

## 🎯 Access URLs

Once deployed, you can access your Altus Loan Management System at:

- **Main Application**: `http://YOUR_VPS_IP`
- **Loan Tracking**: `http://YOUR_VPS_IP/track`
- **Loan Calculator**: `http://YOUR_VPS_IP` (hero section)
- **Application Wizard**: `http://YOUR_VPS_IP/apply/[category]/[product]`

## 🔧 Common IP-Based Deployment Issues

### Issue 1: Site Not Loading
```bash
# Check if Nginx is running
systemctl status nginx

# Check site configuration
nginx -t
cat /www/server/panel/vhost/nginx/YOUR_VPS_IP.conf
```

### Issue 2: 403 Forbidden Error
```bash
# Fix permissions
chown -R www:www /www/wwwroot/YOUR_VPS_IP/
chmod -R 755 /www/wwwroot/YOUR_VPS_IP/
```

### Issue 3: React Router Not Working
- Verify the `try_files` directive in Nginx config
- Check if `.htaccess` was uploaded (remove it, we use Nginx config instead)

### Issue 4: Static Assets Not Loading
```bash
# Check if static files exist
ls -la /www/wwwroot/YOUR_VPS_IP/static/

# Verify permissions
chmod -R 644 /www/wwwroot/YOUR_VPS_IP/static/
```

## 🚀 Future Domain Setup

When you get a domain later, you can:

1. **Add the domain** in AAPanel → Website
2. **Point DNS** A record to your VPS IP
3. **Setup SSL certificate** (Let's Encrypt)
4. **Redirect IP traffic** to domain if desired

## 📊 Performance on VPS

Expected performance with IP access:
- **Load Time**: 1-2 seconds (local network)
- **Bundle Size**: 195.9KB main (gzipped)
- **Memory Usage**: ~50MB (nginx + static files)
- **Concurrent Users**: 100+ (depends on VPS specs)

---

## 🎉 Ready to Deploy!

Your Altus Loan Management System is ready for IP-based deployment on your Ubuntu VPS with AAPanel. This setup gives you:

✅ **Immediate Access** - No domain configuration needed  
✅ **Full Control** - Root access to customize as needed  
✅ **Easy Management** - AAPanel web interface  
✅ **Better Performance** - Dedicated VPS resources  
✅ **Production Ready** - Optimized Nginx configuration  

Access your application at: **http://YOUR_VPS_IP** once deployed!