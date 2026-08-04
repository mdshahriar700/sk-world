import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, Eye, Maximize2, X } from 'lucide-react';

interface ImageMagnifierProps {
  src: string;
  alt: string;
  magnifierHeight?: number;
  magnifierWidth?: number;
  zoomLevel?: number;
  isDark?: boolean;
}

export const ImageMagnifier: React.FC<ImageMagnifierProps> = ({
  src,
  alt,
  magnifierHeight = 160,
  magnifierWidth = 160,
  zoomLevel = 2.5,
  isDark = true,
}) => {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [[x, y], setXY] = useState([0, 0]);
  const [[imgWidth, imgHeight], setSize] = useState([0, 0]);
  const [isModalZoomOpen, setIsModalZoomOpen] = useState(false);
  const [mobileZoomScale, setMobileZoomScale] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const elem = e.currentTarget;
    const { width, height } = elem.getBoundingClientRect();
    setSize([width, height]);
    setShowMagnifier(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const elem = e.currentTarget;
    const { top, left } = elem.getBoundingClientRect();

    // calculate cursor position on image
    const xPos = e.clientX - left;
    const yPos = e.clientY - top;
    setXY([xPos, yPos]);
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  return (
    <div className="relative w-full h-full group flex flex-col items-center">
      {/* Main Image Container */}
      <div
        className="relative w-full h-full overflow-hidden cursor-crosshair select-none"
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          draggable={false}
          className="w-full h-full object-cover object-top filter contrast-105 transition-transform duration-200"
        />

        {/* Magnifying Glass Lens (Desktop Hover) */}
        {showMagnifier && (
          <div
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              height: `${magnifierHeight}px`,
              width: `${magnifierWidth}px`,
              top: `${y - magnifierHeight / 2}px`,
              left: `${x - magnifierWidth / 2}px`,
              opacity: '1',
              border: isDark ? '2px solid rgba(255, 255, 255, 0.9)' : '2px solid rgba(0, 0, 0, 0.9)',
              borderRadius: '50%',
              backgroundColor: isDark ? '#000' : '#fff',
              backgroundImage: `url('${src}')`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: `${imgWidth * zoomLevel}px ${imgHeight * zoomLevel}px`,
              backgroundPositionX: `${-x * zoomLevel + magnifierWidth / 2}px`,
              backgroundPositionY: `${-y * zoomLevel + magnifierHeight / 2}px`,
              boxShadow: isDark
                ? '0 10px 25px -5px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.2)'
                : '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)',
              zIndex: 30,
            }}
          >
            {/* Center crosshair */}
            <div className="absolute inset-0 flex items-center justify-center opacity-40">
              <div className={`w-2 h-0.5 ${isDark ? 'bg-white' : 'bg-black'}`} />
              <div className={`h-2 w-0.5 absolute ${isDark ? 'bg-white' : 'bg-black'}`} />
            </div>
          </div>
        )}

        {/* Floating Zoom Action Badge */}
        <button
          onClick={() => setIsModalZoomOpen(true)}
          className={`absolute bottom-3 right-3 z-20 flex items-center space-x-1.5 px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md transition-all shadow-lg ${
            isDark
              ? 'bg-black/80 text-white border-white/30 hover:bg-white hover:text-black'
              : 'bg-white/90 text-black border-zinc-300 hover:bg-black hover:text-white'
          }`}
          title="Inspect fabric and texture"
        >
          <ZoomIn size={14} />
          <span>INSPECT FABRIC</span>
        </button>
      </div>

      {/* Fullscreen High-Res Texture Modal */}
      {isModalZoomOpen && (
        <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Modal Top Control Bar */}
          <div className="w-full max-w-5xl flex items-center justify-between text-white border-b border-white/20 pb-3">
            <div className="flex items-center space-x-2 font-mono text-xs uppercase font-extrabold tracking-widest text-zinc-300">
              <Eye size={18} className="text-amber-400" />
              <span>FABRIC & TEXTURE INSPECTOR ({Math.round(mobileZoomScale * 100)}%)</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setMobileZoomScale((s) => Math.max(1, s - 0.5))}
                className="p-2 border border-white/20 bg-zinc-900 hover:bg-white hover:text-black text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <button
                onClick={() => setMobileZoomScale((s) => Math.min(4, s + 0.5))}
                className="p-2 border border-white/20 bg-zinc-900 hover:bg-white hover:text-black text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={() => setMobileZoomScale(1)}
                className="px-2.5 py-1 border border-white/20 bg-zinc-900 hover:bg-white hover:text-black text-white font-mono text-xs font-bold uppercase transition-colors"
                title="Reset Zoom"
              >
                RESET
              </button>
              <button
                onClick={() => {
                  setIsModalZoomOpen(false);
                  setMobileZoomScale(1);
                }}
                className="p-2 border border-white/30 bg-red-600/80 hover:bg-red-600 text-white transition-colors ml-2"
                title="Close Inspector"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Zoomable Canvas Area */}
          <div className="flex-1 w-full max-w-5xl overflow-auto flex items-center justify-center my-4 p-2 relative cursor-grab active:cursor-grabbing">
            <img
              src={src}
              alt={alt}
              style={{
                transform: `scale(${mobileZoomScale})`,
                transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                maxHeight: mobileZoomScale === 1 ? '75vh' : 'none',
                maxWidth: mobileZoomScale === 1 ? '100%' : 'none',
              }}
              className="object-contain shadow-2xl border border-white/10 select-none"
            />
          </div>

          {/* Modal Footer Instructions */}
          <div className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest text-center">
            Pinch or use zoom controls above to inspect 450GSM cotton density & stitching details.
          </div>
        </div>
      )}
    </div>
  );
};
