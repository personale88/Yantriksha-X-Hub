import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, generateToken, JWTPayload } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import jwt from 'jsonwebtoken';

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

    const emailNormalized = email.toLowerCase().trim();
    const userAgent = req.headers.get('user-agent') || 'Unknown Device';
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    // 2. Fetch user from database
    const users = await query(
      `SELECT id, veltech_id, name, email, personal_email, role, discipline, password_hash, status,
              is_core_team, role_id, two_factor_secret, two_factor_enabled, failed_login_attempts, lockout_until 
       FROM users 
       WHERE LOWER(email) = ? OR LOWER(personal_email) = ?`,
      [emailNormalized, emailNormalized]
    );

    if (!users || users.length === 0) {
      await query(
        'INSERT INTO login_history (user_id, email_attempted, status, ip_address, device_info) VALUES (NULL, ?, ?, ?, ?)',
        [emailNormalized, 'failed', ipAddress, userAgent]
      );
      await logActivity(null, 'Guest', 'guest', email, 'Attempted Login with non-existent email', 'Auth', 'Failed');
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Check if account is locked out due to failed attempts
    if (user.lockout_until && new Date(user.lockout_until).getTime() > Date.now()) {
      const remainingMin = Math.ceil((new Date(user.lockout_until).getTime() - Date.now()) / (60 * 1000));
      await query(
        'INSERT INTO login_history (user_id, email_attempted, status, ip_address, device_info) VALUES (?, ?, ?, ?, ?)',
        [user.id, emailNormalized, 'failed', ipAddress, userAgent]
      );
      return NextResponse.json(
        { success: false, error: `Account locked due to multiple failed login attempts. Try again in ${remainingMin} minutes.` },
        { status: 403 }
      );
    }

    // Check if matched via personal email, verify they are a Core Team member
    const matchedPersonal = user.personal_email && user.personal_email.toLowerCase() === emailNormalized;
    if (matchedPersonal && !user.is_core_team && user.role === 'student') {
      await query(
        'INSERT INTO login_history (user_id, email_attempted, status, ip_address, device_info) VALUES (?, ?, ?, ?, ?)',
        [user.id, emailNormalized, 'failed', ipAddress, userAgent]
      );
      await logActivity(user.id, user.name, user.role, user.email, 'Attempted student login using personal email', 'Auth', 'Failed');
      return NextResponse.json(
        { success: false, error: 'Students must log in using their official college email address.' },
        { status: 403 }
      );
    }

    // Check if account is suspended
    if (user.status === 'suspended') {
      await query(
        'INSERT INTO login_history (user_id, email_attempted, status, ip_address, device_info) VALUES (?, ?, ?, ?, ?)',
        [user.id, emailNormalized, 'failed', ipAddress, userAgent]
      );
      await logActivity(user.id, user.name, user.role, user.email, 'Attempted login to suspended account', 'Auth', 'Failed');
      return NextResponse.json(
        { success: false, error: 'Account has been suspended. Please contact coordinator.' },
        { status: 403 }
      );
    }

    // Check if account is email unverified
    if (user.status === 'unverified') {
      await query(
        'INSERT INTO login_history (user_id, email_attempted, status, ip_address, device_info) VALUES (?, ?, ?, ?, ?)',
        [user.id, emailNormalized, 'failed', ipAddress, userAgent]
      );
      await logActivity(user.id, user.name, user.role, user.email, 'Attempted login to email unverified account', 'Auth', 'Failed');
      return NextResponse.json(
        { success: false, error: 'Please verify your email address. Check your inbox for the verification link.' },
        { status: 403 }
      );
    }

    // Check if account is pending approval
    if (user.status === 'pending') {
      await query(
        'INSERT INTO login_history (user_id, email_attempted, status, ip_address, device_info) VALUES (?, ?, ?, ?, ?)',
        [user.id, emailNormalized, 'failed', ipAddress, userAgent]
      );
      await logActivity(user.id, user.name, user.role, user.email, 'Attempted login to pending account', 'Auth', 'Failed');
      return NextResponse.json(
        { success: false, error: 'Your join request is pending approval by the Admin. Please contact coordinator.' },
        { status: 403 }
      );
    }

    // 3. Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      // Increment failed attempts
      const newAttempts = (user.failed_login_attempts || 0) + 1;
      if (newAttempts >= 5) {
        const lockoutTime = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
        await query(
          'UPDATE users SET failed_login_attempts = ?, lockout_until = ? WHERE id = ?',
          [newAttempts, lockoutTime, user.id]
        );
        await query(
          'INSERT INTO login_history (user_id, email_attempted, status, ip_address, device_info) VALUES (?, ?, ?, ?, ?)',
          [user.id, emailNormalized, 'failed', ipAddress, userAgent]
        );
        await logActivity(user.id, user.name, user.role, user.email, 'Account locked after 5 failed login attempts', 'Auth', 'Failed');
        return NextResponse.json(
          { success: false, error: 'Account locked due to multiple failed login attempts. Try again in 30 minutes.' },
          { status: 403 }
        );
      } else {
        await query(
          'UPDATE users SET failed_login_attempts = ? WHERE id = ?',
          [newAttempts, user.id]
        );
        await query(
          'INSERT INTO login_history (user_id, email_attempted, status, ip_address, device_info) VALUES (?, ?, ?, ?, ?)',
          [user.id, emailNormalized, 'failed', ipAddress, userAgent]
        );
        await logActivity(user.id, user.name, user.role, user.email, `Attempted Login with invalid password (Attempt ${newAttempts}/5)`, 'Auth', 'Failed');
        return NextResponse.json(
          { success: false, error: `Invalid email or password. Attempt ${newAttempts} of 5 before account lockout.` },
          { status: 401 }
        );
      }
    }

    // Reset failed login attempts on success
    await query(
      'UPDATE users SET failed_login_attempts = 0, lockout_until = NULL WHERE id = ?',
      [user.id]
    );

    // 4. Check for Two-Factor Authentication (2FA)
    if (user.two_factor_enabled && user.two_factor_secret) {
      const JWT_SECRET = process.env.JWT_SECRET || 'yantriksha_secret_key_123_change_me_in_prod';
      const tempToken = jwt.sign(
        { userId: user.id, email: user.email, require2fa: true },
        JWT_SECRET,
        { expiresIn: '5m' }
      );
      return NextResponse.json({
        success: true,
        require2fa: true,
        tempToken,
        message: 'Two-Factor Authentication is required.'
      });
    }

    // 5. Generate JWT token
    const payload: JWTPayload = {
      userId: user.id,
      veltech_id: user.veltech_id,
      role: user.role,
      email: user.email,
      is_core_team: !!user.is_core_team,
      role_id: user.role_id
    };
    const token = generateToken(payload);

    // 6. Create Response and set secure httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        veltech_id: user.veltech_id,
        name: user.name,
        email: user.email,
        role: user.role,
        discipline: user.discipline,
        is_core_team: !!user.is_core_team,
        role_id: user.role_id
      }
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/'
    });

    // Write login history and session tracking (non-blocking safeguard)
    try {
      await query(
        'INSERT INTO login_history (user_id, email_attempted, status, ip_address, device_info) VALUES (?, ?, ?, ?, ?)',
        [user.id, emailNormalized, 'success', ipAddress, userAgent]
      );
      await query(
        'INSERT INTO user_sessions (user_id, token, device_info, ip_address) VALUES (?, ?, ?, ?)',
        [user.id, token, userAgent, ipAddress]
      );
      await logActivity(user.id, user.name, user.role, user.email, 'Logged in successfully', 'Auth', 'Success');
    } catch (logErr) {
      console.warn('[LOGIN] Non-critical session log write warning:', logErr);
    }

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
