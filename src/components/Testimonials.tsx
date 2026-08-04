import React, { useState, useEffect } from 'react';
import { Star, Quote, CheckCircle2, MessageSquare, MapPin, Sparkles } from 'lucide-react';
import { Testimonial } from '../types';
import { useTheme } from '../context/ThemeContext';

export const Testimonials: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials?visible_only=true');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTestimonials(data);
      }
    } catch (err) {
      console.error('Failed to load testimonials', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || testimonials.length === 0) return null;

  // Split testimonials into two rows if we have enough items
  const row1 = testimonials.length >= 2 
    ? testimonials.filter((_, i) => i % 2 === 0) 
    : testimonials;
  const row2 = testimonials.length >= 2 
    ? testimonials.filter((_, i) => i % 2 !== 0) 
    : testimonials;

  // Duplicate arrays to guarantee infinite seamless looping without white space
  const marqueeRow1 = [...row1, ...row1, ...row1, ...row1];
  const marqueeRow2 = [...row2, ...row2, ...row2, ...row2];

  return (
    <section className={`py-16 sm:py-20 border-t transition-colors relative overflow-hidden ${
      isDark ? 'bg-zinc-950 border-white/10 text-white' : 'bg-stone-50 border-zinc-200 text-zinc-900'
    }`}>
      {/* CSS Keyframe animations for marquee */}
      <style>{`
        @keyframes marqueeScrollLeft {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeScrollRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .marquee-track-left {
          display: flex;
          width: max-content;
          animation: marqueeScrollLeft 40s linear infinite;
        }
        .marquee-track-right {
          display: flex;
          width: max-content;
          animation: marqueeScrollRight 40s linear infinite;
        }
        .marquee-track-left:hover,
        .marquee-track-right:hover,
        .marquee-card:hover {
          animation-play-state: paused !important;
        }
      `}</style>

      {/* Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-[#16A34A] bg-[#16A34A]/10 px-3 py-1 rounded-full font-mono text-[11px] font-bold uppercase tracking-widest mb-3 border border-[#16A34A]/20">
              <MessageSquare size={14} />
              <span>COMMUNITY REVIEWS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-ping" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight">
              WHAT OUR INSIDERS SAY
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-mono mt-1.5 max-w-2xl">
              100% verified customer feedback on cotton weight, drop-shoulder fits, and COD delivery across Bangladesh.
            </p>
          </div>

          <div className="flex items-center space-x-2 font-mono text-xs text-zinc-400 bg-zinc-900/40 px-3 py-1.5 rounded-xl border border-white/5 shrink-0 self-start md:self-auto">
            <Sparkles size={14} className="text-[#16A34A]" />
            <span>Hover card to pause flow</span>
          </div>
        </div>
      </div>

      {/* Marquee Wrapper with Gradient Edges */}
      <div className="relative w-full overflow-hidden space-y-4 sm:space-y-6">
        {/* Left & Right Gradient Overlay for Smooth Edge Fade */}
        <div className={`pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 z-20 bg-gradient-to-r ${
          isDark ? 'from-zinc-950 via-zinc-950/80 to-transparent' : 'from-stone-50 via-stone-50/80 to-transparent'
        }`} />
        <div className={`pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 z-20 bg-gradient-to-l ${
          isDark ? 'from-zinc-950 via-zinc-950/80 to-transparent' : 'from-stone-50 via-stone-50/80 to-transparent'
        }`} />

        {/* Row 1: Flowing Left */}
        <div className="flex w-full overflow-hidden">
          <div className="marquee-track-left flex gap-4 sm:gap-6">
            {marqueeRow1.map((item, idx) => (
              <TestimonialCard key={`row1-${item.id}-${idx}`} item={item} isDark={isDark} />
            ))}
          </div>
        </div>

        {/* Row 2: Flowing Right */}
        {testimonials.length >= 2 && (
          <div className="flex w-full overflow-hidden">
            <div className="marquee-track-right flex gap-4 sm:gap-6">
              {marqueeRow2.map((item, idx) => (
                <TestimonialCard key={`row2-${item.id}-${idx}`} item={item} isDark={isDark} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

interface CardProps {
  item: Testimonial;
  isDark: boolean;
}

const TestimonialCard: React.FC<CardProps> = ({ item, isDark }) => {
  return (
    <div
      className={`marquee-card w-[280px] sm:w-[320px] p-5 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between shrink-0 group ${
        isDark
          ? 'bg-zinc-900/90 border-white/10 hover:border-[#16A34A] hover:bg-zinc-900 hover:shadow-xl hover:shadow-[#16A34A]/10'
          : 'bg-white border-zinc-200 hover:border-[#16A34A] hover:shadow-xl hover:shadow-emerald-900/5'
      }`}
    >
      <Quote
        size={32}
        className={`absolute top-4 right-4 opacity-15 transition-opacity group-hover:opacity-30 ${
          isDark ? 'text-white' : 'text-zinc-900'
        }`}
      />

      <div>
        {/* Rating Stars & Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1 text-amber-400">
            {Array.from({ length: item.rating || 5 }).map((_, i) => (
              <Star key={i} size={14} fill="currentColor" />
            ))}
          </div>
          <span className="font-mono text-[10px] font-bold text-amber-500 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
            {item.rating ? `${item.rating}.0` : '5.0'}
          </span>
        </div>

        {/* Review Text */}
        <p className="text-xs sm:text-sm font-medium leading-relaxed mb-6 text-zinc-300 dark:text-zinc-300 line-clamp-4">
          "{item.review}"
        </p>
      </div>

      {/* Customer Info Footer */}
      <div className="flex items-center space-x-3 pt-3.5 border-t border-zinc-200/10 dark:border-white/10">
        <div className="relative">
          {item.avatar_url ? (
            <img
              src={item.avatar_url}
              alt={item.name}
              className="w-9 h-9 rounded-full object-cover border border-zinc-300 dark:border-white/20"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#16A34A]/20 text-[#16A34A] flex items-center justify-center font-bold text-xs">
              {item.name.charAt(0)}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#16A34A] rounded-full ring-2 ring-zinc-950" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-1.5">
            <h3 className="font-black text-xs uppercase tracking-tight truncate text-zinc-900 dark:text-white">
              {item.name}
            </h3>
            <CheckCircle2 size={13} className="text-[#16A34A] shrink-0" />
          </div>

          <div className="flex items-center space-x-1 text-[10px] text-zinc-500 font-mono mt-0.5 truncate">
            <MapPin size={10} className="text-[#16A34A] shrink-0" />
            <span className="truncate">
              {item.location || item.role || 'Dhaka, Bangladesh'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
