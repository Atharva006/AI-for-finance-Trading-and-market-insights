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
  const [hoverBarIndex, setHoverBarIndex] = useState<number | null>(null);

  // Take the last 60 visible bars for clear visual inspection
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
  const width = 860;
  const height = 300;
  const padding = { top: 25, right: 65, bottom: 40, left: 20 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const getX = (idx: number) =>
    padding.left + (idx / Math.max(1, visibleCandles.length - 1)) * chartW;

  const getY = (price: number) =>
    padding.top + chartH - ((price - minPrice) / priceRange) * chartH;

  const candleW = Math.max(3, Math.min(10, chartW / visibleCandles.length - 3));

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
      {/* 1. Header with Info Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0A0A0D] flex items-center justify-center text-white font-bold text-xs">
            <Crosshair className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#0A0A0D] tracking-tight">
                Live {pairName} Intraday Session Sweep Visualizer
              </span>
              <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold">
                {interval} Bar Stream
              </span>
            </div>
            <span className="text-[11px] text-gray-400 block font-sans">
              Displaying real candles & session sweep FVG inversion order executions
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Info Modal / Drawer Toggle Button */}
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              showExplanation
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-xs'
                : 'bg-white border-gray-200 text-gray-600 hover:border-black'
            }`}
            title="Toggle Live Strategy Explanation Guide"
          >
            <Info className="w-3.5 h-3.5 text-emerald-700" />
            <span>{showExplanation ? 'Hide Strategy Guide' : 'Explain Strategy On Chart'}</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Strategy Explanation Banner */}
      {showExplanation && (
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs font-sans space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="font-bold text-black text-xs uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>How This Strategy Operates on Live Candles (Step-by-Step)</span>
            </span>
            <span className="text-[10px] font-mono text-gray-400">PINE SCRIPT v5 ENGINE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-white rounded-lg border border-gray-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-black text-[11px]">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                <span>Step 1: Asia Liquidity Range</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed font-mono">
                Between <strong>18:00 - 00:00 UTC</strong>, the engine identifies the absolute Asian High & Low. These form the institutional liquidity boundaries to be swept.
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-gray-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-black text-[11px]">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Step 2: London / NY Sweep & FVG</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed font-mono">
                Price breaks above the Asian high (liquidity grab). The engine finds the 3-candle Fair Value Gap (FVG: <code className="bg-gray-100 px-1 py-0.5 rounded">low &gt; high[2]</code>) created during the expansion.
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-gray-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-black text-[11px]">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Step 3: FVG Inversion & Limit Fill</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed font-mono">
                When a candle closes back below the FVG bottom (<code className="bg-gray-100 px-1 py-0.5 rounded">close &lt; fvgBot</code>), a Limit Order is placed directly on the FVG edge with 1:2 R:R.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. The Live Candlestick & Trade Overlay SVG */}
      <div className="relative w-full overflow-x-auto bg-[#FAFAFA] rounded-xl border border-gray-200 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto block select-none"
        >
          {/* Horizontal Grid lines */}
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

          {/* Render Candlesticks */}
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

          {/* Render Trade Execution Markers */}
          {visibleTrades.map((t) => {
            const candleIdx = visibleCandles.findIndex((c) => c.time === t.entryTime);
            if (candleIdx === -1) return null;
            const x = getX(candleIdx);
            const y = getY(t.entryPrice);
            const isBuy = t.type === 'BUY';

            return (
              <g key={t.id}>
                {/* Entry marker */}
                <circle
                  cx={x}
                  cy={y}
                  r="5.5"
                  fill={isBuy ? '#16A34A' : '#DC2626'}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={isBuy ? y + 16 : y - 10}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="bold"
                  fill={isBuy ? '#16A34A' : '#DC2626'}
                >
                  {isBuy ? '▲ BUY' : '▼ SELL'}
                </text>
              </g>
            );
          })}

          {/* Time Labels on X axis */}
          {visibleCandles.map((c, idx) => {
            if (idx % 12 !== 0 && idx !== visibleCandles.length - 1) return null;
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
                y={height - 12}
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

        {/* Hover inspector tooltip */}
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
