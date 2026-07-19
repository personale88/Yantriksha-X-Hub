import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Access Denied' }, { status: 403 });
    }

    // 1. Total & Active Students
    const totalStudentsRes = await query("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
    const activeStudentsRes = await query("SELECT COUNT(*) as count FROM users WHERE role = 'student' AND status = 'active'");
    
    // 2. Clubs Count
    const totalClubsRes = await query("SELECT COUNT(*) as count FROM clubs");
    
    // 3. Events Counts
    const eventsRes = await query("SELECT status, COUNT(*) as count FROM events GROUP BY status");
    let upcomingEvents = 0;
    let ongoingEvents = 0;
    let completedEvents = 0;
    eventsRes.forEach((row: any) => {
      if (row.status === 'upcoming') upcomingEvents = row.count;
      else if (row.status === 'ongoing') ongoingEvents = row.count;
      else if (row.status === 'completed') completedEvents = row.count;
    });

    // 4. Registrations Count
    const totalRegsRes = await query("SELECT COUNT(*) as count FROM event_registrations");

    // 5. Pending approvals: milestone reports status='pending' + funding requests status like 'pending%' + pending users
    const pendingReportsRes = await query("SELECT COUNT(*) as count FROM progress_reports WHERE status = 'pending'");
    const pendingFundingRes = await query("SELECT COUNT(*) as count FROM funding_requests WHERE status LIKE 'pending%'");
    const pendingUsersRes = await query("SELECT COUNT(*) as count FROM users WHERE status = 'pending'");

    // 6. Recent registrations
    const recentRegs = await query(`
      SELECT id, name, email, created_at 
      FROM users 
      WHERE role = 'student' 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    // 7. Recent activity logs
    const recentActivities = await query(`
      SELECT user_name, user_role, action_performed, created_at, status 
      FROM activity_logs 
      ORDER BY created_at DESC 
      LIMIT 6
    `);

    // 8. Latest announcements
    const latestAnnouncements = await query(`
      SELECT id, title, content, is_pinned, created_at 
      FROM announcements 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    // 9. Monthly Registration Trends (mock database entries or actual count)
    const monthlyRegistrations = [
      { name: 'Jan', count: 12 },
      { name: 'Feb', count: 19 },
      { name: 'Mar', count: 28 },
      { name: 'Apr', count: 35 },
      { name: 'May', count: 51 },
      { name: 'Jun', count: 68 },
      { name: 'Jul', count: 85 }
    ];

    // 10. Event participation categories
    const categoryStats = [
      { name: 'Technical', value: 45 },
      { name: 'Startup Sandbox', value: 30 },
      { name: 'Legal IP Workshops', value: 15 },
      { name: 'Business Hackathons', value: 25 }
    ];

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents: totalStudentsRes[0].count,
        activeStudents: activeStudentsRes[0].count,
        totalClubs: totalClubsRes[0].count,
        totalEvents: upcomingEvents + ongoingEvents + completedEvents,
        upcomingEvents,
        ongoingEvents,
        completedEvents,
        totalRegistrations: totalRegsRes[0].count,
        pendingApprovals: pendingReportsRes[0].count + pendingFundingRes[0].count + pendingUsersRes[0].count,
        pendingUsers: pendingUsersRes[0].count,
        recentRegistrations: recentRegs,
        recentActivities,
        latestAnnouncements,
        monthlyRegistrations,
        categoryStats
      }
    });
  } catch (err: any) {
    console.error('Stats endpoint error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
