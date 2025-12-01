# Altus API Configuration Guide

## Overview
This document provides a comprehensive guide to all Altus API endpoints, their configurations, and the correct data flow for loan applications.

## API Architecture

The Altus system uses a microservices architecture with 5 separate services running on different ports:

| Service | Port | Base URL | Purpose |
|---------|------|----------|---------|
| Loan Services | 5010 | http://3.6.174.212:5010 | Loan Balance, Status, Details |
| Customer Services | 5011 | http://3.6.174.212:5011 | Customer CRUD operations |
| Product Services | 5012 | http://3.6.174.212:5012 | Loan Product Details |
| **Loan Request & Document** | **5013** | **http://3.6.174.212:5013** | **Loan Request Submission & Document Upload** |
| Loan List Services | 5009 | http://3.6.174.212:5009 | EMI Calculator, Eligibility, Lists |

## Authentication

All APIs use Bearer Token authentication:
```
Authorization: Bearer 0B9574489-7EC5-4373-94DA-871FDE07CF8EC3BEA3AF-C9B7-4DEA-AE35-EA1C626191C00314393C-29B4-4E60-8D11-595EDAAAC42F10
```

## Request Format

**All API requests must wrap the payload in a `body` object:**

```json
{
  "body": {
    // actual request parameters here
  }
}
```

## Complete Loan Application Workflow

### Step 1: Create Customer
**Endpoint:** `POST http://3.6.174.212:5011/API/CustomerServices/RetailCustomer`

**Request:**
```json
{
  "body": {
    "Command": "Create",
    "FirstName": "John",
    "LastName": "Doe",
    "NRCNumber": "123456/78/9",
    "ContactNo": "0977123456",
    "EmailID": "john.doe@email.com",
    "PrimaryAddress": "123 Main St",
    "ProvinceName": "Lusaka",
    "DistrictName": "Lusaka",
    "CountryName": "Zambia",
    "GenderName": "Male",
    "DOB": "01/01/1990 00:00:00",
    "Title": "Mr",
    "CustomerStatus": "Active",
    "NRCIssueDate": "01/01/2010 00:00:00",
    "UpdatedBy": "system",
    "BranchName": "Lusaka",
    "FinancialInstitutionName": "Indo Zambia Bank",
    "FinancialInstitutionBranchName": "Lusaka",
    "AccountNumber": "1234567890",
    "AccountType": "Savings"
  }
}
```

**Response:**
```json
{
  "executionStatus": "Success",
  "executionMessage": "Retail Customer Created",
  "instanceId": "uuid",
  "outParams": {
    "CustomerID": "RC20250550000000048"
  }
}
```

**Save the `CustomerID` from response for next step!**

---

### Step 2: Submit Loan Request
**Endpoint:** `POST http://3.6.174.212:5013/API/LoanRequest/Salaried`

⚠️ **IMPORTANT: Use PORT 5013, NOT 5010!**

**Request:**
```json
{
  "body": {
    "TypeOfCustomer": "Existing",
    "CustomerId": "RC20250550000000048",
    "IdentityNo": "123456/78/9",
    "ContactNo": "0977123456",
    "EmailId": "john.doe@email.com",
    "EmployeeNumber": "EMP001",
    "Designation": "Engineer",
    "EmploymentType": "1",
    "Tenure": 12,
    "Gender": "Male",
    "LoanAmount": 20000,
    "GrossIncome": 10000,
    "NetIncome": 8000,
    "Deductions": 2000
  }
}
```

**Field Definitions:**
- `TypeOfCustomer`: "New" or "Existing"
- `EmploymentType`: "1" = Permanent, "2" = Contract
- `Tenure`: Loan tenure in months
- All amounts in decimal format

**Response:**
```json
{
  "executionStatus": "Success",
  "executionMessage": "Loan Request has been Processed. Please proceed with Document Upload",
  "instanceId": "uuid",
  "outParams": {
    "ApplicationNumber": "LRQ20250880000000028"
  }
}
```

**Save the `ApplicationNumber` from response for document upload!**

---

### Step 3: Upload Documents
**Endpoint:** `POST http://3.6.174.212:5013/API/LoanRequest/LoanRequestDocuments`

**Request:**
```json
{
  "body": {
    "ApplicationNumber": "LRQ20250880000000028",
    "TypeOfDocument": "18",
    "DocumentNo": "DOC001",
    "Document": {
      "documentContent": "base64_encoded_file_content",
      "documentName": "payslip.pdf"
    }
  }
}
```

**Document Type Codes:**
- `6` - NRC ID (Client)
- `7` - NRC ID (Spouse)
- `18` - Payslip (Last 3 months)
- `29` - Employment Contract
- `17` - Passport
- `28` - Residence Permit
- `27` - Work Permit
- `3` - Business Registration Certificate
- `30` - Order Copies

**Document Upload Notes:**
- File must be converted to base64 byte format
- Multiple documents can be uploaded by calling this endpoint multiple times
- Each upload returns a unique `LRDocumentDetailsId`

**Response:**
```json
{
  "executionStatus": "Success",
  "executionMessage": "Document Saved Successfully",
  "instanceId": "uuid",
  "outParams": {
    "LRDocumentDetailsId": "03297472-7f54-4a53-923b-24654005500c"
  }
}
```

---

## Other Available APIs

### EMI Calculator
**Endpoint:** `POST http://3.6.174.212:5009/API/LoanList/EMICalculator`

