import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { queueEmail, generateEmailTemplate } from '@/lib/emailQueue';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ success: false, error: 'Token and new password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // 1. Verify token exists and is not expired (reset_token_expires > current time)
    const users = await query(
      `SELECT id, name, email FROM users 
       WHERE reset_token = ? AND reset_token_expires > NOW()`,
      [token]
    );

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Password reset link is invalid or has expired' },
        { status: 400 }
      );
    }

    const user = users[0];

    // 2. Hash new password
    const passwordHash = await hashPassword(password);

    // 3. Update password hash and clear token columns
    await query(
      `UPDATE users 
       SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL 
       WHERE id = ?`,
      [passwordHash, user.id]
    );

    // 4. Queue confirmation email
    const emailContent = `
      <p>Hello <strong>${user.name}</strong>,</p>
      <p>This is a confirmation that the password for your <strong>YantrikshaX Hub</strong> account was recently reset successfully.</p>
      <p>You can now log in using your new credentials.</p>
      <p style="padding: 10px; background-color: #f8fafc; border-left: 4px solid #64748b; color: #475569; font-size: 13px; border-radius: 4px; margin: 20px 0;">
        <strong>🔒 Security Notice:</strong> If you did not authorize this change, please contact the coordinator or admin immediately to secure your account.
      </p>
    `;

    const emailHtml = generateEmailTemplate({
      title: 'Password Changed Successfully',
      content: emailContent,
      buttonText: 'Log In to Platform',
      buttonUrl: 'http://localhost:3000/login',
      preheader: 'Your YantrikshaX Hub account password was reset successfully.'
    });

    await queueEmail({
      to: user.email,
      subject: 'Security Alert: Password Changed Successfully',
      html: emailHtml
    });

    console.log(`[RESET PASSWORD API] Password updated successfully and confirmation queued for: ${user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Your password has been reset successfully. You can now log in.'
    });

  } catch (err: any) {
    console.error('Reset password API error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
