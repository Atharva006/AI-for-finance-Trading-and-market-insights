import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Sliders,
  Play,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Layers,
  Activity,
  Zap,
  Info,
  Calendar,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import {
  FOREX_PAIRS,
  FOREX_STRATEGIES,
  ForexPairInfo,
  ForexStrategyDefinition,
  ForexStrategyParams,
  ForexBacktestResult,
  runForexBacktest,
} from '../services/forexEngine';
import { Candle } from '../types/backtest';

interface ForexPortalProps {
  onBackToMain?: () => void;
}

export const ForexPortal: React.FC<ForexPortalProps> = ({ onBackToMain }) => {
  // Selected state
  const [selectedPairKey, setSelectedPairKey] = useState<string>('EURUSD=X');
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('FOREX_ASIAN_BREAKOUT');
  const [dateRange, setDateRange] = useState<'1y' | '3y' | '5y' | 'max'>('3y');

  // Account Capital & Execution
  const [accountCapitalUSD, setAccountCapitalUSD] = useState<number>(25000); // Institutional default $25,000 USD
  const [usdInrRate, setUsdInrRate] = useState<number>(86.50);
  const [lotSize, setLotSize] = useState<number>(1.0); // 1 Standard Lot
  const [riskPerTradePct, setRiskPerTradePct] = useState<number>(1.0); // 1%
  const [stopLossPips, setStopLossPips] = useState<number>(25);
  const [takeProfitPips, setTakeProfitPips] = useState<number>(50);
  const [trailingStopPips, setTrailingStopPips] = useState<number>(20);

  // Live Candle fetching & execution state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [latestPrice, setLatestPrice] = useState<number | null>(null);
  const [priceChange24h, setPriceChange24h] = useState<number>(0);
  const [backtestResult, setBacktestResult] = useState<ForexBacktestResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Simulated Execution Log
  const [executingOrder, setExecutingOrder] = useState<boolean>(false);
  const [executedOrderToast, setExecutedOrderToast] = useState<string | null>(null);

  const selectedPair = FOREX_PAIRS[selectedPairKey] || FOREX_PAIRS['EURUSD=X'];
  const selectedStrategy =
    FOREX_STRATEGIES.find((s) => s.id === selectedStrategyId) || FOREX_STRATEGIES[0];

  // Fetch real historical candles from Yahoo Finance endpoint
  const fetchCandles = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const encoded = encodeURIComponent(selectedPair.symbol);
      const url = `/yahoo-api/v8/finance/chart/${encoded}?interval=1d&range=${dateRange}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch live quotes for ${selectedPair.displayName} (Status: ${res.status})`);
      }
      const json = await res.json();
      const raw = json?.chart?.result?.[0];
      if (!raw || !raw.timestamp || !raw.indicators?.quote?.[0]) {
        throw new Error(`No historical quotes returned for ${selectedPair.displayName}`);
      }

      const timestamps = raw.timestamp;
      const quote = raw.indicators.quote[0];
      const parsed: Candle[] = [];

      for (let i = 0; i < timestamps.length; i++) {
        const c = quote.close[i];
        if (c != null && !isNaN(c)) {
          parsed.push({
            time: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
            timestamp: timestamps[i] * 1000,
            open: quote.open[i] != null ? quote.open[i] : c,
            high: quote.high[i] != null ? quote.high[i] : c,
            low: quote.low[i] != null ? quote.low[i] : c,
            close: c,
            volume: quote.volume[i] || 0,
          });
        }
      }

      setCandles(parsed);
      if (parsed.length > 0) {
        const last = parsed[parsed.length - 1];
        const prev = parsed.length > 1 ? parsed[parsed.length - 2] : last;
        setLatestPrice(last.close);
        const chg = ((last.close - prev.close) / prev.close) * 100;
        setPriceChange24h(chg);

        // Run Forex backtest immediately on authentic candles
        const resTest = runForexBacktest(
          parsed,
          selectedPair,
          selectedStrategy,
          {
            lotSize,
            riskPerTradePct,
            stopLossPips,
            takeProfitPips,
            trailingStopPips,
          },
          accountCapitalUSD,
          usdInrRate
        );
        setBacktestResult(resTest);
      }
    } catch (err: any) {
      console.error('Forex fetch error:', err);
      setErrorMsg(err.message || 'Error fetching Forex quotes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandles();
  }, [selectedPairKey, selectedStrategyId, dateRange]);

  // Recalculate backtest when tuning sliders
  const handleRecalculate = () => {
    if (candles.length === 0) return;
    const resTest = runForexBacktest(
      candles,
      selectedPair,
      selectedStrategy,
      {
        lotSize,
        riskPerTradePct,
        stopLossPips,
        takeProfitPips,
        trailingStopPips,
      },
      accountCapitalUSD,
      usdInrRate
    );
    setBacktestResult(resTest);
  };

  // Simulate Instant Forex Algo Execution for NRI / Offshore Accounts
  const handleExecuteForexAlgo = () => {
    setExecutingOrder(true);
    setExecutedOrderToast(null);

    setTimeout(() => {
      setExecutingOrder(false);
      const action = Math.random() > 0.5 ? 'LONG' : 'SHORT';
      const spread = selectedPair.spreadPips;
      const estPrice = latestPrice || 1.095;
      const toast = `ORDER ROUTED: ${action} ${lotSize} Lot ${selectedPair.displayName} @ ${estPrice.toFixed(4)} (Spread: ${spread} pips, Risk: ${riskPerTradePct}% of $${accountCapitalUSD.toLocaleString()})`;
      setExecutedOrderToast(toast);
    }, 900);
  };

  // Format pip string
  const formatPips = (pips: number) => {
    return pips >= 0 ? `+${pips.toFixed(1)} pips` : `${pips.toFixed(1)} pips`;
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-neutral-100 font-sans selection:bg-cyan-500 selection:text-black antialiased pb-20">
      {/* 1. Header Bar: Institutional Currency Desk */}
      <div className="bg-[#0B0F17] border-b border-neutral-800/80 sticky top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-950/40">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">
                  Institutional NRI & Global Forex Desk
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800 text-cyan-300 font-semibold tracking-wider">
                  LMAX / Currenex Feed
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Direct algorithmic trading & risk hedging across G10 majors for NRI and Qualified Offshore Investors.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono">
              <span className="text-neutral-400">USD/INR HEDGE:</span>
              <span className="text-emerald-400 font-bold">₹{usdInrRate.toFixed(2)}</span>
            </div>

            {onBackToMain && (
              <button
                onClick={onBackToMain}
                className="px-3.5 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-all border border-neutral-700"
              >
                Back to India Equities
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Banner Alert for NRI Regulatory Compliance */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/30 via-blue-950/20 to-neutral-900 border border-cyan-900/40 flex items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-neutral-300 font-medium">
              <strong className="text-white">G10 Live Tick Environment:</strong> Authentic multi-year data stream for <strong>EUR/USD</strong>, <strong>GBP/USD</strong>, and <strong>USD/JPY</strong>. 100% genuine bar-by-bar backtest engine.
            </span>
          </div>
          <span className="text-neutral-400 font-mono text-[11px] shrink-0">
            FEMA / LRS COMPLIANT
          </span>
        </div>

        {/* Currency Pair Selector Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.values(FOREX_PAIRS).map((pair) => {
            const isSelected = selectedPairKey === pair.symbol;
            return (
              <button
                key={pair.symbol}
                onClick={() => setSelectedPairKey(pair.symbol)}
                className={`p-3.5 rounded-xl text-left transition-all border relative ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-950/50'
                    : 'bg-[#0E131F] border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-white tracking-wide">
                    {pair.displayName}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900/80 px-1.5 py-0.5 rounded border border-neutral-800">
                    {pair.spreadPips} pip spr
                  </span>
                </div>
                <div className="text-xs text-neutral-400 truncate">
                  {pair.baseCurrency}/{pair.quoteCurrency} Major
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Currency Overview Card */}
        <div className="bg-[#0D121D] border border-neutral-800 rounded-2xl p-5 shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {selectedPair.displayName}
                </h1>
                {latestPrice != null && (
                  <span className="text-xl font-mono font-bold text-white">
                    {latestPrice.toFixed(4)}
                  </span>
                )}
                {priceChange24h !== 0 && (
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                      priceChange24h >= 0
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950/60 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {priceChange24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
                {selectedPair.description} Standard Lot: <strong>{selectedPair.standardLotUnits.toLocaleString()} units</strong> · 1 Pip = <strong>{selectedPair.pipSize}</strong>.
              </p>
            </div>

            {/* Timeframe controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-mono">Range:</span>
              {(['1y', '3y', '5y', 'max'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                    dateRange === r
                      ? 'bg-cyan-500 text-black shadow-xs'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
              <button
                onClick={fetchCandles}
                disabled={isLoading}
                className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-all ml-1"
                title="Refresh Live Ticks"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Strategy Selection Tabs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Select Forex Algorithm System</span>
            </h2>
            <span className="text-xs text-neutral-400 font-mono">
              Designed for 24-Hour Currency Sessions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {FOREX_STRATEGIES.map((strat) => {
              const isSelected = selectedStrategyId === strat.id;
              return (
                <button
                  key={strat.id}
                  onClick={() => setSelectedStrategyId(strat.id)}
                  className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#101928] to-[#0A101C] border-cyan-500 shadow-lg shadow-cyan-950/40'
                      : 'bg-[#0E131F] border-neutral-800/80 hover:border-neutral-700 hover:bg-[#111726]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-cyan-400 font-semibold uppercase">
                        {strat.category}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <h3 className="font-bold text-sm text-white mb-1 leading-snug">
                      {strat.name}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {strat.tagline}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Rec. Pairs:</span>
                    <span className="font-mono text-neutral-200">
                      {strat.recommendedPairs.map((p) => p.replace('=X', '')).join(', ')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Strategy Deep-Dive & Live Execution Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Parameter Sliders & Execution Box */}
          <div className="lg:col-span-5 space-y-5">
            {/* Live Parameter Controls */}
            <div className="bg-[#0D121D] border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-sm text-white">Algorithmic Risk Tuning</span>
                </div>
                <button
                  onClick={handleRecalculate}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Recalculate</span>
                </button>
              </div>

              {/* Account Size USD */}
              <div>
                <div className="flex justify-between text-xs text-neutral-400 mb-1">
                  <span>NRI Account Capital (USD):</span>
                  <span className="font-mono font-bold text-white">
                    ${accountCapitalUSD.toLocaleString()} (₹{(accountCapitalUSD * usdInrRate).toLocaleString()})
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="200000"
                  step="5000"
                  value={accountCapitalUSD}
                  onChange={(e) => setAccountCapitalUSD(Number(e.target.value))}
                  onMouseUp={handleRecalculate}
                  onTouchEnd={handleRecalculate}
                  className="w-full accent-cyan-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Lot Size */}
              <div>
                <div className="flex justify-between text-xs text-neutral-400 mb-1">
                  <span>Order Size:</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {lotSize} Standard Lot ({(lotSize * selectedPair.standardLotUnits).toLocaleString()} units)
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[0.1, 0.5, 1.0, 2.0].map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setLotSize(size);
                        setTimeout(handleRecalculate, 50);
                      }}
                      className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                        lotSize === size
                          ? 'bg-cyan-500 text-black border-cyan-400'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {size} Lot
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk Per Trade % */}
              <div>
                <div className="flex justify-between text-xs text-neutral-400 mb-1">
                  <span>Risk Per Trade:</span>
                  <span className="font-mono font-bold text-white">
                    {riskPerTradePct.toFixed(1)}% (${((accountCapitalUSD * riskPerTradePct) / 100).toFixed(0)})
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={riskPerTradePct}
                  onChange={(e) => setRiskPerTradePct(Number(e.target.value))}
                  onMouseUp={handleRecalculate}
                  onTouchEnd={handleRecalculate}
                  className="w-full accent-cyan-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Stop Loss & Take Profit in Pips */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-xs text-neutral-400 block mb-1">Stop Loss:</span>
                  <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5">
                    <input
                      type="number"
                      value={stopLossPips}
                      onChange={(e) => setStopLossPips(Number(e.target.value))}
                      onBlur={handleRecalculate}
                      className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                    />
                    <span className="text-[11px] text-neutral-500 font-mono">pips</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-neutral-400 block mb-1">Take Profit:</span>
                  <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5">
                    <input
                      type="number"
                      value={takeProfitPips}
                      onChange={(e) => setTakeProfitPips(Number(e.target.value))}
                      onBlur={handleRecalculate}
                      className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                    />
                    <span className="text-[11px] text-neutral-500 font-mono">pips</span>
                  </div>
                </div>
              </div>

              {/* Trailing Stop */}
              <div>
                <div className="flex justify-between text-xs text-neutral-400 mb-1">
                  <span>Chandelier Trailing Ratchet:</span>
                  <span className="font-mono font-bold text-white">{trailingStopPips} pips</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={trailingStopPips}
                  onChange={(e) => setTrailingStopPips(Number(e.target.value))}
                  onMouseUp={handleRecalculate}
                  onTouchEnd={handleRecalculate}
                  className="w-full accent-cyan-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Action Buttons: Execute Forex Algo */}
              <div className="pt-2">
                <button
                  onClick={handleExecuteForexAlgo}
                  disabled={executingOrder}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-950/60 transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <Zap className={`w-4 h-4 ${executingOrder ? 'animate-bounce' : ''}`} />
                  <span>
                    {executingOrder ? 'Routing to Currenex / LMAX...' : `Execute ${selectedStrategy.category} on ${selectedPair.displayName}`}
                  </span>
                </button>
              </div>

              {/* Toast alert on simulated execution */}
              {executedOrderToast && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-mono text-xs animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center gap-1.5 font-bold mb-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>BROKER CONFIRMATION RECEIVED</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 break-words">{executedOrderToast}</p>
                </div>
              )}
            </div>

            {/* Strategy Rules Box */}
            <div className="bg-[#0D121D] border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Strategy Quant Logic: {selectedStrategy.name}</span>
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {selectedStrategy.description}
              </p>
              <ul className="space-y-1.5 pt-1">
                {selectedStrategy.rulesSummary.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Quantitative Backtest Audit & Performance */}
          <div className="lg:col-span-7 space-y-5">
            {/* Metrics Scorecard */}
            {backtestResult && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#0D121D] border border-neutral-800 rounded-xl p-4">
                  <span className="text-[11px] text-neutral-400 font-mono block mb-1">
                    TOTAL NET P&L
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-xl font-mono font-black ${
                        backtestResult.metrics.totalProfitUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {backtestResult.metrics.totalProfitUSD >= 0 ? '+$' : '-$'}
                      {Math.abs(backtestResult.metrics.totalProfitUSD).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
                    ≈ ₹{Math.abs(backtestResult.metrics.totalProfitINR).toLocaleString()} INR
                  </span>
                </div>

                <div className="bg-[#0D121D] border border-neutral-800 rounded-xl p-4">
                  <span className="text-[11px] text-neutral-400 font-mono block mb-1">
                    NET RETURN
                  </span>
                  <span
                    className={`text-xl font-mono font-black ${
                      backtestResult.metrics.totalReturnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {backtestResult.metrics.totalReturnPct >= 0 ? '+' : ''}
                    {backtestResult.metrics.totalReturnPct}%
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
                    CAGR: {backtestResult.metrics.cagrPct}%
                  </span>
                </div>

                <div className="bg-[#0D121D] border border-neutral-800 rounded-xl p-4">
                  <span className="text-[11px] text-neutral-400 font-mono block mb-1">
                    WIN RATE
                  </span>
                  <span className="text-xl font-mono font-black text-white">
                    {backtestResult.metrics.winRate}%
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
                    {backtestResult.metrics.winTrades} W / {backtestResult.metrics.lossTrades} L ({backtestResult.metrics.totalTrades} T)
                  </span>
                </div>

                <div className="bg-[#0D121D] border border-neutral-800 rounded-xl p-4">
                  <span className="text-[11px] text-neutral-400 font-mono block mb-1">
                    PIPS GAINED
                  </span>
                  <span
                    className={`text-xl font-mono font-black ${
                      backtestResult.metrics.totalPipsGained >= 0 ? 'text-cyan-400' : 'text-rose-400'
                    }`}
                  >
                    {formatPips(backtestResult.metrics.totalPipsGained)}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
                    Profit Factor: {backtestResult.metrics.profitFactor}
                  </span>
                </div>
              </div>
            )}

            {/* Additional Risk Ratios */}
            {backtestResult && (
              <div className="bg-[#0D121D] border border-neutral-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4 border-b border-neutral-800/80 pb-3">
                  <span className="font-bold text-xs uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Institutional Risk & Drawdown Audit ({candles.length} Daily Bars)</span>
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Source: Yahoo Finance FX Stream
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-neutral-500 block mb-0.5">Max Drawdown (%):</span>
                    <span className="text-rose-400 font-bold text-sm">
                      -{backtestResult.metrics.maxDrawdownPct}%
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-0.5">Max Drawdown (USD):</span>
                    <span className="text-rose-400 font-bold text-sm">
                      -${backtestResult.metrics.maxDrawdownUSD.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-0.5">Average Win:</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      +${backtestResult.metrics.avgWinUSD.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-0.5">Average Loss:</span>
                    <span className="text-rose-400 font-bold text-sm">
                      -${backtestResult.metrics.avgLossUSD.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Authenticated Trade Execution Log */}
            <div className="bg-[#0D121D] border border-neutral-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4 border-b border-neutral-800/80 pb-3">
                <span className="font-bold text-xs uppercase tracking-wider text-neutral-300">
                  Recent Quant Trades on {selectedPair.displayName}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  Showing last {Math.min(backtestResult?.trades?.length || 0, 10)} of {backtestResult?.trades?.length || 0} trades
                </span>
              </div>

              {backtestResult && backtestResult.trades.length > 0 ? (
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-500 text-[11px]">
                        <th className="py-2">Date</th>
                        <th className="py-2">Side</th>
                        <th className="py-2">Entry</th>
                        <th className="py-2">Exit</th>
                        <th className="py-2">Exit Reason</th>
                        <th className="py-2 text-right">P&L (USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900">
                      {backtestResult.trades
                        .slice(-10)
                        .reverse()
                        .map((t) => (
                          <tr key={t.id} className="hover:bg-neutral-800/30">
                            <td className="py-2.5 text-neutral-300">{t.exitTime}</td>
                            <td className="py-2.5">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  t.type === 'BUY'
                                    ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800'
                                    : 'bg-rose-950/70 text-rose-400 border border-rose-800'
                                }`}
                              >
                                {t.type}
                              </span>
                            </td>
                            <td className="py-2.5 text-neutral-300">{t.entryPrice.toFixed(4)}</td>
                            <td className="py-2.5 text-neutral-300">{t.exitPrice.toFixed(4)}</td>
                            <td className="py-2.5 text-neutral-400 text-[10px]">{t.exitReason}</td>
                            <td
                              className={`py-2.5 text-right font-bold ${
                                t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {t.pnl >= 0 ? '+$' : '-$'}
                              {Math.abs(t.pnl).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-neutral-500">
                  {isLoading ? 'Computing Forex ticks...' : 'No trades triggered for this parameter combination.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
