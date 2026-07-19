import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import { sendEmail } from '@/lib/email';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Access Denied' }, { status: 403 });
    }

    const announcements = await query('SELECT * FROM announcements ORDER BY is_pinned DESC, created_at DESC');
    return NextResponse.json({ success: true, announcements });
  } catch (err: any) {
    console.error('Admin announcements GET error:', err);
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
    const { title, content, isPinned } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Missing title or content' }, { status: 400 });
    }

    const result: any = await query(
      'INSERT INTO announcements (title, content, is_pinned) VALUES (?, ?, ?)',
      [title, content, isPinned ? 1 : 0]
    );

    await logActivity(
      auth.userId,
      auth.email,
      auth.role,
      auth.email,
      `Published new announcement: "${title}"`,
      'Announcements',
      'Success'
    );

    // Send email to all active members of the club
    try {
      const activeMembers = await query("SELECT email, name FROM users WHERE status = 'active' AND role != 'admin'");
      if (activeMembers && activeMembers.length > 0) {
        for (const member of activeMembers) {
          await sendEmail({
            to: member.email,
            subject: `📢 Club Announcement: ${title}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                <h2 style="color: #2563eb; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; margin-top: 0;">📢 New Announcement from Yantriksha X Hub</h2>
                <h3 style="color: #1e293b; margin-top: 15px; font-size: 16px;">${title}</h3>
                <p style="color: #475569; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${content}</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
                <p style="font-size: 12px; color: #64748b;">Yantriksha X Hub Incubation System</p>
              </div>
            `
          });
        }
      }
    } catch (emailErr) {
      console.error('Failed to send announcement broadcast emails:', emailErr);
    }

    return NextResponse.json({ success: true, announcementId: result.insertId, message: 'Announcement created successfully' });
  } catch (err: any) {
    console.error('Admin announcements POST error:', err);
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
    const { id, title, content, isPinned } = body;

    if (!id || !title || !content) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }

    await query(
      'UPDATE announcements SET title = ?, content = ?, is_pinned = ? WHERE id = ?',
      [title, content, isPinned ? 1 : 0, id]
    );

    await logActivity(
      auth.userId,
      auth.email,
      auth.role,
      auth.email,
      `Modified announcement ID ${id}: "${title}"`,
      'Announcements',
      'Success'
    );

    return NextResponse.json({ success: true, message: 'Announcement updated successfully' });
  } catch (err: any) {
    console.error('Admin announcements PUT error:', err);
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
    const idStr = searchParams.get('id');
    if (!idStr) {
      return NextResponse.json({ success: false, error: 'Missing Announcement ID' }, { status: 400 });
    }

    const id = parseInt(idStr, 10);
    await query('DELETE FROM announcements WHERE id = ?', [id]);

    await logActivity(
      auth.userId,
      auth.email,
      auth.role,
      auth.email,
      `Permanently deleted announcement ID ${id}`,
      'Announcements',
      'Success'
    );

    return NextResponse.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (err: any) {
    console.error('Admin announcements DELETE error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
