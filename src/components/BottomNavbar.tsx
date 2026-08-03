import React from 'react';
import { Home, Grid, Search, ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

interface BottomNavbarProps {
  onHomeClick: () => void;
  onCollectionsClick: () => void;
  onOpenSearch: () => void;
  onOpenOrderTracking?: () => void;
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({
  onHomeClick,
  onCollectionsClick,
  onOpenSearch,
  onOpenOrderTracking,
}) => {
  const { setIsCartOpen, cartCount } = useCart();
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-lg px-2 py-2 transition-colors ${
      isDark ? 'bg-black/95 text-white border-white/20' : 'bg-white/95 text-zinc-900 border-zinc-300 shadow-2xl'
    }`}>
      <div className="grid grid-cols-5 items-center text-center font-mono text-[9px] uppercase font-bold">
        
        {/* Home */}
        <button
          onClick={onHomeClick}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded transition-colors ${
            isDark ? 'text-zinc-300 hover:text-white' : 'text-zinc-600 hover:text-black'
          }`}
        >
          <Home size={19} className="mb-0.5" />
          <span className="tracking-tighter">HOME</span>
        </button>

        {/* Collections */}
        <button
          onClick={onCollectionsClick}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded transition-colors ${
            isDark ? 'text-zinc-300 hover:text-white' : 'text-zinc-600 hover:text-black'
          }`}
        >
          <Grid size={19} className="mb-0.5" />
          <span className="tracking-tighter">CATALOG</span>
        </button>

        {/* Track Order */}
        <button
          onClick={onOpenOrderTracking}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded transition-colors ${
            isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-700 hover:text-emerald-900'
          }`}
        >
          <Truck size={19} className="mb-0.5" />
          <span className="tracking-tighter">TRACK</span>
        </button>

        {/* Search */}
        <button
          onClick={onOpenSearch}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded transition-colors ${
            isDark ? 'text-zinc-300 hover:text-white' : 'text-zinc-600 hover:text-black'
          }`}
        >
          <Search size={19} className="mb-0.5" />
          <span className="tracking-tighter">SEARCH</span>
        </button>

        {/* Bag / Cart with Badge */}
        <button
          onClick={() => setIsCartOpen(true)}
          className={`relative flex flex-col items-center justify-center py-1 px-1 rounded transition-colors ${
            isDark ? 'text-white' : 'text-black'
          }`}
        >
          <div className="relative">
            <ShoppingBag size={20} className="mb-0.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-black shadow">
                {cartCount}
              </span>
            )}
          </div>
          <span className="tracking-tighter font-black">BAG ({cartCount})</span>
        </button>

      </div>
    </div>
  );
};
