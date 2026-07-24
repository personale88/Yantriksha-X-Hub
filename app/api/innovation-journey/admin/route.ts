import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

const MILESTONES_CONFIG = [
  { key: 'stg_-1_prob_disc', title: 'Problem Discovery', stage: 'Stage -1: Confusion', isGate: false, xp: 50 },
  { key: 'stg_-1_team_alloc', title: 'Team & Mentor Allocation', stage: 'Stage -1: Confusion', isGate: false, xp: 100 },
  { key: 'stg_-1_prob_val', title: 'Problem Validation', stage: 'Stage -1: Confusion', isGate: false, xp: 100 },
  { key: 'qr1', title: 'Quality Review – QR1 (Problem Assessment)', stage: 'Stage -1: Confusion', isGate: true, rejectDefaultTarget: 'stg_-1_prob_val', xp: 300 },
  { key: 'stg_0_ideation', title: 'Ideation & Research', stage: 'Stage 0: Idea', isGate: false, xp: 150 },
  { key: 'qr2', title: 'Quality Review – QR2 (Solution Assessment)', stage: 'Stage 0: Idea', isGate: true, rejectDefaultTarget: 'stg_0_ideation', xp: 300 },
  { key: 'stg_0_funding', title: 'Funding & Resources', stage: 'Stage 0: Idea', isGate: false, xp: 200 },
  { key: 'stg_0_proto_dev', title: 'Prototype Development & Testing', stage: 'Stage 0: Idea', isGate: false, xp: 500 },
  { key: 'qr3', title: 'Quality Review – QR3 (Prototype Assessment)', stage: 'Stage 0: Idea', isGate: true, rejectDefaultTarget: 'stg_0_proto_dev', xp: 400 },
  { key: 'stg_1_prod_val', title: 'Product Validation', stage: 'Stage 1: Product', isGate: false, xp: 250 },
  { key: 'qr4', title: 'Quality Review – QR4 (Product Readiness Review)', stage: 'Stage 1: Product', isGate: true, rejectDefaultTarget: 'stg_1_prod_val', xp: 400 },
  { key: 'stg_1_branch_pub', title: 'Research Publication', stage: 'Stage 1: Product', isGate: false, isBranch: true, xp: 500 },
  { key: 'stg_1_branch_pat', title: 'Patent & IPR', stage: 'Stage 1: Product', isGate: false, isBranch: true, xp: 700 },
  { key: 'stg_1_incubation', title: 'Incubation (TBI Onboarding)', stage: 'Stage 1: Product', isGate: false, xp: 600 },
  { key: 'qr5', title: 'Quality Review – QR5 (Startup Readiness Review)', stage: 'Stage 1: Product', isGate: true, rejectDefaultTarget: 'stg_1_incubation', xp: 500 },
  { key: 'stg_1_scaling', title: 'Funding & Startup Scaling', stage: 'Stage 1: Product', isGate: false, xp: 800 },
  { key: 'stg_1_impact', title: 'Commercialization & Impact', stage: 'Stage 1: Product', isGate: false, xp: 1000 }
];

