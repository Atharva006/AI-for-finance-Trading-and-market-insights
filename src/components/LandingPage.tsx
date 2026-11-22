import React, { useState } from 'react';
import { ALL_CANONICAL_STRATEGIES } from '../services/canonicalStrategies';
import { AlgoStrategy } from '../types/algoMarketplace';
import { AppView } from './DhanNavbar';
import { AuthUserProfile } from '../services/supabaseAuth';

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
  const [algoTab, setAlgoTab] = useState<'trading' | 'wealth'>('trading');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  const featuredStrat =
    activeStrategies.find((s) => s.id === 'algo-nifty-trend-pullback-chandelier') || activeStrategies[0];

  const handleOpenStrategy = (targetIdOrCategory: string) => {
    const match =
      activeStrategies.find(
        (s) =>
          s.id.toLowerCase().includes(targetIdOrCategory.toLowerCase()) ||
          s.name.toLowerCase().includes(targetIdOrCategory.toLowerCase()) ||
          s.category.toLowerCase().includes(targetIdOrCategory.toLowerCase())
      ) || activeStrategies[0];

    if (onSelectStrategy) {
      onSelectStrategy(match);
    } else {
      onNavigateToView('backtest', match);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background font-body-md text-on-background flex flex-col selection:bg-secondary selection:text-white">
      {/* ── 0. FIXED INSTITUTIONAL TELEMETRY & NAVBAR ── */}
      <header className="fixed top-0 w-full z-50">
        {/* Live Telemetry Ticker Ribbon */}
        <div className="h-8 w-full bg-surface-card border-b border-border-subtle px-margin flex items-center justify-between overflow-x-auto whitespace-nowrap gap-space-lg font-mono-sm text-mono-sm text-on-surface-variant no-scrollbar">
          <div className="flex items-center gap-space-lg">
            <span className="inline-flex items-center gap-space-sm text-on-surface">
              <span className="w-2 h-2 rounded-full bg-bullish animate-pulse" />
              NSE CASH &amp; NFO: LIVE STREAM
            </span>
            <span>LATENCY: 12ms (Direct Exchange Co-Lo)</span>
            <span>
              NIFTY 50-EMA: <span className="text-bullish font-semibold">72% Above</span>
            </span>
            <span>
              FII/DII FLOW: <span className="text-bullish font-semibold">+₹2,827 Cr</span>
            </span>
            <span>G-SEC (Rf): 6.50%</span>
            <span>GROQ LPU: 120B Quant</span>
            <span>
              BAR REPLAY: <span className="text-secondary font-semibold">5m / 15m / 30m / 1h / 1d Active</span>
            </span>
          </div>

          <div className="flex items-center gap-space-md shrink-0">
            <button
              onClick={() => onNavigateToView('forex')}
              className="inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-forex-tint border border-secondary text-secondary font-mono-sm text-mono-sm hover:bg-secondary hover:text-on-secondary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">public</span>
              NRI / FOREX DESK (EUR·GBP)
            </button>
            <span className="inline-flex items-center gap-space-xs text-on-surface font-medium">
              <span className="material-symbols-outlined text-[14px] text-bullish">verified_user</span>
              SEBI &amp; FEMA COMPLIANT
            </span>
          </div>
        </div>

        {/* Main Public Institutional Header */}
        <div className="h-16 w-full bg-surface-card/95 backdrop-blur-md border-b border-border-subtle px-margin flex items-center justify-between gap-gutter">
          {/* Logo & Brand Identity */}
          <div
            onClick={() => onNavigateToView('landing')}
            className="flex items-center gap-2.5 shrink-0 cursor-pointer select-none group"
            title="Alltra Quantitative Platform"
          >
            <div className="w-9 h-9 rounded-xl bg-[#021810] border border-[#10B981]/40 flex items-center justify-center p-1 shadow-xs overflow-hidden group-hover:border-[#10B981] transition-colors">
              <img src="/alltra-icon.png" alt="Alltra" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono font-extrabold text-[16px] text-[#0F172A] tracking-wider uppercase leading-none">
                ALLTRA
              </span>
              <span className="text-[9px] text-[#059669] font-mono tracking-widest font-semibold uppercase mt-0.5">
                SINCE 2026
              </span>
            </div>
          </div>

          {/* Public Navigation Links */}
          <nav className="hidden xl:flex items-center gap-space-xs">
            <button
              onClick={() => onNavigateToView('overview')}
              className="px-space-sm py-1.5 font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
            >
              Overview
            </button>
            <button
              onClick={() => onNavigateToView('barreplay')}
              className="px-space-sm py-1.5 font-label-md text-label-md text-secondary font-semibold hover:text-secondary hover:bg-forex-tint rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">history_toggle_off</span>
              Bar Replay [15m Replay]
            </button>
            <button
              onClick={() => onNavigateToView('marketplace')}
              className="px-space-sm py-1.5 font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
            >
              Trading Algos [{activeStrategies.length} Active]
            </button>
            <button
              onClick={() => onNavigateToView('backtest', featuredStrat)}
              className="px-space-sm py-1.5 font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
            >
              Backtest Studio
            </button>
            <button
              onClick={() => onNavigateToView('insights')}
              className="px-space-sm py-1.5 font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
            >
              Market Insights
            </button>
            <button
              onClick={() => onNavigateToView('forex')}
              className="px-space-sm py-1.5 font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
            >
              NRI Forex Desk
            </button>
            <button
              onClick={() => onNavigateToView('admin')}
              className="px-space-sm py-1.5 font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
            >
              Admin Portal
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-space-sm shrink-0">
            <button
              onClick={() => onNavigateToView('barreplay')}
              className="hidden sm:inline-flex items-center gap-1 px-space-sm py-1.5 rounded-lg bg-forex-tint border border-secondary text-secondary font-label-md text-label-md hover:bg-secondary hover:text-on-secondary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">play_circle</span>
              Bar Replay
            </button>
            <button
              onClick={() => onNavigateToView('marketplace')}
              className="hidden md:inline-flex items-center px-space-sm py-1.5 rounded-lg bg-surface-card border border-border-subtle text-on-surface font-label-md text-label-md hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer"
            >
              Algorithms
            </button>
            <button
              onClick={() => onNavigateToView('overview')}
              className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">desktop_windows</span>
              Launch Terminal
            </button>

            {/* User / Sign In Button */}
            <div className="flex items-center gap-space-sm pl-space-sm border-l border-border-subtle">
              {currentUser ? (
                <button
                  onClick={() => onNavigateToView('overview')}
                  className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs uppercase cursor-pointer"
                  title={`${currentUser.name} (${currentUser.role})`}
                >
                  {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                </button>
              ) : (
                <button
                  onClick={() => onNavigateToView('auth')}
                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-primary-container transition-colors"
                  title="Sign In"
                >
                  <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── 1. MAIN CONTENT (Offset for fixed header) ── */}
      <main className="w-full pt-28 px-margin bg-background flex-1">
        <div className="flex flex-col w-full max-w-7xl mx-auto gap-space-xl">
          {/* ── HERO SECTION (12-Column Grid) ── */}
          <section className="w-full pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              {/* Left Column (7 cols): Value Proposition */}
              <div className="lg:col-span-7 flex flex-col justify-between gap-space-lg py-space-sm">
                <div className="flex flex-col gap-space-md">
                  <div className="inline-flex items-center gap-space-sm self-start px-space-sm py-1 rounded-full bg-surface-container-low border border-border-subtle">
                    <span className="w-2 h-2 rounded-full bg-bullish animate-pulse" />
                    <span className="font-mono-sm text-mono-sm text-on-surface-variant uppercase font-semibold">
                      ALLTRA QUANTITATIVE PLATFORM // SINCE 2026
                    </span>
                  </div>

                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                    Results you can actually follow.
                  </h1>

                  <p className="font-body-md text-body-md text-text-secondary max-w-2xl leading-relaxed">
                    Performance analytics, candle-by-candle bar replay, and systematic algorithm execution for NSE equities, index derivatives, and global macro desks. Zero emotional guesswork. Pure mathematical edge verified across historical market regimes.
                  </p>
                </div>

                {/* Primary CTA Buttons */}
                <div className="flex flex-wrap items-center gap-space-md">
                  <button
                    onClick={() => onNavigateToView('overview')}
                    className="inline-flex items-center gap-space-sm px-space-lg py-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm cursor-pointer active:scale-95"
                  >
                    <span>Open Alltra Workstation</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>

                  <button
                    onClick={() => onNavigateToView('barreplay')}
                    className="inline-flex items-center gap-space-sm px-space-lg py-3 rounded-lg bg-forex-tint text-secondary border border-secondary font-label-md text-label-md hover:bg-secondary hover:text-white transition-colors shadow-sm cursor-pointer active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[18px]">candlestick_chart</span>
                    <span>Bar Replay Studio</span>
                  </button>

                  <a
                    href="#algorithms-section"
                    className="inline-flex items-center gap-space-sm px-space-lg py-3 rounded-lg bg-surface-card text-on-surface font-label-md text-label-md hover:bg-surface-container-low border border-border-subtle transition-colors shadow-sm cursor-pointer"
                  >
                    <span>Explore Strategies</span>
                  </a>
                </div>

                {/* Mono Benchmark Ribbon */}
                <div className="w-full bg-surface-card rounded-xl p-space-md shadow-sm border border-border-subtle flex flex-wrap items-center gap-x-space-lg gap-y-space-sm font-mono-sm text-mono-sm text-on-surface-variant">
                  <span className="inline-flex items-center gap-space-xs">
                    <span className="text-text-muted">BENCHMARK:</span>
                    <span className="text-on-surface font-semibold">NIFTY 50</span>
                  </span>
                  <span className="text-outline-variant">|</span>
                  <span className="inline-flex items-center gap-space-xs">
                    <span className="text-text-muted">DATA:</span>
                    <span className="text-on-surface font-semibold">7+ Years NSE Tick Archive</span>
                  </span>
                  <span className="text-outline-variant">|</span>
                  <span className="inline-flex items-center gap-space-xs">
                    <span className="text-text-muted">EXECUTION:</span>
                    <span className="text-on-surface font-semibold">Deterministic DMA</span>
                  </span>
                </div>
              </div>

              {/* Right Column (5 cols): Featured Audited Card */}
              <div className="lg:col-span-5">
                <div className="w-full bg-surface-card rounded-xl p-space-lg shadow-md border border-border-subtle flex flex-col gap-space-lg">
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-space-sm">
                    <div className="flex items-center gap-space-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-bullish animate-pulse" />
                      <span className="font-mono-md text-mono-md text-on-surface font-semibold">
                        NIFTY_ALPHA_V4
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-bullish-tint text-bullish font-mono-sm text-mono-sm font-semibold">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      AUDITED
                    </span>
                  </div>

                  {/* 4-Metric Quad-Grid */}
                  <div className="grid grid-cols-2 gap-gutter">
                    {/* Metric 1 */}
                    <div className="bg-bullish-tint rounded-lg p-space-md flex flex-col gap-space-xs">
                      <span className="font-label-sm text-label-sm text-text-secondary uppercase">
                        1-Year Return
                      </span>
                      <span className="font-mono-lg text-mono-lg text-bullish tabular-nums font-bold">
                        +114.6%
                      </span>
                      <span className="font-mono-sm text-mono-sm text-bullish/80">
                        Net of slippage
                      </span>
                    </div>

                    {/* Metric 2 */}
                    <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col gap-space-xs">
                      <span className="font-label-sm text-label-sm text-text-secondary uppercase">
                        Sharpe Ratio
                      </span>
                      <span className="font-mono-lg text-mono-lg text-on-surface tabular-nums font-bold">
                        2.84
                      </span>
                      <span className="font-mono-sm text-mono-sm text-text-muted">
                        vs 6.50% G-Sec
                      </span>
                    </div>

                    {/* Metric 3 */}
                    <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col gap-space-xs">
                      <span className="font-label-sm text-label-sm text-text-secondary uppercase">
                        Win Rate
                      </span>
                      <span className="font-mono-lg text-mono-lg text-on-surface tabular-nums font-bold">
                        72.5%
                      </span>
                      <span className="font-mono-sm text-mono-sm text-text-muted">
                        1,482 trades
                      </span>
                    </div>

                    {/* Metric 4 */}
                    <div className="bg-bearish-tint rounded-lg p-space-md flex flex-col gap-space-xs">
                      <span className="font-label-sm text-label-sm text-text-secondary uppercase">
                        Max Drawdown
                      </span>
                      <span className="font-mono-lg text-mono-lg text-bearish tabular-nums font-bold">
                        -3.40%
                      </span>
                      <span className="font-mono-sm text-mono-sm text-bearish/80">
                        recovery 5.2 days
                      </span>
                    </div>
                  </div>

                  {/* Interactive SVG Sparkline */}
                  <div className="w-full h-16 text-bullish">
                    <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 240 60">
                      <polyline
                        points="0,52 30,48 60,44 90,46 120,34 150,28 180,22 210,14 240,6"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                      />
                    </svg>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => onNavigateToView('backtest', featuredStrat)}
                    className="w-full inline-flex items-center justify-center gap-space-sm px-space-md py-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors cursor-pointer active:scale-95"
                  >
                    <span>View in Strategy Studio</span>
                    <span className="material-symbols-outlined text-[18px]">candlestick_chart</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ── PHOTO SHOWCASE 1: THE ALLTRA TERMINAL WORKSTATION ── */}
          <section className="w-full">
            <div className="w-full rounded-2xl overflow-hidden border border-border-subtle shadow-xl bg-[#090D14] flex flex-col group">
              {/* Terminal Window Header Bar */}
              <div className="px-5 py-3.5 bg-[#0D1321] border-b border-[#1E293B] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                    <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                    <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                  </div>
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                    <span>ALLTRA QUANTITATIVE WORKSTATION // MULTI-DESK TERMINAL</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[#94A3B8]">
                  <span className="hidden sm:inline">NSE LIVE CO-LO: 12ms</span>
                  <span className="hidden sm:inline">|</span>
                  <span>GROQ LPU REASONING ACTIVE</span>
                  <span className="hidden md:inline">|</span>
                  <span className="text-[#10B981] font-semibold">NIFTY 50 CONSTITUENTS: 100% LIVE</span>
                </div>
              </div>

              {/* High-Resolution Terminal Photo Preview */}
              <div className="relative aspect-[16/9] max-h-[620px] w-full overflow-hidden bg-[#000000]">
                <img
                  src="/alltra-terminal-hero.jpg"
                  alt="Alltra Institutional Quantitative Trading Terminal"
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.01]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090D14] via-transparent to-transparent opacity-75" />

                {/* Floating Interactive Badges */}
                <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-[#0D1321]/95 backdrop-blur-md border border-[#10B981]/50 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-xl">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#94A3B8] uppercase font-mono">Execution Speed</span>
                        <span className="text-xs font-mono font-bold text-white">NSE Direct Market Access (12ms)</span>
                      </div>
                    </div>

                    <div className="bg-[#0D1321]/95 backdrop-blur-md border border-[#38BDF8]/50 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-xl">
                      <span className="material-symbols-outlined text-[#38BDF8] text-[18px]">candlestick_chart</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#94A3B8] uppercase font-mono">Candle-by-Candle</span>
                        <span className="text-xs font-mono font-bold text-white">5m, 15m, 30m, 1h, 1d Bar Replay</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onNavigateToView('barreplay')}
                      className="px-4 py-2.5 rounded-xl bg-white/10 text-white font-mono text-xs font-bold hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px]">play_circle</span>
                      <span>OPEN BAR REPLAY</span>
                    </button>

                    <button
                      onClick={() => onNavigateToView('overview')}
                      className="px-5 py-2.5 rounded-xl bg-[#10B981] text-[#021810] font-mono text-xs font-bold hover:bg-[#34D399] transition-all shadow-lg shadow-[#10B981]/30 flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <span>ENTER WORKSTATION</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── SECTION: 01 // PLATFORM ARCHITECTURE ── */}
          <section className="w-full py-space-md flex flex-col gap-space-lg">
            <div className="flex flex-col gap-space-xs">
              <span className="font-mono-sm text-mono-sm text-text-muted uppercase font-semibold">
                01 // Platform Architecture
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Deterministic execution without discretionary drift.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
              {/* Pillar 1 */}
              <div className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-subtle flex flex-col gap-space-md hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface">
                  <span className="material-symbols-outlined text-[22px]">terminal</span>
                </div>
                <div className="flex flex-col gap-space-sm">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Rules in, orders out
                  </h3>
                  <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
                    Every entry, scale-in, and exit is governed by pre-compiled quantitative conditions. Limit orders are routed directly to NSE matching engines with zero manual intervention.
                  </p>
                </div>
                <div className="mt-auto pt-space-sm font-mono-sm text-mono-sm text-text-muted font-medium">
                  LATENCY: 12ms DIRECT STREAM
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-subtle flex flex-col gap-space-md hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-bearish-tint flex items-center justify-center text-bearish">
                  <span className="material-symbols-outlined text-[22px]">shield</span>
                </div>
                <div className="flex flex-col gap-space-sm">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Drawdown &amp; risk control
                  </h3>
                  <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
                    Hard portfolio-level circuit breakers, volatility-adjusted position sizing, and intraday MTM stop-losses protect capital during black-swan liquidity shocks.
                  </p>
                </div>
                <div className="mt-auto pt-space-sm font-mono-sm text-mono-sm text-bearish font-medium">
                  MAX DD CAP: -5.00% HARD STOP
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-subtle flex flex-col gap-space-md hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-bullish-tint flex items-center justify-center text-bullish">
                  <span className="material-symbols-outlined text-[22px]">query_stats</span>
                </div>
                <div className="flex flex-col gap-space-sm">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Numbers that hold up
                  </h3>
                  <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
                    Bar-by-bar vectorized backtesting over 7+ years of NSE tick data, accounting for STT, exchange transaction charges, GST, stamp duty, and realistic bid-ask slippage.
                  </p>
                </div>
                <div className="mt-auto pt-space-sm font-mono-sm text-mono-sm text-bullish font-medium">
                  WALK-FORWARD VERIFIED
                </div>
              </div>
            </div>
          </section>

          {/* ── PHOTO SHOWCASE 2: DEEP QUANTITATIVE ANALYTICS ── */}
          <section className="w-full py-space-sm">
            <div className="bg-surface-card rounded-2xl border border-border-subtle p-6 lg:p-8 shadow-sm flex flex-col lg:flex-row items-center gap-8">
              {/* Left Column: Visual description */}
              <div className="lg:w-1/2 flex flex-col gap-4">
                <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-surface-container-low border border-border-subtle font-mono text-xs text-text-secondary">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  <span>VECTORIZED RESEARCH &amp; MONTE CARLO</span>
                </div>

                <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-on-surface">
                  Deep quantitative analytics, drawdown matrices &amp; equity curves.
                </h2>

                <p className="text-sm text-text-secondary leading-relaxed">
                  Analyze strategy stress tests across bull runs, bear markets, and volatility spikes. Alltra calculates walk-forward returns, Sharpe/Sortino ratios, underwater drawdowns, and distribution frequencies across millions of simulated ticks.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-surface-container-low border border-border-subtle">
                    <span className="text-text-muted block text-[10px] uppercase">Transaction Friction</span>
                    <span className="font-bold text-on-surface">SEBI / STT / Stamp Duty Modeled</span>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-container-low border border-border-subtle">
                    <span className="text-text-muted block text-[10px] uppercase">Walk-Forward Windows</span>
                    <span className="font-bold text-on-surface">Out-of-Sample Validated</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigateToView('backtest', featuredStrat)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-mono text-xs font-semibold hover:bg-primary-container transition-colors shadow-xs"
                  >
                    <span>LAUNCH BACKTEST SUITE</span>
                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  </button>
                </div>
              </div>

              {/* Right Column: High-Res Analytics Photo */}
              <div className="lg:w-1/2 w-full rounded-xl overflow-hidden border border-border-subtle shadow-md group">
                <img
                  src="/alltra-quant-analytics.jpg"
                  alt="Alltra Quantitative Analytics & Strategy Engineering"
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </section>

          {/* ── SECTION: 02 // CANDLE-BY-CANDLE BAR REPLAY ENGINE ── */}
          <section className="w-full py-space-sm">
            <div className="bg-surface-card rounded-2xl border border-secondary/20 p-6 lg:p-8 shadow-sm flex flex-col lg:flex-row-reverse items-center gap-8">
              {/* Right Column: Visual description */}
              <div className="lg:w-1/2 flex flex-col gap-4">
                <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-forex-tint border border-secondary/40 font-mono text-xs text-secondary font-semibold">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span>ZERO-LOOKAHEAD BAR REPLAY STUDIO</span>
                </div>

                <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-on-surface">
                  Step candle-by-candle through real market history.
                </h2>

                <p className="text-sm text-text-secondary leading-relaxed">
                  Practice discretionary execution or test systematic order fills with authentic TradingView charts. Rewind time on any of the 50 NIFTY 50 constituent stocks, draw trendlines and order-block zones, and execute simulated Long/Short trades with automated SL/TP risk enforcement.
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2 font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-surface-container-low border border-border-subtle text-center">
                    <span className="text-[10px] text-text-muted uppercase block">Timeframes</span>
                    <span className="font-bold text-on-surface">5m · 15m · 30m · 1h · 1d</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-container-low border border-border-subtle text-center">
                    <span className="text-[10px] text-text-muted uppercase block">Draw Tools</span>
                    <span className="font-bold text-on-surface">Ray · Zone · Trend</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-container-low border border-border-subtle text-center">
                    <span className="text-[10px] text-text-muted uppercase block">Constituents</span>
                    <span className="font-bold text-on-surface">All 50 NIFTY Stocks</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigateToView('barreplay')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-white font-mono text-xs font-semibold hover:bg-secondary/90 transition-colors shadow-xs"
                  >
                    <span>OPEN BAR REPLAY STUDIO</span>
                    <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  </button>
                </div>
              </div>

              {/* Left Column: Visual Showcase Photo / Interactive Mockup */}
              <div className="lg:w-1/2 w-full rounded-xl overflow-hidden border border-border-subtle shadow-md bg-[#0F172A] p-4 text-white font-mono text-xs flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#334155] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#38BDF8]">RELIANCE.NS</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#1E293B] text-[10px] text-[#94A3B8]">15m CANDLE</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#94A3B8]">
                    <span>REPLAY: BAR 84/375</span>
                    <span className="text-[#10B981] font-bold">PNL: +₹14,250.00</span>
                  </div>
                </div>

                {/* Simulated Chart Viewport with Candlesticks */}
                <div className="h-44 w-full bg-[#0B0F17] rounded-lg p-2 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute inset-x-0 top-1/2 h-[1px] border-b border-dashed border-[#1E293B]" />
                  <div className="absolute inset-x-0 top-1/4 h-[1px] border-b border-dashed border-[#10B981]/30">
                    <span className="text-[9px] text-[#10B981] bg-[#0B0F17] px-1 float-right">TP: ₹2,980.00</span>
                  </div>
                  <div className="absolute inset-x-0 bottom-1/4 h-[1px] border-b border-dashed border-[#EF4444]/30">
                    <span className="text-[9px] text-[#EF4444] bg-[#0B0F17] px-1 float-right">SL: ₹2,910.00</span>
                  </div>

                  {/* Trendline Canvas Overlay Simulation */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <line x1="20" y1="120" x2="340" y2="40" stroke="#38BDF8" strokeWidth="2" strokeDasharray="3 3" />
                    <rect x="140" y="55" width="120" height="25" fill="#10B981" fillOpacity="0.12" stroke="#10B981" strokeWidth="1" strokeDasharray="2 2" />
                  </svg>

                  <div className="flex items-end justify-between h-full pt-4 pb-2 z-10 px-2">
                    {[
                      { h: 40, c: '#10B981' }, { h: 55, c: '#10B981' }, { h: 48, c: '#EF4444' }, { h: 65, c: '#10B981' },
                      { h: 72, c: '#10B981' }, { h: 60, c: '#EF4444' }, { h: 80, c: '#10B981' }, { h: 90, c: '#10B981' },
                      { h: 82, c: '#EF4444' }, { h: 105, c: '#10B981' }, { h: 110, c: '#10B981' }, { h: 98, c: '#EF4444' },
                    ].map((bar, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="w-[1px] h-3 bg-white/40" />
                        <div
                          style={{ height: `${bar.h}px`, backgroundColor: bar.c }}
                          className="w-3 rounded-xs shadow-xs"
                        />
                        <div className="w-[1px] h-2 bg-white/40" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Replay Controls Toolbar */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-1 rounded bg-[#1E293B] text-[10px] text-white font-semibold">0.5x</span>
                    <span className="px-2 py-1 rounded bg-[#10B981] text-[10px] text-[#021810] font-bold">1x</span>
                    <span className="px-2 py-1 rounded bg-[#1E293B] text-[10px] text-white font-semibold">2x</span>
                    <span className="px-2 py-1 rounded bg-[#1E293B] text-[10px] text-white font-semibold">5x</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#94A3B8]">STEP FORWARD [➔]</span>
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── PHOTO SHOWCASE 3: MULTI-ASSET & GLOBAL FOREX DESK ── */}
          <section className="w-full py-space-sm">
            <div className="bg-surface-card rounded-2xl border border-border-subtle p-6 lg:p-8 shadow-sm flex flex-col lg:flex-row items-center gap-8">
              {/* Left Column: Visual description */}
              <div className="lg:w-1/2 flex flex-col gap-4">
                <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-forex-tint border border-secondary/30 font-mono text-xs text-secondary font-semibold">
                  <span className="material-symbols-outlined text-[16px]">public</span>
                  <span>GLOBAL NRI &amp; MULTI-ASSET ROUTING</span>
                </div>

                <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-on-surface">
                  Institutional multi-asset desks: Equities, Derivatives, Forex &amp; MCX.
                </h2>

                <p className="text-sm text-text-secondary leading-relaxed">
                  Seamlessly bridge domestic Indian exchanges with international liquidity. Alltra supports non-resident Indian (NRI) account routing, EUR/GBP algorithmic currency pairs, and automated Fair Value Gap (FVG) execution.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-surface-container-low border border-border-subtle">
                    <span className="text-text-muted block text-[10px] uppercase">Cross-Border Compliance</span>
                    <span className="font-bold text-on-surface">SEBI / FEMA Regulated Desks</span>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-container-low border border-border-subtle">
                    <span className="text-text-muted block text-[10px] uppercase">Liquidity Model</span>
                    <span className="font-bold text-on-surface">Fair Value Gap &amp; Order Blocks</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigateToView('forex')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-mono text-xs font-semibold hover:bg-primary-container transition-colors shadow-xs"
                  >
                    <span>EXPLORE NRI FOREX PORTAL</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Multi-Asset High-Res Photo */}
              <div className="lg:w-1/2 w-full rounded-xl overflow-hidden border border-border-subtle shadow-md group">
                <img
                  src="/alltra-multi-asset.jpg"
                  alt="Alltra Multi-Asset Global Institutional Desk"
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </section>

          {/* ── SECTION: 03 // ALGORITHMS & BASKETS ── */}
          <section className="w-full py-space-lg flex flex-col gap-space-lg" id="algorithms-section">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
              <div className="flex flex-col gap-space-xs">
                <span className="font-mono-sm text-mono-sm text-text-muted uppercase font-semibold">
                  03 // Systematic Strategies &amp; Baskets
                </span>
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  Systematic strategies across market regimes.
                </h2>
              </div>

              {/* Segmented Control */}
              <div
                className="inline-flex p-1 rounded-lg bg-surface-container-low self-start md:self-auto border border-border-subtle"
                role="tablist"
              >
                <button
                  onClick={() => setAlgoTab('trading')}
                  className={`px-space-md py-2 rounded-md font-label-md text-label-md transition-all cursor-pointer ${
                    algoTab === 'trading'
                      ? 'bg-surface-card text-on-surface shadow-sm font-semibold'
                      : 'text-text-secondary hover:text-on-surface'
                  }`}
                  type="button"
                >
                  Trading Algorithms
                </button>
                <button
                  onClick={() => setAlgoTab('wealth')}
                  className={`px-space-md py-2 rounded-md font-label-md text-label-md transition-all cursor-pointer ${
                    algoTab === 'wealth'
                      ? 'bg-surface-card text-on-surface shadow-sm font-semibold'
                      : 'text-text-secondary hover:text-on-surface'
                  }`}
                  type="button"
                >
                  Investment &amp; Wealth Algos Below ₹1.1L
                </button>
              </div>
            </div>

            {/* Grid 1: Trading Algorithms */}
            {algoTab === 'trading' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
                {/* Card 1 */}
                <div
                  onClick={() => handleOpenStrategy('nifty')}
                  className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-subtle flex flex-col gap-space-md hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-md text-mono-md text-on-surface font-semibold group-hover:text-secondary transition-colors">
                      NIFTY_ALPHA_V4
                    </span>
                    <span className="px-space-sm py-0.5 rounded-full bg-surface-container-low font-mono-sm text-mono-sm text-on-surface-variant font-medium">
                      NIFTY 50
                    </span>
                  </div>

                  {/* Sparkline */}
                  <div className="w-full h-16 text-bullish">
                    <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 240 60">
                      <polyline
                        points="0,52 30,48 60,44 90,46 120,34 150,28 180,22 210,14 240,6"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>

                  {/* 4-metric row */}
                  <div className="grid grid-cols-4 gap-space-xs pt-space-sm border-t border-border-subtle">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-muted">CAGR</span>
                      <span className="font-mono-sm text-mono-sm text-bullish tabular-nums font-bold">+114.6%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-muted">SHARPE</span>
                      <span className="font-mono-sm text-mono-sm text-on-surface tabular-nums font-medium">2.84</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-muted">WIN</span>
                      <span className="font-mono-sm text-mono-sm text-on-surface tabular-nums font-medium">72.5%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-muted">MAX DD</span>
                      <span className="font-mono-sm text-mono-sm text-bearish tabular-nums font-medium">-3.40%</span>
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div
                  onClick={() => handleOpenStrategy('banknifty')}
                  className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-subtle flex flex-col gap-space-md hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-md text-mono-md text-on-surface font-semibold group-hover:text-secondary transition-colors">
                      BANKNIFTY_GAMMA
                    </span>
                    <span className="px-space-sm py-0.5 rounded-full bg-surface-container-low font-mono-sm text-mono-sm text-on-surface-variant font-medium">
                      BANKNIFTY
                    </span>
                  </div>

                  <div className="w-full h-16 text-bullish">
                    <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 240 60">
                      <polyline
                        points="0,50 30,45 60,49 90,38 120,30 150,32 180,20 210,16 240,10"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>

                  <div className="grid grid-cols-4 gap-space-xs pt-space-sm border-t border-border-subtle">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-muted">CAGR</span>
                      <span className="font-mono-sm text-mono-sm text-bullish tabular-nums font-bold">+86.2%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-muted">SHARPE</span>
                      <span className="font-mono-sm text-mono-sm text-on-surface tabular-nums font-medium">2.41</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-muted">WIN</span>
                      <span className="font-mono-sm text-mono-sm text-on-surface tabular-nums font-medium">68.4%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-muted">MAX DD</span>
                      <span className="font-mono-sm text-mono-sm text-bearish tabular-nums font-medium">-4.15%</span>
                    </div>
                  </div>
                </div>

                {/* Card 3 */}
                <div
                  onClick={() => handleOpenStrategy('finnifty')}
                  className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-subtle flex flex-col gap-space-md hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-md text-mono-md text-on-surface font-semibold group-hover:text-secondary transition-colors">
                      FINNIFTY_MEANREV
                    </span>
                    <span className="px-space-sm py-0.5 rounded-full bg-surface-container-low font-mono-sm text-mono-sm text-on-surface-variant font-medium">
                      FINNIFTY
                    </span>
                  </div>

                  <div className="w-full h-16 text-bullish">
                    <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 240 60">
                      <polyline
                        points="0,54 30,50 60,42 90,40 120,35 150,26 180,24 210,18 240,12"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>

                  <div className="grid grid-cols-4 gap-space-xs pt-space-sm border-t border-border-subtle">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-muted">CAGR</span>
                      <span className="font-mono-sm text-mono-sm text-bullish tabular-nums font-bold">+64.8%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-muted">SHARPE</span>
                      <span className="font-mono-sm text-mono-sm text-on-surface tabular-nums font-medium">2.18</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-muted">WIN</span>
                      <span className="font-mono-sm text-mono-sm text-on-surface tabular-nums font-medium">74.0%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-muted">MAX DD</span>
                      <span className="font-mono-sm text-mono-sm text-bearish tabular-nums font-medium">-2.90%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Grid 2: Investment & Wealth Algos Below ₹1.1L */}
            {algoTab === 'wealth' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
                {/* Wealth Card 1 */}
                <div
                  onClick={() => handleOpenStrategy('momentum')}
                  className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-subtle flex flex-col gap-space-md hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-md text-mono-md text-on-surface font-semibold group-hover:text-secondary transition-colors">
                      MOMENTUM_20_EQ
                    </span>
                    <span className="px-space-sm py-0.5 rounded-full bg-forex-tint font-mono-sm text-mono-sm text-secondary font-semibold">
                      ₹95,000 MIN
                    </span>
                  </div>

                  <div className="w-full h-16 text-bullish">
                    <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 240 60">
                      <polyline
                        points="0,54 40,48 80,44 120,36 160,28 200,20 240,12"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>

                  <div className="grid grid-cols-4 gap-space-xs pt-space-sm border-t border-border-subtle">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-muted">CAGR</span>
                      <span className="font-mono-sm text-mono-sm text-bullish tabular-nums font-bold">+34.2%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-muted">SHARPE</span>
                      <span className="font-mono-sm text-mono-sm text-on-surface tabular-nums font-medium">1.92</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-muted">WIN</span>
                      <span className="font-mono-sm text-mono-sm text-on-surface tabular-nums font-medium">66.0%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-muted">MAX DD</span>
                      <span className="font-mono-sm text-mono-sm text-bearish tabular-nums font-medium">-6.80%</span>
                    </div>
                  </div>
                </div>

                {/* Wealth Card 2 */}
                <div
                  onClick={() => handleOpenStrategy('low vol')}
                  className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-subtle flex flex-col gap-space-md hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-md text-mono-md text-on-surface font-semibold group-hover:text-secondary transition-colors">
                      LOW_VOL_CORE
                    </span>
                    <span className="px-space-sm py-0.5 rounded-full bg-forex-tint font-mono-sm text-mono-sm text-secondary font-semibold">
                      ₹75,000 MIN
                    </span>
                  </div>

                  <div className="w-full h-16 text-bullish">
                    <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 240 60">
                      <polyline
                        points="0,52 40,49 80,42 120,38 160,31 200,24 240,16"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>

                  <div className="grid grid-cols-4 gap-space-xs pt-space-sm border-t border-border-subtle">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-muted">CAGR</span>
                      <span className="font-mono-sm text-mono-sm text-bullish tabular-nums font-bold">+26.8%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-muted">SHARPE</span>
                      <span className="font-mono-sm text-mono-sm text-on-surface tabular-nums font-medium">2.10</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-muted">WIN</span>
                      <span className="font-mono-sm text-mono-sm text-on-surface tabular-nums font-medium">71.2%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-muted">MAX DD</span>
                      <span className="font-mono-sm text-mono-sm text-bearish tabular-nums font-medium">-4.50%</span>
                    </div>
                  </div>
                </div>

                {/* Wealth Card 3 */}
                <div
                  onClick={() => handleOpenStrategy('etf')}
                  className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-subtle flex flex-col gap-space-md hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-md text-mono-md text-on-surface font-semibold group-hover:text-secondary transition-colors">
                      ETF_ROTATION_V2
                    </span>
                    <span className="px-space-sm py-0.5 rounded-full bg-forex-tint font-mono-sm text-mono-sm text-secondary font-semibold">
                      ₹50,000 MIN
                    </span>
                  </div>

                  <div className="w-full h-16 text-bullish">
                    <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 240 60">
                      <polyline
                        points="0,55 40,51 80,46 120,40 160,34 200,26 240,18"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>

                  <div className="grid grid-cols-4 gap-space-xs pt-space-sm border-t border-border-subtle">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-muted">CAGR</span>
                      <span className="font-mono-sm text-mono-sm text-bullish tabular-nums font-bold">+22.4%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-muted">SHARPE</span>
                      <span className="font-mono-sm text-mono-sm text-on-surface tabular-nums font-medium">1.85</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-muted">WIN</span>
                      <span className="font-mono-sm text-mono-sm text-on-surface tabular-nums font-medium">69.5%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-muted">MAX DD</span>
                      <span className="font-mono-sm text-mono-sm text-bearish tabular-nums font-medium">-3.80%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ── SECTION: 04 // OPERATIONAL SPECIFICATIONS (FAQ) ── */}
          <section className="w-full py-space-md flex flex-col gap-space-lg">
            <div className="flex flex-col gap-space-xs">
              <span className="font-mono-sm text-mono-sm text-text-muted uppercase font-semibold">
                04 // Operational Specifications
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="flex flex-col gap-space-sm">
              {/* FAQ 1 */}
              <div className="bg-surface-card rounded-xl shadow-sm border border-border-subtle overflow-hidden">
                <button
                  onClick={() => toggleFaq(1)}
                  className="w-full px-space-lg py-space-md flex items-center justify-between text-left cursor-pointer"
                  type="button"
                >
                  <span className="font-title-md text-title-md text-on-surface font-semibold">
                    How does the Alltra Bar Replay engine prevent lookahead bias?
                  </span>
                  <span
                    className="material-symbols-outlined text-on-surface-variant transition-transform duration-200"
                    style={{ transform: openFaq === 1 ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    expand_more
                  </span>
                </button>
                {openFaq === 1 && (
                  <div className="px-space-lg pb-space-md border-t border-surface-container-low pt-3">
                    <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
                      Alltra stores the full historical dataset in memory and uses a strict pointer `allCandles.slice(0, currentIndex + 1)`. When stepping candle-by-candle, future bars are completely invisible to both chart rendering and simulated risk evaluation, ensuring zero lookahead bias.
                    </p>
                  </div>
                )}
              </div>

              {/* FAQ 2 */}
              <div className="bg-surface-card rounded-xl shadow-sm border border-border-subtle overflow-hidden">
                <button
                  onClick={() => toggleFaq(2)}
                  className="w-full px-space-lg py-space-md flex items-center justify-between text-left cursor-pointer"
                  type="button"
                >
                  <span className="font-title-md text-title-md text-on-surface font-semibold">
                    How does paper execution work before deploying live capital?
                  </span>
                  <span
                    className="material-symbols-outlined text-on-surface-variant transition-transform duration-200"
                    style={{ transform: openFaq === 2 ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    expand_more
                  </span>
                </button>
                {openFaq === 2 && (
                  <div className="px-space-lg pb-space-md border-t border-surface-container-low pt-3">
                    <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
                      Paper execution runs against the live NSE tick stream with simulated limit-order queue positioning. You can validate fill rates, intraday MTM swings, and webhook latency in real time without risking capital.
                    </p>
                  </div>
                )}
              </div>

              {/* FAQ 3 */}
              <div className="bg-surface-card rounded-xl shadow-sm border border-border-subtle overflow-hidden">
                <button
                  onClick={() => toggleFaq(3)}
                  className="w-full px-space-lg py-space-md flex items-center justify-between text-left cursor-pointer"
                  type="button"
                >
                  <span className="font-title-md text-title-md text-on-surface font-semibold">
                    Are statutory friction costs (STT, brokerage, stamp duty) included in backtests?
                  </span>
                  <span
                    className="material-symbols-outlined text-on-surface-variant transition-transform duration-200"
                    style={{ transform: openFaq === 3 ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    expand_more
                  </span>
                </button>
                {openFaq === 3 && (
                  <div className="px-space-lg pb-space-md border-t border-surface-container-low pt-3">
                    <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
                      Yes. Every reported CAGR, Sharpe ratio, and equity curve deducts SEBI turnover fees, STT, exchange transaction charges, GST, stamp duty, and a conservative 0.03%–0.05% slippage buffer per leg.
                    </p>
                  </div>
                )}
              </div>

              {/* FAQ 4 */}
              <div className="bg-surface-card rounded-xl shadow-sm border border-border-subtle overflow-hidden">
                <button
                  onClick={() => toggleFaq(4)}
                  className="w-full px-space-lg py-space-md flex items-center justify-between text-left cursor-pointer"
                  type="button"
                >
                  <span className="font-title-md text-title-md text-on-surface font-semibold">
                    How is maximum drawdown controlled during high-volatility events?
                  </span>
                  <span
                    className="material-symbols-outlined text-on-surface-variant transition-transform duration-200"
                    style={{ transform: openFaq === 4 ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    expand_more
                  </span>
                </button>
                {openFaq === 4 && (
                  <div className="px-space-lg pb-space-md border-t border-surface-container-low pt-3">
                    <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
                      Each strategy enforces a hard intraday MTM circuit breaker and dynamic ATR-based position sizing. When India VIX spikes above regime thresholds, exposure is automatically scaled down or flattened to cash.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── 5. SEBI & FEMA STATUTORY DISCLAIMER ── */}
          <section className="w-full pb-space-xl">
            <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col gap-space-sm border border-border-subtle">
              <div className="flex items-center gap-space-xs font-mono-sm text-mono-sm text-on-surface uppercase font-semibold">
                <span className="material-symbols-outlined text-[16px] text-text-muted">gavel</span>
                <span>SEBI &amp; FEMA Statutory Disclaimer</span>
              </div>
              <p className="font-body-sm text-body-sm text-text-muted leading-relaxed">
                Investments in securities market are subject to market risks. Read all the related documents carefully before investing. Past performance is not indicative of future returns. Backtested results are hypothetical and based on historical NSE tick archives; live execution may vary due to liquidity and exchange latency. Alltra Quantitative Platform (Since 2026) is an institutional quantitative analytics and systematic execution interface.
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* ── 6. PUBLIC FOOTER ── */}
      <footer className="w-full bg-surface-card border-t border-border-subtle px-margin py-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-space-sm font-mono-sm text-mono-sm text-text-muted">
          <div className="flex items-center gap-space-sm">
            <div className="w-5 h-5 rounded-md bg-[#021810] border border-[#10B981]/40 flex items-center justify-center p-0.5 overflow-hidden">
              <img src="/alltra-icon.png" alt="Alltra" className="w-full h-full object-cover" />
            </div>
            <span className="font-mono font-bold text-on-surface">ALLTRA</span>
            <span className="text-[10px] text-bullish font-semibold">SINCE 2026</span>
            <span className="text-outline-variant">|</span>
            <span>Real Bar-by-Bar Vectorized Quantitative Backtesting</span>
          </div>
          <div>
            Institutional Systematic Strategy Engineering · Multi-Asset Portfolio Allocation
          </div>
          <div>
            © 2026 ALLTRA QUANT LABS. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
