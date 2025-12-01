# 🚀 Altus API Quick Reference

## 📍 API Endpoints Cheat Sheet

```
┌─────────────────────────────────────────────────────────────┐
│  PORT 5009 - LOAN LIST SERVICES                             │
├─────────────────────────────────────────────────────────────┤
│  ✓ EMI Calculator                                           │
│  ✓ PBL Eligibility Status                                   │
│  ✓ Get Loans by Customer                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  PORT 5010 - LOAN SERVICES                                  │
├─────────────────────────────────────────────────────────────┤
│  ✓ Get Loan Balance                                         │
│  ✓ Get Loan Status                                          │
│  ✓ Get Loan Details                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  PORT 5011 - CUSTOMER SERVICES                              │
├─────────────────────────────────────────────────────────────┤
│  ✓ Create Retail Customer                                   │
│  ✓ Create Business Customer                                 │
│  ✓ Update Retail Customer                                   │
│  ✓ Update Business Customer                                 │
│  ✓ Get Customer Details                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  PORT 5012 - PRODUCT SERVICES                               │
├─────────────────────────────────────────────────────────────┤
│  ✓ Get Loan Product Details                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  PORT 5013 - LOAN REQUEST & DOCUMENTS  ⚠️ IMPORTANT!       │
├─────────────────────────────────────────────────────────────┤
│  ✓ Submit Salaried Loan Request                             │
│  ✓ Submit Business Loan Request                             │
│  ✓ Upload Loan Documents                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Authentication

```javascript
Authorization: Bearer 0B9574489-7EC5-4373-94DA-871FDE07CF8EC3BEA3AF-C9B7-4DEA-AE35-EA1C626191C00314393C-29B4-4E60-8D11-595EDAAAC42F10
```

---

## 📦 Request Format (ALL APIs)

```json
{
  "body": {
    /* your parameters here */
  }
}
```

---

## 🔄 Loan Application Workflow

```
Step 1: CREATE CUSTOMER (Port 5011)
   ↓
   Returns: CustomerID
   ↓
Step 2: SUBMIT LOAN REQUEST (Port 5013) ⚠️
   ↓
   Returns: ApplicationNumber
   ↓
Step 3: UPLOAD DOCUMENTS (Port 5013)
   ↓
   Returns: LRDocumentDetailsId
```

---

## ⚡ Quick Code Examples

### Create Customer
```typescript
await altusApi.createRetailCustomer({
  firstName: "John",
  lastName: "Doe",
  nrc: "123456/78/9",
  phoneNumber: "0977123456",
  emailAddress: "john@email.com",
  address: {
    street: "123 Main St",
    province: "Lusaka",
    city: "Lusaka",
    country: "Zambia"
  }
});
// Returns: { CustomerID: "RC20250550000000048" }
```

### Submit Loan Request ⚠️ PORT 5013!
```typescript
await altusApi.submitLoanRequest({
  customerId: "RC20250550000000048",
  identityNo: "123456/78/9",
  contactNo: "0977123456",
  emailId: "john@email.com",
  employeeNumber: "EMP001",
  designation: "Engineer",
  employmentType: "1",
  tenure: 12,
  gender: "Male",
  loanAmount: 20000,
  grossIncome: 10000,
  netIncome: 8000,
  deductions: 2000
});
// Returns: { ApplicationNumber: "LRQ20250880000000028" }
```

### Upload Document
```typescript
await altusApi.uploadLoanDocument(
  "LRQ20250880000000028",  // ApplicationNumber
  "18",                     // TypeOfDocument (18 = Payslip)
  fileObject                // File
);
// Returns: { LRDocumentDetailsId: "uuid" }
```

---

## 📋 Document Type Codes

```
6  = NRC ID (Client)
7  = NRC ID (Spouse)
18 = Payslip (Last 3 months)
29 = Employment Contract
17 = Passport
28 = Residence Permit
27 = Work Permit
3  = Business Registration
30 = Order Copies
```

---

## 🐛 Common Errors & Fixes

### ❌ "Invalid Loan Request"
**Cause:** Using wrong port (5010 instead of 5013)
**Fix:** Use port 5013 for loan requests

### ❌ "Customer ID not found"
**Cause:** Missing Step 1 (Create Customer)
**Fix:** Create customer first, save CustomerID

### ❌ "Application Number does not exist"
**Cause:** Missing Step 2 (Loan Request)
**Fix:** Submit loan request first, save ApplicationNumber

### ❌ CORS Errors
**Cause:** Direct API calls from browser
**Fix:** Use proxy in setupProxy.js

### ❌ "Please provide Valid [Field]"
**Cause:** Missing required field or wrong format
**Fix:** Check field names (case-sensitive!) and wrap in {"body": {...}}

---

## 🔍 Debug Logging

Look for these console messages:

```javascript
"Debug: Submitting loan request with UAT-formatted data:"
"Debug: UAT Salaried Loan Request (Port 5013):"
"Debug: Loan request successful, ApplicationNumber:"
"Debug: Loan request failed:"
```

---

## 🌐 Proxy Routes (Development)

```
/loanlist-api    → http://3.6.174.212:5009
/loan-api        → http://3.6.174.212:5010
/customer-api    → http://3.6.174.212:5011
/product-api     → http://3.6.174.212:5012
/document-api    → http://3.6.174.212:5013
```

---

## 📚 Full Documentation

- **Complete Guide:** `API_CONFIGURATION_GUIDE.md`
- **Implementation Details:** `API_IMPLEMENTATION_SUMMARY.md`
- **UAT Spec:** `Docs/UAT - Altus API Details.md`

---

## ⚠️ Critical Reminders

1. **Always use Port 5013 for Loan Requests** (not 5010!)
2. **Always wrap requests in `{body: {...}}`**
3. **Save CustomerID from Step 1** before Step 2
4. **Save ApplicationNumber from Step 2** before Step 3
5. **Use exact field names** (case-sensitive)

---

## 🎯 Field Name Quick Reference

| UI Field | API Field | Type |
|----------|-----------|------|
| customerId | CustomerId | string |
| identityNo | IdentityNo | string |
| phoneNumber | ContactNo | string |
| emailAddress | EmailId | string |
| employeeNumber | EmployeeNumber | string |
| designation | Designation | string |
| employmentType | EmploymentType | "1" or "2" |
| tenureMonths | Tenure | number |
| gender | Gender | "Male" or "Female" |
| loanAmount | LoanAmount | number |
| grossSalary | GrossIncome | number |
| netSalary | NetIncome | number |
| deductions | Deductions | number |

---

## 🚀 Production URL

**Live App:** https://applynow.altuszm.com

**SSL:** ✅ Let's Encrypt
**Auto-Renewal:** ✅ Enabled

---

*Quick Reference v1.0 - November 5, 2025*
