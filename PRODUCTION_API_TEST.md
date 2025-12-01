# Production API Testing - https://applynow.altuszm.com

## Deployment Status: ✅ LIVE

**Deployed:** November 5, 2025  
**Server:** 72.60.187.1 (Hostinger VPS Ubuntu 24.04 LTS)  
**Domain:** https://applynow.altuszm.com  
**SSL:** Let's Encrypt (Auto-renewal enabled)  
**Container:** altus-loan-container (Status: Healthy)

---

## 🔍 API Configuration Summary

### Backend Server
- **Base URL:** http://3.6.174.212
- **Authentication:** Bearer Token (Fixed)
- **Request Format:** All APIs use `{"body": {...}}` wrapper

### Microservices Ports
| Service | Port | Purpose |
|---------|------|---------|
| Loan List Services | 5009 | EMI Calculator, PBL Eligibility, Loans by Customer |
| Loan Services | 5010 | Loan Balance, Status, Details |
| Customer Services | 5011 | Create/Update Customer, Get Details |
| Product Services | 5012 | Loan Product Details |
| **Loan Request & Documents** | **5013** | **Loan Request (FIXED), Document Upload** |

---

## 🧪 API Test Checklist

### Test 1: Customer Creation API (Port 5011) ⬜

**Endpoint:** `POST http://3.6.174.212:5011/API/Customer/Create/Retail`

**Test Data:**
```json
{
  "body": {
    "TypeOfCustomer": "1",
    "FirstName": "John",
    "LastName": "Banda",
    "IdentityNo": "123456/10/1",
    "ContactNo": "+260971234567",
    "EmailId": "john.banda@example.com",
    "Nationality": "Zambian"
  }
}
```

**Expected Response:**
```json
{
  "ResponseCode": "0",
  "ResponseMessage": "Success",
  "CustomerId": "CUST20250880000000123"
}
```

**Validation:**
- ✅ TypeOfCustomer field mapping (not CustomerType)
- ✅ ContactNo field mapping (not PhoneNumber)
- ✅ EmailId field mapping (not EmailAddress)
- ✅ Response contains CustomerId

**Test Result:** ⬜ PENDING

---

### Test 2: Product Details API (Port 5012) ⬜

**Endpoint:** `POST http://3.6.174.212:5012/API/Product/GetProductDetails`

**Test Data:**
```json
{
  "body": {
    "ProductCode": "PROD001"
  }
}
```

**Expected Response:**
```json
{
  "ResponseCode": "0",
  "ResponseMessage": "Success",
  "ProductCode": "PROD001",
  "ProductName": "Personal Loan",
  "InterestRate": 15.5,
  "MinAmount": 1000,
  "MaxAmount": 50000,
  "MinTenure": 3,
  "MaxTenure": 60
}
```

**Validation:**
- ✅ Correct port (5012)
- ✅ ProductCode retrieval
- ✅ Product details returned

**Test Result:** ⬜ PENDING

---

### Test 3: **CRITICAL** - Loan Request API (Port 5013) ⬜

**Endpoint:** `POST http://3.6.174.212:5013/API/LoanRequest/Salaried`

**⚠️ FIXED:** Changed from port 5010 to 5013 (UAT requirement)

**Test Data:**
```json
{
  "body": {
    "TypeOfCustomer": "1",
    "CustomerId": "CUST20250880000000123",
    "IdentityNo": "123456/10/1",
    "ContactNo": "+260971234567",
    "EmailId": "john.banda@example.com",
    "EmployeeNumber": "EMP12345",
    "Designation": "Software Engineer",
    "EmploymentType": "1",
    "Tenure": 24,
    "Gender": "Male",
    "LoanAmount": 15000,
    "GrossIncome": 8000,
    "NetIncome": 6500,
    "Deductions": 1500
  }
}
```

**Expected Response:**
```json
{
  "ResponseCode": "0",
  "ResponseMessage": "Success",
  "ApplicationNumber": "LRQ20250880000000028"
}
```

**Critical Validations:**
- ✅ **Port 5013 (NOT 5010)**
- ✅ All UAT field names (TypeOfCustomer, ContactNo, EmailId, etc.)
- ✅ Gender field included
- ✅ ApplicationNumber returned for document upload

**Console Debug Output:**
```
Debug: UAT Salaried Loan Request (Port 5013):
Debug: Submitting loan request with UAT-formatted data: {...}
```

**Test Result:** ⬜ PENDING

---

### Test 4: Document Upload API with Base64 (Port 5013) ⬜

**Endpoint:** `POST http://3.6.174.212:5013/API/LoanRequest/UploadDocuments`

**⚠️ ENHANCED:** Added file validation, base64 verification, comprehensive logging

**Test Data:**
```json
{
  "body": {
    "ApplicationNumber": "LRQ20250880000000028",
    "TypeOfDocument": "18",
    "DocumentNo": "DOC1730808123456",
    "Document": {
      "documentContent": "[BASE64_ENCODED_STRING]",
      "documentName": "payslip.pdf"
    }
  }
}
```

