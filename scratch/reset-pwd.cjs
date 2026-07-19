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

  const newPassword = 'vignesh123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);

  console.log(`Generated hash for "${newPassword}":`, hash);

  const [result] = await connection.query(
    "UPDATE users SET password_hash = ? WHERE email = 'vtu28891@veltech.edu.in';",
    [hash]
  );

  if (result.affectedRows > 0) {
    console.log("✓ Password successfully reset to 'vignesh123'!");
  } else {
    console.log("User not found.");
  }

  await connection.end();
}

run().catch(console.error);
