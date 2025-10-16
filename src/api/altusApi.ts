import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import type {
  LoanBalanceResponse,
  LoanStatusResponse,
  LoanDetailsResponse,
  RetailCustomerRequest,
  BusinessCustomerRequest,
  CustomerDetailsResponse,
  LoanProductResponse,
  LoanRequestResponse,
  UploadDocumentResponse,
  AltusApiRequest,
  AltusBaseResponse
} from '../types/altus';

// API Configuration
const ALTUS_BASE_URL = 'http://3.6.174.212:5010/';

// Request timeout in milliseconds (30 seconds)
const REQUEST_TIMEOUT = 30000;

// Get Bearer token from environment or localStorage with fallback
const getInitialBearerToken = (): string | null => {
  // Priority 1: Environment variable (recommended for production)
  const envToken = process.env.REACT_APP_ALTUS_BEARER_TOKEN;
  if (envToken && envToken.length > 50) {
    console.log('[Altus API] Using Bearer token from environment variable');
    return envToken;
  }
  
  // Priority 2: localStorage (for development/testing)
  const storedToken = localStorage.getItem('altus_bearer_token');
  if (storedToken && storedToken.length > 50) {
    console.log('[Altus API] Using Bearer token from localStorage');
    return storedToken;
  }
  
  // Priority 3: Fallback token (UAT token - should be replaced)
  const fallbackToken = '0B9574489-7EC5-4373-94DA-871FDE07CF8EC3BEA3AF-C9B7-4DEA-AE35-EA1C626191C00314393C-29B4-4E60-8D11-595EDAAAC42F10';
  console.warn('[Altus API] Using fallback Bearer token - this should be replaced with your actual UAT token');
  console.warn('[Altus API] Set REACT_APP_ALTUS_BEARER_TOKEN environment variable or use updateBearerToken()');
  return fallbackToken;
};

// Token storage for dynamic updates
let currentBearerToken: string | null = getInitialBearerToken();

// Custom error types
export interface AltusApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export class AltusApiException extends Error {
  public status?: number;
  public code?: string;
  public details?: any;

  constructor(error: AltusApiError) {
    super(error.message);
    this.name = 'AltusApiException';
    this.status = error.status;
    this.code = error.code;
    this.details = error.details;
  }
}

