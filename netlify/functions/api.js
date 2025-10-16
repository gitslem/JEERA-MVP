// This is the serverless function handler for Netlify

const serverless = require('serverless-http');
const { app } = require('../../server/index'); // Import your existing Express app

// We export a handler function that wraps our Express app
module.exports.handler = serverless(app);