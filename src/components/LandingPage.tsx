import React, { useState } from 'react';
import { ALL_CANONICAL_STRATEGIES } from '../services/canonicalStrategies';
import { AlgoStrategy } from '../types/algoMarketplace';

interface LandingPageProps {
  onNavigateToView: (view: 'marketplace' | 'backtest' | 'flow' | 'detail' | 'admin' | 'insights' | 'auth' | 'forex') => void;
  onSelectStrategy?: (strategyId: string) => void;
  customStrategies?: AlgoStrategy[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToView,
  onSelectStrategy,
  customStrategies,
}) => {
  const [algoTab, setAlgoTab] = useState<'trading' | 'wealth'>('trading');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const activeRoster = customStrategies ?? ALL_CANONICAL_STRATEGIES;
  const tradingAlgos = activeRoster.filter((s) => !s.isInvestmentAlgo);
  const wealthAlgos = activeRoster.filter((s) => s.isInvestmentAlgo);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="w-full flex flex-col gap-space-xl pb-space-xl">
      {/* 1. HERO SECTION (12-Column Grid) */}
        <section className="w-full py-space-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            {/* Left (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-space-lg py-space-sm">
              <div className="flex flex-col gap-space-md">
                <div className="inline-flex items-center gap-space-sm self-start px-space-sm py-1 rounded-full bg-surface-container-low">
                  <span className="w-2 h-2 rounded-full bg-bullish animate-pulse" />
                  <span className="font-mono-sm text-mono-sm text-on-surface-variant uppercase">
                    NSE &amp; NFO Systematic Desk
                  </span>
                </div>

                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                  Results you can actually follow.
                </h1>

                <p className="font-body-md text-body-md text-text-secondary max-w-2xl">
                  Performance analytics and systematic algorithm baskets for NSE equities and options. Zero emotional guesswork. Pure mathematical edge verified across historical market regimes.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-space-md">
                <button
                  onClick={() => onNavigateToView('marketplace')}
                  className="inline-flex items-center gap-space-sm px-space-lg py-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm cursor-pointer active:scale-95"
                >
                  <span>Open Dashboard</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>

                <a
                  href="#algorithms-section"
                  className="inline-flex items-center gap-space-sm px-space-lg py-3 rounded-lg bg-surface-card text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors shadow-sm border border-border-subtle"
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

            {/* Right (5 cols): Featured Audited Card */}
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

                {/* CTA */}
                <button
                  onClick={() => onNavigateToView('backtest')}
                  className="w-full inline-flex items-center justify-center gap-space-sm px-space-md py-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-xs cursor-pointer active:scale-95"
                >
                  <span>View in Strategy Studio</span>
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. SECTION: 01 // Platform Architecture */}
        <section className="w-full py-space-xl flex flex-col gap-space-lg">
          <div className="flex flex-col gap-space-xs">
            <span className="font-mono-sm text-mono-sm text-text-muted uppercase">
              01 // Platform Architecture
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
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
                <p className="font-body-sm text-body-sm text-text-secondary">
                  Every entry, scale-in, and exit is governed by pre-compiled quantitative conditions. Limit orders are routed directly to NSE matching engines with zero manual intervention.
                </p>
              </div>
              <div className="mt-auto pt-space-sm font-mono-sm text-mono-sm text-text-muted">
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
                <p className="font-body-sm text-body-sm text-text-secondary">
                  Hard portfolio-level circuit breakers, volatility-adjusted position sizing, and intraday MTM stop-losses protect capital during black-swan liquidity shocks.
                </p>
              </div>
              <div className="mt-auto pt-space-sm font-mono-sm text-mono-sm text-bearish font-semibold">
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
                <p className="font-body-sm text-body-sm text-text-secondary">
                  No curve-fitted backtests. Strategies are independently verified against 7+ years of tick archives, with walk-forward efficiency &gt; 80% across changing volatility regimes.
                </p>
              </div>
              <div className="mt-auto pt-space-sm font-mono-sm text-mono-sm text-bullish font-semibold">
                WALK-FORWARD: 84.2% ROBUST
              </div>
            </div>
          </div>
        </section>

        {/* 3. SECTION: 02 // Algorithms & Baskets */}
        <section className="w-full py-space-xl flex flex-col gap-space-lg" id="algorithms-section">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div className="flex flex-col gap-space-xs">
              <span className="font-mono-sm text-mono-sm text-text-muted uppercase">
                02 // Algorithms &amp; Baskets
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
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
              >
                Investment &amp; Wealth Algos Below ₹1.1L
              </button>
            </div>
          </div>

          {/* Grid 1: Trading Algorithms */}
          {algoTab === 'trading' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
              {/* Card 1: NIFTY_ALPHA_V4 */}
              <div
                onClick={() => onNavigateToView('marketplace')}
                className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-subtle flex flex-col gap-space-md hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono-md text-mono-md text-on-surface font-semibold group-hover:text-primary">
                    NIFTY_ALPHA_V4
                  </span>
                  <span className="px-space-sm py-0.5 rounded-full bg-surface-container-low font-mono-sm text-mono-sm text-on-surface-variant font-medium">
                    NIFTY 50
                  </span>
                </div>
                {/* Sparkline */}
                <div className="w-full h-16 text-bullish">
                  <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 240 60">
                    <polyline points="0,52 30,48 60,44 90,46 120,34 150,28 180,22 210,14 240,6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
                {/* 4-metric row */}
                <div className="grid grid-cols-4 gap-space-xs pt-space-sm border-t border-border-subtle">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-muted">CAGR</span>
                    <span className="font-mono-sm text-mono-sm text-bullish font-bold tabular-nums">+114.6%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-muted">SHARPE</span>
                    <span className="font-mono-sm text-mono-sm text-on-surface font-semibold tabular-nums">2.84</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-muted">WIN%</span>
                    <span className="font-mono-sm text-mono-sm text-on-surface font-semibold tabular-nums">72.5%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-muted">MAX DD</span>
                    <span className="font-mono-sm text-mono-sm text-bearish font-bold tabular-nums">-3.40%</span>
                  </div>
                </div>
              </div>

              {/* Card 2: BANKNIFTY_MOMENTUM_V2 */}
              <div
                onClick={() => onNavigateToView('marketplace')}
                className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-subtle flex flex-col gap-space-md hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono-md text-mono-md text-on-surface font-semibold group-hover:text-primary">
                    BANKNIFTY_MOMENTUM_V2
                  </span>
                  <span className="px-space-sm py-0.5 rounded-full bg-surface-container-low font-mono-sm text-mono-sm text-on-surface-variant font-medium">
                    BANKNIFTY
                  </span>
                </div>
                <div className="w-full h-16 text-bullish">
                  <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 240 60">
                    <polyline points="0,55 30,50 60,40 90,42 120,30 150,32 180,18 210,12 240,4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
                <div className="grid grid-cols-4 gap-space-xs pt-space-sm border-t border-border-subtle">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-muted">CAGR</span>
                    <span className="font-mono-sm text-mono-sm text-bullish font-bold tabular-nums">+88.4%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-muted">SHARPE</span>
                    <span className="font-mono-sm text-mono-sm text-on-surface font-semibold tabular-nums">2.41</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-muted">WIN%</span>
                    <span className="font-mono-sm text-mono-sm text-on-surface font-semibold tabular-nums">68.2%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-muted">MAX DD</span>
                    <span className="font-mono-sm text-mono-sm text-bearish font-bold tabular-nums">-4.10%</span>
                  </div>
                </div>
              </div>

              {/* Card 3: IT_SECTOR_SWING */}
              <div
                onClick={() => onNavigateToView('marketplace')}
                className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-subtle flex flex-col gap-space-md hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono-md text-mono-md text-on-surface font-semibold group-hover:text-primary">
                    IT_SECTOR_SWING
                  </span>
                  <span className="px-space-sm py-0.5 rounded-full bg-surface-container-low font-mono-sm text-mono-sm text-on-surface-variant font-medium">
                    NIFTY IT
                  </span>
                </div>
                <div className="w-full h-16 text-bullish">
                  <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 240 60">
                    <polyline points="0,50 30,46 60,48 90,36 120,38 150,22 180,24 210,14 240,8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
                <div className="grid grid-cols-4 gap-space-xs pt-space-sm border-t border-border-subtle">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-muted">CAGR</span>
                    <span className="font-mono-sm text-mono-sm text-bullish font-bold tabular-nums">+64.2%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-muted">SHARPE</span>
                    <span className="font-mono-sm text-mono-sm text-on-surface font-semibold tabular-nums">2.18</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-muted">WIN%</span>
                    <span className="font-mono-sm text-mono-sm text-on-surface font-semibold tabular-nums">64.5%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-muted">MAX DD</span>
                    <span className="font-mono-sm text-mono-sm text-bearish font-bold tabular-nums">-3.85%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid 2: Wealth Algos */}
          {algoTab === 'wealth' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
              {/* Wealth Card 1 */}
              <div
                onClick={() => onNavigateToView('marketplace')}
                className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-subtle flex flex-col gap-space-md hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono-md text-mono-md text-on-surface font-semibold">SOVEREIGN_ACCUMULATOR</span>
                  <span className="px-space-sm py-0.5 rounded-full bg-bullish-tint font-mono-sm text-mono-sm text-bullish font-semibold">CAP ₹25,000</span>
                </div>
                <div className="w-full h-16 text-bullish">
                  <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 240 60">
                    <polyline points="0,55 30,52 60,46 90,44 120,38 150,32 180,26 210,18 240,10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
                <div className="grid grid-cols-4 gap-space-xs pt-space-sm border-t border-border-subtle">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-muted">CAGR</span>
                    <span className="font-mono-sm text-mono-sm text-bullish font-bold tabular-nums">+34.8%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-muted">SHARPE</span>
                    <span className="font-mono-sm text-mono-sm text-on-surface font-semibold tabular-nums">3.12</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-muted">WIN%</span>
                    <span className="font-mono-sm text-mono-sm text-on-surface font-semibold tabular-nums">81.0%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-muted">MAX DD</span>
                    <span className="font-mono-sm text-mono-sm text-bearish font-bold tabular-nums">-1.20%</span>
                  </div>
                </div>
              </div>

              {/* Wealth Card 2 */}
              <div
                onClick={() => onNavigateToView('marketplace')}
                className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-subtle flex flex-col gap-space-md hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono-md text-mono-md text-on-surface font-semibold">DIVIDEND_COMPOUNDER_L1</span>
                  <span className="px-space-sm py-0.5 rounded-full bg-bullish-tint font-mono-sm text-mono-sm text-bullish font-semibold">CAP ₹50,000</span>
                </div>
                <div className="w-full h-16 text-bullish">
                  <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 240 60">
                    <polyline points="0,54 30,50 60,48 90,40 120,34 150,30 180,22 210,16 240,8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
                <div className="grid grid-cols-4 gap-space-xs pt-space-sm border-t border-border-subtle">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-muted">CAGR</span>
                    <span className="font-mono-sm text-mono-sm text-bullish font-bold tabular-nums">+42.1%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-muted">SHARPE</span>
                    <span className="font-mono-sm text-mono-sm text-on-surface font-semibold tabular-nums">2.95</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-muted">WIN%</span>
                    <span className="font-mono-sm text-mono-sm text-on-surface font-semibold tabular-nums">76.4%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-muted">MAX DD</span>
                    <span className="font-mono-sm text-mono-sm text-bearish font-bold tabular-nums">-2.10%</span>
                  </div>
                </div>
              </div>

              {/* Wealth Card 3 */}
              <div
                onClick={() => onNavigateToView('marketplace')}
                className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-subtle flex flex-col gap-space-md hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono-md text-mono-md text-on-surface font-semibold">BLUECHIP_LOW_VOL_BASKET</span>
                  <span className="px-space-sm py-0.5 rounded-full bg-bullish-tint font-mono-sm text-mono-sm text-bullish font-semibold">CAP ₹1,00,000</span>
                </div>
                <div className="w-full h-16 text-bullish">
                  <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 240 60">
                    <polyline points="0,52 30,48 60,42 90,44 120,32 150,28 180,20 210,12 240,6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
                <div className="grid grid-cols-4 gap-space-xs pt-space-sm border-t border-border-subtle">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-muted">CAGR</span>
                    <span className="font-mono-sm text-mono-sm text-bullish font-bold tabular-nums">+48.9%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-muted">SHARPE</span>
                    <span className="font-mono-sm text-mono-sm text-on-surface font-semibold tabular-nums">3.05</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-muted">WIN%</span>
                    <span className="font-mono-sm text-mono-sm text-on-surface font-semibold tabular-nums">78.0%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-muted">MAX DD</span>
                    <span className="font-mono-sm text-mono-sm text-bearish font-bold tabular-nums">-1.80%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 4. INTERACTIVE FAQ ACCORDION */}
        <section className="w-full py-space-xl flex flex-col gap-space-lg">
          <div className="flex flex-col gap-space-xs">
            <span className="font-mono-sm text-mono-sm text-text-muted uppercase">03 // FAQ</span>
            <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Frequently asked questions.</h2>
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
                  How does paper trading execution compare to live brokerage matching?
                </span>
                <span
                  className="material-symbols-outlined text-on-surface-variant transition-transform duration-200"
                  style={{ transform: openFaq === 1 ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  expand_more
                </span>
              </button>
              {openFaq === 1 && (
                <div className="px-space-lg pb-space-md">
                  <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
                    Our vectorized engine executes simulated limit orders strictly at the bid/ask spread and factors in statutory exchange turnover charges, STT, GST, and realistic 0.03%–0.05% slippage friction. No real money is risked.
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
                  What is the difference between Trading Algorithms and Wealth Baskets?
                </span>
                <span
                  className="material-symbols-outlined text-on-surface-variant transition-transform duration-200"
                  style={{ transform: openFaq === 2 ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  expand_more
                </span>
              </button>
              {openFaq === 2 && (
                <div className="px-space-lg pb-space-md">
                  <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
                    Trading Algorithms are active intraday and swing momentum systems (5M ORB, PSAR Flip, Stochastic) designed for active alpha capture. Wealth Baskets are low-turnover, multi-asset allocation models (capital below ₹1.1L) that systematically compound sovereign G-Secs and low-volatility bluechips on price pullbacks.
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
                  Are statutory taxes, stamp duty, and exchange fees accounted for?
                </span>
                <span
                  className="material-symbols-outlined text-on-surface-variant transition-transform duration-200"
                  style={{ transform: openFaq === 3 ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  expand_more
                </span>
              </button>
              {openFaq === 3 && (
                <div className="px-space-lg pb-space-md">
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
                <div className="px-space-lg pb-space-md">
                  <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
                    Each strategy enforces a hard intraday MTM circuit breaker and dynamic ATR-based position sizing. When India VIX spikes above regime thresholds, exposure is automatically scaled down or flattened to cash.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 5. SEBI STATUTORY DISCLAIMER */}
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
  );
};
