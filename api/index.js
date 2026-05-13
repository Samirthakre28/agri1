// Vercel Serverless Function Handler
// Wraps the Express backend app for Vercel's serverless environment
const app = require('../backend/server');
module.exports = app;
