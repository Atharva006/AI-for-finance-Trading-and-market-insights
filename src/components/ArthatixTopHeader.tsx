import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Settings,
  TrendingUp,
  Activity,
  Layers,
  ChevronDown,
  X,
  ExternalLink,
  Sliders,
  Shield,
  User,
  LogIn,
  SlidersHorizontal,
} from 'lucide-react';
import { AppView } from './DhanNavbar';

interface ArthatixTopHeaderProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenSettings: () => void;
  selectedInstrument: string;
  setSelectedInstrument?: (inst: string) => void;
}

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'instrument' | 'destination';
  view?: AppView;
  symbol?: string;
  badge?: string;
}

const SEARCH_INDEX: SearchItem[] = [
  // Instruments
  { id: 'inst-nifty', title: 'NIFTY 50', subtitle: 'NSE Benchmark Index · Spot', category: 'instrument', symbol: 'NIFTY 50', badge: 'NSE' },
  { id: 'inst-sensex', title: 'SENSEX', subtitle: 'BSE Benchmark Index · Spot', category: 'instrument', symbol: 'SENSEX', badge: 'BSE' },
  { id: 'inst-banknifty', title: 'BANKNIFTY', subtitle: 'Nifty Banking Sector Index', category: 'instrument', symbol: 'BANKNIFTY', badge: 'NSE' },
  { id: 'inst-reliance', title: 'RELIANCE', subtitle: 'Reliance Industries Ltd · Oil & Gas / Retail', category: 'instrument', symbol: 'RELIANCE', badge: 'NSE' },
  { id: 'inst-infy', title: 'INFY', subtitle: 'Infosys Ltd · IT Services', category: 'instrument', symbol: 'INFY', badge: 'NSE' },
  { id: 'inst-tcs', title: 'TCS', subtitle: 'Tata Consultancy Services · IT Services', category: 'instrument', symbol: 'TCS', badge: 'NSE' },
  { id: 'inst-hdfcbank', title: 'HDFCBANK', subtitle: 'HDFC Bank Ltd · Private Sector Bank', category: 'instrument', symbol: 'HDFCBANK', badge: 'NSE' },
  { id: 'inst-tatamotors', title: 'TATAMOTORS', subtitle: 'Tata Motors Ltd · Automobiles', category: 'instrument', symbol: 'TATAMOTORS', badge: 'NSE' },
  { id: 'inst-sbin', title: 'SBIN', subtitle: 'State Bank of India · Public Sector Bank', category: 'instrument', symbol: 'SBIN', badge: 'NSE' },
  { id: 'inst-itc', title: 'ITC', subtitle: 'ITC Ltd · Conglomerate / FMCG', category: 'instrument', symbol: 'ITC', badge: 'NSE' },
  { id: 'inst-gold', title: 'GOLD', subtitle: 'Gold Commodity Futures · MCX', category: 'instrument', symbol: 'GOLD', badge: 'MCX' },
  { id: 'inst-eurusd', title: 'EUR/USD', subtitle: 'Euro / US Dollar FX Spot', category: 'instrument', symbol: 'EUR/USD', badge: 'FOREX' },
  { id: 'inst-gbpusd', title: 'GBP/USD', subtitle: 'British Pound / US Dollar FX Spot', category: 'instrument', symbol: 'GBP/USD', badge: 'FOREX' },
  { id: 'inst-usdinr', title: 'USD/INR', subtitle: 'US Dollar / Indian Rupee Currency Pair', category: 'instrument', symbol: 'USD/INR', badge: 'CURRENCY' },

  // Destinations
  { id: 'dest-paper', title: 'Paper Trading Desk', subtitle: 'Virtual simulated execution desk with real-time L2 orderbook', category: 'destination', view: 'papertrading', badge: 'Desk' },
  { id: 'dest-backtest', title: 'Backtest Studio', subtitle: 'Walk-forward strategy backtesting engine with slippage & commission', category: 'destination', view: 'backtest', badge: 'Studio' },
  { id: 'dest-market', title: 'Algo Marketplace', subtitle: 'Audited quantitative strategies with Sharpe & Drawdown analytics', category: 'destination', view: 'marketplace', badge: 'Market' },
  { id: 'dest-heatmaps', title: 'Market Heatmaps', subtitle: 'Interactive TradingView SENSEX / Nifty 50 market breadth map', category: 'destination', view: 'heatmap', badge: 'Map' },
  { id: 'dest-insights', title: 'Market Insights', subtitle: 'Fundamental pulse, valuation ratios, institutional radar', category: 'destination', view: 'insights', badge: 'Pulse' },
  { id: 'dest-flow', title: 'Flow Canvas', subtitle: 'n8n-style visual algorithmic automation & workflow studio', category: 'destination', view: 'flow', badge: 'Canvas' },
  { id: 'dest-fvg', title: 'FVG strategy', subtitle: 'Asia-London-NY Fair Value Gap session liquidity algorithmic model', category: 'destination', view: 'forex', badge: 'Algo' },
  { id: 'dest-compiler', title: 'Strategy Compiler', subtitle: 'Institutional strategy code generator and risk governance', category: 'destination', view: 'admin', badge: 'Audit' },
];

