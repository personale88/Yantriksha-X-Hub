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

  const [columns] = await connection.query("SHOW COLUMNS FROM users;");
  const columnNames = columns.map(c => c.Field);

  if (!columnNames.includes('phone_number')) {
    console.log("Adding column 'phone_number'...");
    await connection.query("ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);");
  }

  if (!columnNames.includes('year_of_studying')) {
    console.log("Adding column 'year_of_studying'...");
    await connection.query("ALTER TABLE users ADD COLUMN year_of_studying INT;");
  }

  if (!columnNames.includes('branch')) {
    console.log("Adding column 'branch'...");
    await connection.query("ALTER TABLE users ADD COLUMN branch VARCHAR(100);");
  }

  console.log("✓ Database fields successfully checked and added.");
  await connection.end();
}

run().catch(console.error);
