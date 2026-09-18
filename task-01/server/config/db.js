const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pos_inventory';

  try {
    // Attempt connecting to the configured MongoDB URI
    console.log(`Connecting to MongoDB at: ${uri}`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000, // Short timeout to quickly detect if local mongo is absent
    });
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`Could not connect to external MongoDB at ${uri}: ${error.message}`);
    console.log('Spinning up in-memory MongoDB replica set for seamless local execution and testing...');

    try {
      const { MongoMemoryReplSet, MongoMemoryServer } = require('mongodb-memory-server');
      try {
        mongod = await MongoMemoryReplSet.create({
          replSet: { count: 1, storageEngine: 'wiredTiger' },
        });
      } catch (replError) {
        console.warn('Could not create MongoReplSet, falling back to MongoMemoryServer:', replError.message);
        mongod = await MongoMemoryServer.create();
      }
      const memoryUri = mongod.getUri();
      console.log(`Connecting to In-Memory MongoDB at: ${memoryUri}`);
      const conn = await mongoose.connect(memoryUri);
      console.log(`Connected to In-Memory MongoDB successfully!`);
      return conn;
    } catch (fallbackError) {
      console.error('Fatal: Failed to connect to both primary URI and in-memory MongoDB:', fallbackError);
      process.exit(1);
    }
  }
};

const closeDB = async () => {
  await mongoose.connection.close();
  if (mongod) {
    await mongod.stop();
  }
};

module.exports = {
  connectDB,
  closeDB,
};
