const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function run() {
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

  const [rows] = await connection.query("SELECT password_hash FROM users WHERE email = 'vtu28891@veltech.edu.in';");
  if (rows.length > 0) {
    const hash = rows[0].password_hash;
    console.log("Current Hash in DB:", hash);
    
    // Test common password inputs
    const testPasswords = ['vignesh', 'Vignesh', 'vignesh123', 'VTU28891', 'vtu28891', '12345678', '1234567890'];
    for (const pwd of testPasswords) {
      const match = await bcrypt.compare(pwd, hash);
      if (match) {
        console.log(`✓ Match found! The password is: "${pwd}"`);
      }
    }
  } else {
    console.log("User not found.");
  }

  await connection.end();
}

run().catch(console.error);
