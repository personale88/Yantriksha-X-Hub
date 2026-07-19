import { getPool } from './db.js';

export default async function handler(req, res) {
  // Set CORS headers for testing
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT NOW() as db_time, 1 + 1 as test_calculation;');
    
    res.status(200).json({
      success: true,
      message: "Successfully connected to TiDB Serverless database!",
      timestamp: new Date().toISOString(),
      database_time: rows[0].db_time,
      connection_test: rows[0].test_calculation === 2 ? "PASSED" : "FAILED"
    });
  } catch (error) {
    console.error("TiDB Connection Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to connect to TiDB database. Check environment variables and cluster status.",
      error: error.message
    });
  }
}
