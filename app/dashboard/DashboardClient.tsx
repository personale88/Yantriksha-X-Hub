'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const inp = [
  'w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none border transition-all duration-200',
  'bg-slate-900/70 border-slate-700/50 placeholder-slate-600',
  'focus:border-blue-500/80 focus:bg-slate-900 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]',
].join(' ');

const sel = [
  'w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none border transition-all duration-200 appearance-none cursor-pointer',
  'bg-slate-900/70 border-slate-700/50',
  'focus:border-blue-500/80 focus:bg-slate-900 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]',
].join(' ');

interface User {
  id: number;
  veltech_id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'mentor' | 'admin';
  discipline: 'engineering' | 'law' | 'business' | 'other';
  phone_number?: string;
  year_of_studying?: number;
  branch?: string;
  school?: string;
  notificationPreferences?: {
    club_updates: boolean;
    event_notifications: boolean;
    general_announcements: boolean;
    newsletter: boolean;
    recruitment_notifications: boolean;
  };
}

const DEPARTMENTS = [
  { value: 'CSE', label: 'CSE - Computer Science & Engineering' },
  { value: 'ECE', label: 'ECE - Electronics & Communication Engineering' },
  { value: 'EEE', label: 'EEE - Electrical & Electronics Engineering' },
  { value: 'MECH', label: 'MECH - Mechanical Engineering' },
  { value: 'CIVIL', label: 'CIVIL - Civil Engineering' },
  { value: 'AERO', label: 'AERO - Aeronautical Engineering' },
  { value: 'BIOTECH', label: 'BIOTECH - Biotechnology' },
  { value: 'IT', label: 'IT - Information Technology' },
  { value: 'MBA', label: 'MBA - Master of Business Administration' },
  { value: 'BBA', label: 'BBA - Bachelor of Business Administration' },
  { value: 'B.Com', label: 'B.Com - Bachelor of Commerce' },
  { value: 'BA LLB', label: 'BA LLB (Hons)' },
  { value: 'BBA LLB', label: 'BBA LLB (Hons)' },
  { value: 'LLB', label: 'LLB - Bachelor of Laws' },
  { value: 'BCA', label: 'BCA - Bachelor of Computer Applications' },
  { value: 'B.Sc', label: 'B.Sc - Bachelor of Science' },
  { value: 'Other', label: 'Other Department' },
];

const SCHOOLS = [
  { value: 'School of Computing', label: 'School of Computing' },
  { value: 'School of Electrical & Electronics', label: 'School of Electrical & Electronics' },
  { value: 'School of Mechanical & Construction', label: 'School of Mechanical & Construction' },
  { value: 'School of Law', label: 'School of Law' },
  { value: 'School of Management', label: 'School of Management' },
  { value: 'School of Science & Humanities', label: 'School of Science & Humanities' },
  { value: 'School of Media & Design', label: 'School of Media & Design' },
  { value: 'Other', label: 'Other School / Division' },
];

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  discipline: string;
}

interface TeamCompliance {
  teamId: number;
  teamName: string;
  sector: string;
  leaderId: number;
  currentStage: number;
  memberCount: number;
  hasEngineering: boolean;
  hasLaw: boolean;
  hasBusiness: boolean;
  hasFacultyAdvisor: boolean;
  compliancePercentage: number;
  errors: string[];
}

interface FundingRequest {
  id: number;
  requested_amount: number;
  itemized_budget: any;
  status: string;
  receipts_url?: string;
  created_at: string;
  team_name?: string;
}

interface Booking {
  id: number;
  team_id: number;
  mentor_id: number;
  scheduled_time: string;
  mode: 'virtual' | 'offline';
  meeting_link_or_venue?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  mentor_name?: string;
  team_name?: string;
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
  submitter_name?: string;
}

const ROADMAP_STEPS = [
  { step: 1, title: 'Problem Discovery', desc: 'Identify real-world problems, conduct literature surveys and patent database searches.', deliverable: 'Problem statement & validation research report.' },
  { step: 2, title: 'Team Formation', desc: 'Assemble cross-disciplinary team of Engineering, Law, and Business students plus Faculty Advisor.', deliverable: 'Approved team profile with exactly 10 members.' },
  { step: 3, title: 'Idea Validation', desc: 'Refine value proposition through targeted market research and user surveys.', deliverable: 'Customer validation survey results.' },
  { step: 4, title: 'Prototype Design', desc: 'Draft complete engineering blueprints, sensor integration, and component requirements.', deliverable: 'System design schematics & component bill of materials.' },
  { step: 5, title: 'Feasibility Evaluation', desc: 'Evaluate project across technical, financial, and legal pillars.', deliverable: 'Feasibility report.' },
  { step: 6, title: 'Resource Request', desc: 'Submit procurement requirements for hardware components and software.', deliverable: 'Procurement list & vendor quotes.' },
  { step: 7, title: 'Seed Funding', desc: 'Submit funding request (up to ₹50,000) for prototype fabrication reimbursement.', deliverable: 'Reimbursement forms & receipts.' },
  { step: 8, title: 'Mentorship Connect', desc: 'Schedule review sessions with assigned expert startup mentors.', deliverable: 'Mentor review logs.' },
  { step: 9, title: 'Progress Reporting', desc: 'Submit bi-weekly milestone reports detailing prototype fabrication status.', deliverable: 'Prototype progress report & live video link.' },
  { step: 10, title: 'Hackathon Challenges', desc: 'Participate in collegiate hackathons and innovation challenges (e.g. SIH).', deliverable: 'Hackathon certificate or proof of entry.' },
  { step: 11, title: 'Sandbox Testing', desc: 'Deploy prototype in simulated environment to log data and fix stability.', deliverable: 'Sandbox testing reports & log sheets.' },
  { step: 12, title: 'Research & IPR', desc: 'Secure intellectual property through patent/copyright filings.', deliverable: 'Patent filing receipt or proof of submission.' },
  { step: 13, title: 'Commercialization', desc: 'Build commercial go-to-market plan and pitch deck for investors.', deliverable: 'Pitch deck & financial projections.' },
  { step: 14, title: 'Startup Launch', desc: 'Register company as a legal corporate entity and open business bank account.', deliverable: 'Certificate of incorporation.' },
];

