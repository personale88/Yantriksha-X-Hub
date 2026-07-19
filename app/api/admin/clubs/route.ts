import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Access Denied' }, { status: 403 });
    }

    const clubs = await query(`
      SELECT c.*, u.name as admin_name, u.email as admin_email,
             (SELECT COUNT(*) FROM club_members WHERE club_id = c.id) as member_count
      FROM clubs c
      LEFT JOIN users u ON c.admin_id = u.id
      ORDER BY c.name ASC
    `);

    return NextResponse.json({ success: true, clubs });
  } catch (err: any) {
    console.error('Admin clubs GET error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Access Denied' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, category, adminId } = body;

    if (!name || !category) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const result: any = await query(
      `INSERT INTO clubs (name, description, category, admin_id) 
       VALUES (?, ?, ?, ?)`,
      [name, description || null, category, adminId || null]
    );

    await logActivity(
      auth.userId,
      auth.email,
      auth.role,
      auth.email,
      `Created new club: "${name}"`,
      'Club Management',
      'Success'
    );

    return NextResponse.json({ success: true, clubId: result.insertId, message: 'Club created successfully' });
  } catch (err: any) {
    console.error('Admin clubs POST error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ success: false, error: 'Club name already exists' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Access Denied' }, { status: 403 });
    }

    const body = await req.json();
    const { clubId, name, description, category, adminId } = body;

    if (!clubId || !name || !category) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }

    await query(
      `UPDATE clubs SET name = ?, description = ?, category = ?, admin_id = ? WHERE id = ?`,
      [name, description || null, category, adminId || null, clubId]
    );

    await logActivity(
      auth.userId,
      auth.email,
      auth.role,
      auth.email,
      `Updated club ID ${clubId}: "${name}"`,
      'Club Management',
      'Success'
    );

    return NextResponse.json({ success: true, message: 'Club updated successfully' });
  } catch (err: any) {
    console.error('Admin clubs PUT error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Access Denied' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const clubIdStr = searchParams.get('clubId');
    if (!clubIdStr) {
      return NextResponse.json({ success: false, error: 'Missing Club ID' }, { status: 400 });
    }

    const clubId = parseInt(clubIdStr, 10);
    await query('DELETE FROM clubs WHERE id = ?', [clubId]);

    await logActivity(
      auth.userId,
      auth.email,
      auth.role,
      auth.email,
      `Permanently deleted club ID ${clubId}`,
      'Club Management',
      'Success'
    );

    return NextResponse.json({ success: true, message: 'Club deleted successfully' });
  } catch (err: any) {
    console.error('Admin clubs DELETE error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
