import React from 'react';
import { SiteSettings } from '../types';

interface FeatureBlocksProps {
  settings: Partial<SiteSettings>;
  onExploreClick: () => void;
}

export const FeatureBlocks: React.FC<FeatureBlocksProps> = ({ settings, onExploreClick }) => {
  const f1Heading = settings.feature1_heading || 'PREMIUM MILANO FABRIC';
  const f1Text =
    settings.feature1_text ||
    'Crafted from heavy 450gsm French Terry cotton for structure, comfort, and longevity.';
  const f1Image =
    settings.feature1_image ||
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200';

  const f2Heading = settings.feature2_heading || 'EXPRESS WORLDWIDE SHIPPING';
  const f2Text =
    settings.feature2_text ||
    'Dispatched within 24 hours in zero-plastic eco-friendly luxury packaging.';
  const f2Image =
    settings.feature2_image ||
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200';

  return (
    <section className="bg-black text-white py-24 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* Feature Block 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-400 block font-bold">
              05 / CRAFTSMANSHIP & TEXTILES
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-white font-syne tracking-tighter">
              {f1Heading}
            </h2>
            <p className="font-mono text-xs sm:text-sm text-zinc-400 leading-relaxed uppercase tracking-wider">
              {f1Text}
            </p>
            <button
              onClick={onExploreClick}
              className="inline-block bg-white text-black px-8 py-3.5 font-mono text-xs uppercase tracking-[0.2em] font-extrabold hover:bg-zinc-200 transition-colors border border-white"
            >
              DISCOVER CRAFTSMANSHIP
            </button>
          </div>
          <div className="lg:col-span-6">
            <div className="aspect-[4/3] bg-zinc-900 border-2 border-white/20 overflow-hidden relative shadow-2xl group">
              <img
                src={f1Image}
                alt={f1Heading}
                className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
            </div>
          </div>
        </div>

        {/* Feature Block 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="aspect-[4/3] bg-zinc-900 border-2 border-white/20 overflow-hidden relative shadow-2xl group">
              <img
                src={f2Image}
                alt={f2Heading}
                className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
            </div>
          </div>
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-400 block font-bold">
              06 / LOGISTICS & PACKAGING
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-white font-syne tracking-tighter">
              {f2Heading}
            </h2>
            <p className="font-mono text-xs sm:text-sm text-zinc-400 leading-relaxed uppercase tracking-wider">
              {f2Text}
            </p>
            <button
              onClick={onExploreClick}
              className="inline-block bg-white text-black px-8 py-3.5 font-mono text-xs uppercase tracking-[0.2em] font-extrabold hover:bg-zinc-200 transition-colors border border-white"
            >
              VIEW SHIPPING POLICY
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
