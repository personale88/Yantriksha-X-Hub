import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import AdminClient from './AdminClient';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    redirect('/login');
  }

  // 1. Verify user is admin, faculty, or mentor
  const allowedRoles = ['admin', 'mentor', 'faculty'];
  if (!allowedRoles.includes(decoded.role)) {
    redirect('/dashboard'); // Direct ordinary students back to their dashboard
  }

  // Fetch initial profile
  const users = await query('SELECT name, role FROM users WHERE id = ?', [decoded.userId]);
  if (!users || users.length === 0) {
    redirect('/login');
  }
  const user = users[0];

  return (
    <AdminClient 
      adminUser={user} 
    />
  );
}
