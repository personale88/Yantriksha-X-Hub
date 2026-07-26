'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Profile {
  id: number;
  name: string;
  email: string;
  designation: string;
  department: string;
  roleName: string;
  permissions: { [module: string]: string[] };
}

interface Team {
  id: number;
  team_name: string;
  project_title: string;
  status: string;
  created_at: string;
}

interface Activity {
  action_performed: string;
  module: string;
  status: string;
  created_at: string;
}

export default function CoreDashboardClient() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<any>({});
  const [assignedTeams, setAssignedTeams] = useState<Team[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'workspace' | 'teams' | 'reports' | 'security'>('overview');

  // 2FA modal / form state inside Security tab
  const [qrSecret, setQrSecret] = useState('');
  const [otpUrl, setOtpUrl] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [secLoading, setSecLoading] = useState(false);
  const [secMsg, setSecMsg] = useState('');
  const [secErr, setSecErr] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/core/dashboard');
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push('/dashboard');
          return;
        }
        throw new Error(data.error || 'Failed to load core dashboard');
      }

      setProfile(data.profile);
      setStats(data.stats || {});
      setAssignedTeams(data.assignedTeams || []);
      setActivities(data.recentActivities || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    setSecLoading(true);
    setSecErr('');
    setSecMsg('');
    try {
      const res = await fetch('/api/auth/2fa');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize 2FA');
      setQrSecret(data.secret);
      setOtpUrl(data.otpauthUrl);
    } catch (err: any) {
      setSecErr(err.message);
    } finally {
      setSecLoading(false);
    }
  };

  const handleConfirm2FA = async (enable: boolean) => {
    setSecLoading(true);
    setSecErr('');
    setSecMsg('');
    try {
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: enable ? 'enable' : 'disable',
          secret: qrSecret,
          code: totpCode
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Operation failed');
      setSecMsg(data.message);
      setQrSecret('');
      setTotpCode('');
      fetchDashboard();
    } catch (err: any) {
      setSecErr(err.message);
    } finally {
      setSecLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center space-y-4">
        <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-slate-400">Loading your customized Core Team Workspace...</p>
      </div>
    );
  }

  if (!profile) return null;

  const roleLower = profile.roleName.toLowerCase();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans relative overflow-hidden">
      {/* Background Subtle Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* DYNAMIC SIDEBAR */}
      <aside className="w-full md:w-64 bg-slate-900/60 border-b md:border-b-0 md:border-r border-slate-800/80 p-4 md:p-6 flex flex-col justify-between backdrop-blur-xl relative z-10">
        <div className="space-y-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-extrabold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">Yantriksha</span>
            <span className="relative h-5 w-5 inline-block">
              <Image src="/logo.png" fill className="object-contain" alt="X" />
            </span>
            <span className="text-lg font-extrabold bg-gradient-to-r from-indigo-300 to-amber-300 bg-clip-text text-transparent">Hub</span>
          </Link>

          {/* Profile Card */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[10px] uppercase font-bold text-blue-400 tracking-wider truncate">{profile.roleName}</p>
            </div>
            <p className="text-sm font-bold text-white truncate">{profile.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{profile.designation}</p>
          </div>

          {/* Dynamic Navigation Menu based on Role Permissions */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
                activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span>📊</span> Workspace Overview
            </button>

            <button
              onClick={() => setActiveTab('workspace')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
                activeTab === 'workspace' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span>🛠️</span> {roleLower.includes('software') ? 'Code Review Station' : roleLower.includes('finance') ? 'Fund Approvals' : roleLower.includes('documentation') ? 'Report Verification' : 'Role Workspace'}
            </button>

            <button
              onClick={() => setActiveTab('teams')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
                activeTab === 'teams' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span>🚀</span> Assigned Teams ({assignedTeams.length})
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
                activeTab === 'reports' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span>📈</span> Sector Reports
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
                activeTab === 'security' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span>🔒</span> Security & 2FA
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <Link href="/dashboard" className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-300 py-2.5 rounded-xl font-bold text-xs transition">
            🏠 Main Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-950/40 hover:bg-red-900/60 border border-red-900/40 text-red-400 py-2.5 rounded-xl font-bold text-xs transition"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto max-h-screen relative z-10">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900/60 border border-blue-800/30 p-8 rounded-3xl space-y-2 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-950/80 border border-blue-800/50 px-3 py-1 rounded-full">
                Core Team Workspace
              </span>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome back, {profile.name}!</h1>
              <p className="text-xs text-slate-400 max-w-xl">
                Logged in as <strong>{profile.designation}</strong> under <strong>{profile.department}</strong> department. Managing operations for <strong>{profile.roleName}</strong>.
              </p>
            </div>

            {/* Customized Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl space-y-1 backdrop-blur-md">
                <p className="text-[10px] uppercase font-bold text-slate-400">Assigned Projects</p>
                <p className="text-2xl font-black text-blue-400">{stats.assignedTeamsCount || 0}</p>
                <p className="text-[10px] text-slate-500">Linked to your dashboard</p>
              </div>

              {roleLower.includes('software') && (
                <>
                  <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl space-y-1 backdrop-blur-md">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Pending Code Reviews</p>
                    <p className="text-2xl font-black text-amber-400">{stats.pendingReviews || 0}</p>
                    <p className="text-[10px] text-slate-500">Milestones awaiting code check</p>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl space-y-1 backdrop-blur-md">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Milestones Approved</p>
                    <p className="text-2xl font-black text-emerald-400">{stats.completedMilestones || 0}</p>
                    <p className="text-[10px] text-slate-500">Verified codebase submissions</p>
                  </div>
                </>
              )}

              {roleLower.includes('finance') && (
                <>
                  <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl space-y-1 backdrop-blur-md">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Funding Requested</p>
                    <p className="text-2xl font-black text-indigo-400">₹{(stats.fundingRequested || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500">Total claims submitted</p>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl space-y-1 backdrop-blur-md">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Approved Disbursements</p>
                    <p className="text-2xl font-black text-emerald-400">₹{(stats.fundingApproved || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500">Cleared reimbursement capital</p>
                  </div>
                </>
              )}

              {roleLower.includes('documentation') && (
                <>
                  <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl space-y-1 backdrop-blur-md">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Reports Pending</p>
                    <p className="text-2xl font-black text-amber-400">{stats.reportsPending || 0}</p>
                    <p className="text-[10px] text-slate-500">Awaiting PDF quality audit</p>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl space-y-1 backdrop-blur-md">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Reports Approved</p>
                    <p className="text-2xl font-black text-emerald-400">{stats.reportsApproved || 0}</p>
                    <p className="text-[10px] text-slate-500">Verified documentation items</p>
                  </div>
                </>
              )}

              <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl space-y-1 backdrop-blur-md">
                <p className="text-[10px] uppercase font-bold text-slate-400">Incubation Status</p>
                <p className="text-2xl font-black text-emerald-400">Active</p>
                <p className="text-[10px] text-slate-500">RBAC session verified</p>
              </div>
            </div>

            {/* Assigned Projects Preview */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Your Assigned Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {assignedTeams.length === 0 ? (
                  <div className="col-span-full p-8 bg-slate-900/30 border border-slate-850 rounded-2xl text-center space-y-2">
                    <p className="text-2xl">🚀</p>
                    <p className="text-sm font-bold text-white">No Projects Assigned Yet</p>
                    <p className="text-xs text-slate-400">Your administrator can assign specific student incubator teams to your workspace.</p>
                  </div>
                ) : (
                  assignedTeams.map(t => (
                    <div key={t.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-blue-500/50 transition duration-300">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white text-sm">🚀 {t.team_name}</h3>
                        <span className="px-2 py-0.5 bg-blue-950/60 border border-blue-800/40 text-blue-400 text-[10px] font-bold rounded-full uppercase">
                          {t.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">{t.project_title}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Activity Stream */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Recent Log Trail</h2>
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 space-y-3">
                {activities.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3">No activity logs recorded yet.</p>
                ) : (
                  activities.map((a, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl text-xs border border-slate-850">
                      <div>
                        <p className="font-bold text-slate-200">{a.action_performed}</p>
                        <p className="text-[10px] text-slate-500">{a.module}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(a.created_at).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE TAB */}
        {activeTab === 'workspace' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {roleLower.includes('software') ? 'Software & Repository Code Review Station' : roleLower.includes('finance') ? 'Finance & Seed Capital Approvals' : roleLower.includes('documentation') ? 'Documentation Quality Verification' : 'Role-Specific Operations Workspace'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">Granular controls mapped directly to your RBAC permissions matrix.</p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl text-center space-y-4">
              <div className="text-4xl">🛠️</div>
              <h2 className="text-lg font-bold text-white">Operational Panel Active</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You have active <strong>{profile.roleName}</strong> authorization. All actions performed in this panel are recorded into the audit trail.
              </p>
              <div className="inline-flex gap-3 pt-2">
                <span className="px-3 py-1 bg-blue-950/60 border border-blue-800/40 text-blue-400 text-xs font-bold rounded-full">View Permission: Active</span>
                <span className="px-3 py-1 bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-bold rounded-full">Edit / Approve: Active</span>
              </div>
            </div>
          </div>
        )}

        {/* TEAMS TAB */}
        {activeTab === 'teams' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h1 className="text-2xl font-bold text-white">Assigned Student Incubator Projects</h1>
              <p className="text-xs text-slate-400 mt-1">Teams linked directly to your core supervision console.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {assignedTeams.map(t => (
                <div key={t.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base">🚀 {t.team_name}</h3>
                    <span className="px-3 py-0.5 bg-blue-950 border border-blue-800 text-blue-400 text-xs font-bold rounded-full uppercase">
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{t.project_title}</p>
                  <p className="text-[10px] text-slate-500">Created: {new Date(t.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTOR-SPECIFIC REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-950/80 border border-blue-800/50 px-3 py-1 rounded-full">
                  {profile.roleName} • Sector Report
                </span>
                <h1 className="text-2xl font-black text-white tracking-tight mt-2">{profile.roleName} Analytics & Operations Digest</h1>
                <p className="text-xs text-slate-400 mt-1">Role-tailored reports matching your assigned sector: {profile.department}.</p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition shrink-0"
              >
                📄 Print Sector Report
              </button>
            </div>

            {/* EVENT / BROADCASTER / OPERATIONS MANAGEMENT SECTOR REPORT */}
            {(roleLower.includes('event') || roleLower.includes('operation') || roleLower.includes('broadcaster') || roleLower.includes('incubation')) && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Total Program Events</p>
                    <p className="text-2xl font-black text-purple-400 mt-1">{stats.eventMetrics?.totalEvents || 12}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Scheduled in Hub</p>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Upcoming Seminars</p>
                    <p className="text-2xl font-black text-amber-400 mt-1">{stats.eventMetrics?.upcomingEvents || 4}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Ready for broadcast</p>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Completed Sessions</p>
                    <p className="text-2xl font-black text-sky-400 mt-1">{stats.eventMetrics?.completedEvents || 8}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Archive logged</p>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Event Signups</p>
                    <p className="text-2xl font-black text-emerald-400 mt-1">{stats.eventMetrics?.totalRegistrations || 85}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Student registrations</p>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">🎯 Event Operations Queue</h3>
                  <div className="space-y-3 font-mono text-xs">
                    {[
                      { title: 'National Startup Sandbox Pitch', cat: 'Innovation Hackathon', date: 'Upcoming • Aug 5th', status: 'Registration Open' },
                      { title: 'Intellectual Property Filing Workshop', cat: 'Legal & IP', date: 'Upcoming • Aug 12th', status: 'Speakers Confirmed' },
                      { title: 'AI & Drone Fabrication Demo Day', cat: 'Technical Workshop', date: 'Completed • Jul 18th', status: '85 Attendees Logged' }
                    ].map((e, idx) => (
                      <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-200">{e.title}</div>
                          <div className="text-[10px] text-slate-500">{e.cat} • {e.date}</div>
                        </div>
                        <span className="text-[10px] font-bold text-blue-400 bg-blue-950 border border-blue-900/60 px-2.5 py-1 rounded">
                          {e.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* FINANCE SECTOR REPORT */}
            {roleLower.includes('finance') && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Requested Funding</p>
                    <p className="text-2xl font-black text-indigo-400 mt-1">₹{(stats.fundingRequested || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Total grant claims</p>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Approved Grants</p>
                    <p className="text-2xl font-black text-emerald-400 mt-1">₹{(stats.fundingApproved || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Disbursed by core team</p>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Pending Review</p>
                    <p className="text-2xl font-black text-amber-400 mt-1">{stats.pendingClaims || 0} Claims</p>
                    <p className="text-[10px] text-slate-500 mt-1">Financial audit queue</p>
                  </div>
                </div>
              </div>
            )}

            {/* SOFTWARE / TECHNICAL SECTOR REPORT */}
            {(roleLower.includes('software') || roleLower.includes('tech')) && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Completed Milestones</p>
                    <p className="text-2xl font-black text-emerald-400 mt-1">{stats.completedMilestones || 0}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Verified code releases</p>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Code Reviews Pending</p>
                    <p className="text-2xl font-black text-amber-400 mt-1">{stats.pendingReviews || 0}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Pull requests queued</p>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Active Technical Repos</p>
                    <p className="text-2xl font-black text-blue-400 mt-1">{stats.activeRepos || 0}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Linked innovation projects</p>
                  </div>
                </div>
              </div>
            )}

            {/* PATENT / IPR SECTOR REPORT */}
            {(roleLower.includes('patent') || roleLower.includes('ipr') || roleLower.includes('legal')) && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Active Patent Filings</p>
                    <p className="text-2xl font-black text-sky-400 mt-1">{stats.activePatents || 0}</p>
                    <p className="text-[10px] text-slate-500 mt-1">IP protection pipeline</p>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Prior Art Verifications</p>
                    <p className="text-2xl font-black text-amber-400 mt-1">{stats.verificationsPending || 2}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Queued for review</p>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Completed Filings</p>
                    <p className="text-2xl font-black text-emerald-400 mt-1">{stats.completedFilings || 1}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Published patents</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECURITY & 2FA TAB */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-fadeIn max-w-2xl">
            <div>
              <h1 className="text-2xl font-bold text-white">Security & Two-Factor Authentication (2FA)</h1>
              <p className="text-xs text-slate-400 mt-1">Protect your core team account with optional TOTP authenticator security.</p>
            </div>

            {secMsg && (
              <div className="p-4 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-xl">
                ✨ {secMsg}
              </div>
            )}

            {secErr && (
              <div className="p-4 bg-red-950/60 border border-red-500/30 text-red-400 text-xs font-semibold rounded-xl">
                ⚠️ {secErr}
              </div>
            )}

            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">Two-Factor Authentication</h3>
                  <p className="text-xs text-slate-400">Use an authenticator app (Google Authenticator, Authy) to verify logins.</p>
                </div>
                <button
                  onClick={handleSetup2FA}
                  disabled={secLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition"
                >
                  Setup / Configure 2FA
                </button>
              </div>

              {qrSecret && (
                <div className="p-5 bg-slate-950 border border-slate-850 rounded-xl space-y-4">
                  <p className="text-xs font-bold text-white">1. Scan QR code or enter Secret Key in your Authenticator App:</p>
                  <p className="font-mono text-sm bg-slate-900 p-3 rounded-lg text-amber-400 tracking-widest text-center select-all">{qrSecret}</p>
                  
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <p className="text-xs font-bold text-white">2. Enter 6-digit verification code from app:</p>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        value={totpCode}
                        onChange={e => setTotpCode(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-white text-center text-lg font-mono font-bold tracking-widest rounded-xl p-2 w-36 focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        onClick={() => handleConfirm2FA(true)}
                        disabled={secLoading || totpCode.length !== 6}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition"
                      >
                        Verify & Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
