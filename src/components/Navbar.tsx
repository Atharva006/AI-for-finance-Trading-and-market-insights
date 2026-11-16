import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Activity, Volume2, VolumeX } from 'lucide-react';

interface NavbarProps {
  onOpenTerminal: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
}

const initialTickers: TickerItem[] = [
  { symbol: 'NIFTY 50', price: 24180.50, change: 201.20, changePct: 0.84 },
  { symbol: 'BANKNIFTY', price: 51840.10, change: 345.80, changePct: 0.67 },
  { symbol: 'RELIANCE', price: 2945.10, change: 32.60, changePct: 1.12 },
  { symbol: 'HDFCBANK', price: 1680.00, change: -3.50, changePct: -0.21 },
  { symbol: 'TCS', price: 4112.40, change: 66.80, changePct: 1.65 },
  { symbol: 'INFY', price: 1876.30, change: 14.10, changePct: 0.76 },
  { symbol: 'ICICIBANK', price: 1254.90, change: -2.10, changePct: -0.17 },
  { symbol: 'BAJFINANCE', price: 6920.00, change: 84.50, changePct: 1.24 },
];

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTerminal,
  soundEnabled,
  onToggleSound,
}) => {
  const [tickers, setTickers] = useState<TickerItem[]>(initialTickers);

  // High-frequency subtle price jitter to simulate live NSE tick feed
  useEffect(() => {
    const interval = setInterval(() => {
      setTickers((prev) =>
        prev.map((t) => {
          const delta = (Math.random() - 0.48) * (t.price * 0.0004);
          const newPrice = Number((t.price + delta).toFixed(2));
          const newChange = Number((t.change + delta).toFixed(2));
          const newChangePct = Number(
            ((newChange / (newPrice - newChange)) * 100).toFixed(2)
          );
          return {
            ...t,
            price: newPrice,
            change: newChange,
            changePct: newChangePct,
          };
        })
      );
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#050507]/90 backdrop-blur-md border-b border-white/10 select-none">
      {/* Upper Ticker Tape */}
      <div className="border-b border-white/[0.06] bg-[#09090D] overflow-hidden py-1 px-4 flex items-center text-[10px] font-mono font-tabular text-[#7E8490]">
        <div className="flex items-center gap-2 pr-4 border-r border-white/10 text-[#FF5500] font-semibold tracking-wider whitespace-nowrap">
          <Activity className="w-3 h-3 animate-pulse text-[#FF5500]" />
          <span>NSE_FEED // SIMULATED_TICKS:</span>
        </div>

        <div className="flex gap-6 overflow-x-hidden whitespace-nowrap animate-none md:flex">
          <div className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth">
            {tickers.map((t) => {
              const isPositive = t.change >= 0;
              return (
                <div
                  key={t.symbol}
                  className="flex items-center gap-1.5 transition-colors duration-150"
                >
                  <span className="text-[#F8F9FA] font-medium">{t.symbol}</span>
                  <span className="text-[#A2A8B4]">
                    ₹{t.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`flex items-center text-[9px] ${
                      isPositive ? 'text-[#00E676]' : 'text-[#FF1744]'
                    }`}
                  >
                    {isPositive ? '▲ +' : '▼ '}
                    {t.changePct.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Latency & Timestamp */}
        <div className="ml-auto hidden lg:flex items-center gap-3 pl-4 border-l border-white/10 text-[9px] text-[#7E8490]">
          <span>LATENCY: <span className="text-[#00E676]">118µs</span></span>
          <span className="w-1.5 h-1.5 bg-[#00E676] rounded-full animate-ping" />
          <span>NSE_HIST_ARCHIVE</span>
        </div>
      </div>

      {/* Main Tactical Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Left Brand Mark */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2 group">
            <span className="font-devanagari text-2xl font-bold text-[#FF5500] tracking-wider transition-transform duration-200 group-hover:scale-105">
              अर्जुन
            </span>
            <div className="h-4 w-[1px] bg-white/20" />
            <span className="font-mono text-xs font-semibold text-[#F8F9FA] tracking-widest uppercase">
              // ARJUNA QUANT <span className="text-[#FF5500] text-[10px]">v1.0</span>
            </span>
          </a>

          {/* Precision Crosshair Marker */}
          <div className="hidden sm:block font-mono text-[10px] text-white/30 ml-2">
            + 28°36'N 77°12'E +
          </div>
        </div>

        {/* Right Section: Status Badge + Sound + Terminal CTA */}
        <div className="flex items-center gap-3">
          {/* Audio toggle button */}
          <button
            onClick={onToggleSound}
            className="p-1.5 border border-white/10 hover:border-[#FF5500]/50 text-[#7E8490] hover:text-[#F8F9FA] transition-colors"
            title={soundEnabled ? 'Mute Audio Synthesizer' : 'Enable Audio Feedback'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-[#FF5500]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Mode Badge */}
          <div className="hidden md:flex items-center gap-1.5 border border-white/10 bg-[#0C0C10] px-2.5 py-1 text-[10px] font-mono text-[#A2A8B4]">
            <Shield className="w-3 h-3 text-[#FF5500]" />
            <span>[MODE: HISTORICAL BACKTEST & PAPER TRADING ONLY]</span>
          </div>

          {/* Terminal CTA */}
          <button
            onClick={onOpenTerminal}
            className="flex items-center gap-2 bg-[#FF5500] hover:bg-[#FF6A1A] text-black font-mono font-bold text-xs px-3.5 py-2 transition-all duration-150 active:scale-95 border border-[#FF5500] shadow-[0_0_15px_rgba(255,85,0,0.3)]"
          >
            <Terminal className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="tracking-wide">INITIALIZE TERMINAL -&gt;</span>
          </button>
        </div>
      </div>
    </header>
  );
};
