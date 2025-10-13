/**
 * Comprehensive API Testing Script for Altus Loan Management System
 * Tests all API endpoints, authentication, error handling, and mock functionality
 */

import { altusApi } from '../api/altusApi.js';
import { mockSubmitApplication, mockGetApplicationStatus } from '../api/mockApi.js';

// Test configuration
const TEST_CONFIG = {
  // Mock data for testing
  testCustomer: {
    firstName: 'John',
    lastName: 'Doe',
    nrc: '123456/78/90',
    phoneNumber: '+260977123456',
    emailAddress: 'john.doe@test.com',
    nationality: 'Zambian',
    dateOfBirth: '1990-01-01',
    gender: 'M',
    maritalStatus: 'Single',
    address: {
      line1: '123 Test Street',
      city: 'Lusaka',
      province: 'Lusaka',
      country: 'Zambia',
      postalCode: '10101'
    },
    employment: {
      employerName: 'Test Company',
      employerId: 'TEST001',
      position: 'Software Developer',
      monthlySalary: 5000,
      employmentType: 'PERMANENT'
    }
  },
  testLoanRequest: {
    productCode: 'PERSONAL_LOAN',
    amount: 10000,
    currency: 'ZMW',
    tenureMonths: 12,
    purpose: 'Personal use'
  },
  testBearerToken: 'test_bearer_token_12345',
  mockLoanId: 'LOAN123456789'
};

// Test results storage
let testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  details: []
};

// Utility functions
function logTest(testName, status, details = '') {
  const timestamp = new Date().toISOString();
  const result = { testName, status, details, timestamp };
  
  testResults.details.push(result);
  
  if (status === 'PASS') {
    testResults.passed++;
    console.log(`✅ ${testName}: PASSED ${details ? '- ' + details : ''}`);
  } else {
    testResults.failed++;
    testResults.errors.push(result);
    console.log(`❌ ${testName}: FAILED ${details ? '- ' + details : ''}`);
  }
}

function createTestFile(content = 'Test file content', filename = 'test.txt', type = 'text/plain') {
  return new File([content], filename, { type });
}

function createFormData(customerId, documentType, file) {
  const formData = new FormData();
  formData.append('customerId', customerId);
  formData.append('documentType', documentType);
  formData.append('file', file);
  return formData;
}

// Test Suite 1: Authentication & Token Handling
async function testAuthentication() {
  console.log('\n📋 Testing Authentication & Token Handling...\n');

  try {
    // Test 1: Token validation
    const tokenValidation = altusApi.isTokenValid && altusApi.isTokenValid(TEST_CONFIG.testBearerToken);
    logTest('Token Validation Function', tokenValidation ? 'PASS' : 'FAIL', 
      tokenValidation ? 'Token validation working' : 'Token validation not available');

    // Test 2: Bearer token setting
    if (altusApi.updateBearerToken) {
      altusApi.updateBearerToken(TEST_CONFIG.testBearerToken);
      logTest('Bearer Token Setting', 'PASS', 'Token updated successfully');
    } else {
      logTest('Bearer Token Setting', 'FAIL', 'updateBearerToken method not available');
    }

    // Test 3: API health check
    try {
      const healthCheck = await altusApi.checkHealth();
      logTest('API Health Check', healthCheck ? 'PASS' : 'FAIL', 
        healthCheck ? 'API responding' : 'API not responding');
    } catch (error) {
      logTest('API Health Check', 'FAIL', `Health check failed: ${error.message}`);
    }

  } catch (error) {
    logTest('Authentication Test Suite', 'FAIL', `Suite error: ${error.message}`);
  }
}

// Test Suite 2: Customer Operations
async function testCustomerOperations() {
  console.log('\n👤 Testing Customer Operations...\n');

  try {
    // Test 1: Create retail customer
    try {
      const newCustomer = await altusApi.createRetailCustomer(TEST_CONFIG.testCustomer);
      logTest('Create Retail Customer', newCustomer ? 'PASS' : 'FAIL', 
        newCustomer ? `Customer created: ${newCustomer.customerId}` : 'Customer creation failed');
      
      if (newCustomer) {
        TEST_CONFIG.testCustomerId = newCustomer.customerId;
      }
    } catch (error) {
      logTest('Create Retail Customer', 'FAIL', `Error: ${error.message}`);
    }

    // Test 2: Fetch customer by NRC
    try {
      const customer = await altusApi.getCustomerDetails(TEST_CONFIG.testCustomer.nrc);
      logTest('Fetch Customer by NRC', customer ? 'PASS' : 'FAIL',
        customer ? `Found customer: ${customer.firstName} ${customer.lastName}` : 'Customer not found');
    } catch (error) {
      logTest('Fetch Customer by NRC', 'FAIL', `Error: ${error.message}`);
    }

  } catch (error) {
    logTest('Customer Operations Test Suite', 'FAIL', `Suite error: ${error.message}`);
  }
}

