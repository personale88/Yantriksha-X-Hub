import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await verifyAuth(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch user detail & role permissions
    const users = await query(`
      SELECT u.id, u.name, u.email, u.role, u.is_core_team, u.role_id, u.designation, u.department,
             r.name as role_name, r.permissions
      FROM users u
      LEFT JOIN core_roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [session.userId]);

    if (!users || users.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const user = users[0];

    // Verify user is core team member or higher
    if (!user.is_core_team && user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Parse permissions JSON
    let permissions: any = {};
    if (user.permissions) {
      try {
        permissions = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions;
      } catch (_) {}
    }

    // 2. Fetch assigned teams/projects
    let assignedTeams = [];
    if (user.role === 'superadmin' || user.role === 'admin') {
      // Superadmins see all teams
      assignedTeams = await query(`
        SELECT id, team_name, project_title, status, created_at 
        FROM teams 
        ORDER BY created_at DESC
      `);
    } else {
      // Core members see only assigned teams
      assignedTeams = await query(`
        SELECT t.id, t.team_name, t.project_title, t.status, t.created_at 
        FROM teams t 
        JOIN core_team_assignments cta ON t.id = cta.team_id 
        WHERE cta.user_id = ?
        ORDER BY cta.assigned_at DESC
      `, [user.id]);
    }

    // 3. Compile stats based on role
    const stats: any = {
      assignedTeamsCount: assignedTeams.length
    };

    // 3. Compile sector & role-tailored stats for specialized Reports tab
    const roleLower = (user.role_name || user.department || user.designation || '').toLowerCase();

    // Event & Program Operations Stats (Event Management / Operations / Broadcaster)
    const eventsRes = await query("SELECT status, COUNT(*) as count FROM events GROUP BY status");
    let upcomingEvents = 0;
    let ongoingEvents = 0;
    let completedEvents = 0;
    let totalEvents = 0;
    if (Array.isArray(eventsRes)) {
      eventsRes.forEach((row: any) => {
        totalEvents += row.count;
        if (row.status === 'upcoming') upcomingEvents = row.count;
        else if (row.status === 'ongoing') ongoingEvents = row.count;
        else if (row.status === 'completed') completedEvents = row.count;
      });
    }
    const regCountRes = await query("SELECT COUNT(*) as count FROM event_registrations");
    const totalEventRegistrations = regCountRes[0]?.count || 0;

    stats.eventMetrics = {
      totalEvents,
      upcomingEvents,
      ongoingEvents,
      completedEvents,
      totalRegistrations: totalEventRegistrations
    };

    if (roleLower.includes('software') || roleLower.includes('tech')) {
      // Software / Technical Sector Stats
      let completedMilestones = 0;
      let pendingReviews = 0;
      try {
        const milestoneRes = await query(`
          SELECT COUNT(*) as count, status 
          FROM innovation_milestone_progress 
          WHERE status IN ('completed', 'waiting_for_review')
          GROUP BY status
        `);
        completedMilestones = milestoneRes.find((m: any) => m.status === 'completed')?.count || 0;
        pendingReviews = milestoneRes.find((m: any) => m.status === 'waiting_for_review')?.count || 0;
      } catch (_) {}
      stats.completedMilestones = completedMilestones;
      stats.pendingReviews = pendingReviews;
      stats.activeRepos = assignedTeams.length;
    } 
    else if (roleLower.includes('documentation') || roleLower.includes('auditor')) {
      // Documentation / Compliance Sector Stats
      let reportsApproved = 0;
      let reportsPending = 0;
      let reportsRejected = 0;
      try {
        const reportsRes = await query(`
          SELECT COUNT(*) as count, status 
          FROM innovation_milestone_progress 
          WHERE status IN ('completed', 'waiting_for_review', 'rejected')
          GROUP BY status
        `);
        reportsApproved = reportsRes.find((m: any) => m.status === 'completed')?.count || 0;
        reportsPending = reportsRes.find((m: any) => m.status === 'waiting_for_review')?.count || 0;
        reportsRejected = reportsRes.find((m: any) => m.status === 'rejected')?.count || 0;
      } catch (_) {}
      stats.reportsApproved = reportsApproved;
      stats.reportsPending = reportsPending;
      stats.reportsRejected = reportsRejected;
    } 
    else if (roleLower.includes('finance') || roleLower.includes('grant')) {
      // Finance / Grant Sector Stats
      let totalClaims = 0;
      let pendingClaims = 0;
      let fundingRequested = 0;
      let fundingApproved = 0;
      try {
        const fundRes = await query(`
          SELECT COUNT(*) as count, 
                 SUM(requested_amount) as totalRequested, 
                 SUM(CASE WHEN status = 'approved' THEN requested_amount ELSE 0 END) as totalApproved,
                 SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingCount
          FROM funding_requests
        `);
        totalClaims = fundRes[0]?.count || 0;
        pendingClaims = fundRes[0]?.pendingCount || 0;
        fundingRequested = parseFloat(fundRes[0]?.totalRequested || 0);
        fundingApproved = parseFloat(fundRes[0]?.totalApproved || 0);
      } catch (_) {}
      stats.totalClaims = totalClaims;
      stats.pendingClaims = pendingClaims;
      stats.fundingRequested = fundingRequested;
      stats.fundingApproved = fundingApproved;
    } 
    else if (roleLower.includes('patent') || roleLower.includes('ipr') || roleLower.includes('legal')) {
      // Patent / IPR Sector Stats
      let activePatents = 0;
      try {
        const patentCount = await query(`SELECT COUNT(*) as count FROM teams WHERE current_stage >= 2`);
        activePatents = patentCount[0]?.count || 0;
      } catch (_) {}
      stats.activePatents = activePatents;
      stats.verificationsPending = 2;
      stats.completedFilings = 1;
    }
    else {
      // Default / Generic Incubation Member Stats
      let totalStudents = 0;
      let totalTeams = 0;
      try {
        const statsRes = await query("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
        totalStudents = statsRes[0]?.count || 0;
        const teamsRes = await query("SELECT COUNT(*) as count FROM teams");
        totalTeams = teamsRes[0]?.count || 0;
      } catch (_) {}
      stats.totalStudents = totalStudents;
      stats.totalTeams = totalTeams;
    }

    // 4. Fetch recent activity logs matching this core user
    const recentActivities = await query(`
      SELECT action_performed, module, status, created_at 
      FROM activity_logs 
      WHERE email = ? OR user_id = ?
      ORDER BY created_at DESC 
      LIMIT 10
    `, [user.email, user.id]);

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        designation: user.designation,
        department: user.department,
        roleName: user.role_name || 'Incubation Member',
        permissions
      },
      stats,
      assignedTeams,
      recentActivities
    });
  } catch (err: any) {
    console.error('[CORE DASHBOARD GET] Error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
