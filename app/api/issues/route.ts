import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { queueEmail, generateEmailTemplate } from '@/lib/emailQueue';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, severity } = body;

    if (!title || !description) {
      return NextResponse.json({ success: false, error: 'Title and description are required' }, { status: 400 });
    }

    const resolvedSeverity = severity || 'medium';

    // Try to get authenticated user context if logged in
    const auth = await verifyAuth(req);
    const userId = auth ? auth.userId : null;
    const userEmail = auth ? auth.email : 'Anonymous';
    const userName = auth ? auth.email.split('@')[0] : 'Visitor';

    // 1. Log submission to database
    await query(
      `INSERT INTO reported_issues (user_id, title, description, severity, status) VALUES (?, ?, ?, ?, 'open')`,
      [userId, title, description, resolvedSeverity]
    );

    // 2. Query active admins to send alerts
    const admins = await query("SELECT email, name FROM users WHERE role = 'admin' AND status = 'active'");
    const adminEmails = admins && admins.length > 0 
      ? admins.map((a: any) => a.email) 
      : ['vtu28891@veltech.edu.in'];

    // 3. Queue email alert for admins
    const emailContent = `
      <p>A system issue or bug has been reported on the YantrikshaX Hub portal.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px; color: #334155;">
        <tr>
          <td style="padding: 6px 0; font-weight: bold; width: 120px;">Reported By:</td>
          <td>${userName} (${userEmail})</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Title:</td>
          <td>${title}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Severity:</td>
          <td>
            <span style="background-color: ${
              resolvedSeverity === 'high' ? '#fef2f2' : resolvedSeverity === 'critical' ? '#fff1f2' : '#f0fdf4'
            }; color: ${
              resolvedSeverity === 'high' ? '#991b1b' : resolvedSeverity === 'critical' ? '#9f1239' : '#166534'
            }; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
              ${resolvedSeverity}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; vertical-align: top;">Description:</td>
          <td style="white-space: pre-wrap; line-height: 1.5; color: #475569;">${description}</td>
        </tr>
      </table>
    `;

    const emailHtml = generateEmailTemplate({
      title: '🚨 System Issue Reported',
      content: emailContent,
      preheader: `Issue report: ${title} (${resolvedSeverity})`
    });

    for (const adminEmail of adminEmails) {
      await queueEmail({
        to: adminEmail,
        subject: `🚨 Portal Issue Reported [${resolvedSeverity.toUpperCase()}]: ${title}`,
        html: emailHtml
      });
    }

    return NextResponse.json({ success: true, message: 'Issue reported successfully' });

  } catch (err: any) {
    console.error('Issues API error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
