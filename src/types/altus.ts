/**
 * TypeScript interfaces for Altus API responses and requests
 * Based on UAT - Altus API Details.pdf specifications
 */

// ============================================================================
// BASE ALTUS API RESPONSE STRUCTURE
// ============================================================================

export interface AltusBaseResponse {
  executionStatus: "Success" | "Failure";
  executionMessage?: string;
  outParams?: any;
}

// ============================================================================
// LOAN BALANCE RESPONSE
// ============================================================================

export interface LoanBalanceResponse extends AltusBaseResponse {
  outParams?: {
    loanId: string;
    principalBalance: number;
    interestBalance: number;
    totalBalance: number;
    overdueAmount?: number;
    currency: string;
    lastPaymentDate?: string;
    nextPaymentDate?: string;
    nextPaymentAmount?: number;
    status: string;
  };
}

// ============================================================================
// LOAN STATUS RESPONSE
// ============================================================================

export interface LoanStatusResponse extends AltusBaseResponse {
  outParams?: {
    loanId: string;
    status: string;
    statusDescription: string;
    applicationDate: string;
    approvalDate?: string;
    disbursementDate?: string;
    maturityDate?: string;
    lastUpdated: string;
    currentStage: string;
    nextAction?: string;
    rejectionReason?: string;
  };
}

// ============================================================================
// LOAN DETAILS RESPONSE
// ============================================================================

export interface LoanDetailsResponse extends AltusBaseResponse {
  outParams?: {
    loanId: string;
    applicationId: string;
    customerId: string;
    productCode: string;
    productName: string;
    loanAmount: number;
    approvedAmount?: number;
    disbursedAmount?: number;
    interestRate: number;
    tenureMonths: number;
    currency: string;
    status: string;
    applicationDate: string;
    approvalDate?: string;
    disbursementDate?: string;
    maturityDate?: string;
    monthlyInstallment?: number;
    principalBalance?: number;
    interestBalance?: number;
    totalBalance?: number;
    paymentsCount?: number;
    remainingPayments?: number;
    lastPaymentDate?: string;
    nextPaymentDate?: string;
    customer: {
      customerId: string;
      firstName: string;
      lastName: string;
      nrc: string;
      phoneNumber: string;
      emailAddress?: string;
      nationality: string;
    };
    employer?: {
      employerId: string;
      employerName: string;
      employerCode: string;
    };
    collateral?: Array<{
      collateralId: string;
      collateralType: string;
      collateralValue: number;
      description: string;
    }>;
    guarantors?: Array<{
      guarantorId: string;
      firstName: string;
      lastName: string;
      nrc: string;
      phoneNumber: string;
      relationship: string;
    }>;
  };
}

// ============================================================================
// RETAIL CUSTOMER REQUEST
// ============================================================================

export interface RetailCustomerRequest {
  firstName: string;
  lastName: string;
  nrc: string;
  phoneNumber: string;
  emailAddress?: string;
  dateOfBirth: string;
  gender: "Male" | "Female";
  nationality: string;
  otherNationality?: string;
  maritalStatus: string;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode?: string;
    country: string;
  };
  employment: {
    employerId: string;
    employerName: string;
    employerCode: string;
    position: string;
    department?: string;
    salary: number;
    employmentDate: string;
    employmentType: "Permanent" | "Contract" | "Temporary";
  };
  nextOfKin: {
    firstName: string;
    lastName: string;
    relationship: string;
    phoneNumber: string;
    address?: string;
  };
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountType: string;
    branchCode?: string;
  };
  documents?: Array<{
    documentType: string;
    documentNumber: string;
    expiryDate?: string;
    issuingAuthority?: string;
  }>;
}

// ============================================================================
// CUSTOMER DETAILS RESPONSE
// ============================================================================

export interface CustomerDetailsResponse extends AltusBaseResponse {
  outParams?: {
    customerId: string;
    customerType: "Retail" | "Business";
    firstName: string;
    lastName: string;
    nrc: string;
    phoneNumber: string;
    emailAddress?: string;
    dateOfBirth?: string;
    gender?: "Male" | "Female";
    nationality: string;
    otherNationality?: string;
    maritalStatus?: string;
    registrationDate: string;
    lastUpdated: string;
    status: "Active" | "Inactive" | "Suspended" | "Closed";
    address?: {
      street?: string;
      city?: string;
      province?: string;
      postalCode?: string;
      country?: string;
    };
    employment?: {
      employerId: string;
      employerName: string;
      employerCode: string;
      position?: string;
      department?: string;
      salary?: number;
      employmentDate?: string;
      employmentType?: "Permanent" | "Contract" | "Temporary";
    };
    nextOfKin?: {
      firstName?: string;
      lastName?: string;
      relationship?: string;
      phoneNumber?: string;
      address?: string;
    };
    bankDetails?: {
      bankName?: string;
      accountNumber?: string;
      accountType?: string;
      branchCode?: string;
    };
    creditScore?: number;
    riskRating?: string;
    totalLoans?: number;
    activeLoans?: number;
    totalOutstanding?: number;
    documents?: Array<{
      documentId: string;
      documentType: string;
      documentNumber: string;
      expiryDate?: string;
      issuingAuthority?: string;
      verificationStatus: "Verified" | "Pending" | "Rejected";
      uploadDate: string;
    }>;
  };
}

// ============================================================================
// LOAN PRODUCT RESPONSE
// ============================================================================

