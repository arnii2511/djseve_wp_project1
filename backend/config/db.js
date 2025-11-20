const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return;
      } catch (connErr) {
        console.warn('Failed to connect to MONGO_URI:', connErr.message || connErr);
        // fallthrough to in-memory fallback in non-production
      }
    }

    // If we're in development, try in-memory fallback when MONGO_URI missing or connection failed
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Using in-memory MongoDB for development (MONGO_URI missing or connection failed)');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        const conn = await mongoose.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log(`In-memory MongoDB started: ${conn.connection.host}`);
        return;
      } catch (memErr) {
        console.error('Failed to start in-memory MongoDB:', memErr.message || memErr);
        process.exit(1);
      }
    }

    console.error('FATAL: MONGO_URI is not set or not reachable. Please set it in .env and ensure the DB is reachable.');
    process.exit(1);
  } catch (err) {
    console.error('MongoDB connection error:', err.message || err);
    process.exit(1);
  }
};

module.exports = connectDB;
