import React, { useState, useMemo } from 'react';
import { Product, Category } from '../types';
import { formatPrice } from '../lib/format';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import {
  SlidersHorizontal,
  Search,
  Grid3X3,
  LayoutGrid,
  List,
  ArrowUpDown,
  ShoppingBag,
  Eye,
  X,
  Sparkles,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShopPageProps {
  products: Product[];
  categories: Category[];
  selectedCategorySlug: string | null;
  onSelectCategory: (slug: string | null) => void;
  onSelectProduct: (product: Product) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  categories,
  selectedCategorySlug,
  onSelectCategory,
  onSelectProduct,
}) => {
  const { theme } = useTheme();
  const { addToCart } = useCart();
  const isDark = theme === 'dark';

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'trending'>('newest');
  const [gridCols, setGridCols] = useState<3 | 4 | 2>(3);
  const [addedProductId, setAddedProductId] = useState<number | null>(null);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category match
      if (selectedCategorySlug) {
        const cat = categories.find((c) => c.slug === selectedCategorySlug);
        if (cat && p.category_id !== cat.id) return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = (p.description || '').toLowerCase().includes(q);
        const matchCat = (p.category_name || '').toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCat) return false;
      }
      // Stock match
      if (inStockOnly && p.stock_quantity <= 0) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'trending') return (b.is_trending ? 1 : 0) - (a.is_trending ? 1 : 0);
      return (b.id || 0) - (a.id || 0); // newest
    });
  }, [products, categories, selectedCategorySlug, searchQuery, inStockOnly, sortBy]);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.stock_quantity <= 0) return;
    const defaultSize = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes[0] : 'M';
    const defaultColor = Array.isArray(product.colors) && product.colors.length > 0 ? product.colors[0] : 'Black';
    addToCart(product, defaultSize, defaultColor, 1);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1800);
  };

  const currentCategoryName = useMemo(() => {
    if (!selectedCategorySlug) return 'ALL COLLECTIONS';
    const found = categories.find((c) => c.slug === selectedCategorySlug);
    return found ? found.name.toUpperCase() : 'COLLECTION';
  }, [selectedCategorySlug, categories]);

  return (
    <div className={`w-full min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors ${
      isDark ? 'text-white' : 'text-zinc-900'
    }`}>
      {/* Page Header */}
      <div className="border-b pb-6 sm:pb-8 mb-8 border-current/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-zinc-400 mb-2">
              <span>SK WORLD</span>
              <span>/</span>
              <span>BANGLADESH SHOP</span>
              <span>/</span>
              <span className={isDark ? 'text-white font-extrabold' : 'text-black font-extrabold'}>
                {currentCategoryName}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight font-syne">
              {currentCategoryName}
            </h1>
            <p className={`font-mono text-xs mt-2 tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              PREMIUM BANGLADESH STREETWEAR • HEAVYWEIGHT COTTON DROPS • COD NATIONWIDE
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-black uppercase px-3 py-1.5 border border-current/20 bg-current/5">
              {filteredProducts.length} PRODUCTS
            </span>
          </div>
        </div>
      </div>

      {/* Category Pills Nav */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-4 py-2 font-mono text-xs uppercase font-extrabold border transition-all shrink-0 ${
            selectedCategorySlug === null
              ? isDark
                ? 'bg-white text-black border-white shadow-md'
                : 'bg-black text-white border-black shadow-md'
              : isDark
              ? 'bg-zinc-950 text-zinc-400 border-white/10 hover:border-white hover:text-white'
              : 'bg-white text-zinc-600 border-zinc-300 hover:border-black hover:text-black'
          }`}
        >
          ALL ({products.length})
        </button>
        {categories.map((cat) => {
          const count = products.filter((p) => p.category_id === cat.id).length;
          const isSelected = selectedCategorySlug === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`px-4 py-2 font-mono text-xs uppercase font-extrabold border transition-all shrink-0 ${
                isSelected
                  ? isDark
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-black text-white border-black shadow-md'
                  : isDark
                  ? 'bg-zinc-950 text-zinc-400 border-white/10 hover:border-white hover:text-white'
                  : 'bg-white text-zinc-600 border-zinc-300 hover:border-black hover:text-black'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Filter & Toolbar Controls */}
      <div className={`p-4 border mb-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-center ${
        isDark ? 'bg-zinc-950 border-white/10' : 'bg-stone-100 border-zinc-300'
      }`}>
        {/* Search Bar */}
        <div className="md:col-span-5 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name, fit, or color..."
            className={`w-full pl-9 pr-8 py-2 font-mono text-xs border transition-colors outline-none ${
              isDark
                ? 'bg-black border-white/20 text-white placeholder-zinc-500 focus:border-white'
                : 'bg-white border-zinc-300 text-black placeholder-zinc-400 focus:border-black'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="md:col-span-4 flex items-center space-x-2">
          <ArrowUpDown size={14} className="text-zinc-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className={`w-full py-2 px-3 font-mono text-xs uppercase font-bold border outline-none cursor-pointer ${
              isDark
                ? 'bg-black border-white/20 text-white focus:border-white'
                : 'bg-white border-zinc-300 text-black focus:border-black'
            }`}
          >
            <option value="newest">SORT BY: NEWEST ARRIVALS</option>
            <option value="price_low">SORT BY: PRICE (LOW TO HIGH)</option>
            <option value="price_high">SORT BY: PRICE (HIGH TO LOW)</option>
            <option value="trending">SORT BY: POPULAR / TRENDING</option>
          </select>
        </div>

        {/* Stock Check & Layout Options */}
        <div className="md:col-span-3 flex items-center justify-between md:justify-end space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer select-none font-mono text-xs uppercase font-bold">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="accent-black w-4 h-4 cursor-pointer"
            />
            <span>IN STOCK ONLY</span>
          </label>

          {/* Grid Layout Toggles (Desktop) */}
          <div className="hidden sm:flex items-center space-x-1 border border-current/20 p-0.5">
            <button
              onClick={() => setGridCols(2)}
              className={`p-1.5 transition-colors ${
                gridCols === 2 ? (isDark ? 'bg-white text-black' : 'bg-black text-white') : 'text-zinc-400'
              }`}
              title="2 Columns Grid"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setGridCols(3)}
              className={`p-1.5 transition-colors ${
                gridCols === 3 ? (isDark ? 'bg-white text-black' : 'bg-black text-white') : 'text-zinc-400'
              }`}
              title="3 Columns Grid"
            >
              <Grid3X3 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(searchQuery || inStockOnly || selectedCategorySlug) && (
        <div className="flex flex-wrap items-center gap-2 mb-6 font-mono text-xs">
          <span className="text-zinc-400 uppercase font-bold">Active Filters:</span>
          {selectedCategorySlug && (
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-500 border border-amber-500/40 uppercase font-bold flex items-center space-x-1">
              <span>Category: {currentCategoryName}</span>
              <button onClick={() => onSelectCategory(null)}><X size={12} /></button>
            </span>
          )}
          {searchQuery && (
            <span className="px-2.5 py-1 bg-sky-500/20 text-sky-400 border border-sky-500/40 uppercase font-bold flex items-center space-x-1">
              <span>Search: "{searchQuery}"</span>
              <button onClick={() => setSearchQuery('')}><X size={12} /></button>
            </span>
          )}
          {inStockOnly && (
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase font-bold flex items-center space-x-1">
              <span>In Stock Only</span>
              <button onClick={() => setInStockOnly(false)}><X size={12} /></button>
            </span>
          )}
          <button
            onClick={() => {
              onSelectCategory(null);
              setSearchQuery('');
              setInStockOnly(false);
            }}
            className="text-xs text-red-500 hover:underline uppercase font-bold ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Products Display Grid */}
      {filteredProducts.length === 0 ? (
        <div className={`p-12 text-center border font-mono space-y-4 my-12 ${
          isDark ? 'bg-zinc-950 border-white/10' : 'bg-white border-zinc-200'
        }`}>
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
            <Search size={28} />
          </div>
          <h3 className="text-xl font-bold uppercase tracking-tight">NO PRODUCTS MATCH YOUR FILTERS</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Try adjusting your search terms or selecting a different category from above.
          </p>
          <button
            onClick={() => {
              onSelectCategory(null);
              setSearchQuery('');
              setInStockOnly(false);
            }}
            className={`px-6 py-2.5 font-mono text-xs font-black uppercase tracking-widest border border-current ${
              isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'
            }`}
          >
            RESET ALL FILTERS
          </button>
        </div>
      ) : (
        <div className={`grid gap-4 sm:gap-6 ${
          gridCols === 2
            ? 'grid-cols-1 sm:grid-cols-2'
            : gridCols === 4
            ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
            : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3'
        }`}>
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock_quantity <= 0;
            const images = Array.isArray(product.images) && product.images.length > 0
              ? product.images
              : ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800'];
            const mainImg = images[0];
            const secondaryImg = images[1] || mainImg;
            const isJustAdded = addedProductId === product.id;

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className={`group relative border transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                  isDark
                    ? 'bg-zinc-950 border-white/10 hover:border-white/40'
                    : 'bg-white border-zinc-200 hover:border-zinc-400 hover:shadow-xl'
                }`}
              >
                {/* Image Container with Hover Swap */}
                <div className="relative aspect-[3/4] overflow-hidden w-full bg-stone-100">
                  <img
                    src={mainImg}
                    alt={product.name}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  {secondaryImg !== mainImg && (
                    <img
                      src={secondaryImg}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover object-top opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    />
                  )}

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                    {product.is_trending && (
                      <span className="bg-amber-400 text-black font-mono text-[9px] font-black uppercase px-2 py-0.5 tracking-wider shadow">
                        TRENDING
                      </span>
                    )}
                    {isOutOfStock ? (
                      <span className="bg-red-600 text-white font-mono text-[9px] font-black uppercase px-2 py-0.5 tracking-wider shadow">
                        OUT OF STOCK
                      </span>
                    ) : (
                      <span className="bg-emerald-600 text-white font-mono text-[9px] font-black uppercase px-2 py-0.5 tracking-wider shadow">
                        IN STOCK
                      </span>
                    )}
                  </div>

                  {/* Quick Action Overlay on Hover */}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 z-20">
                    <button
                      onClick={(e) => handleQuickAdd(e, product)}
                      disabled={isOutOfStock}
                      className={`flex-1 py-2 font-mono text-[10px] font-black uppercase tracking-wider flex items-center justify-center space-x-1 transition-all ${
                        isOutOfStock
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          : isJustAdded
                          ? 'bg-emerald-500 text-black'
                          : 'bg-white text-black hover:bg-zinc-200'
                      }`}
                    >
                      {isJustAdded ? <Check size={13} /> : <ShoppingBag size={13} />}
                      <span>{isJustAdded ? 'ADDED!' : 'QUICK ADD'}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(product);
                      }}
                      className="p-2 bg-black/80 text-white border border-white/40 hover:bg-white hover:text-black transition-colors"
                      title="Inspect Product Details"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>

                {/* Product Content info */}
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-bold block mb-1">
                      {product.category_name || 'COLLECTION'}
                    </span>
                    <h3 className="font-syne text-sm sm:text-base font-bold uppercase tracking-tight group-hover:underline line-clamp-1">
                      {product.name}
                    </h3>
                  </div>

                  <div className="mt-3 flex items-center justify-between font-mono">
                    <span className="text-sm sm:text-base font-black">
                      {formatPrice(product.price)}
                    </span>
                    {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">
                        {product.sizes.length} SIZES
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
