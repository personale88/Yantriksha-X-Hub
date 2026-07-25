'use client';

import { useState } from 'react';

interface Team {
  id: number;
  team_name: string;
  project_title: string;
}

interface Member {
  id: number;
  veltech_id: string;
  name: string;
  email: string;
  personal_email?: string;
  phone_number?: string;
  status: string;
  is_core_team: boolean;
  role_id: number | null;
  designation?: string;
  department?: string;
  role_name?: string;
  two_factor_enabled: boolean;
  assignedTeams: Team[];
}

interface Role {
  id: number;
  name: string;
}

interface CoreMembersManagerProps {
  members: Member[];
  roles: Role[];
  teams: Team[];
  onRefresh: () => void;
}

export default function CoreMembersManager({ members, roles, teams, onRefresh }: CoreMembersManagerProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<Member | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Invite Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    personalEmail: '',
    phoneNumber: '',
    department: '',
    roleId: '',
    designation: ''
  });

  // Assign Teams state
  const [checkedTeams, setCheckedTeams] = useState<number[]>([]);

  const openInvite = () => {
    setForm({
      name: '',
      email: '',
      personalEmail: '',
      phoneNumber: '',
      department: '',
      roleId: roles[0]?.id ? String(roles[0].id) : '',
      designation: 'Core Team Member'
    });
    setShowInviteModal(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.roleId) {
      setErrorMsg('Name, College Email, and Role are required.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/core-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register core team member.');

      setSuccessMsg(data.message || 'Invitation email sent successfully!');
      setShowInviteModal(false);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (userId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to change user status to: ${nextStatus}?`)) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/core-members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: nextStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle account status');

      setSuccessMsg(`Account status changed successfully to ${nextStatus}!`);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: number, name: string) => {
    if (!confirm(`DANGER! Are you sure you want to permanently delete core team member "${name}"? All dashboard assignments will be erased.`)) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/admin/core-members?userId=${userId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete member.');

      setSuccessMsg(data.message || 'Account successfully deleted.');
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = (member: Member) => {
    setShowAssignModal(member);
    setCheckedTeams(member.assignedTeams.map(t => t.id));
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleCheckboxToggle = (teamId: number) => {
    setCheckedTeams(prev =>
      prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
    );
  };

  const saveAssignments = async () => {
    if (!showAssignModal) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/core-members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: showAssignModal.id,
          assignedTeams: checkedTeams
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save project assignments');

      setSuccessMsg(`Project assignments updated successfully for ${showAssignModal.name}!`);
      setShowAssignModal(null);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Core Team Members Management</h2>
          <p className="text-sm text-slate-400">Add team members, assign functional roles, and link projects/teams to their dashboard views.</p>
        </div>
        <button
          onClick={openInvite}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 text-white font-bold rounded-xl text-sm transition-all"
        >
          👔 Register Core Team Member
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-950/60 border border-red-500/30 text-red-400 text-sm font-semibold rounded-xl">
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-sm font-semibold rounded-xl">
          ✨ {successMsg}
        </div>
      )}

      {/* Members Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map(m => (
          <div key={m.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition duration-300 relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all" />
            
            <div className="space-y-4">
              {/* Header: Name, Designation & Status */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">{m.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{m.designation || 'Incubation Coordinator'}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase ${
                  m.status === 'active' 
                    ? 'bg-emerald-950/50 border border-emerald-500/30 text-emerald-400' 
                    : m.status === 'unverified'
                    ? 'bg-amber-950/50 border border-amber-500/30 text-amber-400'
                    : 'bg-red-950/50 border border-red-500/30 text-red-400'
                }`}>
                  {m.status}
                </span>
              </div>

              {/* Department and Emails */}
              <div className="space-y-1 text-xs text-slate-400">
                <p>🏢 Department: <strong className="text-slate-300">{m.department || 'General'}</strong></p>
                <p className="truncate">📧 College: <span className="text-slate-300 font-mono">{m.email}</span></p>
                {m.personal_email && (
                  <p className="truncate">📧 Backup: <span className="text-slate-300 font-mono">{m.personal_email}</span></p>
                )}
                {m.phone_number && (
                  <p>📞 Phone: <span className="text-slate-300 font-mono">{m.phone_number}</span></p>
                )}
                <p>🛡️ Assigned Role: <span className="text-blue-400 font-bold">{m.role_name || 'Super Admin'}</span></p>
                {m.two_factor_enabled && (
                  <p className="text-[10px] text-emerald-400 font-bold">🔒 2FA Enabled</p>
                )}
              </div>

              {/* Assigned Projects list */}
              <div className="bg-slate-950/50 border border-slate-850 rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-center pb-1 border-b border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Assigned Projects</span>
                  <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-extrabold">{m.assignedTeams.length}</span>
                </div>
                {m.assignedTeams.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic">No project assignments linked.</p>
                ) : (
                  <div className="max-h-[80px] overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                    {m.assignedTeams.map(t => (
                      <p key={t.id} className="text-[10px] text-slate-300 truncate" title={t.project_title}>
                        🚀 {t.team_name} - <span className="text-slate-400">{t.project_title}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between border-t border-slate-800/50 mt-5 pt-4">
              <button
                onClick={() => openAssignModal(m)}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 transition"
              >
                🔗 Link Projects
              </button>
              
              <div className="flex gap-3">
                {m.role_name && (
                  <button
                    onClick={() => toggleStatus(m.id, m.status)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-200 transition"
                  >
                    {m.status === 'active' ? '🚫 Suspend' : '✅ Activate'}
                  </button>
                )}
                {m.role_name && (
                  <button
                    onClick={() => handleDelete(m.id, m.name)}
                    className="text-xs font-bold text-red-400 hover:text-red-300 transition"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* REGISTRATION MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div>
              <h3 className="text-lg font-bold text-white">Register Core Team Member</h3>
              <p className="text-xs text-slate-400">An invitation email will be queued to set up their platform login details.</p>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nazeem"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-white text-sm focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Designation / Post</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Incubator Software Developer"
                    value={form.designation}
                    onChange={e => setForm({ ...form, designation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-white text-sm focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">College Email (Unique)</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. developer@veltech.edu.in"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-white text-sm focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Personal Email (Backup / Login)</label>
                  <input
                    type="email"
                    placeholder="e.g. admin@gmail.com"
                    value={form.personalEmail}
                    onChange={e => setForm({ ...form, personalEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-white text-sm focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone / WhatsApp Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 91234 56789"
                    value={form.phoneNumber}
                    onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-white text-sm focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Incubator Team Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Sandbox, Branding"
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-white text-sm focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Functional RBAC Access Role</label>
                <select
                  required
                  value={form.roleId}
                  onChange={e => setForm({ ...form, roleId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-white text-sm focus:border-blue-500 focus:outline-none transition cursor-pointer"
                >
                  <option value="" disabled>Select assigned role permission level...</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition hover:shadow-lg hover:shadow-blue-500/25"
                >
                  {loading ? 'Registering...' : 'Register & Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LINK PROJECTS MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div>
              <h3 className="text-lg font-bold text-white">Link Projects & Teams</h3>
              <p className="text-xs text-slate-400">Assign specific student project teams to <strong>{showAssignModal.name}</strong>'s workspace dashboard.</p>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
              {teams.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-6">No active student incubator teams listed.</p>
              ) : (
                teams.map(t => (
                  <label key={t.id} className="flex items-start gap-3 p-3 bg-slate-950/40 border border-slate-850 hover:border-slate-800 rounded-xl cursor-pointer transition select-none">
                    <input
                      type="checkbox"
                      checked={checkedTeams.includes(t.id)}
                      onChange={() => handleCheckboxToggle(t.id)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 transition"
                    />
                    <div className="text-xs space-y-0.5">
                      <p className="font-bold text-white">🚀 {t.team_name}</p>
                      <p className="text-slate-400 font-medium">{t.project_title}</p>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowAssignModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveAssignments}
                disabled={loading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition hover:shadow-lg hover:shadow-blue-500/25"
              >
                {loading ? 'Saving...' : 'Save Assignments'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
