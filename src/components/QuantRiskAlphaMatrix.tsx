import React, { useState } from 'react';
import {
  ShieldAlert,
  Activity,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Trade } from '../types/backtest';
import { calculateQuantRiskProfile, QuantRiskProfile } from '../services/quantMath';

interface QuantRiskAlphaMatrixProps {
  trades: Trade[];
  initialCapital?: number;
  strategyName?: string;
  symbol?: string;
}

export const QuantRiskAlphaMatrix: React.FC<QuantRiskAlphaMatrixProps> = ({
  trades,
  initialCapital = 100000,
  strategyName = 'Strategy',
  symbol = 'NIFTY 50',
}) => {
  const [isTaxDrawerOpen, setIsTaxDrawerOpen] = useState(false);

  const profile: QuantRiskProfile = calculateQuantRiskProfile(trades, initialCapital);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6 select-none font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0A0A0D] flex items-center justify-center text-white shadow-sm">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Quantitative Risk & Alpha Matrix (QRAM)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Institutional Math · {symbol}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-[#0A0A0D] tracking-tight font-sans">
              Factor Exposures, Tail Risk & Net Alpha
            </h3>
          </div>
        </div>

        {/* Quick Alpha / Net Cash Pill */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-right">
            <span className="text-[10px] text-gray-400 uppercase font-bold block">
              Jensen's Alpha (vs Nifty)
            </span>
            <span
              className={`text-base font-bold ${
                profile.jensensAlphaPct >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {profile.jensensAlphaPct >= 0 ? '+' : ''}
              {profile.jensensAlphaPct}%
            </span>
          </div>

          <div className="px-3.5 py-2 bg-emerald-50/70 border border-emerald-200 rounded-xl text-right">
            <span className="text-[10px] text-emerald-700 uppercase font-bold block">
              Post-Tax In-Hand Net
            </span>
            <span className="text-base font-bold text-emerald-900">
              ₹{profile.netInHandCashRs.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: 4 Core Quant Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Pillar 1: Systematic Alpha & Beta */}
        <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200 space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-gray-200">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              1. Alpha & Beta Dynamics
            </span>
            <span className="text-[10px] font-bold text-black">CAPM</span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-[11px]">Jensen's Alpha (α):</span>
              <span className="font-bold text-black">
                {profile.jensensAlphaPct >= 0 ? '+' : ''}
                {profile.jensensAlphaPct}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-[11px]">Systematic Beta (β):</span>
              <span className="font-bold text-black">{profile.marketBeta}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-[11px]">Information Ratio:</span>
              <span className="font-bold text-black">{profile.informationRatio}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-[11px]">Strategy CAGR:</span>
              <span className="font-bold text-emerald-600">+{profile.cagrPct}%</span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Downside & Tail Risk (VaR 99) */}
        <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200 space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-gray-200">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              2. Tail Risk & VaR
            </span>
            <span className="text-[10px] font-bold text-rose-600">99% Confidence</span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-[11px]">1-Day VaR (99%):</span>
              <span className="font-bold text-rose-600">-{profile.var99DailyPct}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-[11px]">Expected Shortfall (CVaR):</span>
              <span className="font-bold text-rose-600">-{profile.cvar99ExpectedShortfallPct}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-[11px]">Annualized Vol (σ):</span>
              <span className="font-bold text-black">{profile.annualizedVolatilityPct}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-[11px]">Downside Semi-Dev:</span>
              <span className="font-bold text-black">{profile.downsideDeviationPct}%</span>
            </div>
          </div>
        </div>

        {/* Pillar 3: Risk-Adjusted Ratios (vs 6.5% G-Sec) */}
        <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200 space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-gray-200">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              3. Institutional Ratios
            </span>
            <span className="text-[10px] font-bold text-emerald-700">6.5% G-Sec Rf</span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-[11px]">Annualized Sharpe:</span>
              <span className="font-bold text-black">{profile.sharpeRatio}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-[11px]">Sortino (Downside):</span>
              <span className="font-bold text-emerald-600">{profile.sortinoRatio}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-[11px]">Calmar (CAGR/MDD):</span>
              <span className="font-bold text-black">{profile.calmarRatio}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-[11px]">Omega Ratio:</span>
              <span className="font-bold text-black">{profile.omegaRatio}</span>
            </div>
          </div>
        </div>

        {/* Pillar 4: Kelly Criterion & Money Sizing */}
        <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200 space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-gray-200">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              4. Capital Sizing & Ruin
            </span>
            <span className="text-[10px] font-bold text-blue-600">Kelly Law</span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-[11px]">Full Kelly Fraction (f*):</span>
              <span className="font-bold text-black">{profile.fullKellyFractionPct}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-[11px]">Rec. Half-Kelly (50%):</span>
              <span className="font-bold text-emerald-600">
                {profile.halfKellyRecommendedPct}% RPT
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-[11px]">Risk of Ruin (30% DD):</span>
              <span
                className={`font-bold ${
                  profile.riskOfRuinPct > 10 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {profile.riskOfRuinPct}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-[11px]">Edge Expectancy:</span>
              <span className="font-bold text-black">
                ₹{Math.round(profile.grossProfitRs / Math.max(1, trades.length))} / fill
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Section: Indian Tax & Statutory Friction Audit */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div
          onClick={() => setIsTaxDrawerOpen(!isTaxDrawerOpen)}
          className="p-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-[#0A0A0D]">
              Indian Tax & Statutory Friction Audit (Sec 111A STCG 20%, STT, GST & SEBI Fees)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700">
              Friction Drag: {profile.taxDragPct}%
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 hidden sm:inline">
              Gross: <strong>₹{profile.grossProfitRs.toLocaleString('en-IN')}</strong> ➔ Real Net In-Hand:{' '}
              <strong className="text-emerald-700">
                ₹{profile.netInHandCashRs.toLocaleString('en-IN')}
              </strong>
            </span>
            {isTaxDrawerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {isTaxDrawerOpen && (
          <div className="p-4 bg-white border-t border-gray-200 space-y-4 animate-in fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <span className="text-[10px] text-gray-400 block uppercase">Gross PnL</span>
                <span className="text-sm font-bold text-black">
                  ₹{profile.grossProfitRs.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <span className="text-[10px] text-gray-400 block uppercase">STT (0.05% Turn)</span>
                <span className="text-sm font-bold text-rose-600">
                  -₹{profile.sttChargesRs.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <span className="text-[10px] text-gray-400 block uppercase">NSE + SEBI Fee</span>
                <span className="text-sm font-bold text-rose-600">
                  -₹{profile.exchangeAndSebiRs.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <span className="text-[10px] text-gray-400 block uppercase">Stamp Duty</span>
                <span className="text-sm font-bold text-rose-600">
                  -₹{profile.stampDutyRs.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <span className="text-[10px] text-gray-400 block uppercase">18% GST on Brok.</span>
                <span className="text-sm font-bold text-rose-600">
                  -₹{profile.gstOnBrokerageRs.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-800 block uppercase font-bold">
                  20% STCG Tax (Sec 111A)
                </span>
                <span className="text-sm font-bold text-emerald-950">
                  -₹{profile.stcgTaxRs.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 font-sans leading-relaxed">
              * Statutory deductions reflect current Indian Income Tax Act 1961 (Budget 2024 Section 111A
              Short Term Capital Gains @ 20%), Securities Transaction Tax (STT) circulars, SEBI turnover
              levy (₹10/crore), state stamp duty regulations, and 18% GST on brokerage. Quants optimize
              holding period to minimize turnover tax drag.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