// Create Axios instance with default configuration
const altusApiClient: AxiosInstance = axios.create({
  baseURL: ALTUS_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Function to get current Bearer token
const getBearerToken = (): string | null => {
  // Return the current token (could be updated dynamically)
  return currentBearerToken;
};

// Function to update the Bearer token dynamically
export const updateBearerToken = (newToken: string | null): void => {
  currentBearerToken = newToken;
  
  // Also store in localStorage for persistence across sessions
  if (newToken) {
    localStorage.setItem('altus_bearer_token', newToken);
    console.log('[Altus API] Bearer token updated and stored');
  } else {
    localStorage.removeItem('altus_bearer_token');
    console.log('[Altus API] Bearer token cleared from storage');
  }
};

// Function to clear the Bearer token
export const clearBearerToken = (): void => {
  currentBearerToken = null;
  localStorage.removeItem('altus_bearer_token');
  console.log('[Altus API] Bearer token cleared from memory and storage');
};

// Function to get current token status for debugging
export const getTokenStatus = (): { 
  hasToken: boolean; 
  isValid: boolean; 
  tokenPreview?: string;
  tokenLength?: number;
} => {
  const token = getBearerToken();
  const hasToken = !!token;
  const isValid = isTokenValid(token);
  
  return {
    hasToken,
    isValid,
    tokenPreview: token ? `${token.substring(0, 20)}...` : undefined,
    tokenLength: token?.length
  };
};

// Function to check if token is valid (basic validation)
const isTokenValid = (token: string | null): boolean => {
  if (!token) {
    return false;
  }
  
  // Basic token format validation
  if (token.length < 50) {
    console.warn('[Altus API] Token appears to be too short or invalid format');
    return false;
  }
  
  // Add more sophisticated validation if needed
  // For example, JWT token expiration checking
  return true;
};

// Request interceptor for adding Bearer token and handling token issues
altusApiClient.interceptors.request.use(
  (config) => {
    const token = getBearerToken();
    
    if (!token) {
      console.warn('[Altus API] No Bearer token available for request to:', config.url);
      console.warn('[Altus API] Request may fail due to missing authentication');
    } else if (!isTokenValid(token)) {
      console.warn('[Altus API] Bearer token appears to be invalid or expired');
      console.warn('[Altus API] Request may fail due to authentication issues');
    } else {
      // Add valid token to Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`[Altus API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[Altus API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Request interceptor for logging and additional configuration (keeping existing one)
altusApiClient.interceptors.request.use(
  (config) => {
    // Additional request processing can go here
    return config;
  },
  (error) => {
    console.error('[Altus API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
altusApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`[Altus API] Response ${response.status} from ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    // Handle token-related errors specifically
    if (error.response?.status === 401) {
      const currentToken = getBearerToken();
      if (!currentToken) {
        console.warn('[Altus API] 401 Unauthorized - No Bearer token provided');
        console.warn('[Altus API] Please set a valid Bearer token using updateBearerToken()');
      } else {
        console.warn('[Altus API] 401 Unauthorized - Bearer token may be expired or invalid');
        console.warn('[Altus API] Current token:', currentToken.substring(0, 20) + '...');
        console.warn('[Altus API] Consider refreshing the token or checking token validity');
      }
    }
    
    const altusError = handleApiError(error);
    console.error('[Altus API] Response error:', altusError);
    return Promise.reject(new AltusApiException(altusError));
  }
);

// Comprehensive error handler
function handleApiError(error: AxiosError): AltusApiError {
  // Network or timeout errors
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return {
        message: 'Request timeout - server took too long to respond',
        code: 'TIMEOUT',
        details: { timeout: REQUEST_TIMEOUT }
      };
    }
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return {
        message: 'Unable to connect to Altus server - please check your internet connection',
        code: 'NETWORK_ERROR',
        details: { originalError: error.code }
      };
    }

    return {
      message: 'Network error occurred while connecting to Altus server',
      code: 'NETWORK_ERROR',
      details: { originalError: error.message }
    };
  }

  // HTTP status errors
  const status = error.response.status;
  const responseData = error.response.data as any;

  switch (status) {
    case 400:
      return {
        message: responseData?.message || 'Invalid request data provided',
        status,
        code: 'BAD_REQUEST',
        details: responseData
      };
    
    case 401:
      return {
        message: 'Authentication failed - invalid or expired token',
        status,
        code: 'UNAUTHORIZED',
        details: responseData
      };
    
    case 403:
      return {
        message: 'Access denied - insufficient permissions',
        status,
        code: 'FORBIDDEN',
        details: responseData
      };
    
    case 404:
      return {
        message: 'Requested resource not found',
        status,
        code: 'NOT_FOUND',
        details: responseData
      };
    
    case 422:
      return {
        message: 'Validation failed - please check your input data',
        status,
        code: 'VALIDATION_ERROR',
        details: responseData
      };
    
    case 429:
      return {
        message: 'Too many requests - please try again later',
        status,
        code: 'RATE_LIMIT',
        details: responseData
      };
    
    case 500:
      return {
        message: 'Internal server error - please try again later',
        status,
        code: 'SERVER_ERROR',
        details: responseData
      };
    
    case 502:
    case 503:
    case 504:
      return {
        message: 'Server temporarily unavailable - please try again later',
        status,
        code: 'SERVICE_UNAVAILABLE',
        details: responseData
      };
    
    default:
      return {
        message: `Unexpected error occurred (${status})`,
        status,
        code: 'UNKNOWN_ERROR',
        details: responseData
      };
  }
}

// Generic helper function for POST requests with payload
export async function postWithPayload<TRequest, TResponse>(
  endpoint: string,
  payload: TRequest,
  config?: AxiosRequestConfig
): Promise<TResponse> {
  try {
    const response = await altusApiClient.post<TResponse>(endpoint, payload, config);
    
    // Validate response structure
    if (!response.data) {
      throw new AltusApiException({
        message: 'Invalid response: missing data',
        code: 'INVALID_RESPONSE',
        details: { endpoint, payload }
      });
    }
    
    return response.data;
  } catch (error) {
    if (error instanceof AltusApiException) {
      throw error;
    }
    
    // Handle unexpected errors
    throw new AltusApiException({
      message: 'Unexpected error during API request',
      code: 'UNEXPECTED_ERROR',
      details: { endpoint, error: error instanceof Error ? error.message : error }
    });
  }
}

// Generic helper function for GET requests
export async function get<TResponse>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<TResponse> {
  try {
    const response = await altusApiClient.get<TResponse>(endpoint, config);
    
    if (!response.data) {
      throw new AltusApiException({
        message: 'Invalid response: missing data',
        code: 'INVALID_RESPONSE',
        details: { endpoint }
      });
    }
    
    return response.data;
  } catch (error) {
    if (error instanceof AltusApiException) {
      throw error;
    }
    
    throw new AltusApiException({
      message: 'Unexpected error during API request',
      code: 'UNEXPECTED_ERROR',
      details: { endpoint, error: error instanceof Error ? error.message : error }
    });
  }
}

// Helper function for PUT requests
export async function put<TRequest, TResponse>(
  endpoint: string,
  payload: TRequest,
  config?: AxiosRequestConfig
): Promise<TResponse> {
  try {
    const response = await altusApiClient.put<TResponse>(endpoint, payload, config);
    
    if (!response.data) {
      throw new AltusApiException({
        message: 'Invalid response: missing data',
        code: 'INVALID_RESPONSE',
        details: { endpoint, payload }
      });
    }
    
    return response.data;
  } catch (error) {
    if (error instanceof AltusApiException) {
      throw error;
    }
    
    throw new AltusApiException({
      message: 'Unexpected error during API request',
      code: 'UNEXPECTED_ERROR',
      details: { endpoint, error: error instanceof Error ? error.message : error }
    });
  }
}

// Helper function for DELETE requests
export async function del<TResponse>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<TResponse> {
  try {
    const response = await altusApiClient.delete<TResponse>(endpoint, config);
    
    if (!response.data) {
      throw new AltusApiException({
        message: 'Invalid response: missing data',
        code: 'INVALID_RESPONSE',
        details: { endpoint }
      });
    }
    
    return response.data;
  } catch (error) {
    if (error instanceof AltusApiException) {
      throw error;
    }
    
    throw new AltusApiException({
      message: 'Unexpected error during API request',
      code: 'UNEXPECTED_ERROR',
      details: { endpoint, error: error instanceof Error ? error.message : error }
    });
  }
}

// Specialized helper for file uploads (multipart/form-data)
export async function uploadFile<TResponse>(
  endpoint: string,
  formData: FormData,
  onUploadProgress?: (progressEvent: any) => void
): Promise<TResponse> {
  try {
    const response = await altusApiClient.post<TResponse>(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    
    if (!response.data) {
      throw new AltusApiException({
        message: 'Invalid response: missing data',
        code: 'INVALID_RESPONSE',
        details: { endpoint }
      });
    }
    
    return response.data;
  } catch (error) {
    if (error instanceof AltusApiException) {
      throw error;
    }
    
    throw new AltusApiException({
      message: 'Unexpected error during file upload',
      code: 'UPLOAD_ERROR',
      details: { endpoint, error: error instanceof Error ? error.message : error }
    });
  }
}

// Helper to check API health/connectivity
export async function checkApiHealth(): Promise<{ status: string; timestamp: string }> {
  try {
    // Try a simple GET request to test connectivity
    await altusApiClient.get('/health', {
      timeout: 5000, // Shorter timeout for health check
    });
    
    return {
      status: 'connected',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'disconnected',
      timestamp: new Date().toISOString()
    };
  }
}

// ============================================================================
// CUSTOMER SERVICES API FUNCTIONS
// Base URL: http://3.6.174.212:5011/API/CustomerServices
// ============================================================================

// ============================================================================
// ENHANCED ALTUS RESPONSE HANDLER
// ============================================================================

// Enhanced helper function for handling Altus API responses with better error handling
export function handleAltusResponse<T extends { 
  executionStatus?: string; 
  executionMessage?: string; 
  outParams?: any; 
}>(
  response: T,
  operation?: string
): any {
  try {
    // Check for successful execution status
    if (response.executionStatus === "Success") {
      // Return outParams if available, otherwise return the full response
      return response.outParams !== undefined ? response.outParams : response;
    }
    
    // Handle failure status
    if (response.executionStatus === "Failure") {
      const errorMessage = response.executionMessage || 
        (operation ? `${operation} failed` : 'API operation failed');
      
      throw new AltusApiException({
        message: errorMessage,
        code: 'API_OPERATION_FAILED',
        status: 422, // Business logic failure
        details: {
          operation,
          executionStatus: response.executionStatus,
          executionMessage: response.executionMessage,
          fullResponse: response
        }
      });
    }
    
    // Handle unknown execution status
    const unknownStatus = response.executionStatus || 'UNKNOWN';
    throw new AltusApiException({
      message: `Unexpected execution status: ${unknownStatus}`,
      code: 'UNKNOWN_EXECUTION_STATUS',
      status: 422,
      details: {
        operation,
        executionStatus: response.executionStatus,
        fullResponse: response
      }
    });
    
  } catch (error) {
    // If it's already an AltusApiException, re-throw it
    if (error instanceof AltusApiException) {
      throw error;
    }
    
    // Handle network errors and 500 errors with readable messages
    if (error && typeof error === 'object') {
      const axiosError = error as any;
      
      // Network connection errors
      if (axiosError.code === 'ENOTFOUND' || axiosError.code === 'ECONNREFUSED') {
        throw new AltusApiException({
          message: 'Unable to connect to Altus server. Please check your internet connection and try again.',
          code: 'NETWORK_CONNECTION_ERROR',
          status: 0,
          details: {
            operation,
            originalError: axiosError.code,
            message: axiosError.message
          }
        });
      }
      
      // Timeout errors
      if (axiosError.code === 'ECONNABORTED') {
        throw new AltusApiException({
          message: 'Request timed out. The Altus server is taking too long to respond.',
          code: 'REQUEST_TIMEOUT',
          status: 408,
          details: {
            operation,
            timeout: REQUEST_TIMEOUT,
            originalError: axiosError.message
          }
        });
      }
      
      // Server errors (500, 502, 503, 504)
      if (axiosError.response && axiosError.response.status >= 500) {
        const status = axiosError.response.status;
        let message = 'Server error occurred. Please try again later.';
        
        switch (status) {
          case 500:
            message = 'Internal server error. The Altus server encountered an unexpected problem.';
            break;
          case 502:
            message = 'Bad gateway. The Altus server is temporarily unavailable.';
            break;
          case 503:
            message = 'Service unavailable. The Altus server is temporarily down for maintenance.';
            break;
          case 504:
            message = 'Gateway timeout. The Altus server is taking too long to respond.';
            break;
        }
        
        throw new AltusApiException({
          message,
          code: 'SERVER_ERROR',
          status,
          details: {
            operation,
            serverResponse: axiosError.response.data,
            originalError: axiosError.message
          }
        });
      }
    }
    
    // Generic unexpected error
    throw new AltusApiException({
      message: 'An unexpected error occurred while processing the response.',
      code: 'RESPONSE_PROCESSING_ERROR',
      details: {
        operation,
        originalError: error instanceof Error ? error.message : String(error)
      }
    });
  }
}

// Create a new retail customer
export async function createRetailCustomer(data: RetailCustomerRequest): Promise<CustomerDetailsResponse> {
  const customerServicesClient = axios.create({
    baseURL: 'http://3.6.174.212:5011/',
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${getBearerToken()}`
    },
  });

  try {
    // UAT API requires specific request format with 'body' wrapper and specific fields
    const uatRequest = {
      body: {
        Command: "Create",
        FirstName: data.firstName,
        MiddleName: "", // Optional field
        LastName: data.lastName || "",
        CustomerStatus: "Active",
        NRCIssueDate: "07/01/2020 00:00:00", // TODO: Use actual NRC issue date
        UpdatedBy: "system", // TODO: Use actual user
        PrimaryAddress: data.address?.street || "",
        ProvinceName: data.address?.province || "Lusaka",
        DistrictName: data.address?.city || "Lusaka", 
        CountryName: data.address?.country || "Zambia",
        Postalcode: data.address?.postalCode || "10101",
        NRCNumber: data.nrc,
        ContactNo: data.phoneNumber,
        EmailID: data.emailAddress || "",
        BranchName: "Lusaka", // TODO: Use actual branch
        GenderName: data.gender || "Male",
        Title: data.gender === "Female" ? "Mrs" : "Mr",
        DOB: data.dateOfBirth || "01/01/1990 00:00:00",
        FinancialInstitutionName: data.bankDetails?.bankName || "Indo Zambia Bank",
        FinancialInstitutionBranchName: data.bankDetails?.branchCode || "Lusaka",
        AccountNumber: data.bankDetails?.accountNumber || "TBC",
        AccountType: data.bankDetails?.accountType || "Savings"
      }
    };

    console.log('Debug: UAT Customer Creation Request:', uatRequest);
    const response = await customerServicesClient.post<CustomerDetailsResponse>('API/CustomerServices/RetailCustomer', uatRequest);

    return response.data; // Return full UAT response
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const altusError = handleApiError(error);
      throw new AltusApiException(altusError);
    }
    throw error;
  }
}

// Create a new business customer
export async function createBusinessCustomer(data: BusinessCustomerRequest): Promise<CustomerDetailsResponse['outParams']> {
  const customerServicesClient = axios.create({
    baseURL: 'http://3.6.174.212:5011/',
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${getBearerToken()}`
    },
  });

  try {
    const response = await customerServicesClient.post<CustomerDetailsResponse>('API/CustomerServices', {
      body: data
    });

    return handleAltusResponse(response.data, 'Create Business Customer');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const altusError = handleApiError(error);
      throw new AltusApiException(altusError);
    }
    throw error;
  }
}

// Update an existing retail customer
export async function updateRetailCustomer(data: RetailCustomerRequest): Promise<CustomerDetailsResponse['outParams']> {
  const customerServicesClient = axios.create({
    baseURL: 'http://3.6.174.212:5011/',
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${getBearerToken()}`
    },
  });

  try {
    const response = await customerServicesClient.post<CustomerDetailsResponse>('API/CustomerServices', {
      body: data
    });

    return handleAltusResponse(response.data, 'Update Retail Customer');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const altusError = handleApiError(error);
      throw new AltusApiException(altusError);
    }
    throw error;
  }
}

// Update an existing business customer
export async function updateBusinessCustomer(data: BusinessCustomerRequest): Promise<CustomerDetailsResponse['outParams']> {
  const customerServicesClient = axios.create({
    baseURL: 'http://3.6.174.212:5011/',
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${getBearerToken()}`
    },
  });

  try {
    const response = await customerServicesClient.post<CustomerDetailsResponse>('API/CustomerServices', {
      body: data
    });

    return handleAltusResponse(response.data, 'Update Business Customer');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const altusError = handleApiError(error);
      throw new AltusApiException(altusError);
    }
    throw error;
  }
}

// Get customer details by identity number
export async function getCustomerDetails(identityNo: string): Promise<CustomerDetailsResponse['outParams']> {
  const customerServicesClient = axios.create({
    baseURL: 'http://3.6.174.212:5011/',
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${getBearerToken()}`
    },
  });

  try {
    // UAT API request format
    const uatRequest = {
      body: {
        IdentityNo: identityNo
      }
    };

    console.log('Debug: UAT Get Customer Request:', uatRequest);
    const response = await customerServicesClient.post<CustomerDetailsResponse>('API/CustomerServices/GetCustomerDetails', uatRequest);

    return handleAltusResponse(response.data, 'Get Customer Details');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const altusError = handleApiError(error);
      throw new AltusApiException(altusError);
    }
    throw error;
  }
}

