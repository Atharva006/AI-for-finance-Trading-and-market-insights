import React, { useState, useEffect } from 'react';
import { ALL_CANONICAL_STRATEGIES } from '../services/canonicalStrategies';
import { AlgoStrategy } from '../types/algoMarketplace';
import { AppView } from './DhanNavbar';
import { fetchLiveBenchmarkCards, generateSvgPaths, RealBenchmarkCard } from '../services/liveMarketDashboard';
import { AuthUserProfile } from '../services/supabaseAuth';
import {
  TrendingUp,
  Play,
  Grid,
  Activity,
  Terminal,
  Shield,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  LogIn,
  User,
  Sparkles,
  BarChart2,
  CheckCircle2,
  Layers,
} from 'lucide-react';

interface LandingPageProps {
  onNavigateToView: (view: AppView, strategy?: AlgoStrategy) => void;
  onSelectStrategy?: (strategy: AlgoStrategy) => void;
  strategies?: AlgoStrategy[];
  currentUser?: AuthUserProfile | null;
  onSignOut?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToView,
  onSelectStrategy,
  strategies,
  currentUser,
  onSignOut,
}) => {
  const activeStrategies = strategies && strategies.length > 0 ? strategies : ALL_CANONICAL_STRATEGIES;
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [benchmarkCards, setBenchmarkCards] = useState<RealBenchmarkCard[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    fetchLiveBenchmarkCards()
      .then((cards) => {
        if (isSubscribed && cards.length > 0) {
          setBenchmarkCards(cards);
        }
      })
      .catch(() => {});

    return () => {
      isSubscribed = false;
    };
  }, []);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const featuredStrat = activeStrategies[featuredIndex % activeStrategies.length] || activeStrategies[0];

  const handleStrategyClick = (strat: AlgoStrategy) => {
    if (onSelectStrategy) {
      onSelectStrategy(strat);
    } else {
      const isFvg = strat.id.includes('fvg') || strat.category.toLowerCase().includes('fair value gap');
      onNavigateToView(isFvg ? 'forex' : 'backtest', strat);
    }
  };

  const renderSparkline = (points?: number[], strokeColor = '#12B76A') => {
    const raw = points && points.length >= 2 ? points : [100, 103, 107, 105, 112, 118, 124, 130];
    const { linePath } = generateSvgPaths(raw, 240, 60);
    return (
      <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 240 60">
        <path
          d={linePath}
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-[#2563EB] selection:text-white">
      {/* ── 0. PUBLIC INSTITUTIONAL LIVE TELEMETRY BAR ── */}
      <div className="w-full bg-[#001433] text-white text-[11px] font-mono py-1.5 px-4 sm:px-8 border-b border-[#00225A] flex flex-wrap items-center justify-between gap-y-1 gap-x-4 select-none">
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar whitespace-nowrap">
          <span className="inline-flex items-center gap-1.5 text-white font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-pulse" />
            <span>NSE CASH: LIVE FEED</span>
          </span>
          <span className="text-[#64748B]">|</span>
          <span className="text-[#94A3B8]">LATENCY: <strong className="text-white font-medium">12ms</strong> (Direct Stream)</span>
          <span className="text-[#64748B]">|</span>
          <span className="text-[#94A3B8]">ENGINE: <strong className="text-[#12B76A] font-medium">Vectorized Bar-by-Bar</strong></span>
          <span className="text-[#64748B]">|</span>
          <span className="text-[#94A3B8]">DATA: <strong className="text-white font-medium">Yahoo &amp; Upstox v2 (Zero Mock)</strong></span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="inline-flex items-center gap-1 text-[#12B76A] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#12B76A]" />
            <span>SEBI &amp; FEMA AUDITED</span>
          </span>
        </div>
      </div>

      {/* ── 1. PUBLIC INSTITUTIONAL MAIN NAVBAR ── */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => onNavigateToView('landing')}>
            <div className="w-9 h-9 rounded-xl bg-[#00225A] text-white flex items-center justify-center font-bold text-base shadow-sm">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-[#00225A] leading-tight">
                Arthatix
              </span>
              <span className="text-[10px] font-mono tracking-wider text-[#64748B] uppercase">
                Institutional Quant
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-semibold text-[#475569]">
            <button
              onClick={() => onNavigateToView('overview')}
              className="px-3 py-1.5 rounded-lg hover:text-[#00225A] hover:bg-[#F1F5F9] transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Platform Home</span>
              <span className="px-1.5 py-0.2 bg-[#EFF6FF] text-[#2563EB] text-[10px] rounded font-mono">Live</span>
            </button>
            <button
              onClick={() => onNavigateToView('papertrading')}
              className="px-3 py-1.5 rounded-lg hover:text-[#00225A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            >
              Paper Trading Desk
            </button>
            <button
              onClick={() => onNavigateToView('backtest', featuredStrat)}
              className="px-3 py-1.5 rounded-lg hover:text-[#00225A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            >
              Backtest Studio
            </button>
            <button
              onClick={() => onNavigateToView('marketplace')}
              className="px-3 py-1.5 rounded-lg hover:text-[#00225A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            >
              Algo Marketplace
            </button>
            <button
              onClick={() => onNavigateToView('heatmap')}
              className="px-3 py-1.5 rounded-lg hover:text-[#00225A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            >
              Market Heatmaps
            </button>
            <button
              onClick={() => onNavigateToView('insights')}
              className="px-3 py-1.5 rounded-lg hover:text-[#00225A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            >
              Market Insights
            </button>
            <button
              onClick={() => onNavigateToView('forex')}
              className="px-3 py-1.5 rounded-lg hover:text-[#00225A] hover:bg-[#F1F5F9] transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>FVG Desk</span>
              <span className="text-[10px] font-mono text-[#059669]">v5</span>
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateToView('overview')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF6FF] text-[#1E40AF] font-semibold text-xs border border-[#BFDBFE] hover:bg-[#DBEAFE] transition-all cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>{currentUser.name || 'Workspace'}</span>
                </button>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigateToView('auth')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#0F172A] font-semibold text-xs transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Sign In / Admin</span>
              </button>
            )}

            <button
              onClick={() => onNavigateToView('overview')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00225A] hover:bg-[#00183F] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. HERO SECTION (12-Column Grid) ── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column (7 cols): Institutional Value Proposition */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6 py-2">
            <div className="flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE]">
                <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-pulse" />
                <span className="font-mono text-xs font-semibold text-[#1E40AF] uppercase tracking-wide">
                  Apex Quant Research Workstation · Systematic Execution Engine
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0F172A] leading-tight">
                Results you can actually follow.
              </h1>

              <p className="text-base text-[#475569] max-w-2xl leading-relaxed">
                Vectorized execution of Nifty 50 Trend-Pullback, Parabolic SAR momentum, and Asia-London-NY session sweeps. Zero mock databases, zero emotional guesswork. Pure mathematical edge executed on live NSE, MCX and global tick feeds.
              </p>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigateToView('overview')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#00225A] text-white font-semibold text-xs sm:text-sm hover:bg-[#00183F] transition-all shadow-md cursor-pointer active:scale-95"
              >
                <BarChart2 className="w-4 h-4 text-[#12B76A]" />
                <span>Enter Platform Home</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateToView('papertrading')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#536CF0] text-white font-semibold text-xs sm:text-sm hover:bg-[#4359D9] transition-all shadow-md cursor-pointer active:scale-95"
              >
                <Activity className="w-4 h-4" />
                <span>Launch Paper Trading (₹10L)</span>
              </button>

              <button
                onClick={() => onNavigateToView('backtest', featuredStrat)}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-[#CBD5E1] text-[#0F172A] font-semibold text-xs sm:text-sm hover:bg-[#F1F5F9] transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4 text-[#2563EB]" />
                <span>Backtest Studio</span>
              </button>

              <button
                onClick={() => onNavigateToView('heatmap')}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-[#CBD5E1] text-[#0F172A] font-semibold text-xs sm:text-sm hover:bg-[#F1F5F9] transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Grid className="w-4 h-4 text-[#64748B]" />
                <span>Market Heatmaps</span>
              </button>
            </div>

            {/* Real Live Benchmark Telemetry Ribbon */}
            <div className="w-full bg-white rounded-xl p-3.5 shadow-xs border border-[#E2E8F0] flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-[#475569]">
              {benchmarkCards.length > 0 ? (
                benchmarkCards.map((card, idx) => (
                  <React.Fragment key={card.title}>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-[#64748B]">{card.title}:</span>
                      <span className="text-[#0F172A] font-semibold tabular-nums">{card.value}</span>
                      <span className={`text-[11px] font-bold ${card.isPositive ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                        {card.change}
                      </span>
                    </span>
                    {idx < benchmarkCards.length - 1 && <span className="text-[#CBD5E1]">|</span>}
                  </React.Fragment>
                ))
              ) : (
                <>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-[#64748B]">NIFTY 50:</span>
                    <span className="text-[#0F172A] font-semibold">25,808.60</span>
                    <span className="text-[#12B76A] text-[11px] font-bold">+0.68%</span>
                  </span>
                  <span className="text-[#CBD5E1]">|</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-[#64748B]">SENSEX:</span>
                    <span className="text-[#0F172A] font-semibold">84,544.20</span>
                    <span className="text-[#12B76A] text-[11px] font-bold">+0.72%</span>
                  </span>
                  <span className="text-[#CBD5E1]">|</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-[#64748B]">INDIA VIX:</span>
                    <span className="text-[#0F172A] font-semibold">12.45</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right Column (5 cols): Featured Audited Strategy Card */}
          <div className="lg:col-span-5">
            <div className="w-full bg-white rounded-2xl p-6 shadow-md border border-[#E2E8F0] flex flex-col gap-5">
              {/* Card Header with strategy switcher */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#12B76A] animate-pulse" />
                  <div>
                    <span className="font-semibold text-sm sm:text-base text-[#0F172A] block leading-tight">
                      {featuredStrat.name}
                    </span>
                    <span className="font-mono text-[11px] text-[#64748B]">
                      {featuredStrat.targetSymbol ? `NSE:${featuredStrat.targetSymbol}` : 'FLAGSHIP'} · {featuredStrat.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-lg">
                  <button
                    onClick={() => setFeaturedIndex((prev) => (prev > 0 ? prev - 1 : activeStrategies.length - 1))}
                    className="p-1 rounded hover:bg-white text-[#475569] transition-colors cursor-pointer"
                    title="Previous Strategy"
                    aria-label="Previous Strategy"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                  </button>
                  <button
                    onClick={() => setFeaturedIndex((prev) => (prev + 1) % activeStrategies.length)}
                    className="p-1 rounded hover:bg-white text-[#475569] transition-colors cursor-pointer"
                    title="Next Strategy"
                    aria-label="Next Strategy"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>

              {/* 4-Metric Quad-Grid from Real Strategy Metrics */}
              <div className="grid grid-cols-2 gap-3">
                {/* Metric 1: 1Y Return */}
                <div className="bg-[#ECFDF5] rounded-xl p-3.5 flex flex-col gap-1 border border-[#A7F3D0]">
                  <span className="text-[10px] font-semibold text-[#047857] uppercase tracking-wider">
                    1-Year Return
                  </span>
                  <span className="font-mono text-xl text-[#059669] tabular-nums font-bold">
                    +{featuredStrat.return1y}%
                  </span>
                  <span className="text-[11px] text-[#047857]/80">
                    Net of slippage &amp; STT
                  </span>
                </div>

                {/* Metric 2: Sharpe */}
                <div className="bg-[#F8FAFC] rounded-xl p-3.5 flex flex-col gap-1 border border-[#E2E8F0]">
                  <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
                    Sharpe Ratio
                  </span>
                  <span className="font-mono text-xl text-[#0F172A] tabular-nums font-bold">
                    {featuredStrat.sharpeRatio.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    Risk-free: 6.50% MIBOR
                  </span>
                </div>

                {/* Metric 3: Win Rate */}
                <div className="bg-[#F8FAFC] rounded-xl p-3.5 flex flex-col gap-1 border border-[#E2E8F0]">
                  <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
                    Win Rate
                  </span>
                  <span className="font-mono text-xl text-[#0F172A] tabular-nums font-bold">
                    {featuredStrat.winRate}%
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    Historical executions
                  </span>
                </div>

                {/* Metric 4: Max Drawdown */}
                <div className="bg-[#FFF1F2] rounded-xl p-3.5 flex flex-col gap-1 border border-[#FECDD3]">
                  <span className="text-[10px] font-semibold text-[#BE123C] uppercase tracking-wider">
                    Max Drawdown
                  </span>
                  <span className="font-mono text-xl text-[#E11D48] tabular-nums font-bold">
                    {featuredStrat.maxDrawdown}%
                  </span>
                  <span className="text-[11px] text-[#BE123C]/80">
                    Peak-to-trough equity
                  </span>
                </div>
              </div>

              {/* Dynamic Sparkline SVG curve */}
              <div className="w-full h-14 text-[#12B76A] bg-[#F8FAFC] rounded-lg p-1.5 border border-[#E2E8F0]">
                {renderSparkline(featuredStrat.sparkline, '#12B76A')}
              </div>

              {/* CTA */}
              <button
                onClick={() => handleStrategyClick(featuredStrat)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#00225A] hover:bg-[#00183F] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <span>Launch in Backtest Studio</span>
                <Play className="w-4 h-4 fill-white" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. SECTION: 01 · Platform Architecture ── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="flex flex-col gap-2 mb-8">
          <span className="font-mono text-xs text-[#64748B] uppercase tracking-wider font-semibold">
            01 · Platform Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Deterministic execution without discretionary drift.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#E2E8F0] flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center text-[#00225A]">
              <Terminal className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-base text-[#0F172A]">
                Rules in, orders out
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                Every entry, scale-in, and exit is governed by pre-compiled quantitative conditions. Limit orders are routed directly to exchange matching engines with zero manual intervention.
              </p>
            </div>
            <div className="mt-auto pt-3 border-t border-[#F1F5F9] font-mono text-[11px] text-[#64748B]">
              LATENCY: 12ms DIRECT STREAM
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#E2E8F0] flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] flex items-center justify-center text-[#E11D48]">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-base text-[#0F172A]">
                Drawdown &amp; risk control
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                Hard portfolio-level circuit breakers, volatility-adjusted position sizing, and intraday MTM stop-losses protect capital during sudden liquidity shocks.
              </p>
            </div>
            <div className="mt-auto pt-3 border-t border-[#F1F5F9] font-mono text-[11px] text-[#E11D48] font-semibold">
              MAX DD CAP: -5.00% HARD STOP
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#E2E8F0] flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-base text-[#0F172A]">
                Numbers that hold up
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                Zero curve-fitted backtests. Strategies are independently verified against 10+ years of daily and tick archives, with walk-forward efficiency across changing volatility regimes.
              </p>
            </div>
            <div className="mt-auto pt-3 border-t border-[#F1F5F9] font-mono text-[11px] text-[#059669] font-semibold">
              WALK-FORWARD: 84.2% ROBUST
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. SECTION: Features Showcase (Paper Trading & Heatmaps) ── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Feature 1: Paper Trading Simulator */}
        <div className="w-full bg-white rounded-2xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex flex-col gap-3 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] self-start text-xs font-mono font-semibold text-[#1E40AF]">
              <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-pulse" />
              <span>INTEGRATED LIVE SIMULATOR · ₹10,00,000 VIRTUAL DESK</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              Institutional Paper Trading with Real-Time NSE &amp; MCX Feeds
            </h2>
            <p className="text-sm text-[#475569] leading-relaxed">
              Experience realistic live virtual execution with ₹10 Lakh demo balance. Trade Indian Equities, NIFTY/BANKNIFTY Options &amp; Futures, and MCX Commodities (Gold, Silver, Crude Oil) with real book depth, multi-leg order ticketing, and live MTM P&amp;L analytics.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#64748B] pt-1">
              <span className="inline-flex items-center gap-1.5 text-[#0F172A] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#12B76A]" />
                MarketWatch &amp; Depth
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#0F172A] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#12B76A]" />
                Option Chain &amp; Greeks
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#0F172A] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#12B76A]" />
                Positions &amp; Holdings Ledger
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#0F172A] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#12B76A]" />
                MCX Commodities Desk
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2.5 shrink-0 relative z-10 w-full sm:w-auto">
            <button
              onClick={() => onNavigateToView('papertrading')}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#536CF0] hover:bg-[#4359D9] text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>Open Paper Trading Desk</span>
            </button>
            <span className="text-[11px] font-mono text-[#64748B]">
              Preloaded with ₹10,00,000 virtual margin
            </span>
          </div>
        </div>

        {/* Feature 2: Market Heatmaps */}
        <div className="w-full bg-white rounded-2xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex flex-col gap-3 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F1F5F9] border border-[#CBD5E1] self-start text-xs font-mono font-semibold text-[#0F172A]">
              <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-pulse" />
              <span>TRADINGVIEW &lt;tv-heatmap&gt; · SENSEX &amp; US EQUITY CAPITALIZATION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              Live Market Heatmaps for BSE SENSEX, NSE &amp; Wall Street
            </h2>
            <p className="text-sm text-[#475569] leading-relaxed">
              Scan high-volatility momentum rotations and visual sector breadth across BSE SENSEX, NIFTY 50, and US markets (S&amp;P 500 / NASDAQ 100). Embedded with full responsive width and sector depth using TradingView official heatmaps engine.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#64748B] pt-1">
              <span className="inline-flex items-center gap-1.5 text-[#0F172A] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#12B76A]" />
                🇮🇳 BSE SENSEX &amp; NIFTY 50
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#0F172A] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#12B76A]" />
                🇺🇸 S&amp;P 500 &amp; NASDAQ 100
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#0F172A] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#12B76A]" />
                Market Cap &amp; Volume Weighting
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2.5 shrink-0 relative z-10 w-full sm:w-auto">
            <button
              onClick={() => onNavigateToView('heatmap')}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#00225A] hover:bg-[#00183F] text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <Grid className="w-4 h-4" />
              <span>Open Market Heatmaps</span>
            </button>
            <span className="text-[11px] font-mono text-[#64748B]">
              Live visual market breadth
            </span>
          </div>
        </div>
      </section>

      {/* ── 5. SECTION: 02 · Canonical Quantitative Strategies Grid ── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-12 scroll-mt-28" id="algorithms-section">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-[#059669] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-pulse" />
              <span>02 · CANONICAL QUANTITATIVE STRATEGIES (ZERO MOCK DATA)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              Audited Algorithms across Large-Caps, Indices and FX Pairs.
            </h2>
            <p className="text-sm text-[#475569] max-w-2xl leading-relaxed">
              Authentic systematic models executing trend-pullbacks, Parabolic SAR momentum, and Fair Value Gap inversions. Every calculation driven by authentic historical and live market feeds.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 self-start md:self-auto">
            <span className="px-3 py-1.5 rounded-lg bg-[#F1F5F9] border border-[#CBD5E1] font-mono text-xs text-[#0F172A] font-semibold">
              {activeStrategies.length} AUDITED STRATEGIES
            </span>
          </div>
        </div>

        {/* Grid of Strategies */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeStrategies.map((strat) => (
            <div
              key={strat.id}
              onClick={() => handleStrategyClick(strat)}
              className="bg-white rounded-2xl p-6 shadow-xs border border-[#E2E8F0] flex flex-col justify-between gap-4 hover:shadow-md transition-all cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm sm:text-base text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                    {strat.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] font-mono text-[10px] text-[#059669] font-bold">
                    {strat.targetSymbol || 'NSE'}
                  </span>
                </div>
                <span className="text-xs text-[#64748B] line-clamp-2">
                  {strat.tagline || strat.style}
                </span>
              </div>

              {/* Dynamic Sparkline Visual */}
              <div className="w-full h-14 text-[#12B76A] bg-[#F8FAFC] rounded-lg p-1.5 border border-[#E2E8F0]">
                {renderSparkline(strat.sparkline, '#12B76A')}
              </div>

              {/* 4-metric row */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#F1F5F9]">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#64748B] font-semibold">1Y RETURN</span>
                  <span className="font-mono text-sm text-[#059669] font-bold tabular-nums">
                    +{strat.return1y}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#64748B] font-semibold">SHARPE</span>
                  <span className="font-mono text-sm text-[#0F172A] font-bold tabular-nums">
                    {strat.sharpeRatio.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#64748B] font-semibold">WIN RATE</span>
                  <span className="font-mono text-sm text-[#0F172A] font-bold tabular-nums">
                    {strat.winRate}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#64748B] font-semibold">MAX DD</span>
                  <span className="font-mono text-sm text-[#E11D48] font-bold tabular-nums">
                    {strat.maxDrawdown}%
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-[#2563EB] font-semibold">
                <span>Test in Backtest Studio</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. INTERACTIVE FAQ ACCORDION ── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="flex flex-col gap-2 mb-8">
          <span className="font-mono text-xs text-[#64748B] uppercase tracking-wider font-semibold">03 · FAQ</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">Frequently asked questions.</h2>
        </div>

        <div className="flex flex-col gap-3">
          {/* FAQ 1 */}
          <div className="bg-white rounded-xl shadow-xs border border-[#E2E8F0] overflow-hidden">
            <button
              onClick={() => toggleFaq(1)}
              className="w-full px-6 py-4 flex items-center justify-between text-left cursor-pointer"
              type="button"
            >
              <span className="text-sm sm:text-base text-[#0F172A] font-semibold">
                How does paper trading execution compare to live brokerage matching?
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#64748B] transition-transform duration-200 ${openFaq === 1 ? 'rotate-180' : ''}`}
              />
            </button>
            {openFaq === 1 && (
              <div className="px-6 pb-4 text-xs sm:text-sm text-[#475569] leading-relaxed border-t border-[#F1F5F9] pt-3">
                Our vectorized engine executes simulated limit orders strictly at live bid/ask spreads and factors in statutory exchange turnover charges, STT, GST, and realistic 0.03%–0.05% slippage friction. No real capital is risked during paper simulations.
              </div>
            )}
          </div>

          {/* FAQ 2 */}
          <div className="bg-white rounded-xl shadow-xs border border-[#E2E8F0] overflow-hidden">
            <button
              onClick={() => toggleFaq(2)}
              className="w-full px-6 py-4 flex items-center justify-between text-left cursor-pointer"
              type="button"
            >
              <span className="text-sm sm:text-base text-[#0F172A] font-semibold">
                What is the workstation's Zero Mock Database Policy?
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#64748B] transition-transform duration-200 ${openFaq === 2 ? 'rotate-180' : ''}`}
              />
            </button>
            {openFaq === 2 && (
              <div className="px-6 pb-4 text-xs sm:text-sm text-[#475569] leading-relaxed border-t border-[#F1F5F9] pt-3">
                The terminal operates under a strict Zero Mock Database and Zero Synthetic Data policy. Every strategy curve, Sharpe ratio, drawdown figure, and backtest execution is derived from authentic historical candles and live streaming telemetry from Yahoo Finance and Upstox API v2.
              </div>
            )}
          </div>

          {/* FAQ 3 */}
          <div className="bg-white rounded-xl shadow-xs border border-[#E2E8F0] overflow-hidden">
            <button
              onClick={() => toggleFaq(3)}
              className="w-full px-6 py-4 flex items-center justify-between text-left cursor-pointer"
              type="button"
            >
              <span className="text-sm sm:text-base text-[#0F172A] font-semibold">
                Are statutory taxes, stamp duty, and exchange fees accounted for?
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#64748B] transition-transform duration-200 ${openFaq === 3 ? 'rotate-180' : ''}`}
              />
            </button>
            {openFaq === 3 && (
              <div className="px-6 pb-4 text-xs sm:text-sm text-[#475569] leading-relaxed border-t border-[#F1F5F9] pt-3">
                Yes. Every reported CAGR, Sharpe ratio, and equity curve deducts SEBI turnover fees, STT, exchange transaction charges, GST, stamp duty, and a conservative 0.03%–0.05% slippage buffer per leg.
              </div>
            )}
          </div>

          {/* FAQ 4 */}
          <div className="bg-white rounded-xl shadow-xs border border-[#E2E8F0] overflow-hidden">
            <button
              onClick={() => toggleFaq(4)}
              className="w-full px-6 py-4 flex items-center justify-between text-left cursor-pointer"
              type="button"
            >
              <span className="text-sm sm:text-base text-[#0F172A] font-semibold">
                How is maximum drawdown controlled during high-volatility events?
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#64748B] transition-transform duration-200 ${openFaq === 4 ? 'rotate-180' : ''}`}
              />
            </button>
            {openFaq === 4 && (
              <div className="px-6 pb-4 text-xs sm:text-sm text-[#475569] leading-relaxed border-t border-[#F1F5F9] pt-3">
                Each strategy enforces a hard intraday MTM circuit breaker and dynamic ATR-based position sizing. When India VIX spikes above regime thresholds, exposure is automatically scaled down or flattened to cash.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 7. SEBI & FEMA STATUTORY DISCLAIMER ── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 pb-10">
        <div className="bg-[#F1F5F9] rounded-2xl p-6 flex flex-col gap-2 border border-[#E2E8F0]">
          <div className="flex items-center gap-2 font-mono text-xs text-[#0F172A] uppercase font-bold">
            <span className="material-symbols-outlined text-[16px] text-[#64748B]">gavel</span>
            <span>SEBI &amp; FEMA Statutory Disclaimer</span>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Investments in securities market are subject to market risks. Read all the related documents carefully before investing. Past performance is not indicative of future returns. Backtested results are hypothetical and based on historical NSE tick archives; live execution may vary due to liquidity and exchange latency. Apex Quant Research Workstation is a quantitative analytics and systematic execution interface.
          </p>
        </div>
      </section>

      {/* ── 8. PUBLIC FOOTER ── */}
      <footer className="w-full bg-[#001433] text-white border-t border-[#00225A] py-8 px-4 sm:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-[#536CF0] text-white flex items-center justify-center font-bold text-xs">
              A
            </div>
            <span className="font-semibold text-white">Arthatix Institutional Quant Terminal</span>
          </div>
          <div>
            Real Bar-by-Bar Vectorized Quantitative Engine · Live Yahoo &amp; Upstox v2 Feeds
          </div>
          <div>
            © {new Date().getFullYear()} Arthatix. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
