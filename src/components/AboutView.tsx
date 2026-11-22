import React from 'react';
import {
  ShieldCheck,
  Award,
  TrendingUp,
  Cpu,
  Target,
  CheckCircle2,
  BarChart2,
  Compass,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface AboutViewProps {
  onNavigateTo?: (view: any) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigateTo }) => {
  const verifiedChallenges = [
    {
      firm: 'FundingPips',
      type: '2-Phase & 1-Step Evaluation',
      status: 'Passed & Verified',
      edge: 'Asia-London Session FVG Liquidity Inversion',
      rulesEnforced: '4% Daily Drawdown · 6% Max DD · 0.5% Risk/Trade',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      firm: 'The 5%ers',
      type: 'High Stakes & Bootcamp Challenges',
      status: 'Passed & Verified',
      edge: 'Statistical Mean Reversion & Order Flow Sweeps',
      rulesEnforced: 'Strict 5% Max Trailing Drawdown · Zero Overnight Gambling',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      firm: 'QT Funded / FTMO Standard',
      type: 'Standard 2-Step Evaluation',
      status: 'Passed & Verified',
      edge: 'Systematic Macro Breakout & ATR Volatility Targeting',
      rulesEnforced: '5% Daily Drawdown · 10% Max DD · R:R >= 1:2',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6 font-sans space-y-8 animate-fade-in select-none">
      {/* ── Hero Profile Card ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E2E8F0] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-100/40 via-blue-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#021810] border-2 border-[#10B981]/50 flex items-center justify-center p-2 shadow-md shrink-0">
              <img src="/alltra-logo.png" alt="Alltra Quant" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>SYSTEMATIC PROP TRADER &amp; RESEARCHER</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                Atharva · Quantitative Finance Practitioner
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] font-mono">
                Systematic Trading Models · Algorithmic Strategy Engineering · Risk Management
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-[#F1F5F9] border border-[#CBD5E1] text-[#334155] font-mono text-xs font-bold">
              10+ Challenges Passed
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs font-bold">
              100% Algorithmic
            </span>
          </div>
        </div>
      </div>

      {/* ── Professional Bio & Philosophy ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-[#0F172A] font-bold text-base">
            <Target className="w-5 h-5 text-[#2563EB]" />
            <h2>Background &amp; Quantitative Focus</h2>
          </div>
          <div className="text-xs sm:text-sm text-[#475569] leading-relaxed space-y-3">
            <p>
              I am a quantitative finance practitioner currently studying and building systematic trading models. My focus centers on statistical arbitrage, algorithmic order execution, and automated liquidity sweep systems across equities, indices, and currency pairs.
            </p>
            <p>
              Rather than relying on discretionary intuition or gambling on market news, all trading strategies are developed through rigorous mathematical backtesting, walk-forward analysis, zero-lookahead simulations, and strict risk parameters.
            </p>
            <p>
              Through systematic execution and strict risk management, I have passed over <strong>10+ Global Prop Firm Evaluations</strong>—including <strong>FundingPips</strong>, <strong>The 5%ers</strong>, and <strong>QT Funded / FTMO</strong>. The platform you are using—<strong>ALLTRA</strong>—was built to embody these exact institutional standards.
            </p>
          </div>
        </div>

        <div className="bg-[#0F172A] text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold tracking-tight">The Core Philosophy</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              "Markets are non-stationary auctions driven by liquidity cascades. Alpha is not about predicting tomorrow's headlines—it is engineered through strict mathematical expectancy, zero emotional discretion, and ruthless risk containment."
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2 text-xs font-mono text-slate-400">
            <div>• Zero Dollar Flexing</div>
            <div>• Strict Capital Preservation</div>
            <div>• Verifiable Algorithmic Discipline</div>
          </div>
        </div>
      </div>

      {/* ── Verified Prop Firm Evaluations Matrix ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#16A34A] uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Verifiable Track Record</span>
            </div>
            <h2 className="text-xl font-extrabold text-[#0F172A]">
              10+ Global Prop Firm Challenges Passed
            </h2>
          </div>
          <span className="text-xs text-[#64748B] font-mono">
            Evaluated under institutional drawdown conditions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {verifiedChallenges.map((challenge, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-[#E2E8F0] bg-[#FAFAFC] hover:border-[#CBD5E1] transition-all space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-[#0F172A]">{challenge.firm}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${challenge.badgeColor}`}>
                  {challenge.status}
                </span>
              </div>

              <div className="text-xs text-[#64748B]">
                <div className="font-semibold text-[#334155]">{challenge.type}</div>
                <div className="mt-1 font-mono text-[11px] text-[#2563EB]">
                  {challenge.edge}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[11px] font-mono text-[#475569]">
                <div className="font-semibold text-[#0F172A] mb-0.5">Rules Enforced:</div>
                <div>{challenge.rulesEnforced}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Call to Action ── */}
      {onNavigateTo && (
        <div className="bg-gradient-to-r from-[#1E40AF] to-[#2563EB] rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold">Ready to test systematic strategies?</h3>
            <p className="text-xs text-blue-100 max-w-xl">
              Launch the Bar Replay Studio to test historical setups candle-by-candle with zero lookahead bias, or test execution in the NRI &amp; Global Forex Desk.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTo('barreplay')}
              className="px-4 py-2.5 rounded-xl bg-white text-[#1E40AF] font-bold text-xs hover:bg-blue-50 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              Launch Bar Replay
            </button>
            <button
              onClick={() => onNavigateTo('forex')}
              className="px-4 py-2.5 rounded-xl bg-blue-900/40 border border-white/20 text-white font-bold text-xs hover:bg-blue-900/60 transition-all cursor-pointer active:scale-95"
            >
              Forex Desk
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
