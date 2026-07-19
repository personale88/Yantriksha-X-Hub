const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  console.log("Starting TiDB connection test...");
  console.log("Host:", process.env.TIDB_HOST);
  console.log("User:", process.env.TIDB_USER);
  console.log("Database:", process.env.TIDB_DATABASE);

  try {
    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      port: parseInt(process.env.TIDB_PORT || '4000', 10),
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      }
    });

    console.log("✓ Connection created successfully!");
    
    const [rows] = await connection.query('SELECT NOW() as currentTime, VERSION() as dbVersion;');
    console.log("✓ Query executed successfully!");
    console.log("Database Time:", rows[0].currentTime);
    console.log("Database Version:", rows[0].dbVersion);

    await connection.end();
    console.log("✓ Connection closed successfully.");
  } catch (err) {
    console.error("❌ Connection failed!");
    console.error(err);
  }
}

testConnection();
