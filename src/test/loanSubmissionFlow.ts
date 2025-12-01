/**
 * LOAN SUBMISSION WORKFLOW - STEP 1 & 2 DEMONSTRATION
 * ====================================================
 * 
 * This file demonstrates the complete flow:
 * Step 1: Submit a loan request (Salaried or Business)
 * Step 2: Extract the ApplicationNumber from response
 * Step 3: Upload documents using that ApplicationNumber
 */

import { 
  submitLoanRequest, 
  submitBusinessLoanRequest,
  uploadLoanDocument 
} from '../api/altusApi';

/**
 * STEP 1: SUBMIT SALARIED LOAN REQUEST
 * =====================================
 * This function submits a salaried loan request and returns the ApplicationNumber
 */
export async function testSalariedLoanSubmission() {
  console.log('========================================');
  console.log('STEP 1: SUBMITTING SALARIED LOAN REQUEST');
  console.log('========================================');
  
  // Sample salaried loan request data
  const salariedLoanData = {
    FirstName: "John",
    LastName: "Doe",
    Email: "john.doe@example.com",
    PhoneNumber: "1234567890",
    NationalID: "12345678",
    DateOfBirth: "1990-01-15",
    Gender: "Male",
    MaritalStatus: "Single",
    EmployerName: "ABC Corporation",
    JobTitle: "Software Engineer",
    MonthlyIncome: 150000,
    EmploymentDuration: 36, // months
    LoanAmount: 500000,
    LoanTerm: 12, // months
    LoanPurpose: "Personal",
    ResidentialAddress: "123 Main Street, Nairobi",
    County: "Nairobi",
    NextOfKinName: "Jane Doe",
    NextOfKinPhone: "0987654321",
    Relationship: "Sister"
  };

  try {
    console.log('\n📤 Sending request to API...');
    console.log('Request Data:', JSON.stringify(salariedLoanData, null, 2));
    
    // CRITICAL: This is where we submit the loan
    const response = await submitLoanRequest(salariedLoanData);
    
    console.log('\n✅ SUCCESS! Loan request submitted');
    console.log('Full Response:', JSON.stringify(response, null, 2));
    
    // CRITICAL: Extract the ApplicationNumber from response
    const applicationNumber = response.outParams?.ApplicationNumber;
    
    if (applicationNumber) {
      console.log('\n🎯 APPLICATION NUMBER RETRIEVED:');
      console.log('═══════════════════════════════════');
      console.log(`   ${applicationNumber}`);
      console.log('═══════════════════════════════════');
      console.log('\n✨ This ApplicationNumber will be used in Step 2 for document upload');
      
      return {
        success: true,
        applicationNumber,
        fullResponse: response
      };
    } else {
      console.error('\n❌ ERROR: ApplicationNumber not found in response');
      console.log('Response structure:', response);
      return {
        success: false,
        error: 'ApplicationNumber not found in response',
        fullResponse: response
      };
    }
    
  } catch (error: any) {
    console.error('\n❌ ERROR submitting loan request:');
    console.error('Error details:', error.message);
    console.error('Full error:', error);
    
    return {
      success: false,
      error: error.message,
      fullError: error
    };
  }
}

/**
 * STEP 1 (ALTERNATIVE): SUBMIT BUSINESS LOAN REQUEST
 * ===================================================
 * This function submits a business loan request and returns the ApplicationNumber
 */
export async function testBusinessLoanSubmission() {
  console.log('========================================');
  console.log('STEP 1: SUBMITTING BUSINESS LOAN REQUEST');
  console.log('========================================');
  
  // Sample business loan request data
  const businessLoanData = {
    FirstName: "Jane",
    LastName: "Smith",
    Email: "jane.smith@example.com",
    PhoneNumber: "0712345678",
    NationalID: "87654321",
    DateOfBirth: "1985-05-20",
    Gender: "Female",
    MaritalStatus: "Married",
    BusinessName: "Smith Enterprises Ltd",
    BusinessType: "Retail",
    BusinessRegistrationNumber: "BUS/2020/12345",
    YearsInBusiness: 5,
    MonthlyRevenue: 800000,
    MonthlyExpenses: 500000,
    LoanAmount: 1000000,
    LoanTerm: 24, // months
    LoanPurpose: "Business Expansion",
    BusinessAddress: "456 Commerce Street, Mombasa",
    County: "Mombasa",
    NextOfKinName: "John Smith",
    NextOfKinPhone: "0798765432",
    Relationship: "Spouse"
  };

  try {
    console.log('\n📤 Sending request to API...');
    console.log('Request Data:', JSON.stringify(businessLoanData, null, 2));
    
    // CRITICAL: This is where we submit the business loan
    const response = await submitBusinessLoanRequest(businessLoanData);
    
    console.log('\n✅ SUCCESS! Business loan request submitted');
    console.log('Full Response:', JSON.stringify(response, null, 2));
    
    // CRITICAL: Extract the ApplicationNumber from response
    const applicationNumber = response.outParams?.ApplicationNumber;
    
    if (applicationNumber) {
      console.log('\n🎯 APPLICATION NUMBER RETRIEVED:');
      console.log('═══════════════════════════════════');
      console.log(`   ${applicationNumber}`);
      console.log('═══════════════════════════════════');
      console.log('\n✨ This ApplicationNumber will be used in Step 2 for document upload');
      
      return {
        success: true,
        applicationNumber,
        fullResponse: response
      };
    } else {
      console.error('\n❌ ERROR: ApplicationNumber not found in response');
      console.log('Response structure:', response);
      return {
        success: false,
        error: 'ApplicationNumber not found in response',
        fullResponse: response
      };
    }
    
  } catch (error: any) {
    console.error('\n❌ ERROR submitting business loan request:');
    console.error('Error details:', error.message);
    console.error('Full error:', error);
    
    return {
      success: false,
      error: error.message,
      fullError: error
    };
  }
}

