import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, Bot, Sparkles, ShoppingBag, Truck, RefreshCw, LogOut, CheckCircle2, Mail } from 'lucide-react';
import { ChatMessage } from '../types';
import { useTheme } from '../context/ThemeContext';

export const LiveChatWidget: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  
  // Registration / Identification state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  // Reg Form input state
  const [inputName, setInputName] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [regError, setRegError] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef<boolean>(true);

  // Quick suggestion chips
  const quickPrompts = [
    { label: '🛍️ Available Products', text: 'আপনাদের কারেন্ট প্রোডাক্ট কালেকশন ও দাম কত?' },
    { label: '🚚 Delivery & COD', text: 'ঢাকার বাইরে এবং ঢাকার ভেতরে ডেলিভারি চার্জ কত?' },
    { label: '📏 Size & Exchange', text: 'সাইজ মেজারমেন্ট এবং এক্সচেঞ্জ পলিসি কি?' },
    { label: '📦 Track Order', text: 'আমার অর্ডার ট্র্যাক করতে সাহায্য করুন' }
  ];

  // Initialize session and check stored profile
  useEffect(() => {
    let sid = localStorage.getItem('sk_live_chat_session_id');
    if (!sid) {
      sid = 'chat_cust_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      localStorage.setItem('sk_live_chat_session_id', sid);
    }
    setSessionId(sid);

    const savedName = localStorage.getItem('sk_live_chat_customer_name') || '';
    const savedEmail = localStorage.getItem('sk_live_chat_customer_email') || '';

    if (savedName && savedEmail) {
      setCustomerName(savedName);
      setCustomerEmail(savedEmail);
      setIsRegistered(true);
    }
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

  // Handle auto-scroll intelligently: only when explicitly needed
  const scrollToBottom = (force = false) => {
    if (!messagesContainerRef.current) return;
    const container = messagesContainerRef.current;

    // Check if user is scrolled near bottom (within 100px)
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;

    if (force || isNearBottom || shouldAutoScrollRef.current) {
      container.scrollTop = container.scrollHeight;
      shouldAutoScrollRef.current = false;
    }
  };

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, isOpen]);

  const getLocalSmartFallbackReply = (msg: string, name: string): string => {
    if (/charge|delivery|ship|ডেলিভারি|চার্জ|কুরিয়ার|ভাড়া|পাঠানো/i.test(msg)) {
      return `SK WORLD-এর ডেলিভারি চার্জ:\n\n• ঢাকা সিটির ভেতরে: ৳৭০\n• ঢাকা সিটির বাইরে: ৳১৩০\n\nআমরা সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (COD) সুবিধা দিচ্ছি। আপনার পছন্দের প্রোডাক্টটি অর্ডার করতে শপ সেকশন ভিজিট করুন! 🛍️`;
    }
    
    if (/size|exchange|return|measurement|সাইজ|মেজারমেন্ট|রিটার্ন|চেঞ্জ|পাল্টানো/i.test(msg)) {
      return `SK WORLD-এর এক্সচেঞ্জ পলিসি & সাইজ গাইড:\n\n• সাইজ সংক্রান্ত সমস্যায় প্রোডাক্ট পাওয়ার ৭ দিনের মধ্যে সহজ এক্সচেঞ্জ সুবিধা পাবেন।\n• শুধুমাত্র আন-ওয়ার্ন (অব্যবহৃত) অবস্থায় প্রোডাক্ট রিটার্ন বা সাইজ সোয়াপ করা যাবে।\n\nসাহায্যের জন্য হেল্পলাইনে যোগাযোগ করুন: +880 1712 345 678`;
    }

    if (/product|item|hoodie|shirt|jacket|price|cost|stock|collection|দাম|সাইজ|স্টক|পণ্য|কালেকশন|টিশার্ট|হুডি|জ্যাকেট/i.test(msg)) {
      return `আমাদের শপে প্রিমিয়াম ৪০GSM হেভিওয়েট হুডি, বক্সি ফিট টিশার্ট এবং জ্যাকেট কালেকশন এভেলেবল আছে। সম্পূর্ণ কালেকশন দেখতে ওয়েবসাইট শপ পেইজ ভিজিট করুন! ✨`;
    }

    if (/order|track|status|অর্ডার|ট্র্যাক|অবস্থা|আইডি/i.test(msg)) {
      return `আপনার অর্ডার সম্পর্কিত তথ্য জানতে আপনার মোবাইল নম্বর অথবা অর্ডার আইডিটি মেসেজে লিখুন। আমরা সাথে সাথেই তথ্য জানিয়ে দিচ্ছি! 📦`;
    }

    if (/contact|phone|number|email|help|support|হেল্পলাইন|ফোন|নম্বর|যোগাযোগ/i.test(msg)) {
      return `SK WORLD সাপোর্ট হটলাইন:\n\n📞 ফোন: +880 1712 345 678\n✉️ ইমেইল: contact@skworl.com\n⏰ সময়: প্রতিদিন সকাল ১০টা - রাত ১০টা`;
    }

    return `ধন্যবাদ আপনার বার্তার জন্য, ${name || 'সম্মানিত গ্রাহক'}! SK WORLD-এর সাপোর্ট প্রতিনিধি আপনার প্রশ্নটি পেয়েছে। সরাসরি কথা বলতে আমাদের হটলাইনে কল করতে পারেন: +880 1712 345 678`;
  };

  const fetchMessages = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/chat?session_id=${encodeURIComponent(sessionId)}`);
      if (!res.ok) return;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return;

      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages((prev) => {
          if (data.length === 0) return prev;
          
          // Merge database messages with unsynced local optimistic messages
          const dbMessageTexts = new Set(data.map((m: ChatMessage) => `${m.sender_type}:${m.message}`));
          const localOnly = prev.filter(m => !dbMessageTexts.has(`${m.sender_type}:${m.message}`));
          
          // Sort logically by timestamp/id
          const combined = [...data, ...localOnly];
          return combined;
        });

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

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) {
      setRegError('অনুগ্রহ করে আপনার নাম লিখুন (Please enter your name)');
      return;
    }
    if (!inputEmail.trim() || !inputEmail.includes('@')) {
      setRegError('অনুগ্রহ করে সঠিক জিমেইল/ইমেইল এড্রেস লিখুন');
      return;
    }

    setRegError('');
    const nameVal = inputName.trim();
    const emailVal = inputEmail.trim();

    localStorage.setItem('sk_live_chat_customer_name', nameVal);
    localStorage.setItem('sk_live_chat_customer_email', emailVal);

    setCustomerName(nameVal);
    setCustomerEmail(emailVal);
    setIsRegistered(true);
  };

  const sendMessageText = async (textToSend: string) => {
    if (!textToSend.trim() || !sessionId || loading) return;

    const messageText = textToSend.trim();
    setInputMsg('');

    // Optimistic UI push
    const optimisticMsg: ChatMessage = {
      id: Date.now(),
      session_id: sessionId,
      sender_type: 'customer',
      sender_name: `${customerName} (${customerEmail})`,
      message: messageText,
      is_read: false,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setLoading(true);
    shouldAutoScrollRef.current = true;

    try {
      let aiReplyText = '';
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          sender_type: 'customer',
          sender_name: `${customerName} (${customerEmail})`,
          sender_email: customerEmail,
          message: messageText
        })
      });

      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const resData = await res.json();
          if (resData && resData.ai_reply) {
            aiReplyText = resData.ai_reply;
          }
        }
      }

      // If backend did not return an AI reply (or if server error occurred), use client-side smart fallback
      if (!aiReplyText) {
        aiReplyText = getLocalSmartFallbackReply(messageText, customerName);
      }

      const aiMsg: ChatMessage = {
        id: Date.now() + 1,
        session_id: sessionId,
        sender_type: 'admin',
        sender_name: 'SK WORLD AI Assistant',
        message: aiReplyText,
        is_read: true,
        created_at: new Date().toISOString()
      };

      setMessages((prev) => {
        const exists = prev.some((m) => m.sender_type === 'admin' && m.message === aiReplyText);
        if (exists) return prev;
        return [...prev, aiMsg];
      });

      await fetchMessages();
      shouldAutoScrollRef.current = true;
      scrollToBottom(true);
    } catch (err) {
      console.error('Failed to send message via API, using smart fallback', err);
      const fallbackText = getLocalSmartFallbackReply(messageText, customerName);
      const aiMsg: ChatMessage = {
        id: Date.now() + 1,
        session_id: sessionId,
        sender_type: 'admin',
        sender_name: 'SK WORLD AI Assistant',
        message: fallbackText,
        is_read: true,
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, aiMsg]);
      shouldAutoScrollRef.current = true;
      scrollToBottom(true);
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
            shouldAutoScrollRef.current = true;
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
          <div className={`p-4 border-b flex items-center justify-between shrink-0 ${isDark ? 'bg-zinc-900/90 border-white/10' : 'bg-stone-50 border-zinc-200'}`}>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#16A34A] to-emerald-400 text-white flex items-center justify-center shadow-md">
                  <Bot size={22} />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs tracking-wider uppercase flex items-center space-x-1.5">
                  <span>SK WORLD AI ASSISTANT</span>
                  <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-mono">
                    LIVE
                  </span>
                </h3>
                <p className="text-[10px] text-emerald-500 font-bengali flex items-center gap-1 mt-0.5">
                  <Sparkles size={10} />
                  <span>ইন্সট্যান্ট ডাটাবেস সাপোর্ট (24/7)</span>
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

          {/* REGISTER STEP IF NOT LOGGED IN */}
          {!isRegistered ? (
            <div className="flex-1 p-6 flex flex-col justify-center text-center font-bengali space-y-4 overflow-y-auto">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 text-[#16A34A] flex items-center justify-center border border-emerald-500/20 shadow-inner">
                <User size={30} />
              </div>

              <div>
                <h4 className="font-bold text-base text-emerald-500 uppercase tracking-wide">
                  লাইভ চ্যাটে স্বাগতম!
                </h4>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-siliguri">
                  আপনার নাম ও ইমেইল দিয়ে চ্যাট শুরু করুন। এর ফলে আমাদের AI আপনার অর্ডারের সঠিক আপডেট এবং নিখুঁত উত্তর দিতে পারবে।
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3 text-left font-sans pt-2">
                {regError && (
                  <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-bengali font-semibold text-center">
                    {regError}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                    Your Full Name (আপনার নাম):
                  </label>
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-all ${
                      isDark
                        ? 'bg-zinc-900 border-white/20 text-white focus:border-[#16A34A]'
                        : 'bg-stone-50 border-zinc-300 text-zinc-900 focus:border-[#16A34A]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                    Gmail / Email Address (আপনার জিমেইল):
                  </label>
                  <input
                    type="email"
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-all ${
                      isDark
                        ? 'bg-zinc-900 border-white/20 text-white focus:border-[#16A34A]'
                        : 'bg-stone-50 border-zinc-300 text-zinc-900 focus:border-[#16A34A]'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/20 flex items-center justify-center space-x-2 mt-2"
                >
                  <CheckCircle2 size={16} />
                  <span>Start Live Chat / চ্যাট শুরু করুন</span>
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Profile Bar */}
              <div className={`px-4 py-2 border-b flex items-center justify-between text-[11px] font-mono shrink-0 ${isDark ? 'bg-black/60 border-white/5' : 'bg-stone-100/80 border-zinc-200'}`}>
                <div className="flex items-center space-x-1.5 truncate text-emerald-400">
                  <User size={13} className="shrink-0" />
                  <span className="font-semibold truncate">{customerName}</span>
                  <span className="text-zinc-500">({customerEmail})</span>
                </div>
                <button
                  onClick={() => {
                    setIsRegistered(false);
                    setInputName(customerName);
                    setInputEmail(customerEmail);
                  }}
                  className="text-[10px] text-zinc-400 hover:text-white underline shrink-0 ml-2"
                >
                  Edit Profile
                </button>
              </div>

              {/* Message List Area */}
              <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3 font-bengali text-xs">
                {messages.length === 0 ? (
                  <div className="text-center py-6 px-3 space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-3xl bg-emerald-500/10 text-[#16A34A] flex items-center justify-center border border-emerald-500/20 shadow-inner">
                      <Sparkles size={28} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm tracking-wide">আসসালামু আলাইকুম, {customerName}!</h4>
                      <p className="text-xs text-zinc-400 font-siliguri leading-relaxed mt-1">
                        SK WORLD-এ আপনাকে স্বাগতম। প্রোডাক্ট কালেকশন, অর্ডার আপডেট কিংবা সাইজ সংক্রান্ত যেকোনো বিষয়ে প্রশ্ন করুন।
                      </p>
                    </div>

                    {/* Quick Prompts Container */}
                    <div className="pt-2">
                      <p className="text-[10px] font-mono uppercase text-zinc-400 mb-2 font-bold tracking-wider text-left">
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
                          <span>{isAdmin ? 'SK WORLD Assistant' : customerName}</span>
                          <span>•</span>
                          <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        <div
                          className={`max-w-[88%] px-4 py-3 rounded-2xl text-xs leading-relaxed font-siliguri whitespace-pre-wrap shadow-sm ${
                            isAdmin
                              ? isDark
                                ? 'bg-zinc-900 text-zinc-100 rounded-tl-none border border-white/10'
                                : 'bg-stone-100 text-zinc-900 rounded-tl-none border border-zinc-200'
                              : 'bg-[#16A34A] text-white rounded-tr-none font-medium'
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
                      <Sparkles size={10} /> SK WORLD AI Assistant is typing...
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
                      <span className="font-bengali text-[11px] text-zinc-400">ডাটাবেসে খুঁজছি...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Prompts Bar if conversation exists */}
              {messages.length > 0 && !loading && (
                <div className={`px-3 py-1.5 border-t overflow-x-auto whitespace-nowrap flex gap-1.5 shrink-0 no-scrollbar ${isDark ? 'bg-zinc-950 border-white/5' : 'bg-stone-50 border-zinc-200'}`}>
                  {quickPrompts.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessageText(item.text)}
                      className={`text-[10px] font-siliguri px-2.5 py-1 rounded-full border shrink-0 transition-colors ${
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
              <form onSubmit={handleSendMessage} className={`p-3 border-t shrink-0 ${isDark ? 'bg-zinc-900/90 border-white/10' : 'bg-stone-50 border-zinc-200'}`}>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder="আপনার প্রশ্নটি এখানে লিখুন..."
                    disabled={loading}
                    className={`flex-1 px-4 py-2.5 rounded-2xl border text-xs font-siliguri focus:outline-none transition-all ${
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
            </>
          )}
        </div>
      )}
    </>
  );
};
