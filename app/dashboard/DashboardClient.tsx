'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import DashboardJourney from '@/components/roadmap/DashboardJourney';
import DashboardShell from '@/components/dashboard/DashboardShell';


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
  // Computing / IT
  { value: 'CSE', label: 'CSE - Computer Science & Engineering' },
  { value: 'CSE (AI & ML)', label: 'CSE (AI & ML) - Artificial Intelligence & Machine Learning' },
  { value: 'CSE (Cyber Security)', label: 'CSE (Cyber Security) - Cyber Security' },
  { value: 'CSE (Data Science)', label: 'CSE (Data Science) - Data Science' },
  { value: 'AI & DS', label: 'AI & DS - Artificial Intelligence & Data Science' },
  { value: 'CSD', label: 'CSD - Computer Science & Design' },
  { value: 'IT', label: 'IT - Information Technology' },
  { value: 'MCA', label: 'MCA - Master of Computer Applications' },
  { value: 'BCA', label: 'BCA - Bachelor of Computer Applications' },
  
  // Electrical / Communication
  { value: 'ECE', label: 'ECE - Electronics & Communication Engineering' },
  { value: 'EEE', label: 'EEE - Electrical & Electronics Engineering' },
  { value: 'Biomedical', label: 'Biomedical Engineering' },
  
  // Mechanical / Construction / Other Engineering
  { value: 'Mechanical', label: 'Mechanical Engineering' },
  { value: 'Civil', label: 'Civil Engineering' },
  { value: 'Aeronautical', label: 'Aeronautical Engineering' },
  { value: 'Automobile', label: 'Automobile Engineering' },
  { value: 'Biotechnology', label: 'Biotechnology' },
  { value: 'Mechatronics', label: 'Mechatronics Engineering' },
  { value: 'Agricultural', label: 'Agricultural Engineering' },
  { value: 'Chemical', label: 'Chemical Engineering' },
  { value: 'Petroleum', label: 'Petroleum Engineering' },
  { value: 'Marine', label: 'Marine Engineering' },
  { value: 'Food Technology', label: 'Food Technology' },
  
  // Business / Management
  { value: 'MBA', label: 'MBA - Master of Business Administration' },
  { value: 'BBA', label: 'BBA - Bachelor of Business Administration' },
  { value: 'B.Com', label: 'B.Com - Bachelor of Commerce' },
  
  // Law / Legal Studies
  { value: 'BA LLB', label: 'BA LLB (Hons)' },
  { value: 'BBA LLB', label: 'BBA LLB (Hons)' },
  { value: 'LLB', label: 'LLB - Bachelor of Laws' },
  { value: 'Law', label: 'Law / Legal Studies (Other)' },
  
  // Science / Others
  { value: 'B.Sc', label: 'B.Sc - Bachelor of Science' },
  { value: 'other', label: 'Other Department' },
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
  project_role?: string;
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
  { step: 7, title: 'Seed Funding', desc: 'Submit funding request (up to â‚¹50,000) for prototype fabrication reimbursement.', deliverable: 'Reimbursement forms & receipts.' },
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

  const handleUpdateMemberRole = async (memberId: number, roleName: string) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/teams/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: memberId, project_role: roleName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update role');
      setSuccessMsg('Member project role updated successfully.');
      fetchTeamAndMembers();
    } catch (err: any) {
      setErrorMsg(err.message);
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

  const getComplianceIcon = (val: boolean) => val ? 'âœ…' : 'âŒ';

  // â”€â”€ Premium Dashboard Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'â¬¡', group: 'Main' },
    { id: 'journey',   label: 'My Journey', icon: 'ðŸš€', group: 'Main' },
    { id: 'team',      label: 'My Team',    icon: 'ðŸ‘¥', group: 'Main' },
    { id: 'project',   label: 'My Project', icon: 'ðŸ“', group: 'Work' },
    { id: 'funding',   label: 'Funding',    icon: 'ðŸ’Ž', group: 'Work' },
    { id: 'mentors',   label: 'Mentors',    icon: 'ðŸŽ“', group: 'Work' },
    { id: 'events',    label: 'Events',     icon: 'ðŸ“…', group: 'Work' },
    { id: 'settings',  label: 'Settings',   icon: 'âš™',  group: 'Account' },
  ];

  const roleLabels: Record<string, string> = {
    student: 'Student Innovator',
    faculty: 'Faculty Advisor',
    mentor: 'Expert Mentor',
    admin: 'Administrator',
  };

  const dashInp = 'dash-input';
  const dashSel = 'dash-input';

  const stagePct = team ? Math.min(Math.round((team.currentStage / 14) * 100), 100) : 0;

  return (
    <DashboardShell
      user={{ name: user.name, role: user.role, email: user.email }}
      navItems={navItems}
      activeMenu={activeTab}
      setActiveMenu={(id) => { setActiveTab(id as any); setErrorMsg(''); setSuccessMsg(''); }}
      onLogout={handleLogout}
      breadcrumb={navItems.find(n => n.id === activeTab)?.label}
      roleLabel={roleLabels[user.role]}
      roleColor="#6366f1"
    >
      {/* Toast Messages */}
      {errorMsg && (
        <div className="dash-toast-error mb-6">
          <span>âœ•</span>
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} style={{ marginLeft: 'auto', opacity: 0.6 }}>âœ•</button>
        </div>
      )}
      {successMsg && (
        <div className="dash-toast-success mb-6">
          <span>âœ“</span>
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} style={{ marginLeft: 'auto', opacity: 0.6 }}>âœ•</button>
        </div>
      )}

      {/* â•â•â• TAB: DASHBOARD â•â•â• */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-fade-up">

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="dash-stat-card animate-fade-up delay-1">
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -mr-6 -mt-6 blur-2xl pointer-events-none" style={{ background: '#6366f1' }} />
              <div className="dash-stat-icon" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
                <span style={{ fontSize: 18 }}>ðŸš€</span>
              </div>
              <div className="dash-stat-value" style={{ color: '#a5b4fc' }}>
                {team ? ROADMAP_STEPS[team.currentStage - 1]?.title?.split(' ')[0] || `Stage ${team.currentStage}` : 'None'}
              </div>
              <div className="dash-stat-label">Current Stage</div>
              <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', marginTop: 6 }}>
                {team ? `Step ${team.currentStage} of 14` : 'Create a team to begin'}
              </p>
            </div>

            <div className="dash-stat-card animate-fade-up delay-2">
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -mr-6 -mt-6 blur-2xl pointer-events-none" style={{ background: '#10b981' }} />
              <div className="dash-stat-icon" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <span style={{ fontSize: 18 }}>ðŸ“ˆ</span>
              </div>
              <div className="dash-stat-value" style={{ color: '#34d399' }}>{stagePct}%</div>
              <div className="dash-stat-label">Roadmap Progress</div>
              <div className="dash-progress-track" style={{ height: 4, marginTop: 10 }}>
                <div className="dash-progress-fill green" style={{ width: `${stagePct}%` }} />
              </div>
            </div>

            <div className="dash-stat-card animate-fade-up delay-3">
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -mr-6 -mt-6 blur-2xl pointer-events-none" style={{ background: '#f59e0b' }} />
              <div className="dash-stat-icon" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <span style={{ fontSize: 18 }}>ðŸ‘¥</span>
              </div>
              <div className="dash-stat-value" style={{ color: '#fbbf24' }}>
                {team ? `${team.memberCount}/10` : '0/10'}
              </div>
              <div className="dash-stat-label">Team Members</div>
              <div className="flex gap-1 mt-2">
                {['ENG', 'LAW', 'MBA', 'ADV'].map((label, i) => {
                  const checks = [team?.hasEngineering, team?.hasLaw, team?.hasBusiness, team?.hasFacultyAdvisor];
                  return (
                    <span key={label} style={{
                      fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4,
                      background: checks[i] ? 'rgba(99,102,241,0.2)' : 'rgba(30,41,59,0.8)',
                      color: checks[i] ? '#a5b4fc' : 'rgba(100,116,139,0.5)',
                      border: `1px solid ${checks[i] ? 'rgba(99,102,241,0.3)' : 'transparent'}`,
                    }}>{label}</span>
                  );
                })}
              </div>
            </div>

            <div className="dash-stat-card animate-fade-up delay-4">
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -mr-6 -mt-6 blur-2xl pointer-events-none" style={{ background: '#a855f7' }} />
              <div className="dash-stat-icon" style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)' }}>
                <span style={{ fontSize: 18 }}>ðŸ’°</span>
              </div>
              <div className="dash-stat-value" style={{ color: '#c084fc' }}>
                {fundingClaims.length > 0 ? `â‚¹${fundingClaims[0].requested_amount.toLocaleString()}` : 'â€”'}
              </div>
              <div className="dash-stat-label">Seed Funding</div>
              {fundingClaims.length > 0 && (
                <span className={`status-chip mt-2 inline-flex ${
                  fundingClaims[0].status === 'approved' ? 'chip-success' : 
                  fundingClaims[0].status === 'rejected' ? 'chip-error' : 'chip-warning'
                }`}>
                  {fundingClaims[0].status}
                </span>
              )}
            </div>
          </div>

          {/* Team Hero / Get Started */}
          {team ? (
            <div className="dash-card dash-card-interactive" style={{ padding: 28 }}>
              <div className="flex flex-col sm:flex-row justify-between gap-6 items-start">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', padding: '3px 10px', borderRadius: 9999, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Active Project
                    </span>
                  </div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
                    {team.teamName}
                  </h2>
                  <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.7)', marginTop: 6 }}>
                    Sector: <span style={{ color: '#94a3b8', fontWeight: 600 }}>{team.sector}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-center">
                    <p style={{ fontSize: 28, fontWeight: 800, color: '#6366f1', fontFamily: 'var(--font-display)' }}>{stagePct}%</p>
                    <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', marginTop: 2 }}>Complete</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('journey')}
                    className="dash-btn dash-btn-primary"
                  >
                    ðŸš€ View Roadmap
                  </button>
                </div>
              </div>

              {/* Mini roadmap progress strip */}
              <div className="mt-6">
                <div className="flex gap-1">
                  {ROADMAP_STEPS.map((step, idx) => {
                    const done = team ? team.currentStage > idx : false;
                    const current = team ? team.currentStage === idx + 1 : false;
                    return (
                      <div
                        key={step.step}
                        title={step.title}
                        style={{
                          flex: 1, height: 6, borderRadius: 3,
                          background: done ? '#10b981' : current ? '#6366f1' : 'var(--dash-surface-4)',
                          boxShadow: current ? '0 0 8px rgba(99,102,241,0.6)' : 'none',
                          transition: 'all 0.3s',
                        }}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2" style={{ fontSize: 10, color: 'rgba(148,163,184,0.4)' }}>
                  <span>Stage 1</span>
                  <span style={{ color: '#6366f1', fontWeight: 700 }}>
                    Current: {team.currentStage} â€” {ROADMAP_STEPS[team.currentStage - 1]?.title}
                  </span>
                  <span>Stage 14</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="dash-card" style={{ padding: 48, textAlign: 'center' }}>
              <div className="dash-empty-icon" style={{ margin: '0 auto 16px' }}>ðŸš€</div>
              <h3 className="dash-empty-title">Start Your Innovation Journey</h3>
              <p className="dash-empty-desc">
                You are not registered in any innovation team yet. Create or join a cross-disciplinary team of 10 members to begin.
              </p>
              <button
                onClick={() => setActiveTab('team')}
                className="dash-btn dash-btn-primary"
                style={{ marginTop: 20 }}
              >
                Create or Search a Team â†’
              </button>
            </div>
          )}

          {/* Milestone Reports & Bookings summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent milestone reports */}
            <div className="lg:col-span-2 dash-card" style={{ padding: 24 }}>
              <div className="dash-section-header">
                <div>
                  <div className="dash-section-title">ðŸ“‹ Milestone Reports</div>
                  <div className="dash-section-desc">Your submitted progress reports</div>
                </div>
                <button className="dash-btn dash-btn-secondary dash-btn-sm" onClick={() => setActiveTab('project')}>View All</button>
              </div>
              {milestoneReports.length === 0 ? (
                <div className="dash-empty" style={{ padding: '32px 16px' }}>
                  <div className="dash-empty-icon" style={{ width: 48, height: 48, fontSize: 22 }}>ðŸ“‹</div>
                  <p className="dash-empty-title" style={{ fontSize: 14 }}>No reports yet</p>
                </div>
              ) : (
                <div className="dash-timeline">
                  {milestoneReports.slice(0, 4).map((r, i) => (
                    <div key={r.id} className="dash-timeline-item">
                      <div className="dash-timeline-dot" style={{
                        background: r.status === 'approved' ? 'rgba(16,185,129,0.15)' : r.status === 'revision_requested' ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)',
                        borderColor: r.status === 'approved' ? 'rgba(16,185,129,0.3)' : r.status === 'revision_requested' ? 'rgba(245,158,11,0.3)' : 'rgba(99,102,241,0.3)',
                        color: r.status === 'approved' ? '#34d399' : r.status === 'revision_requested' ? '#fbbf24' : '#a5b4fc',
                      }}>
                        {r.milestone_step}
                      </div>
                      <div style={{ paddingTop: 4 }}>
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>
                            {ROADMAP_STEPS[r.milestone_step - 1]?.title || `Milestone ${r.milestone_step}`}
                          </span>
                          <span className={`status-chip ${r.status === 'approved' ? 'chip-success' : r.status === 'revision_requested' ? 'chip-warning' : 'chip-info'}`}>
                            {r.status?.replace('_', ' ')}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.5)', marginTop: 4 }}>
                          {isMounted ? new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                        </p>
                        {r.mentor_feedback && (
                          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6, background: 'var(--dash-surface-3)', padding: '8px 12px', borderRadius: 8, borderLeft: '3px solid #6366f1' }}>
                            ðŸ’¬ {r.mentor_feedback}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming bookings */}
            <div className="dash-card" style={{ padding: 24 }}>
              <div className="dash-section-header">
                <div className="dash-section-title">ðŸ“… Mentor Sessions</div>
              </div>
              {bookingsList.filter(b => b.status === 'scheduled').length === 0 ? (
                <div className="dash-empty" style={{ padding: '24px 8px' }}>
                  <div className="dash-empty-icon" style={{ width: 48, height: 48, fontSize: 22 }}>ðŸŽ“</div>
                  <p className="dash-empty-title" style={{ fontSize: 14 }}>No sessions booked</p>
                  <button className="dash-btn dash-btn-primary dash-btn-sm" onClick={() => setActiveTab('mentors')} style={{ marginTop: 12 }}>
                    Book Session
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookingsList.filter(b => b.status === 'scheduled').slice(0, 3).map(b => (
                    <div key={b.id} className="dash-card" style={{ padding: '14px 16px', border: '1px solid var(--dash-border)' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>
                        {b.mentor_name}
                      </p>
                      <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.6)', marginTop: 4 }}>
                        {isMounted ? new Date(b.scheduled_time).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="status-chip chip-info">{b.mode}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Hub Support Directory */}
          <div className="dash-card" style={{ padding: 24 }}>
            <div className="dash-section-header">
              <div>
                <div className="dash-section-title">ðŸ›Ÿ Hub Support Directory</div>
                <div className="dash-section-desc">Contact the core coordination team for help</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Dr. K. Kiran', role: 'Faculty Incubator Director', email: 'kkiran@veltech.edu.in', dept: 'Directorate of Innovation' },
                { name: 'Vamsi Krishna', role: 'Chief Student Coordinator', email: 'vamsikrishna@veltech.edu.in', dept: 'School of Computing' },
                { name: 'Vignesh Boddeda', role: 'Technical Platform Lead', email: 'vigneshboddeda@veltech.edu.in', dept: 'School of Computing' }
              ].map((member) => (
                <div key={member.name} className="dash-card dash-card-interactive" style={{ padding: 18 }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="dash-avatar" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                      {member.name.split(' ').map(p => p[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{member.name}</p>
                      <p style={{ fontSize: 10, color: '#6366f1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{member.role}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', marginBottom: 10 }}>{member.dept}</p>
                  <a href={`mailto:${member.email}`} style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
                    ðŸ“§ {member.email}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* â•â•â• TAB: JOURNEY â•â•â• */}
      {activeTab === 'journey' && (
        <DashboardJourney
          user={user}
          team={team}
          onRefresh={fetchTeamAndMembers}
        />
      )}

      {/* â•â•â• TAB: TEAM â•â•â• */}
      {activeTab === 'team' && (
        <div className="space-y-6 animate-fade-up">
          <div>
            <h2 className="dash-page-title">My Team</h2>
            <p className="dash-page-subtitle">Manage your innovation team roster and compliance requirements</p>
          </div>

          {!team ? (
            <div className="dash-card" style={{ padding: 40, maxWidth: 520 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 24 }}>Create New Team</h3>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="dash-label">Team Name</label>
                  <input type="text" value={newTeamName} onChange={e => setNewTeamName(e.target.value)}
                    placeholder="Enter a unique team name" className={dashInp} required />
                </div>
                <div>
                  <label className="dash-label">Product Sector</label>
                  <select value={newTeamSector} onChange={e => setNewTeamSector(e.target.value)} className={dashSel}>
                    {['Aerospace', 'Software / AI', 'Biotechnology', 'LegalTech', 'FinTech', 'Agriculture', 'Clean Energy', 'Other'].map(s => (
                      <option key={s} value={s} style={{ background: 'var(--dash-surface-2)' }}>{s}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" disabled={loading} className="dash-btn dash-btn-primary w-full" style={{ marginTop: 8 }}>
                  {loading ? <span className="dash-spinner" /> : 'ðŸš€ Create Team'}
                </button>
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                {/* Members Table */}
                <div className="dash-table-wrap">
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--dash-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p className="dash-section-title">ðŸ‘¥ Team Roster</p>
                      <p className="dash-section-desc">{team.memberCount} / 10 members</p>
                    </div>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="dash-table">
                      <thead>
                        <tr>
                          <th>Member</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Discipline</th>
                          <th>Project Role</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamMembers.map(m => {
                          const isLeader = m.id === team.leaderId;
                          const isMe = m.id === user.id;
                          return (
                            <tr key={m.id} style={isMe ? { background: 'rgba(99,102,241,0.05)' } : {}}>
                              <td>
                                <div className="flex items-center gap-2">
                                  <div className="dash-avatar dash-avatar-sm" style={{ background: isLeader ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'linear-gradient(135deg,#1e293b,#334155)' }}>
                                    {m.name.split(' ').map((p: string) => p[0]).slice(0, 2).join('')}
                                  </div>
                                  <div>
                                    <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{m.name}</span>
                                    {isMe && <span style={{ fontSize: 10, color: '#6366f1', marginLeft: 5 }}>(You)</span>}
                                  </div>
                                </div>
                              </td>
                              <td style={{ fontSize: 12 }}>{m.email}</td>
                              <td>
                                <span className={`status-chip ${isLeader ? 'chip-purple' : 'chip-neutral'}`}>
                                  {isLeader ? 'LEADER' : m.role}
                                </span>
                              </td>
                              <td style={{ textTransform: 'capitalize', fontSize: 13 }}>{m.discipline}</td>
                              <td>
                                {isLeader ? (
                                  <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.5)', fontStyle: 'italic' }}>Project Leader</span>
                                ) : team.leaderId === user.id ? (
                                  <select
                                    value={m.project_role || 'Developer'}
                                    onChange={(e) => handleUpdateMemberRole(m.id, e.target.value)}
                                    className="dash-input dash-btn-sm"
                                    style={{ padding: '4px 8px', fontSize: 12 }}
                                  >
                                    {['Developer', 'Frontend Developer', 'Backend Developer', 'Database Administrator', 'Automation Engineer', 'Quality Analyst', 'Business Strategist', 'Legal Advisor', 'Research Analyst'].map(r => (
                                      <option key={r} value={r} style={{ background: 'var(--dash-surface-2)' }}>{r}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <span style={{ fontSize: 13 }}>{m.project_role || 'Developer'}</span>
                                )}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                {!isLeader && team.leaderId === user.id ? (
                                  <button onClick={() => handleRemoveMember(m.id)} className="dash-btn dash-btn-danger dash-btn-sm">
                                    Remove
                                  </button>
                                ) : 'â€”'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Add Members */}
                {user.role === 'student' && team.leaderId === user.id && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="dash-card" style={{ padding: 20 }}>
                      <p className="dash-section-title" style={{ marginBottom: 14 }}>ðŸ” Available Students</p>
                      <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {unassignedStudents.length === 0 ? (
                          <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.5)' }}>No unassigned students found.</p>
                        ) : unassignedStudents.map(s => (
                          <div key={s.id} className="flex justify-between items-center" style={{ padding: '10px 14px', background: 'var(--dash-surface-3)', borderRadius: 10, border: '1px solid var(--dash-border)' }}>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{s.name}</p>
                              <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', textTransform: 'capitalize' }}>{s.discipline} | {s.branch || 'General'}</p>
                            </div>
                            <button onClick={() => handleAddMember(s.id)} className="dash-btn dash-btn-primary dash-btn-sm">+ Add</button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="dash-card" style={{ padding: 20 }}>
                      <p className="dash-section-title" style={{ marginBottom: 14 }}>ðŸ« Available Faculty</p>
                      <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {unassignedFaculty.length === 0 ? (
                          <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.5)' }}>No unassigned faculty found.</p>
                        ) : unassignedFaculty.map(f => (
                          <div key={f.id} className="flex justify-between items-center" style={{ padding: '10px 14px', background: 'var(--dash-surface-3)', borderRadius: 10, border: '1px solid var(--dash-border)' }}>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{f.name}</p>
                              <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)' }}>Faculty Advisor</p>
                            </div>
                            <button onClick={() => handleAddMember(f.id)} className="dash-btn dash-btn-primary dash-btn-sm">+ Add</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Compliance Checklist */}
              <div className="dash-card" style={{ padding: 24 }}>
                <p className="dash-section-title" style={{ marginBottom: 16 }}>ðŸ›¡ï¸ Compliance Checklist</p>
                <div className="space-y-3">
                  {[
                    { label: 'Engineering student included', ok: team.hasEngineering },
                    { label: 'Law student included', ok: team.hasLaw },
                    { label: 'Business (MBA) student included', ok: team.hasBusiness },
                    { label: 'Faculty Advisor assigned', ok: team.hasFacultyAdvisor },
                    { label: `Exactly 10 members (Current: ${team.memberCount})`, ok: team.memberCount === 10 },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between" style={{ padding: '12px 14px', background: 'var(--dash-surface-3)', borderRadius: 10, border: `1px solid ${item.ok ? 'rgba(16,185,129,0.2)' : 'var(--dash-border)'}` }}>
                      <span style={{ fontSize: 13, color: '#94a3b8' }}>{item.label}</span>
                      <span style={{ fontSize: 16 }}>{item.ok ? 'âœ…' : 'âŒ'}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16 }}>
                  <div className="flex justify-between" style={{ fontSize: 12, color: 'rgba(148,163,184,0.5)', marginBottom: 6 }}>
                    <span>Compliance Score</span>
                    <span style={{ fontWeight: 700, color: '#6366f1' }}>{team.compliancePercentage}%</span>
                  </div>
                  <div className="dash-progress-track" style={{ height: 8 }}>
                    <div className={`dash-progress-fill ${team.compliancePercentage === 100 ? 'green' : ''}`} style={{ width: `${team.compliancePercentage}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* â•â•â• TAB: PROJECT â•â•â• */}
      {activeTab === 'project' && (
        <div className="space-y-6 animate-fade-up">
          <div>
            <h2 className="dash-page-title">My Project</h2>
            <p className="dash-page-subtitle">Manage team profile and submit milestone progress reports</p>
          </div>

          {team ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Edit team/project */}
              <div className="dash-card" style={{ padding: 28 }}>
                <p className="dash-section-title" style={{ marginBottom: 20 }}>Edit Project Profile</p>
                <form onSubmit={handleUpdateTeam} className="space-y-4">
                  <div>
                    <label className="dash-label">Team Name</label>
                    <input type="text" value={team.teamName} onChange={e => setTeam({ ...team, teamName: e.target.value })} className={dashInp} required />
                  </div>
                  <div>
                    <label className="dash-label">Technology Sector</label>
                    <select value={team.sector} onChange={e => setTeam({ ...team, sector: e.target.value })} className={dashSel}>
                      {['Aerospace', 'Software / AI', 'Biotechnology', 'LegalTech', 'FinTech', 'Agriculture', 'Clean Energy', 'Other'].map(s => (
                        <option key={s} value={s} style={{ background: 'var(--dash-surface-2)' }}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" disabled={loading} className="dash-btn dash-btn-primary" style={{ width: '100%' }}>
                    {loading ? <span className="dash-spinner" /> : 'Save Changes'}
                  </button>
                </form>
              </div>

              {/* Submit milestone report */}
              <div className="dash-card" style={{ padding: 28 }}>
                <p className="dash-section-title" style={{ marginBottom: 20 }}>Submit Milestone Report</p>
                <form onSubmit={handleSubmitReport} className="space-y-4">
                  <div>
                    <label className="dash-label">Milestone Step</label>
                    <select value={reportMilestoneStep} onChange={e => setReportMilestoneStep(parseInt(e.target.value))} className={dashSel}>
                      {ROADMAP_STEPS.map(s => (
                        <option key={s.step} value={s.step} style={{ background: 'var(--dash-surface-2)' }}>{s.step}. {s.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="dash-label">Report Content</label>
                    <textarea
                      value={reportContent}
                      onChange={e => setReportContent(e.target.value)}
                      className={dashInp}
                      rows={5}
                      placeholder="Describe your progress, achievements, and deliverables..."
                      required
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                  <div>
                    <label className="dash-label">Attachment (PDF/Image)</label>
                    <div style={{ border: '2px dashed var(--dash-border)', borderRadius: 10, padding: '16px', textAlign: 'center' }}>
                      <input
                        type="file"
                        onChange={e => { if (e.target.files?.[0]) setReportFile(e.target.files[0]); }}
                        style={{ fontSize: 12, color: '#94a3b8' }}
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="dash-btn dash-btn-primary" style={{ width: '100%' }}>
                    {loading ? <span className="dash-spinner" /> : 'ðŸ“¤ Submit Report'}
                  </button>
                </form>
              </div>

              {/* Past reports */}
              <div className="lg:col-span-2 dash-card" style={{ padding: 24 }}>
                <p className="dash-section-title" style={{ marginBottom: 16 }}>ðŸ“‹ Previous Submissions</p>
                {milestoneReports.length === 0 ? (
                  <div className="dash-empty" style={{ padding: '24px' }}>
                    <div className="dash-empty-icon">ðŸ“‹</div>
                    <p className="dash-empty-title">No milestone reports submitted</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {milestoneReports.map(r => (
                      <div key={r.id} className="dash-card" style={{ padding: 16 }}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
                              {ROADMAP_STEPS[r.milestone_step - 1]?.title || `Milestone ${r.milestone_step}`}
                            </p>
                            <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', marginTop: 2 }}>
                              {isMounted ? new Date(r.created_at).toLocaleDateString('en-IN') : ''}
                            </p>
                          </div>
                          <span className={`status-chip ${r.status === 'approved' ? 'chip-success' : r.status === 'revision_requested' ? 'chip-warning' : 'chip-info'}`}>
                            {r.status?.replace('_', ' ')}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{r.report_content.slice(0, 120)}{r.report_content.length > 120 ? 'â€¦' : ''}</p>
                        {r.mentor_feedback && (
                          <p style={{ fontSize: 12, color: '#a5b4fc', marginTop: 8, padding: '8px 10px', background: 'rgba(99,102,241,0.08)', borderRadius: 8, borderLeft: '2px solid #6366f1' }}>
                            ðŸ’¬ {r.mentor_feedback}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="dash-card" style={{ padding: 48, textAlign: 'center', maxWidth: 500 }}>
              <div className="dash-empty-icon" style={{ margin: '0 auto 16px' }}>ðŸ“</div>
              <h3 className="dash-empty-title">No Active Project</h3>
              <p className="dash-empty-desc">You must belong to a team to access project profiles.</p>
            </div>
          )}
        </div>
      )}

      {/* â•â•â• TAB: FUNDING â•â•â• */}
      {activeTab === 'funding' && (
        <div className="space-y-6 animate-fade-up">
          <div>
            <h2 className="dash-page-title">Seed Funding</h2>
            <p className="dash-page-subtitle">Request prototype fabrication reimbursement up to â‚¹50,000 per team</p>
          </div>

          {team ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="dash-card" style={{ padding: 28 }}>
                <p className="dash-section-title" style={{ marginBottom: 20 }}>ðŸ’Ž Submit Budget Claim</p>
                <form onSubmit={handleSubmitFunding} className="space-y-4">
                  <div>
                    <label className="dash-label">Claim Amount (â‚¹)</label>
                    <input type="number" max={50000} value={fundingAmount} onChange={e => setFundingAmount(e.target.value)}
                      placeholder="e.g. 15000" className={dashInp} required />
                  </div>
                  <div>
                    <label className="dash-label">Itemized Budget Details</label>
                    <textarea value={fundingBudget} onChange={e => setFundingBudget(e.target.value)}
                      placeholder="List components, costs, and vendors..." rows={5} className={dashInp} required style={{ resize: 'vertical' }} />
                  </div>
                  <div>
                    <label className="dash-label">Receipts File (PDF/Image)</label>
                    <div style={{ border: '2px dashed var(--dash-border)', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
                      <input type="file" onChange={e => { if (e.target.files?.[0]) setFundingFile(e.target.files[0]); }}
                        style={{ fontSize: 12, color: '#94a3b8' }} />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="dash-btn dash-btn-primary" style={{ width: '100%' }}>
                    {loading ? <span className="dash-spinner" /> : 'ðŸš€ Submit Claim'}
                  </button>
                </form>
              </div>

              <div className="dash-card" style={{ padding: 24 }}>
                <p className="dash-section-title" style={{ marginBottom: 16 }}>ðŸ“œ Request History</p>
                {fundingClaims.length === 0 ? (
                  <div className="dash-empty" style={{ padding: '32px' }}>
                    <div className="dash-empty-icon">ðŸ’°</div>
                    <p className="dash-empty-title">No claims submitted yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fundingClaims.map(c => (
                      <div key={c.id} className="dash-card" style={{ padding: 18 }}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', fontFamily: 'var(--font-display)' }}>
                              â‚¹{isMounted ? c.requested_amount.toLocaleString() : c.requested_amount}
                            </p>
                            <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', marginTop: 4 }}>
                              {isMounted ? new Date(c.created_at).toLocaleDateString('en-IN') : ''}
                            </p>
                          </div>
                          <span className={`status-chip ${c.status === 'approved' || c.status === 'disbursed' ? 'chip-success' : c.status === 'rejected' ? 'chip-error' : 'chip-warning'}`}>
                            {c.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 10, whiteSpace: 'pre-line', lineHeight: 1.6 }}>{c.itemized_budget}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="dash-card" style={{ padding: 48, textAlign: 'center', maxWidth: 500 }}>
              <div className="dash-empty-icon" style={{ margin: '0 auto 16px' }}>ðŸ’Ž</div>
              <h3 className="dash-empty-title">Funding Locked</h3>
              <p className="dash-empty-desc">Establish your team first to request seed funding.</p>
              <button className="dash-btn dash-btn-primary" onClick={() => setActiveTab('team')} style={{ marginTop: 20 }}>Create Team â†’</button>
            </div>
          )}
        </div>
      )}

      {/* â•â•â• TAB: MENTORS â•â•â• */}
      {activeTab === 'mentors' && (
        <div className="space-y-6 animate-fade-up">
          <div>
            <h2 className="dash-page-title">Mentors Connect</h2>
            <p className="dash-page-subtitle">Schedule virtual or offline guidance sessions with expert mentors</p>
          </div>

          {team ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="dash-card" style={{ padding: 28 }}>
                <p className="dash-section-title" style={{ marginBottom: 20 }}>ðŸ“… Schedule Session</p>
                <form onSubmit={handleBookMentor} className="space-y-4">
                  <div>
                    <label className="dash-label">Select Mentor</label>
                    <select value={bookingMentorId} onChange={e => setBookingMentorId(e.target.value)} className={dashSel} required>
                      <option value="">Choose a mentor...</option>
                      {mentorsList.map(m => (
                        <option key={m.id} value={m.id} style={{ background: 'var(--dash-surface-2)' }}>{m.name} ({m.discipline} expert)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="dash-label">Meeting Date & Time</label>
                    <input type="datetime-local" value={bookingTime} onChange={e => setBookingTime(e.target.value)} className={dashInp} required />
                  </div>
                  <div>
                    <label className="dash-label">Meeting Mode</label>
                    <select value={bookingMode} onChange={e => setBookingMode(e.target.value as any)} className={dashSel}>
                      <option value="virtual" style={{ background: 'var(--dash-surface-2)' }}>Virtual (Video Call)</option>
                      <option value="offline" style={{ background: 'var(--dash-surface-2)' }}>Offline (On-campus)</option>
                    </select>
                  </div>
                  <div>
                    <label className="dash-label">Venue or Meeting Link</label>
                    <input type="text" value={bookingLinkOrVenue} onChange={e => setBookingLinkOrVenue(e.target.value)}
                      placeholder="Google Meet link or Room Number" className={dashInp} />
                  </div>
                  <button type="submit" disabled={loading} className="dash-btn dash-btn-primary" style={{ width: '100%' }}>
                    {loading ? <span className="dash-spinner" /> : 'âœ“ Confirm Session'}
                  </button>
                </form>
              </div>

              <div className="dash-card" style={{ padding: 24 }}>
                <p className="dash-section-title" style={{ marginBottom: 16 }}>ðŸ—“ï¸ Scheduled Sessions</p>
                {bookingsList.length === 0 ? (
                  <div className="dash-empty" style={{ padding: '32px' }}>
                    <div className="dash-empty-icon">ðŸŽ“</div>
                    <p className="dash-empty-title">No sessions booked</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookingsList.map(b => (
                      <div key={b.id} className="dash-card" style={{ padding: 16, border: b.status === 'scheduled' ? '1px solid rgba(99,102,241,0.2)' : '1px solid var(--dash-border)' }}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>Mentor: {b.mentor_name}</p>
                            <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.6)', marginTop: 3 }}>
                              ðŸ“… {isMounted ? new Date(b.scheduled_time).toLocaleString('en-IN') : ''}
                            </p>
                            <p style={{ fontSize: 12, color: '#6366f1', marginTop: 3 }}>
                              Mode: <span style={{ textTransform: 'uppercase' }}>{b.mode}</span>
                              {b.meeting_link_or_venue && ` | ${b.meeting_link_or_venue}`}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`status-chip ${b.status === 'scheduled' ? 'chip-info' : b.status === 'completed' ? 'chip-success' : 'chip-error'}`}>
                              {b.status}
                            </span>
                            {b.status === 'scheduled' && (
                              <button onClick={() => handleCancelBooking(b.id)} className="dash-btn dash-btn-danger dash-btn-sm">
                                Cancel
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
            <div className="dash-card" style={{ padding: 48, textAlign: 'center', maxWidth: 500 }}>
              <div className="dash-empty-icon" style={{ margin: '0 auto 16px' }}>ðŸŽ“</div>
              <h3 className="dash-empty-title">Mentors Portal Locked</h3>
              <p className="dash-empty-desc">Register a team to schedule mentorship sessions.</p>
              <button className="dash-btn dash-btn-primary" onClick={() => setActiveTab('team')} style={{ marginTop: 20 }}>Create Team â†’</button>
            </div>
          )}
        </div>
      )}

      {/* â•â•â• TAB: EVENTS â•â•â• */}
      {activeTab === 'events' && (
        <div className="space-y-6 animate-fade-up">
          <div>
            <h2 className="dash-page-title">Upcoming Events</h2>
            <p className="dash-page-subtitle">Bootcamps, ideathons, and SIH training organized by Yantriksha X Hub</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'Smart India Hackathon Bootcamp', date: 'August 12, 2026', desc: 'Prepare your compliance logs, blueprints, and feasibility statements for SIH pre-screening.', icon: 'ðŸ†', color: '#f59e0b' },
              { title: 'Cross-Disciplinary Legal Review Clinic', date: 'August 24, 2026', desc: 'Connect with Law students to draft provisional patent agreements and regulatory checklists.', icon: 'âš–ï¸', color: '#6366f1' },
              { title: 'Business Model Canvas Ideathon', date: 'September 05, 2026', desc: 'Formulate itemized budgets, market fit research, and corporate pitch materials.', icon: 'ðŸ“Š', color: '#10b981' },
            ].map(e => (
              <div key={e.title} className="dash-card dash-card-interactive" style={{ padding: 24 }}>
                <div style={{ width: 44, height: 44, background: `${e.color}18`, border: `1px solid ${e.color}30`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 }}>
                  {e.icon}
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{e.title}</h4>
                <p style={{ fontSize: 11, color: e.color, fontWeight: 600, marginBottom: 10 }}>ðŸ“… {e.date}</p>
                <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.7)', lineHeight: 1.6 }}>{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* â•â•â• TAB: SETTINGS â•â•â• */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-fade-up">
          <div>
            <h2 className="dash-page-title">Settings</h2>
            <p className="dash-page-subtitle">View and update your profile, credentials, and notification preferences</p>
          </div>

          <div className="dash-card" style={{ padding: 32, maxWidth: 640 }}>
            {/* Profile header */}
            <div className="flex items-center gap-4 mb-8 pb-6" style={{ borderBottom: '1px solid var(--dash-border)' }}>
              <div className="dash-avatar" style={{ width: 56, height: 56, fontSize: 20, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#a855f7)' }}>
                {user.name.split(' ').map(p => p[0]).slice(0, 2).join('')}
              </div>
              <div>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', fontFamily: 'var(--font-display)' }}>{user.name}</p>
                <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.6)', textTransform: 'capitalize' }}>{user.role} Â· {user.discipline}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="dash-label">Full Name</label>
                  <input type="text" value={user.name} onChange={e => setUser({ ...user, name: e.target.value })} className={dashInp} required />
                </div>
                <div>
                  <label className="dash-label">Student ID / Roll Number</label>
                  <input type="text" value={user.veltech_id} className={dashInp} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="dash-label">Email Address</label>
                  <input type="email" value={user.email} className={dashInp} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                </div>
                <div>
                  <label className="dash-label">Phone Number</label>
                  <input type="tel" value={user.phone_number || ''} onChange={e => setUser({ ...user, phone_number: e.target.value })}
                    placeholder="10-digit phone number" className={dashInp} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="dash-label">School</label>
                  <select value={user.school || ''} onChange={e => setUser({ ...user, school: e.target.value })} className={dashSel}>
                    <option value="" disabled style={{ background: 'var(--dash-surface-2)' }}>Select School</option>
                    {SCHOOLS.map(s => <option key={s.value} value={s.value} style={{ background: 'var(--dash-surface-2)' }}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="dash-label">Branch</label>
                  <select value={user.branch || ''} onChange={e => setUser({ ...user, branch: e.target.value })} className={dashSel}>
                    <option value="" disabled style={{ background: 'var(--dash-surface-2)' }}>Select Dept</option>
                    {DEPARTMENTS.map(d => <option key={d.value} value={d.value} style={{ background: 'var(--dash-surface-2)' }}>{d.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="dash-label">Year of Study</label>
                  <select value={user.year_of_studying || 1} onChange={e => setUser({ ...user, year_of_studying: parseInt(e.target.value, 10) })} className={dashSel}>
                    {[1, 2, 3, 4].map(y => <option key={y} value={y} style={{ background: 'var(--dash-surface-2)' }}>Year {y}</option>)}
                  </select>
                </div>
              </div>

              {/* Notification preferences */}
              <div style={{ paddingTop: 20, borderTop: '1px solid var(--dash-border)' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
                  Email Notification Preferences
                </p>
                <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.5)', marginBottom: 16 }}>
                  Choose which notification categories you want to receive via email.
                </p>
                <div className="space-y-3">
                  {[
                    { key: 'club_updates', label: 'Club Updates & Announcements', desc: 'Recruitment news, workshops, and meeting details.' },
                    { key: 'event_notifications', label: 'Event Announcements', desc: 'Bootcamps, hackathons, and registration confirmations.' },
                    { key: 'general_announcements', label: 'General Campus Announcements', desc: 'Holiday alerts, technical fest dates, and placement updates.' },
                    { key: 'newsletter', label: 'Newsletters & Monthly Spotlights', desc: 'Monthly highlights of innovation hub accomplishments.' },
                    { key: 'recruitment_notifications', label: 'Recruitment Campaigns', desc: 'Team forming requests and new club admission drives.' },
                  ].map(({ key, label, desc }) => {
                    const prefs = user.notificationPreferences || { club_updates: true, event_notifications: true, general_announcements: true, newsletter: true, recruitment_notifications: true };
                    const checked = (prefs as any)[key] ?? true;
                    return (
                      <label key={key} className="flex items-start gap-3 cursor-pointer" style={{ padding: '10px 14px', background: 'var(--dash-surface-3)', borderRadius: 10, border: '1px solid var(--dash-border)' }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => setUser({ ...user, notificationPreferences: { ...prefs, [key]: e.target.checked } })}
                          style={{ marginTop: 2, accentColor: '#6366f1', cursor: 'pointer' }}
                        />
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{label}</span>
                          <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', marginTop: 2 }}>{desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button type="submit" disabled={loading} className="dash-btn dash-btn-primary" style={{ width: '100%', marginTop: 8 }}>
                {loading ? <span className="dash-spinner" /> : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

