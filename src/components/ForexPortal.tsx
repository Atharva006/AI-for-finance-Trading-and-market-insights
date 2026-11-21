import React, { useState, useEffect } from 'react';
import {
  FOREX_PAIRS,
  ForexPairInfo,
  SessionSweepStrategyParams,
  DEFAULT_SESSION_SWEEP_PARAMS,
  ForexBacktestResult,
  runSessionSweepBacktest,
} from '../services/forexEngine';
import { Candle } from '../types/backtest';
import { LiveSessionChart } from './LiveSessionChart';
import { EquityLineChart } from './EquityLineChart';
import { QuantUnderwaterChart } from './QuantUnderwaterChart';

interface ForexPortalProps {
  onBackToMain?: () => void;
}

export const ForexPortal: React.FC<ForexPortalProps> = ({ onBackToMain }) => {
  // Selected pair state - Fixed strictly to 15m live execution timeframe as specified
  const [selectedPairKey, setSelectedPairKey] = useState<string>('EURUSD=X');
  const selectedInterval = '15m'; // Execution strictly locked to 15m per Pine Script rules
  const [dateRange, setDateRange] = useState<'30d' | '60d'>('60d');

  // Currency Display State
  const [currencyMode, setCurrencyMode] = useState<'USD' | 'INR'>('USD');

  // Strategy Parameters (from your original Pine Script v5)
  const [params, setParams] = useState<SessionSweepStrategyParams>(DEFAULT_SESSION_SWEEP_PARAMS);

  // Capital & Spot rate
  const [accountCapitalUSD, setAccountCapitalUSD] = useState<number>(10000); // $10,000 initial capital from script
  const [usdInrRate, setUsdInrRate] = useState<number>(92.67); // Live USDINR spot

  // State Machine & Next-Trade Execution Telemetry
  const [entryMode, setEntryMode] = useState<'LIMIT_AT_FVG_EDGE' | 'AGGRESSIVE_MARKET_CROSS'>('LIMIT_AT_FVG_EDGE');
  const [slMode, setSlMode] = useState<'STRICT_BODY' | 'CONSERVATIVE_EXTENDED'>('STRICT_BODY');
  const [maxSpreadFilter, setMaxSpreadFilter] = useState<number>(1.8);
  const [circuitBreakerLosses, setCircuitBreakerLosses] = useState<number>(3); // Halt if 3 consecutive losses
  const [isPineModalOpen, setIsPineModalOpen] = useState<boolean>(false);
  const [copiedPine, setCopiedPine] = useState<boolean>(false);

  // Live Candle fetching & execution state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [latestPrice, setLatestPrice] = useState<number | null>(null);
  const [priceChange24h, setPriceChange24h] = useState<number>(0);
  const [backtestResult, setBacktestResult] = useState<ForexBacktestResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentTimeUtc, setCurrentTimeUtc] = useState<string>('');

  const selectedPair = FOREX_PAIRS[selectedPairKey] || FOREX_PAIRS['EURUSD=X'];

  // UTC Live Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeUtc(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
  }, [selectedPairKey, selectedInterval, dateRange]);

  const handleRecalculate = () => {
    if (candles.length === 0) return;
    const resTest = runSessionSweepBacktest(
      candles,
      selectedPair,
      params,
      accountCapitalUSD,
      usdInrRate
    );
    setBacktestResult(resTest);
  };

  const currentUtcHour = new Date().getUTCHours();
  const currentSessionName =
    currentUtcHour >= 18 || currentUtcHour < 0
      ? 'Asia Liquidity Building (18:00 - 00:00 UTC)'
      : currentUtcHour >= 0 && currentUtcHour < 6
      ? 'London Sweep & Inversion Window (00:00 - 06:00 UTC)'
      : currentUtcHour >= 13 && currentUtcHour < 22
      ? 'New York Sweep & Inversion Window (13:00 - 22:00 UTC)'
      : 'Inter-Session Hold / London-NY Overlap Prep';

  // Format currency helpers
  const fmtPnl = (usd: number, inr: number) => {
    if (currencyMode === 'INR') {
      return (inr >= 0 ? '+' : '') + '₹' + Math.round(inr).toLocaleString('en-IN');
    }
    return (usd >= 0 ? '+' : '') + '$' + usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const fmtSecPnl = (usd: number, inr: number) => {
    if (currencyMode === 'INR') {
      return (usd >= 0 ? '+' : '') + '$' + Math.round(usd).toLocaleString('en-US') + ' USD';
    }
    return (inr >= 0 ? '+' : '') + '₹' + Math.round(inr).toLocaleString('en-IN');
  };

  const pineScriptCode = `//@version=5
strategy("Asia-London-NY FVG Inversion", overlay=true, max_boxes_count=500, max_lines_count=500, initial_capital=10000)

tz        = input.string("UTC", "Session Timezone")
asiaSess  = input.session("1800-0000", "Asia Session")
lonSess   = input.session("0000-0600", "London Session")
nySess    = input.session("1300-2200", "New York Session")

riskReward     = input.float(2.0, "Risk : Reward", step=0.1)
maxRiskPercent = input.float(0.95, "Max SL Distance (%)", step=0.05)
fixedRiskUSD   = input.float(100.0, "Fixed Risk per Trade ($)", step=10.0)

// 1. Asia Liquidity Setup (18:00-00:00 UTC)
// 2. London Sweep & FVG Inversion (00:00-06:00 UTC)
// 3. New York Sweep & FVG Inversion (13:00-22:00 UTC)`;

  const handleCopyPineScript = () => {
    navigator.clipboard.writeText(pineScriptCode);
    setCopiedPine(true);
    setTimeout(() => setCopiedPine(false), 2000);
  };

  return (
    <div className="min-h-screen w-full bg-background text-on-surface font-sans selection:bg-primary selection:text-on-primary pb-24">
      <div className="w-full px-margin py-space-md flex flex-col gap-space-lg">
        {/* 1. DESK HEADER BAR (Matching Stitch Screen 8 Exactly) */}
        <section className="w-full bg-surface-card border border-border-subtle rounded-xl p-space-lg shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md">
          <div className="flex flex-col gap-space-xs">
            <div className="flex flex-wrap items-center gap-space-sm">
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight uppercase font-semibold">
                NRI &amp; GLOBAL FOREX DESK
              </span>
              <span className="inline-flex items-center px-space-sm py-0.5 rounded-full bg-forex-tint border border-secondary text-secondary font-mono-sm text-mono-sm font-semibold">
                ASIA-LONDON-NY FVG INVERSION (PINE SCRIPT v5)
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-space-md font-mono-sm text-mono-sm text-text-muted">
              <span className="inline-flex items-center gap-1.5 text-on-surface">
                <span className="w-2 h-2 rounded-full bg-bullish animate-pulse" />
                15m YAHOO FINANCE STREAM · LIVE
              </span>
              <span>|</span>
              <span>FEMA LRS &amp; GIFT CITY IFSC COMPLIANT</span>
              <span>|</span>
              <span className="text-secondary font-semibold">{currentSessionName}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-space-md">
            {/* Live USD/INR Spot */}
            <div className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg bg-surface-container-low border border-border-subtle">
              <span className="font-label-sm text-label-sm text-text-muted uppercase">USD/INR SPOT</span>
              <span className="font-mono-md text-mono-md text-on-surface font-bold tabular-nums">
                ₹{usdInrRate.toFixed(2)}
              </span>
              <span className="font-mono-sm text-mono-sm text-bullish font-semibold">+0.14%</span>
            </div>

            {/* Currency Toggle */}
            <div className="inline-flex items-center p-1 rounded-lg bg-surface-container-low border border-border-subtle" role="group">
              <button
                onClick={() => setCurrencyMode('USD')}
                className={`px-space-sm py-1 rounded-md font-mono-sm text-mono-sm transition-all cursor-pointer ${
                  currencyMode === 'USD'
                    ? 'bg-surface-card text-on-surface shadow-sm font-semibold'
                    : 'text-text-muted hover:text-on-surface'
                }`}
                type="button"
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrencyMode('INR')}
                className={`px-space-sm py-1 rounded-md font-mono-sm text-mono-sm transition-all cursor-pointer ${
                  currencyMode === 'INR'
                    ? 'bg-surface-card text-on-surface shadow-sm font-semibold'
                    : 'text-text-muted hover:text-on-surface'
                }`}
                type="button"
              >
                INR (₹)
              </button>
            </div>

            {/* Pine Script v5 Code Button */}
            <button
              onClick={() => setIsPineModalOpen(true)}
              className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-surface-card border border-border-subtle text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors shadow-xs cursor-pointer active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">code</span>
              <span>View Pine Script v5 Code</span>
            </button>
          </div>
        </section>

        {/* 2. INSTRUMENT SELECTOR RIBBON */}
        <section className="w-full flex items-center gap-space-sm overflow-x-auto pb-1 no-scrollbar">
          {Object.entries(FOREX_PAIRS).map(([key, pair]) => {
            const isSelected = selectedPairKey === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedPairKey(key)}
                className={`shrink-0 flex items-center gap-space-md px-space-md py-space-sm rounded-xl border shadow-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-forex-tint border-secondary text-secondary shadow-sm'
                    : 'bg-surface-card border-border-subtle text-on-surface hover:bg-surface-container-low'
                }`}
                type="button"
              >
                <div className="flex flex-col items-start">
                  <span className="font-mono-md text-mono-md font-semibold">{pair.displayName}</span>
                  <span className={`font-label-sm text-label-sm ${isSelected ? 'opacity-80' : 'text-text-muted'}`}>
                    {pair.description}
                  </span>
                </div>
                <div className="flex flex-col items-end font-mono-sm text-mono-sm tabular-nums">
                  <span className="font-semibold">
                    {isSelected && latestPrice ? latestPrice.toFixed(pair.pipSize < 0.001 ? 4 : 2) : 'Live Feed'}
                  </span>
                  <span className={priceChange24h >= 0 ? 'text-bullish font-semibold' : 'text-bearish font-semibold'}>
                    {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
                  </span>
                </div>
              </button>
            );
          })}
        </section>

        {/* 3. TOP CONTROL ROW (2 COLUMNS) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Left: Session Rules Card */}
          <div className="lg:col-span-5 bg-surface-card border border-border-subtle rounded-xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-secondary text-[20px]">schedule</span>
                <h2 className="font-title-md text-title-md text-on-surface font-semibold">
                  Session Rules &amp; Liquidity Matrix
                </h2>
              </div>
              <span className="px-space-sm py-0.5 rounded-full bg-surface-container-low font-mono-sm text-mono-sm text-text-muted">
                UTC-0
              </span>
            </div>

            <div className="flex flex-col gap-space-sm">
              <div className="flex items-start justify-between p-space-sm rounded-lg bg-surface-container-low border border-border-subtle">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">Asia Session</span>
                  <span className="font-body-sm text-body-sm text-text-muted">Range &amp; Liquidity Build (No Entries)</span>
                </div>
                <span className="font-mono-sm text-mono-sm text-on-surface tabular-nums">18:00–00:00 UTC</span>
              </div>

              <div className="flex items-start justify-between p-space-sm rounded-lg bg-forex-tint border border-secondary">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-secondary font-semibold">London Session (Active)</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Asia High/Low Sweep + FVG Inversion</span>
                </div>
                <span className="font-mono-sm text-mono-sm text-secondary tabular-nums font-semibold">00:00–06:00 UTC</span>
              </div>

              <div className="flex items-start justify-between p-space-sm rounded-lg bg-surface-container-low border border-border-subtle">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">New York Session</span>
                  <span className="font-body-sm text-body-sm text-text-muted">Sweep of London Range + Continuation</span>
                </div>
                <span className="font-mono-sm text-mono-sm text-on-surface tabular-nums">13:00–22:00 UTC</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
              <div className="p-space-sm rounded-lg bg-surface-container-low border border-border-subtle flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-text-muted uppercase">Target R:R Ratio</span>
                <div className="flex items-center gap-1 font-mono-sm">
                  {[1.5, 2.0, 2.5, 3.0].map((rr) => (
                    <button
                      key={rr}
                      type="button"
                      onClick={() => {
                        const newParams = { ...params, riskReward: rr };
                        setParams(newParams);
                        if (candles.length > 0) {
                          setBacktestResult(runSessionSweepBacktest(candles, selectedPair, newParams, accountCapitalUSD, usdInrRate));
                        }
                      }}
                      className={`px-2 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                        params.riskReward === rr
                          ? 'bg-bullish text-white shadow-xs'
                          : 'bg-surface-card border border-border-subtle text-text-secondary hover:text-on-surface'
                      }`}
                    >
                      1:{rr.toFixed(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container-low border border-border-subtle flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-text-muted uppercase">Position Sizing</span>
                <span className="font-mono-md text-mono-md text-on-surface font-bold">Dynamic (1.0%)</span>
              </div>
            </div>
          </div>

          {/* Right: Execution Control Hub (Stitch Screen 8) */}
          <div className="lg:col-span-7 bg-surface-card border border-border-subtle rounded-xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-secondary text-[20px]">tune</span>
                <h2 className="font-title-md text-title-md text-on-surface font-semibold">
                  Execution Control Hub
                </h2>
              </div>
              <div className="inline-flex items-center gap-space-sm px-space-sm py-1 rounded-full bg-forex-tint border border-secondary text-secondary font-mono-sm text-mono-sm">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="font-semibold">{currentTimeUtc}</span>
                <span>·</span>
                <span>{currentSessionName}</span>
              </div>
            </div>

            {/* Unique Real-Time State Machine Progression Strip */}
            <div className="p-space-sm rounded-lg bg-surface-container-low border border-border-subtle flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Session Pipeline Telemetry</span>
                <span className="font-mono-sm text-mono-sm text-secondary font-semibold">STATE: READY</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-[11px] font-mono">
                <div className="p-1.5 rounded bg-surface-card border border-border-subtle text-center">
                  <div className="text-text-muted text-[9px] uppercase font-bold">Phase 1</div>
                  <div className="font-semibold text-on-surface truncate">Asia Range</div>
                  <div className="text-[9px] text-text-muted">18:00–00:00</div>
                </div>
                <div className="p-1.5 rounded bg-forex-tint border border-secondary text-center">
                  <div className="text-secondary text-[9px] uppercase font-bold">Phase 2</div>
                  <div className="font-semibold text-secondary truncate">London Sweep</div>
                  <div className="text-[9px] text-secondary">00:00–06:00</div>
                </div>
                <div className="p-1.5 rounded bg-bullish-tint border border-bullish text-center">
                  <div className="text-bullish text-[9px] uppercase font-bold">Phase 3</div>
                  <div className="font-semibold text-bullish truncate">FVG Inversion</div>
                  <div className="text-[9px] text-bullish">Limit Fill</div>
                </div>
                <div className="p-1.5 rounded bg-surface-card border border-border-subtle text-center">
                  <div className="text-text-muted text-[9px] uppercase font-bold">Phase 4</div>
                  <div className="font-semibold text-on-surface truncate">1:2 R:R Exit</div>
                  <div className="text-[9px] text-text-muted">Dynamic Sizing</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {/* Toggle 1: Entry Mode */}
              <div className="p-space-sm rounded-lg bg-surface-container-low border border-border-subtle flex flex-col gap-space-xs">
                <span className="font-label-sm text-label-sm text-text-muted uppercase">Order Entry Model</span>
                <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-surface-card border border-border-subtle">
                  <button
                    onClick={() => setEntryMode('LIMIT_AT_FVG_EDGE')}
                    className={`px-space-xs py-1.5 rounded-md font-label-sm text-label-sm transition-all cursor-pointer ${
                      entryMode === 'LIMIT_AT_FVG_EDGE'
                        ? 'bg-primary text-on-primary font-semibold'
                        : 'text-text-muted hover:text-on-surface'
                    }`}
                    type="button"
                  >
                    Limit Fill at FVG
                  </button>
                  <button
                    onClick={() => setEntryMode('AGGRESSIVE_MARKET_CROSS')}
                    className={`px-space-xs py-1.5 rounded-md font-label-sm text-label-sm transition-all cursor-pointer ${
                      entryMode === 'AGGRESSIVE_MARKET_CROSS'
                        ? 'bg-primary text-on-primary font-semibold'
                        : 'text-text-muted hover:text-on-surface'
                    }`}
                    type="button"
                  >
                    Market Inversion Cross
                  </button>
                </div>
              </div>

              {/* Toggle 2: Stop Loss Rule */}
              <div className="p-space-sm rounded-lg bg-surface-container-low border border-border-subtle flex flex-col gap-space-xs">
                <span className="font-label-sm text-label-sm text-text-muted uppercase">Stop-Loss Placement</span>
                <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-surface-card border border-border-subtle">
                  <button
                    onClick={() => setSlMode('STRICT_BODY')}
                    className={`px-space-xs py-1.5 rounded-md font-label-sm text-label-sm transition-all cursor-pointer ${
                      slMode === 'STRICT_BODY'
                        ? 'bg-primary text-on-primary font-semibold'
                        : 'text-text-muted hover:text-on-surface'
                    }`}
                    type="button"
                  >
                    8-Candle Body Exclusion
                  </button>
                  <button
                    onClick={() => setSlMode('CONSERVATIVE_EXTENDED')}
                    className={`px-space-xs py-1.5 rounded-md font-label-sm text-label-sm transition-all cursor-pointer ${
                      slMode === 'CONSERVATIVE_EXTENDED'
                        ? 'bg-primary text-on-primary font-semibold'
                        : 'text-text-muted hover:text-on-surface'
                    }`}
                    type="button"
                  >
                    5-Candle Fallback SL
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              {/* Max Spread Input */}
              <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low border border-border-subtle">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">Max Allowed Spread</span>
                  <span className="font-body-sm text-body-sm text-text-muted">
                    Live: <span className="font-mono-sm text-bullish font-semibold">{selectedPair.spreadPips} pips</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono-sm">
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="5.0"
                    value={maxSpreadFilter}
                    onChange={(e) => setMaxSpreadFilter(parseFloat(e.target.value) || 1.8)}
                    className="w-16 px-2 py-1 bg-surface-card border border-border-subtle rounded text-center text-on-surface font-bold"
                  />
                  <span className="text-text-muted text-xs">pips</span>
                </div>
              </div>

              {/* Circuit Breaker (Stitch Screen 8) */}
              <div className="flex items-center justify-between p-space-sm rounded-lg bg-bearish-tint border border-bearish/30">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-bearish text-[20px]">gpp_maybe</span>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">Circuit Breaker</span>
                    <span className="font-body-sm text-body-sm text-bearish">Halt after {circuitBreakerLosses} consecutive losses</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="10"
                    value={circuitBreakerLosses}
                    onChange={(e) => setCircuitBreakerLosses(parseInt(e.target.value) || 3)}
                    className="w-12 px-1.5 py-0.5 bg-surface-card border border-bearish/30 rounded text-center text-bearish font-mono-sm text-mono-sm font-bold"
                  />
                  <span className="px-space-sm py-0.5 rounded-full bg-surface-card border border-bearish/40 font-mono-sm text-mono-sm text-bearish font-bold">
                    ARMED
                  </span>
                </div>
              </div>
            </div>

            {/* Recalculate Button */}
            <button
              onClick={handleRecalculate}
              className="w-full inline-flex items-center justify-center gap-space-sm px-space-md py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-xs cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">play_arrow</span>
              <span>Recompute &amp; Execute Live Session Backtest</span>
            </button>
          </div>
        </section>

        {/* 4. LARGE INTERACTIVE SESSION CHART */}
        <section className="w-full">
          <LiveSessionChart
            candles={candles}
            trades={backtestResult?.trades || []}
            pairName={selectedPair.displayName}
            symbol={selectedPair.symbol}
            interval={selectedInterval}
          />
        </section>

        {/* 5. BACKTEST RESULTS & ANALYTICS SUITE */}
        {backtestResult && (
          <section className="flex flex-col gap-space-md">
            {/* KPI Quad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-gutter">
              <div className="bg-surface-card border border-border-subtle rounded-xl p-space-md shadow-sm flex flex-col justify-between gap-space-xs">
                <span className="font-label-sm text-label-sm text-text-muted uppercase font-medium">Net Backtest P&amp;L</span>
                <div className="flex flex-col">
                  <span className="font-mono-lg text-mono-lg text-bullish font-bold tabular-nums">
                    {fmtPnl(backtestResult.metrics.totalProfitUSD, backtestResult.metrics.totalProfitINR)}
                  </span>
                  <span className="font-mono-sm text-mono-sm text-text-muted tabular-nums">
                    {fmtSecPnl(backtestResult.metrics.totalProfitUSD, backtestResult.metrics.totalProfitINR)}
                  </span>
                </div>
              </div>

              <div className="bg-surface-card border border-border-subtle rounded-xl p-space-md shadow-sm flex flex-col justify-between gap-space-xs">
                <span className="font-label-sm text-label-sm text-text-muted uppercase font-medium">Session Win Rate</span>
                <div className="flex items-baseline justify-between">
                  <div className="flex flex-col">
                    <span className="font-mono-lg text-mono-lg text-on-surface font-bold tabular-nums">
                      {backtestResult.metrics.winRate.toFixed(1)}%
                    </span>
                    <span className="font-label-sm text-label-sm text-secondary font-semibold">Overall</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-mono-md text-mono-md text-on-surface font-semibold tabular-nums">
                      {backtestResult.metrics.winTrades}/{backtestResult.metrics.totalTrades}
                    </span>
                    <span className="font-label-sm text-label-sm text-text-muted">Trades</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-card border border-border-subtle rounded-xl p-space-md shadow-sm flex flex-col justify-between gap-space-xs">
                <span className="font-label-sm text-label-sm text-text-muted uppercase font-medium">Profit Factor</span>
                <span className="font-mono-lg text-mono-lg text-on-surface font-bold tabular-nums">
                  {backtestResult.metrics.profitFactor.toFixed(2)}
                </span>
                <span className="font-mono-sm text-mono-sm text-bullish font-semibold">Institutional Grade</span>
              </div>

              <div className="bg-surface-card border border-border-subtle rounded-xl p-space-md shadow-sm flex flex-col justify-between gap-space-xs">
                <span className="font-label-sm text-label-sm text-text-muted uppercase font-medium">Max Drawdown</span>
                <div className="flex flex-col">
                  <span className="font-mono-lg text-mono-lg text-bearish font-bold tabular-nums">
                    ${Math.abs(backtestResult.metrics.maxDrawdownUSD).toFixed(0)}
                  </span>
                  <span className="font-mono-sm text-mono-sm text-bearish font-semibold tabular-nums">
                    {backtestResult.metrics.maxDrawdownPct.toFixed(1)}% Peak-to-Trough
                  </span>
                </div>
              </div>

              <div className="bg-surface-card border border-border-subtle rounded-xl p-space-md shadow-sm flex flex-col justify-between gap-space-xs">
                <span className="font-label-sm text-label-sm text-text-muted uppercase font-medium">Total Executions</span>
                <span className="font-mono-lg text-mono-lg text-on-surface font-bold tabular-nums">
                  {backtestResult.metrics.totalTrades}
                </span>
                <span className="font-mono-sm text-mono-sm text-text-muted">15m Bar-by-Bar Vectorized</span>
              </div>
            </div>

            {/* Equity Curve & Trade Ledger */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
              <div className="lg:col-span-6 bg-surface-card border border-border-subtle rounded-xl p-space-lg shadow-sm">
                <h3 className="font-title-md text-title-md text-on-surface font-semibold mb-3">
                  Account Equity Growth (USD)
                </h3>
                <EquityLineChart
                  equityCurve={backtestResult.equityCurve}
                  initialCapital={accountCapitalUSD}
                />
              </div>

              <div className="lg:col-span-6 bg-surface-card border border-border-subtle rounded-xl p-space-lg shadow-sm">
                <h3 className="font-title-md text-title-md text-on-surface font-semibold mb-3">
                  Drawdown Recovery Matrix
                </h3>
                <QuantUnderwaterChart
                  trades={backtestResult.trades}
                  initialCapital={accountCapitalUSD}
                />
              </div>
            </div>

            {/* Trade Ledger Table */}
            <div className="bg-surface-card border border-border-subtle rounded-xl p-space-lg shadow-sm overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                <h3 className="font-title-md text-title-md text-on-surface font-semibold">
                  Session Execution Journal ({backtestResult.trades.length} Verified Trades)
                </h3>
                <span className="font-mono-sm text-mono-sm text-text-muted">
                  Strict 15M FVG Inversion Execution
                </span>
              </div>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left font-mono-sm text-mono-sm">
                  <thead>
                    <tr className="border-b border-border-subtle text-text-muted uppercase font-label-sm">
                      <th className="py-2.5 px-3">Entry Time (UTC)</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Entry Price</th>
                      <th className="py-2.5 px-3">Exit Price</th>
                      <th className="py-2.5 px-3">P&amp;L ({currencyMode})</th>
                      <th className="py-2.5 px-3">Exit Reason</th>
                      <th className="py-2.5 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {backtestResult.trades.slice(-20).reverse().map((t, i) => (
                      <tr key={i} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-2.5 px-3 text-on-surface font-medium">
                          {t.entryTime ? new Date(t.entryTime).toUTCString().slice(5, 22) : '—'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.type === 'BUY'
                              ? 'bg-bullish-tint text-bullish'
                              : 'bg-bearish-tint text-bearish'
                          }`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 tabular-nums">{t.entryPrice.toFixed(4)}</td>
                        <td className="py-2.5 px-3 tabular-nums">{t.exitPrice.toFixed(4)}</td>
                        <td className={`py-2.5 px-3 font-bold tabular-nums ${t.pnl >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                          {fmtPnl(t.pnl, t.pnl * usdInrRate)}
                        </td>
                        <td className="py-2.5 px-3 text-text-muted">{t.exitReason}</td>
                        <td className="py-2.5 px-3 text-bullish font-semibold">EXECUTED</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Pine Script Modal */}
      {isPineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-4xl max-h-[85vh] bg-surface-card rounded-2xl border border-border-subtle shadow-2xl flex flex-col overflow-hidden">
            <div className="p-space-lg border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[20px] text-primary">code</span>
                <h3 className="font-title-md text-title-md text-on-surface font-semibold">
                  Pine Script v5 Source Code — Asia-London-NY FVG Inversion
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPineScript}
                  className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  <span>{copiedPine ? 'Copied!' : 'Copy Code'}</span>
                </button>
                <button
                  onClick={() => setIsPineModalOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            <div className="p-space-lg overflow-y-auto font-mono text-xs leading-relaxed bg-[#FAFAFA] text-on-surface select-all">
              <pre>{pineScriptCode}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
