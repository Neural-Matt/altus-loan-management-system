# API Update Summary - Extended Loan Request Fields

## 📋 Overview
Updated the Altus Loan Management System API integration to include Bank Details, Next of Kin, and Reference/Referrer information in the loan request submission.

**Date**: December 1, 2025  
**Updated API Endpoint**: `POST http://3.6.174.212:5013/API/LoanRequest/Salaried`

---

## ✅ Changes Made

### 1. **API Request Structure Updated** (`altusApi.ts`)

Added the following new fields to the loan request body:

#### Address Information
- `PrimaryAddress` - Physical address
- `ProvinceName` - Province name
- `DistrictName` - City/District name
- `CountryName` - Country (default: "Zambia")
- `Postalcode` - Postal code

#### Employment Information (Enhanced)
- `EmployerName` - Employer's name
- `EmployeeNumber` - Payroll/Employee number
- `Designation` - Job title/occupation
- `EmployementType` - Employment type ("1" = Permanent, "2" = Contract)

#### Bank Details
- `FinancialInstitutionName` - Bank name
- `FinancialInstitutionBranchName` - Bank branch
- `AccountNumber` - Account number
- `AccountType` - Account type (Savings/Current/Fixed Deposit)

#### Reference/Referrer Details
- `ReferrerName` - Referrer's full name
- `ReferrerNRC` - Referrer's NRC
- `ReferrerContactNo` - Referrer's phone number
- `ReferrerPhysicalAddress` - Referrer's address
- `ReferrerRelationType` - Relationship to applicant

#### Next of Kin Details
- `KinName` - Next of kin full name (combined first + last)
- `KinNRC` - Next of kin NRC
- `KinRelationship` - Relationship to applicant
- `KinMobileNo` - Next of kin phone number
- `KinAddress` - Next of kin address
- `KinProvinceName` - Next of kin province
- `KinDistrictName` - Next of kin city/district
- `KinCountryName` - Next of kin country (default: "Zambia")

---

### 2. **Workflow Hook Updated** (`useUATWorkflow.ts`)

Updated `submitLoanApplication()` function to collect and send all new fields from the wizard form data:

```typescript
const loanRequestData = {
  TypeOfCustomer: "New",
  customerId: customerId || "",
  
  // Personal details
  firstName, middleName, lastName, dateOfBirth,
  identityNo, contactNo, emailId, gender,
  
  // Address
  primaryAddress, provinceName, districtName, countryName, postalcode,
  
  // Employment
  employerName, employeeNumber, designation, employmentType,
  
  // Loan
  tenure, loanAmount, grossIncome, netIncome, deductions,
  
  // Bank Details
  financialInstitutionName, financialInstitutionBranchName,
  accountNumber, accountType,
  
  // Reference
  referrerName, referrerNRC, referrerContactNo,
  referrerPhysicalAddress, referrerRelationType,
  
  // Next of Kin
  kinName, kinNRC, kinRelationship, kinMobileNo,
  kinAddress, kinProvinceName, kinDistrictName, kinCountryName
};
```

---

### 3. **Form UI Enhanced** (`CustomerStep.tsx`)

#### Next of Kin Section - Added Fields:
- City/District field
- Province field

#### Reference Section - Added Fields:
- NRC field
- Relationship field

---

### 4. **Data Models Updated**

#### `WizardDataContext.tsx`
```typescript
export interface NextOfKinInfo {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;          // NEW
  province?: string;      // NEW
  nrc?: string;
  nationality?: string;
  relationship?: string;
}

export interface ReferenceInfo {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  nrc?: string;           // NEW
  relationship?: string;  // NEW
}
```

#### `schemas.ts` - Validation Schema
Updated validation schemas to include new optional fields for Next of Kin and Reference.

---

## 🔄 Field Mapping Logic

The API integration uses intelligent field mapping with multiple fallback options:

```typescript
// Example: Bank Name
FinancialInstitutionName: data.FinancialInstitutionName || 
                          data.financialInstitutionName || 
                          data.bankName || ""

// Example: Next of Kin Name (combined)
KinName: data.KinName || 
         data.kinName || 
         (data.nextOfKin ? 
           `${data.nextOfKin.firstName || ''} ${data.nextOfKin.lastName || ''}`.trim() : 
         "")
```

