import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, Bot, Sparkles, ShoppingBag, Truck, RefreshCw, PhoneCall } from 'lucide-react';
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

  // Quick suggestion chips
  const quickPrompts = [
    { label: '🛍️ Available Products', text: 'আপনাদের কারেন্ট প্রোডাক্ট কালেকশন ও দাম কত?' },
    { label: '🚚 Delivery & COD', text: 'ঢাকার বাইরে এবং ঢাকার ভেতরে ডেলিভারি চার্জ কত?' },
    { label: '📏 Size & Exchange', text: 'সাইজ মেজারমেন্ট এবং এক্সচেঞ্জ পলিসি কি?' },
    { label: '📦 Track Order', text: 'আমার অর্ডার ট্র্যাক করতে সাহায্য করুন' }
  ];

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
  }, [messages, loading, isOpen]);

  const fetchMessages = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/chat?session_id=${encodeURIComponent(sessionId)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);

        // Count unread admin/AI messages when widget is closed
        if (!isOpen) {
          const unreadMsgs = data.filter((m: ChatMessage) => m.sender_type === 'admin' && !m.is_read);
          setUnreadCount(unreadMsgs.length);
        } else {
          setUnreadCount(0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch chat messages', err);
    }
  };

  const sendMessageText = async (textToSend: string) => {
    if (!textToSend.trim() || !sessionId || loading) return;

    const messageText = textToSend.trim();
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
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          sender_type: 'customer',
          sender_name: customerName || 'Customer',
          message: messageText
        })
      });
      await res.json();
      await fetchMessages();
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessageText(inputMsg);
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
            AI Assistant Chat 💬
          </span>
        </button>
      </div>

      {/* Floating Chat Drawer Box */}
      {isOpen && (
        <div
          className={`fixed bottom-24 sm:bottom-20 right-3 sm:right-6 z-[160] w-[94vw] sm:w-[400px] h-[540px] max-h-[85vh] rounded-3xl shadow-2xl border flex flex-col overflow-hidden transition-all animate-fadeIn ${
            isDark ? 'bg-zinc-950 border-white/20 text-white shadow-emerald-950/30' : 'bg-white border-zinc-200 text-zinc-900'
          }`}
        >
          {/* Header */}
          <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'bg-zinc-900/90 border-white/10' : 'bg-stone-50 border-zinc-200'}`}>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#16A34A] to-emerald-400 text-white flex items-center justify-center shadow-md">
                  <Bot size={22} />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs tracking-wider uppercase flex items-center space-x-1.5">
                  <span>SK WORL AI ASSISTANT</span>
                  <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-mono">
                    LIVE
                  </span>
                </h3>
                <p className="text-[10px] text-emerald-500 font-mono flex items-center gap-1 mt-0.5">
                  <Sparkles size={10} />
                  <span>Instant Database-Aware Support</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-zinc-200 text-zinc-600'}`}
            >
              <X size={18} />
            </button>
          </div>

          {/* Optional Customer Name Bar */}
          <div className={`px-4 py-2 border-b flex items-center justify-between text-xs font-mono ${isDark ? 'bg-black/40 border-white/5' : 'bg-stone-100/60 border-zinc-200'}`}>
            <span className="text-zinc-500 text-[10px] uppercase shrink-0 mr-2">Name / Contact:</span>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your Name or Phone (Optional)..."
              className="w-full bg-transparent border-none focus:outline-none text-xs font-semibold text-[#16A34A] placeholder:text-zinc-500 text-right"
            />
          </div>

          {/* Message List Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs">
            {messages.length === 0 ? (
              <div className="text-center py-6 px-3 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-3xl bg-emerald-500/10 text-[#16A34A] flex items-center justify-center border border-emerald-500/20 shadow-inner">
                  <Sparkles size={28} />
                </div>
                <div>
                  <h4 className="font-black uppercase text-sm tracking-wide">আসসালামু আলাইকুম!</h4>
                  <p className="text-xs text-zinc-500 font-mono leading-relaxed mt-1">
                    Welcome to SK WORL! How can we assist you with our fashion collections today?
                  </p>
                </div>

                {/* Quick Prompts Container */}
                <div className="pt-2">
                  <p className="text-[10px] font-mono uppercase text-zinc-400 mb-2 font-bold tracking-wider">
                    Quick Questions:
                  </p>
                  <div className="grid grid-cols-1 gap-2 text-left">
                    {quickPrompts.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessageText(item.text)}
                        className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-left flex items-center justify-between group ${
                          isDark
                            ? 'bg-zinc-900/80 border-white/10 hover:border-emerald-500/50 hover:bg-zinc-800 text-zinc-200'
                            : 'bg-stone-50 border-zinc-200 hover:border-emerald-500 hover:bg-emerald-50 text-zinc-800'
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className="text-[10px] font-mono text-emerald-500 group-hover:translate-x-1 transition-transform">
                          Send →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isAdmin = msg.sender_type === 'admin';
                return (
                  <div
                    key={msg.id || index}
                    className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-500 mb-1 px-1">
                      {isAdmin && <Bot size={11} className="text-emerald-500 inline" />}
                      <span>{msg.sender_name}</span>
                      <span>•</span>
                      <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed font-medium whitespace-pre-wrap shadow-sm ${
                        isAdmin
                          ? isDark
                            ? 'bg-zinc-900 text-zinc-100 rounded-tl-none border border-white/10'
                            : 'bg-stone-100 text-zinc-900 rounded-tl-none border border-zinc-200'
                          : 'bg-[#16A34A] text-white rounded-tr-none'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })
            )}

            {/* AI Typing Indicator */}
            {loading && (
              <div className="flex flex-col items-start space-y-1">
                <span className="text-[9px] font-mono text-emerald-500 flex items-center gap-1">
                  <Sparkles size={10} /> SK WORL AI Assistant is typing...
                </span>
                <div
                  className={`px-4 py-3 rounded-2xl rounded-tl-none border text-xs flex items-center gap-2 ${
                    isDark ? 'bg-zinc-900 border-white/10 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                  }`}
                >
                  <div className="flex space-x-1 items-center">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                  </div>
                  <span className="font-mono text-[11px] text-zinc-400">Searching store catalog...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar if conversation exists */}
          {messages.length > 0 && !loading && (
            <div className={`px-3 py-1.5 border-t overflow-x-auto whitespace-nowrap flex gap-1.5 no-scrollbar ${isDark ? 'bg-zinc-950 border-white/5' : 'bg-stone-50 border-zinc-200'}`}>
              {quickPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessageText(item.text)}
                  className={`text-[10px] font-mono px-2.5 py-1 rounded-full border shrink-0 transition-colors ${
                    isDark
                      ? 'border-white/10 text-zinc-400 hover:text-white hover:border-emerald-500 bg-zinc-900'
                      : 'border-zinc-300 text-zinc-600 hover:text-emerald-700 hover:border-emerald-500 bg-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className={`p-3 border-t ${isDark ? 'bg-zinc-900/90 border-white/10' : 'bg-stone-50 border-zinc-200'}`}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Type your question here..."
                disabled={loading}
                className={`flex-1 px-4 py-2.5 rounded-2xl border text-xs focus:outline-none transition-all ${
                  isDark
                    ? 'bg-black border-white/20 text-white placeholder:text-zinc-600 focus:border-[#16A34A]'
                    : 'bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:border-[#16A34A]'
                }`}
              />
              <button
                type="submit"
                disabled={!inputMsg.trim() || loading}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white p-3 rounded-2xl transition-all disabled:opacity-40 shrink-0 shadow-md"
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
