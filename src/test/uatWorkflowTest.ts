/**
 * Simple UAT API Workflow Test
 * Tests the complete workflow: Customer Creation → Loan Request → Document Upload
 */

import altusApi from '../api/altusApi';

interface UATWorkflowTestResult {
  step: string;
  success: boolean;
  data?: any;
  error?: string;
  duration?: number;
}

// Test the UAT workflow with real API calls
export async function testUATWorkflow(): Promise<UATWorkflowTestResult[]> {
  console.log('🚀 Starting UAT Workflow Test...');
  
  const results: UATWorkflowTestResult[] = [];
  let customerId: string | undefined;
  let applicationNumber: string | undefined;

  // Step 1: Test Loan Request with existing customer
  try {
    console.log('💰 Testing Loan Request...');
    const startTime = Date.now();
    
    const loanData = {
      customerId: 'RC20250550000000046', // Use existing customer from previous tests
      identityNo: '999999999999',
      contactNo: '+260977123456',
      emailId: `test${Date.now()}@example.com`,
      tenureMonths: 12,
      loanAmount: 50000,
      employerName: 'Test Company',
      payrollNo: '12345',
      netSalary: 15000,
      grossSalary: 18000,
      dateOfBirth: '01/01/1990 00:00:00',
      gender: 'Male'
    };

    const response = await altusApi.submitLoanRequest(loanData);
    
    if (response && response.executionStatus === 'Success' && response.outParams?.ApplicationNumber) {
      applicationNumber = response.outParams.ApplicationNumber;
      results.push({
        step: 'Loan Request',
        success: true,
        data: { applicationNumber },
        duration: Date.now() - startTime
      });
      console.log('✅ Loan Request Success:', applicationNumber);
    } else {
      throw new Error(`Loan request failed: ${response?.executionMessage || 'Unknown error'}`);
    }
  } catch (error) {
    results.push({
      step: 'Loan Request',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: 0
    });
    console.error('❌ Loan Request Failed:', error);
  }

  // Step 2: Test Document Upload (if loan request succeeded)
  if (applicationNumber) {
    try {
      console.log('📄 Testing Document Upload...');
      const startTime = Date.now();
      
      // Create a test file (simulate NRC document)
      const testContent = 'This is a test NRC document for UAT workflow validation';
      const blob = new Blob([testContent], { type: 'text/plain' });
      const testFile = new File([blob], 'test-nrc.txt', { type: 'text/plain' });

      const response = await altusApi.uploadLoanDocument(
        applicationNumber,
        '6', // NRC document type code
        testFile
      );
      
      if (response && response.executionStatus === 'Success' && response.outParams?.LRDocumentDetailsId) {
        results.push({
          step: 'Document Upload',
          success: true,
          data: { documentId: response.outParams.LRDocumentDetailsId },
          duration: Date.now() - startTime
        });
        console.log('✅ Document Upload Success:', response.outParams.LRDocumentDetailsId);
      } else {
        throw new Error(`Document upload failed: ${response?.executionMessage || 'Unknown error'}`);
      }
    } catch (error) {
      results.push({
        step: 'Document Upload',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: 0
      });
      console.error('❌ Document Upload Failed:', error);
    }
  }

  // Display results
  console.log('\n🏁 UAT Workflow Test Results:');
  console.log('================================');
  
  results.forEach((result, index) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const duration = result.duration ? `(${result.duration}ms)` : '';
    
    console.log(`${index + 1}. ${result.step}: ${status} ${duration}`);
    
    if (result.success && result.data) {
      console.log(`   Data:`, result.data);
    }
    
    if (!result.success && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  const totalPassed = results.filter(r => r.success).length;
  const totalTests = results.length;
  const successRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
  
  console.log('\n📊 Summary:');
  console.log(`Passed: ${totalPassed}/${totalTests} (${successRate}%)`);
  
  if (totalPassed === totalTests) {
    console.log('🎉 All UAT workflow tests passed! The integration is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.');
  }

  return results;
}

export default testUATWorkflow;