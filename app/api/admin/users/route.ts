import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import { queueEmail, generateEmailTemplate } from '@/lib/emailQueue';

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

      if (prevUser) {
        // Welcome email if status transitions from pending to active
        if (prevUser.status === 'pending' && status === 'active') {
          const welcomeContent = `
            <p>Dear <strong>${prevUser.name}</strong>,</p>
            <p>We are thrilled to let you know that your request to join <strong>YantrikshaX Hub</strong> has been reviewed and accepted by the Admins!</p>
            <p>Your student account is now fully activated. You can log in, form/manage your cross-disciplinary teams, register for workshops, and progress through our 14-stage academic incubator roadmap.</p>
            <p>Welcome to the incubation community!</p>
          `;
          const welcomeHtml = generateEmailTemplate({
            title: 'Welcome to YantrikshaX Hub!',
            content: welcomeContent,
            buttonText: 'Log In to Platform',
            buttonUrl: 'http://localhost:3000/login',
            preheader: 'Your request to join YantrikshaX Hub has been approved.'
          });

          await queueEmail({
            to: prevUser.email,
            subject: 'Welcome to YantrikshaX Hub!',
            html: welcomeHtml
          });
        }
        
        // Deactivation notice if status transitions from active to inactive
        else if (prevUser.status === 'active' && status === 'inactive') {
          const deactContent = `
            <p>Dear <strong>${prevUser.name}</strong>,</p>
            <p>This is to notify you that your active membership status in <strong>YantrikshaX Hub</strong> has been deactivated by the administrator.</p>
            <p>You will not be able to log in or access internal dashboard features while your account is inactive.</p>
            <p>If you believe this is an error or need further details regarding your account standing, please contact the coordinator.</p>
          `;
          const deactHtml = generateEmailTemplate({
            title: 'Club Membership Status Update',
            content: deactContent,
            preheader: 'Your YantrikshaX Hub membership has been deactivated.'
          });

          await queueEmail({
            to: prevUser.email,
            subject: 'Notification of Club Membership Status',
            html: deactHtml
          });
        }
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

    // Fetch user status before deletion to determine email trigger
    const targetUsers = await query('SELECT name, email, status FROM users WHERE id = ?', [userId]);
    const targetUser = targetUsers && targetUsers.length > 0 ? targetUsers[0] : null;

    if (targetUser) {
      if (targetUser.status === 'pending') {
        // Send rejection email
        const rejectContent = `
          <p>Dear <strong>${targetUser.name}</strong>,</p>
          <p>Thank you for your interest in joining <strong>YantrikshaX Hub</strong>.</p>
          <p>We regret to inform you that we are unable to accept your membership request at this time.</p>
          <p>If you believe there has been a mistake, or wish to seek further clarification, please contact the coordinator at <strong>9182169185</strong>.</p>
          <p>We appreciate your time and wish you the best in your academic endeavors.</p>
        `;
        const rejectHtml = generateEmailTemplate({
          title: 'YantrikshaX Hub Application Update',
          content: rejectContent,
          preheader: 'Update regarding your club membership application.'
        });

        await queueEmail({
          to: targetUser.email,
          subject: 'Update Regarding Your Club Membership Request',
          html: rejectHtml
        });
      } else if (targetUser.status === 'active') {
        // Send removal email
        const removeContent = `
          <p>Dear <strong>${targetUser.name}</strong>,</p>
          <p>This is to inform you that your membership account in <strong>YantrikshaX Hub</strong> has been terminated/removed by the administration.</p>
          <p>Your team memberships, mentor bookings, and roadmap progression files have been deleted.</p>
          <p>If you need clarification regarding this removal, please reach out to the coordinator.</p>
        `;
        const removeHtml = generateEmailTemplate({
          title: 'Account Removal Notification',
          content: removeContent,
          preheader: 'Your YantrikshaX Hub account has been removed.'
        });

        await queueEmail({
          to: targetUser.email,
          subject: 'Notification of Club Membership Status',
          html: removeHtml
        });
      }
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
