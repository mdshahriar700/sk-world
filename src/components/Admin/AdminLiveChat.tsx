import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, RefreshCw, CheckCheck, Bot, Sparkles, Clock } from 'lucide-react';
import { ChatSession, ChatMessage } from '../../types';

export const AdminLiveChat: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [loadingSessions, setLoadingSessions] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(() => {
      fetchSessions();
    }, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedSessionId) return;

    fetchMessages(selectedSessionId);
    markAsRead(selectedSessionId);

    const interval = setInterval(() => {
      fetchMessages(selectedSessionId);
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/chat');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSessions(data);
        if (!selectedSessionId && data.length > 0) {
          setSelectedSessionId(data[0].session_id);
        }
      }
    } catch (err) {
      console.error('Failed to load chat sessions', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchMessages = async (sid: string) => {
    try {
      const res = await fetch(`/api/chat?session_id=${encodeURIComponent(sid)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to load thread messages', err);
    }
  };

  const markAsRead = async (sid: string) => {
    try {
      await fetch('/api/chat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid })
      });
      setSessions((prev) =>
        prev.map((s) => (s.session_id === sid ? { ...s, unread_count: 0 } : s))
      );
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedSessionId) return;

    const text = replyText.trim();
    setReplyText('');

    // Optimistic UI update
    const optimisticMsg: ChatMessage = {
      id: Date.now(),
      session_id: selectedSessionId,
      sender_type: 'admin',
      sender_name: 'SK WORL Support',
      message: text,
      is_read: true,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: selectedSessionId,
          sender_type: 'admin',
          sender_name: 'SK WORL Support',
          message: text
        })
      });
      fetchMessages(selectedSessionId);
      fetchSessions();
    } catch (err) {
      console.error('Failed to send admin reply', err);
    }
  };

  const activeSession = sessions.find((s) => s.session_id === selectedSessionId);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Top Banner */}
      <div className="p-4 border-b bg-slate-50 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-[#16A34A] text-white rounded-xl">
            <MessageSquare size={18} />
          </div>
          <div>
            <h1 className="font-black text-slate-900 text-sm uppercase">Live Customer Chat Center</h1>
            <p className="text-[11px] text-slate-500 font-mono">
              Real-time messaging with online storefront visitors.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            fetchSessions();
            if (selectedSessionId) fetchMessages(selectedSessionId);
          }}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-all font-mono text-xs inline-flex items-center space-x-1"
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sessions Sidebar */}
        <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50 shrink-0">
          <div className="p-3 border-b bg-slate-100/60 font-mono text-[11px] font-bold text-slate-600 uppercase">
            Active Chat Conversations ({sessions.length})
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loadingSessions ? (
              <div className="p-6 text-center text-slate-400 text-xs font-mono">Loading sessions...</div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-mono">No active chats yet</div>
            ) : (
              sessions.map((s) => {
                const isSelected = s.session_id === selectedSessionId;
                return (
                  <button
                    key={s.session_id}
                    onClick={() => {
                      setSelectedSessionId(s.session_id);
                      markAsRead(s.session_id);
                    }}
                    className={`w-full p-3.5 text-left transition-all flex items-start justify-between ${
                      isSelected
                        ? 'bg-white border-l-4 border-l-[#16A34A] shadow-sm'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-start space-x-2.5 overflow-hidden pr-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        <User size={16} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs text-slate-900 truncate">
                          {s.customer_name || 'Storefront Customer'}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5">
                          {s.last_message}
                        </p>
                        <span className="text-[9px] text-slate-400 font-mono block mt-1">
                          {new Date(s.last_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {s.unread_count > 0 && (
                      <span className="bg-red-500 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                        {s.unread_count}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedSessionId ? (
            <>
              {/* Active Header */}
              <div className="p-3.5 border-b flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center font-bold text-xs">
                    <User size={16} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-slate-900 uppercase">
                      {activeSession?.customer_name || 'Storefront Customer'}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400">Session: {selectedSessionId}</p>
                  </div>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
                {messages.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 font-mono text-xs">
                    No messages in this session yet.
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const isAdmin = m.sender_type === 'admin';
                    return (
                      <div key={m.id || idx} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                        <span className="text-[9px] font-mono text-slate-400 mb-0.5 px-1">
                          {m.sender_name} • {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div
                          className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed ${
                            isAdmin
                              ? 'bg-[#16A34A] text-white rounded-tr-none shadow-sm'
                              : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none shadow-sm'
                          }`}
                        >
                          {m.message}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="p-3 border-t bg-white flex gap-2 shrink-0">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type admin reply here..."
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#16A34A] font-medium"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="bg-[#16A34A] hover:bg-[#15803D] text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider inline-flex items-center space-x-1.5 transition-all disabled:opacity-40"
                >
                  <Send size={15} />
                  <span>Reply</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 font-mono text-xs p-6">
              <MessageSquare size={32} className="mb-2 text-slate-300" />
              <span>Select a chat session on the left to start messaging.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
