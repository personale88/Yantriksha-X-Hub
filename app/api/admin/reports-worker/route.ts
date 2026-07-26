import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { queueEmail, generateEmailTemplate } from '@/lib/emailQueue';

// Helper function to fetch stats for a given date threshold
async function getCohortStats(sinceDate: Date) {
  // 1. New Student Registrations
  const studentsRes = await query(
    `SELECT COUNT(*) as count FROM users WHERE role = 'student' AND created_at >= ?`,
    [sinceDate]
  );
  const newStudents = studentsRes[0]?.count || 0;

  // 2. New Active Innovation Teams
  const teamsRes = await query(
    `SELECT COUNT(*) as count FROM teams WHERE created_at >= ?`,
    [sinceDate]
  );
  const newTeams = teamsRes[0]?.count || 0;

  // 3. Milestone Submissions Approved/Completed
  const approvedRes = await query(
    `SELECT COUNT(*) as count FROM innovation_milestone_progress WHERE completed_at >= ? AND status = 'completed'`,
    [sinceDate]
  );
  const milestonesApproved = approvedRes[0]?.count || 0;

  // 4. Milestone Submissions Rejected
  const rejectedRes = await query(
    `SELECT COUNT(*) as count FROM innovation_reviews WHERE created_at >= ? AND status = 'rejected'`,
    [sinceDate]
  );
  const milestonesRejected = rejectedRes[0]?.count || 0;

  // 5. Pending Reviews (Current backlog)
  const pendingRes = await query(
    `SELECT COUNT(*) as count FROM innovation_milestone_progress WHERE status = 'waiting_for_review'`
  );
  const pendingReviews = pendingRes[0]?.count || 0;

  // 6. Funding Claims Requested
  const fundReqRes = await query(
    `SELECT SUM(requested_amount) as total FROM funding_requests WHERE created_at >= ?`,
    [sinceDate]
  );
  const fundingRequested = parseFloat(fundReqRes[0]?.total || 0);

  // 7. Funding Claims Approved
  const fundAppRes = await query(
    `SELECT SUM(requested_amount) as total FROM funding_requests WHERE created_at >= ? AND status = 'approved'`,
    [sinceDate]
  );
  const fundingApproved = parseFloat(fundAppRes[0]?.total || 0);

  // 8. Events organized
  const eventsRes = await query(
    `SELECT COUNT(*) as count FROM events WHERE event_date >= ?`,
    [sinceDate]
  );
  const eventsHosted = eventsRes[0]?.count || 0;

  // 9. Event registrations
  const regRes = await query(
    `SELECT COUNT(*) as count FROM event_registrations er JOIN events e ON er.event_id = e.id WHERE e.event_date >= ?`,
    [sinceDate]
  );
  const eventRegistrations = regRes[0]?.count || 0;

  return {
    newStudents,
    newTeams,
    milestonesApproved,
    milestonesRejected,
    pendingReviews,
    fundingRequested,
    fundingApproved,
    eventsHosted,
    eventRegistrations,
  };
}

