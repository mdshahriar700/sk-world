import React, { useState } from 'react';
import { Product, Category } from '../../types';
import { Plus, Edit2, Trash2, Upload, X, Check, Image as ImageIcon } from 'lucide-react';
import { uploadImageToCloudinary } from '../../lib/cloudinary';

interface AdminProductsProps {
  products: Product[];
  categories: Category[];
  onRefresh: () => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ products, categories, onRefresh }) => {
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOpenNew = () => {
    setEditingProduct({
      name: '',
      slug: '',
      price: 99,
      category_id: categories[0]?.id || 1,
      description: '',
      images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800'],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'Off White'],
      stock_quantity: 20,
      is_featured: true,
      is_trending: false,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct({ ...p });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      onRefresh();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setEditingProduct((prev) => ({
        ...prev,
        images: [...(prev?.images || []), url],
      }));
    } catch (err) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setEditingProduct((prev) => ({
      ...prev,
      images: [...(prev?.images || []), newImageUrl.trim()],
    }));
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setEditingProduct((prev) => ({
      ...prev,
      images: (prev?.images || []).filter((_, i) => i !== index),
    }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price) {
      alert('Product Name and Price are required.');
      return;
    }

    setLoading(true);

    try {
      const isEdit = !!editingProduct.id;
      const url = isEdit ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsModalOpen(false);
        setEditingProduct(null);
        onRefresh();
      } else {
        alert(data.error || 'Failed to save product');
      }
    } catch (err) {
      alert('Network request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase text-white font-sans tracking-tight">
            PRODUCT MANAGEMENT
          </h2>
          <p className="font-mono text-xs uppercase text-neutral-400 mt-1">
            ADD, EDIT OR ARCHIVE ITEMS IN THE SK WORL CATALOG
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="bg-white text-black hover:bg-neutral-200 px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors"
        >
          <Plus size={16} />
          <span>ADD NEW PRODUCT</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-neutral-900 border border-white/10 overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-neutral-400 uppercase bg-black/40">
              <th className="py-3 px-4">IMAGE</th>
              <th className="py-3 px-4">NAME & SLUG</th>
              <th className="py-3 px-4">CATEGORY</th>
              <th className="py-3 px-4">PRICE</th>
              <th className="py-3 px-4">STOCK</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-4">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-12 h-14 object-cover bg-neutral-800 border border-white/10"
                  />
                </td>
                <td className="py-3 px-4">
                  <div className="font-bold text-white uppercase text-sm">{p.name}</div>
                  <div className="text-[10px] text-neutral-500">{p.slug}</div>
                </td>
                <td className="py-3 px-4 text-neutral-300 uppercase">
                  {p.category_name || categories.find((c) => c.id === p.category_id)?.name || 'N/A'}
                </td>
                <td className="py-3 px-4 font-bold text-white">${p.price.toFixed(2)}</td>
                <td className="py-3 px-4">
                  <span className={p.stock_quantity <= 0 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                    {p.stock_quantity} units
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {p.is_featured && <span className="bg-amber-900/60 text-amber-300 text-[9px] px-1.5 py-0.5 border border-amber-700">FEATURED</span>}
                    {p.is_trending && <span className="bg-purple-900/60 text-purple-300 text-[9px] px-1.5 py-0.5 border border-purple-700">TRENDING</span>}
                  </div>
                </td>
                <td className="py-3 px-4 text-right space-x-2">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
                    title="Edit Product"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 bg-red-950 hover:bg-red-900 text-red-300 transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl bg-neutral-900 border-2 border-white text-white p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold uppercase font-sans">
                {editingProduct.id ? `EDIT PRODUCT #${editingProduct.id}` : 'CREATE NEW PRODUCT'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6 font-mono text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 uppercase mb-1">PRODUCT NAME *</label>
                  <input
                    type="text"
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="E.G. SK HEAVYWEIGHT HOODIE"
                    className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none focus:border-white uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase mb-1">SLUG (URL KEY)</label>
                  <input
                    type="text"
                    value={editingProduct.slug || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                    placeholder="E.G. sk-heavyweight-hoodie"
                    className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-neutral-400 uppercase mb-1">PRICE ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                    className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none focus:border-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase mb-1">STOCK QUANTITY *</label>
                  <input
                    type="number"
                    value={editingProduct.stock_quantity ?? 10}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: parseInt(e.target.value) })}
                    className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none focus:border-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase mb-1">CATEGORY *</label>
                  <select
                    value={editingProduct.category_id || categories[0]?.id || 1}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category_id: parseInt(e.target.value) })}
                    className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none focus:border-white uppercase"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 uppercase mb-1">DESCRIPTION</label>
                <textarea
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows={3}
                  className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none focus:border-white uppercase resize-none"
                />
              </div>

              {/* Sizes & Colors Editor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 uppercase mb-1">AVAILABLE SIZES (COMMA SEPARATED)</label>
                  <input
                    type="text"
                    value={Array.isArray(editingProduct.sizes) ? editingProduct.sizes.join(', ') : ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sizes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                    placeholder="S, M, L, XL"
                    className="w-full bg-black border border-white/20 px-3 py-2 text-white uppercase focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase mb-1">AVAILABLE COLORS (COMMA SEPARATED)</label>
                  <input
                    type="text"
                    value={Array.isArray(editingProduct.colors) ? editingProduct.colors.join(', ') : ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, colors: e.target.value.split(',').map((c) => c.trim()).filter(Boolean) })}
                    placeholder="Black, Off White, Charcoal"
                    className="w-full bg-black border border-white/20 px-3 py-2 text-white uppercase focus:outline-none"
                  />
                </div>
              </div>

              {/* Product Images Management */}
              <div className="space-y-3 border-t border-white/10 pt-4">
                <label className="block text-neutral-400 uppercase font-bold">PRODUCT IMAGES (CLOUDINARY / DIRECT URL)</label>
                
                <div className="flex flex-wrap gap-3">
                  {(editingProduct.images || []).map((img, idx) => (
                    <div key={idx} className="relative w-20 h-24 border border-white/20 bg-black group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="PASTE IMAGE URL..."
                    className="flex-1 bg-black border border-white/20 px-3 py-2 text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="bg-white/10 text-white px-4 py-2 hover:bg-white/20"
                  >
                    ADD URL
                  </button>

                  <label className="bg-amber-400 text-black font-bold px-4 py-2 cursor-pointer hover:bg-amber-300 flex items-center justify-center space-x-1">
                    <Upload size={14} />
                    <span>{uploading ? 'UPLOADING...' : 'UPLOAD IMAGE'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Feature Toggles */}
              <div className="flex flex-wrap gap-6 pt-2 border-t border-white/10">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!editingProduct.is_featured}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })}
                    className="w-4 h-4 accent-amber-400"
                  />
                  <span>FEATURED ON HOMEPAGE</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!editingProduct.is_trending}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_trending: e.target.checked })}
                    className="w-4 h-4 accent-amber-400"
                  />
                  <span>TRENDING COLLECTION</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_active !== false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.checked })}
                    className="w-4 h-4 accent-amber-400"
                  />
                  <span>ACTIVE IN STORE</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 border border-white/20 hover:bg-white/10 text-white font-bold uppercase"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-white text-black font-bold uppercase px-8 py-3 hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  {loading ? 'SAVING...' : 'SAVE PRODUCT'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
