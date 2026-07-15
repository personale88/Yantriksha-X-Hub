import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET /api/bookings - Fetch mentorship bookings
export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const teamIdParam = searchParams.get('team_id');
    const mentorIdParam = searchParams.get('mentor_id');
    const statusParam = searchParams.get('status');

    let sql = `
      SELECT b.id, b.team_id, b.mentor_id, b.scheduled_time, b.mode, b.meeting_link_or_venue, b.status, b.created_at,
             t.team_name, u.name as mentor_name
      FROM bookings b
      JOIN teams t ON b.team_id = t.id
      JOIN users u ON b.mentor_id = u.id
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    // Filter by role: Students only see their own team's bookings
    if (auth.role === 'student') {
      const userTeams = await query(
        `SELECT id FROM teams WHERE leader_id = ?
         UNION
         SELECT team_id as id FROM team_members WHERE user_id = ?`,
        [auth.userId, auth.userId]
      );
      if (!userTeams || userTeams.length === 0) {
        return NextResponse.json({ success: true, bookings: [] });
      }
      conditions.push('b.team_id = ?');
      params.push(userTeams[0].id);
    } else if (auth.role === 'mentor' || auth.role === 'faculty') {
      // Mentors/Faculty see bookings they are assigned to
      conditions.push('b.mentor_id = ?');
      params.push(auth.userId);
    } else {
      // Admin or coordinator can filter
      if (teamIdParam) {
        conditions.push('b.team_id = ?');
        params.push(parseInt(teamIdParam, 10));
      }
      if (mentorIdParam) {
        conditions.push('b.mentor_id = ?');
        params.push(parseInt(mentorIdParam, 10));
      }
    }

    if (statusParam) {
      conditions.push('b.status = ?');
      params.push(statusParam);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ' ORDER BY b.scheduled_time ASC';

    const bookings = await query(sql, params);
    return NextResponse.json({ success: true, bookings });
  } catch (err: any) {
    console.error('Error fetching bookings:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/bookings - Book a mentorship session
export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { team_id, mentor_id, scheduled_time, mode, meeting_link_or_venue } = body;

    if (!team_id || !mentor_id || !scheduled_time || !mode) {
      return NextResponse.json({ success: false, error: 'Team ID, mentor ID, scheduled time, and mode are required' }, { status: 400 });
    }

    if (!['virtual', 'offline'].includes(mode)) {
      return NextResponse.json({ success: false, error: 'Mode must be virtual or offline' }, { status: 400 });
    }

    // 1. If user is a student, verify they are in this team
    if (auth.role === 'student') {
      const userTeams = await query(
        `SELECT id FROM teams WHERE leader_id = ? AND id = ?
         UNION
         SELECT team_id as id FROM team_members WHERE user_id = ? AND team_id = ?`,
        [auth.userId, team_id, auth.userId, team_id]
      );
      if (!userTeams || userTeams.length === 0) {
        return NextResponse.json({ success: false, error: 'You can only book sessions for your own team' }, { status: 403 });
      }
    }

    // 2. Verify mentor exists and has mentor/faculty role
    const mentors = await query('SELECT id FROM users WHERE id = ? AND role IN (\'mentor\', \'faculty\')', [mentor_id]);
    if (!mentors || mentors.length === 0) {
      return NextResponse.json({ success: false, error: 'Selected mentor is not valid' }, { status: 400 });
    }

    // 3. Create booking
    const result = await query(
      `INSERT INTO bookings (team_id, mentor_id, scheduled_time, mode, meeting_link_or_venue, status)
       VALUES (?, ?, ?, ?, ?, 'scheduled')`,
      [team_id, mentor_id, scheduled_time, mode, meeting_link_or_venue || null]
    );

    return NextResponse.json(
      { success: true, message: 'Mentorship booking created successfully', bookingId: result.insertId },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Error creating booking:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
