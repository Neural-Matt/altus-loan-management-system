// Example usage of the Altus API client
// This file demonstrates how to use the altusApi.ts module

import altusApi, { 
  postWithPayload, 
  get, 
  AltusApiException,
  updateBearerToken,
  clearBearerToken,
  getTokenStatus
} from './altusApi';

import type {
  RetailCustomerRequest,
  BusinessCustomerRequest,
  LoanBalanceResponse,
  LoanStatusResponse,
  LoanDetailsResponse,
  CustomerDetailsResponse,
  LoanProductResponse,
  LoanRequestResponse,
  UploadDocumentResponse
} from '../types/altus';

// Example interfaces for API requests/responses
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

interface LoanApplicationResponse {
  success: boolean;
  referenceId: string;
  status: string;
  message?: string;
}

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

// Example: Submit a loan application
export async function submitLoanApplication(applicationData: LoanApplicationRequest): Promise<LoanApplicationResponse> {
  try {
    const response = await postWithPayload<LoanApplicationRequest, LoanApplicationResponse>(
      '/api/applications/submit',
      applicationData
    );
    
    console.log('Application submitted successfully:', response.referenceId);
    return response;
  } catch (error) {
    if (error instanceof AltusApiException) {
      console.error('API Error:', error.message);
      
      // Handle specific error types
      switch (error.code) {
        case 'VALIDATION_ERROR':
          throw new Error('Please check your application data and try again');
        case 'TIMEOUT':
          throw new Error('Request timed out. Please check your connection and try again');
        case 'UNAUTHORIZED':
          throw new Error('Authentication failed. Please contact support');
        default:
          throw new Error(error.message);
      }
    }
    
    throw new Error('Unexpected error occurred');
  }
}

// Example: Get application status
export async function getApplicationStatus(referenceId: string): Promise<ApplicationStatusResponse> {
  try {
    const response = await get<ApplicationStatusResponse>(`/api/applications/${referenceId}/status`);
    return response;
  } catch (error) {
    if (error instanceof AltusApiException) {
      if (error.status === 404) {
        throw new Error('Application not found. Please check your reference ID');
      }
      throw new Error(error.message);
    }
    
    throw new Error('Failed to retrieve application status');
  }
}

