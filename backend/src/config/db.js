const mongoose = require('mongoose');
const config = require('./index');

let mongodInstance = null;

/**
 * Connect to MongoDB with automatic Atlas / local / embedded fallback support.
 */
async function connectDB() {
  // 1. Try connecting with configured MONGODB_URI
  if (config.mongodb.uri && !config.mongodb.uri.includes('localhost:27017')) {
    try {
      console.log(`📡 Connecting to remote MongoDB Atlas...`);
      const conn = await mongoose.connect(config.mongodb.uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ MongoDB Atlas connected successfully: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (err) {
      console.warn(`⚠️  Remote MongoDB connection failed: ${err.message}. Falling back to local/embedded MongoDB...`);
    }
  }

  // 2. Try connecting to local running MongoDB instance
  try {
    const conn = await mongoose.connect(config.mongodb.uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`✅ Local MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (localErr) {
    // 3. Fallback to embedded in-memory MongoDB Server for instant, zero-setup testing
    console.log(`⚙️  Local MongoDB not active. Initializing zero-config embedded MongoDB server...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'telehealth',
        },
      });
      const uri = mongodInstance.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✅ Zero-config Embedded MongoDB active and ready! (${uri})`);
      return conn;
    } catch (memErr) {
      console.error(`❌ Could not start embedded MongoDB: ${memErr.message}`);
      throw memErr;
    }
  }
}

/**
 * Graceful shutdown
 */
async function disconnectDB() {
  try {
    await mongoose.connection.close();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
    console.log('✅ MongoDB connection closed gracefully');
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
  }
}

module.exports = { connectDB, disconnectDB };
