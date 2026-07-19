const assert = require('assert');

async function runTests() {
  const baseUrl = 'http://localhost:3000/api/auth';
  const testId = `vtu_${Math.floor(Math.random() * 100000)}`;
  const testEmail = `${testId}@veltech.edu.in`;

  console.log(`Starting authentication endpoint tests...`);
  console.log(`Using test email: ${testEmail}`);

  // Test 1: Register with invalid email domain
  try {
    console.log('\n[Test 1] Registering with non-college email...');
    const res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        veltech_id: testId,
        name: 'Test User',
        email: 'bademail@gmail.com',
        role: 'student',
        discipline: 'engineering',
        password: 'securepassword123'
      })
    });
    const data = await res.json();
    console.log(`Response Status: ${res.status}`);
    console.log(`Response Data:`, data);
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    console.log('✓ Test 1 Passed: Invalid email domains are successfully blocked.');
  } catch (err) {
    console.error('✗ Test 1 Failed:', err);
    process.exit(1);
  }

  // Test 2: Register with valid email domain
  try {
    console.log('\n[Test 2] Registering with valid college email...');
    const res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        veltech_id: testId,
        name: 'Test User',
        email: testEmail,
        role: 'student',
        discipline: 'engineering',
        password: 'securepassword123'
      })
    });
    const data = await res.json();
    console.log(`Response Status: ${res.status}`);
    console.log(`Response Data:`, data);
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    console.log('✓ Test 2 Passed: Registration successful with valid parameters.');
  } catch (err) {
    console.error('✗ Test 2 Failed:', err);
    process.exit(1);
  }

  // Test 3: Register duplicate user
  try {
    console.log('\n[Test 3] Registering duplicate user...');
    const res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        veltech_id: testId,
        name: 'Duplicate User',
        email: testEmail,
        role: 'student',
        discipline: 'engineering',
        password: 'securepassword123'
      })
    });
    const data = await res.json();
    console.log(`Response Status: ${res.status}`);
    console.log(`Response Data:`, data);
    assert.strictEqual(res.status, 409);
    assert.strictEqual(data.success, false);
    console.log('✓ Test 3 Passed: Duplicate registration correctly rejected.');
  } catch (err) {
    console.error('✗ Test 3 Failed:', err);
    process.exit(1);
  }

  // Test 4: Login with invalid password
  try {
    console.log('\n[Test 4] Logging in with wrong password...');
    const res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'wrongpassword'
      })
    });
    const data = await res.json();
    console.log(`Response Status: ${res.status}`);
    console.log(`Response Data:`, data);
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
    console.log('✓ Test 4 Passed: Login with wrong password rejected.');
  } catch (err) {
    console.error('✗ Test 4 Failed:', err);
    process.exit(1);
  }

  // Test 5: Login with correct password
  try {
    console.log('\n[Test 5] Logging in with correct password...');
    const res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'securepassword123'
      })
    });
    const data = await res.json();
    console.log(`Response Status: ${res.status}`);
    console.log(`Response Data:`, data);
    
    // Check if cookie header is returned
    const cookieHeader = res.headers.get('set-cookie');
    console.log(`Set-Cookie Header:`, cookieHeader);
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(cookieHeader && cookieHeader.includes('token='));
    console.log('✓ Test 5 Passed: Login successful and JWT cookie received.');
  } catch (err) {
    console.error('✗ Test 5 Failed:', err);
    process.exit(1);
  }

  console.log('\n======================================');
  console.log('🎉 ALL AUTH ENDPOINT TESTS PASSED!');
  console.log('======================================\n');
}

runTests();
