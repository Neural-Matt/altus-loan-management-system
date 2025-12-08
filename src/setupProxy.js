const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Only skip proxy setup if explicitly in development with mock mode enabled
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isMockMode = process.env.REACT_APP_MOCK_MODE === 'true';

  if (isDevelopment && isMockMode) {
    console.log('🔧 Development + Mock mode enabled - skipping API proxy setup');
    return;
  }

  console.log('🔧 Setting up API proxies for production mode');
  console.log(`   Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`   Mock Mode: ${isMockMode ? 'enabled' : 'disabled'}`);

  // Proxy for Loan Services (Port 5010)
  app.use(
    '/loan-api',
    createProxyMiddleware({
      target: 'http://3.6.174.212:5010',
      changeOrigin: true,
      pathRewrite: {
        '^/loan-api': '', // Remove /loan-api prefix
      },
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.log('Proxy Error (Loan Services):', err.message);
      }
    })
  );

  // Proxy for Customer Services (Port 5011)
  app.use(
    '/customer-api',
    createProxyMiddleware({
      target: 'http://3.6.174.212:5011',
      changeOrigin: true,
      pathRewrite: {
        '^/customer-api': '', // Remove /customer-api prefix
      },
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.log('Proxy Error (Customer Services):', err.message);
      }
    })
  );

  // Proxy for Product Services (Port 5012)
  app.use(
    '/product-api',
    createProxyMiddleware({
      target: 'http://3.6.174.212:5012',
      changeOrigin: true,
      pathRewrite: {
        '^/product-api': '', // Remove /product-api prefix
      },
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.log('Proxy Error (Product Services):', err.message);
      }
    })
  );

  // Proxy for Document Services (Port 5013) - Loan Request
  app.use(
    '/document-api',
    createProxyMiddleware({
      target: 'http://3.6.174.212:5013',
      changeOrigin: true,
      pathRewrite: {
        '^/document-api': '', // Remove /document-api prefix
      },
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.log('Proxy Error (Document Services):', err.message);
      }
    })
  );

  // Proxy for Document Upload Services (Port 5014) - Document Upload
  app.use(
    '/document-upload-api',
    createProxyMiddleware({
      target: 'http://3.6.174.212:5014',
      changeOrigin: true,
      pathRewrite: {
        '^/document-upload-api': '', // Remove /document-upload-api prefix
      },
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.log('Proxy Error (Document Upload Services):', err.message);
      }
    })
  );

  // Proxy for Loan List Services (Port 5009) - NEW from UAT documentation
  app.use(
    '/loanlist-api',
    createProxyMiddleware({
      target: 'http://3.6.174.212:5009',
      changeOrigin: true,
      pathRewrite: {
        '^/loanlist-api': '', // Remove /loanlist-api prefix
      },
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.log('Proxy Error (Loan List Services):', err.message);
      }
    })
  );
};