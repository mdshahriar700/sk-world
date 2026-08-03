import React from 'react';
import { SiteSettings } from '../types';
import { useTheme } from '../context/ThemeContext';

interface FeatureBlocksProps {
  settings: Partial<SiteSettings>;
  onExploreClick: () => void;
}

export const FeatureBlocks: React.FC<FeatureBlocksProps> = ({ settings, onExploreClick }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const f1Enabled = settings.feature1_enabled !== 'false';
  const f1Heading = settings.feature1_heading || 'PREMIUM MILANO HEAVYWEIGHT FABRIC';
  const f1Text =
    settings.feature1_text ||
    'Crafted from heavy 450gsm French Terry cotton for structure, comfort, and longevity in Bangladesh climate.';
  const f1Image =
    settings.feature1_image ||
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200';

  const f2Enabled = settings.feature2_enabled !== 'false';
  const f2Heading = settings.feature2_heading || 'EXPRESS ALL BANGLADESH DISPATCH';
  const f2Text =
    settings.feature2_text ||
    'Dispatched within 24 hours with Cash on Delivery across Dhaka, Chittagong, Sylhet & all 64 districts.';
  const f2Image =
    settings.feature2_image ||
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200';

  if (!f1Enabled && !f2Enabled) {
    return null;
  }

  return (
    <section className={`py-16 sm:py-24 border-b transition-colors ${
      isDark ? 'bg-black text-white border-white/10' : 'bg-stone-50 text-zinc-900 border-zinc-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        
        {/* Feature Block 1 */}
        {f1Enabled && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 block font-bold">
                05 / CRAFTSMANSHIP & TEXTILES
              </span>
              <h2 className="text-3xl sm:text-5xl font-black uppercase font-syne tracking-tight">
                {f1Heading}
              </h2>
              <p className={`font-mono text-xs sm:text-sm leading-relaxed uppercase tracking-wider ${
                isDark ? 'text-zinc-400' : 'text-zinc-600'
              }`}>
                {f1Text}
              </p>
              <button
                onClick={onExploreClick}
                className={`inline-block px-7 py-3.5 font-mono text-xs uppercase tracking-widest font-black transition-colors border ${
                  isDark ? 'bg-white text-black border-white hover:bg-zinc-200' : 'bg-black text-white border-black hover:bg-zinc-800'
                }`}
              >
                DISCOVER CRAFTSMANSHIP
              </button>
            </div>
            <div className="lg:col-span-6">
              <div className={`aspect-[4/3] border-2 overflow-hidden relative shadow-2xl group ${
                isDark ? 'bg-zinc-900 border-white/20' : 'bg-stone-200 border-zinc-300'
              }`}>
                <img
                  src={f1Image}
                  alt={f1Heading}
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* Feature Block 2 */}
        {f2Enabled && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className={`aspect-[4/3] border-2 overflow-hidden relative shadow-2xl group ${
                isDark ? 'bg-zinc-900 border-white/20' : 'bg-stone-200 border-zinc-300'
              }`}>
                <img
                  src={f2Image}
                  alt={f2Heading}
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                />
              </div>
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 block font-bold">
                06 / LOGISTICS & PACKAGING
              </span>
              <h2 className="text-3xl sm:text-5xl font-black uppercase font-syne tracking-tight">
                {f2Heading}
              </h2>
              <p className={`font-mono text-xs sm:text-sm leading-relaxed uppercase tracking-wider ${
                isDark ? 'text-zinc-400' : 'text-zinc-600'
              }`}>
                {f2Text}
              </p>
              <button
                onClick={onExploreClick}
                className={`inline-block px-7 py-3.5 font-mono text-xs uppercase tracking-widest font-black transition-colors border ${
                  isDark ? 'bg-white text-black border-white hover:bg-zinc-200' : 'bg-black text-white border-black hover:bg-zinc-800'
                }`}
              >
                VIEW SHIPPING POLICY
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

