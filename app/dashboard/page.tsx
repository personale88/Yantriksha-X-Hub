import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { getTeamCompliance } from '@/lib/teams';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    redirect('/login');
  }

  // 1. Fetch user profile from database with all fields needed for settings
  const users = await query(
    'SELECT id, veltech_id, name, email, role, discipline, phone_number, year_of_studying, branch FROM users WHERE id = ?',
    [decoded.userId]
  );
  
  if (!users || users.length === 0) {
    redirect('/login');
  }
  const user = users[0];

  // 1.5. Separate dashboards based on user roles
  if (user.role === 'admin') {
    redirect('/superadmin');
  } else if (user.role === 'faculty' || user.role === 'mentor') {
    redirect('/admin');
  }

  // 2. Fetch team details
  let teams = await query('SELECT id FROM teams WHERE leader_id = ?', [decoded.userId]);
  if (!teams || teams.length === 0) {
    teams = await query('SELECT team_id as id FROM team_members WHERE user_id = ?', [decoded.userId]);
  }

  let teamCompliance = null;
  if (teams && teams.length > 0) {
    teamCompliance = await getTeamCompliance(teams[0].id);
  }

  return (
    <DashboardClient 
      initialUser={user} 
      initialTeam={teamCompliance} 
    />
  );
}