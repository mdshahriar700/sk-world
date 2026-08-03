import React from 'react';
import { Category } from '../types';
import { ArrowUpRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface CategoryQuickNavProps {
  categories: Category[];
  onSelectCategory: (slug: string) => void;
}

export const CategoryQuickNav: React.FC<CategoryQuickNavProps> = ({ categories, onSelectCategory }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section className={`py-12 sm:py-16 border-b transition-colors ${
      isDark ? 'bg-zinc-950 text-white border-white/10' : 'bg-stone-50 text-zinc-900 border-zinc-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 block font-bold mb-1">
              02 / EXPLORE BY CATEGORY
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight font-syne">
              COLLECTIONS INDEX
            </h2>
          </div>
          <span className={`hidden sm:inline-block font-mono text-xs uppercase tracking-widest border px-3 py-1 ${
            isDark ? 'border-white/10 text-zinc-400' : 'border-zinc-300 text-zinc-600'
          }`}>
            {categories.length} DIVISIONS
          </span>
        </div>

        {/* Category Cards Grid: 2 columns on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`group relative aspect-[3/4] overflow-hidden border hover:border-black transition-all text-left flex flex-col justify-between p-3.5 shadow-md ${
                isDark ? 'bg-zinc-900 border-white/10 hover:border-white' : 'bg-stone-200 border-zinc-300'
              }`}
            >
              {/* Background Image */}
              <img
                src={cat.image_url}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-110 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 opacity-70 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              {/* Top Index Number */}
              <span className="relative z-10 font-mono text-[9px] text-white bg-black/80 px-2 py-0.5 inline-block border border-white/20 self-start font-bold tracking-widest">
                0{cat.sort_order || cat.id}
              </span>

              {/* Title & Arrow */}
              <div className="relative z-10 flex items-end justify-between w-full">
                <span className="text-sm sm:text-lg font-black text-white uppercase tracking-tight font-syne drop-shadow-md group-hover:translate-x-1 transition-transform">
                  {cat.name}
                </span>
                <div className="w-6 h-6 bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight size={14} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

