# Altus Context Documentation

## Overview

The `AltusContext` provides a comprehensive global state management solution for Altus API operations in the loan management system. It centralizes data fetching, state management, error handling, and loading states for all Altus-related functionality.

## Features

### 🎯 **Core Functionality**
- **Customer Management**: Create, update, and fetch customer details by NRC
- **Loan Operations**: Fetch loan details, balance, and status by Loan ID
- **Loan Requests**: Submit new loan applications and track their progress
- **Document Upload**: Handle loan document uploads with progress tracking
- **Product Management**: Fetch loan product details and terms

### 🔄 **State Management**
- **Global Loading States**: Individual loading indicators for each operation
- **Error Handling**: Categorized error states with detailed error information
- **Success Flags**: Track successful operations for user feedback
- **Data Caching**: Store recent loans and customer information
- **Timestamp Tracking**: Track when data was last fetched

### 📊 **Data Structure**
- **Type-Safe**: Full TypeScript support with Altus API interfaces
- **Normalized State**: Organized data structure for efficient access
- **Relationship Mapping**: Customer-to-loan relationships maintained
- **Recent Data**: Track recently accessed loans and customers

## Installation & Setup

### 1. Provider Setup

Wrap your application with the `AltusProvider` in your main App component:

```tsx
import React from 'react';
import { AltusProvider } from './context';
import YourMainComponent from './components/YourMainComponent';

const App: React.FC = () => {
  return (
    <AltusProvider>
      <YourMainComponent />
    </AltusProvider>
  );
};

export default App;
```

### 2. Using the Hook

Import and use the `useAltus` hook in your components:

```tsx
import React from 'react';
import { useAltus } from '../context';

const MyComponent: React.FC = () => {
  const {
    state,
    fetchCustomerByNRC,
    fetchLoanDetails,
    submitLoanRequest,
    isLoading,
    hasError,
    getError
  } = useAltus();

  // Your component logic here
};
```

## API Methods

### 🧑‍💼 **Customer Operations**

#### `fetchCustomerByNRC(nrc: string)`
Fetches customer details by NRC number.

```tsx
const customer = await fetchCustomerByNRC('123456/78/9');
if (customer) {
  console.log('Customer found:', customer.firstName, customer.lastName);
}
```

#### `createRetailCustomer(customerData: RetailCustomerRequest)`
Creates a new retail customer.

```tsx
const customerData: RetailCustomerRequest = {
  firstName: "John",
  lastName: "Banda",
  nrc: "123456/78/9",
  phoneNumber: "+260977123456",
  // ... other required fields
};

const customer = await createRetailCustomer(customerData);
```

#### `createBusinessCustomer(customerData: BusinessCustomerRequest)`
Creates a new business customer.

#### `updateRetailCustomer(customerData: RetailCustomerRequest)`
Updates an existing retail customer.

#### `updateBusinessCustomer(customerData: BusinessCustomerRequest)`
Updates an existing business customer.

### 💰 **Loan Operations**

#### `fetchLoanDetails(loanId: string)`
Fetches comprehensive loan information.

```tsx
const loan = await fetchLoanDetails('LOAN123456');
if (loan) {
  console.log('Loan amount:', loan.loanAmount);
  console.log('Status:', loan.status);
  console.log('Monthly payment:', loan.monthlyInstallment);
}
```

#### `fetchLoanBalance(loanId: string)`
Fetches current loan balance details.

```tsx
const balance = await fetchLoanBalance('LOAN123456');
if (balance) {
  console.log('Principal balance:', balance.principalBalance);
  console.log('Total outstanding:', balance.totalBalance);
}
```

#### `fetchLoanStatus(loanId: string)`
Fetches loan status and workflow information.

```tsx
const status = await fetchLoanStatus('LOAN123456');
if (status) {
  console.log('Current status:', status.status);
  console.log('Last updated:', status.lastUpdated);
}
```

#### `fetchLoansByCustomerNRC(nrc: string)`
Fetches all loans for a customer by their NRC.

```tsx
const loans = await fetchLoansByCustomerNRC('123456/78/9');
console.log('Customer has', loans.length, 'loans');
```

