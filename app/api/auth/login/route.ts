import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, generateToken, JWTPayload } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // 1. Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // 2. Fetch user from database
    const users = await query(
      'SELECT id, veltech_id, name, email, role, discipline, password_hash, status FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (!users || users.length === 0) {
      await logActivity(null, 'Guest', 'guest', email, 'Attempted Login with non-existent email', 'Auth', 'Failed');
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Check if account is suspended
    if (user.status === 'suspended') {
      await logActivity(user.id, user.name, user.role, user.email, 'Attempted login to suspended account', 'Auth', 'Failed');
      return NextResponse.json(
        { success: false, error: 'Account has been suspended. Please contact coordinator.' },
        { status: 403 }
      );
    }

    // Check if account is pending approval
    if (user.status === 'pending') {
      await logActivity(user.id, user.name, user.role, user.email, 'Attempted login to pending account', 'Auth', 'Failed');
      return NextResponse.json(
        { success: false, error: 'Your join request is pending approval by the Admin. Please contact coordinator.' },
        { status: 403 }
      );
    }

    // 3. Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      await logActivity(user.id, user.name, user.role, user.email, 'Attempted Login with invalid password', 'Auth', 'Failed');
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 4. Generate JWT token
    const payload: JWTPayload = {
      userId: user.id,
      veltech_id: user.veltech_id,
      role: user.role,
      email: user.email
    };
    const token = generateToken(payload);

    // 5. Create Response and set secure httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        veltech_id: user.veltech_id,
        name: user.name,
        email: user.email,
        role: user.role,
        discipline: user.discipline
      }
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/'
    });

    await logActivity(user.id, user.name, user.role, user.email, 'Logged in successfully', 'Auth', 'Success');

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
