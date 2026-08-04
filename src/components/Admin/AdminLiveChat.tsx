import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, RefreshCw, CheckCheck, Bot, Sparkles, Clock, ShieldAlert } from 'lucide-react';
import { ChatSession, ChatMessage } from '../../types';
import { useTheme } from '../../context/ThemeContext';

export const AdminLiveChat: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const selectedSessionRef = useRef<string | null>(null);

  // Sync ref with state
  useEffect(() => {
    selectedSessionRef.current = selectedSessionId;
  }, [selectedSessionId]);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(() => {
      fetchSessions();
    }, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedSessionId) {
      setMessages([]);
      return;
    }

    // Clear messages immediately when active session changes to prevent leaking previous session data
    setMessages([]);
    setLoadingMessages(true);

    fetchMessages(selectedSessionId);
    markAsRead(selectedSessionId);

    const interval = setInterval(() => {
      if (selectedSessionRef.current === selectedSessionId) {
        fetchMessages(selectedSessionId, true);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedSessionId]);

  // Intelligent scroll
  useEffect(() => {
    if (messagesContainerRef.current) {
      const el = messagesContainerRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length, selectedSessionId]);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/chat');
      if (!res.ok) return;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setSessions(data);
        
        // Only set default session on initial load if none selected
        setSelectedSessionId((currentSelected) => {
          if (!currentSelected && data.length > 0) {
            return data[0].session_id;
          }
          return currentSelected;
        });
      }
    } catch (err) {
      console.error('Failed to load chat sessions', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchMessages = async (sid: string, isSilent = false) => {
    if (!isSilent && selectedSessionRef.current === sid) {
      setLoadingMessages(true);
    }
    try {
      const res = await fetch(`/api/chat?session_id=${encodeURIComponent(sid)}`);
      if (!res.ok) return;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        // Strict guard: only update messages if sid is still the currently selected session
        if (selectedSessionRef.current === sid) {
          setMessages(data);
        }
      }
    } catch (err) {
      console.error('Failed to load thread messages', err);
    } finally {
      if (selectedSessionRef.current === sid) {
        setLoadingMessages(false);
      }
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
      sender_name: 'SK WORLD Support',
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
          sender_name: 'SK WORLD Support',
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
    <div
      className={`h-[calc(100vh-140px)] flex flex-col rounded-2xl border overflow-hidden shadow-sm transition-colors ${
        isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Top Banner */}
      <div
        className={`p-4 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#16A34A] text-white rounded-xl shadow-md">
            <MessageSquare size={18} />
          </div>
          <div>
            <h1 className={`font-black text-sm uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
              LIVE CUSTOMER CHAT CENTER
            </h1>
            <p className={`text-[11px] font-mono ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Real-time messaging with online storefront visitors and AI Assistant logs.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            fetchSessions();
            if (selectedSessionId) fetchMessages(selectedSessionId);
          }}
          className={`p-2 rounded-xl transition-all font-mono text-xs inline-flex items-center space-x-1.5 ${
            isDark
              ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
          }`}
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sessions Sidebar */}
        <div
          className={`w-80 border-r flex flex-col shrink-0 ${
            isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-slate-50/50 border-slate-200'
          }`}
        >
          <div
            className={`p-3 border-b font-mono text-[11px] font-bold uppercase ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-slate-100/60 border-slate-200 text-slate-600'
            }`}
          >
            Active Conversations ({sessions.length})
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/30">
            {loadingSessions ? (
              <div className="p-6 text-center text-zinc-500 text-xs font-mono">Loading sessions...</div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs font-mono">No active chats yet</div>
            ) : (
              sessions.map((s) => {
                const isSelected = s.session_id === selectedSessionId;
                const displayName = s.customer_name && s.customer_name !== 'Customer' && s.customer_name !== 'SK WORLD AI Assistant'
                  ? s.customer_name
                  : 'Store Visitor';

                return (
                  <button
                    key={s.session_id}
                    onClick={() => {
                      setSelectedSessionId(s.session_id);
                      markAsRead(s.session_id);
                    }}
                    className={`w-full p-3.5 text-left transition-all flex items-start justify-between ${
                      isSelected
                        ? isDark
                          ? 'bg-zinc-900 border-l-4 border-l-[#16A34A] shadow-inner'
                          : 'bg-white border-l-4 border-l-[#16A34A] shadow-sm'
                        : isDark
                        ? 'hover:bg-zinc-900/60'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-start space-x-2.5 overflow-hidden pr-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                          isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        <User size={16} />
                      </div>
                      <div className="min-w-0">
                        <h4 className={`font-extrabold text-xs truncate ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>
                          {displayName}
                        </h4>
                        <p className={`text-[11px] truncate font-siliguri mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                          {s.last_message}
                        </p>
                        <span className="text-[9px] text-zinc-500 font-mono block mt-1">
                          {new Date(s.last_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {s.unread_count > 0 && (
                      <span className="bg-red-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
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
        <div className={`flex-1 flex flex-col ${isDark ? 'bg-zinc-950' : 'bg-white'}`}>
          {selectedSessionId ? (
            <>
              {/* Active Header */}
              <div
                className={`p-3.5 border-b flex items-center justify-between shrink-0 ${
                  isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#16A34A]/20 text-[#16A34A] flex items-center justify-center font-bold text-xs">
                    <User size={16} />
                  </div>
                  <div>
                    <h3 className={`font-extrabold text-xs uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {activeSession?.customer_name || 'Storefront Customer'}
                    </h3>
                    <p className="text-[10px] font-mono text-zinc-500">Session ID: {selectedSessionId}</p>
                  </div>
                </div>
              </div>

              {/* Messages Thread */}
              <div
                ref={messagesContainerRef}
                className={`flex-1 p-4 overflow-y-auto space-y-3 font-siliguri text-xs ${
                  isDark ? 'bg-black/30' : 'bg-slate-50/50'
                }`}
              >
                {loadingMessages ? (
                  <div className="text-center py-16 text-zinc-500 font-mono text-xs flex items-center justify-center space-x-2">
                    <RefreshCw size={14} className="animate-spin text-emerald-500" />
                    <span>Loading conversation history...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-16 text-zinc-500 font-mono text-xs">
                    No messages in this session yet.
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const isAdmin = m.sender_type === 'admin';
                    return (
                      <div key={m.id || idx} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                        <span className="text-[9px] font-mono text-zinc-500 mb-0.5 px-1">
                          {m.sender_name} • {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div
                          className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed whitespace-pre-wrap ${
                            isAdmin
                              ? 'bg-[#16A34A] text-white rounded-tr-none shadow-sm'
                              : isDark
                              ? 'bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-tl-none shadow-sm'
                              : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none shadow-sm'
                          }`}
                        >
                          {m.message}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Reply Form */}
              <form
                onSubmit={handleSendReply}
                className={`p-3 border-t flex gap-2 shrink-0 ${
                  isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
                }`}
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type admin reply here..."
                  className={`flex-1 px-4 py-2.5 border rounded-xl text-xs font-siliguri focus:outline-none transition-all ${
                    isDark
                      ? 'bg-black border-zinc-800 text-white focus:border-[#16A34A] placeholder:text-zinc-600'
                      : 'bg-white border-slate-200 text-slate-900 focus:border-[#16A34A] placeholder:text-slate-400'
                  }`}
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
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 font-mono text-xs p-6">
              <MessageSquare size={32} className="mb-2 text-zinc-600" />
              <span>Select a chat session on the left to start messaging.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
