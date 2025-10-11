import { http } from './http';
import { Customer, LoanProduct, LoanRequestPayload, LoanRequestResponse, LoanStatusResponse, LoanDetails, LoanBalanceResponse, DocumentUploadResponse, LoanCalculatorRequest, LoanCalculatorResult } from '../types/index';
import { isMockMode, mockGetStatus } from './mockApi';

// Placeholder endpoint paths — adjust to match actual spec paths.
export const loanApi = {
  // Customer
  createCustomer: (payload: Customer) => http.post('/customers', payload),
  updateCustomer: (id: string, payload: Partial<Customer>) => http.put(`/customers/${id}`, payload),
  getCustomerDetails: (id: string) => http.get(`/customers/${id}`),

  // Products / Loans
  getLoanProductDetails: (productCode: string) => http.get<LoanProduct>(`/loan-products/${productCode}`),
  getLoansByCustomer: (customerId: string) => http.get(`/customers/${customerId}/loans`),
  getLoanDetails: (loanId: string) => http.get<LoanDetails>(`/loans/${loanId}`),
  getLoanStatus: (loanId: string) => http.get<LoanStatusResponse>(`/loans/${loanId}/status`),
  getLoanBalance: (loanId: string) => http.get<LoanBalanceResponse>(`/loans/${loanId}/balance`),

  // Calculator
  calculateEMI: (payload: LoanCalculatorRequest) => http.post<LoanCalculatorResult>('/loans/calculate-emi', payload),

  // Loan Request
  submitLoanRequest: (payload: LoanRequestPayload) => http.post<LoanRequestResponse>('/loans/requests', payload),

  // Application Tracking - supports both mock and real API
  trackApplication: async (referenceId: string) => {
    if (isMockMode()) {
      const mockResult = await mockGetStatus(referenceId);
      // Transform mock result to match expected API format
      return {
        data: {
          status: mockResult.currentStatus,
          lastUpdated: mockResult.statusTimeline[mockResult.statusTimeline.length - 1]?.ts || mockResult.created,
          requestId: mockResult.id,
          loanId: mockResult.id,
          timeline: mockResult.statusTimeline,
          customerName: mockResult.customerName,
          nrcNumber: mockResult.nrcNumber,
          loanAmount: mockResult.loanAmount,
          loanProduct: mockResult.loanProduct,
          location: mockResult.location
        }
      };
    } else {
      return http.get<LoanStatusResponse>(`/applications/${referenceId}/status`);
    }
  },

  // Documents
  uploadDocument: (loanRequestId: string, file: File, docType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', docType);
    return http.post<DocumentUploadResponse>(`/loans/requests/${loanRequestId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};
