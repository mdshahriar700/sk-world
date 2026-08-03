import React, { useState, useEffect } from 'react';
import { X, Tag, Sparkles, Copy, Check, ShoppingBag } from 'lucide-react';
import { SiteSettings } from '../types';
import { useTheme } from '../context/ThemeContext';

interface OfferPopupModalProps {
  settings: Partial<SiteSettings>;
  onExploreClick: () => void;
}

export const OfferPopupModal: React.FC<OfferPopupModalProps> = ({ settings, onExploreClick }) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isDark = theme === 'dark';

  const isEnabled = settings.offer_popup_enabled !== 'false';
  const title = settings.offer_popup_title || 'SPECIAL BANGLADESH LAUNCH OFFER ⚡';
  const text =
    settings.offer_popup_text ||
    'FLAT 15% EXTRA DISCOUNT ON YOUR FIRST ORDER! CASH ON DELIVERY AVAILABLE ACROSS ALL 64 DISTRICTS IN BANGLADESH.';
  const promoCode = settings.offer_popup_code || 'SKBD15';

  useEffect(() => {
    // Check if dismissed in session
    const dismissed = sessionStorage.getItem('sk_offer_popup_dismissed');
    if (isEnabled && !dismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000); // Popup after 1 sec delay
      return () => clearTimeout(timer);
    }
  }, [isEnabled]);

  const handleDismiss = () => {
    sessionStorage.setItem('sk_offer_popup_dismissed', 'true');
    setIsOpen(false);
  };

  const handleCopyCode = () => {
    if (promoCode) {
      navigator.clipboard.writeText(promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleClaim = () => {
    handleCopyCode();
    handleDismiss();
    onExploreClick();
  };

  if (!isOpen || !isEnabled) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div onClick={handleDismiss} className="fixed inset-0 bg-black/80 backdrop-blur-md" />

      {/* Popup Container */}
      <div className={`relative w-full max-w-md border-2 shadow-2xl z-10 overflow-hidden my-auto transition-all ${
        isDark ? 'bg-zinc-950 text-white border-white/30' : 'bg-white text-zinc-900 border-black'
      }`}>
        
        {/* Header Ribbon */}
        <div className="bg-amber-500 text-black py-2 px-4 text-center font-mono text-[10px] font-black tracking-widest uppercase flex items-center justify-center space-x-2">
          <Sparkles size={14} className="animate-spin" />
          <span>LIMITED TIME PROMOTION</span>
          <Sparkles size={14} className="animate-spin" />
        </div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className={`absolute top-3 right-3 z-20 p-1.5 border transition-colors ${
            isDark ? 'bg-black text-white border-white/20 hover:border-white' : 'bg-stone-100 text-black border-zinc-300 hover:border-black'
          }`}
        >
          <X size={18} />
        </button>

        <div className="p-5 sm:p-6 text-center space-y-4">
          
          <div className="w-12 h-12 border-2 border-amber-500 text-amber-500 rounded-full flex items-center justify-center mx-auto bg-amber-500/10">
            <Tag size={24} />
          </div>

          <div className="space-y-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 font-bold block">
              OFFICIAL ANNOUNCEMENT
            </span>
            <h3 className="text-xl sm:text-2xl font-black uppercase font-syne leading-tight">
              {title}
            </h3>
            <p className={`font-mono text-xs leading-relaxed uppercase tracking-wider pt-1 ${
              isDark ? 'text-zinc-300' : 'text-zinc-600'
            }`}>
              {text}
            </p>
          </div>

          {/* Coupon Code Copy Box */}
          {promoCode && (
            <div className={`p-3 border space-y-1.5 ${
              isDark ? 'bg-black border-white/20' : 'bg-stone-100 border-zinc-300'
            }`}>
              <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-bold block">
                USE PROMO CODE AT CHECKOUT:
              </span>
              <div className="flex items-center justify-center space-x-3">
                <span className="font-mono text-lg font-black tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 border border-amber-500/30">
                  {promoCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className={`p-2 border font-mono text-xs font-bold flex items-center space-x-1 transition-colors ${
                    copied
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : isDark ? 'bg-white text-black border-white hover:bg-zinc-200' : 'bg-black text-white border-black hover:bg-zinc-800'
                  }`}
                  title="Copy Coupon Code"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? 'COPIED!' : 'COPY'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 space-y-2">
            <button
              onClick={handleClaim}
              className={`w-full py-3.5 font-mono text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-colors border shadow-lg ${
                isDark ? 'bg-white text-black border-white hover:bg-zinc-200' : 'bg-black text-white border-black hover:bg-zinc-800'
              }`}
            >
              <ShoppingBag size={16} />
              <span>CLAIM OFFER & SHOP NOW</span>
            </button>

            <button
              onClick={handleDismiss}
              className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 hover:underline block mx-auto pt-1"
            >
              NO THANKS, CONTINUE BROWSING
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
