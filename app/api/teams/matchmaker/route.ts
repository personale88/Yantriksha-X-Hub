import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getTeamCompliance } from '@/lib/teams';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const sector = searchParams.get('sector') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    // 1. Build WHERE conditions
    const conditions: string[] = [];
    const params: any[] = [];

    if (search) {
      conditions.push('(t.team_name LIKE ? OR t.sector LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (sector) {
      conditions.push('t.sector = ?');
      params.push(sector);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 2. Fetch total count for pagination metadata
    const countSql = `SELECT COUNT(*) as total FROM teams t ${whereClause}`;
    const countResult = await query(countSql, params);
    const totalItems = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalItems / limit);

    // 3. Fetch paginated list
    const sql = `
      SELECT t.id, t.team_name, t.sector, t.current_stage, t.created_at, u.name as leader_name
      FROM teams t
      JOIN users u ON t.leader_id = u.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const teams = await query(sql, params);

    // 4. Retrieve compliance data for each team
    const teamsWithCompliance = [];
    for (const team of teams) {
      const compliance = await getTeamCompliance(team.id);
      if (compliance) {
        teamsWithCompliance.push({
          ...team,
          memberCount: compliance.memberCount,
          compliancePercentage: compliance.compliancePercentage,
          isCompliant: compliance.errors.length === 0,
          errors: compliance.errors
        });
      }
    }

    return NextResponse.json({
      success: true,
      teams: teamsWithCompliance,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages
      }
    });
  } catch (err: any) {
    console.error('Matchmaker API error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