// Test Suite 3: Document Upload API
async function testDocumentUpload() {
  console.log('\n📄 Testing Document Upload API...\n');

  try {
    // Test 1: Create test files
    const testFiles = {
      validImage: createTestFile('Mock image content', 'test-nrc.jpg', 'image/jpeg'),
      validPDF: createTestFile('Mock PDF content', 'test-payslip.pdf', 'application/pdf'),
      invalidFile: createTestFile('Invalid content', 'test.exe', 'application/x-executable'),
      largeFile: createTestFile('x'.repeat(6 * 1024 * 1024), 'large.jpg', 'image/jpeg') // 6MB
    };

    logTest('Test File Creation', 'PASS', `Created ${Object.keys(testFiles).length} test files`);

    // Test 2: File validation
    if (altusApi.preValidateFile) {
      try {
        const validResult = await altusApi.preValidateFile(testFiles.validImage);
        logTest('File Validation - Valid File', validResult.ok ? 'PASS' : 'FAIL', 
          validResult.ok ? 'Valid file accepted' : validResult.error);

        const invalidResult = await altusApi.preValidateFile(testFiles.invalidFile);
        logTest('File Validation - Invalid Type', !invalidResult.ok ? 'PASS' : 'FAIL',
          !invalidResult.ok ? 'Invalid file rejected' : 'Invalid file incorrectly accepted');

        const largeResult = await altusApi.preValidateFile(testFiles.largeFile);
        logTest('File Validation - Size Limit', !largeResult.ok ? 'PASS' : 'FAIL',
          !largeResult.ok ? 'Large file rejected' : 'Large file incorrectly accepted');

      } catch (error) {
        logTest('File Validation', 'FAIL', `Validation error: ${error.message}`);
      }
    }

    // Test 3: Document upload
    if (TEST_CONFIG.testCustomerId) {
      try {
        const formData = createFormData(TEST_CONFIG.testCustomerId, 'NRC', testFiles.validImage);
        const uploadResult = await altusApi.uploadLoanDocument(formData);
        
        logTest('Document Upload', uploadResult ? 'PASS' : 'FAIL',
          uploadResult ? `Upload successful: ${uploadResult.documentId || 'ID not provided'}` : 'Upload failed');

      } catch (error) {
        logTest('Document Upload', 'FAIL', `Upload error: ${error.message}`);
      }
    } else {
      logTest('Document Upload', 'SKIP', 'No customer ID available for upload test');
    }

  } catch (error) {
    logTest('Document Upload Test Suite', 'FAIL', `Suite error: ${error.message}`);
  }
}

// Test Suite 4: Loan Operations
async function testLoanOperations() {
  console.log('\n💰 Testing Loan Operations...\n');

  try {
    // Test 1: Submit loan request
    if (TEST_CONFIG.testCustomerId) {
      try {
        const loanRequest = {
          ...TEST_CONFIG.testLoanRequest,
          customerId: TEST_CONFIG.testCustomerId
        };
        
        const result = await altusApi.submitLoanRequest(loanRequest);
        logTest('Submit Loan Request', result ? 'PASS' : 'FAIL',
          result ? `Request submitted: ${result.applicationId || result.referenceNumber}` : 'Submission failed');
        
        if (result) {
          TEST_CONFIG.testLoanId = result.applicationId || result.loanId;
        }
      } catch (error) {
        logTest('Submit Loan Request', 'FAIL', `Error: ${error.message}`);
      }
    }

    // Test 2: Fetch loan status
    const loanId = TEST_CONFIG.testLoanId || TEST_CONFIG.mockLoanId;
    try {
      const status = await altusApi.getLoanStatus(loanId);
      logTest('Fetch Loan Status', status ? 'PASS' : 'FAIL',
        status ? `Status: ${status.status || 'Status retrieved'}` : 'Status fetch failed');
    } catch (error) {
      logTest('Fetch Loan Status', 'FAIL', `Error: ${error.message}`);
    }

    // Test 3: Fetch loan details
    try {
      const details = await altusApi.getLoanDetails(loanId);
      logTest('Fetch Loan Details', details ? 'PASS' : 'FAIL',
        details ? `Amount: ${details.loanAmount || 'Details retrieved'}` : 'Details fetch failed');
    } catch (error) {
      logTest('Fetch Loan Details', 'FAIL', `Error: ${error.message}`);
    }

    // Test 4: Fetch loan balance
    try {
      const balance = await altusApi.getLoanBalance(loanId);
      logTest('Fetch Loan Balance', balance ? 'PASS' : 'FAIL',
        balance ? `Balance: ${balance.totalBalance || 'Balance retrieved'}` : 'Balance fetch failed');
    } catch (error) {
      logTest('Fetch Loan Balance', 'FAIL', `Error: ${error.message}`);
    }

  } catch (error) {
    logTest('Loan Operations Test Suite', 'FAIL', `Suite error: ${error.message}`);
  }
}

