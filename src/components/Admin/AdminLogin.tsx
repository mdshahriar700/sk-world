import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('skbadol229229@gmail.com');
  const [password, setPassword] = useState('Badol@138215');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        login(data.token);
        onSuccess();
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-zinc-950 text-white border-2 border-white/20 p-8 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-white text-black font-mono font-black text-2xl flex items-center justify-center mx-auto border border-white">
            SK
          </div>
          <h2 className="text-2xl font-black uppercase text-white font-syne tracking-tight">
            ADMIN PORTAL LOGIN
          </h2>
          <p className="font-mono text-xs uppercase text-zinc-400 font-bold">
            ENTER CREDENTIALS TO ACCESS STORE MANAGEMENT
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950 border border-red-800 text-red-300 text-xs font-mono uppercase font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block uppercase text-zinc-300 mb-1 font-bold">ADMIN EMAIL *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-white/20 pl-10 pr-3 py-2.5 text-white focus:outline-none focus:border-white uppercase"
                required
              />
            </div>
          </div>

          <div>
            <label className="block uppercase text-zinc-300 mb-1 font-bold">PASSWORD *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-white/20 pl-10 pr-3 py-2.5 text-white focus:outline-none focus:border-white"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 border border-white/20 text-zinc-300 uppercase font-bold hover:bg-zinc-800 hover:text-white"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-white text-black py-3 uppercase font-extrabold tracking-wider hover:bg-zinc-200 disabled:opacity-50 flex items-center justify-center space-x-1"
            >
              <span>{loading ? 'VERIFYING...' : 'SIGN IN'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>

        <div className="p-3 bg-black border border-white/10 text-[10px] font-mono text-zinc-400 space-y-1">
          <p className="font-bold text-white uppercase">MAIN ADMIN LOGIN CREDENTIALS:</p>
          <p>Email: <strong className="text-white">skbadol229229@gmail.com</strong></p>
          <p>Password: <strong className="text-white">Badol@138215</strong></p>
        </div>

      </div>
    </div>
  );
};
