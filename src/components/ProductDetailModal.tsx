import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { X, ShoppingBag, ShieldCheck, Truck, Plus, Minus, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/format';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('Black');
  const [quantity, setQuantity] = useState(1);

  // Sync default options when product changes
  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setSelectedSize(Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes[0] : 'M');
      setSelectedColor(Array.isArray(product.colors) && product.colors.length > 0 ? product.colors[0] : 'Black');
      setQuantity(1);
    }
  }, [product]);

  const isDark = theme === 'dark';

  if (!product) return null;

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800'];
  const sizes = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL'];
  const colors = Array.isArray(product.colors) && product.colors.length > 0 ? product.colors : ['Black'];

  const isOutOfStock = product.stock_quantity <= 0;
  const currentImg = images[selectedImageIndex] || images[0];

  const handleAdd = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Animated Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Animated Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`relative w-full max-w-4xl border-2 shadow-2xl z-10 overflow-hidden my-4 sm:my-8 transition-colors ${
            isDark ? 'bg-zinc-950 text-white border-white/20' : 'bg-white text-zinc-900 border-zinc-300'
          }`}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className={`absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 border transition-colors ${
              isDark ? 'bg-white text-black border-white hover:bg-zinc-200' : 'bg-black text-white border-black hover:bg-zinc-800'
            }`}
          >
            <X size={18} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 p-4 sm:p-8 max-h-[88vh] overflow-y-auto">
            
            {/* Left Column: Image Gallery */}
            <div className="md:col-span-6 space-y-3 sm:space-y-4">
              <div className={`aspect-[3/4] border overflow-hidden relative ${
                isDark ? 'bg-zinc-900 border-white/20' : 'bg-stone-100 border-zinc-200'
              }`}>
                <img
                  src={currentImg}
                  alt={product.name}
                  className="w-full h-full object-cover object-top filter contrast-105"
                />
                {isOutOfStock && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white font-mono text-xs font-black uppercase px-2.5 py-1 tracking-widest">
                    SOLD OUT
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-14 h-18 sm:w-16 sm:h-20 border overflow-hidden transition-all ${
                        selectedImageIndex === idx
                          ? isDark ? 'border-2 border-white opacity-100' : 'border-2 border-black opacity-100'
                          : isDark ? 'border-white/20 opacity-50 hover:opacity-100' : 'border-zinc-300 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Details & Selection */}
            <div className="md:col-span-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className={`font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.25em] block mb-1 font-bold ${
                    isDark ? 'text-zinc-400' : 'text-zinc-500'
                  }`}>
                    {product.category_name || 'COLLECTION'}
                  </span>
                  <h2 className="text-xl sm:text-3xl font-black uppercase font-syne leading-tight tracking-tight">
                    {product.name}
                  </h2>
                  <div className="mt-2 font-mono text-xl sm:text-2xl font-black">
                    {formatPrice(product.price)}
                  </div>
                </div>

                {/* Description */}
                <p className={`font-mono text-xs leading-relaxed border-t border-b py-2.5 uppercase tracking-wider ${
                  isDark ? 'text-zinc-300 border-white/10' : 'text-zinc-600 border-zinc-200'
                }`}>
                  {product.description || 'Authentic SK WORL Milano heavyweight cut designed in Bangladesh.'}
                </p>

                {/* Size Selector */}
                {sizes.length > 0 && (
                  <div className="space-y-2">
                    <span className={`font-mono text-xs font-bold uppercase block tracking-wider ${
                      isDark ? 'text-zinc-300' : 'text-zinc-700'
                    }`}>
                      SELECT SIZE: <span className="font-extrabold">{selectedSize}</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {sizes.map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`px-3 py-1.5 sm:px-4 sm:py-2 font-mono text-xs uppercase border transition-all ${
                            selectedSize === sz
                              ? isDark
                                ? 'bg-white text-black border-white font-black'
                                : 'bg-black text-white border-black font-black'
                              : isDark
                              ? 'bg-black text-zinc-300 border-white/20 hover:border-white'
                              : 'bg-white text-zinc-700 border-zinc-300 hover:border-black'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selector */}
                {colors.length > 0 && (
                  <div className="space-y-2">
                    <span className={`font-mono text-xs font-bold uppercase block tracking-wider ${
                      isDark ? 'text-zinc-300' : 'text-zinc-700'
                    }`}>
                      SELECT COLOR: <span className="font-extrabold">{selectedColor}</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {colors.map((clr) => (
                        <button
                          key={clr}
                          onClick={() => setSelectedColor(clr)}
                          className={`px-3 py-1.5 font-mono text-xs uppercase border transition-all ${
                            selectedColor === clr
                              ? isDark
                                ? 'bg-white text-black border-white font-black'
                                : 'bg-black text-white border-black font-black'
                              : isDark
                              ? 'bg-black text-zinc-300 border-white/20 hover:border-white'
                              : 'bg-white text-zinc-700 border-zinc-300 hover:border-black'
                          }`}
                        >
                          {clr}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Picker */}
                <div className="space-y-1.5">
                  <span className={`font-mono text-xs font-bold uppercase block tracking-wider ${
                    isDark ? 'text-zinc-300' : 'text-zinc-700'
                  }`}>QUANTITY:</span>
                  <div className={`inline-flex items-center border ${
                    isDark ? 'border-white/20 bg-black' : 'border-zinc-300 bg-white'
                  }`}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3.5 font-mono text-xs font-black">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Bangladesh Delivery Note */}
                <div className={`p-3 border font-mono text-[10px] space-y-1 uppercase ${
                  isDark ? 'bg-zinc-900 border-white/10 text-zinc-300' : 'bg-stone-100 border-zinc-200 text-zinc-700'
                }`}>
                  <div className="flex items-center space-x-1.5 font-black">
                    <Truck size={14} className="text-emerald-500" />
                    <span>DELIVERY IN BANGLADESH</span>
                  </div>
                  <p className="text-[9px] leading-relaxed">
                    Inside Dhaka: ৳80 (1-2 Days) | Outside Dhaka: ৳150 (2-4 Days)
                    <br />
                    Cash on Delivery & bKash / Nagad Accepted
                  </p>
                </div>
              </div>

              {/* Actions & Perks */}
              <div className={`space-y-3 pt-3 border-t ${
                isDark ? 'border-white/10' : 'border-zinc-200'
              }`}>
                <button
                  onClick={handleAdd}
                  disabled={isOutOfStock}
                  className={`w-full py-3.5 font-mono text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-all shadow-md border ${
                    isOutOfStock
                      ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed'
                      : isDark
                      ? 'bg-white text-black border-white hover:bg-zinc-200'
                      : 'bg-black text-white border-black hover:bg-zinc-800'
                  }`}
                >
                  <ShoppingBag size={17} />
                  <span>{isOutOfStock ? 'OUT OF STOCK' : `ADD TO BAG — ${formatPrice(product.price * quantity)}`}</span>
                </button>

                <div className={`grid grid-cols-2 gap-2 font-mono text-[9px] uppercase pt-2 border-t ${
                  isDark ? 'text-zinc-400 border-white/10' : 'text-zinc-500 border-zinc-200'
                }`}>
                  <div className="flex items-center space-x-1 font-bold">
                    <CheckCircle size={13} className="text-emerald-500" />
                    <span>3-DAY EASY RETURN / SIZE EXCHANGE</span>
                  </div>
                  <div className="flex items-center space-x-1 font-bold">
                    <ShieldCheck size={13} className="text-amber-500" />
                    <span>100% ORIGINAL QUALITY</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

