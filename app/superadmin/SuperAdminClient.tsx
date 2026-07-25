'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import RolesManager from '@/components/admin/RolesManager';
import CoreMembersManager from '@/components/admin/CoreMembersManager';

interface SaUser {
  name: string;
  email: string;
  role: string;
}

interface Student {
  id: number;
  veltech_id: string;
  name: string;
  email: string;
  role: string;
  discipline: string;
  status: string;
  phone_number?: string;
  year_of_studying?: number;
  branch?: string;
  created_at: string;
}

interface Club {
  id: number;
  name: string;
  description: string;
  category: string;
  admin_id: number | null;
  admin_name?: string;
  admin_email?: string;
  member_count?: number;
  created_at: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  event_date: string;
  status: string;
  registration_count?: number;
  created_at: string;
}

interface ActivityLog {
  id: number;
  user_id: number | null;
  user_name: string;
  user_role: string;
  email: string;
  action_performed: string;
  module: string;
  status: string;
  created_at: string;
}

interface AuditLog {
  id: number;
  action_by: string;
  action_description: string;
  status: string;
  created_at: string;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  is_pinned: number;
  created_at: string;
}

export default function SuperAdminClient({ currentAdmin }: { currentAdmin: SaUser }) {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<
    'dashboard' | 'students' | 'clubs' | 'events' | 'activities' | 'audits' | 'announcements' | 'notifications' | 'reports' | 'settings' | 'roles' | 'coreMembers'
  >('dashboard');

  // Backend state
  const [stats, setStats] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [reportsSentLogs, setReportsSentLogs] = useState<any[]>([]);
  const [selectedReportTimeframe, setSelectedReportTimeframe] = useState('daily');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [coreMembers, setCoreMembers] = useState<any[]>([]);
  const [allTeams, setAllTeams] = useState<any[]>([]);

  // Search & Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentFilter, setStudentFilter] = useState<'all' | 'active' | 'suspended' | 'pending' | 'hold'>('all');
  const [clubSearch, setClubSearch] = useState('');
  const [eventSearch, setEventSearch] = useState('');

  // Modals & Forms
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [showClubModal, setShowClubModal] = useState(false);
  const [editClub, setEditClub] = useState<Club | null>(null);
  const [clubForm, setClubForm] = useState({ name: '', description: '', category: '', adminId: '' });

  const [showEventModal, setShowEventModal] = useState(false);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState({ title: '', description: '', category: '', eventDate: '', status: 'upcoming' });

  const [showAnnModal, setShowAnnModal] = useState(false);
  const [editAnn, setEditAnn] = useState<Announcement | null>(null);
  const [annForm, setAnnForm] = useState({ title: '', content: '', isPinned: false });

  // Notifications Broadcast
  const [notifForm, setNotifForm] = useState({ type: 'website', subject: '', content: '', target: 'all' });

  // System Settings Mock State
  const [sysSettings, setSysSettings] = useState({
    siteName: 'Yantriksha_X_Hub',
    logoUrl: '/logo.png',
    academicYear: '2026 - 2027',
    theme: 'Dark Orbit Space',
    eventCategories: 'Technical, Startup Sandbox, Legal IP, Business Hackathon',
    clubCategories: 'Incubation, Tech, Innovation, Intellectual Property'
  });

  // Action status feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch dashboard stats
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);

      // 2. Fetch students
      const studRes = await fetch('/api/admin/users');
      const studData = await studRes.json();
      if (studData.success) setStudents(studData.users);

      // 3. Fetch clubs
      const clubRes = await fetch('/api/admin/clubs');
      const clubData = await clubRes.json();
      if (clubData.success) setClubs(clubData.clubs);

      // 4. Fetch events
      const evRes = await fetch('/api/admin/events');
      const evData = await evRes.json();
      if (evData.success) setEvents(evData.events);

      // 5. Fetch logs
      const logRes = await fetch('/api/admin/logs');
      const logData = await logRes.json();
      if (logData.success) {
        setActivityLogs(logData.activityLogs);
        setAuditLogs(logData.auditLogs);
        setReportsSentLogs(logData.reportsSentLogs || []);
      }

      // 6. Fetch announcements
      const annRes = await fetch('/api/admin/announcements');
      const annData = await annRes.json();
      if (annData.success) setAnnouncements(annData.announcements);

      // 7. Fetch RBAC Roles
      const rolesRes = await fetch('/api/admin/roles');
      const rolesData = await rolesRes.json();
      if (rolesData.success) setRoles(rolesData.roles);

      // 8. Fetch Core Members
      const membersRes = await fetch('/api/admin/core-members');
      const membersData = await membersRes.json();
      if (membersData.success) {
        setCoreMembers(membersData.members);
        if (membersData.allTeams) setAllTeams(membersData.allTeams);
      }

    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to aggregate portal database contents.');
    } finally {
      setLoading(false);
    }
  };

  // Report Dispatch Action
  const handleDispatchReport = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/admin/reports-worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeframe: selectedReportTimeframe })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch report.');
      setSuccessMsg(data.message || 'Report generated and emailed to administrators!');
      
      // Refresh logs
      const logRes = await fetch('/api/admin/logs');
      const logData = await logRes.json();
      if (logData.success) {
        setReportsSentLogs(logData.reportsSentLogs || []);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Student Actions
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudent) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editStudent.id,
          name: editStudent.name,
          email: editStudent.email,
          role: editStudent.role,
          discipline: editStudent.discipline
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update student profile');
      setSuccessMsg('Student profile updated successfully!');
      setEditStudent(null);
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStudentStatus = async (userId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to change student status to: ${nextStatus}?`)) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: nextStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change student status');
      setSuccessMsg(`Student account status is now ${nextStatus}!`);
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (userId: number) => {
    if (!confirm('DANGER! Are you sure you want to permanently delete this user account? This cannot be undone.')) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');
      setSuccessMsg('User account permanently removed.');
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveStudent = async (userId: number) => {
    if (!confirm('Are you sure you want to approve this student join request?')) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: 'active' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve student');
      setSuccessMsg('Student join request approved successfully!');
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHoldStudent = async (userId: number) => {
    if (!confirm('Are you sure you want to put this student join request on hold?')) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: 'hold' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place student on hold');
      setSuccessMsg('Student join request placed on hold.');
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectStudent = async (userId: number) => {
    if (!confirm('Are you sure you want to reject and remove this student join request?')) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reject student');
      setSuccessMsg('Student join request rejected and removed.');
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Club Actions
  const handleSaveClub = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const method = editClub ? 'PUT' : 'POST';
      const bodyPayload = editClub
        ? { clubId: editClub.id, ...clubForm }
        : clubForm;

      const res = await fetch('/api/admin/clubs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save club');
      setSuccessMsg(`Club ${editClub ? 'updated' : 'created'} successfully!`);
      setShowClubModal(false);
      setEditClub(null);
      setClubForm({ name: '', description: '', category: '', adminId: '' });
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClub = async (clubId: number) => {
    if (!confirm('Are you sure you want to permanently delete this club?')) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/admin/clubs?clubId=${clubId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete club');
      setSuccessMsg('Club permanently removed.');
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Event Actions
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const method = editEvent ? 'PUT' : 'POST';
      const bodyPayload = editEvent
        ? { eventId: editEvent.id, ...eventForm }
        : eventForm;

      const res = await fetch('/api/admin/events', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save event');
      setSuccessMsg(`Event ${editEvent ? 'updated' : 'published'} successfully!`);
      setShowEventModal(false);
      setEditEvent(null);
      setEventForm({ title: '', description: '', category: '', eventDate: '', status: 'upcoming' });
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to permanently delete this event?')) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/admin/events?eventId=${eventId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete event');
      setSuccessMsg('Event deleted successfully.');
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Announcement Actions
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const method = editAnn ? 'PUT' : 'POST';
      const bodyPayload = editAnn
        ? { id: editAnn.id, ...annForm }
        : annForm;

      const res = await fetch('/api/admin/announcements', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save announcement');
      setSuccessMsg(`Announcement ${editAnn ? 'updated' : 'published'} successfully!`);
      setShowAnnModal(false);
      setEditAnn(null);
      setAnnForm({ title: '', content: '', isPinned: false });
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this announcement?')) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete announcement');
      setSuccessMsg('Announcement permanently removed.');
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Broadcast Notification
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    // Simulate API delay
    setTimeout(() => {
      setSuccessMsg(`Broadcast sent successfully! Method: ${notifForm.type.toUpperCase()} | Targets: ${notifForm.target.toUpperCase()}`);
      setNotifForm({ type: 'website', subject: '', content: '', target: 'all' });
      setLoading(false);
    }, 800);
  };

  // Export Data to CSV (Student List)
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'ID,VelTechID,Name,Email,Role,Discipline,Status,DateRegistered\n';
    students.forEach(s => {
      csvContent += `${s.id},"${s.veltech_id || ''}","${s.name}","${s.email}","${s.role}","${s.discipline}","${s.status}","${s.created_at}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Yantriksha_Students_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Global Search logic across all segments
  const filteredStudents = students.filter(s => {
    const term = studentSearch.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term) ||
      s.veltech_id?.toLowerCase().includes(term);
    
    if (studentFilter === 'active') return matchesSearch && s.status === 'active';
    if (studentFilter === 'suspended') return matchesSearch && s.status === 'suspended';
    if (studentFilter === 'pending') return matchesSearch && s.status === 'pending';
    if (studentFilter === 'hold') return matchesSearch && s.status === 'hold';
    return matchesSearch;
  });

  const filteredClubs = clubs.filter(c =>
    c.name.toLowerCase().includes(clubSearch.toLowerCase()) ||
    c.category.toLowerCase().includes(clubSearch.toLowerCase())
  );

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
    e.category.toLowerCase().includes(eventSearch.toLowerCase())
  );

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

  return (
    <main className="min-h-screen bg-space-grid text-white flex flex-row relative overflow-hidden">
      
      {/* ── Sidebar Navigation (Slim w-16 on mobile, expanded w-72 on desktop) ── */}
      <aside className="w-16 md:w-72 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800/80 flex flex-col z-20 shrink-0 transition-all duration-300">
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

        {/* Super Admin Tag */}
        <div className="p-3 md:px-6 md:py-4 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-center md:justify-start gap-3">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
          <div className="hidden md:block text-left">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Super Admin</p>
            <p className="text-xs font-bold text-white leading-tight">{currentAdmin.name}</p>
          </div>
        </div>

        <nav className="flex-1 p-2 md:p-5 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard Overview', icon: '📊' },
            { id: 'students', label: 'Student Management', icon: '👥' },
            { id: 'roles', label: 'RBAC Roles Config', icon: '🛡️' },
            { id: 'coreMembers', label: 'Core Team Manager', icon: '👔' },
            { id: 'clubs', label: 'Club inc. Manager', icon: '⛺' },
            { id: 'events', label: 'Event Operations', icon: '📅' },
            { id: 'activities', label: 'Activity Logs', icon: '🖥️' },
            { id: 'audits', label: 'Audit Logs', icon: '🔒' },
            { id: 'announcements', label: 'Announcements', icon: '📢' },
            { id: 'notifications', label: 'Broadcaster Alerts', icon: '🔔' },
            { id: 'reports', label: 'Reports & Analytics', icon: '📂' },
            { id: 'settings', label: 'System Settings', icon: '⚙️' }
          ].map(menu => (
            <button
              key={menu.id}
              onClick={() => { setActiveMenu(menu.id as any); setErrorMsg(''); setSuccessMsg(''); }}
              className={`w-full flex items-center justify-center md:justify-start gap-3.5 p-3 md:px-4 md:py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeMenu === menu.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title={menu.label}
            >
              <span className="text-lg shrink-0">{menu.icon}</span>
              <span className="hidden md:inline">{menu.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-2 md:p-5 border-t border-slate-800/60 space-y-2">
          <Link href="/dashboard" className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 text-gray-300 p-3 md:py-3 rounded-xl font-bold text-sm transition-all duration-200" title="Exit Portal">
            <span>🏠</span><span className="hidden md:inline"> Exit Portal</span>
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

      {/* ── Main Panel ── */}
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
            MENU: DASHBOARD OVERVIEW
        ═══════════════════════════════════════════════ */}
        {activeMenu === 'dashboard' && stats && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="section-pill">✦ Control Panel</span>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Super Admin Dashboard</h1>
              <p className="text-gray-400 mt-1.5 text-xs">Academic Incubation Year: <span className="text-blue-400">{sysSettings.academicYear}</span></p>
            </div>

            {/* Pending Approvals Alert Banner */}
            {stats.pendingUsers > 0 && (
              <div className="p-4 bg-amber-950/60 border border-amber-800/60 text-amber-300 rounded-2xl text-xs flex items-center justify-between gap-4 animate-pulse">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🔔</span>
                  <div>
                    <span className="font-bold">Pending Student Registrations:</span> You have{' '}
                    <span className="font-extrabold text-white text-sm bg-amber-900/60 px-2 py-0.5 rounded border border-amber-700/50 font-mono">
                      {stats.pendingUsers}
                    </span>{' '}
                    pending join requests waiting for your approval.
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveMenu('students');
                    setStudentFilter('pending');
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition"
                >
                  Review Requests →
                </button>
              </div>
            )}

            {/* Widget Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Registered Students', val: stats.totalStudents, color: 'text-blue-400', desc: 'Total profiles' },
                { title: 'Active Students', val: stats.activeStudents, color: 'text-green-400', desc: 'Non-suspended' },
                { title: 'Total Incubator Clubs', val: stats.totalClubs, color: 'text-purple-400', desc: 'Academic centers' },
                { title: 'Total Event Regs', val: stats.totalRegistrations, color: 'text-amber-400', desc: 'Participations' }
              ].map(s => (
                <div key={s.title} className="glass-card rounded-2xl p-6 border border-slate-800/60 relative overflow-hidden">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{s.title}</h3>
                  <p className={`mt-3 text-3xl font-extrabold ${s.color}`}>{s.val}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{s.desc}</p>
                </div>
              ))}
            </div>

            {/* Widget Second Row: Event states */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { title: 'Upcoming Events', val: stats.upcomingEvents, color: 'text-blue-300' },
                { title: 'Ongoing Events', val: stats.ongoingEvents, color: 'text-orange-400' },
                { title: 'Completed Events', val: stats.completedEvents, color: 'text-emerald-400' }
              ].map(s => (
                <div key={s.title} className="glass-card rounded-xl p-5 border border-slate-800/50 flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{s.title}</h4>
                    <p className={`text-2xl font-black mt-2.5 ${s.color}`}>{s.val}</p>
                  </div>
                  <span className="text-2xl opacity-30">📅</span>
                </div>
              ))}
            </div>

            {/* Visual Graphs/Charts & Recent Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Registration and activity graphs column */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Registrations graph */}
                <div className="glass-card rounded-3xl p-6 border border-slate-800/60">
                  <h3 className="font-extrabold text-sm text-white uppercase tracking-wider mb-6 flex items-center justify-between">
                    <span>📈 Student Registration Growth</span>
                    <span className="text-[10px] text-gray-500">Monthly breakdown</span>
                  </h3>
                  
                  <div className="flex items-end justify-between h-48 pt-4 px-2">
                    {stats.monthlyRegistrations.map((m: any) => (
                      <div key={m.name} className="flex flex-col items-center gap-2 w-1/8 group">
                        <div className="w-8 bg-blue-600/80 group-hover:bg-blue-500 rounded-t transition-all duration-300 relative" style={{ height: `${(m.count / 90) * 100}%` }}>
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white bg-slate-900 border border-slate-800 px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {m.count}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-bold">{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event Category stats */}
                <div className="glass-card rounded-3xl p-6 border border-slate-800/60">
                  <h3 className="font-extrabold text-sm text-white uppercase tracking-wider mb-6">🎯 Event Participation Category Share</h3>
                  <div className="space-y-4">
                    {stats.categoryStats.map((c: any) => (
                      <div key={c.name} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-gray-400">{c.name}</span>
                          <span className="text-blue-400">{c.value}%</span>
                        </div>
                        <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${c.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Sidebar stats column (Today's Events, Approvals, Recently Added) */}
              <div className="space-y-6">
                
                {/* Pending approvals widget */}
                <div className="glass-card rounded-3xl p-6 border border-slate-800/60 bg-gradient-to-br from-slate-900 to-amber-950/20">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">⚡ Pending Approvals</h3>
                    <span className="text-xs bg-amber-900/40 text-amber-400 px-2 py-0.5 border border-amber-800/40 rounded font-black">{stats.pendingApprovals}</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    There are milestone progress reports and treasurer claims awaiting immediate administrative verification.
                  </p>
                  <button onClick={() => router.push('/admin')} className="mt-4 w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2.5 rounded-xl transition">
                    Go to Evaluation Console
                  </button>
                </div>

                {/* Recent registration items */}
                <div className="glass-card rounded-3xl p-6 border border-slate-800/60">
                  <h3 className="font-extrabold text-sm text-white uppercase tracking-wider mb-4">🆕 Recent Registrations</h3>
                  <div className="space-y-3">
                    {stats.recentRegistrations.map((r: any) => (
                      <div key={r.id} className="flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-white">{r.name}</p>
                          <p className="text-[10px] text-gray-500">{r.email}</p>
                        </div>
                        <span className="text-[9px] text-gray-500">{isMounted ? new Date(r.created_at).toLocaleDateString() : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            MENU: STUDENT MANAGEMENT
        ═══════════════════════════════════════════════ */}
        {activeMenu === 'students' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Header section with CSV download */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="section-pill">✦ Operations</span>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Student Directory</h1>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleExportCSV}
                  className="bg-slate-850 hover:bg-slate-800 text-xs text-gray-300 font-bold border border-slate-700 px-4 py-2.5 rounded-xl transition flex items-center gap-2"
                >
                  📥 Export CSV
                </button>
              </div>
            </div>

            {/* Filter and Search header */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800/80">
                {(['all', 'active', 'suspended', 'pending', 'hold'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setStudentFilter(f)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                      studentFilter === f ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                placeholder="Search name, ID, or email..."
                className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500/80 w-full md:w-80"
              />
            </div>

            {/* Students table */}
            <div className="glass-card rounded-3xl border border-slate-800/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                  <thead className="text-xs uppercase bg-slate-950/40 text-gray-500 border-b border-slate-800/60">
                    <tr>
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">ID / Roll No.</th>
                      <th className="py-4 px-6">Email Address</th>
                      <th className="py-4 px-6">Discipline</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">No matching student profiles found.</td>
                      </tr>
                    ) : (
                      filteredStudents.map(s => (
                        <tr key={s.id} className="hover:bg-slate-900/30">
                          <td className="py-4 px-6">
                            <span onClick={() => setEditStudent(s)} className="font-bold text-white hover:underline cursor-pointer">
                              {s.name}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-mono text-xs">{s.veltech_id || '—'}</td>
                          <td className="py-4 px-6 text-xs">{s.email}</td>
                          <td className="py-4 px-6 text-xs capitalize">{s.discipline}</td>
                          <td className="py-4 px-6">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              s.status === 'active' 
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' 
                                : s.status === 'pending'
                                ? 'bg-amber-950 text-amber-400 border border-amber-900/30'
                                : s.status === 'hold'
                                ? 'bg-blue-950 text-blue-400 border border-blue-900/30'
                                : 'bg-red-950 text-red-400 border border-red-900/30'
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right space-x-2">
                            {s.status === 'pending' || s.status === 'hold' ? (
                              <>
                                <button
                                  onClick={() => handleApproveStudent(s.id)}
                                  className="bg-emerald-950 hover:bg-emerald-900/50 border border-emerald-900/40 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-lg transition"
                                >
                                  Approve
                                </button>
                                {s.status === 'pending' && (
                                  <button
                                    onClick={() => handleHoldStudent(s.id)}
                                    className="bg-blue-950 hover:bg-blue-900/50 border border-blue-900/40 text-blue-400 text-[10px] font-bold px-2.5 py-1 rounded-lg transition"
                                  >
                                    Hold
                                  </button>
                                )}
                                <button
                                  onClick={() => handleRejectStudent(s.id)}
                                  className="bg-red-950 hover:bg-red-900/50 border border-red-900/40 text-red-400 text-[10px] font-bold px-2.5 py-1 rounded-lg transition"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleToggleStudentStatus(s.id, s.status)}
                                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                                    s.status === 'active' ? 'bg-amber-950 text-amber-400 border border-amber-900/40 hover:bg-amber-900/60' : 'bg-emerald-950 text-emerald-400 border border-emerald-900/40 hover:bg-emerald-900/60'
                                  }`}
                                >
                                  {s.status === 'active' ? 'Suspend' : 'Activate'}
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(s.id)}
                                  className="bg-red-950 hover:bg-red-900/40 border border-red-900/40 text-red-400 text-[10px] font-bold px-2.5 py-1 rounded-lg"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Edit details modal */}
            {editStudent && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fadeIn">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full relative">
                  <h3 className="text-xl font-bold text-white mb-6">Modify Student Details</h3>
                  <form onSubmit={handleUpdateStudent} className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-400 font-bold uppercase mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={editStudent.name}
                        onChange={e => setEditStudent({ ...editStudent, name: e.target.value })}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 font-bold uppercase mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={editStudent.email}
                        onChange={e => setEditStudent({ ...editStudent, email: e.target.value })}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 font-bold uppercase mb-1.5">Discipline</label>
                      <select
                        value={editStudent.discipline}
                        onChange={e => setEditStudent({ ...editStudent, discipline: e.target.value })}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                      >
                        <option value="engineering">Engineering</option>
                        <option value="law">Law</option>
                        <option value="business">Business</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 font-bold uppercase mb-1.5">Platform Role</label>
                      <select
                        value={editStudent.role}
                        onChange={e => setEditStudent({ ...editStudent, role: e.target.value })}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                      >
                        <option value="student">Student</option>
                        <option value="mentor">Mentor</option>
                        <option value="faculty">Faculty</option>
                      </select>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition">
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditStudent(null)}
                        className="flex-1 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-gray-400 hover:text-white font-bold text-xs py-3 rounded-xl transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ═══════════════════════════════════════════════
            MENU: CLUBS INCUBATION MANAGER
        ═══════════════════════════════════════════════ */}
        {activeMenu === 'clubs' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="section-pill">✦ Incubation Labs</span>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Incubator Clubs</h1>
              </div>
              <button
                onClick={() => { setEditClub(null); setClubForm({ name: '', description: '', category: '', adminId: '' }); setShowClubModal(true); }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
              >
                Create New Club +
              </button>
            </div>

            <input
              type="text"
              value={clubSearch}
              onChange={e => setClubSearch(e.target.value)}
              placeholder="Search club name or category..."
              className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500/80 w-full md:w-80"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.length === 0 ? (
                <p className="text-sm text-gray-500 col-span-full">No active club registries found.</p>
              ) : (
                filteredClubs.map(c => (
                  <div key={c.id} className="glass-card rounded-2xl p-6 border border-slate-800/60 relative overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded font-black border border-blue-900/30 uppercase tracking-wider">{c.category}</span>
                        <span className="text-xs text-gray-500 font-bold">{c.member_count || 0} Members</span>
                      </div>
                      <h3 className="font-extrabold text-white text-lg">{c.name}</h3>
                      <p className="text-xs text-gray-400 mt-2 leading-relaxed font-light">{c.description || 'No description provided.'}</p>
                      <p className="text-[11px] text-gray-500 mt-4">
                        Admin: <span className="text-white font-bold">{c.admin_name || 'Unassigned'}</span>
                      </p>
                    </div>

                    <div className="flex gap-2 mt-6 pt-4 border-t border-slate-800/40">
                      <button
                        onClick={() => {
                          setEditClub(c);
                          setClubForm({
                            name: c.name,
                            description: c.description || '',
                            category: c.category,
                            adminId: c.admin_id ? String(c.admin_id) : ''
                          });
                          setShowClubModal(true);
                        }}
                        className="flex-1 bg-slate-800 hover:bg-slate-750 text-gray-300 text-[10px] font-bold py-2 rounded-lg transition"
                      >
                        Edit Details
                      </button>
                      <button
                        onClick={() => handleDeleteClub(c.id)}
                        className="flex-1 bg-red-950/40 hover:bg-red-900/60 border border-red-900/40 text-red-400 text-[10px] font-bold py-2 rounded-lg transition"
                      >
                        Delete Club
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Club Save Modal */}
            {showClubModal && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fadeIn">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full relative">
                  <h3 className="text-xl font-bold text-white mb-6">{editClub ? 'Modify Club details' : 'Create New Club'}</h3>
                  <form onSubmit={handleSaveClub} className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-400 font-bold uppercase mb-1.5">Club Name</label>
                      <input
                        type="text"
                        value={clubForm.name}
                        onChange={e => setClubForm({ ...clubForm, name: e.target.value })}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 font-bold uppercase mb-1.5">Category</label>
                      <select
                        value={clubForm.category}
                        onChange={e => setClubForm({ ...clubForm, category: e.target.value })}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="Incubation">Incubation</option>
                        <option value="Tech">Tech</option>
                        <option value="Innovation">Innovation</option>
                        <option value="Intellectual Property">Intellectual Property</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 font-bold uppercase mb-1.5">Assign Admin ID (Optional)</label>
                      <input
                        type="text"
                        placeholder="Admin user ID, e.g. 1"
                        value={clubForm.adminId}
                        onChange={e => setClubForm({ ...clubForm, adminId: e.target.value })}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 font-bold uppercase mb-1.5">Description</label>
                      <textarea
                        value={clubForm.description}
                        onChange={e => setClubForm({ ...clubForm, description: e.target.value })}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition">
                        {editClub ? 'Save Changes' : 'Create Club'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowClubModal(false)}
                        className="flex-1 bg-slate-855 hover:bg-slate-800 border border-slate-800 text-gray-400 hover:text-white font-bold text-xs py-3 rounded-xl transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ═══════════════════════════════════════════════
            MENU: EVENT OPERATIONS
        ═══════════════════════════════════════════════ */}
        {activeMenu === 'events' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="section-pill">✦ Sandbox Schedule</span>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Event Operations</h1>
              </div>
              <button
                onClick={() => { setEditEvent(null); setEventForm({ title: '', description: '', category: '', eventDate: '', status: 'upcoming' }); setShowEventModal(true); }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
              >
                Schedule New Event +
              </button>
            </div>

            <input
              type="text"
              value={eventSearch}
              onChange={e => setEventSearch(e.target.value)}
              placeholder="Search event name or category..."
              className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500/80 w-full md:w-80"
            />

            <div className="glass-card rounded-3xl border border-slate-800/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                  <thead className="text-xs uppercase bg-slate-950/40 text-gray-500 border-b border-slate-800/60">
                    <tr>
                      <th className="py-4 px-6">Event Title</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Date & Time</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Registrations</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {filteredEvents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">No events scheduled.</td>
                      </tr>
                    ) : (
                      filteredEvents.map(e => (
                        <tr key={e.id} className="hover:bg-slate-900/30">
                          <td className="py-4 px-6 font-bold text-white">{e.title}</td>
                          <td className="py-4 px-6 text-xs">{e.category}</td>
                          <td className="py-4 px-6 text-xs font-mono">{isMounted ? new Date(e.event_date).toLocaleString() : ''}</td>
                          <td className="py-4 px-6">
                            <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                              e.status === 'completed' ? 'bg-slate-800 text-gray-400' :
                              e.status === 'ongoing' ? 'bg-orange-950 text-orange-400' : 'bg-blue-950 text-blue-400'
                            }`}>
                              {e.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-xs text-glow-blue font-bold">{e.registration_count || 0} registered</td>
                          <td className="py-4 px-6 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditEvent(e);
                                setEventForm({
                                  title: e.title,
                                  description: e.description || '',
                                  category: e.category,
                                  eventDate: e.event_date.slice(0, 16),
                                  status: e.status
                                });
                                setShowEventModal(true);
                              }}
                              className="bg-slate-800 hover:bg-slate-750 text-gray-300 text-[10px] font-bold px-2 py-1 rounded-lg"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(e.id)}
                              className="bg-red-950 hover:bg-red-900/40 border border-red-900/40 text-red-400 text-[10px] font-bold px-2 py-1 rounded-lg"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Event Save Modal */}
            {showEventModal && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fadeIn">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full relative">
                  <h3 className="text-xl font-bold text-white mb-6">{editEvent ? 'Modify Event Operations' : 'Schedule Sandbox Event'}</h3>
                  <form onSubmit={handleSaveEvent} className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-400 font-bold uppercase mb-1.5">Event Title</label>
                      <input
                        type="text"
                        value={eventForm.title}
                        onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 font-bold uppercase mb-1.5">Category</label>
                      <input
                        type="text"
                        placeholder="e.g. Technical Workshop"
                        value={eventForm.category}
                        onChange={e => setEventForm({ ...eventForm, category: e.target.value })}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 font-bold uppercase mb-1.5">Date & Time</label>
                      <input
                        type="datetime-local"
                        value={eventForm.eventDate}
                        onChange={e => setEventForm({ ...eventForm, eventDate: e.target.value })}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 font-bold uppercase mb-1.5">Operation Status</label>
                      <select
                        value={eventForm.status}
                        onChange={e => setEventForm({ ...eventForm, status: e.target.value })}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 font-bold uppercase mb-1.5">Description</label>
                      <textarea
                        value={eventForm.description}
                        onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition">
                        {editEvent ? 'Save Changes' : 'Schedule Event'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEventModal(false)}
                        className="flex-1 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-gray-400 hover:text-white font-bold text-xs py-3 rounded-xl transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ═══════════════════════════════════════════════
            MENU: WEBSITE ACTIVITY MONITORING
        ═══════════════════════════════════════════════ */}
        {activeMenu === 'activities' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="section-pill">✦ Security Registry</span>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Website Activity Logs</h1>
              <p className="text-gray-400 mt-2 text-sm">Real-time log capture of authentication, registry updates, and form submissions.</p>
            </div>

            <div className="glass-card rounded-3xl border border-slate-800/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-400 font-mono">
                  <thead className="text-[10px] uppercase bg-slate-950/40 text-gray-500 border-b border-slate-800/60">
                    <tr>
                      <th className="py-4 px-6">Timestamp</th>
                      <th className="py-4 px-6">User (Role)</th>
                      <th className="py-4 px-6">Email Address</th>
                      <th className="py-4 px-6">Module</th>
                      <th className="py-4 px-6">Action / Event</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {activityLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">No logs captured.</td>
                      </tr>
                    ) : (
                      activityLogs.map(l => (
                        <tr key={l.id} className="hover:bg-slate-900/20">
                          <td className="py-3 px-6 text-gray-500">{isMounted ? new Date(l.created_at).toLocaleString() : ''}</td>
                          <td className="py-3 px-6 text-white font-bold">{l.user_name} ({l.user_role})</td>
                          <td className="py-3 px-6 text-gray-400">{l.email}</td>
                          <td className="py-3 px-6 text-blue-400">{l.module}</td>
                          <td className="py-3 px-6 text-gray-300">{l.action_performed}</td>
                          <td className="py-3 px-6">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              l.status === 'Success' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' : 'bg-red-950 text-red-400 border border-red-900/30'
                            }`}>
                              {l.status}
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
            MENU: AUDIT LOGS
        ═══════════════════════════════════════════════ */}
        {activeMenu === 'audits' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="section-pill">✦ Operations Compliance</span>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Super Admin Audit Trails</h1>
              <p className="text-gray-400 mt-2 text-sm">Permanent, un-editable audit trails representing critical administrative actions.</p>
            </div>

            <div className="glass-card rounded-3xl p-8 border border-slate-800/60 space-y-6">
              {auditLogs.length === 0 ? (
                <p className="text-sm text-gray-500">No audits recorded.</p>
              ) : (
                <div className="space-y-4 font-mono text-xs">
                  {auditLogs.map(a => (
                    <div key={a.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      <div className="space-y-1">
                        <p className="text-gray-500">{isMounted ? new Date(a.created_at).toUTCString() : ''}</p>
                        <p className="font-extrabold text-white">{a.action_by}</p>
                        <p className="text-gray-400 mt-1">{a.action_description}</p>
                      </div>
                      <div>
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase border ${
                          a.status === 'Success' ? 'bg-emerald-950 text-emerald-400 border-emerald-900/30' : 'bg-red-950 text-red-400 border-red-900/30'
                        }`}>
                          {a.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            MENU: ANNOUNCEMENTS MANAGER
        ═══════════════════════════════════════════════ */}
        {activeMenu === 'announcements' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="section-pill">✦ inc. Broadcast</span>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Club Announcements</h1>
              </div>
              <button
                onClick={() => { setEditAnn(null); setAnnForm({ title: '', content: '', isPinned: false }); setShowAnnModal(true); }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
              >
                Publish Announcement +
              </button>
            </div>

            <div className="space-y-4">
              {announcements.length === 0 ? (
                <p className="text-sm text-gray-500">No announcements published.</p>
              ) : (
                announcements.map(a => (
                  <div key={a.id} className="glass-card rounded-2xl p-6 border border-slate-800/60 relative overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] text-gray-500 font-bold">{isMounted ? new Date(a.created_at).toLocaleString() : ''}</span>
                        {a.is_pinned === 1 && <span className="text-[9px] bg-red-950 text-red-400 border border-red-900/40 px-2 py-0.5 rounded font-bold uppercase">📌 Pinned</span>}
                      </div>
                      <h3 className="font-extrabold text-white text-base">{a.title}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed mt-2 whitespace-pre-line font-light">{a.content}</p>
                    </div>

                    <div className="flex gap-2 mt-6 pt-4 border-t border-slate-800/40 justify-end">
                      <button
                        onClick={() => {
                          setEditAnn(a);
                          setAnnForm({
                            title: a.title,
                            content: a.content,
                            isPinned: a.is_pinned === 1
                          });
                          setShowAnnModal(true);
                        }}
                        className="bg-slate-800 hover:bg-slate-750 text-gray-300 text-[10px] font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(a.id)}
                        className="bg-red-950/40 hover:bg-red-900/60 border border-red-900/40 text-red-400 text-[10px] font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Announcement Save Modal */}
            {showAnnModal && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fadeIn">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full relative">
                  <h3 className="text-xl font-bold text-white mb-6">{editAnn ? 'Modify Announcement' : 'Publish Announcement'}</h3>
                  <form onSubmit={handleSaveAnnouncement} className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-400 font-bold uppercase mb-1.5">Announcement Title</label>
                      <input
                        type="text"
                        value={annForm.title}
                        onChange={e => setAnnForm({ ...annForm, title: e.target.value })}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 font-bold uppercase mb-1.5">Content Details</label>
                      <textarea
                        value={annForm.content}
                        onChange={e => setAnnForm({ ...annForm, content: e.target.value })}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                        rows={5}
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isPinned"
                        checked={annForm.isPinned}
                        onChange={e => setAnnForm({ ...annForm, isPinned: e.target.checked })}
                        className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0"
                      />
                      <label htmlFor="isPinned" className="text-xs text-gray-400 font-bold uppercase">Pin to top of Dashboard</label>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition">
                        {editAnn ? 'Save Changes' : 'Publish Now'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAnnModal(false)}
                        className="flex-1 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-gray-400 hover:text-white font-bold text-xs py-3 rounded-xl transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ═══════════════════════════════════════════════
            MENU: BROADCASTER ALERTS
        ═══════════════════════════════════════════════ */}
        {activeMenu === 'notifications' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="section-pill">✦ Transmissions</span>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Broadcaster Alerts</h1>
              <p className="text-gray-400 mt-2 text-sm">Send emergency notifications, reminders, or broadcast announcements directly to students.</p>
            </div>

            <div className="glass-card rounded-3xl p-8 border border-slate-800/60 max-w-2xl">
              <form onSubmit={handleSendNotification} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-gray-400 font-bold uppercase mb-2">Transmission Method</label>
                    <select
                      value={notifForm.type}
                      onChange={e => setNotifForm({ ...notifForm, type: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                    >
                      <option value="website">Website In-App Alert</option>
                      <option value="email">Email Notification</option>
                      <option value="emergency">Emergency Broadcast Popup</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 font-bold uppercase mb-2">Target Audience</label>
                    <select
                      value={notifForm.target}
                      onChange={e => setNotifForm({ ...notifForm, target: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                    >
                      <option value="all">All Registered Students</option>
                      <option value="engineering">Engineering Students only</option>
                      <option value="law">Law Students only</option>
                      <option value="business">Business Students only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase mb-2">Subject Header</label>
                  <input
                    type="text"
                    value={notifForm.subject}
                    onChange={e => setNotifForm({ ...notifForm, subject: e.target.value })}
                    placeholder="e.g. Incubation Lab SIH Hackathon Updates"
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase mb-2">Detailed Message Body</label>
                  <textarea
                    value={notifForm.content}
                    onChange={e => setNotifForm({ ...notifForm, content: e.target.value })}
                    placeholder="Type the message contents..."
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                    rows={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition"
                >
                  Broadcast Alerts Transmission
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            MENU: REPORTS & ANALYTICS
        ═══════════════════════════════════════════════ */}
        {activeMenu === 'reports' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="section-pill">✦ Operational Digest</span>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Reports & Analytics</h1>
              <p className="text-gray-400 mt-2 text-sm">Download printable cohort summaries or dispatch automated email reports to admin inboxes.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Downloadable Reports Grid */}
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-lg font-bold text-white mb-2">System Static Reports</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { title: 'Student Directory Registry', desc: 'Complete lists of registered, active, and suspended students with demographic information.', file: 'students' },
                    { title: 'Incubation Club Metrics', desc: 'List of active innovation clubs, designated administrators, and current student compliance check reports.', file: 'clubs' },
                    { title: 'Event Participation log', desc: 'Attendance stats, registration trends, and category breakdown reports.', file: 'events' },
                    { title: 'Platform Security Audits', desc: 'Consolidated admin audit records and system activities logs (non-editable).', file: 'logs' }
                  ].map(rep => (
                    <div key={rep.title} className="glass-card rounded-2xl p-6 border border-slate-800/60 flex flex-col justify-between">
                      <div>
                        <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">{rep.title}</h3>
                        <p className="text-[11px] text-gray-400 mt-2 leading-relaxed font-light">{rep.desc}</p>
                      </div>

                      <div className="flex gap-2 mt-6 pt-4 border-t border-slate-800/40">
                        <button
                          onClick={() => alert(`Generating Excel report for ${rep.title}... Done!`)}
                          className="flex-1 bg-slate-800 hover:bg-slate-750 text-gray-300 text-[10px] font-bold py-2 rounded-lg transition"
                        >
                          📥 Excel Format
                        </button>
                        <button
                          onClick={() => alert(`Generating PDF report for ${rep.title}... Done!`)}
                          className="flex-1 bg-blue-950/40 hover:bg-blue-900/60 border border-blue-900/40 text-blue-400 text-[10px] font-bold py-2 rounded-lg transition"
                        >
                          📄 PDF Format
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Automated Periodic Report Center */}
              <div className="glass-card rounded-3xl p-6 border border-slate-800/60 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Periodic Report Dispatcher</h3>
                  <p className="text-[10px] text-gray-500 mt-1">Generate operational digests and email them to administrators.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Interval Timeframe</label>
                    <select
                      value={selectedReportTimeframe}
                      onChange={e => setSelectedReportTimeframe(e.target.value)}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500/80"
                    >
                      <option value="daily">Daily Report (Past 24 Hours)</option>
                      <option value="weekly">Weekly Report (Past 7 Days)</option>
                      <option value="monthly">Monthly Report (Past 30 Days)</option>
                      <option value="6months">Semi-Annual Report (Past 6 Months)</option>
                      <option value="12months">Annual Report (Past 12 Months)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleDispatchReport}
                    disabled={loading}
                    className="w-full bg-blue-650 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-blue-950/30"
                  >
                    {loading ? 'Generating...' : '⚡ Dispatch Email Report'}
                  </button>
                </div>

                {/* Sent Reports Logs list */}
                <div className="pt-6 border-t border-slate-800/60">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">📧 Sent Reports History Log</h4>
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {reportsSentLogs.length === 0 ? (
                      <p className="text-[10px] text-gray-600 text-center py-4">No automated reports sent yet.</p>
                    ) : (
                      reportsSentLogs.map(log => (
                        <div key={log.id} className="p-3 bg-slate-950/40 border border-slate-900 rounded-2xl text-[10px] space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-blue-400 uppercase">{log.report_type} REPORT</span>
                            <span className="text-gray-500">{isMounted ? new Date(log.created_at).toLocaleDateString() : ''}</span>
                          </div>
                          <p className="text-gray-400 truncate"><span className="font-bold text-gray-500">Sent to:</span> {log.sent_to}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            MENU: SYSTEM SETTINGS
        ═══════════════════════════════════════════════ */}
        {activeMenu === 'settings' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="section-pill">✦ Configurator</span>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">System Settings</h1>
              <p className="text-gray-400 mt-2 text-sm">Configure parameters, metadata, and platform category lists.</p>
            </div>

            <div className="glass-card rounded-3xl p-8 border border-slate-800/60 max-w-2xl">
              <form onSubmit={(e) => { e.preventDefault(); setSuccessMsg('System configuration settings saved successfully!'); }} className="space-y-5">
                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase mb-1.5">Website Name</label>
                  <input
                    type="text"
                    value={sysSettings.siteName}
                    onChange={e => setSysSettings({ ...sysSettings, siteName: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 font-bold uppercase mb-1.5">Incubation Academic Year</label>
                    <input
                      type="text"
                      value={sysSettings.academicYear}
                      onChange={e => setSysSettings({ ...sysSettings, academicYear: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 font-bold uppercase mb-1.5">UI Design Theme</label>
                    <select
                      value={sysSettings.theme}
                      onChange={e => setSysSettings({ ...sysSettings, theme: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                    >
                      <option value="Dark Orbit Space">Dark Orbit Space (Cyan-Blue Glow)</option>
                      <option value="Titanium Gray">Titanium Gray (Matte Slate)</option>
                      <option value="Emerald Aurora">Aurora Borealis (Emerald Green)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase mb-1.5">Event Categories List (Comma Separated)</label>
                  <input
                    type="text"
                    value={sysSettings.eventCategories}
                    onChange={e => setSysSettings({ ...sysSettings, eventCategories: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase mb-1.5">Club Categories List (Comma Separated)</label>
                  <input
                    type="text"
                    value={sysSettings.clubCategories}
                    onChange={e => setSysSettings({ ...sysSettings, clubCategories: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition"
                >
                  Save Configuration settings
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            MENU: RBAC ROLES CONFIG
        ═══════════════════════════════════════════════ */}
        {activeMenu === 'roles' && (
          <div className="animate-fadeIn">
            <RolesManager roles={roles} onRefresh={loadAllData} />
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            MENU: CORE TEAM MANAGER
        ═══════════════════════════════════════════════ */}
        {activeMenu === 'coreMembers' && (
          <div className="animate-fadeIn">
            <CoreMembersManager members={coreMembers} roles={roles} teams={allTeams} onRefresh={loadAllData} />
          </div>
        )}

      </section>

    </main>
  );
}
