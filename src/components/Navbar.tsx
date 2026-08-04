import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X, Sun, Moon, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Category, SiteSettings } from '../types';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  categories: Category[];
  settings: Partial<SiteSettings>;
  activeCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
  onOpenAdmin: () => void;
  onOpenSearch: () => void;
  onOpenOrderTracking?: () => void;
  onOpenShop?: () => void;
  isShopActive?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  categories,
  settings,
  activeCategory,
  onSelectCategory,
  onOpenSearch,
  onOpenOrderTracking,
  onOpenShop,
  isShopActive,
}) => {
  const { setIsCartOpen, cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logoText = settings.logo_text || 'SK WORL';
  const isDark = theme === 'dark';
  const topAnnouncementEnabled = settings.top_announcement_enabled !== 'false';
  const topAnnouncementText =
    settings.top_announcement_text ||
    'SK WORL • BANGLADESH EDITION 2026 • CASH ON DELIVERY NATIONWIDE • FREE EXPRESS SHIPPING OVER ৳2,500';

  return (
    <header className={`sticky top-0 left-0 right-0 z-[100] w-full backdrop-blur-md border-b transition-all shadow-md ${
      isDark
        ? 'bg-black/95 border-white/10 text-white'
        : 'bg-white/95 border-zinc-200 text-zinc-900 shadow-sm'
    }`}>
      {/* Top Announcement Bar */}
      {topAnnouncementEnabled && (
        <div className={`text-[10px] font-mono tracking-[0.2em] py-1.5 px-4 text-center border-b uppercase font-bold transition-colors ${
          isDark ? 'bg-zinc-950 text-zinc-300 border-white/10' : 'bg-stone-100 text-zinc-700 border-zinc-200'
        }`}>
          <span className="inline-block truncate">
            {topAnnouncementText}
          </span>
        </div>
      )}

      {/* Main Navbar Container */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Left Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-1.5 transition-colors ${
              isDark ? 'text-white hover:text-zinc-400' : 'text-zinc-800 hover:text-black'
            }`}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <button
            onClick={() => onSelectCategory(null)}
            className="flex items-center space-x-2 sm:space-x-3 group text-left"
          >
            {settings.site_logo_url ? (
              <img
                src={settings.site_logo_url}
                alt="Brand Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-lg"
              />
            ) : (
              <div className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center font-extrabold font-mono text-base sm:text-lg border transition-colors ${
                isDark
                  ? 'bg-white text-black border-white group-hover:bg-zinc-200'
                  : 'bg-black text-white border-black group-hover:bg-zinc-800'
              }`}>
                SK
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tighter uppercase font-syne leading-none">
                {logoText}
              </span>
              <span className={`text-[8px] sm:text-[9px] font-mono tracking-[0.25em] uppercase font-bold mt-0.5 ${
                isDark ? 'text-zinc-400' : 'text-zinc-500'
              }`}>
                BANGLADESH
              </span>
            </div>
          </button>
        </div>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 text-xs font-bold tracking-widest uppercase font-mono">
          {onOpenShop && (
            <button
              onClick={onOpenShop}
              className={`transition-colors py-1 border-b-2 font-black ${
                isShopActive
                  ? isDark ? 'border-white text-white' : 'border-black text-black'
                  : isDark ? 'border-transparent text-amber-400 hover:text-white' : 'border-transparent text-amber-600 hover:text-black'
              }`}
            >
              SHOP PAGE
            </button>
          )}

          <button
            onClick={() => onSelectCategory(null)}
            className={`transition-colors py-1 border-b-2 ${
              activeCategory === null && !isShopActive
                ? isDark ? 'border-white text-white font-black' : 'border-black text-black font-black'
                : isDark ? 'border-transparent text-zinc-400 hover:text-white' : 'border-transparent text-zinc-500 hover:text-black'
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
                  ? isDark ? 'border-white text-white font-black' : 'border-black text-black font-black'
                  : isDark ? 'border-transparent text-zinc-400 hover:text-white' : 'border-transparent text-zinc-500 hover:text-black'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </nav>

        {/* Right Utility Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Track Order Button */}
          {onOpenOrderTracking && (
            <button
              onClick={onOpenOrderTracking}
              className={`flex items-center space-x-1.5 p-1.5 sm:px-3 sm:py-2 border transition-all text-xs font-mono font-bold uppercase ${
                isDark
                  ? 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/40'
                  : 'text-emerald-700 border-emerald-600/30 bg-emerald-50/50 hover:bg-emerald-100/80'
              }`}
              title="Track Order Status"
            >
              <Truck size={16} />
              <span className="hidden lg:inline">TRACK ORDER</span>
            </button>
          )}

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 sm:p-2 border transition-all ${
              isDark
                ? 'bg-zinc-950 text-amber-400 border-white/20 hover:border-white/50'
                : 'bg-stone-100 text-zinc-800 border-zinc-300 hover:border-black'
            }`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Search Button */}
          <button
            onClick={onOpenSearch}
            className={`p-1.5 sm:p-2 border transition-colors ${
              isDark
                ? 'text-zinc-300 hover:text-white border-white/10 hover:border-white/30'
                : 'text-zinc-700 hover:text-black border-zinc-200 hover:border-zinc-400'
            }`}
            title="Search Products"
          >
            <Search size={17} />
          </button>

          {/* Cart Bag Button (Desktop / Tablet) */}
          <button
            onClick={() => setIsCartOpen(true)}
            className={`hidden sm:flex relative transition-colors items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 font-mono text-xs font-extrabold uppercase border ${
              isDark
                ? 'bg-white text-black hover:bg-zinc-200 border-white'
                : 'bg-black text-white hover:bg-zinc-800 border-black'
            }`}
          >
            <ShoppingBag size={16} />
            <span className="font-mono text-xs font-black">
              BAG ({cartCount})
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-t px-4 pt-4 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-200 ${
          isDark ? 'bg-zinc-950 border-white/10 text-white' : 'bg-stone-50 border-zinc-200 text-zinc-900'
        }`}>
          <div className={`text-[9px] font-mono uppercase tracking-widest mb-2 font-bold ${
            isDark ? 'text-zinc-500' : 'text-zinc-400'
          }`}>
            01 / NAVIGATION
          </div>
          {onOpenShop && (
            <button
              onClick={() => {
                onOpenShop();
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left py-2 font-syne font-black text-sm tracking-wider uppercase border-b text-amber-500 ${
                isDark ? 'border-white/10' : 'border-zinc-200'
              }`}
            >
              ★ Full Shop Page & Filters
            </button>
          )}
          <button
            onClick={() => {
              onSelectCategory(null);
              setMobileMenuOpen(false);
            }}
            className={`block w-full text-left py-2 font-syne font-bold text-sm tracking-wider uppercase border-b ${
              isDark ? 'border-white/10' : 'border-zinc-200'
            } ${activeCategory === null ? 'font-black underline' : ''}`}
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
              className={`block w-full text-left py-2 text-sm font-syne tracking-wider uppercase border-b ${
                isDark ? 'border-white/10' : 'border-zinc-200'
              } ${activeCategory === cat.slug ? 'font-black underline' : ''}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

