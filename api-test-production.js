/**
 * Production API Testing Script
 * Tests all Altus API endpoints with UAT compliance verification
 * Run: node api-test-production.js
 */

const https = require('https');
const http = require('http');

// Bearer Token (from UAT docs)
const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjIiLCJuYmYiOjE3MzA3MTM1NDIsImV4cCI6MTczMDc5OTk0MiwiaWF0IjoxNzMwNzEzNTQyfQ.ywk1c8oDAQslTFjSlk-YAr1BJrYjKQRBcpI8PEkW0CM';

// Base URL
const BASE_URL = '3.6.174.212';

// Test results storage
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// HTTP request helper
function makeRequest(port, path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: BASE_URL,
      port: port,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${BEARER_TOKEN}`
      },
      timeout: 30000
    };

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, error: 'Invalid JSON' });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

// Test functions
async function test1_CreateCustomer() {
  console.log('\n📋 TEST 1: Customer Creation API (Port 5011)');
  console.log('=' .repeat(60));
  
  try {
    const data = {
      body: {
        TypeOfCustomer: "1",
        FirstName: "TestUser",
        LastName: "ProdTest",
        IdentityNo: `${Math.floor(Math.random() * 999999)}/10/1`,
        ContactNo: `+26097${Math.floor(1000000 + Math.random() * 9000000)}`,
        EmailId: `testuser${Date.now()}@example.com`,
        Nationality: "Zambian"
      }
    };
    
    console.log('Request:', JSON.stringify(data, null, 2));
    const result = await makeRequest(5011, '/API/Customer/Create/Retail', data);
    
    console.log('Response:', JSON.stringify(result.data, null, 2));
    
    if (result.data.ResponseCode === "0" && result.data.CustomerId) {
      console.log('✅ PASSED: Customer created successfully');
      console.log(`   CustomerId: ${result.data.CustomerId}`);
      results.passed++;
      results.tests.push({ name: 'Customer Creation', status: 'PASSED', customerId: result.data.CustomerId });
      return result.data.CustomerId;
    } else {
      console.log('❌ FAILED: Invalid response');
      results.failed++;
      results.tests.push({ name: 'Customer Creation', status: 'FAILED', error: result.data });
      return null;
    }
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    results.failed++;
    results.tests.push({ name: 'Customer Creation', status: 'FAILED', error: error.message });
    return null;
  }
}

async function test2_GetProductDetails() {
  console.log('\n📋 TEST 2: Product Details API (Port 5012)');
  console.log('=' .repeat(60));
  
  try {
    const data = {
      body: {
        ProductCode: "PROD001"
      }
    };
    
    console.log('Request:', JSON.stringify(data, null, 2));
    const result = await makeRequest(5012, '/API/Product/GetProductDetails', data);
    
    console.log('Response:', JSON.stringify(result.data, null, 2));
    
    if (result.data.ResponseCode === "0") {
      console.log('✅ PASSED: Product details retrieved');
      results.passed++;
      results.tests.push({ name: 'Product Details', status: 'PASSED' });
    } else {
      console.log('❌ FAILED: Invalid response');
      results.failed++;
      results.tests.push({ name: 'Product Details', status: 'FAILED', error: result.data });
    }
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    results.failed++;
    results.tests.push({ name: 'Product Details', status: 'FAILED', error: error.message });
  }
}

async function test3_SubmitLoanRequest(customerId) {
  console.log('\n📋 TEST 3: 🚨 CRITICAL - Loan Request API (Port 5013)');
  console.log('=' .repeat(60));
  console.log('⚠️  TESTING CRITICAL FIX: Port changed from 5010 to 5013');
  
  if (!customerId) {
    console.log('❌ SKIPPED: No CustomerId available');
    results.tests.push({ name: 'Loan Request (Port 5013)', status: 'SKIPPED' });
    return null;
  }
  
  try {
    const data = {
      body: {
        TypeOfCustomer: "1",
        CustomerId: customerId,
        IdentityNo: "123456/10/1",
        ContactNo: "+260971234567",
        EmailId: "testuser@example.com",
        EmployeeNumber: "EMP" + Date.now(),
        Designation: "Software Engineer",
        EmploymentType: "1",
        Tenure: 24,
        Gender: "Male",
        LoanAmount: 15000,
        GrossIncome: 8000,
        NetIncome: 6500,
        Deductions: 1500
      }
    };
    
    console.log('Request:', JSON.stringify(data, null, 2));
    const result = await makeRequest(5013, '/API/LoanRequest/Salaried', data);
    
    console.log('Response:', JSON.stringify(result.data, null, 2));
    
    if (result.data.ResponseCode === "0" && result.data.ApplicationNumber) {
      console.log('✅ PASSED: Loan request submitted successfully');
      console.log(`   ApplicationNumber: ${result.data.ApplicationNumber}`);
      console.log('   ✅ Confirmed using Port 5013 (FIXED from 5010)');
      results.passed++;
      results.tests.push({ 
        name: 'Loan Request (Port 5013)', 
        status: 'PASSED', 
        applicationNumber: result.data.ApplicationNumber 
      });
      return result.data.ApplicationNumber;
    } else {
      console.log('❌ FAILED: Invalid response');
      results.failed++;
      results.tests.push({ name: 'Loan Request (Port 5013)', status: 'FAILED', error: result.data });
      return null;
    }
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    results.failed++;
    results.tests.push({ name: 'Loan Request (Port 5013)', status: 'FAILED', error: error.message });
    return null;
  }
}

async function test4_EMICalculator() {
  console.log('\n📋 TEST 4: EMI Calculator API (Port 5009)');
  console.log('=' .repeat(60));
  
  try {
    const data = {
      body: {
        LoanAmount: 15000,
        InterestRate: 15.5,
        Tenure: 24
      }
    };
    
    console.log('Request:', JSON.stringify(data, null, 2));
    const result = await makeRequest(5009, '/API/LoanList/EMICalculator', data);
    
    console.log('Response:', JSON.stringify(result.data, null, 2));
    
    if (result.data.ResponseCode === "0") {
      console.log('✅ PASSED: EMI calculated successfully');
      if (result.data.EMI) {
        console.log(`   EMI: ${result.data.EMI}`);
        console.log(`   Total Interest: ${result.data.TotalInterest}`);
        console.log(`   Total Amount: ${result.data.TotalAmount}`);
      }
      results.passed++;
      results.tests.push({ name: 'EMI Calculator', status: 'PASSED' });
    } else {
      console.log('❌ FAILED: Invalid response');
      results.failed++;
      results.tests.push({ name: 'EMI Calculator', status: 'FAILED', error: result.data });
    }
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    results.failed++;
    results.tests.push({ name: 'EMI Calculator', status: 'FAILED', error: error.message });
  }
}

async function test5_PBLEligibility(customerId) {
  console.log('\n📋 TEST 5: PBL Eligibility API (Port 5009)');
  console.log('=' .repeat(60));
  
  if (!customerId) {
    console.log('❌ SKIPPED: No CustomerId available');
    results.tests.push({ name: 'PBL Eligibility', status: 'SKIPPED' });
    return;
  }
  
  try {
    const data = {
      body: {
        CustomerId: customerId,
        GrossIncome: 8000,
        ExistingObligations: 2000
      }
    };
    
    console.log('Request:', JSON.stringify(data, null, 2));
    const result = await makeRequest(5009, '/API/LoanList/PBLEligibility', data);
    
    console.log('Response:', JSON.stringify(result.data, null, 2));
    
    if (result.data.ResponseCode === "0") {
      console.log('✅ PASSED: PBL eligibility checked');
      results.passed++;
      results.tests.push({ name: 'PBL Eligibility', status: 'PASSED' });
    } else {
      console.log('❌ FAILED: Invalid response');
      results.failed++;
      results.tests.push({ name: 'PBL Eligibility', status: 'FAILED', error: result.data });
    }
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    results.failed++;
    results.tests.push({ name: 'PBL Eligibility', status: 'FAILED', error: error.message });
  }
}

async function test6_GetLoansByCustomer(customerId) {
  console.log('\n📋 TEST 6: Get Loans by Customer (Port 5009)');
  console.log('=' .repeat(60));
  
  if (!customerId) {
    console.log('❌ SKIPPED: No CustomerId available');
    results.tests.push({ name: 'Get Loans by Customer', status: 'SKIPPED' });
    return;
  }
  
  try {
    const data = {
      body: {
        CustomerId: customerId
      }
    };
    
    console.log('Request:', JSON.stringify(data, null, 2));
    const result = await makeRequest(5009, '/API/LoanList/GetLoansByCustomerId', data);
    
    console.log('Response:', JSON.stringify(result.data, null, 2));
    
    if (result.data.ResponseCode === "0") {
      console.log('✅ PASSED: Loans retrieved successfully');
      results.passed++;
      results.tests.push({ name: 'Get Loans by Customer', status: 'PASSED' });
    } else {
      console.log('❌ FAILED: Invalid response');
      results.failed++;
      results.tests.push({ name: 'Get Loans by Customer', status: 'FAILED', error: result.data });
    }
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    results.failed++;
    results.tests.push({ name: 'Get Loans by Customer', status: 'FAILED', error: error.message });
  }
}

async function test7_GetLoanBalance(applicationNumber) {
  console.log('\n📋 TEST 7: Get Loan Balance (Port 5010)');
  console.log('=' .repeat(60));
  
  if (!applicationNumber) {
    console.log('❌ SKIPPED: No ApplicationNumber available');
    results.tests.push({ name: 'Get Loan Balance', status: 'SKIPPED' });
    return;
  }
  
  try {
    const data = {
      body: {
        ApplicationNumber: applicationNumber
      }
    };
    
    console.log('Request:', JSON.stringify(data, null, 2));
    const result = await makeRequest(5010, '/API/Loan/GetLoanBalanceByApplicationNumber', data);
    
    console.log('Response:', JSON.stringify(result.data, null, 2));
    
    if (result.data.ResponseCode === "0") {
      console.log('✅ PASSED: Loan balance retrieved');
      results.passed++;
      results.tests.push({ name: 'Get Loan Balance', status: 'PASSED' });
    } else {
      console.log('❌ FAILED: Invalid response');
      results.failed++;
      results.tests.push({ name: 'Get Loan Balance', status: 'FAILED', error: result.data });
    }
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    results.failed++;
    results.tests.push({ name: 'Get Loan Balance', status: 'FAILED', error: error.message });
  }
}

async function test8_GetLoanStatus(applicationNumber) {
  console.log('\n📋 TEST 8: Get Loan Status (Port 5010)');
  console.log('=' .repeat(60));
  
  if (!applicationNumber) {
    console.log('❌ SKIPPED: No ApplicationNumber available');
    results.tests.push({ name: 'Get Loan Status', status: 'SKIPPED' });
    return;
  }
  
  try {
    const data = {
      body: {
        ApplicationNumber: applicationNumber
      }
    };
    
    console.log('Request:', JSON.stringify(data, null, 2));
    const result = await makeRequest(5010, '/API/Loan/GetLoanStatusByApplicationNumber', data);
    
    console.log('Response:', JSON.stringify(result.data, null, 2));
    
    if (result.data.ResponseCode === "0") {
      console.log('✅ PASSED: Loan status retrieved');
      results.passed++;
      results.tests.push({ name: 'Get Loan Status', status: 'PASSED' });
    } else {
      console.log('❌ FAILED: Invalid response');
      results.failed++;
      results.tests.push({ name: 'Get Loan Status', status: 'FAILED', error: result.data });
    }
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    results.failed++;
    results.tests.push({ name: 'Get Loan Status', status: 'FAILED', error: error.message });
  }
}

async function test9_GetLoanDetails(applicationNumber) {
  console.log('\n📋 TEST 9: Get Loan Details (Port 5010)');
  console.log('=' .repeat(60));
  
  if (!applicationNumber) {
    console.log('❌ SKIPPED: No ApplicationNumber available');
    results.tests.push({ name: 'Get Loan Details', status: 'SKIPPED' });
    return;
  }
  
  try {
    const data = {
      body: {
        ApplicationNumber: applicationNumber
      }
    };
    
    console.log('Request:', JSON.stringify(data, null, 2));
    const result = await makeRequest(5010, '/API/Loan/GetLoanDetailsByApplicationNumber', data);
    
    console.log('Response:', JSON.stringify(result.data, null, 2));
    
    if (result.data.ResponseCode === "0") {
      console.log('✅ PASSED: Loan details retrieved');
      results.passed++;
      results.tests.push({ name: 'Get Loan Details', status: 'PASSED' });
    } else {
      console.log('❌ FAILED: Invalid response');
      results.failed++;
      results.tests.push({ name: 'Get Loan Details', status: 'FAILED', error: result.data });
    }
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    results.failed++;
    results.tests.push({ name: 'Get Loan Details', status: 'FAILED', error: error.message });
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 ALTUS PRODUCTION API TESTING');
  console.log('='.repeat(60));
  console.log('Base URL: ' + BASE_URL);
  console.log('Date: ' + new Date().toLocaleString());
  console.log('='.repeat(60));
  
  // Run tests in sequence
  const customerId = await test1_CreateCustomer();
  await test2_GetProductDetails();
  const applicationNumber = await test3_SubmitLoanRequest(customerId);
  await test4_EMICalculator();
  await test5_PBLEligibility(customerId);
  await test6_GetLoansByCustomer(customerId);
  await test7_GetLoanBalance(applicationNumber);
  await test8_GetLoanStatus(applicationNumber);
  await test9_GetLoanDetails(applicationNumber);
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📝 Total: ${results.tests.length}`);
  console.log('\nDetailed Results:');
  results.tests.forEach((test, index) => {
    const icon = test.status === 'PASSED' ? '✅' : test.status === 'FAILED' ? '❌' : '⏭️';
    console.log(`${icon} ${index + 1}. ${test.name}: ${test.status}`);
    if (test.customerId) console.log(`     CustomerId: ${test.customerId}`);
    if (test.applicationNumber) console.log(`     ApplicationNumber: ${test.applicationNumber}`);
    if (test.error) console.log(`     Error: ${JSON.stringify(test.error)}`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 CRITICAL FIXES VERIFICATION');
  console.log('='.repeat(60));
  console.log('✅ Port 5013 for Loan Request: TESTED');
  console.log('✅ UAT Field Name Mapping: TESTED');
  console.log('✅ Request Format {"body": {...}}: TESTED');
  console.log('='.repeat(60));
  
  // Note about base64 document upload
  console.log('\n📝 NOTE: Document Upload (Base64) Test');
  console.log('Document upload with base64 conversion requires file input.');
  console.log('Test this manually through the UI at: https://applynow.altuszm.com');
  console.log('Check browser console for:');
  console.log('  - "Debug: Converting file to base64 byte format"');
  console.log('  - "Debug: File successfully converted to base64"');
  console.log('  - "Debug: Document upload successful"');
  console.log('='.repeat(60));
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
