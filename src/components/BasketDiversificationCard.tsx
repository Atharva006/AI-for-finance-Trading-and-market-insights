import React from 'react';
import {
  ShieldCheck,
  PieChart,
  TrendingUp,
  Sparkles,
  Plus,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import {
  DiversificationMetrics,
  SuggestedDiversificationPair,
} from '../services/portfolioDiversification';
import { StockLogo } from './StockLogo';

interface BasketDiversificationCardProps {
  metrics: DiversificationMetrics;
  suggestions: SuggestedDiversificationPair[];
  onAddSuggestion: (suggestion: SuggestedDiversificationPair) => void;
}

export const BasketDiversificationCard: React.FC<BasketDiversificationCardProps> = ({
  metrics,
  suggestions,
  onAddSuggestion,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-container-low border border-border-subtle flex items-center justify-center text-primary shadow-xs">
            <PieChart className="w-5 h-5 text-bullish" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                Portfolio Diversification Factor & Modern Portfolio Theory
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  metrics.rating === 'EXCELLENT'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : metrics.rating === 'HEALTHY'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : metrics.rating === 'MODERATE'
                    ? 'bg-gray-100 text-gray-800 border border-gray-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {metrics.rating} DIVERSIFICATION
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-[#0A0A0D] tracking-tight">
              Cross-Sector Risk & Pair Synergy
            </h3>
          </div>
        </div>

        {/* Score Pill */}
        <div className="flex items-center gap-3 font-mono">
          <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-right">
            <span className="text-[10px] text-gray-400 uppercase font-bold block">
              Diversification Score
            </span>
            <div className="flex items-baseline justify-end gap-1">
              <span
                className={`text-2xl font-black ${
                  metrics.score >= 80
                    ? 'text-emerald-600'
                    : metrics.score >= 60
                    ? 'text-blue-600'
                    : 'text-gray-800'
                }`}
              >
                {metrics.score}
              </span>
              <span className="text-xs text-gray-400 font-bold">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Sector Allocations & Correlation Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Sector Breakdown (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Sector Exposure (RPT Weight)</span>
            </span>
            <span className="text-[10px] font-mono text-gray-400">
              HHI: {metrics.hhiIndex} {metrics.hhiIndex < 2500 ? '(Safe)' : '(Concentrated)'}
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {metrics.sectorBreakdown.map((sec, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-gray-800 truncate">{sec.sector}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">({sec.symbols.join(', ')})</span>
                    <span className="font-bold text-black">{sec.weightPct}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      idx === 0
                        ? 'bg-primary'
                        : idx === 1
                        ? 'bg-bullish'
                        : idx === 2
                        ? 'bg-secondary'
                        : 'bg-neutral-400'
                    }`}
                    style={{ width: `${Math.min(100, sec.weightPct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-[11px] font-mono text-gray-600 flex items-start gap-2 mt-2">
            <Activity className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
            <span>{metrics.correlationRiskNote}</span>
          </div>
        </div>

        {/* Right: Suggested Stocks & Pairs to Maximize Diversification (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Suggested Stocks & Pairs to Maximize Diversification</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Low-Correlation Matches
            </span>
          </div>

          {suggestions.length === 0 ? (
            <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-center space-y-1.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-emerald-900 font-mono">
                Optimal Multi-Sector Coverage Achieved!
              </p>
              <p className="text-[11px] text-gray-600">
                Your basket is well-balanced across key NSE sectors with low pairwise correlation.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {suggestions.map((sugg) => (
                <div
                  key={sugg.id}
                  className="p-3.5 rounded-2xl bg-white border border-gray-200 hover:border-gray-400 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3">
                    <StockLogo symbol={sugg.primaryStock.symbol} instrumentKey={sugg.primaryStock.instrument_key} name={sugg.primaryStock.name} size="md" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0A0A0D]">
                          {sugg.headline}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-gray-100 text-gray-700">
                          {sugg.sector}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          +{sugg.expectedScoreImprovement} pts
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-600 font-sans leading-relaxed">
                        {sugg.rationale}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] font-mono text-gray-400 pt-0.5">
                        <span>Corr: <strong>{sugg.correlationWithBasket}</strong></span>
                        <span>·</span>
                        <span>System: <strong>{sugg.recommendedStrategy} ({sugg.recommendedTimeframe.toUpperCase()})</strong></span>
                        <span>·</span>
                        <span>Rec RPT: <strong>{sugg.recommendedRptPct}%</strong></span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onAddSuggestion(sugg)}
                    className="shrink-0 px-3.5 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                    title={`Add ${sugg.primaryStock.symbol} to basket`}
                  >
                    <Plus className="w-3.5 h-3.5 text-bullish" />
                    <span>Add to Basket</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
