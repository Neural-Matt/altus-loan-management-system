import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Chip,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SendIcon from '@mui/icons-material/Send';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';

// Import all API functions for testing
import {
  // Loan Services API (Port 5010)
  getLoanBalance,
  getLoanStatus, 
  getLoanDetails,
  
  // Customer Services API (Port 5011)
  createRetailCustomer,
  createBusinessCustomer,
  getCustomerDetails,
  getCustomerRequestStatus,
  
  // Product Services API (Port 5012)
  getLoanProductDetails,
  
  // Document Services API (Port 5013)
  uploadLoanDocument,
  
  // Loan Request Services API (Port 5010)
  submitLoanRequest,
  submitBusinessLoanRequest,
  
  // Loan List Services API (Port 5009)
  getLoansByCustomer,
  calculateEMI,
  getPBLEligibilityStatus,
  
  // Note: Service clients are available in altusApi.clients if needed
} from '../api/altusApi';

interface APITest {
  id: string;
  name: string;
  port: string;
  endpoint: string;
  method: string;
  function: Function;
  samplePayload: any;
  description: string;
}

interface TestResult {
  timestamp: string;
  apiName: string;
  success: boolean;
  url: string;
  method: string;
  requestData: any;
  response: any;
  error?: string;
  duration: number;
}

const APITesterComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [showNetworkDetails, setShowNetworkDetails] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Define all available API tests
  const apiTests: APITest[] = [
    // Port 5010 - Loan Services
    {
      id: 'getLoanBalance',
      name: 'Get Loan Balance',
      port: '5010',
      endpoint: 'API/LoanServices/GetLoanBalance',
      method: 'POST',
      function: getLoanBalance,
      samplePayload: '000005276', // LoanId as string
      description: 'Retrieve loan balance for a specific application'
    },
    {
      id: 'getLoanStatus',
      name: 'Get Loan Status',
      port: '5010', 
      endpoint: 'API/LoanServices/GetLoanStatus',
      method: 'POST',
      function: getLoanStatus,
      samplePayload: '000005276', // LoanId as string
      description: 'Check the current status of a loan application'
    },
    {
      id: 'getLoanDetails',
      name: 'Get Loan Details',
      port: '5010',
      endpoint: 'API/LoanServices/GetLoanDetails', 
      method: 'POST',
      function: getLoanDetails,
      samplePayload: '000005276', // LoanId as string
      description: 'Get comprehensive loan details'
    },
    {
      id: 'submitLoanRequest',
      name: 'Submit Loan Request',
      port: '5013',
      endpoint: 'API/LoanRequest/Salaried',
      method: 'POST',
      function: submitLoanRequest,
      samplePayload: {
        TypeOfCustomer: 'New',
        CustomerId: '',
        IdentityNo: '782349/32/4',
        FirstName: 'Regional Enterprises',
        MiddleName: 'R',
        LastName: 'Henry',
        ContactNo: '23432423324',
        EmailId: 'reg@mail.com',
        DateOfBirth: '07/01/1994 00:00:00',
        EmployeeNumber: '3478',
        Designation: 'Army',
        EmployementType: '1',
        Gender: 'Female',
        Tenure: 5,
        LoanAmount: 60000,
        GrossIncome: 100000,
        NetIncome: 100000,
        Deductions: 0
      },
      description: 'Submit a new salaried loan request'
    },
    {
      id: 'submitBusinessLoanRequest',
      name: 'Submit Business Loan Request',
      port: '5013',
      endpoint: 'API/LoanRequest/Business',
      method: 'POST', 
      function: submitBusinessLoanRequest,
      samplePayload: {
        TypeOfCustomer: 'New',
        CustomerId: '',
        CustomerName: 'Regional Enterprises',
        IdentityNo: '782349/32/4',
        ContactNo: '23432423324',
        EmailId: 'reg@mail.com',
        EstimatedValueOfBusiness: '3478',
        GrossMonthlySales: '342',
        Tenure: 5,
        LoanAmount: 60000,
        InvoiceDetails: {
          GridData: {
            '0': {
              eColl: {
                InvoiceNo: {
                  Value: '193274'
                },
                InvoiceAmount: {
                  Value: '2000'
                },
                InvoiceDate: {
                  Value: '07/01/2024 00:00:00'
                }
              }
            }
          }
        }
      },
      description: 'Submit a business loan request'
    },

    // Port 5011 - Customer Services
    {
      id: 'createRetailCustomer',
      name: 'Create Retail Customer',
      port: '5011',
      endpoint: 'API/CustomerServices/RetailCustomer',
      method: 'POST',
      function: createRetailCustomer,
      samplePayload: {
        Command: 'Create',
        FirstName: 'Yash',
        MiddleName: '',
        LastName: '',
        CustomerStatus: 'Active',
        NRCIssueDate: '07/01/2020 00:00:00',
        UpdatedBy: 'user',
        PrimaryAddress: 'No 4, A Block',
        ProvinceName: 'Lusaka',
        DistrictName: 'Kitwe',
        CountryName: 'Zambia',
        Postalcode: '10101',
        NRCNumber: '643435/63/4',
        ContactNo: '342434234',
        EmailID: 'yash@mail.com',
        BranchName: 'Choma',
        GenderName: 'Male',
        Title: 'Mr',
        DOB: '07/01/2000 00:00:00',
        FinancialInstitutionName: 'Indo Zambia Bank',
        FinancialInstitutionBranchName: 'Lusaka',
        AccountNumber: 'TBC',
        AccountType: 'Savings'
      },
      description: 'Create a new retail customer'
    },
    {
      id: 'createBusinessCustomer',
      name: 'Create Business Customer',
      port: '5011',
      endpoint: 'API/CustomerServices/BusinessCustomer',
      method: 'POST',
      function: createBusinessCustomer,
      samplePayload: {
        Command: 'Create',
        BusinessName: 'Yash Aluminium Limited',
        CustomerStatus: 'Active',
        RegistrationDate: '07/01/2024 00:00:00',
        UpdatedBy: 'User',
        PrimaryAddress: 'No 4, A Block',
        ProvinceName: 'Lusaka',
        DistrictName: 'Kitwe',
        CountryName: 'Zambia',
        RegistrationNo: `${Date.now().toString().slice(-6)}/67/1`, // Unique registration number with timestamp
        ContactNo: '342434234',
        BusinessEmailID: 'ven@mail.com',
        BranchName: 'Choma',
        NoOfPermanentEmployees: 10,
        NoOfCasualEmployees: 10,
        Sector: 'Energy',
        BusinessPremisesType: 'Owned',
        EntityType: 'Partnership',
        PINNo: '1001',
        VatNo: '1002',
        LeasePeriod: '5',
        BalancePeriod: 20,
        FinancialInstitutionName: 'Indo Zambia Bank',
        FinancialInstitutionBranchName: 'Lusaka',
        AccountNumber: 'TBC',
        AccountType: 'Savings'
      },
      description: 'Create a new business customer'
    },
    {
      id: 'getCustomerDetails',
      name: 'Get Customer Details',
      port: '5011',
      endpoint: 'API/CustomerServices/GetCustomerDetails',
      method: 'POST',
      function: getCustomerDetails,
      samplePayload: '190400/71/1', // IdentityNo (NRC) as string
      description: 'Retrieve customer information'
    },
    {
      id: 'getCustomerRequestStatus',
      name: 'Get Customer Request Status',
      port: '5011',
      endpoint: 'API/CustomerServices/GetStatus',
      method: 'POST',
      function: getCustomerRequestStatus,
      samplePayload: 'CS20253230000000008', // RequestId from customer creation response
      description: 'Check customer creation request status (0=Pending, 1=Approved/Rejected)'
    },

    // Port 5012 - Product Services
    {
      id: 'getLoanProductDetails',
      name: 'Get Loan Product Details',
      port: '5012',
      endpoint: 'API/LoanProductServices/GetLoanProductDetails',
      method: 'POST',
      function: getLoanProductDetails,
      samplePayload: { productCode: 'COPL', employerId: 'EMP0000006' }, // Two params required
      description: 'Get details of loan products'
    },

    // Port 5013 - Document Services
    {
      id: 'uploadLoanDocument',
      name: 'Upload Loan Document',
      port: '5013',
      endpoint: 'API/LoanRequestServices/UploadLoanDocument',
      method: 'POST',
      function: uploadLoanDocument,
      samplePayload: 'File upload test - use file input',
      description: 'Upload documents for loan processing'
    },

    // Port 5009 - Loan List Services (NEW)
    {
      id: 'getLoansByCustomer',
      name: 'Get Loans By Customer',
      port: '5009',
      endpoint: 'API/LoanList/GetLoansByCustomer',
      method: 'POST',
      function: getLoansByCustomer,
      samplePayload: '0002-0007-3837', // Valid CustomerId from actual backend response
      description: 'Get all loans for a specific customer'
    },
    {
      id: 'calculateEMI',
      name: 'Calculate EMI',
      port: '5010',
      endpoint: 'API/LoanServices/EMICalculator',
      method: 'POST',
      function: calculateEMI,
      samplePayload: {
        LoanType: '1',  // Must be string "1" as per UAT
        ProductCode: 'COPL',  // Valid product from UAT
        EmployerID: 'EMP0000004',  // Valid employer from UAT
        LoanAmount: '20000',  // String format as per UAT
        LoanTenure: '6'  // String format as per UAT
      },
      description: 'Calculate EMI for loan parameters'
    },
    {
      id: 'getPBLEligibilityStatus',
      name: 'Get PBL Eligibility Status',
      port: '5010',
      endpoint: 'API/LoanServices/PBLEligibilityStatus',
      method: 'POST',
      function: getPBLEligibilityStatus,
      samplePayload: {
        DateOfBirth: '12/31/1999 15:50:09',
        ProductCode: 'GRZP',
        EmployerID: 'EMP0000004',
        EmploymentType: '1',
        LoanAmount: '020000',
        LoanTenure: '16',
        BasicPay: 1000,
        GrossIncome: 5000,
        NetIncome: 4900,
        Deductions: 100
      },
      description: 'Check PBL loan eligibility'
    }
  ];

  // Auto scroll to bottom when new results are added
  useEffect(() => {
    if (autoScroll && resultsRef.current) {
      resultsRef.current.scrollTop = resultsRef.current.scrollHeight;
    }
  }, [testResults, autoScroll]);

  const runAPITest = async (test: APITest, customPayload?: any) => {
    setLoading(test.id);
    const startTime = Date.now();
    
    try {
      console.log(`🚀 Testing API: ${test.name}`);
      console.log(`📍 URL: http://3.6.174.212:${test.port}/${test.endpoint}`);
      console.log(`📦 Payload:`, customPayload || test.samplePayload);
      
      let response;
      const payload = customPayload || test.samplePayload;
      
      // Handle different function signatures
      if (test.id === 'uploadLoanDocument') {
        // Document upload: (applicationNumber, documentType, file)
        const mockFile = new File(['test content'], 'test-document.pdf', { type: 'application/pdf' });
        response = await test.function('LRQ20250870000000004', 'Identity', mockFile); // Valid ApplicationNumber from UAT
      } else if (test.id === 'getLoanProductDetails') {
        // Product details: (productCode, employerId)
        response = await test.function(payload.productCode, payload.employerId);
      } else if (test.id === 'getLoanBalance' || test.id === 'getLoanStatus' || test.id === 'getLoanDetails' || test.id === 'getCustomerDetails' || test.id === 'getLoansByCustomer') {
        // Single string parameter functions
        response = await test.function(payload);
      } else {
        // Standard: pass payload as-is (objects)
        response = await test.function(payload);
      }
      
      const duration = Date.now() - startTime;
      
      const result: TestResult = {
        timestamp: new Date().toISOString(),
        apiName: test.name,
        success: true,
        url: `http://3.6.174.212:${test.port}/${test.endpoint}`,
        method: test.method,
        requestData: customPayload || test.samplePayload,
        response: response,
        duration: duration
      };
      
      console.log(`✅ Success: ${test.name}`, response);
      setTestResults(prev => [...prev, result]);
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      // Enhanced error handling for backend service issues
      let errorMessage = error.message || 'Unknown error';
      let errorDetails: any = null;
      
      if (error?.response?.status === 404) {
        errorMessage = '404: Backend service not responding';
        errorDetails = {
          issue: `Backend microservice on port ${test.port} is not available`,
          backendUrl: `http://3.6.174.212:${test.port}/${test.endpoint}`,
          proxyRoute: test.port === '5010' ? `/loan-api/${test.endpoint}` : `/emi-api/${test.endpoint}`,
          possibleCauses: [
            'Service not deployed or stopped on backend server',
            'Service running on different port',
            'Network connectivity issue between nginx and backend',
            'Service crashed or failed to start'
          ],
          nextSteps: [
            'SSH to backend server: ssh user@3.6.174.212',
            `Check if service is running: ps aux | grep ${test.port}`,
            'Check service logs for errors',
            `Verify service is listening: netstat -tulpn | grep ${test.port}`,
            'Contact backend team to restart service'
          ]
        };
        console.error(`❌ Backend Service Offline: ${test.name}`, errorDetails);
      }
      
      const result: TestResult = {
        timestamp: new Date().toISOString(),
        apiName: test.name,
        success: false,
        url: `http://3.6.174.212:${test.port}/${test.endpoint}`,
        method: test.method,
        requestData: customPayload || test.samplePayload,
        response: errorDetails || null,
        error: errorMessage,
        duration: duration
      };
      
      if (!errorDetails) {
        console.error(`❌ Error: ${test.name}`, error);
      }
      setTestResults(prev => [...prev, result]);
    } finally {
      setLoading(null);
    }
  };

  const runAllTests = async () => {
    console.log('🧪 Running all API tests...');
    for (const test of apiTests) {
      await runAPITest(test);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log('✅ All tests completed');
  };

  const clearResults = () => {
    setTestResults([]);
    console.clear();
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(testResults, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `altus-api-test-results-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Box sx={{ p: 3, maxWidth: '100%', mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🧪 Altus API Tester - UAT Compliance Testing
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Bearer Token:</strong> 0B9574489-7EC5-4373-94DA-871FDE07CF8EC3BEA3AF-C9B7-4DEA-AE35-EA1C626191C00314393C-29B4-4E60-8D11-595EDAAAC42F10
        </Typography>
      </Alert>

      {/* Control Panel */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🎮 Test Controls
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Button 
              variant="contained" 
              onClick={runAllTests}
              startIcon={<NetworkCheckIcon />}
              disabled={loading !== null}
            >
              Run All Tests
            </Button>
            <Button 
              variant="outlined" 
              onClick={clearResults}
              disabled={loading !== null}
            >
              Clear Results
            </Button>
            <Button 
              variant="outlined" 
              onClick={exportResults}
              disabled={testResults.length === 0}
            >
              Export Results
            </Button>
            <FormControlLabel
              control={
                <Switch
                  checked={showNetworkDetails}
                  onChange={(e) => setShowNetworkDetails(e.target.checked)}
                />
              }
              label="Show Network Details"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                />
              }
              label="Auto Scroll"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Individual API Tests */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🔧 Individual API Tests
          </Typography>
          
          {Object.entries(
            apiTests.reduce((groups, test) => {
              const key = `Port ${test.port}`;
              if (!groups[key]) groups[key] = [];
              groups[key].push(test);
              return groups;
            }, {} as Record<string, APITest[]>)
          ).map(([portGroup, tests]) => (
            <Accordion key={portGroup} defaultExpanded={portGroup === 'Port 5009'}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">
                  {portGroup} - {tests.length} APIs
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
                  {tests.map((test) => (
                    <Card variant="outlined" key={test.id}>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          {test.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {test.description}
                        </Typography>
                        <Chip 
                          label={`${test.method} :${test.port}`} 
                          size="small" 
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="caption" display="block" gutterBottom>
                          {test.endpoint}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<SendIcon />}
                          onClick={() => runAPITest(test)}
                          disabled={loading === test.id}
                          fullWidth
                        >
                          {loading === test.id ? 'Testing...' : 'Test'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Test Results ({testResults.length})
            </Typography>
            
            <Paper 
              ref={resultsRef}
              sx={{ 
                maxHeight: 600, 
                overflow: 'auto', 
                p: 2, 
                backgroundColor: '#f5f5f5' 
              }}
            >
              {testResults.map((result, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      borderLeft: `4px solid ${result.success ? '#4caf50' : '#f44336'}` 
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Box>
                          <Typography variant="subtitle2">
                            {result.success ? '✅' : '❌'} {result.apiName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(result.timestamp).toLocaleTimeString()} ({result.duration}ms)
                          </Typography>
                        </Box>
                        <Chip 
                          label={`${result.method} ${result.url.split('//')[1]}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      
                      {showNetworkDetails && (
                        <>
                          <Divider sx={{ my: 1 }} />
                          <Accordion>
                            <AccordionSummary expandIcon={<VisibilityIcon />}>
                              <Typography variant="caption">
                                View Details
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="caption" display="block" gutterBottom>
                                    <strong>Request:</strong>
                                  </Typography>
                                  <Paper sx={{ p: 1, backgroundColor: '#fff' }}>
                                    <pre style={{ fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap' }}>
                                      {JSON.stringify(result.requestData, null, 2)}
                                    </pre>
                                  </Paper>
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="caption" display="block" gutterBottom>
                                    <strong>{result.success ? 'Response:' : 'Error:'}</strong>
                                  </Typography>
                                  <Paper sx={{ p: 1, backgroundColor: '#fff' }}>
                                    <pre style={{ fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap' }}>
                                      {JSON.stringify(result.success ? result.response : result.error, null, 2)}
                                    </pre>
                                  </Paper>
                                </Box>
                              </Box>
                            </AccordionDetails>
                          </Accordion>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Paper>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default APITesterComponent;