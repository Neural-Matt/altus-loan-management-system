# 🎯 **ALTUS API FIXES & TESTING GUIDE**

## ✅ **COMPLETED FIXES**

### **1. Bearer Token Management Fixed**
- ✅ **Removed hardcoded token** security risk
- ✅ **Added environment variable support**: Set `REACT_APP_ALTUS_BEARER_TOKEN`
- ✅ **Added localStorage persistence** for development
- ✅ **Dynamic token updates**: Use `updateBearerToken(newToken)`

### **2. Customer State Persistence Fixed** 
- ✅ **Fixed wizard data flow**: Customer ID now properly stored after API creation
- ✅ **Enhanced debugging**: Added detailed console logging
- ✅ **Fallback support**: Documents can use wizard data or Altus context for customer ID
- ✅ **API integration**: Customer creation response properly captured

### **3. Document Upload Integration Fixed**
- ✅ **Customer ID availability**: Documents now have access to created customer ID
- ✅ **Development mode support**: Skip API calls but maintain verification flow
- ✅ **Error handling**: Clear messages when customer creation is required

---

## 🛠️ **NEW TOOLS CREATED**

### **API Connectivity Checker** (`ApiConnectivityChecker.tsx`)
- ✅ **Real-time endpoint monitoring** for all 3 Altus servers (5010, 5011, 5012)
- ✅ **Token status validation** with update capability
- ✅ **Performance metrics** and response time tracking
- ✅ **Visual status indicators** with expandable details

### **Comprehensive API Tester** (`apiTester.ts`)
- ✅ **Full endpoint validation** against UAT specifications
- ✅ **Customer creation testing** with realistic data
- ✅ **Loan services testing** including status and balance checks
- ✅ **Document upload testing** with file handling
- ✅ **Detailed reporting** with pass/fail analysis

### **Quick Test Helper** (`quickTester.ts`)
- ✅ **Browser console shortcuts** for rapid testing
- ✅ **Token setup utilities** for easy UAT token configuration
- ✅ **Connectivity checking** without full test suite
- ✅ **Status summaries** for quick health checks

---

## 🚀 **HOW TO RUN API TESTS**

### **Option 1: Browser Console (Easiest)**
1. **Open your app** in the browser
2. **Open browser console** (F12)
3. **Set your UAT token** from the PDF:
   ```javascript
   setupUatToken('YOUR_REAL_UAT_TOKEN_FROM_PDF_HERE');
   ```
4. **Run quick test**:
   ```javascript
   await quickApiTest();
   ```

### **Option 2: Connectivity Checker Component**
1. **Add to your app**:
   ```tsx
   import ApiConnectivityChecker from './components/common/ApiConnectivityChecker';
   
   // Add to any page
   <ApiConnectivityChecker />
   ```
2. **Click "Update Token"** to set your UAT token
3. **Click refresh** to test all endpoints

### **Option 3: Full Test Suite**
```javascript
// In browser console or component
import { runAltusApiTests } from './api/apiTester';

const report = await runAltusApiTests();
console.log('Test Results:', report);
```

---

## 📋 **WHAT I NEED FROM YOU**

### **🔑 Priority 1: Real UAT Token**
- **Extract token** from `UAT - Altus API Details.pdf`
- **Replace the fallback token** I found in your code
- **Token format**: Should be 100+ characters starting with alphanumeric

### **📄 Priority 2: UAT API Response Formats**
I need to verify these response structures match your PDF:

**Customer Creation Response:**
```typescript
{
  executionStatus: "Success",
  executionMessage: "Customer created successfully", 
  outParams: {
    customerId: "CUST12345", // ← This field name
    firstName: "John",
    lastName: "Doe",
    // ... other fields
  }
}
```

**Document Upload Response:**
```typescript
{
  executionStatus: "Success",
  outParams: {
    documentId: "DOC12345", // ← This field name
    uploadStatus: "completed",
    // ... other fields
  }
}
```

### **🌐 Priority 3: Endpoint Specifications**
From the PDF, please verify:
- **Health check endpoints**: Do `/health` endpoints exist?
- **Authentication method**: Is it Bearer token in headers?
- **Error response formats**: What do 401/500 errors look like?

---

## 🎯 **IMMEDIATE NEXT STEPS**

### **Step 1: Test Connectivity (5 minutes)**
```javascript
// Browser console
await quickConnectivityTest();
```
This will tell us if servers are reachable.

### **Step 2: Set Real Token (2 minutes)**
```javascript
// Browser console
setupUatToken('REAL_TOKEN_FROM_PDF');
await quickApiTest();
```

### **Step 3: Run Full Validation (10 minutes)**
```javascript
// This will test every endpoint
const report = await runAltusApiTests();
```

---

## 🔍 **WHAT THE TESTS WILL TELL US**

### **✅ If Everything Works:**
- All endpoints return 200 OK
- Customer creation returns valid customer ID
- Document upload succeeds with customer ID
- Loan services respond with expected data

### **⚠️ If Partial Issues:**
- Some endpoints unreachable (network/firewall)
- Authentication works but response formats differ
- API works but integration with your app needs fixes

### **❌ If Major Issues:**
- Token invalid/expired
- Servers unreachable
- API response formats completely different from expectations

---

## 📞 **SUPPORT AREAS WHERE I NEED YOUR HELP**

### **1. UAT Documentation Analysis**
- **API endpoint URLs**: Verify the 3.6.174.212 IPs are correct
- **Request/response examples**: Compare actual vs expected formats
- **Authentication details**: Confirm Bearer token usage
- **Error handling**: What should 400/401/500 responses look like

### **2. Environment Configuration**
- **Token management**: Where should production tokens be stored
- **Environment detection**: How to distinguish UAT vs Production
- **Deployment considerations**: Any special headers/certificates needed

### **3. Business Logic Validation**
- **Customer creation flow**: Required vs optional fields
- **Document requirements**: Which document types are mandatory
- **Loan workflow**: What's the proper sequence of API calls

---

## 🏆 **SUCCESS CRITERIA**

### **Short Term (Today):**
- ✅ All 3 endpoints respond to connectivity tests
- ✅ Customer creation returns a valid customer ID
- ✅ Document upload works with created customer ID

### **Medium Term (This Week):**
- ✅ Full wizard flow works end-to-end with real API
- ✅ Error handling provides meaningful user feedback
- ✅ Performance is acceptable (under 5s per operation)

### **Long Term (Production Ready):**
- ✅ Secure token management in production
- ✅ Proper error recovery and retry logic
- ✅ Monitoring and alerting for API health

---

## 🤝 **HOW TO PROCEED**

1. **Run the connectivity test** to see current status
2. **Share the UAT token** and any API discrepancies you find
3. **Let me know** which areas you need the most help with
4. **I'll provide** targeted fixes based on real test results

**Ready to test! 🚀**