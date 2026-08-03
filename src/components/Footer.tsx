import React from 'react';
import { Category, SiteSettings } from '../types';
import { Instagram, Twitter, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  categories: Category[];
  settings: Partial<SiteSettings>;
  onSelectCategory: (slug: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ categories, settings, onSelectCategory, onOpenAdmin }) => {
  const email = settings.footer_email || 'contact@skworl.com';
  const phone = settings.footer_phone || '+39 02 8945 1200';
  const logoText = settings.logo_text || 'SK WORL';

  return (
    <footer className="bg-black text-white border-t border-white/20">
      {/* Top Footer Marquee */}
      <div className="border-b border-white/10 py-3.5 bg-zinc-950 overflow-hidden whitespace-nowrap text-zinc-400 font-mono text-[10px] tracking-[0.3em] uppercase font-bold">
        <div className="inline-flex space-x-12 animate-marquee">
          <span>SK WORL MILANO 2026</span>
          <span>•</span>
          <span>ELEVATED STREETWEAR & ESSENTIAL CUTS</span>
          <span>•</span>
          <span>WORLDWIDE EXPRESS DISPATCH</span>
          <span>•</span>
          <span>LIMITED QUANTITY DROPS</span>
          <span>•</span>
          <span>SK WORL MILANO 2026</span>
          <span>•</span>
          <span>ELEVATED STREETWEAR & ESSENTIAL CUTS</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Brand Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 border-2 border-white text-white flex items-center justify-center font-extrabold font-mono text-xl bg-zinc-900">
                SK
              </div>
              <span className="font-extrabold text-3xl sm:text-4xl tracking-tighter uppercase font-syne text-white">
                {logoText}
              </span>
            </div>

            <p className="font-mono text-xs text-zinc-400 leading-relaxed uppercase max-w-sm tracking-wider">
              Milano fashion house producing high-grade structured streetwear, heavyweight fleece, and tailored essential garments.
            </p>

            <div className="space-y-2.5 font-mono text-xs text-zinc-300 tracking-wider">
              <div className="flex items-center space-x-2.5">
                <Mail size={14} className="text-zinc-500" />
                <span>{email}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone size={14} className="text-zinc-500" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <MapPin size={14} className="text-zinc-500" />
                <span>VIA MONTENAPOLEONE 14, MILANO, ITALY</span>
              </div>
            </div>
          </div>

          {/* Right Links Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            
            {/* Column 1: Categories */}
            <div className="space-y-4">
              <h4 className="font-mono text-[10px] font-extrabold uppercase tracking-[0.25em] text-zinc-400">
                01 / CATEGORIES
              </h4>
              <ul className="space-y-2.5 text-xs font-mono uppercase text-zinc-300 tracking-wider">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => onSelectCategory(cat.slug)}
                      className="hover:text-white hover:underline transition-colors"
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Company */}
            <div className="space-y-4">
              <h4 className="font-mono text-[10px] font-extrabold uppercase tracking-[0.25em] text-zinc-400">
                02 / ARCHIVE
              </h4>
              <ul className="space-y-2.5 text-xs font-mono uppercase text-zinc-300 tracking-wider">
                <li><a href="#about" className="hover:text-white hover:underline">About SK WORL</a></li>
                <li><a href="#lookbook" className="hover:text-white hover:underline">Lookbook 2026</a></li>
                <li><a href="#sustainability" className="hover:text-white hover:underline">Craft & Materials</a></li>
              </ul>
            </div>

            {/* Column 3: Socials & Support */}
            <div className="space-y-4">
              <h4 className="font-mono text-[10px] font-extrabold uppercase tracking-[0.25em] text-zinc-400">
                03 / CONNECT
              </h4>
              <div className="flex items-center space-x-2.5">
                <a href={settings.social_instagram || '#'} target="_blank" rel="noreferrer" className="p-2 border border-white/20 hover:border-white transition-colors bg-zinc-950">
                  <Instagram size={16} />
                </a>
                <a href={settings.social_twitter || '#'} target="_blank" rel="noreferrer" className="p-2 border border-white/20 hover:border-white transition-colors bg-zinc-950">
                  <Twitter size={16} />
                </a>
                <a href={settings.social_facebook || '#'} target="_blank" rel="noreferrer" className="p-2 border border-white/20 hover:border-white transition-colors bg-zinc-950">
                  <Facebook size={16} />
                </a>
                <a href={settings.social_youtube || '#'} target="_blank" rel="noreferrer" className="p-2 border border-white/20 hover:border-white transition-colors bg-zinc-950">
                  <Youtube size={16} />
                </a>
              </div>
              <p className="text-[10px] font-mono text-zinc-500 uppercase pt-4 tracking-widest">
                © {new Date().getFullYear()} {logoText} MILANO. ALL RIGHTS RESERVED.
              </p>
            </div>

          </div>

        </div>
      </div>
    </footer>
  );
};
