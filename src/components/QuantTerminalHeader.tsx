import React from 'react';
import {
  Radio,
  ShieldCheck,
  Sparkles,
  Layers,
  Globe2,
} from 'lucide-react';

interface QuantTerminalHeaderProps {
  onOpenForex?: () => void;
  activeView?: string;
}

export const QuantTerminalHeader: React.FC<QuantTerminalHeaderProps> = ({
  onOpenForex,
  activeView,
}) => {
  return (
    <div className="bg-[#050508] border-b border-neutral-800 text-neutral-300 font-mono text-[11px] px-4 py-1.5 select-none overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 shrink-0">
        {/* Left Telemetry: Feed Status & Latency */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>NSE CASH: LIVE FEED</span>
          </div>

          <div className="flex items-center gap-1.5 text-neutral-400">
            <Radio className="w-3 h-3 text-emerald-400" />
            <span>LATENCY: <strong className="text-white">12ms</strong> (Direct NSE Stream)</span>
          </div>
        </div>

        {/* Center Telemetry: Quant Parameters & Forex Portal Switch */}
        <div className="hidden lg:flex items-center gap-4 text-neutral-400 text-[10px]">
          <div>
            NIFTY 50-EMA: <strong className="text-emerald-400">72% Above</strong>
          </div>
          <span className="text-neutral-700">·</span>
          <div>
            FII/DII FLOW: <strong className="text-emerald-400">+₹2,827 Cr</strong>
          </div>
          <span className="text-neutral-700">·</span>
          <div>
            G-SEC (Rf): <strong className="text-white">6.50%</strong>
          </div>
          <span className="text-neutral-700">·</span>
          <div className="flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
            <span>GROQ LPU: <strong className="text-neutral-200">120B Quant</strong></span>
          </div>
        </div>

        {/* Right Telemetry: NRI / Forex Portal Button & Compliance Status */}
        <div className="flex items-center gap-2">
          {onOpenForex && (
            <button
              onClick={onOpenForex}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-all text-[10px] font-bold ${
                activeView === 'forex'
                  ? 'bg-cyan-950/90 border-cyan-500 text-cyan-300 shadow-xs'
                  : 'bg-neutral-900 border-cyan-800/80 text-cyan-400 hover:bg-cyan-950/50'
              }`}
              title="Launch NRI & Global Forex Desk"
            >
              <Globe2 className="w-3 h-3 text-cyan-400" />
              <span>NRI / FOREX DESK (EUR·GBP)</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 text-[10px]">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>SEBI & FEMA COMPLIANT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
