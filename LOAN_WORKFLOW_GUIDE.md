# 🚀 Loan Submission Workflow - Step 1 & 2 Guide

## Overview

This guide demonstrates the complete 2-step loan submission workflow:

1. **Step 1**: Submit a loan request (Salaried or Business)
2. **Step 2**: Use the returned `ApplicationNumber` to upload documents

---

## 🎯 Quick Test

### Option 1: HTML Test Page (Recommended)

Open in your browser while `localhost:3000` is running:

```
http://localhost:3000/loan-workflow-test.html
```

**Features:**
- ✅ Visual workflow tracker
- ✅ One-click complete workflow execution
- ✅ Individual step testing
- ✅ Real-time console output
- ✅ Application number display

### Option 2: TypeScript Module

Import and use in your React components:

```typescript
import { executeCompleteWorkflow, testSalariedLoanSubmission } from './test/loanSubmissionFlow';

// Complete workflow
const result = await executeCompleteWorkflow('salaried');
console.log('Application Number:', result.applicationNumber);

// Or run steps individually
const step1 = await testSalariedLoanSubmission();
const appNumber = step1.applicationNumber;
```

---

## 📋 Workflow Details

### Step 1: Submit Loan Request

#### Salaried Loan API

**Endpoint:** `POST /loan-api/API/LoanServices/SalariedLoanRequest`

**Sample Request:**
```json
{
  "body": {
    "FirstName": "John",
    "LastName": "Doe",
    "Email": "john.doe@example.com",
    "PhoneNumber": "1234567890",
    "NationalID": "12345678",
    "DateOfBirth": "1990-01-15",
    "Gender": "Male",
    "MaritalStatus": "Single",
    "EmployerName": "ABC Corporation",
    "JobTitle": "Software Engineer",
    "MonthlyIncome": 150000,
    "EmploymentDuration": 36,
    "LoanAmount": 500000,
    "LoanTerm": 12,
    "LoanPurpose": "Personal",
    "ResidentialAddress": "123 Main Street, Nairobi",
    "County": "Nairobi",
    "NextOfKinName": "Jane Doe",
    "NextOfKinPhone": "0987654321",
    "Relationship": "Sister"
  }
}
```

**Sample Response:**
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

#### Business Loan API

**Endpoint:** `POST /loan-api/API/LoanServices/BusinessLoanRequest`

**Sample Request:**
```json
{
  "body": {
    "FirstName": "Jane",
    "LastName": "Smith",
    "Email": "jane.smith@example.com",
    "PhoneNumber": "0712345678",
    "NationalID": "87654321",
    "DateOfBirth": "1985-05-20",
    "Gender": "Female",
    "MaritalStatus": "Married",
    "BusinessName": "Smith Enterprises Ltd",
    "BusinessType": "Retail",
    "BusinessRegistrationNumber": "BUS/2020/12345",
    "YearsInBusiness": 5,
    "MonthlyRevenue": 800000,
    "MonthlyExpenses": 500000,
    "LoanAmount": 1000000,
    "LoanTerm": 24,
    "LoanPurpose": "Business Expansion",
    "BusinessAddress": "456 Commerce Street, Mombasa",
    "County": "Mombasa",
    "NextOfKinName": "John Smith",
    "NextOfKinPhone": "0798765432",
    "Relationship": "Spouse"
  }
}
```

**Sample Response:**
```json
{
  "executionStatus": "SUCCESS",
  "outParams": {
    "ApplicationNumber": "APP987654321",
    "Status": "Pending",
    "Message": "Business loan application submitted successfully"
  }
}
```

---

### 🔑 Extracting the Application Number

The `ApplicationNumber` is found in the response:

```typescript
// From the API response
const applicationNumber = response.outParams?.ApplicationNumber;
```

**⚠️ Critical:** Save this `ApplicationNumber` - it's required for Step 2!

---

### Step 2: Upload Documents

**Endpoint:** `POST /document-api/API/DocumentServices/UploadLoanDocument`

