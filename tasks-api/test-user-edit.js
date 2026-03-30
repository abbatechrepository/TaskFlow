const http = require('http');

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: '127.0.0.1',
      port: 3001,
      path: `/api${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        console.log(`[${method} /api${path}] Status: ${res.statusCode}`);
        try { console.log(JSON.stringify(JSON.parse(responseData), null, 2)); }
        catch { console.log(responseData); }
        resolve({ status: res.statusCode, data: responseData });
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  // 1. Login
  const loginRes = await request('POST', '/auth/login', { login: 'felipe', password: 'admin123' });
  const { access_token } = JSON.parse(loginRes.data);
  if (!access_token) { console.error('LOGIN FAILED'); return; }
  console.log('\n✅ Login OK\n');

  // 2. Get users
  const usersRes = await request('GET', '/users', {}, access_token);
  const users = JSON.parse(usersRes.data);
  const testUser = users[0];
  console.log(`\n📋 First user: ${JSON.stringify(testUser)}\n`);

  // 3. Try PATCH on first user
  const patchPayload = {
    name: testUser.name,
    username: testUser.username,
    email: testUser.email,
    password: '',
    roles: testUser.roles.map(r => r.role.id),
  };
  console.log('📤 PATCH payload:', JSON.stringify(patchPayload));
  await request('PATCH', `/users/${testUser.id}`, patchPayload, access_token);
}

main().catch(console.error);
