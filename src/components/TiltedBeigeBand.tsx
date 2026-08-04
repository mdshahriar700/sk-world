import React from 'react';

export const TiltedBeigeBand: React.FC = () => {
  return (
    <section className="relative w-full py-24 sm:py-36 overflow-hidden flex items-center justify-center bg-black/95 my-4">
      {/* CSS Keyframe animations for marquee & perspective glow */}
      <style>{`
        @keyframes tiltedMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .tilted-marquee-track {
          display: flex;
          width: max-content;
          animation: tiltedMarquee 30s linear infinite;
        }
        .tilted-marquee-track:hover {
          animation-play-state: paused;
        }
        .perspective-stage {
          perspective: 1200px;
          perspective-origin: 50% 50%;
        }
        .receding-band {
          transform-style: preserve-3d;
          transform: rotateX(6deg) rotateY(-4deg) rotateZ(-2.5deg) scale(1.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(232, 225, 211, 0.25);
        }
      `}</style>

      {/* Perspective Container / Stage */}
      <div className="perspective-stage w-full flex justify-center items-center py-16">
        {/* Receding 3D Tilted Beige Band */}
        <div className="receding-band bg-[#E8E1D3] text-zinc-950 border-y-2 border-zinc-900 py-4 sm:py-6 w-[200vw] min-w-[200vw] shrink-0 origin-center transition-transform duration-500 hover:rotate-x-[4deg] hover:rotate-y-[-2deg]">
          
          {/* Top subtle vintage grain scanline on the monitor */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-60" />

          {/* Marquee Track */}
          <div className="flex w-full overflow-hidden select-none">
            <div className="tilted-marquee-track flex items-center space-x-6 font-mono text-sm sm:text-lg md:text-xl font-extrabold tracking-widest uppercase">
              {Array.from({ length: 16 }).map((_, i) => (
                <span key={i} className="flex items-center space-x-6 whitespace-nowrap">
                  <span className="text-zinc-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">
                    ESSENTIAL CUTS [M]
                  </span>
                  <span className="text-zinc-800 font-bold">•</span>
                  <span className="text-zinc-900 font-black tracking-wider">
                    SK WORL MILANO BANGLADESH 2026 [M]
                  </span>
                  <span className="text-zinc-800 font-bold">•</span>
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
