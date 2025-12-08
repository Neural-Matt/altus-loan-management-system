const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const mockLoanProducts = [
  {
    productCode: 'government-personal',
    productName: 'Government Personal Loan',
    minAmount: 1000,
    maxAmount: 50000,
    minTerm: 6,
    maxTerm: 60,
    interestRate: 15.5,
    description: 'Personal loan for government employees'
  },
  {
    productCode: 'private-sector',
    productName: 'Private Sector Loan',
    minAmount: 2000,
    maxAmount: 100000,
    minTerm: 12,
    maxTerm: 84,
    interestRate: 18.5,
    description: 'Personal loan for private sector employees'
  }
];

const mockCustomers = [];
let nextCustomerId = 1;

// Mock API endpoints
app.get('/loan-products/:productCode', (req, res) => {
  const { productCode } = req.params;
  const product = mockLoanProducts.find(p => p.productCode === productCode);

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

app.get('/loan-products', (req, res) => {
  res.json(mockLoanProducts);
});

app.post('/customers', (req, res) => {
  const customer = {
    id: nextCustomerId++,
    ...req.body,
    createdAt: new Date().toISOString()
  };

  mockCustomers.push(customer);
  res.status(201).json(customer);
});

app.get('/customers/:id', (req, res) => {
  const { id } = req.params;
  const customer = mockCustomers.find(c => c.id === parseInt(id));

  if (customer) {
    res.json(customer);
  } else {
    res.status(404).json({ message: 'Customer not found' });
  }
});

app.put('/customers/:id', (req, res) => {
  const { id } = req.params;
  const customerIndex = mockCustomers.findIndex(c => c.id === parseInt(id));

  if (customerIndex !== -1) {
    mockCustomers[customerIndex] = { ...mockCustomers[customerIndex], ...req.body };
    res.json(mockCustomers[customerIndex]);
  } else {
    res.status(404).json({ message: 'Customer not found' });
  }
});

app.post('/loans/requests', (req, res) => {
  // Generate a mock application ID
  const applicationId = `ALT${Date.now().toString().slice(-8)}`;

  const response = {
    applicationId,
    status: 'submitted',
    message: 'Loan application submitted successfully',
    submittedAt: new Date().toISOString()
  };

  res.status(201).json(response);
});

app.get('/loans/calculate-emi', (req, res) => {
  // Mock EMI calculation
  const { amount, term, rate } = req.query;

  const principal = parseFloat(amount) || 10000;
  const months = parseInt(term) || 24;
  const annualRate = parseFloat(rate) || 15.5;
  const monthlyRate = annualRate / 100 / 12;

  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
              (Math.pow(1 + monthlyRate, months) - 1);

  res.json({
    emi: Math.round(emi * 100) / 100,
    totalAmount: Math.round(emi * months * 100) / 100,
    totalInterest: Math.round((emi * months - principal) * 100) / 100,
    principal,
    term: months,
    rate: annualRate
  });
});

app.get('/applications/:referenceId/status', (req, res) => {
  const { referenceId } = req.params;

  // Return mock status
  res.json({
    status: 'under_review',
    lastUpdated: new Date().toISOString(),
    requestId: referenceId,
    loanId: referenceId,
    timeline: [
      {
        stage: 'submitted',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        description: 'Application submitted successfully'
      },
      {
        stage: 'under_review',
        timestamp: new Date().toISOString(),
        description: 'Application is under review'
      }
    ]
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mock API server is running' });
});

// Catch-all for unhandled routes
app.use((req, res) => {
  console.log(`Unhandled ${req.method} request to ${req.originalUrl}`);
  res.status(404).json({
    message: `Mock endpoint not implemented: ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /loan-products',
      'GET /loan-products/:productCode',
      'POST /customers',
      'GET /customers/:id',
      'PUT /customers/:id',
      'POST /loans/requests',
      'GET /loans/calculate-emi',
      'GET /applications/:referenceId/status',
      'GET /health'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock API server running on http://localhost:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET  /health`);
  console.log(`   GET  /loan-products`);
  console.log(`   POST /customers`);
  console.log(`   POST /loans/requests`);
  console.log(`   GET  /applications/:id/status`);
  console.log(`   GET  /loans/calculate-emi`);
});