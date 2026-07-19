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

    // Role check: Only mentors, faculty, admins, or treasurers can update funding status
    const allowedRoles = ['mentor', 'faculty', 'admin'];
    if (!allowedRoles.includes(auth.role)) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    const body = await req.json();
    const { status } = body;

    const validStatuses = ['pending_advisor', 'pending_treasurer', 'approved', 'disbursed', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const claimId = parseInt(params.id, 10);

    // Verify claim exists
    const claims = await query('SELECT id FROM funding_requests WHERE id = ?', [claimId]);
    if (!claims || claims.length === 0) {
      return NextResponse.json({ success: false, error: 'Funding claim not found' }, { status: 404 });
    }

    // Update status
    await query(
      'UPDATE funding_requests SET status = ? WHERE id = ?',
      [status, claimId]
    );

    return NextResponse.json({ success: true, message: 'Funding claim updated successfully' });
  } catch (err: any) {
    console.error('Error updating funding claim:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
