# Quick VPS Deployment Guide - IP Address Access
# Deploy Altus Loan Management System to Ubuntu VPS with AAPanel

## 🎯 What You Need
- Your VPS IP address (e.g., 192.168.1.100)
- SSH access to your VPS
- AAPanel installed and running
- Your "Altus shared hosting build.zip" file

## 🚀 Option 1: Automated Deployment (Recommended)

### Step 1: Upload Files to VPS
```bash
# From your Windows machine, upload the files
scp "Altus shared hosting build.zip" root@YOUR_VPS_IP:/root/
scp deploy-altus-vps-ip.sh root@YOUR_VPS_IP:/root/
```

### Step 2: Edit the Deployment Script
```bash
# SSH to your VPS
ssh root@YOUR_VPS_IP

# Edit the script to add your IP
nano /root/deploy-altus-vps-ip.sh

# Change this line:
VPS_IP="YOUR_VPS_IP"
# To your actual IP:
VPS_IP="192.168.1.100"  # Replace with your actual IP

# Save and exit (Ctrl+X, Y, Enter)
```

### Step 3: Run Automated Deployment
```bash
# Make script executable
chmod +x /root/deploy-altus-vps-ip.sh

# Run deployment
cd /root
./deploy-altus-vps-ip.sh
```

**That's it! Your site will be live at http://YOUR_VPS_IP**

---

## 🖱️ Option 2: Manual Deployment via AAPanel

### Step 1: Access AAPanel
1. Open browser: `http://YOUR_VPS_IP:7800`
2. Login with your AAPanel credentials

### Step 2: Create Website
1. Click **"Website"** tab
2. Click **"Add Site"**
3. Fill in:
   - **Domain**: Your VPS IP (e.g., `192.168.1.100`)
   - **Root Directory**: `/www/wwwroot/YOUR_VPS_IP`
   - **PHP Version**: 8.0+
   - **Database**: None (uncheck)
4. Click **"Submit"**

### Step 3: Upload Files
1. Go to **"File Manager"**
2. Navigate to `/www/wwwroot/YOUR_VPS_IP/`
3. Upload `Altus shared hosting build.zip`
4. Right-click the zip → **"Extract"**
5. Move all files from extracted folder to root directory
6. Delete the empty folder and zip file

### Step 4: Configure Nginx
1. Go to **"Website"** → Click your IP → **"Config"**
2. Replace the `location /` block with:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}

# Add after the location block:
location /static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;

gzip on;
gzip_types text/plain text/css application/javascript application/json;

error_page 404 /index.html;
```

3. Click **"Save"**

### Step 5: Set Permissions
1. In File Manager, right-click your site folder
2. Set permissions: **755** for folders, **644** for files
3. Or via SSH:
```bash
chown -R www:www /www/wwwroot/YOUR_VPS_IP/
chmod -R 755 /www/wwwroot/YOUR_VPS_IP/
```

### Step 6: Test Your Site
Open browser: `http://YOUR_VPS_IP`

---

## 🔧 Troubleshooting

### Site Not Loading?
```bash
# Check Nginx status
systemctl status nginx

# Restart Nginx
systemctl restart nginx

# Check site files exist
ls -la /www/wwwroot/YOUR_VPS_IP/
```

### Getting 403 Forbidden?
```bash
# Fix permissions
chown -R www:www /www/wwwroot/YOUR_VPS_IP/
chmod -R 755 /www/wwwroot/YOUR_VPS_IP/
```

### React Router Not Working?
- Check if `try_files $uri $uri/ /index.html;` is in Nginx config
- Remove any `.htaccess` files (not needed with Nginx)

### Can't Access from Outside?
```bash
# Check firewall allows port 80
ufw status
ufw allow 80/tcp

# Or configure in AAPanel → Security → Firewall
```

## ✅ What You Get

Once deployed, you can access:
- **Main App**: `http://YOUR_VPS_IP`
- **Loan Tracking**: `http://YOUR_VPS_IP/track` 
- **Loan Calculator**: `http://YOUR_VPS_IP` (homepage)
- **Apply for Loans**: `http://YOUR_VPS_IP/apply/personal/instant-salary-advance`

## 🎉 Success!

Your Altus Loan Management System is now live on your VPS! 

**Benefits of VPS over shared hosting:**
- Better performance
- Full control
- Can add SSL later
- Easy to add domain when ready
- Better security

**Next Steps:**
- Test all features work correctly
- Consider adding SSL certificate
- Add your domain when ready
- Set up automated backups