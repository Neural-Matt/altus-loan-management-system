/**
 * UAT API Workflow Integration
 * Handles the proper sequence: Customer → Loan Request → Document Upload
 */

import { useCallback } from 'react';
import altusApi from '../api/altusApi';
import { useWizardData } from '../components/wizard/WizardDataContext';
import { useAltus } from '../context/AltusContext';

// UAT API Response Types
interface UATResponse<T> {
  executionStatus: 'Success' | 'Failure';
  executionMessage: string;
  instanceId: string;
  outParams: T;
  gridParams: any;
  docParams: any;
}

interface LoanRequestResponse {
  ApplicationNumber: string;
}

interface DocumentUploadResponse {
  LRDocumentDetailsId: string;
}

export interface LoanApplicationWorkflow {
  customer: any;
  loanRequest: any;
  applicationNumber?: string;
}

export const useUATWorkflow = () => {
  const { customer, loan } = useWizardData();
  const { state } = useAltus();

  const submitLoanApplication = useCallback(async (): Promise<string> => {
    console.log('🚀 Starting UAT Loan Application Workflow...');

    // Step 1: Ensure customer is created
    const customerId = customer.customerId || state.currentCustomer?.customerId;
    if (!customerId) {
      throw new Error('Customer must be created first. Please complete the Customer Information step.');
    }

    console.log('✅ Customer ID available:', customerId);

    // Step 2: Submit loan request to get ApplicationNumber
    const loanRequestData = {
      customerId: customerId,
      identityNo: customer.nrc || state.currentCustomer?.nrc,
      contactNo: customer.phone || state.currentCustomer?.phoneNumber,
      emailId: customer.email || state.currentCustomer?.emailAddress,
      tenureMonths: loan.tenureMonths || 12,
      loanAmount: loan.amount || 50000,
      employerName: customer.employerName || '',
      payrollNo: customer.payrollNumber || '',
      netSalary: 15000, // TODO: Get from form
      grossSalary: 18000, // TODO: Get from form
      gender: customer.gender || 'Male'
    };

    console.log('📋 Submitting loan request...', loanRequestData);
    const loanResult = await altusApi.submitLoanRequest(loanRequestData) as UATResponse<LoanRequestResponse>;
    
    if (loanResult.executionStatus !== 'Success' || !loanResult.outParams?.ApplicationNumber) {
      throw new Error(`Loan request failed: ${loanResult.executionMessage}`);
    }

    const applicationNumber = loanResult.outParams.ApplicationNumber;
    console.log('✅ Loan request submitted. ApplicationNumber:', applicationNumber);

    return applicationNumber;
  }, [customer, loan, state]);

  const uploadDocument = useCallback(async (
    applicationNumber: string, 
    documentType: string, 
    file: File
  ): Promise<string> => {
    console.log('📤 Uploading document...', { applicationNumber, documentType, fileName: file.name });
    
    const result = await altusApi.uploadLoanDocument(applicationNumber, documentType, file) as UATResponse<DocumentUploadResponse>;
    
    if (result.executionStatus !== 'Success' || !result.outParams?.LRDocumentDetailsId) {
      throw new Error(`Document upload failed: ${result.executionMessage}`);
    }

    console.log('✅ Document uploaded. Document ID:', result.outParams.LRDocumentDetailsId);
    return result.outParams.LRDocumentDetailsId;
  }, []);

  return {
    submitLoanApplication,
    uploadDocument,
    isCustomerReady: !!(customer.customerId || state.currentCustomer?.customerId)
  };
};

export default useUATWorkflow;