// GET /api/innovation-journey/admin - List all student journeys waiting for review
export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || (auth.role !== 'admin' && auth.role !== 'mentor' && auth.role !== 'faculty')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Get all students with journey info, team names, mentors and reviewers
    const students = await query(
      `SELECT u.id, u.name, u.veltech_id, u.email, u.discipline, u.branch,
              j.current_stage, j.current_milestone, j.overall_progress, j.is_frozen,
              j.assigned_reviewer_id, j.assigned_mentor_id, j.review_deadline,
              t.team_name, t.id as team_id,
              r.name as reviewer_name, m.name as mentor_name
       FROM users u
       LEFT JOIN innovation_journey j ON u.id = j.user_id
       LEFT JOIN team_members tm ON u.id = tm.user_id
       LEFT JOIN teams t ON (tm.team_id = t.id OR t.leader_id = u.id)
       LEFT JOIN users r ON j.assigned_reviewer_id = r.id
       LEFT JOIN users m ON j.assigned_mentor_id = m.id
       WHERE u.role = 'student'
       GROUP BY u.id`
    );

    // Get all pending reviews
    const pendingReviews = await query(
      `SELECT mp.id, mp.user_id, mp.milestone_key, mp.status, mp.started_at,
              u.name as student_name, u.veltech_id as student_veltech_id
       FROM innovation_milestone_progress mp
       JOIN users u ON mp.user_id = u.id
       WHERE mp.status = 'waiting_for_review'`
    );

    return NextResponse.json({ success: true, students, pendingReviews, milestonesConfig: MILESTONES_CONFIG });
  } catch (err: any) {
    console.error('Error fetching admin journey lists:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/innovation-journey/admin - Submit milestone evaluation (Approve / Reject)
export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || (auth.role !== 'admin' && auth.role !== 'mentor' && auth.role !== 'faculty')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { studentId, milestoneKey, status, comments, requiredCorrections, customRejectTarget } = body;
    // status: 'approved' | 'rejected' | 'skipped' | 'manual_unlocked'

    if (!studentId || !status) {
      return NextResponse.json({ success: false, error: 'Missing studentId or status' }, { status: 400 });
    }

    // Support administrative control actions
    if (status === 'assign_reviewer') {
      const { reviewerId, deadline } = body;
      await query(
        `UPDATE innovation_journey SET assigned_reviewer_id = ?, review_deadline = ? WHERE user_id = ?`,
        [reviewerId || null, deadline || null, studentId]
      );
      return NextResponse.json({ success: true, message: 'Reviewer and deadline updated.' });
    }
    
    if (status === 'assign_mentor') {
      const { mentorId } = body;
      await query(
        `UPDATE innovation_journey SET assigned_mentor_id = ? WHERE user_id = ?`,
        [mentorId || null, studentId]
      );
      return NextResponse.json({ success: true, message: 'Mentor updated.' });
    }

    if (status === 'freeze_progress') {
      await query(
        `UPDATE innovation_journey SET is_frozen = TRUE WHERE user_id = ?`,
        [studentId]
      );
      return NextResponse.json({ success: true, message: 'Innovation journey frozen.' });
    }

    if (status === 'resume_progress') {
      await query(
        `UPDATE innovation_journey SET is_frozen = FALSE WHERE user_id = ?`,
        [studentId]
      );
      return NextResponse.json({ success: true, message: 'Innovation journey resumed.' });
    }

    if (!milestoneKey) {
      return NextResponse.json({ success: false, error: 'Missing milestoneKey for evaluation' }, { status: 400 });
    }

    const reviewerRows = await query('SELECT name FROM users WHERE id = ?', [auth.userId]);
    const reviewerName = (reviewerRows && reviewerRows[0]?.name) || 'Incubation Reviewer';

    // Verify milestone key
    const mConfig = MILESTONES_CONFIG.find(m => m.key === milestoneKey);
    if (!mConfig) {
      return NextResponse.json({ success: false, error: 'Invalid milestone key' }, { status: 400 });
    }

    // Get current progress row
    const progressRows = await query(
      'SELECT status, attempt_number FROM innovation_milestone_progress WHERE user_id = ? AND milestone_key = ?',
      [studentId, milestoneKey]
    );
    if (!progressRows || progressRows.length === 0) {
      return NextResponse.json({ success: false, error: 'Student progress data not found' }, { status: 404 });
    }
    const currentProgress = progressRows[0];

    // Check action
    if (status === 'approved') {
      // 1. Update milestone progress to completed
      await query(
        `UPDATE innovation_milestone_progress 
         SET status = 'completed', completed_at = CURRENT_TIMESTAMP, 
             reviewer_name = ?, review_date = CURRENT_TIMESTAMP, 
             review_comments = ?, required_corrections = NULL
         WHERE user_id = ? AND milestone_key = ?`,
        [reviewerName, comments || 'Approved successfully.', studentId, milestoneKey]
      );

      // 2. Log review history
      await query(
        `INSERT INTO innovation_reviews (user_id, milestone_key, reviewer_name, status, comments, attempt_number)
         VALUES (?, ?, ?, 'approved', ?, ?)`,
        [studentId, milestoneKey, reviewerName, comments || 'Approved successfully.', currentProgress.attempt_number]
      );

      // 3. Push student notification
      await query(
        `INSERT INTO innovation_notifications (user_id, title, message, type)
         VALUES (?, ?, ?, 'review_approved')`,
        [
          studentId, 
          `Checkpoint Approved: ${mConfig.title}`,
          `Congratulations! Your review for ${mConfig.title} was approved by ${reviewerName}.`
        ]
      );

      // 4. Auto-unlock the next step
      await unlockNextMilestone(studentId, milestoneKey);

      // 5. Recalculate progress and current active stages
      await updateOverallProgress(studentId);

      return NextResponse.json({ success: true, message: 'Milestone approved successfully.' });
    }

    if (status === 'rejected') {
      const rejectTarget = customRejectTarget || mConfig.rejectDefaultTarget || milestoneKey;

      // 1. Set milestone progress to rejected
      await query(
        `UPDATE innovation_milestone_progress 
         SET status = 'rejected', completed_at = NULL, 
             attempt_number = attempt_number + 1,
             reviewer_name = ?, review_date = CURRENT_TIMESTAMP, 
             review_comments = ?, required_corrections = ?, acknowledged = FALSE
         WHERE user_id = ? AND milestone_key = ?`,
        [reviewerName, comments || 'Requires corrections.', requiredCorrections || 'Please review feedback.', studentId, milestoneKey]
      );

      // 2. Lock intervening milestones and set the rejection target to available/in_progress
      const currentIdx = MILESTONES_CONFIG.findIndex(m => m.key === milestoneKey);
      const targetIdx = MILESTONES_CONFIG.findIndex(m => m.key === rejectTarget);

      if (targetIdx !== -1 && targetIdx < currentIdx) {
        // Lock everything between targetIdx and currentIdx
        for (let i = targetIdx + 1; i <= currentIdx; i++) {
          const keyToLock = MILESTONES_CONFIG[i].key;
          if (keyToLock !== milestoneKey) {
            await query(
              `UPDATE innovation_milestone_progress 
               SET status = 'locked' 
               WHERE user_id = ? AND milestone_key = ?`,
              [studentId, keyToLock]
            );
          }
        }
        
        // Reset the target milestone to available so the student can edit it
        await query(
          `UPDATE innovation_milestone_progress 
           SET status = 'available', completed_at = NULL 
           WHERE user_id = ? AND milestone_key = ?`,
          [studentId, rejectTarget]
        );
      }

      // 3. Log review history
      await query(
        `INSERT INTO innovation_reviews (user_id, milestone_key, reviewer_name, status, comments, required_corrections, attempt_number)
         VALUES (?, ?, ?, 'rejected', ?, ?, ?)`,
        [studentId, milestoneKey, reviewerName, comments || 'Requires corrections.', requiredCorrections || '', currentProgress.attempt_number]
      );

      // 4. Push student notification
      await query(
        `INSERT INTO innovation_notifications (user_id, title, message, type)
         VALUES (?, ?, ?, 'review_rejected')`,
        [
          studentId, 
          `Checkpoint Rejected: ${mConfig.title}`,
          `Your submission for ${mConfig.title} requires corrections. Reviewer comments: "${comments || 'Requires corrections.'}"`
        ]
      );

      // 5. Update overall progress & current milestone (so avatar moves back)
      await updateOverallProgress(studentId);

      return NextResponse.json({ success: true, message: 'Milestone rejected, student sent back.' });
    }

    if (status === 'skipped' || status === 'manual_unlocked') {
      await query(
        `UPDATE innovation_milestone_progress 
         SET status = 'completed', completed_at = CURRENT_TIMESTAMP, 
             reviewer_name = ?, review_date = CURRENT_TIMESTAMP, 
             review_comments = 'Manually unlocked by Admin'
         WHERE user_id = ? AND milestone_key = ?`,
        [reviewerName, studentId, milestoneKey]
      );

      await query(
        `INSERT INTO innovation_reviews (user_id, milestone_key, reviewer_name, status, comments)
         VALUES (?, ?, ?, 'skipped', 'Manually unlocked/skipped by administrator')`,
        [studentId, milestoneKey, reviewerName]
      );

      await unlockNextMilestone(studentId, milestoneKey);
      await updateOverallProgress(studentId);

      return NextResponse.json({ success: true, message: 'Milestone manually bypassed.' });
    }

    return NextResponse.json({ success: false, error: 'Unsupported status parameter value' }, { status: 400 });
  } catch (err: any) {
    console.error('Error processing admin review submission:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// Function to auto-unlock next milestone for completed milestones
async function unlockNextMilestone(userId: number, currentKey: string) {
  const currentIdx = MILESTONES_CONFIG.findIndex(m => m.key === currentKey);
  if (currentIdx === -1 || currentIdx === MILESTONES_CONFIG.length - 1) return;

  const currentMilestone = MILESTONES_CONFIG[currentIdx];
  const nextMilestone = MILESTONES_CONFIG[currentIdx + 1];

  // Handle branching after qr4
  if (currentKey === 'qr4') {
    await query(
      `UPDATE innovation_milestone_progress 
       SET status = 'available' 
       WHERE user_id = ? AND milestone_key IN ('stg_1_branch_pub', 'stg_1_branch_pat')`,
      [userId]
    );
    return;
  }

  // Handle merging of branch items back into Incubation
  if (currentMilestone.isBranch) {
    await query(
      `UPDATE innovation_milestone_progress 
       SET status = 'available' 
       WHERE user_id = ? AND milestone_key = 'stg_1_incubation'`,
      [userId]
    );
    return;
  }

  // General sequential unlock
  await query(
    `UPDATE innovation_milestone_progress 
     SET status = 'available' 
     WHERE user_id = ? AND milestone_key = ? AND status = 'locked'`,
    [userId, nextMilestone.key]
  );
}

// Helper to recalculate progress %
async function updateOverallProgress(userId: number) {
  const progressRows = await query(
    'SELECT status, milestone_key FROM innovation_milestone_progress WHERE user_id = ?',
    [userId]
  );
  
  // Calculate total XP dynamically
  let totalXP = 0;
  let completedCount = 0;
  
  for (const m of MILESTONES_CONFIG) {
    const statusRow = progressRows.find((r: any) => r.milestone_key === m.key);
    if (statusRow && (statusRow.status === 'completed' || statusRow.status === 'approved')) {
      totalXP += m.xp || 0;
      completedCount++;
    }
  }
  
  const progressPercent = (completedCount / MILESTONES_CONFIG.length) * 100;

  let activeMilestone = 'stg_-1_prob_disc';
  let activeStage = 'Stage -1: Confusion';

  // Determine current active milestone by looking at the first non-completed/unlocked step
  for (let i = 0; i < MILESTONES_CONFIG.length; i++) {
    const configItem = MILESTONES_CONFIG[i];
    const statusRow = progressRows.find((r: any) => r.milestone_key === configItem.key);
    if (statusRow && (statusRow.status === 'in_progress' || statusRow.status === 'waiting_for_review' || statusRow.status === 'rejected' || statusRow.status === 'available' || statusRow.status === 'current')) {
      activeMilestone = configItem.key;
      activeStage = configItem.stage;
      break;
    }
  }

  await query(
    `UPDATE innovation_journey 
     SET overall_progress = ?, current_milestone = ?, current_stage = ?,
         innovation_score = ?, readiness_score = ?
     WHERE user_id = ?`,
    [
      progressPercent.toFixed(2), 
      activeMilestone, 
      activeStage, 
      totalXP, 
      Math.min(100, Math.floor((completedCount / MILESTONES_CONFIG.length) * 100)), 
      userId
    ]
  );
}
