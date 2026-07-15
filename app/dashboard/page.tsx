import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { getTeamCompliance } from '@/lib/teams';
import LogoutButton from './LogoutButton';

function getStageDescription(stage: number): string {
  if (stage <= 1) return 'Stage -1: Confusion';
  if (stage >= 14) return 'Stage 1: Product';
  return `Stage 0: Idea (Milestone ${stage})`;
}

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    redirect('/login');
  }

  // 1. Fetch user profile from database
  const users = await query('SELECT name, role, discipline FROM users WHERE id = ?', [decoded.userId]);
  if (!users || users.length === 0) {
    redirect('/login');
  }
  const user = users[0];

  // 2. Fetch team details
  let teams = await query('SELECT id FROM teams WHERE leader_id = ?', [decoded.userId]);
  if (!teams || teams.length === 0) {
    teams = await query('SELECT team_id as id FROM team_members WHERE user_id = ?', [decoded.userId]);
  }

  let teamCompliance = null;
  if (teams && teams.length > 0) {
    teamCompliance = await getTeamCompliance(teams[0].id);
  }

  // 3. Fetch funding request status
  let fundingStatus = 'No request';
  if (teamCompliance) {
    const funding = await query('SELECT status FROM funding_requests WHERE team_id = ? ORDER BY created_at DESC LIMIT 1', [teamCompliance.teamId]);
    if (funding && funding.length > 0) {
      const rawStatus = funding[0].status;
      fundingStatus = rawStatus
        .split('_')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  } else {
    fundingStatus = 'No team';
  }

  // 4. Calculate progress percentage
  const progressPercent = teamCompliance
    ? Math.min(Math.round((teamCompliance.currentStage / 14) * 100), 100)
    : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white flex">
      
      {/* Sidebar */}
      <aside className="w-72 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
        
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <Link href="/">
            <h1 className="text-2xl font-bold text-blue-500 hover:opacity-80 transition">
              Yantriksha X Hub
            </h1>
          </Link>
        </div>

        {/* Menu */}
        <div className="flex-1 p-6">
          <ul className="space-y-5 text-gray-300">
            <li className="hover:text-blue-400 cursor-pointer transition font-semibold text-blue-400">
              🏠 Dashboard
            </li>
            <li className="hover:text-blue-400 cursor-pointer transition">
              🚀 My Journey
            </li>
            <li className="hover:text-blue-400 cursor-pointer transition">
              👥 My Team
            </li>
            <li className="hover:text-blue-400 cursor-pointer transition">
              📂 My Project
            </li>
            <li className="hover:text-blue-400 cursor-pointer transition">
              💰 Funding
            </li>
            <li className="hover:text-blue-400 cursor-pointer transition">
              👨‍🏫 Mentors
            </li>
            <li className="hover:text-blue-400 cursor-pointer transition">
              📅 Events
            </li>
            <li className="hover:text-blue-400 cursor-pointer transition">
              ⚙️ Settings
            </li>
          </ul>
        </div>

        {/* Logout Button */}
        <div className="p-6 border-t border-slate-800">
          <LogoutButton />
        </div>

      </aside>

      {/* Main Content */}
      <section className="flex-1 p-10">
        
        <h1 className="text-4xl font-bold">
          Welcome {user.name} 👋
        </h1>

        <p className="text-gray-400 mt-2 text-sm uppercase tracking-wider">
          Role: {user.role} | Discipline: {user.discipline}
        </p>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-10">

          {/* Current Stage */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Current Stage</h2>
            <p className="text-blue-400 mt-3 text-2xl font-bold">
              {teamCompliance ? getStageDescription(teamCompliance.currentStage) : 'No Active Team'}
            </p>
            {teamCompliance && (
              <p className="text-xs text-gray-500 mt-2">Team: {teamCompliance.teamName}</p>
            )}
          </div>

          {/* Progress */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Progress</h2>
            <p className="text-green-400 mt-3 text-2xl font-bold">{progressPercent}%</p>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-green-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Team Members Count */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Team Members</h2>
            <p className="text-yellow-400 mt-3 text-2xl font-bold">
              {teamCompliance ? `${teamCompliance.memberCount} / 10` : '0 / 10'}
            </p>
            {teamCompliance && (
              <div className="mt-2 flex gap-1">
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${teamCompliance.hasEngineering ? 'bg-blue-900/50 text-blue-300' : 'bg-slate-800 text-gray-500'}`}>ENG</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${teamCompliance.hasLaw ? 'bg-red-900/50 text-red-300' : 'bg-slate-800 text-gray-500'}`}>LAW</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${teamCompliance.hasBusiness ? 'bg-amber-900/50 text-amber-300' : 'bg-slate-800 text-gray-500'}`}>MBA</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${teamCompliance.hasFacultyAdvisor ? 'bg-purple-900/50 text-purple-300' : 'bg-slate-800 text-gray-500'}`}>ADV</span>
              </div>
            )}
          </div>

          {/* Funding Status */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Funding</h2>
            <p className="text-pink-400 mt-3 text-2xl font-bold">{fundingStatus}</p>
            <p className="text-xs text-gray-500 mt-2">Seed budget limit: ₹50,000</p>
          </div>

        </div>

      </section>

    </main>
  );
}