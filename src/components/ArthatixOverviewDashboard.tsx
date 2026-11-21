import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ChevronRight,
  Activity,
  Layers,
} from 'lucide-react';
import { AppView } from './DhanNavbar';

interface ArthatixOverviewDashboardProps {
  onNavigate: (view: AppView) => void;
  onSelectInstrument?: (symbol: string) => void;
}

type RangeOption = '1D' | '1W' | '1M' | '1Y';

interface RangeData {
  value: string;
  change: string;
  isPositive: boolean;
  high: string;
  low: string;
  open: string;
  prevClose: string;
  vwap: string;
  linePath: string;
  areaPath: string;
  axisLabels: string[];
}

const RANGE_CONFIG: Record<RangeOption, RangeData> = {
  '1D': {
    value: '25,800.60',
    change: '+174.50 (+0.68%)',
    isPositive: true,
    high: '25,808.80',
    low: '25,345.20',
    open: '25,368.00',
    prevClose: '25,626.10',
    vwap: '25,684.40',
    linePath: 'M 0 70 Q 60 50, 120 58 T 240 40 T 360 48 T 500 15',
    areaPath: 'M 0 70 Q 60 50, 120 58 T 240 40 T 360 48 T 500 15 L 500 100 L 0 100 Z',
    axisLabels: ['09:15 AM (Open: 25,368.00)', '11:30 AM', '01:30 PM', '03:30 PM (Close: 25,800.60)'],
  },
  '1W': {
    value: '25,800.60',
    change: '+464.65 (+1.85%)',
    isPositive: true,
    high: '25,840.20',
    low: '25,120.50',
    open: '25,320.10',
    prevClose: '25,335.95',
    vwap: '25,480.90',
    linePath: 'M 0 85 Q 80 65, 150 72 T 300 35 T 420 45 T 500 12',
    areaPath: 'M 0 85 Q 80 65, 150 72 T 300 35 T 420 45 T 500 12 L 500 100 L 0 100 Z',
    axisLabels: ['Mon (25,320.10)', 'Tue', 'Wed', 'Thu', 'Fri (25,800.60)'],
  },
  '1M': {
    value: '25,800.60',
    change: '+1,084.80 (+4.55%)',
    isPositive: true,
    high: '26,277.35',
    low: '24,690.15',
    open: '24,780.00',
    prevClose: '24,715.80',
    vwap: '25,110.20',
    linePath: 'M 0 92 Q 100 80, 180 50 T 320 20 T 440 38 T 500 18',
    areaPath: 'M 0 92 Q 100 80, 180 50 T 320 20 T 440 38 T 500 18 L 500 100 L 0 100 Z',
    axisLabels: ['Week 1 (24,780.00)', 'Week 2', 'Week 3', 'Week 4 (25,800.60)'],
  },
  '1Y': {
    value: '25,800.60',
    change: '+3,564.30 (+18.91%)',
    isPositive: true,
    high: '26,277.35',
    low: '21,281.45',
    open: '21,740.00',
    prevClose: '22,236.30',
    vwap: '23,890.10',
    linePath: 'M 0 95 Q 120 85, 220 60 T 380 30 T 450 15 T 500 10',
    areaPath: 'M 0 95 Q 120 85, 220 60 T 380 30 T 450 15 T 500 10 L 500 100 L 0 100 Z',
    axisLabels: ['Nov 2023 (21,740)', 'Feb 2024', 'May 2024', 'Aug 2024', 'Nov 2024 (25,800)'],
  },
};

