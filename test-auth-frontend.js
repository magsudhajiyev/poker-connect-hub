#!/usr/bin/env node

// Test script to verify authentication flow from frontend perspective
const axios = require('axios');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const testEmail = `test${Date.now()}@example.com`;
const testPassword = 'TestPassword123!';
const testName = 'Test User';

// Create axios instance with cookie jar support
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Origin': 'http://localhost:5173', // Simulate frontend origin
  }
});

// Simple cookie jar for Node.js
let cookies = {};

// Request interceptor to attach cookies
axiosInstance.interceptors.request.use((config) => {
  const cookieString = Object.entries(cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
  
  if (cookieString) {
    config.headers.Cookie = cookieString;
  }
  
  console.log(`\n🔵 ${config.method.toUpperCase()} ${config.url}`);
  console.log('Headers:', config.headers);
  return config;
});

// Response interceptor to save cookies
axiosInstance.interceptors.response.use((response) => {
  console.log(`✅ Response: ${response.status}`);
  console.log('Data:', response.data);
  
  // Parse set-cookie headers
  const setCookieHeaders = response.headers['set-cookie'];
  if (setCookieHeaders) {
    console.log('Set-Cookie headers:', setCookieHeaders);
    setCookieHeaders.forEach(cookieStr => {
      const [cookie] = cookieStr.split(';');
      const [key, value] = cookie.split('=');
      cookies[key] = value;
    });
    console.log('Updated cookies:', cookies);
  }
  
  return response;
}, (error) => {
  console.error(`❌ Error: ${error.response?.status || error.code}`);
  console.error('Error data:', error.response?.data || error.message);
  throw error;
});

async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow');
  console.log('================================');
  console.log('API URL:', API_URL);
  console.log('Test email:', testEmail);
  
  try {
    // Step 1: Register a new user
    console.log('\n📝 Step 1: Registering new user...');
    const registerResponse = await axiosInstance.post('/auth/register', {
      email: testEmail,
      password: testPassword,
      name: testName,
    });
    
    console.log('Registration successful!');
    console.log('Has cookies after register:', Object.keys(cookies).length > 0);
    
    // Step 2: Verify authentication with /auth/me
    console.log('\n🔍 Step 2: Verifying authentication...');
    try {
      const meResponse = await axiosInstance.get('/auth/me');
      console.log('Authentication verified!');
      console.log('User data:', meResponse.data);
    } catch (meError) {
      console.error('Failed to verify authentication after registration');
      console.log('Current cookies:', cookies);
    }
    
    // Step 3: Logout
    console.log('\n🚪 Step 3: Logging out...');
    await axiosInstance.post('/auth/logout');
    console.log('Logged out successfully');
    
    // Clear cookies
    cookies = {};
    
    // Step 4: Login with the same credentials
    console.log('\n🔐 Step 4: Logging in...');
    const loginResponse = await axiosInstance.post('/auth/login', {
      email: testEmail,
      password: testPassword,
    });
    
    console.log('Login successful!');
    console.log('Has cookies after login:', Object.keys(cookies).length > 0);
    
    // Step 5: Verify authentication again
    console.log('\n🔍 Step 5: Verifying authentication after login...');
    const meResponse2 = await axiosInstance.get('/auth/me');
    console.log('Authentication verified after login!');
    console.log('User data:', meResponse2.data);
    
    console.log('\n✅ All tests passed!');
    console.log('Final cookies:', cookies);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testAuthFlow();