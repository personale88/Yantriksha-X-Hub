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
  team_name?: string;
  team_id?: number;
  reviewer_name?: string;
  mentor_name?: string;
  current_stage?: string;
  current_milestone?: string;
  overall_progress?: string;
  is_frozen?: number;
  assigned_reviewer_id?: number;
  assigned_mentor_id?: number;
  review_deadline?: string;
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
  itemized_budget: any;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'kanban' | 'teams' | 'milestones' | 'funding'>('overview');

  // Lists state
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [claims, setClaims] = useState<FundingClaim[]>([]);

  // Innovation Journey states
  const [journeyStudents, setJourneyStudents] = useState<User[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [milestonesConfig, setMilestonesConfig] = useState<any[]>([]);

  // Search / Filters
  const [searchUser, setSearchUser] = useState('');
  const [searchTeam, setSearchTeam] = useState('');

  // Selected details drawer states
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [selectedReview, setSelectedReview] = useState<any | null>(null);

  // Administrative control center panel inputs
  const [selectedReviewerId, setSelectedReviewerId] = useState('');
  const [reviewDeadline, setReviewDeadline] = useState('');
  const [selectedMentorId, setSelectedMentorId] = useState('');

  // Evaluation states
  const [evalFeedback, setEvalFeedback] = useState('');
  const [requiredCorrections, setRequiredCorrections] = useState('');
  const [evalStatus, setEvalStatus] = useState<'approved' | 'rejected' | 'skipped'>('approved');
  const [rejectTarget, setRejectTarget] = useState('');

  // Loading / Messages
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<User[]>([]);

  // Fetch team members roster dynamically when selected student changes
  useEffect(() => {
    if (selectedStudent && selectedStudent.team_id) {
      fetch(`/api/teams/members?team_id=${selectedStudent.team_id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSelectedTeamMembers(data.members || []);
          } else {
            setSelectedTeamMembers([]);
          }
        })
        .catch(() => setSelectedTeamMembers([]));
    } else {
      setSelectedTeamMembers([]);
    }
  }, [selectedStudent]);

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users
      const usersRes = await fetch('/api/users/unassigned?role=');
      const usersData = await usersRes.json();
      if (usersData.success) {
        setUsers(usersData.users);
      }

      // 2. Fetch Teams
      const teamsRes = await fetch('/api/teams/matchmaker?limit=100');
      const teamsData = await teamsRes.json();
      if (teamsData.success) {
        setTeams(teamsData.teams);
      }

      // 3. Fetch Gamified Innovation Journeys & Pending Reviews
      const journeyRes = await fetch('/api/innovation-journey/admin');
      const journeyData = await journeyRes.json();
      if (journeyData.success) {
        setJourneyStudents(journeyData.students || []);
        setPendingReviews(journeyData.pendingReviews || []);
        setMilestonesConfig(journeyData.milestonesConfig || []);
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
    if (!selectedReview) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/innovation-journey/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedReview.user_id || selectedReview.studentId || selectedReview.userId,
          milestoneKey: selectedReview.milestone_key || selectedReview.milestoneKey,
          status: evalStatus,
          comments: evalFeedback,
          requiredCorrections: evalStatus === 'rejected' ? requiredCorrections : undefined,
          customRejectTarget: evalStatus === 'rejected' ? rejectTarget : undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save evaluation review');

      setSuccessMsg(evalStatus === 'approved' ? 'Milestone approved and advanced!' : 'Milestone feedback logged and student notified.');
      setSelectedReview(null);
      setSelectedStudent(null);
      setEvalFeedback('');
      setRequiredCorrections('');
      setRejectTarget('');
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAction = async (studentId: number, actionStatus: string, payload: any) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/innovation-journey/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          status: actionStatus,
          ...payload
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete administrative command');

      setSuccessMsg(data.message || 'Action executed successfully!');
      setSelectedStudent(null);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (e) {
      console.error(e);
    }
  };

  // Filter lists based on search parameters
  const filteredTeams = teams.filter(t => 
    t.team_name.toLowerCase().includes(searchTeam.toLowerCase()) ||
    t.sector.toLowerCase().includes(searchTeam.toLowerCase())
  );

  const filteredStudents = journeyStudents.filter(s => 
    s.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    s.veltech_id.toLowerCase().includes(searchUser.toLowerCase()) ||
    (s.team_name && s.team_name.toLowerCase().includes(searchUser.toLowerCase()))
  );

  // Group students by Kanban columns
  const kanbanColumns = {
    confusion: filteredStudents.filter(s => s.current_stage === 'Stage -1: Confusion'),
    idea: filteredStudents.filter(s => s.current_stage === 'Stage 0: Idea'),
    product: filteredStudents.filter(s => s.current_stage === 'Stage 1: Product' && s.current_milestone !== 'stg_1_incubation' && s.current_milestone !== 'qr5' && s.current_milestone !== 'stg_1_scaling' && s.current_milestone !== 'stg_1_impact'),
    startup: filteredStudents.filter(s => s.current_milestone === 'stg_1_incubation' || s.current_milestone === 'qr5' || s.current_milestone === 'stg_1_scaling'),
    impact: filteredStudents.filter(s => s.current_milestone === 'stg_1_impact')
  };

  // Get available list of admin/mentors from users array
  const adminReviewersList = users.filter(u => u.role === 'admin' || u.role === 'mentor' || u.role === 'faculty');

  // Trigger file download mocks
  const triggerExcelExport = () => {
    alert("Exporting project tracker data to Microsoft Excel... Download will begin shortly.");
  };

  const triggerPDFExport = () => {
    alert("Compiling innovation report PDF document... Download will begin shortly.");
  };

  return (
    <div className="flex min-h-screen bg-space-grid relative overflow-hidden">
      
      {/* ── Sidebar Navigation ── */}
      <aside className="w-20 md:w-64 bg-slate-950/80 border-r border-slate-900 flex flex-col justify-between shrink-0 z-20 backdrop-blur">
        <div>
          <div className="p-6 border-b border-slate-900/60 flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-slate-900 border border-slate-800">
              <Image src="/logo.png" alt="logo" fill className="object-contain" style={{ mixBlendMode: 'screen' }} />
            </div>
            <div className="hidden md:block">
              <span className="font-extrabold text-white text-sm tracking-tight block leading-none">
                Yantriksha
              </span>
              <span className="text-[10px] text-gray-500 font-semibold tracking-widest uppercase mt-0.5 flex items-center gap-1 leading-none">
                <span className="inline-block relative w-3.5 h-3">
                  <Image src="/logo.png" fill className="object-contain" style={{ mixBlendMode: 'screen' }} alt="X" />
                </span>
                Hub
              </span>
            </div>
          </div>
          
          <nav className="p-4 space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'kanban', label: 'Progress Monitor', icon: '📋' },
              { id: 'teams', label: 'Active Teams', icon: '👥' },
              { id: 'milestones', label: 'Evaluations', icon: '📝' },
              { id: 'funding', label: 'Funding Claims', icon: '💰' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id as any);
                  setErrorMsg('');
                  setSuccessMsg('');
                  setSelectedStudent(null);
                  setSelectedReview(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition duration-200 ${
                  activeTab === t.id 
                    ? 'bg-blue-600/10 border border-blue-900/40 text-blue-400' 
                    : 'text-gray-400 hover:bg-slate-900/40 hover:text-white border border-transparent'
                }`}
              >
                <span className="text-lg">{t.icon}</span>
                <span className="hidden md:inline">{t.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-2 md:p-5 border-t border-slate-800/60 space-y-2">
          <Link href="/dashboard" className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 text-gray-300 p-3 md:py-3 rounded-xl font-bold text-sm transition-all duration-200" title="User Dashboard">
            <span>🏠</span><span className="hidden md:inline"> User Dashboard</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-950/40 hover:bg-red-900/60 border border-red-900/40 text-red-400 p-3 md:py-3 rounded-xl font-bold text-sm transition-all duration-200"
            title="Logout"
          >
            <span>🚪</span><span className="hidden md:inline"> Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Content View Area ── */}
      <section className="flex-1 p-6 md:p-10 z-10 overflow-y-auto max-h-screen relative">
        
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

            {/* Rich Overview Dashboard Counters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Total Students', val: journeyStudents.length, color: 'text-blue-400', icon: '👥' },
                { title: 'Total Teams', val: teams.length, color: 'text-green-400', icon: '🚀' },
                { title: 'Pending reviews', val: pendingReviews.length, color: 'text-amber-400', icon: '📝' },
                { title: 'Approved milestones', val: journeyStudents.filter(s => parseFloat(s.overall_progress || '0') > 0).length, color: 'text-emerald-400', icon: '✔️' },
                { title: 'Active Startups', val: journeyStudents.filter(s => s.current_milestone === 'stg_1_incubation' || s.current_milestone === 'qr5' || s.current_milestone === 'stg_1_scaling').length, color: 'text-violet-400', icon: '🏢' },
                { title: 'Published Papers', val: journeyStudents.filter(s => s.current_milestone === 'stg_1_branch_pub').length, color: 'text-cyan-400', icon: '📚' },
                { title: 'Patents Filed', val: journeyStudents.filter(s => s.current_milestone === 'stg_1_branch_pat').length, color: 'text-pink-400', icon: '📄' },
                { title: 'Impact Achieved', val: journeyStudents.filter(s => s.current_milestone === 'stg_1_impact').length, color: 'text-rose-400', icon: '🌍' },
              ].map(s => (
                <div key={s.title} className="glass-card rounded-2xl p-6 border border-slate-800/60 relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-3xl opacity-20">{s.icon}</div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{s.title}</h3>
                  <p className={`mt-3 text-3xl font-extrabold ${s.color}`}>{s.val}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Analytics Chart Block */}
              <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-800/60 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white">Stage-Wise Student Distribution</h3>
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Metrics</span>
                </div>
                
                {/* SVG Responsive Chart */}
                <div className="h-64 flex items-end justify-between gap-2 pt-4 px-2 border-b border-slate-800">
                  {[
                    { label: 'Confusion', val: kanbanColumns.confusion.length },
                    { label: 'Idea', val: kanbanColumns.idea.length },
                    { label: 'Product', val: kanbanColumns.product.length },
                    { label: 'Incubation', val: kanbanColumns.startup.length },
                    { label: 'Impact', val: kanbanColumns.impact.length }
                  ].map(c => {
                    const maxCount = Math.max(1, journeyStudents.length);
                    const percentHeight = Math.min(100, Math.max(15, (c.val / maxCount) * 100));
                    return (
                      <div key={c.label} className="flex-1 flex flex-col items-center group">
                        <span className="text-[10px] font-black text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                          {c.val}
                        </span>
                        <div 
                          className="w-full bg-gradient-to-t from-blue-900 to-blue-500 rounded-t-lg transition-all duration-700 hover:from-amber-600 hover:to-amber-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                          style={{ height: `${percentHeight}%` }}
                        />
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mt-3 text-center truncate w-full">
                          {c.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Diagnostics Queue Bottlenecks */}
              <div className="glass-card rounded-3xl p-6 border border-slate-800/60 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Control Room Alerts</h3>
                  <p className="text-[10px] text-gray-500 mt-1">Identified bottleneck segments & delays.</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-3.5 bg-red-950/20 border border-red-900/30 rounded-2xl flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <span className="font-extrabold text-red-400 block">QR Gate Review Backlog</span>
                      <span className="text-gray-400 mt-0.5 block">{pendingReviews.length} milestone requests currently await verification.</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-blue-950/20 border border-blue-900/30 rounded-2xl flex items-center gap-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <span className="font-extrabold text-blue-400 block">Incubated Startups</span>
                      <span className="text-gray-400 mt-0.5 block">{kanbanColumns.startup.length} projects incorporated.</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-3">
                    <span className="text-2xl">⏱️</span>
                    <div>
                      <span className="font-extrabold text-gray-300 block">Avg Response Time</span>
                      <span className="text-gray-400 mt-0.5 block">
                        {pendingReviews.length > 0 ? 'Evaluating active queue...' : 'All reviews processed.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Reports exports */}
            <div className="glass-card rounded-3xl p-8 border border-slate-800/60 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Innovation Metrics & Documentation Export</h3>
                <p className="text-sm text-gray-400 max-w-xl leading-relaxed">
                  Compile and export the overall cohort tracker metrics, team profiles, mentor logs, and academic publications lists to standard spreadsheet formats.
                </p>
              </div>

              <div className="flex gap-4 shrink-0">
                <button 
                  onClick={triggerExcelExport}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-lg shadow-emerald-950/30"
                >
                  🟢 Export Excel
                </button>
                <button 
                  onClick={triggerPDFExport}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-lg shadow-red-950/30"
                >
                  🔴 Export PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB: KANBAN PROGRESS MONITOR
        ═══════════════════════════════════════════════ */}
        {activeTab === 'kanban' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="section-pill">✦ Operational Tracking</span>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Progress Monitor</h1>
              </div>
              <input
                type="text"
                value={searchUser}
                onChange={e => setSearchUser(e.target.value)}
                placeholder="Search student, ID, or team name..."
                className="w-full md:w-80 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500/80"
              />
            </div>

            {/* Kanban Columns Flex wrapper */}
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-800">
              {[
                { id: 'confusion', title: 'Confusion', stage: 'Stage -1', cards: kanbanColumns.confusion, headerBg: 'bg-red-950/60 border-red-900/50 text-red-400' },
                { id: 'idea', title: 'Idea', stage: 'Stage 0', cards: kanbanColumns.idea, headerBg: 'bg-amber-950/60 border-amber-900/50 text-amber-400' },
                { id: 'product', title: 'Product', stage: 'Stage 1', cards: kanbanColumns.product, headerBg: 'bg-blue-950/60 border-blue-900/50 text-blue-400' },
                { id: 'startup', title: 'Startup/Incubation', stage: 'Stage 2', cards: kanbanColumns.startup, headerBg: 'bg-purple-950/60 border-purple-900/50 text-purple-400' },
                { id: 'impact', title: 'Impact', stage: 'Stage 3', cards: kanbanColumns.impact, headerBg: 'bg-emerald-950/60 border-emerald-900/50 text-emerald-400' }
              ].map(col => (
                <div key={col.id} className="w-80 shrink-0 flex flex-col space-y-4">
                  
                  {/* Column Header */}
                  <div className={`p-4 border rounded-2xl flex justify-between items-center ${col.headerBg}`}>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest block opacity-75">{col.stage}</span>
                      <h3 className="font-extrabold text-sm text-white mt-0.5">{col.title}</h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-950/50">{col.cards.length}</span>
                  </div>

                  {/* Cards stack */}
                  <div className="space-y-4 min-h-[400px] bg-slate-950/30 border border-slate-900/60 rounded-3xl p-4">
                    {col.cards.length === 0 ? (
                      <div className="py-20 text-center text-xs text-gray-600">No active teams.</div>
                    ) : (
                      col.cards.map(s => {
                        const activeConfig = milestonesConfig.find(m => m.key === s.current_milestone);
                        const isPending = pendingReviews.find(r => r.user_id === s.id);
                        return (
                          <div
                            key={s.id}
                            onClick={() => {
                              setSelectedStudent(s);
                              setSelectedReviewerId(s.assigned_reviewer_id ? String(s.assigned_reviewer_id) : '');
                              setReviewDeadline(s.review_deadline ? s.review_deadline.split('T')[0] : '');
                              setSelectedMentorId(s.assigned_mentor_id ? String(s.assigned_mentor_id) : '');
                              
                              if (isPending) {
                                setSelectedReview({
                                  user_id: s.id,
                                  milestone_key: s.current_milestone,
                                  student_name: s.name,
                                  id: isPending.id
                                });
                                setEvalStatus('approved');
                              } else {
                                setSelectedReview(null);
                              }
                            }}
                            className={`glass-card p-4 rounded-2xl border text-left cursor-pointer transition relative group ${
                              selectedStudent?.id === s.id
                                ? 'bg-blue-950/20 border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.15)] scale-[1.02]'
                                : 'border-slate-800/80 hover:border-slate-700'
                            } ${s.is_frozen ? 'border-red-950 opacity-70' : ''}`}
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="font-extrabold text-xs text-white leading-tight">{s.name}</h4>
                              {s.is_frozen === 1 && (
                                <span className="bg-red-950/80 text-red-400 border border-red-900/40 text-[7px] uppercase px-1.5 py-0.5 rounded font-black">Frozen</span>
                              )}
                              {isPending && (
                                <span className="bg-blue-950/80 text-blue-400 border border-blue-900/40 text-[7px] uppercase px-1.5 py-0.5 rounded font-black animate-pulse">Review</span>
                              )}
                            </div>
                            
                            <p className="text-[10px] text-gray-500 mt-1">Team: <span className="font-bold text-gray-400">{s.team_name || 'No team'}</span></p>
                            
                            <div className="mt-3 pt-3 border-t border-slate-900/60 flex justify-between items-center text-[9px]">
                              <span className="text-blue-400 font-bold max-w-[120px] truncate">{activeConfig?.title || s.current_milestone}</span>
                              <span className="font-bold text-emerald-400">{parseFloat(s.overall_progress || '0').toFixed(0)}%</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB: ACTIVE TEAMS ROSTER
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
            TAB: MILESTONE EVALUATIONS
        ═══════════════════════════════════════════════ */}
        {activeTab === 'milestones' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="section-pill">✦ Auditing</span>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Milestone Evaluations</h1>
              <p className="text-gray-400 mt-2 text-sm">
                Evaluate pending bi-weekly progress reports and Quality Review (QR) checkpoints.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Pending Reviews Queue</h3>
                  {pendingReviews.length === 0 ? (
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 text-center text-gray-500 text-sm">
                      🎉 No pending milestone review requests at the moment.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingReviews.map(r => {
                        const config = milestonesConfig.find(m => m.key === r.milestone_key);
                        return (
                          <div
                            key={r.id}
                            onClick={() => {
                              setSelectedReview(r);
                              setEvalStatus('approved');
                              setEvalFeedback('');
                              setRequiredCorrections('');
                              setRejectTarget('');
                            }}
                            className={`p-5 rounded-2xl border transition duration-200 cursor-pointer ${
                              selectedReview?.id === r.id
                                ? 'bg-blue-950/20 border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.15)]'
                                : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-bold text-white text-base">{r.student_name}</h4>
                                <p className="text-[10px] text-gray-500 mt-0.5">ID: {r.student_veltech_id} | Submitted: {isMounted ? new Date(r.started_at).toLocaleDateString() : ''}</p>
                              </div>
                              <span className="text-[9px] bg-blue-950 text-blue-400 border border-blue-900/50 px-2 py-0.5 rounded font-black uppercase animate-pulse">
                                Pending Verification
                              </span>
                            </div>
                            <div className="text-xs text-gray-300 font-semibold mb-2">
                              Milestone: {config?.title || r.milestone_key} ({config?.stage})
                            </div>
                            <div className="text-[10px] text-blue-400 font-bold uppercase mt-3">
                              ➔ Click to evaluate checkpoint
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-900">
                  <h3 className="text-lg font-bold text-white mb-4">Student Journey Progress Directory</h3>
                  <div className="glass-card rounded-2xl border border-slate-800/60 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-gray-400">
                        <thead className="bg-slate-950/40 text-gray-500 uppercase tracking-widest border-b border-slate-800/60">
                          <tr>
                            <th className="py-3 px-4">Student Name</th>
                            <th className="py-3 px-4">Active Stage</th>
                            <th className="py-3 px-4">Active Step</th>
                            <th className="py-3 px-4 text-center">Progress %</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {journeyStudents.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-4 text-center text-gray-500">No student profiles found.</td>
                            </tr>
                          ) : (
                            journeyStudents.map(s => {
                              const activeConfig = milestonesConfig.find(m => m.key === s.current_milestone);
                              return (
                                <tr key={s.id} className="hover:bg-slate-900/20">
                                  <td className="py-3.5 px-4 font-bold text-white">{s.name}</td>
                                  <td className="py-3.5 px-4 text-gray-400">{s.current_stage || 'Stage -1: Confusion'}</td>
                                  <td className="py-3.5 px-4 text-blue-400 font-medium">{activeConfig?.title || s.current_milestone}</td>
                                  <td className="py-3.5 px-4 text-center font-bold text-emerald-400">{parseFloat(s.overall_progress || '0').toFixed(0)}%</td>
                                  <td className="py-3.5 px-4 text-right">
                                    <button
                                      onClick={() => {
                                        setSelectedReview({
                                          user_id: s.id,
                                          milestone_key: s.current_milestone,
                                          student_name: s.name
                                        });
                                        setEvalStatus('skipped');
                                        setEvalFeedback('Manually completed by administrator.');
                                      }}
                                      className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-900/40 text-blue-400 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition"
                                    >
                                      Bypass / Unlock Next
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Evaluation Column Panel */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Evaluation Control Panel</h3>
                {selectedReview ? (
                  <div className="glass-card rounded-3xl p-6 border border-slate-800/60 space-y-5">
                    <div>
                      <h4 className="font-extrabold text-sm text-white">Evaluating: {selectedReview.student_name}</h4>
                      <span className="text-[10px] text-gray-500 block mt-1">
                        Checkpoint: {milestonesConfig.find(m => m.key === selectedReview.milestone_key)?.title || selectedReview.milestone_key}
                      </span>
                    </div>
                    
                    <form onSubmit={handleEvaluateReport} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Evaluation Status</label>
                        <select
                          value={evalStatus}
                          onChange={e => setEvalStatus(e.target.value as any)}
                          className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500/80"
                        >
                          <option value="approved">Approve & Unlock Next</option>
                          <option value="rejected">Reject & Send Backward</option>
                          <option value="skipped">Bypass / Skip Milestone</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Reviewer Feedback</label>
                        <textarea
                          value={evalFeedback}
                          onChange={e => setEvalFeedback(e.target.value)}
                          placeholder="Provide details about requirements, corrections, or suggestions..."
                          rows={4}
                          className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500/80"
                          required
                        />
                      </div>

                      {evalStatus === 'rejected' && (
                        <>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Required Corrections</label>
                            <textarea
                              value={requiredCorrections}
                              onChange={e => setRequiredCorrections(e.target.value)}
                              placeholder="Detail precise changes the student needs to make..."
                              rows={3}
                              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500/80"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Rejection Back-step Target</label>
                            <select
                              value={rejectTarget}
                              onChange={e => setRejectTarget(e.target.value)}
                              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500/80"
                            >
                              <option value="">Default (Previous step in timeline)</option>
                              {milestonesConfig
                                .filter((_, idx) => {
                                  const currentIdx = milestonesConfig.findIndex(m => m.key === selectedReview.milestone_key);
                                  return idx < currentIdx;
                                })
                                .map(m => (
                                  <option key={m.key} value={m.key}>
                                    {m.title} ({m.stage})
                                  </option>
                                ))}
                            </select>
                          </div>
                        </>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-650 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition"
                      >
                        {loading ? 'Evaluating...' : '✓ Submit Evaluation Review'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="glass-card rounded-2xl p-6 text-center text-xs text-gray-500 border border-slate-850">
                    Select a student from the pending list or directory to configure reviews.
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
              <span className="section-pill">✦ Funding</span>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Funding Requests</h1>
              <p className="text-gray-400 mt-2 text-sm">
                Approve or reject component and prototype seed grant reimbursement claims.
              </p>
            </div>

            <div className="glass-card rounded-3xl border border-slate-800/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                  <thead className="text-xs uppercase bg-slate-950/40 text-gray-500 border-b border-slate-800/60">
                    <tr>
                      <th className="py-4 px-6">Team Name</th>
                      <th className="py-4 px-6">Amount Requested</th>
                      <th className="py-4 px-6">Itemized Budget</th>
                      <th className="py-4 px-6">Submitted Date</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {claims.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">No funding claims found.</td>
                      </tr>
                    ) : (
                      claims.map(c => (
                        <tr key={c.id} className="hover:bg-slate-900/30">
                          <td className="py-4 px-6 font-bold text-white">{c.team_name}</td>
                          <td className="py-4 px-6 text-xs text-emerald-400 font-extrabold">₹{parseFloat(String(c.requested_amount)).toLocaleString()}</td>
                          <td className="py-4 px-6 text-xs max-w-xs truncate">{formatBudget(c.itemized_budget)}</td>
                          <td className="py-4 px-6 text-xs">{isMounted ? new Date(c.created_at).toLocaleDateString() : ''}</td>
                          <td className="py-4 px-6">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              c.status === 'approved' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                            }`}>
                              {c.status}
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

        {/* ── Slide-Out Team Progress Details Drawer Overlay ── */}
        {selectedStudent && (
          <div className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm flex justify-end" onClick={() => setSelectedStudent(null)}>
            
            {/* Drawer Body container */}
            <div 
              className="w-full max-w-lg bg-slate-900 border-l border-slate-800 p-8 shadow-2xl overflow-y-auto max-h-screen space-y-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">Team Progress Details</span>
                  <h2 className="text-2xl font-black text-white mt-1">{selectedStudent.name}</h2>
                  <span className="text-[10px] text-gray-500 mt-0.5 block">ID: {selectedStudent.veltech_id} | {selectedStudent.email}</span>
                </div>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* overall progress percent card */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Overall Progress</span>
                  <span className="text-2xl font-black text-emerald-400 mt-0.5 block">{parseFloat(selectedStudent.overall_progress || '0').toFixed(0)}% Completed</span>
                </div>
                {selectedStudent.team_name && (
                  <span className="bg-blue-950 text-blue-400 border border-blue-900/40 text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {selectedStudent.team_name}
                  </span>
                )}
              </div>

              {/* Members roster mapping (from selectedTeamMembers state) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">👥 Team Roster</h3>
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {selectedTeamMembers.length === 0 ? (
                    <div className="p-3 text-center text-xs text-gray-500">No members registered in team.</div>
                  ) : (
                    selectedTeamMembers.map(member => (
                      <div key={member.id} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-white block">{member.name}</span>
                          <span className="text-[9px] text-gray-500">
                            {member.discipline?.toUpperCase() || ''} | Year {member.year_of_studying || 1}
                          </span>
                        </div>
                        <span className="text-[9px] text-gray-400">{member.branch || 'General'}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Innovation Control Center panel */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">⚙️ Innovation Control Center</h3>
                
                <div className="space-y-4">
                  
                  {/* Freeze / Resume progress buttons */}
                  <div className="flex gap-4">
                    {selectedStudent.is_frozen ? (
                      <button
                        onClick={() => handleAdminAction(selectedStudent.id, 'resume_progress', {})}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-lg shadow-emerald-950/30"
                      >
                        🟢 Resume Journey Progress
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAdminAction(selectedStudent.id, 'freeze_progress', {})}
                        className="flex-1 bg-red-950/60 hover:bg-red-900 border border-red-900/40 text-red-400 font-bold text-xs py-2.5 rounded-xl transition"
                      >
                        🔴 Freeze Journey Progress
                      </button>
                    )}
                  </div>

                  {/* Assign Reviewer & Deadline */}
                  <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl space-y-3">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Reviewer & SLA Deadline</span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[8px] text-gray-500 uppercase font-bold mb-1">Assigned Auditor</label>
                        <select
                          value={selectedReviewerId}
                          onChange={e => setSelectedReviewerId(e.target.value)}
                          className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-[10px] outline-none"
                        >
                          <option value="">Unassigned</option>
                          {adminReviewersList.map(a => (
                            <option key={a.id} value={a.id}>{a.name} ({a.role})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[8px] text-gray-500 uppercase font-bold mb-1">Target Deadline</label>
                        <input
                          type="date"
                          value={reviewDeadline}
                          onChange={e => setReviewDeadline(e.target.value)}
                          className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-[10px] outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleAdminAction(selectedStudent.id, 'assign_reviewer', { reviewerId: selectedReviewerId, deadline: reviewDeadline })}
                      className="w-full bg-blue-600/10 hover:bg-blue-600/20 border border-blue-900/40 text-blue-400 font-bold text-[10px] py-2 rounded-lg transition"
                    >
                      Update Auditor Assignment
                    </button>
                  </div>

                  {/* Assign Mentor */}
                  <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl space-y-3">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Assigned Mentor</span>
                    <div>
                      <select
                        value={selectedMentorId}
                        onChange={e => setSelectedMentorId(e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-[10px] outline-none"
                      >
                        <option value="">No mentor assigned</option>
                        {adminReviewersList.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => handleAdminAction(selectedStudent.id, 'assign_mentor', { mentorId: selectedMentorId })}
                      className="w-full bg-blue-600/10 hover:bg-blue-600/20 border border-blue-900/40 text-blue-400 font-bold text-[10px] py-2 rounded-lg transition"
                    >
                      Update Mentor Assignment
                    </button>
                  </div>

                </div>
              </div>

              {/* Evaluation Panel inside slide-out drawer (if there is a pending review) */}
              {selectedReview && (
                <div className="space-y-4 pt-4 border-t border-slate-800 animate-pulse">
                  <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">📝 Evaluation Pending review</h3>
                  
                  <form onSubmit={handleEvaluateReport} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Auditing Status</label>
                      <select
                        value={evalStatus}
                        onChange={e => setEvalStatus(e.target.value as any)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-xl text-white outline-none"
                      >
                        <option value="approved">Approve milestone</option>
                        <option value="rejected">Request revision corrections</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Feedback Comments</label>
                      <textarea
                        value={evalFeedback}
                        onChange={e => setEvalFeedback(e.target.value)}
                        placeholder="Provide details about requirements..."
                        rows={3}
                        className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-xl text-white outline-none"
                        required
                      />
                    </div>

                    {evalStatus === 'rejected' && (
                      <>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Required Corrections</label>
                          <textarea
                            value={requiredCorrections}
                            onChange={e => setRequiredCorrections(e.target.value)}
                            placeholder="Detail precise changes needed..."
                            rows={2}
                            className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-xl text-white outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Rejection Back-step Target</label>
                          <select
                            value={rejectTarget}
                            onChange={e => setRejectTarget(e.target.value)}
                            className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-xl text-white outline-none"
                          >
                            <option value="">Default (Previous step in timeline)</option>
                            {milestonesConfig
                              .filter((_, idx) => {
                                const currentIdx = milestonesConfig.findIndex(m => m.key === selectedReview.milestone_key);
                                return idx < currentIdx;
                              })
                              .map(m => (
                                <option key={m.key} value={m.key}>
                                  {m.title} ({m.stage})
                                </option>
                              ))}
                          </select>
                        </div>
                      </>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-650 hover:bg-blue-750 text-white font-bold py-2.5 rounded-xl transition mt-2"
                    >
                      Submit Audit Evaluation Review
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

      </section>
    </div>
  );
}

function formatBudget(budget: any): string {
  if (!budget) return 'No details';
  if (typeof budget === 'string') {
    try {
      const parsed = JSON.parse(budget);
      return formatBudget(parsed);
    } catch {
      return budget;
    }
  }
  if (typeof budget === 'object') {
    return Object.entries(budget)
      .map(([k, v]) => `${k}: ${typeof v === 'number' ? '₹' + v.toLocaleString() : v}`)
      .join(', ');
  }
  return String(budget);
}
