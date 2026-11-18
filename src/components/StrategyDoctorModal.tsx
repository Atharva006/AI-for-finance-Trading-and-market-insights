import React, { useMemo, useState, useEffect } from 'react';
import {
  ShieldAlert,
  Activity,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Sparkles,
  BarChart3,
  Flame,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { Trade } from '../types/backtest';
import {
  calculateMonteCarloSimulation,
  calculateInstitutionalRiskMetrics,
  generateAIDiagnostics,
} from '../services/strategyDoctor';
import { groqAuditStrategy } from '../services/groqApi';
import { AIDiagnosticPrescription } from '../types/marketPulse';

interface StrategyDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  trades: Trade[];
  initialCapital?: number;
  strategyName?: string;
  symbol?: string;
}

export const StrategyDoctorModal: React.FC<StrategyDoctorModalProps> = ({
  isOpen,
  onClose,
  trades,
  initialCapital = 100000,
  strategyName = 'Strategy',
  symbol = 'NIFTY',
}) => {
  const [aiPrescriptions, setAiPrescriptions] = useState<AIDiagnosticPrescription[] | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const monteCarlo = useMemo(() => {
    return calculateMonteCarloSimulation(trades, initialCapital, 500);
  }, [trades, initialCapital]);

  const metrics = useMemo(() => {
    return calculateInstitutionalRiskMetrics(trades, initialCapital, 0.065);
  }, [trades, initialCapital]);

  const fallbackDiagnostics = useMemo(() => {
    return generateAIDiagnostics(trades, metrics, monteCarlo);
  }, [trades, metrics, monteCarlo]);

  const runGroqAudit = async () => {
    if (trades.length === 0) return;
    setIsAiLoading(true);
    try {
      const res = await groqAuditStrategy(trades, metrics, monteCarlo, symbol);
      setAiPrescriptions(res);
    } catch (err) {
      console.warn('Groq audit fallback:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && trades.length > 0 && !aiPrescriptions) {
      runGroqAudit();
    }
  }, [isOpen, trades]);

  const diagnostics = aiPrescriptions || fallbackDiagnostics;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 p-6 space-y-6 animate-in fade-in duration-200 select-none">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0A0A0D] flex items-center justify-center text-emerald-400 shadow-md">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                  Hedge-Fund Quantitative Audit
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  500 Monte Carlo Iterations
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-[#0A0A0D] tracking-tight">
                AI Strategy Doctor · {symbol}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Monte Carlo Drawdown Simulation */}
        <div className="bg-[#FAFAFC] p-5 rounded-2xl border border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black">
                Monte Carlo 500-Run Drawdown Simulation
              </h3>
            </div>
            <span className="text-[11px] text-gray-500 font-mono">
              Resampling trade sequence with replacement
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-xl border border-gray-200">
              <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block">
                Median Drawdown
              </span>
              <span className="text-lg font-bold font-mono text-black mt-0.5 block">
                -{monteCarlo.medianDrawdownPct}%
              </span>
              <span className="text-[10px] text-gray-500 font-mono">50th percentile</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-200">
              <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block">
                90% Confidence DD
              </span>
              <span className="text-lg font-bold font-mono text-rose-600 mt-0.5 block">
                -{monteCarlo.percentile90DrawdownPct}%
              </span>
              <span className="text-[10px] text-gray-500 font-mono">90th percentile</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-200">
              <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block">
                95% Worst-Case DD
              </span>
              <span className="text-lg font-bold font-mono text-rose-700 mt-0.5 block">
                -{monteCarlo.percentile95DrawdownPct}%
              </span>
              <span className="text-[10px] text-gray-500 font-mono">95th percentile risk</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-200">
              <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block">
                Severe DD Risk
              </span>
              <span
                className={`text-lg font-bold font-mono mt-0.5 block ${
                  monteCarlo.riskOfSevereDDPct > 15 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {monteCarlo.riskOfSevereDDPct}%
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Prob(DD &gt; 12%)</span>
            </div>
          </div>

          {/* Mini Simulated Equity Ribbon Visual */}
          <div className="relative h-20 w-full bg-white rounded-xl border border-gray-200 p-2 overflow-hidden flex items-end">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              {monteCarlo.simulatedPaths.map((path, idx) => {
                const min = Math.min(...path.curve);
                const max = Math.max(...path.curve);
                const range = max - min || 1;
                const points = path.curve
                  .map((val, i) => {
                    const x = (i / (path.curve.length - 1)) * 100;
                    const y = 100 - ((val - min) / range) * 85 - 5;
                    return `${x},${y}`;
                  })
                  .join(' ');
                return (
                  <polyline
                    key={idx}
                    fill="none"
                    stroke={idx === 0 ? '#10B981' : '#CBD5E1'}
                    strokeWidth={idx === 0 ? '2' : '1'}
                    strokeOpacity={idx === 0 ? '1' : '0.6'}
                    points={points}
                  />
                );
              })}
            </svg>
            <div className="absolute top-2 left-3 text-[10px] font-mono text-gray-400">
              <span>Simulated 500 Bootstrap Trajectories</span>
            </div>
          </div>
        </div>

        {/* Section 2: Institutional Risk-Adjusted Metrics */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black">
              Institutional Risk Ratios (vs 6.5% G-Sec)
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">
                Sharpe Ratio
              </span>
              <span className="text-xl font-bold text-black mt-1 block">
                {metrics.annualizedSharpeRatio}
              </span>
              <span className="text-[10px] text-gray-500">
                {metrics.annualizedSharpeRatio >= 1.0 ? 'Strong' : 'Marginal'} (vs 6.5% Rf)
              </span>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">
                Sortino Ratio
              </span>
              <span className="text-xl font-bold text-emerald-600 mt-1 block">
                {metrics.sortinoRatio}
              </span>
              <span className="text-[10px] text-gray-500">Downside deviation</span>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">
                Calmar Ratio
              </span>
              <span className="text-xl font-bold text-black mt-1 block">
                {metrics.calmarRatio}
              </span>
              <span className="text-[10px] text-gray-500">CAGR / Max DD</span>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">
                Expectancy / Trade
              </span>
              <span
                className={`text-xl font-bold mt-1 block ${
                  metrics.expectancyPerTradeRs >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {metrics.expectancyPerTradeRs >= 0 ? '+' : ''}₹{metrics.expectancyPerTradeRs}
              </span>
              <span className="text-[10px] text-gray-500">Net edge per fill</span>
            </div>
          </div>
        </div>

        {/* Section 3: AI Trade Leak Prescriptions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black">
                AI Strategy Doctor Prescriptions ({diagnostics.length})
              </h3>
            </div>
            <button
              onClick={runGroqAudit}
              disabled={isAiLoading || trades.length === 0}
              className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[11px] font-mono text-gray-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isAiLoading ? 'animate-spin text-emerald-600' : 'text-gray-500'}`} />
              <span>{isAiLoading ? 'Auditing with AI...' : 'Re-Audit with AI Engine'}</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {diagnostics.map((rx, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                        rx.severity === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : rx.severity === 'MEDIUM'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {rx.category} · {rx.severity}
                    </span>
                    <h4 className="text-xs font-bold text-[#0A0A0D]">{rx.title}</h4>
                  </div>
                </div>
                <p className="text-xs text-gray-600 font-sans leading-relaxed">{rx.observation}</p>
                <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-[11px] font-mono text-gray-800">
                    <strong className="text-black">Prescription:</strong> {rx.remedy}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#0A0A0D] text-white hover:bg-neutral-800 rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            Apply & Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
