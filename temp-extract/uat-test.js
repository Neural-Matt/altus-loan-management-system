/**
 * Browser Console Test for UAT Workflow
 * Open browser console and run: testUATAPI()
 */

// Import the test function
import { testUATWorkflow } from './uatWorkflowTest';

// Make it available globally for browser console testing
declare global {
  interface Window {
    testUATAPI: () => Promise<void>;
    testUATWorkflow: typeof testUATWorkflow;
  }
}

// Test function for browser console
window.testUATAPI = async function() {
  console.log('🧪 Starting UAT API Test from Browser Console...');
  try {
    const results = await testUATWorkflow();
    console.log('✅ UAT Test completed. Check results above.');
    return results;
  } catch (error) {
    console.error('❌ UAT Test failed:', error);
  }
};

// Also expose the test function directly
window.testUATWorkflow = testUATWorkflow;

// Log instructions
console.log('🔧 UAT API Test loaded! Run testUATAPI() in the console to start testing.');

export { testUATWorkflow };