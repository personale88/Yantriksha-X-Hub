import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET /api/milestones - Fetch milestone reports
export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const teamIdParam = searchParams.get('team_id');
    const statusParam = searchParams.get('status');

    let sql = `
      SELECT pr.id, pr.team_id, pr.submitted_by, pr.milestone_step, pr.report_content, pr.file_url, pr.mentor_feedback, pr.status, pr.created_at,
             t.team_name, u.name as submitter_name
      FROM progress_reports pr
      JOIN teams t ON pr.team_id = t.id
      JOIN users u ON pr.submitted_by = u.id
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    // Filter by role permissions: Students can only view their own team's milestones
    if (auth.role === 'student') {
      const userTeams = await query(
        `SELECT id FROM teams WHERE leader_id = ?
         UNION
         SELECT team_id as id FROM team_members WHERE user_id = ?`,
        [auth.userId, auth.userId]
      );
      if (!userTeams || userTeams.length === 0) {
        return NextResponse.json({ success: true, reports: [] });
      }
      conditions.push('pr.team_id = ?');
      params.push(userTeams[0].id);
    } else if (teamIdParam) {
      conditions.push('pr.team_id = ?');
      params.push(parseInt(teamIdParam, 10));
    }

    if (statusParam) {
      conditions.push('pr.status = ?');
      params.push(statusParam);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ' ORDER BY pr.created_at DESC';

    const reports = await query(sql, params);
    return NextResponse.json({ success: true, reports });
  } catch (err: any) {
    console.error('Error fetching milestones:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/milestones - Submit a new milestone report
export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Must be a student to submit a report
    if (auth.role !== 'student') {
      return NextResponse.json({ success: false, error: 'Only students can submit reports' }, { status: 403 });
    }

    const body = await req.json();
    const { milestone_step, report_content, file_url } = body;

    if (!milestone_step || !report_content) {
      return NextResponse.json({ success: false, error: 'Milestone step and report content are required' }, { status: 400 });
    }

    // Find user's team
    let teams = await query('SELECT id FROM teams WHERE leader_id = ?', [auth.userId]);
    if (!teams || teams.length === 0) {
      teams = await query('SELECT team_id as id FROM team_members WHERE user_id = ?', [auth.userId]);
    }

    if (!teams || teams.length === 0) {
      return NextResponse.json({ success: false, error: 'You are not part of any team' }, { status: 400 });
    }
    const teamId = teams[0].id;

    // Insert milestone report
    const result = await query(
      `INSERT INTO progress_reports (team_id, submitted_by, milestone_step, report_content, file_url, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [teamId, auth.userId, parseInt(milestone_step, 10), report_content, file_url || null]
    );

    return NextResponse.json(
      { success: true, message: 'Report submitted successfully', reportId: result.insertId },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Error submitting milestone:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
