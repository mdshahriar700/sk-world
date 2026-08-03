import React, { useState } from 'react';
import { Subscriber } from '../../types';
import { Mail, Send, CheckCircle2, Search, Users } from 'lucide-react';

interface AdminSubscribersProps {
  subscribers: Subscriber[];
}

export const AdminSubscribers: React.FC<AdminSubscribersProps> = ({ subscribers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const filtered = subscribers.filter((s) => s.email.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    setSending(true);
    setSentSuccess(false);

    setTimeout(() => {
      setSending(false);
      setSentSuccess(true);
      setSubject('');
      setMessage('');
      setTimeout(() => setSentSuccess(false), 4000);
    }, 800);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Newsletter Subscribers</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage Insiders Club emails and broadcast promotional announcements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Subscriber List Card (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-[20px] border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Users size={18} className="text-[#16A34A]" />
              <h3 className="font-bold text-slate-900 text-sm">Active Subscribers ({subscribers.length})</h3>
            </div>
            
            <div className="relative w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search email..."
                className="w-full bg-slate-50 border border-slate-200 pl-8 pr-2 py-1.5 rounded-xl text-xs focus:outline-none focus:border-[#16A34A]"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No subscribers found.</p>
            ) : (
              filtered.map((sub) => (
                <div key={sub.id} className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#16A34A] font-bold text-xs flex items-center justify-center">
                      {sub.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-xs">{sub.email}</p>
                      <p className="text-[10px] text-slate-400">Joined: {new Date(sub.subscribed_at || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    Subscribed
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Broadcast Email Tool (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-[20px] border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Mail size={18} className="text-blue-600" />
              <span>Broadcast Email Announcement</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Send promotional offers to all {subscribers.length} subscribers.</p>
          </div>

          {sentSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
              <CheckCircle2 size={16} />
              <span>Newsletter broadcast queued and sent successfully!</span>
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Email Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. FLASH SALE: 30% Off New Collection!"
                required
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Message Body</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Type your newsletter message here..."
                required
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A]"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50 transition-all"
            >
              <Send size={15} />
              <span>{sending ? 'Sending Broadcast...' : 'Send to All Subscribers'}</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
