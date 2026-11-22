import { Candle } from '../types/backtest';

export type DrawingToolType = 'cursor' | 'trendline' | 'rectangle' | 'ray' | 'fibonacci';

export interface BaseDrawing {
  id: string;
  type: DrawingToolType;
  color: string;
  lineWidth?: number;
}

export interface TrendlineDrawing extends BaseDrawing {
  type: 'trendline';
  time1: number; // Unix seconds
  price1: number;
  time2: number; // Unix seconds
  price2: number;
  extendRight?: boolean;
}

export interface RectangleDrawing extends BaseDrawing {
  type: 'rectangle';
  time1: number;
  price1: number;
  time2: number;
  price2: number;
  fillColor?: string;
  label?: string;
}

export interface HorizontalRayDrawing extends BaseDrawing {
  type: 'ray';
  price: number;
  time: number;
  title?: string;
}

export interface FibonacciDrawing extends BaseDrawing {
  type: 'fibonacci';
  time1: number;
  price1: number;
  time2: number;
  price2: number;
}

export type ChartDrawing =
  | TrendlineDrawing
  | RectangleDrawing
  | HorizontalRayDrawing
  | FibonacciDrawing;

export const DRAWING_COLOR_PALETTE = [
  { name: 'Electric Blue', hex: '#536CF0', fill: 'rgba(83, 108, 240, 0.15)' },
  { name: 'Bullish Emerald', hex: '#059669', fill: 'rgba(5, 150, 105, 0.15)' },
  { name: 'Bearish Crimson', hex: '#E11D48', fill: 'rgba(225, 29, 72, 0.15)' },
  { name: 'Institutional Gold', hex: '#D97706', fill: 'rgba(217, 119, 6, 0.15)' },
  { name: 'Deep Purple', hex: '#8B5CF6', fill: 'rgba(139, 92, 246, 0.15)' },
  { name: 'Slate Gray', hex: '#4B5563', fill: 'rgba(75, 85, 99, 0.15)' },
];

/**
 * Automatically calculates dynamic resistance & support trendlines from swing pivot highs and lows
 */
export function autoDetectTrendlines(candles: Candle[], lookback = 30): TrendlineDrawing[] {
  if (candles.length < 15) return [];

  const slice = candles.slice(-lookback);
  const pivotHighs: { index: number; time: number; price: number }[] = [];
  const pivotLows: { index: number; time: number; price: number }[] = [];

  // 3-bar swing pivot detector
  for (let i = 2; i < slice.length - 2; i++) {
    const c = slice[i];
    const prev1 = slice[i - 1];
    const prev2 = slice[i - 2];
    const next1 = slice[i + 1];
    const next2 = slice[i + 2];

    if (
      c.high >= prev1.high &&
      c.high >= prev2.high &&
      c.high >= next1.high &&
      c.high >= next2.high
    ) {
      pivotHighs.push({
        index: i,
        time: Math.floor(c.timestamp / 1000),
        price: c.high,
      });
    }

    if (
      c.low <= prev1.low &&
      c.low <= prev2.low &&
      c.low <= next1.low &&
      c.low <= next2.low
    ) {
      pivotLows.push({
        index: i,
        time: Math.floor(c.timestamp / 1000),
        price: c.low,
      });
    }
  }

  const results: TrendlineDrawing[] = [];

  // Resistance trendline (connect top 2 swing highs)
  if (pivotHighs.length >= 2) {
    const p1 = pivotHighs[pivotHighs.length - 2];
    const p2 = pivotHighs[pivotHighs.length - 1];
    results.push({
      id: 'auto-resistance-line',
      type: 'trendline',
      time1: p1.time,
      price1: p1.price,
      time2: p2.time,
      price2: p2.price,
      color: '#E11D48',
      lineWidth: 2,
      extendRight: true,
    });
  }

  // Support trendline (connect bottom 2 swing lows)
  if (pivotLows.length >= 2) {
    const p1 = pivotLows[pivotLows.length - 2];
    const p2 = pivotLows[pivotLows.length - 1];
    results.push({
      id: 'auto-support-line',
      type: 'trendline',
      time1: p1.time,
      price1: p1.price,
      time2: p2.time,
      price2: p2.price,
      color: '#059669',
      lineWidth: 2,
      extendRight: true,
    });
  }

  return results;
}

/**
 * Automatically detects Fair Value Gaps (FVG) and consolidation zones as rectangles
 */
export function autoDetectZonesAndRectangles(candles: Candle[], lookback = 45): RectangleDrawing[] {
  if (candles.length < 5) return [];

  const slice = candles.slice(-lookback);
  const boxes: RectangleDrawing[] = [];

  // Detect 3-bar Fair Value Gaps (Bullish & Bearish)
  for (let i = 2; i < slice.length; i++) {
    const bar0 = slice[i - 2];
    const bar2 = slice[i];

    // Bullish FVG: bar2.low > bar0.high
    if (bar2.low > bar0.high) {
      const gap = bar2.low - bar0.high;
      if (gap > (bar2.close * 0.001)) { // at least 0.1% gap
        boxes.push({
          id: `auto-fvg-bull-${i}`,
          type: 'rectangle',
          time1: Math.floor(bar0.timestamp / 1000),
          price1: bar2.low,
          time2: Math.floor(bar2.timestamp / 1000) + 7200, // extend 2 hours forward
          price2: bar0.high,
          color: '#059669',
          fillColor: 'rgba(5, 150, 105, 0.12)',
          label: 'BULLISH FVG',
        });
      }
    }

    // Bearish FVG: bar2.high < bar0.low
    if (bar2.high < bar0.low) {
      const gap = bar0.low - bar2.high;
      if (gap > (bar2.close * 0.001)) {
        boxes.push({
          id: `auto-fvg-bear-${i}`,
          type: 'rectangle',
          time1: Math.floor(bar0.timestamp / 1000),
          price1: bar0.low,
          time2: Math.floor(bar2.timestamp / 1000) + 7200,
          price2: bar2.high,
          color: '#E11D48',
          fillColor: 'rgba(225, 29, 72, 0.12)',
          label: 'BEARISH FVG',
        });
      }
    }
  }

  // Keep most recent 6 zones to maintain clean readability
  return boxes.slice(-6);
}
