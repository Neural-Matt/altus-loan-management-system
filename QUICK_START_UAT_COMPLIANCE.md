# UAT Compliance - Quick Start Guide

## 🎯 Quick Reference

This guide shows you how to use the new UAT-compliant features in your forms and components.

---

## 1. Customer Creation with Approval Workflow

### Basic Usage
```typescript
import { useCustomerCreation } from '../hooks/useCustomerCreation';

function CustomerForm() {
  const { state, createCustomer, reset } = useCustomerCreation();

  const handleSubmit = async (formData) => {
    try {
      await createCustomer(formData, true); // true = retail, false = business
      // Customer automatically created and approved
      console.log('Approved Customer ID:', state.customerId);
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  return (
    <div>
      {/* Show status */}
      {state.status === 'creating' && <p>Creating customer...</p>}
      {state.status === 'polling' && <p>Waiting for approval (attempt {state.pollingAttempts})...</p>}
      {state.status === 'success' && <p>✅ Approved! Customer ID: {state.customerId}</p>}
      {state.status === 'error' && <p>❌ Error: {state.error}</p>}
      
      <button onClick={handleSubmit}>Create Customer</button>
    </div>
  );
}
```

---

## 2. Form Validation

### Validate Before Submit
```typescript
import { validateRetailCustomer } from '../validation/mandatoryFields';

function handleSubmit(formData) {
  // Validate all mandatory fields
  const validation = validateRetailCustomer(formData);
  
  if (!validation.isValid) {
    // Show errors to user
    alert(validation.errors.join('\n'));
    return;
  }
  
  // All valid - proceed with API call
  await createRetailCustomer(formData);
}
```

### Available Validators
- `validateRetailCustomer(data)` - 25 mandatory fields
- `validateBusinessCustomer(data)` - 27 mandatory fields
- `validateSalariedLoanRequest(data)` - Loan request validation
- `validateBusinessLoanRequest(data)` - Business loan validation
- `validateDocumentUpload(data)` - Document upload validation

---

## 3. Pre-defined Value Dropdowns

### Gender Dropdown
```typescript
import { VALID_GENDER } from '../constants/validationConstants';

<Select name="gender">
  {VALID_GENDER.map(gender => (
    <MenuItem key={gender} value={gender}>{gender}</MenuItem>
  ))}
</Select>
```

### Customer Status Dropdown
```typescript
import { VALID_CUSTOMER_STATUS } from '../constants/validationConstants';

<Select name="customerStatus">
  {VALID_CUSTOMER_STATUS.map(status => (
    <MenuItem key={status} value={status}>{status}</MenuItem>
  ))}
</Select>
```

### All Available Constants
```typescript
import {
  VALID_CUSTOMER_STATUS,  // ['Active', 'Dormant', 'BlackListed', ...]
  VALID_GENDER,           // ['Male', 'Female']
  VALID_TITLE,            // ['Mr', 'Mrs', 'Miss', 'Ms', 'Dr']
  VALID_EMPLOYMENT_TYPE,  // ['1', '2'] (1=Permanent, 2=Contract)
  VALID_CUSTOMER_TYPE,    // ['New', 'Existing']
  VALID_ACCOUNT_TYPE,     // ['Savings', 'Current']
  VALID_SECTOR,           // ['Manufacturing', 'Agriculture', ...]
  VALID_ENTITY_TYPE,      // ['Limited Co', 'Sole Proprietor', ...]
  VALID_BUSINESS_PREMISES_TYPE // ['Rented', 'Owned']
} from '../constants/validationConstants';
```

---

## 4. Document Upload with Type Codes

### Upload with Correct Document Type
```typescript
import { uploadLoanDocument } from '../api/altusApi';
import { DOCUMENT_TYPES, DOCUMENT_TYPE_NAMES } from '../constants/validationConstants';

async function handleUpload(file: File) {
  await uploadLoanDocument(
    'APP123456',                           // Application number
    DOCUMENT_TYPES.PAYSLIPS_3MONTHS,      // '18' - Document type code
    file,                                  // File object
    `DOC${Date.now()}`                    // Document number
  );
}
```

### Document Type Dropdown
```typescript
import { DOCUMENT_TYPE_NAMES } from '../constants/validationConstants';

<Select name="documentType">
  {Object.entries(DOCUMENT_TYPE_NAMES).map(([code, name]) => (
    <MenuItem key={code} value={code}>
      {name} ({code})
    </MenuItem>
  ))}
</Select>
```

### Available Document Types
```typescript
DOCUMENT_TYPES.ORDER_COPIES              // '30'
DOCUMENT_TYPES.ARTICLES_OF_ASSOCIATION   // '16'
DOCUMENT_TYPES.BOARD_RESOLUTION          // '14'
DOCUMENT_TYPES.COMPANY_PROFILE           // '15'
DOCUMENT_TYPES.BUSINESS_REG_CITY_COUNCIL // '3'
DOCUMENT_TYPES.BUSINESS_REG_PACRA        // '2'
DOCUMENT_TYPES.PASSPORT                  // '17'
DOCUMENT_TYPES.EMPLOYMENT_CONTRACT       // '29'
DOCUMENT_TYPES.NRC_CLIENT                // '6'
DOCUMENT_TYPES.NRC_SPOUSE                // '7'
DOCUMENT_TYPES.RESIDENCE_PERMIT          // '28'
DOCUMENT_TYPES.WORK_PERMIT               // '27'
DOCUMENT_TYPES.PAYSLIPS_3MONTHS          // '18'
```

