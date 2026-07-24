import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const events = await query(`
      SELECT id, title, description, category, event_date, status, created_at
      FROM events
      WHERE status = 'upcoming' AND event_date >= NOW()
      ORDER BY event_date ASC
      LIMIT 6
    `);
    return NextResponse.json({ success: true, events });
  } catch (err: any) {
    console.error('Public events GET error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
