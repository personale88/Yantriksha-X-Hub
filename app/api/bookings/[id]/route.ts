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

    const body = await req.json();
    const { status } = body;

    const validStatuses = ['scheduled', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const bookingId = parseInt(params.id, 10);

    // Fetch booking details
    const bookings = await query('SELECT team_id, mentor_id FROM bookings WHERE id = ?', [bookingId]);
    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    const { team_id, mentor_id } = bookings[0];

    // Access control: Must be the mentor, team leader/member, or admin
    let isAuthorized = auth.role === 'admin' || auth.userId === mentor_id;

    if (!isAuthorized) {
      const userTeams = await query(
        `SELECT id FROM teams WHERE leader_id = ? AND id = ?
         UNION
         SELECT team_id as id FROM team_members WHERE user_id = ? AND team_id = ?`,
        [auth.userId, team_id, auth.userId, team_id]
      );
      if (userTeams && userTeams.length > 0) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    await query('UPDATE bookings SET status = ? WHERE id = ?', [status, bookingId]);
    return NextResponse.json({ success: true, message: 'Booking updated successfully' });
  } catch (err: any) {
    console.error('Error updating booking:', err);
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

    const bookingId = parseInt(params.id, 10);

    // Fetch booking details
    const bookings = await query('SELECT team_id, mentor_id FROM bookings WHERE id = ?', [bookingId]);
    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    const { team_id, mentor_id } = bookings[0];

    // Access control: Must be the mentor, team leader/member, or admin
    let isAuthorized = auth.role === 'admin' || auth.userId === mentor_id;

    if (!isAuthorized) {
      const userTeams = await query(
        `SELECT id FROM teams WHERE leader_id = ? AND id = ?
         UNION
         SELECT team_id as id FROM team_members WHERE user_id = ? AND team_id = ?`,
        [auth.userId, team_id, auth.userId, team_id]
      );
      if (userTeams && userTeams.length > 0) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    await query('DELETE FROM bookings WHERE id = ?', [bookingId]);
    return NextResponse.json({ success: true, message: 'Booking deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting booking:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
