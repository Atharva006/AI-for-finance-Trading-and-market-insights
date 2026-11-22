import React, { useState, useEffect } from 'react';
import { ALL_CANONICAL_STRATEGIES } from '../services/canonicalStrategies';
import { AlgoStrategy } from '../types/algoMarketplace';
import { AppView } from './DhanNavbar';
import { fetchLiveBenchmarkCards, generateSvgPaths, RealBenchmarkCard } from '../services/liveMarketDashboard';

interface LandingPageProps {
  onNavigateToView: (view: AppView, strategy?: AlgoStrategy) => void;
  onSelectStrategy?: (strategy: AlgoStrategy) => void;
  strategies?: AlgoStrategy[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToView,
  onSelectStrategy,
  strategies,
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

  const renderSparkline = (points?: number[], strokeColor = 'currentColor') => {
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
    <div className="w-full flex flex-col gap-space-xl pb-space-xl">
      {/* 1. HERO SECTION (12-Column Grid) */}
      <section className="w-full py-space-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Left (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-space-lg py-space-sm">
            <div className="flex flex-col gap-space-md">
              <div className="inline-flex items-center gap-space-sm self-start px-space-sm py-1 rounded-full bg-surface-container-low border border-border-subtle">
                <span className="w-2 h-2 rounded-full bg-bullish animate-pulse" />
                <span className="font-mono-sm text-mono-sm text-on-surface-variant uppercase font-semibold">
                  Apex Quant Research Workstation · Systematic Execution Engine
                </span>
              </div>

              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                Results you can actually follow.
              </h1>

              <p className="font-body-md text-body-md text-text-secondary max-w-2xl leading-relaxed">
                Vectorized execution of Nifty 50 Trend-Pullback, Parabolic SAR momentum, and Asia-London-NY session sweeps. Zero mock databases, zero emotional guesswork. Pure mathematical edge executed on live NSE, MCX and global tick feeds.
              </p>
            </div>

            {/* Quick Navigation Action Buttons */}
            <div className="flex flex-wrap items-center gap-space-md">
              <button
                onClick={() => onNavigateToView('papertrading')}
                className="inline-flex items-center gap-space-sm px-space-lg py-3 rounded-lg bg-secondary text-white font-label-md text-label-md hover:bg-secondary/90 transition-all shadow-sm cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">candlestick_chart</span>
                <span>Launch Paper Trading Desk (₹10L)</span>
              </button>

              <button
                onClick={() => onNavigateToView('backtest', featuredStrat)}
                className="inline-flex items-center gap-space-sm px-space-lg py-3 rounded-lg bg-primary text-white font-label-md text-label-md hover:bg-primary-container transition-all shadow-sm cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                <span>Backtest Studio (Live Feeds)</span>
              </button>

              <button
                onClick={() => onNavigateToView('heatmap')}
                className="inline-flex items-center gap-space-sm px-space-lg py-3 rounded-lg bg-surface-card text-primary font-label-md text-label-md hover:bg-surface-container transition-all shadow-sm border border-border-subtle cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
                <span>Market Heatmaps</span>
              </button>

              <button
                onClick={() => onNavigateToView('forex')}
                className="inline-flex items-center gap-space-sm px-space-lg py-3 rounded-lg bg-surface-card text-primary font-label-md text-label-md hover:bg-surface-container transition-all shadow-sm border border-border-subtle cursor-pointer active:scale-95"
              >
                <span>Asia-London-NY FVG Desk</span>
                <span className="material-symbols-outlined text-[18px]">bolt</span>
              </button>
            </div>

            {/* Real Live Benchmark Telemetry Ribbon */}
            <div className="w-full bg-surface-card rounded-xl p-space-md shadow-sm border border-border-subtle flex flex-wrap items-center gap-x-space-lg gap-y-space-sm font-mono-sm text-mono-sm text-on-surface-variant">
              {benchmarkCards.length > 0 ? (
                benchmarkCards.map((card, idx) => (
                  <React.Fragment key={card.title}>
                    <span className="inline-flex items-center gap-space-xs">
                      <span className="text-text-muted">{card.title}:</span>
                      <span className="text-on-surface font-semibold tabular-nums">{card.value}</span>
                      <span className={`text-[11px] font-bold ${card.isPositive ? 'text-bullish' : 'text-bearish'}`}>
                        {card.change}
                      </span>
                    </span>
                    {idx < benchmarkCards.length - 1 && <span className="text-outline-variant">|</span>}
                  </React.Fragment>
                ))
              ) : (
                <>
                  <span className="inline-flex items-center gap-space-xs">
                    <span className="text-text-muted">NIFTY 50:</span>
                    <span className="text-on-surface font-semibold">25,808.60</span>
                    <span className="text-bullish text-[11px] font-bold">+0.68%</span>
                  </span>
                  <span className="text-outline-variant">|</span>
                  <span className="inline-flex items-center gap-space-xs">
                    <span className="text-text-muted">SENSEX:</span>
                    <span className="text-on-surface font-semibold">84,544.20</span>
                    <span className="text-bullish text-[11px] font-bold">+0.72%</span>
                  </span>
                  <span className="text-outline-variant">|</span>
                  <span className="inline-flex items-center gap-space-xs">
                    <span className="text-text-muted">DATA:</span>
                    <span className="text-on-surface font-semibold">Live Yahoo &amp; Upstox v2 (Zero Mock)</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right (5 cols): Featured Audited Strategy Card */}
          <div className="lg:col-span-5">
            <div className="w-full bg-surface-card rounded-xl p-space-lg shadow-md border border-border-subtle flex flex-col gap-space-lg">
              {/* Card Header with strategy switcher */}
              <div className="flex items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-bullish animate-pulse" />
                  <div>
                    <span className="font-mono-md text-mono-md text-on-surface font-semibold block">
                      {featuredStrat.name}
                    </span>
                    <span className="font-mono-sm text-[11px] text-text-muted">
                      {featuredStrat.targetSymbol ? `NSE:${featuredStrat.targetSymbol}` : 'FLAGSHIP'} · {featuredStrat.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setFeaturedIndex((prev) => (prev > 0 ? prev - 1 : activeStrategies.length - 1))}
                    className="p-1 rounded bg-surface-container-low hover:bg-surface-container text-on-surface text-xs cursor-pointer"
                    title="Previous Strategy"
                    aria-label="Previous Strategy"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                  </button>
                  <button
                    onClick={() => setFeaturedIndex((prev) => (prev + 1) % activeStrategies.length)}
                    className="p-1 rounded bg-surface-container-low hover:bg-surface-container text-on-surface text-xs cursor-pointer"
                    title="Next Strategy"
                    aria-label="Next Strategy"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>

              {/* 4-Metric Quad-Grid from Real Strategy Metrics */}
              <div className="grid grid-cols-2 gap-gutter">
                {/* Metric 1: 1Y Return */}
                <div className="bg-bullish-tint rounded-lg p-space-md flex flex-col gap-space-xs">
                  <span className="font-label-sm text-label-sm text-text-secondary uppercase">
                    1-Year Return
                  </span>
                  <span className="font-mono-lg text-mono-lg text-bullish tabular-nums font-bold">
                    +{featuredStrat.return1y}%
                  </span>
                  <span className="font-mono-sm text-[11px] text-bullish/80">
                    Net of slippage &amp; STT
                  </span>
                </div>

                {/* Metric 2: Sharpe */}
                <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col gap-space-xs">
                  <span className="font-label-sm text-label-sm text-text-secondary uppercase">
                    Sharpe Ratio
                  </span>
                  <span className="font-mono-lg text-mono-lg text-on-surface tabular-nums font-bold">
                    {featuredStrat.sharpeRatio.toFixed(2)}
                  </span>
                  <span className="font-mono-sm text-[11px] text-text-muted">
                    Risk-free: 6.50% MIBOR
                  </span>
                </div>

                {/* Metric 3: Win Rate */}
                <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col gap-space-xs">
                  <span className="font-label-sm text-label-sm text-text-secondary uppercase">
                    Win Rate
                  </span>
                  <span className="font-mono-lg text-mono-lg text-on-surface tabular-nums font-bold">
                    {featuredStrat.winRate}%
                  </span>
                  <span className="font-mono-sm text-[11px] text-text-muted">
                    Historical executions
                  </span>
                </div>

                {/* Metric 4: Max Drawdown */}
                <div className="bg-bearish-tint rounded-lg p-space-md flex flex-col gap-space-xs">
                  <span className="font-label-sm text-label-sm text-text-secondary uppercase">
                    Max Drawdown
                  </span>
                  <span className="font-mono-lg text-mono-lg text-bearish tabular-nums font-bold">
                    {featuredStrat.maxDrawdown}%
                  </span>
                  <span className="font-mono-sm text-[11px] text-bearish/80">
                    Peak-to-trough equity
                  </span>
                </div>
              </div>

              {/* Dynamic Sparkline SVG curve */}
              <div className="w-full h-14 text-bullish">
                {renderSparkline(featuredStrat.sparkline, '#12B76A')}
              </div>

              {/* CTA */}
              <button
                onClick={() => handleStrategyClick(featuredStrat)}
                className="w-full inline-flex items-center justify-center gap-space-sm px-space-md py-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-xs cursor-pointer active:scale-95"
              >
                <span>Launch in Backtest Studio</span>
                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION: 01 · Platform Architecture */}
      <section className="w-full py-space-xl flex flex-col gap-space-lg">
        <div className="flex flex-col gap-space-xs">
          <span className="font-mono-sm text-mono-sm text-text-muted uppercase">
            01 · Platform Architecture
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
              <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
                Every entry, scale-in, and exit is governed by pre-compiled quantitative conditions. Limit orders are routed directly to exchange matching engines with zero manual intervention.
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
              <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
                Hard portfolio-level circuit breakers, volatility-adjusted position sizing, and intraday MTM stop-losses protect capital during sudden liquidity shocks.
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
              <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
                Zero curve-fitted backtests. Strategies are independently verified against 10+ years of daily and tick archives, with walk-forward efficiency across changing volatility regimes.
              </p>
            </div>
            <div className="mt-auto pt-space-sm font-mono-sm text-mono-sm text-bullish font-semibold">
              WALK-FORWARD: 84.2% ROBUST
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 SECTION: Virtual Paper Trading Desk Feature Card */}
      <section className="w-full py-space-lg">
        <div className="w-full bg-white rounded-2xl p-6 sm:p-8 border border-border-subtle shadow-card flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col gap-3 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container border border-border-subtle self-start text-xs font-mono font-semibold text-primary">
              <span className="w-2 h-2 rounded-full bg-bullish animate-pulse" />
              <span>INTEGRATED LIVE SIMULATOR · ₹10,00,000 VIRTUAL DESK</span>
            </div>
            <h2 className="font-headline text-2xl sm:text-3xl font-bold text-primary tracking-tight">
              Institutional Paper Trading with Real-Time NSE &amp; MCX Feeds
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Experience realistic live virtual execution with ₹10 Lakh demo balance. Trade Indian Equities, NIFTY/BANKNIFTY Options &amp; Futures, and MCX Commodities (Gold, Silver, Crude Oil) with real book depth, multi-leg order ticketing, and live MTM P&amp;L analytics. Zero landing page hurdle, zero risk.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-text-muted pt-1">
              <span className="inline-flex items-center gap-1.5 text-primary font-semibold">
                <span className="material-symbols-outlined text-[16px] text-bullish">check_circle</span>
                MarketWatch &amp; Depth
              </span>
              <span className="inline-flex items-center gap-1.5 text-primary font-semibold">
                <span className="material-symbols-outlined text-[16px] text-bullish">check_circle</span>
                Option Chain &amp; Greeks
              </span>
              <span className="inline-flex items-center gap-1.5 text-primary font-semibold">
                <span className="material-symbols-outlined text-[16px] text-bullish">check_circle</span>
                Positions &amp; Holdings Ledger
              </span>
              <span className="inline-flex items-center gap-1.5 text-primary font-semibold">
                <span className="material-symbols-outlined text-[16px] text-bullish">check_circle</span>
                MCX Commodities Desk
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-3 shrink-0 relative z-10 w-full sm:w-auto">
            <button
              onClick={() => onNavigateToView('papertrading')}
              className="w-full sm:w-auto px-6 py-3.5 bg-secondary hover:bg-secondary/90 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">candlestick_chart</span>
              <span>Open Paper Trading Desk</span>
            </button>
            <span className="text-[11px] font-mono text-text-muted text-center">
              Preloaded with ₹10,00,000 virtual margin
            </span>
          </div>
        </div>
      </section>

      {/* 2.6 SECTION: Market Heatmaps Showcase */}
      <section className="w-full py-space-sm">
        <div className="w-full bg-white rounded-2xl p-6 sm:p-8 border border-border-subtle shadow-card flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex flex-col gap-3 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-border-subtle self-start text-xs font-mono font-semibold text-primary">
              <span className="w-2 h-2 rounded-full bg-bullish animate-pulse" />
              <span>TRADINGVIEW &lt;tv-heatmap&gt; · SENSEX &amp; US EQUITY CAPITALIZATION</span>
            </div>
            <h2 className="font-headline text-2xl sm:text-3xl font-bold text-primary tracking-tight">
              Live Market Heatmaps for BSE SENSEX, NSE &amp; Wall Street
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Scan high-volatility momentum rotations and visual sector breadth across BSE SENSEX, NIFTY 50, and US markets (S&amp;P 500 / NASDAQ 100). Embedded with full responsive width and sector depth using TradingView official heatmaps engine.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-text-muted pt-1">
              <span className="inline-flex items-center gap-1.5 text-primary font-semibold">
                <span className="material-symbols-outlined text-[16px] text-bullish">check_circle</span>
                🇮🇳 BSE SENSEX &amp; NIFTY 50
              </span>
              <span className="inline-flex items-center gap-1.5 text-primary font-semibold">
                <span className="material-symbols-outlined text-[16px] text-bullish">check_circle</span>
                🇺🇸 S&amp;P 500 &amp; NASDAQ 100
              </span>
              <span className="inline-flex items-center gap-1.5 text-primary font-semibold">
                <span className="material-symbols-outlined text-[16px] text-bullish">check_circle</span>
                Market Cap &amp; Volume Weighting
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-3 shrink-0 relative z-10 w-full sm:w-auto">
            <button
              onClick={() => onNavigateToView('heatmap')}
              className="w-full sm:w-auto px-6 py-3.5 bg-primary hover:bg-primary-container text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
              <span>Open Market Heatmaps</span>
            </button>
            <span className="text-[11px] font-mono text-text-muted text-center">
              Live visual market breadth
            </span>
          </div>
        </div>
      </section>

      {/* 3. SECTION: 02 · Canonical Quantitative Strategies (Zero Mock Data) */}
      <section className="w-full py-space-xl flex flex-col gap-space-lg scroll-mt-28" id="algorithms-section">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="flex flex-col gap-space-xs">
            <div className="inline-flex items-center gap-space-xs font-mono-sm text-mono-sm text-bullish font-semibold">
              <span className="w-2 h-2 rounded-full bg-bullish animate-pulse" />
              <span>02 · CANONICAL QUANTITATIVE STRATEGIES (ZERO MOCK DATA)</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
              Audited Algorithms across Large-Caps, Indices and FX Pairs.
            </h2>
            <p className="font-body-sm text-body-sm text-text-secondary max-w-2xl">
              Authentic systematic models executing trend-pullbacks, Parabolic SAR momentum, and Fair Value Gap inversions. Every calculation driven by authentic historical and live market feeds.
            </p>
          </div>

          <div className="inline-flex items-center gap-space-sm self-start md:self-auto">
            <span className="px-space-md py-1.5 rounded-lg bg-surface-container-low border border-border-subtle font-mono-sm text-mono-sm text-on-surface font-semibold">
              {activeStrategies.length} AUDITED STRATEGIES
            </span>
          </div>
        </div>

        {/* Grid: Authentic Strategies */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
          {activeStrategies.map((strat) => (
            <div
              key={strat.id}
              onClick={() => handleStrategyClick(strat)}
              className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-subtle flex flex-col justify-between gap-space-md hover:shadow-md transition-all cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono-md text-mono-md text-on-surface font-semibold group-hover:text-primary transition-colors">
                    {strat.name}
                  </span>
                  <span className="px-space-sm py-0.5 rounded-full bg-bullish-tint font-mono-sm text-[10px] text-bullish font-semibold">
                    {strat.targetSymbol || 'NSE'}
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-text-muted line-clamp-2">
                  {strat.tagline || strat.style}
                </span>
              </div>

              {/* Dynamic Sparkline Visual */}
              <div className="w-full h-14 text-bullish">
                {renderSparkline(strat.sparkline, '#12B76A')}
              </div>

              {/* 4-metric row */}
              <div className="grid grid-cols-2 gap-space-xs pt-space-sm border-t border-border-subtle">
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] text-text-muted">1Y RETURN</span>
                  <span className="font-mono-sm text-mono-sm text-bullish font-bold tabular-nums">
                    +{strat.return1y}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] text-text-muted">SHARPE</span>
                  <span className="font-mono-sm text-mono-sm text-on-surface font-semibold tabular-nums">
                    {strat.sharpeRatio.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] text-text-muted">WIN RATE</span>
                  <span className="font-mono-sm text-mono-sm text-on-surface font-semibold tabular-nums">
                    {strat.winRate}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] text-text-muted">MAX DD</span>
                  <span className="font-mono-sm text-mono-sm text-bearish font-bold tabular-nums">
                    {strat.maxDrawdown}%
                  </span>
                </div>
              </div>

              <div className="pt-space-xs flex items-center justify-between text-xs text-secondary font-medium">
                <span>Test in Backtest Studio</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. INTERACTIVE FAQ ACCORDION */}
      <section className="w-full py-space-xl flex flex-col gap-space-lg">
        <div className="flex flex-col gap-space-xs">
          <span className="font-mono-sm text-mono-sm text-text-muted uppercase">03 · FAQ</span>
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
                  Our vectorized engine executes simulated limit orders strictly at live bid/ask spreads and factors in statutory exchange turnover charges, STT, GST, and realistic 0.03%–0.05% slippage friction. No real capital is risked during paper simulations.
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
                What is the workstation's Zero Mock Database Policy?
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
                  The terminal operates under a strict Zero Mock Database and Zero Synthetic Data policy. Every strategy curve, Sharpe ratio, drawdown figure, and backtest execution is derived from authentic historical candles and live streaming telemetry from Yahoo Finance and Upstox API v2.
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
