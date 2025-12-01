# Production Deployment - UAT Compliant Build
**Date:** November 21, 2025  
**Version:** main.14ed0e51.js  
**Status:** Ready for Production Deployment

---

## 📦 Deployment Packages Available

### Option 1: Docker Image (Recommended for VPS)
**File:** `altus-app-uat-compliant.tar` (24.08 MB)

**Deploy to VPS:**
```bash
# 1. Upload to VPS
scp altus-app-uat-compliant.tar root@72.60.187.1:/root/

# 2. SSH to VPS
ssh root@72.60.187.1

# 3. Load Docker image
docker load -i altus-app-uat-compliant.tar

# 4. Stop current container
docker stop altus-loan-container
docker rm altus-loan-container

# 5. Run new container
docker run -d \
  --name altus-loan-container \
  -p 80:80 \
  -p 443:443 \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  -v /var/lib/letsencrypt:/var/lib/letsencrypt:ro \
  --restart unless-stopped \
  my-react-app-1-altus-app:latest

# 6. Verify
curl -I https://applynow.altuszm.com
```

### Option 2: Static Build Files
**File:** `altus-uat-compliant-build.zip` (2.23 MB)

**Deploy to Web Server:**
```bash
# 1. Upload to VPS
scp altus-uat-compliant-build.zip root@72.60.187.1:/tmp/

# 2. SSH to VPS
ssh root@72.60.187.1

# 3. Backup current deployment
cd /var/www/html
tar -czf backup-$(date +%Y%m%d).tar.gz build/

# 4. Extract new build
unzip /tmp/altus-uat-compliant-build.zip -d /var/www/html/build/

# 5. Set permissions
chown -R www-data:www-data /var/www/html/build
chmod -R 755 /var/www/html/build

# 6. Restart nginx
systemctl restart nginx

# 7. Verify
curl -I https://applynow.altuszm.com
```

---

## ✅ What's Included in This Build

### New Features (UAT API V2 Compliant):
1. ✅ GetStatus API - Customer approval tracking with polling
2. ✅ Document Type Codes - 30+ document types mapped
3. ✅ Update Customer APIs - Create/Update differentiation
4. ✅ Loan Request Fixes - New vs Existing customer handling
5. ✅ Validation Constants - All pre-defined values
6. ✅ Mandatory Field Validation - Complete validation system
7. ✅ Customer Workflow Hook - RequestId state management

### Core Improvements:
- Fixed loan request payloads (no personal details for Existing customers)
- Enhanced document upload with proper type codes
- Comprehensive form validation helpers
- Complete workflow state management
- All 16 APIs fully functional and tested

---

## 🔍 Post-Deployment Verification

### 1. Check Build Version
```bash
curl -s https://applynow.altuszm.com | grep -o 'main\.[a-z0-9]*\.js'
# Expected: main.14ed0e51.js
```

### 2. Test New APIs
Navigate to: https://applynow.altuszm.com/api-test

**Critical Tests:**
- ✅ Get Customer Request Status (NEW)
- ✅ Create Retail Customer → Verify RequestId returned
- ✅ Submit Loan Request (New customer) → Includes personal details
- ✅ Submit Loan Request (Existing customer) → Excludes personal details
- ✅ Upload Document → Verify document type codes available

### 3. Verify Health
```bash
# Container health (if using Docker)
docker ps --filter "name=altus-loan-container"

# HTTP response
curl -I https://applynow.altuszm.com
# Expected: HTTP/2 200
```

---

## 🎯 Quick Deployment Commands

### For VPS with Docker:
```bash
# Single command deployment
scp altus-app-uat-compliant.tar root@72.60.187.1:/root/ && \
ssh root@72.60.187.1 "docker load -i /root/altus-app-uat-compliant.tar && \
docker stop altus-loan-container && docker rm altus-loan-container && \
docker run -d --name altus-loan-container -p 80:80 -p 443:443 \
-v /etc/letsencrypt:/etc/letsencrypt:ro \
-v /var/lib/letsencrypt:/var/lib/letsencrypt:ro \
--restart unless-stopped my-react-app-1-altus-app:latest"
```

### For Static File Server:
```bash
# Quick deployment
scp altus-uat-compliant-build.zip root@72.60.187.1:/tmp/ && \
ssh root@72.60.187.1 "cd /var/www/html && \
tar -czf backup-$(date +%Y%m%d).tar.gz build/ && \
rm -rf build/* && \
unzip /tmp/altus-uat-compliant-build.zip -d build/ && \
systemctl restart nginx"
```

---

## 📊 Build Statistics

**Production Build:**
- Main Bundle: 216.42 kB (gzipped)
- Total Size: ~2.23 MB (uncompressed)
- Docker Image: 24.08 MB
- Chunk Count: 13 files

**Key Files:**
- main.14ed0e51.js (NEW - UAT compliant)
- 389.20e20fbd.chunk.js (Material-UI)
- 620.c39f356e.chunk.js (React core)

---

## 🚨 Rollback Procedure

If issues occur after deployment:

### Docker Rollback:
```bash
ssh root@72.60.187.1
docker stop altus-loan-container
docker rm altus-loan-container
docker run -d --name altus-loan-container -p 80:80 -p 443:443 \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  --restart unless-stopped \
  <PREVIOUS_IMAGE_ID>
```

### Static Files Rollback:
```bash
ssh root@72.60.187.1
cd /var/www/html
rm -rf build/*
tar -xzf backup-YYYYMMDD.tar.gz
systemctl restart nginx
```

---

## 📞 Support Resources

**Documentation:**
- Full Implementation: `UAT_COMPLIANCE_IMPLEMENTATION.md`
- Quick Start Guide: `QUICK_START_UAT_COMPLIANCE.md`
- API Reference: `ALTUS_API_README.md`

**Production URL:** https://applynow.altuszm.com  
**Test Interface:** https://applynow.altuszm.com/api-test  
**SSL Valid Until:** February 3, 2026

---

## ✅ Deployment Checklist

- [ ] Backup current deployment
- [ ] Upload deployment package to VPS
- [ ] Stop current containers/services
- [ ] Deploy new build
- [ ] Verify build version (main.14ed0e51.js)
- [ ] Test critical APIs at /api-test
- [ ] Check SSL certificate
- [ ] Test complete user workflows
- [ ] Monitor error logs for 24 hours
- [ ] Update team on successful deployment

---

**Ready for Production!** 🚀
