import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import SuperAdminClient from './SuperAdminClient';

export default async function SuperAdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    redirect('/login');
  }

  // Verification: User must have 'admin' role to access Super Admin dashboard
  if (decoded.role !== 'admin') {
    // Show 403 Access Denied block
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 max-w-md shadow-2xl space-y-6">
          <span className="text-5xl">🛑</span>
          <h1 className="text-3xl font-extrabold text-red-500">403 - Access Denied</h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            You do not have administrative permissions to view this portal. If you believe this is an error, please verify your credentials.
          </p>
          <a
            href="/dashboard"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition duration-200"
          >
            Go Back to Dashboard
          </a>
        </div>
      </main>
    );
  }

  const users = await query('SELECT name, email, role FROM users WHERE id = ?', [decoded.userId]);
  if (!users || users.length === 0) {
    redirect('/login');
  }
  const saUser = users[0];

  return <SuperAdminClient currentAdmin={saUser} />;
}