// ============================================================================
// LOAN SERVICES API FUNCTIONS
// Base URL: http://3.6.174.212:5010/API/LoanServices
// ============================================================================

// Get loan balance by loan ID
export async function getLoanBalance(loanId: string): Promise<LoanBalanceResponse['outParams']> {
  try {
    const response = await altusApiClient.post<LoanBalanceResponse>('API/LoanServices', {
      body: { loanId }
    });

    return handleAltusResponse(response.data, 'Get Loan Balance');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const altusError = handleApiError(error);
      throw new AltusApiException(altusError);
    }
    throw error;
  }
}

// Get loan status by loan ID
export async function getLoanStatus(loanId: string): Promise<LoanStatusResponse['outParams']> {
  try {
    const response = await altusApiClient.post<LoanStatusResponse>('API/LoanServices', {
      body: { loanId }
    });

    return handleAltusResponse(response.data, 'Get Loan Status');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const altusError = handleApiError(error);
      throw new AltusApiException(altusError);
    }
    throw error;
  }
}

// Get loan details by loan ID
export async function getLoanDetails(loanId: string): Promise<LoanDetailsResponse['outParams']> {
  try {
    const response = await altusApiClient.post<LoanDetailsResponse>('API/LoanServices', {
      body: { loanId }
    });

    return handleAltusResponse(response.data, 'Get Loan Details');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const altusError = handleApiError(error);
      throw new AltusApiException(altusError);
    }
    throw error;
  }
}

