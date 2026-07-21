import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { queueEmail, generateEmailTemplate } from '@/lib/emailQueue';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email address is required' }, { status: 400 });
    }

    const emailLower = email.trim().toLowerCase();

    // 1. Look up user by email
    const users = await query('SELECT id, name FROM users WHERE LOWER(email) = ?', [emailLower]);
    
    // Security best practice: Do not disclose if email exists or not, but only send if exists.
    if (users && users.length > 0) {
      const user = users[0];
      const token = crypto.randomBytes(32).toString('hex');
      
      // Token expires in 1 hour (3600000 ms)
      const expires = new Date(Date.now() + 3600000);
      
      // Format expires for MySQL (YYYY-MM-DD HH:MM:SS)
      const expiresFormatted = expires.toISOString().slice(0, 19).replace('T', ' ');

      // 2. Save token and expiration in users table
      await query(
        'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
        [token, expiresFormatted, user.id]
      );

      // 3. Queue the secure password reset email
      const resetLink = `http://localhost:3000/reset-password?token=${token}`;
      const emailContent = `
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>We received a request to reset your password for your <strong>YantrikshaX Hub</strong> account.</p>
        <p>You can reset your password by clicking the button below. Please note that this link is secure and will expire in <strong>1 hour</strong>.</p>
        <p style="padding: 10px; background-color: #fffbeb; border-left: 4px solid #f59e0b; color: #78350f; font-size: 13px; border-radius: 4px; margin: 20px 0;">
          <strong>⚠️ Security Warning:</strong> If you did not request a password reset, please ignore this email or contact the hub administrator immediately. Your password remains safe and unchanged.
        </p>
      `;

      const emailHtml = generateEmailTemplate({
        title: 'Password Reset Request',
        content: emailContent,
        buttonText: 'Reset Password Now',
        buttonUrl: resetLink,
        preheader: 'Reset your YantrikshaX Hub account password securely.'
      });

      await queueEmail({
        to: emailLower,
        subject: 'Secure Password Reset Link - YantrikshaX Hub',
        html: emailHtml
      });
      
      console.log(`[FORGOT PASSWORD API] Queued password reset email successfully for: ${emailLower}`);
    }

    return NextResponse.json({
      success: true,
      message: 'If the email is registered, a secure password reset link has been sent.'
    });

  } catch (err: any) {
    console.error('Forgot password API error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
