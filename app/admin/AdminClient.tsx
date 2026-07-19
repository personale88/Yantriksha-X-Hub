'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface UserProfile {
  name: string;
  role: string;
}

interface User {
  id: number;
  veltech_id: string;
  name: string;
  email: string;
  role: string;
  discipline: string;
  phone_number?: string;
  year_of_studying?: number;
  branch?: string;
}

interface Team {
  id: number;
  team_name: string;
  sector: string;
  leader_name: string;
  current_stage: number;
  memberCount?: number;
  compliancePercentage?: number;
  isCompliant?: boolean;
}

interface ProgressReport {
  id: number;
  team_id: number;
  submitted_by: number;
  milestone_step: number;
  report_content: string;
  file_url?: string;
  mentor_feedback?: string;
  status: 'pending' | 'approved' | 'revision_requested';
  created_at: string;
  team_name: string;
  submitter_name: string;
}

interface FundingClaim {
  id: number;
  team_id: number;
  requested_amount: number;
  itemized_budget: string;
  status: string;
  receipts_url?: string;
  created_at: string;
  team_name: string;
}

export default function AdminClient({
  adminUser,
}: {
  adminUser: UserProfile;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'teams' | 'milestones' | 'funding'>('overview');

  // Lists state
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [claims, setClaims] = useState<FundingClaim[]>([]);

  // Search / Filters
  const [searchUser, setSearchUser] = useState('');
  const [searchTeam, setSearchTeam] = useState('');

  // Evaluation states
  const [evalReportId, setEvalReportId] = useState<number | null>(null);
  const [evalFeedback, setEvalFeedback] = useState('');
  const [evalStatus, setEvalStatus] = useState<'approved' | 'revision_requested'>('approved');

  // Loading / Messages
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users (We can fetch all students + mentors via a general API or search)
      const usersRes = await fetch('/api/users/unassigned?role='); // Empty role fetches all users
      const usersData = await usersRes.json();
      if (usersData.success) {
        setUsers(usersData.users);
      }

      // 2. Fetch Teams (using matchmaker endpoint with search/filter)
      const teamsRes = await fetch('/api/teams/matchmaker?limit=100');
      const teamsData = await teamsRes.json();
      if (teamsData.success) {
        setTeams(teamsData.teams);
      }

      // 3. Fetch Milestones
      const reportsRes = await fetch('/api/milestones');
      const reportsData = await reportsRes.json();
      if (reportsData.success) {
        setReports(reportsData.reports);
      }

      // 4. Fetch Funding Claims
      const claimsRes = await fetch('/api/funding/claim');
      const claimsData = await claimsRes.json();
      if (claimsData.success) {
        setClaims(claimsData.claims);
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to load administrator lists.');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalReportId) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/milestones/${evalReportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentor_feedback: evalFeedback,
          status: evalStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit evaluation');
      setSuccessMsg('Milestone evaluated successfully!');
      setEvalReportId(null);
      setEvalFeedback('');
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateFunding = async (claimId: number, status: 'approved' | 'rejected' | 'disbursed') => {
    if (!confirm(`Are you sure you want to mark this claim status as: ${status}?`)) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/funding/claim/${claimId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update funding status');
      setSuccessMsg(`Funding request ${status} successfully!`);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered lists
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.veltech_id?.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredTeams = teams.filter(t =>
    t.team_name.toLowerCase().includes(searchTeam.toLowerCase()) ||
    t.sector.toLowerCase().includes(searchTeam.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-space-grid text-white flex flex-col md:flex-row relative overflow-hidden">
      
      {/* ── Sidebar ── */}
      <aside className="w-full md:w-72 bg-slate-900/90 backdrop-blur-xl border-b md:border-b-0 md:border-r border-slate-800/80 flex flex-col z-20 shrink-0">
        
        {/* Brand Logo */}
        <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-9 w-9 rounded-lg overflow-hidden border border-slate-700/60 group-hover:border-blue-500/50 transition">
              <Image src="/logo.png" alt="logo" fill className="object-contain" style={{ mixBlendMode: 'screen' }} />
            </div>
            <span className="text-base font-extrabold flex items-center">
              <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">Yantriksha</span>
              <span className="inline-block relative h-6 w-8 mx-0.5 align-middle shrink-0">
                <Image src="/logo.png" fill className="object-contain" style={{ mixBlendMode: 'screen' }} alt="X" />
              </span>
              <span className="bg-gradient-to-r from-indigo-300 to-amber-300 bg-clip-text text-transparent">Hub</span>
            </span>
          </Link>
        </div>

        {/* Menu items */}
        <nav className="flex-1 p-5 space-y-1">
          {[
            { id: 'overview', label: 'Overview Console', icon: '📊' },
            { id: 'users', label: 'User Directory', icon: '👥' },
            { id: 'teams', label: 'Innovation Teams', icon: '📂' },
            { id: 'milestones', label: 'Milestone Reports', icon: '📝' },
            { id: 'funding', label: 'Funding Claims', icon: '💰' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id as any); setErrorMsg(''); setSuccessMsg(''); }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === t.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className="text-lg">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        {/* Dash link / Logout */}
        <div className="p-5 border-t border-slate-800/60 space-y-2">
          <Link href="/dashboard" className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 text-gray-300 py-3 rounded-xl font-bold text-sm transition-all duration-200">
            🏠 User Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-950/40 hover:bg-red-900/60 border border-red-900/40 text-red-400 py-3 rounded-xl font-bold text-sm transition-all duration-200"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ── Content View Area ── */}
      <section className="flex-1 p-6 md:p-10 z-10 overflow-y-auto max-h-screen">
        
        {/* Global Notifications */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/60 border border-red-800/60 text-red-400 rounded-2xl text-sm flex items-center gap-2.5 animate-fadeIn">
            <span>❌</span> {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 rounded-2xl text-sm flex items-center gap-2.5 animate-fadeIn">
            <span>🎉</span> {successMsg}
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB: OVERVIEW CONSOLE
        ═══════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="section-pill">✦ Administrator Console</span>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Overview Dashboard</h1>
              <p className="text-gray-400 mt-2 text-xs uppercase tracking-widest font-semibold">
                Authorized: <span className="text-blue-400">{adminUser.name}</span> | Role: <span className="text-amber-400">{adminUser.role}</span>
              </p>
            </div>

            {/* Admin Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Total Registered Users', val: users.length, color: 'text-blue-400', icon: '👥' },
                { title: 'Active Innovation Teams', val: teams.length, color: 'text-green-400', icon: '🚀' },
                { title: 'Pending Milestone Evaluations', val: reports.filter(r => r.status === 'pending').length, color: 'text-amber-400', icon: '📝' },
                { title: 'Pending Funding Requests', val: claims.filter(c => c.status.startsWith('pending')).length, color: 'text-pink-400', icon: '💰' },
              ].map(s => (
                <div key={s.title} className="glass-card rounded-2xl p-6 border border-slate-800/60 relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-3xl opacity-20">{s.icon}</div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{s.title}</h3>
                  <p className={`mt-3 text-3xl font-extrabold ${s.color}`}>{s.val}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions List */}
            <div className="glass-card rounded-3xl p-8 border border-slate-800/60">
              <h3 className="text-lg font-bold mb-4 text-glow-blue">🚀 Club Operations Overview</h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
                As a coordinator or mentor of Yantriksha_X_Hub, you can evaluate bi-weekly milestone reports to advance teams along the 14-stage roadmap, verify student roles, and approve seed funding reimbursements up to ₹50,000.
              </p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB: USER DIRECTORY
        ═══════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="section-pill">✦ Registry</span>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">User Directory</h1>
              </div>
              <input
                type="text"
                value={searchUser}
                onChange={e => setSearchUser(e.target.value)}
                placeholder="Search name, ID or email..."
                className="w-full md:w-80 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500/80"
              />
            </div>

            <div className="glass-card rounded-3xl border border-slate-800/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                  <thead className="text-xs uppercase bg-slate-950/40 text-gray-500 border-b border-slate-800/60">
                    <tr>
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">ID / Roll No.</th>
                      <th className="py-4 px-6">Email Address</th>
                      <th className="py-4 px-6">Role</th>
                      <th className="py-4 px-6">Discipline / Branch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">No users found.</td>
                      </tr>
                    ) : (
                      filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-slate-900/30">
                          <td className="py-4 px-6 font-bold text-white">{u.name}</td>
                          <td className="py-4 px-6 font-mono text-xs">{u.veltech_id || '—'}</td>
                          <td className="py-4 px-6 text-xs">{u.email}</td>
                          <td className="py-4 px-6">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              u.role === 'admin' ? 'bg-red-950 text-red-400 border border-red-900/30' :
                              u.role === 'mentor' || u.role === 'faculty' ? 'bg-purple-950 text-purple-400 border border-purple-900/30' : 'bg-slate-900 text-gray-400 border border-slate-800'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-xs capitalize">{u.discipline} {u.branch && `(${u.branch})`}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB: INNOVATION TEAMS
        ═══════════════════════════════════════════════ */}
        {activeTab === 'teams' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="section-pill">✦ Roster</span>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Active Teams</h1>
              </div>
              <input
                type="text"
                value={searchTeam}
                onChange={e => setSearchTeam(e.target.value)}
                placeholder="Search team name or sector..."
                className="w-full md:w-80 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500/80"
              />
            </div>

            <div className="glass-card rounded-3xl border border-slate-800/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                  <thead className="text-xs uppercase bg-slate-950/40 text-gray-500 border-b border-slate-800/60">
                    <tr>
                      <th className="py-4 px-6">Team Name</th>
                      <th className="py-4 px-6">Sector</th>
                      <th className="py-4 px-6">Leader</th>
                      <th className="py-4 px-6">Stage</th>
                      <th className="py-4 px-6">Members</th>
                      <th className="py-4 px-6">Compliance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {filteredTeams.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">No active teams found.</td>
                      </tr>
                    ) : (
                      filteredTeams.map(t => (
                        <tr key={t.id} className="hover:bg-slate-900/30">
                          <td className="py-4 px-6 font-bold text-white">{t.team_name}</td>
                          <td className="py-4 px-6 text-xs">{t.sector}</td>
                          <td className="py-4 px-6 text-xs">{t.leader_name}</td>
                          <td className="py-4 px-6 text-xs text-blue-400 font-bold">Step {t.current_stage}</td>
                          <td className="py-4 px-6 text-xs">{t.memberCount || 1} / 10</td>
                          <td className="py-4 px-6">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              t.compliancePercentage === 100 ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' : 'bg-amber-950 text-amber-400 border border-amber-900/30'
                            }`}>
                              {t.compliancePercentage || 20}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB: MILESTONE REPORTS
        ═══════════════════════════════════════════════ */}
        {activeTab === 'milestones' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="section-pill">✦ Auditing</span>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Milestone Evaluations</h1>
              <p className="text-gray-400 mt-2 text-sm">
                Evaluate pending bi-weekly progress reports submitted by innovation teams.
              </p>
            </div>

            {/* List and Evaluation Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Reports list */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-bold text-white">Pending Reports</h3>
                {reports.length === 0 ? (
                  <p className="text-sm text-gray-500">No milestone reports found.</p>
                ) : (
                  <div className="space-y-4">
                    {reports.map(r => (
                      <div
                        key={r.id}
                        onClick={() => { setEvalReportId(r.id); setEvalFeedback(r.mentor_feedback || ''); setEvalStatus(r.status === 'pending' ? 'approved' : r.status as any); }}
                        className={`p-5 rounded-2xl border transition duration-200 cursor-pointer ${
                          evalReportId === r.id
                            ? 'bg-blue-950/20 border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.15)]'
                            : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-white text-base">{r.team_name}</h4>
                            <p className="text-[10px] text-gray-500 mt-0.5">Submitted by: {r.submitter_name} | {isMounted ? new Date(r.created_at).toLocaleDateString() : ''}</p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            r.status === 'approved' ? 'bg-emerald-950 text-emerald-400' :
                            r.status === 'revision_requested' ? 'bg-red-950 text-red-400' : 'bg-amber-950 text-amber-400'
                          }`}>
                            {r.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line mb-3">{r.report_content}</p>
                        <div className="flex justify-between items-center text-[10px] text-blue-400 font-bold uppercase">
                          <span>Milestone: Step {r.milestone_step}</span>
                          {r.file_url && <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="hover:underline">📂 View File Attachment →</a>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Evaluation Panel */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Evaluation Control</h3>
                {evalReportId ? (
                  <div className="glass-card rounded-3xl p-6 border border-slate-800/60 space-y-5">
                    <h4 className="font-bold text-sm text-white">Evaluate Report ID: {evalReportId}</h4>
                    
                    <form onSubmit={handleEvaluateReport} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Mentor Feedback</label>
                        <textarea
                          value={evalFeedback}
                          onChange={e => setEvalFeedback(e.target.value)}
                          placeholder="Provide details about requirements, corrections, or suggestions..."
                          rows={6}
                          className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500/80"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Evaluation Status</label>
                        <select
                          value={evalStatus}
                          onChange={e => setEvalStatus(e.target.value as any)}
                          className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500/80"
                        >
                          <option value="approved">Approve & Advance Stage</option>
                          <option value="revision_requested">Request Revision / Corrections</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition duration-200"
                      >
                        Submit Evaluation
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="glass-card rounded-3xl p-8 border border-slate-800/60 text-center">
                    <span className="text-3xl">📝</span>
                    <h4 className="font-bold text-white mt-4">No Selected Report</h4>
                    <p className="text-xs text-gray-500 mt-2">Select a report from the list to begin evaluating.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB: FUNDING CLAIMS
        ═══════════════════════════════════════════════ */}
        {activeTab === 'funding' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="section-pill">✦ Disbursals</span>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Funding Requests</h1>
              <p className="text-gray-400 mt-2 text-sm">
                Verify procurement lists and approve seed budget disbursements.
              </p>
            </div>

            <div className="glass-card rounded-3xl border border-slate-800/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                  <thead className="text-xs uppercase bg-slate-950/40 text-gray-500 border-b border-slate-800/60">
                    <tr>
                      <th className="py-4 px-6">Team</th>
                      <th className="py-4 px-6">Requested Amount</th>
                      <th className="py-4 px-6">Procurement Details</th>
                      <th className="py-4 px-6">Submitted At</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {claims.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">No funding claims found.</td>
                      </tr>
                    ) : (
                      claims.map(c => (
                        <tr key={c.id} className="hover:bg-slate-900/30">
                          <td className="py-4 px-6 font-bold text-white">{c.team_name}</td>
                          <td className="py-4 px-6 text-xs font-bold text-glow-blue">₹{c.requested_amount.toLocaleString()}</td>
                          <td className="py-4 px-6 text-xs max-w-xs whitespace-pre-line leading-relaxed">{c.itemized_budget}</td>
                          <td className="py-4 px-6 text-xs">{isMounted ? new Date(c.created_at).toLocaleDateString() : ''}</td>
                          <td className="py-4 px-6">
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                              c.status === 'approved' || c.status === 'disbursed'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30'
                                : c.status === 'rejected'
                                ? 'bg-red-950 text-red-400 border border-red-900/30'
                                : 'bg-slate-900 text-gray-400 border border-slate-800'
                            }`}>
                              {c.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right space-y-1.5">
                            {c.status.startsWith('pending') ? (
                              <div className="flex flex-col items-end gap-1.5">
                                <button
                                  onClick={() => handleEvaluateFunding(c.id, 'approved')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-3 py-1 rounded-lg font-bold"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleEvaluateFunding(c.id, 'rejected')}
                                  className="bg-red-950 text-red-400 border border-red-900/40 hover:bg-red-900/40 text-[10px] px-3 py-1 rounded-lg font-bold"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : c.status === 'approved' ? (
                              <button
                                onClick={() => handleEvaluateFunding(c.id, 'disbursed')}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-3 py-1 rounded-lg font-bold"
                              >
                                Disburse
                              </button>
                            ) : (
                              <span className="text-gray-500">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </section>

    </main>
  );
}
