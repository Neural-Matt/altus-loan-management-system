import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import type {
  LoanBalanceResponse,
  LoanStatusResponse,
  LoanDetailsResponse,
  RetailCustomerRequest,
  BusinessCustomerRequest,
  CustomerDetailsResponse,
  LoanProductResponse,
  LoanRequestResponse,
  UploadDocumentResponse
} from '../types/altus';
import { CURRENT_API_CONFIG } from '../config/apiConfig';
import { getDefaultBranchForProvince, isValidBranchName, getBranchByPartialMatch } from '../constants/branchConstants';
import { PROVINCE_ID_MAP, DISTRICT_SEQUENTIAL_MAP, BRANCH_ID_MAP, BANK_ID_MAP, BANK_BRANCH_ID_MAP, TITLE_ID_MAP, GENDER_ID_MAP, ACCOUNT_TYPE_ID_MAP, EMPLOYMENT_TYPE_ID_MAP, RELATIONSHIP_ID_MAP, COUNTRY_CODE_MAP } from '../constants/altusLookups';
import mapToCode from '../utils/mapToCode';

// API Configuration - Uses environment-aware config (proxy in prod, direct in dev)
const ALTUS_BASE_URLS = {
  LOAN_SERVICES: CURRENT_API_CONFIG.LOAN_SERVICES_BASE,
  CUSTOMER_SERVICES: CURRENT_API_CONFIG.CUSTOMER_SERVICES_BASE,
  PRODUCT_SERVICES: CURRENT_API_CONFIG.PRODUCT_SERVICES_BASE,
  DOCUMENT_SERVICES: CURRENT_API_CONFIG.DOCUMENT_SERVICES_BASE,
  LOAN_LIST_SERVICES: CURRENT_API_CONFIG.EMI_CALCULATOR_BASE,
};

// Request timeout in milliseconds (30 seconds)
const REQUEST_TIMEOUT = 30000;

// Fixed Bearer token from UAT Documentation - exact match
const FIXED_BEARER_TOKEN = '0B9574489-7EC5-4373-94DA-871FDE07CF8EC3BEA3AF-C9B7-4DEA-AE35-EA1C626191C00314393C-29B4-4E60-8D11-595EDAAAC42F10';

// Get Bearer token - using fixed token as per documentation
const getInitialBearerToken = (): string => {
  console.log('[Altus API] Using fixed Bearer token from UAT documentation');
  return FIXED_BEARER_TOKEN;
};

// Token storage - using fixed token from documentation
let currentBearerToken: string = getInitialBearerToken();

// Helper function to convert YYYY-MM-DD to MM/DD/YYYY HH:MM:SS format (Altus API requirement)
const formatDateForAltus = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year} 00:00:00`;
};

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

// Create Axios instances with exact URLs from documentation
const createApiClient = (baseURL: string): AxiosInstance => axios.create({
  baseURL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${currentBearerToken}`
  },
});

// API clients for each service - matching documentation ports exactly
const loanServicesClient = createApiClient(ALTUS_BASE_URLS.LOAN_SERVICES);
const customerServicesClient = createApiClient(ALTUS_BASE_URLS.CUSTOMER_SERVICES);
const productServicesClient = createApiClient(ALTUS_BASE_URLS.PRODUCT_SERVICES);
const documentServicesClient = createApiClient(ALTUS_BASE_URLS.DOCUMENT_SERVICES);
const loanListServicesClient = createApiClient(ALTUS_BASE_URLS.LOAN_LIST_SERVICES);

// Function to get current Bearer token - always returns fixed token from documentation
const getBearerToken = (): string => {
  return currentBearerToken;
};

// Function to update the Bearer token (kept for backward compatibility but logs warning)
export const updateBearerToken = (newToken: string | null): void => {
  console.warn('[Altus API] Token update ignored - using fixed token from UAT documentation');
  console.warn('[Altus API] Fixed token:', FIXED_BEARER_TOKEN.substring(0, 20) + '...');
};

