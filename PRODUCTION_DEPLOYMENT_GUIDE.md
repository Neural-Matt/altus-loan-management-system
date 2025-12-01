# 🚀 Production Deployment Guide - Altus Loan Management System

## 📍 **Production Build Location**

Your **complete production-ready build** is located at:

```
📁 C:\Users\Admin\OneDrive\Documents\NCE Builds\Altus Loan Management System\Build\my-react-app-1\build\
```

## 📦 **Build Contents Overview**

### 🎯 **Main Entry Point:**
- **`index.html`** - Main application entry point (optimized for production)

### 📁 **Core Application Files:**
```
build/
├── index.html                    # Main HTML entry point
├── asset-manifest.json          # Asset mapping for deployment
├── site.webmanifest             # PWA manifest
├── favicon.ico & favicon.svg    # Application icons
├── altus-logo.png & .svg        # Altus branding assets
└── static/
    └── js/
        ├── main.4f9a3db2.js           # Main application bundle (203.47 kB gzipped)
        ├── 389.20e20fbd.chunk.js      # Material-UI components (127.7 kB gzipped)  
        ├── 620.c39f356e.chunk.js      # Core React libraries (46.36 kB gzipped)
        ├── 455.075efd40.chunk.js      # Additional UI components (43.27 kB gzipped)
        ├── 771.e0684443.chunk.js      # Form handling & validation (29.03 kB gzipped)
        └── [additional chunks...]     # Other optimized code chunks
```

### 🧪 **Testing & Debug Files (Optional):**
- `api-test.js` - API testing utilities
- `uat-test.js` - UAT testing functions  
- `upload-debug.html` - File upload debugging

## 🌐 **Deployment Options**

### **Option 1: Static File Server (Recommended)**
```bash
# Serve the entire build directory as static files
# Point your web server document root to:
C:\Users\Admin\OneDrive\Documents\NCE Builds\Altus Loan Management System\Build\my-react-app-1\build\
```

### **Option 2: Copy to Web Server**
Copy the entire `build` folder contents to your web server's public directory:
```
build/ → /var/www/html/          (Linux)
build/ → C:\inetpub\wwwroot\     (Windows IIS)
build/ → /public_html/           (cPanel/Shared hosting)
```

### **Option 3: Cloud Deployment**
Upload the `build` folder to:
- **Netlify**: Drag & drop the build folder
- **Vercel**: Connect to your GitHub repo (auto-deploy)
- **AWS S3**: Upload build contents to S3 bucket
- **Azure Static Web Apps**: Connect to GitHub repository

## ⚙️ **Server Configuration Requirements**

### **1. Single Page Application (SPA) Support**
Configure your server to serve `index.html` for all routes:

**Apache (.htaccess):**
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QR,L]
```

**Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**IIS (web.config):**
```xml
<rewrite>
  <rules>
    <rule name="React Routes" stopProcessing="true">
      <match url=".*" />
      <conditions logicalGrouping="MatchAll">
        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
      </conditions>
      <action type="Rewrite" url="/" />
    </rule>
  </rules>
</rewrite>
```

### **2. CORS Headers (for UAT API)**
Add these headers for API connectivity:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### **3. Cache Control (Optional but Recommended)**
```
Cache-Control: public, max-age=31536000  # For static assets
Cache-Control: no-cache                  # For index.html
```

## 🔧 **Environment Configuration**

### **Production API Endpoints:**
The build is configured to use these UAT endpoints in production:
- Loan Services: `http://3.6.174.212:5010`
- Customer Services: `http://3.6.174.212:5011`
- Product Services: `http://3.6.174.212:5012`
- Document Services: `http://3.6.174.212:5013`

### **Bearer Token:**
Production token is embedded: `0B9574489-7EC5-4373-94DA-871FDE07CF8EC3BEA3AF-C9B7-4DEA-AE35-EA1C626191C00314393C-29B4-4E60-8D11-595EDAAAC42F10`

## 🧪 **Testing Your Deployment**

### **1. Basic Functionality Test:**
1. Navigate to your deployed URL
2. Open browser developer console
3. Run: `quickUATTest()` or `testMockWorkflow()`

### **2. API Connectivity Test:**
1. Check browser console for any CORS errors
2. Verify API endpoints are reachable from your domain
3. Test complete loan application workflow

### **3. Browser Compatibility:**
✅ Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## 📊 **Performance Metrics**

- **Total Bundle Size**: ~500KB gzipped
- **Main Bundle**: 203.47 kB gzipped  
- **First Contentful Paint**: < 2s (typical)
- **Time to Interactive**: < 3s (typical)

## 🎯 **Quick Deployment Checklist**

- [ ] Copy entire `build/` folder to web server
- [ ] Configure SPA routing (index.html fallback)
- [ ] Set up CORS headers if serving from different domain
- [ ] Test API connectivity to UAT endpoints
- [ ] Verify browser console functions work
- [ ] Test complete loan application workflow

## 📞 **Support**

The build includes comprehensive error logging and debugging tools. Check browser console for detailed error messages and API response logging.

---

**🎉 Your production build is ready for deployment!**