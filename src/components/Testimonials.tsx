import React, { useState, useEffect } from 'react';
import { Star, Quote, CheckCircle2, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { Testimonial } from '../types';
import { useTheme } from '../context/ThemeContext';

export const Testimonials: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

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

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className={`py-16 px-4 border-t transition-colors relative overflow-hidden ${
      isDark ? 'bg-zinc-950/60 border-white/10 text-white' : 'bg-stone-50 border-zinc-200 text-zinc-900'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[#16A34A] font-mono text-xs font-bold uppercase tracking-widest mb-2">
              <MessageSquare size={16} />
              <span>COMMUNITY FEEDBACK</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight">
              WHAT OUR INSIDERS SAY
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-mono mt-1">
              Verified customer reviews on fit, luxury cotton weight, and delivery across Bangladesh.
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              aria-label="Previous Testimonial"
              className={`p-3 rounded-xl border transition-all ${
                isDark
                  ? 'bg-black border-white/10 hover:border-white/40 text-white'
                  : 'bg-white border-zinc-200 hover:border-zinc-400 text-zinc-900 shadow-sm'
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Testimonial"
              className={`p-3 rounded-xl border transition-all ${
                isDark
                  ? 'bg-black border-white/10 hover:border-white/40 text-white'
                  : 'bg-white border-zinc-200 hover:border-zinc-400 text-zinc-900 shadow-sm'
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Testimonials Grid / Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => (
            <div
              key={item.id || idx}
              className={`p-6 rounded-2xl border transition-all relative flex flex-col justify-between ${
                isDark
                  ? 'bg-black/80 border-white/10 hover:border-white/20'
                  : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm'
              }`}
            >
              <Quote
                size={36}
                className={`absolute top-4 right-4 opacity-10 ${isDark ? 'text-white' : 'text-black'}`}
              />

              <div>
                {/* Rating Stars */}
                <div className="flex items-center space-x-1 mb-4 text-amber-400">
                  {Array.from({ length: item.rating || 5 }).map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-sm font-medium leading-relaxed mb-6">
                  "{item.review}"
                </p>
              </div>

              {/* Author Footer */}
              <div className="flex items-center space-x-3 pt-4 border-t border-zinc-200/10">
                {item.avatar_url ? (
                  <img
                    src={item.avatar_url}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-300 dark:border-white/20"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#16A34A]/20 text-[#16A34A] flex items-center justify-center font-bold text-sm">
                    {item.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-extrabold text-sm uppercase">{item.name}</h3>
                    <CheckCircle2 size={14} className="text-[#16A34A]" />
                  </div>
                  {item.role && (
                    <p className="text-[11px] text-zinc-500 font-mono">{item.role}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
