import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Find the user by invitation token
    const users = await query(
      'SELECT id, name, email, role, invitation_expires FROM users WHERE invitation_token = ?',
      [token]
    );

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired invitation link.' },
        { status: 400 }
      );
    }

    const user = users[0];

    // Check if token has expired
    if (new Date(user.invitation_expires).getTime() < Date.now()) {
      return NextResponse.json(
        { success: false, error: 'Invitation link has expired. Please ask the administrator to trigger a new invite.' },
        { status: 400 }
      );
    }

    // Hash the password and activate the account
    const hash = await hashPassword(password);
    await query(
      `UPDATE users 
       SET password_hash = ?, status = 'active', invitation_token = NULL, invitation_expires = NULL 
       WHERE id = ?`,
      [hash, user.id]
    );

    await logActivity(user.id, user.name, user.role, user.email, 'Completed core team account setup and password configuration', 'Auth', 'Success');

    return NextResponse.json({
      success: true,
      message: 'Account configured successfully! You can now log in.'
    });
  } catch (err: any) {
    console.error('[SETUP PASSWORD] Setup password error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