---

## 5. Loan Request (New vs Existing Customer)

### New Customer Loan Request
```typescript
import { submitLoanRequest } from '../api/altusApi';

const newCustomerLoan = {
  TypeOfCustomer: 'New',
  // Personal details required for New
  FirstName: 'John',
  MiddleName: 'M',
  LastName: 'Doe',
  DateOfBirth: '01/01/1990 00:00:00',
  // Common fields
  IdentityNo: '190400/71/1',
  ContactNo: '0977123456',
  EmailId: 'john@email.com',
  EmployeeNumber: 'EMP001',
  Designation: 'Manager',
  EmployementType: '1',
  Tenure: 12,
  Gender: 'Male',
  LoanAmount: 50000,
  GrossIncome: 10000,
  NetIncome: 8500,
  Deductions: 1500
};

await submitLoanRequest(newCustomerLoan);
// API automatically includes FirstName, MiddleName, LastName, DateOfBirth
```

### Existing Customer Loan Request
```typescript
const existingCustomerLoan = {
  TypeOfCustomer: 'Existing',
  CustomerId: '0002-0007-3837', // Required for Existing
  // NO FirstName, MiddleName, LastName, DateOfBirth
  IdentityNo: '190400/71/1',
  ContactNo: '0977123456',
  EmailId: 'john@email.com',
  EmployeeNumber: 'EMP001',
  Designation: 'Manager',
  EmployementType: '1',
  Tenure: 12,
  Gender: 'Male',
  LoanAmount: 50000,
  GrossIncome: 10000,
  NetIncome: 8500,
  Deductions: 1500
};

await submitLoanRequest(existingCustomerLoan);
// API automatically excludes personal details for Existing customers
```

---

## 6. Inline Validation Helpers

### Email Validation
```typescript
import { isValidEmail } from '../constants/validationConstants';

const email = 'user@example.com';
if (!isValidEmail(email)) {
  setError('Please enter a valid email address');
}
```

### Age Validation (18+)
```typescript
import { isValidAge } from '../constants/validationConstants';

const dob = '01/01/2010 00:00:00';
if (!isValidAge(dob)) {
  setError('Customer must be at least 18 years old');
}
```

### Date Validation (Not Future)
```typescript
import { isNotFutureDate } from '../constants/validationConstants';

const nrcIssueDate = '12/31/2030 00:00:00';
if (!isNotFutureDate(nrcIssueDate)) {
  setError('NRC Issue Date cannot be in the future');
}
```

### Type Validation
```typescript
import { isValidGender, isValidTitle } from '../constants/validationConstants';

if (!isValidGender(formData.gender)) {
  setError('Gender must be "Male" or "Female"');
}

if (!isValidTitle(formData.title)) {
  setError('Title must be Mr, Mrs, Miss, Ms, or Dr');
}
```

---

## 7. Customer Request Status Tracking

### Manual Status Check
```typescript
import { getCustomerRequestStatus } from '../api/altusApi';

const requestId = 'CS20253230000000008';
const status = await getCustomerRequestStatus(requestId);

console.log('Status:', status.RequestStatus); // "0" = Pending, "1" = Approved
```

### Automatic Polling
```typescript
import { pollCustomerRequestStatus } from '../api/altusApi';

const requestId = 'CS20253230000000008';

try {
  const finalStatus = await pollCustomerRequestStatus(
    requestId,
    30,    // Max attempts
    2000   // Interval (ms)
  );
  
  if (finalStatus.RequestStatus === "1") {
    console.log('Approved!');
  }
} catch (error) {
  console.log('Timed out or rejected');
}
```

---

## 8. Complete Form Example

