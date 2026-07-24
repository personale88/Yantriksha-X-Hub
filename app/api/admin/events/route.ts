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
        const formattedDate = new Date(eventDate).toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const eventContent = `
          <p>We are excited to announce a new scheduled event at <strong>YantrikshaX Hub</strong>!</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; color: #334155;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 120px;">Event Name:</td>
              <td style="font-weight: bold; color: #1e293b;">${title}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Category:</td>
              <td><span style="background-color: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${category || 'Other'}</span></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Date & Time:</td>
              <td style="color: #2563eb; font-weight: 600;">${formattedDate}</td>
            </tr>
            ${description ? `
            <tr>
              <td style="padding: 6px 0; font-weight: bold; vertical-align: top;">Description:</td>
              <td style="white-space: pre-wrap; line-height: 1.5; color: #475569;">${description}</td>
            </tr>` : ''}
          </table>
          <p>Please log in to your student dashboard to register for this event and secure your attendance seat.</p>
        `;

        const host = req.headers.get('host') || 'excited-salk.vercel.app';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;

        const eventHtml = generateEmailTemplate({
          title: `New Event Scheduled`,
          content: eventContent,
          buttonText: 'Register for Event',
          buttonUrl: `${baseUrl}/dashboard`,
          preheader: `New Event: ${title} scheduled for ${formattedDate}`
        });

        for (const member of activeMembers) {
          await queueEmail({
            to: member.email,
            subject: `📅 New Event Scheduled: ${title}`,
            html: eventHtml,
            category: 'event_notifications'
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

    // Fetch previous status of the event to check for transition to cancelled
    const prevEvents = await query('SELECT title, status FROM events WHERE id = ?', [eventId]);
    const prevEvent = prevEvents && prevEvents.length > 0 ? prevEvents[0] : null;

    await query(
      `UPDATE events SET title = ?, description = ?, category = ?, event_date = ?, status = ? WHERE id = ?`,
      [title, description || null, category || 'Other', eventDate, status, eventId]
    );

    // If transitioned to cancelled, notify registered participants!
    if (prevEvent && prevEvent.status !== 'cancelled' && status === 'cancelled') {
      try {
        const participants = await query(
          `SELECT u.email, u.name FROM event_registrations er 
           JOIN users u ON er.user_id = u.id 
           WHERE er.event_id = ?`,
          [eventId]
        );

        if (participants && participants.length > 0) {
          const cancelContent = `
            <p>Dear Participant,</p>
            <p>This is to notify you that the upcoming event <strong>"${prevEvent.title}"</strong> has been cancelled by the Hub organizers.</p>
            <p>If the event is rescheduled, you will receive a new announcement notification with the updated date and details.</p>
            <p>We apologize for any inconvenience caused.</p>
          `;

          const cancelHtml = generateEmailTemplate({
            title: 'Event Cancellation Notice',
            content: cancelContent,
            preheader: `Cancellation notice for event: ${prevEvent.title}`
          });

          for (const user of participants) {
            await queueEmail({
              to: user.email,
              subject: `⚠️ Event Cancelled: ${prevEvent.title}`,
              html: cancelHtml,
              category: 'event_notifications'
            });
          }
        }
      } catch (emailErr) {
        console.error('Failed to send event cancellation emails:', emailErr);
      }
    }

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

    // Fetch event title to use in cancellation email
    const events = await query('SELECT title FROM events WHERE id = ?', [eventId]);
    const eventTitle = events && events.length > 0 ? events[0].title : null;

    if (eventTitle) {
      try {
        const participants = await query(
          `SELECT u.email, u.name FROM event_registrations er 
           JOIN users u ON er.user_id = u.id 
           WHERE er.event_id = ?`,
          [eventId]
        );

        if (participants && participants.length > 0) {
          const cancelContent = `
            <p>Dear Participant,</p>
            <p>This is to notify you that the upcoming event <strong>"${eventTitle}"</strong> has been cancelled by the Hub organizers.</p>
            <p>If the event is rescheduled, you will receive a new announcement notification with the updated date and details.</p>
            <p>We apologize for any inconvenience caused.</p>
          `;

          const cancelHtml = generateEmailTemplate({
            title: 'Event Cancellation Notice',
            content: cancelContent,
            preheader: `Cancellation notice for event: ${eventTitle}`
          });

          for (const user of participants) {
            await queueEmail({
              to: user.email,
              subject: `⚠️ Event Cancelled: ${eventTitle}`,
              html: cancelHtml,
              category: 'event_notifications'
            });
          }
        }
      } catch (emailErr) {
        console.error('Failed to send event cancellation emails:', emailErr);
      }
    }

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
