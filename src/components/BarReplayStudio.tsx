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
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  Clock,
  Shield,
  Search,
  PenTool,
  Square,
  Minus,
  Sparkles,
  Trash2,
  Undo2,
  MousePointer,
  Grid,
} from 'lucide-react';
import { Candle } from '../types/backtest';
import { userActivityTracker } from '../services/userActivityTracker';
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
import {
  ALL_NIFTY_50_STOCKS,
  NIFTY_50_SECTORS,
  Nifty50Constituent,
  fetchNifty50LiveQuotes,
} from '../services/nifty50Data';
import {
  DrawingToolType,
  ChartDrawing,
  TrendlineDrawing,
  RectangleDrawing,
  HorizontalRayDrawing,
  FibonacciDrawing,
  DRAWING_COLOR_PALETTE,
  autoDetectTrendlines,
  autoDetectZonesAndRectangles,
} from '../services/chartDrawingTools';

export interface BarReplayStudioProps {}

export const BarReplayStudio: React.FC<BarReplayStudioProps> = () => {
  // ── Data & Setup State ──
  const [symbol, setSymbol] = useState<string>('^NSEI');
  const [customSymbol, setCustomSymbol] = useState<string>('');
  const [selectedInterval, setSelectedInterval] = useState<IntradayInterval>('15m');
  const [initialBalance, setInitialBalance] = useState<number>(100000);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // ── NIFTY 50 Constituent Selector State ──
  const [isNifty50ModalOpen, setIsNifty50ModalOpen] = useState<boolean>(false);
  const [nifty50Search, setNifty50Search] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('All Sectors');
  const [nifty50List, setNifty50List] = useState<Nifty50Constituent[]>(ALL_NIFTY_50_STOCKS);

  // ── Replay Engine State ──
  const [replayState, setReplayState] = useState<ReplayState | null>(null);
  const [playSpeed, setPlaySpeed] = useState<number>(1); // candles / sec

  // ── Order Entry Inputs ──
  const [orderSide, setOrderSide] = useState<ReplaySide>('LONG');
  const [orderQty, setOrderQty] = useState<number>(1);
  const [orderSl, setOrderSl] = useState<string>('');
  const [orderTp, setOrderTp] = useState<string>('');

  // ── Interactive Drawing Tools State ──
  const [activeTool, setActiveTool] = useState<DrawingToolType>('cursor');
  const [activeColorHex, setActiveColorHex] = useState<string>('#536CF0');
  const [drawings, setDrawings] = useState<ChartDrawing[]>([]);
  const [autoTrendlinesEnabled, setAutoTrendlinesEnabled] = useState<boolean>(true);
  const [autoZonesEnabled, setAutoZonesEnabled] = useState<boolean>(true);
  const [drawingStartPoint, setDrawingStartPoint] = useState<{ time: number; price: number; x: number; y: number } | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<{ x: number; y: number } | null>(null);

  // ── Collapsible Trade Log ──
  const [isTradeLogOpen, setIsTradeLogOpen] = useState<boolean>(true);

  // ── Lightweight Charts DOM & Series Refs ──
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const priceLinesRef = useRef<{ entry?: IPriceLine; sl?: IPriceLine; tp?: IPriceLine }>({});

  // ── Fetch NIFTY 50 live quotes in background ──
  useEffect(() => {
    fetchNifty50LiveQuotes().then((quotes) => {
      if (quotes && quotes.length > 0) {
        setNifty50List(quotes);
      }
    });
  }, []);

  // ── 1. Fetch & Initialize Candles ──
  const handleLoadData = useCallback(async (targetSymbolOverride?: string, intervalOverride?: IntradayInterval) => {
    setIsLoadingData(true);
    setDataError(null);
    try {
      const target = targetSymbolOverride || (customSymbol.trim() ? customSymbol.trim() : symbol);
      const activeInterval = intervalOverride || selectedInterval;
      const candles = await fetchIntradayCandles(target, activeInterval);
      if (!candles || candles.length === 0) {
        throw new Error(`No data returned for ${target} on ${activeInterval} interval.`);
      }
      // Start replay at candle 35 or 15% into dataset to give immediate context
      const startIndex = Math.min(35, Math.floor(candles.length * 0.15));
      const initial = createInitialReplayState(candles, startIndex, initialBalance);
      initial.playSpeed = playSpeed;
      setReplayState(initial);
      if (targetSymbolOverride) {
        setSymbol(targetSymbolOverride);
        setCustomSymbol('');
      }
      if (intervalOverride) {
        setSelectedInterval(intervalOverride);
      }
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
        const w = chartContainerRef.current.clientWidth;
        const h = chartContainerRef.current.clientHeight;
        chartRef.current.applyOptions({ width: w, height: h });
        if (drawingCanvasRef.current) {
          drawingCanvasRef.current.width = w;
          drawingCanvasRef.current.height = h;
          renderDrawingsCanvas();
        }
      }
    };

    window.addEventListener('resize', handleResize);
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    // Subscribe to chart movements to keep drawings synchronized
    chart.timeScale().subscribeVisibleLogicalRangeChange(() => {
      renderDrawingsCanvas();
    });

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

    const visibleCandles = replayState.allCandles.slice(0, replayState.currentIndex + 1);

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

    renderDrawingsCanvas();
  }, [replayState?.currentIndex, replayState?.activePosition]);

  // ── 4. Drawing Canvas Coordinate Converters & Render Engine ──
  const timeToX = useCallback((timeSec: number): number | null => {
    if (!chartRef.current) return null;
    return chartRef.current.timeScale().timeToCoordinate(timeSec as UTCTimestamp);
  }, []);

  const priceToY = useCallback((price: number): number | null => {
    if (!candleSeriesRef.current) return null;
    return candleSeriesRef.current.priceToCoordinate(price);
  }, []);

  const xToTime = useCallback((x: number): number | null => {
    if (!chartRef.current) return null;
    const t = chartRef.current.timeScale().coordinateToTime(x);
    return typeof t === 'number' ? t : null;
  }, []);

  const yToPrice = useCallback((y: number): number | null => {
    if (!candleSeriesRef.current) return null;
    return candleSeriesRef.current.coordinateToPrice(y);
  }, []);

  const renderDrawingsCanvas = useCallback(() => {
    const canvas = drawingCanvasRef.current;
    if (!canvas || !chartRef.current || !candleSeriesRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const visibleCandles = replayState
      ? replayState.allCandles.slice(0, replayState.currentIndex + 1)
      : [];

    // ── 4a. Auto-Detected Fair Value Gaps & Zones ──
    if (autoZonesEnabled && visibleCandles.length > 5) {
      const autoBoxes = autoDetectZonesAndRectangles(visibleCandles);
      for (const box of autoBoxes) {
        const x1 = timeToX(box.time1);
        const y1 = priceToY(box.price1);
        const x2 = timeToX(box.time2) || canvas.width - 60;
        const y2 = priceToY(box.price2);

        if (x1 !== null && y1 !== null && y2 !== null) {
          const rx = Math.min(x1, x2);
          const ry = Math.min(y1, y2);
          const rw = Math.max(20, Math.abs(x2 - x1));
          const rh = Math.max(4, Math.abs(y2 - y1));

          ctx.fillStyle = box.fillColor || 'rgba(5, 150, 105, 0.12)';
          ctx.fillRect(rx, ry, rw, rh);
          ctx.strokeStyle = box.color;
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.strokeRect(rx, ry, rw, rh);
          ctx.setLineDash([]);

          // Zone label
          if (box.label) {
            ctx.fillStyle = box.color;
            ctx.font = '9px "JetBrains Mono", monospace';
            ctx.fillText(box.label, rx + 4, ry + 11);
          }
        }
      }
    }

    // ── 4b. Auto-Detected Dynamic Resistance & Support Trendlines ──
    if (autoTrendlinesEnabled && visibleCandles.length > 15) {
      const autoLines = autoDetectTrendlines(visibleCandles);
      for (const line of autoLines) {
        const x1 = timeToX(line.time1);
        const y1 = priceToY(line.price1);
        const x2 = timeToX(line.time2);
        const y2 = priceToY(line.price2);

        if (x1 !== null && y1 !== null && x2 !== null && y2 !== null) {
          ctx.beginPath();
          ctx.strokeStyle = line.color;
          ctx.lineWidth = line.lineWidth || 2;
          ctx.setLineDash([4, 4]);

          // Extend trendline across visible chart if requested
          if (line.extendRight && x2 !== x1) {
            const slope = (y2 - y1) / (x2 - x1);
            const targetX = canvas.width - 40;
            const targetY = y1 + slope * (targetX - x1);
            ctx.moveTo(x1, y1);
            ctx.lineTo(targetX, targetY);
          } else {
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
          }
          ctx.stroke();
          ctx.setLineDash([]);

          // Pivot nodes
          ctx.fillStyle = line.color;
          ctx.beginPath();
          ctx.arc(x1, y1, 3, 0, Math.PI * 2);
          ctx.arc(x2, y2, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // ── 4c. User-Created Persistent Drawings ──
    for (const d of drawings) {
      if (d.type === 'trendline') {
        const tl = d as TrendlineDrawing;
        const x1 = timeToX(tl.time1);
        const y1 = priceToY(tl.price1);
        const x2 = timeToX(tl.time2);
        const y2 = priceToY(tl.price2);

        if (x1 !== null && y1 !== null && x2 !== null && y2 !== null) {
          ctx.beginPath();
          ctx.strokeStyle = tl.color;
          ctx.lineWidth = tl.lineWidth || 2;
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          // End handles
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = tl.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x1, y1, 4, 0, Math.PI * 2);
          ctx.arc(x2, y2, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Delta point label
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          const deltaPrice = tl.price2 - tl.price1;
          const pct = ((deltaPrice / tl.price1) * 100).toFixed(2);
          ctx.fillStyle = tl.color;
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillText(`${deltaPrice >= 0 ? '+' : ''}${deltaPrice.toFixed(1)} (${pct}%)`, midX + 6, midY - 6);
        }
      } else if (d.type === 'rectangle') {
        const rect = d as RectangleDrawing;
        const x1 = timeToX(rect.time1);
        const y1 = priceToY(rect.price1);
        const x2 = timeToX(rect.time2);
        const y2 = priceToY(rect.price2);

        if (x1 !== null && y1 !== null && x2 !== null && y2 !== null) {
          const rx = Math.min(x1, x2);
          const ry = Math.min(y1, y2);
          const rw = Math.abs(x2 - x1);
          const rh = Math.abs(y2 - y1);

          ctx.fillStyle = rect.fillColor || 'rgba(83, 108, 240, 0.15)';
          ctx.fillRect(rx, ry, rw, rh);
          ctx.strokeStyle = rect.color;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(rx, ry, rw, rh);

          // Corner price bounds
          ctx.fillStyle = rect.color;
          ctx.font = '10px "JetBrains Mono", monospace';
          const maxP = Math.max(rect.price1, rect.price2).toFixed(2);
          const minP = Math.min(rect.price1, rect.price2).toFixed(2);
          ctx.fillText(`Top: ${maxP}`, rx + rw + 4, ry + 10);
          ctx.fillText(`Btm: ${minP}`, rx + rw + 4, ry + rh);
        }
      } else if (d.type === 'ray') {
        const ray = d as HorizontalRayDrawing;
        const y = priceToY(ray.price);
        if (y !== null) {
          ctx.beginPath();
          ctx.strokeStyle = ray.color;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 3]);
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = ray.color;
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillText(`Level: ${ray.price.toFixed(2)}`, canvas.width - 100, y - 4);
        }
      } else if (d.type === 'fibonacci') {
        const fib = d as FibonacciDrawing;
        const x1 = timeToX(fib.time1);
        const x2 = timeToX(fib.time2) || canvas.width - 20;
        const y1 = priceToY(fib.price1);
        const y2 = priceToY(fib.price2);

        if (x1 !== null && y1 !== null && y2 !== null) {
          const fibLevels = [
            { r: 0.0, label: '0.0%' },
            { r: 0.236, label: '23.6%' },
            { r: 0.382, label: '38.2%' },
            { r: 0.5, label: '50.0%' },
            { r: 0.618, label: '61.8% (Golden)' },
            { r: 0.786, label: '78.6%' },
            { r: 1.0, label: '100.0%' },
          ];

          const startX = Math.min(x1, x2 || canvas.width);
          const endX = Math.max(x1, x2 || canvas.width);

          for (const lvl of fibLevels) {
            const p = fib.price1 + (fib.price2 - fib.price1) * lvl.r;
            const ly = priceToY(p);
            if (ly !== null) {
              ctx.beginPath();
              ctx.strokeStyle = lvl.r === 0.618 ? '#D97706' : fib.color;
              ctx.lineWidth = lvl.r === 0.618 || lvl.r === 0.5 ? 1.5 : 1;
              ctx.setLineDash([3, 3]);
              ctx.moveTo(startX, ly);
              ctx.lineTo(endX, ly);
              ctx.stroke();
              ctx.setLineDash([]);

              ctx.fillStyle = lvl.r === 0.618 ? '#D97706' : fib.color;
              ctx.font = '9px "JetBrains Mono", monospace';
              ctx.fillText(`${lvl.label} · ${p.toFixed(2)}`, startX + 6, ly - 3);
            }
          }
        }
      }
    }

    // ── 4d. Active In-Progress Drawing Preview ──
    if (drawingStartPoint && currentMousePos) {
      ctx.beginPath();
      ctx.strokeStyle = activeColorHex;
      ctx.lineWidth = 2;

      if (activeTool === 'trendline') {
        ctx.moveTo(drawingStartPoint.x, drawingStartPoint.y);
        ctx.lineTo(currentMousePos.x, currentMousePos.y);
        ctx.stroke();
      } else if (activeTool === 'rectangle') {
        const rx = Math.min(drawingStartPoint.x, currentMousePos.x);
        const ry = Math.min(drawingStartPoint.y, currentMousePos.y);
        const rw = Math.abs(currentMousePos.x - drawingStartPoint.x);
        const rh = Math.abs(currentMousePos.y - drawingStartPoint.y);

        ctx.fillStyle = 'rgba(83, 108, 240, 0.15)';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeRect(rx, ry, rw, rh);
      } else if (activeTool === 'fibonacci') {
        ctx.setLineDash([2, 2]);
        ctx.moveTo(drawingStartPoint.x, drawingStartPoint.y);
        ctx.lineTo(currentMousePos.x, currentMousePos.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [
    drawings,
    autoZonesEnabled,
    autoTrendlinesEnabled,
    drawingStartPoint,
    currentMousePos,
    activeTool,
    activeColorHex,
    replayState?.currentIndex,
    timeToX,
    priceToY,
  ]);

  // Keep canvas rendered whenever state or drawings change
  useEffect(() => {
    renderDrawingsCanvas();
  }, [renderDrawingsCanvas]);

  // ── 5. Canvas Mouse Click & Drag Interactions ──
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'cursor') return;

    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const time = xToTime(x);
    const price = yToPrice(y);
    if (!time || !price) return;

    // Single click tools
    if (activeTool === 'ray') {
      const newRay: HorizontalRayDrawing = {
        id: `ray-${Date.now()}`,
        type: 'ray',
        time,
        price,
        color: activeColorHex,
      };
      setDrawings((prev) => [...prev, newRay]);
      setActiveTool('cursor');
      return;
    }

    // Two-click tools
    if (!drawingStartPoint) {
      setDrawingStartPoint({ time, price, x, y });
    } else {
      // Finish drawing
      if (activeTool === 'trendline') {
        const newTl: TrendlineDrawing = {
          id: `tl-${Date.now()}`,
          type: 'trendline',
          time1: drawingStartPoint.time,
          price1: drawingStartPoint.price,
          time2: time,
          price2: price,
          color: activeColorHex,
          lineWidth: 2,
        };
        setDrawings((prev) => [...prev, newTl]);
      } else if (activeTool === 'rectangle') {
        const newRect: RectangleDrawing = {
          id: `rect-${Date.now()}`,
          type: 'rectangle',
          time1: drawingStartPoint.time,
          price1: drawingStartPoint.price,
          time2: time,
          price2: price,
          color: activeColorHex,
          fillColor: `${activeColorHex}26`, // 15% opacity hex
        };
        setDrawings((prev) => [...prev, newRect]);
      } else if (activeTool === 'fibonacci') {
        const newFib: FibonacciDrawing = {
          id: `fib-${Date.now()}`,
          type: 'fibonacci',
          time1: drawingStartPoint.time,
          price1: drawingStartPoint.price,
          time2: time,
          price2: price,
          color: activeColorHex,
        };
        setDrawings((prev) => [...prev, newFib]);
      }

      setDrawingStartPoint(null);
      setCurrentMousePos(null);
      setActiveTool('cursor');
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'cursor' && !drawingStartPoint) return;
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setCurrentMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    renderDrawingsCanvas();
  };

  // ── 6. Transport & Stepping Controls ──
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

  // ── 7. Auto-Play Interval Timer ──
  useEffect(() => {
    if (!replayState?.isPlaying) return;

    const intervalMs = Math.max(100, Math.floor(1000 / playSpeed));
    const timer = window.setInterval(() => {
      setReplayState((prev) => {
        if (!prev) return null;
        if (prev.currentIndex >= prev.allCandles.length - 1) {
          return { ...prev, isPlaying: false };
        }
        return stepForward(prev);
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [replayState?.isPlaying, playSpeed]);

  // ── 8. Keyboard Shortcuts Listener ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
        setDrawingStartPoint(null);
        setActiveTool('cursor');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, handleStepForward, handleStepBackward]);

  // ── 9. Order Execution Handlers ──
  const handlePlaceOrder = () => {
    if (!replayState || replayState.activePosition) return;
    const sl = orderSl.trim() ? parseFloat(orderSl) : null;
    const tp = orderTp.trim() ? parseFloat(orderTp) : null;
    const currentPrice = replayState.allCandles[replayState.currentIndex]?.close || 0;

    userActivityTracker.trackOrder({
      symbol,
      side: orderSide === 'LONG' ? 'BUY' : 'SELL',
      orderType: 'MARKET',
      quantity: orderQty,
      price: currentPrice,
      stopLoss: sl || undefined,
      takeProfit: tp || undefined,
      module: 'BAR_REPLAY',
    });

    setReplayState((prev) => (prev ? openPosition(prev, orderSide, orderQty, sl, tp) : null));
  };

  const handleManualClose = () => {
    if (!replayState || !replayState.activePosition) return;
    const pos = replayState.activePosition;
    const currentPrice = replayState.allCandles[replayState.currentIndex]?.close || 0;
    const exitPnl =
      pos.side === 'LONG'
        ? (currentPrice - pos.entryPrice) * pos.qty
        : (pos.entryPrice - currentPrice) * pos.qty;

    userActivityTracker.trackOrder({
      symbol,
      side: pos.side === 'LONG' ? 'SELL' : 'BUY',
      orderType: 'MARKET',
      quantity: pos.qty,
      price: currentPrice,
      pnl: exitPnl,
      status: 'FILLED',
      module: 'BAR_REPLAY',
    });

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

  // ── Filtered NIFTY 50 Constituents ──
  const filteredNifty50 = nifty50List.filter((s) => {
    const matchesSector = selectedSector === 'All Sectors' || s.sector === selectedSector;
    const q = nifty50Search.trim().toUpperCase();
    const matchesQuery = !q || s.symbol.toUpperCase().includes(q) || s.name.toUpperCase().includes(q);
    return matchesSector && matchesQuery;
  });

  // ── Metrics Calculation ──
  const metrics = replayState ? computeMetrics(replayState) : null;
  const currentCandle = replayState ? replayState.allCandles[replayState.currentIndex] : null;

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
      {/* ── A. TOP TOOLBAR: NIFTY 50 Constituent Hub & Data Controls ── */}
      <div className="w-full bg-surface-card border-b border-border-subtle px-margin py-2 flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
        {/* Left: Ticker & NIFTY 50 Constituents Button */}
        <div className="flex flex-wrap items-center gap-space-sm">
          {/* NIFTY 50 Constituents Modal Trigger */}
          <button
            onClick={() => setIsNifty50ModalOpen(true)}
            className="h-8 px-3 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
            title="Browse all 50 NIFTY 50 constituent stocks"
          >
            <Grid className="w-3.5 h-3.5 text-bullish" />
            <span>NIFTY 50 Stocks ({ALL_NIFTY_50_STOCKS.length})</span>
          </button>

          {/* Quick Preset Selector */}
          <div className="relative">
            <select
              value={symbol}
              onChange={(e) => {
                setSymbol(e.target.value);
                setCustomSymbol('');
                handleLoadData(e.target.value);
              }}
              className="h-8 px-space-sm bg-surface-container-low border border-border-subtle rounded-lg text-xs font-mono-sm text-on-surface focus:outline-none focus:border-secondary cursor-pointer max-w-[200px]"
            >
              {REPLAY_TICKER_PRESETS.map((p) => (
                <option key={p.symbol} value={p.symbol}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Yahoo Symbol Input */}
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Or custom (e.g. RELIANCE.NS)..."
              value={customSymbol}
              onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())}
              className="h-8 w-44 px-space-sm bg-surface-container-low border border-border-subtle rounded-lg text-xs font-mono-sm text-on-surface placeholder:text-text-muted focus:outline-none focus:border-secondary"
            />
          </div>

          {/* Interval Toggle Pills */}
          <div className="inline-flex p-0.5 bg-surface-container-low rounded-lg border border-border-subtle">
            {(['5m', '15m', '30m', '1h', '1d'] as IntradayInterval[]).map((tf) => (
              <button
                key={tf}
                onClick={() => {
                  setSelectedInterval(tf);
                  handleLoadData(undefined, tf);
                }}
                className={`px-2.5 py-1 text-xs font-mono-sm rounded-md transition-all cursor-pointer ${
                  selectedInterval === tf
                    ? 'bg-primary text-on-primary font-semibold shadow-2xs'
                    : 'text-text-secondary hover:text-on-surface'
                }`}
              >
                {tf === '1d' ? '1D (Daily)' : tf}
              </button>
            ))}
          </div>

          {/* Load Data Button */}
          <button
            onClick={() => handleLoadData()}
            disabled={isLoadingData}
            className="h-8 px-3.5 bg-secondary text-white hover:bg-secondary/90 rounded-lg text-xs font-label-md flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60 shadow-xs"
          >
            {isLoadingData ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Activity className="w-3.5 h-3.5" />
            )}
            <span>{isLoadingData ? 'Pulling Bars...' : 'Fetch Yahoo 15m'}</span>
          </button>
        </div>

        {/* Right: Initial Balance & Reset */}
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

      {/* ── B. DRAWING & ANNOTATION TOOLBAR (Trendlines, Rectangles, Fibonacci, Auto Levels) ── */}
      <div className="w-full bg-surface-card/95 border-b border-border-subtle px-margin py-1.5 flex flex-wrap items-center justify-between gap-y-1 gap-x-4 select-none">
        {/* Drawing Tools Group */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-mono-sm text-text-muted uppercase font-semibold mr-1">
            DRAW:
          </span>

          {/* Cursor / Select */}
          <button
            onClick={() => {
              setActiveTool('cursor');
              setDrawingStartPoint(null);
            }}
            className={`h-7 px-2.5 rounded text-xs font-label-md flex items-center gap-1 transition-all cursor-pointer ${
              activeTool === 'cursor'
                ? 'bg-primary text-on-primary font-semibold'
                : 'bg-surface-container-low text-text-secondary hover:text-on-surface'
            }`}
            title="Normal Cursor"
          >
            <MousePointer className="w-3 h-3" />
            <span>Cursor</span>
          </button>

          {/* Trendline Tool */}
          <button
            onClick={() => {
              setActiveTool('trendline');
              setDrawingStartPoint(null);
            }}
            className={`h-7 px-2.5 rounded text-xs font-label-md flex items-center gap-1 transition-all cursor-pointer ${
              activeTool === 'trendline'
                ? 'bg-secondary text-white font-semibold shadow-xs'
                : 'bg-surface-container-low text-text-secondary hover:text-on-surface'
            }`}
            title="Trendline (Click 2 Points on Chart)"
          >
            <PenTool className="w-3 h-3" />
            <span>Trendline</span>
          </button>

          {/* Rectangle / Zone Tool */}
          <button
            onClick={() => {
              setActiveTool('rectangle');
              setDrawingStartPoint(null);
            }}
            className={`h-7 px-2.5 rounded text-xs font-label-md flex items-center gap-1 transition-all cursor-pointer ${
              activeTool === 'rectangle'
                ? 'bg-secondary text-white font-semibold shadow-xs'
                : 'bg-surface-container-low text-text-secondary hover:text-on-surface'
            }`}
            title="Rectangle (Box / Supply-Demand Zone / Order Block)"
          >
            <Square className="w-3 h-3" />
            <span>Rectangle</span>
          </button>

          {/* Horizontal Level / Ray */}
          <button
            onClick={() => {
              setActiveTool('ray');
              setDrawingStartPoint(null);
            }}
            className={`h-7 px-2.5 rounded text-xs font-label-md flex items-center gap-1 transition-all cursor-pointer ${
              activeTool === 'ray'
                ? 'bg-secondary text-white font-semibold shadow-xs'
                : 'bg-surface-container-low text-text-secondary hover:text-on-surface'
            }`}
            title="Horizontal Support / Resistance Ray"
          >
            <Minus className="w-3 h-3" />
            <span>Horizontal Ray</span>
          </button>

          {/* Fibonacci Retracement */}
          <button
            onClick={() => {
              setActiveTool('fibonacci');
              setDrawingStartPoint(null);
            }}
            className={`h-7 px-2.5 rounded text-xs font-label-md flex items-center gap-1 transition-all cursor-pointer ${
              activeTool === 'fibonacci'
                ? 'bg-secondary text-white font-semibold shadow-xs'
                : 'bg-surface-container-low text-text-secondary hover:text-on-surface'
            }`}
            title="Fibonacci Retracement (Swing High to Swing Low)"
          >
            <span className="font-mono text-xs font-bold">Fib</span>
            <span>Retrace</span>
          </button>

          {/* Color Palette Selector */}
          <div className="flex items-center gap-1 pl-2 border-l border-border-subtle">
            {DRAWING_COLOR_PALETTE.map((c) => (
              <button
                key={c.hex}
                onClick={() => setActiveColorHex(c.hex)}
                className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                  activeColorHex === c.hex ? 'scale-125 ring-2 ring-primary ring-offset-1' : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Automated Intelligence Overlays & Actions */}
        <div className="flex items-center gap-2">
          {/* Auto Trendlines Toggle */}
          <button
            onClick={() => setAutoTrendlinesEnabled((prev) => !prev)}
            className={`h-7 px-2 rounded text-xs font-mono-sm flex items-center gap-1 transition-all cursor-pointer ${
              autoTrendlinesEnabled
                ? 'bg-bullish-tint text-bullish border border-bullish font-semibold'
                : 'bg-surface-container-low text-text-muted hover:text-on-surface'
            }`}
            title="Toggle Automated Swing-High/Low Resistance & Support Trendlines"
          >
            <Sparkles className="w-3 h-3" />
            <span>Auto Trendlines</span>
          </button>

          {/* Auto Zones / FVG Toggle */}
          <button
            onClick={() => setAutoZonesEnabled((prev) => !prev)}
            className={`h-7 px-2 rounded text-xs font-mono-sm flex items-center gap-1 transition-all cursor-pointer ${
              autoZonesEnabled
                ? 'bg-secondary/10 text-secondary border border-secondary font-semibold'
                : 'bg-surface-container-low text-text-muted hover:text-on-surface'
            }`}
            title="Toggle Automated Fair Value Gaps & Order Blocks"
          >
            <Square className="w-3 h-3" />
            <span>Auto FVG / Zones</span>
          </button>

          {/* Undo Last Drawing */}
          {drawings.length > 0 && (
            <button
              onClick={() => setDrawings((prev) => prev.slice(0, -1))}
              className="h-7 px-2 rounded bg-surface-container-low text-text-secondary hover:text-on-surface text-xs font-mono-sm flex items-center gap-1 cursor-pointer"
              title="Undo Last Drawing"
            >
              <Undo2 className="w-3 h-3" />
              <span>Undo</span>
            </button>
          )}

          {/* Clear All Drawings */}
          {drawings.length > 0 && (
            <button
              onClick={() => setDrawings([])}
              className="h-7 px-2 rounded bg-bearish-tint text-bearish text-xs font-mono-sm flex items-center gap-1 cursor-pointer"
              title="Clear All Custom Drawings"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear ({drawings.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* ── C. TRANSPORT REPLAY CONTROL BAR ── */}
      <div className="w-full bg-surface-card border-b border-border-subtle px-margin py-1.5 flex flex-wrap items-center justify-between gap-2">
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
                  {currentPrice.toFixed(2)}
                </strong>
              </span>
            </>
          )}
        </div>

        {/* Transport Controls (Center) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleStepBackward}
            disabled={!replayState || replayState.currentIndex <= replayState.startIndex}
            className="w-8 h-8 rounded-lg bg-surface-container-low border border-border-subtle flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-40"
            title="Step Back 1 Candle (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

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

      {/* ── D. MAIN WORKSPACE (Lightweight Chart + Interactive Overlay + Order Panel) ── */}
      <div className="flex-1 flex flex-col lg:flex-row w-full min-h-[500px]">
        {/* D1. TradingView Lightweight Chart & HTML5 Canvas Overlay */}
        <div className="flex-1 relative bg-white border-b lg:border-b-0 lg:border-r border-border-subtle min-h-[460px] flex flex-col overflow-hidden">
          {dataError && (
            <div className="absolute top-4 left-4 z-20 p-3 rounded-lg bg-bearish-tint border border-bearish text-bearish text-xs max-w-md shadow-sm">
              {dataError}
            </div>
          )}

          {/* Lightweight Charts Engine Container */}
          <div ref={chartContainerRef} className="w-full flex-1" />

          {/* HTML5 Interactive Drawing Overlay Canvas */}
          <canvas
            ref={drawingCanvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            className={`absolute inset-0 z-10 ${
              activeTool !== 'cursor' ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
            }`}
          />

          {/* Drawing Tool Helper Banner (when tool is active) */}
          {activeTool !== 'cursor' && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full bg-primary/95 text-white text-xs font-mono shadow-md flex items-center gap-2 border border-secondary pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-bullish animate-pulse" />
              <span>
                {activeTool === 'trendline' && (drawingStartPoint ? 'Click Point 2 to complete Trendline' : 'Click Point 1 on Chart to start Trendline')}
                {activeTool === 'rectangle' && (drawingStartPoint ? 'Click Opposite Corner to complete Rectangle' : 'Click Corner 1 to start Rectangle')}
                {activeTool === 'ray' && 'Click anywhere on chart to drop Horizontal Price Ray'}
                {activeTool === 'fibonacci' && (drawingStartPoint ? 'Click Swing Low to complete Fibonacci' : 'Click Swing High to start Fibonacci')}
              </span>
              <span className="text-[10px] text-text-muted">(ESC to cancel)</span>
            </div>
          )}

          {/* Bottom Telemetry Legend */}
          <div className="absolute bottom-2 left-3 pointer-events-none z-10 flex items-center gap-2 text-[10px] font-mono text-text-muted bg-white/85 backdrop-blur-xs px-2 py-1 rounded border border-border-subtle">
            <span className="w-2 h-2 rounded-full bg-bullish animate-pulse" />
            <span>NIFTY 50 Intraday 15m · Trendlines &amp; Rectangles Active · Zero Lookahead</span>
          </div>
        </div>

        {/* D2. Simulated Order Execution & Risk Engine Panel */}
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
                Close Position @ Bar Close
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
            fall inside the same candle's range, SL is assumed hit first to prevent inflated performance.
          </div>
        </div>
      </div>

      {/* ── E. LIVE STATS METRICS BAR ── */}
      {metrics && (
        <div className="w-full bg-surface-card border-t border-border-subtle px-margin py-2.5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-space-sm">
          <div className="flex flex-col">
            <span className="font-label-sm text-[10px] text-text-muted uppercase">Account Balance</span>
            <span className="font-mono-md text-sm font-bold text-on-surface tabular-nums">
              ₹{metrics.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

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

          <div className="flex flex-col">
            <span className="font-label-sm text-[10px] text-text-muted uppercase">Win Rate</span>
            <span className="font-mono-md text-sm font-bold text-on-surface tabular-nums">
              {metrics.winRate.toFixed(1)}%
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-label-sm text-[10px] text-text-muted uppercase">Profit Factor</span>
            <span className="font-mono-md text-sm font-bold text-on-surface tabular-nums">
              {metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2)}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-label-sm text-[10px] text-text-muted uppercase">Total Trades</span>
            <span className="font-mono-md text-sm font-bold text-on-surface tabular-nums">
              {metrics.totalTrades}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-label-sm text-[10px] text-text-muted uppercase">Max Drawdown</span>
            <span className="font-mono-md text-sm font-bold text-bearish tabular-nums">
              -{metrics.maxDrawdownPct.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {/* ── F. COLLAPSIBLE TRADE JOURNAL TABLE & CSV EXPORT ── */}
      <div className="w-full bg-surface-card border-t border-border-subtle">
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

        {isTradeLogOpen && (
          <div className="w-full max-h-52 overflow-y-auto no-scrollbar border-t border-border-subtle">
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

      {/* ── G. NIFTY 50 ALL STOCKS MODAL / HUB ── */}
      {isNifty50ModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">
                  N50
                </div>
                <div>
                  <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                    NIFTY 50 Benchmark Constituents
                  </h3>
                  <p className="text-xs text-text-muted font-mono">
                    Official 50 NSE Index Equities · Live Yahoo Finance Feed
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsNifty50ModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center text-on-surface cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 bg-surface-container-low border-b border-border-subtle flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search NIFTY 50 by symbol or company name (e.g. Reliance, HDFC)..."
                  value={nifty50Search}
                  onChange={(e) => setNifty50Search(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 bg-white border border-border-subtle rounded-lg text-xs font-mono-sm text-on-surface focus:outline-none focus:border-secondary"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full">
                {NIFTY_50_SECTORS.slice(0, 7).map((sector) => (
                  <button
                    key={sector}
                    onClick={() => setSelectedSector(sector)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono-sm transition-colors whitespace-nowrap cursor-pointer ${
                      selectedSector === sector
                        ? 'bg-primary text-white font-semibold'
                        : 'bg-white text-text-secondary hover:text-on-surface border border-border-subtle'
                    }`}
                  >
                    {sector}
                  </button>
                ))}
              </div>
            </div>

            {/* 50 Stocks Grid */}
            <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredNifty50.map((stock) => (
                <div
                  key={stock.symbol}
                  onClick={() => {
                    handleLoadData(stock.yahoo_symbol);
                    setIsNifty50ModalOpen(false);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer hover:shadow-md flex flex-col justify-between gap-2 ${
                    symbol === stock.yahoo_symbol
                      ? 'bg-secondary/10 border-secondary'
                      : 'bg-white border-border-subtle hover:border-secondary/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-mono-md text-xs font-bold text-on-surface">
                        {stock.symbol}
                      </div>
                      <div className="text-[11px] text-text-muted truncate max-w-[170px]">
                        {stock.name}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-container-low text-text-secondary">
                      {stock.weight}% Wt
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-border-subtle">
                    <span className="text-[10px] text-text-muted truncate max-w-[120px]">
                      {stock.sector}
                    </span>
                    <span className="font-bold text-on-surface tabular-nums">
                      {stock.lastPrice ? `₹${stock.lastPrice.toFixed(2)}` : 'Select Bar Replay'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
