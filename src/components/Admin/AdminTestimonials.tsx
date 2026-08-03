import React, { useState, useEffect } from 'react';
import { Star, Plus, Trash2, Edit2, Eye, EyeOff, Save, CheckCircle2, MessageSquare, Upload, X } from 'lucide-react';
import { Testimonial } from '../../types';
import { uploadImageToCloudinary } from '../../lib/cloudinary';

export const AdminTestimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    review: '',
    rating: 5,
    avatar_url: '',
    is_visible: true
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTestimonials(data);
      }
    } catch (err) {
      console.error('Failed to load admin testimonials', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      role: 'Dhaka, Bangladesh',
      review: '',
      rating: 5,
      avatar_url: '',
      is_visible: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Testimonial) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      role: item.role || '',
      review: item.review,
      rating: item.rating || 5,
      avatar_url: item.avatar_url || '',
      is_visible: item.is_visible
    });
    setIsModalOpen(true);
  };

  const handleToggleVisibility = async (item: Testimonial) => {
    try {
      const updated = !item.is_visible;
      await fetch(`/api/testimonials/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          is_visible: updated
        })
      });
      fetchTestimonials();
    } catch (err) {
      alert('Failed to update testimonial visibility');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this customer review?')) return;
    try {
      await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
      fetchTestimonials();
    } catch (err) {
      alert('Failed to delete testimonial');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setFormData((prev) => ({ ...prev, avatar_url: url }));
    } catch (err) {
      alert('Failed to upload avatar image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.review) {
      alert('Please fill in Customer Name and Review text.');
      return;
    }

    try {
      if (editingItem) {
        await fetch(`/api/testimonials/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('/api/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      setIsModalOpen(false);
      fetchTestimonials();
    } catch (err) {
      alert('Failed to save testimonial');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-[#16A34A] font-mono text-xs font-bold uppercase mb-1">
            <MessageSquare size={16} />
            <span>Store Reviews & Feedback</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Manage Customer Testimonials</h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Add customer reviews, toggle visibility on storefront, and edit feedback content dynamically.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#16A34A] hover:bg-[#15803D] text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider inline-flex items-center space-x-2 transition-all shadow shrink-0"
        >
          <Plus size={16} />
          <span>Add New Review</span>
        </button>
      </div>

      {/* Testimonials List Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 font-mono text-xs">Loading testimonials...</div>
      ) : testimonials.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500 font-mono text-sm">No reviews found. Click "Add New Review" to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border bg-white transition-all flex flex-col justify-between space-y-4 ${
                item.is_visible ? 'border-slate-200 shadow-sm' : 'border-amber-200 bg-amber-50/20 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  {/* Rating */}
                  <div className="flex items-center space-x-1 text-amber-400">
                    {Array.from({ length: item.rating || 5 }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>

                  {/* Visibility Badge */}
                  <button
                    onClick={() => handleToggleVisibility(item)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border inline-flex items-center space-x-1 transition-all ${
                      item.is_visible
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    {item.is_visible ? <Eye size={12} /> : <EyeOff size={12} />}
                    <span>{item.is_visible ? 'Visible' : 'Hidden'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed italic mb-4">"{item.review}"</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center space-x-2.5">
                  {item.avatar_url ? (
                    <img src={item.avatar_url} alt={item.name} className="w-8 h-8 rounded-full object-cover border" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center font-bold text-xs">
                      {item.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">{item.name}</h4>
                    {item.role && <p className="text-[10px] text-slate-500 font-mono">{item.role}</p>}
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit Review"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b bg-slate-50">
              <h3 className="font-extrabold text-sm text-slate-900 uppercase">
                {editingItem ? 'Edit Review' : 'Add New Customer Review'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Siam Ahmed"
                  className="w-full px-3 py-2 border rounded-xl text-xs font-medium focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Location / Role</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g. Dhaka, Bangladesh"
                  className="w-full px-3 py-2 border rounded-xl text-xs font-medium focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Star Rating (1 - 5)</label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-medium focus:outline-none focus:border-[#16A34A]"
                >
                  <option value={5}>5 Stars (Excellent)</option>
                  <option value={4}>4 Stars (Good)</option>
                  <option value={3}>3 Stars (Average)</option>
                  <option value={2}>2 Stars (Poor)</option>
                  <option value={1}>1 Star</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Review Content *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.review}
                  onChange={(e) => setFormData((prev) => ({ ...prev, review: e.target.value }))}
                  placeholder="Write the customer review details here..."
                  className="w-full px-3 py-2 border rounded-xl text-xs font-medium focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Avatar Image (Optional)</label>
                <div className="flex items-center gap-2 mb-2">
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-1.5 rounded-lg border text-xs inline-flex items-center space-x-1.5">
                    <Upload size={13} />
                    <span>{uploading ? 'Uploading...' : 'Upload Avatar'}</span>
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploading} />
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, avatar_url: e.target.value }))}
                  placeholder="Or enter image URL..."
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="is_visible_cb"
                  checked={formData.is_visible}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_visible: e.target.checked }))}
                  className="rounded text-[#16A34A] focus:ring-[#16A34A]"
                />
                <label htmlFor="is_visible_cb" className="text-xs font-bold text-slate-800">
                  Visible on Storefront Testimonials Section
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