// Function to clear the Bearer token (kept for backward compatibility but logs warning)
export const clearBearerToken = (): void => {
  console.warn('[Altus API] Token clear ignored - using fixed token from UAT documentation');
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

// Note: Service-specific clients are configured with interceptors above
// All clients (loanServicesClient, customerServicesClient, etc.) have the same
// token handling and error management setup

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
    const response = await loanServicesClient.post<TResponse>(endpoint, payload, config);
    
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
    const response = await loanServicesClient.get<TResponse>(endpoint, config);
    
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
    const response = await loanServicesClient.put<TResponse>(endpoint, payload, config);
    
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
    const response = await loanServicesClient.delete<TResponse>(endpoint, config);
    
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
    const response = await documentServicesClient.post<TResponse>(endpoint, formData, {
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
    await loanServicesClient.get('/health', {
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
    baseURL: ALTUS_BASE_URLS.CUSTOMER_SERVICES,
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${getBearerToken()}`
    },
  });

  try {
    // Validate required nested objects
    if (!data.address || typeof data.address !== 'object') {
      console.error('Address validation failed:', data.address);
      throw new Error('Address information is required and must be an object');
    }
    if (!data.address.street || !data.address.city || !data.address.province) {
      console.error('Address fields missing:', data.address);
      throw new Error('Address must include street, city, and province');
    }
    if (!data.bankDetails || typeof data.bankDetails !== 'object') {
      console.error('Bank details validation failed:', data.bankDetails);
      throw new Error('Bank details are required and must be an object');
    }
    
    // UAT API requires specific request format with 'body' wrapper and specific fields
    const uatRequest = {
      body: {
        Command: "Create",
        FirstName: data.firstName,
        MiddleName: "", // Optional field
        LastName: data.lastName,
        CustomerStatus: "Active",
        NRCIssueDate: formatDateForAltus(data.nrcIssueDate),
        UpdatedBy: "WebPortal",
        PrimaryAddress: data.address.street || data.address,
        ProvinceName: data.address.province,
        DistrictName: data.address.city, 
        CountryName: data.address.country || "Zambia",
        Postalcode: data.address.postalCode || "",
        NRCNumber: data.nrc,
        ContactNo: data.phoneNumber,
        EmailID: data.emailAddress,
        BranchName: (() => {
          const providedBranch = data.preferredBranch || data.address.province;
          
          // If valid, use as-is
          if (isValidBranchName(providedBranch)) {
            return providedBranch;
          }
          
          // Try to find matching branch by partial name
          const matchedBranch = getBranchByPartialMatch(providedBranch);
          if (matchedBranch) {
            return matchedBranch;
          }
          
          // Fall back to province-based default
          return getDefaultBranchForProvince(data.address.province);
        })(),
        GenderName: mapToCode(data.gender, GENDER_ID_MAP, "GenderName"),
        Title: mapToCode(data.title, TITLE_ID_MAP, "Title"),
        DOB: formatDateForAltus(data.dateOfBirth),
        FinancialInstitutionName: mapToCode(data.bankDetails.bankName, BANK_ID_MAP, "FinancialInstitutionName"),
        FinancialInstitutionBranchName: (() => {
          const bankName = data.bankDetails.bankName;
          const providedBranch = data.bankDetails.branchCode;
          
          // Resolve branch name (may need to match or default)
          let resolvedBranch = providedBranch;
          if (!isValidBranchName(providedBranch)) {
            const matchedBranch = getBranchByPartialMatch(providedBranch);
            resolvedBranch = matchedBranch || getDefaultBranchForProvince(data.address.province);
          }
          
          // Get the FIBranchId from the nested map
          const branchIdMap = BANK_BRANCH_ID_MAP[bankName];
          if (branchIdMap && branchIdMap[resolvedBranch]) {
            const fibBranchId = branchIdMap[resolvedBranch];
            console.log(`[createRetailCustomer] Mapped branch "${resolvedBranch}" to FIBranchId: "${fibBranchId}"`);
            return fibBranchId;
          }
          
          console.warn(`[createRetailCustomer] No FIBranchId found for bank="${bankName}" branch="${resolvedBranch}". Using branch name as fallback.`);
          return resolvedBranch;
        })(),
        AccountNumber: data.bankDetails.accountNumber,
        AccountType: data.bankDetails.accountType,
        // Add ID fields
        Branch: mapToCode((() => {
          const providedBranch = data.preferredBranch || data.address.province;
          if (isValidBranchName(providedBranch)) return providedBranch;
          const matchedBranch = getBranchByPartialMatch(providedBranch);
          if (matchedBranch) return matchedBranch;
          return getDefaultBranchForProvince(data.address.province);
        })(), BRANCH_ID_MAP, "Branch"),
        ProvinceId: mapToCode(data.address.province, PROVINCE_ID_MAP, "Province"),
        Gender: mapToCode(data.gender, GENDER_ID_MAP, "Gender"),
        TitleId: mapToCode(data.title, TITLE_ID_MAP, "Title")
      }
    };

    console.log('Debug: UAT Customer Creation Request:', JSON.stringify(uatRequest, null, 2));
    const response = await customerServicesClient.post<CustomerDetailsResponse>('API/CustomerServices/RetailCustomer', uatRequest);
    
    console.log('Debug: UAT Customer Creation Response:', JSON.stringify(response.data, null, 2));
    
    // Check if API returned failure status
    if (response.data.executionStatus === 'Failure') {
      console.error('API returned failure:', response.data.executionMessage);
      throw new Error(response.data.executionMessage || 'Customer creation failed');
    }

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
    baseURL: ALTUS_BASE_URLS.CUSTOMER_SERVICES,
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${getBearerToken()}`
    },
  });

  try {
    const response = await customerServicesClient.post<CustomerDetailsResponse>('API/CustomerServices/BusinessCustomer', {
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
    baseURL: ALTUS_BASE_URLS.CUSTOMER_SERVICES,
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
    baseURL: ALTUS_BASE_URLS.CUSTOMER_SERVICES,
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
    baseURL: ALTUS_BASE_URLS.CUSTOMER_SERVICES,
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

// Get loan balance by loan ID - exact endpoint from UAT documentation
export async function getLoanBalance(loanId: string): Promise<LoanBalanceResponse['outParams']> {
  try {
    const response = await loanServicesClient.post<LoanBalanceResponse>('API/LoanServices/GetLoanBalance', {
      body: { LoanId: loanId }
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

// Get loan status by loan ID - exact endpoint from UAT documentation
export async function getLoanStatus(loanId: string): Promise<LoanStatusResponse['outParams']> {
  try {
    const response = await loanServicesClient.post<LoanStatusResponse>('API/LoanServices/GetLoanStatus', {
      body: { LoanId: loanId }
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

// Get loan details by loan ID - exact endpoint from UAT documentation
export async function getLoanDetails(loanId: string): Promise<LoanDetailsResponse['outParams']> {
  try {
    const response = await loanServicesClient.post<LoanDetailsResponse>('API/LoanServices/GetLoanDetails', {
      body: { LoanId: loanId }
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
    baseURL: ALTUS_BASE_URLS.PRODUCT_SERVICES,
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${getBearerToken()}`
    },
  });

  try {
    const response = await loanProductClient.post<LoanProductResponse>('API/GetLoanProducts/ProductDetails', {
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
// LOAN REQUEST SERVICES API FUNCTIONS - UAT DOCUMENTATION
// Base URL: http://3.6.174.212:5013/API/LoanRequest (PORT 5013 as per UAT docs)
// ============================================================================

// Submit a new salaried loan request (returns ApplicationNumber needed for document upload)
// UAT Endpoint: POST http://3.6.174.212:5010/API/LoanRequestServices/SubmitLoanRequest
export async function submitLoanRequest(data: any): Promise<LoanRequestResponse> {
  try {
    // Create Loan Request client (port 5010 as per UAT documentation)
    const loanRequestClient = axios.create({
      baseURL: ALTUS_BASE_URLS.LOAN_SERVICES,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${getBearerToken()}`
      },
    });

    // Determine customer type
    const typeOfCustomer = data.TypeOfCustomer || data.typeOfCustomer || "Existing";
    const isNewCustomer = typeOfCustomer === "New";

    // UAT API request format for salaried loan request - exact field names from documentation
    // CRITICAL: For Existing customers, DO NOT include FirstName, MiddleName, LastName, DateOfBirth
    const uatRequest: any = {
      body: {
        TypeOfCustomer: data.TypeOfCustomer || data.typeOfCustomer || "Existing",
        CustomerId: data.CustomerId || data.customerId || "",
        IdentityNo: data.IdentityNo || data.identityNo || "",
        Branch: mapToCode(data.Branch || "Lusaka - HQ", BRANCH_ID_MAP, "Branch"),
        FirstName: data.FirstName || data.firstName || "",
        MiddleName: data.MiddleName || data.middleName || "",
        LastName: data.LastName || data.lastName || "",
        DateOfBirth: data.DateOfBirth || data.dateOfBirth ? formatDateForAltus(data.DateOfBirth || data.dateOfBirth) : "",
        ContactNo: data.ContactNo || data.contactNo || "",
        EmailId: data.EmailId || data.emailId || "",
        PrimaryAddress: data.PrimaryAddress || data.primaryAddress || "",
        ProvinceName: mapToCode((data.ProvinceName || data.provinceName || "Lusaka").replace(" Province", ""), PROVINCE_ID_MAP, "Province"),
        DistrictName: mapToCode(data.DistrictName || data.districtName || "Lusaka", DISTRICT_SEQUENTIAL_MAP, "District"),
        CountryName: mapToCode(data.CountryName || data.countryName || "Zambia", COUNTRY_CODE_MAP, "Country"),
        Postalcode: data.Postalcode || data.postalcode || "",
        EmployeeNumber: data.EmployeeNumber || data.employeeNumber || "",
        Designation: data.Designation || data.designation || "",
        EmployerName: data.EmployerName || data.employerName || "",
        EmploymentType: mapToCode(data.EmploymentType || data.employmentType || "Permanent", EMPLOYMENT_TYPE_ID_MAP, "EmploymentType"),
        GrossIncome: data.GrossIncome || data.grossIncome || 0,
        NetIncome: data.NetIncome || data.netIncome || 0,
        Deductions: data.Deductions || data.deductions || 0,
        Tenure: data.Tenure || data.tenure || 12,
        Gender: mapToCode(data.Gender || data.gender || "Male", GENDER_ID_MAP, "Gender"),
        LoanAmount: data.LoanAmount || data.loanAmount || 0,
        FinancialInstitutionName: mapToCode(data.FinancialInstitutionName || data.financialInstitutionName || "First National Bank", BANK_ID_MAP, "FinancialInstitutionName"),
        FinancialInstitutionBranchName: (() => {
          const bankName = data.FinancialInstitutionName || data.financialInstitutionName || "First National Bank";
          const providedBranch = data.FinancialInstitutionBranchName || data.financialInstitutionBranchName || "Head Office";
          
          // Look up FIBranchId from the nested map using bank name + branch name
          const branchIdMap = BANK_BRANCH_ID_MAP[bankName];
          if (branchIdMap && branchIdMap[providedBranch]) {
            const fibBranchId = branchIdMap[providedBranch];
            console.log(`[submitLoanRequest] Mapped bank="${bankName}" branch="${providedBranch}" to FIBranchId: "${fibBranchId}"`);
            return fibBranchId;
          }
          
          console.warn(`[submitLoanRequest] No FIBranchId found for bank="${bankName}" branch="${providedBranch}". Using branch name as fallback.`);
          return providedBranch;
        })(),
        AccountNumber: data.AccountNumber || data.accountNumber || "",
        AccountType: mapToCode(data.AccountType || data.accountType || "Current", ACCOUNT_TYPE_ID_MAP, "AccountType"),
        ReferrerName: data.ReferrerName || data.referrerName || "",
        ReferrerNRC: data.ReferrerNRC || data.referrerNRC || "",
        ReferrerContactNo: data.ReferrerContactNo || data.referrerContactNo || "",
        ReferrerPhysicalAddress: data.ReferrerPhysicalAddress || data.referrerPhysicalAddress || "",
        ReferrerRelationType: mapToCode(data.ReferrerRelationType || data.referrerRelationType || "Friend", RELATIONSHIP_ID_MAP, "ReferrerRelationType"),
        KinName: data.KinName || data.kinName || "",
        KinNRC: data.KinNRC || data.kinNRC || "",
        KinRelationship: mapToCode(data.KinRelationship || data.kinRelationship || "Father", RELATIONSHIP_ID_MAP, "KinRelationship"),
        KinMobileNo: data.KinMobileNo || data.kinMobileNo || "",
        KinAddress: data.KinAddress || data.kinAddress || "",
        KinProvinceName: mapToCode((data.KinProvinceName || data.kinProvinceName || "Lusaka").replace(" Province", ""), PROVINCE_ID_MAP, "KinProvince"),
        KinDistrictName: mapToCode(data.KinDistrictName || data.kinDistrictName || "Lusaka", DISTRICT_SEQUENTIAL_MAP, "KinDistrict"),
        KinCountryName: mapToCode(data.KinCountryName || data.kinCountryName || "Zambia", COUNTRY_CODE_MAP, "KinCountry")
      }
    };

    // Only include personal details for NEW customers
    if (isNewCustomer) {
      console.log('Debug: New customer loan request - including personal details');
    } else {
      console.log('Debug: Existing customer loan request - including personal details (required by API)');
    }

    // Always include personal details as per working API calls
    console.log('Debug: Loan request - personal details included for both New and Existing customers');

    // Log the FIBranchId being sent to API
    const fibBranchId = uatRequest.body.FinancialInstitutionBranchName;
    console.log('🔐 API Layer - FIBranchId Being Sent:', {
      FIBranchId: fibBranchId,
      isFIBranchIdFormat: fibBranchId && fibBranchId.startsWith('BRH'),
      type: typeof fibBranchId
    });

    console.log("FINAL LOAN PAYLOAD (with codes):", JSON.stringify(uatRequest, null, 2));

    const response = await loanRequestClient.post<LoanRequestResponse>('API/LoanRequestServices/SubmitLoanRequest', uatRequest);

    console.log('Debug: Loan Request Response:', response.data);
    
    // Check for API failure
    if (response.data.executionStatus === 'Failure') {
      throw new Error(response.data.executionMessage || 'Loan request failed');
    }
    
    return response.data; // Return full UAT response
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Debug: Loan Request Error:', error.response?.data);
      const altusError = handleApiError(error);
      throw new AltusApiException(altusError);
    }
    throw error;
  }
}

// Submit a new business loan request - from UAT documentation
// UAT Endpoint: POST http://3.6.174.212:5013/API/LoanRequest/Business
export async function submitBusinessLoanRequest(data: any): Promise<LoanRequestResponse> {
  try {
    // Create Loan Request client (port 5013 as per UAT documentation)
    const loanRequestClient = axios.create({
      baseURL: ALTUS_BASE_URLS.DOCUMENT_SERVICES,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${getBearerToken()}`
      },
    });

    // Determine customer type
    const typeOfCustomer = data.TypeOfCustomer || data.typeOfCustomer || "New";
    const isNewCustomer = typeOfCustomer === "New";

    // UAT API request format for business loan request - exact field names from documentation
    // Note: Business loans typically use CustomerName instead of separate FirstName/LastName
    const uatRequest = {
      body: {
        TypeOfCustomer: typeOfCustomer,
        CustomerId: data.CustomerId || data.customerId || "",
        CustomerName: data.CustomerName || data.customerName || "",
        IdentityNo: data.IdentityNo || data.identityNo || data.registrationNo || "",
        ContactNo: data.ContactNo || data.contactNo || data.phoneNumber || "",
        EmailId: data.EmailId || data.emailId || data.emailAddress || "",
        EstimatedValueOfBusiness: data.EstimatedValueOfBusiness || data.estimatedValueOfBusiness || "0",
        GrossMonthlySales: data.GrossMonthlySales || data.grossMonthlySales || "0",
        Tenure: data.Tenure || data.tenure || data.tenureMonths || 12,
        LoanAmount: data.LoanAmount || data.loanAmount || data.requestedAmount || 0,
        InvoiceDetails: data.InvoiceDetails || data.invoiceDetails || {
          GridData: {
            "0": {
              eColl: {
                InvoiceNo: { Value: "000000" },
                InvoiceAmount: { Value: "0" },
                InvoiceDate: { Value: new Date().toISOString() }
              }
            }
          }
        }
      }
    };

    console.log('Debug: UAT Business Loan Request (Port 5013):', {
      typeOfCustomer,
      customerId: uatRequest.body.CustomerId,
      isNewCustomer
    });
    
    const response = await loanRequestClient.post<LoanRequestResponse>('API/LoanRequest/Business', uatRequest);

    console.log('Debug: Business Loan Request Response:', response.data);
    return response.data; // Return full UAT response
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Debug: Business Loan Request Error:', error.response?.data);
      const altusError = handleApiError(error);
      throw new AltusApiException(altusError);
    }
    throw error;
  }
}

// Convert file to base64 byte format for UAT API (as prescribed in UAT documentation)
// UAT Documentation: "The image needs to be uploaded in the byte format"
// Implementation: Converts file to base64 encoded string
async function fileToByteFormat(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate file before processing
    if (!file || file.size === 0) {
      reject(new Error('Invalid file: File is empty or undefined'));
      return;
    }

    // Check file size (max 10MB for reasonable API limits)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed: 10MB`));
      return;
    }

    console.log(`Debug: Converting file to base64 - Name: ${file.name}, Size: ${(file.size / 1024).toFixed(2)}KB, Type: ${file.type}`);

    const reader = new FileReader();
    
    reader.onload = () => {
      if (reader.result) {
        try {
          // Convert ArrayBuffer to base64 string (byte format as per UAT spec)
          const bytes = new Uint8Array(reader.result as ArrayBuffer);
          let binaryString = '';
          
          // Build binary string from byte array
          for (let i = 0; i < bytes.length; i++) {
            binaryString += String.fromCharCode(bytes[i]);
          }
          
          // Encode to base64 (this is the "byte format" required by UAT API)
          const base64 = btoa(binaryString);
          
          // Validate base64 output
          if (!base64 || base64.length === 0) {
            reject(new Error('Base64 conversion resulted in empty string'));
            return;
          }

          console.log(`Debug: File converted to base64 successfully - Output length: ${base64.length} characters`);
          resolve(base64);
        } catch (conversionError) {
          reject(new Error(`Failed to convert file to base64: ${conversionError instanceof Error ? conversionError.message : 'Unknown error'}`));
        }
      } else {
        reject(new Error('FileReader result is null'));
      }
    };
    
    reader.onerror = () => {
      const errorMsg = reader.error?.message || 'Unknown FileReader error';
      console.error('Debug: FileReader error:', errorMsg);
      reject(new Error(`Failed to read file: ${errorMsg}`));
    };
    
    // Read file as ArrayBuffer (will be converted to base64)
    reader.readAsArrayBuffer(file);
  });
}

// Map document types to UAT API codes
/**
 * Get UAT Document Type Code from friendly name or numeric code
 * Full list of document types from UAT API V2 documentation (section 1.12.5)
 * 
 * IMPORTANT: This function handles BOTH:
 * 1. Friendly names (e.g., 'nrc-front', 'payslip') mapped to codes
 * 2. Numeric codes (e.g., '6', '18') passed through directly
 */
const getUATDocumentTypeCode = (docType: string): string => {
  // If already a valid numeric code (2-3 digits), return as-is
  // Valid codes from API V2: 2,3,6,7,14,15,16,17,18,27,28,29,30
  const validCodes = ['2', '3', '6', '7', '14', '15', '16', '17', '18', '27', '28', '29', '30'];
  if (validCodes.includes(docType)) {
    console.log(`Debug: Document type '${docType}' is already a valid code, using as-is`);
    return docType;
  }
  
  const typeMap: Record<string, string> = {
    // Current form mappings (backward compatible)
    'nrc-front': '6',        // NRC ID (Client)
    'nrc-back': '6',         // NRC ID (Client) 
    'combined-nrc': '6',     // NRC ID (Client) - merged front+back
    'payslip-1': '18',       // Payslip (Last 3 months)
    'payslip-2': '18',       // Payslip (Last 3 months)
    'payslip-3': '18',       // Payslip (Last 3 months)
    'payslip': '18',         // Payslip (Last 3 months)
    'combined-payslips': '18', // Payslip (Last 3 months) - merged 3 payslips
    'reference-letter': '29',  // Employment Contract
    'work-id': '29',           // Employment Contract
    'selfie': '17',            // Passport (closest match for photo)
    'bank-statement': '30',    // Order Copies (closest match)
    
    // Full UAT document type code list (for dropdown/form selection)
    'order-copies': '30',              // Order Copies
    'articles-association': '16',      // Articles of Association
    'board-resolution': '14',          // Board Resolution to borrow
    'company-profile': '15',           // Company profile and details of directors
    'business-reg-council': '3',       // Business Registration Certificate (City Council)
    'business-reg-pacra': '2',         // Business Registration Certificate (PACRA)
    'passport': '17',                  // Passport
    'employment-contract': '29',       // Employment Contract
    'nrc-client': '6',                 // NRC ID (Client)
    'nrc-spouse': '7',                 // NRC ID (Spouse)
    'residence-permit': '28',          // Residence Permit
    'work-permit': '27',               // Work Permit
    'payslips-3months': '18'           // Payslip (Last 3 months)
  };
  
  const mappedCode = typeMap[docType] || '30'; // Default to "Order Copies"
  console.log(`Debug: Mapped document type '${docType}' to code '${mappedCode}'`);
  return mappedCode;
};

// Upload loan document (UAT API compliant with base64 byte format)
// UAT Endpoint: POST http://3.6.174.212:5014/API/LoanRequest/LoanRequestDocuments (PORT 5014!)
// Document format: base64 encoded string in documentContent field
export async function uploadLoanDocument(applicationNumber: string, documentType: string, file: File, documentNo?: string): Promise<UploadDocumentResponse> {
  try {
    // Validate inputs
    if (!applicationNumber || applicationNumber.trim() === '') {
      throw new AltusApiException({
        message: 'Application Number is required for document upload',
        code: 'VALIDATION_ERROR',
        details: { applicationNumber }
      });
    }

    if (!file) {
      throw new AltusApiException({
        message: 'File is required for document upload',
        code: 'VALIDATION_ERROR',
        details: { documentType }
      });
    }

    // Create document upload client (port 5014 as per API V2 docs)
    const documentUploadClient = axios.create({
      baseURL: (ALTUS_BASE_URLS as any).DOCUMENT_UPLOAD_BASE || ALTUS_BASE_URLS.DOCUMENT_SERVICES,
      timeout: REQUEST_TIMEOUT * 2, // Double timeout for file uploads
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${getBearerToken()}`
      },
    });

    // Convert file to base64 byte format (as prescribed in UAT documentation)
    console.log('Debug: Converting file to base64 byte format (UAT requirement)...');
    console.log(`Debug: File details - Name: ${file.name}, Size: ${(file.size / 1024).toFixed(2)}KB, Type: ${file.type}`);
    
    const documentContent = await fileToByteFormat(file);
    
    // Validate base64 conversion
    if (!documentContent || documentContent.length === 0) {
      throw new AltusApiException({
        message: 'File conversion to base64 failed - empty result',
        code: 'CONVERSION_ERROR',
        details: { fileName: file.name, fileSize: file.size }
      });
    }

    console.log(`Debug: File successfully converted to base64 - Length: ${documentContent.length} characters`);
    
    // Get UAT document type code
    const typeCode = getUATDocumentTypeCode(documentType);
    
    // UAT API request format (exact structure from documentation)
    const uatRequest = {
      body: {
        ApplicationNo: applicationNumber,
        TypeOfDocument: typeCode,
        DocumentNo: documentNo || `DOC${Date.now()}`,
        Document: {
          documentContent: documentContent,  // base64 encoded string (byte format)
          documentName: file.name
        }
      }
    };

    console.log('Debug: UAT Document Upload Request:', {
      applicationNumber,
      documentType,
      typeCode,
      fileName: file.name,
      fileSize: file.size,
      base64Length: documentContent.length,
      documentNo: uatRequest.body.DocumentNo
    });

    const uploadResponse = await documentUploadClient.post<UploadDocumentResponse>('API/LoanRequest/LoanRequestDocuments', uatRequest);

    console.log('Debug: Document upload response:', uploadResponse.data);
    
    // Check if upload was successful
    if (uploadResponse.data.executionStatus !== 'Success') {
      console.error('Debug: Document upload failed:', uploadResponse.data);
      throw new AltusApiException({
        message: `Document upload failed: ${uploadResponse.data.executionMessage || 'Unknown error'}`,
        code: 'UPLOAD_FAILED',
        details: uploadResponse.data
      });
    }
    
    return uploadResponse.data; // Return full UAT response
  } catch (error) {
    if (error instanceof AltusApiException) {
      throw error;
    }
    
    if (axios.isAxiosError(error)) {
      console.error('Debug: Document upload error:', error.response?.data);
      const altusError = handleApiError(error);
      throw new AltusApiException(altusError);
    }
    
    console.error('Debug: Unexpected document upload error:', error);
    throw error;
  }
}

// ============================================================================
// LOAN LIST SERVICES API FUNCTIONS (PORT 5009) - FROM UAT DOCUMENTATION
// Base URL: http://3.6.174.212:5009/API/LoanList
// ============================================================================

// Get loans by customer - from UAT documentation
export async function getLoansByCustomer(customerId: string): Promise<any> {
  try {
    const response = await loanListServicesClient.post('API/LoanList/GetLoansByCustomer', {
      body: { CustomerId: customerId }
    });

    return handleAltusResponse(response.data, 'Get Loans by Customer');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const altusError = handleApiError(error);
      throw new AltusApiException(altusError);
    }
    throw error;
  }
}

// EMI Calculator - Updated to correct endpoint on port 5010
export async function calculateEMI(data: {
  LoanType: string;
  ProductCode: string;
  EmployerID?: string;
  LoanAmount: string;
  LoanTenure: string;
}): Promise<any> {
  try {
    const response = await loanServicesClient.post('API/LoanServices/EMICalculator', {
      body: data
    });

    return handleAltusResponse(response.data, 'EMI Calculator');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const altusError = handleApiError(error);
      throw new AltusApiException(altusError);
    }
    throw error;
  }
}

// PBL Loan Eligibility - Updated to correct endpoint on port 5010
export async function getPBLEligibilityStatus(data: {
  CustomerId: string;
  LoanAmount: string;
  LoanTenure: string;
  [key: string]: any;
}): Promise<any> {
  try {
    const response = await loanServicesClient.post('API/LoanServices/PBLEligibilityStatus', {
      body: data
    });

    return handleAltusResponse(response.data, 'PBL Loan Eligibility');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const altusError = handleApiError(error);
      throw new AltusApiException(altusError);
    }
    throw error;
  }
}

/**
 * Get Status - Track customer creation approval status
 * Endpoint: POST http://3.6.174.212:5011/API/CustomerServices/GetStatus
 * CRITICAL: Customer creation returns RequestId (not CustomerID immediately)
 * Must poll this endpoint until RequestStatus changes from "0" (Pending) to "1" (Approved/Rejected)
 */
export async function getCustomerRequestStatus(requestId: string): Promise<{
  RequestId: string;
  RequestStatus: string; // "0" = Pending, "1" = Approved/Rejected
  ResponseCode?: string;
  ResponseMessage?: string;
}> {
  try {
    const response = await customerServicesClient.post('API/CustomerServices/GetStatus', {
      body: {
        RequestId: requestId
      }
    });

    const result = handleAltusResponse(response.data, 'Get Customer Request Status');
    
    console.log('[Get Status] Request status check:', {
      requestId,
      status: result.RequestStatus,
      isPending: result.RequestStatus === "0",
      isApproved: result.RequestStatus === "1"
    });

    return result;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const altusError = handleApiError(error);
      throw new AltusApiException(altusError);
    }
    throw error;
  }
}

/**
 * Poll customer request status until approved/rejected
 * @param requestId The RequestId from customer creation response
 * @param maxAttempts Maximum polling attempts (default: 30)
 * @param intervalMs Polling interval in milliseconds (default: 2000)
 * @returns Final status response when approved/rejected
 */
export async function pollCustomerRequestStatus(
  requestId: string,
  maxAttempts: number = 30,
  intervalMs: number = 2000
): Promise<{
  RequestId: string;
  RequestStatus: string;
  ResponseCode?: string;
  ResponseMessage?: string;
}> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    try {
      const status = await getCustomerRequestStatus(requestId);
      
      // Check if approved/rejected (RequestStatus = "1")
      if (status.RequestStatus === "1") {
        console.log(`[Poll Status] Request ${requestId} completed after ${attempts} attempts`);
        return status;
      }
      
      // Still pending (RequestStatus = "0"), wait and retry
      console.log(`[Poll Status] Attempt ${attempts}/${maxAttempts}: Request ${requestId} still pending...`);
      
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    } catch (error) {
      console.error(`[Poll Status] Error on attempt ${attempts}:`, error);
      
      // If it's the last attempt, throw the error
      if (attempts >= maxAttempts) {
        throw error;
      }
      
      // Otherwise wait and retry
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  
  // Max attempts reached without approval
  throw new AltusApiException({
    message: `Customer request status check timed out after ${maxAttempts} attempts`,
    code: 'POLLING_TIMEOUT',
    details: {
      requestId,
      attempts: maxAttempts,
      intervalMs
    }
  });
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

// Export all service-specific API clients for advanced usage
export { 
  loanServicesClient, 
  customerServicesClient, 
  productServicesClient, 
  documentServicesClient, 
  loanListServicesClient 
};

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
  getCustomerRequestStatus,
  pollCustomerRequestStatus,
  
  // Loan Services API
  getLoanBalance,
  getLoanStatus,
  getLoanDetails,
  
  // Loan Product Services API
  getLoanProductDetails,
  
  // Loan Request Services API
  submitLoanRequest,
  submitBusinessLoanRequest, // Business loan request from UAT documentation
  uploadLoanDocument,
  uploadLoanDocumentLegacy, // For backward compatibility
  
  // Loan List Services API (Port 5009) - from UAT documentation
  getLoansByCustomer,
  calculateEMI,
  getPBLEligibilityStatus,
  
  // Service-specific clients for advanced usage
  clients: {
    loan: loanServicesClient,
    customer: customerServicesClient,
    product: productServicesClient,
    document: documentServicesClient,
    loanList: loanListServicesClient,
  },
};

export default altusApi;
