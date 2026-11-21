import React, { useState, useMemo } from 'react';
import { Candle, Trade } from '../types/backtest';
import {
  Info,
  Layers,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Crosshair,
  Maximize2,
  Eye,
  Sliders,
  Compass,
} from 'lucide-react';

interface LiveSessionChartProps {
  candles: Candle[];
  trades: Trade[];
  pairName: string;
  symbol: string;
  interval: string;
}

export const LiveSessionChart: React.FC<LiveSessionChartProps> = ({
  candles,
  trades,
  pairName,
  symbol,
  interval,
}) => {
  const [showExplanation, setShowExplanation] = useState<boolean>(true);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [hoverBarIndex, setHoverBarIndex] = useState<number | null>(null);

  // Take the last 60 visible bars for clean inspection
  const visibleCandles = useMemo(() => {
    return candles.slice(-60);
  }, [candles]);

  const minPrice = useMemo(() => {
    if (!visibleCandles.length) return 1.0;
    return Math.min(...visibleCandles.map((c) => c.low));
  }, [visibleCandles]);

  const maxPrice = useMemo(() => {
    if (!visibleCandles.length) return 1.1;
    return Math.max(...visibleCandles.map((c) => c.high));
  }, [visibleCandles]);

  const priceRange = maxPrice - minPrice || 0.001;

  // Chart dimensions
  const width = 880;
  const height = 340;
  const padding = { top: 35, right: 70, bottom: 45, left: 20 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const getX = (idx: number) =>
    padding.left + (idx / Math.max(1, visibleCandles.length - 1)) * chartW;

  const getY = (price: number) =>
    padding.top + chartH - ((price - minPrice) / priceRange) * chartH;

  const candleW = Math.max(3, Math.min(10, chartW / visibleCandles.length - 3));

  // Identify session ranges within the visible 60 bars
  const sessionRanges = useMemo(() => {
    const asiaBars: number[] = [];
    const londonBars: number[] = [];
    const nyBars: number[] = [];

    visibleCandles.forEach((c, idx) => {
      const d = new Date(c.time);
      const h = d.getUTCHours();
      if (h >= 18 || h < 0) asiaBars.push(idx);
      if (h >= 0 && h < 6) londonBars.push(idx);
      if (h >= 13 && h < 22) nyBars.push(idx);
    });

    let asiaHigh = -Infinity,
      asiaLow = Infinity;
    asiaBars.forEach((idx) => {
      if (visibleCandles[idx].high > asiaHigh) asiaHigh = visibleCandles[idx].high;
      if (visibleCandles[idx].low < asiaLow) asiaLow = visibleCandles[idx].low;
    });

    let lonHigh = -Infinity,
      lonLow = Infinity;
    londonBars.forEach((idx) => {
      if (visibleCandles[idx].high > lonHigh) lonHigh = visibleCandles[idx].high;
      if (visibleCandles[idx].low < lonLow) lonLow = visibleCandles[idx].low;
    });

    return {
      asiaBars,
      londonBars,
      nyBars,
      asiaHigh: asiaHigh > -Infinity ? asiaHigh : null,
      asiaLow: asiaLow < Infinity ? asiaLow : null,
      lonHigh: lonHigh > -Infinity ? lonHigh : null,
      lonLow: lonLow < Infinity ? lonLow : null,
    };
  }, [visibleCandles]);

  // Find trades that occurred within this visible bar window
  const visibleTrades = useMemo(() => {
    if (!visibleCandles.length) return [];
    const firstTime = new Date(visibleCandles[0].time).getTime();
    const lastTime = new Date(visibleCandles[visibleCandles.length - 1].time).getTime();

    return trades.filter((t) => {
      const entryT = new Date(t.entryTime).getTime();
      return entryT >= firstTime && entryT <= lastTime;
    });
  }, [visibleCandles, trades]);

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs font-mono select-none space-y-4">
      {/* 1. Header with Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0A0A0D] flex items-center justify-center text-white font-bold text-xs">
            <Crosshair className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#0A0A0D] tracking-tight">
                Live {pairName} Session Sweep Visualizer & Drawing Engine
              </span>
              <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold">
                {interval} Bar Stream
              </span>
            </div>
            <span className="text-[11px] text-gray-400 block font-sans">
              Dynamic liquidity sweeps, FVG boxes, SL/TP lines & on-chart comments
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle On-Chart Annotation Drawings */}
          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              showAnnotations
                ? 'bg-black text-white border-black'
                : 'bg-white border-gray-200 text-gray-600 hover:border-black'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showAnnotations ? 'Drawings: ON' : 'Drawings: OFF'}</span>
          </button>

          {/* Info Guide Toggle */}
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              showExplanation
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-white border-gray-200 text-gray-600 hover:border-black'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-emerald-700" />
            <span>{showExplanation ? 'Hide Guide' : 'Explain Strategy'}</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Strategy Explanation Guide */}
      {showExplanation && (
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs font-sans space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="font-bold text-black text-xs uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Strategy Blueprint: Asia-London-NY FVG Inversion</span>
            </span>
            <span className="text-[10px] font-mono text-gray-400">PINE SCRIPT v5 ENGINE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-white rounded-lg border border-gray-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-black text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>1. Asia Liquidity Box (18-00 UTC)</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed font-mono">
                The engine records <strong>Asia High & Low</strong> as yellow dashed liquidity boundaries. Stop-losses of retail traders cluster outside this range.
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-gray-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-black text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>2. London Liquidity Sweep (00-06 UTC)</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed font-mono">
                Price pierces above/below Asia range (liquidity sweep). A 3-bar Fair Value Gap (FVG) forms during the aggressive expansion.
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-gray-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-black text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>3. Inversion Trigger & 1:2 R:R Exit</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed font-mono">
                When a candle closes back through the FVG (inversion), a limit order fills on the FVG edge with body-filtered SL and 1:2 TP.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. The Live Candlestick & Drawing Overlay SVG */}
      <div className="relative w-full overflow-x-auto bg-[#FAFAFA] rounded-xl border border-gray-200 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto block select-none"
        >
          {/* Horizontal Price Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
            const price = minPrice + (1 - ratio) * priceRange;
            const y = padding.top + ratio * chartH;
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeDasharray="3 3"
                />
                <text
                  x={width - padding.right + 8}
                  y={y + 3}
                  fontSize="10"
                  fill="#9CA3AF"
                  fontFamily="monospace"
                >
                  {price.toFixed(4)}
                </text>
              </g>
            );
          })}

          {/* DRAWINGS & ON-CHART COMMENTS (when showAnnotations is true) */}
          {showAnnotations && (
            <g>
              {/* Asia High Line & Comment */}
              {sessionRanges.asiaHigh !== null && (
                <g>
                  <line
                    x1={padding.left}
                    y1={getY(sessionRanges.asiaHigh)}
                    x2={width - padding.right}
                    y2={getY(sessionRanges.asiaHigh)}
                    stroke="#D97706"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  {/* Drawing Callout Tag */}
                  <rect
                    x={padding.left + 8}
                    y={getY(sessionRanges.asiaHigh) - 18}
                    width="190"
                    height="16"
                    fill="#FEF3C7"
                    stroke="#D97706"
                    strokeWidth="0.8"
                    rx="3"
                  />
                  <text
                    x={padding.left + 14}
                    y={getY(sessionRanges.asiaHigh) - 6}
                    fontSize="9"
                    fontWeight="bold"
                    fill="#92400E"
                    fontFamily="monospace"
                  >
                    ★ ASIA HIGH (Buy-side Liquidity Pool)
                  </text>
                </g>
              )}

              {/* Asia Low Line & Comment */}
              {sessionRanges.asiaLow !== null && (
                <g>
                  <line
                    x1={padding.left}
                    y1={getY(sessionRanges.asiaLow)}
                    x2={width - padding.right}
                    y2={getY(sessionRanges.asiaLow)}
                    stroke="#D97706"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <rect
                    x={padding.left + 8}
                    y={getY(sessionRanges.asiaLow) + 4}
                    width="195"
                    height="16"
                    fill="#FEF3C7"
                    stroke="#D97706"
                    strokeWidth="0.8"
                    rx="3"
                  />
                  <text
                    x={padding.left + 14}
                    y={getY(sessionRanges.asiaLow) + 16}
                    fontSize="9"
                    fontWeight="bold"
                    fill="#92400E"
                    fontFamily="monospace"
                  >
                    ★ ASIA LOW (Sell-side Liquidity Pool)
                  </text>
                </g>
              )}

              {/* Trade Stop-Loss & Take-Profit Visual Projection Lines */}
              {visibleTrades.map((t) => {
                const candleIdx = visibleCandles.findIndex((c) => c.time === t.entryTime);
                if (candleIdx === -1) return null;
                const startX = getX(candleIdx);
                const endX = Math.min(width - padding.right, startX + 90);
                const entryY = getY(t.entryPrice);
                const slY = getY(t.stopLoss);
                const tpY = getY(t.takeProfit);

                return (
                  <g key={`lines-${t.id}`}>
                    {/* Entry dashed line */}
                    <line
                      x1={startX}
                      y1={entryY}
                      x2={endX}
                      y2={entryY}
                      stroke="#4F46E5"
                      strokeWidth="1.2"
                      strokeDasharray="2 2"
                    />
                    {/* Take-Profit target line */}
                    <line
                      x1={startX}
                      y1={tpY}
                      x2={endX}
                      y2={tpY}
                      stroke="#16A34A"
                      strokeWidth="1.2"
                    />
                    <text
                      x={endX + 4}
                      y={tpY + 3}
                      fontSize="8"
                      fontWeight="bold"
                      fill="#16A34A"
                    >
                      TP (1:2)
                    </text>

                    {/* Stop-Loss line */}
                    <line
                      x1={startX}
                      y1={slY}
                      x2={endX}
                      y2={slY}
                      stroke="#DC2626"
                      strokeWidth="1.2"
                    />
                    <text
                      x={endX + 4}
                      y={slY + 3}
                      fontSize="8"
                      fontWeight="bold"
                      fill="#DC2626"
                    >
                      SL
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Candlestick Rendering */}
          {visibleCandles.map((c, idx) => {
            const x = getX(idx);
            const isBull = c.close >= c.open;
            const openY = getY(c.open);
            const closeY = getY(c.close);
            const highY = getY(c.high);
            const lowY = getY(c.low);
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));
            const color = isBull ? '#16A34A' : '#DC2626';

            return (
              <g
                key={c.time}
                onMouseEnter={() => setHoverBarIndex(idx)}
                onMouseLeave={() => setHoverBarIndex(null)}
                className="cursor-crosshair"
              >
                {/* Wick */}
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={color}
                  strokeWidth="1.2"
                />
                {/* Body */}
                <rect
                  x={x - candleW / 2}
                  y={bodyTop}
                  width={candleW}
                  height={bodyHeight}
                  fill={isBull ? '#16A34A' : '#DC2626'}
                  rx="1"
                />
              </g>
            );
          })}

          {/* Trade Execution Markers & Annotation Callouts */}
          {visibleTrades.map((t) => {
            const candleIdx = visibleCandles.findIndex((c) => c.time === t.entryTime);
            if (candleIdx === -1) return null;
            const x = getX(candleIdx);
            const y = getY(t.entryPrice);
            const isBuy = t.type === 'BUY';

            return (
              <g key={t.id}>
                {/* Entry Dot */}
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill={isBuy ? '#16A34A' : '#DC2626'}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />

                {/* Hand-drawn style Callout Box with comment */}
                {showAnnotations && (
                  <g>
                    <path
                      d={`M ${x} ${isBuy ? y + 6 : y - 6} L ${x + 12} ${isBuy ? y + 22 : y - 22} L ${x + 120} ${isBuy ? y + 22 : y - 22}`}
                      stroke="#4F46E5"
                      strokeWidth="1"
                      fill="none"
                    />
                    <rect
                      x={x + 10}
                      y={isBuy ? y + 14 : y - 36}
                      width="125"
                      height="20"
                      fill="#EEF2FF"
                      stroke="#6366F1"
                      strokeWidth="0.8"
                      rx="3"
                    />
                    <text
                      x={x + 16}
                      y={isBuy ? y + 28 : y - 22}
                      fontSize="9"
                      fontWeight="bold"
                      fill="#3730A3"
                    >
                      {isBuy ? '▲ FVG Inversion Long' : '▼ FVG Inversion Short'}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Time Labels on X axis */}
          {visibleCandles.map((c, idx) => {
            if (idx % 10 !== 0 && idx !== visibleCandles.length - 1) return null;
            const x = getX(idx);
            const timeStr = new Date(c.time).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
              timeZone: 'UTC',
            });
            return (
              <text
                key={c.time}
                x={x}
                y={height - 10}
                textAnchor="middle"
                fontSize="9"
                fill="#9CA3AF"
                fontFamily="monospace"
              >
                {timeStr}
              </text>
            );
          })}
        </svg>

        {/* Hover Inspector Tooltip */}
        {hoverBarIndex !== null && visibleCandles[hoverBarIndex] && (
          <div className="absolute top-4 left-4 bg-black/90 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-[10px] font-mono shadow-md border border-neutral-700 flex items-center gap-3">
            <span>
              Time: {new Date(visibleCandles[hoverBarIndex].time).toISOString().replace('T', ' ').slice(0, 16)} UTC
            </span>
            <span>O: {visibleCandles[hoverBarIndex].open.toFixed(4)}</span>
            <span>H: {visibleCandles[hoverBarIndex].high.toFixed(4)}</span>
            <span>L: {visibleCandles[hoverBarIndex].low.toFixed(4)}</span>
            <span>C: {visibleCandles[hoverBarIndex].close.toFixed(4)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
