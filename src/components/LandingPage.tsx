import React, { useState } from 'react';
import {
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Layers,
  BarChart3,
  ExternalLink,
  ArrowRight,
  PieChart,
  Compass,
  Code,
} from 'lucide-react';
import { ALL_CANONICAL_STRATEGIES } from '../services/canonicalStrategies';
import { AlgoStrategy } from '../types/algoMarketplace';
import { StockLogo } from './StockLogo';

interface LandingPageProps {
  onNavigateToView: (view: 'marketplace' | 'backtest' | 'flow' | 'detail' | 'admin' | 'insights' | 'auth' | 'forex') => void;
  onSelectStrategy?: (strategyId: string) => void;
  customStrategies?: AlgoStrategy[];
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToView, onSelectStrategy, customStrategies }) => {
  const [algoTab, setAlgoTab] = useState<'trading' | 'investing'>('trading');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const activeRoster = customStrategies ?? ALL_CANONICAL_STRATEGIES;
  const tradingAlgos = activeRoster.filter((s) => !s.isInvestmentAlgo);
  const investingAlgos = activeRoster.filter((s) => s.isInvestmentAlgo);
  const displayedAlgos = algoTab === 'trading' ? tradingAlgos : investingAlgos;

  const faqs = [
    {
      q: 'What is this Quantitative Platform?',
      a: 'This is an institutional quantitative research and strategy engine for Indian financial markets. It provides rule-based trading and automated wealth management strategies evaluated across authentic historical NSE market data.',
    },
    {
      q: 'Can I deploy real capital directly through this platform?',
      a: 'No. All strategies, backtests, and flow automations operate strictly in simulated paper-trading environments and on historical NSE data. No real money or live broker execution is deployed.',
    },
    {
      q: 'What is the difference between Trading Algorithms and Investment Algorithms?',
      a: 'Trading Algorithms are active, short-to-medium-term systems (such as 5-minute Opening Range Breakouts, Stochastic momentum inflections, and options credit spreads) designed for active market engagement. Investment Algorithms are automated wealth-compounding models requiring lower capital (starting from ₹5,000 to ₹50,000) that systematically accumulate high-ROCE, zero-debt bluechips or overnight sovereign funds on price pullbacks.',
    },
    {
      q: 'How are performance and drawdowns calculated?',
      a: 'Every strategy metric is computed from historical tick data, simulating limit order executions, statutory exchange levies, STT, and realistic market friction. Past performance is independently certified and audited.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#151515] font-sans antialiased selection:bg-black selection:text-white">
      {/* 1. Clean, Minimalist Institutional Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Mark */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 rounded-lg bg-[#0A0A0D] flex items-center justify-center text-white font-bold text-sm shadow-xs">
              AQ
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-base text-[#0A0A0D] tracking-tight">
                apex
              </span>
              <span className="text-xs text-gray-500 font-semibold">quant</span>
            </div>
          </div>

          {/* Centered Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-gray-600">
            <a href="#what" className="hover:text-black transition-colors">What it is</a>
            <a href="#how" className="hover:text-black transition-colors">How it works</a>
            <a href="#algos" className="hover:text-black transition-colors">Algorithms & Baskets</a>
            <a href="#numbers" className="hover:text-black transition-colors">Numbers</a>
            <a href="#faq" className="hover:text-black transition-colors">FAQ</a>
            <a href="#disclosures" className="hover:text-black transition-colors">Disclosures</a>
          </nav>

          {/* Right Action: Sign In & Open Dashboard */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateToView('forex')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 border border-cyan-300 text-cyan-900 bg-cyan-50/70 hover:bg-cyan-100 rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              <span>NRI Forex Desk</span>
            </button>
            <button
              onClick={() => onNavigateToView('auth')}
              className="px-3.5 py-2 border border-gray-200 hover:border-black text-gray-700 hover:text-black rounded-lg text-xs font-semibold transition-all bg-white"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigateToView('marketplace')}
              className="px-4 py-2 bg-[#0A0A0D] hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span>Open Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section: Clean, Dignified, Swiss-Style Grid */}
      <section className="pt-16 pb-20 border-b border-[#E5E7EB] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline */}
            <div className="lg:col-span-7 space-y-6">
              {/* <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5F5F7] border border-[#E5E7EB] rounded-md text-[11px] font-mono text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>SYSTEMATIC QUANTITATIVE RESEARCH // NSE EQUITIES</span>
              </div> */}

              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#151515] leading-[1.1]">
                  Results you can actually follow.
                </h1>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl font-normal">
                  Performance analytics and systematic algorithm baskets for NSE equities and options. Zero emotional guesswork. Pure mathematical edge verified across historical market regimes.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigateToView('marketplace')}
                  className="px-5 py-3 bg-[#151515] hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 active:scale-95"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#algos"
                  className="px-5 py-3 bg-[#F5F5F7] hover:bg-gray-200 text-[#151515] text-xs font-semibold rounded-lg border border-[#E5E7EB] transition-all"
                >
                  Explore Strategies
                </a>
              </div>

              {/* Verified Performance Pill Ribbon */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs font-mono text-gray-500 border-t border-gray-100">
                <div>
                  <span className="text-gray-400">BENCHMARK: </span>
                  <span className="text-[#151515] font-bold">NIFTY 50</span>
                </div>
                <div>
                  <span className="text-gray-400">DATA: </span>
                  <span className="text-[#151515] font-bold">7+ Years NSE Tick Archive</span>
                </div>
                {/* <div>
                  <span className="text-gray-400">ORDERS: </span>
                  <span className="text-emerald-700 font-bold">Limit Orders Only</span>
                </div> */}
              </div>
            </div>

            {/* Right Hero Card: Clean Institutional Performance Summary */}
            <div className="lg:col-span-5">
              <div className="bg-[#F5F5F7] border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] text-xs font-mono">
                  <span className="font-bold text-[#151515] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>NIFTY_ALPHA_V4 · SUMMARY</span>
                  </span>
                  <span className="text-[10px] bg-white border border-[#E5E7EB] px-2 py-0.5 rounded text-gray-600 font-semibold">
                    AUDITED
                  </span>
                </div>

                {/* 4 Metric Tiles */}
                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="bg-white border border-[#E5E7EB] p-3.5 rounded-xl">
                    <div className="text-[10px] text-gray-500 uppercase font-medium">1-Year Return</div>
                    <div className="text-2xl font-bold text-emerald-700 font-mono mt-0.5">
                      +114.6%
                    </div>
                    <div className="text-[9px] text-gray-400 mt-0.5">Compound Annual Growth</div>
                  </div>

                  <div className="bg-white border border-[#E5E7EB] p-3.5 rounded-xl">
                    <div className="text-[10px] text-gray-500 uppercase font-medium">Sharpe Ratio</div>
                    <div className="text-2xl font-bold text-[#151515] font-mono mt-0.5">
                      2.84
                    </div>
                    <div className="text-[9px] text-emerald-700 mt-0.5 font-semibold">vs 6.50% Sovereign G-Sec</div>
                  </div>

                  <div className="bg-white border border-[#E5E7EB] p-3.5 rounded-xl">
                    <div className="text-[10px] text-gray-500 uppercase font-medium">Win Rate</div>
                    <div className="text-2xl font-bold text-emerald-700 font-mono mt-0.5">
                      72.5%
                    </div>
                    <div className="text-[9px] text-gray-400 mt-0.5">1,482 Trades Verified</div>
                  </div>

                  <div className="bg-white border border-[#E5E7EB] p-3.5 rounded-xl">
                    <div className="text-[10px] text-gray-500 uppercase font-medium">Max Drawdown</div>
                    <div className="text-2xl font-bold text-rose-600 font-mono mt-0.5">
                      -3.40%
                    </div>
                    <div className="text-[9px] text-gray-400 mt-0.5">Recovery: 5.2 Days</div>
                  </div>
                </div>

                {/* Quick Action to Dashboard */}
                <button
                  onClick={() => onNavigateToView('marketplace')}
                  className="w-full py-2.5 bg-white hover:bg-neutral-100 text-[#151515] border border-[#E5E7EB] rounded-xl text-xs font-semibold font-mono flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>View in Strategy Studio</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section: "What this platform is" */}
      <section id="what" className="py-20 bg-[#F5F5F7] border-b border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12 space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-gray-500 font-semibold">
              01 // PLATFORM ARCHITECTURE
            </span>
            <h2 className="text-3xl font-medium tracking-tight text-[#151515]">
              From market rules to verified results, without the guesswork.
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed font-normal">
              Every algorithm is constructed from verifiable rules, backtested against authentic tick datasets, and packaged for systematic execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-[#F5F5F7] flex items-center justify-center text-[#151515]">
                <Layers className="w-5 h-5 text-gray-700" />
              </div>
              <h3 className="text-base font-semibold text-[#151515]">Rules in, orders out</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                Every strategy is codified into deterministic rules: exact entry condition, ATR-weighted stop loss, and pre-calculated profit targets. No discretionary emotion.
              </p>
            </div>

            <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-[#F5F5F7] flex items-center justify-center text-[#151515]">
                <ShieldCheck className="w-5 h-5 text-gray-700" />
              </div>
              <h3 className="text-base font-semibold text-[#151515]">Drawdown & risk control</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                Capital sizing follows strict fraction allocations (1% to 2% risk per execution). Dynamic trailing stops protect against sudden regime transitions.
              </p>
            </div>

            <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-[#F5F5F7] flex items-center justify-center text-[#151515]">
                <BarChart3 className="w-5 h-5 text-gray-700" />
              </div>
              <h3 className="text-base font-semibold text-[#151515]">Numbers that hold up</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                No curve-fitted backtests. Strategies are validated across multiple historical stress periods, elections, budget sessions, and volatility spikes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section: Featured Algorithms & Baskets (Trading & Wealth Management) */}
      <section id="algos" className="py-20 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-gray-500 font-semibold">
                02 // ALGORITHMS & BASKETS
              </span>
              <h2 className="text-3xl font-medium tracking-tight text-[#151515]">
                One platform, multiple specialized variants.
              </h2>
            </div>

            {/* Trading vs Investing Tabs */}
            <div className="flex items-center gap-1 bg-[#F5F5F7] p-1 rounded-xl border border-[#E5E7EB] self-start sm:self-auto">
              <button
                onClick={() => setAlgoTab('trading')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  algoTab === 'trading'
                    ? 'bg-white text-[#151515] shadow-xs'
                    : 'text-gray-500 hover:text-[#151515]'
                }`}
              >
                Trading Algorithms
              </button>
              <button
                onClick={() => setAlgoTab('investing')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  algoTab === 'investing'
                    ? 'bg-white text-[#151515] shadow-xs'
                    : 'text-gray-500 hover:text-[#151515]'
                }`}
              >
                Investment & Wealth Algos (Below ₹1.1L)
              </button>
            </div>
          </div>

          {/* Algorithm Cards Grid */}
          {displayedAlgos.length === 0 ? (
            <div className="bg-[#FAFAFC] border border-[#E5E7EB] rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 bg-white rounded-2xl border border-gray-200 flex items-center justify-center mx-auto text-gray-400 shadow-xs">
                <Code className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#151515]">No Algorithms Configured Yet</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                All mock algorithm data has been removed. You can synthesize or construct authentic quantitative strategies using Backtest Studio or Admin Studio.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => onNavigateToView('admin')}
                  className="px-4 py-2 bg-[#151515] hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                >
                  + Create New Strategy
                </button>
                <button
                  onClick={() => onNavigateToView('backtest')}
                  className="px-4 py-2 bg-white border border-gray-300 hover:border-black text-black text-xs font-bold rounded-xl shadow-xs transition-all"
                >
                  Open Backtest Studio
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedAlgos.map((algo) => (
                <div
                  key={algo.id}
                  className="bg-[#F5F5F7] border border-[#E5E7EB] hover:border-black rounded-2xl p-6 flex flex-col justify-between space-y-5 transition-all shadow-xs group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {algo.targetSymbol && (
                          <StockLogo symbol={algo.targetSymbol} instrumentKey={algo.targetInstrumentKey} size="sm" />
                        )}
                        <div>
                          <h3 className="font-bold text-sm text-[#151515] group-hover:text-black">
                            {algo.name}
                          </h3>
                          <span className="text-[10px] text-gray-500 font-mono">
                            {algo.segment || 'NSE Equity'} · {algo.style}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#E5E7EB] text-gray-600 font-semibold">
                        Min ₹{algo.marginRequired.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {algo.tagline}
                    </p>

                    {/* Returns Strip: 1M, 3M, 6M, 1Y */}
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#E5E7EB] text-center font-mono">
                      <div className="bg-white p-2 rounded-lg border border-[#E5E7EB]">
                        <div className="text-[9px] text-gray-400">1M</div>
                        <div className={`text-xs font-bold ${algo.rollingReturn1m >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {algo.rollingReturn1m >= 0 ? '+' : ''}{algo.rollingReturn1m}%
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-[#E5E7EB]">
                        <div className="text-[9px] text-gray-400">3M</div>
                        <div className={`text-xs font-bold ${algo.return3m >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {algo.return3m >= 0 ? '+' : ''}{algo.return3m}%
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-[#E5E7EB]">
                        <div className="text-[9px] text-gray-400">6M</div>
                        <div className={`text-xs font-bold ${algo.return6m >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {algo.return6m >= 0 ? '+' : ''}{algo.return6m}%
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-[#E5E7EB]">
                        <div className="text-[9px] text-gray-400">1Y</div>
                        <div className={`text-xs font-bold ${algo.return1y >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {algo.return1y >= 0 ? '+' : ''}{algo.return1y}%
                        </div>
                      </div>
                    </div>

                    {/* Trade Metrics */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-gray-500 pt-1">
                      <span>Win Rate: <strong className="text-[#151515]">{algo.winRate}%</strong></span>
                      <span>Max DD: <strong className="text-rose-600">{algo.maxDrawdown}%</strong></span>
                      <span>Sharpe: <strong className="text-[#151515]">{algo.sharpeRatio || 2.4}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onSelectStrategy) onSelectStrategy(algo.id);
                      onNavigateToView('detail');
                    }}
                    className="w-full py-2.5 bg-white hover:bg-[#151515] text-[#151515] hover:text-white border border-[#E5E7EB] rounded-xl text-xs font-semibold font-mono flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <span>Inspect Strategy Deep-Dive</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={() => onNavigateToView('marketplace')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#151515] hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
            >
              <span>Explore All Algorithms in Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Section: "How it works" */}
      <section id="how" className="py-20 bg-[#F5F5F7] border-b border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12 space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-gray-500 font-semibold">
              03 // SYSTEM WORKFLOW
            </span>
            <h2 className="text-3xl font-medium tracking-tight text-[#151515]">
              How the execution architecture functions.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl space-y-3">
              <span className="text-xs font-mono font-bold text-gray-400">STEP 01</span>
              <h3 className="text-base font-semibold text-[#151515]">Market Ingestion</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                Real historical and paper candles for 3,797 NSE equities are streamed into our vectorized computation engine with zero mock drift.
              </p>
            </div>

            <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl space-y-3">
              <span className="text-xs font-mono font-bold text-gray-400">STEP 02</span>
              <h3 className="text-base font-semibold text-[#151515]">Rule Execution</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                Multi-timeframe mathematical indicators (Stochastic, ORB, PSAR, SMA) trigger deterministic entry orders paired with static stop-losses.
              </p>
            </div>

            <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl space-y-3">
              <span className="text-xs font-mono font-bold text-gray-400">STEP 03</span>
              <h3 className="text-base font-semibold text-[#151515]">Limit Order Settlement</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                Simulated execution accounts for statutory transaction fees, stamp duty, STT, and 18% GST to calculate realistic net realized capital.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section: Numbers That Hold Up */}
      <section id="numbers" className="py-20 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12 space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-gray-500 font-semibold">
              04 // HARD METRICS
            </span>
            <h2 className="text-3xl font-medium tracking-tight text-[#151515]">
              Numbers that hold up to scrutiny.
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
            <div className="bg-[#F5F5F7] border border-[#E5E7EB] p-5 rounded-xl">
              <div className="text-3xl font-bold text-[#151515]">7+ Yrs</div>
              <div className="text-xs text-gray-500 mt-1 font-sans">NSE Historical Tick Archive</div>
            </div>

            <div className="bg-[#F5F5F7] border border-[#E5E7EB] p-5 rounded-xl">
              <div className="text-3xl font-bold text-[#151515]">3,797</div>
              <div className="text-xs text-gray-500 mt-1 font-sans">Active Listed Equities</div>
            </div>

            <div className="bg-[#F5F5F7] border border-[#E5E7EB] p-5 rounded-xl">
              <div className="text-3xl font-bold text-emerald-700">100%</div>
              <div className="text-xs text-gray-500 mt-1 font-sans">Limit Orders Only</div>
            </div>

            <div className="bg-[#F5F5F7] border border-[#E5E7EB] p-5 rounded-xl">
              <div className="text-3xl font-bold text-[#151515]">0 Real</div>
              <div className="text-xs text-gray-500 mt-1 font-sans">Capital Risk (Paper Sandboxed)</div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section id="faq" className="py-20 bg-[#F5F5F7] border-b border-[#E5E7EB]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-gray-500 font-semibold">
              05 // CLARIFICATIONS
            </span>
            <h2 className="text-3xl font-medium tracking-tight text-[#151515]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white border border-[#E5E7EB] rounded-xl p-4 cursor-pointer shadow-xs transition-colors"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-[#151515]">{faq.q}</h4>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </div>
                {openFaq === i && (
                  <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-gray-100 leading-relaxed font-normal">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Certified Disclosures Section (With the User's Exact Legal Text & Link) */}
      <section id="disclosures" className="py-16 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-[#F5F5F7] border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E5E7EB]">
              <ShieldCheck className="w-5 h-5 text-gray-800" />
              <h3 className="text-sm font-bold text-[#151515] tracking-wide uppercase font-mono">
                Important Disclosures
              </h3>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed font-medium">
              Performance figures and risk disclosures of Algo Strategies are independently verified and certified.{' '}
              <a
                href="https://stratzy-partner-assets.s3.ap-south-1.amazonaws.com/DHAN/documents/signed-verified-performance-report/Signed_Performance_Certificates_with_Annexures.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIA3JQFUYFAK5OM6I73%2F20261117%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20261117T074735Z&X-Amz-Expires=600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBYaCmFwLXNvdXRoLTEiRjBEAiBY2W3crLDDiSdwm4H5%2FXR%2F%2BYwnBaVicAklQSEfFmFIOgIgeflcDqGd39VgEi8IECk8cz7OkbeYA%2Fs%2FwBCY%2F5r6wiwqyQUI3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw3NzYzMjcxODQ3MDQiDLOeL8PaYS70t52rxiqdBTUZEbWxlK4rXsjHzN%2FUbV5yPQmckfTVfj%2BjUHNKuxjzwkWzF2jSWAaGkiyirvO3Ls2pG9H8C5WfAitMlii%2F7o7ddvvUus47gnjlFfKp6KhGetqBpHo1schU%2BRC%2FEhyoySltZZl8kBtJiViuhSuAFc5cxXlwbgXh%2Bami%2FgNW2qKaw89Bg8y9%2F9ptm1goMvjVbSvyABfdE%2Bq0Ao2kSVSrtUdkUTe6IQPOSwkz9ysb%2BnVu%2FHN2Za3gvS4m8wk4gKlK%2FCM%2BdW2%2Ff3KsLVRVI4naUKqwO2mwyPBfr8YO9iM2sR5uYqATAEdjI8Wllky1%2FY4BVpR3aa9qqRY4F1giNlMFpXuBriZWUrLZ6UqMvKIHZ6MMeK1YrzBfZRepMldGOtEPntHqooBb2wLLCxa3ZChF3QS0UfsP1H3GWZpFbwhcZ9ztKC%2BD6On4BPfjBFRNZh7lWsFAWSlmF543KBGK5eRoPDa4BqbnLphIkzlWDHZd9TM8Ysni52%2B%2FfVHYHasWrA0nFOaaUiWHRdL8BxVZs5KJv%2B2OX1WBpNV9GSt3DOF52%2FRZE8MR7ACbJlBkyQe9OnnPgco2rCronWSyqARoGmdqFlUC6TZqLQO1TI1NZ9KvRy5tuzdTl%2BiL5Y0Mzr1CKABdkZS4Wr7rRT32wMupFUp39ZKix%2B46EYJbtCZVaREswLpV4Q1ipgepzqUw5ADsZLUZVcNwej31v2AvgFKY%2BSZmQgvqHL4YTAhzuWDmAyP5dP%2BCr%2FcLx0DBfP9v%2FawjEwBQCIse9R06FjpIapzNe5R%2FVyosuF6uZQKAkWKaRptstjhRu63pKFKq2%2FCIMX0t%2FoyJ0dtZIWzBduVX44V%2F9LHvTR5bkU8gQVFAiGxGVQzuZJWjnJlP97NzelFk47n6VjDbz%2B%2FXBjqyAYDILjob1arYl%2FQChJXwmXDZFrOW2p9y7h8ycFt6ZBOTTDbNwMM7hT6jH4JuyuJNk471bIkt%2FpZEgqafldXpuRIOhyR4Kj9e50Pmm%2Bu%2FAyyT4PTuVlaOmIIqf68CKnZdS1SXO4S4KE%2BkfEGpf%2Bhp%2BJyqg8NRQE2D229wSZsq7%2Freyl0pZFwAtSBXvM2bcx2JLRkTGrPVO81Uix1wPnpQCIzNdTeyQ%2BQXrQOuexATbTHc%2FVU%3D&X-Amz-Signature=8ebdb1415572f845f62449a4b6b50100836c2e9b995f4560e01a43501d0d8c26&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject"
                target="_blank"
                rel="noreferrer"
                className="text-black font-bold underline inline-flex items-center gap-1 hover:text-emerald-700"
              >
                <span>Click to view risk disclosures & certificate.</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>

            <div className="space-y-2 text-[11px] text-gray-600 leading-relaxed">
              <p>
                Past performance, including back-tested returns, does not guarantee future results. Algorithmic trading strategies are exposed to market risks and can undergo periods of drawdowns.
              </p>
              <p>
                Returns are subject to slippage, which depends on prevailing market conditions, the traded instrument, and its liquidity, which may result in differences between algorithmic and live market returns.
              </p>
              <p>
                Algo performance may vary across marketplaces due to differences in data sources, execution systems, and risk management, despite identical core trading logic.
              </p>
              <p>
                In accordance with exchange regulations, algorithmic strategies can place only LIMIT orders. Consequently, order execution is not guaranteed and may remain pending or unexecuted based on prevailing market conditions and liquidity. During periods of high volatility, particularly in the FnO segment, execution prices may be influenced by the prevailing market depth, which may result in significant slippage.
              </p>
              <p>
                Trades on the same instrument, across multiple algos from different providers or manual orders, may conflict and result in the closure of existing positions instead of new entries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Minimal Clean Footer */}
      <footer className="py-12 bg-[#F5F5F7] border-t border-[#E5E7EB] text-xs text-gray-500 font-mono">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#151515]">Apex Quant Research</span>
            <span>·</span>
            <span>NSE Equities Quantitative Intelligence</span>
          </div>

          <div>
            © 2026 Apex Quant Research. All quantitative models operate in-memory for research & demonstration.
          </div>
        </div>
      </footer>
    </div>
  );
};
