import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET /api/users/profile - Get current user profile
export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const users = await query(
      'SELECT id, veltech_id, name, email, role, discipline, phone_number, year_of_studying, branch, created_at FROM users WHERE id = ?',
      [auth.userId]
    );

    if (!users || users.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: users[0] });
  } catch (err: any) {
    console.error('Error fetching profile:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/users/profile - Update current user profile
export async function PUT(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone_number, year_of_studying, branch, discipline } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    const parsedYear = year_of_studying ? parseInt(year_of_studying, 10) : null;

    await query(
      `UPDATE users 
       SET name = ?, phone_number = ?, year_of_studying = ?, branch = ?, discipline = ?
       WHERE id = ?`,
      [
        name,
        phone_number || null,
        parsedYear,
        branch || null,
        discipline || 'engineering',
        auth.userId
      ]
    );

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });
  } catch (err: any) {
    console.error('Error updating profile:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
