const http = require('http');

async function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`[${method} ${path}] Status: ${res.statusCode}`);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = data ? JSON.parse(data) : null;
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            // For empty 204 responses or non-json
            resolve({ status: res.statusCode, body: data });
          }
        } else {
          try {
            // Try to parse error body
            const errBody = JSON.parse(data);
            reject(new Error(`Request failed with status ${res.statusCode}: ${JSON.stringify(errBody)}`));
          } catch (e) {
            reject(new Error(`Request failed with status ${res.statusCode}: ${data}`));
          }
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
  console.log(`PASS: ${message}`);
}

async function run() {
  console.log('=== Starting Comprehensive API Verification ===\n');

  try {
    // 1. Verify Ping
    console.log('--- Testing Ping Controller ---');
    const pingRes = await request('GET', '/ping');
    assert(pingRes.body.greeting === 'Hello from LoopBack', 'Ping returns greeting');

    // 2. User CRUD
    console.log('\n--- Testing User Controller ---');

    // 2.1 Create User
    console.log('Creating a new user...');
    const userPayload = {
      name: 'Test User 1',
      email: 'test1@example.com',
      age: 30
    };
    const createRes = await request('POST', '/users', userPayload);
    const userId = createRes.body.id;
    assert(userId, 'User created and has ID');
    assert(createRes.body.name === userPayload.name, 'User name matches');

    // 2.2 Get User by ID
    console.log(`Fetching user ${userId}...`);
    const getRes = await request('GET', `/users/${userId}`);
    assert(getRes.body.id === userId, 'Fetched user ID matches');
    assert(getRes.body.email === userPayload.email, 'Fetched user email matches');

    // 2.3 Update User
    console.log(`Updating user ${userId}...`);
    const updatePayload = { age: 31 };
    await request('PATCH', `/users/${userId}`, updatePayload);

    // Verify update
    const verifyUpdateRes = await request('GET', `/users/${userId}`);
    assert(verifyUpdateRes.body.age === 31, 'User age updated correctly');
    assert(verifyUpdateRes.body.name === userPayload.name, 'User name remains unchanged');

    // 2.4 Count Users
    console.log('Counting users...');
    const countRes = await request('GET', '/users/count');
    const count = countRes.body.count;
    console.log(`Current user count: ${count}`);
    assert(typeof count === 'number', 'Count returns a number');
    assert(count > 0, 'Count is greater than 0');

    // 2.5 List Users (Pagination)
    console.log('Listing users (limit=2)...');
    const listRes = await request('GET', '/users?limit=2');
    assert(Array.isArray(listRes.body.users), 'Response contains users array');
    assert(listRes.body.users.length <= 2, 'Limit respected');
    if (listRes.body.users.length > 0) {
      assert(listRes.body.nextPageState !== undefined, 'Next page state returned (if applicable)');
    }

    // 2.6 Delete User
    console.log(`Deleting user ${userId}...`);
    await request('DELETE', `/users/${userId}`);

    // Verify deletion
    try {
      await request('GET', `/users/${userId}`);
      throw new Error('User should have been deleted');
    } catch (e) {
      assert(e.message.includes('404'), 'User not found after deletion');
    }

    console.log('\n=== All Tests Passed Successfully ===');

  } catch (error) {
    console.error('\nFAILED:', error.message);
    process.exit(1);
  }
}

run();
