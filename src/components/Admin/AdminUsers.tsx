import React, { useState, useEffect } from 'react';
import { AdminUser } from '../../types';
import { ShieldCheck, Plus, Trash2, UserPlus, Mail, Lock, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';

interface AdminUsersProps {
  onRefresh?: () => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = () => {
  const [users, setUsers] = useState<AdminUser[]>([
    { id: 1, email: 'skbadol229229@gmail.com' },
  ]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [changeNewPassword, setChangeNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setUsers(data);
        }
      }
    } catch (e) {
      console.error('Failed to fetch admin users:', e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return;

    setLoading(true);
    setAddError('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, password: newPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNewEmail('');
        setNewPassword('');
        setIsAddOpen(false);
        fetchUsers();
      } else {
        setAddError(data.error || 'Failed to create admin user');
      }
    } catch (err) {
      setAddError('Connection error while adding user');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (users.length <= 1) {
      alert('Cannot delete the primary administrative account.');
      return;
    }
    if (confirm('Are you sure you want to revoke admin access for this account?')) {
      try {
        const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok && data.success) {
          fetchUsers();
        } else {
          alert(data.error || 'Failed to delete admin user');
        }
      } catch (e) {
        alert('Failed to connect to server');
      }
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (changeNewPassword !== confirmNewPassword) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match!' });
      return;
    }

    if (changeNewPassword.length < 6) {
      setPwdMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    setPwdLoading(true);

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'skbadol229229@gmail.com',
          current_password: currentPassword,
          new_password: changeNewPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPwdMsg({ type: 'success', text: 'Password successfully updated!' });
        setCurrentPassword('');
        setChangeNewPassword('');
        setConfirmNewPassword('');
      } else {
        setPwdMsg({ type: 'error', text: data.error || 'Failed to update password' });
      }
    } catch (err) {
      setPwdMsg({ type: 'error', text: 'Connection error while changing password' });
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin User Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage staff access and change main admin credentials.</p>
        </div>
        <button
          onClick={() => { setAddError(''); setIsAddOpen(true); }}
          className="inline-flex items-center space-x-2 bg-black hover:bg-zinc-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <UserPlus size={16} />
          <span>Add New Admin Access</span>
        </button>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
          <KeyRound size={20} className="text-amber-600" />
          <h2 className="font-bold text-slate-900 text-base">Change Admin Password</h2>
        </div>

        {pwdMsg && (
          <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center space-x-2 ${
            pwdMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {pwdMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{pwdMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">CURRENT PASSWORD *</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
              className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">NEW PASSWORD *</label>
            <input
              type="password"
              value={changeNewPassword}
              onChange={(e) => setChangeNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
              className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">CONFIRM NEW PASSWORD *</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
              className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-black"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end pt-1">
            <button
              type="submit"
              disabled={pwdLoading}
              className="px-6 py-2.5 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl shadow-sm text-xs transition-colors"
            >
              {pwdLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
            </button>
          </div>
        </form>
      </div>

      {/* Users List Card */}
      <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            <span className="font-semibold text-slate-800 text-sm">Authorized Administrators ({users.length})</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {users.map((user, idx) => (
            <div key={user.id || idx} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 font-bold text-sm flex items-center justify-center border border-emerald-100">
                  {user.email ? user.email.charAt(0).toUpperCase() : 'A'}
                </div>
                <div>
                  <div className="font-medium text-slate-900 text-sm flex items-center space-x-2">
                    <span>{user.email}</span>
                    {idx === 0 && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                        Main Admin
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">Full system permissions & management</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {idx !== 0 && (
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Grant New Admin Access</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ×
              </button>
            </div>

            {addError && (
              <div className="p-3 mb-3 bg-red-50 text-red-700 border border-red-200 text-xs rounded-xl font-medium">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">New Admin Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="newadmin@gmail.com"
                    required
                    className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2.5 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-black focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Set Admin Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2.5 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-black focus:bg-white"
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
                  className="px-4 py-2 text-xs font-semibold bg-black hover:bg-zinc-800 text-white rounded-xl shadow-sm"
                >
                  {loading ? 'Creating...' : 'Grant Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

