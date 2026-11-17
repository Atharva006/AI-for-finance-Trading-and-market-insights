import React, { useState } from 'react';
import { Workflow, Sparkles, ArrowRight, CheckCircle2, Terminal } from 'lucide-react';
import { quantSound } from './AudioAmbience';
import { LiquidMetalButton } from '@/components/ui/liquid-metal-button';

interface PromptTemplate {
  id: string;
  title: string;
  promptText: string;
  ticker: string;
  timeframe: string;
  trigger: string;
  riskReward: string;
  riskPerTrade: string;
  nlpFilter: string;
  generatedDsl: string;
}

const templates: PromptTemplate[] = [
  {
    id: 'orb-prompt',
    title: 'Prompt 01: NIFTY 15M ORB + FinBERT News Polarity',
    promptText:
      'Buy 50 contracts of NIFTY 50 if the 09:15-09:30 15-minute candle breaks above high with volume > 1.5x 20-period average AND FinBERT macroeconomic sentiment polarity is > +0.35. Set Stop Loss at 1.2x ATR and Profit Target at 1:2.5 Risk-to-Reward ratio.',
    ticker: 'NIFTY 50 (NSE_INDEX)',
    timeframe: '15m Candle',
    trigger: 'Breakout > 15m High + Volume Surge',
    riskReward: '1:2.5 Minimum RR',
    riskPerTrade: '1.0% Capital Risk (₹1,000 / ₹1L)',
    nlpFilter: 'Polarity Score >= +0.35',
    generatedDsl: `@strategy("Nifty15mORB_NLP")
class NiftyBreakout(BaseQuantModel):
    def on_15m_close(self, bar, order_book, nlp_stream):
        if bar.time == "09:30:00" and bar.volume > self.vol_ma * 1.5:
            sentiment = nlp_stream.get_polarity(window="1h")
            if sentiment.score >= 0.35:
                stop_loss = bar.close - (1.2 * self.atr(14))
                target = bar.close + (2.5 * (bar.close - stop_loss))
                return self.place_bracket_order(symbol="NIFTY", qty=50, sl=stop_loss, tp=target)`,
  },
  {
    id: 'stoch-prompt',
    title: 'Prompt 02: Stochastic Oscillator (%K, %D) 1:3.0 RR Swing',
    promptText:
      'Daily swing on NSE NIFTY 50: Enter Long when %K (14) crosses above %D (3) below 20 (oversold condition). Enter Short when %K crosses below %D above 80 (overbought condition). Strict 2% risk per trade on ₹1,00,000 capital. Dynamic position size = ₹2,000 / (1.2x ATR). Exit at minimum 1:3.0 RR.',
    ticker: 'NIFTY 50 (NSE_INDEX)',
    timeframe: 'Daily (1D)',
    trigger: 'Stoch %K cross %D < 20 (Long) / > 80 (Short)',
    riskReward: '1:3.0 High Payoff RR',
    riskPerTrade: '2.0% Fixed Risk (₹2,000 / ₹1L)',
    nlpFilter: 'Regime Filter: Exclude RBI Policy Day',
    generatedDsl: `@strategy("Stochastic_Inflection_Daily")
class StochSwingCore(BaseQuantModel):
    def on_daily_close(self, bar):
        k, d = self.stochastic(period_k=14, smooth_k=3, period_d=3)
        if crossover(k, d) and k[-1] < 20:
            sl_dist = 1.2 * self.atr(14)
            pos_size = self.calculate_risk_qty(risk_amount=2000, stop_distance=sl_dist)
            return self.order_target_ratio(action="BUY", qty=pos_size, sl_dist=sl_dist, rr_ratio=3.0)`,
  },
  {
    id: 'fvg-prompt',
    title: 'Prompt 03: RELIANCE Order Block & Fair Value Gap 5M',
    promptText:
      'Scan RELIANCE 5-minute bars for unmitigated Bullish Fair Value Gaps (FVG) where Low[t] > High[t-2]. Confirm institutional accumulation when Order Flow Imbalance (OFI) exceeds +10,000 shares. Place limit order at FVG midpoint with trailing stop at recent swing low.',
    ticker: 'RELIANCE.NS (NSE_EQ)',
    timeframe: '5m Microstructure',
    trigger: 'Bullish FVG Retest + OFI > +10k shares',
    riskReward: '1:3.4 Structural RR',
    riskPerTrade: '1.5% Risk per Position',
    nlpFilter: 'OFI Delta & Level 2 Depth Match',
    generatedDsl: `@strategy("Reliance_FVG_OrderBlock")
class RelianceFVG(BaseQuantModel):
    def on_tick_aggregation(self, fvg_cluster, l2_depth):
        if fvg_cluster.is_bullish_unmitigated and l2_depth.ofi > 10000:
            entry_limit = fvg_cluster.midpoint
            stop_loss = fvg_cluster.swing_low
            return self.post_limit_bid(price=entry_limit, sl=stop_loss, target_mult=3.4)`,
  },
];