export const ArthatixOverviewDashboard: React.FC<ArthatixOverviewDashboardProps> = ({
  onNavigate,
  onSelectInstrument,
}) => {
  const [activeChartRange, setActiveChartRange] = useState<RangeOption>('1D');
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() => new Date().toLocaleTimeString());

  // Simulated live NIFTY tick
  const [liveNiftyPrice, setLiveNiftyPrice] = useState(25800.60);
  const [tickFlash, setTickFlash] = useState<'green' | 'red' | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Live price tick simulation (every 2.5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      const delta = (Math.random() - 0.48) * 4.2;
      setLiveNiftyPrice((prev) => {
        const nextPrice = Number((prev + delta).toFixed(2));
        setTickFlash(delta >= 0 ? 'green' : 'red');
        return nextPrice;
      });

      const clearTimer = setTimeout(() => {
        setTickFlash(null);
      }, 700);

      return () => clearTimeout(clearTimer);
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }, 650);
  };

  const currentRangeData = RANGE_CONFIG[activeChartRange];

  // Benchmark stats
  const topCards = [
    {
      title: 'NIFTY 50 (Cash)',
      value: liveNiftyPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      change: '+174.50 (+0.68%)',
      isPositive: true,
      sublabel: 'NSE Real-time',
    },
    {
      title: 'Market Turnover',
      value: '₹3.89 Lakh Cr',
      change: '+12.4% vs 5D avg',
      isPositive: true,
      sublabel: 'Institutional Flow',
    },
    {
      title: 'FII Net Inflow',
      value: '₹1.06 Thousand Cr',
      change: 'Net Long Positions',
      isPositive: true,
      sublabel: 'Cash + F&O',
    },
    {
      title: 'Advance / Decline',
      value: '1,420 / 840',
      change: '1.69 Market Breadth',
      isPositive: true,
      sublabel: 'NSE All Equities',
    },
    {
      title: 'India VIX',
      value: '12.45',
      change: '-0.38 (-2.96%)',
      isPositive: true,
      sublabel: 'Low Volatility Regime',
    },
  ];

  // Sector Performance Data
  const sectors = [
    { name: 'Nifty IT', change: '+1.84%', pct: 78, isPositive: true },
    { name: 'Nifty Auto', change: '+1.22%', pct: 64, isPositive: true },
    { name: 'Nifty Bank', change: '+0.58%', pct: 52, isPositive: true },
    { name: 'Nifty Pharma', change: '+0.45%', pct: 45, isPositive: true },
    { name: 'Nifty Metal', change: '-0.32%', pct: 30, isPositive: false },
    { name: 'Nifty FMCG', change: '-0.74%', pct: 42, isPositive: false },
    { name: 'Nifty Media', change: '-1.15%', pct: 58, isPositive: false },
  ];

  // Top Gainers & Losers
  const movers = [
    { symbol: 'INFY', ltp: '₹1,892.45', change: '+2.85%', isPositive: true },
    { symbol: 'TCS', ltp: '₹4,180.10', change: '+2.14%', isPositive: true },
    { symbol: 'HDFCBANK', ltp: '₹1,745.80', change: '+1.45%', isPositive: true },
    { symbol: 'RELIANCE', ltp: '₹2,874.30', change: '-0.62%', isPositive: false },
    { symbol: 'TATAMOTORS', ltp: '₹782.20', change: '-1.18%', isPositive: false },
  ];

  return (
    <div className="space-y-6 pb-12 select-none font-sans text-xs text-[#0F172A] w-full max-w-7xl mx-auto">
      {/* ── Greeting Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
            {getGreeting()}, <span className="text-[#2563EB]">Atharva</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium flex items-center gap-2">
            <span>NSE Live Feed connected · Direct 12ms WebSocket stream via Upstox API Gateway</span>
            <span className="text-[10px] font-mono text-[#94A3B8]">· Updated {lastUpdated}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#475569] hover:text-[#0F172A] transition-all shadow-2xs active:scale-95"
            title="Refresh market telemetry"
            aria-label="Refresh telemetry data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#2563EB]' : ''}`} />
          </button>
          <button
            onClick={() => onNavigate('papertrading')}
            className="px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs transition-colors shadow-2xs flex items-center gap-1.5 active:scale-95"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Open Paper Desk</span>
          </button>
          <button
            onClick={() => onNavigate('marketplace')}
            className="px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#334155] font-semibold text-xs transition-colors shadow-2xs active:scale-95"
          >
            Algo Marketplace
          </button>
        </div>
      </div>

      {/* ── 1. Top Minimal Stat Cards (5 Cards with Staggered Entrance & Card Lift) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {topCards.map((card, idx) => (
          <div
            key={card.title}
            className={`p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between card-lift animate-fade-up stagger-${idx + 1}`}
          >
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#64748B]">
              <span className="truncate">{card.title}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] live-dot" />
            </div>

            <div className="my-2">
              <span
                className={`text-lg font-bold font-mono tracking-tight text-[#0F172A] transition-colors duration-300 ${
                  idx === 0 && tickFlash === 'green'
                    ? 'text-[#16A34A]'
                    : idx === 0 && tickFlash === 'red'
                    ? 'text-[#DC2626]'
                    : ''
                }`}
              >
                {card.value}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span
                className={`font-semibold flex items-center gap-0.5 ${
                  card.isPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'
                }`}
              >
                {card.isPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {card.change}
              </span>
              <span className="text-[10px] text-[#94A3B8] font-mono">{card.sublabel}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── 2. Primary Market Benchmark Card (Clean Reactive SVG Line & Range Controls) ── */}
      <div className="p-5 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-[#0F172A]">NIFTY 50 Benchmark</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#166534] font-semibold">
                Live · {currentRangeData.change.split(' ')[1] || '+0.68%'}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-2xl font-bold font-mono transition-colors duration-300 ${
                  activeChartRange === '1D' && tickFlash === 'green'
                    ? 'text-[#16A34A]'
                    : activeChartRange === '1D' && tickFlash === 'red'
                    ? 'text-[#DC2626]'
                    : 'text-[#0F172A]'
                }`}
              >
                {activeChartRange === '1D'
                  ? liveNiftyPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : currentRangeData.value}
              </span>
              <span className="text-xs text-[#64748B] font-medium">Index Points</span>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0]">
            {(['1D', '1W', '1M', '1Y'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setActiveChartRange(r)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all active:scale-95 ${
                  activeChartRange === r
                    ? 'bg-white text-[#0F172A] shadow-2xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
                aria-pressed={activeChartRange === r}
                aria-label={`Show ${r} chart range`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Clean SVG Area Chart Redrawn on Range Change */}
        <div className="w-full h-44 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] p-3 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between text-[10px] font-mono text-[#94A3B8]">
            <span>HIGH: {currentRangeData.high}</span>
            <span>LOW: {currentRangeData.low}</span>
          </div>

          <svg
            key={activeChartRange}
            className="w-full h-28 overflow-visible"
            preserveAspectRatio="none"
            viewBox="0 0 500 100"
          >
            <defs>
              <linearGradient id={`chartGradient-${activeChartRange}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={currentRangeData.areaPath}
              fill={`url(#chartGradient-${activeChartRange})`}
              className="chart-area"
            />
            <path
              d={currentRangeData.linePath}
              fill="none"
              stroke="#2563EB"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="chart-draw"
            />
          </svg>

          <div className="flex justify-between text-[10px] font-mono text-[#94A3B8]">
            {currentRangeData.axisLabels.map((lbl, i) => (
              <span key={i}>{lbl}</span>
            ))}
          </div>
        </div>

        {/* Five Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1 border-t border-[#F1F5F9] font-mono text-[11px]">
          <div>
            <span className="text-[#94A3B8] block text-[10px] font-sans font-semibold">OPEN</span>
            <span className="font-bold text-[#0F172A]">{currentRangeData.open}</span>
          </div>
          <div>
            <span className="text-[#94A3B8] block text-[10px] font-sans font-semibold">HIGH</span>
            <span className="font-bold text-[#16A34A]">{currentRangeData.high}</span>
          </div>
          <div>
            <span className="text-[#94A3B8] block text-[10px] font-sans font-semibold">LOW</span>
            <span className="font-bold text-[#DC2626]">{currentRangeData.low}</span>
          </div>
          <div>
            <span className="text-[#94A3B8] block text-[10px] font-sans font-semibold">PREV. CLOSE</span>
            <span className="font-bold text-[#0F172A]">{currentRangeData.prevClose}</span>
          </div>
          <div>
            <span className="text-[#94A3B8] block text-[10px] font-sans font-semibold">AVG. VWAP</span>
            <span className="font-bold text-[#0F172A]">{currentRangeData.vwap}</span>
          </div>
        </div>
      </div>

      {/* ── 3. Split Grid: Sector Performance + Movers & Algos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sector Momentum Bars (7 Cols) */}
        <div className="lg:col-span-7 p-5 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-[#0F172A]">Sectoral Breadth &amp; Rotation</h2>
              <p className="text-[11px] text-[#64748B]">Real-time performance across primary NSE sectors</p>
            </div>
            <button
              onClick={() => onNavigate('heatmap')}
              className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold text-xs flex items-center gap-0.5 active:scale-95"
            >
              <span>Full Heatmap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {sectors.map((sec) => (
              <div key={sec.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#334155]">{sec.name}</span>
                  <span
                    className={`font-mono font-bold ${
                      sec.isPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'
                    }`}
                  >
                    {sec.change}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      sec.isPositive ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
                    }`}
                    style={{ width: mounted ? `${sec.pct}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Algos & Top Stock Movers (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Active Canonical Algo Card */}
          <div className="p-4 bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE]/40 rounded-xl border border-[#BFDBFE] shadow-2xs space-y-3 card-lift">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[#2563EB] text-white">
                FLAGSHIP STRATEGY
              </span>
              <span className="text-[11px] text-[#166534] font-semibold bg-[#DCFCE7] px-2 py-0.5 rounded">
                71.4% Win Rate
              </span>
            </div>

            <div>
              <h3 className="font-bold text-sm text-[#0F172A]">Asia-London-NY FVG Inversion</h3>
              <p className="text-[11px] text-[#475569] mt-0.5 line-clamp-2">
                Pine Script v5 vectorized session liquidity model. Trades London &amp; NY sweeps against Asian range.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#BFDBFE]/60 font-mono text-[11px]">
              <div>
                <span className="text-[10px] font-sans text-[#64748B] block">1Y RETURN</span>
                <span className="font-bold text-[#16A34A]">+148.4%</span>
              </div>
              <div>
                <span className="text-[10px] font-sans text-[#64748B] block">SHARPE</span>
                <span className="font-bold text-[#0F172A]">2.84</span>
              </div>
              <div>
                <span className="text-[10px] font-sans text-[#64748B] block">MAX DD</span>
                <span className="font-bold text-[#DC2626]">-4.12%</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onNavigate('forex')}
                className="flex-1 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs transition-colors text-center active:scale-95"
              >
                Launch FVG Terminal
              </button>
              <button
                onClick={() => onNavigate('backtest')}
                className="py-1.5 px-3 rounded-lg bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#334155] font-semibold text-xs transition-colors active:scale-95"
              >
                Backtest
              </button>
            </div>
          </div>

          {/* Top Movers List */}
          <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-[#0F172A]">Active Market Movers</h3>
              <span className="text-[10px] text-[#94A3B8] font-mono">NSE CASH</span>
            </div>

            <div className="space-y-2">
              {movers.map((m) => (
                <div
                  key={m.symbol}
                  onClick={() => onSelectInstrument?.(m.symbol)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer border border-transparent hover:border-[#E2E8F0] active:scale-95"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onSelectInstrument?.(m.symbol)}
                  aria-label={`Analyze ${m.symbol} in Backtest Studio`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#0F172A]">{m.symbol}</span>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <div className="font-semibold text-[#0F172A]">{m.ltp}</div>
                    <div className={`text-[10.5px] font-bold ${m.isPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                      {m.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
