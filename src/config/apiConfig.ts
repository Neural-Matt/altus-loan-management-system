// API Configuration for different environments
export const API_CONFIG = {
  // Development mode - use relative URLs to leverage proxy
  development: {
    LOAN_SERVICES_BASE: '/loan-api',  // Proxied to 3.6.174.212:5010
    CUSTOMER_SERVICES_BASE: '/customer-api', // Proxied to 3.6.174.212:5011  
    PRODUCT_SERVICES_BASE: '/product-api', // Proxied to 3.6.174.212:5012
    DOCUMENT_SERVICES_BASE: '/document-api', // Proxied to 3.6.174.212:5013
  },
  
  // Production mode - use direct URLs 
  production: {
    LOAN_SERVICES_BASE: 'http://3.6.174.212:5010',
    CUSTOMER_SERVICES_BASE: 'http://3.6.174.212:5011',
    PRODUCT_SERVICES_BASE: 'http://3.6.174.212:5012', 
    DOCUMENT_SERVICES_BASE: 'http://3.6.174.212:5013',
  },
  
  // Testing mode - use direct URLs for browser testing
  test: {
    LOAN_SERVICES_BASE: 'http://3.6.174.212:5010',
    CUSTOMER_SERVICES_BASE: 'http://3.6.174.212:5011',
    PRODUCT_SERVICES_BASE: 'http://3.6.174.212:5012',
    DOCUMENT_SERVICES_BASE: 'http://3.6.174.212:5013',
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