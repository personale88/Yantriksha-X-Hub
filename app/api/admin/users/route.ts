import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import { sendEmail } from '@/lib/email';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Access Denied' }, { status: 403 });
    }

    // Fetch all users with basic columns
    const users = await query(`
      SELECT id, veltech_id, name, email, role, discipline, status, phone_number, year_of_studying, branch, created_at 
      FROM users 
      ORDER BY name ASC
    `);

    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    console.error('Admin users GET error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Access Denied' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, status, role, discipline, name, email } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing User ID' }, { status: 400 });
    }

    // Update status or other parameters
    if (status !== undefined) {
      const prevUsers = await query('SELECT name, email, status FROM users WHERE id = ?', [userId]);
      const prevUser = prevUsers && prevUsers.length > 0 ? prevUsers[0] : null;

      await query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);
      await logActivity(
        auth.userId,
        auth.email,
        auth.role,
        auth.email,
        `Updated user ID ${userId} status to: ${status}`,
        'User Management',
        'Success'
      );

      // Welcome email if status transitions from pending to active
      if (prevUser && prevUser.status === 'pending' && status === 'active') {
        await sendEmail({
          to: prevUser.email,
          subject: 'Join Request Approved! Welcome to Yantriksha X Hub',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
              <h2 style="color: #10b981;">Welcome to the Club!</h2>
              <p>Dear <strong>${prevUser.name}</strong>,</p>
              <p>We are thrilled to let you know that your request to join <strong>Yantriksha X Hub</strong> has been accepted by the Admin!</p>
              <p>Your account is now fully activated. You can log in, establish your cross-disciplinary team, and begin progressing through the 14-stage academic incubator roadmap.</p>
              <p style="margin: 24px 0 10px 0;">
                <a href="http://localhost:3000/login" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">Log In to Platform</a>
              </p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
              <p style="font-size: 12px; color: #64748b;">Yantriksha X Hub Incubation System</p>
            </div>
          `
        });
      }
    } else {
      await query(
        'UPDATE users SET name = ?, email = ?, role = ?, discipline = ? WHERE id = ?',
        [name, email, role, discipline, userId]
      );
      await logActivity(
        auth.userId,
        auth.email,
        auth.role,
        auth.email,
        `Modified profiles of user ID ${userId}`,
        'User Management',
        'Success'
      );
    }

    return NextResponse.json({ success: true, message: 'User updated successfully' });
  } catch (err: any) {
    console.error('Admin users PUT error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Access Denied' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userIdStr = searchParams.get('userId');
    if (!userIdStr) {
      return NextResponse.json({ success: false, error: 'Missing User ID' }, { status: 400 });
    }

    const userId = parseInt(userIdStr, 10);

    // Prevent self-deletion
    if (userId === auth.userId) {
      return NextResponse.json({ success: false, error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Delete user (cascade will delete registrations / memberships)
    await query('DELETE FROM users WHERE id = ?', [userId]);

    await logActivity(
      auth.userId,
      auth.email,
      auth.role,
      auth.email,
      `Permanently deleted user ID ${userId}`,
      'User Management',
      'Success'
    );

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (err: any) {
    console.error('Admin users DELETE error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
