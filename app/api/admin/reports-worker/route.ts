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
async function dispatchReport(timeframe: string, baseUrl = 'https://excited-salk.vercel.app') {
  let intervalMs = 24 * 60 * 60 * 1000; // default Daily
  if (timeframe === 'weekly') intervalMs = 7 * 24 * 60 * 60 * 1000;
  else if (timeframe === 'monthly') intervalMs = 30 * 24 * 60 * 60 * 1000;
  else if (timeframe === '6months') intervalMs = 180 * 24 * 60 * 60 * 1000;
  else if (timeframe === '12months') intervalMs = 365 * 24 * 60 * 60 * 1000;

  const startDate = new Date(Date.now() - intervalMs);
  const endDate = new Date();

  // Fetch the statistics
  const stats = await getCohortStats(startDate);

  // Fetch all admin and superadmin emails
  const adminRows = await query(
    `SELECT email, name FROM users WHERE role IN ('admin', 'superadmin')`
  );
  const adminEmails = adminRows && adminRows.length > 0
    ? adminRows.map((r: any) => r.email)
    : ['yantrikshaxhub@gmail.com']; // fallback

  const sentToEmails = adminEmails.join(', ');

  // Format HTML email report
  const content = `
    <p>Dear Administrator,</p>
    <p>Here is the compiled operational and innovation cohort report for the period <strong>${timeframe.toUpperCase()}</strong>:</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; color: #334155; border: 1px solid #e2e8f0; font-family: sans-serif;">
      <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
        <th style="padding: 12px 10px; text-align: left; font-weight: bold; border: 1px solid #e2e8f0;">Cohort Metric Parameter</th>
        <th style="padding: 12px 10px; text-align: right; font-weight: bold; border: 1px solid #e2e8f0; width: 140px;">Value / Count</th>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #e2e8f0;">New Student Registrations</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #2563eb;">${stats.newStudents}</td>
      </tr>
      <tr style="background-color: #f8fafc;">
        <td style="padding: 10px; border: 1px solid #e2e8f0;">New Active Innovation Teams</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #16a34a;">${stats.newTeams}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #e2e8f0;">Milestones Submitted & Verified</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0d9488;">${stats.milestonesApproved}</td>
      </tr>
      <tr style="background-color: #f8fafc;">
        <td style="padding: 10px; border: 1px solid #e2e8f0;">Milestone Submissions Rejected</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #dc2626;">${stats.milestonesRejected}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #e2e8f0;">Current Reviews Backlog Queue</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #ea580c;">${stats.pendingReviews}</td>
      </tr>
      <tr style="background-color: #f8fafc;">
        <td style="padding: 10px; border: 1px solid #e2e8f0;">Seed Funding Capital Requested</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #4f46e5;">Rs.${stats.fundingRequested.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #e2e8f0;">Seed Funding Capital Approved</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #059669;">Rs.${stats.fundingApproved.toLocaleString()}</td>
      </tr>
      <tr style="background-color: #f8fafc;">
        <td style="padding: 10px; border: 1px solid #e2e8f0;">Innovation Seminars Organized</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0891b2;">${stats.eventsHosted}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #e2e8f0;">Cohort Activity Signups</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #4f46e5;">${stats.eventRegistrations}</td>
      </tr>
    </table>
    
    <p style="font-size: 11px; color: #64748b; margin-top: 25px; line-height: 1.5; border-top: 1px dashed #cbd5e1; padding-top: 15px;">
      Report Generation Period: <strong>${startDate.toLocaleDateString()}</strong> to <strong>${endDate.toLocaleDateString()}</strong>.<br />
      This report summary was generated and dispatched automatically to all authorized administrators.
    </p>
  `;

  const reportHtml = generateEmailTemplate({
    title: `${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Innovation Report`,
    content: content,
    buttonText: 'Open Admin Console',
    buttonUrl: `${baseUrl}/admin`,
    preheader: `Yantriksha periodic report: ${timeframe.toUpperCase()}`
  });

  // Queue emails for each admin recipient
  for (const email of adminEmails) {
    await queueEmail({
      to: email,
      subject: `📊 [Yantriksha X Hub] Periodic Cohort Report: ${timeframe.toUpperCase()}`,
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
    const { timeframe } = body; // 'daily', 'weekly', 'monthly', '6months', '12months'

    const validTimeframes = ['daily', 'weekly', 'monthly', '6months', '12months'];
    if (!timeframe || !validTimeframes.includes(timeframe)) {
      return NextResponse.json({ success: false, error: 'Invalid or missing report timeframe type' }, { status: 400 });
    }

    const host = req.headers.get('host') || 'excited-salk.vercel.app';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    console.log(`[REPORTS WORKER] Manual dispatch requested for timeframe: ${timeframe}`);
    const result = await dispatchReport(timeframe, baseUrl);

    return NextResponse.json({
      success: true,
      message: `Operational report for period "${timeframe.toUpperCase()}" generated and emailed to administrators successfully!`,
      recipients: result.adminEmails,
      stats: result.stats
    });
  } catch (err: any) {
    console.error('Reports worker manual trigger error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
