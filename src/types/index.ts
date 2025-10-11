// Generic API response wrapper (placeholder – adjust to real API contract)
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success?: boolean;
}

// Core domain models (initial draft placeholders – refine with real spec)
export interface Customer {
    id?: string;
    firstName: string;
    lastName: string;
    nrc?: string;
    phone?: string;
    email?: string;
    employerName?: string;
    payrollNumber?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface LoanProduct {
    code: string;
    name: string;
    description?: string;
    minAmount?: number;
    maxAmount?: number;
    minTenureMonths?: number;
    maxTenureMonths?: number;
    interestRateAnnual?: number; // percent
}

export interface LoanCalculatorRequest {
    principal: number;
    tenureMonths: number;
    interestRateAnnual?: number;
    productCode?: string;
}

export interface LoanCalculatorResult {
    monthlyInstallment: number;
    totalInterest: number;
    totalPayable: number;
    schedule?: Array<{ month: number; openingBalance: number; interestPortion: number; principalPortion: number; installment: number; closingBalance: number; }>;  
}

export interface LoanRequestPayload {
    customerId: string;
    productCode: string;
    amount: number;
    tenureMonths: number;
    purpose?: string;
    channel?: string; // web/app
    metadata?: Record<string, any>;
}

export interface LoanRequestResponse {
    requestId: string;
    status: string;
    submittedAt: string;
}

export interface LoanStatusResponse {
    loanId?: string;
    requestId: string;
    status: string;
    lastUpdated: string;
}

export interface LoanDetails {
    loanId: string;
    principal: number;
    balance: number;
    productCode: string;
    disbursedAt?: string;
    status: string;
}

export interface LoanBalanceResponse {
    loanId: string;
    outstandingPrincipal: number;
    accruedInterest?: number;
    totalOutstanding: number;
    asOf: string;
}

export interface DocumentUploadResponse {
    documentId: string;
    type: string;
    fileName: string;
    uploadedAt: string;
}

// Utility types
export type WithId<T, I extends string | number = string> = T & { id: I };

// ============================================================================
// ALTUS API TYPES
// ============================================================================

// Export all Altus API interfaces
export * from './altus';