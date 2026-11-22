import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  TrendingUp,
  Target,
  CheckCircle2,
  Compass,
  ArrowRight,
  ExternalLink,
  Flame,
  Check,
  Play,
  Maximize2,
  X,
  FileCheck,
  Sparkles,
  BarChart,
  Percent,
} from 'lucide-react';

interface AboutViewProps {
  onNavigateTo?: (view: any) => void;
}

interface TestimonialCard {
  id: string;
  category: 'Prop Firm Certifications' | 'Competition & Awards' | 'Execution Excellence';
  firm: string;
  title: string;
  date: string;
  stage: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  tags: string[];
  metrics: { label: string; value: string }[];
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigateTo }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'fundingpips' | '5ers'>('all');
  const [selectedPreview, setSelectedPreview] = useState<TestimonialCard | null>(null);

  const testimonials: TestimonialCard[] = [
    {
      id: '5ers-funded',
      category: 'Prop Firm Certifications',
      firm: 'The 5%ers',
      title: 'Officially Funded Trader — High Stakes 5K',
      date: 'February 27, 2026',
      stage: 'Funded Live Account',
      description:
        'Awarded official funded status under The 5%ers High Stakes program upon flawless execution of risk rules, trailing drawdown limits, and target profit factor.',
      imageUrl: '/testimonials/5ers-funded-trader-5k.png',
      videoUrl: '/testimonials/5ers-funded-trader.mp4',
      tags: ['High Stakes', 'Funded Account', 'Zero Drawdown Breach'],
      metrics: [
        { label: 'Evaluation Type', value: 'High Stakes 5K' },
        { label: 'Firm', value: 'The 5%ers (Since 2016)' },
        { label: 'Status', value: 'Active Live Allocation' },
      ],
    },
    {
      id: '5ers-contest-top10',
      category: 'Competition & Awards',
      firm: 'The 5%ers',
      title: 'Contest Top 10 — Global Trading Arena',
      date: 'October 28, 2026',
      stage: 'The5ers X Naveen Global Competition',
      description:
        'Finished in the Top 10 globally among thousands of participating international traders in The 5%ers competitive trading arena, demonstrating statistical consistency and strict risk management.',
      imageUrl: '/testimonials/5ers-contest-top-10.png',
      tags: ['Top 10 Global', 'International Contest', 'Disciplined R:R'],
      metrics: [
        { label: 'Standing', value: 'Top 10 Worldwide' },
        { label: 'Event', value: 'The5ers X Naveen' },
        { label: 'Discipline', value: 'Strict Drawdown Control' },
      ],
    },
    {
      id: '5ers-fantastic-rrr',
      category: 'Execution Excellence',
      firm: 'The 5%ers',
      title: 'Fantastic RRR — EUR/USD Institutional Execution',
      date: 'June 19, 2026',
      stage: 'Execution Quality Award',
      description:
        'Honored with the "Fantastic RRR" institutional execution badge on EUR/USD for adhering to high reward-to-risk setups with razor-thin stop placement and zero emotional slippage.',
      imageUrl: '/testimonials/5ers-fantastic-rrr.png',
      tags: ['EUR/USD', 'Asymmetric R:R', 'Institutional Precision'],
      metrics: [
        { label: 'Instrument', value: 'EUR/USD Forex' },
        { label: 'Recognition', value: 'Exceptional Risk:Reward' },
        { label: 'Style', value: 'Liquidity Inversion Sweeps' },
      ],
    },
    {
      id: '5ers-quality-trade-score-90',
      category: 'Execution Excellence',
      firm: 'The 5%ers',
      title: 'Quality Trade Score 90+ — Statistical Precision',
      date: 'June 19, 2026',
      stage: 'Audit Score Milestone',
      description:
        'Awarded the elite 90+ Quality Trade Score badge by proprietary evaluation algorithms, recognizing disciplined trade sizing, entry precision, and flawless trade thesis execution.',
      imageUrl: '/testimonials/5ers-quality-trade-score90.png',
      tags: ['Score 90+', 'Algorithm Audited', 'Purity of Execution'],
      metrics: [
        { label: 'Score Level', value: '90+ Out of 100' },
        { label: 'Instrument', value: 'EUR/USD' },
        { label: 'Audit Method', value: 'Prop Firm Algorithmic Grading' },
      ],
    },
    {
      id: 'fp-phase2-mar2026',
      category: 'Prop Firm Certifications',
      firm: 'FundingPips',
      title: 'Phase Two Evaluation Certificate of Achievement',
      date: 'March 16, 2026',
      stage: 'Phase 2 Cleared (Final Stage)',
      description:
        'Successfully passed Phase 2 of the FundingPips evaluation stage, meeting rigorous 5% maximum overall trailing drawdown and 4% daily drawdown criteria with zero rule violations.',
      imageUrl: '/testimonials/fundingpips-phase2-mar2026.jpg',
      tags: ['Phase Two Passed', 'Target Achieved', 'Zero Daily Breach'],
      metrics: [
        { label: 'Stage', value: 'Phase Two Completed' },
        { label: 'Date', value: 'March 16, 2026' },
        { label: 'Verification', value: 'QR Cryptographic Code' },
      ],
    },
    {
      id: 'fp-phase1-mar2026',
      category: 'Prop Firm Certifications',
      firm: 'FundingPips',
      title: 'Phase One Evaluation Certificate of Achievement',
      date: 'March 11, 2026',
      stage: 'Phase 1 Cleared',
      description:
        'Completed Phase 1 of the FundingPips challenge in just 5 trading days through systematic Asian liquidity sweeps and London session continuation entries.',
      imageUrl: '/testimonials/fundingpips-phase1-mar2026.jpg',
      tags: ['Phase One Cleared', 'Rapid Completion', 'Systematic Execution'],
      metrics: [
        { label: 'Stage', value: 'Phase One Completed' },
        { label: 'Date', value: 'March 11, 2026' },
        { label: 'Verification', value: 'Holographic QR Verified' },
      ],
    },
    {
      id: 'fp-phase1-feb2026',
      category: 'Prop Firm Certifications',
      firm: 'FundingPips',
      title: 'Phase One Evaluation Certificate of Achievement',
      date: 'February 25, 2026',
      stage: 'Phase 1 Cleared',
      description:
        'Demonstrated quantitative consistency by securing the Phase One achievement on the institutional evaluation stage under high volatility market sessions.',
      imageUrl: '/testimonials/fundingpips-phase1-feb2026.jpg',
      tags: ['Phase One Cleared', 'Multi-Account Verification', 'Controlled Risk'],
      metrics: [
        { label: 'Stage', value: 'Phase One Completed' },
        { label: 'Date', value: 'February 25, 2026' },
        { label: 'Firm', value: 'FundingPips' },
      ],
    },
    {
      id: 'fp-phase2-nov2025',
      category: 'Prop Firm Certifications',
      firm: 'FundingPips',
      title: 'Phase Two Evaluation Certificate of Achievement',
      date: 'November 28, 2025',
      stage: 'Phase 2 Cleared (Final Stage)',
      description:
        'Passed Phase 2 evaluation with strict adherence to statistical profit targets and systematic overnight risk containment.',
      imageUrl: '/testimonials/fundingpips-phase2-nov2025.jpg',
      tags: ['Phase Two Passed', 'Institutional Grade', 'Winter Series'],
      metrics: [
        { label: 'Stage', value: 'Phase Two Completed' },
        { label: 'Date', value: 'November 28, 2025' },
        { label: 'Verification', value: 'Verified Certificate' },
      ],
    },
    {
      id: 'fp-phase1-sep2025',
      category: 'Prop Firm Certifications',
      firm: 'FundingPips',
      title: 'Phase One Evaluation Certificate of Achievement',
      date: 'September 16, 2025',
      stage: 'Phase 1 Cleared',
      description:
        'Inaugural Phase 1 clearance marking the beginning of systematic evaluation milestones with a zero-drawdown breach record.',
      imageUrl: '/testimonials/fundingpips-phase1-sep2025.jpg',
      tags: ['Phase One Cleared', 'Foundation Milestone', 'Systematic Baseline'],
      metrics: [
        { label: 'Stage', value: 'Phase One Completed' },
        { label: 'Date', value: 'September 16, 2025' },
        { label: 'Firm', value: 'FundingPips' },
      ],
    },
  ];

  const filteredTestimonials = testimonials.filter((t) => {
    if (activeTab === 'fundingpips') return t.firm.toLowerCase().includes('fundingpips');
    if (activeTab === '5ers') return t.firm.toLowerCase().includes('5%ers');
    return true;
  });

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 sm:px-6 font-sans space-y-10 animate-fade-in select-none">
      {/* ── Top Hero & Profile Card ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E2E8F0] shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-emerald-100/40 via-blue-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#021810] border-2 border-[#10B981]/60 flex items-center justify-center p-2 shadow-sm shrink-0">
              <img src="/alltra-logo.png" alt="Alltra Quant" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>SYSTEMATIC PROP TRADER &amp; QUANT DEVELOPER</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                Atharva Bhosale
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] font-mono">
                Systematic Trading Models · Algorithmic Strategy Engineering · Institutional Risk Management
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 font-mono text-xs font-bold">
              Officially Funded Trader
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 font-mono text-xs font-bold">
              Global Contest Top 10
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs font-bold">
              10+ Challenges Passed
            </span>
          </div>
        </div>
      </div>

      {/* ── About Me & Core Trading Philosophy ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-[#0F172A] font-bold text-base">
            <Target className="w-5 h-5 text-[#2563EB]" />
            <h2>About Me &amp; Quantitative Background</h2>
          </div>
          <div className="text-xs sm:text-sm text-[#475569] leading-relaxed space-y-3">
            <p>
              I am a quantitative finance practitioner and algorithmic trader dedicated to building verifiable, rule-based edge in financial markets. My approach discards discretionary guessing, social media noise, and emotional impulse in favor of mathematical expectancy, statistical mean reversion, and systematic order flow liquidity sweeps.
            </p>
            <p>
              Having passed <strong>10+ rigorous prop firm evaluations</strong> across leading global institutions like <strong>The 5%ers</strong> and <strong>FundingPips</strong>, my trading methodology is battle-tested under strict daily drawdowns (4%), max trailing drawdowns (5-6%), and high reward-to-risk execution requirements.
            </p>
            <p>
              I built <strong>ALLTRA</strong> as an institutional workstation to bridge the gap between academic quantitative finance and real-time execution—bringing institutional backtesting, bar-by-bar market replay, and disciplined algorithmic desks directly to your hands.
            </p>
          </div>

          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
              <div className="text-lg font-extrabold text-[#0F172A] font-mono">10+</div>
              <div className="text-[11px] text-[#64748B]">Certificates Passed</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
              <div className="text-lg font-extrabold text-[#16A34A] font-mono">Top 10</div>
              <div className="text-[11px] text-[#64748B]">Global Contest Rank</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
              <div className="text-lg font-extrabold text-[#2563EB] font-mono">90+</div>
              <div className="text-[11px] text-[#64748B]">Quality Trade Score</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
              <div className="text-lg font-extrabold text-[#7C3AED] font-mono">0.5%</div>
              <div className="text-[11px] text-[#64748B]">Strict Risk Per Trade</div>
            </div>
          </div>
        </div>

        <div className="bg-[#0F172A] text-white rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold tracking-tight">The Core Philosophy</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              "Markets are liquidity-seeking auctions. Alpha is not about forecasting headlines or gambling on volatility—it is engineered through statistical edges, disciplined risk containment, and flawless execution."
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Discretionary Emotional Trading</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verifiable Cryptographic Proof of Results</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Strict Capital Preservation First</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Testimonials & Official Prop Firm Accreditations ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#16A34A] uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Verifiable Track Record &amp; Accreditations</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A]">
              Prop Firm Certifications &amp; Achievements
            </h2>
            <p className="text-xs text-[#64748B]">
              Every certificate and badge is earned through verified live evaluations governed by institutional prop firm auditing.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 bg-[#F1F5F9] p-1 rounded-2xl shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              All Accreditations ({testimonials.length})
            </button>
            <button
              onClick={() => setActiveTab('5ers')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === '5ers'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              The 5%ers
            </button>
            <button
              onClick={() => setActiveTab('fundingpips')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'fundingpips'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              FundingPips
            </button>
          </div>
        </div>

        {/* ── Testimonials Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map((item) => (
            <div
              key={item.id}
              className="group bg-[#FAFAFC] rounded-2xl border border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Visual Certificate Card Preview */}
                <div
                  onClick={() => setSelectedPreview(item)}
                  className="relative aspect-4/3 bg-slate-900 overflow-hidden cursor-pointer flex items-center justify-center border-b border-[#E2E8F0]"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-2"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-[#0F172A] text-xs font-bold flex items-center gap-1.5 shadow-md">
                      <Maximize2 className="w-3.5 h-3.5" />
                      View Full Certificate
                    </span>
                  </div>

                  {item.videoUrl && (
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-purple-600/90 text-white text-[10px] font-mono font-bold flex items-center gap-1 shadow-xs">
                      <Play className="w-3 h-3 fill-white" />
                      Video Available
                    </span>
                  )}

                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md border border-slate-200 text-[#0F172A] text-[10px] font-mono font-bold">
                    {item.date}
                  </span>
                </div>

                {/* Content Info */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {item.firm}
                    </span>
                    <span className="text-[11px] text-[#64748B] font-mono font-semibold">
                      {item.stage}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-[#0F172A] text-sm leading-snug group-hover:text-[#2563EB] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Card Footer Metrics & Tags */}
              <div className="p-5 pt-0 space-y-3">
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[10px] font-mono">
                  {item.metrics.slice(0, 2).map((m, idx) => (
                    <div key={idx}>
                      <span className="text-[#94A3B8] block">{m.label}</span>
                      <span className="font-bold text-[#0F172A] truncate block">{m.value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#475569] text-[10px] font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal Certificate / Media Inspector ── */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#E2E8F0] shadow-2xl relative p-6 sm:p-8 space-y-6 animate-scale-up">
            <button
              onClick={() => setSelectedPreview(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-[#2563EB] uppercase tracking-wider">
                {selectedPreview.firm} · {selectedPreview.stage}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A]">
                {selectedPreview.title}
              </h2>
              <p className="text-xs text-[#64748B] font-mono">Issued to Atharva Bhosale · {selectedPreview.date}</p>
            </div>

            {/* Media Presentation */}
            <div className="rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center max-h-[500px] border border-slate-800">
              {selectedPreview.videoUrl ? (
                <video
                  src={selectedPreview.videoUrl}
                  controls
                  autoPlay
                  className="max-h-[500px] w-auto mx-auto"
                />
              ) : (
                <img
                  src={selectedPreview.imageUrl}
                  alt={selectedPreview.title}
                  className="max-h-[500px] w-auto mx-auto object-contain p-2"
                />
              )}
            </div>

            <div className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              {selectedPreview.description}
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono">
              {selectedPreview.metrics.map((m, idx) => (
                <div key={idx}>
                  <div className="text-[#94A3B8]">{m.label}</div>
                  <div className="font-bold text-[#0F172A] mt-0.5">{m.value}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedPreview(null)}
                className="px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold transition-all cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Call to Action ── */}
      {onNavigateTo && (
        <div className="bg-gradient-to-r from-[#1E40AF] to-[#2563EB] rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold">Experience the Exact Same Execution Discipline</h3>
            <p className="text-xs text-blue-100 max-w-xl">
              Test systematic setups candle-by-candle with zero lookahead bias in the Bar Replay Studio, or track live execution in the NRI &amp; Global Forex Desk.
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
