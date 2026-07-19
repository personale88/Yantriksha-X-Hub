import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get('role') || 'student'; // Default to student
    const disciplineParam = searchParams.get('discipline') || '';
    const search = searchParams.get('search') || '';

    let sql = `
      SELECT id, name, email, role, discipline, branch, year_of_studying, phone_number, veltech_id
      FROM users
      WHERE id NOT IN (SELECT leader_id FROM teams)
        AND id NOT IN (SELECT user_id FROM team_members)
    `;

    const params: any[] = [];

    if (roleParam) {
      sql += ' AND role = ?';
      params.push(roleParam);
    }

    if (disciplineParam) {
      sql += ' AND discipline = ?';
      params.push(disciplineParam);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ? OR veltech_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY name ASC';

    const users = await query(sql, params);

    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    console.error('Error fetching unassigned users:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
