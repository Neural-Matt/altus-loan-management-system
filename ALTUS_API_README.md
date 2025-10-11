# Altus API Client Documentation

This document explains how to use the Altus API client (`altusApi.ts`) to connect to the Altus backend services.

## Configuration

The API client is pre-configured with:
- **Base URL**: `http://3.6.174.212:5010/`
- **Bearer Token**: Automatically managed via request interceptor
- **Timeout**: 30 seconds
- **Content-Type**: `application/json`

## Authentication Management

The API client includes automatic Bearer token management with the following features:

### Automatic Token Injection
The request interceptor automatically adds the Bearer token to every request's `Authorization` header.

### Token Validation
- Validates token format and length before each request
- Provides console warnings for missing or invalid tokens
- Handles 401 Unauthorized responses with detailed logging

### Dynamic Token Management
```typescript
import { updateBearerToken, clearBearerToken, getTokenStatus } from './api/altusApi';

// Update token (e.g., after user login)
updateBearerToken('new-token-here');

// Clear token (e.g., on logout)
clearBearerToken();

// Check current token status
const status = getTokenStatus();
console.log('Has token:', status.hasToken);
console.log('Is valid:', status.isValid);
```

## Basic Usage

### Import the API Client

```typescript
import altusApi, { 
  postWithPayload, 
  get, 
  AltusApiException,
  updateBearerToken,
  clearBearerToken,
  getTokenStatus
} from './api/altusApi';

// Or import individual functions and auth helpers
import { 
  submitLoanApplication, 
  getApplicationStatus,
  initializeAuth,
  checkAuthenticationStatus,
  refreshAuthToken,
  logoutUser
} from './api/altusApiExamples';
```

### Authentication Setup

```typescript
// Initialize authentication on app startup
const authInitialized = await initializeAuth();

if (authInitialized) {
  console.log('Authentication ready');
} else {
  console.warn('Authentication failed - check token');
}

// Check current authentication status
const authStatus = checkAuthenticationStatus();
console.log('Auth recommendations:', authStatus.recommendations);
```

### Making API Requests

#### POST Requests with Payload
```typescript
try {
  const response = await postWithPayload('/api/applications/submit', {
    customer: { /* customer data */ },
    loan: { /* loan data */ },
    documents: { /* documents */ }
  });
  
  console.log('Success:', response);
} catch (error) {
  if (error instanceof AltusApiException) {
    console.error('API Error:', error.message);
  }
}
```

#### GET Requests
```typescript
try {
  const status = await get(`/api/applications/${referenceId}/status`);
  console.log('Application Status:', status);
} catch (error) {
  console.error('Failed to get status:', error.message);
}
```

#### File Uploads
```typescript
const formData = new FormData();
formData.append('document', file);

try {
  const result = await altusApi.uploadFile('/api/documents/upload', formData, 
    (progress) => console.log(`Upload ${progress}% complete`)
  );
} catch (error) {
  console.error('Upload failed:', error.message);
}
```

#### Health Check
```typescript
const healthStatus = await altusApi.checkHealth();
console.log('API Status:', healthStatus.status); // 'connected' or 'disconnected'
```

## Authentication & Token Management

The API client provides comprehensive authentication management with automatic token handling.

### Request Interceptor Features

The built-in request interceptor automatically:
- Adds Bearer tokens to every request's `Authorization` header
- Validates token format before sending requests
- Provides console warnings for missing or invalid tokens
- Logs all requests for debugging purposes

### Token Management Functions

#### `updateBearerToken(token: string)`
Updates the authentication token dynamically.

```typescript
// Update token after user login
updateBearerToken('your-new-token-here');

// The new token will be automatically used for all subsequent requests
```

#### `clearBearerToken()`
Removes the current authentication token.

```typescript
// Clear token on user logout
clearBearerToken();

// Future requests will receive warnings about missing authentication
```

#### `getTokenStatus()`
Returns comprehensive information about the current token status.

```typescript
const status = getTokenStatus();

console.log('Has token:', status.hasToken);          // boolean
console.log('Is valid:', status.isValid);            // boolean  
console.log('Token preview:', status.tokenPreview);  // "ABC123..." (first 20 chars)
console.log('Token length:', status.tokenLength);    // number
```

### Authentication Helper Functions

#### `initializeAuth(token?: string)`
Initializes authentication and tests connectivity.

```typescript
// Initialize with existing token
const success = await initializeAuth();

// Or initialize with a new token
const success = await initializeAuth('new-token-here');

if (success) {
  console.log('Authentication ready');
} else {
  console.log('Authentication failed');
}
```

#### `checkAuthenticationStatus()`
Comprehensive authentication status check with recommendations.

```typescript
const authStatus = checkAuthenticationStatus();

console.log('Has token:', authStatus.hasToken);
console.log('Is valid:', authStatus.isValid);
console.log('Recommendations:', authStatus.recommendations);

// Example recommendations:
// - "Set a Bearer token using updateBearerToken()"
// - "Current token appears invalid, consider refreshing"
// - "Token appears too short, verify token format"
```

