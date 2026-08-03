import React, { useState } from 'react';
import { AdminUser } from '../../types';
import { ShieldCheck, Plus, Trash2, UserPlus, Mail, Lock } from 'lucide-react';

interface AdminUsersProps {
  onRefresh?: () => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = () => {
  const [users, setUsers] = useState<AdminUser[]>([
    { id: 1, email: 'admin@skworl.com' },
    { id: 2, email: 'badol@skworl.com' },
  ]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return;

    setLoading(true);
    setTimeout(() => {
      setUsers((prev) => [...prev, { id: Date.now(), email: newEmail }]);
      setNewEmail('');
      setNewPassword('');
      setIsAddOpen(false);
      setLoading(false);
    }, 500);
  };

  const handleDelete = (id: number) => {
    if (users.length <= 1) {
      alert('Cannot delete the primary administrative account.');
      return;
    }
    if (confirm('Are you sure you want to revoke admin access for this account?')) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Users</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage staff access and administrative credentials.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center space-x-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <UserPlus size={16} />
          <span>Add New Admin</span>
        </button>
      </div>

      {/* Users List Card */}
      <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck size={18} className="text-[#16A34A]" />
            <span className="font-semibold text-slate-800 text-sm">Authorized Administrators ({users.length})</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {users.map((user) => (
            <div key={user.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#16A34A] font-bold text-sm flex items-center justify-center border border-emerald-100">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-slate-900 text-sm flex items-center space-x-2">
                    <span>{user.email}</span>
                    {user.id === 1 && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                        Super Admin
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">Full system permissions</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {user.id !== 1 && (
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Revoke Admin Access"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add User Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add New Admin Account</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ×
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="colleague@skworl.com"
                    required
                    className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2.5 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#16A34A] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Initial Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2.5 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#16A34A] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl shadow-sm"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
