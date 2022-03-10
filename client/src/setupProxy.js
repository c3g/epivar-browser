const packageJson = require("../package.json");

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: packageJson.proxy,
      changeOrigin: true,
    })
  );
};
