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

  const featuredStrat = activeStrategies.find((s) => s.id === 'algo-nifty-trend-pullback-chandelier') || activeStrategies[0];

  const handleOpenStrategy = (targetIdOrCategory: string) => {
    const match = activeStrategies.find(
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
              NSE CASH: LIVE FEED
            </span>
            <span>LATENCY: 12ms (Direct NSE Stream)</span>
            <span>
              NIFTY 50-EMA: <span className="text-bullish">72% Above</span>
            </span>
            <span>
              FII/DII FLOW: <span className="text-bullish">+₹2,827 Cr</span>
            </span>
            <span>G-SEC (Rf): 6.50%</span>
            <span>GROQ LPU: 120B Quant</span>
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
            className="flex items-center gap-space-sm shrink-0 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
              AQ
            </div>
            <span className="font-title-md text-title-md text-on-surface tracking-tight lowercase">
              apex quant
            </span>
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
              onClick={() => onNavigateToView('marketplace')}
              className="px-space-sm py-1.5 font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
            >
              Trading Algos [{activeStrategies.length} Active]
            </button>
            <button
              onClick={() => onNavigateToView('backtest', featuredStrat)}
              className="px-space-sm py-1.5 font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
            >
              Backtest Studio [Yahoo Daily]
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
              NRI Forex Desk [EUR/GBP]
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
              onClick={() => onNavigateToView('forex')}
              className="hidden sm:inline-flex items-center px-space-sm py-1.5 rounded-lg bg-forex-tint border border-secondary text-secondary font-label-md text-label-md hover:bg-secondary hover:text-on-secondary transition-colors cursor-pointer"
            >
              NRI / Forex Portal
            </button>
            <button
              onClick={() => onNavigateToView('marketplace')}
              className="hidden md:inline-flex items-center px-space-sm py-1.5 rounded-lg bg-surface-card border border-border-subtle text-on-surface font-label-md text-label-md hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer"
            >
              Algorithms
            </button>
            <button
              onClick={() => onNavigateToView('backtest', featuredStrat)}
              className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              Launch Backtest
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
      <main className="w-full pt-24 px-margin bg-background flex-1">
        <div className="flex flex-col w-full max-w-7xl mx-auto">
          {/* ── 1. HERO SECTION (12-Column Grid) ── */}
          <section className="w-full py-space-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              {/* Left Column (7 cols): Value Proposition */}
              <div className="lg:col-span-7 flex flex-col justify-between gap-space-lg py-space-sm">
                <div className="flex flex-col gap-space-md">
                  <div className="inline-flex items-center gap-space-sm self-start px-space-sm py-1 rounded-full bg-surface-container-low border border-border-subtle">
                    <span className="w-2 h-2 rounded-full bg-bullish animate-pulse" />
                    <span className="font-mono-sm text-mono-sm text-on-surface-variant uppercase font-semibold">
                      NSE &amp; NFO Systematic Desk
                    </span>
                  </div>

                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                    Results you can actually follow.
                  </h1>

                  <p className="font-body-md text-body-md text-text-secondary max-w-2xl leading-relaxed">
                    Performance analytics and systematic algorithm baskets for NSE equities and options. Zero emotional guesswork. Pure mathematical edge verified across historical market regimes.
                  </p>
                </div>

                {/* Primary CTA Buttons */}
                <div className="flex flex-wrap items-center gap-space-md">
                  <button
                    onClick={() => onNavigateToView('overview')}
                    className="inline-flex items-center gap-space-sm px-space-lg py-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm cursor-pointer active:scale-95"
                  >
                    <span>Open Dashboard</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
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
                    <span className="text-text-muted">ORDERS:</span>
                    <span className="text-on-surface font-semibold">Limit Orders Only</span>
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

          {/* ── 2. SECTION: 01 // Platform Architecture ── */}
          <section className="w-full py-space-xl flex flex-col gap-space-lg">
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

          {/* ── 3. SECTION: 02 // Algorithms & Baskets ── */}
          <section className="w-full py-space-xl flex flex-col gap-space-lg" id="algorithms-section">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
              <div className="flex flex-col gap-space-xs">
                <span className="font-mono-sm text-mono-sm text-text-muted uppercase font-semibold">
                  02 // Algorithms &amp; Baskets
                </span>
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  Systematic strategies across market regimes.
                </h2>
              </div>

              {/* Segmented Control */}
              <div className="inline-flex p-1 rounded-lg bg-surface-container-low self-start md:self-auto border border-border-subtle" role="tablist">
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

          {/* ── 4. SECTION: 03 // Operational Specifications (FAQ) ── */}
          <section className="w-full py-space-xl flex flex-col gap-space-lg">
            <div className="flex flex-col gap-space-xs">
              <span className="font-mono-sm text-mono-sm text-text-muted uppercase font-semibold">
                03 // Operational Specifications
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
                    How does paper execution work before deploying live capital?
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
                      Paper execution runs against the live NSE tick stream with simulated limit-order queue positioning. You can validate fill rates, intraday MTM swings, and webhook latency in real time without risking capital.
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
                    What is the difference between Trading Algorithms and Investment &amp; Wealth Algos?
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
                      Trading Algorithms operate on intraday and positional index derivatives (NIFTY, BANKNIFTY, FINNIFTY) with higher turnover and strict daily stop-losses. Investment &amp; Wealth Algos rebalance NSE cash-equity baskets and ETFs weekly or monthly with capital requirements below ₹1.1L.
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
                Investments in securities market are subject to market risks. Read all the related documents carefully before investing. Past performance is not indicative of future returns. Backtested results are hypothetical and based on historical NSE tick archives; live execution may vary due to liquidity and exchange latency. Apex Quant Research Workstation is a quantitative analytics and systematic execution interface.
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* ── 6. PUBLIC FOOTER ── */}
      <footer className="w-full bg-surface-card border-t border-border-subtle px-margin py-space-sm mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-space-sm font-mono-sm text-mono-sm text-text-muted">
          <div className="flex items-center gap-space-sm">
            <span className="w-2 h-2 rounded-full bg-bullish" />
            <span>Real Bar-by-Bar Vectorized Quantitative Backtesting</span>
          </div>
          <div>
            Institutional Systematic Strategy Engineering · Multi-Asset Portfolio Allocation
          </div>
          <div>
            Apex Quant Research Workstation
          </div>
        </div>
      </footer>
    </div>
  );
};
