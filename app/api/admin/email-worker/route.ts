import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { queueEmail, generateEmailTemplate, processEmailQueue } from '@/lib/emailQueue';

export async function GET(req: Request) {
  try {
    console.log('[EMAIL WORKER] Starting event reminder scheduling scan...');
    
    // 1. Fetch all upcoming active events
    const events = await query(
      `SELECT * FROM events WHERE status = 'upcoming' AND event_date > NOW() ORDER BY event_date ASC`
    );

    let remindersQueuedCount = 0;

    for (const event of events) {
      const diffMs = new Date(event.event_date).getTime() - Date.now();
      const diffHours = diffMs / (1000 * 60 * 60);

      let intervalType: '7days' | '3days' | '1day' | '2hours' | null = null;
      let intervalLabel = '';

      if (diffHours > 0) {
        if (diffHours <= 2) {
          intervalType = '2hours';
          intervalLabel = '2 hours';
        } else if (diffHours <= 24) {
          intervalType = '1day';
          intervalLabel = '24 hours';
        } else if (diffHours <= 72) {
          intervalType = '3days';
          intervalLabel = '3 days';
        } else if (diffHours <= 168) {
          intervalType = '7days';
          intervalLabel = '7 days';
        }
      }

      // If the event falls into one of our reminder windows
      if (intervalType) {
        // Query participants who have NOT received this reminder type yet
        const usersToRemind = await query(
          `SELECT u.id as user_id, u.email, u.name 
           FROM event_registrations er
           JOIN users u ON er.user_id = u.id
           LEFT JOIN reminder_logs rl ON (rl.event_id = er.event_id AND rl.user_id = er.user_id AND rl.interval_type = ?)
           WHERE er.event_id = ? AND rl.id IS NULL`,
          [intervalType, event.id]
        );

        if (usersToRemind && usersToRemind.length > 0) {
          console.log(`[EMAIL WORKER] Event "${event.title}" requires sending "${intervalType}" reminders to ${usersToRemind.length} participants.`);

          const formattedDate = new Date(event.event_date).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          for (const user of usersToRemind) {
            const reminderContent = `
              <p>Dear <strong>${user.name}</strong>,</p>
              <p>This is a reminder that the event <strong>"${event.title}"</strong> is scheduled to start in <strong>${intervalLabel}</strong>!</p>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; color: #334155;">
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; width: 120px;">Event Title:</td>
                  <td style="font-weight: bold; color: #1e293b;">${event.title}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">Date & Time:</td>
                  <td style="color: #2563eb; font-weight: 600;">${formattedDate}</td>
                </tr>
                ${event.description ? `
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; vertical-align: top;">Description:</td>
                  <td style="color: #475569; line-height: 1.5;">${event.description}</td>
                </tr>` : ''}
              </table>
              <p>Please make sure to arrive on time. We look forward to seeing you there!</p>
            `;

            const host = req.headers.get('host') || 'excited-salk.vercel.app';
            const protocol = host.includes('localhost') ? 'http' : 'https';
            const baseUrl = `${protocol}://${host}`;

            const reminderHtml = generateEmailTemplate({
              title: 'Upcoming Event Reminder',
              content: reminderContent,
              buttonText: 'View Event Details',
              buttonUrl: `${baseUrl}/dashboard`,
              preheader: `Reminder: ${event.title} starts in ${intervalLabel}!`
            });

            // 2. Queue the email
            const queued = await queueEmail({
              to: user.email,
              subject: `⏰ Event Reminder: ${event.title} starts in ${intervalLabel}!`,
              html: reminderHtml,
              category: 'event_notifications'
            });

            if (queued) {
              remindersQueuedCount++;
              // 3. Mark reminder as logged to prevent duplicates
              await query(
                `INSERT INTO reminder_logs (event_id, user_id, interval_type) VALUES (?, ?, ?)`,
                [event.id, user.user_id, intervalType]
              );
            }
          }
        }
      }
    }

    // 4. Force processing of any pending emails right now
    await processEmailQueue();

    return NextResponse.json({
      success: true,
      message: `Event reminder scan completed. Queued ${remindersQueuedCount} new reminder email(s).`,
      scanTime: new Date().toISOString()
    });

  } catch (err: any) {
    console.error('[EMAIL WORKER] Error during scan run:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
