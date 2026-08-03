import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/format';
import { useTheme } from '../context/ThemeContext';

export const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal, setIsCheckoutOpen } = useCart();
  const { theme } = useTheme();

  if (!isCartOpen) return null;

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in"
      />

      {/* Drawer Container */}
      <div className={`relative w-full max-w-[100vw] sm:max-w-md h-full shadow-2xl flex flex-col justify-between border-l z-10 transition-colors ${
        isDark ? 'bg-zinc-950 text-white border-white/20' : 'bg-white text-zinc-900 border-zinc-200'
      }`}>
        
        {/* Header */}
        <div className={`p-4 sm:p-5 flex items-center justify-between border-b ${
          isDark ? 'bg-black text-white border-white/10' : 'bg-stone-50 text-black border-zinc-200'
        }`}>
          <div className="flex items-center space-x-2">
            <ShoppingBag size={18} />
            <h2 className="font-black text-base uppercase tracking-tight font-syne">YOUR BAG ({cart.length})</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <ShoppingBag size={42} className="text-zinc-500" />
              <h3 className="font-mono text-xs uppercase font-bold tracking-widest">YOUR BAG IS CURRENTLY EMPTY</h3>
              <p className="text-xs font-mono text-zinc-400 uppercase max-w-xs">Discover our newest fashion drops in Bangladesh and add items to your bag.</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className={`mt-3 px-6 py-3 font-mono text-xs font-black uppercase tracking-widest border transition-colors ${
                  isDark ? 'bg-white text-black border-white hover:bg-zinc-200' : 'bg-black text-white border-black hover:bg-zinc-800'
                }`}
              >
                EXPLORE COLLECTIONS
              </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${idx}`}
                className={`p-3.5 border flex space-x-3 shadow-sm ${
                  isDark ? 'bg-black border-white/10' : 'bg-stone-50 border-zinc-200'
                }`}
              >
                {/* Thumbnail */}
                <div className={`w-18 h-22 border flex-shrink-0 overflow-hidden ${
                  isDark ? 'bg-zinc-900 border-white/10' : 'bg-stone-200 border-zinc-300'
                }`}>
                  <img
                    src={Array.isArray(item.product.images) && item.product.images[0] ? item.product.images[0] : ''}
                    alt={item.product.name}
                    className="w-full h-full object-cover filter contrast-105"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-black text-xs uppercase font-syne line-clamp-1">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(idx)}
                        className="text-zinc-400 hover:text-red-500 transition-colors p-0.5"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex items-center space-x-3 text-[10px] font-mono text-zinc-400 mt-1 uppercase font-bold">
                      <span>SIZE: <strong className={isDark ? 'text-white' : 'text-black'}>{item.selectedSize}</strong></span>
                      <span>COLOR: <strong className={isDark ? 'text-white' : 'text-black'}>{item.selectedColor}</strong></span>
                    </div>
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between pt-2">
                    <div className={`flex items-center border ${
                      isDark ? 'border-white/20 bg-zinc-900' : 'border-zinc-300 bg-white'
                    }`}>
                      <button
                        onClick={() => updateQuantity(idx, item.quantity - 1)}
                        className="px-2 py-0.5 text-zinc-400 hover:text-black hover:bg-zinc-100"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="px-2 font-mono text-xs font-black">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(idx, item.quantity + 1)}
                        className="px-2 py-0.5 text-zinc-400 hover:text-black hover:bg-zinc-100"
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    <span className="font-mono text-xs font-black">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Subtotal & Checkout Button */}
        {cart.length > 0 && (
          <div className={`p-5 border-t space-y-3.5 ${
            isDark ? 'bg-black border-white/10' : 'bg-stone-50 border-zinc-200'
          }`}>
            <div className={`flex items-center justify-between font-mono text-xs border-b pb-2.5 ${
              isDark ? 'border-white/10' : 'border-zinc-200'
            }`}>
              <span className="uppercase text-zinc-400 font-bold">SUBTOTAL</span>
              <span className="font-black text-base">{formatPrice(subtotal)}</span>
            </div>

            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
              Cash on delivery & bKash / Nagad options available inside & outside Dhaka.
            </p>

            <button
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              className={`w-full py-3.5 font-mono text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-colors border ${
                isDark ? 'bg-white text-black border-white hover:bg-zinc-200' : 'bg-black text-white border-black hover:bg-zinc-800'
              }`}
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

