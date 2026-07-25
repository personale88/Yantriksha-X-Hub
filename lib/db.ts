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

      // 3e. Create innovation_journey table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS innovation_journey (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT UNIQUE NOT NULL,
          current_stage VARCHAR(50) DEFAULT 'Stage -1: Confusion',
          current_milestone VARCHAR(50) DEFAULT 'stg_-1_prob_disc',
          overall_progress DECIMAL(5,2) DEFAULT 0.00,
          innovation_score INT DEFAULT 0,
          readiness_score INT DEFAULT 0,
          is_frozen BOOLEAN DEFAULT FALSE,
          assigned_reviewer_id INT NULL,
          assigned_mentor_id INT NULL,
          review_deadline DATETIME NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
      `);

      // 3f. Create innovation_milestone_progress table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS innovation_milestone_progress (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          milestone_key VARCHAR(50) NOT NULL,
          status VARCHAR(50) DEFAULT 'locked',
          started_at TIMESTAMP NULL,
          completed_at TIMESTAMP NULL,
          attempt_number INT DEFAULT 1,
          time_taken INT DEFAULT 0,
          reviewer_name VARCHAR(100) NULL,
          review_date TIMESTAMP NULL,
          review_comments TEXT NULL,
          required_corrections TEXT NULL,
          acknowledged BOOLEAN DEFAULT FALSE,
          UNIQUE KEY unique_user_milestone (user_id, milestone_key),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
      `);

      // 3g. Create innovation_reviews table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS innovation_reviews (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          milestone_key VARCHAR(50) NOT NULL,
          reviewer_name VARCHAR(100) NOT NULL,
          status VARCHAR(50) NOT NULL,
          comments TEXT NULL,
          required_corrections TEXT NULL,
          attempt_number INT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
      `);

      // 3h. Create innovation_notifications table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS innovation_notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(50) NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
      `);

      // 3i. Create reports_sent_log table to track periodic admin reports
      await connection.query(`
        CREATE TABLE IF NOT EXISTS reports_sent_log (
          id INT AUTO_INCREMENT PRIMARY KEY,
          report_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', '6months', '12months'
          sent_to VARCHAR(500) NOT NULL,
          summary TEXT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `);

      // 3j. Create email_verification_tokens table to track student registration confirmation links
      await connection.query(`
        CREATE TABLE IF NOT EXISTS email_verification_tokens (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(100) NOT NULL,
          token VARCHAR(64) UNIQUE NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `);

      // 3k. Create core_roles table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS core_roles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL,
          description TEXT NULL,
          permissions JSON NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `);

      // Seed official Yantriksha X Hub roles & responsibilities
      const defaultRoles = [
        { 
          name: 'President & Executive Leadership', 
          desc: 'Leads overall vision, strategic direction, approves major initiatives, and represents Yantriksha X Hub in partnerships.', 
          perms: { projects: ['view', 'create', 'edit', 'delete', 'assign'], software: ['view', 'edit', 'approve', 'reject', 'manage'], documentation: ['view', 'edit', 'approve', 'reject', 'download'], finance: ['view', 'create', 'approve', 'reject', 'export'], patent: ['view', 'create', 'edit', 'approve', 'manage'], events: ['view', 'create', 'edit', 'delete', 'manage'], users: ['view', 'create', 'edit', 'delete', 'manage'] } 
        },
        { 
          name: 'Secretary', 
          desc: 'Maintains official records, reports, prepares agendas, records minutes, and tracks action items & timelines.', 
          perms: { documentation: ['view', 'edit', 'approve', 'reject', 'download'], projects: ['view'], events: ['view'], users: ['view'] } 
        },
        { 
          name: 'Deputy Secretary & Student Administration Head', 
          desc: 'Manages student registrations, central database, member onboarding, and workshop/event registrations.', 
          perms: { users: ['view', 'create', 'edit', 'manage'], events: ['view', 'edit'], documentation: ['view'] } 
        },
        { 
          name: 'Head of Products and Innovations (SOC, SOEC, SOMC, SOM, SOL)', 
          desc: 'Evaluates project ideas across schools, guides technical research, prototype design, and implementation.', 
          perms: { projects: ['view', 'create', 'edit', 'assign'], software: ['view', 'edit', 'approve', 'manage'], documentation: ['view', 'approve'] } 
        },
        { 
          name: 'Head of Quality', 
          desc: 'Establishes quality standards, evaluates project deliverables/prototypes, and conducts quality audits.', 
          perms: { projects: ['view'], documentation: ['view', 'edit', 'approve', 'reject', 'download'], software: ['view', 'approve'] } 
        },
        { 
          name: 'Deputy of Products and Innovations (SOC, SOEC, SOMC, SOM, SOL)', 
          desc: 'Assists in reviewing and tracking student projects, documentation support, and progress update records.', 
          perms: { projects: ['view', 'edit'], software: ['view'], documentation: ['view', 'edit'] } 
        },
        { 
          name: 'Deputy of Quality', 
          desc: 'Assists in verifying documentation and report submissions for completeness and quality recommendations.', 
          perms: { projects: ['view'], documentation: ['view', 'edit'], software: ['view'] } 
        },
        { 
          name: 'Head of Industry, Alumni and Partnerships', 
          desc: 'Establishes collaborations with industries, alumni, and research organizations; connects students with mentors.', 
          perms: { projects: ['view'], events: ['view', 'create', 'edit'], users: ['view'] } 
        },
        { 
          name: 'Deputy of Industry, Alumni and Partnerships', 
          desc: 'Assists in maintaining industry and alumni relationships, partnership records, and meeting follow-ups.', 
          perms: { projects: ['view'], events: ['view'], users: ['view'] } 
        },
        { 
          name: 'Head of Marketing and Branding', 
          desc: 'Develops branding strategies, manages social media campaigns, promotional materials, and event publicity.', 
          perms: { events: ['view', 'edit'], projects: ['view'], documentation: ['view'] } 
        },
        { 
          name: 'Deputy of Marketing and Branding', 
          desc: 'Assists in creating promotional content, social media publicity campaigns, and student outreach.', 
          perms: { events: ['view', 'edit'], projects: ['view'] } 
        },
        { 
          name: 'Head of Event Management', 
          desc: 'Plans and manages workshops (IIC), hackathons, seminars, schedules, logistics, and volunteer teams.', 
          perms: { events: ['view', 'create', 'edit', 'delete', 'manage'], users: ['view'] } 
        },
        { 
          name: 'Deputy of Event Management', 
          desc: 'Assists in event logistics, registrations, volunteer management, and post-event reporting.', 
          perms: { events: ['view', 'create', 'edit'], users: ['view'] } 
        },
        { 
          name: 'Head of Startup Incubation and Intellectual Property (IP)', 
          desc: 'Guides startup teams through incubation, patent identification/filing, R&D/TBI coordination, and investor pitches.', 
          perms: { projects: ['view', 'create', 'edit', 'assign'], patent: ['view', 'create', 'edit', 'approve', 'manage'], finance: ['view', 'approve'] } 
        },
        { 
          name: 'Deputy of Startup Incubation and Intellectual Property (IP)', 
          desc: 'Assists startup teams during incubation, R&D/TBI coordination, patent documentation, and progress tracking.', 
          perms: { projects: ['view', 'edit'], patent: ['view', 'create', 'edit'], finance: ['view'] } 
        }
      ];

      for (const r of defaultRoles) {
        await connection.query(
          `INSERT INTO core_roles (name, description, permissions) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE description=VALUES(description), permissions=VALUES(permissions)`,
          [r.name, r.desc, JSON.stringify(r.perms)]
        );
      }

      // 3l. Create core_team_assignments table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS core_team_assignments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          team_id INT NOT NULL,
          assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_user_team (user_id, team_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
      `);

      // 3m. Create user_sessions table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          token TEXT NOT NULL,
          device_info VARCHAR(255) NULL,
          ip_address VARCHAR(45) NULL,
          last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
      `);
      try {
        await connection.query("ALTER TABLE user_sessions MODIFY COLUMN token TEXT NOT NULL;");
      } catch (_) {}

      // 3n. Create login_history table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS login_history (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NULL,
          email_attempted VARCHAR(100) NOT NULL,
          status ENUM('success', 'failed') NOT NULL,
          ip_address VARCHAR(45) NULL,
          device_info VARCHAR(255) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
      `);

      // 4. Alter users table for reset token and core team details
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
      if (!columnNames.includes('school')) {
        console.log("[DB] Adding school to users table...");
        await connection.query("ALTER TABLE users ADD COLUMN school VARCHAR(100) NULL;");
      }
      if (!columnNames.includes('personal_email')) {
        console.log("[DB] Adding personal_email to users table...");
        await connection.query("ALTER TABLE users ADD COLUMN personal_email VARCHAR(100) NULL;");
        await connection.query("ALTER TABLE users ADD UNIQUE INDEX unique_personal_email (personal_email);");
      }
      if (!columnNames.includes('is_core_team')) {
        console.log("[DB] Adding is_core_team to users table...");
        await connection.query("ALTER TABLE users ADD COLUMN is_core_team BOOLEAN DEFAULT FALSE;");
      }
      if (!columnNames.includes('role_id')) {
        console.log("[DB] Adding role_id to users table...");
        await connection.query("ALTER TABLE users ADD COLUMN role_id INT NULL;");
      }
      if (!columnNames.includes('two_factor_secret')) {
        console.log("[DB] Adding two_factor_secret to users table...");
        await connection.query("ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(100) NULL;");
      }
      if (!columnNames.includes('two_factor_enabled')) {
        console.log("[DB] Adding two_factor_enabled to users table...");
        await connection.query("ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;");
      }
      if (!columnNames.includes('failed_login_attempts')) {
        console.log("[DB] Adding failed_login_attempts to users table...");
        await connection.query("ALTER TABLE users ADD COLUMN failed_login_attempts INT DEFAULT 0;");
      }
      if (!columnNames.includes('lockout_until')) {
        console.log("[DB] Adding lockout_until to users table...");
        await connection.query("ALTER TABLE users ADD COLUMN lockout_until TIMESTAMP NULL;");
      }
      if (!columnNames.includes('designation')) {
        console.log("[DB] Adding designation to users table...");
        await connection.query("ALTER TABLE users ADD COLUMN designation VARCHAR(100) NULL;");
      }
      if (!columnNames.includes('department')) {
        console.log("[DB] Adding department to users table...");
        await connection.query("ALTER TABLE users ADD COLUMN department VARCHAR(100) NULL;");
      }
      if (!columnNames.includes('invitation_token')) {
        console.log("[DB] Adding invitation_token to users table...");
        await connection.query("ALTER TABLE users ADD COLUMN invitation_token VARCHAR(64) NULL;");
        await connection.query("ALTER TABLE users ADD UNIQUE INDEX unique_invitation_token (invitation_token);");
      }
      if (!columnNames.includes('invitation_expires')) {
        console.log("[DB] Adding invitation_expires to users table...");
        await connection.query("ALTER TABLE users ADD COLUMN invitation_expires TIMESTAMP NULL;");
      }

      // Alter team_members table for project_role (e.g. Frontend, Database, Automation)
      const [tmColumns]: any = await connection.query("SHOW COLUMNS FROM team_members;");
      const tmColumnNames = tmColumns.map((c: any) => c.Field);
      if (!tmColumnNames.includes('project_role')) {
        console.log("[DB] Adding project_role to team_members table...");
        await connection.query("ALTER TABLE team_members ADD COLUMN project_role VARCHAR(100) NULL;");
      }

      console.log("[DB] Email, innovation, & core RBAC system tables verified.");
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
  try {
    const [rows] = await connectionPool.execute(sql, params);
    return rows as T;
  } catch (err: any) {
    const isNetworkErr = err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST' || err.fatal;
    if (isNetworkErr) {
      console.warn(`[DB] Connection error (${err.code || 'fatal'}). Retrying query execution once...`);
      try {
        const [rows] = await connectionPool.execute(sql, params);
        return rows as T;
      } catch (retryErr) {
        console.error('[DB] Retry query execution failed:', retryErr);
        throw retryErr;
      }
    }
    throw err;
  }
}

/**
 * Resolves the application's base URL.
 * Prioritizes process.env.APP_URL, then VERCEL_URL, and falls back to request headers or default domain.
 */
export function getBaseUrl(req?: Request): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (req) {
    const host = req.headers.get('host');
    if (host) {
      const protocol = host.includes('localhost') ? 'http' : 'https';
      return `${protocol}://${host}`;
    }
  }
  return 'https://excited-salk.vercel.app';
}
