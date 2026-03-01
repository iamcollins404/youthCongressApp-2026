const dns = require('dns');
const mongoose = require('mongoose');

// Force Google/Cloudflare public DNS so SRV lookups don't fail on restrictive networks
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI is not set in environment variables');
      process.exit(1);
    }
    await mongoose.connect(uri, {
      family: 4,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
