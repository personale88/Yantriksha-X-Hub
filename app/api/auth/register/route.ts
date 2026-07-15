import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { veltech_id, name, email, role, discipline, password } = body;

    // 1. Basic validation
    if (!veltech_id || !name || !email || !role || !discipline || !password) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // 2. Email domain validation
    if (!email.toLowerCase().endsWith('@veltech.edu.in')) {
      return NextResponse.json(
        { success: false, error: 'Registration is restricted to @veltech.edu.in email domains' },
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
      await query(
        `INSERT INTO users (veltech_id, name, email, role, discipline, password_hash) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [veltech_id, name, email.toLowerCase(), role, discipline, passwordHash]
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