This ensures compatibility with:
- Direct API field names (PascalCase)
- camelCase variations
- Form field names from wizard data
- Nested objects (nextOfKin, reference)

---

## 📊 Sample API Request

```json
{
  "body": {
    "TypeOfCustomer": "New",
    "CustomerId": "",
    "IdentityNo": "782349/32/4",
    "FirstName": "Regional Enterprises",
    "MiddleName": "R",
    "LastName": "Henry",
    "ContactNo": "23432423324",
    "EmailId": "reg@mail.com",
    "DateOfBirth": "07/01/1994 00:00:00",
    
    "PrimaryAddress": "No 4, A Block",
    "ProvinceName": "Lusaka",
    "DistrictName": "Lusaka",
    "CountryName": "Zambia",
    "Postalcode": "10101",
    
    "EmployeeNumber": "3478",
    "Designation": "Army",
    "EmployerName": "EMP0000006",
    "EmployementType": "1",
    
    "Gender": "Female",
    "Tenure": 5,
    "LoanAmount": 60000,
    "GrossIncome": 100000,
    "NetIncome": 100000,
    "Deductions": 0,
    
    "FinancialInstitutionName": "Indo Zambia Bank",
    "FinancialInstitutionBranchName": "Lusaka",
    "AccountNumber": "6475645",
    "AccountType": "Savings",
    
    "ReferrerName": "Kete",
    "ReferrerNRC": "603990/43/3",
    "ReferrerContactNo": "+4236789",
    "ReferrerPhysicalAddress": "5th Block",
    "ReferrerRelationType": "1",
    
    "KinName": "Liko",
    "KinNRC": "983183/92/2",
    "KinRelationship": "2",
    "KinMobileNo": "213123",
    "KinAddress": "2nd block",
    "KinProvinceName": "Lusaka",
    "KinDistrictName": "Lusaka",
    "KinCountryName": "Zambia"
  }
}
```

---

## 🧪 Testing Checklist

- [ ] Fill in all customer information including address
- [ ] Fill in employment details
- [ ] Fill in bank details (all 4 fields)
- [ ] Fill in Next of Kin details (including new city/province fields)
- [ ] Fill in Reference details (including new NRC/relationship fields)
- [ ] Submit loan application
- [ ] Verify console logs show all fields present
- [ ] Verify API response includes ApplicationNumber
- [ ] Check backend database for complete data

---

## 🔍 Debug Console Output

When submitting a loan, you'll see:

```
📋 Submitting loan request... {
  customerId: "(none - using form data)",
  identityNo: "123456/78/9",
  loanAmount: 50000,
  tenure: 12,
  hasPersonalDetails: true,
  hasAddressDetails: true,
  hasBankDetails: true,
  hasNextOfKin: true,
  hasReference: true
}
```

---

## 📝 Files Modified

1. **src/api/altusApi.ts** - Added all new fields to loan request body
2. **src/hooks/useUATWorkflow.ts** - Updated workflow to collect and send all fields
3. **src/components/wizard/steps/CustomerStep.tsx** - Added UI fields for Next of Kin city/province and Reference NRC/relationship
4. **src/components/wizard/WizardDataContext.tsx** - Updated interfaces
5. **src/validation/schemas.ts** - Updated validation schemas

---

## ✨ Benefits

1. **Complete Data Capture**: All required fields from API specification now collected
2. **Backward Compatible**: Existing code continues to work with fallback logic
3. **Type Safe**: TypeScript interfaces updated to reflect new fields
4. **User Friendly**: Form UI enhanced to collect additional information
5. **Debuggable**: Console logs show which sections are filled

---

## 🚀 Next Steps

1. **Rebuild Application**:
   ```bash
   npm run build
   ```

2. **Deploy to Production**:
   ```bash
   # Upload build to VPS
   scp altus-build.tar.gz root@72.60.187.1:/tmp/
   
   # Extract and deploy
   ssh root@72.60.187.1
   cd /tmp
   tar -xzf altus-build.tar.gz
   docker cp build/. altus-loan-container:/usr/share/nginx/html/
   docker exec altus-loan-container nginx -s reload
   ```

3. **Test on Production**:
   - Visit https://applynow.altuszm.com
   - Complete full application with all fields
   - Verify submission success

---

**Updated by**: GitHub Copilot  
**Date**: December 1, 2025  
**Version**: 2.0.0
