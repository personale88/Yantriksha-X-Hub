import { query } from './db';

export async function logActivity(
  userId: number | null,
  userName: string,
  userRole: string,
  email: string,
  actionPerformed: string,
  module: string,
  status: 'Success' | 'Failed'
) {
  try {
    await query(
      `INSERT INTO activity_logs (user_id, user_name, user_role, email, action_performed, module, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, userName, userRole, email, actionPerformed, module, status]
    );

    // If it's an administrative action (Admin or Super Admin doing club, event, configuration updates)
    if (userRole === 'admin' || userRole === 'mentor' || userRole === 'faculty') {
      await logAudit(userName, userRole, actionPerformed, status);
    }
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

export async function logAudit(
  actionBy: string,
  role: string,
  description: string,
  status: 'Success' | 'Failed'
) {
  try {
    await query(
      `INSERT INTO audit_logs (action_by, action_description, status)
       VALUES (?, ?, ?)`,
      [`${actionBy} (${role})`, description, status]
    );
  } catch (err) {
    console.error('Failed to log audit:', err);
  }
}
