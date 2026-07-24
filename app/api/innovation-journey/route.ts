import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

const MILESTONES_CONFIG = [
  { key: 'stg_-1_prob_disc', title: 'Problem Discovery', stage: 'Stage -1: Confusion', isGate: false, xp: 50 },
  { key: 'stg_-1_team_alloc', title: 'Team & Mentor Allocation', stage: 'Stage -1: Confusion', isGate: false, xp: 100 },
  { key: 'stg_-1_prob_val', title: 'Problem Validation', stage: 'Stage -1: Confusion', isGate: false, xp: 100 },
  { key: 'qr1', title: 'Quality Review – QR1 (Problem Assessment)', stage: 'Stage -1: Confusion', isGate: true, xp: 300 },
  { key: 'stg_0_ideation', title: 'Ideation & Research', stage: 'Stage 0: Idea', isGate: false, xp: 150 },
  { key: 'qr2', title: 'Quality Review – QR2 (Solution Assessment)', stage: 'Stage 0: Idea', isGate: true, xp: 300 },
  { key: 'stg_0_funding', title: 'Funding & Resources', stage: 'Stage 0: Idea', isGate: false, xp: 200 },
  { key: 'stg_0_proto_dev', title: 'Prototype Development & Testing', stage: 'Stage 0: Idea', isGate: false, xp: 500 },
  { key: 'qr3', title: 'Quality Review – QR3 (Prototype Assessment)', stage: 'Stage 0: Idea', isGate: true, xp: 400 },
  { key: 'stg_1_prod_val', title: 'Product Validation', stage: 'Stage 1: Product', isGate: false, xp: 250 },
  { key: 'qr4', title: 'Quality Review – QR4 (Product Readiness Review)', stage: 'Stage 1: Product', isGate: true, xp: 400 },
  { key: 'stg_1_branch_pub', title: 'Research Publication', stage: 'Stage 1: Product', isGate: false, isBranch: true, xp: 500 },
  { key: 'stg_1_branch_pat', title: 'Patent & IPR', stage: 'Stage 1: Product', isGate: false, isBranch: true, xp: 700 },
  { key: 'stg_1_incubation', title: 'Incubation (TBI Onboarding)', stage: 'Stage 1: Product', isGate: false, xp: 600 },
  { key: 'qr5', title: 'Quality Review – QR5 (Startup Readiness Review)', stage: 'Stage 1: Product', isGate: true, xp: 500 },
  { key: 'stg_1_scaling', title: 'Funding & Startup Scaling', stage: 'Stage 1: Product', isGate: false, xp: 800 },
  { key: 'stg_1_impact', title: 'Commercialization & Impact', stage: 'Stage 1: Product', isGate: false, xp: 1000 }
];

// Helper to bootstrap journey database rows for a new student
async function ensureJourneyBootstrapped(userId: number) {
  // Check if overall journey exists
  const journey = await query('SELECT * FROM innovation_journey WHERE user_id = ?', [userId]);
  if (!journey || journey.length === 0) {
    await query(
      `INSERT INTO innovation_journey (user_id, current_stage, current_milestone, overall_progress)
       VALUES (?, 'Stage -1: Confusion', 'stg_-1_prob_disc', 0.00)`,
      [userId]
    );
  }

  // Check and populate milestone progress row by row
  const progressRows = await query('SELECT milestone_key FROM innovation_milestone_progress WHERE user_id = ?', [userId]);
  const existingKeys = new Set(progressRows.map((r: any) => r.milestone_key));

  for (const m of MILESTONES_CONFIG) {
    if (!existingKeys.has(m.key)) {
      // First stop starts as 'available', others as 'locked'
      const initialStatus = m.key === 'stg_-1_prob_disc' ? 'available' : 'locked';
      await query(
        `INSERT INTO innovation_milestone_progress (user_id, milestone_key, status)
         VALUES (?, ?, ?)`,
        [userId, m.key, initialStatus]
      );
    }
  }
}