### 📋 **Loan Request Operations**

#### `submitLoanRequest(requestData: any)`
Submits a new loan application.

```tsx
const requestData = {
  customerId: 'CUST123',
  productCode: 'PAYROLL001',
  amount: 50000,
  tenureMonths: 24,
  purpose: 'Home improvement'
};

const request = await submitLoanRequest(requestData);
if (request) {
  console.log('Application ID:', request.applicationId);
  console.log('Reference:', request.referenceNumber);
}
```

#### `uploadLoanDocument(formData: FormData)`
Uploads documents for loan application.

```tsx
const formData = new FormData();
formData.append('document', file);
formData.append('documentType', 'PAYSLIP');
formData.append('applicationId', 'APP123');

const result = await uploadLoanDocument(formData);
```

### 🏪 **Product Operations**

#### `fetchLoanProducts(employerId?: string)`
Fetches available loan products.

#### `fetchLoanProductDetails(productCode: string, employerId: string)`
Fetches detailed product information.

```tsx
const product = await fetchLoanProductDetails('PAYROLL001', 'EMP123');
if (product) {
  console.log('Product name:', product.productName);
  console.log('Interest rate:', product.loanTerms?.interestRate);
  console.log('Max amount:', product.loanTerms?.maxAmount);
}
```

## State Management

### 📊 **Accessing State**

```tsx
const { state } = useAltus();

// Current data
const customer = state.currentCustomer;
const loan = state.currentLoan;
const balance = state.loanBalance;
const request = state.loanRequest;

// Recent data
const recentLoans = state.recentLoans;

// Loading states
const isCustomerLoading = state.loading.fetchingCustomer;
const isLoanLoading = state.loading.fetchingLoanDetails;

// Error states
const customerError = state.errors.customer;
const loanError = state.errors.loan;

// Success flags
const wasCustomerCreated = state.successFlags.customerCreated;
const wasLoanSubmitted = state.successFlags.loanRequestSubmitted;
```

### 🔄 **State Management Methods**

#### `clearErrors()`
Clears all error states.

```tsx
const { clearErrors } = useAltus();

// Clear all errors
clearErrors();
```

#### `clearError(category: string)`
Clears specific error category.

```tsx
const { clearError } = useAltus();

// Clear only customer errors
clearError('customer');
```

#### `clearSuccessFlags()`
Clears all success indicators.

#### `setSuccessFlag(flag: string, value: boolean)`
Manually set success flags.

#### `resetCustomer()`
Resets all customer-related state.

#### `resetLoan()`
Resets all loan-related state.

#### `resetAll()`
Resets entire context state.

### 🔍 **Utility Functions**

#### `isLoading(operation?: string)`
Checks loading state.

```tsx
const { isLoading } = useAltus();

// Check if any operation is loading
if (isLoading()) {
  console.log('Something is loading...');
}

// Check specific operation
if (isLoading('fetchingCustomer')) {
  console.log('Customer data is being fetched...');
}
```

#### `hasError(category?: string)`
Checks for errors.

```tsx
const { hasError } = useAltus();

// Check if any errors exist
if (hasError()) {
  console.log('There are errors to display');
}

// Check specific error category
if (hasError('customer')) {
  console.log('Customer operation failed');
}
```

#### `getError(category: string)`
Gets specific error details.

```tsx
const { getError } = useAltus();

const customerError = getError('customer');
if (customerError) {
  console.log('Error message:', customerError.message);
  console.log('Error code:', customerError.code);
  console.log('HTTP status:', customerError.status);
}
```

## Usage Examples

### 🎯 **Complete Customer Workflow**

