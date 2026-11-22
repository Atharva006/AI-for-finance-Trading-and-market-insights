import React, { useState } from 'react';
import {
  Maximize2,
  X,
  Play,
  ArrowUpRight,
} from 'lucide-react';

interface AboutViewProps {
  onNavigateTo?: (view: any) => void;
}

interface TestimonialCard {
  id: string;
  firm: string;
  title: string;
  date: string;
  stage: string;
  summary: string;
  imageUrl: string;
  videoUrl?: string;
  badge: string;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigateTo }) => {
  const [filter, setFilter] = useState<'all' | '5ers' | 'fundingpips'>('all');
  const [selectedPreview, setSelectedPreview] = useState<TestimonialCard | null>(null);

  const items: TestimonialCard[] = [
    {
      id: '5ers-funded',
      firm: 'The 5%ers',
      title: 'Officially Funded Trader (5K)',
      date: 'Feb 2026',
      stage: 'Funded Account',
      summary: 'Achieved funded allocation through systematic risk containment and execution discipline.',
      imageUrl: '/testimonials/5ers-funded-trader-5k.png',
      videoUrl: '/testimonials/5ers-funded-trader.mp4',
      badge: 'Live Allocation',
    },
    {
      id: '5ers-contest-top10',
      firm: 'The 5%ers',
      title: 'Contest Top 10 Worldwide',
      date: 'Oct 2026',
      stage: 'Global Arena',
      summary: 'Ranked in the top 10 globally in The5ers X Naveen international trading competition.',
      imageUrl: '/testimonials/5ers-contest-top-10.png',
      badge: 'Top 10 Global',
    },
    {
      id: '5ers-fantastic-rrr',
      firm: 'The 5%ers',
      title: 'Fantastic RRR · EUR/USD',
      date: 'Jun 2026',
      stage: 'Execution Award',
      summary: 'Recognized for asymmetric risk-to-reward ratio and tight invalidation order flow.',
      imageUrl: '/testimonials/5ers-fantastic-rrr.png',
      badge: 'High R:R',
    },
    {
      id: '5ers-quality-trade-score-90',
      firm: 'The 5%ers',
      title: 'Quality Trade Score 90+',
      date: 'Jun 2026',
      stage: 'Audit Milestone',
      summary: 'Graded 90+ out of 100 by prop firm algorithms for entry precision and trade quality.',
      imageUrl: '/testimonials/5ers-quality-trade-score90.png',
      badge: 'Score 90+',
    },
    {
      id: 'fp-phase2-mar2026',
      firm: 'FundingPips',
      title: 'Phase Two Evaluation Passed',
      date: 'Mar 2026',
      stage: 'Phase 2 Cleared',
      summary: 'Cleared final evaluation stage under strict 4% daily and 6% maximum drawdown limits.',
      imageUrl: '/testimonials/fundingpips-phase2-mar2026.jpg',
      badge: 'Phase 2 Passed',
    },
    {
      id: 'fp-phase1-mar2026',
      firm: 'FundingPips',
      title: 'Phase One Evaluation Passed',
      date: 'Mar 2026',
      stage: 'Phase 1 Cleared',
      summary: 'Completed Phase 1 targets via systematic liquidity sweep models.',
      imageUrl: '/testimonials/fundingpips-phase1-mar2026.jpg',
      badge: 'Phase 1 Passed',
    },
    {
      id: 'fp-phase1-feb2026',
      firm: 'FundingPips',
      title: 'Phase One Evaluation Passed',
      date: 'Feb 2026',
      stage: 'Phase 1 Cleared',
      summary: 'Demonstrated consistent statistical expectancy during high-volatility sessions.',
      imageUrl: '/testimonials/fundingpips-phase1-feb2026.jpg',
      badge: 'Phase 1 Passed',
    },
    {
      id: 'fp-phase2-nov2025',
      firm: 'FundingPips',
      title: 'Phase Two Evaluation Passed',
      date: 'Nov 2025',
      stage: 'Phase 2 Cleared',
      summary: 'Executed disciplined overnight risk control to meet final target criteria.',
      imageUrl: '/testimonials/fundingpips-phase2-nov2025.jpg',
      badge: 'Phase 2 Passed',
    },
    {
      id: 'fp-phase1-sep2025',
      firm: 'FundingPips',
      title: 'Phase One Evaluation Passed',
      date: 'Sep 2025',
      stage: 'Phase 1 Cleared',
      summary: 'Inaugural prop challenge completion with zero daily drawdown breaches.',
      imageUrl: '/testimonials/fundingpips-phase1-sep2025.jpg',
      badge: 'Phase 1 Passed',
    },
  ];

  const filteredItems = items.filter((item) => {
    if (filter === '5ers') return item.firm.includes('5%ers');
    if (filter === 'fundingpips') return item.firm.includes('FundingPips');
    return true;
  });

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4 sm:px-6 font-sans space-y-12 animate-fade-in select-none text-[#0F172A]">
      {/* ── Minimal Header with Profile & LinkedIn ── */}
      <header className="space-y-6 border-b border-[#E2E8F0] pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-[#F1F5F9] border border-[#E2E8F0] shrink-0 shadow-xs">
              <img
                src="/atharva-profile.png"
                alt="Atharva Bhosale"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/alltra-logo.png';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">Atharva Bhosale</h1>
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" title="Active Trader" />
              </div>
              <p className="text-xs text-[#64748B] font-mono mt-0.5">Quantitative Trading &amp; Systematic Systems</p>
            </div>
          </div>

          {/* LinkedIn Connect Button */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <a
              href="https://www.linkedin.com/in/atharva--bhosale/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.88a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26Z" />
              </svg>
              <span>Connect on LinkedIn</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>

        <p className="text-sm text-[#475569] leading-relaxed max-w-2xl font-normal">
          I build systematic, rule-based execution models focused on statistical mean reversion and liquidity sweeps across equities and currency pairs. Rather than discretionary guessing, every strategy is tested through zero-lookahead backtests and strict capital preservation rules.
        </p>

        {/* Minimal Stats */}
        <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-mono">
          <div>
            <span className="text-[#94A3B8] block">ACCREDITATIONS</span>
            <span className="text-sm font-bold text-[#0F172A]">10+ Passed</span>
          </div>
          <div className="h-6 w-px bg-[#E2E8F0]" />
          <div>
            <span className="text-[#94A3B8] block">GLOBAL RANK</span>
            <span className="text-sm font-bold text-[#0F172A]">Top 10 Contest</span>
          </div>
          <div className="h-6 w-px bg-[#E2E8F0]" />
          <div>
            <span className="text-[#94A3B8] block">TRADE AUDIT</span>
            <span className="text-sm font-bold text-[#0F172A]">Score 90+</span>
          </div>
          <div className="h-6 w-px bg-[#E2E8F0]" />
          <div>
            <span className="text-[#94A3B8] block">RISK DISCIPLINE</span>
            <span className="text-sm font-bold text-[#0F172A]">0.5% / Trade</span>
          </div>
        </div>
      </header>

      {/* ── Testimonials & Certifications Section ── */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold tracking-tight uppercase font-mono text-[#64748B]">
              Prop Firm Certifications &amp; Awards
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Verified evaluations passed under institutional drawdown rules.
            </p>
          </div>

          {/* Clean Segmented Filter */}
          <div className="inline-flex p-0.5 rounded-lg bg-[#F1F5F9] text-[11px] font-mono self-start sm:self-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-[#0F172A] font-semibold shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setFilter('5ers')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                filter === '5ers'
                  ? 'bg-white text-[#0F172A] font-semibold shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              The 5%ers
            </button>
            <button
              onClick={() => setFilter('fundingpips')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                filter === 'fundingpips'
                  ? 'bg-white text-[#0F172A] font-semibold shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              FundingPips
            </button>
          </div>
        </div>

        {/* Minimal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedPreview(item)}
              className="group bg-white rounded-xl border border-[#E2E8F0] hover:border-[#94A3B8] transition-all p-3 cursor-pointer flex flex-col justify-between space-y-3"
            >
              {/* Media Thumbnail */}
              <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-[#F8FAFC] border border-[#F1F5F9] flex items-center justify-center">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-contain p-2 group-hover:scale-[1.02] transition-transform duration-200"
                  loading="lazy"
                />

                {item.videoUrl && (
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-[#0F172A]/80 text-white text-[9px] font-mono flex items-center gap-1 backdrop-blur-xs">
                    <Play className="w-2.5 h-2.5 fill-white" />
                    Video
                  </span>
                )}

                <div className="absolute inset-0 bg-[#0F172A]/0 group-hover:bg-[#0F172A]/5 transition-colors flex items-center justify-center" />
              </div>

              {/* Text Info */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
                  <span>{item.firm}</span>
                  <span>{item.date}</span>
                </div>

                <div className="flex items-start justify-between gap-1">
                  <h3 className="text-xs font-semibold text-[#0F172A] leading-snug group-hover:text-[#2563EB] transition-colors">
                    {item.title}
                  </h3>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#2563EB] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <p className="text-[11px] text-[#64748B] line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              {/* Minimal Badge */}
              <div className="pt-1">
                <span className="inline-block px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569] text-[10px] font-mono font-medium">
                  {item.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Minimal Philosophy Callout ── */}
      <section className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
        <h3 className="text-xs font-mono font-bold uppercase text-[#64748B]">Engineering Principle</h3>
        <p className="text-xs text-[#334155] leading-relaxed max-w-2xl">
          Markets are liquidity-seeking auctions. Alpha is not about forecasting news or discretionary speculation—it is engineered through statistical edges, strict risk boundaries, and disciplined execution.
        </p>
      </section>

      {/* ── Clean Lightbox Preview Modal ── */}
      {selectedPreview && (
        <div
          onClick={() => setSelectedPreview(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full border border-[#E2E8F0] shadow-xl overflow-hidden p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <span className="text-[11px] font-mono text-[#64748B] block">
                  {selectedPreview.firm} · {selectedPreview.date}
                </span>
                <h3 className="text-sm font-bold text-[#0F172A]">{selectedPreview.title}</h3>
              </div>
              <button
                onClick={() => setSelectedPreview(null)}
                className="w-7 h-7 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Media Presentation */}
            <div className="rounded-xl overflow-hidden bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center max-h-[460px]">
              {selectedPreview.videoUrl ? (
                <video
                  src={selectedPreview.videoUrl}
                  controls
                  autoPlay
                  className="max-h-[460px] w-auto mx-auto"
                />
              ) : (
                <img
                  src={selectedPreview.imageUrl}
                  alt={selectedPreview.title}
                  className="max-h-[460px] w-auto mx-auto object-contain p-3"
                />
              )}
            </div>

            <p className="text-xs text-[#475569] leading-relaxed">
              {selectedPreview.summary}
            </p>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPreview(null)}
                className="px-4 py-1.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