// GET /api/innovation-journey - Fetch student's innovation journey state
export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = auth.userId;
    await ensureJourneyBootstrapped(userId);

    // Fetch overall stats
    const journeyRows = await query('SELECT * FROM innovation_journey WHERE user_id = ?', [userId]);
    const journey = journeyRows[0];

    // Fetch milestones progress
    const progress = await query(
      `SELECT milestone_key, status, started_at, completed_at, attempt_number, time_taken, 
              reviewer_name, review_date, review_comments, required_corrections, acknowledged 
       FROM innovation_milestone_progress WHERE user_id = ?`,
      [userId]
    );

    // Fetch notifications
    const notifications = await query(
      'SELECT id, title, message, type, is_read, created_at FROM innovation_notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [userId]
    );

    // Fetch review history logs
    const reviewHistory = await query(
      'SELECT milestone_key, reviewer_name, status, comments, required_corrections, attempt_number, created_at FROM innovation_reviews WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    return NextResponse.json({
      success: true,
      journey,
      progress,
      notifications,
      reviewHistory,
      milestonesConfig: MILESTONES_CONFIG
    });
  } catch (err: any) {
    console.error('Error fetching innovation journey:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/innovation-journey - Student logs actions (start, submit for review, acknowledge rejection)
export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = auth.userId;
    const body = await req.json();
    const { action, milestoneKey } = body; // action: 'start' | 'submit' | 'acknowledge'

    if (!action || !milestoneKey) {
      return NextResponse.json({ success: false, error: 'Missing action or milestoneKey parameters' }, { status: 400 });
    }

    // Verify milestone exists in config
    const mConfig = MILESTONES_CONFIG.find(m => m.key === milestoneKey);
    if (!mConfig) {
      return NextResponse.json({ success: false, error: 'Invalid milestone key' }, { status: 400 });
    }

    // Get current progress row
    const progressRows = await query(
      'SELECT status, attempt_number, acknowledged FROM innovation_milestone_progress WHERE user_id = ? AND milestone_key = ?',
      [userId, milestoneKey]
    );
    if (!progressRows || progressRows.length === 0) {
      return NextResponse.json({ success: false, error: 'Progress data not bootstrapped' }, { status: 400 });
    }
    const currentProgress = progressRows[0];

    if (action === 'start') {
      if (currentProgress.status !== 'available') {
        return NextResponse.json({ success: false, error: `Cannot start a milestone with status ${currentProgress.status}` }, { status: 400 });
      }
      await query(
        `UPDATE innovation_milestone_progress 
         SET status = 'in_progress', started_at = CURRENT_TIMESTAMP 
         WHERE user_id = ? AND milestone_key = ?`,
        [userId, milestoneKey]
      );
      return NextResponse.json({ success: true, message: 'Milestone set to in_progress' });
    }

    if (action === 'submit') {
      const allowedStates = ['in_progress', 'available', 'rejected'];
      if (!allowedStates.includes(currentProgress.status)) {
        return NextResponse.json({ success: false, error: `Cannot submit for review in status ${currentProgress.status}` }, { status: 400 });
      }
      
      const newStatus = mConfig.isGate ? 'waiting_for_review' : 'completed';
      const completeQuery = newStatus === 'completed' 
        ? `, completed_at = CURRENT_TIMESTAMP` 
        : '';
        
      await query(
        `UPDATE innovation_milestone_progress 
         SET status = ? ${completeQuery}
         WHERE user_id = ? AND milestone_key = ?`,
        [newStatus, userId, milestoneKey]
      );

      // Auto-unlock next non-gate milestone if completed instantly
      if (newStatus === 'completed') {
        // Calculate progress percentage
        await updateOverallProgress(userId);
        await unlockNextMilestone(userId, milestoneKey);
      }

      return NextResponse.json({ success: true, status: newStatus, message: 'Milestone updated successfully' });
    }

    if (action === 'acknowledge') {
      if (currentProgress.status !== 'rejected') {
        return NextResponse.json({ success: false, error: 'Milestone is not in rejected state' }, { status: 400 });
      }
      await query(
        `UPDATE innovation_milestone_progress 
         SET acknowledged = TRUE, status = 'in_progress' 
         WHERE user_id = ? AND milestone_key = ?`,
        [userId, milestoneKey]
      );
      return NextResponse.json({ success: true, message: 'Comments acknowledged, milestone set to in_progress' });
    }

    return NextResponse.json({ success: false, error: 'Unsupported action value' }, { status: 400 });
  } catch (err: any) {
    console.error('Error handling innovation journey post:', err);
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
    // Unlock BOTH branch milestones: Research Publication & Patent IPR
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
    // Check if the other branch is completed/approved
    const otherKey = currentKey === 'stg_1_branch_pub' ? 'stg_1_branch_pat' : 'stg_1_branch_pub';
    const otherProgress = await query(
      'SELECT status FROM innovation_milestone_progress WHERE user_id = ? AND milestone_key = ?',
      [userId, otherKey]
    );
    // Unlocks incubation if either is completed
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

  // Find active milestone/stage
  let activeMilestone = 'stg_-1_prob_disc';
  let activeStage = 'Stage -1: Confusion';

  // Determine current milestone/stage by looking at the last unlocked/in_progress item
  for (let i = 0; i < MILESTONES_CONFIG.length; i++) {
    const configItem = MILESTONES_CONFIG[i];
    const statusRow = progressRows.find((r: any) => r.milestone_key === configItem.key);
    if (statusRow && (statusRow.status === 'in_progress' || statusRow.status === 'waiting_for_review' || statusRow.status === 'rejected' || statusRow.status === 'current')) {
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
      Math.min(100, Math.floor((completedCount / MILESTONES_CONFIG.length) * 100)), // Readiness score out of 100 based on roadmap coverage
      userId
    ]
  );
}
