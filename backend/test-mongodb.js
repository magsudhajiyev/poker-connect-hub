const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/poker_connect_hub';

console.log('Testing MongoDB connection...');
console.log('DATABASE_URL:', DATABASE_URL);

mongoose.connect(DATABASE_URL)
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    console.log('Database name:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('Port:', mongoose.connection.port);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed!');
    console.error('Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  });

// Timeout after 10 seconds
setTimeout(() => {
  console.error('⏱️  Connection timeout - MongoDB might not be running');
  process.exit(1);
}, 10000);