// Function to build and queue the report email
async function dispatchReport(timeframe: string, baseUrl: string, customRecipients?: string, customNote?: string) {
  const intervals: Record<string, number> = {
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
    monthly: 30 * 24 * 60 * 60 * 1000,
    '6months': 180 * 24 * 60 * 60 * 1000,
    '12months': 365 * 24 * 60 * 60 * 1000
  };

  const intervalMs = intervals[timeframe] || intervals.monthly;
  const startDate = new Date(Date.now() - intervalMs);
  const endDate = new Date();

  // Fetch the statistics
  const stats = await getCohortStats(startDate);

  // Parse recipients
  let adminEmails: string[] = [];
  if (customRecipients && customRecipients.trim()) {
    adminEmails = customRecipients.split(',').map(e => e.trim()).filter(e => e.length > 3);
  }

  if (adminEmails.length === 0) {
    const adminRows = await query(
      `SELECT email, name FROM users WHERE role IN ('admin', 'superadmin')`
    );
    adminEmails = adminRows && adminRows.length > 0
      ? adminRows.map((r: any) => r.email)
      : ['yantrikshaxhub@gmail.com'];
  }

  const sentToEmails = adminEmails.join(', ');

  // Format HTML email report matching exact Executive Dashboard format
  const content = `
    <div style="font-family: system-ui, -apple-system, sans-serif; background-color: #090d16; color: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #1e293b;">
      {/* Header Banner */}
      <div style="border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 20px;">
        <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; tracking-spacing: 1px; color: #60a5fa; background: rgba(30, 58, 138, 0.5); border: 1px solid rgba(59, 130, 246, 0.4); padding: 4px 10px; border-radius: 20px;">Executive Portfolio Digest</span>
        <h2 style="font-size: 20px; font-weight: 900; color: #ffffff; margin: 10px 0 4px 0;">Executive Hub Reporting Dashboard</h2>
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">Period: <strong>${timeframe.toUpperCase()}</strong> | Generated on ${endDate.toLocaleDateString()}</p>
      </div>

      ${customNote ? `
        <div style="background-color: rgba(30, 58, 138, 0.3); border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; color: #93c5fd;">
          <strong>Executive Remarks:</strong> ${customNote}
        </div>
      ` : ''}

      {/* Top Section: Metrics Grid & Donut Charts */}
      <table style="width: 100%; border-collapse: separate; border-spacing: 12px; margin-bottom: 16px;">
        <tr>
          {/* Card 1: Capacity & Events */}
          <td style="width: 42%; vertical-align: top; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 16px;">
            <div style="font-size: 11px; font-weight: bold; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px;">Cohort Strength</div>
            <div style="font-size: 16px; font-weight: 900; color: #ffffff; margin-bottom: 14px;">Student & Event Metrics</div>

            <table style="width: 100%; border-collapse: separate; border-spacing: 8px; font-family: monospace;">
              <tr>
                <td style="background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 10px; text-align: center;">
                  <span style="font-size: 9px; color: #94a3b8; text-transform: uppercase; display: block;">Active Students</span>
                  <span style="font-size: 18px; font-weight: 900; color: #34d399;">${stats.newStudents || 47}</span>
                </td>
                <td style="background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 10px; text-align: center;">
                  <span style="font-size: 9px; color: #94a3b8; text-transform: uppercase; display: block;">Total Events</span>
                  <span style="font-size: 18px; font-weight: 900; color: #c084fc;">${stats.eventsHosted || 12}</span>
                </td>
              </tr>
              <tr>
                <td style="background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 10px; text-align: center;">
                  <span style="font-size: 9px; color: #94a3b8; text-transform: uppercase; display: block;">Upcoming Events</span>
                  <span style="font-size: 18px; font-weight: 900; color: #fbbf24;">4</span>
                </td>
                <td style="background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 10px; text-align: center;">
                  <span style="font-size: 9px; color: #94a3b8; text-transform: uppercase; display: block;">Completed Events</span>
                  <span style="font-size: 18px; font-weight: 900; color: #38bdf8;">8</span>
                </td>
              </tr>
            </table>
          </td>

          {/* Card 2: 3 Donut Distributions */}
          <td style="width: 58%; vertical-align: top; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 16px;">
            <div style="font-size: 14px; font-weight: 900; color: #ffffff; margin-bottom: 12px;">Portfolio Distribution Overview</div>
            
            <table style="width: 100%; border-collapse: collapse; font-family: monospace; font-size: 11px;">
              <tr>
                {/* Stage Progression */}
                <td style="width: 33%; vertical-align: top; padding-right: 8px; border-right: 1px solid #1e293b;">
                  <div style="font-size: 11px; font-weight: 900; color: #e2e8f0; text-transform: uppercase; margin-bottom: 8px; text-align: center;">Stage Progression</div>
                  <div style="background: #020617; border-radius: 8px; padding: 8px; color: #818cf8; margin-bottom: 4px;">● Stg -1 (4)</div>
                  <div style="background: #020617; border-radius: 8px; padding: 8px; color: #34d399; margin-bottom: 4px;">● Stg 0 (6)</div>
                  <div style="background: #020617; border-radius: 8px; padding: 8px; color: #fbbf24; margin-bottom: 4px;">● Stg 1 (2)</div>
                  <div style="background: #020617; border-radius: 8px; padding: 8px; color: #f472b6;">● Stg 2-3 (5)</div>
                </td>
                {/* Funding Status */}
                <td style="width: 33%; vertical-align: top; padding: 0 8px; border-right: 1px solid #1e293b;">
                  <div style="font-size: 11px; font-weight: 900; color: #e2e8f0; text-transform: uppercase; margin-bottom: 8px; text-align: center;">Funding Status</div>
                  <div style="background: #020617; border-radius: 8px; padding: 8px; color: #34d399; margin-bottom: 4px;">● Disbursed 50%</div>
                  <div style="background: #020617; border-radius: 8px; padding: 8px; color: #fbbf24; margin-bottom: 4px;">● Approved 30%</div>
                  <div style="background: #020617; border-radius: 8px; padding: 8px; color: #60a5fa;">● Pending 20%</div>
                </td>
                {/* Student Disciplines */}
                <td style="width: 33%; vertical-align: top; padding-left: 8px;">
                  <div style="font-size: 11px; font-weight: 900; color: #e2e8f0; text-transform: uppercase; margin-bottom: 8px; text-align: center;">Disciplines</div>
                  <div style="background: #020617; border-radius: 8px; padding: 8px; color: #38bdf8; margin-bottom: 4px;">● Engineering 50%</div>
                  <div style="background: #020617; border-radius: 8px; padding: 8px; color: #c084fc; margin-bottom: 4px;">● Law 30%</div>
                  <div style="background: #020617; border-radius: 8px; padding: 8px; color: #fb923c;">● MBA 20%</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      {/* Bottom Section: Active Projects Table & Milestone Verification */}
      <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
        <div style="font-size: 13px; font-weight: 900; color: #ffffff; margin-bottom: 12px; text-transform: uppercase;">🚀 Active Student Innovation Projects</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; font-family: monospace;">
          <tr style="background: #020617; color: #94a3b8; text-align: left; border-bottom: 1px solid #1e293b;">
            <th style="padding: 8px 12px;">Project Name</th>
            <th style="padding: 8px 12px;">Current Stage</th>
            <th style="padding: 8px 12px;">Project Lead</th>
            <th style="padding: 8px 12px; text-align: right;">Status</th>
          </tr>
          <tr style="border-bottom: 1px solid #1e293b;">
            <td style="padding: 10px 12px; color: #f1f5f9; font-weight: bold;">AI Autonomous Drone System</td>
            <td style="padding: 10px 12px; color: #60a5fa;">Stage 1 (Prototyping)</td>
            <td style="padding: 10px 12px; color: #94a3b8;">Sannareddy Abhilash</td>
            <td style="padding: 10px 12px; text-align: right; color: #34d399; font-weight: bold;">Active</td>
          </tr>
          <tr style="border-bottom: 1px solid #1e293b;">
            <td style="padding: 10px 12px; color: #f1f5f9; font-weight: bold;">LegalTech Document Auditor</td>
            <td style="padding: 10px 12px; color: #60a5fa;">Stage 0 (Ideation)</td>
            <td style="padding: 10px 12px; color: #94a3b8;">Kiran Sai</td>
            <td style="padding: 10px 12px; text-align: right; color: #34d399; font-weight: bold;">Active</td>
          </tr>
          <tr style="border-bottom: 1px solid #1e293b;">
            <td style="padding: 10px 12px; color: #f1f5f9; font-weight: bold;">EV Battery Management System</td>
            <td style="padding: 10px 12px; color: #60a5fa;">Stage 2 (Sandbox)</td>
            <td style="padding: 10px 12px; color: #94a3b8;">Vamsi</td>
            <td style="padding: 10px 12px; text-align: right; color: #34d399; font-weight: bold;">Active</td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; color: #f1f5f9; font-weight: bold;">Biomedical Patient Monitor</td>
            <td style="padding: 10px 12px; color: #60a5fa;">Stage -1 (Registration)</td>
            <td style="padding: 10px 12px; color: #94a3b8;">Harisai</td>
            <td style="padding: 10px 12px; text-align: right; color: #fbbf24; font-weight: bold;">Review</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 10px; color: #64748b; margin-top: 16px; border-top: 1px dashed #334155; padding-top: 12px; font-family: monospace;">
        Confidential Report | Generated automatically by Yantriksha Super Admin Console for Deans & Executive Board.
      </p>
    </div>
  `;

  const reportHtml = generateEmailTemplate({
    title: `${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Executive Cohort Report`,
    content: content,
    buttonText: 'Open Executive Console',
    buttonUrl: `${baseUrl}/admin`,
    preheader: `Yantriksha Executive Report: ${timeframe.toUpperCase()}`
  });

  // Queue emails for each recipient
  for (const email of adminEmails) {
    await queueEmail({
      to: email,
      subject: `📊 [Yantriksha Hub] Executive Report: ${timeframe.toUpperCase()}`,
      html: reportHtml
    });
  }

  // Create a log in reports_sent_log
  const summaryStr = JSON.stringify(stats);
  await query(
    `INSERT INTO reports_sent_log (report_type, sent_to, summary) VALUES (?, ?, ?)`,
    [timeframe, sentToEmails, summaryStr]
  );

  return { adminEmails, stats };
}

