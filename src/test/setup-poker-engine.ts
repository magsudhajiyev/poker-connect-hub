import '@testing-library/jest-dom';

// No need for window mocks in Node environment tests

// Set test MongoDB URI
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

// Increase timeout for MongoDB Memory Server
jest.setTimeout(60000);