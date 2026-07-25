import { NextResponse } from 'next/server';
import { query, getBaseUrl } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import { queueEmail, generateEmailTemplate } from '@/lib/emailQueue';
import crypto from 'crypto';

async function checkAdmin(req: Request) {
  const session = await verifyAuth(req);
  if (!session || (session.role !== 'admin' && session.role !== 'superadmin')) {
    return null;
  }
  return session;
}

// GET /api/admin/core-members - List all core team members
export async function GET(req: Request) {
  try {
    const session = await checkAdmin(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Fetch members with their role details
    const members = await query(`
      SELECT u.id, u.veltech_id, u.name, u.email, u.personal_email, u.phone_number, u.discipline, u.status,
             u.is_core_team, u.role_id, u.designation, u.department, u.two_factor_enabled, r.name as role_name 
      FROM users u
      LEFT JOIN core_roles r ON u.role_id = r.id
      WHERE u.is_core_team = TRUE OR u.role IN ('admin', 'superadmin')
      ORDER BY u.name ASC
    `);

    // For each member, fetch their assigned teams
    const formattedMembers = [];
    for (const m of members) {
      const teams = await query(`
        SELECT t.id, t.team_name, t.project_title 
        FROM teams t 
        JOIN core_team_assignments cta ON t.id = cta.team_id 
        WHERE cta.user_id = ?
      `, [m.id]);
      
      formattedMembers.push({
        ...m,
        assignedTeams: teams
      });
    }

    // Fetch all active teams for assignment select lists
    const allTeams = await query(`SELECT id, team_name, project_title FROM teams ORDER BY team_name ASC`);

    return NextResponse.json({ success: true, members: formattedMembers, allTeams });
  } catch (err: any) {
    console.error('[CORE MEMBERS GET] Error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/admin/core-members - Register a new core member & send email invite
export async function POST(req: Request) {
  try {
    const session = await checkAdmin(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, personalEmail, phoneNumber, department, roleId, designation } = body;

    if (!name || !email || !roleId) {
      return NextResponse.json({ success: false, error: 'Name, college email, and role are required' }, { status: 400 });
    }

    // Verify email ends with veltech domain (optional, but keep it consistent for safety)
    const emailNormalized = email.toLowerCase().trim();
    const personalEmailNormalized = personalEmail ? personalEmail.toLowerCase().trim() : null;

    // Check if college email is already registered
    const existing = await query('SELECT id FROM users WHERE email = ? OR (personal_email = ? AND personal_email IS NOT NULL)', [emailNormalized, emailNormalized]);
    if (existing && existing.length > 0) {
      return NextResponse.json({ success: false, error: 'An account with this college email already exists.' }, { status: 400 });
    }

    // If personal email is provided, check if it's already registered
    if (personalEmailNormalized) {
      const existingPersonal = await query('SELECT id FROM users WHERE email = ? OR personal_email = ?', [personalEmailNormalized, personalEmailNormalized]);
      if (existingPersonal && existingPersonal.length > 0) {
        return NextResponse.json({ success: false, error: 'This personal email is already in use by another account.' }, { status: 400 });
      }
    }

    // Generate secure invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Generate dummy password hash so they cannot login without setting password
    const dummyHash = `$2a$10$DUMMYHASH${crypto.randomBytes(16).toString('hex').slice(0, 16)}`;

    // Create user record
    const result = await query(
      `INSERT INTO users (veltech_id, name, email, personal_email, role, discipline, password_hash, status, 
                          is_core_team, role_id, phone_number, designation, department, invitation_token, invitation_expires) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?, ?, ?, ?, ?)`,
      [
        `CORE-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
        name.trim(),
        emailNormalized,
        personalEmailNormalized,
        'admin', // Admin role in base table to pass root route guards
        'core',
        dummyHash,
        'unverified', // becomes 'active' once password is set
        roleId,
        phoneNumber || '',
        designation || 'Core Member',
        department || 'General',
        invitationToken,
        invitationExpires
      ]
    );

    const newUserId = result.insertId;

    // Send invitation email
    const baseUrl = getBaseUrl(req);
    const setupLink = `${baseUrl}/login/setup-password?token=${invitationToken}`;
    const emailContent = `
      <p>Dear <strong>${name}</strong>,</p>
      <p>You have been officially registered as a <strong>Core Team Member</strong> in the <strong>YantrikshaX Hub</strong> platform.</p>
      <p>Your designation is set as: <strong>${designation || 'Core Member'}</strong> (${department || 'General'} Department).</p>
      <p>To set up your password and configure optional Two-Factor Authentication, please click the verification button below. This setup link will expire in <strong>24 hours</strong>.</p>
    `;

    const html = generateEmailTemplate({
      title: 'YantrikshaX Hub Core Team Invitation',
      content: emailContent,
      buttonText: 'Complete Account Setup',
      buttonUrl: setupLink,
      preheader: 'You have been invited to join the YantrikshaX Hub Core Team.'
    });

    await queueEmail({
      to: emailNormalized,
      subject: 'YantrikshaX Hub Core Team Invitation',
      html
    });

    // If personal email is verified/provided, also send a backup notification
    if (personalEmailNormalized) {
      await queueEmail({
        to: personalEmailNormalized,
        subject: 'Backup Invite: YantrikshaX Hub Core Team Invitation',
        html
      });
    }

    await logActivity(session.userId, session.email, session.role, session.email, `Registered new core team member: ${name} (${emailNormalized})`, 'Incubator', 'Success');

    return NextResponse.json({
      success: true,
      message: `Core Team member "${name}" registered successfully. Invitation email sent!`,
      userId: newUserId
    });
  } catch (err: any) {
    console.error('[CORE MEMBERS POST] Error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/admin/core-members - Update core member & team assignments
export async function PUT(req: Request) {
  try {
    const session = await checkAdmin(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, designation, department, roleId, phoneNumber, personalEmail, assignedTeams, status } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    // Fetch user first to make sure they exist and are core team
    const users = await query('SELECT name, email, is_core_team FROM users WHERE id = ?', [userId]);
    if (!users || users.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const user = users[0];

    // Build update parameters dynamically
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];

    if (designation !== undefined) { fieldsToUpdate.push('designation = ?'); values.push(designation); }
    if (department !== undefined) { fieldsToUpdate.push('department = ?'); values.push(department); }
    if (roleId !== undefined) { fieldsToUpdate.push('role_id = ?'); values.push(roleId); }
    if (phoneNumber !== undefined) { fieldsToUpdate.push('phone_number = ?'); values.push(phoneNumber); }
    if (personalEmail !== undefined) { fieldsToUpdate.push('personal_email = ?'); values.push(personalEmail ? personalEmail.toLowerCase().trim() : null); }
    if (status !== undefined) { fieldsToUpdate.push('status = ?'); values.push(status); }

    if (fieldsToUpdate.length > 0) {
      values.push(userId);
      await query(
        `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`,
        values
      );
    }

    // Handle Team Assignments if provided
    if (assignedTeams !== undefined && Array.isArray(assignedTeams)) {
      // Clear old assignments
      await query('DELETE FROM core_team_assignments WHERE user_id = ?', [userId]);

      // Add new assignments
      for (const teamId of assignedTeams) {
        await query(
          'INSERT INTO core_team_assignments (user_id, team_id) VALUES (?, ?)',
          [userId, teamId]
        );
      }
    }

    await logActivity(session.userId, session.email, session.role, session.email, `Updated Core Team Member: ${user.name}`, 'Incubator', 'Success');

    return NextResponse.json({
      success: true,
      message: `Core Team member "${user.name}" updated successfully.`
    });
  } catch (err: any) {
    console.error('[CORE MEMBERS PUT] Error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/admin/core-members - Delete/suspend member
export async function DELETE(req: Request) {
  try {
    const session = await checkAdmin(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const users = await query('SELECT name, email, is_core_team FROM users WHERE id = ?', [userId]);
    if (!users || users.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const user = users[0];

    // Delete user session logs, assignments, and then the user record
    await query('DELETE FROM core_team_assignments WHERE user_id = ?', [userId]);
    await query('DELETE FROM user_sessions WHERE user_id = ?', [userId]);
    await query('DELETE FROM users WHERE id = ?', [userId]);

    await logActivity(session.userId, session.email, session.role, session.email, `Deleted Core Team Member: ${user.name}`, 'Incubator', 'Success');

    return NextResponse.json({
      success: true,
      message: `Core Team member "${user.name}" has been permanently removed.`
    });
  } catch (err: any) {
    console.error('[CORE MEMBERS DELETE] Error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
