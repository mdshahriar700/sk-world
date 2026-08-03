import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const MarqueeBanner: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`py-4 sm:py-5 overflow-hidden whitespace-nowrap select-none border-y-2 transition-colors ${
      isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
    }`}>
      <div className="inline-flex animate-marquee items-center space-x-8 sm:space-x-12 font-black text-xl sm:text-3xl tracking-tight uppercase font-syne">
        <span>SK WORL MILANO</span>
        <span className={`w-3 h-3 rounded-full inline-block ${isDark ? 'bg-black' : 'bg-white'}`} />
        <span>ELEVATED STREETWEAR BANGLADESH</span>
        <span className={`w-3 h-3 rounded-full inline-block ${isDark ? 'bg-black' : 'bg-white'}`} />
        <span>CASH ON DELIVERY ALL BD</span>
        <span className={`w-3 h-3 rounded-full inline-block ${isDark ? 'bg-black' : 'bg-white'}`} />
        <span>AUTHENTIC APPAREL 2026</span>
        <span className={`w-3 h-3 rounded-full inline-block ${isDark ? 'bg-black' : 'bg-white'}`} />
        <span>SK WORL MILANO</span>
        <span className={`w-3 h-3 rounded-full inline-block ${isDark ? 'bg-black' : 'bg-white'}`} />
        <span>FAST DISPATCH IN DHAKA</span>
        <span className={`w-3 h-3 rounded-full inline-block ${isDark ? 'bg-black' : 'bg-white'}`} />
      </div>
    </div>
  );
};

