import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Category, SiteSettings } from '../types';

interface NavbarProps {
  categories: Category[];
  settings: Partial<SiteSettings>;
  activeCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
  onOpenAdmin: () => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  categories,
  settings,
  activeCategory,
  onSelectCategory,
  onOpenAdmin,
  onOpenSearch,
}) => {
  const { setIsCartOpen, cartCount } = useCart();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logoText = settings.logo_text || 'SK WORL';

  return (
    <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-white/10 transition-all text-white">
      {/* Top Announcement Bar */}
      <div className="bg-zinc-950 text-white text-[10px] font-mono tracking-[0.25em] py-2 px-4 text-center border-b border-white/10 uppercase font-bold">
        <span className="inline-block">
          SK WORL • MILANO EDITION 2026 • FREE WORLDWIDE EXPRESS SHIPPING ON ORDERS OVER $150
        </span>
      </div>

      {/* Main Navbar Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-zinc-400"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <button
            onClick={() => onSelectCategory(null)}
            className="flex items-center space-x-3 group text-left"
          >
            <div className="w-9 h-9 bg-white text-black flex items-center justify-center font-extrabold font-mono text-lg border border-white group-hover:bg-zinc-200 transition-colors">
              SK
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tighter text-white font-syne uppercase">
                {logoText}
              </span>
              <span className="text-[9px] font-mono tracking-[0.3em] text-zinc-400 uppercase -mt-1 font-bold">
                MILANO EST. 2026
              </span>
            </div>
          </button>
        </div>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-bold tracking-[0.15em] uppercase font-mono">
          <button
            onClick={() => onSelectCategory(null)}
            className={`transition-colors py-1 border-b-2 ${
              activeCategory === null
                ? 'border-white text-white font-black'
                : 'border-transparent text-zinc-400 hover:text-white hover:border-white/50'
            }`}
          >
            ALL COLLECTIONS
          </button>

          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`transition-colors py-1 border-b-2 ${
                activeCategory === cat.slug
                  ? 'border-white text-white font-black'
                  : 'border-transparent text-zinc-400 hover:text-white hover:border-white/50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </nav>

        {/* Right Utility Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSearch}
            className="p-2 text-zinc-300 hover:text-white transition-colors border border-white/10 hover:border-white/30"
            title="Search Products"
          >
            <Search size={18} />
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-white text-black hover:bg-zinc-200 transition-colors flex items-center space-x-2 px-3.5 py-2 font-mono text-xs font-extrabold uppercase border border-white"
          >
            <ShoppingBag size={18} />
            <span>BAG ({cartCount})</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-zinc-950 px-4 pt-4 pb-6 space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 mb-2 font-bold">
            01 / NAVIGATION
          </div>
          <button
            onClick={() => {
              onSelectCategory(null);
              setMobileMenuOpen(false);
            }}
            className={`block w-full text-left py-2 font-syne font-bold text-sm tracking-wider uppercase border-b border-white/10 ${
              activeCategory === null ? 'text-white' : 'text-zinc-400'
            }`}
          >
            All Collections
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.slug);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left py-2 text-sm font-syne tracking-wider uppercase border-b border-white/10 ${
                activeCategory === cat.slug ? 'text-white font-bold' : 'text-zinc-400'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