**Content-Type:** `multipart/form-data`

**FormData Structure:**
```javascript
const formData = new FormData();
formData.append('ApplicationNumber', 'APP123456789'); // From Step 1
formData.append('FileName', fileObject); // Actual File object
```

**Sample Request (cURL):**
```bash
curl -X POST "http://localhost:3000/document-api/API/DocumentServices/UploadLoanDocument" \
  -H "Authorization: Bearer 0B9574489-7EC5-4373-94DA-871FDE07CF8EC3BEA3AF-C9B7-4DEA-AE35-EA1C626191C00314393C-29B4-4E60-8D11-595EDAAAC42F10" \
  -F "ApplicationNumber=APP123456789" \
  -F "FileName=@/path/to/document.pdf"
```

**Sample Response:**
```json
{
  "executionStatus": "SUCCESS",
  "outParams": {
    "DocumentID": "DOC123456",
    "Status": "Uploaded",
    "Message": "Document uploaded successfully"
  }
}
```

---

## 💻 Code Examples

### Complete Workflow (TypeScript)

```typescript
import { submitLoanRequest, uploadLoanDocument } from './api/altusApi';

async function completeLoanSubmissionFlow() {
  try {
    // Step 1: Submit loan request
    const loanData = {
      FirstName: "John",
      LastName: "Doe",
      // ... rest of loan data
    };
    
    const loanResponse = await submitLoanRequest(loanData);
    console.log('Loan submitted:', loanResponse);
    
    // Extract application number
    const applicationNumber = loanResponse.outParams?.ApplicationNumber;
    
    if (!applicationNumber) {
      throw new Error('ApplicationNumber not received from API');
    }
    
    console.log('✅ Application Number:', applicationNumber);
    
    // Step 2: Upload document using the application number
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    const file = fileInput.files![0];
    
    const uploadResponse = await uploadLoanDocument(applicationNumber, file);
    console.log('Document uploaded:', uploadResponse);
    
    return {
      success: true,
      applicationNumber,
      loanResponse,
      uploadResponse
    };
    
  } catch (error) {
    console.error('Workflow error:', error);
    throw error;
  }
}
```

### React Component Example

```typescript
import React, { useState } from 'react';
import { submitLoanRequest, uploadLoanDocument } from '../api/altusApi';

export const LoanSubmissionComponent: React.FC = () => {
  const [applicationNumber, setApplicationNumber] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmitLoan = async (loanData: any) => {
    setLoading(true);
    try {
      const response = await submitLoanRequest(loanData);
      const appNum = response.outParams?.ApplicationNumber;
      
      if (appNum) {
        setApplicationNumber(appNum);
        alert(`✅ Loan submitted! Application Number: ${appNum}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Failed to submit loan');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = async (file: File) => {
    if (!applicationNumber) {
      alert('❌ Please submit a loan request first');
      return;
    }

    setLoading(true);
    try {
      const response = await uploadLoanDocument(applicationNumber, file);
      alert('✅ Document uploaded successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {applicationNumber && (
        <div className="app-number-display">
          Application Number: {applicationNumber}
        </div>
      )}
      {/* Your form components */}
    </div>
  );
};
```

---

## 🧪 Testing Instructions

### 1. Start the Application

```bash
cd "Build\my-react-app-1"
npm start
```

Wait for `http://localhost:3000` to open.

### 2. Run the Test Page

Open in your browser:
```
http://localhost:3000/loan-workflow-test.html
```

### 3. Execute Complete Workflow

Click one of the "Complete Flow" buttons:
- **Complete Flow (Salaried)** - Tests salaried loan workflow
- **Complete Flow (Business)** - Tests business loan workflow

### 4. Test Individual Steps

Or test each step separately:

**Step 1:**
- Click "Submit Salaried Loan" or "Submit Business Loan"
- Watch for the Application Number in the output
- Note: The Application Number will be displayed prominently

