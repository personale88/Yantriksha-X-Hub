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

    const events = await query(`
      SELECT e.*,
             (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id) as registration_count
      FROM events e
      ORDER BY e.event_date DESC
    `);

    return NextResponse.json({ success: true, events });
  } catch (err: any) {
    console.error('Admin events GET error:', err);
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
    const { title, description, category, eventDate, status } = body;

    if (!title || !eventDate) {
      return NextResponse.json({ success: false, error: 'Missing title or event date' }, { status: 400 });
    }

    const result: any = await query(
      `INSERT INTO events (title, description, category, event_date, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [title, description || null, category || 'Other', eventDate, status || 'upcoming']
    );

    await logActivity(
      auth.userId,
      auth.email,
      auth.role,
      auth.email,
      `Created new event: "${title}"`,
      'Event Management',
      'Success'
    );

    // Send email to all active members of the club
    try {
      const activeMembers = await query("SELECT email, name FROM users WHERE status = 'active' AND role != 'admin'");
      if (activeMembers && activeMembers.length > 0) {
        for (const member of activeMembers) {
          const formattedDate = new Date(eventDate).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          await sendEmail({
            to: member.email,
            subject: `📅 New Event Scheduled: ${title}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 8px; margin-top: 0;">📅 New Event Announcement</h2>
                <h3 style="color: #1e293b; margin-top: 15px; font-size: 16px;">${title}</h3>
                
                <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px;">
                  <tr>
                    <td style="padding: 6px 0; font-weight: bold; width: 120px; color: #475569;">Category:</td>
                    <td><span style="background-color: #f1f5f9; color: #475569; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${category || 'Other'}</span></td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: bold; color: #475569;">Date & Time:</td>
                    <td style="color: #1e293b; font-weight: 500;">${formattedDate}</td>
                  </tr>
                  ${description ? `
                  <tr>
                    <td style="padding: 6px 0; font-weight: bold; color: #475569; vertical-align: top;">Description:</td>
                    <td style="color: #475569; line-height: 1.5; white-space: pre-wrap;">${description}</td>
                  </tr>` : ''}
                </table>
                
                <p style="margin-top: 20px; font-size: 14px;">Log in to the dashboard to register for this event and lock in your attendance slot!</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
                <p style="font-size: 12px; color: #64748b;">Yantriksha X Hub Incubation System</p>
              </div>
            `
          });
        }
      }
    } catch (emailErr) {
      console.error('Failed to send event creation broadcast emails:', emailErr);
    }

    return NextResponse.json({ success: true, eventId: result.insertId, message: 'Event created successfully' });
  } catch (err: any) {
    console.error('Admin events POST error:', err);
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
    const { eventId, title, description, category, eventDate, status } = body;

    if (!eventId || !title || !eventDate) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    await query(
      `UPDATE events SET title = ?, description = ?, category = ?, event_date = ?, status = ? WHERE id = ?`,
      [title, description || null, category || 'Other', eventDate, status, eventId]
    );

    await logActivity(
      auth.userId,
      auth.email,
      auth.role,
      auth.email,
      `Updated event ID ${eventId}: "${title}"`,
      'Event Management',
      'Success'
    );

    return NextResponse.json({ success: true, message: 'Event updated successfully' });
  } catch (err: any) {
    console.error('Admin events PUT error:', err);
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
    const eventIdStr = searchParams.get('eventId');
    if (!eventIdStr) {
      return NextResponse.json({ success: false, error: 'Missing Event ID' }, { status: 400 });
    }

    const eventId = parseInt(eventIdStr, 10);
    await query('DELETE FROM events WHERE id = ?', [eventId]);

    await logActivity(
      auth.userId,
      auth.email,
      auth.role,
      auth.email,
      `Permanently deleted event ID ${eventId}`,
      'Event Management',
      'Success'
    );

    return NextResponse.json({ success: true, message: 'Event deleted successfully' });
  } catch (err: any) {
    console.error('Admin events DELETE error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
