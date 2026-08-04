import React from 'react';

export const TiltedBeigeBand: React.FC = () => {
  const repeatedText = "ESSENTIAL CUTS [M] • SK WORL MILANO BANGLADESH 2026 [M] • ";

  return (
    <section className="relative w-full py-16 sm:py-24 overflow-hidden flex items-center justify-center bg-black/95">
      {/* CSS Keyframe animations for marquee & perspective glow */}
      <style>{`
        @keyframes tiltedMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .tilted-marquee-track {
          display: flex;
          width: max-content;
          animation: tiltedMarquee 25s linear infinite;
        }
        .tilted-marquee-track:hover {
          animation-play-state: paused;
        }
        .perspective-stage {
          perspective: 1000px;
          perspective-origin: 50% 50%;
        }
        .receding-band {
          transform-style: preserve-3d;
          transform: rotateX(16deg) rotateY(-12deg) rotateZ(-2.5deg) scale(1.08) translateY(-10px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(230, 223, 211, 0.15);
        }
      `}</style>

      {/* Perspective Container / Stage */}
      <div className="perspective-stage w-full max-w-[100vw] overflow-hidden py-8">
        {/* Receding 3D Tilted Beige Band */}
        <div className="receding-band bg-[#E8E1D3] text-zinc-950 border-y-2 border-zinc-900 py-4 sm:py-5 w-[115vw] -ml-[7.5vw] origin-center transition-transform duration-500 hover:rotate-x-[10deg] hover:rotate-y-[-6deg]">
          
          {/* Top subtle vintage grain scanline on the monitor */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-60" />

          {/* Marquee Track */}
          <div className="flex w-full overflow-hidden select-none">
            <div className="tilted-marquee-track flex items-center space-x-6 font-mono text-sm sm:text-lg md:text-xl font-extrabold tracking-widest uppercase">
              {Array.from({ length: 12 }).map((_, i) => (
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
