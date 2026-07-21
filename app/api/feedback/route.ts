import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { queueEmail, generateEmailTemplate } from '@/lib/emailQueue';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, feedback } = body;

    if (!category || !feedback) {
      return NextResponse.json({ success: false, error: 'Category and feedback are required' }, { status: 400 });
    }

    // Try to get authenticated user context if logged in
    const auth = await verifyAuth(req);
    const userId = auth ? auth.userId : null;
    const userEmail = auth ? auth.email : 'Anonymous';
    const userName = auth ? auth.email.split('@')[0] : 'Visitor';

    // 1. Log submission to database
    await query(
      `INSERT INTO feedback_submissions (user_id, category, feedback) VALUES (?, ?, ?)`,
      [userId, category, feedback]
    );

    // 2. Query active admins to send alerts
    const admins = await query("SELECT email, name FROM users WHERE role = 'admin' AND status = 'active'");
    const adminEmails = admins && admins.length > 0 
      ? admins.map((a: any) => a.email) 
      : ['vtu28891@veltech.edu.in'];

    // 3. Queue email alert for admins
    const emailContent = `
      <p>A user has submitted feedback on the YantrikshaX Hub portal.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px; color: #334155;">
        <tr>
          <td style="padding: 6px 0; font-weight: bold; width: 120px;">Submitted By:</td>
          <td>${userName} (${userEmail})</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Category:</td>
          <td><span style="background-color: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${category}</span></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; vertical-align: top;">Feedback:</td>
          <td style="white-space: pre-wrap; line-height: 1.5; color: #475569;">${feedback}</td>
        </tr>
      </table>
    `;

    const emailHtml = generateEmailTemplate({
      title: 'New Feedback Submission Recieved',
      content: emailContent,
      preheader: `Portal feedback submitted under ${category}`
    });

    for (const adminEmail of adminEmails) {
      await queueEmail({
        to: adminEmail,
        subject: `💡 New User Feedback: ${category}`,
        html: emailHtml
      });
    }

    return NextResponse.json({ success: true, message: 'Feedback submitted successfully' });

  } catch (err: any) {
    console.error('Feedback API error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
