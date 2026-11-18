import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [coords, setCoords] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCoords({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.closest('button') ||
          target.closest('a') ||
          target.classList.contains('interactive-node'))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden hidden md:block"
      style={{ willChange: 'transform' }}
    >
      {/* Precision reticle container */}
      <div
        className="absolute top-0 left-0 transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(${coords.x}px, ${coords.y}px, 0)`,
        }}
      >
        {/* Center Target Dot */}
        <div
          className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-150 ${
            isHovered
              ? 'w-2 h-2 bg-[#10B981] shadow-[0_0_10px_#10B981]'
              : 'w-1.5 h-1.5 bg-[#0A0A0D]'
          }`}
        />

        {/* Outer Crosshair Ring */}
        <div
          className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-200 ${
            isHovered
              ? 'w-9 h-9 border-[#10B981] rotate-45 scale-110'
              : 'w-6 h-6 border-black/20'
          }`}
        />

        {/* Reticle Tick Crosshairs */}
        <div
          className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-[1px] ${
            isHovered ? 'bg-[#10B981]/70' : 'bg-black/15'
          }`}
        />
        <div
          className={`absolute -translate-x-1/2 -translate-y-1/2 h-8 w-[1px] ${
            isHovered ? 'bg-[#10B981]/70' : 'bg-black/15'
          }`}
        />

        {/* Real-time Monospace Viewport Coordinates */}
        <div className="absolute left-4 top-3 flex items-center gap-1.5 font-mono text-[9px] text-[#475569] tracking-wider select-none bg-white/90 px-1.5 py-0.5 border border-black/10 shadow-sm backdrop-blur-sm whitespace-nowrap">
          <span className="text-[#10B981] font-bold">POS:</span>
          <span>
            X:{String(Math.round(coords.x)).padStart(4, '0')} Y:
            {String(Math.round(coords.y)).padStart(4, '0')}
          </span>
          {isHovered && <span className="text-[#059669] font-bold ml-1">[LOCK]</span>}
        </div>
      </div>
    </div>
  );
};
