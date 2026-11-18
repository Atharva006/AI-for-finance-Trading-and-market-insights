import React, { useMemo } from 'react';
import { TrendingDown, ShieldAlert, Activity, ArrowDown } from 'lucide-react';
import { Trade } from '../types/backtest';

interface QuantUnderwaterChartProps {
  trades: Trade[];
  initialCapital?: number;
}

export const QuantUnderwaterChart: React.FC<QuantUnderwaterChartProps> = ({
  trades,
  initialCapital = 100000,
}) => {
  const underwaterData = useMemo(() => {
    let peak = initialCapital;
    let equity = initialCapital;
    const points: { index: number; ddPct: number; equity: number; isAth: boolean }[] = [
      { index: 0, ddPct: 0, equity: initialCapital, isAth: true },
    ];

    trades.forEach((t, idx) => {
      equity += t.pnl;
      if (equity > peak) {
        peak = equity;
        points.push({ index: idx + 1, ddPct: 0, equity, isAth: true });
      } else {
        const ddPct = ((equity - peak) / peak) * 100;
        points.push({ index: idx + 1, ddPct, equity, isAth: false });
      }
    });

    const maxDD = Math.min(...points.map((p) => p.ddPct));
    return { points, maxDD };
  }, [trades, initialCapital]);

  if (trades.length === 0) return null;

  const width = 800;
  const height = 180;
  const padding = { top: 20, right: 30, bottom: 30, left: 55 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const minDD = Math.min(-5, underwaterData.maxDD * 1.15); // e.g. -15%
  const maxDDAxis = 0; // Underwater chart is bounded at 0%

  const pointsCount = underwaterData.points.length;
  const getX = (idx: number) => padding.left + (idx / Math.max(1, pointsCount - 1)) * chartW;
  const getY = (dd: number) =>
    padding.top + ((0 - dd) / (0 - minDD)) * chartH;

  // Build SVG path
  const pathD = underwaterData.points.reduce((acc, pt, idx) => {
    const x = getX(idx);
    const y = getY(pt.ddPct);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Fill area path (down from 0% baseline)
  const firstX = getX(0);
  const lastX = getX(pointsCount - 1);
  const baselineY = getY(0);
  const fillD = `${pathD} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4 select-none font-mono">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0A0A0D] flex items-center justify-center text-rose-400">
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
              Quant Excursion Telemetry
            </span>
            <h4 className="text-sm font-extrabold text-[#0A0A0D] font-sans">
              Underwater Drawdown Profile (High-Water Mark Excursions)
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1 bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
            <span className="text-[9px] uppercase font-bold block text-rose-500">Max Excursion</span>
            <span className="text-sm font-bold">{underwaterData.maxDD.toFixed(2)}%</span>
          </div>

          <div className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
            <span className="text-[9px] uppercase font-bold block text-gray-400">Peak Re-entries</span>
            <span className="text-sm font-bold">
              {underwaterData.points.filter((p) => p.isAth).length} ATHs
            </span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[600px] text-xs">
          <defs>
            <linearGradient id="underwaterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          <line
            x1={padding.left}
            y1={getY(0)}
            x2={width - padding.right}
            y2={getY(0)}
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text x={padding.left - 8} y={getY(0) + 4} textAnchor="end" fill="#64748B" fontSize="10">
            0% (ATH)
          </text>

          <line
            x1={padding.left}
            y1={getY(minDD * 0.5)}
            x2={width - padding.right}
            y2={getY(minDD * 0.5)}
            stroke="#E2E8F0"
            strokeWidth="1"
          />
          <text
            x={padding.left - 8}
            y={getY(minDD * 0.5) + 4}
            textAnchor="end"
            fill="#94A3B8"
            fontSize="10"
          >
            {(minDD * 0.5).toFixed(1)}%
          </text>

          <line
            x1={padding.left}
            y1={getY(minDD)}
            x2={width - padding.right}
            y2={getY(minDD)}
            stroke="#FCA5A5"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <text
            x={padding.left - 8}
            y={getY(minDD) + 4}
            textAnchor="end"
            fill="#EF4444"
            fontSize="10"
            fontWeight="bold"
          >
            {minDD.toFixed(1)}%
          </text>

          {/* Shaded Underwater Area */}
          <path d={fillD} fill="url(#underwaterGrad)" />

          {/* Underwater Line */}
          <path d={pathD} fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />

          {/* ATH Dots on 0% line */}
          {underwaterData.points.map((pt, idx) => {
            if (!pt.isAth || idx === 0) return null;
            return (
              <circle
                key={idx}
                cx={getX(idx)}
                cy={getY(0)}
                r="3"
                fill="#10B981"
                stroke="#FFFFFF"
                strokeWidth="1"
              />
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
        <span>Execution Inception (Trade #1)</span>
        <span className="flex items-center gap-1 text-emerald-600 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Green dots mark new All-Time Highs (ATH) where drawdown resets to 0.0%
        </span>
        <span>Latest Execution (Trade #{trades.length})</span>
      </div>
    </div>
  );
};
