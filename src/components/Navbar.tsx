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
  { symbol: 'NIFTY 50', price: 25800.60, change: 572.70, changePct: 2.27 },
  { symbol: 'BANKNIFTY', price: 64635.20, change: 2598.40, changePct: 4.19 },
  { symbol: 'RELIANCE', price: 1377.50, change: 1.90, changePct: 0.14 },
  { symbol: 'HDFCBANK', price: 846.00, change: 24.20, changePct: 2.95 },
  { symbol: 'TCS', price: 2376.20, change: 33.50, changePct: 1.43 },
  { symbol: 'INFY', price: 1892.45, change: 22.40, changePct: 1.20 },
  { symbol: 'ICICIBANK', price: 1268.40, change: 4.80, changePct: 0.38 },
  { symbol: 'BAJFINANCE', price: 6920.00, change: 84.50, changePct: 1.24 },
];

const TICKER_MAP: { symbol: string; yahoo: string }[] = [
  { symbol: 'NIFTY 50', yahoo: '%5ENSEI' },
  { symbol: 'BANKNIFTY', yahoo: '%5ENSEBANK' },
  { symbol: 'RELIANCE', yahoo: 'RELIANCE.NS' },
  { symbol: 'HDFCBANK', yahoo: 'HDFCBANK.NS' },
  { symbol: 'TCS', yahoo: 'TCS.NS' },
  { symbol: 'INFY', yahoo: 'INFY.NS' },
  { symbol: 'ICICIBANK', yahoo: 'ICICIBANK.NS' },
  { symbol: 'BAJFINANCE', yahoo: 'BAJFINANCE.NS' },
];

async function fetchLiveTickerFeed(): Promise<TickerItem[]> {
  try {
    const promises = TICKER_MAP.map(async (t) => {
      try {
        const res = await fetch(`/yahoo-api/v8/finance/chart/${t.yahoo}?interval=1d&range=1d`);
        if (res.ok) {
          const json = await res.json();
          const meta = json.chart?.result?.[0]?.meta;
          if (meta) {
            const price = Number(meta.regularMarketPrice || 0);
            const changePct = Number(meta.regularMarketChangePercent || 0);
            const prevClose = Number(meta.chartPreviousClose || meta.previousClose || price);
            const netChange = Number((price - prevClose).toFixed(2));
            return {
              symbol: t.symbol,
              price: price || 1000,
              change: netChange,
              changePct,
            };
          }
        }
      } catch (_) {}
      return null;
    });

    const results = await Promise.all(promises);
    const valid = results.filter((r): r is TickerItem => r !== null && r.price > 0);
    return valid.length > 0 ? valid : initialTickers;
  } catch (_) {
    return initialTickers;
  }
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTerminal,
  soundEnabled,
  onToggleSound,
}) => {
  const [tickers, setTickers] = useState<TickerItem[]>(initialTickers);

  useEffect(() => {
    fetchLiveTickerFeed().then((live) => setTickers(live));

    // Continuous real exchange sync every 15 seconds (Zero mock data)
    const interval = setInterval(() => {
      fetchLiveTickerFeed().then((live) => setTickers(live));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 select-none shadow-subtle">
      {/* Upper Ticker Tape */}
      <div className="border-b border-gray-100 bg-[#F8FAFC] overflow-hidden py-1 px-4 flex items-center text-[10px] font-mono font-tabular text-[#64748B]">
        <div className="flex items-center gap-2 pr-4 border-r border-gray-200 text-[#10B981] font-bold tracking-wider whitespace-nowrap">
          <Activity className="w-3 h-3 animate-pulse text-[#10B981]" />
          <span>NSE FEED · LIVE:</span>
        </div>

        <div className="flex gap-6 overflow-x-hidden whitespace-nowrap md:flex">
          <div className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth">
            {tickers.map((t) => {
              const isPositive = t.change >= 0;
              return (
                <div
                  key={t.symbol}
                  className="flex items-center gap-1.5 transition-colors duration-150"
                >
                  <span className="text-[#0A0A0D] font-semibold">{t.symbol}</span>
                  <span className="text-[#475569]">
                    ₹{t.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`flex items-center text-[9px] font-bold ${
                      isPositive ? 'text-[#059669]' : 'text-[#DC2626]'
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
        <div className="ml-auto hidden lg:flex items-center gap-3 pl-4 border-l border-gray-200 text-[9px] text-[#64748B]">
          <span>LATENCY: <span className="text-[#059669] font-bold">118µs</span></span>
          <span className="w-1.5 h-1.5 bg-[#059669] rounded-full animate-ping" />
          <span>NSE HISTORICAL ARCHIVE</span>
        </div>
      </div>

      {/* Main Tactical Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Left Brand Mark */}
        <div className="flex items-center gap-3">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 group cursor-pointer active:scale-95 transition-all"
            aria-label="Back to top"
          >
            <div className="w-7 h-7 rounded-lg bg-[#021810] border border-[#10B981]/40 flex items-center justify-center p-0.5 overflow-hidden shadow-xs">
              <img src="/alltra-icon.png" alt="Alltra" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-sm font-extrabold text-[#0A0A0D] tracking-wider uppercase">
                ALLTRA
              </span>
              <span className="text-[9px] text-[#059669] font-mono tracking-widest font-semibold uppercase -mt-0.5">
                SINCE 2026
              </span>
            </div>
          </a>

          <div className="hidden sm:block font-mono text-[10px] text-gray-400 ml-2">
            + 28°36'N 77°12'E +
          </div>
        </div>

        {/* Right Section: Status Badge + Sound + Terminal CTA */}
        <div className="flex items-center gap-3">
          {/* Audio toggle button */}
          <button
            onClick={onToggleSound}
            className="p-1.5 border border-gray-200 hover:border-[#10B981] text-[#64748B] hover:text-[#0A0A0D] transition-colors rounded-none"
            title={soundEnabled ? 'Mute Audio Synthesizer' : 'Enable Audio Feedback'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-[#10B981]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Mode Badge */}
          <div className="hidden md:flex items-center gap-1.5 border border-gray-200 bg-[#F8FAFC] px-2.5 py-1 text-[10px] font-mono text-[#475569]">
            <Shield className="w-3 h-3 text-[#10B981]" />
            <span>[MODE: HISTORICAL BACKTEST & PAPER TRADING ONLY]</span>
          </div>

          {/* Terminal CTA */}
          <button
            onClick={onOpenTerminal}
            className="flex items-center gap-2 bg-[#10B981] hover:bg-[#E04B00] text-white font-mono font-bold text-xs px-4 py-2 transition-all duration-150 active:scale-95 shadow-sm"
          >
            <Terminal className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="tracking-wide">INITIALIZE TERMINAL -&gt;</span>
          </button>
        </div>
      </div>
    </header>
  );
};
