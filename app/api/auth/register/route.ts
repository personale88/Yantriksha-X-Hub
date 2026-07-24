import { NextResponse } from 'next/server';
import { query, getBaseUrl } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import { queueEmail, generateEmailTemplate } from '@/lib/emailQueue';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { veltech_id, name, email, role, discipline, password, phone_number, year_of_studying, branch, school, college } = body;

    // 1. Basic validation
    if (!veltech_id || !name || !email || !role || !discipline || !password) {
      return NextResponse.json(
        { success: false, error: 'All primary fields are required' },
        { status: 400 }
      );
    }

    // Student fields validation
    if (role === 'student') {
      if (!phone_number || !year_of_studying || !branch || !school) {
        return NextResponse.json(
          { success: false, error: 'Phone number, year of studying, branch, and school are required for students' },
          { status: 400 }
        );
      }
      if (!/^\d{10}$/.test(phone_number.trim())) {
        return NextResponse.json(
          { success: false, error: 'Phone number must be exactly 10 digits' },
          { status: 400 }
        );
      }
    }

    // 2. Email domain validation — accept any recognised academic domain
    const emailLower = email.toLowerCase();
    const isAcademicEmail =
      emailLower.endsWith('.edu') ||
      emailLower.endsWith('.edu.in') ||
      emailLower.endsWith('.ac.in') ||
      emailLower.endsWith('@veltech.edu.in');
    if (!isAcademicEmail) {
      return NextResponse.json(
        { success: false, error: 'Please use your official college/university email address (.edu / .ac.in / .edu.in)' },
        { status: 400 }
      );
    }

    // 3. Enum value validation
    const validRoles = ['student', 'faculty', 'mentor', 'admin'];
    const validDisciplines = ['engineering', 'law', 'business', 'other'];

    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    if (!validDisciplines.includes(discipline)) {
      return NextResponse.json(
        { success: false, error: `Invalid discipline. Must be one of: ${validDisciplines.join(', ')}` },
        { status: 400 }
      );
    }

    // 4. Hash the password
    const passwordHash = await hashPassword(password);

    // 5. Insert into database
    try {
      const parsedYear = year_of_studying ? parseInt(year_of_studying, 10) : null;
      await query(
        `INSERT INTO users (veltech_id, name, email, role, discipline, password_hash, phone_number, year_of_studying, branch, school, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          // veltech_id field stores the student ID (may be from any college)
          `${college || 'vel_tech'}:${veltech_id}`,
          name,
          emailLower,
          role,
          discipline,
          passwordHash,
          phone_number || null,
          parsedYear,
          branch || null,
          school || null,
          'unverified'
        ]
      );
    } catch (dbErr: any) {
      // Check for duplicate key error (MySQL code ER_DUP_ENTRY)
      if (dbErr.code === 'ER_DUP_ENTRY' || dbErr.errno === 1062) {
        const message = dbErr.message.includes('veltech_id') 
          ? 'Vel Tech ID is already registered' 
          : 'Email is already registered';
        return NextResponse.json({ success: false, error: message }, { status: 409 });
      }
      throw dbErr;
    }

    const newUsers = await query('SELECT id FROM users WHERE email = ?', [emailLower]);
    const newUserId = newUsers && newUsers.length > 0 ? newUsers[0].id : null;
    await logActivity(newUserId, name, role, emailLower, `Registered unverified user account with role: ${role}`, 'Auth', 'Success');

    // 6. Generate Verification Token
    const crypto = require('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await query(
      `INSERT INTO email_verification_tokens (email, token, expires_at) VALUES (?, ?, ?)`,
      [emailLower, verificationToken, expiresAt]
    );

    // 7. Send Verification Link Email
    const baseUrl = getBaseUrl(req);
    const verifyLink = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`;
    const studentContent = `
      <p>Dear <strong>${name}</strong>,</p>
      <p>Thank you for submitting your request to join <strong>YantrikshaX Hub</strong>.</p>
      <p>To activate your registration request, please verify your college email address by clicking the link below:</p>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
        <tr>
          <td align="center">
            <a href="${verifyLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block; border: 1px solid #3b82f6;">
              Verify Email Address
            </a>
          </td>
        </tr>
      </table>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p style="word-break: break-all;"><a href="${verifyLink}" style="color: #2563eb;">${verifyLink}</a></p>
      <p>This verification link is valid for 24 hours. Once verified, your application will be reviewed by the Hub Administrators.</p>
    `;
    const studentHtml = generateEmailTemplate({
      title: 'Verify Your Email Address',
      content: studentContent,
      buttonText: 'Verify Email Address',
      buttonUrl: verifyLink,
      preheader: 'Please verify your email address to activate your YantrikshaX Hub application.'
    });

    await queueEmail({
      to: emailLower,
      subject: 'Verify your YantrikshaX Hub Account',
      html: studentHtml
    });

    return NextResponse.json(
      { success: true, message: 'Verification email sent! Please check your inbox.' },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
