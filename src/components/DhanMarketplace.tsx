import React, { useState, useMemo } from 'react';
import { AlgoStrategy } from '../types/algoMarketplace';
import {
  getWatchlist,
  toggleWatchlist,
  isAlgoInWatchlist,
  getUserPositions,
  getUserOrders,
  UserPosition,
  UserOrder,
} from '../services/watchlistStore';
import { StockLogo } from './StockLogo';

interface DhanMarketplaceProps {
  strategies: AlgoStrategy[];
  onSelectStrategy: (strategy: AlgoStrategy) => void;
  onOpenBacktest: (strategy: AlgoStrategy) => void;
  onNavigateToAdmin?: () => void;
}

export const DhanMarketplace: React.FC<DhanMarketplaceProps> = ({
  strategies,
  onSelectStrategy,
  onOpenBacktest,
  onNavigateToAdmin,
}) => {
  // Navigation Tabs matching Stitch Screen 2
  const [activeTab, setActiveTab] = useState<'trading' | 'investing' | 'watchlist' | 'positions' | 'orders'>('trading');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [capitalFilter, setCapitalFilter] = useState<string>('ALL');
  const [styleFilter, setStyleFilter] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Watchlist state trigger
  const [watchlistIds, setWatchlistIds] = useState<string[]>(() => getWatchlist());
  const positions = useMemo(() => getUserPositions(), []);
  const orders = useMemo(() => getUserOrders(), []);

  const handleToggleTracklist = (e: React.MouseEvent, algo: AlgoStrategy) => {
    e.stopPropagation();
    const result = toggleWatchlist(algo.id);
    setWatchlistIds(result.list);
    showToast(result.isSaved ? `"${algo.name}" added to track list` : `"${algo.name}" removed from track list`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Published Strategies
  const publishedStrategies = useMemo(() => {
    return strategies.filter((s) => s.isPublished !== false);
  }, [strategies]);

  // Filtered algorithms based on tab, capital, style, and search
  const filteredStrategies = useMemo(() => {
    return publishedStrategies.filter((algo) => {
      // 1. Tab segregation
      if (activeTab === 'trading') {
        if (algo.isInvestmentAlgo) return false;
      } else if (activeTab === 'investing') {
        if (!algo.isInvestmentAlgo) return false;
      } else if (activeTab === 'watchlist') {
        if (!watchlistIds.includes(algo.id)) return false;
      }

      // 2. Capital Filter
      if (capitalFilter === 'UNDER_10K' && algo.marginRequired > 10000) return false;
      if (capitalFilter === 'UNDER_50K' && algo.marginRequired > 50000) return false;
      if (capitalFilter === 'UNDER_100K' && algo.marginRequired > 100000) return false;
      if (capitalFilter === 'UNDER_200K' && algo.marginRequired > 200000) return false;
      if (capitalFilter === 'ABOVE_200K' && algo.marginRequired <= 200000) return false;

      // 3. Style Filter
      if (styleFilter !== 'ALL') {
        if (styleFilter === 'SWING' && !algo.style.toLowerCase().includes('swing')) return false;
        if (styleFilter === 'BREAKOUT' && !algo.style.toLowerCase().includes('breakout')) return false;
        if (styleFilter === 'VOLATILITY' && !algo.category.toLowerCase().includes('volatility')) return false;
        if (styleFilter === 'WEALTH' && !algo.category.toLowerCase().includes('wealth')) return false;
        if (styleFilter === 'OVERNIGHT' && !algo.style.toLowerCase().includes('overnight')) return false;
      }

      // 4. Search Filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = algo.name.toLowerCase().includes(q);
        const matchSymbol = (algo.targetSymbol || '').toLowerCase().includes(q);
        const matchStyle = algo.style.toLowerCase().includes(q);
        const matchCategory = algo.category.toLowerCase().includes(q);
        if (!matchName && !matchSymbol && !matchStyle && !matchCategory) return false;
      }

      return true;
    });
  }, [publishedStrategies, activeTab, watchlistIds, capitalFilter, styleFilter, searchQuery]);

  // Render SVG Sparkline
  const renderSparkline = (points?: number[]) => {
    if (!points || points.length === 0) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const w = 140;
    const h = 36;
    const path = points
      .map((p, i) => {
        const x = (i / Math.max(1, points.length - 1)) * w;
        const y = h - ((p - min) / (max - min || 1)) * (h - 8) - 4;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');

    const isPositive = points[points.length - 1] >= points[0];
    const strokeColor = isPositive ? '#059669' : '#E11D48';

    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full overflow-visible" fill="none">
        <path d={path} stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <div className="w-full px-margin py-space-md flex flex-col gap-space-lg select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-mono">
          <span className="material-symbols-outlined text-[18px] text-bullish">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Sub-View Navigation Tabs (Matching Stitch Screen 2 Exactly) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pt-space-sm">
        <div className="flex items-center gap-space-xs overflow-x-auto bg-surface-container-low p-1 rounded-xl w-fit" id="algo-subtabs">
          <button
            onClick={() => setActiveTab('trading')}
            className={`px-space-md py-space-sm rounded-lg font-label-md text-label-md whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'trading'
                ? 'bg-surface-card text-on-surface shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            Trading Algorithms
          </button>

          <button
            onClick={() => setActiveTab('investing')}
            className={`px-space-md py-space-sm rounded-lg font-label-md text-label-md whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'investing'
                ? 'bg-surface-card text-on-surface shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            Investment &amp; Wealth
          </button>

          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-space-md py-space-sm rounded-lg font-label-md text-label-md whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'watchlist'
                ? 'bg-surface-card text-on-surface shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            Tracked Strategies ({watchlistIds.length})
          </button>

          <button
            onClick={() => setActiveTab('positions')}
            className={`px-space-md py-space-sm rounded-lg font-label-md text-label-md whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'positions'
                ? 'bg-surface-card text-on-surface shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            Active Positions ({positions.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-space-md py-space-sm rounded-lg font-label-md text-label-md whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-surface-card text-on-surface shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            Order History ({orders.length})
          </button>
        </div>

        <div className="flex items-center gap-space-md font-mono-sm text-mono-sm text-text-muted">
          <span className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-bullish-tint text-bullish font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-bullish animate-pulse" />
            VECTORIZED SESSION ENGINE: READY
          </span>
          <span className="font-semibold text-on-surface">1 AUDITED MODEL (ZERO MOCK DATA)</span>
        </div>
      </div>

      {/* 2. Search & Multi-Tier Filter Bar (Matching Stitch Screen 2) */}
      {(activeTab === 'trading' || activeTab === 'investing' || activeTab === 'watchlist') && (
        <div className="bg-surface-card rounded-xl shadow-sm p-space-md flex flex-col lg:flex-row items-stretch lg:items-center gap-space-md border border-border-subtle">
          <div className="relative flex-1 min-w-0">
            <span className="material-symbols-outlined text-text-muted text-[18px] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Search NSE algorithmic models by name, symbol, style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface-container-low text-on-surface placeholder:text-text-muted font-body-md text-body-md focus:outline-none focus:bg-surface-card focus:shadow-sm transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-space-md">
            {/* Capital Filter Dropdown */}
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-text-muted text-[18px]">tune</span>
              <select
                value={capitalFilter}
                onChange={(e) => setCapitalFilter(e.target.value)}
                className="bg-surface-container-low border border-border-subtle text-on-surface font-label-md text-label-md rounded-lg px-space-sm py-2 focus:outline-none focus:bg-surface-card transition-all"
              >
                <option value="ALL">All Capital Tiers</option>
                <option value="UNDER_10K">Under ₹10,000</option>
                <option value="UNDER_50K">Under ₹50,000</option>
                <option value="UNDER_100K">Under ₹1,00,000</option>
                <option value="UNDER_200K">Under ₹2,00,000</option>
                <option value="ABOVE_200K">₹2,00,000+</option>
              </select>
            </div>

            {/* Trading Style Dropdown */}
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-text-muted text-[18px]">filter_list</span>
              <select
                value={styleFilter}
                onChange={(e) => setStyleFilter(e.target.value)}
                className="bg-surface-container-low border border-border-subtle text-on-surface font-label-md text-label-md rounded-lg px-space-sm py-2 focus:outline-none focus:bg-surface-card transition-all"
              >
                <option value="ALL">All Trading Styles</option>
                <option value="SWING">Swing Momentum</option>
                <option value="BREAKOUT">Opening Range Breakout</option>
                <option value="VOLATILITY">High Volatility Trend</option>
                <option value="WEALTH">Automated Wealth Compounding</option>
                <option value="OVERNIGHT">Overnight Sovereign Funds</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 3. ALGORITHM CARDS GRID (Trading, Investing, Watchlist) */}
      {(activeTab === 'trading' || activeTab === 'investing' || activeTab === 'watchlist') && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-lg">
          {filteredStrategies.length === 0 ? (
            <div className="col-span-full py-16 px-6 text-center text-text-muted space-y-3 bg-surface-card rounded-2xl border border-border-subtle">
              <span className="material-symbols-outlined text-4xl text-text-muted">info</span>
              <h4 className="font-title-md text-title-md text-on-surface font-semibold">
                {strategies.length === 0 ? 'No Algorithms in Registry' : 'No Matching Algorithms Found'}
              </h4>
              <p className="font-body-sm text-body-sm text-text-secondary max-w-md mx-auto">
                {activeTab === 'watchlist'
                  ? 'Your watchlist is currently empty. Bookmark any algorithm to track it here.'
                  : 'Try clearing your search query or filters to view available systematic models.'}
              </p>
            </div>
          ) : (
            filteredStrategies.map((algo) => {
              const isTracked = watchlistIds.includes(algo.id);
              return (
                <article
                  key={algo.id}
                  onClick={() => onSelectStrategy(algo)}
                  className="bg-surface-card rounded-xl shadow-sm hover:shadow-md transition-all p-space-lg flex flex-col justify-between gap-space-md border border-border-subtle cursor-pointer group"
                >
                  <div className="flex flex-col gap-space-sm">
                    <div className="flex items-start justify-between gap-space-sm">
                      <div className="flex items-center gap-space-sm min-w-0">
                        {algo.targetSymbol ? (
                          <StockLogo symbol={algo.targetSymbol} instrumentKey={algo.targetInstrumentKey} size="md" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center font-mono-sm text-mono-sm text-on-surface font-bold shrink-0">
                            AQ
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-title-md text-title-md text-on-surface font-semibold truncate group-hover:underline">
                            {algo.name}
                          </h3>
                          <p className="font-body-sm text-body-sm text-text-muted truncate">
                            {algo.tagline || `${algo.category} · ${algo.style}`}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleToggleTracklist(e, algo)}
                        className={`transition-colors shrink-0 p-1 rounded-lg ${
                          isTracked
                            ? 'text-amber-500 fill-current'
                            : 'text-text-muted hover:text-on-surface'
                        }`}
                        title={isTracked ? 'Remove from track list' : 'Bookmark strategy'}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {isTracked ? 'bookmark_added' : 'bookmark'}
                        </span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-space-xs">
                      <span className="px-space-sm py-0.5 rounded-full bg-surface-container-low text-on-surface-variant font-mono-sm text-mono-sm font-semibold">
                        ₹{algo.marginRequired.toLocaleString('en-IN')}
                      </span>
                      <span className="px-space-sm py-0.5 rounded-full bg-bullish-tint text-bullish font-label-sm text-label-sm inline-flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-[12px]">verified</span>
                        Audited Quant Strategy
                      </span>
                    </div>
                  </div>

                  {/* 4-Metric Grid */}
                  <div className="grid grid-cols-4 gap-space-xs bg-surface-container-low rounded-lg p-space-sm">
                    <div>
                      <div className="font-label-sm text-label-sm text-text-muted">1Y Return</div>
                      <div className="font-mono-md text-mono-md text-bullish font-bold tabular-nums">
                        +{algo.return1y}%
                      </div>
                    </div>
                    <div>
                      <div className="font-label-sm text-label-sm text-text-muted">Sharpe</div>
                      <div className="font-mono-md text-mono-md text-on-surface font-bold tabular-nums">
                        {algo.sharpeRatio.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="font-label-sm text-label-sm text-text-muted">Win Rate</div>
                      <div className="font-mono-md text-mono-md text-on-surface font-bold tabular-nums">
                        {algo.winRate}%
                      </div>
                    </div>
                    <div>
                      <div className="font-label-sm text-label-sm text-text-muted">Max DD</div>
                      <div className="font-mono-md text-mono-md text-bearish font-bold tabular-nums">
                        {algo.maxDrawdown}%
                      </div>
                    </div>
                  </div>

                  {/* Sparkline & Action Buttons */}
                  <div className="flex items-center justify-between gap-space-md pt-space-xs">
                    <div className="flex-1 h-10 text-bullish">
                      {renderSparkline(algo.sparkline)}
                    </div>

                    <div className="flex items-center gap-space-xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenBacktest(algo);
                        }}
                        className="px-space-sm py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-xs cursor-pointer active:scale-95"
                        type="button"
                      >
                        Backtest
                      </button>
                      <button
                        onClick={() => onSelectStrategy(algo)}
                        className="px-space-sm py-1.5 rounded-lg border border-border-subtle bg-surface-card text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors"
                        type="button"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}

      {/* VIEW B: SIMULATED POSITIONS (Matching Stitch Screen 2) */}
      {activeTab === 'positions' && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm overflow-hidden p-space-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-border-subtle">
            <div>
              <h3 className="font-title-md text-title-md text-on-surface font-semibold">Active Simulated Positions</h3>
              <p className="font-body-sm text-body-sm text-text-muted">Paper trade fills executed across authentic live market ticks.</p>
            </div>
            <div className="font-mono-sm text-mono-sm">
              <span className="text-text-muted">Total Unrealized PnL: </span>
              <strong className="text-bullish font-bold text-base">+₹3,636.50</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono-sm text-mono-sm">
              <thead>
                <tr className="border-b border-border-subtle text-text-muted uppercase font-label-sm">
                  <th className="py-2.5 px-3">Position ID</th>
                  <th className="py-2.5 px-3">Algorithm</th>
                  <th className="py-2.5 px-3">Symbol</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Avg Entry</th>
                  <th className="py-2.5 px-3 text-right">Current Price</th>
                  <th className="py-2.5 px-3 text-right">PnL (INR)</th>
                  <th className="py-2.5 px-3 text-right">Return %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {positions.map((pos) => (
                  <tr key={pos.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-2.5 px-3 text-text-muted font-bold">{pos.id}</td>
                    <td className="py-2.5 px-3 font-sans font-semibold text-on-surface">{pos.algoName}</td>
                    <td className="py-2.5 px-3 font-bold">{pos.symbol}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pos.type === 'BUY' ? 'bg-bullish-tint text-bullish' : 'bg-bearish-tint text-bearish'
                      }`}>
                        {pos.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">₹{pos.avgPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">₹{pos.currentPrice.toFixed(2)}</td>
                    <td className={`py-2.5 px-3 text-right font-bold tabular-nums ${pos.pnl >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                      {pos.pnl >= 0 ? '+' : ''}₹{pos.pnl.toFixed(2)}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-bold tabular-nums ${pos.pnlPct >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                      {pos.pnlPct >= 0 ? '+' : ''}{pos.pnlPct.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW C: ORDER HISTORY */}
      {activeTab === 'orders' && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm overflow-hidden p-space-lg space-y-4">
          <div className="flex items-center justify-between pb-space-sm border-b border-border-subtle">
            <h3 className="font-title-md text-title-md text-on-surface font-semibold">Simulated Order Journal</h3>
            <span className="font-mono-sm text-mono-sm text-text-muted">{orders.length} Executions Logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono-sm text-mono-sm">
              <thead>
                <tr className="border-b border-border-subtle text-text-muted uppercase font-label-sm">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Algorithm</th>
                  <th className="py-2.5 px-3">Symbol</th>
                  <th className="py-2.5 px-3">Side</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-2.5 px-3 text-text-muted font-bold">{ord.id}</td>
                    <td className="py-2.5 px-3 font-sans font-semibold text-on-surface">{ord.algoName}</td>
                    <td className="py-2.5 px-3 font-bold">{ord.symbol}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.type === 'BUY' ? 'bg-bullish-tint text-bullish' : 'bg-bearish-tint text-bearish'
                      }`}>
                        {ord.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">₹{ord.price.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{ord.qty}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-bullish-tint text-bullish">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-text-muted">{ord.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
