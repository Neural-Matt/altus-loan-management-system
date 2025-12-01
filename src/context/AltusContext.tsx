import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import altusApi, { AltusApiException } from '../api/altusApi';
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
  LoanStatus,
  CustomerStatus
} from '../types/altus';

// ============================================================================
// ALTUS CONTEXT STATE INTERFACES
// ============================================================================

export interface CustomerData {
  customerId?: string;
  firstName: string;
  lastName: string;
  nrc: string;
  phoneNumber: string;
  emailAddress?: string;
  nationality: string;
  otherNationality?: string;
  gender?: string;
  status?: CustomerStatus;
  registrationDate?: string;
  lastUpdated?: string;
  employment?: {
    employerId: string;
    employerName: string;
    position?: string;
    salary?: number;
  };
  address?: {
    street?: string;
    city?: string;
    province?: string;
    country?: string;
  };
  totalLoans?: number;
  activeLoans?: number;
  totalOutstanding?: number;
}

export interface LoanData {
  loanId: string;
  applicationId?: string;
  customerId: string;
  productCode: string;
  productName?: string;
  loanAmount: number;
  approvedAmount?: number;
  disbursedAmount?: number;
  interestRate?: number;
  tenureMonths: number;
  currency: string;
  status: LoanStatus;
  applicationDate: string;
  approvalDate?: string;
  disbursementDate?: string;
  maturityDate?: string;
  monthlyInstallment?: number;
  principalBalance?: number;
  interestBalance?: number;
  totalBalance?: number;
  nextPaymentDate?: string;
  nextPaymentAmount?: number;
  customer?: CustomerData;
}

export interface LoanRequestData {
  applicationId?: string;
  applicationNumber?: string;
  referenceNumber?: string;
  customerId: string;
  productCode: string;
  requestedAmount: number;
  tenureMonths: number;
  currency: string;
  status: LoanStatus;
  applicationDate: string;
  lastUpdated: string;
  estimatedProcessingDays?: number;
  nextAction?: string;
  workflow?: Array<{
    stage: string;
    status: 'Pending' | 'In Progress' | 'Completed' | 'Rejected';
    startDate?: string;
    completedDate?: string;
    assignedTo?: string;
    comments?: string;
  }>;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
  timestamp: string;
}

export interface LoadingStates {
  fetchingCustomer: boolean;
  fetchingLoanDetails: boolean;
  fetchingLoanBalance: boolean;
  fetchingLoanStatus: boolean;
  fetchingLoanProducts: boolean;
  creatingCustomer: boolean;
  updatingCustomer: boolean;
  submittingLoanRequest: boolean;
  uploadingDocument: boolean;
  general: boolean;
}

export interface AltusState {
  // Data
  currentCustomer: CustomerData | null;
  currentLoan: LoanData | null;
  loanBalance: LoanBalanceResponse['outParams'] | null;
  loanStatus: LoanStatusResponse['outParams'] | null;
  loanRequest: LoanRequestData | null;
  loanProducts: LoanProductResponse['outParams'][] | null;
  recentLoans: LoanData[];
  
  // State management
  loading: LoadingStates;
  errors: {
    customer: ApiError | null;
    loan: ApiError | null;
    loanRequest: ApiError | null;
    general: ApiError | null;
  };
  lastFetched: {
    customer: string | null;
    loan: string | null;
    loanRequest: string | null;
  };
  
  // Success flags
  successFlags: {
    customerCreated: boolean;
    customerUpdated: boolean;
    loanRequestSubmitted: boolean;
    documentUploaded: boolean;
  };
}

// ============================================================================
// CONTEXT ACTIONS
// ============================================================================

