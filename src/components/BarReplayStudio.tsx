import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  HistogramSeries,
  UTCTimestamp,
  LineStyle,
  IPriceLine,
} from 'lightweight-charts';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Download,
  Sliders,
  DollarSign,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  XCircle,
  Clock,
  Shield,
  Search,
} from 'lucide-react';
import { Candle } from '../types/backtest';
import {
  fetchIntradayCandles,
  REPLAY_TICKER_PRESETS,
  IntradayInterval,
} from '../services/yahooIntradayService';
import {
  ReplayState,
  ReplaySide,
  createInitialReplayState,
  stepForward,
  stepBackward,
  openPosition,
  closePosition,
  computeMetrics,
  exportTradesToCSV,
} from '../services/replayEngine';

export interface BarReplayStudioProps {}

export const BarReplayStudio: React.FC<BarReplayStudioProps> = () => {
  // ── Data & Setup State ──
  const [symbol, setSymbol] = useState<string>('^NSEI');
  const [customSymbol, setCustomSymbol] = useState<string>('');
  const [selectedInterval, setSelectedInterval] = useState<IntradayInterval>('15m');
  const [initialBalance, setInitialBalance] = useState<number>(100000);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // ── Replay Engine State ──
  const [replayState, setReplayState] = useState<ReplayState | null>(null);
  const [playSpeed, setPlaySpeed] = useState<number>(1); // candles / sec

  // ── Order Entry Inputs ──
  const [orderSide, setOrderSide] = useState<ReplaySide>('LONG');
  const [orderQty, setOrderQty] = useState<number>(1);
  const [orderSl, setOrderSl] = useState<string>('');
  const [orderTp, setOrderTp] = useState<string>('');

  // ── Collapsible Trade Log ──
  const [isTradeLogOpen, setIsTradeLogOpen] = useState<boolean>(true);

  // ── Lightweight Charts DOM & Series Refs ──
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const priceLinesRef = useRef<{ entry?: IPriceLine; sl?: IPriceLine; tp?: IPriceLine }>({});

  // ── 1. Fetch & Initialize Candles ──
  const handleLoadData = useCallback(async () => {
    setIsLoadingData(true);
    setDataError(null);
    try {
      const targetSymbol = customSymbol.trim() ? customSymbol.trim() : symbol;
      const candles = await fetchIntradayCandles(targetSymbol, selectedInterval);
      if (!candles || candles.length === 0) {
        throw new Error(`No intraday data returned for ${targetSymbol} on ${selectedInterval} interval.`);
      }
      // Start replay at candle 30 or 20% into dataset to give immediate context
      const startIndex = Math.min(30, Math.floor(candles.length * 0.1));
      const initial = createInitialReplayState(candles, startIndex, initialBalance);
      initial.playSpeed = playSpeed;
      setReplayState(initial);
    } catch (err: any) {
      console.error('[BarReplayStudio] Data fetch error:', err);
      setDataError(err.message || 'Failed to load historical data from Yahoo Finance.');
    } finally {
      setIsLoadingData(false);
    }
  }, [symbol, customSymbol, selectedInterval, initialBalance, playSpeed]);

  // Load default dataset on mount
  useEffect(() => {
    handleLoadData();
  }, []);

  // ── 2. Lightweight Charts Initialization ──
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean up existing chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = chartContainerRef.current;
    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight || 500,
      layout: {
        background: { color: '#FFFFFF' },
        textColor: '#1a1c1d',
        fontFamily: "'JetBrains Mono', 'Inter', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#F3F4F6' },
        horzLines: { color: '#F3F4F6' },
      },
      crosshair: {
        mode: 1, // CrosshairMode.Normal
      },
      timeScale: {
        borderColor: '#E5E7EB',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#E5E7EB',
        scaleMargins: {
          top: 0.1,
          bottom: 0.25,
        },
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#059669',
      downColor: '#E11D48',
      borderVisible: false,
      wickUpColor: '#059669',
      wickDownColor: '#E11D48',
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: 'volume',
      priceFormat: { type: 'volume' },
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    // Resize observer
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, []);

  // ── 3. Synchronize Chart with Visible Replay Candles & Price Lines ──
  useEffect(() => {
    if (!replayState || !candleSeriesRef.current || !volumeSeriesRef.current) return;

    // Slice strict candle-by-candle: only candles up to currentIndex
    const visibleCandles = replayState.allCandles.slice(0, replayState.currentIndex + 1);

    // Format for Lightweight Charts
    const formattedBars = visibleCandles.map((c) => ({
      time: Math.floor(c.timestamp / 1000) as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    const formattedVolume = visibleCandles.map((c) => ({
      time: Math.floor(c.timestamp / 1000) as UTCTimestamp,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(5, 150, 105, 0.25)' : 'rgba(225, 29, 72, 0.25)',
    }));

    candleSeriesRef.current.setData(formattedBars);
    volumeSeriesRef.current.setData(formattedVolume);

    // Manage Order Entry / SL / TP Price Lines
    const series = candleSeriesRef.current;
    if (priceLinesRef.current.entry) {
      series.removePriceLine(priceLinesRef.current.entry);
      delete priceLinesRef.current.entry;
    }
    if (priceLinesRef.current.sl) {
      series.removePriceLine(priceLinesRef.current.sl);
      delete priceLinesRef.current.sl;
    }
    if (priceLinesRef.current.tp) {
      series.removePriceLine(priceLinesRef.current.tp);
      delete priceLinesRef.current.tp;
    }

    if (replayState.activePosition) {
      const pos = replayState.activePosition;
      priceLinesRef.current.entry = series.createPriceLine({
        price: pos.entryPrice,
        color: '#536CF0',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `${pos.side} Entry (${pos.entryPrice.toFixed(2)})`,
      });

      if (pos.stopLoss != null) {
        priceLinesRef.current.sl = series.createPriceLine({
          price: pos.stopLoss,
          color: '#E11D48',
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
          title: `SL (${pos.stopLoss.toFixed(2)})`,
        });
      }

      if (pos.takeProfit != null) {
        priceLinesRef.current.tp = series.createPriceLine({
          price: pos.takeProfit,
          color: '#059669',
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
          title: `TP (${pos.takeProfit.toFixed(2)})`,
        });
      }
    }
  }, [replayState?.currentIndex, replayState?.activePosition]);

  // ── 4. Transport & Stepping Controls ──
  const handleStepForward = useCallback(() => {
    setReplayState((prev) => (prev ? stepForward(prev) : null));
  }, []);

  const handleStepBackward = useCallback(() => {
    setReplayState((prev) => (prev ? stepBackward(prev) : null));
  }, []);

  const handleTogglePlay = useCallback(() => {
    setReplayState((prev) => {
      if (!prev) return null;
      return { ...prev, isPlaying: !prev.isPlaying };
    });
  }, []);

  const handleResetReplay = useCallback(() => {
    if (!replayState) return;
    const initial = createInitialReplayState(
      replayState.allCandles,
      replayState.startIndex,
      initialBalance
    );
    initial.playSpeed = playSpeed;
    setReplayState(initial);
  }, [replayState, initialBalance, playSpeed]);

  // ── 5. Auto-Play Interval Timer ──
  useEffect(() => {
    if (!replayState?.isPlaying) return;

    const intervalMs = Math.max(100, Math.floor(1000 / playSpeed));
    const timer = setInterval(() => {
      setReplayState((prev) => {
        if (!prev) return null;
        if (prev.currentIndex >= prev.allCandles.length - 1) {
          return { ...prev, isPlaying: false };
        }
        return stepForward(prev);
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [replayState?.isPlaying, playSpeed]);

  // ── 6. Keyboard Shortcuts Listener ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleStepForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleStepBackward();
      } else if (e.code === 'Escape') {
        setReplayState((prev) => (prev ? { ...prev, isPlaying: false } : null));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, handleStepForward, handleStepBackward]);

  // ── 7. Order Execution Handlers ──
  const handlePlaceOrder = () => {
    if (!replayState || replayState.activePosition) return;
    const sl = orderSl.trim() ? parseFloat(orderSl) : null;
    const tp = orderTp.trim() ? parseFloat(orderTp) : null;
    setReplayState((prev) => (prev ? openPosition(prev, orderSide, orderQty, sl, tp) : null));
  };

  const handleManualClose = () => {
    if (!replayState || !replayState.activePosition) return;
    setReplayState((prev) => (prev ? closePosition(prev) : null));
  };

  const handleExportCSV = () => {
    if (!replayState || replayState.closedTrades.length === 0) return;
    const csv = exportTradesToCSV(replayState.closedTrades);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bar_replay_trades_${symbol}_${selectedInterval}_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ── Metrics Calculation ──
  const metrics = replayState ? computeMetrics(replayState) : null;
  const currentCandle = replayState ? replayState.allCandles[replayState.currentIndex] : null;

  // Auto-calculated R:R display
  const currentPrice = currentCandle ? currentCandle.close : 0;
  const parsedSl = parseFloat(orderSl);
  const parsedTp = parseFloat(orderTp);
  const riskAmount =
    !isNaN(parsedSl) && currentPrice > 0 ? Math.abs(currentPrice - parsedSl) : null;
  const rewardAmount =
    !isNaN(parsedTp) && currentPrice > 0 ? Math.abs(parsedTp - currentPrice) : null;
  const rrRatio =
    riskAmount && rewardAmount && riskAmount > 0
      ? (rewardAmount / riskAmount).toFixed(2)
      : null;

  return (
    <div className="w-full flex-1 flex flex-col min-h-screen bg-background font-body-md text-on-background select-none">
      {/* ── A. TOP TOOLBAR (Compact, High-Contrast) ── */}
      <div className="w-full bg-surface-card border-b border-border-subtle px-margin py-2.5 flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
        {/* Left: Ticker & Timeframe */}
        <div className="flex flex-wrap items-center gap-space-sm">
          {/* Preset Selector */}
          <div className="relative">
            <select
              value={symbol}
              onChange={(e) => {
                setSymbol(e.target.value);
                setCustomSymbol('');
              }}
              className="h-8 px-space-sm bg-surface-container-low border border-border-subtle rounded-lg text-xs font-mono-sm text-on-surface focus:outline-none focus:border-secondary cursor-pointer"
            >
              {REPLAY_TICKER_PRESETS.map((p) => (
                <option key={p.symbol} value={p.symbol}>
                  {p.label} ({p.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Custom Yahoo Symbol Input */}
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Or custom ticker (e.g. MSFT)..."
              value={customSymbol}
              onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())}
              className="h-8 w-44 px-space-sm bg-surface-container-low border border-border-subtle rounded-lg text-xs font-mono-sm text-on-surface placeholder:text-text-muted focus:outline-none focus:border-secondary"
            />
          </div>

          {/* Interval Toggle Pills */}
          <div className="inline-flex p-0.5 bg-surface-container-low rounded-lg border border-border-subtle">
            {(['5m', '15m', '30m', '1h'] as IntradayInterval[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedInterval(tf)}
                className={`px-2.5 py-1 text-xs font-mono-sm rounded-md transition-all cursor-pointer ${
                  selectedInterval === tf
                    ? 'bg-primary text-on-primary font-semibold shadow-2xs'
                    : 'text-text-secondary hover:text-on-surface'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Load Data Button */}
          <button
            onClick={handleLoadData}
            disabled={isLoadingData}
            className="h-8 px-3.5 bg-primary text-on-primary hover:bg-primary-container rounded-lg text-xs font-label-md flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60 shadow-xs"
          >
            {isLoadingData ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Activity className="w-3.5 h-3.5" />
            )}
            <span>{isLoadingData ? 'Loading 60D Bars...' : 'Fetch Yahoo 15m'}</span>
          </button>

          {/* Candle Count Badge */}
          {replayState && (
            <span className="px-2 py-1 rounded bg-surface-container-low border border-border-subtle font-mono-sm text-[11px] text-text-muted">
              {replayState.allCandles.length.toLocaleString()} Bars (Zero-Lookahead)
            </span>
          )}
        </div>

        {/* Right: Initial Balance & Replay Transport Summary */}
        <div className="flex items-center gap-space-sm">
          <div className="flex items-center gap-1.5 px-space-sm py-1 bg-surface-container-low border border-border-subtle rounded-lg">
            <span className="text-[11px] font-mono-sm text-text-muted uppercase">Base Equity:</span>
            <span className="text-xs font-mono-sm font-bold text-on-surface tabular-nums">
              ₹{initialBalance.toLocaleString()}
            </span>
          </div>

          <button
            onClick={handleResetReplay}
            className="h-8 px-3 bg-surface-card border border-border-subtle hover:bg-surface-container-low text-on-surface rounded-lg text-xs font-label-md flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Reset to Starting Bar"
          >
            <RotateCcw className="w-3.5 h-3.5 text-text-muted" />
            <span>Reset Replay</span>
          </button>
        </div>
      </div>

      {/* ── B. TRANSPORT REPLAY CONTROL BAR ── */}
      <div className="w-full bg-surface-card/90 border-b border-border-subtle px-margin py-1.5 flex flex-wrap items-center justify-between gap-2">
        {/* Progress & Current Timestamp */}
        <div className="flex items-center gap-3 font-mono-sm text-xs">
          <span className="text-text-muted">
            BAR:{' '}
            <strong className="text-on-surface font-semibold tabular-nums">
              {replayState ? replayState.currentIndex + 1 : 0}
            </strong>{' '}
            /{' '}
            <span className="tabular-nums">
              {replayState ? replayState.allCandles.length : 0}
            </span>
          </span>
          <span className="text-border-subtle">|</span>
          <span className="inline-flex items-center gap-1.5 text-on-surface font-medium">
            <Clock className="w-3.5 h-3.5 text-secondary" />
            <span>{currentCandle ? currentCandle.time : 'Awaiting Data'}</span>
          </span>
          {currentCandle && (
            <>
              <span className="text-border-subtle">|</span>
              <span>
                CLOSE:{' '}
                <strong className="text-bullish font-bold tabular-nums">
                  {currentCandle.close.toFixed(2)}
                </strong>
              </span>
            </>
          )}
        </div>

        {/* Transport Controls (Center) */}
        <div className="flex items-center gap-1.5">
          {/* Step Backward (-1) */}
          <button
            onClick={handleStepBackward}
            disabled={!replayState || replayState.currentIndex <= replayState.startIndex}
            className="w-8 h-8 rounded-lg bg-surface-container-low border border-border-subtle flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-40"
            title="Step Back 1 Candle (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Play / Pause */}
          <button
            onClick={handleTogglePlay}
            disabled={!replayState}
            className={`px-4 h-8 rounded-lg font-label-md text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              replayState?.isPlaying
                ? 'bg-bearish text-white hover:bg-bearish/90'
                : 'bg-primary text-on-primary hover:bg-primary-container'
            }`}
            title="Play / Pause (Spacebar)"
          >
            {replayState?.isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Auto-Bar</span>
              </>
            )}
          </button>

          {/* Step Forward (+1) */}
          <button
            onClick={handleStepForward}
            disabled={!replayState || replayState.currentIndex >= replayState.allCandles.length - 1}
            className="w-8 h-8 rounded-lg bg-surface-container-low border border-border-subtle flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-40"
            title="Step Forward 1 Candle (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-mono-sm text-text-muted mr-1">SPEED:</span>
          {[0.5, 1, 2, 5].map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaySpeed(speed)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono-sm font-semibold transition-colors cursor-pointer ${
                playSpeed === speed
                  ? 'bg-secondary text-white'
                  : 'bg-surface-container-low text-text-secondary hover:text-on-surface'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* ── C. MAIN WORKSPACE (Chart Area + Order Panel) ── */}
      <div className="flex-1 flex flex-col lg:flex-row w-full min-h-[500px]">
        {/* C1. TradingView Lightweight Chart Container */}
        <div className="flex-1 relative bg-white border-b lg:border-b-0 lg:border-r border-border-subtle min-h-[460px] flex flex-col">
          {dataError && (
            <div className="absolute top-4 left-4 z-10 p-3 rounded-lg bg-bearish-tint border border-bearish text-bearish text-xs max-w-md">
              {dataError}
            </div>
          )}

          <div ref={chartContainerRef} className="w-full flex-1" />

          {/* Chart Overlay Helper Badge */}
          <div className="absolute bottom-2 left-3 pointer-events-none z-10 flex items-center gap-2 text-[10px] font-mono text-text-muted bg-white/80 backdrop-blur-xs px-2 py-1 rounded border border-border-subtle">
            <span className="w-2 h-2 rounded-full bg-bullish animate-pulse" />
            <span>Yahoo Finance Intraday 15m · Zero Tick Simulation (Real Closed Bars Only)</span>
          </div>
        </div>

        {/* C2. Simulated Order Execution & Risk Engine Panel */}
        <div className="w-full lg:w-72 bg-surface-card p-4 flex flex-col gap-4 shrink-0">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <div className="flex items-center gap-1.5 font-title-md text-sm text-on-surface font-semibold">
              <Shield className="w-4 h-4 text-secondary" />
              <span>Execution Engine</span>
            </div>
            <span className="font-mono-sm text-[10px] px-1.5 py-0.5 rounded bg-surface-container-low text-text-muted">
              MTM SIMULATOR
            </span>
          </div>

          {/* Active Position Card */}
          {replayState?.activePosition ? (
            <div className="p-3 rounded-xl bg-surface-container-low border border-secondary/30 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    replayState.activePosition.side === 'LONG'
                      ? 'bg-bullish-tint text-bullish'
                      : 'bg-bearish-tint text-bearish'
                  }`}
                >
                  {replayState.activePosition.side} ({replayState.activePosition.qty} Qty)
                </span>
                <span className="font-mono text-xs tabular-nums text-text-muted">
                  @ {replayState.activePosition.entryPrice.toFixed(2)}
                </span>
              </div>

              {/* Unrealized PnL */}
              {metrics && (
                <div className="flex items-center justify-between pt-1 border-t border-border-subtle">
                  <span className="text-[11px] text-text-muted">Unrealized P&amp;L:</span>
                  <span
                    className={`font-mono text-xs font-bold tabular-nums ${
                      metrics.unrealizedPnl >= 0 ? 'text-bullish' : 'text-bearish'
                    }`}
                  >
                    {metrics.unrealizedPnl >= 0 ? '+' : ''}₹{metrics.unrealizedPnl.toFixed(2)}
                  </span>
                </div>
              )}

              {/* SL / TP Info */}
              <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-text-muted">
                <div>SL: {replayState.activePosition.stopLoss?.toFixed(2) || 'None'}</div>
                <div>TP: {replayState.activePosition.takeProfit?.toFixed(2) || 'None'}</div>
              </div>

              {/* Manual Close Button */}
              <button
                onClick={handleManualClose}
                className="w-full mt-1 py-1.5 rounded-lg bg-bearish text-white font-label-md text-xs hover:bg-bearish/90 transition-colors cursor-pointer active:scale-95 shadow-xs"
              >
                Close Position @ Current Bar Close
              </button>
            </div>
          ) : (
            /* Order Entry Form */
            <div className="flex flex-col gap-3">
              {/* Long / Short Toggle */}
              <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-surface-container-low rounded-lg border border-border-subtle">
                <button
                  type="button"
                  onClick={() => setOrderSide('LONG')}
                  className={`py-1.5 text-xs font-label-md rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    orderSide === 'LONG'
                      ? 'bg-bullish text-white font-bold shadow-2xs'
                      : 'text-text-secondary hover:text-on-surface'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Buy (Long)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderSide('SHORT')}
                  className={`py-1.5 text-xs font-label-md rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    orderSide === 'SHORT'
                      ? 'bg-bearish text-white font-bold shadow-2xs'
                      : 'text-text-secondary hover:text-on-surface'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Sell (Short)</span>
                </button>
              </div>

              {/* Quantity */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-label-sm text-text-muted uppercase">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={orderQty}
                  onChange={(e) => setOrderQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-8 px-space-sm bg-surface-container-low border border-border-subtle rounded-lg text-xs font-mono tabular-nums text-on-surface focus:outline-none focus:border-secondary"
                />
              </div>

              {/* Stop Loss Input */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-label-sm text-text-muted uppercase">
                    Stop Loss (Price)
                  </label>
                  {currentPrice > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const defaultDist = currentPrice * 0.01;
                        const suggested =
                          orderSide === 'LONG' ? currentPrice - defaultDist : currentPrice + defaultDist;
                        setOrderSl(suggested.toFixed(2));
                      }}
                      className="text-[10px] text-secondary hover:underline cursor-pointer"
                    >
                      1% Risk
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  step="0.05"
                  placeholder="Optional SL price..."
                  value={orderSl}
                  onChange={(e) => setOrderSl(e.target.value)}
                  className="h-8 px-space-sm bg-surface-container-low border border-border-subtle rounded-lg text-xs font-mono tabular-nums text-on-surface focus:outline-none focus:border-secondary"
                />
              </div>

              {/* Take Profit Input */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-label-sm text-text-muted uppercase">
                    Take Profit (Price)
                  </label>
                  {currentPrice > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const defaultDist = currentPrice * 0.02;
                        const suggested =
                          orderSide === 'LONG' ? currentPrice + defaultDist : currentPrice - defaultDist;
                        setOrderTp(suggested.toFixed(2));
                      }}
                      className="text-[10px] text-secondary hover:underline cursor-pointer"
                    >
                      2% Target
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  step="0.05"
                  placeholder="Optional TP price..."
                  value={orderTp}
                  onChange={(e) => setOrderTp(e.target.value)}
                  className="h-8 px-space-sm bg-surface-container-low border border-border-subtle rounded-lg text-xs font-mono tabular-nums text-on-surface focus:outline-none focus:border-secondary"
                />
              </div>

              {/* Auto R:R Indicator */}
              {rrRatio && (
                <div className="px-2.5 py-1.5 rounded-lg bg-surface-container-low border border-border-subtle flex items-center justify-between text-xs font-mono">
                  <span className="text-text-muted">Calculated R:R:</span>
                  <span className="text-bullish font-bold">1 : {rrRatio}</span>
                </div>
              )}

              {/* Execute Market Entry */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={!replayState}
                className="w-full mt-2 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                <span>Enter {orderSide} @ Bar Close ({currentPrice.toFixed(2)})</span>
              </button>
            </div>
          )}

          {/* Conservative Fill Rule Notice */}
          <div className="mt-auto p-2.5 rounded-lg bg-surface-container-low border border-border-subtle text-[10px] text-text-muted leading-relaxed">
            <strong className="text-on-surface">Conservative Fill Engine:</strong> If both SL and TP
            fall inside the same 15m candle's High–Low range, SL is always assumed hit first to avoid
            overstated results.
          </div>
        </div>
      </div>

      {/* ── D. LIVE STATS METRICS BAR ── */}
      {metrics && (
        <div className="w-full bg-surface-card border-t border-border-subtle px-margin py-2.5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-space-sm">
          {/* 1. Balance */}
          <div className="flex flex-col">
            <span className="font-label-sm text-[10px] text-text-muted uppercase">Account Balance</span>
            <span className="font-mono-md text-sm font-bold text-on-surface tabular-nums">
              ₹{metrics.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* 2. Realized PnL */}
          <div className="flex flex-col">
            <span className="font-label-sm text-[10px] text-text-muted uppercase">Realized P&amp;L</span>
            <span
              className={`font-mono-md text-sm font-bold tabular-nums ${
                metrics.realizedPnl >= 0 ? 'text-bullish' : 'text-bearish'
              }`}
            >
              {metrics.realizedPnl >= 0 ? '+' : ''}₹{metrics.realizedPnl.toFixed(2)}
            </span>
          </div>

          {/* 3. Unrealized PnL */}
          <div className="flex flex-col">
            <span className="font-label-sm text-[10px] text-text-muted uppercase">Unrealized P&amp;L</span>
            <span
              className={`font-mono-md text-sm font-bold tabular-nums ${
                metrics.unrealizedPnl >= 0 ? 'text-bullish' : 'text-bearish'
              }`}
            >
              {metrics.unrealizedPnl >= 0 ? '+' : ''}₹{metrics.unrealizedPnl.toFixed(2)}
            </span>
          </div>

          {/* 4. Win Rate */}
          <div className="flex flex-col">
            <span className="font-label-sm text-[10px] text-text-muted uppercase">Win Rate</span>
            <span className="font-mono-md text-sm font-bold text-on-surface tabular-nums">
              {metrics.winRate.toFixed(1)}%
            </span>
          </div>

          {/* 5. Profit Factor */}
          <div className="flex flex-col">
            <span className="font-label-sm text-[10px] text-text-muted uppercase">Profit Factor</span>
            <span className="font-mono-md text-sm font-bold text-on-surface tabular-nums">
              {metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2)}
            </span>
          </div>

          {/* 6. Total Trades */}
          <div className="flex flex-col">
            <span className="font-label-sm text-[10px] text-text-muted uppercase">Total Trades</span>
            <span className="font-mono-md text-sm font-bold text-on-surface tabular-nums">
              {metrics.totalTrades}
            </span>
          </div>

          {/* 7. Max Drawdown */}
          <div className="flex flex-col">
            <span className="font-label-sm text-[10px] text-text-muted uppercase">Max Drawdown</span>
            <span className="font-mono-md text-sm font-bold text-bearish tabular-nums">
              -{metrics.maxDrawdownPct.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {/* ── E. COLLAPSIBLE TRADE JOURNAL TABLE & CSV EXPORT ── */}
      <div className="w-full bg-surface-card border-t border-border-subtle">
        {/* Toggle Header */}
        <div
          onClick={() => setIsTradeLogOpen((prev) => !prev)}
          className="w-full px-margin py-2 flex items-center justify-between cursor-pointer hover:bg-surface-container-low transition-colors select-none"
        >
          <div className="flex items-center gap-2">
            <span className="font-label-md text-xs font-semibold text-on-surface">
              Trade Journal ({replayState?.closedTrades.length || 0} Closed Positions)
            </span>
            <span className="text-[10px] font-mono text-text-muted">
              Candle-by-Candle Audit Trail
            </span>
          </div>

          <div className="flex items-center gap-space-md">
            {replayState && replayState.closedTrades.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExportCSV();
                }}
                className="px-2.5 py-1 rounded bg-surface-container-low border border-border-subtle hover:bg-surface-container-high text-xs font-label-md flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Download className="w-3 h-3 text-text-muted" />
                <span>Export CSV</span>
              </button>
            )}

            {isTradeLogOpen ? (
              <ChevronUp className="w-4 h-4 text-text-muted" />
            ) : (
              <ChevronDown className="w-4 h-4 text-text-muted" />
            )}
          </div>
        </div>

        {/* Scrollable Table */}
        {isTradeLogOpen && (
          <div className="w-full max-h-56 overflow-y-auto no-scrollbar border-t border-border-subtle">
            {replayState && replayState.closedTrades.length > 0 ? (
              <table className="w-full text-left font-mono-sm text-xs border-collapse">
                <thead className="sticky top-0 bg-surface-container-low text-text-muted text-[10px] uppercase border-b border-border-subtle">
                  <tr>
                    <th className="py-2 px-margin font-semibold">#</th>
                    <th className="py-2 px-2 font-semibold">Side</th>
                    <th className="py-2 px-2 font-semibold">Entry Time</th>
                    <th className="py-2 px-2 font-semibold">Exit Time</th>
                    <th className="py-2 px-2 font-semibold text-right">Entry Price</th>
                    <th className="py-2 px-2 font-semibold text-right">Exit Price</th>
                    <th className="py-2 px-2 font-semibold text-right">SL / TP</th>
                    <th className="py-2 px-2 font-semibold">Exit Reason</th>
                    <th className="py-2 px-2 font-semibold text-right">R-Multiple</th>
                    <th className="py-2 px-margin font-semibold text-right">Net P&amp;L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {replayState.closedTrades.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-surface-container-low/50">
                      <td className="py-2 px-margin text-text-muted">{idx + 1}</td>
                      <td className="py-2 px-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            t.side === 'LONG'
                              ? 'bg-bullish-tint text-bullish'
                              : 'bg-bearish-tint text-bearish'
                          }`}
                        >
                          {t.side}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-text-secondary">{t.entryTime}</td>
                      <td className="py-2 px-2 text-text-secondary">{t.exitTime}</td>
                      <td className="py-2 px-2 text-right tabular-nums">
                        {t.entryPrice.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-right tabular-nums">
                        {t.exitPrice.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-right text-text-muted text-[11px] tabular-nums">
                        {t.stopLoss?.toFixed(1) || '-'} / {t.takeProfit?.toFixed(1) || '-'}
                      </td>
                      <td className="py-2 px-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-low text-text-muted font-medium">
                          {t.exitReason}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right tabular-nums">
                        {t.rMultiple != null ? `${t.rMultiple.toFixed(2)}R` : '-'}
                      </td>
                      <td
                        className={`py-2 px-margin text-right font-bold tabular-nums ${
                          t.pnl >= 0 ? 'text-bullish' : 'text-bearish'
                        }`}
                      >
                        {t.pnl >= 0 ? '+' : ''}₹{t.pnl.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-8 text-center text-text-muted text-xs font-mono">
                No trades taken yet. Advance candles, set entry/SL/TP, and place simulated orders.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
