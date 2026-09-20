const mongoose = require('mongoose');

const connectDB = async () => {
  let uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    uri = 'mongodb://127.0.0.1:27017/venuevault';
    console.log(`ℹ️ MONGODB_URI placeholder detected. Using local: ${uri}`);
  }
  const conn = await mongoose.connect(uri);
  console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  return conn;
};

module.exports = connectDB;