type AltusAction =
  // Loading actions
  | { type: 'SET_LOADING'; payload: { operation: keyof LoadingStates; loading: boolean } }
  | { type: 'SET_GENERAL_LOADING'; payload: boolean }
  
  // Error actions
  | { type: 'SET_ERROR'; payload: { category: keyof AltusState['errors']; error: ApiError | null } }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'CLEAR_ERROR'; payload: keyof AltusState['errors'] }
  
  // Success actions
  | { type: 'SET_SUCCESS_FLAG'; payload: { flag: keyof AltusState['successFlags']; value: boolean } }
  | { type: 'CLEAR_SUCCESS_FLAGS' }
  
  // Data actions
  | { type: 'SET_CUSTOMER'; payload: CustomerData | null }
  | { type: 'SET_LOAN'; payload: LoanData | null }
  | { type: 'SET_LOAN_BALANCE'; payload: LoanBalanceResponse['outParams'] | null }
  | { type: 'SET_LOAN_STATUS'; payload: LoanStatusResponse['outParams'] | null }
  | { type: 'SET_LOAN_REQUEST'; payload: LoanRequestData | null }
  | { type: 'SET_LOAN_PRODUCTS'; payload: LoanProductResponse['outParams'][] | null }
  | { type: 'ADD_RECENT_LOAN'; payload: LoanData }
  | { type: 'SET_LAST_FETCHED'; payload: { category: keyof AltusState['lastFetched']; timestamp: string } }
  
  // Reset actions
  | { type: 'RESET_CUSTOMER' }
  | { type: 'RESET_LOAN' }
  | { type: 'RESET_ALL' };

// ============================================================================
// REDUCER
// ============================================================================

const initialState: AltusState = {
  currentCustomer: null,
  currentLoan: null,
  loanBalance: null,
  loanStatus: null,
  loanRequest: null,
  loanProducts: null,
  recentLoans: [],
  
  loading: {
    fetchingCustomer: false,
    fetchingLoanDetails: false,
    fetchingLoanBalance: false,
    fetchingLoanStatus: false,
    fetchingLoanProducts: false,
    creatingCustomer: false,
    updatingCustomer: false,
    submittingLoanRequest: false,
    uploadingDocument: false,
    general: false,
  },
  
  errors: {
    customer: null,
    loan: null,
    loanRequest: null,
    general: null,
  },
  
  lastFetched: {
    customer: null,
    loan: null,
    loanRequest: null,
  },
  
  successFlags: {
    customerCreated: false,
    customerUpdated: false,
    loanRequestSubmitted: false,
    documentUploaded: false,
  },
};

function altusReducer(state: AltusState, action: AltusAction): AltusState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.operation]: action.payload.loading,
        },
      };
      
    case 'SET_GENERAL_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          general: action.payload,
        },
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.category]: action.payload.error,
        },
      };
      
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: {
          customer: null,
          loan: null,
          loanRequest: null,
          general: null,
        },
      };
      
    case 'CLEAR_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload]: null,
        },
      };
      
    case 'SET_SUCCESS_FLAG':
      return {
        ...state,
        successFlags: {
          ...state.successFlags,
          [action.payload.flag]: action.payload.value,
        },
      };
      
    case 'CLEAR_SUCCESS_FLAGS':
      return {
        ...state,
        successFlags: {
          customerCreated: false,
          customerUpdated: false,
          loanRequestSubmitted: false,
          documentUploaded: false,
        },
      };
      
    case 'SET_CUSTOMER':
      return {
        ...state,
        currentCustomer: action.payload,
      };
      
    case 'SET_LOAN':
      return {
        ...state,
        currentLoan: action.payload,
      };
      
    case 'SET_LOAN_BALANCE':
      return {
        ...state,
        loanBalance: action.payload,
      };
      
    case 'SET_LOAN_STATUS':
      return {
        ...state,
        loanStatus: action.payload,
      };
      
    case 'SET_LOAN_REQUEST':
      return {
        ...state,
        loanRequest: action.payload,
      };
      
    case 'SET_LOAN_PRODUCTS':
      return {
        ...state,
        loanProducts: action.payload,
      };
      
    case 'ADD_RECENT_LOAN':
      const existingIndex = state.recentLoans.findIndex(loan => loan.loanId === action.payload.loanId);
      let updatedRecentLoans;
      
      if (existingIndex >= 0) {
        // Update existing loan
        updatedRecentLoans = [...state.recentLoans];
        updatedRecentLoans[existingIndex] = action.payload;
      } else {
        // Add new loan (keep only last 10)
        updatedRecentLoans = [action.payload, ...state.recentLoans].slice(0, 10);
      }
      
      return {
        ...state,
        recentLoans: updatedRecentLoans,
      };
      
    case 'SET_LAST_FETCHED':
      return {
        ...state,
        lastFetched: {
          ...state.lastFetched,
          [action.payload.category]: action.payload.timestamp,
        },
      };
      
    case 'RESET_CUSTOMER':
      return {
        ...state,
        currentCustomer: null,
        errors: {
          ...state.errors,
          customer: null,
        },
        successFlags: {
          ...state.successFlags,
          customerCreated: false,
          customerUpdated: false,
        },
      };
      
    case 'RESET_LOAN':
      return {
        ...state,
        currentLoan: null,
        loanBalance: null,
        loanStatus: null,
        loanRequest: null,
        errors: {
          ...state.errors,
          loan: null,
          loanRequest: null,
        },
        successFlags: {
          ...state.successFlags,
          loanRequestSubmitted: false,
          documentUploaded: false,
        },
      };
      
    case 'RESET_ALL':
      return initialState;
      
    default:
      return state;
  }
}

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

