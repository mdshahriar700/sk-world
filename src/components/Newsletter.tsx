import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { SiteSettings } from '../types';

interface NewsletterProps {
  settings: Partial<SiteSettings>;
}

export const Newsletter: React.FC<NewsletterProps> = ({ settings }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const heading = settings.newsletter_heading || 'JOIN THE SK WORL INSIDERS CLUB';

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
    <section className="bg-zinc-950 text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-white/10">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-400 block font-bold">
          07 / PRIVATE DISPATCH MEMBERSHIP
        </span>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase text-white font-syne tracking-tighter">
          {heading}
        </h2>
        <p className="font-mono text-xs sm:text-sm text-zinc-400 uppercase max-w-xl mx-auto tracking-wider">
          Be the first to receive secret collection drops, private archive sales, and Milano fashion updates.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto pt-4">
          <div className="relative w-full">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ENTER YOUR EMAIL ADDRESS"
              className="w-full bg-black border border-white/20 text-white text-xs font-mono uppercase pl-11 pr-4 py-4 focus:outline-none focus:border-white placeholder:text-zinc-500 font-bold tracking-wider"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-white text-black px-9 py-4 font-mono text-xs font-extrabold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors whitespace-nowrap disabled:opacity-50 border border-white"
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
