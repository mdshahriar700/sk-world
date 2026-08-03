import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { SiteSettings } from '../types';
import { useTheme } from '../context/ThemeContext';

interface NewsletterProps {
  settings: Partial<SiteSettings>;
}

export const Newsletter: React.FC<NewsletterProps> = ({ settings }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const heading = settings.newsletter_heading || 'JOIN THE SK WORL BANGLADESH INSIDERS';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setMessage({ text: 'Please enter a valid email address.', isError: true });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ text: data.message || 'Successfully subscribed! Welcome to SK WORL Insiders.', isError: false });
        setEmail('');
      } else {
        setMessage({ text: data.error || 'Subscription failed. Please try again.', isError: true });
      }
    } catch (err: any) {
      setMessage({ text: 'Network error occurred. Please try again.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b transition-colors ${
      isDark ? 'bg-zinc-950 text-white border-white/10' : 'bg-stone-100 text-zinc-900 border-zinc-200'
    }`}>
      <div className="max-w-4xl mx-auto text-center space-y-5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 block font-bold">
          07 / PRIVATE DISPATCH MEMBERSHIP
        </span>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase font-syne tracking-tight">
          {heading}
        </h2>
        <p className={`font-mono text-xs uppercase max-w-xl mx-auto tracking-wider ${
          isDark ? 'text-zinc-400' : 'text-zinc-600'
        }`}>
          Be the first to receive secret collection drops, private archive sales, and Bangladesh flash updates.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto pt-2">
          <div className="relative w-full">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ENTER YOUR EMAIL ADDRESS"
              className={`w-full border text-xs font-mono uppercase pl-11 pr-4 py-3.5 focus:outline-none font-bold tracking-wider ${
                isDark ? 'bg-black border-white/20 text-white focus:border-white' : 'bg-white border-zinc-300 text-black focus:border-black'
              }`}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full sm:w-auto px-8 py-3.5 font-mono text-xs font-black uppercase tracking-widest transition-colors whitespace-nowrap disabled:opacity-50 border ${
              isDark ? 'bg-white text-black border-white hover:bg-zinc-200' : 'bg-black text-white border-black hover:bg-zinc-800'
            }`}
          >
            {loading ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
          </button>
        </form>

        {message && (
          <div
            className={`inline-flex items-center space-x-2 px-4 py-2 font-mono text-xs uppercase border ${
              message.isError
                ? 'bg-red-950/80 text-red-300 border-red-800'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
            }`}
          >
            {message.isError ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
            <span>{message.text}</span>
          </div>
        )}
      </div>
    </section>
  );
};

