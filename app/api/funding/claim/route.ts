import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET /api/funding/claim - Retrieve funding claims
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
      SELECT fr.id, fr.team_id, fr.requested_amount, fr.itemized_budget, fr.status, fr.receipts_url, fr.created_at,
             t.team_name
      FROM funding_requests fr
      JOIN teams t ON fr.team_id = t.id
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    // Students can only view their own team's requests
    if (auth.role === 'student') {
      const userTeams = await query(
        `SELECT id FROM teams WHERE leader_id = ?
         UNION
         SELECT team_id as id FROM team_members WHERE user_id = ?`,
        [auth.userId, auth.userId]
      );
      if (!userTeams || userTeams.length === 0) {
        return NextResponse.json({ success: true, claims: [] });
      }
      conditions.push('fr.team_id = ?');
      params.push(userTeams[0].id);
    } else if (teamIdParam) {
      conditions.push('fr.team_id = ?');
      params.push(parseInt(teamIdParam, 10));
    }

    if (statusParam) {
      conditions.push('fr.status = ?');
      params.push(statusParam);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ' ORDER BY fr.created_at DESC';

    const claims = await query(sql, params);
    return NextResponse.json({ success: true, claims });
  } catch (err: any) {
    console.error('Error fetching funding claims:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/funding/claim - Submit a new funding claim
export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (auth.role !== 'student') {
      return NextResponse.json({ success: false, error: 'Only students can request funding' }, { status: 403 });
    }

    const body = await req.json();
    const { requested_amount, itemized_budget, receipts_url } = body;

    if (!requested_amount || !itemized_budget) {
      return NextResponse.json({ success: false, error: 'Requested amount and itemized budget are required' }, { status: 400 });
    }

    const amount = parseFloat(requested_amount);
    if (isNaN(amount) || amount <= 0 || amount > 50000) {
      return NextResponse.json({ success: false, error: 'Requested amount must be between ₹1 and ₹50,000' }, { status: 400 });
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

    // Convert budget to string if it is an object
    const budgetJsonStr = typeof itemized_budget === 'object' 
      ? JSON.stringify(itemized_budget) 
      : itemized_budget;

    const result = await query(
      `INSERT INTO funding_requests (team_id, requested_amount, itemized_budget, status, receipts_url)
       VALUES (?, ?, ?, 'pending_advisor', ?)`,
      [teamId, amount, budgetJsonStr, receipts_url || null]
    );

    return NextResponse.json(
      { success: true, message: 'Funding request submitted successfully', claimId: result.insertId },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Error creating funding claim:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
