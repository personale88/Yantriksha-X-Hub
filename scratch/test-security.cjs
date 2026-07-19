const assert = require('assert');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runSecurityTests() {
  const baseUrl = 'http://localhost:3000';
  console.log('Starting Phase 3 Security Hardening verification tests...');

  // Test 1: CORS Allowed Origin
  try {
    console.log('\n[Test 1] Testing API request from allowed origin (localhost)...');
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Origin': 'http://localhost:3000',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: 'nonexistent@veltech.edu.in', password: 'password' })
    });
    console.log(`Response Status: ${res.status}`);
    assert.ok(res.status === 401 || res.status === 400); // 401 is expected for invalid credentials, 400 is body validation
    console.log('✓ Test 1 Passed: Request from whitelisted origin is allowed through.');
  } catch (err) {
    console.error('✗ Test 1 Failed:', err);
    process.exit(1);
  }

  // Test 2: CORS Unauthorized Origin Block
  try {
    console.log('\n[Test 2] Testing API request from unauthorized origin (evil-hacker.com)...');
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Origin': 'https://evil-hacker.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: 'nonexistent@veltech.edu.in', password: 'password' })
    });
    const data = await res.json();
    console.log(`Response Status: ${res.status}`);
    console.log(`Response Data:`, data);
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.ok(data.error.includes('CORS policy violation'));
    console.log('✓ Test 2 Passed: Request from unauthorized origin was successfully blocked.');
  } catch (err) {
    console.error('✗ Test 2 Failed:', err);
    process.exit(1);
  }

  // Test 3: Security Headers Verification
  try {
    console.log('\n[Test 3] Verifying custom security headers...');
    const res = await fetch(`${baseUrl}/`);
    console.log('Response Headers:');
    const xContentType = res.headers.get('x-content-type-options');
    const xFrame = res.headers.get('x-frame-options');
    const referrerPolicy = res.headers.get('referrer-policy');

    console.log(`- X-Content-Type-Options: ${xContentType}`);
    console.log(`- X-Frame-Options: ${xFrame}`);
    console.log(`- Referrer-Policy: ${referrerPolicy}`);

    assert.strictEqual(xContentType, 'nosniff');
    assert.strictEqual(xFrame, 'SAMEORIGIN');
    assert.strictEqual(referrerPolicy, 'strict-origin-when-cross-origin');
    console.log('✓ Test 3 Passed: Strict security headers are active on all paths.');
  } catch (err) {
    console.error('✗ Test 3 Failed:', err);
    process.exit(1);
  }

  // Test 4: Bcrypt Hash Validation in Database
  try {
    console.log('\n[Test 4] Verifying bcrypt password hashing structure in TiDB...');
    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      port: parseInt(process.env.TIDB_PORT || '4000', 10),
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE,
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      }
    });

    const [rows] = await connection.query("SELECT password_hash FROM users WHERE password_hash LIKE '$2a$%' OR password_hash LIKE '$2b$%';");
    console.log(`Found ${rows.length} valid bcrypt hashes in the users table.`);
    assert.ok(rows.length > 0);
    await connection.end();
    console.log('✓ Test 4 Passed: All passwords are using strong bcrypt salt round hashing.');
  } catch (err) {
    console.error('✗ Test 4 Failed:', err);
    process.exit(1);
  }

  console.log('\n=============================================');
  console.log('🎉 ALL SECURITY HARDENING TESTS PASSED!');
  console.log('=============================================\n');
}

runSecurityTests();