```typescript
import React, { useState } from 'react';
import { useCustomerCreation } from '../hooks/useCustomerCreation';
import { validateRetailCustomer } from '../validation/mandatoryFields';
import { 
  VALID_GENDER, 
  VALID_TITLE, 
  VALID_CUSTOMER_STATUS,
  isValidEmail 
} from '../constants/validationConstants';

function RetailCustomerForm() {
  const { state, createCustomer, reset } = useCustomerCreation();
  const [formData, setFormData] = useState({
    Command: 'Create',
    FirstName: '',
    LastName: '',
    CustomerStatus: 'Active',
    NRCIssueDate: '',
    UpdatedBy: 'system',
    PrimaryAddress: '',
    ProvinceName: '',
    DistrictName: '',
    CountryName: 'Zambia',
    Postalcode: '',
    NRCNumber: '',
    ContactNo: '',
    EmailID: '',
    BranchName: '',
    GenderName: 'Male',
    Title: 'Mr',
    DOB: '',
    FinancialInstitutionName: '',
    FinancialInstitutionBranchName: '',
    AccountNumber: '',
    AccountType: 'Savings'
  });
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const validation = validateRetailCustomer(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setErrors([]);
    
    try {
      await createCustomer(formData, true);
      alert(`Customer approved! ID: ${state.customerId}`);
      reset();
    } catch (error) {
      alert('Failed to create customer');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Show validation errors */}
      {errors.length > 0 && (
        <div style={{ color: 'red' }}>
          <ul>
            {errors.map((error, i) => <li key={i}>{error}</li>)}
          </ul>
        </div>
      )}
      
      {/* Show workflow status */}
      {state.status === 'creating' && <p>Creating customer...</p>}
      {state.status === 'polling' && (
        <p>Waiting for approval (attempt {state.pollingAttempts}/30)...</p>
      )}
      {state.status === 'success' && (
        <p style={{ color: 'green' }}>✅ Approved! Customer ID: {state.customerId}</p>
      )}
      {state.status === 'error' && (
        <p style={{ color: 'red' }}>❌ Error: {state.error}</p>
      )}
      
      {/* Form fields */}
      <input
        name="FirstName"
        placeholder="First Name *"
        value={formData.FirstName}
        onChange={(e) => setFormData({ ...formData, FirstName: e.target.value })}
        required
      />
      
      <input
        name="LastName"
        placeholder="Last Name *"
        value={formData.LastName}
        onChange={(e) => setFormData({ ...formData, LastName: e.target.value })}
        required
      />
      
      <select
        name="GenderName"
        value={formData.GenderName}
        onChange={(e) => setFormData({ ...formData, GenderName: e.target.value })}
      >
        {VALID_GENDER.map(gender => (
          <option key={gender} value={gender}>{gender}</option>
        ))}
      </select>
      
      <select
        name="Title"
        value={formData.Title}
        onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
      >
        {VALID_TITLE.map(title => (
          <option key={title} value={title}>{title}</option>
        ))}
      </select>
      
      <input
        type="date"
        name="DOB"
        placeholder="Date of Birth *"
        onChange={(e) => setFormData({ 
          ...formData, 
          DOB: new Date(e.target.value).toLocaleString('en-US') 
        })}
        required
      />
      
      <input
        name="NRCNumber"
        placeholder="NRC Number *"
        value={formData.NRCNumber}
        onChange={(e) => setFormData({ ...formData, NRCNumber: e.target.value })}
        required
      />
      
      <input
        type="email"
        name="EmailID"
        placeholder="Email *"
        value={formData.EmailID}
        onChange={(e) => setFormData({ ...formData, EmailID: e.target.value })}
        required
      />
      
      {/* ... more fields ... */}
      
      <button type="submit" disabled={state.status === 'creating' || state.status === 'polling'}>
        {state.status === 'idle' ? 'Create Customer' : 'Processing...'}
      </button>
    </form>
  );
}

export default RetailCustomerForm;
```

---

## 9. API Testing

Navigate to https://applynow.altuszm.com/api-test to test all APIs including:
- Get Customer Request Status (NEW)
- Create Retail Customer (returns RequestId)
- Create Business Customer (returns RequestId)
- Submit Salaried Loan (New vs Existing)
- Submit Business Loan (New vs Existing)
- Upload Document (30+ types)

---

## 10. Common Patterns

### Pattern 1: Create Customer → Poll → Get CustomerID
```typescript
// Step 1: Create
const response = await createRetailCustomer(data);
const requestId = response.outParams?.RequestId;

// Step 2: Poll
const status = await pollCustomerRequestStatus(requestId);

// Step 3: Get CustomerID
const customerId = status.CustomerID;
```

### Pattern 2: Validate → Submit → Handle Errors
```typescript
// Validate
const validation = validateRetailCustomer(formData);
if (!validation.isValid) {
  showErrors(validation.errors);
  return;
}

// Submit
try {
  await createRetailCustomer(formData);
} catch (error) {
  handleError(error);
}
```

### Pattern 3: Conditional Form Fields
```typescript
const [customerType, setCustomerType] = useState<'New' | 'Existing'>('New');

return (
  <>
    <select value={customerType} onChange={(e) => setCustomerType(e.target.value)}>
      <option value="New">New Customer</option>
      <option value="Existing">Existing Customer</option>
    </select>
    
    {customerType === 'New' && (
      <>
        <input name="FirstName" placeholder="First Name *" />
        <input name="LastName" placeholder="Last Name *" />
        <input type="date" name="DateOfBirth" placeholder="Date of Birth *" />
      </>
    )}
    
    {customerType === 'Existing' && (
      <input name="CustomerId" placeholder="Customer ID *" />
    )}
  </>
);
```

---

## 📚 Full Documentation

See `UAT_COMPLIANCE_IMPLEMENTATION.md` for complete implementation details and API specifications.
