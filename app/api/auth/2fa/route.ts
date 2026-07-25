import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth, verifyTOTP, generateToken, JWTPayload } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

function base32Encode(buffer: Buffer): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }
  return output;
}

// GET: Generate a new 2FA secret for setup
export async function GET(req: Request) {
  try {
    const session = await verifyAuth(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Generate random 10 bytes -> 16 character base32 secret
    const buffer = crypto.randomBytes(10);
    const secret = base32Encode(buffer);
    const otpauthUrl = `otpauth://totp/YantrikshaXHub:${encodeURIComponent(session.email)}?secret=${secret}&issuer=YantrikshaXHub`;

    return NextResponse.json({
      success: true,
      secret,
      otpauthUrl
    });
  } catch (err: any) {
    console.error('[2FA GET] Error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Verify & Enable / Verify & Disable / Verify & Complete Login
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, code, secret, tempToken } = body;

    // SCENARIO 1: Login Verification via 2FA
    if (action === 'verify-login') {
      if (!tempToken || !code) {
        return NextResponse.json({ success: false, error: 'Token and code are required' }, { status: 400 });
      }

      // Verify tempToken
      const JWT_SECRET = process.env.JWT_SECRET || 'yantriksha_secret_key_123_change_me_in_prod';
      let decoded: any = null;
      try {
        decoded = jwt.verify(tempToken, JWT_SECRET);
      } catch (err) {
        return NextResponse.json({ success: false, error: '2FA session expired. Please log in again.' }, { status: 400 });
      }

      if (!decoded || !decoded.userId || !decoded.require2fa) {
        return NextResponse.json({ success: false, error: 'Invalid 2FA session.' }, { status: 400 });
      }

      // Fetch user
      const users = await query(
        `SELECT id, veltech_id, name, email, role, discipline, status, is_core_team, role_id, two_factor_secret 
         FROM users WHERE id = ?`,
        [decoded.userId]
      );

      if (!users || users.length === 0) {
        return NextResponse.json({ success: false, error: 'User not found.' }, { status: 400 });
      }

      const user = users[0];

      // Verify code
      const isValid = verifyTOTP(code, user.two_factor_secret);
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Invalid verification code. Please try again.' }, { status: 401 });
      }

      // Success -> Generate token & set cookie
      const payload: JWTPayload = {
        userId: user.id,
        veltech_id: user.veltech_id,
        role: user.role,
        email: user.email,
        is_core_team: !!user.is_core_team,
        role_id: user.role_id
      };
      const token = generateToken(payload);

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

      const userAgent = req.headers.get('user-agent') || 'Unknown Device';
      const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

      await query(
        'INSERT INTO login_history (user_id, email_attempted, status, ip_address, device_info) VALUES (?, ?, ?, ?, ?)',
        [user.id, user.email, 'success', ipAddress, userAgent]
      );
      await query(
        'INSERT INTO user_sessions (user_id, token, device_info, ip_address) VALUES (?, ?, ?, ?)',
        [user.id, token, userAgent, ipAddress]
      );

      await logActivity(user.id, user.name, user.role, user.email, 'Passed Two-Factor Authentication checks and logged in', 'Auth', 'Success');

      return response;
    }

    // AUTHENTICATED ACTIONS BELOW
    const session = await verifyAuth(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // SCENARIO 2: Enable 2FA
    if (action === 'enable') {
      if (!secret || !code) {
        return NextResponse.json({ success: false, error: 'Secret and verification code are required' }, { status: 400 });
      }

      // Verify the code against the proposed secret
      const isValid = verifyTOTP(code, secret);
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Invalid verification code. Setup aborted.' }, { status: 400 });
      }

      // Update database
      await query(
        'UPDATE users SET two_factor_secret = ?, two_factor_enabled = TRUE WHERE id = ?',
        [secret, session.userId]
      );

      await logActivity(session.userId, session.email, session.role, session.email, 'Enabled Two-Factor Authentication', 'Security', 'Success');

      return NextResponse.json({ success: true, message: 'Two-Factor Authentication has been successfully enabled!' });
    }

    // SCENARIO 3: Disable 2FA
    if (action === 'disable') {
      if (!code) {
        return NextResponse.json({ success: false, error: 'Verification code is required to disable 2FA' }, { status: 400 });
      }

      // Fetch active secret
      const users = await query('SELECT two_factor_secret FROM users WHERE id = ?', [session.userId]);
      if (!users || users.length === 0 || !users[0].two_factor_secret) {
        return NextResponse.json({ success: false, error: '2FA is not active on this account.' }, { status: 400 });
      }

      const isValid = verifyTOTP(code, users[0].two_factor_secret);
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Invalid code. Unable to disable 2FA.' }, { status: 400 });
      }

      await query(
        'UPDATE users SET two_factor_secret = NULL, two_factor_enabled = FALSE WHERE id = ?',
        [session.userId]
      );

      await logActivity(session.userId, session.email, session.role, session.email, 'Disabled Two-Factor Authentication', 'Security', 'Success');

      return NextResponse.json({ success: true, message: 'Two-Factor Authentication is now disabled.' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action parameter' }, { status: 400 });
  } catch (err: any) {
    console.error('[2FA POST] Error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