```tsx
import React, { useEffect, useState } from 'react';
import { useAltus } from '../context';

const CustomerManagement: React.FC = () => {
  const {
    state,
    fetchCustomerByNRC,
    createRetailCustomer,
    isLoading,
    hasError,
    getError,
    clearErrors
  } = useAltus();

  const [nrc, setNrc] = useState('');

  const handleFetchCustomer = async () => {
    const customer = await fetchCustomerByNRC(nrc);
    if (customer) {
      console.log('Customer loaded:', customer);
    }
  };

  const handleCreateCustomer = async () => {
    const customerData = {
      firstName: "John",
      lastName: "Banda",
      nrc: nrc,
      phoneNumber: "+260977123456",
      // ... complete customer data
    };

    const customer = await createRetailCustomer(customerData);
    if (customer) {
      console.log('Customer created:', customer);
    }
  };

  useEffect(() => {
    if (state.successFlags.customerCreated) {
      alert('Customer created successfully!');
    }
  }, [state.successFlags.customerCreated]);

  return (
    <div>
      <input
        value={nrc}
        onChange={(e) => setNrc(e.target.value)}
        placeholder="Enter NRC"
      />
      
      <button 
        onClick={handleFetchCustomer}
        disabled={isLoading('fetchingCustomer')}
      >
        {isLoading('fetchingCustomer') ? 'Loading...' : 'Fetch Customer'}
      </button>
      
      <button 
        onClick={handleCreateCustomer}
        disabled={isLoading('creatingCustomer')}
      >
        {isLoading('creatingCustomer') ? 'Creating...' : 'Create Customer'}
      </button>

      {hasError('customer') && (
        <div style={{ color: 'red' }}>
          Error: {getError('customer')?.message}
          <button onClick={() => clearErrors()}>Clear</button>
        </div>
      )}

      {state.currentCustomer && (
        <div>
          <h3>Current Customer</h3>
          <p>Name: {state.currentCustomer.firstName} {state.currentCustomer.lastName}</p>
          <p>NRC: {state.currentCustomer.nrc}</p>
          <p>Phone: {state.currentCustomer.phoneNumber}</p>
        </div>
      )}
    </div>
  );
};
```

### 💰 **Loan Management Workflow**

```tsx
const LoanManagement: React.FC = () => {
  const {
    state,
    fetchLoanDetails,
    fetchLoanBalance,
    submitLoanRequest,
    isLoading,
    hasError
  } = useAltus();

  const [loanId, setLoanId] = useState('');

  const handleFetchLoan = async () => {
    const loan = await fetchLoanDetails(loanId);
    if (loan) {
      // Automatically fetch balance for this loan
      await fetchLoanBalance(loan.loanId);
    }
  };

  const handleSubmitLoanRequest = async () => {
    if (!state.currentCustomer) {
      alert('Please select a customer first');
      return;
    }

    const requestData = {
      customerId: state.currentCustomer.customerId,
      productCode: 'PAYROLL001',
      amount: 50000,
      tenureMonths: 24,
      purpose: 'Personal loan'
    };

    const request = await submitLoanRequest(requestData);
    if (request) {
      console.log('Loan request submitted:', request.referenceNumber);
    }
  };

  return (
    <div>
      <input
        value={loanId}
        onChange={(e) => setLoanId(e.target.value)}
        placeholder="Enter Loan ID"
      />
      
      <button 
        onClick={handleFetchLoan}
        disabled={isLoading('fetchingLoanDetails')}
      >
        Fetch Loan Details
      </button>

      <button 
        onClick={handleSubmitLoanRequest}
        disabled={isLoading('submittingLoanRequest') || !state.currentCustomer}
      >
        Submit Loan Request
      </button>

      {state.currentLoan && (
        <div>
          <h3>Loan Details</h3>
          <p>Loan ID: {state.currentLoan.loanId}</p>
          <p>Amount: {state.currentLoan.currency} {state.currentLoan.loanAmount?.toLocaleString()}</p>
          <p>Status: {state.currentLoan.status}</p>
        </div>
      )}

      {state.loanBalance && (
        <div>
          <h3>Loan Balance</h3>
          <p>Principal: {state.loanBalance.currency} {state.loanBalance.principalBalance?.toLocaleString()}</p>
          <p>Total: {state.loanBalance.currency} {state.loanBalance.totalBalance?.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};
```

## Error Handling

### 🚨 **Error Categories**

- **customer**: Customer-related operations (fetch, create, update)
- **loan**: Loan operations (details, balance, status)
- **loanRequest**: Loan request operations (submit, upload)
- **general**: General operations (products, health checks)

