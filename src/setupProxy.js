const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5001', // Important: Remove the project path
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/find-woker/us-central1' // Add project path here instead
      },
      logLevel: 'debug' // Helps with troubleshooting
    })
  );
};