```json
{
  "body": {
    "LoanType": "1",
    "ProductCode": "COPL",
    "EmployerID": "EMP0000004",
    "LoanAmount": "20000",
    "LoanTenure": "6"
  }
}
```

### Get Loan Balance
**Endpoint:** `POST http://3.6.174.212:5010/API/LoanServices/GetLoanBalance`

```json
{
  "body": {
    "LoanId": "000005276"
  }
}
```

### Get Loan Status
**Endpoint:** `POST http://3.6.174.212:5010/API/LoanServices/GetLoanStatus`

```json
{
  "body": {
    "LoanId": "000005276"
  }
}
```

### Get Loan Details
**Endpoint:** `POST http://3.6.174.212:5010/API/LoanServices/GetLoanDetails`

```json
{
  "body": {
    "LoanId": "000005276"
  }
}
```

### Get Customer Details
**Endpoint:** `POST http://3.6.174.212:5011/API/CustomerServices/GetCustomerDetails`

```json
{
  "body": {
    "IdentityNo": "123456/78/9"
  }
}
```

### Get Loan Product Details
**Endpoint:** `POST http://3.6.174.212:5012/API/GetLoanProducts`

```json
{
  "body": {
    "productCode": "COPL",
    "employerId": "EMP0000004"
  }
}
```

### PBL Loan Eligibility
**Endpoint:** `POST http://3.6.174.212:5009/API/LoanList/PBLEligibilityStatus`

```json
{
  "body": {
    "DateOfBirth": "12/31/1999 15:50:09",
    "ProductCode": "GRZP",
    "EmployerID": "EMP0000004",
    "EmploymentType": "1",
    "LoanAmount": "20000",
    "LoanTenure": "16",
    "BasicPay": 1000,
    "GrossIncome": 5000,
    "NetIncome": 4900,
    "Deductions": 100
  }
}
```

### Get Loans by Customer
**Endpoint:** `POST http://3.6.174.212:5009/API/LoanList/GetLoansByCustomer`

```json
{
  "body": {
    "CustomerId": "RC20250550000000048"
  }
}
```

---

## Error Handling

All API responses follow this structure:

**Success:**
```json
{
  "executionStatus": "Success",
  "executionMessage": "Success message",
  "instanceId": "unique-id",
  "outParams": { /* response data */ },
  "gridParams": null,
  "docParams": null
}
```

**Failure:**
```json
{
  "executionStatus": "Failure",
  "executionMessage": "Error message",
  "instanceId": "unique-id",
  "outParams": { /* partial/null data */ },
  "gridParams": null,
  "docParams": null
}
```

---

## Proxy Configuration

For local development, the React app uses proxy middleware to avoid CORS issues:

```javascript
// setupProxy.js
module.exports = function(app) {
  // Port 5009 - Loan List Services
  app.use('/loanlist-api', proxy('http://3.6.174.212:5009'));
  
  // Port 5010 - Loan Services
  app.use('/loan-api', proxy('http://3.6.174.212:5010'));
  
  // Port 5011 - Customer Services
  app.use('/customer-api', proxy('http://3.6.174.212:5011'));
  
  // Port 5012 - Product Services
  app.use('/product-api', proxy('http://3.6.174.212:5012'));
  
  // Port 5013 - Loan Request & Document Services
  app.use('/document-api', proxy('http://3.6.174.212:5013'));
};
```

---

## Data Mapping Summary

### From UI Form → API Request

| UI Field | API Field | Required | Notes |
|----------|-----------|----------|-------|
| First Name | FirstName | Yes | - |
| Last Name | LastName | Yes | - |
| NRC Number | NRCNumber, IdentityNo | Yes | Used in both Customer & Loan Request |
| Phone Number | ContactNo | Yes | Format: 09XXXXXXXX |
| Email | EmailID, EmailId | Yes | Valid email format |
| Gender | GenderName, Gender | Yes | "Male" or "Female" |
| Date of Birth | DOB, DateOfBirth | Yes | Format: "MM/DD/YYYY HH:MM:SS" |
| Employee Number | EmployeeNumber | Yes (Loan) | - |
| Designation | Designation | No | Job title |
| Loan Amount | LoanAmount | Yes | Decimal |
| Loan Tenure | Tenure | Yes | Integer (months) |
| Gross Income | GrossIncome | Yes (Loan) | Decimal |
| Net Income | NetIncome | Yes (Loan) | Decimal |
| Deductions | Deductions | No | Decimal |

---

## Common Issues & Solutions

### Issue: "Invalid Loan Request" or No Response
**Solution:** Ensure you're using PORT 5013 for loan request, not 5010.

### Issue: "Customer ID not found"
**Solution:** Complete Step 1 (Create Customer) before Step 2 (Loan Request). Save the `CustomerID` from the response.

### Issue: "Application Number does not exist"
**Solution:** Complete Step 2 (Loan Request) before Step 3 (Document Upload). Save the `ApplicationNumber` from the response.

### Issue: CORS Errors
**Solution:** Use the proxy configuration in `setupProxy.js` for local development.

### Issue: "Please provide Valid [Field]"
**Solution:** Check that all required fields are present and in the correct format. Ensure the request is wrapped in `{"body": {...}}`.

---

## Testing

Use the provided test files:
- `loan-workflow-test.html` - Complete workflow test
- `proxy-test.html` - API endpoint test
- `api-test.js` - Backend API test

---

*Last Updated: November 5, 2025*
*UAT API Documentation Version: 2.0*
