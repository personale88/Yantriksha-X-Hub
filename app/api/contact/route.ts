import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { queueEmail, generateEmailTemplate } from '@/lib/emailQueue';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    // 1. Log submission to database
    await query(
      `INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)`,
      [name, email, subject, message]
    );

    // 2. Query active admins to send alerts
    const admins = await query("SELECT email, name FROM users WHERE role = 'admin' AND status = 'active'");
    
    // Fallback email if no active admins are configured
    const adminEmails = admins && admins.length > 0 
      ? admins.map((a: any) => a.email) 
      : ['vtu28891@veltech.edu.in'];

    // 3. Queue alert email for each admin
    const emailContent = `
      <p>An inquirer has submitted a contact message on the portal.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px; color: #334155;">
        <tr>
          <td style="padding: 6px 0; font-weight: bold; width: 120px;">Name:</td>
          <td>${name}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Email:</td>
          <td><a href="mailto:${email}">${email}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Subject:</td>
          <td>${subject}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; vertical-align: top;">Message:</td>
          <td style="white-space: pre-wrap; line-height: 1.5; color: #475569;">${message}</td>
        </tr>
      </table>
    `;

    const emailHtml = generateEmailTemplate({
      title: 'New Contact Form Submission',
      content: emailContent,
      preheader: `Contact message received from ${name}`
    });

    for (const adminEmail of adminEmails) {
      await queueEmail({
        to: adminEmail,
        subject: `📬 New Contact Message: ${subject}`,
        html: emailHtml
      });
    }

    return NextResponse.json({ success: true, message: 'Message submitted successfully' });

  } catch (err: any) {
    console.error('Contact API error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
