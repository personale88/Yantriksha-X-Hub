import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Access Denied' }, { status: 403 });
    }

    const activityLogs = await query(`
      SELECT id, user_id, user_name, user_role, email, action_performed, module, status, created_at
      FROM activity_logs
      ORDER BY created_at DESC
      LIMIT 100
    `);

    const auditLogs = await query(`
      SELECT id, action_by, action_description, status, created_at
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 100
    `);

    return NextResponse.json({ success: true, activityLogs, auditLogs });
  } catch (err: any) {
    console.error('Admin logs GET error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
