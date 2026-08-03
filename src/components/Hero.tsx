import React from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { SiteSettings } from '../types';
import { useTheme } from '../context/ThemeContext';

interface HeroProps {
  settings: Partial<SiteSettings>;
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onExploreClick }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const headline = settings.hero_headline || 'GEAR UP IN SK WORL MILANO';
  const subheading =
    settings.hero_subheading ||
    'MILANO SUMMER & WINTER COLLECTION 2026. ELEVATED STREETWEAR & ESSENTIAL CUTS DESIGNED IN BANGLADESH.';
  const image =
    settings.hero_image_url ||
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1600';
  const ctaText = settings.hero_cta_text || 'EXPLORE COLLECTIONS';

  return (
    <section className={`relative overflow-hidden border-b transition-colors pt-8 pb-16 lg:pb-24 ${
      isDark ? 'bg-black text-white border-white/10' : 'bg-stone-100 text-zinc-900 border-zinc-200'
    }`}>
      {/* Background Giant Watermark Typography */}
      <div className={`absolute top-1/2 left-0 -translate-y-1/2 font-syne font-black text-[120px] sm:text-[200px] md:text-[280px] leading-none pointer-events-none select-none whitespace-nowrap ${
        isDark ? 'text-white/[0.03]' : 'text-black/[0.04]'
      }`}>
        MILANO 2026
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 pt-2">
            <div className={`inline-flex items-center space-x-2.5 px-3 py-1 font-mono text-[10px] sm:text-xs tracking-widest uppercase font-bold border ${
              isDark ? 'bg-zinc-900 border-white/20 text-zinc-300' : 'bg-white border-zinc-300 text-zinc-800'
            }`}>
              <Sparkles size={14} className="text-amber-500 animate-pulse" />
              <span>BANGLADESH DISPATCH • 2026 EDITION</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.88] font-syne">
              {headline}
            </h1>

            <p className={`text-xs sm:text-sm md:text-base max-w-xl font-mono leading-relaxed uppercase tracking-wider ${
              isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}>
              {subheading}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6">
              <button
                onClick={onExploreClick}
                className={`group relative inline-flex items-center space-x-3 px-8 py-3.5 sm:px-9 sm:py-4 font-mono text-xs uppercase tracking-widest font-black transition-all border shadow-lg ${
                  isDark ? 'bg-white text-black border-white hover:bg-zinc-200' : 'bg-black text-white border-black hover:bg-zinc-800'
                }`}
              >
                <span>{ctaText}</span>
                <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>

              <div className={`hidden sm:flex items-center space-x-3 font-mono text-xs uppercase tracking-widest border-l pl-6 py-2 ${
                isDark ? 'text-zinc-500 border-white/10' : 'text-zinc-500 border-zinc-300'
              }`}>
                <span className={`font-black text-base font-syne ${isDark ? 'text-white' : 'text-black'}`}>01 /</span>
                <span>FREE & FAST DISPATCH IN BD</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Banner */}
          <div className="lg:col-span-5 relative">
            <div className={`relative aspect-[3/4] overflow-hidden border-2 shadow-2xl group transition-colors ${
              isDark ? 'bg-zinc-900 border-white/20' : 'bg-stone-200 border-zinc-300'
            }`}>
              <img
                src={image}
                alt="SK WORL Fashion Hero"
                className="w-full h-full object-cover object-top filter grayscale contrast-110 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <div className={`absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 p-3.5 sm:p-4 border backdrop-blur-md flex items-center justify-between ${
                isDark ? 'bg-black/90 border-white/20 text-white' : 'bg-white/95 border-zinc-300 text-zinc-900'
              }`}>
                <div>
                  <span className="block font-mono text-[9px] text-zinc-400 uppercase tracking-widest font-bold">01 / BANGLADESH DROP</span>
                  <span className="font-extrabold text-xs sm:text-sm uppercase tracking-wider font-syne">SK MILANO OVERSIZED CUT</span>
                </div>
                <span className={`font-mono text-xs font-black px-2.5 py-1 border ${
                  isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                }`}>
                  ৳ BDT
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

