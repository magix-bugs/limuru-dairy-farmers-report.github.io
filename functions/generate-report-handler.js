const serverless = require('serverless-http');
const app = require('./generate-report');

module.exports.handler = serverless(app);
