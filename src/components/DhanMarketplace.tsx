import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Sparkles,
  Filter,
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  TrendingUp,
  Layers,
  Clock,
  Briefcase,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
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
  // Navigation Tabs: Trading, Investing, Watchlist, Positions, Orders
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
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          algo.name.toLowerCase().includes(q) ||
          algo.tagline.toLowerCase().includes(q) ||
          algo.category.toLowerCase().includes(q) ||
          algo.style.toLowerCase().includes(q) ||
          (algo.targetSymbol && algo.targetSymbol.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [publishedStrategies, activeTab, capitalFilter, styleFilter, searchQuery, watchlistIds]);

  // Sparkline SVG generator
  const renderSparkline = (points: number[]) => {
    if (!points || points.length === 0) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const w = 84;
    const h = 22;
    const path = points
      .map((p, i) => {
        const x = (i / (points.length - 1)) * w;
        const y = h - ((p - min) / (max - min || 1)) * (h - 4) - 2;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');

    const isPositive = points[points.length - 1] >= points[0];
    const strokeColor = isPositive ? '#16A34A' : '#DC2626';

    return (
      <svg width={w} height={h} className="overflow-visible">
        <path d={path} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#151515] text-white px-4 py-3 rounded-xl shadow-xl border border-neutral-700 flex items-center gap-2.5 text-xs font-mono animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Mode Tabs Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('trading')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'trading'
                ? 'bg-[#151515] text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:text-black'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Trading Algorithms</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono">
              {strategies.filter((s) => !s.isInvestmentAlgo).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('investing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'investing'
                ? 'bg-[#151515] text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:text-black'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-blue-400" />
            <span>Investment & Wealth Algos (Below ₹1.1L)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono">
              {strategies.filter((s) => s.isInvestmentAlgo).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'watchlist'
                ? 'bg-[#151515] text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:text-black'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
            <span>My Watchlist ({watchlistIds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('positions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'positions'
                ? 'bg-[#151515] text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:text-black'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
            <span>Simulated Positions ({positions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-[#151515] text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:text-black'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>Order History ({orders.length})</span>
          </button>
        </div>

        {onNavigateToAdmin && (
          <button
            onClick={onNavigateToAdmin}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:border-black text-[#151515] text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            <span>+ Admin Studio</span>
          </button>
        )}
      </div>

      {/* Filter Ribbon (For Strategy Views) */}
      {(activeTab === 'trading' || activeTab === 'investing' || activeTab === 'watchlist') && (
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Capital Requirement Filter */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
              <span className="font-semibold text-gray-400">Capital:</span>
              <select
                value={capitalFilter}
                onChange={(e) => setCapitalFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-bold text-[#151515] focus:outline-none"
              >
                <option value="ALL">All Capital Tiers</option>
                <option value="UNDER_10K">Under ₹10,000</option>
                <option value="UNDER_50K">Under ₹50,000</option>
                <option value="UNDER_100K">Under ₹1,00,000</option>
                <option value="UNDER_200K">Under ₹2,00,000</option>
                <option value="ABOVE_200K">₹2,00,000+</option>
              </select>
            </div>

            {/* Trading Style Filter */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
              <span className="font-semibold text-gray-400">Style:</span>
              <select
                value={styleFilter}
                onChange={(e) => setStyleFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-bold text-[#151515] focus:outline-none"
              >
                <option value="ALL">All Trading Styles</option>
                <option value="SWING">Swing Trading</option>
                <option value="BREAKOUT">Opening Range Breakout</option>
                <option value="VOLATILITY">High Volatility Equities</option>
                <option value="WEALTH">Automated Wealth Management</option>
                <option value="OVERNIGHT">Overnight Sovereign Funds</option>
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by algo name, symbol, style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-[#151515] placeholder-gray-400 focus:outline-none focus:border-black"
            />
          </div>
        </div>
      )}

      {/* VIEW A: ALGORITHMS TABLE (Trading, Investing, Watchlist) */}
      {(activeTab === 'trading' || activeTab === 'investing' || activeTab === 'watchlist') && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-3 px-6 py-3.5 border-b border-gray-100 bg-[#FAFAFC] text-[11px] font-semibold text-gray-500 uppercase tracking-wider font-mono">
            <div className="col-span-4">Algorithm & Structure</div>
            <div className="col-span-2 text-right">Margin Required</div>
            <div className="col-span-2 text-center">1M Return</div>
            <div className="col-span-1 text-center">3M</div>
            <div className="col-span-1 text-center">6M</div>
            <div className="col-span-1 text-center">1Y</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Strategy Rows */}
          <div className="divide-y divide-gray-100">
            {filteredStrategies.length === 0 ? (
              <div className="py-16 px-6 text-center text-gray-500 space-y-3">
                <AlertCircle className="w-8 h-8 text-gray-400 mx-auto" />
                <h4 className="text-sm font-bold text-[#151515]">
                  {strategies.length === 0 ? 'No Algorithms in Registry' : 'No Algorithms Found'}
                </h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  {strategies.length === 0
                    ? 'All mock algorithm data has been removed. You can synthesize or configure authentic quantitative strategies using Backtest Studio or Admin Studio.'
                    : activeTab === 'watchlist'
                    ? 'Your watchlist is currently empty. Bookmark any algorithm to track it here.'
                    : 'Try clearing your filters or search keywords to view available strategies.'}
                </p>
                {strategies.length === 0 && onNavigateToAdmin && (
                  <div className="pt-2">
                    <button
                      onClick={onNavigateToAdmin}
                      className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                    >
                      + Create New Strategy
                    </button>
                  </div>
                )}
              </div>
            ) : (
              filteredStrategies.map((algo) => {
                const isTracked = watchlistIds.includes(algo.id);
                return (
                  <div
                    key={algo.id}
                    onClick={() => onSelectStrategy(algo)}
                    className="grid grid-cols-12 gap-3 px-6 py-4 items-center hover:bg-gray-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Column 1: Algo Details with Watchlist Star & Stock Logo */}
                    <div className="col-span-4 flex items-center gap-3">
                      <button
                        onClick={(e) => handleToggleTracklist(e, algo)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          isTracked
                            ? 'bg-amber-50 border-amber-300 text-amber-600'
                            : 'bg-white border-gray-200 text-gray-300 hover:text-gray-500'
                        }`}
                        title={isTracked ? 'Remove from track list' : 'Add to track list'}
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-current" />
                      </button>

                      {algo.targetSymbol && (
                        <StockLogo symbol={algo.targetSymbol} instrumentKey={algo.targetInstrumentKey} size="sm" />
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#151515] group-hover:underline">
                            {algo.name}
                          </span>
                          {algo.isInvestmentAlgo && (
                            <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 font-mono">
                              WEALTH
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                          {algo.segment || 'NSE Equity'} · {algo.style}
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Margin Required */}
                    <div className="col-span-2 text-right font-mono font-bold text-sm text-[#151515]">
                      ₹ {algo.marginRequired.toLocaleString('en-IN')}
                    </div>

                    {/* Column 3: 1m Rolling Returns (Sparkline SVG + %) */}
                    <div className="col-span-2 flex flex-col items-center justify-center">
                      {renderSparkline(algo.sparkline)}
                      <span className={`text-[11px] font-mono font-bold mt-0.5 ${algo.rollingReturn1m >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {algo.rollingReturn1m >= 0 ? '+' : ''}{algo.rollingReturn1m}%
                      </span>
                    </div>

                    {/* Column 4: 3m */}
                    <div className={`col-span-1 text-center font-mono text-xs font-bold ${algo.return3m >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {algo.return3m >= 0 ? '+' : ''}{algo.return3m}%
                    </div>

                    {/* Column 5: 6m */}
                    <div className={`col-span-1 text-center font-mono text-xs font-bold ${algo.return6m >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {algo.return6m >= 0 ? '+' : ''}{algo.return6m}%
                    </div>

                    {/* Column 6: 1y */}
                    <div className={`col-span-1 text-center font-mono text-xs font-bold ${algo.return1y >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {algo.return1y >= 0 ? '+' : ''}{algo.return1y}%
                    </div>

                    {/* Column 7: Actions */}
                    <div className="col-span-1 text-right">
                      <span className="inline-flex items-center text-xs font-semibold text-gray-400 group-hover:text-black">
                        Details →
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW B: SIMULATED POSITIONS */}
      {activeTab === 'positions' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#151515]">Active Simulated Positions</h3>
              <p className="text-xs text-gray-500">Live positions executed by deployed algorithms in paper mode.</p>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="text-gray-400">Total Unrealized PnL: </span>
              <strong className="text-emerald-700 font-bold">+₹3,636.50</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#FAFAFC] border-b border-gray-100 text-gray-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Position ID</th>
                  <th className="py-3 px-4">Algorithm</th>
                  <th className="py-3 px-4">Symbol</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Avg Entry</th>
                  <th className="py-3 px-4 text-right">Current Price</th>
                  <th className="py-3 px-4 text-right">Deployed</th>
                  <th className="py-3 px-4 text-right">PnL (INR)</th>
                  <th className="py-3 px-4 text-right">Return %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {positions.map((pos) => {
                  const isProfit = pos.pnl >= 0;
                  return (
                    <tr key={pos.id} className="hover:bg-gray-50">
                      <td className="py-3.5 px-4 font-bold text-gray-500">{pos.id}</td>
                      <td className="py-3.5 px-4 font-sans font-bold text-[#151515]">{pos.algoName}</td>
                      <td className="py-3.5 px-4 font-bold">{pos.symbol}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${pos.type === 'BUY' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {pos.type} ({pos.qty})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">₹{pos.avgPrice.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right font-bold">₹{pos.currentPrice.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right text-gray-600">₹{pos.capitalDeployed.toLocaleString('en-IN')}</td>
                      <td className={`py-3.5 px-4 text-right font-bold ${isProfit ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {isProfit ? '+' : ''}₹{pos.pnl.toFixed(2)}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-bold ${isProfit ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {isProfit ? '+' : ''}{pos.pnlPct.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW C: ORDER HISTORY */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#151515]">Algorithmic Order Book</h3>
              <p className="text-xs text-gray-500">SEBI limit orders placed and verified by algorithms.</p>
            </div>
            <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              100% Limit Orders
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#FAFAFC] border-b border-gray-100 text-gray-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Algorithm</th>
                  <th className="py-3 px-4">Symbol</th>
                  <th className="py-3 px-4">Side</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Limit Price</th>
                  <th className="py-3 px-4 text-right">Qty</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-gray-500">{ord.id}</td>
                    <td className="py-3 px-4 text-gray-500">{ord.timestamp}</td>
                    <td className="py-3 px-4 font-sans font-bold text-[#151515]">{ord.algoName}</td>
                    <td className="py-3 px-4 font-bold">{ord.symbol}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{ord.type}</td>
                    <td className="py-3 px-4 text-gray-500">{ord.orderType}</td>
                    <td className="py-3 px-4 text-right font-bold">₹{ord.price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">{ord.qty}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {ord.status}
                      </span>
                    </td>
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
