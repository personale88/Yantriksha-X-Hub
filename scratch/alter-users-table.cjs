const mysql = require('mysql2/promise');
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
  console.log("Connected to TiDB.");
  
  // Check if column exists
  const [columns] = await connection.query("SHOW COLUMNS FROM users LIKE 'password_hash';");
  if (columns.length > 0) {
    console.log("Column 'password_hash' already exists.");
  } else {
    console.log("Adding column 'password_hash'...");
    await connection.query("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NOT NULL;");
    console.log("✓ Column 'password_hash' added successfully!");
  }
  
  await connection.end();
}

run().catch(console.error);
