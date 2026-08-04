import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { X, ShoppingBag, ShieldCheck, Truck, Plus, Minus, CheckCircle, Share2, Link as LinkIcon, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/format';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import { ImageMagnifier } from './ImageMagnifier';

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
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync default options when product changes
  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      const initialSizes = Array.isArray(product.sizes) ? product.sizes : [];
      const initialColors = Array.isArray(product.colors) ? product.colors : [];
      setSelectedSize(initialSizes[0] || '');
      setSelectedColor(initialColors[0] || '');
      setQuantity(1);
      setCopiedLink(false);
    }
  }, [product]);

  const isDark = theme === 'dark';

  if (!product) return null;

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800'];
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const colors = Array.isArray(product.colors) ? product.colors : [];

  const isOutOfStock = product.stock_quantity <= 0;
  const currentImg = images[selectedImageIndex] || images[0];

  const handleCopyProductLink = () => {
    const slug = product.slug || `product-${product.id}`;
    const directUrl = `${window.location.origin}/product/${slug}`;
    navigator.clipboard.writeText(directUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSelectColor = (clr: string) => {
    setSelectedColor(clr);
    if (product?.image_colors) {
      const mappedIdx = images.findIndex((img) => {
        const mappedColor = product.image_colors?.[img];
        return mappedColor && mappedColor.trim().toLowerCase() === clr.trim().toLowerCase();
      });
      if (mappedIdx !== -1) {
        setSelectedImageIndex(mappedIdx);
      }
    }
  };

  const handleSelectThumbnail = (idx: number) => {
    setSelectedImageIndex(idx);
    const targetImg = images[idx];
    if (targetImg && product?.image_colors?.[targetImg]) {
      const mappedColor = product.image_colors[targetImg];
      const matchInColors = colors.find((c) => c.trim().toLowerCase() === mappedColor.trim().toLowerCase());
      if (matchInColors) {
        setSelectedColor(matchInColors);
      } else {
        setSelectedColor(mappedColor);
      }
    }
  };

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
          className={`relative w-full max-w-[calc(100vw-24px)] sm:max-w-4xl border-2 shadow-2xl z-10 overflow-hidden my-auto transition-colors ${
            isDark ? 'bg-zinc-950 text-white border-white/20' : 'bg-white text-zinc-900 border-zinc-300'
          }`}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className={`absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-40 p-2 border transition-colors ${
              isDark ? 'bg-black/80 text-white border-white/30 hover:bg-white hover:text-black' : 'bg-white/80 text-black border-zinc-400 hover:bg-black hover:text-white'
            }`}
          >
            <X size={18} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 p-4 sm:p-8 max-h-[82vh] overflow-y-auto overflow-x-hidden">
            
            {/* Left Column: Image Gallery with Fabric Zoom Magnifier */}
            <div className="md:col-span-6 min-w-0 w-full space-y-3 sm:space-y-4">
              <div className={`w-full max-w-[280px] sm:max-w-full aspect-[3/4] border overflow-hidden relative mx-auto ${
                isDark ? 'bg-zinc-900 border-white/20' : 'bg-stone-100 border-zinc-200'
              }`}>
                <ImageMagnifier
                  src={currentImg}
                  alt={product.name}
                  isDark={isDark}
                />
                {isOutOfStock && (
                  <div className="absolute top-3 left-3 z-20 bg-red-600 text-white font-mono text-xs font-black uppercase px-2.5 py-1 tracking-widest shadow-md">
                    SOLD OUT
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 justify-center sm:justify-start">
                  {images.map((img, idx) => {
                    const mappedColor = product.image_colors?.[img];
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectThumbnail(idx)}
                        className={`relative w-12 h-16 sm:w-16 sm:h-20 border overflow-hidden transition-all shrink-0 group ${
                          selectedImageIndex === idx
                            ? isDark ? 'border-2 border-white opacity-100 shadow-md' : 'border-2 border-black opacity-100 shadow-md'
                            : isDark ? 'border-white/20 opacity-60 hover:opacity-100' : 'border-zinc-300 opacity-60 hover:opacity-100'
                        }`}
                        title={mappedColor ? `Color: ${mappedColor}` : `Image ${idx + 1}`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        {mappedColor && (
                          <span className="absolute bottom-0 inset-x-0 bg-black/80 text-white text-[8px] font-mono font-bold uppercase py-0.5 px-0.5 truncate text-center">
                            {mappedColor}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Details & Selection */}
            <div className="md:col-span-6 min-w-0 w-full space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className={`font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.25em] block mb-1 font-bold ${
                    isDark ? 'text-zinc-400' : 'text-zinc-500'
                  }`}>
                    {product.category_name || 'COLLECTION'}
                  </span>
                  <h2 className="text-xl sm:text-3xl font-black uppercase font-syne leading-tight tracking-tight break-words">
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
                      SELECT SIZE: <span className="font-extrabold">{selectedSize || 'Standard'}</span>
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
                      SELECT COLOR: <span className="font-extrabold">{selectedColor || 'Default'}</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {colors.map((clr) => (
                        <button
                          key={clr}
                          onClick={() => handleSelectColor(clr)}
                          className={`px-3 py-1.5 font-mono text-xs uppercase border transition-all flex items-center space-x-1.5 ${
                            selectedColor === clr
                              ? isDark
                                ? 'bg-white text-black border-white font-black'
                                : 'bg-black text-white border-black font-black'
                              : isDark
                              ? 'bg-black text-zinc-300 border-white/20 hover:border-white'
                              : 'bg-white text-zinc-700 border-zinc-300 hover:border-black'
                          }`}
                        >
                          <span>{clr}</span>
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
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <button
                    onClick={handleAdd}
                    disabled={isOutOfStock}
                    className={`sm:col-span-3 py-3.5 font-mono text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-all shadow-md border ${
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

                  <button
                    onClick={handleCopyProductLink}
                    className={`py-3.5 font-mono text-[10px] font-black uppercase tracking-wider flex items-center justify-center space-x-1 border transition-all ${
                      copiedLink
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : isDark
                        ? 'bg-zinc-900 text-zinc-300 border-white/20 hover:border-white hover:text-white'
                        : 'bg-stone-100 text-zinc-700 border-zinc-300 hover:border-black hover:text-black'
                    }`}
                    title="Copy direct product link"
                  >
                    {copiedLink ? <Check size={14} /> : <LinkIcon size={14} />}
                    <span>{copiedLink ? 'COPIED!' : 'SHARE'}</span>
                  </button>
                </div>

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

