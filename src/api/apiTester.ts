/**
 * Comprehensive API Tester for Altus Loan Management System
 * Validates API endpoints against UAT specifications
 */

import altusApi, { 
  updateBearerToken, 
  clearBearerToken, 
  getTokenStatus,
  createRetailCustomer,
  getLoanBalance,
  getLoanStatus,
  getLoanDetails,
  getLoanProductDetails,
  submitLoanRequest,
  uploadLoanDocument
} from './altusApi';

export interface ApiTestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL' | 'SKIP' | 'PARTIAL';
  message: string;
  responseTime?: number;
  details?: any;
  expectedFormat?: boolean;
  actualResponse?: any;
}

export interface ApiTestSuite {
  suiteName: string;
  baseUrl: string;
  port: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  results: ApiTestResult[];
  summary: string;
}

export interface ComprehensiveApiReport {
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'UNKNOWN';
  timestamp: string;
  environment: 'development' | 'uat' | 'production';
  authenticationStatus: {
    hasToken: boolean;
    isValid: boolean;
    tokenPreview?: string;
  };
  testSuites: {
    customerServices: ApiTestSuite;
    loanServices: ApiTestSuite;
    loanProductServices: ApiTestSuite;
    documentServices: ApiTestSuite;
  };
  connectivity: {
    primaryEndpoint: boolean;
    customerEndpoint: boolean;
    productEndpoint: boolean;
  };
  recommendations: string[];
}

/**
 * Comprehensive API Testing Class
 */
export class AltusApiTester {
  private readonly TEST_TIMEOUT = 10000; // 10 seconds per test
  private testCustomerId: string | null = null;
  private testLoanId: string | null = null;

  /**
   * Run comprehensive API tests against all Altus endpoints
   */
  async runComprehensiveTests(): Promise<ComprehensiveApiReport> {
    console.log('🔍 Starting Comprehensive Altus API Tests...');
    console.log('📍 UAT Environment: http://3.6.174.212:5010/');
    
    const startTime = Date.now();
    const authStatus = getTokenStatus();
    
    // Test all service suites
    const customerTests = await this.testCustomerServices();
    const loanTests = await this.testLoanServices();
    const productTests = await this.testLoanProductServices();
    const documentTests = await this.testDocumentServices();
    
    // Test connectivity
    const connectivity = await this.testConnectivity();
    
    // Determine overall status
    const totalTests = customerTests.totalTests + loanTests.totalTests + 
                      productTests.totalTests + documentTests.totalTests;
    const totalPassed = customerTests.passedTests + loanTests.passedTests + 
                       productTests.passedTests + documentTests.passedTests;
    const totalFailed = customerTests.failedTests + loanTests.failedTests + 
                       productTests.failedTests + documentTests.failedTests;
    
    let overallStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'UNKNOWN' = 'UNKNOWN';
    if (totalPassed === totalTests) {
      overallStatus = 'HEALTHY';
    } else if (totalPassed > totalFailed) {
      overallStatus = 'DEGRADED';
    } else {
      overallStatus = 'CRITICAL';
    }
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      authStatus, connectivity, customerTests, loanTests, productTests, documentTests
    );
    
    const report: ComprehensiveApiReport = {
      overallStatus,
      timestamp: new Date().toISOString(),
      environment: this.detectEnvironment(),
      authenticationStatus: authStatus,
      testSuites: {
        customerServices: customerTests,
        loanServices: loanTests,
        loanProductServices: productTests,
        documentServices: documentTests
      },
      connectivity,
      recommendations
    };
    
    console.log(`⏱️ Tests completed in ${Date.now() - startTime}ms`);
    this.printReport(report);
    
