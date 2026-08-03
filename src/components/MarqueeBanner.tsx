import React from 'react';

export const MarqueeBanner: React.FC = () => {
  return (
    <div className="bg-white text-black border-y-2 border-white py-5 overflow-hidden whitespace-nowrap select-none">
      <div className="inline-flex animate-marquee items-center space-x-12 font-black text-2xl sm:text-4xl text-black tracking-tighter uppercase font-syne">
        <span>SK WORL MILANO</span>
        <span className="w-3.5 h-3.5 rounded-full bg-black inline-block" />
        <span>ELEVATED STREETWEAR</span>
        <span className="w-3.5 h-3.5 rounded-full bg-black inline-block" />
        <span>AUTUMN / WINTER 2026</span>
        <span className="w-3.5 h-3.5 rounded-full bg-black inline-block" />
        <span>AUTHENTIC APPAREL</span>
        <span className="w-3.5 h-3.5 rounded-full bg-black inline-block" />
        <span>SK WORL MILANO</span>
        <span className="w-3.5 h-3.5 rounded-full bg-black inline-block" />
        <span>ELEVATED STREETWEAR</span>
        <span className="w-3.5 h-3.5 rounded-full bg-black inline-block" />
      </div>
    </div>
  );
};