**Step 2:**
- After Step 1 completes, the "Upload Document" button will be enabled
- Click "Upload Document" to test document upload
- The upload will use the Application Number from Step 1

---

## 📊 Expected Results

### Successful Flow

```
════════════════════════════════════════
STEP 1: SUBMITTING SALARIED LOAN REQUEST
════════════════════════════════════════

📤 Sending salaried loan request to API...
✅ SUCCESS! Loan request submitted

🎯 APPLICATION NUMBER RETRIEVED:
═══════════════════════════════════
   APP123456789
═══════════════════════════════════

✨ This ApplicationNumber can now be used for document upload (Step 2)

════════════════════════════════════════
STEP 2: UPLOADING DOCUMENT
════════════════════════════════════════
Using ApplicationNumber: APP123456789

📤 Uploading document...
✅ SUCCESS! Document uploaded

████████████████████████████████████████████████████████
  ✨ WORKFLOW COMPLETED SUCCESSFULLY! ✨
████████████████████████████████████████████████████████

Summary:
  ✅ Loan Type: salaried
  ✅ ApplicationNumber: APP123456789
  ✅ Loan Request: Submitted
  ✅ Documents: Uploaded
```

---

## 🔍 Key Points

1. **ApplicationNumber is Critical**
   - Returned from Step 1 loan submission APIs
   - Required for Step 2 document upload
   - Must be stored and passed to upload function

2. **Response Structure**
   ```typescript
   {
     executionStatus: "SUCCESS" | "FAILURE",
     outParams: {
       ApplicationNumber: "APP123456789",
       // ... other fields
     }
   }
   ```

3. **Error Handling**
   - Always check `executionStatus` in response
   - Verify `ApplicationNumber` exists before proceeding to Step 2
   - Handle network errors appropriately

4. **File Upload Format**
   - Uses `multipart/form-data` (FormData)
   - NOT base64 encoding
   - `ApplicationNumber` sent as FormData field
   - File sent as `FileName` field

---

## 🛠️ Backend Requirements

For this workflow to work, backend must:

1. **Return ApplicationNumber** in loan submission response:
   ```json
   {
     "executionStatus": "SUCCESS",
     "outParams": {
       "ApplicationNumber": "APP123456789"
     }
   }
   ```

2. **Accept ApplicationNumber** in document upload:
   - As FormData field
   - Field name: `ApplicationNumber`

3. **Enable CORS headers**:
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: POST, GET, OPTIONS
   Access-Control-Allow-Headers: Authorization, Content-Type
   ```

---

## 📁 Related Files

- **TypeScript Module**: `src/test/loanSubmissionFlow.ts`
- **HTML Test Page**: `public/loan-workflow-test.html`
- **API Client**: `src/api/altusApi.ts`
- **Backend Report**: `BACKEND_API_INTEGRATION_REPORT.md`

---

## 🆘 Troubleshooting

### Issue: No Application Number Returned

**Cause:** Backend not returning `ApplicationNumber` in response

**Solution:** Check backend response structure. Should have:
```json
{
  "outParams": {
    "ApplicationNumber": "..."
  }
}
```

### Issue: Document Upload Fails

**Cause 1:** Invalid ApplicationNumber
- **Solution:** Verify you're using the exact ApplicationNumber from Step 1

**Cause 2:** Wrong FormData structure
- **Solution:** Use `ApplicationNumber` and `FileName` as field names

### Issue: CORS Error

**Cause:** Backend not configured for CORS

**Solution:** 
- Development: Use proxy (already configured in `setupProxy.js`)
- Production: Backend must enable CORS headers

---

## ✅ Success Criteria

The workflow is successful when:

1. ✅ Loan submission returns `executionStatus: "SUCCESS"`
2. ✅ `ApplicationNumber` is present in response
3. ✅ `ApplicationNumber` is displayed to user
4. ✅ Document upload accepts the `ApplicationNumber`
5. ✅ Document upload returns success response

---

**Last Updated:** 2024
**Status:** ✅ Ready for Testing
