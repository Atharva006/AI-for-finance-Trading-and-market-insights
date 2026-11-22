import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  Zap,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'ENGINE' | 'EXECUTION' | 'PROP_FIRM' | 'RISK';
  question: string;
  answer: string;
  highlight?: string;
}

export const FAQView: React.FC<{ onNavigateTo?: (view: any) => void }> = ({ onNavigateTo }) => {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'ENGINE' | 'EXECUTION' | 'PROP_FIRM' | 'RISK'>('ALL');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    'q-1': true,
    'q-4': true,
  });

  const toggleQuestion = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const faqItems: FaqItem[] = [
    {
      id: 'q-1',
      category: 'ENGINE',
      question: 'How does the Bar Replay Engine eliminate lookahead bias?',
      answer:
        'Alltra maintains the full dataset in memory as a static tensor (allCandles) and strictly controls visibility through a single monotonic index pointer (currentIndex). When step-forwarding (+1) or auto-playing candles at 15m or 1D intervals, indicators and executions are calculated strictly over the visible slice `allCandles.slice(0, currentIndex + 1)`. The engine guarantees zero access to future bars, replicating real-time auction conditions with 100% mathematical fidelity.',
      highlight: 'Zero Lookahead Guaranteed',
    },
    {
      id: 'q-2',
      category: 'EXECUTION',
      question: 'How are orders routed and executed in Paper Trading Desk?',
      answer:
        'Paper Trading Desk is linked directly to direct exchange telemetry (Upstox API Gateway and real-time market quotes). Simulated slippage is calibrated to 0 bps by default to allow pure algorithmic edge discovery. Orders execute at verifiable bid/ask touch levels with comprehensive state tracking saved to Supabase with full ledger audits.',
      highlight: '0 bps Slippage · Upstox Live Feeds',
    },
    {
      id: 'q-3',
      category: 'PROP_FIRM',
      question: 'Are the algorithmic strategies designed to pass Global Prop Firm Challenges?',
      answer:
        'Yes. The underlying quantitative frameworks—particularly the Asia-London-NY Fair Value Gap (FVG) Liquidity Inversion models on EUR/USD, GBP/USD, and NIFTY 50—have been mathematically calibrated and successfully utilized to pass 10+ prop firm evaluations globally, including FundingPips, The 5%ers, and QT Funded / FTMO. The models enforce strict intraday drawdown limits (max 4% daily, 6% maximum), fixed 1:2 R:R ratios, and news event flattening.',
      highlight: '10+ Verified Prop Challenges Passed',
    },
    {
      id: 'q-4',
      category: 'RISK',
      question: 'What risk parameters and drawdown controls are hardcoded into the platform?',
      answer:
        'Every quantitative execution model in Alltra mandates fixed percentage risk per trade (typically 0.5% to 1.0% of nominal account capital), automated Stop Loss calculation based on market volatility (ATR), and hard circuit breakers. The platform completely eliminates subjective discretion, revenge trading, and over-leveraging.',
      highlight: 'Strict Mathematical Risk Constraints',
    },
    {
      id: 'q-5',
      category: 'ENGINE',
      question: 'Which markets and asset classes can be backtested and replayed?',
      answer:
        'Alltra supports all NIFTY 50 constituent equities, Indian sectoral indices (BANK NIFTY, NIFTY IT, NIFTY AUTO), US Mega-Caps (AAPL, NVDA, MSFT), Global Forex Pairs (EUR/USD, GBP/USD, USD/JPY), and Commodities (Gold GC=F, Crude Oil CL=F). Intraday timeframes span 5m, 15m, 30m, 1h, and 1D daily bars.',
      highlight: 'Multi-Asset Market Coverage',
    },
    {
      id: 'q-6',
      category: 'EXECUTION',
      question: 'How does Conversational AI "Intelligence" assist in macro and market analysis?',
      answer:
        'ALLTRA Intelligence is a specialized institutional conversational reasoning engine. It maintains context across foreign affairs, geopolitical tensions (such as Middle East supply corridor impacts, interest rate shifts, and central bank speeches), and portfolio risk. It delivers unbiased statistical pattern evaluations, historical scenario comparisons, and never generates speculative or reckless financial advice.',
      highlight: 'Context-Aware Quantitative AI',
    },
    {
      id: 'q-7',
      category: 'PROP_FIRM',
      question: 'How do I export strategies into Pine Script v5 or webhook execution?',
      answer:
        'Every algorithmic model in Alltra features a 1-click Pine Script v5 compilation modal. You can copy the code directly into TradingView, connect webhooks to automated execution brokers, or deploy orders directly within the Alltra Paper Trading Desk.',
      highlight: '1-Click TradingView Pine Script v5 Export',
    },
  ];

  const filteredFaqs =
    activeCategory === 'ALL'
      ? faqItems
      : faqItems.filter((item) => item.category === activeCategory);

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6 font-sans space-y-8 animate-fade-in select-none">
      {/* ── Header ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] text-xs font-semibold uppercase tracking-wider font-mono">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Knowledge Base &amp; Architecture FAQ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-[#64748B] max-w-2xl leading-relaxed">
            Everything you need to know about the Alltra Quantitative Workstation, vectorized backtesting engines, prop firm challenge verification, and automated order execution.
          </p>
        </div>

        {onNavigateTo && (
          <button
            onClick={() => onNavigateTo('intelligence')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs shadow-sm transition-all active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask Intelligence AI</span>
          </button>
        )}
      </div>

      {/* ── Category Filters ── */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'ALL', label: 'All Topics' },
          { id: 'ENGINE', label: 'Replay & Backtest Engine' },
          { id: 'EXECUTION', label: 'Paper Trading & Execution' },
          { id: 'PROP_FIRM', label: 'Prop Firm Evaluation' },
          { id: 'RISK', label: 'Risk & Capital Controls' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeCategory === tab.id
                ? 'bg-[#0F172A] text-white shadow-sm'
                : 'bg-white text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] hover:bg-[#F8FAFC]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── FAQ Accordion ── */}
      <div className="space-y-3">
        {filteredFaqs.map((faq) => {
          const isOpen = openIds[faq.id] ?? false;
          return (
            <div
              key={faq.id}
              className={`rounded-2xl border transition-all overflow-hidden bg-white ${
                isOpen ? 'border-[#2563EB]/40 shadow-md ring-1 ring-[#2563EB]/10' : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
              }`}
            >
              <button
                onClick={() => toggleQuestion(faq.id)}
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors hover:bg-[#F8FAFC]"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-4 pr-4">
                  <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                    ?
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-[#2563EB] uppercase tracking-wider">
                      {faq.category.replace('_', ' ')}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">
                      {faq.question}
                    </h3>
                  </div>
                </div>

                <div className="shrink-0 text-[#64748B]">
                  {isOpen ? <ChevronUp className="w-5 h-5 text-[#2563EB]" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-[#F1F5F9] bg-[#FAFAFC] text-xs sm:text-sm text-[#475569] leading-relaxed space-y-3">
                  <p>{faq.answer}</p>
                  {faq.highlight && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#DCFCE7] text-[#166534] font-mono text-[11px] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{faq.highlight}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