// ============================================================================
// LOAN PRODUCT SERVICES API FUNCTIONS
// Base URL: http://3.6.174.212:5012/API/GetLoanProducts
// ============================================================================

// Get loan product details by product code and employer ID
export async function getLoanProductDetails(productCode: string, employerId: string): Promise<LoanProductResponse['outParams']> {
  const loanProductClient = axios.create({
    baseURL: 'http://3.6.174.212:5012/',
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${getBearerToken()}`
    },
  });

  try {
    const response = await loanProductClient.post<LoanProductResponse>('API/GetLoanProducts', {
      body: { productCode, employerId }
    });

    return handleAltusResponse(response.data, 'Get Loan Product Details');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const altusError = handleApiError(error);
      throw new AltusApiException(altusError);
    }
    throw error;
  }
}

// ============================================================================
// LOAN REQUEST SERVICES API FUNCTIONS
// Base URL: http://3.6.174.212:5010/API/LoanServices (same as Loan Services)
// ============================================================================

// Submit a new loan request (returns ApplicationNumber needed for document upload)
export async function submitLoanRequest(data: any): Promise<LoanRequestResponse> {
  try {
    // UAT API request format for salaried loan request
    const uatRequest = {
      body: {
        TypeOfCustomer: "Existing", // Since we created customer first
        CustomerId: data.customerId,
        IdentityNo: data.identityNo || data.nrc,
        ContactNo: data.contactNo || data.phoneNumber,
        EmailId: data.emailId || data.emailAddress,
        Tenure: data.tenureMonths || 12,
        LoanAmount: data.requestedAmount || data.loanAmount,
        EmployerName: data.employerName || "",
        PayrollNo: data.payrollNo || "",
        NetSalary: data.netSalary || 0,
        GrossSalary: data.grossSalary || 0,
        DateOfBirth: data.dateOfBirth || "01/01/1990 00:00:00",
        Gender: data.gender || "Male"
      }
    };

    console.log('Debug: UAT Loan Request:', uatRequest);
    const response = await altusApiClient.post<LoanRequestResponse>('API/LoanServices/SalariedLoanRequest', uatRequest);

    return response.data; // Return full UAT response
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const altusError = handleApiError(error);
      throw new AltusApiException(altusError);
    }
    throw error;
  }
}

// Convert file to byte format for UAT API
async function fileToByteFormat(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        // Convert ArrayBuffer to base64 string for byte format
        const bytes = new Uint8Array(reader.result as ArrayBuffer);
        let binaryString = '';
        for (let i = 0; i < bytes.length; i++) {
          binaryString += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binaryString);
        resolve(base64);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

// Map document types to UAT API codes
const getUATDocumentTypeCode = (docType: string): string => {
  const typeMap: Record<string, string> = {
    'nrc-front': '6',        // NRC ID (Client)
    'nrc-back': '6',         // NRC ID (Client) 
    'payslip-1': '18',       // Payslip (Last 3 months)
    'payslip-2': '18',       // Payslip (Last 3 months)
    'payslip-3': '18',       // Payslip (Last 3 months)
    'payslip': '18',         // Payslip (Last 3 months)
    'reference-letter': '3', // Business Registration Certificate (City Council)
    'work-id': '29',         // Employment Contract
    'selfie': '17',          // Passport (closest match for photo)
    'bank-statement': '30',  // Order Copies (closest match)
    'combined-payslips': '18' // Payslip (Last 3 months)
  };
  
  return typeMap[docType] || '30'; // Default to "Order Copies"
};

// Upload loan document (completely rewritten for UAT API)
export async function uploadLoanDocument(applicationNumber: string, documentType: string, file: File, documentNo?: string): Promise<UploadDocumentResponse> {
  try {
    // Create document upload client (port 5013)
    const documentUploadClient = axios.create({
      baseURL: 'http://3.6.174.212:5013/',
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${getBearerToken()}`
      },
    });

    // Convert file to byte format
    console.log('Debug: Converting file to byte format...');
    const documentContent = await fileToByteFormat(file);
    
    // Get UAT document type code
    const typeCode = getUATDocumentTypeCode(documentType);
    
    // UAT API request format
    const uatRequest = {
      body: {
        ApplicationNumber: applicationNumber,
        TypeOfDocument: typeCode,
        DocumentNo: documentNo || Date.now().toString(),
        Document: {
          documentContent: documentContent,
          documentName: file.name
        }
      }
    };

    console.log('Debug: UAT Document Upload Request:', {
      applicationNumber,
      documentType,
      typeCode,
      fileName: file.name,
      fileSize: file.size
    });

    const uploadResponse = await documentUploadClient.post<UploadDocumentResponse>('API/LoanRequest/LoanRequestDocuments', uatRequest);

    return uploadResponse.data; // Return full UAT response
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const altusError = handleApiError(error);
      throw new AltusApiException(altusError);
    }
    throw error;
  }
}

