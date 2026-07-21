import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET /api/users/profile - Get current user profile with preferences
export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const users = await query(`
      SELECT u.id, u.veltech_id, u.name, u.email, u.role, u.discipline, u.phone_number, u.year_of_studying, u.branch, u.school, u.created_at,
             np.club_updates, np.event_notifications, np.general_announcements, np.newsletter, np.recruitment_notifications
      FROM users u
      LEFT JOIN notification_preferences np ON u.id = np.user_id
      WHERE u.id = ?`,
      [auth.userId]
    );

    if (!users || users.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const dbUser = users[0];
    const user = {
      id: dbUser.id,
      veltech_id: dbUser.veltech_id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      discipline: dbUser.discipline,
      phone_number: dbUser.phone_number,
      year_of_studying: dbUser.year_of_studying,
      branch: dbUser.branch,
      school: dbUser.school,
      created_at: dbUser.created_at,
      notificationPreferences: {
        club_updates: dbUser.club_updates === null ? true : !!dbUser.club_updates,
        event_notifications: dbUser.event_notifications === null ? true : !!dbUser.event_notifications,
        general_announcements: dbUser.general_announcements === null ? true : !!dbUser.general_announcements,
        newsletter: dbUser.newsletter === null ? true : !!dbUser.newsletter,
        recruitment_notifications: dbUser.recruitment_notifications === null ? true : !!dbUser.recruitment_notifications,
      }
    };

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    console.error('Error fetching profile:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/users/profile - Update current user profile and preferences
export async function PUT(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone_number, year_of_studying, branch, school, discipline, notificationPreferences } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    const parsedYear = year_of_studying ? parseInt(year_of_studying, 10) : null;

    // 1. Update basic user details
    await query(
      `UPDATE users 
       SET name = ?, phone_number = ?, year_of_studying = ?, branch = ?, school = ?, discipline = ?
       WHERE id = ?`,
      [
        name,
        phone_number || null,
        parsedYear,
        branch || null,
        school || null,
        discipline || 'engineering',
        auth.userId
      ]
    );

    // 2. Update notification preferences if provided
    if (notificationPreferences) {
      const { club_updates, event_notifications, general_announcements, newsletter, recruitment_notifications } = notificationPreferences;
      
      await query(`
        INSERT INTO notification_preferences 
          (user_id, club_updates, event_notifications, general_announcements, newsletter, recruitment_notifications) 
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          club_updates = VALUES(club_updates),
          event_notifications = VALUES(event_notifications),
          general_announcements = VALUES(general_announcements),
          newsletter = VALUES(newsletter),
          recruitment_notifications = VALUES(recruitment_notifications)
      `, [
        auth.userId,
        club_updates === undefined ? true : !!club_updates,
        event_notifications === undefined ? true : !!event_notifications,
        general_announcements === undefined ? true : !!general_announcements,
        newsletter === undefined ? true : !!newsletter,
        recruitment_notifications === undefined ? true : !!recruitment_notifications
      ]);
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });
  } catch (err: any) {
    console.error('Error updating profile:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
