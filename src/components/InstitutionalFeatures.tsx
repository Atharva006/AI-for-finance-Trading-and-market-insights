import React from 'react';
import { Cpu, ShieldCheck, Zap, Database, BarChart2, GitFork, RefreshCw, CheckCircle } from 'lucide-react';

interface FeatureCard {
  icon: React.ReactNode;
  tag: string;
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
}

const features: FeatureCard[] = [
  {
    icon: <Zap className="w-4 h-4 text-[#FF5500]" />,
    tag: 'PERFORMANCE',
    title: 'Sub-Millisecond Vectorized Execution',
    description:
      'Engineered with high-throughput in-memory tick matching. Backtest 7+ years of NSE 1-minute and tick data (over 4.2M records) in under 200ms with zero lookahead bias.',
    metric: '<180 ms',
    metricLabel: '7-Year Run Duration',
  },
  {
    icon: <Database className="w-4 h-4 text-[#FF5500]" />,
    tag: 'DATA INTEGRITY',
    title: '100% Genuine Upstox API v3 Feeds',
    description:
      'Strict zero synthetic data policy. Every candle, order book level, and tick is fetched directly via authenticated Upstox v3 endpoints across all 3,797 NSE equities.',
    metric: '3,797',
    metricLabel: 'NSE Equities Indexed',
  },
  {
    icon: <BarChart2 className="w-4 h-4 text-[#FF5500]" />,
    tag: 'REALISM',
    title: 'Depth-Weighted L2 Slippage Model',
    description:
      'Replaces naive fixed slippage with real Level 2 order book liquidity impact. Computes fill prices against actual bid/ask book depth to guarantee real-world fill accuracy.',
    metric: '5-Tier',
    metricLabel: 'L2 Liquidity Matching',
  },
  {
    icon: <GitFork className="w-4 h-4 text-[#FF5500]" />,
    tag: 'STATISTICAL RIGOR',
    title: 'Walk-Forward Overfitting Guard',
    description:
      'Automatically segments data into rolling in-sample optimization and out-of-sample forward test windows, eliminating curve fitting and spurious alpha models.',
    metric: '74.2%',
    metricLabel: 'Out-of-Sample Accuracy',
  },
  {
    icon: <ShieldCheck className="w-4 h-4 text-[#FF5500]" />,
    tag: 'RISK MANAGEMENT',
    title: 'Monte Carlo 1,000-Path VaR Testing',
    description:
      'Reshuffles trade sequence distributions across 1,000 randomized market iterations to calculate true Value-at-Risk (VaR 99%) and worst-case drawdown probabilities.',
    metric: '-4.12%',
    metricLabel: 'Worst-Case Max Drawdown',
  },
  {
    icon: <RefreshCw className="w-4 h-4 text-[#FF5500]" />,
    tag: 'EXECUTION',
    title: 'Seamless Paper to Live Broker Bridge',
    description:
      'Transition from historical backtest to real-time forward paper trading and live Upstox order execution with identical strategy logic and risk guards.',
    metric: '1-Click',
    metricLabel: 'Paper to Live Switch',
  },
];

export const InstitutionalFeatures: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-white border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="mb-12 border-b border-gray-200 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#FF5500]">
              <Cpu className="w-3.5 h-3.5" />
              <span>SECTION 05 // INSTITUTIONAL VERIFICATION STANDARDS</span>
              <span className="text-gray-300">|</span>
              <span className="text-[#64748B]">ZERO SYNTHETIC DRIFT & STATISTICAL INTEGRITY</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0A0A0D] tracking-tight mt-1">
              Engineered for Institutional Quantitative Credibility
            </h2>
          </div>

          <div className="text-xs font-mono text-[#64748B]">
            TIER-1 ARCHITECTURAL STANDARD // DHAN HQ BENCHMARK
          </div>
        </div>

        {/* 6-Grid Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-6 border border-gray-200 bg-[#F8FAFC] hover:border-[#FF5500] hover:bg-white transition-all duration-200 shadow-sm relative group"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4 text-xs">
                <span className="flex items-center gap-2 font-bold text-[#0A0A0D]">
                  {f.icon}
                  {f.tag}
                </span>
                <span className="text-[10px] text-gray-400">#0{i + 1}</span>
              </div>

              <h3 className="text-sm font-bold text-[#0A0A0D] mb-2 leading-snug">
                {f.title}
              </h3>

              <p className="text-xs text-[#475569] leading-relaxed mb-6">
                {f.description}
              </p>

              <div className="pt-3 border-t border-gray-200 flex items-baseline justify-between">
                <div>
                  <div className="text-[9px] text-[#64748B] uppercase">{f.metricLabel}</div>
                  <div className="text-lg font-bold text-[#FF5500] font-tabular">{f.metric}</div>
                </div>
                <CheckCircle className="w-4 h-4 text-[#059669]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
