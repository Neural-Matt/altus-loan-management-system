# 🚀 VPS Deployment Guide - Altus Loan Management System

## 📋 Overview

This guide will help you deploy the Altus Loan Management System to your Hostinger VPS (Ubuntu 24.04 LTS) using Docker.

**Target Server:** `root@72.60.187.1`

---

## ✅ Prerequisites

### On Your Local Machine (Windows)
- [x] SSH access to VPS configured
- [x] PowerShell (included in Windows)
- [x] Git Bash or WSL (for bash script - optional)
- [x] Application built successfully (`npm run build` completed)

### On Your VPS (Will be installed automatically)
- [x] Ubuntu 24.04 LTS
- [x] Docker (script installs if missing)
- [x] Docker Compose (script installs if missing)
- [x] Port 80 and 443 open

---

## 🎯 Quick Deployment

### Option 1: PowerShell Script (Recommended for Windows)

```powershell
# Navigate to project directory
cd "C:\Users\Admin\OneDrive\Documents\NCE Builds\Altus Loan Management System\Build\my-react-app-1"

# Run deployment script
.\deploy-to-vps.ps1
```

### Option 2: Bash Script (Git Bash/WSL)

```bash
# Navigate to project directory
cd "/c/Users/Admin/OneDrive/Documents/NCE Builds/Altus Loan Management System/Build/my-react-app-1"

# Make script executable
chmod +x deploy-to-vps.sh

# Run deployment
./deploy-to-vps.sh
```

---

## 📝 What the Deployment Script Does

The deployment script automatically:

1. ✅ **Tests SSH connectivity** to your VPS
2. ✅ **Installs Docker & Docker Compose** on VPS (if not present)
3. ✅ **Creates necessary directories** (`/opt/altus-app`, `/opt/altus-backups`)
4. ✅ **Builds your React application** locally
5. ✅ **Creates deployment package** (compressed tar.gz)
6. ✅ **Uploads package to VPS** via SCP
7. ✅ **Backs up existing deployment** (if any)
8. ✅ **Extracts new deployment**
9. ✅ **Stops old Docker containers**
10. ✅ **Builds new Docker image**
11. ✅ **Starts new containers** with Docker Compose
12. ✅ **Verifies deployment** is working
13. ✅ **Cleans up** old files and images

---

## 🏗️ Manual Deployment (Step-by-Step)

If you prefer to deploy manually or need to troubleshoot:

### Step 1: Build the Application

```powershell
npm run build
```

### Step 2: Connect to VPS

```powershell
ssh root@72.60.187.1
```

### Step 3: Install Docker (if not installed)

```bash
# Update system
apt-get update
apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Step 4: Create Directories

```bash
mkdir -p /opt/altus-app/current
mkdir -p /opt/altus-backups
mkdir -p /opt/altus-app/logs
```

### Step 5: Transfer Files to VPS

From your **local machine** (PowerShell):

```powershell
# Navigate to project directory
cd "C:\Users\Admin\OneDrive\Documents\NCE Builds\Altus Loan Management System\Build\my-react-app-1"

# Create deployment package
tar -czf altus-deploy.tar.gz `
    --exclude='node_modules' `
    --exclude='.git' `
    --exclude='*.tar.gz' `
    --exclude='src' `
    build `
    Dockerfile `
    docker-compose.yml `
    nginx.conf `
    package.json `
    package-lock.json `
    public

# Upload to VPS
scp altus-deploy.tar.gz root@72.60.187.1:/opt/altus-app/
```

### Step 6: Extract and Deploy on VPS

```bash
# SSH to VPS
ssh root@72.60.187.1

# Extract files
cd /opt/altus-app
tar -xzf altus-deploy.tar.gz -C current/
cd current

# Build and start Docker containers
docker-compose up -d --build

# Check status
docker ps
docker logs altus-loan-container
```

---

## 🔍 Verification

### Check if Application is Running

```bash
# Check Docker container status
docker ps | grep altus

# View container logs
docker logs altus-loan-container

# Test HTTP response
curl http://localhost
```

### Access Your Application

Open in browser:
- **Main App:** `http://72.60.187.1`
- **Loan Workflow Test:** `http://72.60.187.1/loan-workflow-test.html`

---

## 🛠️ Useful Docker Commands

### View Logs
```bash
# View all logs
docker logs altus-loan-container

# Follow logs in real-time
docker logs -f altus-loan-container

# Last 100 lines
docker logs --tail 100 altus-loan-container
```

### Restart Application
```bash
cd /opt/altus-app/current
docker-compose restart
```

### Stop Application
```bash
cd /opt/altus-app/current
docker-compose down
```

### Start Application
```bash
cd /opt/altus-app/current
docker-compose up -d
```

