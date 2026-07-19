const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
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

  const [rows] = await connection.query("SELECT id, veltech_id, name, email, phone_number, branch, year_of_studying FROM users WHERE email = 'vtu28891@veltech.edu.in';");
  console.log("Matching Users:");
  console.log(rows);
  
  const [allUsers] = await connection.query("SELECT id, veltech_id, email, name FROM users ORDER BY id DESC LIMIT 5;");
  console.log("\nLast 5 registered users:");
  console.log(allUsers);

  await connection.end();
}

check().catch(console.error);