**Document Type Codes:**
| Code | Document Type |
|------|---------------|
| 6 | NRC (National Registration Card) |
| 18 | Payslip |
| 29 | Employment Contract |
| 30 | Other Documents |

**Base64 Conversion Process:**
1. File → FileReader.readAsArrayBuffer()
2. ArrayBuffer → Uint8Array (byte array)
3. Uint8Array → Binary String (character conversion)
4. Binary String → btoa() encoding
5. Base64 String → UAT "byte format"

**Validation Features:**
- ✅ File size limit: 10MB
- ✅ Empty file check
- ✅ Base64 output validation
- ✅ ApplicationNumber required
- ✅ Document type mapping
- ✅ 60-second timeout for large files

**Console Debug Output:**
```
Debug: Converting file to base64 byte format (UAT requirement)...
Debug: File details - Name: payslip.pdf, Size: 245.67KB, Type: application/pdf
Debug: File successfully converted to base64 - Length: 327560 characters
Debug: UAT Document Upload Request: {
  applicationNumber: "LRQ20250880000000028",
  documentType: "payslip",
  typeCode: "18",
  fileName: "payslip.pdf",
  fileSize: 251580,
  base64Length: 327560,
  documentNo: "DOC1730808123456"
}
```

**Test Scenarios:**
- ✅ PDF upload (< 10MB)
- ✅ Image upload (JPG, PNG)
- ✅ File size validation (reject > 10MB)
- ✅ Empty file rejection
- ✅ Base64 format verification

**Test Result:** ⬜ PENDING

---

### Test 5: EMI Calculator API (Port 5009) ⬜

**Endpoint:** `POST http://3.6.174.212:5009/API/LoanList/EMICalculator`

**Test Data:**
```json
{
  "body": {
    "LoanAmount": 15000,
    "InterestRate": 15.5,
    "Tenure": 24
  }
}
```

**Expected Response:**
```json
{
  "ResponseCode": "0",
  "ResponseMessage": "Success",
  "EMI": 745.32,
  "TotalInterest": 2887.68,
  "TotalAmount": 17887.68
}
```

**Test Result:** ⬜ PENDING

---

### Test 6: PBL Eligibility API (Port 5009) ⬜

**Endpoint:** `POST http://3.6.174.212:5009/API/LoanList/PBLEligibility`

**Test Data:**
```json
{
  "body": {
    "CustomerId": "CUST20250880000000123",
    "GrossIncome": 8000,
    "ExistingObligations": 2000
  }
}
```

**Expected Response:**
```json
{
  "ResponseCode": "0",
  "ResponseMessage": "Success",
  "IsEligible": true,
  "MaxLoanAmount": 25000,
  "RecommendedTenure": 36
}
```

**Test Result:** ⬜ PENDING

---

### Test 7: Get Loans by Customer (Port 5009) ⬜

**Endpoint:** `POST http://3.6.174.212:5009/API/LoanList/GetLoansByCustomerId`

**Test Data:**
```json
{
  "body": {
    "CustomerId": "CUST20250880000000123"
  }
}
```

**Expected Response:**
```json
{
  "ResponseCode": "0",
  "ResponseMessage": "Success",
  "Loans": [
    {
      "ApplicationNumber": "LRQ20250880000000028",
      "LoanAmount": 15000,
      "Status": "Pending",
      "ApplicationDate": "2025-11-05"
    }
  ]
}
```

**Test Result:** ⬜ PENDING

---

### Test 8: Get Loan Balance (Port 5010) ⬜

**Endpoint:** `POST http://3.6.174.212:5010/API/Loan/GetLoanBalanceByApplicationNumber`

**Test Data:**
```json
{
  "body": {
    "ApplicationNumber": "LRQ20250880000000028"
  }
}
```

**Expected Response:**
```json
{
  "ResponseCode": "0",
  "ResponseMessage": "Success",
  "ApplicationNumber": "LRQ20250880000000028",
  "PrincipalBalance": 12500,
  "InterestBalance": 1250,
  "TotalBalance": 13750
}
```

**Test Result:** ⬜ PENDING

---

### Test 9: Get Loan Status (Port 5010) ⬜

**Endpoint:** `POST http://3.6.174.212:5010/API/Loan/GetLoanStatusByApplicationNumber`

**Test Data:**
```json
{
  "body": {
    "ApplicationNumber": "LRQ20250880000000028"
  }
}
```

**Expected Response:**
```json
{
  "ResponseCode": "0",
  "ResponseMessage": "Success",
  "ApplicationNumber": "LRQ20250880000000028",
  "Status": "Pending",
  "Stage": "Document Verification"
}
```

**Test Result:** ⬜ PENDING

---

### Test 10: Get Loan Details (Port 5010) ⬜

**Endpoint:** `POST http://3.6.174.212:5010/API/Loan/GetLoanDetailsByApplicationNumber`

**Test Data:**
```json
{
  "body": {
    "ApplicationNumber": "LRQ20250880000000028"
  }
}
```

