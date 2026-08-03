import React from 'react';
import { SiteSettings } from '../types';

interface SaleBannerProps {
  settings: Partial<SiteSettings>;
  onExploreClick: () => void;
}

export const SaleBanner: React.FC<SaleBannerProps> = ({ settings, onExploreClick }) => {
  const percent = settings.sale_banner_percent || '30';
  const bannerText =
    settings.sale_banner_text ||
    'SUMMER FLASH SALE — UP TO 30% OFF ON ALL HOODIES & JACKETS WITH FREE EXPRESS SHIPPING';

  return (
    <section className="bg-zinc-950 text-white py-20 px-4 sm:px-6 lg:px-8 border-y border-white/20 relative overflow-hidden">
      {/* Background Subtle Watermark */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 font-syne font-black text-[220px] text-white/[0.02] pointer-events-none select-none uppercase">
        SALE
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
        
        {/* Large Percent Graphic */}
        <div className="lg:col-span-4 flex items-center justify-center lg:justify-start">
          <div className="relative border-2 border-white p-8 text-center bg-black inline-block shadow-2xl">
            <span className="block font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold mb-2">
              04 / LIMITED PROMOTION
            </span>
            <span className="font-black text-7xl sm:text-8xl lg:text-9xl tracking-tighter text-white font-syne leading-none block">
              {percent}%
            </span>
            <span className="block font-mono text-xs uppercase font-extrabold text-white border-t border-white/20 pt-3 mt-3 tracking-[0.2em]">
              OFF ENTIRE SELECTION
            </span>
          </div>
        </div>

        {/* Promo Info */}
        <div className="lg:col-span-8 space-y-6 text-center lg:text-left">
          <div className="inline-block bg-white text-black font-mono text-[10px] font-extrabold uppercase tracking-[0.25em] px-3.5 py-1">
            SPECIAL OFFER
          </div>

          <h3 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-none font-syne text-white">
            {bannerText}
          </h3>

          <p className="text-xs sm:text-sm font-mono text-zinc-400 uppercase max-w-2xl tracking-wider">
            Discount applied automatically at checkout. Offer valid while stock lasts.
          </p>

          <div>
            <button
              onClick={onExploreClick}
              className="bg-white text-black hover:bg-zinc-200 font-mono text-xs font-extrabold uppercase tracking-[0.2em] px-9 py-4 border border-white transition-colors"
            >
              SHOP SALE COLLECTIONS
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
