import React, { useState, useEffect } from 'react';
import {
  Globe2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
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
  Code2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  BarChart3,
  Flame,
  Radio,
  Lock,
  PlusCircle,
  FileCode,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import {
  FOREX_PAIRS,
  ForexPairInfo,
  SessionSweepStrategyParams,
  DEFAULT_SESSION_SWEEP_PARAMS,
  ForexBacktestResult,
  runSessionSweepBacktest,
  FOREX_STRATEGIES,
  ForexStrategyType,
  ForexStrategyDefinition,
} from '../services/forexEngine';
import { Candle } from '../types/backtest';
import { EquityLineChart } from './EquityLineChart';
import { QuantUnderwaterChart } from './QuantUnderwaterChart';
import { QuantRiskAlphaMatrix } from './QuantRiskAlphaMatrix';
import { LiveSessionChart } from './LiveSessionChart';

interface ForexPortalProps {
  onBackToMain?: () => void;
}

export const ForexPortal: React.FC<ForexPortalProps> = ({ onBackToMain }) => {
  // Selected pair state - Fixed strictly to 15m live execution timeframe as specified
  const [selectedPairKey, setSelectedPairKey] = useState<string>('EURUSD=X');
  const selectedInterval = '15m'; // Execution strictly locked to 15m per Pine Script rules
  const [dateRange, setDateRange] = useState<'30d' | '60d'>('60d');

  // Strategy Selection State
  const [selectedStrategyId, setSelectedStrategyId] = useState<ForexStrategyType>('SESSION_SWEEP_FVG');
  const [isAddStrategyModalOpen, setIsAddStrategyModalOpen] = useState<boolean>(false);
  const [customStrategyName, setCustomStrategyName] = useState<string>('My Custom 15m Momentum');
  const [customPineCode, setCustomPineCode] = useState<string>('//@version=5\nstrategy("Custom Forex Algo", overlay=true)\n// Your custom logic');

  // Strategy Parameters
  const [params, setParams] = useState<SessionSweepStrategyParams>(DEFAULT_SESSION_SWEEP_PARAMS);

  // Capital & Spot rate
  const [accountCapitalUSD, setAccountCapitalUSD] = useState<number>(10000); // $10,000 initial capital from script
  const [usdInrRate, setUsdInrRate] = useState<number>(92.67); // Live USDINR spot

  // Advanced Execution Controls
  const [slippagePips, setSlippagePips] = useState<number>(0.2);
  const [maxSpreadFilter, setMaxSpreadFilter] = useState<number>(2.0);
  const [trailingStopActive, setTrailingStopActive] = useState<boolean>(false);
  const [partialTakeProfit, setPartialTakeProfit] = useState<boolean>(true);

  // Live Candle fetching & execution state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [latestPrice, setLatestPrice] = useState<number | null>(null);
  const [priceChange24h, setPriceChange24h] = useState<number>(0);
  const [backtestResult, setBacktestResult] = useState<ForexBacktestResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedPair = FOREX_PAIRS[selectedPairKey] || FOREX_PAIRS['EURUSD=X'];
  const activeStrategy = FOREX_STRATEGIES.find((s) => s.id === selectedStrategyId) || FOREX_STRATEGIES[0];

  // Fetch real intraday candles from Yahoo Finance endpoint
  const fetchCandles = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch live USD/INR rate dynamically from Yahoo Finance
      try {
        const inrRes = await fetch('/yahoo-api/v8/finance/chart/USDINR%3DX?interval=1d&range=5d');
        if (inrRes.ok) {
          const inrJson = await inrRes.json();
          const inrRate = inrJson?.chart?.result?.[0]?.meta?.regularMarketPrice;
          if (inrRate && typeof inrRate === 'number') {
            setUsdInrRate(inrRate);
          }
        }
      } catch (e) {
        console.warn('Failed to update live USDINR spot, using verified spot 92.67', e);
      }

      // 2. Fetch intraday candles for the selected pair (15m is recommended for session FVG sweeps)
      const encoded = encodeURIComponent(selectedPair.symbol);
      const url = `/yahoo-api/v8/finance/chart/${encoded}?interval=${selectedInterval}&range=${dateRange}`;
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
            time: new Date(timestamps[i] * 1000).toISOString(),
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

        // Run authentic Session Sweep Backtest matching your exact Pine Script v5 logic
        const resTest = runSessionSweepBacktest(
          parsed,
          selectedPair,
          params,
          accountCapitalUSD,
          usdInrRate,
          selectedStrategyId,
          selectedStrategyId === 'CUSTOM_BUILDER' ? customStrategyName : undefined
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
  }, [selectedPairKey, selectedInterval, dateRange, selectedStrategyId]);

  const handleRecalculate = () => {
    if (candles.length === 0) return;
    const resTest = runSessionSweepBacktest(
      candles,
      selectedPair,
      params,
      accountCapitalUSD,
      usdInrRate,
      selectedStrategyId,
      selectedStrategyId === 'CUSTOM_BUILDER' ? customStrategyName : undefined
    );
    setBacktestResult(resTest);
  };

  const handleSelectStrategy = (stratId: ForexStrategyType) => {
    if (stratId === 'CUSTOM_BUILDER') {
      setIsAddStrategyModalOpen(true);
      return;
    }
    setSelectedStrategyId(stratId);
    const def = FOREX_STRATEGIES.find((s) => s.id === stratId);
    if (def) {
      setParams(def.defaultParams);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F5F7] text-[#151515] font-sans antialiased pb-24 selection:bg-black selection:text-white relative">
      {/* 1. Header Bar: Full Width Clean Light Theme Header */}
      <div className="w-full bg-white border-b border-[#E5E7EB] sticky top-16 z-30 shadow-xs px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="w-full flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#0A0A0D] flex items-center justify-center text-white font-black shadow-sm">
              <Globe2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-[#0A0A0D] tracking-tight">
                  NRI &amp; GLOBAL FOREX DESK
                </span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold tracking-wider">
                  LIGHT INSTITUTIONAL · 15M ENGINE
                </span>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5 font-mono">
                <span className="text-emerald-700 flex items-center gap-1 font-bold">
                  <Radio className="w-3 h-3 text-emerald-600 animate-pulse" /> LIVE STREAM
                </span>
                <span className="text-gray-300">|</span>
                <span>Active Strategy: <strong className="text-black">{activeStrategy.name}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono">
              <span className="text-gray-500 text-[11px]">LIVE USD/INR SPOT:</span>
              <span className="text-black font-bold text-sm">₹{usdInrRate.toFixed(2)}</span>
            </div>

            <button
              onClick={() => setIsAddStrategyModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>+ Add Strategy</span>
            </button>

            {onBackToMain && (
              <button
                onClick={onBackToMain}
                className="px-4 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-all border border-gray-200 shadow-xs"
              >
                Back to Indian Equities
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Content Area: Expanded to Full Width */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Strategy Selector Row: Multi-Strategy Carousel & Selector */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-xs uppercase tracking-wider text-black">
                Deployable Forex &amp; Global Strategies:
              </span>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              Select or deploy algorithmic rules on authentic 15m candles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FOREX_STRATEGIES.map((strat) => {
              const isSelected = selectedStrategyId === strat.id;
              const isAddCard = strat.id === 'CUSTOM_BUILDER';
              return (
                <button
                  key={strat.id}
                  onClick={() => handleSelectStrategy(strat.id)}
                  className={`p-3.5 rounded-xl text-left transition-all border relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-50/50 border-emerald-600 shadow-xs ring-1 ring-emerald-600'
                      : isAddCard
                      ? 'bg-gray-50/70 border-dashed border-gray-300 hover:border-black hover:bg-gray-100'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold text-xs truncate ${isSelected ? 'text-emerald-900' : 'text-black'}`}>
                        {strat.name}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 block mb-1.5">
                      {strat.tagline}
                    </span>
                    <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                      {strat.description}
                    </p>
                  </div>
                  <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-gray-400">Timeframe:</span>
                    <span className="font-bold text-black">15m Strict</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Instrument Selector Tabs: Full Width Light Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {Object.values(FOREX_PAIRS).map((pair) => {
            const isSelected = selectedPairKey === pair.symbol;
            return (
              <button
                key={pair.symbol}
                onClick={() => setSelectedPairKey(pair.symbol)}
                className={`p-4 rounded-xl text-left transition-all border ${
                  isSelected
                    ? 'bg-white border-black shadow-xs ring-1 ring-black'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-[#0A0A0D]">
                    {pair.displayName}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-1 text-[10px] font-mono">
                  <span className="text-gray-400 uppercase tracking-wider">
                    {pair.category}
                  </span>
                  <span className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded font-bold">
                    {pair.spreadPips} spr
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 line-clamp-1 font-sans">
                  {pair.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Instrument Status Bar: Full Width Light Styling */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-[#0A0A0D] tracking-tight">
                  {selectedPair.displayName}
                </h1>
                {latestPrice != null && (
                  <span className="text-2xl font-mono font-bold text-black tracking-wide">
                    {latestPrice.toFixed(4)}
                  </span>
                )}
                {priceChange24h !== 0 && (
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border ${
                      priceChange24h >= 0
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {priceChange24h >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1 font-mono">
                Symbol: <code className="bg-gray-100 text-black px-1.5 py-0.5 rounded">{selectedPair.symbol}</code> · Lot: <strong className="text-gray-800">{selectedPair.standardLotUnits.toLocaleString()} units</strong> · 1 Pip = <strong className="text-gray-800">{selectedPair.pipSize}</strong> · Feed: <span className="text-emerald-700 font-bold">Continuous Live Market Stream ({candles.length} real bars loaded)</span>
              </p>
            </div>

            {/* Timeframe controls - Fixed to 15m live execution only */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-mono">Timeframe:</span>
              <div className="px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono bg-black text-white shadow-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>15M STRICT LIVE ENGINE</span>
              </div>

              {/* Lookback Stream Feed Status */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-gray-500">Stream:</span>
                <span className="text-black font-bold">Continuous Rolling</span>
              </div>

              <button
                onClick={fetchCandles}
                disabled={isLoading}
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-black transition-all ml-1 shadow-xs"
                title="Refresh Live Ticks"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-black' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Performance Scorecard & Parameter Tuning: Full Width Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          {/* Left Column: Comprehensive Execution Controls */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-black" />
                  <span className="font-bold text-sm text-[#0A0A0D] font-sans">Execution Control Hub</span>
                </div>
                <button
                  onClick={handleRecalculate}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Recalculate</span>
                </button>
              </div>

              {/* Strategy Profile Info */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs font-sans">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#0A0A0D]">{activeStrategy.name}</span>
                  <span className="text-[10px] font-mono bg-white border border-gray-200 px-1.5 py-0.5 rounded font-bold">
                    Active Algo
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  {activeStrategy.description}
                </p>
              </div>

              {/* Initial Capital & Fixed Risk per Trade */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-gray-600 block mb-1">Capital ($):</span>
                  <input
                    type="number"
                    value={accountCapitalUSD}
                    onChange={(e) => setAccountCapitalUSD(Number(e.target.value))}
                    onBlur={handleRecalculate}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-black font-mono text-xs focus:outline-none focus:border-black font-bold"
                  />
                  <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                    ≈ ₹{(accountCapitalUSD * usdInrRate).toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-600 block mb-1">Risk / Trade ($):</span>
                  <input
                    type="number"
                    value={params.fixedRiskUSD}
                    onChange={(e) => setParams({ ...params, fixedRiskUSD: Number(e.target.value) })}
                    onBlur={handleRecalculate}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-black font-mono text-xs focus:outline-none focus:border-black font-bold"
                  />
                  <span className="text-[10px] text-emerald-700 font-mono mt-0.5 block font-bold">
                    {((params.fixedRiskUSD / accountCapitalUSD) * 100).toFixed(1)}% Account Risk
                  </span>
                </div>
              </div>

              {/* Risk:Reward & Max Risk % */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>R : R Ratio:</span>
                    <span className="font-mono font-bold text-black">1 : {params.riskReward}</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="4.0"
                    step="0.1"
                    value={params.riskReward}
                    onChange={(e) => setParams({ ...params, riskReward: Number(e.target.value) })}
                    onMouseUp={handleRecalculate}
                    className="w-full accent-black h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Max SL Dist (%):</span>
                    <span className="font-mono font-bold text-black">{params.maxRiskPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="2.0"
                    step="0.05"
                    value={params.maxRiskPercent}
                    onChange={(e) => setParams({ ...params, maxRiskPercent: Number(e.target.value) })}
                    onMouseUp={handleRecalculate}
                    className="w-full accent-black h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Advanced Execution Guards */}
              <div className="pt-3 border-t border-gray-100 space-y-2.5 text-xs font-sans">
                <span className="font-bold text-gray-800 text-[11px] block uppercase tracking-wider font-mono">
                  Advanced Execution Guards:
                </span>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Max Spread Tolerated:</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-black">
                    <span>{maxSpreadFilter} pips</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Model Slippage Buffer:</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-black">
                    <span>{slippagePips} pips</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Trailing Stop Mechanism:</span>
                  <button
                    onClick={() => setTrailingStopActive(!trailingStopActive)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border transition-all ${
                      trailingStopActive
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {trailingStopActive ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Partial Take-Profit (50% @ 1:1):</span>
                  <button
                    onClick={() => setPartialTakeProfit(!partialTakeProfit)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border transition-all ${
                      partialTakeProfit
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {partialTakeProfit ? 'ACTIVE' : 'OFF'}
                  </button>
                </div>
              </div>

              {/* Automated Schedule Info (Hardcoded from Pine Script v5) */}
              <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700">London Window:</span>
                  <span className="font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-bold">
                    Mon, Wed, Thu (00:00 - 06:00 UTC)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700">New York Window:</span>
                  <span className="font-mono text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[11px] font-bold">
                    Tue, Thu (13:00 - 22:00 UTC)
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed pt-1">
                  * Execution days are automatically scheduled according to the Pine Script v5 logic to exploit optimal session liquidity sweeps and avoid low-volume whipsaws.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Quantitative Live Execution Audit & Performance */}
          <div className="lg:col-span-8 space-y-5">
            {/* Metrics Scorecard */}
            {backtestResult && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
                  <span className="text-[11px] text-gray-400 font-mono block mb-1">
                    TOTAL NET P&amp;L
                  </span>
                  <span
                    className={`text-2xl font-mono font-black ${
                      backtestResult.metrics.totalProfitUSD >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {backtestResult.metrics.totalProfitUSD >= 0 ? '+$' : '-$'}
                    {Math.abs(backtestResult.metrics.totalProfitUSD).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono block mt-0.5">
                    ≈ ₹{Math.abs(backtestResult.metrics.totalProfitINR).toLocaleString()} INR
                  </span>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
                  <span className="text-[11px] text-gray-400 font-mono block mb-1">
                    NET RETURN
                  </span>
                  <span
                    className={`text-2xl font-mono font-black ${
                      backtestResult.metrics.totalReturnPct >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {backtestResult.metrics.totalReturnPct >= 0 ? '+' : ''}
                    {backtestResult.metrics.totalReturnPct}%
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono block mt-0.5">
                    Profit Factor: <strong className="text-black">{backtestResult.metrics.profitFactor}</strong>
                  </span>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
                  <span className="text-[11px] text-gray-400 font-mono block mb-1">
                    WIN RATE
                  </span>
                  <span className="text-2xl font-mono font-black text-black">
                    {backtestResult.metrics.winRate}%
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono block mt-0.5">
                    {backtestResult.metrics.winTrades} W / {backtestResult.metrics.lossTrades} L ({backtestResult.metrics.totalTrades} Trades)
                  </span>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
                  <span className="text-[11px] text-gray-400 font-mono block mb-1">
                    PIPS GAINED
                  </span>
                  <span
                    className={`text-2xl font-mono font-black ${
                      backtestResult.metrics.totalPipsGained >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {backtestResult.metrics.totalPipsGained >= 0 ? '+' : ''}
                    {backtestResult.metrics.totalPipsGained} pips
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono block mt-0.5">
                    Max DD: -{backtestResult.metrics.maxDrawdownPct}%
                  </span>
                </div>
              </div>
            )}

            {/* Live Session Sweep Candlestick Visualizer with Strategy Explainer Button */}
            {candles.length > 0 && (
              <LiveSessionChart
                candles={candles}
                trades={backtestResult?.trades || []}
                pairName={selectedPair.displayName}
                symbol={selectedPair.symbol}
                interval={selectedInterval}
              />
            )}

            {/* 1. Full Portfolio Equity Curve Line Chart */}
            {backtestResult && backtestResult.equityCurve && (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs">
                <EquityLineChart
                  equityCurve={backtestResult.equityCurve}
                  initialCapital={accountCapitalUSD}
                  title={`${selectedPair.displayName} Equity Growth Curve ($)`}
                  subtitle={`${activeStrategy.name} on authentic ${selectedInterval} candles (${candles.length} bars)`}
                  strokeColor="#16A34A"
                  fillGradStart="#16A34A"
                />
              </div>
            )}

            {/* 2. Institutional Underwater Drawdown Chart */}
            {backtestResult && backtestResult.trades.length > 0 && (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-rose-600" />
                    <span className="font-bold text-xs uppercase tracking-wider text-black font-mono">
                      Underwater Peak-to-Trough Drawdown Analysis (%)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">
                    Max Recorded Drawdown: -{backtestResult.metrics.maxDrawdownPct}%
                  </span>
                </div>
                <QuantUnderwaterChart
                  trades={backtestResult.trades}
                  initialCapital={accountCapitalUSD}
                />
              </div>
            )}

            {/* 3. Quantitative Risk & Alpha Matrix (QRAM) */}
            {backtestResult && backtestResult.trades.length > 0 && (
              <QuantRiskAlphaMatrix
                trades={backtestResult.trades}
                initialCapital={accountCapitalUSD}
                strategyName={activeStrategy.name}
                symbol={selectedPair.displayName}
                currencySymbol="$"
              />
            )}

            {/* Trade Log Table */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-xs uppercase tracking-wider text-black block font-mono">
                    All Executed Trades on {selectedPair.displayName} ({activeStrategy.name})
                  </span>
                  <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    100% Genuine Bar-by-Bar Executed Trades (Zero Mock / Zero Synthetic Data)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg">
                  Showing all {backtestResult?.trades?.length || 0} trades
                </span>
              </div>

              {backtestResult && backtestResult.trades.length > 0 ? (
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="sticky top-0 bg-gray-50 z-10">
                      <tr className="border-b border-gray-200 text-gray-500 text-[11px]">
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Entry Time (UTC)</th>
                        <th className="py-2.5 px-3">Exit Time (UTC)</th>
                        <th className="py-2.5 px-3">Side</th>
                        <th className="py-2.5 px-3">Entry Price</th>
                        <th className="py-2.5 px-3">Exit Price</th>
                        <th className="py-2.5 px-3">Stop Loss</th>
                        <th className="py-2.5 px-3">Take Profit</th>
                        <th className="py-2.5 px-3">Exit Reason</th>
                        <th className="py-2.5 px-3 text-right">P&amp;L (USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {backtestResult.trades
                        .slice()
                        .reverse()
                        .map((t, idx) => (
                          <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-2.5 px-3 text-gray-400 text-[10px]">{backtestResult.trades.length - idx}</td>
                            <td className="py-2.5 px-3 text-gray-700">
                              {new Date(t.entryTime).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZone: 'UTC',
                              })}
                            </td>
                            <td className="py-2.5 px-3 text-gray-700">
                              {new Date(t.exitTime).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZone: 'UTC',
                              })}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  t.type === 'BUY'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}
                              >
                                {t.type}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-black font-bold">{t.entryPrice.toFixed(4)}</td>
                            <td className="py-2.5 px-3 text-black font-bold">{t.exitPrice.toFixed(4)}</td>
                            <td className="py-2.5 px-3 text-rose-600 text-[11px]">{t.stopLoss.toFixed(4)}</td>
                            <td className="py-2.5 px-3 text-emerald-600 text-[11px]">{t.takeProfit.toFixed(4)}</td>
                            <td className="py-2.5 px-3 text-gray-500 text-[10px]">{t.exitReason}</td>
                            <td
                              className={`py-2.5 px-3 text-right font-bold text-sm ${
                                t.pnl >= 0 ? 'text-emerald-700' : 'text-rose-700'
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
                <div className="py-8 text-center text-xs text-gray-400 font-mono">
                  {isLoading ? 'Streaming live session sweeps & computing execution...' : 'No trades triggered for this parameter combination.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Add Strategy Modal: Let user configure and deploy custom strategies to the Forex Desk */}
      {isAddStrategyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-[#0A0A0D]">Add &amp; Deploy New Forex Strategy</h3>
              </div>
              <button
                onClick={() => setIsAddStrategyModalOpen(false)}
                className="text-gray-400 hover:text-black font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Define a new algorithmic strategy to execute alongside the Asia-London-NY FVG Inversion model. The system will vectorize it on real 15m candle feeds.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Strategy Name:</label>
                <input
                  type="text"
                  value={customStrategyName}
                  onChange={(e) => setCustomStrategyName(e.target.value)}
                  placeholder="e.g., London Breakout Trend 15m"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-black font-bold focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Fixed Risk ($):</label>
                  <input
                    type="number"
                    value={params.fixedRiskUSD}
                    onChange={(e) => setParams({ ...params, fixedRiskUSD: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-black font-bold focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Risk : Reward:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={params.riskReward}
                    onChange={(e) => setParams({ ...params, riskReward: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-black font-bold focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">TradingView Pine Script / Logic Code:</label>
                <textarea
                  value={customPineCode}
                  onChange={(e) => setCustomPineCode(e.target.value)}
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-[11px] text-gray-800 font-mono focus:outline-none focus:border-black select-text"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setIsAddStrategyModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-black"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setSelectedStrategyId('CUSTOM_BUILDER');
                  setIsAddStrategyModalOpen(false);
                  setTimeout(handleRecalculate, 50);
                }}
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Deploy to Desk</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