### 📋 **Error Structure**

```typescript
interface ApiError {
  message: string;      // Human-readable error message
  code?: string;        // Error code from API
  status?: number;      // HTTP status code
  details?: any;        // Additional error details
  timestamp: string;    // When the error occurred
}
```

### 🔧 **Error Handling Patterns**

```tsx
// Basic error checking
if (hasError('customer')) {
  const error = getError('customer');
  console.log('Customer error:', error.message);
}

// Specific error handling
const handleApiCall = async () => {
  const result = await fetchCustomerByNRC('123456/78/9');
  
  if (!result && hasError('customer')) {
    const error = getError('customer');
    
    switch (error.code) {
      case 'NETWORK_CONNECTION_ERROR':
        alert('Please check your internet connection');
        break;
      case 'API_OPERATION_FAILED':
        alert('Customer not found');
        break;
      default:
        alert('An unexpected error occurred');
    }
  }
};

// Error display component
const ErrorDisplay: React.FC = () => {
  const { hasError, getError, clearError } = useAltus();
  
  if (!hasError()) return null;
  
  return (
    <div style={{ backgroundColor: '#ffebee', padding: '10px' }}>
      {Object.entries({
        customer: 'Customer',
        loan: 'Loan',
        loanRequest: 'Loan Request',
        general: 'General'
      }).map(([key, label]) => {
        const error = getError(key as any);
        if (!error) return null;
        
        return (
          <div key={key}>
            <strong>{label} Error:</strong> {error.message}
            <button onClick={() => clearError(key as any)}>×</button>
          </div>
        );
      })}
    </div>
  );
};
```

## Loading States

### ⏳ **Available Loading States**

- `fetchingCustomer`: Customer data being fetched
- `fetchingLoanDetails`: Loan details being fetched
- `fetchingLoanBalance`: Loan balance being fetched
- `fetchingLoanStatus`: Loan status being fetched
- `fetchingLoanProducts`: Loan products being fetched
- `creatingCustomer`: Customer being created
- `updatingCustomer`: Customer being updated
- `submittingLoanRequest`: Loan request being submitted
- `uploadingDocument`: Document being uploaded
- `general`: General loading state

### 🔄 **Loading Indicators**

```tsx
const LoadingIndicator: React.FC = () => {
  const { isLoading, state } = useAltus();
  
  if (isLoading('fetchingCustomer')) {
    return <div>Loading customer data...</div>;
  }
  
  if (isLoading('submittingLoanRequest')) {
    return <div>Submitting loan request...</div>;
  }
  
  if (isLoading()) {
    return <div>Loading...</div>;
  }
  
  return null;
};

// Disable buttons during loading
<button 
  disabled={isLoading('fetchingCustomer')}
  onClick={handleFetchCustomer}
>
  {isLoading('fetchingCustomer') ? 'Loading...' : 'Fetch Customer'}
</button>
```

## Best Practices

### ✅ **Recommended Patterns**

1. **Always check loading states** before performing operations
2. **Handle errors gracefully** with user-friendly messages
3. **Clear errors** after user acknowledgment
4. **Use success flags** for user feedback
5. **Reset state** when appropriate (e.g., switching customers)

### 🎯 **Performance Tips**

1. **Avoid unnecessary re-fetches** by checking `lastFetched` timestamps
2. **Use recent data** when available instead of re-fetching
3. **Clear old data** when switching contexts
4. **Batch related operations** (e.g., fetch loan + balance together)

### 🔒 **Security Considerations**

1. **Token management** is handled by the underlying API client
2. **Sensitive data** is not persisted to localStorage
3. **Error details** may contain sensitive information - handle carefully
4. **Network errors** are abstracted to prevent information leakage

## TypeScript Support

The AltusContext is fully typed with TypeScript interfaces that match the Altus API specifications. This provides:

- **Compile-time type checking**
- **IntelliSense support** in VS Code
- **Runtime type safety** with proper error handling
- **API contract validation** ensuring data structure consistency

All data structures, method signatures, and state interfaces are strongly typed for the best developer experience and code reliability.