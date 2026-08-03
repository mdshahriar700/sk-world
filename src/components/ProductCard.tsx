import React, { useState } from 'react';
import { Product } from '../types';
import { ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const [hovered, setHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || 'M');
  const [selectedColor] = useState<string>(product.colors?.[0] || 'Black');

  const isOutOfStock = product.stock_quantity <= 0;
  const primaryImg = product.images[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800';
  const secondaryImg = product.images[1] || primaryImg;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, selectedSize, selectedColor, 1);
  };

  return (
    <div
      onClick={() => onQuickView(product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group cursor-pointer bg-zinc-950 border border-white/10 hover:border-white transition-all flex flex-col justify-between text-white shadow-xl"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900">
        <img
          src={hovered ? secondaryImg : primaryImg}
          alt={product.name}
          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 filter contrast-110"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10">
          {isOutOfStock ? (
            <span className="bg-red-600 text-white font-mono text-[9px] font-bold uppercase px-2 py-0.5 tracking-[0.2em]">
              SOLD OUT
            </span>
          ) : product.is_trending ? (
            <span className="bg-white text-black font-mono text-[9px] font-extrabold uppercase px-2 py-0.5 tracking-[0.2em]">
              TRENDING
            </span>
          ) : product.is_featured ? (
            <span className="bg-black text-white border border-white/40 font-mono text-[9px] font-bold uppercase px-2 py-0.5 tracking-[0.2em]">
              FEATURED
            </span>
          ) : null}
        </div>

        {/* Quick View Floating Actions */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 z-10">
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`flex-1 py-2.5 px-3 font-mono text-xs font-extrabold uppercase tracking-[0.15em] flex items-center justify-center space-x-1.5 transition-colors border ${
              isOutOfStock
                ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed'
                : 'bg-white text-black border-white hover:bg-zinc-200'
            }`}
          >
            <ShoppingBag size={14} />
            <span>{isOutOfStock ? 'OUT OF STOCK' : 'QUICK ADD'}</span>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="p-2.5 bg-black text-white border border-white/20 hover:border-white transition-colors"
            title="View Details"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>

      {/* Product Details Info */}
      <div className="p-4 bg-zinc-950 flex-1 flex flex-col justify-between space-y-3 border-t border-white/10">
        <div>
          <span className="text-[9px] font-mono tracking-[0.25em] text-zinc-400 uppercase block mb-1 font-bold">
            {product.category_name || 'COLLECTION'}
          </span>
          <h3 className="font-extrabold text-sm text-white tracking-tight uppercase line-clamp-1 font-syne group-hover:underline">
            {product.name}
          </h3>
        </div>

        {/* Size Selector Quick Chips */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
            <span className="text-[9px] font-mono text-zinc-500 mr-1 font-bold">SIZE:</span>
            {product.sizes.slice(0, 4).map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`text-[9px] font-mono px-1.5 py-0.5 border ${
                  selectedSize === size
                    ? 'border-white bg-white text-black font-extrabold'
                    : 'border-white/20 text-zinc-400 hover:border-white hover:text-white'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        {/* Price & Stock Status */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="font-mono text-sm font-extrabold text-white tracking-tight">
            ${product.price.toFixed(2)}
          </span>

          <span className="font-mono text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
            {isOutOfStock ? (
              <span className="text-red-500">0 IN STOCK</span>
            ) : (
              <span>{product.stock_quantity} IN STOCK</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