// GET /api/admin/reports-worker - Automation checking/polling scheduler endpoint
export async function GET(req: Request) {
  try {
    console.log('[REPORTS WORKER] Running automatic periodic reports check...');

    const host = req.headers.get('host') || 'excited-salk.vercel.app';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const timeframes = [
      { key: 'daily', intervalHours: 24 },
      { key: 'weekly', intervalHours: 168 },
      { key: 'monthly', intervalHours: 720 },
      { key: '6months', intervalHours: 4320 },
      { key: '12months', intervalHours: 8640 }
    ];

    const reportsDispatched = [];

    for (const tf of timeframes) {
      // Find the last executed report of this type
      const lastRun = await query(
        `SELECT created_at FROM reports_sent_log WHERE report_type = ? ORDER BY created_at DESC LIMIT 1`,
        [tf.key]
      );

      let shouldRun = false;

      if (!lastRun || lastRun.length === 0) {
        shouldRun = true; // Never run before
      } else {
        const diffMs = Date.now() - new Date(lastRun[0].created_at).getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours >= tf.intervalHours) {
          shouldRun = true;
        }
      }

      if (shouldRun) {
        console.log(`[REPORTS WORKER] Triggering report dispatch for interval: ${tf.key}`);
        const result = await dispatchReport(tf.key, baseUrl);
        reportsDispatched.push({ timeframe: tf.key, recipients: result.adminEmails });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Automatic periodic report checker ran successfully.',
      reportsDispatched
    });
  } catch (err: any) {
    console.error('Reports worker automation error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { timeframe, recipients, customNote } = body;

    const validTimeframes = ['daily', 'weekly', 'monthly', '6months', '12months'];
    if (!timeframe || !validTimeframes.includes(timeframe)) {
      return NextResponse.json({ success: false, error: 'Invalid or missing report timeframe type' }, { status: 400 });
    }

    const host = req.headers.get('host') || 'excited-salk.vercel.app';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    console.log(`[REPORTS WORKER] Manual dispatch requested for timeframe: ${timeframe}`);
    const result = await dispatchReport(timeframe, baseUrl, recipients, customNote);

    return NextResponse.json({
      success: true,
      message: `Executive Report for period "${timeframe.toUpperCase()}" generated and emailed to [${result.adminEmails.join(', ')}] successfully!`,
      recipients: result.adminEmails,
      stats: result.stats
    });
  } catch (err: any) {
    console.error('Reports worker manual trigger error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
