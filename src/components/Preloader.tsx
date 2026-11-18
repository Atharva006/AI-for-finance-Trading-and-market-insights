import React, { useEffect, useState } from 'react';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState('CALIBRATING_OPTICAL_RETICLE');
  const [isSplitting, setIsSplitting] = useState(false);

  useEffect(() => {
    const duration = 1400; // ~1.4 seconds
    const intervalTime = 16;
    const increment = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 30 && next < 60) {
          setStageText('PARSING_NSE_TICK_STREAM_ARCHIVE');
        } else if (next >= 60 && next < 85) {
          setStageText('SYNCHRONIZING_MACRO_NEWS_SENTIMENT_VECTORS');
        } else if (next >= 85 && next < 100) {
          setStageText('LOCKING_MATSYA_REFLECTIVE_VECTOR');
        } else if (next >= 100) {
          clearInterval(timer);
          setStageText('LOCKED: NSE_HISTORICAL_FEED');
          setTimeout(() => {
            setIsSplitting(true);
            setTimeout(() => {
              onComplete();
            }, 600);
          }, 200);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between overflow-hidden">
      {/* Top Split Shutter */}
      <div
        className={`absolute top-0 left-0 right-0 h-1/2 bg-[#050507] border-b border-[#10B981]/40 transition-transform duration-500 ease-in-out z-20 ${
          isSplitting ? '-translate-y-full' : 'translate-y-0'
        }`}
      />

      {/* Bottom Split Shutter */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-1/2 bg-[#050507] border-t border-[#10B981]/40 transition-transform duration-500 ease-in-out z-20 ${
          isSplitting ? 'translate-y-full' : 'translate-y-0'
        }`}
      />

      {/* Preloader Center Visuals (contained within shutters before split) */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center z-30 transition-opacity duration-300 ${
          isSplitting ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Tactical Crosshair Grid Lines */}
        <div className="absolute inset-0 bg-tactical-grid opacity-30 pointer-events-none" />

        {/* Central Rotating Matsya Radial Reticle */}
        <div className="relative w-44 h-44 flex items-center justify-center mb-8">
          {/* Outer Compass Degree Ring */}
          <svg className="w-full h-full animate-spin-slow" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#252830"
              strokeWidth="1"
              strokeDasharray="4 6"
            />
            <circle
              cx="100"
              cy="100"
              r="76"
              fill="none"
              stroke="#10B981"
              strokeWidth="1.5"
              strokeDasharray="24 16"
              strokeOpacity="0.8"
            />
            {/* Compass Cardinal ticks */}
            <line x1="100" y1="5" x2="100" y2="20" stroke="#10B981" strokeWidth="2" />
            <line x1="100" y1="180" x2="100" y2="195" stroke="#10B981" strokeWidth="2" />
            <line x1="5" y1="100" x2="20" y2="100" stroke="#10B981" strokeWidth="2" />
            <line x1="180" y1="100" x2="195" y2="100" stroke="#10B981" strokeWidth="2" />
          </svg>

          {/* Reverse Rotating Inner Ring (The Matsya Astrolabe) */}
          <svg
            className="absolute w-28 h-28 animate-spin-reverse"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#FF8800"
              strokeWidth="1"
              strokeDasharray="8 8"
            />
            <polygon
              points="50,15 80,75 20,75"
              fill="none"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="0.8"
            />
            <polygon
              points="50,85 80,25 20,25"
              fill="none"
              stroke="rgba(255, 85, 0, 0.4)"
              strokeWidth="0.8"
            />
          </svg>

          {/* Center Eye / Razor Focal Point */}
          <div className="absolute w-3 h-3 bg-[#10B981] rounded-full shadow-[0_0_15px_#10B981] animate-ping" />
          <div className="absolute w-2 h-2 bg-white rounded-full" />
        </div>

        {/* Brand Display in Gotu font */}
        <div className="text-center mb-6">
          <div className="text-3xl font-devanagari font-bold text-[#F8F9FA] tracking-widest flex items-center justify-center gap-2">
            <span>अर्जुन</span>
            <span className="text-xs font-mono text-[#10B981] border border-[#10B981]/40 px-1.5 py-0.5">
              QUANT_V1.0
            </span>
          </div>
          <div className="text-[11px] font-mono text-[#7E8490] tracking-[0.25em] uppercase mt-1">
            MATSYA-VEDHA MARKET INTELLIGENCE ENGINE
          </div>
        </div>

        {/* Rapid Monospace Counter */}
        <div className="w-80 border border-white/10 bg-[#0C0C10] p-3 text-left font-mono">
          <div className="flex justify-between items-center text-xs text-[#F8F9FA] mb-2 font-tabular">
            <span className="text-[#10B981] font-bold">CALIBRATING:</span>
            <span className="text-sm font-bold text-[#F8F9FA]">
              {progress.toFixed(2)}%
            </span>
          </div>

          {/* Precision Hairline Progress Bar */}
          <div className="w-full h-1 bg-white/5 overflow-hidden mb-2 relative">
            <div
              className="h-full bg-gradient-to-r from-[#FF8800] to-[#10B981] transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-[#7E8490]">
            <span className="inline-block w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" />
            <span className="truncate">{stageText}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
