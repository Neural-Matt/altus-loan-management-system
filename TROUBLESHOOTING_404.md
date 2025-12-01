# 🔧 Troubleshooting 404 Errors

## ❌ Current Issue

You're getting **HTTP 404 errors** when testing the loan submission workflow. This means the API endpoints are not responding.

## 🔍 Root Cause

The backend server at **`3.6.174.212`** is either:
1. ❌ Not running
2. ❌ Not accessible from your network
3. ❌ The specific endpoints don't exist yet
4. ❌ Different port numbers or paths than documented

## 🧪 Diagnostic Steps

### Step 1: Test Backend Connectivity

Refresh your test page and click the **"Test Backend Connection"** button at the top. This will check:
- ✅ Can we reach the server at `3.6.174.212`?
- ✅ Which ports are responding?
- ✅ Are the proxy routes working?

### Step 2: Check With Backend Team

The backend team needs to confirm:

#### Required Information:
1. **Server Status**: Is the server at `3.6.174.212` running?
2. **Port Availability**: Are ports 5009-5013 open and accessible?
3. **Endpoint Existence**: Are these exact endpoints implemented?
   - `POST /API/LoanServices/SalariedLoanRequest` (Port 5010)
   - `POST /API/LoanServices/BusinessLoanRequest` (Port 5010)
   - `POST /API/DocumentServices/UploadLoanDocument` (Port 5013)
4. **CORS Headers**: Are CORS headers enabled on the backend?
5. **Authentication**: Is the Bearer token valid?

## 🔑 Current Configuration

### Backend Server
```
IP: 3.6.174.212
Ports: 5009, 5010, 5011, 5012, 5013
```

### Proxy Routes (Local Development)
```
/loanlist-api  → http://3.6.174.212:5009
/loan-api      → http://3.6.174.212:5010
/customer-api  → http://3.6.174.212:5011
/product-api   → http://3.6.174.212:5012
/document-api  → http://3.6.174.212:5013
```

### Bearer Token
```
0B9574489-7EC5-4373-94DA-871FDE07CF8EC3BEA3AF-C9B7-4DEA-AE35-EA1C626191C00314393C-29B4-4E60-8D11-595EDAAAC42F10
```

## 🛠️ Quick Tests You Can Run Now

### Test 1: Direct Server Access (PowerShell)

Test if the server is reachable:

```powershell
# Test Port 5010 (Loan Services)
Test-NetConnection -ComputerName 3.6.174.212 -Port 5010

# Test with curl
curl http://3.6.174.212:5010/API/LoanServices/SalariedLoanRequest `
  -Method POST `
  -Headers @{
    "Authorization" = "Bearer 0B9574489-7EC5-4373-94DA-871FDE07CF8EC3BEA3AF-C9B7-4DEA-AE35-EA1C626191C00314393C-29B4-4E60-8D11-595EDAAAC42F10"
    "Content-Type" = "application/json"
  } `
  -Body '{"body":{"FirstName":"John","LastName":"Doe"}}'
```

### Test 2: Check Proxy (Browser)

Open browser console on `http://localhost:3000` and run:

```javascript
fetch('http://localhost:3000/loan-api/API/LoanServices/SalariedLoanRequest', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer 0B9574489-7EC5-4373-94DA-871FDE07CF8EC3BEA3AF-C9B7-4DEA-AE35-EA1C626191C00314393C-29B4-4E60-8D11-595EDAAAC42F10',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    body: {
      FirstName: "John",
      LastName: "Doe",
      Email: "test@example.com"
    }
  })
})
.then(r => r.json())
.then(data => console.log('✅ Success:', data))
.catch(err => console.error('❌ Error:', err));
```

## ✅ Solutions

### Solution 1: Backend Team Action Required

**The backend team must:**

1. ✅ Start the backend services at `3.6.174.212`
2. ✅ Ensure ports 5009-5013 are open
3. ✅ Implement the required endpoints as per UAT documentation
4. ✅ Enable CORS headers:
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: POST, GET, OPTIONS
   Access-Control-Allow-Headers: Authorization, Content-Type
   ```
5. ✅ Validate the Bearer token is correct

### Solution 2: Use Mock Data (Temporary)

If backend isn't ready, we can create a mock server for testing:

**Option A: Use JSON Server**
```bash
npm install -g json-server
json-server --watch db.json --port 5010
```

**Option B: Use Mock Service Worker (MSW)**
```bash
npm install msw --save-dev
```

### Solution 3: Update Backend URL

If the backend is at a different location:

**Edit:** `src/setupProxy.js`

Change the target URLs from `3.6.174.212` to the actual backend server address.

## 📋 Checklist for Backend Team

Send this checklist to your backend team:

- [ ] Server `3.6.174.212` is running and accessible
- [ ] Ports 5009, 5010, 5011, 5012, 5013 are open
- [ ] Endpoints are implemented:
  - [ ] `POST /API/LoanServices/SalariedLoanRequest`
  - [ ] `POST /API/LoanServices/BusinessLoanRequest`
  - [ ] `POST /API/DocumentServices/UploadLoanDocument`
  - [ ] `POST /API/LoanListServices/GetLoanApplications`
  - [ ] `POST /API/CustomerServices/GetCustomer`
  - [ ] `POST /API/ProductServices/GetProducts`
  - [ ] `POST /API/LoanServices/GetLoanBalance`
  - [ ] All others in `BACKEND_API_INTEGRATION_REPORT.md`
- [ ] CORS headers are enabled
- [ ] Bearer token authentication is working
- [ ] Request format accepts `{"body": {...}}` wrapper
- [ ] Responses return `{"executionStatus": "SUCCESS", "outParams": {...}}`

## 🎯 Expected API Response Format

When backend is working correctly:

### Request
```json
POST /API/LoanServices/SalariedLoanRequest
Content-Type: application/json
Authorization: Bearer [TOKEN]

{
  "body": {
    "FirstName": "John",
    "LastName": "Doe",
    ...
  }
}
```

### Response
```json
{
  "executionStatus": "SUCCESS",
  "outParams": {
    "ApplicationNumber": "APP123456789",
    "Status": "Pending",
    "Message": "Loan application submitted successfully"
  }
}
```

## 📞 Next Steps

1. **Run Diagnostics**: Use the new "Test Backend Connection" button
2. **Share Results**: Send the diagnostic output to backend team
3. **Verify Backend**: Have backend team confirm server status
4. **Test Again**: Once backend confirms they're ready, retry the workflow

## 📄 Related Files

- **Proxy Config**: `src/setupProxy.js`
- **API Client**: `src/api/altusApi.ts`
- **Test Page**: `public/loan-workflow-test.html`
- **Backend Report**: `BACKEND_API_INTEGRATION_REPORT.md`
- **Quick Checklist**: `BACKEND_QUICK_CHECKLIST.md`

---

**Status**: ⚠️ Waiting for backend services to be available at `3.6.174.212`
