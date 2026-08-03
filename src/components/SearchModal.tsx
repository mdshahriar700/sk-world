import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../lib/format';
import { useTheme } from '../context/ThemeContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, products, onSelectProduct }) => {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const results = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()) ||
          (p.category_name && p.category_name.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-3 sm:px-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md" />

      {/* Box */}
      <div className={`relative w-full max-w-2xl border-2 shadow-2xl z-10 overflow-hidden transition-colors ${
        isDark ? 'bg-zinc-950 text-white border-white/20' : 'bg-white text-zinc-900 border-zinc-300'
      }`}>
        
        {/* Search Input Bar */}
        <div className={`p-4 flex items-center space-x-3 border-b ${
          isDark ? 'bg-black text-white border-white/10' : 'bg-stone-50 text-black border-zinc-200'
        }`}>
          <Search size={20} className="text-zinc-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH HOODIES, TEES, JACKETS, SWEATSHIRTS..."
            className="flex-1 bg-transparent text-sm font-mono font-bold uppercase tracking-wider focus:outline-none placeholder:text-zinc-400"
          />
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-black">
            <X size={20} />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-3">
          {!query.trim() ? (
            <div className="text-center py-8 font-mono text-xs uppercase text-zinc-400 space-y-2">
              <Search size={28} className="mx-auto text-zinc-500" />
              <p className="tracking-wider">TYPE ANY PRODUCT NAME OR CATEGORY KEYWORD ABOVE</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 font-mono text-xs uppercase text-zinc-400 tracking-wider">
              NO MATCHING PRODUCTS FOUND FOR "{query.toUpperCase()}"
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {results.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    onSelectProduct(prod);
                    onClose();
                  }}
                  className={`p-3 border flex items-center space-x-3 cursor-pointer group transition-all ${
                    isDark ? 'bg-black border-white/10 hover:border-white' : 'bg-stone-50 border-zinc-200 hover:border-black'
                  }`}
                >
                  <img
                    src={Array.isArray(prod.images) ? prod.images[0] : ''}
                    alt={prod.name}
                    className="w-14 h-14 object-cover bg-stone-200 border border-zinc-300 filter contrast-105"
                  />
                  <div className="flex-1">
                    <span className="text-[9px] font-mono text-zinc-400 uppercase block font-bold">
                      {prod.category_name || 'COLLECTION'}
                    </span>
                    <h4 className="font-extrabold text-xs uppercase font-syne group-hover:underline">{prod.name}</h4>
                    <span className="font-mono text-xs font-black">{formatPrice(prod.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

