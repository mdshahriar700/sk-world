import React, { useState } from 'react';
import { Product, Category } from '../types';
import { ProductCard } from './ProductCard';
import { Filter } from 'lucide-react';

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

  return (
    <section className="bg-black text-white py-20 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-400 block font-bold mb-1">
              03 / MILANO CATALOGUE
            </span>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter uppercase leading-none font-syne">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-zinc-400 font-mono uppercase max-w-xl mt-3 tracking-wider">
                {subtitle}
              </p>
            )}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center space-x-3 self-start md:self-auto border border-white/10 p-2 bg-zinc-950">
            <span className="text-xs font-mono uppercase text-zinc-400 flex items-center space-x-1 tracking-wider font-bold">
              <Filter size={14} />
              <span>SORT:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-black border border-white/20 text-xs font-mono uppercase py-1.5 px-3 text-white focus:outline-none focus:border-white cursor-pointer font-bold tracking-wider"
            >
              <option value="newest">NEWEST DROPS</option>
              <option value="price-low">PRICE: LOW TO HIGH</option>
              <option value="price-high">PRICE: HIGH TO LOW</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-white/10 overflow-x-auto">
          <button
            onClick={() => onSelectCategory(null)}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] transition-all border ${
              selectedCategorySlug === null
                ? 'bg-white text-black border-white font-extrabold'
                : 'bg-zinc-950 text-zinc-300 border-white/10 hover:border-white/50 hover:text-white'
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
                className={`px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] transition-all border ${
                  selectedCategorySlug === cat.slug
                    ? 'bg-white text-black border-white font-extrabold'
                    : 'bg-zinc-950 text-zinc-300 border-white/10 hover:border-white/50 hover:text-white'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        {filtered.length === 0 ? (
          <div className="bg-zinc-950 border border-white/10 p-16 text-center space-y-4">
            <h3 className="font-mono text-base uppercase font-bold text-white tracking-widest">NO PRODUCTS FOUND IN THIS CATEGORY</h3>
            <p className="text-xs font-mono text-zinc-400 uppercase">Try switching filters or view all products.</p>
            <button
              onClick={() => onSelectCategory(null)}
              className="mt-4 inline-block bg-white text-black px-8 py-3.5 font-mono text-xs uppercase tracking-[0.2em] font-extrabold hover:bg-zinc-200 transition-colors"
            >
              SHOW ALL COLLECTIONS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((prod) => (
              <ProductCard key={prod.id} product={prod} onQuickView={onQuickView} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