export interface AltusContextType {
  // State
  state: AltusState;
  
  // Customer operations
  fetchCustomerByNRC: (nrc: string) => Promise<CustomerData | null>;
  createRetailCustomer: (customerData: RetailCustomerRequest) => Promise<CustomerData | null>;
  createBusinessCustomer: (customerData: BusinessCustomerRequest) => Promise<CustomerData | null>;
  updateRetailCustomer: (customerData: RetailCustomerRequest) => Promise<CustomerData | null>;
  updateBusinessCustomer: (customerData: BusinessCustomerRequest) => Promise<CustomerData | null>;
  
  // Loan operations
  fetchLoanDetails: (loanId: string) => Promise<LoanData | null>;
  fetchLoanBalance: (loanId: string) => Promise<LoanBalanceResponse['outParams'] | null>;
  fetchLoanStatus: (loanId: string) => Promise<LoanStatusResponse['outParams'] | null>;
  fetchLoansByCustomerNRC: (nrc: string) => Promise<LoanData[]>;
  
  // Loan request operations
  submitLoanRequest: (requestData: any) => Promise<LoanRequestData | null>;
  uploadLoanDocument: (applicationNumber: string, documentType: string, file: File) => Promise<UploadDocumentResponse['outParams'] | null>;
  
  // Loan product operations
  fetchLoanProducts: (employerId?: string) => Promise<LoanProductResponse['outParams'][] | null>;
  fetchLoanProductDetails: (productCode: string, employerId: string) => Promise<LoanProductResponse['outParams'] | null>;
  
  // State management
  clearErrors: () => void;
  clearError: (category: keyof AltusState['errors']) => void;
  clearSuccessFlags: () => void;
  setSuccessFlag: (flag: keyof AltusState['successFlags'], value: boolean) => void;
  resetCustomer: () => void;
  resetLoan: () => void;
  resetAll: () => void;
  
  // Utility functions
  isLoading: (operation?: keyof LoadingStates) => boolean;
  hasError: (category?: keyof AltusState['errors']) => boolean;
  getError: (category: keyof AltusState['errors']) => ApiError | null;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const AltusContext = createContext<AltusContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export const AltusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(altusReducer, initialState);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const createApiError = useCallback((error: any, defaultMessage: string): ApiError => {
    if (error instanceof AltusApiException) {
      return {
        message: error.message,
        code: error.code,
        status: error.status,
        details: error.details,
        timestamp: new Date().toISOString(),
      };
    }
    
    return {
      message: error?.message || defaultMessage,
      code: 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString(),
    };
  }, []);