// Test Suite 5: Mock API Integration
async function testMockAPI() {
  console.log('\n🎭 Testing Mock API Integration...\n');

  try {
    // Test 1: Mock application submission
    try {
      const mockPayload = {
        customer: TEST_CONFIG.testCustomer,
        loan: TEST_CONFIG.testLoanRequest
      };
      
      const result = await mockSubmitApplication(mockPayload);
      logTest('Mock Application Submission', result ? 'PASS' : 'FAIL',
        result ? `Reference: ${result.referenceId}` : 'Mock submission failed');
      
      if (result) {
        TEST_CONFIG.mockReferenceId = result.referenceId;
      }
    } catch (error) {
      logTest('Mock Application Submission', 'FAIL', `Error: ${error.message}`);
    }

    // Test 2: Mock status retrieval
    const referenceId = TEST_CONFIG.mockReferenceId || 'ALT24127890AB'; // Use sample data
    try {
      const status = await mockGetApplicationStatus(referenceId);
      logTest('Mock Status Retrieval', status ? 'PASS' : 'FAIL',
        status ? `Status: ${status.currentStatus}` : 'Mock status failed');
    } catch (error) {
      logTest('Mock Status Retrieval', 'FAIL', `Error: ${error.message}`);
    }

  } catch (error) {
    logTest('Mock API Test Suite', 'FAIL', `Suite error: ${error.message}`);
  }
}

// Test Suite 6: Error Handling & Recovery
async function testErrorHandling() {
  console.log('\n⚠️ Testing Error Handling & Recovery...\n');

  try {
    // Test 1: Invalid endpoint
    try {
      await altusApi.get('/invalid/endpoint');
      logTest('Invalid Endpoint Handling', 'FAIL', 'Should have thrown error');
    } catch (error) {
      logTest('Invalid Endpoint Handling', 'PASS', `Correctly caught error: ${error.message}`);
    }

    // Test 2: Network timeout simulation
    try {
      // Create a request that should timeout
      const originalTimeout = altusApi.defaults?.timeout;
      if (altusApi.defaults) {
        altusApi.defaults.timeout = 1; // 1ms timeout
      }
      
      await altusApi.checkHealth();
      logTest('Timeout Handling', 'FAIL', 'Should have timed out');
      
      // Restore timeout
      if (altusApi.defaults && originalTimeout) {
        altusApi.defaults.timeout = originalTimeout;
      }
    } catch (error) {
      logTest('Timeout Handling', 'PASS', `Correctly handled timeout: ${error.message}`);
    }

    // Test 3: Invalid authentication
    try {
      if (altusApi.updateBearerToken) {
        altusApi.updateBearerToken('invalid_token');
        await altusApi.getCustomerDetails('123456/78/90');
        logTest('Invalid Token Handling', 'FAIL', 'Should have thrown auth error');
      } else {
        logTest('Invalid Token Handling', 'SKIP', 'Token update method not available');
      }
    } catch (error) {
      logTest('Invalid Token Handling', 'PASS', `Correctly caught auth error: ${error.message}`);
    }

  } catch (error) {
    logTest('Error Handling Test Suite', 'FAIL', `Suite error: ${error.message}`);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive API Testing for Altus Loan Management System');
  console.log('=' .repeat(80));
  
  const startTime = Date.now();
  
  // Initialize test results
  testResults = {
    passed: 0,
    failed: 0,
    errors: [],
    details: []
  };

  // Run all test suites
  await testAuthentication();
  await testCustomerOperations();
  await testDocumentUpload();
  await testLoanOperations();
  await testMockAPI();
  await testErrorHandling();

  // Generate test report
  const duration = Date.now() - startTime;
  const totalTests = testResults.passed + testResults.failed;
  const successRate = totalTests > 0 ? ((testResults.passed / totalTests) * 100).toFixed(2) : 0;

  console.log('\n' + '=' .repeat(80));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(80));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${successRate}%`);
  console.log(`⏱️ Duration: ${duration}ms`);
  
  if (testResults.failed > 0) {
    console.log('\n🚨 FAILED TESTS:');
    testResults.errors.forEach(error => {
      console.log(`  - ${error.testName}: ${error.details}`);
    });
  }

  console.log('\n' + '=' .repeat(80));
  return testResults;
}

// Export for use in other modules
export { runAllTests, testResults, TEST_CONFIG };

// Auto-run if this file is executed directly
if (typeof window !== 'undefined' && window.location) {
  // Browser environment
  window.runAltusAPITests = runAllTests;
  console.log('API tests loaded. Run window.runAltusAPITests() to execute.');
} else if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = { runAllTests, testResults, TEST_CONFIG };
}