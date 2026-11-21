import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Activity,
  Maximize2,
  TrendingUp,
  TrendingDown,
  Info,
  ChevronRight,
  Compass,
  Layers,
  BarChart3,
  SlidersHorizontal,
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
  turnover: string;
  vwap: string;
  linePath: string;
  areaPath: string;
  axisLabels: string[];
}

const RANGE_CONFIG: Record<RangeOption, RangeData> = {
  '1D': {
    value: '25,800.60',
    change: '-1.21% (-30.86)',
    isPositive: false,
    high: '25,845.20',
    low: '25,310.80',
    open: '25,780.00',
    prevClose: '25,831.46',
    turnover: '₹3.89 Lakh Cr',
    vwap: '25,684.40',
    linePath: 'M 0 35 Q 60 55, 120 42 T 240 68 T 360 60 T 500 82',
    areaPath: 'M 0 35 Q 60 55, 120 42 T 240 68 T 360 60 T 500 82 L 500 100 L 0 100 Z',
    axisLabels: ['09:15 AM', '11:00 AM', '01:00 PM', '03:30 PM (Close)'],
  },
  '1W': {
    value: '25,800.60',
    change: '+1.85% (+464.65)',
    isPositive: true,
    high: '25,890.20',
    low: '25,120.50',
    open: '25,320.10',
    prevClose: '25,335.95',
    turnover: '₹18.42 Lakh Cr',
    vwap: '25,480.90',
    linePath: 'M 0 85 Q 80 65, 150 72 T 300 35 T 420 45 T 500 15',
    areaPath: 'M 0 85 Q 80 65, 150 72 T 300 35 T 420 45 T 500 15 L 500 100 L 0 100 Z',
    axisLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  },
  '1M': {
    value: '25,800.60',
    change: '+4.55% (+1,084.80)',
    isPositive: true,
    high: '26,277.35',
    low: '24,690.15',
    open: '24,780.00',
    prevClose: '24,715.80',
    turnover: '₹76.50 Lakh Cr',
    vwap: '25,110.20',
    linePath: 'M 0 92 Q 100 80, 180 50 T 320 20 T 440 38 T 500 20',
    areaPath: 'M 0 92 Q 100 80, 180 50 T 320 20 T 440 38 T 500 20 L 500 100 L 0 100 Z',
    axisLabels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  },
  '1Y': {
    value: '25,800.60',
    change: '+18.91% (+3,564.30)',
    isPositive: true,
    high: '26,277.35',
    low: '21,281.45',
    open: '21,740.00',
    prevClose: '22,236.30',
    turnover: '₹912.40 Lakh Cr',
    vwap: '23,890.10',
    linePath: 'M 0 95 Q 120 85, 220 60 T 380 30 T 450 15 T 500 10',
    areaPath: 'M 0 95 Q 120 85, 220 60 T 380 30 T 450 15 T 500 10 L 500 100 L 0 100 Z',
    axisLabels: ['Nov 2023', 'Feb 2024', 'May 2024', 'Aug 2024', 'Nov 2024'],
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
  const [livePrice, setLivePrice] = useState(25800.60);
  const [tickFlash, setTickFlash] = useState<'green' | 'red' | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Live price tick simulation
  useEffect(() => {
    const timer = setInterval(() => {
      const delta = (Math.random() - 0.49) * 3.8;
      setLivePrice((prev) => {
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
    }, 600);
  };

  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const currentRangeData = RANGE_CONFIG[activeChartRange];

  // 1. Five Benchmark Stat Cards (from reference image)
  const topCards = [
    {
      title: 'NIFTY 50 (Cash)',
      value: livePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      change: '-1.21% (-30.86)',
      isPositive: false,
      sublabel: 'NSE Real-time',
    },
    {
      title: 'Market Turnover',
      value: '₹3.89 Lakh Cr',
      change: '+12.4% vs 5D avg',
      isPositive: true,
      sublabel: 'Total NSE Volume',
    },
    {
      title: 'FII Net Flow',
      value: '1.06 Crore',
      change: '-₹412.50 Cr',
      isPositive: false,
      sublabel: 'Derivatives Net Long',
    },
    {
      title: 'Market Breadth',
      value: '58.44%',
      change: '127 / 203 Ratio',
      isPositive: true,
      sublabel: 'Advance Dominance',
    },
    {
      title: 'Active Contracts',
      value: '257',
      change: '+14 New Strikes',
      isPositive: true,
      sublabel: 'Options Open Interest',
    },
  ];

  // 2. Active Watchlist & Floor Contracts
  const activeContracts = [
    { symbol: 'NIFTY 25800 CE', ltp: '₹142.50', change: '+18.40%', isPositive: true, oi: '4.82M', high: '₹168.00', low: '₹110.20' },
    { symbol: 'BANKNIFTY 54000 PE', ltp: '₹210.80', change: '+24.15%', isPositive: true, oi: '3.15M', high: '₹245.00', low: '₹165.50' },
    { symbol: 'RELIANCE 2900 CE', ltp: '₹38.40', change: '-12.60%', isPositive: false, oi: '1.89M', high: '₹46.00', low: '₹34.10' },
    { symbol: 'HDFCBANK 1740 CE', ltp: '₹22.10', change: '+8.90%', isPositive: true, oi: '2.40M', high: '₹25.80', low: '₹19.20' },
    { symbol: 'INFY 1900 PE', ltp: '₹16.75', change: '-15.40%', isPositive: false, oi: '1.20M', high: '₹21.00', low: '₹15.30' },
  ];

  // 3. Sector Performance (Gainers vs Losers bars)
  const gainerSectors = [
    { name: 'Nifty IT', change: '+1.84%', pct: 82 },
    { name: 'Nifty Auto', change: '+1.22%', pct: 68 },
    { name: 'Nifty Bank', change: '+0.58%', pct: 45 },
    { name: 'Nifty Pharma', change: '+0.45%', pct: 38 },
  ];

  const loserSectors = [
    { name: 'Nifty Realty', change: '-1.42%', pct: 74 },
    { name: 'Nifty Media', change: '-1.15%', pct: 62 },
    { name: 'Nifty FMCG', change: '-0.74%', pct: 48 },
    { name: 'Nifty Metal', change: '-0.32%', pct: 30 },
  ];

  // 4. Top Gainers & Losers Tables
  const topGainers = [
    { symbol: 'INFY', ltp: '₹1,892.45', change: '+2.85%', vol: '12.4M' },
    { symbol: 'TCS', ltp: '₹4,180.10', change: '+2.14%', vol: '5.8M' },
    { symbol: 'HDFCBANK', ltp: '₹1,745.80', change: '+1.45%', vol: '18.9M' },
    { symbol: 'TECHM', ltp: '₹1,620.00', change: '+1.32%', vol: '4.2M' },
    { symbol: 'WIPRO', ltp: '₹540.60', change: '+1.18%', vol: '8.1M' },
  ];

  const topLosers = [
    { symbol: 'RELIANCE', ltp: '₹2,874.30', change: '-0.62%', vol: '9.2M' },
    { symbol: 'TATAMOTORS', ltp: '₹782.20', change: '-1.18%', vol: '14.5M' },
    { symbol: 'HINDUNILVR', ltp: '₹2,380.50', change: '-1.45%', vol: '3.6M' },
    { symbol: 'ITC', ltp: '₹478.10', change: '-1.82%', vol: '11.8M' },
    { symbol: 'BAJFINANCE', ltp: '₹6,910.00', change: '-2.10%', vol: '2.1M' },
  ];

  // 5. High Volume & High Turnover
  const highVolume = [
    { symbol: 'SBIN', ltp: '₹842.10', vol: '24.8M', change: '+0.92%' },
    { symbol: 'TATASTEEL', ltp: '₹148.50', vol: '31.2M', change: '-0.40%' },
    { symbol: 'POWERGRID', ltp: '₹318.90', vol: '19.4M', change: '+1.10%' },
    { symbol: 'NTPC', ltp: '₹382.40', vol: '16.7M', change: '+0.65%' },
  ];

  const highTurnover = [
    { symbol: 'HDFCBANK', ltp: '₹1,745.80', turnover: '₹3,298 Cr', change: '+1.45%' },
    { symbol: 'RELIANCE', ltp: '₹2,874.30', turnover: '₹2,644 Cr', change: '-0.62%' },
    { symbol: 'TCS', ltp: '₹4,180.10', turnover: '₹2,425 Cr', change: '+2.14%' },
    { symbol: 'ICICIBANK', ltp: '₹1,268.40', turnover: '₹1,890 Cr', change: '+0.38%' },
  ];

  // 6. Sector Accumulation / Distribution Data for Bar Chart
  const sectorBars = [
    { name: 'IT', val: 78, isPos: true },
    { name: 'Auto', val: 56, isPos: true },
    { name: 'Bank', val: 42, isPos: true },
    { name: 'Pharma', val: 34, isPos: true },
    { name: 'Energy', val: 28, isPos: true },
    { name: 'Metal', val: -22, isPos: false },
    { name: 'FMCG', val: -38, isPos: false },
    { name: 'Realty', val: -52, isPos: false },
    { name: 'Media', val: -64, isPos: false },
  ];

  return (
    <div className="space-y-5 pb-16 select-none font-sans text-xs text-[#0F172A] w-full max-w-7xl mx-auto">
      {/* ── Greeting Header Banner ── */}
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
            onClick={handleFullScreen}
            className="px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#475569] hover:text-[#0F172A] font-semibold text-xs transition-all shadow-2xs flex items-center gap-1.5 active:scale-95"
            title="Toggle full screen"
            aria-label="Toggle full screen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Full Screen</span>
          </button>

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
            <span>Paper Trading Desk</span>
          </button>
        </div>
      </div>

      {/* ── 1. Top Five Minimal Stat Cards (Faithful to Screenshot) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {topCards.map((card, idx) => (
          <div
            key={card.title}
            className={`p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between card-lift animate-fade-up stagger-${idx + 1}`}
          >
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#64748B]">
              <span className="truncate">{card.title}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${card.isPositive ? 'bg-[#16A34A]' : 'bg-[#DC2626]'} live-dot`} />
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

      {/* ── 2. Primary Benchmark SVG Area Chart Card ── */}
      <div className="p-5 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-[#0F172A]">NIFTY 50 Benchmark</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                  currentRangeData.isPositive ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'
                }`}
              >
                Live · {currentRangeData.change}
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
                  ? livePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : currentRangeData.value}
              </span>
              <span className="text-xs text-[#64748B] font-medium">Spot Index</span>
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
              <linearGradient id={`chartGrad-${activeChartRange}`} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={currentRangeData.isPositive ? '#2563EB' : '#DC2626'}
                  stopOpacity="0.22"
                />
                <stop
                  offset="100%"
                  stopColor={currentRangeData.isPositive ? '#2563EB' : '#DC2626'}
                  stopOpacity="0.0"
                />
              </linearGradient>
            </defs>
            <path
              d={currentRangeData.areaPath}
              fill={`url(#chartGrad-${activeChartRange})`}
              className="chart-area"
            />
            <path
              d={currentRangeData.linePath}
              fill="none"
              stroke={currentRangeData.isPositive ? '#2563EB' : '#DC2626'}
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

        {/* Six Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-1 border-t border-[#F1F5F9] font-mono text-[11px]">
          <div>
            <span className="text-[#94A3B8] block text-[10px] font-sans font-semibold">TURNOVER</span>
            <span className="font-bold text-[#0F172A]">{currentRangeData.turnover}</span>
          </div>
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
            <span className="text-[#94A3B8] block text-[10px] font-sans font-semibold">VWAP</span>
            <span className="font-bold text-[#0F172A]">{currentRangeData.vwap}</span>
          </div>
        </div>
      </div>

      {/* ── 3. Market Breadth & Sentiment Widget (Exact layout from Reference Image) ── */}
      <div className="p-5 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#2563EB]" />
            <h2 className="font-bold text-sm text-[#0F172A] tracking-tight">MARKET BREADTH</h2>
          </div>
          <span className="text-[10px] font-mono text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded border border-[#E2E8F0]">
            NSE Cash Universe
          </span>
        </div>

        {/* 3 Count Indicators */}
        <div className="grid grid-cols-3 text-center py-2 border-y border-[#F1F5F9]">
          <div>
            <div className="text-xl font-bold font-mono text-[#16A34A]">127</div>
            <div className="text-[11px] text-[#64748B] font-medium">Advances</div>
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-[#D97706]">22</div>
            <div className="text-[11px] text-[#64748B] font-medium">Unchanged</div>
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-[#DC2626]">203</div>
            <div className="text-[11px] text-[#64748B] font-medium">Declines</div>
          </div>
        </div>

        {/* Continuous Horizontal Ratio Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden flex">
            <div style={{ width: '36%' }} className="bg-[#16A34A] h-full" title="36% Advances" />
            <div style={{ width: '6%' }} className="bg-[#D97706] h-full" title="6% Unchanged" />
            <div style={{ width: '58%' }} className="bg-[#DC2626] h-full" title="58% Declines" />
          </div>
          <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono">
            <span>36.0% Adv</span>
            <span>6.2% Flat</span>
            <span>57.8% Dec</span>
          </div>
        </div>

        {/* Sentiment Indicator Box */}
        <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-[#DC2626]" />
            <div>
              <div className="font-bold text-xs text-[#0F172A] flex items-center gap-1.5">
                <span>Sentiment Index:</span>
                <span className="text-[#DC2626]">0.62 · Bearish Pressure</span>
              </div>
              <p className="text-[10.5px] text-[#64748B] mt-0.5">
                Broader market breadth skewed negative with selective rotational buying in large-cap IT.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('insights')}
            className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold text-xs shrink-0 flex items-center gap-0.5 active:scale-95 ml-2"
          >
            <span>Market Insights</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── 4. Active Contracts / Watchlist Table ── */}
      <div className="p-5 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm text-[#0F172A]">Most Active Contracts</h2>
            <p className="text-[11px] text-[#64748B]">Real-time highest traded contracts and derivatives</p>
          </div>
          <button
            onClick={() => onNavigate('papertrading')}
            className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold text-xs flex items-center gap-0.5 active:scale-95"
          >
            <span>Paper Trading Desk</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[10.5px] text-[#64748B] font-semibold">
                <th className="pb-2">CONTRACT</th>
                <th className="pb-2 text-right">LTP</th>
                <th className="pb-2 text-right">CHANGE</th>
                <th className="pb-2 text-right hidden sm:table-cell">OPEN INTEREST</th>
                <th className="pb-2 text-right hidden md:table-cell">DAY RANGE</th>
                <th className="pb-2 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {activeContracts.map((c) => (
                <tr
                  key={c.symbol}
                  onClick={() => onSelectInstrument?.(c.symbol.split(' ')[0])}
                  className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                >
                  <td className="py-2.5 font-bold text-[#0F172A]">{c.symbol}</td>
                  <td className="py-2.5 font-mono font-bold text-right text-[#0F172A]">{c.ltp}</td>
                  <td className={`py-2.5 font-mono font-bold text-right ${c.isPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                    {c.change}
                  </td>
                  <td className="py-2.5 font-mono text-right text-[#64748B] hidden sm:table-cell">{c.oi}</td>
                  <td className="py-2.5 font-mono text-[10.5px] text-right text-[#94A3B8] hidden md:table-cell">
                    {c.low} - {c.high}
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectInstrument?.(c.symbol.split(' ')[0]);
                      }}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#EEF3FF] text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-colors"
                    >
                      Backtest Studio
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. Sector Performance (Gainers vs Losers Comparative Horizontal Bars) ── */}
      <div className="p-5 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm text-[#0F172A]">Top Sector Performance</h2>
            <p className="text-[11px] text-[#64748B]">Real-time sectoral divergence across NSE</p>
          </div>
          <button
            onClick={() => onNavigate('heatmap')}
            className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold text-xs flex items-center gap-0.5 active:scale-95"
          >
            <span>Market Heatmaps</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          {/* Top Gaining Sectors */}
          <div className="space-y-3">
            <span className="text-[11px] font-semibold text-[#16A34A] block uppercase tracking-wide">
              Leading Sectors
            </span>
            {gainerSectors.map((s) => (
              <div key={s.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#334155]">{s.name}</span>
                  <span className="font-mono font-bold text-[#16A34A]">{s.change}</span>
                </div>
                <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#16A34A] transition-all duration-700 ease-out"
                    style={{ width: mounted ? `${s.pct}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Top Lagging Sectors */}
          <div className="space-y-3">
            <span className="text-[11px] font-semibold text-[#DC2626] block uppercase tracking-wide">
              Lagging Sectors
            </span>
            {loserSectors.map((s) => (
              <div key={s.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#334155]">{s.name}</span>
                  <span className="font-mono font-bold text-[#DC2626]">{s.change}</span>
                </div>
                <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#DC2626] transition-all duration-700 ease-out"
                    style={{ width: mounted ? `${s.pct}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 6. Top Gainers & Top Losers (Dual Tables Side-by-Side) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Gainers Table */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-[#0F172A] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <span>Top Gainers</span>
            </h3>
            <span className="text-[10px] text-[#94A3B8] font-mono">NSE 500</span>
          </div>

          <div className="space-y-1.5">
            {topGainers.map((g) => (
              <div
                key={g.symbol}
                onClick={() => onSelectInstrument?.(g.symbol)}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer border border-transparent hover:border-[#E2E8F0] active:scale-95"
              >
                <div>
                  <div className="font-bold text-xs text-[#0F172A]">{g.symbol}</div>
                  <div className="text-[10px] text-[#94A3B8] font-mono">{g.vol}</div>
                </div>
                <div className="text-right font-mono text-xs">
                  <div className="font-semibold text-[#0F172A]">{g.ltp}</div>
                  <div className="text-[10.5px] font-bold text-[#16A34A]">{g.change}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers Table */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-[#0F172A] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
              <span>Top Losers</span>
            </h3>
            <span className="text-[10px] text-[#94A3B8] font-mono">NSE 500</span>
          </div>

          <div className="space-y-1.5">
            {topLosers.map((l) => (
              <div
                key={l.symbol}
                onClick={() => onSelectInstrument?.(l.symbol)}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer border border-transparent hover:border-[#E2E8F0] active:scale-95"
              >
                <div>
                  <div className="font-bold text-xs text-[#0F172A]">{l.symbol}</div>
                  <div className="text-[10px] text-[#94A3B8] font-mono">{l.vol}</div>
                </div>
                <div className="text-right font-mono text-xs">
                  <div className="font-semibold text-[#0F172A]">{l.ltp}</div>
                  <div className="text-[10.5px] font-bold text-[#DC2626]">{l.change}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 7. High Volume & High Turnover (Dual Tables Side-by-Side) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* High Volume Table */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-[#0F172A]">High Volume Stocks</h3>
            <span className="text-[10px] text-[#94A3B8] font-mono">SHARES TRADED</span>
          </div>

          <div className="space-y-1.5">
            {highVolume.map((item) => (
              <div
                key={item.symbol}
                onClick={() => onSelectInstrument?.(item.symbol)}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer border border-transparent hover:border-[#E2E8F0] active:scale-95"
              >
                <div className="font-bold text-xs text-[#0F172A]">{item.symbol}</div>
                <div className="text-center font-mono text-xs text-[#475569]">{item.vol}</div>
                <div className="text-right font-mono text-xs">
                  <div className="font-semibold text-[#0F172A]">{item.ltp}</div>
                  <div className={`text-[10.5px] font-bold ${item.change.startsWith('+') ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                    {item.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High Turnover Table */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-[#0F172A]">High Turnover Stocks</h3>
            <span className="text-[10px] text-[#94A3B8] font-mono">VALUE (₹ CR)</span>
          </div>

          <div className="space-y-1.5">
            {highTurnover.map((item) => (
              <div
                key={item.symbol}
                onClick={() => onSelectInstrument?.(item.symbol)}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer border border-transparent hover:border-[#E2E8F0] active:scale-95"
              >
                <div className="font-bold text-xs text-[#0F172A]">{item.symbol}</div>
                <div className="text-center font-mono text-xs font-semibold text-[#2563EB]">{item.turnover}</div>
                <div className="text-right font-mono text-xs">
                  <div className="font-semibold text-[#0F172A]">{item.ltp}</div>
                  <div className={`text-[10.5px] font-bold ${item.change.startsWith('+') ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                    {item.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 8. Market Action Summary Insight Callout ── */}
      <div className="p-4 bg-[#EFF6FF] rounded-xl border border-[#BFDBFE] flex items-start gap-3">
        <Info className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold text-[#1E40AF] block">Market Action Summary:</span>
          <p className="text-[#334155] mt-0.5 leading-relaxed">
            Nifty consolidated near key psychological 25,800 levels. Institutional capital flows exhibited aggressive sector rotation into large-cap Technology and Private Financials, offsetting persistent selling pressure in Consumer Discretionary and Media names. Derivatives open interest PCR stands at 0.94, suggesting a defensive consolidation zone ahead of weekly expiry.
          </p>
        </div>
      </div>

      {/* ── 9. Institutional Activity Summary (3 Cards from Reference) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs">
          <div className="text-[10.5px] font-semibold text-[#64748B]">FII NET CASH</div>
          <div className="text-base font-bold font-mono text-[#DC2626] mt-1">-₹1,245.50 Cr</div>
          <div className="text-[10px] text-[#94A3B8] font-mono mt-1">Selling in Index heavyweights</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs">
          <div className="text-[10.5px] font-semibold text-[#64748B]">DII NET CASH</div>
          <div className="text-base font-bold font-mono text-[#16A34A] mt-1">+₹2,180.20 Cr</div>
          <div className="text-[10px] text-[#94A3B8] font-mono mt-1">Domestic Mutual Fund Absorption</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs">
          <div className="text-[10.5px] font-semibold text-[#64748B]">NET DERIVATIVES OI</div>
          <div className="text-base font-bold font-mono text-[#2563EB] mt-1">+₹934.70 Cr</div>
          <div className="text-[10px] text-[#94A3B8] font-mono mt-1">Index Futures Net Long Ratio 54%</div>
        </div>
      </div>

      {/* ── 10. Sector Accumulation & Distribution (Bar Chart from Reference) ── */}
      <div className="p-5 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm text-[#0F172A]">Sector Accumulation / Distribution</h2>
            <p className="text-[11px] text-[#64748B]">Net institutional capital allocation by industry</p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-[#16A34A]">
              <span className="w-2 h-2 rounded bg-[#16A34A]" /> Accumulation
            </span>
            <span className="flex items-center gap-1 text-[#DC2626]">
              <span className="w-2 h-2 rounded bg-[#DC2626]" /> Distribution
            </span>
          </div>
        </div>

        {/* Clean SVG Multi-Bar Divergence Chart */}
        <div className="w-full h-36 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] p-3 flex flex-col justify-between">
          <svg className="w-full h-24 overflow-visible" preserveAspectRatio="none" viewBox="0 0 450 100">
            {/* Zero Baseline */}
            <line x1="0" y1="50" x2="450" y2="50" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />

            {/* Bars */}
            {sectorBars.map((bar, idx) => {
              const barWidth = 24;
              const x = idx * 50 + 15;
              const barHeight = Math.abs(bar.val) * 0.45;
              const y = bar.isPos ? 50 - barHeight : 50;

              return (
                <g key={bar.name} className="cursor-pointer group">
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx="3"
                    fill={bar.isPos ? '#16A34A' : '#DC2626'}
                    className="transition-all hover:opacity-80"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={bar.isPos ? y - 4 : y + barHeight + 9}
                    textAnchor="middle"
                    fill={bar.isPos ? '#16A34A' : '#DC2626'}
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {bar.isPos ? `+${bar.val}` : `${bar.val}`}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Bar Labels */}
          <div className="grid grid-cols-9 text-center text-[10px] font-semibold text-[#475569]">
            {sectorBars.map((b) => (
              <span key={b.name}>{b.name}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 11. Top Brokers & Indices Radar ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Broker Flows */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-[#0F172A]">Top Broker Volume Share</h3>
            <span className="text-[10px] text-[#94A3B8] font-mono">NSE CLEARED</span>
          </div>

          <div className="space-y-2">
            {[
              { name: 'Zerodha Broking', share: '19.4%', turnover: '₹75,410 Cr' },
              { name: 'Groww (Nextbillion)', share: '17.2%', turnover: '₹66,820 Cr' },
              { name: 'Angel One Ltd', share: '13.8%', turnover: '₹53,600 Cr' },
              { name: 'ICICI Securities', share: '9.4%', turnover: '₹36,540 Cr' },
            ].map((b) => (
              <div key={b.name} className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#334155]">{b.name}</span>
                <div className="flex items-center gap-3 font-mono">
                  <span className="font-bold text-[#0F172A]">{b.share}</span>
                  <span className="text-[10px] text-[#94A3B8]">{b.turnover}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flagship Strategy Launcher Card */}
        <div className="p-4 bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE]/40 rounded-xl border border-[#BFDBFE] shadow-2xs flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[#2563EB] text-white">
                QUANT DESK
              </span>
              <span className="text-[11px] text-[#166534] font-semibold bg-[#DCFCE7] px-2 py-0.5 rounded">
                71.4% Win Rate
              </span>
            </div>
            <h3 className="font-bold text-sm text-[#0F172A]">Asia-London-NY FVG Liquidity Desk</h3>
            <p className="text-[11px] text-[#475569] leading-relaxed">
              Pine Script v5 vectorized session liquidity engine. Automated fair value gap inversion signals across major market open sweeps.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-3">
            <button
              onClick={() => onNavigate('forex')}
              className="flex-1 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs transition-colors text-center active:scale-95 shadow-2xs"
            >
              FVG Trading Desk
            </button>
            <button
              onClick={() => onNavigate('marketplace')}
              className="py-1.5 px-3 rounded-lg bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#334155] font-semibold text-xs transition-colors active:scale-95"
            >
              Algo Marketplace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