export interface LoanProductResponse extends AltusBaseResponse {
  outParams?: {
    productCode: string;
    productName: string;
    productDescription: string;
    category: string;
    isActive: boolean;
    employerId?: string;
    employerName?: string;
    loanTerms: {
      minAmount: number;
      maxAmount: number;
      minTenureMonths: number;
      maxTenureMonths: number;
      interestRate: number;
      interestRateType: "Fixed" | "Variable";
      processingFee?: number;
      processingFeeType?: "Fixed" | "Percentage";
    };
    eligibility: {
      minAge?: number;
      maxAge?: number;
      minSalary?: number;
      minEmploymentMonths?: number;
      employmentTypes?: string[];
      creditScoreRequired?: number;
      guarantorRequired?: boolean;
      collateralRequired?: boolean;
    };
    features: {
      earlyRepaymentAllowed: boolean;
      partialRepaymentAllowed: boolean;
      gracePeriodDays?: number;
      penaltyRate?: number;
      insuranceRequired?: boolean;
      topUpAllowed?: boolean;
    };
    requiredDocuments: Array<{
      documentType: string;
      description: string;
      isMandatory: boolean;
    }>;
    fees?: Array<{
      feeType: string;
      feeAmount?: number;
      feePercentage?: number;
      description: string;
    }>;
    currency: string;
    lastUpdated: string;
  };
}

// ============================================================================
// LOAN REQUEST RESPONSE
// ============================================================================

export interface LoanRequestResponse extends AltusBaseResponse {
  outParams?: {
    applicationId: string;
    referenceNumber: string;
    customerId: string;
    productCode: string;
    requestedAmount: number;
    tenureMonths: number;
    currency: string;
    status: "Submitted" | "Under Review" | "Approved" | "Rejected" | "Cancelled";
    applicationDate: string;
    lastUpdated: string;
    estimatedProcessingDays?: number;
    nextAction?: string;
    assignedOfficer?: {
      officerId: string;
      officerName: string;
      contactNumber?: string;
      emailAddress?: string;
    };
    workflow: Array<{
      stage: string;
      status: "Pending" | "In Progress" | "Completed" | "Rejected";
      startDate?: string;
      completedDate?: string;
      assignedTo?: string;
      comments?: string;
    }>;
    documents?: Array<{
      documentId: string;
      documentType: string;
      fileName: string;
      uploadDate: string;
      verificationStatus: "Pending" | "Verified" | "Rejected";
      rejectionReason?: string;
    }>;
    assessment?: {
      creditScore?: number;
      riskRating?: string;
      debtToIncomeRatio?: number;
      affordabilityAmount?: number;
      recommendations?: string[];
    };
    approvalDetails?: {
      approvedAmount?: number;
      approvedTenure?: number;
      interestRate?: number;
      monthlyInstallment?: number;
      conditions?: string[];
      validUntil?: string;
    };
    rejectionDetails?: {
      rejectionReason?: string;
      rejectionCode?: string;
      rejectionDate?: string;
      appealProcess?: string;
    };
  };
}

// ============================================================================
// BUSINESS CUSTOMER REQUEST
// ============================================================================

export interface BusinessCustomerRequest {
  businessName: string;
  registrationNumber: string;
  taxIdNumber: string;
  businessType: string;
  incorporationDate: string;
  industry: string;
  phoneNumber: string;
  emailAddress?: string;
  website?: string;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode?: string;
    country: string;
  };
  directors: Array<{
    firstName: string;
    lastName: string;
    nrc: string;
    position: string;
    phoneNumber: string;
    shareholding?: number;
  }>;
  financials?: {
    annualRevenue?: number;
    numberOfEmployees?: number;
    yearEstablished?: number;
    bankName?: string;
    accountNumber?: string;
  };
  documents?: Array<{
    documentType: string;
    documentNumber: string;
    expiryDate?: string;
    issuingAuthority?: string;
  }>;
}

// ============================================================================
// UPLOAD DOCUMENT RESPONSE
// ============================================================================

export interface UploadDocumentResponse extends AltusBaseResponse {
  outParams?: {
    documentId: string;
    fileName: string;
    fileSize: number;
    uploadDate: string;
    documentType: string;
    verificationStatus: "Pending" | "Verified" | "Rejected";
    applicationId?: string;
    customerId?: string;
  };
}

// ============================================================================
// COMMON ENUMS AND TYPES
// ============================================================================

export type LoanStatus = 
  | "Draft"
  | "Submitted" 
  | "Under Review"
  | "Document Collection"
  | "Credit Assessment"
  | "Management Approval"
  | "Approved"
  | "Rejected"
  | "Disbursed"
  | "Active"
  | "Completed"
  | "Defaulted"
  | "Written Off"
  | "Cancelled";

export type CustomerStatus = "Active" | "Inactive" | "Suspended" | "Closed";

export type EmploymentType = "Permanent" | "Contract" | "Temporary";

export type Gender = "Male" | "Female";

export type MaritalStatus = "Single" | "Married" | "Divorced" | "Widowed" | "Separated";

export type DocumentVerificationStatus = "Pending" | "Verified" | "Rejected";

export type InterestRateType = "Fixed" | "Variable";

export type Currency = "ZMW" | "USD" | "EUR" | "GBP";

// ============================================================================
// API REQUEST WRAPPERS
// ============================================================================

export interface AltusApiRequest<T = any> {
  body: T;
}

export interface AltusApiResponse<T = any> extends AltusBaseResponse {
  outParams?: T;
}