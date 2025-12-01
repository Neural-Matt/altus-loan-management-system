# 🚀 Deployment Instructions - UAT Compliance Update

## ✅ Build Completed Successfully

**New Build Version:** `main.14ed0e51.js`  
**Previous Version:** `main.bbc7a797.js`  
**Build Date:** November 21, 2025  
**Build Size:** 216.42 kB (gzipped)

---

## 📦 What's New in This Build

### Core Features Added:
1. ✅ **GetStatus API** - Customer approval tracking with polling
2. ✅ **Document Type Codes** - 30+ document types properly mapped
3. ✅ **Loan Request Fixes** - New vs Existing customer differentiation
4. ✅ **Validation System** - Comprehensive mandatory field validation
5. ✅ **Customer Workflow Hook** - Complete RequestId polling workflow
6. ✅ **Update Customer APIs** - Already working, verified compliant

### New Files in Build:
- Enhanced `main.14ed0e51.js` with all UAT compliance features
- All validation constants and helpers included
- Complete API integration layer updated

---

## 🔧 Deployment Steps

### Current Production Environment:
- **URL:** https://applynow.altuszm.com
- **Hosting:** VPS with Docker + nginx
- **SSL:** Valid until February 3, 2026
- **Current Version:** main.bbc7a797.js

### Option 1: Docker Deployment (Recommended)

**Prerequisites:**
- Ensure Docker Desktop is running
- VPS access configured

**Steps:**
```bash
# 1. Navigate to project directory
cd "C:\Users\Admin\OneDrive\Documents\NCE Builds\Altus Loan Management System\Build\my-react-app-1"

# 2. Stop current containers
docker-compose down

# 3. Rebuild with new code
docker-compose build

# 4. Start updated containers
docker-compose up -d

# 5. Verify deployment
curl https://applynow.altuszm.com
```

### Option 2: Direct Build Upload to VPS

**Steps:**
```bash
# 1. Connect to VPS
ssh root@72.60.187.1

# 2. Navigate to web root
cd /var/www/html

# 3. Backup current build
mv build build-backup-$(date +%Y%m%d)

# 4. Upload new build (from local machine)
scp -r build/* root@72.60.187.1:/var/www/html/

# 5. Restart nginx
systemctl restart nginx

# 6. Verify
curl https://applynow.altuszm.com
```

### Option 3: Manual File Copy (If VPS not accessible)

**Location of new build:**
```
C:\Users\Admin\OneDrive\Documents\NCE Builds\Altus Loan Management System\Build\my-react-app-1\build\
```

**Steps:**
1. Copy entire `build` folder contents
2. Upload to your web server's document root
3. Ensure `index.html` is served for all routes (SPA config)
4. Clear browser cache and test

---

## ✅ Post-Deployment Verification

### 1. Check Build Version
Visit https://applynow.altuszm.com and check browser console:
```javascript
// Should see: main.14ed0e51.js (NEW)
// Old version was: main.bbc7a797.js
```

### 2. Test New APIs
Navigate to https://applynow.altuszm.com/api-test

**Test these new features:**
- ✅ "Get Customer Request Status" - Should appear in API list
- ✅ "Create Retail Customer" - Test RequestId workflow
- ✅ "Submit Loan Request" - Test with TypeOfCustomer = "New"
- ✅ "Submit Loan Request" - Test with TypeOfCustomer = "Existing"
- ✅ Document upload - Verify 30+ document types available

### 3. Verify Workflows
Test the complete customer creation workflow:
1. Create a customer (should return RequestId)
2. Use "Get Customer Request Status" with the RequestId
3. Verify status polling works correctly
4. Confirm CustomerId is returned when approved

### 4. Check Console for Errors
Open browser DevTools → Console and verify:
- ✅ No TypeScript errors
- ✅ API calls logging correctly
- ✅ Validation functions working
- ✅ Document type codes loading

---

## 🔍 Verification Commands

### Check if site is accessible:
```powershell
Invoke-WebRequest -Uri "https://applynow.altuszm.com" -UseBasicParsing | Select-Object StatusCode, @{Name='Version';Expression={($_.Content | Select-String 'main\.[a-z0-9]+\.js').Matches.Value}}
```

**Expected Output:**
```
StatusCode : 200
Version    : main.14ed0e51.js  ← NEW VERSION
```

### Check API endpoint:
```powershell
Invoke-RestMethod -Uri "https://applynow.altuszm.com/api-test"
```

---

## 📋 Rollback Procedure (If Needed)

If issues are found after deployment:

### Docker Rollback:
```bash
# Stop current containers
docker-compose down

# Checkout previous commit
git checkout <previous-commit-hash>

# Rebuild
docker-compose build
docker-compose up -d
```

### Manual Rollback:
```bash
# Restore backup
cd /var/www/html
rm -rf build
mv build-backup-20251121 build
systemctl restart nginx
```

---

## 🎯 What to Test After Deployment

### Critical Workflows:
1. **Customer Creation Flow**
   - Create customer → Get RequestId
   - Poll GetStatus → Wait for approval
   - Retrieve CustomerId when approved

2. **Loan Request Flow**
   - New customer: Include all personal details
   - Existing customer: Exclude FirstName/LastName/DOB
   - Verify correct API payload structure

3. **Document Upload**
   - Upload with correct TypeOfDocument code
   - Verify 30+ document types available
   - Check base64 encoding works

4. **Form Validation**
   - Test mandatory field validation
   - Verify pre-defined value dropdowns
   - Check email/age/date validation helpers

---

## 📊 Build Statistics

**Build Output:**
```
File sizes after gzip:

  216.42 kB  build\static\js\main.14ed0e51.js      ← MAIN BUNDLE (NEW)
  127.7 kB   build\static\js\389.20e20fbd.chunk.js
  46.36 kB   build\static\js\620.c39f356e.chunk.js
  43.27 kB   build\static\js\455.075efd40.chunk.js
  28.92 kB   build\static\js\610.dbac6e60.chunk.js
  8.68 kB    build\static\js\340.d9d65a04.chunk.js
  8.62 kB    build\static\js\977.1b5453ab.chunk.js
```

**Total Gzipped Size:** ~480 kB  
**Uncompressed Size:** ~1.2 MB

---

## 📝 Notes

### Changes from Previous Build:
- Added 5 new files (validation, hooks, constants)
- Modified 3 existing files (altusApi, APITester, types)
- No breaking changes to existing functionality
- All existing APIs remain functional
- Backward compatible with current form implementations

### New Developer Resources:
- 📚 `UAT_COMPLIANCE_IMPLEMENTATION.md` - Complete implementation docs
- 🚀 `QUICK_START_UAT_COMPLIANCE.md` - Quick reference guide
- Both files contain code examples and integration patterns

---

## ✅ Ready to Deploy

The build is **production-ready** and has been compiled successfully with all UAT compliance features.

**Next Step:** Choose a deployment option above and proceed with deployment.

**Support:** Refer to `UAT_COMPLIANCE_IMPLEMENTATION.md` for detailed API specifications and usage examples.
