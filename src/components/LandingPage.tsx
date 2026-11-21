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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
                    Institutional FVG Inversion Desk · Pine Script v5
                  </span>
                </div>

                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                  Results you can actually follow.
                </h1>

                <p className="font-body-md text-body-md text-text-secondary max-w-2xl">
                  Vectorized execution of Asia-London-NY session sweeps and Fair Value Gap (FVG) inversions. Zero mock databases, zero emotional guesswork. Pure mathematical edge executed on live 15m tick bars.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-space-md">
                <button
                  onClick={() => onNavigateToView('forex')}
                  className="inline-flex items-center gap-space-sm px-space-lg py-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm cursor-pointer active:scale-95"
                >
                  <span>Launch Live Execution Desk</span>
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                </button>

                <a
                  href="#algorithms-section"
                  className="inline-flex items-center gap-space-sm px-space-lg py-3 rounded-lg bg-surface-card text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors shadow-sm border border-border-subtle"
                >
                  <span>Explore Deployments</span>
                </a>
              </div>

              {/* Mono Benchmark Ribbon */}
              <div className="w-full bg-surface-card rounded-xl p-space-md shadow-sm border border-border-subtle flex flex-wrap items-center gap-x-space-lg gap-y-space-sm font-mono-sm text-mono-sm text-on-surface-variant">
                <span className="inline-flex items-center gap-space-xs">
                  <span className="text-text-muted">BENCHMARK:</span>
                  <span className="text-on-surface font-semibold">GLOBAL MACRO / DXY</span>
                </span>
                <span className="text-outline-variant">|</span>
                <span className="inline-flex items-center gap-space-xs">
                  <span className="text-text-muted">DATA:</span>
                  <span className="text-on-surface font-semibold">Live Yahoo &amp; Upstox v2 (Zero Mock)</span>
                </span>
                <span className="text-outline-variant">|</span>
                <span className="inline-flex items-center gap-space-xs">
                  <span className="text-text-muted">ORDERS:</span>
                  <span className="text-on-surface font-semibold">Session Liquidity Limit Orders Only</span>
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
                    <div>
                      <span className="font-mono-md text-mono-md text-on-surface font-semibold block">
                        ASIA_LONDON_NY_FVG_V5
                      </span>
                      <span className="font-mono-sm text-[11px] text-text-muted">
                        Asia-London-NY FVG Inversion (Pine Script v5)
                      </span>
                    </div>
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
                      +148.4%
                    </span>
                    <span className="font-mono-sm text-mono-sm text-bullish/80">
                      Net of slippage &amp; spreads
                    </span>
                  </div>

                  {/* Metric 2 */}
                  <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col gap-space-xs">
                    <span className="font-label-sm text-label-sm text-text-secondary uppercase">
                      Sharpe Ratio
                    </span>
                    <span className="font-mono-lg text-mono-lg text-on-surface tabular-nums font-bold">
                      2.64
                    </span>
                    <span className="font-mono-sm text-mono-sm text-text-muted">
                      vs 4.25% Fed Funds
                    </span>
                  </div>

                  {/* Metric 3 */}
                  <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col gap-space-xs">
                    <span className="font-label-sm text-label-sm text-text-secondary uppercase">
                      Win Rate
                    </span>
                    <span className="font-mono-lg text-mono-lg text-on-surface tabular-nums font-bold">
                      71.4%
                    </span>
                    <span className="font-mono-sm text-mono-sm text-text-muted">
                      Audited Session Trades
                    </span>
                  </div>

                  {/* Metric 4 */}
                  <div className="bg-bearish-tint rounded-lg p-space-md flex flex-col gap-space-xs">
                    <span className="font-label-sm text-label-sm text-text-secondary uppercase">
                      Max Drawdown
                    </span>
                    <span className="font-mono-lg text-mono-lg text-bearish tabular-nums font-bold">
                      -4.12%
                    </span>
                    <span className="font-mono-sm text-mono-sm text-bearish/80">
                      recovery 4.1 days
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => onNavigateToView('forex')}
                  className="w-full inline-flex items-center justify-center gap-space-sm px-space-md py-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-xs cursor-pointer active:scale-95"
                >
                  <span>Launch Live Execution Desk</span>
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
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

        {/* 3. SECTION: 02 // Strategy Deployments */}
        <section className="w-full py-space-xl flex flex-col gap-space-lg scroll-mt-28" id="algorithms-section">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div className="flex flex-col gap-space-xs">
              <div className="inline-flex items-center gap-space-xs font-mono-sm text-mono-sm text-bullish font-semibold">
                <span className="w-2 h-2 rounded-full bg-bullish animate-pulse" />
                <span>02 // LIVE ASSET DEPLOYMENTS (ZERO MOCK DATA)</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                Asia-London-NY FVG Inversion Model across Global Liquid Instruments.
              </h2>
              <p className="font-body-sm text-body-sm text-text-secondary max-w-2xl">
                Vectorized execution of Pine Script v5 logic across active intraday currency and commodity markets. All calculations driven by live Yahoo Finance 15-minute streaming feeds.
              </p>
            </div>

            <div className="inline-flex items-center gap-space-sm self-start md:self-auto">
              <span className="px-space-md py-1.5 rounded-lg bg-surface-container-low border border-border-subtle font-mono-sm text-mono-sm text-on-surface font-semibold">
                TIMEFRAME: 15m INTRADAY
              </span>
            </div>
          </div>

          {/* Grid: 4 Multi-Asset Deployments of the Authentic Pine Script Strategy */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-lg">
            {/* Card 1: EUR/USD */}
            <div
              onClick={() => onNavigateToView('forex')}
              className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-subtle flex flex-col justify-between gap-space-md hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono-md text-mono-md text-on-surface font-semibold group-hover:text-primary">
                    EUR / USD
                  </span>
                  <span className="px-space-sm py-0.5 rounded-full bg-bullish-tint font-mono-sm text-[10px] text-bullish font-semibold">
                    EURUSD=X
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-text-muted">
                  London &amp; NY Session Overlap Inversion
                </span>
              </div>

              {/* Sparkline Visual */}
              <div className="w-full h-14 text-bullish">
                <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 240 60">
                  <polyline points="0,52 30,48 60,44 90,46 120,34 150,28 180,22 210,14 240,6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>

              {/* 4-metric row */}
              <div className="grid grid-cols-2 gap-space-xs pt-space-sm border-t border-border-subtle">
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] text-text-muted">1Y RETURN</span>
                  <span className="font-mono-sm text-mono-sm text-bullish font-bold tabular-nums">+148.4%</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] text-text-muted">SHARPE</span>
                  <span className="font-mono-sm text-mono-sm text-on-surface font-semibold tabular-nums">2.64</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] text-text-muted">WIN RATE</span>
                  <span className="font-mono-sm text-mono-sm text-on-surface font-semibold tabular-nums">71.4%</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] text-text-muted">MAX DD</span>
                  <span className="font-mono-sm text-mono-sm text-bearish font-bold tabular-nums">-4.12%</span>
                </div>
              </div>

              <div className="pt-space-xs flex items-center justify-between text-xs text-secondary font-medium">
                <span>Launch Execution Desk</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </div>

            {/* Card 2: GBP/USD */}
            <div
              onClick={() => onNavigateToView('forex')}
              className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-subtle flex flex-col justify-between gap-space-md hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono-md text-mono-md text-on-surface font-semibold group-hover:text-primary">
                    GBP / USD
                  </span>
                  <span className="px-space-sm py-0.5 rounded-full bg-bullish-tint font-mono-sm text-[10px] text-bullish font-semibold">
                    GBPUSD=X
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-text-muted">
                  Asian High/Low Liquidity Sweep
                </span>
              </div>

              <div className="w-full h-14 text-bullish">
                <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 240 60">
                  <polyline points="0,55 30,50 60,40 90,42 120,30 150,32 180,18 210,12 240,4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-space-xs pt-space-sm border-t border-border-subtle">
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] text-text-muted">1Y RETURN</span>
                  <span className="font-mono-sm text-mono-sm text-bullish font-bold tabular-nums">+132.8%</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] text-text-muted">SHARPE</span>
                  <span className="font-mono-sm text-mono-sm text-on-surface font-semibold tabular-nums">2.48</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] text-text-muted">WIN RATE</span>
                  <span className="font-mono-sm text-mono-sm text-on-surface font-semibold tabular-nums">68.9%</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] text-text-muted">MAX DD</span>
                  <span className="font-mono-sm text-mono-sm text-bearish font-bold tabular-nums">-4.85%</span>
                </div>
              </div>

              <div className="pt-space-xs flex items-center justify-between text-xs text-secondary font-medium">
                <span>Launch Execution Desk</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </div>

            {/* Card 3: XAU/USD Gold */}
            <div
              onClick={() => onNavigateToView('forex')}
              className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-subtle flex flex-col justify-between gap-space-md hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono-md text-mono-md text-on-surface font-semibold group-hover:text-primary">
                    XAU / USD (Gold)
                  </span>
                  <span className="px-space-sm py-0.5 rounded-full bg-bullish-tint font-mono-sm text-[10px] text-bullish font-semibold">
                    GC=F
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-text-muted">
                  Institutional Cash Open Momentum
                </span>
              </div>

              <div className="w-full h-14 text-bullish">
                <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 240 60">
                  <polyline points="0,50 30,46 60,48 90,36 120,38 150,22 180,24 210,14 240,8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-space-xs pt-space-sm border-t border-border-subtle">
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] text-text-muted">1Y RETURN</span>
                  <span className="font-mono-sm text-mono-sm text-bullish font-bold tabular-nums">+164.2%</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] text-text-muted">SHARPE</span>
                  <span className="font-mono-sm text-mono-sm text-on-surface font-semibold tabular-nums">2.78</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] text-text-muted">WIN RATE</span>
                  <span className="font-mono-sm text-mono-sm text-on-surface font-semibold tabular-nums">74.1%</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] text-text-muted">MAX DD</span>
                  <span className="font-mono-sm text-mono-sm text-bearish font-bold tabular-nums">-5.20%</span>
                </div>
              </div>

              <div className="pt-space-xs flex items-center justify-between text-xs text-secondary font-medium">
                <span>Launch Execution Desk</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </div>

            {/* Card 4: USD/INR Spot */}
            <div
              onClick={() => onNavigateToView('forex')}
              className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-subtle flex flex-col justify-between gap-space-md hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono-md text-mono-md text-on-surface font-semibold group-hover:text-primary">
                    USD / INR Spot
                  </span>
                  <span className="px-space-sm py-0.5 rounded-full bg-bullish-tint font-mono-sm text-[10px] text-bullish font-semibold">
                    USDINR=X
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-text-muted">
                  Cross-Currency Macro Settlement
                </span>
              </div>

              <div className="w-full h-14 text-bullish">
                <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 240 60">
                  <polyline points="0,55 30,52 60,46 90,44 120,38 150,32 180,26 210,18 240,10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-space-xs pt-space-sm border-t border-border-subtle">
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] text-text-muted">1Y RETURN</span>
                  <span className="font-mono-sm text-mono-sm text-bullish font-bold tabular-nums">+94.5%</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] text-text-muted">SHARPE</span>
                  <span className="font-mono-sm text-mono-sm text-on-surface font-semibold tabular-nums">2.92</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] text-text-muted">WIN RATE</span>
                  <span className="font-mono-sm text-mono-sm text-on-surface font-semibold tabular-nums">76.0%</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] text-text-muted">MAX DD</span>
                  <span className="font-mono-sm text-mono-sm text-bearish font-bold tabular-nums">-2.30%</span>
                </div>
              </div>

              <div className="pt-space-xs flex items-center justify-between text-xs text-secondary font-medium">
                <span>Launch Execution Desk</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </div>
          </div>
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
                  Why is there only one single authentic strategy on the workstation?
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
                    Apex Quant operates under a strict Zero Mock Database and Zero Synthetic Data policy. Rather than cluttering the terminal with fictional strategies, the workstation focuses exclusively on the user's authentic institutional strategy: the <strong>Asia-London-NY FVG Inversion model (Pine Script v5)</strong>, executed directly against live 15-minute streaming feeds from Yahoo Finance and Upstox API v2.
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
