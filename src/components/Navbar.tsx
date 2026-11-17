import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Activity, Volume2, VolumeX, Menu, X } from 'lucide-react';
import { quantSound } from './AudioAmbience';
import { LiquidMetalButton } from '@/components/ui/liquid-metal-button';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleNavClick = (id: string) => {
    quantSound.playClick();
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 select-none shadow-subtle">
      {/* Upper Ticker Tape */}
      <div className="border-b border-gray-100 bg-[#F8FAFC] overflow-hidden py-1 px-4 flex items-center text-[10px] font-mono font-tabular text-[#64748B]">
        <div className="flex items-center gap-2 pr-4 border-r border-gray-200 text-[#FF5500] font-bold tracking-wider whitespace-nowrap">
          <Activity className="w-3 h-3 animate-pulse text-[#FF5500]" />
          <span>NSE FEED // SIMULATED:</span>
        </div>

        <div className="flex gap-6 overflow-x-hidden whitespace-nowrap md:flex flex-1">
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
          <a href="#" className="flex items-center gap-2 group">
            <span className="font-devanagari text-2xl font-bold text-[#FF5500] tracking-wider transition-transform duration-200 group-hover:scale-105">
              अर्जुन
            </span>
            <div className="h-4 w-[1px] bg-gray-300" />
            <span className="font-mono text-xs font-bold text-[#0A0A0D] tracking-widest uppercase">
              // ARJUNA QUANT <span className="text-[#FF5500] text-[10px]">v2.4</span>
            </span>
          </a>

          <div className="hidden xl:block font-mono text-[10px] text-gray-400 ml-2">
            + 18.9256° N, 72.8242° E +
          </div>
        </div>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 font-mono text-xs text-[#475569]">
          <button
            onClick={() => handleNavClick('philosophy')}
            className="hover:text-[#FF5500] transition-colors flex items-center gap-1"
          >
            <span className="text-[#FF5500] font-bold text-[10px]">01 //</span>
            <span>ARCHITECTURE</span>
          </button>
          <button
            onClick={() => handleNavClick('sandbox')}
            className="hover:text-[#FF5500] transition-colors flex items-center gap-1"
          >
            <span className="text-[#FF5500] font-bold text-[10px]">02 //</span>
            <span>BACKTEST ENGINE</span>
          </button>
          <button
            onClick={() => handleNavClick('visual-studio')}
            className="hover:text-[#FF5500] transition-colors flex items-center gap-1"
          >
            <span className="text-[#FF5500] font-bold text-[10px]">03 //</span>
            <span>VISUAL STUDIO</span>
          </button>
          <button
            onClick={() => handleNavClick('microstructure')}
            className="hover:text-[#FF5500] transition-colors flex items-center gap-1"
          >
            <span className="text-[#FF5500] font-bold text-[10px]">04 //</span>
            <span>L2 DEPTH</span>
          </button>
          <button
            onClick={() => handleNavClick('features')}
            className="hover:text-[#FF5500] transition-colors flex items-center gap-1"
          >
            <span className="text-[#FF5500] font-bold text-[10px]">05 //</span>
            <span>FEATURES</span>
          </button>
        </nav>

        {/* Right Section: Status Badge + Sound + Terminal CTA */}
        <div className="flex items-center gap-3">
          {/* Audio toggle button */}
          <button
            onClick={onToggleSound}
            className="p-1.5 border border-gray-200 hover:border-[#FF5500] text-[#64748B] hover:text-[#0A0A0D] transition-colors rounded-none"
            title={soundEnabled ? 'Mute Audio Synthesizer' : 'Enable Audio Feedback'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-[#FF5500]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Mode Badge */}
          <div className="hidden md:flex items-center gap-1.5 border border-gray-200 bg-[#F8FAFC] px-2.5 py-1 text-[10px] font-mono text-[#475569]">
            <Shield className="w-3 h-3 text-[#FF5500]" />
            <span>[MODE: HISTORICAL & PAPER ONLY]</span>
          </div>

          {/* Liquid Metal Button Action */}
          <div className="hidden sm:block">
            <LiquidMetalButton
              label="Launch अर्जुन"
              onClick={onOpenTerminal}
              viewMode="text"
            />
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 border border-gray-200 text-[#0A0A0D] hover:border-[#FF5500] transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white/98 backdrop-blur-md px-4 py-4 space-y-3 font-mono text-xs">
          <div className="space-y-2 pb-3 border-b border-gray-100">
            <button
              onClick={() => handleNavClick('philosophy')}
              className="block w-full text-left py-1 text-[#475569] hover:text-[#FF5500]"
            >
              01 // QUANT ARCHITECTURE
            </button>
            <button
              onClick={() => handleNavClick('sandbox')}
              className="block w-full text-left py-1 text-[#475569] hover:text-[#FF5500]"
            >
              02 // BACKTEST ENGINE
            </button>
            <button
              onClick={() => handleNavClick('visual-studio')}
              className="block w-full text-left py-1 text-[#475569] hover:text-[#FF5500]"
            >
              03 // VISUAL FLOW & PROMPTING
            </button>
            <button
              onClick={() => handleNavClick('microstructure')}
              className="block w-full text-left py-1 text-[#475569] hover:text-[#FF5500]"
            >
              04 // LEVEL 2 DEPTH & RADAR
            </button>
            <button
              onClick={() => handleNavClick('features')}
              className="block w-full text-left py-1 text-[#475569] hover:text-[#FF5500]"
            >
              05 // INSTITUTIONAL FEATURES
            </button>
          </div>

          <div className="flex justify-center pt-2">
            <LiquidMetalButton
              label="Launch अर्जुन"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenTerminal();
              }}
              viewMode="text"
            />
          </div>
        </div>
      )}
    </header>
  );
};
