import React, { useState } from 'react';
import { ALL_CANONICAL_STRATEGIES } from '../services/canonicalStrategies';
import { AlgoStrategy } from '../types/algoMarketplace';
import { AppView } from './DhanNavbar';
import { AuthUserProfile } from '../services/supabaseAuth';
import { ArrowRight, ChevronDown, ExternalLink, ShieldCheck, HelpCircle, FileText, Mail, Linkedin } from 'lucide-react';

interface LandingPageProps {
  onNavigateToView: (view: AppView, strategy?: AlgoStrategy) => void;
  onSelectStrategy?: (strategy: AlgoStrategy) => void;
  strategies?: AlgoStrategy[];
  currentUser?: AuthUserProfile | null;
  onSignOut?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToView,
  onSelectStrategy,
  strategies,
  currentUser,
  onSignOut,
}) => {
  const activeStrategies = strategies && strategies.length > 0 ? strategies : ALL_CANONICAL_STRATEGIES;
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  const handleProtectedAction = (action?: () => void) => {
    if (!currentUser) {
      onNavigateToView('auth');
      return;
    }
    if (action) {
      action();
    } else {
      onNavigateToView('overview');
    }
  };

  const faqs = [
    {
      q: 'How does the Bar Replay engine prevent lookahead bias?',
      a: 'Alltra maintains the historical dataset in memory and enforces a strict pointer `allCandles.slice(0, currentIndex + 1)`. When stepping candle-by-candle through 5m, 15m, 30m, 1h, or daily bars, future bars remain completely concealed from chart rendering and simulated risk engines.',
    },
    {
      q: 'How does paper execution operate before deploying live capital?',
      a: 'Paper execution streams real-time market quotes with configurable position sizing and automated Stop Loss / Take Profit rules. Fills and PnL updates operate with zero slippage in default simulation to allow objective edge discovery.',
    },
    {
      q: 'Which markets and asset classes are supported?',
      a: 'Alltra supports all NIFTY 50 constituent stocks, Indian sectoral indices, major US equities (e.g. AAPL, NVDA), and global currency pairs (EUR/USD, GBP/USD).',
    },
    {
      q: 'What risk controls and drawdown safeguards are built into the platform?',
      a: 'The platform integrates automated fixed-fractional risk calculation, ATR-based volatility stop-loss levels, and max drawdown circuit breakers to prevent over-leveraging and emotional discretion.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans select-none antialiased">
      {/* ── 1. Minimal Public Header (Zero Tickers, Zero Rockets) ── */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => onNavigateToView('landing')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#0F172A] flex items-center justify-center shadow-xs">
              <img src="/alltra-logo.png" alt="Alltra" className="w-full h-full object-cover" />
            </div>
            <span className="font-extrabold text-[16px] text-[#0F172A] tracking-wider font-mono uppercase">
              ALLTRA
            </span>
          </div>

          {/* Minimal Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#64748B]">
            <a href="#about" className="hover:text-[#0F172A] transition-colors">
              About
            </a>
            <a href="#features" className="hover:text-[#0F172A] transition-colors">
              Features
            </a>
            <a href="#faq" className="hover:text-[#0F172A] transition-colors">
              FAQ
            </a>
            <a href="#contact" className="hover:text-[#0F172A] transition-colors">
              Contact
            </a>
          </nav>

          {/* Clean Auth Button */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateToView('overview')}
                  className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  Go to Platform
                </button>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-[#64748B] hover:text-[#0F172A] text-xs font-medium transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigateToView('auth')}
                className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── 2. Hero Section ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex flex-col gap-16">
        <section className="text-center max-w-3xl mx-auto flex flex-col items-center gap-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Quantitative Research &amp; Execution Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Institutional Quantitative Trading &amp; Market Intelligence
          </h1>

          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-2xl">
            Vectorized historical backtesting, strict candle-by-candle bar replay, and automated risk enforcement for Indian equities, index derivatives, and global macro assets.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleProtectedAction()}
              className="px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>{currentUser ? 'Open Platform' : 'Get Started'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#features"
              className="px-6 py-3 rounded-xl bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#0F172A] text-xs sm:text-sm font-medium transition-colors shadow-xs"
            >
              Explore Features
            </a>
          </div>
        </section>

        {/* ── 3. High-Resolution Workstation Preview ── */}
        <section id="features" className="w-full">
          <div className="rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-lg bg-white">
            <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                <span className="font-mono font-semibold text-[#0F172A] ml-2">ALLTRA Workstation</span>
              </div>
              <span className="font-mono text-[11px]">NIFTY 50 &amp; Global Assets</span>
            </div>

            <div className="w-full aspect-[16/9] max-h-[580px] bg-[#0A0D14] overflow-hidden">
              <img
                src="/alltra-terminal-hero.jpg"
                alt="Alltra Quantitative Platform"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>
        </section>

        {/* ── 4. Core Features Grid ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-base font-bold text-[#0F172A]">Candle-by-Candle Bar Replay</h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Step forward and backward candle-by-candle with zero lookahead bias across 5m, 15m, 30m, 1h, and daily intervals. Practice trade execution and draw trendlines on historical NIFTY 50 bars.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-base font-bold text-[#0F172A]">Paper Trading &amp; Risk Engine</h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Simulate live orders with 0 bps slippage against real-time market data. Enforce automatic stop loss and take profit targets with strict account margin constraints.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-base font-bold text-[#0F172A]">Conversational AI Intelligence</h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Synthesize macroeconomic context, foreign affairs developments, and historical pattern comparisons with a friendly, epistemic conversational assistant.
            </p>
          </div>
        </section>

        {/* ── 5. About the Platform & Quantitative Focus ── */}
        <section id="about" className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-[#334155] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>About the Creator</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A]">
              Atharva Bhosale · Quantitative Finance Practitioner
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              Currently studying and building systematic trading models with a dedicated focus on algorithmic order flow, statistical arbitrage, and disciplined risk containment. Passed 10+ global prop firm evaluations using strict mathematical expectancy and zero emotional discretion.
            </p>
          </div>

          <a
            href="https://www.linkedin.com/in/atharva--bhosale/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Linkedin className="w-4 h-4" />
            <span>Connect on LinkedIn</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </section>

        {/* ── 6. Frequently Asked Questions ── */}
        <section id="faq" className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-[#64748B]">
              Common questions regarding bar replay, execution simulation, and data hygiene.
            </p>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#64748B] transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-[#2563EB]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-[#64748B] leading-relaxed border-t border-[#F1F5F9]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 7. Regulatory & Compliance Banner ── */}
        <section className="p-5 rounded-2xl bg-[#F1F5F9] border border-[#CBD5E1] text-xs text-[#475569] space-y-1 leading-relaxed">
          <div className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px]">
            SEBI &amp; FEMA Compliance &amp; Educational Disclosure
          </div>
          <p>
            Investments in financial securities are subject to market risks. All backtested metrics, simulation results, and paper trading ledgers are hypothetical and intended strictly for strategy research and education. Past backtested performance does not guarantee future results.
          </p>
        </section>
      </main>

      {/* ── 8. Complete Public Footer (Documentation, Contact Us, LinkedIn) ── */}
      <footer id="contact" className="w-full bg-white border-t border-[#E2E8F0] mt-16 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-[#64748B]">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#0F172A] flex items-center justify-center">
                <img src="/alltra-logo.png" alt="Alltra" className="w-full h-full object-cover" />
              </div>
              <span className="font-mono font-extrabold text-sm text-[#0F172A]">ALLTRA</span>
            </div>
            <p className="leading-relaxed">
              Institutional quantitative research, candle-by-candle bar replay, and systematic strategy execution.
            </p>
          </div>

          {/* Col 2: Documentation */}
          <div className="space-y-2">
            <div className="font-bold text-[#0F172A] uppercase text-[11px] tracking-wider">
              Documentation
            </div>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => handleProtectedAction(() => onNavigateToView('barreplay'))}
                  className="hover:text-[#0F172A] transition-colors"
                >
                  Bar Replay Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleProtectedAction(() => onNavigateToView('papertrading'))}
                  className="hover:text-[#0F172A] transition-colors"
                >
                  Paper Trading Specs
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleProtectedAction(() => onNavigateToView('heatmap'))}
                  className="hover:text-[#0F172A] transition-colors"
                >
                  TradingView Heatmap
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleProtectedAction(() => onNavigateToView('intelligence'))}
                  className="hover:text-[#0F172A] transition-colors"
                >
                  AI Intelligence Engine
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Regulatory */}
          <div className="space-y-2">
            <div className="font-bold text-[#0F172A] uppercase text-[11px] tracking-wider">
              Compliance
            </div>
            <ul className="space-y-1.5">
              <li>FEMA LRS Directives</li>
              <li>SEBI Research Guidelines</li>
              <li>Simulated Execution Rules</li>
              <li>Risk &amp; Drawdown Policies</li>
            </ul>
          </div>

          {/* Col 4: Contact Us & Social */}
          <div className="space-y-2">
            <div className="font-bold text-[#0F172A] uppercase text-[11px] tracking-wider">
              Contact &amp; Connect
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                <a
                  href="https://www.linkedin.com/in/atharva--bhosale/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0F172A] transition-colors font-medium text-[#0A66C2]"
                >
                  Atharva Bhosale on LinkedIn
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#64748B]" />
                <span>support@alltra.quant</span>
              </li>
              <li className="text-[11px] text-[#94A3B8]">
                Mumbai, India
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#94A3B8]">
          <div>© {new Date().getFullYear()} ALLTRA. All rights reserved.</div>
          <div>Strictly Simulated Quantitative Trading Environment.</div>
        </div>
      </footer>
    </div>
  );
};