### Rebuild Application
```bash
cd /opt/altus-app/current
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Access Container Shell
```bash
docker exec -it altus-loan-container sh
```

### View Container Resource Usage
```bash
docker stats altus-loan-container
```

### Remove Container and Image
```bash
docker-compose down
docker rmi altus-loan-app:latest
```

---

## 📊 Docker Configuration Details

### Dockerfile
- **Base Image:** Node 18 Alpine (build), Nginx Alpine (production)
- **Multi-stage build** for smaller image size
- **Health check** enabled
- **Port:** 80 (HTTP)

### Docker Compose
- **Container Name:** `altus-loan-container`
- **Ports:** 80:80, 443:443
- **Restart Policy:** `unless-stopped`
- **Logs:** Mounted to `./logs` directory
- **Network:** Bridge network (`altus-network`)

### File Structure on VPS
```
/opt/altus-app/
├── current/                    # Active deployment
│   ├── build/                  # Built React app
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── logs/                   # Nginx logs
└── /opt/altus-backups/         # Previous deployments
    ├── backup_20241103_140530/
    └── backup_20241103_120000/
```

---

## 🔒 Security Recommendations

### 1. Setup Firewall
```bash
# Install UFW
apt-get install ufw

# Allow SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable
```

### 2. Setup SSL/HTTPS (Optional)

Install Let's Encrypt certificate:
```bash
# Install Certbot
apt-get install certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d yourdomain.com

# Auto-renewal
certbot renew --dry-run
```

### 3. Secure SSH
```bash
# Edit SSH config
nano /etc/ssh/sshd_config

# Disable root login (after setting up sudo user)
PermitRootLogin no

# Disable password auth (use key-based only)
PasswordAuthentication no

# Restart SSH
systemctl restart sshd
```

---

## 🐛 Troubleshooting

### Issue: Container Won't Start

**Check logs:**
```bash
docker logs altus-loan-container
docker-compose logs
```

**Common fixes:**
```bash
# Remove old containers and rebuild
docker-compose down
docker system prune -a
docker-compose up -d --build
```

### Issue: Port 80 Already in Use

**Check what's using port 80:**
```bash
netstat -tlnp | grep :80
# or
lsof -i :80
```

**Stop conflicting service:**
```bash
# If Apache is running
systemctl stop apache2
systemctl disable apache2

# If Nginx is running directly
systemctl stop nginx
systemctl disable nginx
```

### Issue: Cannot Connect to VPS

**Test connectivity:**
```bash
ping 72.60.187.1
ssh -v root@72.60.187.1
```

**Check firewall:**
```bash
# On VPS
ufw status
iptables -L
```

### Issue: Build Fails

**Check available disk space:**
```bash
df -h
```

**Clean Docker:**
```bash
docker system prune -a
docker volume prune
```

---

## 📈 Monitoring & Maintenance

### Check Container Health
```bash
docker inspect --format='{{.State.Health.Status}}' altus-loan-container
```

### View Resource Usage
```bash
# Real-time stats
docker stats altus-loan-container

# System resources
htop  # or top
free -h
df -h
```

### Backup Current Deployment
```bash
cd /opt/altus-app
tar -czf /opt/altus-backups/manual-backup-$(date +%Y%m%d_%H%M%S).tar.gz current/
```

### Restore Previous Deployment
```bash
# List backups
ls -la /opt/altus-backups/

# Stop current deployment
cd /opt/altus-app/current
docker-compose down

# Restore backup
cd /opt/altus-app
rm -rf current
cp -r /opt/altus-backups/backup_YYYYMMDD_HHMMSS current

# Start restored version
cd current
docker-compose up -d
```

---

## 📞 Quick Reference

| Command | Description |
|---------|-------------|
| `docker ps` | List running containers |
| `docker logs altus-loan-container` | View app logs |
| `docker-compose restart` | Restart application |
| `docker-compose down` | Stop application |
| `docker-compose up -d` | Start application |
| `docker exec -it altus-loan-container sh` | Access container shell |
| `docker stats` | View resource usage |
| `systemctl status docker` | Check Docker service |

---

## 🎯 Post-Deployment Checklist

- [ ] Application accessible at `http://72.60.187.1`
- [ ] Loan workflow test page accessible
- [ ] Docker container running (`docker ps`)
- [ ] Container healthy (`docker inspect`)
- [ ] Logs show no errors
- [ ] API proxy configuration works
- [ ] Firewall configured
- [ ] SSL certificate installed (if needed)
- [ ] Backup strategy in place
- [ ] Monitoring set up

---

## ✅ Success!

Your Altus Loan Management System should now be deployed and running on your VPS!

**Access your application:**
- Main App: `http://72.60.187.1`
- Test Page: `http://72.60.187.1/loan-workflow-test.html`

**Need help?** Check the troubleshooting section or review container logs.
