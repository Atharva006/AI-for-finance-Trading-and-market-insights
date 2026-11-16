import React, { useState } from 'react';
import { Eye, ShieldAlert, Sparkles, Binary, Compass, ArrowRight } from 'lucide-react';
import { MotionAssetCanvas } from './MotionAssetCanvas';

interface MatsyaPhilosophyProps {
  motionAsset2Url?: string;
}

interface Pillar {
  id: string;
  step: string;
  hindiTitle: string;
  englishTitle: string;
  concept: string;
  quote: string;
  description: string;
  quantImplementation: {
    input: string;
    transformation: string;
    output: string;
    metric: string;
  };
  codeSnippet: string;
}

const pillars: Pillar[] = [
  {
    id: 'oil-reflection',
    step: '01',
    hindiTitle: 'तेल पात्र',
    englishTitle: 'The Oil Reflection',
    concept: 'NOISE FILTERING VIA RAW TICK REFLECTION',
    quote:
      'Drona asked: "What do you see, Arjuna?" Arjuna answered: "I see only the eye of the fish. Neither the branch, nor the bird, nor you."',
    description:
      'In the Mahabharata, looking directly at the moving target blinds the archer with distractions. Arjuna observed only its inverted reflection in oil. In modern Indian finance, looking directly at live tick chatter and breaking social media causes over-trading. अर्जुन looks only at the distilled, mathematically smoothed reflection of historical NSE ticks and order flow delta.',
    quantImplementation: {
      input: 'NSE Tick-by-Tick Level 3 Data (Bid/Ask/Volume ~1.2M events/day)',
      transformation: 'Volume-Weighted Exponential Moving Average (VWEMA) & Order Flow Imbalance (OFI)',
      output: 'Noise-suppressed 50ms State Feature Vectors',
      metric: 'Signal-to-Noise Ratio (SNR) +340% over Raw Ticks',
    },
    codeSnippet: `def compute_matsya_reflection(tick_stream):
    # Filter high-frequency market microstructure jitter
    ofi = tick_stream['bid_sz_delta'] - tick_stream['ask_sz_delta']
    vwap_kernel = gaussian_filter1d(tick_stream['price'], sigma=12)
    return feature_normalize(ofi, vwap_kernel)`,
  },
  {
    id: 'piercing-rotation',
    step: '02',
    hindiTitle: 'चक्र भेदन',
    englishTitle: 'Piercing the Rotation',
    concept: 'RULE-BASED SYSTEMATIC REGIME PENETRATION',
    quote:
      'The fish rotated continuously on the overhead wheel. Striking required calculating the rotational velocity and timing the arrow to the exact microsecond.',
    description:
      'Indian market regimes oscillate between range-bound consolidation, explosive Opening Range Breakouts (ORB), and institutional liquidity sweeps (FVGs & Order Blocks). अर्जुन runs high-throughput vectorized backtesting through 7+ years of NSE historical data, identifying the structural rotational frequencies of NIFTY and BANKNIFTY across election years, Union Budget days, and rate cuts.',
    quantImplementation: {
      input: '7 Years Historical NSE 1-Min & Daily OHLCV Archive',
      transformation: 'Fair Value Gap (FVG) Detection & Institutional Order Block Mapping',
      output: 'Calibrated Execution Trigger Windows with Static Stop-Loss',
      metric: 'Backtest Profit Factor 2.41 across 1,482 Historical Events',
    },
    codeSnippet: `def detect_fvg_rotation(candles, threshold_ticks=15):
    # Identify institutional imbalances (Fair Value Gaps)
    bullish_fvg = candles['low'].shift(-1) - candles['high'].shift(1)
    valid_strikes = candles[bullish_fvg > (threshold_ticks * TICK_SIZE)]
    return generate_strike_boundaries(valid_strikes)`,
  },
  {
    id: 'sound-news',
    step: '03',
    hindiTitle: 'शब्द वेध',
    englishTitle: 'Striking by Sound / News',
    concept: 'NLP CATALYST VECTOR CORRELATION',
    quote:
      'Like the ancient archer striking an unseen target guided purely by the sound of its wingbeat, अर्जुन anticipates price velocity from catalyst shockwaves.',
    description:
      'Before a breakout shows on the chart, corporate filings, RBI MPC policy announcements, SEBI regulatory circulars, and quarterly earnings trigger an information shockwave. अर्जुन maps news catalysts into domain-tuned financial embedding space, scoring sentiment polarity and historical correlation to predict immediate 15-minute directional momentum.',
    quantImplementation: {
      input: 'BSE/NSE Corporate Announcements, RBI MPC Transcripts, Macro Feeds',
      transformation: 'FinBERT Sentiment Vectorization + Gemini Quant Context Synthesizer',
      output: 'Directional Probability Vector (-1.0 Bearish to +1.0 Bullish)',
      metric: 'Directional Accuracy on News Catalysts: 74.2%',
    },
    codeSnippet: `async def evaluate_catalyst_soundwave(headline, context):
    sentiment_vector = await finbert_embed(headline)
    historical_shock = match_historical_analogs(sentiment_vector, regime="HIGH_VOL")
    return { "direction": historical_shock.direction, "confidence": 0.88 }`,
  },
];