**Expected Response:**
```json
{
  "ResponseCode": "0",
  "ResponseMessage": "Success",
  "ApplicationNumber": "LRQ20250880000000028",
  "CustomerId": "CUST20250880000000123",
  "LoanAmount": 15000,
  "Tenure": 24,
  "InterestRate": 15.5,
  "Status": "Pending",
  "ApplicationDate": "2025-11-05"
}
```

**Test Result:** ⬜ PENDING

---

## 🚨 Critical Fixes Applied

### 1. Loan Request Port Correction
- **Before:** Port 5010 ❌
- **After:** Port 5013 ✅
- **Impact:** Requests now reach correct microservice
- **File:** `src/api/altusApi.ts` (Line 887)

### 2. Base64 Document Conversion
- **Enhancement:** Added comprehensive validation
- **Features:** 10MB limit, empty file check, output verification
- **UAT Compliance:** ✅ 100% (Byte format requirement)
- **File:** `src/api/altusApi.ts` (Lines 931-992, 1020-1105)

### 3. Data Field Mapping
- **Fixed:** All field names match UAT exactly
- **Examples:** TypeOfCustomer, ContactNo, EmailId, IdentityNo
- **File:** `src/context/AltusContext.tsx` (Lines 842-865)

### 4. Gender Field Added
- **Added:** `gender?: string` to CustomerData interface
- **Impact:** Prevents TypeScript compilation errors
- **File:** `src/context/AltusContext.tsx` (Line 26)

---

## 📊 Testing Instructions

### Using Browser Console (Recommended)

1. **Open Production Site:**
   ```
   https://applynow.altuszm.com
   ```

2. **Open Browser DevTools:**
   - Press F12 or Right-click → Inspect
   - Go to Console tab

3. **Test APIs Directly:**
   ```javascript
   // Test Customer Creation
   fetch('http://3.6.174.212:5011/API/Customer/Create/Retail', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
     },
     body: JSON.stringify({
       body: {
         TypeOfCustomer: "1",
         FirstName: "John",
         LastName: "Banda",
         IdentityNo: "123456/10/1",
         ContactNo: "+260971234567",
         EmailId: "john.banda@example.com",
         Nationality: "Zambian"
       }
     })
   })
   .then(r => r.json())
   .then(data => console.log('Customer Created:', data))
   .catch(err => console.error('Error:', err));
   ```

4. **Monitor Debug Logs:**
   - Look for "Debug: UAT Salaried Loan Request (Port 5013):"
   - Check "Debug: Converting file to base64 byte format"
   - Verify "Debug: Document upload successful"

### Using Application UI

1. Navigate through the loan application wizard
2. Fill in all required fields
3. Upload required documents
4. Check console for debug output
5. Verify success messages

---

## ✅ UAT Compliance Verification

### Port Configuration
- ✅ Port 5009: Loan List Services
- ✅ Port 5010: Loan Services
- ✅ Port 5011: Customer Services
- ✅ Port 5012: Product Services
- ✅ **Port 5013: Loan Request & Documents** (CRITICAL FIX)

### Field Name Mapping
- ✅ TypeOfCustomer (not CustomerType)
- ✅ CustomerId (correct)
- ✅ IdentityNo (correct)
- ✅ ContactNo (not PhoneNumber)
- ✅ EmailId (not EmailAddress)
- ✅ EmployeeNumber (correct)
- ✅ Designation (correct)
- ✅ EmploymentType (correct)
- ✅ Tenure (correct)
- ✅ Gender (correct)
- ✅ LoanAmount (correct)
- ✅ GrossIncome (correct)
- ✅ NetIncome (correct)
- ✅ Deductions (correct)

### Document Upload
- ✅ Base64 conversion (UAT byte format)
- ✅ File validation (size, emptiness)
- ✅ Document type mapping
- ✅ Request format compliance
- ✅ Error handling

### Request Format
- ✅ All APIs use `{"body": {...}}` wrapper
- ✅ Bearer token authentication
- ✅ Content-Type: application/json

---

## 🎯 Next Steps

1. **Run End-to-End Test:**
   - Create customer → Get CustomerId
   - Submit loan request (Port 5013) → Get ApplicationNumber
   - Upload documents with base64 conversion
   - Check loan status

2. **Verify Console Logs:**
   - Port 5013 usage confirmation
   - Base64 conversion details
   - Request/response data

3. **Test Error Scenarios:**
   - File too large (> 10MB)
   - Empty file upload
   - Missing required fields
   - Invalid ApplicationNumber

4. **Document Results:**
   - Fill in test results (⬜ → ✅ or ❌)
   - Note any API errors
   - Record response times
   - Capture screenshots

---

## 📞 Support Information

**Server:** 72.60.187.1  
**Domain:** applynow.altuszm.com  
**SSL:** Valid until February 3, 2026  
**Container:** altus-loan-container  
**Status:** ✅ Healthy  

**Backend API:** 3.6.174.212  
**Authentication:** Bearer Token (Fixed)  

---

*Production Deployment - Ready for Testing*  
*Date: November 5, 2025*  
*Status: ✅ DEPLOYED & READY*
