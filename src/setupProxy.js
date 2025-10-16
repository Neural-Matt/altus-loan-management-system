const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
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

  // Proxy for Document Services (Port 5013)
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
};