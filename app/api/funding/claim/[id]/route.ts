import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

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

    // Allowed roles to update funding status: faculty, mentor, admin
    const allowedRoles = ['faculty', 'mentor', 'admin'];
    if (!allowedRoles.includes(auth.role)) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    const body = await req.json();
    const { status } = body;

    const validStatuses = ['pending_advisor', 'pending_treasurer', 'approved', 'disbursed', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const claimId = parseInt(params.id, 10);

    const result = await query(
      'UPDATE funding_requests SET status = ? WHERE id = ?',
      [status, claimId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Funding request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Funding request updated successfully' });
  } catch (err: any) {
    console.error('Error updating funding claim:', err);
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

    const claimId = parseInt(params.id, 10);

    // Get claim details
    const claims = await query('SELECT team_id FROM funding_requests WHERE id = ?', [claimId]);
    if (!claims || claims.length === 0) {
      return NextResponse.json({ success: false, error: 'Funding request not found' }, { status: 404 });
    }

    const { team_id } = claims[0];

    // Verify if user is the team leader or admin
    const teams = await query('SELECT leader_id FROM teams WHERE id = ?', [team_id]);
    const isLeader = teams && teams.length > 0 && teams[0].leader_id === auth.userId;

    if (!isLeader && auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Only the team leader or an admin can delete funding requests' }, { status: 403 });
    }

    await query('DELETE FROM funding_requests WHERE id = ?', [claimId]);
    return NextResponse.json({ success: true, message: 'Funding request deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting funding claim:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
