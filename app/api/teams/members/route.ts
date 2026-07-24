import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { getTeamCompliance } from '@/lib/teams';

// GET /api/teams/members - Get all members of a team
export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const teamIdParam = searchParams.get('team_id');

    if (!teamIdParam) {
      return NextResponse.json({ success: false, error: 'Team ID is required' }, { status: 400 });
    }

    const teamId = parseInt(teamIdParam, 10);

    // Retrieve leader user_id
    const teams = await query('SELECT leader_id FROM teams WHERE id = ?', [teamId]);
    if (!teams || teams.length === 0) {
      return NextResponse.json({ success: false, error: 'Team not found' }, { status: 404 });
    }
    const leaderId = teams[0].leader_id;

    // Fetch leader and members list including project_role
    const members = await query(
      `SELECT id, name, email, role, discipline, branch, year_of_studying, phone_number, veltech_id,
              'Project Leader' as project_role
       FROM users 
       WHERE id = ?
       UNION
       SELECT u.id, u.name, u.email, u.role, u.discipline, u.branch, u.year_of_studying, u.phone_number, u.veltech_id,
              tm.project_role
       FROM team_members tm 
       JOIN users u ON tm.user_id = u.id 
       WHERE tm.team_id = ?`,
      [leaderId, teamId]
    );

    return NextResponse.json({ success: true, members });
  } catch (err: any) {
    console.error('Error fetching team members:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/teams/members - Add a member to the team
export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { user_id, project_role } = body;

    if (!user_id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    // 1. Verify that the authenticated user is the leader of a team
    const teams = await query('SELECT id, leader_id FROM teams WHERE leader_id = ?', [auth.userId]);
    if (!teams || teams.length === 0) {
      return NextResponse.json({ success: false, error: 'Only the team leader can add members' }, { status: 403 });
    }
    const teamId = teams[0].id;

    // 2. Fetch the candidate user
    const targetUsers = await query('SELECT id, name, role FROM users WHERE id = ?', [user_id]);
    if (!targetUsers || targetUsers.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // 3. Enforce 10-member limit check
    const compliance = await getTeamCompliance(teamId);
    if (compliance && compliance.memberCount >= 10) {
      return NextResponse.json({ success: false, error: 'Team size cannot exceed 10 members' }, { status: 400 });
    }

    // 4. Check if the target user is already in any team
    const isLeader = await query('SELECT id FROM teams WHERE leader_id = ?', [user_id]);
    const isMember = await query('SELECT id FROM team_members WHERE user_id = ?', [user_id]);
    if (isLeader.length > 0 || isMember.length > 0) {
      return NextResponse.json({ success: false, error: 'Target user is already in a team' }, { status: 400 });
    }

    // 5. Add user to the team with project role
    await query(
      'INSERT INTO team_members (team_id, user_id, project_role) VALUES (?, ?, ?)',
      [teamId, user_id, project_role || 'Developer']
    );

    const updatedCompliance = await getTeamCompliance(teamId);
    return NextResponse.json({ success: true, team: updatedCompliance }, { status: 201 });
  } catch (err: any) {
    console.error('Error adding team member:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/teams/members - Update a member's project role
export async function PUT(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { user_id, project_role } = body;

    if (!user_id || !project_role) {
      return NextResponse.json({ success: false, error: 'User ID and project role are required' }, { status: 400 });
    }

    // Verify leader
    const teams = await query('SELECT id FROM teams WHERE leader_id = ?', [auth.userId]);
    if (!teams || teams.length === 0) {
      return NextResponse.json({ success: false, error: 'Only the team leader can update member roles' }, { status: 403 });
    }
    const teamId = teams[0].id;

    await query(
      'UPDATE team_members SET project_role = ? WHERE team_id = ? AND user_id = ?',
      [project_role.trim(), teamId, parseInt(user_id, 10)]
    );

    return NextResponse.json({ success: true, message: 'Member project role updated successfully' });
  } catch (err: any) {
    console.error('Error updating team member role:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/teams/members - Remove a member from the team
export async function DELETE(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    // 1. Verify that the authenticated user is the leader of the team
    const teams = await query('SELECT id FROM teams WHERE leader_id = ?', [auth.userId]);
    if (!teams || teams.length === 0) {
      return NextResponse.json({ success: false, error: 'Only the team leader can remove members' }, { status: 403 });
    }
    const teamId = teams[0].id;

    // 2. Remove the user from team_members
    const result = await query(
      'DELETE FROM team_members WHERE team_id = ? AND user_id = ?',
      [teamId, parseInt(user_id, 10)]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Member not found in team' }, { status: 404 });
    }

    const updatedCompliance = await getTeamCompliance(teamId);
    return NextResponse.json({ success: true, team: updatedCompliance });
  } catch (err: any) {
    console.error('Error removing team member:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
