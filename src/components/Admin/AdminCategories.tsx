import React, { useState } from 'react';
import { Category } from '../../types';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface AdminCategoriesProps {
  categories: Category[];
  onRefresh: () => void;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({ categories, onRefresh }) => {
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpenNew = () => {
    setEditingCategory({
      name: '',
      slug: '',
      image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
      sort_order: categories.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory({ ...c });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      onRefresh();
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) {
      alert('Category Name is required.');
      return;
    }

    setLoading(true);

    try {
      const isEdit = !!editingCategory.id;
      const url = isEdit ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsModalOpen(false);
        setEditingCategory(null);
        onRefresh();
      } else {
        alert(data.error || 'Failed to save category');
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
            CATEGORY INDEX & REORDER
          </h2>
          <p className="font-mono text-xs uppercase text-neutral-400 mt-1">
            MANAGE CATEGORIES THAT DISPLAY ON THE PUBLIC NAVBAR & QUICK NAV
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="bg-white text-black hover:bg-neutral-200 px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors"
        >
          <Plus size={16} />
          <span>ADD CATEGORY</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-neutral-900 border border-white/10 p-4 flex flex-col justify-between space-y-4"
          >
            <div className="flex space-x-4 items-center">
              <img
                src={cat.image_url}
                alt={cat.name}
                className="w-16 h-20 object-cover bg-black border border-white/20"
              />
              <div>
                <span className="font-mono text-[10px] text-amber-400 uppercase font-bold">
                  SORT ORDER: #{cat.sort_order}
                </span>
                <h3 className="font-bold text-lg uppercase text-white">{cat.name}</h3>
                <span className="font-mono text-xs text-neutral-500">{cat.slug}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 border-t border-white/10 pt-3">
              <button
                onClick={() => handleOpenEdit(cat)}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 font-mono text-xs text-white uppercase flex items-center space-x-1"
              >
                <Edit2 size={12} />
                <span>EDIT</span>
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="px-3 py-1.5 bg-red-950 hover:bg-red-900 font-mono text-xs text-red-300 uppercase flex items-center space-x-1"
              >
                <Trash2 size={12} />
                <span>DELETE</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-neutral-900 border-2 border-white text-white p-6 space-y-6">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold uppercase text-lg">
                {editingCategory.id ? 'EDIT CATEGORY' : 'ADD CATEGORY'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-neutral-400 uppercase mb-1">CATEGORY NAME *</label>
                <input
                  type="text"
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="E.G. HOODIES"
                  className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase mb-1">SLUG</label>
                <input
                  type="text"
                  value={editingCategory.slug || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  placeholder="E.G. hoodies"
                  className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase mb-1">IMAGE URL</label>
                <input
                  type="text"
                  value={editingCategory.image_url || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, image_url: e.target.value })}
                  placeholder="HTTPS://..."
                  className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase mb-1">SORT ORDER (DISPLAY PRIORITY)</label>
                <input
                  type="number"
                  value={editingCategory.sort_order ?? 1}
                  onChange={(e) => setEditingCategory({ ...editingCategory, sort_order: parseInt(e.target.value) })}
                  className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-white/20 text-white font-bold uppercase"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-white text-black font-bold uppercase px-6 py-2 hover:bg-neutral-200"
                >
                  {loading ? 'SAVING...' : 'SAVE CATEGORY'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};