export const ArthatixTopHeader: React.FC<ArthatixTopHeaderProps> = ({
  activeView,
  onNavigate,
  onOpenSettings,
  selectedInstrument,
  setSelectedInstrument,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const avatarDropdownRef = useRef<HTMLDivElement>(null);

  // Filtered search results
  const filteredResults = searchQuery.trim() === ''
    ? SEARCH_INDEX.slice(0, 7)
    : SEARCH_INDEX.filter((item) => {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          (item.symbol && item.symbol.toLowerCase().includes(q))
        );
      });

  // Global ⌘K / Ctrl+K listener and Escape listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsAvatarOpen(false);
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside listeners
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
      if (
        avatarDropdownRef.current &&
        !avatarDropdownRef.current.contains(e.target as Node)
      ) {
        setIsAvatarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation inside search dropdown
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % Math.max(1, filteredResults.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults.length > 0 && selectedIndex < filteredResults.length) {
        handleSelectItem(filteredResults[selectedIndex]);
      }
    }
  };

  const handleSelectItem = (item: SearchItem) => {
    setIsSearchOpen(false);
    setSearchQuery('');

    if (item.category === 'instrument' && item.symbol) {
      setSelectedInstrument?.(item.symbol);
      if (item.symbol === 'EUR/USD' || item.symbol === 'GBP/USD') {
        onNavigate('forex');
      } else {
        onNavigate('backtest');
      }
    } else if (item.category === 'destination' && item.view) {
      onNavigate(item.view);
    }
  };

  const handleOpenInstrumentInBacktest = (sym: string) => {
    setSelectedInstrument?.(sym);
    onNavigate('backtest');
  };

  return (
    <header className="h-14 w-full bg-[#FFFFFF] border-b border-[#E2E8F0] px-5 flex items-center justify-between gap-4 sticky top-0 z-40 select-none">
      {/* ── Left: Global Search & Current Context ── */}
      <div className="flex items-center gap-3 flex-1 max-w-md relative" ref={searchContainerRef}>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-[#F8FAFC] text-xs transition-all w-full ${
            isSearchOpen
              ? 'border-[#2563EB] bg-white ring-2 ring-[#2563EB]/15'
              : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search instruments, symbols, or strategies (e.g. NIFTY 50, RELIANCE, FVG)..."
            className="w-full bg-transparent border-none outline-none text-[#0F172A] placeholder-[#94A3B8] text-xs"
            aria-label="Search instruments and destinations"
          />

          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedIndex(0);
                searchInputRef.current?.focus();
              }}
              className="p-0.5 text-[#94A3B8] hover:text-[#0F172A] rounded transition-colors active:scale-95"
              title="Clear search"
              aria-label="Clear search input"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono font-semibold text-[#64748B] bg-[#EDF2F7] rounded border border-[#E2E8F0]">
            ⌘K
          </kbd>
        </div>

        {/* Live Search Dropdown */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-[#CBD5E1] shadow-xl z-50 overflow-hidden animate-fade-in">
            <div className="max-h-80 overflow-y-auto divide-y divide-[#F1F5F9] p-1">
              {filteredResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#64748B]">
                  No matching instruments or destinations found for &ldquo;<span className="font-semibold text-[#0F172A]">{searchQuery}</span>&rdquo;.
                </div>
              ) : (
                filteredResults.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`px-3 py-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#EEF3FF] text-[#00225A]'
                          : 'hover:bg-[#F8FAFC] text-[#334155]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center shrink-0 text-[10px] font-bold ${
                            item.category === 'instrument'
                              ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]'
                              : 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]'
                          }`}
                        >
                          {item.category === 'instrument' ? '₹' : '↗'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs truncate text-[#0F172A]">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-[#E2E8F0] text-[#475569]">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#64748B] truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] text-[#94A3B8] font-mono ml-2 shrink-0">
                        {item.category === 'instrument' ? 'Open in Backtest ↵' : 'Go ↵'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Dropdown Keyboard Hint Footer */}
            <div className="px-3 py-2 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between text-[10px] text-[#64748B]">
              <span>Search {SEARCH_INDEX.length} indexed items</span>
              <div className="flex items-center gap-2 font-mono">
                <span>↑↓ Navigate</span>
                <span>·</span>
                <span>↵ Select</span>
                <span>·</span>
                <span>Esc Close</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Center: Quick Market Telemetry Pills (Clickable) ── */}
      <div className="hidden lg:flex items-center gap-3 font-sans text-xs">
        <button
          onClick={() => handleOpenInstrumentInBacktest('NIFTY 50')}
          className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#F1F5F9] border border-[#E2E8F0] hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-all cursor-pointer active:scale-95"
          title="Click to analyze NIFTY 50 in Backtest Studio"
          aria-label="Open NIFTY 50 in Backtest Studio"
        >
          <span className="font-semibold text-[#0F172A]">NIFTY 50</span>
          <span className="font-mono font-bold text-[#0F172A]">25,800.60</span>
          <span className="text-[#16A34A] font-mono text-[11px] font-semibold">+0.68%</span>
        </button>

        <button
          onClick={() => handleOpenInstrumentInBacktest('SENSEX')}
          className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#F1F5F9] border border-[#E2E8F0] hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-all cursor-pointer active:scale-95"
          title="Click to analyze SENSEX in Backtest Studio"
          aria-label="Open SENSEX in Backtest Studio"
        >
          <span className="font-semibold text-[#0F172A]">SENSEX</span>
          <span className="font-mono font-bold text-[#0F172A]">84,544.20</span>
          <span className="text-[#16A34A] font-mono text-[11px] font-semibold">+0.72%</span>
        </button>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#F1F5F9] border border-[#E2E8F0]">
          <span className="font-semibold text-[#64748B]">INDIA VIX</span>
          <span className="font-mono font-semibold text-[#0F172A]">12.45</span>
        </div>
      </div>

      {/* ── Right: Desk Switching & Profile ── */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={() => onNavigate('papertrading')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
            activeView === 'papertrading'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] hover:bg-[#DBEAFE]'
          }`}
          title="Switch to Virtual Paper Trading Desk"
          aria-label="Switch to Virtual Paper Trading Desk"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Paper Desk</span>
        </button>

        <button
          onClick={() => onNavigate('forex')}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
            activeView === 'forex'
              ? 'bg-[#0F172A] text-white shadow-sm'
              : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] hover:bg-[#F1F5F9]'
          }`}
          title="Asia-London-NY FVG Liquidity Desk"
          aria-label="Open Asia-London-NY FVG Liquidity Desk"
        >
          <TrendingUp className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>FVG Algo</span>
        </button>

        <div className="h-5 w-px bg-[#E2E8F0] mx-0.5" />

        <button
          onClick={onOpenSettings}
          className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors active:scale-95"
          title="Upstox API Gateway"
          aria-label="Open Upstox API Gateway settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Avatar Chip & Working Dropdown */}
        <div className="relative" ref={avatarDropdownRef}>
          <button
            onClick={() => setIsAvatarOpen((prev) => !prev)}
            aria-haspopup="true"
            aria-expanded={isAvatarOpen}
            className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-lg hover:bg-[#F1F5F9] transition-all cursor-pointer border border-transparent hover:border-[#E2E8F0] active:scale-95"
            aria-label="Open user menu"
          >
            <div className="w-7 h-7 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-xs ring-2 ring-[#E2E8F0]">
              A
            </div>
            <span className="hidden md:inline font-semibold text-xs text-[#0F172A]">
              Atharva
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-200 ${
                isAvatarOpen ? 'rotate-180 text-[#0F172A]' : ''
              }`}
            />
          </button>

          {isAvatarOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-[#CBD5E1] shadow-xl z-50 p-1.5 animate-fade-in text-xs">
              <div className="px-3 py-2 border-b border-[#F1F5F9] mb-1">
                <p className="font-bold text-xs text-[#0F172A]">Atharva</p>
                <p className="text-[11px] text-[#64748B] truncate">Institutional Trader · NSE</p>
              </div>

              <button
                onClick={() => {
                  setIsAvatarOpen(false);
                  onNavigate('papertrading');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[#334155] hover:bg-[#EFF6FF] hover:text-[#1E40AF] transition-colors"
              >
                <Activity className="w-4 h-4 text-[#2563EB]" />
                <span>Paper Trading Desk</span>
              </button>

              <button
                onClick={() => {
                  setIsAvatarOpen(false);
                  onNavigate('marketplace');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[#334155] hover:bg-[#EFF6FF] hover:text-[#1E40AF] transition-colors"
              >
                <Layers className="w-4 h-4 text-[#2563EB]" />
                <span>Algo Marketplace</span>
              </button>

              <button
                onClick={() => {
                  setIsAvatarOpen(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[#334155] hover:bg-[#EFF6FF] hover:text-[#1E40AF] transition-colors"
              >
                <Settings className="w-4 h-4 text-[#64748B]" />
                <span>Upstox API Settings</span>
              </button>

              <div className="h-px bg-[#F1F5F9] my-1" />

              <button
                onClick={() => {
                  setIsAvatarOpen(false);
                  onNavigate('auth');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
              >
                <LogIn className="w-4 h-4 text-[#DC2626]" />
                <span>Sign in / Switch Account</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
