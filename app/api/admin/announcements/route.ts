import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import { queueEmail, generateEmailTemplate } from '@/lib/emailQueue';

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
        const announceContent = `
          <p>A new important update has been posted in <strong>YantrikshaX Hub</strong>:</p>
          <div style="padding: 15px; border-left: 4px solid #2563eb; background-color: #f8fafc; border-radius: 0 8px 8px 0; margin: 20px 0;">
            <p style="margin-top: 0; font-weight: bold; color: #1e293b; font-size: 16px;">${title}</p>
            <p style="white-space: pre-wrap; line-height: 1.6; color: #475569; font-size: 14px; margin-bottom: 0;">${content}</p>
          </div>
          <p>Please log in to your student dashboard to review details and take any necessary action.</p>
        `;

        const host = req.headers.get('host') || 'excited-salk.vercel.app';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;

        const announceHtml = generateEmailTemplate({
          title: `New Club Announcement`,
          content: announceContent,
          buttonText: 'View Dashboard Announcement',
          buttonUrl: `${baseUrl}/dashboard`,
          preheader: `New Announcement: ${title}`
        });

        for (const member of activeMembers) {
          await queueEmail({
            to: member.email,
            subject: `📢 New Club Announcement: ${title}`,
            html: announceHtml,
            category: 'general_announcements'
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
