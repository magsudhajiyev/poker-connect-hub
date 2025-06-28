const axios = require('axios');

const API_URL = 'http://localhost:3001';

// Generate a unique email for testing
const testEmail = `test${Date.now()}@example.com`;
const testPassword = 'password123';
const testName = 'Test User';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

function logSuccess(message) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}✗ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.yellow}ℹ ${message}${colors.reset}`);
}

async function testRegistration() {
  logInfo('Testing Registration...');

  try {
    // Test 1: Register new user
    const response = await axios.post(
      `${API_URL}/auth/register`,
      {
        email: testEmail,
        password: testPassword,
        name: testName,
      },
      {
        withCredentials: true,
        validateStatus: () => true, // Don't throw on any status
      },
    );

    if (response.status === 201 && response.data.success) {
      logSuccess(`Registration successful for ${testEmail}`);
      logInfo(`Response: ${JSON.stringify(response.data)}`);

      // Check cookies
      const cookies = response.headers['set-cookie'];
      if (cookies && cookies.length > 0) {
        logSuccess('Cookies were set');
      } else {
        logError('No cookies were set');
      }

      return true;
    } else {
      logError(`Registration failed: ${response.status} - ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    logError(`Registration error: ${error.message}`);
    return false;
  }
}

async function testDuplicateRegistration() {
  logInfo('Testing Duplicate Registration...');

  try {
    const response = await axios.post(
      `${API_URL}/auth/register`,
      {
        email: testEmail,
        password: testPassword,
        name: testName,
      },
      {
        withCredentials: true,
        validateStatus: () => true,
      },
    );

    if (response.status === 409) {
      logSuccess('Duplicate registration correctly rejected');
      logInfo(`Response: ${JSON.stringify(response.data)}`);
      return true;
    } else {
      logError(`Expected 409 but got ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Duplicate registration test error: ${error.message}`);
    return false;
  }
}

async function testLogin() {
  logInfo('Testing Login...');

  try {
    const response = await axios.post(
      `${API_URL}/auth/login`,
      {
        email: testEmail,
        password: testPassword,
      },
      {
        withCredentials: true,
        validateStatus: () => true,
      },
    );

    if (response.status === 200 && response.data.success) {
      logSuccess('Login successful');
      logInfo(`Response: ${JSON.stringify(response.data)}`);

      // Check cookies
      const cookies = response.headers['set-cookie'];
      if (cookies && cookies.length > 0) {
        logSuccess('Login cookies were set');
      } else {
        logError('No login cookies were set');
      }

      return true;
    } else {
      logError(`Login failed: ${response.status} - ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    logError(`Login error: ${error.message}`);
    return false;
  }
}

async function testInvalidLogin() {
  logInfo('Testing Invalid Login...');

  try {
    const response = await axios.post(
      `${API_URL}/auth/login`,
      {
        email: testEmail,
        password: 'wrongpassword',
      },
      {
        withCredentials: true,
        validateStatus: () => true,
      },
    );

    if (response.status === 401) {
      logSuccess('Invalid login correctly rejected');
      logInfo(`Response: ${JSON.stringify(response.data)}`);
      return true;
    } else {
      logError(`Expected 401 but got ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Invalid login test error: ${error.message}`);
    return false;
  }
}

async function testPasswordValidation() {
  logInfo('Testing Password Validation...');

  try {
    // Test too short password
    const response = await axios.post(
      `${API_URL}/auth/register`,
      {
        email: `short${Date.now()}@example.com`,
        password: '12345', // Only 5 characters
        name: 'Test User',
      },
      {
        withCredentials: true,
        validateStatus: () => true,
      },
    );

    if (response.status === 400) {
      logSuccess('Short password correctly rejected');
      logInfo(`Response: ${JSON.stringify(response.data)}`);
      return true;
    } else {
      logError(`Expected 400 for short password but got ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Password validation test error: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('\n🧪 Starting Authentication Flow Tests\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Registration
  if (await testRegistration()) passed++;
  else failed++;
  console.log();

  // Test 2: Duplicate Registration
  if (await testDuplicateRegistration()) passed++;
  else failed++;
  console.log();

  // Test 3: Login
  if (await testLogin()) passed++;
  else failed++;
  console.log();

  // Test 4: Invalid Login
  if (await testInvalidLogin()) passed++;
  else failed++;
  console.log();

  // Test 5: Password Validation
  if (await testPasswordValidation()) passed++;
  else failed++;
  console.log();

  // Summary
  console.log('📊 Test Summary:');
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Total: ${passed + failed}\n`);

  if (failed === 0) {
    console.log(`${colors.green}✨ All tests passed!${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Some tests failed${colors.reset}`);
    process.exit(1);
  }
}

// Run the tests
runAllTests().catch((error) => {
  console.error('Test runner error:', error);
  process.exit(1);
});
