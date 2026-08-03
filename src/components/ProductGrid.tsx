import React, { useState } from 'react';
import { Product, Category } from '../types';
import { ProductCard } from './ProductCard';
import { Filter } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ProductGridProps {
  title: string;
  subtitle?: string;
  products: Product[];
  categories: Category[];
  selectedCategorySlug: string | null;
  onSelectCategory: (slug: string | null) => void;
  onQuickView: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  title,
  subtitle,
  products,
  categories,
  selectedCategorySlug,
  onSelectCategory,
  onQuickView,
}) => {
  const { theme } = useTheme();
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');

  let filtered = [...products];
  if (selectedCategorySlug) {
    const catObj = categories.find((c) => c.slug === selectedCategorySlug);
    if (catObj) {
      filtered = filtered.filter((p) => p.category_id === catObj.id);
    }
  }

  if (sortBy === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else {
    filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }

  const isDark = theme === 'dark';

  return (
    <section className={`py-12 sm:py-20 border-b transition-colors ${
      isDark ? 'bg-black text-white border-white/10' : 'bg-stone-50 text-zinc-900 border-zinc-200'
    }`}>
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div>
            <span className={`font-mono text-[10px] uppercase tracking-[0.3em] block font-extrabold mb-1 ${
              isDark ? 'text-zinc-400' : 'text-zinc-500'
            }`}>
              03 / MILANO CATALOGUE
            </span>
            <h2 className="text-3xl sm:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-none font-syne">
              {title}
            </h2>
            {subtitle && (
              <p className={`text-xs sm:text-sm font-mono uppercase max-w-xl mt-2 tracking-wider ${
                isDark ? 'text-zinc-400' : 'text-zinc-600'
              }`}>
                {subtitle}
              </p>
            )}
          </div>

          {/* Sort Controls */}
          <div className={`flex items-center space-x-2 sm:space-x-3 self-start md:self-auto border p-2 ${
            isDark ? 'bg-zinc-950 border-white/10' : 'bg-white border-zinc-300'
          }`}>
            <span className={`text-[10px] sm:text-xs font-mono uppercase flex items-center space-x-1 tracking-wider font-extrabold ${
              isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}>
              <Filter size={14} />
              <span>SORT:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className={`border text-[10px] sm:text-xs font-mono uppercase py-1 px-2 sm:px-3 focus:outline-none cursor-pointer font-bold tracking-wider ${
                isDark ? 'bg-black border-white/20 text-white focus:border-white' : 'bg-stone-100 border-zinc-300 text-black focus:border-black'
              }`}
            >
              <option value="newest">NEWEST DROPS</option>
              <option value="price-low">PRICE: LOW TO HIGH</option>
              <option value="price-high">PRICE: HIGH TO LOW</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className={`flex flex-wrap items-center gap-1.5 sm:gap-2 mb-8 sm:mb-10 pb-3.5 border-b overflow-x-auto ${
          isDark ? 'border-white/10' : 'border-zinc-200'
        }`}>
          <button
            onClick={() => onSelectCategory(null)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 font-mono text-[10px] sm:text-xs uppercase tracking-wider transition-all border ${
              selectedCategorySlug === null
                ? isDark
                  ? 'bg-white text-black border-white font-black'
                  : 'bg-black text-white border-black font-black'
                : isDark
                ? 'bg-zinc-950 text-zinc-300 border-white/10 hover:border-white/50 hover:text-white'
                : 'bg-white text-zinc-700 border-zinc-200 hover:border-black hover:text-black'
            }`}
          >
            ALL PRODUCTS ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 font-mono text-[10px] sm:text-xs uppercase tracking-wider transition-all border ${
                  selectedCategorySlug === cat.slug
                    ? isDark
                      ? 'bg-white text-black border-white font-black'
                      : 'bg-black text-white border-black font-black'
                    : isDark
                    ? 'bg-zinc-950 text-zinc-300 border-white/10 hover:border-white/50 hover:text-white'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:border-black hover:text-black'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Product Grid - STRICTLY 2 COLUMNS ON MOBILE */}
        {filtered.length === 0 ? (
          <div className={`border p-10 sm:p-16 text-center space-y-4 ${
            isDark ? 'bg-zinc-950 border-white/10' : 'bg-white border-zinc-200'
          }`}>
            <h3 className="font-mono text-sm sm:text-base uppercase font-bold tracking-widest">NO PRODUCTS FOUND IN THIS CATEGORY</h3>
            <p className="text-xs font-mono text-zinc-400 uppercase">Try switching filters or view all products.</p>
            <button
              onClick={() => onSelectCategory(null)}
              className={`mt-4 inline-block px-6 py-3 font-mono text-xs uppercase tracking-widest font-black transition-colors ${
                isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'
              }`}
            >
              SHOW ALL COLLECTIONS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {filtered.map((prod) => (
              <ProductCard key={prod.id} product={prod} onQuickView={onQuickView} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

