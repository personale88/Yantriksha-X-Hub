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
      {activeMenu === 'dashboard' && stats && (
        <div className="space-y-6 animate-fade-up">
          {/* Stat cards with combined Registered / Active ratio */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                label: 'Registered / Active Students',
                customValue: (
                  <span>
                    <span style={{ color: '#6366f1' }}>{stats.totalStudents}</span>
                    <span style={{ color: 'rgba(148,163,184,0.4)', margin: '0 6px' }}>/</span>
                    <span style={{ color: '#10b981' }}>{stats.activeStudents}</span>
                  </span>
                ),
                icon: '👨‍🎓',
                color: '#6366f1',
                subLabel: `${stats.activeStudents} active active login access granted`,
                pendingBadge: stats.pendingUsers > 0 ? (
                  <button
                    onClick={() => { setActiveMenu('students'); setStudentFilter('pending'); }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 hover:bg-amber-900/80 transition-all cursor-pointer mt-2"
                  >
                    <span>🔔</span> {stats.pendingUsers} Pending Request{stats.pendingUsers > 1 ? 's' : ''} →
                  </button>
                ) : null
              },
              {
                label: 'Access Revoked / Suspended',
                customValue: (stats.totalStudents - stats.activeStudents - stats.pendingUsers) || 0,
                icon: '🚫',
                color: '#ef4444',
                subLabel: 'Accounts disabled by admin'
              },
              {
                label: 'Event Registrations',
                customValue: stats.totalRegistrations,
                icon: '📅',
                color: '#f59e0b',
                subLabel: 'Total participations logged'
              },
            ].map((s, i) => (
              <div key={s.label} className={`dash-stat-card animate-fade-up delay-${i + 1}`}>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -mr-6 -mt-6 blur-2xl pointer-events-none" style={{ background: s.color }} />
                <div className="dash-stat-icon" style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                </div>
                <div className="dash-stat-value">{s.customValue}</div>
                <div className="dash-stat-label">{s.label}</div>
                {'subLabel' in s && <div style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', marginTop: 4 }}>{s.subLabel}</div>}
                {'pendingBadge' in s && s.pendingBadge}
              </div>
            ))}
          </div>

          {/* Secondary stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Upcoming Events', value: stats.upcomingEvents ?? 0, icon: '🗓️', color: '#3b82f6' },
              { label: 'Ongoing Events', value: stats.ongoingEvents ?? 0, icon: '⚡', color: '#f59e0b' },
              { label: 'Completed Events', value: stats.completedEvents ?? 0, icon: '✓', color: '#10b981' },
              { label: 'Pending Approvals', value: stats.pendingApprovals ?? 0, icon: '⏳', color: '#ef4444' },
            ].map((s, i) => (
              <div key={s.label} className={`dash-stat-card animate-fade-up delay-${i + 1}`} style={{ padding: 20 }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="dash-stat-label">{s.label}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)', marginTop: 8 }}>{s.value}</div>
                  </div>
                  <div className="dash-stat-icon" style={{ background: `${s.color}15`, border: `1px solid ${s.color}25`, margin: 0 }}>
                    <span style={{ fontSize: 16 }}>{s.icon}</span>
                  </div>
                </div>
              </div>
            ))}
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

      {/* ═══ MENU: REPORTS ═══ */}
      {activeMenu === 'reports' && (
        <div className="space-y-6 animate-fade-up">
          <div>
            <h2 className="dash-page-title">Reports & Analytics</h2>
            <p className="dash-page-subtitle">Download printable summaries or dispatch automated reports</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <p className="dash-section-title">📥 System Static Reports</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  { title: 'Student Directory Registry', desc: 'Complete lists of registered, active, and suspended students.', file: 'students' },
                  { title: 'Incubation Club Metrics', desc: 'Active clubs, administrators, and student compliance checks.', file: 'clubs' },
                  { title: 'Event Participation Log', desc: 'Attendance stats, registration trends, and category breakdowns.', file: 'events' },
                  { title: 'Platform Security Audits', desc: 'Admin audit records and system activity logs (non-editable).', file: 'logs' },
                ].map(rep => (
                  <div key={rep.title} className="dash-card dash-card-interactive" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{rep.title}</h3>
                      <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.6)', lineHeight: 1.6 }}>{rep.desc}</p>
                    </div>
                    <div className="flex gap-2 mt-5 pt-4" style={{ borderTop: '1px solid var(--dash-border)' }}>
                      <button onClick={() => alert(`Generating Excel for ${rep.title}... Done!`)} className="dash-btn dash-btn-secondary dash-btn-sm" style={{ flex: 1 }}>📥 Excel</button>
                      <button onClick={() => alert(`Generating PDF for ${rep.title}... Done!`)} className="dash-btn dash-btn-sm dash-btn-sm" style={{ flex: 1, background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>📄 PDF</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dash-card" style={{ padding: 24 }}>
              <p className="dash-section-title" style={{ marginBottom: 6 }}>⚡ Periodic Dispatcher</p>
              <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.5)', marginBottom: 20 }}>Generate operational digests and email them to administrators.</p>
              <div className="space-y-4">
                <div>
                  <label className="dash-label">Interval Timeframe</label>
                  <select value={selectedReportTimeframe} onChange={e => setSelectedReportTimeframe(e.target.value)} className={sel}>
                    <option value="daily">Daily (Past 24 Hours)</option>
                    <option value="weekly">Weekly (Past 7 Days)</option>
                    <option value="monthly">Monthly (Past 30 Days)</option>
                    <option value="6months">Semi-Annual (Past 6 Months)</option>
                    <option value="12months">Annual (Past 12 Months)</option>
                  </select>
                </div>
                <button onClick={handleDispatchReport} disabled={loading} className="dash-btn dash-btn-primary" style={{ width: '100%' }}>
                  {loading ? <span className="dash-spinner" /> : '⚡ Dispatch Email Report'}
                </button>
              </div>

              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--dash-border)' }}>
                <p className="dash-label" style={{ marginBottom: 10 }}>📧 Sent Reports Log</p>
                <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {reportsSentLogs.length === 0 ? (
                    <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.4)', textAlign: 'center', padding: '16px 0' }}>No automated reports sent yet.</p>
                  ) : reportsSentLogs.map(log => (
                    <div key={log.id} className="dash-card" style={{ padding: '10px 12px' }}>
                      <div className="flex justify-between items-center">
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase' }}>{log.report_type} REPORT</span>
                        <span style={{ fontSize: 10, color: 'rgba(148,163,184,0.5)' }}>{isMounted ? new Date(log.created_at).toLocaleDateString('en-IN') : ''}</span>
                      </div>
                      <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 600, color: 'rgba(148,163,184,0.4)' }}>Sent to:</span> {log.sent_to}
                      </p>
                    </div>
                  ))}
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
