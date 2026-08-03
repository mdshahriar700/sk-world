import React, { useState } from 'react';
import { SiteSettings } from '../../types';
import { Save, CheckCircle2, Upload, Sliders, ToggleLeft, ToggleRight, Sparkles, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { uploadImageToCloudinary } from '../../lib/cloudinary';

interface AdminSettingsProps {
  settings: Partial<SiteSettings>;
  onRefresh: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ settings, onRefresh }) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    site_logo_url: settings.site_logo_url || '',
    logo_text: settings.logo_text || 'SK WORLD',
    top_announcement_enabled: settings.top_announcement_enabled || 'true',
    top_announcement_text:
      settings.top_announcement_text ||
      'SK WORLD • BANGLADESH EDITION 2026 • CASH ON DELIVERY NATIONWIDE • FREE EXPRESS SHIPPING OVER ৳2,500',
    hero_headline: settings.hero_headline || 'YOURSELF INTO THE RIGHT GEAR',
    hero_subheading:
      settings.hero_subheading ||
      'MILANO SUMMER & WINTER COLLECTION 2026. ELEVATED STREETWEAR & ESSENTIAL CUTS DESIGNED FOR THE MODERN ICON.',
    hero_image_url:
      settings.hero_image_url ||
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1600',
    hero_images: settings.hero_images || '',
    hero_cta_text: settings.hero_cta_text || 'VIEW SUMMER COLLECTIONS',
    marquee_enabled: settings.marquee_enabled || 'true',
    marquee_text:
      settings.marquee_text ||
      'SK WORLD MILANO • ELEVATED STREETWEAR BANGLADESH • CASH ON DELIVERY ALL BD • AUTHENTIC APPAREL 2026 • FAST DISPATCH IN DHAKA',
    sale_banner_enabled: settings.sale_banner_enabled || 'true',
    sale_banner_percent: settings.sale_banner_percent || '30',
    sale_banner_heading:
      settings.sale_banner_heading ||
      'SUMMER FLASH SALE — UP TO 30% OFF ON ALL HOODIES & JACKETS WITH FREE EXPRESS SHIPPING',
    sale_banner_text:
      settings.sale_banner_text ||
      'Discount applied automatically at checkout. Cash on Delivery available across all 64 districts in Bangladesh.',
    sale_banner_cta: settings.sale_banner_cta || 'SHOP SALE COLLECTIONS',
    feature1_enabled: settings.feature1_enabled || 'true',
    feature1_heading: settings.feature1_heading || 'PREMIUM MILANO FABRIC',
    feature1_text:
      settings.feature1_text ||
      'Crafted from heavy 450gsm French Terry cotton for structure, comfort, and longevity.',
    feature1_image:
      settings.feature1_image ||
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200',
    feature2_enabled: settings.feature2_enabled || 'true',
    feature2_heading: settings.feature2_heading || 'EXPRESS ALL BANGLADESH DISPATCH',
    feature2_text:
      settings.feature2_text ||
      'Dispatched within 24 hours with Cash on Delivery across Dhaka, Chittagong, Sylhet & all 64 districts.',
    feature2_image:
      settings.feature2_image ||
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200',
    offer_popup_enabled: settings.offer_popup_enabled || 'true',
    offer_popup_title: settings.offer_popup_title || 'SPECIAL BANGLADESH LAUNCH OFFER ⚡',
    offer_popup_text:
      settings.offer_popup_text ||
      'FLAT 15% EXTRA DISCOUNT ON YOUR FIRST ORDER! CASH ON DELIVERY AVAILABLE ACROSS ALL 64 DISTRICTS IN BANGLADESH.',
    offer_popup_code: settings.offer_popup_code || 'SKBD15',
    newsletter_heading: settings.newsletter_heading || 'JOIN THE SK WORLD INSIDERS CLUB',
    footer_email: settings.footer_email || 'contact@skworl.com',
    footer_phone: settings.footer_phone || '+880 1712 345 678',
    social_instagram: settings.social_instagram || 'https://instagram.com',
    social_twitter: settings.social_twitter || 'https://twitter.com',
    social_facebook: settings.social_facebook || 'https://facebook.com',
    social_youtube: settings.social_youtube || 'https://youtube.com',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const handleFileUpload = async (fieldKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(fieldKey);
    try {
      const url = await uploadImageToCloudinary(file);
      handleChange(fieldKey, url);
    } catch (err) {
      alert(`Failed to upload image for ${fieldKey}`);
    } finally {
      setUploadingField(null);
    }
  };

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const [newHeroUrlInput, setNewHeroUrlInput] = useState('');

  // Get current list of hero images
  const getHeroImagesList = (): string[] => {
    if (formData.hero_images) {
      try {
        const parsed = JSON.parse(formData.hero_images);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        const list = formData.hero_images.split(',').map((s) => s.trim()).filter(Boolean);
        if (list.length > 0) return list;
      }
    }
    if (formData.hero_image_url) {
      return [formData.hero_image_url];
    }
    return [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1600',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1600',
    ];
  };

  const currentHeroImages = getHeroImagesList();

  const updateHeroImagesState = (newArray: string[]) => {
    const jsonStr = JSON.stringify(newArray);
    setFormData((prev) => ({
      ...prev,
      hero_images: jsonStr,
      hero_image_url: newArray.length > 0 ? newArray[0] : '',
    }));
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingField('hero_images_upload');
    try {
      const url = await uploadImageToCloudinary(file);
      const updated = [...currentHeroImages, url];
      updateHeroImagesState(updated);
    } catch (err) {
      alert('Failed to upload hero slide image');
    } finally {
      setUploadingField(null);
    }
  };

  const handleAddHeroUrl = () => {
    if (!newHeroUrlInput.trim()) return;
    const updated = [...currentHeroImages, newHeroUrlInput.trim()];
    updateHeroImagesState(updated);
    setNewHeroUrlInput('');
  };

  const handleRemoveHeroImage = (indexToRemove: number) => {
    const updated = currentHeroImages.filter((_, idx) => idx !== indexToRemove);
    updateHeroImagesState(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        onRefresh();
        setTimeout(() => setSuccess(false), 4000);
      } else {
        alert('Failed to update site settings');
      }
    } catch (err) {
      alert('Network error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Site Configuration</h1>
          <p className="text-sm text-slate-500 mt-0.5">Dynamically turn storefront sections on/off, edit texts, banners and images.</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center space-x-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-50"
        >
          <Save size={16} />
          <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-medium text-xs flex items-center space-x-2 shadow-sm">
          <CheckCircle2 size={18} className="text-[#16A34A]" />
          <span>Site settings updated successfully! Changes are live on the storefront.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        
        {/* 1. Brand & Announcement Bar */}
        <div className="bg-white rounded-[20px] border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>1. Brand Header & Announcement Bar</span>
            <span className="text-xs text-slate-400 font-normal">Header Controls</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand Logo Text</label>
              <input
                type="text"
                value={formData.logo_text || ''}
                onChange={(e) => handleChange('logo_text', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Top Announcement Bar Status</label>
              <select
                value={formData.top_announcement_enabled || 'true'}
                onChange={(e) => handleChange('top_announcement_enabled', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A]"
              >
                <option value="true">Enabled (Show Bar)</option>
                <option value="false">Disabled (Hide Bar)</option>
              </select>
            </div>
          </div>

          {/* Website Logo & Favicon Upload */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div>
              <label className="block font-semibold text-slate-800 text-xs mb-0.5">Website Logo & Tab Favicon</label>
              <p className="text-[11px] text-slate-500 mb-2">Upload your store logo. It will display in the header navbar and as the browser tab favicon.</p>
            </div>

            {formData.site_logo_url && (
              <div className="flex items-center space-x-3 p-2 bg-white rounded-xl border border-slate-200 w-fit">
                <img src={formData.site_logo_url} alt="Logo preview" className="w-10 h-10 object-contain rounded-lg border border-slate-100" />
                <span className="text-xs font-mono text-slate-600 truncate max-w-xs">{formData.site_logo_url}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <label className="cursor-pointer bg-white hover:bg-slate-100 text-slate-800 font-semibold px-3.5 py-2 rounded-xl border border-slate-200 inline-flex items-center justify-center space-x-2 text-xs">
                <Upload size={14} />
                <span>{uploadingField === 'site_logo_url' ? 'Uploading Logo...' : 'Upload Logo Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('site_logo_url', e)}
                  className="hidden"
                  disabled={uploadingField === 'site_logo_url'}
                />
              </label>

              <input
                type="text"
                value={formData.site_logo_url || ''}
                onChange={(e) => handleChange('site_logo_url', e.target.value)}
                placeholder="Or paste direct image URL (e.g. https://.../logo.png)"
                className="flex-1 bg-white border border-slate-200 px-3 py-2 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#16A34A]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Top Announcement Message</label>
            <input
              type="text"
              value={formData.top_announcement_text || ''}
              onChange={(e) => handleChange('top_announcement_text', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A]"
            />
          </div>
        </div>

        {/* 2. Hero Section Settings */}
        <div className="bg-white rounded-[20px] border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            2. Hero Banner Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hero Headline</label>
              <input
                type="text"
                value={formData.hero_headline || ''}
                onChange={(e) => handleChange('hero_headline', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hero CTA Button Text</label>
              <input
                type="text"
                value={formData.hero_cta_text || ''}
                onChange={(e) => handleChange('hero_cta_text', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hero Subheading</label>
            <textarea
              value={formData.hero_subheading || ''}
              onChange={(e) => handleChange('hero_subheading', e.target.value)}
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A]"
            />
          </div>

          {/* Multiple Hero Slider Images */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="block font-bold text-slate-800 text-xs">Hero Slider Images (Multiple Images Carousel)</label>
                <p className="text-[11px] text-slate-500">Add multiple images. They will automatically slide with smooth transitions on your storefront.</p>
              </div>
              <span className="font-mono text-xs bg-slate-100 font-bold px-2.5 py-1 rounded-full text-slate-700">
                {currentHeroImages.length} {currentHeroImages.length === 1 ? 'Slide' : 'Slides'}
              </span>
            </div>

            {/* List of current slide images */}
            {currentHeroImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                {currentHeroImages.map((imgUrl, idx) => (
                  <div key={idx} className="relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-900 aspect-[4/3] shadow-sm">
                    <img src={imgUrl} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                    <span className="absolute top-2 left-2 font-mono text-[10px] font-bold bg-black/80 text-white px-2 py-0.5 rounded-md border border-white/20">
                      Slide #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHeroImage(idx)}
                      title="Remove Slide"
                      className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                    <div className="absolute bottom-2 left-2 right-2 text-[10px] text-white/80 font-mono truncate">
                      {imgUrl}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add new slide image controls */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="block font-semibold text-xs text-slate-800">Add Slide Image</span>
              <div className="flex flex-col sm:flex-row gap-2">
                <label className="cursor-pointer bg-white hover:bg-slate-100 text-slate-800 font-semibold px-3.5 py-2 rounded-xl border border-slate-200 inline-flex items-center justify-center space-x-2 text-xs">
                  <Upload size={14} />
                  <span>{uploadingField === 'hero_images_upload' ? 'Uploading Image...' : 'Upload Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroImageUpload}
                    className="hidden"
                    disabled={uploadingField === 'hero_images_upload'}
                  />
                </label>

                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newHeroUrlInput}
                    onChange={(e) => setNewHeroUrlInput(e.target.value)}
                    placeholder="Or paste image URL (e.g. https://.../photo.jpg)"
                    className="flex-1 bg-white border border-slate-200 px-3 py-2 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#16A34A]"
                  />
                  <button
                    type="button"
                    onClick={handleAddHeroUrl}
                    className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold px-3.5 py-2 rounded-xl text-xs inline-flex items-center space-x-1"
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Marquee Ticker */}
        <div className="bg-white rounded-[20px] border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            3. Marquee Ticker Banner
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ticker Status</label>
              <select
                value={formData.marquee_enabled || 'true'}
                onChange={(e) => handleChange('marquee_enabled', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A]"
              >
                <option value="true">Enabled (Show Ticker)</option>
                <option value="false">Disabled (Hide Ticker)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Ticker Text (Separate with •)</label>
              <input
                type="text"
                value={formData.marquee_text || ''}
                onChange={(e) => handleChange('marquee_text', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A]"
              />
            </div>
          </div>
        </div>

        {/* 4. Sale Promo Banner */}
        <div className="bg-white rounded-[20px] border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            4. Sale Banner Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Banner Status</label>
              <select
                value={formData.sale_banner_enabled || 'true'}
                onChange={(e) => handleChange('sale_banner_enabled', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A]"
              >
                <option value="true">Enabled (Show Banner)</option>
                <option value="false">Disabled (Hide Banner)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Discount % Badge</label>
              <input
                type="text"
                value={formData.sale_banner_percent || ''}
                onChange={(e) => handleChange('sale_banner_percent', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A] font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">CTA Button Text</label>
              <input
                type="text"
                value={formData.sale_banner_cta || ''}
                onChange={(e) => handleChange('sale_banner_cta', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Banner Main Heading</label>
            <input
              type="text"
              value={formData.sale_banner_heading || ''}
              onChange={(e) => handleChange('sale_banner_heading', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Banner Description</label>
            <textarea
              value={formData.sale_banner_text || ''}
              onChange={(e) => handleChange('sale_banner_text', e.target.value)}
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A]"
            />
          </div>
        </div>

        {/* 5. Feature Blocks */}
        <div className="bg-white rounded-[20px] border border-slate-200 p-5 shadow-sm space-y-6">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            5. Homepage Feature Cards
          </h3>

          {/* Feature 1 */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 text-xs">Feature Card 01</span>
              <select
                value={formData.feature1_enabled || 'true'}
                onChange={(e) => handleChange('feature1_enabled', e.target.value)}
                className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-900 text-xs focus:outline-none"
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Heading</label>
                <input
                  type="text"
                  value={formData.feature1_heading || ''}
                  onChange={(e) => handleChange('feature1_heading', e.target.value)}
                  className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Image Upload</label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer bg-white hover:bg-slate-100 text-slate-800 font-semibold px-3 py-2 rounded-xl border border-slate-200 inline-flex items-center space-x-1.5">
                    <Upload size={14} />
                    <span>{uploadingField === 'feature1_image' ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('feature1_image', e)}
                      className="hidden"
                      disabled={uploadingField === 'feature1_image'}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Description</label>
              <textarea
                value={formData.feature1_text || ''}
                onChange={(e) => handleChange('feature1_text', e.target.value)}
                rows={2}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A]"
              />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 text-xs">Feature Card 02</span>
              <select
                value={formData.feature2_enabled || 'true'}
                onChange={(e) => handleChange('feature2_enabled', e.target.value)}
                className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-900 text-xs focus:outline-none"
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Heading</label>
                <input
                  type="text"
                  value={formData.feature2_heading || ''}
                  onChange={(e) => handleChange('feature2_heading', e.target.value)}
                  className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Image Upload</label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer bg-white hover:bg-slate-100 text-slate-800 font-semibold px-3 py-2 rounded-xl border border-slate-200 inline-flex items-center space-x-1.5">
                    <Upload size={14} />
                    <span>{uploadingField === 'feature2_image' ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('feature2_image', e)}
                      className="hidden"
                      disabled={uploadingField === 'feature2_image'}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Description</label>
              <textarea
                value={formData.feature2_text || ''}
                onChange={(e) => handleChange('feature2_text', e.target.value)}
                rows={2}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A]"
              />
            </div>
          </div>
        </div>

        {/* 6. Dynamic Offer Popup */}
        <div className="bg-white rounded-[20px] border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            6. Offer Popup Modal
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Offer Popup Status</label>
              <select
                value={formData.offer_popup_enabled || 'true'}
                onChange={(e) => handleChange('offer_popup_enabled', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A]"
              >
                <option value="true">Enabled (Show Popup)</option>
                <option value="false">Disabled (Hide Popup)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Promo Coupon Code</label>
              <input
                type="text"
                value={formData.offer_popup_code || ''}
                onChange={(e) => handleChange('offer_popup_code', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-[#16A34A] font-bold focus:outline-none focus:border-[#16A34A]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Popup Title</label>
            <input
              type="text"
              value={formData.offer_popup_title || ''}
              onChange={(e) => handleChange('offer_popup_title', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Popup Offer Details</label>
            <textarea
              value={formData.offer_popup_text || ''}
              onChange={(e) => handleChange('offer_popup_text', e.target.value)}
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A]"
            />
          </div>
        </div>

        {/* 7. Footer Contact Settings */}
        <div className="bg-white rounded-[20px] border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            7. Footer & Contact Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Support Email</label>
              <input
                type="email"
                value={formData.footer_email || ''}
                onChange={(e) => handleChange('footer_email', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Support Phone</label>
              <input
                type="text"
                value={formData.footer_phone || ''}
                onChange={(e) => handleChange('footer_phone', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-[#16A34A]"
              />
            </div>
          </div>
        </div>

        {/* Save CTA Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? 'Saving Changes...' : 'Save All Site Settings'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
