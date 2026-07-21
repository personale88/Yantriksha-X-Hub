import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;
let initPromise: Promise<void> | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    const requiredEnv = ['TIDB_HOST', 'TIDB_USER', 'TIDB_PASSWORD', 'TIDB_DATABASE'];
    const missing = requiredEnv.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing database configuration environment variables: ${missing.join(', ')}`);
    }

    pool = mysql.createPool({
      host: process.env.TIDB_HOST,
      port: parseInt(process.env.TIDB_PORT || '4000', 10),
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE,
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      },
      connectionLimit: 5,
      maxIdle: 5,
      idleTimeout: 60000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
    
    // Asynchronously ensure database tables exist on startup
    initPromise = ensureEmailSystemTables(pool);
  }
  return pool;
}

async function ensureEmailSystemTables(p: mysql.Pool) {
  try {
    const connection = await p.getConnection();
    try {
      console.log("[DB] Programmatically verifying email system tables...");
      
      // 1. Create notification_preferences table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS notification_preferences (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT UNIQUE NOT NULL,
          club_updates BOOLEAN DEFAULT TRUE,
          event_notifications BOOLEAN DEFAULT TRUE,
          general_announcements BOOLEAN DEFAULT TRUE,
          newsletter BOOLEAN DEFAULT TRUE,
          recruitment_notifications BOOLEAN DEFAULT TRUE,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
      `);
      
      // 2. Create email_logs table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS email_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          recipient_email VARCHAR(100) NOT NULL,
          subject VARCHAR(200) NOT NULL,
          body_html LONGTEXT NOT NULL,
          status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
          attempts INT DEFAULT 0,
          last_error TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `);

      // 3. Create reminder_logs table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS reminder_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          event_id INT NOT NULL,
          user_id INT NOT NULL,
          interval_type VARCHAR(20) NOT NULL,
          sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_reminder (event_id, user_id, interval_type),
          FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
      `);

      // 3b. Create contact_messages table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS contact_messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL,
          subject VARCHAR(200) NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `);

      // 3c. Create feedback_submissions table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS feedback_submissions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NULL,
          category VARCHAR(50) NOT NULL,
          feedback TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB;
      `);

      // 3d. Create reported_issues table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS reported_issues (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NULL,
          title VARCHAR(200) NOT NULL,
          description TEXT NOT NULL,
          severity VARCHAR(20) DEFAULT 'medium',
          status VARCHAR(20) DEFAULT 'open',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB;
      `);

      // 4. Alter users table for reset token
      const [columns]: any = await connection.query("SHOW COLUMNS FROM users;");
      const columnNames = columns.map((c: any) => c.Field);
      
      if (!columnNames.includes('reset_token')) {
        console.log("[DB] Adding reset_token to users table...");
        await connection.query("ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL;");
      }
      if (!columnNames.includes('reset_token_expires')) {
        console.log("[DB] Adding reset_token_expires to users table...");
        await connection.query("ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP NULL;");
      }

      console.log("[DB] Email system tables and columns successfully verified.");
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("[DB] Error initializing email system tables:", err);
  }
}

/**
 * Execute a parameterized query.
 * Enforces parameterization to prevent SQL injection.
 */
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const connectionPool = getPool();
  if (initPromise) {
    await initPromise;
  }
  const [rows] = await connectionPool.execute(sql, params);
  return rows as T;
}
