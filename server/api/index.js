/**
 * Vercel serverless entry: all HTTP traffic is rewritten here (see server/vercel.json).
 * Socket.IO does not run on Vercel; chat still works via REST.
 */
require('dotenv').config();
const serverless = require('serverless-http');
const { buildApp } = require('../app');
const { connectMongo } = require('../db');

const expressApp = buildApp();

async function bootstrap() {
  await connectMongo();
}

let handlerPromise;
function getHandler() {
  if (!handlerPromise) {
    handlerPromise = bootstrap().then(() => serverless(expressApp));
  }
  return handlerPromise;
}

module.exports = async (req, res) => {
  try {
    const handler = await getHandler();
    return handler(req, res);
  } catch (err) {
    console.error('Vercel handler error:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Server failed to start', code: 500 });
    }
  }
};