    return report;
  }

  /**
   * Test Customer Services API (Port 5011)
   */
  private async testCustomerServices(): Promise<ApiTestSuite> {
    console.log('\n🧑‍💼 Testing Customer Services API...');
    
    const suite: ApiTestSuite = {
      suiteName: 'Customer Services',
      baseUrl: 'http://3.6.174.212:5011/',
      port: 5011,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      results: [],
      summary: ''
    };

    // Test 1: Create Retail Customer
    suite.results.push(await this.testCreateRetailCustomer());
    
    // Test 2: Get Customer Details (if create succeeded)
    if (this.testCustomerId) {
      suite.results.push(await this.testGetCustomerDetails());
    } else {
      suite.results.push({
        endpoint: '/API/CustomerServices',
        method: 'POST',
        status: 'SKIP',
        message: 'Skipped - No customer ID from create test'
      });
    }
    
    this.calculateSuiteStats(suite);
    return suite;
  }

  /**
   * Test Loan Services API (Port 5010)
   */
  private async testLoanServices(): Promise<ApiTestSuite> {
    console.log('\n💰 Testing Loan Services API...');
    
    const suite: ApiTestSuite = {
      suiteName: 'Loan Services',
      baseUrl: 'http://3.6.174.212:5010/',
      port: 5010,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      results: [],
      summary: ''
    };

    // Test 1: Submit Loan Request
    suite.results.push(await this.testSubmitLoanRequest());
    
    // Test 2: Get Loan Status
    suite.results.push(await this.testGetLoanStatus());
    
    // Test 3: Get Loan Details
    suite.results.push(await this.testGetLoanDetails());
    
    // Test 4: Get Loan Balance
    suite.results.push(await this.testGetLoanBalance());
    
    this.calculateSuiteStats(suite);
    return suite;
  }

  /**
   * Test Loan Product Services API (Port 5012)
   */
  private async testLoanProductServices(): Promise<ApiTestSuite> {
    console.log('\n📋 Testing Loan Product Services API...');
    
    const suite: ApiTestSuite = {
      suiteName: 'Loan Product Services',
      baseUrl: 'http://3.6.174.212:5012/',
      port: 5012,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      results: [],
      summary: ''
    };

    // Test 1: Get Loan Product Details
    suite.results.push(await this.testGetLoanProductDetails());
    
    this.calculateSuiteStats(suite);
    return suite;
  }

  /**
   * Test Document Services API
   */
  private async testDocumentServices(): Promise<ApiTestSuite> {
    console.log('\n📄 Testing Document Services API...');
    
    const suite: ApiTestSuite = {
      suiteName: 'Document Services',
      baseUrl: 'http://3.6.174.212:5010/',
      port: 5010,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      results: [],
      summary: ''
    };

    // Test 1: Upload Document
    suite.results.push(await this.testUploadDocument());
    
    this.calculateSuiteStats(suite);
    return suite;
  }

  /**
   * Individual Test Methods
   */
  private async testCreateRetailCustomer(): Promise<ApiTestResult> {
    const startTime = Date.now();
    
    try {
      const testCustomer = {
        firstName: 'John',
        lastName: 'Doe',
        nrc: '123456/78/9',
        phoneNumber: '+260971234567',
        emailAddress: 'john.doe@test.com',
        dateOfBirth: '1990-01-01',
        gender: 'Male' as const,
        nationality: 'Zambian',
        maritalStatus: 'Single',
        address: {
          street: '123 Test Street',
          city: 'Lusaka',
          province: 'Lusaka',
          country: 'Zambia'
        },
        employment: {
          employerId: 'EMP001',
          employerName: 'Test Company',
          employerCode: 'TC001',
          position: 'Software Developer',
          salary: 15000,
          employmentDate: '2020-01-01',
          employmentType: 'Permanent' as const
        },
        nextOfKin: {
          firstName: 'Jane',
          lastName: 'Doe',
          relationship: 'Sister',
          phoneNumber: '+260971234568'
        }
      };

      const response = await createRetailCustomer(testCustomer);
      const responseTime = Date.now() - startTime;
      
      // Check if response has expected structure
      if (response && response.outParams?.CustomerID) {
        this.testCustomerId = response.outParams.CustomerID;
        return {
          endpoint: '/API/CustomerServices',
          method: 'POST',
          status: 'PASS',
          message: `Customer created successfully with ID: ${response.outParams.CustomerID}`,
          responseTime,
          expectedFormat: true,
          actualResponse: response
        };
      } else {
        return {
          endpoint: '/API/CustomerServices',
          method: 'POST',
          status: 'PARTIAL',
          message: 'Response received but missing expected customerId',
          responseTime,
          expectedFormat: false,
          actualResponse: response
        };
      }
    } catch (error: any) {
      return {
        endpoint: '/API/CustomerServices',
        method: 'POST',
        status: 'FAIL',
        message: `Customer creation failed: ${error.message}`,
        responseTime: Date.now() - startTime,
        details: error
      };
    }
  }

  private async testGetCustomerDetails(): Promise<ApiTestResult> {
    const startTime = Date.now();
    
    if (!this.testCustomerId) {
      return {
        endpoint: '/API/CustomerServices',
        method: 'POST',
        status: 'SKIP',
        message: 'No customer ID available for testing'
      };
    }

    try {
      // Note: This should use the NRC, not customer ID based on the API spec
      const response = await altusApi.getCustomerDetails('123456/78/9');
      const responseTime = Date.now() - startTime;
      
      if (response && response.CustomerID) {
        return {
          endpoint: '/API/CustomerServices',
          method: 'POST',
          status: 'PASS',
          message: 'Customer details retrieved successfully',
          responseTime,
          expectedFormat: true,
          actualResponse: response
        };
      } else {
        return {
          endpoint: '/API/CustomerServices',
          method: 'POST',
          status: 'PARTIAL',
          message: 'Response received but missing expected format',
          responseTime,
          expectedFormat: false,
          actualResponse: response
        };
      }
    } catch (error: any) {
      return {
        endpoint: '/API/CustomerServices',
        method: 'POST',
        status: 'FAIL',
        message: `Get customer details failed: ${error.message}`,
        responseTime: Date.now() - startTime,
        details: error
      };
    }
  }

  private async testSubmitLoanRequest(): Promise<ApiTestResult> {
    const startTime = Date.now();
    
    try {
      const loanRequest = {
        customerId: this.testCustomerId || 'TEST_CUSTOMER_001',
        productCode: 'instant-salary-advance',
        loanAmount: 50000,
        tenureMonths: 12,
        currency: 'ZMW',
        purpose: 'Emergency expenses'
      };

      const response = await submitLoanRequest(loanRequest);
      const responseTime = Date.now() - startTime;
      
      if (response && response.executionStatus === 'Success' && response.outParams?.ApplicationNumber) {
        this.testLoanId = response.outParams.ApplicationNumber;
        return {
          endpoint: '/API/LoanServices',
          method: 'POST',
          status: 'PASS',
          message: `Loan request submitted successfully: ${response.outParams.ApplicationNumber}`,
          responseTime,
          expectedFormat: true,
          actualResponse: response
        };
      } else {
        return {
          endpoint: '/API/LoanServices',
          method: 'POST',
          status: 'PARTIAL',
          message: 'Response received but missing expected loan/application ID',
          responseTime,
          expectedFormat: false,
          actualResponse: response
        };
      }
    } catch (error: any) {
      return {
        endpoint: '/API/LoanServices',
        method: 'POST',
        status: 'FAIL',
        message: `Loan request failed: ${error.message}`,
        responseTime: Date.now() - startTime,
        details: error
      };
    }
  }

  private async testGetLoanStatus(): Promise<ApiTestResult> {
    const startTime = Date.now();
    const testLoanId = this.testLoanId || 'LOAN_001';
    
    try {
      const response = await getLoanStatus(testLoanId);
      const responseTime = Date.now() - startTime;
      
      if (response && response.status) {
        return {
          endpoint: '/API/LoanServices',
          method: 'POST',
          status: 'PASS',
          message: `Loan status retrieved: ${response.status}`,
          responseTime,
          expectedFormat: true,
          actualResponse: response
        };
      } else {
        return {
          endpoint: '/API/LoanServices',
          method: 'POST',
          status: 'PARTIAL',
          message: 'Response received but missing expected status field',
          responseTime,
          expectedFormat: false,
          actualResponse: response
        };
      }
    } catch (error: any) {
      return {
        endpoint: '/API/LoanServices',
        method: 'POST',
        status: 'FAIL',
        message: `Get loan status failed: ${error.message}`,
        responseTime: Date.now() - startTime,
        details: error
      };
    }
  }

  private async testGetLoanDetails(): Promise<ApiTestResult> {
    const startTime = Date.now();
    const testLoanId = this.testLoanId || 'LOAN_001';
    
    try {
      const response = await getLoanDetails(testLoanId);
      const responseTime = Date.now() - startTime;
      
      if (response && response.loanId) {
        return {
          endpoint: '/API/LoanServices',
          method: 'POST',
          status: 'PASS',
          message: 'Loan details retrieved successfully',
          responseTime,
          expectedFormat: true,
          actualResponse: response
        };
      } else {
        return {
          endpoint: '/API/LoanServices',
          method: 'POST',
          status: 'PARTIAL',
          message: 'Response received but missing expected loan details',
          responseTime,
          expectedFormat: false,
          actualResponse: response
        };
      }
    } catch (error: any) {
      return {
        endpoint: '/API/LoanServices',
        method: 'POST',
        status: 'FAIL',
        message: `Get loan details failed: ${error.message}`,
        responseTime: Date.now() - startTime,
        details: error
      };
    }
  }

  private async testGetLoanBalance(): Promise<ApiTestResult> {
    const startTime = Date.now();
    const testLoanId = this.testLoanId || 'LOAN_001';
    
    try {
      const response = await getLoanBalance(testLoanId);
      const responseTime = Date.now() - startTime;
      
      if (response && typeof response.totalBalance !== 'undefined') {
        return {
          endpoint: '/API/LoanServices',
          method: 'POST',
          status: 'PASS',
          message: `Loan balance retrieved: ${response.totalBalance}`,
          responseTime,
          expectedFormat: true,
          actualResponse: response
        };
      } else {
        return {
          endpoint: '/API/LoanServices',
          method: 'POST',
          status: 'PARTIAL',
          message: 'Response received but missing expected balance fields',
          responseTime,
          expectedFormat: false,
          actualResponse: response
        };
      }
    } catch (error: any) {
      return {
        endpoint: '/API/LoanServices',
        method: 'POST',
        status: 'FAIL',
        message: `Get loan balance failed: ${error.message}`,
        responseTime: Date.now() - startTime,
        details: error
      };
    }
  }

  private async testGetLoanProductDetails(): Promise<ApiTestResult> {
    const startTime = Date.now();
    
    try {
      const response = await getLoanProductDetails('instant-salary-advance', 'EMP001');
      const responseTime = Date.now() - startTime;
      
      if (response && response.productCode) {
        return {
          endpoint: '/API/GetLoanProducts',
          method: 'POST',
          status: 'PASS',
          message: `Product details retrieved for: ${response.productCode}`,
          responseTime,
          expectedFormat: true,
          actualResponse: response
        };
      } else {
        return {
          endpoint: '/API/GetLoanProducts',
          method: 'POST',
          status: 'PARTIAL',
          message: 'Response received but missing expected product details',
          responseTime,
          expectedFormat: false,
          actualResponse: response
        };
      }
    } catch (error: any) {
      return {
        endpoint: '/API/GetLoanProducts',
        method: 'POST',
        status: 'FAIL',
        message: `Get product details failed: ${error.message}`,
        responseTime: Date.now() - startTime,
        details: error
      };
    }
  }

  private async testUploadDocument(): Promise<ApiTestResult> {
    const startTime = Date.now();
    
    if (!this.testCustomerId) {
      return {
        endpoint: '/API/LoanServices',
        method: 'POST',
        status: 'SKIP',
        message: 'No customer ID available for document upload test'
      };
    }

    try {
      // Create a test file for UAT document upload
      const testFile = new File(['Test document content'], 'test-nrc.jpg', { type: 'image/jpeg' });
      
      // Use ApplicationNumber from loan request for document upload
      if (!this.testLoanId) {
        return {
          endpoint: '/API/LoanRequest/LoanRequestDocuments',
          method: 'POST',
          status: 'SKIP',
          message: 'Skipped: No ApplicationNumber available from loan request',
          responseTime: 0,
          expectedFormat: false,
          actualResponse: null
        };
      }

      const response = await uploadLoanDocument(this.testLoanId, '6', testFile); // 6 = NRC document type
      const responseTime = Date.now() - startTime;
      
      if (response && response.executionStatus === 'Success' && response.outParams?.LRDocumentDetailsId) {
        return {
          endpoint: '/API/LoanRequest/LoanRequestDocuments',
          method: 'POST',
          status: 'PASS',
          message: `Document uploaded successfully: ${response.outParams.LRDocumentDetailsId}`,
          responseTime,
          expectedFormat: true,
          actualResponse: response
        };
      } else {
        return {
          endpoint: '/API/LoanRequest/LoanRequestDocuments',
          method: 'POST',
          status: 'PARTIAL',
          message: `Upload failed: ${response?.executionMessage || 'Unknown error'}`,
          responseTime,
          expectedFormat: false,
          actualResponse: response
        };
      }
    } catch (error: any) {
      return {
        endpoint: '/API/LoanServices',
        method: 'POST',
        status: 'FAIL',
        message: `Document upload failed: ${error.message}`,
        responseTime: Date.now() - startTime,
        details: error
      };
    }
  }

  /**
   * Test connectivity to all endpoints
   */
  private async testConnectivity(): Promise<{
    primaryEndpoint: boolean;
    customerEndpoint: boolean;
    productEndpoint: boolean;
  }> {
    console.log('\n🔗 Testing Endpoint Connectivity...');
    
    const results = {
      primaryEndpoint: false,
      customerEndpoint: false,
      productEndpoint: false
    };

    try {
      const response = await altusApi.checkHealth();
      results.primaryEndpoint = response.status === 'connected';
    } catch (error) {
      console.log('❌ Primary endpoint (5010) unreachable');
    }

    // Test customer endpoint (5011)
    try {
      const customerResponse = await fetch('http://3.6.174.212:5011/health', { 
        method: 'GET'
      });
      results.customerEndpoint = customerResponse.ok;
    } catch (error) {
      console.log('❌ Customer endpoint (5011) unreachable');
    }

    // Test product endpoint (5012)
    try {
      const productResponse = await fetch('http://3.6.174.212:5012/health', { 
        method: 'GET'
      });
      results.productEndpoint = productResponse.ok;
    } catch (error) {
      console.log('❌ Product endpoint (5012) unreachable');
    }

    return results;
  }

  /**
   * Utility Methods
   */
  private calculateSuiteStats(suite: ApiTestSuite): void {
    suite.totalTests = suite.results.length;
    suite.passedTests = suite.results.filter(r => r.status === 'PASS').length;
    suite.failedTests = suite.results.filter(r => r.status === 'FAIL').length;
    suite.skippedTests = suite.results.filter(r => r.status === 'SKIP').length;
    
    if (suite.passedTests === suite.totalTests) {
      suite.summary = '✅ All tests passed';
    } else if (suite.passedTests > suite.failedTests) {
      suite.summary = '⚠️ Most tests passed';
    } else {
      suite.summary = '❌ Most tests failed';
    }
  }

  private detectEnvironment(): 'development' | 'uat' | 'production' {
    // Based on the IP address, this appears to be UAT
    return 'uat';
  }

  private generateRecommendations(
    authStatus: any,
    connectivity: any,
    ...suites: ApiTestSuite[]
  ): string[] {
    const recommendations: string[] = [];

    if (!authStatus.hasToken) {
      recommendations.push('Set a valid Bearer token using updateBearerToken()');
    }

    if (!authStatus.isValid) {
      recommendations.push('Current token appears invalid - verify token format and expiration');
    }

    if (!connectivity.primaryEndpoint) {
      recommendations.push('Primary endpoint (port 5010) is unreachable - check network connectivity');
    }

    if (!connectivity.customerEndpoint) {
      recommendations.push('Customer Services endpoint (port 5011) is unreachable');
    }

    if (!connectivity.productEndpoint) {
      recommendations.push('Product Services endpoint (port 5012) is unreachable');
    }

    const totalFailed = suites.reduce((sum, suite) => sum + suite.failedTests, 0);
    if (totalFailed > 0) {
      recommendations.push(`${totalFailed} API tests failed - review error details for specific issues`);
    }

    if (recommendations.length === 0) {
      recommendations.push('All systems appear to be functioning correctly');
    }

    return recommendations;
  }

  private printReport(report: ComprehensiveApiReport): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 ALTUS API COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(80));
    console.log(`🏥 Overall Status: ${report.overallStatus}`);
    console.log(`🕐 Timestamp: ${report.timestamp}`);
    console.log(`🌍 Environment: ${report.environment.toUpperCase()}`);
    console.log(`🔐 Auth Status: ${report.authenticationStatus.hasToken ? '✅ Token Present' : '❌ No Token'}`);
    
    console.log('\n📡 CONNECTIVITY STATUS:');
    console.log(`  Primary (5010): ${report.connectivity.primaryEndpoint ? '✅' : '❌'}`);
    console.log(`  Customer (5011): ${report.connectivity.customerEndpoint ? '✅' : '❌'}`);
    console.log(`  Product (5012): ${report.connectivity.productEndpoint ? '✅' : '❌'}`);
    
    // Print each test suite
    Object.entries(report.testSuites).forEach(([key, suite]) => {
      console.log(`\n${this.getSuiteIcon(suite)} ${suite.suiteName.toUpperCase()}:`);
      console.log(`  ${suite.summary}`);
      console.log(`  Passed: ${suite.passedTests}/${suite.totalTests} | Failed: ${suite.failedTests} | Skipped: ${suite.skippedTests}`);
      
      // Show failed tests
      const failedTests = suite.results.filter(r => r.status === 'FAIL');
      if (failedTests.length > 0) {
        failedTests.forEach(test => {
          console.log(`    ❌ ${test.endpoint}: ${test.message}`);
        });
      }
    });
    
    console.log('\n💡 RECOMMENDATIONS:');
    report.recommendations.forEach(rec => {
      console.log(`  • ${rec}`);
    });
    
    console.log('\n' + '='.repeat(80));
  }

  private getSuiteIcon(suite: ApiTestSuite): string {
    if (suite.passedTests === suite.totalTests) return '✅';
    if (suite.passedTests > suite.failedTests) return '⚠️';
    return '❌';
  }
}

// Export convenience function
export async function runAltusApiTests(): Promise<ComprehensiveApiReport> {
  const tester = new AltusApiTester();
  return await tester.runComprehensiveTests();
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).runAltusApiTests = runAltusApiTests;
  (window as any).AltusApiTester = AltusApiTester;
}

export default AltusApiTester;