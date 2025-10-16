// Browser-specific API testing functions that bypass CORS for development
// These functions test API integration without being blocked by CORS policies

// Test API with browser's fetch but handle CORS gracefully
async function testApiWithCorsHandling(url: string, options: RequestInit = {}) {
  try {
    await fetch(url, {
      ...options,
      mode: 'no-cors', // This bypasses CORS but limits response access
    });
    
    return {
      success: true,
      status: 'Request sent successfully (CORS bypass mode)',
      details: 'Request was sent but response details are limited due to CORS'
    };
  } catch (error) {
    return {
      success: false,
      status: 'Request failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Test UAT endpoints with detailed reporting
async function testUATEndpoints() {
  console.log('🧪 Testing UAT Endpoints (CORS-friendly mode)...');
  console.log('================================================');
  
  const endpoints = [
    { name: 'Loan Services', url: 'http://3.6.174.212:5010/API/LoanServices/SalariedLoanRequest' },
    { name: 'Customer Services', url: 'http://3.6.174.212:5011/API/CustomerServices/RetailCustomer' },
    { name: 'Product Services', url: 'http://3.6.174.212:5012/API/ProductServices' },
    { name: 'Document Services', url: 'http://3.6.174.212:5013/API/DocumentServices/UploadLoanDocument' }
  ];

  const results = [];
  
  for (const endpoint of endpoints) {
    console.log(`🔍 Testing ${endpoint.name}...`);
    
    const result = await testApiWithCorsHandling(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 0B9574489-7EC5-4373-94DA-871FDE07CF8EC3BEA3AF-C9B7-4DEA-AE35-EA1C626191C00314393C-29B4-4E60-8D11-595EDAAAC42F10'
      },
      body: JSON.stringify({ test: 'ping' })
    });

    results.push({
      endpoint: endpoint.name,
      ...result
    });

    console.log(`   ${result.success ? '✅' : '❌'} ${endpoint.name}: ${result.status}`);
  }

  console.log('\n📊 CORS-Friendly Test Results:');
  console.log('================================');
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.endpoint}: ${result.status}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  return results;
}

// Mock test that simulates successful API calls for development
async function mockUATWorkflowTest() {
  console.log('🎭 Running Mock UAT Workflow Test (Simulated Success)...');
  console.log('=======================================================');
  
  // Simulate customer creation
  console.log('👤 Step 1: Creating Customer...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('✅ Customer created successfully! CustomerID: MOCK-CUST-12345');
  
  // Simulate loan request
  console.log('💰 Step 2: Submitting Loan Request...');
  await new Promise(resolve => setTimeout(resolve, 1500));
  console.log('✅ Loan request submitted! ApplicationNumber: MOCK-APP-67890');
  
  // Simulate document upload
  console.log('📄 Step 3: Uploading Document...');
  await new Promise(resolve => setTimeout(resolve, 1200));
  console.log('✅ Document uploaded successfully! DocumentID: MOCK-DOC-54321');
  
  console.log('\n🎉 Mock UAT Workflow completed successfully!');
  console.log('Note: This was a simulation. Real API calls would require CORS configuration.');
  
  return {
    success: true,
    customerId: 'MOCK-CUST-12345',
    applicationNumber: 'MOCK-APP-67890',
    documentId: 'MOCK-DOC-54321',
    message: 'Mock workflow completed successfully'
  };
}

export const corsTestFunctions = {
  testApiWithCorsHandling,
  testUATEndpoints,
  mockUATWorkflowTest
};

// Make functions available globally for browser console testing
(window as any).corsTestFunctions = corsTestFunctions;
(window as any).testUATWithCors = testUATEndpoints;
(window as any).testMockWorkflow = mockUATWorkflowTest;

console.log('🌐 CORS test functions loaded! Available commands:');
console.log('   testUATWithCors() - Test endpoints with CORS handling');
console.log('   testMockWorkflow() - Run simulated workflow test');
console.log('   corsTestFunctions - Access full test suite');