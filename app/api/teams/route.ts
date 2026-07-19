import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { getTeamCompliance } from '@/lib/teams';

// GET /api/teams - Get current user's team and compliance
export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a leader
    let teams = await query(
      'SELECT id FROM teams WHERE leader_id = ?',
      [auth.userId]
    );

    // If not a leader, check if they are a member
    if (!teams || teams.length === 0) {
      teams = await query(
        'SELECT team_id as id FROM team_members WHERE user_id = ?',
        [auth.userId]
      );
    }

    if (!teams || teams.length === 0) {
      return NextResponse.json({ success: true, team: null });
    }

    const compliance = await getTeamCompliance(teams[0].id);
    return NextResponse.json({ success: true, team: compliance });
  } catch (err: any) {
    console.error('Error fetching team:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/teams - Create a new team
export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { team_name, sector } = body;

    if (!team_name || !sector) {
      return NextResponse.json({ success: false, error: 'Team name and sector are required' }, { status: 400 });
    }

    // Check if user already has a team (as leader or member)
    const existingLeader = await query('SELECT id FROM teams WHERE leader_id = ?', [auth.userId]);
    const existingMember = await query('SELECT id FROM team_members WHERE user_id = ?', [auth.userId]);

    if (existingLeader.length > 0 || existingMember.length > 0) {
      return NextResponse.json(
        { success: false, error: 'User is already in a team' },
        { status: 400 }
      );
    }

    // Create the team
    try {
      const result = await query(
        'INSERT INTO teams (team_name, sector, leader_id) VALUES (?, ?, ?)',
        [team_name, sector, auth.userId]
      );
      
      const newTeamId = result.insertId;
      const compliance = await getTeamCompliance(newTeamId);
      
      return NextResponse.json({ success: true, team: compliance }, { status: 201 });
    } catch (dbErr: any) {
      if (dbErr.code === 'ER_DUP_ENTRY' || dbErr.errno === 1062) {
        return NextResponse.json({ success: false, error: 'Team name is already taken' }, { status: 409 });
      }
      throw dbErr;
    }
  } catch (err: any) {
    console.error('Error creating team:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/teams - Update team details (leader only)
export async function PATCH(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { team_name, sector } = body;

    if (!team_name || !sector) {
      return NextResponse.json({ success: false, error: 'Team name and sector are required' }, { status: 400 });
    }

    // Verify user is leader
    const teams = await query('SELECT id FROM teams WHERE leader_id = ?', [auth.userId]);
    if (!teams || teams.length === 0) {
      return NextResponse.json({ success: false, error: 'Only the team leader can update team details' }, { status: 403 });
    }
    const teamId = teams[0].id;

    try {
      await query(
        'UPDATE teams SET team_name = ?, sector = ? WHERE id = ?',
        [team_name, sector, teamId]
      );
      const compliance = await getTeamCompliance(teamId);
      return NextResponse.json({ success: true, team: compliance });
    } catch (dbErr: any) {
      if (dbErr.code === 'ER_DUP_ENTRY' || dbErr.errno === 1062) {
        return NextResponse.json({ success: false, error: 'Team name is already taken' }, { status: 409 });
      }
      throw dbErr;
    }
  } catch (err: any) {
    console.error('Error updating team:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

