// API Configuration for different environments
export const API_CONFIG = {
  // Development mode - use relative URLs to leverage proxy
  development: {
    LOAN_SERVICES_BASE: '/loan-api',  // Proxied to coinmicro.altuszm.com:5010
    CUSTOMER_SERVICES_BASE: '/customer-api', // Proxied to coinmicro.altuszm.com:5011  
    PRODUCT_SERVICES_BASE: '/product-api', // Proxied to coinmicro.altuszm.com:5012
    DOCUMENT_SERVICES_BASE: '/document-api', // Proxied to coinmicro.altuszm.com:5013 (Loan Request)
    DOCUMENT_UPLOAD_BASE: '/document-upload-api', // Proxied to coinmicro.altuszm.com:5013 (Document Upload)
    EMI_CALCULATOR_BASE: '/emi-api', // Proxied to coinmicro.altuszm.com:5009
  },
  
  // Production mode - use relative URLs to go through nginx reverse proxy
  production: {
    LOAN_SERVICES_BASE: '/loan-api',
    CUSTOMER_SERVICES_BASE: '/customer-api',
    PRODUCT_SERVICES_BASE: '/product-api', 
    DOCUMENT_SERVICES_BASE: '/document-api',
    DOCUMENT_UPLOAD_BASE: '/document-upload-api',
    EMI_CALCULATOR_BASE: '/emi-api',
  },
  
  // Testing mode - use direct URLs for browser testing (Live APIs)
  test: {
    LOAN_SERVICES_BASE: 'https://coinmicro.altuszm.com:5010',
    CUSTOMER_SERVICES_BASE: 'https://coinmicro.altuszm.com:5011',
    PRODUCT_SERVICES_BASE: 'https://coinmicro.altuszm.com:5012',
    DOCUMENT_SERVICES_BASE: 'https://coinmicro.altuszm.com:5013',
    DOCUMENT_UPLOAD_BASE: 'https://coinmicro.altuszm.com:5013',
    EMI_CALCULATOR_BASE: 'https://coinmicro.altuszm.com:5009',
  }
};

// Get current environment
const getEnvironment = (): keyof typeof API_CONFIG => {
  if (process.env.NODE_ENV === 'production') return 'production';
  if (process.env.REACT_APP_TEST_MODE === 'true') return 'test';
  return 'development';
};

// Export current config
export const CURRENT_API_CONFIG = API_CONFIG[getEnvironment()];

// Helper to check if we're in test mode
export const isTestMode = () => process.env.REACT_APP_TEST_MODE === 'true';

console.log(`🌐 API Config loaded for ${getEnvironment()} environment:`, CURRENT_API_CONFIG);