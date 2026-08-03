import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal, setIsCheckoutOpen } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-zinc-950 text-white h-full shadow-2xl flex flex-col justify-between border-l border-white/20 z-10">
        
        {/* Header */}
        <div className="p-6 bg-black text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center space-x-2">
            <ShoppingBag size={20} />
            <h2 className="font-black text-lg uppercase tracking-tighter font-syne">YOUR BAG ({cart.length})</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <ShoppingBag size={48} className="text-zinc-600" />
              <h3 className="font-mono text-xs uppercase font-bold text-white tracking-widest">YOUR BAG IS CURRENTLY EMPTY</h3>
              <p className="text-xs font-mono text-zinc-400 uppercase">Discover our newest fashion drops and add pieces to your cart.</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-4 bg-white text-black border border-white px-6 py-3 font-mono text-xs font-extrabold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
              >
                START SHOPPING
              </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${idx}`}
                className="bg-black p-4 border border-white/10 flex space-x-4 shadow-md"
              >
                {/* Thumbnail */}
                <div className="w-20 h-24 bg-zinc-900 border border-white/10 flex-shrink-0 overflow-hidden">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover filter contrast-110"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <h4 className="font-extrabold text-xs uppercase text-white font-syne line-clamp-1">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(idx)}
                        className="text-zinc-500 hover:text-red-500 transition-colors p-0.5"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex items-center space-x-3 text-[10px] font-mono text-zinc-400 mt-1 uppercase">
                      <span>SIZE: <strong className="text-white">{item.selectedSize}</strong></span>
                      <span>COLOR: <strong className="text-white">{item.selectedColor}</strong></span>
                    </div>
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center border border-white/20 bg-zinc-900">
                      <button
                        onClick={() => updateQuantity(idx, item.quantity - 1)}
                        className="px-2 py-0.5 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2 font-mono text-xs font-extrabold text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(idx, item.quantity + 1)}
                        className="px-2 py-0.5 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <span className="font-mono text-xs font-extrabold text-white">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Subtotal & Checkout Button */}
        {cart.length > 0 && (
          <div className="p-6 bg-black border-t border-white/10 space-y-4">
            <div className="flex items-center justify-between font-mono text-xs border-b border-white/10 pb-3">
              <span className="uppercase text-zinc-400 font-bold">SUBTOTAL</span>
              <span className="font-extrabold text-lg text-white">${subtotal.toFixed(2)}</span>
            </div>

            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Shipping & taxes calculated at checkout. Express dispatch available.
            </p>

            <button
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              className="w-full bg-white text-black py-4 font-mono text-xs font-extrabold uppercase tracking-[0.2em] flex items-center justify-center space-x-2 hover:bg-zinc-200 transition-colors border border-white"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
