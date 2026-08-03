import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Category, SiteSettings } from '../types';
import { useTheme } from '../context/ThemeContext';

interface HeroProps {
  settings: Partial<SiteSettings>;
  categories?: Category[];
  onSelectCategory?: (slug: string | null) => void;
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  categories = [],
  onSelectCategory,
  onExploreClick,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const headline = settings.hero_headline || 'GEAR UP IN SK WORL MILANO';
  const subheading =
    settings.hero_subheading ||
    'MILANO SUMMER & WINTER COLLECTION 2026. ELEVATED STREETWEAR & ESSENTIAL CUTS DESIGNED IN BANGLADESH.';
  const ctaText = settings.hero_cta_text || 'EXPLORE COLLECTIONS';

  // Parse multiple hero images from settings.hero_images or fallback
  const heroImagesList = useMemo(() => {
    if (settings.hero_images) {
      try {
        const parsed = JSON.parse(settings.hero_images);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter((u) => typeof u === 'string' && u.trim().length > 0);
          if (valid.length > 0) return valid;
        }
      } catch (e) {
        const split = settings.hero_images.split(',').map((s) => s.trim()).filter(Boolean);
        if (split.length > 0) return split;
      }
    }
    if (settings.hero_image_url) {
      return [settings.hero_image_url];
    }
    return [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1600',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1600',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1600',
    ];
  }, [settings.hero_images, settings.hero_image_url]);

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play interval for smooth slider
  useEffect(() => {
    if (heroImagesList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImagesList.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImagesList.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + heroImagesList.length) % heroImagesList.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % heroImagesList.length);
  };

  return (
    <section className={`relative overflow-hidden border-b transition-colors py-6 sm:py-12 lg:py-20 ${
      isDark ? 'bg-black text-white border-white/10' : 'bg-stone-100 text-zinc-900 border-zinc-200'
    }`}>
      {/* Background Giant Watermark Typography - hidden on small screen to prevent overflow */}
      <div className={`hidden sm:block absolute top-1/2 left-0 -translate-y-1/2 font-syne font-black text-[150px] sm:text-[200px] md:text-[280px] leading-none pointer-events-none select-none whitespace-nowrap ${
        isDark ? 'text-white/[0.03]' : 'text-black/[0.04]'
      }`}>
        MILANO 2026
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Mobile View Layout (Centered 16:9 Image, CTA below, then Category shortcuts) */}
        <div className="block lg:hidden space-y-5 text-center">
          <div className="relative w-full max-w-sm mx-auto">
            <div className={`relative aspect-[16/9] overflow-hidden border-2 shadow-xl mx-auto group ${
              isDark ? 'bg-zinc-900 border-white/20' : 'bg-stone-200 border-zinc-300'
            }`}>
              {/* Stacked Images for Smooth Crossfade Slide */}
              {heroImagesList.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                    idx === currentSlide
                      ? 'opacity-100 scale-100 z-10'
                      : 'opacity-0 scale-105 z-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`SK WORL Fashion Hero ${idx + 1}`}
                    className="w-full h-full object-cover object-center filter contrast-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              ))}

              {/* Slider Prev / Next Controls for Mobile */}
              {heroImagesList.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    aria-label="Previous Slide"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md border border-white/20 hover:bg-black transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next Slide"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md border border-white/20 hover:bg-black transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>

                  {/* Indicator Dots */}
                  <div className="absolute top-2 right-2 z-20 flex space-x-1.5 bg-black/70 px-2 py-1 rounded-full border border-white/20 backdrop-blur-md">
                    {heroImagesList.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        onClick={() => setCurrentSlide(dotIdx)}
                        aria-label={`Go to slide ${dotIdx + 1}`}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          dotIdx === currentSlide ? 'bg-white w-3' : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              <div className={`absolute bottom-2.5 left-2.5 right-2.5 p-2 border backdrop-blur-md flex items-center justify-between text-left z-20 ${
                isDark ? 'bg-black/90 border-white/20 text-white' : 'bg-white/95 border-zinc-300 text-zinc-900'
              }`}>
                <div>
                  <span className="block font-mono text-[9px] text-zinc-400 uppercase tracking-widest font-bold">SK MILANO BANGLADESH</span>
                  <span className="font-extrabold text-xs uppercase tracking-wider font-syne">2026 EDITION COLLECTION</span>
                </div>
                {heroImagesList.length > 1 && (
                  <span className="font-mono text-[10px] font-bold text-zinc-400">
                    0{currentSlide + 1} / 0{heroImagesList.length}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-center pt-1 space-y-3">
            <button
              onClick={onExploreClick}
              className={`w-full max-w-sm inline-flex items-center justify-center space-x-3 px-8 py-3.5 font-mono text-xs uppercase tracking-widest font-black transition-all border shadow-lg ${
                isDark ? 'bg-white text-black border-white hover:bg-zinc-200' : 'bg-black text-white border-black hover:bg-zinc-800'
              }`}
            >
              <span>{ctaText}</span>
              <ArrowUpRight size={18} />
            </button>

            {categories.length > 0 && (
              <div className="flex flex-wrap justify-center items-center gap-2 max-w-sm mx-auto pt-1">
                {categories.slice(0, 4).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory?.(cat.slug)}
                    className={`px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                      isDark
                        ? 'bg-zinc-900 text-zinc-300 border-white/10 hover:border-white hover:text-white'
                        : 'bg-stone-100 text-zinc-700 border-zinc-300 hover:border-black hover:text-black'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop View Layout (Full headline, subheading, CTA and side slider image) */}
        <div className="hidden lg:grid grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="col-span-7 space-y-8 pt-2">
            <div className={`inline-flex items-center space-x-2.5 px-3 py-1 font-mono text-xs tracking-widest uppercase font-bold border ${
              isDark ? 'bg-zinc-900 border-white/20 text-zinc-300' : 'bg-white border-zinc-300 text-zinc-800'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>BANGLADESH DISPATCH • 2026 EDITION</span>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.9] font-syne">
              {headline}
            </h1>

            <p className={`text-sm md:text-base max-w-xl font-mono leading-relaxed uppercase tracking-wider ${
              isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}>
              {subheading}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-6">
              <button
                onClick={onExploreClick}
                className={`group relative inline-flex items-center space-x-3 px-9 py-4 font-mono text-xs uppercase tracking-widest font-black transition-all border shadow-lg ${
                  isDark ? 'bg-white text-black border-white hover:bg-zinc-200' : 'bg-black text-white border-black hover:bg-zinc-800'
                }`}
              >
                <span>{ctaText}</span>
                <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>

              <div className={`flex items-center space-x-3 font-mono text-xs uppercase tracking-widest border-l pl-6 py-2 ${
                isDark ? 'text-zinc-500 border-white/10' : 'text-zinc-500 border-zinc-300'
              }`}>
                <span className={`font-black text-base font-syne ${isDark ? 'text-white' : 'text-black'}`}>
                  0{currentSlide + 1} / 0{heroImagesList.length}
                </span>
                <span>FREE & FAST DISPATCH IN BD</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Banner & Slider */}
          <div className="col-span-5 relative">
            <div className={`relative aspect-[3/4] overflow-hidden border-2 shadow-2xl group transition-colors ${
              isDark ? 'bg-zinc-900 border-white/20' : 'bg-stone-200 border-zinc-300'
            }`}>
              {/* Stacked Images for Smooth Crossfade Slide */}
              {heroImagesList.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                    idx === currentSlide
                      ? 'opacity-100 scale-100 z-10'
                      : 'opacity-0 scale-105 z-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`SK WORL Fashion Hero ${idx + 1}`}
                    className="w-full h-full object-cover object-top filter grayscale contrast-110 group-hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
              ))}

              {/* Desktop Slider Controls */}
              {heroImagesList.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    aria-label="Previous Slide"
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 hover:bg-black transition-all shadow-lg"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next Slide"
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 hover:bg-black transition-all shadow-lg"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Indicator Pills / Dots */}
                  <div className="absolute top-4 right-4 z-20 flex space-x-1.5 bg-black/70 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
                    {heroImagesList.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        onClick={() => setCurrentSlide(dotIdx)}
                        aria-label={`Go to slide ${dotIdx + 1}`}
                        className={`h-2 rounded-full transition-all ${
                          dotIdx === currentSlide ? 'bg-white w-5' : 'bg-white/40 w-2 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Bottom Card Footer */}
              <div className={`absolute bottom-4 left-4 right-4 p-4 border backdrop-blur-md flex items-center justify-between z-20 ${
                isDark ? 'bg-black/90 border-white/20 text-white' : 'bg-white/95 border-zinc-300 text-zinc-900'
              }`}>
                <div>
                  <span className="block font-mono text-[9px] text-zinc-400 uppercase tracking-widest font-bold">
                    0{currentSlide + 1} / BANGLADESH DROP
                  </span>
                  <span className="font-extrabold text-sm uppercase tracking-wider font-syne">SK MILANO OVERSIZED CUT</span>
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

