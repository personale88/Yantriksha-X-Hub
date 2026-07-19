import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Role check: Only mentors, faculty, or admins can update status/feedback
    const allowedRoles = ['mentor', 'faculty', 'admin'];
    if (!allowedRoles.includes(auth.role)) {
      return NextResponse.json({ success: false, error: 'Only mentors or administrators can evaluate reports' }, { status: 403 });
    }

    const body = await req.json();
    const { mentor_feedback, status } = body;

    if (!status || !['approved', 'revision_requested', 'pending'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Valid status is required' }, { status: 400 });
    }

    const reportId = parseInt(params.id, 10);

    // Get report details first
    const reports = await query('SELECT team_id, milestone_step FROM progress_reports WHERE id = ?', [reportId]);
    if (!reports || reports.length === 0) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }

    const { team_id, milestone_step } = reports[0];

    // Update report
    await query(
      'UPDATE progress_reports SET mentor_feedback = ?, status = ? WHERE id = ?',
      [mentor_feedback || null, status, reportId]
    );

    // If report is approved, progress the team to the next stage in the roadmap
    if (status === 'approved') {
      const nextStage = milestone_step + 1;
      await query(
        'UPDATE teams SET current_stage = GREATEST(current_stage, ?) WHERE id = ?',
        [nextStage, team_id]
      );

      // Notify all team members via email
      try {
        const teamRes = await query('SELECT name, leader_id FROM teams WHERE id = ?', [team_id]);
        const teamName = teamRes && teamRes.length > 0 ? teamRes[0].name : `Team #${team_id}`;
        const leaderId = teamRes && teamRes.length > 0 ? teamRes[0].leader_id : null;

        const members = await query(
          `SELECT email, name FROM users WHERE id = ?
           UNION
           SELECT u.email, u.name FROM team_members tm JOIN users u ON tm.user_id = u.id WHERE tm.team_id = ?`,
          [leaderId, team_id]
        );

        if (members && members.length > 0) {
          for (const member of members) {
            await sendEmail({
              to: member.email,
              subject: `Roadmap Update: ${teamName} Advanced to Step ${nextStage}!`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                  <h2 style="color: #059669;">🚀 Roadmap Milestone Cleared!</h2>
                  <p>Dear <strong>${member.name}</strong>,</p>
                  <p>Congratulations! Your team <strong>${teamName}</strong> has cleared the validation checks for <strong>Step ${milestone_step}</strong> of the incubator roadmap.</p>
                  <p>Your team has officially advanced to: <strong style="color: #2563eb;">Step ${nextStage}</strong>.</p>
                  <p>Log in to your dashboard to review the evaluation feedback and unlock your next milestone deliverables.</p>
                  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                  <p style="font-size: 12px; color: #64748b;">Yantriksha X Hub Incubation System</p>
                </div>
              `
            });
          }
        }
      } catch (emailErr) {
        console.error('Milestone email notification failed:', emailErr);
      }
    }

    return NextResponse.json({ success: true, message: 'Report updated successfully' });
  } catch (err: any) {
    console.error('Error updating milestone:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const reportId = parseInt(params.id, 10);

    // Get report details
    const reports = await query('SELECT team_id FROM progress_reports WHERE id = ?', [reportId]);
    if (!reports || reports.length === 0) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }

    const { team_id } = reports[0];

    // Verify user is team leader or admin
    const teams = await query('SELECT leader_id FROM teams WHERE id = ?', [team_id]);
    const isLeader = teams && teams.length > 0 && teams[0].leader_id === auth.userId;

    if (!isLeader && auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Only the team leader or an admin can delete reports' }, { status: 403 });
    }

    await query('DELETE FROM progress_reports WHERE id = ?', [reportId]);
    return NextResponse.json({ success: true, message: 'Report deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting milestone:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
