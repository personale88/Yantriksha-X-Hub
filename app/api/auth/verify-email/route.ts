import { NextResponse } from 'next/server';
import { query, getBaseUrl } from '@/lib/db';
import { logActivity } from '@/lib/logger';
import { queueEmail, generateEmailTemplate } from '@/lib/emailQueue';

function renderHtmlResponse(title: string, subtitle: string, message: string, buttonText: string, buttonUrl: string, isError = false) {
  const icon = isError ? '❌' : '🎉';
  const iconBg = isError ? 'bg-red-950/60 border-red-500/30 text-red-400' : 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400';
  const shadow = isError ? 'shadow-[0_0_20px_rgba(239,68,68,0.15)]' : 'shadow-[0_0_20px_rgba(16,185,129,0.15)]';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} | YantrikshaX Hub</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: #030712;
        }
        h1, h2 {
          font-family: 'Space Grotesk', sans-serif;
        }
      </style>
    </head>
    <body class="min-h-screen flex items-center justify-center p-6 text-gray-200 relative overflow-hidden">
      <!-- Ambient background glows -->
      <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[160px] pointer-events-none"></div>
      <div class="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-500/4 rounded-full blur-[140px] pointer-events-none"></div>

      <div class="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 text-center relative z-10 shadow-2xl">
        <!-- Top highlighting strip -->
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isError ? 'from-red-500 to-rose-600' : 'from-blue-500 via-indigo-500 to-amber-400'} rounded-t-3xl"></div>

        <!-- Glowing Status Icon -->
        <div class="mx-auto h-16 w-16 ${iconBg} border rounded-full flex items-center justify-center text-3xl mb-6 ${shadow}">
          ${icon}
        </div>

        <h2 class="text-2xl font-extrabold text-white tracking-tight mb-2">
          ${subtitle}
        </h2>
        
        <p class="text-gray-400 text-sm mt-4 leading-relaxed font-light">
          ${message}
        </p>

        <a href="${buttonUrl}" class="mt-8 block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-lg shadow-blue-900/30 text-sm">
          ${buttonText}
        </a>

        <div class="mt-8 pt-6 border-t border-slate-800/60 text-xs text-gray-600">
          Yantriksha X Hub &copy; ${new Date().getFullYear()} | Vel Tech University
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      const html = renderHtmlResponse(
        'Verification Failed',
        'Invalid Verification Link',
        'The verification link is invalid. Please request a new verification email from the registration page or contact support.',
        'Back to Registration',
        '/register',
        true
      );
      return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    }

    // 1. Fetch token record
    const tokens = await query(
      'SELECT email, expires_at FROM email_verification_tokens WHERE token = ?',
      [token]
    );

    if (!tokens || tokens.length === 0) {
      const html = renderHtmlResponse(
        'Verification Failed',
        'Expired or Invalid Link',
        'This email verification link has expired or has already been used. Please try registering again.',
        'Back to Registration',
        '/register',
        true
      );
      return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    }

    const { email, expires_at } = tokens[0];

    // Check expiration
    if (new Date(expires_at) < new Date()) {
      await query('DELETE FROM email_verification_tokens WHERE token = ?', [token]);
      const html = renderHtmlResponse(
        'Verification Failed',
        'Verification Link Expired',
        'This verification link has expired (validity is 24 hours). Please re-register to get a new verification link.',
        'Register Again',
        '/register',
        true
      );
      return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    }

    // 2. Fetch user profile
    const users = await query(
      'SELECT id, name, role, discipline, status FROM users WHERE email = ?',
      [email]
    );

    if (!users || users.length === 0) {
      const html = renderHtmlResponse(
        'User Not Found',
        'Account Profile Missing',
        'We could not locate a registration profile associated with this email address. Please try registering again.',
        'Go to Signup',
        '/register',
        true
      );
      return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    }

    const user = users[0];

    if (user.status !== 'unverified') {
      await query('DELETE FROM email_verification_tokens WHERE token = ?', [token]);
      const html = renderHtmlResponse(
        'Already Verified',
        'Email Already Confirmed',
        'Your email address has already been verified. You can log in once administrators approve your profile application.',
        'Go to Sign In',
        '/login'
      );
      return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    }

    // 3. Verify user email & update status
    await query(
      "UPDATE users SET status = 'pending' WHERE id = ?",
      [user.id]
    );

    // 4. Delete token to prevent reuse
    await query(
      'DELETE FROM email_verification_tokens WHERE token = ?',
      [token]
    );

    // Log Activity
    await logActivity(
      user.id,
      user.name,
      user.role,
      email,
      'Email address verified successfully, profile status changed to pending admin approval',
      'Auth',
      'Success'
    );

    // 5. Send Alert Email to active administrators
    const adminContent = `
      <p>Hello Admin,</p>
      <p>A new student has verified their college email and submitted a registration request to join <strong>YantrikshaX Hub</strong>:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; color: #334155;">
        <tr>
          <td style="padding: 6px 0; font-weight: bold; width: 120px;">Name:</td>
          <td>${user.name}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Email:</td>
          <td><a href="mailto:${email}">${email}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Role:</td>
          <td style="text-transform: capitalize;">${user.role}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Discipline:</td>
          <td style="text-transform: capitalize;">${user.discipline}</td>
        </tr>
      </table>
      <p>Please log in to the administrator portal to review, evaluate, and approve or reject this request.</p>
    `;
    const baseUrl = getBaseUrl(req);

    const adminHtml = generateEmailTemplate({
      title: 'New verified registration request',
      content: adminContent,
      buttonText: 'Review in Admin Portal',
      buttonUrl: `${baseUrl}/superadmin`,
      preheader: `Pending request: ${user.name} (${user.role})`
    });

    try {
      const activeAdmins = await query("SELECT email FROM users WHERE role = 'admin' AND status = 'active'");
      const adminAddresses = activeAdmins && activeAdmins.length > 0 
        ? activeAdmins.map((a: any) => a.email) 
        : ['vtu28891@veltech.edu.in'];

      for (const adminAddr of adminAddresses) {
        await queueEmail({
          to: adminAddr,
          subject: 'New Verified Registration Request',
          html: adminHtml
        });
      }
    } catch (adminEmailErr) {
      console.error('Failed to queue admin alert email:', adminEmailErr);
    }

    const html = renderHtmlResponse(
      'Email Verified',
      'Email Confirmed Successfully!',
      'Your college email has been verified. Your application is now queued for administrator review. You will receive a notification when your account is approved.',
      'Go to Sign In',
      '/login'
    );
    return new Response(html, { headers: { 'Content-Type': 'text/html' } });

  } catch (err: any) {
    console.error('Verification GET route error:', err);
    const html = renderHtmlResponse(
      'System Error',
      'Internal Server Error',
      'An unexpected error occurred during email verification. Please contact support if the issue persists.',
      'Back to Homepage',
      '/',
      true
    );
    return new Response(html, { headers: { 'Content-Type': 'text/html' } });
  }
}
