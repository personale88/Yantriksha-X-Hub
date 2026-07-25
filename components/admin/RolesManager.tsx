'use client';

import { useState } from 'react';

interface Role {
  id?: number;
  name: string;
  description: string;
  permissions: { [module: string]: string[] };
}

interface RolesManagerProps {
  roles: Role[];
  onRefresh: () => void;
}

const MODULES = [
  { id: 'projects', label: 'Projects & Teams', actions: ['view', 'create', 'edit', 'delete', 'assign'] },
  { id: 'software', label: 'Software & Repos', actions: ['view', 'edit', 'approve', 'reject', 'manage'] },
  { id: 'documentation', label: 'Reports & Docs', actions: ['view', 'edit', 'approve', 'reject', 'download'] },
  { id: 'finance', label: 'Finance & Funding', actions: ['view', 'create', 'approve', 'reject', 'export'] },
  { id: 'patent', label: 'Patent & IPR', actions: ['view', 'create', 'edit', 'approve', 'manage'] },
  { id: 'events', label: 'Event Operations', actions: ['view', 'create', 'edit', 'delete', 'manage'] },
  { id: 'users', label: 'Users & Accounts', actions: ['view', 'create', 'edit', 'delete', 'manage'] }
];

export default function RolesManager({ roles, onRefresh }: RolesManagerProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [roleForm, setRoleForm] = useState<Role>({ name: '', description: '', permissions: {} });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const startCreate = () => {
    setRoleForm({ name: '', description: '', permissions: {} });
    setIsEditing(true);
    setSelectedRole(null);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const startEdit = (role: Role) => {
    setSelectedRole(role);
    setRoleForm({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: { ...role.permissions }
    });
    setIsEditing(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleActionToggle = (moduleId: string, action: string) => {
    setRoleForm(prev => {
      const modulePermissions = prev.permissions[moduleId] || [];
      const updated = modulePermissions.includes(action)
        ? modulePermissions.filter(a => a !== action)
        : [...modulePermissions, action];
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [moduleId]: updated
        }
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      setErrorMsg('Role name is required.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const isNew = !roleForm.id;
      const url = '/api/admin/roles';
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save role');

      setSuccessMsg(data.message || 'Role configuration saved successfully!');
      setIsEditing(false);
      setSelectedRole(null);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roleId: number, roleName: string) => {
    if (!confirm(`Are you sure you want to permanently delete the "${roleName}" role? This action cannot be undone.`)) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/admin/roles?id=${roleId}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete role');

      setSuccessMsg(data.message || 'Role deleted.');
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Add button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Role-Based Access Control (RBAC) Settings</h2>
          <p className="text-sm text-slate-400">Configure authorization level modules and permissions for core team workspace directories.</p>
        </div>
        {!isEditing && (
          <button
            onClick={startCreate}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 text-white font-bold rounded-xl text-sm transition-all duration-200"
          >
            🛡️ Create Custom Role
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-950/60 border border-red-500/30 text-red-400 text-sm font-semibold rounded-xl animate-shake">
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-sm font-semibold rounded-xl">
          ✨ {successMsg}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-indigo-500" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Role Designation Name</label>
              <input
                type="text"
                placeholder="e.g. Software Team Lead"
                value={roleForm.name}
                onChange={e => setRoleForm({ ...roleForm, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Role Description</label>
              <input
                type="text"
                placeholder="Brief description of duties..."
                value={roleForm.description}
                onChange={e => setRoleForm({ ...roleForm, description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-2">Module Permission Matrix</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
              <table className="w-full text-left text-sm text-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    <th className="p-4">Functional Module</th>
                    <th className="p-4 text-center">View</th>
                    <th className="p-4 text-center">Create</th>
                    <th className="p-4 text-center">Edit / Comment</th>
                    <th className="p-4 text-center">Approve / Reject</th>
                    <th className="p-4 text-center">Delete / Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {MODULES.map(m => (
                    <tr key={m.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="p-4 font-bold text-white text-xs">{m.label}</td>
                      {['view', 'create', 'edit', 'approve', 'manage'].map((action, idx) => {
                        const isActionAvailable = m.actions.includes(action === 'edit' ? 'edit' : action === 'approve' ? 'approve' : action);
                        const isChecked = (roleForm.permissions[m.id] || []).includes(action === 'edit' ? 'edit' : action === 'approve' ? 'approve' : action);
                        
                        return (
                          <td key={idx} className="p-4 text-center">
                            {isActionAvailable ? (
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleActionToggle(m.id, action === 'edit' ? 'edit' : action === 'approve' ? 'approve' : action)}
                                className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 focus:ring-offset-2 transition cursor-pointer"
                              />
                            ) : (
                              <span className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider">N/A</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3.5 pt-4 border-t border-slate-800/60">
            <button
              type="button"
              onClick={() => { setIsEditing(false); setSelectedRole(null); }}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold rounded-xl text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-blue-500/25"
            >
              {loading ? 'Saving...' : 'Save Role Configuration'}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.length === 0 ? (
            <div className="col-span-full bg-slate-900/30 border border-slate-850 p-10 rounded-2xl text-center space-y-3">
              <span className="text-3xl block">🛡️</span>
              <h3 className="font-extrabold text-white text-base">No Custom Roles Configured</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">Create specialized roles with granular permission levels to manage modules within the platform.</p>
              <button
                onClick={startCreate}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition"
              >
                Create First Role
              </button>
            </div>
          ) : (
            roles.map(r => {
              const activeCount = Object.values(r.permissions || {}).flat().length;
              return (
                <div key={r.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition duration-300 flex flex-col justify-between group relative overflow-hidden shadow-lg">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all duration-300" />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">{r.name}</h3>
                      <span className="bg-blue-900/30 border border-blue-800/40 text-blue-400 font-semibold px-2.5 py-0.5 rounded-full text-[10px] tracking-wide">
                        {activeCount} Actions
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px]">{r.description || 'No description provided.'}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800/50 mt-5 pt-4">
                    <button
                      onClick={() => startEdit(r)}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 transition"
                    >
                      ✏️ Edit Matrix
                    </button>
                    {r.name.toLowerCase() !== 'super admin' && (
                      <button
                        onClick={() => r.id && handleDelete(r.id, r.name)}
                        className="text-xs font-bold text-red-400 hover:text-red-300 transition"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
