import React from 'react';
import {
  Radio,
  ShieldCheck,
  Sparkles,
  Layers,
} from 'lucide-react';

export const QuantTerminalHeader: React.FC = () => {
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

        {/* Center Telemetry: Quant Parameters */}
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

        {/* Right Telemetry: Compliance Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 text-[10px]">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>SEBI COMPLIANT · PAPER TRADING ONLY</span>
          </div>
        </div>
      </div>
    </div>
  );
};
