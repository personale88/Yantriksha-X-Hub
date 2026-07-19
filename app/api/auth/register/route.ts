import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

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
        `INSERT INTO users (veltech_id, name, email, role, discipline, password_hash, phone_number, year_of_studying, branch) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          branch || null
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