/**
 * STEP 2: UPLOAD DOCUMENTS USING APPLICATION NUMBER
 * ==================================================
 * This function uploads documents using the ApplicationNumber from Step 1
 */
export async function testDocumentUpload(applicationNumber: string) {
  console.log('\n========================================');
  console.log('STEP 2: UPLOADING DOCUMENTS');
  console.log('========================================');
  console.log(`Using ApplicationNumber: ${applicationNumber}`);
  
  try {
    // Create a sample file (in browser, you'd use actual File objects)
    // For this demo, we'll show the structure
    const sampleFile = new File(['Sample document content'], 'national_id.pdf', { 
      type: 'application/pdf' 
    });
    
    const documentType = 'NationalID'; // Document type for the upload
    
    console.log('\n📤 Uploading document...');
    console.log('Document Details:');
    console.log(`  - ApplicationNumber: ${applicationNumber}`);
    console.log(`  - DocumentType: ${documentType}`);
    console.log(`  - FileName: ${sampleFile.name}`);
    console.log(`  - FileType: ${sampleFile.type}`);
    console.log(`  - FileSize: ${sampleFile.size} bytes`);
    
    // CRITICAL: Upload using the ApplicationNumber from Step 1
    const response = await uploadLoanDocument(applicationNumber, documentType, sampleFile);
    
    console.log('\n✅ SUCCESS! Document uploaded');
    console.log('Upload Response:', JSON.stringify(response, null, 2));
    
    return {
      success: true,
      response
    };
    
  } catch (error: any) {
    console.error('\n❌ ERROR uploading document:');
    console.error('Error details:', error.message);
    console.error('Full error:', error);
    
    return {
      success: false,
      error: error.message,
      fullError: error
    };
  }
}

/**
 * COMPLETE WORKFLOW: STEP 1 + STEP 2
 * ===================================
 * This function executes the complete flow from loan submission to document upload
 */
export async function executeCompleteWorkflow(loanType: 'salaried' | 'business' = 'salaried') {
  console.log('\n');
  console.log('████████████████████████████████████████████████████████');
  console.log('  COMPLETE LOAN SUBMISSION WORKFLOW');
  console.log('████████████████████████████████████████████████████████');
  console.log('\n');
  
  try {
    // STEP 1: Submit loan request based on type
    console.log('🚀 Starting Step 1: Loan Submission...\n');
    
    let step1Result;
    if (loanType === 'salaried') {
      step1Result = await testSalariedLoanSubmission();
    } else {
      step1Result = await testBusinessLoanSubmission();
    }
    
    if (!step1Result.success || !step1Result.applicationNumber) {
      console.error('\n❌ WORKFLOW STOPPED: Failed to get ApplicationNumber from Step 1');
      return {
        success: false,
        step: 1,
        error: step1Result.error
      };
    }
    
    console.log('\n✅ Step 1 Complete!');
    console.log(`   ApplicationNumber: ${step1Result.applicationNumber}`);
    
    // STEP 2: Upload documents using the ApplicationNumber
    console.log('\n🚀 Starting Step 2: Document Upload...\n');
    
    const step2Result = await testDocumentUpload(step1Result.applicationNumber);
    
    if (!step2Result.success) {
      console.error('\n❌ WORKFLOW ERROR: Failed to upload document in Step 2');
      return {
        success: false,
        step: 2,
        applicationNumber: step1Result.applicationNumber,
        error: step2Result.error
      };
    }
    
    console.log('\n✅ Step 2 Complete!');
    
    // WORKFLOW COMPLETE
    console.log('\n');
    console.log('████████████████████████████████████████████████████████');
    console.log('  ✨ WORKFLOW COMPLETED SUCCESSFULLY! ✨');
    console.log('████████████████████████████████████████████████████████');
    console.log('\n');
    console.log('Summary:');
    console.log(`  ✅ Loan Type: ${loanType}`);
    console.log(`  ✅ ApplicationNumber: ${step1Result.applicationNumber}`);
    console.log(`  ✅ Loan Request: Submitted`);
    console.log(`  ✅ Documents: Uploaded`);
    console.log('\n');
    
    return {
      success: true,
      applicationNumber: step1Result.applicationNumber,
      loanResponse: step1Result.fullResponse,
      uploadResponse: step2Result.response
    };
    
  } catch (error: any) {
    console.error('\n❌ WORKFLOW ERROR:');
    console.error('Error details:', error.message);
    console.error('Full error:', error);
    
    return {
      success: false,
      error: error.message,
      fullError: error
    };
  }
}

/**
 * BROWSER CONSOLE USAGE
 * ======================
 * 
 * To run this in the browser console:
 * 
 * 1. Import the module (if using React):
 *    import { executeCompleteWorkflow, testSalariedLoanSubmission } from './test/loanSubmissionFlow';
 * 
 * 2. Execute complete workflow:
 *    executeCompleteWorkflow('salaried');  // For salaried loan
 *    executeCompleteWorkflow('business');  // For business loan
 * 
 * 3. Or run steps individually:
 *    // Step 1 only
 *    const result = await testSalariedLoanSubmission();
 *    console.log(result.applicationNumber);
 *    
 *    // Step 2 only (using application number from Step 1)
 *    await testDocumentUpload('APP123456789');
 */

// Export all functions
const loanSubmissionFlowTests = {
  testSalariedLoanSubmission,
  testBusinessLoanSubmission,
  testDocumentUpload,
  executeCompleteWorkflow
};

export default loanSubmissionFlowTests;
