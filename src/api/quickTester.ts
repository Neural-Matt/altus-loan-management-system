/**
 * Quick API Test Runner - Simple helper to run Altus API tests
 * Use this in browser console or development for quick API validation
 */

import { runAltusApiTests } from './apiTester';
import { updateBearerToken, getTokenStatus } from './altusApi';
import { testUATWorkflow } from '../test/uatWorkflowTest';

/**
 * Quick test runner for browser console
 * 
 * Usage in browser console:
 * ```javascript
 * // Test with current token
 * await quickApiTest();
 * 
 * // Test with new token
 * await quickApiTest('your-uat-token-here');
 * 
 * // Test UAT workflow specifically
 * await quickUATTest();
 * 
 * // Just check connectivity
 * await quickConnectivityTest();
 * ```
 */

export async function quickApiTest(newToken?: string): Promise<any> {
  console.log('🚀 Starting Quick Altus API Test...');
  console.log('='.repeat(50));
  
  // Update token if provided
  if (newToken) {
    console.log('🔑 Updating Bearer token...');
    updateBearerToken(newToken);
  }
  
  // Check current token status
  const tokenStatus = getTokenStatus();
  console.log('🔐 Token Status:', {
    hasToken: tokenStatus.hasToken,
    isValid: tokenStatus.isValid,
    preview: tokenStatus.tokenPreview
  });
  
  if (!tokenStatus.hasToken) {
    console.error('❌ No Bearer token available!');
    console.log('💡 Use: quickApiTest("your-token-here")');
    return;
  }
  
  if (!tokenStatus.isValid) {
    console.warn('⚠️ Token appears invalid - test may fail');
  }
  
  try {
    // Run comprehensive tests
    const report = await runAltusApiTests();
    
    // Print simplified results
    console.log('\n📊 TEST RESULTS SUMMARY:');
    console.log('='.repeat(50));
    console.log(`🏥 Overall Status: ${report.overallStatus}`);
    console.log(`📡 Connectivity:`);
    console.log(`  Primary (5010): ${report.connectivity.primaryEndpoint ? '✅' : '❌'}`);
    console.log(`  Customer (5011): ${report.connectivity.customerEndpoint ? '✅' : '❌'}`);
    console.log(`  Product (5012): ${report.connectivity.productEndpoint ? '✅' : '❌'}`);
    
    // Show test suite results
    Object.entries(report.testSuites).forEach(([key, suite]) => {
      const icon = suite.passedTests === suite.totalTests ? '✅' : 
                   suite.passedTests > suite.failedTests ? '⚠️' : '❌';
      console.log(`${icon} ${suite.suiteName}: ${suite.passedTests}/${suite.totalTests} passed`);
    });
    
    // Show recommendations
    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      report.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
    }
    
    console.log('\n📋 Full report available in return value');
    return report;
    
  } catch (error) {
    console.error('❌ API Test Failed:', error);
    throw error;
  }
}

export async function quickConnectivityTest(): Promise<void> {
  console.log('🔗 Testing Altus Server Connectivity...');
  
  const endpoints = [
    { name: 'Primary', url: 'http://3.6.174.212:5010', port: 5010 },
    { name: 'Customer', url: 'http://3.6.174.212:5011', port: 5011 },
    { name: 'Product', url: 'http://3.6.174.212:5012', port: 5012 }
  ];
  
  const results = await Promise.all(
    endpoints.map(async (endpoint) => {
      const startTime = Date.now();
      try {
        const response = await fetch(`${endpoint.url}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        const responseTime = Date.now() - startTime;
        return {
          ...endpoint,
          status: response.ok ? 'connected' : 'error',
          responseTime,
          error: response.ok ? null : `HTTP ${response.status}`
        };
      } catch (error: any) {
        const responseTime = Date.now() - startTime;
        return {
          ...endpoint,
          status: 'disconnected',
          responseTime,
          error: error.message
        };
      }
    })
  );
  
  console.log('\n📊 CONNECTIVITY RESULTS:');
  results.forEach(result => {
    const icon = result.status === 'connected' ? '✅' : '❌';
    console.log(`${icon} ${result.name} (${result.port}): ${result.status} - ${result.responseTime}ms`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  const connectedCount = results.filter(r => r.status === 'connected').length;
  console.log(`\n🎯 Summary: ${connectedCount}/${results.length} endpoints reachable`);
}

/**
 * Test UAT-specific workflow
 */
export async function quickUATTest(): Promise<any> {
  console.log('🧪 Starting UAT Workflow Test...');
  console.log('='.repeat(50));
  
  // Check token first
  const tokenStatus = getTokenStatus();
  if (!tokenStatus.hasToken) {
    console.error('❌ No Bearer token available!');
    console.log('💡 Use: setupUatToken() first');
    return;
  }
  
  try {
    const results = await testUATWorkflow();
    console.log('✅ UAT Workflow test completed successfully!');
    return results;
  } catch (error) {
    console.error('❌ UAT Workflow test failed:', error);
    throw error;
  }
}

/**
 * Set up your UAT token for testing
 */
export function setupUatToken(token: string): void {
  console.log('🔑 Setting up UAT Bearer token...');
  updateBearerToken(token);
  
  const status = getTokenStatus();
  if (status.isValid) {
    console.log('✅ Token set successfully:', status.tokenPreview);
    console.log('💡 Now run: await quickApiTest()');
  } else {
    console.warn('⚠️ Token may be invalid:', status.tokenPreview);
  }
}

/**
 * Get current API status summary
 */
export function getApiStatus(): any {
  const tokenStatus = getTokenStatus();
  return {
    timestamp: new Date().toISOString(),
    authentication: tokenStatus,
    lastTest: (window as any).__lastAltusApiTestResult || null,
    quickCommands: {
      testAll: 'await quickApiTest()',
      testWithToken: 'await quickApiTest("your-token")',
      connectivity: 'await quickConnectivityTest()',
      setupToken: 'setupUatToken("your-token")'
    }
  };
}

// Make functions available globally for browser console
if (typeof window !== 'undefined') {
  (window as any).quickApiTest = quickApiTest;
  (window as any).quickConnectivityTest = quickConnectivityTest;
  (window as any).quickUATTest = quickUATTest;
  (window as any).setupUatToken = setupUatToken;
  (window as any).getApiStatus = getApiStatus;
  
  // Store last test result
  const originalRunTests = runAltusApiTests;
  (window as any).runAltusApiTests = async () => {
    const result = await originalRunTests();
    (window as any).__lastAltusApiTestResult = result;
    return result;
  };
}

// Export for module usage
const apiTestHelpers = {
  quickApiTest,
  quickConnectivityTest,
  quickUATTest,
  setupUatToken,
  getApiStatus
};

export default apiTestHelpers;