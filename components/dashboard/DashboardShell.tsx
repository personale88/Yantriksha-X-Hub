'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  group?: string;
}

interface DashboardShellProps {
  user: { name: string; role: string; email?: string };
  navItems: NavItem[];
  activeMenu: string;
  setActiveMenu: (id: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
  breadcrumb?: string;
  headerRight?: React.ReactNode;
  roleColor?: string;
  roleLabel?: string;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function DashboardShell({
  user,
  navItems,
  activeMenu,
  setActiveMenu,
  onLogout,
  children,
  breadcrumb,
  headerRight,
  roleColor = '#6366f1',
  roleLabel,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, title: 'National Startup Sandbox Pitch 2026', content: 'Registrations are now open for all student innovation teams.', time: '10m ago', unread: true },
    { id: 2, title: 'IP & Patent Filing Workshop', content: 'Scheduled for Aug 12th, 2026 at Main Auditorium.', time: '2h ago', unread: true },
    { id: 3, title: 'Milestone Verification Update', content: 'Your prototype progress report is currently under review by core team.', time: '1d ago', unread: false }
  ]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('dash-sidebar-collapsed');
    if (stored === 'true') setCollapsed(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('dash-sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close mobile drawer on nav click
  const handleNavClick = useCallback(
    (id: string) => {
      setActiveMenu(id);
      setMobileOpen(false);
    },
    [setActiveMenu]
  );

  // Group nav items
  const groups: Record<string, NavItem[]> = {};
  navItems.forEach(item => {
    const g = item.group || 'Main';
    if (!groups[g]) groups[g] = [];
    groups[g].push(item);
  });

  const activeItem = navItems.find(n => n.id === activeMenu);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="dash-sidebar-logo">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-white/10 shrink-0">
            <Image
              src="/logo.png"
              alt="logo"
              fill
              className="object-contain"
              style={{ mixBlendMode: 'screen' }}
            />
          </div>
          {!collapsed && (
            <span className="flex items-center gap-0.5 font-extrabold text-sm whitespace-nowrap overflow-hidden">
              <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                Yantriksha
              </span>
              <span className="inline-block relative h-4 w-5 mx-0.5 shrink-0">
                <Image
                  src="/logo.png"
                  fill
                  className="object-contain"
                  style={{ mixBlendMode: 'screen' }}
                  alt="X"
                />
              </span>
              <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                Hub
              </span>
            </span>
          )}
        </Link>
      </div>

      {/* User profile strip */}
      {!collapsed && (
        <div
          className="mx-3 my-3 p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}
        >
          <div className="dash-avatar flex-shrink-0" style={{ background: `linear-gradient(135deg, ${roleColor}, ${roleColor}88)` }}>
            {getInitials(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-100 truncate leading-tight">
              {user.name}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium uppercase tracking-wider truncate">
              {roleLabel || user.role}
            </p>
          </div>
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: '#10b981', boxShadow: '0 0 6px #10b981' }}
          />
        </div>
      )}
      {collapsed && (
        <div className="flex justify-center my-3">
          <div className="dash-avatar" style={{ background: `linear-gradient(135deg, ${roleColor}, ${roleColor}88)` }}>
            {getInitials(user.name)}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="dash-sidebar-nav">
        {Object.entries(groups).map(([groupName, items]) => (
          <div key={groupName}>
            {Object.keys(groups).length > 1 && (
              <div className="dash-nav-group-label">{groupName}</div>
            )}
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`dash-nav-item w-full ${activeMenu === item.id ? 'active' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <span className="dash-nav-icon">{item.icon}</span>
                {!collapsed && <span className="dash-nav-label">{item.label}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer actions */}
      <div className="dash-sidebar-footer">
        <Link
          href="/"
          className="dash-nav-item w-full"
          title={collapsed ? 'Home' : undefined}
        >
          <span className="dash-nav-icon">🏠</span>
          {!collapsed && <span className="dash-nav-label">Go to Website</span>}
        </Link>
        <button
          onClick={onLogout}
          className="dash-nav-item w-full"
          style={{ color: '#f87171' }}
          title={collapsed ? 'Logout' : undefined}
        >
          <span className="dash-nav-icon">⏻</span>
          {!collapsed && <span className="dash-nav-label">Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="dash-layout">
      {/* ── Desktop Sidebar ── */}
      {!isMobile && (
        <aside className={`dash-sidebar ${collapsed ? 'collapsed' : ''}`}>
          <SidebarContent />
          {/* Collapse toggle */}
          <button
            className="dash-toggle-btn"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </aside>
      )}

      {/* ── Mobile Drawer ── */}
      {isMobile && mobileOpen && (
        <>
          <div
            className="dash-drawer-overlay"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="dash-sidebar mobile-open"
            style={{ width: 'var(--sidebar-w)', minWidth: 'var(--sidebar-w)' }}
          >
            <SidebarContent />
          </aside>
        </>
      )}

      {/* ── Main Panel ── */}
      <div className="dash-main">
        {/* Top Nav */}
        <header className="dash-topnav">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            {isMobile && (
              <button
                onClick={() => setMobileOpen(o => !o)}
                className="dash-btn dash-btn-secondary dash-btn-sm"
              >
                ☰
              </button>
            )}
            {/* Search */}
            <div className="dash-topnav-search">
              <span style={{ color: 'rgba(148,163,184,0.5)', fontSize: 14 }}>⌕</span>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <span style={{ color: 'rgba(148,163,184,0.3)', fontSize: 11, marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                ⌘K
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {headerRight}

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
                className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:bg-slate-800"
                style={{ background: 'var(--dash-surface-3)', border: '1px solid var(--dash-border)' }}
                title="Notifications"
              >
                <span style={{ fontSize: 16 }}>🔔</span>
                {notifications.some(n => n.unread) && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-slate-950 animate-pulse" />
                )}
              </button>

              {notifOpen && (
                <>
                  <div
                    className="fixed inset-0 z-50"
                    onClick={() => setNotifOpen(false)}
                  />
                  <div
                    className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl p-4 z-50 animate-scale-in bg-slate-900 border border-slate-800 shadow-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-white">Notifications</span>
                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950 border border-indigo-800/60 px-2 py-0.5 rounded-full">
                          {notifications.filter(n => n.unread).length} New
                        </span>
                      </div>
                      <button
                        onClick={() => setNotifications(notifications.map(n => ({ ...n, unread: false })))}
                        className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors font-semibold"
                      >
                        Mark all as read
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 font-sans">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-xl border transition-all ${
                            n.unread ? 'bg-slate-950/80 border-indigo-800/50' : 'bg-slate-950/30 border-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-100">{n.title}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">{n.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(o => !o)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
                style={{ background: 'var(--dash-surface-3)', border: '1px solid var(--dash-border)' }}
              >
                <div className="dash-avatar dash-avatar-sm" style={{ background: `linear-gradient(135deg, ${roleColor}, ${roleColor}88)` }}>
                  {getInitials(user.name)}
                </div>
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }} className="hidden sm:block">
                  {user.name.split(' ')[0]}
                </span>
                <span style={{ fontSize: 10, color: '#64748b' }}>▾</span>
              </button>
              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-50"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div
                    className="absolute right-0 top-12 w-52 rounded-2xl p-2 z-50 animate-scale-in"
                    style={{ background: 'var(--dash-surface-2)', border: '1px solid var(--dash-border-md)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
                  >
                    <div className="px-3 py-2 mb-1">
                      <p className="text-sm font-semibold text-slate-100 truncate">{user.name}</p>
                      {user.email && <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>}
                    </div>
                    <hr style={{ borderColor: 'var(--dash-border)', margin: '4px 0' }} />
                    <button
                      onClick={() => { setProfileOpen(false); setActiveMenu('settings'); }}
                      className="dash-nav-item w-full text-left"
                      style={{ fontSize: 13 }}
                    >
                      <span>⚙</span> Settings
                    </button>
                    <button
                      onClick={() => { setProfileOpen(false); onLogout(); }}
                      className="dash-nav-item w-full text-left"
                      style={{ fontSize: 13, color: '#f87171' }}
                    >
                      <span>⏻</span> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="dash-content">
          {/* Breadcrumb */}
          <div className="dash-breadcrumb">
            <Link href="/" style={{ color: 'rgba(148,163,184,0.5)' }} className="hover:text-slate-300 transition-colors">
              Yantriksha X Hub
            </Link>
            <span className="dash-breadcrumb-sep">›</span>
            <span style={{ color: 'rgba(148,163,184,0.5)' }}>
              {roleLabel || user.role}
            </span>
            {breadcrumb && (
              <>
                <span className="dash-breadcrumb-sep">›</span>
                <span className="dash-breadcrumb-current">{breadcrumb}</span>
              </>
            )}
          </div>

          {/* Greeting strip (only on overview/dashboard tab) */}
          {activeMenu === 'dashboard' && (
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="dash-page-title">
                  {getGreeting()}, {user.name.split(' ')[0]} 👋
                </h1>
                <p className="dash-page-subtitle">
                  {activeItem ? activeItem.label : 'Dashboard'} — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
