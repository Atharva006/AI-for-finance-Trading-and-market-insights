import React, { useState } from 'react';
import {
  TrendingUp,
  Shield,
  PieChart,
  Calendar,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Layers,
} from 'lucide-react';

interface InvestingAlgo {
  id: string;
  name: string;
  tagline: string;
  category: 'Momentum Core' | 'Dividend & Value' | 'Quality Growth' | 'Factor Rotation';
  benchmark: string;
  cagr3y: number;
  cagr5y: number;
  sharpeRatio: number;
  maxDrawdown: number;
  rebalanceFreq: 'Monthly' | 'Quarterly' | 'Bi-Annual' | 'Annual';
  minInvestment: number;
  holdingsCount: number;
  description: string;
  topHoldings: string[];
}

const INVESTING_ALGOS: InvestingAlgo[] = [];

export const DhanInvestingAlgos: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All Investing Algos');
  const [selectedAlgo, setSelectedAlgo] = useState<InvestingAlgo | null>(null);

  const categories = [
    'All Investing Algos',
    'Momentum Core',
    'Dividend & Value',
    'Quality Growth',
    'Factor Rotation',
  ];

  const filteredAlgos = INVESTING_ALGOS.filter((algo) => {
    if (activeCategory === 'All Investing Algos') return true;
    return algo.category === activeCategory;
  });

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8 select-none">
      {/* Header Banner */}
      <div className="pb-6 border-b border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <span>Apex Quant</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#0A0A0D] font-bold">Investing Algos</span>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-1">
          <div>
            <h1 className="text-2xl font-bold text-[#0A0A0D] tracking-tight">
              Systematic Investing Algorithms (NSE)
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">
              Long-term portfolio rebalancing engines & multi-factor systematic strategies across National Stock Exchange equities.
            </p>
          </div>
          <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-mono font-semibold text-emerald-800">
            ✓ Long-Term Wealth Accumulation · Zero Intraday Churn
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-6">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
                isActive
                  ? 'bg-[#0A0A0D] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-black'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid of Investing Strategies or Clean Empty State */}
      {filteredAlgos.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto text-gray-400">
            <PieChart className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#0A0A0D]">No Investing Algorithms Configured</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            All mock investment algorithms have been removed. Configure authentic portfolio allocation algorithms in Admin Studio or Backtest Studio.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAlgos.map((algo) => (
            <div
              key={algo.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-base text-[#0A0A0D]">
                      <PieChart className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#0A0A0D]">{algo.name}</h3>
                      <span className="text-xs text-gray-500 font-medium">{algo.tagline}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 bg-gray-100 rounded-full font-bold text-gray-700">
                    {algo.rebalanceFreq}
                  </span>
                </div>

                <p className="mt-4 text-xs text-gray-600 leading-relaxed font-sans">
                  {algo.description}
                </p>

                {/* Top Holdings Chips */}
                <div className="mt-4 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
                    Top Equities:
                  </span>
                  {algo.topHoldings.map((h) => (
                    <span
                      key={h}
                      className="text-[11px] font-mono font-bold px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-md text-[#0A0A0D]"
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {/* Performance Metrics */}
                <div className="mt-5 grid grid-cols-4 gap-2 text-center py-3 bg-[#FAFAFC] rounded-xl border border-gray-100 font-mono">
                  <div>
                    <span className="text-gray-400 block text-[10px]">3Y CAGR</span>
                    <span className="font-bold text-emerald-600 text-sm">+{algo.cagr3y}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">5Y CAGR</span>
                    <span className="font-bold text-emerald-600 text-sm">+{algo.cagr5y}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Sharpe</span>
                    <span className="font-bold text-[#0A0A0D] text-sm">{algo.sharpeRatio}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Max DD</span>
                    <span className="font-bold text-rose-600 text-sm">{algo.maxDrawdown}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 block">Min Investment</span>
                  <span className="font-mono font-bold text-sm text-[#0A0A0D]">
                    ₹ {algo.minInvestment.toLocaleString('en-IN')}
                  </span>
                </div>
                <button
                  onClick={() => alert(`Subscribed to ${algo.name} portfolio updates.`)}
                  className="px-5 py-2 bg-[#0A0A0D] hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
                >
                  Analyze Portfolio
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
