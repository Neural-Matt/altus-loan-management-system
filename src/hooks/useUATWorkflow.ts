/**
 * UAT API Workflow Integration
 * Handles the proper sequence: Customer → Loan Request → Document Upload
 */

import { useCallback } from 'react';
import altusApi from '../api/altusApi';
import { useWizardData } from '../components/wizard/WizardDataContext';
import { useAltus } from '../context/AltusContext';
import { getDefaultBranchForProvince, isValidBranchName, getBranchByPartialMatch } from '../constants/branchConstants';
import { allValidBranches, isValidBranch } from '../constants/bankBranches';

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
  const { customer, loan, setLoan } = useWizardData();
  const { state } = useAltus();

  const submitLoanApplication = useCallback(async (): Promise<string> => {
    console.log('🚀 Starting UAT Loan Application Workflow...');

    // Check if customer was created (optional now)
    const customerId = customer.customerId || state.currentCustomer?.customerId;
    
    // Allow proceeding without customer creation - use form data directly
    if (!customerId) {
      console.log('⚠️ No CustomerID found - proceeding with form data only (TypeOfCustomer: New)');
    } else {
      console.log('✅ Customer ID available:', customerId);
    }

    // Validate required customer data from form
    if (!customer.firstName || !customer.lastName) {
      throw new Error('Please complete Step 1: Customer Information (fill in your name and basic details) before uploading documents.');
    }

    if (!customer.nrc || !customer.phone || !customer.email) {
      throw new Error('Please complete Step 1: Customer Information (fill in NRC, phone, and email) before uploading documents.');
    }

    // Validate loan amount is provided
    if (!loan.amount || loan.amount <= 0) {
      throw new Error('Please complete Step 2: Loan Calculator and specify a loan amount before uploading documents.');
    }

    // Step 2: Submit loan request to get ApplicationNumber
    // Using TypeOfCustomer "New" with all customer details from form
    // This allows creating loan application even without prior customer creation
    const loanRequestData = {
      TypeOfCustomer: "New",
      customerId: customerId || "", // Empty if no customer created yet
      
      // Personal details for New customer (from form data)
      firstName: customer.firstName || "",
      middleName: "",
      lastName: customer.lastName || "",
      dateOfBirth: customer.dateOfBirth || "",
      
      // Identity and contact details
      identityNo: customer.nrc || "",
      contactNo: customer.phone || "",
      emailId: customer.email || "",
      
      // Address Information
      primaryAddress: customer.address || "",
      provinceName: customer.province || "",
      districtName: customer.city || "",
      countryName: "Zambia",
      postalcode: customer.postalCode || "",
      
      // Employment details
      employeeNumber: customer.payrollNumber || customer.employerId || "",
      designation: customer.occupation || "",
      employerName: customer.employerName || "",
      employmentType: customer.employmentType === "Permanent" ? "1" : customer.employmentType === "Contract" ? "2" : "1",
      
      // Loan details
      tenure: loan.tenureMonths || 12,
      loanAmount: loan.amount,
      grossIncome: customer.salary || 0,
      netIncome: customer.salary ? customer.salary * 0.85 : 0,
      deductions: customer.salary ? customer.salary * 0.15 : 0,
      gender: customer.gender || 'Male',
      
      // Bank Details
      financialInstitutionName: customer.bankName || "",
      financialInstitutionBranchName: (() => {
        // Ensure branch is a valid ALTUS API branch name
        const providedBranch = customer.bankBranch?.trim() || "";
        
        console.log('🔍 Bank Branch Validation:', { providedBranch, isValid: isValidBranchName(providedBranch) });
        
        // If valid, use as-is
        if (isValidBranchName(providedBranch)) {
          console.log('✅ Using provided branch:', providedBranch);
          return providedBranch;
        }
        
        // Try to find matching branch by partial name
        const matchedBranch = getBranchByPartialMatch(providedBranch);
        if (matchedBranch) {
          console.log(`📍 Mapped "${providedBranch}" to valid branch: "${matchedBranch}"`);
          return matchedBranch;
        }
        
        // Fall back to province-based default
        const defaultBranch = getDefaultBranchForProvince(customer.province || "");
        console.log(`📍 Using default branch for province "${customer.province}": "${defaultBranch}"`);
        return defaultBranch;
      })(),
      accountNumber: customer.accountNumber || "",
      accountType: customer.accountType || "",
      
      // Reference/Referrer Details
      referrerName: customer.reference?.name || "",
      referrerNRC: customer.reference?.nrc || "",
      referrerContactNo: customer.reference?.phone || "",
      referrerPhysicalAddress: customer.reference?.address || "",
      referrerRelationType: customer.reference?.relationship || "",
      
      // Next of Kin Details
      kinName: customer.nextOfKin ? `${customer.nextOfKin.firstName || ''} ${customer.nextOfKin.lastName || ''}`.trim() : "",
      kinNRC: customer.nextOfKin?.nrc || "",
      kinRelationship: customer.nextOfKin?.relationship || "",
      kinMobileNo: customer.nextOfKin?.phone || "",
      kinAddress: customer.nextOfKin?.address || "",
      kinProvinceName: customer.nextOfKin?.province || "",
      kinDistrictName: customer.nextOfKin?.city || "",
      kinCountryName: "Zambia"
    };

    console.log('📋 Submitting loan request...', {
      customerId: customerId || '(none - using form data)',
      identityNo: loanRequestData.identityNo,
      loanAmount: loanRequestData.loanAmount,
      tenure: loanRequestData.tenure,
      bankName: loanRequestData.financialInstitutionName,
      bankBranch: loanRequestData.financialInstitutionBranchName,
      hasPersonalDetails: true,
      hasAddressDetails: !!(loanRequestData.primaryAddress && loanRequestData.provinceName),
      hasBankDetails: !!(loanRequestData.financialInstitutionName && loanRequestData.accountNumber),
      hasNextOfKin: !!loanRequestData.kinName,
      hasReference: !!loanRequestData.referrerName
    });
    
    // ============================================================================
    // CRITICAL VALIDATION GUARD - Validate branch name against ALTUS 37 branches
    // ============================================================================
    console.log('🔒 Final branch being sent to ALTUS →', loanRequestData.financialInstitutionBranchName);
    
    if (!isValidBranch(loanRequestData.financialInstitutionBranchName)) {
      const errorMessage = `❌ Invalid branch selected: "${loanRequestData.financialInstitutionBranchName}". Must be one of the 37 exact ALTUS branch names.`;
      console.error(errorMessage);
      console.error('📋 Valid branches:', allValidBranches);
      throw new Error(
        `Invalid branch name: "${loanRequestData.financialInstitutionBranchName}". ` +
        `ALTUS only accepts these exact branch names: ${allValidBranches.slice(0, 5).join(', ')}... (37 total). ` +
        `Please select a valid branch from the dropdown.`
      );
    }
    
    console.log('✅ Branch validation passed:', loanRequestData.financialInstitutionBranchName);
    
    const loanResult = await altusApi.submitLoanRequest(loanRequestData) as UATResponse<LoanRequestResponse>;
    
    console.log('📋 Full Loan Request Response:', loanResult);
    
    if (loanResult.executionStatus !== 'Success' || !loanResult.outParams?.ApplicationNumber) {
      console.error('❌ Loan request failed:', loanResult);
      throw new Error(`Loan request failed: ${loanResult.executionMessage || 'No ApplicationNumber returned'}`);
    }

    const applicationNumber = loanResult.outParams.ApplicationNumber;
    console.log('✅ Loan request submitted. ApplicationNumber:', applicationNumber);
    console.log('⏳ Note: Backend requires manual approval before ApplicationNumber becomes active for document uploads');
    console.log('📝 Documents will be stored locally and uploaded automatically after approval');

    // Save applicationNumber to wizard context
    setLoan({
      ...loan,
      applicationNumber,
      applicationId: applicationNumber // Alias for easier access
    });

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