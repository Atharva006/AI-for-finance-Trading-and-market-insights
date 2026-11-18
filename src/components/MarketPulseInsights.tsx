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
    <div className="space-y-6">
      {/* Top Banner: Macro Market Regime & Institutional Intelligence */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0A0A0D] flex items-center justify-center text-white shadow-sm">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                  Macro Market Regime & Quantitative Breadth
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live NSE Regime
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0A0A0D] tracking-tight">
                {pulse.regimeTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">India VIX</span>
              <span className="text-sm font-bold text-black">{pulse.indiaVix}</span>
              <span className="text-[10px] text-emerald-600 block">+0.97% (Calm)</span>
            </div>
            <div className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Market Breadth</span>
              <span className="text-sm font-bold text-black">{pulse.marketBreadthPct}%</span>
              <span className="text-[10px] text-gray-500 block">&gt; 50-Day EMA</span>
            </div>
            <div className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">FII Net Flow</span>
              <span className="text-sm font-bold text-emerald-600">+₹{pulse.fiiNetFlowCr} Cr</span>
              <span className="text-[10px] text-gray-500 block">Institutional Net Buy</span>
            </div>
          </div>
        </div>

        {/* AI Regime Diagnostics & Strategy Fit */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Macro Regime Quantitative Intelligence</span>
                </div>
                <button
                  onClick={fetchGroqCommentary}
                  disabled={isAiLoading}
                  className="p-1 rounded hover:bg-emerald-100 text-emerald-800 transition-colors disabled:opacity-50"
                  title="Re-analyze Macro Regime"
                >
                  <RefreshCw className={`w-3 h-3 ${isAiLoading ? 'animate-spin text-emerald-600' : 'text-emerald-700'}`} />
                </button>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed font-sans">
                {isAiLoading ? 'Generating quantitative macro commentary via AI Engine...' : (groqCommentary || pulse.regimeDescription)}
              </p>
            </div>
            <div className="flex items-center gap-1.5 pt-1 text-[10px] font-mono text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Quantitative Macro Engine</span>
            </div>
          </div>

          <div className="md:col-span-2 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono block">
              Regime Strategy Fit Recommendations
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
              {pulse.recommendedStrategies.map((rec, idx) => (
                <div key={idx} className="p-2.5 bg-white rounded-lg border border-gray-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-black truncate text-[11px]">{rec.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        rec.fitLevel === 'OPTIMAL'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : rec.fitLevel === 'MODERATE'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {rec.fitLevel}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-sans leading-tight line-clamp-2">
                    {rec.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fundamental Filings Screener & Earnings Blackout Shield */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <h3 className="text-base font-bold text-[#0A0A0D]">
                NSE Company Filings & Fundamental Confluence Screener
              </h3>
              <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-mono font-bold">
                SEBI Corporate Filings Data
              </span>
            </div>
            <p className="text-xs text-gray-500 font-sans mt-0.5">
              Filter institutional-grade balance sheets before deploying quantitative trend strategies.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search symbol / company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-700"
            >
              {sectors.map((sec) => (
                <option key={sec} value={sec}>
                  {sec === 'ALL' ? 'All Sectors' : sec}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShieldOnly(!shieldOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                shieldOnly
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:text-black'
              }`}
              title="Hide stocks announcing quarterly earnings in under 7 days to eliminate event risk"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
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
                          className="px-2.5 py-1 bg-[#0A0A0D] hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
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
      </div>

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
