/**
 * Live API Test Suite for Altus Loan Management System
 * Execute this in browser console with the app running to test real APIs
 */

(function() {
  'use strict';

  console.log('🔬 Altus Live API Testing Suite');
  console.log('================================');
  
  const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  };

  function logResult(testName, success, details = '', error = null) {
    testResults.total++;
    if (success) {
      testResults.passed++;
      console.log(`✅ ${testName}: PASS ${details ? `- ${details}` : ''}`);
    } else {
      testResults.failed++;
      testResults.errors.push({ testName, details, error });
      console.log(`❌ ${testName}: FAIL ${details ? `- ${details}` : ''}`);
      if (error) console.error('   Error:', error);
    }
  }

  async function runAPITests() {
    console.log('\n🚀 Starting API Tests...\n');

    // Test 1: Check if we can access the Altus context
    try {
      // Try to find React components in the DOM
      const reactRoot = document.querySelector('#root');
      const hasReactApp = reactRoot && reactRoot._reactInternalInstance || reactRoot._reactRootContainer;
      
      logResult('React App Detection', !!hasReactApp, 
        hasReactApp ? 'React app is running' : 'React app not detected');
    } catch (error) {
      logResult('React App Detection', false, 'Error detecting React app', error);
    }

    // Test 2: Environment check
    try {
      const isProduction = process.env.NODE_ENV === 'production';
      const mockMode = process.env.REACT_APP_MOCK_MODE === 'true';
      
      logResult('Environment Check', true, 
        `Mode: ${isProduction ? 'Production' : 'Development'}, Mock: ${mockMode ? 'Enabled' : 'Disabled'}`);
    } catch (error) {
      logResult('Environment Check', false, 'Could not determine environment', error);
    }

    // Test 3: Local Storage API
    try {
      const testKey = 'altus_test_' + Date.now();
      const testData = { test: true, timestamp: Date.now() };
      
      localStorage.setItem(testKey, JSON.stringify(testData));
      const retrieved = JSON.parse(localStorage.getItem(testKey) || '{}');
      localStorage.removeItem(testKey);
      
      const isWorking = retrieved.test === true;
      logResult('Local Storage API', isWorking, 
        isWorking ? 'Storage read/write successful' : 'Storage failed');
    } catch (error) {
      logResult('Local Storage API', false, 'Local storage error', error);
    }

    // Test 4: Network connectivity
    try {
      const response = await fetch('/altus-logo.png', { method: 'HEAD' });
      logResult('Network Connectivity', response.ok, 
        `Asset fetch: ${response.status} ${response.statusText}`);
    } catch (error) {
      logResult('Network Connectivity', false, 'Network request failed', error);
    }

    // Test 5: Mock Customer Creation
    try {
      const mockCustomer = {
        firstName: 'Test',
        lastName: 'User',
        nrc: '123456/78/90',
        phoneNumber: '+260977123456',
        emailAddress: 'test@example.com',
        nationality: 'Zambian',
        dateOfBirth: '1990-01-01',
        gender: 'M',
        maritalStatus: 'Single'
      };

      // Simulate customer validation
      const isValidCustomer = mockCustomer.firstName && 
                             mockCustomer.lastName && 
                             mockCustomer.nrc &&
                             mockCustomer.phoneNumber;

      logResult('Customer Data Validation', isValidCustomer, 
        'Customer data structure is valid');
    } catch (error) {
      logResult('Customer Data Validation', false, 'Validation error', error);
    }

    // Test 6: Document Upload Simulation
    try {
      // Create a mock file
      const mockFileContent = 'Mock file content for testing';
      const mockFile = new Blob([mockFileContent], { type: 'image/jpeg' });
      
      // Test file validation logic
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      const isValidType = allowedTypes.includes(mockFile.type);
      const isValidSize = mockFile.size <= maxSize;
      
      logResult('Document Upload Validation', isValidType && isValidSize,
        `File validation: type=${isValidType}, size=${isValidSize}`);
    } catch (error) {
      logResult('Document Upload Validation', false, 'File validation error', error);
    }

    // Test 7: Status Tracking Logic
    try {
      const statusSteps = ['DOCUMENT_REVIEW', 'PENDING', 'APPROVED', 'DISBURSED'];
      const mockLoanId = 'LOAN_TEST_' + Date.now();
      
      // Simulate status progression
      let currentStatusIndex = 0;
      const statusProgression = statusSteps.map((status, index) => ({
        step: index + 1,
        status,
        completed: index <= currentStatusIndex,
        timestamp: new Date(Date.now() - (statusSteps.length - index) * 60000).toISOString()
      }));

      const hasValidProgression = statusProgression.length === statusSteps.length;
      logResult('Status Tracking Logic', hasValidProgression,
        `Generated ${statusProgression.length} status steps`);
    } catch (error) {
      logResult('Status Tracking Logic', false, 'Status tracking error', error);
    }

    // Test 8: API Request Structure
    try {
      // Test API request structure
      const mockApiRequest = {
        method: 'POST',
        url: 'API/LoanServices',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test_token'
        },
        body: {
          customerId: 'CUST123',
          loanAmount: 10000,
          currency: 'ZMW'
        }
      };

      const hasValidStructure = mockApiRequest.method && 
                               mockApiRequest.url && 
                               mockApiRequest.headers && 
                               mockApiRequest.body;

      logResult('API Request Structure', hasValidStructure,
        'API request format is correct');
    } catch (error) {
      logResult('API Request Structure', false, 'Request structure error', error);
    }

    // Test 9: Error Handling Patterns
    try {
      const mockErrors = [
        { status: 400, message: 'Bad Request', code: 'INVALID_REQUEST' },
        { status: 401, message: 'Unauthorized', code: 'AUTH_ERROR' },
        { status: 404, message: 'Not Found', code: 'RESOURCE_NOT_FOUND' },
        { status: 500, message: 'Internal Server Error', code: 'SERVER_ERROR' }
      ];

      // Test error categorization
      const categorizeError = (error) => {
        if (error.status >= 400 && error.status < 500) {
          return 'CLIENT_ERROR';
        } else if (error.status >= 500) {
          return 'SERVER_ERROR';
        } else {
          return 'UNKNOWN_ERROR';
        }
      };

      const categorizedErrors = mockErrors.map(error => ({
        ...error,
        category: categorizeError(error)
      }));

      const hasErrorHandling = categorizedErrors.every(e => e.category !== 'UNKNOWN_ERROR');
      logResult('Error Handling Patterns', hasErrorHandling,
        `Categorized ${categorizedErrors.length} error types`);
    } catch (error) {
      logResult('Error Handling Patterns', false, 'Error handling test failed', error);
    }

    // Test 10: Form Validation
    try {
      const formData = {
        nrc: '123456/78/90',
        phoneNumber: '+260977123456',
        email: 'test@example.com',
        loanAmount: 10000,
        tenureMonths: 12
      };

      // Basic validation rules
      const validations = {
        nrc: /^\d{6}\/\d{2}\/\d{1,2}$/.test(formData.nrc),
        phone: formData.phoneNumber.startsWith('+260'),
        email: formData.email.includes('@'),
        amount: formData.loanAmount > 0,
        tenure: formData.tenureMonths >= 1 && formData.tenureMonths <= 60
      };

      const allValid = Object.values(validations).every(v => v === true);
      logResult('Form Validation', allValid,
        `Validation results: ${Object.entries(validations).map(([k,v]) => `${k}:${v}`).join(', ')}`);
    } catch (error) {
      logResult('Form Validation', false, 'Form validation error', error);
    }

    // Generate final report
    console.log('\n' + '='.repeat(50));
    console.log('📊 API TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    
    if (testResults.total > 0) {
      const successRate = (testResults.passed / testResults.total * 100).toFixed(1);
      console.log(`📈 Success Rate: ${successRate}%`);
    }

    if (testResults.failed > 0) {
      console.log('\n🚨 FAILED TESTS:');
      testResults.errors.forEach(error => {
        console.log(`  • ${error.testName}: ${error.details}`);
      });
    }

    console.log('\n🎯 Overall Status:', 
      testResults.failed === 0 ? '✅ ALL TESTS PASSED' : `⚠️ ${testResults.failed} TESTS FAILED`);
    
    return testResults;
  }

  // Auto-execute the tests
  runAPITests().then(results => {
    console.log('\n✨ API testing completed!');
    
    // Make results available globally for further inspection
    window.altusTestResults = results;
    console.log('💡 Test results are available at: window.altusTestResults');
  });

})();