import mysql from 'mysql2/promise';
import 'dotenv/config';

let pool;

export function getPool() {
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
      connectionLimit: 5, // Keep small to avoid exhausting pool in serverless scale-out
      maxIdle: 5,
      idleTimeout: 60000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
  }
  return pool;
}
