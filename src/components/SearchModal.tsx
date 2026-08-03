import React, { useState } from 'react';
import { Search, X, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, products, onSelectProduct }) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const results = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()) ||
          (p.category_name && p.category_name.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md" />

      {/* Box */}
      <div className="relative w-full max-w-2xl bg-zinc-950 text-white border-2 border-white/20 shadow-2xl z-10 overflow-hidden">
        
        {/* Search Input Bar */}
        <div className="p-4 bg-black text-white flex items-center space-x-3 border-b border-white/10">
          <Search size={22} className="text-white" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH HOODIES, TEES, JACKETS, SWEATSHIRTS..."
            className="flex-1 bg-transparent text-white text-sm font-mono font-bold uppercase tracking-wider focus:outline-none placeholder:text-zinc-500"
          />
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {!query.trim() ? (
            <div className="text-center py-8 font-mono text-xs uppercase text-zinc-500 space-y-2">
              <Search size={32} className="mx-auto text-zinc-700" />
              <p className="tracking-wider">TYPE ANY PRODUCT NAME OR CATEGORY KEYWORD ABOVE</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 font-mono text-xs uppercase text-zinc-400 tracking-wider">
              NO MATCHING PRODUCTS FOUND FOR "{query.toUpperCase()}"
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {results.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    onSelectProduct(prod);
                    onClose();
                  }}
                  className="bg-black p-3.5 border border-white/10 hover:border-white transition-all flex items-center space-x-4 cursor-pointer group"
                >
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="w-16 h-16 object-cover bg-zinc-900 border border-white/10 filter contrast-110"
                  />
                  <div className="flex-1">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase block font-bold">
                      {prod.category_name || 'COLLECTION'}
                    </span>
                    <h4 className="font-extrabold text-sm uppercase text-white font-syne group-hover:underline">{prod.name}</h4>
                    <span className="font-mono text-xs font-extrabold text-white">${prod.price.toFixed(2)}</span>
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
