import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SiteSettings } from '../types';

interface HeroProps {
  settings: Partial<SiteSettings>;
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onExploreClick }) => {
  const headline = settings.hero_headline || 'YOURSELF INTO THE RIGHT GEAR';
  const subheading =
    settings.hero_subheading ||
    'MILANO SUMMER & WINTER COLLECTION 2026. ELEVATED STREETWEAR & ESSENTIAL CUTS DESIGNED FOR THE MODERN ICON.';
  const image =
    settings.hero_image_url ||
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1600';
  const ctaText = settings.hero_cta_text || 'VIEW SUMMER COLLECTIONS';

  return (
    <section className="relative bg-black text-white overflow-hidden border-b border-white/10 pt-10 pb-20 lg:pb-28">
      {/* Background Giant Watermark Typography */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 font-syne font-black text-[180px] sm:text-[240px] md:text-[320px] text-white/[0.02] leading-none pointer-events-none select-none whitespace-nowrap">
        MILANO 2026
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-8 pt-4">
            <div className="inline-flex items-center space-x-3 bg-zinc-900 border border-white/20 px-3.5 py-1.5 font-mono text-[10px] tracking-[0.3em] text-zinc-300 uppercase font-bold">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>MILANO NEW SEASON DISPATCH</span>
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter uppercase leading-[0.82] font-syne">
              {headline}
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-zinc-400 max-w-xl font-mono leading-relaxed uppercase tracking-wider">
              {subheading}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-6">
              <button
                onClick={onExploreClick}
                className="group relative inline-flex items-center space-x-4 bg-white text-black px-9 py-4 font-mono text-xs uppercase tracking-[0.2em] font-extrabold hover:bg-zinc-200 transition-all border border-white"
              >
                <span>{ctaText}</span>
                <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>

              <div className="hidden sm:flex items-center space-x-3 font-mono text-xs text-zinc-500 uppercase tracking-widest border-l border-white/10 pl-6 py-2">
                <span className="font-bold text-white text-base font-syne">01 /</span>
                <span>LIMITED QUANTITY DROPS</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Banner */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900 border-2 border-white/20 shadow-2xl group">
              <img
                src={image}
                alt="SK WORL Fashion Hero"
                className="w-full h-full object-cover object-top filter grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              
              <div className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-md p-4 border border-white/20 flex items-center justify-between">
                <div>
                  <span className="block font-mono text-[9px] text-zinc-400 uppercase tracking-[0.2em] font-bold">01 / FEATURED LOOK</span>
                  <span className="font-extrabold text-sm text-white uppercase tracking-wider font-syne">SK MILANO OVERSIZED CUT</span>
                </div>
                <span className="font-mono text-xs font-bold bg-white text-black px-2.5 py-1">2026</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
