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
  const { customer, loan, setCustomer, setLoan } = useWizardData();
  const { state } = useAltus();

  const submitLoanApplication = useCallback(async (): Promise<string> => {
    console.log('🚀 Starting UAT Loan Application Workflow...');

    let customerId = customer.customerId || state.currentCustomer?.customerId;
    
    // For new customers, create customer first
    if (!customerId) {
      console.log('👤 No CustomerID found - creating new customer first...');
      
      // Prepare customer creation data
      const customerRequest = {
        firstName: customer.firstName || '',
        lastName: customer.lastName || customer.firstName || '', // Use firstName if lastName is empty
        nrc: customer.nrc || '',
        nrcIssueDate: customer.nrcIssueDate || '',
        phoneNumber: customer.phone || '',
        emailAddress: customer.email || '',
        dateOfBirth: customer.dateOfBirth || '',
        title: customer.title || '',
        gender: (customer.gender as "Male" | "Female") || "Male",
        nationality: customer.nationality === 'Other' ? customer.otherNationality || '' : customer.nationality || 'Zambian',
        maritalStatus: customer.maritalStatus || 'Single',
        address: {
          street: customer.address || '',
          city: customer.city || '',
          province: customer.province || '',
          postalCode: customer.postalCode || "",
          country: "Zambia"
        },
        preferredBranch: customer.preferredBranch,
        employment: {
          employerId: customer.employerId || "EMP001",
          employerName: customer.employerName || '',
          employerCode: customer.payrollNumber || '',
          position: customer.occupation || 'Employee',
          salary: customer.salary || 0,
          employmentDate: customer.employmentDate || '',
          employmentType: (customer.employmentType as "Permanent" | "Contract" | "Temporary") || "Permanent"
        },
        nextOfKin: {
          firstName: customer.nextOfKin?.firstName || '',
          lastName: customer.nextOfKin?.lastName || '',
          relationship: customer.nextOfKin?.relationship || '',
          phoneNumber: customer.nextOfKin?.phone || '',
          address: customer.nextOfKin?.address || ''
        },
        bankDetails: {
          bankName: customer.bankName || '',
          accountNumber: customer.accountNumber || '',
          accountType: customer.accountType || '',
          branchCode: customer.bankBranch || ''
        }
      };

      try {
        const createdCustomer = await altusApi.createRetailCustomer(customerRequest);
        
        // The API specification says outParams.CustomerID should be returned
        // But the backend may return RequestId instead - check both
        customerId = createdCustomer.outParams?.CustomerID || createdCustomer.outParams?.RequestId;
        
        // If neither field exists, use the instanceId as a last resort identifier
        if (!customerId) {
          if (createdCustomer.instanceId) {
            console.warn('⚠️  CustomerID not returned by API, using instanceId as fallback:', createdCustomer.instanceId);
            customerId = createdCustomer.instanceId;
          } else {
            throw new Error('Customer creation succeeded but no CustomerID or instanceId returned');
          }
        }
        
        console.log('✅ Customer created successfully, ID:', customerId);
        
        // Update wizard data with the CustomerID
        setCustomer({
          ...customer,
          customerId: customerId,
          apiCustomerData: createdCustomer
        });
      } catch (error) {
        console.error('❌ Customer creation failed:', error);
        throw error;
      }
    } else {
      console.log('✅ Using existing Customer ID:', customerId);
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
    // Customer already created, so use TypeOfCustomer "Existing"
    const loanRequestData = {
      TypeOfCustomer: "Existing",
      CustomerId: customerId,
      
      // Identity and contact details (required even for existing customers)
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
      financialInstitutionBranchName: customer.bankBranch || "",
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
      hasPersonalDetails: true,
      hasAddressDetails: !!(loanRequestData.primaryAddress && loanRequestData.provinceName),
      hasBankDetails: !!(loanRequestData.financialInstitutionName && loanRequestData.accountNumber),
      hasNextOfKin: !!loanRequestData.kinName,
      hasReference: !!loanRequestData.referrerName
    });
    const loanResult = await altusApi.submitLoanRequest(loanRequestData) as UATResponse<LoanRequestResponse>;
    
    console.log('📋 Full Loan Request Response:', loanResult);
    console.log('📋 Response Status:', loanResult.executionStatus);
    console.log('📋 Response Message:', loanResult.executionMessage);
    console.log('📋 Response outParams:', loanResult.outParams);
    
    if (loanResult.executionStatus !== 'Success' || !loanResult.outParams?.ApplicationNumber) {
      console.error('❌ Loan request failed:', loanResult);
      console.error('❌ Error Message:', loanResult.executionMessage);
      throw new Error(`Loan request failed: ${loanResult.executionMessage || 'No ApplicationNumber returned'}`);
    }

    const applicationNumber = loanResult.outParams.ApplicationNumber;
    console.log('✅ Loan request submitted. ApplicationNumber:', applicationNumber);
    
    // Update wizard data with the ApplicationNumber
    setLoan({
      ...loan,
      applicationNumber: applicationNumber
    });
    
    console.log('⏳ Note: Backend requires manual approval before ApplicationNumber becomes active for document uploads');
    console.log('📝 Documents will be stored locally and uploaded automatically after approval');

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