  const setLoading = useCallback((operation: keyof LoadingStates, loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: { operation, loading } });
  }, []);

  const setError = useCallback((category: keyof AltusState['errors'], error: ApiError | null) => {
    dispatch({ type: 'SET_ERROR', payload: { category, error } });
  }, []);

  const setLastFetched = useCallback((category: keyof AltusState['lastFetched']) => {
    dispatch({ type: 'SET_LAST_FETCHED', payload: { category, timestamp: new Date().toISOString() } });
  }, []);

  // ============================================================================
  // CUSTOMER OPERATIONS
  // ============================================================================

  const fetchCustomerByNRC = useCallback(async (nrc: string): Promise<CustomerData | null> => {
    try {
      setLoading('fetchingCustomer', true);
      setError('customer', null);

      const customerDetails = await altusApi.getCustomerDetails(nrc);
      
      if (customerDetails) {
        const customerData: CustomerData = {
          customerId: customerDetails.CustomerID,
          firstName: '',
          lastName: '',
          nrc: '',
          phoneNumber: '',
          emailAddress: '',
          nationality: '',
          otherNationality: '',
          status: 'Active' as const,
          registrationDate: '',
          lastUpdated: '',
          employment: {} as any,
          address: {} as any,
          totalLoans: 0,
          activeLoans: 0,
          totalOutstanding: 0,
        };

        dispatch({ type: 'SET_CUSTOMER', payload: customerData });
        setLastFetched('customer');
        return customerData;
      }

      return null;
    } catch (error) {
      const apiError = createApiError(error, 'Failed to fetch customer details');
      setError('customer', apiError);
      return null;
    } finally {
      setLoading('fetchingCustomer', false);
    }
  }, [createApiError, setLoading, setError, setLastFetched]);

  const createRetailCustomer = useCallback(async (customerData: RetailCustomerRequest): Promise<CustomerData | null> => {
    try {
      setLoading('creatingCustomer', true);
      setError('customer', null);

      const result = await altusApi.createRetailCustomer(customerData);
      console.log('Debug: Customer creation result:', result);
      console.log('Debug: Result executionStatus:', result?.executionStatus);
      console.log('Debug: Result outParams:', result?.outParams);
      
      // UAT API returns either CustomerID or RequestId depending on KYC process
      const customerId = result?.outParams?.CustomerID || result?.outParams?.RequestId;
      
      if (result && result.executionStatus === 'Success' && customerId) {
        // UAT API returns CustomerID or RequestId, so we need to use the original request data
        // and combine it with the returned ID
        const newCustomer: CustomerData = {
          customerId: customerId,
          firstName: customerData.firstName,
          lastName: customerData.lastName || '',
          nrc: customerData.nrc,
          phoneNumber: customerData.phoneNumber,
          emailAddress: customerData.emailAddress,
          nationality: customerData.nationality,
          otherNationality: customerData.otherNationality,
          status: 'Active', // Default from UAT spec
          registrationDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          employment: customerData.employment ? {
            employerId: customerData.employment.employerId,
            employerName: customerData.employment.employerName,
            position: customerData.employment.position,
            salary: customerData.employment.salary,
          } : undefined,
          address: customerData.address,
        };

        dispatch({ type: 'SET_CUSTOMER', payload: newCustomer });
        dispatch({ type: 'SET_SUCCESS_FLAG', payload: { flag: 'customerCreated', value: true } });
        console.log('✅ Customer stored in context with ID:', customerId);
        return newCustomer;
      }

      console.warn('⚠ Customer creation returned no data or failed:', {
        hasResult: !!result,
        executionStatus: result?.executionStatus,
        hasCustomerId: !!customerId,
        fullResult: result
      });
      return null;
    } catch (error) {
      const apiError = createApiError(error, 'Failed to create retail customer');
      setError('customer', apiError);
      return null;
    } finally {
      setLoading('creatingCustomer', false);
    }
  }, [createApiError, setLoading, setError]);

  const createBusinessCustomer = useCallback(async (customerData: BusinessCustomerRequest): Promise<CustomerData | null> => {
    try {
      setLoading('creatingCustomer', true);
      setError('customer', null);

      const result = await altusApi.createBusinessCustomer(customerData);
      
      if (result) {
        const newCustomer: CustomerData = {
          customerId: result.CustomerID,
          firstName: '',
          lastName: '',
          nrc: '',
          phoneNumber: '',
          emailAddress: '',
          nationality: '',
          status: 'Active' as const,
          registrationDate: '',
          lastUpdated: '',
        };

        dispatch({ type: 'SET_CUSTOMER', payload: newCustomer });
        dispatch({ type: 'SET_SUCCESS_FLAG', payload: { flag: 'customerCreated', value: true } });
        return newCustomer;
      }

      return null;
    } catch (error) {
      const apiError = createApiError(error, 'Failed to create business customer');
      setError('customer', apiError);
      return null;
    } finally {
      setLoading('creatingCustomer', false);
    }
  }, [createApiError, setLoading, setError]);

  const updateRetailCustomer = useCallback(async (customerData: RetailCustomerRequest): Promise<CustomerData | null> => {
    try {
      setLoading('updatingCustomer', true);
      setError('customer', null);

      const result = await altusApi.updateRetailCustomer(customerData);
      
      if (result) {
        const updatedCustomer: CustomerData = {
          customerId: result.CustomerID,
          firstName: '',
          lastName: '',
          nrc: '',
          phoneNumber: '',
          emailAddress: '',
          nationality: '',
          otherNationality: '',
          status: 'Active' as const,
          registrationDate: '',
          lastUpdated: '',
          employment: {} as any,
          address: {} as any,
        };

        dispatch({ type: 'SET_CUSTOMER', payload: updatedCustomer });
        dispatch({ type: 'SET_SUCCESS_FLAG', payload: { flag: 'customerUpdated', value: true } });
        return updatedCustomer;
      }

      return null;
    } catch (error) {
      const apiError = createApiError(error, 'Failed to update retail customer');
      setError('customer', apiError);
      return null;
    } finally {
      setLoading('updatingCustomer', false);
    }
  }, [createApiError, setLoading, setError]);

  const updateBusinessCustomer = useCallback(async (customerData: BusinessCustomerRequest): Promise<CustomerData | null> => {
    try {
      setLoading('updatingCustomer', true);
      setError('customer', null);

      const result = await altusApi.updateBusinessCustomer(customerData);
      
      if (result) {
        const updatedCustomer: CustomerData = {
          customerId: result.CustomerID,
          firstName: '',
          lastName: '',
          nrc: '',
          phoneNumber: '',
          emailAddress: '',
          nationality: '',
          status: 'Active' as const,
          registrationDate: '',
          lastUpdated: '',
        };

        dispatch({ type: 'SET_CUSTOMER', payload: updatedCustomer });
        dispatch({ type: 'SET_SUCCESS_FLAG', payload: { flag: 'customerUpdated', value: true } });
        return updatedCustomer;
      }

      return null;
    } catch (error) {
      const apiError = createApiError(error, 'Failed to update business customer');
      setError('customer', apiError);
      return null;
    } finally {
      setLoading('updatingCustomer', false);
    }
  }, [createApiError, setLoading, setError]);

  // ============================================================================
  // LOAN OPERATIONS
  // ============================================================================

  const fetchLoanDetails = useCallback(async (loanId: string): Promise<LoanData | null> => {
    try {
      setLoading('fetchingLoanDetails', true);
      setError('loan', null);

      const loanDetails = await altusApi.getLoanDetails(loanId);
      
      if (loanDetails) {
        const loanData: LoanData = {
          loanId: loanDetails.loanId,
          applicationId: loanDetails.applicationId,
          customerId: loanDetails.customerId,
          productCode: loanDetails.productCode,
          productName: loanDetails.productName,
          loanAmount: loanDetails.loanAmount,
          approvedAmount: loanDetails.approvedAmount,
          disbursedAmount: loanDetails.disbursedAmount,
          interestRate: loanDetails.interestRate,
          tenureMonths: loanDetails.tenureMonths,
          currency: loanDetails.currency,
          status: loanDetails.status as LoanStatus,
          applicationDate: loanDetails.applicationDate,
          approvalDate: loanDetails.approvalDate,
          disbursementDate: loanDetails.disbursementDate,
          maturityDate: loanDetails.maturityDate,
          monthlyInstallment: loanDetails.monthlyInstallment,
          principalBalance: loanDetails.principalBalance,
          interestBalance: loanDetails.interestBalance,
          totalBalance: loanDetails.totalBalance,
          nextPaymentDate: loanDetails.nextPaymentDate,
          customer: loanDetails.customer ? {
            customerId: loanDetails.customer.customerId,
            firstName: loanDetails.customer.firstName,
            lastName: loanDetails.customer.lastName,
            nrc: loanDetails.customer.nrc,
            phoneNumber: loanDetails.customer.phoneNumber,
            emailAddress: loanDetails.customer.emailAddress,
            nationality: loanDetails.customer.nationality,
          } : undefined,
        };

        dispatch({ type: 'SET_LOAN', payload: loanData });
        dispatch({ type: 'ADD_RECENT_LOAN', payload: loanData });
        setLastFetched('loan');
        return loanData;
      }

      return null;
    } catch (error) {
      const apiError = createApiError(error, 'Failed to fetch loan details');
      setError('loan', apiError);
      return null;
    } finally {
      setLoading('fetchingLoanDetails', false);
    }
  }, [createApiError, setLoading, setError, setLastFetched]);

  const fetchLoanBalance = useCallback(async (loanId: string): Promise<LoanBalanceResponse['outParams'] | null> => {
    try {
      setLoading('fetchingLoanBalance', true);
      setError('loan', null);

      const balance = await altusApi.getLoanBalance(loanId);
      
      if (balance) {
        dispatch({ type: 'SET_LOAN_BALANCE', payload: balance });
        return balance;
      }

      return null;
    } catch (error) {
      const apiError = createApiError(error, 'Failed to fetch loan balance');
      setError('loan', apiError);
      return null;
    } finally {
      setLoading('fetchingLoanBalance', false);
    }
  }, [createApiError, setLoading, setError]);

  const fetchLoanStatus = useCallback(async (loanId: string): Promise<LoanStatusResponse['outParams'] | null> => {
    try {
      setLoading('fetchingLoanStatus', true);
      setError('loan', null);

      const status = await altusApi.getLoanStatus(loanId);
      
      if (status) {
        // Store the actual API response as-is
        dispatch({ type: 'SET_LOAN_STATUS', payload: status });
        return status;
      }

      return null;
    } catch (error) {
      const apiError = createApiError(error, 'Failed to fetch loan status');
      setError('loan', apiError);
      return null;
    } finally {
      setLoading('fetchingLoanStatus', false);
    }
  }, [createApiError, setLoading, setError]);

  const fetchLoansByCustomerNRC = useCallback(async (nrc: string): Promise<LoanData[]> => {
    try {
      setLoading('fetchingLoanDetails', true);
      setError('loan', null);

      // First get customer details to get customer ID
      const customer = await fetchCustomerByNRC(nrc);
      
      if (!customer?.customerId) {
        return [];
      }

      // This would typically be a separate API call to get loans by customer ID
      // For now, we'll simulate it by checking recent loans
      const customerLoans = state.recentLoans.filter(loan => 
        loan.customerId === customer.customerId || 
        loan.customer?.nrc === nrc
      );

      return customerLoans;
    } catch (error) {
      const apiError = createApiError(error, 'Failed to fetch customer loans');
      setError('loan', apiError);
      return [];
    } finally {
      setLoading('fetchingLoanDetails', false);
    }
  }, [createApiError, setLoading, setError, fetchCustomerByNRC, state.recentLoans]);

  // ============================================================================
  // LOAN REQUEST OPERATIONS
  // ============================================================================

  const submitLoanRequest = useCallback(async (requestData: any): Promise<LoanRequestData | null> => {
    try {
      setLoading('submittingLoanRequest', true);
      setError('loanRequest', null);

      // Map the request data to UAT API format - exact field names
      const uatFormattedData = {
        typeOfCustomer: "Existing", // Since we created customer first
        customerId: requestData.customerId,
        identityNo: requestData.identityNo || requestData.nrc || state.currentCustomer?.nrc || "",
        contactNo: requestData.contactNo || requestData.phoneNumber || state.currentCustomer?.phoneNumber || "",
        emailId: requestData.emailId || requestData.emailAddress || state.currentCustomer?.emailAddress || "",
        employeeNumber: requestData.employeeNumber || "",
        designation: requestData.designation || "",
        employmentType: requestData.employmentType || "1", // 1=Permanent, 2=Contract
        tenure: requestData.tenure || requestData.tenureMonths || 12,
        gender: requestData.gender || state.currentCustomer?.gender || "Male",
        loanAmount: requestData.loanAmount || requestData.requestedAmount || requestData.amount || 0,
        grossIncome: requestData.grossIncome || requestData.grossSalary || 0,
        netIncome: requestData.netIncome || requestData.netSalary || 0,
        deductions: requestData.deductions || 0
      };

      console.log('Debug: Submitting loan request with UAT-formatted data:', uatFormattedData);
      const result = await altusApi.submitLoanRequest(uatFormattedData);
      
      if (result && result.executionStatus === 'Success' && result.outParams?.ApplicationNumber) {
        // UAT format uses ApplicationNumber in outParams
        const loanRequestData: LoanRequestData = {
          applicationId: result.outParams.ApplicationNumber,
          applicationNumber: result.outParams.ApplicationNumber,
          referenceNumber: result.outParams.ApplicationNumber, // Use ApplicationNumber as reference
          customerId: requestData.customerId,
          productCode: requestData.productCode || 'PBL001',
          requestedAmount: requestData.amount || requestData.loanAmount,
          tenureMonths: requestData.tenureMonths || requestData.tenure,
          currency: 'ZMW',
          status: 'Submitted' as LoanStatus,
          applicationDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          estimatedProcessingDays: 5,
          nextAction: 'Document Upload',
          workflow: [{
            stage: 'Submitted',
            status: 'Completed',
            startDate: new Date().toISOString(),
            completedDate: new Date().toISOString(),
            assignedTo: 'System',
            comments: 'Loan request submitted successfully'
          }],
        };

        dispatch({ type: 'SET_LOAN_REQUEST', payload: loanRequestData });
        dispatch({ type: 'SET_SUCCESS_FLAG', payload: { flag: 'loanRequestSubmitted', value: true } });
        setLastFetched('loanRequest');
        
        console.log('Debug: Loan request successful, ApplicationNumber:', result.outParams.ApplicationNumber);
        return loanRequestData;
      } else {
        const errorMsg = result?.executionMessage || 'Unknown error';
        console.error('Debug: Loan request failed:', errorMsg);
        throw new Error(`Loan request failed: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Debug: Loan request error:', error);
      const apiError = createApiError(error, 'Failed to submit loan request');
      setError('loanRequest', apiError);
      return null;
    } finally {
      setLoading('submittingLoanRequest', false);
    }
  }, [createApiError, setLoading, setError, setLastFetched, state.currentCustomer]);

  const uploadLoanDocument = useCallback(async (applicationNumber: string, documentType: string, file: File): Promise<UploadDocumentResponse['outParams'] | null> => {
    try {
      setLoading('uploadingDocument', true);
      setError('loanRequest', null);

      const result = await altusApi.uploadLoanDocument(applicationNumber, documentType, file);
      
      if (result && result.executionStatus === 'Success' && result.outParams?.LRDocumentDetailsId) {
        dispatch({ type: 'SET_SUCCESS_FLAG', payload: { flag: 'documentUploaded', value: true } });
        return result.outParams;
      }

      throw new Error(`Document upload failed: ${result?.executionMessage || 'Unknown error'}`);
    } catch (error) {
      const apiError = createApiError(error, 'Failed to upload document');
      setError('loanRequest', apiError);
      return null;
    } finally {
      setLoading('uploadingDocument', false);
    }
  }, [createApiError, setLoading, setError]);

  // ============================================================================
  // LOAN PRODUCT OPERATIONS
  // ============================================================================

  const fetchLoanProducts = useCallback(async (employerId?: string): Promise<LoanProductResponse['outParams'][] | null> => {
    try {
      setLoading('fetchingLoanProducts', true);
      setError('general', null);

      // This would typically fetch all available loan products
      // For now, we'll simulate with a single product fetch
      if (employerId) {
        const productDetails = await altusApi.getLoanProductDetails('DEFAULT', employerId);
        if (productDetails) {
          const products = [productDetails];
          dispatch({ type: 'SET_LOAN_PRODUCTS', payload: products });
          return products;
        }
      }

      return null;
    } catch (error) {
      const apiError = createApiError(error, 'Failed to fetch loan products');
      setError('general', apiError);
      return null;
    } finally {
      setLoading('fetchingLoanProducts', false);
    }
  }, [createApiError, setLoading, setError]);

  const fetchLoanProductDetails = useCallback(async (productCode: string, employerId: string): Promise<LoanProductResponse['outParams'] | null> => {
    try {
      setLoading('fetchingLoanProducts', true);
      setError('general', null);

      const productDetails = await altusApi.getLoanProductDetails(productCode, employerId);
      
      if (productDetails) {
        // Update the products list with this product
        const currentProducts = state.loanProducts || [];
        const existingIndex = currentProducts.findIndex(p => p?.productCode === productCode);
        
        let updatedProducts;
        if (existingIndex >= 0) {
          updatedProducts = [...currentProducts];
          updatedProducts[existingIndex] = productDetails;
        } else {
          updatedProducts = [...currentProducts, productDetails];
        }
        
        dispatch({ type: 'SET_LOAN_PRODUCTS', payload: updatedProducts });
        return productDetails;
      }

      return null;
    } catch (error) {
      const apiError = createApiError(error, 'Failed to fetch loan product details');
      setError('general', apiError);
      return null;
    } finally {
      setLoading('fetchingLoanProducts', false);
    }
  }, [createApiError, setLoading, setError, state.loanProducts]);

  // ============================================================================
  // STATE MANAGEMENT FUNCTIONS
  // ============================================================================

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  const clearError = useCallback((category: keyof AltusState['errors']) => {
    dispatch({ type: 'CLEAR_ERROR', payload: category });
  }, []);

  const clearSuccessFlags = useCallback(() => {
    dispatch({ type: 'CLEAR_SUCCESS_FLAGS' });
  }, []);

  const setSuccessFlag = useCallback((flag: keyof AltusState['successFlags'], value: boolean) => {
    dispatch({ type: 'SET_SUCCESS_FLAG', payload: { flag, value } });
  }, []);

  const resetCustomer = useCallback(() => {
    dispatch({ type: 'RESET_CUSTOMER' });
  }, []);

  const resetLoan = useCallback(() => {
    dispatch({ type: 'RESET_LOAN' });
  }, []);

  const resetAll = useCallback(() => {
    dispatch({ type: 'RESET_ALL' });
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const isLoading = useCallback((operation?: keyof LoadingStates) => {
    if (operation) {
      return state.loading[operation];
    }
    return Object.values(state.loading).some(loading => loading);
  }, [state.loading]);

  const hasError = useCallback((category?: keyof AltusState['errors']) => {
    if (category) {
      return state.errors[category] !== null;
    }
    return Object.values(state.errors).some(error => error !== null);
  }, [state.errors]);

  const getError = useCallback((category: keyof AltusState['errors']) => {
    return state.errors[category];
  }, [state.errors]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: AltusContextType = {
    state,
    
    // Customer operations
    fetchCustomerByNRC,
    createRetailCustomer,
    createBusinessCustomer,
    updateRetailCustomer,
    updateBusinessCustomer,
    
    // Loan operations
    fetchLoanDetails,
    fetchLoanBalance,
    fetchLoanStatus,
    fetchLoansByCustomerNRC,
    
    // Loan request operations
    submitLoanRequest,
    uploadLoanDocument,
    
    // Loan product operations
    fetchLoanProducts,
    fetchLoanProductDetails,
    
    // State management
    clearErrors,
    clearError,
    clearSuccessFlags,
    setSuccessFlag,
    resetCustomer,
    resetLoan,
    resetAll,
    
    // Utility functions
    isLoading,
    hasError,
    getError,
  };

  return (
    <AltusContext.Provider value={contextValue}>
      {children}
    </AltusContext.Provider>
  );
};

// ============================================================================
// HOOK FOR USING CONTEXT
// ============================================================================

export const useAltus = (): AltusContextType => {
  const context = useContext(AltusContext);
  
  if (context === undefined) {
    throw new Error('useAltus must be used within an AltusProvider');
  }
  
  return context;
};

export default AltusContext;