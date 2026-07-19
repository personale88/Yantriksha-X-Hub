const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  console.log("Starting Yantriksha X Hub TiDB schema initialization...");
  console.log("Host:", process.env.TIDB_HOST);
  console.log("User:", process.env.TIDB_USER);
  console.log("Database:", process.env.TIDB_DATABASE);

  let connection;

  try {
    connection = await mysql.createConnection({
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

    console.log("✓ Connected to TiDB database successfully.");

    // Disable foreign key checks momentarily to avoid dependency drop/creation lock issues
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');

    // 1. Table: users
    console.log("Creating table 'users'...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        veltech_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        role ENUM('student', 'faculty', 'mentor', 'admin') NOT NULL,
        discipline ENUM('engineering', 'law', 'business', 'other') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    console.log("✓ Table 'users' created.");

    // 2. Table: teams
    console.log("Creating table 'teams'...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        team_name VARCHAR(100) UNIQUE NOT NULL,
        sector VARCHAR(100) NOT NULL,
        leader_id INT NOT NULL,
        current_stage INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log("✓ Table 'teams' created.");

    // 3. Table: team_members
    console.log("Creating table 'team_members'...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        team_id INT NOT NULL,
        user_id INT NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_membership (team_id, user_id),
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log("✓ Table 'team_members' created.");

    // 4. Table: progress_reports
    console.log("Creating table 'progress_reports'...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS progress_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        team_id INT NOT NULL,
        submitted_by INT NOT NULL,
        milestone_step INT NOT NULL,
        report_content TEXT NOT NULL,
        file_url VARCHAR(255),
        mentor_feedback TEXT,
        status ENUM('pending', 'approved', 'revision_requested') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log("✓ Table 'progress_reports' created.");

    // 5. Table: funding_requests
    console.log("Creating table 'funding_requests'...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS funding_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        team_id INT NOT NULL,
        requested_amount DECIMAL(10, 2) NOT NULL,
        itemized_budget JSON NOT NULL,
        status ENUM('pending_advisor', 'pending_treasurer', 'approved', 'disbursed', 'rejected') DEFAULT 'pending_advisor',
        receipts_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log("✓ Table 'funding_requests' created.");

    // 6. Table: bookings
    console.log("Creating table 'bookings'...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        team_id INT NOT NULL,
        mentor_id INT NOT NULL,
        scheduled_time DATETIME NOT NULL,
        mode ENUM('virtual', 'offline') NOT NULL,
        meeting_link_or_venue VARCHAR(255),
        status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log("✓ Table 'bookings' created.");

    // 7. Table: podcast_qa
    console.log("Creating table 'podcast_qa'...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS podcast_qa (
        id INT AUTO_INCREMENT PRIMARY KEY,
        submitter_name VARCHAR(100) NOT NULL,
        sector_interest VARCHAR(100) NOT NULL,
        question_text TEXT NOT NULL,
        status ENUM('submitted', 'reviewed', 'answered') DEFAULT 'submitted',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    console.log("✓ Table 'podcast_qa' created.");

    // Enable foreign key checks back
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

    console.log("\n🚀 All tables initialized successfully in your TiDB Serverless instance!");

  } catch (err) {
    console.error("❌ Schema initialization failed!");
    console.error(err);
  } finally {
    if (connection) {
      await connection.end();
      console.log("✓ Connection closed.");
    }
  }
}

initializeDatabase();