#### `refreshAuthToken(newToken: string)`
Safely updates and validates a new authentication token.

```typescript
try {
  await refreshAuthToken('new-token-here');
  console.log('Token refreshed successfully');
} catch (error) {
  console.error('Token refresh failed:', error.message);
}
```

#### `logoutUser()`
Securely clears authentication data.

```typescript
logoutUser(); // Clears token and logs the action
```

### Response Interceptor - 401 Handling

The response interceptor provides enhanced 401 Unauthorized error handling:

```typescript
// Automatic token validation on 401 errors
try {
  const result = await submitLoanApplication(data);
} catch (error) {
  // The interceptor will log detailed token status on 401 errors:
  // "401 Unauthorized - Bearer token may be expired or invalid"
  // "Current token: ABC123..."
  // "Consider refreshing the token or checking token validity"
}
```

### Authentication Workflow Example

```typescript
// 1. Initialize authentication on app startup
const initAuth = async () => {
  const authStatus = checkAuthenticationStatus();
  
  if (!authStatus.hasToken) {
    console.log('No token found, user needs to login');
    return false;
  }
  
  if (!authStatus.isValid) {
    console.log('Invalid token, needs refresh');
    return false;
  }
  
  // Test the token with API connectivity
  const success = await initializeAuth();
  return success;
};

// 2. Handle token refresh
const handleTokenRefresh = async (newToken: string) => {
  try {
    await refreshAuthToken(newToken);
    console.log('Token updated successfully');
  } catch (error) {
    console.error('Failed to refresh token');
    logoutUser(); // Clear invalid token
  }
};

// 3. Handle logout
const handleLogout = () => {
  logoutUser();
  // Redirect to login page
};
```

## Error Handling

The API client provides comprehensive error handling:

### Error Types
- **TIMEOUT**: Request took too long (30+ seconds)
- **NETWORK_ERROR**: Connection issues
- **BAD_REQUEST**: Invalid request data (400)
- **UNAUTHORIZED**: Authentication failed (401)
- **FORBIDDEN**: Access denied (403)
- **NOT_FOUND**: Resource not found (404)
- **VALIDATION_ERROR**: Data validation failed (422)
- **RATE_LIMIT**: Too many requests (429)
- **SERVER_ERROR**: Internal server error (500)
- **SERVICE_UNAVAILABLE**: Server temporarily down (502/503/504)

### Error Handling Examples

```typescript
try {
  const result = await submitLoanApplication(applicationData);
} catch (error) {
  if (error instanceof AltusApiException) {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        alert('Please check your application data');
        break;
      case 'TIMEOUT':
        alert('Request timed out. Please try again');
        break;
      case 'UNAUTHORIZED':
        alert('Authentication failed. Please contact support');
        break;
      default:
        alert(error.message);
    }
  }
}
```

## Available Helper Functions

The API client includes several helper functions in `altusApiExamples.ts`:

### `submitLoanApplication(applicationData)`
Submits a new loan application to the backend.

```typescript
const applicationData = {
  customer: {
    firstName: 'John',
    lastName: 'Doe',
    nrc: '123456/78/9',
    phone: '+260971234567',
    nationality: 'Zambian'
  },
  loan: {
    amount: 50000,
    tenureMonths: 12,
    productCode: 'instant-salary-advance'
  },
  documents: { /* file objects */ }
};

const result = await submitLoanApplication(applicationData);
console.log('Reference ID:', result.referenceId);
```

### `getApplicationStatus(referenceId)`
Retrieves the current status of an application.

```typescript
const status = await getApplicationStatus('ALT25100001');
console.log('Status:', status.status);
console.log('Timeline:', status.statusTimeline);
```

### `uploadApplicationDocuments(referenceId, documents, onProgress)`
Uploads documents for an existing application.

```typescript
const documents = {
  'nrc-front': nrcFrontFile,
  'nrc-back': nrcBackFile,
  'payslip-1': payslip1File
};

await uploadApplicationDocuments('ALT25100001', documents, 
  (progress) => setUploadProgress(progress)
);
```

### `getLoanProducts()`
Retrieves available loan products and their configurations.

```typescript
const products = await getLoanProducts();
products.forEach(product => {
  console.log(`${product.name}: ${product.minAmount} - ${product.maxAmount}`);
});
```

### `checkConnection()`
Tests API connectivity.

```typescript
const isConnected = await checkConnection();
if (!isConnected) {
  alert('Unable to connect to Altus servers');
}
```

## Request/Response Interfaces

### Loan Application Request
```typescript
interface LoanApplicationRequest {
  customer: {
    firstName: string;
    lastName: string;
    nrc: string;
    phone: string;
    email?: string;
    nationality: string;
    otherNationality?: string;
  };
  loan: {
    amount: number;
    tenureMonths: number;
    productCode: string;
  };
  documents: {
    [key: string]: File | string;
  };
}
```

