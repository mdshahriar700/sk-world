import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { X, ShoppingBag, ShieldCheck, Truck, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('Black');
  const [quantity, setQuantity] = useState(1);

  // Sync default options when product changes
  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setSelectedSize(product.sizes?.[0] || 'M');
      setSelectedColor(product.colors?.[0] || 'Black');
      setQuantity(1);
    }
  }, [product]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal Box */}
      <div className="relative w-full max-w-4xl bg-zinc-950 text-white border-2 border-white/20 shadow-2xl z-10 overflow-hidden my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white text-black p-2 border border-white hover:bg-zinc-200 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
          
          {/* Left Column: Image Gallery */}
          <div className="md:col-span-6 space-y-4">
            <div className="aspect-[3/4] bg-zinc-900 border border-white/20 overflow-hidden relative">
              <img
                src={currentImg}
                alt={product.name}
                className="w-full h-full object-cover object-top filter contrast-110"
              />
              {isOutOfStock && (
                <div className="absolute top-4 left-4 bg-red-600 text-white font-mono text-xs font-black uppercase px-3 py-1 tracking-widest">
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
                    className={`w-16 h-20 border ${
                      selectedImageIndex === idx ? 'border-2 border-white opacity-100' : 'border-white/20 opacity-50 hover:opacity-100'
                    } overflow-hidden bg-zinc-900`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Selection */}
          <div className="md:col-span-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-400 block mb-1 font-bold">
                  {product.category_name || 'COLLECTION'}
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white font-syne leading-tight tracking-tighter">
                  {product.name}
                </h2>
                <div className="mt-2 font-mono text-xl sm:text-2xl font-extrabold text-white">
                  ${product.price.toFixed(2)}
                </div>
              </div>

              {/* Description */}
              <p className="font-mono text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-b border-white/10 py-3 uppercase tracking-wider">
                {product.description || 'Authentic SK WORL Milano craftsmanship with premium fabric cut.'}
              </p>

              {/* Size Selector */}
              {sizes.length > 0 && (
                <div className="space-y-2">
                  <span className="font-mono text-xs font-bold uppercase text-zinc-300 block tracking-wider">
                    SELECT SIZE: <span className="text-white font-extrabold">{selectedSize}</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`px-4 py-2 font-mono text-xs uppercase border transition-all ${
                          selectedSize === sz
                            ? 'bg-white text-black border-white font-extrabold'
                            : 'bg-black text-zinc-300 border-white/20 hover:border-white'
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
                  <span className="font-mono text-xs font-bold uppercase text-zinc-300 block tracking-wider">
                    SELECT COLOR: <span className="text-white font-extrabold">{selectedColor}</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((clr) => (
                      <button
                        key={clr}
                        onClick={() => setSelectedColor(clr)}
                        className={`px-3.5 py-1.5 font-mono text-xs uppercase border transition-all ${
                          selectedColor === clr
                            ? 'bg-white text-black border-white font-extrabold'
                            : 'bg-black text-zinc-300 border-white/20 hover:border-white'
                        }`}
                      >
                        {clr}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Picker */}
              <div className="space-y-2">
                <span className="font-mono text-xs font-bold uppercase text-zinc-300 block tracking-wider">QUANTITY:</span>
                <div className="inline-flex items-center border border-white/20 bg-black">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 font-mono text-xs font-extrabold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions & Perks */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <button
                onClick={handleAdd}
                disabled={isOutOfStock}
                className={`w-full py-4 font-mono text-xs font-extrabold uppercase tracking-[0.2em] flex items-center justify-center space-x-2 transition-all shadow-md border ${
                  isOutOfStock
                    ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed'
                    : 'bg-white text-black border-white hover:bg-zinc-200'
                }`}
              >
                <ShoppingBag size={18} />
                <span>{isOutOfStock ? 'OUT OF STOCK' : `ADD TO BAG — $${(product.price * quantity).toFixed(2)}`}</span>
              </button>

              <div className="grid grid-cols-2 gap-2 font-mono text-[10px] text-zinc-400 border-t border-white/10 pt-3">
                <div className="flex items-center space-x-1.5">
                  <Truck size={14} className="text-white" />
                  <span>EXPRESS DISPATCH</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck size={14} className="text-white" />
                  <span>100% AUTHENTIC MILANO</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
