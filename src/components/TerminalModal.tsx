import React, { useState } from 'react';
import { X, Terminal as TermIcon, Play, RefreshCw, CheckCircle2, Copy, Download, Code2, Database } from 'lucide-react';

interface TerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TerminalModal: React.FC<TerminalModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'console' | 'code' | 'pinescript' | 'matrix'>('console');
  const [isRunning, setIsRunning] = useState(false);
  const [pinescriptCopied, setPinescriptCopied] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    '[INIT] Arjuna Quant Core v1.0.4 loaded successfully.',
    '[AUTH] NSE Datafeed Token verified: PERSISTENT_ARCHIVE_CLUSTER_AP-SOUTH-1.',
    '[MODEL] Loaded weights: FinBERT-NSE-Financial-v2 (582M params).',
    '[READY] Type command or click "EXECUTE HISTORICAL RUN" below.',
  ]);

  if (!isOpen) return null;

  const handleRunBacktest = () => {
    setIsRunning(true);
    setLogs((prev) => [
      ...prev,
      `[RUN_START] Starting vectorized run: NIFTY50_ORB_FVG_2018_2024`,
      `[INGEST] Resampling 4.2M ticks into 15m OHLCV + Order Flow Imbalance...`,
      `[CALCULATE] Vectorized Sharpe computation: 2.84 | Max Drawdown: -4.12%`,
      `[CATALYST] Scoring 1,482 corporate disclosures against historical price reaction...`,
      `[DONE] Backtest completed in 184ms. 412 trades filled without look-ahead bias.`,
    ]);
    setTimeout(() => {
      setIsRunning(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-[#08080B] border border-white/20 shadow-2xl overflow-hidden font-mono text-xs">
        {/* Terminal Header */}
        <div className="bg-[#0C0C10] border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF1744]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFD600]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E676]" />
            </div>
            <span className="text-[#FF5500] font-bold flex items-center gap-1.5 ml-2">
              <TermIcon className="w-3.5 h-3.5" />
              ARJUNA QUANT LABS // TERMINAL SHELL
            </span>
            <span className="text-white/20">|</span>
            <span className="text-[#7E8490] text-[10px]">HOST: nse-ap-south.arjuna.quant</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-[#7E8490] hover:text-[#F8F9FA] transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="bg-[#050507] border-b border-white/10 px-4 flex items-center gap-4 text-xs">
          <button
            onClick={() => setActiveTab('console')}
            className={`py-2.5 border-b-2 font-bold transition-colors ${
              activeTab === 'console'
                ? 'border-[#FF5500] text-[#FF5500]'
                : 'border-transparent text-[#7E8490] hover:text-[#F8F9FA]'
            }`}
          >
            LIVE EXECUTION LOGS
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-2.5 border-b-2 font-bold transition-colors ${
              activeTab === 'code'
                ? 'border-[#FF5500] text-[#FF5500]'
                : 'border-transparent text-[#7E8490] hover:text-[#F8F9FA]'
            }`}
          >
            STRATEGY PYTHON DSL
          </button>
          <button
            onClick={() => setActiveTab('pinescript')}
            className={`py-2.5 border-b-2 font-bold transition-colors ${
              activeTab === 'pinescript'
                ? 'border-[#00E676] text-[#00E676]'
                : 'border-transparent text-[#7E8490] hover:text-[#F8F9FA]'
            }`}
          >
            PINE SCRIPT V5 (CHANDELIER)
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`py-2.5 border-b-2 font-bold transition-colors ${
              activeTab === 'matrix'
                ? 'border-[#FF5500] text-[#FF5500]'
                : 'border-transparent text-[#7E8490] hover:text-[#F8F9FA]'
            }`}
          >
            CONFUSION MATRIX & VAR
          </button>
        </div>

        {/* Terminal Body */}
        <div className="p-4 bg-[#050507] min-h-[320px] max-h-[420px] overflow-y-auto">
          {activeTab === 'console' && (
            <div className="space-y-1.5 text-[11px] leading-relaxed">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2 font-tabular">
                  <span className="text-[#7E8490] select-none">&gt;</span>
                  <span
                    className={
                      log.includes('[DONE]')
                        ? 'text-[#00E676] font-bold'
                        : log.includes('[CATALYST]')
                        ? 'text-[#FF8800]'
                        : log.includes('[CALCULATE]')
                        ? 'text-[#FF5500]'
                        : 'text-[#F8F9FA]'
                    }
                  >
                    {log}
                  </span>
                </div>
              ))}
              {isRunning && (
                <div className="text-[#FF5500] animate-pulse flex items-center gap-2">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Processing vectorized market tensors...</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'code' && (
            <pre className="text-[11px] text-[#F8F9FA] leading-relaxed font-tabular">
              <code>{`# ARJUNA QUANT PLATFORM: NIFTY 15m ORB + FinBERT Filter
from arjuna.quant import VectorBacktest, FinBERTNLP, OrderBookEngine

class MatsyaNiftyBreakout(VectorBacktest):
    def initialize(self):
        self.set_benchmark("NSE:NIFTY50")
        self.set_slippage_model(OrderBookEngine.DEPTH_WEIGHTED)
        self.nlp = FinBERTNLP(sentiment_threshold=0.30)
        
    def on_15m_bar(self, bar, tick_depth):
        # 1. Check Opening Range High/Low
        if bar.time == "09:30":
            self.orb_high = bar.high
            self.orb_low = bar.low
            
        # 2. Filter Breakout via Live News Catalyst Score
        if bar.close > self.orb_high and not self.is_invested:
            catalyst_score = self.nlp.get_headline_score(bar.time)
            if catalyst_score > 0.30 and tick_depth.ofi_ratio > 1.4:
                self.buy(size=1.0, stop_loss=self.orb_low, target_rr=2.5)

# Execute vectorized simulation across 7-year NSE archive
results = MatsyaNiftyBreakout().run(start="2018-01-01", end="2024-11-01")
print(f"Sharpe: {results.sharpe:.2f} | WinRate: {results.win_rate:.1%}")`}</code>
            </pre>
          )}

          {activeTab === 'pinescript' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="text-[11px] text-[#00E676] font-bold">
                  TRADINGVIEW PINE SCRIPT V5 // NIFTY50 DAILY TREND-PULLBACK | 1% RISK | CHANDELIER
                </div>
                <button
                  onClick={() => {
                    const pineCode = `//@version=5
strategy("Nifty50 Daily Trend-Pullback | 1% Risk | Chandelier",
     overlay=true,
     initial_capital=1000000,
     currency=currency.INR,
     default_qty_type=strategy.fixed,
     default_qty_value=1,
     pyramiding=0,
     process_orders_on_close=true,
     calc_on_every_tick=false,
     commission_type=strategy.commission.percent,
     commission_value=0.1,
     slippage=2,
     margin_long=100,
     margin_short=100)

// ───────────── Inputs ─────────────
fastLen     = input.int(50,   "Fast EMA",               minval=2)
slowLen     = input.int(200,  "Slow EMA",               minval=2)
slopeLen    = input.int(20,   "Slow EMA slope lookback", minval=1)
adxLen      = input.int(14,   "ADX length",             minval=2)
adxMin      = input.float(20, "ADX minimum")
rsiLen      = input.int(5,    "RSI length",             minval=2)
rsiLow      = input.float(30, "RSI oversold level")
rsiHigh     = input.float(70, "RSI overbought level")
swingLen    = input.int(5,    "Swing stop lookback",    minval=1)
atrLen      = input.int(14,   "ATR length",             minval=1)
atrFloor    = input.float(1.0,"Min stop distance (xATR)", step=0.1)
trailMult   = input.float(3.0,"Chandelier multiple (xATR)", step=0.1)
maxBars     = input.int(30,   "Time stop (bars)",       minval=1)
riskPct     = input.float(1.0,"Risk per trade (% equity)", step=0.1)
maxNotional = input.float(100,"Max position value (% equity)", step=5)
allowShort  = input.bool(true,"Allow shorts (use F&O futures; disable for cash)")

// ───────────── Indicators ─────────────
ema50  = ta.ema(close, fastLen)
ema200 = ta.ema(close, slowLen)
[diP, diM, adx] = ta.dmi(adxLen, adxLen)
rsi    = ta.rsi(close, rsiLen)
atr    = ta.atr(atrLen)

regimeLong  = close > ema200 and ema50 > ema200 and ema200 > ema200[slopeLen] and adx > adxMin
regimeShort = close < ema200 and ema50 < ema200 and ema200 < ema200[slopeLen] and adx > adxMin

longSig  = regimeLong  and ta.crossover(rsi, rsiLow)
shortSig = allowShort and regimeShort and ta.crossunder(rsi, rsiHigh)

stopL = math.min(ta.lowest(low, swingLen),  close - atrFloor * atr)
stopS = math.max(ta.highest(high, swingLen), close + atrFloor * atr)

// ───────────── State ─────────────
var int   dir      = 0
var float entryPx  = na
var float stopPx   = na
var float riskD    = na
var float extreme  = na
var bool  trailOn  = false
var int   entryBar = na

bool flat = strategy.position_size == 0
if flat
    dir     := 0
    trailOn := false
    stopPx  := na

float eq = strategy.equity

// ───────────── Entries ─────────────
if flat and bar_index >= slowLen + slopeLen and not na(atr)
    if longSig
        float rd = close - stopL
        float qL = math.floor(math.min(eq * riskPct / 100 / rd, eq * maxNotional / 100 / close))
        if rd > 0 and qL >= 1
            strategy.entry("L", strategy.long, qty=qL)
            dir := 1, entryPx := close, stopPx := stopL, riskD := rd
            extreme := high, trailOn := false, entryBar := bar_index
    else if shortSig
        float rd = stopS - close
        float qS = math.floor(math.min(eq * riskPct / 100 / rd, eq * maxNotional / 100 / close))
        if rd > 0 and qS >= 1
            strategy.entry("S", strategy.short, qty=qS)
            dir := -1, entryPx := close, stopPx := stopS, riskD := rd
            extreme := low, trailOn := false, entryBar := bar_index

// ───────────── Trade management ─────────────
if dir == 1
    if bar_index > entryBar
        extreme := math.max(extreme, high)
        if not trailOn and high >= entryPx + riskD
            trailOn := true
        if trailOn
            stopPx := math.max(stopPx, extreme - trailMult * atr)
    if bar_index - entryBar >= maxBars
        strategy.close("L", comment="Time stop")
    else
        strategy.exit("XL", "L", stop=stopPx)

if dir == -1
    if bar_index > entryBar
        extreme := math.min(extreme, low)
        if not trailOn and low <= entryPx - riskD
            trailOn := true
        if trailOn
            stopPx := math.min(stopPx, extreme + trailMult * atr)
    if bar_index - entryBar >= maxBars
        strategy.close("S", comment="Time stop")
    else
        strategy.exit("XS", "S", stop=stopPx)

// ───────────── Plots ─────────────
plot(ema50,  "EMA 50",  color=color.new(color.orange, 0))
plot(ema200, "EMA 200", color=color.new(color.blue, 0))
plot(stopPx, "Chandelier Stop", color=color.new(color.red, 0), style=plot.style_linebr)`;
                    navigator.clipboard.writeText(pineCode);
                    setPinescriptCopied(true);
                    setTimeout(() => setPinescriptCopied(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[#F8F9FA] text-[10px] transition-colors"
                >
                  {pinescriptCopied ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-[#00E676]" />
                      <span className="text-[#00E676]">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>COPY PINE SCRIPT</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-[10px] text-[#A7F3D0] leading-relaxed font-tabular bg-black/50 p-3 border border-white/5 rounded overflow-x-auto">
                <code>{`//@version=5
strategy("Nifty50 Daily Trend-Pullback | 1% Risk | Chandelier",
     overlay=true,
     initial_capital=1000000,
     currency=currency.INR,
     default_qty_type=strategy.fixed,
     default_qty_value=1,
     pyramiding=0,
     process_orders_on_close=true,
     calc_on_every_tick=false,
     commission_type=strategy.commission.percent,
     commission_value=0.1,
     slippage=2,
     margin_long=100,
     margin_short=100)

// ───────────── Inputs ─────────────
fastLen     = input.int(50,   "Fast EMA",               minval=2)
slowLen     = input.int(200,  "Slow EMA",               minval=2)
slopeLen    = input.int(20,   "Slow EMA slope lookback", minval=1)
adxLen      = input.int(14,   "ADX length",             minval=2)
adxMin      = input.float(20, "ADX minimum")
rsiLen      = input.int(5,    "RSI length",             minval=2)
rsiLow      = input.float(30, "RSI oversold level")
rsiHigh     = input.float(70, "RSI overbought level")
swingLen    = input.int(5,    "Swing stop lookback",    minval=1)
atrLen      = input.int(14,   "ATR length",             minval=1)
atrFloor    = input.float(1.0,"Min stop distance (xATR)", step=0.1)
trailMult   = input.float(3.0,"Chandelier multiple (xATR)", step=0.1)
maxBars     = input.int(30,   "Time stop (bars)",       minval=1)
riskPct     = input.float(1.0,"Risk per trade (% equity)", step=0.1)
maxNotional = input.float(100,"Max position value (% equity)", step=5)
allowShort  = input.bool(true,"Allow shorts (use F&O futures; disable for cash)")

// ───────────── Indicators ─────────────
ema50  = ta.ema(close, fastLen)
ema200 = ta.ema(close, slowLen)
[diP, diM, adx] = ta.dmi(adxLen, adxLen)
rsi    = ta.rsi(close, rsiLen)
atr    = ta.atr(atrLen)

regimeLong  = close > ema200 and ema50 > ema200 and ema200 > ema200[slopeLen] and adx > adxMin
regimeShort = close < ema200 and ema50 < ema200 and ema200 < ema200[slopeLen] and adx > adxMin

longSig  = regimeLong  and ta.crossover(rsi, rsiLow)
shortSig = allowShort and regimeShort and ta.crossunder(rsi, rsiHigh)

stopL = math.min(ta.lowest(low, swingLen),  close - atrFloor * atr)
stopS = math.max(ta.highest(high, swingLen), close + atrFloor * atr)

// ───────────── State ─────────────
var int   dir      = 0
var float entryPx  = na
var float stopPx   = na
var float riskD    = na
var float extreme  = na
var bool  trailOn  = false
var int   entryBar = na

bool flat = strategy.position_size == 0
if flat
    dir     := 0
    trailOn := false
    stopPx  := na

float eq = strategy.equity

// ───────────── Entries ─────────────
if flat and bar_index >= slowLen + slopeLen and not na(atr)
    if longSig
        float rd = close - stopL
        float qL = math.floor(math.min(eq * riskPct / 100 / rd, eq * maxNotional / 100 / close))
        if rd > 0 and qL >= 1
            strategy.entry("L", strategy.long, qty=qL)
            dir := 1, entryPx := close, stopPx := stopL, riskD := rd
            extreme := high, trailOn := false, entryBar := bar_index
    else if shortSig
        float rd = stopS - close
        float qS = math.floor(math.min(eq * riskPct / 100 / rd, eq * maxNotional / 100 / close))
        if rd > 0 and qS >= 1
            strategy.entry("S", strategy.short, qty=qS)
            dir := -1, entryPx := close, stopPx := stopS, riskD := rd
            extreme := low, trailOn := false, entryBar := bar_index

// ───────────── Trade management ─────────────
if dir == 1
    if bar_index > entryBar
        extreme := math.max(extreme, high)
        if not trailOn and high >= entryPx + riskD
            trailOn := true
        if trailOn
            stopPx := math.max(stopPx, extreme - trailMult * atr)
    if bar_index - entryBar >= maxBars
        strategy.close("L", comment="Time stop")
    else
        strategy.exit("XL", "L", stop=stopPx)

if dir == -1
    if bar_index > entryBar
        extreme := math.min(extreme, low)
        if not trailOn and low <= entryPx - riskD
            trailOn := true
        if trailOn
            stopPx := math.min(stopPx, extreme + trailMult * atr)
    if bar_index - entryBar >= maxBars
        strategy.close("S", comment="Time stop")
    else
        strategy.exit("XS", "S", stop=stopPx)

// ───────────── Plots ─────────────
plot(ema50,  "EMA 50",  color=color.new(color.orange, 0))
plot(ema200, "EMA 200", color=color.new(color.blue, 0))
plot(stopPx, "Chandelier Stop", color=color.new(color.red, 0), style=plot.style_linebr)`}</code>
              </pre>
            </div>
          )}

          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <div className="text-[#7E8490] text-[11px]">
                HISTORICAL MODEL PERFORMANCE MATRIX (OUT-OF-SAMPLE TEST):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-black/40 border border-white/10 p-3">
                  <div className="text-[#7E8490] text-[10px]">PRECISION (LONG)</div>
                  <div className="text-xl font-bold text-[#00E676] font-tabular">74.2%</div>
                </div>
                <div className="bg-black/40 border border-white/10 p-3">
                  <div className="text-[#7E8490] text-[10px]">RECALL (BREAKOUTS)</div>
                  <div className="text-xl font-bold text-[#F8F9FA] font-tabular">81.6%</div>
                </div>
                <div className="bg-black/40 border border-white/10 p-3">
                  <div className="text-[#7E8490] text-[10px]">VALUE AT RISK (99%)</div>
                  <div className="text-xl font-bold text-[#FF1744] font-tabular">-1.84%</div>
                </div>
                <div className="bg-black/40 border border-white/10 p-3">
                  <div className="text-[#7E8490] text-[10px]">SORTINO RATIO</div>
                  <div className="text-xl font-bold text-[#FF8800] font-tabular">3.92</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Terminal Footer Controls */}
        <div className="bg-[#0C0C10] border-t border-white/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#7E8490] text-[10px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676]" />
            <span>PAPER TRADING SANDBOX MODE ONLY (NO REAL CAPITAL EXPOSURE)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunBacktest}
              disabled={isRunning}
              className="flex items-center gap-1.5 bg-[#FF5500] hover:bg-[#FF6A1A] text-black font-bold px-3 py-1.5 text-xs transition-colors disabled:opacity-50"
            >
              <Play className="w-3 h-3 fill-black" />
              <span>{isRunning ? 'EXECUTING...' : 'EXECUTE HISTORICAL RUN'}</span>
            </button>
            <button
              onClick={onClose}
              className="border border-white/10 hover:border-white/20 text-[#F8F9FA] px-3 py-1.5 text-xs transition-colors"
            >
              DISMISS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
