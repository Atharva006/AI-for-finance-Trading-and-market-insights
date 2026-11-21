import React, { useState } from 'react';
import { EquityPoint } from '../types/backtest';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface EquityLineChartProps {
  equityCurve: EquityPoint[];
  initialCapital: number;
  title?: string;
  subtitle?: string;
  strokeColor?: string;
  fillGradStart?: string;
}

export const EquityLineChart: React.FC<EquityLineChartProps> = ({
  equityCurve,
  initialCapital,
  title = 'Portfolio Equity Curve Line Chart',
  subtitle,
  strokeColor = '#16A34A',
  fillGradStart = '#16A34A',
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!equityCurve || equityCurve.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-200 text-gray-400 text-xs font-mono">
        No equity data available to plot
      </div>
    );
  }

  const values = equityCurve.map((e) => e.equity);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const valRange = maxVal - minVal || 1;
  const lastVal = values[values.length - 1];
  const netDiff = lastVal - initialCapital;
  const netPct = ((netDiff / initialCapital) * 100).toFixed(2);
  const isPositive = netDiff >= 0;

  const width = 800;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const points = equityCurve.map((pt, idx) => {
    const x = paddingX + (idx / Math.max(1, equityCurve.length - 1)) * chartW;
    const y = paddingY + chartH - ((pt.equity - minVal) / valRange) * chartH;
    return { x, y, pt, idx };
  });

  const linePathD = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPathD = `${linePathD} L ${points[points.length - 1].x.toFixed(1)} ${height - paddingY} L ${points[0].x.toFixed(1)} ${height - paddingY} Z`;

  const hoveredPoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-[#0A0A0D] tracking-tight">{title}</h3>
          </div>
          {subtitle && <p className="text-xs text-gray-500 font-mono mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-[10px] text-gray-400 block font-semibold uppercase">Initial Margin</span>
            <span className="font-bold text-gray-700">₹{initialCapital.toLocaleString('en-IN')}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 block font-semibold uppercase">Final Equity</span>
            <span className={`font-bold flex items-center justify-end gap-1 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              ₹{lastVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({isPositive ? '+' : ''}{netPct}%)
            </span>
          </div>
        </div>
      </div>

      {/* SVG Canvas with Interactive Hover */}
      <div className="relative bg-[#FAFAFC] rounded-xl border border-gray-100 p-2 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none overflow-visible cursor-crosshair"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * width;
            const clampedX = Math.max(paddingX, Math.min(width - paddingX, mouseX));
            const ratio = (clampedX - paddingX) / chartW;
            const targetIdx = Math.round(ratio * (equityCurve.length - 1));
            setHoverIndex(Math.max(0, Math.min(equityCurve.length - 1, targetIdx)));
          }}
        >
          <defs>
            <linearGradient id="equityLineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fillGradStart} stopOpacity="0.28" />
              <stop offset="100%" stopColor={fillGradStart} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Price Scale */}
          {[0, 0.25, 0.5, 0.75, 1].map((r) => {
            const y = paddingY + chartH * (1 - r);
            const val = minVal + valRange * r;
            return (
              <g key={r}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="3 3"
                />
                <text
                  x={width - paddingX + 6}
                  y={y + 3}
                  fontSize="9"
                  fill="#94A3B8"
                  fontFamily="monospace"
                  textAnchor="start"
                >
                  ₹{Math.round(val).toLocaleString('en-IN')}
                </text>
              </g>
            );
          })}

          {/* Area & Stroke Path */}
          <path d={areaPathD} fill="url(#equityLineGrad)" />
          <path
            d={linePathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Initial Capital Reference Line */}
          {initialCapital >= minVal && initialCapital <= maxVal && (
            <line
              x1={paddingX}
              y1={paddingY + chartH - ((initialCapital - minVal) / valRange) * chartH}
              x2={width - paddingX}
              y2={paddingY + chartH - ((initialCapital - minVal) / valRange) * chartH}
              stroke="#64748B"
              strokeDasharray="4 4"
              strokeWidth="1"
              opacity="0.6"
            />
          )}

          {/* Active Hover Marker & Guide */}
          {hoveredPoint && (
            <g>
              <line
                x1={hoveredPoint.x}
                y1={paddingY}
                x2={hoveredPoint.x}
                y2={height - paddingY}
                stroke="#0A0A0D"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="5"
                fill={strokeColor}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Dynamic HTML Tooltip on Hover (Stitch 100% Light Theme) */}
        {hoveredPoint && (
          <div
            className="absolute pointer-events-none bg-surface-card text-on-surface p-2.5 rounded-xl shadow-xl text-xs font-mono space-y-0.5 z-20 border border-border-subtle"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${Math.max(10, (hoveredPoint.y / height) * 100 - 35)}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="text-[10px] text-text-muted font-semibold">{hoveredPoint.pt.time}</div>
            <div className="font-bold text-sm text-on-surface">
              ₹{hoveredPoint.pt.equity.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] flex items-center justify-between gap-3 pt-0.5">
              <span className="text-text-muted">Return:</span>
              <span className={hoveredPoint.pt.equity >= initialCapital ? 'text-bullish font-bold' : 'text-bearish font-bold'}>
                {hoveredPoint.pt.equity >= initialCapital ? '+' : ''}
                {(((hoveredPoint.pt.equity - initialCapital) / initialCapital) * 100).toFixed(2)}%
              </span>
            </div>
            {hoveredPoint.pt.drawdownPct > 0 && (
              <div className="text-[10px] text-rose-300">
                Drawdown: -{hoveredPoint.pt.drawdownPct}%
              </div>
            )}
          </div>
        )}
      </div>

      {/* Axis Footer */}
      <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono px-2">
        <span>Start: {equityCurve[0]?.time || '0'}</span>
        <span>Trades Executed: {equityCurve.length - 1}</span>
        <span>Latest: {equityCurve[equityCurve.length - 1]?.time || 'Latest'}</span>
      </div>
    </div>
  );
};
