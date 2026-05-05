const mongoose = require('mongoose');

const DEFAULT_LOCAL_URI = 'mongodb://localhost:27017/sportspartner';

function getMongoUri() {
  const fromEnv = process.env.MONGO_URI;
  if (fromEnv && String(fromEnv).trim()) {
    return String(fromEnv).trim();
  }

  if (process.env.VERCEL) {
    throw new Error(
      'MONGO_URI is not set. In Vercel: Project → Settings → Environment Variables → add MONGO_URI (e.g. MongoDB Atlas connection string). Localhost MongoDB is not available on Vercel.'
    );
  }

  return DEFAULT_LOCAL_URI;
}

/**
 * Cached connection for serverless (Vercel): reuse across invocations.
 */
async function connectMongo() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  await mongoose.connect(getMongoUri());
  return mongoose.connection;
}

module.exports = { connectMongo, getMongoUri };
