import React, { useState } from 'react';
import { SiteSettings } from '../../types';
import { Save, CheckCircle2 } from 'lucide-react';

interface AdminSettingsProps {
  settings: Partial<SiteSettings>;
  onRefresh: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ settings, onRefresh }) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    logo_text: settings.logo_text || 'SK WORL',
    offer_popup_enabled: settings.offer_popup_enabled || 'true',
    offer_popup_title: settings.offer_popup_title || 'SPECIAL BANGLADESH LAUNCH OFFER ⚡',
    offer_popup_text:
      settings.offer_popup_text ||
      'FLAT 15% EXTRA DISCOUNT ON YOUR FIRST ORDER! CASH ON DELIVERY AVAILABLE ACROSS ALL 64 DISTRICTS IN BANGLADESH.',
    offer_popup_code: settings.offer_popup_code || 'SKBD15',
    hero_headline: settings.hero_headline || 'YOURSELF INTO THE RIGHT GEAR',
    hero_subheading:
      settings.hero_subheading ||
      'MILANO SUMMER & WINTER COLLECTION 2026. ELEVATED STREETWEAR & ESSENTIAL CUTS DESIGNED FOR THE MODERN ICON.',
    hero_image_url:
      settings.hero_image_url ||
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1600',
    hero_cta_text: settings.hero_cta_text || 'VIEW SUMMER COLLECTIONS',
    sale_banner_percent: settings.sale_banner_percent || '30',
    sale_banner_text:
      settings.sale_banner_text ||
      'SUMMER FLASH SALE — UP TO 30% OFF ON ALL HOODIES & JACKETS WITH FREE EXPRESS SHIPPING',
    newsletter_heading: settings.newsletter_heading || 'JOIN THE SK WORL INSIDERS CLUB',
    footer_email: settings.footer_email || 'contact@skworl.com',
    footer_phone: settings.footer_phone || '+39 02 8945 1200',
    social_instagram: settings.social_instagram || 'https://instagram.com',
    social_twitter: settings.social_twitter || 'https://twitter.com',
    social_facebook: settings.social_facebook || 'https://facebook.com',
    social_youtube: settings.social_youtube || 'https://youtube.com',
    feature1_heading: settings.feature1_heading || 'PREMIUM MILANO FABRIC',
    feature1_text:
      settings.feature1_text ||
      'Crafted from heavy 450gsm French Terry cotton for structure, comfort, and longevity.',
    feature1_image:
      settings.feature1_image ||
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200',
    feature2_heading: settings.feature2_heading || 'EXPRESS WORLDWIDE SHIPPING',
    feature2_text:
      settings.feature2_text ||
      'Dispatched within 24 hours in zero-plastic eco-friendly luxury packaging.',
    feature2_image:
      settings.feature2_image ||
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
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
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-black uppercase text-white font-sans tracking-tight">
          HOMEPAGE & SITE CONFIGURATION
        </h2>
        <p className="font-mono text-xs uppercase text-neutral-400 mt-1">
          EDIT HERO TEXT, PROMO BANNERS, FEATURE CARDS & CONTACT INFO LIVE
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-950 border border-emerald-600 text-emerald-200 font-mono text-xs uppercase flex items-center space-x-2">
          <CheckCircle2 size={18} />
          <span>SITE SETTINGS UPDATED SUCCESSFULLY! CHANGES ARE LIVE ON THE HOMEPAGE.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 font-mono text-xs">
        
        {/* Brand Header & Hero Settings */}
        <div className="bg-neutral-900 border border-white/10 p-6 space-y-4">
          <h3 className="font-bold text-sm uppercase text-amber-400 border-b border-white/10 pb-2">
            1. BRAND & HERO BANNER SETTINGS
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 uppercase mb-1">BRAND LOGO TEXT</label>
              <input
                type="text"
                value={formData.logo_text || ''}
                onChange={(e) => handleChange('logo_text', e.target.value)}
                className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-neutral-400 uppercase mb-1">HERO CTA BUTTON TEXT</label>
              <input
                type="text"
                value={formData.hero_cta_text || ''}
                onChange={(e) => handleChange('hero_cta_text', e.target.value)}
                className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 uppercase mb-1">HERO MAIN HEADLINE</label>
            <input
              type="text"
              value={formData.hero_headline || ''}
              onChange={(e) => handleChange('hero_headline', e.target.value)}
              className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none uppercase"
            />
          </div>

          <div>
            <label className="block text-neutral-400 uppercase mb-1">HERO SUBHEADING TEXT</label>
            <textarea
              value={formData.hero_subheading || ''}
              onChange={(e) => handleChange('hero_subheading', e.target.value)}
              rows={2}
              className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none uppercase resize-none"
            />
          </div>

          <div>
            <label className="block text-neutral-400 uppercase mb-1">HERO BACKGROUND IMAGE URL</label>
            <input
              type="text"
              value={formData.hero_image_url || ''}
              onChange={(e) => handleChange('hero_image_url', e.target.value)}
              className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Sale Banner Settings */}
        <div className="bg-neutral-900 border border-white/10 p-6 space-y-4">
          <h3 className="font-bold text-sm uppercase text-amber-400 border-b border-white/10 pb-2">
            2. SALE BANNER SETTINGS
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-neutral-400 uppercase mb-1">DISCOUNT %</label>
              <input
                type="text"
                value={formData.sale_banner_percent || ''}
                onChange={(e) => handleChange('sale_banner_percent', e.target.value)}
                className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-neutral-400 uppercase mb-1">SALE BANNER TEXT</label>
              <input
                type="text"
                value={formData.sale_banner_text || ''}
                onChange={(e) => handleChange('sale_banner_text', e.target.value)}
                className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none uppercase"
              />
            </div>
          </div>
        </div>

        {/* Feature Section 1 & 2 */}
        <div className="bg-neutral-900 border border-white/10 p-6 space-y-6">
          <h3 className="font-bold text-sm uppercase text-amber-400 border-b border-white/10 pb-2">
            3. EDITABLE FEATURE BLOCKS
          </h3>

          {/* Feature 1 */}
          <div className="space-y-3 bg-black/40 p-4 border border-white/10">
            <span className="text-white font-bold uppercase block">FEATURE BLOCK 01</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 uppercase mb-1">HEADING</label>
                <input
                  type="text"
                  value={formData.feature1_heading || ''}
                  onChange={(e) => handleChange('feature1_heading', e.target.value)}
                  className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none uppercase"
                />
              </div>
              <div>
                <label className="block text-neutral-400 uppercase mb-1">IMAGE URL</label>
                <input
                  type="text"
                  value={formData.feature1_image || ''}
                  onChange={(e) => handleChange('feature1_image', e.target.value)}
                  className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-neutral-400 uppercase mb-1">DESCRIPTION</label>
              <textarea
                value={formData.feature1_text || ''}
                onChange={(e) => handleChange('feature1_text', e.target.value)}
                rows={2}
                className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none uppercase resize-none"
              />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="space-y-3 bg-black/40 p-4 border border-white/10">
            <span className="text-white font-bold uppercase block">FEATURE BLOCK 02</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 uppercase mb-1">HEADING</label>
                <input
                  type="text"
                  value={formData.feature2_heading || ''}
                  onChange={(e) => handleChange('feature2_heading', e.target.value)}
                  className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none uppercase"
                />
              </div>
              <div>
                <label className="block text-neutral-400 uppercase mb-1">IMAGE URL</label>
                <input
                  type="text"
                  value={formData.feature2_image || ''}
                  onChange={(e) => handleChange('feature2_image', e.target.value)}
                  className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-neutral-400 uppercase mb-1">DESCRIPTION</label>
              <textarea
                value={formData.feature2_text || ''}
                onChange={(e) => handleChange('feature2_text', e.target.value)}
                rows={2}
                className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none uppercase resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Info & Social Links */}
        <div className="bg-neutral-900 border border-white/10 p-6 space-y-4">
          <h3 className="font-bold text-sm uppercase text-amber-400 border-b border-white/10 pb-2">
            4. FOOTER & CONTACT INFORMATION
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 uppercase mb-1">SUPPORT EMAIL</label>
              <input
                type="email"
                value={formData.footer_email || ''}
                onChange={(e) => handleChange('footer_email', e.target.value)}
                className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-neutral-400 uppercase mb-1">SUPPORT PHONE</label>
              <input
                type="text"
                value={formData.footer_phone || ''}
                onChange={(e) => handleChange('footer_phone', e.target.value)}
                className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-neutral-400 uppercase mb-1">INSTAGRAM LINK</label>
              <input
                type="text"
                value={formData.social_instagram || ''}
                onChange={(e) => handleChange('social_instagram', e.target.value)}
                className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-neutral-400 uppercase mb-1">TWITTER / X LINK</label>
              <input
                type="text"
                value={formData.social_twitter || ''}
                onChange={(e) => handleChange('social_twitter', e.target.value)}
                className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Offer Popup Settings */}
        <div className="bg-neutral-900 border border-white/10 p-6 space-y-4">
          <h3 className="font-bold text-sm uppercase text-amber-400 border-b border-white/10 pb-2">
            5. DYNAMIC OFFER POPUP SETTINGS
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 uppercase mb-1">ENABLE OFFER POPUP</label>
              <select
                value={formData.offer_popup_enabled || 'true'}
                onChange={(e) => handleChange('offer_popup_enabled', e.target.value)}
                className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none uppercase"
              >
                <option value="true">ENABLED (SHOW POPUP)</option>
                <option value="false">DISABLED (HIDE POPUP)</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 uppercase mb-1">PROMO COUPON CODE</label>
              <input
                type="text"
                value={formData.offer_popup_code || ''}
                onChange={(e) => handleChange('offer_popup_code', e.target.value)}
                className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none uppercase font-bold text-amber-400"
                placeholder="E.G. SKBD15"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 uppercase mb-1">POPUP TITLE</label>
            <input
              type="text"
              value={formData.offer_popup_title || ''}
              onChange={(e) => handleChange('offer_popup_title', e.target.value)}
              className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none uppercase font-bold"
            />
          </div>

          <div>
            <label className="block text-neutral-400 uppercase mb-1">POPUP DESCRIPTION / OFFER DETAILS</label>
            <textarea
              value={formData.offer_popup_text || ''}
              onChange={(e) => handleChange('offer_popup_text', e.target.value)}
              rows={2}
              className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none uppercase resize-none"
            />
          </div>
        </div>

        {/* Save CTA */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-white text-black py-4 font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? 'SAVING CHANGES...' : 'SAVE ALL SITE SETTINGS'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
