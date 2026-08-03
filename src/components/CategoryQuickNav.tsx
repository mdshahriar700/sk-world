import React from 'react';
import { Category } from '../types';
import { ArrowUpRight } from 'lucide-react';

interface CategoryQuickNavProps {
  categories: Category[];
  onSelectCategory: (slug: string) => void;
}

export const CategoryQuickNav: React.FC<CategoryQuickNavProps> = ({ categories, onSelectCategory }) => {
  return (
    <section className="bg-zinc-950 py-16 border-b border-white/10 overflow-x-auto text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-400 block font-bold mb-1">
              02 / EXPLORE BY CATEGORY
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter font-syne">
              COLLECTIONS INDEX
            </h2>
          </div>
          <span className="hidden sm:inline-block font-mono text-xs text-zinc-500 uppercase tracking-widest border border-white/10 px-3 py-1">
            {categories.length} ARCHIVE DIVISIONS
          </span>
        </div>

        {/* Category Cards Horizontal Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className="group relative aspect-[3/4] overflow-hidden bg-zinc-900 border border-white/10 hover:border-white transition-all text-left flex flex-col justify-between p-4 shadow-xl"
            >
              {/* Background Image with High-Contrast Grayscale Effect */}
              <img
                src={cat.image_url}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 opacity-60 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />

              {/* Top Index Number */}
              <span className="relative z-10 font-mono text-[10px] text-white/90 bg-black/80 px-2 py-1 inline-block border border-white/20 self-start font-bold tracking-widest">
                0{cat.sort_order || cat.id}
              </span>

              {/* Bottom Vertical / Wide Text Title */}
              <div className="relative z-10 flex items-end justify-between w-full">
                <span className="text-lg sm:text-xl font-black text-white uppercase tracking-tight font-syne drop-shadow-lg group-hover:translate-x-1 transition-transform">
                  {cat.name}
                </span>
                <div className="w-7 h-7 bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight size={16} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
