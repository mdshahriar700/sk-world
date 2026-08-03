import React from 'react';
import { SiteSettings } from '../types';
import { useTheme } from '../context/ThemeContext';

interface MarqueeBannerProps {
  settings?: Partial<SiteSettings>;
}

export const MarqueeBanner: React.FC<MarqueeBannerProps> = ({ settings }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (settings?.marquee_enabled === 'false') {
    return null;
  }

  const text =
    settings?.marquee_text ||
    'SK WORL MILANO • ELEVATED STREETWEAR BANGLADESH • CASH ON DELIVERY ALL BD • AUTHENTIC APPAREL 2026 • FAST DISPATCH IN DHAKA';

  const items = text.split('•').map((s) => s.trim()).filter(Boolean);

  return (
    <div className={`py-4 sm:py-5 overflow-hidden whitespace-nowrap select-none border-y-2 transition-colors ${
      isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
    }`}>
      <div className="inline-flex animate-marquee items-center space-x-8 sm:space-x-12 font-black text-xl sm:text-3xl tracking-tight uppercase font-syne">
        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            <span>{item}</span>
            <span className={`w-3 h-3 rounded-full inline-block ${isDark ? 'bg-black' : 'bg-white'}`} />
          </React.Fragment>
        ))}
        {/* Repeat once for seamless loop */}
        {items.map((item, idx) => (
          <React.Fragment key={`dup-${idx}`}>
            <span>{item}</span>
            <span className={`w-3 h-3 rounded-full inline-block ${isDark ? 'bg-black' : 'bg-white'}`} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

