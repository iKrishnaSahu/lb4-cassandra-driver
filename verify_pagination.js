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
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data ? JSON.parse(data) : null);
        } else {
          reject(new Error(`Request failed with status ${res.statusCode}: ${data}`));
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

async function run() {
  console.log('--- Starting Pagination Verification ---');

  // 1. Create users
  console.log('Creating 10 test users...');
  for (let i = 0; i < 10; i++) {
    await request('POST', '/users', {
      name: `User ${i}`,
      email: `user${i}@example.com`,
      age: 20 + i,
    });
  }
  console.log('Users created.');

  // 2. Fetch first page
  console.log('Fetching first page (limit=3)...');
  const page1 = await request('GET', '/users?limit=3');
  console.log(`Page 1 returned ${page1.users.length} users.`);
  console.log('Page 1 Next Page State:', page1.nextPageState);

  if (!page1.nextPageState) {
    console.error('ERROR: No pageState returned for page 1');
    return;
  }

  // 3. Fetch second page
  console.log('Fetching second page (limit=3)...');
  const page2 = await request('GET', `/users?limit=3&pageState=${encodeURIComponent(page1.nextPageState)}`);
  console.log(`Page 2 returned ${page2.users.length} users.`);
  console.log('Page 2 Next Page State:', page2.nextPageState);

  // 4. Verify users are different
  const ids1 = page1.users.map(u => u.id);
  const ids2 = page2.users.map(u => u.id);
  const intersection = ids1.filter(id => ids2.includes(id));

  if (intersection.length > 0) {
    console.error('ERROR: Duplicate users found between pages:', intersection);
  } else {
    console.log('SUCCESS: Users in page 1 and page 2 are distinct.');
  }

  // 5. Check if we can continue
  if (page2.nextPageState) {
    console.log('Fetching third page...');
    const page3 = await request('GET', `/users?limit=3&pageState=${encodeURIComponent(page2.nextPageState)}`);
    console.log(`Page 3 returned ${page3.users.length} users.`);
  }

  console.log('--- Verification Complete ---');
}

run().catch(console.error);