// Example: Upload documents
export async function uploadApplicationDocuments(
  referenceId: string,
  documents: { [key: string]: File },
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; uploadedFiles: string[] }> {
  try {
    const formData = new FormData();
    formData.append('referenceId', referenceId);
    
    // Add each document to form data
    Object.entries(documents).forEach(([type, file]) => {
      formData.append(type, file);
    });
    
    const response = await altusApi.uploadFile<{ success: boolean; uploadedFiles: string[] }>(
      '/api/documents/upload',
      formData,
      (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    );
    
    return response;
  } catch (error) {
    if (error instanceof AltusApiException) {
      throw new Error(`Document upload failed: ${error.message}`);
    }
    
    throw new Error('Failed to upload documents');
  }
}

// Example: Check API connectivity
export async function checkConnection(): Promise<boolean> {
  try {
    const healthCheck = await altusApi.checkHealth();
    return healthCheck.status === 'connected';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}

// Example: Get loan products
export async function getLoanProducts(): Promise<Array<{
  code: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  interestRates: Array<{ minAmount: number; maxAmount: number; rate: number; }>;
}>> {
  try {
    const response = await get<Array<{
      code: string;
      name: string;
      description: string;
      minAmount: number;
      maxAmount: number;
      interestRates: Array<{ minAmount: number; maxAmount: number; rate: number; }>;
    }>>('/api/products');
    
    return response;
  } catch (error) {
    if (error instanceof AltusApiException) {
      throw new Error(`Failed to load loan products: ${error.message}`);
    }
    
    throw new Error('Failed to load loan products');
  }
}

// Example error handling wrapper
export async function withErrorHandling<T>(
  apiCall: () => Promise<T>,
  userFriendlyMessage?: string
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    if (error instanceof AltusApiException) {
      console.error('Altus API Error:', {
        message: error.message,
        status: error.status,
        code: error.code,
        details: error.details
      });
      
      // Log error for debugging but show user-friendly message
      const friendlyMessage = userFriendlyMessage || 'An error occurred. Please try again.';
      throw new Error(friendlyMessage);
    }
    
    console.error('Unexpected error:', error);
    throw error;
  }
}

// Example: Token management functions
export async function refreshAuthToken(newToken: string): Promise<void> {
  try {
    // Update the token
    updateBearerToken(newToken);
    
    // Test the new token with a simple API call
    const healthCheck = await altusApi.checkHealth();
    
    if (healthCheck.status === 'connected') {
      console.log('[Auth] Token updated and verified successfully');
    } else {
      console.warn('[Auth] Token updated but API connection test failed');
    }
  } catch (error) {
    console.error('[Auth] Failed to update token:', error);
    throw new Error('Failed to update authentication token');
  }
}

// Example: Check current authentication status
export function checkAuthenticationStatus(): {
  hasToken: boolean;
  isValid: boolean;
  tokenPreview?: string;
  recommendations: string[];
} {
  const status = getTokenStatus();
  const recommendations: string[] = [];
  
  if (!status.hasToken) {
    recommendations.push('Set a Bearer token using updateBearerToken()');
  } else if (!status.isValid) {
    recommendations.push('Current token appears invalid, consider refreshing');
  }
  
  if (status.tokenLength && status.tokenLength < 50) {
    recommendations.push('Token appears too short, verify token format');
  }
  
  return {
    ...status,
    recommendations
  };
}

// Example: Clear authentication (for logout)
export function logoutUser(): void {
  clearBearerToken();
  console.log('[Auth] User logged out, token cleared');
}

// Example: Initialize authentication with token validation
export async function initializeAuth(token?: string): Promise<boolean> {
  if (token) {
    updateBearerToken(token);
  }
  
  const status = getTokenStatus();
  
  if (!status.hasToken) {
    console.warn('[Auth] No authentication token available');
    return false;
  }
  
  if (!status.isValid) {
    console.warn('[Auth] Authentication token appears invalid');
    return false;
  }
  
  // Test the token by attempting a connection
  try {
    const isConnected = await checkConnection();
    if (isConnected) {
      console.log('[Auth] Authentication initialized successfully');
      return true;
    } else {
      console.warn('[Auth] Token set but API connection failed');
      return false;
    }
  } catch (error) {
    console.error('[Auth] Authentication test failed:', error);
    return false;
  }
}

// Example usage in a React component would look like:
/*
import { 
  submitLoanApplication, 
  getApplicationStatus, 
  checkConnection,
  initializeAuth,
  checkAuthenticationStatus,
  refreshAuthToken,
  logoutUser
} from './api/altusApiExamples';

const MyComponent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [authStatus, setAuthStatus] = useState(null);
  
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
  
  const handleSubmitApplication = async (data) => {
    // Check auth status before submitting
    const currentStatus = checkAuthenticationStatus();
    if (!currentStatus.hasToken || !currentStatus.isValid) {
      alert('Please refresh your authentication token');
      return;
    }
    
    try {
      const result = await submitLoanApplication(data);
      console.log('Application submitted:', result.referenceId);
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        alert('Authentication expired. Please refresh your token.');
      } else {
        console.error('Submission failed:', error.message);
      }
    }
  };
  
  // ... rest of component
};
*/

// ============================================================================
// ENHANCED ALTUS RESPONSE HANDLING EXAMPLES
// ============================================================================

// Example of using the handleAltusResponse helper for custom API calls
export const customApiCallWithResponseHandler = async (requestData: any): Promise<any> => {
  try {
    // Make a raw axios call
    const response = await altusApi.client.post('/API/CustomEndpoint', {
      body: requestData
    });
    
    // Use the helper to handle the response properly
    const result = altusApi.handleAltusResponse(response.data, 'Custom API Call');
    
    console.log('API call successful, returning outParams:', result);
    return result;
    
  } catch (error) {
    if (error instanceof AltusApiException) {
      // The helper already formatted the error nicely
      console.error('API call failed:', error.message);
      console.error('Error details:', error.details);
      
      // Handle specific error codes
      switch (error.code) {
        case 'API_OPERATION_FAILED':
          console.log('Business logic error from server');
          break;
        case 'NETWORK_CONNECTION_ERROR':
          console.log('Network connectivity issue');
          break;
        case 'SERVER_ERROR':
          console.log('Server-side error, please try again later');
          break;
        default:
          console.log('Unexpected error occurred');
      }
    }
    throw error;
  }
};

// Example of manual response handling for understanding the structure
export const manualResponseHandlingExample = async (): Promise<void> => {
  try {
    // Example Altus API response structure
    const mockResponse = {
      executionStatus: "Success",
      executionMessage: "Operation completed successfully",
      outParams: {
        customerId: "CUST123",
        accountNumber: "ACC456",
        status: "ACTIVE"
      }
    };
    
    // Use the helper - it will return outParams since executionStatus is "Success"
    const customerData = altusApi.handleAltusResponse(mockResponse, 'Get Customer Data');
    console.log('Customer data:', customerData);
    // Output: { customerId: "CUST123", accountNumber: "ACC456", status: "ACTIVE" }
    
  } catch (error) {
    console.error('Response handling failed:', error);
  }
};

// Example of handling failure responses
export const failureResponseExample = (): void => {
  try {
    const failureResponse = {
      executionStatus: "Failure",
      executionMessage: "Customer not found in database",
      outParams: null
    };
    
    // This will throw an AltusApiException with the executionMessage
    altusApi.handleAltusResponse(failureResponse, 'Find Customer');
    
  } catch (error) {
    if (error instanceof AltusApiException) {
      console.log('Expected error:', error.message); // "Customer not found in database"
      console.log('Error code:', error.code); // "API_OPERATION_FAILED"
      console.log('Status code:', error.status); // 422
    }
  }
};

// Example of integrating with existing API functions
export const enhancedCustomerLookup = async (identityNo: string): Promise<any> => {
  try {
    console.log(`Looking up customer with ID: ${identityNo}`);
    
    // Use the existing API function (which already uses handleAltusResponse internally)
    const customerDetails = await altusApi.getCustomerDetails(identityNo);
    
    console.log('Customer found:', customerDetails);
    return customerDetails;
    
  } catch (error) {
    if (error instanceof AltusApiException) {
      // Handle different types of errors
      if (error.code === 'API_OPERATION_FAILED') {
        console.log('Customer lookup failed:', error.message);
        // Could be "Customer not found" or similar business logic error
      } else if (error.code === 'NETWORK_CONNECTION_ERROR') {
        console.log('Unable to connect to customer service');
        // Show user-friendly network error message
      } else if (error.code === 'SERVER_ERROR') {
        console.log('Customer service is temporarily unavailable');
        // Show server error message
      }
    }
    
    throw error; // Re-throw for component to handle
  }
};

// ============================================================================
// TYPED ALTUS API EXAMPLES WITH NEW INTERFACES
// ============================================================================

// Example of creating a retail customer with proper typing
export const createRetailCustomerExample = async (): Promise<void> => {
  try {
    const retailCustomerData: RetailCustomerRequest = {
      firstName: "John",
      lastName: "Mwanza",
      nrc: "123456/78/9",
      phoneNumber: "+260977123456",
      emailAddress: "john.mwanza@email.com",
      dateOfBirth: "1990-05-15",
      gender: "Male",
      nationality: "Zambian",
      maritalStatus: "Single",
      address: {
        street: "123 Cairo Road",
        city: "Lusaka",
        province: "Lusaka",
        postalCode: "10101",
        country: "Zambia"
      },
      employment: {
        employerId: "EMP001",
        employerName: "Zambia Police Service",
        employerCode: "ZPS",
        position: "Police Officer",
        department: "Traffic Department",
        salary: 8500,
        employmentDate: "2020-01-15",
        employmentType: "Permanent"
      },
      nextOfKin: {
        firstName: "Mary",
        lastName: "Mwanza",
        relationship: "Sister",
        phoneNumber: "+260977654321",
        address: "456 Independence Avenue, Lusaka"
      }
    };

    const customer = await altusApi.createRetailCustomer(retailCustomerData);
    console.log('Customer created successfully:', customer?.customerId);
    
  } catch (error) {
    if (error instanceof AltusApiException) {
      console.error('Customer creation failed:', error.message);
    }
  }
};

// Example of getting loan details with proper return typing
export const getLoanDetailsExample = async (loanId: string): Promise<void> => {
  try {
    const loanDetails = await altusApi.getLoanDetails(loanId);
    
    if (loanDetails) {
      console.log('Loan Information:');
      console.log(`- Loan ID: ${loanDetails.loanId}`);
      console.log(`- Product: ${loanDetails.productName}`);
      console.log(`- Amount: ${loanDetails.currency} ${loanDetails.loanAmount?.toLocaleString()}`);
      console.log(`- Status: ${loanDetails.status}`);
      console.log(`- Monthly Payment: ${loanDetails.currency} ${loanDetails.monthlyInstallment?.toLocaleString()}`);
      
      if (loanDetails.customer) {
        console.log(`- Customer: ${loanDetails.customer.firstName} ${loanDetails.customer.lastName}`);
      }
      
      if (loanDetails.totalBalance) {
        console.log(`- Outstanding Balance: ${loanDetails.currency} ${loanDetails.totalBalance.toLocaleString()}`);
      }
    }
    
  } catch (error) {
    if (error instanceof AltusApiException) {
      console.error('Failed to get loan details:', error.message);
    }
  }
};

// Example of checking loan balance with typed response
export const checkLoanBalanceExample = async (loanId: string): Promise<void> => {
  try {
    const balance = await altusApi.getLoanBalance(loanId);
    
    if (balance) {
      console.log('Loan Balance Details:');
      console.log(`- Principal: ${balance.currency} ${balance.principalBalance?.toLocaleString()}`);
      console.log(`- Interest: ${balance.currency} ${balance.interestBalance?.toLocaleString()}`);
      console.log(`- Total: ${balance.currency} ${balance.totalBalance?.toLocaleString()}`);
      
      if (balance.nextPaymentDate && balance.nextPaymentAmount) {
        console.log(`- Next Payment: ${balance.currency} ${balance.nextPaymentAmount.toLocaleString()} on ${balance.nextPaymentDate}`);
      }
      
      if (balance.overdueAmount && balance.overdueAmount > 0) {
        console.log(`- OVERDUE: ${balance.currency} ${balance.overdueAmount.toLocaleString()}`);
      }
    }
    
  } catch (error) {
    if (error instanceof AltusApiException) {
      console.error('Failed to get loan balance:', error.message);
    }
  }
};

// Example of getting loan product details with typing
export const getLoanProductExample = async (productCode: string, employerId: string): Promise<void> => {
  try {
    const product = await altusApi.getLoanProductDetails(productCode, employerId);
    
    if (product) {
      console.log('Loan Product Details:');
      console.log(`- Name: ${product.productName}`);
      console.log(`- Description: ${product.productDescription}`);
      console.log(`- Category: ${product.category}`);
      
      if (product.loanTerms) {
        console.log('Loan Terms:');
        console.log(`  - Amount Range: ${product.currency} ${product.loanTerms.minAmount?.toLocaleString()} - ${product.loanTerms.maxAmount?.toLocaleString()}`);
        console.log(`  - Tenure: ${product.loanTerms.minTenureMonths} - ${product.loanTerms.maxTenureMonths} months`);
        console.log(`  - Interest Rate: ${product.loanTerms.interestRate}% ${product.loanTerms.interestRateType}`);
      }
      
      if (product.eligibility) {
        console.log('Eligibility:');
        if (product.eligibility.minSalary) {
          console.log(`  - Minimum Salary: ${product.currency} ${product.eligibility.minSalary.toLocaleString()}`);
        }
        if (product.eligibility.minEmploymentMonths) {
          console.log(`  - Minimum Employment: ${product.eligibility.minEmploymentMonths} months`);
        }
      }
    }
    
  } catch (error) {
    if (error instanceof AltusApiException) {
      console.error('Failed to get product details:', error.message);
    }
  }
};

// Example of submitting a loan request
export const submitLoanRequestExample = async (): Promise<void> => {
  try {
    const loanRequestData = {
      customerId: "CUST123456",
      productCode: "PAYROLL001",
      requestedAmount: 50000,
      tenureMonths: 24,
      purpose: "Home improvement",
      guarantors: [
        {
          firstName: "Alice",
          lastName: "Banda",
          nrc: "987654/32/1",
          phoneNumber: "+260966123456",
          relationship: "Friend"
        }
      ]
    };

    const response = await altusApi.submitLoanRequest(loanRequestData);
    
    if (response) {
      console.log('Loan request submitted successfully:');
      console.log(`- Application ID: ${response.applicationId}`);
      console.log(`- Reference Number: ${response.referenceNumber}`);
      console.log(`- Status: ${response.status}`);
      console.log(`- Application Date: ${response.applicationDate}`);
      
      if (response.estimatedProcessingDays) {
        console.log(`- Estimated processing: ${response.estimatedProcessingDays} days`);
      }
    }
    
  } catch (error) {
    if (error instanceof AltusApiException) {
      console.error('Loan request failed:', error.message);
    }
  }
};