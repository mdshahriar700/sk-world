import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, Bot, Sparkles, CheckCheck } from 'lucide-react';
import { ChatMessage } from '../types';
import { useTheme } from '../context/ThemeContext';

export const LiveChatWidget: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize persistent session ID
  useEffect(() => {
    let sid = localStorage.getItem('sk_live_chat_session_id');
    if (!sid) {
      sid = 'chat_cust_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      localStorage.setItem('sk_live_chat_session_id', sid);
    }
    setSessionId(sid);

    const savedName = localStorage.getItem('sk_live_chat_customer_name') || '';
    if (savedName) setCustomerName(savedName);
  }, []);

  // Poll for chat updates
  useEffect(() => {
    if (!sessionId) return;

    fetchMessages();
    const interval = setInterval(() => {
      fetchMessages();
    }, 3000); // 3 sec interval polling

    return () => clearInterval(interval);
  }, [sessionId, isOpen]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const fetchMessages = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/chat?session_id=${encodeURIComponent(sessionId)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);

        // Count unread admin messages when widget is closed
        if (!isOpen) {
          const adminMsgs = data.filter((m: ChatMessage) => m.sender_type === 'admin' && !m.is_read);
          setUnreadCount(adminMsgs.length);
        } else {
          setUnreadCount(0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch chat messages', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !sessionId) return;

    const messageText = inputMsg.trim();
    setInputMsg('');

    if (customerName) {
      localStorage.setItem('sk_live_chat_customer_name', customerName);
    }

    // Optimistic UI push
    const optimisticMsg: ChatMessage = {
      id: Date.now(),
      session_id: sessionId,
      sender_type: 'customer',
      sender_name: customerName || 'Customer',
      message: messageText,
      is_read: false,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          sender_type: 'customer',
          sender_name: customerName || 'Customer',
          message: messageText
        })
      });
      fetchMessages();
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <div className="fixed bottom-20 sm:bottom-6 right-5 z-[150]">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setUnreadCount(0);
          }}
          aria-label="Open Live Chat Support"
          className="relative group p-4 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white shadow-2xl transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center border-2 border-white/20"
        >
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}

          {/* Unread Badge Counter */}
          {unreadCount > 0 && !isOpen && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 text-white font-mono text-[11px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce shadow">
              {unreadCount}
            </span>
          )}

          {/* Tooltip Label */}
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-black text-white text-[11px] font-mono font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg border border-white/20 hidden sm:block">
            Chat with Support 💬
          </span>
        </button>
      </div>

      {/* Floating Chat Drawer Box */}
      {isOpen && (
        <div
          className={`fixed bottom-24 sm:bottom-20 right-4 sm:right-6 z-[160] w-[92vw] sm:w-[380px] h-[500px] rounded-2xl shadow-2xl border flex flex-col overflow-hidden transition-all animate-fadeIn ${
            isDark ? 'bg-zinc-950 border-white/20 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}
        >
          {/* Header */}
          <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-stone-50 border-zinc-200'}`}>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-[#16A34A] text-white flex items-center justify-center font-bold">
                  <Bot size={20} />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm uppercase flex items-center space-x-1">
                  <span>SK WORL LIVE SUPPORT</span>
                </h3>
                <p className="text-[10px] text-zinc-500 font-mono">Typically replies in a few minutes</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-zinc-200 text-zinc-600'}`}
            >
              <X size={18} />
            </button>
          </div>

          {/* Optional Name Header */}
          <div className={`px-4 py-2 text-xs border-b font-mono ${isDark ? 'bg-black/40 border-white/5' : 'bg-stone-100/60 border-zinc-200'}`}>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your Name / Phone (Optional)..."
              className="w-full bg-transparent border-none focus:outline-none text-xs font-semibold text-[#16A34A] placeholder:text-zinc-500"
            />
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs">
            {messages.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center">
                  <Sparkles size={24} />
                </div>
                <h4 className="font-extrabold uppercase text-sm">Welcome to SK WORL Support</h4>
                <p className="text-xs text-zinc-500 font-mono leading-relaxed">
                  Have questions about sizing, fabric weight, or Cash on Delivery order status? Type your message below to chat with our team!
                </p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isAdmin = msg.sender_type === 'admin';
                return (
                  <div
                    key={msg.id || index}
                    className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                  >
                    <span className="text-[9px] font-mono text-zinc-500 mb-0.5 px-1">
                      {msg.sender_name} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed font-medium shadow-sm ${
                        isAdmin
                          ? isDark
                            ? 'bg-zinc-800 text-white rounded-tl-none border border-white/10'
                            : 'bg-zinc-100 text-zinc-900 rounded-tl-none border border-zinc-200'
                          : 'bg-[#16A34A] text-white rounded-tr-none'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className={`p-3 border-t ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-stone-50 border-zinc-200'}`}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Type your message..."
                className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-all ${
                  isDark
                    ? 'bg-black border-white/20 text-white placeholder:text-zinc-600 focus:border-[#16A34A]'
                    : 'bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:border-[#16A34A]'
                }`}
              />
              <button
                type="submit"
                disabled={!inputMsg.trim()}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white p-2.5 rounded-xl transition-all disabled:opacity-40 shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