// Legacy function for backward compatibility (now deprecated)
export async function uploadLoanDocumentLegacy(formData: FormData): Promise<UploadDocumentResponse['outParams']> {
  console.warn('Warning: uploadLoanDocumentLegacy is deprecated. Use uploadLoanDocument with ApplicationNumber instead.');
  throw new AltusApiException({
    message: 'Document upload requires ApplicationNumber from loan request. Please submit loan request first.',
    code: 'WORKFLOW_ERROR',
    details: { 
      requiredFlow: 'Customer Creation → Loan Request → Document Upload',
      currentApi: 'uploadLoanDocument(applicationNumber, documentType, file)'
    }
  });
}

// Export the configured axios instance for advanced usage
export { altusApiClient };

// Export default instance with common methods and API functions
const altusApi = {
  // Generic HTTP methods
  get,
  post: postWithPayload,
  put,
  delete: del,
  uploadFile,
  checkHealth: checkApiHealth,
  
  // Response handling helpers
  handleAltusResponse,
  
  // Token management
  updateToken: updateBearerToken,
  clearToken: clearBearerToken,
  getTokenStatus,
  
  // Customer Services API
  createRetailCustomer,
  createBusinessCustomer,
  updateRetailCustomer,
  updateBusinessCustomer,
  getCustomerDetails,
  
  // Loan Services API
  getLoanBalance,
  getLoanStatus,
  getLoanDetails,
  
  // Loan Product Services API
  getLoanProductDetails,
  
  // Loan Request Services API
  submitLoanRequest,
  uploadLoanDocument,
  uploadLoanDocumentLegacy, // For backward compatibility
  
  // Raw axios client for advanced usage
  client: altusApiClient,
};

export default altusApi;