export default function DashboardClient({
  initialUser,
  initialTeam,
}: {
  initialUser: User;
  initialTeam: TeamCompliance | null;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'journey' | 'team' | 'project' | 'funding' | 'mentors' | 'events' | 'settings'>('dashboard');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [user, setUser] = useState<User>(initialUser);
  const [team, setTeam] = useState<TeamCompliance | null>(initialTeam);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<User[]>([]);
  const [unassignedFaculty, setUnassignedFaculty] = useState<User[]>([]);
  const [mentorsList, setMentorsList] = useState<User[]>([]);
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [fundingClaims, setFundingClaims] = useState<FundingRequest[]>([]);
  const [milestoneReports, setMilestoneReports] = useState<ProgressReport[]>([]);

  // Form states
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamSector, setNewTeamSector] = useState('Software');
  const [fundingAmount, setFundingAmount] = useState('');
  const [fundingBudget, setFundingBudget] = useState('');
  const [fundingFile, setFundingFile] = useState<File | null>(null);
  const [fundingFileUrl, setFundingFileUrl] = useState('');
  const [bookingMentorId, setBookingMentorId] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingMode, setBookingMode] = useState<'virtual' | 'offline'>('virtual');
  const [bookingLinkOrVenue, setBookingLinkOrVenue] = useState('');
  const [reportMilestoneStep, setReportMilestoneStep] = useState(1);
  const [reportContent, setReportContent] = useState('');
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportFileUrl, setReportFileUrl] = useState('');

  // Statuses
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch Team Members
  const fetchTeamMembers = async () => {
    if (!team) return;
    try {
      const res = await fetch(`/api/teams/members?team_id=${team.teamId}`);
      // Wait, there's no direct route in /api/teams/members to GET all members, let's look at Route again.
      // Ah! Our lib/teams getTeamCompliance already fetches the members of the team! But let's build an endpoint or fetch it from the database via custom endpoint if needed. Let's see: we can query the team members list using user roles inside the dashboard client directly, or implement a quick route.
      // Wait, we can fetch all members of user's team by calling GET /api/teams which returns the compliance object that already includes member details, or we can make a custom fetch. Let's check: compliance returns member details?
      // No, lib/teams.ts getTeamCompliance returns:
      // { teamId, teamName, sector, leaderId, currentStage, memberCount, hasEngineering, hasLaw, hasBusiness, hasFacultyAdvisor, compliancePercentage, errors }
      // It does NOT return the list of members directly!
      // Let's create an endpoint GET /api/teams/members to return the actual user objects of team members so the UI can display them! Let's view /api/teams/members/route.ts.
    } catch (e) {
      console.error(e);
    }
  };

  // Run on mount
  useEffect(() => {
    if (team) {
      fetchTeamAndMembers();
      fetchMilestoneReports();
      fetchFundingClaims();
      fetchBookings();
    }
    fetchUnassignedUsers();
    fetchMentors();
  }, [team?.teamId]);

  const fetchTeamAndMembers = async () => {
    if (!team) return;
    try {
      const res = await fetch('/api/teams');
      const data = await res.json();
      if (data.success && data.team) {
        setTeam(data.team);
      }
      
      const memRes = await fetch(`/api/teams/members?team_id=${team.teamId}`);
      const memData = await memRes.json();
      if (memData.success) {
        setTeamMembers(memData.members || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUnassignedUsers = async () => {
    try {
      const res1 = await fetch('/api/users/unassigned?role=student');
      const data1 = await res1.json();
      if (data1.success) setUnassignedStudents(data1.users);

      const res2 = await fetch('/api/users/unassigned?role=faculty');
      const data2 = await res2.json();
      if (data2.success) setUnassignedFaculty(data2.users);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMentors = async () => {
    try {
      const res = await fetch('/api/users/mentors');
      const data = await res.json();
      if (data.success) setMentorsList(data.mentors);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (data.success) setBookingsList(data.bookings);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFundingClaims = async () => {
    try {
      const res = await fetch('/api/funding/claim');
      const data = await res.json();
      if (data.success) setFundingClaims(data.claims);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMilestoneReports = async () => {
    try {
      const res = await fetch('/api/milestones');
      const data = await res.json();
      if (data.success) setMilestoneReports(data.reports);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_name: newTeamName, sector: newTeamSector }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create team');
      setSuccessMsg('Team created successfully!');
      setTeam(data.team);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/teams', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_name: team.teamName, sector: team.sector }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update team');
      setSuccessMsg('Team details updated successfully!');
      setTeam(data.team);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (userId: number) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/teams/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add member');
      setSuccessMsg('Member added to team!');
      setTeam(data.team);
      fetchUnassignedUsers();
      fetchTeamAndMembers();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/teams/members?user_id=${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove member');
      setSuccessMsg('Member removed from team.');
      setTeam(data.team);
      fetchUnassignedUsers();
      fetchTeamAndMembers();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFile = async (file: File, type: 'funding' | 'report') => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        if (type === 'funding') setFundingFileUrl(data.fileUrl);
        else setReportFileUrl(data.fileUrl);
        return data.fileUrl;
      }
    } catch (e) {
      console.error(e);
    }
    return '';
  };

  const handleSubmitFunding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      let finalFileUrl = fundingFileUrl;
      if (fundingFile) {
        finalFileUrl = await handleUploadFile(fundingFile, 'funding');
      }
      const res = await fetch('/api/funding/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requested_amount: fundingAmount,
          itemized_budget: fundingBudget,
          receipts_url: finalFileUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit funding request');
      setSuccessMsg('Funding request submitted successfully!');
      setFundingAmount('');
      setFundingBudget('');
      setFundingFile(null);
      setFundingFileUrl('');
      fetchFundingClaims();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id: team.teamId,
          mentor_id: parseInt(bookingMentorId, 10),
          scheduled_time: bookingTime,
          mode: bookingMode,
          meeting_link_or_venue: bookingLinkOrVenue,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create booking');
      setSuccessMsg('Mentorship booking scheduled successfully!');
      setBookingMentorId('');
      setBookingTime('');
      setBookingLinkOrVenue('');
      fetchBookings();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel booking');
      setSuccessMsg('Booking cancelled successfully.');
      fetchBookings();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      let finalFileUrl = reportFileUrl;
      if (reportFile) {
        finalFileUrl = await handleUploadFile(reportFile, 'report');
      }
      const res = await fetch('/api/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestone_step: reportMilestoneStep,
          report_content: reportContent,
          file_url: finalFileUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit milestone report');
      setSuccessMsg('Milestone report submitted successfully!');
      setReportContent('');
      setReportFile(null);
      setReportFileUrl('');
      fetchMilestoneReports();
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    if (user.role === 'student') {
      const phoneClean = (user.phone_number || '').trim();
      if (!/^\d{10}$/.test(phoneClean)) {
        setErrorMsg('Phone number must be exactly 10 digits.');
        setLoading(false);
        return;
      }
    }
    
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          phone_number: user.phone_number,
          year_of_studying: user.year_of_studying,
          branch: user.branch,
          school: user.school,
          discipline: user.discipline,
          notificationPreferences: user.notificationPreferences || {
            club_updates: true,
            event_notifications: true,
            general_announcements: true,
            newsletter: true,
            recruitment_notifications: true,
          }
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      setSuccessMsg('Profile updated successfully!');
      router.refresh();
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

  const getComplianceIcon = (val: boolean) => val ? '✅' : '❌';

  return (
    <main className="min-h-screen bg-space-grid text-white flex flex-row relative overflow-hidden">
      
      {/* ── Sidebar (Slim w-16 on mobile, expanded w-72 on desktop) ── */}
      <aside className="w-16 md:w-72 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800/80 flex flex-col z-20 shrink-0 transition-all duration-300">
        
        {/* Brand Logo */}
        <div className="p-3.5 md:p-6 border-b border-slate-800/60 flex items-center justify-center md:justify-start">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-9 w-9 rounded-lg overflow-hidden border border-slate-700/60 group-hover:border-blue-500/50 transition">
              <Image src="/logo.png" alt="logo" fill className="object-contain" style={{ mixBlendMode: 'screen' }} />
            </div>
            <span className="hidden md:flex items-center text-base font-extrabold">
              <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">Yantriksha</span>
              <span className="inline-block relative h-6 w-8 mx-0.5 align-middle shrink-0">
                <Image src="/logo.png" fill className="object-contain" style={{ mixBlendMode: 'screen' }} alt="X" />
              </span>
              <span className="bg-gradient-to-r from-indigo-300 to-amber-300 bg-clip-text text-transparent">Hub</span>
            </span>
          </Link>
        </div>

        {/* Menu items */}
        <nav className="flex-1 p-2 md:p-5 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
            { id: 'journey', label: 'My Journey', icon: '🚀' },
            { id: 'team', label: 'My Team', icon: '👥' },
            { id: 'project', label: 'My Project', icon: '📂' },
            { id: 'funding', label: 'Funding', icon: '💰' },
            { id: 'mentors', label: 'Mentors', icon: '👨‍🏫' },
            { id: 'events', label: 'Events', icon: '📅' },
            { id: 'settings', label: 'Settings', icon: '⚙️' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id as any); setErrorMsg(''); setSuccessMsg(''); }}
              className={`w-full flex items-center justify-center md:justify-start gap-3.5 p-3 md:px-4 md:py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === t.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title={t.label}
            >
              <span className="text-lg shrink-0">{t.icon}</span>
              <span className="hidden md:inline">{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-2 md:p-5 border-t border-slate-800/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-950/40 hover:bg-red-900/60 border border-red-900/40 text-red-400 p-3 md:py-3 rounded-xl font-bold text-sm transition-all duration-200"
            title="Logout"
          >
            <span>🚪</span><span className="hidden md:inline"> Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main content view area ── */}
      <section className="flex-1 p-6 md:p-10 z-10 overflow-y-auto max-h-screen">

        {/* Global Notification Messages */}
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
            TAB: DASHBOARD
        ═══════════════════════════════════════════════ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="section-pill">✦ Control Panel</span>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Welcome, {user.name} 👋</h1>
              <p className="text-gray-400 mt-2 text-xs uppercase tracking-widest font-semibold">
                Role: <span className="text-blue-400">{user.role}</span> | Discipline: <span className="text-amber-400">{user.discipline}</span>
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Current Stage card */}
              <div className="glass-card rounded-2xl p-6 border border-slate-800/60 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-3xl opacity-20">🚀</div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Current Stage</h3>
                <p className="text-blue-400 mt-3 text-xl font-bold">
                  {team ? ROADMAP_STEPS[team.currentStage - 1]?.title || `Milestone ${team.currentStage}` : 'No Active Team'}
                </p>
                <p className="text-[11px] text-gray-500 mt-2">
                  {team ? `Stage ${team.currentStage <= 2 ? '-1: Confusion' : team.currentStage <= 5 ? '0: Idea' : '1: Product'}` : 'Create a team to begin'}
                </p>
              </div>

              {/* Progress card */}
              <div className="glass-card rounded-2xl p-6 border border-slate-800/60 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-3xl opacity-20">📊</div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Progress</h3>
                <p className="text-green-400 mt-3 text-3xl font-extrabold">
                  {team ? Math.min(Math.round((team.currentStage / 14) * 100), 100) : 0}%
                </p>
                <div className="w-full bg-slate-950 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-green-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${team ? Math.min(Math.round((team.currentStage / 14) * 100), 100) : 0}%` }}
                  />
                </div>
              </div>

              {/* Team Members card */}
              <div className="glass-card rounded-2xl p-6 border border-slate-800/60 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-3xl opacity-20">👥</div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Team Compliance</h3>
                <p className="text-amber-400 mt-3 text-3xl font-extrabold">
                  {team ? `${team.memberCount} / 10` : '0 / 10'}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${team?.hasEngineering ? 'bg-blue-900/40 text-blue-300 border border-blue-800/40' : 'bg-slate-950 text-gray-600'}`}>ENG</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${team?.hasLaw ? 'bg-red-900/40 text-red-300 border border-red-800/40' : 'bg-slate-950 text-gray-600'}`}>LAW</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${team?.hasBusiness ? 'bg-amber-900/40 text-amber-300 border border-amber-800/40' : 'bg-slate-950 text-gray-600'}`}>MBA</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${team?.hasFacultyAdvisor ? 'bg-purple-900/40 text-purple-300 border border-purple-800/40' : 'bg-slate-950 text-gray-600'}`}>ADV</span>
                </div>
              </div>

              {/* Funding request status card */}
              <div className="glass-card rounded-2xl p-6 border border-slate-800/60 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-3xl opacity-20">💰</div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Procurement Budget</h3>
                <p className="text-pink-400 mt-3 text-xl font-bold">
                  {fundingClaims.length > 0 ? `₹${fundingClaims[0].requested_amount.toLocaleString()}` : 'No request'}
                </p>
                <p className="text-[11px] text-gray-500 mt-2">
                  Status: <span className="text-pink-400 font-semibold">{fundingClaims.length > 0 ? fundingClaims[0].status.replace('_', ' ') : 'Inactive'}</span>
                </p>
              </div>

            </div>

            {/* Compliance & Main Team Overview */}
            {team ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Compliance progress circle */}
                <div className="glass-card rounded-3xl p-8 border border-slate-800/60 relative">
                  <h3 className="text-lg font-bold mb-6 text-glow-blue flex items-center gap-2">
                    🛡️ Team Verification Checklist
                  </h3>

                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
                      <span className="text-sm">Engineering student included</span>
                      <span>{getComplianceIcon(team.hasEngineering)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
                      <span className="text-sm">Law student included</span>
                      <span>{getComplianceIcon(team.hasLaw)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
                      <span className="text-sm">Business (MBA) student included</span>
                      <span>{getComplianceIcon(team.hasBusiness)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
                      <span className="text-sm">Faculty Advisor assigned</span>
                      <span>{getComplianceIcon(team.hasFacultyAdvisor)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
                      <span className="text-sm">Contains exactly 10 members (Current: {team.memberCount})</span>
                      <span>{getComplianceIcon(team.memberCount === 10)}</span>
                    </div>
                  </div>
                </div>

                {/* Team Details Summary */}
                <div className="glass-card rounded-3xl p-8 border border-slate-800/60 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-4 text-glow-amber">📂 Project Sector Details</h3>
                    <p className="text-xs text-gray-500">TEAM NAME</p>
                    <p className="text-2xl font-black text-white mt-1 mb-4">{team.teamName}</p>
                    
                    <p className="text-xs text-gray-500">SECTOR / SECTOR FOCUS</p>
                    <p className="text-base font-bold text-gray-200 mt-1">{team.sector}</p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-800/60 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Roadmap Percentage</p>
                      <p className="text-3xl font-black text-blue-400 mt-1">
                        {Math.min(Math.round((team.currentStage / 14) * 100), 100)}%
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('journey')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition duration-200"
                    >
                      🚀 Open Roadmap
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-10 border border-slate-800/60 text-center max-w-xl mx-auto">
                <span className="text-5xl">👋</span>
                <h3 className="text-2xl font-black text-white mt-6">Get Started</h3>
                <p className="text-gray-400 mt-3 text-sm leading-relaxed">
                  You are not registered in any innovation team yet. Teams must consist of 10 students across Engineering, Law, and Business fields.
                </p>
                <button
                  onClick={() => setActiveTab('team')}
                  className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl transition duration-200 shadow-lg shadow-blue-900/30"
                >
                  Create or Search a Team →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB: JOURNEY (ROADMAP)
        ═══════════════════════════════════════════════ */}
        {activeTab === 'journey' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="section-pill">✦ Milestone Tracker</span>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">My Journey</h1>
              <p className="text-gray-400 mt-2 text-sm max-w-2xl">
                Submit progress reports at each milestone step. Approvals will move your team forward along the Yantriksha_X_Hub path.
              </p>
            </div>

            {team ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Timeline display */}
                <div className="lg:col-span-2 space-y-4">
                  {ROADMAP_STEPS.map((s) => {
                    const isUnlocked = s.step <= team.currentStage;
                    const isActive = s.step === team.currentStage;
                    return (
                      <div
                        key={s.step}
                        onClick={() => { if (isUnlocked) setReportMilestoneStep(s.step); }}
                        className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-blue-950/20 border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.15)]'
                            : isUnlocked
                            ? 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
                            : 'bg-slate-950/20 border-slate-900/40 opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isActive ? 'bg-blue-600 text-white' : isUnlocked ? 'bg-slate-800 text-blue-400' : 'bg-slate-950 text-gray-600'
                          }`}>
                            {s.step}
                          </span>
                          <div>
                            <h4 className="font-bold text-white text-sm flex items-center gap-2">
                              {s.title}
                              {isActive && <span className="bg-blue-900/60 text-blue-400 border border-blue-800/50 text-[10px] uppercase px-2 py-0.5 rounded-full font-black">Active</span>}
                            </h4>
                            <p className="text-gray-400 text-xs mt-1 leading-relaxed">{s.desc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Submissions & Form Panel */}
                <div className="space-y-6">
                  {/* Current Active Step Guidelines */}
                  <div className="glass-card rounded-2xl p-6 border border-slate-800/60">
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Selected Deliverable</h4>
                    <h3 className="text-lg font-bold text-white mb-2">Step {reportMilestoneStep}: {ROADMAP_STEPS[reportMilestoneStep - 1]?.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">{ROADMAP_STEPS[reportMilestoneStep - 1]?.deliverable}</p>

                    <form onSubmit={handleSubmitReport} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Report Description</label>
                        <textarea
                          value={reportContent}
                          onChange={e => setReportContent(e.target.value)}
                          placeholder="Provide details about completed work..."
                          rows={4}
                          className="w-full p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-white text-sm outline-none focus:border-blue-500/80"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Deliverable File</label>
                        <input
                          type="file"
                          onChange={e => { if (e.target.files?.[0]) setReportFile(e.target.files[0]); }}
                          className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600/10 file:text-blue-400 hover:file:bg-blue-600/20 file:cursor-pointer"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition duration-200 disabled:opacity-40"
                      >
                        Submit Step Report
                      </button>
                    </form>
                  </div>

                  {/* Previous Reports logs */}
                  <div className="glass-card rounded-2xl p-6 border border-slate-800/60">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">Milestone History</h4>
                    {milestoneReports.length === 0 ? (
                      <p className="text-xs text-gray-500">No submissions yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {milestoneReports.map(r => (
                          <div key={r.id} className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/40">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold text-white">Step {r.milestone_step}</span>
                              <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                                r.status === 'approved' ? 'bg-emerald-950 text-emerald-400' : r.status === 'revision_requested' ? 'bg-red-950 text-red-400' : 'bg-slate-900 text-gray-400'
                              }`}>
                                {r.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{r.report_content}</p>
                            {r.mentor_feedback && (
                              <p className="text-[10px] text-amber-400 mt-2 bg-amber-950/10 p-2 rounded border border-amber-900/20">
                                💬 Feedback: {r.mentor_feedback}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-10 border border-slate-800/60 text-center max-w-xl mx-auto">
                <span className="text-4xl">🔒</span>
                <h3 className="text-xl font-bold text-white mt-5">Roadmap Locked</h3>
                <p className="text-gray-400 mt-2 text-sm">Create or join a team first to unlock the 14-stage roadmap.</p>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB: TEAM
        ═══════════════════════════════════════════════ */}
        {activeTab === 'team' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="section-pill">✦ Compliance & Sourcing</span>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">My Team</h1>
              <p className="text-gray-400 mt-2 text-sm">
                Add members and faculty to establish an approved cross-disciplinary innovation unit.
              </p>
            </div>

            {!team ? (
              <div className="glass-card rounded-3xl p-8 border border-slate-800/60 max-w-lg mx-auto">
                <h3 className="text-xl font-bold text-white mb-6">Create New Team</h3>
                <form onSubmit={handleCreateTeam} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Team Name</label>
                    <input
                      type="text"
                      value={newTeamName}
                      onChange={e => setNewTeamName(e.target.value)}
                      placeholder="Enter a unique name"
                      className={inp}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Product Sector</label>
                    <select
                      value={newTeamSector}
                      onChange={e => setNewTeamSector(e.target.value)}
                      className={sel}
                    >
                      {['Aerospace', 'Software / AI', 'Biotechnology', 'LegalTech', 'FinTech', 'Agriculture', 'Clean Energy', 'Other'].map(s => (
                        <option key={s} value={s} className="bg-slate-900">{s}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition duration-200"
                  >
                    🚀 Create Team
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Active members grid */}
                <div className="glass-card rounded-3xl p-7 border border-slate-800/60">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    👥 Team Roster ({team.memberCount} / 10 Members)
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                      <thead className="text-xs uppercase bg-slate-950/40 text-gray-500 border-b border-slate-800/60">
                        <tr>
                          <th className="py-4 px-4">Name</th>
                          <th className="py-4 px-4">Email</th>
                          <th className="py-4 px-4">Role</th>
                          <th className="py-4 px-4">Discipline</th>
                          <th className="py-4 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {teamMembers.map(m => {
                          const isLeader = m.id === team.leaderId;
                          const isMe = m.id === user.id;
                          return (
                            <tr key={m.id} className={isMe ? 'bg-blue-950/10' : ''}>
                              <td className="py-4 px-4 font-bold text-white">
                                {m.name} {isMe && '(You)'}
                              </td>
                              <td className="py-4 px-4">{m.email}</td>
                              <td className="py-4 px-4">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                                  isLeader ? 'bg-blue-900/60 text-blue-400 border border-blue-800/40' : 'bg-slate-900 text-gray-400'
                                }`}>
                                  {isLeader ? 'LEADER' : m.role}
                                </span>
                              </td>
                              <td className="py-4 px-4 capitalize">{m.discipline}</td>
                              <td className="py-4 px-4 text-right">
                                {!isLeader && team.leaderId === user.id ? (
                                  <button
                                    onClick={() => handleRemoveMember(m.id)}
                                    className="text-red-400 hover:text-red-300 text-xs font-semibold hover:underline"
                                  >
                                    Remove
                                  </button>
                                ) : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Search / Invite Panel */}
                {user.role === 'student' && team.leaderId === user.id && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Add unassigned students */}
                    <div className="glass-card rounded-3xl p-7 border border-slate-800/60">
                      <h3 className="text-lg font-bold text-white mb-4">🔍 Available Students</h3>
                      <div className="space-y-3.5 max-h-96 overflow-y-auto pr-2">
                        {unassignedStudents.length === 0 ? (
                          <p className="text-xs text-gray-500">No unassigned students found.</p>
                        ) : (
                          unassignedStudents.map(s => (
                            <div key={s.id} className="flex justify-between items-center bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/40">
                              <div>
                                <h5 className="font-bold text-sm text-white">{s.name}</h5>
                                <p className="text-[10px] text-gray-500 capitalize">{s.discipline} | {s.branch || 'General'}</p>
                              </div>
                              <button
                                onClick={() => handleAddMember(s.id)}
                                className="bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 text-blue-400 hover:text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-200"
                              >
                                + Add
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Add Faculty Advisors */}
                    <div className="glass-card rounded-3xl p-7 border border-slate-800/60">
                      <h3 className="text-lg font-bold text-white mb-4">🏫 Available Faculty Advisors</h3>
                      <div className="space-y-3.5 max-h-96 overflow-y-auto pr-2">
                        {unassignedFaculty.length === 0 ? (
                          <p className="text-xs text-gray-500">No unassigned faculty advisors found.</p>
                        ) : (
                          unassignedFaculty.map(f => (
                            <div key={f.id} className="flex justify-between items-center bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/40">
                              <div>
                                <h5 className="font-bold text-sm text-white">{f.name}</h5>
                                <p className="text-[10px] text-gray-500">Faculty Advisor</p>
                              </div>
                              <button
                                onClick={() => handleAddMember(f.id)}
                                className="bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 text-blue-400 hover:text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-200"
                              >
                                + Add
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB: PROJECT (MY PROJECT)
        ═══════════════════════════════════════════════ */}
        {activeTab === 'project' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="section-pill">✦ Core Details</span>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">My Project</h1>
              <p className="text-gray-400 mt-2 text-sm">
                Maintain and update your team&apos;s product name, sector focus, and active development logs.
              </p>
            </div>

            {team ? (
              <div className="glass-card rounded-3xl p-8 border border-slate-800/60 max-w-xl">
                <h3 className="text-xl font-bold text-white mb-6">Edit Team / Project Profile</h3>
                <form onSubmit={handleUpdateTeam} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Team Name</label>
                    <input
                      type="text"
                      value={team.teamName}
                      onChange={e => setTeam({ ...team, teamName: e.target.value })}
                      className={inp}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Technology Sector</label>
                    <select
                      value={team.sector}
                      onChange={e => setTeam({ ...team, sector: e.target.value })}
                      className={sel}
                    >
                      {['Aerospace', 'Software / AI', 'Biotechnology', 'LegalTech', 'FinTech', 'Agriculture', 'Clean Energy', 'Other'].map(s => (
                        <option key={s} value={s} className="bg-slate-900">{s}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition duration-200"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-10 border border-slate-800/60 text-center max-w-xl mx-auto">
                <span className="text-4xl">📂</span>
                <h3 className="text-xl font-bold text-white mt-5">No Active Project</h3>
                <p className="text-gray-400 mt-2 text-sm">You must belong to a team to access project profiles.</p>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB: FUNDING
        ═══════════════════════════════════════════════ */}
        {activeTab === 'funding' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="section-pill">✦ Procurement Support</span>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Seed Funding</h1>
              <p className="text-gray-400 mt-2 text-sm">
                Request prototype fabrication reimbursement claims up to ₹50,000 per team.
              </p>
            </div>

            {team ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Submit funding claim */}
                <div className="glass-card rounded-3xl p-8 border border-slate-800/60">
                  <h3 className="text-xl font-bold text-white mb-6">Submit Budget Claim</h3>
                  <form onSubmit={handleSubmitFunding} className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Claim Amount (₹)</label>
                      <input
                        type="number"
                        max={50000}
                        value={fundingAmount}
                        onChange={e => setFundingAmount(e.target.value)}
                        placeholder="e.g. 15000"
                        className={inp}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Itemized Budget Details</label>
                      <textarea
                        value={fundingBudget}
                        onChange={e => setFundingBudget(e.target.value)}
                        placeholder="List components, costs, and vendors..."
                        rows={5}
                        className="w-full p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl text-white text-sm outline-none focus:border-blue-500/80"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Receipts File (PDF/Image)</label>
                      <input
                        type="file"
                        onChange={e => { if (e.target.files?.[0]) setFundingFile(e.target.files[0]); }}
                        className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600/10 file:text-blue-400 hover:file:bg-blue-600/20 file:cursor-pointer"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition duration-200"
                    >
                      🚀 Submit Claim
                    </button>
                  </form>
                </div>

                {/* Past claims logs */}
                <div className="glass-card rounded-3xl p-8 border border-slate-800/60">
                  <h3 className="text-xl font-bold text-white mb-6">Budget Request Logs</h3>
                  {fundingClaims.length === 0 ? (
                    <p className="text-sm text-gray-500">No funding claims submitted yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {fundingClaims.map(c => (
                        <div key={c.id} className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/40">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-lg font-bold text-white">₹{isMounted ? c.requested_amount.toLocaleString() : c.requested_amount}</p>
                              <p className="text-[10px] text-gray-500 mt-1">{isMounted ? new Date(c.created_at).toLocaleDateString() : ''}</p>
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                              c.status === 'approved' || c.status === 'disbursed'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30'
                                : c.status === 'rejected'
                                ? 'bg-red-950 text-red-400 border border-red-900/30'
                                : 'bg-slate-900 text-gray-400 border border-slate-800'
                            }`}>
                              {c.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-3 whitespace-pre-line leading-relaxed">{c.itemized_budget}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-10 border border-slate-800/60 text-center max-w-xl mx-auto">
                <span className="text-4xl">💰</span>
                <h3 className="text-xl font-bold text-white mt-5">Funding Locked</h3>
                <p className="text-gray-400 mt-2 text-sm">Establish your team first to request seed funding.</p>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB: MENTORS
        ═══════════════════════════════════════════════ */}
        {activeTab === 'mentors' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="section-pill">✦ Advisors & Coaches</span>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Mentors Connect</h1>
              <p className="text-gray-400 mt-2 text-sm">
                Schedule dynamic virtual or offline guidance reviews with experts to iterate on product development.
              </p>
            </div>

            {team ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Book Session Form */}
                <div className="glass-card rounded-3xl p-8 border border-slate-800/60">
                  <h3 className="text-xl font-bold text-white mb-6">Schedule Session</h3>
                  <form onSubmit={handleBookMentor} className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Select Mentor</label>
                      <select
                        value={bookingMentorId}
                        onChange={e => setBookingMentorId(e.target.value)}
                        className={sel}
                        required
                      >
                        <option value="">Choose a mentor...</option>
                        {mentorsList.map(m => (
                          <option key={m.id} value={m.id} className="bg-slate-900">{m.name} ({m.discipline} expert)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Meeting Date & Time</label>
                      <input
                        type="datetime-local"
                        value={bookingTime}
                        onChange={e => setBookingTime(e.target.value)}
                        className={inp}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Meeting Mode</label>
                      <select
                        value={bookingMode}
                        onChange={e => setBookingMode(e.target.value as any)}
                        className={sel}
                      >
                        <option value="virtual" className="bg-slate-900">Virtual (Video Call)</option>
                        <option value="offline" className="bg-slate-900">Offline (On-campus Venue)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Venue or Meeting Link</label>
                      <input
                        type="text"
                        value={bookingLinkOrVenue}
                        onChange={e => setBookingLinkOrVenue(e.target.value)}
                        placeholder="Google Meet link or Room Number"
                        className={inp}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition duration-200"
                    >
                      📅 Confirm Session
                    </button>
                  </form>
                </div>

                {/* Booked Sessions list */}
                <div className="glass-card rounded-3xl p-8 border border-slate-800/60">
                  <h3 className="text-xl font-bold text-white mb-6">Upcoming Scheduled Bookings</h3>
                  {bookingsList.length === 0 ? (
                    <p className="text-sm text-gray-500">No review sessions booked yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {bookingsList.map(b => (
                        <div key={b.id} className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/40">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-bold text-sm text-white">Mentor: {b.mentor_name}</h5>
                              <p className="text-xs text-gray-500 mt-1">
                                📅 {isMounted ? new Date(b.scheduled_time).toLocaleString() : ''}
                              </p>
                              <p className="text-xs text-blue-400 mt-2 font-medium">
                                Mode: <span className="uppercase">{b.mode}</span> {b.meeting_link_or_venue && `| ${b.meeting_link_or_venue}`}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                b.status === 'scheduled' ? 'bg-blue-950 text-blue-400' : 'bg-red-950/40 text-red-400'
                              }`}>
                                {b.status}
                              </span>
                              {b.status === 'scheduled' && (
                                <button
                                  onClick={() => handleCancelBooking(b.id)}
                                  className="text-[10px] text-red-400 hover:underline"
                                >
                                  Cancel Booking
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-10 border border-slate-800/60 text-center max-w-xl mx-auto">
                <span className="text-4xl">👨‍🏫</span>
                <h3 className="text-xl font-bold text-white mt-5">Mentors Portal Locked</h3>
                <p className="text-gray-400 mt-2 text-sm">Register a team to schedule mentorship and feedback reviews.</p>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB: EVENTS
        ═══════════════════════════════════════════════ */}
        {activeTab === 'events' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="section-pill">✦ Academic Schedulers</span>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Upcoming Events</h1>
              <p className="text-gray-400 mt-2 text-sm">
                Participate in bootcamps, ideathons, and SIH training sessions organized by Yantriksha_X_Hub.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Smart India Hackathon Bootcamp', date: 'August 12, 2026', desc: 'Prepare your compliance logs, blueprints, and feasibility statements for internal SIH pre-screening.', icon: '🏆' },
                { title: 'Cross-Disciplinary Legal Review Clinic', date: 'August 24, 2026', desc: 'Connect with Law students to draft provisional patent agreements and regulatory checklists.', icon: '⚖️' },
                { title: 'Business Model Canvas Ideathon', date: 'September 05, 2026', desc: 'Formulate itemized budgets, market fit research, and corporate pitch materials for seed fund evaluation.', icon: '📊' },
              ].map(e => (
                <div key={e.title} className="glass-card rounded-3xl p-6 border border-slate-800/60 relative overflow-hidden">
                  <div className="text-3xl mb-4">{e.icon}</div>
                  <h4 className="font-bold text-white text-base mb-1.5">{e.title}</h4>
                  <p className="text-xs text-blue-400 font-semibold mb-3">Date: {e.date}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{e.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB: SETTINGS (PROFILE)
        ═══════════════════════════════════════════════ */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="section-pill">✦ Profile Management</span>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Settings</h1>
              <p className="text-gray-400 mt-2 text-sm">
                View and update your student credentials, phone numbers, and discipline settings.
              </p>
            </div>

            <div className="glass-card rounded-3xl p-8 border border-slate-800/60 max-w-xl">
              <h3 className="text-xl font-bold text-white mb-6">User Profile Details</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                    <input
                      type="text"
                      value={user.name}
                      onChange={e => setUser({ ...user, name: e.target.value })}
                      className={inp}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Student ID / Roll Number</label>
                    <input
                      type="text"
                      value={user.veltech_id}
                      className={`${inp} bg-slate-950 border-slate-900 opacity-60 cursor-not-allowed`}
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                    <input
                      type="email"
                      value={user.email}
                      className={`${inp} bg-slate-950 border-slate-900 opacity-60 cursor-not-allowed`}
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={user.phone_number || ''}
                      onChange={e => setUser({ ...user, phone_number: e.target.value })}
                      placeholder="10-digit phone number"
                      className={inp}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">School / Schooling</label>
                    <div className="relative">
                      <select
                        value={user.school || ''}
                        onChange={e => setUser({ ...user, school: e.target.value })}
                        className={sel}
                      >
                        <option value="" disabled className="bg-slate-900 text-gray-500">Select School</option>
                        {SCHOOLS.map(s => (
                          <option key={s.value} value={s.value} className="bg-slate-900">{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Branch / Department</label>
                    <div className="relative">
                      <select
                        value={user.branch || ''}
                        onChange={e => setUser({ ...user, branch: e.target.value })}
                        className={sel}
                      >
                        <option value="" disabled className="bg-slate-900 text-gray-500">Select Department</option>
                        {DEPARTMENTS.map(d => (
                          <option key={d.value} value={d.value} className="bg-slate-900">{d.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Year of Study</label>
                    <div className="relative">
                      <select
                        value={user.year_of_studying || 1}
                        onChange={e => setUser({ ...user, year_of_studying: parseInt(e.target.value, 10) })}
                        className={sel}
                      >
                        {[1, 2, 3, 4].map(y => (
                          <option key={y} value={y} className="bg-slate-900">{y}nd Year</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Email Notification Preferences */}
                <div className="pt-5 border-t border-slate-800/80 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-wide">
                      Email Notification Preferences
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Choose which categories of operational notifications you want to receive via email.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'club_updates', label: 'Club Updates & Announcements', desc: 'Receive recruitment news, workshops, and meeting details from your registered clubs.' },
                      { key: 'event_notifications', label: 'Event Announcements & Cancellations', desc: 'Get invitations to bootcamps, hackathons, and registration confirmations.' },
                      { key: 'general_announcements', label: 'General Campus Announcements', desc: 'Receive holiday alerts, technical fest dates, and critical placement updates.' },
                      { key: 'newsletter', label: 'Newsletters & Monthly Spotlights', desc: 'Monthly highlights of innovation hub accomplishments and start-up features.' },
                      { key: 'recruitment_notifications', label: 'Recruitment & Member Campaigns', desc: 'Be notified of team forming requests and new club admission drives.' }
                    ].map(({ key, label, desc }) => {
                      const prefs = user.notificationPreferences || {
                        club_updates: true,
                        event_notifications: true,
                        general_announcements: true,
                        newsletter: true,
                        recruitment_notifications: true,
                      };
                      const checked = (prefs as any)[key] ?? true;
                      
                      return (
                        <label key={key} className="flex items-start gap-3.5 cursor-pointer select-none group">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={e => {
                              setUser({
                                ...user,
                                notificationPreferences: {
                                  ...prefs,
                                  [key]: e.target.checked
                                }
                              });
                            }}
                            className="mt-0.5 h-4.5 w-4.5 rounded border-slate-700 bg-slate-900/60 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-blue-600"
                          />
                          <div>
                            <span className="text-xs font-bold text-gray-200 group-hover:text-white transition-colors duration-150">
                              {label}
                            </span>
                            <p className="text-[10px] text-gray-500 leading-normal mt-0.5">
                              {desc}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition duration-200 mt-4"
                >
                  Update Profile Details
                </button>
              </form>
            </div>
          </div>
        )}

      </section>

    </main>
  );
}