export const VisualFlowShowcase: React.FC = () => {
  const [activeTemplateIdx, setActiveTemplateIdx] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const current = templates[activeTemplateIdx];

  const handleSelect = (idx: number) => {
    quantSound.playClick();
    setActiveTemplateIdx(idx);
    setCopied(false);
  };

  const handleCompile = () => {
    quantSound.playTargetLock();
    navigator.clipboard.writeText(current.generatedDsl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="visual-studio" className="py-20 bg-[#FBFBFC] border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Title */}
        <div className="mb-10 border-b border-gray-200 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#FF5500]">
              <Workflow className="w-3.5 h-3.5" />
              <span>SECTION 03 // VISUAL STRATEGY STUDIO & NLP</span>
              <span className="text-gray-300">|</span>
              <span className="text-[#64748B]">PROMPT-TO-ALGO & NODE COMPILER</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0A0A0D] tracking-tight mt-1">
              Natural Language Prompting to Vector Backtest
            </h2>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 text-[#059669] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5500]" />
              FINBERT TO VECTOR DSL ENGINE
            </span>
          </div>
        </div>

        {/* Template Prompt Selector Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
          {templates.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => handleSelect(idx)}
              className={`px-4 py-2 text-xs font-mono transition-all duration-150 whitespace-nowrap flex items-center gap-2 border ${
                activeTemplateIdx === idx
                  ? 'bg-[#0A0A0D] text-white border-[#0A0A0D] font-bold shadow-sm'
                  : 'bg-white text-[#475569] border-gray-200 hover:border-gray-400 hover:text-[#0A0A0D]'
              }`}
            >
              <span>{t.title}</span>
            </button>
          ))}
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Natural Language Input & Synthesis Blueprint */}
          <div className="lg:col-span-6 space-y-6">
            {/* Prompt Box */}
            <div className="border border-gray-200 bg-white p-5 font-mono shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs">
                <span className="text-[#FF5500] font-bold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  NATURAL LANGUAGE QUANT PROMPT
                </span>
                <span className="text-[10px] text-[#64748B]">PROMPT TOKEN LENGTH: 48</span>
              </div>

              <div className="p-4 bg-[#F8FAFC] border border-gray-200 text-xs text-[#0A0A0D] leading-relaxed font-sans font-medium">
                "{current.promptText}"
              </div>

              {/* Action Bar with Liquid Metal Button */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-[#059669] font-bold">READY TO COMPILE</span>
                <LiquidMetalButton
                  label="Compile Prompt"
                  onClick={handleCompile}
                  viewMode="text"
                />
              </div>

              {/* Synthesized Parameter Extraction */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-[11px]">
                <div className="p-2.5 bg-white border border-gray-100">
                  <div className="text-[10px] text-[#64748B]">TARGET ASSET:</div>
                  <div className="font-bold text-[#0A0A0D] font-tabular mt-0.5">{current.ticker}</div>
                </div>
                <div className="p-2.5 bg-white border border-gray-100">
                  <div className="text-[10px] text-[#64748B]">TIMEFRAME:</div>
                  <div className="font-bold text-[#FF5500] font-tabular mt-0.5">{current.timeframe}</div>
                </div>
                <div className="p-2.5 bg-white border border-gray-100">
                  <div className="text-[10px] text-[#64748B]">EXECUTION TRIGGER:</div>
                  <div className="font-bold text-[#0A0A0D] mt-0.5">{current.trigger}</div>
                </div>
                <div className="p-2.5 bg-white border border-gray-100">
                  <div className="text-[10px] text-[#64748B]">RISK-TO-REWARD:</div>
                  <div className="font-bold text-[#059669] font-tabular mt-0.5">{current.riskReward}</div>
                </div>
              </div>
            </div>

            {/* Visual Node Flow Map */}
            <div className="border border-gray-200 bg-white p-5 font-mono shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs">
                <span className="text-[#0A0A0D] font-bold flex items-center gap-1.5">
                  <Workflow className="w-3.5 h-3.5 text-[#FF5500]" />
                  VISUAL FLOW NODE GRAPH (REAL-TIME SIGNAL PIPELINE)
                </span>
                <span className="text-[10px] text-[#059669] font-bold">5 NODES ACTIVE</span>
              </div>

              {/* Connected Flow Pills */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-3 p-2.5 bg-[#F8FAFC] border border-gray-200">
                  <span className="w-5 h-5 rounded-full bg-[#0A0A0D] text-white flex items-center justify-center text-[10px] font-bold">
                    01
                  </span>
                  <div className="flex-1">
                    <div className="font-bold text-[#0A0A0D]">📡 NSE Historical & Live Tick Feed</div>
                    <div className="text-[10px] text-[#64748B]">100% Genuine Upstox API v3 Data stream (No synthetic drift)</div>
                  </div>
                  <span className="text-[10px] text-[#059669] font-bold">READY</span>
                </div>

                <div className="flex justify-center text-gray-300">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>

                <div className="flex items-center gap-3 p-2.5 bg-[#FFF7ED] border border-[#FF5500]/30">
                  <span className="w-5 h-5 rounded-full bg-[#FF5500] text-white flex items-center justify-center text-[10px] font-bold">
                    02
                  </span>
                  <div className="flex-1">
                    <div className="font-bold text-[#FF5500]">🧠 FinBERT NLP Sentiment Vector Filter</div>
                    <div className="text-[10px] text-[#0A0A0D]">{current.nlpFilter}</div>
                  </div>
                  <span className="text-[10px] text-[#FF5500] font-bold animate-pulse">GATE</span>
                </div>

                <div className="flex justify-center text-gray-300">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>

                <div className="flex items-center gap-3 p-2.5 bg-[#F8FAFC] border border-gray-200">
                  <span className="w-5 h-5 rounded-full bg-[#0A0A0D] text-white flex items-center justify-center text-[10px] font-bold">
                    03
                  </span>
                  <div className="flex-1">
                    <div className="font-bold text-[#0A0A0D]">⚡ Quantitative Strategy Logic Block</div>
                    <div className="text-[10px] text-[#64748B]">{current.trigger}</div>
                  </div>
                  <span className="text-[10px] text-[#059669] font-bold">VALIDATED</span>
                </div>

                <div className="flex justify-center text-gray-300">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>

                <div className="flex items-center gap-3 p-2.5 bg-[#F8FAFC] border border-gray-200">
                  <span className="w-5 h-5 rounded-full bg-[#0A0A0D] text-white flex items-center justify-center text-[10px] font-bold">
                    04
                  </span>
                  <div className="flex-1">
                    <div className="font-bold text-[#0A0A0D]">🛡️ Dynamic Capital & Volatility Sizing</div>
                    <div className="text-[10px] text-[#64748B]">{current.riskPerTrade} · {current.riskReward}</div>
                  </div>
                  <span className="text-[10px] text-[#059669] font-bold">ENFORCED</span>
                </div>

                <div className="flex justify-center text-gray-300">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>

                <div className="flex items-center gap-3 p-2.5 bg-white border border-[#059669]/40 shadow-sm">
                  <span className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center text-[10px] font-bold">
                    05
                  </span>
                  <div className="flex-1">
                    <div className="font-bold text-[#059669]">🚀 Upstox Broker Order Router (Paper / Live)</div>
                    <div className="text-[10px] text-[#64748B]">Zero-slippage limit / stop bracket execution</div>
                  </div>
                  <span className="text-[10px] text-[#059669] font-bold">AUTHENTICATED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Synthesized Python Strategy DSL Source */}
          <div className="lg:col-span-6 space-y-6">
            <div className="border border-gray-200 bg-[#08080B] p-5 font-mono shadow-card space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-[#FF5500] font-bold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  SYNTHESIZED PYTHON VECTOR DSL
                </span>
                <button
                  onClick={handleCompile}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[#F8F9FA] text-[10px] transition-colors"
                >
                  {copied ? 'COPIED TO CLIPBOARD' : 'COPY CODE'}
                </button>
              </div>

              <pre className="text-[#A2A8B4] p-4 bg-[#050507] border border-white/5 overflow-x-auto leading-relaxed text-[11px] font-mono select-text">
                <code>{current.generatedDsl}</code>
              </pre>

              {/* Execution Blueprint Specs */}
              <div className="border-t border-white/10 pt-4 space-y-2 text-[11px]">
                <div className="text-[#F8F9FA] font-bold">COMPILER VERIFICATION SPECS:</div>
                <div className="grid grid-cols-2 gap-2 text-white/70">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676]" />
                    <span>Zero Synthetic Repainting</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676]" />
                    <span>In-Memory Tick Ingestion</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676]" />
                    <span>Dynamic ATR Volatility Stop</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676]" />
                    <span>Upstox Bearer JWT Handshake</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
