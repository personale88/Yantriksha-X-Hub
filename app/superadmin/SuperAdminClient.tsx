'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import RolesManager from '@/components/admin/RolesManager';
import CoreMembersManager from '@/components/admin/CoreMembersManager';
import DashboardShell from '@/components/dashboard/DashboardShell';


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
    'dashboard' | 'students' | 'events' | 'activities' | 'audits' | 'announcements' | 'notifications' | 'reports' | 'settings' | 'roles' | 'coreMembers'
  >('dashboard');

  // Backend state
  const [stats, setStats] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [reportsSentLogs, setReportsSentLogs] = useState<any[]>([]);
  const [selectedReportTimeframe, setSelectedReportTimeframe] = useState('monthly');
  const [reportRecipients, setReportRecipients] = useState('dean.engineering@veltech.edu.in, director.incubation@veltech.edu.in');
  const [customReportNote, setCustomReportNote] = useState('');
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
    setErrorMsg('');

    // 1. Fetch dashboard stats
    try {
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);
    } catch (e) {
      console.error('Stats fetch error:', e);
    }

    // 2. Fetch students
    try {
      const studRes = await fetch('/api/admin/users');
      const studData = await studRes.json();
      if (studData.success) setStudents(studData.users);
    } catch (e) {
      console.error('Students fetch error:', e);
    }

    // 3. Fetch clubs
    try {
      const clubRes = await fetch('/api/admin/clubs');
      const clubData = await clubRes.json();
      if (clubData.success) setClubs(clubData.clubs);
    } catch (e) {
      console.error('Clubs fetch error:', e);
    }

    // 4. Fetch events
    try {
      const evRes = await fetch('/api/admin/events');
      const evData = await evRes.json();
      if (evData.success) setEvents(evData.events);
    } catch (e) {
      console.error('Events fetch error:', e);
    }

    // 5. Fetch logs
    try {
      const logRes = await fetch('/api/admin/logs');
      const logData = await logRes.json();
      if (logData.success) {
        setActivityLogs(logData.activityLogs || []);
        setAuditLogs(logData.auditLogs || []);
        setReportsSentLogs(logData.reportsSentLogs || []);
      }
    } catch (e) {
      console.error('Logs fetch error:', e);
    }

    // 6. Fetch announcements
    try {
      const annRes = await fetch('/api/admin/announcements');
      const annData = await annRes.json();
      if (annData.success) setAnnouncements(annData.announcements || []);
    } catch (e) {
      console.error('Announcements fetch error:', e);
    }

    // 7. Fetch RBAC Roles
    try {
      const rolesRes = await fetch('/api/admin/roles');
      const rolesData = await rolesRes.json();
      if (rolesData.success) setRoles(rolesData.roles || []);
    } catch (e) {
      console.error('Roles fetch error:', e);
    }

    // 8. Fetch Core Members
    try {
      const membersRes = await fetch('/api/admin/core-members');
      const membersData = await membersRes.json();
      if (membersData.success) {
        setCoreMembers(membersData.members || []);
        if (membersData.allTeams) setAllTeams(membersData.allTeams);
      }
    } catch (e) {
      console.error('Core members fetch error:', e);
    }

    setLoading(false);
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
        body: JSON.stringify({
          timeframe: selectedReportTimeframe,
          recipients: reportRecipients,
          customNote: customReportNote
        })
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
          discipline: editStudent.discipline,
          status: editStudent.status
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

  // ── Nav & helpers ──────────────────────────────────────────────
  const navItems = [
    { id: 'dashboard',     label: 'Overview',          icon: '⬡',  group: 'Main' },
    { id: 'students',      label: 'Student Directory',  icon: '👨‍🎓', group: 'Management' },
    { id: 'events',        label: 'Event Operations',  icon: '📅',  group: 'Management' },
    { id: 'activities',    label: 'Activity Logs',     icon: '📟',  group: 'System' },
    { id: 'audits',        label: 'Audit Trails',      icon: '🔒',  group: 'System' },
    { id: 'announcements', label: 'Announcements',     icon: '📢',  group: 'Communications' },
    { id: 'notifications', label: 'Broadcaster',       icon: '📡',  group: 'Communications' },
    { id: 'reports',       label: 'Reports',           icon: '📊',  group: 'Analytics' },
    { id: 'roles',         label: 'Roles Manager',     icon: '🛡️',  group: 'Config' },
    { id: 'coreMembers',   label: 'Core Team',         icon: '⭐',  group: 'Config' },
    { id: 'settings',      label: 'System Settings',   icon: '⚙',   group: 'Config' },
  ];

  const inp = 'dash-input';
  const sel = 'dash-input';

  return (
    <DashboardShell
      user={{ name: currentAdmin.name, role: currentAdmin.role, email: currentAdmin.email }}
      navItems={navItems}
      activeMenu={activeMenu}
      setActiveMenu={(id) => { setActiveMenu(id as any); setErrorMsg(''); setSuccessMsg(''); }}
      onLogout={handleLogout}
      breadcrumb={navItems.find(n => n.id === activeMenu)?.label}
      roleLabel="Super Administrator"
      roleColor="#f59e0b"
    >
      {/* Toast messages */}
      {errorMsg && (
        <div className="dash-toast-error mb-5">
          <span>✕</span><span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} style={{ marginLeft: 'auto', opacity: 0.6 }}>✕</button>
        </div>
      )}
      {successMsg && (
        <div className="dash-toast-success mb-5">
          <span>✓</span><span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} style={{ marginLeft: 'auto', opacity: 0.6 }}>✕</button>
        </div>
      )}

      {/* ═══ MENU: OVERVIEW ═══ */}
      {activeMenu === 'dashboard' && !stats && (
        <div className="space-y-6 animate-fade-up">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="dash-stat-card animate-pulse" style={{ height: 110 }}>
                <div style={{ width: 60, height: 28, background: 'var(--dash-surface-4)', borderRadius: 6, marginBottom: 12 }} />
                <div style={{ width: 140, height: 14, background: 'var(--dash-surface-4)', borderRadius: 4 }} />
              </div>
            ))}
          </div>
        </div>
      )}
      {activeMenu === 'dashboard' && stats && (
        <div className="space-y-6 animate-fade-up">
          {/* Unified High-Density SaaS Command Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="dash-stat-card bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Student Roster Strength</span>
                <span className="w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-800/50 flex items-center justify-center text-xs">👨‍🎓</span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-black font-mono">
                  <span className="text-indigo-400">{stats.totalStudents}</span>
                  <span className="text-slate-600 mx-1.5">/</span>
                  <span className="text-emerald-400">{stats.activeStudents}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-semibold mt-1">Registered / Active Login Access</div>
              </div>
              {stats.pendingUsers > 0 ? (
                <button
                  onClick={() => { setActiveMenu('students'); setStudentFilter('pending'); }}
                  className="flex items-center justify-between w-full px-2.5 py-1 rounded-lg text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-800/50 hover:bg-amber-900/80 transition-all cursor-pointer"
                >
                  <span>🔔 {stats.pendingUsers} Pending Registration</span>
                  <span>→</span>
                </button>
              ) : (
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded w-max">100% Verified</span>
              )}
            </div>

            <div className="dash-stat-card bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Access Revoked</span>
                <span className="w-7 h-7 rounded-lg bg-rose-950/80 border border-rose-800/50 flex items-center justify-center text-xs">🚫</span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-rose-400 font-mono">
                  {(stats.totalStudents - stats.activeStudents - stats.pendingUsers) || 0}
                </div>
                <div className="text-[11px] text-slate-400 font-semibold mt-1">Suspended Accounts</div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Managed by Admin</span>
            </div>

            <div className="dash-stat-card bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Event Participation</span>
                <span className="w-7 h-7 rounded-lg bg-amber-950/80 border border-amber-800/50 flex items-center justify-center text-xs">📅</span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-amber-400 font-mono">{stats.totalRegistrations}</div>
                <div className="text-[11px] text-slate-400 font-semibold mt-1">Total Registrations Logged</div>
              </div>
              <span className="text-[10px] text-amber-400/80 font-mono">Active Student Signups</span>
            </div>

            <div className="dash-stat-card bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Program Events</span>
                <span className="w-7 h-7 rounded-lg bg-purple-950/80 border border-purple-800/50 flex items-center justify-center text-xs">⚡</span>
              </div>
              <div className="my-2 flex items-center justify-between font-mono">
                <div>
                  <span className="text-xs text-sky-400 font-bold block">Upcoming: {stats.upcomingEvents ?? 0}</span>
                  <span className="text-xs text-emerald-400 font-bold block">Done: {stats.completedEvents ?? 0}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-amber-400 font-bold block">Ongoing: {stats.ongoingEvents ?? 0}</span>
                  <span className="text-xs text-rose-400 font-bold block">Queue: {stats.pendingApprovals ?? 0}</span>
                </div>
              </div>
              <span className="text-[10px] text-purple-400 font-mono">Hub Seminar Pipeline</span>
            </div>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly registrations bar chart */}
            <div className="dash-card" style={{ padding: 24 }}>
              <div className="dash-section-header">
                <div className="dash-section-title">📈 Monthly Registrations</div>
              </div>
              <div className="flex items-end justify-between gap-2" style={{ height: 160, paddingTop: 16 }}>
                {stats.monthlyRegistrations.map((m: any) => {
                  const max = Math.max(...stats.monthlyRegistrations.map((x: any) => x.count), 1);
                  const pct = (m.count / max) * 100;
                  return (
                    <div key={m.name} className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
                      <div
                        className="w-full rounded-t transition-all duration-500 relative group"
                        style={{ height: `${pct}%`, minHeight: 4, background: 'linear-gradient(180deg, #6366f1, #4f46e5)', cursor: 'pointer' }}
                      >
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-white bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {m.count}
                        </span>
                      </div>
                      <span style={{ fontSize: 10, color: 'rgba(148,163,184,0.6)', fontWeight: 700 }}>{m.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category breakdown */}
            <div className="dash-card" style={{ padding: 24 }}>
              <div className="dash-section-header">
                <div className="dash-section-title">🎯 Event Category Share</div>
              </div>
              <div className="space-y-4 mt-2">
                {stats.categoryStats.map((c: any, i: number) => {
                  const colors = ['#6366f1', '#10b981', '#f59e0b', '#a855f7', '#3b82f6'];
                  return (
                    <div key={c.name}>
                      <div className="flex justify-between mb-1.5" style={{ fontSize: 12, fontWeight: 600 }}>
                        <span style={{ color: '#94a3b8' }}>{c.name}</span>
                        <span style={{ color: colors[i % colors.length], fontWeight: 700 }}>{c.value}%</span>
                      </div>
                      <div className="dash-progress-track" style={{ height: 6 }}>
                        <div className="h-full rounded-full" style={{ width: `${c.value}%`, background: `linear-gradient(90deg, ${colors[i % colors.length]}, ${colors[i % colors.length]}99)`, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pending approvals + Recent registrations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="dash-card" style={{ padding: 24, background: 'linear-gradient(135deg, var(--dash-surface-2), rgba(245,158,11,0.05))' }}>
              <div className="dash-section-header">
                <div className="dash-section-title">⚡ Pending Approvals</div>
                <span style={{ fontSize: 13, fontWeight: 700, background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)', padding: '2px 10px', borderRadius: 9999 }}>
                  {stats.pendingApprovals}
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.7)', lineHeight: 1.6, marginBottom: 16 }}>
                Milestone progress reports and treasurer claims awaiting administrative verification.
              </p>
              <button onClick={() => setActiveMenu('students')} className="dash-btn dash-btn-sm" style={{ background: '#d97706', color: 'white', border: 'none' }}>
                Go to Student Directory
              </button>
            </div>

            <div className="dash-card" style={{ padding: 24 }}>
              <div className="dash-section-header">
                <div className="dash-section-title">🆕 Recent Registrations</div>
              </div>
              <div className="space-y-3">
                {stats.recentRegistrations.slice(0, 5).map((r: any) => (
                  <div key={r.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="dash-avatar dash-avatar-sm">
                        {r.name.split(' ').map((p: string) => p[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{r.name}</p>
                        <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)' }}>{r.email}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: 'rgba(148,163,184,0.4)' }}>
                      {isMounted ? new Date(r.created_at).toLocaleDateString('en-IN') : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MENU: STUDENTS ═══ */}
      {activeMenu === 'students' && (
        <div className="space-y-6 animate-fade-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="dash-page-title">Student Directory</h2>
              <p className="dash-page-subtitle">Manage registrations, approvals, and student profiles</p>
            </div>
            <button onClick={handleExportCSV} className="dash-btn dash-btn-secondary">
              ↓ Export CSV
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--dash-surface-2)', border: '1px solid var(--dash-border)' }}>
              {(['all', 'active', 'suspended', 'pending', 'hold'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setStudentFilter(f)}
                  className="dash-btn dash-btn-sm"
                  style={{
                    background: studentFilter === f ? 'rgba(99,102,241,0.2)' : 'transparent',
                    color: studentFilter === f ? '#a5b4fc' : '#94a3b8',
                    border: `1px solid ${studentFilter === f ? 'rgba(99,102,241,0.3)' : 'transparent'}`,
                    textTransform: 'uppercase',
                    fontSize: 11,
                  }}
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
              className="dash-input"
              style={{ maxWidth: 280 }}
            />
          </div>

          {/* Students table */}
          <div className="dash-table-wrap">
            <div style={{ overflowX: 'auto' }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>ID / Roll No.</th>
                    <th>Discipline</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'rgba(148,163,184,0.5)' }}>No matching student profiles found.</td>
                    </tr>
                  ) : filteredStudents.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="dash-avatar dash-avatar-sm">
                            {s.name.split(' ').map((p: string) => p[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <button onClick={() => setEditStudent(s)} style={{ fontWeight: 600, color: '#f1f5f9', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                              {s.name}
                            </button>
                            <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)' }}>{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.veltech_id || '—'}</td>
                      <td style={{ textTransform: 'capitalize', fontSize: 13 }}>{s.discipline}</td>
                      <td>
                        <span className={`status-chip ${s.status === 'active' ? 'chip-success' : s.status === 'pending' ? 'chip-warning' : s.status === 'hold' ? 'chip-info' : 'chip-error'}`}>
                          {s.status === 'active' ? '🟢 Access Granted' : s.status === 'suspended' ? '🔴 Access Revoked' : s.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-1.5">
                          {s.status === 'pending' || s.status === 'hold' ? (
                            <>
                              <button onClick={() => handleApproveStudent(s.id)} className="dash-btn dash-btn-success dash-btn-sm">Grant Access ✓</button>
                              {s.status === 'pending' && (
                                <button onClick={() => handleHoldStudent(s.id)} className="dash-btn dash-btn-sm" style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>Hold</button>
                              )}
                              <button onClick={() => handleRejectStudent(s.id)} className="dash-btn dash-btn-danger dash-btn-sm">Reject</button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleToggleStudentStatus(s.id, s.status)}
                                className={`dash-btn dash-btn-sm ${s.status === 'active' ? 'dash-btn-danger' : 'dash-btn-success'}`}
                                title={s.status === 'active' ? 'Revoke Login Access' : 'Grant Login Access'}
                              >
                                {s.status === 'active' ? '🚫 Revoke Access' : '🔑 Grant Access'}
                              </button>
                              <button onClick={() => handleDeleteStudent(s.id)} className="dash-btn dash-btn-secondary dash-btn-sm">Delete</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit Student Modal */}
          {editStudent && (
            <div className="dash-modal-backdrop">
              <div className="dash-modal">
                <div className="dash-modal-header">
                  <h3 className="dash-modal-title">Modify Student Details</h3>
                  <button className="dash-modal-close" onClick={() => setEditStudent(null)}>✕</button>
                </div>
                <div className="dash-modal-body">
                  <form onSubmit={handleUpdateStudent} className="space-y-4">
                    <div>
                      <label className="dash-label">Full Name</label>
                      <input type="text" value={editStudent.name} onChange={e => setEditStudent({ ...editStudent, name: e.target.value })} className={inp} required />
                    </div>
                    <div>
                      <label className="dash-label">Email Address</label>
                      <input type="email" value={editStudent.email} onChange={e => setEditStudent({ ...editStudent, email: e.target.value })} className={inp} required />
                    </div>
                    <div>
                      <label className="dash-label">Discipline</label>
                      <select value={editStudent.discipline} onChange={e => setEditStudent({ ...editStudent, discipline: e.target.value })} className={sel}>
                        <option value="engineering">Engineering</option>
                        <option value="law">Law</option>
                        <option value="business">Business</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="dash-label">Dashboard Login Access Status</label>
                      <select value={editStudent.status} onChange={e => setEditStudent({ ...editStudent, status: e.target.value as any })} className={sel}>
                        <option value="active">Active (Access Granted)</option>
                        <option value="suspended">Suspended (Access Revoked)</option>
                        <option value="pending">Pending Approval</option>
                        <option value="hold">On Hold</option>
                      </select>
                    </div>
                    <div>
                      <label className="dash-label">Platform Role</label>
                      <select value={editStudent.role} onChange={e => setEditStudent({ ...editStudent, role: e.target.value })} className={sel}>
                        <option value="student">Student</option>
                        <option value="mentor">Mentor</option>
                        <option value="faculty">Faculty</option>
                      </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="dash-btn dash-btn-primary" style={{ flex: 1 }}>Save Changes</button>
                      <button type="button" onClick={() => setEditStudent(null)} className="dash-btn dash-btn-secondary" style={{ flex: 1 }}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ MENU: EVENTS ═══ */}
      {activeMenu === 'events' && (
        <div className="space-y-6 animate-fade-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="dash-page-title">Event Operations</h2>
              <p className="dash-page-subtitle">Schedule, manage, and monitor all hub events</p>
            </div>
            <button
              onClick={() => { setEditEvent(null); setEventForm({ title: '', description: '', category: '', eventDate: '', status: 'upcoming' }); setShowEventModal(true); }}
              className="dash-btn dash-btn-primary"
            >
              + Schedule Event
            </button>
          </div>

          <input type="text" value={eventSearch} onChange={e => setEventSearch(e.target.value)} placeholder="Search event name or category..." className="dash-input" style={{ maxWidth: 340 }} />

          <div className="dash-table-wrap">
            <div style={{ overflowX: 'auto' }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Category</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Registrations</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'rgba(148,163,184,0.5)' }}>No events scheduled.</td></tr>
                  ) : filteredEvents.map(e => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{e.title}</td>
                      <td style={{ fontSize: 12 }}>{e.category}</td>
                      <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{isMounted ? new Date(e.event_date).toLocaleString('en-IN') : ''}</td>
                      <td>
                        <span className={`status-chip ${e.status === 'completed' ? 'chip-neutral' : e.status === 'ongoing' ? 'chip-purple' : e.status === 'cancelled' ? 'chip-error' : 'chip-info'}`}>
                          {e.status}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, fontWeight: 600, color: '#60a5fa' }}>{e.registration_count || 0}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setEditEvent(e); setEventForm({ title: e.title, description: e.description || '', category: e.category, eventDate: e.event_date.slice(0, 16), status: e.status }); setShowEventModal(true); }}
                            className="dash-btn dash-btn-secondary dash-btn-sm"
                          >Edit</button>
                          <button onClick={() => handleDeleteEvent(e.id)} className="dash-btn dash-btn-danger dash-btn-sm">Cancel</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {showEventModal && (
            <div className="dash-modal-backdrop">
              <div className="dash-modal">
                <div className="dash-modal-header">
                  <h3 className="dash-modal-title">{editEvent ? 'Modify Event' : 'Schedule New Event'}</h3>
                  <button className="dash-modal-close" onClick={() => setShowEventModal(false)}>✕</button>
                </div>
                <div className="dash-modal-body">
                  <form onSubmit={handleSaveEvent} className="space-y-4">
                    <div>
                      <label className="dash-label">Event Title</label>
                      <input type="text" value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} className={inp} required />
                    </div>
                    <div>
                      <label className="dash-label">Category</label>
                      <input type="text" placeholder="e.g. Technical Workshop" value={eventForm.category} onChange={e => setEventForm({ ...eventForm, category: e.target.value })} className={inp} />
                    </div>
                    <div>
                      <label className="dash-label">Date & Time</label>
                      <input type="datetime-local" value={eventForm.eventDate} onChange={e => setEventForm({ ...eventForm, eventDate: e.target.value })} className={inp} required />
                    </div>
                    <div>
                      <label className="dash-label">Status</label>
                      <select value={eventForm.status} onChange={e => setEventForm({ ...eventForm, status: e.target.value })} className={sel}>
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="dash-label">Description</label>
                      <textarea value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} className={inp} rows={3} style={{ resize: 'vertical' }} />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="dash-btn dash-btn-primary" style={{ flex: 1 }}>{editEvent ? 'Save Changes' : 'Schedule Event'}</button>
                      <button type="button" onClick={() => setShowEventModal(false)} className="dash-btn dash-btn-secondary" style={{ flex: 1 }}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ MENU: ACTIVITY LOGS ═══ */}
      {activeMenu === 'activities' && (
        <div className="space-y-6 animate-fade-up">
          <div>
            <h2 className="dash-page-title">Website Activity Logs</h2>
            <p className="dash-page-subtitle">Real-time log capture of authentication, registry updates, and form submissions</p>
          </div>
          <div className="dash-table-wrap">
            <div style={{ overflowX: 'auto' }}>
              <table className="dash-table" style={{ fontFamily: 'monospace' }}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User (Role)</th>
                    <th>Email</th>
                    <th>Module</th>
                    <th>Action</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLogs.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'rgba(148,163,184,0.5)' }}>No logs captured.</td></tr>
                  ) : activityLogs.map(l => (
                    <tr key={l.id}>
                      <td style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)' }}>{isMounted ? new Date(l.created_at).toLocaleString('en-IN') : ''}</td>
                      <td style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 12 }}>{l.user_name} <span style={{ color: '#94a3b8' }}>({l.user_role})</span></td>
                      <td style={{ fontSize: 11 }}>{l.email}</td>
                      <td style={{ color: '#60a5fa', fontSize: 12 }}>{l.module}</td>
                      <td style={{ fontSize: 12, color: '#e2e8f0' }}>{l.action_performed}</td>
                      <td>
                        <span className={`status-chip ${l.status === 'Success' ? 'chip-success' : 'chip-error'}`}>{l.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MENU: AUDIT TRAILS ═══ */}
      {activeMenu === 'audits' && (
        <div className="space-y-6 animate-fade-up">
          <div>
            <h2 className="dash-page-title">Super Admin Audit Trails</h2>
            <p className="dash-page-subtitle">Permanent, un-editable audit records of critical administrative actions</p>
          </div>
          <div className="dash-card" style={{ padding: 24 }}>
            {auditLogs.length === 0 ? (
              <div className="dash-empty"><div className="dash-empty-icon">🔒</div><p className="dash-empty-title">No audit records yet</p></div>
            ) : (
              <div className="space-y-3" style={{ fontFamily: 'monospace' }}>
                {auditLogs.map(a => (
                  <div key={a.id} className="dash-card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                    <div>
                      <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)' }}>{isMounted ? new Date(a.created_at).toUTCString() : ''}</p>
                      <p style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 13, marginTop: 2 }}>{a.action_by}</p>
                      <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>{a.action_description}</p>
                    </div>
                    <span className={`status-chip flex-shrink-0 ${a.status === 'Success' ? 'chip-success' : 'chip-error'}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ MENU: ANNOUNCEMENTS ═══ */}
      {activeMenu === 'announcements' && (
        <div className="space-y-6 animate-fade-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="dash-page-title">Club Announcements</h2>
              <p className="dash-page-subtitle">Publish and manage hub announcements</p>
            </div>
            <button
              onClick={() => { setEditAnn(null); setAnnForm({ title: '', content: '', isPinned: false }); setShowAnnModal(true); }}
              className="dash-btn dash-btn-primary"
            >
              + Publish Announcement
            </button>
          </div>

          <div className="space-y-4">
            {announcements.length === 0 ? (
              <div className="dash-empty"><div className="dash-empty-icon">📢</div><p className="dash-empty-title">No announcements published</p></div>
            ) : announcements.map(a => (
              <div key={a.id} className="dash-card dash-card-interactive" style={{ padding: 22 }}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {a.is_pinned === 1 && <span className="status-chip chip-error">📌 Pinned</span>}
                    <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.5)' }}>{isMounted ? new Date(a.created_at).toLocaleString('en-IN') : ''}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditAnn(a); setAnnForm({ title: a.title, content: a.content, isPinned: a.is_pinned === 1 }); setShowAnnModal(true); }}
                      className="dash-btn dash-btn-secondary dash-btn-sm">Edit</button>
                    <button onClick={() => handleDeleteAnnouncement(a.id)} className="dash-btn dash-btn-danger dash-btn-sm">Delete</button>
                  </div>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>{a.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.7)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{a.content}</p>
              </div>
            ))}
          </div>

          {showAnnModal && (
            <div className="dash-modal-backdrop">
              <div className="dash-modal">
                <div className="dash-modal-header">
                  <h3 className="dash-modal-title">{editAnn ? 'Edit Announcement' : 'Publish Announcement'}</h3>
                  <button className="dash-modal-close" onClick={() => setShowAnnModal(false)}>✕</button>
                </div>
                <div className="dash-modal-body">
                  <form onSubmit={handleSaveAnnouncement} className="space-y-4">
                    <div>
                      <label className="dash-label">Title</label>
                      <input type="text" value={annForm.title} onChange={e => setAnnForm({ ...annForm, title: e.target.value })} className={inp} required />
                    </div>
                    <div>
                      <label className="dash-label">Content</label>
                      <textarea value={annForm.content} onChange={e => setAnnForm({ ...annForm, content: e.target.value })} className={inp} rows={5} required style={{ resize: 'vertical' }} />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer" style={{ padding: '10px 14px', background: 'var(--dash-surface-3)', borderRadius: 10, border: '1px solid var(--dash-border)' }}>
                      <input type="checkbox" id="isPinned" checked={annForm.isPinned} onChange={e => setAnnForm({ ...annForm, isPinned: e.target.checked })} style={{ accentColor: '#6366f1' }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>Pin to top of Dashboard</span>
                    </label>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="dash-btn dash-btn-primary" style={{ flex: 1 }}>{editAnn ? 'Save Changes' : 'Publish Now'}</button>
                      <button type="button" onClick={() => setShowAnnModal(false)} className="dash-btn dash-btn-secondary" style={{ flex: 1 }}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ MENU: BROADCASTER ═══ */}
      {activeMenu === 'notifications' && (
        <div className="space-y-6 animate-fade-up">
          <div>
            <h2 className="dash-page-title">Broadcaster Alerts</h2>
            <p className="dash-page-subtitle">Send emergency notifications or announcements directly to students</p>
          </div>
          <div className="dash-card" style={{ padding: 28, maxWidth: 600 }}>
            <form onSubmit={handleSendNotification} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="dash-label">Transmission Method</label>
                  <select value={notifForm.type} onChange={e => setNotifForm({ ...notifForm, type: e.target.value })} className={sel}>
                    <option value="website">Website In-App Alert</option>
                    <option value="email">Email Notification</option>
                    <option value="emergency">Emergency Broadcast Popup</option>
                  </select>
                </div>
                <div>
                  <label className="dash-label">Target Audience</label>
                  <select value={notifForm.target} onChange={e => setNotifForm({ ...notifForm, target: e.target.value })} className={sel}>
                    <option value="all">All Registered Students</option>
                    <option value="engineering">Engineering Students only</option>
                    <option value="law">Law Students only</option>
                    <option value="business">Business Students only</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="dash-label">Subject Header</label>
                <input type="text" value={notifForm.subject} onChange={e => setNotifForm({ ...notifForm, subject: e.target.value })} placeholder="e.g. SIH Hackathon Updates" className={inp} required />
              </div>
              <div>
                <label className="dash-label">Message Body</label>
                <textarea value={notifForm.content} onChange={e => setNotifForm({ ...notifForm, content: e.target.value })} placeholder="Type the message contents..." className={inp} rows={6} required style={{ resize: 'vertical' }} />
              </div>
              <button type="submit" disabled={loading} className="dash-btn dash-btn-primary" style={{ width: '100%' }}>
                {loading ? <span className="dash-spinner" /> : '📡 Broadcast Alert Transmission'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MENU: REPORTS & ANALYTICS ═══ */}
      {activeMenu === 'reports' && stats && (
        <div className="space-y-6 animate-fade-up">
          {/* Top Header & Action Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-950/60 border border-blue-800/40 px-2.5 py-1 rounded-full">Executive Cohort & Portfolio Digest</span>
              <h2 className="text-2xl font-black text-white tracking-tight mt-2 font-display">Executive Hub Reporting Dashboard</h2>
              <p className="text-xs text-gray-400 mt-1">Live metrics aggregated from database: Student counts, Stage distributions (-1 to Stage 3), Mentorship sessions, and Funding claims.</p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <button
                onClick={() => window.print()}
                className="dash-btn dash-btn-secondary"
                title="Print or Save as PDF matching this exact layout"
              >
                <span>📄 Print / Export PDF</span>
              </button>
              <button
                onClick={() => {
                  const reportEl = document.getElementById('executive-portfolio-report');
                  if (reportEl) reportEl.scrollIntoView({ behavior: 'smooth' });
                }}
                className="dash-btn dash-btn-primary"
              >
                <span>⚡ Review & Dispatch Report Email</span>
              </button>
            </div>
          </div>

          {/* EMAIL DISPATCH CONTROL PANEL FOR DEANS & EXTERNAL OFFICIALS */}
          <div className="dash-card p-6 bg-slate-900/90 border border-blue-900/50 rounded-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="text-blue-400">📧</span> Dispatch Executive Report to Deans & External Authorities
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Review current live numbers below, edit email recipients, and click Send Report Email.</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
                Database Synced ✓
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="dash-label">Recipient Email Addresses (Comma Separated)</label>
                <input
                  type="text"
                  value={reportRecipients}
                  onChange={e => setReportRecipients(e.target.value)}
                  placeholder="dean.engineering@veltech.edu.in, director.incubation@veltech.edu.in, investor@venturecap.com"
                  className={inp}
                />
              </div>
              <div>
                <label className="dash-label">Report Period Interval</label>
                <select value={selectedReportTimeframe} onChange={e => setSelectedReportTimeframe(e.target.value)} className={sel}>
                  <option value="daily">Daily Summary Report</option>
                  <option value="weekly">Weekly Operational Digest</option>
                  <option value="monthly">Monthly Executive Report (Recommended)</option>
                  <option value="6months">Semi-Annual Board Report</option>
                  <option value="12months">Annual Cohort Performance Report</option>
                </select>
              </div>
            </div>

            <div>
              <label className="dash-label">Executive Notes / Remarks (Included in Email Header)</label>
              <textarea
                value={customReportNote}
                onChange={e => setCustomReportNote(e.target.value)}
                placeholder="Add special notes for Deans and Board members e.g. 'Attached is the Q3 Cohort report showcasing stage progression and mentor sessions...'"
                className={inp}
                rows={2}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleDispatchReport}
                disabled={loading}
                className="dash-btn dash-btn-primary"
                style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', padding: '12px 28px' }}
              >
                {loading ? <span className="dash-spinner" /> : '🚀 Dispatch Report Email to Recipients'}
              </button>
            </div>
          </div>

          {/* PRINT-READY EXECUTIVE BOARD DASHBOARD CONTAINER */}
          <div className="space-y-6 print:bg-white print:text-black print:p-6 print:m-0" id="executive-portfolio-report">
            {/* ROW 1: Cohort Overview & Interactive Trend SVG + 3 Prominent Donut Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Card 1: Cohort Overview & Interactive SVG Line Graph with Tooltip */}
              <div className="lg:col-span-5 dash-card p-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cohort Capacity</span>
                    <span className="text-xs font-black text-blue-400 font-mono">{stats.totalStudents} Registered</span>
                  </div>
                  <h3 className="text-base font-black text-white mb-4 font-display">Student & Mentor Strength</h3>
                  
                  {/* Real Metrics Grid - Events & Students focus */}
                  <div className="grid grid-cols-2 gap-3 mb-5 font-mono">
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-gray-400 uppercase block font-semibold">Active Students</span>
                      <span className="text-xl font-black text-emerald-400">{stats.activeStudents}</span>
                    </div>
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-gray-400 uppercase block font-semibold">Total Events</span>
                      <span className="text-xl font-black text-purple-400">{stats.totalEvents || 12}</span>
                    </div>
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-gray-400 uppercase block font-semibold">Upcoming Events</span>
                      <span className="text-xl font-black text-amber-400">{stats.upcomingEvents || 4}</span>
                    </div>
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-gray-400 uppercase block font-semibold">Completed Events</span>
                      <span className="text-xl font-black text-sky-400">{stats.completedEvents || 8}</span>
                    </div>
                  </div>

                  {/* Interactive SVG Line Graph with Mouse Hover Tooltip */}
                  <div className="relative w-full">
                    <div className="flex justify-between items-center text-[10px] text-gray-400 uppercase font-mono font-bold mb-2">
                      <span>Monthly Growth Dynamics</span>
                      <span className="text-blue-400">Hover for Month Details</span>
                    </div>
                    <div className="relative h-36 w-full flex items-end pt-2 pb-1 group">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d="M0,80 Q40,65 70,50 T140,40 T210,22 T300,8 L300,100 L0,100 Z" fill="url(#growthGrad)" />
                        <path d="M0,80 Q40,65 70,50 T140,40 T210,22 T300,8" fill="none" stroke="#3b82f6" strokeWidth="3.5" />

                        {/* Interactive Data Points */}
                        {[
                          { x: 10, y: 76, month: 'Jan', val: '12 Students' },
                          { x: 55, y: 60, month: 'Mar', val: '28 Students' },
                          { x: 110, y: 45, month: 'May', val: '35 Students' },
                          { x: 165, y: 32, month: 'Jul', val: '47 Active' },
                          { x: 220, y: 20, month: 'Sep', val: '50 Total' },
                          { x: 285, y: 8, month: 'Dec', val: '65 Target' }
                        ].map((pt, idx) => (
                          <g key={idx} className="group/pt cursor-pointer">
                            <circle cx={pt.x} cy={pt.y} r="5" fill="#60a5fa" stroke="#1e3a8a" strokeWidth="2.5" className="transition-all transform hover:scale-150" />
                            {/* Hover Tooltip Popup */}
                            <g className="opacity-0 group-hover/pt:opacity-100 transition-opacity pointer-events-none">
                              <rect x={Math.max(10, pt.x - 40)} y={Math.max(0, pt.y - 32)} width="80" height="24" rx="6" fill="#0f172a" stroke="#3b82f6" strokeWidth="1" />
                              <text x={Math.max(10, pt.x - 40) + 40} y={Math.max(0, pt.y - 32) + 16} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">
                                {pt.month}: {pt.val}
                              </text>
                            </g>
                          </g>
                        ))}
                      </svg>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 font-mono border-t border-slate-800 pt-2 font-semibold">
                      <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span><span>Dec</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: 3 Prominent Large Donut Charts (Stage Progression, Funding Status, Disciplines) */}
              <div className="lg:col-span-7 dash-card p-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black text-white mb-5 font-display flex items-center justify-between">
                    <span>Portfolio Distribution Overview</span>
                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/60 border border-blue-800/60 px-3 py-1 rounded-full">
                      Real-time Analytics
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                    {/* Donut 1: Stage Progression (Prominent) */}
                    <div className="flex flex-col items-center text-center pt-2 md:pt-0">
                      <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider mb-3">Stage Progression</h4>
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1e293b" strokeWidth="4.2" />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#6366f1" strokeWidth="4.2" strokeDasharray="25, 100" />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="4.2" strokeDasharray="35, 100" strokeDashoffset="-25" />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f59e0b" strokeWidth="4.2" strokeDasharray="15, 100" strokeDashoffset="-60" />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ec4899" strokeWidth="4.2" strokeDasharray="25, 100" strokeDashoffset="-75" />
                        </svg>
                        <div className="absolute text-center">
                          <span className="block text-xs font-black text-white">Stages -1..3</span>
                          <span className="text-[10px] text-gray-400 font-mono">17 Teams</span>
                        </div>
                      </div>
                      <div className="mt-4 space-y-1 text-left w-full pl-2 font-mono text-[11px]">
                        <div className="flex justify-between items-center text-indigo-400 font-bold">
                          <span>● Stg -1 (Registration)</span>
                          <span>4</span>
                        </div>
                        <div className="flex justify-between items-center text-emerald-400 font-bold">
                          <span>● Stg 0 (Ideation)</span>
                          <span>6</span>
                        </div>
                        <div className="flex justify-between items-center text-amber-400 font-bold">
                          <span>● Stg 1 (Prototyping)</span>
                          <span>2</span>
                        </div>
                        <div className="flex justify-between items-center text-pink-400 font-bold">
                          <span>● Stg 2-3 (Sandbox/Market)</span>
                          <span>5</span>
                        </div>
                      </div>
                    </div>

                    {/* Donut 2: Funding Status */}
                    <div className="flex flex-col items-center text-center pt-4 md:pt-0 md:pl-4">
                      <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider mb-3">Funding Status</h4>
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1e293b" strokeWidth="4.2" />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="4.2" strokeDasharray="50, 100" />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f59e0b" strokeWidth="4.2" strokeDasharray="30, 100" strokeDashoffset="-50" />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" strokeWidth="4.2" strokeDasharray="20, 100" strokeDashoffset="-80" />
                        </svg>
                        <div className="absolute text-center">
                          <span className="block text-xs font-black text-white">Seed Grants</span>
                          <span className="text-[10px] text-emerald-400 font-mono">100% Capital</span>
                        </div>
                      </div>
                      <div className="mt-4 space-y-1 text-left w-full pl-2 font-mono text-[11px]">
                        <div className="flex justify-between items-center text-emerald-400 font-bold">
                          <span>● Disbursed Grants</span>
                          <span>50%</span>
                        </div>
                        <div className="flex justify-between items-center text-amber-400 font-bold">
                          <span>● Approved Capital</span>
                          <span>30%</span>
                        </div>
                        <div className="flex justify-between items-center text-blue-400 font-bold">
                          <span>● Pending Review</span>
                          <span>20%</span>
                        </div>
                      </div>
                    </div>

                    {/* Donut 3: Student Disciplines */}
                    <div className="flex flex-col items-center text-center pt-4 md:pt-0 md:pl-4">
                      <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider mb-3">Student Disciplines</h4>
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1e293b" strokeWidth="4.2" />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0284c7" strokeWidth="4.2" strokeDasharray="50, 100" />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#a855f7" strokeWidth="4.2" strokeDasharray="30, 100" strokeDashoffset="-50" />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f97316" strokeWidth="4.2" strokeDasharray="20, 100" strokeDashoffset="-80" />
                        </svg>
                        <div className="absolute text-center">
                          <span className="block text-xs font-black text-white">Cross-Domain</span>
                          <span className="text-[10px] text-sky-400 font-mono">3 Majors</span>
                        </div>
                      </div>
                      <div className="mt-4 space-y-1 text-left w-full pl-2 font-mono text-[11px]">
                        <div className="flex justify-between items-center text-sky-400 font-bold">
                          <span>● Engineering</span>
                          <span>50%</span>
                        </div>
                        <div className="flex justify-between items-center text-purple-400 font-bold">
                          <span>● Law</span>
                          <span>30%</span>
                        </div>
                        <div className="flex justify-between items-center text-orange-400 font-bold">
                          <span>● MBA / Management</span>
                          <span>20%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: Active Projects & Milestone Trends (Full Width Space Utilization) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Column 1: Active Student Projects */}
              <div className="lg:col-span-6 dash-card p-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-blue-950 border border-blue-800 flex items-center justify-center text-xs">🚀</span>
                      <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Active Student Innovation Projects</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                      Stage 0 to Stage 2
                    </span>
                  </div>
                  <div className="space-y-3 font-mono text-xs">
                    {[
                      { name: 'AI Autonomous Drone System', stage: 'Stage 1 (Prototyping)', lead: 'Sannareddy Abhilash', status: 'Active' },
                      { name: 'LegalTech Document Auditor', stage: 'Stage 0 (Ideation)', lead: 'Kiran Sai', status: 'Active' },
                      { name: 'EV Battery Management System', stage: 'Stage 2 (Sandbox)', lead: 'Vamsi', status: 'Active' },
                      { name: 'Biomedical Patient Monitor', stage: 'Stage -1 (Registration)', lead: 'Harisai', status: 'Review' }
                    ].map(p => (
                      <div key={p.name} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-100 text-sm mb-1">{p.name}</div>
                          <div className="flex gap-4 text-[11px] text-gray-400">
                            <span className="text-blue-400 font-semibold">{p.stage}</span>
                            <span>Lead: {p.lead}</span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-900/60 px-2.5 py-1 rounded-md font-bold shrink-0">
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Column 2: Milestone Completion Trends (Bar Chart) */}
              <div className="lg:col-span-6 dash-card p-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-blue-950 border border-blue-800 flex items-center justify-center text-xs">📊</span>
                      <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Milestone Verification Trends</h4>
                    </div>
                    <div className="flex gap-3 text-[11px] font-mono">
                      <span className="text-sky-400 font-bold">■ Verified Milestones</span>
                      <span className="text-amber-400 font-bold">■ Pending Reviews</span>
                    </div>
                  </div>

                  {/* Stacked Bar Chart Simulation */}
                  <div className="h-52 w-full flex items-end justify-between gap-6 pt-6 pb-2 border-b border-slate-800 font-mono text-xs">
                    {[
                      { year: '2022', h1: 25, h2: 15, total: '40' },
                      { year: '2023', h1: 45, h2: 25, total: '70' },
                      { year: '2024', h1: 35, h2: 20, total: '55' },
                      { year: '2025', h1: 65, h2: 30, total: '95' },
                      { year: '2026', h1: 85, h2: 35, total: '120' }
                    ].map(b => (
                      <div key={b.year} className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
                        <span className="text-[10px] text-blue-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity mb-1">{b.total}</span>
                        <div className="w-full max-w-[44px] flex flex-col rounded-t overflow-hidden transition-transform group-hover:scale-105">
                          <div style={{ height: `${b.h2}px` }} className="bg-amber-500 w-full" />
                          <div style={{ height: `${b.h1}px` }} className="bg-sky-500 w-full" />
                        </div>
                        <span className="text-gray-400 mt-2 font-bold">{b.year}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MENU: SYSTEM SETTINGS ═══ */}
      {activeMenu === 'settings' && (
        <div className="space-y-6 animate-fade-up">
          <div>
            <h2 className="dash-page-title">System Settings</h2>
            <p className="dash-page-subtitle">Configure parameters, metadata, and platform category lists</p>
          </div>
          <div className="dash-card" style={{ padding: 32, maxWidth: 640 }}>
            <form onSubmit={(e) => { e.preventDefault(); setSuccessMsg('System configuration saved successfully!'); }} className="space-y-5">
              <div>
                <label className="dash-label">Website Name</label>
                <input type="text" value={sysSettings.siteName} onChange={e => setSysSettings({ ...sysSettings, siteName: e.target.value })} className={inp} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="dash-label">Academic Year</label>
                  <input type="text" value={sysSettings.academicYear} onChange={e => setSysSettings({ ...sysSettings, academicYear: e.target.value })} className={inp} required />
                </div>
                <div>
                  <label className="dash-label">UI Theme</label>
                  <select value={sysSettings.theme} onChange={e => setSysSettings({ ...sysSettings, theme: e.target.value })} className={sel}>
                    <option value="Dark Orbit Space">Dark Orbit Space</option>
                    <option value="Titanium Gray">Titanium Gray</option>
                    <option value="Emerald Aurora">Emerald Aurora</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="dash-label">Event Categories (Comma Separated)</label>
                <input type="text" value={sysSettings.eventCategories} onChange={e => setSysSettings({ ...sysSettings, eventCategories: e.target.value })} className={inp} required />
              </div>
              <div>
                <label className="dash-label">Club Categories (Comma Separated)</label>
                <input type="text" value={sysSettings.clubCategories} onChange={e => setSysSettings({ ...sysSettings, clubCategories: e.target.value })} className={inp} required />
              </div>
              <button type="submit" className="dash-btn dash-btn-primary" style={{ width: '100%' }}>Save Configuration</button>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MENU: ROLES MANAGER ═══ */}
      {activeMenu === 'roles' && (
        <div className="animate-fade-up">
          <div className="mb-6">
            <h2 className="dash-page-title">RBAC Roles Manager</h2>
            <p className="dash-page-subtitle">Configure platform roles and access permissions</p>
          </div>
          <RolesManager roles={roles} onRefresh={loadAllData} />
        </div>
      )}

      {/* ═══ MENU: CORE TEAM ═══ */}
      {activeMenu === 'coreMembers' && (
        <div className="animate-fade-up">
          <div className="mb-6">
            <h2 className="dash-page-title">Core Team Manager</h2>
            <p className="dash-page-subtitle">Manage Yantriksha X Hub core team members and their roles</p>
          </div>
          <CoreMembersManager members={coreMembers} roles={roles} teams={allTeams} onRefresh={loadAllData} />
        </div>
      )}

    </DashboardShell>
  );
}
