import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { veltech_id, name, email, role, discipline, password, phone_number, year_of_studying, branch, college } = body;

    // 1. Basic validation
    if (!veltech_id || !name || !email || !role || !discipline || !password) {
      return NextResponse.json(
        { success: false, error: 'All primary fields are required' },
        { status: 400 }
      );
    }

    // Student fields validation
    if (role === 'student') {
      if (!phone_number || !year_of_studying || !branch) {
        return NextResponse.json(
          { success: false, error: 'Phone number, year of studying, and branch are required for students' },
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
        `INSERT INTO users (veltech_id, name, email, role, discipline, password_hash, phone_number, year_of_studying, branch, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          'pending'
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
    await logActivity(newUserId, name, role, emailLower, `Registered new user account with role: ${role}`, 'Auth', 'Success');

    // 6. Send Email Notifications
    // Email to candidate user
    await sendEmail({
      to: emailLower,
      subject: 'Join Request Submitted - Yantriksha X Hub',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #2563eb;">Welcome to Yantriksha X Hub!</h2>
          <p>Dear <strong>${name}</strong>,</p>
          <p>Your join request to the academic incubation club has been submitted successfully.</p>
          <p>Your application details are currently pending review and approval by the Hub Administrators. Once approved, you will receive a notification email permitting you to log in.</p>
          <p>Thank you for your interest and patience!</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">This is an automated notification. Please do not reply directly to this email.</p>
        </div>
      `
    });

    // Email to Super Admin
    await sendEmail({
      to: 'vtu28891@veltech.edu.in',
      subject: 'New Club Joining Request - Yantriksha X Hub',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #f59e0b;">Pending Joining Request</h2>
          <p>Hello Admin,</p>
          <p>A new student has submitted an registration request to join Yantriksha X Hub:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 120px;">Name:</td>
              <td>${name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Email:</td>
              <td>${emailLower}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Role:</td>
              <td style="text-transform: capitalize;">${role}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Discipline:</td>
              <td style="text-transform: capitalize;">${discipline}</td>
            </tr>
          </table>
          <p>Please log in to the <a href="http://localhost:3000/superadmin" style="color: #2563eb; font-weight: bold;">Super Admin Portal</a> to review and approve/reject this request.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">Yantriksha X Hub System Automation</p>
        </div>
      `
    });

    return NextResponse.json(
      { success: true, message: 'User registered successfully!' },
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
