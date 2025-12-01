import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { http } from '../api/http';
import { CURRENT_API_CONFIG } from '../config/apiConfig';

const ApiTestPage: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<{ [key: string]: any }>({});
  
  // Stored IDs
  const [customerId, setCustomerId] = useState('');
  const [applicationNumber, setApplicationNumber] = useState('');

  const logResult = (testName: string, success: boolean, data: any) => {
    console.log(`API Test - ${testName}:`, data);
    setResults(prev => ({
      ...prev,
      [testName]: { success, data, timestamp: new Date().toISOString() }
    }));
  };

  // Test 1: Create Customer (Port 5011)
  const testCreateCustomer = async () => {
    setLoading('createCustomer');
    try {
      console.log('🧪 Testing Customer Creation API (Port 5011)...');
      const nrcNumber = `${Math.floor(100000 + Math.random() * 899999)}/${Math.floor(10 + Math.random() * 89)}/${Math.floor(1 + Math.random() * 9)}`;
      const contactNo = `09${Math.floor(70000000 + Math.random() * 9999999)}`;
      const data = {
        body: {
          Command: "Create",
          FirstName: "TestUser",
          LastName: "APITest",
          NRCNumber: nrcNumber,
          ContactNo: contactNo,
          EmailID: `testuser${Date.now()}@example.com`,
          PrimaryAddress: "123 Test Street",
          ProvinceName: "Lusaka",
          DistrictName: "Lusaka",
          CountryName: "Zambia",
          GenderName: "Male",
          DOB: "01/01/1990 00:00:00",
          Title: "Mr",
          CustomerStatus: "Active",
          NRCIssueDate: "01/01/2010 00:00:00",
          UpdatedBy: "system",
          BranchName: "Choma",
          FinancialInstitutionName: "Indo Zambia Bank",
          FinancialInstitutionBranchName: "Lusaka",
          AccountNumber: `ACC${Date.now()}`,
          AccountType: "Savings"
        }
      };
      
      const response = await http.post(`${CURRENT_API_CONFIG.CUSTOMER_SERVICES_BASE}/API/CustomerServices/RetailCustomer`, data);
      const result = response.data;
      logResult('createCustomer', true, result);
      
      // Check for CustomerID in outParams
      const customerIdFromResponse = result.outParams?.CustomerID || result.CustomerId;
      if (customerIdFromResponse) {
        setCustomerId(customerIdFromResponse);
        alert(`✅ Customer Created! ID: ${customerIdFromResponse}`);
      } else {
        alert(`⚠️ Response received but no CustomerID found`);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.executionMessage || error.message || error;
      console.error('❌ Customer Creation Error:', error.response?.data || error);
      logResult('createCustomer', false, errorMsg);
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setLoading(null);
    }
  };

  // Test 2: Submit Loan Request (Port 5013 - CRITICAL)
  const testLoanRequest = async () => {
    if (!customerId) {
      alert('Please create a customer first!');
      return;
    }
    
    setLoading('loanRequest');
    try {
      console.log('🧪 Testing Loan Request API (Port 5013 - CRITICAL FIX)...');
      const data = {
        body: {
          TypeOfCustomer: "Existing",
          CustomerId: customerId,
          IdentityNo: "123456/78/9",
          ContactNo: "0977123456",
          EmailId: "test@example.com",
          EmployeeNumber: `EMP${Date.now()}`,
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
      
      const response = await http.post(`${CURRENT_API_CONFIG.DOCUMENT_SERVICES_BASE}/API/LoanRequest/Salaried`, data);
      const result = response.data;
      logResult('loanRequest', true, result);
      
      // Check for ApplicationNumber in outParams
      const appNumber = result.outParams?.ApplicationNumber || result.ApplicationNumber;
      if (appNumber) {
        setApplicationNumber(appNumber);
        alert(`✅ Loan Request Submitted! App #: ${appNumber}`);
      } else {
        alert(`⚠️ Response received but no ApplicationNumber found`);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.executionMessage || error.message || error;
      console.error('❌ Loan Request Error:', error.response?.data || error);
      logResult('loanRequest', false, errorMsg);
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setLoading(null);
    }
  };

  // Test 3: EMI Calculator (Port 5009)
  const testEMI = async () => {
    setLoading('emi');
    try {
      console.log('🧪 Testing EMI Calculator API (Port 5009)...');
      const data = {
        body: {
          LoanType: "1",
          ProductCode: "COPL",
          EmployerID: "EMP0000004",
          LoanAmount: "20000",
          LoanTenure: "6"
        }
      };
      
      const response = await http.post(`${CURRENT_API_CONFIG.EMI_CALCULATOR_BASE}/API/LoanList/EMICalculator`, data);
      const result = response.data;
      logResult('emi', true, result);
    } catch (error: any) {
      const errorMsg = error.response?.data?.executionMessage || error.message || error;
      console.error('❌ EMI Calculator Error:', error.response?.data || error);
      logResult('emi', false, errorMsg);
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setLoading(null);
    }
  };

  // Test 4: Get Loan Balance (Port 5010)
  const testLoanBalance = async () => {
    setLoading('loanBalance');
    try {
      console.log('🧪 Testing Get Loan Balance API (Port 5010)...');
      const data = {
        body: {
          LoanId: "000005276"
        }
      };
      
      const response = await http.post(`${CURRENT_API_CONFIG.LOAN_SERVICES_BASE}/API/LoanServices/GetLoanBalance`, data);
      const result = response.data;
      logResult('loanBalance', true, result);
    } catch (error: any) {
      const errorMsg = error.response?.data?.executionMessage || error.message || error;
      console.error('❌ Loan Balance Error:', error.response?.data || error);
      logResult('loanBalance', false, errorMsg);
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setLoading(null);
    }
  };

  // Test 5: Get Product Details (Port 5012)
  const testProduct = async () => {
    setLoading('product');
    try {
      console.log('🧪 Testing Product Details API (Port 5012)...');
      const data = {
        body: {
          productCode: "COPL",
          employerId: "EMP0000004"
        }
      };
      
      const response = await http.post(`${CURRENT_API_CONFIG.PRODUCT_SERVICES_BASE}/API/GetLoanProducts/ProductDetails`, data);
      const result = response.data;
      logResult('product', true, result);
    } catch (error: any) {
      const errorMsg = error.response?.data?.executionMessage || error.message || error;
      console.error('❌ Product Details Error:', error.response?.data || error);
      logResult('product', false, errorMsg);
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setLoading(null);
    }
  };

  const renderTestResult = (testName: string) => {
    const result = results[testName];
    if (!result) return null;

    return (
      <Alert 
        severity={result.success ? "success" : "error"} 
        icon={result.success ? <CheckCircleIcon /> : <ErrorIcon />}
        sx={{ mt: 2 }}
      >
        <Typography variant="subtitle2" fontWeight="bold">
          {result.success ? 'SUCCESS' : 'FAILED'} - {new Date(result.timestamp).toLocaleTimeString()}
        </Typography>
        <Box 
          component="pre" 
          sx={{ 
            mt: 1, 
            p: 1, 
            bgcolor: 'background.paper', 
            borderRadius: 1,
            overflow: 'auto',
            maxHeight: 300,
            fontSize: '0.75rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {JSON.stringify(result.data, null, 2)}
        </Box>
      </Alert>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          🧪 API Testing Panel
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Test all Altus API endpoints with UAT compliance verification
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Test Order:</strong> Create Customer → Submit Loan Request → Test Other APIs
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Open browser console (F12) for detailed debug logs
          </Typography>
        </Alert>

        <Divider sx={{ my: 3 }} />

        {/* Current IDs */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            <strong>Stored Values:</strong>
          </Typography>
          <Typography variant="body2">
            Customer ID: {customerId || '(not set)'}
          </Typography>
          <Typography variant="body2">
            Application Number: {applicationNumber || '(not set)'}
          </Typography>
        </Box>

        {/* Test 1: Create Customer */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            1. Create Customer (Port 5011)
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Creates a test customer with random data
          </Typography>
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={loading === 'createCustomer' ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
            onClick={testCreateCustomer}
            disabled={loading !== null}
          >
            Test Create Customer
          </Button>
          {renderTestResult('createCustomer')}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Test 2: Loan Request */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            2. 🚨 Submit Loan Request (Port 5013)
            <Box component="span" sx={{ fontSize: '0.7rem', bgcolor: 'error.main', color: 'white', px: 1, py: 0.5, borderRadius: 1 }}>
              CRITICAL FIX
            </Box>
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>FIXED:</strong> Now uses Port 5013 (was 5010)
            </Typography>
          </Alert>
          <Typography variant="body2" color="text.secondary" paragraph>
            Requires Customer ID from step 1
          </Typography>
          <Button
            variant="contained"
            color="error"
            size="large"
            fullWidth
            startIcon={loading === 'loanRequest' ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
            onClick={testLoanRequest}
            disabled={loading !== null || !customerId}
          >
            Test Loan Request (Port 5013)
          </Button>
          {renderTestResult('loanRequest')}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Other Tests */}
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              3. EMI Calculator (Port 5009)
            </Typography>
            <Button
              variant="contained"
              fullWidth
              startIcon={loading === 'emi' ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
              onClick={testEMI}
              disabled={loading !== null}
            >
              Test EMI Calculator
            </Button>
            {renderTestResult('emi')}
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              4. Get Product Details (Port 5012)
            </Typography>
            <Button
              variant="contained"
              fullWidth
              startIcon={loading === 'product' ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
              onClick={testProduct}
              disabled={loading !== null}
            >
              Test Product Details
            </Button>
            {renderTestResult('product')}
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              5. Get Loan Balance (Port 5010)
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Requires Application Number from step 2
            </Typography>
            <Button
              variant="contained"
              fullWidth
              startIcon={loading === 'loanBalance' ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
              onClick={testLoanBalance}
              disabled={loading !== null || !applicationNumber}
            >
              Test Loan Balance
            </Button>
            {renderTestResult('loanBalance')}
          </Box>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Alert severity="info">
          <Typography variant="body2">
            <strong>Debug Console:</strong> Press F12 to open DevTools and view detailed API logs
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Look for "Debug: UAT Salaried Loan Request (Port 5013):" messages
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
};

export default ApiTestPage;