export const MatsyaPhilosophy: React.FC<MatsyaPhilosophyProps> = ({
  motionAsset2Url,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const currentPillar = pillars[activeTab];

  return (
    <section id="philosophy" className="py-24 bg-[#050507] relative border-b border-white/10">
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 bg-tactical-grid opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="mb-14 border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#FF5500]">
              <Compass className="w-3.5 h-3.5" />
              <span>SECTION // 02</span>
              <span className="text-white/20">|</span>
              <span className="text-[#7E8490]">THE ANCIENT METAPHOR & MODERN QUANT ENGINE</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#F8F9FA] tracking-tight flex items-baseline gap-3">
              <span>मत्स्य-वेध</span>
              <span className="text-xl sm:text-2xl font-mono text-[#7E8490] font-normal">
                [ THE MATSYA-VEDHA PHILOSOPHY ]
              </span>
            </h2>
          </div>

          <div className="max-w-md text-xs sm:text-sm font-mono text-[#A2A8B4] leading-relaxed">
            How a 3,000-year-old tale of singular optical focus dictates the architectural design of modern NSE quantitative alpha generation.
          </div>
        </div>

        {/* Dynamic Motion Asset Display (Asset 2 / Reflection & Trajectory) */}
        <div className="mb-12 border border-white/10 bg-[#0C0C10] p-4 relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono text-[#7E8490]">
            <span className="flex items-center gap-2 text-[#FF5500]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CINEMATIC_FLOW // DATA_TO_STRIKE_TRAJECTORY</span>
            </span>
            <span>BLENDED_WITH_HISTORICAL_TICKS</span>
          </div>

          <div className="h-64 sm:h-80 w-full relative bg-[#060608] mt-3">
            <MotionAssetCanvas
              mode="data-strike"
              videoSrc={motionAsset2Url}
              className="w-full h-full"
            />
            {/* Visual HUD overlay */}
            <div className="absolute top-4 left-4 font-mono text-[10px] text-white/50 bg-black/60 px-2 py-1 border border-white/10">
              VECTOR_STATUS: CONVERGED_ON_HISTORICAL_RESISTANCE
            </div>
            <div className="absolute bottom-4 right-4 font-mono text-[10px] text-[#00E676] bg-black/60 px-2 py-1 border border-[#00E676]/30">
              TARGET_LOCKED: NIFTY 15M ORB STRIKE
            </div>
          </div>
        </div>

        {/* 3 Interactive Architectural Step Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 font-mono">
          {pillars.map((p, idx) => {
            const isSelected = activeTab === idx;
            return (
              <button
                key={p.id}
                onClick={() => setActiveTab(idx)}
                className={`p-4 text-left transition-all duration-200 border relative ${
                  isSelected
                    ? 'bg-[#0C0C10] border-[#FF5500] shadow-[0_0_20px_rgba(255,85,0,0.15)]'
                    : 'bg-[#08080B] border-white/10 hover:border-white/20 text-[#7E8490]'
                }`}
              >
                {/* Active Corner Accent */}
                {isSelected && (
                  <div className="absolute top-0 right-0 w-3 h-3 bg-[#FF5500] clip-path-corner" />
                )}

                <div className="flex items-center justify-between text-xs mb-2">
                  <span
                    className={`font-bold ${
                      isSelected ? 'text-[#FF5500]' : 'text-[#7E8490]'
                    }`}
                  >
                    STEP // {p.step}
                  </span>
                  <span className="text-[10px] text-white/30">{p.id.toUpperCase()}</span>
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-devanagari text-xl font-bold text-[#F8F9FA]">
                    {p.hindiTitle}
                  </span>
                  <span className="text-xs text-[#A2A8B4]">({p.englishTitle})</span>
                </div>

                <div className="text-[11px] text-[#7E8490] line-clamp-1 mt-1">
                  {p.concept}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Panel Detailed Blueprint */}
        <div className="border border-white/10 bg-[#0C0C10] p-6 sm:p-8 font-mono relative">
          {/* Corner Crosshairs */}
          <div className="absolute top-2 left-2 text-[#FF5500] text-xs">+</div>
          <div className="absolute top-2 right-2 text-[#FF5500] text-xs">+</div>
          <div className="absolute bottom-2 left-2 text-[#FF5500] text-xs">+</div>
          <div className="absolute bottom-2 right-2 text-[#FF5500] text-xs">+</div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Philosophical Storytelling */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs text-[#FF5500]">
                <Eye className="w-3.5 h-3.5" />
                <span className="font-bold">ARCHITECTURAL PARADIGM:</span>
                <span className="text-[#F8F9FA]">{currentPillar.concept}</span>
              </div>

              {/* Ancient Scripture Quote Callout */}
              <blockquote className="border-l-2 border-[#FF5500] pl-4 py-1 italic text-xs sm:text-sm text-[#F8F9FA] bg-[#FF5500]/[0.03]">
                "{currentPillar.quote}"
              </blockquote>

              <p className="text-xs sm:text-sm text-[#A2A8B4] leading-relaxed">
                {currentPillar.description}
              </p>

              {/* Quant Implementation Specs Table */}
              <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
                <div className="text-[#FF5500] text-[11px] font-bold tracking-wider">
                  SYSTEM ARCHITECTURE SPECIFICATION:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-black/40 border border-white/5 p-2.5">
                    <span className="text-[#7E8490] block text-[10px]">DATA INGESTION:</span>
                    <span className="text-[#F8F9FA] text-[11px]">{currentPillar.quantImplementation.input}</span>
                  </div>

                  <div className="bg-black/40 border border-white/5 p-2.5">
                    <span className="text-[#7E8490] block text-[10px]">TRANSFORMATION KERNEL:</span>
                    <span className="text-[#F8F9FA] text-[11px]">{currentPillar.quantImplementation.transformation}</span>
                  </div>

                  <div className="bg-black/40 border border-white/5 p-2.5">
                    <span className="text-[#7E8490] block text-[10px]">OUTPUT STATE:</span>
                    <span className="text-[#00E676] text-[11px]">{currentPillar.quantImplementation.output}</span>
                  </div>

                  <div className="bg-black/40 border border-white/5 p-2.5">
                    <span className="text-[#7E8490] block text-[10px]">VALIDATION METRIC:</span>
                    <span className="text-[#FF8800] text-[11px]">{currentPillar.quantImplementation.metric}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Code Implementation Terminal */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div className="border border-white/10 bg-[#050507] p-4 text-xs font-mono">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10 text-[10px] text-[#7E8490]">
                  <span className="flex items-center gap-1.5 text-[#FF5500]">
                    <Binary className="w-3 h-3" />
                    <span>KERNEL_MODULE // {currentPillar.id}.py</span>
                  </span>
                  <span>PYTHON 3.11 [NUMBA_JIT]</span>
                </div>

                <pre className="text-[11px] text-[#F8F9FA] overflow-x-auto leading-relaxed font-tabular">
                  <code>{currentPillar.codeSnippet}</code>
                </pre>
              </div>

              <div className="mt-4 p-3 border border-white/10 bg-[#09090D] flex items-center justify-between text-xs text-[#7E8490]">
                <span>NEXT SYSTEM PARADIGM:</span>
                <button
                  onClick={() => setActiveTab((activeTab + 1) % pillars.length)}
                  className="text-[#FF5500] hover:text-[#FF8800] flex items-center gap-1 font-bold"
                >
                  <span>STEP 0{((activeTab + 1) % pillars.length) + 1}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
