import React from 'react';

interface QuantTerminalHeaderProps {
  onOpenForex?: () => void;
  activeView?: string;
}

export const QuantTerminalHeader: React.FC<QuantTerminalHeaderProps> = ({
  onOpenForex,
  activeView,
}) => {
  return (
    <div className="h-8 w-full bg-surface-card border-b border-border-subtle px-margin flex items-center justify-between overflow-x-auto whitespace-nowrap gap-space-lg font-mono-sm text-mono-sm text-on-surface-variant select-none">
      {/* Left Telemetry: Feed Status & Latency & Breadth */}
      <div className="flex items-center gap-space-lg">
        <span className="inline-flex items-center gap-space-sm text-on-surface font-semibold">
          <span className="w-2 h-2 rounded-full bg-bullish animate-pulse" />
          NSE CASH: LIVE FEED
        </span>
        <span>LATENCY: 12ms (Direct NSE Stream)</span>
        <span className="hidden md:inline">
          NIFTY 50-EMA: <span className="text-bullish font-semibold">72% Above</span>
        </span>
        <span className="hidden lg:inline">
          FII/DII FLOW: <span className="text-bullish font-semibold">+₹2,827 Cr</span>
        </span>
        <span className="hidden xl:inline">G-SEC (Rf): 6.50%</span>
        <span className="hidden xl:inline">GROQ LPU: 120B Quant</span>
      </div>

      {/* Right Telemetry: Forex Launch & SEBI Compliance */}
      <div className="flex items-center gap-space-md">
        {onOpenForex && (
          <button
            onClick={onOpenForex}
            className={`inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded-full font-mono-sm text-mono-sm transition-colors ${
              activeView === 'forex'
                ? 'bg-secondary text-on-secondary border border-secondary shadow-xs'
                : 'bg-forex-tint border border-secondary text-secondary hover:bg-secondary hover:text-on-secondary'
            }`}
            title="Launch NRI & Global Forex Desk"
          >
            <span className="material-symbols-outlined text-[14px]">public</span>
            <span>NRI / FOREX DESK (EUR·GBP)</span>
          </button>
        )}

        <span className="inline-flex items-center gap-space-xs text-on-surface">
          <span className="material-symbols-outlined text-[14px] text-bullish">verified_user</span>
          <span>SEBI &amp; FEMA COMPLIANT</span>
        </span>
      </div>
    </div>
  );
};
