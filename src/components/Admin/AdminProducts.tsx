import React, { useState } from 'react';
import { Product, Category } from '../../types';
import { Plus, Edit2, Trash2, Upload, X, Search, Package, Image as ImageIcon } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [newSizeInput, setNewSizeInput] = useState('');
  const [newColorInput, setNewColorInput] = useState('');

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategoryFilter === 'all' || p.category_id === Number(selectedCategoryFilter);
    return matchesSearch && matchesCat;
  });

  const handleOpenNew = () => {
    setEditingProduct({
      name: '',
      slug: '',
      price: 1200,
      category_id: categories[0]?.id || 1,
      description: '',
      images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800'],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'Off White'],
      image_colors: {},
      stock_quantity: 20,
      is_featured: true,
      is_trending: false,
      is_active: true,
    });
    setNewSizeInput('');
    setNewColorInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct({
      ...p,
      sizes: Array.isArray(p.sizes) ? p.sizes : ['S', 'M', 'L', 'XL'],
      colors: Array.isArray(p.colors) ? p.colors : ['Black'],
      image_colors: p.image_colors && typeof p.image_colors === 'object' ? { ...p.image_colors } : {}
    });
    setNewSizeInput('');
    setNewColorInput('');
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
    setEditingProduct((prev) => {
      const targetImg = prev?.images?.[index];
      const newImages = (prev?.images || []).filter((_, i) => i !== index);
      const newImgColors = { ...(prev?.image_colors || {}) };
      if (targetImg && newImgColors[targetImg]) {
        delete newImgColors[targetImg];
      }
      return { ...prev, images: newImages, image_colors: newImgColors };
    });
  };

  const handleAddSize = (val?: string) => {
    const sizeToAdd = (val || newSizeInput).trim();
    if (!sizeToAdd) return;
    setEditingProduct((prev) => {
      const existing = prev?.sizes || [];
      if (existing.includes(sizeToAdd)) return prev;
      return { ...prev, sizes: [...existing, sizeToAdd] };
    });
    setNewSizeInput('');
  };

  const handleRemoveSize = (sizeStr: string) => {
    setEditingProduct((prev) => ({
      ...prev,
      sizes: (prev?.sizes || []).filter((s) => s !== sizeStr),
    }));
  };

  const handleAddColor = (val?: string) => {
    const colorToAdd = (val || newColorInput).trim();
    if (!colorToAdd) return;
    setEditingProduct((prev) => {
      const existing = prev?.colors || [];
      if (existing.includes(colorToAdd)) return prev;
      return { ...prev, colors: [...existing, colorToAdd] };
    });
    setNewColorInput('');
  };

  const handleRemoveColor = (colorStr: string) => {
    setEditingProduct((prev) => {
      const newColors = (prev?.colors || []).filter((c) => c !== colorStr);
      const newImgColors = { ...(prev?.image_colors || {}) };
      Object.keys(newImgColors).forEach((k) => {
        if (newImgColors[k] === colorStr) delete newImgColors[k];
      });
      return { ...prev, colors: newColors, image_colors: newImgColors };
    });
  };

  const handleMapImageColor = (imgUrl: string, colorName: string) => {
    setEditingProduct((prev) => {
      const updatedMap = { ...(prev?.image_colors || {}) };
      if (!colorName) {
        delete updatedMap[imgUrl];
      } else {
        updatedMap[imgUrl] = colorName;
      }
      return { ...prev, image_colors: updatedMap };
    });
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

      if (res.ok) {
        setIsModalOpen(false);
        onRefresh();
      } else {
        alert('Failed to save product');
      }
    } catch (err) {
      alert('Network error while saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products Catalog</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage inventory, prices, images, and collections.</p>
        </div>

        <button
          onClick={handleOpenNew}
          className="inline-flex items-center space-x-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-[20px] border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by name or slug..."
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-3 py-2 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#16A34A] focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full sm:w-48 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-[#16A34A]"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Item</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Badges</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518'}
                        alt={p.name}
                        className="w-10 h-12 object-cover rounded-lg border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-600">
                    {p.category_name || categories.find((c) => c.id === p.category_id)?.name || 'General'}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    ৳{p.price.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                        p.stock_quantity <= 0
                          ? 'bg-red-100 text-red-700'
                          : p.stock_quantity <= 3
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {p.stock_quantity <= 0 ? 'Sold Out' : `${p.stock_quantity} in stock`}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {p.is_featured && (
                        <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Featured
                        </span>
                      )}
                      {p.is_trending && (
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Trending
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-[24px] border border-slate-200 text-slate-900 p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingProduct.id ? `Edit Product #${editingProduct.id}` : 'Create New Product'}
                </h3>
                <p className="text-xs text-slate-500">Configure catalog details, pricing and images.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="e.g. SK Heavyweight Hoodie"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A] focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Slug (URL Key)</label>
                  <input
                    type="text"
                    value={editingProduct.slug || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                    placeholder="e.g. sk-heavyweight-hoodie"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Price (৳ Taka) *</label>
                  <input
                    type="number"
                    value={editingProduct.price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A] focus:bg-white font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Category *</label>
                  <select
                    value={editingProduct.category_id || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category_id: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={editingProduct.stock_quantity ?? 10}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Product Description</label>
                <textarea
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A] focus:bg-white"
                  placeholder="Heavyweight cotton apparel crafted in Milano..."
                />
              </div>

              {/* Dynamic Sizes Configuration */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-bold">Dynamic Sizes</label>
                  <span className="text-[10px] text-slate-400 font-mono">e.g. S, M, L, XL, XXL</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 min-h-[32px]">
                  {(editingProduct.sizes || []).map((sz) => (
                    <span
                      key={sz}
                      className="inline-flex items-center space-x-1 bg-slate-100 border border-slate-300 text-slate-800 font-bold px-2.5 py-1 rounded-lg text-xs"
                    >
                      <span>{sz}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(sz)}
                        className="text-slate-400 hover:text-red-600 ml-1"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  {(editingProduct.sizes || []).length === 0 && (
                    <span className="text-slate-400 italic text-[11px]">No sizes added yet</span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newSizeInput}
                    onChange={(e) => setNewSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSize();
                      }
                    }}
                    placeholder="Type size name (e.g. XL or 32)"
                    className="flex-1 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSize()}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-3 py-1.5 rounded-xl text-xs transition-colors shrink-0"
                  >
                    + Add Size
                  </button>
                </div>

                {/* Size Presets */}
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 pt-1 overflow-x-auto">
                  <span className="font-semibold text-slate-500">Quick Presets:</span>
                  {['S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', 'Free Size'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleAddSize(p)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono"
                    >
                      +{p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Colors Configuration */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-bold">Dynamic Colors</label>
                  <span className="text-[10px] text-slate-400 font-mono">e.g. Navy, Red, Washed Black</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 min-h-[32px]">
                  {(editingProduct.colors || []).map((clr) => (
                    <span
                      key={clr}
                      className="inline-flex items-center space-x-1 bg-slate-900 border border-slate-700 text-white font-bold px-2.5 py-1 rounded-lg text-xs shadow-sm"
                    >
                      <span>{clr}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(clr)}
                        className="text-slate-400 hover:text-red-400 ml-1"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  {(editingProduct.colors || []).length === 0 && (
                    <span className="text-slate-400 italic text-[11px]">No colors added yet</span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newColorInput}
                    onChange={(e) => setNewColorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddColor();
                      }
                    }}
                    placeholder="Type color name (e.g. Navy Blue or Olive)"
                    className="flex-1 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddColor()}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-3 py-1.5 rounded-xl text-xs transition-colors shrink-0"
                  >
                    + Add Color
                  </button>
                </div>
              </div>

              {/* Product Images & Image-to-Color Mapping */}
              <div className="space-y-3 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-bold">Product Images & Image-to-Color Mapping</label>
                  <span className="text-[10px] text-slate-400">Map each image to a specific color variant</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                  {(editingProduct.images || []).map((img, idx) => {
                    const mappedColor = editingProduct.image_colors?.[img] || '';
                    return (
                      <div
                        key={idx}
                        className="flex items-center space-x-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl relative group"
                      >
                        <div className="relative w-16 h-20 rounded-lg border border-slate-200 overflow-hidden bg-slate-200 shrink-0">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          {mappedColor && (
                            <span className="absolute bottom-0 inset-x-0 bg-black/80 text-white text-[9px] font-bold py-0.5 text-center truncate px-1">
                              {mappedColor}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <p className="text-[10px] text-slate-400 font-mono truncate">{img}</p>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                              Mapped Color Variant:
                            </label>
                            <select
                              value={mappedColor}
                              onChange={(e) => handleMapImageColor(img, e.target.value)}
                              className="w-full bg-white border border-slate-200 px-2 py-1 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#16A34A] font-semibold"
                            >
                              <option value="">-- No Color Mapped --</option>
                              {(editingProduct.colors || []).map((clr) => (
                                <option key={clr} value={clr}>
                                  {clr}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove Image"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Upload or Add Image URL */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-2 rounded-xl border border-slate-200 inline-flex items-center justify-center space-x-2 shrink-0">
                    <Upload size={14} />
                    <span>{uploading ? 'Uploading...' : 'Upload Image File'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                  </label>

                  <div className="flex items-center gap-1 flex-1">
                    <input
                      type="text"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Or paste image URL (https://...)"
                      className="flex-1 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#16A34A] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-3 py-2 rounded-xl text-xs shrink-0"
                    >
                      + Add URL
                    </button>
                  </div>
                </div>
              </div>

              {/* Flags Toggles */}
              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_featured || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })}
                    className="accent-[#16A34A] w-4 h-4 rounded"
                  />
                  <span>Featured Product</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_trending || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_trending: e.target.checked })}
                    className="accent-[#16A34A] w-4 h-4 rounded"
                  />
                  <span>Trending Collection</span>
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 text-xs font-semibold bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl shadow-sm"
                >
                  {loading ? 'Saving...' : 'Save Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
