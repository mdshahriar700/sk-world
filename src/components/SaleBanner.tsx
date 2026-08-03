import React from 'react';
import { SiteSettings } from '../types';
import { useTheme } from '../context/ThemeContext';

interface SaleBannerProps {
  settings: Partial<SiteSettings>;
  onExploreClick: () => void;
}

export const SaleBanner: React.FC<SaleBannerProps> = ({ settings, onExploreClick }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (settings.sale_banner_enabled === 'false') {
    return null;
  }

  const percent = settings.sale_banner_percent || '30';
  const headingText =
    settings.sale_banner_heading ||
    'SUMMER FLASH SALE — UP TO 30% OFF ON ALL HOODIES & JACKETS WITH FREE EXPRESS SHIPPING';
  const bannerText =
    settings.sale_banner_text ||
    'Discount applied automatically at checkout. Cash on Delivery available across all 64 districts in Bangladesh.';
  const ctaText = settings.sale_banner_cta || 'SHOP SALE COLLECTIONS';

  return (
    <section className={`py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-y relative overflow-hidden transition-colors ${
      isDark ? 'bg-zinc-950 text-white border-white/20' : 'bg-stone-100 text-zinc-900 border-zinc-300'
    }`}>
      {/* Background Subtle Watermark */}
      <div className={`absolute right-0 top-1/2 -translate-y-1/2 font-syne font-black text-[180px] sm:text-[220px] pointer-events-none select-none uppercase ${
        isDark ? 'text-white/[0.02]' : 'text-black/[0.03]'
      }`}>
        SALE
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
        
        {/* Large Percent Graphic */}
        <div className="lg:col-span-4 flex items-center justify-center lg:justify-start">
          <div className={`relative border-2 p-6 sm:p-8 text-center inline-block shadow-xl ${
            isDark ? 'bg-black border-white text-white' : 'bg-white border-black text-black'
          }`}>
            <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-2">
              04 / LIMITED PROMOTION
            </span>
            <span className="font-black text-6xl sm:text-8xl tracking-tight font-syne leading-none block">
              {percent}%
            </span>
            <span className={`block font-mono text-xs uppercase font-extrabold border-t pt-3 mt-3 tracking-widest ${
              isDark ? 'border-white/20' : 'border-zinc-300'
            }`}>
              OFF ENTIRE SELECTION
            </span>
          </div>
        </div>

        {/* Promo Info */}
        <div className="lg:col-span-8 space-y-5 text-center lg:text-left">
          <div className={`inline-block font-mono text-[10px] font-black uppercase tracking-widest px-3.5 py-1 ${
            isDark ? 'bg-white text-black' : 'bg-black text-white'
          }`}>
            SPECIAL BANGLADESH OFFER
          </div>

          <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-tight font-syne">
            {headingText}
          </h3>

          <p className={`text-xs font-mono uppercase max-w-2xl tracking-wider ${
            isDark ? 'text-zinc-400' : 'text-zinc-600'
          }`}>
            {bannerText}
          </p>

          <div>
            <button
              onClick={onExploreClick}
              className={`font-mono text-xs font-black uppercase tracking-widest px-8 py-3.5 border transition-colors ${
                isDark ? 'bg-white text-black border-white hover:bg-zinc-200' : 'bg-black text-white border-black hover:bg-zinc-800'
              }`}
            >
              {ctaText}
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