### Application Status Response
```typescript
interface ApplicationStatusResponse {
  referenceId: string;
  status: string;
  statusTimeline: Array<{
    stage: string;
    timestamp: string;
    description: string;
  }>;
  customerName?: string;
  loanAmount?: number;
}
```

## Integration with React Components

### Using in a React Component

```typescript
import React, { useState, useEffect } from 'react';
import { 
  submitLoanApplication, 
  checkConnection,
  initializeAuth,
  checkAuthenticationStatus,
  refreshAuthToken,
  logoutUser
} from './api/altusApiExamples';

const LoanApplicationForm = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [authStatus, setAuthStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const setupAuth = async () => {
      // Initialize authentication
      const authInitialized = await initializeAuth();
      
      if (authInitialized) {
        const connected = await checkConnection();
        setIsConnected(connected);
        
        const status = checkAuthenticationStatus();
        setAuthStatus(status);
      } else {
        console.warn('Authentication failed to initialize');
        const status = checkAuthenticationStatus();
        setAuthStatus(status);
      }
    };
    
    setupAuth();
  }, []);

  const handleTokenRefresh = async (newToken) => {
    try {
      await refreshAuthToken(newToken);
      const connected = await checkConnection();
      setIsConnected(connected);
      
      const status = checkAuthenticationStatus();
      setAuthStatus(status);
    } catch (error) {
      console.error('Failed to refresh token:', error.message);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setIsConnected(false);
    setAuthStatus({ hasToken: false, isValid: false, recommendations: ['Please log in'] });
  };

  const handleSubmit = async (formData) => {
    // Pre-flight authentication check
    const currentStatus = checkAuthenticationStatus();
    if (!currentStatus.hasToken || !currentStatus.isValid) {
      alert('Please refresh your authentication token');
      return;
    }

    if (!isConnected) {
      alert('No connection to Altus servers');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitLoanApplication(formData);
      alert(`Application submitted! Reference: ${result.referenceId}`);
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        alert('Authentication expired. Please refresh your token.');
        // Optionally trigger token refresh flow
      } else {
        alert(`Submission failed: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Status indicators */}
      <div>API Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</div>
      <div>Auth Status: {authStatus?.hasToken ? '🔐 Authenticated' : '🔓 Not Authenticated'}</div>
      
      {/* Auth recommendations */}
      {authStatus?.recommendations?.length > 0 && (
        <div style={{color: 'orange'}}>
          Recommendations: {authStatus.recommendations.join(', ')}
        </div>
      )}
      
      {/* Auth management buttons */}
      <div>
        <button onClick={handleLogout}>Logout</button>
        <button onClick={() => handleTokenRefresh('new-token-here')}>
          Refresh Token
        </button>
      </div>
      
      {/* Main form */}
      <button 
        onClick={handleSubmit} 
        disabled={!isConnected || !authStatus?.isValid || isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Application'}
      </button>
    </div>
  );
};
```

## Debugging and Logging

The API client automatically logs:
- Request details (method and URL)
- Response status codes
- Error details

Check the browser console for detailed logs when debugging API issues.

## Security Notes

### Token Management
- **Dynamic Token Updates**: Tokens can be updated at runtime without reinitializing the API client
- **Automatic Validation**: All tokens are validated for format and length before use
- **Secure Clearing**: Token clearing is logged and immediately effective
- **No Token Persistence**: Tokens are stored in memory only (not localStorage or cookies)

### Security Best Practices
- Use `clearBearerToken()` on user logout to prevent token reuse
- Monitor console warnings about invalid or expired tokens
- Implement token refresh mechanisms for long-running applications
- Consider implementing automatic token refresh on 401 responses

### Production Considerations
- **Environment Variables**: Move token management to secure environment variables
- **Token Refresh**: Implement automatic token refresh mechanisms
- **Secure Storage**: Consider secure token storage solutions for production
- **Request Signing**: Add request signing for additional security layers

### Debugging Authentication Issues

The API client provides comprehensive logging for authentication troubleshooting:

```typescript
// Check detailed token status
const status = getTokenStatus();
console.log('Token diagnostics:', status);

// The console will show warnings like:
// "[Altus API] No Bearer token available for request"
// "[Altus API] Bearer token appears to be invalid or expired"
// "[Altus API] 401 Unauthorized - Bearer token may be expired"
```

## Customization

You can extend the API client by:
- Adding new endpoint-specific functions
- Modifying error handling behavior
- Adjusting timeout values
- Adding custom headers or interceptors

The base axios instance is exported as `altusApiClient` for advanced usage:

```typescript
import { altusApiClient } from './api/altusApi';

// Custom request with specific configuration
const response = await altusApiClient.post('/custom-endpoint', data, {
  timeout: 60000, // Custom timeout
  headers: { 'Custom-Header': 'value' }
});
```