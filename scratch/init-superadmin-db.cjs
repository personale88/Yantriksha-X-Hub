const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function run() {
  console.log("Starting database initialization for Super Admin Portal...");

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

  console.log("✓ Connected to TiDB database.");

  // Disable foreign key checks momentarily
  await connection.query('SET FOREIGN_KEY_CHECKS = 0;');

  // 1. Add status column to users if not exists
  const [columns] = await connection.query("SHOW COLUMNS FROM users;");
  const columnNames = columns.map(c => c.Field);
  
  if (!columnNames.includes('status')) {
    console.log("Adding column 'status' to table 'users'...");
    await connection.query("ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active';");
  }

  // 2. Create CLUBS table
  console.log("Creating table 'clubs'...");
  await connection.query(`
    CREATE TABLE IF NOT EXISTS clubs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      category VARCHAR(50),
      admin_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB;
  `);

  // 3. Create CLUB_MEMBERS table
  console.log("Creating table 'club_members'...");
  await connection.query(`
    CREATE TABLE IF NOT EXISTS club_members (
      id INT AUTO_INCREMENT PRIMARY KEY,
      club_id INT NOT NULL,
      user_id INT NOT NULL,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_club_mem (club_id, user_id),
      FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  // 4. Create EVENTS table
  console.log("Creating table 'events'...");
  await connection.query(`
    CREATE TABLE IF NOT EXISTS events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      category VARCHAR(50),
      event_date DATETIME NOT NULL,
      status VARCHAR(20) DEFAULT 'upcoming',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // 5. Create EVENT_REGISTRATIONS table
  console.log("Creating table 'event_registrations'...");
  await connection.query(`
    CREATE TABLE IF NOT EXISTS event_registrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      user_id INT NOT NULL,
      registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_event_reg (event_id, user_id),
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  // 6. Create ACTIVITY_LOGS table
  console.log("Creating table 'activity_logs'...");
  await connection.query(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      user_name VARCHAR(100),
      user_role VARCHAR(50),
      email VARCHAR(100),
      action_performed VARCHAR(255) NOT NULL,
      module VARCHAR(100) NOT NULL,
      status VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB;
  `);

  // 7. Create AUDIT_LOGS table
  console.log("Creating table 'audit_logs'...");
  await connection.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      action_by VARCHAR(100) NOT NULL,
      action_description TEXT NOT NULL,
      status VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // 8. Create ANNOUNCEMENTS table
  console.log("Creating table 'announcements'...");
  await connection.query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      is_pinned BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // Enable foreign key checks
  await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
  console.log("✓ All Super Admin tables successfully verified/created.");

  // 9. Seed Super Admin User (Vignesh)
  const saEmail = 'vtu28891@veltech.edu.in';
  const saName = 'Vignesh';
  const saId = 'VTU28891';
  const saPasswordPlain = 'Viggu14321@';

  console.log(`Checking if Super Admin '${saEmail}' already exists...`);
  const [existing] = await connection.query("SELECT id FROM users WHERE email = ?;", [saEmail]);

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(saPasswordPlain, salt);

  if (existing.length > 0) {
    console.log("Super Admin already exists. Updating password and role to admin...");
    await connection.query(
      "UPDATE users SET password_hash = ?, role = 'admin', name = ?, veltech_id = ? WHERE email = ?;",
      [passwordHash, saName, saId, saEmail]
    );
  } else {
    console.log("Creating default Super Admin user...");
    await connection.query(
      `INSERT INTO users (veltech_id, name, email, role, discipline, password_hash, status) 
       VALUES (?, ?, ?, 'admin', 'engineering', ?, 'active');`,
      [saId, saName, saEmail, passwordHash]
    );
  }

  console.log("✓ Super Admin user seeded successfully!");

  await connection.end();
  console.log("Database setup complete!");
}

run().catch(console.error);
