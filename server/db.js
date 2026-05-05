const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sportspartner';

/**
 * Cached connection for serverless (Vercel): reuse across invocations.
 */
async function connectMongo() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  await mongoose.connect(MONGO_URI);
  return mongoose.connection;
}

module.exports = { connectMongo, MONGO_URI };
