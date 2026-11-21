import React, { useState, useMemo, useEffect } from 'react';
import {
  Activity,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Sparkles,
  BarChart3,
  Calendar,
  Building2,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  ChevronRight,
  Info,
  RefreshCw,
} from 'lucide-react';
import {
  NSE_FUNDAMENTAL_STOCKS,
  getLiveMarketPulse,
} from '../services/marketPulseData';
import { FundamentalStockData } from '../types/marketPulse';
import { groqMarketRegimeCommentary } from '../services/groqApi';
import { CompanyFilingAnalyzerModal } from './CompanyFilingAnalyzerModal';
import { StockLogo } from './StockLogo';

interface MarketPulseInsightsProps {
  onSelectStockForBacktest: (symbol: string) => void;
  onOpenFlowWithStock: (symbol: string) => void;
}

export const MarketPulseInsights: React.FC<MarketPulseInsightsProps> = ({
  onSelectStockForBacktest,
  onOpenFlowWithStock,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [shieldOnly, setShieldOnly] = useState(false);
  const [groqCommentary, setGroqCommentary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedFilingStock, setSelectedFilingStock] = useState<FundamentalStockData | null>(null);

  const pulse = useMemo(() => {
    return getLiveMarketPulse(15.65);
  }, []);

  const fetchGroqCommentary = async () => {
    setIsAiLoading(true);
    try {
      const commentary = await groqMarketRegimeCommentary(pulse);
      setGroqCommentary(commentary);
    } catch (err) {
      console.warn('Groq commentary fetch error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    fetchGroqCommentary();
  }, []);

  const sectors = useMemo(() => {
    const list = Array.from(new Set(NSE_FUNDAMENTAL_STOCKS.map((s) => s.sector)));
    return ['ALL', ...list];
  }, []);

  const filteredStocks = useMemo(() => {
    return NSE_FUNDAMENTAL_STOCKS.filter((stock) => {
      const matchSearch =
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSector = selectedSector === 'ALL' || stock.sector === selectedSector;
      const matchShield = !shieldOnly || stock.daysToEarnings > 7; // Safe from earnings
      return matchSearch && matchSector && matchShield;
    });
  }, [searchTerm, selectedSector, shieldOnly]);

  return (
    <div className="flex flex-col w-full gap-space-lg pb-space-xl">
      {/* Top Header (Stitch Screen 7) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pt-space-xs">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">Market Pulse &amp; Macro Intelligence</h1>
            <span className="inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-bullish-tint text-bullish font-mono-sm text-mono-sm font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-bullish animate-pulse"></span>
              NSE LIVE REGIME
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-text-secondary">
            High-frequency NSE breadth, institutional FII/DII liquidity tracker &amp; systematic equity scanner.
          </p>
        </div>
        <div className="flex items-center gap-space-sm">
          <button
            onClick={() => setSelectedFilingStock(NSE_FUNDAMENTAL_STOCKS[0])}
            className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-card border border-border-subtle text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">description</span>
            <span>Preview Filing Analyzer (RELIANCE)</span>
          </button>
          <button
            onClick={() => onSelectStockForBacktest('NIFTY 50')}
            className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>Run Regime Backtest</span>
          </button>
        </div>
      </div>

      {/* 4 Macro Breadth Cards (Stitch Screen 7) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-gutter">
        {/* Card 1: NIFTY 50 Breadth */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-space-lg shadow-xs flex flex-col justify-between gap-space-md">
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-text-muted uppercase">NIFTY 50 Breadth</span>
              <span className="font-mono-lg text-mono-lg text-on-surface tabular-nums font-bold">72.0%</span>
            </div>
            <div className="w-14 h-14 shrink-0">
              <svg className="w-full h-full" viewBox="0 0 64 64">
                <circle className="text-surface-container" cx="32" cy="32" fill="none" r="26" stroke="currentColor" strokeWidth="6" />
                <circle className="text-bullish" cx="32" cy="32" fill="none" r="26" stroke="currentColor" strokeDasharray="163.36" strokeDashoffset="45.74" strokeLinecap="round" strokeWidth="6" transform="rotate(-90 32 32)" />
                <text className="fill-on-surface font-mono-sm text-[11px] font-semibold" textAnchor="middle" x="32" y="36">36/50</text>
              </svg>
            </div>
          </div>
          <div className="flex items-center justify-between pt-space-sm border-t border-border-subtle font-mono-sm text-mono-sm">
            <span className="text-text-secondary">Above 50-EMA</span>
            <span className="text-bullish font-semibold">+4.0% WoW</span>
          </div>
        </div>

        {/* Card 2: India VIX Volatility */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-space-lg shadow-xs flex flex-col justify-between gap-space-md">
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-text-muted uppercase">India VIX Volatility</span>
              <div className="flex items-baseline gap-space-sm">
                <span className="font-mono-lg text-mono-lg text-on-surface tabular-nums font-bold">{pulse.indiaVix}</span>
                <span className="font-mono-sm text-mono-sm text-bullish tabular-nums font-semibold">-3.8%</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[20px] text-bullish">verified</span>
          </div>
          <div className="flex items-center justify-between pt-space-sm border-t border-border-subtle">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-bullish-tint text-bullish font-mono-sm text-mono-sm font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-bullish"></span>
              Low Volatility / Trend Friendly
            </span>
          </div>
        </div>

        {/* Card 3: FII / DII Flow */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-space-lg shadow-xs flex flex-col justify-between gap-space-md">
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-text-muted uppercase">FII / DII Net Flow</span>
              <div className="flex items-baseline gap-space-sm">
                <span className="font-mono-lg text-mono-lg text-bullish tabular-nums font-bold">+₹{pulse.fiiNetFlowCr} Cr</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[20px] text-bullish">swap_vert</span>
          </div>
          <div className="flex items-center justify-between pt-space-sm border-t border-border-subtle font-mono-sm text-mono-sm">
            <span className="text-text-secondary">₹6,410 Cr FII</span>
            <span className="text-text-muted">₹3,583 Cr DII</span>
          </div>
        </div>

        {/* Card 4: Market Breadth */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-space-lg shadow-xs flex flex-col justify-between gap-space-md">
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-text-muted uppercase">Advance / Decline</span>
              <span className="font-mono-lg text-mono-lg text-on-surface tabular-nums font-bold">34 Adv / 16 Dec</span>
            </div>
            <span className="material-symbols-outlined text-[20px] text-bullish">trending_up</span>
          </div>
          <div className="flex items-center justify-between pt-space-sm border-t border-border-subtle font-mono-sm text-mono-sm">
            <span className="text-text-secondary">Ratio: 2.12x</span>
            <span className="text-bullish font-semibold">Broad-Based Rally</span>
          </div>
        </div>
      </section>

      {/* AI Macro Commentary Section (Stitch Screen 7) */}
      <section className="bg-surface-card border border-border-subtle rounded-xl p-space-lg shadow-xs flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-secondary text-[20px]">psychology</span>
            <h2 className="font-title-md text-title-md text-on-surface">AI Macro Commentary</h2>
          </div>
          <div className="flex items-center gap-space-sm">
            <button
              onClick={fetchGroqCommentary}
              disabled={isAiLoading}
              className="inline-flex items-center gap-space-xs px-2.5 py-1 rounded-md bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-mono transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh AI Analysis"
            >
              <span className={`material-symbols-outlined text-[14px] ${isAiLoading ? 'animate-spin' : ''}`}>refresh</span>
              <span>Re-analyze</span>
            </button>
            <span className="inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-surface-container font-mono-sm text-mono-sm text-on-surface-variant font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-bullish"></span>
              GROQ LPU 120B QUANT
            </span>
          </div>
        </div>
        <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
          {isAiLoading ? 'Synthesizing quantitative macroeconomic commentary via Groq LPU...' : (groqCommentary || pulse.regimeDescription)}
        </p>
      </section>

      {/* Section 3: NSE Fundamental Screener (Stitch Screen 7) */}
      <section className="bg-surface-card border border-border-subtle rounded-xl shadow-xs overflow-hidden flex flex-col">
        <div className="p-space-lg border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-on-surface text-[20px]">filter_alt</span>
            <div>
              <h2 className="font-title-md text-title-md text-on-surface">NSE Fundamental Screener</h2>
              <p className="font-body-sm text-body-sm text-text-muted">
                Pre-screen quality balance sheets before deploying systematic quantitative momentum.
              </p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="relative">
              <span className="material-symbols-outlined text-text-muted text-[16px] absolute left-2.5 top-2.5">search</span>
              <input
                type="text"
                placeholder="Search symbol / company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-surface-container-low border border-border-subtle rounded-lg text-xs font-body-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-surface-container-low border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs font-semibold text-on-surface cursor-pointer"
            >
              {sectors.map((sec) => (
                <option key={sec} value={sec}>
                  {sec === 'ALL' ? 'All Sectors' : sec}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShieldOnly(!shieldOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                shieldOnly
                  ? 'bg-bullish-tint text-bullish border-bullish'
                  : 'bg-surface-container-low text-text-secondary border-border-subtle hover:text-on-surface'
              }`}
              title="Hide stocks announcing quarterly earnings in under 7 days to eliminate event risk"
            >
              <span className="material-symbols-outlined text-[15px]">verified_user</span>
              <span>Earnings Shield Active</span>
            </button>
          </div>
        </div>

        {/* Fundamental Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Symbol / Company</th>
                <th className="py-2.5 px-3">Price</th>
                <th className="py-2.5 px-3">P/E vs Ind</th>
                <th className="py-2.5 px-3">ROCE %</th>
                <th className="py-2.5 px-3">D/E Ratio</th>
                <th className="py-2.5 px-3">Piotroski</th>
                <th className="py-2.5 px-3">Qtr Filings Growth</th>
                <th className="py-2.5 px-3">Earnings Date</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStocks.map((stock) => {
                const isUnderValued = stock.peRatio < stock.industryPe;
                const isCleanBalanceSheet = stock.debtToEquity < 0.5;

                return (
                  <tr key={stock.symbol} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <StockLogo symbol={stock.symbol} name={stock.companyName} size="sm" />
                        <div>
                          <span className="font-bold text-black block">{stock.symbol}</span>
                          <span className="text-[10px] text-gray-400 font-sans block">{stock.sector}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-bold text-black">
                      ₹{stock.currentPrice.toFixed(2)}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-black">{stock.peRatio}</span>
                        <span className="text-[10px] text-gray-400">/ {stock.industryPe}</span>
                        {isUnderValued && (
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1 rounded font-bold">
                            Fair
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-bold text-emerald-700">
                      {stock.rocePct}%
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`font-bold ${
                          isCleanBalanceSheet ? 'text-emerald-700' : 'text-gray-700'
                        }`}
                      >
                        {stock.debtToEquity}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                        {stock.piotroskiFScore}/9
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-[11px]">
                        <span className="text-emerald-600 font-bold block">
                          +{stock.qtrRevenueGrowthPct}% Rev
                        </span>
                        <span className="text-gray-400 text-[10px] block">
                          +{stock.qtrProfitGrowthPct}% PAT
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div>
                        <span className="text-gray-700 text-[11px] block">{stock.nextEarningsDate}</span>
                        <span className="text-[10px] text-gray-400 block">in {stock.daysToEarnings} days</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedFilingStock(stock)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                          title={`Deep-dive into SEBI LODR quarterly filings & concall transcript with AI Intelligence for ${stock.symbol}`}
                        >
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>AI Concall</span>
                        </button>
                        <button
                          onClick={() => onSelectStockForBacktest(stock.symbol)}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition-all shadow-xs"
                          title={`Launch single-stock backtest for ${stock.symbol}`}
                        >
                          Backtest
                        </button>
                        <button
                          onClick={() => onOpenFlowWithStock(stock.symbol)}
                          className="px-2.5 py-1 bg-primary hover:bg-primary-container text-on-primary rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                          title={`Open ${stock.symbol} in n8n Visual Flow Studio`}
                        >
                          Flow Canvas
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* AI Company Filing & Concall Analyzer Modal */}
      <CompanyFilingAnalyzerModal
        isOpen={!!selectedFilingStock}
        onClose={() => setSelectedFilingStock(null)}
        stock={selectedFilingStock}
        onSelectForBacktest={onSelectStockForBacktest}
        onOpenFlowCanvas={onOpenFlowWithStock}
      />
    </div>
  );
};
