const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const remoteUri = process.env.MONGO_URI;
  const candidateUris = remoteUri
    ? [remoteUri]
    : ['mongodb://127.0.0.1:27017/mini-social-feed'];

  mongoose.set('strictQuery', true);

  let lastError;

  for (const uri of candidateUris) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
      });

      console.log(`[db] MongoDB connected: ${mongoose.connection.host}`);
      return mongoose.connection;
    } catch (error) {
      lastError = error;
      console.warn(`[db] Failed to connect to ${uri}: ${error.message}`);
    }
  }

  console.warn(`[db] MongoDB unavailable; continuing without a database connection. ${lastError?.message || ''}`.trim());
  return null;
};

module.exports = connectDB;
