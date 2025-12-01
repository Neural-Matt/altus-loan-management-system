# Quick Reference - Backend API Checklist

## ⚡ IMMEDIATE ACTION REQUIRED

### 🔥 **Critical Issues Blocking Integration**

1. **CORS Headers Missing** ❌
   ```
   ERROR: Access-Control-Allow-Origin header not present
   FIX: Add CORS headers to all 5 services (ports 5009-5013)
   ```

2. **Port 5009 Service Status** ❓
   ```
   STATUS: Unknown - new service per UAT documentation
   ENDPOINTS: 3 new APIs (GetLoansByCustomer, EMICalculator, PBLEligibilityStatus)
   ```

---

## 🎯 **Ready-to-Test Endpoints (15 Total)**

### Port 5009 - NEW SERVICE ⭐
- `POST /API/LoanList/GetLoansByCustomer`
- `POST /API/LoanList/EMICalculator` 
- `POST /API/LoanList/PBLEligibilityStatus`

### Port 5010 - Loan Services
- `POST /API/LoanServices/GetLoanBalance` ✅
- `POST /API/LoanServices/GetLoanStatus` ✅
- `POST /API/LoanServices/GetLoanDetails` ✅
- `POST /API/LoanRequestServices/SubmitLoanRequest` ✅
- `POST /API/LoanRequestServices/SubmitBusinessLoanRequest` ⭐ NEW

### Port 5011 - Customer Services  
- `POST /API/CustomerServices/CreateRetailCustomer` ✅
- `POST /API/CustomerServices/CreateBusinessCustomer` ✅
- `POST /API/CustomerServices/GetCustomerDetails` ✅

### Port 5012 - Product Services
- `POST /API/LoanProductServices/GetLoanProductDetails` ✅

### Port 5013 - Document Services
- `POST /API/LoanRequestServices/UploadLoanDocument` ✅

---

## 🔧 **Required CORS Headers**
Add to ALL services (copy-paste ready):
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With
Access-Control-Max-Age: 86400
```

---

## 🔑 **Authentication Token** 
```
Bearer 0B9574489-7EC5-4373-94DA-871FDE07CF8EC3BEA3AF-C9B7-4DEA-AE35-EA1C626191C00314393C-29B4-4E60-8D11-595EDAAAC42F10
```

---

## 📋 **Test Command (Copy & Run)**
```bash
# Test Port 5010 (should work if CORS enabled)
curl -X POST http://3.6.174.212:5010/API/LoanServices/GetLoanBalance \
  -H "Authorization: Bearer 0B9574489-7EC5-4373-94DA-871FDE07CF8EC3BEA3AF-C9B7-4DEA-AE35-EA1C626191C00314393C-29B4-4E60-8D11-595EDAAAC42F10" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"body": {"ApplicationNumber": "TEST123"}}'

# Test NEW Port 5009 (verify service exists)
curl -X POST http://3.6.174.212:5009/API/LoanList/GetLoansByCustomer \
  -H "Authorization: Bearer 0B9574489-7EC5-4373-94DA-871FDE07CF8EC3BEA3AF-C9B7-4DEA-AE35-EA1C626191C00314393C-29B4-4E60-8D11-595EDAAAC42F10" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"body": {"CustomerId": "CUST123"}}'
```

---

## ✅ **Once Fixed, Test Here:**
- **Frontend Test Page:** http://localhost:3000/proxy-test.html
- **Should show:** Real API responses instead of CORS errors
- **Expected:** 200 OK or proper error responses (not CORS blocks)

---

## 📞 **Status Checklist for Backend Team**

- [ ] Port 5009 service deployed and accessible
- [ ] CORS headers added to all 5 services  
- [ ] Bearer token validation working
- [ ] All 15 endpoints responding (even if with errors)
- [ ] OPTIONS preflight requests handled
- [ ] Ready for frontend integration testing

**ETA for fixes:** _______________  
**Contact for testing:** _______________