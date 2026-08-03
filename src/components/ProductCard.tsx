import React, { useState } from 'react';
import { Product } from '../types';
import { ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/format';
import { useTheme } from '../context/ThemeContext';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(
    Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes[0] : 'M'
  );
  const [selectedColor] = useState<string>(
    Array.isArray(product.colors) && product.colors.length > 0 ? product.colors[0] : 'Black'
  );

  const isOutOfStock = product.stock_quantity <= 0;
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800'];
  const primaryImg = images[0];
  const secondaryImg = images[1] || primaryImg;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, selectedSize, selectedColor, 1);
  };

  const isDark = theme === 'dark';

  return (
    <div
      onClick={() => onQuickView(product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group cursor-pointer border transition-all flex flex-col justify-between shadow-lg overflow-hidden rounded-none ${
        isDark
          ? 'bg-zinc-950 border-white/10 hover:border-white text-white'
          : 'bg-white border-zinc-200 hover:border-black text-zinc-900'
      }`}
    >
      {/* Image Container */}
      <div className={`relative aspect-[3/4] overflow-hidden ${isDark ? 'bg-zinc-900' : 'bg-stone-100'}`}>
        <img
          src={hovered ? secondaryImg : primaryImg}
          alt={product.name}
          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 filter contrast-105"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 items-start z-10">
          {isOutOfStock ? (
            <span className="bg-red-600 text-white font-mono text-[8px] sm:text-[9px] font-black uppercase px-1.5 sm:px-2 py-0.5 tracking-wider">
              SOLD OUT
            </span>
          ) : product.is_trending ? (
            <span className={`font-mono text-[8px] sm:text-[9px] font-black uppercase px-1.5 sm:px-2 py-0.5 tracking-wider ${
              isDark ? 'bg-white text-black' : 'bg-black text-white'
            }`}>
              TRENDING
            </span>
          ) : product.is_featured ? (
            <span className={`border font-mono text-[8px] sm:text-[9px] font-black uppercase px-1.5 sm:px-2 py-0.5 tracking-wider ${
              isDark ? 'bg-black text-white border-white/40' : 'bg-zinc-100 text-black border-zinc-300'
            }`}>
              FEATURED
            </span>
          ) : null}
        </div>

        {/* Quick Actions overlay (Desktop Hover & Mobile tap icon) */}
        <div className="absolute inset-x-2 bottom-2 sm:inset-x-3 sm:bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5 sm:gap-2 z-10">
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`flex-1 py-2 px-2 sm:py-2.5 sm:px-3 font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-1 transition-colors border ${
              isOutOfStock
                ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed'
                : isDark
                ? 'bg-white text-black border-white hover:bg-zinc-200'
                : 'bg-black text-white border-black hover:bg-zinc-800'
            }`}
          >
            <ShoppingBag size={13} />
            <span className="truncate">{isOutOfStock ? 'OUT OF STOCK' : 'QUICK ADD'}</span>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className={`p-2 sm:p-2.5 border transition-colors ${
              isDark ? 'bg-black text-white border-white/20 hover:border-white' : 'bg-white text-black border-zinc-300 hover:border-black'
            }`}
            title="View Details"
          >
            <Eye size={15} />
          </button>
        </div>
      </div>

      {/* Product Details Info */}
      <div className={`p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 border-t ${
        isDark ? 'bg-zinc-950 border-white/10' : 'bg-white border-zinc-100'
      }`}>
        <div>
          <span className={`text-[8px] sm:text-[9px] font-mono tracking-widest uppercase block font-bold mb-0.5 ${
            isDark ? 'text-zinc-400' : 'text-zinc-500'
          }`}>
            {product.category_name || 'COLLECTION'}
          </span>
          <h3 className={`font-black text-xs sm:text-sm tracking-tight uppercase line-clamp-1 font-syne group-hover:underline ${
            isDark ? 'text-white' : 'text-zinc-900'
          }`}>
            {product.name}
          </h3>
        </div>

        {/* Size Selector Quick Chips */}
        {Array.isArray(product.sizes) && product.sizes.length > 0 && (
          <div className="flex items-center gap-1 pt-0.5 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
            <span className={`text-[8px] sm:text-[9px] font-mono mr-0.5 font-bold ${
              isDark ? 'text-zinc-500' : 'text-zinc-400'
            }`}>SIZE:</span>
            {product.sizes.slice(0, 4).map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`text-[8px] sm:text-[9px] font-mono px-1 sm:px-1.5 py-0.5 border transition-colors ${
                  selectedSize === size
                    ? isDark
                      ? 'border-white bg-white text-black font-black'
                      : 'border-black bg-black text-white font-black'
                    : isDark
                    ? 'border-white/20 text-zinc-400 hover:border-white hover:text-white'
                    : 'border-zinc-300 text-zinc-600 hover:border-black hover:text-black'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        {/* Price in Bangladeshi Taka (৳) & Stock Status */}
        <div className={`flex items-center justify-between pt-1.5 border-t ${
          isDark ? 'border-white/10' : 'border-zinc-100'
        }`}>
          <span className={`font-mono text-xs sm:text-sm font-black tracking-tight ${
            isDark ? 'text-white' : 'text-zinc-950'
          }`}>
            {formatPrice(product.price)}
          </span>

          <span className={`font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${
            isDark ? 'text-zinc-400' : 'text-zinc-500'
          }`}>
            {isOutOfStock ? (
              <span className="text-red-500">SOLD OUT</span>
            ) : (
              <span>{product.stock_quantity} IN STOCK</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

